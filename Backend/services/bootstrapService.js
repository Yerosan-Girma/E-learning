const { DEMO_COURSES } = require("./courseContentSeed");

const DEMO_USERS = [
  {
    fullName: "Student Demo",
    email: "student@edulearn.com",
    passwordHash: "$2a$10$3zCQaciTc.0TQmRAW4JX5OqBJrHDn.8yOpx8.e80ZuYWnZQ0rg3.m",
    role: "student",
  },
  {
    fullName: "Teacher Demo",
    email: "teacher@edulearn.com",
    passwordHash: "$2a$10$kd6ccz.Khh4V5CmDF0j3bew4eQQMKPiJMLXPMgDdNElvAgn37NSTu",
    role: "teacher",
  },
  {
    fullName: "Admin Demo",
    email: "admin@edulearn.com",
    passwordHash: "$2a$10$IYF5XlUGs959JKHzZocCQeL0.MZZ9lWD0cSSUGObF8nS4PyaCEqvW",
    role: "admin",
  },
];

async function ensureDemoUsers(connection) {
  const userIds = {};

  for (const user of DEMO_USERS) {
    const result = await connection.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [user.email]
    );

    if (result.rows[0]) {
      userIds[user.email] = Number(result.rows[0].id);
      continue;
    }

    const insertResult = await connection.query(
      `
        INSERT INTO users (full_name, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, 'active')
        RETURNING id
      `,
      [user.fullName, user.email, user.passwordHash, user.role]
    );

    userIds[user.email] = Number(insertResult.rows[0].id);
  }

  return userIds;
}

async function ensureCourse(connection, teacherId, course) {
  const result = await connection.query(
    "SELECT id FROM courses WHERE title = $1 ORDER BY id ASC LIMIT 1",
    [course.title]
  );

  if (result.rows[0]) {
    await connection.query(
      `
        UPDATE courses
        SET category = $1, level = $2, price = $3, discount_price = $4, thumbnail_url = $5,
            description = COALESCE(NULLIF(description, ''), $6),
            instructor_id = COALESCE(instructor_id, $7),
            is_published = TRUE
        WHERE id = $8
      `,
      [
        course.category,
        course.level,
        course.price,
        course.discountPrice,
        course.thumbnailUrl,
        course.description,
        teacherId,
        Number(result.rows[0].id),
      ]
    );

    return Number(result.rows[0].id);
  }

  const insertResult = await connection.query(
    `
      INSERT INTO courses
      (title, description, category, level, price, discount_price, thumbnail_url, instructor_id, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING id
    `,
    [
      course.title,
      course.description,
      course.category,
      course.level,
      course.price,
      course.discountPrice,
      course.thumbnailUrl,
      teacherId,
    ]
  );

  return Number(insertResult.rows[0].id);
}

async function ensureLessons(connection, courseId, lessons) {
  for (const lesson of lessons) {
    const existing = await connection.query(
      `
        SELECT id
        FROM course_lessons
        WHERE course_id = $1 AND title = $2
        LIMIT 1
      `,
      [courseId, lesson.title]
    );

    if (existing.rows[0]) {
      await connection.query(
        `
          UPDATE course_lessons
          SET lesson_type = $1, video_url = $2, notes_content = $3, attachment_url = $4,
              sort_order = $5, is_preview = $6, module_name = $7
          WHERE id = $8
        `,
        [
          lesson.lessonType,
          lesson.videoUrl,
          lesson.notesContent,
          lesson.attachmentUrl || null,
          lesson.sortOrder,
          lesson.isPreview ? true : false,
          lesson.moduleName || null,
          Number(existing.rows[0].id),
        ]
      );
      continue;
    }

    await connection.query(
      `
        INSERT INTO course_lessons
        (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, module_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        courseId,
        lesson.title,
        lesson.lessonType,
        lesson.videoUrl,
        lesson.notesContent,
        lesson.attachmentUrl || null,
        lesson.sortOrder,
        lesson.isPreview ? true : false,
        lesson.moduleName || null,
      ]
    );
  }
}

async function ensureQuizzes(connection, courseId, quizzes) {
  for (const quiz of quizzes || []) {
    const existing = await connection.query(
      `
        SELECT id FROM course_quizzes
        WHERE course_id = $1 AND title = $2
        LIMIT 1
      `,
      [courseId, quiz.title]
    );

    let quizId;

    if (existing.rows[0]) {
      quizId = Number(existing.rows[0].id);
      await connection.query(
        `
          UPDATE course_quizzes
          SET description = $1, passing_score = $2
          WHERE id = $3
        `,
        [quiz.description, quiz.passingScore, quizId]
      );
    } else {
      const insertResult = await connection.query(
        `
          INSERT INTO course_quizzes (course_id, title, description, passing_score)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `,
        [courseId, quiz.title, quiz.description, quiz.passingScore]
      );
      quizId = Number(insertResult.rows[0].id);
    }

    for (const question of quiz.questions || []) {
      const qExisting = await connection.query(
        `
          SELECT id FROM quiz_questions
          WHERE quiz_id = $1 AND question_text = $2
          LIMIT 1
        `,
        [quizId, question.questionText]
      );

      if (qExisting.rows[0]) {
        await connection.query(
          `
            UPDATE quiz_questions
            SET options_json = $1, correct_option = $2, explanation = $3
            WHERE id = $4
          `,
          [
            JSON.stringify(question.options),
            question.correctOption,
            question.explanation || null,
            Number(qExisting.rows[0].id),
          ]
        );
      } else {
        await connection.query(
          `
            INSERT INTO quiz_questions
            (quiz_id, question_text, options_json, correct_option, explanation, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            quizId,
            question.questionText,
            JSON.stringify(question.options),
            question.correctOption,
            question.explanation || null,
            question.sortOrder || 1,
          ]
        );
      }
    }
  }
}

function flattenModules(course) {
  const lessons = [];
  for (const module of course.modules || []) {
    for (const lesson of module.lessons || []) {
      lessons.push({
        ...lesson,
        moduleName: lesson.moduleName || module.name,
      });
    }
  }
  return lessons;
}

async function ensurePlatformSeedData(connection) {
  const userIds = await ensureDemoUsers(connection);
  const teacherId = userIds["teacher@edulearn.com"];

  if (!teacherId) {
    return;
  }

  for (const course of DEMO_COURSES) {
    const courseId = await ensureCourse(connection, teacherId, course);
    const lessons = flattenModules(course);
    await ensureLessons(connection, courseId, lessons);
    await ensureQuizzes(connection, courseId, course.quizzes);
  }
}

module.exports = {
  ensurePlatformSeedData,
};
