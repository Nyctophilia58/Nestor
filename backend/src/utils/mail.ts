import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@nestor.com";

// Validate SMTP configuration
const isConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS;

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      // Add timeout and keep-alive for better reliability
      // pool: true,
      // maxConnections: 1,
      // maxMessages: 5,
      debug: true, // Log debug info to console
      logger: true, // Log SMTP transactions
      connectionTimeout: 30000, // 30 second timeout
      greetingTimeout: 30000,
      socketTimeout: 30000,
    })
  : null;

// Log configuration status on load
console.log("[SMTP Config]", {
  configured: isConfigured ? "YES" : "NO",
  host: SMTP_HOST || "Not set",
  port: SMTP_PORT,
  user: SMTP_USER || "Not set",
  from: FROM_EMAIL,
  passSet: SMTP_PASS ? "YES" : "NO",
});

export async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.log(
      `[Email not sent — SMTP not configured]\n  To: ${to}\n  Subject: ${subject}\n  FROM_EMAIL: ${FROM_EMAIL}\n  SMTP_USER: ${SMTP_USER || "Not set"}\n  SMTP_HOST: ${SMTP_HOST || "Not set"}\n  `,
    );
    return;
  }

  console.log(
    `[Email being sent]\n  To: ${to}\n  Subject: ${subject}\n  FROM_EMAIL: ${FROM_EMAIL}\n  SMTP_USER: ${SMTP_USER}`,
  );

  try {
    const result = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log("[Email sent successfully]", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = "Reset your Nestor password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Password Reset</h1>
      <p style="color: #666; line-height: 1.6;">You requested to reset your Nestor password. Click the button below to set a new one.</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #999; font-size: 14px;">Or copy and paste this link:</p>
      <p style="color: #666; background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
      <p style="color: #999; font-size: 14px; margin-top: 30px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  return await sendMail(email, subject, html);
}

export async function sendVerificationEmail(email: string, otp: string) {
  const subject = "Verify your Nestor email";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Email Verification</h1>
      <p style="color: #666; line-height: 1.6;">Your verification code is:</p>
      <div style="margin: 30px 0; text-align: center;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10b981;">${otp}</span>
      </div>
      <p style="color: #666; line-height: 1.6;">Enter this code in Nestor to verify your email address.</p>
      <p style="color: #999; font-size: 14px; margin-top: 30px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  return await sendMail(email, subject, html);
}
