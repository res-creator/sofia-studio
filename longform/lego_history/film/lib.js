// LEGO film: shared shot library (film-local; uses figmakit/lib/scene.js + puppet.js unchanged).
//   assets: plates (art/cache/backgrounds, x1.875), props (x1.5), extras (full-body pose sprites), puppets (art/cache/chars, x1.6)
//   place(): sprite drawn INTO a plate (art/integrate.js: cast + contact shadow, plate light, colour match, haze by depth)
//   actor(): v6 puppet with the plate's colour match + a soft shadow on the wall behind
//   card(): chapter title card · stat(): big number/date type · town(): the toy-town motif on the table plate (P5)
//   chapter(): word timings, sfx/music cue collector, render CLI (node episode.js T | still t,.. out | frame t out | video out | cues)
const S = require('../../figmakit/lib/scene.js');
const { Puppet } = require('../../figmakit/lib/puppet.js');
const I = require('../art/integrate.js');
const { loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path'), fs = require('fs');
const ART = path.join(__dirname, '../art'), A = { plate: {}, prop: {}, x: {}, ch: {} };
const { clamp, lerp, ss, ease, hash } = S;
const W = S.W, H = S.H, F = '"Inter Display", Inter, sans-serif';

// ---------- looks: one light/colour setting per plate ----------
Object.assign(I.LOOKS, {
  workshop:  { warm: 'rgba(255,190,110,0.16)', shade: 'rgba(60,30,10,0.30)', haze: '220,170,110', filter: 'saturate(0.84) sepia(0.12) contrast(0.95)', shadow: 'rgba(50,24,6,', skew: 1.0, lay: -0.06 },
  factory47: { warm: 'rgba(255,200,130,0.14)', shade: 'rgba(40,30,20,0.30)', haze: '210,180,140', filter: 'saturate(0.82) sepia(0.10) contrast(0.95)', shadow: 'rgba(40,24,10,', skew: 0.9, lay: -0.06 },
  office50:  { warm: 'rgba(255,190,110,0.16)', shade: 'rgba(30,30,50,0.28)', haze: '200,170,140', filter: 'saturate(0.84) sepia(0.10) contrast(0.95)', shadow: 'rgba(40,24,10,', skew: 0.7, lay: -0.05 },
  night:     { warm: 'rgba(255,140,60,0.10)', shade: 'rgba(10,20,50,0.40)', haze: '40,60,100', filter: 'saturate(0.7) brightness(0.62) contrast(0.95)', shadow: 'rgba(5,8,20,', skew: 0.5, lay: -0.05 },
  store:     { warm: 'rgba(255,240,220,0.10)', shade: 'rgba(30,40,70,0.22)', haze: '220,225,235', filter: 'saturate(0.92) contrast(0.96)', shadow: 'rgba(20,20,40,', skew: 0.2, lay: -0.04 },
  board:     { warm: 'rgba(255,230,200,0.10)', shade: 'rgba(30,35,50,0.26)', haze: '210,215,220', filter: 'saturate(0.88) contrast(0.95)', shadow: 'rgba(20,18,20,', skew: 0.3, lay: -0.05 },
  studio:    { warm: 'rgba(255,230,200,0.12)', shade: 'rgba(30,35,50,0.24)', haze: '220,220,215', filter: 'saturate(0.9) contrast(0.95)', shadow: 'rgba(25,22,20,', skew: 0.6, lay: -0.05 },
  factory:   { warm: 'rgba(230,240,255,0.10)', shade: 'rgba(20,30,50,0.26)', haze: '200,210,225', filter: 'saturate(0.88) contrast(0.95)', shadow: 'rgba(15,18,28,', skew: 0.3, lay: -0.05 },
  park:      { warm: 'rgba(255,215,150,0.14)', shade: 'rgba(30,40,60,0.26)', haze: '220,215,200', filter: 'saturate(0.9) contrast(0.96)', shadow: 'rgba(30,30,40,', skew: 1.1, lay: -0.07 },
  hall:      { warm: 'rgba(255,200,130,0.14)', shade: 'rgba(30,20,30,0.28)', haze: '180,150,120', filter: 'saturate(0.86) sepia(0.06) contrast(0.95)', shadow: 'rgba(30,15,10,', skew: 0.2, lay: -0.04 },
  cinema:    { warm: 'rgba(255,190,110,0.16)', shade: 'rgba(15,20,45,0.36)', haze: '60,50,70', filter: 'saturate(0.82) brightness(0.86) contrast(0.95)', shadow: 'rgba(5,5,15,', skew: 0.4, lay: -0.05 },
  office01:  { warm: 'rgba(255,190,110,0.16)', shade: 'rgba(30,30,50,0.28)', haze: '220,190,150', filter: 'saturate(0.86) sepia(0.08) contrast(0.95)', shadow: 'rgba(40,24,10,', skew: 0.8, lay: -0.06 },
});
const PLATE_LOOK = { p1_workshop: 'workshop', p2_factory1947: 'factory47', p3_office1950s: 'office50', p4_warehouse1960_night: 'night', p5_tabletop: 'table', p6_superstore: 'store',
  p7_boardroom: 'board', p8_studio: 'studio', p9_warehouse: 'warehouse', p10_factory_modern: 'factory', p11_parkgate: 'park', p12_convention: 'hall', p13_cinema: 'cinema', p14_office2001: 'office01' };

// ---------- assets ----------
async function img(p, pre = 1) { const im = await loadImage(p); im.pre = pre; return im; }
async function load() {
  for (const f of fs.readdirSync(path.join(ART, 'backgrounds'))) { const n = f.slice(0, -4), c = path.join(ART, 'cache/backgrounds', f); A.plate[n] = await img(fs.existsSync(c) ? c : path.join(ART, 'backgrounds', f)); }
  for (const f of fs.readdirSync(path.join(ART, 'props'))) { const n = f.slice(0, -4), c = path.join(ART, 'cache/props', f); A.prop[n] = await img(fs.existsSync(c) ? c : path.join(ART, 'props', f), fs.existsSync(c) ? 1.5 : 1); }
  for (const f of fs.readdirSync(path.join(ART, 'extras'))) A.x[f.slice(2, -4)] = await img(path.join(ART, 'extras', f));
  for (const n of ['olekirk', 'godtfred', 'owner', 'outsider']) { const c = path.join(ART, 'cache/chars', n), d = fs.existsSync(c) ? c : path.join(ART, 'characters', n);
    const cfg = require(path.join(d, 'character.js')); A.ch[n] = await Puppet.load(cfg, d); A.ch[n].K = cfg.K || 1; }
}
const prop = n => { if (!A.prop[n]) throw new Error('no prop ' + n); return A.prop[n]; };
const size = (im, s) => [im.width / im.pre * s, im.height / im.pre * s];

// ---------- drawing ----------
// plates with a filter/blur are baked once per (plate, quantized filter) and re-used (a full-plate filter per frame is the render bottleneck)
const PCACHE = new Map(); const { createCanvas } = require('@napi-rs/canvas');
function plate(ctx, name, o = {}) {
  if (!o.blur && !o.filter) return S.plate(ctx, A.plate[name]);
  const f = `${(o.filter || '').replace(/(\d*\.\d+)/g, m => (Math.round(+m * 40) / 40).toFixed(3))} ${o.blur ? `blur(${Math.round(o.blur * 2) / 2}px)` : ''}`.trim(), key = name + '|' + f;
  let cv = PCACHE.get(key);
  if (!cv) { const im = A.plate[name]; cv = createCanvas(im.width, im.height); const c = cv.getContext('2d'); c.filter = f; c.drawImage(im, 0, 0);
    if (PCACHE.size > 24) PCACHE.delete(PCACHE.keys().next().value); PCACHE.set(key, cv); }
  ctx.drawImage(cv, 0, 0, S.PW, S.PH); }
function place(ctx, n, x, y, s, o = {}) { const im = typeof n === 'string' ? (A.prop[n] || A.x[n]) : n; if (!im) throw new Error('no sprite ' + n); return I.place(ctx, im, x, y, s, o); }
// puppet: (x, y) = neck point; s = scale in plate px per source px (same as the un-upscaled parts)
function actor(ctx, who, x, y, s, st, t, o = {}) { const P = A.ch[who], L = I.LOOKS[o.look || 'table'];
  if (o.wall !== undefined) { ctx.save(); ctx.globalAlpha = o.wallA ?? 0.2; ctx.filter = `blur(${22 * s}px)`; ctx.fillStyle = '#140a04';
    ctx.beginPath(); ctx.ellipse(x - o.wall, y + 170 * s, 250 * s, 360 * s, 0, 0, 6.28); ctx.fill(); ctx.restore(); }
  // draw the puppet unfiltered into a screen-size layer (same transform), then colour-match the whole layer ONCE
  // (a filter on the main context would be re-run for each of the ~200 strips of a bending arm)
  ALAY = ALAY || createCanvas(S.W, S.H); const lc = ALAY.getContext('2d'); lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, S.W, S.H);
  lc.setTransform(ctx.getTransform()); if (o.flip) { lc.translate(x, 0); lc.scale(-1, 1); lc.translate(-x, 0); }
  P.draw(lc, x, y, s / P.K, st, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= o.a ?? 1; ctx.filter = `${L.filter} ${o.extra || ''}`; ctx.drawImage(ALAY, 0, 0); ctx.restore(); }
let ALAY = null;
const rest = (o = {}) => Object.assign({ head: 'neutral', tilt: 0, nod: 0 }, o);

// camera keys clamped to the plate (never show beyond the painted edge)
function cam(keys, lt) { const c = S.camKeys(keys, lt), hw = 768 / c.z, hh = 432 / c.z; c.x = clamp(c.x, hw, 1536 - hw); c.y = clamp(c.y, hh, 864 - hh); return c; }
// fire: flickering flames over a region, embers, dark smoke (night scenes)
let FIRECV = null;
function fireFX(c0, t, f, x0, x1, ybase, hgt = 220) { if (f <= 0) return;
  // flames are painted into an offscreen layer, faded toward the base (they come OUT of the building), blurred, then screened on
  FIRECV = FIRECV || require('@napi-rs/canvas').createCanvas(1536, 864); let c = FIRECV.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 1536, 864); c.save();
  // flame tongues: tapered, wavy, layered (dark red back -> orange -> yellow core), each flickers on its own
  const tongue = (x, w, hh, ph, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - w, ybase);
    const tipx = x + Math.sin(t * 5 + ph) * w * 0.6, tipy = ybase - hh;
    c.bezierCurveTo(x - w * 1.1, ybase - hh * 0.45, tipx - w * 0.5 + Math.sin(t * 7 + ph) * w * 0.3, ybase - hh * 0.7, tipx, tipy);
    c.bezierCurveTo(tipx + w * 0.4, ybase - hh * 0.65, x + w * 1.1 + Math.sin(t * 6 + ph) * w * 0.2, ybase - hh * 0.4, x + w, ybase); c.fill(); };
  c.filter = 'blur(2px)';
  for (const [k, col, sc] of [[0, 'rgba(170,30,10,0.75)', 1.15], [1, 'rgba(255,110,20,0.85)', 0.95], [2, 'rgba(255,200,80,0.9)', 0.62], [3, 'rgba(255,245,200,0.85)', 0.32]])
    for (let i = 0; i < 14; i++) { const h = hash(i * 4.1 + k), x = lerp(x0, x1, (i + 0.5 + (h - 0.5) * 0.6) / 14), fl = 0.75 + 0.25 * Math.sin(t * (8 + h * 6) + i * 2.1 + k);
      tongue(x, (x1 - x0) / 14 * 0.75 * sc, hgt * (0.45 + 0.75 * h) * fl * f * sc, i * 1.7 + k, col); }
  c.filter = 'none'; c.globalCompositeOperation = 'destination-in'; const mg = c.createLinearGradient(0, ybase, 0, ybase - hgt * 0.5);
  mg.addColorStop(0, 'rgba(0,0,0,0)'); mg.addColorStop(1, 'rgba(0,0,0,1)'); c.fillStyle = mg; c.fillRect(0, 0, 1536, 864); c.globalCompositeOperation = 'source-over'; c.restore();
  c0.save(); c0.globalCompositeOperation = 'screen'; c0.filter = 'blur(5px)'; c0.drawImage(FIRECV, 0, 0); c0.filter = 'blur(1.5px)'; c0.globalAlpha = 0.6; c0.drawImage(FIRECV, 0, 0); c0.restore();
  c = c0; c.save();
  c.globalCompositeOperation = 'lighter'; S.glow(c, (x0 + x1) / 2, ybase - hgt * 0.4, (x1 - x0) * 0.9, 'rgba(255,110,30,1)', 0.35 * f); c.globalCompositeOperation = 'source-over';
  c.filter = 'blur(10px)'; for (let i = 0; i < 9; i++) { const ph = (t * 0.12 + i / 9) % 1, x = lerp(x0, x1, hash(i * 2.7)) + ph * 120, y = ybase - hgt - ph * 380;
    c.fillStyle = `rgba(28,26,30,${0.55 * Math.sin(ph * Math.PI) * f})`; c.beginPath(); c.arc(x, y, 50 + ph * 110, 0, 6.28); c.fill(); }
  c.filter = 'none'; for (let i = 0; i < 50; i++) { const h = hash(i * 3.7), ph = (t * (0.35 + h * 0.3) + h) % 1, x = lerp(x0, x1, hash(i * 1.3)) + Math.sin(t * 2 + i) * 25 * ph, y = ybase - ph * (hgt + 300);
    c.fillStyle = `rgba(255,${150 + 80 * h | 0},60,${(1 - ph) * f})`; c.fillRect(x, y, 3, 3); }
  c.restore(); }
