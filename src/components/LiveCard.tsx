import { useEffect, useId, useState } from 'react';
import { useApp } from '../lib/store';
import { PHONES } from '../i18n';
import { cityLabel, type CustomerStage, type SavedRequest } from '../lib/submit';
import { formatDate } from '../lib/format';
import { hasStatusFeed, minutesSince, parseEta, timeOf } from '../lib/status';
import { Button, CallLink } from './ui';
import { LiveStage } from './LiveStage';

const STEPS: CustomerStage[] = ['scheduled', 'en-route', 'arrived', 'in-progress', 'done'];
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

  return (
    <section className={`card live live--${stage}`} aria-live="polite">
      <span className="live__frame" aria-hidden="true" />
      {driving && motion && <span className="live__sweep" aria-hidden="true" />}
      <div className="live__head">
        <h2 className="h3">{t.requests.liveTitle}</h2>
        {preview ? <span className="status status--demo">{t.requests.preview}</span> : r.tracked ? <span className="status status--live">{t.requests.trackedBy}</span> : null}
      </div>

      <LiveStage stage={stage} motion={motion} uid={uid} teamLabel={t.requests.liveTeam} whereLabel={where} />

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
