import { useState } from 'react';
import type { PlannerState } from '../model/types';
import type { Update } from '../hooks/usePlanner';
import type { VideoOverlay } from '../hooks/useVideoOverlay';
import { Card, Check, FileLink, Range } from './ui';

interface Props {
  state: PlannerState;
  update: Update;
  save: () => void;
  video: VideoOverlay;
  toast: (msg: string) => void;
}

function fmtTime(t: number) {
  if (!Number.isFinite(t) || t < 0) t = 0;
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
}

export default function VideoOverlayCard({ state, update, save, video, toast }: Props) {
  const [url, setUrl] = useState(state.youtubeUrl);
  const [prevUrl, setPrevUrl] = useState(state.youtubeUrl);
  if (state.youtubeUrl !== prevUrl) { setPrevUrl(state.youtubeUrl); setUrl(state.youtubeUrl); }

  const status = !video.loaded ? 'none' : video.kind === 'youtube' ? 'YouTube' : (video.playing ? 'playing' : 'loaded');
  const slider = (label: string, value: number, min: number, max: number, unit: string,
                  set: (d: PlannerState, v: number) => void, display = String(value)) => (
    <div className="np-row" style={{ marginTop: 8 }}>
      <label className="np-fld" style={{ flex: 1 }}>{label}
        <Range className="np-wide-range" min={min} max={max} value={value} onCommit={save}
          onChange={v => update(d => set(d, v))} />
      </label>
      <span className="np-mini" style={{ width: 35, textAlign: 'right' }}>{display}{unit}</span>
    </div>
  );

  return (
    <Card title="Video overlay" pill={status}>
      <div className="np-row">
        <label className="np-fld" style={{ flex: 1 }}>YouTube link
          <input type="text" placeholder="Paste a YouTube URL" value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); video.loadYoutube(url, true); } }} />
        </label>
        <button className="np-sm" style={{ alignSelf: 'flex-end' }} onClick={() => video.loadYoutube(url, true)}>Load link</button>
      </div>
      <div className="np-row">
        <FileLink asButton accept="video/*" onFile={video.loadFile}>Load video</FileLink>
        <button className="np-primary np-sm" disabled={!video.loaded} onClick={video.togglePlay}>{video.playing ? 'Pause' : 'Play'}</button>
        <button className="np-sm np-danger" disabled={!video.loaded}
          onClick={() => { video.clear(); save(); toast('Video cleared'); }}>Clear</button>
        <span className="np-spacer" />
        <Check label="Show" checked={state.videoShow} onChange={v => update(d => { d.videoShow = v; }, { save: true })} />
      </div>
      <div className="np-row" style={{ marginTop: 8 }}>
        <label className="np-fld" style={{ flex: 1 }}>Scrub
          <input type="range" min={0} max={1000} disabled={!video.localLoaded}
            value={video.localLoaded ? Math.round(video.time / video.duration * 1000) : 0}
            onChange={e => video.scrubTo(+e.target.value / 1000)} onPointerUp={video.endScrub} onKeyUp={video.endScrub} />
        </label>
      </div>
      <div className="np-row" style={{ marginTop: 8 }}>
        <label className="np-fld" style={{ flex: 1 }}>Opacity
          <Range className="np-wide-range" min={0} max={100} value={Math.round((state.videoOpacity ?? 0.55) * 100)}
            onChange={v => update(d => { d.videoOpacity = v / 100; })} onCommit={save} />
        </label>
        <button className="np-sm" title="Rotate video counter-clockwise"
          onClick={() => update(d => { d.videoRot = ((d.videoRot || 0) + 270) % 360; }, { save: true })}>⟲</button>
        <button className="np-sm" title="Rotate video clockwise"
          onClick={() => update(d => { d.videoRot = ((d.videoRot || 0) + 90) % 360; }, { save: true })}>⟳</button>
        <button className="np-sm" title="Reset video size & alignment" onClick={() => {
          update(d => { d.videoScale = 1; d.videoOffsetX = 0; d.videoOffsetY = 0; d.videoRot = 0; }, { save: true });
          toast('Alignment reset');
        }}>Reset</button>
        <span className="np-mini">{video.localLoaded ? `${fmtTime(video.time)} / ${fmtTime(video.duration)}` : 'YouTube'}</span>
      </div>
      {slider('Scale', Math.round((state.videoScale ?? 1) * 100), 10, 400, '%', (d, v) => { d.videoScale = (v || 100) / 100; })}
      {slider('Offset X', state.videoOffsetX || 0, -360, 360, 'px', (d, v) => { d.videoOffsetX = v; })}
      {slider('Offset Y', state.videoOffsetY || 0, -360, 360, 'px', (d, v) => { d.videoOffsetY = v; })}
      {slider('Perspective Pitch (X)', state.videoPerspectiveX || 0, -60, 60, '°', (d, v) => { d.videoPerspectiveX = v; })}
      {slider('Perspective Yaw (Y)', state.videoPerspectiveY || 0, -60, 60, '°', (d, v) => { d.videoPerspectiveY = v; })}
    </Card>
  );
}
