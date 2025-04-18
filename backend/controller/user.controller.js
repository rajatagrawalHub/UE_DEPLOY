const userModel = require("../models/user.model");

exports.getAllRoles = async (req, res) => {
  try {
    // Get authenticated user's roles
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      roles: user.roles,
    });
  } catch (error) {
    console.error("Get Roles Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await userModel.find().select("-password"); // Exclude password field for security

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await userModel.findById(userId).select("name email roles");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};
