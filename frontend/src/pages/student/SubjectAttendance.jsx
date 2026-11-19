import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import reportService from "../../services/reportService";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ProgressBar from "../../components/ProgressBar";

const SubjectAttendance = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getStudentReport(user._id)
      .then((res) => setData(res))
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load subject attendance"))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader title="Subject-wise Attendance" subtitle="Your attendance percentage broken down by subject" />

      <div className="card">
        {!data || data.subjectWise.length === 0 ? (
          <EmptyState message="No subject attendance data available yet" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Total Classes</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th style={{ minWidth: 180 }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.subjectWise.map((s) => (
                  <tr key={s.subjectCode}>
                    <td>{s.subject} ({s.subjectCode})</td>
                    <td>{s.total}</td>
                    <td>{s.present}</td>
                    <td>{s.absent}</td>
                    <td>{s.late}</td>
                    <td><ProgressBar percentage={s.percentage} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectAttendance;
