const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const courseModel = require("../models/courseModel");
const quizModel = require("../models/quizModel");
const enrollmentModel = require("../models/enrollmentModel");
const certificateModel = require("../models/certificateModel");
const { getCourseAccessState } = require("../services/courseAccessService");

function isCourseOwner(user, course) {
  return Boolean(
    user &&
      (user.role === "admin" ||
        (user.role === "teacher" && Number(course.instructor_id) === Number(user.id)))
  );
}

function sanitizeQuestion(question) {
  return {
    id: question.id,
    quiz_id: question.quiz_id,
    question_text: question.question_text,
    options: question.options,
    explanation: question.explanation,
    sort_order: question.sort_order,
  };
}

const listCourseQuizzes = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId, {
    includeUnpublished: Boolean(req.user),
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (!course.is_published && !isCourseOwner(req.user, course)) {
    throw new ApiError(404, "Course not found");
  }

  const quizzes = await quizModel.listQuizzesByCourseId(courseId);

  if (req.user?.role === "student") {
    const attempts = await quizModel.listAttemptsByUser(req.user.id, { courseId });
    const latestAttemptByQuizId = new Map();

    attempts.forEach((attempt) => {
      if (!latestAttemptByQuizId.has(Number(attempt.quiz_id))) {
        latestAttemptByQuizId.set(Number(attempt.quiz_id), attempt);
      }
    });

    return sendSuccess(
      res,
      {
        quizzes: quizzes.map((quiz) => ({
          ...quiz,
          latestAttempt: latestAttemptByQuizId.get(Number(quiz.id)) || null,
        })),
      },
      "Quizzes fetched"
    );
  }

  return sendSuccess(res, { quizzes }, "Quizzes fetched");
});

const createQuiz = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (!isCourseOwner(req.user, course)) {
    throw new ApiError(403, "Only the course owner or admin can add quizzes");
  }

  const quizId = await quizModel.createQuiz({
    courseId,
    title: req.body.title,
    description: req.body.description || null,
    passingScore: Number(req.body.passingScore || 60),
  });

  const quiz = await quizModel.getQuizById(quizId);
  return sendSuccess(res, { quiz }, "Quiz created", 201);
});

const createQuestion = asyncHandler(async (req, res) => {
  const quizId = Number(req.params.quizId);
  const quiz = await quizModel.getQuizById(quizId);

  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  if (!isCourseOwner(req.user, quiz)) {
    throw new ApiError(403, "Only the course owner or admin can add quiz questions");
  }

  const options = Array.isArray(req.body.options) ? req.body.options : [];
  if (options.length < 2) {
    throw new ApiError(422, "At least two options are required");
  }

  const correctOption = Number(req.body.correctOption);
  if (Number.isNaN(correctOption) || correctOption < 0 || correctOption >= options.length) {
    throw new ApiError(422, "correctOption must reference one of the provided options");
  }

  const questionId = await quizModel.createQuestion({
    quizId,
    questionText: req.body.questionText,
    options,
    correctOption,
    explanation: req.body.explanation || null,
    sortOrder: Number(req.body.sortOrder || 1),
  });

  return sendSuccess(res, { questionId }, "Quiz question created", 201);
});

const getQuizById = asyncHandler(async (req, res) => {
  const quizId = Number(req.params.quizId);
  const quiz = await quizModel.getQuizById(quizId);

  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  const access = await getCourseAccessState({ user: req.user, course: quiz });
  const owner = isCourseOwner(req.user, quiz);

  if (!quiz.is_published && !owner) {
    throw new ApiError(404, "Quiz not found");
  }

  if (!owner && !(req.user.role === "student" && access.hasAccess)) {
    throw new ApiError(403, "You do not have access to this quiz");
  }

  const questions = await quizModel.listQuestionsByQuizId(quizId);
  const latestAttempt =
    req.user.role === "student"
      ? await quizModel.getLatestAttemptByUserAndQuiz({
          userId: req.user.id,
          quizId,
        })
      : null;

  return sendSuccess(
    res,
    {
      quiz,
      questions: owner ? questions : questions.map(sanitizeQuestion),
      latestAttempt,
    },
    "Quiz fetched"
  );
});

const submitQuizAttempt = asyncHandler(async (req, res) => {
  const quizId = Number(req.params.quizId);
  const quiz = await quizModel.getQuizById(quizId);

  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  const access = await getCourseAccessState({ user: req.user, course: quiz });
  if (!quiz.is_published) {
    throw new ApiError(404, "Quiz not found");
  }
  if (!access.hasAccess) {
    throw new ApiError(403, "You need active access to this course before taking the quiz");
  }

  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const questions = await quizModel.listQuestionsByQuizId(quizId);

  if (questions.length === 0) {
    throw new ApiError(422, "This quiz does not contain any questions yet");
  }

  const answerMap = new Map(
    answers.map((answer) => [Number(answer.questionId), Number(answer.selectedOption)])
  );

  let correctAnswers = 0;
  const review = questions.map((question) => {
    const selectedOption = answerMap.has(Number(question.id))
      ? answerMap.get(Number(question.id))
      : null;
    const isCorrect = selectedOption === Number(question.correct_option);

    if (isCorrect) {
      correctAnswers += 1;
    }

    return {
      questionId: question.id,
      selectedOption,
      correctOption: question.correct_option,
      isCorrect,
      explanation: question.explanation,
      options: question.options,
      questionText: question.question_text,
    };
  });

  const totalQuestions = questions.length;
  const score = Number(((correctAnswers / totalQuestions) * 100).toFixed(2));

  const attemptId = await quizModel.createAttempt({
    quizId,
    userId: req.user.id,
    score,
    totalQuestions,
    correctAnswers,
    answers,
  });

  const passed = score >= 50; // Certificate requires >= 50%
  let certificateGenerated = false;

  // Auto-generate certificate if student passes with >= 50%
  if (passed) {
    try {
      const enrollment = await enrollmentModel.findEnrollment({
        userId: req.user.id,
        courseId: quiz.course_id,
      });

      if (enrollment && enrollment.status === "approved") {
        const existingCertificate = await certificateModel.checkCertificateExists(
          req.user.id,
          quiz.course_id
        );
        if (!existingCertificate) {
          await certificateModel.createCertificate({
            userId: req.user.id,
            courseId: quiz.course_id,
          });
          certificateGenerated = true;
        }
      }
    } catch (error) {
      // Log error but don't fail the quiz submission
      console.error("Error auto-generating certificate:", error);
    }
  }

  return sendSuccess(
    res,
    {
      attemptId,
      score,
      totalQuestions,
      correctAnswers,
      passed,
      certificateGenerated,
      review,
    },
    "Quiz submitted successfully",
    201
  );
});

module.exports = {
  listCourseQuizzes,
  createQuiz,
  createQuestion,
  getQuizById,
  submitQuizAttempt,
};
