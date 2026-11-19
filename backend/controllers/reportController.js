const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Settings = require("../models/Settings");
const calcPercentage = require("../utils/calcPercentage");

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Daily attendance report
// @route   GET /api/reports/daily?date=YYYY-MM-DD
// @access  Private/Admin
const getDailyReport = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const day = date ? normalizeDate(date) : normalizeDate(new Date());
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);

  const records = await Attendance.find({ date: { $gte: day, $lt: nextDay } })
    .populate("student", "name studentId department")
    .populate("subject", "subjectName subjectCode");

  const totalStudents = await Student.countDocuments({});
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late").length;

  res.status(200).json({
    success: true,
    report: {
      date: day.toISOString().slice(0, 10),
      totalStudents,
      totalRecords: records.length,
      present,
      absent,
      late,
      percentage: calcPercentage(present, records.length),
    },
    records,
  });
});

// @desc    Monthly attendance report
// @route   GET /api/reports/monthly?month=YYYY-MM
// @access  Private/Admin
const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month } = req.query;
  const now = new Date();
  const [year, mon] = month ? month.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 1);

  const records = await Attendance.find({ date: { $gte: start, $lt: end } });

  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late").length;

  // Day-by-day breakdown
  const daysInMonth = new Date(year, mon, 0).getDate();
  const dailyBreakdown = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStart = new Date(year, mon - 1, day);
    const dayEnd = new Date(year, mon - 1, day + 1);
    const dayRecs = records.filter((r) => r.date >= dayStart && r.date < dayEnd);
    if (dayRecs.length > 0) {
      dailyBreakdown.push({
        date: dayStart.toISOString().slice(0, 10),
        present: dayRecs.filter((r) => r.status === "Present").length,
        absent: dayRecs.filter((r) => r.status === "Absent").length,
        late: dayRecs.filter((r) => r.status === "Late").length,
      });
    }
  }

  res.status(200).json({
    success: true,
    report: {
      month: `${year}-${String(mon).padStart(2, "0")}`,
      totalRecords: records.length,
      present,
      absent,
      late,
      percentage: calcPercentage(present, records.length),
    },
    dailyBreakdown,
  });
});

// @desc    Individual student attendance report
// @route   GET /api/reports/student/:id
// @access  Private
const getStudentReport = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new AppError("Student not found", 404);

  if (req.userRole === "student" && String(req.user._id) !== String(student._id)) {
    throw new AppError("Unauthorized access", 403);
  }

  const records = await Attendance.find({ student: student._id }).populate(
    "subject",
    "subjectName subjectCode"
  );

  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late").length;

  // Subject-wise breakdown
  const subjectMap = {};
  records.forEach((r) => {
    const key = r.subject?._id?.toString() || "unknown";
    if (!subjectMap[key]) {
      subjectMap[key] = {
        subject: r.subject?.subjectName || "Unknown",
        subjectCode: r.subject?.subjectCode || "",
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
      };
    }
    subjectMap[key].total += 1;
    if (r.status === "Present") subjectMap[key].present += 1;
    if (r.status === "Absent") subjectMap[key].absent += 1;
    if (r.status === "Late") subjectMap[key].late += 1;
  });

  const subjectWise = Object.values(subjectMap).map((s) => ({
    ...s,
    percentage: calcPercentage(s.present, s.total),
  }));

  res.status(200).json({
    success: true,
    student: {
      name: student.name,
      studentId: student.studentId,
      department: student.department,
      semester: student.semester,
    },
    report: {
      totalClasses: total,
      present,
      absent,
      late,
      percentage: calcPercentage(present, total),
    },
    subjectWise,
  });
});

// @desc    Subject-wise attendance report
// @route   GET /api/reports/subject/:id
// @access  Private/Admin
const getSubjectReport = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) throw new AppError("Subject not found", 404);

  const records = await Attendance.find({ subject: subject._id }).populate(
    "student",
    "name studentId department semester"
  );

  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late").length;

  // Per-student breakdown for this subject
  const studentMap = {};
  records.forEach((r) => {
    const key = r.student?._id?.toString() || "unknown";
    if (!studentMap[key]) {
      studentMap[key] = {
        student: r.student?.name || "Unknown",
        studentId: r.student?.studentId || "",
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
      };
    }
    studentMap[key].total += 1;
    if (r.status === "Present") studentMap[key].present += 1;
    if (r.status === "Absent") studentMap[key].absent += 1;
    if (r.status === "Late") studentMap[key].late += 1;
  });

  const studentWise = Object.values(studentMap).map((s) => ({
    ...s,
    percentage: calcPercentage(s.present, s.total),
  }));

  res.status(200).json({
    success: true,
    subject: { subjectName: subject.subjectName, subjectCode: subject.subjectCode },
    report: {
      totalRecords: total,
      present,
      absent,
      late,
      percentage: calcPercentage(present, total),
    },
    studentWise,
  });
});

// @desc    List students below the configured low-attendance threshold
// @route   GET /api/reports/low-attendance
// @access  Private/Admin
const getLowAttendanceStudents = asyncHandler(async (req, res) => {
  const settings = (await Settings.findOne({ key: "system_settings" })) || { lowAttendanceThreshold: 75 };
  const threshold = req.query.threshold ? Number(req.query.threshold) : settings.lowAttendanceThreshold;

  const students = await Student.find({});
  const results = [];

  for (const student of students) {
    const records = await Attendance.find({ student: student._id }).select("status");
    const total = records.length;
    if (total === 0) continue;
    const present = records.filter((r) => r.status === "Present").length;
    const percentage = calcPercentage(present, total);
    if (percentage < threshold) {
      results.push({
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        department: student.department,
        semester: student.semester,
        section: student.section,
        totalClasses: total,
        present,
        percentage,
      });
    }
  }

  results.sort((a, b) => a.percentage - b.percentage);

  res.status(200).json({ success: true, threshold, count: results.length, students: results });
});

module.exports = {
  getDailyReport,
  getMonthlyReport,
  getStudentReport,
  getSubjectReport,
  getLowAttendanceStudents,
};
