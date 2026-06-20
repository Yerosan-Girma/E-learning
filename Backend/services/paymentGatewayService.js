const crypto = require("crypto");

function normalizeGateway(gateway) {
  const allowed = ["telebirr", "bank_transfer", "cash", "chapa", "paypal", "cbe_birr"];
  if (!allowed.includes(gateway)) {
    return "telebirr";
  }

  return gateway;
}

function gatewayLabel(gateway) {
  if (gateway === "telebirr") return "Telebirr";
  if (gateway === "bank_transfer") return "Bank Transfer";
  if (gateway === "cash") return "Cash";
  if (gateway === "chapa") return "Chapa";
  if (gateway === "paypal") return "PayPal";
  if (gateway === "cbe_birr") return "CBE Birr";
  return "Payment";
}

function getGatewayInstructions(gateway, amount) {
  const instructions = {
    telebirr: `Payment of ${amount} ETB via Telebirr completed successfully. Transaction ID generated.`,
    bank_transfer: `Bank transfer of ${amount} ETB received. Your enrollment is pending verification.`,
    cash: `Cash payment of ${amount} ETB recorded. Your enrollment is pending verification.`,
    chapa: `Payment of ${amount} ETB via Chapa completed successfully. Transaction ID generated.`,
    paypal: `Payment of ${amount} USD via PayPal completed successfully. Transaction ID generated.`,
    cbe_birr: `Payment of ${amount} ETB via CBE Birr completed successfully. Transaction ID generated.`,
  };
  return instructions[gateway] || "Payment completed successfully.";
}

function getGatewayCheckoutUrl(gateway, transactionId) {
  // Simulated checkout URLs for each gateway
  const checkoutUrls = {
    telebirr: `https://telebirr.simulated/checkout/${transactionId}`,
    chapa: `https://chapa.simulated/checkout/${transactionId}`,
    paypal: `https://paypal.simulated/checkout/${transactionId}`,
    cbe_birr: `https://cbe.simulated/checkout/${transactionId}`,
  };
  return checkoutUrls[gateway] || null;
}

async function initializePayment({
  gateway,
  amount,
  courseId,
  userId,
  payerName,
  payerPhone,
  payerReference,
}) {
  const selectedGateway = normalizeGateway(gateway);
  const gatewayCode = selectedGateway.toUpperCase();
  const transactionId = `${gatewayCode}-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;

  // For bank_transfer and cash, payment requires manual verification
  const requiresVerification = ["bank_transfer", "cash"].includes(selectedGateway);
  const status = requiresVerification ? "pending" : "completed";

  return {
    gateway: selectedGateway,
    transactionId,
    status,
    checkoutUrl: getGatewayCheckoutUrl(selectedGateway, transactionId),
    instructions: getGatewayInstructions(selectedGateway, amount),
    meta: {
      amount,
      courseId,
      userId,
      payerName: payerName || null,
      payerPhone: payerPhone || null,
      payerReference: payerReference || null,
      simulatedAt: new Date().toISOString(),
      requiresVerification,
    },
  };
}

module.exports = {
  initializePayment,
  normalizeGateway,
  gatewayLabel,
  getGatewayInstructions,
};
