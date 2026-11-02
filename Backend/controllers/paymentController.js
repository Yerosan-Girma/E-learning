const path = require("path");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const paymentModel = require("../models/paymentModel");
const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");
const userModel = require("../models/userModel");
const { initializePayment } = require("../services/paymentGatewayService");
const { getEffectiveCoursePrice, isCourseFree } = require("../services/courseAccessService");
const emailService = require("../services/emailService");
const chapaService = require("../services/chapaService");

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

  const effectivePrice = getEffectiveCoursePrice(course);
  const amount = Math.round(Number(effectivePrice));

  // Exclusively process via Chapa multi-payment gateway
  if (!chapaService.isChapaConfigured()) {
    throw new ApiError(503, "Chapa payment gateway is currently unavailable");
  }

  const txRef = chapaService.generateTxRef("edl");
  const frontendOrigin = (process.env.CORS_ORIGIN || "https://e-learning-three-phi.vercel.app").split(",")[0].trim();
  const returnUrl = `${frontendOrigin}/payment/verify?tx_ref=${txRef}&course_id=${courseId}`;
  const backendOrigin = (process.env.BACKEND_URL || "https://e-leraning.onrender.com").trim();
  const callbackUrl = `${backendOrigin}/api/payments/chapa/webhook`;

  const studentName = req.body.payerName || req.user.full_name || "Student User";
  const nameParts = studentName.trim().split(" ");
  const firstName = nameParts[0] || "Student";
  const lastName = nameParts.slice(1).join(" ") || "User";

  const chapaRes = await chapaService.initializeTransaction({
    amount,
    currency: "ETB",
    email: req.user.email,
    firstName,
    lastName,
    phoneNumber: req.body.payerPhone,
    txRef,
    returnUrl,
    callbackUrl,
    title: `EduLearn: ${course.title.slice(0, 30)}`,
    description: `Course enrollment payment for ID ${courseId}`,
  });

  const paymentId = await paymentModel.createPayment({
    userId: req.user.id,
    courseId,
    amount,
    gateway: "chapa",
    transactionId: txRef,
    status: "pending",
    screenshotPath: null,
    metaJson: {
      checkoutUrl: chapaRes.checkoutUrl,
      txRef,
      payerPhone: req.body.payerPhone || null,
      payerName: studentName,
    },
  });

  return sendSuccess(
    res,
    {
      paymentId,
      gateway: "chapa",
      transactionId: txRef,
      status: "pending",
      checkoutUrl: chapaRes.checkoutUrl,
      instructions: "Redirecting to Chapa secure checkout for Telebirr / CBE / Card payment...",
    },
    "Chapa payment initialized"
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

  if (status === "completed") {
    // Look up user and course to send confirmation email
    Promise.all([
      userModel.findById(payment.user_id),
      courseModel.getCourseById(payment.course_id),
    ])
      .then(([student, course]) => {
        if (student && course) {
          emailService.sendEnrollmentEmail({
            studentEmail: student.email,
            studentName: student.full_name,
            courseTitle: course.title,
            courseId: course.id,
            amount: payment.amount,
            isFree: false,
          });
          emailService.sendAdminEnrollmentAlert({
            studentEmail: student.email,
            studentName: student.full_name,
            courseTitle: course.title,
            courseId: course.id,
            amount: payment.amount,
            isFree: false,
            enrollmentType: "purchase",
          });
        }
      })
      .catch((err) => console.error("[PaymentStatus] Email notification error:", err.message));
  }

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

  if (status === "completed") {
    // Look up user and course to send confirmation email
    Promise.all([
      userModel.findById(payment.user_id),
      courseModel.getCourseById(payment.course_id),
    ])
      .then(([student, course]) => {
        if (student && course) {
          emailService.sendEnrollmentEmail({
            studentEmail: student.email,
            studentName: student.full_name,
            courseTitle: course.title,
            courseId: course.id,
            amount: payment.amount,
            isFree: false,
          });
          emailService.sendAdminEnrollmentAlert({
            studentEmail: student.email,
            studentName: student.full_name,
            courseTitle: course.title,
            courseId: course.id,
            amount: payment.amount,
            isFree: false,
            enrollmentType: "purchase",
          });
        }
      })
      .catch((err) => console.error("[PaymentStatus] Email notification error:", err.message));
  }

  return sendSuccess(res, {}, "Webhook processed");
});

