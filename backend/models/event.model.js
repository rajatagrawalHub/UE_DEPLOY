const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true, maxlength: 500 },

  tag: [{ type: String, required: true }],

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "dept",
    required: true,
  },
  category: { type: String, required: true },

  startDate: { type: Date, required: true },
  regStartDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  regEndDate: { type: Date, required: true },

  startTime: { type: String, required: true },
  endTime: { type: String, required: true },

  numberOfDays: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },

  mode: { type: String, required: true, enum: ["Online", "Offline", "Hybrid"] },
  venue: { type: String, required: true },

  collaboration: [
    { type: mongoose.Schema.Types.ObjectId, ref: "dept", required: false },
  ],

  budget: { type: String, required: true },
  budgetAmount: { type: Number, default: 0 },
  tags: [{ type: String, required: true }],
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  approvalStatus: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Approved", "Rejected", "Freezed"],
  },

  statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  remarks: { type: String, default: "" },
  summary: { type: String, default: "" },

  internalParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  externalParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attendedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  certificate: { type: Boolean, required: true },
});

const eventModel = mongoose.model("event", eventSchema);
module.exports = eventModel;
