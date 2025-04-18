const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true, maxlength:500 },
  status: { type: String, default: "pending" },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "dept", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("category", categorySchema);
