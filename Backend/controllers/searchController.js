const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const courseModel = require("../models/courseModel");

const searchCourses = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    level,
    language,
    featured,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    page = 1,
    limit = 20,
  } = req.query;

  const courses = await courseModel.listCourses({
    search: q,
    category,
    level,
    language,
    featured: featured === "true" ? true : featured === "false" ? false : null,
    minPrice: minPrice ? parseFloat(minPrice) : null,
    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    sortBy,
    sortOrder,
  });

  // Apply pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedCourses = courses.slice(startIndex, endIndex);

  return sendSuccess(res, {
    courses: paginatedCourses,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: courses.length,
      totalPages: Math.ceil(courses.length / limitNum),
    },
  }, "Search results fetched");
});

const getSearchFilters = asyncHandler(async (req, res) => {
  // Return available filter options based on existing courses
  const allCourses = await courseModel.listCourses({ includeUnpublished: false });

  // Extract unique values for filters
  const categories = [...new Set(allCourses.map((c) => c.category))];
  const levels = [...new Set(allCourses.map((c) => c.level))];
  const languages = [...new Set(allCourses.map((c) => c.language))];

  // Get price range
  const prices = allCourses.map((c) => c.price).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return sendSuccess(res, {
    filters: {
      categories,
      levels,
      languages,
      priceRange: {
        min: minPrice,
        max: maxPrice,
      },
    },
  }, "Search filters fetched");
});

const getFeaturedCourses = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;
  const courses = await courseModel.getFeaturedCourses(parseInt(limit));

  return sendSuccess(res, { courses }, "Featured courses fetched");
});

const getFreeCourses = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const courses = await courseModel.getFreeCourses(parseInt(limit));

  return sendSuccess(res, { courses }, "Free courses fetched");
});

const getPaidCourses = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const courses = await courseModel.getPaidCourses(parseInt(limit));

  return sendSuccess(res, { courses }, "Paid courses fetched");
});

module.exports = {
  searchCourses,
  getSearchFilters,
  getFeaturedCourses,
  getFreeCourses,
  getPaidCourses,
};
