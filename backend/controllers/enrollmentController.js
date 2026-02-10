const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private/Student
const enrollCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    const alreadyEnrolled = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
    });

    if (alreadyEnrolled) {
        res.status(400);
        throw new Error('Already enrolled');
    }

    const enrollment = await Enrollment.create({
        student: req.user._id,
        course: courseId,
    });

    res.status(201).json(enrollment);
});

// @desc    Get my enrolled courses
// @route   GET /api/enrollments/my-courses
// @access  Private/Student
const getMyEnrollments = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
    res.json(enrollments);
});

// @desc    Update progress (mark lesson as complete)
// @route   PUT /api/enrollments/progress
// @access  Private/Student
const updateProgress = asyncHandler(async (req, res) => {
    const { courseId, lessonId } = req.body;

    const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
    });

    if (enrollment) {
        if (!enrollment.completedLessons.includes(lessonId)) {
            enrollment.completedLessons.push(lessonId);

            // Recalculate progress percentage
            const totalLessons = await Lesson.countDocuments({ courseId });
            enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;

            await enrollment.save();
        }
        res.json(enrollment);
    } else {
        res.status(404);
        throw new Error('Enrollment not found');
    }
});

// @desc    Check enrollment status
// @route   GET /api/enrollments/check/:courseId
// @access  Private
const checkEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: req.params.courseId
    });

    if (enrollment) {
        res.json({ isEnrolled: true, progress: enrollment.progress, completedLessons: enrollment.completedLessons });
    } else {
        res.json({ isEnrolled: false });
    }
})

const getInstructorStudents = asyncHandler(async (req, res) => {
    const instructorId = req.user._id;

    // 1. Find all courses by this instructor
    const courses = await Course.find({ instructor: instructorId }).select('_id title');
    const courseIds = courses.map(c => c._id);

    // 2. Find all enrollments for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
        .populate('student', 'name email avatar')
        .populate('course', 'title');

    res.json(enrollments);
});

// @desc    Get all enrollments (Admin)
// @route   GET /api/enrollments
// @access  Private/Admin
const getAllEnrollments = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({})
        .populate('student', 'name email')
        .populate('course', 'title')
        .sort({ createdAt: -1 });
    console.log(`Fetched ${enrollments.length} enrollments for admin.`);
    res.json(enrollments);
});

module.exports = { enrollCourse, getMyEnrollments, updateProgress, checkEnrollment, getInstructorStudents, getAllEnrollments };
