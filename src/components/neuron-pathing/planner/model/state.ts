// One planner holds MANY autos (Close_Cycle, Far_Cycle, ...). Each auto has its own
// name / Driver-Station label / start pose / steps. The active auto is the one shown
// on the canvas and edited in the panel.
import { DEFAULT_START, HALF } from './constants';
import type { Auto, PlannerState, Pose, Step } from './types';

const LS_KEY = 'autoPathPlanner.v1';

export function defaultAuto(name = 'My_Auto', start?: Pose): Auto {
  return { name, label: name.replace(/_/g, ' '), start: start || { ...DEFAULT_START }, steps: [] };
}

export function defaultState(): PlannerState {
  return {
    output: 'method', opModeName: 'auto',
    includeSetPos: true, clickAdds: 'spline',
    showGrid: true, showZones: true, snap: true, showRobot: false, showSpeed: false, cmpCount: 0,
    videoShow: true, videoOpacity: 0.55, videoRot: 0, youtubeUrl: '',
    videoScale: 1, videoOffsetX: 0, videoOffsetY: 0,
    videoPerspectiveX: 0, videoPerspectiveY: 0,
    bgImage: null, bgRot: 270, bgFlip: false, bgShow: true,
    robotW: 18, robotL: 18, simMaxV: 93.2, simMaxA: 120, defFactor: 1, defMaxSpeed: 1, accent: '#58a6ff',
    autos: [defaultAuto('My_Auto')],
    activeAuto: 0, headingV: 2, originV: 2,
    selected: null,
  };
}

// A saved/imported blob from any earlier version of the planner.
type LegacyState = Partial<Omit<PlannerState, 'headingV' | 'originV'>> & {
  headingV?: number; originV?: number;
  start?: Pose; steps?: Step[]; methodName?: string;
  showAll?: unknown; previewAlliance?: unknown;
};

function forEachPose(autos: Auto[], fn: (p: Pose) => void) {
  autos.forEach(a => {
    fn(a.start);
    a.steps.forEach(st => { if (st.kind === 'move') fn(st); });
  });
}

// Bring any loaded/imported blob up to the current schema (old single-auto saves,
// missing fields, out-of-range active index, old heading/origin conventions, etc.).
export function migrate(blob: LegacyState): PlannerState {
  const s = { ...blob };
  let autos = s.autos;
  if (!autos) {                              // pre-multi-auto saves had start/steps/methodName at top level
    const name = s.methodName || 'My_Auto';
    autos = [{ name, label: name.replace(/_/g, ' '), start: s.start || { x: -7, y: 14, h: 90 }, steps: s.steps || [] }];
  }
  autos.forEach(a => { if (a.label === undefined) a.label = (a.name || '').replace(/_/g, ' '); });
  if (s.headingV !== 2) forEachPose(autos, p => { p.h = 180 - p.h; });           // v1 emitted 180 - H
  if (s.originV !== 2) forEachPose(autos, p => { p.x += HALF; p.y += HALF; });    // v1 origin was the field centre
  delete s.start; delete s.steps; delete s.methodName; delete s.showAll; delete s.previewAlliance;

  const out: PlannerState = { ...defaultState(), ...s, autos, headingV: 2, originV: 2,
                              simMaxV: s.simMaxV ?? 93.258267716535, simMaxA: s.simMaxA ?? 80 };
  if (typeof out.activeAuto !== 'number' || out.activeAuto < 0 || out.activeAuto >= autos.length) out.activeAuto = 0;
  if (!out.opModeName) out.opModeName = 'auto';
  if (typeof out.cmpCount !== 'number') out.cmpCount = 0;
  if (!out.accent) out.accent = '#58a6ff';
  return out;
}

export function loadState(): PlannerState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s && (Array.isArray(s.autos) || Array.isArray(s.steps))) return migrate(s);
  } catch { /* fall through to a fresh state */ }
  return null;
}

export function persistState(state: PlannerState) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
}

export function parseStateFile(text: string): PlannerState | null {
  const s = JSON.parse(text);
  return s && (s.autos || s.steps) ? migrate(s) : null;
}

// Undo/redo tracks only path-meaningful fields (not view prefs, selection, or the
// background image), so Ctrl+Z reverts design changes.
export type HistorySnapshot = Pick<PlannerState, 'output' | 'includeSetPos' | 'opModeName' | 'activeAuto' | 'autos'>;

export function historyKey(s: PlannerState) {
  const snap: HistorySnapshot = {
    output: s.output, includeSetPos: s.includeSetPos, opModeName: s.opModeName,
    activeAuto: s.activeAuto, autos: s.autos,
  };
  return JSON.stringify(snap);
}

export function exampleState(): PlannerState {
  return {
    ...defaultState(),
    opModeName: 'auto',
    autos: [{
      name: 'Example_Close', label: 'Example Close', start: { x: 65, y: 86, h: 90 },
      steps: [
        { kind: 'action', type: 'turret', mode: 'AUTO' },
        { kind: 'move', move: 'goto', x: 65, y: 86, h: 90, through: false, factor: 1, maxSpeed: 1 },
        { kind: 'action', type: 'shoot' },
        { kind: 'move', move: 'spline', x: 84, y: 130, h: 90, through: true, factor: 1, maxSpeed: 1 },
        { kind: 'move', move: 'spline', x: 65, y: 86, h: 90, through: false, factor: 1, maxSpeed: 1 },
        { kind: 'action', type: 'shoot' },
        { kind: 'action', type: 'turret', mode: 'OFF' },
      ],
    }],
  };
}
