const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Panggil Satpam
const { addQueue, getMyQueues } = require("../controllers/queueController");

// POST /api/queue -> Tambah Antrean (Perlu Login)
router.post("/", auth, addQueue);

// GET /api/queue -> Lihat Antrean Saya (Perlu Login)
router.get("/", auth, getMyQueues);

module.exports = router;
