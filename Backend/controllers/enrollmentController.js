const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const courseModel = require("../models/courseModel");
const enrollmentModel = require("../models/enrollmentModel");
const paymentModel = require("../models/paymentModel");
const subscriptionModel = require("../models/subscriptionModel");
const { isCourseFree, getEffectiveCoursePrice } = require("../services/courseAccessService");

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
    if (existing.status === "approved") {
      return sendSuccess(
        res,
        {
          enrollment: existing,
          nextAction: "Access granted",
          redirectUrl: `/courses/${courseId}/dashboard`,
        },
        "Already enrolled in this course"
      );
    } else if (existing.status === "pending") {
      // Check if there's a pending payment
      const pendingPayment = await paymentModel.findLatestPaymentByUserAndCourse({
        userId: req.user.id,
        courseId,
      });

      if (pendingPayment && pendingPayment.status === "pending") {
        return sendSuccess(
          res,
          {
            enrollment: existing,
            payment: pendingPayment,
            nextAction: "Payment pending verification",
            redirectUrl: `/payment/${courseId}`,
          },
          "Enrollment pending payment verification"
        );
      }

      return sendSuccess(
        res,
        {
          enrollment: existing,
          nextAction: "Complete payment to access course",
          redirectUrl: `/payment/${courseId}`,
        },
        "Enrollment exists but payment required"
      );
    }

    return sendSuccess(
      res,
      {
        enrollment: existing,
        nextAction: "Contact support for enrollment status",
      },
      "Enrollment exists with unknown status"
    );
  }

  // Check if user has active subscription for premium courses
  const hasActiveSubscription = await subscriptionModel.checkUserHasActiveSubscription(req.user.id);
  const coursePrice = getEffectiveCoursePrice(course);
  const isFree = isCourseFree(course);

  if (isFree || hasActiveSubscription) {
    // Free course or user has active subscription - enroll immediately
    try {
      const enrollmentId = await enrollmentModel.createEnrollment({
        userId: req.user.id,
        courseId,
        status: "approved",
        enrollmentType: hasActiveSubscription ? "subscription" : "purchase",
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
          nextAction: "Access granted",
          redirectUrl: `/courses/${courseId}/dashboard`,
        },
        hasActiveSubscription ? "Enrolled via active subscription" : "Free course enrolled successfully",
        201
      );
    } catch (error) {
      // Handle duplicate enrollment error
      if (error.message === 'DUPLICATE_ENROLLMENT') {
        const existing = await enrollmentModel.findEnrollment({
          userId: req.user.id,
          courseId,
        });
        
        if (existing && existing.status === "approved") {
          return sendSuccess(
            res,
            {
              enrollment: existing,
              nextAction: "Access granted",
              redirectUrl: `/courses/${courseId}/dashboard`,
            },
            "Already enrolled in this course"
          );
        }
      }
      throw error;
    }
  }

  // Paid course without subscription - redirect to payment
  return sendSuccess(
    res,
    {
      course: {
        id: course.id,
        title: course.title,
        price: coursePrice,
        discountPrice: course.discount_price,
      },
      nextAction: "Payment required",
      redirectUrl: `/payment/${courseId}`,
      message: "Please complete payment to enroll in this premium course",
    },
    "Payment required for enrollment",
    200
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
