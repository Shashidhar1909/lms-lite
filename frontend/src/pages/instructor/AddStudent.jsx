import React, { useState } from 'react';
import { UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddStudent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/users/student', formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/instructor');
            }, 2000);
        } catch (error) {
            alert('Failed to create student: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Created Successfully!</h2>
                    <p className="text-gray-600 mb-6">The student can now log in with their credentials.</p>
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <Link to="/instructor" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>
                <h2 className="text-3xl font-bold text-gray-900">Add New Student</h2>
                <p className="text-gray-500 mt-1">Create a student account that can enroll in your courses</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                            Student Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            placeholder="student@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            placeholder="Minimum 6 characters"
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-2 ml-1">
                            The student will use this password to log in. Make sure to share it with them securely.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Student Account
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 mb-2">💡 Quick Tip</h3>
                <p className="text-sm text-blue-800">
                    After creating the student account, they can immediately log in and enroll in your published courses.
                    You can track their progress from your instructor dashboard.
                </p>
            </div>
        </div>
    );
};

export default AddStudent;
