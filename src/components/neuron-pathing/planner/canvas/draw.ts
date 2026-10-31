import { CX, CY, FIELD, HALF, LOGICAL, NEIGH_COLORS } from '../model/constants';
import {
  effectiveReversed, f2s, factorHandleField, headingTip, pathNodesOf, robotCorners, speedColor, splineSamples,
} from '../model/geometry';
import { posAlong, poseAt, type Timeline } from '../model/simulator';
import { activeAuto, shownNeighbors } from '../model/stepOps';
import type { PathNode, PlannerState, Pose, Selection } from '../model/types';

// screen-space pan/zoom applied at the canvas level (runtime-only; not saved/undone).
// f2s/s2f stay in base-logical coords; drawScene bakes the view in via setTransform.
export interface View { scale: number; ox: number; oy: number }

// theme colours read from CSS custom properties, so the canvas tracks light/dark
export interface SceneColors {
  field: string; gridAxis: string; gridLine: string; fieldOverlay: string; robotStroke: string;
}

export interface SceneArgs {
  state: PlannerState;
  view: View;
  dpr: number;
  bgImg: HTMLImageElement | null;
  colors: SceneColors;
  sim: { active: boolean; t: number; timeline: Timeline };
}

type Ctx = CanvasRenderingContext2D;

export function isSel(sel: Selection, kind: 'start' | 'step', i?: number) {
  if (!sel) return false;
  return kind === 'start' ? sel.kind === 'start' : sel.kind === 'step' && sel.i === i;
}

// the selection IF it maps to a node on the field (start or a move step), else null.
// drives "focus mode": dim + lock every other waypoint until one is picked from the steps list.
export function selNodeRef(s: PlannerState): Selection {
  const sel = s.selected;
  if (!sel) return null;
  if (sel.kind === 'start') return sel;
  return activeAuto(s).steps[sel.i]?.kind === 'move' ? sel : null;
}

function selectedNodeIdx(s: PlannerState, nodes: PathNode[]) {
  const sel = selNodeRef(s);
  if (!sel) return -1;
  return nodes.findIndex(nd => nd.ref.kind === sel.kind && (sel.kind === 'start' || (nd.ref.kind === 'step' && nd.ref.i === sel.i)));
}

function fillFieldPoly(ctx: Ctx, pts: [number, number][]) {
  ctx.beginPath();
  pts.forEach((p, i) => { const s = f2s(p[0], p[1]); if (i) ctx.lineTo(s.sx, s.sy); else ctx.moveTo(s.sx, s.sy); });
  ctx.closePath(); ctx.fill();
}

function tracePoly(ctx: Ctx, pts: { x: number; y: number }[]) {
  ctx.beginPath();
  pts.forEach((p, i) => { const s = f2s(p.x, p.y); if (i) ctx.lineTo(s.sx, s.sy); else ctx.moveTo(s.sx, s.sy); });
}

function drawNode(ctx: Ctx, colors: SceneColors, p: Pose, color: string, label: string, selected: boolean, dimmed: boolean) {
  ctx.save();
  if (dimmed) ctx.globalAlpha = 0.3;
  const s = f2s(p.x, p.y), t = headingTip(p), tip = f2s(t.x, t.y);
  ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(s.sx, s.sy); ctx.lineTo(tip.sx, tip.sy); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(tip.sx, tip.sy, 4, 0, 7); ctx.fill();      // arrow handle
  if (selected) {
    ctx.strokeStyle = colors.gridAxis; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s.sx, s.sy, 10, 0, 7); ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(s.sx, s.sy, 7, 0, 7); ctx.fill();
  ctx.fillStyle = '#04121f'; ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, s.sx, s.sy);
  ctx.textBaseline = 'alphabetic';
  if (p.locked) {                                  // locked: muted dashed ring + 🔒
    ctx.strokeStyle = 'rgba(200,200,200,0.8)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.arc(s.sx, s.sy, 11, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '9px sans-serif'; ctx.fillStyle = '#e6edf3'; ctx.fillText('🔒', s.sx + 12, s.sy - 10);
  }
  ctx.restore();
}

function drawRobotBox(ctx: Ctx, colors: SceneColors, state: PlannerState, p: Pose, dimmed: boolean) {
  ctx.save();
  if (dimmed) ctx.globalAlpha = 0.3;
  ctx.strokeStyle = colors.robotStroke; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
  tracePoly(ctx, robotCorners(p.x, p.y, p.h, state.robotW, state.robotL));
  ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}

interface PathOpts { faded?: boolean; color?: string; speed?: boolean; focusIdx?: number }

