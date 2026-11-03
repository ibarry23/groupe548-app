import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../lib/store';
import { PHONES } from '../i18n';
import { byId } from '../data/services';
import { cityLabel, describeAnswers, type CustomerStage, type SavedRequest } from '../lib/submit';
import { formatDate } from '../lib/format';
import { Icon } from '../components/Icons';
import { Button, CallLink, Chip, Empty, Sheet, StatusPill, TopBar } from '../components/ui';
import { downloadIcs, mailtoCopy, shareText } from '../lib/format';
import { AmbientClip } from '../components/Media';

const titleOf = (r: SavedRequest, lang: 'fr' | 'en') => r.draft.services.map((s) => byId(s).name[lang]).join(' + ');

export function Requests() {
  const { t, lang, requests, hasDraft, draft } = useApp();
  const nav = useNavigate();
  return (
    <main className="screen">
      <header className="container" style={{ paddingTop: 'calc(var(--sat) + 22px)' }}>
        <p className="eyebrow">{t.app.name}</p>
        <h1 className="h1" style={{ marginTop: 6 }}>
          {t.requests.title}
        </h1>
        <p className="body" style={{ marginTop: 8 }}>
          {t.requests.sub}
        </p>
      </header>

      <div className="container stack" style={{ marginTop: 20 }}>
        {hasDraft && (
          <button type="button" className="req" onClick={() => nav('/quote')} style={{ borderStyle: 'dashed' }}>
            <div className="req__top">
              <span className="req__ref" style={{ color: 'var(--fg-subtle)' }}>
                {t.requests.draftTitle}
              </span>
              <Icon name="edit" size={18} className="ico" style={{ color: 'var(--brand)' }} />
            </div>
            <div className="req__title">{draft.services.map((s) => byId(s).name[lang]).join(' + ') || t.requests.draftBody}</div>
            <div className="req__meta">{t.quote.resume}</div>
          </button>
        )}

        {requests.length === 0 && !hasDraft ? (
          <>
            <AmbientClip name="empty-requests" shape="square" />
            <Empty icon="inbox" title={t.requests.emptyTitle} body={t.requests.emptyBody}>
              <Button onClick={() => nav('/quote')} iconRight="arrow-right">
                {t.requests.emptyCta}
              </Button>
            </Empty>
          </>
        ) : (
          requests.map((r) => (
            <button type="button" className="req" key={r.ref} onClick={() => nav(`/requests/${r.ref}`)}>
              <div className="req__top">
                <span className="req__ref">{r.ref}</span>
                {r.stage && r.stage !== 'sent' ? <span className="status status--sent">{t.requests.stages[r.stage]}</span> : <StatusPill status={r.status} />}
              </div>
              <div className="req__body">
                <img className="req__thumb" src={`${import.meta.env.BASE_URL}img/thumbs/${r.draft.services[0]}.jpg`} alt="" loading="lazy" width={44} height={44} />
                <div>
                  <div className="req__title">{titleOf(r, lang)}</div>
                  <div className="req__meta">
                    {formatDate(r.createdAt, lang)}
                    {r.draft.asap ? ` · ${t.quote.asap.toLowerCase()}` : r.draft.date ? ` · ${t.quote.date.toLowerCase()} : ${formatDate(r.draft.date, lang)}` : ''}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </main>
  );
}

export function RequestDetail() {
  const { ref } = useParams();
  const { t, lang, requests, resend, removeRequest, updateRequest, setDraft, online, toast } = useApp();
  const nav = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const r = requests.find((x) => x.ref === ref);
  if (!r) return <Navigate to="/requests" replace />;
  const retry = async () => {
    setBusy(true);
    await resend(r.ref);
    setBusy(false);
  };
  const share = async () => {
    const res = await shareText('Groupe 548', t.confirm.shareText(r.ref, titleOf(r, lang)));
    if (res === 'copied') toast(t.confirm.shared, 'success');
  };
  const calendar = () => r.draft.date && downloadIcs(r.ref, r.draft.date, t.confirm.calendarTitle, t.confirm.calendarDesc(r.ref));
  const emailCopy = () => mailtoCopy(r.draft.email, t.confirm.emailSubject(r.ref), t.confirm.shareText(r.ref, titleOf(r, lang)));
  const groups = describeAnswers(r.draft, lang);

  const repeat = () => {
    const { photoCount: _pc, ...rest } = r.draft;
    setDraft(() => ({ ...rest, date: '', photos: [], step: 0 }));
    toast(t.requests.repeat, 'success');
    nav('/quote');
  };

  return (
    <main className="screen">
      <TopBar title={t.requests.detailTitle} />
      <div className="container stack-lg" style={{ paddingTop: 12 }}>
        <div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <p className="h1">{r.ref}</p>
            <StatusPill status={r.status} />
          </div>
          <p className="body" style={{ marginTop: 6 }}>
            {t.requests.statusHelp[r.status]}
          </p>
          <p className="small" style={{ marginTop: 6 }}>
            {r.sentAt ? `${t.requests.sentOn} ${formatDate(r.sentAt, lang, true)}` : `${t.requests.createdOn} ${formatDate(r.createdAt, lang, true)}`}
          </p>
        </div>

        {(r.status === 'failed' || r.status === 'queued') && (
          <Button icon="refresh" onClick={retry} loading={busy} disabled={!online}>
            {t.requests.resend}
          </Button>
        )}
        {r.status !== 'failed' && <AmbientClip name="confirmation" shape="wide" />}

        {(r.status === 'sent' || r.status === 'demo') && (
          <section className="card card--pad">
            <h2 className="h3">{t.requests.stageTitle}</h2>
            <p className="small" style={{ marginTop: 4, marginBottom: 12 }}>
              {t.requests.stageSub}
            </p>
            <div className="chips">
              {(['sent', 'quoted', 'scheduled', 'done'] as CustomerStage[]).map((st) => (
                <Chip key={st} on={(r.stage ?? 'sent') === st} onClick={() => updateRequest(r.ref, { stage: st })}>
                  {t.requests.stages[st]}
                </Chip>
              ))}
            </div>
          </section>
        )}

        <div className="review">
          <section className="review__sec">
            <strong style={{ fontSize: '0.9rem' }}>{t.quote.review.services}</strong>
            <div className="chips" style={{ marginTop: 8 }}>
              {r.draft.services.map((s) => (
                <span className="chip chip--on" key={s}>
                  {byId(s).name[lang]}
                </span>
              ))}
            </div>
          </section>
          <section className="review__sec">
            <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>{t.quote.review.details}</strong>
            {groups.every((g) => g.lines.length === 0) && !r.draft.notes ? (
              <p className="small">{t.quote.review.noDetails}</p>
            ) : (
              <div className="stack">
                {groups.map(({ service, lines }) =>
                  lines.length ? (
                    <dl key={service.id}>
                      {lines.map((l) => (
                        <div key={l.label} style={{ display: 'contents' }}>
                          <dt>{l.label}</dt>
                          <dd>{l.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null,
                )}
                {r.draft.notes && (
                  <dl>
                    <dt>{t.quote.notes}</dt>
                    <dd>{r.draft.notes}</dd>
                  </dl>
                )}
                {r.draft.photoCount > 0 && <p className="small">{t.quote.review.photosCount(r.draft.photoCount)}</p>}
              </div>
            )}
          </section>
          <section className="review__sec">
            <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>{t.quote.review.where}</strong>
            <dl>
              <dt>{t.quote.city}</dt>
              <dd>{cityLabel(r.draft, lang) || '—'}</dd>
              {r.draft.address && (
                <>
                  <dt>{t.quote.address}</dt>
                  <dd>{r.draft.address}</dd>
                </>
              )}
              <dt>{t.quote.date}</dt>
              <dd>{r.draft.asap ? t.quote.asap : r.draft.date ? `${formatDate(r.draft.date, lang)} · ${t.quote.flex[r.draft.flex]}` : t.quote.review.noDate}</dd>
            </dl>
          </section>
          <section className="review__sec">
            <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>{t.quote.review.contact}</strong>
            <dl>
              <dt>{t.quote.name}</dt>
              <dd>{r.draft.name}</dd>
              <dt>{t.quote.phone}</dt>
              <dd>{r.draft.phone}</dd>
              {r.draft.email && (
                <>
                  <dt>{t.quote.email}</dt>
                  <dd>{r.draft.email}</dd>
                </>
              )}
            </dl>
          </section>
        </div>

        <div className="btn-row">
          <Button variant="secondary" icon="external" onClick={share}>
            {t.confirm.share}
          </Button>
          <Button variant="secondary" icon="mail" onClick={emailCopy}>
            {t.confirm.emailCopy}
          </Button>
          {r.draft.date && !r.draft.asap && (
            <Button variant="secondary" icon="calendar" onClick={calendar}>
              {t.confirm.calendar}
            </Button>
          )}
        </div>
        <div className="stack">
          <CallLink tel={PHONES[0].tel} className="btn btn--secondary">
            {t.confirm.callAbout}
          </CallLink>
          <Button variant="secondary" icon="refresh" onClick={repeat}>
            {t.requests.repeat}
          </Button>
          <Button variant="ghost" icon="trash" onClick={() => setConfirmDelete(true)} style={{ color: 'var(--error)' }}>
            {t.requests.delete}
          </Button>
        </div>
      </div>

      <Sheet
        open={confirmDelete}
        title={t.requests.delete}
        body={t.requests.deleteConfirm}
        onClose={() => setConfirmDelete(false)}
        actions={
          <>
            <Button
              onClick={() => {
                removeRequest(r.ref);
                setConfirmDelete(false);
                nav('/requests', { replace: true });
              }}
              style={{ background: 'var(--error)' }}
            >
              {t.requests.delete}
            </Button>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              {t.common.cancel}
            </Button>
          </>
        }
      />
    </main>
  );
}
