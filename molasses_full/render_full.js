// The Great Molasses Flood — full documentary renderer (1920x1080 @30fps), driven by timeline.json + plan.js
// Usage: node render_full.js still t1,t2,.. out.png | video out.mp4 t0 t1
const { createCanvas, loadImage } = require('/home/user/sofia-studio/node_modules/@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const { SHOTS, OVER } = require('./plan');
const TL = JSON.parse(fs.readFileSync(__dirname + '/timeline.json'));
const DC = JSON.parse(fs.readFileSync(__dirname + '/dc_items.json'));
const W = 1920, H = 1080, FPS = 30, TOTAL = TL.total;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = { out: u => 1 - Math.pow(1 - clamp(u), 3), in: u => Math.pow(clamp(u), 3), io: u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; } };
const lerp = (a, b, u) => a + (b - a) * u;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const C = { ink: '#0a0806', paper: '#e3d4ae', sep4: '#a8946c', amber: '#d98f2b', mol: '#3a1d0b', red: '#c0392b' };
const MONO = '"JetBrains Mono", monospace', SANS = '"Inter Display", "Inter", sans-serif', SERIF = '"Bitstream Charter", "DejaVu Serif", serif';
const COL = n => C[n] || C.paper;

function txt(ctx, s, x, y, o = {}) {
  ctx.save(); ctx.font = `${o.italic ? 'italic ' : ''}${o.w || 800} ${o.size || 60}px ${o.font || SANS}`;
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
  try { ctx.letterSpacing = (o.ls || 0) + 'px'; } catch (e) {}
  ctx.globalAlpha = o.a == null ? 1 : o.a;
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.blur || 20; ctx.shadowOffsetY = 4; }
  if (o.stroke) { ctx.lineWidth = o.sw || 6; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = o.color || C.paper; ctx.fillText(s, x, y); ctx.restore();
}
const measure = (ctx, s, size, font = SANS, w = 800, ls = 0, italic) => { ctx.save(); ctx.font = `${italic ? 'italic ' : ''}${w} ${size}px ${font}`; try { ctx.letterSpacing = ls + 'px'; } catch (e) {} const m = ctx.measureText(s).width; ctx.restore(); return m; };
const fmt = n => Math.round(n).toLocaleString('en-US');

