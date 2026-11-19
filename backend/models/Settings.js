const mongoose = require("mongoose");

// Single-document collection holding system-wide configurable settings
const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "system_settings",
      unique: true,
    },
    lowAttendanceThreshold: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
