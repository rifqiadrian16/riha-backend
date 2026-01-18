const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema({
  pasien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  adminPembuat: {
    // Tambahan: Siapa admin yang merujuk
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  spesialisTujuan: {
    // Ini yang dipilih Admin (misal: "Penyakit Dalam")
    type: String,
    required: true,
  },
  // Field di bawah ini BOLEH KOSONG dulu (diisi Pasien nanti)
  rsTujuan: { type: String, default: null },
  dokterTujuan: { type: String, default: null },

  catatan: { type: String },
  status: {
    type: String,
    enum: ["menunggu_pilihan_pasien", "selesai"], // Status baru
    default: "menunggu_pilihan_pasien",
  },
  tanggal: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Referral", ReferralSchema);
