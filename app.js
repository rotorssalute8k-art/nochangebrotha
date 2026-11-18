// No Change Brotha – Oberfläche. Alle Daten bleiben auf dem Handy.
import {
  uid, DAY, eur, eur0, dkey, mkey, MONTHS, dayLabel, parseAmount, CATS, FREE_CATS, monthSummary, byCategory, weekly,
  monthlyFree, convert, parseBankCsv, categorize, fixedForMonth
} from './logic.js';
import { PERS, ORDER, avatar, ampelLine, conscience, reaction, zukunft, nudgeNoEntry } from './personas.js';

const KEY = 'vi-ncb-v1';
const today = () => dkey(Date.now());
const DEFAULT = () => ({
  settings: {
    onboarded: false, tone: 'frech', active: [...ORDER], images: {},
    income: { name: 'ZF', amount: 700 }, monthlyGoal: 100, tankDefault: 75, parkPerMonth: 65,
    parkChips: [1.6, 3.6, 6, 11.6], lastMonth: null, lastAmp: null, startedAt: Date.now(), nudgedOn: null
  },
  fixed: [
    { id: uid(), name: 'Krankenkasse', amount: 158, rule: { type: 'monthly', day: 15 }, match: 'krankenkasse|\\baok\\b|techniker|barmer|\\bdak\\b|\\bikk\\b|\\bbkk\\b' },
    { id: uid(), name: 'Fitness First', amount: 19.9, rule: { type: 'biweekly', anchor: today() }, match: 'fitness ?first' },
    { id: uid(), name: 'Claude Pro', amount: 21.42, rule: { type: 'monthly', day: new Date().getDate() }, match: 'anthropic|claude' },
    { id: uid(), name: 'Crunchyroll', amount: 9.99, rule: { type: 'monthly', day: new Date().getDate() }, match: 'crunchyroll' },
    { id: uid(), name: 'iCloud', amount: 9.99, rule: { type: 'monthly', day: new Date().getDate() }, match: 'apple|icloud' }
  ],
  tx: [], deposits: [],
  goals: [
    { id: uid(), name: 'Paris für einen Tag', target: 120, saved: 0, status: 'aktiv' },
    { id: uid(), name: 'Switch 2 – Zelda-Edition', target: 0, saved: 0, status: 'wartet' }
  ],
  chat: [], moods: { gewissen: 'neutral', brotha: 'neutral', kim: 'neutral', gelangweilt: 'neutral', zukunft: 'good' },
  pending: null // letzte Reaktion, die auf „Monat“ angezeigt wird
});

let state = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s) { const d = DEFAULT(); return { ...d, ...s, settings: { ...d.settings, ...s.settings } }; }
  } catch (e) { /* neu */ }
  return DEFAULT();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { toast('Speicher voll – entferne ein eigenes Figurenbild.'); }
}

// ---------- Helfer ----------
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = () => state.settings;
const active = () => S().active.filter((w) => PERS[w]);
const av = (who, size = 40) => avatar(who, state.moods[who] || 'neutral', size, S().images[who]);
const activeGoal = () => state.goals.find((g) => g.status === 'aktiv' && g.target > 0) || state.goals.find((g) => g.status === 'aktiv');
const n2 = (n) => (Math.round(n * 100) / 100).toLocaleString('de-DE', { maximumFractionDigits: 2 });

const ICON = {
  monat: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M7 15h3"/>',
  grafik: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  ziele: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M7 7h4"/>',
  park: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 17V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'
};
const svg = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
const TRE = (() => {
  const sec = (a0, a1, r0, r1) => {
    const p = (r, a) => [20 + r * Math.cos(a * Math.PI / 180), 20 + r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(r1, a0), [x1, y1] = p(r1, a1), [x2, y2] = p(r0, a1), [x3, y3] = p(r0, a0);
    return `M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`;
  };
  return `<svg aria-hidden="true" width="34" height="34" viewBox="0 0 40 40" style="flex:none"><circle cx="20" cy="20" r="19" fill="#FFD400"/><path d="${[-90, 30, 150].map((a) => sec(a - 30, a + 30, 6, 17)).join('')}" fill="#111"/><circle cx="20" cy="20" r="3.6" fill="#111"/></svg>`;
})();

function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('show'), 2600);
}
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function post(who, text) { state.chat.push({ id: uid(), who, text, at: Date.now() }); state.chat = state.chat.slice(-150); }
function me(text) { state.chat.push({ id: uid(), who: 'me', text, at: Date.now() }); }

// ---------- Monatswechsel & Erinnerungen ----------
function housekeeping() {
  const now = Date.now();
  const mk = mkey(now);
  if (S().onboarded && S().lastMonth && S().lastMonth !== mk) {
    if (S().lastAmp === 'rot' && active().includes('zukunft')) {
      const t = zukunft('restart', {});
      post('zukunft', t); state.pending = [{ who: 'zukunft', text: t }];
    }
  }
  S().lastMonth = mk;
  const last = state.tx.length ? Math.max(...state.tx.map((t) => t.created || t.date)) : S().startedAt;
  if (S().onboarded && now - last > 2 * DAY && S().nudgedOn !== today() && active().includes('gewissen')) {
    S().nudgedOn = today();
    const t = nudgeNoEntry(S().tone); post('gewissen', t); state.pending = [{ who: 'gewissen', text: t }];
  }
  save();
}

