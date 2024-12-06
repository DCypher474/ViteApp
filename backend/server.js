const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

// Import routes
const authRoutes = require('./routes/auth');
const studyRoutes = require('./routes/study');
const goalsRoutes = require('./routes/goals');
const remindersRoutes = require('./routes/reminders');
const analyticsRoutes = require('./routes/analytics');
const subjectsRoutes = require('./routes/subjects');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Authorization']
}));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {index: false}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
    console.log('Database connection string:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//[HIDDEN_CREDENTIALS]@'));
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Connection string used:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//[HIDDEN_CREDENTIALS]@'));
    process.exit(1);
});

// Add global error handler for unhandled promises
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
console.log('Token:', process.env.TOKEN);
