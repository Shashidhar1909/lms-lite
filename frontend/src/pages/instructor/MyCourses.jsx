import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Users, Clock, BarChart3, Settings, Plus, CheckCircle, XCircle } from 'lucide-react';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses');
            setCourses(res.data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
                    <p className="text-gray-500 mt-1">Manage and track your course offerings</p>
                </div>
                <Link
                    to="/instructor"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition font-medium flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create New Course
                </Link>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-6">Create your first course to get started</p>
                    <Link
                        to="/instructor"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Course
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div
                            key={course._id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-16 h-16 text-white opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {course.adminApproved ? (
                                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Approved
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Pending
                                        </span>
                                    )}
                                    {course.isPublished && (
                                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                                            Published
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                                    {course.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {course.description}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {course.duration || 'N/A'}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                        {course.category}
                                    </span>
                                </div>

                                <Link
                                    to={`/instructor/course/${course._id}/lessons`}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition"
                                >
                                    <Settings className="w-4 h-4" />
                                    Manage Lessons
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;
