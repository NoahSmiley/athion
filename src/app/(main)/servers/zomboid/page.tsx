import type { Metadata } from "next";
import { ServerPage, type ServerSpec } from "../server-page";

export const metadata: Metadata = {
  title: "Zomboid",
  description: "Athion's Project Zomboid dedicated server.",
};

const spec: ServerSpec = {
  name: "Zomboid",
  game: "Project Zomboid",
  version: "Build 41.78",
  blurb:
    "A modded multiplayer apocalypse — slow burn survival across a 22-map stack with Brita's, Arsenal Gunfighter, Tetris inventory, and a long list of vehicle packs. PVP is on; the world isn't reset on a schedule.",
  address: "pz.athion.me:27045",
  liveProbe: "zomboid",
  rules: [
    "No raiding offline players' bases.",
    "No griefing safehouses you don't own.",
    "Mod conflicts? Drop a note in the press post — load order matters.",
    "Whitelist is open: ask in the relevant channel and you're in.",
  ],
  facts: [
    { label: "Slots", value: "8" },
    { label: "Mods", value: "98 active" },
    { label: "Map stack", value: "22 maps · order matters" },
    { label: "PvP", value: "enabled" },
    { label: "Public", value: "no — IP-only join" },
  ],
  notes:
    "Server runs on a Proxmox container with 4 cores and 8 GB RAM. Backups every few hours; saves are durable. Steam query and game traffic both run on UDP 27045.",
};

export default function ZomboidServerPage() {
  return <ServerPage spec={spec} />;
}
