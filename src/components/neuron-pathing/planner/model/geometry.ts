import { HEAD_LEN, LOGICAL, SCALE } from './constants';
import type { FieldPose, MoveStep, PathNode, Pose, ScreenPt, Step } from './types';

// field inches -> screen (logical px)
export function f2s(fx: number, fy: number): ScreenPt {
  return { sx: fx * SCALE, sy: LOGICAL - fy * SCALE };
}
// screen -> field inches
export function s2f(sx: number, sy: number): { fx: number; fy: number } {
  return { fx: sx / SCALE, fy: (LOGICAL - sy) / SCALE };
}

export const snapXY = (n: number, snap: boolean) => snap ? Math.round(n * 2) / 2 : Math.round(n * 100) / 100;
export const snapH = (n: number) => Math.round(n);
export const fmt = (v: number | string | undefined) => {
  const n = Math.round(Number(v) * 1000) / 1000;
  return Number.isFinite(n) ? String(n) : '0';
};
export const rad = (deg: number) => deg * Math.PI / 180;

export function fieldPose(p: Pose): FieldPose { return { fx: p.x, fy: p.y, hdeg: p.h }; }

export function angDiff(b: number, a: number) {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export interface SplinePt { x: number; y: number; h?: number | null }

// Replicates Drivetrain/Spline.addPoint: a cubic Hermite curve from p1 -> p2 whose
// endpoint tangents follow the (reversed-adjusted) headings, scaled by factor*distance.
export function splineSamples(p1: FieldPose, p2: FieldPose, reversed: boolean, factor: number | undefined): SplinePt[] {
  const h1 = rad(p1.hdeg) + (reversed ? Math.PI : 0);
  const h2 = rad(p2.hdeg) + (reversed ? Math.PI : 0);
  const x1 = p1.fx, y1 = p1.fy, x2 = p2.fx, y2 = p2.fy;
  const v = (factor || 0) * Math.hypot(x2 - x1, y2 - y1);
  const dx = x1, cx = v * Math.cos(h1), bx = 3 * x2 - v * Math.cos(h2) - 2 * cx - 3 * dx, ax = x2 - bx - cx - dx;
  const dy = y1, cy = v * Math.sin(h1), by = 3 * y2 - v * Math.sin(h2) - 2 * cy - 3 * dy, ay = y2 - by - cy - dy;
  const pts: SplinePt[] = [];
  // tangent heading at each point (atan2 of the curve's derivative), matching what
  // Spline.java stores per-point and what NeuronDrive actually steers toward, not
  // just a straight-line blend of the move's start/end heading.
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const x = dx + cx * t + bx * t * t + ax * t * t * t, y = dy + cy * t + by * t * t + ay * t * t * t;
    const dxdt = cx + 2 * bx * t + 3 * ax * t * t, dydt = cy + 2 * by * t + 3 * ay * t * t;
    const h = (Math.atan2(dydt, dxdt) + (reversed ? Math.PI : 0)) * 180 / Math.PI;
    pts.push({ x, y, h });
  }
  return pts;
}

// reversed is derived, not chosen: true when the target lies behind the robot's
// heading (it must drive backwards).
export function fieldReversed(p1: FieldPose, p2: FieldPose) {
  const h = rad(p1.hdeg);
  return ((p2.fx - p1.fx) * Math.cos(h) + (p2.fy - p1.fy) * Math.sin(h)) < 0;
}

// nearest positional node before step i (start if none)
export function prevPosBase(i: number, steps: Step[], start: Pose): Pose {
  for (let k = i - 1; k >= 0; k--) {
    const st = steps[k];
    if (st.kind === 'move') return st;
  }
  return start;
}

// derive drive direction from geometry
export function reversedForStep(i: number, steps: Step[], start: Pose) {
  return fieldReversed(fieldPose(prevPosBase(i, steps, start)), fieldPose(steps[i] as MoveStep));
}

export function effectiveReversed(st: MoveStep, prev: FieldPose, cur: FieldPose) {
  return st.reversed != null ? st.reversed : fieldReversed(prev, cur);
}

// ordered list of nodes that have a position (start + move steps)
export function pathNodesOf(start: Pose, steps: Step[]): PathNode[] {
  const out: PathNode[] = [{ ...fieldPose(start), move: 'start', st: null, ref: { kind: 'start' } }];
  steps.forEach((st, i) => {
    if (st.kind === 'move') out.push({ ...fieldPose(st), move: st.move, st, ref: { kind: 'step', i } });
  });
  return out;
}

// full field-space polyline of a path (goto = endpoints, spline = sampled curve) for hit-testing
export function sampledFieldPath(start: Pose, steps: Step[]): SplinePt[] {
  const nodes = pathNodesOf(start, steps), pts: SplinePt[] = [];
  nodes.forEach((cur, i) => {
    if (i === 0 || cur.move === 'goto' || !cur.st) { pts.push({ x: cur.fx, y: cur.fy }); return; }
    const prev = nodes[i - 1];
    splineSamples(prev, cur, effectiveReversed(cur.st, prev, cur), cur.st.factor).forEach(p => pts.push(p));
  });
  return pts;
}

// squared distance from p to segment a-b (screen px)
export function distToSeg2(p: ScreenPt, a: ScreenPt, b: ScreenPt) {
  const dx = b.sx - a.sx, dy = b.sy - a.sy, L2 = dx * dx + dy * dy;
  let t = L2 ? ((p.sx - a.sx) * dx + (p.sy - a.sy) * dy) / L2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = a.sx + t * dx, cy = a.sy + t * dy;
  return (p.sx - cx) ** 2 + (p.sy - cy) ** 2;
}

// tip of a node's heading arrow, in field inches
export function headingTip(p: Pose) {
  const th = rad(p.h);
  return { x: p.x + HEAD_LEN * Math.cos(th), y: p.y + HEAD_LEN * Math.sin(th) };
}

// field point of a spline's factor handle: out along the node heading, distance grows with factor
export function factorHandleField(p: MoveStep) {
  const th = rad(p.h);
  const dist = HEAD_LEN + 10 * (p.factor != null ? p.factor : 1);
  return { x: p.x + dist * Math.cos(th), y: p.y + dist * Math.sin(th) };
}

// corners of a robot-sized box centred on a pose, in field inches
export function robotCorners(fx: number, fy: number, hdeg: number, robotW: number, robotL: number) {
  const th = rad(hdeg);
  const halfL = (robotL || 18) / 2, halfW = (robotW || 18) / 2;
  return [[halfL, halfW], [halfL, -halfW], [-halfL, -halfW], [-halfL, halfW]].map(([fwd, left]) => ({
    x: fx + fwd * Math.cos(th) - left * Math.sin(th),
    y: fy + fwd * Math.sin(th) + left * Math.cos(th),
  }));
}

// power -> colour for the velocity overlay (1=full=green, 0=slow=red)
export function speedColor(ms: number | undefined) {
  const v = Math.max(0, Math.min(1, ms == null ? 1 : ms));
  return `rgb(${Math.round(255 * (1 - v))},${Math.round(180 * v + 40)},60)`;
}
