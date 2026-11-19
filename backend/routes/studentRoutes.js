const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  resetStudentPassword,
  getDepartments,
  getStudentAttendanceSummary,
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/meta/departments", getDepartments);

router.get("/", authorize("admin"), getStudents);
router.post("/", authorize("admin"), createStudent);

router.get("/:id", getStudentById); // admin: any; student: own (checked in controller)
router.put("/:id", updateStudent); // admin: any; student: own permitted fields
router.delete("/:id", authorize("admin"), deleteStudent);

router.patch("/:id/reset-password", authorize("admin"), resetStudentPassword);
router.get("/:id/attendance-summary", getStudentAttendanceSummary);

module.exports = router;
