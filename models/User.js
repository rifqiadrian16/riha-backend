const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  passowrd: { type: String, required: true },
  tanggalLahir: { type: Date },
  role: {
    type: String,
    enum: ["pasien", "admin"],
    default: "pasien",
  },
  noHp: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.export = mongoose.model("User", UserSchema);
