import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from './Icons';
import { useApp } from '../lib/store';
import { haptic } from '../lib/format';

/* ---------- Button ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'onbrand' | 'onbrand-ghost';
export function Button({
  variant = 'primary',
  size,
  icon,
  iconRight,
  loading,
  children,
  className = '',
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm'; icon?: IconName; iconRight?: IconName; loading?: boolean }) {
  return (
    <button
      type="button"
      className={`btn btn--${variant} ${size ? `btn--${size}` : ''} ${className}`}
      aria-busy={loading || undefined}
      disabled={rest.disabled || loading}
      onClick={(e) => {
        haptic('light');
        onClick?.(e);
      }}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : icon ? <Icon name={icon} size={20} /> : null}
      <span>{children}</span>
      {iconRight && !loading ? <Icon name={iconRight} size={20} /> : null}
    </button>
  );
}

export function CallLink({ tel, label, className = 'btn btn--secondary', children }: { tel: string; label?: string; className?: string; children?: ReactNode }) {
  return (
    <a className={className} href={`tel:${tel}`} aria-label={label}>
      <Icon name="phone" size={20} />
      <span>{children ?? label}</span>
    </a>
  );
}

/* ---------- Top bar ---------- */
export function TopBar({ title, right, brand, onBack }: { title?: string; right?: ReactNode; brand?: boolean; onBack?: () => void }) {
  const nav = useNavigate();
  const { t } = useApp();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const back = () => {
    if (onBack) return onBack();
    if (window.history.length > 1) nav(-1);
    else nav('/');
  };
  return (
    <header className={`topbar ${scrolled ? 'topbar--line' : ''} ${brand ? 'topbar--brand' : ''}`}>
      <button type="button" className="iconbtn" onClick={back} aria-label={t.common.back}>
        <Icon name="arrow-left" />
      </button>
      <h1 className="topbar__title">{title}</h1>
      <div>{right}</div>
    </header>
  );
}

/* ---------- Accordion ---------- */
export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  return (
    <div className="accordion">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div className="accordion__item" key={i}>
            <button type="button" className="accordion__btn" aria-expanded={isOpen} aria-controls={`${base}-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
              <span>{it.q}</span>
              <Icon name="plus" size={20} />
            </button>
            <div className="accordion__panel" data-open={isOpen} id={`${base}-${i}`} role="region" aria-hidden={!isOpen}>
              <div>
                <p>{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Form bits ---------- */
export function Field({ label, optional, hint, error, children, htmlFor }: { label: string; optional?: boolean; hint?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  const { t } = useApp();
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        <span>{label}</span>
        {optional && <span className="opt">{t.common.optional}</span>}
      </label>
      {children}
      {error ? (
        <div className="field__error" role="alert">
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div className="field__hint">{hint}</div>
      ) : null}
    </div>
  );
}

export function Options({
  options,
  value,
  onChange,
  multi,
  cols = 2,
  label,
  optional,
}: {
  options: { id: string; label: string; sub?: string }[];
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  multi?: boolean;
  cols?: 1 | 2;
  label: string;
  optional?: boolean;
}) {
  const { t } = useApp();
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const toggle = (id: string) => {
    haptic('light');
    if (multi) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onChange([...next]);
    } else onChange(selected.has(id) ? '' : id);
  };
  return (
    <div className="question" role={multi ? 'group' : 'radiogroup'} aria-label={label}>
      <div className="question__label">
        <span>{label}</span>
        {optional && <span className="opt">{t.common.optional}</span>}
      </div>
      <div className={`option-grid ${cols === 1 ? 'option-grid--1' : ''}`}>
        {options.map((o) => (
          <button key={o.id} type="button" className="option" role={multi ? 'checkbox' : 'radio'} aria-checked={selected.has(o.id)} onClick={() => toggle(o.id)}>
            <span className={`option__mark ${multi ? 'option__mark--square' : ''}`}>
              <Icon name="check" size={13} strokeWidth={3} />
            </span>
            <span className="option__text">
              {o.label}
              {o.sub && <span className="option__sub">{o.sub}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Chip({ on, onClick, icon, children, className = '' }: { on?: boolean; onClick: () => void; icon?: IconName; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={`chip ${className}`}
      aria-pressed={on}
      onClick={() => {
        haptic('light');
        onClick();
      }}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  );
}

export function Note({ kind = 'brass', icon = 'info', children }: { kind?: 'brass' | 'info' | 'success' | 'warn'; icon?: IconName; children: ReactNode }) {
  return (
    <div className={`note ${kind !== 'brass' ? `note--${kind}` : ''}`}>
      <Icon name={icon} size={18} />
      <div>{children}</div>
    </div>
  );
}

export function StatusPill({ status }: { status: 'sent' | 'queued' | 'demo' | 'failed' }) {
  const { t } = useApp();
  return <span className={`status status--${status}`}>{t.requests.status[status]}</span>;
}

/* ---------- Sheet (confirm dialog) ---------- */
export function Sheet({ open, title, body, actions, onClose }: { open: boolean; title: string; body: string; actions: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !ref.current) return;
      // Keep keyboard focus inside the sheet while it is open.
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled'));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <h2 className="h3" id="sheet-title">
          {title}
        </h2>
        <p className="body" style={{ marginTop: 8 }}>
          {body}
        </p>
        <div className="sheet__actions">{actions}</div>
      </div>
    </div>
  );
}

/* ---------- Toasts & offline ---------- */
export function ToastHost() {
  const { toasts } = useApp();
  return (
    <div className="toast-host" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind !== 'info' ? `toast--${t.kind}` : ''}`}>
          <Icon name={t.kind === 'error' ? 'alert' : t.kind === 'success' ? 'check' : 'info'} size={18} />
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

export function OfflineBar() {
  const { online, t } = useApp();
  if (online) return null;
  return (
    <div className="offline-bar" role="status">
      <Icon name="wifi-off" size={16} />
      <span>{t.common.offline}</span>
    </div>
  );
}

export function Empty({ icon, title, body, children }: { icon: IconName; title: string; body: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <Icon name={icon} size={40} strokeWidth={1.4} />
      <h2 className="h3">{title}</h2>
      <p className="body">{body}</p>
      {children && <div style={{ marginTop: 18 }}>{children}</div>}
    </div>
  );
}
