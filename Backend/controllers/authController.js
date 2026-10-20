const User = require("../models/User");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const axios = require("axios");

// Register User
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
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
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
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
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
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

// Google OAuth Initiation
const googleAuth = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/auth/google/callback";

  if (!googleClientId) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        "Google OAuth is not configured. Configure Google credentials in Backend/.env."
      )}`
    );
  }

  const state = JSON.stringify({
    role: req.query.role === "faculty" ? "faculty" : "student",
  });

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
};

// Google OAuth Callback
const googleCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const { code, error, state } = req.query;

  if (error || !code) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        error
          ? "Google sign-in was canceled or access was denied."
          : "Authorization code was not received from Google."
      )}`
    );
  }

  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5000/api/auth/google/callback";

    if (!googleClientId || !googleClientSecret) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          "Google credentials are missing in the server environment."
        )}`
      );
    }

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const {
      sub: googleId,
      email,
      name,
      picture,
    } = userInfoResponse.data;

    if (!email) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          "Google account did not provide an email address."
        )}`
      );
    }

    let requestedRole = "student";

    try {
      const parsedState = JSON.parse(state || "{}");
      if (["student", "faculty"].includes(parsedState.role)) {
        requestedRole = parsedState.role;
      }
    } catch {
      // Use student as the safe default.
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      let changed = false;

      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }

      if (!user.profileImage && picture) {
        user.profileImage = picture;
        changed = true;
      }

      if (changed) await user.save();
    } else {
      user = await User.create({
        fullName: name || email.split("@")[0],
        email: email.toLowerCase(),
        googleId,
        profileImage: picture || "",
        role: requestedRole,
        authProvider: "google",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.redirect(
      `${frontendUrl}/login?token=${encodeURIComponent(token)}`
    );
  } catch (err) {
    console.error("Google Callback Error:", err?.response?.data || err.message);
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        "Failed to authenticate with Google."
      )}`
    );
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  googleAuth,
  googleCallback,
};
