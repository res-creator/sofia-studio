// Global timeline of "The Match King": a match strike intro, the 40 voice lines with pauses, a 3 s chapter card before each chapter, an end card.
// at(id, word, n) → global time (s) of the n-th occurrence of a word (prefix match, case-insensitive) in line id. L[id] = line start, E[id] = line end.
const fs = require('fs'), path = require('path');
const D = __dirname, lines = JSON.parse(fs.readFileSync(path.join(D, 'vo/lines.json')));
const CH = [ // [card title, years, first line id]  (null title = no card)
  [null, null, 'h1'], ['THE ENGINEER', '1880 — 1913', 'k1'], ['THE MATCH TRUST', '1913 — 1923', 't1'], ['MATCHES FOR MONEY', '1925 — 1930', 'm1'],
  ['THE MATCH PALACE', '1928 — 1929', 'p1'], ['THE TRICK', '', 'r1'], ['OUT OF MATCHES', '1929 — 1932', 'c1'], ['THE BOOKS', '1932 — 1933', 'a1'], [null, null, 'e1']];
const INTRO = 2.4, CARD = 3.0, GAP = 0.45, END = 4.0;
const EXTRA = { h4: 0.6, k4: 0.4, t4: 0.3, m2b: 0.3, m5: 0.6, p5: 0.4, r5: 0.7, c3: 1.2, c4: 0.6, c5: 0.5, a4: 0.6, e1b: 0.5 };   // breaths on story turns
const W = {}, L = {}, E = {}, cards = []; let t = INTRO;
const dur = id => { const w = JSON.parse(fs.readFileSync(path.join(D, `vo/${id}.words.json`))); W[id] = w; return w[w.length - 1][2] + 0.15; };
for (const [id, text] of lines) { const c = CH.find(c => c[2] === id); if (c) { if (c[0]) { cards.push({ t0: t, t1: t + CARD, title: c[0], years: c[1], n: CH.indexOf(c) }); t += CARD; } else if (id === 'e1') t += 0.6; }
  L[id] = t; const d = dur(id); E[id] = t + d; t += d + GAP + (EXTRA[id] || 0); }
const T = t + END - GAP;
function at(id, word, n = 0) { const w = W[id], q = word.toLowerCase(); const hits = w.filter(x => x[0].toLowerCase().replace(/[^a-z0-9'’]/g, '').startsWith(q)); if (!hits[n]) throw new Error(`no word "${word}"#${n} in ${id}`); return L[id] + hits[n][1]; }
module.exports = { lines, L, E, W, at, cards, T, INTRO, CARD };
if (require.main === module) { console.log('T', T.toFixed(2), 's =', Math.floor(T / 60) + ':' + String(Math.round(T % 60)).padStart(2, '0')); for (const c of cards) console.log('card', c.t0.toFixed(1), c.title); }
