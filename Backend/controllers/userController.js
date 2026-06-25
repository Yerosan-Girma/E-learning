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

  if (!["active", "inactive", "pending"].includes(status)) {
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

const listPendingTeachers = asyncHandler(async (req, res) => {
  const teachers = await userModel.listPendingTeachers();
  return sendSuccess(res, { teachers }, "Pending teacher applications fetched");
});

const approveTeacher = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);

  const user = await userModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== "teacher") throw new ApiError(400, "User is not a teacher applicant");

  await userModel.updateUserStatus({ userId, status: "active" });
  const updated = await userModel.findById(userId);
  return sendSuccess(res, { user: updated }, "Teacher application approved");
});

const rejectTeacher = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);

  const user = await userModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== "teacher") throw new ApiError(400, "User is not a teacher applicant");

  await userModel.updateUserStatus({ userId, status: "inactive" });
  const updated = await userModel.findById(userId);
  return sendSuccess(res, { user: updated }, "Teacher application rejected");
});

module.exports = {
  listUsers,
  updateUserStatus,
  listPendingTeachers,
  approveTeacher,
  rejectTeacher,
};
