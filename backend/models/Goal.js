const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    targetHours: {
        type: Number,
        required: true
    },
    deadline: Date,
    completed: {
        type: Boolean,
        default: false
    },
    progress: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