// a patent-style sheet drawn in code: cream paper, ruled lines, a brick drawing (no readable text)
function patentSheet(c, x, y, w, a = 1, r = -0.06) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(r); const h = w * 1.3;
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.filter = 'blur(8px)'; c.fillRect(-w / 2 + 10, -h / 2 + 14, w, h); c.filter = 'none';
  c.fillStyle = '#F1E6CC'; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = '#7A5C3A'; c.lineWidth = 2; c.strokeRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24);
  c.strokeStyle = 'rgba(80,60,40,0.55)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-w / 2 + 30, -h / 2 + 40 + i * 16); c.lineTo(w / 2 - 30 - (i % 3) * 30, -h / 2 + 40 + i * 16); c.stroke(); }
  c.strokeStyle = '#2D4B7A'; c.lineWidth = 3; const bw = w * 0.62, bh = bw * 0.36, by = 10;   // the brick, side section with tubes
  c.strokeRect(-bw / 2, by, bw, bh); for (let i = 0; i < 4; i++) { c.strokeRect(-bw / 2 + bw * (0.08 + i * 0.235), by - bh * 0.22, bw * 0.13, bh * 0.22); }
  for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-bw / 2 + bw * (0.25 + i * 0.25), by + bh * 0.6, bh * 0.22, 0, 6.28); c.stroke(); }
  c.fillStyle = '#B3261E'; c.beginPath(); c.arc(w / 2 - 50, h / 2 - 55, 26, 0, 6.28); c.fill(); c.restore(); }
