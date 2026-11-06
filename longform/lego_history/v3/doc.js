// LEGO film v3.1 — shared documentary toolkit for the chapter segments (same look as the approved opening2.js).
// A segment = one chapter (or part of one) in CHAPTER-LOCAL time, timed to the words of the voice (chapters/<ch>/vo/*.align.json).
// node v3/<seg>.js still t1,t2.. out.png | frame t out.png | video out.mp4 | sfx (writes <seg>.sfx.json for the mixer)
const E = require('./eng.js'); const { W, H, clamp, lerp, ss, ease, hash, Scene, U, BH, PL, brick, oddPiece, camera, render, C, PAL } = E;
const M = require('./motion.js');
const S = require('../../figmakit/lib/scene.js');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const R = path.join(__dirname, '..');
// ---------- archive ----------
const ARCH = {
  bricks: ['lego_color_bricks.jpg', 'Photo: Alan Chia, 2007 · CC BY-SA 2.0'],
  ole: ['ole_kirk_1957_desk.jpg', 'Photo: 1957 · LEGO archive · public domain'],
  knud: ['knudstorp_2010.jpg', 'Photo: Hidden Isomorph, 2010 · CC BY-SA 3.0'],
  set700: ['lego_700_set_1952.jpg', 'Photo: Toxophilus, 2024 (LEGO House display) · CC BY-SA 4.0'],
  machine: ['injection_machine_1949.jpg', 'Photo: Hercules Inc. / Science History Institute · Jan 1949 · no known copyright'],
  patent1: ['patent_us3005282-1.png', 'US Patent 3,005,282 · filed 1958 · public domain'],
  patent3: ['patent_us3005282-3.png', 'US Patent 3,005,282 · filed 1958 · public domain'],
  godtfred: ['godtfred_1950.jpg', 'Photo: 1950 · LEGO archive · public domain'],
  bricks58: ['bricks_1958_museum.jpg', 'Photo: Leif Jørgensen, 2018 (Danmarks Tekniske Museum) · CC BY-SA 4.0'],
  wall: ['pick_a_brick_wall.jpg', 'Photo: wiredforlego, 2011 · CC BY-SA 2.0'],
  kjeld96: ['kjeld_1996.jpg', 'Photo: Regina Kühne, 1996 · Universitätsarchiv St. Gallen · CC BY-SA 4.0'],
  kjeld18: ['kjeld_2018.jpg', 'Photo: Legoland Billund Resort, 2018 · CC BY 3.0'],
  rcx: ['lego_rcx.jpg', 'Photo: Alexsh, 2006 · CC BY-SA 3.0'],
  bionicle: ['bionicle_exo_toa.jpg', 'Photo: Heady Metal, 2014 · CC BY-SA 4.0'],
  legoland: ['legoland_entrance.jpg', 'Photo: Leif Jørgensen, 2026 · CC BY-SA 4.0'],
  mattel: ['mattel_hq_2012.jpg', 'Photo: Jelson25, 2012 · CC BY-SA 3.0'],
  house: ['ole_kirks_hus_billund.jpg', 'Photo: Leif Jørgensen, 2026 · CC BY-SA 4.0'],
};
const IMG = {}, HAS = k => !!IMG[k];
let MAP = null;
async function loadArchive() { for (const [k, [f]] of Object.entries(ARCH)) { const p = path.join(__dirname, 'archive', f); if (fs.existsSync(p) && fs.statSync(p).size > 10000) IMG[k] = await E.loadImage(p); }
  const topo = require('topojson-client'), wa = require('./node_modules/world-atlas/countries-50m.json'); MAP = topo.feature(wa, wa.objects.countries).features; }
const cred = k => ARCH[k][1];
// ---------- 2D helpers ----------
function photo(ctx, im, u, o = {}) { const r = o.rect || [0, 0, W, H], [rx, ry, rw, rh] = r, z = lerp(o.z0 ?? 1.0, o.z1 ?? 1.08, ease.inOut(u)), fx = lerp(o.x0 ?? 0.5, o.x1 ?? 0.5, ease.inOut(u)), fy = lerp(o.y0 ?? 0.5, o.y1 ?? 0.5, ease.inOut(u));
  const sc = Math.max(rw / im.width, rh / im.height) * z, w = im.width * sc, h = im.height * sc, x = rx + (rw - w) * fx, y = ry + (rh - h) * fy;
  ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip(); if (o.filter) ctx.filter = o.filter; ctx.drawImage(im, x, y, w, h); ctx.restore(); }
