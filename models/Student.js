const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['speech', 'ocr', 'level-based', 'numeracy']
  },
  transcript: String,
  ocrResult: String,
  expectedAnswer: String,
  accuracy: Number,
  date: {
    type: Date,
    default: Date.now
  },
  // Level-based assessment fields
  currentLevel: Number,
  levelName: String,
  levelNumber: Number,
  progress: {
    story: { completed: Boolean, accuracy: Number },
    poem: { completed: Boolean, accuracy: Number },
    sentence: { completed: Boolean, accuracy: Number },
    words: { completed: Boolean, accuracy: Number },
    letter: { completed: Boolean, accuracy: Number }
  },
  // Numeracy assessment fields
  category: String,
  level: Number,
  score: Number,
  numeracyProgress: {
    numberRecognition: { completed: Boolean, accuracy: Number },
    basicOperations: { completed: Boolean, accuracy: Number },
    patterns: { completed: Boolean, accuracy: Number },
    placeValue: { completed: Boolean, accuracy: Number },
    money: { completed: Boolean, accuracy: Number },
    time: { completed: Boolean, accuracy: Number },
    fractions: { completed: Boolean, accuracy: Number },
    geometry: { completed: Boolean, accuracy: Number },
    data: { completed: Boolean, accuracy: Number },
    problemSolving: { completed: Boolean, accuracy: Number }
  }
});

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  assessments: [AssessmentSchema],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema); 