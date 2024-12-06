const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

// Get all custom subjects for a user
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user.userId });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// Create a new custom subject
router.post('/', auth, async (req, res) => {
  try {
    const { name, icon } = req.body;
    
    // Check if subject already exists for this user
    const existingSubject = await Subject.findOne({ 
      userId: req.user.userId,
      name: name 
    });
    
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject already exists' });
    }
    
    const subject = new Subject({
      userId: req.user.userId,
      name,
      icon
    });
    
    const savedSubject = await subject.save();
    res.status(201).json(savedSubject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subject' });
  }
});

// Delete a custom subject
router.delete('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    await subject.remove();
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subject' });
  }
});

module.exports = router;
