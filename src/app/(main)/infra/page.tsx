import type { Metadata } from "next";
import { VariantSwitcher } from "./variant-switcher";
import { VariantCurrent } from "./variants/variant-current";
import { VariantRack } from "./variants/variant-rack";
import { VariantLedger } from "./variants/variant-ledger";
import { VariantConsole } from "./variants/variant-console";
import type { ServiceData } from "./variants/shared";

export const metadata: Metadata = {
  title: "Infra",
  description: "Servers and services Athion runs for members.",
};

const services: ServiceData[] = [
  {
    id: "PZ-01",
    name: "Project Zomboid",
    kind: "Game server",
    status: "live",
    tagline: "Co-op survival on a heavily modded Kentucky map. PVP enabled, persistent world, members-only whitelist.",
    liveProbe: "zomboid",
    shortSpec: "v41.78 · 8 slots · 98 mods",
    details: [
      ["Address", "pz.athion.me:27045 (DNS pending — ask in #general)"],
      ["Version", "41.78 — Build 41"],
      ["Slots", "8 players max"],
      ["Whitelist", "members only"],
      ["Mods", "98 active (Brita's, Arsenal Gunfighter, Tetris inventory, KI5 vehicles, +95 more)"],
      ["Maps", "22-map stack (Frankfort KY, Trimble County, Bedford Falls, Blackwood, Muldraugh, …)"],
    ],
  },
  {
    id: "MC-01",
    name: "Minecraft",
    kind: "Game server",
    status: "live",
    tagline: "Private survival server for members. Persistent world, no resets.",
    liveProbe: "minecraft",
    shortSpec: "v1.21.4 · NeoForge",
    details: [
      ["Address", "mc.athion.me"],
      ["Version", "1.21.4 — NeoForge"],
      ["Whitelist", "members only"],
      ["Backup", "hourly snapshots, 7-day retention"],
    ],
  },
];

type Props = { searchParams: Promise<{ v?: string }> };

const valid = new Set(["rack", "ledger", "console"]);

export default async function InfraPage({ searchParams }: Props) {
  const params = await searchParams;
  const variant = params.v && valid.has(params.v) ? params.v : "current";

  return (
    <>
      {variant === "current" && <VariantCurrent services={services} />}
      {variant === "rack" && <VariantRack services={services} />}
      {variant === "ledger" && <VariantLedger services={services} />}
      {variant === "console" && <VariantConsole services={services} />}
      <VariantSwitcher active={variant} />
    </>
  );
}
