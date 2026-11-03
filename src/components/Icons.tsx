import type { SVGProps } from 'react';

const P: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  inbox: 'M3 13l2.5-8h13L21 13v6H3zM3 13h5l1.5 3h5L16 13h5',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  'chevron-right': 'm9 6 6 6-6 6',
  'chevron-left': 'm15 6-6 6 6 6',
  'chevron-down': 'm6 9 6 6 6-6',
  'arrow-right': 'M5 12h14m-6-6 6 6-6 6',
  'arrow-left': 'M19 12H5m6-6-6 6 6 6',
  check: 'm5 12 5 5L20 7',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6 6 18',
  spray: 'M8 9h8l1 12H7zM10 9V6a2 2 0 0 1 2-2h0M16 6h3M16 3l2-1M16 9l2 1',
  building: 'M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M3 21h18M7 8h3M7 12h3M7 16h3M17 13h1M17 17h1',
  hardhat: 'M4 17h16M5 17a7 7 0 0 1 14 0M12 10V6M9 7v4M15 7v4M3 20h18',
  window: 'M4 4h16v16H4zM12 4v16M4 12h16',
  truck: 'M2 7h11v9H2zM13 10h4l3 3v3h-7zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  box: 'M3 8l9-4 9 4v9l-9 4-9-4zM3 8l9 4 9-4M12 12v9',
  roller: 'M5 4h12v5H5zM17 6h3v4h-8v2M12 12v8M10 20h4',
  key: 'M14 3a5 5 0 0 0-4.6 7L3 16.4V20h3.6l1.4-1.4v-2h2l1.4-1.4A5 5 0 1 0 14 3zM15.5 8.5h.01',
  calendar: 'M4 6h16v14H4zM8 3v5M16 3v5M4 11h16',
  'map-pin': 'M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 11v5M12 8h.01',
  alert: 'M12 3 2 20h20zM12 10v4M12 17h.01',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6zM9 12l2 2 4-4',
  leaf: 'M5 19C5 9 11 5 20 5c0 9-4 15-14 15M5 19l7-7',
  sparkles: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  message: 'M4 5h16v11H9l-5 4z',
  external: 'M14 4h6v6M20 4l-9 9M19 14v6H4V5h6',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6',
  edit: 'M4 20h4l10-10-4-4L4 16zM13 7l4 4',
  'wifi-off': 'M2 2l20 20M5 12a11 11 0 0 1 5-3M2 8.5a16 16 0 0 1 7-4M12 16a4 4 0 0 1 3 1.5M12 20h.01M16 11a11 11 0 0 1 3 1M15 4.5a16 16 0 0 1 7 4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6',
  receipt: 'M5 3h14v18l-2-1.5L15 21l-2-1.5L11 21l-2-1.5L7 21l-2-1.5zM8 8h8M8 12h8M8 16h5',
  moon: 'M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  weekend: 'M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 15h18M5 18v2M19 18v2',
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 22, strokeWidth = 1.8, draw, className = 'ico', ...rest }: { name: IconName; size?: number; strokeWidth?: number; draw?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={`${className} ${draw ? 'ico--draw' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={P[name]} pathLength={draw ? 1 : undefined} />
    </svg>
  );
}
