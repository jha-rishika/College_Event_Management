import React, { useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { TODAY, tiers } from '../data/mock.js';
import { fmtDate, inr, cx } from '../lib/utils.js';
import { Badge, Button, Card, Empty, Icon, Modal, PageHeader, Progress, Stat, StatusBadge, Table, Tabs } from '../components/ui.jsx';

export default function Sponsor({ tab, setTab }) {
  const tabs = [
    { id: 'tiers', label: 'Sponsor an Event' },
    { id: 'media', label: 'Media Kit' },
    { id: 'roi', label: 'ROI Analytics' },
  ];
  const titles = {
    tiers: ['Sponsor an event', 'Pick a tier, pick an event. Benefits are delivered by the organizing club.'],
    media: ['Brand media kit', 'Upload logos and guidelines. The student affairs team checks them before they go on posters.'],
    roi: ['ROI analytics', 'What your sponsorship spend has delivered so far.'],
  };
  return (
    <div>
      <PageHeader title={titles[tab][0]} sub={titles[tab][1]} />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'tiers' && <Tiers />}
      {tab === 'media' && <Media />}
      {tab === 'roi' && <ROI />}
    </div>
  );
}

function Tiers() {
  const s = useStore();
  const [tier, setTier] = useState('gold');
  const [evId, setEvId] = useState('');
  const [confirm, setConfirm] = useState(false);
  const mine = new Set(s.sponsorships.map((x) => x.eventId));
  const options = s.events.filter((e) => e.status === 'approved' && e.date >= TODAY && !mine.has(e.id));
  const t = tiers.find((x) => x.id === tier);
  const ev = options.find((e) => e.id === evId);
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((x) => (
          <button key={x.id} onClick={() => setTier(x.id)} className={cx('flex flex-col rounded-lg border bg-white p-5 text-left shadow-card transition-all', tier === x.id ? 'border-pink ring-2 ring-pink/30' : 'border-line hover:border-wine/40')}>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-display text-xl font-bold" style={{ color: x.accent }}><Icon name="award" size={20} />{x.name}</span>{tier === x.id && <Badge tone="pink" icon="check">Selected</Badge>}</div>
            <div className="mt-2 font-display text-3xl font-bold text-ink">{inr(x.price)}</div>
            <div className="text-xs text-ink-mute">per event</div>
            <ul className="mt-4 space-y-2 text-[13px] text-ink-soft">{x.perks.map((p) => <li key={p} className="flex gap-2"><Icon name="check" size={14} className="mt-0.5 text-ok" />{p}</li>)}</ul>
          </button>
        ))}
      </div>
      <Card className="mt-5 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[260px] flex-1">
            <label className="label" htmlFor="ev">Event to sponsor</label>
            <select id="ev" className="field" value={evId} onChange={(e) => setEvId(e.target.value)}>
              <option value="">Choose an upcoming event</option>
              {options.map((e) => <option key={e.id} value={e.id}>{e.title} ({fmtDate(e.date)}, {s.confirmedCount(e)} registered)</option>)}
            </select>
          </div>
          <Button disabled={!ev} onClick={() => setConfirm(true)}>Review {t.name} sponsorship</Button>
        </div>
        {options.length === 0 && <p className="mt-3 text-sm text-ink-soft">You already sponsor every open event.</p>}
      </Card>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Confirm sponsorship" footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Back</Button><Button onClick={() => { s.sponsorEvent(ev.id, tier); setConfirm(false); setEvId(''); }}>Confirm and sign agreement</Button></>}>
        {ev && (
          <>
            <div className="rounded-md border border-line">
              <div className="flex justify-between border-b border-line px-4 py-3 text-sm"><span className="text-ink-soft">Event</span><b>{ev.title}</b></div>
              <div className="flex justify-between border-b border-line px-4 py-3 text-sm"><span className="text-ink-soft">Tier</span><b>{t.name}</b></div>
              <div className="flex justify-between bg-sky-50 px-4 py-3 text-sm"><span className="text-ink-soft">Amount due</span><b className="text-wine">{inr(t.price)}</b></div>
            </div>
            <p className="mt-3 text-xs text-ink-soft">Invoice is raised to Nexora Systems after confirmation. Benefits are listed in the agreement.</p>
          </>
        )}
      </Modal>
    </>
  );
}

