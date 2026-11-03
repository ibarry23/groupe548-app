import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isDemoMode, useApp } from '../lib/store';
import { CITIES, PHONES, type Lang } from '../i18n';
import { byId, FAMILIES, SERVICES, SITUATIONS, type ServiceId } from '../data/services';
import { cityLabel, describeAnswers, submitRequest, toSaved, type ContactPref, type Flex, type QuoteDraft, type TimeWindow } from '../lib/submit';
import { downscaleImage, formatDate, formatPhone, haptic, isPeakDate, isValidEmail, isValidPhone, makeReference, todayIso } from '../lib/format';
import { Icon } from '../components/Icons';
import { Button, CallLink, Chip, Field, Note, Options, Sheet } from '../components/ui';

const STEPS = 5;
const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;

export function Quote() {
  const { t, draft, setDraft, resetDraft, addRequest, toast, online } = useApp();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const step = Math.min(Math.max(draft.step, 0), STEPS - 1);

  // Entry points: ?services=a,b (from a service page) and ?situation=x (from home).
  useEffect(() => {
    const services = params.get('services');
    const situation = params.get('situation');
    const skip = params.get('skip') === '1';
    if (!services && !situation) return;
    setDraft((d) => {
      const next: QuoteDraft = { ...d, answers: { ...d.answers } };
      const add = (ids: ServiceId[]) => {
        for (const id of ids) if (!next.services.includes(id)) next.services = [...next.services, id];
      };
      if (services) add(services.split(',').filter((s): s is ServiceId => SERVICES.some((x) => x.id === s)));
      if (situation) {
        const sit = SITUATIONS.find((s) => s.id === situation);
        if (sit) {
          add(sit.services);
          for (const [k, v] of Object.entries(sit.presets ?? {})) if (next.answers[k] === undefined) next.answers[k] = v;
        }
      }
      next.step = skip && next.services.length > 0 ? 1 : 0;
      return next;
    });
    setParams({}, { replace: true });
  }, [params, setDraft, setParams]);

  const go = useCallback(
    (to: number, direction: 'fwd' | 'back' = 'fwd') => {
      setDir(direction);
      setErrors({});
      setDraft((d) => ({ ...d, step: to }));
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0 });
        bodyRef.current?.querySelector<HTMLElement>('h1')?.focus();
      });
    },
    [setDraft],
  );

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0 && draft.services.length === 0) e.services = t.quote.errService;
    if (s === 3) {
      if (!draft.name.trim()) e.name = t.quote.errName;
      if (!isValidPhone(draft.phone)) e.phone = t.quote.errPhone;
      if (draft.email.trim() && !isValidEmail(draft.email)) e.email = t.quote.errEmail;
    }
    setErrors(e);
    if (Object.keys(e).length) {
      haptic('error');
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"], .field__error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validate(step)) return;
    go(step + 1, 'fwd');
  };
  const back = () => {
    if (step === 0) return setLeaveOpen(draft.services.length > 0 || draft.name.length > 0);
    go(step - 1, 'back');
  };
  const leave = () => {
    setLeaveOpen(false);
    nav('/');
  };

  const submit = async () => {
    if (submitLock.current) return;
    if (!validate(3)) {
      go(3, 'back');
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    const ref = makeReference();
    try {
      const res = await submitRequest(draft, ref);
      if (res.ok) {
        addRequest(toSaved(draft, ref, res.status));
        haptic('success');
        resetDraft();
        nav(`/quote/done/${ref}`, { replace: true });
      } else if (res.reason === 'offline') {
        addRequest(toSaved(draft, ref, 'queued'));
        resetDraft();
        nav(`/quote/done/${ref}`, { replace: true });
      } else {
        addRequest(toSaved(draft, ref, 'failed'));
        haptic('error');
        toast(t.quote.sendFailed, 'error');
        resetDraft();
        nav(`/quote/done/${ref}`, { replace: true });
      }
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const title = [t.quote.s1Title, t.quote.s2Title, t.quote.s3Title, t.quote.s4Title, t.quote.s5Title][step];
  const sub = [t.quote.s1Sub, t.quote.s2Sub, t.quote.s3Sub, t.quote.s4Sub, t.quote.s5Sub][step];

  return (
    <main className="screen screen--flow flow">
      <div className="flow__head">
        <div className="flow__bar">
          <button type="button" className="iconbtn" onClick={back} aria-label={step === 0 ? t.common.close : t.common.back}>
            <Icon name={step === 0 ? 'x' : 'arrow-left'} />
          </button>
          <div className="small" aria-live="polite">
            {t.quote.stepOf(step + 1, STEPS)} · {t.quote.stepsNames[step]}
          </div>
          {step > 0 ? (
            <button type="button" className="iconbtn" onClick={() => setLeaveOpen(true)} aria-label={t.common.close}>
              <Icon name="x" />
            </button>
          ) : (
            <span />
          )}
        </div>
        <div className="progress" aria-hidden="true">
          {Array.from({ length: STEPS }).map((_, i) => (
            <i key={i} data-done={i <= step} />
          ))}
        </div>
      </div>

      <div className="flow__body" data-dir={dir} key={step} ref={bodyRef}>
        <h1 className="h1" tabIndex={-1} style={{ outline: 'none' }}>
          {title}
        </h1>
        <p className="body" style={{ marginTop: 8, marginBottom: 20 }}>
          {sub}
        </p>

        {step === 0 && <StepServices errors={errors} />}
        {step === 1 && <StepDetails />}
        {step === 2 && <StepWhere />}
        {step === 3 && <StepContact errors={errors} />}
        {step === 4 && <StepReview go={(i) => go(i, 'back')} />}
      </div>

      <div className="flow__foot">
        {step === 1 && (
          <Button variant="ghost" className="btn--auto" onClick={next}>
            {t.quote.skipStep}
          </Button>
        )}
        {step < STEPS - 1 ? (
          <Button onClick={next} iconRight="arrow-right">
            {t.common.next}
            {step === 0 && draft.services.length > 0 ? ` · ${t.quote.selectedCount(draft.services.length)}` : ''}
          </Button>
        ) : (
          <Button onClick={submit} loading={submitting} iconRight={online ? 'arrow-right' : 'wifi-off'}>
            {submitting ? t.quote.submitting : t.quote.submit}
          </Button>
        )}
      </div>

      <Sheet
        open={leaveOpen}
        title={t.quote.leaveTitle}
        body={t.quote.leaveBody}
        onClose={() => setLeaveOpen(false)}
        actions={
          <>
            <Button onClick={() => setLeaveOpen(false)}>{t.quote.leaveKeep}</Button>
            <Button variant="secondary" onClick={leave}>
              {t.quote.leaveGo}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                resetDraft();
                setLeaveOpen(false);
                toast(t.quote.draftCleared);
              }}
            >
              {t.quote.startOver}
            </Button>
          </>
        }
      />
    </main>
  );
}

