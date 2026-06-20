const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/jwt");
const userModel = require("../models/userModel");

async function registerUser({ fullName, email, password, role = "student" }) {
  if (!["student", "teacher"].includes(role)) {
    throw new ApiError(403, "Only student and instructor accounts can self-register");
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new ApiError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = await userModel.createUser({ fullName, email, passwordHash, role });

  const user = await userModel.findById(userId);
  const token = signToken({ id: user.id, role: user.role, email: user.email });

  return { user, token };
}

async function loginUser({ email, password, googleId = null }) {
  const user = await userModel.findByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "Account is inactive");
  }

  // For Google login, skip password verification
  if (googleId) {
    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
    };

    const token = signToken({ id: user.id, role: user.role, email: user.email });
    return { user: safeUser, token };
  }

  // For admin users, require password verification
  if (user.role === "admin") {
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new ApiError(401, "Invalid credentials");
    }
  }

  // For students and teachers, allow login with just email (no password required)
  // If password is provided, verify it; if not, skip verification
  if (password) {
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new ApiError(401, "Invalid credentials");
    }
  }

  const safeUser = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  };

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  return { user: safeUser, token };
}

module.exports = {
  registerUser,
  loginUser,
};
