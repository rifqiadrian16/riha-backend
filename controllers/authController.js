const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. Logika Register (Daftar Akun)
exports.register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    // Cek apakah user sudah ada
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email sudah terdaftar" });

    // Enkripsi Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan User Baru
    user = new User({
      nama,
      email,
      password: hashedPassword,
      role: role || "pasien",
    });

    await user.save();
    res.status(201).json({ msg: "Registrasi Berhasil! Silakan Login." });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 2. Logika Login (Masuk)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email tidak ditemukan" });

    // Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Password salah" });

    // Buat Token (Tiket Masuk)
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user.id, nama: user.nama, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};
