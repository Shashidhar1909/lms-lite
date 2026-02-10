const mongoose = require('mongoose');

const enrollmentSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
        completedLessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lesson',
            },
        ],
        progress: {
            type: Number,
            default: 0,
        },
        certificateEarned: {
            type: Boolean,
            default: false,
        },
        completedDate: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