// ---------- type ----------
function stat(ctx, s, x, y, a, size = 84, col = '#FFF4DC', o = {}) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(x, y + (1 - ease.out(clamp(a))) * 22);
  const sc = o.pop ? 0.85 + 0.15 * ease.back(clamp(a)) : 1; ctx.scale(sc, sc); ctx.font = `900 ${size}px ${F}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = 'rgba(20,12,6,0.85)'; ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); }
function small(ctx, s, x, y, a, size = 34, col = '#F6EBD3') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); ctx.font = `800 ${size}px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = size * 0.18; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(20,12,6,0.8)'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); }
// chapter card: the chapter's first plate blurred + darkened, a classic brick drops onto a studded line, title + years
function card(ctx, t, lt, plateName, num, title, years) {
  const cam = { x: 768, y: 432, z: 1.08 + lt * 0.02 }; S.world(ctx, cam, 1, c => plate(c, plateName, { blur: 7, filter: 'brightness(0.42) saturate(0.7)' }));
  const a = ss(lt / 0.35) * (1 - ss((lt - 3.0) / 0.4));
  ctx.save(); ctx.globalAlpha = a; small(ctx, `CHAPTER ${num}`, W / 2, 330, 1, 30, '#F2C14E');
  stat(ctx, title.toUpperCase(), W / 2, 450, ss((lt - 0.15) / 0.4), 120, '#FFF4DC'); small(ctx, years, W / 2, 560, ss((lt - 0.4) / 0.4), 44);
  const u = clamp((lt - 0.55) / 0.35), by = lerp(-200, 690, ease.out(u)) + (u >= 1 ? Math.sin(clamp((lt - 0.9) / 0.25) * Math.PI) * -10 : 0);
  if (lt > 0.55) S.sprite(ctx, prop('brick_red_2x4'), W / 2, by + 60, 0.42, { pre: prop('brick_red_2x4').pre, ay: 1 });
  ctx.restore(); }

