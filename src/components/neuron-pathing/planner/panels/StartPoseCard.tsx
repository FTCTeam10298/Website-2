import { memo } from 'react';
import { activeAuto } from '../model/stepOps';
import type { Pose } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import { Card, NumField } from './ui';

function StartPoseCard({ start, update, save }: { start: Pose; update: Update; save: () => void }) {
  const set = (key: 'x' | 'y' | 'h') => (v: number) => update(d => { activeAuto(d).start[key] = v; });
  return (
    <Card title="Start pose" pill="setPosition">
      <div className="np-row">
        <NumField label="X" step={0.5} value={start.x} onChange={set('x')} onCommit={save} />
        <NumField label="Y" step={0.5} value={start.y} onChange={set('y')} onCommit={save} />
        <NumField label="Heading°" step={1} value={start.h} onChange={set('h')} onCommit={save} />
        <span className="np-mini" style={{ flex: 1 }}>literal numbers used as<br /><code>(X, Y, H)</code></span>
      </div>
    </Card>
  );
}

export default memo(StartPoseCard);
