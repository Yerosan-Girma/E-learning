const path = require("path");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const paymentModel = require("../models/paymentModel");
const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");
const { initializePayment } = require("../services/paymentGatewayService");
const { getEffectiveCoursePrice, isCourseFree } = require("../services/courseAccessService");

async function ensureEnrollmentStatus({ userId, courseId, status }) {
  const existingEnrollment = await enrollmentModel.findEnrollment({
    userId,
    courseId,
  });

  if (!existingEnrollment) {
    await enrollmentModel.createEnrollment({
      userId,
      courseId,
      status,
    });
    return;
  }

  await enrollmentModel.updateEnrollment({
    enrollmentId: existingEnrollment.id,
    status,
  });
}

const initializeCoursePayment = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (isCourseFree(course)) {
    throw new ApiError(422, "This course is free and does not require payment");
  }

  const existingPayment = await paymentModel.findCompletedPaymentByUserAndCourse({
    userId: req.user.id,
    courseId,
  });

  if (existingPayment) {
    await ensureEnrollmentStatus({ userId: req.user.id, courseId, status: "approved" });

    return sendSuccess(
      res,
      {
        paymentId: existingPayment.id,
        gateway: existingPayment.gateway,
        transactionId: existingPayment.transaction_id,
        status: existingPayment.status,
        checkoutUrl: null,
        instructions: "Payment already approved. Course access remains active.",
      },
      "Payment already completed"
    );
  }

  const amount = getEffectiveCoursePrice(course);
  const gatewayPayload = await initializePayment({
    gateway: req.body.gateway,
    amount,
    courseId,
    userId: req.user.id,
    payerName: req.body.payerName,
    payerPhone: req.body.payerPhone,
    payerReference: req.body.payerReference,
  });

  const paymentId = await paymentModel.createPayment({
    userId: req.user.id,
    courseId,
    amount,
    gateway: gatewayPayload.gateway,
    transactionId: gatewayPayload.transactionId,
    status: "completed",
    screenshotPath: null,
    metaJson: {
      checkoutUrl: gatewayPayload.checkoutUrl,
      instructions: gatewayPayload.instructions,
      simulated: true,
      ...gatewayPayload.meta,
    },
  });

  await ensureEnrollmentStatus({ userId: req.user.id, courseId, status: "approved" });

  return sendSuccess(
    res,
    {
      paymentId,
      gateway: gatewayPayload.gateway,
      transactionId: gatewayPayload.transactionId,
      status: "completed",
      checkoutUrl: gatewayPayload.checkoutUrl,
      instructions: gatewayPayload.instructions,
    },
    "Payment completed successfully. You are now enrolled.",
    201
  );
});

const submitManualPaymentProof = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await courseModel.getCourseById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (isCourseFree(course)) {
    throw new ApiError(422, "This course is free and does not require payment");
  }

  const amount = getEffectiveCoursePrice(course);
  const transactionId =
    req.body.transactionId || `BANK-${Date.now()}-${Math.round(Math.random() * 1000)}`;

  const paymentId = await paymentModel.createPayment({
    userId: req.user.id,
    courseId,
    amount,
    gateway: "bank_transfer",
    transactionId,
    status: "pending",
    screenshotPath: req.file
      ? path.join("uploads", req.file.filename).replace(/\\/g, "/")
      : null,
    metaJson: {
      notes: req.body.notes || null,
      proofUploaded: Boolean(req.file),
      simulatedAt: new Date().toISOString(),
    },
  });

  await ensureEnrollmentStatus({ userId: req.user.id, courseId, status: "pending" });

  return sendSuccess(
    res,
    {
      paymentId,
      transactionId,
      status: "pending",
    },
    "Payment proof submitted and waiting for admin approval",
    201
  );
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const paymentId = Number(req.params.paymentId);
  const { status } = req.body;

  if (!["completed", "failed", "pending"].includes(status)) {
    throw new ApiError(422, "Invalid payment status");
  }

  const payment = await paymentModel.findPaymentById(paymentId);
  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  await paymentModel.updatePaymentStatus({
    paymentId,
    status,
    transactionId: payment.transaction_id,
  });

  await ensureEnrollmentStatus({
    userId: payment.user_id,
    courseId: payment.course_id,
    status: status === "completed" ? "approved" : "pending",
  });

  return sendSuccess(
    res,
    {
      paymentId,
      status,
    },
    "Payment status updated"
  );
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

  await ensureEnrollmentStatus({
    userId: payment.user_id,
    courseId: payment.course_id,
    status: status === "completed" ? "approved" : "pending",
  });

  return sendSuccess(res, {}, "Webhook processed");
});

const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await paymentModel.listPayments({ userId: req.user.id });
  return sendSuccess(res, { payments }, "Payments fetched");
});

const listAllPayments = asyncHandler(async (req, res) => {
  const payments = await paymentModel.listPayments({
    status: req.query.status,
    gateway: req.query.gateway,
  });
  return sendSuccess(res, { payments }, "All payments fetched");
});

module.exports = {
  initializeCoursePayment,
  submitManualPaymentProof,
  updatePaymentStatus,
  handlePaymentWebhook,
  getMyPayments,
  listAllPayments,
};
