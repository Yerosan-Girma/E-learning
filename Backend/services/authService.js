const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/jwt");
const userModel = require("../models/userModel");
const emailService = require("./emailService");

async function registerUser({ fullName, email, password, role = "student", specialization, bio, proposedCourse }) {
  if (!["student", "teacher"].includes(role)) {
    throw new ApiError(403, "Only student and instructor accounts can self-register");
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Teachers start as "pending" — must be approved by admin before they can log in
  const status = role === "teacher" ? "pending" : "active";

  const userId = await userModel.createUser({
    fullName,
    email,
    passwordHash,
    role,
    status,
    specialization: specialization || null,
    bio: bio || null,
    proposedCourse: proposedCourse || null,
    verificationToken,
  });

  if (role === "teacher") {
    // Notify admin about instructor application
    emailService
      .sendAdminNewStudentEmail({
        studentName: fullName,
        studentEmail: email,
        role: "teacher",
        registeredAt: new Date(),
        details: `Specialization: ${specialization || "N/A"}. Proposed course: ${proposedCourse || "N/A"}`,
      })
      .catch((err) => console.error("[AuthService] Admin email error on teacher application:", err.message));

    // Don't issue a token — teacher must wait for admin approval
    return { pending: true, message: "Your application has been submitted. The admin will review and activate your account." };
  }

  const user = await userModel.findById(userId);
  const token = signToken({ id: user.id, role: user.role, email: user.email, full_name: user.full_name });

  // 1. Send Welcome / Verification email to Student's email
  emailService
    .sendWelcomeEmail(user.email, user.full_name, verificationToken)
    .catch((err) => console.error("[AuthService] Welcome email error:", err.message));

  // 2. Send New Student alert to Admin's email
  emailService
    .sendAdminNewStudentEmail({
      studentName: user.full_name,
      studentEmail: user.email,
      role: user.role,
      registeredAt: new Date(),
    })
    .catch((err) => console.error("[AuthService] Admin notification error:", err.message));

  return { user, token };
}

async function loginUser({ email, password }) {
  const user = await userModel.findByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.status === "pending") {
    throw new ApiError(403, "Your account is pending admin approval. You will be able to log in once approved.");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "Account is inactive. Please contact support.");
  }

  // Google OAuth users have an empty password_hash — they must use Google login
  if (!user.password_hash) {
    throw new ApiError(401, "This account uses Google sign-in. Please use the Google login button.");
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const safeUser = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    email_verified: user.email_verified,
    created_at: user.created_at,
  };

  const token = signToken({ id: user.id, role: user.role, email: user.email, full_name: user.full_name });

  return { user: safeUser, token };
}

async function forgotPassword({ email }) {
  if (!email) {
    throw new ApiError(400, "Email address is required");
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    // Return standard message to prevent email enumeration
    return { message: "If an account with that email exists, password reset instructions have been sent." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await userModel.setResetToken(user.id, resetToken, expiresAt);

  emailService
    .sendPasswordResetEmail(user.email, resetToken, user.full_name)
    .catch((err) => console.error("[AuthService] Password reset email error:", err.message));

  return { message: "If an account with that email exists, password reset instructions have been sent." };
}

async function resetPassword({ token, password }) {
  if (!token || !password) {
    throw new ApiError(400, "Reset token and new password are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const user = await userModel.findByResetToken(token);
  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await userModel.updatePassword(user.id, passwordHash);

  return { message: "Your password has been successfully updated. You can now log in with your new password." };
}

async function verifyEmail({ token }) {
  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  const user = await userModel.findByVerificationToken(token);
  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  await userModel.markEmailVerified(user.id);
  return { message: "Email has been successfully verified! You can now access all course features." };
}

async function resendVerification({ email }) {
  if (!email) {
    throw new ApiError(400, "Email address is required");
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    return { message: "If your email is registered, a new verification link has been sent." };
  }

  if (user.email_verified) {
    return { message: "Your email is already verified. You can log in directly." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await userModel.setVerificationToken(user.id, token);

  emailService
    .sendVerificationEmail(user.email, token, user.full_name)
    .catch((err) => console.error("[AuthService] Resend verification email error:", err.message));

  return { message: "If your email is registered, a new verification link has been sent." };
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
