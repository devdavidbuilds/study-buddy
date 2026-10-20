const User = require("../models/User");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const axios = require("axios");

// ==============================
// Register User
// ==============================
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    // Validate password length
    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // Public registration must never allow a caller to self-assign a
    // privileged role. Faculty/admin accounts require a protected flow.
    const user = await User.create({
      fullName,
      email,
      password,
      role: "student",
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
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

// ==============================
// Login User
// ==============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    // Find user including password
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
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

// ==============================
// Get Profile
// ==============================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ==============================
// Google OAuth Initiation
// ==============================
const googleAuth = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/auth/google/callback";

  if (!googleClientId) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        "Google OAuth is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Backend/.env"
      )}`
    );
  }

  const { role } = req.query;
  const state = JSON.stringify({ role: role || "student" });

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  return res.redirect(`${rootUrl}?${params.toString()}`);
};

// ==============================
// Google OAuth Callback
// ==============================
const googleCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const { code, error, state } = req.query;

  if (error) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        "Google sign-in was canceled or access was denied."
      )}`
    );
  }

  if (!code) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        "Authorization code was not received from Google."
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

    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Fetch user details from Google
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const googleUser = userInfoResponse.data;
    const { sub: googleId, email, name, picture } = googleUser;

    if (!email) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          "Google account did not provide an email address."
        )}`
      );
    }

    // Determine target role from state if provided
    let requestedRole = "student";
    try {
      if (state) {
        const parsedState = JSON.parse(state);
        if (parsedState?.role && ["student", "faculty"].includes(parsedState.role)) {
          requestedRole = parsedState.role;
        }
      }
    } catch {
      // Ignore state parsing errors
    }

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [
        { googleId },
        { email: email.toLowerCase() },
      ],
    });

    if (user) {
      let isModified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        isModified = true;
      }
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        isModified = true;
      }
      if (isModified) {
        await user.save();
      }
    } else {
      // Create new user authenticated via Google
      user = await User.create({
        fullName: name || email.split("@")[0],
        email: email.toLowerCase(),
        googleId,
        profileImage: picture || "",
        role: requestedRole,
        authProvider: "google",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.redirect(`${frontendUrl}/login?token=${token}`);
  } catch (err) {
    console.error("Google Callback Error:", err?.response?.data || err.message);
    const message =
      err?.response?.data?.error_description ||
      err.message ||
      "Failed to authenticate with Google.";
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(message)}`
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