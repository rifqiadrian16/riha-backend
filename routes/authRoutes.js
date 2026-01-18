const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  register,
  login,
  getProfile,
  updateProfile,
  activateAccount,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// Endpoint: http://localhost:5000/api/auth/register
router.post("/register", register);

router.post("/activate", activateAccount);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Endpoint: http://localhost:5000/api/auth/login
router.post("/login", login);

router.get("/profile", auth, getProfile); // Untuk fetchProfile
router.put("/profile", auth, updateProfile); // Untuk saveSettings

module.exports = router;
