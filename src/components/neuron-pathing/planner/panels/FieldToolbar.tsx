import { memo, type RefObject } from 'react';
import { NEIGH_COLORS } from '../model/constants';
import { sanitize } from '../model/codegen';
import { shownNeighbors } from '../model/stepOps';
import type { PlannerState } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import { Check, NumInput } from './ui';

interface Props {
  state: PlannerState;
  update: Update;
  save: () => void;
  onFit: () => void;
  readoutRef: RefObject<HTMLSpanElement>;
}

// hint row + legend / display options under the field
function FieldToolbar({ state, update, save, onFit, readoutRef }: Props) {
  const toggle = (key: 'bgShow' | 'showGrid' | 'showZones' | 'snap' | 'showSpeed' | 'showRobot') =>
    (v: boolean) => update(d => { d[key] = v; }, { save: true });
  const maxCmp = Math.max(0, state.autos.length - 1);
  const cmpCount = Math.min(state.cmpCount, maxCmp);

  return (
    <>
      <div className="np-hint">
        <span><b>Click</b> empty field = add waypoint</span>
        <span><b>Drag</b> node = move · <b>arrow</b> = rotate · <b>◆</b> = spline factor</span>
        <span><b>Scroll</b> = zoom · <b>drag empty</b> = pan</span>
        <span><b>Del</b> = remove · <b>Arrows</b> = nudge</span>
        <button className="np-sm" onClick={onFit} title="Reset zoom/pan (0)">⌖ fit</button>
        <span className="np-spacer" />
        <span ref={readoutRef} className="np-mini" />
      </div>
      <div className="np-legend np-mini">
        <span><span className="np-dot" style={{ background: 'var(--np-green)' }} />Start</span>
        <span><span className="np-swatch" style={{ background: 'var(--np-blue)' }} />Spline</span>
        <span><span className="np-swatch" style={{ background: 'var(--np-accent2)' }} />GoTo</span>
        <span><span className="np-dot" style={{ background: '#fff' }} />Selected</span>
        <span className="np-spacer" />
        <Check label="Field" checked={state.bgShow} onChange={toggle('bgShow')} />
        <button className="np-sm" title="Rotate field image counter-clockwise"
          onClick={() => update(d => { d.bgRot = ((d.bgRot || 0) + 270) % 360; }, { save: true })}>⟲</button>
        <button className="np-sm" title="Rotate field image clockwise"
          onClick={() => update(d => { d.bgRot = ((d.bgRot || 0) + 90) % 360; }, { save: true })}>⟳</button>
        <button className="np-sm" title="Flip field image"
          onClick={() => update(d => { d.bgFlip = !d.bgFlip; }, { save: true })}>⇋</button>
        <Check label="Grid" checked={state.showGrid} onChange={toggle('showGrid')} />
        <Check label="Zones" checked={state.showZones} onChange={toggle('showZones')} />
        <Check label='Snap ½"' checked={state.snap} onChange={toggle('snap')} />
        <Check label="Speed" checked={state.showSpeed} onChange={toggle('showSpeed')}
          title="Tint each move by its assigned power (green=full → red=slow)" />
        <label className="np-chk" title="Overlay this many other autos' paths to compare (click one to switch to it)">
          Compare{' '}
          <input type="range" min={0} max={maxCmp} value={cmpCount} disabled={maxCmp === 0}
            style={{ width: 72, verticalAlign: 'middle' }}
            onChange={e => update(d => { d.cmpCount = parseInt(e.target.value) || 0; }, { save: true })} />
          {' '}<span className="np-mini">{cmpCount}</span>
        </label>
        <span className="np-mini" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {shownNeighbors(state).map((ai, k) => (
            <span key={ai} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span className="np-swatch" style={{ background: NEIGH_COLORS[k % NEIGH_COLORS.length] }} />
              {sanitize(state.autos[ai].name) || 'Auto' + ai}
            </span>
          ))}
        </span>
        <Check label="Robot box" checked={state.showRobot} onChange={toggle('showRobot')} />
        <NumInput value={state.robotW} step={0.5} min={1} style={{ width: 46 }} title="Robot width, inches (left-right)"
          onChange={v => update(d => { d.robotW = v; d.showRobot = true; })} onCommit={save} />
        <span className="np-mini">×</span>
        <NumInput value={state.robotL} step={0.5} min={1} style={{ width: 46 }} title="Robot length, inches (forward)"
          onChange={v => update(d => { d.robotL = v; d.showRobot = true; })} onCommit={save} />
        <span className="np-mini">in</span>
      </div>
    </>
  );
}

export default memo(FieldToolbar);
