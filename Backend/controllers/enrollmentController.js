const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const courseModel = require("../models/courseModel");
const enrollmentModel = require("../models/enrollmentModel");

const enrollInCourse = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const existing = await enrollmentModel.findEnrollment({
    userId: req.user.id,
    courseId,
  });

  if (existing) {
    return sendSuccess(res, { enrollment: existing }, "Enrollment already exists");
  }

  const effectivePrice = Number(course.discount_price || course.price || 0);
  const status = effectivePrice === 0 ? "approved" : "pending";

  const enrollmentId = await enrollmentModel.createEnrollment({
    userId: req.user.id,
    courseId,
    status,
  });

  const enrollment = await enrollmentModel.findEnrollment({
    userId: req.user.id,
    courseId,
  });

  return sendSuccess(
    res,
    {
      enrollmentId,
      enrollment,
      nextAction:
        status === "approved"
          ? "Access granted"
          : "Payment verification required",
    },
    "Enrollment created",
    201
  );
});

const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentModel.listEnrollmentsByUser(req.user.id);
  return sendSuccess(res, { enrollments }, "Enrollments fetched");
});

const listAllEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentModel.listAllEnrollments({
    status: req.query.status,
  });
  return sendSuccess(res, { enrollments }, "All enrollments fetched");
});

const approveOrRejectEnrollment = asyncHandler(async (req, res) => {
  const enrollmentId = Number(req.params.enrollmentId);
  const { status } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    throw new ApiError(422, "Invalid enrollment status");
  }

  await enrollmentModel.updateEnrollment({ enrollmentId, status });

  return sendSuccess(res, { enrollmentId, status }, "Enrollment status updated");
});

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  listAllEnrollments,
  approveOrRejectEnrollment,
};
