const express = require('express');
const router = express.Router();
const { enrollCourse, getMyEnrollments, updateProgress, checkEnrollment, getInstructorStudents, getAllEnrollments } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .post(protect, enrollCourse)
    .get(protect, authorize('admin'), getAllEnrollments);

router.get('/my-courses', protect, getMyEnrollments);
router.put('/progress', protect, updateProgress);
router.get('/check/:courseId', protect, checkEnrollment);
router.get('/instructor-students', protect, getInstructorStudents);

module.exports = router;
