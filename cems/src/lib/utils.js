export const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const overlaps = (a, b) =>
  a.date === b.date && toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);

export const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtDateLong = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const dayNum = (d) => new Date(d + 'T00:00:00').getDate();
export const monthShort = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
export const fmtTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const code = (n = 4) => Math.random().toString(36).slice(2, 2 + n).toUpperCase();
export const sum = (items) => items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
export const initials = (name) =>
  name.split(' ').filter((w) => !/^(dr\.?|prof\.?)$/i.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
export const cx = (...a) => a.filter(Boolean).join(' ');
