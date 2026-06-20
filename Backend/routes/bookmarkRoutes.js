const express = require("express");
const router = express.Router();
const {
  createBookmark,
  getMyBookmarks,
  updateBookmark,
  deleteBookmark,
} = require("../controllers/bookmarkController");
const { authenticate } = require("../middleware/authMiddleware");

// All bookmark routes require authentication
router.use(authenticate);

router.post("/", createBookmark);
router.get("/", getMyBookmarks);
router.put("/:lessonId", updateBookmark);
router.delete("/:lessonId", deleteBookmark);

module.exports = router;
