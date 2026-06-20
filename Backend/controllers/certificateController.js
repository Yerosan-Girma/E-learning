const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const certificateModel = require("../models/certificateModel");
const enrollmentModel = require("../models/enrollmentModel");
const quizModel = require("../models/quizModel");
const courseModel = require("../models/courseModel");

const generateCertificate = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const userId = req.user.id;

  // Check if enrollment exists and is approved
  const enrollment = await enrollmentModel.findEnrollment({ userId, courseId });
  if (!enrollment || enrollment.status !== "approved") {
    throw new ApiError(403, "You must be enrolled in this course to generate a certificate");
  }

  // Check if certificate already exists
  const existingCertificate = await certificateModel.checkCertificateExists(userId, courseId);
  if (existingCertificate) {
    const certificate = await certificateModel.getCertificateById(existingCertificate.id);
    return sendSuccess(
      res,
      { certificate },
      "Certificate already generated"
    );
  }

  // Check if progress is 100%
  if (enrollment.progress < 100) {
    throw new ApiError(400, "You must complete 100% of the course to generate a certificate");
  }

  // Check if all required quizzes are completed
  const course = await courseModel.getCourseById(courseId);
  const quizzes = await quizModel.getQuizzesByCourse(courseId);
  
  for (const quiz of quizzes) {
    const attempts = await quizModel.getQuizAttemptsByUser(quiz.id, userId);
    const passedAttempt = attempts.find(
      (attempt) => attempt.score >= quiz.passing_score
    );
    
    if (!passedAttempt) {
      throw new ApiError(
        400,
        `You must complete all required quizzes to generate a certificate. Quiz "${quiz.title}" is not passed.`
      );
    }
  }

  // Generate certificate
  const certificateId = await certificateModel.createCertificate({
    userId,
    courseId,
  });

  const certificate = await certificateModel.getCertificateById(certificateId);

  return sendSuccess(
    res,
    { certificate },
    "Certificate generated successfully",
    201
  );
});

const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateModel.getCertificatesByUser(req.user.id);

  return sendSuccess(res, { certificates }, "Certificates fetched");
});

const getCertificateByNumber = asyncHandler(async (req, res) => {
  const { certificateNumber } = req.params;

  const certificate = await certificateModel.getCertificateByNumber(certificateNumber);
  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  return sendSuccess(res, { certificate }, "Certificate fetched");
});

const verifyCertificate = asyncHandler(async (req, res) => {
  const { verificationCode } = req.params;

  const certificate = await certificateModel.getCertificateByVerificationCode(
    verificationCode
  );
  if (!certificate) {
    throw new ApiError(404, "Certificate not found or invalid verification code");
  }

  return sendSuccess(
    res,
    {
      certificate: {
        studentName: certificate.student_name,
        courseTitle: certificate.course_title,
        instructorName: certificate.instructor_name,
        issueDate: certificate.issue_date,
        certificateNumber: certificate.certificate_number,
        isValid: true,
      },
    },
    "Certificate verified successfully"
  );
});

const getCourseCertificates = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);

  // Check if user is the instructor or admin
  const course = await courseModel.getCourseById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (
    course.instructor_id !== req.user.id &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Access denied");
  }

  const certificates = await certificateModel.getCertificatesByCourse(courseId);

  return sendSuccess(res, { certificates }, "Course certificates fetched");
});

module.exports = {
  generateCertificate,
  getMyCertificates,
  getCertificateByNumber,
  verifyCertificate,
  getCourseCertificates,
};
