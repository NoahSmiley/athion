import assert from "node:assert/strict";
import test from "node:test";
import { SCHEDULE } from "./cables";
import { cableCeiling, networkEndpoints, speedPath } from "./speeds";
import { PORT_ASSIGNMENTS } from "./content";

test("planned 2.5 GbE paths only use ports 17–24; every panel slot stays 1:1", () => {
  const patches = SCHEDULE.after.flatMap((c) => (c.multi ?? []).map(([panel, port]) => ({ panel, port, speed: c.speed })));
  assert.equal(patches.length, 24);
  assert.equal(new Set(patches.map((p) => p.port)).size, 24);
  for (const p of patches) {
    assert.equal(p.panel, p.port);
    if (p.speed === "2.5G") assert(p.port >= 16 && p.port <= 23);
  }
  for (const endpoint of networkEndpoints("after")) {
    const feed = SCHEDULE.after.find((c) => c.id === endpoint.cables[0])!;
    const patch = SCHEDULE.after.find((c) => c.id === endpoint.cables[1])!;
    assert.equal(feed.to?.[2], patch.multi![0][0]);
    assert(PORT_ASSIGNMENTS[patch.multi![0][1] + 1]);
  }
});
test("Internet shares the 1G WAN ceiling despite 10G trunk and 2.5G clients", () => {
  for (const mode of ["before", "after"] as const) for (const device of networkEndpoints(mode)) {
    assert.equal(speedPath(mode, device.id, "internet").ceiling, 1);
  }
  assert.equal(cableCeiling("after", ["C3"]), 10);
});
test("same-subnet paths bypass WAN/router and respect the slower endpoint", () => {
  const gaming = speedPath("after", "GPC", "server");
  assert.equal(gaming.ceiling, 2.5);
  assert.deepEqual(gaming.ids, ["C5", "P2", "C4", "P1"]);
  assert.equal(speedPath("after", "OFFICE", "server").ceiling, 1);
  assert.equal(speedPath("before", "GPC", "server").ceiling, 1);
  assert.equal(speedPath("after", "SRV", "server").ceiling, null);
  assert.equal(cableCeiling("after", ["D1"]), null);
  assert.equal(cableCeiling("after", ["missing"]), null);
});
