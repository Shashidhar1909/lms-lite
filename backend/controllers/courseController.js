const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');

// @desc    Get all published courses (Public/Student) or All courses (Admin)
// @route   GET /api/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.role === 'student') {
        query.isPublished = true;
    }
    // Instructors see only their courses, Admins see all
    if (req.user.role === 'instructor') {
        query.instructor = req.user._id;
    }

    const courses = await Course.find(query).populate('instructor', 'name email');
    res.json(courses);
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');

    if (course) {
        res.json(course);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
    const { title, description, category, instructorId, duration, thumbnail, level } = req.body;

    // If instructor creates a course, they are the instructor and it needs approval
    // If admin creates a course, they can assign an instructor and it's pre-approved
    const isInstructor = req.user.role === 'instructor';

    const course = await Course.create({
        title,
        description,
        category,
        level: level || 'Beginner',
        duration: duration || '0h 0m',
        thumbnail: thumbnail || '',
        instructor: isInstructor ? req.user._id : (instructorId || req.user._id),
        adminApproved: !isInstructor, // Instructors need approval, Admins don't
    });

    res.status(201).json(course);
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin/Instructor
const updateCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        // Check if user is admin or the instructor of the course
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this course');
        }

        course.title = req.body.title || course.title;
        course.description = req.body.description || course.description;
        course.category = req.body.category || course.category;
        course.level = req.body.level || course.level;
        course.duration = req.body.duration || course.duration;
        course.thumbnail = req.body.thumbnail || course.thumbnail;

        // Handle publishing logic
        if (req.body.isPublished !== undefined) {
            if (req.user.role === 'admin' || (course.instructor.toString() === req.user._id.toString() && course.adminApproved)) {
                course.isPublished = req.body.isPublished;
            } else if (!course.adminApproved) {
                res.status(403);
                throw new Error('Course must be approved by admin before publishing');
            }
        }

        // Admin only: change approval status
        if (req.user.role === 'admin' && req.body.adminApproved !== undefined) {
            course.adminApproved = req.body.adminApproved;
        }

        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        await course.deleteOne();
        res.json({ message: 'Course removed' });
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Update Live Class Link
// @route   PUT /api/courses/:id/live
// @access  Private/Instructor/Admin
const updateLiveLink = asyncHandler(async (req, res) => {
    const { link } = req.body;
    const course = await Course.findById(req.params.id);

    if (course) {
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to update this course');
        }

        course.liveClassLink = link;
        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, updateLiveLink };
