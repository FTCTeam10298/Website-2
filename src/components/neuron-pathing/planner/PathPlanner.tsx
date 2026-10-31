// Neuron Path Planner: draw an autonomous path on the field and generate the Java for
// Neuron Pathing. Standalone; paste the generated code into your own OpModes.
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import fieldPng from './assets/field.png';
import FieldCanvas, { type FieldCanvasHandle } from './canvas/FieldCanvas';
import { generateCode, sanitize } from './model/codegen';
import { parseOpMode } from './model/importJava';
import { defaultState, exampleState, parseStateFile } from './model/state';
import { activeAuto, delStep, selectedNode } from './model/stepOps';
import { usePlanner } from './hooks/usePlanner';
import { useSimulator } from './hooks/useSimulator';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useVideoOverlay } from './hooks/useVideoOverlay';
import AutosCard from './panels/AutosCard';
import CodeCard from './panels/CodeCard';
import FieldToolbar from './panels/FieldToolbar';
import OutputCard from './panels/OutputCard';
import SettingsCard from './panels/SettingsCard';
import SimulatorCard from './panels/SimulatorCard';
import StartPoseCard from './panels/StartPoseCard';
import StepsCard from './panels/StepsCard';
import VideoOverlayCard from './panels/VideoOverlayCard';
import './planner.css';

function downloadBlob(text: string, name: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function readFile(file: File, as: 'text' | 'dataURL') {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    if (as === 'text') r.readAsText(file); else r.readAsDataURL(file);
  });
}

