require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs'); // To ensure uploads folder exists

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Incident Schema (aligned with frontend)
const incidentSchema = new mongoose.Schema({
  message: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  fileUrls: [{ type: String }]  // Array for multiple files
});

const Incident = mongoose.model('Incident', incidentSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));  // Serve frontend files
app.use('/uploads', express.static('uploads'));  // Serve uploaded files

// Multer setup for multiple file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination: uploads/');
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    console.log('Multer generating filename:', uniqueName);
    cb(null, uniqueName);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    console.log('File mimetype:', file.mimetype);
    const allowed = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'video/ogg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, MP4, WEBM, OGG allowed.'));
    }
  }
});

// Route for form submission (handle multiple files)
app.post('/submit-incident', upload.array('files', 5), async (req, res) => {  // Up to 5 files
  console.log('Form received:', req.body);
  console.log('Files received:', req.files);
  try {
    const { message, isAnonymous } = req.body;
    const anonymous = isAnonymous === 'on';  // Convert to boolean
    const fileUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newIncident = new Incident({
      message,
      isAnonymous: anonymous,
      fileUrls
    });

    await newIncident.save();
    res.status(200).send('Incident reported successfully!');
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).send('Error reporting incident: ' + err.message);
  }
});

// Route to fetch reports (matched to frontend)
app.get('/reports', async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json(incidents);
  } catch (err) {
    res.status(500).send('Error fetching incidents');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});