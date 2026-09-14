// Cable schedule for the rack plan. Every row here becomes a routed 3D cable AND a row in the schedule table.
// Ref = [deviceId, anchorKind, index]. Anchor kinds come from `anchors.ts` (p, sfp, rear, out, wan, coax, iec, nic, psu, inlet, port).
// `multi` rows expand to several identical patch-panel-to-switch cords ([panelSlot, switchPort] pairs) that share one schedule row.
// `via: 'AP'` prefixes the run with the ceiling access point path. `ENTRY` is the cabinet's top cable access (index picks a slot).
import type { Mode } from "./geometry";

export type Speed = "10G" | "2.5G" | "1G" | "COAX" | "OFF" | "AC";
/** [deviceId, anchorKind, index]. For the ENTRY pseudo-device the second element is the slot index. */
export type Ref = [string, (string | number)?, number?];
export interface Cable {
  id: string;
  from?: Ref;
  to?: Ref;
  multi?: [number, number][];
  via?: "AP";
  speed: Speed;
  a: string;
  b: string;
  len: string;
  why: string;
}

export const COLORS: Record<Speed, number> = { "10G": 0xe8973a, "2.5G": 0x2f8cff, "1G": 0xb8c0cc, COAX: 0xd9524f, OFF: 0x5b6472, AC: 0x444a54 };
export const CSS_COLORS: Record<Speed, string> = { "10G": "var(--c10)", "2.5G": "var(--c25)", "1G": "var(--c1)", COAX: "var(--ccoax)", OFF: "var(--ink2)", AC: "var(--ink2)" };
export const speedLabel = (k: Speed): string => (k === "COAX" ? "DOCSIS" : k === "OFF" ? "spare" : k === "AC" ? "120 V" : k);
export const speedLong = (k: Speed): string => (k === "COAX" ? "DOCSIS 3.1" : k === "OFF" ? "no link yet" : k === "AC" ? "120 V AC" : k);
export const LEGEND: { key: Speed; label: string }[] = [
  { key: "10G", label: "10G SFP+ DAC" },
  { key: "2.5G", label: "2.5GbE copper" },
  { key: "1G", label: "1GbE copper" },
  { key: "OFF", label: "patched, no link yet" },
  { key: "COAX", label: "DOCSIS 3.1 coax" },
  { key: "AC", label: "120 V AC power" },
];