// ---------- timeline / anchors ----------
const norm = w => w.toLowerCase().replace(/[^a-z0-9-]/g, '');
const CH = {}; TL.chapters.forEach((c, i) => { CH[c.id] = Object.assign({ n: i + 1, words: [] }, c); }); TL.words.forEach(w => CH[w.ch].words.push(w));
function anchor(ch, spec) {
  const c = CH[ch]; if (typeof spec === 'number') return c.t0 + spec; if (spec === 'start') return c.t0;
  const m = /^w:(.+?)(?:#(\d+))?$/.exec(spec); if (!m) throw new Error('bad anchor ' + spec);
  const target = norm(m[1]), nth = +(m[2] || 0); let n = 0;
  for (const w of c.words) if (norm(w.w) === target) { if (n++ === nth) return w.t0; }
  throw new Error(`anchor not found: ${ch} ${spec}`);
}
const shots = [];
for (const c of TL.chapters) for (const s of SHOTS[c.id]) shots.push(Object.assign({}, s, { ch: c.id, t0: anchor(c.id, s.at) }));
shots.sort((a, b) => a.t0 - b.t0); shots[0].t0 = 0;
shots.forEach((s, i) => { s.t1 = i + 1 < shots.length ? shots[i + 1].t0 : TOTAL; });
const overs = OVER.map(o => Object.assign({}, o, { t0: anchor(o.ch, o.at) }));
for (const s of shots) if (s.lines) for (const l of s.lines) l.t0 = anchor(s.ch, l.at);
const W_ = (ch, spec) => anchor(ch, spec);

// ---------- photos ----------
const SPECIAL = { tank: ['tank_before.jpg', 'ARCHIVAL PHOTO · THE TANK, BEFORE THE DISASTER'], after: ['boston_molasses_disaster.jpg', 'ARCHIVAL PHOTO · THE AFTERMATH, 1919'], crew: ['wreckage_elevated_tracks.jpg', 'ARCHIVAL PHOTO · THE AFTERMATH, 1919'] };
const META = {}; DC.forEach(i => META[i.id.split(':')[1]] = i);
function credit(id) {
  if (SPECIAL[id]) return SPECIAL[id][1]; const m = META[id]; if (!m) return '';
  const src = m.coll.startsWith('Boston Elevated') ? 'BOSTON CITY ARCHIVES' : 'BOSTON PUBLIC LIBRARY';
  let d = m.date || ''; const mm = /^(\w+) (\d+), (\d{4})/.exec(d); d = mm ? `${mm[1].slice(0, 3).toUpperCase()}. ${mm[2]}, ${mm[3]}` : 'CA. 1919';
  return `${src} · ${d}`;
}
const cache = new Map();
const pathOf = id => __dirname + '/photos/' + (SPECIAL[id] ? SPECIAL[id][0] : `dc_${id}.jpg`);
async function preload(t) {
  for (const s of shots) {
    const ids = [s.id, s.bg].filter(Boolean);
    const need = t >= s.t0 - 1.5 && t <= s.t1 + 0.5;
    for (const id of ids) { if (need && !cache.has(id)) cache.set(id, await loadImage(pathOf(id))); }
  }
  for (const id of [...cache.keys()]) { const used = shots.some(s => (s.id === id || s.bg === id) && t >= s.t0 - 1.5 && t <= s.t1 + 0.5); if (!used) cache.delete(id); }
}
function cover(ctx, im, x, y, w, h, zoom = 1, fx = .5, fy = .5) {
  const sc = Math.max(w / im.width, h / im.height) * zoom, sw = w / sc, sh = h / sc, sx = clamp(fx * im.width - sw / 2, 0, im.width - sw), sy = clamp(fy * im.height - sh / 2, 0, im.height - sh);
  ctx.drawImage(im, sx, sy, sw, sh, x, y, w, h);
}
function kb(s, u) { // ken burns -> zoom, fx, fy
  const fx = s.fx == null ? .5 : s.fx, fy = s.fy == null ? .5 : s.fy, e = ease.io(u);
  switch (s.kb) {
    case 'out': return [lerp(1.22, 1.04, u), fx, fy];
    case 'panL': return [1.2, lerp(fx + .12, fx - .12, e), fy];
    case 'panR': return [1.2, lerp(fx - .12, fx + .12, e), fy];
    case 'in2': return [lerp(1.0, 1.0, u), fx, fy];
    default: return [lerp(1.03, 1.2, u), fx, fy];
  }
}
function shade(ctx, a, top = 0, h = H) { ctx.fillStyle = `rgba(6,4,2,${a})`; ctx.fillRect(0, top, W, h); }
function topShade(ctx, a = .7, h = 520) { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(6,4,2,${a})`); g.addColorStop(1, 'rgba(6,4,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, h); }
function botShade(ctx, a = .75, h = 420) { const g = ctx.createLinearGradient(0, H - h, 0, H); g.addColorStop(0, 'rgba(6,4,2,0)'); g.addColorStop(1, `rgba(6,4,2,${a})`); ctx.fillStyle = g; ctx.fillRect(0, H - h, W, h); }
function creditTag(ctx, s, a = 1) { const c = credit(s); if (!c) return; txt(ctx, c, W - 70, H - 52, { size: 22, font: MONO, w: 600, ls: 3, align: 'right', color: C.sep4, a: a * .9, shadow: '#000', blur: 10 }); }
function illusTag(ctx, s = 'ILLUSTRATION · RECONSTRUCTION') { txt(ctx, s, W - 70, H - 52, { size: 22, font: MONO, w: 600, ls: 3, align: 'right', color: C.sep4, shadow: '#000', blur: 10 }); }

// ---------- shot renderers ----------
const D = {};
D.photo = (ctx, s, t) => {
  const im = cache.get(s.id), u = clamp((t - s.t0) / Math.max(.5, s.t1 - s.t0)); const [z, fx, fy] = kb(s, u);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); cover(ctx, im, 0, 0, W, H, z, fx, fy);
  if (s.dark) shade(ctx, s.dark); topShade(ctx, .35, 300); botShade(ctx, .55, 300); creditTag(ctx, s.id);
};
D.print = (ctx, s, t) => {
  const im = cache.get(s.id), u = clamp((t - s.t0) / Math.max(.5, s.t1 - s.t0));
  ctx.fillStyle = '#0b0805'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = .28; cover(ctx, im, 0, 0, W, H, 2.2, .5, .45); ctx.restore(); shade(ctx, .45);
  const pw = 1060, ph = 831, sc = 1 + u * .08; ctx.save(); ctx.translate(W / 2, H / 2 + 10); ctx.rotate(-.012); ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24; ctx.fillStyle = '#d9cdb0'; ctx.fillRect(-pw / 2 - 18, -ph / 2 - 18, pw + 36, ph + 36); ctx.shadowColor = 'transparent';
  ctx.save(); ctx.beginPath(); ctx.rect(-pw / 2, -ph / 2, pw, ph); ctx.clip();
  const z = s.kb === 'in2' ? lerp(1.15, 1.6, u) : s.kb === 'out' ? lerp(1.35, 1.0, u) : lerp(1.0, 1.25, u), fx = s.kb === 'in2' ? .62 : .6, fy = s.kb === 'in2' ? .38 : .5;
  cover(ctx, im, -pw / 2, -ph / 2, pw, ph, z, fx, fy);
  if (s.tint === 'brown') { ctx.fillStyle = 'rgba(95,46,12,.38)'; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); const r = rng(4); ctx.fillStyle = 'rgba(70,32,8,.75)'; for (let i = 0; i < 10; i++) { const x = -pw / 2 + r() * pw, ln = 120 + r() * 300 * ease.out((t - s.t0) / 2.5 + r() * .3); ctx.fillRect(x, -ph / 2 + 250 + r() * 200, 9, ln); } }
  ctx.restore(); ctx.restore();
  if (s.dark) shade(ctx, s.dark); creditTag(ctx, s.id);
};
D.fact = (ctx, s, t) => {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  if (s.bg) { const im = cache.get(s.bg), u = clamp((t - s.t0) / (s.t1 - s.t0)); cover(ctx, im, 0, 0, W, H, lerp(1.05, 1.18, u), .5, .55); shade(ctx, .8); }
  else { const g = ctx.createRadialGradient(W / 2, H * .5, 40, W / 2, H * .5, 980); g.addColorStop(0, 'rgba(120,64,20,.45)'); g.addColorStop(1, 'rgba(10,5,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(240,160,70,.07)'; ctx.lineWidth = 3; for (let i = 0; i < 14; i++) { ctx.beginPath(); for (let x = 0; x <= W; x += 40) { const y = 90 + i * 76 + Math.sin(x * .006 + t * .8 + i) * 16; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } }
  if (s.head) txt(ctx, s.head, W / 2, 150, { size: 34, font: MONO, w: 600, ls: 9, align: 'center', color: C.amber, a: ease.out((t - s.t0) / .4), shadow: '#000' });
  const gap = 22, hs = s.lines.map(l => l.size * 1.05), tot = hs.reduce((a, b) => a + b, 0) + gap * (hs.length - 1); let y = H / 2 + 30 - tot / 2;
  s.lines.forEach((l, i) => {
    y += hs[i]; const u = ease.out((t - l.t0 + .05) / .22); if (u > 0) {
      let str = l.t; if (l.count) { const v = lerp(l.count[0], l.count[1], ease.out((t - l.t0) / 1.0)); str = (l.pre || '') + fmt(v); }
      const sc = lerp(1.14, 1, u), r = rng(Math.floor(t * 30) + i); ctx.save(); ctx.translate(W / 2 + (l.shake ? (r() - .5) * 10 : 0), y - hs[i] * .3 + (l.shake ? (r() - .5) * 6 : 0)); ctx.scale(sc, sc);
      let size = l.size; const maxW = 1700, mw = measure(ctx, str, size, SANS, 800, 3); if (mw > maxW) size *= maxW / mw;
      txt(ctx, str, 0, hs[i] * .3, { size, align: 'center', color: COL(l.color), a: u, shadow: '#000', blur: 30, ls: 3 }); ctx.restore();
    }
    y += gap;
  });
};
D.quote = (ctx, s, t) => {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  if (s.bg) { const im = cache.get(s.bg), u = clamp((t - s.t0) / (s.t1 - s.t0)); cover(ctx, im, 0, 0, W, H, lerp(1.05, 1.18, u), .5, .55); shade(ctx, .82); }
  const u = ease.out((t - s.t0) / .6); txt(ctx, '“', 150, 330, { size: 340, font: SERIF, w: 700, color: C.amber, a: u * .9 });
  const words = s.text.split(' '), lines = []; let cur = ''; ctx.save(); for (const w of words) { const test = cur ? cur + ' ' + w : w; if (measure(ctx, test, 84, SERIF, 700, 1, true) > 1500 && cur) { lines.push(cur); cur = w; } else cur = test; } lines.push(cur); ctx.restore();
  lines.forEach((l, i) => txt(ctx, l, 960, 470 + i * 112 - (lines.length - 2) * 40, { size: 84, font: SERIF, w: 700, italic: true, align: 'center', a: ease.out((t - s.t0 - i * .25) / .5) }));
  txt(ctx, '— ' + s.who, 960, 470 + lines.length * 112 - (lines.length - 2) * 40 + 20, { size: 32, font: MONO, w: 600, ls: 6, align: 'center', color: C.amber, a: ease.out((t - s.t0 - 1) / .5) });
};
D.black = ctx => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); };
D.title = (ctx, s, t) => {
  const lt = t - s.t0; ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * .5, 50, W / 2, H * .5, 1000); g.addColorStop(0, 'rgba(130,70,22,.55)'); g.addColorStop(1, 'rgba(10,5,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u = ease.out(lt / .25), sc = lerp(1.4, 1, u);
  ctx.save(); ctx.translate(W / 2, 470); ctx.scale(sc, sc); txt(ctx, 'THE GREAT', 0, -100, { size: 100, ls: 30, align: 'center', color: C.sep4, a: u });
  txt(ctx, 'MOLASSES FLOOD', 0, 80, { size: 190, align: 'center', color: C.amber, a: u, shadow: '#000', blur: 40, stroke: '#2a1304', sw: 8 }); ctx.restore();
  txt(ctx, 'BOSTON · JANUARY 15, 1919', W / 2, 700, { size: 46, font: MONO, w: 600, ls: 10, align: 'center', color: C.paper, a: ease.out((lt - .6) / .6) });
  txt(ctx, 'FORGOTTEN CATASTROPHES', W / 2, 140, { size: 28, font: MONO, w: 600, ls: 12, align: 'center', color: C.amber, a: ease.out((lt - .3) / .6) });
};
D.tankdiag = (ctx, s, t) => {
  const lt = t - s.t0; ctx.fillStyle = '#0c0a07'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(217,143,43,.10)'; ctx.lineWidth = 1; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const gx = 820, gy = 850, tw = 900, th = 500, u = ease.out(lt / .8);
  ctx.strokeStyle = C.paper; ctx.lineWidth = 6; ctx.fillStyle = 'rgba(217,143,43,.12)'; ctx.fillRect(gx - tw / 2, gy - th * u, tw, th * u); ctx.strokeRect(gx - tw / 2, gy - th * u, tw, th * u);
  ctx.beginPath(); ctx.moveTo(300, gy); ctx.lineTo(1500, gy); ctx.stroke();
  ctx.fillStyle = C.paper; ctx.fillRect(1250, gy - 66, 14, 40); ctx.beginPath(); ctx.arc(1257, gy - 78, 9, 0, 7); ctx.fill(); ctx.fillRect(1250, gy - 26, 6, 26); ctx.fillRect(1258, gy - 26, 6, 26); // person 6ft
  txt(ctx, 'ADULT · 6 FT', 1257, gy + 50, { size: 24, font: MONO, w: 600, align: 'center', color: C.sep4, a: ease.out((lt - 1.2) / .4) });
  const a1 = ease.out((lt - .6) / .4), a2 = ease.out((lt - 1.0) / .4);
  ctx.save(); ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.globalAlpha = a1; ctx.beginPath(); ctx.moveTo(gx - tw / 2 - 70, gy); ctx.lineTo(gx - tw / 2 - 70, gy - th); ctx.stroke(); for (const y of [gy, gy - th]) { ctx.beginPath(); ctx.moveTo(gx - tw / 2 - 90, y); ctx.lineTo(gx - tw / 2 - 50, y); ctx.stroke(); } ctx.restore();
  txt(ctx, '50 FT', gx - tw / 2 - 100, gy - th / 2 + 20, { size: 68, font: MONO, w: 800, align: 'right', color: C.amber, a: a1 });
  ctx.save(); ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.globalAlpha = a2; ctx.beginPath(); ctx.moveTo(gx - tw / 2, gy - th - 60); ctx.lineTo(gx + tw / 2, gy - th - 60); ctx.stroke(); for (const x of [gx - tw / 2, gx + tw / 2]) { ctx.beginPath(); ctx.moveTo(x, gy - th - 80); ctx.lineTo(x, gy - th - 40); ctx.stroke(); } ctx.restore();
  txt(ctx, '90 FT', gx, gy - th - 85, { size: 68, font: MONO, w: 800, align: 'center', color: C.amber, a: a2 });
  txt(ctx, '2.3 MILLION GALLONS', gx, gy - th / 2 + 10, { size: 52, font: MONO, w: 700, align: 'center', color: C.paper, a: ease.out((lt - 1.6) / .5) });
  txt(ctx, 'THE TANK', 90, 110, { size: 28, font: MONO, w: 600, ls: 10, color: C.amber }); illusTag(ctx, 'DIAGRAM');
};
D.thermo = (ctx, s, t) => {
  const lt = t - s.t0; ctx.fillStyle = '#0c0a07'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(560, 540, 40, 560, 540, 800); g.addColorStop(0, 'rgba(120,64,20,.35)'); g.addColorStop(1, 'rgba(10,5,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const x = 560, top = 170, bot = 860, v = lerp(2, 41, ease.io(lt / 3.2)), fill = (v / 50);
  ctx.strokeStyle = C.paper; ctx.lineWidth = 8; ctx.beginPath(); ctx.roundRect(x - 40, top, 80, bot - top, 40); ctx.stroke(); ctx.beginPath(); ctx.arc(x, bot + 50, 80, 0, 7); ctx.stroke();
  ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x, bot + 50, 66, 0, 7); ctx.fill(); ctx.fillRect(x - 22, bot - (bot - top - 30) * fill, 44, (bot - top - 30) * fill + 20);
  for (let i = 0; i <= 5; i++) { const y = bot - (bot - top - 30) * (i * 10 / 50); ctx.strokeStyle = C.sep4; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 60, y); ctx.lineTo(x + 100, y); ctx.stroke(); txt(ctx, i * 10 + '°F', x + 116, y + 10, { size: 28, font: MONO, w: 600, color: C.sep4 }); }
  txt(ctx, Math.round(v) + '°F', 1180, 520, { size: 330, font: MONO, w: 800, align: 'center', color: C.paper, shadow: C.amber, blur: 40 });
  txt(ctx, 'IN JUST TWO DAYS', 1180, 640, { size: 56, font: MONO, w: 700, ls: 6, align: 'center', color: C.amber, a: ease.out((lt - .3) / .5) });
  txt(ctx, 'FROM 2°F TO OVER 40°F · BOSTON', 1180, 740, { size: 32, font: MONO, w: 500, ls: 4, align: 'center', color: C.sep4, a: ease.out((lt - 1.2) / .5) });
  txt(ctx, 'WARM WEATHER → PRESSURE BUILDS INSIDE THE TANK', 1180, 800, { size: 28, font: MONO, w: 500, ls: 3, align: 'center', color: C.red, a: ease.out((lt - 2.5) / .5) });
  illusTag(ctx, 'DIAGRAM');
};
D.clock = (ctx, s, t) => {
  const lt = t - s.t0; ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const r = rng(Math.floor(t * 30)), tr = clamp(lt / (s.t1 - s.t0)) * 7; const cx = W / 2 + (r() - .5) * tr, cy = 470 + (r() - .5) * tr;
  const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 700); g.addColorStop(0, 'rgba(120,64,20,.4)'); g.addColorStop(1, 'rgba(10,5,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = C.paper; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, 250, 0, 7); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.lineWidth = i % 3 ? 5 : 10; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * 215, cy - Math.cos(a) * 215); ctx.lineTo(cx + Math.sin(a) * 240, cy - Math.cos(a) * 240); ctx.stroke(); }
  const u = ease.out(lt / 1.2), mA = lerp(-1.2, 3.1416, u), hA = (12.5 / 12) * 2 * Math.PI; ctx.lineCap = 'round';
  ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(hA) * 130, cy - Math.cos(hA) * 130); ctx.stroke(); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(mA) * 205, cy - Math.cos(mA) * 205); ctx.stroke();
  ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.fill();
  txt(ctx, '12:30 P.M.', W / 2, 850, { size: 130, font: MONO, w: 800, align: 'center', color: C.paper, a: ease.out((lt - .6) / .4), shadow: C.amber, blur: 30 });
  txt(ctx, 'JANUARY 15, 1919', W / 2, 930, { size: 40, font: MONO, w: 600, ls: 10, align: 'center', color: C.amber, a: ease.out((lt - 1) / .4) });
};
function flood(ctx, level, T, col1 = '#6b3511') {
  const g = ctx.createLinearGradient(0, H - level, 0, H); g.addColorStop(0, col1); g.addColorStop(.25, '#3f1f0b'); g.addColorStop(1, '#1a0b04'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, H - level + Math.sin(x * .012 + T * 3) * 12 + Math.sin(x * .031 - T * 2) * 6); ctx.lineTo(W, H); ctx.fill();
}
function skyline(ctx, seed, base, hmin, hmax, color, x0, x1, wmin, wmax, windows = 0, wcolor = 'rgba(0,0,0,.25)') {
  const r = rng(seed); let x = x0; while (x < x1) { const w = wmin + r() * (wmax - wmin), h = hmin + r() * (hmax - hmin); ctx.fillStyle = color; ctx.fillRect(x, base - h, w + 1, h + 2); if (windows) { ctx.fillStyle = wcolor; for (let wy = base - h + 24; wy < base - 20; wy += 38) for (let wx = x + 14; wx < x + w - 24; wx += 30) if (r() < windows) ctx.fillRect(wx, wy, 14, 22); } x += w + (r() < .3 ? 6 : 0); }
}
D.wave = (ctx, s, t) => {
  const T = t, u = clamp((t - s.t0) / Math.max(1, Math.min(13, s.t1 - s.t0))), r = rng(Math.floor(T * 30) + 5), sx = (r() - .5) * 8 * u, sy = (r() - .5) * 6 * u;
  ctx.save(); ctx.translate(sx, sy); const g0 = ctx.createLinearGradient(0, 0, 0, H); g0.addColorStop(0, '#3b352c'); g0.addColorStop(1, '#a39578'); ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
  skyline(ctx, 51, 790, 300, 600, '#3a3024', -60, W + 60, 170, 260, .5, 'rgba(210,180,110,.18)'); skyline(ctx, 52, 820, 240, 470, '#241d15', -60, W + 60, 140, 240, .45, 'rgba(210,180,110,.14)');
  ctx.fillStyle = '#17120c'; ctx.fillRect(0, 800, W, 300);
  for (const px of [260, 330, 450, 700]) { ctx.fillStyle = '#0c0906'; ctx.beginPath(); ctx.arc(px, 800 - 66, 8, 0, 7); ctx.fill(); ctx.fillRect(px - 8, 800 - 58, 16, 40); ctx.fillRect(px - 8, 800 - 18, 6, 18); ctx.fillRect(px + 2, 800 - 18, 6, 18); }
  const xf = lerp(W + 360, -1100, ease.io(u)), base = 800, hh = 480;
  ctx.beginPath(); ctx.moveTo(xf, base); ctx.bezierCurveTo(xf - 10, base - hh * .55, xf + 20, base - hh * .9, xf + 120, base - hh); ctx.bezierCurveTo(xf + 40, base - hh * .96, xf - 36, base - hh * .86, xf - 4, base - hh * .74); ctx.bezierCurveTo(xf + 150, base - hh * .98, xf + 300, base - hh * .8, xf + 560, base - hh * .8);
  for (let x = xf + 560; x < W + 800; x += 40) ctx.lineTo(x, base - hh * .8 + Math.sin(x * .02 + T * 5) * 10); ctx.lineTo(W + 800, base + 300); ctx.lineTo(xf, base + 300); ctx.closePath();
  const wg = ctx.createLinearGradient(0, base - hh, 0, base); wg.addColorStop(0, '#6b3511'); wg.addColorStop(.35, '#3f1f0b'); wg.addColorStop(1, '#1a0b04'); ctx.fillStyle = wg; ctx.fill();
  const dr = rng(14); ctx.fillStyle = '#120a05'; for (let i = 0; i < 18; i++) { const dx = xf - 30 + dr() * 140, dy = base - 20 - dr() * 420, sz = 8 + dr() * 16; ctx.save(); ctx.translate(dx, dy + Math.sin(T * 6 + i) * 6); ctx.rotate(dr() * 6 + T * 2); ctx.fillRect(-sz, -sz / 3, sz * 2, sz / 1.5); ctx.restore(); }
  ctx.restore(); illusTag(ctx);
};
D.count21 = (ctx, s, t) => {
  const A = n => anchor(s.ch, n), tw = A('w:Twenty-one'), t1 = A('w:Not#0'), t2 = A('w:Not#1'), tM = A('w:molasses'); const lt = t - s.t0;
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = .16; cover(ctx, cache.get('after') || cache.values().next().value, 0, 0, W, H, 1.2, .55, .6); ctx.restore();
  const g = ctx.createRadialGradient(W / 2, 460, 50, W / 2, 460, 900); g.addColorStop(0, 'rgba(90,60,30,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const n = Math.round(21 * ease.out((t - tw) / .5)), mv = ease.io((t - (t1 - .15)) / .45), cy = lerp(500, 250, mv), sc = lerp(1, .55, mv);
  ctx.save(); ctx.translate(W / 2, cy); ctx.scale(sc, sc); txt(ctx, String(t >= tw ? n : 0), 0, 150, { size: 460, font: MONO, w: 800, align: 'center', color: C.paper, shadow: C.amber, blur: 50, a: ease.out((t - tw + .1) / .2) }); ctx.restore();
  txt(ctx, 'PEOPLE DIED THAT DAY', W / 2, lerp(790, 420, mv), { size: lerp(54, 36, mv), font: MONO, w: 600, ls: 8, align: 'center', color: C.amber, a: ease.out((t - tw - .5) / .3) });
  const icon = (kind, x, y, tx) => { ctx.save(); ctx.translate(x, y); ctx.scale(1.25, 1.25); ctx.fillStyle = C.paper; ctx.beginPath(); if (kind === 'drop') { ctx.moveTo(0, -60); ctx.bezierCurveTo(50, 10, 44, 56, 0, 56); ctx.bezierCurveTo(-44, 56, -50, 10, 0, -60); } else { ctx.moveTo(0, -64); ctx.bezierCurveTo(46, -10, 52, 20, 40, 44); ctx.bezierCurveTo(30, 62, -30, 62, -40, 44); ctx.bezierCurveTo(-52, 20, -30, -6, -16, -22); ctx.bezierCurveTo(-12, 0, -4, 6, 0, -64); } ctx.fill(); const k = ease.out((t - tx) / .18); ctx.strokeStyle = C.red; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-70, -70); ctx.lineTo(-70 + 140 * k, -70 + 140 * k); ctx.stroke(); ctx.restore(); };
  [[0, t1, 'drop', 'NOT FROM WATER.'], [1, t2, 'fire', 'NOT FROM FIRE.']].forEach(([i, tt, k, str]) => { const u = ease.out((t - tt) / .16); if (u <= 0) return; const y = 640 + i * 190; ctx.save(); ctx.globalAlpha = u; ctx.translate(0, (1 - u) * 30); icon(k, 560, y, tt + .5); txt(ctx, str, 680, y + 28, { size: 100 }); ctx.restore(); });
  // molasses drips at the end
  if (t >= tM - .1) { const r = rng(31); ctx.fillStyle = '#3a1d0b'; const cols = 24, cw = W / cols; for (let i = 0; i < cols; i++) { const sp = .7 + r() * .6, wd = cw * (.8 + r() * .5), len = Math.min(H * 1.05, Math.max(0, (t - tM + .1) * (900 + r() * 700) * sp)); const x = i * cw + cw / 2; ctx.fillRect(x - wd / 2, -10, wd, len); ctx.beginPath(); ctx.arc(x, len - 4, wd / 2, 0, 7); ctx.fill(); } ctx.fillRect(0, -10, W, 40 + clamp((t - tM) / .5) * 200);
    const u2 = ease.out((t - tM) / .1); ctx.save(); ctx.translate(W / 2, 640); const s2 = 1.3 - .3 * u2; ctx.scale(s2, s2); txt(ctx, 'FROM', 0, -230, { size: 110, ls: 24, align: 'center', color: C.sep4, a: u2 }); txt(ctx, 'MOLASSES.', 0, 0, { size: 250, align: 'center', color: C.amber, a: u2, shadow: '#000', blur: 40, stroke: '#2a1304', sw: 8 }); ctx.restore(); }
};
D.names21 = (ctx, s, t) => {
  const lt = t - s.t0; ctx.fillStyle = '#07050a'; ctx.fillRect(0, 0, W, H);
  const gg = ctx.createRadialGradient(W / 2, 520, 40, W / 2, 520, 800); gg.addColorStop(0, 'rgba(120,70,20,.35)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
  const R = 300, cx = W / 2, cy = 520; ctx.strokeStyle = 'rgba(227,212,174,.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  for (let i = 0; i < 21; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 21, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, on = ease.out((lt - .6 - i * .32) / .5), fl = .85 + .15 * Math.sin(t * 7 + i * 2);
    const gl = ctx.createRadialGradient(x, y, 2, x, y, 60 * on); gl.addColorStop(0, `rgba(255,190,90,${.9 * on * fl})`); gl.addColorStop(1, 'rgba(255,150,40,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 70, y - 70, 140, 140); ctx.fillStyle = `rgba(227,212,174,${.25 + .75 * on})`; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); }
  txt(ctx, '21', cx, cy + 50, { size: 180, font: MONO, w: 800, align: 'center', color: C.paper, a: ease.out((lt - .4) / .6), shadow: C.amber, blur: 40 });
  txt(ctx, 'NAMES READ ALOUD', cx, cy + 120, { size: 36, font: MONO, w: 600, ls: 10, align: 'center', color: C.amber, a: ease.out((lt - .8) / .6) });
  txt(ctx, 'JANUARY 15, 2019 · THE 100TH ANNIVERSARY', cx, 930, { size: 34, font: MONO, w: 500, ls: 6, align: 'center', color: C.sep4, a: ease.out((lt - 1.2) / .6) });
};
D.endcard = (ctx, s, t) => {
  const A = n => anchor(s.ch, n), tT = A('w:This'), tY = A('w:they'), tI = A('w:school'); ctx.fillStyle = '#1a0b04'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * .45, 60, W / 2, H * .45, 1000); g.addColorStop(0, 'rgba(120,64,20,.55)'); g.addColorStop(1, 'rgba(10,5,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(240,160,70,.10)'; ctx.lineWidth = 3; for (let i = 0; i < 16; i++) { ctx.beginPath(); for (let x = 0; x <= W; x += 40) { const y = 80 + i * 70 + Math.sin(x * .006 + t * .8 + i) * 18; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  [['THIS IS THE STORY', tT, 'paper', 112, 400], ['THEY DON’T TEACH YOU', tY, 'paper', 112, 560], ['IN SCHOOL.', tI - .2, 'amber', 190, 790]].forEach(([str, t0, c, sz, y]) => { const u = ease.out((t - t0 + .05) / .25); ctx.save(); ctx.globalAlpha = u; ctx.translate(0, (1 - u) * 36); txt(ctx, str, W / 2, y, { size: sz, align: 'center', color: COL(c), shadow: '#000', blur: 30, ls: 3 }); ctx.restore(); });
  txt(ctx, 'THE GREAT MOLASSES FLOOD · BOSTON, 1919', W / 2, 960, { size: 30, font: MONO, w: 500, ls: 8, align: 'center', color: C.sep4, a: ease.out((t - tI - .6) / .6) * .9 });
  txt(ctx, 'FORGOTTEN CATASTROPHES', W / 2, 110, { size: 28, font: MONO, w: 600, ls: 12, align: 'center', color: C.amber, a: ease.out((t - tT) / .6) });
};

// ---------- overlays ----------
function overlay(ctx, o, t) {
  const lt = t - o.t0; if (lt < 0 || lt > o.dur) return; const a = ease.out(lt / .3) * ease.out((o.dur - lt) / .3);
  if (o.kind === 'date') {
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(8,6,4,.74)'; ctx.fillRect(90, 760, 940, 210); ctx.fillStyle = C.amber; ctx.fillRect(90, 760, 8, 210); ctx.restore();
    const d = o.a.slice(0, Math.max(0, Math.floor((lt - .2) * 26))); txt(ctx, d + (Math.floor(t * 3) % 2 ? '_' : ' '), 130, 850, { size: 76, font: MONO, w: 700, a }); txt(ctx, o.b.slice(0, Math.max(0, Math.floor((lt - 1.4) * 30))), 130, 925, { size: 40, font: MONO, w: 500, ls: 3, color: C.sep4, a });
  } else if (o.kind === 'stat') {
    const x = o.side === 'R' ? W - 90 - 560 : 90, y = 110, val = +o.big.replace(/\D/g, '') || 0;
    let numStr = o.big; if (o.count && !o.plain) { const v = val * ease.out(lt / o.count); numStr = fmt(v); } else if (!o.plain) numStr = fmt(val);
    numStr += (o.suf || ''); const sz = numStr.length > 9 ? 90 : 120, w = Math.max(560, measure(ctx, numStr, sz, MONO, 800) + 80);
    const xx = o.side === 'R' ? W - 90 - w : x; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(8,6,4,.78)'; ctx.fillRect(xx, y, w, 200); ctx.fillStyle = o.red ? C.red : C.amber; ctx.fillRect(xx, y, 8, 200); ctx.restore();
    txt(ctx, numStr, xx + 40, y + 120, { size: sz, font: MONO, w: 800, a }); txt(ctx, o.unit, xx + 40, y + 170, { size: 26, font: MONO, w: 500, ls: 3, color: o.red ? '#e06a58' : C.amber, a });
  } else if (o.kind === 'bar') {
    const w = measure(ctx, o.text, 34, MONO, 600, 3) + 80; ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - a) * -30, 0); ctx.fillStyle = 'rgba(8,6,4,.78)'; ctx.fillRect(90, 905, w, 80); ctx.fillStyle = C.amber; ctx.fillRect(90, 905, 8, 80); ctx.restore(); txt(ctx, o.text, 130, 957, { size: 34, font: MONO, w: 600, ls: 3, a });
  }
}

// ---------- frame ----------
const bufA = createCanvas(W, H), xa = bufA.getContext('2d'), bufB = createCanvas(W, H), xb = bufB.getContext('2d');
const grain = []; for (let k = 0; k < 6; k++) { const c = createCanvas(960, 540), x = c.getContext('2d'), im = x.createImageData(960, 540), r = rng(k + 100); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); grain.push(c); }
const vig = createCanvas(W, H); { const x = vig.getContext('2d'), g = x.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.75)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
function drawShot(ctx, s, t) { D[s.type](ctx, s, t); }
function frame(ctx, t) {
  let i = shots.findIndex(s => t >= s.t0 && t < s.t1); if (i < 0) i = shots.length - 1; const s = shots[i], tr = s.tr || 'dissolve', TD = .45, lt = t - s.t0;
  if (i > 0 && tr === 'dissolve' && lt < TD) { drawShot(xa, shots[i - 1], t); drawShot(xb, s, t); ctx.drawImage(bufA, 0, 0); ctx.globalAlpha = ease.io(lt / TD); ctx.drawImage(bufB, 0, 0); ctx.globalAlpha = 1; }
  else { drawShot(ctx, s, t); if (tr === 'flash' && lt < .35) { ctx.fillStyle = `rgba(255,246,225,${.95 * (1 - lt / .35)})`; ctx.fillRect(0, 0, W, H); } }
  for (const o of overs) overlay(ctx, o, t);
  // chapter plate
  const c = TL.chapters.find(c => t >= c.t0 && t < c.t1 + 1); if (c && c.id !== 'c01' && c.id !== 'c12') { const cl = t - c.t0; if (cl >= 0 && cl < 3.4) { const a = ease.out(cl / .4) * ease.out((3.4 - cl) / .4); txt(ctx, `${String(CH[c.id].n - 1).padStart(2, '0')} · ${c.title}`, 90, 80, { size: 26, font: MONO, w: 700, ls: 8, color: C.amber, a, shadow: '#000', blur: 12 }); } }
  // film look
  const fr = Math.floor(t * FPS), r = rng(fr * 7 + 1);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#efdcb6'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .36; ctx.drawImage(grain[fr % 6], -(r() * 40), -(r() * 40), W + 80, H + 80); ctx.restore();
  ctx.drawImage(vig, 0, 0); ctx.fillStyle = `rgba(0,0,0,${.04 + r() * .06})`; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.strokeStyle = 'rgba(230,220,190,.25)'; ctx.lineWidth = 1.5; if (r() < .4) { const x = r() * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (r() - .5) * 8, H); ctx.stroke(); } ctx.fillStyle = 'rgba(230,220,190,.5)'; for (let k = 0; k < 8; k++) if (r() < .45) { ctx.beginPath(); ctx.arc(r() * W, r() * H, .8 + r() * 2, 0, 7); ctx.fill(); } ctx.restore();
  if (t < .8) { ctx.fillStyle = `rgba(0,0,0,${1 - t / .8})`; ctx.fillRect(0, 0, W, H); }
  if (t > TOTAL - 1.2) { ctx.fillStyle = `rgba(0,0,0,${(t - (TOTAL - 1.2)) / 1.2})`; ctx.fillRect(0, 0, W, H); }
}

(async () => {
  const mode = process.argv[2], cv = createCanvas(W, H), cx = cv.getContext('2d');
  if (mode === 'info') { shots.forEach(s => console.log(s.ch, s.type, (s.id || ''), s.t0.toFixed(1), '→', s.t1.toFixed(1))); return; }
  if (mode === 'still') {
    const ts = process.argv[3].split(',').map(Number), cols = Math.min(3, ts.length), rows = Math.ceil(ts.length / cols), sheet = createCanvas(cols * 640, rows * 360), sc = sheet.getContext('2d');
    for (let k = 0; k < ts.length; k++) { await preload(ts[k]); frame(cx, ts[k]); sc.drawImage(cv, (k % cols) * 640, Math.floor(k / cols) * 360, 640, 360); }
    fs.writeFileSync(process.argv[4], sheet.toBuffer('image/png')); return;
  }
  const out = process.argv[3], t0 = +(process.argv[4] || 0), t1 = +(process.argv[5] || TOTAL);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'veryfast', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = Math.round(t0 * FPS); f < Math.round(t1 * FPS); f++) { const t = f / FPS; if (f === Math.round(t0 * FPS) || f % 15 === 0) await preload(t); frame(cx, t); if (!ff.stdin.write(cv.data())) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end();
})();
