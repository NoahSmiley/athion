"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setDisplayName(data.user.displayName || "");
          setEmail(data.user.email || "");
        }
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Failed to update profile");
    } else {
      setMessage("Profile updated.");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Failed to update password");
    } else {
      setMessage("Password updated.");
      setNewPassword("");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    await fetch("/api/auth/delete-account", { method: "POST" });
    router.push("/?deleted=true");
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-[590] text-3xl tracking-[-0.022em]">Settings</h1>
      <p className="mt-2 text-foreground-muted">
        Update your profile and account preferences.
      </p>

      {message && (
        <div className="mt-6 p-3 border border-accent/30 text-accent text-sm">
          {message}
        </div>
      )}

      {/* Profile */}
      <form onSubmit={handleUpdateProfile} className="mt-10 flex flex-col gap-4">
        <p className="text-xs text-foreground-muted uppercase tracking-wider">
          Profile
        </p>
        <div>
          <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 bg-background-elevated border border-border rounded-[6px] text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 bg-background-elevated border border-border rounded-[6px] text-sm text-foreground-muted cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="self-start px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          Save Changes
        </button>
      </form>

      {/* Password */}
      <form onSubmit={handleUpdatePassword} className="mt-12 flex flex-col gap-4 border-t border-border pt-8">
        <p className="text-xs text-foreground-muted uppercase tracking-wider">
          Password
        </p>
        <div>
          <label className="block text-xs text-foreground-muted uppercase tracking-wider mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            placeholder="At least 8 characters"
            className="w-full px-4 py-3 bg-background-elevated border border-border rounded-[6px] text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newPassword}
          className="self-start px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
        >
          Update Password
        </button>
      </form>


      {/* Danger zone */}
      <div className="mt-12 border-t border-border pt-8">
        <p className="text-xs text-red-400 uppercase tracking-wider mb-4">
          Danger Zone
        </p>
        {deleteConfirm ? (
          <div className="p-4 bg-white/[0.02] border border-red-500/30 rounded-lg">
            <p className="text-sm text-foreground-muted">
              Are you sure? This action cannot be undone.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
              >
                Yes, delete my account
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-border text-sm text-foreground-muted hover:text-foreground hover:bg-white/[0.03] active:scale-[0.98] transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-6 py-3 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
          >
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
}
