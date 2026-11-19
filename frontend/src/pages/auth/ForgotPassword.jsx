import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import authService from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      setMessage(res.message);
      if (res.devResetToken) setDevToken(res.devResetToken);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <FiCalendar /> AttendSys
        </div>
        <p className="auth-subtitle">Reset your password</p>

        {error && <div className="auth-alert alert-danger">{error}</div>}
        {message && <div className="auth-alert alert-success">{message}</div>}

        {devToken && (
          <div className="demo-creds">
            <strong>Development mode:</strong> no email service is configured, so here is your
            reset token for testing:
            <br />
            <code style={{ wordBreak: "break-all" }}>{devToken}</code>
            <br />
            <Link to="/reset-password" state={{ token: devToken }} style={{ color: "var(--primary)", fontWeight: 600 }}>
              Continue to reset password &rarr;
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
