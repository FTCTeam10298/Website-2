// Parses a Neuron Path Planner-generated OpMode back into editable autos.
// Recognises the pose convention
//   new Pose2D(X, Y, Math.toRadians(H))
// and the older centre-origin `new Pose2D(X, Y*alliance, Math.toRadians([180 -] H*alliance))`
// forms (shifted by +72 to the corner origin; `180 - H` converted to H' = 180 - H).
// drive.splineToPoint()/drive.goToPoint() become move steps (their paired
// driveToTarget() call is dropped, it's re-emitted automatically); waitMs()
// becomes a wait action; anything else (your own subsystem calls) is preserved
// verbatim as a "custom line" action so it round-trips without changing behavior.
import { DEFAULT_START, HALF } from './constants';
import type { Auto, Pose, Step } from './types';

// `n*alliance` and `alliance*n` both appear in the codebase, so each alliance-scaled
// term is matched in either order (two capture groups, whichever fired wins).
const ALLI = '(?:(-?[\\d.]+)\\s*\\*\\s*alliance|alliance\\s*\\*\\s*(-?[\\d.]+))';
const NUM = '(-?[\\d.]+)';
const POSE_RE = new RegExp(
  'new\\s+Pose2D\\(\\s*' + NUM + '\\s*,\\s*' + NUM +
  '\\s*,\\s*Math\\.toRadians\\(\\s*' + NUM + '\\s*\\)\\s*\\)');
const LEGACY_POSE_RE = new RegExp(
  'new\\s+Pose2D\\(\\s*(-?[\\d.]+)\\s*,\\s*' + ALLI +
  '\\s*,\\s*Math\\.toRadians\\(\\s*(180\\s*-\\s*)?' + ALLI + '\\s*\\)\\s*\\)');

function parsePose(str: string): Pose | null {
  const n = POSE_RE.exec(str || '');
  if (n) return { x: +n[1], y: +n[2], h: +n[3] };
  const m = LEGACY_POSE_RE.exec(str || '');
  if (!m) return null;
  // groups: 1=x, (2|3)=y, 4=legacy "180 -" prefix, (5|6)=h
  const h = +(m[5] !== undefined ? m[5] : m[6]);
  return { x: +m[1] + HALF, y: +(m[2] !== undefined ? m[2] : m[3]) + HALF, h: m[4] ? 180 - h : h };
}

function extractMethodBody(src: string, name: string) {
  const re = new RegExp('public\\s+void\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{');
  const mm = re.exec(src); if (!mm) return null;
  let depth = 1, i = mm.index + mm[0].length;
  const start = i;
  for (; i < src.length && depth > 0; i++) {
    const c = src[i]; if (c === '{') depth++; else if (c === '}') depth--;
  }
  return src.slice(start, i - 1);
}

