const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');

// Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    // Get total students
    const totalStudents = await Student.countDocuments();

    // Get total assessments
    const totalAssessments = await Assessment.countDocuments();

    // Calculate average accuracy
    const assessments = await Assessment.find();
    const averageAccuracy = assessments.length > 0
      ? assessments.reduce((acc, curr) => acc + curr.accuracy, 0) / assessments.length
      : 0;

    res.json({
      totalStudents,
      totalAssessments,
      averageAccuracy: Math.round(averageAccuracy)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 