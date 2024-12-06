const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');

// Get all reminders for a user
router.get('/', auth, async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.user.id });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new reminder
router.post('/', auth, async (req, res) => {
    const reminder = new Reminder({
        userId: req.user.id,
        ...req.body
    });

    try {
        const newReminder = await reminder.save();
        res.status(201).json(newReminder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a reminder
router.patch('/:id', auth, async (req, res) => {
    try {
        const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
        if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
        
        Object.assign(reminder, req.body);
        const updatedReminder = await reminder.save();
        res.json(updatedReminder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a reminder
router.delete('/:id', auth, async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
        res.json({ message: 'Reminder deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
