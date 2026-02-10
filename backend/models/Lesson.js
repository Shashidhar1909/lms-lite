const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
        title: {
            type: String,
            required: true,
        },
        contentType: {
            type: String,
            enum: ['video', 'pdf', 'text', 'exam'],
            required: true,
        },
        contentUrl: {
            type: String,
            required: false, // Not required for exam
        },
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number, // Index of correct option
        }],
        passingScore: {
            type: Number,
            default: 0
        },
        order: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;
