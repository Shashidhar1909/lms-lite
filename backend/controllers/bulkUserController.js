const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Bulk import users from Excel
// @route   POST /api/users/bulk
// @access  Private/Admin
const bulkImportUsers = asyncHandler(async (req, res) => {
    const { users } = req.body; // Array of user objects: [{name, email, password, role}]

    if (!users || !Array.isArray(users) || users.length === 0) {
        res.status(400);
        throw new Error('No user data provided');
    }

    const results = {
        success: [],
        errors: []
    };

    for (let i = 0; i < users.length; i++) {
        const userData = users[i];

        try {
            // Validate required fields
            if (!userData.name || !userData.email || !userData.password) {
                results.errors.push({
                    row: i + 1,
                    email: userData.email || 'N/A',
                    error: 'Missing required fields (name, email, or password)'
                });
                continue;
            }

            // Check if user already exists
            const userExists = await User.findOne({ email: userData.email });
            if (userExists) {
                results.errors.push({
                    row: i + 1,
                    email: userData.email,
                    error: 'User with this email already exists'
                });
                continue;
            }

            // Validate role
            const role = userData.role || 'student';
            if (!['admin', 'instructor', 'student'].includes(role)) {
                results.errors.push({
                    row: i + 1,
                    email: userData.email,
                    error: `Invalid role: ${role}`
                });
                continue;
            }

            // Create user
            const user = await User.create({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: role,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
                bio: userData.bio || ''
            });

            results.success.push({
                row: i + 1,
                name: user.name,
                email: user.email,
                role: user.role
            });

        } catch (error) {
            results.errors.push({
                row: i + 1,
                email: userData.email || 'N/A',
                error: error.message
            });
        }
    }

    res.status(201).json({
        message: 'Bulk import completed',
        totalProcessed: users.length,
        successCount: results.success.length,
        errorCount: results.errors.length,
        results
    });
});

// @desc    Create a student (for instructors)
// @route   POST /api/users/student
// @access  Private/Instructor
const createStudent = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, email, and password');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const student = await User.create({
        name,
        email,
        password,
        role: 'student',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        bio: '',
        isApproved: false // Requires admin approval
    });

    res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role
    });
});

module.exports = { bulkImportUsers, createStudent };
