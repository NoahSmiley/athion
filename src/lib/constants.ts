export const BRAND = {
  name: "Athion",
  tagline: "Build software\nthat disappears.",
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

export const PRICING_PLANS = [
  {
    product: "flux" as const,
    name: "Flux",
    description: "Crystal-clear voice chat with E2EE, lossless screen share, and zero bloat.",
    monthlyPrice: 6,
    yearlyPrice: 60,
    features: [
      "48kHz stereo voice (Opus CBR)",
      "End-to-end encryption (AES-256-GCM)",
      "Lossless screen share (up to 4K VP9)",
      "Krisp noise suppression",
      "Desktop app (macOS, Windows, Linux)",
      "Unlimited servers & channels",
    ],
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

export const HOSTING_PLANS = [
  {
    product: "game_servers" as const,
    name: "Game Servers",
    description: "Always-online private game servers with modpack support and one-click setup.",
    monthlyPrice: 8,
    yearlyPrice: 72,
    features: [
      "Minecraft (Java & Bedrock)",
      "Modpack auto-install",
      "Always online — no port forwarding",
      "Daily backups",
      "Custom domain support",
      "Up to 20 player slots",
    ],
  },
  {
    product: "web_hosting" as const,
    name: "Web & App Hosting",
    description: "Deploy web apps, APIs, and static sites with zero-downtime deploys.",
    monthlyPrice: 10,
    yearlyPrice: 96,
    features: [
      "Zero-downtime deploys",
      "Custom domains with auto-SSL",
      "Node.js, Python, Go, Rust runtimes",
      "Daily backups",
      "CI/CD integration",
      "100 GB bandwidth/month",
    ],
  },
  {
    product: "vps" as const,
    name: "VPS",
    description: "Full root access to a virtual private server. Run anything you want.",
    monthlyPrice: 15,
    yearlyPrice: 144,
    features: [
      "Full root / SSH access",
      "2 vCPU, 4 GB RAM, 80 GB SSD",
      "Choice of Linux distro",
      "Daily snapshots",
      "Private networking",
      "Unmetered bandwidth",
    ],
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