/* ---------------- Step 1: services ---------------- */
function StepServices({ errors }: { errors: Record<string, string> }) {
  const { t, lang, draft, setDraft } = useApp();
  const toggle = (id: ServiceId) => {
    haptic('light');
    setDraft((d) => ({ ...d, services: d.services.includes(id) ? d.services.filter((x) => x !== id) : [...d.services, id] }));
  };
  return (
    <div>
      {errors.services && (
        <div style={{ marginBottom: 14 }}>
          <Note kind="warn" icon="alert">
            {errors.services}
          </Note>
        </div>
      )}
      {FAMILIES.map((fam) => (
        <section key={fam} style={{ marginBottom: 18 }}>
          <h3 className="eyebrow" style={{ marginBottom: 10 }}>
            {t.services.families[fam]}
          </h3>
          <div className="stack" role="group" aria-label={t.services.families[fam]}>
            {SERVICES.filter((s) => s.family === fam).map((s) => {
              const on = draft.services.includes(s.id);
              return (
                <button key={s.id} type="button" className="pick" role="checkbox" aria-checked={on} onClick={() => toggle(s.id)}>
                  {s.clip ? (
                    <img className="pick__img" src={`${import.meta.env.BASE_URL}img/thumbs/${s.id}.jpg`} alt="" width={52} height={52} loading="lazy" />
                  ) : s.image ? (
                    <img className="pick__img" src={img(s.image)} alt="" width={52} height={52} loading="lazy" />
                  ) : (
                    <span className="pick__ico">
                      <Icon name={s.icon} size={24} strokeWidth={1.6} />
                    </span>
                  )}
                  <span>
                    <span className="pick__name">{s.name[lang]}</span>
                    <span className="pick__tag">{s.tagline[lang]}</span>
                  </span>
                  <span className={`option__mark option__mark--square ${on ? '' : ''}`} style={on ? { background: 'var(--bdx-800)', borderColor: 'var(--bdx-800)', color: '#fff' } : undefined}>
                    <Icon name="check" size={13} strokeWidth={3} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------------- Step 2: details per service + photos ---------------- */
function StepDetails() {
  const { t, lang, draft, setDraft, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (key: string, v: string | string[]) => setDraft((d) => ({ ...d, answers: { ...d.answers, [key]: v } }));

  const addPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    const room = 6 - draft.photos.length;
    if (room <= 0) return toast(t.quote.photosLimit);
    const picked = files.slice(0, room);
    const photos = await Promise.all(
      picked.map(async (f) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: f.name, dataUrl: await downscaleImage(f).catch(() => '') })),
    );
    setDraft((d) => ({ ...d, photos: [...d.photos, ...photos.filter((p) => p.dataUrl)] }));
    if (files.length > room) toast(t.quote.photosLimit);
  };

  return (
    <div>
      {draft.services.map((sid) => {
        const svc = byId(sid);
        return (
          <section className="qgroup" key={sid}>
            <h3 className="qgroup__title">
              {svc.clip ? <img className="qgroup__thumb" src={`${import.meta.env.BASE_URL}img/thumbs/${svc.id}.jpg`} alt="" width={34} height={34} /> : <Icon name={svc.icon} size={20} />}
              <span className="h3">{svc.name[lang]}</span>
            </h3>
            {svc.questions.map((q) => {
              const key = `${sid}.${q.id}`;
              if (q.type === 'text') {
                return (
                  <div className="question" key={q.id}>
                    <Field label={q.label[lang]} optional htmlFor={key}>
                      <input id={key} className="input" value={(draft.answers[key] as string) ?? ''} placeholder={q.placeholder?.[lang]} onChange={(e) => set(key, e.target.value)} autoComplete="off" />
                    </Field>
                  </div>
                );
              }
              return (
                <Options
                  key={q.id}
                  label={q.label[lang]}
                  optional
                  multi={q.type === 'multi'}
                  cols={q.cols ?? 2}
                  options={q.options!.map((o) => ({ id: o.id, label: o.label[lang], sub: o.sub?.[lang] }))}
                  value={draft.answers[key]}
                  onChange={(v) => set(key, v)}
                />
              );
            })}
          </section>
        );
      })}

      <section className="qgroup">
        <h3 className="qgroup__title">
          <Icon name="camera" size={20} />
          <span className="h3">{t.quote.photos}</span>
        </h3>
        <p className="small" style={{ marginBottom: 12 }}>
          {t.quote.photosHint}
        </p>
        <div className="photos">
          {draft.photos.map((p) => (
            <div className="photo" key={p.id}>
              <img src={p.dataUrl} alt={p.name} />
              <button type="button" className="photo__rm" aria-label={`${t.common.remove} ${p.name}`} onClick={() => setDraft((d) => ({ ...d, photos: d.photos.filter((x) => x.id !== p.id) }))}>
                <Icon name="x" size={14} strokeWidth={2.4} />
              </button>
            </div>
          ))}
          {draft.photos.length < 6 && (
            <button type="button" className="photo photo--add" onClick={() => fileRef.current?.click()} aria-label={t.quote.addPhotosLabel}>
              <Icon name="plus" size={22} />
              <span>{t.quote.addPhoto}</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={addPhotos} tabIndex={-1} aria-hidden="true" />
        <div className="question" style={{ marginTop: 18 }}>
          <Field label={t.quote.notes} optional htmlFor="notes">
            <textarea id="notes" className="input" value={draft.notes} placeholder={t.quote.notesPlaceholder} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} rows={4} />
          </Field>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Step 3: where & when ---------------- */
function StepWhere() {
  const { t, lang, draft, setDraft } = useApp();
  const needsOther = draft.city === 'other' || draft.city === 'rive-sud' || draft.city === 'rive-nord';
  const peak = isPeakDate(draft.date);
  return (
    <div className="stack-lg">
      <Options label={t.quote.city} optional options={CITIES.map((c) => ({ id: c.id, label: c[lang] }))} value={draft.city} onChange={(v) => setDraft((d) => ({ ...d, city: v as string }))} />
      {needsOther && (
        <Field label={t.quote.cityOther} htmlFor="cityOther">
          <input id="cityOther" className="input" value={draft.cityOther} placeholder={t.quote.cityOtherPlaceholder} onChange={(e) => setDraft((d) => ({ ...d, cityOther: e.target.value }))} autoComplete="address-level2" />
        </Field>
      )}
      <Field label={t.quote.address} optional hint={t.quote.addressHint} htmlFor="address">
        <input id="address" className="input" value={draft.address} placeholder={t.quote.addressPlaceholder} onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))} autoComplete="street-address" />
      </Field>

      <div className="question">
        <div className="question__label">
          <span>{t.quote.when}</span>
        </div>
        <div className="chips">
          <Chip on={draft.asap} icon="clock" onClick={() => setDraft((d) => ({ ...d, asap: true, date: '', flex: 'flexible' }))}>
            {t.quote.asap}
          </Chip>
          <Chip on={!draft.asap} icon="calendar" onClick={() => setDraft((d) => ({ ...d, asap: false }))}>
            {t.quote.planned}
          </Chip>
        </div>
      </div>
      {!draft.asap && (
        <Field label={t.quote.date} optional htmlFor="date">
          <input id="date" type="date" className="input" min={todayIso()} value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
        </Field>
      )}
      {peak && (
        <Note kind="warn" icon="clock">
          {t.quote.julyNote}
        </Note>
      )}

      {!draft.asap && (
      <div className="question">
        <div className="question__label">
          <span>{t.quote.dateFlex}</span>
        </div>
        <div className="chips">
          {(['exact', 'week', 'flexible'] as Flex[]).map((f) => (
            <Chip key={f} on={draft.flex === f} onClick={() => setDraft((d) => ({ ...d, flex: f }))}>
              {t.quote.flex[f]}
            </Chip>
          ))}
        </div>
      </div>
      )}
      <div className="question">
        <div className="question__label">
          <span>{t.quote.timeWindow}</span>
        </div>
        <div className="chips">
          {(['any', 'day', 'evening', 'weekend'] as TimeWindow[]).map((w) => (
            <Chip key={w} on={draft.timeWindow === w} onClick={() => setDraft((d) => ({ ...d, timeWindow: w }))}>
              {t.quote.windows[w]}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 4: contact ---------------- */
function StepContact({ errors }: { errors: Record<string, string> }) {
  const { t, draft, setDraft } = useApp();
  return (
    <div className="stack-lg">
      <Field label={t.quote.name} error={errors.name} htmlFor="name">
        <input id="name" className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} autoComplete="name" aria-invalid={!!errors.name} aria-required="true" />
      </Field>
      <Field label={t.quote.phone} hint={t.quote.phoneHint} error={errors.phone} htmlFor="phone">
        <input
          id="phone"
          className="input"
          type="tel"
          inputMode="tel"
          value={draft.phone}
          placeholder="514 555 0123"
          onChange={(e) => setDraft((d) => ({ ...d, phone: formatPhone(e.target.value) }))}
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          aria-required="true"
        />
      </Field>
      <Field label={t.quote.email} optional error={errors.email} htmlFor="email">
        <input id="email" className="input" type="email" inputMode="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} autoComplete="email" aria-invalid={!!errors.email} autoCapitalize="off" />
      </Field>
      <div className="question">
        <div className="question__label">
          <span>{t.quote.contactPref}</span>
        </div>
        <div className="chips">
          {(['phone', 'sms', 'email'] as ContactPref[]).map((p) => (
            <Chip key={p} on={draft.contactPref === p} icon={p === 'phone' ? 'phone' : p === 'sms' ? 'message' : 'mail'} onClick={() => setDraft((d) => ({ ...d, contactPref: p }))}>
              {t.quote.prefs[p]}
            </Chip>
          ))}
        </div>
      </div>
      <div className="question">
        <div className="question__label">
          <span>{t.quote.langPref}</span>
        </div>
        <div className="chips">
          {(['fr', 'en'] as Lang[]).map((l) => (
            <Chip key={l} on={draft.lang === l} onClick={() => setDraft((d) => ({ ...d, lang: l }))}>
              {t.quote.langs[l]}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step 5: review ---------------- */
function StepReview({ go }: { go: (i: number) => void }) {
  const { t, lang, draft } = useApp();
  const groups = useMemo(() => describeAnswers(draft, lang), [draft, lang]);
  const r = t.quote.review;
  return (
    <div className="stack-lg">
      <div className="review">
        <section className="review__sec">
          <div className="review__head">
            <strong>{r.services}</strong>
            <button type="button" onClick={() => go(0)}>
              {t.common.edit}
            </button>
          </div>
          <div className="chips">
            {draft.services.map((s) => (
              <span className="chip chip--on" key={s}>
                {byId(s).name[lang]}
              </span>
            ))}
          </div>
        </section>
        <section className="review__sec">
          <div className="review__head">
            <strong>{r.details}</strong>
            <button type="button" onClick={() => go(1)}>
              {t.common.edit}
            </button>
          </div>
          {groups.every((g) => g.lines.length === 0) && !draft.notes && draft.photos.length === 0 ? (
            <p className="small">{r.noDetails}</p>
          ) : (
            <div className="stack">
              {groups.map(({ service, lines }) =>
                lines.length ? (
                  <div key={service.id}>
                    {draft.services.length > 1 && (
                      <p className="small strong" style={{ marginBottom: 4 }}>
                        {service.name[lang]}
                      </p>
                    )}
                    <dl>
                      {lines.map((l) => (
                        <div key={l.label} style={{ display: 'contents' }}>
                          <dt>{l.label}</dt>
                          <dd>{l.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null,
              )}
              {draft.notes && (
                <dl>
                  <dt>{t.quote.notes}</dt>
                  <dd>{draft.notes}</dd>
                </dl>
              )}
              {draft.photos.length > 0 && <p className="small">{r.photosCount(draft.photos.length)}</p>}
            </div>
          )}
        </section>
        <section className="review__sec">
          <div className="review__head">
            <strong>{r.where}</strong>
            <button type="button" onClick={() => go(2)}>
              {t.common.edit}
            </button>
          </div>
          <dl>
            <dt>{t.quote.city}</dt>
            <dd>{cityLabel(draft, lang) || '—'}</dd>
            {draft.address && (
              <>
                <dt>{t.quote.address}</dt>
                <dd>{draft.address}</dd>
              </>
            )}
            <dt>{t.quote.date}</dt>
            <dd>
              {draft.asap
                ? `${t.quote.asap} · ${t.quote.windows[draft.timeWindow]}`
                : draft.date
                  ? `${formatDate(draft.date, lang)} · ${t.quote.flex[draft.flex]} · ${t.quote.windows[draft.timeWindow]}`
                  : `${r.noDate} · ${t.quote.windows[draft.timeWindow]}`}
            </dd>
          </dl>
        </section>
        <section className="review__sec">
          <div className="review__head">
            <strong>{r.contact}</strong>
            <button type="button" onClick={() => go(3)}>
              {t.common.edit}
            </button>
          </div>
          <dl>
            <dt>{t.quote.name}</dt>
            <dd>{draft.name}</dd>
            <dt>{t.quote.phone}</dt>
            <dd>{draft.phone}</dd>
            {draft.email && (
              <>
                <dt>{t.quote.email}</dt>
                <dd>{draft.email}</dd>
              </>
            )}
            <dt>{t.quote.contactPrefShort}</dt>
            <dd>
              {t.quote.prefs[draft.contactPref]} · {t.quote.langs[draft.lang]}
            </dd>
          </dl>
        </section>
      </div>

      {isDemoMode ? (
        <Note kind="info" icon="info">
          {t.quote.demoNotice}
        </Note>
      ) : draft.photos.length > 0 ? (
        <Note icon="camera">{t.quote.photosNotSent}</Note>
      ) : null}
      <p className="small">{t.quote.consent}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <CallLink tel={PHONES[0].tel} className="link">
          {t.common.callNow} · {PHONES[0].label}
        </CallLink>
      </div>
    </div>
  );
}
