const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

const ADMIN_CREDENTIALS = {
  fullName: "Study Buddy Administrator",
  email: "admin@studybuddy.com",
  password: "Admin@StudyBuddy2026!",
  role: "admin",
  domain: "All Domains",
  department: "Administration",
  isActive: true,
};

async function seedAdminToUri(uri, label) {
  try {
    console.log(`\nConnecting to ${label}...`);
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 8000,
    }).asPromise();
    console.log(`Connected to ${label}!`);

    const UserModel = conn.model("User", User.schema);

    let existing = await UserModel.findOne({ email: ADMIN_CREDENTIALS.email });

    if (existing) {
      existing.fullName = ADMIN_CREDENTIALS.fullName;
      existing.password = ADMIN_CREDENTIALS.password; // pre("save") hook hashes this automatically
      existing.role = "admin";
      existing.domain = "All Domains";
      existing.department = "Administration";
      existing.isActive = true;
      await existing.save();
      console.log(`Updated existing Admin user on ${label}.`);
    } else {
      await UserModel.create({
        fullName: ADMIN_CREDENTIALS.fullName,
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password, // pre("save") hook hashes this automatically
        role: "admin",
        domain: "All Domains",
        department: "Administration",
        isActive: true,
      });
      console.log(`Created new Admin user on ${label}.`);
    }

    await conn.close();
  } catch (err) {
    console.error(`Failed on ${label}:`, err.message);
  }
}

async function run() {
  const atlasUri = "mongodb+srv://davidxprincexj_db_user:mqj9tIm17wHOzXNs@mycluster.g4bxtwy.mongodb.net/studybuddy";
  const localUri = process.env.MONGODB_URI || "mongodb://localhost:27017/studybuddy";

  // First seed to MongoDB Atlas (Production)
  await seedAdminToUri(atlasUri, "MongoDB Atlas (Production)");

  // Then seed to Local MongoDB (if reachable)
  if (localUri && !localUri.includes("mongodb+srv")) {
    await seedAdminToUri(localUri, "Local MongoDB");
  }

  console.log("\n==========================================");
  console.log("Admin Account Setup Completed!");
  console.log(`Email:    ${ADMIN_CREDENTIALS.email}`);
  console.log(`Password: ${ADMIN_CREDENTIALS.password}`);
  console.log(`Role:     ${ADMIN_CREDENTIALS.role}`);
  console.log("==========================================\n");
  process.exit(0);
}

run();
