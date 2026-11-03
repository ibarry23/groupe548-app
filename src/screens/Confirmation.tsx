import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../lib/store';
import { PHONES } from '../i18n';
import { Icon, type IconName } from '../components/Icons';
import { Button, CallLink, Note } from '../components/ui';
import { AmbientClip } from '../components/Media';

export function Confirmation() {
  const { ref } = useParams();
  const { t, requests, resend, online, toast } = useApp();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const retry = async () => {
    if (!ref) return;
    setBusy(true);
    await resend(ref);
    setBusy(false);
  };
  const copyRef = () => {
    if (!ref || !navigator.clipboard) return;
    navigator.clipboard.writeText(ref).then(() => toast(t.confirm.copied, 'success')).catch(() => {});
  };
  const req = requests.find((r) => r.ref === ref);
  const status = req?.status ?? 'sent';

  const copy = {
    sent: { title: t.confirm.sentTitle, body: t.confirm.sentBody, icon: 'check' as IconName, cls: '' },
    demo: { title: t.confirm.demoTitle, body: t.confirm.demoBody, icon: 'info' as IconName, cls: 'confirm-hero__mark--demo' },
    queued: { title: t.confirm.queuedTitle, body: t.confirm.queuedBody, icon: 'wifi-off' as IconName, cls: 'confirm-hero__mark--warn' },
    failed: { title: t.confirm.failedTitle, body: t.confirm.failedBody, icon: 'alert' as IconName, cls: 'confirm-hero__mark--warn' },
  }[status];

  return (
    <main className="screen screen--flow">
      <section className="confirm-hero">
        <div className={`confirm-hero__mark ${copy.cls}`}>
          <Icon name={copy.icon} size={36} strokeWidth={2.2} draw />
        </div>
        <h1 className="h1">{copy.title}</h1>
        <p className="lead" style={{ marginTop: 10 }}>
          {copy.body}
        </p>
        {ref && (
          <button type="button" className="ref-pill" onClick={copyRef} aria-label={`${t.confirm.refLabel} ${ref} — ${t.confirm.copyHint}`}>
            <span className="small" style={{ fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
              {t.confirm.refLabel}
            </span>
            <span>{ref}</span>
            <Icon name="file" size={16} style={{ color: 'var(--fg-subtle)' }} />
          </button>
        )}
      </section>

      <div className="container stack-lg">
        {status !== 'failed' && <AmbientClip name="confirmation" shape="wide" />}
        {status === 'failed' && (
          <Button icon="refresh" onClick={retry} loading={busy} disabled={!online}>
            {t.requests.resend}
          </Button>
        )}

        {(status === 'sent' || status === 'demo' || status === 'queued') && (
          <section className="card card--pad">
            <h2 className="h3">{t.confirm.nextTitle}</h2>
            <div className="steps" style={{ marginTop: 6 }}>
              {t.confirm.next.map((s, i) => (
                <div className="step" key={i}>
                  <span className="step__num">{i + 1}</span>
                  <div>
                    <strong>{s.t}</strong>
                    <span>{s.d}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <Note kind="info" icon="phone">
          <strong>{t.confirm.tipTitle} — </strong>
          {t.confirm.tipBody}
        </Note>

        <div className="stack">
          <CallLink tel={PHONES[0].tel} className="btn btn--secondary">
            {t.confirm.callAbout}
          </CallLink>
          <Button variant="secondary" icon="inbox" onClick={() => nav('/requests', { replace: true })}>
            {t.confirm.viewRequests}
          </Button>
          <Button variant="ghost" onClick={() => nav('/', { replace: true })}>
            {t.confirm.backHome}
          </Button>
        </div>
        <div style={{ height: 'calc(var(--sab) + 24px)' }} />
      </div>
    </main>
  );
}