function parseStatement(line: string): Step | null {
  let m: RegExpMatchArray | null;
  // ---- control flow (repeat / if / else / end) ----
  if ((m = line.match(/^for\s*\(\s*int\s+(\w+)\s*=\s*0\s*;\s*\w+\s*<\s*(\d+)\s*;\s*\w+\s*\+\+\s*\)\s*\{?\s*$/)))
    return { kind: 'repeat', var: m[1], count: +m[2] };
  if (/^\}\s*else\s*\{?\s*$/.test(line)) return { kind: 'else' };
  if (/^\}\s*;?\s*$/.test(line))         return { kind: 'end' };
  if ((m = line.match(/^if\s*\((.+)\)\s*\{?\s*$/)))   return { kind: 'if', cond: m[1].trim() };
  // ---- moves ----
  if (/drive\.goToPoint\(/.test(line)) {
    const p = parsePose(line);
    const t = line.match(/,\s*(true|false)\s*,\s*([\d.]+)\s*\)\s*;?\s*$/);
    if (p) return { kind: 'move', move: 'goto', x: p.x, y: p.y, h: p.h,
                    through: t ? t[1] === 'true' : false, factor: 1, maxSpeed: t ? +t[2] : 1 };
  }
  if (/drive\.splineToPoint\(/.test(line)) {
    const p = parsePose(line);
    const t = line.match(/,\s*(true|false)\s*,\s*(true|false)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*;?\s*$/);
    if (p) return { kind: 'move', move: 'spline', x: p.x, y: p.y, h: p.h,
                    through: t ? t[1] === 'true' : false, reversed: t ? t[2] === 'true' : undefined,
                    factor: t ? +t[3] : 1, maxSpeed: t ? +t[4] : 1 };
  }
  if ((m = line.match(/^waitMs\(\s*([\d.]+)\s*\)\s*;?$/))) return { kind: 'action', type: 'sleep', ms: +m[1] };
  if (/^driveToTarget\(\s*\)\s*;?$/.test(line)) return null; // paired with the move above, not its own step
  if (/^shoot\(\s*\)\s*;?$/.test(line))    return { kind: 'action', type: 'shoot' };
  if (/^farShoot\(\s*\)\s*;?$/.test(line)) return { kind: 'action', type: 'farShoot' };
  if ((m = line.match(/^pulseOuttake\(\s*(\d+)\s*\)\s*;?$/))) return { kind: 'action', type: 'pulseOuttake', ms: +m[1] };
  if ((m = line.match(/^robot\.intake\.(\w+)\(\s*\)\s*;?$/)))  return { kind: 'action', type: 'intake', mode: m[1] };
  if ((m = line.match(/^robot\.gate\.(\w+)\(\s*\)\s*;?$/)))    return { kind: 'action', type: 'gate', mode: m[1] };
  if ((m = line.match(/^robot\.shooter\.(\w+)\(\s*\)\s*;?$/))) return { kind: 'action', type: 'shooter', mode: m[1] };
  if ((m = line.match(/^robot\.turret\.turretState\s*=\s*Turret\.TurretState\.(\w+)\s*;?$/)))
    return { kind: 'action', type: 'turret', mode: m[1] };
  return { kind: 'action', type: 'raw', text: line };   // your own subsystem calls, etc.
}

function parseStatements(body: string) {
  const steps: Step[] = [];
  body.split('\n').forEach(raw => {
    const line = raw.trim();
    if (!line || line.startsWith('//')) return;        // drop blank lines + standalone comments
    const st = parseStatement(line);
    if (st) steps.push(st);                            // driveToTarget() lines parse to null, skipped
  });
  return steps;
}

const HELPER_METHODS = new Set(['driveToTarget', 'waitMs', 'shoot', 'farShoot', 'pulseOuttake', 'runOpMode']);

export interface ParsedOpMode { autos: Auto[]; className: string | null }

export function parseOpMode(src: string): ParsedOpMode {
  // Driver-Station labels
  let labels: string[] = [];
  const namesM = src.match(/String\[\]\s*autoNames\s*=\s*\{([\s\S]*?)\}/);
  if (namesM) labels = [...namesM[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
  // run-time switch: case N: Name();  -> ordering + which methods are autos
  const order: string[] = [];
  const reCase = /case\s+(\d+)\s*:\s*([A-Za-z_]\w*)\s*\(\s*\)\s*;/g;
  let m: RegExpExecArray | null;
  while ((m = reCase.exec(src))) order[+m[1]] = m[2];
  // init switch: case N: ...setPosition(pose) -> start pose per index
  const starts: Pose[] = [];
  const reInit = /case\s+(\d+)\s*:[\s\S]*?setPosition\(\s*(new\s+Pose2D\([^;]*?\))\s*\)\s*;/g;
  while ((m = reInit.exec(src))) { const p = parsePose(m[2]); if (p) starts[+m[1]] = p; }
  // method names: prefer the switch order; otherwise every non-helper public void
  const names = order.filter(Boolean);
  if (!names.length) {
    const reM = /public\s+void\s+([A-Za-z_]\w*)\s*\(\s*\)/g;
    while ((m = reM.exec(src))) if (!HELPER_METHODS.has(m[1])) names.push(m[1]);
  }
  const autos: Auto[] = [];
  names.forEach((nm, idx) => {
    const body = extractMethodBody(src, nm); if (body == null) return;
    // start: init-switch pose for this index, else first setPosition inside the body
    let start: Pose | null = starts[idx] ?? null;
    if (!start) {
      const bm = body.match(/setPosition\(\s*(new\s+Pose2D\([^;]*?\))\s*\)/);
      if (bm) start = parsePose(bm[1]);
    }
    autos.push({ name: nm, label: labels[idx] || nm.replace(/_/g, ' '),
                 start: start || { ...DEFAULT_START }, steps: parseStatements(body) });
  });
  const clsM = src.match(/public\s+class\s+([A-Za-z_]\w*)\s+extends\s+LinearOpMode/);
  return { autos, className: clsM ? clsM[1] : null };
}
