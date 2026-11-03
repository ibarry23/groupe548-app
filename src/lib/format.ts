import { Capacitor } from '@capacitor/core';
import type { Lang } from '../i18n';

export const digits = (s: string) => s.replace(/\D/g, '');

/** Formats as the customer types: 514 555 0123 */
export function formatPhone(raw: string): string {
  let d = digits(raw);
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  d = d.slice(0, 10);
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 10);
  if (d.length > 6) return `${a} ${b} ${c}`;
  if (d.length > 3) return `${a} ${b}`;
  return a;
}

export const isValidPhone = (raw: string) => {
  let d = digits(raw);
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return d.length === 10;
};

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

export function formatDate(iso: string | undefined, lang: Lang, withTime = false): string {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export const todayIso = () => {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

/** Late June / early July and the last days of a month are peak demand in Montréal. */
export function isPeakDate(iso: string | undefined): boolean {
  if (!iso) return false;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const m = d.getMonth();
  const day = d.getDate();
  if ((m === 5 && day >= 24) || (m === 6 && day <= 7)) return true;
  const last = new Date(d.getFullYear(), m + 1, 0).getDate();
  return day >= last - 2 || day === 1;
}

/** Human reference like G548-7K3Q — short enough to read over the phone. */
export function makeReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  for (const n of arr) out += alphabet[n % alphabet.length];
  return `G548-${out}`;
}

/** Downscale a photo on-device so previews stay light (≤ 1024px, JPEG). */
export function downscaleImage(file: File, max = 1024, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas'));
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image'));
    };
    img.src = url;
  });
}

/** Native haptics inside the Capacitor shell (iOS/Android); vibration API on the web where supported. */
export function haptic(kind: 'light' | 'success' | 'error' = 'light') {
  if (Capacitor.isNativePlatform()) {
    import('@capacitor/haptics')
      .then(({ Haptics, ImpactStyle, NotificationType }) =>
        kind === 'light'
          ? Haptics.impact({ style: ImpactStyle.Light })
          : Haptics.notification({ type: kind === 'success' ? NotificationType.Success : NotificationType.Error }),
      )
      .catch(() => {});
    return;
  }
  try {
    if (!('vibrate' in navigator)) return;
    navigator.vibrate(kind === 'success' ? [12, 40, 12] : kind === 'error' ? [30, 40, 30] : 8);
  } catch {
    /* unsupported */
  }
}
