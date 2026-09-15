# Rack plan (`/rack`)

Interactive 3D elevation of the homelab cabinet plus the cable schedule, rationale, bill of materials and cutover
steps. Lives behind the normal site login. Served by `src/app/rack`.

## Where things are

| Path | What | Depends on three.js? |
| --- | --- | --- |
| `src/lib/rack/geometry.ts` | Units (1 = 100 mm), cabinet dimensions, rail positions, cable lanes, `yOf(u)` | no |
| `src/lib/rack/devices.ts` | Device list per mode (`after` = UniFi plan, `before` = TP-Link today) and `FACE` port fractions | no |
| `src/lib/rack/cables.ts` | The cable schedule. One row = one routed cable = one table row | no |
| `src/lib/rack/anchors.ts` | Turns devices into world-space connection points | no |
| `src/lib/rack/routing.ts` | Turns a cable into a polyline through the cabinet's channels | no |
| `src/lib/rack/content.ts` | Prose: rationale cards, BOM, steps, note, footer, port assignments | no |
| `src/components/rack/scene/*` | Imperative three.js builders (cabinet, devices, cables) and the `RackScene` React wrapper | yes |
| `src/components/rack/*.tsx` | Page UI: `RackPlan` (state), `Schedule`, `PortMap`, `Rationale`, `Bom`, `Steps` | no |
| `src/app/rack/rack.css` | All styling, scoped under `.rack-page` | no |
| `public/rack/models/*.gltf` | Ubiquiti's own product models (UCI, UDM Pro, USW Pro Max 24 PoE, U7 Pro), Draco pre-decoded, buffers embedded | |

`three` is a plain dependency (no react-three-fiber: its current release pins React below 19.3).

## How to change things

- **Add or move a cable**: edit `SCHEDULE` in `cables.ts`. `from`/`to` are `[deviceId, anchorKind, index]`; anchor kinds are
  listed in `anchors.ts`. Routing picks a lane automatically from which side of the rack each end is on. A `multi` row
  draws several identical panel-to-switch cords under one schedule row.
- **Move a device**: change `u` (top rack unit) in `devices.ts`. Anchors, cables and Etherlighting follow.
- **Add a device**: add a `DeviceKind`, draw it in `scene/devices.ts` (`buildDevices` switch), and add its anchors in
  `anchors.ts`. If Ubiquiti publishes a GLB for it, download it from the product page, decode Draco (see below), put the
  `.gltf` under `public/rack/models`, and set `glb` on the device; `orientModel` finds the front face by geometric
  density or by a node name (`hint`), and `flip` inverts that decision.
- **Change the prose**: `content.ts`. `BOM.item`, `STEPS.body` and `NOTE_HTML` may contain inline HTML.
- **Colors and legend**: `COLORS` / `LEGEND` in `cables.ts`, CSS tokens at the top of `rack.css`.

## Model pipeline

Ubiquiti's store models are Draco-compressed GLB with WebP textures. They are decoded once offline (node + `draco3d`)
and rewritten as JSON glTF with the binary buffer embedded as a base64 data URI, so the page needs no Draco decoder and
no worker. Sizes: switch 4.5 MB, UDM Pro 6.8 MB, UCI 1.8 MB, U7 Pro 14.4 MB. If a model fails to load, `drawStandIn`
renders a to-spec silver box with the same port layout so the plan still reads.

## Facts baked into the plan (verify before changing)

- Proxmox host NIC is a Realtek RTL8126 5 GbE, read live with `ethtool`, linked at 1000 Mb/s on the TP-Link.
- Cabinet: Kendall Howard LINIER 42U, 24" deep, glass/glass doors. Usable depth ~495 mm; the RM51 body is approximately 485 mm deep before rear accessories/connectors.
- Rack order, bottom to top: RM51 gaming PC, RM44 Sam's PC, RM44 server, UCI, UDM Pro, USW Pro Max 24 PoE, patch
  panel, Tripp Lite PDUMH20 at the very top.
