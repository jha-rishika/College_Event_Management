import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as seed from './data/mock.js';
import { overlaps, code, sum } from './lib/utils.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [role, setRole] = useState('student');
  const [events, setEvents] = useState(seed.events);
  const [registrations, setRegistrations] = useState(seed.registrations);
  const [feedback, setFeedback] = useState(seed.feedback);
  const [venueRequests, setVenueRequests] = useState(seed.venueRequests);
  const [users, setUsers] = useState(seed.users);
  const [sponsorships, setSponsorships] = useState(seed.sponsorships);
  const [media, setMedia] = useState([
    { id: 'm1', name: 'nexora-logo-primary.svg', kind: 'Logo', size: '84 KB', status: 'approved', progress: 100 },
    { id: 'm2', name: 'nexora-brand-guidelines.pdf', kind: 'Guidelines', size: '2.1 MB', status: 'approved', progress: 100 },
  ]);
  const [checkins, setCheckins] = useState({ 'e1:u6': true, 'e1:u11': true, 'e1:u13': true });
  const [decisions, setDecisions] = useState([
    { id: 'd1', title: 'Photography Walk & Editing Masterclass', kind: 'event', result: 'approved', note: 'Good plan. Please keep the library quiet.', at: 'Yesterday' },
    { id: 'd2', title: 'Midnight Gaming League', kind: 'event', result: 'rejected', note: 'Late-night venue use is not permitted this term.', at: '2 days ago' },
  ]);
  const [toasts, setToasts] = useState([]);

  const STUDENT = seed.ROLES.student.userId;
  const eventById = useCallback((id) => events.find((e) => e.id === id), [events]);
  const venueById = useCallback((id) => seed.venues.find((v) => v.id === id), []);
  const userById = useCallback((id) => users.find((u) => u.id === id), [users]);

  const toast = useCallback((msg, tone = 'ok') => {
    const id = code(6);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  // ---------- derived helpers ----------
  const confirmedCount = useCallback(
    (ev) => ev.baseCount + registrations.filter((r) => r.eventId === ev.id && r.status === 'confirmed').length,
    [registrations]
  );
  const myReg = useCallback(
    (eventId) => registrations.find((r) => r.eventId === eventId && r.userId === STUDENT),
    [registrations, STUDENT]
  );
  const waitlistPosition = useCallback(
    (reg) => {
      const ev = events.find((e) => e.id === reg.eventId);
      const mine = registrations
        .filter((r) => r.eventId === reg.eventId && r.status === 'waitlist')
        .sort((a, b) => a.at - b.at);
      return ev.waitBase + mine.findIndex((r) => r.id === reg.id) + 1;
    },
    [events, registrations]
  );
  // Returns the confirmed registration whose event clashes with `ev`, if any
  const findConflict = useCallback(
    (ev, ignoreRegId) => {
      const hit = registrations.find((r) => {
        if (r.userId !== STUDENT || r.status !== 'confirmed' || r.id === ignoreRegId || r.eventId === ev.id) return false;
        const other = events.find((e) => e.id === r.eventId);
        return other && overlaps(other, ev);
      });
      return hit ? { reg: hit, event: events.find((e) => e.id === hit.eventId) } : null;
    },
    [registrations, events, STUDENT]
  );
  // First clashing event (for organizers choosing a venue/time)
  const venueClash = useCallback(
    (venueId, slot, ignoreEventId) =>
      events.find(
        (e) =>
          e.id !== ignoreEventId && e.venueId === venueId && e.status !== 'rejected' && overlaps(e, slot)
      ),
    [events]
  );

  // ---------- student ----------
  const register = (eventId, swapOutRegId) => {
    const ev = events.find((e) => e.id === eventId);
    if (registrations.some((r) => r.eventId === eventId && r.userId === STUDENT)) return { type: 'duplicate' };
    const conflict = findConflict(ev, swapOutRegId);
    if (conflict) return { type: 'conflict', ...conflict };
    let regs = registrations;
    if (swapOutRegId) regs = regs.filter((r) => r.id !== swapOutRegId);
    const taken = ev.baseCount + regs.filter((r) => r.eventId === eventId && r.status === 'confirmed').length;
    const status = taken < ev.capacity ? 'confirmed' : 'waitlist';
    const reg = { id: 'r' + code(5), eventId, userId: STUDENT, status, ticket: `CEMS-${eventId.toUpperCase()}-${code(4)}`, at: Date.now() };
    setRegistrations([...regs, reg]);
    toast(status === 'confirmed' ? `You're in. Ticket issued for ${ev.title}.` : `Event is full. You've joined the waitlist for ${ev.title}.`, status === 'confirmed' ? 'ok' : 'warn');
    return { type: status };
  };

  const cancelRegistration = (regId) => {
    const reg = registrations.find((r) => r.id === regId);
    const ev = events.find((e) => e.id === reg.eventId);
    let regs = registrations.filter((r) => r.id !== regId);
    if (reg.status === 'confirmed') {
      const next = regs.filter((r) => r.eventId === ev.id && r.status === 'waitlist').sort((a, b) => a.at - b.at)[0];
      if (ev.waitBase > 0) {
        // someone ahead of the student's own waitlist entry takes the freed seat
        setEvents((evs) => evs.map((e) => (e.id === ev.id ? { ...e, waitBase: e.waitBase - 1 } : e)));
      } else if (next) {
        regs = regs.map((r) => (r.id === next.id ? { ...r, status: 'confirmed' } : r));
      }
    }
    setRegistrations(regs);
    toast(`Registration cancelled for ${ev.title}.`, 'info');
  };

  // Demo helper: simulate another attendee dropping out so the waitlist advances
  const simulateRelease = (eventId) => {
    const ev = events.find((e) => e.id === eventId);
    if (ev.waitBase > 0) {
      setEvents((evs) => evs.map((e) => (e.id === eventId ? { ...e, waitBase: e.waitBase - 1 } : e)));
      toast('A seat was released and offered to the next person in the queue.', 'info');
      return;
    }
    const next = registrations.filter((r) => r.eventId === eventId && r.status === 'waitlist').sort((a, b) => a.at - b.at)[0];
    if (!next) return;
    const clash = findConflict(ev);
    if (clash) {
      toast(`Seat offered but skipped: it clashes with ${clash.event.title}.`, 'warn');
      return;
    }
    setRegistrations(registrations.map((r) => (r.id === next.id ? { ...r, status: 'confirmed' } : r)));
    toast(`You moved off the waitlist. ${ev.title} is confirmed.`);
  };

  const submitFeedback = (fb) => {
    setFeedback((f) => [...f, { ...fb, userId: STUDENT }]);
    setEvents((evs) =>
      evs.map((e) => {
        if (e.id !== fb.eventId || !e.rating) return e;
        const count = e.rating.count + 1;
        return { ...e, rating: { count, avg: (e.rating.avg * e.rating.count + fb.rating) / count } };
      })
    );
    toast('Thanks. Your feedback was sent to the organizers.');
  };

  // ---------- organizer ----------
  const createEvent = (data) => {
    const id = 'e' + code(4);
    const ev = {
      id, baseCount: 0, waitBase: 0, announced: false, sponsors: [], status: 'pending', organizerId: seed.ROLES.organizer.userId,
      ...data,
      budget: { items: data.budgetItems, status: 'submitted', note: '' },
    };
    delete ev.budgetItems;
    setEvents((e) => [...e, ev]);
    setVenueRequests((v) => [...v, { id: 'vr-' + id, eventId: id, venueId: ev.venueId, status: 'pending', requestedBy: ev.organizerId }]);
    toast('Proposal submitted to the faculty coordinator.');
    return id;
  };

  const submitBudget = (eventId, items) => {
    setEvents((evs) => evs.map((e) => (e.id === eventId ? { ...e, budget: { items, status: 'submitted', note: '' } } : e)));
    toast('Budget proposal sent for review.');
  };

  const toggleCheckin = (eventId, userId) =>
    setCheckins((c) => ({ ...c, [`${eventId}:${userId}`]: !c[`${eventId}:${userId}`] }));

  // ---------- faculty ----------
  const decide = (eventId, kind, result, note) => {
    const ev = events.find((e) => e.id === eventId);
    setEvents((evs) =>
      evs.map((e) => {
        if (e.id !== eventId) return e;
        if (kind === 'event') return { ...e, status: result, budget: { ...e.budget, status: result, note }, reviewNote: note };
        return { ...e, budget: { ...e.budget, status: result, note } };
      })
    );
    setDecisions((d) => [{ id: code(5), title: ev.title, kind, result, note, at: 'Just now' }, ...d]);
    toast(`${kind === 'event' ? 'Proposal' : 'Budget'} ${result}: ${ev.title}`, result === 'approved' ? 'ok' : 'warn');
  };
  const setAnnounced = (eventId, value) => {
    setEvents((evs) => evs.map((e) => (e.id === eventId ? { ...e, announced: value } : e)));
    toast(value ? 'Announcement published to all student feeds.' : 'Announcement withdrawn.', value ? 'ok' : 'info');
  };

  // ---------- admin ----------
  const setUserRole = (id, newRole) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    toast('Role updated.');
  };
  const toggleUser = (id) => setUsers((us) => us.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  const decideVenue = (id, result) => {
    const req = venueRequests.find((v) => v.id === id);
    setVenueRequests((vs) => vs.map((v) => (v.id === id ? { ...v, status: result } : v)));
    if (result === 'rejected') {
      setEvents((evs) => evs.map((e) => (e.id === req.eventId ? { ...e, status: 'rejected', reviewNote: 'Venue booking was declined by the administrator.' } : e)));
    }
    toast(`Venue booking ${result}.`, result === 'approved' ? 'ok' : 'warn');
  };

  // ---------- sponsor ----------
  const sponsorEvent = (eventId, tierId) => {
    const tier = seed.tiers.find((t) => t.id === tierId);
    const ev = events.find((e) => e.id === eventId);
    const reach = Math.max(ev.capacity, 50);
    setSponsorships((s) => [
      ...s,
      {
        id: 's' + code(4), eventId, tier: tierId, amount: tier.price, status: 'active',
        impressions: Math.round(reach * 24 * tier.reach), scans: Math.round(reach * 0.8 * tier.reach), leads: Math.round(reach * 0.18 * tier.reach),
      },
    ]);
    setEvents((evs) => evs.map((e) => (e.id === eventId ? { ...e, sponsors: [...new Set([...e.sponsors, 'Nexora Systems'])] } : e)));
    toast(`${tier.name} sponsorship confirmed for ${ev.title}.`);
  };
  const addMedia = (file, kind) => {
    const id = code(6);
    const size = file.size > 1048576 ? (file.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(file.size / 1024)) + ' KB';
    setMedia((m) => [{ id, name: file.name, kind, size, status: 'uploading', progress: 0 }, ...m]);
    let p = 0;
    const timer = setInterval(() => {
      p = Math.min(100, p + 12 + Math.random() * 18);
      setMedia((m) => m.map((x) => (x.id === id ? { ...x, progress: Math.round(p), status: p >= 100 ? 'in review' : 'uploading' } : x)));
      if (p >= 100) clearInterval(timer);
    }, 260);
  };
  const removeMedia = (id) => setMedia((m) => m.filter((x) => x.id !== id));

  const value = useMemo(
    () => ({
      role, setRole, events, registrations, feedback, venueRequests, users, sponsorships, media, checkins, decisions, toasts,
      venues: seed.venues, eventById, venueById, userById, toast,
      confirmedCount, myReg, waitlistPosition, findConflict, venueClash,
      register, cancelRegistration, simulateRelease, submitFeedback,
      createEvent, submitBudget, toggleCheckin,
      decide, setAnnounced, setUserRole, toggleUser, decideVenue,
      sponsorEvent, addMedia, removeMedia,
      budgetTotal: (ev) => sum(ev.budget.items),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role, events, registrations, feedback, venueRequests, users, sponsorships, media, checkins, decisions, toasts]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
