const express = require("express");
const router = express.Router();
const orgController = require("../controller/org.controller");
const authenticateToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");

router.post(
  "/create",
  authenticateToken,
  checkRole(["Super Admin"]),
  orgController.create
);
router.patch(
  "/:orgId/edit",
  authenticateToken,
  checkRole(["Super Admin", "Organization Admin"]),
  orgController.edit
);
router.delete(
  "/:orgId",
  authenticateToken,
  checkRole(["Super Admin", "Organization Admin"]),
  orgController.delete
);
router.post(
  "/:orgId/add-users",
  authenticateToken,
  checkRole(["Organization Admin"]),
  orgController.addUsers
);

router.post(
  "/assign-admin",
  authenticateToken,
  checkRole(["Super Admin"]),
  orgController.assignOrgAdminByName
);

router.post(
  "/edit-admin",
  authenticateToken,
  checkRole(["Super Admin"]),
  orgController.editAdmin
);


router.get("/all", authenticateToken, orgController.getAllOrganizations);

router.get("/:orgId", authenticateToken, orgController.getOrganizationById);

module.exports = router;
