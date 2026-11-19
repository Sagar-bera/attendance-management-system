import { useState } from "react";
import { toast } from "react-toastify";
import authService from "../../services/authService";
import PageHeader from "../../components/PageHeader";

const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = "Current password is required";
    if (!form.newPassword || form.newPassword.length < 6) {
      errs.newPassword = "New password must be at least 6 characters";
    }
    if (form.newPassword !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Change Password" subtitle="Update your account password" />

      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
              />
              {errors.currentPassword && <div className="form-error">{errors.currentPassword}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
              />
              {errors.newPassword && <div className="form-error">{errors.newPassword}</div>}
              <div className="form-hint">Minimum 6 characters.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
