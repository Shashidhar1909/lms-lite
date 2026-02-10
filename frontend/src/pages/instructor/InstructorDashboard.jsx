import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import { BookOpen, Users, Plus, Settings, Video, FileText, Layout, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveLinks, setLiveLinks] = useState({}); // { courseId: link }
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        thumbnail: '',
        duration: '',
        level: 'Beginner',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, studentsRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/enrollments/instructor-students')
                ]);

                setCourses(coursesRes.data);
                setStudents(studentsRes.data.filter(s => s.course && s.student));

                // Initialize live links state
                const links = {};
                coursesRes.data.forEach(c => {
                    links[c._id] = c.liveClassLink || '';
                });
                setLiveLinks(links);

            } catch (error) {
                console.error("Failed to fetch instructor data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdateLiveLink = async (courseId) => {
        try {
            const link = liveLinks[courseId];
            await api.put(`/courses/${courseId}/live`, { link });
            alert("Live link updated successfully!");
        } catch (error) {
            console.error("Failed to update live link", error);
            alert("Update failed");
        }
    };

    const handleLinkChange = (courseId, value) => {
        setLiveLinks(prev => ({ ...prev, [courseId]: value }));
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses', formData);
            setShowModal(false);
            setFormData({ title: '', description: '', category: '', duration: '', thumbnail: '', level: 'Beginner' });
            window.location.reload(); // Refresh to show new course
        } catch (error) {
            alert('Failed to create course');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Instructor Dashboard</h2>
                    <p className="text-gray-500">Welcome back! Here's how your students and courses are doing.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition font-medium"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                    title="My Assigned Courses"
                    value={courses.length}
                    icon={BookOpen}
                    color="text-indigo-600"
                    bgColor="bg-indigo-50"
                />

                <Card
                    title="Total Students Enrolled"
                    value={students.length}
                    icon={Users}
                    color="text-teal-600"
                    bgColor="bg-teal-50"
                />
            </div>

            {/* Course & Content Management */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Layout className="w-5 h-5 mr-2 text-indigo-500" />
                    Course Management
                </h3>
                <div className="space-y-4">
                    {courses.map(course => (
                        <div key={course._id} className="flex flex-col space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-800 text-lg">{course.title}</h4>
                                        {course.adminApproved ? (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full">Approved</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase font-bold rounded-full">Pending Approval</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">Enable real-time interaction for this course.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        to={`/instructor/course/${course._id}/lessons`}
                                        className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
                                    >
                                        <Settings className="w-4 h-4 mr-2 text-gray-400" />
                                        Manage Lessons
                                    </Link>
                                    <button
                                        onClick={() => handleUpdateLiveLink(course._id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition"
                                    >
                                        Update Link
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200">
                                <div className="pl-3 pr-2">
                                    <Video className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name={`liveLink-${course._id}`}
                                    aria-label={`Live Class URL for ${course.title}`}
                                    placeholder="Live Class URL (Zoom, Google Meet, etc.)"
                                    value={liveLinks[course._id] || ''}
                                    onChange={(e) => handleLinkChange(course._id, e.target.value)}
                                    className="flex-grow py-2 bg-transparent text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                    ))}
                    {courses.length === 0 && <p className="text-gray-500 text-center py-4">No courses assigned yet.</p>}
                </div>
            </div>

            {/* Create Course Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Create New Course</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCourse} className="space-y-5">
                            <div>
                                <label htmlFor="courseTitle" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Course Title</label>
                                <input
                                    id="courseTitle"
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    placeholder="e.g. Advanced React Patterns"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="courseDescription" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Description</label>
                                <textarea
                                    id="courseDescription"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-24 resize-none"
                                    placeholder="Briefly describe what students will learn..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="courseCategory" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Category</label>
                                    <input
                                        id="courseCategory"
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        placeholder="e.g. Development"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="courseLevel" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Level</label>
                                    <select
                                        id="courseLevel"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        required
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="courseDuration" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Duration</label>
                                    <input
                                        id="courseDuration"
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. 10h 30m"
                                        value={formData.duration || ''}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="courseThumbnail" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Thumbnail</label>
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex space-x-2">
                                            <input
                                                id="courseThumbnail"
                                                type="text"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-500"
                                                placeholder="Upload Image"
                                                value={formData.thumbnail || ''}
                                                readOnly
                                            />
                                            <label className="flex items-center justify-center px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition">
                                                <Upload className="w-5 h-5 mr-1" />
                                                <span className="text-sm font-bold">Upload</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;

                                                        const data = new FormData();
                                                        data.append('image', file);

                                                        try {
                                                            const res = await api.post('/upload', data, {
                                                                headers: {
                                                                    'Content-Type': 'multipart/form-data',
                                                                },
                                                            });
                                                            setFormData({ ...formData, thumbnail: `http://localhost:5000${res.data.filePath}` });
                                                        } catch (error) {
                                                            console.error('Upload failed', error);
                                                            alert('Image upload failed');
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        {formData.thumbnail && (
                                            <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
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
                                    Create Course
                                </button>
                            </div>
                        </form>
                        <p className="text-xs text-center text-gray-400 mt-6 italic">
                            * Courses require admin approval before they can be published.
                        </p>
                    </div>
                </div >
            )}

            {/* Student Progress List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">My Students & Progress</h3>
                    <p className="text-sm text-gray-500 mt-1">Detailed tracking of student engagement in your courses.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Student</th>
                                <th className="px-6 py-4 font-semibold">Course</th>
                                <th className="px-6 py-4 font-semibold">Join Date</th>
                                <th className="px-6 py-4 font-semibold">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
                                                {item.student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{item.student.name}</p>
                                                <p className="text-xs text-gray-500">{item.student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700 font-medium">{item.course.title}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-grow bg-gray-100 rounded-full h-1.5 mr-3 w-24">
                                                <div
                                                    className="bg-green-500 h-1.5 rounded-full"
                                                    style={{ width: `${item.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{Math.round(item.progress)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                                        No students enrolled in your courses yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default InstructorDashboard;
