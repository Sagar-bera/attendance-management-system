const express = require("express");
const router = express.Router();
const {
  getAttendance,
  getStudentAttendance,
  getStudentsForMarking,
  markAttendance,
  markSelfAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", authorize("admin"), getAttendance);
router.get("/students-for-marking", authorize("admin"), getStudentsForMarking);
router.get("/student/:studentId", getStudentAttendance); // admin: any; student: own (checked in controller)

router.post("/", authorize("admin"), markAttendance);
router.post("/self", authorize("student"), markSelfAttendance);
router.post("/bulk", authorize("admin"), bulkMarkAttendance);

router.put("/:id", authorize("admin"), updateAttendance);
router.delete("/:id", authorize("admin"), deleteAttendance);

module.exports = router;
