const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");
const authenticateToken = require("../middleware/auth.middleware");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/logout", authController.logout);

router.get("/current", authenticateToken, async (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