function print(ctx, im, cx, cy, w, rot, o = {}) { const h = w * im.height / im.width; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha *= o.a ?? 1;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 22; ctx.fillStyle = '#f6f1e6'; ctx.fillRect(-w / 2 - 20, -h / 2 - 20, w + 40, h + (o.foot ?? 70)); ctx.shadowColor = 'transparent';
  if (o.filter) ctx.filter = o.filter; ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.filter = 'none'; ctx.restore(); return h; }
function credit(ctx, s, a = 1) { if (a <= 0) return; if (!M.overlay(c => credit0(c, s, a))) return; credit0(ctx, s, a); }
function credit0(ctx, s, a) { ctx.save(); ctx.globalAlpha = a * 0.85; ctx.font = `600 22px ${E.F}`; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  const w = ctx.measureText(s).width; ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(W - w - 44, H - 54, w + 24, 36); ctx.fillStyle = '#f4efe6'; ctx.fillText(s, W - 32, H - 24); ctx.restore(); }
// captions that only repeated the voice-over were removed (text diet); numbers, names, sources and ILLUSTRATIVE labels stay
const DROP = new Set(["OLE KIRK'S SON", 'NOTHING CONNECTED TO ANYTHING ELSE', 'EVERY PIECE FITS EVERY OTHER PIECE', "THE BRICKS DIDN'T HOLD", "LEGO DIDN'T REBUILD THE WOODEN TOYS",
  'LITTLE FIGURES ARRIVE', 'EVERY SET BECOMES A STORY', 'CHEAPER LOOK-ALIKES', 'KIDS TURN TO VIDEO GAMES EARLIER', 'LEGO STARTS LOOKING FOR SOMEONE TO CHANGE IT', "THE FOUNDER'S GRANDSON",
  'MORE THAN A BRICK COMPANY', "OTHER PEOPLE'S WORLDS", 'INTO THE STRATEGY DEPARTMENT', 'WATCHING THE PLAN FROM THE INSIDE', 'DESIGNERS WERE FREE TO INVENT', 'A SPECIAL PIECE FOR THIS SET…',
  '…A NEW COLOR FOR THAT ONE', 'SNAPS TOGETHER IN MINUTES', 'A BUILDABLE ACTION FIGURE', "WHY DIDN'T THE NUMBERS SCREAM?",
  'STORES THAT STOCKED UP NOW ORDER LESS', 'THE TURNAROUND MANAGER LEAVES', 'TAKES OVER THE DAY-TO-DAY HIMSELF', 'EVERYTHING ELSE: LOSING MONEY', 'PRODUCT BY PRODUCT', 'EVEN WORSE THAN 2003',
  'PAID FOR — WHETHER A SET SOLD OR NOT', '3 YEARS STUDYING HOW LEGO MADE AND LOST MONEY', 'THE FAMILY STAYS AS OWNER — AND BACKS HIM', 'OPENED BY THE FAMILY IN 1968',
  'DESIGNERS WORK WITH WHAT ALREADY EXISTS', 'WHAT THE BIG RETAILERS SAID ABOUT LEGO', 'NOW THE YEAR IS PLANNED AROUND THEM', 'THE NEW CEO GOES HIMSELF', 'FASTER THAN ALMOST ANYONE EXPECTED',
  'A RESCUE CAN MAKE MISTAKES TOO', 'SOME PARTS RAN SHORT', 'NOT ONE BAD DECISION — A CHAIN', 'REMEMBER THE 1955 TOWN PLAN?', 'THROUGH ALL OF IT', 'ONE THING NEVER CHANGED']);
