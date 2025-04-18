const mongoose = require("mongoose");

const orgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  types: [{ type: String, required: true }],
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  poc: { type: String, required: true },
  contact: { type: String, required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "dept" }],
  event: [{ type: mongoose.Schema.Types.ObjectId, ref: "event" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  memberDomain: [{ type: String }],
});

const orgModel = mongoose.model("org", orgSchema);
module.exports = orgModel;
