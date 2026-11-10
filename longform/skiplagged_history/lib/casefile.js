// "Case File" house-style library (CHANNEL.md rule 14) for How It's Run long-form films, 16:9 1920x1080 @ 30 fps.
// Two looks: DARK DESK (evidence cards floating in a spotlight) and LIGHT PAPER (paper maps, stickies, marker).
// Everything is drawn in code. No real logos/liveries: planes are generic silhouettes; brand names are plain type.
//
// Quick API (see README at the bottom of this file):
//   const C = require('../../lib/casefile');  C.fonts();
//   math: clamp lerp ss eo eio back lin rnd hash
//   time:  const tl = C.timeline(filmDir, chId, ids, opts) -> { T, line:{id:[a,b]}, at(id, word, n=0), end(id), start(id) }
//   frame: C.render(outMp4, T, frameFn(ctx,t))   ·   C.stills(times, out, frameFn)   (contact sheet)
//   backgrounds: C.desk(ctx,t,opt)  C.paperBg(ctx,t,opt)   finish: C.finish(ctx,t,{mode:'dark'|'paper'})
//   camera: C.cam(ctx,{x,y,z,rot})  C.camReset(ctx)  C.shake(t,t0,amp)  C.whip(ctx,t,t0,dir) (motion-smear transition)
//   cards: C.card3d(ctx,img,pose)  C.pose(x,y,w,h,{rx,ry,rz,z})  C.boxOf(pose,[u0,v0,u1,v1])  C.flat(ctx,img,x,y,w,rot,opt)
//   docs (return canvases): C.docComplaint({...}) C.docLetter({...}) C.docReceipt({...}) C.boardingPass({...}) C.siteCard({...})
//                           C.searchCard({...}) C.verdictCard({...}) C.folder({...})
//   type: C.typed() C.punch() C.tag() C.todayTag() C.stamp() C.label() C.chapterCard()
//   marks: C.highlight() C.highlighter() C.markerEllipse() C.markerLine() C.writeOn() C.sticky() C.tape() C.crossOut()
//   numbers: C.counter(ctx,{from,to,t0,dur,x,y,size,prefix}) C.splitBar()
//   maps: C.map(ctx,cam,{land,hlIds}) C.mp(lon,lat,cam) C.route(ctx,cam,[[lon,lat]...],prog,opt) C.pin() C.cityDot()
//   things: C.plane(ctx,x,y,s,rot,opt) C.planeCut(ctx,x,y,s,opt) C.person(ctx,x,y,s,opt) C.suitcase() C.piggy()
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs'), path = require('path'), { spawn, spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '../../..');
const W = 1920, H = 1080, FPS = 30;
const F = '"Inter Display", Inter, sans-serif', MONO = '"DejaVu Sans Mono", monospace', SERIF = '"DejaVu Serif", serif';
let _fonts = false;
function fonts() { if (_fonts) return; _fonts = true; const fd = path.join(ROOT, 'tests/editing_styles/fonts');
  GlobalFonts.registerFromPath(path.join(fd, 'PermanentMarker-Regular.ttf'), 'Marker'); GlobalFonts.registerFromPath(path.join(fd, 'Caveat.ttf'), 'Caveat');
  GlobalFonts.registerFromPath(path.join(fd, 'SpecialElite-Regular.ttf'), 'Typer'); }
