const crypto = require("crypto");

function normalizeGateway(gateway) {
  if (!["stripe", "paypal", "manual", "mock"].includes(gateway)) {
    return "mock";
  }

  return gateway;
}

async function initializePayment({ gateway, amount, courseId, userId }) {
  const selectedGateway = normalizeGateway(gateway || process.env.PAYMENT_GATEWAY_MODE || "mock");

  if (selectedGateway === "stripe") {
    return {
      gateway: "stripe",
      transactionId: `stripe_${crypto.randomUUID()}`,
      status: "pending",
      checkoutUrl: `https://checkout.stripe.com/pay/${courseId}_${userId}`,
    };
  }

  if (selectedGateway === "paypal") {
    return {
      gateway: "paypal",
      transactionId: `paypal_${crypto.randomUUID()}`,
      status: "pending",
      checkoutUrl: `https://www.paypal.com/checkoutnow?token=${crypto.randomUUID()}`,
    };
  }

  if (selectedGateway === "manual") {
    return {
      gateway: "manual",
      transactionId: `manual_${crypto.randomUUID()}`,
      status: "pending",
      checkoutUrl: null,
      instructions: "Upload payment screenshot and transaction reference for admin verification.",
    };
  }

  return {
    gateway: "mock",
    transactionId: `mock_${crypto.randomUUID()}`,
    status: "completed",
    checkoutUrl: null,
    instructions: "Mock gateway marks payment as completed instantly.",
  };
}

module.exports = {
  initializePayment,
};
