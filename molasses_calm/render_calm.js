// Calm documentary renderer: archival photos, slow Ken Burns, long dissolves, minimal lower-thirds. 1920x1080 @30fps.
// Usage: node render_calm.js info | still t1,t2,.. out.png | video out.mp4 t0 t1
const { createCanvas, loadImage } = require('/home/user/sofia-studio/node_modules/@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const { PHOTOS, LT } = require('./plan_calm');
const TL = JSON.parse(fs.readFileSync(__dirname + '/timeline.json'));
const DC = JSON.parse(fs.readFileSync(__dirname + '/../molasses_full/dc_items.json'));
const PH = __dirname + '/../molasses_full/photos/';
const W = 1920, H = 1080, FPS = 30, TOTAL = TL.total, TD = 1.8;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ease = { out: u => 1 - Math.pow(1 - clamp(u), 3), io: u => { u = clamp(u); return u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; } };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const SANS = '"Inter Display", "Inter", sans-serif', MONO = '"JetBrains Mono", monospace';

// ---- timeline anchors ----
const norm = w => w.toLowerCase().replace(/[^a-z0-9-]/g, '');
const CH = {}; TL.chapters.forEach(c => CH[c.id] = Object.assign({ words: [] }, c)); TL.words.forEach(w => CH[w.ch].words.push(w));
function anchor(ch, spec) {
  const c = CH[ch]; if (typeof spec === 'number') return c.t0 + spec; if (spec === 'start') return c.t0;
  const m = /^w:(.+?)(?:#(\d+))?$/.exec(spec); const target = norm(m[1]), nth = +(m[2] || 0); let n = 0;
  for (const w of c.words) if (norm(w.w) === target) { if (n++ === nth) return w.t0; }
  throw new Error(`anchor not found: ${ch} ${spec}`);
}
// ---- shots ----
const KB = ['in', 'panL', 'out', 'panR', 'in', 'panR', 'out', 'panL'];
const shots = []; let kbi = 0;
TL.chapters.forEach((c, ci) => {
  const seg0 = ci === 0 ? 0 : c.t0, seg1 = ci + 1 < TL.chapters.length ? TL.chapters[ci + 1].t0 : TOTAL;
  const ents = PHOTOS[c.id].map(e => typeof e === 'string' ? { id: e } : Object.assign({}, e));
  ents.forEach((e, i) => { e.pin = i === 0 ? seg0 : (e.at ? anchor(c.id, e.at) : null); });
  let i = 0; while (i < ents.length) {
    if (ents[i].pin != null) { i++; continue; }
    let j = i; while (j < ents.length && ents[j].pin == null) j++;
    const a = ents[i - 1].pin, b = j < ents.length ? ents[j].pin : seg1, n = j - i + 1;
    for (let k = i; k < j; k++) ents[k].pin = a + (b - a) * (k - i + 1) / n; i = j;
  }
  ents.forEach((e, k) => { shots.push({ id: e.id, t0: e.pin, t1: k + 1 < ents.length ? ents[k + 1].pin : seg1, kb: e.kb || KB[kbi++ % KB.length], fx: e.fx, fy: e.fy }); });
});
shots.sort((a, b) => a.t0 - b.t0); shots[0].t0 = 0; shots.forEach((s, i) => { s.t1 = i + 1 < shots.length ? shots[i + 1].t0 : TOTAL; });
const lts = LT.map(([ch, at, dur, l1, l2]) => ({ t0: anchor(ch, at), dur, l1, l2 }));

// ---- photos ----
const SPECIAL = { tank: ['tank_before.jpg', 'Archival photograph · The tank, before the disaster'], after: ['boston_molasses_disaster.jpg', 'Archival photograph · The aftermath, 1919'], crew: ['wreckage_elevated_tracks.jpg', 'Archival photograph · The aftermath, 1919'] };
const META = {}; DC.forEach(i => META[i.id.split(':')[1]] = i);
function credit(id) {
  if (SPECIAL[id]) return SPECIAL[id][1]; const m = META[id]; if (!m) return '';
  const src = m.coll.startsWith('Boston Elevated') ? 'Boston City Archives' : 'Boston Public Library';
  const mm = /^(\w+) (\d+), (\d{4})/.exec(m.date || ''); return `${src} · ${mm ? `${mm[1].slice(0, 3)}. ${mm[2]}, ${mm[3]}` : 'ca. 1919'}`;
}
const cache = new Map(); const pathOf = id => PH + (SPECIAL[id] ? SPECIAL[id][0] : `dc_${id}.jpg`);
async function preload(t) {
  for (const s of shots) if (t >= s.t0 - 2 && t <= s.t1 + TD + .5 && !cache.has(s.id)) cache.set(s.id, await loadImage(pathOf(s.id)));
  for (const id of [...cache.keys()]) if (!shots.some(s => s.id === id && t >= s.t0 - 2 && t <= s.t1 + TD + .5)) cache.delete(id);
}
function drawPhoto(ctx, s, t) {
  const im = cache.get(s.id), u = clamp((t - s.t0) / Math.max(1, s.t1 - s.t0 + TD)), e = ease.io(u), low = im.width < 800;
  const zA = low ? 1.0 : 1.04, zB = low ? 1.1 : 1.15; let z, fx = s.fx == null ? .5 : s.fx, fy = s.fy == null ? .5 : s.fy;
  if (s.kb === 'in') z = lerp(zA, zB, e); else if (s.kb === 'out') z = lerp(zB, zA, e); else { z = lerp(zA + .06, zB + .02, .5); fx += (s.kb === 'panL' ? 1 : -1) * lerp(-.05, .05, e) * -1; }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const sc = Math.max(W / im.width, H / im.height) * z, sw = W / sc, sh = H / sc, sx = clamp(fx * im.width - sw / 2, 0, im.width - sw), sy = clamp(fy * im.height - sh / 2, 0, im.height - sh);
  ctx.drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
}
// ---- frame ----
const bufA = createCanvas(W, H), xa = bufA.getContext('2d');
const grain = []; for (let k = 0; k < 4; k++) { const c = createCanvas(960, 540), x = c.getContext('2d'), im = x.createImageData(960, 540), r = rng(k + 50); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); grain.push(c); }
const vig = createCanvas(W, H); { const x = vig.getContext('2d'), g = x.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
const shade = createCanvas(W, H); { const x = shade.getContext('2d'), g = x.createLinearGradient(0, H - 380, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); x.fillStyle = g; x.fillRect(0, H - 380, W, 380); }
function text(ctx, s, x, y, o) { ctx.save(); ctx.font = `${o.w || 500} ${o.size}px ${o.font || SANS}`; try { ctx.letterSpacing = (o.ls || 0) + 'px'; } catch (e) {} ctx.textAlign = o.align || 'left'; ctx.globalAlpha = o.a; ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 2; ctx.fillStyle = o.color; ctx.fillText(s, x, y); ctx.restore(); }
function frame(ctx, t) {
  let i = shots.findIndex(s => t >= s.t0 && t < s.t1); if (i < 0) i = shots.length - 1; const s = shots[i], lt = t - s.t0;
  if (i > 0 && lt < TD) { drawPhoto(xa, shots[i - 1], t); drawPhoto(ctx, s, t); const a = ease.io(lt / TD); ctx.globalAlpha = 1 - a; ctx.drawImage(bufA, 0, 0); ctx.globalAlpha = 1; /* draw prev over new at decreasing alpha */ }
  else drawPhoto(ctx, s, t);
  // grade: muted, warm, dark
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#d9cdb8'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .10; ctx.drawImage(grain[Math.floor(t * 12) % 4], 0, 0, W, H); ctx.restore();
  ctx.drawImage(vig, 0, 0);
  // lower-thirds (dates, names, numbers only)
  for (const o of lts) { const l = t - o.t0; if (l < 0 || l > o.dur) continue; const a = ease.out(l / .9) * ease.out((o.dur - l) / .9); ctx.save(); ctx.globalAlpha = a; ctx.drawImage(shade, 0, 0); ctx.restore();
    text(ctx, o.l1, 110, H - 150, { size: 50, w: 600, ls: 1, color: '#efe6d2', a }); if (o.l2) text(ctx, o.l2, 112, H - 98, { size: 30, w: 400, ls: 1, color: '#b9ab8c', a }); }
  const c = credit(s.id); if (c) text(ctx, c, W - 70, H - 48, { size: 19, w: 400, font: MONO, ls: 1, align: 'right', color: '#a8946c', a: .6 * ease.out(lt / 1.5) });
  if (t < 2.5) { ctx.fillStyle = `rgba(0,0,0,${1 - ease.io(t / 2.5)})`; ctx.fillRect(0, 0, W, H); }
  if (t > TOTAL - 3.5) { ctx.fillStyle = `rgba(0,0,0,${ease.io((t - (TOTAL - 3.5)) / 3.5)})`; ctx.fillRect(0, 0, W, H); }
}
(async () => {
  const mode = process.argv[2], cv = createCanvas(W, H), cx = cv.getContext('2d');
  if (mode === 'info') { shots.forEach(s => console.log(s.id.padEnd(12), s.kb.padEnd(5), s.t0.toFixed(1), '→', s.t1.toFixed(1), (s.t1 - s.t0).toFixed(1) + 's')); console.log('total', TOTAL.toFixed(1)); return; }
  if (mode === 'still') { const ts = process.argv[3].split(',').map(Number), cols = Math.min(3, ts.length), rows = Math.ceil(ts.length / cols), sheet = createCanvas(cols * 640, rows * 360), sc = sheet.getContext('2d');
    for (let k = 0; k < ts.length; k++) { await preload(ts[k]); frame(cx, ts[k]); sc.drawImage(cv, (k % cols) * 640, Math.floor(k / cols) * 360, 640, 360); } fs.writeFileSync(process.argv[4], sheet.toBuffer('image/png')); return; }
  const out = process.argv[3], t0 = +(process.argv[4] || 0), t1 = +(process.argv[5] || TOTAL);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'veryfast', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const f0 = Math.round(t0 * FPS); for (let f = f0; f < Math.round(t1 * FPS); f++) { const t = f / FPS; if (f === f0 || f % 15 === 0) await preload(t); frame(cx, t); if (!ff.stdin.write(cv.data())) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end();
})();
