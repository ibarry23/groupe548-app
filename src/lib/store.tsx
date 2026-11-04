import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { dict, type Dict, type Lang } from '../i18n';
import { emptyDraft, submitRequest, SUBMIT_MODE, type QuoteDraft, type SavedRequest } from './submit';
import { fetchTeamUpdates, hasStatusFeed, notify } from './status';

const LS = { lang: 'g548.lang', draft: 'g548.draft', requests: 'g548.requests' } as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode: the app keeps working in memory */
  }
}

export interface Toast {
  id: number;
  msg: string;
  kind: 'info' | 'success' | 'error';
}

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  draft: QuoteDraft;
  setDraft: (fn: (d: QuoteDraft) => QuoteDraft) => void;
  resetDraft: () => void;
  hasDraft: boolean;
  requests: SavedRequest[];
  addRequest: (r: SavedRequest) => void;
  updateRequest: (ref: string, patch: Partial<SavedRequest>) => void;
  removeRequest: (ref: string) => void;
  resend: (ref: string) => Promise<void>;
  /** Pulls the team's status feed and applies it to saved requests; false when there is no feed or it failed. */
  syncStatus: () => Promise<boolean>;
  online: boolean;
  toasts: Toast[];
  toast: (msg: string, kind?: Toast['kind']) => void;
}

const Ctx = createContext<AppState | null>(null);

const detectLang = (): Lang => {
  const saved = load<Lang | null>(LS.lang, null);
  if (saved === 'fr' || saved === 'en') return saved;
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const [draft, setDraftState] = useState<QuoteDraft>(() => load<QuoteDraft | null>(LS.draft, null) ?? emptyDraft(detectLang()));
  const [requests, setRequests] = useState<SavedRequest[]>(() => load<SavedRequest[]>(LS.requests, []));
  const [online, setOnline] = useState<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    document.documentElement.lang = lang === 'fr' ? 'fr-CA' : 'en-CA';
    save(LS.lang, lang);
  }, [lang]);
  // Drafts can hold downscaled photos (~1 MB): debounce so typing stays smooth.
  useEffect(() => {
    const id = window.setTimeout(() => save(LS.draft, draft), 250);
    return () => window.clearTimeout(id);
  }, [draft]);
  useEffect(() => save(LS.requests, requests), [requests]);

  const toast = useCallback((msg: string, kind: Toast['kind'] = 'info') => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts, { id, msg, kind }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3400);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setDraftState((d) => ({ ...d, lang: l }));
  }, []);

  const setDraft = useCallback((fn: (d: QuoteDraft) => QuoteDraft) => setDraftState((d) => fn(d)), []);
  const resetDraft = useCallback(() => setDraftState(emptyDraft(lang)), [lang]);

  const addRequest = useCallback((r: SavedRequest) => setRequests((rs) => [r, ...rs.filter((x) => x.ref !== r.ref)]), []);
  const updateRequest = useCallback((ref: string, patch: Partial<SavedRequest>) => setRequests((rs) => rs.map((r) => (r.ref === ref ? { ...r, ...patch } : r))), []);
  const removeRequest = useCallback((ref: string) => setRequests((rs) => rs.filter((r) => r.ref !== ref)), []);
  const requestsRef = useRef(requests);
  requestsRef.current = requests;

  const syncStatus = useCallback(async () => {
    if (!hasStatusFeed() || !navigator.onLine) return false;
    let updates: Awaited<ReturnType<typeof fetchTeamUpdates>>;
    try {
      updates = await fetchTeamUpdates();
    } catch {
      return false;
    }
    const now = new Date().toISOString();
    const tr = dict[lang].requests;
    const justLeft = requestsRef.current.find((r) => updates.get(r.ref.toUpperCase())?.stage === 'en-route' && r.stage !== 'en-route');
    setRequests((rs) =>
      rs.map((r) => {
        const u = updates.get(r.ref.toUpperCase());
        return u ? { ...r, tracked: true, stage: u.stage, eta: u.eta, teamNote: u.note, teamUpdatedAt: now } : r;
      }),
    );
    if (justLeft) {
      toast(tr.liveEnRoute, 'success');
      void notify(tr.notifyTitle, justLeft.eta ? `${tr.liveEnRoute} ${tr.eta(justLeft.eta)}` : tr.liveEnRoute, `${import.meta.env.BASE_URL}icon-192.png`);
    }
    return true;
  }, [lang, toast]);

  // Keep the team feed fresh whenever the app comes to the front with an open request.
  useEffect(() => {
    if (!hasStatusFeed()) return;
    const run = () => {
      if (document.hidden) return;
      if (requestsRef.current.some((r) => (r.status === 'sent' || r.status === 'demo') && r.stage !== 'done')) void syncStatus();
    };
    run();
    document.addEventListener('visibilitychange', run);
    return () => document.removeEventListener('visibilitychange', run);
  }, [syncStatus]);

  const inFlight = useRef(new Set<string>());
  const resend = useCallback(
    async (ref: string) => {
      const saved = requests.find((r) => r.ref === ref);
      if (!saved || inFlight.current.has(ref)) return;
      inFlight.current.add(ref);
      try {
        const { photoCount: _pc, ...rest } = saved.draft;
        const full: QuoteDraft = { ...rest, photos: [], step: 0 };
        const res = await submitRequest(full, ref);
        const t = dict[lang];
        if (res.ok) {
          updateRequest(ref, { status: res.status, sentAt: new Date().toISOString() });
          toast(t.requests.resent, 'success');
        } else {
          updateRequest(ref, { status: res.reason === 'offline' ? 'queued' : 'failed' });
          toast(res.reason === 'offline' ? t.quote.offlineQueued : t.quote.sendFailed, 'error');
        }
      } finally {
        inFlight.current.delete(ref);
      }
    },
    [requests, updateRequest, lang, toast],
  );

  // Connectivity: flush queued requests when the connection returns.
  const resendRef = useRef(resend);
  resendRef.current = resend;
  useEffect(() => {
    const on = () => {
      setOnline(true);
      for (const r of requestsRef.current) if (r.status === 'queued') void resendRef.current(r.ref);
    };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const hasDraft = draft.services.length > 0 || draft.name.trim().length > 0 || draft.phone.trim().length > 0;

  const value = useMemo<AppState>(
    () => ({ lang, setLang, t: dict[lang], draft, setDraft, resetDraft, hasDraft, requests, addRequest, updateRequest, removeRequest, resend, syncStatus, online, toasts, toast }),
    [lang, setLang, draft, setDraft, resetDraft, hasDraft, requests, addRequest, updateRequest, removeRequest, resend, syncStatus, online, toasts, toast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}

export const isDemoMode = SUBMIT_MODE === 'mock' || !import.meta.env.VITE_WEB3FORMS_KEY;

// This module exports a provider, a hook and constants, so Vite cannot fast-refresh
// it in place; a stale context object would otherwise blank the screen in dev.
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());
