require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { getPendingReferrals } = require("./controllers/referralController");
const auth = require("./middleware/auth");

// --- 1. IMPORT SOCKET.IO ---
const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173", // Untuk development lokal
  "https://riha-frontend.vercel.app/", // [NANTI] Ganti ini dengan link Vercel Anda setelah jadi
];

// --- 2. KONFIGURASI SOCKET.IO (CORS PENTING) ---
const io = new Server(server, {
  cors: {
    // Izinkan Frontend mengakses Socket
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Simpan instance 'io' agar bisa dipakai di Controller
app.set("socketio", io);

connectDB();

app.use(cors());
app.use(express.json());

// Rate Limiter (Naikkan limit agar tidak error 429 saat dev)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
});
app.use("/api", limiter);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/queue", require("./routes/queueRoutes"));
app.use("/api/referrals", require("./routes/referralRoutes"));
app.get("/api/notifications", auth, getPendingReferrals);

// Cek Koneksi Socket
io.on("connection", (socket) => {
  console.log("✅ Client Socket Terkoneksi:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client Disconnect:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// --- 3. JALANKAN SERVER DENGAN 'server.listen' ---
// JANGAN pakai 'app.listen' karena socket tidak akan jalan
server.listen(PORT, () =>
  console.log(`🚀 Server RiHa berjalan di port ${PORT}`),
);
