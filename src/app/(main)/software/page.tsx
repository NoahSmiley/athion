import type { Metadata } from "next";
import { getArtifactsForRelease, listChannelReleases } from "@/lib/opendock/releases";
import { TARGET_LABELS, type TargetId } from "@/lib/opendock/targets";
import { VariantSwitcher } from "./variant-switcher";
import { VariantCurrent } from "./variants/variant-current";
import { VariantApple } from "./variants/variant-apple";
import { VariantPalantir } from "./variants/variant-palantir";
import { VariantPalantir2 } from "./variants/variant-palantir2";
import { VariantClaude } from "./variants/variant-claude";
import { VariantIBM } from "./variants/variant-ibm";
import type { ProductData } from "./variants/shared";

export const metadata: Metadata = {
  title: "Software",
  description: "Software products from Athion.",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ v?: string }> };

const valid = new Set(["apple", "palantir", "palantir2", "claude", "ibm"]);

export default async function SoftwarePage({ searchParams }: Props) {
  const params = await searchParams;
  const variant = params.v && valid.has(params.v) ? params.v : "current";

  const [latest] = await listChannelReleases("stable", 1);
  const artifacts = latest ? await getArtifactsForRelease(latest.id) : [];
  const dl = artifacts.find((a) => a.target === "darwin-aarch64") ?? artifacts[0] ?? null;

  const products: ProductData[] = [
    {
      slug: "opendock",
      name: "Opendock",
      version: latest?.version,
      tagline: "Native desktop workspace — kanban, notes, calendar, AI. Local-first, no Electron.",
      capabilities: ["Boards", "Notes", "Calendar", "Claude AI"],
      footprint: "30 MB RAM · 18 MB binary · 0.4s startup",
      status: "active",
      downloadUrl: dl ? (dl.installerUrl ?? dl.url) : undefined,
      downloadLabel: dl ? TARGET_LABELS[dl.target as TargetId] : undefined,
      downloadSize: dl?.sizeBytes,
      detailHref: "/opendock",
      pricingHref: "/pricing",
    },
    {
      slug: "shipway",
      name: "Shipway",
      version: "0.3.2",
      tagline: "Self-hosted release pipeline. Tag a commit, get a signed binary on every platform.",
      capabilities: ["Tauri builds", "Code signing", "Updater feeds", "GitHub triggers"],
      footprint: "Single static binary · ~12 MB · runs as systemd unit",
      status: "beta",
      detailHref: "/shipway",
      pricingHref: "/pricing",
    },
    {
      slug: "athlas",
      name: "Athlas",
      version: "0.1.0",
      tagline: "Personal homelab dashboard. Live status, logs, and one-click actions across your CTs/VMs.",
      capabilities: ["Proxmox", "Caddy", "Cloudflared", "Systemd"],
      footprint: "Rust + HTMX · 8 MB binary · 25 MB RAM",
      status: "beta",
      detailHref: "/athlas",
    },
    {
      slug: "porthole",
      name: "Porthole",
      tagline: "Encrypted, local-first port-forward manager. SSH tunnels with the UX of Tailscale.",
      capabilities: ["SSH multiplexing", "Wireguard fallback", "macOS menubar"],
      footprint: "TBD",
      status: "planned",
      detailHref: "/porthole",
    },
  ];

  return (
    <>
      {variant === "current" && <VariantCurrent products={products} />}
      {variant === "apple" && <VariantApple products={products} />}
      {variant === "palantir" && <VariantPalantir products={products} />}
      {variant === "palantir2" && <VariantPalantir2 products={products} />}
      {variant === "claude" && <VariantClaude products={products} />}
      {variant === "ibm" && <VariantIBM products={products} />}
      <VariantSwitcher active={variant} />
    </>
  );
}
