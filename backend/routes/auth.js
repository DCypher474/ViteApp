const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/user', auth, async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const user = req.user;
        res.json({
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error while fetching user data' });
    }
});

module.exports = router;
