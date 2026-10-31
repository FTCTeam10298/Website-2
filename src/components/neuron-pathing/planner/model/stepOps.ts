// Edits to the planner state. Each takes a draft (see usePlanner's update()) and mutates it.
import { newAction } from './actions';
import { blockOpenerOf, isControl, LOOP_VARS, matchingEnd, openLoopVarsAt } from './blocks';
import { snapXY } from './geometry';
import { defaultAuto } from './state';
import type { ActionType, Auto, MoveKind, MoveStep, PlannerState, Pose, Step } from './types';

export const activeAuto = (s: PlannerState) => s.autos[s.activeAuto];

// the selected node (start pose or a move step), else null
export function selectedNode(s: PlannerState): Pose | null {
  const sel = s.selected; if (!sel) return null;
  const auto = activeAuto(s);
  if (sel.kind === 'start') return auto.start;
  const st = auto.steps[sel.i];
  return st && st.kind === 'move' ? st : null;
}

// new steps go after the selected step, else at the end
function insertIndex(s: PlannerState) {
  const sel = s.selected;
  return sel && sel.kind === 'step' ? sel.i + 1 : activeAuto(s).steps.length;
}

function prevHeading(auto: Auto, atIdx: number) {
  for (let i = atIdx - 1; i >= 0; i--) {
    const st = auto.steps[i];
    if (st.kind === 'move') return st.h;
  }
  return auto.start.h;
}

function insertSteps(s: PlannerState, steps: Step[]) {
  const at = insertIndex(s);
  activeAuto(s).steps.splice(at, 0, ...steps);
  s.selected = { kind: 'step', i: at };
}

function newMove(s: PlannerState, kind: MoveKind, x: number, y: number): MoveStep {
  return { kind: 'move', move: kind, x, y, h: prevHeading(activeAuto(s), insertIndex(s)),
           through: false, factor: s.defFactor, maxSpeed: s.defMaxSpeed };
}

export function addMoveAt(s: PlannerState, fx: number, fy: number) {
  insertSteps(s, [newMove(s, s.clickAdds, snapXY(fx, s.snap), snapXY(fy, s.snap))]);
}

export function addMove(s: PlannerState, kind: MoveKind) {
  insertSteps(s, [newMove(s, kind, 0, 0)]);
}

export function addAction(s: PlannerState, type: ActionType) {
  insertSteps(s, [newAction(type)]);
}

// control-flow blocks (for / if-else), as balanced marker pairs in the flat list
export function addRepeat(s: PlannerState) {
  const vars = openLoopVarsAt(activeAuto(s).steps, insertIndex(s));
  insertSteps(s, [{ kind: 'repeat', count: 2, var: LOOP_VARS[vars.length] || 'i' }, { kind: 'end' }]);
}

export function addIfElse(s: PlannerState) {
  const vars = openLoopVarsAt(activeAuto(s).steps, insertIndex(s));
  const cond = vars.length ? `${vars[vars.length - 1]} % 2 == 0` : 'true';
  insertSteps(s, [{ kind: 'if', cond }, { kind: 'else' }, { kind: 'end' }]);
}

export function moveStep(s: PlannerState, i: number, dir: number) {
  const steps = activeAuto(s).steps, j = i + dir;
  if (j < 0 || j >= steps.length) return;
  if (isControl(steps[i])) return;   // markers can't be moved (would unbalance blocks)
  // swapping a normal step with a neighboring marker is allowed: it moves the step across the block edge
  [steps[i], steps[j]] = [steps[j], steps[i]];
  if (s.selected && s.selected.kind === 'step' && s.selected.i === i) s.selected = { kind: 'step', i: j };
}

export function dupStep(s: PlannerState, i: number) {
  const steps = activeAuto(s).steps;
  if (isControl(steps[i])) return;
  steps.splice(i + 1, 0, structuredClone(steps[i]));
  s.selected = { kind: 'step', i: i + 1 };
}

// deleting a block marker removes the opener + matching end + everything between
export function delStep(s: PlannerState, i: number) {
  const steps = activeAuto(s).steps, st = steps[i];
  if (!st) return;
  if (isControl(st)) {
    const open = st.kind === 'repeat' || st.kind === 'if' ? i : blockOpenerOf(steps, i);
    steps.splice(open, matchingEnd(steps, open) - open + 1);
  } else {
    steps.splice(i, 1);
  }
  s.selected = null;
}

export function setActionType(s: PlannerState, i: number, type: ActionType) {
  activeAuto(s).steps[i] = newAction(type);
}

// ---- multi-auto operations ----
function uniqueAutoName(s: PlannerState, base: string) {
  if (!s.autos.some(a => a.name === base)) return base;
  let n = 2; while (s.autos.some(a => a.name === `${base}_${n}`)) n++;
  return `${base}_${n}`;
}

export function switchAuto(s: PlannerState, i: number) {
  if (i < 0 || i >= s.autos.length) return;
  s.activeAuto = i; s.selected = null;
}

export function addAuto(s: PlannerState) {
  let n = s.autos.length + 1, base = 'Auto_' + n;
  while (s.autos.some(a => a.name === base)) base = 'Auto_' + (++n);
  s.autos.push(defaultAuto(base));
  s.activeAuto = s.autos.length - 1; s.selected = null;
}

export function dupAuto(s: PlannerState) {
  const copy = structuredClone(activeAuto(s));
  copy.name = uniqueAutoName(s, (copy.name || 'Auto') + '_copy');
  copy.label = (copy.label || copy.name) + ' copy';
  s.autos.splice(s.activeAuto + 1, 0, copy);
  s.activeAuto += 1; s.selected = null;
}

export function moveAuto(s: PlannerState, dir: number) {
  const i = s.activeAuto, j = i + dir;
  if (j < 0 || j >= s.autos.length) return;
  [s.autos[i], s.autos[j]] = [s.autos[j], s.autos[i]];
  s.activeAuto = j;
}

export function delAuto(s: PlannerState) {
  if (s.autos.length <= 1) return;
  s.autos.splice(s.activeAuto, 1);
  if (s.activeAuto >= s.autos.length) s.activeAuto = s.autos.length - 1;
  s.selected = null;
}

// which other autos the Compare slider overlays (the cmpCount autos after the active one, wrapping)
export function shownNeighbors(s: PlannerState) {
  const len = s.autos.length, n = Math.max(0, Math.min(len - 1, s.cmpCount || 0)), out: number[] = [];
  for (let k = 1; k <= n; k++) out.push((s.activeAuto + k) % len);
  return out;
}
