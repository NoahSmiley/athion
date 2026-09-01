import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { primeDevices, primeTelemetry, users } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth/roles";
import { DeviceActions } from "./device-actions";

export const dynamic = "force-dynamic";

function when(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

/**
 * Every TV that has activated Prime, who it belongs to, when it last
 * checked in, and a kill switch. A lost or handed-on Apple TV used to keep
 * a member's library and live TV forever; revoking here sends it back to
 * the pairing screen on its next renew.
 */
export default async function AdminPrimeDevicesPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/");

  const devices = await db
    .select({
      tokenHash: primeDevices.tokenHash,
      deviceId: primeDevices.deviceId,
      label: primeDevices.label,
      createdAt: primeDevices.createdAt,
      lastRenewedAt: primeDevices.lastRenewedAt,
      lastSeenAt: primeDevices.lastSeenAt,
      revokedAt: primeDevices.revokedAt,
      email: users.email,
      displayName: users.displayName,
      username: users.username,
    })
    .from(primeDevices)
    .innerJoin(users, eq(users.id, primeDevices.userId))
    .orderBy(desc(primeDevices.createdAt));

  const recent = await db
    .select({
      id: primeTelemetry.id,
      deviceId: primeTelemetry.deviceId,
      memberName: primeTelemetry.memberName,
      appVersion: primeTelemetry.appVersion,
      kind: primeTelemetry.kind,
      message: primeTelemetry.message,
      createdAt: primeTelemetry.createdAt,
    })
    .from(primeTelemetry)
    .orderBy(desc(primeTelemetry.createdAt))
    .limit(40);

  const active = devices.filter((d) => !d.revokedAt).length;

  return (
    <>
      <h1>Prime devices</h1>
      <p className="muted">
        {active} active TV{active === 1 ? "" : "s"}
        {devices.length > active ? `, ${devices.length - active} revoked` : ""}.
        Revoking a TV signs it out on its next check-in; it can pair again with a new code.
      </p>

      <table className="admin-apps-table">
        <thead>
          <tr>
            <th>Member</th>
            <th className="hide-mobile">TV</th>
            <th className="hide-mobile">Activated</th>
            <th>Last seen</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {devices.length === 0 && (
            <tr><td colSpan={6} className="muted">No TVs have activated yet.</td></tr>
          )}
          {devices.map((d) => (
            <tr key={d.tokenHash}>
              <td>
                {d.displayName ?? d.username ?? d.email}
                <div className="muted email-cell" style={{ fontSize: 12 }}>{d.email}</div>
              </td>
              <td className="muted hide-mobile" style={{ fontSize: 12 }}>
                {d.label ?? d.deviceId.split(":").pop()}
              </td>
              <td className="muted hide-mobile">{when(d.createdAt)}</td>
              <td className="muted">{when(d.lastSeenAt ?? d.lastRenewedAt)}</td>
              <td>{d.revokedAt ? <span style={{ color: "#c44" }}>Revoked</span> : "Active"}</td>
              <td>
                <DeviceActions hash={d.tokenHash} revoked={Boolean(d.revokedAt)} label={d.label ?? ""} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 40 }}>Recent errors</h2>
      <p className="muted" style={{ fontSize: 13 }}>
        The last 40 error and crash beacons from members' TVs (rolling two weeks).
      </p>
      <table className="admin-apps-table">
        <thead>
          <tr>
            <th>When</th>
            <th className="hide-mobile">Member</th>
            <th className="hide-mobile">Build</th>
            <th>Kind</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {recent.length === 0 && (
            <tr><td colSpan={5} className="muted">Nothing reported.</td></tr>
          )}
          {recent.map((e) => (
            <tr key={e.id}>
              <td className="muted" style={{ whiteSpace: "nowrap" }}>{when(e.createdAt)}</td>
              <td className="muted hide-mobile">{e.memberName ?? "—"}</td>
              <td className="muted hide-mobile">{e.appVersion ?? "—"}</td>
              <td>{e.kind === "crash" ? <span style={{ color: "#c44" }}>crash</span> : "error"}</td>
              <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, wordBreak: "break-word" }}>
                {e.message.length > 240 ? `${e.message.slice(0, 240)}…` : e.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
