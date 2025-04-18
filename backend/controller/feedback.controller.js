const Feedback = require("../models/feedback.model");
const eventModel = require("../models/event.model");
const userModel = require("../models/user.model");
const { createCertificatePDF } = require("../utils/certificate.helper");

exports.submitFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { answers } = req.body;

    const event = await eventModel.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user._id;
    const hasAttended = event.attendedParticipants.includes(userId);
    if (!hasAttended)
      return res.status(403).json({ message: "Only attendees can submit feedback" });

    await Feedback.create({ event: eventId, user: userId, answers });
    res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Submit Feedback Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const feedbacks = await Feedback.find({ event: eventId }).select("-user").lean();
    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error("Get Feedback Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.downloadCertificate = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await eventModel.findById(eventId);
    if (!event || !event.certificate)
      return res.status(400).json({ message: "Certificate not available for this event" });

    const hasAttended = event.attendedParticipants.includes(userId);
    if (!hasAttended)
      return res.status(403).json({ message: "Only attendees can download certificate" });

    const user = await userModel.findById(userId);
    const pdfBuffer = await createCertificatePDF(user.name, event.title);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${user.name}_Certificate.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Download Certificate Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const { generateFeedbackSummary } = require("../utils/geminiSummary.helper");

exports.getEventFeedbackSummaryAI = async (req, res) => {
  try {
    const { eventId } = req.params;
    const feedbacks = await Feedback.find({ event: eventId }).lean();
    if (!feedbacks.length) return res.status(404).json({ message: "No feedbacks found" });

    const summary = await generateFeedbackSummary(feedbacks);
    res.status(200).json({ summary });
  } catch (err) {
    console.error("AI summary error:", err);
    res.status(500).json({ message: err.message });
  }
};
