const { pool } = require("../config/db");

async function createQuiz({ courseId, title, description, passingScore }) {
  const result = await pool.query(
    `
      INSERT INTO course_quizzes (course_id, title, description, passing_score)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [courseId, title, description, passingScore]
  );

  return result.rows[0].id;
}

async function getQuizById(quizId) {
  const result = await pool.query(
    `
      SELECT
        q.*,
        c.title AS course_title,
        c.instructor_id,
        c.is_published,
        c.price,
        c.discount_price
      FROM course_quizzes q
      INNER JOIN courses c ON q.course_id = c.id
      WHERE q.id = $1
      LIMIT 1
    `,
    [quizId]
  );

  return result.rows[0] || null;
}

async function listQuizzesByCourseId(courseId) {
  const result = await pool.query(
    `
      SELECT
        q.*,
        (
          SELECT COUNT(*)
          FROM quiz_questions qq
          WHERE qq.quiz_id = q.id
        ) AS question_count
      FROM course_quizzes q
      WHERE q.course_id = $1
      ORDER BY q.created_at ASC, q.id ASC
    `,
    [courseId]
  );

  return result.rows;
}

async function createQuestion({
  quizId,
  questionText,
  options,
  correctOption,
  explanation,
  sortOrder,
}) {
  const result = await pool.query(
    `
      INSERT INTO quiz_questions
      (quiz_id, question_text, options_json, correct_option, explanation, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [quizId, questionText, JSON.stringify(options), correctOption, explanation, sortOrder]
  );

  return result.rows[0].id;
}

async function listQuestionsByQuizId(quizId) {
  const result = await pool.query(
    `
      SELECT id, quiz_id, question_text, options_json, correct_option, explanation, sort_order
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY sort_order ASC, id ASC
    `,
    [quizId]
  );

  return result.rows.map((row) => ({
    ...row,
    options: Array.isArray(row.options_json)
      ? row.options_json
      : JSON.parse(row.options_json || "[]"),
  }));
}

async function createAttempt({
  quizId,
  userId,
  score,
  totalQuestions,
  correctAnswers,
  answers,
}) {
  const result = await pool.query(
    `
      INSERT INTO quiz_attempts
      (quiz_id, user_id, score, total_questions, correct_answers, answers_json)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [
      quizId,
      userId,
      score,
      totalQuestions,
      correctAnswers,
      answers ? JSON.stringify(answers) : null,
    ]
  );

  return result.rows[0].id;
}

async function listAttemptsByUser(userId, { courseId = null } = {}) {
  let query = `
    SELECT
      qa.*,
      q.title AS quiz_title,
      q.passing_score,
      c.id AS course_id,
      c.title AS course_title
    FROM quiz_attempts qa
    INNER JOIN course_quizzes q ON qa.quiz_id = q.id
    INNER JOIN courses c ON q.course_id = c.id
    WHERE qa.user_id = $1
  `;
  const values = [userId];
  let paramIndex = 2;

  if (courseId) {
    query += ` AND c.id = $${paramIndex++}`;
    values.push(courseId);
  }

  query += " ORDER BY qa.submitted_at DESC, qa.id DESC";

  const result = await pool.query(query, values);
  return result.rows.map((row) => ({
    ...row,
    answers: row.answers_json ? (() => {
      try {
        return JSON.parse(row.answers_json);
      } catch {
        return [];
      }
    })() : [],
  }));
}

async function listAttemptsByQuiz(quizId) {
  const result = await pool.query(
    `
      SELECT
        qa.*,
        u.full_name,
        u.email
      FROM quiz_attempts qa
      INNER JOIN users u ON qa.user_id = u.id
      WHERE qa.quiz_id = $1
      ORDER BY qa.submitted_at DESC, qa.id DESC
    `,
    [quizId]
  );

  return result.rows.map((row) => ({
    ...row,
    answers: row.answers_json ? JSON.parse(row.answers_json) : [],
  }));
}

async function getLatestAttemptByUserAndQuiz({ userId, quizId }) {
  const result = await pool.query(
    `
      SELECT *
      FROM quiz_attempts
      WHERE user_id = $1 AND quiz_id = $2
      ORDER BY submitted_at DESC, id DESC
      LIMIT 1
    `,
    [userId, quizId]
  );

  if (!result.rows[0]) return null;

  return {
    ...result.rows[0],
    answers: result.rows[0].answers_json ? (() => {
      try {
        return JSON.parse(result.rows[0].answers_json);
      } catch {
        return [];
      }
    })() : [],
  };
}

module.exports = {
  createQuiz,
  getQuizById,
  listQuizzesByCourseId,
  createQuestion,
  listQuestionsByQuizId,
  createAttempt,
  listAttemptsByUser,
  listAttemptsByQuiz,
  getLatestAttemptByUserAndQuiz,
};
