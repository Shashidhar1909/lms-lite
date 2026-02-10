import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Placeholder Components (We will create these next)
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import CoursePlayer from './pages/student/CoursePlayer';
import ManageLessons from './pages/instructor/ManageLessons';
import MyCourses from './pages/instructor/MyCourses';
import AddStudent from './pages/instructor/AddStudent';
import MyLearning from './pages/student/MyLearning';
import BulkImport from './pages/admin/BulkImport';
import CourseDetails from './pages/student/CourseDetails';

function App() {
    return (
        <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<DashboardLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<ManageUsers />} />
                            <Route path="users/bulk-import" element={<BulkImport />} />
                            <Route path="courses" element={<ManageCourses />} />
                            <Route path="course/:courseId/lessons" element={<ManageLessons />} />
                        </Route>
                    </Route>

                    {/* Instructor Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
                        <Route path="/instructor" element={<DashboardLayout />}>
                            <Route index element={<InstructorDashboard />} />
                            <Route path="courses" element={<MyCourses />} />
                            <Route path="add-student" element={<AddStudent />} />
                            <Route path="course/:courseId/lessons" element={<ManageLessons />} />
                        </Route>
                    </Route>

                    {/* Student Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                        <Route path="/student" element={<DashboardLayout />}>
                            <Route index element={<StudentDashboard />} />
                            <Route path="my-courses" element={<MyLearning />} />
                            <Route path="course-details/:courseId" element={<CourseDetails />} />
                            <Route path="course/:courseId" element={<CoursePlayer />} />
                        </Route>
                    </Route>


                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<div className="p-10 text-center">404 - Not Found</div>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
