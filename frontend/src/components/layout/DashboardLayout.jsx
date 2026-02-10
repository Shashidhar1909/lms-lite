import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Users, BookOpen, Layout, LogOut, GraduationCap, Video, Menu, X, Upload, UserPlus
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
    <Link
        to={to}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </Link>
);

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-16 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center">
                        <GraduationCap className="w-8 h-8 mr-2" />
                        LMS Lite
                    </h1>
                </div>

                <nav className="p-4 space-y-2 mt-4">
                    {user.role === 'admin' && (
                        <>
                            <SidebarItem to="/admin" icon={Layout} label="Dashboard" active={location.pathname === '/admin'} />
                            <SidebarItem to="/admin/users" icon={Users} label="Manage Users" active={location.pathname.startsWith('/admin/users')} />
                            <SidebarItem to="/admin/courses" icon={BookOpen} label="Manage Courses" active={location.pathname.startsWith('/admin/courses')} />
                        </>
                    )}

                    {user.role === 'instructor' && (
                        <>
                            <SidebarItem to="/instructor" icon={Layout} label="Dashboard" active={location.pathname === '/instructor'} />
                            <SidebarItem to="/instructor/courses" icon={Video} label="My Courses" active={location.pathname === '/instructor/courses'} />
                            <SidebarItem to="/instructor/add-student" icon={UserPlus} label="Add Student" active={location.pathname === '/instructor/add-student'} />
                        </>
                    )}

                    {user.role === 'student' && (
                        <>
                            <SidebarItem to="/student" icon={Layout} label="Dashboard" active={location.pathname === '/student'} />
                            <SidebarItem to="/student/my-courses" icon={BookOpen} label="My Learning" active={location.pathname === '/student/my-courses'} />
                        </>
                    )}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>

                {/* Mobile close button */}
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-gray-500">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-100">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center space-x-4 ml-auto">
                        <div className="flex flex-col text-right">
                            <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                            <span className="text-xs text-blue-500 capitalize">{user.role}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
