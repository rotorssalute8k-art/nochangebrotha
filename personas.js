// Die Figuren von No Change Brotha: Aussehen und Sätze.

export const PERS = {
  gewissen: { name: 'Das schlechte Gewissen', short: 'Gewissen', bg: '#EDE7FF', ink: '#3B2A7A', role: 'rechnet um, fragt nach' },
  brotha: { name: 'Brotha', short: 'Brotha', bg: '#E3F1FF', ink: '#123B66', role: 'got no change, spricht in Memes' },
  kim: { name: 'Kassen-Kim', short: 'Kim', bg: '#FFE3EC', ink: '#7A1F3D', role: 'Kasse & Spartipps' },
  gelangweilt: { name: 'Die Gelangweilte', short: 'Gelangweilte', bg: '#ECECE8', ink: '#3C3F45', role: 'staubtrocken' },
  zukunft: { name: 'Zukunfts-Vi', short: 'Zukunfts-Vi', bg: '#E0F4F6', ink: '#0F4C55', role: 'die ernste Stimme' }
};
export const ORDER = ['gewissen', 'brotha', 'kim', 'gelangweilt', 'zukunft'];

const K = '#16181D';
const SKIN = '#F2C9A8';
function mouth(mood, x = 32, y = 43) {
  if (mood === 'good') return `<path d="M${x - 6} ${y} q6 5 12 0" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  if (mood === 'bad') return `<path d="M${x - 6} ${y + 3} q6 -5 12 0" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return `<path d="M${x - 5} ${y + 1} h10" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>`;
}
// Illustrierte Standard-Gesichter (64×64). Eigene Bilder ersetzen sie in den Einstellungen.
export function avatar(who, mood = 'neutral', size = 40, img) {
  const p = PERS[who] || PERS.gewissen;
  if (img) return `<img src="${img}" alt="" width="${size}" height="${size}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex:none;display:block">`;
  let body = '';
  if (who === 'gewissen') {
    body = `<path d="M10 64 q2 -14 22 -14 q20 0 22 14 Z" fill="#5B45A8"/>
      <path d="M16 58 l32 -4 M16 54 l32 4" stroke="#3B2A7A" stroke-width="5" stroke-linecap="round"/>
      <circle cx="32" cy="30" r="15" fill="${SKIN}"/>
      <path d="M17 26 q2 -13 15 -13 q13 0 15 13 q-6 -6 -15 -6 q-9 0 -15 6 Z" fill="#2B2236"/>
      <path d="M22 26 l7 ${mood === 'good' ? 0 : 2} M35 ${mood === 'good' ? 27 : 28} l8 -4" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="26" cy="31" r="2" fill="${K}"/><circle cx="39" cy="31" r="2" fill="${K}"/>
      ${mouth(mood, 32, 38)}`;
  } else if (who === 'brotha') {
    body = `<path d="M8 64 q3 -15 24 -15 q21 0 24 15 Z" fill="#2F6FD6"/>
      <path d="M8 50 l-2 -8 M56 50 l2 -8" stroke="${SKIN}" stroke-width="5" stroke-linecap="round"/>
      <path d="M26 50 q6 5 12 0" stroke="#123B66" stroke-width="2" fill="none"/>
      <circle cx="32" cy="31" r="15" fill="${SKIN}"/>
      <path d="M16 27 q2 -15 16 -15 q14 0 16 15 Z" fill="#123B66"/><path d="M14 27 h-6" stroke="#123B66" stroke-width="4" stroke-linecap="round"/>
      <circle cx="26" cy="32" r="2" fill="${K}"/><circle cx="38" cy="32" r="2" fill="${K}"/>
      ${mood === 'bad' ? `<path d="M22 28 l6 1 M36 29 l6 -1" stroke="${K}" stroke-width="2" stroke-linecap="round"/>` : ''}
      ${mood === 'good' ? `<path d="M26 39 q6 5 12 0" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : `<path d="M27 40 q5 2 10 -1" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`}`;
  } else if (who === 'kim') {
    body = `<path d="M9 64 q3 -15 23 -15 q20 0 23 15 Z" fill="#D1477A"/>
      <path d="M24 50 v14 M40 50 v14" stroke="#7A1F3D" stroke-width="3"/>
      <rect x="37" y="55" width="12" height="7" rx="1.5" fill="#FFFFFF"/><path d="M39 58.5 h8" stroke="#7A1F3D" stroke-width="1.6"/>
      <circle cx="32" cy="31" r="15" fill="${SKIN}"/>
      <path d="M17 33 q-2 -18 15 -18 q17 0 15 18 q-3 -8 -15 -9 q-12 1 -15 9 Z" fill="#8A4B2E"/>
      <path d="M15 22 q17 -9 34 0" stroke="#7A1F3D" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M24 31 q2 -2.5 4 0 M36 31 q2 -2.5 4 0" stroke="${K}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      ${mouth(mood === 'neutral' ? 'good' : mood, 32, 38)}`;
  } else if (who === 'gelangweilt') {
    body = `<path d="M10 64 q2 -14 22 -14 q20 0 22 14 Z" fill="#3C3F45"/>
      <path d="M14 46 q-2 -24 18 -26 q20 2 18 26 q-4 -2 -6 -10 q-12 -4 -24 0 q-2 8 -6 10 Z" fill="#3A2A22"/>
      <circle cx="32" cy="31" r="14" fill="${SKIN}"/>
      <path d="M18 27 q14 -12 28 0 l0 -6 q-14 -10 -28 0 Z" fill="#3A2A22"/>
      <path d="M23 31 h7 M35 31 h7" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M24 33 q2.5 1.5 5 0 M36 33 q2.5 1.5 5 0" stroke="${K}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      ${mood === 'good' ? `<path d="M28 39 q4 2 8 0" stroke="${K}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` : `<path d="M27 40 h10" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>`}`;
  } else {
    body = `<path d="M10 64 q2 -14 22 -14 q20 0 22 14 Z" fill="#0F4C55"/>
      <circle cx="32" cy="10" r="6" fill="#2A1F1A"/>
      <circle cx="32" cy="31" r="15" fill="${SKIN}"/>
      <path d="M17 30 q0 -16 15 -16 q15 0 15 16 q-4 -9 -15 -10 q-11 1 -15 10 Z" fill="#2A1F1A"/>
      <path d="M24 31 q2 2 4 0 M36 31 q2 2 4 0" stroke="${K}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      ${mouth(mood === 'bad' ? 'neutral' : 'good', 32, 38)}
      <path d="M52 10 v8 M48 14 h8" stroke="#0F4C55" stroke-width="2" stroke-linecap="round"/>`;
  }
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 64 64" style="flex:none;display:block;border-radius:50%"><clipPath id="c${who}${size}"><circle cx="32" cy="32" r="32"/></clipPath><g clip-path="url(#c${who}${size})"><rect width="64" height="64" fill="${p.bg}"/>${body}</g></svg>`;
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const fill = (t, c = {}) => t.replace(/\{(\w+)\}/g, (_, k) => (c[k] ?? ''));

// Monatskachel je Ampelfarbe
export const AMPEL_LINES = {
  gruen: [
    ['zukunft', 'Du liegst im Plan. {free} für {days} Tage – das reicht, wenn du dabei bleibst.'],
    ['zukunft', 'Starker Monat bisher. Deine Pflichtkosten sind gedeckt, der Rest gehört dir.'],
    ['zukunft', 'Jeder Tag ohne Spontankauf bringt dich ein Stück näher an „{goal}“.'],
    ['zukunft', 'Du hast deine Ausgaben im Griff. Genau so geht’s weiter.']
  ],
  gelb: [
    ['gewissen', 'Achtung: Noch {free} für {days} Tage. Das sind {perDay} am Tag. Ab jetzt nur noch, was wirklich sein muss.'],
    ['gewissen', 'Wenn du so weitermachst, ist dein freies Geld bald weg. Jetzt bremsen.'],
    ['gewissen', '„{goal}“ rückt gerade weiter weg. Jeder Kauf ab jetzt zählt doppelt.'],
    ['gewissen', 'Stopp. Bevor du etwas kaufst: Brauchst du es heute, oder kann es bis zum 1. warten?']
  ],
  rot: [
    ['gewissen', 'Das ist ernst. Mit {free} kommst du nicht bis zum Monatsende. Jeder weitere Kauf geht auf Kosten von Tank oder Parken. Nichts mehr kaufen, was warten kann.'],
    ['gewissen', 'Ausgabenstopp. Ab jetzt nur noch Tanken, Parken und Pflicht. Alles andere wartet bis zum 1.'],
    ['brotha', 'Watch it, broke bitch!'],
    ['brotha', 'This is fine. 🔥 (Es ist nicht fine.)'],
    ['kim', 'Average Luxemburg-Pendlerin: 75 € Tank, 0 € Gefühle.'],
    ['gelangweilt', 'Das ist kein Kontostand mehr, das ist ein Hilferuf.']
  ]
};
export function ampelLine(amp, ctx, active, tone) {
  let list = AMPEL_LINES[amp].filter(([w]) => active.includes(w));
  if (tone === 'nett') list = list.filter(([w, t]) => !/broke bitch/.test(t));
  if (!list.length) list = AMPEL_LINES[amp].slice(0, 1);
  const [who, t] = list[Math.floor((ctx.seed || 0) % list.length)];
  return { who, text: fill(t, ctx) };
}

// Gewissen nach jeder Ausgabe
export function conscience(options, tone) {
  const base = pick(options);
  if (tone === 'nett') return `Nur zur Info: ${base}`;
  if (tone === 'gnadenlos') return `${base} ${pick(['Und du wolltest sparen. Ich vergesse das nicht.', 'Ich frag morgen nochmal, ob du das gebraucht hast.', 'Hat sich das gelohnt? Ehrlich?', 'Ich hab’s notiert. Für immer.'])}`;
  return `${base} ${pick(['Nur damit du’s weißt.', 'Nur so.', 'Brauchtest du das wirklich?', ''])}`.trim();
}

// Gelegentliche Gruppenchat-Reaktionen
const REACT = {
  impulse: {
    brotha: ['Bist du aus der Nachbarschaft? Nein, aber ich bin Teil der Spontankauf-Community.', 'Got no change, sorry brotha. Und so bleibt’s, wenn das so weitergeht.', 'Erwartung: {goal}. Realität: das hier.', 'Das Geld hat den Chat verlassen.', 'Läuft bei dir. Also das Geld. Weg.'],
    kim: ['Bar, Karte oder Reue?', 'Spartipp des Tages: Einfach nicht kaufen. Nächste Kundin!', 'Hey Leute, heute zeig ich euch, wie man mit 3 € durch die Woche kommt. Schritt 1: Das hier nicht kaufen.'],
    gelangweilt: ['Cool. Ich bin so aufgeregt für dich.', 'Spontankauf Nummer {n} diese Woche. Ich zähl nur mit.', 'Ah. Interessant. Nicht.']
  },
  kleidung: { gelangweilt: ['Ah. Kleidung. Du hast ja nichts zum Anziehen. Außer allem.'], brotha: ['Erwartung: {goal}. Realität: Pulli Nummer acht.'] },
  essen: { gelangweilt: ['Cool. Noch ein Latte. Ich bin so aufgeregt für dich.'], kim: ['Brötchen von zuhause: 3 € gespart. Nur so als Idee.'] },
  tanken: { kim: ['Tanken ist Pflicht, passt. Den Schokoriegel an der Kasse hab ich trotzdem gesehen.'], gelangweilt: ['Tanken. Schon wieder. Luxemburg ist halt nicht um die Ecke.'] },
  late: { brotha: ['POV: Es ist der {day}. und du lebst von Luft und Gratisproben.'] }
};
export function reaction(kind, active, ctx) {
  const pool = REACT[kind];
  if (!pool) return null;
  const whos = Object.keys(pool).filter((w) => active.includes(w));
  if (!whos.length) return null;
  const who = pick(whos);
  return { who, text: fill(pick(pool[who]), ctx) };
}

export const ZUKUNFT = {
  deposit: ['Hi, ich bin du in ein paar Monaten. Danke für die {x}. Ich bin „{goal}“ gerade ein Stück näher.', 'Das hier merke ich später. Danke, dass du an mich denkst.', '{x} zurückgelegt. Genau solche Tage machen „{goal}“ möglich.'],
  reached: ['Wir haben’s geschafft: „{goal}“. Ich hab nie an uns gezweifelt. Okay, manchmal.', '„{goal}“ ist erreicht. Das warst du. Jeder einzelne nicht gekaufte Kaffee.'],
  restart: ['Neuer Monat, neue Chance. Der letzte war schwer. Ich glaub an uns.', 'Abhaken, nicht grübeln. Dieser Monat fängt bei null an.'],
  monthGoal: ['Monatsziel geschafft: {x} zurückgelegt. Das ist mehr wert, als es sich gerade anfühlt.']
};
export const zukunft = (k, ctx) => fill(pick(ZUKUNFT[k]), ctx);
export const nudgeNoEntry = (tone) => tone === 'nett' ? 'Du hast seit zwei Tagen nichts eingetragen. Kurz nachtragen?' : 'Du hast seit zwei Tagen nichts eingetragen. Ich bin nicht sauer. Nur enttäuscht.';
