import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenDock",
  description:
    "Productivity suite with kanban boards, notes, calendar, and AI — built with Tauri for native performance.",
};

export default function OpenDockLayout({ children }: { children: React.ReactNode }) {
  return children;
}
