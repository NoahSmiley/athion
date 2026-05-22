// This page is the Plaid Link OAuth redirect target for the Ledger iOS app
// (`me.athion.Ledger`). After a user authenticates with their bank (e.g.
// Capital One), the bank redirects them here with OAuth state in the URL.
// iOS's Universal Links system catches the navigation and bounces it back
// into the Ledger app, which hands the state to LinkKit to continue the
// connection flow.
//
// In a desktop browser this page is purely informational — Plaid Link on
// web uses popups, not redirects to a hosted page like this.

export default function LedgerPlaidRedirect() {
  return (
    <main style={{ padding: 40, color: "#c8c8c8", background: "#060606", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 15, marginBottom: 16 }}>Ledger</h1>
      <p style={{ fontSize: 13, color: "#828282", maxWidth: 480 }}>
        Bank connection in progress. If you opened this on your iPhone with Ledger installed,
        the app should reopen automatically. If nothing happened, return to the Ledger app on
        your phone and try again.
      </p>
    </main>
  );
}
