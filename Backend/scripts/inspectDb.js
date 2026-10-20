const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const CourseProgress = require("../models/CourseProgress");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/studybuddy");
    console.log("Connected to MongoDB");

    const users = await User.find({}, "fullName email role").lean();
    console.log("Users count:", users.length);
    console.log("Users:", users);

    const courses = await Course.find({}, "courseName courseCode faculty").lean();
    console.log("Courses count:", courses.length);
    console.log("Sample courses:", courses.slice(0, 5));

    const assignments = await Assignment.find({}).lean();
    console.log("Assignments count:", assignments.length);
    console.log("Assignments:", assignments.map(a => ({
      id: a._id,
      title: a.title,
      course: a.course,
      faculty: a.faculty,
      moduleId: a.moduleId,
      lessonId: a.lessonId,
      status: a.status
    })));

    const progressWithAssignments = await CourseProgress.find({
      "assignments.0": { $exists: true }
    }).lean();

    console.log("Progress with assignments count:", progressWithAssignments.length);
    for (const p of progressWithAssignments) {
      console.log("Progress ID:", p._id, "User:", p.user, "Course:", p.course);
      console.log("Assignments array:", JSON.stringify(p.assignments, null, 2));
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
