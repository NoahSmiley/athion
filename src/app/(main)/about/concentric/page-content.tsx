"use client";

import { ConcentricAbout } from "./index";

export function ConcentricPageContent() {
  return (
    <div>
      <p style={{ fontSize: 16, lineHeight: 1.7, margin: "0 0 32px" }}>
        Athion is a tech collective in active development. We build software
        and run services on our own infrastructure. Membership is by
        invitation and there are annual dues &mdash; in return, you get
        access to everything we&apos;re running.
      </p>

      <div style={{ margin: "16px 0 32px", padding: "20px 0" }}>
        <ConcentricAbout />
      </div>

      <h2 style={{ fontSize: 13, marginBottom: 8 }}>What we run</h2>
      <p style={{ marginBottom: 12, lineHeight: 1.7 }}>
        One stack, shared by everyone who&apos;s in.
      </p>
      <ul style={{ marginBottom: 24, lineHeight: 1.7 }}>
        <li>
          <b>Minecraft</b> &mdash; a private server everyone&apos;s on. <span className="muted">live</span>
        </li>
        <li>
          <b>Opendock</b> &mdash; local-first kanban, notes, calendar, AI in
          one native app. <span className="muted">in development</span>
        </li>
        <li>
          <b>More to come</b> &mdash; tools, games, infrastructure. We build
          things we want to use and let members use them too.
        </li>
      </ul>

      <h2 style={{ fontSize: 13, marginBottom: 8 }}>How membership works</h2>
      <p style={{ marginBottom: 24, lineHeight: 1.7 }}>
        Apply, talk to us briefly, and if it&apos;s a fit you&apos;re in.
        Members pay annual dues that go directly into running and improving
        the stack. There&apos;s a fixed number of slots &mdash; we run on
        hardware we own, and we&apos;re not interested in scaling past what
        we can do well.
      </p>

      <h2 style={{ fontSize: 13, marginBottom: 8 }}>What we&apos;re building toward</h2>
      <p style={{ marginBottom: 24, lineHeight: 1.7 }}>
        A small, durable place on the internet. Software that lasts. Games
        we actually want to play. Infrastructure that doesn&apos;t depend on
        anyone else&apos;s servers. The kind of thing you&apos;d want to be
        a part of for the long run, not the kind of thing that&apos;s
        optimizing for an exit.
      </p>

      <p className="muted" style={{ marginTop: 40, fontSize: 13 }}>
        If you want in, you can{" "}
        <a href="/request-access">request access</a>.
      </p>
    </div>
  );
}
