require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    // Find the existing user
    const user = await User.findOne({
      email: "david@gmail.com",
    });

    if (!user) {
      console.log("❌ User not found.");
      process.exit(1);
    }

    // Set a new password
    user.password = "password123";

    // Save user
    // User.js should automatically hash the password
    await user.save();

    console.log("✅ Password reset successfully!");
    console.log("Email: david@gmail.com");
    console.log("Password: password123");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting password:", error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

resetPassword();