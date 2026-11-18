// Rechenfunktionen für No Change Brotha (ohne Oberfläche).

export const pad = (n) => String(n).padStart(2, '0');
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const DAY = 86400000;
export const eur = (n, d = 2) => (Math.round(n * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }) + ' €';
export const eur0 = (n) => Math.round(n).toLocaleString('de-DE') + ' €';
export const dkey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
export const mkey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; };
export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export function dayLabel(d, now = Date.now()) {
  const a = new Date(d); a.setHours(0, 0, 0, 0);
  const b = new Date(now); b.setHours(0, 0, 0, 0);
  const diff = Math.round((b - a) / DAY);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  if (diff < 7) return WD[a.getDay()];
  return `${a.getDate()}.${a.getMonth() + 1}.`;
}
export function parseAmount(s) {
  const t = String(s || '').trim().replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = parseFloat(t);
  return isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

// ---------- Kategorien ----------
export const CATS = {
  essen: { label: 'Essen unterwegs', color: '#C8242F', kind: 'frei' },
  einkauf: { label: 'Einkauf', color: '#E08A00', kind: 'frei' },
  kleidung: { label: 'Kleidung', color: '#2F6FD6', kind: 'frei' },
  freizeit: { label: 'Freizeit', color: '#1E7A46', kind: 'frei' },
  uni: { label: 'Uni', color: '#7A3FD1', kind: 'frei' },
  geschenke: { label: 'Geschenke', color: '#D1477A', kind: 'frei' },
  sonstiges: { label: 'Sonstiges', color: '#5C6370', kind: 'frei' },
  tanken: { label: 'Tanken', color: '#7B7E85', kind: 'pflicht' },
  parken: { label: 'Parken', color: '#B9BBBF', kind: 'pflicht' },
  fix: { label: 'Fixkosten', color: '#9A9DA3', kind: 'fix' },
  einnahme: { label: 'Einnahme', color: '#1E7A46', kind: 'ein' }
};
export const FREE_CATS = Object.keys(CATS).filter((k) => CATS[k].kind === 'frei');

// ---------- Fixkosten-Termine ----------
// rule: {type:'monthly', day} | {type:'biweekly', anchor:'YYYY-MM-DD'}
export function occurrences(fx, year, month) {
  const last = new Date(year, month + 1, 0).getDate();
  if (fx.rule.type === 'monthly') {
    const d = fx.rule.day === 'last' ? last : Math.min(+fx.rule.day || 1, last);
    return [new Date(year, month, d).getTime()];
  }
  const a = new Date(fx.rule.anchor + 'T12:00');
  const start = new Date(year, month, 1, 12).getTime();
  const end = new Date(year, month, last, 12).getTime();
  const out = [];
  let k = Math.ceil((start - a.getTime()) / (14 * DAY));
  for (let t = a.getTime() + k * 14 * DAY; t <= end + 1000; t += 14 * DAY) if (t >= start - 1000) out.push(t);
  return out;
}
export function fixedForMonth(fixed, year, month) {
  let sum = 0;
  const items = [];
  for (const f of fixed) {
    const occ = occurrences(f, year, month);
    sum += occ.length * f.amount;
    items.push({ ...f, occ, total: occ.length * f.amount });
  }
  return { sum, items };
}

// ---------- Pendeln lernen ----------
// Durchschnitt pro Tag aus den letzten 60 Tagen, sonst Schätzung
export function dailyRate(txs, cat, fallbackPerDay, now = Date.now()) {
  const from = now - 60 * DAY;
  const list = txs.filter((t) => t.cat === cat && !t.income && t.date >= from && t.date <= now);
  if (list.length < 3) return { rate: fallbackPerDay, learned: false, n: list.length };
  const first = Math.min(...list.map((t) => t.date));
  const days = Math.max(14, (now - first) / DAY);
  return { rate: list.reduce((s, t) => s + t.amount, 0) / days, learned: true, n: list.length };
}

// ---------- Monatsrechnung ----------
export function monthSummary(state, now = Date.now()) {
  const d = new Date(now);
  const y = d.getFullYear(), m = d.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const today = d.getDate();
  const daysLeft = dim - today + 1; // heute zählt mit
  const inMonth = (t) => { const x = new Date(t.date); return x.getFullYear() === y && x.getMonth() === m; };
  const txs = state.tx.filter(inMonth);
  const s = state.settings;
  const budget = +s.income.amount || 0;
  const fixed = fixedForMonth(state.fixed, y, m);
  const tank = dailyRate(state.tx, 'tanken', (+s.tankDefault || 75) / 7, now);
  const park = dailyRate(state.tx, 'parken', (+s.parkPerMonth || 65) / 30.4, now);
  const tankSoFar = sum(txs.filter((t) => t.cat === 'tanken'));
  const parkSoFar = sum(txs.filter((t) => t.cat === 'parken'));
  const tankProj = tankSoFar + tank.rate * (daysLeft - 1 + 0.5);
  const parkProj = parkSoFar + park.rate * (daysLeft - 1 + 0.5);
  const pflicht = fixed.sum + tankProj + parkProj;
  const freeTx = txs.filter((t) => CATS[t.cat] && CATS[t.cat].kind === 'frei' && !t.income);
  const freeSpent = sum(freeTx);
  const deposits = state.deposits.filter((x) => mkey(x.date) === mkey(now)).reduce((a, x) => a + x.amount, 0);
  const initialFree = budget - pflicht;
  let freeLeft = initialFree - freeSpent - deposits;
  // Kontostand-Modus: ab dem eingetragenen Stand rechnen (nur im selben Monat)
  let balance = null;
  if (s.balance && mkey(s.balance.at) === mkey(now)) {
    const at = s.balance.at;
    const dayStart = new Date(at); dayStart.setHours(0, 0, 0, 0);
    const after = state.tx.filter((t) => (t.created || t.date) > at && t.date >= dayStart.getTime());
    const spentAfter = sum(after.filter((t) => !t.income && t.cat !== 'fix'));
    const incomeAfter = sum(after.filter((t) => t.income));
    const fixRemain = fixed.items.reduce((a, f) => a + f.occ.filter((o) => o > at).length * f.amount, 0);
    const commuteRemain = (tank.rate + park.rate) * Math.max(0, daysLeft - 0.5);
    const depAfter = state.deposits.filter((x) => x.date > at).reduce((a, x) => a + x.amount, 0);
    freeLeft = s.balance.amount + incomeAfter - spentAfter - fixRemain - commuteRemain - depAfter;
    balance = { amount: s.balance.amount, at, fixRemain, commuteRemain, spentAfter };
  }
  const perDay = daysLeft > 0 ? freeLeft / daysLeft : freeLeft;
  // Ampel: verglichen mit dem Anteil, der zeitlich noch übrig sein sollte
  const ref = Math.max(30, initialFree);
  let amp = 'gruen';
  if (freeLeft <= Math.max(5, ref * 0.05)) amp = 'rot';
  else if (freeLeft / ref < (daysLeft / dim) * 0.85 || perDay < 3) amp = 'gelb';
  const impulse = txs.filter((t) => t.impulse && !t.income);
  return {
    y, m, dim, today, daysLeft, budget, fixed, tank, park, tankSoFar, parkSoFar, tankProj, parkProj, pflicht,
    freeSpent, freeTx, deposits, initialFree, freeLeft, perDay, amp, impulse, txs, balance
  };
}
export const sum = (list) => list.reduce((a, t) => a + (+t.amount || 0), 0);

// Pro Kategorie (frei) im Monat
export function byCategory(txs) {
  const out = {};
  for (const t of txs) { if (t.income || t.fixedId) continue; out[t.cat] = (out[t.cat] || 0) + t.amount; }
  return out;
}
// Freie Ausgaben pro Woche (Mo–So) im Monat
export function weekly(txs, y, m) {
  const weeks = [];
  const dim = new Date(y, m + 1, 0).getDate();
  let start = 1;
  while (start <= dim) {
    const wd = (new Date(y, m, start).getDay() + 6) % 7;
    const end = Math.min(dim, start + (6 - wd));
    const total = txs.filter((t) => { const d = new Date(t.date).getDate(); return d >= start && d <= end && CATS[t.cat] && CATS[t.cat].kind === 'frei' && !t.income; })
      .reduce((a, t) => a + t.amount, 0);
    weeks.push({ label: start === end ? `${start}.` : `${start}.–${end}.`, total });
    start = end + 1;
  }
  return weeks;
}
export function monthlyFree(txs, n = 6, now = Date.now()) {
  const out = [];
  const d = new Date(now);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const k = mkey(x);
    out.push({ label: MONTHS[x.getMonth()].slice(0, 3), key: k, total: txs.filter((t) => mkey(t.date) === k && CATS[t.cat] && CATS[t.cat].kind === 'frei' && !t.income).reduce((a, t) => a + t.amount, 0) });
  }
  return out;
}

