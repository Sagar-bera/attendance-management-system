import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import attendanceService from "../../services/attendanceService";
import subjectService from "../../services/subjectService";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

const todayStr = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

const MarkAttendance = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => todayStr(), []);

  const loadData = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const [subjectRes, attendanceRes] = await Promise.all([
        subjectService.getSubjects({
          department: user.department,
          semester: user.semester,
        }),
        attendanceService.getStudentAttendance(user._id, { startDate: today, endDate: today }),
      ]);
      setSubjects(subjectRes.subjects || []);
      setRecords(attendanceRes.records || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, [user, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const markedSubjectIds = useMemo(
    () => new Set(records.map((r) => String(r.subject?._id || r.subject))),
    [records]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }

    setSaving(true);
    try {
      const res = await attendanceService.markSelfAttendance({
        subject: selectedSubject,
        date: today,
        remarks,
      });
      toast.success(res.message || "Attendance marked successfully");
      setRemarks("");
      setSelectedSubject("");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader
        title="Mark My Attendance"
        subtitle="Mark your own attendance for today's class"
      />

      <div className="grid-2" style={{ alignItems: "start", marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3><FiCheckCircle /> Today's Attendance</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-control" type="date" value={today} disabled />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select
                  className="form-control"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option
                      key={subject._id}
                      value={subject._id}
                      disabled={markedSubjectIds.has(String(subject._id))}
                    >
                      {subject.subjectName} ({subject.subjectCode})
                      {markedSubjectIds.has(String(subject._id)) ? " - Already Marked" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks (optional)</label>
                <input
                  className="form-control"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional note"
                  maxLength={200}
                />
              </div>

              <div className="warning-banner" style={{ marginBottom: 16 }}>
                <FiClock />
                <div>
                  <strong>Self attendance:</strong> You can mark only your own attendance and only once per subject today.
                </div>
              </div>

              <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
                <FiCheckCircle /> {saving ? "Marking..." : "Mark Me Present"}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Marked Today</h3>
          </div>
          {records.length === 0 ? (
            <EmptyState message="You have not marked attendance for any subject today." />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Subject</th><th>Status</th><th>Remarks</th></tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id}>
                      <td>{record.subject?.subjectName} ({record.subject?.subjectCode})</td>
                      <td><StatusBadge status={record.status} /></td>
                      <td>{record.remarks || "-"}</td>
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

export default MarkAttendance;
