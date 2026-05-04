import type { Metadata } from "next";
import Link from "next/link";
import { Contents, H2 } from "../../contents";

export const metadata: Metadata = { title: "tvOS" };

const HEADINGS = [
  { id: "overview", label: "Overview" },
  { id: "exception", label: "Why UIKit, not SwiftUI" },
  { id: "structure", label: "Project structure" },
  { id: "naming", label: "Naming" },
  { id: "stores", label: "Stores" },
  { id: "navigation", label: "Navigation" },
  { id: "player", label: "Player" },
  { id: "design", label: "Design system" },
];

const m = { fontFamily: "var(--font-mono)" } as const;

export default function TVOSStackPage() {
  return (
    <>
      <h1>tvOS</h1>
      <p className="muted">
        Apple TV apps are the one Apple platform exception to the{" "}
        <Link href="/docs/stacks/swiftui">SwiftUI</Link> rule. UIKit only,
        documented here so the exception is intentional, not drift.
      </p>

      <Contents headings={HEADINGS} />

      <H2 id="overview">Overview</H2>
      <ul>
        <li>UIKit + <span style={m}>UIViewController</span>. No SwiftUI.</li>
        <li>AVKit / AVPlayer for media. Native HLS, no third-party players.</li>
        <li>URLSession + async/await for networking. No Alamofire, no third-party clients.</li>
        <li>No external Swift Package dependencies. Apple frameworks only.</li>
      </ul>

      <H2 id="exception">Why UIKit, not SwiftUI</H2>
      <p>
        SwiftUI on tvOS still loses to UIKit on the things tvOS apps spend most of their time doing:
      </p>
      <ul>
        <li><b>Focus engine</b> &mdash; UIKit&apos;s <span style={m}>UIFocusGuide</span>, <span style={m}>preferredFocusEnvironments</span>, and per-cell focus customization are still richer and more predictable than SwiftUI&apos;s <span style={m}>.focusable</span> + <span style={m}>@FocusState</span> story.</li>
        <li><b>Remote handling</b> &mdash; <span style={m}>UIPress.PressType</span> + gesture recognizers give frame-level control over Siri Remote events. SwiftUI abstractions still leak edge cases.</li>
        <li><b>Collection layouts</b> &mdash; <span style={m}>UICollectionViewCompositionalLayout</span> handles the dense, scroll-heavy poster-grid + horizontal-row layouts that tvOS apps live on. SwiftUI <span style={m}>LazyVGrid</span> performance under focus is materially worse.</li>
      </ul>
      <p className="muted">
        Revisit this rule when SwiftUI for tvOS reaches focus parity. As of tvOS 17/18 it has not.
      </p>

      <H2 id="structure">Project structure</H2>
      <p className="muted">Same four-layer model as the rest of athion (View / Store / Lib / API), with tvOS naming conventions.</p>
      <table className="mobile-cards">
        <thead><tr><th>Layer</th><th>Convention</th><th>Folder</th></tr></thead>
        <tbody>
          <tr><td data-label="Layer"><b>View</b></td><td data-label="Convention"><span style={m}>*ViewController.swift</span></td><td data-label="Folder"><span style={m}>Content/</span>, <span style={m}>Player/</span>, <span style={m}>Sidebar/</span></td></tr>
          <tr><td data-label="Layer"><b>Store</b></td><td data-label="Convention"><span style={m}>*Store.swift</span></td><td data-label="Folder"><span style={m}>Stores/</span></td></tr>
          <tr><td data-label="Layer"><b>Lib</b></td><td data-label="Convention"><span style={m}>*Util.swift</span></td><td data-label="Folder"><span style={m}>Utils/</span></td></tr>
          <tr><td data-label="Layer"><b>API</b></td><td data-label="Convention"><span style={m}>*API.swift</span></td><td data-label="Folder"><span style={m}>Jellyfin/</span>, <span style={m}>IPTV/</span></td></tr>
          <tr><td data-label="Layer"><b>Models</b></td><td data-label="Convention">One struct per file</td><td data-label="Folder"><span style={m}>Models/</span></td></tr>
        </tbody>
      </table>

      <H2 id="naming">Naming</H2>
      <ul>
        <li><b>Views:</b> <span style={m}>HomeViewController.swift</span>, never <span style={m}>HomeView.swift</span> (clashes with SwiftUI <span style={m}>View</span>).</li>
        <li><b>Cells:</b> <span style={m}>*Cell.swift</span> for table/collection cells. <span style={m}>*Card.swift</span> for standalone <span style={m}>UIControl</span>/<span style={m}>UIButton</span> subclasses.</li>
        <li><b>Rows:</b> horizontal scrolling rows are <span style={m}>*RowView.swift</span>.</li>
        <li><b>Stores:</b> <span style={m}>*Store.swift</span>, one per domain. Hold state, not view-controller refs.</li>
        <li><b>API clients:</b> <span style={m}>*API.swift</span> exposing <span style={m}>async</span> methods. No completion handlers.</li>
      </ul>

      <H2 id="stores">Stores</H2>
      <ul>
        <li>One class per domain. Final classes, marked <span style={m}>@MainActor</span>.</li>
        <li>State exposed as <span style={m}>private(set) var</span> with a publisher (<span style={m}>NotificationCenter</span> or callbacks). Avoid Combine unless already pulled in &mdash; not worth the cognitive cost on a tvOS-only app.</li>
        <li>View controllers <i>read</i> stores. They do not own persistent state.</li>
        <li>One singleton per store, accessed via <span style={m}>YourStore.shared</span>. tvOS apps don&apos;t multi-window or multi-scene; the singleton tradeoff is fine.</li>
      </ul>

      <H2 id="navigation">Navigation</H2>
      <ul>
        <li>Root is a <span style={m}>UISplitViewController</span> (sidebar + content) or a custom split equivalent.</li>
        <li>Push detail screens via the content navigation controller. Modal sheets only for transient UI (settings, alerts).</li>
        <li>Sidebar destinations are an <span style={m}>enum</span> in <span style={m}>SidebarDestination.swift</span>. The destination drives which view controller mounts.</li>
        <li>Deep links resolve to a <span style={m}>SidebarDestination</span> + optional item id, never directly into a child controller.</li>
      </ul>

      <H2 id="player">Player</H2>
      <ul>
        <li><span style={m}>AVPlayerViewController</span> subclass per playback context (movie/show vs. live TV). Don&apos;t share one class across both &mdash; the lifecycle and UI affordances differ.</li>
        <li>HLS first. Remux/transcode is a fallback, not the default.</li>
        <li>Resume position lives in the API layer (server-side), not the app. The view controller asks for and reports position; it does not store it locally.</li>
      </ul>

      <H2 id="design">Design system</H2>
      <p>Inherits the universal athion design system (<Link href="/docs">see Design system</Link>). tvOS-specific notes:</p>
      <ul>
        <li><b>Monochrome.</b> Same rule as everything else &mdash; grayscale only, color reserved for errors. No blue checkmarks, no gold stars, no red live badges. Use weight, opacity, and a faint border to distinguish.</li>
        <li><b>Focus styling.</b> Use the system focus halo (<span style={m}>UIFocusEffect</span>) wherever possible. Custom focus chrome (border lift, scale) only when the system effect is wrong for the cell.</li>
        <li><b>Type sizes.</b> tvOS reads at 10ft &mdash; double the body size. 26&ndash;28px body, 36&ndash;40px headings. The 13/14/15px sizes from the web design system do not apply here.</li>
        <li><b>Hit targets.</b> Anything focusable should be at least 200pt wide and 80pt tall. Posters are 240&times;360.</li>
      </ul>
    </>
  );
}
