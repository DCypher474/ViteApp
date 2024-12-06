const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Remove any existing indexes
userSchema.indexes().forEach(async ([name, index]) => {
    try {
        await mongoose.model('User').collection.dropIndex(name);
    } catch (error) {
        // Index might not exist, ignore error
    }
});

// Create only the indexes we need
userSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Add password validation
userSchema.path('password').validate(function(password) {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
}, 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers');

// Add email validation
userSchema.path('email').validate(async function(email) {
    const count = await this.constructor.countDocuments({ email });
    return !count;
}, 'Email already exists');

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
