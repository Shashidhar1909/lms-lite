const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Enrollment = require('./models/Enrollment');
const User = require('./models/User');
const Course = require('./models/Course');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const enrollments = await Enrollment.find({});
        console.log(`Total Enrollments: ${enrollments.length}`);

        if (enrollments.length > 0) {
            console.log('First Enrollment:', JSON.stringify(enrollments[0], null, 2));
        } else {
            console.log('No enrollments found directly in DB.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkData();
