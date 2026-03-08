const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const courseModel = require("../models/courseModel");

const listCourses = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const courses = await courseModel.listCourses({ category, search });

  return sendSuccess(res, { courses }, "Courses fetched");
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseModel.getCourseById(req.params.courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return sendSuccess(res, { course }, "Course fetched");
});

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, price, discountPrice, thumbnailUrl, instructorId } = req.body;

  const resolvedInstructorId =
    req.user.role === "admin" && instructorId ? Number(instructorId) : req.user.id;

  const courseId = await courseModel.createCourse({
    title,
    description,
    category,
    price: Number(price || 0),
    discountPrice: discountPrice ? Number(discountPrice) : null,
    thumbnailUrl,
    instructorId: resolvedInstructorId,
  });

  const course = await courseModel.getCourseById(courseId);
  return sendSuccess(res, { course }, "Course created", 201);
});

const updateCourse = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (req.user.role !== "admin" && Number(course.instructor_id) !== Number(req.user.id)) {
    throw new ApiError(403, "You can only update your own courses");
  }

  const updatePayload = {};

  ["title", "description", "category", "thumbnail_url", "is_published"].forEach((field) => {
    if (typeof req.body[field] !== "undefined") {
      updatePayload[field] = req.body[field];
    }
  });

  if (typeof req.body.price !== "undefined") {
    updatePayload.price = Number(req.body.price);
  }

  if (typeof req.body.discountPrice !== "undefined") {
    updatePayload.discount_price = req.body.discountPrice ? Number(req.body.discountPrice) : null;
  }

  await courseModel.updateCourseById(courseId, updatePayload);
  const updated = await courseModel.getCourseById(courseId);

  return sendSuccess(res, { course: updated }, "Course updated");
});

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
};
