const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Admin = require("../models/Admin");
const Student = require("../models/Student");

// Verifies the JWT from the Authorization header and attaches req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized, no token provided", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Not authorized, token invalid or expired", 401);
  }

  let user;
  if (decoded.role === "admin") {
    user = await Admin.findById(decoded.id);
  } else if (decoded.role === "student") {
    user = await Student.findById(decoded.id);
  }

  if (!user) {
    throw new AppError("Not authorized, user no longer exists", 401);
  }

  if (user.isActive === false) {
    throw new AppError("This account has been deactivated", 403);
  }

  req.user = user;
  req.userRole = decoded.role;
  next();
});

module.exports = { protect };
