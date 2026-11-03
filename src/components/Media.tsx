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
export function AmbientVideo({ src, poster, className = '', onVideo }: { src: string; poster: string; className?: string; onVideo?: (v: HTMLVideoElement | null) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [enabled] = useState(() => !reducedMotion() && !saveData());

  useEffect(() => {
    const v = ref.current;
    onVideo?.(v);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

/**
 * A clip dressed in the brand: brass hairline frame, "548" monogram, bordeaux shade,
 * optional time-keyed captions, a brass progress hairline, a serif numeral, and a
 * scroll-triggered entrance with a brass sweep. Captions are evenly spaced over the clip.
 */
export function BrandClip({
  src,
  poster,
  shape = 'wide',
  captions,
  caption,
  numeral,
  progress = true,
  className = '',
}: {
  src: string;
  poster: string;
  shape?: 'square' | 'wide' | 'portrait';
  captions?: string[];
  caption?: string;
  numeral?: string;
  progress?: boolean;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [ratio, setRatio] = useState(0);
  const [capIndex, setCapIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.1 });
    io.observe(el);
    // Never leave a clip invisible: reveal after a moment even if the observer stays quiet.
    const fallback = window.setTimeout(() => setInView(true), 1800);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const onVideo = (v: HTMLVideoElement | null) => {
    videoRef.current = v;
    if (!v) return;
    const onTime = () => {
      const d = v.duration || 0;
      if (!d) return;
      const r = v.currentTime / d;
      setRatio(r);
      if (captions?.length) setCapIndex(Math.min(captions.length - 1, Math.floor(r * captions.length)));
    };
    v.addEventListener('timeupdate', onTime);
  };

  const label = captions?.length ? captions[capIndex] : caption;
  return (
    <div ref={host} className={`bclip bclip--${shape} ${inView ? 'bclip--in' : ''} ${className}`} aria-hidden="true">
      <AmbientVideo src={src} poster={poster} className="ambient--clip" onVideo={onVideo} />
      <span className="bclip__shade" />
      <span className="bclip__frame" />
      <span className="bclip__sweep" />
      <span className="bclip__mark">548</span>
      {numeral && <span className="bclip__numeral">{numeral}</span>}
      {label && (
        <span className="bclip__cap" key={label}>
          <span className="bclip__cap-rule" />
          {label}
        </span>
      )}
      {progress && <span className="bclip__bar" style={{ transform: `scaleX(${ratio})` }} />}
    </div>
  );
}

/** A branded ambient clip from the manifest; renders nothing until the clip exists. */
export function AmbientClip({ name, shape = 'square', force, caption, numeral }: { name: ClipName | string; shape?: 'square' | 'wide' | 'portrait'; force?: boolean; caption?: string; numeral?: string }) {
  if (!force && !CLIPS[name as ClipName]) return null;
  const base = import.meta.env.BASE_URL;
  return <BrandClip src={`${base}video/${name}.mp4`} poster={`${base}img/photos/${name}-poster.jpg`} shape={shape} caption={caption} numeral={numeral} progress={false} />;
}
