import { useEffect, useId, useState } from 'react';
import { useApp } from '../lib/store';
import { PHONES } from '../i18n';
import { cityLabel, type CustomerStage, type SavedRequest } from '../lib/submit';
import { formatDate } from '../lib/format';
import { hasStatusFeed, minutesSince, parseEta, timeOf } from '../lib/status';
import { Button, CallLink } from './ui';

/** The road: a gentle hill from the depot (left) to the customer's door (right), in a 320×110 box. */
const ROAD = 'M22 80 C 84 80 104 30 160 30 S 236 80 298 80';
const TRUCK = 'M2 7h11v9H2zM13 10h4l3 3v3h-7zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z';
const HOUSE = 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10';
const CHECK = 'm5 12 5 5L20 7';
const STEPS: CustomerStage[] = ['scheduled', 'en-route', 'arrived', 'in-progress', 'done'];
/* one drive: wait, drive (ease-in-out), pause at the door, fade */
const KEY_TIMES = '0;0.08;0.8;0.94;1';
const SPLINES = '0 0 1 1;0.42 0 0.22 1;0 0 1 1;0 0 1 1';
const DUR = '7.5s';
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Live tracking panel: a bordeaux stage with a brass road, the team's truck driving to the
 * customer's door and tracing a glowing trail, ripples at the door, a five-step timeline and
 * a large expected-arrival time with a live countdown. Data comes from the team's status feed.
 */
