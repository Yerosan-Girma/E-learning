const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const authService = require("../services/authService");
const userModel = require("../models/userModel");

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, specialization, bio, proposedCourse } = req.body;

  const result = await authService.registerUser({
    fullName,
    email,
    password,
    role: role || "student",
    specialization,
    bio,
    proposedCourse,
  });

  // Teacher registration returns pending — no token issued
  if (result.pending) {
    return sendSuccess(res, { pending: true }, result.message, 201);
  }

  return sendSuccess(res, { user: result.user, token: result.token }, "Registration successful", 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const data = await authService.loginUser({ email, password });
  return sendSuccess(res, data, "Login successful");
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  return sendSuccess(res, { user }, "Profile fetched");
});

const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, {}, "Logout successful");
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword({ email });
  return sendSuccess(res, {}, result.message);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword({ token, password });
  return sendSuccess(res, {}, result.message);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await authService.verifyEmail({ token });
  return sendSuccess(res, {}, result.message);
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendVerification({ email });
  return sendSuccess(res, {}, result.message);
});

const googleTokenLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const result = await authService.loginWithGoogleToken(credential);
  return sendSuccess(res, result, "Login successful with Google");
});

module.exports = {
  register,
  login,
  googleTokenLogin,
  getProfile,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
