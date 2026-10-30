import nodemailer from 'nodemailer';

type ContactEmail = {
  name: string;
  email: string;
  message: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** True when the SMTP settings are in the environment. */
export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Emails a new contact-form message to the portfolio owner.
 * Does nothing when SMTP isn't configured. Throws if sending fails, so the
 * caller decides whether that matters (the contact route just logs it).
 */
export async function sendContactNotification({ name: rawName, email, message }: ContactEmail): Promise<void> {
  if (!isMailConfigured()) return;

  // One line only, so a crafted name can't inject extra mail headers
  const name = rawName.replace(/[\r\n]+/g, ' ');

  const port = Number(process.env.SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 is implicit TLS; 587 upgrades with STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const to = process.env.CONTACT_TO || process.env.SMTP_USER!;

  await transporter.sendMail({
    from: `"Portfolio contact form" <${from}>`,
    to,
    replyTo: `"${name.replace(/"/g, '')}" <${email}>`, // hitting Reply goes straight to the visitor
    subject: `New message from ${name}`,
    text: `${name} <${email}> sent you a message:\n\n${message}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1b1b1b">
        <h2 style="margin:0 0 4px">New message from your portfolio</h2>
        <p style="margin:0 0 16px;color:#666">
          <strong>${escapeHtml(name)}</strong> &lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;
        </p>
        <div style="padding:16px;background:#f4f1fb;border-left:4px solid #a855f7;border-radius:6px;white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</div>
        <p style="margin:16px 0 0;font-size:12px;color:#888">Reply to this email to answer ${escapeHtml(name)} directly.</p>
      </div>`,
  });
}
