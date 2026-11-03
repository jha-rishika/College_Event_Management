import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { activity, registrationsPerDay } from '../data/mock.js';
import { fmtDate, fmtTime, cx } from '../lib/utils.js';
import { Avatar, Badge, Button, Card, Empty, Icon, PageHeader, Progress, Stat, StatusBadge, Table, Tabs } from '../components/ui.jsx';

const ROLE_LABEL = { student: 'Student', organizer: 'Organizer', faculty: 'Faculty', admin: 'Admin', sponsor: 'Sponsor' };

export default function Admin({ tab, setTab }) {
  const s = useStore();
  const pending = s.venueRequests.filter((v) => v.status === 'pending').length;
  const tabs = [
    { id: 'health', label: 'System Health' },
    { id: 'users', label: 'User Roles' },
    { id: 'venues', label: 'Venue Approvals', count: pending },
  ];
  const titles = {
    health: ['System health', 'Live service status and platform usage.'],
    users: ['User roles', 'Change what people can do or switch off an account.'],
    venues: ['Venue booking approvals', 'Confirm or decline venue requests attached to event proposals.'],
  };
  return (
    <div>
      <PageHeader title={titles[tab][0]} sub={titles[tab][1]} />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'health' && <Health />}
      {tab === 'users' && <Users />}
      {tab === 'venues' && <VenueApprovals />}
    </div>
  );
}

