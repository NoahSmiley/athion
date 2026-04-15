"use client";

import { useState } from "react";

const input = { width: "100%", fontFamily: "inherit", fontSize: 13, padding: "6px 8px", marginTop: 4, boxSizing: "border-box" as const };

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { setError((await res.json()).error || "Failed"); setState("error"); return; }
      setState("sent");
    } catch { setError("Something went wrong"); setState("error"); }
  };

  return (
    <>
      <h1>Contact</h1>
      <p className="muted">Questions, feedback, or just want to say hello.</p>
      {state === "sent" ? <p><b>Message received.</b> We&apos;ll respond as soon as we can.</p> : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, maxWidth: 400 }}>
          {state === "error" && <p style={{ color: "#c44", margin: 0 }}>{error}</p>}
          <div>
            <label className="muted" style={{ fontSize: 11 }}>Name</label>
            <input type="text" required value={form.name} onChange={set("name")} style={input} />
          </div>
          <div>
            <label className="muted" style={{ fontSize: 11 }}>Email</label>
            <input type="email" required value={form.email} onChange={set("email")} style={input} />
          </div>
          <div>
            <label className="muted" style={{ fontSize: 11 }}>Message</label>
            <textarea required rows={5} value={form.message} onChange={set("message")} style={{ ...input, resize: "vertical" }} />
          </div>
          <button type="submit" disabled={state === "loading"} style={{ fontFamily: "inherit", fontSize: 13, padding: "6px 12px", cursor: "pointer", alignSelf: "flex-start" }}>
            {state === "loading" ? "Sending..." : "Send"}
          </button>
        </form>
      )}
    </>
  );
}
