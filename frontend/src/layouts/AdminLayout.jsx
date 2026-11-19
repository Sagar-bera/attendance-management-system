import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiLayers,
  FiCheckSquare,
  FiList,
  FiPieChart,
  FiAlertTriangle,
  FiUser,
  FiSettings,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <FiHome />, end: true },
  { to: "/admin/students", label: "Students", icon: <FiUsers /> },
  { to: "/admin/subjects", label: "Subjects", icon: <FiBook /> },
  { to: "/admin/departments", label: "Departments", icon: <FiLayers /> },
  { to: "/admin/attendance/mark", label: "Mark Attendance", icon: <FiCheckSquare /> },
  { to: "/admin/attendance", label: "Attendance Records", icon: <FiList /> },
  { to: "/admin/reports", label: "Attendance Reports", icon: <FiPieChart /> },
  { to: "/admin/low-attendance", label: "Low Attendance", icon: <FiAlertTriangle /> },
  { to: "/admin/profile", label: "Profile", icon: <FiUser /> },
  { to: "/admin/settings", label: "Settings", icon: <FiSettings /> },
];

const pageTitle = (pathname) => {
  const match = links.find((l) => pathname.startsWith(l.to));
  return match ? match.label : "Admin Portal";
};

const AdminLayout = () => {
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

export default AdminLayout;
