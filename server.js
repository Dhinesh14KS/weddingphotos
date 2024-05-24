const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure body-parser and multer for handling form data
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({ dest: 'uploads/' });

// Database to store photos
const photosDB = {};

// Route to handle photo uploads
app.post('/upload', upload.single('photo'), (req, res) => {
  const { email } = req.body;
  const photoPath = req.file.path;

  // Check if the email exists in the database
  if (!photosDB[email]) {
    photosDB[email] = [];
  }

  // Check the maximum photo limit per email
  if (photosDB[email].length >= 20) {
    return res.status(400).json({ error: 'Maximum photo limit reached for this email.' });
  }

  // Store the photo path in the database
  photosDB[email].push(photoPath);
  res.status(200).json({ message: 'Photo uploaded successfully.' });
});

// Route to handle photo deletions
app.post('/delete', (req, res) => {
  const { email, photoIndex } = req.body;

  // Check if the email exists in the database
  if (!photosDB[email]) {
    return res.status(404).json({ error: 'Email not found.' });
  }

  // Check if the photo index is valid
  if (photoIndex < 0 || photoIndex >= photosDB[email].length) {
    return res.status(400).json({ error: 'Invalid photo index.' });
  }

  // Delete the photo from the database and the file system
  const photoPath = photosDB[email][photoIndex];
  fs.unlinkSync(photoPath);
  photosDB[email].splice(photoIndex, 1);

  res.status(200).json({ message: 'Photo deleted successfully.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
