"use client";

import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ fontFamily: "inherit", fontSize: 11, padding: "1px 8px", cursor: "pointer", marginLeft: 8 }}>
      {copied ? "copied" : "copy"}
    </button>
  );
}

export default function SetupPage() {
  return (
    <>
      <h1>Setup</h1>
      <p className="muted">Get Liminal IDE up and running in three steps.</p>

      <h2>1. Create an Athion account</h2>
      <p className="muted">You&apos;re signed in. This step is complete.</p>

      <h2>2. Install the Claude CLI</h2>
      <p className="muted">Liminal IDE uses the Claude CLI to communicate with Anthropic.</p>
      <p style={{ fontFamily: "var(--font-mono)", marginTop: 4 }}>
        npm install -g @anthropic-ai/claude-code <CopyButton text="npm install -g @anthropic-ai/claude-code" />
      </p>
      <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>Requires <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">Node.js 18+</a></p>

      <h2>3. Sign in with your Claude account</h2>
      <p className="muted">Authenticate with your Anthropic account:</p>
      <p style={{ fontFamily: "var(--font-mono)", marginTop: 4 }}>
        claude auth login <CopyButton text="claude auth login" />
      </p>
      <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>Don&apos;t have a Claude account? <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">Sign up at claude.ai</a></p>

      <h2>Done</h2>
      <p className="muted">Open Liminal IDE and sign in with your Athion account. The IDE will automatically detect your Claude authentication.</p>
    </>
  );
}
