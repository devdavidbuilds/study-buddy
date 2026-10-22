const User = require("../models/User");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const serializeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  phone: user.phone,
  dateOfBirth: user.dateOfBirth,
  university: user.university,
  department: user.department,
  yearOfStudy: user.yearOfStudy,
  rollNumber: user.rollNumber,
});

// Register User
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      dateOfBirth,
      university,
      department,
      yearOfStudy,
      rollNumber,
    } = req.body;

    const requiredFields = {
      fullName,
      email,
      password,
      phone,
      dateOfBirth,
      university,
      department,
      yearOfStudy,
      rollNumber,
    };

    const missing = Object.keys(requiredFields).filter(
      (key) => !String(requiredFields[key] ?? "").trim()
    );

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}.`,
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (!/^\+?[0-9\s-]{7,20}$/.test(String(phone).trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number.",
      });
    }

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime()) || dob >= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth.",
      });
    }

    const year = Number(yearOfStudy);
    if (!Number.isInteger(year) || year < 1 || year > 6) {
      return res.status(400).json({
        success: false,
        message: "Year of study must be between 1 and 6.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // Public registration must not allow self-assignment of privileged roles.
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone: String(phone).trim(),
      dateOfBirth: dob,
      university,
      department,
      yearOfStudy: year,
      rollNumber,
      role: "student",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(" "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Profile Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ==============================
// PUT /api/auth/profile
// The logged-in user edits their own name, bio, contact/college details
// and notification preferences. Email, role and password cannot be
// changed here.
// ==============================
const PREFERENCE_KEYS = ["assignments", "courses", "achievements", "weeklyDigest"];

const updateProfile = async (req, res) => {
  try {
    const body = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const text = (value) => (typeof value === "string" ? value.trim() : undefined);
    if (body.fullName !== undefined) {
      const fullName = text(body.fullName);
      if (!fullName || fullName.length < 3 || fullName.length > 50) {
        return res.status(400).json({ success: false, message: "Full name must be 3-50 characters." });
      }
      user.fullName = fullName;
    }
    if (body.bio !== undefined) user.bio = text(body.bio) ?? "";
    if (body.phone !== undefined) {
      const phone = text(body.phone);
      if (phone && !/^\+?[0-9\s-]{7,20}$/.test(phone)) {
        return res.status(400).json({ success: false, message: "Invalid phone number." });
      }
      user.phone = phone || undefined;
    }
    for (const field of ["university", "department", "rollNumber"]) {
      if (body[field] !== undefined) user[field] = text(body[field]) || undefined;
    }
    if (body.yearOfStudy !== undefined && body.yearOfStudy !== "") {
      const year = Number(body.yearOfStudy);
      if (!Number.isInteger(year) || year < 1 || year > 6) {
        return res.status(400).json({ success: false, message: "Year of study must be between 1 and 6." });
      }
      user.yearOfStudy = year;
    }
    if (body.preferences && typeof body.preferences === "object") {
      for (const key of PREFERENCE_KEYS) {
        if (typeof body.preferences[key] === "boolean") user.preferences[key] = body.preferences[key];
      }
    }

    await user.save();
    const saved = await User.findById(user._id).select("-password");
    return res.status(200).json({ success: true, message: "Profile updated.", user: saved });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: Object.values(error.errors)[0]?.message || "Invalid profile details." });
    }
    console.error("Update Profile Error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update your profile." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};
