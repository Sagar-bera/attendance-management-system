const express = require("express");
const router = express.Router();
const { getSettings, updateSettings, updateAdminProfile } = require("../controllers/settingsController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect, authorize("admin"));

router.get("/", getSettings);
router.put("/", updateSettings);
router.put("/profile", updateAdminProfile);

module.exports = router;
