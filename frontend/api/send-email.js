import nodemailer from "nodemailer";

const SMTP_USER = (process.env.SMTP_USER || "admin@edulearn.com").trim();
const SMTP_PASS = (process.env.SMTP_PASS || "your_app_password").replace(/\s+/g, "");
const ADMIN_EMAIL = (process.env.ADMIN_CONTACT_EMAIL || SMTP_USER || "admin@edulearn.com").trim();

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS via port 587 (supported by Vercel serverless)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
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
      const senderEmail = email || "no-reply@edulearn.com";
      const subjectLine = subject || `New Inquiry from ${name}`;

      // 1. Deliver to Admin
      const adminMail = await t.sendMail({
        from: `"EduLearn Contact Form" <${SMTP_USER}>`,
        to: ADMIN_EMAIL,
        replyTo: senderEmail,
        subject: `📩 [Contact Form] ${subjectLine}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 24px; color: white;">
              <h2 style="margin: 0; font-size: 20px;">EduLearn - New Contact Message</h2>
              <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Received from website visitor</p>
            </div>
            <div style="padding: 24px;">
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
              <p><strong>Subject:</strong> ${subjectLine}</p>
              <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 16px 0; border-radius: 4px; font-size: 14px; line-height: 1.6;">
                ${String(message).replace(/\n/g, "<br>")}
              </div>
              <p style="color: #64748b; font-size: 12px;">You can directly reply to this email to contact ${name}.</p>
            </div>
          </div>
        `,
      });

      // 2. Deliver Acknowledgment to Visitor if email is provided
      if (email && email.includes("@")) {
        await t.sendMail({
          from: `"EduLearn Support" <${SMTP_USER}>`,
          to: email,
          subject: "EduLearn - We Received Your Message",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 24px; color: white;">
                <h2 style="margin: 0; font-size: 20px;">Thank You for Reaching Out!</h2>
              </div>
              <div style="padding: 24px;">
                <p>Hello <strong>${name}</strong>,</p>
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

    const info = await t.sendMail({
      from: `"EduLearn Platform" <${SMTP_USER}>`,
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
      replyTo: replyTo || undefined,
    });

    console.log(`[Vercel Relay] Dispatched email to ${to}: ${info.messageId}`);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("[Vercel Relay] Error sending email:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

