// Кадры выпуска: шот из story/shots.json → params.k (вид кадра) + параметры.
import { E, registerShot } from '/engine/core.js';
import { fig, SK, cam, vignette, typeCard, ln, el, bx, pg, fo, glow, blob, clamp, ease, lerp, htxt, OL } from '../lib/pro.js';
import * as Z from '../lib/sets.js';
const { tag, big, pop } = Z;

const HERO = { hair: 'side', hairC: '#4a3020', body: 'sweater', coat: '#3f8f8a', shirt: '#e9e4da', seed: 2, brow: 7 };
const PACK = { pack: '#d9822b' };
const V = (i) => ({ seed: 10 + i, skin: [SK.a, SK.b, SK.c, SK.a][i % 4], hair: ['long', 'beanie', 'side', 'bald', 'bob', 'curly'][i % 6], hairC: ['#5a3a22', '#2a2320', '#7a5a3a', '#4a3426', '#c9a46a', '#2a2320'][i % 6], hatC: ['#c8453a', '#3a6aa8', '#e0a83a'][i % 3], body: i % 6 === 0 || i % 6 === 4 ? 'dress' : 'sweater', coat: ['#b44a6a', '#4a6a9a', '#7a8a4a', '#9a6a3a', '#5a8a9a', '#a85a3a'][i % 6], beard: i % 6 === 3 });
const MET = (i) => ({ seed: 30 + i, skin: [SK.b, SK.a, SK.c][i % 3], body: 'parka', coat: '#c8453a', hair: i === 1 ? 'beanie' : 'side', hatC: '#2a3a5a', hairC: '#2a2320', fur: '#e9e2d2', patch: '#3a6aa8' });
const P = Z.mapProj;
const LL = { tristan: [-12.31, -37.07], helena: [-5.72, -15.93], gough: [-9.88, -40.35], bouvet: [3.36, -54.42], moscow: [37.62, 55.75], omsk: [73.37, 54.99] };
const ears = [[-122, -446, -1], [122, -446, 1]], palm = [[-100, -175, 1], [30, -470, -1]];

