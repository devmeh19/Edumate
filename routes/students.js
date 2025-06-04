const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Class = require('../models/Class');
const auth = require('../middleware/auth');

// Get all students in a class
router.get('/class/:classId', auth, async (req, res) => {
  try {
    const students = await Student.find({ class: req.params.classId });
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new student
router.post('/', auth, async (req, res) => {
  try {
    const { name, classId } = req.body;

    // Check if class exists and belongs to teacher
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    if (classData.teacher.toString() !== req.session.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const newStudent = new Student({
      name,
      class: classId
    });

    const student = await newStudent.save();
    
    // Add student to class
    classData.students.push(student._id);
    await classData.save();

    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get student details with assessments
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class');
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if teacher owns the class
    const classData = await Class.findById(student.class);
    if (classData.teacher.toString() !== req.session.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update student details
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if teacher owns the class
    const classData = await Class.findById(student.class);
    if (classData.teacher.toString() !== req.session.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    student = await Student.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a student
router.delete('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Check if teacher owns the class
    const classData = await Class.findById(student.class);
    if (classData.teacher.toString() !== req.session.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Remove student from class
    classData.students = classData.students.filter(
      s => s.toString() !== student._id.toString()
    );
    await classData.save();

    await student.remove();
    res.json({ msg: 'Student removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 