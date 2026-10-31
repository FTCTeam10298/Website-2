import { forwardRef, useEffect, useImperativeHandle, useRef, type PointerEvent, type RefObject } from 'react';
import { FIELD, HEAD_LEN, LOGICAL } from '../model/constants';
import {
  distToSeg2, f2s, factorHandleField, headingTip, rad, s2f, sampledFieldPath, snapH, snapXY,
} from '../model/geometry';
import type { Timeline } from '../model/simulator';
import { activeAuto, addMoveAt, shownNeighbors, switchAuto } from '../model/stepOps';
import type { MoveStep, NodeRef, PlannerState, Pose, ScreenPt } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import type { VideoOverlay } from '../hooks/useVideoOverlay';
import { drawScene, isSel, selNodeRef, type SceneColors, type View } from './draw';

export interface FieldCanvasHandle {
  resetView: () => void;
  zoomCenter: (factor: number) => void;
}

interface Props {
  state: PlannerState;
  update: Update;
  save: () => void;
  bgImg: HTMLImageElement | null;
  dark: boolean;
  sim: { active: boolean; t: number; timeline: Timeline };
  video: VideoOverlay;
  readoutRef: RefObject<HTMLSpanElement>;
}

interface Handle extends ScreenPt { ref: NodeRef; kind: 'pos' | 'head' | 'factor' }

// grabbable points on the field: each node's position + heading-arrow tip, and the
// factor diamond on the selected spline. In focus mode (a waypoint selected), only
// that waypoint is grabbable until another is picked from the Path steps list.
function handles(s: PlannerState): Handle[] {
  const auto = activeAuto(s), list: Handle[] = [];
  const lockSel = selNodeRef(s);
  const grabbable = (ref: NodeRef) => !lockSel || (ref.kind === 'start' ? lockSel.kind === 'start'
    : lockSel.kind === 'step' && ref.i === lockSel.i);
  const push = (p: Pose, ref: NodeRef) => {
    const t = headingTip(p);
    list.push({ ref, kind: 'pos', ...f2s(p.x, p.y) });
    list.push({ ref, kind: 'head', ...f2s(t.x, t.y) });
  };
  if (!auto.start.locked && grabbable({ kind: 'start' })) push(auto.start, { kind: 'start' });
  auto.steps.forEach((st, i) => {
    if (st.kind !== 'move' || st.locked || !grabbable({ kind: 'step', i })) return;
    push(st, { kind: 'step', i });
    if (st.move === 'spline' && isSel(s.selected, 'step', i)) {
      const p = factorHandleField(st);
      list.push({ ref: { kind: 'step', i }, kind: 'factor', ...f2s(p.x, p.y) });
    }
  });
  return list;
}

// in focus mode, true when the click landed on a non-selected node — swallow it so the
// dimmed waypoint neither gets selected nor spawns a stray waypoint on top of itself.
function lockedNodeClicked(s: PlannerState, m: ScreenPt, scale: number) {
  if (!selNodeRef(s)) return false;
  const auto = activeAuto(s), r2 = (14 / scale) ** 2;
  const hit = (p: Pose) => { const q = f2s(p.x, p.y); return (q.sx - m.sx) ** 2 + (q.sy - m.sy) ** 2 <= r2; };
  if (!isSel(s.selected, 'start') && hit(auto.start)) return true;
  return auto.steps.some((st, i) => st.kind === 'move' && !isSel(s.selected, 'step', i) && hit(st));
}

// click on an overlaid neighbour path -> that auto's index, else -1
function neighborPathHit(s: PlannerState, m: ScreenPt, scale: number) {
  const tol2 = (8 / scale) ** 2;
  for (const ai of shownNeighbors(s)) {
    const pts = sampledFieldPath(s.autos[ai].start, s.autos[ai].steps).map(p => f2s(p.x, p.y));
    for (let i = 1; i < pts.length; i++) if (distToSeg2(m, pts[i - 1], pts[i]) <= tol2) return ai;
  }
  return -1;
}

function readColors(el: Element): SceneColors {
  const cs = getComputedStyle(el), v = (n: string) => cs.getPropertyValue(n).trim();
  return { field: v('--np-field'), gridAxis: v('--np-grid-axis'), gridLine: v('--np-grid-line'),
           fieldOverlay: v('--np-field-overlay'), robotStroke: v('--np-robot-stroke') };
}

