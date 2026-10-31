import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultState, historyKey, loadState, persistState, type HistorySnapshot } from '../model/state';
import type { PlannerState } from '../model/types';

const HISTORY_LIMIT = 200;

export type Draft = (d: PlannerState) => void;
export interface UpdateOpts {
  save?: boolean;     // commit boundary: snapshot for undo if the path changed, then persist
  persist?: boolean;  // persist without an undo snapshot
}
export type Update = (fn: Draft, opts?: UpdateOpts) => void;

// Copy-on-write: edits mutate a draft whose autos are deep-cloned (they're small), while
// big untouched fields (e.g. the bgImage data URL) are shared with the previous state.
function produce(s: PlannerState, fn: Draft): PlannerState {
  const d: PlannerState = { ...s, autos: structuredClone(s.autos), selected: s.selected && { ...s.selected } };
  fn(d);
  return d;
}

export function usePlanner(toast: (msg: string) => void) {
  const [state, setState] = useState<PlannerState>(() => loadState() ?? defaultState());
  const stateRef = useRef(state);
  stateRef.current = state;

  const hist = useRef<{ undo: string[]; redo: string[]; last: string } | null>(null);
  if (!hist.current) hist.current = { undo: [], redo: [], last: historyKey(state) };
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const syncHistoryButtons = () => {
    setCanUndo(hist.current!.undo.length > 0);
    setCanRedo(hist.current!.redo.length > 0);
  };

  const pending = useRef<'save' | 'persist' | null>(null);
  const markPending = (opts?: UpdateOpts) => {
    if (opts?.save) pending.current = 'save';
    else if (opts?.persist && pending.current !== 'save') pending.current = 'persist';
  };

  const update = useCallback<Update>((fn, opts) => {
    markPending(opts);
    setState(s => produce(s, fn));
  }, []);
  const save = useCallback(() => update(() => {}, { save: true }), [update]);
  // swap in a whole new state (import, example, clear), as one undoable step
  const replace = useCallback((next: PlannerState) => {
    pending.current = 'save';
    setState(next);
  }, []);

  useEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    if (p === 'save') {
      const h = hist.current!, key = historyKey(state);
      if (key !== h.last) {
        h.undo.push(h.last);
        if (h.undo.length > HISTORY_LIMIT) h.undo.shift();
        h.redo = [];
        h.last = key;
        syncHistoryButtons();
      }
    }
    persistState(state);
  }, [state]);

  const applyHistory = (json: string) => {
    const snap = JSON.parse(json) as HistorySnapshot;
    pending.current = 'persist';
    setState(s => {
      const n = { ...s, ...snap };
      if (n.selected?.kind === 'step' && !n.autos[n.activeAuto]?.steps[n.selected.i]) n.selected = null;
      return n;
    });
  };
  const undo = useCallback(() => {
    const h = hist.current!;
    if (!h.undo.length) return;
    h.redo.push(h.last); h.last = h.undo.pop()!;
    applyHistory(h.last); syncHistoryButtons(); toast('Undo');
  }, [toast]);
  const redo = useCallback(() => {
    const h = hist.current!;
    if (!h.redo.length) return;
    h.undo.push(h.last); h.last = h.redo.pop()!;
    applyHistory(h.last); syncHistoryButtons(); toast('Redo');
  }, [toast]);

  return { state, stateRef, update, save, replace, undo, redo, canUndo, canRedo };
}
