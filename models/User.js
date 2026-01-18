const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tanggalLahir: { type: Date },
  role: {
    type: String,
    enum: ["pasien", "admin"],
    default: "pasien",
  },
  noHp: { type: String, default: "" },

  isVerified: { type: Boolean, default: false },
  activationToken: { type: String },

  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