// ---------------- math ----------------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u;
const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, eo = u => 1 - Math.pow(1 - clamp(u), 3);
const eio = u => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const back = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const lin = (t, a, b) => clamp((t - a) / (b - a));
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const mk = (w, h) => { const c = createCanvas(Math.round(w), Math.round(h)); return [c, c.getContext('2d')]; };
// ---------------- timeline ----------------
// Words of one voice line from the ElevenLabs alignment: [{w, a, b}] (seconds from the line's file start).
function words(filmDir, id) { const al = JSON.parse(fs.readFileSync(path.join(filmDir, 'vo', id + '.align.json'))); const ch = al.characters, s = al.character_start_times_seconds, e = al.character_end_times_seconds;
  const out = []; let cur = null; for (let i = 0; i < ch.length; i++) { const c = ch[i]; if (/[A-Za-z0-9'’$€.,\-]/.test(c) && c !== ' ') { if (!cur) cur = { w: '', a: s[i], b: e[i] }; cur.w += c; cur.b = e[i]; } else if (cur) { out.push(cur); cur = null; } }
  if (cur) out.push(cur); return out; }
const nrm = s => s.toLowerCase().replace(/[^a-z0-9$€]/g, '');
// Lay out a chapter: lines in order, gap between (default 0.38 s), extra pauses via opts.pause {id: seconds after it}, lead/tail.
// Writes chapters/<ch>/timeline.json and merges into <film>/timeline.json (chapter order = opts.order or existing).
function timeline(filmDir, ch, ids, opts = {}) { const sp = JSON.parse(fs.readFileSync(path.join(filmDir, 'vo/speech.json')));
  const gap = opts.gap ?? 0.38, lead = opts.lead ?? 0.35, tail = opts.tail ?? 1.0, pause = opts.pause || {};
  let t = lead; const line = {}, place = {}; for (const id of ids) { const [s0, s1] = sp[id]; place[id] = t - s0; line[id] = [+(t).toFixed(3), +(t + s1 - s0).toFixed(3)]; t += s1 - s0 + gap + (pause[id] || 0); }
  const T = +(t - gap + tail).toFixed(3); const WD = {}; for (const id of ids) WD[id] = words(filmDir, id).map(o => ({ w: o.w, a: +(o.a + place[id]).toFixed(3), b: +(o.b + place[id]).toFixed(3) }));
  const rec = { ch, T, ids, line, place }; fs.mkdirSync(path.join(filmDir, 'chapters', ch), { recursive: true }); fs.writeFileSync(path.join(filmDir, 'chapters', ch, 'timeline.json'), JSON.stringify(rec, null, 0));
  const gp = path.join(filmDir, 'timeline.json'); let G = { order: [], chapters: {} }; try { G = JSON.parse(fs.readFileSync(gp)); } catch (e) {}
  G.chapters[ch] = { T, ids, line, place }; if (!G.order.includes(ch)) G.order.push(ch); G.order.sort(); let off = 0; for (const c of G.order) { if (!G.chapters[c]) continue; G.chapters[c].offset = +off.toFixed(3); off += G.chapters[c].T; } G.T = +off.toFixed(3);
  fs.writeFileSync(gp, JSON.stringify(G, null, 1));
  function at(id, word, n = 0) { let k = 0; for (const o of WD[id]) if (nrm(o.w).startsWith(nrm(word))) { if (k === n) return o.a; k++; } throw new Error(`word "${word}" not in ${id}: ${WD[id].map(o => o.w).join(' ')}`); }
  function atEnd(id, word, n = 0) { let k = 0; for (const o of WD[id]) if (nrm(o.w).startsWith(nrm(word))) { if (k === n) return o.b; k++; } throw new Error('word ' + word); }
  return { T, line, words: WD, at, atEnd, start: id => line[id][0], end: id => line[id][1], place }; }
// ---------------- render ----------------
function render(out, T, frameFn, opt = {}) { const c = createCanvas(W, H), ctx = c.getContext('2d'); const N = Math.round(T * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', opt.preset || 'medium', '-crf', String(opt.crf || 22), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  let i = opt.from ? Math.round(opt.from * FPS) : 0; const end = opt.to ? Math.round(opt.to * FPS) : N; const t0 = Date.now();
  return new Promise((res, rej) => { ff.on('close', code => code ? rej(new Error('ffmpeg ' + code)) : res());
    const step = () => { while (i < end) { frameFn(ctx, i / FPS, i); const buf = c.data(); i++; if (i % 300 === 0) process.stderr.write(`  ${out}: ${i}/${end} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`); if (!ff.stdin.write(Buffer.from(buf))) { ff.stdin.once('drain', step); return; } } ff.stdin.end(); };
    step(); }); }
function stills(times, out, frameFn, cols = 4, sc = 0.25) { const c = createCanvas(W, H), ctx = c.getContext('2d'); const w = W * sc, h = H * sc, rows = Math.ceil(times.length / cols);
  const [S, sx] = mk(w * cols, (h + 22) * rows); sx.fillStyle = '#111'; sx.fillRect(0, 0, S.width, S.height);
  times.forEach((t, i) => { frameFn(ctx, t, Math.round(t * FPS)); sx.drawImage(c, (i % cols) * w, Math.floor(i / cols) * (h + 22), w, h); sx.fillStyle = '#ff5'; sx.font = `16px ${MONO}`; sx.fillText(t.toFixed(2), (i % cols) * w + 6, Math.floor(i / cols) * (h + 22) + h + 17); });
  fs.writeFileSync(out, S.toBuffer('image/png')); }
// ---------------- textures ----------------
function paperTex(w, h, base, seed, fib = true) { const [c, x] = mk(w, h); x.fillStyle = base; x.fillRect(0, 0, w, h); const r = rnd(seed);
  for (let i = 0; i < 220; i++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); const cx = r() * w, cy = r() * h, rr = 30 + r() * 220; x.save(); x.translate(cx, cy); x.scale(rr, rr * (0.5 + r()));
    g.addColorStop(0, `rgba(${r() < 0.5 ? '120,90,50' : '255,250,235'},${0.03 + r() * 0.05})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); x.restore(); }
  if (fib) { x.lineWidth = 1; for (let i = 0; i < 700; i++) { x.strokeStyle = `rgba(90,70,40,${0.04 + r() * 0.05})`; const a = r() * 7, l = 6 + r() * 26, px = r() * w, py = r() * h; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + r() * 4, py + Math.sin(a) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } }
  return c; }
let TEX = null;
function tex() { if (TEX) return TEX; TEX = {}; TEX.paper = paperTex(W, H, '#E8DDC4', 7); TEX.ocean = paperTex(W, H, '#B7C7C1', 3, false); TEX.board = paperTex(W, H, '#A07E58', 11);
  TEX.grain = [0, 1, 2, 3].map(k => { const [c, x] = mk(W / 2, H / 2), d = x.createImageData(W / 2, H / 2), r = rnd(99 + k); for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; });
  const v = (a) => { const [c, x] = mk(W, H), g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); x.fillStyle = g; x.fillRect(0, 0, W, H); return c; };
  TEX.vigDark = v(0.85); TEX.vigPaper = v(0.45); return TEX; }
// ---------------- backgrounds + finish ----------------
function desk(ctx, t, o = {}) { const sx = o.sx ?? W / 2, sy = o.sy ?? H * 0.42; ctx.fillStyle = '#08090b'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(sx, sy, 20, sx, sy, H * 0.95); g.addColorStop(0, `rgba(${o.warm ? '150,120,85' : '120,112,98'},0.45)`); g.addColorStop(0.45, 'rgba(45,42,38,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const d = ctx.createLinearGradient(0, H * 0.7, 0, H); d.addColorStop(0, 'rgba(30,26,22,0)'); d.addColorStop(1, 'rgba(44,36,28,0.65)'); ctx.fillStyle = d; ctx.fillRect(0, H * 0.68, W, H * 0.32);
  for (let i = 0; i < 70; i++) { const x = (hash(i) * W + t * (8 + 14 * hash(i + 4))) % W, y = (hash(i + 9) * H - t * (5 + 6 * hash(i + 2)) + H * 10) % H; const r = Math.hypot(x - sx, y - sy) / (H * 0.7);
    ctx.fillStyle = `rgba(230,220,200,${0.28 * clamp(1 - r)})`; ctx.fillRect(x, y, 2, 2); } }
function paperBg(ctx, t, o = {}) { const X = tex(); ctx.drawImage(o.board ? X.board : X.paper, 0, 0); }
// grain + vignette (+ light leak on paper)
function finish(ctx, t, o = {}) { const X = tex(); camReset(ctx); ctx.globalAlpha = 1;
  ctx.drawImage(o.mode === 'paper' ? X.vigPaper : X.vigDark, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.mode === 'paper' ? 0.1 : 0.13; const gi = X.grain[Math.floor(t * 24) % 4]; ctx.drawImage(gi, 0, 0, W, H); ctx.restore();
  if (o.fade != null && o.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${clamp(o.fade)})`; ctx.fillRect(0, 0, W, H); } }
// ---------------- camera ----------------
let CAM = [1, 0, 0, 1, 0, 0];
function cam(ctx, c = {}) { const z = c.z ?? 1, rot = c.rot ?? 0, cx = c.x ?? W / 2, cy = c.y ?? H / 2; const a = Math.cos(rot) * z, b = Math.sin(rot) * z;
  CAM = [a, b, -b, a, W / 2 - (a * cx - b * cy), H / 2 - (b * cx + a * cy)]; ctx.setTransform(...CAM); }
function camReset(ctx) { CAM = [1, 0, 0, 1, 0, 0]; ctx.setTransform(1, 0, 0, 1, 0, 0); }
const curM = (a, b, c, d, e, f) => { const [A, B, Cc, D, E, Fz] = CAM; return [A * a + Cc * b, B * a + D * b, A * c + Cc * d, B * c + D * d, A * e + Cc * f + E, B * e + D * f + Fz]; };
function shake(t, t0, amp = 12, dur = 0.25) { if (t < t0 || t > t0 + dur) return [0, 0]; const u = 1 - (t - t0) / dur; return [(hash(Math.floor(t * 60)) - 0.5) * amp * u, (hash(Math.floor(t * 60) + 7) - 0.5) * amp * u]; }
// horizontal motion-smear over the finished frame around t0 (use at a cut; dir +1 / -1)
function whip(ctx, canvas, t, t0, dir = 1, dur = 0.28) { const u = (t - t0) / dur + 0.5; if (u < 0 || u > 1) return; const k = Math.sin(u * Math.PI); camReset(ctx);
  const [c, x] = mk(W / 4, H / 4); x.drawImage(canvas, 0, 0, W / 4, H / 4); ctx.save(); for (let i = 1; i <= 8; i++) { ctx.globalAlpha = 0.16 * k; ctx.drawImage(c, dir * i * 26 * k, 0, W, H); } ctx.restore(); }
// RGB-split glitch over the finished frame
function glitch(ctx, canvas, t, t0, dur = 0.2) { if (t < t0 || t > t0 + dur) return; const k = 1 - (t - t0) / dur; camReset(ctx); const [c, x] = mk(W, H); x.drawImage(canvas, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.5 * k; ctx.drawImage(c, 18 * k, 0); ctx.drawImage(c, -18 * k, 0); ctx.restore();
  for (let i = 0; i < 6; i++) { const y = hash(i + Math.floor(t * 30)) * H, h = 10 + hash(i * 3 + t) * 60; ctx.drawImage(c, 0, y, W, h, (hash(i + 5 + t) - 0.5) * 120 * k, y, W, h); } }
// ---------------- 3D cards ----------------
const FOC = 1700;
const pose = (x, y, w, h, o = {}) => ({ x, y, w, h, ...o });
function proj(p, u, v) { const x0 = (u - 0.5) * p.w, y0 = (v - 0.5) * p.h; const cy_ = Math.cos(p.ry || 0), sy = Math.sin(p.ry || 0), sx = Math.sin(p.rx || 0), cx_ = Math.cos(p.rx || 0);
  const x1 = x0 * cy_, z1 = x0 * sy; const y1 = y0 * cx_, z2 = z1 + y0 * sx; const k = FOC / (FOC + z2 + (p.z || 0)); const X = x1 * k, Y = y1 * k; const cr = Math.cos(p.rz || 0), sr = Math.sin(p.rz || 0); return [p.x + X * cr - Y * sr, p.y + X * sr + Y * cr]; }
function card3d(ctx, img, p, o = {}) { const N = o.strips || 36; const q = [proj(p, 0, 0), proj(p, 1, 0), proj(p, 1, 1), proj(p, 0, 1)]; const path_ = () => { ctx.beginPath(); q.forEach((a, i) => i ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1])); ctx.closePath(); };
  ctx.save(); ctx.globalAlpha = o.alpha ?? 1; if (o.shadow !== false) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 45; ctx.shadowOffsetY = 28; ctx.fillStyle = 'rgba(0,0,0,0.55)'; path_(); ctx.fill(); ctx.restore(); }
  for (let i = 0; i < N; i++) { const u0 = i / N, u1 = (i + 1) / N; const a = proj(p, u0, 0), b = proj(p, u0, 1), c = proj(p, u1, 0); const sw = img.width / N;
    ctx.save(); ctx.setTransform(...curM((c[0] - a[0]) / sw, (c[1] - a[1]) / sw, (b[0] - a[0]) / img.height, (b[1] - a[1]) / img.height, a[0], a[1])); ctx.drawImage(img, u0 * img.width, 0, sw + 1, img.height, 0, 0, sw + 1.2, img.height); ctx.restore(); }
  if (o.sheen !== false) { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,240,210,0.22)'; path_(); ctx.fill(); } ctx.restore(); return q; }
const boxOf = (p, r) => { const a = proj(p, r[0], r[1]), b = proj(p, r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
// flat object (cut-out) with paper border + drop shadow
function flat(ctx, img, cx, cy, w, rot = 0, o = {}) { const h = w * img.height / img.width, b = o.border ?? 0; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = o.alpha ?? 1;
  ctx.shadowColor = `rgba(0,0,0,${o.shadowA ?? 0.4})`; ctx.shadowBlur = o.blur ?? 26; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 14; if (b) { ctx.fillStyle = '#F5F1E6'; ctx.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b); ctx.shadowColor = 'transparent'; }
  ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore(); return { w, h }; }
// ---------------- document generators (canvases) ----------------
function docPaper(w, h, tint = '#eee6d3', seed = 1, border = true) { const [c, x] = mk(w, h); x.fillStyle = tint; x.fillRect(0, 0, w, h); const r = rnd(seed);
  for (let i = 0; i < 2200; i++) { x.fillStyle = `rgba(90,70,40,${0.025 + 0.045 * r()})`; x.fillRect(r() * w, r() * h, 2, 2); }
  const g = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(80,55,25,0.28)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  if (border) { x.strokeStyle = 'rgba(60,40,20,0.35)'; x.lineWidth = 2; x.strokeRect(18, 18, w - 36, h - 36); } return [c, x]; }
const ct = (x, s, X, Y, font, col = '#241c14', al = 'center', maxW) => { x.font = font; x.fillStyle = col; x.textAlign = al; x.textBaseline = 'alphabetic'; maxW ? x.fillText(s, X, Y, maxW) : x.fillText(s, X, Y); };
function textLines(x, X, Y, n, w, step = 30, seed = 1) { for (let i = 0; i < n; i++) { x.fillStyle = 'rgba(42,32,22,0.38)'; x.fillRect(X, Y + i * step, w * (0.72 + 0.28 * hash(i * 7 + seed)), 8); } }
// court complaint (re-created). o: {court, caption:[plaintiffs, 'v.', defendant], title, claim, amount, date, num, hl}
function docComplaint(o) { const w = 1000, h = 1290, [c, x] = docPaper(w, h, '#f1ece0', o.seed || 2, false);
  ct(x, o.court || 'UNITED STATES DISTRICT COURT', w / 2, 110, `700 34px ${SERIF}`); ct(x, o.district || '', w / 2, 152, `400 26px ${SERIF}`);
  x.fillStyle = '#241c14'; x.fillRect(80, 190, w - 160, 3); let y = 260; (o.caption || []).forEach((s, i) => { ct(x, s, 120, y, `${s === 'v.' ? 'italic 400' : '700'} ${s === 'v.' ? 28 : 34}px ${SERIF}`, '#241c14', 'left', 520); y += s === 'v.' ? 52 : 50; });
  ct(x, o.num || 'Case No. ________', w - 120, 290, `400 24px ${MONO}`, '#3a2e22', 'right'); x.fillRect(80, y + 10, w - 160, 3);
  ct(x, o.title || 'COMPLAINT', w / 2, y + 90, `700 46px ${SERIF}`); const yl = y + 150; const rows = [];
  (o.claims || []).forEach((s, i) => { ct(x, s, w / 2, yl + i * 62, `700 36px ${SERIF}`, '#3a2414'); rows.push([0.12, (yl + i * 62 - 42) / h, 0.88, (yl + i * 62 + 14) / h]); });
  textLines(x, 110, yl + (o.claims || []).length * 62 + 30, 9, w - 220, 36, 3);
  if (o.amount) { ct(x, o.amount, w / 2, h - 230, `700 64px ${SERIF}`, '#3a2414'); rows.push([0.2, (h - 290) / h, 0.8, (h - 210) / h]); }
  ct(x, o.date || '', 120, h - 110, `400 24px ${MONO}`, '#3a2e22', 'left'); ct(x, 'RE-CREATED DOCUMENT', w - 110, h - 60, `600 18px ${MONO}`, '#8a7a66', 'right'); return { c, hl: rows }; }
// letter (re-created). o: {from, subject, body:[...strings], amount, sign, hlIdx}
function docLetter(o) { const w = 1000, h = 1290, [c, x] = docPaper(w, h, '#f6f3ec', o.seed || 5, false); const rows = [];
  x.fillStyle = '#2b3442'; x.fillRect(0, 0, w, 120); ct(x, o.from || 'CORPORATE SECURITY', 80, 76, `700 32px ${F}`, '#e8ecf2', 'left');
  ct(x, o.date || '', w - 80, 76, `400 24px ${MONO}`, '#c8d0dc', 'right'); let y = 220;
  if (o.subject) { ct(x, 'RE:', 80, y, `700 28px ${SERIF}`, '#241c14', 'left'); const ls = o.subject; ls.forEach((s, i) => { ct(x, s, 150, y + i * 40, `700 28px ${SERIF}`, '#241c14', 'left', w - 230); rows.push([0.14, (y + i * 40 - 30) / h, 0.92, (y + i * 40 + 10) / h]); }); y += ls.length * 40 + 50; }
  (o.body || []).forEach((s, i) => { if (s === '-') { textLines(x, 80, y, 3, w - 160, 34, i); y += 110; return; } ct(x, s, 80, y, `400 28px ${SERIF}`, '#241c14', 'left', w - 160); rows.push([0.07, (y - 30) / h, 0.93, (y + 10) / h]); y += 46; });
  if (o.amount) { y += 30; ct(x, o.amount, w / 2, y + 40, `700 70px ${SERIF}`, '#3a2414'); rows.push([0.2, (y - 30) / h, 0.8, (y + 60) / h]); y += 120; }
  textLines(x, 80, y + 10, 4, w - 160, 34, 9); ct(x, o.sign || '', 80, h - 140, `italic 30px ${SERIF}`, '#241c14', 'left'); ct(x, 'RE-CREATED DOCUMENT', w - 80, h - 60, `600 18px ${MONO}`, '#8a7a66', 'right'); return { c, hl: rows }; }
// receipt. o: {title, rows:[[label, value]], total:[label,value], note}
function docReceipt(o) { const w = 640, h = 140 + (o.rows || []).length * 56 + 220, [c, x] = docPaper(w, h, '#fbfaf5', o.seed || 7, false);
  x.fillStyle = '#fbfaf5'; for (let i = 0; i < w; i += 20) { x.beginPath(); x.moveTo(i, h); x.lineTo(i + 10, h - 12); x.lineTo(i + 20, h); x.fill(); }
  ct(x, o.title || 'RECEIPT', w / 2, 80, `700 34px ${MONO}`, '#222'); x.setLineDash([8, 8]); x.strokeStyle = '#999'; x.beginPath(); x.moveTo(40, 110); x.lineTo(w - 40, 110); x.stroke(); let y = 170;
  (o.rows || []).forEach(([a, b]) => { ct(x, a, 50, y, `500 26px ${MONO}`, '#333', 'left'); ct(x, b, w - 50, y, `600 26px ${MONO}`, '#222', 'right'); y += 56; });
  x.beginPath(); x.moveTo(40, y - 20); x.lineTo(w - 40, y - 20); x.stroke(); x.setLineDash([]); if (o.total) { ct(x, o.total[0], 50, y + 40, `700 32px ${MONO}`, '#111', 'left'); ct(x, o.total[1], w - 50, y + 40, `800 52px ${MONO}`, '#111', 'right'); }
  ct(x, o.note || '', w / 2, h - 50, `500 20px ${MONO}`, '#777'); return { c }; }
// boarding pass. o: {name, legs:[['LAX','IAD'],['IAD','BOS']], flight, price, accent, stub, crossLeg}
function boardingPass(o) { const w = 1300, h = 520, [c, x] = mk(w, h); const acc = o.accent || '#2f5d8a';
  x.fillStyle = '#fbfaf6'; roundRect(x, 0, 0, w, h, 26); x.fill(); x.fillStyle = acc; roundRect(x, 0, 0, w, 96, 26); x.fill(); x.fillRect(0, 60, w, 36);
  ct(x, 'BOARDING PASS', 50, 64, `800 36px ${F}`, '#fff', 'left'); ct(x, o.carrier || 'AIRLINE', w - 360, 64, `700 30px ${F}`, 'rgba(255,255,255,0.85)', 'right');
  x.setLineDash([10, 10]); x.strokeStyle = '#c7c2b6'; x.lineWidth = 3; x.beginPath(); x.moveTo(w - 330, 110); x.lineTo(w - 330, h - 20); x.stroke(); x.setLineDash([]);
  const legs = o.legs || [['LAX', 'IAD']]; const n = legs.length + 1, codes = [legs[0][0], ...legs.map(l => l[1])]; const x0 = 70, x1 = w - 400; const pos = codes.map((_, i) => x0 + (x1 - x0) * i / (n - 1));
  codes.forEach((cd, i) => { ct(x, cd, pos[i], 250, `800 ${n > 2 ? 86 : 120}px ${F}`, '#1d2430', i === 0 ? 'left' : i === n - 1 ? 'right' : 'center'); ct(x, (o.cities || [])[i] || '', pos[i], 296, `500 26px ${F}`, '#6b7280', i === 0 ? 'left' : i === n - 1 ? 'right' : 'center'); });
  for (let i = 0; i < n - 1; i++) { const hw = n > 2 ? 0.62 : 1; const a = pos[i] + (i === 0 ? (n > 2 ? 205 : 225) : 115), b = pos[i + 1] - (i === n - 2 ? (n > 2 ? 205 : 225) : 115); if (b - a < 30) continue; x.strokeStyle = '#9aa3af'; x.lineWidth = 4; x.setLineDash([12, 10]); x.beginPath(); x.moveTo(a, 215); x.lineTo(b, 215); x.stroke(); x.setLineDash([]); if (b - a > 120) plane(x, (a + b) / 2, 215, 0.42, 0, { col: '#9aa3af' }); }
  const info = o.info || [['FLIGHT', o.flight || 'UA 000'], ['DATE', o.date || 'JUL 10'], ['SEAT', o.seat || '23C']]; info.forEach(([a, b], i) => { ct(x, a, 70 + i * 230, 370, `600 22px ${MONO}`, '#8a8f98', 'left'); ct(x, b, 70 + i * 230, 412, `800 34px ${F}`, '#1d2430', 'left'); });
  ct(x, 'FARE', w - 165, 190, `600 24px ${MONO}`, '#8a8f98'); ct(x, o.price || '$0', w - 165, 290, `900 ${o.price && o.price.length > 5 ? 84 : 100}px ${F}`, acc);
  for (let i = 0; i < 26; i++) { x.fillStyle = '#1d2430'; const bw = 2 + (hash(i * 3.3) * 7 | 0); x.fillRect(w - 300 + i * 10, 360, bw, 90); }
  return { c, pos, codes }; }
function roundRect(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
// fare-search "screen" (generic). o: {from, to, rows:[[route, price]], note}
function searchCard(o) { const w = 1300, h = 760, [c, x] = mk(w, h); x.fillStyle = '#f4f5f7'; roundRect(x, 0, 0, w, h, 20); x.fill(); x.fillStyle = '#dfe3e8'; roundRect(x, 0, 0, w, 64, 20); x.fill(); x.fillRect(0, 40, w, 24);
  ['#ef6a5e', '#f5bf4f', '#61c454'].forEach((cl, i) => { x.fillStyle = cl; x.beginPath(); x.arc(40 + i * 34, 32, 11, 0, 7); x.fill(); });
  x.fillStyle = '#fff'; roundRect(x, 160, 14, w - 220, 36, 18); x.fill(); ct(x, o.url || 'fare search', 190, 40, `500 20px ${MONO}`, '#7a808a', 'left');
  ct(x, o.head || 'ONE-WAY  ·  1 ADULT', 60, 130, `700 26px ${F}`, '#6b7280', 'left'); x.fillStyle = '#fff'; roundRect(x, 60, 160, w - 120, 96, 14); x.fill(); x.strokeStyle = '#d1d5db'; x.lineWidth = 2; roundRect(x, 60, 160, w - 120, 96, 14); x.stroke();
  ct(x, o.query || '', 100, 225, `700 44px ${F}`, '#111827', 'left'); const rows = []; (o.rows || []).forEach(([a, b, sub], i) => { const y = 300 + i * 140; x.fillStyle = '#fff'; roundRect(x, 60, y, w - 120, 116, 14); x.fill();
    ct(x, a, 100, y + 64, `800 46px ${F}`, '#111827', 'left'); if (sub) ct(x, sub, 100, y + 100, `500 24px ${F}`, '#6b7280', 'left'); ct(x, b, w - 100, y + 78, `900 64px ${F}`, '#111827', 'right'); rows.push([60 / w, y / h, (w - 60) / w, (y + 116) / h]); });
  ct(x, o.note || '', 60, h - 30, `500 22px ${MONO}`, '#8a8f98', 'left'); return { c, hl: rows }; }
// website card (generic, no real branding). o: {name, tagline, input}
function siteCard(o) { const w = 1300, h = 760, s = searchCard({ url: o.url || 'skiplagged.com', head: '', query: o.input || 'Where do you want to go?', rows: o.rows || [], note: o.note });
  const x = s.c.getContext('2d'); x.fillStyle = '#f4f5f7'; x.fillRect(40, 80, w - 80, 70); ct(x, o.name || 'SITE', 60, 140, `900 54px ${F}`, '#1f2937', 'left'); ct(x, o.tagline || '', w - 60, 135, `500 26px ${F}`, '#6b7280', 'right'); return s; }
// verdict card. o: {title, rows:[[k, v, col]]}
function verdictCard(o) { const rows = o.rows || [], w = 1400, h = 260 + rows.length * 92, [c, x] = docPaper(w, h, '#ece4d4', 11);
  ct(x, o.case || 'CASE FILE', w / 2, 80, `700 30px ${MONO}`, '#5a4a36'); ct(x, o.title || 'VERDICT', w / 2, 175, `900 92px ${F}`, '#1a1410'); x.fillStyle = '#1a1410'; x.fillRect(w / 2 - 330, 200, 660, 6);
  rows.forEach(([k, v, col], i) => { const y = 290 + i * 92; ct(x, k, 120, y, `800 46px ${F}`, '#1a1410', 'left'); ct(x, v, w - 120, y, `900 50px ${F}`, col || '#b3241a', 'right'); x.fillStyle = 'rgba(26,20,16,0.15)'; x.fillRect(110, y + 26, w - 220, 2); }); return { c, rowY: rows.map((_, i) => (290 + i * 92) / h), h }; }
// manila folder cover. o: {label, sub}
function folder(o) { const w = 1500, h = 1000, [c, x] = mk(w, h); x.fillStyle = '#c9a66b'; x.beginPath(); x.moveTo(0, 80); x.lineTo(380, 80); x.lineTo(430, 0); x.lineTo(820, 0); x.lineTo(870, 80); x.lineTo(w, 80); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
  const r = rnd(4); for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(90,60,20,${0.04 + r() * 0.05})`; x.fillRect(r() * w, r() * h, 2, 2); }
  x.fillStyle = '#efe7d6'; x.fillRect(420, 360, 660, 230); x.strokeStyle = '#8a6a3a'; x.lineWidth = 3; x.strokeRect(420, 360, 660, 230); ct(x, o.label || 'CASE FILE', w / 2, 470, `400 68px Typer`, '#241c14'); ct(x, o.sub || '', w / 2, 540, `400 32px Typer`, '#5a4a36'); return { c }; }
// ---------------- type ----------------
function typed(ctx, s, x, y, t0, t, size = 30, col = '#d8d2c4', o = {}) { if (t < t0) return; const n = Math.floor(clamp((t - t0) * (o.cps || 30), 0, s.length)); ctx.save(); ctx.font = `${o.weight || 600} ${size}px ${o.font || MONO}`; ctx.fillStyle = col; ctx.textAlign = o.al || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(s.slice(0, n) + ((n < s.length || (o.cursor !== false && Math.floor(t * 2) % 2)) ? '▌' : ''), x, y); ctx.restore(); }
function punch(ctx, s, x, y, t0, t, size, col = '#f2d33b', o = {}) { if (t < t0 || (o.until && t > o.until)) return; const u = clamp((t - t0) / 0.22), sc = lerp(o.from || 1.6, 1, eo(u)), sh = (1 - u) * 14; const out = o.until ? clamp((o.until - t) / 0.15) : 1;
  ctx.save(); ctx.translate(x + (hash(Math.floor(t * 60)) - 0.5) * sh, y + (hash(Math.floor(t * 60) + 3) - 0.5) * sh); ctx.rotate(o.rot || 0); ctx.scale(sc, sc); ctx.globalAlpha = clamp(u * 3) * out;
  ctx.font = `900 ${size}px ${o.font || F}`; ctx.textAlign = o.al || 'center'; ctx.textBaseline = 'middle'; const mw = o.maxW || 1800; let fs = size; while (ctx.measureText(s).width > mw && fs > 20) { fs -= 4; ctx.font = `900 ${fs}px ${o.font || F}`; }
  if (o.stroke !== false) { ctx.lineWidth = fs * 0.12; ctx.strokeStyle = o.strokeCol || 'rgba(0,0,0,0.85)'; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0); } ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); }
function tag(ctx, s, x, y, o = {}) { const size = o.size || 26; ctx.save(); ctx.font = `700 ${size}px ${MONO}`; const w = ctx.measureText(s).width; ctx.globalAlpha = o.alpha ?? 1; const X = o.al === 'right' ? x - w - 28 : o.al === 'center' ? x - (w + 28) / 2 : x;
  ctx.fillStyle = o.bg || '#f2d33b'; ctx.fillRect(X, y - size - 8, w + 28, size + 22); ctx.fillStyle = o.col || '#111'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, X + 14, y + 3); ctx.restore(); return w + 28; }
// "≈ $X TODAY" tag that slides in
function todayTag(ctx, s, x, y, t0, t, o = {}) { if (t < t0) return; const u = eo((t - t0) / 0.3); tag(ctx, '≈ ' + s + ' TODAY', x + (1 - u) * 40, y, { size: o.size || 30, bg: o.bg || '#1d2430', col: o.col || '#f2d33b', alpha: u, al: o.al }); }
function stamp(ctx, s, x, y, t0, t, size = 70, col = '#d0281c', rot = -0.08, o = {}) { if (t < t0) return; const u = clamp((t - t0) / 0.16); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const k = lerp(2, 1, eo(u)); ctx.scale(k, k); ctx.globalAlpha = (o.alpha ?? 0.92) * u;
  ctx.font = `900 ${size}px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const w = ctx.measureText(s).width + size * 0.6; ctx.strokeStyle = col; ctx.lineWidth = size * 0.09; ctx.strokeRect(-w / 2, -size * 0.7, w, size * 1.4); ctx.fillStyle = col; ctx.fillText(s, 0, size * 0.04);
  // ink texture
  ctx.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 90; i++) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect((hash(i * 1.3) - 0.5) * w, (hash(i * 2.7) - 0.5) * size * 1.4, 3 + hash(i) * 6, 2 + hash(i + 1) * 4); } ctx.restore(); }
// big label: dark plate with white text (for the dark desk) or ink text (paper)
function label(ctx, s, x, y, o = {}) { const size = o.size || 64; ctx.save(); ctx.globalAlpha = o.alpha ?? 1; ctx.font = `900 ${size}px ${F}`; ctx.textAlign = o.al || 'center'; ctx.textBaseline = 'middle'; let fs = size; while (ctx.measureText(s).width > (o.maxW || 1700) && fs > 20) { fs -= 4; ctx.font = `900 ${fs}px ${F}`; }
  if (o.plate) { const w = ctx.measureText(s).width; const X = o.al === 'left' ? x : o.al === 'right' ? x - w : x - w / 2; ctx.fillStyle = o.plate; ctx.fillRect(X - 26, y - fs * 0.7, w + 52, fs * 1.4); }
  ctx.fillStyle = o.col || '#f3efe6'; ctx.fillText(s, x, y); ctx.restore(); }
// chapter card: typed "PART n:" + title, on the current background
function chapterCard(ctx, t, t0, part, title, o = {}) { if (t < t0) return; const dark = o.mode !== 'paper'; const u = t - t0; const dur = o.dur || 2.4;
  // a big taped paper slip slides in with a tilt, the title is set huge, "PART n" is stamped on it; slow push + drift, slides out at the end
  camReset(ctx); ctx.save(); if (dark) { ctx.fillStyle = `rgba(0,0,0,${0.6 * clamp(u / 0.3)})`; ctx.fillRect(0, 0, W, H); }
  const kin = back(clamp(u / 0.5)), kout = o.out === false ? 0 : eio(clamp((u - (dur - 0.35)) / 0.35)); const z = 1 + 0.04 * clamp(u / dur);
  const cw = 1560, chh = 640, cx = W / 2 + (1 - kin) * -W * 0.9 + kout * W * 1.1, cy = H * 0.5 + Math.sin(u * 1.3) * 6, rot = lerp(-0.12, -0.025, kin) + kout * 0.08;
  ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(z, z);
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 26; ctx.fillStyle = dark ? '#ece4d4' : '#f6f0e1'; ctx.fillRect(-cw / 2, -chh / 2, cw, chh); ctx.shadowColor = 'transparent';
  const r = rnd(31); for (let i = 0; i < 1400; i++) { ctx.fillStyle = `rgba(90,70,40,${0.03 + 0.05 * r()})`; ctx.fillRect((r() - 0.5) * cw, (r() - 0.5) * chh, 2, 2); }
  ctx.strokeStyle = 'rgba(60,40,20,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(-cw / 2 + 24, -chh / 2 + 24, cw - 48, chh - 48);
  // PART n — small, typed, top-left; a red rule
  ctx.font = `400 46px Typer`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#b3241a'; const np = Math.floor(clamp((u - 0.25) * 18, 0, part.length)); ctx.fillText(part.slice(0, np), -cw / 2 + 90, -chh / 2 + 120);
  ctx.fillStyle = '#b3241a'; ctx.fillRect(-cw / 2 + 90, -chh / 2 + 150, (cw - 180) * eo(clamp((u - 0.35) / 0.5)), 6);
  // title — huge, wraps to 2 lines, each word pops in
  const words_ = title.split(' '); let fs = o.size || 150; ctx.font = `900 ${fs}px ${F}`; let lines = [title];
  const fit = () => { lines = []; let cur = ''; for (const w of words_) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > cw - 200 && cur) { lines.push(cur); cur = w; } else cur = tr; } lines.push(cur); };
  fit(); while ((lines.length > 2 || lines.some(l => ctx.measureText(l).width > cw - 200)) && fs > 60) { fs -= 6; ctx.font = `900 ${fs}px ${F}`; fit(); }
  let wi = 0; lines.forEach((l, li) => { const y = -chh / 2 + 300 + li * fs * 1.05 - (lines.length === 1 ? -fs * 0.4 : 0); let x = -cw / 2 + 90;
    for (const w of l.split(' ')) { const k = clamp((u - 0.45 - wi * 0.07) / 0.18); if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.translate(x, y + (1 - eo(k)) * 30); ctx.fillStyle = li === lines.length - 1 ? '#241c14' : '#241c14'; ctx.font = `900 ${fs}px ${F}`; ctx.fillText(w, 0, 0); ctx.restore(); }
      x += ctx.measureText(w + ' ').width; wi++; } });
  // marker underline under the last line
  const ll = lines[lines.length - 1]; const lw = ctx.measureText(ll).width, ly = -chh / 2 + 300 + (lines.length - 1) * fs * 1.05 + 34 + (lines.length === 1 ? fs * 0.4 : 0);
  markerLine(ctx, curve([-cw / 2 + 90, ly], [-cw / 2 + 90 + lw, ly - 6], 0.01, 30, 2), (u - 0.45 - wi * 0.07) / 0.5, '#b3241a', 10, false);
  ctx.restore();
  // tape on two corners + a "CASE FILE" stamp, in screen space following the slip
  const tp = (dx, dy, rr) => { const c = Math.cos(rot), sn = Math.sin(rot); tape(ctx, cx + (dx * c - dy * sn) * z, cy + (dx * sn + dy * c) * z, 220, rot + rr); };
  if (kin > 0.95) { tp(-cw / 2 + 40, -chh / 2 + 10, -0.6); tp(cw / 2 - 40, -chh / 2 + 10, 0.6); }
  const c = Math.cos(rot), sn = Math.sin(rot), sx = cw / 2 - 230, sy = chh / 2 - 110; stamp(ctx, 'CASE FILE', cx + (sx * c - sy * sn) * z, cy + (sx * sn + sy * c) * z, t0 + 0.95, t, 54, '#b3241a', -0.12 + rot);
}
// ---------------- marks ----------------
const RED = '#C9271C', INK = '#2A221A', YEL = '#f2d33b';
function highlight(ctx, q, t0, t, o = {}) { if (t < t0 || (o.until && t > o.until)) return; const u = eo((t - t0) / 0.35); const [x0, y0, x1, y1] = q; const pad = o.pad ?? 10; const dim = (o.dim ?? 0.6) * clamp((t - t0) / 0.25) * (o.until ? clamp((o.until - t) / 0.2) : 1);
  ctx.save(); if (dim > 0) { ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.beginPath(); ctx.rect(-W, -H, 3 * W, 3 * H); ctx.rect(x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad); ctx.fill('evenodd'); }
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,225,60,0.5)'; ctx.fillRect(x0 - pad, y0 - pad, (x1 - x0 + 2 * pad) * u, y1 - y0 + 2 * pad);
  ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = YEL; ctx.lineWidth = 5; ctx.strokeRect(x0 - pad, y0 - pad, (x1 - x0 + 2 * pad) * u, y1 - y0 + 2 * pad); ctx.restore(); }
