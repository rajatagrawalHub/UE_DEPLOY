const express = require("express");
const router = express.Router();
const feedbackController = require("../controller/feedback.controller");
const authenticateToken = require("../middleware/auth.middleware");

router.post("/submit/:eventId", authenticateToken, feedbackController.submitFeedback);
router.get("/view/:eventId", authenticateToken, feedbackController.getEventFeedback);
router.get("/certificate/:eventId", authenticateToken, feedbackController.downloadCertificate);
router.get("/summary/ai/:eventId", authenticateToken, feedbackController.getEventFeedbackSummaryAI);

module.exports = router;