const AFTER: Cable[] = [
 {id:'H1',from:['ENTRY',0],via:'AP',to:['PP','rear',3],speed:'2.5G',a:'U7 Pro · ceiling mount',b:'Patch panel · keystone 4 (rear)',len:'solid-core Cat6a',why:'The U7 Pro hangs on the ceiling outside the cabinet and is powered by PoE++ from switch port 4 through this single run. Permanent in-wall run. It enters through the LINIER top cable access, comes down the rear of the cabinet, and punches down on a UniFi Cat6A keystone that snaps into slot 4 from the back of the panel. Nothing on the front of the panel is ever cut; you only move patch cords.'},
 {id:'H2',from:['ENTRY',1],to:['PP','rear',8],speed:'1G',a:'Living room TV jack',b:'Patch panel · keystone 9 (rear)',len:'solid-core Cat6a',why:'Same structured-cabling rule: wall-plate keystone at one end, panel keystone at the other, tested once, never touched again. Slot 9 lands on switch port 9, the first 1 GbE port.'},
 {id:'H3',from:['ENTRY',2],to:['PP','rear',9],speed:'1G',a:'Office jack',b:'Patch panel · keystone 10 (rear)',len:'solid-core Cat6a',why:'Runs are numbered to match panel slots, and panel slots match switch ports, so the wall plate number is the switch port number. Pull two per room while the walls are open.'},
 {id:'C1',from:['UCI','coax'],to:['ENTRY',3],speed:'COAX',a:'Coax from the street',b:'UCI · rear F-connector',len:'RG6 via top access',why:'DOCSIS 3.1 from Spectrum. The UCI has the coax F-connector and the IEC power inlet on the back; the front carries the status display and the single 2.5 GbE port. The UCI replaces the ISP modem so UniFi can see signal levels and reboot it.'},
 {id:'C2',from:['UCI','p',0],to:['UDM','wan'],speed:'1G',a:'UCI · front 2.5 GbE port',b:'UDM Pro · port 9 RJ45 WAN',len:'0.15 m Etherlighting',why:'The UCI port sits almost directly under the UDM Pro WAN jack, so this is the shortest cord in the rack. Port 9 is 1 GbE WAN and your cable tier is at or under 1 Gbps, so nothing is lost. Above 1 Gbps you move this to SFP+ port 10 with a multi-gig module.'},
 {id:'C3',from:['SW','sfp',1],to:['UDM','sfp',1],speed:'10G',a:'USW Pro Max · port 26 SFP+ (rightmost)',b:'UDM Pro · port 11 SFP+ LAN',len:'0.5 m DAC',why:'The trunk. Every WAN flow, the seedbox WireGuard tunnel, every Cloudflare tunnel session, and all future inter-VLAN routing crosses here. A 10 G DAC means this link is never the bottleneck. Port 25 stays free for a future 10 G NAS.'},
 {id:'C4',from:['SRV','nic'],to:['PP','rear',0],speed:'2.5G',a:'Proxmox host · RTL8126 5GbE (rear I/O)',b:'Patch panel · coupler 1 (rear)',len:'1 m · rear channel',why:'Verified live: the host NIC is a 5 GbE Realtek RTL8126 currently negotiated to 1000 Mb/s on the TP-Link. It lands on a keystone coupler in the back of slot 1, which is patched to switch port 1 (2.5 GbE PoE++), so it links at 2.5 GbE. Jellyfin, NFS to the tank, MC and PZ servers, and every rsync deploy from the Mac all live behind this one cable.'},
 {id:'C5',from:['GPC','nic'],to:['PP','rear',1],speed:'2.5G',a:'Gaming PC · onboard 2.5 GbE (rear I/O)',b:'Patch panel · coupler 2 (rear)',len:'2 m · rear channel',why:'Coupler in slot 2, patched to switch port 2. Gaming PC to server copies and Jellyfin streams switch locally at 2.5 GbE without touching the router. Longest cord in the rack because the RM51 is at the bottom.'},
 {id:'C6',from:['SPC','nic'],to:['PP','rear',2],speed:'2.5G',a:"Sam's PC · onboard 2.5 GbE (rear I/O)",b:'Patch panel · coupler 3 (rear)',len:'1.5 m · rear channel',why:'Coupler in slot 3, patched to switch port 3. If the board is only 1 GbE it links at 1 GbE on the same port; no reason to burn a multi-gig port elsewhere.'},
 {id:'P1',multi:[[0,0]],speed:'2.5G',a:'Patch panel · slot 1 (server)',b:'USW Pro Max · port 1 (2.5 GbE PoE++)',len:'0.15 m Etherlighting',why:'Panel slot 1 to switch port 1. With every slot patched 1:1, the panel number IS the switch port number, so the port map and the wall labels never disagree.'},
 {id:'P2',multi:[[1,1]],speed:'2.5G',a:'Patch panel · slot 2 (gaming PC)',b:'USW Pro Max · port 2 (2.5 GbE PoE++)',len:'0.15 m Etherlighting',why:'Panel slot 2 to switch port 2.'},
 {id:'P3',multi:[[2,2]],speed:'2.5G',a:"Patch panel · slot 3 (Sam's PC)",b:'USW Pro Max · port 3 (2.5 GbE PoE++)',len:'0.15 m Etherlighting',why:'Panel slot 3 to switch port 3.'},
 {id:'P4',multi:[[3,3]],speed:'2.5G',a:'Patch panel · slot 4 (AP drop)',b:'USW Pro Max · port 4 (2.5 GbE PoE++)',len:'0.15 m Etherlighting',why:'The U7 Pro access point has a 2.5 GbE uplink and is PoE powered through this port. This replaces the TP-Link radio.'},
 {id:'P5-8',multi:[[4,4],[5,5],[6,6],[7,7]],speed:'OFF',a:'Patch panel · slots 5 to 8',b:'USW Pro Max · ports 5 to 8 (2.5 GbE PoE++)',len:'4 x 0.15 m Etherlighting',why:'Patched now, no link yet. These are the remaining multi-gig PoE++ ports, reserved for more APs, cameras, or a 2.5 GbE dock. Etherlighting stays dark until something links.'},
 {id:'P9',multi:[[8,8]],speed:'1G',a:'Patch panel · slot 9 (TV)',b:'USW Pro Max · port 9 (1 GbE PoE+)',len:'0.15 m Etherlighting',why:'The Apple TV running Prime pulls a 4K Jellyfin stream at well under 100 Mbps. A gigabit port is the right spend.'},
 {id:'P10',multi:[[9,9]],speed:'1G',a:'Patch panel · slot 10 (office)',b:'USW Pro Max · port 10 (1 GbE PoE+)',len:'0.15 m Etherlighting',why:'Reserved for a wired Mac dock at the desk. Runs at gigabit until a dock with a 2.5 GbE NIC shows up, then move it to slot 5.'},
 {id:'A0',from:['PDU','inlet'],to:['ENTRY',4],speed:'AC',a:'Wall receptacle',b:'PDU · L5-20P inlet cord',len:'12 ft, out the top access',why:'The PDUMH20 ships with a twist-lock L5-20P plug and an adapter. Put it on a dedicated 20 A circuit if you can; on a shared 15 A circuit keep the meter under 12 A continuous. Estimated worst case for this rack is around 11 to 12 A: two gaming-class PCs at full load, the 9950X3D server, and 120 W of network gear plus PoE.'},
 {id:'A1',from:['SW','iec'],to:['PDU','out',0],speed:'AC',a:'USW Pro Max · rear IEC',b:'PDU · rear outlet 1',len:'0.5 m C13',why:'Network gear on outlets 1 to 3 so the meter reads the rack in a sensible order. The switch draws the most of the three once PoE devices hang off it.'},
 {id:'A2',from:['UDM','iec'],to:['PDU','out',1],speed:'AC',a:'UDM Pro · rear IEC',b:'PDU · rear outlet 2',len:'0.5 m C13',why:'Router on its own outlet. Never share it with a PC on a switched or metered-off group.'},
 {id:'A3',from:['UCI','iec'],to:['PDU','out',2],speed:'AC',a:'UCI · rear IEC',b:'PDU · rear outlet 3',len:'0.5 m C13',why:'Modem next to the router so a single power cycle of outlets 2 and 3 resets the WAN.'},
 {id:'A4',from:['SRV','psu'],to:['PDU','out',5],speed:'AC',a:'Proxmox server · PSU',b:'PDU · rear outlet 6',len:'1 m C13',why:'Server leaves a gap after the network gear. When a UPS arrives it goes below the RM51 and feeds the PDU inlet, so nothing else changes.'},
 {id:'A5',from:['SPC','psu'],to:['PDU','out',7],speed:'AC',a:"Sam's PC · PSU",b:'PDU · rear outlet 8',len:'1.5 m C13',why:'Every-other outlet spacing leaves room for any wall-wart later.'},
 {id:'A6',from:['GPC','psu'],to:['PDU','out',9],speed:'AC',a:'Gaming PC · PSU',b:'PDU · rear outlet 10',len:'2 m C13',why:'Highest single draw in the rack, so it gets the outlet farthest from the network gear. Longest AC cord, same reason as the data cord: the RM51 is at the bottom.'},
 {id:'P11-24',multi:Array.from({length:14},(_,i)=>[10+i,10+i]),speed:'OFF',a:'Patch panel · slots 11 to 24',b:'USW Pro Max · ports 11 to 24 (1 GbE PoE+)',len:'14 x 0.15 m Etherlighting',why:'Patched now, no link yet. Every future house drop is a keystone in the back of the panel and nothing else changes. Buy the 0.15 m cords as a 24-pack so the row is uniform.'}
];

