import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import subjectService from "../../services/subjectService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";

const emptyForm = { subjectName: "", subjectCode: "", department: "", semester: "", teacherName: "" };

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subjectService.getSubjects();
      setSubjects(res.subjects);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (s) => {
    setForm({ subjectName: s.subjectName, subjectCode: s.subjectCode, department: s.department, semester: s.semester, teacherName: s.teacherName });
    setEditingId(s._id);
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await subjectService.updateSubject(editingId, form);
        toast.success("Subject updated successfully");
      } else {
        await subjectService.createSubject(form);
        toast.success("Subject created successfully");
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await subjectService.deleteSubject(deleteTarget._id);
      toast.success("Subject deleted successfully");
      setDeleteTarget(null);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete subject");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle={`${subjects.length} subject${subjects.length !== 1 ? "s" : ""}`}
        actions={<button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Subject</button>}
      />

      <div className="card">
        {loading ? <Loader /> : subjects.length === 0 ? <EmptyState message="No subjects found" /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Name</th><th>Code</th><th>Department</th><th>Semester</th><th>Teacher</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s._id}>
                    <td>{s.subjectName}</td>
                    <td>{s.subjectCode}</td>
                    <td>{s.department}</td>
                    <td>{s.semester}</td>
                    <td>{s.teacherName || "-"}</td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-outline btn-icon" onClick={() => openEdit(s)}><FiEdit2 /></button>
                        <button className="btn btn-outline btn-icon" style={{ color: "var(--danger)" }} onClick={() => setDeleteTarget(s)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Edit Subject" : "Add Subject"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input className="form-control" name="subjectName" value={form.subjectName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Code *</label>
              <input className="form-control" name="subjectCode" value={form.subjectCode} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <input className="form-control" name="department" value={form.department} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Semester *</label>
                <input type="number" min="1" max="12" className="form-control" name="semester" value={form.semester} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Teacher Name</label>
              <input className="form-control" name="teacherName" value={form.teacherName} onChange={handleChange} />
            </div>
            <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subject"
        message={`Delete "${deleteTarget?.subjectName}"? This will also remove all related attendance records.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default Subjects;
