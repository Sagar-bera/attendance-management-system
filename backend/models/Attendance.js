const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      required: true,
    },
    // Admin-created attendance keeps using markedBy. Student self-attendance
    // uses markedByStudent so the reference points to the correct collection.
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    markedByStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: false,
    },
    markedByRole: {
      type: String,
      enum: ["admin", "student"],
      default: "admin",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student + subject + date (date normalized to day)
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