// ---------- Umrechnen (schlechtes Gewissen) ----------
export function convert(amount, ctx) {
  const opts = [];
  const hours = amount / 0.8;
  if (hours >= 1) opts.push(`${amount.toLocaleString('de-DE', { maximumFractionDigits: 2 })} € = ${hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10} Stunden Parken in Luxemburg.`);
  if (ctx.goal && ctx.goal.target > 0) opts.push(`Das sind ${Math.max(1, Math.round((amount / ctx.goal.target) * 100))} % von „${ctx.goal.name}“.`);
  if (ctx.freeLeft > 0) opts.push(`Das waren ${Math.min(100, Math.round((amount / (ctx.freeLeft + amount)) * 100))} % von deinem freien Geld.`);
  if (amount >= 15) opts.push(`Dafür hättest du ${Math.round((amount / 75) * 100)} % einer Tankfüllung bekommen.`);
  return opts;
}

// ---------- Sparkasse CSV ----------
function splitCsv(line, sep) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (c === sep && !q) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}
function parseDate(s) {
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (m) { const y = m[3].length === 2 ? 2000 + +m[3] : +m[3]; return new Date(y, +m[2] - 1, +m[1], 12).getTime(); }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3], 12).getTime();
  return NaN;
}
export function parseBankCsv(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('Die Datei ist leer.');
  const hi = lines.findIndex((l) => /buchungstag/i.test(l) && /betrag/i.test(l));
  if (hi < 0) throw new Error('Das sieht nicht nach einem Sparkassen-Export aus (Spalten „Buchungstag“ und „Betrag“ fehlen).');
  const sep = lines[hi].split(';').length > lines[hi].split(',').length ? ';' : ',';
  const head = splitCsv(lines[hi], sep).map((h) => h.toLowerCase());
  const col = (...names) => head.findIndex((h) => names.some((n) => h.includes(n)));
  const cDate = col('buchungstag');
  const cAmt = head.findIndex((h) => h === 'betrag' || h.startsWith('betrag'));
  const cWho = col('beguenstigter', 'begünstigter', 'empfänger', 'zahlungspflichtiger', 'name');
  const cWhat = col('verwendungszweck');
  const cText = col('buchungstext');
  const out = [];
  for (const l of lines.slice(hi + 1)) {
    const c = splitCsv(l, sep);
    const date = parseDate(c[cDate] || '');
    const amt = parseAmount(c[cAmt]);
    if (!isFinite(date) || !isFinite(amt) || amt === 0) continue;
    out.push({ date, amount: amt, who: (c[cWho] || '').replace(/\s+/g, ' '), what: (c[cWhat] || '').replace(/\s+/g, ' '), text: c[cText] || '' });
  }
  return out;
}
const RULES = [
  [/aral|shell|esso|total|jet |agip|avia|q8|tankstelle|\bbp\b|omv|star tank|westfalen|gulf/i, 'tanken'],
  [/park|apcoa|indigo|interparking|p\+r|easypark|parkster|parkhaus|onepark/i, 'parken'],
  [/lieferando|uber ?eats|wolt|mcdonald|burger king|kfc|subway|starbucks|bäckerei|baeckerei|backhaus|cafe|café|döner|doener|pizza|restaurant|kebab|sushi|coffee/i, 'essen'],
  [/rewe|edeka|aldi|lidl|netto|kaufland|penny|globus|norma|dm[- ]|drogerie|rossmann|cactus|delhaize|auchan/i, 'einkauf'],
  [/zara|h&m|h\+m|primark|zalando|about you|shein|bershka|pull ?& ?bear|c&a|mango|uniqlo|deichmann|snipes/i, 'kleidung'],
  [/kino|cinema|netflix|spotify|steam|nintendo|playstation|eventim|ticket|thalia|amazon|disney/i, 'freizeit'],
  [/universit|uni\.lu|mensa|restopolis/i, 'uni']
];
export function categorize(row, fixed) {
  const hay = `${row.who} ${row.what} ${row.text}`;
  if (row.amount > 0) return { income: true, cat: 'einnahme' };
  const f = fixed.find((x) => x.match && new RegExp(x.match, 'i').test(hay));
  if (f) return { cat: 'fix', fixedId: f.id };
  for (const [re, cat] of RULES) if (re.test(hay)) return { cat };
  return { cat: 'sonstiges' };
}
export const txHash = (t) => `${dkey(t.date)}|${Math.round(t.amount * 100)}|${(t.note || '').slice(0, 24).toLowerCase()}`;
