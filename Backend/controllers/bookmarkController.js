const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const bookmarkModel = require("../models/bookmarkModel");

const createBookmark = asyncHandler(async (req, res) => {
  const { lessonId, courseId, note } = req.body;

  const bookmarkId = await bookmarkModel.createBookmark({
    userId: req.user.id,
    lessonId,
    courseId,
    note,
  });

  const bookmark = await bookmarkModel.getBookmarkByUserAndLesson(
    req.user.id,
    lessonId
  );

  return sendSuccess(
    res,
    { bookmarkId, bookmark },
    "Bookmark created successfully",
    201
  );
});

const getMyBookmarks = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  let bookmarks;

  if (courseId) {
    bookmarks = await bookmarkModel.getBookmarksByCourse(
      req.user.id,
      Number(courseId)
    );
  } else {
    bookmarks = await bookmarkModel.getBookmarksByUser(req.user.id);
  }

  return sendSuccess(res, { bookmarks }, "Bookmarks fetched");
});

const updateBookmark = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { note } = req.body;

  const rowCount = await bookmarkModel.updateBookmark(req.user.id, Number(lessonId), {
    note,
  });

  if (rowCount === 0) {
    throw new ApiError(404, "Bookmark not found");
  }

  const bookmark = await bookmarkModel.getBookmarkByUserAndLesson(
    req.user.id,
    Number(lessonId)
  );

  return sendSuccess(res, { bookmark }, "Bookmark updated successfully");
});

const deleteBookmark = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const rowCount = await bookmarkModel.deleteBookmark(
    req.user.id,
    Number(lessonId)
  );

  if (rowCount === 0) {
    throw new ApiError(404, "Bookmark not found");
  }

  return sendSuccess(res, { lessonId }, "Bookmark deleted successfully");
});

module.exports = {
  createBookmark,
  getMyBookmarks,
  updateBookmark,
  deleteBookmark,
};
