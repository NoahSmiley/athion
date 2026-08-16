import { Resend } from "resend";

// No-op mail helper. If RESEND_API_KEY is the placeholder (or unset), we just
// log what would have been sent and return. Once you set a real key, emails
// actually go out — no other code change required.

const FROM = process.env.MAIL_FROM ?? "Athion <noreply@athion.me>";

type SendArgs = {
  to: string;
  subject: string;
  text: string;
};

export async function sendMail({ to, subject, text }: SendArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const placeholder = !key || key === "re_PLACEHOLDER";
  if (placeholder) {
    // eslint-disable-next-line no-console
    console.log(`[mail no-op] to=${to} subject=${subject}`);
    return;
  }
  try {
    const resend = new Resend(key);
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      text,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[mail] send failed:", e);
  }
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://athion.me";

export function passwordResetEmail(token: string) {
  const url = `${SITE}/reset-password?token=${encodeURIComponent(token)}`;
  return {
    subject: "Reset your Athion password",
    text:
      `Someone (probably you) asked to reset your Athion password.\n\n` +
      `Open this link to set a new password — it expires in 1 hour:\n${url}\n\n` +
      `If it wasn't you, you can ignore this email. Your password won't change unless you open the link.\n\n` +
      `— Athion`,
  };
}
