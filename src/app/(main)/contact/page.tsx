"use client";

import { useState } from "react";

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

  const input = { fontFamily: "inherit", fontSize: 13, padding: "2px 4px", width: 300 } as const;

  return (
    <>
      <h1>Contact</h1>
      <p className="muted">Questions, feedback, or just want to say hello.</p>
      {state === "sent" ? <p><b>Message received.</b> We&apos;ll respond as soon as we can.</p> : (
        <form onSubmit={submit}>
          {state === "error" && <p style={{ color: "#c44" }}>{error}</p>}
          <table><tbody>
            <tr><td style={{ verticalAlign: "top" }}>Name:</td><td><input type="text" required value={form.name} onChange={set("name")} style={input} /></td></tr>
            <tr><td style={{ verticalAlign: "top" }}>Email:</td><td><input type="email" required value={form.email} onChange={set("email")} style={input} /></td></tr>
            <tr><td style={{ verticalAlign: "top" }}>Message:</td><td><textarea required rows={6} value={form.message} onChange={set("message")} style={{ ...input, resize: "vertical" }} /></td></tr>
            <tr><td /><td style={{ paddingTop: 8 }}><button type="submit" disabled={state === "loading"} style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer" }}>{state === "loading" ? "Sending..." : "Send"}</button></td></tr>
          </tbody></table>
        </form>
      )}
    </>
  );
}