const K = {
  apt(g, t, i) { cam(g, t, i.cam || [[0, 960, 540, 1.0], [i.dur, 900, 520, 1.08]], (g) => { Z.apartment(g, t); if (i.drill) { const k = Math.sin(t * 40) * 4; big(g, 'ВЖЖЖ!', 300 + k, 600, 110, pop(t, 0.1), '#ffd43b', -0.12); ln(g, [[80, 520], [130, 600], [100, 660], [150, 740]], 5, 'rgba(60,40,30,.6)'); }
    fig(g, i.hx ?? 820, i.hy ?? 868, i.hs ?? 0.95, { ...HERO, ...(i.pack ? PACK : {}), seated: i.seated !== false && !i.stand, noShadow: i.seated !== false && !i.stand, ...(i.h || {}) }, t);
    if (i.desk !== false && !i.stand) Z.deskFront(g, t, { glow: true }); }); if (i.q) big(g, '?', 1500, 380, 260, pop(t, 0.2), '#ffd43b', 0.1); vignette(g, 0.4); },
  phone(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.1]], (g) => Z.phoneHand(g, t, i)); vignette(g, 0.45); },
  globe(g, t, i) { g.fillStyle = '#0d1530'; g.fillRect(0, 0, 1920, 1080); const R = 420; cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.08]], (g) => { for (let k = 0; k < 120; k++) el(g, (k * 397) % 1920, (k * 211) % 1080, 2, 2, 'rgba(255,255,255,.5)', 0);
      const pr = Z.globe(g, 960, 560, R, i.lon + t * (i.spin ?? 12), i.lat ?? -20);
      if (i.rings) for (let k = 0; k < 3; k++) { const r = ((t * 0.5 + k / 3) % 1); g.save(); g.globalAlpha = 1 - r; g.beginPath(); g.arc(960, 560, R + 20 + r * 260, 0, Math.PI * 2); g.lineWidth = 5; g.strokeStyle = '#ffd43b'; g.stroke(); g.restore(); }
      if (i.pin) { const [x, y, c] = pr(...i.pin); if (c > 0) Z.pin(g, x, y, t, 0.4, i.pinLabel, { ring: true, size: 54 }); } });
    if (i.q) big(g, '?', 1560, 300, 240, pop(t, 0.3), '#ffd43b', 0.1); if (i.label) tag(g, i.label, 960, 120, pop(t, 0.3), { size: 66, bg: '#ffd43b' }); vignette(g, 0.4); },
  nature(g, t, i) { cam(g, t, [[0, 960, 540, 1.05], [i.dur, 960, 520, 1.15]], (g) => Z[i.set](g, t)); tag(g, i.label, 960, 130, pop(t, 0.1), { size: 80 }); vignette(g, 0.35); },
  tri(g, t, i) { ['taiga', 'desert', 'antarctic'].forEach((s, k) => { g.save(); g.beginPath(); g.rect(k * 640 + 6, 0, 628, 1080); g.clip(); g.translate(k * 640 - 640, 0); Z[s](g, t); g.restore(); const kk = clamp((t - 0.35 - k * 0.3) / 0.25); if (kk > 0) { const cx = k * 640 + 320, cy = 540; ln(g, [[cx - 170, cy - 170], [cx - 170 + 340 * kk, cy - 170 + 340 * kk]], 34, '#e2483a'); const k2 = clamp((t - 0.6 - k * 0.3) / 0.25); if (k2 > 0) ln(g, [[cx + 170, cy - 170], [cx + 170 - 340 * k2, cy - 170 + 340 * k2]], 34, '#e2483a'); } }); g.fillStyle = '#111'; [634, 1274].forEach((x) => g.fillRect(x, 0, 12, 1080)); vignette(g, 0.35); },
  moon(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 1000, 520, 1.1]], (g) => { Z.moonSpace(g, t); const a = -2.3 + t * 0.18; Z.capsule(g, 760 + Math.cos(a) * 980, 1260 + Math.sin(a) * 980 * 0.85, 0.9, t); }); tag(g, i.label, 1250, 300, pop(t, 0.6), { size: 70, bg: '#ffd43b' }); vignette(g, 0.4); },
  title(g, t, i) { g.fillStyle = '#0b1230'; g.fillRect(0, 0, 1920, 1080); for (let k = 0; k < 160; k++) el(g, (k * 397) % 1920, (k * 211) % 1080, 2, 2, 'rgba(255,255,255,.55)', 0); Z.globe(g, 960, 1500, 900, -40 + t * 4, -10); big(g, 'ГДЕ НА ЗЕМЛЕ', 960, 300, 150, pop(t, 0.15), '#ffffff'); big(g, 'ДАЛЬШЕ ВСЕГО ОТ ЛЮДЕЙ?', 960, 470, 130, pop(t, 0.45), '#ffd43b'); vignette(g, 0.5); },
  card(g, t, i) { typeCard(g, [{ t: i.text, at: 0.15, y: 540, size: 110 }], t); },
  map(g, t, i) { const pr = P(i.view); cam(g, t, i.cam || [[0, 960, 540, 1.0], [i.dur, 960, 540, 1.08]], (g) => { Z.worldMap(g, t, { view: i.view, labels: i.labels, hl: i.hl });
      (i.routes || []).forEach(([a, b, at, lab, o]) => { const p0 = pr(...LL[a]), p1 = pr(...LL[b]); Z.route(g, p0[0], p0[1], p1[0], p1[1], t, at, 0.9, lab, o || {}); });
      (i.pins || []).forEach(([n, at, lab, o]) => { const p = pr(...LL[n]); Z.pin(g, p[0], p[1], t, at, lab, o || {}); }); }); vignette(g, 0.35); },
  island(g, t, i) { cam(g, t, [[0, 960, 500, 1.0], [i.dur, 960, 470, 1.12]], (g) => Z.islandWide(g, t, { noRunway: i.noRunway })); vignette(g, 0.35); },
  sea(g, t, i) { cam(g, t, [[0, 960, 540, 1.0], [i.dur, 960, 560, 1.06]], (g) => { Z.sea(g, t, { storm: i.storm, ship: () => Z.ship(g, i.storm ? 900 : 760 + t * 30, 700, i.storm ? 1.0 : 0.9, t, { storm: i.storm }) }); }, i.storm ? 6 : 0); if (i.days) Z.calendarDays(g, 1600, 280, Math.min(7, 1 + Math.floor(t * 2.6))); vignette(g, i.storm ? 0.55 : 0.3); },
  village(g, t, i) { cam(g, t, i.cam || [[0, 960, 560, 1.0], [i.dur, 960, 540, 1.08]], (g) => { Z.village(g, t, { sign: i.sign });
      (i.people || []).forEach(([x, y, s, n, o], k) => { const walk = o && o.walk; const xx = walk ? x + walk * t : x; fig(g, xx, y, s, { ...V(n), ...(o || {}), walk: undefined }, t + k * 0.37); });
      if (i.hero) fig(g, i.hero[0], i.hero[1], i.hero[2], { ...HERO, ...PACK, ...(i.hero[3] || {}) }, t); });
    if (i.count) { tag(g, '≈ 250 человек', 1480, 170, pop(t, i.count), { size: 80, bg: '#ffd43b' }); }
    if (i.egg) { const k = pop(t, i.egg); if (k > 0) { g.save(); g.translate(1460, 230); g.scale(k, k); el(g, 0, 0, 150, 100, '#ffffff', 5); el(g, -60, 110, 26, 18, '#ffffff', 4); el(g, -90, 150, 14, 10, '#ffffff', 3); el(g, 0, 0, 90, 56, '#fbfaf4', 3); el(g, 10, -6, 34, 30, '#f2b62a', 3); g.restore(); } }
    if (i.cross) { const k = clamp((t - i.cross) / 0.25), k2 = clamp((t - i.cross - 0.25) / 0.25); if (k > 0) ln(g, [[1260, 200], [1260 + 360 * k, 200 + 360 * k]], 36, '#e2483a'); if (k2 > 0) ln(g, [[1620, 200], [1620 - 360 * k2, 200 + 360 * k2]], 36, '#e2483a'); }
    vignette(g, 0.35); },
  station(g, t, i) { cam(g, t, [[0, 960, 520, 1.0], [i.dur, 900, 520, 1.1]], (g) => { Z.station(g, t); [[560, 760, 0.62], [760, 780, 0.66], [960, 770, 0.6]].forEach(([x, y, s], k) => fig(g, x, y, s, { ...MET(k), pose: k === 1 ? 'point' : 'idle', look: k === 0 ? 1 : -0.4 }, t + k)); }); tag(g, 'метеостанция Гоф', 960, 960, pop(t, 0.4), { size: 64 }); vignette(g, 0.35); },
};
for (const s of E.shots || []) { const p = s.params || {}; const f = K[p.k]; if (f) registerShot(s.id, { draw: (g, t, info) => f(g, t, info) }); }
