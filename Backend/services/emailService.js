const nodemailer = require("nodemailer");

// SMTP Configuration with production defaults
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true"; // true for 465, false for 587
const SMTP_USER = (process.env.SMTP_USER || "").trim();
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
const ADMIN_EMAIL = (process.env.ADMIN_CONTACT_EMAIL || SMTP_USER || "").trim();
const DEFAULT_FROM = process.env.EMAIL_FROM || (SMTP_USER ? `"EduLearn Platform" <${SMTP_USER}>` : '"EduLearn Platform" <no-reply@edulearn.com>');

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const hasCredentials = Boolean(SMTP_USER && SMTP_PASS);

  if (hasCredentials) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    // Fallback mock transport if no credentials configured anywhere
    console.warn("[EmailService] No SMTP credentials available. Emails will be logged to console.");
    transporter = {
      sendMail: async (options) => {
        console.log("------------------------------------------");
        console.log(`[Mock Email Sent] To: ${options.to} | Subject: ${options.subject}`);
        console.log("------------------------------------------");
        return { messageId: "mock-message-id-" + Date.now() };
      },
    };
  }

  return transporter;
}

/**
 * Verify SMTP transport connection
 */
async function verifyConnection() {
  try {
    const t = getTransporter();
    if (t && typeof t.verify === "function") {
      const verifyPromise = t.verify();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Direct SMTP socket timed out")), 3000)
      );
      await Promise.race([verifyPromise, timeoutPromise]);
      console.log(`[EmailService] Direct SMTP verified successfully (Sender: ${SMTP_USER}, Admin: ${ADMIN_EMAIL})`);
      return true;
    }
    return false;
  } catch (error) {
    console.warn(`[EmailService] Direct SMTP socket notice: ${error.message} (Will use HTTPS Vercel Relay in cloud).`);
    return false;
  }
}

function getClientUrl() {
  const originEnv = process.env.CORS_ORIGIN || "https://e-learning-three-phi.vercel.app";
  const origins = originEnv.split(",").map((o) => o.trim().replace(/\/+$/, "")).filter(Boolean);
  const prodOrigin = origins.find((o) => !o.includes("localhost") && !o.includes("127.0.0.1"));
  return prodOrigin || origins[0] || "https://e-learning-three-phi.vercel.app";
}

/**
 * Base email layout wrapper
 */
function emailTemplate({ title, body, actionButton }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 32px 28px; line-height: 1.65; font-size: 15px; color: #334155; }
          .content h2 { margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 700; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; padding: 13px 32px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25); }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
          .info-row:last-child { border-bottom: none; }
          .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer a { color: #2563eb; text-decoration: none; }
          .code-box { background: #f8fafc; border: 2px dashed #93c5fd; padding: 16px; text-align: center; font-size: 30px; letter-spacing: 6px; font-weight: bold; color: #1d4ed8; margin: 24px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>EduLearn</h1>
            <p>Empowering Your Learning Journey</p>
          </div>
          <div class="content">
            <h2>${title}</h2>
            ${body}
            ${
              actionButton
                ? `<div class="btn-container"><a href="${actionButton.url}" class="btn" target="_blank">${actionButton.text}</a></div>`
                : ""
            }
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EduLearn Platform. All rights reserved.</p>
            <p>Questions? Contact us at <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Detect test, dummy, or invalid domains that would fail or bounce in Gmail/SMTP
 */
function isTestOrDummyEmail(email) {
  if (!email || typeof email !== "string") return true;
  const clean = email.trim().toLowerCase();
  if (
    clean.endsWith(".test") ||
    clean.endsWith(".example") ||
    clean.endsWith(".invalid") ||
    clean.endsWith(".localhost") ||
    clean.includes("edulearn.test") ||
    clean.includes("example.com") ||
    clean.includes("test.com") ||
    clean.startsWith("tester@") ||
    clean.startsWith("qa-student") ||
    clean.includes("@test.")
  ) {
    return true;
  }
  return false;
}

async function safeSend(mailOptions) {
  // Prevent sending real emails during test runs or to dummy test addresses (stops Gmail bounce loops)
  if (
    process.env.NODE_ENV === "test" ||
    process.env.DISABLE_EMAIL === "true" ||
    isTestOrDummyEmail(mailOptions.to)
  ) {
    console.log(
      `[EmailService] Simulated delivery to: ${mailOptions.to} (${mailOptions.subject}) — suppressed real SMTP to prevent bounces.`
    );
    return { success: true, messageId: "simulated-test-" + Date.now(), simulated: true };
  }

  const clientUrl = getClientUrl();
  const vercelRelayUrl = `${clientUrl}/api/send-email`;

  // 1. Try sending via Vercel HTTPS Relay (bypasses cloud host outbound SMTP port blocks)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const relayResponse = await fetch(vercelRelayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text,
        replyTo: mailOptions.replyTo,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (relayResponse.ok) {
      const data = await relayResponse.json();
      if (data && data.success) {
        console.log(`[EmailService] SUCCESS via Vercel Relay to ${mailOptions.to} (${mailOptions.subject}) - ID: ${data.messageId}`);
        return { success: true, messageId: data.messageId };
      }
    }
  } catch (relayErr) {
    console.warn(`[EmailService] Vercel relay notice: ${relayErr.message}. Attempting direct SMTP...`);
  }

  // 2. Direct SMTP fallback (used locally or if relay is not reachable)
  try {
    const t = getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`[EmailService] SUCCESS via direct SMTP to ${mailOptions.to} (${mailOptions.subject}) - ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] ERROR: Failed sending to ${mailOptions.to} (${mailOptions.subject}):`, error.message);
    return { success: false, error: error.message };
  }
}

