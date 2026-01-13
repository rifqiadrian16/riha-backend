const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema({
  namaRS: {
    type: String,
    required: true,
  },
  alamat: {
    type: String,
    required: true,
  },
  // Kita simpan daftar poli & jadwal dalam bentuk Array
  poliTersedia: [
    {
      namaPoli: String, // Misal: Poli Bedah
      dokter: String, // Misal: Dr. Asep
      jamPraktek: String, // Misal: 08:00 - 12:00
      hari: String, // Misal: Senin - Jumat
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Referral", ReferralSchema);
