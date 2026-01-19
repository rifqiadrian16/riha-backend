require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { getPendingReferrals } = require("./controllers/referralController");
const auth = require("./middleware/auth");

const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "https://riha-frontend.vercel.app/",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("socketio", io);

connectDB();

app.use(cors());
app.use(express.json());

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
  console.log("Client Socket Terkoneksi:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client Disconnect:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`🚀 Server RiHa berjalan di port ${PORT}`),
);
