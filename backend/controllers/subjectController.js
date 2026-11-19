const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");

// @desc    Get all subjects (optional filters)
// @route   GET /api/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const { department, semester, search = "" } = req.query;
  const query = {};
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);
  if (search) {
    query.$or = [
      { subjectName: { $regex: search, $options: "i" } },
      { subjectCode: { $regex: search, $options: "i" } },
    ];
  }

  const subjects = await Subject.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: subjects.length, subjects });
});

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) throw new AppError("Subject not found", 404);
  res.status(200).json({ success: true, subject });
});

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = asyncHandler(async (req, res) => {
  const { subjectName, subjectCode, department, semester, teacherName } = req.body;

  if (!subjectName || !subjectCode || !department || !semester) {
    throw new AppError("Please fill in all required fields", 400);
  }

  const existing = await Subject.findOne({ subjectCode: subjectCode.toUpperCase() });
  if (existing) throw new AppError("Subject code already exists", 409);

  const subject = await Subject.create({
    subjectName,
    subjectCode: subjectCode.toUpperCase(),
    department,
    semester,
    teacherName,
  });

  res.status(201).json({ success: true, message: "Subject created successfully", subject });
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) throw new AppError("Subject not found", 404);

  const { subjectName, subjectCode, department, semester, teacherName } = req.body;

  if (subjectCode && subjectCode.toUpperCase() !== subject.subjectCode) {
    const existing = await Subject.findOne({
      subjectCode: subjectCode.toUpperCase(),
      _id: { $ne: subject._id },
    });
    if (existing) throw new AppError("Subject code already exists", 409);
    subject.subjectCode = subjectCode.toUpperCase();
  }

  if (subjectName !== undefined) subject.subjectName = subjectName;
  if (department !== undefined) subject.department = department;
  if (semester !== undefined) subject.semester = semester;
  if (teacherName !== undefined) subject.teacherName = teacherName;

  await subject.save();

  res.status(200).json({ success: true, message: "Subject updated successfully", subject });
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) throw new AppError("Subject not found", 404);

  await Attendance.deleteMany({ subject: subject._id });
  await subject.deleteOne();

  res.status(200).json({ success: true, message: "Subject deleted successfully" });
});

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