function Health() {
  const s = useStore();
  const services = [
    { n: 'Authentication (SSO)', st: 'operational', ms: '48 ms' },
    { n: 'Event & ticketing API', st: 'operational', ms: '112 ms' },
    { n: 'QR check-in service', st: 'operational', ms: '71 ms' },
    { n: 'Email gateway', st: 'degraded', ms: '1.9 s' },
    { n: 'Payments gateway', st: 'operational', ms: '240 ms' },
  ];
  const max = Math.max(...registrationsPerDay.map((d) => d.n));
  const regs = s.registrations.length;
  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="users" label="Registered users" value="3,412" sub={`${s.users.filter((u) => u.active).length} of ${s.users.length} sampled accounts active`} />
        <Stat icon="calendar" tone="pink" label="Active events" value={s.events.filter((e) => e.status === 'approved' && e.date >= '2026-11-03').length} sub={`${s.events.filter((e) => e.status === 'pending').length} awaiting approval`} />
        <Stat icon="ticket" tone="amber" label="Tickets issued" value={(1284 + regs).toLocaleString('en-IN')} sub="This term" />
        <Stat icon="activity" label="Uptime (30 days)" value="99.97%" sub="1 incident, 13 min" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-wine">Registrations, last 7 days</h3>
          <div className="mt-5 flex items-end gap-3">
            {registrationsPerDay.map((d) => (
              <div key={d.d} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-ink-soft">{d.n}</span>
                <div className={cx('w-full rounded-t-sm', d.n === max ? 'bg-pink' : 'bg-wine')} style={{ height: Math.round((d.n / max) * 140) }} />
                <span className="text-[11px] text-ink-mute">{d.d}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-bold text-wine">Resources</h3>
          {[['API load', 38], ['Database connections', 54], ['Storage (posters, media kits)', 71], ['Memory', 46]].map(([l, v]) => (
            <div key={l} className="mb-3 last:mb-0"><div className="mb-1 flex justify-between text-xs"><span className="text-ink-soft">{l}</span><b>{v}%</b></div><Progress value={v} /></div>
          ))}
        </Card>
        <Card>
          <h3 className="border-b border-line px-5 py-3 text-sm font-bold text-wine">Services</h3>
          {services.map((x) => (
            <div key={x.n} className="flex items-center justify-between border-b border-line px-5 py-2.5 text-sm last:border-0">
              <span className="flex items-center gap-2.5"><span className={cx('h-2 w-2 rounded-full', x.st === 'operational' ? 'bg-ok' : 'bg-amber')} />{x.n}</span>
              <span className="flex items-center gap-3 text-xs text-ink-mute">{x.ms}<Badge tone={x.st === 'operational' ? 'ok' : 'amber'}>{x.st}</Badge></span>
            </div>
          ))}
        </Card>
        <Card>
          <h3 className="border-b border-line px-5 py-3 text-sm font-bold text-wine">Recent activity</h3>
          <ul className="px-5 py-2">
            {activity.map((a, i) => <li key={i} className="flex gap-3 border-b border-line py-2.5 text-sm last:border-0"><span className="w-16 shrink-0 text-xs text-ink-mute">{a.t}</span><span className="text-ink-soft">{a.text}</span></li>)}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Users() {
  const s = useStore();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const list = s.users.filter((u) => (role === 'all' || u.role === role) && (u.name + u.email + u.dept).toLowerCase().includes(q.toLowerCase()));
  return (
    <Card>
      <div className="flex flex-wrap gap-3 border-b border-line p-4">
        <div className="relative min-w-[220px] flex-1"><Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" /><input className="field pl-9" placeholder="Search name, email or department" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" /></div>
        <select className="field w-auto" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role"><option value="all">All roles</option>{Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      <Table head={['User', 'Department', 'Last active', 'Role', 'Account']}>
        {list.map((u) => (
          <tr key={u.id} className={cx(!u.active && 'bg-[#f7f5f8] text-ink-mute')}>
            <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar name={u.name} size={30} tone={u.role === 'sponsor' ? 'amber' : 'wine'} /><div><div className="font-semibold">{u.name}</div><div className="text-xs text-ink-mute">{u.email}</div></div></div></td>
            <td className="px-4 py-2.5">{u.dept}{u.year !== '-' && <span className="text-xs text-ink-mute"> · {u.year}</span>}</td>
            <td className="px-4 py-2.5 text-xs">{u.last}</td>
            <td className="px-4 py-2.5"><select value={u.role} disabled={u.id === 'u4'} onChange={(e) => s.setUserRole(u.id, e.target.value)} className="field w-auto py-1.5" aria-label={`Role for ${u.name}`}>{Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
            <td className="px-4 py-2.5">
              <button disabled={u.id === 'u4'} onClick={() => s.toggleUser(u.id)} role="switch" aria-checked={u.active} aria-label={`${u.active ? 'Deactivate' : 'Activate'} ${u.name}`} className={cx('relative h-5 w-9 rounded-full transition-colors disabled:opacity-40', u.active ? 'bg-ok' : 'bg-[#bdb5c0]')}>
                <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all', u.active ? 'left-[18px]' : 'left-0.5')} />
              </button>
            </td>
          </tr>
        ))}
      </Table>
      {list.length === 0 && <div className="p-8 text-center text-sm text-ink-soft">No users match.</div>}
    </Card>
  );
}

function VenueApprovals() {
  const s = useStore();
  const pending = s.venueRequests.filter((v) => v.status === 'pending');
  const done = s.venueRequests.filter((v) => v.status !== 'pending' && s.eventById(v.eventId)?.date >= '2026-11-03').slice(-6).reverse();
  const Row = ({ v, actions }) => {
    const ev = s.eventById(v.eventId);
    const venue = s.venueById(v.venueId);
    const org = s.userById(v.requestedBy);
    const clash = s.venueClash(v.venueId, ev, ev.id);
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 last:border-0">
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{venue.name} <span className="font-normal text-ink-mute">for</span> {ev.title}</div>
          <div className="mt-0.5 text-xs text-ink-soft">{fmtDate(ev.date)}, {fmtTime(ev.start)} to {fmtTime(ev.end)} · {ev.capacity} expected · requested by {org?.name}</div>
          {clash && <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-wine"><Icon name="alert" size={13} />Double booking: {clash.title} ({clash.status})</div>}
          {ev.capacity > venue.capacity && <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-wine"><Icon name="alert" size={13} />Over venue capacity ({venue.capacity})</div>}
        </div>
        {actions}
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="border-b border-line px-5 py-3 text-sm font-bold text-wine">Pending ({pending.length})</h3>
        {pending.length === 0 ? <div className="p-6"><Empty icon="check" title="No pending venue requests" /></div> : pending.map((v) => (
          <Row key={v.id} v={v} actions={<div className="flex gap-2"><Button size="sm" variant="danger" onClick={() => s.decideVenue(v.id, 'rejected')}>Decline</Button><Button size="sm" variant="ok" icon="check" onClick={() => s.decideVenue(v.id, 'approved')}>Approve</Button></div>} />
        ))}
      </Card>
      <Card>
        <h3 className="border-b border-line px-5 py-3 text-sm font-bold text-wine">Recently decided</h3>
        {done.map((v) => <Row key={v.id} v={v} actions={<StatusBadge status={v.status} />} />)}
      </Card>
    </div>
  );
}
