import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Shield, User, Upload, Edit, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'instructor', // Default to instructor for "Add Instructor" action
    });
    const [editingUser, setEditingUser] = useState(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser._id}`, formData);
            } else {
                await api.post('/users', formData);
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'instructor' });
            fetchUsers();
        } catch (error) {
            console.error("User action error:", error);
            const msg = error.response?.data?.message || error.message || 'Action failed';
            alert(`Error: ${msg}`);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Manage Users</h2>
                    <p className="text-gray-500 mt-1">Create and manage user accounts</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/admin/users/bulk-import"
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Import
                    </Link>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Pending Approvals Section */}
            {users.some(u => !u.isApproved) && (
                <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-100 overflow-hidden mb-8">
                    <div className="p-4 border-b border-amber-100 bg-amber-100/50 flex justify-between items-center">
                        <h3 className="font-bold text-amber-900 flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            Pending Approvals
                        </h3>
                        <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                            {users.filter(u => !u.isApproved).length} Pending
                        </span>
                    </div>
                    <table className="w-full text-left">
                        <thead className="text-amber-900/50 font-semibold text-sm">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => !u.isApproved).map(user => (
                                <tr key={user._id} className="border-b border-amber-100 last:border-0 hover:bg-amber-100/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">{user.name}</td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className="bg-white border border-amber-200 text-amber-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.put(`/users/${user._id}/approve`);
                                                    alert(`Approved ${user.name}`);
                                                    fetchUsers();
                                                } catch (err) {
                                                    alert('Approval failed');
                                                }
                                            }}
                                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">All Users</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter(u => u.isApproved !== false).map(user => (
                            <tr key={user._id} className="border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors">
                                <td className="p-4 font-medium text-gray-800 flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mr-3 font-bold text-sm uppercase shadow-sm">
                                        {user.name.charAt(0)}
                                    </div>
                                    {user.name}
                                </td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4 flex items-center space-x-2">
                                    {user.isRoot && (
                                        <div className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm border border-yellow-200">
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            ROOT
                                        </div>
                                    )}
                                    <span className={`px-3 py-1.5 text-xs rounded-full font-bold capitalize shadow-sm
                                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                            user.role === 'instructor' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        {/* RBAC Visibility Rules */}
                                        {((currentUser.isRoot && !user.isRoot) ||
                                            (!currentUser.isRoot && user.role !== 'admin' && !user.isRoot)) && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition"
                                                        title="Edit user"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="text-gray-400 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">{editingUser ? 'Edit User Details' : 'Add New User'}</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingUser(null);
                                    setFormData({ name: '', email: '', password: '', role: 'instructor' });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="userName" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                                <input
                                    id="userName"
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="userEmail" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email</label>
                                <input
                                    id="userEmail"
                                    type="email"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="userPassword" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password {editingUser && '(Leave blank to keep current)'}</label>
                                <input
                                    id="userPassword"
                                    type="password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:opacity-50"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    disabled={editingUser}
                                    placeholder={editingUser ? "Password cannot be changed here" : "Minimum 6 characters"}
                                />
                            </div>
                            {/* Role change only for Root or when not editing another admin */}
                            {(currentUser.isRoot || (editingUser && editingUser.role !== 'admin') || !editingUser) && (
                                <div>
                                    <label htmlFor="userRole" className="block text-sm font-bold text-gray-700 mb-2 ml-1">Role</label>
                                    <select
                                        id="userRole"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="instructor">Instructor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                                >
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
