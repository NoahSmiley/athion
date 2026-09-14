import assert from "node:assert/strict";
import test from "node:test";
import { computeAnchors, resolveRef } from "./anchors";
import { cableCount, isPeripheral, SCHEDULE } from "./cables";
import { chassisPlacement, devicesFor, FACE } from "./devices";
import { type Mode } from "./geometry";
import { routeAll } from "./routing";

for (const mode of ["before", "after"] satisfies Mode[]) {
  test(`${mode}: every physical cable resolves to a finite route between its declared ports`, () => {
    const list = SCHEDULE[mode];
    const anchors = computeAnchors(devicesFor(mode));
    const routes = routeAll(list, anchors);
    assert.equal(new Set(list.map((c) => c.id)).size, list.length);
    assert.equal(routes.length, cableCount(list));
    for (const { run, route } of routes) {
      const start = run.cable.via === "AP" ? anchors.AP.port : resolveRef(anchors, run.from);
      assert.deepEqual(route.points[0], start, run.cable.id);
      assert.deepEqual(route.points.at(-1), resolveRef(anchors, run.to), run.cable.id);
      assert(route.points.every((p) => [p.x, p.y, p.z].every(Number.isFinite)), run.cable.id);
    }
  });

  test(`${mode}: each PC has exactly the owner's specified connections`, () => {
    const list = SCHEDULE[mode];
    for (const [id, types] of [
      ["SPC", ["nic", "psu", "display", "usb"]],
      ["GPC", ["nic", "psu", "display", "usb"]],
      ["SRV", ["nic", "psu"]],
    ] as const) {
      const refs = list.flatMap((c) => [c.from, c.to]).filter((ref) => ref?.[0] === id);
      assert.deepEqual(refs.map((ref) => ref![1]).sort(), [...types].sort());
    }
    const deskRuns = list.filter(isPeripheral);
    assert.equal(deskRuns.length, 4);
    assert.deepEqual(deskRuns.map((c) => c.speed), ["HDMI", "USB-C", "DP", "USB"]);
    const anchors = computeAnchors(devicesFor(mode));
    assert.equal(anchors.SRV.display, undefined);
    assert.equal(anchors.SRV.usb, undefined);
    for (const { run, route } of routeAll(deskRuns, anchors)) {
      assert(route.points[1].z < route.points[0].z, `${run.cable.id} leaves the back of the PC`);
      assert(route.fillet > 0);
    }
  });
}

test("physical totals include all grouped spares and current router/modem power", () => {
  assert.equal(cableCount(SCHEDULE.after), 44);
  assert.equal(cableCount(SCHEDULE.before), 15);
  for (const device of ["TPL", "MDM"]) {
    assert(SCHEDULE.before.some((c) => c.from?.[0] === device && c.from[1] === "power"));
  }
});

test("PDUMH20 exposes twelve rear receptacles at the published spacing", () => {
  const anchors = computeAnchors(devicesFor("after"));
  assert.equal(anchors.PDU.out.length, 12);
  assert.equal(FACE.depth.pdu, 1.14);
  for (let i = 1; i < anchors.PDU.out.length; i++) {
    assert(Math.abs(anchors.PDU.out[i].x - anchors.PDU.out[i - 1].x - 0.302) < 1e-9);
  }
  assert.equal(anchors.PDU.p.length, 0);
  assert.match(SCHEDULE.after.find((c) => c.id === "A0")!.len, /15 ft/);
});

test("PC cable anchors follow the reconstructed chassis dimensions", () => {
  const devices = devicesFor("after");
  const anchors = computeAnchors(devices);
  for (const device of devices.filter((d) => d.kind === "rm")) {
    const placement = chassisPlacement(device);
    assert.equal(placement.width, 4.4);
    assert.equal(placement.height, device.id === "GPC" ? 2.2 : 1.76);
    const rear = placement.z - placement.depth / 2;
    assert(anchors[device.id].nic!.z < rear);
    assert(anchors[device.id].psu!.z < rear);
    for (const point of [anchors[device.id].nic!, anchors[device.id].psu!]) {
      assert(Math.abs(point.y - placement.y) <= placement.height / 2);
    }
  }
});