const BEFORE: Cable[] = [
 {id:'B1',from:['MDM','coax'],to:['ENTRY',3],speed:'COAX',a:'Coax from the street',b:'Spectrum modem',len:'RG6',why:'Same DOCSIS feed as the plan.'},
 {id:'B2',from:['MDM','p',0],to:['TPL','wan'],speed:'1G',a:'ISP modem',b:'TP-Link WAN',len:'0.3 m',why:'Gigabit WAN. Fine for the ISP rate, but the router CPU also does NAT for the seedbox tunnel and every Cloudflare session.'},
 {id:'B3',from:['SRV','nic'],to:['TPL','p',0],speed:'1G',a:'Proxmox host · RTL8126 5GbE',b:'TP-Link LAN 1',len:'1 m',why:'The bottleneck. A 5 GbE NIC negotiated down to 1000 Mb/s because the router only has gigabit ports. Confirmed with ethtool on the host.'},
 {id:'B4',from:['GPC','nic'],to:['TPL','p',1],speed:'1G',a:'Gaming PC',b:'TP-Link LAN 2',len:'2 m',why:'Gigabit, and every LAN-to-LAN flow crosses the consumer router switch chip.'},
 {id:'B5',from:['SPC','nic'],to:['TPL','p',2],speed:'1G',a:"Sam's PC",b:'TP-Link LAN 3',len:'1.5 m',why:'Gigabit. One LAN port left for the whole rest of the house.'},
 {id:'A0',from:['PDU','inlet'],to:['ENTRY',4],speed:'AC',a:'Wall receptacle',b:'PDU · L5-20P inlet cord',len:'12 ft',why:'Same PDU, same wall circuit.'},
 {id:'A4',from:['SRV','psu'],to:['PDU','out',5],speed:'AC',a:'Proxmox server · PSU',b:'PDU · rear outlet 6',len:'1 m C13',why:'Unchanged.'},
 {id:'A5',from:['SPC','psu'],to:['PDU','out',7],speed:'AC',a:"Sam's PC · PSU",b:'PDU · rear outlet 8',len:'1.5 m C13',why:'Unchanged.'},
 {id:'A6',from:['GPC','psu'],to:['PDU','out',9],speed:'AC',a:'Gaming PC · PSU',b:'PDU · rear outlet 10',len:'2 m C13',why:'Unchanged.'}
];

export const SCHEDULE: Record<Mode, Cable[]> = { after: AFTER, before: BEFORE };
