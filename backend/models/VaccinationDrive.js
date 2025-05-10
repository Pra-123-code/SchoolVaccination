

const mongoose = require('mongoose');

const VaccinationDriveSchema = new mongoose.Schema({
  driveName: { type: String, required: true },
  date: { type: Date, required: true },
  vaccineType: { type: String, required: true },
  targetClasses: [{ type: String }],
  notes: { type: String }
});

module.exports = mongoose.model('VaccinationDrive', VaccinationDriveSchema);
