const nodemailer = require("nodemailer");

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (isConfigured) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : "",
      },
    });
  } else {
    // Development fallback mock transport
    console.warn("[EmailService] SMTP credentials not set. Emails will be logged to console.");
    transporter = {
      sendMail: async (options) => {
        console.log("------------------------------------------");
        console.log(`[Mock Email Sent]`);
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body:\n${options.text || options.html}`);
        console.log("------------------------------------------");
        return { messageId: "mock-message-id-" + Date.now() };
      },
    };
  }

  return transporter;
}

const DEFAULT_FROM = process.env.EMAIL_FROM || '"EduLearn Platform" <no-reply@edulearn.com>';

/**
 * Base email layout wrapper
 */
function emailTemplate({ title, body, actionButton }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; line-height: 1.6; font-size: 15px; }
          .btn { display: inline-block; padding: 12px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          .code-box { background: #f8fafc; border: 2px dashed #cbd5e1; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #2563eb; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>EduLearn</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            ${body}
            ${
              actionButton
                ? `<div style="text-align: center;"><a href="${actionButton.url}" class="btn" target="_blank">${actionButton.text}</a></div>`
                : ""
            }
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EduLearn Platform. All rights reserved.</p>
            <p>If you didn't request this email, you can safely ignore it.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// 1. Email Verification
async function sendVerificationEmail(toEmail, verificationToken, fullName = "Student") {
  const clientUrl = process.env.CORS_ORIGIN?.split(",")[0] || "https://e-learning-three-phi.vercel.app";
  const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

  const html = emailTemplate({
    title: "Verify Your Email Address",
    body: `
      <p>Hello ${fullName},</p>
      <p>Thank you for signing up for EduLearn! Please verify your email address to activate your account and start your courses.</p>
      <p>Click the button below to confirm your email:</p>
    `,
    actionButton: {
      text: "Verify Email Address",
      url: verifyUrl,
    },
  });

  return getTransporter().sendMail({
    from: DEFAULT_FROM,
    to: toEmail,
    subject: "EduLearn - Verify Your Email Address",
    html,
  });
}

// 2. Password Reset
async function sendPasswordResetEmail(toEmail, resetToken) {
  const clientUrl = process.env.CORS_ORIGIN?.split(",")[0] || "https://e-learning-three-phi.vercel.app";
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const html = emailTemplate({
    title: "Password Reset Request",
    body: `
      <p>Hello,</p>
      <p>We received a request to reset the password for your EduLearn account.</p>
      <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
    `,
    actionButton: {
      text: "Reset Password",
      url: resetUrl,
    },
  });

  return getTransporter().sendMail({
    from: DEFAULT_FROM,
    to: toEmail,
    subject: "EduLearn - Password Reset Instructions",
    html,
  });
}

// 3. Contact Form Submission
async function sendContactFormEmail({ name, email, subject, message }) {
  const adminEmail = process.env.ADMIN_CONTACT_EMAIL || process.env.SMTP_USER;

  const html = emailTemplate({
    title: "New Contact Message",
    body: `
      <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
      <p><strong>Subject:</strong> ${subject || "No subject"}</p>
      <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0;">
        ${message.replace(/\n/g, "<br>")}
      </div>
    `,
  });

  return getTransporter().sendMail({
    from: DEFAULT_FROM,
    to: adminEmail,
    replyTo: email,
    subject: `[Contact Form] ${subject || "New Message"} - from ${name}`,
    html,
  });
}

// 4. Notifications (Enrollment / Order / Certificate)
async function sendNotificationEmail({ to, subject, title, message, actionUrl, actionText }) {
  const html = emailTemplate({
    title,
    body: `<p>${message.replace(/\n/g, "<br>")}</p>`,
    actionButton: actionUrl && actionText ? { url: actionUrl, text: actionText } : null,
  });

  return getTransporter().sendMail({
    from: DEFAULT_FROM,
    to,
    subject,
    html,
  });
}

// 5. One-Time Password (OTP)
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

  return getTransporter().sendMail({
    from: DEFAULT_FROM,
    to: toEmail,
    subject: `EduLearn - Your Verification Code is ${otpCode}`,
    html,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactFormEmail,
  sendNotificationEmail,
  sendOtpEmail,
};

