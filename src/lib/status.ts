import type { CustomerStage } from './submit';
import type { Lang } from '../i18n';

/**
 * Team status feed: a published Google Sheet (CSV) or a JSON file the team keeps up to
 * date with one row per request — reference, stage, eta, note. The app reads it and
 * shows the customer when the team is on the way. See docs/STATUS-FEED.md.
 */
export const STATUS_FEED_URL: string = import.meta.env.VITE_STATUS_FEED_URL ?? '';
export const hasStatusFeed = () => STATUS_FEED_URL.length > 0;

export const STAGE_ORDER: CustomerStage[] = ['sent', 'quoted', 'scheduled', 'en-route', 'arrived', 'in-progress', 'done'];
/** Stages that get the live tracking card. */
export const LIVE_STAGES: CustomerStage[] = ['scheduled', 'en-route', 'arrived', 'in-progress', 'done'];

export interface TeamUpdate {
  ref: string;
  stage: CustomerStage;
  eta?: string;
  note?: string;
}

const strip = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

/** Accepts the team's own words in French or English, with or without accents. */
export function normalizeStage(raw: string): CustomerStage | undefined {
  const s = strip(raw);
  if (!s) return undefined;
  if (['enroute', 'ontheway', 'onourway', 'depart', 'parti', 'partie', 'partis', 'route'].includes(s)) return 'en-route';
  if (['arrived', 'arrive', 'arrivee', 'arrives', 'surplace', 'onsite'].includes(s)) return 'arrived';
  if (['inprogress', 'encours', 'working', 'started', 'commence'].includes(s)) return 'in-progress';
  if (['done', 'termine', 'terminee', 'completed', 'complete', 'fini', 'finished'].includes(s)) return 'done';
  if (['scheduled', 'planifie', 'planifiee', 'booked', 'confirme', 'confirmed', 'rendezvous'].includes(s)) return 'scheduled';
  if (['quoted', 'quote', 'soumission', 'soumissionenvoyee', 'devis'].includes(s)) return 'quoted';
  if (['sent', 'received', 'recu', 'recue', 'nouveau', 'new', 'envoyee'].includes(s)) return 'sent';
  return undefined;
}

/** Minimal CSV parser: quoted fields, doubled quotes, CRLF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length));
}

const COLS: Record<keyof TeamUpdate, string[]> = {
  ref: ['reference', 'ref', 'no', 'numero', 'number', 'id', 'demande', 'request'],
  stage: ['stage', 'statut', 'status', 'etape', 'etat', 'state'],
  eta: ['eta', 'arrivee', 'arrival', 'heure', 'time', 'arriveeprevue', 'estimatedarrival'],
  note: ['note', 'notes', 'message', 'mot', 'commentaire', 'comment'],
};

function findCol(header: string[], names: string[]): number {
  const h = header.map(strip);
  for (const n of names) {
    const i = h.indexOf(n);
    if (i >= 0) return i;
  }
  return -1;
}

function fromRows(rows: string[][]): Map<string, TeamUpdate> {
  const out = new Map<string, TeamUpdate>();
  if (!rows.length) return out;
  const header = rows[0];
  const ci = { ref: findCol(header, COLS.ref), stage: findCol(header, COLS.stage), eta: findCol(header, COLS.eta), note: findCol(header, COLS.note) };
  if (ci.ref < 0 || ci.stage < 0) return out;
  for (const r of rows.slice(1)) {
    const ref = (r[ci.ref] ?? '').trim().toUpperCase();
    const stage = normalizeStage(r[ci.stage] ?? '');
    if (!ref || !stage) continue;
    out.set(ref, { ref, stage, eta: (ci.eta >= 0 ? r[ci.eta] : '')?.trim() || undefined, note: (ci.note >= 0 ? r[ci.note] : '')?.trim() || undefined });
  }
  return out;
}

function fromJson(data: unknown): Map<string, TeamUpdate> {
  const out = new Map<string, TeamUpdate>();
  const list = Array.isArray(data) ? data : data && typeof data === 'object' ? Object.values(data as Record<string, unknown>) : [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const pick = (names: string[]) => {
      const k = Object.keys(o).find((key) => names.includes(strip(key)));
      return k ? String(o[k] ?? '').trim() : '';
    };
    const ref = pick(COLS.ref).toUpperCase();
    const stage = normalizeStage(pick(COLS.stage));
    if (!ref || !stage) continue;
    out.set(ref, { ref, stage, eta: pick(COLS.eta) || undefined, note: pick(COLS.note) || undefined });
  }
  return out;
}

/** Fetches the feed; resolves to a map keyed by upper-case reference. Throws on network errors. */
export async function fetchTeamUpdates(): Promise<Map<string, TeamUpdate>> {
  const res = await fetch(STATUS_FEED_URL, { cache: 'no-store', credentials: 'omit' });
  if (!res.ok) throw new Error(`feed ${res.status}`);
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return fromJson(JSON.parse(trimmed));
    } catch {
      /* fall through to CSV */
    }
  }
  return fromRows(parseCsv(text));
}

/** Minutes elapsed since an ISO date, never negative. */
export const minutesSince = (iso?: string) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : 0);

/** Shows a system notification when permitted (through the service worker when one is active). */
export async function notify(title: string, body: string, icon: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, { body, icon, tag: 'g548-live' });
    else new Notification(title, { body, icon, tag: 'g548-live' });
  } catch {
    /* notifications unavailable on this platform */
  }
}

export interface EtaInfo {
  display: string;
  /** Minutes from now when the text named a clock time; undefined for free text. */
  minutes?: number;
}

/** Reads the dispatcher's ETA text: "14 h 30", "14:30", "2:30 pm", "vers 14 h", "15 min", or anything else as-is. */
export function parseEta(text: string | undefined, now: number, lang: Lang): EtaInfo | null {
  if (!text) return null;
  const raw = text.trim();
  const m = /(\d{1,2})\s*(?:h|:|\.)\s*(\d{2})?\s*(a\.?m\.?|p\.?m\.?)?/i.exec(raw);
  if (m) {
    let h = Number(m[1]);
    const min = Number(m[2] ?? '0');
    const ap = m[3]?.toLowerCase().replace(/\./g, '');
    if (h <= 24 && min < 60) {
      if (ap === 'pm' && h < 12) h += 12;
      if (ap === 'am' && h === 12) h = 0;
      const d = new Date(now);
      d.setHours(h, min, 0, 0);
      return { display: timeOf(d.toISOString(), lang), minutes: Math.round((d.getTime() - now) / 60000) };
    }
  }
  const rel = /(\d{1,3})\s*min/i.exec(raw);
  if (rel) return { display: `~${rel[1]} min` };
  return { display: raw };
}

/** "14 h 32" in French, "2:32 p.m." in English; empty when there is no date. */
export function timeOf(iso: string | undefined, lang: Lang): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(lang === 'fr' ? 'fr-CA' : 'en-CA', { hour: 'numeric', minute: '2-digit' });
}
