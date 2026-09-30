import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/roles";
import { WAKE_TARGETS } from "@/lib/wake";
import { WakeButton } from "./wake-button";

export const dynamic = "force-dynamic";

/** Start the rack PCs from anywhere. Needs Wake-on-LAN enabled in each PC's BIOS and network adapter settings. */
export default async function AdminWakePage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/");

  return (
    <section>
      <h1>Wake PCs</h1>
      <p>Sends a wake signal to a PC in the rack. It works from sleep, and from off if Wake-on-LAN is enabled in the PC&apos;s BIOS.</p>
      <table>
        <tbody>
          {WAKE_TARGETS.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td><code>{t.mac}</code></td>
              <td><WakeButton target={t.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