// motion-graphics caption: the plate wipes open from its bar side (masked), the text rises into place; the same in reverse on the way out
function plate(ctx, s, x, y, a, o = {}) { if (a <= 0 || DROP.has(s)) return; const size = o.size || 52; ctx.save(); ctx.font = `${o.weight || 800} ${size}px ${E.F}`; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width, al = o.align || 'left', x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x, pad = size * 0.35, e = ease.out(clamp(a)), bw = w + 2 * pad;
  ctx.globalAlpha = clamp(a * 2.2); ctx.beginPath(); const cw = bw * e; ctx.rect(al === 'center' ? x0 - pad + (bw - cw) / 2 : al === 'right' ? x0 - pad + bw - cw : x0 - pad, y - size, cw, size * 2); ctx.clip();
  if (o.bg !== 'none') { ctx.fillStyle = o.bg || 'rgba(14,14,16,0.74)'; ctx.fillRect(x0 - pad, y - size * 0.72, bw, size * 1.44); }
  if (o.bar) { ctx.fillStyle = o.bar; ctx.fillRect(x0 - pad, y - size * 0.72, 8, size * 1.44); }
  ctx.fillStyle = o.col || '#F4EFE6'; ctx.fillText(s, x0 + (o.bar ? 6 : 0), y + 2 + (1 - e) * size * 0.5); ctx.restore(); return w; }
