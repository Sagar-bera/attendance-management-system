const express = require("express");
const router = express.Router();
const {
  getDailyReport,
  getMonthlyReport,
  getStudentReport,
  getSubjectReport,
  getLowAttendanceStudents,
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/daily", authorize("admin"), getDailyReport);
router.get("/monthly", authorize("admin"), getMonthlyReport);
router.get("/low-attendance", authorize("admin"), getLowAttendanceStudents);
router.get("/subject/:id", authorize("admin"), getSubjectReport);
router.get("/student/:id", getStudentReport); // admin: any; student: own (checked in controller)

module.exports = router;
