require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

const createAdminAccount = async () => {
  try {
    await connectDB();

    const email = "admin@admin.com";
    let user = await User.findOne({ email });

    if (user) {
      console.log("⚠️  Akun admin@admin.com sudah ada!");
      process.exit();
    }

    const password = "admin";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      nama: "Administrator",
      email: email,
      username: "admin",
      password: hashedPassword,
      role: "admin",
      noHp: "081234567890",
      tanggalLahir: new Date(),
    });

    await user.save();

    console.log("SUKSES! Akun Admin berhasil dibuat.");
    console.log("-------------------------------------");
    console.log("Email    : admin@admin.com");
    console.log("Password : admin");
    console.log("Role     : admin");
    console.log("-------------------------------------");

    process.exit();
  } catch (err) {
    console.error("Gagal membuat admin:", err.message);
    process.exit(1);
  }
};

createAdminAccount();