- Every patch panel slot is patched 1:1 to the same-numbered switch port with 0.15 m Etherlighting cords. The three
  PCs land on keystone couplers in the back of slots 17 to 19. The DAC uses the rightmost SFP+ (port 26).
- Subnet stays 192.168.0.0/24 with the gateway at .1 so no guest changes.

## Viewer and cable inventory

- Default **Equipment** view frames the populated units; **Overview** includes the full cabinet and ceiling AP. **Front** and **Rear** frame the cabinet. Camera fits respond to viewport aspect ratio. Scene layers toggle cables, labels, side panels, and doors independently. Cable tags appear on hover/selection even when the labels layer is off.
- `scene/chassis.ts` builds distinct RM44 keyed grille and RM51 recessed-pull grille with its lower control strip and two 180 mm fan forms. These are photo-reconstructed models, not manufacturer CAD; rear motherboard/GPU port positions remain schematic. `scene/dispose.ts` releases per-build geometry, materials, and textures, including late model loads after a layout switch.
- Shared `PERIPHERALS` in `cables.ts` adds four physical runs in **both** modes: D1 Sam GPU HDMI, U1 Sam USB-C hub upstream, D2 gaming GPU DisplayPort, U2 gaming USB hub upstream. The gaming USB connector and generation are unspecified.
- `DESK_ENDPOINTS` in `geometry.ts` provides off-rack markers. Their positions and PC display/USB port locations are schematic; their cable lengths are marked for measurement. No exact desk placement or USB bandwidth is assumed. Hub-to-peripheral leads and desk power are outside this rack-side inventory.
- Each interactive PC has four rack connections (power, Ethernet, video, hub upstream). The remote server has only power and Ethernet. `cableCount()` expands grouped patch-cord rows for the total.
- Current mode also includes router/modem power adapter runs B6/B7. PDU outlets 1/2 are proposed assignments, not verified current connections.
- Missing model downloads display the procedural fallback and report **Simplified models**. WebGL creation failure leaves the schedule and hardware notes usable.

## Manufacturer references for procedural hardware

- Tripp Lite PDUMH20: https://assets.tripplite.com/product-pdfs/en/pdumh20.pdf and the owner's B&H listing https://www.bhphotovideo.com/c/product/865763-REG/tripp_lite_pdumh20_2_4kw_single_phase_local_metered.html . Plain front with green two-digit meter; twelve rear 5-15/20R receptacles at 30.2 mm spacing; 15 ft attached input cord; 114 mm depth. `scene/pdu.ts` and `FACE.pdu` share the outlet layout. Meter digits are illustrative, not live telemetry. Existing outlet assignments remain; outlets 11/12 are spare.
- SilverStone RM44 product sheet: https://gzhls.at/blob/ldb/0/8/7/e/5e261094a312cf1e30778500870e203ee29b.pdf . 440 × 176 × 468 mm; triangular/star-cross perforated locking door; front I/O behind the closed door. Front 3 × 120 mm support is not a statement that those fans are installed.
- SilverStone RM51 product sheet: https://gzhls.at/blob/ldb/f/b/3/d/df764bb8e8c62cca944822f1e35ce4e7cf6b.pdf . 440 × 220 mm fascia, approximately 485 mm main chassis; removable rear cage changes overall depth. Distinct trapezoidal pull, lower power/reset/LED/USB strip and two 180 mm intake fans behind the patterned grille.
- `chassisPlacement()` is shared by chassis geometry and rear cable anchors so dimensional corrections cannot detach cables.

Verification: `node --import tsx --test src/lib/rack/*.test.ts` checks physical cable totals, the 4/4/2 PC inventory, valid routes, the twelve PDU outlets, and shared chassis/anchor dimensions.

## Socket alignment and speed paths

