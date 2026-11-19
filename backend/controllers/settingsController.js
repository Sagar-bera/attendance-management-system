const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Settings = require("../models/Settings");
const Admin = require("../models/Admin");

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ key: "system_settings" });
  if (!settings) {
    settings = await Settings.create({ key: "system_settings" });
  }
  res.status(200).json({ success: true, settings });
});

// @desc    Update system settings (e.g. low attendance threshold)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const { lowAttendanceThreshold } = req.body;

  if (
    lowAttendanceThreshold !== undefined &&
    (lowAttendanceThreshold < 0 || lowAttendanceThreshold > 100)
  ) {
    throw new AppError("Threshold must be between 0 and 100", 400);
  }

  let settings = await Settings.findOne({ key: "system_settings" });
  if (!settings) {
    settings = new Settings({ key: "system_settings" });
  }

  if (lowAttendanceThreshold !== undefined) {
    settings.lowAttendanceThreshold = lowAttendanceThreshold;
  }

  await settings.save();

  res.status(200).json({ success: true, message: "Settings updated successfully", settings });
});

// @desc    Update admin's own profile
// @route   PUT /api/settings/profile
// @access  Private/Admin
const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  if (!admin) throw new AppError("Admin not found", 404);

  const { name, email, profileImage } = req.body;

  if (email && email.toLowerCase() !== admin.email) {
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) throw new AppError("Email already registered", 409);
    admin.email = email.toLowerCase();
  }

  if (name !== undefined) admin.name = name;
  if (profileImage !== undefined) admin.profileImage = profileImage;

  await admin.save();

  const obj = admin.toObject();
  delete obj.password;

  res.status(200).json({ success: true, message: "Profile updated successfully", admin: obj });
});

module.exports = { getSettings, updateSettings, updateAdminProfile };
