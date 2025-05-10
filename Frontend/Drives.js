import React, { useState, useEffect } from 'react';
import {
  Container, Form, Button, Table, Row, Col
} from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axios from 'axios';

const Drives = () => {
  // --- State ---
  const [driveDetails, setDriveDetails] = useState({
    driveName: '', date: '', vaccineType: '', targetClasses: '', notes: ''
  });
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ date: '', slots: '' });

  const [vaccinationDetails, setVaccinationDetails] = useState([]);
  const [filterVaccine, setFilterVaccine] = useState('');
  const [reportData, setReportData] = useState([]);

  // --- Fetch on mount ---
  useEffect(() => {
    axios.get('/api/drives').then(r => setUpcomingDrives(r.data)).catch(console.error);
    axios.get('/api/records').then(r => setVaccinationDetails(r.data)).catch(console.error);
  }, []);

  // --- Create Drive ---
  const handleCreateDrive = () => {
    const newDrive = {
      ...driveDetails,
      targetClasses: driveDetails.targetClasses.split(',').map(s => s.trim())
    };
    axios.post('/api/drives', newDrive)
      .then(r => {
        setUpcomingDrives(ds => [...ds, r.data.drive]);
        setDriveDetails({ driveName: '', date: '', vaccineType: '', targetClasses: '', notes: '' });
      })
      .catch(e => alert('Failed: ' + e.message));
  };

  // --- Inline Editing ---
  const isPast = dateStr => new Date(dateStr) < new Date();

  const startEdit = d => {
    setEditingId(d._id);
    setEditValues({ date: d.date.slice(0,10), slots: d.slots ?? '' });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ date: '', slots: '' });
  };
  const saveEdit = id => {
    axios.put(`/api/drives/${id}`, editValues)
      .then(r => {
        setUpcomingDrives(ds => ds.map(d => d._id===id? r.data.drive : d));
        cancelEdit();
      })
      .catch(() => alert('Save failed'));
  };

  // --- Report & Exports ---
  const handleGenerateReport = () => {
    const filt = filterVaccine.trim().toLowerCase();
    const filtered = vaccinationDetails.filter(i =>
      i.vaccineName?.toLowerCase().includes(filt)
    );
    setReportData(filtered);

    // build rows
    const rows = filtered.map(i => ({
      'Student Name': i.studentName,
      'Vaccinated Status': i.vaccinatedStatus,
      'Date of Vaccination': i.dateOfVaccination
        ? new Date(i.dateOfVaccination).toLocaleDateString()
        : '-',
      'Vaccine Name': i.vaccineName || '-'
    }));

    // Excel
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'vaccination_report.xlsx');

    // CSV
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vaccination_report.csv'; a.click();
    URL.revokeObjectURL(url);

    // PDF
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Student', 'Status', 'Date', 'Vaccine']],
      body: rows.map(r => [r['Student Name'], r['Vaccinated Status'], r['Date of Vaccination'], r['Vaccine Name']])
    });
    doc.save('vaccination_report.pdf');
  };

  return (
    <Container className="mt-5">
      {/* Create Drive */}
      <h2>Book Vaccination Drive</h2>
      <Form className="mb-4">
        <Row>
          <Col md={3}>
            <Form.Control
              placeholder="Drive Name"
              name="driveName"
              value={driveDetails.driveName}
              onChange={e => setDriveDetails(d => ({ ...d, driveName: e.target.value }))}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              type="date"
              name="date"
              value={driveDetails.date}
              onChange={e => setDriveDetails(d => ({ ...d, date: e.target.value }))}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              placeholder="Vaccine Type"
              name="vaccineType"
              value={driveDetails.vaccineType}
              onChange={e => setDriveDetails(d => ({ ...d, vaccineType: e.target.value }))}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              placeholder="Target Classes"
              name="targetClasses"
              value={driveDetails.targetClasses}
              onChange={e => setDriveDetails(d => ({ ...d, targetClasses: e.target.value }))}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              placeholder="Notes"
              name="notes"
              value={driveDetails.notes}
              onChange={e => setDriveDetails(d => ({ ...d, notes: e.target.value }))}
            />
          </Col>
        </Row>
        <Button className="mt-2" onClick={handleCreateDrive}>Create Drive</Button>
      </Form>

      {/* Generate Report */}
      <h2>Generate Vaccination Report</h2>
      <Form className="mb-3">
        <Row className="align-items-center">
          <Col md={4}>
            <Form.Control
              placeholder="Filter by Vaccine Name"
              value={filterVaccine}
              onChange={e => setFilterVaccine(e.target.value)}
            />
          </Col>
          <Col>
            <Button onClick={handleGenerateReport}>Generate & Export</Button>
          </Col>
        </Row>
      </Form>

      {/* Report Table */}
      {reportData.length > 0 && (
        <Table striped bordered hover responsive className="mb-5">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Vaccinated Status</th>
              <th>Date of Vaccination</th>
              <th>Vaccine Name</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((i, idx) => (
              <tr key={idx}>
                <td>{i.studentName}</td>
                <td>{i.vaccinatedStatus}</td>
                <td>
                  {i.dateOfVaccination
                    ? new Date(i.dateOfVaccination).toLocaleDateString()
                    : '-'}
                </td>
                <td>{i.vaccineName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Upcoming Drives Table */}
      <h2>Upcoming Vaccination Drives</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Drive Name</th>
            <th>Date</th>
            <th>Vaccine Type</th>
            <th>Slots</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {upcomingDrives.map(d => (
            <tr key={d._id}>
              <td>{d.driveName}</td>
              <td>
                {editingId === d._id
                  ? <Form.Control
                      type="date"
                      value={editValues.date}
                      onChange={e => setEditValues(v => ({ ...v, date: e.target.value }))}
                    />
                  : new Date(d.date).toLocaleDateString()
                }
              </td>
              <td>{d.vaccineType}</td>
              <td>
                {editingId === d._id
                  ? <Form.Control
                      type="number"
                      value={editValues.slots}
                      onChange={e => setEditValues(v => ({ ...v, slots: e.target.value }))}
                    />
                  : d.slots ?? '-'
                }
              </td>
              <td>
                {editingId === d._id
                  ? <>
                      <Button size="sm" variant="success" onClick={() => saveEdit(d._id)} className="me-2">
                        Save
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </>
                  : <Button
                      size="sm"
                      onClick={() => startEdit(d)}
                      disabled={isPast(d.date)}
                    >
                      Edit
                    </Button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Drives;
