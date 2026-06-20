const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const authService = require("../services/authService");
const userModel = require("../models/userModel");

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const { user, token } = await authService.registerUser({
    fullName,
    email,
    password,
    role: role || "student",
  });

  return sendSuccess(
    res,
    {
      user,
      token,
    },
    "Registration successful",
    201
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password, googleId } = req.body;

  const data = await authService.loginUser({ email, password, googleId });
  return sendSuccess(res, data, "Login successful");
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  return sendSuccess(res, { user }, "Profile fetched");
});

const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, {}, "Logout successful");
});

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
