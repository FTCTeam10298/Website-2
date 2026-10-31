import { memo } from 'react';
import type { PlannerState } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import { Card, NumInput } from './ui';

// speed/accel re-time the simulator; defaults seed new waypoints; theme recolours the UI
function SettingsCard({ state, update, save }: { state: PlannerState; update: Update; save: () => void }) {
  return (
    <Card title="Settings" pill="inches">
      <div className="np-row">
        <label className="np-fld">Robot top speed
          <span className="np-row" style={{ gap: 4 }}>
            <NumInput value={state.simMaxV} step={1} min={1} style={{ width: 56 }} onCommit={save}
              onChange={v => update(d => { d.simMaxV = v || 93.2; })} />
            <span className="np-mini">in/s</span>
          </span>
        </label>
        <label className="np-fld">Max accel
          <span className="np-row" style={{ gap: 4 }}>
            <NumInput value={state.simMaxA} step={5} min={0} style={{ width: 56 }} onCommit={save}
              onChange={v => update(d => { d.simMaxA = v >= 0 ? v : 80; })} />
            <span className="np-mini">in/s²</span>
          </span>
        </label>
        <span className="np-mini" style={{ flex: 1, alignSelf: 'flex-end' }}>drive limits used by the simulator (0 accel = constant speed)</span>
      </div>
      <div className="np-row" style={{ marginTop: 8 }}>
        <label className="np-fld">Default power
          <NumInput value={state.defMaxSpeed} step={0.05} min={0.05} max={1} style={{ width: 60 }} onCommit={save}
            onChange={v => update(d => { d.defMaxSpeed = v || 1; })} />
        </label>
        <label className="np-fld">Default spline factor
          <NumInput value={state.defFactor} step={0.1} min={0.1} style={{ width: 60 }} onCommit={save}
            onChange={v => update(d => { d.defFactor = v || 1; })} />
        </label>
        <label className="np-fld">Theme
          <input type="color" value={state.accent} style={{ width: 42, height: 28, padding: 1 }}
            onChange={e => update(d => { d.accent = e.target.value; })} onBlur={save} />
        </label>
        <span className="np-mini" style={{ flex: 1, alignSelf: 'flex-end' }}>applied to new waypoints</span>
      </div>
      <div className="np-mini" style={{ marginTop: 6 }}>All distances in inches, speeds in inches/sec. Field image: use <b>field image</b> / <b>reset field</b> below.</div>
    </Card>
  );
}

export default memo(SettingsCard);
