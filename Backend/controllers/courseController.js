const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const courseModel = require("../models/courseModel");
const lessonModel = require("../models/lessonModel");
const quizModel = require("../models/quizModel");
const { getCourseAccessState, getEffectiveCoursePrice } = require("../services/courseAccessService");

function serializeCourse(course) {
  const effectivePrice = getEffectiveCoursePrice(course);

  return {
    ...course,
    effective_price: effectivePrice,
    course_type: effectivePrice <= 0 ? "free" : "paid",
  };
}

const listCourses = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const result = await courseModel.listCourses({ 
    category, 
    search, 
    page: parseInt(page), 
    limit: parseInt(limit) 
  });

  return sendSuccess(
    res,
    { 
      courses: result.courses.map(serializeCourse),
      pagination: result.pagination 
    },
    "Courses fetched"
  );
});

const getCourseById = asyncHandler(async (req, res) => {
  const includeUnpublished =
    req.user?.role === "admin" || req.user?.role === "teacher";
  const course = await courseModel.getCourseById(req.params.courseId, {
    includeUnpublished,
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const isOwner = Boolean(
    req.user &&
      (req.user.role === "admin" ||
        (req.user.role === "teacher" && Number(course.instructor_id) === Number(req.user.id)))
  );

  if (!course.is_published && !isOwner) {
    throw new ApiError(404, "Course not found");
  }

  const [lessons, quizzes, access] = await Promise.all([
    lessonModel.listLessonsByCourseId(course.id),
    quizModel.listQuizzesByCourseId(course.id),
    getCourseAccessState({ user: req.user, course }),
  ]);

  const lessonOutline = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    lesson_type: lesson.lesson_type,
    module_name: lesson.module_name,
    sort_order: lesson.sort_order,
    is_preview: Boolean(lesson.is_preview),
  }));

  return sendSuccess(
    res,
    {
      course: serializeCourse(course),
      access,
      lessons: lessonOutline,
      quizzes,
    },
    "Course fetched"
  );
});

const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    level,
    price,
    discountPrice,
    thumbnailUrl,
    instructorId,
  } = req.body;

  const resolvedInstructorId =
    req.user.role === "admin" && instructorId ? Number(instructorId) : req.user.id;

  const courseId = await courseModel.createCourse({
    title,
    description,
    category,
    level: level || "All Levels",
    price: Number(price || 0),
    discountPrice: discountPrice ? Number(discountPrice) : null,
    thumbnailUrl,
    instructorId: resolvedInstructorId,
  });

  const course = await courseModel.getCourseById(courseId);
  return sendSuccess(res, { course: serializeCourse(course) }, "Course created", 201);
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

  const body = req.body || {};
  const updatePayload = {};

  const mappings = {
    title: "title",
    description: "description",
    category: "category",
    level: "level",
    thumbnailUrl: "thumbnail_url",
    thumbnail_url: "thumbnail_url",
    isPublished: "is_published",
    is_published: "is_published",
  };

  Object.entries(mappings).forEach(([sourceKey, targetKey]) => {
    if (typeof body[sourceKey] !== "undefined") {
      updatePayload[targetKey] = body[sourceKey];
    }
  });

  if (typeof body.price !== "undefined") {
    updatePayload.price = Number(body.price);
  }

  if (typeof body.discountPrice !== "undefined") {
    updatePayload.discount_price = body.discountPrice ? Number(body.discountPrice) : null;
  }

  if (typeof body.discount_price !== "undefined") {
    updatePayload.discount_price = body.discount_price ? Number(body.discount_price) : null;
  }

  await courseModel.updateCourseById(courseId, updatePayload);
  const updated = await courseModel.getCourseById(courseId);

  return sendSuccess(res, { course: serializeCourse(updated) }, "Course updated");
});

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
};
