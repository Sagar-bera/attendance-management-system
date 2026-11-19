const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const calcPercentage = require("../utils/calcPercentage");

// @desc    Get all students (with search, filter, pagination)
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
  const {
    search = "",
    department,
    semester,
    section,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { studentId: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
    ];
  }
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);
  if (section) query.section = section;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [students, total] = await Promise.all([
    Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Student.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    students,
  });
});

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new AppError("Student not found", 404);

  // A student can only view their own profile; admin can view any
  if (req.userRole === "student" && String(req.user._id) !== String(student._id)) {
    throw new AppError("Unauthorized access", 403);
  }

  res.status(200).json({ success: true, student });
});

// @desc    Create a new student (admin)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
  const {
    name,
    studentId,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    department,
    course,
    semester,
    section,
    rollNumber,
    profileImage,
  } = req.body;

  if (!name || !studentId || !email || !password || !department || !course || !semester) {
    throw new AppError("Please fill in all required fields", 400);
  }

  const existingEmail = await Student.findOne({ email: email.toLowerCase() });
  if (existingEmail) throw new AppError("Email already registered", 409);

  const existingId = await Student.findOne({ studentId: studentId.toUpperCase() });
  if (existingId) throw new AppError("Student ID already exists", 409);

  const student = await Student.create({
    name,
    studentId: studentId.toUpperCase(),
    email: email.toLowerCase(),
    password,
    phone,
    gender,
    dateOfBirth,
    department,
    course,
    semester,
    section,
    rollNumber,
    profileImage,
  });

  const obj = student.toObject();
  delete obj.password;

  res.status(201).json({ success: true, message: "Student created successfully", student: obj });
});

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (admin can edit any; student can edit own permitted fields)
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new AppError("Student not found", 404); 

  const isSelf = req.userRole === "student" && String(req.user._id) === String(student._id);
  const isAdmin = req.userRole === "admin";

  if (!isSelf && !isAdmin) {
    throw new AppError("Unauthorized access", 403);
  }

  // Fields a student is allowed to edit on their own profile
  const studentEditableFields = ["name", "phone", "gender", "dateOfBirth", "profileImage"];
  // Additional fields only an admin may edit
  const adminOnlyFields = [
    "studentId",
    "email",
    "department",
    "course",
    "semester",
    "section",
    "rollNumber",
    "isActive",
  ];

  const allowedFields = isAdmin
    ? [...studentEditableFields, ...adminOnlyFields]
    : studentEditableFields;

  if (req.body.email && isAdmin) {
    const existingEmail = await Student.findOne({
      email: req.body.email.toLowerCase(),
      _id: { $ne: student._id },
    });
    if (existingEmail) throw new AppError("Email already registered", 409);
  }

  if (req.body.studentId && isAdmin) {
    const existingId = await Student.findOne({
      studentId: req.body.studentId.toUpperCase(),
      _id: { $ne: student._id },
    });
    if (existingId) throw new AppError("Student ID already exists", 409);
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "studentId") {
        student.studentId = req.body.studentId.toUpperCase();
      } else if (field === "email") {
        student.email = req.body.email.toLowerCase();
      } else {
        student[field] = req.body[field];
      }
    }
  });

  await student.save();

  const obj = student.toObject();
  delete obj.password;

  res.status(200).json({ success: true, message: "Student updated successfully", student: obj });
});

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new AppError("Student not found", 404);

  await Attendance.deleteMany({ student: student._id });
  await student.deleteOne();

  res.status(200).json({ success: true, message: "Student deleted successfully" });
});

// @desc    Admin resets a student's password
// @route   PATCH /api/students/:id/reset-password
// @access  Private/Admin
const resetStudentPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    throw new AppError("New password must be at least 6 characters", 400);
  }

  const student = await Student.findById(req.params.id);
  if (!student) throw new AppError("Student not found", 404);

  student.password = newPassword;
  await student.save();

  res.status(200).json({ success: true, message: "Student password reset successfully" });
});

// @desc    Get distinct departments (for filters/forms)
// @route   GET /api/students/meta/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Student.distinct("department");
  res.status(200).json({ success: true, departments });
});

// @desc    Get a student's overall attendance percentage summary
// @route   GET /api/students/:id/attendance-summary
// @access  Private
const getStudentAttendanceSummary = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new AppError("Student not found", 404);

  if (req.userRole === "student" && String(req.user._id) !== String(student._id)) {
    throw new AppError("Unauthorized access", 403);
  }

  const records = await Attendance.find({ student: student._id });
  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late").length;
  const percentage = calcPercentage(present, total);

  res.status(200).json({
    success: true,
    summary: { total, present, absent, late, percentage },
  });
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  resetStudentPassword,
  getDepartments,
  getStudentAttendanceSummary,
};