// dashed line for goToPoint, real curved spline for splines
function drawPath(ctx: Ctx, nodes: PathNode[], opts: PathOpts) {
  ctx.save();
  const baseAlpha = opts.faded ? 0.5 : 1;
  const hasFocus = opts.focusIdx != null && opts.focusIdx >= 0;
  ctx.lineWidth = opts.faded ? 2.5 : 3;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1], cur = nodes[i], st = cur.st!;
    // focus mode: only the two segments touching the selected node stay bright
    const dim = hasFocus && i !== opts.focusIdx && i !== opts.focusIdx! + 1;
    ctx.globalAlpha = baseAlpha * (dim ? 0.25 : 1);
    ctx.strokeStyle = opts.faded ? (opts.color || '#8b949e')
      : opts.speed ? speedColor(st.maxSpeed)
      : cur.move === 'goto' ? 'rgba(240,136,62,0.85)' : 'rgba(88,166,255,0.9)';
    if (cur.move === 'goto') {
      ctx.setLineDash(opts.faded ? [4, 4] : [7, 5]);
      const A = f2s(prev.fx, prev.fy), B = f2s(cur.fx, cur.fy);
      ctx.beginPath(); ctx.moveTo(A.sx, A.sy); ctx.lineTo(B.sx, B.sy); ctx.stroke(); ctx.setLineDash([]);
    } else {
      ctx.setLineDash([]);
      tracePoly(ctx, splineSamples(prev, cur, effectiveReversed(st, prev, cur), st.factor));
      ctx.stroke();
    }
  }
  ctx.restore();
}

// spline factor handle (selected spline only): dashed lead + draggable diamond
function drawFactorHandle(ctx: Ctx, state: PlannerState) {
  const sel = state.selected;
  if (!sel || sel.kind !== 'step') return;
  const st = activeAuto(state).steps[sel.i];
  if (!st || st.kind !== 'move' || st.move !== 'spline' || st.locked) return;
  const nS = f2s(st.x, st.y), p = factorHandleField(st), s = f2s(p.x, p.y);
  ctx.strokeStyle = 'rgba(210,153,34,0.9)'; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
  ctx.beginPath(); ctx.moveTo(nS.sx, nS.sy); ctx.lineTo(s.sx, s.sy); ctx.stroke(); ctx.setLineDash([]);
  const R = 9;                                   // bigger, easier-to-grab diamond
  ctx.fillStyle = '#d29922'; ctx.strokeStyle = '#1a0d02'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(s.sx, s.sy - R); ctx.lineTo(s.sx + R, s.sy); ctx.lineTo(s.sx, s.sy + R); ctx.lineTo(s.sx - R, s.sy);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1a0d02'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('f', s.sx, s.sy); ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#d29922'; ctx.textAlign = 'left';
  ctx.fillText((st.factor != null ? st.factor : 1).toString(), s.sx + R + 3, s.sy + 3);
}

function drawFieldRobot(ctx: Ctx, state: PlannerState, fx: number, fy: number, hdeg: number, color: string) {
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(63,185,80,0.18)'; ctx.strokeStyle = color; ctx.lineWidth = 2;
  tracePoly(ctx, robotCorners(fx, fy, hdeg, state.robotW, state.robotL));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  const c0 = f2s(fx, fy), t = headingTip({ x: fx, y: fy, h: hdeg }), tip = f2s(t.x, t.y);
  ctx.beginPath(); ctx.moveTo(c0.sx, c0.sy); ctx.lineTo(tip.sx, tip.sy); ctx.stroke();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(c0.sx, c0.sy, 4, 0, 7); ctx.fill();
}

function drawSimRobot(ctx: Ctx, state: PlannerState, timeline: Timeline, t: number) {
  const { segs } = timeline;
  if (!segs.length) return;
  // traveled trail up to current time
  ctx.strokeStyle = 'rgba(63,185,80,0.95)'; ctx.lineWidth = 3; ctx.setLineDash([]);
  ctx.beginPath();
  let started = false, acc = 0;
  const to = (x: number, y: number) => {
    const p = f2s(x, y);
    if (started) ctx.lineTo(p.sx, p.sy); else { ctx.moveTo(p.sx, p.sy); started = true; }
  };
  for (let s = 0; s < segs.length && t > acc; s++) {
    const seg = segs[s];
    if (seg.kind === 'move' && seg.poly.length) {
      const frac = t >= acc + seg.dur ? 1 : (seg.moveDur > 0 ? Math.min(1, (t - acc) / seg.moveDur) : 1);
      const d = frac * seg.len;
      for (let k = 0; k < seg.poly.length && seg.cum[k] <= d; k++) to(seg.poly[k].x, seg.poly[k].y);
      const ep = posAlong(seg, frac);
      to(ep.x, ep.y);
    }
    acc += seg.dur;
  }
  ctx.stroke();
  // robot at current pose
  const ps = poseAt(timeline, t);
  drawFieldRobot(ctx, state, ps.fx, ps.fy, ps.hdeg, '#3fb950');
  // banner for a dwell action (sleep / shoot / ...)
  const seg = segs[Math.max(0, ps.seg)];
  if (seg && seg.kind === 'action' && seg.dur > 0.001) {
    const s = f2s(ps.fx, ps.fy);
    ctx.font = 'bold 12px ui-monospace,Consolas,monospace'; ctx.textAlign = 'center';
    const txt = seg.label, w = ctx.measureText(txt).width + 12;
    ctx.fillStyle = 'rgba(14,17,22,0.85)';
    ctx.fillRect(s.sx - w / 2, s.sy - 34, w, 18);
    ctx.fillStyle = '#3fb950'; ctx.fillText(txt, s.sx, s.sy - 21);
  }
}

