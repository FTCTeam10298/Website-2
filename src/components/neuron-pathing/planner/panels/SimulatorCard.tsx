import { poseAt } from '../model/simulator';
import type { Simulator } from '../hooks/useSimulator';
import { Card } from './ui';

export default function SimulatorCard({ simulator }: { simulator: Simulator }) {
  const { sim, timeline, togglePlay, restart, stepFeature, scrubTo, setRate } = simulator;
  const { segs, total } = timeline;

  let readout = 'Press Play to simulate the active auto.';
  if (sim.active) {
    if (!segs.length) readout = 'No steps to simulate.';
    else {
      const idx = Math.max(0, poseAt(timeline, sim.t).seg), seg = segs[idx];
      const loop = seg.loop ? `  ·  [${seg.loop}]` : '';
      readout = `t ${sim.t.toFixed(1)}s / ${total.toFixed(1)}s  ·  feature ${idx + 1}/${segs.length}  ·  ${seg.label}${loop}`;
    }
  }

  return (
    <Card title="Simulator" pill={sim.active && segs.length ? `~${total.toFixed(1)}s total` : ''} className="np-field-card">
      <div className="np-row">
        <button className="np-primary np-sm" onClick={togglePlay}>{sim.playing ? '⏸ Pause' : '▶ Play'}</button>
        <button className="np-sm" onClick={stepFeature} title="Play the next feature, then pause">⏭ Step</button>
        <button className="np-sm" onClick={restart} title="Back to start">⏮ Restart</button>
        <span className="np-spacer" />
        <label className="np-fld">Playback
          <select value={String(sim.rate)} onChange={e => setRate(parseFloat(e.target.value) || 1)}>
            <option value="0.5">0.5×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="4">4×</option>
          </select>
        </label>
      </div>
      <input type="range" min={0} max={1000} style={{ width: '100%', marginTop: 9 }}
        value={total ? Math.round(sim.t / total * 1000) : 0}
        onChange={e => scrubTo(+e.target.value / 1000)} />
      <div className="np-row" style={{ marginTop: 4 }}>
        <span className="np-mini">{readout}</span>
      </div>
      <div className="np-row" style={{ marginTop: 6 }}>
        <span className="np-mini">Rough estimate from a trapezoidal speed profile (top speed, accel, per-move power) plus settle/shoot dwell; set speeds in <b>Settings</b>.</span>
      </div>
    </Card>
  );
}
