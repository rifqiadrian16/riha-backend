const Queue = require("../models/Queue");

// controllers/queueController.js

exports.addQueue = async (req, res) => {
  try {
    // 1. Ambil data tambahan dari body (namaPasien, noHp, catatan)
    const { poli, namaPasien, noHp, catatan } = req.body;

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const lastQueue = await Queue.findOne({
      poli: poli,
      tanggal: { $gte: startToday },
    }).sort({ nomorAntrean: -1 });

    const nomorBaru = lastQueue ? lastQueue.nomorAntrean + 1 : 1;

    // 2. Simpan data lengkap ke database
    const newQueue = new Queue({
      user: req.user.id, // Tetap link ke akun pendaftar
      namaPasien: namaPasien, // <--- Simpan Nama Pasien Manual
      noHp: noHp,
      catatan: catatan,
      poli: poli,
      nomorAntrean: nomorBaru,
    });

    const queue = await newQueue.save();
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
    // Update status antrean berdasarkan ID
    const updatedQueue = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true },
    );
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
