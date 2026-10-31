import { memo } from 'react';
import { activeAuto } from '../model/stepOps';
import type { OutputMode, PlannerState } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import { Card, Check, Seg, TextInput } from './ui';

interface Props {
  state: PlannerState;
  update: Update;
  save: () => void;
  onLoadExample: () => void;
}

function OutputCard({ state, update, save, onLoadExample }: Props) {
  return (
    <Card title="Output">
      <div className="np-row">
        <label className="np-fld" style={{ flex: 1 }}>Auto name (method)
          <TextInput value={activeAuto(state).name} onCommit={save}
            onChange={v => update(d => { activeAuto(d).name = v; })} />
        </label>
        <Seg<OutputMode> style={{ alignSelf: 'flex-end' }} value={state.output}
          options={[{ value: 'method', label: 'Method' }, { value: 'opmode', label: 'Full OpMode' }]}
          onChange={v => update(d => { d.output = v; }, { save: true })} />
      </div>
      {state.output === 'opmode' && (
        <div className="np-row" style={{ marginTop: 8 }}>
          <label className="np-fld" style={{ flex: 1 }}>OpMode class name (full-opmode file)
            <TextInput value={state.opModeName} onCommit={save}
              onChange={v => update(d => { d.opModeName = v; })} />
          </label>
        </div>
      )}
      <div className="np-row" style={{ marginTop: 8 }}>
        <Check label={<>include <code>setPosition()</code> (method mode)</>} checked={state.includeSetPos}
          onChange={v => update(d => { d.includeSetPos = v; }, { save: true })} />
        <span className="np-spacer" />
        <button className="np-sm" onClick={onLoadExample}>Load example</button>
      </div>
    </Card>
  );
}

export default memo(OutputCard);
