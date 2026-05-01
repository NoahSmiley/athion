export type TargetId = "darwin-aarch64" | "darwin-x86_64" | "windows-x86_64" | "linux-x86_64";

export const TARGET_LABELS: Record<TargetId, string> = {
  "darwin-aarch64": "macOS (Apple Silicon)",
  "darwin-x86_64": "macOS (Intel)",
  "windows-x86_64": "Windows (x64)",
  "linux-x86_64": "Linux (x64)",
};

export const TARGET_ORDER: TargetId[] = [
  "darwin-aarch64",
  "darwin-x86_64",
  "windows-x86_64",
  "linux-x86_64",
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
