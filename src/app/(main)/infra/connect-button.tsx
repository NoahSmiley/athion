"use client";
import { useState } from "react";

export function ConnectButton({ address }: { address?: string }) {
  const [copied, setCopied] = useState(false);
  if (!address) return null;
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      style={{
        background: copied ? "#1e3a1e" : "#0e0e0e",
        border: `1px solid ${copied ? "#2a4a2a" : "#1f1f1f"}`,
        color: copied ? "#4caf50" : "#c8c8c8",
        padding: "6px 12px",
        fontSize: 11,
        cursor: "pointer",
        borderRadius: 3,
        transition: "all 0.15s",
      }}
    >
      {copied ? "✓ copied" : ">_ connect"}
    </button>
  );
}
