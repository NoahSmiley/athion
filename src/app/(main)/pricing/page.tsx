"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const toggle = { padding: "6px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, border: "1px solid #2a2a2a", background: "none", color: "#828282", transition: "all 0.15s" } as const;
  const active = { ...toggle, background: "#c8c8c8", color: "#060606", border: "1px solid #c8c8c8" };

  return (
    <>
      <h1>Pricing</h1>
      <p className="muted" style={{ marginBottom: 20 }}>One subscription. Everything included.</p>

      <div style={{ border: "1px solid #1a1a1a", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Athion Pro</span>
          <span>
            <b style={{ fontSize: 20 }}>${price}</b>
            <span className="muted">/{period}</span>
          </span>
        </div>

        {annual && <p className="muted" style={{ textAlign: "right", margin: "2px 0 0", fontSize: 11 }}>${(192 / 12).toFixed(2)}/mo billed annually</p>}

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={() => setAnnual(false)} style={!annual ? active : toggle}>Monthly</button>
          <button onClick={() => setAnnual(true)} style={annual ? active : toggle}>Yearly <span style={{ fontSize: 11, opacity: 0.7 }}>save 20%</span></button>
        </div>

        <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 20, paddingTop: 16 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Included</p>
          <p style={{ margin: "0 0 4px" }}>Flux &mdash; voice chat, E2EE, lossless screen share</p>
          <p style={{ margin: "0 0 4px" }}>Liminal IDE &mdash; AI-native code editor, Rust core</p>
          <p style={{ margin: "0 0 0" }}>Priority support</p>
        </div>

        <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 16, paddingTop: 16 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Coming soon</p>
          <p className="muted" style={{ margin: "0 0 4px" }}>Hosting &mdash; web apps, APIs, static sites</p>
          <p className="muted" style={{ margin: "0 0 4px" }}>Game Servers &mdash; Minecraft, modpacks, always online</p>
          <p className="muted" style={{ margin: "0 0 4px" }}>VPS &mdash; full root access, 2 vCPU, 4 GB RAM</p>
          <p className="muted" style={{ margin: 0 }}>Consulting &mdash; custom development and advisory</p>
        </div>

        <div style={{ marginTop: 20 }}>
          {!checking && hasSub ? (
            <button onClick={manage} disabled={loading} style={{ ...toggle, width: "100%", padding: "8px 16px" }}>{loading ? "Loading..." : "Manage Subscription"}</button>
          ) : (
            <button onClick={checkout} disabled={loading || checking} style={{ ...active, width: "100%", padding: "8px 16px", cursor: "pointer" }}>{loading ? "Loading..." : "Subscribe"}</button>
          )}
        </div>
      </div>

      <p className="muted" style={{ marginTop: 12, fontSize: 11 }}><Link href="/transparency">See where your money goes &rarr;</Link></p>
    </>
  );
}
