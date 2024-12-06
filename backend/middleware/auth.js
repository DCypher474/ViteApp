const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided in request headers');
            return res.status(401).json({ message: 'No authentication token, authorization denied' });
        }

        try {
            console.log('Attempting to verify token...');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified successfully. User ID:', decoded.userId);
            
            // Find user by ID
            const user = await User.findById(decoded.userId);
            if (!user) {
                console.log('User not found for ID:', decoded.userId);
                return res.status(401).json({ message: 'User not found' });
            }
            
            // Set user data in request
            req.user = {
                userId: user._id.toString(), // Convert ObjectId to string
                email: user.email,
                fullName: user.fullName
            };
            req.token = token;
            console.log('Auth middleware successful for user:', user.email);
            next();
        } catch (e) {
            console.error('Token verification failed:', e);
            res.status(401).json({ message: 'Token is not valid' });
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = auth;
