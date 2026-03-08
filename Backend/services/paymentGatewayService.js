const crypto = require("crypto");

function normalizeGateway(gateway) {
  if (!["telebirr", "manual"].includes(gateway)) {
    return "manual";
  }

  return gateway;
}

async function initializePayment({ gateway, amount, courseId, userId }) {
  const selectedGateway = normalizeGateway(
    gateway || process.env.PAYMENT_GATEWAY_MODE || "telebirr"
  );

  if (selectedGateway === "telebirr") {
    return {
      gateway: "telebirr",
      transactionId: `telebirr_${crypto.randomUUID()}`,
      status: "pending",
      checkoutUrl: process.env.TELEBIRR_CHECKOUT_URL || null,
      instructions:
        "Complete your Telebirr payment and submit your transaction reference for admin verification.",
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
    gateway: "manual",
    transactionId: `manual_${crypto.randomUUID()}`,
    status: "pending",
    checkoutUrl: null,
    instructions: "Upload payment screenshot and transaction reference for admin verification.",
  };
}

module.exports = {
  initializePayment,
};
