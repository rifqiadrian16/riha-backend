const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Relasi ke tabel User
    required: true,
  },
  namaPasien: { type: String, required: true }, // Nama orang yang berobat
  noHp: { type: String, default: "" }, // No HP orang yang berobat
  catatan: { type: String, default: "" },
  poli: {
    type: String,
    required: true, // Contoh: 'Umum', 'Gigi', 'KIA'
  },
  nomorAntrean: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["menunggu", "dipanggil", "selesai", "dilewati", "batal"],
    default: "menunggu",
  },
  tanggal: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Queue", QueueSchema);
