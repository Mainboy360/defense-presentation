
/*
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Incident Schema
const incidentSchema = new mongoose.Schema({
  description: { type: String, required: true },
  isUrgent: { type: Boolean, default: false },
  filePath: { type: String }  // Path to uploaded file
});

const Incident = mongoose.model('Incident', incidentSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));  // Serve frontend files
app.use('/uploads', express.static('uploads'));  // Serve uploaded files if needed

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  }
});
const upload = multer({ storage });

// Route for form submission
app.post('/submit-incident', upload.single('file'), async (req, res) => {
  try {
    const { description, isUrgent } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newIncident = new Incident({
      description,
      isUrgent: isUrgent === 'on',  // Checkbox sends 'on' if checked
      filePath
    });

    await newIncident.save();
    res.status(200).send('Incident reported successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reporting incident');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



document.getElementById('incidentForm').addEventListener('submit', async (e) => {
  e.preventDefault();  // Prevent default form submission

  const formData = new FormData();
  formData.append('description', document.getElementById('description').value);
  formData.append('isUrgent', document.getElementById('isUrgent').checked ? 'on' : 'off');
  formData.append('file', document.getElementById('file').files[0]);

  try {
    const response = await fetch('/submit-incident', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    document.getElementById('response').innerText = result;
  } catch (err) {
    console.error(err);
    document.getElementById('response').innerText = 'Error submitting form';
  }
});

document.getElementById('incidentForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];
  console.log('File selected:', file); // Log file details or undefined

  const formData = new FormData();
  formData.append('description', document.getElementById('description').value);
  formData.append('isUrgent', document.getElementById('isUrgent').checked ? 'on' : 'off');
  formData.append('file', file);
  console.log('Sending FormData...'); // Log before sending

  try {
    const response = await fetch('/submit-incident', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    console.log('Server response:', result); // Log response
    document.getElementById('response').innerText = result;
  } catch (err) {
    console.error('Fetch error:', err);
    document.getElementById('response').innerText = 'Error submitting form';
  }
});

*/

document.getElementById('incidentForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];
  console.log('File selected:', file); // Log file details or undefined

  const formData = new FormData();
  formData.append('description', document.getElementById('description').value);
  formData.append('isUrgent', document.getElementById('isUrgent').checked ? 'on' : 'off');
  formData.append('file', file);
  console.log('Sending FormData...'); // Log before sending

  try {
    const response = await fetch('/submit-incident', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    console.log('Server response:', result); // Log response
    document.getElementById('response').innerText = result;
  } catch (err) {
    console.error('Fetch error:', err);
    document.getElementById('response').innerText = 'Error submitting form';
  }
});

document.getElementById('response').innerText = result.includes('Error') ? result : 'Success: ' + result;