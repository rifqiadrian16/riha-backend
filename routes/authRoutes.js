const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

// Endpoint: http://localhost:5000/api/auth/register
router.post("/register", register);

// Endpoint: http://localhost:5000/api/auth/login
router.post("/login", login);

router.get("/profile", auth, getProfile); // Untuk fetchProfile
router.put("/profile", auth, updateProfile); // Untuk saveSettings

module.exports = router;
