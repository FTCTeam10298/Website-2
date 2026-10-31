import type { MouseEvent, ReactNode } from 'react';
import { ACTIONS, ACTION_TYPES } from '../model/actions';
import { reversedForStep } from '../model/geometry';
import { activeAuto, delStep, dupStep, moveStep, setActionType } from '../model/stepOps';
import type { ActionStep, ActionType, Auto, MoveKind, MoveStep, PlannerState, Step } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import { Check, NumField, NumInput, Seg, TextInput } from './ui';

interface Props {
  auto: Auto;
  step: Step;
  i: number;
  moveNo: number;      // 1-based number among move steps (moves only)
  depth: number;       // block nesting, for indentation
  selected: boolean;
  update: Update;
  save: () => void;
}

const stop = (fn: () => void) => (e: MouseEvent) => { e.stopPropagation(); fn(); };

export default function StepItem({ auto, step, i, moveNo, depth, selected, update, save }: Props) {
  // edit this step on the draft (it's the same index in the active auto)
  const edit = <T extends Step>(fn: (st: T) => void, opts?: { save?: boolean }) =>
    update(d => fn(activeAuto(d).steps[i] as T), opts);
  const op = (fn: (d: PlannerState) => void) => update(fn, { save: true });

  const head = (title: ReactNode, mid?: ReactNode) => (
    <div className="np-step-head">
      <span className="np-step-num">{i + 1}</span>
      <span className="np-step-title">{title}</span>
      {mid}
      <button className="np-icbtn np-sm" title="Move up" onClick={stop(() => op(d => moveStep(d, i, -1)))}>↑</button>
      <button className="np-icbtn np-sm" title="Move down" onClick={stop(() => op(d => moveStep(d, i, +1)))}>↓</button>
      <button className="np-icbtn np-sm" title="Duplicate" onClick={stop(() => op(d => dupStep(d, i)))}>⧉</button>
      <button className="np-icbtn np-sm np-danger" title="Delete" onClick={stop(() => op(d => delStep(d, i)))}>✕</button>
    </div>
  );

  let cls: string, body: ReactNode;
  if (step.kind === 'move') {
    cls = step.move === 'goto' ? 'np-goto' : 'np-move';
    body = <>
      {head(`#${moveNo} ` + (step.move === 'goto' ? 'GoTo' : 'Spline'),
        <Seg<MoveKind> style={{ marginLeft: 'auto' }} value={step.move}
          options={[{ value: 'spline', label: 'Spline' }, { value: 'goto', label: 'GoTo' }]}
          onChange={v => edit<MoveStep>(st => { st.move = v; }, { save: true })} />)}
      <MoveBody auto={auto} st={step} i={i} edit={edit} save={save} />
    </>;
  } else if (step.kind === 'action') {
    cls = 'np-action';
    body = <>
      {head('· ' + (ACTIONS[step.type]?.label || step.type))}
      <ActionBody st={step} i={i} update={update} edit={edit} save={save} />
    </>;
  } else {
    cls = 'np-control';
    body = <ControlHeader st={step} i={i} edit={edit} save={save} onDelete={() => op(d => delStep(d, i))} />;
  }

  return (
    <div className={`np-step ${cls}${selected ? ' np-sel' : ''}`} style={{ marginLeft: depth * 14 }}
      onClick={e => {
        if ((e.target as HTMLElement).closest('input,select,button,textarea')) return;
        update(d => { d.selected = { kind: 'step', i }; });
      }}>
      {body}
    </div>
  );
}

type Edit = <T extends Step>(fn: (st: T) => void, opts?: { save?: boolean }) => void;

