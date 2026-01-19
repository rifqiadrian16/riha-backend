const Queue = require("../models/Queue");

exports.addQueue = async (req, res) => {
  try {
    const { poli, namaPasien, noHp, catatan } = req.body;

    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < 7 || currentHour >= 20) {
      return res
        .status(400)
        .json({ msg: "Pendaftaran tutup. Buka jam 07:00 - 20:00 WIB." });
    }

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    const countQueue = await Queue.countDocuments({
      poli: poli,
      tanggal: { $gte: startToday },
    });

    const KUOTA_MAX = 50;
    if (countQueue >= KUOTA_MAX) {
      return res
        .status(400)
        .json({ msg: `Kuota ${poli} hari ini sudah penuh.` });
    }

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
      status: "menunggu",
    });

    const queue = await newQueue.save();

    const io = req.app.get("socketio");
    io.emit("queue_updated", { msg: "Ada antrean baru masuk!" });

    res.json(queue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

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

exports.updateQueueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedQueue = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true },
    );

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

exports.resetDailyQueue = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Queue.deleteMany({
      tanggal: { $gte: startOfDay, $lte: endOfDay },
    });

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