function highlighter(ctx, X, Y, w, h, prog, col = 'rgba(250,224,40,0.72)') { if (prog <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = col; ctx.beginPath(); const ww = w * clamp(prog);
  ctx.moveTo(X, Y + 4); ctx.lineTo(X + ww, Y); ctx.lineTo(X + ww + 6, Y + h - 2); ctx.lineTo(X - 4, Y + h + 2); ctx.closePath(); ctx.fill(); ctx.restore(); }
function markerEllipse(ctx, cx, cy, rx, ry, prog, seed = 1, col = RED, lw = 8) { if (prog <= 0) return; const r = rnd(seed); const a0 = -2.2 + r() * 0.4, turn = 2 * Math.PI * 1.12, N = 90, j = [r(), r()];
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 0.92; ctx.beginPath();
  for (let i = 0; i <= N * clamp(prog); i++) { const k = i / N, a = a0 + turn * k, rr = 1 + 0.06 * Math.sin(a * 2 + j[0] * 6) + 0.04 * k + 0.02 * Math.sin(a * 5 + j[1] * 9); const px = cx + Math.cos(a) * rx * rr, py = cy + Math.sin(a) * ry * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); }
function markerLine(ctx, pts, prog, col = RED, lw = 8, head = true) { if (prog <= 0) return; let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let rem = tot * clamp(prog); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 0.92; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); let last = pts[0], prev = pts[0];
  for (let i = 1; i < pts.length && rem > 0; i++) { const k = Math.min(1, rem / seg[i - 1]); last = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; prev = pts[i - 1]; ctx.lineTo(last[0], last[1]); rem -= seg[i - 1]; } ctx.stroke();
  if (head && prog > 0.97) { const a = Math.atan2(last[1] - prev[1], last[0] - prev[0]); ctx.beginPath(); ctx.moveTo(last[0] - Math.cos(a - 0.5) * 34, last[1] - Math.sin(a - 0.5) * 34); ctx.lineTo(last[0], last[1]); ctx.lineTo(last[0] - Math.cos(a + 0.5) * 34, last[1] - Math.sin(a + 0.5) * 34); ctx.stroke(); }
  ctx.restore(); return last; }
