// Orthogonal cable routing. Each cable becomes a polyline through the cabinet's cable channels; the scene
// turns that polyline into a tube with filleted corners. Pure functions, no three.js, so the routes are testable.
import { AP_POS, CH, FR, LANE, RR, U, isRear, type Vec3, v3 } from "./geometry";
import type { AnchorMap } from "./anchors";
import { resolveRef } from "./anchors";
import type { Cable, Ref } from "./cables";

export interface Run {
  cable: Cable;
  from: Ref;
  to: Ref;
  /** True for the first run of a multi-cord row (the one that carries the tag). */
  tagged: boolean;
}

/** Expand `multi` rows into one run per cord. */
export function expandRuns(list: Cable[]): Run[] {
  const runs: Run[] = [];
  for (const c of list) {
    if (c.multi) c.multi.forEach(([i, j], k) => runs.push({ cable: c, from: ["PP", "p", i], to: ["SW", "p", j], tagged: k === 0 }));
    else runs.push({ cable: c, from: c.from!, to: c.to!, tagged: true });
  }
  return runs;
}

export interface Route {
  points: Vec3[];
  /** Where the speed tag sits. */
  mid: Vec3;
  /** Corner radius for the fillets. Short cords get tight bends. */
  fillet: number;
}

/** Per-build counters that spread parallel cables across a lane. Create one per `routeAll` call. */
export interface LaneState {
  front: number;
  back: number;
  side: number;
  power: number;
}
export const newLanes = (): LaneState => ({ front: 0, back: 0, side: 0, power: 0 });

const OUT = 0.26;

export function routeRun(run: Run, anchors: AnchorMap, lanes: LaneState): Route {
  const c = run.cable;
  const a = resolveRef(anchors, run.from);
  const b = resolveRef(anchors, run.to);
  const ac = c.speed === "AC";

  if (run.to[0] === "ENTRY") {
    // rear port -> back to the rear channel, up, out through the top access
    const lane = ac ? LANE + 0.12 : -LANE;
    const z = ac ? RR + 0.22 : RR + 0.45;
    return {
      points: [a, v3(a.x, a.y, z), v3(lane, a.y, z), v3(lane, b.y - 0.6, z), v3(b.x, b.y - 0.6, b.z), b],
      mid: v3(lane, (a.y + b.y) / 2, z),
      fillet: 0.14,
    };
  }
  if (run.from[0] === "ENTRY") {
    // house run: down from the top access along the right rear channel into the back of the patch panel
    const lane = LANE;
    const z = RR + 0.45 + lanes.side * 0.06;
    lanes.side++;
    const pre: Vec3[] = c.via === "AP" ? [{ ...(anchors.AP?.port ?? AP_POS) }, v3(AP_POS.x, CH + 2.7, AP_POS.z), v3(a.x, CH + 2.7, a.z)] : [];
    return {
      points: [...pre, a, v3(a.x, a.y - 0.6, a.z), v3(lane, a.y - 0.6, z), v3(lane, b.y, z), v3(b.x, b.y, z), b],
      mid: v3(lane, b.y - 1.0, z),
      fillet: 0.14,
    };
  }
  if (isRear(a) && !isRear(b)) {
    // rear port -> front port: rear channel, up the side gap, forward, across the front
    const lane = -(LANE + lanes.back * 0.07);
    lanes.back++;
    const zb = RR + 0.35 - lanes.back * 0.03;
    const zf = FR + OUT + lanes.back * 0.03;
    return {
      points: [a, v3(a.x, a.y, zb), v3(lane, a.y, zb), v3(lane, b.y, zb), v3(lane, b.y, zf), v3(b.x, b.y, zf), b],
      mid: v3(lane, (a.y + b.y) / 2, zb),
      fillet: 0.14,
    };
  }
  if (isRear(a) && isRear(b) && ac) {
    // power cords: right rear channel, shallower than data
    const lane = LANE + 0.12 + lanes.power * 0.06;
    lanes.power++;
    const z = RR + 0.22;
    return { points: [a, v3(a.x, a.y, z), v3(lane, a.y, z), v3(lane, b.y, z), v3(b.x, b.y, z), b], mid: v3(lane, (a.y + b.y) / 2, z), fillet: 0.14 };
  }
  if (isRear(a) && isRear(b)) {
    const lane = -(LANE + lanes.back * 0.07);
    lanes.back++;
    const z = RR + 0.35;
    return { points: [a, v3(a.x, a.y, z), v3(lane, a.y, z), v3(lane, b.y, z), v3(b.x, b.y, z), b], mid: v3(lane, (a.y + b.y) / 2, z), fillet: 0.14 };
  }
  if (Math.abs(a.y - b.y) < U * 1.6) {
    // short cord between adjacent units: straight out of the jack, straight to the other jack, in. No dog-legs.
    const z = FR + 0.13;
    return { points: [a, v3(a.x, a.y, z), v3(b.x, b.y, z), b], mid: v3((a.x + b.x) / 2, (a.y + b.y) / 2, z + 0.05), fillet: 0.06 };
  }
  // front -> front across several units: right-hand front channel
  const lane = LANE + lanes.front * 0.07;
  lanes.front++;
  const z = FR + OUT + lanes.front * 0.03;
  return { points: [a, v3(a.x, a.y, z), v3(lane, a.y, z), v3(lane, b.y, z), v3(b.x, b.y, z), b], mid: v3(lane, (a.y + b.y) / 2, z), fillet: 0.14 };
}

export function routeAll(list: Cable[], anchors: AnchorMap): { run: Run; route: Route }[] {
  const lanes = newLanes();
  return expandRuns(list).map((run) => ({ run, route: routeRun(run, anchors, lanes) }));
}
