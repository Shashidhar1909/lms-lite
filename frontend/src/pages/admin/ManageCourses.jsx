import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Settings, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        instructorId: '',
        duration: '',
        thumbnail: '',
        level: 'Beginner',
    });
    const [editingCourse, setEditingCourse] = useState(null);
    const [instructors, setInstructors] = useState([]);

    useEffect(() => {
        fetchCourses();
        fetchInstructors();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses');
            setCourses(res.data);
        } catch (error) {
            console.error("Failed to fetch courses");
        }
    };

    const fetchInstructors = async () => {
        try {
            const res = await api.get('/users');
            setInstructors(res.data.filter(u => u.role === 'instructor'));
        } catch (error) {
            console.error("Failed to fetch instructors");
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/courses/${id}`);
                setCourses(courses.filter(c => c._id !== id));
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const handlePublishToggle = async (course) => {
        try {
            await api.put(`/courses/${course._id}`, { isPublished: !course.isPublished });
            fetchCourses();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update');
        }
    }

    const handleApprovalToggle = async (course) => {
        try {
            await api.put(`/courses/${course._id}`, { adminApproved: !course.adminApproved });
            fetchCourses();
        } catch (error) {
            alert('Failed to update approval status');
        }
    }

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description || '',
            category: course.category,
            instructorId: course.instructor?._id || course.instructor || '',
            duration: course.duration || '',
            thumbnail: course.thumbnail || '',
            level: course.level || 'Beginner',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await api.put(`/courses/${editingCourse._id}`, formData);
            } else {
                await api.post('/courses', formData);
            }
            setShowModal(false);
            setEditingCourse(null);
            setFormData({ title: '', description: '', category: '', instructorId: '', duration: '', thumbnail: '', level: 'Beginner' });
            fetchCourses();
        } catch (error) {
            alert(`Failed to ${editingCourse ? 'update' : 'create'} course`);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Courses</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Instructor</th>
                            <th className="p-4">Approval</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map(course => (
                            <tr key={course._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-800">{course.title}</td>
                                <td className="p-4 text-gray-600">{course.instructor?.name || 'Unknown'}</td>
                                <td className="p-4">
                                    <button onClick={() => handleApprovalToggle(course)} className="focus:outline-none">
                                        {course.adminApproved ? (
                                            <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100"><CheckCircle className="w-4 h-4 mr-1" /> Approved</span>
                                        ) : (
                                            <span className="flex items-center text-amber-600 text-sm font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-100"><XCircle className="w-4 h-4 mr-1" /> Pending</span>
                                        )}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => handlePublishToggle(course)} className="focus:outline-none">
                                        {course.isPublished ? (
                                            <span className="flex items-center text-indigo-600 text-sm font-semibold hover:text-indigo-800"><CheckCircle className="w-4 h-4 mr-1" /> Published</span>
                                        ) : (
                                            <span className="flex items-center text-gray-400 text-sm hover:text-gray-600"><XCircle className="w-4 h-4 mr-1" /> Draft</span>
                                        )}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="text-gray-400 hover:text-blue-600 transition"
                                            title="Edit Course"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <Link
                                            to={`/admin/course/${course._id}/lessons`}
                                            className="text-gray-400 hover:text-indigo-600 transition"
                                            title="Manage Lessons"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            className="text-gray-400 hover:text-red-600 transition"
                                            title="Delete Course"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {courses.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">No courses found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Course Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingCourse(null);
                                    setFormData({ title: '', description: '', category: '', instructorId: '', duration: '', thumbnail: '', level: 'Beginner' });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                                <input
                                    id="courseTitle"
                                    type="text"
                                    className="input-field"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    id="courseDescription"
                                    className="input-field h-24 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="courseCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        id="courseCategory"
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Development"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="courseLevel" className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                    <select
                                        id="courseLevel"
                                        className="input-field"
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
                                    <label htmlFor="courseDuration" className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <input
                                        id="courseDuration"
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. 10h 30m"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="courseThumbnail" className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex space-x-2">
                                            <input
                                                id="courseThumbnail"
                                                type="text"
                                                className="input-field bg-gray-50 flex-grow"
                                                placeholder="Upload image"
                                                value={formData.thumbnail}
                                                readOnly
                                            />
                                            <label className="flex items-center justify-center px-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition whitespace-nowrap text-sm font-medium">
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload
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
                                                                headers: { 'Content-Type': 'multipart/form-data' },
                                                            });
                                                            setFormData({ ...formData, thumbnail: `http://localhost:5000${res.data.filePath}` });
                                                        } catch (error) {
                                                            alert('Upload failed');
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        {formData.thumbnail && (
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="courseInstructor" className="block text-sm font-medium text-gray-700 mb-1">Assign Instructor</label>
                                <select
                                    id="courseInstructor"
                                    className="input-field"
                                    value={formData.instructorId}
                                    onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Instructor</option>
                                    {instructors.map(inst => (
                                        <option key={inst._id} value={inst._id}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {editingCourse ? 'Save Changes' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCourses;
