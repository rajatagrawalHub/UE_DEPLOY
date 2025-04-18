const mongoose = require("mongoose");

const deptSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  category: [{ type: String, required: true }],
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "org",
    required: false,
  },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  event: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const deptModel = mongoose.model("dept", deptSchema);
module.exports = deptModel;
