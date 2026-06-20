const { pool } = require("../config/db");
const crypto = require("crypto");

async function generateCertificateNumber() {
  const prefix = "CERT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

async function generateVerificationCode() {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

async function createCertificate({ userId, courseId }) {
  const certificateNumber = await generateCertificateNumber();
  const verificationCode = await generateVerificationCode();

  const query = `
    INSERT INTO certificates (user_id, course_id, certificate_number, verification_code)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const result = await pool.query(query, [userId, courseId, certificateNumber, verificationCode]);
  return result.rows[0].id;
}

async function getCertificateById(id) {
  const query = `
    SELECT c.*, u.full_name AS student_name, u.email AS student_email,
           co.title AS course_title, co.description AS course_description,
           ins.full_name AS instructor_name
    FROM certificates c
    INNER JOIN users u ON c.user_id = u.id
    INNER JOIN courses co ON c.course_id = co.id
    INNER JOIN users ins ON co.instructor_id = ins.id
    WHERE c.id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function getCertificateByNumber(certificateNumber) {
  const query = `
    SELECT c.*, u.full_name AS student_name, u.email AS student_email,
           co.title AS course_title, co.description AS course_description,
           ins.full_name AS instructor_name
    FROM certificates c
    INNER JOIN users u ON c.user_id = u.id
    INNER JOIN courses co ON c.course_id = co.id
    INNER JOIN users ins ON co.instructor_id = ins.id
    WHERE c.certificate_number = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [certificateNumber]);
  return result.rows[0] || null;
}

async function getCertificateByVerificationCode(verificationCode) {
  const query = `
    SELECT c.*, u.full_name AS student_name, u.email AS student_email,
           co.title AS course_title, co.description AS course_description,
           ins.full_name AS instructor_name
    FROM certificates c
    INNER JOIN users u ON c.user_id = u.id
    INNER JOIN courses co ON c.course_id = co.id
    INNER JOIN users ins ON co.instructor_id = ins.id
    WHERE c.verification_code = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [verificationCode]);
  return result.rows[0] || null;
}

async function getCertificatesByUser(userId) {
  const query = `
    SELECT c.*, co.title AS course_title, co.thumbnail_url, ins.full_name AS instructor_name
    FROM certificates c
    INNER JOIN courses co ON c.course_id = co.id
    INNER JOIN users ins ON co.instructor_id = ins.id
    WHERE c.user_id = $1
    ORDER BY c.issue_date DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function getCertificatesByCourse(courseId) {
  const query = `
    SELECT c.*, u.full_name AS student_name, u.email AS student_email
    FROM certificates c
    INNER JOIN users u ON c.user_id = u.id
    WHERE c.course_id = $1
    ORDER BY c.issue_date DESC
  `;
  const result = await pool.query(query, [courseId]);
  return result.rows;
}

async function updateCertificatePdfUrl(id, pdfUrl) {
  const query = `
    UPDATE certificates
    SET pdf_url = $1
    WHERE id = $2
  `;
  const result = await pool.query(query, [pdfUrl, id]);
  return result.rowCount;
}

async function checkCertificateExists(userId, courseId) {
  const query = `
    SELECT id FROM certificates
    WHERE user_id = $1 AND course_id = $2
    LIMIT 1
  `;
  const result = await pool.query(query, [userId, courseId]);
  return result.rows[0] || null;
}

module.exports = {
  createCertificate,
  getCertificateById,
  getCertificateByNumber,
  getCertificateByVerificationCode,
  getCertificatesByUser,
  getCertificatesByCourse,
  updateCertificatePdfUrl,
  checkCertificateExists,
};
