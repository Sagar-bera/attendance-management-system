import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import attendanceService from "../../services/attendanceService";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import ProgressBar from "../../components/ProgressBar";

const monthKey = (dateStr) => dateStr.slice(0, 7);
const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
};

const AttendanceHistory = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    attendanceService.getStudentAttendance(user._id, {})
      .then((res) => setRecords(res.records))
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loader />;

  // Group records by month
  const groups = {};
  records.forEach((r) => {
    const key = monthKey(new Date(r.date).toISOString());
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  const monthKeys = Object.keys(groups).sort().reverse();

  return (
    <div>
      <PageHeader title="Attendance History" subtitle="Your full attendance history, grouped by month" />

      {monthKeys.length === 0 ? (
        <EmptyState message="No attendance history yet" />
      ) : (
        monthKeys.map((key) => {
          const monthRecords = groups[key];
          const present = monthRecords.filter((r) => r.status === "Present").length;
          const percentage = Math.round((present / monthRecords.length) * 100);
          const isOpen = expandedMonth === key;

          return (
            <div className="card" key={key} style={{ marginBottom: 16 }}>
              <div
                className="card-header"
                style={{ cursor: "pointer" }}
                onClick={() => setExpandedMonth(isOpen ? null : key)}
              >
                <h3>{monthLabel(key)}</h3>
                <div className="flex items-center gap-12" style={{ minWidth: 220 }}>
                  <span className="text-muted text-sm">{monthRecords.length} classes</span>
                  <div style={{ width: 120 }}>
                    <ProgressBar percentage={percentage} />
                  </div>
                </div>
              </div>
              {isOpen && (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Date</th><th>Subject</th><th>Status</th><th>Remarks</th></tr>
                    </thead>
                    <tbody>
                      {monthRecords
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((r) => (
                          <tr key={r._id}>
                            <td>{new Date(r.date).toLocaleDateString()}</td>
                            <td>{r.subject?.subjectName} ({r.subject?.subjectCode})</td>
                            <td><StatusBadge status={r.status} /></td>
                            <td>{r.remarks || "-"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AttendanceHistory;
