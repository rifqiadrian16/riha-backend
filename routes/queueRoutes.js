const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
// PENTING: Tambahkan 'updateQueueStatus' di dalam kurung kurawal
const {
  addQueue,
  getMyQueues,
  updateQueueStatus,
} = require("../controllers/queueController");

// POST /api/queue -> Tambah Antrean (Perlu Login)
router.post("/", auth, addQueue);

// GET /api/queue -> Lihat Antrean Saya (Perlu Login)
router.get("/", auth, getMyQueues);

// BARU: PUT /api/queue/:id/status -> Update Status (Admin memanggil pasien)
router.put("/:id/status", auth, updateQueueStatus);

module.exports = router;
