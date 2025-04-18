const express = require("express");
const router = express.Router();

const eventController = require("../controller/event.controller");

const authenticateToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");

router.post(
  "/create",
  authenticateToken,
  checkRole(["Departmental Admin"]),
  eventController.createEvent
);

router.patch(
  "/:eventId/edit",
  authenticateToken,
  checkRole(["Organization Admin", "Departmental Admin"]),
  eventController.editEvent
);

router.get("/all", authenticateToken, eventController.getAllEvents);
router.get("/oall", authenticateToken, eventController.getOAllEvents);

router.get(
  "/:eventId",
  authenticateToken,
  checkRole(["Departmental Admin"]),
  eventController.getOneEvent
);

router.delete(
  "/:eventId",
  authenticateToken,
  checkRole(["Departmental Admin"]),
  eventController.deleteEvent
);

router.patch(
  "/:eventId/approve",
  authenticateToken,
  checkRole(["Organization Admin"]),
  eventController.acceptEvent
);

router.patch(
  "/:eventId/reject",
  authenticateToken,
  checkRole(["Organization Admin"]),
  eventController.rejectEvent
);

router.post(
  "/:eventId/register",
  authenticateToken,
  checkRole(["Member", "User"]),
  eventController.registerForEvent
);

router.delete(
  "/:eventId/deregister",
  authenticateToken,
  checkRole(["Member", "User"]),
  eventController.deregisterFromEvent
);

router.post(
  "/:eventId/summary",
  authenticateToken,
  checkRole(["Departmental Admin"]),
  eventController.uploadSummary
);


router.get("/department/:deptId", authenticateToken, eventController.getDepartmentEvents);


module.exports = router;
