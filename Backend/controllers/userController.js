const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const userModel = require("../models/userModel");

const listUsers = asyncHandler(async (req, res) => {
  const users = await userModel.listUsers({
    role: req.query.role || null,
    search: req.query.search || "",
  });

  return sendSuccess(res, { users }, "Users fetched");
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    throw new ApiError(422, "Invalid user status");
  }

  if (Number(req.user.id) === userId && status === "inactive") {
    throw new ApiError(422, "You cannot deactivate your own admin account");
  }

  await userModel.updateUserStatus({ userId, status });
  const user = await userModel.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sendSuccess(res, { user }, "User status updated");
});

module.exports = {
  listUsers,
  updateUserStatus,
};
