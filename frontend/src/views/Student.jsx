import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../store.jsx';
import { TODAY, CATEGORIES } from '../data/mock.js';
import { fmtDate, fmtTime, inr, dayNum, monthShort, cx } from '../lib/utils.js';
import { Badge, Button, Card, DateBlock, Empty, Icon, Modal, PageHeader, Progress, Stars, Tabs } from '../components/ui.jsx';

const CAT_BAR = { Tech: '#930031', Cultural: '#ff2a7f', Sports: '#ffa500', Business: '#27517f', Arts: '#b3254f', Career: '#d98900', Social: '#1f8a5b' };

export default function Student({ tab, setTab }) {
  const s = useStore();
  const waiting = s.registrations.filter((r) => r.status === 'waitlist').length;
  const tabs = [
    { id: 'discover', label: 'Discover Events' },
    { id: 'tickets', label: 'My Tickets', count: waiting },
  ];
  return (
    <div>
      <PageHeader
        title={tab === 'discover' ? 'Upcoming events' : 'My tickets'}
        sub={tab === 'discover' ? 'Register in one tap. We check your schedule for clashes and put you on a waitlist when an event is full.' : 'Show the QR code at the entrance. Past events can be rated once they are over.'}
      />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'discover' ? <Discover goTickets={() => setTab('tickets')} /> : <Tickets />}
    </div>
  );
}

/* ---------------- Discover ---------------- */
function Discover() {
  const s = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('date');
  const [freeOnly, setFreeOnly] = useState(false);
  const [open, setOpen] = useState(null);
  const [clash, setClash] = useState(null);

  const upcoming = s.events.filter((e) => e.status === 'approved' && e.date >= TODAY);
  const list = useMemo(() => {
    let l = upcoming.filter((e) => (cat === 'All' || e.category === cat) && (!freeOnly || e.fee === 0));
    if (q.trim()) {
      const t = q.toLowerCase();
      l = l.filter((e) => [e.title, e.club, e.category, s.venueById(e.venueId).name].join(' ').toLowerCase().includes(t));
    }
    return [...l].sort((a, b) => (sort === 'date' ? (a.date + a.start).localeCompare(b.date + b.start) : s.confirmedCount(b) / b.capacity - s.confirmedCount(a) / a.capacity));
  }, [upcoming, q, cat, sort, freeOnly, s.registrations]); // eslint-disable-line

  const announced = upcoming.filter((e) => e.announced).slice(0, 1);

  const attempt = (ev) => {
    const res = s.register(ev.id);
    if (res.type === 'conflict') setClash({ ev, with: res.event, regId: res.reg.id });
  };

  return (
    <>
      {announced.map((e) => (
        <div key={e.id} className="mb-5 flex items-center gap-3 rounded-lg bg-wine px-4 py-3 text-white">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber text-wine"><Icon name="megaphone" /></span>
          <div className="min-w-0 flex-1 text-sm">
            <span className="font-semibold text-amber">Student Affairs announcement. </span>
            <span className="text-white/90">{e.title} is on {fmtDate(e.date)} at {s.venueById(e.venueId).name}.</span>
          </div>
          <Button size="sm" variant="primary" onClick={() => setOpen(e)}>View</Button>
        </div>
      ))}

      <Card className="mb-5 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input className="field pl-9" placeholder="Search events, clubs or venues" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search events" />
          </div>
          <select className="field w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="date">Soonest first</option>
            <option value="popular">Filling fastest</option>
          </select>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="h-4 w-4 accent-[#ff2a7f]" /> Free only
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['All', ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cx('rounded-full border px-3 py-1 text-xs font-semibold transition-colors', cat === c ? 'border-wine bg-wine text-white' : 'border-line bg-white text-ink-soft hover:border-wine hover:text-wine')}>{c}</button>
          ))}
        </div>
      </Card>

      {list.length === 0 ? (
        <Empty icon="search" title="No events match">Try a different keyword or clear the category filter.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => <EventCard key={e.id} ev={e} onOpen={() => setOpen(e)} onRegister={() => attempt(e)} />)}
        </div>
      )}

      <EventDetail ev={open} onClose={() => setOpen(null)} onRegister={(e) => { attempt(e); setOpen(null); }} />
      <ClashModal clash={clash} onClose={() => setClash(null)} onSwap={() => { s.register(clash.ev.id, clash.regId); setClash(null); }} />
    </>
  );
}