export function LiveCard({ r, preview, onRefresh, refreshing }: { r: SavedRequest; preview: boolean; onRefresh: () => void; refreshing: boolean }) {
  const { t, lang, toast } = useApp();
  const uid = useId().replace(/:/g, '');
  const stage = (r.stage ?? 'scheduled') as CustomerStage;
  const idx = Math.max(0, STEPS.indexOf(stage));
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const [perm, setPerm] = useState<string>(() => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission));
  const askNotify = async () => {
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === 'granted') toast(t.requests.notifyOn, 'success');
  };

  const motion = !reduced();
  const live = hasStatusFeed() || preview;
  const driving = stage === 'en-route';
  const atDoor = stage === 'arrived' || stage === 'in-progress' || stage === 'done';
  const where = cityLabel(r.draft, lang) || t.requests.liveYou;
  const eta = driving || stage === 'scheduled' ? parseEta(r.eta, now, lang) : null;

  // Headline block: what the customer most wants to know, in one glance.
  let eyebrow: string;
  let big: string;
  let sub: string | undefined;
  if (driving) {
    eyebrow = t.requests.etaLabel;
    big = eta?.display ?? '—';
    sub = eta?.minutes == null ? undefined : eta.minutes <= 0 ? t.requests.etaNow : t.requests.etaIn(eta.minutes);
  } else if (stage === 'scheduled') {
    eyebrow = t.requests.scheduledFor;
    big = r.draft.date ? formatDate(r.draft.date, lang) : t.requests.dateTbc;
    sub = eta ? t.requests.eta(eta.display) : undefined;
  } else if (stage === 'done') {
    eyebrow = t.requests.stages.done;
    big = t.requests.thanks;
    sub = t.requests.liveBy.done;
  } else {
    eyebrow = t.requests.stages[stage];
    big = timeOf(r.teamUpdatedAt, lang) || t.requests.stepShort[stage];
    sub = t.requests.liveBy[stage];
  }

  const truckAt = driving ? undefined : atDoor ? 'translate(270 80)' : 'translate(44 80)';
  return (
    <section className={`card live live--${stage}`} aria-live="polite">
      <span className="live__frame" aria-hidden="true" />
      {driving && motion && <span className="live__sweep" aria-hidden="true" />}
      <div className="live__head">
        <h2 className="h3">{t.requests.liveTitle}</h2>
        {preview ? <span className="status status--demo">{t.requests.preview}</span> : r.tracked ? <span className="status status--live">{t.requests.trackedBy}</span> : null}
      </div>

      <svg className="road" viewBox="0 0 320 110" aria-hidden="true">
        <defs>
          <filter id={`g${uid}`} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path id={`r${uid}`} d={ROAD} className="road__base" />
        <path d={ROAD} className="road__trail" pathLength={1} filter={`url(#g${uid})`} style={driving && motion ? undefined : { strokeDashoffset: atDoor ? 0 : 1 }}>
          {driving && motion && <animate attributeName="stroke-dashoffset" values="1;1;0;0;0" keyTimes={KEY_TIMES} calcMode="spline" keySplines={SPLINES} dur={DUR} repeatCount="indefinite" />}
          {driving && motion && <animate attributeName="opacity" values="1;1;1;1;0" keyTimes={KEY_TIMES} dur={DUR} repeatCount="indefinite" />}
        </path>

        <g transform="translate(22 80)" className="road__depot">
          <circle r="7" />
          <text y="22" textAnchor="middle" className="road__label">
            {t.requests.liveTeam}
          </text>
        </g>

        <g transform="translate(298 80)" className="road__door">
          {motion && (driving || stage === 'arrived' || stage === 'in-progress') && (
            <>
              <circle r="12" className="road__ripple">
                <animate attributeName="r" values="12;30" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0" dur="2.6s" repeatCount="indefinite" />
              </circle>
              <circle r="12" className="road__ripple">
                <animate attributeName="r" values="12;30" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
              </circle>
            </>
          )}
          <circle r="13" className="road__house" />
          <path d={stage === 'done' ? CHECK : HOUSE} transform="translate(-8 -8) scale(0.66)" className="road__glyph" />
          <text y="30" textAnchor="middle" className="road__label">
            {where}
          </text>
        </g>

        <g className="road__truck" transform={truckAt} opacity={driving && motion ? 0 : 1}>
          <circle r="13" className="road__truckbg" />
          <path d={TRUCK} transform="translate(-12 -12)" className="road__truckico" />
          {driving && motion && (
            <>
              <animateMotion dur={DUR} repeatCount="indefinite" rotate="auto" calcMode="spline" keyPoints="0;0;1;1;1" keyTimes={KEY_TIMES} keySplines={SPLINES}>
                <mpath href={`#r${uid}`} />
              </animateMotion>
              <animate attributeName="opacity" values="0;1;1;1;0" keyTimes={KEY_TIMES} dur={DUR} repeatCount="indefinite" />
            </>
          )}
        </g>
      </svg>

      <ol className="steps" aria-label={t.requests.liveTitle}>
        {STEPS.map((s, i) => (
          <li key={s} className={`steps__item ${i < idx ? 'steps__item--done' : i === idx ? 'steps__item--now' : ''}`} aria-current={i === idx ? 'step' : undefined}>
            <span className="steps__dot" />
            <span className="steps__label">{t.requests.stepShort[s]}</span>
          </li>
        ))}
      </ol>

      <div className="live__headline">
        <p className="live__eyebrow">{eyebrow}</p>
        <p className="live__big">{big}</p>
        {sub && <p className="live__sub">{sub}</p>}
        {r.teamNote && <p className="live__note">{r.teamNote}</p>}
      </div>

      <p className="live__meta">
        {live ? (
          <>
            {t.requests.updatedAgo(minutesSince(r.teamUpdatedAt))}
            {!preview && (
              <>
                {' · '}
                <button type="button" className="link" onClick={onRefresh} disabled={refreshing}>
                  {t.requests.refresh}
                </button>
              </>
            )}
          </>
        ) : (
          t.requests.noFeed
        )}
      </p>

      {((live && stage === 'scheduled' && perm === 'default') || driving || stage === 'arrived' || stage === 'in-progress') && (
        <div className="btn-row live__actions">
          {live && stage === 'scheduled' && perm === 'default' && (
            <Button variant="onbrand" size="sm" icon="alert" onClick={askNotify}>
              {t.requests.notify}
            </Button>
          )}
          {(driving || stage === 'arrived' || stage === 'in-progress') && (
            <CallLink tel={PHONES[0].tel} className="btn btn--onbrand-ghost btn--sm">
              {t.requests.callTeam}
            </CallLink>
          )}
        </div>
      )}
    </section>
  );
}
