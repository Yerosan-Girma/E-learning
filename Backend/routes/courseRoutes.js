const express = require("express");
const { body } = require("express-validator");
const courseController = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", courseController.listCourses);
router.get("/:courseId", courseController.getCourseById);

router.post(
  "/",
  protect,
  requireRole("teacher", "admin"),
  [
    body("title").trim().notEmpty().withMessage("title is required"),
    body("category").trim().notEmpty().withMessage("category is required"),
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