function SeatLine({ ev }) {
  const s = useStore();
  const n = s.confirmedCount(ev);
  const full = n >= ev.capacity;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-ink-soft">{full ? 'Event full' : `${ev.capacity - n} seats left`}</span>
        <span className="font-semibold text-ink">{n}/{ev.capacity}</span>
      </div>
      <Progress value={n} max={ev.capacity} />
      {full && <div className="mt-1 text-[11px] text-ink-mute">{ev.waitBase + s.registrations.filter((r) => r.eventId === ev.id && r.status === 'waitlist').length} people on the waitlist</div>}
    </div>
  );
}

function ActionButton({ ev, onRegister, full: wide }) {
  const s = useStore();
  const reg = s.myReg(ev.id);
  const n = s.confirmedCount(ev);
  const isFull = n >= ev.capacity;
  const cls = wide ? 'w-full' : '';
  if (reg?.status === 'confirmed') return <Button variant="outline" className={cls} icon="check" disabled>Registered</Button>;
  if (reg?.status === 'waitlist') return <Button variant="outline" className={cls} icon="clock" disabled>Waitlist #{s.waitlistPosition(reg)}</Button>;
  return <Button variant={isFull ? 'dark' : 'primary'} className={cls} onClick={onRegister}>{isFull ? 'Join waitlist' : ev.fee ? `Register · ${inr(ev.fee)}` : 'Register'}</Button>;
}

function EventCard({ ev, onOpen, onRegister }) {
  const s = useStore();
  const venue = s.venueById(ev.venueId);
  const reg = s.myReg(ev.id);
  const clash = !reg ? s.findConflict(ev) : null;
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="h-1" style={{ background: CAT_BAR[ev.category] }} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex gap-3">
          <DateBlock month={monthShort(ev.date)} day={dayNum(ev.date)} />
          <div className="min-w-0 flex-1">
            <button onClick={onOpen} className="text-left font-display text-[17px] font-bold leading-snug text-ink hover:text-wine">{ev.title}</button>
            <div className="mt-0.5 text-xs text-ink-soft">{ev.club}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="sky">{ev.category}</Badge>
          {ev.fee === 0 ? <Badge tone="ok">Free</Badge> : <Badge tone="amber">{inr(ev.fee)}</Badge>}
          {ev.sponsors.length > 0 && <Badge tone="gray">Sponsored</Badge>}
          {clash && <Badge tone="wine" icon="alert">Clashes with your schedule</Badge>}
        </div>
        <div className="mt-3 space-y-1.5 text-[13px] text-ink-soft">
          <div className="flex items-center gap-2"><Icon name="clock" size={14} className="text-wine" />{fmtDate(ev.date)}, {fmtTime(ev.start)} to {fmtTime(ev.end)}</div>
          <div className="flex items-center gap-2"><Icon name="pin" size={14} className="text-wine" />{venue.name}</div>
        </div>
        <div className="mt-4 flex-1" />
        <SeatLine ev={ev} />
        <div className="mt-3 flex gap-2">
          <ActionButton ev={ev} onRegister={onRegister} full />
          <Button variant="ghost" onClick={onOpen} aria-label="Details"><Icon name="arrow" /></Button>
        </div>
      </div>
    </Card>
  );
}

