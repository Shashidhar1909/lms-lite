import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { PlayCircle, CheckCircle, ChevronLeft, FileText, Lock, Award } from 'lucide-react';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Fetch course details (assuming public for now, or enrolled check)
                const courseRes = await api.get(`/courses/${courseId}`);
                setCourse(courseRes.data);

                // Fetch lessons for this course
                const lessonsRes = await api.get(`/lessons/${courseId}`);
                setLessons(lessonsRes.data);

                // Fetch enrollment status to get completed lessons
                try {
                    const statusRes = await api.get(`/enrollments/check/${courseId}`);
                    if (statusRes.data.isEnrolled) {
                        setCompletedLessons(statusRes.data.completedLessons || []);
                    }
                } catch (err) {
                    // Not enrolled or status check failed - fail silently
                }

                if (lessonsRes.data.length > 0) {
                    setActiveLesson(lessonsRes.data[0]);
                }
            } catch (error) {
                console.error("Failed to load course content", error);
                // navigate('/student'); // Redirect if error
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchCourseData();
    }, [courseId, navigate]);

    const handleMarkComplete = async () => {
        if (!activeLesson) return;

        try {
            await api.put('/enrollments/progress', {
                courseId,
                lessonId: activeLesson._id
            });

            // Update local state
            if (!completedLessons.includes(activeLesson._id)) {
                setCompletedLessons([...completedLessons, activeLesson._id]);
            }
        } catch (error) {
            console.error("Failed to mark lesson as complete", error);
            alert("Failed to update progress");
        }
    };


    const [answers, setAnswers] = useState({});
    const [examResult, setExamResult] = useState(null);
    const [showCertificate, setShowCertificate] = useState(false);
    const [certificateData, setCertificateData] = useState(null);

    // Reset exam state when changing lessons
    useEffect(() => {
        setAnswers({});
        setExamResult(null);
        setShowCertificate(false);
    }, [activeLesson]);

    const handleAnswerChange = (qIndex, optionIndex) => {
        setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
    };

    const submitExam = async () => {
        if (!activeLesson) return;
        // Convert answers object to array or as expected by backend
        // Backend expects array matching questions order: [0, 2, 1] for questions 0, 1, 2
        // Or object { 0: 0, 1: 2 }. Let's check backend... backend used `answers[index] === q.correctAnswer`. 
        // So backend expects an array where index matches question index.

        const answersArray = activeLesson.questions.map((_, idx) => answers[idx]);
        // Note: usage of map might fill undefined for skipped questions, which is fine.

        try {
            const res = await api.post(`/lessons/${activeLesson._id}/submit-exam`, { answers: answersArray });
            setExamResult(res.data);

            if (res.data.passed) {
                // Refresh completed lessons and enrollment status
                // If it was the last thing, might trigger certificate
                setCompletedLessons(prev => [...prev, activeLesson._id]);

                // Check if certificate was earned in this response
                if (res.data.certificateEarned) {
                    setCertificateData({
                        student: "Student Name", // In a real app, fetch user name or get from context
                        course: course.title,
                        date: new Date().toLocaleDateString()
                    });
                    setShowCertificate(true);
                }
            }
        } catch (error) {
            console.error("Exam submission failed", error);
            alert("Failed to submit exam");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading course content...</div>;
    if (!course) return <div className="p-10 text-center">Course not found.</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] -m-6 overflow-hidden relative">
            {/* Sidebar / Lesson List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <button
                        onClick={() => navigate('/student')}
                        className="text-gray-500 hover:text-gray-900 flex items-center mb-4 text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </button>
                    <h2 className="font-bold text-gray-800 leading-tight">{course?.title || 'Course Content'}</h2>
                    <p className="text-xs text-gray-500 mt-1">{lessons.length} Lessons</p>
                </div>

                <div className="flex-grow">
                    {lessons.map((lesson, index) => (
                        <button
                            key={lesson._id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition flex items-start space-x-3
                                ${activeLesson?._id === lesson._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}
                            `}
                        >
                            <div className={`mt-1 ${activeLesson?._id === lesson._id ? 'text-blue-600' : 'text-gray-400'}`}>
                                {lesson.contentType === 'video' ? <PlayCircle className="w-4 h-4" /> :
                                    lesson.contentType === 'exam' ? <CheckCircle className="w-4 h-4" /> :
                                        <FileText className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium truncate ${activeLesson?._id === lesson._id ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {index + 1}. {lesson.title}
                                </h4>
                                <p className="text-xs text-gray-400 mt-1 capitalize">{lesson.contentType}</p>
                            </div>
                            {completedLessons.includes(lesson._id) && (
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50">
                {activeLesson ? (
                    <div className="max-w-4xl mx-auto w-full p-8">
                        {showCertificate && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl p-10 max-w-2xl w-full text-center border-8 border-double border-indigo-100 shadow-2xl relative">
                                    <button
                                        onClick={() => setShowCertificate(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Award className="w-10 h-10 text-yellow-600" />
                                    </div>
                                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Certificate of Completion</h2>
                                    <p className="text-gray-500 mb-8">This certifies that</p>
                                    <div className="text-2xl font-bold text-indigo-900 border-b-2 border-indigo-100 inline-block px-10 pb-2 mb-8">
                                        Student
                                    </div>
                                    <p className="text-gray-500 mb-2">has successfully completed the course</p>
                                    <h3 className="text-xl font-bold text-gray-800 mb-8">{course.title}</h3>
                                    <div className="flex justify-between text-sm text-gray-400 mt-8 pt-8 border-t border-gray-100">
                                        <span>Date: {new Date().toLocaleDateString()}</span>
                                        <span>LMS Pro Certification</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                            {/* Video Player or Content Info */}
                            <div className="aspect-video bg-black flex items-center justify-center">
                                {activeLesson.contentType === 'video' ? (
                                    <iframe
                                        src={activeLesson.contentUrl}
                                        title={activeLesson.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : activeLesson.contentType === 'exam' ? (
                                    <div className="p-10 text-center text-white bg-indigo-900 w-full h-full flex flex-col items-center justify-center">
                                        <Award className="w-16 h-16 mb-4 text-yellow-400" />
                                        <h2 className="text-3xl font-bold mb-2">Course Exam</h2>
                                        <p className="text-indigo-200 max-w-md">
                                            Test your knowledge to earn your certificate. You need {activeLesson.passingScore} correct answers to pass.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-10 text-center text-white">
                                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <h2 className="text-2xl font-bold mb-2">{activeLesson.title}</h2>
                                        <p className="text-gray-400">This lesson contains reading material.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{activeLesson.title}</h1>

                            {activeLesson.contentType === 'video' || activeLesson.contentType === 'text' || activeLesson.contentType === 'pdf' ? (
                                <>
                                    {activeLesson.contentType !== 'video' && (
                                        <div className="prose max-w-none text-gray-600">
                                            <p>{activeLesson.contentUrl}</p>
                                        </div>
                                    )}
                                    <div className="mt-8 flex justify-end">
                                        {completedLessons.includes(activeLesson._id) ? (
                                            <div className="flex items-center text-green-600 font-medium">
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Lesson Completed
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleMarkComplete}
                                                className="btn-primary flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Mark as Completed
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : activeLesson.contentType === 'exam' && (
                                <div className="space-y-8">
                                    {examResult ? (
                                        <div className={`p-6 rounded-xl border ${examResult.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <h3 className={`text-xl font-bold mb-2 ${examResult.passed ? 'text-green-800' : 'text-red-800'}`}>
                                                {examResult.passed ? 'Congratulations! You Passed!' : 'You did not pass.'}
                                            </h3>
                                            <p className="text-gray-700">
                                                You scored <span className="font-bold">{examResult.score}</span> out of {examResult.totalQuestions}.
                                            </p>
                                            {!examResult.passed && (
                                                <button
                                                    onClick={() => setExamResult(null)}
                                                    className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50"
                                                >
                                                    Try Again
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-6">
                                                {(activeLesson.questions || []).map((q, qIdx) => (
                                                    <div key={qIdx} className="p-4 border border-gray-100 rounded-xl">
                                                        <h4 className="font-bold text-gray-800 mb-3">{qIdx + 1}. {q.question}</h4>
                                                        <div className="space-y-2">
                                                            {q.options.map((opt, oIdx) => (
                                                                <label key={oIdx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition">
                                                                    <input
                                                                        type="radio"
                                                                        name={`q-${qIdx}`}
                                                                        checked={answers[qIdx] === oIdx}
                                                                        onChange={() => handleAnswerChange(qIdx, oIdx)}
                                                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                    <span className="text-gray-700">{opt}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <button
                                                    onClick={submitExam}
                                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                                                >
                                                    Submit Exam
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a lesson to start learning
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursePlayer;