function curve(p0, p1, bend, n = 40, wob = 2) { const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1]; const c = [mx - dy * bend, my + dx * bend]; const o = [];
  for (let i = 0; i <= n; i++) { const t = i / n; o.push([(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0] + Math.sin(t * 19) * wob, (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1] + Math.cos(t * 23) * wob]); } return o; }
function crossOut(ctx, x0, y0, x1, y1, prog, col = RED, lw = 12) { markerLine(ctx, [[x0, y0], [x1, y1]], clamp(prog * 2), col, lw, false); markerLine(ctx, [[x1, y0], [x0, y1]], clamp(prog * 2 - 1), col, lw, false); }
function writeOn(ctx, s, X, Y, font, col, prog, align = 'left') { if (prog <= 0) return; ctx.save(); ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; const w = ctx.measureText(s).width; const left = align === 'center' ? X - w / 2 : align === 'right' ? X - w : X;
  ctx.beginPath(); ctx.rect(left - 10, Y - 200, (w + 30) * clamp(prog), 300); ctx.clip(); ctx.fillStyle = col; ctx.fillText(s, X, Y); ctx.restore(); }
function tape(ctx, cx, cy, w, rot) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.fillStyle = 'rgba(236,226,196,0.8)'; ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 4; ctx.beginPath(); ctx.moveTo(-w / 2, -18);
  for (let i = 0; i <= 6; i++) ctx.lineTo(-w / 2 + (w * i) / 6, -18 + (i % 2) * 2); ctx.lineTo(w / 2 + 3, 0); ctx.lineTo(w / 2, 18); for (let i = 6; i >= 0; i--) ctx.lineTo(-w / 2 + (w * i) / 6, 18 - (i % 2) * 2); ctx.lineTo(-w / 2 - 3, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
function sticky(ctx, lines, cx, cy, w, rot, k, o = {}) { if (k <= 0) return; const s = o.pop === false ? 1 : back(clamp(k)); ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 3) * (o.alpha ?? 1);
  const h = o.h || w; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 10; ctx.fillStyle = o.col || '#F4D85A'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(-w / 2, h / 2 - 16, w, 16); ctx.fillStyle = o.ink || INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let fs = o.size || 54; ctx.font = `${fs}px Marker`; while (Math.max(...lines.map(l => ctx.measureText(l).width)) > w * 0.86 && fs > 18) { fs -= 2; ctx.font = `${fs}px Marker`; }
  lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * fs * 1.15 + 4)); ctx.restore(); if (o.tape !== false && k > 0.6) tape(ctx, cx + Math.sin(rot) * h * 0.5, cy - Math.cos(rot) * h * 0.5, w * 0.45, rot + 0.05); }
