export type DownloadOption = { target: string; label: string; url: string; size: number };

export type VariantData = {
  version?: string;
  releasedAt?: Date;
  download: DownloadOption | null;
};

export const features: [string, string][] = [
  ["Boards", "Kanban with sprints, epics, labels, and drag-and-drop ticket organization."],
  ["Notes", "Markdown editor with collections, folders, and tags. Full-text search."],
  ["Calendar", "Event scheduling linked to tickets, deadlines, sprints, and meetings."],
  ["Claude AI", "Built-in assistant that understands your boards, notes, and calendar."],
  ["Native Desktop", "Tauri-powered. ~30 MB RAM, no Electron, no browser engine."],
  ["Local-First", "SQLite on your machine. Works fully offline. Your data never leaves."],
];

export const benchmarks: [string, string, string][] = [
  ["Memory (idle)", "30 MB", "450 MB"],
  ["Memory (active)", "65 MB", "680 MB"],
  ["Binary size", "18 MB", "380 MB"],
  ["Startup time", "0.4s", "3.2s"],
  ["CPU (idle)", "0.3%", "4.5%"],
  ["Offline support", "100%", "20%"],
];

export const heroStats: { value: string; unit: string; label: string; compare: string }[] = [
  { value: "30", unit: "MB", label: "RAM idle", compare: "vs 450 MB Notion" },
  { value: "0.4", unit: "s", label: "startup", compare: "vs 3.2s Notion" },
  { value: "18", unit: "MB", label: "binary", compare: "vs 380 MB Notion" },
  { value: "100", unit: "%", label: "offline", compare: "vs 20% Notion" },
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
