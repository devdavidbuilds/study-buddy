require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const createFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const existingUser = await User.findOne({
            email: "faculty@studybuddy.com",
        });

        if (existingUser) {
            console.log("Faculty account already exists.");
            process.exit(0);
        }

        await User.create({
            fullName: "Study Buddy Faculty",
            email: "faculty@studybuddy.com",
            password: "Faculty@123",
            role: "faculty",
        });

        console.log("✅ Faculty account created!");
        console.log("Email: faculty@studybuddy.com");
        console.log("Password: Faculty@123");
        console.log("Role: faculty");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

createFaculty();