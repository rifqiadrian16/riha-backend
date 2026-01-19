const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  addQueue,
  getMyQueues,
  updateQueueStatus,
  getAllQueues,
  resetDailyQueue,
} = require("../controllers/queueController");

router.post("/", auth, addQueue);

router.get("/", auth, getMyQueues);

router.get("/all", auth, getAllQueues);

router.delete("/reset", auth, resetDailyQueue);

router.put("/:id/status", auth, updateQueueStatus);
router.get("/all", auth, admin, getAllQueues);
router.put("/:id/status", auth, admin, updateQueueStatus);

module.exports = router;
