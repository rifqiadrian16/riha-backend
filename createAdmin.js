require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Pastikan path ini sesuai struktur folder Anda
const connectDB = require("./config/db"); // Pastikan path ini sesuai

const createAdminAccount = async () => {
  try {
    // 1. Hubungkan ke Database
    await connectDB();

    // 2. Cek apakah admin sudah ada
    const email = "admin@admin.com";
    let user = await User.findOne({ email });

    if (user) {
      console.log("⚠️  Akun admin@admin.com sudah ada!");
      process.exit();
    }

    // 3. Enkripsi Password 'admin'
    const password = "admin";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Buat User Baru dengan Role 'admin'
    user = new User({
      nama: "Administrator",
      email: email,
      username: "admin", // <--- TAMBAHKAN INI
      password: hashedPassword,
      role: "admin",
      noHp: "081234567890",
      tanggalLahir: new Date(),
    });

    await user.save();

    console.log("✅ SUKSES! Akun Admin berhasil dibuat.");
    console.log("-------------------------------------");
    console.log("Email    : admin@admin.com");
    console.log("Password : admin");
    console.log("Role     : admin");
    console.log("-------------------------------------");

    process.exit();
  } catch (err) {
    console.error("❌ Gagal membuat admin:", err.message);
    process.exit(1);
  }
};

createAdminAccount();