// ---------- toy town on the table plate (P5): perspective, town states ----------
const VX = 722, VY = 200, tx = (u, y) => VX + u * 1.83 * (y - VY), sc = (y, k = 1) => 0.0018 * (y - VY) * k, dep = y => clamp((y - 300) / 420);
const TOWN = [
  ['town_lighthouse', -0.62, 342, 1.0], ['town_house_red', -0.22, 348, 0.85], ['town_tree', 0.06, 344, 0.75], ['town_house_yellow', 0.36, 352, 0.9], ['town_tree', 0.60, 357, 0.7],
  ['town_tree', -0.72, 402, 0.8], ['town_shop', -0.44, 414, 1, 1], ['town_police', -0.02, 425, 1], ['town_tree', 0.24, 418, 0.75], ['town_firestation', 0.52, 442, 1],
  ['town_house_yellow', -0.60, 500, 1, 1], ['town_tree', -0.34, 488, 0.8], ['town_tree', 0.40, 503, 0.85], ['town_house_red', 0.68, 516, 1]];
const BH = { town_police: 428, town_shop: 325, town_firestation: 432, town_house_yellow: 429, town_house_red: 396, town_lighthouse: 420, town_tree: 347 };
// o.n: how many buildings are built (0..14, fractional = the next one is dropping), o.items: extra draw items {y, d(ctx)}, o.dark 0..1, o.flip
function town(ctx, lt, o = {}) { const n = o.n ?? TOWN.length, items = [];
  TOWN.forEach(([nm, u, y, k, fl], i) => { if (i >= Math.ceil(n)) return; const f = i < Math.floor(n) ? 1 : n - Math.floor(n), dy = -(1 - ease.out(f)) * 120;
    if (o.skip && o.skip.includes(i)) return;
    items.push({ y, d: c => I.place(c, prop(nm), tx(u, y), y + dy, sc(y, k), { depth: dep(y), flip: !!fl, a: Math.min(1, f * 4), noShadow: f < 0.9 }) }); });
  (o.items || []).forEach(i => items.push(i));
  items.sort((a, b) => a.y - b.y).forEach(i => i.d(ctx));
}
const roof = (i, lift = 0.78) => { const [nm, u, y, k] = TOWN[i]; return [tx(u, y), y - (BH[nm] || 400) * sc(y, k) * lift, y]; };
function townLights(ctx, t, on = 1) { if (on <= 0) return; // little warm windows glowing (dusk / recovery)
  TOWN.forEach(([nm, u, y, k], i) => { if (nm === 'town_tree' || hash(i * 7) > on) return; const [x, yy] = [tx(u, y), y - (BH[nm] || 400) * sc(y, k) * 0.45];
    S.glow(ctx, x, yy, 40 * sc(y, k) * 3, 'rgba(255,200,110,1)', 0.35 * (0.8 + 0.2 * Math.sin(t * 3 + i))); }); }

