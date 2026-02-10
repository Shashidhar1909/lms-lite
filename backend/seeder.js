const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Enrollment = require('./models/Enrollment');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        console.log('🗑️  Clearing Database...');
        await User.deleteMany();
        await Course.deleteMany();
        await Lesson.deleteMany();
        await Enrollment.deleteMany();

        console.log('👤 Creating Users...');
        // 1. Create Users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@lms.com',
            password: 'password123',
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
            bio: 'System Administrator'
        });

        const instructors = [];
        const instructorNames = ['John Doe', 'Sarah Smith', 'Michael Chen', 'Emily Davis', 'David Wilson'];
        for (let i = 0; i < instructorNames.length; i++) {
            const user = await User.create({
                name: instructorNames[i],
                email: `instructor${i + 1}@lms.com`,
                password: 'password123',
                role: 'instructor',
                avatar: `https://ui-avatars.com/api/?name=${instructorNames[i]}&background=random`,
                bio: 'Experienced instructor with 10+ years in the industry.'
            });
            instructors.push(user);
        }

        const students = [];
        for (let i = 1; i <= 20; i++) {
            const user = await User.create({
                name: `Student ${i}`,
                email: `student${i}@lms.com`,
                password: 'password123',
                role: 'student',
                avatar: `https://ui-avatars.com/api/?name=Student+${i}&background=random`,
                bio: 'Running towards my dreams.'
            });
            students.push(user);
        }

        console.log('📚 Creating Courses...');
        // 2. Create Courses
        const courseData = [
            {
                title: 'Python for Beginners',
                description: 'Master Python programming from scratch. Learn variables, loops, functions, and object-oriented programming.',
                category: 'Development',
                difficulty: 'Beginner',
                duration: '12h 30m',
                level: 'Beginner',
                tags: ['python', 'coding', 'programming'],
                thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80',
                instructor: instructors[0]._id,
                isPublished: true
            },
            {
                title: 'Data Structures & Algorithms',
                description: 'Ace your coding interviews with this comprehensive guide to DSA. Covers arrays, linked lists, trees, and graphs.',
                category: 'Computer Science',
                difficulty: 'Intermediate',
                duration: '25h 00m',
                level: 'Intermediate',
                tags: ['dsa', 'algorithms', 'interview-prep'],
                thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
                instructor: instructors[2]._id,
                isPublished: true
            },
            {
                title: 'Full Stack Web Development',
                description: 'Become a full-stack developer with the MERN stack. Build real-world applications with React, Node.js, and MongoDB.',
                category: 'Development',
                difficulty: 'Advanced',
                duration: '40h 15m',
                level: 'Advanced',
                tags: ['mern', 'react', 'nodejs', 'web-dev'],
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
                instructor: instructors[1]._id,
                isPublished: true
            },
            {
                title: 'Machine Learning Fundamentals',
                description: 'Introduction to Machine Learning concepts. Supervised vs Unsupervised learning, regression, and classification.',
                category: 'Data Science',
                difficulty: 'Intermediate',
                duration: '18h 45m',
                level: 'Intermediate',
                tags: ['ml', 'ai', 'data-science'],
                thumbnail: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&q=80',
                instructor: instructors[2]._id,
                isPublished: true
            },
            {
                title: 'DevOps Essentials',
                description: 'Learn the basics of DevOps, CI/CD pipelines, Docker, and Kubernetes.',
                category: 'DevOps',
                difficulty: 'Intermediate',
                duration: '15h 20m',
                level: 'Intermediate',
                tags: ['devops', 'docker', 'kubernetes'],
                thumbnail: 'https://images.unsplash.com/photo-1667372393119-c81c0cda0a29?w=600&q=80',
                instructor: instructors[4]._id,
                isPublished: true
            },
            {
                title: 'SQL & Databases',
                description: 'Master SQL queries, database design, and normalization. Supports MySQL and PostgreSQL.',
                category: 'Database',
                difficulty: 'Beginner',
                duration: '10h 00m',
                level: 'Beginner',
                tags: ['sql', 'database', 'mysql'],
                thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80',
                instructor: instructors[3]._id,
                isPublished: true
            },
            {
                title: 'Aptitude & Placement Prep',
                description: 'Prepare for campus placements with quantitative aptitude, logical reasoning, and verbal ability tests.',
                category: 'Placement',
                difficulty: 'Beginner',
                duration: '20h 00m',
                level: 'Beginner',
                tags: ['aptitude', 'placement', 'math'],
                thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80',
                instructor: instructors[0]._id, // Assigned to Instructor 1
                isPublished: true
            },
            {
                title: 'React Native Masterclass',
                description: 'Build native mobile apps for iOS and Android using React Native.',
                category: 'Mobile Dev',
                difficulty: 'Advanced',
                duration: '22h 30m',
                level: 'Advanced',
                tags: ['react-native', 'mobile', 'ios', 'android'],
                thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
                instructor: instructors[0]._id, // Assigned to Instructor 1
                isPublished: true
            }
        ];

        const createdCourses = await Course.insertMany(courseData);

        console.log('📖 Creating Lessons...');
        // 3. Create Lessons (Mock Data)
        const lessons = [];
        createdCourses.forEach(course => {
            // General Intro
            lessons.push({
                courseId: course._id,
                title: 'Course Introduction',
                contentType: 'video',
                contentUrl: 'https://www.youtube.com/embed/w7ejDZ8SWv8', // React Intro as generic placeholder
                order: 1
            });
            lessons.push({
                courseId: course._id,
                title: 'Setting up the Environment',
                contentType: 'text',
                contentUrl: 'Please install VS Code and the necessary SDKs before proceeding.',
                order: 2
            });
            // Specific Mock content based on title (simplified for brevity)
            lessons.push({
                courseId: course._id,
                title: 'Core Concepts Deep Dive',
                contentType: 'video',
                contentUrl: 'https://www.youtube.com/embed/SqcY0GlETPk', // React Tutorial placeholder
                order: 3
            });
        });
        await Lesson.insertMany(lessons);

        console.log('📝 Creating Enrollments...');
        // 4. Random Enrollments
        const enrollments = [];
        for (const student of students) {
            // Enroll each student in 1-3 random courses
            const numCourses = Math.floor(Math.random() * 3) + 1;
            const shuffledCourses = createdCourses.sort(() => 0.5 - Math.random());
            const selectedCourses = shuffledCourses.slice(0, numCourses);

            for (const course of selectedCourses) {
                const progress = Math.floor(Math.random() * 100);
                enrollments.push({
                    student: student._id,
                    course: course._id,
                    completedLessons: [], // Ideally populate this based on progress
                    progress: progress
                });
            }
        }
        await Enrollment.insertMany(enrollments);

        console.log('✅ Data Imported Successfully!');
        console.log('-----------------------------------');
        console.log('Admin: admin@lms.com / password123');
        console.log('Instructor: instructor1@lms.com / password123');
        console.log('Student: student1@lms.com / password123');
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
