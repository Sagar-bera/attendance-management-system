import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiLayers, FiUsers, FiBook } from "react-icons/fi";
import studentService from "../../services/studentService";
import subjectService from "../../services/subjectService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const Departments = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [deptRes, studentsRes, subjectsRes] = await Promise.all([
          studentService.getDepartments(),
          studentService.getStudents({ limit: 1000 }),
          subjectService.getSubjects(),
        ]);

        const departments = deptRes.departments || [];
        const students = studentsRes.students || [];
        const subjects = subjectsRes.subjects || [];

        const data = departments.map((dept) => ({
          name: dept,
          studentCount: students.filter((s) => s.department === dept).length,
          subjectCount: subjects.filter((s) => s.department === dept).length,
        }));

        setRows(data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load departments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Departments are created automatically as students and subjects reference them"
      />

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <FiLayers size={18} style={{ marginTop: 2, color: "var(--primary)" }} />
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
            There is no separate department list to maintain &mdash; a department is created the
            moment you type a new department name while adding a Student or a Subject. This page
            gives you a read-only overview of every department currently in use.
          </p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState message="No departments yet. Add a student or subject to create one." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th><FiUsers /> Students</th>
                  <th><FiBook /> Subjects</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>{r.studentCount}</td>
                    <td>{r.subjectCount}</td>
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

export default Departments;
