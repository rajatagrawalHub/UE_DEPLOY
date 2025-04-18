const mongoose = require("mongoose");
const { create } = require("./org.model");

const typeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "pending" },
  organization: {type: mongoose.Schema.Types.ObjectId, ref: "org"},
  createat: { type: Date, default: Date.now },
});

const typeModel = mongoose.model("type", typeSchema);
module.exports = typeModel;
