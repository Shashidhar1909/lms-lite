const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const viewData = async () => {
    try {
        const users = await User.find({});
        const courses = await Course.find({});

        console.log('\n--- USERS ---');
        console.table(users.map(u => ({ _id: u._id.toString(), name: u.name, email: u.email, role: u.role })));

        console.log('\n--- COURSES ---');
        console.table(courses.map(c => ({ _id: c._id.toString(), title: c.title, category: c.category, published: c.isPublished })));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

viewData();