// 1. Welcome Email for New Student Registration
async function sendWelcomeEmail(toEmail, fullName = "Student", verificationToken = null) {
  const clientUrl = getClientUrl();
  const verifyUrl = verificationToken ? `${clientUrl}/verify-email?token=${verificationToken}` : `${clientUrl}/dashboard`;

  const html = emailTemplate({
    title: `Welcome to EduLearn, ${fullName}! 🎓`,
    body: `
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>Thank you for creating an account with <strong>EduLearn</strong>! We are excited to support your learning goals.</p>
      <div class="info-card">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e3a8a;">Here is how to get started:</p>
        <ul style="margin: 0; padding-left: 20px; color: #475569;">
          <li>Explore our comprehensive library of top courses.</li>
          <li>Enroll in free or premium courses tailored to your interests.</li>
          <li>Track your step-by-step progress and earn verified certificates.</li>
        </ul>
      </div>
      <p>Click below to verify your email address and jump into your learning dashboard:</p>
    `,
    actionButton: {
      text: verificationToken ? "Verify Email & Start Learning" : "Go to Dashboard",
      url: verifyUrl,
    },
  });

  return safeSend({
    from: DEFAULT_FROM,
    to: toEmail,
    subject: "🎓 Welcome to EduLearn - Verify Your Email & Start Learning",
    html,
  });
}

// 2. Admin Alert: New Student / Instructor Registration
async function sendAdminNewStudentEmail({ studentName, studentEmail, role = "student", registeredAt = new Date(), details = null }) {
  // Only notify admin for teacher applications or if explicitly enabled, preventing student signup inbox clutter
  if (role !== "teacher" && process.env.NOTIFY_ADMIN_ON_REGISTRATION !== "true") {
    console.log(`[EmailService] Admin registration alert skipped (NOTIFY_ADMIN_ON_REGISTRATION is not true).`);
    return { success: true, skipped: true };
  }

  const clientUrl = getClientUrl();
  const roleLabel = role === "teacher" ? "Instructor Application" : "Student";

  const html = emailTemplate({
    title: `🔔 New ${roleLabel} Registered`,
    body: `
      <p>A new user has just registered on the EduLearn platform:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; font-weight: 600; color: #64748b; width: 140px;">Full Name:</td>
          <td style="padding: 8px 0; color: #0f172a;">${studentName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Email Address:</td>
          <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${studentEmail}">${studentEmail}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Account Role:</td>
          <td style="padding: 8px 0; color: #0f172a;"><span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; font-size: 12px;">${role}</span></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Registered At:</td>
          <td style="padding: 8px 0; color: #0f172a;">${new Date(registeredAt).toLocaleString()}</td>
        </tr>
        ${
          details
            ? `<tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Additional Info:</td>
                <td style="padding: 8px 0; color: #0f172a;">${details}</td>
              </tr>`
            : ""
        }
      </table>
      <p>You can review and manage this user in the Admin Dashboard.</p>
    `,
    actionButton: {
      text: "View Admin Dashboard",
      url: `${clientUrl}/dashboard/admin`,
    },
  });

  return safeSend({
    from: DEFAULT_FROM,
    to: ADMIN_EMAIL,
    subject: `[Admin Alert] New ${roleLabel}: ${studentName} (${studentEmail})`,
    html,
  });
}

