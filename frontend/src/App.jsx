import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import AddStudent from "./pages/admin/AddStudent";
import EditStudent from "./pages/admin/EditStudent";
import ViewStudent from "./pages/admin/ViewStudent";
import Subjects from "./pages/admin/Subjects";
import Departments from "./pages/admin/Departments";
import MarkAttendance from "./pages/admin/MarkAttendance";
import AttendanceRecords from "./pages/admin/AttendanceRecords";
import Reports from "./pages/admin/Reports";
import LowAttendance from "./pages/admin/LowAttendance";
import AdminProfile from "./pages/admin/Profile";
import Settings from "./pages/admin/Settings";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentAttendance from "./pages/student/Attendance";
import AttendanceHistory from "./pages/student/AttendanceHistory";
import SubjectAttendance from "./pages/student/SubjectAttendance";
import ChangePassword from "./pages/student/ChangePassword";
import StudentMarkAttendance from "./pages/student/MarkAttendance";

import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="students/add" element={<AddStudent />} />
              <Route path="students/:id" element={<ViewStudent />} />
              <Route path="students/:id/edit" element={<EditStudent />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="departments" element={<Departments />} />
              <Route path="attendance/mark" element={<MarkAttendance />} />
              <Route path="attendance" element={<AttendanceRecords />} />
              <Route path="reports" element={<Reports />} />
              <Route path="low-attendance" element={<LowAttendance />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="attendance/mark" element={<StudentMarkAttendance />} />
              <Route path="attendance/history" element={<AttendanceHistory />} />
              <Route path="attendance/subjects" element={<SubjectAttendance />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </AuthProvider>
  );
}

export default App;
