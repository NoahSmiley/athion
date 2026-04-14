"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiKeySection } from "./api-key-section";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (d.user) { setDisplayName(d.user.displayName || ""); setEmail(d.user.email || ""); } });
  }, []);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage("");
    const res = await fetch("/api/auth/update-profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName }) });
    setMessage(res.ok ? "Profile updated." : ((await res.json()).error || "Failed")); setLoading(false);
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage("");
    const res = await fetch("/api/auth/update-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword }) });
    if (res.ok) { setMessage("Password updated."); setNewPassword(""); } else { setMessage((await res.json()).error || "Failed"); }
    setLoading(false);
  };

  const input = { fontFamily: "inherit", fontSize: 13, padding: "2px 4px", width: 300 } as const;

  return (
    <>
      <h1>Settings</h1>
      <p className="muted">Update your profile and account preferences.</p>
      {message && <p style={{ color: "#c44", marginTop: 8 }}>{message}</p>}

      <h2>Profile</h2>
      <form onSubmit={updateProfile}>
        <table><tbody>
          <tr><td style={{ verticalAlign: "top" }}>Name:</td><td><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={input} /></td></tr>
          <tr><td style={{ verticalAlign: "top" }}>Email:</td><td><input type="email" value={email} disabled style={{ ...input, color: "#555" }} /></td></tr>
          <tr><td /><td style={{ paddingTop: 8 }}><button type="submit" disabled={loading} style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>Save</button></td></tr>
        </tbody></table>
      </form>

      <h2>Password</h2>
      <form onSubmit={updatePassword}>
        <table><tbody>
          <tr><td style={{ verticalAlign: "top" }}>New:</td><td><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} placeholder="At least 8 characters" style={input} /></td></tr>
          <tr><td /><td style={{ paddingTop: 8 }}><button type="submit" disabled={loading || !newPassword} style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>Update Password</button></td></tr>
        </tbody></table>
      </form>

      <ApiKeySection />

      <h2 style={{ color: "#c44" }}>Danger Zone</h2>
      {deleteConfirm ? (
        <>
          <p className="muted">Are you sure? This cannot be undone.</p>
          <p style={{ marginTop: 8 }}>
            <button onClick={async () => { await fetch("/api/auth/delete-account", { method: "POST" }); router.push("/"); }} style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer", color: "#c44" }}>Yes, delete my account</button>
            {" "}
            <button onClick={() => setDeleteConfirm(false)} style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>Cancel</button>
          </p>
        </>
      ) : (
        <button onClick={() => setDeleteConfirm(true)} style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer", color: "#c44" }}>Delete Account</button>
      )}
    </>
  );
}
