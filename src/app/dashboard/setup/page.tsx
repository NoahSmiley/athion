"use client";

import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-2.5 border border-border text-xs text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors shrink-0"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

export default function SetupPage() {
  return (
    <div className="max-w-lg">
      <h1 className="font-[590] text-3xl tracking-[-0.022em]">Setup</h1>
      <p className="mt-2 text-foreground-muted">
        Get Liminal IDE up and running in three steps.
      </p>

      {/* Step 1: Athion */}
      <div className="mt-10 bg-white/[0.02] border border-white/[0.06] p-5 opacity-60">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 flex items-center justify-center border border-accent/30 text-xs text-accent">
            &#10003;
          </span>
          <h2 className="text-sm text-foreground">Create an Athion account</h2>
        </div>
        <p className="mt-2 ml-9 text-sm text-foreground-muted">
          You&apos;re signed in. This step is complete.
        </p>
      </div>

      {/* Step 2: Install CLI */}
      <div className="mt-3 bg-white/[0.02] border border-white/[0.06] p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-6 flex items-center justify-center border border-border text-xs text-foreground-muted">
            2
          </span>
          <h2 className="text-sm text-foreground">Install the Claude CLI</h2>
        </div>

        <p className="text-sm text-foreground-muted leading-relaxed mb-4 ml-9">
          Liminal IDE uses the Claude CLI to communicate with Anthropic.
          Install it globally with npm:
        </p>

        <div className="flex items-center gap-2 ml-9">
          <code className="flex-1 px-3 py-2.5 bg-background-elevated border border-border text-sm font-mono text-foreground select-all">
            npm install -g @anthropic-ai/claude-code
          </code>
          <CopyButton text="npm install -g @anthropic-ai/claude-code" />
        </div>

        <p className="mt-3 ml-9 text-xs text-foreground-muted">
          Works on macOS, Windows, and Linux. Requires{" "}
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

      {/* Step 3: Sign in */}
      <div className="mt-3 bg-white/[0.02] border border-white/[0.06] p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-6 flex items-center justify-center border border-border text-xs text-foreground-muted">
            3
          </span>
          <h2 className="text-sm text-foreground">
            Sign in with your Claude account
          </h2>
        </div>

        <p className="text-sm text-foreground-muted leading-relaxed mb-4 ml-9">
          Authenticate with your Anthropic account. Run this in your terminal:
        </p>

        <div className="flex items-center gap-2 ml-9">
          <code className="flex-1 px-3 py-2.5 bg-background-elevated border border-border text-sm font-mono text-foreground select-all">
            claude auth login
          </code>
          <CopyButton text="claude auth login" />
        </div>

        <p className="mt-3 ml-9 text-sm text-foreground-muted leading-relaxed">
          This opens a browser window to sign in with your Claude account.
          You can also do this step directly from within Liminal IDE on first
          launch.
        </p>

        <p className="mt-3 ml-9 text-xs text-foreground-muted">
          Don&apos;t have a Claude account?{" "}
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors underline underline-offset-2"
          >
            Sign up at claude.ai
          </a>
        </p>
      </div>

      {/* Done */}
      <div className="mt-6 p-4 bg-white/[0.02] border border-white/[0.06]">
        <p className="text-sm text-foreground-muted leading-relaxed">
          Once all steps are complete, open Liminal IDE and sign in with your
          Athion account. The IDE will automatically detect your Claude
          authentication.
        </p>
      </div>
    </div>
  );
}
