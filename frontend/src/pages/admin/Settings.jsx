import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import settingsService from "../../services/settingsService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";

const Settings = () => {
  const [threshold, setThreshold] = useState(75);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getSettings()
      .then((res) => setThreshold(res.settings.lowAttendanceThreshold))
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings({ lowAttendanceThreshold: Number(threshold) });
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader title="Settings" subtitle="System-wide configuration" />

      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-header"><h3>Low Attendance Threshold</h3></div>
        <div className="card-body">
          <p className="text-muted text-sm mb-16">
            Students whose attendance falls below this percentage will be flagged on the Low
            Attendance page and shown a warning on their dashboard.
          </p>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Threshold (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
