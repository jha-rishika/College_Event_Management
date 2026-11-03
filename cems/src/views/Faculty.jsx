import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { TODAY, COLLEGE } from '../data/mock.js';
import { fmtDate, fmtDateLong, fmtTime, inr, sum, cx } from '../lib/utils.js';
import { Badge, Button, Card, Empty, Icon, Modal, PageHeader, Stat, StatusBadge, Tabs } from '../components/ui.jsx';

export default function Faculty({ tab, setTab }) {
  const s = useStore();
  const queue = buildQueue(s.events);
  const tabs = [
    { id: 'queue', label: 'Review Queue', count: queue.length },
    { id: 'poster', label: 'Announcements' },
    { id: 'history', label: 'Decision History' },
  ];
  const titles = {
    queue: ['Review queue', 'Event proposals and budget revisions waiting for your decision.'],
    poster: ['Announcements', 'Generate a poster for an approved event and publish it to every student feed.'],
    history: ['Decision history', 'What you have approved or sent back, with your notes.'],
  };
  return (
    <div>
      <PageHeader title={titles[tab][0]} sub={titles[tab][1]} />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'queue' && <Queue queue={queue} goPoster={() => setTab('poster')} />}
      {tab === 'poster' && <Posters />}
      {tab === 'history' && <History />}
    </div>
  );
}

const buildQueue = (events) => [
  ...events.filter((e) => e.status === 'pending').map((e) => ({ kind: 'event', ev: e })),
  ...events.filter((e) => e.status === 'approved' && e.budget.status === 'submitted').map((e) => ({ kind: 'budget', ev: e })),
];

