import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = (process.env.SMTP_USER || "").trim();
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
const ADMIN_EMAIL = (process.env.ADMIN_CONTACT_EMAIL || SMTP_USER || "").trim();
const EMAIL_FROM = process.env.EMAIL_FROM || (SMTP_USER ? `"EduLearn Platform" <${SMTP_USER}>` : '"EduLearn Platform" <no-reply@edulearn.com>');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in Vercel environment variables.");
  }

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

  return transporter;
}

/**
 * Filter out dummy/test email domains that bounce in real SMTP
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

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  const body = req.body || {};
  const { to, subject, html, text, replyTo, name, email, message } = body;

  try {
    const t = getTransporter();

    // Case 1: Direct Contact Form submission
    if (name && message && !to) {
      const senderName = String(name).trim();
      const senderEmail = (email || "no-reply@edulearn.com").trim();
      const subjectLine = subject ? String(subject).trim() : `New Inquiry from ${senderName}`;

      if (isTestOrDummyEmail(senderEmail)) {
        console.log(`[Vercel Relay] Simulated contact form submission from test email: ${senderEmail}`);
        return res.status(200).json({
          success: true,
          message: "Message processed (test email simulation)",
          messageId: "simulated-test-" + Date.now(),
        });
      }

      // Display visitor name in From header so Gmail does NOT display "me" or "EduLearn Platform"
      const fromHeader = SMTP_USER ? `"${senderName} (via EduLearn)" <${SMTP_USER}>` : EMAIL_FROM;

      // 1. Deliver to Admin
      const adminMail = await t.sendMail({
        from: fromHeader,
        to: ADMIN_EMAIL,
        replyTo: `"${senderName}" <${senderEmail}>`,
        subject: `📩 [Website Message] from ${senderName} (${senderEmail}): ${subjectLine}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 24px; color: white;">
              <h2 style="margin: 0; font-size: 20px;">📩 New Message from Website Visitor</h2>
              <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Received via EduLearn Contact Form</p>
            </div>
            <div style="padding: 24px;">
              <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #1e40af; font-weight: 600;">
                  🌐 Message Source: EduLearn Website Contact Form
                </p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #3b82f6;">
                  A visitor submitted this message from the contact page (<a href="https://e-learning-three-phi.vercel.app/contact" style="color: #1d4ed8;">edulearn/contact</a>).
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 130px;">Visitor Name:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: bold; font-size: 15px;">${senderName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Visitor Email:</td>
                  <td style="padding: 8px 0; color: #2563eb;"><a href="mailto:${senderEmail}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${senderEmail}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Subject / Topic:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${subjectLine}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Date & Time:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${new Date().toLocaleString()}</td>
                </tr>
              </table>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; padding: 18px; margin: 16px 0; border-radius: 6px; font-size: 15px; line-height: 1.6; color: #1e293b;">
                <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #059669; margin-bottom: 8px;">Visitor's Message:</div>
                ${String(message).replace(/\n/g, "<br>")}
              </div>

              <div style="margin-top: 24px; padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 13px; color: #166534;">
                💬 <strong>How to Reply:</strong> Click <strong>Reply</strong> in your email app. Your response will go directly to <strong>${senderName}</strong> (<a href="mailto:${senderEmail}" style="color: #166534; font-weight: bold;">${senderEmail}</a>).
              </div>
            </div>
          </div>
        `,
      });

      // 2. Deliver Acknowledgment to Visitor if email is provided and not test domain
      if (senderEmail && senderEmail.includes("@") && !isTestOrDummyEmail(senderEmail)) {
        await t.sendMail({
          from: EMAIL_FROM,
          to: senderEmail,
          subject: "EduLearn - We Received Your Message",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 24px; color: white;">
                <h2 style="margin: 0; font-size: 20px;">Thank You for Reaching Out!</h2>
              </div>
              <div style="padding: 24px;">
                <p>Hello <strong>${senderName}</strong>,</p>
                <p>We have successfully received your message regarding <strong>${subjectLine}</strong>.</p>
                <p>Our support team will review your inquiry and respond to you as soon as possible, usually within 24 hours.</p>
                <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Best regards,<br>The EduLearn Team</p>
              </div>
            </div>
          `,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Message sent successfully",
        messageId: adminMail.messageId,
      });
    }

    // Case 2: Relay message (e.g. from Backend for registration/enrollment notifications)
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: 'to', 'subject', and 'html' or 'text'",
      });
    }

    if (isTestOrDummyEmail(to)) {
      console.log(`[Vercel Relay] Suppressed relay to dummy/test address: ${to}`);
      return res.status(200).json({ success: true, messageId: "simulated-test-" + Date.now(), simulated: true });
    }

    const info = await t.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
      replyTo: replyTo || undefined,
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("[Vercel Relay] Error sending email:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
