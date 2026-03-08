const path = require("path");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const paymentModel = require("../models/paymentModel");
const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");
const { initializePayment } = require("../services/paymentGatewayService");

const initializeCoursePayment = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const amount = Number(course.discount_price || course.price || 0);
  if (amount <= 0) {
    throw new ApiError(422, "This course is free and does not require payment");
  }

  const gatewayPayload = await initializePayment({
    gateway: req.body.gateway,
    amount,
    courseId,
    userId: req.user.id,
  });

  const paymentId = await paymentModel.createPayment({
    userId: req.user.id,
    courseId,
    amount,
    gateway: gatewayPayload.gateway,
    transactionId: gatewayPayload.transactionId,
    status: gatewayPayload.status,
    screenshotPath: null,
    metaJson: {
      checkoutUrl: gatewayPayload.checkoutUrl,
      instructions: gatewayPayload.instructions || null,
    },
  });

  const existingEnrollment = await enrollmentModel.findEnrollment({
    userId: req.user.id,
    courseId,
  });

  if (!existingEnrollment) {
    await enrollmentModel.createEnrollment({
      userId: req.user.id,
      courseId,
      status: gatewayPayload.status === "completed" ? "approved" : "pending",
    });
  } else {
    await enrollmentModel.updateEnrollment({
      enrollmentId: existingEnrollment.id,
      status: gatewayPayload.status === "completed" ? "approved" : "pending",
    });
  }

  return sendSuccess(
    res,
    {
      paymentId,
      gateway: gatewayPayload.gateway,
      transactionId: gatewayPayload.transactionId,
      status: gatewayPayload.status,
      checkoutUrl: gatewayPayload.checkoutUrl,
      instructions: gatewayPayload.instructions || null,
    },
    "Payment initialized",
    201
  );
});

const submitManualPaymentProof = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (!req.file) {
    throw new ApiError(422, "Payment screenshot is required");
  }

  const amount = Number(course.discount_price || course.price || 0);

  const paymentId = await paymentModel.createPayment({
    userId: req.user.id,
    courseId,
    amount,
    gateway: "manual",
    transactionId: req.body.transactionId || null,
    status: "pending",
    screenshotPath: path.join("uploads", req.file.filename).replace(/\\/g, "/"),
    metaJson: {
      notes: req.body.notes || null,
    },
  });

  const existingEnrollment = await enrollmentModel.findEnrollment({
    userId: req.user.id,
    courseId,
  });

  if (!existingEnrollment) {
    await enrollmentModel.createEnrollment({
      userId: req.user.id,
      courseId,
      status: "pending",
    });
  } else {
    await enrollmentModel.updateEnrollment({
      enrollmentId: existingEnrollment.id,
      status: "pending",
    });
  }

  return sendSuccess(res, { paymentId }, "Manual payment proof submitted", 201);
});

const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const { transactionId, status } = req.body;

  if (!transactionId || !status) {
    throw new ApiError(422, "transactionId and status are required");
  }

  const payment = await paymentModel.findPaymentByTransaction(transactionId);

  if (!payment) {
    throw new ApiError(404, "Payment transaction not found");
  }

  await paymentModel.updatePaymentStatus({
    paymentId: payment.id,
    status,
    transactionId,
  });

  const enrollment = await enrollmentModel.findEnrollment({
    userId: payment.user_id,
    courseId: payment.course_id,
  });

  if (enrollment) {
    await enrollmentModel.updateEnrollment({
      enrollmentId: enrollment.id,
      status: status === "completed" ? "approved" : "pending",
    });
  }

  return sendSuccess(res, {}, "Webhook processed");
});

const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await paymentModel.listPayments({ userId: req.user.id });
  return sendSuccess(res, { payments }, "Payments fetched");
});

const listAllPayments = asyncHandler(async (req, res) => {
  const payments = await paymentModel.listPayments();
  return sendSuccess(res, { payments }, "All payments fetched");
});

module.exports = {
  initializeCoursePayment,
  submitManualPaymentProof,
  handlePaymentWebhook,
  getMyPayments,
  listAllPayments,
};
