const express = require("express");
const router = express.Router();
const {
  createDiscussion,
  getCourseDiscussions,
  getDiscussionReplies,
  updateDiscussion,
  deleteDiscussion,
} = require("../controllers/discussionController");
const { authenticate } = require("../middleware/authMiddleware");

// All discussion routes require authentication
router.use(authenticate);

router.post("/", createDiscussion);
router.get("/courses/:courseId", getCourseDiscussions);
router.get("/:discussionId/replies", getDiscussionReplies);
router.put("/:discussionId", updateDiscussion);
router.delete("/:discussionId", deleteDiscussion);

module.exports = router;
