export const BRAND = {
  name: "Athion",
  tagline: "Software that\ndisappears.",
  description:
    "Tools, infrastructure, and consulting for teams that care about performance, privacy, and craft. Every product is built to use less, start faster, and stay invisible.",
} as const;

export type NavLink = { href: string; label: string };
export type NavDropdown = { label: string; children: NavLink[] };
export type NavItem = NavLink | NavDropdown;

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Products",
    children: [
      { href: "/flux", label: "Flux" },
      { href: "/ide", label: "IDE" },
    ],
  },
  { href: "/hosting", label: "Hosting" },
  { href: "/servers", label: "Game Servers" },
  { href: "/consulting", label: "Consulting" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const FLUX_FEATURES = [
  {
    title: "Crystal Voice",
    description:
      "48kHz stereo audio with constant bitrate encoding. Opus codec, no compromises.",
    icon: "AudioWaveform" as const,
  },
  {
    title: "End-to-End Encryption",
    description:
      "ECDH P-256 key exchange with AES-256-GCM. Your conversations stay yours.",
    icon: "Lock" as const,
  },
  {
    title: "Lossless Screen Share",
    description:
      "Up to 4K VP9 at 20 Mbps. Six quality presets from 480p to lossless.",
    icon: "Monitor" as const,
  },
  {
    title: "Noise Suppression",
    description:
      "Krisp-powered AI noise cancellation. Remove background noise without touching your voice.",
    icon: "MicOff" as const,
  },
  {
    title: "Spatial Text",
    description:
      "Rich messaging with inline emoji, file attachments, reactions, and threaded replies.",
    icon: "MessageSquare" as const,
  },
  {
    title: "Zero Latency",
    description:
      "LiveKit SFU architecture with WebRTC. Sub-100ms latency, globally distributed.",
    icon: "Zap" as const,
  },
] as const;

export const SCREEN_SHARE_PRESETS = [
  { preset: "1080p60", codec: "H.264", bitrate: "6 Mbps", framerate: "60 fps" },
  { preset: "1080p30", codec: "H.264", bitrate: "4 Mbps", framerate: "30 fps" },
  { preset: "720p60", codec: "H.264", bitrate: "4 Mbps", framerate: "60 fps" },
  { preset: "720p30", codec: "H.264", bitrate: "2.5 Mbps", framerate: "30 fps" },
  { preset: "480p30", codec: "H.264", bitrate: "1.5 Mbps", framerate: "30 fps" },
  { preset: "Lossless", codec: "VP9", bitrate: "20 Mbps", framerate: "60 fps" },
] as const;

export const IDE_FEATURES = [
  {
    title: "AI-Native Editing",
    description: "Deep language model integration that understands your entire codebase.",
    icon: "Sparkles" as const,
  },
  {
    title: "Terminal First",
    description: "Built-in terminal with multiplexing. Never leave the editor.",
    icon: "Terminal" as const,
  },
  {
    title: "Minimal Interface",
    description: "No visual noise. The code is the interface.",
    icon: "Minus" as const,
  },
  {
    title: "Blazing Performance",
    description: "Native Rust core. Opens instantly, stays fast at any scale.",
    icon: "Gauge" as const,
  },
] as const;

export const ATHION_PRO = {
  product: "athion_pro" as const,
  name: "Athion Pro",
  description: "One subscription. Every product. Full access to Flux, Liminal IDE, Hosting, and game servers.",
  monthlyPrice: 20,
  yearlyPrice: 192,
  features: [
    "Flux — voice chat, E2EE, lossless screen share",
    "Liminal IDE — AI-native code editor, Rust core",
    "Hosting — web apps, APIs, and static sites",
    "Game Servers — Minecraft, modpacks, always online",
    "VPS — full root access, 2 vCPU, 4 GB RAM",
    "Custom domains with automatic SSL",
    "Daily backups across all services",
    "Priority support",
  ],
} as const;

export const ADDON_PACKAGES = [
  {
    id: "minecraft" as const,
    name: "Minecraft Server",
    description: "Java Edition with full modpack support, always online.",
    monthlyPrice: 5,
  },
  {
    id: "factorio" as const,
    name: "Factorio Server",
    description: "Persistent multiplayer world. Drop in anytime.",
    monthlyPrice: 4,
  },
  {
    id: "satisfactory" as const,
    name: "Satisfactory Server",
    description: "Co-op dedicated server with save persistence.",
    monthlyPrice: 4,
  },
  {
    id: "cs2_surf" as const,
    name: "CS2 Surf Server",
    description: "Custom maps, competitive timers, and leaderboards.",
    monthlyPrice: 4,
  },
  {
    id: "hosting" as const,
    name: "Web Hosting",
    description: "Web apps, APIs, and static sites with custom domains.",
    monthlyPrice: 6,
  },
  {
    id: "vps" as const,
    name: "VPS",
    description: "Full root access, 2 vCPU, 4 GB RAM.",
    monthlyPrice: 12,
  },
] as const;

export const HOSTING_TIERS = [
  {
    title: "Game Servers",
    description: "Always-online private game servers with modpack support and one-click setup.",
    icon: "Gamepad2" as const,
  },
  {
    title: "Web & App Hosting",
    description: "Deploy web apps, APIs, and static sites with zero-downtime deploys and custom domains.",
    icon: "Globe" as const,
  },
  {
    title: "VPS",
    description: "Full root access to a virtual private server. Run anything, configure everything.",
    icon: "Server" as const,
  },
] as const;

export const HOSTING_FEATURES = [
  {
    title: "Always On",
    description: "Your services run 24/7 on dedicated hardware. No cold starts, no sleep timers.",
    icon: "Power" as const,
  },
  {
    title: "Custom Domains",
    description: "Point any domain to your deployment with automatic SSL provisioning.",
    icon: "Globe" as const,
  },
  {
    title: "Daily Backups",
    description: "Automated daily snapshots with one-click restore. Never lose your work.",
    icon: "HardDrive" as const,
  },
  {
    title: "SSH Access",
    description: "Full terminal access to your server for advanced configuration and debugging.",
    icon: "Terminal" as const,
  },
  {
    title: "Private Network",
    description: "Isolated VLAN for your services. Communicate internally without touching the public internet.",
    icon: "Network" as const,
  },
  {
    title: "Monitoring",
    description: "Real-time metrics, uptime alerts, and resource usage dashboards out of the box.",
    icon: "Activity" as const,
  },
] as const;


export const GAME_SERVERS = [
  {
    title: "Minecraft Java",
    description:
      "Primary server with full modpack support. Heavily modded, always online, automatic updates.",
    icon: "Sword" as const,
    status: "online" as const,
    tags: ["Java", "Modded", "Always On"],
  },
  {
    title: "Factorio",
    description:
      "Multiplayer factory building with a persistent world. Drop in anytime.",
    icon: "Factory" as const,
    status: "online" as const,
    tags: ["Multiplayer", "Persistent"],
  },
  {
    title: "Satisfactory",
    description:
      "Co-op dedicated server with save persistence. Build together, pick up where you left off.",
    icon: "HardDrive" as const,
    status: "online" as const,
    tags: ["Co-op", "Dedicated"],
  },
  {
    title: "CS2 Surf",
    description:
      "Community surf server with custom maps. Competitive timers and leaderboards.",
    icon: "Crosshair" as const,
    status: "coming_soon" as const,
    tags: ["Surf", "Custom Maps"],
  },
] as const;

export const SERVER_FEATURES = [
  {
    title: "Always Online",
    description:
      "24/7 uptime on dedicated hardware. No sleep timers, no cold starts, no rental service limitations.",
    icon: "Power" as const,
  },
  {
    title: "Modpack Support",
    description:
      "Upload custom modpacks and we handle server-side installation. Automatic version management.",
    icon: "Settings" as const,
  },
  {
    title: "Daily Backups",
    description:
      "Automated snapshots of every server. One-click rollback to any previous state.",
    icon: "HardDrive" as const,
  },
  {
    title: "Low Latency",
    description:
      "Self-hosted on dedicated network hardware. Optimized routing for minimal ping.",
    icon: "Wifi" as const,
  },
  {
    title: "Full Control",
    description:
      "Console access, config editing, and whitelist management. Your server, your rules.",
    icon: "Terminal" as const,
  },
  {
    title: "Included with Athion Pro",
    description:
      "No extra cost. Every game server is part of your Athion subscription.",
    icon: "Shield" as const,
  },
] as const;

export const CONSULTING_SERVICES = [
  {
    title: "Custom Web Apps",
    description: "Full-stack web applications built to spec. React, Next.js, Rust backends — whatever the project demands.",
    icon: "Globe" as const,
  },
  {
    title: "Mobile Apps",
    description: "Native and cross-platform mobile applications for iOS and Android.",
    icon: "Smartphone" as const,
  },
  {
    title: "Infrastructure & Tooling",
    description: "CI/CD pipelines, deployment automation, monitoring, and developer tooling.",
    icon: "Wrench" as const,
  },
  {
    title: "Technical Advisory",
    description: "Architecture reviews, technology selection, and hands-on guidance for your engineering team.",
    icon: "Lightbulb" as const,
  },
] as const;

export const VALUES = [
  {
    title: "Restraint",
    description:
      "Every feature must earn its place. We remove more than we add.",
  },
  {
    title: "Precision",
    description:
      "Details at the pixel and millisecond level. Quality is non-negotiable.",
  },
  {
    title: "Transparency",
    description:
      "Open protocols. Verifiable encryption. You own your data.",
  },
  {
    title: "Craft",
    description:
      "Software is a medium. We treat it with the care it deserves.",
  },
] as const;
