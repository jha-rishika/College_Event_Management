import React, { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { TODAY, CATEGORIES, venues } from '../data/mock.js';
import { fmtDate, fmtTime, inr, sum, toMin, cx } from '../lib/utils.js';
import { Avatar, Badge, Button, Card, Empty, Field, Icon, PageHeader, Progress, Stat, StatusBadge, Table, Tabs } from '../components/ui.jsx';

const ME = 'u2';
const CLUBS = ['Coding Club', 'Robotics Society'];

export default function Organizer({ tab, setTab }) {
  const s = useStore();
  const [rosterId, setRosterId] = useState('e1');
  const pending = s.events.filter((e) => e.organizerId === ME && e.status === 'pending').length;
  const tabs = [
    { id: 'overview', label: 'My Events' },
    { id: 'create', label: 'Create Event' },
    { id: 'venues', label: 'Venue Availability' },
    { id: 'budget', label: 'Budget Proposals' },
    { id: 'roster', label: 'Participant Roster' },
  ];
  const titles = {
    overview: ['My events', 'Everything your clubs have proposed, approved or run.'],
    create: ['New event proposal', 'Four short steps. The faculty coordinator and venue admin review it after you submit.'],
    venues: ['Venue availability', 'See what is booked before you pick a slot.'],
    budget: ['Budget proposals', 'Submit or revise the budget for an event. Faculty reviews it from their queue.'],
    roster: ['Participant roster', 'Check people in at the door and export the list.'],
  };
  return (
    <div>
      <PageHeader title={titles[tab][0]} sub={titles[tab][1]} actions={tab === 'overview' && <Button icon="plus" onClick={() => setTab('create')}>New event</Button>} />
      <Tabs tabs={tabs.map((t) => (t.id === 'overview' ? { ...t, count: pending } : t))} value={tab} onChange={setTab} />
      {tab === 'overview' && <Overview openRoster={(id) => { setRosterId(id); setTab('roster'); }} openBudget={() => setTab('budget')} />}
      {tab === 'create' && <Wizard done={() => setTab('overview')} />}
      {tab === 'venues' && <VenueTab />}
      {tab === 'budget' && <BudgetTab />}
      {tab === 'roster' && <Roster id={rosterId} setId={setRosterId} />}
    </div>
  );
}

/* ---------- Overview ---------- */
function Overview({ openRoster, openBudget }) {
  const s = useStore();
  const mine = s.events.filter((e) => e.organizerId === ME).sort((a, b) => b.date.localeCompare(a.date));
  const live = mine.filter((e) => e.status === 'approved' && e.date >= TODAY);
  const regs = live.reduce((n, e) => n + s.confirmedCount(e), 0);
  const rated = mine.filter((e) => e.rating);
  const avg = rated.length ? (rated.reduce((n, e) => n + e.rating.avg, 0) / rated.length).toFixed(1) : '-';
  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="calendar" label="Live events" value={live.length} sub="Approved and upcoming" />
        <Stat icon="clock" tone="amber" label="Awaiting review" value={mine.filter((e) => e.status === 'pending').length} sub="With faculty coordinator" />
        <Stat icon="users" tone="pink" label="Registrations" value={regs} sub="Across live events" />
        <Stat icon="star" tone="amber" label="Avg. rating" value={avg} sub="From past events" />
      </div>
      <Card>
        <Table head={['Event', 'Date', 'Venue', 'Seats', 'Budget', 'Status', '']}>
          {mine.map((e) => {
            const n = s.confirmedCount(e);
            return (
              <tr key={e.id} className="align-middle">
                <td className="px-4 py-3"><div className="font-semibold">{e.title}</div><div className="text-xs text-ink-mute">{e.club}</div></td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{fmtDate(e.date)}<div className="text-xs">{fmtTime(e.start)}</div></td>
                <td className="px-4 py-3 text-ink-soft">{s.venueById(e.venueId).name}</td>
                <td className="w-36 px-4 py-3">{e.status === 'approved' ? <><div className="mb-1 text-xs font-semibold">{n}/{e.capacity}</div><Progress value={n} max={e.capacity} /></> : <span className="text-xs text-ink-mute">Cap. {e.capacity}</span>}</td>
                <td className="whitespace-nowrap px-4 py-3"><div className="font-semibold">{inr(sum(e.budget.items))}</div><StatusBadge status={e.budget.status} /></td>
                <td className="px-4 py-3">
                  <StatusBadge status={e.status} />
                  {e.status === 'rejected' && e.reviewNote && <div className="mt-1 max-w-[180px] text-[11px] text-wine">{e.reviewNote}</div>}
                  {e.rating && <div className="mt-1 flex items-center gap-1 text-xs text-ink-soft"><Icon name="star" size={12} fill className="text-amber" />{e.rating.avg.toFixed(1)} ({e.rating.count})</div>}
                </td>
                <td className="px-4 py-3 text-right">{e.status === 'approved' && <Button size="sm" variant="outline" onClick={() => openRoster(e.id)}>Roster</Button>}</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}

/* ---------- Availability grid ---------- */
const HOURS = Array.from({ length: 15 }, (_, i) => 7 + i); // 07:00 – 21:00
export function AvailabilityGrid({ date, selected }) {
  const s = useStore();
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid items-end gap-px pb-1" style={{ gridTemplateColumns: `150px repeat(${HOURS.length}, 1fr)` }}>
          <div />
          {HOURS.map((h) => <div key={h} className="text-center text-[10px] font-semibold text-ink-mute">{h % 12 || 12}{h >= 12 ? 'p' : 'a'}</div>)}
        </div>
        {venues.map((v) => (
          <div key={v.id} className="grid items-center gap-px border-t border-line py-1" style={{ gridTemplateColumns: `150px repeat(${HOURS.length}, 1fr)` }}>
            <div className="pr-2 text-xs font-semibold leading-tight">{v.name}<div className="font-normal text-ink-mute">Cap. {v.capacity}</div></div>
            {HOURS.map((h) => {
              const slot = { date, start: `${String(h).padStart(2, '0')}:00`, end: `${String(h + 1).padStart(2, '0')}:00` };
              const busy = s.venueClash(v.id, slot);
              const sel = selected && selected.venueId === v.id && selected.start && selected.end && toMin(selected.start) < (h + 1) * 60 && toMin(selected.end) > h * 60;
              return (
                <div
                  key={h}
                  title={busy ? `${busy.title} (${busy.status})` : 'Free'}
                  className={cx('h-7 rounded-sm border', sel ? (busy ? 'border-wine bg-wine' : 'border-pink bg-pink') : busy ? (busy.status === 'pending' ? 'border-amber bg-amber/70' : 'border-[#d6c2cb] bg-[#e9d5dc]') : 'border-line bg-sky-50')}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-ink-soft">
          {[['bg-sky-50 border-line', 'Free'], ['bg-[#e9d5dc] border-[#d6c2cb]', 'Booked'], ['bg-amber/70 border-amber', 'Pending approval'], ['bg-pink border-pink', 'Your selection']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5"><span className={cx('h-3 w-5 rounded-sm border', c)} />{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function VenueTab() {
  const s = useStore();
  const [date, setDate] = useState('2026-11-08');
  const day = s.events.filter((e) => e.date === date && e.status !== 'rejected').sort((a, b) => a.start.localeCompare(b.start));
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <Card className="p-4">
        <div className="mb-4 max-w-[200px]"><Field label="Date"><input type="date" className="field" value={date} min={TODAY} onChange={(e) => setDate(e.target.value)} /></Field></div>
        <AvailabilityGrid date={date} />
      </Card>
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-bold text-wine">Bookings on {fmtDate(date)}</h3>
        {day.length === 0 ? <p className="text-sm text-ink-soft">Every venue is free this day.</p> : (
          <ul className="space-y-3">
            {day.map((e) => (
              <li key={e.id} className="border-l-2 border-pink pl-3">
                <div className="text-sm font-semibold leading-snug">{e.title}</div>
                <div className="text-xs text-ink-soft">{s.venueById(e.venueId).name} · {fmtTime(e.start)} to {fmtTime(e.end)}</div>
                <div className="mt-1"><StatusBadge status={e.status} /></div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ---------- Budget ---------- */
export function BudgetEditor({ items, setItems }) {
  const upd = (i, k, v) => setItems(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const total = sum(items);
  return (
    <div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className="field flex-1" placeholder="Line item (e.g. Sound system)" value={it.label} onChange={(e) => upd(i, 'label', e.target.value)} aria-label="Line item" />
            <div className="relative w-36"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-mute">{'₹'}</span><input type="number" min="0" className="field pl-7" value={it.amount} onChange={(e) => upd(i, 'amount', e.target.value)} aria-label="Amount" /></div>
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="rounded p-2 text-ink-mute hover:bg-wine-soft hover:text-wine" aria-label="Remove line"><Icon name="trash" /></button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Button size="sm" variant="outline" icon="plus" onClick={() => setItems([...items, { label: '', amount: '' }])}>Add line</Button>
        <div className="text-sm text-ink-soft">Total <span className="ml-2 font-display text-xl font-bold text-wine">{inr(total)}</span></div>
      </div>
      {total > 50000 && <div className="mt-3 flex items-center gap-2 rounded bg-amber-soft px-3 py-2 text-xs text-[#8a5a00]"><Icon name="info" size={14} />Budgets above {inr(50000)} get an additional review from the finance office.</div>}
    </div>
  );
}

function BudgetTab() {
  const s = useStore();
  const mine = s.events.filter((e) => e.organizerId === ME && e.date >= TODAY);
  const [id, setId] = useState(mine[0]?.id);
  const ev = mine.find((e) => e.id === id) || mine[0];
  const [drafts, setDrafts] = useState({});
  if (!ev) return <Empty icon="wallet" title="No upcoming events" />;
  const items = drafts[ev.id] || ev.budget.items;
  const dirty = !!drafts[ev.id];
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <Card className="p-2">
        {mine.map((e) => (
          <button key={e.id} onClick={() => setId(e.id)} className={cx('mb-0.5 flex w-full items-start justify-between gap-2 rounded px-3 py-2.5 text-left', e.id === ev.id ? 'bg-wine-soft' : 'hover:bg-sky-50')}>
            <span className="text-sm font-semibold leading-snug">{e.title}<span className="block text-xs font-normal text-ink-mute">{inr(sum(e.budget.items))}</span></span>
            <StatusBadge status={e.budget.status} />
          </button>
        ))}
      </Card>
      <Card className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div><h3 className="font-display text-lg font-bold">{ev.title}</h3><p className="text-xs text-ink-soft">Itemise every expense you expect. Sponsor-funded items can be listed at zero.</p></div>
          <StatusBadge status={ev.budget.status} />
        </div>
        {ev.budget.note && <div className="mb-4 rounded bg-sky-50 p-3 text-sm text-ink-soft"><b className="text-ink">Reviewer note:</b> {ev.budget.note}</div>}
        <BudgetEditor items={items} setItems={(v) => setDrafts({ ...drafts, [ev.id]: v })} />
        <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
          {dirty && <Button variant="ghost" onClick={() => setDrafts({ ...drafts, [ev.id]: undefined })}>Discard changes</Button>}
          <Button disabled={!dirty || items.some((i) => !i.label || !(Number(i.amount) >= 0) || i.amount === '')} onClick={() => { s.submitBudget(ev.id, items.map((i) => ({ ...i, amount: Number(i.amount) }))); setDrafts({ ...drafts, [ev.id]: undefined }); }}>Submit for review</Button>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Wizard ---------- */
function Wizard({ done }) {
  const s = useStore();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ title: '', club: CLUBS[0], category: 'Tech', description: '', capacity: 60, fee: 0, date: '2026-11-24', start: '10:00', end: '13:00', venueId: '', items: [{ label: '', amount: '' }] });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const slot = { date: f.date, start: f.start, end: f.end };
  const timeOk = toMin(f.end) > toMin(f.start);
  const venue = venues.find((v) => v.id === f.venueId);
  const venueBusy = venue ? s.venueClash(venue.id, slot) : null;
  const budgetOk = f.items.length > 0 && f.items.every((i) => i.label && i.amount !== '' && Number(i.amount) >= 0);

  const valid = [
    f.title.trim().length >= 5 && f.description.trim().length >= 20 && Number(f.capacity) > 0,
    f.date >= TODAY && timeOk && venue && !venueBusy && Number(f.capacity) <= venue.capacity,
    budgetOk,
    true,
  ][step];
  const STEPS = ['Basics', 'Date & venue', 'Budget', 'Review'];

  const submit = () => {
    s.createEvent({ title: f.title.trim(), club: f.club, category: f.category, description: f.description.trim(), capacity: Number(f.capacity), fee: Number(f.fee) || 0, date: f.date, start: f.start, end: f.end, venueId: f.venueId, budgetItems: f.items.map((i) => ({ label: i.label, amount: Number(i.amount) })) });
    done();
  };

  return (
    <Card className="mx-auto max-w-4xl">
      <ol className="flex border-b border-line">
        {STEPS.map((t, i) => (
          <li key={t} className={cx('flex flex-1 items-center gap-2 px-4 py-3 text-sm font-semibold', i === step ? 'text-wine' : i < step ? 'text-ok' : 'text-ink-mute')}>
            <span className={cx('flex h-6 w-6 items-center justify-center rounded-full text-xs', i === step ? 'bg-pink text-white' : i < step ? 'bg-ok text-white' : 'bg-sky-100')}>{i < step ? <Icon name="check" size={12} /> : i + 1}</span>
            <span className="hidden sm:inline">{t}</span>
          </li>
        ))}
      </ol>
      <div className="p-6">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Event title"><input className="field" value={f.title} onChange={set('title')} placeholder="e.g. Intro to Cloud Security" /></Field></div>
            <Field label="Organising club"><select className="field" value={f.club} onChange={set('club')}>{CLUBS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Category"><select className="field" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <div className="sm:col-span-2"><Field label="Description" hint="At least 20 characters. Students see this on the event page."><textarea rows={4} className="field" value={f.description} onChange={set('description')} /></Field></div>
            <Field label="Capacity"><input type="number" min="1" className="field" value={f.capacity} onChange={set('capacity')} /></Field>
            <Field label="Entry fee (INR)" hint="Leave 0 for a free event"><input type="number" min="0" className="field" value={f.fee} onChange={set('fee')} /></Field>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date"><input type="date" min={TODAY} className="field" value={f.date} onChange={set('date')} /></Field>
              <Field label="Starts"><input type="time" className="field" value={f.start} onChange={set('start')} /></Field>
              <Field label="Ends" hint={!timeOk ? 'End time must be after start' : ''}><input type="time" className="field" value={f.end} onChange={set('end')} /></Field>
            </div>
            <div className="label mt-5">Choose a venue</div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {venues.map((v) => {
                const busy = timeOk ? s.venueClash(v.id, slot) : null;
                const small = Number(f.capacity) > v.capacity;
                const disabled = !!busy || small;
                return (
                  <button key={v.id} disabled={disabled} onClick={() => setF({ ...f, venueId: v.id })} className={cx('rounded-md border p-3 text-left transition-colors', f.venueId === v.id ? 'border-pink bg-pink-soft' : 'border-line bg-white', disabled ? 'cursor-not-allowed opacity-55' : 'hover:border-pink')}>
                    <div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{v.name}</span><span className="text-xs text-ink-mute">{v.capacity}</span></div>
                    <div className="text-xs text-ink-mute">{v.building}</div>
                    <div className="mt-1.5">{busy ? <Badge tone="wine">Booked: {busy.title.slice(0, 22)}{busy.title.length > 22 ? '...' : ''}</Badge> : small ? <Badge tone="amber">Too small for {f.capacity}</Badge> : <Badge tone="ok">Available</Badge>}</div>
                  </button>
                );
              })}
            </div>
            <div className="label mt-6">Day view</div>
            <AvailabilityGrid date={f.date} selected={{ venueId: f.venueId, start: f.start, end: f.end }} />
          </div>
        )}
        {step === 2 && (<><p className="mb-4 text-sm text-ink-soft">Break down expected costs. This is sent with the proposal for approval.</p><BudgetEditor items={f.items} setItems={(items) => setF({ ...f, items })} /></>)}
        {step === 3 && (
          <div>
            <h3 className="font-display text-xl font-bold text-wine">{f.title}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5"><Badge tone="sky">{f.category}</Badge><Badge tone="gray">{f.club}</Badge></div>
            <p className="mt-3 text-sm text-ink-soft">{f.description}</p>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-4">
              <div><dt className="label">Date</dt><dd>{fmtDate(f.date)}</dd></div>
              <div><dt className="label">Time</dt><dd>{fmtTime(f.start)} to {fmtTime(f.end)}</dd></div>
              <div><dt className="label">Venue</dt><dd>{venue?.name}</dd></div>
              <div><dt className="label">Capacity / fee</dt><dd>{f.capacity} · {Number(f.fee) ? inr(f.fee) : 'Free'}</dd></div>
            </dl>
            <div className="mt-5 rounded-md border border-line">
              {f.items.map((i, k) => <div key={k} className="flex justify-between border-b border-line px-3 py-2 text-sm last:border-0"><span>{i.label}</span><span>{inr(i.amount)}</span></div>)}
              <div className="flex justify-between bg-sky-50 px-3 py-2 text-sm font-bold"><span>Total requested</span><span className="text-wine">{inr(sum(f.items))}</span></div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-line bg-sky-50 px-6 py-3">
        <Button variant="ghost" icon="back" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        {step < 3 ? <Button disabled={!valid} onClick={() => setStep(step + 1)}>Continue</Button> : <Button onClick={submit}>Submit proposal</Button>}
      </div>
    </Card>
  );
}

/* ---------- Roster ---------- */
function Roster({ id, setId }) {
  const s = useStore();
  const options = s.events.filter((e) => e.organizerId === ME && e.status === 'approved');
  const ev = options.find((e) => e.id === id) || options[0];
  const rows = useMemo(() => {
    if (!ev) return [];
    const students = s.users.filter((u) => u.role === 'student' && u.id !== 'u1');
    const seeded = students.slice(0, Math.min(ev.baseCount, students.length)).map((u) => ({ ...u, status: 'confirmed' }));
    const mine = s.registrations.filter((r) => r.eventId === ev.id).map((r) => ({ ...s.userById(r.userId), status: r.status }));
    return [...seeded, ...mine];
  }, [ev, s.registrations, s.users]); // eslint-disable-line
  if (!ev) return <Empty icon="users" title="No approved events yet" />;
  const total = s.confirmedCount(ev);
  const checked = rows.filter((r) => s.checkins[`${ev.id}:${r.id}`]).length;
  const exportCsv = () => {
    const csv = ['Name,Email,Department,Year,Status,Checked in', ...rows.map((r) => [r.name, r.email, r.dept, r.year, r.status, s.checkins[`${ev.id}:${r.id}`] ? 'Yes' : 'No'].join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${ev.id}-roster.csv`;
    a.click();
  };
  return (
    <div>
      <Card className="mb-4 flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-[240px] flex-1"><select className="field" value={ev.id} onChange={(e) => setId(e.target.value)} aria-label="Select event">{options.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
        <div className="flex gap-6 text-sm">
          <div><div className="label">Registered</div><b>{total}/{ev.capacity}</b></div>
          <div><div className="label">Waitlist</div><b>{ev.waitBase + rows.filter((r) => r.status === 'waitlist').length}</b></div>
          <div><div className="label">Checked in</div><b>{checked}</b></div>
        </div>
        <Button variant="outline" icon="download" onClick={exportCsv}>Export CSV</Button>
      </Card>
      <Card>
        <Table head={['Attendee', 'Department', 'Year', 'Status', 'Check-in']}>
          {rows.length === 0 ? <tr><td colSpan="5" className="px-4 py-8 text-center text-ink-soft">No registrations yet.</td></tr> : rows.map((r) => {
            const k = `${ev.id}:${r.id}`;
            return (
              <tr key={k}>
                <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar name={r.name} size={28} /><div><div className="font-semibold">{r.name}</div><div className="text-xs text-ink-mute">{r.email}</div></div></div></td>
                <td className="px-4 py-2.5 text-ink-soft">{r.dept}</td>
                <td className="px-4 py-2.5 text-ink-soft">{r.year}</td>
                <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-2.5">{r.status === 'confirmed' ? (
                  <button onClick={() => s.toggleCheckin(ev.id, r.id)} className={cx('rounded border px-2.5 py-1 text-xs font-semibold', s.checkins[k] ? 'border-ok bg-ok text-white' : 'border-line bg-white text-ink-soft hover:border-ok hover:text-ok')}>{s.checkins[k] ? 'Checked in' : 'Mark present'}</button>
                ) : <span className="text-xs text-ink-mute">n/a</span>}</td>
              </tr>
            );
          })}
        </Table>
        <div className="border-t border-line px-4 py-2.5 text-xs text-ink-mute">Showing a sample of {rows.length} of {total} registrations in this demo.</div>
      </Card>
    </div>
  );
}
