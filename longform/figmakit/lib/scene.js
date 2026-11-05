// How It's Run LONG-FORM scene kit (approved standard, Nov 2026): Figma AI plates + sprites animated in code.
// World units = the plate's own 1536x864 pixels (Figma 16:9 output). Plates are upscaled once to cache/ (tools/prepare.py) for crisp zooms.
//   words(chapterDir, offset)          -> at(lineId, word, n) word start times from the voice alignment (vo/<id>.align.json + cues.json)
//   camKeys(keys, lt)                  -> camera {x, y, z, r} from [[t, x, y, z, r?], ...] with eased moves + a slow breathing drift
//   world(ctx, cam, depth, fn)         -> draw in plate units with parallax depth (1 = plate, >1 foreground, <1 far)
//   plate / reveal(poly) / sprite      -> background plate, re-draw a plate region on top (occluder: desk edge, armchair...), cut-out sprite
//   FX: beams, dust, smoke, sparkle, glow, puff, shake;  grade(ctx, warm, vignette);  tag(ctx, text, x, y, a)
//   run({ module, T, shots: [{ t0, draw(ctx, t, lt), in: 'cut'|'whip'|'flash'|'black' }], assets, onLoad }) -> CLI: T | still t1,t2 out.png | frame t out.png | video out.mp4
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const W = 1920, H = 1080, FPS = 30, PW = 1536, PH = 864, K = W / PW;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const ease = { inOut: ss, out: u => 1 - Math.pow(1 - clamp(u), 3), in: u => Math.pow(clamp(u), 3), back: u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); } };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t, k = 1) => Math.sin(t * 1.7 * k) * 0.6 + Math.sin(t * 2.9 * k + 1.3) * 0.4;

function words(chDir, offset = 0) { const CU = JSON.parse(fs.readFileSync(path.join(chDir, 'cues.json'))), WD = {};
  for (const [id, t0] of CU.vo) { const a = JSON.parse(fs.readFileSync(path.join(chDir, 'vo', id + '.align.json'))), s = a.characters.join(''), re = /\S+/g; let m; WD[id] = [];
    while ((m = re.exec(s))) WD[id].push({ w: m[0].toLowerCase().replace(/[^a-z0-9$']/g, ''), t: t0 + a.character_start_times_seconds[m.index] - offset }); }
  return (id, w, n = 0) => { const l = WD[id].filter(x => x.w.startsWith(w.toLowerCase())); if (!l.length) throw new Error(`word not found: ${id} ${w}`); return l[Math.min(n, l.length - 1)].t; }; }
function camKeys(keys, lt) { let a = keys[0], b = keys[keys.length - 1];
  if (lt <= a[0]) return { x: a[1], y: a[2], z: a[3], r: a[4] || 0 }; if (lt >= b[0]) return { x: b[1] + noise(lt, 0.7) * 2.5, y: b[2] + noise(lt + 3, 0.6) * 2, z: b[3], r: b[4] || 0 };
  for (let i = 1; i < keys.length; i++) if (lt < keys[i][0]) { a = keys[i - 1]; b = keys[i]; break; } const v = ss((lt - a[0]) / (b[0] - a[0]));
  return { x: lerp(a[1], b[1], v) + noise(lt, 0.7) * 2.5, y: lerp(a[2], b[2], v) + noise(lt + 3, 0.6) * 2, z: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), v)), r: lerp(a[4] || 0, b[4] || 0, v) }; }
function world(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2, H / 2); const z = Math.pow(c.z, d); ctx.scale(K * z, K * z); ctx.rotate((c.r || 0) * d);
  ctx.translate(-(PW / 2 + (c.x - PW / 2) * d), -(PH / 2 + (c.y - PH / 2) * d)); fn(ctx); ctx.restore(); }
const plate = (ctx, im) => ctx.drawImage(im, 0, 0, PW, PH);
function reveal(ctx, im, poly) { ctx.save(); ctx.beginPath(); poly.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip(); plate(ctx, im); ctx.restore(); }
// sprite: anchor (ax, ay) as fraction of the sprite, scale s relative to its pixel size / pre (pre = upscale factor of the cached sprite)
function sprite(ctx, im, x, y, s = 1, o = {}) { const pre = o.pre || 1, w = im.width / pre * s, h = im.height / pre * s; ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); ctx.rotate(o.r || 0);
  ctx.scale(o.flip ? -1 : 1, o.sq ? 1 / o.sq : 1);
  if (o.shadow) { ctx.save(); ctx.globalAlpha *= 0.35; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.45, w * 0.08, 0, 0, 6.28); ctx.fill(); ctx.restore(); }
  ctx.drawImage(im, -w * (o.ax ?? 0.5), -h * (o.ay ?? 1), w, h); ctx.restore(); }
// ---------- FX ----------
function beams(ctx, t, x0, y0, ang, n = 3, a = 0.1, len = 900) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const fl = 0.75 + 0.25 * Math.sin(t * 0.8 + i * 1.7);
  ctx.save(); ctx.translate(x0 + i * 70, y0); ctx.rotate(ang); const g = ctx.createLinearGradient(0, 0, 0, len); g.addColorStop(0, `rgba(255,220,150,${a * fl})`); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(-28, 0, 56 + i * 8, len); ctx.restore(); } ctx.restore(); }
function dust(ctx, t, x, y, w, h, n = 40, col = '255,236,200') { ctx.save(); for (let i = 0; i < n; i++) { const h1 = hash(i * 3.7), h2 = hash(i * 9.1), h3 = hash(i * 1.3);
  const px = x + ((h1 * w + Math.sin(t * 0.3 + i) * 30 + t * 6 * (h3 - 0.5)) % w + w) % w, py = y + ((h2 * h - t * (8 + h3 * 10)) % h + h) % h, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i));
  ctx.fillStyle = `rgba(${col},${0.55 * tw})`; ctx.beginPath(); ctx.arc(px, py, 1.2 + h3 * 2.2, 0, 6.28); ctx.fill(); } ctx.restore(); }
