import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { FiCheckCircle, FiXCircle, FiClock, FiSave } from "react-icons/fi";
import studentService from "../../services/studentService";
import subjectService from "../../services/subjectService";
import attendanceService from "../../services/attendanceService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const todayStr = () => new Date().toISOString().slice(0, 10);

const MarkAttendance = () => {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [filters, setFilters] = useState({
    department: "",
    course: "",
    semester: "",
    section: "",
    subject: "",
    date: todayStr(),
  });

  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // studentId -> status
  const [remarksMap, setRemarksMap] = useState({}); // studentId -> remarks
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    studentService.getDepartments().then((res) => setDepartments(res.departments)).catch(() => {});
    subjectService.getSubjects().then((res) => setSubjects(res.subjects)).catch(() => {});
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const loadStudents = useCallback(async () => {
    if (!filters.department || !filters.semester) {
      toast.error("Please select a department and semester");
      return;
    }
    setLoading(true);
    try {
      const res = await attendanceService.getStudentsForMarking(filters);
      setStudents(res.students);
      const initialStatus = {};
      const initialRemarks = {};
      res.students.forEach((s) => {
        initialStatus[s._id] = s.existingStatus || "";
        initialRemarks[s._id] = "";
      });
      setStatusMap(initialStatus);
      setRemarksMap(initialRemarks);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const markAll = (status) => {
    const next = {};
    students.forEach((s) => { next[s._id] = status; });
    setStatusMap(next);
  };

  const handleSave = async () => {
    if (!filters.subject) {
      toast.error("Please select a subject");
      return;
    }
    const unmarked = students.filter((s) => !statusMap[s._id]);
    if (unmarked.length > 0) {
      toast.error(`Please mark attendance for all students (${unmarked.length} remaining)`);
      return;
    }

    setSaving(true);
    try {
      const entries = students.map((s) => ({
        student: s._id,
        status: statusMap[s._id],
        remarks: remarksMap[s._id] || "",
      }));
      const res = await attendanceService.bulkMarkAttendance({
        subject: filters.subject,
        date: filters.date,
        entries,
      });
      toast.success(res.message || "Attendance saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      (!filters.department || s.department === filters.department) &&
      (!filters.semester || String(s.semester) === String(filters.semester))
  );

  const markedCount = students.filter((s) => statusMap[s._id]).length;

  return (
    <div>
      <PageHeader title="Mark Attendance" subtitle="Select class details, then mark each student present, absent or late" />

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" name="date" value={filters.date} onChange={handleFilterChange} max={todayStr()} />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-control" name="department" value={filters.department} onChange={handleFilterChange}>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Course</label>
              <input className="form-control" name="course" value={filters.course} onChange={handleFilterChange} placeholder="e.g. B.Tech" />
            </div>
            <div className="form-group">
              <label className="form-label">Semester *</label>
              <select className="form-control" name="semester" value={filters.semester} onChange={handleFilterChange}>
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Section</label>
              <input className="form-control" name="section" value={filters.section} onChange={handleFilterChange} placeholder="e.g. A" />
            </div>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select className="form-control" name="subject" value={filters.subject} onChange={handleFilterChange}>
                <option value="">Select Subject</option>
                {filteredSubjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={loadStudents} disabled={loading}>
            {loading ? "Loading..." : "Load Students"}
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : students.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h3>
              {students.length} Students &middot; {markedCount}/{students.length} marked
            </h3>
            <div className="flex gap-8">
              <button className="btn btn-outline btn-sm" onClick={() => markAll("Present")}>
                <FiCheckCircle /> Mark All Present
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => markAll("Absent")}>
                <FiXCircle /> Mark All Absent
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.rollNumber || "-"}</td>
                    <td>{s.studentId}</td>
                    <td>{s.name}</td>
                    {["Present", "Absent", "Late"].map((status) => (
                      <td key={status} style={{ textAlign: "center" }}>
                        <input
                          type="radio"
                          name={`status-${s._id}`}
                          checked={statusMap[s._id] === status}
                          onChange={() => setStatusMap({ ...statusMap, [s._id]: status })}
                          style={{ width: 18, height: 18, cursor: "pointer" }}
                        />
                      </td>
                    ))}
                    <td>
                      <input
                        className="form-control"
                        style={{ minWidth: 140 }}
                        placeholder="Optional"
                        value={remarksMap[s._id] || ""}
                        onChange={(e) => setRemarksMap({ ...remarksMap, [s._id]: e.target.value })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: 20, borderTop: "1px solid var(--border)" }}>
            <button className="btn btn-success" onClick={handleSave} disabled={saving}>
              <FiSave /> {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FiClock}
          message="Select department and semester, then click 'Load Students' to begin marking attendance."
        />
      )}
    </div>
  );
};

export default MarkAttendance;
