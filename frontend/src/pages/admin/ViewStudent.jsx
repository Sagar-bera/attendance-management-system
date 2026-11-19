import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import studentService from "../../services/studentService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import CircularProgress from "../../components/CircularProgress";

const ViewStudent = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentService.getStudentById(id),
      studentService.getAttendanceSummary(id),
    ]).then(([sRes, aRes]) => {
      setStudent(sRes.student);
      setSummary(aRes.summary);
    }).catch((err) => {
      toast.error(err.response?.data?.message || "Failed to load student");
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!student) return null;

  const initials = student.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <PageHeader
        title="Student Details"
        actions={
          <>
            <Link to="/admin/students" className="btn btn-outline"><FiArrowLeft /> Back</Link>
            <Link to={`/admin/students/${id}/edit`} className="btn btn-primary"><FiEdit2 /> Edit</Link>
          </>
        }
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-12 mb-16">
              <div className="avatar" style={{ width: 60, height: 60, fontSize: 20 }}>{initials}</div>
              <div>
                <h2 style={{ margin: 0 }}>{student.name}</h2>
                <div className="text-muted">{student.studentId}</div>
              </div>
            </div>
            <table className="data-table">
              <tbody>
                <tr><td style={{ fontWeight: 600 }}>Email</td><td>{student.email}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Phone</td><td>{student.phone || "-"}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Gender</td><td>{student.gender || "-"}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Date of Birth</td><td>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-"}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Department</td><td>{student.department}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Course</td><td>{student.course}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Semester</td><td>{student.semester}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Section</td><td>{student.section}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Roll Number</td><td>{student.rollNumber || "-"}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Attendance Summary</h3></div>
          <div className="card-body" style={{ textAlign: "center" }}>
            {summary && (
              <>
                <CircularProgress percentage={summary.percentage} />
                <div className="mt-16" style={{ display: "flex", justifyContent: "space-around" }}>
                  <div><div style={{ fontWeight: 700 }}>{summary.present}</div><div className="text-muted text-sm">Present</div></div>
                  <div><div style={{ fontWeight: 700 }}>{summary.absent}</div><div className="text-muted text-sm">Absent</div></div>
                  <div><div style={{ fontWeight: 700 }}>{summary.late}</div><div className="text-muted text-sm">Late</div></div>
                  <div><div style={{ fontWeight: 700 }}>{summary.total}</div><div className="text-muted text-sm">Total</div></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudent;
