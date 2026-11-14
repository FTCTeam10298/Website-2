import { memo } from 'react';
import { clampToField, robotDims, toCode } from '../model/geometry';
import { activeAuto } from '../model/stepOps';
import type { Pose } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import { Card, NumField } from './ui';

// X/Y are shown in code coordinates (origin = robot in the bottom-left corner)
function StartPoseCard({ start, origin, update }: { start: Pose; origin: { x: number; y: number }; update: Update }) {
  const set = (key: 'x' | 'y' | 'h', off = 0) => (v: number) => update(d => { activeAuto(d).start[key] = v + off; });
  // typed coords are checked against the walls once the edit is done, not mid-typing
  const commit = () => update(d => clampToField(activeAuto(d).start, robotDims(d)), { save: true });
  return (
    <Card title="Start pose" pill="setPosition">
      <div className="np-row">
        <NumField label="X" step={0.5} value={toCode(start.x, origin.x)} onChange={set('x', origin.x)} onCommit={commit} />
        <NumField label="Y" step={0.5} value={toCode(start.y, origin.y)} onChange={set('y', origin.y)} onCommit={commit} />
        <NumField label="Heading°" step={1} value={start.h} onChange={set('h')} onCommit={commit} />
        <span className="np-mini" style={{ flex: 1 }}>(0, 0) = robot centre when it sits in the
          bottom-left corner facing 0°</span>
      </div>
    </Card>
  );
}

export default memo(StartPoseCard);
