import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import attendanceService from "../../services/attendanceService";
import subjectService from "../../services/subjectService";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

const StudentAttendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ subject: "", month: "", status: "", startDate: "", endDate: "" });

  useEffect(() => {
    subjectService.getSubjects().then((res) => setSubjects(res.subjects)).catch(() => {});
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getStudentAttendance(user._id, filters);
      setRecords(res.records);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div>
      <PageHeader title="My Attendance" subtitle="View and filter your attendance records" />

      <div className="filter-bar">
        <div className="form-group">
          <select className="form-control" name="subject" value={filters.subject} onChange={handleFilterChange}>
            <option value="">All Subjects</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
          </select>
        </div>
        <div className="form-group">
          <input type="month" className="form-control" name="month" value={filters.month} onChange={handleFilterChange} />
        </div>
        <div className="form-group">
          <select className="form-control" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">From</label>
          <input type="date" className="form-control" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
        </div>
        <div className="form-group">
          <label className="form-label">To</label>
          <input type="date" className="form-control" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : records.length === 0 ? (
          <EmptyState message="No attendance records found for the selected filters" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Subject</th><th>Subject Code</th><th>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.subject?.subjectName}</td>
                    <td>{r.subject?.subjectCode}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.remarks || "-"}</td>
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

export default StudentAttendance;