// 3. Email Verification Email
async function sendVerificationEmail(toEmail, verificationToken, fullName = "Student") {
  const clientUrl = getClientUrl();
  const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

  const html = emailTemplate({
    title: "Verify Your Email Address",
    body: `
      <p>Hello ${fullName},</p>
      <p>Thank you for signing up for EduLearn! Please verify your email address to confirm your account and get access to all features.</p>
      <p>Click the button below to confirm your email:</p>
    `,
    actionButton: {
      text: "Verify Email Address",
      url: verifyUrl,
    },
  });

  return safeSend({
    from: DEFAULT_FROM,
    to: toEmail,
    subject: "EduLearn - Verify Your Email Address",
    html,
  });
}

// 4. Password Reset Email
async function sendPasswordResetEmail(toEmail, resetToken, fullName = "Student") {
  const clientUrl = getClientUrl();
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const html = emailTemplate({
    title: "Reset Your Password 🔐",
    body: `
      <p>Hello ${fullName},</p>
      <p>We received a request to reset the password for your EduLearn account associated with <strong>${toEmail}</strong>.</p>
      <p>Click the button below to set a new password. For security reasons, this link will expire in <strong>1 hour</strong>.</p>
      <p style="color: #64748b; font-size: 13px;">If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>
    `,
    actionButton: {
      text: "Reset Password",
      url: resetUrl,
    },
  });

  return safeSend({
    from: DEFAULT_FROM,
    to: toEmail,
    subject: "EduLearn - Password Reset Instructions",
    html,
  });
}

// 5. New Course Enrollment Confirmation
async function sendEnrollmentEmail({ studentEmail, studentName = "Student", courseTitle, courseId, amount = 0, isFree = true }) {
  const clientUrl = getClientUrl();
  const courseUrl = `${clientUrl}/courses/${courseId}/dashboard`;

  const html = emailTemplate({
    title: "Enrollment Confirmed! 🎉",
    body: `
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>Congratulations! You have successfully enrolled in:</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <h3 style="margin: 0 0 6px 0; color: #166534; font-size: 18px;">${courseTitle}</h3>
        <p style="margin: 0; color: #15803d; font-size: 14px;">
          <strong>Access:</strong> Lifetime &bull; 
          <strong>Price:</strong> ${isFree ? "Free Course" : `$${Number(amount).toFixed(2)}`} &bull; 
          <strong>Date:</strong> ${new Date().toLocaleDateString()}
        </p>
      </div>
      <p>Your interactive learning dashboard and step-by-step curriculum are now unlocked. Start learning right away!</p>
    `,
    actionButton: {
      text: "Start Course Now →",
      url: courseUrl,
    },
  });

  return safeSend({
    from: DEFAULT_FROM,
    to: studentEmail,
    subject: `🎉 Enrollment Confirmed: ${courseTitle}`,
    html,
  });
}

// 6. Admin Alert: New Course Enrollment
async function sendAdminEnrollmentAlert({
  studentEmail,
  studentName = "Student",
  courseTitle,
  courseId,
  amount = 0,
  isFree = true,
  enrollmentType = "free",
}) {
  if (process.env.NOTIFY_ADMIN_ON_ENROLLMENT !== "true") {
    console.log(`[EmailService] Admin enrollment alert skipped (NOTIFY_ADMIN_ON_ENROLLMENT is not true).`);
    return { success: true, skipped: true };
  }

  const clientUrl = getClientUrl();
  const html = emailTemplate({
    title: "🔔 New Course Enrollment",
    body: `
      <p>A student has just enrolled in a course on the EduLearn platform:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; font-weight: 600; color: #64748b; width: 140px;">Student Name:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${studentName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Student Email:</td>
          <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${studentEmail}">${studentEmail}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Course Title:</td>
          <td style="padding: 8px 0; color: #1d4ed8; font-weight: 600;">${courseTitle} (ID: ${courseId})</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Enrollment Type:</td>
          <td style="padding: 8px 0; color: #0f172a;">
            <span style="background: ${isFree ? "#dcfce7" : "#dbeafe"}; color: ${isFree ? "#15803d" : "#1e40af"}; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">
              ${isFree ? "Free Course" : `$${Number(amount).toFixed(2)} (${enrollmentType})`}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Enrolled At:</td>
          <td style="padding: 8px 0; color: #0f172a;">${new Date().toLocaleString()}</td>
        </tr>
      </table>
      <p>You can view student progress and enrollment records in your Admin Dashboard.</p>
    `,
    actionButton: {
      text: "View Admin Dashboard",
      url: `${clientUrl}/dashboard/admin`,
    },
  });

  return safeSend({
    from: DEFAULT_FROM,
    to: ADMIN_EMAIL,
    subject: `[Admin Alert] New Enrollment: ${studentName} enrolled in "${courseTitle}"`,
    html,
  });
}

