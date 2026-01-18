require("dotenv").config();
console.log("Cek URI:", process.env.MONGO_URI);
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { getPendingReferrals } = require("./controllers/referralController");
const auth = require("./middleware/auth");

const app = express();

// Koneksi Database
connectDB();

// Middleware
app.use(cors()); // Agar Frontend Vue.js bisa akses
app.use(express.json()); // Agar bisa baca data JSON

// Definisi Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/queue", require("./routes/queueRoutes"));
app.use("/api/referrals", require("./routes/referralRoutes"));
app.get("/api/notifications", auth, getPendingReferrals);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server RiHa berjalan di port ${PORT}`));
