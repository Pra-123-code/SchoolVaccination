
const mongoose = require('mongoose');

const VaccinationRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  drive: { type: mongoose.Schema.Types.ObjectId, ref: 'VaccinationDrive', required: true },
  status: { type: String, enum: ['Vaccinated', 'Pending'], default: 'Pending' },
  vaccinatedOn: { type: Date }
});

module.exports = mongoose.model('VaccinationRecord', VaccinationRecordSchema);