function MoveBody({ auto, st, i, edit, save }: { auto: Auto; st: MoveStep; i: number; edit: Edit; save: () => void }) {
  const set = (key: 'x' | 'y' | 'h' | 'maxSpeed' | 'factor') => (v: number) => edit<MoveStep>(s => { s[key] = v; });
  const eff = st.reversed != null ? st.reversed : reversedForStep(i, auto.steps, auto.start);
  return (
    <div>
      <div className="np-row">
        <NumField label="X" value={st.x} step={0.5} onChange={set('x')} onCommit={save} />
        <NumField label="Y" value={st.y} step={0.5} onChange={set('y')} onCommit={save} />
        <NumField label="H°" value={st.h} step={1} onChange={set('h')} onCommit={save} />
        <NumField label="maxSpeed" value={st.maxSpeed} step={0.05} onChange={set('maxSpeed')} onCommit={save} />
      </div>
      <div className="np-row" style={{ marginTop: 7 }}>
        <Check label="through" checked={st.through}
          title="Pass through without precisely settling (keeps momentum into next move)."
          onChange={v => edit<MoveStep>(s => { s.through = v; }, { save: true })} />
        {st.move === 'spline' && <>
          <NumField label="factor" value={st.factor} step={0.1} onChange={set('factor')} onCommit={save} />
          {/* reversed: auto (geometry-derived) by default; click to pin forward/reversed */}
          <button className="np-pill" style={{ cursor: 'pointer' }}
            title="Drive direction. Auto = derived from geometry. Click to cycle auto → forward → reversed."
            onClick={stop(() => edit<MoveStep>(s => {
              s.reversed = s.reversed == null ? false : (s.reversed === false ? true : undefined);
            }, { save: true }))}>
            {(eff ? '↩ reversed' : '→ forward') + (st.reversed != null ? ' (pinned)' : ' (auto)')}
          </button>
        </>}
        <Check label="🔒 lock" checked={!!st.locked}
          title="Lock this waypoint so it can't be dragged or nudged (does not affect the generated code)."
          onChange={v => edit<MoveStep>(s => { s.locked = v; }, { save: true })} />
      </div>
    </div>
  );
}

function ActionBody({ st, i, update, edit, save }: {
  st: ActionStep; i: number; update: Update; edit: Edit; save: () => void;
}) {
  const meta = ACTIONS[st.type];
  return (
    <div className="np-row">
      <select value={st.type} onChange={e => update(d => setActionType(d, i, e.target.value as ActionType), { save: true })}>
        {ACTION_TYPES.map(k => <option key={k} value={k}>{ACTIONS[k].label}</option>)}
      </select>
      {meta.field === 'ms' && (
        <NumField label="ms" value={st.ms ?? 0} step={50} onCommit={save}
          onChange={v => edit<ActionStep>(s => { s.ms = v; })} />
      )}
      {meta.field === 'sel' && (
        <select value={st.mode} onChange={e => edit<ActionStep>(s => { s.mode = e.target.value; }, { save: true })}>
          {meta.opts!.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {meta.field === 'txt' && (
        <TextInput value={st.text || ''} style={{ flex: 1 }} placeholder="raw Java line e.g. robot.intake.in();"
          onChange={v => edit<ActionStep>(s => { s.text = v; })} onCommit={save} />
      )}
    </div>
  );
}

// Header row for a repeat / if / else / end control marker.
function ControlHeader({ st, i, edit, save, onDelete }: {
  st: Exclude<Step, MoveStep | ActionStep>; i: number; edit: Edit; save: () => void; onDelete: () => void;
}) {
  const closeBtn = (
    <button className="np-icbtn np-sm np-danger" title="Delete this whole block" onClick={stop(onDelete)}>✕</button>
  );
  return (
    <div className="np-step-head">
      <span className="np-step-num">{i + 1}</span>
      {st.kind === 'repeat' && <>
        <span className="np-step-title">🔁 repeat</span>
        <NumInput value={st.count} min={0} step={1} style={{ width: 52 }} onCommit={save}
          onChange={v => edit<typeof st>(s => { s.count = Math.max(0, Math.trunc(v)); })} />
        <span className="np-mini">× ({st.var || 'i'})</span>
        {closeBtn}
      </>}
      {st.kind === 'if' && <>
        <span className="np-step-title">❓ if</span>
        <TextInput value={st.cond || ''} placeholder="i % 2 == 0" style={{ flex: 1, minWidth: 80 }}
          title="Condition (loop var i/j/… and alliance are in scope for the simulator)"
          onChange={v => edit<typeof st>(s => { s.cond = v; })} onCommit={save} />
        {closeBtn}
      </>}
      {st.kind === 'else' && <span className="np-step-title np-mini">{'} else {'}</span>}
      {st.kind === 'end' && <span className="np-step-title np-mini">{'} end'}</span>}
    </div>
  );
}
