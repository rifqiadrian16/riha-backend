const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  try {
    const { nama, email, username, password, tanggalLahir, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ msg: "Email sudah terdaftar" });
      } else {
        await User.deleteOne({ _id: user._id });
      }
    }

    // 2. Cek Username
    if (username) {
      let userCheck = await User.findOne({ username });
      if (userCheck) {
        if (userCheck.isVerified) {
          return res.status(400).json({ msg: "Username sudah dipakai" });
        } else {
          await User.deleteOne({ _id: userCheck._id });
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const activationToken = crypto.randomBytes(32).toString("hex");

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

    await newUser.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const activationLink = `${clientUrl}/activate-account?token=${activationToken}`;

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
    const { token } = req.body;

    if (!token) return res.status(400).json({ msg: "Token tidak valid" });

    const user = await User.findOne({ activationToken: token });

    if (!user)
      return res
        .status(400)
        .json({ msg: "Link aktivasi tidak valid atau sudah digunakan." });

    user.isVerified = true;
    user.activationToken = undefined;
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

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) return res.status(400).json({ msg: "Akun tidak ditemukan" });
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

    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    if (nama) user.nama = nama;
    if (email) user.email = email;
    if (noHp) user.noHp = noHp;

    await user.save();

    const userResponse = await User.findById(req.user.id).select("-password");
    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

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

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

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

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Token tidak valid atau sudah kedaluwarsa" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.json({ msg: "Password berhasil diubah! Silakan login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};
