const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const courseModel = require("../models/courseModel");
const lessonModel = require("../models/lessonModel");
const enrollmentModel = require("../models/enrollmentModel");
const { hasLessonAccess } = require("../services/lessonAccessService");

const createLesson = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (req.user.role !== "admin" && Number(course.instructor_id) !== Number(req.user.id)) {
    throw new ApiError(403, "Only course owner or admin can create lessons");
  }

  const lessonId = await lessonModel.createLesson({
    courseId,
    title: req.body.title,
    lessonType: req.body.lessonType || "mixed",
    videoUrl: req.body.videoUrl || null,
    notesContent: req.body.notesContent || null,
    attachmentUrl: req.body.attachmentUrl || null,
    sortOrder: Number(req.body.sortOrder || 1),
    isPreview: Boolean(req.body.isPreview),
  });

  return sendSuccess(res, { lessonId }, "Lesson created", 201);
});

const listCourseLessons = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  let lessons = await lessonModel.listLessonsByCourseId(courseId);

  const isOwner = req.user && (req.user.role === "admin" || Number(req.user.id) === Number(course.instructor_id));

  if (!isOwner) {
    const enrollment = req.user
      ? await enrollmentModel.findEnrollment({ userId: req.user.id, courseId })
      : null;

    const hasApprovedEnrollment = Boolean(enrollment && enrollment.status === "approved");

    if (!hasApprovedEnrollment) {
      lessons = lessons.filter((lesson) => lesson.is_preview);
    }

    lessons = lessons.map((lesson) => {
      if (hasApprovedEnrollment || lesson.is_preview) {
        return lesson;
      }

      return {
        ...lesson,
        notes_content: null,
        video_url: null,
        attachment_url: null,
      };
    });
  }

  return sendSuccess(res, { lessons }, "Lessons fetched");
});

const getLessonById = asyncHandler(async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const lesson = await lessonModel.getLessonById(lessonId);

  if (!lesson) {
    throw new ApiError(404, "Lesson not found");
  }

  const allowGuestPreview = lesson.is_preview;

  if (!allowGuestPreview && !req.user) {
    throw new ApiError(401, "Authentication required for this lesson");
  }

  if (req.user) {
    const allowed = await hasLessonAccess({ user: req.user, lesson });
    if (!allowed) {
      throw new ApiError(403, "You need approved enrollment to access this lesson");
    }
  }

  return sendSuccess(res, { lesson }, "Lesson fetched");
});

const markLessonComplete = asyncHandler(async (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const lesson = await lessonModel.getLessonById(lessonId);

  if (!lesson) {
    throw new ApiError(404, "Lesson not found");
  }

  const allowed = await hasLessonAccess({ user: req.user, lesson });
  if (!allowed) {
    throw new ApiError(403, "You need approved enrollment to complete this lesson");
  }

  await lessonModel.upsertLessonView({
    userId: req.user.id,
    lessonId,
    completed: Boolean(req.body.completed),
  });

  const allLessons = await lessonModel.listLessonsByCourseId(lesson.course_id);
  const completedLessons = await lessonModel.countCompletedLessonsByUserAndCourse({
    userId: req.user.id,
    courseId: lesson.course_id,
  });

  const progress = allLessons.length
    ? Number(((completedLessons / allLessons.length) * 100).toFixed(2))
    : 0;

  const enrollment = await enrollmentModel.findEnrollment({
    userId: req.user.id,
    courseId: lesson.course_id,
  });

  if (enrollment) {
    await enrollmentModel.updateEnrollment({
      enrollmentId: enrollment.id,
      progress,
      lastAccessed: new Date(),
    });
  }

  return sendSuccess(res, { progress }, "Lesson completion saved");
});

module.exports = {
  createLesson,
  listCourseLessons,
  getLessonById,
  markLessonComplete,
};
