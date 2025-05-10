const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const port = 3000;

app.use(cors());
app.use(express.json())



app.use((err, req, res, next) => {
  if (err.message === 'Unexpected end of JSON input' || err.message === 'Empty JSON body') {
    return res.status(400).json({ error: 'Invalid or empty JSON in request body' });
  }
  next(err);
});

mongoose.connect('mongodb+srv://Vaccination123:Vaccination123@cluster0.bmd8fel.mongodb.net/')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api', require('./routesAndControllers'));

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