// ---------- Router ----------
const routes = { monat: vMonat, neu: vNeu, chat: vChat, grafik: vGrafik, ziele: vZiele, pflicht: vPflicht, willkommen: vWillkommen };
const TABS = [['monat', 'Monat', 'monat'], ['grafik', 'Grafik', 'grafik'], ['chat', 'Chat', 'chat'], ['ziele', 'Ziele', 'ziele']];
let routeArg = null;
function route() {
  const [name0, arg] = (location.hash.replace(/^#\/?/, '') || 'monat').split('/');
  let name = name0;
  if (!S().onboarded && name !== 'willkommen') { location.hash = '#/willkommen'; return; }
  if (!routes[name]) name = 'monat';
  routeArg = arg ? decodeURIComponent(arg) : null;
  $('#view').innerHTML = routes[name](routeArg);
  const tab = { neu: 'monat', pflicht: 'monat' }[name] || name;
  $('#tabbar').hidden = name === 'willkommen' || name === 'neu';
  $('#tabbar').innerHTML = TABS.map(([r, l, i]) => `<a href="#/${r}" ${r === tab ? 'aria-current="page"' : ''}>${svg(i)}<span>${l}</span></a>`).join('');
  const f = document.querySelector('[autofocus]'); if (f) setTimeout(() => f.focus(), 50);
}
const rerender = () => { const y = scrollY; route(); scrollTo(0, y); };
const back = (href, l) => `<a class="back" href="${href}">${svg('back', 18)}${l}</a>`;
const bubble = (who, text, extra = '') => `<div class="bubble">${av(who, 40)}<p><b style="color:${PERS[who].ink}">${esc(PERS[who].name)}</b>${esc(text)}${extra}</p></div>`;

// ---------- MONAT ----------
function vMonat() {
  const now = Date.now();
  const m = monthSummary(state, now);
  const g = activeGoal();
  S().lastAmp = m.amp; save();
  const seed = Math.floor(now / DAY) + m.today;
  const ctx = { free: eur0(Math.max(0, m.freeLeft)), days: m.daysLeft, perDay: eur(Math.max(0, m.perDay)), goal: g ? g.name : 'dein Ziel', seed };
  const line = ampelLine(m.amp, ctx, active(), S().tone);
  const share = m.initialFree > 0 ? Math.max(0, Math.min(1, (m.freeSpent + m.deposits) / m.initialFree)) : 1;
  const pflShare = m.budget > 0 ? Math.min(1, m.pflicht / m.budget) : 1;
  const recent = [...state.tx].sort((a, b) => b.date - a.date || (b.created || 0) - (a.created || 0)).slice(0, 6);
  const pend = state.pending;
  return `<div class="page">
    <header class="top"><div><span class="brand">NO CHANGE <b>BROTHA</b></span><h1>${MONTHS[m.m]}</h1></div>
      <div class="top-r"><span class="muted">noch ${m.daysLeft} Tag${m.daysLeft === 1 ? '' : 'e'}</span><a class="iconbtn" href="#/pflicht" aria-label="Pflicht & Einstellungen">${svg('gear', 20)}</a></div></header>
    ${pend ? `<section class="pending">${pend.map((r) => bubble(r.who, r.text)).join('')}<button class="close" data-act="dismiss" aria-label="Schließen">${svg('x', 18)}</button></section>` : ''}
    <section class="hero ${m.amp}">
      ${m.amp === 'rot' ? `<div class="stripe top"></div><div class="alarm">${TRE}<div><b class="blink">ALARMSTUFE ROT</b><span>Freies Geld aufgebraucht · Ausgabenstopp</span></div></div>` : ''}
      <span class="eyebrow">Noch frei bis ${m.dim}.${m.m + 1}.</span>
      <strong class="big">${m.freeLeft < 0 ? '− ' : ''}${eur0(Math.abs(m.freeLeft))}</strong>
      <span class="sub">${m.freeLeft > 0 ? `≈ ${eur(m.perDay)} pro Tag` : m.amp === 'rot' ? 'Nur noch Pflicht: Tanken, Parken.' : ''}</span>
      <div class="bar"><i class="pfl" style="width:${pflShare * 100}%"></i><i style="width:${(1 - pflShare) * share * 100}%"></i></div>
      <div class="legend"><span>Pflicht ${eur0(m.pflicht)}</span><span>Frei ausgegeben ${eur0(m.freeSpent)}</span></div>
      ${m.amp === 'rot' ? '<div class="stripe bottom"></div>' : ''}
    </section>
    ${bubble(line.who, line.text)}
    <div class="quick">
      <a class="qb dark" href="#/neu/tanken">${svg('fuel')}Getankt</a>
      <a class="qb" href="#/neu/parken">${svg('park')}Parken Lux</a>
      <a class="qb red" href="#/neu">${svg('plus')}Ausgabe</a>
    </div>
    ${g ? `<a class="goalrow" href="#/ziele"><span class="gi">${svg('ziele')}</span><div><div class="sp"><b>${esc(g.name)}</b><span class="muted">${g.target ? `${eur0(g.saved)} / ${eur0(g.target)}` : eur0(g.saved)}</span></div>
      <div class="pbar"><i style="width:${g.target ? Math.min(100, g.saved / g.target * 100) : 0}%"></i></div></div></a>` : ''}
    <h2 class="sec">Zuletzt</h2>
    <div class="list">${recent.map(txRow).join('') || '<p class="empty">Noch nichts eingetragen. Tipp unten auf „Ausgabe“.</p>'}</div>
    ${state.tx.length > 6 ? '<a class="more" href="#/grafik">Alle im Überblick</a>' : ''}
  </div>`;
}
function txRow(t) {
  const c = CATS[t.cat] || CATS.sonstiges;
  const kind = t.income ? 'Einnahme' : c.kind === 'frei' ? (t.impulse ? 'Spontankauf' : c.label) : c.kind === 'fix' ? 'Fixkosten' : 'Pflicht';
  return `<a class="tx" href="#/neu/edit:${t.id}"><span class="tag" style="background:${c.color}1F;color:${c.color}">${esc(c.label.slice(0, 3).toUpperCase())}</span>
    <div><b>${esc(t.note || c.label)}</b><span>${dayLabel(t.date)} · ${kind}</span></div>
    <b class="amt ${t.income ? 'in' : ''}">${t.income ? '+ ' : '− '}${eur(t.amount)}</b></a>`;
}

// ---------- EINTRAGEN ----------
let draft = null;
function vNeu(arg) {
  const edit = arg && arg.startsWith('edit:') ? state.tx.find((t) => t.id === arg.slice(5)) : null;
  if (!draft || draft.key !== arg) {
    const cat = edit ? edit.cat : arg === 'tanken' || arg === 'parken' ? arg : 'essen';
    draft = { key: arg, id: edit ? edit.id : null, cat, impulse: edit ? !!edit.impulse : false,
      amount: edit ? String(edit.amount).replace('.', ',') : cat === 'tanken' ? String(S().tankDefault) : '', note: edit ? edit.note || '' : '', date: edit ? dkey(edit.date) : today() };
  }
  const d = draft;
  const cats = [...FREE_CATS, 'tanken', 'parken'];
  return `<div class="page entry">
    <div class="entry-top"><a class="back" href="#/monat">Abbrechen</a><b>${edit ? 'Eintrag bearbeiten' : 'Neue Ausgabe'}</b><span style="width:70px"></span></div>
    <form data-form="tx" class="form">
      <label class="amount"><span class="sr-only">Betrag in Euro</span><input name="amount" inputmode="decimal" placeholder="0,00" value="${esc(d.amount)}" ${edit ? '' : 'autofocus'} data-chg="draft" data-f="amount" autocomplete="off"><span>€</span></label>
      ${d.cat === 'parken' ? `<div class="chips center">${S().parkChips.map((v) => `<button type="button" class="chip" data-act="chipAmt" data-v="${v}">${n2(v)} €</button>`).join('')}</div>` : ''}
      <div class="chips">${cats.map((k) => `<button type="button" class="chip ${d.cat === k ? 'on' : ''}" data-act="cat" data-v="${k}">${CATS[k].label}</button>`).join('')}</div>
      ${CATS[d.cat].kind === 'frei' ? `<label class="toggle"><span>Spontankauf<small>Ehrlich sein. Die Figuren merken es sowieso.</small></span><input type="checkbox" ${d.impulse ? 'checked' : ''} data-chg="draft" data-f="impulse"></label>` : `<p class="hint">${d.cat === 'tanken' ? 'Tanken zählt als Pflicht. Die App lernt deinen Durchschnitt.' : 'Parken zählt als Pflicht und wird gelernt.'}</p>`}
      <label class="field">Notiz <small>optional, z. B. Zara</small><input name="note" value="${esc(d.note)}" data-chg="draft" data-f="note" maxlength="60"></label>
      <label class="field">Datum<input name="date" type="date" value="${d.date}" data-chg="draft" data-f="date"></label>
      <button class="btn red big" type="submit">Speichern</button>
      ${edit ? `<button type="button" class="btn ghost-red" data-act="delTx" data-id="${edit.id}">${svg('trash', 18)} Löschen</button>` : ''}
    </form></div>`;
}

// ---------- CHAT ----------
function vChat() {
  const list = state.chat.slice(-80);
  return `<div class="page chat">
    <header class="chat-h"><h1>Gruppenchat</h1><span class="muted">Ton: ${esc(S().tone)}</span></header>
    <div class="faces">${active().map((w) => `<div class="face">${av(w, 44)}<span>${esc(PERS[w].short)}</span></div>`).join('')}</div>
    <div class="msgs">${list.length ? list.map((c, i) => {
      const prev = list[i - 1];
      const day = !prev || dkey(prev.at) !== dkey(c.at) ? `<span class="day">${dayLabel(c.at)}</span>` : '';
      if (c.who === 'me') return day + `<p class="msg me">${esc(c.text)}</p>`;
      const p = PERS[c.who]; if (!p) return '';
      return day + `<div class="msgrow">${av(c.who, 34)}<p class="msg" style="background:${p.bg}"><b style="color:${p.ink}">${esc(p.name)}</b>${esc(c.text)}</p></div>`;
    }).join('') : '<p class="empty">Hier reagiert dein Team auf deine Ausgaben. Noch ist es ruhig.</p>'}</div></div>`;
}

// ---------- GRAFIK ----------
function donut(parts, total, label, sub) {
  const r = 62, C = 2 * Math.PI * r;
  let off = 0;
  const segs = parts.filter((p) => p.v > 0).map((p) => {
    const L = (p.v / total) * C;
    const s = `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${p.color}" stroke-width="22" stroke-dasharray="${Math.max(0, L - 1.5)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 80 80)"/>`;
    off += L; return s;
  }).join('');
  return `<div class="donut"><svg role="img" aria-label="Ringdiagramm der Ausgaben" width="160" height="160" viewBox="0 0 160 160"><circle cx="80" cy="80" r="${r}" fill="none" stroke="#ECECE8" stroke-width="22"/>${segs}</svg><div><b>${label}</b><span>${sub}</span></div></div>`;
}
function vGrafik() {
  const m = monthSummary(state);
  const cat = byCategory(m.freeTx);
  const free = FREE_CATS.map((k) => ({ k, v: cat[k] || 0, color: CATS[k].color, label: CATS[k].label })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
  const pfl = [
    { label: 'Fixkosten', v: m.fixed.sum, color: '#9A9DA3' },
    { label: 'Tanken bisher', v: m.tankSoFar, color: '#7B7E85' },
    { label: 'Parken bisher', v: m.parkSoFar, color: '#B9BBBF' }
  ];
  const all = [...free, ...pfl];
  const total = all.reduce((a, x) => a + x.v, 0) || 1;
  const weeks = weekly(m.txs, m.y, m.m);
  const wmax = Math.max(20, ...weeks.map((w) => w.total));
  const months = monthlyFree(state.tx);
  const mmax = Math.max(20, ...months.map((x) => x.total));
  const imp = m.impulse.filter((t) => CATS[t.cat].kind === 'frei');
  const impSum = imp.reduce((a, t) => a + t.amount, 0);
  const g = activeGoal();
  const all30 = [...state.tx].sort((a, b) => b.date - a.date).slice(0, 40);
  return `<div class="page">
    <header class="top"><h1>${MONTHS[m.m]}</h1><span class="muted">bisher ${eur0(total === 1 ? 0 : total)}</span></header>
    <section class="card"><span class="label">Wofür das Geld weggeht</span>
      <div class="donutrow">${donut(all, total, eur0(m.freeSpent), 'frei ausgegeben')}
      <div class="leg">${free.map((x) => `<div><i style="background:${x.color}"></i><span>${x.label}</span><b>${eur0(x.v)}</b></div>`).join('') || '<span class="muted">Noch keine freien Ausgaben.</span>'}</div></div>
      <details><summary>Pflicht · ${eur0(pfl.reduce((a, x) => a + x.v, 0))} bisher (grau)</summary><div class="leg grey">${pfl.map((x) => `<div><i style="background:${x.color}"></i><span>${x.label}</span><b>${eur0(x.v)}</b></div>`).join('')}</div></details>
    </section>
    <section class="card"><span class="label">Frei ausgegeben pro Woche</span>
      <div class="wbars">${weeks.map((w) => `<div><span>${eur0(w.total)}</span><div class="col"><i style="height:${(w.total / wmax) * 100}%"></i></div><small>${w.label}</small></div>`).join('')}</div></section>
    <section class="card"><span class="label">Frei ausgegeben pro Monat</span>
      ${months.map((x, i) => `<div class="mbar"><span>${x.label}</span><div><i style="width:${(x.total / mmax) * 100}%;background:${i === months.length - 1 ? '#C8242F' : '#9A9DA3'}"></i></div><b>${eur0(x.total)}</b></div>`).join('')}</section>
    <section class="imp"><div><span class="label">Spontankäufe ${MONTHS[m.m]}</span><b>${imp.length}× · ${eur0(impSum)}</b></div>${g && g.target ? `<span>= ${Math.round(impSum / g.target * 100)} % von „${esc(g.name)}“</span>` : ''}</section>
    <section class="card"><span class="label">Gelernt aus deinen Einträgen</span>
      <div class="sp line"><span>Tanken</span><b>${m.tank.learned ? `Ø ${eur0(m.tank.rate * 30.4)} / Monat` : `Schätzung ${eur0(m.tank.rate * 30.4)} / Monat`}</b></div>
      <div class="sp line"><span>Parken</span><b>${m.park.learned ? `Ø ${eur0(m.park.rate * 30.4)} / Monat` : `Schätzung ${eur0(m.park.rate * 30.4)} / Monat`}</b></div>
      <p class="hint">Ab 3 Einträgen in den letzten 60 Tagen rechnet die App mit deinen echten Werten.</p></section>
    <h2 class="sec">Alle Einträge</h2><div class="list">${all30.map(txRow).join('') || '<p class="empty">Noch keine.</p>'}</div>
  </div>`;
}

// ---------- ZIELE ----------
function vZiele() {
  const g = activeGoal();
  const mk = mkey(Date.now());
  const monthSaved = state.deposits.filter((d) => mkey(d.date) === mk).reduce((a, d) => a + d.amount, 0);
  const goal = +S().monthlyGoal || 0;
  const others = state.goals.filter((x) => x !== g);
  return `<div class="page">
    <header class="top"><h1>Sparziele</h1></header>
    ${g ? `<section class="goalhero"><div class="sp"><span class="label">Aktives Ziel</span>${g.target ? `<span class="label">${Math.min(100, Math.round(g.saved / g.target * 100))} %</span>` : ''}</div>
      <b class="gname">${esc(g.name)}</b>
      <div class="gnum"><strong>${eur0(g.saved)}</strong>${g.target ? `<span>von ${eur0(g.target)}</span>` : ''}</div>
      ${g.target ? `<div class="pbar light"><i style="width:${Math.min(100, g.saved / g.target * 100)}%"></i></div>` : '<p>Trag einen Zielbetrag ein, dann siehst du deinen Fortschritt.</p>'}
      <form data-form="deposit" class="deposit"><input name="amt" inputmode="decimal" placeholder="Betrag" aria-label="Betrag zurücklegen"><button class="btn dark" type="submit">Zurücklegen</button></form>
      <p class="small">Zurückgelegtes Geld wird vom freien Geld abgezogen – wie eine Überweisung aufs Sparkonto.</p>
    </section>
    ${active().includes('zukunft') ? bubble('zukunft', g.saved > 0 ? `Jeder Euro, den du heute nicht ausgibst, ist ein Stück „${g.name}“. Ich warte dort auf dich.` : `Hi, ich bin du in ein paar Monaten. Ich hoffe, du fängst heute mit „${g.name}“ an.`) : ''}` : ''}
    <section class="card"><span class="label">Monatsziel ${MONTHS[new Date().getMonth()]}</span>
      <div class="sp"><b class="num">${eur0(monthSaved)}</b><span class="muted">von ${eur0(goal)} zurückgelegt</span></div>
      <div class="pbar"><i style="width:${goal ? Math.min(100, monthSaved / goal * 100) : 0}%;background:#1E7A46"></i></div>
      <label class="field inline">Ziel pro Monat<input type="number" inputmode="numeric" min="0" step="10" value="${goal}" data-chg="setNum" data-f="monthlyGoal"></label></section>
    <h2 class="sec">Alle Ziele</h2>
    <div class="list">${state.goals.map((x) => `<div class="goal ${x.status}">
      <div class="sp"><input class="gtitle" value="${esc(x.name)}" data-chg="goalField" data-id="${x.id}" data-f="name" aria-label="Name"><span class="badge ${x.status}">${{ aktiv: 'aktiv', wartet: 'wartet', erreicht: 'erreicht' }[x.status]}</span></div>
      <div class="grow"><label>Ziel <input type="number" inputmode="decimal" min="0" value="${x.target || ''}" placeholder="[PREIS]" data-chg="goalField" data-id="${x.id}" data-f="target"> €</label><span class="muted">${eur0(x.saved)} gespart</span></div>
      <div class="gact">${x.status !== 'aktiv' ? `<button data-act="goalActive" data-id="${x.id}">Jetzt sparen</button>` : ''}${x.status === 'aktiv' ? `<button data-act="goalWait" data-id="${x.id}">Pausieren</button>` : ''}<button data-act="goalDel" data-id="${x.id}" aria-label="Ziel löschen">${svg('trash', 16)}</button></div></div>`).join('')}</div>
    <form data-form="goal" class="addrow"><input name="name" placeholder="Neues Ziel, z. B. Konzert" required><input name="target" inputmode="decimal" placeholder="€" aria-label="Zielbetrag"><button class="btn dark" type="submit">${svg('plus', 18)}</button></form>
  </div>`;
}

// ---------- PFLICHT & EINSTELLUNGEN ----------
function vPflicht() {
  const m = monthSummary(state);
  const tone = ['nett', 'frech', 'gnadenlos'];
  return `<div class="page">${back('#/monat', 'Monat')}
    <h1>Pflicht & Einstellungen</h1>
    <p class="muted">Wird abgezogen, bevor „Noch frei“ berechnet wird.</p>
    <section class="card tight">
      <div class="frow inc"><input value="${esc(S().income.name)}" data-chg="income" data-f="name" aria-label="Einnahme"><span class="muted">Ende des Monats</span><label class="money">+<input type="number" inputmode="decimal" value="${S().income.amount}" data-chg="income" data-f="amount" aria-label="Betrag"> €</label></div>
      ${state.fixed.map((f) => `<div class="frow">
        <input value="${esc(f.name)}" data-chg="fixField" data-id="${f.id}" data-f="name" aria-label="Name">
        <select data-chg="fixRule" data-id="${f.id}" aria-label="Rhythmus"><option value="monthly" ${f.rule.type === 'monthly' ? 'selected' : ''}>monatlich am</option><option value="biweekly" ${f.rule.type === 'biweekly' ? 'selected' : ''}>alle 2 Wochen ab</option></select>
        ${f.rule.type === 'monthly' ? `<input class="day" type="number" min="1" max="31" value="${f.rule.day}" data-chg="fixDay" data-id="${f.id}" aria-label="Tag">` : `<input class="date" type="date" value="${f.rule.anchor}" data-chg="fixAnchor" data-id="${f.id}" aria-label="Erste Zahlung">`}
        <label class="money">−<input type="number" inputmode="decimal" value="${f.amount}" data-chg="fixField" data-id="${f.id}" data-f="amount" aria-label="Betrag"> €</label>
        <button class="del" data-act="fixDel" data-id="${f.id}" aria-label="${esc(f.name)} löschen">${svg('trash', 16)}</button></div>`).join('')}
      <button class="addfix" data-act="fixAdd">${svg('plus', 16)} Fixkosten hinzufügen</button>
    </section>
    <section class="card tight">
      <div class="frow"><span class="lbl">Tanken (Schätzung, bis gelernt)</span><label class="money"><input type="number" inputmode="decimal" value="${S().tankDefault}" data-chg="setNum" data-f="tankDefault"> € / Woche</label></div>
      <div class="frow"><span class="lbl">Parken (Schätzung, bis gelernt)</span><label class="money"><input type="number" inputmode="decimal" value="${S().parkPerMonth}" data-chg="setNum" data-f="parkPerMonth"> € / Monat</label></div>
      <div class="frow"><span class="lbl">Parken-Schnellbeträge</span><input class="chipsin" value="${S().parkChips.map(n2).join(' / ')}" data-chg="parkChips" aria-label="Schnellbeträge"></div>
    </section>
    <div class="sumline"><span>Pflicht diesen Monat (geschätzt)</span><b>${eur0(m.pflicht)}</b></div>
    <div class="sumline"><span>Bleibt frei</span><b>${eur0(m.initialFree)}</b></div>

    <h2 class="sec">Sparkasse</h2>
    <section class="tile blue"><b>Umsätze importieren</b>
      <span>Online-Banking im Browser → Konto → Zeitraum → „Exportieren & Drucken“ → CSV. Einmal im Monat reicht. Tankstellen, Fitness First, Apple & Co. werden automatisch zugeordnet, doppelte Einträge übersprungen.</span>
      <label class="btn white">${svg('file', 18)} CSV-Datei wählen<input type="file" accept=".csv,text/csv,text/plain" class="sr-only" data-chg="csv"></label></section>

    <h2 class="sec">Dein Team</h2>
    <section class="card tight">${ORDER.map((w) => `<div class="team">
      <label class="pic" aria-label="Bild für ${esc(PERS[w].name)} ändern">${av(w, 48)}<input type="file" accept="image/*" class="sr-only" data-chg="img" data-w="${w}"></label>
      <div><b>${esc(PERS[w].name)}</b><span>${esc(PERS[w].role)}${w === 'gewissen' ? ' · darf gnadenlos sein' : ''}</span>
      <div class="picact"><label class="link">Bild ändern<input type="file" accept="image/*" class="sr-only" data-chg="img" data-w="${w}"></label>${S().images[w] ? `<button class="link" data-act="imgReset" data-w="${w}">Standard</button>` : ''}</div></div>
      <input type="checkbox" ${S().active.includes(w) ? 'checked' : ''} data-chg="toggleP" data-w="${w}" aria-label="${esc(PERS[w].name)} aktiv"></div>`).join('')}</section>
    <span class="lbl2">Ton</span>
    <div class="seg">${tone.map((t) => `<button class="${S().tone === t ? 'on' : ''}" data-act="tone" data-v="${t}">${t}</button>`).join('')}</div>
    <p class="hint">Der Gruppenchat meldet sich ab und zu – nicht bei jedem Eintrag.</p>

    <h2 class="sec">Daten</h2>
    <button class="btn white wide" data-act="backup">${svg('file', 18)} Backup speichern</button>
    <label class="btn white wide">Backup wiederherstellen<input type="file" accept=".json,application/json" class="sr-only" data-chg="restore"></label>
    <button class="btn ghost-red wide" data-act="reset">${svg('trash', 18)} Alles löschen</button>
    <p class="hint">No Change Brotha · Version 1 · Daten nur auf diesem Gerät</p></div>`;
}

// ---------- WILLKOMMEN ----------
function vWillkommen() {
  return `<div class="page welcome">
    <span class="brand big">NO CHANGE<br><b>BROTHA</b></span>
    <p class="lead">Sieh, was wirklich frei ist – nachdem Krankenkasse, Abos, Tanken und Parken bezahlt sind.</p>
    <label class="field">Einnahme am Monatsende (mindestens)<div class="row"><input value="${esc(S().income.name)}" data-chg="income" data-f="name" aria-label="Name"><input type="number" inputmode="decimal" value="${S().income.amount}" data-chg="income" data-f="amount" aria-label="Betrag"></div></label>
    <div class="card tight">${state.fixed.map((f) => `<div class="sp line"><span>${esc(f.name)}</span><b>${eur(f.amount)}${f.rule.type === 'biweekly' ? ' / 2 Wo.' : ''}</b></div>`).join('')}
      <p class="hint">Daten und Beträge änderst du später unter Pflicht & Einstellungen.</p></div>
    <span class="lbl2">Wie hart darf dein Team sein?</span>
    <div class="seg">${['nett', 'frech', 'gnadenlos'].map((t) => `<button class="${S().tone === t ? 'on' : ''}" data-act="tone" data-v="${t}">${t}</button>`).join('')}</div>
    <div class="faces">${ORDER.map((w) => `<div class="face">${av(w, 48)}<span>${esc(PERS[w].short)}</span></div>`).join('')}</div>
    <button class="btn red big" data-act="onboard">Los geht’s</button>
    <p class="hint">Alles bleibt auf deinem Handy. Nichts wird hochgeladen.</p></div>`;
}

// ---------- Aktionen ----------
function afterExpense(t) {
  if (t.income) return;
  const m = monthSummary(state);
  const g = activeGoal();
  const out = [];
  const kind = CATS[t.cat].kind;
  const act = active();
  if (kind === 'frei' && act.includes('gewissen')) {
    out.push({ who: 'gewissen', text: conscience(convert(t.amount, { goal: g && g.target ? g : null, freeLeft: m.freeLeft }), S().tone) });
    state.moods.gewissen = t.impulse ? 'bad' : 'neutral';
  }
  // Gruppenchat nur gelegentlich
  const weekAgo = Date.now() - 7 * DAY;
  const n = state.tx.filter((x) => x.impulse && x.date >= weekAgo).length;
  const ctx = { goal: g ? g.name : 'dein Ziel', n, day: new Date().getDate() };
  const chance = t.impulse ? 0.45 : kind === 'frei' ? 0.2 : 0.15;
  if (Math.random() < chance) {
    const kindKey = t.impulse ? (Math.random() < 0.5 && (t.cat === 'kleidung' || t.cat === 'essen') ? t.cat : 'impulse') : t.cat === 'tanken' ? 'tanken' : (t.cat === 'kleidung' || t.cat === 'essen') ? t.cat : null;
    const r = kindKey && reaction(kindKey, act.filter((w) => w !== 'zukunft' && w !== 'gewissen'), ctx);
    if (r) { out.push(r); state.moods[r.who] = 'bad'; }
  }
  if (m.amp === 'rot' && kind === 'frei' && act.includes('gewissen') && S().lastAmp !== 'rot') {
    out.push({ who: 'gewissen', text: 'Alarmstufe Rot. Dein freies Geld ist aufgebraucht. Ab jetzt nur noch Pflicht.' });
  }
  S().lastAmp = m.amp;
  me(`${eur(t.amount)} · ${t.note || CATS[t.cat].label}${t.impulse ? ' · Spontankauf' : ''}`);
  out.forEach((r) => post(r.who, r.text));
  state.pending = out.length ? out : null;
}

const actions = {
  dismiss: () => { state.pending = null; save(); rerender(); },
  cat: (el) => { draft.cat = el.dataset.v; if (draft.cat === 'tanken' && !draft.amount) draft.amount = String(S().tankDefault); if (CATS[draft.cat].kind !== 'frei') draft.impulse = false; rerender(); },
  chipAmt: (el) => { draft.amount = n2(+el.dataset.v); rerender(); },
  delTx: (el) => { if (!confirm('Eintrag löschen?')) return; state.tx = state.tx.filter((t) => t.id !== el.dataset.id); draft = null; save(); location.hash = '#/monat'; },
  goalActive: (el) => { state.goals.forEach((g) => { if (g.status === 'aktiv') g.status = 'wartet'; }); state.goals.find((g) => g.id === el.dataset.id).status = 'aktiv'; save(); rerender(); },
  goalWait: (el) => { state.goals.find((g) => g.id === el.dataset.id).status = 'wartet'; save(); rerender(); },
  goalDel: (el) => { if (!confirm('Ziel löschen? Das Gesparte bleibt in deinen Monatszahlen.')) return; state.goals = state.goals.filter((g) => g.id !== el.dataset.id); save(); rerender(); },
  fixAdd: () => { state.fixed.push({ id: uid(), name: 'Neue Fixkosten', amount: 0, rule: { type: 'monthly', day: 1 }, match: '' }); save(); rerender(); },
  fixDel: (el) => { if (!confirm('Fixkosten löschen?')) return; state.fixed = state.fixed.filter((f) => f.id !== el.dataset.id); save(); rerender(); },
  tone: (el) => { S().tone = el.dataset.v; save(); rerender(); },
  imgReset: (el) => { delete S().images[el.dataset.w]; save(); rerender(); },
  onboard: () => { S().onboarded = true; S().startedAt = Date.now(); S().lastMonth = mkey(Date.now()); save(); location.hash = '#/monat'; },
  backup: () => download(`no-change-brotha-backup-${today()}.json`, JSON.stringify({ format: 'vi-ncb-backup', data: state }), 'application/json'),
  reset: () => { if (confirm('Wirklich alle Daten löschen?') && confirm('Sicher? Das kann man nicht rückgängig machen.')) { state = DEFAULT(); save(); location.hash = '#/willkommen'; } }
};

const changes = {
  draft: (el) => { draft[el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value; },
  setNum: (el) => { S()[el.dataset.f] = +el.value || 0; save(); },
  income: (el) => { S().income[el.dataset.f] = el.dataset.f === 'amount' ? +el.value || 0 : el.value.trim() || 'Einnahme'; save(); },
  fixField: (el) => { const f = state.fixed.find((x) => x.id === el.dataset.id); f[el.dataset.f] = el.dataset.f === 'amount' ? parseAmount(el.value) || 0 : el.value.trim(); if (el.dataset.f === 'name' && !f.match) f.match = el.value.trim().toLowerCase().replace(/[^a-z0-9äöü ]/g, ''); save(); },
  fixRule: (el) => { const f = state.fixed.find((x) => x.id === el.dataset.id); f.rule = el.value === 'monthly' ? { type: 'monthly', day: 1 } : { type: 'biweekly', anchor: today() }; save(); rerender(); },
  fixDay: (el) => { state.fixed.find((x) => x.id === el.dataset.id).rule.day = Math.min(31, Math.max(1, +el.value || 1)); save(); },
  fixAnchor: (el) => { if (el.value) { state.fixed.find((x) => x.id === el.dataset.id).rule.anchor = el.value; save(); } },
  parkChips: (el) => { const v = el.value.split(/[\/;]+/).map(parseAmount).filter((x) => x > 0).slice(0, 6); if (v.length) { S().parkChips = v; save(); } },
  goalField: (el) => { const g = state.goals.find((x) => x.id === el.dataset.id); if (el.dataset.f === 'target') g.target = parseAmount(el.value) || 0; else g.name = el.value.trim() || g.name; save(); },
  toggleP: (el) => { const a = new Set(S().active); el.checked ? a.add(el.dataset.w) : a.delete(el.dataset.w); S().active = ORDER.filter((w) => a.has(w)); save(); },
  img: async (el) => {
    const file = el.files[0]; if (!file) return;
    try { S().images[el.dataset.w] = await shrink(file, 192); save(); toast('Bild gespeichert'); rerender(); }
    catch (e) { toast('Bild konnte nicht gelesen werden'); }
  },
  csv: async (el) => {
    const file = el.files[0]; if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      let text = new TextDecoder('utf-8').decode(buf);
      if (text.includes('�')) text = new TextDecoder('windows-1252').decode(buf);
      const rows = parseBankCsv(text);
      let added = 0, skipped = 0, latestIncome = null;
      for (const r of rows) {
        const c = categorize(r, state.fixed);
        const amount = Math.abs(r.amount);
        const dup = state.tx.some((t) => Math.abs(t.amount - amount) < 0.01 && Math.abs(t.date - r.date) <= 2 * DAY && !!t.income === !!c.income);
        if (dup) { skipped++; continue; }
        const note = (r.who || r.what || r.text).slice(0, 40);
        state.tx.push({ id: uid(), date: r.date, amount, cat: c.cat, income: !!c.income, fixedId: c.fixedId || null, note, impulse: false, source: 'csv', created: Date.now() });
        if (c.income && /\bzf\b/i.test(`${r.who} ${r.what}`) && (!latestIncome || r.date > latestIncome.date)) latestIncome = r;
        added++;
      }
      if (latestIncome) S().income.amount = Math.round(latestIncome.amount * 100) / 100;
      save();
      toast(`${added} Umsätze importiert${skipped ? `, ${skipped} doppelte übersprungen` : ''}`);
      location.hash = '#/grafik';
    } catch (e) { toast(e.message || 'Datei konnte nicht gelesen werden'); }
  },
  restore: async (el) => {
    try {
      const o = JSON.parse(await el.files[0].text());
      if (o.format !== 'vi-ncb-backup') throw new Error();
      if (!confirm('Backup laden? Aktuelle Daten werden ersetzt.')) return;
      state = { ...DEFAULT(), ...o.data }; save(); toast('Backup geladen'); location.hash = '#/monat';
    } catch (e) { toast('Das ist kein No-Change-Brotha-Backup'); }
  }
};

function shrink(file, size) {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const s = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = rej;
    img.src = url;
  });
}

const forms = {
  tx: (f) => {
    const amount = parseAmount(f.amount.value);
    if (!(amount > 0)) { toast('Bitte einen Betrag eingeben'); return; }
    const date = new Date((draft.date || today()) + 'T12:00').getTime();
    if (draft.id) {
      const t = state.tx.find((x) => x.id === draft.id);
      Object.assign(t, { amount, cat: draft.cat, impulse: CATS[draft.cat].kind === 'frei' && !!draft.impulse, note: (draft.note || '').trim(), date });
      draft = null; save(); location.hash = '#/monat'; return;
    }
    const t = { id: uid(), date, amount, cat: draft.cat, impulse: CATS[draft.cat].kind === 'frei' && !!draft.impulse, note: (draft.note || '').trim(), income: false, source: 'manual', created: Date.now() };
    state.tx.push(t);
    afterExpense(t);
    draft = null; save(); location.hash = '#/monat';
  },
  deposit: (f) => {
    const amount = parseAmount(f.amt.value);
    const g = activeGoal();
    if (!(amount > 0) || !g) return;
    g.saved = Math.round((g.saved + amount) * 100) / 100;
    state.deposits.push({ id: uid(), date: Date.now(), amount, goalId: g.id });
    me(`${eur(amount)} für „${g.name}“ zurückgelegt`);
    const out = [];
    if (active().includes('zukunft')) out.push({ who: 'zukunft', text: zukunft('deposit', { x: eur(amount), goal: g.name }) });
    if (g.target && g.saved >= g.target && g.status !== 'erreicht') {
      g.status = 'erreicht';
      if (active().includes('zukunft')) out.push({ who: 'zukunft', text: zukunft('reached', { goal: g.name }) });
      if (active().includes('gelangweilt')) out.push({ who: 'gelangweilt', text: 'Gespart. Wow. Ich spür sogar was. Glaub ich.' });
      const next = state.goals.find((x) => x.status === 'wartet');
      if (next) next.status = 'aktiv';
    }
    const mk = mkey(Date.now());
    const ms = state.deposits.filter((d) => mkey(d.date) === mk).reduce((a, d) => a + d.amount, 0);
    if (S().monthlyGoal && ms >= S().monthlyGoal && ms - amount < S().monthlyGoal && active().includes('zukunft')) out.push({ who: 'zukunft', text: zukunft('monthGoal', { x: eur0(ms) }) });
    out.forEach((r) => post(r.who, r.text));
    state.moods.zukunft = 'good';
    state.pending = out.length ? out : null;
    save(); location.hash = '#/monat';
  },
  goal: (f) => {
    state.goals.push({ id: uid(), name: f.name.value.trim(), target: parseAmount(f.target.value) || 0, saved: 0, status: activeGoal() ? 'wartet' : 'aktiv' });
    save(); rerender();
  }
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || !actions[el.dataset.act]) return;
  ev.preventDefault();
  actions[el.dataset.act](el, ev);
});
document.addEventListener('change', (ev) => { const el = ev.target.closest('[data-chg]'); if (el && changes[el.dataset.chg]) changes[el.dataset.chg](el, ev); });
document.addEventListener('input', (ev) => { const el = ev.target.closest('[data-chg="draft"]'); if (el && el.type !== 'checkbox') draft[el.dataset.f] = el.value; });
document.addEventListener('submit', (ev) => { const f = ev.target.closest('[data-form]'); if (!f) return; ev.preventDefault(); forms[f.dataset.form](f); });
window.addEventListener('hashchange', () => { route(); scrollTo(0, 0); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && !document.activeElement.matches('input,select,textarea')) { housekeeping(); rerender(); } });

housekeeping();
route();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
