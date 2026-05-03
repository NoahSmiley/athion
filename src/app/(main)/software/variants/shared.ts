export type ProductData = {
  slug: string;
  name: string;
  version?: string;
  tagline: string;
  capabilities: string[];
  footprint: string;
  status: "active" | "beta" | "planned";
  downloadUrl?: string;
  downloadLabel?: string;
  downloadSize?: number;
  detailHref: string;
  pricingHref?: string;
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
