const express = require('express');
const router = express.Router();
const Student = require('./models/Student');
const VaccinationDrive = require('./models/VaccinationDrive');
const VaccinationRecord = require('./models/VaccinationRecord');

/////////////////////
// STUDENT ROUTES //
/////////////////////

// Create a new student
router.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: 'Student created', student });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student updated', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/////////////////////////////
// VACCINATION DRIVE ROUTES //
/////////////////////////////

// Create a vaccination drive
router.post('/drives', async (req, res) => {
  try {
    const drive = new VaccinationDrive(req.body);
    await drive.save();
    res.status(201).json({ message: 'Drive created', drive });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all drives
router.get('/drives', async (req, res) => {
  try {
    const drives = await VaccinationDrive.find();
    res.json(drives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

///////////////////////////////////
// VACCINATION RECORD ROUTES //
///////////////////////////////////


router.post('/records', async (req, res) => {
  try {
    const { student, drive, status, vaccinatedOn } = req.body;
    let record = await VaccinationRecord.findOne({ student, drive });
    
    if (record) {
      record.status = status;
      record.vaccinatedOn = vaccinatedOn;
    } else {
      record = new VaccinationRecord({ student, drive, status, vaccinatedOn });
    }

    await record.save();
    res.status(201).json({ message: 'Vaccination record saved', record });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/records', async (req, res) => {
  try {
    const records = await VaccinationRecord.find()
      .populate('student')
      .populate('drive');
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const vaccinatedStudents = await Student.countDocuments({ vaccinated: { $gt: [] } });
    const upcomingDrives = await VaccinationDrive.find({ date: { $gte: new Date() } });
    res.json({
      totalStudents,
      vaccinatedStudents,
      upcomingDrives: upcomingDrives.length > 0 ? upcomingDrives : [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;