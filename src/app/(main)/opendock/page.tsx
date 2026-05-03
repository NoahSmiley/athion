import { getArtifactsForRelease, listChannelReleases } from "@/lib/opendock/releases";
import { TARGET_LABELS, type TargetId } from "@/lib/opendock/targets";
import { VariantSwitcher } from "./variant-switcher";
import { VariantA } from "./variants/variant-a";
import { VariantB } from "./variants/variant-b";
import { VariantC } from "./variants/variant-c";
import type { VariantData, DownloadOption } from "./variants/shared";

export const dynamic = "force-dynamic";

function detectFromOptions(opts: DownloadOption[]): DownloadOption | null {
  if (opts.length === 0) return null;
  // Server-side default: pick darwin-aarch64 if present, else first option.
  // Client-side platform detection lives in DownloadPrimary, but here we just
  // pre-render a sensible default for SSR.
  return opts.find((o) => o.target === "darwin-aarch64") ?? opts[0];
}

type Props = { searchParams: Promise<{ v?: string }> };

export default async function OpenDockPage({ searchParams }: Props) {
  const params = await searchParams;
  const variant = params.v === "b" || params.v === "c" ? params.v : "a";

  const [latest] = await listChannelReleases("stable", 1);
  const artifacts = latest ? await getArtifactsForRelease(latest.id) : [];

  const downloadOptions: DownloadOption[] = artifacts.map((a) => ({
    target: a.target,
    label: TARGET_LABELS[a.target as TargetId],
    url: a.installerUrl ?? a.url,
    size: a.sizeBytes,
  }));

  const data: VariantData = {
    version: latest?.version,
    releasedAt: latest?.pubDate,
    download: detectFromOptions(downloadOptions),
  };

  return (
    <div className="tall-page">
      <VariantSwitcher active={variant} />
      {variant === "a" && <VariantA data={data} />}
      {variant === "b" && <VariantB data={data} />}
      {variant === "c" && <VariantC data={data} />}
    </div>
  );
}
