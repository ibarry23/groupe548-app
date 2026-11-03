import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { PHONES } from '../i18n';
import { SERVICES, SITUATIONS, byId } from '../data/services';
import { Icon, type IconName } from '../components/Icons';
import { Button, CallLink } from '../components/ui';
import { AmbientVideo } from '../components/Media';

const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;
const TRUST_ICONS: IconName[] = ['globe', 'clock', 'receipt', 'leaf', 'sparkles', 'map-pin'];

export function Home() {
  const { t, lang, setLang, hasDraft, draft } = useApp();
  const nav = useNavigate();
  const draftLabel = draft.services.map((s) => byId(s).name[lang]).join(' + ');
  const heroRef = useRef<HTMLElement>(null);
  const [floatCta, setFloatCta] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => setFloatCta(!entry.isIntersecting), { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <main className="screen screen--cta">
      <section className="hero" ref={heroRef}>
        <div className="hero__pattern" style={{ backgroundImage: `url(${img('hero-pattern')})` }} aria-hidden="true" />
        <AmbientVideo src={`${import.meta.env.BASE_URL}video/hero.mp4`} poster={`${import.meta.env.BASE_URL}img/hero-poster.jpg`} />
        <div className="hero__wash" aria-hidden="true" />
        <span className="hero__numeral" aria-hidden="true">
          548
        </span>
        <div className="hero__top">
          <div className="wordmark">
            <span className="wordmark__mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9BC80" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                <path d="M4 20V9l8-5 8 5v11" />
              </svg>
            </span>
            <div>
              <div className="wordmark__name">{t.app.name}</div>
              <div className="wordmark__sub">{t.app.tagline}</div>
            </div>
          </div>
          <div className="lang-toggle" role="group" aria-label="Langue / Language">
            <button type="button" aria-pressed={lang === 'fr'} onClick={() => setLang('fr')} lang="fr">
              FR
            </button>
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">
              EN
            </button>
          </div>
        </div>
        <p className="eyebrow">{t.home.eyebrow}</p>
        <h1 className="display">{t.home.headline}</h1>
        <p className="lead">{t.home.lead}</p>
        <div className="hero__actions">
          <Button variant="onbrand" iconRight="arrow-right" onClick={() => nav('/quote')}>
            {t.common.quoteCta}
          </Button>
          <CallLink tel={PHONES[0].tel} className="btn btn--onbrand-ghost">
            {t.common.call} · {PHONES[0].label}
          </CallLink>
        </div>
        <p className="hero__note">
          <Icon name="receipt" size={16} />
          {t.home.note}
        </p>
      </section>

      {hasDraft && (
        <section className="container" style={{ paddingTop: 16 }}>
          <button type="button" className="svc-row" onClick={() => nav('/quote')} style={{ gridTemplateColumns: '44px 1fr 20px', borderStyle: 'dashed' }}>
            <span className="svc-row__ico" style={{ width: 44, height: 44 }}>
              <Icon name="edit" size={20} />
            </span>
            <span>
              <span className="svc-row__name">{t.quote.resume}</span>
              <span className="svc-row__tag">{draftLabel ? t.quote.resumeSub(draftLabel) : t.requests.draftBody}</span>
            </span>
            <Icon name="chevron-right" size={20} className="ico chev" />
          </button>
        </section>
      )}

      <section className="container section">
        <h2 className="h2">{t.home.situationsTitle}</h2>
        <p className="body" style={{ marginTop: 6 }}>
          {t.home.situationsSub}
        </p>
        <div className="sit-row stagger" style={{ marginTop: 16 }} aria-label={t.home.situationsTitle}>
          {SITUATIONS.map((s) => (
            <button key={s.id} type="button" className="sit sit--photo" onClick={() => nav(`/quote?situation=${s.id}`)}>
              <img className="sit__photo" src={`${import.meta.env.BASE_URL}img/thumbs/${s.services[0]}-lg.jpg`} alt="" loading="lazy" width={360} height={360} />
              <span className="sit__shade" aria-hidden="true" />
              <span className="sit__ico">
                <Icon name={s.icon} size={20} />
              </span>
              <span className="sit__label">{s.label[lang]}</span>
              <span className="sit__sub">{s.services.map((id) => byId(id).short[lang]).join(' + ')}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2 className="h2">{t.home.servicesTitle}</h2>
          <Link to="/services" className="link">
            {t.common.seeAll}
            <Icon name="chevron-right" size={18} />
          </Link>
        </div>
        <div className="svc-list stagger">
          {SERVICES.map((s) => (
            <Link key={s.id} to={`/services/${s.id}`} className="svc-row">
              {s.clip ? (
                <img className="svc-row__img" src={`${import.meta.env.BASE_URL}img/thumbs/${s.id}.jpg`} alt="" loading="lazy" width={64} height={64} />
              ) : s.image ? (
                <img className="svc-row__img" src={img(s.image)} alt="" loading="lazy" width={64} height={64} />
              ) : (
                <span className="svc-row__ico">
                  <Icon name={s.icon} size={26} strokeWidth={1.6} />
                </span>
              )}
              <span>
                <span className="svc-row__name">{s.name[lang]}</span>
                <span className="svc-row__tag">{s.tagline[lang]}</span>
              </span>
              <Icon name="chevron-right" size={20} className="ico chev" />
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="h2">{t.home.howTitle}</h2>
        <p className="body" style={{ marginTop: 6 }}>
          {t.home.howSub}
        </p>
        <div className="steps" style={{ marginTop: 10 }}>
          {t.steps.map((s, i) => (
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

      <section className="container section">
        <div className="manifesto">
          <p className="eyebrow">{t.home.whyTitle}</p>
          <h2 className="h2">{t.home.manifesto}</h2>
          <div className="manifesto__rule" aria-hidden="true" />
          <ul className="manifesto__list">
            {t.trust.map((item, i) => (
              <li key={i}>
                <Icon name={TRUST_ICONS[i]} size={18} strokeWidth={1.8} draw />
                <span>
                  <strong>{item.t}</strong>
                  {item.d}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container section">
        <h2 className="h2">{t.home.areasTitle}</h2>
        <div className="areas" style={{ marginTop: 12 }}>
          {t.areas.map((a) => (
            <span className="area" key={a}>
              {a}
            </span>
          ))}
        </div>
        <p className="small" style={{ marginTop: 10 }}>
          {t.home.areasNote}
        </p>
      </section>

      <section className="container section">
        <h2 className="h2">{t.home.callTitle}</h2>
        <p className="body" style={{ marginTop: 6 }}>
          {t.home.callSub}
        </p>
        <div className="phones" style={{ marginTop: 14 }}>
          {PHONES.map((p) => (
            <a key={p.tel} href={`tel:${p.tel}`} className="phone-card">
              <Icon name="phone" size={20} />
              <strong>{p.label}</strong>
              <span>{t.common.call}</span>
            </a>
          ))}
        </div>
      </section>

      {floatCta && (
        <div className="sticky-cta sticky-cta--float">
          <Button onClick={() => nav('/quote')} iconRight="arrow-right">
            {t.common.quoteCta}
          </Button>
        </div>
      )}
    </main>
  );
}
