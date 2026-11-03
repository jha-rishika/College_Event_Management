import React, { useState } from 'react';
import { useStore } from './store.jsx';
import { COLLEGE, ROLES } from './data/mock.js';
import { Avatar, Icon, Toasts } from './components/ui.jsx';
import { cx } from './lib/utils.js';
import Student from './views/Student.jsx';
import Organizer from './views/Organizer.jsx';
import Faculty from './views/Faculty.jsx';
import Admin from './views/Admin.jsx';
import Sponsor from './views/Sponsor.jsx';

const ROLE_ICON = { student: 'grad', organizer: 'calendar', faculty: 'shield', admin: 'server', sponsor: 'award' };
const VIEWS = { student: Student, organizer: Organizer, faculty: Faculty, admin: Admin, sponsor: Sponsor };
const FIRST_TAB = { student: 'discover', organizer: 'overview', faculty: 'queue', admin: 'health', sponsor: 'tiers' };

export default function App() {
  const s = useStore();
  const [tabs, setTabs] = useState(FIRST_TAB);
  const [nav, setNav] = useState(false);
  const View = VIEWS[s.role];
  const me = s.userById(ROLES[s.role].userId);

  return (
    <div className="min-h-screen lg:pl-64">
      <button onClick={() => setNav(!nav)} className="fixed left-3 top-3 z-40 rounded-md bg-wine p-2 text-white shadow-card lg:hidden" aria-label="Toggle menu"><Icon name="menu" size={20} /></button>
      {nav && <div className="fixed inset-0 z-30 bg-[#241a22]/50 lg:hidden" onClick={() => setNav(false)} />}

      <aside className={cx('fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-wine text-white transition-transform lg:translate-x-0', nav ? 'translate-x-0' : '-translate-x-full')}>
        <div className="border-b border-white/15 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-amber font-display text-lg font-bold text-wine">C</span>
            <div><div className="font-display text-xl font-bold leading-none">CEMS</div><div className="mt-1 text-[10px] uppercase tracking-widest text-white/65">Event management</div></div>
          </div>
        </div>
        <div className="px-3 pb-2 pt-5">
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Viewing as</div>
          {Object.entries(ROLES).map(([id, r]) => (
            <button key={id} onClick={() => { s.setRole(id); setNav(false); }} className={cx('mb-0.5 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors', s.role === id ? 'bg-white text-wine' : 'text-white/85 hover:bg-white/10')}>
              <Icon name={ROLE_ICON[id]} size={17} className={s.role === id ? 'text-pink' : ''} />{r.label}
            </button>
          ))}
        </div>
        <div className="mt-auto border-t border-white/15 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={me.name} size={36} tone="amber" />
            <div className="min-w-0"><div className="truncate text-sm font-semibold">{me.name}</div><div className="truncate text-xs text-white/65">{me.dept}</div></div>
          </div>
          <div className="mt-3 text-[10px] leading-snug text-white/45">{COLLEGE}<br />Demo build with mock data. Nothing is saved.</div>
        </div>
      </aside>

      <main className="mx-auto max-w-[1180px] px-4 pb-16 pt-16 sm:px-8 lg:pt-8">
        <View tab={tabs[s.role]} setTab={(t) => setTabs({ ...tabs, [s.role]: t })} />
      </main>
      <Toasts toasts={s.toasts} />
    </div>
  );
}
