const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  state: { type: String, required: true },
  nationality: { type: String, required: true },
  profession: { type: String, required: true },
  roles: {
    type: [
      {
        type: String,
        enum: [
          "Super Admin",
          "Organization Admin",
          "Departmental Admin",
          "Member",
          "User",
        ],
      },
    ],
    default: ["User"], // Default role is "User"
    required: true,
  },
  organizations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  ],
  departments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dept",
    },
  ],
  createdAt: { type: Date, default: Date.now },
  interests: [{ type: String, required: true }],
  profilePicture: { type: String, default: null },
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
