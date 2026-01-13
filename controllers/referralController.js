const Referral = require("../models/Referral");

// 1. Tambah Data RS (Untuk Admin)
exports.addReferral = async (req, res) => {
  try {
    const { namaRS, alamat, poliTersedia } = req.body;

    const newReferral = new Referral({
      namaRS,
      alamat,
      poliTersedia,
    });

    const referral = await newReferral.save();
    res.json(referral);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// 2. Ambil Semua Data Rujukan (Untuk Pasien)
exports.getAllReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find();
    res.json(referrals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
