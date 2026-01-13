const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Tetap butuh login
const {
  addReferral,
  getAllReferrals,
} = require("../controllers/referralController");

// POST /api/referrals -> Tambah Data RS
router.post("/", auth, addReferral);

// GET /api/referrals -> Lihat Daftar RS
router.get("/", auth, getAllReferrals);

module.exports = router;
