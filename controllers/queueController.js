const Queue = require("../models/Queue");

// controllers/queueController.js

exports.addQueue = async (req, res) => {
  try {
    const { poli, namaPasien, noHp, catatan } = req.body;

    // --- [BARU] Poin 3: Validasi Jadwal (Jam Praktik) ---
    const now = new Date();
    const currentHour = now.getHours();
    // Contoh: Pendaftaran hanya buka jam 07:00 - 20:00
    if (currentHour < 7 || currentHour >= 20) {
      return res
        .status(400)
        .json({ msg: "Pendaftaran tutup. Buka jam 07:00 - 20:00 WIB." });
    }

    // --- [BARU] Poin 3: Validasi Kuota Harian ---
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    // Hitung jumlah antrean di poli ini hari ini
    const countQueue = await Queue.countDocuments({
      poli: poli,
      tanggal: { $gte: startToday },
    });

    const KUOTA_MAX = 50; // Batas kuota per poli
    if (countQueue >= KUOTA_MAX) {
      return res
        .status(400)
        .json({ msg: `Kuota ${poli} hari ini sudah penuh.` });
    }

    // Logika Nomor Antrean (Lanjutan kode lama)
    const lastQueue = await Queue.findOne({
      poli: poli,
      tanggal: { $gte: startToday },
    }).sort({ nomorAntrean: -1 });

    const nomorBaru = lastQueue ? lastQueue.nomorAntrean + 1 : 1;

    const newQueue = new Queue({
      user: req.user.id,
      namaPasien: namaPasien,
      noHp: noHp,
      catatan: catatan,
      poli: poli,
      nomorAntrean: nomorBaru,
      status: "menunggu", // Default status
    });

    const queue = await newQueue.save();

    // --- [BARU] Poin 2: Real-Time Trigger ---
    // Kirim sinyal ke semua client bahwa ada antrean baru
    const io = req.app.get("socketio");
    io.emit("queue_updated", { msg: "Ada antrean baru masuk!" });

    res.json(queue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// 2. Lihat Antrean Saya (History)
exports.getMyQueues = async (req, res) => {
  try {
    const queues = await Queue.find({ user: req.user.id }).sort({
      tanggal: -1,
    });
    res.json(queues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ... kode addQueue dan getMyQueues yang sudah ada ...

// 3. Update Status Antrean (Admin: Panggil / Selesaikan)
exports.updateQueueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedQueue = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true },
    );

    // --- [BARU] Poin 2: Real-Time Trigger ---
    // Kirim sinyal saat status berubah (misal: Admin memanggil pasien)
    const io = req.app.get("socketio");
    io.emit("queue_updated", { msg: "Status antrean berubah!" });

    res.json(updatedQueue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getAllQueues = async (req, res) => {
  try {
    // Ambil semua antrean hari ini
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const queues = await Queue.find({ tanggal: { $gte: startToday } }).sort({
      nomorAntrean: 1,
    });
    res.json(queues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ... import dan kode lainnya ...

// [BARU] Hapus Semua Antrean Hari Ini
exports.resetDailyQueue = async (req, res) => {
  try {
    // Tentukan range waktu hari ini (00:00:00 - 23:59:59)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Hapus data yang tanggalnya ada di range hari ini
    const result = await Queue.deleteMany({
      tanggal: { $gte: startOfDay, $lte: endOfDay },
    });

    // Kirim notifikasi real-time via Socket.io agar layar lain update otomatis
    const io = req.app.get("socketio");
    if (io) {
      io.emit("queue_updated", {
        msg: "Seluruh antrean hari ini telah di-reset oleh Admin.",
      });
    }

    res.json({
      msg: `Berhasil mereset ${result.deletedCount} antrean hari ini.`,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
