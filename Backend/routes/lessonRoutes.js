const express = require("express");
const { body } = require("express-validator");
const lessonController = require("../controllers/lessonController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/courses/:courseId/lessons", optionalProtect, lessonController.listCourseLessons);

router.post(
  "/courses/:courseId/lessons",
  protect,
  requireRole("teacher", "admin"),
  [body("title").trim().notEmpty().withMessage("title is required")],
  validate,
  lessonController.createLesson
);

router.get("/lessons/:lessonId", optionalProtect, lessonController.getLessonById);

router.patch(
  "/lessons/:lessonId/completion",
  protect,
  requireRole("student"),
  [body("completed").isBoolean().withMessage("completed must be boolean")],
  validate,
  lessonController.markLessonComplete
);

module.exports = router;
