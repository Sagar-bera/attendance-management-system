const AppError = require("../utils/AppError");

// Usage: authorize("admin") or authorize("admin", "student")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403
      );
    }
    next();
  };
};

module.exports = { authorize };
