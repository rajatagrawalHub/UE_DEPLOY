const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .json({ message: "Access Denied. No token provided." });

  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("-Password"); // Fetch user and exclude password

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found. Invalid token." });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    }
    return res.status(403).json({ message: "Invalid Token." });
  }
};

module.exports = authenticateToken;
