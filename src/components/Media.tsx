import { useEffect, useRef, useState } from 'react';
import { CLIPS, type ClipName } from '../data/clips';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const saveData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c?.saveData || c?.effectiveType === '2g' || c?.effectiveType === 'slow-2g';
};

/**
 * Ambient background video: muted, looping, inline. Shows the poster only when the
 * person prefers reduced motion or is on a data-saver / very slow connection, and
 * fades the video in once it can play so there is never a flash.
 */
export function AmbientVideo({ src, poster, className = '' }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [enabled] = useState(() => !reducedMotion() && !saveData());

  useEffect(() => {
    const v = ref.current;
    if (!v || !enabled) return;
    const onCan = () => {
      setReady(true);
      v.play().catch(() => {});
    };
    if (v.readyState >= 3) onCan(); // already buffered (cached) before the listener attached
    v.addEventListener('canplay', onCan);
    // Pause when the app goes to the background to save battery.
    const onVis = () => (document.hidden ? v.pause() : v.play().catch(() => {}));
    document.addEventListener('visibilitychange', onVis);
    return () => {
      v.removeEventListener('canplay', onCan);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [enabled]);

  return (
    <div className={`ambient ${className}`} aria-hidden="true">
      <img className="ambient__poster" src={poster} alt="" decoding="async" {...{ fetchpriority: 'high' }} />
      {enabled && <video ref={ref} className={`ambient__video ${ready ? 'ambient__video--on' : ''}`} src={src} poster={poster} muted loop playsInline autoPlay preload="auto" disablePictureInPicture />}
    </div>
  );
}

/**
 * "Living photo": a still photograph with a very slow drift and a soft light sweep,
 * so service pages feel alive without a video per service. Static under reduced motion.
 */
export function LivingPhoto({ src, alt = '', className = '', priority }: { src: string; alt?: string; className?: string; priority?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // A cached image can finish before React attaches onLoad.
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src]);
  return (
    <div className={`living ${loaded ? 'living--on' : ''} ${className}`}>
      <img ref={ref} src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(true)} />
      <span className="living__sweep" aria-hidden="true" />
    </div>
  );
}

/** A rounded card holding an ambient clip; renders nothing until the clip exists in the manifest. */
export function AmbientClip({ name, shape = 'square', force }: { name: ClipName | string; shape?: 'square' | 'wide' | 'portrait'; force?: boolean }) {
  if (!force && !CLIPS[name as ClipName]) return null;
  const base = import.meta.env.BASE_URL;
  return (
    <div className={`clip-card clip-card--${shape}`} aria-hidden="true">
      <AmbientVideo src={`${base}video/${name}.mp4`} poster={`${base}img/photos/${name}-poster.jpg`} className="ambient--clip" />
    </div>
  );
}
