// Кадры выпуска «Девочка в Афганистане»: params.k = вид кадра.
import { E, registerShot } from '/engine/core.js';
import { fig, SK, cam, vignette, typeCard, ln, el, bx, pg, fo, glow, blob, clamp, ease, lerp, htxt, OL, vg, baby, notes, pen } from '../lib/pro.js';
import * as A from '../lib/afg.js';
import { tag, big, pop, globe, pin } from '/projects/remote/scenes/lib/sets.js';

const SKA = '#e2b48a';
export const C = {
  girl: { hair: 'none', scarf: '#f6f4ee', body: 'dress', coat: '#26262c', shirt: '#26262c', skin: SKA, seed: 3, brow: 6 },
  teacher: { hair: 'none', scarf: '#3a6aa8', body: 'dress', coat: '#5a4a6a', shirt: '#5a4a6a', glasses: true, skin: SK.a, seed: 5 },
  brother: { hair: 'side', hairC: '#2a2320', body: 'perahan', coat: '#8aa0b8', vest: '#3a3f4a', skin: SKA, seed: 6 },
  mother: { hair: 'none', scarf: '#b44a6a', scarfLong: true, body: 'dress', coat: '#7a3a5a', shirt: '#7a3a5a', skin: SKA, seed: 7 },
  father: { hair: 'none', body: 'perahan', coat: '#d8d4c4', vest: '#4a4a3a', pakol: '#8a7a5a', beard: true, beardC: '#2a2320', skin: SK.b, seed: 8 },
  granny: { hair: 'none', scarf: '#f2f2ec', scarfLong: true, body: 'dress', coat: '#3a3a4a', shirt: '#3a3a4a', skin: SK.c, seed: 9, brow: 5 },
  aunt: { hair: 'none', scarf: '#3a8a7a', body: 'dress', coat: '#4a6a8a', shirt: '#4a6a8a', skin: SKA, seed: 10 },
  kid: { hair: 'curly', hairC: '#2a2320', body: 'perahan', coat: '#c8a24a', skin: SK.b, seed: 12 },
};
const HOLD = { baby, notes, pen };
const people = (g, t, list) => (list || []).forEach(([x, y, s, who, o], k) => { const oo = { ...C[who], ...(o || {}) }; if (typeof oo.holdR === 'string') oo.holdR = HOLD[oo.holdR]; fig(g, x, y, s, oo, t + k * 0.37); });
const ageTag = (g, t, i) => { if (i.age) tag(g, i.age, 200, 120, pop(t, 0.1), { size: 70, bg: '#ffd43b', rot: -0.04 }); };
const tags = (g, t, i) => { if (i.tag) tag(g, i.tag[0], i.tag[1] ?? 960, i.tag[2] ?? 130, pop(t, i.tag[3] ?? 0.3), { size: i.tag[4] ?? 70, bg: i.tag[5] }); if (i.big) big(g, i.big[0], i.big[1] ?? 960, i.big[2] ?? 300, i.big[3] ?? 200, pop(t, i.big[4] ?? 0.3), i.big[5] || '#ffd43b'); ageTag(g, t, i); };
const K = {
  cls(g, t, i) { cam(g, t, i.cam || [[0, 960, 540, 1.0], [i.dur, 960, 530, 1.06]], (g) => { A.classroom(g, t, { board: i.board }); people(g, t, i.figs); if (i.desks) A.deskRow(g, i.desks); }); tags(g, t, i); vignette(g, 0.35); },
  gate(g, t, i) { cam(g, t, i.cam || [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.06]], (g) => { A.gate(g, t, i.o || {}); people(g, t, i.figs); }); tags(g, t, i); vignette(g, 0.4); },
  court(g, t, i) { cam(g, t, i.cam || [[0, 960, 540, 1.0], [i.dur, 960, 530, 1.07]], (g) => { A.courtyard(g, t, i.o || {}); people(g, t, i.figs); }); tags(g, t, i); vignette(g, 0.35); },
  room(g, t, i) { cam(g, t, i.cam || [[0, 960, 560, 1.0], [i.dur, 960, 550, 1.06]], (g) => { A.room(g, t, i.o || {}); people(g, t, i.figs); if (i.dast) A.dastarkhan(g, t); }); tags(g, t, i); vignette(g, 0.38); },
  food(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 560, 1.1]], (g) => A.foodInsert(g, t, i.dish)); tags(g, t, i); vignette(g, 0.35); },
  clock(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.08]], (g) => A.clockNight(g, t)); tags(g, t, i); vignette(g, 0.5); },
  globe(g, t, i) { g.fillStyle = '#0d1530'; g.fillRect(0, 0, 1920, 1080); cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.08]], (g) => { for (let k = 0; k < 120; k++) el(g, (k * 397) % 1920, (k * 211) % 1080, 2, 2, 'rgba(255,255,255,.5)', 0); const pr = globe(g, 960, 560, 440, (i.lon ?? 66) + t * (i.spin ?? 0), i.lat ?? 30, { hl: i.hl }); if (i.pin) { const [x, y, c] = pr(...i.pin); if (c > 0) pin(g, x, y, t, 0.4, i.pinLabel, { ring: true, size: 60 }); } }); tags(g, t, i); vignette(g, 0.4); },
  title(g, t, i) { g.fillStyle = '#1a1420'; g.fillRect(0, 0, 1920, 1080); cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.05]], (g) => { A.courtyard(g, t, { night: true, kites: false }); }); g.save(); g.fillStyle = 'rgba(10,10,20,.45)'; g.fillRect(0, 0, 1920, 1080); g.restore(); big(g, 'ЧТО ЕСЛИ БЫ ТЫ РОДИЛАСЬ', 960, 380, 120, pop(t, 0.1), '#ffffff'); big(g, 'ДЕВОЧКОЙ В АФГАНИСТАНЕ?', 960, 540, 120, pop(t, 0.4), '#ffd43b'); vignette(g, 0.5); },
  card(g, t, i) { typeCard(g, [{ t: i.text, at: 0.15, y: 580, size: 100 }], t); if (i.age) tag(g, i.age, 960, 400, pop(t, 0.05), { size: 90, bg: '#ffd43b' }); },
};
for (const s of E.shots || []) { const f = K[(s.params || {}).k]; if (f) registerShot(s.id, { draw: (g, t, info) => f(g, t, info) }); }
