import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiSearch, FiPlus, FiEye, FiEdit2, FiTrash2, FiKey } from "react-icons/fi";
import studentService from "../../services/studentService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import Modal from "../../components/Modal";

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getStudents({
        search,
        department,
        semester,
        section,
        page,
        limit: 10,
      });
      setStudents(res.students);
      setPages(res.pages);
      setTotal(res.total);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [search, department, semester, section, page]);

  useEffect(() => {
    studentService.getDepartments().then((res) => setDepartments(res.departments)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentService.deleteStudent(deleteTarget._id);
      toast.success("Student deleted successfully");
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setResetting(true);
    try {
      await studentService.resetPassword(resetTarget._id, newPassword);
      toast.success("Password reset successfully");
      setResetTarget(null);
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${total} student${total !== 1 ? "s" : ""} registered`}
        actions={
          <Link to="/admin/students/add" className="btn btn-primary">
            <FiPlus /> Add Student
          </Link>
        }
      />

      <div className="filter-bar">
        <div className="search-box">
          <FiSearch />
          <input
            className="form-control"
            placeholder="Search by name, ID, email, roll no..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="form-group">
          <select className="form-control" value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <select className="form-control" value={semester} onChange={(e) => { setSemester(e.target.value); setPage(1); }}>
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <input
            className="form-control"
            placeholder="Section"
            value={section}
            onChange={(e) => { setSection(e.target.value); setPage(1); }}
            style={{ width: 100 }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : students.length === 0 ? (
          <EmptyState message="No students found" />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Section</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id}>
                      <td>{s.studentId}</td>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.department}</td>
                      <td>{s.course}</td>
                      <td>{s.semester}</td>
                      <td>{s.section}</td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-outline btn-icon" title="View" onClick={() => navigate(`/admin/students/${s._id}`)}>
                            <FiEye />
                          </button>
                          <button className="btn btn-outline btn-icon" title="Edit" onClick={() => navigate(`/admin/students/${s._id}/edit`)}>
                            <FiEdit2 />
                          </button>
                          <button className="btn btn-outline btn-icon" title="Reset Password" onClick={() => setResetTarget(s)}>
                            <FiKey />
                          </button>
                          <button className="btn btn-outline btn-icon" title="Delete" onClick={() => setDeleteTarget(s)} style={{ color: "var(--danger)" }}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "0 20px 16px" }}>
              <Pagination page={page} pages={pages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This will also remove all their attendance records. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {resetTarget && (
        <Modal title={`Reset Password: ${resetTarget.name}`} onClose={() => setResetTarget(null)}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="text"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>
          <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={() => setResetTarget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleResetPassword} disabled={resetting}>
              {resetting ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Students;
