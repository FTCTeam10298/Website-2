// Playback simulator: plays the ACTIVE auto one feature at a time. Motion time is a rough estimate:
//   travel time = path length / (top speed * power * shape factor),  plus a short
// settle on precise (non-through) moves; wait actions become real dwells.
// It is an estimate, not a physics sim — good enough to sanity-check timing.
import { ACTIONS } from './actions';
import { expandSteps, scopeLabel } from './blocks';
import { angDiff, effectiveReversed, fieldPose, splineSamples, type SplinePt } from './geometry';
import type { ActionStep, Auto, FieldPose } from './types';

const SIM_SETTLE = 0.35;      // s spent settling onto a precise (non-through) point

interface SegBase { i: number; loop: string; label: string; moveDur: number; dur: number }
export interface MoveSeg extends SegBase {
  kind: 'move'; poly: SplinePt[]; cum: number[]; len: number; fromH: number; toH: number;
}
export interface ActionSeg extends SegBase { kind: 'action'; pose: FieldPose }
export type Seg = MoveSeg | ActionSeg;

export interface Timeline { segs: Seg[]; total: number; start: FieldPose }
export interface SimPose extends FieldPose { seg: number }

function actionDuration(st: ActionStep) {
  if (st.type === 'sleep' || st.type === 'pulseOuttake') return Math.max(0, Number(st.ms) || 0) / 1000;
  if (st.type === 'shoot')    return 0.6;     // matches shoot(): ~100+500ms of sleeps
  if (st.type === 'farShoot') return 0.8;     // matches farShoot(): ~300+500ms
  if (st.type === 'raw')      return 0;       // loops / braces / custom lines: structural, no time
  return 0.15;                                // turret/intake/gate/shooter toggles: brief
}

// time to cover distance d at max speed v / max accel a (exact trapezoid; triangular if it never
// reaches v). a<=0 -> constant-speed d/v. Pure simulator estimate, not the real motion profile.
function travelTime(d: number, v: number, a: number) {
  if (!a || a <= 0) return d / v;
  v *= 0.88;   // real robots rarely achieve theoretical max
  a *= 0.75;   // acceleration ramp (motor spin-up, traction, battery sag)
  const accelDist = v * v / a;
  const t = d >= accelDist ? d / v + v / a : 2 * Math.sqrt(d / a);
  return t + 0.08;   // drivetrain latency
}

function polyMeta(poly: SplinePt[]) {
  const cum = [0]; let len = 0;
  for (let k = 1; k < poly.length; k++) { len += Math.hypot(poly[k].x - poly[k - 1].x, poly[k].y - poly[k - 1].y); cum.push(len); }
  return { cum, len };
}

export function posAlong(seg: MoveSeg, frac: number): SplinePt {
  const { poly, cum, len } = seg;
  if (!poly.length) return { x: 0, y: 0, h: null };
  if (len < 1e-6 || poly.length < 2) return { x: poly[0].x, y: poly[0].y, h: poly[0].h };
  const d = Math.max(0, Math.min(len, frac * len));
  let k = 1; while (k < cum.length - 1 && cum[k] < d) k++;
  const segLen = (cum[k] - cum[k - 1]) || 1, u = (d - cum[k - 1]) / segLen;
  const a = poly[k - 1], b = poly[k];
  const h = (a.h != null && b.h != null) ? a.h + angDiff(b.h, a.h) * u : null;
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, h };
}

export function buildTimeline(auto: Auto, simMaxV: number, simMaxA: number): Timeline {
  const segs: Seg[] = [];
  const maxV = Math.max(1, simMaxV || 93.2);
  const start = fieldPose(auto.start);
  let cur = start;
  expandSteps(auto.steps).forEach(item => {
    const st = item.step, loop = scopeLabel(item.scope);
    if (st.kind === 'move') {
      const tgt = fieldPose(st);
      const poly = st.move === 'goto'
        ? [{ x: cur.fx, y: cur.fy }, { x: tgt.fx, y: tgt.fy }]
        : splineSamples(cur, tgt, effectiveReversed(st, cur, tgt), st.factor);
      const { cum, len } = polyMeta(poly);
      const shape = st.move === 'goto' ? 1 : 0.85;     // spline runs ~0.7..1.0 of full -> avg ~0.85
      const v = Math.max(1, maxV * shape * Math.max(0.05, st.maxSpeed || 1));
      const moveDur = travelTime(len, v, simMaxA || 0);
      segs.push({ i: item.idx, loop, kind: 'move', poly, cum, len, fromH: cur.hdeg, toH: tgt.hdeg,
                  moveDur, dur: moveDur + (st.through ? 0 : SIM_SETTLE),
                  label: st.move === 'goto' ? 'GoTo' : 'Spline' });
      cur = tgt;
    } else {
      segs.push({ i: item.idx, loop, kind: 'action', moveDur: 0, dur: actionDuration(st), pose: { ...cur },
                  label: ACTIONS[st.type]?.gen(st) || st.type });
    }
  });
  return { segs, total: segs.reduce((a, s) => a + s.dur, 0), start };
}

export function poseAt(tl: Timeline, t: number): SimPose {
  const { segs } = tl;
  if (!segs.length) return { ...tl.start, seg: -1 };
  let acc = 0;
  for (let s = 0; s < segs.length; s++) {
    const seg = segs[s];
    if (t <= acc + seg.dur || s === segs.length - 1) {
      const local = Math.max(0, t - acc);
      if (seg.kind === 'action') return { ...seg.pose, seg: s };
      const frac = seg.moveDur > 0 ? Math.min(1, local / seg.moveDur) : 1;
      const p = posAlong(seg, frac);
      const hdeg = p.h != null ? p.h : seg.fromH + angDiff(seg.toH, seg.fromH) * frac;
      return { fx: p.x, fy: p.y, hdeg, seg: s };
    }
    acc += seg.dur;
  }
  return { ...tl.start, seg: -1 };
}

// end time of the feature after t (for "Step")
export function nextFeatureEnd(tl: Timeline, t: number) {
  let acc = 0;
  for (const seg of tl.segs) { acc += seg.dur; if (acc > t + 1e-4) return acc; }
  return tl.total;
}
