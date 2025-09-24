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
// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination: uploads/'); // Log destination
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    console.log('Multer generating filename:', uniqueName); // Log filename
    cb(null, uniqueName);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    console.log('File mimetype:', file.mimetype); // Log file type
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed.'));
    }
  }
});

// Route for form submission
app.post('/submit-incident', upload.single('file'), async (req, res) => {
  console.log('Form received:', req.body); // Log form data
  console.log('File received:', req.file); // Log file details or null
  try {
    const { description, isUrgent } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    console.log('Saving with filePath:', filePath); // Log path to MongoDB

    const newIncident = new Incident({
      description,
      isUrgent: isUrgent === 'on',
      filePath
    });

    await newIncident.save();
    res.status(200).send('Incident reported successfully!');
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).send('Error reporting incident: ' + err.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/incidents', async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json(incidents);
  } catch (err) {
    res.status(500).send('Error fetching incidents');
  }
});