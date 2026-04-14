"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const features = ["Flux — voice chat, E2EE, lossless screen share", "Liminal IDE — AI-native code editor, Rust core", "Priority support"];
const comingSoon = ["Hosting — web apps, APIs, and static sites", "Game Servers — Minecraft, modpacks, always online", "VPS — full root access, 2 vCPU, 4 GB RAM", "Consulting — custom development and advisory"];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasSub, setHasSub] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/subscriptions").then((r) => r.json()).then((d) => {
      setHasSub(!!d.subscriptions?.some((s: { product: string }) => s.product === "athion_pro" || s.product === "athion"));
    }).catch(() => {}).finally(() => setChecking(false));
  }, []);

  const checkout = async () => {
    setLoading(true);
    const me = await fetch("/api/auth/me").then((r) => r.json());
    if (!me.user) { router.push("/signup"); return; }
    try {
      const d = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId: `athion_pro_${annual ? "yearly" : "monthly"}` }) }).then((r) => r.json());
      if (d.url) window.location.href = d.url;
    } catch {} finally { setLoading(false); }
  };

  const manage = async () => {
    setLoading(true);
    try { const d = await fetch("/api/portal", { method: "POST" }).then((r) => r.json()); if (d.url) window.location.href = d.url; } catch {} finally { setLoading(false); }
  };

  const price = annual ? 192 : 20;
  const period = annual ? "year" : "month";

  return (
    <>
      <h1>Pricing</h1>
      <p className="muted">One subscription. Full access to Flux and Liminal IDE. No hidden fees. Cancel anytime.</p>
      <h2>Athion Pro</h2>
      <p>
        <label style={{ marginRight: 12, cursor: "pointer" }}><input type="radio" checked={!annual} onChange={() => setAnnual(false)} style={{ marginRight: 4 }} />Monthly ($20/mo)</label>
        <label style={{ cursor: "pointer" }}><input type="radio" checked={annual} onChange={() => setAnnual(true)} style={{ marginRight: 4 }} />Yearly ($192/yr — save 20%)</label>
      </p>
      <p><b>${price}/{period}</b>{annual && <span className="muted"> (${(192 / 12).toFixed(2)}/mo billed annually)</span>}</p>
      <p>Includes:</p>
      <ul>{features.map((f) => <li key={f}>{f}</li>)}</ul>
      <p className="muted">Coming soon:</p>
      <ul>{comingSoon.map((f) => <li key={f} className="muted">{f}</li>)}</ul>
      {!checking && hasSub ? (
        <button onClick={manage} disabled={loading} style={{ fontFamily: "inherit", fontSize: 13, padding: "2px 12px", cursor: "pointer", marginTop: 8 }}>{loading ? "Loading..." : "Manage Subscription"}</button>
      ) : (
        <button onClick={checkout} disabled={loading || checking} style={{ background: "#c8c8c8", border: "none", color: "#0e0e0e", padding: "2px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, marginTop: 8 }}>{loading ? "Loading..." : "Subscribe"}</button>
      )}
      <p className="muted" style={{ marginTop: 16 }}><Link href="/transparency">See where your money goes</Link></p>
    </>
  );
}
