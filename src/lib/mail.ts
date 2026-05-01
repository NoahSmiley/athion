import { Resend } from "resend";
import { buildIcs } from "./calendar";

// No-op mail helper. If RESEND_API_KEY is the placeholder (or unset), we just
// log what would have been sent and return. Once you set a real key, emails
// actually go out — no other code change required.

const FROM = process.env.MAIL_FROM ?? "Athion <noreply@athion.me>";

type Attachment = { filename: string; content: string; contentType?: string };

type SendArgs = {
  to: string;
  subject: string;
  text: string;
  attachments?: Attachment[];
};

export async function sendMail({ to, subject, text, attachments }: SendArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const placeholder = !key || key === "re_PLACEHOLDER";
  if (placeholder) {
    const attachInfo = attachments?.length ? ` (with ${attachments.length} attachment${attachments.length === 1 ? "" : "s"})` : "";
    // eslint-disable-next-line no-console
    console.log(`[mail no-op] to=${to} subject=${subject}${attachInfo}`);
    return;
  }
  try {
    const resend = new Resend(key);
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      text,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, "utf8").toString("base64"),
        contentType: a.contentType,
      })),
    });
  } catch (e) {
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
  const interviewUrl = `${SITE}/application/${applicationId}/interview`;
  const lines: string[] = [
    "You've been invited to an interview with Athion.",
    "",
    when
      ? `When:  ${when.toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}`
      : "When:  open conversation — reply whenever",
    `Where: ${interviewUrl}`,
    "",
    note ? `Note from Athion:\n${note}` : "",
    "",
    "Click the link above to join. The interview is text-only — no video, no calls. You'll exchange messages with us in real time, on your own schedule.",
    "",
    "— Athion",
  ].filter((l, i, a) => !(l === "" && a[i - 1] === ""));

  const attachments = when
    ? [
        {
          filename: "athion-interview.ics",
          content: buildIcs({
            uid: `interview-${applicationId}@athion.me`,
            start: when,
            durationMinutes: 30,
            summary: "Athion interview",
            description: `Join the interview at ${interviewUrl}${note ? `\n\n${note}` : ""}`,
            url: interviewUrl,
          }),
          contentType: "text/calendar; charset=utf-8; method=REQUEST",
        },
      ]
    : undefined;

  return {
    subject: "Interview invite — Athion",
    text: lines.join("\n"),
    attachments,
  };
}

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
