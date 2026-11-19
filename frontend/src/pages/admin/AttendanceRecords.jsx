import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import attendanceService from "../../services/attendanceService";
import subjectService from "../../services/subjectService";
import studentService from "../../services/studentService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";

const AttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    date: "",
    subject: "",
    department: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", remarks: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    subjectService.getSubjects().then((res) => setSubjects(res.subjects)).catch(() => {});
    studentService.getDepartments().then((res) => setDepartments(res.departments)).catch(() => {});
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getAttendance({ ...filters, page, limit: 15 });
      setRecords(res.records);
      setPages(res.pages);
      setTotal(res.total);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const openEdit = (record) => {
    setEditTarget(record);
    setEditForm({ status: record.status, remarks: record.remarks || "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await attendanceService.updateAttendance(editTarget._id, editForm);
      toast.success("Attendance record updated");
      setEditTarget(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update record");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await attendanceService.deleteAttendance(deleteTarget._id);
      toast.success("Attendance record deleted");
      setDeleteTarget(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Attendance Records" subtitle={`${total} record${total !== 1 ? "s" : ""} found`} />

      <div className="filter-bar">
        <div className="search-box">
          <FiSearch />
          <input
            className="form-control"
            placeholder="Search by student or subject..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <input type="date" className="form-control" name="date" value={filters.date} onChange={handleFilterChange} />
        </div>
        <div className="form-group">
          <select className="form-control" name="subject" value={filters.subject} onChange={handleFilterChange}>
            <option value="">All Subjects</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
          </select>
        </div>
        <div className="form-group">
          <select className="form-control" name="department" value={filters.department} onChange={handleFilterChange}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <select className="form-control" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : records.length === 0 ? (
          <EmptyState message="No attendance records match your filters" />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Marked By</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{r.student?.name || "-"}</td>
                      <td>{r.student?.studentId || "-"}</td>
                      <td>{r.subject?.subjectName} ({r.subject?.subjectCode})</td>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>{r.markedBy?.name || "-"}</td>
                      <td>{r.remarks || "-"}</td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-outline btn-icon" title="Edit" onClick={() => openEdit(r)}>
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn btn-outline btn-icon"
                            title="Delete"
                            style={{ color: "var(--danger)" }}
                            onClick={() => setDeleteTarget(r)}
                          >
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

      {editTarget && (
        <Modal title="Edit Attendance Record" onClose={() => setEditTarget(null)}>
          <form onSubmit={handleUpdate}>
            <p className="text-muted text-sm mb-16">
              {editTarget.student?.name} &middot; {editTarget.subject?.subjectName} &middot;{" "}
              {new Date(editTarget.date).toLocaleDateString()}
            </p>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Remarks</label>
              <input
                className="form-control"
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
              />
            </div>
            <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditTarget(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default AttendanceRecords;
