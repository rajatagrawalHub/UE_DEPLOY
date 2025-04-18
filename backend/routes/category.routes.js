const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");
const categoryController = require("../controller/category.controller");

router.get("/", authenticateToken, checkRole(["Organization Admin"]), categoryController.getAllCategories);
router.get("/oget", authenticateToken, checkRole(["Organization Admin"]), categoryController.getCategoriesOrgAdmin);

router.post(
  "/add",
  authenticateToken,
  checkRole(["Departmental Admin"]),
  categoryController.addCategory
);

router.patch(
  "/approve/:categoryId",
  authenticateToken,
  checkRole(["Organization Admin"]),
  categoryController.approveCategory
);

router.delete(
  "/delete/:categoryId",
  authenticateToken,
  checkRole(["Organization Admin"]),
  categoryController.deleteCategory
);

module.exports = router;
