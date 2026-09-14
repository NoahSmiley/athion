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
- Cabinet: Kendall Howard LINIER 42U, 24" deep, glass/glass doors. Usable depth ~495 mm; the RM51 is 490 mm deep.
- Rack order, bottom to top: RM51 gaming PC, RM44 Sam's PC, RM44 server, UCI, UDM Pro, USW Pro Max 24 PoE, patch
  panel, Tripp Lite PDUMH20 at the very top.
- Every patch panel slot is patched 1:1 to the same-numbered switch port with 0.15 m Etherlighting cords. The three
  PCs land on keystone couplers in the back of slots 1 to 3. The DAC uses the rightmost SFP+ (port 26).
- Subnet stays 192.168.0.0/24 with the gateway at .1 so no guest changes.
