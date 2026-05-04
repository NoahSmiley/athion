export type ServiceData = {
  id: string;
  name: string;
  kind: string;
  status: "live" | "private" | "planned";
  tagline: string;
  details: [string, string][];
  liveProbe?: "zomboid" | "minecraft";
  shortSpec: string;
};

export const labelOf = (s: ServiceData["status"]) =>
  s === "live" ? "Live" : s === "private" ? "Private beta" : "Planned";
