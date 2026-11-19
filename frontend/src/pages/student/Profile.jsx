import { useState } from "react";
import { toast } from "react-toastify";
import studentService from "../../services/studentService";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    semester: user.semester || "",
    
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await studentService.updateStudent(user._id, form);
      updateUser(res.student);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "S";

  return (
    <div>
      <PageHeader title="My Profile" subtitle="View and update your personal information" />

      <div className="grid-2">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-12 mb-16">
              <div className="avatar" style={{ width: 60, height: 60, fontSize: 20 }}>{initials}</div>
              <div>
                <h2 style={{ margin: 0 }}>{user?.name}</h2>
                <div className="text-muted">{user?.studentId}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Semester</label>
                <input className="form-control" name="semester" value={form.semester} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                {/* <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div> */}
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Academic Details</h3></div>
          <div className="card-body">
            <table className="data-table">
              <tbody>
                <tr><td style={{ fontWeight: 600 }}>Student ID</td><td>{user?.studentId}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Email</td><td>{user?.email}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Department</td><td>{user?.department}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Course</td><td>{user?.course}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Semester</td><td>{user?.semester}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Section</td><td>{user?.section}</td></tr>
                <tr><td style={{ fontWeight: 600 }}>Roll Number</td><td>{user?.rollNumber || "-"}</td></tr>
              </tbody>
            </table>
            <p className="text-muted text-sm mt-16">
              Academic details are managed by the administration. Contact your admin if any of
              this information needs to be corrected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