// ---------------- numbers ----------------
const fmt = n => Math.round(n).toLocaleString('en-US');
function counter(ctx, o, t) { if (t < o.t0) return; const u = eio((t - o.t0) / (o.dur || 1.2)); const v = lerp(o.from || 0, o.to, u); const s = (o.prefix || '$') + (o.fmt ? o.fmt(v) : fmt(v)) + (o.suffix || '');
  punch(ctx, s, o.x, o.y, o.t0, t, o.size || 160, o.col || YEL, { stroke: o.stroke, from: 1.3, font: o.font, maxW: o.maxW }); return u; }
// two-part bar: o: {x,y,w,h, parts:[[label, frac, col]], t0}
function splitBar(ctx, o, t) { if (t < o.t0) return; let X = o.x; o.parts.forEach(([lab, f, col], i) => { const u = eo((t - o.t0 - i * 0.5) / 0.6); const w = o.w * f * u; ctx.fillStyle = col; ctx.fillRect(X, o.y, w, o.h);
    if (u > 0.6) label(ctx, lab, X + o.w * f / 2, o.y + o.h / 2, { size: o.size || 56, col: '#111', alpha: clamp((u - 0.6) * 3), maxW: o.w * f - 30 }); X += o.w * f; });
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4; ctx.strokeRect(o.x, o.y, o.w, o.h); }
// ---------------- maps ----------------
let RINGS = null;
function rings() { if (RINGS) return RINGS; const tc = require(path.join(ROOT, 'longform/matchking_history/node_modules/topojson-client')); const WA = require(path.join(ROOT, 'longform/matchking_history/node_modules/world-atlas/countries-50m.json'));
  const FEAT = tc.feature(WA, WA.objects.countries).features; RINGS = []; for (const f of FEAT) { const g = f.geometry; if (!g) continue; const P = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; for (const p of P) RINGS.push({ id: f.id, ring: p[0] }); } return RINGS; }
