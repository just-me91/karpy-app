import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;
const appUrl = process.env.APP_URL;

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!fromEmail) {
    throw new Error("Missing RESEND_FROM_EMAIL");
  }

  if (!appUrl) {
    throw new Error("Missing APP_URL");
  }

  const resend = new Resend(resendApiKey);
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Reset your KARPY password",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Reset your KARPY password</h2>
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
            Reset password
          </a>
        </p>
        <p>Or copy this link:</p>
        <p>${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
      </div>
    `,
  });
}