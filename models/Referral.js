const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema({
  pasien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  namaPasien: { type: String, required: true },
  adminPembuat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  spesialisTujuan: {
    type: String,
    required: true,
  },

  rsTujuan: { type: String, default: null },
  dokterTujuan: { type: String, default: null },

  catatan: { type: String },
  status: {
    type: String,
    enum: ["menunggu_pilihan_pasien", "selesai"],
    default: "menunggu_pilihan_pasien",
  },
  tanggal: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Referral", ReferralSchema);
