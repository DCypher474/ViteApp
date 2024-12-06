const express = require('express');
const router = express.Router();
const StudySession = require('../models/StudySession');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

// Get study statistics
router.get('/study-stats', auth, async (req, res) => {
    try {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get total study hours for the last week
        const weeklyStudySessions = await StudySession.find({
            userId: req.user.id,
            startTime: { $gte: lastWeek }
        });

        const totalStudyHours = weeklyStudySessions.reduce((total, session) => 
            total + (session.duration / 60), 0);

        // Get study sessions grouped by subject
        const subjectStats = await StudySession.aggregate([
            { $match: { userId: req.user.id } },
            { $group: {
                _id: '$subject',
                totalHours: { $sum: { $divide: ['$duration', 60] } },
                count: { $sum: 1 }
            }}
        ]);

        // Get goal completion rate
        const goals = await Goal.find({ userId: req.user.id });
        const completedGoals = goals.filter(goal => goal.completed).length;
        const goalCompletionRate = goals.length > 0 
            ? (completedGoals / goals.length) * 100 
            : 0;

        res.json({
            totalStudyHours,
            subjectStats,
            goalCompletionRate,
            totalSessions: weeklyStudySessions.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get daily study progress
router.get('/daily-progress', auth, async (req, res) => {
    try {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailyProgress = await StudySession.aggregate([
            {
                $match: {
                    userId: req.user.id,
                    startTime: { $gte: lastWeek }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
                    totalHours: { $sum: { $divide: ['$duration', 60] } },
                    sessions: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(dailyProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
