const express = require("express");
const { body } = require("express-validator");
const quizController = require("../controllers/quizController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/courses/:courseId/quizzes", optionalProtect, quizController.listCourseQuizzes);

router.post(
  "/courses/:courseId/quizzes",
  protect,
  requireRole("teacher", "admin"),
  [body("title").trim().notEmpty().withMessage("title is required")],
  validate,
  quizController.createQuiz
);

router.get("/quizzes/:quizId", protect, quizController.getQuizById);

router.post(
  "/quizzes/:quizId/questions",
  protect,
  requireRole("teacher", "admin"),
  [
    body("questionText").trim().notEmpty().withMessage("questionText is required"),
    body("options").isArray({ min: 2 }).withMessage("options must contain at least 2 items"),
    body("correctOption").isInt({ min: 0 }).withMessage("correctOption must be a valid index"),
  ],
  validate,
  quizController.createQuestion
);

router.post(
  "/quizzes/:quizId/attempts",
  protect,
  requireRole("student"),
  [body("answers").isArray().withMessage("answers must be an array")],
  validate,
  quizController.submitQuizAttempt
);

module.exports = router;