function Media() {
  const s = useStore();
  const [over, setOver] = useState(false);
  const [kind, setKind] = useState('Logo');
  const input = useRef();
  const take = (files) => [...files].forEach((f) => s.addMedia(f, kind));
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div>
        <div
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
          onClick={() => input.current.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && input.current.click()}
          className={cx('flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors', over ? 'border-pink bg-pink-soft' : 'border-[#8fb6dc] bg-white/70 hover:bg-white')}
        >
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-wine-soft text-wine"><Icon name="upload" size={20} /></span>
          <div className="font-semibold">Drop files here or click to browse</div>
          <div className="mt-1 text-xs text-ink-soft">SVG, PNG, PDF or MP4 up to 25 MB. Nothing is sent anywhere in this demo.</div>
          <input ref={input} type="file" multiple className="hidden" onChange={(e) => { take(e.target.files); e.target.value = ''; }} />
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm"><span className="text-ink-soft">Tag next upload as</span>
          {['Logo', 'Banner', 'Guidelines', 'Video'].map((k) => <button key={k} onClick={() => setKind(k)} className={cx('rounded-full border px-3 py-1 text-xs font-semibold', kind === k ? 'border-wine bg-wine text-white' : 'border-line bg-white text-ink-soft')}>{k}</button>)}
        </div>
        <Card className="mt-5">
          <h3 className="border-b border-line px-5 py-3 text-sm font-bold text-wine">Your files ({s.media.length})</h3>
          {s.media.length === 0 && <div className="p-6 text-sm text-ink-soft">No files yet.</div>}
          {s.media.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
              <span className="flex h-9 w-9 items-center justify-center rounded bg-sky-100 text-wine"><Icon name={/\.(png|jpe?g|svg|gif)$/i.test(m.name) ? 'image' : 'file'} /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{m.name}</div>
                <div className="text-xs text-ink-mute">{m.kind} · {m.size}</div>
                {m.status === 'uploading' && <div className="mt-1.5"><Progress value={m.progress} /></div>}
              </div>
              <StatusBadge status={m.status} />
              <button onClick={() => s.removeMedia(m.id)} className="rounded p-1.5 text-ink-mute hover:bg-wine-soft hover:text-wine" aria-label={`Remove ${m.name}`}><Icon name="trash" /></button>
            </div>
          ))}
        </Card>
      </div>
      <Card className="h-fit p-5">
        <h3 className="text-sm font-bold text-wine">Where your brand appears</h3>
        <div className="mt-4 rounded-md bg-wine p-4 text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber">Poster footer preview</div>
          <div className="mt-3 flex items-center justify-between rounded bg-white px-3 py-2.5">
            <span className="font-display text-base font-bold text-wine">Nexora</span><span className="text-[10px] uppercase tracking-wider text-ink-soft">Gold sponsor</span>
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-[13px] text-ink-soft">
          <li className="flex gap-2"><Icon name="check" size={14} className="mt-0.5 text-ok" />Logo minimum width 120 px, transparent background</li>
          <li className="flex gap-2"><Icon name="check" size={14} className="mt-0.5 text-ok" />Provide one light and one dark variant</li>
          <li className="flex gap-2"><Icon name="check" size={14} className="mt-0.5 text-ok" />Reviews take up to two working days</li>
        </ul>
      </Card>
    </div>
  );
}

function ROI() {
  const s = useStore();
  const rows = s.sponsorships.map((x) => ({ ...x, ev: s.eventById(x.eventId), tierName: tiers.find((t) => t.id === x.tier).name }));
  if (!rows.length) return <Empty icon="trend" title="No sponsorships yet">Sponsor an event to start tracking results.</Empty>;
  const T = rows.reduce((a, r) => ({ spend: a.spend + r.amount, imp: a.imp + r.impressions, scans: a.scans + r.scans, leads: a.leads + r.leads }), { spend: 0, imp: 0, scans: 0, leads: 0 });
  const max = Math.max(...rows.map((r) => r.leads));
  const funnel = [['Impressions', T.imp], ['QR scans', T.scans], ['Qualified leads', T.leads]];
  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="wallet" label="Total spend" value={inr(T.spend)} sub={`${rows.length} sponsorships`} />
        <Stat icon="trend" tone="pink" label="Impressions" value={T.imp.toLocaleString('en-IN')} sub="Posters, passes, screens" />
        <Stat icon="qr" tone="amber" label="QR scans" value={T.scans.toLocaleString('en-IN')} sub={`${((T.scans / T.imp) * 100).toFixed(1)}% scan rate`} />
        <Stat icon="users" label="Cost per lead" value={inr(Math.round(T.spend / T.leads))} sub={`${T.leads} opted-in leads`} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-bold text-wine">Engagement funnel</h3>
          {funnel.map(([l, v], i) => (
            <div key={l} className="mb-3 last:mb-0">
              <div className="mb-1 flex justify-between text-xs"><span className="text-ink-soft">{l}</span><b>{v.toLocaleString('en-IN')}</b></div>
              <div className="h-6 rounded-sm bg-sky-100"><div className="h-full rounded-sm" style={{ width: `${Math.max(4, (v / T.imp) * 100)}%`, background: ['#930031', '#ff2a7f', '#ffa500'][i] }} /></div>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-bold text-wine">Leads by event</h3>
          {rows.map((r) => (
            <div key={r.id} className="mb-3 last:mb-0">
              <div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-ink-soft">{r.ev.title}</span><b>{r.leads}</b></div>
              <div className="h-4 rounded-sm bg-sky-100"><div className="h-full rounded-sm bg-wine" style={{ width: `${(r.leads / max) * 100}%` }} /></div>
            </div>
          ))}
        </Card>
      </div>
      <Card className="mt-5">
        <Table head={['Event', 'Tier', 'Spend', 'Impressions', 'Scans', 'Leads', 'Cost / lead', 'Status']}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-semibold">{r.ev.title}<div className="text-xs font-normal text-ink-mute">{fmtDate(r.ev.date)}</div></td>
              <td className="px-4 py-3">{r.tierName}</td>
              <td className="px-4 py-3">{inr(r.amount)}</td>
              <td className="px-4 py-3">{r.impressions.toLocaleString('en-IN')}</td>
              <td className="px-4 py-3">{r.scans}</td>
              <td className="px-4 py-3">{r.leads}</td>
              <td className="px-4 py-3">{inr(Math.round(r.amount / r.leads))}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </Table>
        <div className="border-t border-line px-4 py-2.5 text-xs text-ink-mute">Figures for new sponsorships are projections until the event runs.</div>
      </Card>
    </>
  );
}
