import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiClock, FiBook } from "react-icons/fi";
import dashboardService from "../../services/dashboardService";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import CircularProgress from "../../components/CircularProgress";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStudentDashboard()
      .then((res) => setData(res))
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!data) return <EmptyState message="Unable to load dashboard data" />;

  const { summary, recentRecords } = data;

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name?.split(" ")[0] || "Student"}`} subtitle="Here's your attendance overview" />

      {summary.isLow && (
        <div className="warning-banner">
          <FiAlertTriangle />
          <div>
            Your attendance is <strong>{summary.percentage}%</strong>, which is below the required{" "}
            {summary.threshold}%. You need to attend more classes to improve your attendance.
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Overall Attendance</h3></div>
          <div className="card-body" style={{ textAlign: "center" }}>
            <CircularProgress percentage={summary.percentage} />
          </div>
        </div>

        <div>
          <div className="stats-grid" style={{ marginBottom: 0, gridTemplateColumns: "repeat(2, 1fr)" }}>
            <StatCard icon={<FiCheckCircle />} label="Present Days" value={summary.present} color="#16a34a" bg="#dcfce7" />
            <StatCard icon={<FiXCircle />} label="Absent Days" value={summary.absent} color="#dc2626" bg="#fee2e2" />
            <StatCard icon={<FiClock />} label="Late Days" value={summary.late} color="#d97706" bg="#fef3c7" />
            <StatCard icon={<FiBook />} label="Total Classes" value={summary.totalClasses} color="#4f46e5" bg="#eef2ff" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Recent Attendance</h3></div>
        <div className="card-body" style={{ padding: 0 }}>
          {recentRecords.length === 0 ? (
            <EmptyState message="No attendance records yet" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Subject</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recentRecords.map((r) => (
                    <tr key={r._id}>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>{r.subject?.subjectName} ({r.subject?.subjectCode})</td>
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

export default StudentDashboard;
