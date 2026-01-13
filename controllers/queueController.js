const Queue = require("../models/Queue");

// 1. Ambil Nomor Antrean Baru
exports.addQueue = async (req, res) => {
  try {
    const { poli } = req.body;

    // Cari antrean terakhir di poli tersebut HARI INI
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const lastQueue = await Queue.findOne({
      poli: poli,
      tanggal: { $gte: startToday },
    }).sort({ nomorAntrean: -1 }); // Urutkan dari yang terbesar

    // Tentukan nomor baru
    const nomorBaru = lastQueue ? lastQueue.nomorAntrean + 1 : 1;

    // Simpan ke database
    const newQueue = new Queue({
      user: req.user.id, // Didapat dari middleware auth
      poli,
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

    // Cek apakah status yang dikirim valid sesuai Model
    if (!["menunggu", "dipanggil", "selesai"].includes(status)) {
      return res.status(400).json({ msg: "Status tidak valid" });
    }

    // Cari antrean berdasarkan ID di URL
    let queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ msg: "Antrean tidak ditemukan" });
    }

    // Update status
    queue.status = status;
    await queue.save();

    res.json(queue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
