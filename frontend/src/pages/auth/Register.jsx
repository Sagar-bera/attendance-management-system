
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiCalendar } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";

const initialForm = {
  name: "",
  studentId: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  department: "",
  course: "",
  semester: "",
  section: "",
  rollNumber: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check password
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check password length
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...payload } = form;

      await register(payload);

      // Show success message
      toast.success("Registration successful! Please login.");

      // Redirect to Login page
      navigate("/login");

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>

        <div className="auth-brand">
          <FiCalendar /> AttendSys
        </div>

        <p className="auth-subtitle">
          Create your student account
        </p>

        {error && (
          <div className="auth-alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Full Name + Student ID */}
          <div className="form-row">

            <div className="form-group">
              <label className="form-label">
                Full Name *
              </label>

              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Student ID *
              </label>

              <input
                className="form-control"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Email + Phone */}
          <div className="form-row">

            <div className="form-group">
              <label className="form-label">
                Email *
              </label>

              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone
              </label>

              <input
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* Gender + Date of Birth */}
          <div className="form-row">

            <div className="form-group">
              <label className="form-label">
                Gender
              </label>

              <select
                className="form-control"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Date of Birth
              </label>

              <input
                type="date"
                className="form-control"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* Department + Course */}
          <div className="form-row">

            <div className="form-group">
              <label className="form-label">
                Department *
              </label>

              <input
                className="form-control"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Course *
              </label>

              <input
                className="form-control"
                name="course"
                value={form.course}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Semester + Section */}
          <div className="form-row">

            <div className="form-group">
              <label className="form-label">
                Semester *
              </label>

              <input
                type="number"
                min="1"
                max="12"
                className="form-control"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Section
              </label>

              <input
                className="form-control"
                name="section"
                value={form.section}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* Roll Number */}
          <div className="form-group">

            <label className="form-label">
              Roll Number
            </label>

            <input
              className="form-control"
              name="rollNumber"
              value={form.rollNumber}
              onChange={handleChange}
            />

          </div>

          {/* Password + Confirm Password */}
          <div className="form-row">

            <div className="form-group">
              <label className="form-label">
                Password *
              </label>

              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm Password *
              </label>

              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>

        {/* Login Link */}
        <div className="auth-footer">
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
            }}
          >
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;

