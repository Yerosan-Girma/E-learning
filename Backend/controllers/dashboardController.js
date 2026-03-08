const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const dashboardModel = require("../models/dashboardModel");
const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");
const paymentModel = require("../models/paymentModel");

const getStudentDashboard = asyncHandler(async (req, res) => {
  const summary = await dashboardModel.getStudentDashboardSummary(req.user.id);
  const enrollments = await enrollmentModel.listEnrollmentsByUser(req.user.id);

  return sendSuccess(
    res,
    {
      summary,
      enrollments,
    },
    "Student dashboard loaded"
  );
});

const getTeacherDashboard = asyncHandler(async (req, res) => {
  const summary = await dashboardModel.getTeacherDashboardSummary(req.user.id);
  const courses = await courseModel.listCoursesByInstructor(req.user.id);

  return sendSuccess(
    res,
    {
      summary,
      courses,
    },
    "Teacher dashboard loaded"
  );
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const summary = await dashboardModel.getAdminDashboardSummary();
  const payments = await paymentModel.listPayments();

  return sendSuccess(
    res,
    {
      summary,
      recentPayments: payments.slice(0, 10),
    },
    "Admin dashboard loaded"
  );
});

module.exports = {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
};
