const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'instructor', 'student'],
            default: 'student',
        },
        avatar: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            default: ''
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
        isRoot: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

// Method to check password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password pre-save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
