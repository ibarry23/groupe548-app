import { CITIES, dict, type Lang } from '../i18n';
import { byId, type ServiceId } from '../data/services';

export type Flex = 'exact' | 'week' | 'flexible';
export type TimeWindow = 'any' | 'day' | 'evening' | 'weekend';
export type ContactPref = 'phone' | 'sms' | 'email';

export interface Photo {
  id: string;
  dataUrl: string;
  name: string;
}

export interface QuoteDraft {
  services: ServiceId[];
  /** keyed `${serviceId}.${questionId}` — string for single/text, string[] for multi */
  answers: Record<string, string | string[]>;
  city: string;
  cityOther: string;
  address: string;
  asap: boolean;
  date: string;
  flex: Flex;
  timeWindow: TimeWindow;
  notes: string;
  photos: Photo[];
  name: string;
  phone: string;
  email: string;
  contactPref: ContactPref;
  lang: Lang;
  step: number;
}

export type RequestStatus = 'sent' | 'queued' | 'demo' | 'failed';

export interface SavedRequest {
  ref: string;
  createdAt: string;
  sentAt?: string;
  status: RequestStatus;
  draft: Omit<QuoteDraft, 'photos' | 'step'> & { photoCount: number };
}

export const emptyDraft = (lang: Lang): QuoteDraft => ({
  services: [],
  answers: {},
  city: '',
  cityOther: '',
  address: '',
  asap: false,
  date: '',
  flex: 'week',
  timeWindow: 'any',
  notes: '',
  photos: [],
  name: '',
  phone: '',
  email: '',
  contactPref: 'phone',
  lang,
  step: 0,
});

export type SubmitMode = 'mock' | 'web3forms';

export const SUBMIT_MODE: SubmitMode = (import.meta.env.VITE_SUBMIT_MODE as SubmitMode) === 'web3forms' ? 'web3forms' : 'mock';
const WEB3FORMS_KEY: string = import.meta.env.VITE_WEB3FORMS_KEY ?? '';

export const cityLabel = (draft: Pick<QuoteDraft, 'city' | 'cityOther'>, lang: Lang) => {
  const c = CITIES.find((x) => x.id === draft.city);
  if (!c) return '';
  if (c.id === 'other' || c.id === 'rive-sud' || c.id === 'rive-nord') {
    return draft.cityOther ? `${draft.cityOther} (${c[lang]})` : c[lang];
  }
  return c[lang];
};

/** Readable answer lines per service, used by the review screen, the saved request and the email body. */
export function describeAnswers(draft: Pick<QuoteDraft, 'services' | 'answers'>, lang: Lang) {
  return draft.services.map((sid) => {
    const svc = byId(sid);
    const lines: { label: string; value: string }[] = [];
    for (const q of svc.questions) {
      const v = draft.answers[`${sid}.${q.id}`];
      if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) continue;
      let value: string;
      if (q.type === 'text') value = String(v);
      else {
        const ids = Array.isArray(v) ? v : [v];
        value = ids.map((id) => q.options?.find((o) => o.id === id)?.label[lang] ?? id).join(', ');
      }
      lines.push({ label: q.label[lang], value });
    }
    return { service: svc, lines };
  });
}

function buildEmailBody(draft: QuoteDraft, ref: string): string {
  const t = dict[draft.lang];
  const L = (fr: string, en: string) => (draft.lang === 'fr' ? fr : en);
  const parts: string[] = [];
  parts.push(`${L('Référence', 'Reference')}: ${ref}`);
  parts.push(`${L('Langue du client', 'Customer language')}: ${draft.lang === 'fr' ? 'Français' : 'English'}`);
  parts.push('');
  for (const { service, lines } of describeAnswers(draft, draft.lang)) {
    parts.push(`## ${service.name[draft.lang]}`);
    if (!lines.length) parts.push(`  ${t.quote.review.noDetails}`);
    for (const l of lines) parts.push(`  ${l.label}: ${l.value}`);
    parts.push('');
  }
  parts.push(`## ${t.quote.review.where}`);
  parts.push(`  ${t.quote.city}: ${cityLabel(draft, draft.lang) || '—'}`);
  if (draft.address) parts.push(`  ${t.quote.address}: ${draft.address}`);
  parts.push(`  ${t.quote.date}: ${draft.asap ? t.quote.asap : draft.date || t.quote.review.noDate} (${t.quote.flex[draft.flex]}, ${t.quote.windows[draft.timeWindow]})`);
  if (draft.notes) parts.push(`  ${t.quote.notes}: ${draft.notes}`);
  if (draft.photos.length) parts.push(`  ${t.quote.review.photosCount(draft.photos.length)} — ${L('à demander au client (non jointes)', 'ask the customer (not attached)')}`);
  parts.push('');
  parts.push(`## ${t.quote.review.contact}`);
  parts.push(`  ${t.quote.name}: ${draft.name}`);
  parts.push(`  ${t.quote.phone}: ${draft.phone}`);
  parts.push(`  ${t.quote.email}: ${draft.email || '—'}`);
  parts.push(`  ${t.quote.contactPrefShort}: ${t.quote.prefs[draft.contactPref]}`);
  return parts.join('\n');
}

export type SubmitResult = { ok: true; status: 'sent' | 'demo' } | { ok: false; reason: 'offline' | 'server' };

/**
 * Sends the request. In `mock` mode nothing leaves the device.
 * In `web3forms` mode the payload mirrors the website form fields so the
 * business receives app and website requests in the same inbox format.
 */
export async function submitRequest(draft: QuoteDraft, ref: string, opts?: { simulateFailure?: boolean }): Promise<SubmitResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { ok: false, reason: 'offline' };

  if (SUBMIT_MODE === 'mock' || !WEB3FORMS_KEY) {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
    if (opts?.simulateFailure) return { ok: false, reason: 'server' };
    return { ok: true, status: 'demo' };
  }

  const fd = new FormData();
  const primary = byId(draft.services[0]);
  fd.append('access_key', WEB3FORMS_KEY);
  fd.append('subject', `${draft.lang === 'fr' ? 'Nouvelle demande de soumission' : 'New quote request'} - Groupe 548 App - ${ref}`);
  fd.append('from_name', 'Groupe 548 - Application mobile');
  fd.append('reference', ref);
  fd.append('name', draft.name);
  fd.append('phone', draft.phone);
  fd.append('email', draft.email || '—');
  fd.append('city', cityLabel(draft, 'fr') || '—');
  fd.append('service', draft.services.map((s) => byId(s).formValue).join(', '));
  fd.append('service_primary', primary.formValue);
  fd.append('description', buildEmailBody(draft, ref));
  fd.append('date', draft.asap ? 'ASAP' : draft.date || '—');
  fd.append('language', draft.lang);
  fd.append('source', 'app');
  fd.append('botcheck', '');

  try {
    const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
    const json = (await res.json()) as { success?: boolean };
    return json.success ? { ok: true, status: 'sent' } : { ok: false, reason: 'server' };
  } catch {
    return { ok: false, reason: navigator.onLine === false ? 'offline' : 'server' };
  }
}

export const toSaved = (draft: QuoteDraft, ref: string, status: RequestStatus): SavedRequest => {
  const { photos, step: _step, ...rest } = draft;
  return {
    ref,
    createdAt: new Date().toISOString(),
    sentAt: status === 'sent' || status === 'demo' ? new Date().toISOString() : undefined,
    status,
    draft: { ...rest, photoCount: photos.length },
  };
};
