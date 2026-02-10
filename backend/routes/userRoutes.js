const express = require('express');
const router = express.Router();
const { registerUser, getUsers, deleteUser, approveUser, getUnapprovedUsers, updateUser } = require('../controllers/userController');
const { bulkImportUsers, createStudent } = require('../controllers/bulkUserController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .post(protect, authorize('admin'), registerUser)
    .get(protect, authorize('admin'), getUsers);

router.route('/:id')
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

router.route('/unapproved')
    .get(protect, authorize('admin'), getUnapprovedUsers);

router.route('/:id/approve')
    .put(protect, authorize('admin'), approveUser);

// Bulk import for admin
router.route('/bulk')
    .post(protect, authorize('admin'), bulkImportUsers);

// Student creation for instructor
router.route('/student')
    .post(protect, authorize('instructor'), createStudent);

module.exports = router;