const RAD = Math.PI / 180;
// orthographic projection: cam = {lon, lat, R} (R = pixel radius of the globe; 2000+ = regional map)
function mp(lon, lat, cam) { const l0 = cam.lon * RAD, p0 = cam.lat * RAD, l = lon * RAD, p = lat * RAD; const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
  const x = Math.cos(p) * Math.sin(l - l0), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0); return [W / 2 + cam.R * x + (cam.dx || 0), H / 2 - cam.R * y + (cam.dy || 0), cosc]; }
function landPath(ctx, cam, filter) { ctx.beginPath(); for (const r of rings()) { if (filter && !filter(r.id)) continue; let pen = false, anyOn = false; const pts = r.ring.map(([lo, la]) => mp(lo, la, cam));
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9; for (const p of pts) { if (p[2] > 0) { anyOn = true; minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); } }
    if (!anyOn || maxx < -50 || minx > W + 50 || maxy < -50 || miny > H + 50) continue; for (const p of pts) { if (p[2] <= 0) { pen = false; continue; } if (!pen) { ctx.moveTo(p[0], p[1]); pen = true; } else ctx.lineTo(p[0], p[1]); } ctx.closePath(); } }
// paper map (no globe rim unless R small). o: {hl: [ids], hlCol, land, dim}
function map(ctx, cam, o = {}) { const X = tex(); ctx.save(); ctx.drawImage(X.ocean, 0, 0); if (cam.R < 1600) { ctx.fillStyle = '#14181c'; ctx.fillRect(0, 0, W, H); ctx.beginPath(); ctx.arc(W / 2 + (cam.dx || 0), H / 2 + (cam.dy || 0), cam.R, 0, 7); ctx.clip(); ctx.drawImage(X.ocean, 0, 0); }
  ctx.strokeStyle = 'rgba(60,80,80,0.16)'; ctx.lineWidth = 1.2; for (let lo = -180; lo < 180; lo += 10) { ctx.beginPath(); let pen = false; for (let la = -80; la <= 80; la += 2) { const p = mp(lo, la, cam); if (p[2] <= 0) { pen = false; continue; } pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } ctx.stroke(); }
  for (let la = -80; la <= 80; la += 10) { ctx.beginPath(); let pen = false; for (let lo = -180; lo <= 180; lo += 2) { const p = mp(lo, la, cam); if (p[2] <= 0) { pen = false; continue; } pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } ctx.stroke(); }
  ctx.save(); ctx.translate(4, 6); landPath(ctx, cam); ctx.fillStyle = 'rgba(40,50,50,0.22)'; ctx.fill(); ctx.restore(); landPath(ctx, cam); ctx.fillStyle = o.land || '#E6D8B8'; ctx.fill();
  if (o.hl) { landPath(ctx, cam, id => o.hl.includes(id)); ctx.fillStyle = o.hlCol || 'rgba(232,190,70,0.5)'; ctx.fill(); }
  landPath(ctx, cam); ctx.strokeStyle = 'rgba(92,70,45,0.7)'; ctx.lineWidth = 1.6; ctx.stroke(); if (o.after) o.after(ctx);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.drawImage(X.paper, 0, 0); ctx.restore(); }
