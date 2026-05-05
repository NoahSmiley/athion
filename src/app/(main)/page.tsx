"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type DownloadInfo = { url: string; size: number };

export default function HomePage() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [download, setDownload] = useState<DownloadInfo | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsAuthed(!!d.user))
      .catch(() => setIsAuthed(false));

    fetch("/api/opendock/releases/latest")
      .then((r) => r.ok ? r.json() : null)
      .then((release: { version?: string; artifacts?: { target: string; url: string; installer_url?: string; size_bytes: number }[] } | null) => {
        if (!release?.artifacts?.length) return;
        const artifact = release.artifacts.find((a) => a.target === "darwin-aarch64") ?? release.artifacts[0];
        setDownload({ url: artifact.installer_url ?? artifact.url, size: artifact.size_bytes });
        if (release.version) setVersion(release.version);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home-page tall-page">
      <h1>Athion</h1>
      <p className="muted">
        Tools and services, made by hand.
      </p>

      <h2>Products</h2>
      <table className="home-directory">
        <tbody>
          <tr>
            <td><Link href="/opendock">Opendock</Link></td>
            <td>Lightweight project tracking. Notes to sprints.</td>
            <td className="muted">{version ? `v${version}` : ""}</td>
            <td>
              {download ? (
                <a href={download.url} className="muted">↓ download</a>
              ) : (
                <Link href="/opendock/download" className="muted">download</Link>
              )}
            </td>
          </tr>
          <tr>
            <td><Link href="/prime">Athion Prime</Link></td>
            <td>Private streaming. All your channels in one place.</td>
            <td className="muted"></td>
            <td className="muted">invite-only</td>
          </tr>
          <tr>
            <td><Link href="/infra">Homelab</Link></td>
            <td>Game servers, media, file sync. Behind the scenes.</td>
            <td className="muted"></td>
            <td><a href="https://status.athion.me" className="muted">status →</a></td>
          </tr>
        </tbody>
      </table>

      <h2>Writing</h2>
      <table className="home-directory">
        <tbody>
          <tr>
            <td><Link href="/docs">Docs</Link></td>
            <td>Architecture, conventions, stack guides.</td>
          </tr>
          <tr>
            <td><Link href="/blog">Blog</Link></td>
            <td>Notes from the workbench.</td>
          </tr>
        </tbody>
      </table>

      {isAuthed === false && (
        <>
          <h2>Join</h2>
          <table className="home-directory">
            <tbody>
              <tr>
                <td><Link href="/process">How to join</Link></td>
                <td>What it takes to get an account.</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