- `modelNode()` reads GLTFLoader's original `userData.name` (dots are stripped from `node.name`). Front orientation hints and socket lookup use this helper. Rotations around the mounted world axes keep the UCI LCD forward and AP LED down.
- `calibrateSockets()` resolves the switch port groups, SFP cages, IEC inlet, UCI RJ45/coax/IEC and AP socket from the mounted glTF geometry. The scene waits for all model loads/fallbacks before building cables. UDM is a single textured mesh: its calibrated port centers live in `FACE`, measured in an orthographic front view. Procedural ports and fallback anchors share the same layout.
- Cable connectors overlap socket mouths; short routes include clearance for the plug before their first bend. `models.test.ts` checks the actual bundled geometry with GLTFLoader-style sanitized names; routing and speed tests check the physical inventory and path limits.
- Manufacturer port map correction: Pro Max 24 PoE ports 1–8 are 1 GbE PoE+, 9–16 are 1 GbE PoE++, and 17–24 are 2.5 GbE PoE++. Planned server/gaming/Sam/AP drops now occupy panel/switch 17/18/19/20, still patched 1:1. TV/office remain 9/10. See https://techspecs.ui.com/unifi/switching/usw-pro-max-24-poe . This changes the plan only, not physical switch configuration.
- `speeds.ts` derives access/path ceilings from the cable schedule. `SpeedFlow` traces a selected device to the Internet or the server and highlights all corresponding physical cables in 3D. Same-subnet LAN paths bypass the router. Internet paths share the 1 GbE RJ45 WAN link despite the 10 GbE DAC. See https://techspecs.ui.com/unifi/cloud-gateways/udm-pro . These are ceilings, not telemetry; PC NIC capabilities, client negotiations, ISP tier and Wi-Fi throughput remain explicitly unverified where applicable.

## Owner inventory and cart

Owner confirms the UDM Pro, Pro Max switch, UCI modem and blank 24-slot panel are owned. Their screenshot contains one **U7 Pro Max** (not Pro), two Cat6 coupler 12-packs (24 couplers), one 0.15 m Etherlighting 24-pack and a $22 memory surcharge. Cart items are not purchased. `OWNED_NETWORK`, status-tagged `BOM`, and `CART_NOTE` in `content.ts` drive the inventory surfaces. The viewer remains the completed plan; the previous TP-Link layout is not a live installation assertion.

All 24 planned panel positions now use pass-through couplers, so rear runs require RJ45 ends rather than panel punch-downs. The 24-pack covers the panel front exactly; full population still requires a separate WAN cable, a 10G DAC, three rear PC leads and an AP run. TV/office drops and shortened power leads are conditional. Previously confirmed desk cables/PDU remain owned.

The U7 Pro Max uses a 2.5 GbE PoE+ uplink and has a 206 × 46 mm enclosure (https://techspecs.ui.com/unifi/wifi/u7-pro-max). Existing `u7.gltf` remains a disclosed U7 Pro shape proxy of the same envelope, not an exact Pro Max model. Coupler source: https://store.ui.com/us/en/collections/rackmount-keystone/products/uacc-keystone-coupler-c6 .

### UniFi cable length recommendations

For the current panel 17/18/19 assignments, the orthogonal side-channel model gives C4 server ~1.13 m, C6 Sam ~1.37 m and C5 gaming ~1.53 m before service slack. These are planning estimates from the schematic port locations, not physical measurements. Purchase recommendation: UniFi Etherlighting **2 m server, 2 m Sam, 3 m gaming**. A 2 m gaming lead may suit a fixed chassis; the 3 m choice reserves more slide-out slack. Confirm with string along the actual route plus desired chassis travel. This supersedes the earlier 1 m/1.5 m/2 m guess.

Keep the 0.15 m 24-pack for direct adjacent panel/switch connections; choose a separate 0.3 m Etherlighting WAN cord for more connector clearance. The shown UACC-DAC-SFP10-0.5M is the correct 10G SFP+ DAC for switch 26 → UDM LAN 11; its published minimum bend radius is 22 mm. AP/desk distances are schematic and cannot determine purchase lengths. Product references: https://techspecs.ui.com/unifi/accessories/uacc-cable-patch-el and https://store.ui.com/us/en/category/accessories-cables-dacs/collections/accessories-pro-direct-attach-cables/products/10gbps-direct-attach-cable .
