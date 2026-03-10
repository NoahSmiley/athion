"use client";

import { useState } from "react";

export default function SetupPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install -g @anthropic-ai/claude-code");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-3xl tracking-[-0.02em]">Setup</h1>
      <p className="mt-2 text-foreground-muted">
        Get Liminal IDE up and running in two steps.
      </p>

      {/* Step 1 */}
      <div className="mt-10 border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-6 flex items-center justify-center border border-border text-xs text-foreground-muted">
            1
          </span>
          <h2 className="text-sm text-foreground">Install the Claude CLI</h2>
        </div>

        <p className="text-sm text-foreground-muted leading-relaxed mb-4">
          Liminal IDE uses the Claude CLI to communicate with Anthropic. Install
          it globally with npm:
        </p>

        <div className="flex items-center gap-2">
          <code className="flex-1 px-4 py-3 bg-background-elevated border border-border text-sm font-mono text-foreground select-all">
            npm install -g @anthropic-ai/claude-code
          </code>
          <button
            onClick={handleCopy}
            className="px-4 py-3 border border-border text-sm text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors shrink-0"
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>

        <p className="mt-3 text-xs text-foreground-muted">
          Requires{" "}
          <a
            href="https://nodejs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors underline underline-offset-2"
          >
            Node.js 18+
          </a>
        </p>
      </div>

      {/* Step 2 */}
      <div className="mt-4 border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-6 flex items-center justify-center border border-border text-xs text-foreground-muted">
            2
          </span>
          <h2 className="text-sm text-foreground">
            Sign in with your Claude account
          </h2>
        </div>

        <p className="text-sm text-foreground-muted leading-relaxed mb-4">
          Authenticate with your Anthropic account. This opens a browser window
          to sign in. Run this in your terminal:
        </p>

        <code className="block px-4 py-3 bg-background-elevated border border-border text-sm font-mono text-foreground select-all">
          claude auth login
        </code>

        <p className="mt-4 text-sm text-foreground-muted leading-relaxed">
          Or sign in directly from the Liminal IDE — it will prompt you on first
          launch.
        </p>
      </div>

      {/* Done */}
      <div className="mt-6 p-4 border border-border/50">
        <p className="text-sm text-foreground-muted">
          Once both steps are complete, open Liminal IDE and sign in with your
          Athion account. The IDE will automatically detect your Claude
          authentication.
        </p>
      </div>

      {/* Requirements */}
      <div className="mt-8 border-t border-border pt-6">
        <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">
          Requirements
        </p>
        <ul className="text-sm text-foreground-muted space-y-1.5">
          <li>Node.js 18 or later</li>
          <li>
            A Claude account (
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors underline underline-offset-2"
            >
              sign up at claude.ai
            </a>
            )
          </li>
          <li>An Athion account (you have one)</li>
        </ul>
      </div>
    </div>
  );
}
