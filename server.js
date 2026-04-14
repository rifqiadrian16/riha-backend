require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { getPendingReferrals } = require("./controllers/referralController");
const auth = require("./middleware/auth");
const rateLimit = require("express-rate-limit");

const app = express();

// Konfigurasi Dasar
app.set("trust proxy", 1);
connectDB();
app.use(cors()); // Mengizinkan akses dari domain manapun secara otomatis
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
});
app.use("/api", limiter);

// Daftar Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/queue", require("./routes/queueRoutes"));
app.use("/api/referrals", require("./routes/referralRoutes"));
app.get("/api/notifications", auth, getPendingReferrals);

// Route Root (Penting agar saat dibuka di Vercel tidak muncul 404)
app.get("/", (req, res) => {
  res.status(200).send("🚀 Server Backend RiHa Berjalan Normal!");
});

// Jalankan Server Lokal
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server RiHa (Tanpa Socket) berjalan di port ${PORT}`)
);

// Penting untuk Vercel Serverless Function
module.exports = app;