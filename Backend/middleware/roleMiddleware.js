const ApiError = require("../utils/ApiError");

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Access denied for this role"));
    }

    return next();
  };
}

function requireStudent(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (req.user.role !== "student") {
    return next(new ApiError(403, "Access denied. Student role required."));
  }

  return next();
}

function requireTeacher(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return next(new ApiError(403, "Access denied. Teacher or Admin role required."));
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (req.user.role !== "admin") {
    return next(new ApiError(403, "Access denied. Admin role required."));
  }

  return next();
}

function requireInstructorOrAdmin(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return next(new ApiError(403, "Access denied. Instructor or Admin role required."));
  }

  return next();
}

function checkCourseOwnership(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  // Admin can access everything
  if (req.user.role === "admin") {
    return next();
  }

  // Teachers can only access their own courses
  if (req.user.role === "teacher") {
    // This middleware expects the course to be loaded in req.course
    // It should be used after a controller that loads the course
    if (req.course && req.course.instructor_id !== req.user.id) {
      return next(new ApiError(403, "Access denied. You can only access your own courses."));
    }
    return next();
  }

  return next(new ApiError(403, "Access denied"));
}

function checkEnrollmentAccess(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  // Admin can access everything
  if (req.user.role === "admin") {
    return next();
  }

  // Teachers can access enrollments in their courses
  if (req.user.role === "teacher") {
    // This middleware expects the enrollment to be loaded in req.enrollment
    // It should be used after a controller that loads the enrollment
    if (req.enrollment && req.enrollment.instructor_id !== req.user.id) {
      return next(new ApiError(403, "Access denied. You can only access enrollments in your courses."));
    }
    return next();
  }

  // Students can only access their own enrollments
  if (req.user.role === "student") {
    if (req.enrollment && req.enrollment.user_id !== req.user.id) {
      return next(new ApiError(403, "Access denied. You can only access your own enrollments."));
    }
    return next();
  }

  return next(new ApiError(403, "Access denied"));
}

module.exports = {
  requireRole,
  requireStudent,
  requireTeacher,
  requireAdmin,
  requireInstructorOrAdmin,
  checkCourseOwnership,
  checkEnrollmentAccess,
};
