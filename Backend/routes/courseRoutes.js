const express = require("express");
const { body } = require("express-validator");
const courseController = require("../controllers/courseController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", optionalProtect, courseController.listCourses);
router.get("/:courseId", optionalProtect, courseController.getCourseById);

router.post(
  "/",
  protect,
  requireRole("teacher", "admin"),
  [
    body("title").trim().notEmpty().withMessage("title is required"),
    body("category").trim().notEmpty().withMessage("category is required"),
    body("level").optional().trim().notEmpty().withMessage("level must not be empty"),
    body("price").optional().isFloat({ min: 0 }).withMessage("price must be >= 0"),
    body("discountPrice")
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage("discountPrice must be >= 0"),
  ],
  validate,
  courseController.createCourse
);

router.put(
  "/:courseId",
  protect,
  requireRole("teacher", "admin"),
  courseController.updateCourse
);

module.exports = router;
