// Cable schedule for the rack plan. Every row here becomes a routed 3D cable AND a row in the schedule table.
// Ref = [deviceId, anchorKind, index]. Anchor kinds come from `anchors.ts` (p, sfp, rear, out, wan, coax, iec, nic, psu, inlet, port).
// `multi` rows expand to several identical patch-panel-to-switch cords ([panelSlot, switchPort] pairs) that share one schedule row.
// `via: 'AP'` prefixes the run with the ceiling access point path. `ENTRY` is the cabinet's top cable access (index picks a slot).
import type { Mode } from "./geometry";

export type Speed = "10G" | "2.5G" | "1G" | "COAX" | "OFF" | "AC" | "HDMI" | "DP" | "USB-C" | "USB";
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

export const COLORS: Record<Speed, number> = { "10G": 0xe8973a, "2.5G": 0x2f8cff, "1G": 0xb8c0cc, COAX: 0xd9524f, OFF: 0x5b6472, AC: 0x68758a, HDMI: 0xb99aff, DP: 0x72d9b6, "USB-C": 0xe6c269, USB: 0xe6c269 };
export const CSS_COLORS: Record<Speed, string> = { "10G": "var(--c10)", "2.5G": "var(--c25)", "1G": "var(--c1)", COAX: "var(--ccoax)", OFF: "var(--ink2)", AC: "var(--ink2)", HDMI: "#b99aff", DP: "#72d9b6", "USB-C": "#e6c269", USB: "#e6c269" };
export const speedLabel = (k: Speed): string => (k === "COAX" ? "DOCSIS" : k === "OFF" ? "spare" : k === "AC" ? "Power" : k);
export const speedLong = (k: Speed): string => (k === "COAX" ? "DOCSIS 3.1" : k === "OFF" ? "no link yet" : k === "AC" ? "Power" : k === "DP" ? "DisplayPort" : k === "USB-C" ? "USB-C hub upstream" : k === "USB" ? "USB hub upstream" : k);
export const LEGEND: { key: Speed; label: string }[] = [
  { key: "10G", label: "10G SFP+ DAC" },
  { key: "2.5G", label: "2.5GbE copper" },
  { key: "1G", label: "1GbE copper" },
  { key: "OFF", label: "patched, no link yet" },
  { key: "COAX", label: "DOCSIS 3.1 coax" },
  { key: "AC", label: "Power" },
  { key: "HDMI", label: "HDMI" },
  { key: "DP", label: "DisplayPort" },
  { key: "USB", label: "USB / USB-C" },
];

/** Physical upstream runs reported by the owner; desk positions in the scene are schematic. */
export const PERIPHERALS: Cable[] = [
  { id: "D1", from: ["SPC", "display"], to: ["SAM_DESK", "display"], speed: "HDMI", a: "Sam's PC · graphics card HDMI", b: "Sam's display · off rack", len: "Existing · measure", why: "Dedicated HDMI cable from the graphics card to Sam's display. Separate from the USB-C hub cable. Off-rack endpoint placement is schematic; measure the installed path and service slack before replacing the cable." },
  { id: "U1", from: ["SPC", "usb"], to: ["SAM_DESK", "usb"], speed: "USB-C", a: "Sam's PC · USB-C upstream", b: "Sam's USB hub · off rack", len: "Existing · measure", why: "One USB-C upstream cable connects Sam's hub to the PC. Devices attached to that hub remain at the desk; they do not each need a separate cable back to the rack. Exact PC port placement is schematic." },
  { id: "D2", from: ["GPC", "display"], to: ["GAMING_DESK", "display"], speed: "DP", a: "Gaming PC · graphics card DisplayPort", b: "Gaming display · off rack", len: "Existing · measure", why: "Dedicated DisplayPort cable from the graphics card to the gaming display. Video is separate from the USB hub connection. Cable version, display mode, and installed length have not been specified." },
  { id: "U2", from: ["GPC", "usb"], to: ["GAMING_DESK", "usb"], speed: "USB", a: "Gaming PC · USB upstream", b: "Gaming USB hub · all peripherals", len: "Existing · measure", why: "One USB upstream cable carries the gaming PC's desk peripherals through the hub. Connector type and USB generation are unspecified; this plan does not assume USB-C, Thunderbolt, or a particular bandwidth. Exact PC port placement is schematic." },
];

export const isPeripheral = (c: Cable): boolean => ["HDMI", "DP", "USB-C", "USB"].includes(c.speed);
export const cableCount = (list: Cable[]): number => list.reduce((count, cable) => count + (cable.multi?.length ?? 1), 0);

