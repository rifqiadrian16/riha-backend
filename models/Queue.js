const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  namaPasien: { type: String, required: true },
  noHp: { type: String, default: "" },
  catatan: { type: String, default: "" },
  poli: {
    type: String,
    required: true,
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
