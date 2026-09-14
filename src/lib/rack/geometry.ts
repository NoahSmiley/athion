// Scene units and cabinet geometry. 1 unit = 100 mm. Everything in the rack plan derives from these numbers,
// so a different cabinet or rail setting is a one-line change here.

export type Mode = "after" | "before";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}
export const v3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

/** One rack unit, 44.45 mm. */
export const U = 0.4445;
/** Width of a 19" device face, 442.4 mm. */
export const W19 = 4.424;
/** Cabinet height in rack units. Kendall Howard LINIER 42U. */
export const TOP = 42;

/** Kendall Howard LINIER 42U: 24" x 24" footprint, glass front and rear doors, solid side panels. */
export const CW = 6.1;
export const CD = 6.1;
export const CH = TOP * U + 0.55;

/** z of the front mounting rail (just behind the door). */
export const FR = CD / 2 - 0.62;
/** z of the rear rail, set fully back: about 495 mm of usable depth. */
export const RR = FR - 4.95;

/** Vertical cable lanes run in the gap between the rails and the side panels. */
export const LANE = W19 / 2 + 0.36;

/** Bottom y of rack unit `u` (u = 1 is the top unit). */
export const yOf = (u: number): number => (TOP - u) * U + 0.25;

/** Where the ceiling-mounted U7 Pro hangs, outside the cabinet to its left. */
export const AP_POS: Vec3 = v3(-7.2, CH + 2.4, -0.8);

/** Slots in the cabinet's top rear cable access (house runs, coax, PDU cord). */
export const ENTRY_POINTS: Vec3[] = [0, 1, 2, 3, 4].map((i) => v3(-0.9 + i * 0.28, CH + 0.6, -CD / 2 + 0.75));

/** Anything behind this z counts as a rear connection for routing purposes. */
export const isRear = (p: Vec3): boolean => p.z < FR - 0.3;
