const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getCourseAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { authenticate } = require("../middleware/authMiddleware");

// All announcement routes require authentication
router.use(authenticate);

router.post("/", createAnnouncement);
router.get("/courses/:courseId", getCourseAnnouncements);
router.put("/:announcementId", updateAnnouncement);
router.delete("/:announcementId", deleteAnnouncement);

module.exports = router;
