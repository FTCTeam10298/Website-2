import { memo, useRef } from 'react';
import { Card, FileLink } from './ui';

interface Props {
  code: string;
  onCopy: (textarea: HTMLTextAreaElement | null) => void;
  onDownload: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onFieldImage: (file: File) => void;
  onResetField: () => void;
}

function CodeCard({ code, onCopy, onDownload, onExport, onImport, onFieldImage, onResetField }: Props) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  return (
    <Card title="Generated code">
      <div className="np-codebar">
        <button className="np-primary" onClick={() => onCopy(textarea.current)}>Copy</button>
        <button onClick={onDownload}>Download</button>
        <span className="np-spacer" />
        <a className="np-filelbl" onClick={onExport}>export .json</a>
        <FileLink accept=".json" onFile={onImport}>import .json</FileLink>
        <FileLink accept="image/*" onFile={onFieldImage}>field image</FileLink>
        <a className="np-filelbl" onClick={onResetField}>reset field</a>
      </div>
      <textarea ref={textarea} className="np-code" value={code} readOnly spellCheck={false} />
      <details style={{ marginTop: 8 }}>
        <summary>How to use the output</summary>
        <div className="np-mini" style={{ marginTop: 6, lineHeight: 1.6 }}>
          Movement (<code>goToPoint</code>/<code>splineToPoint</code>) always targets the
          Neuron Pathing library directly (<code>drive</code>/<code>localizer</code>). The
          shoot/intake/gate/turret actions are this season's DECODE shooter pipeline and still
          call into this year's <code>Robot</code> facade (<code>robot.gate</code>,{' '}
          <code>robot.intake</code>, <code>Turret.TurretState</code>, ...): generate code
          without them (or replace the action catalog in <code>model/actions.ts</code>) for a different game.<br />
          <b>Method</b> mode: paste the method into an OpMode in your season repo that has{' '}
          <code>drive</code>/<code>localizer</code> + <code>driveToTarget()</code>/<code>waitMs()</code>{' '}
          (see <code>NeuronSplineAuto.java</code>) and, if you used any shooter actions,{' '}
          <code>robot</code>/<code>alliance</code> + <code>shoot()</code>/<code>farShoot()</code>/
          <code>pulseOuttake()</code> helpers too.<br />
          <b>Full OpMode</b> mode: save as its own <code>.java</code> file; it bundles{' '}
          <i>every</i> auto in the Autos card into one self-contained, selectable OpMode
          (DPAD up/down to pick, X = Blue, B = Red) with all of the above scaffolding included,
          ready to drop into your season's <code>TeamCode/.../opmodes/</code>.<br />
          <b>Import opmode (.java)</b> (Autos card): load a previously generated OpMode back
          into the planner: each <code>case → method()</code> becomes an editable auto, its{' '}
          <code>setPosition</code> becomes the start pose, and <code>goToPoint</code>/
          <code>splineToPoint</code> calls become steps. <code>for</code> loops become{' '}
          <b>🔁 Repeat</b> blocks and <code>if/else</code> become <b>❓ If/Else</b> blocks; the
          simulator actually loops and picks the branch each iteration (e.g. <code>i % 2 == 0</code>).
          Spline <code>reversed</code> is preserved from the file (shown as <i>pinned</i>); clear the
          pill to let it auto-derive. Anything unrecognized (including your own subsystem calls) is
          kept verbatim as a <i>custom line</i>.
        </div>
      </details>
    </Card>
  );
}

export default memo(CodeCard);