const AFTER: Cable[] = [
 ...PERIPHERALS,
 {id:'H1',from:['ENTRY',0],via:'AP',to:['PP','rear',20],speed:'2.5G',a:'U7 Pro Max · ceiling mount',b:'Patch panel · Cat6 coupler 21 (rear)',len:'Ethernet · measure route',why:'The U7 Pro Max hangs on the ceiling outside the cabinet and is powered by PoE+ from switch port 21 through this single run. Permanent in-wall run. It enters through the LINIER top cable access, comes down the rear of the cabinet, and plugs into the Cat6 pass-through coupler in slot 21. Use an installation-appropriate cable with an RJ45 end at the panel; the cart coupler has no punch-down terminals. Nothing on the front of the panel is ever cut; you only move patch cords.'},
 {id:'H2',from:['ENTRY',1],to:['PP','rear',8],speed:'1G',a:'Living room TV jack',b:'Patch panel · Cat6 coupler 9 (rear)',len:'Ethernet · measure route',why:'Same structured-cabling rule: wall-plate keystone at one end, panel keystone at the other, tested once, never touched again. Slot 9 lands on switch port 9, a 1 GbE port.'},
 {id:'H3',from:['ENTRY',2],to:['PP','rear',9],speed:'1G',a:'Office jack',b:'Patch panel · Cat6 coupler 10 (rear)',len:'Ethernet · measure route',why:'Runs are numbered to match panel slots, and panel slots match switch ports, so the wall plate number is the switch port number. Pull two per room while the walls are open.'},
 {id:'C1',from:['UCI','coax'],to:['ENTRY',3],speed:'COAX',a:'Coax from the street',b:'UCI · rear F-connector',len:'RG6 via top access',why:'DOCSIS 3.1 from Spectrum. The UCI has the coax F-connector and the IEC power inlet on the back; the front carries the status display and the single 2.5 GbE port. The UCI replaces the ISP modem so UniFi can see signal levels and reboot it.'},
 {id:'C2',from:['UCI','p',0],to:['UDM','wan'],speed:'1G',a:'UCI · front 2.5 GbE port',b:'UDM Pro · port 9 RJ45 WAN',len:'0.3 m Etherlighting',why:'The UCI port sits almost directly under the UDM Pro WAN jack, so a 0.3 m cord leaves comfortable bend and connector clearance. Port 9 is a 1 GbE WAN link shared by all Internet traffic. The ISP download and upload rates still need verification; they may impose a lower ceiling. Above 1 Gbps you move this to SFP+ port 10 with a multi-gig module.'},
 {id:'C3',from:['SW','sfp',1],to:['UDM','sfp',1],speed:'10G',a:'USW Pro Max · port 26 SFP+ (rightmost)',b:'UDM Pro · port 11 SFP+ LAN',len:'0.5 m DAC',why:'The trunk. Every WAN flow, the seedbox WireGuard tunnel, every Cloudflare tunnel session, and all future inter-VLAN routing crosses here. The 10 Gb/s DAC provides shared headroom; each device is still limited by its own access link. Port 25 stays free for a future 10 G NAS.'},
 {id:'C4',from:['SRV','nic'],to:['PP','rear',23],speed:'2.5G',a:'Proxmox host · RTL8126 5GbE (rear I/O)',b:'Patch panel · coupler 24 (rear)',len:'2 m · UniFi Etherlighting',why:'Verified live: the host NIC is a 5 GbE Realtek RTL8126 currently negotiated to 1000 Mb/s on the TP-Link. It lands on a keystone coupler in the back of slot 24, which is patched to switch port 24 (2.5 GbE PoE++), for a planned 2.5 GbE link; verify negotiation after cutover. The modeled route is about 1.1 m before slack; choose a 2 m UniFi Etherlighting cable. Jellyfin, NFS to the tank, MC and PZ servers, and every rsync deploy from the Mac all live behind this one cable.'},
 {id:'C5',from:['GPC','nic'],to:['PP','rear',21],speed:'2.5G',a:'Gaming PC · onboard Ethernet (2.5G assumed) (rear I/O)',b:'Patch panel · coupler 22 (rear)',len:'3 m · UniFi Etherlighting',why:'Coupler in slot 22, patched to switch port 22. Gaming PC to server copies and Jellyfin streams switch locally at 2.5 GbE without touching the router. The modeled side-channel run is about 1.5 m before slack. Choose 3 m to allow a service loop for the deep RM51; 2 m is an option for fixed installation without promising full slide-out reach.'},
 {id:'C6',from:['SPC','nic'],to:['PP','rear',22],speed:'2.5G',a:"Sam's PC · onboard Ethernet (2.5G assumed) (rear I/O)",b:'Patch panel · coupler 23 (rear)',len:'2 m · UniFi Etherlighting',why:'Coupler in slot 23, patched to switch port 23. The modeled route is about 1.4 m before slack; choose a 2 m UniFi Etherlighting cable. If the board is only 1 GbE it links at 1 GbE on the same port; no reason to burn a multi-gig port elsewhere.'},
 {id:'P1',multi:[[23,23]],speed:'2.5G',a:'Patch panel · slot 24 (server)',b:'USW Pro Max · port 24 (2.5 GbE PoE++)',len:'0.15 m Etherlighting',why:'Panel slot 24 to switch port 24. With every slot patched 1:1, the panel number IS the switch port number, so the port map and the wall labels never disagree.'},
 {id:'P2',multi:[[21,21]],speed:'2.5G',a:'Patch panel · slot 22 (gaming PC)',b:'USW Pro Max · port 22 (2.5 GbE PoE++)',len:'0.15 m Etherlighting',why:'Panel slot 22 to switch port 22.'},
 {id:'P3',multi:[[22,22]],speed:'2.5G',a:"Patch panel · slot 23 (Sam's PC)",b:'USW Pro Max · port 23 (2.5 GbE PoE++)',len:'0.15 m Etherlighting',why:'Panel slot 23 to switch port 23.'},
 {id:'P4',multi:[[20,20]],speed:'2.5G',a:'Patch panel · slot 21 (AP drop)',b:'USW Pro Max · port 21 (2.5 GbE PoE++)',len:'0.15 m Etherlighting',why:'The U7 Pro Max access point has a 2.5 GbE uplink and is PoE powered through this port. This replaces the TP-Link radio.'},
 {id:'P17-20',multi:[[16,16],[17,17],[18,18],[19,19]],speed:'OFF',a:'Patch panel · slots 17 to 20',b:'USW Pro Max · ports 17 to 20 (2.5 GbE PoE++)',len:'4 x 0.15 m Etherlighting',why:'Planned spare patch cords, no endpoint assigned. These are the remaining multi-gig PoE++ ports, reserved for more APs, cameras, or a 2.5 GbE dock. Etherlighting stays dark until something links.'},
 {id:'P9',multi:[[8,8]],speed:'1G',a:'Patch panel · slot 9 (TV)',b:'USW Pro Max · port 9 (1 GbE PoE++)',len:'0.15 m Etherlighting',why:'The Apple TV running Prime pulls a 4K Jellyfin stream at well under 100 Mbps. A gigabit port is the right spend.'},
 {id:'P10',multi:[[9,9]],speed:'1G',a:'Patch panel · slot 10 (office)',b:'USW Pro Max · port 10 (1 GbE PoE++)',len:'0.15 m Etherlighting',why:'Reserved for a wired Mac dock at the desk. Runs at gigabit unless a dock with a 2.5 GbE NIC is added, then move it to slot 21.'},
 {id:'A0',from:['PDU','inlet'],to:['ENTRY',4],speed:'AC',a:'Wall receptacle',b:'PDU · L5-20P inlet cord',len:'15 ft, out the top access',why:'The PDUMH20 ships with a twist-lock L5-20P plug and an adapter. Put it on a dedicated 20 A circuit if you can; on a shared 15 A circuit keep the meter under 12 A continuous. Estimated worst case for this rack is around 11 to 12 A: two gaming-class PCs at full load, the 9950X3D server, and 120 W of network gear plus PoE.'},
 {id:'A1',from:['SW','iec'],to:['PDU','out',0],speed:'AC',a:'USW Pro Max · rear IEC',b:'PDU · rear outlet 1',len:'0.5 m C13',why:'Network gear on outlets 1 to 3 so the meter reads the rack in a sensible order. The switch draws the most of the three once PoE devices hang off it.'},
 {id:'A2',from:['UDM','iec'],to:['PDU','out',1],speed:'AC',a:'UDM Pro · rear IEC',b:'PDU · rear outlet 2',len:'0.5 m C13',why:'Router on its own outlet. Never share it with a PC on a switched or metered-off group.'},
 {id:'A3',from:['UCI','iec'],to:['PDU','out',2],speed:'AC',a:'UCI · rear IEC',b:'PDU · rear outlet 3',len:'0.5 m C13',why:'Modem next to the router so a single power cycle of outlets 2 and 3 resets the WAN.'},
 {id:'A4',from:['SRV','psu'],to:['PDU','out',5],speed:'AC',a:'Proxmox server · PSU',b:'PDU · rear outlet 6',len:'1 m C13',why:'Server leaves a gap after the network gear. When a UPS arrives it goes below the RM51 and feeds the PDU inlet, so nothing else changes.'},
 {id:'A5',from:['SPC','psu'],to:['PDU','out',7],speed:'AC',a:"Sam's PC · PSU",b:'PDU · rear outlet 8',len:'1.5 m C13',why:'Every-other outlet spacing leaves room for any wall-wart later.'},
 {id:'A6',from:['GPC','psu'],to:['PDU','out',9],speed:'AC',a:'Gaming PC · PSU',b:'PDU · rear outlet 10',len:'2 m C13',why:'Highest single draw in the rack, so it gets the outlet farthest from the network gear. Longest AC cord, same reason as the data cord: the RM51 is at the bottom.'},
 {id:'P1-8/11-16',multi:[...Array.from({length:8},(_,i)=>[i,i] as [number,number]),...Array.from({length:6},(_,i)=>[10+i,10+i] as [number,number])],speed:'OFF',a:'Patch panel · slots 1–8 and 11–16',b:'USW Pro Max · ports 1–8 and 11–16 (1 GbE)',len:'14 x 0.15 m Etherlighting',why:'Planned spare patch cords, no endpoint assigned. Future drops plug into the Cat6 couplers on the rear of the panel. Buy the 0.15 m cords as a 24-pack so the row is uniform.'}
];

