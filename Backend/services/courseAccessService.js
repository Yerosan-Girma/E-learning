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
  const latestPayment = free
    ? null
    : await paymentModel.findLatestPaymentByUserAndCourse({
        userId: user.id,
        courseId,
      });

  return {
    isFree: free,
    effectivePrice: price,
    isOwner: false,
    enrollment,
    latestPayment,
    hasAccess: Boolean(enrollment && enrollment.status === "approved"),
    requiresPayment: !free,
  };
}

module.exports = {
  getEffectiveCoursePrice,
  isCourseFree,
  getCourseAccessState,
};
