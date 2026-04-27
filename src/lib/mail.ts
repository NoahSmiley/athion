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
    await resend.emails.send({ from: FROM, to, subject, text });
  } catch (e) {
    // Never let mail errors break the request — we want the user-visible action
    // (approval, message post) to succeed regardless of the side-channel.
    // eslint-disable-next-line no-console
    console.error("[mail] send failed:", e);
  }
}

// Templates — kept as pure functions so they're easy to tweak / preview.

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://athion.me";

export function applicationReceivedEmail(applicationId: string) {
  return {
    subject: "We got your application",
    text:
      `We received your application to Athion.\n\n` +
      `You can check its status anytime here:\n${SITE}/application/${applicationId}\n\n` +
      `Bookmark that page — it's how you'll see updates as we review.\n\n` +
      `Most applications get a response within 7 days.\n\n` +
      `— Athion`,
  };
}

export function applicationInReviewEmail(applicationId: string) {
  return {
    subject: "Your application is in review",
    text:
      `Your Athion application is now in review.\n\n` +
      `Track it here:\n${SITE}/application/${applicationId}\n\n` +
      `— Athion`,
  };
}

export function interviewScheduledEmail(applicationId: string, note: string | null, when: Date | null) {
  const lines = [
    "Your application has reached the interview stage.",
    "",
    note ? note : "",
    when ? `When: ${when.toLocaleString()}` : "",
    "",
    `Reply on your application page:`,
    `${SITE}/application/${applicationId}`,
    "",
    "— Athion",
  ].filter((l, i, a) => !(l === "" && a[i - 1] === ""));
  return {
    subject: "Interview scheduled",
    text: lines.join("\n"),
  };
}

export function newMessageEmail(applicationId: string, from: string, body: string) {
  const preview = body.length > 240 ? body.slice(0, 240) + "…" : body;
  return {
    subject: "New message about your application",
    text:
      `${from} replied on your Athion application:\n\n` +
      `> ${preview.replace(/\n/g, "\n> ")}\n\n` +
      `Read the full thread and reply:\n${SITE}/application/${applicationId}\n\n` +
      `— Athion`,
  };
}

export function approvedEmail(applicationId: string, code: string, expiresAt: Date) {
  return {
    subject: "You're in",
    text:
      `Welcome to Athion.\n\n` +
      `Your invite code:  ${code}\n` +
      `(Expires ${expiresAt.toLocaleDateString()}.)\n\n` +
      `Create your account here:\n${SITE}/signup?code=${encodeURIComponent(code)}\n\n` +
      `— Athion`,
  };
}

export function deniedEmail(applicationId: string, note: string | null) {
  const noteBlock = note ? `\n\n${note}\n\n` : "\n\n";
  return {
    subject: "Application decision",
    text:
      `Thanks for applying to Athion.\n\n` +
      `We're not able to offer you membership at this time.${noteBlock}` +
      `If anything changes you can apply again here:\n${SITE}/request-access\n\n` +
      `— Athion`,
  };
}