export default function PathPlanner() {
  const { message, visible, toast } = useToast();
  const { state, stateRef, update, save, replace, undo, redo, canUndo, canRedo } = usePlanner(toast);
  const { dark, toggle: toggleTheme } = useTheme();
  const simulator = useSimulator(state);
  const video = useVideoOverlay(state.youtubeUrl, update, toast);
  const canvas = useRef<FieldCanvasHandle>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const code = useMemo(() => generateCode(state), [state]);

  useEffect(() => { document.title = 'Neuron Path Planner: Neuron Pathing by Brain Stormz 10298'; }, []);

  // custom uploaded field image if present, else the bundled DECODE field
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgImg(img);
    img.onerror = () => setBgImg(null);
    img.src = state.bgImage || fieldPng;
    return () => { img.onload = null; img.onerror = null; };
  }, [state.bgImage]);

  // ---- keyboard: undo/redo, sim play, zoom, delete / nudge the selected node ----
  const onKey = useRef<(e: KeyboardEvent) => void>(() => {});
  onKey.current = e => {
    const tag = (document.activeElement as HTMLElement | null)?.tagName ?? '';
    if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(tag)) return;
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
    if (ctrl && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return; }
    if (e.key === ' ') { e.preventDefault(); simulator.togglePlay(); return; }
    if (e.key === '0') { e.preventDefault(); canvas.current?.resetView(); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); canvas.current?.zoomCenter(1.1); return; }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); canvas.current?.zoomCenter(1 / 1.1); return; }
    const s = stateRef.current, sel = s.selected;
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel?.kind === 'step') {
      e.preventDefault();
      update(d => delStep(d, sel.i), { save: true });
      return;
    }
    const node = selectedNode(s);
    if (!node || node.locked) return;
    const step = s.snap ? 0.5 : 1;
    const delta = { ArrowUp: [0, step], ArrowDown: [0, -step], ArrowLeft: [-step, 0], ArrowRight: [step, 0] }[e.key];
    if (!delta) return;
    e.preventDefault();
    update(d => { const n = selectedNode(d)!; n.x += delta[0]; n.y += delta[1]; }, { save: true });
  };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey.current(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ---- file / whole-state actions ----
  const onLoadExample = useCallback(() => { replace(exampleState()); toast('Example loaded'); }, [replace, toast]);

  const onImportJava = useCallback(async (file: File) => {
    try {
      const { autos, className } = parseOpMode(await readFile(file, 'text'));
      if (!autos.length) { toast('No autos found in that file'); return; }
      // keep the user's view prefs; only the autos + output target change
      update(d => {
        d.autos = autos; d.activeAuto = 0; d.output = 'opmode'; d.selected = null;
        if (className) d.opModeName = className;
      }, { save: true });
      toast(`Imported and saved ${autos.length} auto${autos.length === 1 ? '' : 's'}`);
    } catch {
      toast('Could not parse file');
    }
  }, [update, toast]);

  const onCopy = useCallback(async (textarea: HTMLTextAreaElement | null) => {
    try { await navigator.clipboard.writeText(code); }
    catch { textarea?.select(); document.execCommand('copy'); }
    toast('Copied!');
  }, [code, toast]);

  const onDownload = useCallback(() => {
    const s = stateRef.current, opmode = s.output === 'opmode';
    const name = sanitize(opmode ? s.opModeName : activeAuto(s).name) || 'auto';
    downloadBlob(code, name + (opmode ? '.java' : '.txt'), 'text/plain');
  }, [code, stateRef]);

  const onExport = useCallback(() => {
    const s = stateRef.current;
    downloadBlob(JSON.stringify(s, null, 2), (sanitize(activeAuto(s).name) || 'path') + '.json', 'application/json');
  }, [stateRef]);

  const onImport = useCallback(async (file: File) => {
    try {
      const s = parseStateFile(await readFile(file, 'text'));
      if (s) { replace({ ...s, selected: null }); toast('Loaded'); }
    } catch {
      toast('Bad file');
    }
  }, [replace, toast]);

  const onFieldImage = useCallback(async (file: File) => {
    const url = await readFile(file, 'dataURL');
    update(d => { d.bgImage = url; }, { save: true });
  }, [update]);

  const onResetField = useCallback(() => {
    update(d => { d.bgImage = null; d.bgRot = 270; d.bgFlip = false; d.bgShow = true; }, { save: true });
    toast('DECODE field');
  }, [update, toast]);

  const onClearAll = () => {
    if (confirm('Clear ALL autos and start poses? (field image resets to DECODE)')) replace(defaultState());
  };

  const onFit = useCallback(() => canvas.current?.resetView(), []);

  return (
    <div className={'np-planner' + (dark ? ' np-dark' : '')} style={{ '--np-accent': state.accent } as CSSProperties}>
      <div className="np-app">
        <div className="np-left">
          <div className="np-topbar">
            <Link to="/neuron-pathing" className="np-mini np-back" title="Back to Neuron Pathing home">&larr; Neuron Pathing</Link>
            <h1>Neuron Path Planner <small>· Neuron Pathing by FTC 10298 Brain Stormz</small></h1>
            <div className="np-spacer" />
            <button className="np-sm np-ghost" onClick={toggleTheme} title="Toggle dark mode">{dark ? '☀ Light' : 'Dark'}</button>
          </div>
          <FieldCanvas ref={canvas} state={state} update={update} save={save} bgImg={bgImg} dark={dark}
            sim={{ active: simulator.sim.active, t: simulator.sim.t, timeline: simulator.timeline }}
            video={video} readoutRef={readoutRef} />
          <SimulatorCard simulator={simulator} />
          <FieldToolbar state={state} update={update} save={save} onFit={onFit} readoutRef={readoutRef} />
        </div>

        <div className="np-right">
          <div className="np-panel-scroll">
            <OutputCard state={state} update={update} save={save} onLoadExample={onLoadExample} />
            <AutosCard state={state} update={update} save={save} onImportJava={onImportJava} />
            <StartPoseCard start={activeAuto(state).start} update={update} save={save} />
            <StepsCard state={state} update={update} save={save} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
            <SettingsCard state={state} update={update} save={save} />
            <VideoOverlayCard state={state} update={update} save={save} video={video} toast={toast} />
            <CodeCard code={code} onCopy={onCopy} onDownload={onDownload} onExport={onExport} onImport={onImport}
              onFieldImage={onFieldImage} onResetField={onResetField} />
            <button className="np-ghost np-danger np-sm" style={{ alignSelf: 'flex-start' }} onClick={onClearAll}>Clear everything</button>
          </div>
        </div>
      </div>
      <div className={'np-toast' + (visible ? ' np-show' : '')}>{message}</div>
    </div>
  );
}
