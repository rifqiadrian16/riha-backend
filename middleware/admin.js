const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (user && user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ msg: "Akses Ditolak: Khusus Admin!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
