import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiDownload } from "react-icons/fi";
import reportService from "../../services/reportService";
import studentService from "../../services/studentService";
import subjectService from "../../services/subjectService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

const todayStr = () => new Date().toISOString().slice(0, 10);
const thisMonthStr = () => new Date().toISOString().slice(0, 7);

// Converts an array of flat objects to a CSV string and triggers a browser download
const downloadCSV = (filename, rows) => {
  if (!rows || rows.length === 0) {
    toast.error("No data to export");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const TABS = [
  { id: "daily", label: "Daily Report" },
  { id: "monthly", label: "Monthly Report" },
  { id: "student", label: "Student Report" },
  { id: "subject", label: "Subject Report" },
];

const Reports = () => {
  const [tab, setTab] = useState("daily");

  const [date, setDate] = useState(todayStr());
  const [month, setMonth] = useState(thisMonthStr());
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);

  useEffect(() => {
    studentService.getStudents({ limit: 1000 }).then((res) => setStudents(res.students)).catch(() => {});
    subjectService.getSubjects().then((res) => setSubjects(res.subjects)).catch(() => {});
  }, []);

  const runDaily = async () => {
    setLoading(true);
    try {
      const res = await reportService.getDailyReport({ date });
      setDailyData(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const runMonthly = async () => {
    setLoading(true);
    try {
      const res = await reportService.getMonthlyReport({ month });
      setMonthlyData(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const runStudent = async () => {
    if (!studentId) { toast.error("Please select a student"); return; }
    setLoading(true);
    try {
      const res = await reportService.getStudentReport(studentId);
      setStudentData(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const runSubject = async () => {
    if (!subjectId) { toast.error("Please select a subject"); return; }
    setLoading(true);
    try {
      const res = await reportService.getSubjectReport(subjectId);
      setSubjectData(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Attendance Reports" subtitle="Generate daily, monthly, student and subject reports" />

      <div className="flex gap-8 mb-16" style={{ flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`btn btn-sm ${tab === t.id ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "daily" && (
        <div className="card">
          <div className="card-body">
            <div className="filter-bar">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} max={todayStr()} />
              </div>
              <button className="btn btn-primary" onClick={runDaily} disabled={loading}>
                {loading ? "Loading..." : "Generate"}
              </button>
              {dailyData && (
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    downloadCSV(
                      `daily-report-${dailyData.report.date}.csv`,
                      dailyData.records.map((r) => ({
                        Student: r.student?.name,
                        StudentID: r.student?.studentId,
                        Subject: r.subject?.subjectName,
                        Status: r.status,
                      }))
                    )
                  }
                >
                  <FiDownload /> Export CSV
                </button>
              )}
            </div>

            {loading ? (
              <Loader />
            ) : dailyData ? (
              <>
                <div className="stats-grid" style={{ marginTop: 16 }}>
                  <StatBox label="Total Students" value={dailyData.report.totalStudents} />
                  <StatBox label="Present" value={dailyData.report.present} />
                  <StatBox label="Absent" value={dailyData.report.absent} />
                  <StatBox label="Late" value={dailyData.report.late} />
                  <StatBox label="Attendance %" value={`${dailyData.report.percentage}%`} />
                </div>
                {dailyData.records.length === 0 ? (
                  <EmptyState message="No records for this date" />
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Student</th><th>Subject</th><th>Status</th></tr></thead>
                      <tbody>
                        {dailyData.records.map((r) => (
                          <tr key={r._id}>
                            <td>{r.student?.name} ({r.student?.studentId})</td>
                            <td>{r.subject?.subjectName}</td>
                            <td><StatusBadge status={r.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {tab === "monthly" && (
        <div className="card">
          <div className="card-body">
            <div className="filter-bar">
              <div className="form-group">
                <label className="form-label">Month</label>
                <input type="month" className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={runMonthly} disabled={loading}>
                {loading ? "Loading..." : "Generate"}
              </button>
              {monthlyData && (
                <button
                  className="btn btn-outline"
                  onClick={() => downloadCSV(`monthly-report-${monthlyData.report.month}.csv`, monthlyData.dailyBreakdown)}
                >
                  <FiDownload /> Export CSV
                </button>
              )}
            </div>

            {loading ? (
              <Loader />
            ) : monthlyData ? (
              <>
                <div className="stats-grid" style={{ marginTop: 16 }}>
                  <StatBox label="Total Records" value={monthlyData.report.totalRecords} />
                  <StatBox label="Present" value={monthlyData.report.present} />
                  <StatBox label="Absent" value={monthlyData.report.absent} />
                  <StatBox label="Late" value={monthlyData.report.late} />
                  <StatBox label="Attendance %" value={`${monthlyData.report.percentage}%`} />
                </div>
                {monthlyData.dailyBreakdown.length === 0 ? (
                  <EmptyState message="No records for this month" />
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Date</th><th>Present</th><th>Absent</th><th>Late</th></tr></thead>
                      <tbody>
                        {monthlyData.dailyBreakdown.map((d) => (
                          <tr key={d.date}>
                            <td>{d.date}</td><td>{d.present}</td><td>{d.absent}</td><td>{d.late}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {tab === "student" && (
        <div className="card">
          <div className="card-body">
            <div className="filter-bar">
              <div className="form-group" style={{ minWidth: 260 }}>
                <label className="form-label">Student</label>
                <select className="form-control" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                  <option value="">Select Student</option>
                  {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={runStudent} disabled={loading}>
                {loading ? "Loading..." : "Generate"}
              </button>
              {studentData && (
                <button
                  className="btn btn-outline"
                  onClick={() => downloadCSV(`student-report-${studentData.student.studentId}.csv`, studentData.subjectWise)}
                >
                  <FiDownload /> Export CSV
                </button>
              )}
            </div>

            {loading ? (
              <Loader />
            ) : studentData ? (
              <>
                <div className="stats-grid" style={{ marginTop: 16 }}>
                  <StatBox label="Total Classes" value={studentData.report.totalClasses} />
                  <StatBox label="Present" value={studentData.report.present} />
                  <StatBox label="Absent" value={studentData.report.absent} />
                  <StatBox label="Late" value={studentData.report.late} />
                  <StatBox label="Attendance %" value={`${studentData.report.percentage}%`} />
                </div>
                {studentData.subjectWise.length === 0 ? (
                  <EmptyState message="No attendance records for this student" />
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Subject</th><th>Total</th><th>Present</th><th>Absent</th><th>Late</th><th>Percentage</th></tr></thead>
                      <tbody>
                        {studentData.subjectWise.map((s) => (
                          <tr key={s.subjectCode}>
                            <td>{s.subject} ({s.subjectCode})</td>
                            <td>{s.total}</td><td>{s.present}</td><td>{s.absent}</td><td>{s.late}</td>
                            <td>{s.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {tab === "subject" && (
        <div className="card">
          <div className="card-body">
            <div className="filter-bar">
              <div className="form-group" style={{ minWidth: 260 }}>
                <label className="form-label">Subject</label>
                <select className="form-control" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  <option value="">Select Subject</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={runSubject} disabled={loading}>
                {loading ? "Loading..." : "Generate"}
              </button>
              {subjectData && (
                <button
                  className="btn btn-outline"
                  onClick={() => downloadCSV(`subject-report-${subjectData.subject.subjectCode}.csv`, subjectData.studentWise)}
                >
                  <FiDownload /> Export CSV
                </button>
              )}
            </div>

            {loading ? (
              <Loader />
            ) : subjectData ? (
              <>
                <div className="stats-grid" style={{ marginTop: 16 }}>
                  <StatBox label="Total Records" value={subjectData.report.totalRecords} />
                  <StatBox label="Present" value={subjectData.report.present} />
                  <StatBox label="Absent" value={subjectData.report.absent} />
                  <StatBox label="Late" value={subjectData.report.late} />
                  <StatBox label="Attendance %" value={`${subjectData.report.percentage}%`} />
                </div>
                {subjectData.studentWise.length === 0 ? (
                  <EmptyState message="No attendance records for this subject" />
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Student</th><th>Total</th><th>Present</th><th>Absent</th><th>Late</th><th>Percentage</th></tr></thead>
                      <tbody>
                        {subjectData.studentWise.map((s) => (
                          <tr key={s.studentId}>
                            <td>{s.student} ({s.studentId})</td>
                            <td>{s.total}</td><td>{s.present}</td><td>{s.absent}</td><td>{s.late}</td>
                            <td>{s.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value }) => (
  <div className="stat-card">
    <div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

export default Reports;
