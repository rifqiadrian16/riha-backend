const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noreply.riha@gmail.com",
    pass: "bidq tcab vgvm tour",
  },
});

// 1. Logika Register (Daftar Akun)
// exports.register = async (req, res) => {
//   try {
//     const { nama, email, username, password, tanggalLahir, role } = req.body;

//     // Cek Email & Username
//     let user = await User.findOne({ email });
//     if (user) return res.status(400).json({ msg: "Email sudah terdaftar" });

//     if (username) {
//       let userCheck = await User.findOne({ username });
//       if (userCheck)
//         return res.status(400).json({ msg: "Username sudah dipakai" });
//     }

//     // Hash Password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // [BARU] Buat Token Aktivasi (Random String)
//     const activationToken = crypto.randomBytes(32).toString("hex");

//     // Simpan User (Status isVerified: false)
//     const newUser = new User({
//       nama,
//       email,
//       username,
//       password: hashedPassword,
//       tanggalLahir,
//       role: role || "pasien",
//       isVerified: false, // Belum aktif
//       activationToken: activationToken, // Simpan token
//     });

//     await newUser.save();

//     const payload = {
//       user: {
//         id: user.id,
//       },
//     };

//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     // [BARU] Kirim Email Aktivasi
//     // Ganti URL frontend sesuai port Vue Anda (biasanya http://localhost:5173)
//     const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

//     const activationLink = `${clientUrl}/activate/${token}`;

//     const mailOptions = {
//       from: '"RiHa Admin" <no-reply@riha.com>',
//       to: email,
//       subject: "Aktivasi Akun RiHa Medical Center",
//       html: `
//         <h3>Halo, ${nama}!</h3>
//         <p>Terima kasih telah mendaftar. Silakan klik link di bawah ini untuk mengaktifkan akun Anda:</p>
//         <a href="${activationLink}" style="background:#1d64f2; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">AKTIFKAN AKUN SAYA</a>
//         <p>Atau copy link ini: ${activationLink}</p>
//         <p>Link ini berlaku selamanya sampai Anda mengkliknya.</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(201).json({
//       msg: "Registrasi Berhasil! Silakan cek email Anda untuk aktivasi akun.",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };

exports.register = async (req, res) => {
  try {
    const { nama, email, username, password, tanggalLahir, role } = req.body;

    // 1. Cek Email apakah sudah terdaftar
    // Variabel 'user' ini isinya null jika belum terdaftar
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email sudah terdaftar" });

    // 2. Cek Username
    if (username) {
      let userCheck = await User.findOne({ username });
      if (userCheck)
        return res.status(400).json({ msg: "Username sudah dipakai" });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. (Opsional) Buat Token Random untuk database
    // Ini berguna jika validasi backend Anda mencocokkan string di database
    const activationToken = crypto.randomBytes(32).toString("hex");

    // 5. Siapkan Object User Baru
    // Perhatikan nama variabelnya adalah 'newUser'
    const newUser = new User({
      nama,
      email,
      username,
      password: hashedPassword,
      tanggalLahir,
      role: role || "pasien",
      isVerified: false,
      activationToken: activationToken,
    });

    // 6. SIMPAN KE DATABASE
    // Setelah baris ini dijalankan, newUser akan memiliki .id (atau ._id)
    await newUser.save();

    // --- [PERBAIKAN UTAMA ADA DI SINI] ---
    const payload = {
      user: {
        // GUNAKAN 'newUser.id', BUKAN 'user.id'
        // Karena 'user' di atas nilainya null.
        id: newUser.id,
      },
    };

    // 7. Buat JWT Token untuk Link Email
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 8. Kirim Email
    // Mengambil CLIENT_URL dari env (prioritas) atau localhost (fallback)
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // Link mengarah ke frontend, misal: http://localhost:5173/activate/eyJhbG...
    const activationLink = `${clientUrl}/activate/${token}`;

    const mailOptions = {
      from: '"RiHa Admin" <no-reply@riha.com>',
      to: email,
      subject: "Aktivasi Akun RiHa Medical Center",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3 style="color: #1d64f2;">Halo, ${nama}!</h3>
          <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk mengaktifkan akun Anda:</p>
          <div style="margin: 20px 0;">
            <a href="${activationLink}" style="background-color:#1d64f2; color:white; padding:12px 24px; text-decoration:none; border-radius:5px; display:inline-block; font-weight:bold;">AKTIFKAN AKUN SAYA</a>
          </div>
          <p style="color: #666;">Atau salin link ini ke browser Anda:</p>
          <p style="word-break: break-all; color: #1d64f2;">${activationLink}</p>
          <p style="font-size: 12px; color: #888;">Link ini berlaku selama 1 jam.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      msg: "Registrasi Berhasil! Silakan cek email Anda untuk aktivasi akun.",
    });
  } catch (err) {
    console.error("Error Register:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.body; // Token dikirim dari frontend

    if (!token) return res.status(400).json({ msg: "Token tidak valid" });

    // Cari user berdasarkan token
    const user = await User.findOne({ activationToken: token });

    if (!user)
      return res
        .status(400)
        .json({ msg: "Link aktivasi tidak valid atau sudah digunakan." });

    // Aktifkan User
    user.isVerified = true;
    user.activationToken = undefined; // Hapus token agar tidak bisa dipakai lagi
    await user.save();

    res.json({ msg: "Akun berhasil diaktifkan! Silakan login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
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

    // [BARU] Cek Apakah Sudah Verifikasi?
    if (!user.isVerified) {
      return res.status(400).json({
        msg: "Akun belum aktif. Silakan cek email Anda untuk verifikasi.",
      });
    }

    // Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Password salah" });

    // Login Sukses
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "rahasia", {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user.id, nama: user.nama, role: user.role },
    });
  } catch (err) {
    console.error(err);
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

// ... kode register, login, activateAccount, dll ...

// 4. LUPA PASSWORD (Kirim Link Reset)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Cek User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Email tidak terdaftar" });
    }

    // Buat Token Reset
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Simpan Token ke Database (Berlaku 1 Jam)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 Jam dari sekarang
    await user.save();

    // Kirim Email
    // Ganti 5173 dengan port frontend Anda jika beda
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"RiHa Admin" <riha.admin.notify@gmail.com>',
      to: email,
      subject: "Reset Password RiHa Medical Center",
      html: `
        <h3>Permintaan Reset Password</h3>
        <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
        <p>Klik link di bawah ini untuk membuat password baru:</p>
        <a href="${resetLink}" style="background:#1d64f2; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">RESET PASSWORD</a>
        <p>Link ini kedaluwarsa dalam 1 jam.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "Link reset password telah dikirim ke email Anda." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// 5. ATUR PASSWORD BARU (Dipanggil saat submit password baru)
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Cari user dengan token valid dan belum expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // $gt = Greater Than (Waktu sekarang belum lewat expired)
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Token tidak valid atau sudah kedaluwarsa" });
    }

    // Hash Password Baru
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Hapus Token (Supaya tidak bisa dipakai lagi)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.json({ msg: "Password berhasil diubah! Silakan login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};
