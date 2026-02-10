const mongoose = require('mongoose');

const courseSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
            default: '',
        },
        category: {
            type: String,
            required: true,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        adminApproved: {
            type: Boolean,
            default: false,
        },
        thumbnail: {
            type: String,
            required: false,
        },
        liveClassLink: {
            type: String,
            required: false,
        },
        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        duration: {
            type: String,
            default: '0h 0m',
        },
        tags: [String],
        level: {
            type: String,
            default: 'Beginner'
        }
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
