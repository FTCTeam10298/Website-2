import { memo } from 'react';
import { sanitize } from '../model/codegen';
import { activeAuto, addAuto, delAuto, dupAuto, moveAuto, switchAuto } from '../model/stepOps';
import type { PlannerState } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import { Card, FileLink, TextInput } from './ui';

interface Props {
  state: PlannerState;
  update: Update;
  save: () => void;
  onImportJava: (file: File) => void;
}

function AutosCard({ state, update, save, onImportJava }: Props) {
  const n = state.autos.length;
  const onDelete = () => {
    if (n <= 1 || !confirm(`Delete auto "${activeAuto(state).name}"?`)) return;
    update(delAuto, { save: true });
  };

  return (
    <Card title="Autos" pill={`${n} auto${n === 1 ? '' : 's'}`}>
      <div className="np-row" style={{ gap: 6 }}>
        {state.autos.map((a, i) => (
          <button key={i} className={'np-sm' + (i === state.activeAuto ? ' np-auto-on' : '')}
            onClick={() => { if (i !== state.activeAuto) update(d => switchAuto(d, i), { persist: true }); }}>
            {(sanitize(a.name) || 'Auto' + i) + ` (${a.steps.length})`}
          </button>
        ))}
      </div>
      <div className="np-row" style={{ marginTop: 8 }}>
        <button className="np-sm" onClick={() => update(addAuto, { save: true })}>＋ Auto</button>
        <button className="np-sm" onClick={() => update(dupAuto, { save: true })} title="Duplicate the active auto">⧉ Duplicate</button>
        <button className="np-sm" disabled={state.activeAuto <= 0} title="Move active auto earlier"
          onClick={() => update(d => moveAuto(d, -1), { save: true })}>◀</button>
        <button className="np-sm" disabled={state.activeAuto >= n - 1} title="Move active auto later"
          onClick={() => update(d => moveAuto(d, +1), { save: true })}>▶</button>
        <button className="np-sm np-danger" disabled={n <= 1} onClick={onDelete} title="Delete the active auto">✕ Delete</button>
        <span className="np-spacer" />
        <FileLink accept=".java,.txt" onFile={onImportJava}>import opmode (.java)</FileLink>
      </div>
      <label className="np-fld" style={{ marginTop: 8 }}>Driver-Station label (full opmode <code>autoNames[]</code>)
        <TextInput value={activeAuto(state).label || ''} onCommit={save}
          onChange={v => update(d => { activeAuto(d).label = v; })} />
      </label>
      <div className="np-mini" style={{ marginTop: 6 }}>
        <b>Full OpMode</b> mode emits every auto here into one selectable file
        (DPAD up/down to choose, like <code>auto.java</code>). <b>Method</b> mode emits only the active auto.
      </div>
    </Card>
  );
}

export default memo(AutosCard);
