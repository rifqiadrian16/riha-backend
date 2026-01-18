const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. Logika Register (Daftar Akun)
// exports.register = async (req, res) => {
//   try {
//     const { nama, email, username, tanggalLahir, password, role } = req.body;

//     // Cek apakah user sudah ada
//     let user = await User.findOne({ email });
//     if (user) return res.status(400).json({ msg: "Email sudah terdaftar" });

//     if (username) {
//       let usernameCheck = await User.findOne({ username });
//       if (usernameCheck)
//         return res.status(400).json({ msg: "Username Sudah Dipakai" });
//     }

//     // Enkripsi Password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Simpan User Baru
//     user = new User({
//       nama,
//       email,
//       username: username || "",
//       password: hashedPassword,
//       tanggalLahir: tanggalLahir,
//       role: role || "pasien",
//     });

//     await user.save();
//     res.status(201).json({ msg: "Registrasi Berhasil! Silakan Login." });
//   } catch (err) {
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };

exports.register = async (req, res) => {
  console.log("--- 1. Request Register Masuk ---");
  console.log("Body:", req.body); // Cek apakah data sampai

  try {
    const { nama, email, username, password, tanggalLahir, role } = req.body;

    console.log("--- 2. Cek Kelengkapan Data ---");
    // Validasi Manual
    if (!nama || !email || !username || !password || !tanggalLahir) {
      console.log("DATA TIDAK LENGKAP!");
      return res.status(400).json({ msg: "Mohon lengkapi semua data" });
    }

    console.log("--- 3. Cek Email di DB ---");
    let userCheck = await User.findOne({ email });
    if (userCheck) {
      console.log("Email sudah ada");
      return res.status(400).json({ msg: "Email sudah terdaftar" });
    }

    console.log("--- 4. Cek Username di DB ---");
    if (username) {
      let usernameCheck = await User.findOne({ username });
      if (usernameCheck) {
        console.log("Username sudah ada");
        return res.status(400).json({ msg: "Username sudah dipakai" });
      }
    }

    console.log("--- 5. Mulai Hashing Password ---");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("--- 6. Siapkan Object User Baru ---");
    const newUser = new User({
      nama,
      email,
      username,
      password: hashedPassword,
      tanggalLahir,
      role: role || "pasien",
    });

    console.log("--- 7. Coba Simpan ke Database ---");
    await newUser.save();
    console.log("--- 8. BERHASIL SIMPAN! ---");

    res.status(201).json({ msg: "Registrasi Berhasil! Silakan Login." });
  } catch (err) {
    // INI YANG KITA CARI:
    console.log("!!! ERROR TERTANGKAP DI CATCH !!!");
    console.error(err); // Akan mencetak error lengkap
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// 2. Logika Login (Masuk)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Cek User
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) return res.status(400).json({ msg: "Akun tidak ditemukan" });

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
