import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Row, Col, Form, Button, Table
} from 'react-bootstrap';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [newStudent, setNewStudent] = useState({
    name: '',
    className: '',
    rollNumber: '',
    vaccinated: [{ vaccineName: '', date: '' }],
  });
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/students');
         console.log('Fetched students:', response.data);
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleAddStudent = () => {
  const { vaccineName, date } = newStudent.vaccinated[0];
  if (!vaccineName.trim() || !date) {
    alert('Please enter both vaccine name and date.');
    return;
  }
  const alreadyDone = newStudent.vaccinated.slice(1).some(v =>
    v.vaccineName.trim().toLowerCase() === vaccineName.trim().toLowerCase() &&
    v.date === date
  );
  if (alreadyDone) {
    alert('Vaccination for this vaccine on this date is already recorded.');
    return;
  }
  console.log('Sending new student data:', newStudent);
  axios.post('http://localhost:3000/api/students', newStudent)
    .then((response) => {
      console.log('Student added successfully:', response.data);
      setStudents([...students, response.data.student]);
      setNewStudent({
        name: '',
        className: '',
        rollNumber: '',
        vaccinated: [{ vaccineName: '', date: '' }],
      });
    })
    .catch((error) => {
      console.error('Failed to add student:', error.response?.data || error.message);
    });
};

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.className.toLowerCase().includes(search.toLowerCase()) ||
    student.vaccinated.some(
      (v) =>
        v.vaccineName.toLowerCase().includes(search.toLowerCase()) ||
        v.date.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Manage Students</h2>

      {/* Search Input */}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by name, class, or vaccine info"
          value={search}
          onChange={handleSearchChange}
        />
      </Form.Group>

      {/* Add New Student Form */}
      <Row className="mb-3">
        <Col>
          <h5>Add New Student</h5>
          <Form>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                placeholder="Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                placeholder="Class"
                value={newStudent.className}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, className: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                placeholder="Roll Number"
                value={newStudent.rollNumber}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, rollNumber: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                placeholder="Vaccine Name"
                value={newStudent.vaccinated[0].vaccineName}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    vaccinated: [{
                      ...newStudent.vaccinated[0],
                      vaccineName: e.target.value,
                    }],
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="date"
                placeholder="Vaccination Date"
                value={newStudent.vaccinated[0].date}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    vaccinated: [{
                      ...newStudent.vaccinated[0],
                      date: e.target.value,
                    }],
                  })
                }
              />
            </Form.Group>
            <Button onClick={handleAddStudent} variant="primary" className="me-2">
              Add Student
            </Button>
          </Form>
        </Col>

        {/* CSV Upload */}
        <Col>
          <Form.Group>
            <Form.Label>Bulk Upload (CSV)</Form.Label>
            <Form.Control type="file" accept=".csv" onChange={handleFileUpload} />
          </Form.Group>
        </Col>
      </Row>

      {/* Student Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Roll Number</th>
            <th>Vaccination Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.className}</td>
              <td>{student.rollNumber}</td>
              <td>
                {student.vaccinated.map((v, index) => (
                  <div key={index}>
                    {v.vaccineName} ({v.date})
                  </div>
                ))}
              </td>
              <td>{/* Actions can be added here */}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Students;
