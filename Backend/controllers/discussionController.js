const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const discussionModel = require("../models/discussionModel");
const courseModel = require("../models/courseModel");

const createDiscussion = asyncHandler(async (req, res) => {
  const { courseId, lessonId, subject, message, parentId } = req.body;

  // Verify user is enrolled in the course
  const enrollmentModel = require("../models/enrollmentModel");
  const enrollment = await enrollmentModel.findEnrollment({
    userId: req.user.id,
    courseId,
  });

  if (!enrollment || enrollment.status !== "approved") {
    throw new ApiError(403, "You must be enrolled in this course to participate in discussions");
  }

  const discussionId = await discussionModel.createDiscussion({
    courseId,
    lessonId,
    userId: req.user.id,
    subject,
    message,
    parentId,
  });

  const discussion = await discussionModel.getDiscussionById(discussionId);

  return sendSuccess(
    res,
    { discussionId, discussion },
    "Discussion created successfully",
    201
  );
});

const getCourseDiscussions = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const { lessonId, parentId } = req.query;

  // Verify user has access to the course
  const course = await courseModel.getCourseById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const enrollmentModel = require("../models/enrollmentModel");
  const enrollment = await enrollmentModel.findEnrollment({
    userId: req.user.id,
    courseId,
  });

  const isInstructor = course.instructor_id === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!enrollment && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Access denied");
  }

  const discussions = await discussionModel.getDiscussionsByCourse(courseId, {
    lessonId: lessonId ? Number(lessonId) : null,
    parentId: parentId ? Number(parentId) : null,
  });

  return sendSuccess(res, { discussions }, "Discussions fetched");
});

const getDiscussionReplies = asyncHandler(async (req, res) => {
  const discussionId = Number(req.params.discussionId);

  const replies = await discussionModel.getReplies(discussionId);

  return sendSuccess(res, { replies }, "Replies fetched");
});

const updateDiscussion = asyncHandler(async (req, res) => {
  const discussionId = Number(req.params.discussionId);
  const { message, isAnswer } = req.body;

  const discussion = await discussionModel.getDiscussionById(discussionId);
  if (!discussion) {
    throw new ApiError(404, "Discussion not found");
  }

  // Only the author or instructor/admin can update
  const course = await courseModel.getCourseById(discussion.course_id);
  const isInstructor = course.instructor_id === req.user.id;
  const isAdmin = req.user.role === "admin";
  const isAuthor = discussion.user_id === req.user.id;

  if (!isAuthor && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Access denied");
  }

  const rowCount = await discussionModel.updateDiscussion(discussionId, {
    message,
    isAnswer,
  });

  if (rowCount === 0) {
    throw new ApiError(404, "Discussion not found");
  }

  const updatedDiscussion = await discussionModel.getDiscussionById(discussionId);

  return sendSuccess(res, { discussion: updatedDiscussion }, "Discussion updated successfully");
});

const deleteDiscussion = asyncHandler(async (req, res) => {
  const discussionId = Number(req.params.discussionId);

  const discussion = await discussionModel.getDiscussionById(discussionId);
  if (!discussion) {
    throw new ApiError(404, "Discussion not found");
  }

  // Only the author or instructor/admin can delete
  const course = await courseModel.getCourseById(discussion.course_id);
  const isInstructor = course.instructor_id === req.user.id;
  const isAdmin = req.user.role === "admin";
  const isAuthor = discussion.user_id === req.user.id;

  if (!isAuthor && !isInstructor && !isAdmin) {
    throw new ApiError(403, "Access denied");
  }

  const rowCount = await discussionModel.deleteDiscussion(discussionId);

  if (rowCount === 0) {
    throw new ApiError(404, "Discussion not found");
  }

  return sendSuccess(res, { discussionId }, "Discussion deleted successfully");
});

module.exports = {
  createDiscussion,
  getCourseDiscussions,
  getDiscussionReplies,
  updateDiscussion,
  deleteDiscussion,
};
