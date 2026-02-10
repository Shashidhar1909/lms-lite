import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CourseCard from '../../components/ui/CourseCard';
import { BookOpen, Award, Flame, Zap, Video } from 'lucide-react';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [enrollRes, coursesRes] = await Promise.all([
                    api.get('/enrollments/my-courses'),
                    api.get('/courses')
                ]);
                setEnrolledCourses(enrollRes.data.filter(e => e.course));
                setAllCourses(coursesRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGreetingMessage = () => {
        if (enrolledCourses.length === 0) {
            return "It's a great day to start learning. Explore our courses and find your next path!";
        }

        const avgProgress = enrolledCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrolledCourses.length;
        const completions = enrolledCourses.filter(e => e.progress === 100).length;

        if (completions > 0 && completions === enrolledCourses.length) {
            return "Incredible work! You've completed all your enrolled courses. What's next?";
        }

        if (avgProgress > 80) {
            return "You're almost there! Finish strong to earn your certifications and master these skills.";
        }

        if (avgProgress > 40) {
            return `You're making great progress! You've completed about ${Math.round(avgProgress)}% of your studies so far.`;
        }

        return "Welcome back! Keep up the momentum with your lessons today.";
    };

    const getAvailableCourses = () => {
        const enrolledIds = enrolledCourses.map(e => e.course._id);
        return allCourses.filter(c => !enrolledIds.includes(c._id) && c.isPublished);
    };

    const handleEnroll = async (courseId) => {
        try {
            await api.post('/enrollments', { courseId });
            // Refresh data
            const [enrollRes, coursesRes] = await Promise.all([
                api.get('/enrollments/my-courses'),
                api.get('/courses')
            ]);
            setEnrolledCourses(enrollRes.data.filter(e => e.course));
            setAllCourses(coursesRes.data);
            alert("Enrollment Successful!");
        } catch (error) {
            alert('Enrollment failed');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero / Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-10 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
                    <p className="text-blue-100 mb-6 max-w-xl">{getGreetingMessage()}</p>

                    <div className="flex space-x-6">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="font-semibold">{enrolledCourses.length} Courses in Progress</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
                            <Award className="w-5 h-5 text-yellow-400" />
                            <span className="font-semibold">
                                {enrolledCourses.filter(e => e.certificateEarned).length} Certificates Earned
                            </span>
                        </div>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-10"></div>
            </div>

            {/* Continue Learning Section */}
            {enrolledCourses.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Zap className="w-6 h-6 mr-2 text-yellow-500 fill-current" />
                            Continue Learning
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCourses.map(enrollment => {
                            if (!enrollment.course) return null;
                            return (
                                <div key={enrollment._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{enrollment.course.title}</h3>
                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                                            {enrollment.progress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${enrollment.progress}%` }}
                                        ></div>
                                    </div>
                                    {enrollment.course.liveClassLink && (
                                        <a
                                            href={enrollment.course.liveClassLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold text-sm transition-colors flex items-center justify-center mb-2 animate-pulse"
                                        >
                                            <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                                            Join Live Class
                                        </a>
                                    )}
                                    <button
                                        onClick={() => navigate(`/student/course/${enrollment.course._id}`)}
                                        className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors"
                                    >
                                        Resume Course
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Explore Courses Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <BookOpen className="w-6 h-6 mr-2 text-indigo-500" />
                        Explore Courses
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getAvailableCourses().map(course => (
                        <CourseCard
                            key={course._id}
                            course={course}
                            onClick={() => navigate(`/student/course-details/${course._id}`)}
                        />
                    ))}
                    {getAvailableCourses().length === 0 && (
                        <p className="text-gray-500 col-span-full text-center py-10">No new courses available right now.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
