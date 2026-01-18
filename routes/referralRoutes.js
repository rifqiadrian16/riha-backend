const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin"); // Pastikan sudah buat middleware admin

const {
  createReferralRequest,
  chooseHospital,
  getPendingReferrals,
  getHospitalReference,
  getCompletedReferrals,
  getAllReferrals,
} = require("../controllers/referralController");

// Admin membuat rujukan (POST /api/referrals/initiate)
router.post("/initiate", auth, admin, createReferralRequest);

// Pasien cek notifikasi rujukan (GET /api/referrals/pending)
router.get("/pending", auth, getPendingReferrals);

// Pasien memilih RS (PUT /api/referrals/choose)
router.put("/choose", auth, chooseHospital);

// Ambil daftar RS untuk ditampilkan di menu (GET /api/referrals/hospitals)
router.get("/hospitals", auth, getHospitalReference);

// GET /api/referrals/history -> Untuk menu Inbox (Surat Selesai)
router.get("/history", auth, getCompletedReferrals);
router.get("/", auth, getAllReferrals);

module.exports = router;
