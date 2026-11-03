/**
 * Chapa Payment Gateway Service
 * Handles ETB payments via Telebirr, CBE Birr, Awash, and local cards
 * Supports both Chapa Global (api.chapa.global) and classic (api.chapa.co)
 */

const CHAPA_BASE_URL = (process.env.CHAPA_BASE_URL || "https://api.chapa.global").replace(/\/+$/, "");
const CHAPA_SECRET_KEY = (process.env.CHAPA_SECRET_KEY || "").trim();

function isChapaConfigured() {
  return Boolean(CHAPA_SECRET_KEY);
}

let txCounter = 0;

/**
 * Generate a valid Chapa transaction reference (strictly <= 20 characters)
 * Combines high-resolution timestamp with atomic sequence to prevent millisecond collisions
 */
function generateTxRef(prefix = "edl") {
  txCounter = (txCounter + 1) % 10000;
  const time = Date.now().toString().slice(-8);
  const seq = txCounter.toString().padStart(4, "0");
  return `${prefix}-${time}${seq}`;
}

/**
 * Initialize a hosted transaction on Chapa
 */
async function initializeTransaction({
  amount,
  currency = "ETB",
  email,
  firstName = "Student",
  lastName = "User",
  phoneNumber,
  txRef,
  returnUrl,
  callbackUrl,
  title = "EduLearn Course Payment",
  description = "Course Enrollment Fee",
}) {
  if (!isChapaConfigured()) {
    throw new Error("Chapa payment gateway is not configured. Missing CHAPA_SECRET_KEY.");
  }

  const reference = txRef || generateTxRef();

  // Chapa requires amount to be a whole number in ETB (no decimal cents)
  const integerAmount = Math.round(Number(amount));
  if (isNaN(integerAmount) || integerAmount <= 0) {
    throw new Error("Invalid payment amount");
  }

  const payload = {
    amount: String(integerAmount),
    currency: currency.toUpperCase(),
    email: email || "student@edulearn.com",
    first_name: firstName || "Student",
    last_name: lastName || "User",
    tx_ref: reference,
    return_url: returnUrl,
    callback_url: callbackUrl || undefined,
    "customization[title]": title,
    "customization[description]": description,
    meta: {
      hide_receipt: "true",
    },
    "meta[hide_receipt]": "true",
  };

  if (phoneNumber && String(phoneNumber).trim().length >= 9) {
    payload.phone_number = String(phoneNumber).trim();
  }

  const response = await fetch(`${CHAPA_BASE_URL}/v1/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    const errorMsg = data.message || `Chapa initialization failed with status ${response.status}`;
    console.error("[Chapa Service] Init Error:", errorMsg, data);
    throw new Error(errorMsg);
  }

  return {
    success: true,
    txRef: reference,
    checkoutUrl: data.data.checkout_url,
    message: data.message,
  };
}

/**
 * Verify a transaction status on Chapa
 */
async function verifyTransaction(txRef) {
  if (!isChapaConfigured()) {
    throw new Error("Chapa payment gateway is not configured. Missing CHAPA_SECRET_KEY.");
  }

  const response = await fetch(`${CHAPA_BASE_URL}/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    return {
      success: false,
      message: data.message || "Verification failed",
      data: data.data || null,
    };
  }

  return {
    success: true,
    txRef,
    amount: data.data?.amount,
    currency: data.data?.currency,
    paymentMethod: data.data?.payment_method || "chapa",
    status: data.data?.status,
    customer: data.data?.customer,
    raw: data.data,
  };
}

module.exports = {
  isChapaConfigured,
  generateTxRef,
  initializeTransaction,
  verifyTransaction,
};

