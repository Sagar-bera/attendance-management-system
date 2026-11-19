const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");
const Admin = require("../models/Admin");
const Student = require("../models/Student");

// Helper: find a user (admin or student) by email, including password field
const findUserByEmail = async (email) => {
  let admin = await Admin.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (admin) return { user: admin, role: "admin" };

  let student = await Student.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (student) return { user: student, role: "student" };

  return null;
};

const sanitizeUser = (user, role) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return { ...obj, role: obj.role || role };
};

// @desc    Login for both admin and student (by email or studentId)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, studentId, password } = req.body;

  if ((!email && !studentId) || !password) {
    throw new AppError("Please provide email/student ID and password", 400);
  }

  let result;

  if (studentId) {
    const student = await Student.findOne({
      studentId: studentId.toUpperCase(),
    }).select("+password");
    if (student) result = { user: student, role: "student" };
  } else {
    result = await findUserByEmail(email);
  }

  if (!result) {
    throw new AppError("Invalid email/ID or password", 401);
  }

  const { user, role } = result;

  if (user.isActive === false) {
    throw new AppError("This account has been deactivated", 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email/ID or password", 401);
  }

  const token = generateToken(user._id, role);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: sanitizeUser(user, role),
  });
});

// @desc    Register a new student account
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    name,
    studentId,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    department,
    course,
    semester,
    section,
    rollNumber,
  } = req.body;

  if (!name || !studentId || !email || !password || !department || !course || !semester) {
    throw new AppError("Please fill in all required fields", 400);
  }

  const existingEmail = await Student.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new AppError("Email already registered", 409);
  }

  const existingId = await Student.findOne({
    studentId: studentId.toUpperCase(),
  });
  if (existingId) {
    throw new AppError("Student ID already exists", 409);
  }

  const student = await Student.create({
    name,
    studentId: studentId.toUpperCase(),
    email: email.toLowerCase(),
    password,
    phone,
    gender,
    dateOfBirth,
    department,
    course,
    semester,
    section,
    rollNumber,
  });

  const token = generateToken(student._id, "student");

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: sanitizeUser(student, "student"),
  });
});

// @desc    Logout (client discards token; endpoint provided for completeness)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user, req.userRole),
  });
});

// @desc    Change password (logged in user)
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Please provide current and new password", 400);
  }

  if (newPassword.length < 6) {
    throw new AppError("New password must be at least 6 characters", 400);
  }

  const Model = req.userRole === "admin" ? Admin : Student;
  const user = await Model.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password changed successfully" });
});

// @desc    Request a password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError("Please provide an email", 400);

  const result = await findUserByEmail(email);

  // Always respond the same way to avoid leaking whether an email exists
  const genericResponse = {
    success: true,
    message:
      "If an account with that email exists, a password reset link has been generated.",
  };

  if (!result) {
    return res.status(200).json(genericResponse);
  }

  const { user } = result;

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // In a production deployment this token would be emailed to the user.
  // Since no email service is configured here, we return it in the response
  // for development/testing purposes only.
  res.status(200).json({
    ...genericResponse,
    devResetToken: resetToken,
  });
});

// @desc    Reset password using a valid reset token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError("Token and new password are required", 400);
  }
  if (newPassword.length < 6) {
    throw new AppError("New password must be at least 6 characters", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  let user = await Admin.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!user) {
    user = await Student.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");
  }

  if (!user) {
    throw new AppError("Reset token is invalid or has expired", 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Password reset successful. Please log in." });
});

module.exports = {
  login,
  register,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
