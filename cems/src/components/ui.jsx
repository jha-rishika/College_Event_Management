import React, { useEffect } from 'react';
import { cx, initials } from '../lib/utils.js';

/* ---------- Icons (inline, stroke-based) ---------- */
const P = {
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  ticket: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2M13 11v2M13 17v2" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  plus: <path d="M12 5v14M5 12h14" />,
  alert: <><path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" /><path d="M12 9v4M12 17h.01" /></>,
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1L12 2Z" />,
  upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  grid: <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  megaphone: <><path d="m3 11 18-5v12L3 14v-3Z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></>,
  wallet: <><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" /><path d="M4 6v12a2 2 0 0 0 2 2h14v-8" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>,
  building: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" /></>,
  trend: <><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></>,
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></>,
  file: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" /><path d="M14 2v6h6" /></>,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
  back: <path d="M19 12H5m7-7-7 7 7 7" />,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
  grad: <><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>,
  award: <><circle cx="12" cy="8" r="6" /><path d="M15.5 13.9 17 22l-5-3-5 3 1.5-8.1" /></>,
  server: <><rect x="2" y="3" width="20" height="8" rx="2" /><rect x="2" y="13" width="20" height="8" rx="2" /><path d="M6 7h.01M6 17h.01" /></>,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />,
  edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />,
  qr: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4" /></>,
  sliders: <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
};
export const Icon = ({ name, size = 16, className = '', fill = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cx('shrink-0', className)} aria-hidden="true">
    {P[name]}
  </svg>
);

/* ---------- Primitives ---------- */
export const Card = ({ className = '', children, ...rest }) => (
  <div className={cx('rounded-lg border border-line bg-white shadow-card', className)} {...rest}>{children}</div>
);

const BTN = {
  primary: 'bg-pink text-white hover:bg-pink-dark border border-pink',
  dark: 'bg-wine text-white hover:bg-wine-dark border border-wine',
  outline: 'bg-white text-wine border border-wine/40 hover:bg-wine-soft',
  ghost: 'bg-transparent text-ink-soft border border-transparent hover:bg-sky-100',
  danger: 'bg-white text-wine border border-wine hover:bg-wine hover:text-white',
  ok: 'bg-ok text-white border border-ok hover:opacity-90',
};
export const Button = ({ variant = 'primary', size = 'md', icon, className = '', children, ...rest }) => (
  <button
    className={cx(
      'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45',
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
      BTN[variant], className
    )}
    {...rest}
  >
    {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
    {children}
  </button>
);

const BADGE = {
  pink: 'bg-pink-soft text-pink-dark', amber: 'bg-amber-soft text-[#8a5a00]', wine: 'bg-wine-soft text-wine',
  sky: 'bg-sky-100 text-[#27517f]', gray: 'bg-[#eceaee] text-ink-soft', ok: 'bg-ok-soft text-ok', solid: 'bg-wine text-white',
};
export const Badge = ({ tone = 'gray', icon, children, className = '' }) => (
  <span className={cx('inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold', BADGE[tone], className)}>
    {icon && <Icon name={icon} size={11} />}
    {children}
  </span>
);

const STATUS_TONE = {
  approved: 'ok', confirmed: 'ok', pending: 'amber', submitted: 'amber', rejected: 'wine', waitlist: 'amber',
  active: 'ok', completed: 'gray', 'in review': 'amber', uploading: 'sky', draft: 'gray',
};
export const StatusBadge = ({ status }) => (
  <Badge tone={STATUS_TONE[status] || 'gray'} className="capitalize">{status}</Badge>
);

export const Avatar = ({ name, size = 32, tone = 'wine' }) => (
  <span
    className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', tone === 'wine' ? 'bg-wine-soft text-wine' : 'bg-amber-soft text-[#8a5a00]')}
    style={{ width: size, height: size, fontSize: size * 0.38 }}
  >
    {initials(name)}
  </span>
);

export const Progress = ({ value, max = 100, tone = 'pink' }) => {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 100 ? 'bg-wine' : pct > 85 ? 'bg-amber' : tone === 'ok' ? 'bg-ok' : 'bg-pink';
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
      <div className={cx('h-full rounded-full', color)} style={{ width: pct + '%' }} />
    </div>
  );
};

export const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="label">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-ink-mute">{hint}</span>}
  </label>
);

