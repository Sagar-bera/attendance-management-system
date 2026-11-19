const express = require("express");
const router = express.Router();
const {
  login,
  register,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimiter");

router.post("/login", loginLimiter, login);
router.post("/register", register);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);
router.get("/me", protect, getMe);

module.exports = router;
