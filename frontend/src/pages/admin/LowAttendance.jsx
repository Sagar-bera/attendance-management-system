import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { FiAlertTriangle } from "react-icons/fi";
import reportService from "../../services/reportService";
import settingsService from "../../services/settingsService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ProgressBar from "../../components/ProgressBar";

const LowAttendance = () => {
  const [threshold, setThreshold] = useState(75);
  const [inputThreshold, setInputThreshold] = useState(75);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (t) => {
    setLoading(true);
    try {
      const res = await reportService.getLowAttendance(t ? { threshold: t } : {});
      setStudents(res.students);
      setThreshold(res.threshold);
      setInputThreshold(res.threshold);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load low attendance students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    settingsService.getSettings().then((res) => {
      fetchData(res.settings.lowAttendanceThreshold);
    }).catch(() => fetchData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        title="Low Attendance Students"
        subtitle={`Students currently below ${threshold}% attendance`}
      />

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body filter-bar" style={{ marginBottom: 0 }}>
          <div className="form-group">
            <label className="form-label">View Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="form-control"
              value={inputThreshold}
              onChange={(e) => setInputThreshold(e.target.value)}
              style={{ width: 120 }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => fetchData(inputThreshold)}>
            Apply
          </button>
          <p className="text-muted text-sm" style={{ margin: 0 }}>
            This only changes the view. To change the system-wide default, go to Settings.
          </p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : students.length === 0 ? (
          <EmptyState
            icon={FiAlertTriangle}
            title="Great news!"
            message={`No students are currently below ${threshold}% attendance.`}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Total Classes</th>
                  <th>Present</th>
                  <th style={{ minWidth: 160 }}>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.studentId}</td>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td>{s.semester}</td>
                    <td>{s.totalClasses}</td>
                    <td>{s.present}</td>
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

export default LowAttendance;