interface MouseDown extends ScreenPt {
  moved: boolean; raw: { px: number; py: number }; ox: number; oy: number; pan?: boolean; consumed?: boolean;
}

const FieldCanvas = forwardRef<FieldCanvasHandle, Props>(function FieldCanvas(
  { state, update, save, bgImg, dark, sim, video, readoutRef }, ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const view = useRef<View>({ scale: 1, ox: 0, oy: 0 });
  const drag = useRef<Handle | null>(null);
  const mouseDown = useRef<MouseDown | null>(null);
  const dpr = useRef(1);

  // the latest draw, so pan/zoom/resize handlers can repaint without a React render
  const drawRef = useRef(() => {});
  drawRef.current = () => {
    const canvas = canvasRef.current, ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const root = canvas.closest('.np-planner') ?? canvas;
    drawScene(ctx, { state, view: view.current, dpr: dpr.current, bgImg, colors: readColors(root), sim });
    layoutVideoFrames();
  };

  // keep the video overlay glued to the canvas box, with the user's alignment transform on top
  function layoutVideoFrames() {
    const canvas = canvasRef.current, frame = video.videoRef.current, yt = video.iframeRef.current;
    if (!canvas) return;
    const ytShown = state.videoShow && video.kind === 'youtube' && !!video.youtubeSrc;
    const localShown = state.videoShow && video.kind === 'local' && !!video.localSrc;
    if (yt) yt.style.display = ytShown ? 'block' : 'none';
    if (frame) frame.style.display = localShown ? 'block' : 'none';
    if (!ytShown && !localShown) return;
    const wrap = canvas.parentElement!.getBoundingClientRect(), box = canvas.getBoundingClientRect();
    const r = box.width / LOGICAL;
    const transform = `perspective(1000px) translate3d(${(state.videoOffsetX || 0) * r}px, ${(state.videoOffsetY || 0) * r}px, 0px) `
      + `rotateX(${state.videoPerspectiveX || 0}deg) rotateY(${state.videoPerspectiveY || 0}deg) `
      + `rotateZ(${state.videoRot || 0}deg) scale(${state.videoScale ?? 1})`;
    [yt, frame].forEach(f => {
      if (!f) return;
      Object.assign(f.style, {
        left: `${box.left - wrap.left}px`, top: `${box.top - wrap.top}px`,
        width: `${box.width}px`, height: `${box.height}px`,
        opacity: String(Math.max(0, Math.min(1, state.videoOpacity ?? 0.55))), transform,
      });
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    dpr.current = window.devicePixelRatio || 1;
    canvas.width = LOGICAL * dpr.current; canvas.height = LOGICAL * dpr.current;
  }, []);

  useEffect(() => { drawRef.current(); });   // repaint after every render (state, sim, theme, …)
  useEffect(() => { drawRef.current(); }, [dark]);

  useEffect(() => {
    const onResize = () => drawRef.current();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const zoomAt = (px: number, py: number, factor: number) => {
    const v = view.current;
    const ns = Math.max(0.5, Math.min(6, v.scale * factor)), k = ns / v.scale;
    view.current = { scale: ns, ox: px - (px - v.ox) * k, oy: py - (py - v.oy) * k };
    drawRef.current();
  };

  useImperativeHandle(ref, () => ({
    resetView: () => { view.current = { scale: 1, ox: 0, oy: 0 }; drawRef.current(); },
    zoomCenter: factor => zoomAt(LOGICAL / 2, LOGICAL / 2, factor),
  }), []);

  // raw logical px (0..LOGICAL), ignoring pan/zoom
  const rawPos = (e: { clientX: number; clientY: number }) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { px: (e.clientX - r.left) / r.width * LOGICAL, py: (e.clientY - r.top) / r.height * LOGICAL };
  };
  // base-logical px (pan/zoom removed) -> matches f2s output
  const mousePos = (e: { clientX: number; clientY: number }): ScreenPt => {
    const { px, py } = rawPos(e), v = view.current;
    return { sx: (px - v.ox) / v.scale, sy: (py - v.oy) / v.scale };
  };

  // scroll = zoom about the cursor (non-passive, so it can't be a React onWheel)
  useEffect(() => {
    const canvas = canvasRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { px, py } = rawPos(e);
      zoomAt(px, py, e.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const m = mousePos(e), v = view.current;
    const md: MouseDown = { ...m, moved: false, raw: rawPos(e), ox: v.ox, oy: v.oy };
    mouseDown.current = md;
    // grab the nearest handle within its grab radius; the factor diamond gets a
    // bigger radius + priority so it's easy to grab.
    let best: Handle | null = null, bestScore = Infinity;
    handles(state).forEach(h => {
      const r = (h.kind === 'factor' ? 22 : 14) / v.scale;
      const d = (h.sx - m.sx) ** 2 + (h.sy - m.sy) ** 2;
      if (d > r * r) return;
      const score = d - (h.kind === 'head' ? 16 : 0) - (h.kind === 'factor' ? 30 : 0);
      if (score < bestScore) { bestScore = score; best = h; }
    });
    const grabbed = best as Handle | null;
    if (grabbed) {
      drag.current = grabbed;
      update(d => { d.selected = grabbed.ref; });
    } else if (lockedNodeClicked(state, m, v.scale)) {
      md.consumed = true; md.pan = true;          // dimmed node -> re-select it from the Path steps list
    } else {
      const ai = neighborPathHit(state, m, v.scale);
      if (ai >= 0) { md.consumed = true; update(d => switchAuto(d, ai), { persist: true }); }
      else md.pan = true;                         // empty space -> pan the view
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const m = mousePos(e), f = s2f(m.sx, m.sy);
    if (readoutRef.current) readoutRef.current.textContent = `field x ${f.fx.toFixed(1)}  y ${f.fy.toFixed(1)}`;
    const md = mouseDown.current;
    if (!md) return;
    if ((m.sx - md.sx) ** 2 + (m.sy - md.sy) ** 2 > 9) md.moved = true;
    if (md.pan) {
      const r = rawPos(e);
      view.current = { ...view.current, ox: md.ox + (r.px - md.raw.px), oy: md.oy + (r.py - md.raw.py) };
      drawRef.current();
      return;
    }
    const h = drag.current;
    if (!h) return;
    update(d => {
      const auto = activeAuto(d);
      const p = h.ref.kind === 'start' ? auto.start : auto.steps[h.ref.i] as MoveStep;
      if (h.kind === 'pos') {
        p.x = snapXY(f.fx, d.snap); p.y = snapXY(f.fy, d.snap);
      } else if (h.kind === 'factor') {           // drag the diamond to set spline factor
        const th = rad(p.h);
        const proj = (f.fx - p.x) * Math.cos(th) + (f.fy - p.y) * Math.sin(th);
        (p as MoveStep).factor = Math.max(0.1, Math.min(3, Math.round(((proj - HEAD_LEN) / 10) / 0.05) * 0.05));
      } else {                                    // rotate
        p.h = snapH(Math.atan2(f.fy - p.y, f.fx - p.x) * 180 / Math.PI);
      }
    });
  };

  const endDrag = () => {
    const md = mouseDown.current;
    if (md && !md.moved && !drag.current && !md.consumed) {
      // plain click on empty field -> add a waypoint there
      const f = s2f(md.sx, md.sy);
      if (f.fx >= -6 && f.fx <= FIELD + 6 && f.fy >= -6 && f.fy <= FIELD + 6) update(d => addMoveAt(d, f.fx, f.fy), { save: true });
    }
    if (drag.current) save();
    drag.current = null; mouseDown.current = null;
  };

  return (
    <div className="np-canvas-wrap">
      <canvas ref={canvasRef} className="np-field" width={LOGICAL} height={LOGICAL}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} />
      <iframe ref={video.iframeRef} className="np-video-frame" title="YouTube video overlay"
        src={video.youtubeSrc ?? undefined}
        allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      <video ref={video.videoRef} className="np-video-frame" src={video.localSrc ?? undefined}
        playsInline muted loop {...video.videoEvents} />
    </div>
  );
});

export default FieldCanvas;
