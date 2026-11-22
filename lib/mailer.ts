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

function createTransporter() {
  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 is implicit TLS; 587 upgrades with STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
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

  const transporter = createTransporter();

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const to = process.env.CONTACT_TO || process.env.SMTP_USER!;

  await transporter.sendMail({
    from: `"Portfolio contact form" <${from}>`,
    to,
    replyTo: `"${name.replace(/"/g, '')}" <${email}>`, // hitting Reply goes straight to the visitor
    subject: `New message from ${name}`,
    text: `New message from your portfolio\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\nReply to this email to answer ${name} directly.`,
    html: `
      <div style="background:#f5f3fa;padding:32px 16px;font-family:-apple-system,'Segoe UI',Arial,sans-serif">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e7e1f5">
          <tr>
            <td style="background:#1b0845;padding:20px 28px">
              <p style="margin:0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#c084fc">Portfolio contact form</p>
              <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;color:#ffffff">You have a new message</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 18px">
                    <p style="margin:0 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8b83a3">Name</p>
                    <p style="margin:0;font-size:16px;color:#1b1b1b">${escapeHtml(name)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px">
                    <p style="margin:0 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8b83a3">Email</p>
                    <p style="margin:0;font-size:16px"><a href="mailto:${escapeHtml(email)}" style="color:#7c3aed;text-decoration:none">${escapeHtml(email)}</a></p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8b83a3">Message</p>
                    <div style="padding:16px 18px;background:#f7f4fd;border-left:4px solid #a855f7;border-radius:8px;font-size:15px;line-height:1.65;color:#1b1b1b;white-space:pre-wrap">${escapeHtml(message)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 26px">
              <a href="mailto:${escapeHtml(email)}" style="display:inline-block;padding:11px 22px;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px">Reply to ${escapeHtml(name)}</a>
              <p style="margin:14px 0 0;font-size:12px;color:#8b83a3">Or just hit Reply on this email. It goes straight to them.</p>
            </td>
          </tr>
        </table>
      </div>`,
  });
}

/**
 * Sends the visitor an automatic "got your message" confirmation from a no-reply
 * address. Replies are routed to the owner's inbox via Reply-To.
 * Does nothing when SMTP isn't configured. Throws if sending fails.
 */
export async function sendVisitorConfirmation({ name: rawName, email, message }: ContactEmail): Promise<void> {
  if (!isMailConfigured()) return;

  const name = rawName.replace(/[\r\n]+/g, ' ');
  const firstName = name.split(' ')[0] || name;

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const domain = fromAddress.split('@')[1];
  // Must be on the domain verified with the mail provider
  const noReply = process.env.AUTOREPLY_FROM || (domain ? `noreply@${domain}` : fromAddress);
  const replyTo = process.env.CONTACT_TO || fromAddress;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Hannan Khan" <${noReply}>`,
    to: email,
    replyTo,
    subject: 'Thanks for reaching out, I got your message',
    text: `Hi ${firstName},\n\nThanks for reaching out! I've received your message and will get back to you as soon as I can.\n\nYour message:\n${message}\n\nHannan Khan\n\nThis is an automatic confirmation. If you'd like to add anything, just reply to this email.`,
    html: `
      <div style="background:#f5f3fa;padding:32px 16px;font-family:-apple-system,'Segoe UI',Arial,sans-serif">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e7e1f5">
          <tr>
            <td style="background:#1b0845;padding:20px 28px">
              <p style="margin:0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#c084fc">Hannan Khan</p>
              <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;color:#ffffff">Message received</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px">
              <p style="margin:0 0 14px;font-size:16px;color:#1b1b1b">Hi ${escapeHtml(firstName)},</p>
              <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#1b1b1b">
                Thanks for reaching out! I&apos;ve received your message and will get back to you as soon as I can.
              </p>
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8b83a3">Your message</p>
              <div style="padding:16px 18px;background:#f7f4fd;border-left:4px solid #a855f7;border-radius:8px;font-size:15px;line-height:1.65;color:#1b1b1b;white-space:pre-wrap">${escapeHtml(message)}</div>
              <p style="margin:24px 0 0;font-size:16px;color:#1b1b1b">Talk soon,<br /><strong>Hannan Khan</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 26px">
              <p style="margin:0;font-size:12px;color:#8b83a3">This is an automatic confirmation. If you&apos;d like to add anything, just reply to this email.</p>
            </td>
          </tr>
        </table>
      </div>`,
  });
}