// 7. Contact Form: Deliver to Admin
async function sendContactFormEmail({ name, email, subject, message }) {
  const senderName = (name || "Website Visitor").trim();
  const senderEmail = (email || "no-reply@edulearn.com").trim();
  const subjectLine = subject ? subject.trim() : "General Inquiry";

  // Display visitor name prominently in From header so Gmail does NOT display "me" or "EduLearn Platform"
  const fromHeader = SMTP_USER
    ? `"${senderName} (via EduLearn)" <${SMTP_USER}>`
    : DEFAULT_FROM;

  const html = emailTemplate({
    title: `📩 New Message from ${senderName}`,
    body: `
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1e40af;">
          🌐 Message Origin: EduLearn Website Contact Form
        </p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #3b82f6;">
          A visitor submitted this message through the contact form at <a href="https://e-learning-three-phi.vercel.app/contact" style="color: #1d4ed8; text-decoration: underline;">edulearn/contact</a>.
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 140px;">Sender Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 700; font-size: 15px;">${senderName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Sender Email:</td>
          <td style="padding: 10px 0; color: #2563eb; font-weight: 600;">
            <a href="mailto:${senderEmail}" style="color: #2563eb; text-decoration: none;">${senderEmail}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Subject:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${subjectLine}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Received At:</td>
          <td style="padding: 10px 0; color: #0f172a;">${new Date().toLocaleString()}</td>
        </tr>
      </table>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; padding: 18px; margin: 20px 0; border-radius: 6px; font-size: 15px; color: #1e293b; line-height: 1.6;">
        <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #059669; margin-bottom: 8px;">Visitor's Message:</div>
        ${message.replace(/\n/g, "<br>")}
      </div>

      <div style="margin-top: 24px; padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 13px; color: #166534;">
        💬 <strong>How to Reply:</strong> Click <strong>Reply</strong> in your email client. Your response will go directly to <strong>${senderName}</strong> (<a href="mailto:${senderEmail}" style="color: #166534; font-weight: bold;">${senderEmail}</a>).
      </div>
    `,
  });

  return safeSend({
    from: fromHeader,
    to: ADMIN_EMAIL,
    replyTo: `"${senderName}" <${senderEmail}>`,
    subject: `📩 [Website Message] from ${senderName} (${senderEmail}): ${subjectLine}`,
    html,
  });
}

// 7. Contact Form: Auto-Acknowledgment to Visitor
async function sendContactAcknowledgmentEmail({ name, email, subject }) {
  if (isTestOrDummyEmail(email)) {
    console.log(`[EmailService] Visitor acknowledgment skipped for dummy/test email: ${email}`);
    return { success: true, messageId: "simulated-visitor-ack" };
  }
  const html = emailTemplate({
    title: "Thank You for Contacting EduLearn!",
    body: `
      <p>Hello ${name},</p>
      <p>Thank you for reaching out to us. We have received your message regarding <strong>${subject || "your inquiry"}</strong>.</p>
      <div class="info-card">
        <p style="margin: 0; color: #334155;">
          Our support team is reviewing your message and will respond as quickly as possible, typically within 24 hours.
        </p>
      </div>
      <p>If you have urgent questions, feel free to review our courses and Help Center in the meantime.</p>
    `,
  });

  return safeSend({
    from: DEFAULT_FROM,
    to: email,
    subject: "EduLearn - We Received Your Message",
    html,
  });
}

// 8. General Notification
async function sendNotificationEmail({ to, subject, title, message, actionUrl, actionText }) {
  const html = emailTemplate({
    title,
    body: `<p>${message.replace(/\n/g, "<br>")}</p>`,
    actionButton: actionUrl && actionText ? { url: actionUrl, text: actionText } : null,
  });

  return safeSend({
    from: DEFAULT_FROM,
    to,
    subject,
    html,
  });
}

// 9. OTP Code
async function sendOtpEmail(toEmail, otpCode) {
  const html = emailTemplate({
    title: "Your One-Time Verification Code",
    body: `
      <p>Hello,</p>
      <p>Use the 6-digit verification code below to complete your authentication request:</p>
      <div class="code-box">${otpCode}</div>
      <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. For your security, do not share this code with anyone.</p>
    `,
  });

  return safeSend({
    from: DEFAULT_FROM,
    to: toEmail,
    subject: `EduLearn - Your Verification Code is ${otpCode}`,
    html,
  });
}

module.exports = {
  verifyConnection,
  sendWelcomeEmail,
  sendAdminNewStudentEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEnrollmentEmail,
  sendAdminEnrollmentAlert,
  sendContactFormEmail,
  sendContactAcknowledgmentEmail,
  sendNotificationEmail,
  sendOtpEmail,
};
