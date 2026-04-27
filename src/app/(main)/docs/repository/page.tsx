import type { Metadata } from "next";
import { Contents, H2 } from "../contents";

export const metadata: Metadata = { title: "Repository" };

const HEADINGS = [
  { id: "principles", label: "Core principles" },
  { id: "branches", label: "Branch model" },
  { id: "naming", label: "Branch naming" },
  { id: "commits", label: "Commits" },
  { id: "prs", label: "Pull requests" },
  { id: "merging", label: "Merging" },
  { id: "releases", label: "Releases and tags" },
  { id: "protected", label: "Protected branches" },
  { id: "secrets", label: "Secrets and sensitive files" },
  { id: "workflow", label: "Daily workflow" },
];

export default function RepositoryGuidelinesPage() {
  return (
    <>
      <h1>Repository</h1>
      <p className="muted">Branching, commits, and Git hygiene across athion repos. One workflow, every repo.</p>

      <Contents headings={HEADINGS} />

      <H2 id="principles">Core principles</H2>
      <ul>
        <li><b>main is always shippable.</b> If a commit lands on main, it builds, passes checks, and can deploy.</li>
        <li><b>Short-lived branches.</b> Branches exist to land a change, not to live alongside main. Merge within days, not weeks.</li>
        <li><b>Linear history.</b> Rebase before merge. No merge commits on main outside of release tags.</li>
        <li><b>One change per branch.</b> If a branch does two unrelated things, it is two branches.</li>
        <li><b>Commits are checkpoints, not diaries.</b> Squash before merge. The final history is the story.</li>
        <li><b>No force-push to shared branches.</b> Force-push is fine on your own feature branch, never on main.</li>
      </ul>

      <H2 id="branches">Branch model</H2>
      <p className="muted">Trunk-based development. One long-lived branch, short-lived topic branches.</p>
      <table className="mobile-cards">
        <thead><tr><th>Branch</th><th>Lives</th><th>Who writes</th><th>Merges from</th></tr></thead>
        <tbody>
          <tr><td data-label="Branch"><b>main</b></td><td data-label="Lives">Forever</td><td data-label="Who writes">No one directly</td><td data-label="Merges from">Topic branches via PR</td></tr>
          <tr><td data-label="Branch"><b>feat/*</b></td><td data-label="Lives">Hours to days</td><td data-label="Who writes">One author</td><td data-label="Merges from">&mdash;</td></tr>
          <tr><td data-label="Branch"><b>fix/*</b></td><td data-label="Lives">Hours</td><td data-label="Who writes">One author</td><td data-label="Merges from">&mdash;</td></tr>
          <tr><td data-label="Branch"><b>chore/*</b></td><td data-label="Lives">Hours</td><td data-label="Who writes">One author</td><td data-label="Merges from">&mdash;</td></tr>
          <tr><td data-label="Branch"><b>release/*</b></td><td data-label="Lives">Until tagged</td><td data-label="Who writes">Release owner</td><td data-label="Merges from">main only</td></tr>
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 8 }}>No develop, staging, or integration branches. No long-lived feature branches. If a feature is not ready, it ships behind a flag or is not merged.</p>

      <H2 id="naming">Branch naming</H2>
      <table className="mobile-cards">
        <thead><tr><th>Prefix</th><th>Purpose</th><th>Example</th></tr></thead>
        <tbody>
          <tr><td data-label="Prefix"><span style={{ fontFamily: "var(--font-mono)" }}>feat/</span></td><td data-label="Purpose">New feature or capability</td><td data-label="Example">feat/boards-drag-reorder</td></tr>
          <tr><td data-label="Prefix"><span style={{ fontFamily: "var(--font-mono)" }}>fix/</span></td><td data-label="Purpose">Bug fix</td><td data-label="Example">fix/editor-cursor-color</td></tr>
          <tr><td data-label="Prefix"><span style={{ fontFamily: "var(--font-mono)" }}>chore/</span></td><td data-label="Purpose">Tooling, deps, refactors with no behavior change</td><td data-label="Example">chore/bump-tauri-2.2</td></tr>
          <tr><td data-label="Prefix"><span style={{ fontFamily: "var(--font-mono)" }}>docs/</span></td><td data-label="Purpose">Documentation only</td><td data-label="Example">docs/repository-guide</td></tr>
          <tr><td data-label="Prefix"><span style={{ fontFamily: "var(--font-mono)" }}>release/</span></td><td data-label="Purpose">Release prep, version bump</td><td data-label="Example">release/0.3.0</td></tr>
        </tbody>
      </table>
      <ul style={{ marginTop: 8 }}>
        <li>Lowercase, hyphen-separated, no underscores.</li>
        <li>Describe the change, not the author or ticket number.</li>
        <li>Keep it under 50 characters. If the name needs more, the branch does too much.</li>
      </ul>

      <H2 id="commits">Commits</H2>
      <p className="muted">Imperative mood. One idea per commit. The message explains the change; the diff shows the change.</p>
      <ul>
        <li><b>Subject line</b> &mdash; 50 characters, imperative (&quot;Add boards drag reorder&quot;, not &quot;Added&quot; or &quot;Adding&quot;).</li>
        <li><b>Body</b> &mdash; optional, wrap at 72. Explain <i>why</i> when the <i>what</i> is not obvious.</li>
        <li><b>No ticket prefixes</b> on the subject. Put ticket references in the body or PR description.</li>
        <li><b>No emoji, no Conventional Commits prefixes</b> (<span style={{ fontFamily: "var(--font-mono)" }}>feat:</span>, <span style={{ fontFamily: "var(--font-mono)" }}>fix:</span>). The branch name carries that signal.</li>
        <li><b>No &quot;WIP&quot;, &quot;wip&quot;, &quot;fix&quot;, &quot;update&quot;</b> as standalone messages. Every commit on main must stand on its own.</li>
        <li><b>No &quot;misc changes&quot;</b>. If the commit does many things, split it.</li>
      </ul>

      <p style={{ marginTop: 12 }}><b>Good subject lines</b></p>
      <pre style={{ background: "var(--a-bg-input)", padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", overflow: "auto" }}>{`Add boards drag reorder with pointer events
Fix editor cursor color on dark background
Split monolithic styles into src/styles/
Enforce 100-line limit on all source files`}</pre>

      <p style={{ marginTop: 12 }}><b>Bad subject lines</b></p>
      <pre style={{ background: "var(--a-bg-input)", padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", overflow: "auto" }}>{`wip
fix stuff
updates
feat: added boards (AT-1234)
Board drag reorder implementation with pointer events and proper cleanup`}</pre>

      <H2 id="prs">Pull requests</H2>
      <p className="muted">Every change to main goes through a PR. No direct pushes.</p>
      <ul>
        <li><b>Title</b> &mdash; same rules as commit subjects. Under 70 characters, imperative.</li>
        <li><b>Body</b> &mdash; two sections: <b>Summary</b> (1&ndash;3 bullets) and <b>Test plan</b> (checklist). Nothing else required.</li>
        <li><b>Size</b> &mdash; under 400 lines changed where possible. Bigger PRs get less review, not more.</li>
        <li><b>One author per PR.</b> If two people worked on it, one lands it and credits the other in the body.</li>
        <li><b>CI must be green</b> before merge. No &quot;CI is flaky&quot; overrides &mdash; fix the flake or fix the test.</li>
        <li><b>Self-review first.</b> Read your own diff before requesting review. Catch the obvious stuff yourself.</li>
      </ul>

      <H2 id="merging">Merging</H2>
      <p className="muted">Squash and merge. One PR, one commit on main.</p>
      <ul>
        <li><b>Squash-merge</b> is the default. The squashed commit message is the PR title + body summary.</li>
        <li><b>Rebase-merge</b> only when commits are already clean and tell a useful story (rare).</li>
        <li><b>Never merge-commit</b> onto main. No &quot;Merge branch &apos;feat/x&apos; into main&quot; noise.</li>
        <li><b>Rebase your branch onto main</b> before merge if it is behind. Do not merge main into your branch.</li>
        <li><b>Delete the branch</b> after merge. GitHub does this automatically &mdash; keep that setting on.</li>
      </ul>

      <H2 id="releases">Releases and tags</H2>
      <ul>
        <li><b>SemVer</b> &mdash; <span style={{ fontFamily: "var(--font-mono)" }}>v0.3.1</span> format. Major.Minor.Patch, no pre-release suffixes until GA.</li>
        <li><b>Tag on main only.</b> Tags mark a shipped commit, not a branch state.</li>
        <li><b>Release branches</b> exist only for stabilization when patches need to land without new features. Merge fixes into main first, then cherry-pick to release.</li>
        <li><b>Changelog lives in the repo</b> at <span style={{ fontFamily: "var(--font-mono)" }}>CHANGELOG.md</span>. Updated in the release PR, not after the fact.</li>
      </ul>

      <H2 id="protected">Protected branches</H2>
      <p className="muted">Every Athion repo configures main with these rules.</p>
      <ul>
        <li>Require pull request before merging.</li>
        <li>Require status checks (lint, typecheck, test, build) to pass.</li>
        <li>Require branches to be up to date before merging.</li>
        <li>Dismiss stale approvals on new commits.</li>
        <li>Disallow force pushes and deletions.</li>
        <li>Restrict who can push (only merge-bot or repo admins for emergencies).</li>
      </ul>

      <H2 id="secrets">Secrets and sensitive files</H2>
      <ul>
        <li><b>Never commit secrets.</b> No <span style={{ fontFamily: "var(--font-mono)" }}>.env</span>, no API keys, no certificates.</li>
        <li><b>Use <span style={{ fontFamily: "var(--font-mono)" }}>.env.example</span></b> with placeholder values. Real values go in <span style={{ fontFamily: "var(--font-mono)" }}>.env.local</span>, gitignored.</li>
        <li><b>If a secret leaks</b>, rotate it immediately. Then rewrite history only if the repo is still private.</li>
        <li><b>No binaries in Git.</b> Fonts, images, and assets belong in the repo if small (&lt;200KB). Larger artifacts go to a CDN or LFS.</li>
        <li><b>Lockfiles are committed.</b> <span style={{ fontFamily: "var(--font-mono)" }}>package-lock.json</span>, <span style={{ fontFamily: "var(--font-mono)" }}>Cargo.lock</span>, <span style={{ fontFamily: "var(--font-mono)" }}>Package.resolved</span> &mdash; all in. No exceptions.</li>
      </ul>

      <H2 id="workflow">Daily workflow</H2>
      <pre style={{ background: "var(--a-bg-input)", padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", overflow: "auto" }}>{`# start work
git checkout main && git pull
git checkout -b feat/boards-drag-reorder

# ...make changes, commit as you go

# before pushing / opening PR
git fetch origin
git rebase origin/main

# push and open PR
git push -u origin feat/boards-drag-reorder
gh pr create

# after merge
git checkout main && git pull
git branch -d feat/boards-drag-reorder`}</pre>

      <h2>Rewriting History</h2>
      <p className="muted">Rebase and amend are fine on your own branch. Never on shared branches.</p>
      <ul>
        <li><b>Amend</b> the most recent commit on your branch freely until you push.</li>
        <li><b>Interactive rebase</b> (<span style={{ fontFamily: "var(--font-mono)" }}>git rebase -i</span>) to tidy up commits before opening a PR.</li>
        <li><b>Force-push with lease</b> (<span style={{ fontFamily: "var(--font-mono)" }}>git push --force-with-lease</span>) on your feature branch after rebase. Never plain <span style={{ fontFamily: "var(--font-mono)" }}>--force</span>.</li>
        <li><b>Never rewrite main.</b> If a bad commit lands, add a revert commit, do not rewrite.</li>
      </ul>

      <h2>Monorepo vs Per-App Repos</h2>
      <p className="muted">Athion uses both. Pick by coupling.</p>
      <ul>
        <li><b>Monorepo</b> when apps share code, design tokens, or deploy together (e.g. <span style={{ fontFamily: "var(--font-mono)" }}>opendock-optimum</span>: Tauri + iOS).</li>
        <li><b>Separate repo</b> when apps ship independently and share nothing at the code level (e.g. <span style={{ fontFamily: "var(--font-mono)" }}>athion.me</span> is its own repo).</li>
        <li><b>Never split a monorepo&apos;s apps across repos</b> to avoid a tooling inconvenience. Fix the tooling.</li>
        <li><b>Never merge unrelated projects</b> into one repo for convenience. Shared tooling is not shared code.</li>
      </ul>

      <h2>What NOT to Do</h2>
      <ul>
        <li>No direct commits to main. Ever.</li>
        <li>No long-lived feature branches. Ship behind a flag or do not merge.</li>
        <li>No merge commits on main. Squash only.</li>
        <li>No force-push to main or any shared branch.</li>
        <li>No &quot;WIP&quot;, &quot;fix&quot;, &quot;updates&quot; as commit messages on main.</li>
        <li>No Conventional Commits prefixes (<span style={{ fontFamily: "var(--font-mono)" }}>feat:</span>, <span style={{ fontFamily: "var(--font-mono)" }}>fix:</span>) &mdash; the branch name carries intent.</li>
        <li>No emoji in commits or PR titles.</li>
        <li>No skipping pre-commit or pre-push hooks (<span style={{ fontFamily: "var(--font-mono)" }}>--no-verify</span>) to &quot;just land it&quot;.</li>
        <li>No committing secrets, <span style={{ fontFamily: "var(--font-mono)" }}>.env</span> files, or generated build artifacts.</li>
        <li>No bundling unrelated changes in one PR.</li>
        <li>No merging with red CI.</li>
      </ul>
    </>
  );
}
