import type { Metadata } from "next";
import { ServerPage, type ServerSpec } from "../server-page";

export const metadata: Metadata = {
  title: "Minecraft",
  description: "Athion's Minecraft NeoForge server.",
};

const spec: ServerSpec = {
  name: "Minecraft",
  game: "Minecraft Java",
  version: "1.21.4 · NeoForge",
  blurb:
    "A modded Minecraft server running NeoForge. Tech and exploration focused — long-term world, no scheduled resets.",
  address: "mc.athion.me",
  liveProbe: "minecraft",
  facts: [
    { label: "Edition", value: "Java" },
    { label: "Mod loader", value: "NeoForge" },
    { label: "Version", value: "1.21.4" },
    { label: "Whitelist", value: "ask to join" },
  ],
  notes:
    "Modpack and mod list pinned in the server channel. Resource pack auto-applies on connect.",
};

export default function MinecraftServerPage() {
  return <ServerPage spec={spec} />;
}
