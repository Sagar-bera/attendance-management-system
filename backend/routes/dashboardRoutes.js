const express = require("express");
const router = express.Router();
const { getAdminDashboard, getStudentDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/admin/dashboard", protect, authorize("admin"), getAdminDashboard);
router.get("/student/dashboard", protect, authorize("student"), getStudentDashboard);

module.exports = router;