const LIGHT = { fogCol: [232, 226, 216], fogNear: 300, fogFar: 2600, amb: 0.42, key: 0.7 };
const DARK = { fogCol: [10, 11, 15], fogNear: 120, fogFar: 1400 };
function studio(ctx, top = '#f1ece4', mid = '#e6dfd4', bot = '#d3cabd') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function paper(ctx, col = '#efe7d6') { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = 0.045; ctx.strokeStyle = '#5a4a30'; for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.moveTo(0, i * 16); ctx.lineTo(W, i * 16 + 5); ctx.stroke(); } ctx.restore(); }
function fade(ctx, k, col = '0,0,0') { if (k > 0) { ctx.fillStyle = `rgba(${col},${clamp(k)})`; ctx.fillRect(0, 0, W, H); } }
// a stamp (red rubber-stamp look)
function stamp(ctx, s, x, y, a, rot = -0.12, size = 70, col = '201,26,20') { if (a <= 0) return; const sc = 1 + (1 - ease.out(clamp(a))) * 0.8; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = clamp(a) * 0.9;
  ctx.font = `900 ${size}px ${E.F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const w = ctx.measureText(s).width + size * 0.8; ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = size * 0.1;
  ctx.strokeRect(-w / 2, -size * 0.75, w, size * 1.5); ctx.fillStyle = `rgb(${col})`; ctx.fillText(s, 0, 4); ctx.restore(); }
// paper document (blank lines), returns local drawer
function doc(ctx, cx, cy, w, h, rot, o = {}) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.fillStyle = o.col || '#fbf8f0'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  if (o.lines !== false) { ctx.fillStyle = 'rgba(40,40,40,0.35)'; for (let i = 0; i < (o.n ?? 14); i++) ctx.fillRect(-w / 2 + 40, -h / 2 + 140 + i * 34, (w - 80) * (0.55 + 0.4 * hash(i * 3.1 + (o.seed || 0))), 9); }
  if (o.title) { ctx.fillStyle = o.tcol || '#1f1f1f'; ctx.font = `900 ${o.tsize || 44}px ${E.F}`; ctx.fillText(o.title, -w / 2 + 40, -h / 2 + 80); }
  if (o.draw) o.draw(ctx, w, h); ctx.restore(); }
// world map, equirectangular-ish around (lon0, lat0); highlight {name: colour}
function map(ctx, lon0, lat0, sc, hl = {}, o = {}) { const k = Math.cos(lat0 * Math.PI / 180), X = lo => W / 2 + (lo - lon0) * k * sc, Y = la => H / 2 - (la - lat0) * sc;
  ctx.fillStyle = o.sea || '#b9cdd2'; ctx.fillRect(0, 0, W, H);
  for (const f of MAP) { const c = hl[f.properties.name]; const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    ctx.beginPath(); for (const poly of polys) for (const ring of poly) { ring.forEach(([lo, la], i) => i ? ctx.lineTo(X(lo), Y(la)) : ctx.moveTo(X(lo), Y(la))); ctx.closePath(); }
    ctx.fillStyle = c || o.land || '#d9ceb8'; ctx.fill(); ctx.strokeStyle = c ? 'rgba(80,20,10,0.8)' : 'rgba(110,90,60,0.45)'; ctx.lineWidth = c ? 2 : 1; ctx.stroke(); }
  return (lo, la) => [X(lo), Y(la)]; }
function pin(ctx, x, y, a, col = '#C91A14') { if (a <= 0) return; const p = ease.back(clamp(a)); ctx.save(); ctx.translate(x, y - (1 - p) * 120); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -40, 19, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-12, -30); ctx.lineTo(0, 0); ctx.lineTo(12, -30); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -40, 7, 0, 6.283); ctx.fill(); ctx.restore(); }
// arrow along a quadratic arc, drawn up to u
function arc(ctx, x0, y0, x1, y1, bend, u, col = '#C91A14', w = 6, head = true) { if (u <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 - bend, P = v => [(1 - v) * (1 - v) * x0 + 2 * (1 - v) * v * cx + v * v * x1, (1 - v) * (1 - v) * y0 + 2 * (1 - v) * v * cy + v * v * y1];
  ctx.beginPath(); for (let i = 0; i <= 40; i++) { const [x, y] = P(i / 40 * u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  if (head) { const [xa, ya] = P(Math.max(0, u - 0.03)), [xb, yb] = P(u), an = Math.atan2(yb - ya, xb - xa); ctx.translate(xb, yb); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-22, -12); ctx.lineTo(-22, 12); ctx.fill(); }
  ctx.restore(); }
// chapter title card: own colour per chapter, real photo optional behind
function card(ctx, lt, num, title, years, o = {}) {
  if (o.img) photo(ctx, o.img, lt / 3.4, { z0: 1.15, z1: 1.22, filter: o.filter || 'blur(10px) sepia(0.5) brightness(0.45)' });
  else { const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, o.c0 || '#1d2a3a'); g.addColorStop(1, o.c1 || '#0c1118'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  if (o.deco) o.deco(ctx, lt);
  const acc = o.acc || '#E3B341', k = ease.out(clamp(lt / 0.5)), z = lerp(1.12, 1, k);
  // a big outlined chapter number drifting behind the title
  ctx.save(); ctx.globalAlpha = 0.16; ctx.font = `900 520px ${E.F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = acc; ctx.lineWidth = 4; ctx.strokeText(String(num), W / 2 + lerp(80, -40, ss(lt / 3.4)), 540); ctx.restore();
  // accent lines wipe in from the centre
  ctx.fillStyle = acc; const lw = 420 * ease.out(clamp(lt / 0.6)); ctx.fillRect(W / 2 - lw, 420, lw * 2, 5); ctx.fillRect(W / 2 - lw * 0.6, 700, lw * 1.2, 3);
  ctx.save(); ctx.translate(W / 2, 540); ctx.scale(z, z); ctx.translate(-W / 2, -540);
  E.label(ctx, `CHAPTER ${num}`, W / 2, 380, clamp(lt / 0.15), { size: 34, letter: lerp(30, 12, k), align: 'center', col: acc });
  E.type(ctx, title.toUpperCase(), W / 2, 545, lt + 0.15, { size: title.length > 16 ? 120 : 150 });
  E.type(ctx, years, W / 2, 650, lt - 0.35, { size: 52, weight: 600, col: 'rgba(244,239,230,0.85)' }); ctx.restore(); }
// a little brick-built house: walls (with brick courses), studded gable roof, door + windows. (x,z) = centre, y = base
function house(sc, x, y, z, col, o = {}) { const w = o.w ?? 36, d = o.d ?? 28, hh = o.h ?? 2 * BH + 4, roof = o.roof || C.red;
  sc.box({ x: x - w / 2, y, z: z - d / 2 }, w, hh, d, col, {});
  const P = (a, b, c) => [x + a, y + b, z + c], r = 4, top = hh + 14;
  sc.face([P(-w / 2 - r, hh, d / 2 + r), P(w / 2 + r, hh, d / 2 + r), P(w / 2 + r, top, 0), P(-w / 2 - r, top, 0)], roof, { c: [x, y + hh + 4, z] });
  sc.face([P(w / 2 + r, hh, -d / 2 - r), P(-w / 2 - r, hh, -d / 2 - r), P(-w / 2 - r, top, 0), P(w / 2 + r, top, 0)], roof, { c: [x, y + hh + 4, z] });
  sc.face([P(-w / 2, hh, d / 2), P(-w / 2, top, 0), P(-w / 2, hh, -d / 2)], col, { c: [x, y + hh + 4, z] }); sc.face([P(w / 2, hh, -d / 2), P(w / 2, top, 0), P(w / 2, hh, d / 2)], col, { c: [x, y + hh + 4, z] });
  const dk = [40, 44, 54], f = d / 2 + 0.3; sc.face([P(-4, 0, f), P(4, 0, f), P(4, 12, f), P(-4, 12, f)], dk, { c: [x, y, z], edge: 0 });
  for (const wx of [-12, 12]) sc.face([P(wx - 4, 9, f), P(wx + 4, 9, f), P(wx + 4, 15, f), P(wx - 4, 15, f)], [150, 190, 220], { c: [x, y, z], edge: 0, emissive: 0.9 }); }
// ---------- segment runner ----------
function segment(mod, o) { // o: { chapter, from, to, build({at, L, T}) -> {shots, sfx} }
  const dir = path.join(R, 'chapters', o.chapter), CU = JSON.parse(fs.readFileSync(path.join(dir, 'cues.json'))), L = Object.fromEntries(CU.vo);
  const w = S.words(dir, 0), at = (id, word, n = 0) => { try { return w(id, word, n); } catch (e) { console.error('WARN', e.message); return L[id]; } };
  const from = o.from ?? 0, to = o.to ?? (CU.T + (CU.tail || 0)), sfx = [], music = [];
  const fx = (name, t, g = 1) => { if (t >= from && t < to) sfx.push([name, +(t - from).toFixed(3), g]); };
  const shots = o.build({ at, L, T: to, fx, music }).sort((p, q) => p.t0 - q.t0);
  const mo = { T: to, impacts: sfx.filter(([n]) => M.IMPACT[n]).map(([n, tt, gn]) => [tt + from, M.IMPACT[n] * Math.min(1, gn * 1.6)]) };
  function frame(ctx, t) { M.compose(ctx, shots, t, mo); }
  if (require.main !== mod) return { frame, shots, sfx, from, to };
  (async () => { const [mode, a1, a2] = process.argv.slice(2); await loadArchive(); const cv = E.createCanvas(W, H), ctx = cv.getContext('2d');
    if (mode === 'T') return console.log(to - from);
    if (mode === 'sfx') { fs.writeFileSync(mod.filename.replace(/\.js$/, '.sfx.json'), JSON.stringify({ chapter: o.chapter, from, to, sfx, music, trans: M.trans(shots, to).map(([tt, ty]) => [+(tt - from).toFixed(3), ty]) })); return console.log('sfx', sfx.length); }
    if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
    if (mode === 'still') { const ts = a1.split(',').map(Number), cols = 3, sh = E.createCanvas(640 * cols, 360 * Math.ceil(ts.length / cols)), c2 = sh.getContext('2d');
      ts.forEach((tt, i) => { frame(ctx, tt); c2.drawImage(cv, (i % cols) * 640, Math.floor(i / cols) * 360, 640, 360); c2.fillStyle = '#ff2020'; c2.font = '22px sans-serif'; c2.fillText(tt.toFixed(1), (i % cols) * 640 + 8, Math.floor(i / cols) * 360 + 26); });
      return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
    if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
      const N = Math.round((to - from) * 30); for (let f = 0; f < N; f++) { frame(ctx, from + f / 30); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 300 === 0) process.stderr.write(`${f}/${N}\n`); }
      ff.stdin.end(); await new Promise(r => ff.on('close', r)); } })();
  return { frame, shots, sfx, from, to }; }
module.exports = { house, E, S, W, H, clamp, lerp, ss, ease, hash, Scene, U, BH, PL, brick, oddPiece, camera, render, C, PAL, IMG, HAS, cred, photo, print, credit, plate, LIGHT, DARK, studio, paper, fade, stamp, doc, map, pin, arc, card, segment };