const verifyChapaPayment = asyncHandler(async (req, res) => {
  const { txRef } = req.body;
  if (!txRef) {
    throw new ApiError(400, "Transaction reference (txRef) is required");
  }

  const payment = await paymentModel.findPaymentByTransaction(txRef);
  if (!payment) {
    throw new ApiError(404, "Payment record not found for transaction reference");
  }

  // Already completed
  if (payment.status === "completed") {
    return sendSuccess(
      res,
      {
        courseId: payment.course_id,
        status: "completed",
        transactionId: txRef,
      },
      "Payment already verified and course access is active."
    );
  }

  // Verify status directly with Chapa
  const chapaVerify = await chapaService.verifyTransaction(txRef);

  const isSuccess =
    chapaVerify.success &&
    (String(chapaVerify.status).toLowerCase() === "success" ||
      String(chapaVerify.raw?.status).toLowerCase() === "success");

  if (!isSuccess) {
    throw new ApiError(400, chapaVerify.message || "Payment has not been completed on Chapa yet");
  }

  // Mark payment completed
  await paymentModel.updatePaymentStatus({
    paymentId: payment.id,
    status: "completed",
    transactionId: txRef,
  });

  // Approve course enrollment
  await ensureEnrollmentStatus({
    userId: payment.user_id,
    courseId: payment.course_id,
    status: "approved",
  });

  const course = await courseModel.getCourseById(payment.course_id);
  const student = await userModel.findUserById(payment.user_id);

  if (student && course) {
    emailService
      .sendEnrollmentEmail({
        studentEmail: student.email,
        studentName: student.full_name,
        courseTitle: course.title,
        courseId: course.id,
        amount: payment.amount,
        isFree: false,
      })
      .catch((err) => console.error("[ChapaVerify] Student email error:", err.message));

    emailService
      .sendAdminEnrollmentAlert({
        studentEmail: student.email,
        studentName: student.full_name,
        courseTitle: course.title,
        courseId: course.id,
        amount: payment.amount,
        isFree: false,
        enrollmentType: "purchase",
      })
      .catch((err) => console.error("[ChapaVerify] Admin alert error:", err.message));
  }

  return sendSuccess(
    res,
    {
      courseId: payment.course_id,
      status: "completed",
      transactionId: txRef,
    },
    "Payment verified successfully! Course enrollment activated."
  );
});

const handleChapaWebhook = asyncHandler(async (req, res) => {
  const txRef = req.body?.tx_ref || req.query?.tx_ref;
  if (!txRef) {
    return res.status(200).json({ received: true });
  }

  const payment = await paymentModel.findPaymentByTransaction(txRef);
  if (!payment || payment.status === "completed") {
    return res.status(200).json({ received: true });
  }

  try {
    const chapaVerify = await chapaService.verifyTransaction(txRef);
    const isSuccess =
      chapaVerify.success &&
      (String(chapaVerify.status).toLowerCase() === "success" ||
        String(chapaVerify.raw?.status).toLowerCase() === "success");

    if (isSuccess) {
      await paymentModel.updatePaymentStatus({
        paymentId: payment.id,
        status: "completed",
        transactionId: txRef,
      });

      await ensureEnrollmentStatus({
        userId: payment.user_id,
        courseId: payment.course_id,
        status: "approved",
      });

      const course = await courseModel.getCourseById(payment.course_id);
      const student = await userModel.findUserById(payment.user_id);
      if (student && course) {
        emailService
          .sendEnrollmentEmail({
            studentEmail: student.email,
            studentName: student.full_name,
            courseTitle: course.title,
            courseId: course.id,
            amount: payment.amount,
            isFree: false,
          })
          .catch((err) => console.error("[ChapaWebhook] Email error:", err.message));

        emailService
          .sendAdminEnrollmentAlert({
            studentEmail: student.email,
            studentName: student.full_name,
            courseTitle: course.title,
            courseId: course.id,
            amount: payment.amount,
            isFree: false,
            enrollmentType: "purchase",
          })
          .catch((err) => console.error("[ChapaWebhook] Admin alert error:", err.message));
      }
    }
  } catch (err) {
    console.error("[ChapaWebhook] Error processing webhook:", err.message);
  }

  return res.status(200).json({ received: true });
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
  verifyChapaPayment,
  handleChapaWebhook,
  getMyPayments,
  listAllPayments,
};
