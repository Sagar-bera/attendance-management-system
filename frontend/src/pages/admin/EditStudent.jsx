import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import studentService from "../../services/studentService";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    studentService.getStudentById(id).then((res) => {
      const s = res.student;
      setForm({
        name: s.name || "",
        studentId: s.studentId || "",
        email: s.email || "",
        phone: s.phone || "",
        gender: s.gender || "",
        dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : "",
        department: s.department || "",
        course: s.course || "",
        semester: s.semester || "",
        section: s.section || "",
        rollNumber: s.rollNumber || "",
      });
      setLoading(false);
    }).catch((err) => {
      toast.error(err.response?.data?.message || "Failed to load student");
      navigate("/admin/students");
    });
  }, [id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.department) errs.department = "Department is required";
    if (!form.course) errs.course = "Course is required";
    if (!form.semester) errs.semester = "Semester is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await studentService.updateStudent(id, form);
      toast.success("Student updated successfully");
      navigate("/admin/students");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Loader />;

  return (
    <div>
      <PageHeader
        title="Edit Student"
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
                <label className="form-label">Student ID</label>
                <input className="form-control" name="studentId" value={form.studentId} onChange={handleChange} />
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

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;
