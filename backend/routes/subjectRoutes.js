const express = require("express");
const router = express.Router();
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getSubjects); // both roles can view subjects
router.get("/:id", getSubjectById);
router.post("/", authorize("admin"), createSubject);
router.put("/:id", authorize("admin"), updateSubject);
router.delete("/:id", authorize("admin"), deleteSubject);

module.exports = router;
