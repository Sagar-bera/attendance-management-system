import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import studentService from "../../services/studentService";
import PageHeader from "../../components/PageHeader";

const initialForm = {
  name: "", studentId: "", email: "", phone: "", gender: "", dateOfBirth: "",
  department: "", course: "", semester: "", section: "A", rollNumber: "",
  password: "", confirmPassword: "",
};

const AddStudent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.studentId) errs.studentId = "Student ID is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.department) errs.department = "Department is required";
    if (!form.course) errs.course = "Course is required";
    if (!form.semester) errs.semester = "Semester is required";
    if (!form.password || form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await studentService.createStudent(payload);
      toast.success("Student created successfully");
      navigate("/admin/students");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Student"
        actions={<Link to="/admin/students" className="btn btn-outline"><FiArrowLeft /> Back</Link>}
      />
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Student ID *</label>
                <input className="form-control" name="studentId" value={form.studentId} onChange={handleChange} />
                {errors.studentId && <div className="form-error">{errors.studentId}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <input className="form-control" name="department" value={form.department} onChange={handleChange} />
                {errors.department && <div className="form-error">{errors.department}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Course *</label>
                <input className="form-control" name="course" value={form.course} onChange={handleChange} />
                {errors.course && <div className="form-error">{errors.course}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Semester *</label>
                <input type="number" min="1" max="12" className="form-control" name="semester" value={form.semester} onChange={handleChange} />
                {errors.semester && <div className="form-error">{errors.semester}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Section</label>
                <input className="form-control" name="section" value={form.section} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input className="form-control" name="rollNumber" value={form.rollNumber} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input type="password" className="form-control" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Student"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
