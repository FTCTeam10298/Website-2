import { useCallback, useEffect, useRef, useState, type RefObject, type VideoHTMLAttributes } from 'react';
import type { Update } from './usePlanner';

// Match footage drawn over the field: either a local video file or a YouTube embed.
// Alignment (opacity / scale / offset / perspective / rotation) lives in planner state.

function parseYoutubeId(raw: string) {
  const s = (raw || '').trim();
  if (!s) return '';
  try {
    const u = new URL(s);
    if (u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0] || '';
    const v = u.searchParams.get('v');
    if (v) return v;
    const parts = u.pathname.split('/').filter(Boolean);
    const key = parts.findIndex(p => ['embed', 'shorts', 'live'].includes(p));
    if (key >= 0 && parts[key + 1]) return parts[key + 1];
  } catch { /* not a full URL: try the loose pattern below */ }
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : '';
}

function youtubeEmbedUrl(id: string) {
  const params = new URLSearchParams({
    playsinline: '1', rel: '0', origin: location.origin, enablejsapi: '1', widget_referrer: location.href,
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params.toString()}`;
}

export type VideoKind = '' | 'local' | 'youtube';

export interface VideoOverlay {
  videoRef: RefObject<HTMLVideoElement>;
  iframeRef: RefObject<HTMLIFrameElement>;
  kind: VideoKind;
  localSrc: string | null;
  youtubeSrc: string | null;
  loaded: boolean;
  localLoaded: boolean;
  playing: boolean;
  time: number;
  duration: number;
  loadYoutube: (raw: string, notify: boolean) => boolean;
  loadFile: (file: File) => void;
  clear: () => void;
  togglePlay: () => void;
  scrubTo: (frac: number) => void;
  endScrub: () => void;
  videoEvents: Pick<VideoHTMLAttributes<HTMLVideoElement>,
    'onLoadedMetadata' | 'onTimeUpdate' | 'onPlay' | 'onPause' | 'onEnded'>;
}

export function useVideoOverlay(initialYoutubeUrl: string, update: Update, toast: (msg: string) => void): VideoOverlay {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [kind, setKind] = useState<VideoKind>('');
  const [localSrc, setLocalSrc] = useState<string | null>(null);
  const [youtubeSrc, setYoutubeSrc] = useState<string | null>(null);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [localPlaying, setLocalPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const scrubbing = useRef(false);

  const dropLocal = useCallback(() => {
    videoRef.current?.pause();
    setLocalSrc(src => { if (src) URL.revokeObjectURL(src); return null; });
    setLocalPlaying(false); setTime(0); setDuration(0);
  }, []);

  const clear = useCallback(() => {
    dropLocal();
    setYoutubeSrc(null); setYtPlaying(false); setKind('');
    update(d => { d.youtubeUrl = ''; });
  }, [dropLocal, update]);

  const loadYoutube = useCallback((raw: string, notify: boolean) => {
    const id = parseYoutubeId(raw);
    if (!id) { if (notify) toast('Bad YouTube link'); return false; }
    dropLocal();
    setKind('youtube'); setYtPlaying(false); setYoutubeSrc(youtubeEmbedUrl(id));
    update(d => { d.youtubeUrl = raw.trim(); d.videoShow = true; }, { save: notify });
    if (notify) toast('YouTube loaded');
    return true;
  }, [dropLocal, update, toast]);

  const loadFile = useCallback((file: File) => {
    dropLocal();
    setYoutubeSrc(null); setYtPlaying(false);
    setKind('local'); setLocalSrc(URL.createObjectURL(file));
    update(d => { d.youtubeUrl = ''; d.videoShow = true; }, { save: true });
    toast('Video loaded');
  }, [dropLocal, update, toast]);

  // restore a saved YouTube overlay on load
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (initialYoutubeUrl) loadYoutube(initialYoutubeUrl, false);
  }, [initialYoutubeUrl, loadYoutube]);

  // smooth time readout while a local video plays
  useEffect(() => {
    if (!localPlaying) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && !scrubbing.current) setTime(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [localPlaying]);

  const togglePlay = useCallback(async () => {
    if (kind === 'youtube') {
      const next = !ytPlaying;
      setYtPlaying(next);
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: next ? 'playVideo' : 'pauseVideo', args: [] }), '*');
      return;
    }
    const v = videoRef.current;
    if (!v || !localSrc) return;
    if (v.paused) {
      try { await v.play(); } catch { toast('Video blocked'); }
    } else {
      v.pause();
    }
  }, [kind, ytPlaying, localSrc, toast]);

  const scrubTo = useCallback((frac: number) => {
    const v = videoRef.current;
    scrubbing.current = true;
    if (v && Number.isFinite(v.duration) && v.duration > 0) {
      v.currentTime = frac * v.duration;
      setTime(v.currentTime);
    }
  }, []);
  const endScrub = useCallback(() => { scrubbing.current = false; }, []);

  const localLoaded = kind === 'local' && !!localSrc && Number.isFinite(duration) && duration > 0;
  const loaded = localLoaded || (kind === 'youtube' && !!youtubeSrc);

  return {
    videoRef, iframeRef, kind, localSrc, youtubeSrc, loaded, localLoaded,
    playing: kind === 'youtube' ? ytPlaying : localPlaying,
    time, duration,
    loadYoutube, loadFile, clear, togglePlay, scrubTo, endScrub,
    videoEvents: {
      onLoadedMetadata: e => { setDuration(e.currentTarget.duration); setTime(e.currentTarget.currentTime); },
      onTimeUpdate: e => { if (!scrubbing.current) setTime(e.currentTarget.currentTime); },
      onPlay: () => setLocalPlaying(true),
      onPause: () => setLocalPlaying(false),
      onEnded: () => setLocalPlaying(false),
    },
  };
}
