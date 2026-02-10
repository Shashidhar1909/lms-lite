const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Register a new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (user) {
        // Guard: Root admin cannot be deleted
        if (user.isRoot) {
            res.status(403);
            throw new Error('Root Admin cannot be deleted');
        }

        // Guard: Regular admins cannot delete other admins
        if (!req.user.isRoot && user.role === 'admin') {
            res.status(403);
            throw new Error('Administrators can only be deleted by the Root Admin');
        }

        await user.deleteOne();
        res.json({ message: 'User removed' })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

// @desc    Approve a user
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
const approveUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isApproved = true;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isApproved: updatedUser.isApproved
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Guard: Prevent modification of Root admin
        if (user.isRoot) {
            res.status(403);
            throw new Error('Root Admin cannot be modified');
        }

        // Guard: Prevent non-root admin from modifying another admin
        if (!req.user.isRoot && user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('You do not have permission to modify another administrator');
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // Root admin can change roles, but regular admins can't change other admin roles
        if (req.user.isRoot || (user.role !== 'admin' && req.body.role !== 'admin')) {
            user.role = req.body.role || user.role;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
// @desc    Get all unapproved users
// @route   GET /api/users/unapproved
// @access  Private/Admin
const getUnapprovedUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ isApproved: false }).select('-password');
    res.json(users);
});

module.exports = {
    registerUser,
    getUsers,
    deleteUser,
    approveUser,
    getUnapprovedUsers,
    updateUser
};
