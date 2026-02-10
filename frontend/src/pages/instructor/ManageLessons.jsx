import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Trash2, Video, FileText, Type, ArrowLeft, GripVertical, Check, X, AlertTriangle, BookOpen } from 'lucide-react';

const ManageLessons = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        contentType: 'video',
        contentUrl: '',
        order: 1
    });

    const fetchData = useCallback(async () => {
        try {
            const [courseRes, lessonsRes] = await Promise.all([
                api.get(`/courses/${courseId}`),
                api.get(`/lessons/${courseId}`)
            ]);
            setCourse(courseRes.data);
            setLessons(lessonsRes.data);
            setFormData(prev => ({ ...prev, order: lessonsRes.data.length + 1 }));
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddLesson = async (e) => {
        e.preventDefault();
        try {
            await api.post('/lessons', { ...formData, courseId });
            setShowModal(false);
            setFormData({
                title: '',
                contentType: 'video',
                contentUrl: '',
                order: lessons.length + 2,
                questions: [],
                passingScore: 0
            });
            fetchData();
        } catch (error) {
            alert('Failed to add lesson');
        }
    };

    const handleDeleteLesson = async (id) => {
        if (window.confirm('Are you sure you want to remove this lesson?')) {
            try {
                await api.delete(`/lessons/${id}`);
                fetchData();
            } catch (error) {
                alert('Failed to delete lesson');
            }
        }
    };

    const togglePublish = async () => {
        if (!course.adminApproved) {
            alert("This course must be approved by an administrator before it can be published.");
            return;
        }
        try {
            await api.put(`/courses/${courseId}`, { isPublished: !course.isPublished });
            fetchData();
        } catch (error) {
            alert('Failed to update course status');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading lessons...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link to="/instructor" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900">{course?.title}</h2>
                    <p className="text-gray-500 mt-1">Manage curriculum and course status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={togglePublish}
                        className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition shadow-sm ${course?.isPublished
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {course?.isPublished ? (
                            <><X className="w-4 h-4 mr-2" /> Unpublish Course</>
                        ) : (
                            <><Check className="w-4 h-4 mr-2" /> Publish Course</>
                        )}
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Lesson
                    </button>
                </div>
            </div>

            {/* Course Status Info */}
            {!course?.adminApproved && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-amber-100 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-amber-900 text-lg mb-2">⏳ Waiting for Admin Approval</h4>
                        <p className="text-sm text-amber-800 mb-3">
                            This course is currently pending approval from an administrator. You can add and manage lessons,
                            but the course cannot be published until it receives admin approval.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-amber-700">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold">Status: Awaiting admin review</span>
                        </div>
                    </div>
                </div>
            )}

            {course?.adminApproved && !course?.isPublished && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-green-900 text-sm font-bold">
                            ✅ Course approved! Click "Publish Course" to make it visible to students.
                        </p>
                    </div>
                </div>
            )}

            {/* Lessons List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Course Curriculum</h3>
                    <span className="text-sm text-gray-500 font-medium">{lessons.length} Lessons</span>
                </div>
                <div className="divide-y divide-gray-50">
                    {lessons.map((lesson, index) => (
                        <div key={lesson._id} className="group p-5 flex items-center justify-between hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4">
                                <div className="text-gray-300 group-hover:text-gray-400 transition cursor-grab">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className={`p-3 rounded-2xl ${lesson.contentType === 'video' ? 'bg-red-50 text-red-600' :
                                    lesson.contentType === 'pdf' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                                    }`}>
                                    {lesson.contentType === 'video' ? <Video className="w-5 h-5" /> :
                                        lesson.contentType === 'pdf' ? <FileText className="w-5 h-5" /> : <Type className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">
                                        <span className="text-gray-400 mr-2">#{index + 1}</span>
                                        {lesson.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 flex items-center mt-1">
                                        <span className="capitalize">{lesson.contentType}</span>
                                        <span className="mx-2 text-gray-300">•</span>
                                        <span className="truncate max-w-[200px] md:max-w-md">{lesson.contentUrl}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteLesson(lesson._id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition opacity-0 group-hover:opacity-100"
                                title="Delete Lesson"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {lessons.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-10 h-10 text-gray-300" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">No lessons yet</h4>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">Start building your course curriculum by adding your first lesson.</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-6 font-bold text-indigo-600 hover:text-indigo-700"
                            >
                                + Add First Lesson
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Lesson Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Add New Lesson</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleAddLesson} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            <div>
                                <label htmlFor="lessonTitle" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Lesson Title</label>
                                <input
                                    id="lessonTitle"
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Introduction to the course"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Content Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['video', 'pdf', 'text', 'exam'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, contentType: type })}
                                            className={`p-3 rounded-xl border font-bold text-sm capitalize transition flex flex-col items-center gap-2 ${formData.contentType === type
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {/* (Icons remain same, add check for exam) */}
                                            {type === 'video' && <Video className="w-5 h-5" />}
                                            {type === 'pdf' && <FileText className="w-5 h-5" />}
                                            {type === 'text' && <Type className="w-5 h-5" />}
                                            {type === 'exam' && <BookOpen className="w-5 h-5" />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.contentType !== 'exam' ? (
                                <div>
                                    <label htmlFor="contentUrl" className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                        {formData.contentType === 'video' ? 'YouTube Video URL' :
                                            formData.contentType === 'pdf' ? 'Document/PDF URL' : 'Content Text / URL'}
                                    </label>
                                    <textarea
                                        id="contentUrl"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder={formData.contentType === 'video' ? 'https://youtube.com/watch?v=...' : 'Enter content details...'}
                                        value={formData.contentUrl || ''}
                                        onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 border-t pt-4">
                                    <div>
                                        <label htmlFor="passingScore" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Passing Score</label>
                                        <input
                                            id="passingScore"
                                            type="number"
                                            className="w-32 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                                            value={formData.passingScore || 0}
                                            onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-gray-700">Questions</h4>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const qs = formData.questions || [];
                                                    setFormData({
                                                        ...formData,
                                                        questions: [...qs, { question: '', options: ['', ''], correctAnswer: 0 }]
                                                    });
                                                }}
                                                className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-bold"
                                            >
                                                + Add Question
                                            </button>
                                        </div>

                                        {(formData.questions || []).map((q, qIdx) => (
                                            <div key={qIdx} className="p-4 border rounded-xl bg-gray-50 space-y-3">
                                                <input
                                                    type="text"
                                                    name={`question-${qIdx}`}
                                                    aria-label={`Question ${qIdx + 1}`}
                                                    placeholder={`Question ${qIdx + 1}`}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    value={q.question}
                                                    onChange={(e) => {
                                                        const qs = [...formData.questions];
                                                        qs[qIdx].question = e.target.value;
                                                        setFormData({ ...formData, questions: qs });
                                                    }}
                                                />
                                                <div className="pl-4 space-y-2">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={`q-${qIdx}`}
                                                                aria-label={`Mark option ${oIdx + 1} as correct`}
                                                                checked={q.correctAnswer === oIdx}
                                                                onChange={() => {
                                                                    const qs = [...formData.questions];
                                                                    qs[qIdx].correctAnswer = oIdx;
                                                                    setFormData({ ...formData, questions: qs });
                                                                }}
                                                            />
                                                            <input
                                                                type="text"
                                                                name={`option-${qIdx}-${oIdx}`}
                                                                aria-label={`Option ${oIdx + 1}`}
                                                                placeholder={`Option ${oIdx + 1}`}
                                                                className="flex-1 px-2 py-1 border rounded-md text-sm"
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const qs = [...formData.questions];
                                                                    qs[qIdx].options[oIdx] = e.target.value;
                                                                    setFormData({ ...formData, questions: qs });
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="text-xs text-blue-500 underline"
                                                        onClick={() => {
                                                            const qs = [...formData.questions];
                                                            qs[qIdx].options.push('');
                                                            setFormData({ ...formData, questions: qs });
                                                        }}
                                                    >
                                                        + Add Option
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                                >
                                    Add Lesson
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLessons;
