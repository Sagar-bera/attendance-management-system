const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// Normalize a date to midnight UTC so "same day" comparisons/uniqueness work
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get attendance records (filterable)
// @route   GET /api/attendance
// @access  Private/Admin
const getAttendance = asyncHandler(async (req, res) => {
  const {
    date,
    startDate,
    endDate,
    subject,
    department,
    semester,
    section,
    status,
    student,
    search = "",
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};

  if (date) {
    const d = normalizeDate(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    query.date = { $gte: d, $lt: next };
  } else if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = normalizeDate(startDate);
    if (endDate) {
      const end = normalizeDate(endDate);
      end.setDate(end.getDate() + 1);
      query.date.$lt = end;
    }
  }

  if (subject) query.subject = subject;
  if (status) query.status = status;
  if (student) query.student = student;

  // Filter by department/semester/section requires joining student ids first
  if (department || semester || section) {
    const studentQuery = {};
    if (department) studentQuery.department = department;
    if (semester) studentQuery.semester = Number(semester);
    if (section) studentQuery.section = section;
    const matchingStudents = await Student.find(studentQuery).select("_id");
    query.student = { $in: matchingStudents.map((s) => s._id) };
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  let records = await Attendance.find(query)
    .populate("student", "name studentId department semester section")
    .populate("subject", "subjectName subjectCode")
    .populate("markedBy", "name email")
    .sort({ date: -1, createdAt: -1 });

  // Text search across populated student name/id/subject (post-query filter, simplest reliable approach)
  if (search) {
    const s = search.toLowerCase();
    records = records.filter(
      (r) =>
        r.student?.name?.toLowerCase().includes(s) ||
        r.student?.studentId?.toLowerCase().includes(s) ||
        r.subject?.subjectName?.toLowerCase().includes(s) ||
        r.subject?.subjectCode?.toLowerCase().includes(s)
    );
  }

  const total = records.length;
  const paginated = records.slice(skip, skip + limitNum);

  res.status(200).json({
    success: true,
    count: paginated.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    records: paginated,
  });
});

// @desc    Get all attendance for a specific student (with filters)
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subject, month, status, startDate, endDate } = req.query;

  const student = await Student.findById(studentId);
  if (!student) throw new AppError("Student not found", 404);

  if (req.userRole === "student" && String(req.user._id) !== String(student._id)) {
    throw new AppError("Unauthorized access", 403);
  }

  const query = { student: studentId };
  if (subject) query.subject = subject;
  if (status) query.status = status;

  if (month) {
    // month format: YYYY-MM
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    query.date = { $gte: start, $lt: end };
  } else if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = normalizeDate(startDate);
    if (endDate) {
      const end = normalizeDate(endDate);
      end.setDate(end.getDate() + 1);
      query.date.$lt = end;
    }
  }

  const records = await Attendance.find(query)
    .populate("subject", "subjectName subjectCode")
    .populate("markedBy", "name")
    .sort({ date: -1 });

  res.status(200).json({ success: true, count: records.length, records });
});

