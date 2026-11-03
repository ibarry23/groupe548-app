import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDemoMode, useApp } from '../lib/store';
import { PHONES, WEBSITE } from '../i18n';
import { Icon, type IconName } from '../components/Icons';
import { Accordion, Button, TopBar } from '../components/ui';
import { AmbientClip } from '../components/Media';

function MenuItem({ icon, label, sub, onClick, href }: { icon: IconName; label: string; sub?: string; onClick?: () => void; href?: string }) {
  const inner = (
    <>
      <Icon name={icon} size={22} strokeWidth={1.7} />
      <span>
        {label}
        {sub && <small>{sub}</small>}
      </span>
      <Icon name={href ? 'external' : 'chevron-right'} size={18} className="ico chev" />
    </>
  );
  if (href)
    return (
      <a className="menu__item" href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  return (
    <button type="button" className="menu__item" onClick={onClick}>
      {inner}
    </button>
  );
}

const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

function InstallCard() {
  const { t } = useApp();
  const [canPrompt, setCanPrompt] = useState(!!window.__g548Install);
  const [done, setDone] = useState(isStandalone());
  useEffect(() => {
    const on = () => setCanPrompt(true);
    window.addEventListener('g548-installable', on);
    return () => window.removeEventListener('g548-installable', on);
  }, []);
  if (done) return null;
  const install = async () => {
    const e = window.__g548Install;
    if (!e) return;
    await e.prompt();
    const { outcome } = await e.userChoice;
    if (outcome === 'accepted') setDone(true);
    window.__g548Install = undefined;
    setCanPrompt(false);
  };
  if (!canPrompt && !isIos()) return null;
  return (
    <section className="card card--pad install">
      <h2 className="h3">{t.more.install}</h2>
      <p className="body" style={{ marginTop: 6 }}>
        {t.more.installBody}
      </p>
      {canPrompt ? (
        <div style={{ marginTop: 14 }}>
          <Button icon="plus" onClick={install}>
            {t.more.installBtn}
          </Button>
        </div>
      ) : (
        <p className="small" style={{ marginTop: 10 }}>
          {t.more.installIos}
        </p>
      )}
    </section>
  );
}

export function More() {
  const { t, lang, setLang } = useApp();
  const nav = useNavigate();
  return (
    <main className="screen">
      <header className="container" style={{ paddingTop: 'calc(var(--sat) + 22px)' }}>
        <p className="eyebrow">{t.app.name}</p>
        <h1 className="h1" style={{ marginTop: 6 }}>
          {t.more.title}
        </h1>
      </header>
      <div className="container stack-lg" style={{ marginTop: 20 }}>
        <AmbientClip name="more-header" shape="wide" />
        <InstallCard />
        <div className="menu">
          <MenuItem icon="phone" label={t.more.contact} sub={`${PHONES[0].label} · ${PHONES[1].label}`} onClick={() => nav('/more/contact')} />
          <MenuItem icon="help" label={t.more.faq} onClick={() => nav('/more/faq')} />
          <MenuItem icon="user" label={t.more.about} onClick={() => nav('/more/about')} />
          <MenuItem icon="globe" label={t.common.website} sub={WEBSITE.replace('https://', '')} href={lang === 'en' ? `${WEBSITE}/en` : WEBSITE} />
          <MenuItem icon="shield" label={t.more.privacy} href={`${import.meta.env.BASE_URL}privacy.html${lang === 'en' ? '#en' : ''}`} />
        </div>

        <section>
          <h2 className="eyebrow" style={{ marginBottom: 10 }}>
            {t.more.guides}
          </h2>
          <div className="menu">
            {t.guides.map((g) => (
              <MenuItem key={g.slug} icon="file" label={g.t} sub={g.d} href={`${WEBSITE}/${g.slug}`} />
            ))}
          </div>
          <p className="small" style={{ marginTop: 8 }}>
            {t.more.guidesSub}
          </p>
        </section>

        <section>
          <h2 className="eyebrow" style={{ marginBottom: 10 }}>
            {t.more.language}
          </h2>
          <div className="lang-toggle lang-toggle--light" role="group" aria-label={t.more.language}>
            <button type="button" aria-pressed={lang === 'fr'} onClick={() => setLang('fr')} lang="fr" style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
              Français
            </button>
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en" style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
              English
            </button>
          </div>
        </section>

        <section>
          <h2 className="eyebrow" style={{ marginBottom: 10 }}>
            {t.more.appInfo}
          </h2>
          <dl className="card card--pad" style={{ margin: 0, paddingTop: 4, paddingBottom: 4 }}>
            <div className="kv">
              <dt>{t.more.version}</dt>
              <dd>{__APP_VERSION__}</dd>
            </div>
            <div className="kv">
              <dt>{t.more.mode}</dt>
              <dd>{isDemoMode ? t.more.modeMock : t.more.modeLive}</dd>
            </div>
          </dl>
          <p className="small" style={{ marginTop: 10 }}>
            {t.more.privacyNote}
          </p>
        </section>
      </div>
    </main>
  );
}

export function Contact() {
  const { t } = useApp();
  return (
    <main className="screen">
      <TopBar title={t.more.contact} />
      <div className="container stack-lg" style={{ paddingTop: 12 }}>
        <AmbientClip name="more-header" shape="wide" />
        <div className="callblock">
          {PHONES.map((p) => (
            <a key={p.tel} href={`tel:${p.tel}`} className="callrow">
              <Icon name="phone" size={22} />
              <div>
                <strong>{p.label}</strong>
                <span>{t.common.call}</span>
              </div>
            </a>
          ))}
        </div>
        <dl className="card card--pad" style={{ margin: 0, paddingTop: 4, paddingBottom: 4 }}>
          <div className="kv">
            <dt>{t.more.hours}</dt>
            <dd>{t.more.hoursBody}</dd>
          </div>
          <div className="kv">
            <dt>{t.more.languages}</dt>
            <dd>{t.more.languagesBody}</dd>
          </div>
          <div className="kv">
            <dt>{t.more.areas}</dt>
            <dd>{t.areas.join(' · ')}</dd>
          </div>
        </dl>
        <p className="small">{t.home.areasNote}</p>
      </div>
    </main>
  );
}

export function Faq() {
  const { t } = useApp();
  return (
    <main className="screen">
      <TopBar title={t.more.faq} />
      <div className="container" style={{ paddingTop: 8 }}>
        <Accordion items={t.faq} />
      </div>
    </main>
  );
}

export function About() {
  const { t } = useApp();
  const icons: IconName[] = ['sparkles', 'shield', 'user', 'clock', 'leaf', 'map-pin'];
  return (
    <main className="screen">
      <TopBar title={t.more.about} />
      <div className="container stack-lg" style={{ paddingTop: 12 }}>
        <AmbientClip name="about" shape="wide" />
        <p className="lead">{t.more.aboutBody}</p>
        <div className="rule" />
        <blockquote className="h2" style={{ margin: 0, fontStyle: 'italic', fontWeight: 400 }}>
          « {t.home.headline.replace(/\.$/, '')} »
        </blockquote>
        <div className="trust">
          {t.more.values.map((v, i) => (
            <div className="trust__item" key={v}>
              <Icon name={icons[i]} size={22} strokeWidth={1.6} />
              <strong>{v}</strong>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
