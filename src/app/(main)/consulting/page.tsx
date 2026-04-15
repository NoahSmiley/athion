"use client";

import { useState } from "react";

const TYPES = ["Web App", "Mobile App", "Infrastructure", "Advisory"] as const;
const input = { width: "100%", fontFamily: "inherit", fontSize: 13, padding: "6px 8px", marginTop: 4, boxSizing: "border-box" as const };

export default function ConsultingPage() {
  const [form, setForm] = useState({ name: "", email: "", type: TYPES[0] as string, message: "" });
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, email: form.email, message: `[Consulting — ${form.type}]\n\n${form.message}` }) });
      if (!res.ok) { setError((await res.json()).error || "Failed"); setState("error"); return; }
      setState("sent");
    } catch { setError("Something went wrong"); setState("error"); }
  };

  return (
    <>
      <h1>Consulting</h1>
      <p className="muted">Five years of enterprise consulting for Fortune 100 and Fortune 500 companies. Now available to teams of any size.</p>
      <p className="muted" style={{ fontStyle: "italic" }}>Coming soon.</p>
      <h2>Track Record</h2>
      <ul><li>5+ years of enterprise consulting</li><li>Fortune 100 and Fortune 500 clients</li><li>$B+ project ROI across delivered engagements</li></ul>
      <h2>Services</h2>
      <ul>
        <li><b>Custom Web Apps</b> &ndash; React, Next.js, Rust backends</li>
        <li><b>Mobile Apps</b> &ndash; Native and cross-platform, iOS and Android</li>
        <li><b>Infrastructure & Tooling</b> &ndash; CI/CD, deployment, monitoring</li>
        <li><b>Technical Advisory</b> &ndash; Architecture reviews, technology selection</li>
      </ul>
      <h2>Pricing</h2>
      <ul><li><b>Hourly:</b> $150/hour</li><li><b>Project-based:</b> Custom quote</li></ul>
      <h2 id="quote">Request a Quote</h2>
      {state === "sent" ? <p><b>Request received.</b> We&apos;ll respond within 2 business days.</p> : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8, maxWidth: 400 }}>
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
            <label className="muted" style={{ fontSize: 11 }}>Type</label>
            <select value={form.type} onChange={set("type")} style={{ ...input, width: "auto" }}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div>
            <label className="muted" style={{ fontSize: 11 }}>Details</label>
            <textarea required rows={5} value={form.message} onChange={set("message")} placeholder="Describe your project, goals, and timeline..." style={{ ...input, resize: "vertical" }} />
          </div>
          <button type="submit" disabled={state === "loading"} style={{ fontFamily: "inherit", fontSize: 13, padding: "6px 12px", cursor: "pointer", alignSelf: "flex-start" }}>
            {state === "loading" ? "Sending..." : "Submit"}
          </button>
        </form>
      )}
    </>
  );
}
