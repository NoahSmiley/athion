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
  PCs land on keystone couplers in the back of slots 1 to 3. The DAC uses the rightmost SFP+ (port 26).
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

Verification: `node --import tsx --test src/lib/rack/routing.test.ts` checks physical cable totals, the 4/4/2 PC inventory, valid routes, the twelve PDU outlets, and shared chassis/anchor dimensions.
