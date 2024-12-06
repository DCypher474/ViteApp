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

// Create model after dropping any existing username index
const User = mongoose.model('User', userSchema);

// Ensure indexes are properly set up
(async () => {
    try {
        // Drop any existing username index
        await User.collection.dropIndex('username_1').catch(() => {
            // Index might not exist, which is fine
            console.log('No username index found or already dropped');
        });

        // Create only the indexes we need
        await User.createIndexes();
    } catch (error) {
        console.error('Error managing indexes:', error);
    }
})();

module.exports = User;
