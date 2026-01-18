const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    // req.user.id didapat dari middleware 'auth' sebelumnya
    const user = await User.findById(req.user.id);

    // Cek apakah user ada dan role-nya 'admin'
    if (user && user.role === "admin") {
      next(); // Boleh lewat
    } else {
      return res.status(403).json({ msg: "Akses Ditolak: Khusus Admin!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
