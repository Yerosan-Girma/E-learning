const enrollmentModel = require("../models/enrollmentModel");
const paymentModel = require("../models/paymentModel");

function getEffectiveCoursePrice(course) {
  const discountPrice =
    typeof course?.discount_price !== "undefined" && course?.discount_price !== null
      ? course.discount_price
      : course?.discountPrice;
  const price = typeof course?.price !== "undefined" ? course.price : 0;

  return Number(discountPrice ?? price ?? 0);
}

function isCourseFree(course) {
  return getEffectiveCoursePrice(course) <= 0;
}

async function getCourseAccessState({ user, course }) {
  const courseId = Number(course?.course_id ?? course?.id);
  const price = getEffectiveCoursePrice(course);
  const free = price <= 0;
  const isOwner = Boolean(
    user &&
      (user.role === "admin" ||
        (user.role === "teacher" && Number(course.instructor_id) === Number(user.id)))
  );

  if (isOwner) {
    return {
      isFree: free,
      effectivePrice: price,
      isOwner: true,
      enrollment: null,
      latestPayment: null,
      hasAccess: true,
      requiresPayment: false,
    };
  }

  if (!user) {
    return {
      isFree: free,
      effectivePrice: price,
      isOwner: false,
      enrollment: null,
      latestPayment: null,
      hasAccess: false,
      requiresPayment: !free,
    };
  }

  const enrollment = await enrollmentModel.findEnrollment({
    userId: user.id,
    courseId,
  });
  let latestPayment = free
    ? null
    : await paymentModel.findLatestPaymentByUserAndCourse({
        userId: user.id,
        courseId,
      });

  let resolvedEnrollment = enrollment;

  // Auto-verify pending Chapa payments if user visits the course after paying
  if (!free && latestPayment && latestPayment.status === "pending" && latestPayment.gateway === "chapa") {
    try {
      const chapaService = require("./chapaService");
      if (chapaService.isChapaConfigured()) {
        const verify = await chapaService.verifyTransaction(latestPayment.transaction_id);
        if (verify.success && (verify.status === "SUCCESS" || verify.status === "success")) {
          await paymentModel.updatePaymentStatus({
            paymentId: latestPayment.id,
            status: "completed",
            transactionId: latestPayment.transaction_id,
          });
          latestPayment.status = "completed";

          if (!resolvedEnrollment) {
            await enrollmentModel.createEnrollment({
              userId: user.id,
              courseId,
              status: "approved",
            });
            resolvedEnrollment = { status: "approved" };
          } else if (resolvedEnrollment.status !== "approved") {
            await enrollmentModel.updateEnrollment({
              enrollmentId: resolvedEnrollment.id,
              status: "approved",
            });
            resolvedEnrollment.status = "approved";
          }
        }
      }
    } catch (e) {
      console.error("[CourseAccess] Auto-verify chapa error:", e.message);
    }
  }

  return {
    isFree: free,
    effectivePrice: price,
    isOwner: false,
    enrollment: resolvedEnrollment,
    latestPayment,
    hasAccess: Boolean(resolvedEnrollment && resolvedEnrollment.status === "approved"),
    requiresPayment: !free,
  };
}

module.exports = {
  getEffectiveCoursePrice,
  isCourseFree,
  getCourseAccessState,
};
