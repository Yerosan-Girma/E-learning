const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/jwt");
const userModel = require("../models/userModel");

async function registerUser({ fullName, email, password, role = "student", specialization, bio, proposedCourse }) {
  if (!["student", "teacher"].includes(role)) {
    throw new ApiError(403, "Only student and instructor accounts can self-register");
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

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
  });

  if (role === "teacher") {
    // Don't issue a token — teacher must wait for admin approval
    return { pending: true, message: "Your application has been submitted. The admin will review and activate your account." };
  }

  const user = await userModel.findById(userId);
  const token = signToken({ id: user.id, role: user.role, email: user.email, full_name: user.full_name });

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
    created_at: user.created_at,
  };

  const token = signToken({ id: user.id, role: user.role, email: user.email, full_name: user.full_name });

  return { user: safeUser, token };
}

module.exports = {
  registerUser,
  loginUser,
};