function glow(ctx, x, y, r, col, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
function sparkle(ctx, x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a; ctx.fillStyle = '#FFF8E0'; for (const r of [0, Math.PI / 2]) { ctx.save(); ctx.rotate(r + a * 0.6); ctx.beginPath(); ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0); ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s); ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0); ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s); ctx.fill(); ctx.restore(); } ctx.restore(); glow(ctx, x, y, s * 2.2, 'rgba(255,240,190,0.9)', a * 0.6); }
function smoke(ctx, t, x, y, s = 1, n = 5, blur = 5) { ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`; for (let i = 0; i < n; i++) { const ph = (t * 0.22 + i / n) % 1; ctx.globalAlpha = 0.45 * Math.sin(ph * Math.PI); ctx.fillStyle = '#F6EEE4';
  ctx.beginPath(); ctx.arc(x + ph * 60 * s + Math.sin(t + i) * 6 * s, y - ph * 110 * s, (10 + ph * 26) * s, 0, 6.28); ctx.fill(); } ctx.restore(); }
function puff(ctx, x, y, u, r = 160, col = '#F4E8D0') { if (u <= 0 || u >= 1) return; ctx.save(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; ctx.globalAlpha = 0.6 * (1 - u); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * u, y + Math.sin(a) * r * 0.25 * u, 10 + u * 16, 0, 6.28); ctx.fill(); } ctx.restore(); }
const shake = (t, t0, amp = 10, dur = 0.4) => { const d = t - t0; if (d < 0 || d > dur) return [0, 0]; const k = 1 - d / dur; return [Math.sin(t * 90) * amp * k, Math.cos(t * 70) * amp * 0.8 * k]; };
function grade(ctx, warm = 0.06, vig = 0.4) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,170,90,${warm})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(15,6,0,${vig})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function tag(ctx, s, x, y, a, size = 40, font = 'sans-serif') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y + (1 - a) * 16); ctx.font = `bold ${size}px ${font}`; const w = ctx.measureText(s).width + size * 0.9;
  ctx.fillStyle = 'rgba(28,26,31,0.82)'; ctx.beginPath(); ctx.roundRect(-w / 2, -size * 0.75, w, size * 1.5, 10); ctx.fill(); ctx.fillStyle = '#F6EBD3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 2); ctx.restore(); }
// ---------- edit + CLI ----------
let TMP = null;
function makeFrame(shots, T) { shots.sort((a, b) => a.t0 - b.t0); shots.forEach((s, i) => s.t1 = i < shots.length - 1 ? shots[i + 1].t0 : T + 1);
  return (ctx, t) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#1A120C'; ctx.fillRect(0, 0, W, H);
    const s = shots.find(x => t >= x.t0 && t < x.t1) || shots[shots.length - 1], lt = t - s.t0; s.draw(ctx, t, lt);
    if (!TMP) TMP = createCanvas(W, H);
    if (s.in === 'whip' && lt < 0.22) { const tc = TMP.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.drawImage(ctx.canvas, 0, 0); const k = 1 - lt / 0.22;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); for (let j = 0; j < 8; j++) { ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(TMP, (j - 4) * 60 * k + 280 * k * (s.dir || 1), 0); } ctx.restore(); }
    if (s.in === 'flash') { const f = 1 - clamp(lt / 0.45); if (f > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,244,220,${f})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
    if (s.in === 'black') { const f = 1 - clamp(lt / 0.35); if (f > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(10,6,4,${f})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
    if (s.shake) { const [dx, dy] = s.shake(t); if (dx || dy) { const tc = TMP.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.drawImage(ctx.canvas, 0, 0); ctx.drawImage(TMP, dx, dy); } } }; }
async function run({ module: mod, T, shots, load }) {
  if (require.main !== mod) return; const [mode, a1, a2] = process.argv.slice(2); if (mode === 'T') return console.log(T);
  if (load) await load(); const frame = makeFrame(shots, T), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'still') { const ts = a1.split(',').map(Number), cols = 3, sh = createCanvas(640 * cols, 360 * Math.ceil(ts.length / cols)), sc = sh.getContext('2d');
    ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * 640, Math.floor(i / cols) * 360, 640, 360); sc.fillStyle = '#E8322E'; sc.font = '24px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * 640 + 8, Math.floor(i / cols) * 360 + 28); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-tune', 'animation', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(T * FPS); for (let f = 0; f < N; f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 300 === 0) process.stderr.write(`${f}/${N}\n`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); return; }
  console.log('usage: node scene.js T | still t1,t2 out.png | frame t out.png | video out.mp4'); }
// asset loader: plates from cache/ (upscaled) when present, else the original
const KIT = path.join(__dirname, '..');
async function loadPlate(name) { const c = path.join(KIT, 'cache', 'backgrounds', name + '.png'), o = path.join(KIT, 'assets', 'backgrounds', name + '.png'); return loadImage(fs.existsSync(c) ? c : o); }
async function loadProp(name) { const c = path.join(KIT, 'cache', 'props', name + '.png'), o = path.join(KIT, 'assets', 'props', name + '.png'); const im = await loadImage(fs.existsSync(c) ? c : o); im.pre = fs.existsSync(c) ? 1.5 : 1; return im; }
module.exports = { W, H, FPS, PW, PH, K, clamp, lerp, ss, ease, hash, noise, words, camKeys, world, plate, reveal, sprite, beams, dust, glow, sparkle, smoke, puff, shake, grade, tag, makeFrame, run, loadPlate, loadProp, KIT };
