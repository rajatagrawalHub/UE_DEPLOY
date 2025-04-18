const express = require("express");
const router = express.Router();
const departmentController = require("../controller/department.controller");
const authenticateToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");

router.post(
  "/create",
  authenticateToken,
  checkRole(["Organization Admin"]),
  departmentController.create
);

router.patch(
  "/:deptId/edit",
  authenticateToken,
  checkRole(["Organization Admin"]),
  departmentController.edit
);

router.delete(
  "/:deptId",
  authenticateToken,
  checkRole(["Super Admin", "Organization Admin"]),
  departmentController.delete
);

router.post(
  "/:deptId/add-users",
  authenticateToken,
  checkRole(["Departmental Admin"]),
  departmentController.addUsers
);

router.post(
  "/:deptId/assign-admin",
  authenticateToken,
  checkRole(["Organization Admin"]),
  departmentController.assignAdmin
);

router.get("/", authenticateToken, departmentController.getAllDepartments);
router.get("/:deptId", authenticateToken, departmentController.getOne);

router.post(
  "/:deptId/replace-admin",
  authenticateToken,
  checkRole(["Organization Admin"]),
  departmentController.replaceAdmin
);

router.get(
  "/admin/departments",
  authenticateToken,
  checkRole(["Departmental Admin"]),
  departmentController.getDepartmentsByAdmin
);
router.get(
  "/collaboration/:deptId",
  authenticateToken,
  departmentController.getCollaborationDepartments
);

module.exports = router;
