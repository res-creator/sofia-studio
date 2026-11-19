// Кадры выпуска «Девочка в Афганистане»: params.k = вид кадра.
import { E, registerShot } from '/engine/core.js';
import { fig, SK, cam, vignette, typeCard, ln, el, bx, pg, fo, glow, blob, clamp, ease, lerp, htxt, OL, vg, baby, notes, pen } from '../lib/pro.js';
import * as A from '../lib/afg.js';
import { tag, big, pop, globe, pin, worldMap, mapProj, route } from '/projects/remote/scenes/lib/sets.js';
import { subscribe } from '/projects/remote/scenes/lib/sets2.js';
import * as B from '../lib/afg2.js';

const SKA = '#e2b48a';
export const C = {
  girl: { hair: 'none', scarf: '#f6f4ee', body: 'dress', coat: '#26262c', shirt: '#26262c', skin: SKA, seed: 3, brow: 6 },
  teacher: { hair: 'none', scarf: '#3a6aa8', body: 'dress', coat: '#5a4a6a', shirt: '#5a4a6a', glasses: true, skin: SK.a, seed: 5 },
  brother: { hair: 'side', hairC: '#2a2320', body: 'perahan', coat: '#8aa0b8', vest: '#3a3f4a', skin: SKA, seed: 6 },
  mother: { hair: 'none', scarf: '#b44a6a', scarfLong: true, body: 'dress', coat: '#7a3a5a', shirt: '#7a3a5a', skin: SKA, seed: 7 },
  father: { hair: 'none', body: 'perahan', coat: '#d8d4c4', vest: '#4a4a3a', pakol: '#8a7a5a', beard: true, beardC: '#2a2320', skin: SK.b, seed: 8 },
  granny: { hair: 'none', scarf: '#f2f2ec', scarfLong: true, body: 'dress', coat: '#3a3a4a', shirt: '#3a3a4a', skin: SK.c, seed: 9, brow: 5 },
  aunt: { hair: 'none', scarf: '#3a8a7a', body: 'dress', coat: '#4a6a8a', shirt: '#4a6a8a', skin: SKA, seed: 10 },
  heroine: { hair: 'none', scarf: '#6a8ac8', body: 'dress', coat: '#3a4a7a', shirt: '#3a4a7a', skin: SKA, seed: 3, brow: 6 },
  heroOld: { hair: 'none', scarf: '#e8e4f0', scarfLong: true, body: 'dress', coat: '#4a4a6a', shirt: '#4a4a6a', skin: SKA, seed: 3, brow: 5, glasses: true },
  student70: { hair: 'bob', hairC: '#3a2a20', body: 'dress', coat: '#4a7a9a', shirt: '#e9e4da', skin: SK.a, seed: 21 },
  mstudent: { hair: 'side', hairC: '#2a2320', body: 'perahan', coat: '#e9e4da', vest: '#3a4a5a', skin: SK.b, seed: 22 },
  husband: { hair: 'side', hairC: '#2a2320', body: 'perahan', coat: '#b8c8d8', vest: '#5a4a3a', beard: true, beardC: '#2a2320', skin: SKA, seed: 23 },
  neighbor: { hair: 'none', scarf: '#c8853a', body: 'dress', coat: '#6a3a2a', shirt: '#6a3a2a', skin: SK.b, seed: 24 },
  player: { hair: 'none', scarf: '#2a2a33', body: 'tee', coat: '#c8453a', skin: SKA, seed: 25 },
  kid: { hair: 'curly', hairC: '#2a2320', body: 'perahan', coat: '#c8a24a', skin: SK.b, seed: 12 },
};
const HOLD = { baby, notes, pen };
const people = (g, t, list) => (list || []).forEach(([x, y, s, who, o], k) => { const oo = { ...C[who], ...(o || {}) }; if (typeof oo.holdR === 'string') oo.holdR = HOLD[oo.holdR]; fig(g, x, y, s, oo, t + k * 0.37); });
// tOff: под-шот (длинный кадр, разрезанный build.py) продолжает анимацию с того места, где остановился предыдущий, а не перезапускает её
const TT = (t, i) => t + (i.tOff || 0);
const ageTag = (g, t, i) => { if (i.age) tag(g, i.age, 200, 120, pop(TT(t, i), 0.1), { size: 70, bg: '#ffd43b', rot: -0.04 }); };
const tags = (g, t0, i) => { const t = TT(t0, i); if (i.tag) tag(g, i.tag[0], i.tag[1] ?? 960, i.tag[2] ?? 130, pop(t, i.tag[3] ?? 0.3), { size: i.tag[4] ?? 70, bg: i.tag[5] }); if (i.big) big(g, i.big[0], i.big[1] ?? 960, i.big[2] ?? 300, i.big[3] ?? 200, pop(t, i.big[4] ?? 0.3), i.big[5] || '#ffd43b'); ageTag(g, t, i); };
const K = {
  cls(g, t, i) { cam(g, t, i.cam || [[0, 960, 540, 1.0], [i.dur, 960, 530, 1.06]], (g) => { A.classroom(g, t, { board: i.board }); people(g, t, i.figs); if (i.desks) A.deskRow(g, i.desks); }); tags(g, t, i); vignette(g, 0.35); },
  gate(g, t, i) { cam(g, t, i.cam || [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.06]], (g) => { A.gate(g, t, i.o || {}); people(g, t, i.figs); }); tags(g, t, i); vignette(g, 0.4); },
  court(g, t, i) { cam(g, t, i.cam || [[0, 960, 540, 1.0], [i.dur, 960, 530, 1.07]], (g) => { A.courtyard(g, t, i.o || {}); people(g, t, i.figs); }); tags(g, t, i); vignette(g, 0.35); },
  room(g, t, i) { cam(g, t, i.cam || [[0, 960, 560, 1.0], [i.dur, 960, 550, 1.06]], (g) => { A.room(g, t, i.o || {}); people(g, t, i.figs); if (i.dast) A.dastarkhan(g, t); }); tags(g, t, i); vignette(g, 0.38); },
  food(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 560, 1.1]], (g) => A.foodInsert(g, t, i.dish)); tags(g, t, i); vignette(g, 0.35); },
  clock(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.08]], (g) => A.clockNight(g, t)); tags(g, t, i); vignette(g, 0.5); },
  globe(g, t, i) { g.fillStyle = '#0d1530'; g.fillRect(0, 0, 1920, 1080); cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.08]], (g) => { for (let k = 0; k < 120; k++) el(g, (k * 397) % 1920, (k * 211) % 1080, 2, 2, 'rgba(255,255,255,.5)', 0); const pr = globe(g, 960, 560, 440, (i.lon ?? 66) + t * (i.spin ?? 0), i.lat ?? 30, { hl: i.hl }); if (i.pin) { const [x, y, c] = pr(...i.pin); if (c > 0) pin(g, x, y, t, 0.4, i.pinLabel, { ring: true, size: 60 }); } }); tags(g, t, i); vignette(g, 0.4); },
  title(g, t, i) { g.fillStyle = '#1a1420'; g.fillRect(0, 0, 1920, 1080); cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.05]], (g) => { A.courtyard(g, t, { night: true, kites: false }); }); g.save(); g.fillStyle = 'rgba(10,10,20,.45)'; g.fillRect(0, 0, 1920, 1080); g.restore(); if (i.end) { big(g, 'МЫСЛЕННЫЙ', 960, 380, 150, pop(t, 0.1), '#ffffff'); big(g, 'ЭКСПЕРИМЕНТ', 960, 560, 150, pop(t, 0.4), '#ffd43b'); } else { big(g, 'ЧТО ЕСЛИ БЫ ТЫ РОДИЛАСЬ', 960, 380, 120, pop(t, 0.1), '#ffffff'); big(g, 'ДЕВОЧКОЙ В АФГАНИСТАНЕ?', 960, 540, 120, pop(t, 0.4), '#ffd43b'); } vignette(g, 0.5); },
  set(g, t, i) { cam(g, t, i.cam || [[0, 960, 540, 1.0], [i.dur, 960, 530, 1.07]], (g) => { const f = B[i.set] || A[i.set]; f(g, TT(t, i), i.o || {}); (i.rehal || []).forEach(([x, y, s2]) => B.rehal(g, x, y, s2)); people(g, t, i.figs); if (i.dast) A.dastarkhan(g, t); if (i.desks) A.deskRow(g, i.desks); }, i.shake || 0); if (i.old) B.oldPhoto(g, t); tags(g, t, i); if (i.sub != null) subscribe(g, t, i.sub); vignette(g, i.vig ?? 0.38); },
  pair(g, t, i) { [0, 1].forEach((k) => { g.save(); g.beginPath(); g.rect(k * 966, 0, 954, 1080); g.clip(); g.translate(k * 966 - 480, 0); const P = i.pp[k]; cam(g, t, [[0, 960, 560, 1.05], [i.dur, 960, 550, 1.1]], (g) => { (B[P.set] || A[P.set])(g, t, P.o || {}); people(g, t, P.figs); }); if (P.old) { g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = 'rgba(150,110,60,.85)'; g.fillRect(-500, 0, 2000, 1080); g.restore(); } g.restore(); }); g.fillStyle = '#111'; g.fillRect(954, 0, 12, 1080); tag(g, i.labels[0], 480, 120, pop(t, 0.2), { size: 74 }); tag(g, i.labels[1], 1440, 120, pop(t, 0.5), { size: 74, bg: '#ffd43b' }); vignette(g, 0.35); },
  icons(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.05]], (g) => B.icons(g, TT(t, i), i.n, i.rows, i.frac, { col: i.col })); tags(g, t, i); vignette(g, 0.3); },
  years(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 1000, 540, 1.06]], (g) => B.years(g, TT(t, i), i.a, i.b)); tags(g, t, i); vignette(g, 0.4); },
  timeline(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.05]], (g) => B.timeline(g, TT(t, i), i.items)); tags(g, t, i); vignette(g, 0.3); },
  map(g, t, i) { const pr = mapProj(i.view); cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.06]], (g) => { worldMap(g, t, { view: i.view, labels: i.labels }); (i.routes || []).forEach(([a, b, at, lab]) => { const p0 = pr(...a), p1 = pr(...b); route(g, p0[0], p0[1], p1[0], p1[1], t, at, 0.9, lab, { arc: 0.25 }); }); (i.pins || []).forEach(([ll, at, lab]) => { const p = pr(...ll); pin(g, p[0], p[1], t, at, lab, { size: 60 }); }); }); tags(g, t, i); vignette(g, 0.35); },
  cover(g, t, i) { if (i.b) { cam(g, t, [[0, 960, 540, 1.0], [1, 960, 540, 1.0]], (g) => { B.bricked(g, 2.0, { k0: 0 }); }); g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(700, 0, 1300, 1080); gr.addColorStop(0, 'rgba(255,220,150,0)'); gr.addColorStop(0.5, 'rgba(255,220,150,.35)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(900, 300); g.lineTo(1050, 300); g.lineTo(700, 1080); g.lineTo(380, 1080); g.closePath(); g.fill(); g.restore(); fig(g, 520, 1500, 1.9, { ...C.girl, expr: 'sad', look: 1, lookY: -0.6, turn: 0.4, noShadow: true }, 1.0); big(g, 'ДАЖЕ', 1460, 700, 200, 1, '#ffffff'); big(g, 'ОКНА', 1460, 900, 230, 1, '#ffd43b'); vignette(g, 0.35); return; }
    const bg = g.createLinearGradient(0, 0, 1920, 1080); bg.addColorStop(0, '#f6e7c8'); bg.addColorStop(1, '#e8c890'); g.fillStyle = bg; g.fillRect(0, 0, 1920, 1080); glow(g, 600, 400, 700, '255,240,200', 0.6);
    bx(g, 690, 120, 360, 900, '#3a7a9a', 10, 8, 0.15); bx(g, 718, 150, 304, 380, '#4a8aaa', 6, 4); bx(g, 718, 560, 304, 420, '#4a8aaa', 6, 4); ln(g, [[690, 600], [1050, 640]], 12, '#7a7a7a'); ln(g, [[690, 640], [1050, 600]], 12, '#7a7a7a'); bx(g, 830, 590, 80, 90, '#c8a23a', 14, 6); g.beginPath(); g.arc(870, 590, 30, Math.PI, 0); g.lineWidth = 12; g.strokeStyle = OL; g.stroke();
    fig(g, 380, 1300, 1.95, { ...C.girl, expr: 'focus', look: 0.3, pose: [[-100, -175, 1], [70, -260, -1]], holdR: notes, noShadow: true }, 1.0);
    big(g, 'ТЕБЕ 12.', 1490, 380, 210, 1, '#ffffff'); big(g, 'ВСЁ.', 1490, 660, 320, 1, '#e2483a'); vignette(g, 0.25); },
  card(g, t, i) { typeCard(g, [{ t: i.text, at: 0.15, y: 580, size: 100 }], t); if (i.age) tag(g, i.age, 960, 400, pop(t, 0.05), { size: 90, bg: '#ffd43b' }); },
};
for (const s of E.shots || []) { const f = K[(s.params || {}).k]; if (f) registerShot(s.id, { draw: (g, t, info) => f(g, t, info) }); }