const BEFORE: Cable[] = [
 ...PERIPHERALS,
 {id:'B1',from:['MDM','coax'],to:['ENTRY',3],speed:'COAX',a:'Coax from the street',b:'Spectrum modem',len:'RG6',why:'Same DOCSIS feed as the plan.'},
 {id:'B2',from:['MDM','p',0],to:['TPL','wan'],speed:'1G',a:'ISP modem',b:'TP-Link WAN',len:'0.3 m',why:'Gigabit WAN. Fine for the ISP rate, but the router CPU also does NAT for the seedbox tunnel and every Cloudflare session.'},
 {id:'B3',from:['SRV','nic'],to:['TPL','p',0],speed:'1G',a:'Proxmox host · RTL8126 5GbE',b:'TP-Link LAN 1',len:'1 m',why:'The bottleneck. A 5 GbE NIC negotiated down to 1000 Mb/s because the router only has gigabit ports. Confirmed with ethtool on the host.'},
 {id:'B4',from:['GPC','nic'],to:['TPL','p',1],speed:'1G',a:'Gaming PC',b:'TP-Link LAN 2',len:'2 m',why:'Gigabit, and every LAN-to-LAN flow crosses the consumer router switch chip.'},
 {id:'B5',from:['SPC','nic'],to:['TPL','p',2],speed:'1G',a:"Sam's PC",b:'TP-Link LAN 3',len:'1.5 m',why:'Gigabit. One LAN port left for the whole rest of the house.'},
 {id:'B6',from:['TPL','power'],to:['PDU','out',0],speed:'AC',a:'TP-Link router · power adapter',b:'PDU · outlet 1 (proposed)',len:'Existing · measure',why:'Includes the router power adapter and its lead. The original current-layout schedule omitted this power connection. Outlet 1 is a planning assignment; confirm the installed outlet and adapter clearance.'},
 {id:'B7',from:['MDM','power'],to:['PDU','out',1],speed:'AC',a:'Spectrum modem · power adapter',b:'PDU · outlet 2 (proposed)',len:'Existing · measure',why:'Includes the modem power adapter and its lead. Outlet 2 is a planning assignment; confirm the installed outlet and adapter clearance.'},
 {id:'A0',from:['PDU','inlet'],to:['ENTRY',4],speed:'AC',a:'Wall receptacle',b:'PDU · L5-20P inlet cord',len:'15 ft',why:'Same PDU, same wall circuit.'},
 {id:'A4',from:['SRV','psu'],to:['PDU','out',5],speed:'AC',a:'Proxmox server · PSU',b:'PDU · rear outlet 6',len:'1 m C13',why:'Unchanged.'},
 {id:'A5',from:['SPC','psu'],to:['PDU','out',7],speed:'AC',a:"Sam's PC · PSU",b:'PDU · rear outlet 8',len:'1.5 m C13',why:'Unchanged.'},
 {id:'A6',from:['GPC','psu'],to:['PDU','out',9],speed:'AC',a:'Gaming PC · PSU',b:'PDU · rear outlet 10',len:'2 m C13',why:'Unchanged.'}
];

export const SCHEDULE: Record<Mode, Cable[]> = { after: AFTER, before: BEFORE };
