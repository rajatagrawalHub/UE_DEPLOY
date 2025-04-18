const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");
const typeController = require("../controller/type.controller");

// Fetch all types
router.get("/", authenticateToken, typeController.getAllTypes);

// Add a new type
router.post(
  "/add",
  authenticateToken,
  checkRole(["Organization Admin"]),
  typeController.addType
);

// Approve a type
router.patch(
  "/approve/:typeId",
  authenticateToken,
  checkRole(["Super Admin"]),
  typeController.approveType
);

router.delete(
  "/delete/:typeId",
  authenticateToken,
  checkRole(["Super Admin"]),
  typeController.deleteType
);

module.exports = router;
