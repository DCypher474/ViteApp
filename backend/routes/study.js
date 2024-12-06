const express = require('express');
const router = express.Router();
const StudySession = require('../models/StudySession');
const auth = require('../middleware/auth');

// Get all study sessions for a user
router.get('/', auth, async (req, res) => {
    try {
        const sessions = await StudySession.find({ userId: req.user.userId })
            .sort({ startTime: -1 });
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching study sessions:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new study session
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating study session. User ID:', req.user.userId);
        console.log('Request body:', req.body);

        // Validate required fields
        const { subject, duration, startTime, notes } = req.body;
        
        if (!subject || !duration || !startTime) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: { subject: true, duration: true, startTime: true },
                received: { subject, duration, startTime }
            });
        }

        // Calculate end time
        const start = new Date(startTime);
        const end = new Date(start.getTime() + (duration * 60000));

        const session = new StudySession({
            userId: req.user.userId,
            subject,
            duration: parseInt(duration),
            startTime: start,
            endTime: end,
            notes: notes || '',
            status: 'pending',
            progress: 0
        });

        console.log('Attempting to save session:', session);
        const newSession = await session.save();
        console.log('Successfully created session:', newSession);

        res.status(201).json(newSession);
    } catch (error) {
        console.error('Error creating study session:', error);
        res.status(400).json({ 
            message: 'Error creating study session',
            error: error.message
        });
    }
});

// Update a study session
router.patch('/:id', auth, async (req, res) => {
    try {
        const session = await StudySession.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        
        Object.assign(session, req.body);
        const updatedSession = await session.save();
        res.json(updatedSession);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a study session
router.delete('/:id', auth, async (req, res) => {
    try {
        console.log('Delete request for session:', req.params.id);
        console.log('User ID:', req.user.userId);
        
        const session = await StudySession.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.userId 
        });
        
        console.log('Found session:', session);
        
        if (!session) {
            console.log('Session not found');
            return res.status(404).json({ message: 'Session not found' });
        }
        
        res.json({ message: 'Session deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
