const jwt = require("jsonwebtoken");
const User = require("../models/User");

<<<<<<< HEAD
// Protect routes using JWT
=======
// ==============================
// Protect Routes
// ==============================
>>>>>>> origin/main
const protect = async (req, res, next) => {
  try {
    let token;

<<<<<<< HEAD
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
=======
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
>>>>>>> origin/main
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token not found.",
      });
    }

<<<<<<< HEAD
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

=======
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch latest user details
>>>>>>> origin/main
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    req.user = user;
<<<<<<< HEAD
=======

>>>>>>> origin/main
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

<<<<<<< HEAD
// Authorize specific user roles
=======
// ==============================
// Role Authorization
// ==============================
>>>>>>> origin/main
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource.",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};