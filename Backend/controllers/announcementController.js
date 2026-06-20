const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const announcementModel = require("../models/announcementModel");
const courseModel = require("../models/courseModel");

const createAnnouncement = asyncHandler(async (req, res) => {
  const { courseId, title, content, isPinned } = req.body;

  // Verify user is the instructor or admin
  const course = await courseModel.getCourseById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const isInstructor = course.instructor_id === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isInstructor && !isAdmin) {
    throw new ApiError(403, "Only instructors can create announcements");
  }

  const announcementId = await announcementModel.createAnnouncement({
    courseId,
    instructorId: req.user.id,
    title,
    content,
    isPinned,
  });

  const announcement = await announcementModel.getAnnouncementById(announcementId);

  return sendSuccess(
    res,
    { announcementId, announcement },
    "Announcement created successfully",
    201
  );
});

const getCourseAnnouncements = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);

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

  const announcements = await announcementModel.getAnnouncementsByCourse(courseId);

  return sendSuccess(res, { announcements }, "Announcements fetched");
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcementId = Number(req.params.announcementId);
  const { title, content, isPinned } = req.body;

  const announcement = await announcementModel.getAnnouncementById(announcementId);
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  // Only the instructor or admin can update
  const course = await courseModel.getCourseById(announcement.course_id);
  const isInstructor = course.instructor_id === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isInstructor && !isAdmin) {
    throw new ApiError(403, "Access denied");
  }

  const rowCount = await announcementModel.updateAnnouncement(announcementId, {
    title,
    content,
    isPinned,
  });

  if (rowCount === 0) {
    throw new ApiError(404, "Announcement not found");
  }

  const updatedAnnouncement = await announcementModel.getAnnouncementById(announcementId);

  return sendSuccess(res, { announcement: updatedAnnouncement }, "Announcement updated successfully");
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcementId = Number(req.params.announcementId);

  const announcement = await announcementModel.getAnnouncementById(announcementId);
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  // Only the instructor or admin can delete
  const course = await courseModel.getCourseById(announcement.course_id);
  const isInstructor = course.instructor_id === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isInstructor && !isAdmin) {
    throw new ApiError(403, "Access denied");
  }

  const rowCount = await announcementModel.deleteAnnouncement(announcementId);

  if (rowCount === 0) {
    throw new ApiError(404, "Announcement not found");
  }

  return sendSuccess(res, { announcementId }, "Announcement deleted successfully");
});

module.exports = {
  createAnnouncement,
  getCourseAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
