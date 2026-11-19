import { useEffect, useState } from "react";
import {
  FiUsers,
  FiBook,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import dashboardService from "../../services/dashboardService";
import StatCard from "../../components/StatCard";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

const COLORS = ["#16a34a", "#dc2626", "#d97706"];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getAdminDashboard();
        setData(res);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <EmptyState message="Unable to load dashboard data" />;

  const { stats, charts, recentAttendance } = data;

  const presentVsAbsentData = [
    { name: "Present", value: charts.presentVsAbsent.present },
    { name: "Absent", value: charts.presentVsAbsent.absent },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Overview of attendance across the system" />

      <div className="stats-grid">
        <StatCard icon={<FiUsers />} label="Total Students" value={stats.totalStudents} color="#4f46e5" bg="#eef2ff" />
        <StatCard icon={<FiBook />} label="Total Subjects" value={stats.totalSubjects} color="#0284c7" bg="#e0f2fe" />
        <StatCard icon={<FiCheckCircle />} label="Present Today" value={stats.presentToday} color="#16a34a" bg="#dcfce7" />
        <StatCard icon={<FiXCircle />} label="Absent Today" value={stats.absentToday} color="#dc2626" bg="#fee2e2" />
        <StatCard icon={<FiTrendingUp />} label="Average Attendance" value={`${stats.averageAttendance}%`} color="#d97706" bg="#fef3c7" />
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header"><h3>Daily Attendance (Last 7 Days)</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={charts.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#16a34a" strokeWidth={2} />
                <Line type="monotone" dataKey="absent" stroke="#dc2626" strokeWidth={2} />
                <Line type="monotone" dataKey="late" stroke="#d97706" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Present vs Absent</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={presentVsAbsentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {presentVsAbsentData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Monthly Attendance (Last 6 Months)</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#16a34a" />
                <Bar dataKey="absent" fill="#dc2626" />
                <Bar dataKey="late" fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Department-wise Attendance %</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.departmentWise}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Recent Attendance</h3></div>
        <div className="card-body" style={{ padding: 0 }}>
          {recentAttendance.length === 0 ? (
            <EmptyState message="No attendance records yet" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((r) => (
                    <tr key={r._id}>
                      <td>{r.student?.name || "-"}</td>
                      <td>{r.student?.studentId || "-"}</td>
                      <td>{r.subject?.subjectName} ({r.subject?.subjectCode})</td>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
