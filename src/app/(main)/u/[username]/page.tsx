import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { Metadata } from "next";

type Params = { username: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;

  const memberRows = await db
    .select({
      id: users.id,
      memberNumber: users.memberNumber,
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      role: users.role,
      invitedBy: users.invitedBy,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const member = memberRows[0];
  if (!member) notFound();

  // Who invited them
  let invitedBy: { username: string | null; memberNumber: number; displayName: string | null } | null = null;
  if (member.invitedBy) {
    const rows = await db
      .select({ username: users.username, memberNumber: users.memberNumber, displayName: users.displayName })
      .from(users)
      .where(eq(users.id, member.invitedBy))
      .limit(1);
    invitedBy = rows[0] ?? null;
  }

  // Who they've invited
  const invitees = await db
    .select({ id: users.id, username: users.username, memberNumber: users.memberNumber, displayName: users.displayName })
    .from(users)
    .where(eq(users.invitedBy, member.id))
    .orderBy(asc(users.memberNumber));

  const memberNum = String(member.memberNumber).padStart(3, "0");
  const tierLabel = member.role === "founder" ? "Founder" : member.role === "admin" ? "Admin" : "Member";

  return (
    <>
      <h1 style={{ marginBottom: 0 }}>{member.displayName ?? `@${member.username}`}</h1>
      <p className="muted" style={{ marginTop: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)" }}>#{memberNum}</span>
        <span style={{ margin: "0 6px", color: "#444" }}>·</span>
        <span>@{member.username}</span>
        <span style={{ margin: "0 6px", color: "#444" }}>·</span>
        <span>{tierLabel}</span>
      </p>

      {member.bio && (
        <p style={{ marginTop: 16, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{member.bio}</p>
      )}

      <h2 style={{ marginTop: 24 }}>Lineage</h2>
      <table>
        <tbody>
          <tr>
            <td className="muted" style={{ width: 120 }}>Joined</td>
            <td>{new Date(member.createdAt).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="muted">Invited by</td>
            <td>
              {invitedBy?.username ? (
                <Link href={`/u/${invitedBy.username}`}>
                  <span style={{ fontFamily: "var(--font-mono)" }}>#{String(invitedBy.memberNumber).padStart(3, "0")}</span>{" "}
                  {invitedBy.displayName ?? `@${invitedBy.username}`}
                </Link>
              ) : (
                <span className="muted">—</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="muted">Invited</td>
            <td>
              {invitees.length === 0 ? (
                <span className="muted">No one yet.</span>
              ) : (
                <span>
                  {invitees.map((u, i) => (
                    <span key={u.id}>
                      {i > 0 && <span style={{ color: "#444" }}>, </span>}
                      <Link href={u.username ? `/u/${u.username}` : "#"}>
                        <span style={{ fontFamily: "var(--font-mono)" }}>#{String(u.memberNumber).padStart(3, "0")}</span>{" "}
                        {u.displayName ?? `@${u.username ?? "?"}`}
                      </Link>
                    </span>
                  ))}
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