export function drawScene(ctx: Ctx, { state, view, dpr, bgImg, colors, sim }: SceneArgs) {
  const auto = activeAuto(state);
  ctx.setTransform(1, 0, 0, 1, 0, 0);                 // clear/fill the whole device canvas first
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = colors.field; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.ox, dpr * view.oy);

  // Field image rotated to ALIGN with the grid. The grid/path coordinate system
  // never rotates; only the image is spun (and optionally flipped) to fit it.
  if (state.bgShow && bgImg && bgImg.complete && bgImg.naturalWidth) {
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(((state.bgRot || 0) + 90) * Math.PI / 180);   // +90: field view is rotated CW
    if (state.bgFlip) ctx.scale(-1, 1);
    ctx.drawImage(bgImg, -LOGICAL / 2, -LOGICAL / 2, LOGICAL, LOGICAL);
    ctx.restore();
    // gentle wash so grid lines and the path stay readable on top
    ctx.fillStyle = colors.fieldOverlay; ctx.fillRect(0, 0, LOGICAL, LOGICAL);
  }

  // grid (24" tiles)
  if (state.showGrid) {
    ctx.lineWidth = 1;
    for (let i = 0; i <= FIELD; i += 24) {
      const a = f2s(i, FIELD), b = f2s(i, 0);
      ctx.strokeStyle = i === HALF ? colors.gridAxis : colors.gridLine;
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      const c = f2s(FIELD, i), d = f2s(0, i);
      ctx.beginPath(); ctx.moveTo(c.sx, c.sy); ctx.lineTo(d.sx, d.sy); ctx.stroke();
    }
  }

  // launch / park zones: with c = 72 (field centre),
  // pointInZone = (x<=c && |y-c|<=c-x) || (x>=c+48 && |y-c|<=x-c-48)
  if (state.showZones) {
    ctx.fillStyle = 'rgba(88,166,255,0.08)';
    fillFieldPoly(ctx, [[HALF, HALF], [0, FIELD], [0, 0]]);                   // left triangle
    fillFieldPoly(ctx, [[HALF + 48, HALF], [FIELD, FIELD - 48], [FIELD, 48]]); // right triangle
  }

  // neighbouring autos faded underneath (Compare slider), each its own colour
  shownNeighbors(state).forEach((ai, k) =>
    drawPath(ctx, pathNodesOf(state.autos[ai].start, state.autos[ai].steps),
             { faded: true, color: NEIGH_COLORS[k % NEIGH_COLORS.length] }));

  // active path; with a waypoint selected, segments not touching it are dimmed (focus mode)
  const nodes = pathNodesOf(auto.start, auto.steps);
  const focusIdx = selectedNodeIdx(state, nodes);
  const dimOthers = focusIdx >= 0;
  drawPath(ctx, nodes, { speed: state.showSpeed, focusIdx });

  const sel = state.selected;
  drawNode(ctx, colors, auto.start, '#3fb950', 'S', isSel(sel, 'start'), dimOthers && !isSel(sel, 'start'));
  let n = 0;
  auto.steps.forEach((st, i) => {
    if (st.kind !== 'move') return;
    n++;
    drawNode(ctx, colors, st, st.move === 'goto' ? '#f0883e' : '#58a6ff', String(n),
             isSel(sel, 'step', i), dimOthers && !isSel(sel, 'step', i));
  });

  drawFactorHandle(ctx, state);

  // robot footprint (configurable in inches) at start + every move node
  if (state.showRobot) {
    drawRobotBox(ctx, colors, state, auto.start, dimOthers && !isSel(sel, 'start'));
    auto.steps.forEach((st, i) => {
      if (st.kind === 'move') drawRobotBox(ctx, colors, state, st, dimOthers && !isSel(sel, 'step', i));
    });
  }

  // simulated robot overlay (only while a simulation is engaged)
  if (sim.active) drawSimRobot(ctx, state, sim.timeline, sim.t);
}
