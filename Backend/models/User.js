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
<<<<<<< HEAD
      required: function () {
        return !this.googleId;
      },
=======
      required: [true, "Password is required"],
>>>>>>> origin/main
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [100, "Password cannot exceed 100 characters"],
      select: false,
    },

<<<<<<< HEAD
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

=======
>>>>>>> origin/main
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },

    profileImage: {
      type: String,
      default: "",
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

// Clean data before saving
userSchema.pre("save", function (next) {
  this.fullName = this.fullName.trim();
  this.email = this.email.trim().toLowerCase();
  next();
});

// Hash password
userSchema.pre("save", async function (next) {
<<<<<<< HEAD
  if (!this.password || !this.isModified("password")) {
=======
  if (!this.isModified("password")) {
>>>>>>> origin/main
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);