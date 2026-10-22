const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
      minlength: [3, "Full Name must be at least 3 characters"],
      maxlength: [50, "Full Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [100, "Password cannot exceed 100 characters"],
      select: false,
    },

    // Registration details. Not required at schema level so existing and
    // seeded accounts stay valid; registerUser enforces them for new signups.
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9\s-]{7,20}$/, "Please enter a valid phone number"],
    },

    dateOfBirth: {
      type: Date,
    },

    university: {
      type: String,
      trim: true,
      maxlength: [120, "Institution name cannot exceed 120 characters"],
    },

    department: {
      type: String,
      trim: true,
      maxlength: [80, "Department cannot exceed 80 characters"],
    },

    yearOfStudy: {
      type: Number,
      min: [1, "Year of study must be between 1 and 6"],
      max: [6, "Year of study must be between 1 and 6"],
    },

    rollNumber: {
      type: String,
      trim: true,
      maxlength: [30, "Roll number cannot exceed 30 characters"],
    },

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },

    profileImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },
    // Login tracking for the faculty Students page: set on every
    // successful login, and lastSeenAt refreshed (at most once a minute)
    // on authenticated requests — see middleware/authMiddleware.
    lastLoginAt: { type: Date, default: null },
    lastSeenAt: { type: Date, default: null },
    loginCount: { type: Number, default: 0, min: 0 },
    // Notification choices from the Settings page.
    preferences: {
      assignments: { type: Boolean, default: true },
      courses: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Normalize user details before saving.
userSchema.pre("save", function (next) {
  if (this.fullName) this.fullName = this.fullName.trim();
  if (this.email) this.email = this.email.trim().toLowerCase();
  next();
});

// Hash local passwords before saving.
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password during login.
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
