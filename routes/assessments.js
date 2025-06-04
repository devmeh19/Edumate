const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const speech = require('@google-cloud/speech');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// OCR Assessment
router.post('/ocr/:studentId', auth, upload.single('image'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Process image with Tesseract.js
    const result = await Tesseract.recognize(
      req.file.buffer,
      'eng',
      { logger: m => console.log(m) }
    );

    // Calculate accuracy (this is a simple example - you might want to implement more sophisticated accuracy calculation)
    const accuracy = result.data.confidence;

    // Add assessment to student record
    student.assessments.push({
      type: 'ocr',
      result: result.data.text,
      accuracy: accuracy
    });

    await student.save();

    res.json({
      text: result.data.text,
      accuracy: accuracy
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Speech-to-Text Assessment
router.post('/speech/:studentId', auth, upload.single('audio'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Initialize Google Cloud Speech client
    const speechClient = new speech.SpeechClient();

    // Configure request
    const audio = {
      content: req.file.buffer.toString('base64')
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };
    const request = {
      audio: audio,
      config: config,
    };

    // Perform speech recognition
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // Calculate accuracy (this is a simple example - you might want to implement more sophisticated accuracy calculation)
    const accuracy = response.results[0].alternatives[0].confidence;

    // Add assessment to student record
    student.assessments.push({
      type: 'speech',
      result: transcription,
      accuracy: accuracy
    });

    await student.save();

    res.json({
      text: transcription,
      accuracy: accuracy
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get student's assessment history
router.get('/:studentId', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    res.json(student.assessments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 