import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Clock, BarChart, User, CheckCircle, PlayCircle, BookOpen } from 'lucide-react';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState([]);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const courseRes = await api.get(`/courses/${courseId}`);
                setCourse(courseRes.data);

                // Fetch lessons to show syllabus/preview
                // Note: Regular students might not be able to see full lesson content if not enrolled, 
                // but we can show titles. The backend `getLessons` might need checks or we assume it's open for titles.
                // Actually `getLessons` is protected. Let's assume we can fetch it for syllabus preview 
                // or we might need a public endpoint. For now, try fetching.
                try {
                    const lessonsRes = await api.get(`/lessons/${courseId}`);
                    setLessons(lessonsRes.data);
                } catch (err) {
                    // Could not fetch lessons for preview (likely not enrolled/authorized)
                }

            } catch (error) {
                console.error("Failed to fetch course details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId]);

    const handleEnroll = async () => {
        try {
            await api.post('/enrollments', { courseId });
            alert("Enrollment Successful!");
            navigate('/student');
        } catch (error) {
            alert(error.response?.data?.message || 'Enrollment failed');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading course details...</div>;
    if (!course) return <div className="p-10 text-center">Course not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-64 md:h-80 relative">
                    <img
                        src={course.thumbnail || 'https://placehold.co/1200x400?text=Course+Thumbnail'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/1200x400?text=Course+Thumbnail'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <div className="p-8 text-white w-full">
                            <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                                {course.category}
                            </span>
                            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                            <div className="flex items-center gap-6 text-sm font-medium">
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {course.instructor?.name || 'Instructor'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {course.duration || 'Flexible'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <BarChart className="w-4 h-4" />
                                    {course.difficulty || 'All Levels'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">About This Course</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {course.description}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Course Syllabus</h3>
                        <div className="space-y-3">
                            {lessons.length > 0 ? (
                                lessons.map((lesson, idx) => (
                                    <div key={lesson._id} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-4">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                                            <p className="text-xs text-gray-500 capitalize">{lesson.contentType}</p>
                                        </div>
                                        {lesson.contentType === 'video' ? <PlayCircle className="w-5 h-5 text-gray-400" /> :
                                            lesson.contentType === 'exam' ? <CheckCircle className="w-5 h-5 text-gray-400" /> :
                                                <BookOpen className="w-5 h-5 text-gray-400" />}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">Syllabus details available after enrollment.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 sticky top-6">
                        <div className="text-3xl font-bold text-gray-900 mb-2">Free</div>
                        <p className="text-gray-500 text-sm mb-6">Full lifetime access</p>

                        <button
                            onClick={handleEnroll}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition transform hover:-translate-y-1"
                        >
                            Enroll Now
                        </button>

                        <div className="mt-6 space-y-4 text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Access on mobile and desktop</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Certificate of completion</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>{lessons.length} lessons included</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
