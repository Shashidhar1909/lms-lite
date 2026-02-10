const express = require('express');
const router = express.Router();
const { getLessons, addLesson, updateLesson, deleteLesson, submitExam } = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/:courseId').get(protect, getLessons); // Get lessons by course
router.route('/')
    .post(protect, authorize('admin', 'instructor'), addLesson);

router.route('/:id')
    .put(protect, authorize('admin', 'instructor'), updateLesson)
    .delete(protect, authorize('admin', 'instructor'), deleteLesson);

router.route('/:id/submit-exam')
    .post(protect, submitExam);

module.exports = router;
