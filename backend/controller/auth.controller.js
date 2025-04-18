const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      phoneNumber,
      state,
      nationality,
      profession,
      residenceType,
      interests, 
    } = req.body;

    // Validate interests array
    if (!Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        message: "Interests must be a non-empty array",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with interests
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      gender,
      phoneNumber,
      state,
      nationality,
      profession,
      residenceType,
      interests, // Added new field
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        interests: newUser.interests,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};
