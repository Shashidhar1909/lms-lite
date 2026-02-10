const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, updateLiveLink } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, getCourses)
    .post(protect, authorize('admin', 'instructor'), createCourse);

router.route('/:id')
    .get(protect, getCourseById)
    .put(protect, authorize('admin', 'instructor'), updateCourse)
    .delete(protect, authorize('admin'), deleteCourse);

router.route('/:id/live').put(protect, authorize('admin', 'instructor'), updateLiveLink);

module.exports = router;
