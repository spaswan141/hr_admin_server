const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// =======================
// Register Controller
// =======================
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const newUser = new User({ fullName, email, password });
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// =======================
// Login Controller
// =======================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const authResult = await User.authenticate(email, password);

    if (!authResult.success) {
      return res.status(400).json(authResult);
    }

    const token = jwt.sign(
      { id: authResult.user._id, email: authResult.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: authResult.user._id,
        fullName: authResult.user.fullName,
        email: authResult.user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
// =======================
// Login Controller
// =======================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const authResult = await User.authenticate(email, password);

    if (!authResult.success) {
      return res.status(400).json(authResult);
    }

    const token = jwt.sign(
      { id: authResult.user._id, email: authResult.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: authResult.user._id,
        fullName: authResult.user.fullName,
        email: authResult.user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}