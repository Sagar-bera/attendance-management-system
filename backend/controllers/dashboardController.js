const asyncHandler = require("../utils/asyncHandler");
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

// @desc    Admin dashboard summary: stats, charts data, recent attendance
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const today = normalizeDate(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalStudents, totalSubjects, todayRecords] = await Promise.all([
    Student.countDocuments({}),
    Subject.countDocuments({}),
    Attendance.find({ date: { $gte: today, $lt: tomorrow } }),
  ]);

  const presentToday = todayRecords.filter((r) => r.status === "Present").length;
  const absentToday = todayRecords.filter((r) => r.status === "Absent").length;
  const lateToday = todayRecords.filter((r) => r.status === "Late").length;

  // Overall average attendance percentage across all records
  const allRecords = await Attendance.find({}).select("status");
  const totalAll = allRecords.length;
  const presentAll = allRecords.filter((r) => r.status === "Present").length;
  const averageAttendance = calcPercentage(presentAll, totalAll);

  // Last 7 days daily attendance trend
  const dailyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const recs = await Attendance.find({ date: { $gte: day, $lt: nextDay } });
    dailyTrend.push({
      date: day.toISOString().slice(0, 10),
      present: recs.filter((r) => r.status === "Present").length,
      absent: recs.filter((r) => r.status === "Absent").length,
      late: recs.filter((r) => r.status === "Late").length,
    });
  }

  // Last 6 months monthly attendance trend
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const recs = await Attendance.find({ date: { $gte: monthStart, $lt: monthEnd } });
    monthlyTrend.push({
      month: monthStart.toLocaleString("default", { month: "short", year: "2-digit" }),
      present: recs.filter((r) => r.status === "Present").length,
      absent: recs.filter((r) => r.status === "Absent").length,
      late: recs.filter((r) => r.status === "Late").length,
    });
  }

  // Department-wise attendance percentage
  const departments = await Student.distinct("department");
  const departmentWise = [];
  for (const dept of departments) {
    const deptStudents = await Student.find({ department: dept }).select("_id");
    const ids = deptStudents.map((s) => s._id);
    const recs = await Attendance.find({ student: { $in: ids } }).select("status");
    const present = recs.filter((r) => r.status === "Present").length;
    departmentWise.push({
      department: dept,
      percentage: calcPercentage(present, recs.length),
      totalRecords: recs.length,
    });
  }

  // Subject-wise attendance percentage
  const subjects = await Subject.find({}).select("subjectName subjectCode");
  const subjectWise = [];
  for (const subj of subjects) {
    const recs = await Attendance.find({ subject: subj._id }).select("status");
    const present = recs.filter((r) => r.status === "Present").length;
    subjectWise.push({
      subject: subj.subjectName,
      code: subj.subjectCode,
      percentage: calcPercentage(present, recs.length),
      totalRecords: recs.length,
    });
  }

  const recentAttendance = await Attendance.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("student", "name studentId")
    .populate("subject", "subjectName subjectCode");

  res.status(200).json({
    success: true,
    stats: {
      totalStudents,
      totalSubjects,
      presentToday,
      absentToday,
      lateToday,
      averageAttendance,
    },
    charts: {
      dailyTrend,
      monthlyTrend,
      presentVsAbsent: { present: presentAll, absent: allRecords.filter((r) => r.status === "Absent").length },
      departmentWise,
      subjectWise,
    },
    recentAttendance,
  });
});

// @desc    Student dashboard summary
// @route   GET /api/student/dashboard
// @access  Private/Student
const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const records = await Attendance.find({ student: studentId })
    .populate("subject", "subjectName subjectCode")
    .sort({ date: -1 });

  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late").length;
  const percentage = calcPercentage(present, total);

  const settings = (await Settings.findOne({ key: "system_settings" })) || { lowAttendanceThreshold: 75 };

  const recentRecords = records.slice(0, 10);

  res.status(200).json({
    success: true,
    summary: {
      totalClasses: total,
      present,
      absent,
      late,
      percentage,
      isLow: percentage < settings.lowAttendanceThreshold,
      threshold: settings.lowAttendanceThreshold,
    },
    recentRecords,
  });
});

module.exports = { getAdminDashboard, getStudentDashboard };