function EventDetail({ ev, onClose, onRegister }) {
  const s = useStore();
  if (!ev) return null;
  const venue = s.venueById(ev.venueId);
  return (
    <Modal open onClose={onClose} title={ev.title} width="max-w-2xl" footer={<><Button variant="ghost" onClick={onClose}>Close</Button><ActionButton ev={ev} onRegister={() => onRegister(ev)} /></>}>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Badge tone="sky">{ev.category}</Badge>
        <Badge tone="gray">{ev.club}</Badge>
        {ev.announced && <Badge tone="pink" icon="megaphone">Announced</Badge>}
        {ev.sponsors.map((x) => <Badge key={x} tone="amber" icon="award">{x}</Badge>)}
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{ev.description}</p>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div><dt className="label">When</dt><dd>{fmtDate(ev.date)}<br />{fmtTime(ev.start)} to {fmtTime(ev.end)}</dd></div>
        <div><dt className="label">Where</dt><dd>{venue.name}<br /><span className="text-ink-mute">{venue.building}</span></dd></div>
        <div><dt className="label">Entry</dt><dd>{ev.fee ? inr(ev.fee) : 'Free'}</dd></div>
        <div><dt className="label">Seats</dt><dd><SeatLine ev={ev} /></dd></div>
      </dl>
    </Modal>
  );
}

function ClashModal({ clash, onClose, onSwap }) {
  if (!clash) return null;
  return (
    <Modal open onClose={onClose} title="Schedule clash detected" footer={<><Button variant="ghost" onClick={onClose}>Keep my current plan</Button><Button variant="dark" onClick={onSwap}>Swap registrations</Button></>}>
      <div className="flex gap-3 rounded-md border border-wine/30 bg-wine-soft p-3 text-sm">
        <Icon name="alert" className="mt-0.5 text-wine" />
        <p className="text-ink">
          <b>{clash.ev.title}</b> ({fmtTime(clash.ev.start)} to {fmtTime(clash.ev.end)}) overlaps with <b>{clash.with.title}</b> ({fmtTime(clash.with.start)} to {fmtTime(clash.with.end)}) on {fmtDate(clash.ev.date)}.
        </p>
      </div>
      <p className="mt-3 text-sm text-ink-soft">You can only hold one confirmed seat per time slot. Swapping cancels your registration for {clash.with.title} and registers you for {clash.ev.title}.</p>
    </Modal>
  );
}

/* ---------------- Tickets ---------------- */
function Tickets() {
  const s = useStore();
  const [fbFor, setFbFor] = useState(null);
  const mine = s.registrations.filter((r) => r.userId === 'u1').map((r) => ({ r, ev: s.eventById(r.eventId) }));
  const upcoming = mine.filter((x) => x.ev.date >= TODAY && x.r.status === 'confirmed').sort((a, b) => a.ev.date.localeCompare(b.ev.date));
  const waitlist = mine.filter((x) => x.r.status === 'waitlist');
  const past = mine.filter((x) => x.ev.date < TODAY);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-wine">Upcoming ({upcoming.length})</h2>
        {upcoming.length === 0 ? <Empty icon="ticket" title="No upcoming tickets">Register for an event from the Discover tab.</Empty> : (
          <div className="grid gap-4 lg:grid-cols-2">{upcoming.map(({ r, ev }) => <TicketCard key={r.id} r={r} ev={ev} />)}</div>
        )}
      </section>

      {waitlist.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-wine">Waitlist ({waitlist.length})</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {waitlist.map(({ r, ev }) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-base font-bold">{ev.title}</div>
                    <div className="mt-0.5 text-xs text-ink-soft">{fmtDate(ev.date)}, {fmtTime(ev.start)} · {s.venueById(ev.venueId).name}</div>
                  </div>
                  <div className="text-right"><div className="text-[10px] font-semibold uppercase text-ink-mute">Position</div><div className="font-display text-2xl font-bold text-pink">#{s.waitlistPosition(r)}</div></div>
                </div>
                <p className="mt-3 text-xs text-ink-soft">When a seat opens, the first person in the queue is confirmed automatically unless it clashes with another confirmed event.</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" icon="users" onClick={() => s.simulateRelease(ev.id)}>Demo: release a seat</Button>
                  <Button size="sm" variant="ghost" onClick={() => s.cancelRegistration(r.id)}>Leave waitlist</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-wine">Past events ({past.length})</h2>
        <Card>
          {past.length === 0 ? <div className="p-6 text-sm text-ink-soft">Nothing yet.</div> : past.map(({ r, ev }) => {
            const fb = s.feedback.find((f) => f.eventId === ev.id && f.userId === 'u1');
            return (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-0">
                <div className="flex items-center gap-3">
                  <DateBlock month={monthShort(ev.date)} day={dayNum(ev.date)} />
                  <div><div className="text-sm font-semibold">{ev.title}</div><div className="text-xs text-ink-soft">{ev.club} · attended</div></div>
                </div>
                {fb ? <div className="flex items-center gap-2 text-xs text-ink-soft"><Stars value={fb.rating} size={14} /> Feedback sent</div>
                  : <Button size="sm" variant="primary" icon="star" onClick={() => setFbFor(ev)}>Rate this event</Button>}
              </div>
            );
          })}
        </Card>
      </section>
      <FeedbackModal ev={fbFor} onClose={() => setFbFor(null)} />
    </div>
  );
}

