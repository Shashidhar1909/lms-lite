const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Enrollment = require('./models/Enrollment');
const connectDB = require('./config/db');

// Load env from backend/.env if running from root
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const resetData = async () => {
    try {
        console.log('🗑️  Clearing Database...');
        await User.deleteMany();
        await Course.deleteMany();
        await Lesson.deleteMany();
        await Enrollment.deleteMany();

        console.log('👤 Creating Admin Account...');
        await User.create({
            name: 'Admin User',
            email: 'admin@lms.com',
            password: 'password123',
            role: 'admin',
            isRoot: true,
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
            bio: 'System Administrator'
        });

        console.log('✅ Database Reset Successfully!');
        console.log('-----------------------------------');
        console.log('Admin: admin@lms.com / password123');
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

resetData();
