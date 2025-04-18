const express = require("express");
const router = express.Router();

const userController = require("../controller/user.controller");
const authenticateToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");

router.get("/roles", authenticateToken, userController.getAllRoles);
router.get("/all", authenticateToken, userController.getAllUsers);
router.get("/:userId", authenticateToken, userController.getUserById);

module.exports = router;
