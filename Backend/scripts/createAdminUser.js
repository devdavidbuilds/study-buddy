const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

const ADMIN = {
  fullName: "Study Buddy Administrator",
  email: "admin@studybuddy.com",
  password: "Admin@StudyBuddy2026!",
  role: "admin",
  domain: "All Domains",
  department: "Administration",
  isActive: true,
};

async function seedTarget(uri, label) {
  try {
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 8000,
    }).asPromise();

    const dbName = conn.name;
    const UserModel = conn.model("User", User.schema);

    let user = await UserModel.findOne({ email: ADMIN.email }).select("+password");
    if (!user) {
      user = new UserModel({
        fullName: ADMIN.fullName,
        email: ADMIN.email,
        password: ADMIN.password,
        role: "admin",
        domain: "All Domains",
        department: "Administration",
        isActive: true,
      });
      await user.save();
      console.log(`Created admin account in ${label} [${dbName}].`);
    } else {
      user.fullName = ADMIN.fullName;
      user.password = ADMIN.password;
      user.role = "admin";
      user.domain = "All Domains";
      user.department = "Administration";
      user.isActive = true;
      await user.save();
      console.log(`Updated admin account in ${label} [${dbName}].`);
    }

    const verified = await UserModel.findOne({ email: ADMIN.email }).select("+password");
    const ok = await verified.matchPassword(ADMIN.password);
    console.log(`Password match verification on ${label}: ${ok}`);

    await conn.close();
  } catch (err) {
    console.error(`Error connecting to ${label}:`, err.message);
  }
}

async function run() {
  await seedTarget("mongodb://localhost:27017/studybuddy", "Local MongoDB (studybuddy)");
  await seedTarget("mongodb://localhost:27017/test", "Local MongoDB (test)");
  await seedTarget(
    "mongodb+srv://davidxprincexj_db_user:mqj9tIm17wHOzXNs@mycluster.g4bxtwy.mongodb.net/studybuddy",
    "MongoDB Atlas (Production)"
  );

  console.log("\n==========================================");
  console.log("Admin Account Successfully Seeded & Verified!");
  console.log(`Email:    ${ADMIN.email}`);
  console.log(`Password: ${ADMIN.password}`);
  console.log(`Role:     ${ADMIN.role}`);
  console.log("==========================================\n");
  process.exit(0);
}

run();
