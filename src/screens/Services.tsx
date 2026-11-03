import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { FAMILIES, SERVICES } from '../data/services';
import { Icon } from '../components/Icons';
import { Button } from '../components/ui';
import { AmbientClip } from '../components/Media';

const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;

export function Services() {
  const { t, lang } = useApp();
  const nav = useNavigate();
  return (
    <main className="screen">
      <header className="container" style={{ paddingTop: 'calc(var(--sat) + 22px)' }}>
        <p className="eyebrow">{t.app.name}</p>
        <h1 className="h1" style={{ marginTop: 6 }}>
          {t.services.title}
        </h1>
        <p className="lead" style={{ marginTop: 8 }}>
          {t.services.sub}
        </p>
      </header>

      <div className="container" style={{ marginTop: 18 }}>
        <AmbientClip name="services-header" shape="wide" />
      </div>

      <div className="container">
        {FAMILIES.map((fam) => (
          <section className="svc-family" key={fam}>
            <h2 className="svc-family__title eyebrow">{t.services.families[fam]}</h2>
            <div className="svc-list stagger">
              {SERVICES.filter((s) => s.family === fam).map((s) => (
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
        ))}
        <div style={{ marginTop: 28 }}>
          <Button onClick={() => nav('/quote')} iconRight="arrow-right">
            {t.common.quoteCta}
          </Button>
        </div>
      </div>
    </main>
  );
}
