import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../lib/store';
import { byId, SERVICES, type ServiceId } from '../data/services';
import { Icon } from '../components/Icons';
import { Accordion, Button, Note } from '../components/ui';
import { AmbientVideo, LivingPhoto } from '../components/Media';
import { TASK_CLIPS } from '../data/clips';

const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;

export function ServiceDetail() {
  const { id } = useParams();
  const { t, lang } = useApp();
  const nav = useNavigate();
  const svc = SERVICES.find((s) => s.id === id);
  if (!svc) return <Navigate to="/services" replace />;
  const back = () => (window.history.length > 1 ? nav(-1) : nav('/services'));

  return (
    <main className="screen">
      <div className={`svc-hero ${svc.photo ? 'svc-hero--photo' : svc.image ? '' : 'svc-hero--ico'}`}>
        {svc.clip ? (
          <AmbientVideo src={`${import.meta.env.BASE_URL}video/${svc.id}.mp4`} poster={`${import.meta.env.BASE_URL}img/photos/${svc.id}-poster.jpg`} className="ambient--clip" />
        ) : svc.photo ? (
          <LivingPhoto src={`${import.meta.env.BASE_URL}img/photos/${svc.id}.jpg`} priority />
        ) : svc.image ? (
          <img src={img(svc.image)} alt="" width={1248} height={1248} />
        ) : (
          <Icon name={svc.icon} size={112} strokeWidth={0.9} className="ico svc-hero__glyph" />
        )}
        <div className="svc-hero__bar">
          <button type="button" className="iconbtn" onClick={back} aria-label={t.common.back}>
            <Icon name="arrow-left" />
          </button>
        </div>
      </div>
      <div className="svc-title">
        <p className="eyebrow">{t.services.families[svc.family]}</p>
        <h1 className="h1">{svc.name[lang]}</h1>
      </div>

      <div className="container">
        <p className="lead" style={{ marginTop: 14 }}>
          {svc.lead[lang]}
        </p>

        {TASK_CLIPS[svc.id] && (
          <section className="section">
            <h2 className="h3">{t.services.inAction}</h2>
            <p className="small" style={{ marginTop: 4, marginBottom: 12 }}>
              {t.services.inActionSub}
            </p>
            <div className="clip-card clip-card--wide" aria-hidden="true">
              <AmbientVideo src={`${import.meta.env.BASE_URL}video/${svc.id}-tasks.mp4`} poster={`${import.meta.env.BASE_URL}img/photos/${svc.id}-tasks-poster.jpg`} className="ambient--clip" />
            </div>
          </section>
        )}

        <section className="section">
          <h2 className="h3">{t.services.included}</h2>
          <ul className="check-list" style={{ marginTop: 8 }}>
            {svc.includes[lang].map((line) => (
              <li key={line}>
                <Icon name="check" size={18} strokeWidth={2.2} draw />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section">
          <h2 className="h3">{t.services.factors}</h2>
          <p className="small" style={{ marginTop: 4 }}>
            {t.services.factorsSub}
          </p>
          <ul className="factor-list" style={{ marginTop: 8 }}>
            {svc.factors[lang].map((line) => (
              <li key={line}>
                <Icon name="arrow-right" size={16} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {svc.note && (
            <div style={{ marginTop: 10 }}>
              <Note>{svc.note[lang]}</Note>
            </div>
          )}
        </section>

        <section className="section">
          <h2 className="h3" style={{ marginBottom: 6 }}>
            {t.services.faq}
          </h2>
          <Accordion items={svc.faqs.map((f) => ({ q: f.q[lang], a: f.a[lang] }))} />
        </section>

        {svc.combine.length > 0 && (
          <section className="section">
            <h2 className="h3">{t.services.combine}</h2>
            <div className="chips" style={{ marginTop: 12 }}>
              {svc.combine.map((cid: ServiceId) => (
                <Link key={cid} to={`/services/${cid}`} className="chip chip--thumb">
                  {byId(cid).clip ? <img className="chip__thumb" src={`${import.meta.env.BASE_URL}img/thumbs/${cid}.jpg`} alt="" width={24} height={24} loading="lazy" /> : <Icon name={byId(cid).icon} size={18} />}
                  <span>{byId(cid).name[lang]}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        <div style={{ height: 96 }} />
      </div>

      <div className="sticky-cta">
        <Button onClick={() => nav(`/quote?services=${svc.id}&skip=1`)} iconRight="arrow-right">
          {t.services.ctaFor}
        </Button>
        <p className="small" style={{ textAlign: 'center', marginTop: 6 }}>
          {t.services.ctaSub}
        </p>
      </div>
    </main>
  );
}
