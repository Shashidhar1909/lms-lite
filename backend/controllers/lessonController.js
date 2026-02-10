const asyncHandler = require('express-async-handler');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get lessons for a course
// @route   GET /api/lessons/:courseId
// @access  Private
const getLessons = asyncHandler(async (req, res) => {
    const lessons = await Lesson.find({ courseId: req.params.courseId }).sort('order');
    res.json(lessons);
});

// @desc    Add a lesson
// @route   POST /api/lessons
// @access  Private/Instructor/Admin
const addLesson = asyncHandler(async (req, res) => {
    const { courseId, title, contentType, contentUrl, order, questions, passingScore } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Authorization check
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to add lessons to this course');
    }

    const lesson = await Lesson.create({
        courseId,
        title,
        contentType,
        contentUrl,
        order,
        questions: contentType === 'exam' ? questions : [],
        passingScore: contentType === 'exam' ? passingScore : 0
    });

    res.status(201).json(lesson);
});

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private/Instructor/Admin
const updateLesson = asyncHandler(async (req, res) => {
    const lesson = await Lesson.findById(req.params.id);

    if (lesson) {
        const course = await Course.findById(lesson.courseId);
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this lesson');
        }

        lesson.title = req.body.title || lesson.title;
        lesson.contentType = req.body.contentType || lesson.contentType;
        lesson.contentUrl = req.body.contentUrl || lesson.contentUrl;
        lesson.order = req.body.order || lesson.order;
        if (lesson.contentType === 'exam') {
            lesson.questions = req.body.questions || lesson.questions;
            lesson.passingScore = req.body.passingScore >= 0 ? req.body.passingScore : lesson.passingScore;
        }

        const updatedLesson = await lesson.save();
        res.json(updatedLesson);
    } else {
        res.status(404);
        throw new Error('Lesson not found');
    }
});

// @desc    Submit exam and get results
// @route   POST /api/lessons/:id/submit-exam
// @access  Private
const submitExam = asyncHandler(async (req, res) => {
    const { answers } = req.body; // { questionId_index: answerIndex } or array of answers [0, 2, 1...]
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson || lesson.contentType !== 'exam') {
        res.status(404);
        throw new Error('Exam not found');
    }

    // Calculate score
    let score = 0;
    // Assuming answers is an array matching questions order
    lesson.questions.forEach((q, index) => {
        if (answers && answers[index] === q.correctAnswer) {
            score++;
        }
    });

    const passed = score >= lesson.passingScore;

    if (passed) {
        // Update enrollment
        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: lesson.courseId,
        });

        if (enrollment) {
            if (!enrollment.completedLessons.includes(lesson._id)) {
                enrollment.completedLessons.push(lesson._id);

                // Recalculate progress percentage
                const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
                enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;

                if (enrollment.progress >= 100 || passed) {
                    enrollment.certificateEarned = true;
                    enrollment.completedDate = Date.now();
                }

                await enrollment.save();
            }
        }
    }

    res.json({
        score,
        totalQuestions: lesson.questions.length,
        passed,
        passingScore: lesson.passingScore,
        certificateEarned: passed
    });
});

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Instructor/Admin
const deleteLesson = asyncHandler(async (req, res) => {
    const lesson = await Lesson.findById(req.params.id);

    if (lesson) {
        const course = await Course.findById(lesson.courseId);
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this lesson');
        }

        await lesson.deleteOne();
        res.json({ message: 'Lesson removed' });
    } else {
        res.status(404);
        throw new Error('Lesson not found');
    }
});

module.exports = { getLessons, addLesson, updateLesson, deleteLesson, submitExam };
