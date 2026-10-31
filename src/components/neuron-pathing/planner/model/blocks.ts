import type { ControlStep, Step } from './types';

export const LOOP_VARS = ['i', 'j', 'k', 'l', 'm'];

export function isControl(st: Step | undefined): st is ControlStep {
  return !!st && (st.kind === 'repeat' || st.kind === 'if' || st.kind === 'else' || st.kind === 'end');
}

// index of the `end` that closes the opener at openIdx
export function matchingEnd(steps: Step[], openIdx: number) {
  let depth = 0;
  for (let k = openIdx; k < steps.length; k++) {
    const kind = steps[k].kind;
    if (kind === 'repeat' || kind === 'if') depth++;
    else if (kind === 'end') { depth--; if (depth === 0) return k; }
  }
  return steps.length - 1;
}

// opener (repeat/if) for an else/end marker
export function blockOpenerOf(steps: Step[], idx: number) {
  let depth = 0;
  for (let k = idx - 1; k >= 0; k--) {
    const kind = steps[k].kind;
    if (kind === 'end') depth++;
    else if (kind === 'repeat' || kind === 'if') { if (depth === 0) return k; depth--; }
  }
  return idx;
}

// loop variables of the repeat blocks enclosing index `at`
export function openLoopVarsAt(steps: Step[], at: number) {
  const stack: { repeat: boolean; var?: string }[] = [];
  for (let k = 0; k < at && k < steps.length; k++) {
    const st = steps[k];
    if (st.kind === 'repeat') {
      const nLoops = stack.filter(f => f.repeat).length;
      stack.push({ repeat: true, var: st.var || LOOP_VARS[nLoops] || 'i' });
    } else if (st.kind === 'if') stack.push({ repeat: false });
    else if (st.kind === 'end') stack.pop();
  }
  return stack.filter(f => f.repeat).map(f => f.var as string);
}

// ---- interpreting blocks for the simulator ----
type LeafStep = Exclude<Step, ControlStep>;
type BlockNode =
  | { type: 'leaf'; step: LeafStep; idx: number }
  | { type: 'repeat'; count: number; var: string; body: BlockNode[] }
  | { type: 'if'; cond: string; thenBody: BlockNode[]; elseBody: BlockNode[] | null };

interface ScopeVar { name: string; value: number }
export interface ExecItem { step: LeafStep; idx: number; scope: ScopeVar[] }

// Build a tree of blocks from the flat marker list: repeat{body}, if{then,else}, leaf.
function parseBlocks(steps: Step[]) {
  const root: BlockNode[] = [];
  const stack: { target: BlockNode[]; node: BlockNode | null }[] = [{ target: root, node: null }];
  const top = () => stack[stack.length - 1];
  steps.forEach((st, idx) => {
    if (st.kind === 'repeat') {
      const node: BlockNode = { type: 'repeat', count: st.count, var: st.var || 'i', body: [] };
      top().target.push(node); stack.push({ target: node.body, node });
    } else if (st.kind === 'if') {
      const node: BlockNode = { type: 'if', cond: st.cond || 'true', thenBody: [], elseBody: null };
      top().target.push(node); stack.push({ target: node.thenBody, node });
    } else if (st.kind === 'else') {
      const f = top();
      if (f.node && f.node.type === 'if') { f.node.elseBody = []; f.target = f.node.elseBody; }
    } else if (st.kind === 'end') {
      if (stack.length > 1) stack.pop();
    } else {
      top().target.push({ type: 'leaf', step: st, idx });
    }
  });
  return root;
}

// Evaluate an if-condition with the active loop variables (and `alliance`) in scope.
function evalCond(cond: string, scope: ScopeVar[]) {
  try {
    const names = scope.map(s => s.name), vals = scope.map(s => s.value);
    names.push('alliance'); vals.push(1);   // paths are alliance-independent; simulate as Red
    return !!(Function(...names, 'return (' + cond + ');')(...vals));
  } catch {
    return true;   // unknown/invalid condition -> take the then-branch
  }
}

// Interpret the tree into the real ordered sequence of executed leaves (moves/actions),
// looping repeats and choosing if/else branches per iteration.
function execNodes(nodes: BlockNode[], scope: ScopeVar[], out: ExecItem[], guard: { n: number }) {
  for (const node of nodes) {
    if (guard.n > 50000) return;                       // runaway guard
    if (node.type === 'leaf') { out.push({ step: node.step, idx: node.idx, scope: scope.slice() }); guard.n++; }
    else if (node.type === 'repeat') {
      const cnt = Math.max(0, Math.min(1000, Math.round(node.count) || 0));
      for (let v = 0; v < cnt; v++) execNodes(node.body, scope.concat([{ name: node.var, value: v }]), out, guard);
    } else {
      const branch = evalCond(node.cond, scope) ? node.thenBody : node.elseBody;
      if (branch) execNodes(branch, scope, out, guard);
    }
  }
}

export function expandSteps(steps: Step[]) {
  const out: ExecItem[] = [];
  execNodes(parseBlocks(steps), [], out, { n: 0 });
  return out;
}

export function scopeLabel(scope: ScopeVar[]) { return scope.map(s => `${s.name}=${s.value}`).join(', '); }