function Queue({ queue, goPoster }) {
  const s = useStore();
  const [dlg, setDlg] = useState(null); // { item, result }
  const [note, setNote] = useState('');
  const total = queue.reduce((n, q) => n + sum(q.ev.budget.items), 0);
  const close = () => { setDlg(null); setNote(''); };
  const confirm = () => { s.decide(dlg.item.ev.id, dlg.item.kind, dlg.result, note.trim()); close(); };

  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat icon="clock" tone="amber" label="Waiting" value={queue.length} sub="Items in your queue" />
        <Stat icon="wallet" label="Budget in review" value={inr(total)} sub="Across all pending items" />
        <Stat icon="check" tone="pink" label="Decided this week" value={s.decisions.length} sub="Approved or rejected" />
      </div>
      {queue.length === 0 ? (
        <Empty icon="check" title="You are all caught up">New proposals from organizers will appear here.</Empty>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => {
            const { ev, kind } = item;
            const org = s.userById(ev.organizerId);
            const total = sum(ev.budget.items);
            const clash = s.venueClash(ev.venueId, ev, ev.id);
            return (
              <Card key={ev.id + kind} className="overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-sky-50 px-5 py-3">
                  <div className="flex items-center gap-2"><Badge tone={kind === 'event' ? 'pink' : 'amber'}>{kind === 'event' ? 'New proposal' : 'Budget revision'}</Badge><span className="text-xs text-ink-mute">from {org?.name}, {ev.club}</span></div>
                  {total > 50000 && <Badge tone="wine" icon="alert">Above {inr(50000)}</Badge>}
                </div>
                <div className="grid gap-5 p-5 lg:grid-cols-[1fr_300px]">
                  <div>
                    <h3 className="font-display text-xl font-bold">{ev.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{ev.description}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <div><dt className="label">Date</dt><dd>{fmtDate(ev.date)}</dd></div>
                      <div><dt className="label">Time</dt><dd>{fmtTime(ev.start)} to {fmtTime(ev.end)}</dd></div>
                      <div><dt className="label">Venue</dt><dd>{s.venueById(ev.venueId).name}</dd></div>
                      <div><dt className="label">Capacity</dt><dd>{ev.capacity}{ev.fee ? ` · ${inr(ev.fee)} fee` : ' · free'}</dd></div>
                    </dl>
                    {clash && <div className="mt-3 flex items-center gap-2 text-xs text-wine"><Icon name="alert" size={14} />Overlaps with {clash.title} at the same venue.</div>}
                  </div>
                  <div className="rounded-md border border-line">
                    <div className="border-b border-line px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Budget</div>
                    {ev.budget.items.map((i, k) => <div key={k} className="flex justify-between px-3 py-1.5 text-[13px]"><span className="text-ink-soft">{i.label}</span><span>{inr(i.amount)}</span></div>)}
                    <div className="flex justify-between border-t border-line bg-sky-50 px-3 py-2 text-sm font-bold"><span>Total</span><span className="text-wine">{inr(total)}</span></div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
                  <Button variant="danger" icon="x" onClick={() => setDlg({ item, result: 'rejected' })}>Reject</Button>
                  <Button variant="ok" icon="check" onClick={() => setDlg({ item, result: 'approved' })}>Approve</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {dlg && (
        <Modal open onClose={close} title={`${dlg.result === 'approved' ? 'Approve' : 'Reject'}: ${dlg.item.ev.title}`}
          footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button variant={dlg.result === 'approved' ? 'ok' : 'dark'} disabled={dlg.result === 'rejected' && note.trim().length < 5} onClick={confirm}>{dlg.result === 'approved' ? 'Confirm approval' : 'Send rejection'}</Button></>}>
          <label className="label" htmlFor="note">{dlg.result === 'approved' ? 'Note for the organizer (optional)' : 'Reason (required)'}</label>
          <textarea id="note" rows={4} className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder={dlg.result === 'approved' ? 'Anything they should keep in mind' : 'Tell them what to change so they can resubmit'} />
          {dlg.result === 'approved' && dlg.item.kind === 'event' && <p className="mt-3 text-xs text-ink-soft">Approving makes the event visible to students. You can publish an announcement poster afterwards.</p>}
        </Modal>
      )}
    </>
  );
}

/* ---------- Poster ---------- */
export function Poster({ ev, tagline }) {
  const s = useStore();
  const venue = s.venueById(ev.venueId);
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[400px] overflow-hidden bg-wine text-white shadow-pop" role="img" aria-label={`Poster for ${ev.title}`}>
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber" />
      <div className="absolute -left-10 bottom-24 h-32 w-32 rotate-12 bg-pink" />
      <div className="absolute bottom-0 right-0 h-24 w-24 bg-sky" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
      <div className="relative flex h-full flex-col p-7">
        <div className="max-w-[60%]">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber">{COLLEGE}</div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-white/75">{ev.club} presents</div>
        </div>
        <div className="mt-auto">
          <div className="mb-3 inline-block bg-amber px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-wine">{ev.category}</div>
          <h3 className="font-display text-[34px] font-bold leading-[1.05]">{ev.title}</h3>
          <p className="mt-3 max-w-[280px] text-sm text-white/85">{tagline}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/30 pt-4 text-xs">
            <div><div className="text-[10px] uppercase tracking-widest text-amber">When</div><div className="mt-0.5 font-semibold">{fmtDateLong(ev.date).replace(/^\w+, /, '')}</div><div>{fmtTime(ev.start)} onwards</div></div>
            <div><div className="text-[10px] uppercase tracking-widest text-amber">Where</div><div className="mt-0.5 font-semibold">{venue.name}</div><div>{ev.fee ? `Entry ${inr(ev.fee)}` : 'Free entry'}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Posters() {
  const s = useStore();
  const list = s.events.filter((e) => e.status === 'approved' && e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const [id, setId] = useState(list[0]?.id);
  const [tags, setTags] = useState({});
  const ev = list.find((e) => e.id === id) || list[0];
  if (!ev) return <Empty icon="megaphone" title="Nothing to announce yet">Approve an event first.</Empty>;
  const tagline = tags[ev.id] ?? ev.description.split('. ')[0].replace(/\.$/, '') + '.';
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="p-2">
        {list.map((e) => (
          <button key={e.id} onClick={() => setId(e.id)} className={cx('mb-0.5 flex w-full items-center justify-between gap-2 rounded px-3 py-2.5 text-left', e.id === ev.id ? 'bg-wine-soft' : 'hover:bg-sky-50')}>
            <span className="text-sm font-semibold leading-snug">{e.title}<span className="block text-xs font-normal text-ink-mute">{fmtDate(e.date)}</span></span>
            {e.announced && <Badge tone="pink" icon="megaphone">Live</Badge>}
          </button>
        ))}
      </Card>
      <Card className="p-5">
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="order-2 md:order-1">
            <div className="mb-3 flex items-center gap-2"><h3 className="font-display text-lg font-bold">Poster preview</h3>{ev.announced && <StatusBadge status="active" />}</div>
            <Poster ev={ev} tagline={tagline} />
          </div>
          <div className="order-1 md:order-2">
            <label className="label" htmlFor="tag">Tagline</label>
            <textarea id="tag" rows={4} className="field" value={tagline} onChange={(e) => setTags({ ...tags, [ev.id]: e.target.value })} maxLength={110} />
            <div className="mt-1 text-right text-[11px] text-ink-mute">{tagline.length}/110</div>
            <div className="mt-4 space-y-2">
              {ev.announced
                ? <Button variant="outline" className="w-full" onClick={() => s.setAnnounced(ev.id, false)}>Withdraw announcement</Button>
                : <Button className="w-full" icon="megaphone" onClick={() => s.setAnnounced(ev.id, true)}>Publish announcement</Button>}
            </div>
            <p className="mt-3 text-xs text-ink-soft">Published announcements appear as a banner at the top of the student event feed.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function History() {
  const s = useStore();
  return (
    <Card>
      {s.decisions.map((d) => (
        <div key={d.id} className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 last:border-0">
          <div>
            <div className="flex items-center gap-2"><span className="font-semibold">{d.title}</span><Badge tone="gray">{d.kind === 'event' ? 'Proposal' : 'Budget'}</Badge></div>
            {d.note && <p className="mt-1 text-sm text-ink-soft">{d.note}</p>}
          </div>
          <div className="shrink-0 text-right"><StatusBadge status={d.result} /><div className="mt-1 text-xs text-ink-mute">{d.at}</div></div>
        </div>
      ))}
    </Card>
  );
}
