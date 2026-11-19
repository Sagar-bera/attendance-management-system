require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Settings = require("../models/Settings");

const DEPARTMENTS = ["Computer Science"];
const COURSE = "B.Tech";
const SEMESTER = 3;
const SECTION = "A";

const STUDENT_NAMES = [
  "Rahul Sharma",
  "Amit Verma",
  "Priya Singh",
  "Sneha Gupta",
  "Vikram Patel",
  "Ananya Reddy",
  "Karan Mehta",
  "Divya Nair",
  "Rohan Joshi",
  "Neha Kapoor",
];

const SUBJECTS = [
  { subjectName: "React JS", subjectCode: "REACT101", teacherName: "Mr. Arjun Rao" },
  { subjectName: "Node JS", subjectCode: "NODE101", teacherName: "Ms. Kavita Iyer" },
  { subjectName: "Express JS", subjectCode: "EXP101", teacherName: "Mr. Arjun Rao" },
  { subjectName: "MongoDB", subjectCode: "MONGO101", teacherName: "Ms. Kavita Iyer" },
  { subjectName: "JavaScript", subjectCode: "JS101", teacherName: "Mr. Sameer Khan" },
  { subjectName: "HTML & CSS", subjectCode: "WEB101", teacherName: "Mr. Sameer Khan" },
];

const randomStatus = () => {
  // Weighted: mostly present, some absent, few late
  const r = Math.random();
  if (r < 0.78) return "Present";
  if (r < 0.93) return "Absent";
  return "Late";
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Promise.all([
      Admin.deleteMany({}),
      Student.deleteMany({}),
      Subject.deleteMany({}),
      Attendance.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    console.log("Existing data cleared.");

    // Create default admin
    const admin = await Admin.create({
      name: process.env.SEED_ADMIN_NAME || "Admin",
      email: process.env.SEED_ADMIN_EMAIL || "admin@example.com",
      password: process.env.SEED_ADMIN_PASSWORD || "Admin@123",
    });
    console.log(`Admin created: ${admin.email}`);

    // Create default settings
    await Settings.create({ key: "system_settings", lowAttendanceThreshold: 75 });
    console.log("Default settings created (low attendance threshold: 75%).");

    // Create subjects
    const subjects = await Subject.insertMany(
      SUBJECTS.map((s) => ({
        ...s,
        department: DEPARTMENTS[0],
        semester: SEMESTER,
      }))
    );
    console.log(`${subjects.length} subjects created.`);

    // Create students
    const students = [];
    for (let i = 0; i < STUDENT_NAMES.length; i++) {
      const studentId = `ST${String(i + 1).padStart(3, "0")}`;
      const student = await Student.create({
        name: STUDENT_NAMES[i],
        studentId,
        email: `${studentId.toLowerCase()}@example.com`,
        password: "Student@123",
        phone: `98765${String(10000 + i).slice(1)}`,
        gender: i % 2 === 0 ? "Male" : "Female",
        dateOfBirth: new Date(2003, i % 12, (i % 27) + 1),
        department: DEPARTMENTS[0],
        course: COURSE,
        semester: SEMESTER,
        section: SECTION,
        rollNumber: String(i + 1).padStart(2, "0"),
      });
      students.push(student);
    }
    console.log(`${students.length} students created.`);

    // Generate attendance for the last 30 days (weekdays only) for each subject
    const attendanceDocs = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

      // Not every subject has class every day; pick 2-3 subjects per day
      const shuffledSubjects = [...subjects].sort(() => 0.5 - Math.random());
      const todaysSubjects = shuffledSubjects.slice(0, 2 + (dayOffset % 2));

      for (const subject of todaysSubjects) {
        for (const student of students) {
          attendanceDocs.push({
            student: student._id,
            subject: subject._id,
            date,
            status: randomStatus(),
            markedBy: admin._id,
            remarks: "",
          });
        }
      }
    }

    // Insert in batches, ignoring any accidental duplicates
    try {
      await Attendance.insertMany(attendanceDocs, { ordered: false });
    } catch (err) {
      // ordered:false continues past duplicate key errors
    }

    console.log(`Attendance records created: ~${attendanceDocs.length}`);

    console.log("\n================ SEED COMPLETE ================");
    console.log("Admin login:");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${process.env.SEED_ADMIN_PASSWORD || "Admin@123"}`);
    console.log("\nSample student login:");
    console.log(`  Student ID: ST001`);
    console.log(`  Email: st001@example.com`);
    console.log(`  Password: Student@123`);
    console.log("=================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