// dashed route along a great-ish curve; returns the head point. o: {col, lw, bend, dash, dot:'plane'|'dot'|null}
function route(ctx, cam, pts, prog, o = {}) { if (prog <= 0) return null; const P = pts.map(p => mp(p[0], p[1], cam)); let all = []; for (let i = 1; i < P.length; i++) { const c = curve(P[i - 1], P[i], o.bend ?? -0.12, 50, 0); if (i > 1) c.shift(); all = all.concat(c); }
  let tot = 0; const seg = []; for (let i = 1; i < all.length; i++) { const d = Math.hypot(all[i][0] - all[i - 1][0], all[i][1] - all[i - 1][1]); seg.push(d); tot += d; }
  let rem = tot * clamp(prog); ctx.save(); ctx.strokeStyle = o.col || RED; ctx.lineWidth = o.lw || 7; ctx.lineCap = 'round'; ctx.setLineDash(o.dash || [18, 14]); ctx.beginPath(); ctx.moveTo(all[0][0], all[0][1]); let last = all[0], ang = 0;
  for (let i = 1; i < all.length && rem > 0; i++) { const k = Math.min(1, rem / seg[i - 1]); const p = [lerp(all[i - 1][0], all[i][0], k), lerp(all[i - 1][1], all[i][1], k)]; ang = Math.atan2(all[i][1] - all[i - 1][1], all[i][0] - all[i - 1][0]); ctx.lineTo(p[0], p[1]); last = p; rem -= seg[i - 1]; }
  ctx.stroke(); ctx.setLineDash([]); ctx.restore(); if (o.dot === 'plane' && prog < 1.0001) plane(ctx, last[0], last[1], o.planeS || 0.8, ang, { col: o.planeCol || '#1d2430' }); else if (o.dot === 'dot') { ctx.fillStyle = o.col || RED; ctx.beginPath(); ctx.arc(last[0], last[1], 10, 0, 7); ctx.fill(); }
  return { p: last, ang }; }
