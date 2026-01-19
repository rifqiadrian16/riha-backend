const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  createReferralRequest,
  chooseHospital,
  getPendingReferrals,
  getHospitalReference,
  getCompletedReferrals,
  getAllReferrals,
} = require("../controllers/referralController");

router.post("/initiate", auth, admin, createReferralRequest);

router.get("/pending", auth, getPendingReferrals);

router.put("/choose", auth, chooseHospital);

router.get("/hospitals", auth, getHospitalReference);

router.get("/history", auth, getCompletedReferrals);
router.get("/", auth, getAllReferrals);

module.exports = router;
