import { memo } from 'react';
import { clampToField, robotDims } from '../model/geometry';
import { activeAuto } from '../model/stepOps';
import type { Pose } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import { Card, NumField } from './ui';

function StartPoseCard({ start, update }: { start: Pose; update: Update }) {
  const set = (key: 'x' | 'y' | 'h') => (v: number) => update(d => { activeAuto(d).start[key] = v; });
  // typed coords are checked against the walls once the edit is done, not mid-typing
  const commit = () => update(d => clampToField(activeAuto(d).start, robotDims(d)), { save: true });
  return (
    <Card title="Start pose" pill="setPosition">
      <div className="np-row">
        <NumField label="X" step={0.5} value={start.x} onChange={set('x')} onCommit={commit} />
        <NumField label="Y" step={0.5} value={start.y} onChange={set('y')} onCommit={commit} />
        <NumField label="Heading°" step={1} value={start.h} onChange={set('h')} onCommit={commit} />
        <span className="np-mini" style={{ flex: 1 }}>literal numbers used as<br /><code>(X, Y, H)</code></span>
      </div>
    </Card>
  );
}

export default memo(StartPoseCard);