// @desc    Get students for marking attendance (by department/course/semester/section)
// @route   GET /api/attendance/students-for-marking
// @access  Private/Admin
const getStudentsForMarking = asyncHandler(async (req, res) => {
  const { department, course, semester, section, subject, date } = req.query;

  if (!department || !semester) {
    throw new AppError("Department and semester are required", 400);
  }

  const query = { department, semester: Number(semester) };
  if (course) query.course = course;
  if (section) query.section = section;

  const students = await Student.find(query)
    .select("name studentId rollNumber department course semester section")
    .sort({ rollNumber: 1, name: 1 });

  let existingMap = {};
  if (subject && date) {
    const d = normalizeDate(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const existing = await Attendance.find({
      subject,
      date: { $gte: d, $lt: next },
      student: { $in: students.map((s) => s._id) },
    });
    existing.forEach((rec) => {
      existingMap[String(rec.student)] = rec.status;
    });
  }

  res.status(200).json({
    success: true,
    count: students.length,
    students: students.map((s) => ({
      ...s.toObject(),
      existingStatus: existingMap[String(s._id)] || null,
    })),
  });
});

// @desc    Mark attendance for a single student
// @route   POST /api/attendance
// @access  Private/Admin
const markAttendance = asyncHandler(async (req, res) => {
  const { student, subject, date, status, remarks } = req.body;

  if (!student || !subject || !date || !status) {
    throw new AppError("Student, subject, date and status are required", 400);
  }

  const normalizedDate = normalizeDate(date);

  const existing = await Attendance.findOne({
    student,
    subject,
    date: normalizedDate,
  });

  if (existing) {
    throw new AppError("Attendance already marked for this student, subject and date", 409);
  }

  const record = await Attendance.create({
    student,
    subject,
    date: normalizedDate,
    status,
    remarks,
    markedBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Attendance marked successfully", record });
});

// @desc    Bulk mark attendance for multiple students (one subject/date)
// @route   POST /api/attendance/bulk
// @access  Private/Admin
const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { subject, date, entries } = req.body;
  // entries: [{ student, status, remarks }]

  if (!subject || !date || !Array.isArray(entries) || entries.length === 0) {
    throw new AppError("Subject, date and attendance entries are required", 400);
  }

  const invalidEntry = entries.find((e) => !e.student || !e.status);
  if (invalidEntry) {
    throw new AppError("Every student must have an attendance status", 400);
  }

  const normalizedDate = normalizeDate(date);

  const results = { created: 0, updated: 0, errors: [] };

  for (const entry of entries) {
    try {
      const existing = await Attendance.findOne({
        student: entry.student,
        subject,
        date: normalizedDate,
      });

      if (existing) {
        existing.status = entry.status;
        existing.remarks = entry.remarks || "";
        existing.markedBy = req.user._id;
        await existing.save();
        results.updated += 1;
      } else {
        await Attendance.create({
          student: entry.student,
          subject,
          date: normalizedDate,
          status: entry.status,
          remarks: entry.remarks || "",
          markedBy: req.user._id,
        });
        results.created += 1;
      }
    } catch (err) {
      results.errors.push({ student: entry.student, message: err.message });
    }
  }

  res.status(201).json({
    success: true,
    message: `Attendance saved: ${results.created} created, ${results.updated} updated`,
    results,
  });
});

// @desc    Mark attendance for the currently logged-in student
// @route   POST /api/attendance/self
// @access  Private/Student
const markSelfAttendance = asyncHandler(async (req, res) => {
  const { subject, date, remarks = "" } = req.body;

  if (req.userRole !== "student") {
    throw new AppError("Only students can use self attendance", 403);
  }

  if (!subject) {
    throw new AppError("Subject is required", 400);
  }

  // Students can only mark their own attendance for the current day.
  const today = normalizeDate(new Date());
  const requestedDate = normalizeDate(date || new Date());
  if (requestedDate.getTime() !== today.getTime()) {
    throw new AppError("Students can only mark attendance for today", 400);
  }

  const subjectRecord = await require("../models/Subject").findById(subject);
  if (!subjectRecord) throw new AppError("Subject not found", 404);

  // A student can only mark a subject belonging to their department and semester.
  if (
    subjectRecord.department !== req.user.department ||
    Number(subjectRecord.semester) !== Number(req.user.semester)
  ) {
    throw new AppError("You cannot mark attendance for this subject", 403);
  }

  const existing = await Attendance.findOne({
    student: req.user._id,
    subject,
    date: requestedDate,
  });

  if (existing) {
    throw new AppError("You have already marked attendance for this subject today", 409);
  }

  const record = await Attendance.create({
    student: req.user._id,
    subject,
    date: requestedDate,
    status: "Present",
    remarks: String(remarks || "").trim(),
    markedByStudent: req.user._id,
    markedByRole: "student",
  });

  await record.populate("subject", "subjectName subjectCode");

  res.status(201).json({
    success: true,
    message: "Your attendance has been marked successfully",
    record,
  });
});

// @desc    Update an attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin
const updateAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) throw new AppError("Attendance record not found", 404);

  const { status, remarks, date } = req.body;

  if (status) record.status = status;
  if (remarks !== undefined) record.remarks = remarks;
  if (date) record.date = normalizeDate(date);
  record.markedBy = req.user._id;

  await record.save();

  res.status(200).json({ success: true, message: "Attendance updated successfully", record });
});

// @desc    Delete an attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
const deleteAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) throw new AppError("Attendance record not found", 404);

  await record.deleteOne();

  res.status(200).json({ success: true, message: "Attendance record deleted successfully" });
});

module.exports = {
  getAttendance,
  getStudentAttendance,
  getStudentsForMarking,
  markAttendance,
  markSelfAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance,
};
