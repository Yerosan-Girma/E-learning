export function getEffectivePrice(course) {
  const discountPrice =
    typeof course?.discount_price !== "undefined" && course?.discount_price !== null
      ? course.discount_price
      : course?.discountPrice;
  const price = typeof course?.price !== "undefined" ? course.price : 0;

  return Number(discountPrice ?? price ?? 0);
}

export function normalizeCourse(course) {
  const effectivePrice = getEffectivePrice(course);

  return {
    ...course,
    effectivePrice,
    isFree: effectivePrice <= 0,
    level: course.level || "All Levels",
    instructor: course.instructor_name || course.instructor || "EduLearn Instructor",
    image:
      course.thumbnail_url ||
      course.thumbnailUrl ||
      course.image ||
      "/images/courses/course-01.jpg",
    shortDescription:
      course.shortDescription ||
      course.description ||
      "Explore a structured learning path with lessons, assessments, and progress tracking.",
    lessonCount: Number(course.lesson_count ?? course.lectures ?? 0),
    quizCount: Number(course.quiz_count ?? 0),
    enrolledStudents: Number(course.enrolled_students ?? course.students ?? 0),
    courseType: course.course_type || (effectivePrice <= 0 ? "free" : "paid"),
  };
}

export function normalizeLesson(lesson) {
  return {
    ...lesson,
    id: Number(lesson.id),
    is_preview: Boolean(lesson.is_preview),
    completed: Boolean(lesson.completed),
    module_name: lesson.module_name || null,
    attachment_url: lesson.attachment_url || null,
  };
}

export function enrollmentBadgeClass(status) {
  if (status === "approved" || status === "completed") return "success";
  if (status === "active") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected" || status === "failed") return "danger";
  if (status === "inactive") return "secondary";
  return "secondary";
}
