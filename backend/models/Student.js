
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  className: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  vaccinated: [
    {
      vaccineName: { type: String },
      date: { type: Date }
    }
  ]
});

module.exports = mongoose.model('Student', StudentSchema);
