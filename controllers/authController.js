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

exports.getProfile = async (req, res) => {
  try {
    // req.user.id didapat dari middleware auth
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// 4. UPDATE PROFIL (PUT)
exports.updateProfile = async (req, res) => {
  try {
    const { nama, email, noHp } = req.body;

    // Cari user
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    // Update field jika ada input baru
    if (nama) user.nama = nama;
    if (email) user.email = email;
    if (noHp) user.noHp = noHp;

    await user.save();

    // Kembalikan data user tanpa password
    const userResponse = await User.findById(req.user.id).select("-password");
    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