function cityDot(ctx, cam, lon, lat, name, o = {}) { const p = mp(lon, lat, cam); ctx.save(); ctx.globalAlpha = o.alpha ?? 1; ctx.fillStyle = o.col || INK; ctx.beginPath(); ctx.arc(p[0], p[1], o.r || 11, 0, 7); ctx.fill(); ctx.strokeStyle = '#f4ecd8'; ctx.lineWidth = 4; ctx.stroke();
  if (name) { ctx.font = `${o.size || 44}px Marker`; ctx.textAlign = o.al || 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(244,236,216,0.9)'; const X = p[0] + (o.al === 'right' ? -24 : o.al === 'center' ? 0 : 24), Y = p[1] + (o.dy || 0); ctx.strokeText(name, X, Y); ctx.fillStyle = o.ink || INK; ctx.fillText(name, X, Y); }
  ctx.restore(); return p; }
function pin(ctx, px, py, k, o = {}) { if (k <= 0) return; const drop = (1 - eo(clamp(k * 1.6))) * -160; ctx.save(); ctx.translate(px, py + drop); ctx.globalAlpha = clamp(k * 4);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(6, 4 - drop, 12, 5, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.stroke();
  const g = ctx.createRadialGradient(-6, -60, 2, 0, -54, 20); g.addColorStop(0, o.light || '#ff8a7a'); g.addColorStop(1, o.col || '#B3170E'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -54, 17, 0, 7); ctx.fill(); ctx.restore(); }
// ---------------- things ----------------
// generic airliner silhouette, top view, pointing +x. s=1 → ~ 220 px long
function plane(ctx, x, y, s = 1, rot = 0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = o.alpha ?? 1;
  if (o.shadow) { ctx.save(); ctx.translate(18, 26); ctx.fillStyle = 'rgba(0,0,0,0.22)'; planePath(ctx); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = o.col || '#e9edf2'; planePath(ctx); ctx.fill(); if (o.stroke !== false) { ctx.strokeStyle = o.strokeCol || 'rgba(20,30,40,0.55)'; ctx.lineWidth = 3 / s; ctx.stroke(); }
  if (o.stripe) { ctx.fillStyle = o.stripe; ctx.fillRect(-90, -6, 160, 12); } ctx.restore(); }
function planePath(ctx) { ctx.beginPath(); ctx.moveTo(110, 0); ctx.quadraticCurveTo(104, -13, 80, -14); ctx.lineTo(18, -14); ctx.lineTo(-22, -96); ctx.lineTo(-44, -96); ctx.lineTo(-18, -14); ctx.lineTo(-74, -13); ctx.lineTo(-92, -44); ctx.lineTo(-106, -44); ctx.lineTo(-96, -10);
  ctx.lineTo(-104, 0); ctx.lineTo(-96, 10); ctx.lineTo(-106, 44); ctx.lineTo(-92, 44); ctx.lineTo(-74, 13); ctx.lineTo(-18, 14); ctx.lineTo(-44, 96); ctx.lineTo(-22, 96); ctx.lineTo(18, 14); ctx.lineTo(80, 14); ctx.quadraticCurveTo(104, 13, 110, 0); ctx.closePath(); }
// side-view cutaway: o.tags = array of '$$$' | '$' | 'empty' | 'you' per seat; o.reveal 0..1 seats appear
function planeCut(ctx, x, y, s = 1, o = {}, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const L = 1500, Hh = 300;
  ctx.fillStyle = '#e6eaef'; ctx.beginPath(); ctx.moveTo(-L / 2, -Hh / 2 + 30); ctx.quadraticCurveTo(-L / 2 - 40, 0, -L / 2 + 20, Hh / 2); ctx.lineTo(L / 2 - 200, Hh / 2); ctx.quadraticCurveTo(L / 2 + 60, Hh / 2, L / 2 + 120, 0); ctx.quadraticCurveTo(L / 2 + 40, -Hh / 2, L / 2 - 200, -Hh / 2); ctx.lineTo(-L / 2 + 120, -Hh / 2);
  ctx.lineTo(-L / 2 - 30, -Hh / 2 - 170); ctx.lineTo(-L / 2 - 100, -Hh / 2 - 170); ctx.lineTo(-L / 2 - 40, -Hh / 2 + 10); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#8a95a3'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#fbfaf6'; ctx.fillRect(-L / 2 + 60, -Hh / 2 + 40, L - 300, Hh - 80); const tags = o.tags || []; const n = tags.length, sw = (L - 360) / n;
  tags.forEach((g, i) => { const k = eo(clamp(((o.reveal ?? 1) * n - i))); if (k <= 0) return; const sx = -L / 2 + 90 + i * sw; ctx.save(); ctx.globalAlpha = k;
    const fl = o.flip && o.flip[i] != null ? o.flip[i] : null; if (fl != null) { const cxs = sx + sw / 2; ctx.translate(cxs, 0); ctx.scale(Math.max(0.02, Math.abs(Math.cos(fl * Math.PI))), 1); ctx.translate(-cxs, 0); if (fl > 0.5 && o.flipTo) g = o.flipTo[i]; }
    if (o.glow && o.glow.includes(i)) { ctx.save(); ctx.shadowColor = '#f2d33b'; ctx.shadowBlur = 40 + 20 * Math.sin(t * 8); ctx.fillStyle = 'rgba(242,211,59,0.9)'; roundRect(ctx, sx - 2, -52, sw, 114, 14); ctx.fill(); ctx.restore(); }
    const col = g === '$$$' ? '#c9271c' : g === '$' ? '#2f7d4f' : g === 'empty' ? '#c7cdd4' : '#2f5d8a'; ctx.fillStyle = col; roundRect(ctx, sx + 6, -40, sw - 16, 90, 10); ctx.fill(); ctx.fillRect(sx + 6, -70, 18, 120);
    if (g !== 'empty') { ctx.fillStyle = '#fff'; ctx.font = `900 ${g === '$$$' ? 34 : 40}px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(g === 'you' ? 'YOU' : g, sx + sw / 2 + 4, 6); } ctx.restore(); });
  for (let i = 0; i < 9; i++) { ctx.fillStyle = '#9fb3c8'; roundRect(ctx, -L / 2 + 110 + i * 130, -Hh / 2 + 12, 46, 22, 10); ctx.fill(); } ctx.restore(); }
// generic person, side-ish view, minimal geometric (no likeness). o: {col, walk:phase, bag, scale}
function person(ctx, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s); ctx.globalAlpha = o.alpha ?? 1; const ph = o.walk ?? null; const sw = ph == null ? 0 : Math.sin(ph) * 0.45;
  const ink = o.col || '#2b3442'; ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.fillStyle = ink;
  // legs
  ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(Math.sin(sw) * 70, 0); ctx.moveTo(0, -120); ctx.lineTo(-Math.sin(sw) * 70, 0); ctx.stroke();
  // body
  ctx.fillStyle = o.shirt || '#4a6fa5'; roundRect(ctx, -34, -260, 68, 150, 30); ctx.fill();
  // arms
  ctx.strokeStyle = o.shirt || '#4a6fa5'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(0, -235); ctx.lineTo(-Math.sin(sw) * 60, -140); ctx.moveTo(0, -235); ctx.lineTo(Math.sin(sw) * 60 + (o.bag ? 20 : 0), -140); ctx.stroke();
  if (o.bag) { ctx.fillStyle = '#7a4e2d'; roundRect(ctx, Math.sin(sw) * 60 + 4, -150, 54, 60, 8); ctx.fill(); }
  // head
  ctx.fillStyle = o.skin || '#e0b48a'; ctx.beginPath(); ctx.arc(0, -300, 40, 0, 7); ctx.fill(); ctx.fillStyle = o.hair || '#3a2a1e'; ctx.beginPath(); ctx.arc(0, -312, 41, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.restore(); }
function suitcase(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = '#8a3b2a'; roundRect(ctx, -60, -80, 120, 160, 16); ctx.fill(); ctx.strokeStyle = '#5a2418'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-60, -20); ctx.lineTo(60, -20); ctx.stroke();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-24, -80); ctx.lineTo(-24, -104); ctx.lineTo(24, -104); ctx.lineTo(24, -80); ctx.stroke(); ctx.fillStyle = '#f2d33b'; ctx.fillRect(14, 20, 40, 26); ctx.restore(); }
// coins/notes falling into a slot: simple money glyph
function bill(ctx, x, y, s = 1, rot = 0, a = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = a; ctx.fillStyle = '#7fae7a'; roundRect(ctx, -70, -34, 140, 68, 6); ctx.fill(); ctx.strokeStyle = '#3d6b3a'; ctx.lineWidth = 4; ctx.strokeRect(-60, -24, 120, 48);
  ctx.fillStyle = '#2f5a2c'; ctx.font = `900 40px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 2); ctx.restore(); }
// ---------------- loudness helper for preview ----------------
module.exports = { W, H, FPS, F, MONO, SERIF, RED, INK, YEL, fonts, clamp, lerp, ss, eo, eio, back, lin, hash, rnd, mk, words, timeline, render, stills, paperTex, tex, desk, paperBg, finish, cam, camReset, shake, whip, glitch,
  pose, proj, card3d, boxOf, flat, docPaper, docComplaint, docLetter, docReceipt, boardingPass, searchCard, siteCard, verdictCard, folder, roundRect, ct, textLines, typed, punch, tag, todayTag, stamp, label, chapterCard,
  highlight, highlighter, markerEllipse, markerLine, curve, crossOut, writeOn, tape, sticky, fmt, counter, splitBar, map, mp, landPath, route, cityDot, pin, plane, planeCut, person, suitcase, bill, loadImage };
