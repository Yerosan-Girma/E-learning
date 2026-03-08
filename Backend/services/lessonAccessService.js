const enrollmentModel = require("../models/enrollmentModel");

async function hasLessonAccess({ user, lesson }) {
  if (user.role === "admin") return true;

  if (user.role === "teacher" && Number(lesson.instructor_id) === Number(user.id)) {
    return true;
  }

  if (lesson.is_preview) return true;

  const enrollment = await enrollmentModel.findEnrollment({
    userId: user.id,
    courseId: lesson.course_id,
  });

  return Boolean(enrollment && enrollment.status === "approved");
}

module.exports = {
  hasLessonAccess,
};
