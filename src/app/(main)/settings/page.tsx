import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/roles";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const rows = await db
    .select({
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      memberNumber: users.memberNumber,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, me.id))
    .limit(1);
  const u = rows[0];

  return (
    <>
      <h1>Settings</h1>
      <p className="muted">
        You&apos;re member <span style={{ fontFamily: "var(--font-mono)" }}>#{String(u.memberNumber).padStart(3, "0")}</span>.{" "}
        {u.username && <>Profile: <Link href={`/u/${u.username}`}>@{u.username}</Link></>}
      </p>

      <h2 style={{ marginTop: 24 }}>Profile</h2>
      <ProfileForm
        initial={{
          username: u.username ?? "",
          displayName: u.displayName ?? "",
          bio: u.bio ?? "",
        }}
      />

      <h2 style={{ marginTop: 32 }}>Account</h2>
      <table>
        <tbody>
          <tr><td className="muted" style={{ width: 120 }}>Email</td><td>{u.email}</td></tr>
        </tbody>
      </table>
    </>
  );
}