// ---------- chapter runner ----------
function chapter(mod, dir, build) {
  const CU = JSON.parse(fs.readFileSync(path.join(dir, 'cues.json'))), T = CU.T + (CU.tail || 0);
  const at0 = S.words(dir, 0), L = Object.fromEntries(CU.vo);
  const at = (id, w, n = 0) => { try { return at0(id, w, n); } catch (e) { console.error('WARN', e.message); return L[id]; } };
  const sfx = [], music = [];
  const fx = (name, t, g = 1) => { if (t >= 0 && t < T) sfx.push([name, +t.toFixed(3), g]); };
  const shots = build({ at, L, T, fx, music, CU });
  const mode = process.argv[2];
  if (mode === 'cues') { CU.sfx = sfx.sort((a, b) => a[1] - b[1]); CU.music = { sections: music }; fs.writeFileSync(path.join(dir, 'cues.json'), JSON.stringify(CU, null, 1)); return console.log('cues', sfx.length, 'sfx', music.length, 'music'); }
  S.run({ module: mod, T, shots, load });
}
module.exports = { fireFX, patentSheet, cam, S, I, A, Puppet, load, plate, place, actor, rest, stat, small, card, town, townLights, roof, TOWN, tx, sc, dep, size, prop, chapter, clamp, lerp, ss, ease, hash, W, H, F, PLATE_LOOK };
