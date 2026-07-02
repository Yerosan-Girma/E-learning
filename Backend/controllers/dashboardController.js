const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const dashboardModel = require("../models/dashboardModel");
const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");
const paymentModel = require("../models/paymentModel");
const quizModel = require("../models/quizModel");
const userModel = require("../models/userModel");

const getStudentDashboard = asyncHandler(async (req, res) => {
  const [summary, enrollments, payments, quizAttempts] = await Promise.all([
    dashboardModel.getStudentDashboardSummary(req.user.id),
    enrollmentModel.listEnrollmentsByUser(req.user.id),
    paymentModel.listPayments({ userId: req.user.id }),
    quizModel.listAttemptsByUser(req.user.id),
  ]);

  return sendSuccess(
    res,
    {
      summary,
      enrollments,
      payments,
      quizAttempts: quizAttempts.slice(0, 10),
    },
    "Student dashboard loaded"
  );
});

const getTeacherDashboard = asyncHandler(async (req, res) => {
  const [summary, coursesData, recentPayments] = await Promise.all([
    dashboardModel.getTeacherDashboardSummary(req.user.id),
    courseModel.listCoursesByInstructor(req.user.id),
    paymentModel.listPayments({ status: "completed" }),
  ]);

  const courses = coursesData.courses || [];
  const courseIds = new Set(courses.map((course) => Number(course.id)));
  const filteredPayments = recentPayments.filter((payment) => courseIds.has(Number(payment.course_id)));

  return sendSuccess(
    res,
    {
      summary,
      courses,
      recentPayments: filteredPayments.slice(0, 10),
    },
    "Teacher dashboard loaded"
  );
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [summary, payments, enrollments, users, coursesData] = await Promise.all([
    dashboardModel.getAdminDashboardSummary(),
    paymentModel.listPayments(),
    enrollmentModel.listAllEnrollments(),
    userModel.listUsers(),
    courseModel.listCourses({ includeUnpublished: true }),
  ]);

  return sendSuccess(
    res,
    {
      summary,
      recentPayments: payments.slice(0, 10),
      recentEnrollments: enrollments.slice(0, 10),
      users,
      courses: coursesData.courses || [],
    },
    "Admin dashboard loaded"
  );
});

module.exports = {
  getStudentDashboard,
  getTeacherDashboard,
  getAdminDashboard,
};
