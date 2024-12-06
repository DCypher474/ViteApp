const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const auth = require('../middleware/auth');

// Get daily goals
router.get('/daily', auth, async (req, res) => {
    try {
        const date = new Date(req.query.date);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        // Get tasks created today
        const tasksForDay = await Task.find({
            userId: req.user.id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Get completed tasks for today
        const completedTasksForDay = await Task.find({
            userId: req.user.id,
            completedAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Get study sessions for today that are at least 25 minutes
        const studySessionsForDay = await StudySession.find({
            userId: req.user.id,
            startTime: { $gte: startOfDay, $lte: endOfDay },
            duration: { $gte: 25 * 60 } // 25 minutes in seconds
        });

        // Update goal completion status
        const goalsCompleted = {
            addTask: tasksForDay.length > 0, // Mark as complete if at least one task was added today
            completeTask: completedTasksForDay.length > 0,
            completeStudySession: studySessionsForDay.length > 0
        };

        // Save the updated goal status
        await Goal.findOneAndUpdate(
            {
                userId: req.user.id,
                date: startOfDay
            },
            {
                $set: {
                    tasksAdded: tasksForDay.length,
                    tasksCompleted: completedTasksForDay.length,
                    studySessionsCompleted: studySessionsForDay.length,
                    'goalsCompleted.addTask': goalsCompleted.addTask,
                    'goalsCompleted.completeTask': goalsCompleted.completeTask,
                    'goalsCompleted.completeStudySession': goalsCompleted.completeStudySession
                }
            },
            { upsert: true }
        );

        res.json({
            tasksAdded: tasksForDay.length,
            tasksCompleted: completedTasksForDay.length,
            studySessionsCompleted: studySessionsForDay.length,
            goalsCompleted
        });
    } catch (error) {
        console.error('Error in /daily:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get weekly goals
router.get('/weekly', auth, async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        // Get study sessions for the week
        const studySessions = await StudySession.find({
            userId: req.user.id,
            startTime: { $gte: startDate, $lt: endDate }
        });

        // Calculate total study hours
        const totalStudyHours = studySessions.reduce((total, session) => {
            return total + (session.duration / 3600); // Convert seconds to hours
        }, 0);

        // Get unique subjects studied
        const uniqueSubjects = new Set(studySessions.map(session => session.subject)).size;

        // Get days with study activity
        const studyDays = new Set(
            studySessions.map(session => 
                new Date(session.startTime).toDateString()
            )
        ).size;

        res.json({
            totalStudyHours: Math.round(totalStudyHours * 10) / 10, // Round to 1 decimal
            uniqueSubjects,
            studyDays,
            goalsCompleted: {
                studyHours: totalStudyHours >= 10,
                uniqueSubjects: uniqueSubjects >= 3,
                activeDays: studyDays >= 5
            }
        });
    } catch (error) {
        console.error('Error in /weekly:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all goals for a user
router.get('/', auth, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new goal
router.post('/', auth, async (req, res) => {
    const goal = new Goal({
        userId: req.user.id,
        ...req.body
    });

    try {
        const newGoal = await goal.save();
        res.status(201).json(newGoal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a goal
router.patch('/:id', auth, async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        
        Object.assign(goal, req.body);
        const updatedGoal = await goal.save();
        res.json(updatedGoal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a goal
router.delete('/:id', auth, async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update goal progress when a task is added
router.post('/track-task', auth, async (req, res) => {
    try {
        const { taskId } = req.body;
        const task = await Task.findById(taskId);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all tasks for today
        const todaysTasks = await Task.find({
            userId: req.user.userId,
            createdAt: {
                $gte: today,
                $lte: new Date()
            }
        });

        // Get completed tasks for today
        const completedTasks = await Task.find({
            userId: req.user.userId,
            completedAt: {
                $gte: today,
                $lte: new Date()
            }
        });

        // Check if this completes any goals
        const dailyGoals = {
            addTask: todaysTasks.length > 0, // Mark as complete if at least one task exists
            completeTask: completedTasks.length > 0,
        };

        // Update or create goal tracking record
        await Goal.findOneAndUpdate(
            {
                userId: req.user.userId,
                date: today
            },
            {
                $set: {
                    tasksAdded: todaysTasks.length,
                    tasksCompleted: completedTasks.length,
                    'goalsCompleted.addTask': dailyGoals.addTask,
                    'goalsCompleted.completeTask': dailyGoals.completeTask,
                }
            },
            { upsert: true }
        );

        res.json({
            message: 'Goal progress updated',
            goalsCompleted: dailyGoals,
            taskCount: todaysTasks.length,
            completedCount: completedTasks.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update goal progress when a study session is completed
router.post('/track-study-session', auth, async (req, res) => {
    try {
        const { sessionId, duration } = req.body;
        const session = await StudySession.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Study session not found' });
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all study sessions for today
        const todaysSessions = await StudySession.find({
            userId: req.user.userId,
            startTime: {
                $gte: today,
                $lte: new Date()
            }
        });

        // Check if this completes the study session goal
        const dailyGoals = {
            completeStudySession: todaysSessions.some(s => s.duration >= 25)
        };

        // Update or create goal tracking record
        await Goal.findOneAndUpdate(
            {
                userId: req.user.userId,
                date: today
            },
            {
                $set: {
                    'daily.completeStudySession': dailyGoals.completeStudySession
                }
            },
            { upsert: true }
        );

        res.json({
            message: 'Study session tracked',
            goalsCompleted: dailyGoals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
