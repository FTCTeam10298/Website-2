import { memo, useState } from 'react';
import { ACTIONS, ACTION_TYPES } from '../model/actions';
import { activeAuto, addAction, addIfElse, addMove, addRepeat } from '../model/stepOps';
import type { ActionType, MoveKind, PlannerState } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import StepItem from './StepItem';
import { Card, Seg } from './ui';

interface Props {
  state: PlannerState;
  update: Update;
  save: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const QUICK_ADD: { type: ActionType; label: string; title: string }[] = [
  { type: 'shoot', label: '＋ shoot', title: 'Add shoot()' },
  { type: 'farShoot', label: '＋ farShoot', title: 'Add farShoot()' },
  { type: 'sleep', label: '＋ wait', title: 'Add a wait (ms)' },
  { type: 'intake', label: '＋ intake', title: 'Add intake state' },
  { type: 'gate', label: '＋ gate', title: 'Add gate open/close' },
];

function StepsCard({ state, update, save, undo, redo, canUndo, canRedo }: Props) {
  const auto = activeAuto(state);
  const [actionType, setActionType] = useState<ActionType>('sleep');
  const add = (fn: (d: PlannerState) => void) => update(fn, { save: true });

  // control markers indent their *contents*; else/end render one level out
  let moveNo = 0, depth = 0;
  const items = auto.steps.map((st, i) => {
    const myDepth = st.kind === 'else' || st.kind === 'end' ? Math.max(0, depth - 1) : depth;
    if (st.kind === 'repeat' || st.kind === 'if') depth++;
    else if (st.kind === 'end') depth = Math.max(0, depth - 1);
    if (st.kind === 'move') moveNo++;
    const sel = state.selected?.kind === 'step' && state.selected.i === i;
    return <StepItem key={i} auto={auto} step={st} i={i} moveNo={moveNo} depth={myDepth}
      selected={sel} update={update} save={save} />;
  });

  return (
    <Card title="Path steps">
      <div className="np-row" style={{ marginBottom: 8 }}>
        <span className="np-mini">Click adds:</span>
        <Seg<MoveKind> value={state.clickAdds}
          options={[{ value: 'spline', label: 'Spline' }, { value: 'goto', label: 'GoTo' }]}
          onChange={v => update(d => { d.clickAdds = v; }, { save: true })} />
        <span className="np-spacer" />
        <button className="np-sm" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">↶ Undo</button>
        <button className="np-sm" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">↷ Redo</button>
        <span className="np-mini" style={{ marginLeft: 8 }}>
          {auto.steps.length} step{auto.steps.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="np-steps">
        {items.length ? items
          : <div className="np-mini" style={{ padding: 6 }}>No steps yet: click the field to drop a waypoint, or use the buttons below.</div>}
      </div>
      <div className="np-addbar">
        <div className="np-quickbar">
          <span className="np-mini" style={{ alignSelf: 'center' }}>Quick add:</span>
          {QUICK_ADD.map(q => (
            <button key={q.type} className="np-sm np-chip" title={q.title} onClick={() => add(d => addAction(d, q.type))}>{q.label}</button>
          ))}
          <span className="np-mini" style={{ alignSelf: 'center' }}>(inserts after the selected step)</span>
        </div>
        <button className="np-sm" onClick={() => add(d => addMove(d, 'spline'))}>＋ Spline</button>
        <button className="np-sm" onClick={() => add(d => addMove(d, 'goto'))}>＋ GoTo</button>
        <select className="np-sm" style={{ padding: '4px 6px' }} value={actionType}
          onChange={e => setActionType(e.target.value as ActionType)}>
          {ACTION_TYPES.map(k => <option key={k} value={k}>{ACTIONS[k].label}</option>)}
        </select>
        <button className="np-sm" onClick={() => add(d => addAction(d, actionType))}>＋ Action</button>
        <button className="np-sm" onClick={() => add(addRepeat)} title="Wrap following steps in a for-loop">Repeat</button>
        <button className="np-sm" onClick={() => add(addIfElse)} title="Branch on the loop index (e.g. i % 2 == 0)">If/Else</button>
      </div>
    </Card>
  );
}

export default memo(StepsCard);
