import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCalendar, FiEye, FiEyeOff } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("email"); // "email" | "studentId"
  const [form, setForm] = useState({ email: "", studentId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload =
        loginMode === "email"
          ? { email: form.email, password: form.password }
          : { studentId: form.studentId, password: form.password };

      const user = await login(payload);
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="auth-alert alert-danger">{error}</div>}

        <div className="flex gap-8 mb-16">
          <button
            type="button"
            className={`btn btn-sm ${loginMode === "email" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setLoginMode("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={`btn btn-sm ${loginMode === "studentId" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setLoginMode("studentId")}
          >
            Student ID
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {loginMode === "email" ? (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input
                className="form-control"
                type="text"
                name="studentId"
                placeholder="ST001"
                value={form.studentId}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                className="form-control"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="input-group-icon"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-16" style={{ fontSize: 13 }}>
            <label className="flex items-center gap-8">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Register as Student</Link>
        </div>

        {/* <div className="demo-creds">
          <strong>Demo credentials</strong><br />
          Admin: admin@example.com / Admin@123<br />
          Student: ST001 / Student@123
        </div> */}
      </div>
    </div>
  );
};

export default Login;
