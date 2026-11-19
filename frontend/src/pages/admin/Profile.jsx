import { useState } from "react";
import { toast } from "react-toastify";
import settingsService from "../../services/settingsService";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsService.updateAdminProfile(form);
      updateUser(res.admin);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "A";

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your admin account details" />

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <div className="flex items-center gap-12 mb-16">
            <div className="avatar" style={{ width: 60, height: 60, fontSize: 20 }}>{initials}</div>
            <div>
              <h2 style={{ margin: 0 }}>{user?.name}</h2>
              <div className="text-muted" style={{ textTransform: "capitalize" }}>{user?.role}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