export const PageHeader = ({ title, sub, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="font-display text-[28px] font-bold leading-tight text-wine">{title}</h1>
      {sub && <p className="mt-1 max-w-2xl text-sm text-ink-soft">{sub}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const Stat = ({ label, value, sub, icon, tone = 'wine' }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      {icon && (
        <span className={cx('flex h-7 w-7 items-center justify-center rounded', tone === 'amber' ? 'bg-amber-soft text-[#8a5a00]' : tone === 'pink' ? 'bg-pink-soft text-pink-dark' : 'bg-wine-soft text-wine')}>
          <Icon name={icon} size={15} />
        </span>
      )}
    </div>
    <div className="mt-2 font-display text-[26px] font-bold leading-none text-ink">{value}</div>
    {sub && <div className="mt-1.5 text-xs text-ink-mute">{sub}</div>}
  </Card>
);

export const Empty = ({ icon = 'info', title, children }) => (
  <div className="flex flex-col items-center rounded-lg border border-dashed border-[#a9c6e3] bg-white/60 px-6 py-12 text-center">
    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-wine"><Icon name={icon} size={18} /></span>
    <div className="font-semibold text-ink">{title}</div>
    {children && <div className="mt-1 max-w-sm text-sm text-ink-soft">{children}</div>}
  </div>
);

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="mb-5 flex gap-1 overflow-x-auto border-b border-[#9fc3e6]">
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={cx(
          'relative -mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors',
          value === t.id ? 'border-pink text-wine' : 'border-transparent text-ink-soft hover:text-wine'
        )}
      >
        {t.label}
        {t.count > 0 && <span className="ml-1.5 rounded bg-pink px-1.5 py-0.5 text-[10px] text-white">{t.count}</span>}
      </button>
    ))}
  </div>
);

export function Modal({ open, onClose, title, children, footer, width = 'max-w-xl' }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241a22]/55 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()} className={cx('flex max-h-[90vh] w-full flex-col rounded-lg bg-white shadow-pop', width)}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-display text-lg font-bold text-wine">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-ink-soft hover:bg-sky-100" aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-sky-50 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Toasts({ toasts }) {
  const color = { ok: 'border-ok', warn: 'border-amber', info: 'border-wine' };
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={cx('pointer-events-auto rounded-md border-l-4 bg-white px-4 py-3 text-sm shadow-pop', color[t.tone])}>{t.msg}</div>
      ))}
    </div>
  );
}

export const Table = ({ head, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-line bg-sky-50 text-[11px] uppercase tracking-wide text-ink-soft">
          {head.map((h, i) => <th key={i} className="px-4 py-2.5 font-semibold">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">{children}</tbody>
    </table>
  </div>
);

export const Stars = ({ value, onChange, size = 22 }) => (
  <div className="flex gap-1" role={onChange ? undefined : 'img'} aria-label={onChange ? undefined : `${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => {
      const cls = cx(n <= value ? 'text-amber' : 'text-[#d9d3dc]', onChange && 'hover:scale-110');
      const star = <Icon name="star" size={size} fill={n <= value} />;
      return onChange ? (
        <button key={n} type="button" onClick={() => onChange(n)} className={cls} aria-label={`${n} star`}>{star}</button>
      ) : (
        <span key={n} className={cls}>{star}</span>
      );
    })}
  </div>
);

export const DateBlock = ({ month, day }) => (
  <div className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-md border border-line bg-sky-50 leading-none">
    <span className="text-[10px] font-bold tracking-wider text-pink">{month}</span>
    <span className="mt-0.5 font-display text-lg font-bold text-wine">{day}</span>
  </div>
);
