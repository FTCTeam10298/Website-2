import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildTimeline, nextFeatureEnd, type Timeline } from '../model/simulator';
import type { PlannerState } from '../model/types';

export interface SimState {
  active: boolean;            // the sim robot is drawn on the field
  playing: boolean;
  t: number;                  // seconds
  rate: number;               // playback speed multiplier
  stepTarget: number | null;  // "Step" pauses when t reaches this
}

export interface Simulator {
  sim: SimState;
  timeline: Timeline;
  togglePlay: () => void;
  restart: () => void;
  stepFeature: () => void;
  scrubTo: (frac: number) => void;
  setRate: (rate: number) => void;
}

export function useSimulator(state: PlannerState): Simulator {
  const auto = state.autos[state.activeAuto];
  const timeline = useMemo(() => buildTimeline(auto, state.simMaxV, state.simMaxA),
                           [auto, state.simMaxV, state.simMaxA]);
  const [sim, setSim] = useState<SimState>({ active: false, playing: false, t: 0, rate: 1, stepTarget: null });
  const total = timeline.total;

  // restart the sim whenever another auto becomes active
  useEffect(() => {
    setSim(s => ({ ...s, playing: false, t: 0, stepTarget: null }));
  }, [state.activeAuto]);

  useEffect(() => {
    if (!sim.playing) return;
    let last = 0, raf = 0;
    const frame = (ts: number) => {
      const dt = last ? (ts - last) / 1000 : 0;
      last = ts;
      setSim(s => {
        if (!s.playing) return s;
        let t = s.t + dt * s.rate, stepTarget = s.stepTarget, playing = true;
        if (stepTarget != null && t >= stepTarget) { t = stepTarget; stepTarget = null; playing = false; }
        if (t >= total) { t = total; playing = false; }
        return { ...s, t, stepTarget, playing };
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [sim.playing, total]);

  const hasSegs = timeline.segs.length > 0;

  const togglePlay = useCallback(() => setSim(s => {
    if (s.playing) return { ...s, playing: false };
    if (!hasSegs) return s;
    return { ...s, active: true, playing: true, stepTarget: null, t: s.t >= total ? 0 : s.t };
  }), [hasSegs, total]);

  const restart = useCallback(() => setSim(s => ({ ...s, active: true, playing: false, t: 0, stepTarget: null })), []);

  const stepFeature = useCallback(() => setSim(s => {
    if (!hasSegs) return { ...s, active: true };
    const t = s.t >= total ? 0 : s.t;
    return { ...s, active: true, playing: true, t, stepTarget: nextFeatureEnd(timeline, t) };
  }), [hasSegs, total, timeline]);

  const scrubTo = useCallback((frac: number) => setSim(s => ({
    ...s, active: true, playing: false, t: Math.max(0, Math.min(1, frac)) * total,
  })), [total]);

  const setRate = useCallback((rate: number) => setSim(s => ({ ...s, rate })), []);

  // the path may have shrunk under a paused sim
  const clamped = sim.t > total ? { ...sim, t: total } : sim;
  return { sim: clamped, timeline, togglePlay, restart, stepFeature, scrubTo, setRate };
}