function TicketCard({ r, ev }) {
  const s = useStore();
  const venue = s.venueById(ev.venueId);
  return (
    <Card className="flex overflow-hidden">
      <div className="w-1.5 shrink-0 bg-pink" />
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-center gap-2"><Badge tone="ok" icon="check">Confirmed</Badge><span className="font-mono text-[11px] text-ink-mute">{r.ticket}</span></div>
        <div className="mt-2 font-display text-[17px] font-bold leading-snug">{ev.title}</div>
        <div className="mt-2 space-y-1 text-[13px] text-ink-soft">
          <div className="flex items-center gap-2"><Icon name="calendar" size={14} className="text-wine" />{fmtDate(ev.date)}, {fmtTime(ev.start)}</div>
          <div className="flex items-center gap-2"><Icon name="pin" size={14} className="text-wine" />{venue.name}</div>
        </div>
        <div className="mt-auto pt-4"><Button size="sm" variant="ghost" onClick={() => s.cancelRegistration(r.id)}>Cancel registration</Button></div>
      </div>
      <div className="flex w-[148px] shrink-0 flex-col items-center justify-center gap-2 border-l border-dashed border-[#a9c6e3] bg-sky-50 p-3">
        <div className="rounded bg-white p-2"><QRCodeSVG value={JSON.stringify({ t: r.ticket, e: ev.id, u: 'u1' })} size={96} fgColor="#930031" /></div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-mute">Scan at entry</span>
      </div>
    </Card>
  );
}

function FeedbackModal({ ev, onClose }) {
  const s = useStore();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  if (!ev) return null;
  const TAGS = ['Well organised', 'Great speakers', 'Venue was good', 'Started late', 'Too crowded', 'Good value'];
  const submit = () => { s.submitFeedback({ eventId: ev.id, rating, tags, comment }); setRating(0); setTags([]); setComment(''); onClose(); };
  return (
    <Modal open onClose={onClose} title={`Rate: ${ev.title}`} footer={<><Button variant="ghost" onClick={onClose}>Not now</Button><Button disabled={!rating} onClick={submit}>Submit feedback</Button></>}>
      <div className="mb-1 label">Overall experience</div>
      <Stars value={rating} onChange={setRating} size={30} />
      <div className="mb-1 mt-5 label">What stood out?</div>
      <div className="flex flex-wrap gap-1.5">
        {TAGS.map((t) => (
          <button key={t} onClick={() => setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))} className={cx('rounded-full border px-3 py-1 text-xs font-semibold', tags.includes(t) ? 'border-pink bg-pink text-white' : 'border-line text-ink-soft hover:border-pink')}>{t}</button>
        ))}
      </div>
      <div className="mt-5"><label className="label" htmlFor="fb">Comments (optional)</label><textarea id="fb" rows={3} className="field" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What would you change for next time?" /></div>
    </Modal>
  );
}
