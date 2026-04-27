import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_review: "In review",
  interview_scheduled: "Interview",
  needs_more_info: "Needs info",
  approved: "Approved",
  denied: "Denied",
  withdrawn: "Withdrawn",
};

const CLOSED_STATUSES = new Set(["approved", "denied", "withdrawn"]);

function unread(r: { lastApplicantMessageAt: Date | null; lastAdminSeenAt: Date | null }): boolean {
  if (!r.lastApplicantMessageAt) return false;
  if (!r.lastAdminSeenAt) return true;
  return r.lastApplicantMessageAt.getTime() > r.lastAdminSeenAt.getTime();
}

export default async function ApplicationsQueuePage() {
  const rows = await db
    .select()
    .from(accessRequests)
    .orderBy(desc(accessRequests.createdAt))
    .limit(100);

  const pending = rows.filter((r) => !CLOSED_STATUSES.has(r.status));
  const closed = rows.filter((r) => CLOSED_STATUSES.has(r.status));
  const unreadCount = pending.filter(unread).length;

  return (
    <>
      <h1>Applications</h1>
      <p className="muted">
        {pending.length} open · {closed.length} closed
        {unreadCount > 0 && <> · <b style={{ color: "#c8c8c8" }}>{unreadCount} unread</b></>}
      </p>

      <h2>Open</h2>
      {pending.length === 0 ? (
        <p className="muted">No open applications.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Email</th>
              <th>GitHub</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((r) => {
              const u = unread(r);
              return (
                <tr key={r.id} style={u ? { fontWeight: 500 } : undefined}>
                  <td style={{ width: 12, color: u ? "#c8c8c8" : "transparent" }}>●</td>
                  <td><Link href={`/admin/applications/${r.id}`}>{r.email}</Link></td>
                  <td className="muted">{r.githubUrl ?? "—"}</td>
                  <td className="muted">{statusLabel[r.status] ?? r.status}</td>
                  <td className="muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 24 }}>Closed</h2>
      {closed.length === 0 ? (
        <p className="muted">No closed applications yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Outcome</th>
              <th>Decided</th>
            </tr>
          </thead>
          <tbody>
            {closed.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/admin/applications/${r.id}`}>{r.email}</Link></td>
                <td className="muted">{statusLabel[r.status] ?? r.status}</td>
                <td className="muted">{r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
