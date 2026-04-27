"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CLOSED = new Set(["approved", "denied", "withdrawn"]);

export function ApplicationActions({
  id,
  status,
  isFounder,
}: {
  id: string;
  status: string;
  isFounder: boolean;
}) {
  const router = useRouter();
  const [interviewNote, setInterviewNote] = useState("");
  const [interviewAt, setInterviewAt] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [moreInfoNote, setMoreInfoNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const act = async (action: string, body: Record<string, unknown> = {}, successMsg?: string) => {
    setBusy(true);
    setError(null);
    setFlash(null);
    try {
      const r = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed");
      if (successMsg) setFlash(successMsg);
      router.refresh();
      if (successMsg) {
        setTimeout(() => setFlash((v) => (v === successMsg ? null : v)), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const closed = CLOSED.has(status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && <p style={{ color: "#c66", fontSize: 12, margin: 0 }}>{error}</p>}
      {flash && <p style={{ color: "#7c8", fontSize: 12, margin: 0 }}>{flash}</p>}

      {!closed && status === "pending" && (
        <button
          onClick={() => act("mark_in_review", {}, "Moved to in review. Applicant emailed.")}
          disabled={busy}
          style={{ alignSelf: "flex-start", padding: "6px 12px" }}
        >
          Move to In Review
        </button>
      )}

      {!closed && (
        <fieldset style={{ border: "1px solid #2a2a2a", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <legend style={{ fontSize: 12, color: "#828282", padding: "0 6px" }}>Schedule interview</legend>
          <input
            type="datetime-local"
            value={interviewAt}
            onChange={(e) => setInterviewAt(e.target.value)}
            style={{ padding: "6px 8px" }}
          />
          <textarea
            placeholder="Note the applicant will see"
            value={interviewNote}
            onChange={(e) => setInterviewNote(e.target.value)}
            rows={3}
            style={{ padding: "6px 8px", fontFamily: "inherit" }}
          />
          <button
            onClick={async () => {
              if (!interviewNote.trim()) return;
              await act(
                "schedule_interview",
                { interviewAt: interviewAt || null, interviewNote },
                "Interview scheduled. Applicant emailed.",
              );
              setInterviewNote("");
              setInterviewAt("");
            }}
            disabled={busy || !interviewNote.trim()}
            style={{ alignSelf: "flex-start", padding: "6px 12px", opacity: interviewNote.trim() && !busy ? 1 : 0.5 }}
          >
            Save & schedule
          </button>
        </fieldset>
      )}

      {!closed && (
        <fieldset style={{ border: "1px solid #2a2a2a", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <legend style={{ fontSize: 12, color: "#828282", padding: "0 6px" }}>Request more info</legend>
          <textarea
            placeholder="What you need from the applicant (shown as a banner on their page)"
            value={moreInfoNote}
            onChange={(e) => setMoreInfoNote(e.target.value)}
            rows={2}
            style={{ padding: "6px 8px", fontFamily: "inherit" }}
          />
          <button
            onClick={async () => {
              if (!moreInfoNote.trim()) return;
              await act("request_more_info", { note: moreInfoNote }, "Requested. Applicant sees this on their page.");
              setMoreInfoNote("");
            }}
            disabled={busy || !moreInfoNote.trim()}
            style={{ alignSelf: "flex-start", padding: "6px 12px", opacity: moreInfoNote.trim() && !busy ? 1 : 0.5 }}
          >
            Request more info
          </button>
        </fieldset>
      )}

      {!closed && (
        <fieldset style={{ border: "1px solid #2a2a2a", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <legend style={{ fontSize: 12, color: "#828282", padding: "0 6px" }}>Decide</legend>
          <textarea
            placeholder="Decision note (optional, applicant will see this)"
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            rows={3}
            style={{ padding: "6px 8px", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={async () => {
                await act("approve", { decisionNote }, "Approved. Invite code emailed.");
                setDecisionNote("");
              }}
              disabled={busy}
              style={{ padding: "6px 12px" }}
            >
              Approve & generate code
            </button>
            <button
              onClick={async () => {
                await act("deny", { decisionNote }, "Denied. Applicant emailed.");
                setDecisionNote("");
              }}
              disabled={busy}
              style={{ padding: "6px 12px" }}
            >
              Deny
            </button>
          </div>
        </fieldset>
      )}

      {closed && (
        <div className="muted">
          <p>Application is {status}. No further actions.</p>
          {isFounder && status !== "approved" && (
            <button onClick={() => act("reopen", {}, "Reopened.")} disabled={busy} style={{ marginTop: 8, padding: "6px 12px" }}>
              Reopen (founder)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
