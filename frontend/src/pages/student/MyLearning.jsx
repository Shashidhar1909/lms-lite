import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Play, Clock, TrendingUp, Award, ChevronRight } from 'lucide-react';

const MyLearning = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const res = await api.get('/enrollments/my-courses');
            const validEnrollments = res.data.filter(enrollment => enrollment.course);
            setEnrollments(validEnrollments);
        } catch (error) {
            console.error("Failed to fetch enrollments", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">My Learning</h2>
                <p className="text-gray-500 mt-1">Continue your learning journey</p>
            </div>

            {enrollments.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 text-center">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No courses enrolled</h3>
                    <p className="text-gray-500 mb-6">Browse available courses and start learning</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {enrollments.map(enrollment => (
                        <Link
                            key={enrollment._id}
                            to={`/student/course/${enrollment.course._id}`}
                            className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Course Thumbnail */}
                                <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden flex-shrink-0">
                                    {enrollment.course.thumbnail ? (
                                        <img
                                            src={enrollment.course.thumbnail}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-16 h-16 text-white opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                        <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100" />
                                    </div>
                                </div>

                                {/* Course Info */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                                                {enrollment.course.title}
                                            </h3>
                                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {enrollment.course.description}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {enrollment.course.duration || 'N/A'}
                                            </span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                {enrollment.course.category}
                                            </span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {enrollment.course.difficulty}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4 text-green-500" />
                                                Progress
                                            </span>
                                            <span className="text-sm font-bold text-blue-600">
                                                {Math.round(enrollment.progress || 0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${enrollment.progress || 0}%` }}
                                            ></div>
                                        </div>
                                        {enrollment.progress === 100 && (
                                            <div className="mt-2 flex items-center gap-1 text-green-600 text-sm font-semibold">
                                                <Award className="w-4 h-4" />
                                                Completed!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLearning;
