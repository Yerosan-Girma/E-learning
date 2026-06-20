const express = require("express");
const router = express.Router();
const {
  searchCourses,
  getSearchFilters,
  getFeaturedCourses,
  getFreeCourses,
  getPaidCourses,
} = require("../controllers/searchController");

// Public search routes (no authentication required)
router.get("/courses", searchCourses);
router.get("/filters", getSearchFilters);
router.get("/featured", getFeaturedCourses);
router.get("/free", getFreeCourses);
router.get("/paid", getPaidCourses);

module.exports = router;
