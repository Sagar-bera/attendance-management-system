import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FiHome, FiUser, FiCheckCircle, FiClock, FiBookOpen, FiLock } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const links = [
  { to: "/student/dashboard", label: "Dashboard", icon: <FiHome />, end: true },
  { to: "/student/profile", label: "My Profile", icon: <FiUser /> },
  { to: "/student/attendance", label: "My Attendance", icon: <FiCheckCircle /> },
  { to: "/student/attendance/mark", label: "Mark Attendance", icon: <FiCheckCircle /> },
  { to: "/student/attendance/history", label: "Attendance History", icon: <FiClock /> },
  { to: "/student/attendance/subjects", label: "Subject Attendance", icon: <FiBookOpen /> },
  { to: "/student/change-password", label: "Change Password", icon: <FiLock /> },
];

const pageTitle = (pathname) => {
  const match = links.find((l) => pathname.startsWith(l.to));
  return match ? match.label : "Student Portal";
};

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar links={links} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={pageTitle(location.pathname)} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
