const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/Class');
const Student = require('../models/Student');

// Get all classes
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.session.user.id })
      .populate('students', 'name');
    res.json(classes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a class
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const newClass = new Class({
      name,
      teacher: req.session.user.id
    });

    const classDoc = await newClass.save();
    res.json(classDoc);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get class by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const classDoc = await Class.findOne({
      _id: req.params.id,
      teacher: req.session.user.id
    }).populate('students', 'name');

    if (!classDoc) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    res.json(classDoc);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Class not found' });
    }
    res.status(500).send('Server error');
  }
});

// Add student to class
router.post('/:id/students', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const classDoc = await Class.findOne({
      _id: req.params.id,
      teacher: req.session.user.id
    });

    if (!classDoc) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    const newStudent = new Student({
      name,
      class: classDoc._id
    });

    const student = await newStudent.save();
    classDoc.students.push(student._id);
    await classDoc.save();

    const updatedClass = await Class.findById(classDoc._id).populate('students', 'name');
    res.json(updatedClass);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Remove student from class
router.delete('/:id/students/:studentId', auth, async (req, res) => {
  try {
    const classDoc = await Class.findOne({
      _id: req.params.id,
      teacher: req.session.user.id
    });

    if (!classDoc) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    classDoc.students = classDoc.students.filter(
      studentId => studentId.toString() !== req.params.studentId
    );
    await classDoc.save();
    await student.remove();

    const updatedClass = await Class.findById(classDoc._id).populate('students', 'name');
    res.json(updatedClass);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Save student assessment
router.post('/:classId/students/:studentId/assessments', async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const assessmentData = req.body;

    // Validate required fields
    if (!assessmentData.type || !assessmentData.expectedAnswer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const student = await Student.findOne({ _id: studentId, class: classId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const assessment = {
      type: assessmentData.type,
      expectedAnswer: assessmentData.expectedAnswer,
      accuracy: assessmentData.accuracy,
      date: new Date()
    };

    // Add type-specific data
    if (assessmentData.type === 'speech' || assessmentData.type === 'level-based') {
      assessment.transcript = assessmentData.transcript;
    } else if (assessmentData.type === 'ocr') {
      assessment.ocrResult = assessmentData.ocrResult;
    }

    // Handle level-based assessment
    if (assessmentData.type === 'level-based') {
      if (!assessmentData.currentLevel || !assessmentData.progress) {
        return res.status(400).json({ message: 'Missing level-based assessment data' });
      }
      assessment.currentLevel = assessmentData.currentLevel;
      assessment.levelName = assessmentData.levelName;
      assessment.levelNumber = assessmentData.levelNumber;
      assessment.progress = {
        story: assessmentData.progress.story || { completed: false, accuracy: 0 },
        poem: assessmentData.progress.poem || { completed: false, accuracy: 0 },
        sentence: assessmentData.progress.sentence || { completed: false, accuracy: 0 },
        words: assessmentData.progress.words || { completed: false, accuracy: 0 },
        letter: assessmentData.progress.letter || { completed: false, accuracy: 0 }
      };
    }

    // Handle numeracy assessment
    if (assessmentData.type === 'numeracy') {
      if (!assessmentData.category || !assessmentData.level || !assessmentData.score) {
        return res.status(400).json({ message: 'Missing numeracy assessment data' });
      }
      assessment.category = assessmentData.category;
      assessment.level = assessmentData.level;
      assessment.score = assessmentData.score;
      assessment.numeracyProgress = {
        numberRecognition: assessmentData.progress?.numberRecognition || { completed: false, accuracy: 0 },
        basicOperations: assessmentData.progress?.basicOperations || { completed: false, accuracy: 0 },
        patterns: assessmentData.progress?.patterns || { completed: false, accuracy: 0 },
        placeValue: assessmentData.progress?.placeValue || { completed: false, accuracy: 0 },
        money: assessmentData.progress?.money || { completed: false, accuracy: 0 },
        time: assessmentData.progress?.time || { completed: false, accuracy: 0 },
        fractions: assessmentData.progress?.fractions || { completed: false, accuracy: 0 },
        geometry: assessmentData.progress?.geometry || { completed: false, accuracy: 0 },
        data: assessmentData.progress?.data || { completed: false, accuracy: 0 },
        problemSolving: assessmentData.progress?.problemSolving || { completed: false, accuracy: 0 }
      };
    }

    student.assessments.push(assessment);
    await student.save();

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Error saving assessment:', error);
    res.status(500).json({ message: 'Error saving assessment' });
  }
});

// Update a class
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    let classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    if (classData.teacher.toString() !== req.session.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    classData = await Class.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    res.json(classData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a class
router.delete('/:id', auth, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    if (classData.teacher.toString() !== req.session.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await classData.remove();
    res.json({ msg: 'Class removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 