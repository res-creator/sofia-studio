// v2 (review fixes): stakes up front (y02 ~250 people), faster y03, readable ships + map pin (y07), clean death beat (y09) + pause, MacGregor portrait moved to y10,
// no grey flash on cuts, subtitles end with their line, coins kept off the subtitle line, brighter card "What's today's Poyais?". Reads script_v2.json + vo_v2/, writes cues_v2.json, carousel_v2/.
// Episode 29 "The Country That Didn't Exist" (Gregor MacGregor, Poyais, 1822) — How It's Run, ADULT DOCUMENTARY style (after eiffel_ep28):
// archive images (MacGregor portrait c.1820–35; "port of Black River" engraving from the 1822 Sketch of the Mosquito Shore; a Bank of Poyais dollar note),
// dark sepia grade, film grain, red rubber stamps, typewriter tags, re-created documents labelled RE-CREATED, counters, push-ins and punch-ins on hits.
// 1080x1920, 30 fps. Voice: Chris (vo/, word timings in *.align.json).
// node episode.js cues | srt out.srt | still t1,t2,… out.png | frame t out.png | carousel t1,…,t6 | video out.mp4 | T
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas'); const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Emoji');
const D = __dirname, W = 1080, H = 1920, FPS = 30;
const F = '"Inter Display", Inter, sans-serif', TW = '"DejaVu Sans Mono", monospace', SERIF = '"DejaVu Serif", serif';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, eo = u => 1 - Math.pow(1 - clamp(u), 3);
const back = u => { u = clamp(u); if (u <= 0) return 0; if (u >= 1) return 1; const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// ---------- timeline from the voice ----------
const LINES = JSON.parse(fs.readFileSync(path.join(D, 'script_v2.json'))), SPEECH = JSON.parse(fs.readFileSync(path.join(D, 'vo_v2/speech.json')));
const START = 0.25, GAP = { y01: 0.35, y02: 0.35, y03: 0.3, y05: 0.35, y07: 0.9, y08: 0.3, y09: 0.95, y11: 0.35 }, CARD = 2.6;
// spoken words → digits on screen (subtitles + SRT)
const MERGE = [['y02', ['two', 'hundred', 'and', 'fifty'], '250'], ['y04', ['two', 'hundred', 'thousand', 'pound'], '£200,000'], ['y09', ['fifty'], '50']];
const SRTTXT = { y02: 'And about 250 people packed up their lives... to move there.', y04: 'In London, he launched a £200,000 Poyais loan.', y09: 'Fewer than 50 ever came home.' };
const nrm = s => s.toLowerCase().replace(/[^a-z0-9£$]/g, '');
const L = {}, E = {}, WD = {}; let t = START;
for (const l of LINES) { const a = JSON.parse(fs.readFileSync(path.join(D, `vo_v2/${l.id}.align.json`))), [s0, s1] = SPEECH[l.id]; L[l.id] = t - s0; E[l.id] = L[l.id] + s1;
  let ws = []; let cur = null; a.characters.forEach((ch, i) => { if (/\s/.test(ch)) { if (cur) { ws.push(cur); cur = null; } return; } if (!cur) cur = { w: '', a: a.character_start_times_seconds[i] }; cur.w += ch; cur.b = a.character_end_times_seconds[i]; }); if (cur) ws.push(cur);
  ws = ws.map(x => ({ w: x.w, a: L[l.id] + x.a, b: L[l.id] + x.b }));
  for (const [id, seq, rep] of MERGE) if (id === l.id) { const i = ws.findIndex((_, k) => seq.every((s, j) => ws[k + j] && nrm(ws[k + j].w) === s)); if (i < 0) throw new Error('merge ' + id);
    const tail = ws[i + seq.length - 1].w.match(/[.,?!…]+$/); ws.splice(i, seq.length, { w: rep + (tail ? tail[0] : ''), a: ws[i].a, b: ws[i + seq.length - 1].b }); }
  WD[l.id] = ws; t = E[l.id] + (GAP[l.id] ?? 0.3); }
const CARD0 = E.y12 + 0.9, T = +(CARD0 + CARD).toFixed(2);
const at = (id, w, n = 0) => { const h = WD[id].filter(x => nrm(x.w).startsWith(nrm(w))); if (!h[n]) throw new Error(`no ${w} in ${id}`); return h[n].a; };
// ---------- assets ----------
let NOTE, MAC, RIVER;
async function load() { NOTE = await loadImage(path.join(D, 'archive/poyais_dollar.jpg')); MAC = await loadImage(path.join(D, 'archive/macgregor.jpg')); RIVER = await loadImage(path.join(D, 'archive/black_river_1822.jpg')); }
const GR = (() => { const c = createCanvas(540, 540), x = c.getContext('2d'), d = x.createImageData(540, 540); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; })();
function grain(x, g, a = 0.09) { x.save(); x.globalAlpha = a; x.globalCompositeOperation = 'overlay'; const ox = Math.floor(hash(Math.floor(g * 24)) * 540), oy = Math.floor(hash(Math.floor(g * 24) + 7) * 540); for (let yy = -oy; yy < H; yy += 540) for (let xx = -ox; xx < W; xx += 540) x.drawImage(GR, xx, yy); x.restore();
  if (hash(Math.floor(g * 24) * 3.1) > 0.82) { x.save(); x.globalAlpha = 0.25; x.fillStyle = '#ddd'; x.fillRect(hash(Math.floor(g * 24)) * W, 0, 2, H); x.restore(); } }
function vignette(x, a = 0.65) { const g = x.createRadialGradient(W / 2, H * 0.45, H * 0.22, W / 2, H * 0.45, H * 0.78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); x.fillStyle = g; x.fillRect(0, 0, W, H); }
function dust(x, g, n = 40) { x.save(); for (let i = 0; i < n; i++) { const h = hash(i * 3.7), px = (h * W + g * 14 * (0.4 + h)) % W, py = (hash(i * 9.1) * H - g * 9 * (0.3 + h) + H * 10) % H; x.fillStyle = `rgba(240,225,200,${0.15 + 0.3 * h})`; x.beginPath(); x.arc(px, py, 1 + h * 2.2, 0, 7); x.fill(); } x.restore(); }
const NF = 'sepia(0.45) contrast(1.15) brightness(0.88)', PF = 'grayscale(1) contrast(1.2) brightness(0.85) sepia(0.32)', EF = 'grayscale(0.4) contrast(1.15) brightness(0.8) sepia(0.45)';
function darkBg(x, top = '#1c1510', bot = '#080605') { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, W, H); }
function table(x) { darkBg(x, '#241912', '#090605'); x.save(); x.globalAlpha = 0.07; for (let i = 0; i < 40; i++) { x.fillStyle = i % 2 ? '#000' : '#6a4a2a'; x.fillRect(0, i * 48 + Math.sin(i) * 6, W, 3 + hash(i) * 6); } x.restore(); }
function shadeTopBottom(x, a = 0.85) { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(10,8,6,${a})`); g.addColorStop(0.3, 'rgba(10,8,6,0.05)'); g.addColorStop(0.72, 'rgba(10,8,6,0.15)'); g.addColorStop(1, `rgba(10,8,6,${a})`); x.fillStyle = g; x.fillRect(0, 0, W, H); }
function stamp(x, s, cx, cy, size, rot, u, col = '#D42A1D') { if (u <= 0) return; const k = lerp(2.2, 1, back(u / 1)); x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(k, k); x.globalAlpha = clamp(u * 3) * 0.93; x.font = `900 ${size}px ${F}`; x.textAlign = 'center'; x.textBaseline = 'middle';
  const w = x.measureText(s).width + size * 0.6; x.strokeStyle = col; x.lineWidth = size * 0.1; x.strokeRect(-w / 2, -size * 0.72, w, size * 1.44); x.fillStyle = col; x.fillText(s, 0, size * 0.05);
  x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(0,0,0,${0.5 * hash(i)})`; x.fillRect((hash(i * 3) - 0.5) * w, (hash(i * 7) - 0.5) * size * 1.4, 4 + hash(i) * 10, 3); } x.restore(); }
function fit(x, s, size, maxW, font = F, weight = 900) { let z = size; x.font = `${weight} ${z}px ${font}`; while (x.measureText(s).width > maxW && z > 20) { z -= 2; x.font = `${weight} ${z}px ${font}`; } return z; }
function headline(x, a, b, y, u = 1, maxW = 960) { if (u <= 0) return; x.save(); x.globalAlpha = clamp(u * 2); x.textAlign = 'center'; x.shadowColor = 'rgba(0,0,0,0.85)'; x.shadowBlur = 24; const dy = (1 - eo(u)) * 40;
  fit(x, a, 100, maxW); x.fillStyle = '#F2EDE4'; x.fillText(a, W / 2, y + dy); if (b) { fit(x, b, 100, maxW); x.fillStyle = '#E8B84A'; x.fillText(b, W / 2, y + 112 + dy); } x.restore(); }
function tag(x, s, X, Y, u = 1, o = {}) { if (u <= 0) return; x.save(); x.globalAlpha = clamp(u * 2); const n = Math.floor(clamp(u * 1.6) * s.length), vis = s.slice(0, n); const z = fit(x, s, o.size || 34, o.maxW || 900, TW, 700); const w = x.measureText(s).width;
  const X0 = o.align === 'center' ? X - w / 2 - 16 : X; x.fillStyle = o.bg || 'rgba(242,237,228,0.93)'; x.fillRect(X0, Y - z * 0.9, w + 32, z * 1.6); x.fillStyle = o.col || '#171717'; x.textAlign = 'left'; x.fillText(vis, X0 + 16, Y + z * 0.2); x.restore(); }
function bigNum(x, s, y, u, col = '#E8B84A', size = 150) { if (u <= 0) return; x.save(); x.globalAlpha = clamp(u * 2); x.textAlign = 'center'; x.shadowColor = 'rgba(0,0,0,0.85)'; x.shadowBlur = 30; fit(x, s, size, 980); x.fillStyle = col; x.fillText(s, W / 2, y); x.restore(); }
function credit(x, s, y = 1480) { x.save(); x.font = `600 22px ${F}`; x.fillStyle = 'rgba(242,237,228,0.7)'; x.textAlign = 'right'; x.fillText(s, W - 50, y); x.restore(); }
function paperDoc(x, cx, cy, w, h, rot, draw, col = '#EDE3CB') { x.save(); x.translate(cx, cy); x.rotate(rot); x.shadowColor = 'rgba(0,0,0,0.75)'; x.shadowBlur = 60; x.shadowOffsetY = 20; x.fillStyle = col; x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = 'transparent';
  const g = x.createRadialGradient(0, 0, w * 0.2, 0, 0, w * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,60,20,0.35)'); x.fillStyle = g; x.fillRect(-w / 2, -h / 2, w, h); draw(x, w, h); x.restore(); }
// the note: image point (fx, fy) (0..1) lands on screen (sx, sy); note drawn w px wide, rotated rot
function noteAt(x, fx, fy, sx, sy, w, rot = 0, a = 1) { const h = w * NOTE.height / NOTE.width; x.save(); x.globalAlpha = a; x.translate(sx, sy); x.rotate(rot); x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 50; x.shadowOffsetY = 18;
  x.fillStyle = '#d8d0bf'; x.fillRect(-fx * w, -fy * h, w, h); x.shadowColor = 'transparent'; x.filter = NF; x.drawImage(NOTE, -fx * w, -fy * h, w, h); x.restore(); }
function portrait(x, cx, cy, h, rot, a = 1, frame = true) { const w = h * MAC.width / MAC.height; x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(rot);
  if (frame) { x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 50; x.fillStyle = '#F2ECDF'; x.fillRect(-w / 2 - 22, -h / 2 - 22, w + 44, h + 44); x.shadowColor = 'transparent'; } x.filter = PF; x.drawImage(MAC, -w / 2, -h / 2, w, h); x.restore(); }
function engraving(x, cx, cy, w, rot, a = 1) { const h = w * RIVER.height / RIVER.width; x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(rot); x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 50; x.fillStyle = '#EFE6D2'; x.fillRect(-w / 2 - 26, -h / 2 - 26, w + 52, h + 100); x.shadowColor = 'transparent';
  x.filter = EF; x.drawImage(RIVER, -w / 2, -h / 2, w, h); x.filter = 'none'; x.fillStyle = '#3a2c1e'; x.font = `italic 24px ${SERIF}`; x.textAlign = 'center'; x.fillText('View of the Port of Black River, in the Territory of Poyais.', 0, h / 2 + 52); x.restore(); }
// full-bleed pan over the engraving (fills the 9:16 frame), u: 0..1 pan position
function riverPan(x, u, z = 1, dy = 0) { const h = H * z, w = h * RIVER.width / RIVER.height; x.save(); x.filter = EF; x.drawImage(RIVER, lerp(0, W - w, u), (H - h) / 2 + dy, w, h); x.restore(); }
function coin(x, cx, cy, r, rot = 0) { x.save(); x.translate(cx, cy); x.rotate(rot); const g = x.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, '#FFE7A0'); g.addColorStop(0.6, '#D9A440'); g.addColorStop(1, '#8A5E18'); x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, r, r * 0.92, 0, 0, 7); x.fill();
  x.strokeStyle = 'rgba(90,60,20,0.8)'; x.lineWidth = r * 0.08; x.beginPath(); x.ellipse(0, 0, r * 0.78, r * 0.72, 0, 0, 7); x.stroke(); x.fillStyle = 'rgba(110,70,20,0.55)'; x.beginPath(); x.arc(0, -r * 0.05, r * 0.32, 0, 7); x.fill(); x.restore(); }
function ship(x, sx, sy, s, col = '#05070a') { x.save(); x.translate(sx, sy); x.scale(s, s); x.fillStyle = col; x.beginPath(); x.moveTo(-230, -10); x.quadraticCurveTo(0, 30, 250, -20); x.lineTo(200, 50); x.lineTo(-190, 50); x.closePath(); x.fill();
  x.fillRect(-80, -330, 9, 330); x.fillRect(70, -380, 10, 380); x.fillRect(220, -60, 140, 6);
  for (const [mx, top, wd] of [[-76, -320, 110], [75, -370, 130]]) for (let k = 0; k < 3; k++) { const y0 = top + k * 95, ww = wd - k * 10; x.beginPath(); x.moveTo(mx - ww / 2, y0); x.lineTo(mx + ww / 2, y0); x.quadraticCurveTo(mx + ww / 2 + 14, y0 + 40, mx + ww / 2 + 6, y0 + 80); x.lineTo(mx - ww / 2 - 6, y0 + 80); x.quadraticCurveTo(mx - ww / 2 + 8, y0 + 40, mx - ww / 2, y0); x.fill(); }
  x.beginPath(); x.moveTo(84, -340); x.lineTo(330, -60); x.lineTo(84, -60); x.fill(); x.restore(); }
function sea(x, g, y0 = 1180, col = '#0c1418') { x.fillStyle = col; x.fillRect(0, y0, W, H - y0); x.strokeStyle = 'rgba(210,200,170,0.13)'; x.lineWidth = 3; for (let i = 0; i < 18; i++) { const yy = y0 + 20 + i * 38, off = (i * 137 + g * (40 + i * 4)) % 1300 - 120; x.beginPath(); x.moveTo(off, yy); x.lineTo(off + 90 + i * 6, yy); x.stroke(); x.beginPath(); x.moveTo(off - 600, yy + 14); x.lineTo(off - 520, yy + 14); x.stroke(); } }
function jungle(x, g, u = 1) { darkBg(x, '#0d1a12', '#020403'); const mist = x.createLinearGradient(0, 700, 0, 1300); mist.addColorStop(0, 'rgba(120,140,110,0)'); mist.addColorStop(0.5, 'rgba(120,140,110,0.14)'); mist.addColorStop(1, 'rgba(120,140,110,0)'); x.fillStyle = mist; x.fillRect(0, 0, W, H);
  for (let layer = 0; layer < 3; layer++) { const c = ['#13261a', '#0a170f', '#030805'][layer]; x.fillStyle = c;
    for (let i = 0; i < 9; i++) { const bx = (hash(i * 7 + layer * 31) * 1.3 - 0.15) * W, by = 1900 - layer * 40, hgt = 900 + hash(i + layer * 11) * 700 - layer * 120, sw = Math.sin(g * 0.8 + i + layer) * 10;
      x.fillRect(bx - 10 - layer * 4, by - hgt, 20 + layer * 8, hgt); for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.48 + sw * 0.005, len = 230 + hash(i * 3 + k) * 140 + layer * 40;
        x.save(); x.translate(bx, by - hgt); x.rotate(a); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * 0.5, -40, len, 30); x.quadraticCurveTo(len * 0.5, 20, 0, 0); x.fill(); x.restore(); } }
    for (let i = 0; i < 14; i++) { const fx = hash(i * 5 + layer) * W, fy = 1500 + hash(i * 9 + layer) * 420 - layer * 60; x.beginPath(); x.ellipse(fx, fy, 160 + layer * 40, 70 + layer * 20, hash(i) - 0.5, 0, 7); x.fill(); } }
  x.save(); x.globalAlpha = 0.5 * u; for (let i = 0; i < 26; i++) { x.fillStyle = 'rgba(210,230,150,0.55)'; x.beginPath(); x.arc((hash(i * 4.1) * W + Math.sin(g * 1.3 + i) * 30) % W, 600 + hash(i * 2.3) * 900 + Math.cos(g + i) * 20, 2.5, 0, 7); x.fill(); } x.restore(); }
// ---------- shots ----------
const SH = [];
const shot = (t0, fn) => SH.push({ t0, fn });
const push = (g, t0, t1, z0 = 1.0, z1 = 1.08) => lerp(z0, z1, ss((g - t0) / Math.max(0.5, t1 - t0)));
// 0 · hook: the Poyais dollar, push-in + slow pan, DOESN'T EXIST stamp at 0.0, headline
function hook(x, g, u0 = 0.55 + g * 2, st = (g + 0.25) / 0.4, punch = true) { table(x); const pc = punch ? eo((g - at('y01', 'country') + 0.1) / 0.35) : 0, z = push(g, 0, 4.4, 1.0, 1.14) * (1 + 0.28 * pc), w = 1500 * z; noteAt(x, lerp(lerp(0.42, 0.56, ss(g / 4.4)), 0.86, pc), lerp(0.5, 0.2, pc), W / 2, lerp(980, 1000, pc), w, -0.06);
  shadeTopBottom(x, 0.8); dust(x, g); headline(x, 'HE SOLD A', 'FAKE COUNTRY', 330, u0); stamp(x, "DOESN'T EXIST", 540, 1010, 112, -0.16, st); }
shot(0, (x, g) => { hook(x, g); tag(x, 'LONDON · 1822', 70, 1420, 1); credit(x, 'BANK OF POYAIS NOTE, 1820s (ARCHIVE)'); });
// y02 (v2) · stakes: emigrant families with trunks walk the dock toward a ship at dusk — "~250 PEOPLE" / "MOVED THERE"
function emigrant(x, cx, by, h, kind, ph, col = '#0b0907') { const b = Math.abs(Math.sin(ph)) * h * 0.02, st = Math.sin(ph) * h * 0.06; x.save(); x.fillStyle = col; x.translate(cx, by - b);
  const hw = h * 0.13; x.beginPath(); x.moveTo(-hw * 0.4, -h * 0.47); x.lineTo(-hw * 0.4 + st, 0); x.lineTo(-hw * 0.4 + st + h * 0.05, 0); x.lineTo(0, -h * 0.45); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(hw * 0.4, -h * 0.47); x.lineTo(hw * 0.4 - st, 0); x.lineTo(hw * 0.4 - st - h * 0.05, 0); x.lineTo(0, -h * 0.45); x.closePath(); x.fill();
  if (kind === 'w') { x.beginPath(); x.moveTo(-hw * 0.7, -h * 0.8); x.lineTo(hw * 0.7, -h * 0.8); x.lineTo(hw * 1.5, -h * 0.05); x.lineTo(-hw * 1.5, -h * 0.05); x.closePath(); x.fill(); }
  else { x.beginPath(); x.moveTo(-hw, -h * 0.82); x.lineTo(hw, -h * 0.82); x.lineTo(hw * 0.85, -h * 0.42); x.lineTo(-hw * 0.85, -h * 0.42); x.closePath(); x.fill(); }
  x.beginPath(); x.arc(0, -h * 0.89, h * 0.075, 0, 7); x.fill();
  if (kind === 'm') { x.fillRect(-h * 0.06, -h * 1.06, h * 0.12, h * 0.13); x.fillRect(-h * 0.1, -h * 0.94, h * 0.2, h * 0.02); }
  if (kind === 'w') { x.beginPath(); x.ellipse(0, -h * 0.93, h * 0.11, h * 0.07, 0, Math.PI, 0); x.fill(); }
  if (kind !== 'k') { x.fillRect(hw * 0.9, -h * 0.5, h * 0.22, h * 0.15); } x.restore(); }
function trunk(x, cx, by, w, h, label) { x.save(); x.fillStyle = '#3b2716'; x.fillRect(cx - w / 2, by - h, w, h); x.fillStyle = '#5a3d22'; x.fillRect(cx - w / 2, by - h, w, h * 0.22); x.fillStyle = '#1c120a'; x.fillRect(cx - w * 0.3, by - h, w * 0.06, h); x.fillRect(cx + w * 0.24, by - h, w * 0.06, h);
  if (label) { x.fillStyle = 'rgba(232,220,192,0.85)'; x.font = `900 ${Math.round(h * 0.28)}px ${TW}`; x.textAlign = 'center'; x.fillText(label, cx, by - h * 0.38); } x.restore(); }
shot(L.y02 - 0.15, (x, g) => { const t0 = L.y02, k = ss((g - t0 + 0.15) / 4.2), z = push(g, t0, E.y02 + 0.4, 1.0, 1.1);
  x.save(); x.translate(W / 2, 1100); x.scale(z, z); x.translate(-W / 2, -1100);
  const sky = x.createLinearGradient(0, 0, 0, 1250); sky.addColorStop(0, '#2b2622'); sky.addColorStop(0.65, '#8a6a48'); sky.addColorStop(1, '#c49a62'); x.fillStyle = sky; x.fillRect(0, 0, W, 1250);
  const sg2 = x.createRadialGradient(300, 1150, 20, 300, 1150, 500); sg2.addColorStop(0, 'rgba(255,220,160,0.55)'); sg2.addColorStop(1, 'rgba(255,220,160,0)'); x.fillStyle = sg2; x.fillRect(0, 600, W, 700);
  sea(x, g, 1180, '#6a5440'); x.fillStyle = '#17110c'; x.fillRect(0, 1440, W, H - 1440); x.fillStyle = '#241a12'; for (let i = 0; i < 12; i++) x.fillRect(i * 95 + 10, 1440, 6, 70);
  ship(x, 900 - k * 30, 1235, 1.1, '#0d0a08');
  trunk(x, 110, 1450, 180, 115, 'POYAIS'); trunk(x, 120, 1335, 140, 85, ''); trunk(x, 975, 1455, 170, 105, 'ST JOSEPH');
  const fam = [['m', 0], ['w', 70], ['k', 135], ['m', 260], ['w', 330], ['k', 380], ['k', 420], ['m', 540], ['w', 610]];
  fam.forEach(([kind, off], i) => { const h = kind === 'k' ? 150 : 230, px = lerp(80, 720, k) - off * 0.75 + 200; if (px < -80 || px > 1160) return; emigrant(x, px, 1440 + (i % 3) * 6, h * 1.25, kind, g * 6 + i); }); x.restore();
  shadeTopBottom(x, 0.7); headline(x, '~250 PEOPLE', null, 260, (g - at('y02', '250') + 0.1) / 0.3); headline(x, '', 'MOVED THERE', 260, (g - at('y02', 'move') + 0.1) / 0.3);
  tag(x, 'EMIGRANTS · LONDON & LEITH, 1822–23', 70, 1500, (g - t0 - 0.3) / 0.6, { size: 26 }); tag(x, 'ILLUSTRATION', W - 230, 1500, 1, { size: 22 }); dust(x, g); });
// y03 · the guidebook (engraving = its promise) → a flag → his own money
shot(L.y03 - 0.15, (x, g) => { table(x); const fl = at('y03', 'flag') - 0.1, mo = Math.min(at('y03', 'even') - 0.12, fl + 0.8), z = push(g, L.y03, fl, 1, 1.07);
  if (g < fl) { x.save(); x.translate(W / 2, 900); x.scale(z, z); x.translate(-W / 2, -900);
    x.fillStyle = '#3a2618'; x.fillRect(60, 520, 960, 820); x.fillStyle = '#EFE6D2'; x.fillRect(80, 540, 455, 780); x.fillRect(545, 540, 455, 780); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(530, 540, 20, 780);
    x.fillStyle = '#2a2016'; x.textAlign = 'center'; x.font = `700 30px ${SERIF}`; x.fillText('SKETCH', 307, 640); x.font = `italic 22px ${SERIF}`; x.fillText('of the', 307, 680); x.font = `700 30px ${SERIF}`; x.fillText('MOSQUITO SHORE,', 307, 720);
    x.font = `italic 20px ${SERIF}`; x.fillText('including the Territory of', 307, 760); x.font = `700 40px ${SERIF}`; x.fillText('POYAIS', 307, 815); x.font = `italic 20px ${SERIF}`; x.fillText('by Captain Thomas Strangeways', 307, 900); x.fillText('EDINBURGH · 1822', 307, 1240);
    x.save(); x.translate(772, 860); x.filter = EF; const iw = 410, ih = iw * RIVER.height / RIVER.width; x.drawImage(RIVER, -iw / 2, -ih / 2 - 60, iw, ih); x.restore(); for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(42,32,22,0.35)'; x.fillRect(590, 1060 + i * 36, 360 - (i % 2) * 70, 8); } x.restore();
    headline(x, '355 PAGES', 'OF "FACTS"', 230, (g - L.y03 - 0.25) / 0.3); tag(x, 'GUIDEBOOK · AUTHOR LIKELY FAKE', 70, 1440, (g - L.y03 - 0.6) / 0.6, { size: 28 }); }
  else if (g < mo) { darkBg(x, '#1c1510', '#060504'); const u = (g - fl) / (mo - fl);
    x.save(); x.translate(330, 1460); x.fillStyle = '#2a2016'; x.fillRect(-8, -900, 16, 900); for (let k = 0; k < 30; k++) { const yy = -880 + Math.sin(k * 0.3 + g * 5) * 18; x.fillStyle = '#E8DCC0'; }
    x.beginPath(); x.moveTo(8, -880); for (let k = 0; k <= 20; k++) x.lineTo(8 + k * 26, -880 + Math.sin(k * 0.45 - g * 5) * 22); for (let k = 20; k >= 0; k--) x.lineTo(8 + k * 26, -520 + Math.sin(k * 0.45 - g * 5) * 22); x.closePath(); x.fillStyle = '#D9CFB6'; x.fill();
    x.fillStyle = '#2a2016'; x.font = `900 60px ${SERIF}`; x.textAlign = 'center'; x.fillText('POYAIS', 268, -680 + Math.sin(10 * 0.45 - g * 5) * 22); x.restore();
    headline(x, 'A FLAG...', null, 260, (g - fl) / 0.3); tag(x, 'ILLUSTRATION', 70, 1520, 1, { size: 24 }); }
  else { table(x); const u = eo((g - mo) / 0.5); noteAt(x, 0.5, 0.5, W / 2, lerp(2300, 950, u), 1000, lerp(0.4, -0.05, u)); headline(x, '...EVEN HIS', 'OWN MONEY', 230, (g - mo) / 0.3); }
  dust(x, g); });
// y04 · London: the Poyais loan, bond certificate + £200,000 counter
function bond(c) { c.strokeStyle = '#5a4630'; c.lineWidth = 4; c.strokeRect(-360, -430, 720, 860); c.lineWidth = 1.5; c.strokeRect(-340, -410, 680, 820); c.fillStyle = '#2a2016'; c.textAlign = 'center';
  c.font = `700 30px ${SERIF}`; c.fillText('GOVERNMENT OF POYAIS', 0, -330); c.font = `900 56px ${SERIF}`; c.fillText('LOAN', 0, -250); c.font = `italic 26px ${SERIF}`; c.fillText('Bond of One Hundred Pounds Sterling', 0, -190);
  c.font = `900 120px ${SERIF}`; c.fillStyle = 'rgba(90,70,40,0.25)'; c.fillText('£100', 0, 40); c.fillStyle = '#2a2016'; for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(42,32,22,0.4)'; c.fillRect(-280, 110 + i * 34, 560 - (i % 3) * 80, 8); }
  c.fillStyle = '#2a2016'; c.font = `24px ${SERIF}`; c.fillText('LONDON · 1822', 0, 350); c.strokeStyle = '#8a2a1d'; c.lineWidth = 3; c.beginPath(); c.arc(240, 330, 50, 0, 7); c.stroke(); }
shot(L.y04 - 0.15, (x, g) => { table(x); const z = push(g, L.y04, E.y04 + 0.3, 1.0, 1.08); x.save(); x.translate(W / 2, 1000); x.scale(z, z); x.translate(-W / 2, -1000);
  for (let k = 2; k >= 0; k--) { const u = eo((g - L.y04 - k * 0.2) / 0.5); paperDoc(x, W / 2 + (k - 1) * 40 + lerp(-900, 0, u), 1000 + k * 14, 760, 900, (k - 1) * 0.04, bond, '#E9DEC4'); } x.restore();
  const c = clamp((g - at('y04', '£200') + 0.1) / 1.0), val = Math.round(200000 * eo(c) / 1000) * 1000; bigNum(x, '£' + val.toLocaleString('en-US'), 390, (g - at('y04', '£200') + 0.2) / 0.3);
  headline(x, 'LONDON INVESTORS', null, 210, (g - L.y04) / 0.3, 900); tag(x, 'RE-CREATED BOND · LOAN OFFERED OCT 1822', 70, 1500, (g - L.y04 - 0.4) / 0.6, { size: 26 }); dust(x, g); });
// y05 · land (100 ACRES · £11) → jobs → SHOEMAKER TO THE PRINCESS
shot(L.y05 - 0.15, (x, g) => { table(x); const j = at('y05', 'Men') - 0.1, sh = at('y05', 'A', 0) - 0.1;
  if (g < j) { const z = push(g, L.y05, j, 1, 1.08), u = eo((g - L.y05 + 0.15) / 0.5); x.save(); x.translate(W / 2, 980); x.scale(z, z); x.translate(-W / 2, -980);
    paperDoc(x, W / 2, lerp(1900, 980, u), 820, 760, 0.03, c => { c.strokeStyle = '#5a4630'; c.lineWidth = 4; c.strokeRect(-380, -350, 760, 700); c.fillStyle = '#2a2016'; c.textAlign = 'center'; c.font = `700 30px ${SERIF}`; c.fillText('TERRITORY OF POYAIS', 0, -270); c.font = `italic 26px ${SERIF}`; c.fillText('Certificate of Land', 0, -225);
      c.font = `900 110px ${SERIF}`; c.fillText('100 ACRES', 0, -60); c.font = `900 96px ${SERIF}`; c.fillStyle = '#8a2a1d'; c.fillText('£11', 0, 90); c.fillStyle = 'rgba(42,32,22,0.4)'; for (let i = 0; i < 4; i++) c.fillRect(-260, 160 + i * 32, 520 - i * 60, 7); }); x.restore();
    headline(x, 'FAMILIES BOUGHT LAND', null, 260, (g - L.y05) / 0.3, 940); tag(x, 'RE-CREATED · 2 SHILLINGS 3 PENCE AN ACRE', 70, 1500, (g - L.y05 - 0.4) / 0.6, { size: 26 }); }
  else if (g < sh) { const jobs = [['MANAGER', 'BANK OF POYAIS'], ['OFFICER', 'POYAIS ARMY'], ['OFFICER', 'POYAIS NAVY']];
    jobs.forEach(([a, b], i) => { const u = eo((g - j - i * 0.28) / 0.45); if (u <= 0) return; paperDoc(x, lerp(-500, 300 + i * 240, u), 620 + i * 300, 560, 240, (i - 1) * 0.07, c => { c.strokeStyle = '#5a4630'; c.lineWidth = 3; c.strokeRect(-262, -102, 524, 204); c.fillStyle = '#2a2016'; c.textAlign = 'center'; c.font = `900 50px ${SERIF}`; c.fillText(a, 0, -10); c.font = `600 30px ${SERIF}`; c.fillText(b, 0, 50); }); });
    headline(x, 'MEN BOUGHT JOBS', null, 260, (g - j) / 0.3); tag(x, 'TITLES SOLD TO THE HIGHEST BIDDER', 70, 1500, (g - j - 0.3) / 0.6, { size: 26 }); }
  else { const z = push(g, sh, E.y05 + 0.3, 1, 1.1), u = eo((g - sh) / 0.45); x.save(); x.translate(W / 2, 960); x.scale(z, z); x.translate(-W / 2, -960);
    paperDoc(x, W / 2, lerp(1900, 960, u), 860, 560, -0.03, c => { c.strokeStyle = '#5a4630'; c.lineWidth = 4; c.strokeRect(-400, -250, 800, 500); c.lineWidth = 1.5; c.strokeRect(-382, -232, 764, 464); c.fillStyle = '#2a2016'; c.textAlign = 'center'; c.font = `italic 28px ${SERIF}`; c.fillText('By Appointment', 0, -160);
      c.font = `900 64px ${SERIF}`; c.fillText('SHOEMAKER', 0, -50); c.font = `italic 40px ${SERIF}`; c.fillText('to the', 0, 10); c.font = `900 64px ${SERIF}`; c.fillText('PRINCESS', 0, 90); c.font = `22px ${SERIF}`; c.fillText('OF POYAIS', 0, 150); }, '#EFE5CC'); x.restore();
    headline(x, 'A COBBLER\'S', 'NEW JOB TITLE', 220, (g - sh) / 0.3); stamp(x, 'ROYAL', 800, 640, 70, 0.2, (g - at('y05', 'Princess') + 0.05) / 0.35); tag(x, 'RE-CREATED', 70, 1500, 1, { size: 26 }); }
  dust(x, g); });
// y06 · gold coins → turn into Poyais dollars at "for"
shot(L.y06 - 0.15, (x, g) => { table(x); const sw = at('y06', 'for') - 0.1, n = 26;
  for (let i = 0; i < n; i++) { const fall = eo((g - L.y06 - i * 0.05) / 0.5), cx = 180 + hash(i) * 720, cy = lerp(-150, 760 + hash(i * 3) * 600, fall), flip = clamp((g - sw - hash(i * 7) * 0.6) / 0.25);
    if (flip < 1) { x.save(); x.translate(cx, cy); x.scale(1, Math.abs(Math.cos(flip * Math.PI / 2))); coin(x, 0, 0, 70, hash(i * 5)); x.restore(); }
    if (flip > 0) { x.save(); x.translate(cx, cy); x.scale(1, Math.sin(flip * Math.PI / 2)); noteAt(x, 0.5, 0.5, 0, 0, 330, (hash(i * 5) - 0.5) * 0.9); x.restore(); } }
  headline(x, 'THEIR GOLD...', null, 230, (g - L.y06) / 0.3); headline(x, '', 'FOR POYAIS DOLLARS', 230, (g - sw) / 0.3);
  tag(x, 'NOTES PRINTED IN SCOTLAND', 70, 1500, (g - sw - 0.2) / 0.6, { size: 28 }); dust(x, g); });
// y07 (v2) · two ships at dusk (readable: lighter sky, big hulls) → at "Poyais": a map with the pin "POYAIS · HONDURAS COAST"
const COAST = [[0, 470], [150, 455], [235, 520], [240, 640], [205, 735], [300, 790], [430, 770], [560, 790], [700, 800], [800, 830], [860, 880], [850, 1000], [820, 1130], [800, 1250], [860, 1330], [1080, 1360], [1080, 1920], [0, 1920]];
function mapScene(x, g, u) { x.fillStyle = '#d9c9a4'; x.fillRect(0, 0, W, H); const pg = x.createRadialGradient(W / 2, 950, 200, W / 2, 950, 1100); pg.addColorStop(0, 'rgba(0,0,0,0)'); pg.addColorStop(1, 'rgba(70,45,15,0.55)'); x.fillStyle = pg; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(80,60,35,0.18)'; x.lineWidth = 2; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(0, 300 + i * 120); x.lineTo(W, 300 + i * 120); x.stroke(); x.beginPath(); x.moveTo(i * 100, 0); x.lineTo(i * 100, H); x.stroke(); }
  x.beginPath(); COAST.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.closePath(); x.fillStyle = '#b89a68'; x.fill(); x.strokeStyle = '#4a3420'; x.lineWidth = 5; x.stroke();
  x.fillStyle = '#4a3420'; x.textAlign = 'center'; x.font = `italic 700 44px ${SERIF}`; x.fillText('CARIBBEAN SEA', 640, 600); x.font = `italic 30px ${SERIF}`; x.fillText('Central America', 330, 1150);
  // route from Britain (off-frame, top right) to Black River
  const p = clamp(u * 1.4); x.save(); x.setLineDash([22, 16]); x.strokeStyle = '#8a2a1d'; x.lineWidth = 7; x.beginPath(); for (let k = 0; k <= 40 * p; k++) { const s = k / 40, bx = lerp(1100, 640, s), by = lerp(380, 770, s) - Math.sin(s * Math.PI) * 120; k ? x.lineTo(bx, by) : x.moveTo(bx, by); } x.stroke(); x.restore();
  x.save(); x.font = `700 28px ${TW}`; x.fillStyle = '#4a3420'; x.textAlign = 'right'; x.fillText('FROM BRITAIN →', 1040, 330); x.restore();
  const q = back((u - 0.55) / 0.3); if (q > 0) { x.save(); x.translate(640, 785); x.scale(q, q); x.fillStyle = '#D42A1D'; x.beginPath(); x.arc(0, -70, 34, 0, 7); x.fill(); x.beginPath(); x.moveTo(-26, -50); x.lineTo(0, 0); x.lineTo(26, -50); x.fill(); x.fillStyle = '#F2EDE4'; x.beginPath(); x.arc(0, -70, 12, 0, 7); x.fill(); x.restore(); }
  tag(x, 'POYAIS · HONDURAS COAST', W / 2, 960, (u - 0.6) / 0.4, { align: 'center', size: 40 }); tag(x, 'ILLUSTRATIVE MAP', 70, 1460, 1, { size: 24 }); }
shot(L.y07 - 0.15, (x, g) => { const mp = at('y07', 'Poyais') - 0.1;
  if (g < mp) { const sky = x.createLinearGradient(0, 0, 0, 1200); sky.addColorStop(0, '#3a4652'); sky.addColorStop(0.7, '#8f8a7a'); sky.addColorStop(1, '#c8b48a'); x.fillStyle = sky; x.fillRect(0, 0, W, 1200);
    const k = ss((g - L.y07 + 0.15) / 2.5); sea(x, g, 1180, '#33404a'); ship(x, lerp(160, 300, k), 1190 + Math.sin(g * 1.6) * 6, 1.45, '#0b0d10'); const u2 = eo((g - at('y07', 'ships') + 0.2) / 0.5); if (u2 > 0) ship(x, lerp(1350, 850, u2), 1220 + Math.sin(g * 1.4 + 1) * 6, 0.95, '#14181c');
    shadeTopBottom(x, 0.6); headline(x, '2 SHIPS', '1822–23', 230, (g - L.y07 + 0.1) / 0.3); tag(x, 'HONDURAS PACKET · KENNERSLEY CASTLE', 70, 1460, (g - L.y07) / 0.5, { size: 26 }); }
  else { const z = push(g, mp, mp + 2.5, 1.0, 1.12); x.save(); x.translate(640, 785); x.scale(z, z); x.translate(-640, -785); mapScene(x, g, (g - mp) / 0.6); x.restore(); headline(x, 'SAILING FOR', 'POYAIS', 210, (g - mp) / 0.3); }
  dust(x, g); });
// y08 · the promised capital (engraving pan, "ST JOSEPH") crossed out → jungle
shot(L.y08 - 0.15, (x, g) => { const jg = at('y08', 'Just') - 0.12;
  if (g < jg) { darkBg(x); riverPan(x, ss((g - L.y08) / 2.5) * 0.6 + 0.2, 1.0); shadeTopBottom(x, 0.85); const u = (g - at('y08', 'capital') + 0.05) / 0.3;
    tag(x, 'PROMISED: THE CAPITAL, ST JOSEPH', W / 2, 1380, (g - L.y08) / 0.5, { align: 'center', size: 30 }); headline(x, 'NO CAPITAL.', null, 260, u); headline(x, '', 'NO FARMS.', 260, (g - at('y08', 'farms') + 0.05) / 0.3);
    if (u > 0) { x.save(); x.strokeStyle = '#D42A1D'; x.lineWidth = 22; x.lineCap = 'round'; const p = clamp(u * 1.5); x.beginPath(); x.moveTo(170, 620); x.lineTo(lerp(170, 910, p), lerp(620, 1220, p)); x.stroke(); const q = clamp(u * 1.5 - 0.5); if (q > 0) { x.beginPath(); x.moveTo(910, 620); x.lineTo(lerp(910, 170, q), lerp(620, 1220, q)); x.stroke(); } x.restore(); }
    credit(x, 'ENGRAVING FROM THE 1822 GUIDEBOOK (ARCHIVE)', 1470); }
  else { const z = push(g, jg, jg + 3, 1.0, 1.1); x.save(); x.translate(W / 2, 1000); x.scale(z, z); x.translate(-W / 2, -1000); jungle(x, g); x.restore(); headline(x, 'JUST JUNGLE.', null, 300, (g - jg) / 0.3); tag(x, 'BLACK RIVER · MOSQUITO COAST', 70, 1460, (g - jg - 0.2) / 0.6, { size: 28 }); }
  dust(x, g); });
// y09 (v2) · ~250 figures drain to fewer than 50 (random order, no running number), then a held pause
shot(L.y09 - 0.15, (x, g) => { jungle(x, g, 0.3); x.fillStyle = 'rgba(5,5,4,0.6)'; x.fillRect(0, 0, W, H); const c = eo(clamp((g - L.y09 - 0.1) / 1.3)), n = Math.round(lerp(250, 45, c));
  const cols = 25; for (let i = 0; i < 250; i++) { const h9 = hash(i * 5.3); const cx = 90 + (i % cols) * 37.5, cy = 560 + Math.floor(i / cols) * 70; const alive = h9 < 0.18 || h9 > 0.18 + c * 0.83;
    x.fillStyle = alive ? '#E8DCC0' : 'rgba(232,220,192,0.10)'; x.beginPath(); x.arc(cx, cy - 16, 9, 0, 7); x.fill(); x.fillRect(cx - 8, cy - 6, 16, 26); }
  headline(x, 'FEWER THAN 50', 'CAME HOME', 300, (g - L.y09 + 0.1) / 0.3);
  tag(x, 'OF ~250 WHO SAILED · ACCOUNTS DIFFER', 70, 1460, (g - L.y09 - 0.2) / 0.6, { size: 26 }); dust(x, g); });
// y10 · MacGregor? → PARIS 1826, tried → ACQUITTED
shot(L.y10 - 0.15, (x, g) => { const fr = at('y10', 'French') - 0.12;
  if (g < fr) { darkBg(x, '#211812', '#0a0705'); const z = push(g, L.y10, fr, 1.05, 1.25); x.save(); x.translate(W / 2, 700); x.scale(z, z); x.translate(-W / 2, -700); portrait(x, W / 2, 800, 900, 0.02, 1); x.restore(); shadeTopBottom(x, 0.6);
    const v = (g - L.y10 - 0.35) / 0.4; if (v > 0) { x.save(); x.globalAlpha = clamp(v * 2); x.beginPath(); x.rect(70, 1270, 940, 190); x.clip(); noteAt(x, 0.38, 0.8, W / 2, 1365, 2400, 0); x.restore(); x.strokeStyle = '#D42A1D'; x.lineWidth = 6; x.strokeRect(70, 1270, 940, 190); }
    headline(x, 'AND MACGREGOR?', null, 240, (g - L.y10) / 0.3); tag(x, 'SELF-STYLED "CAZIQUE OF POYAIS"', W / 2, 1220, v, { align: 'center', size: 30 }); }
  else { darkBg(x, '#1e150e', '#080605'); const z = push(g, fr, E.y10 + 0.3, 1, 1.08); x.save(); x.translate(W / 2, 980); x.scale(z, z); x.translate(-W / 2, -980);
    paperDoc(x, W / 2, 980, 800, 900, -0.03, c => { c.fillStyle = '#2a2016'; c.textAlign = 'center'; c.font = `700 34px ${SERIF}`; c.fillText('TRIBUNAL · PARIS', 0, -340); c.font = `italic 28px ${SERIF}`; c.fillText('Affaire du Poyais — Escroquerie', 0, -290);
      c.textAlign = 'left'; c.font = `26px ${TW}`; [['ACCUSÉ', 'G. MACGREGOR'], ['ANNÉE', '1826'], ['CHARGE', 'FRAUDE']].forEach(([a, b], i) => { c.fillText(a + ':', -320, -190 + i * 60); c.fillText(b, -100, -190 + i * 60); });
      for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(42,32,22,0.4)'; c.fillRect(-320, 20 + i * 40, 640 - (i % 3) * 90, 9); } }); x.restore();
    headline(x, 'TRIED FOR FRAUD', null, 240, (g - fr) / 0.3); tag(x, 'PARIS · 1826', 70, 1460, (g - fr) / 0.5, { size: 30 }); stamp(x, 'ACQUITTED', 540, 1060, 120, -0.14, (g - at('y10', 'let') + 0.05) / 0.35); tag(x, 'RE-CREATED DOCUMENT', 70, 1520, 1, { size: 24 }); }
  dust(x, g); });
// y11 · Caracas 1845: pension + hero's funeral (portrait with a black ribbon, candles)
shot(L.y11 - 0.15, (x, g) => { darkBg(x, '#1a120c', '#050403'); const z = push(g, L.y11, E.y11 + 0.4, 1, 1.16); x.save(); x.translate(W / 2, 860); x.scale(z, z); x.translate(-W / 2, -860);
  portrait(x, W / 2, 860, 760, 0, 1); x.save(); x.translate(W / 2, 860); x.fillStyle = '#0a0806'; x.beginPath(); x.moveTo(-340, -420); x.lineTo(-210, -420); x.lineTo(-340, -290); x.fill(); x.beginPath(); x.moveTo(340, -420); x.lineTo(210, -420); x.lineTo(340, -290); x.fill(); x.restore();
  for (const cx of [150, 930]) { x.fillStyle = '#E8DCC0'; x.fillRect(cx - 18, 1120, 36, 180); const fl = 1 + 0.15 * Math.sin(g * 13 + cx); x.fillStyle = '#F6C65B'; x.beginPath(); x.ellipse(cx, 1100, 12 * fl, 30 * fl, 0, 0, 7); x.fill(); const gg = x.createRadialGradient(cx, 1100, 5, cx, 1100, 260); gg.addColorStop(0, 'rgba(255,200,110,0.3)'); gg.addColorStop(1, 'rgba(255,200,110,0)'); x.fillStyle = gg; x.fillRect(cx - 260, 840, 520, 520); } x.restore();
  { const pu = eo((g - at('y11', 'pension') + 0.2) / 0.45); if (pu > 0) paperDoc(x, lerp(1500, 790, pu), 1180, 420, 250, 0.08, c => { c.fillStyle = '#2a2016'; c.textAlign = 'center'; c.font = `700 30px ${SERIF}`; c.fillText('VENEZUELA', 0, -60); c.font = `900 40px ${SERIF}`; c.fillText('PENSIÓN MILITAR', 0, 0); c.font = `italic 22px ${SERIF}`; c.fillText('General G. MacGregor', 0, 50); }); } headline(x, 'HE DIED', null, 200, (g - L.y11) / 0.3); headline(x, '', 'A HERO', 200, (g - at('y11', 'hero') + 0.05) / 0.3); tag(x, 'CARACAS · 1845', 70, 1400, (g - L.y11) / 0.5, { size: 30 }); tag(x, 'MILITARY PENSION · FULL MILITARY HONOURS', 70, 1470, (g - at('y11', 'military') + 0.05) / 0.6, { size: 26 }); dust(x, g); });
// y12 · everything fake / only the money real: the note (FAKE) vs real gold (REAL)
shot(L.y12 - 0.15, (x, g) => { table(x); const u = eo((g - L.y12 + 0.15) / 0.5); noteAt(x, 0.5, 0.5, W / 2, lerp(-400, 640, u), 900, -0.05);
  const v = eo((g - at('y12', 'Only') + 0.1) / 0.5); for (let i = 0; i < 16; i++) coin(x, 260 + (i % 6) * 110 + (Math.floor(i / 6) % 2) * 55 + lerp(-1300, 0, eo(clamp(v * 1.2 - i * 0.012))), 1290 - Math.floor(i / 6) * 70, 68, hash(i));
  stamp(x, 'FAKE', 760, 560, 120, -0.18, (g - at('y12', 'fake') + 0.05) / 0.35); stamp(x, 'REAL', 760, 1150, 120, 0.12, (g - at('y12', 'real') + 0.05) / 0.35, '#2E8B57');
  headline(x, 'THE COUNTRY: FAKE.', null, 220, (g - at('y12', 'fake') + 0.1) / 0.3, 940); headline(x, '', 'THE MONEY: REAL.', 220, (g - at('y12', 'real') + 0.1) / 0.3, 940); tag(x, "THE SETTLERS' MONEY: NEVER RETURNED", W / 2, 1470, (g - at('y12', 'real') - 0.35) / 0.5, { align: 'center', size: 30 }); headline(x, 'EVERYTHING HE SOLD...', null, 220, g < at('y12', 'fake') - 0.1 ? (g - L.y12) / 0.3 : 0, 940); dust(x, g); });
// card · back to the frame-0 picture + the question (no voice)
shot(CARD0 - 0.1, (x, g) => { hook(x, 4.4, 0, 1, false); x.fillStyle = 'rgba(8,6,5,0.2)'; x.fillRect(0, 0, W, H); stamp(x, "DOESN'T EXIST", 540, 1010, 112, -0.16, 1);
  const u = (g - CARD0) / 0.35; headline(x, "WHAT'S TODAY'S", 'POYAIS?', 380, u, 900); x.save(); x.globalAlpha = clamp(u); x.font = '150px Emoji'; x.textAlign = 'center'; x.fillText('👇', W / 2, 1500 + Math.sin(g * 5) * 12); x.restore(); dust(x, g); });
// ---------- subtitles (word groups, current word highlighted), safe zone y≈1600 ----------
const SUB = []; for (const l of LINES) { const ws = WD[l.id]; let grp = []; ws.forEach((w, k) => { grp.push(w); if (grp.length === 3 || /[.,?!:…"]$/.test(w.w) || k === ws.length - 1) { grp.id = l.id; SUB.push(grp); grp = []; } }); }
function subs(x, g) { const gi = SUB.findIndex(gr => g >= gr[0].a - 0.05 && g <= Math.min(gr[gr.length - 1].b + 0.12, E[gr.id] + 0.05)); if (gi < 0 || g >= CARD0) return; const gr = SUB[gi];
  x.save(); x.font = `900 66px ${F}`; x.textBaseline = 'middle'; const words = gr.map(w => w.w.replace(/["“”]/g, '').replace(/\.+$/, '').replace(/…/g, '').replace(/,$/, ',').toUpperCase()); const sp = 20; let ws = words.map(w => x.measureText(w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  if (tw > 980) { const k = 980 / tw; x.font = `900 ${Math.floor(66 * k)}px ${F}`; ws = words.map(w => x.measureText(w).width); tw = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1); }
  let cx = W / 2 - tw / 2; words.forEach((w, i) => { const cur = g >= gr[i].a - 0.03 && (i === gr.length - 1 || g < gr[i + 1].a - 0.03); x.lineWidth = 12; x.strokeStyle = '#000'; x.lineJoin = 'round'; x.strokeText(w, cx, 1600); x.fillStyle = cur ? '#E8B84A' : '#FFFFFF'; x.fillText(w, cx, 1600); cx += ws[i] + sp; }); x.restore(); }
// ---------- frame ----------
const CA = createCanvas(W, H);
function draw(cv, sh, g) { const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; sh.fn(x, g); }
const HITS = [0.0, at('y01', 'country'), at('y04', '£200'), at('y05', 'Princess'), at('y08', 'capital'), at('y10', 'let'), at('y12', 'fake'), at('y12', 'real')];
function frame(ctx, g, noSubs) { let i = SH.findLastIndex(s => g >= s.t0); if (i < 0) i = 0; const sh = SH[i]; draw(CA, sh, g); const lt = g - sh.t0;
  let k = 1, dx = Math.sin(g * 0.8) * 5, dy = Math.cos(g * 0.7) * 4; for (const h of HITS) { const d = g - h - 0.1; if (d >= 0 && d < 0.5) { const e = Math.exp(-d * 8); k += 0.04 * e; dx += Math.sin(d * 80) * 12 * e; dy += Math.cos(d * 70) * 8 * e; } }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(W / 2 + dx, H / 2 + dy); ctx.scale(k * 1.02, k * 1.02); ctx.drawImage(CA, -W / 2, -H / 2); ctx.restore();
  if (i > 0 && lt < 0.18) { ctx.fillStyle = `rgba(255,245,230,${0.1 * (1 - lt / 0.18)})`; ctx.fillRect(0, 0, W, H); }
  vignette(ctx); grain(ctx, g); if (!noSubs) subs(ctx, g); }
module.exports = { T, L, E, WD, CARD0, at, load, noteAt, stamp, tag, fit, grain, vignette, darkBg, table, shadeTopBottom, dust, F, TW, W, H, hook };
if (require.main === module) (async () => { const [mode, a1, a2] = process.argv.slice(2); if (mode === 'T') return console.log(T);
  if (mode === 'cues') { const cues = { T, lines: LINES.map(l => [l.id, +L[l.id].toFixed(3)]), card: CARD0,
      hits: { exist: 0.0, ruler: at('y02', 'packed'), book: L.y03, flag: at('y03', 'flag'), money: at('y03', 'money'), bond: L.y04, counter: at('y04', '£200'), land: L.y05, jobs: at('y05', 'Men'), shoe: at('y05', 'A'), royal: at('y05', 'Princess'),
        coins: L.y06, swap: at('y06', 'for'), ships: L.y07, ship2: at('y07', 'Poyais'), capital: at('y08', 'capital'), jungle: at('y08', 'Just'), count: L.y09, court: at('y10', 'French'), acquitted: at('y10', 'let'), caracas: L.y11, final: L.y12, fake: at('y12', 'fake'), real: at('y12', 'real') }, shots: SH.map(s => +s.t0.toFixed(3)) };
    return fs.writeFileSync(path.join(D, 'cues_v2.json'), JSON.stringify(cues, null, 1)); }
  if (mode === 'srt') { const ts = v => { const ms = Math.round(v * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
    return fs.writeFileSync(a1, LINES.map((l, i) => `${i + 1}\n${ts(L[l.id])} --> ${ts(E[l.id] + 0.1)}\n${SRTTXT[l.id] || l.text}\n`).join('\n')); }
  await load(); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'shots') return console.log(SH.map(s => s.t0.toFixed(2)).join(' '), 'T', T);
  if (mode === 'carousel') { fs.mkdirSync(path.join(D, 'carousel_v2'), { recursive: true }); a1.split(',').map(Number).forEach((tt, i) => { frame(ctx, tt, true); fs.writeFileSync(path.join(D, 'carousel_v2', `0${i + 1}.png`), cv.toBuffer('image/png')); }); return; }
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(360 * 6, 640 * Math.ceil(ts.length / 6)), c2 = sh.getContext('2d'); ts.forEach((tt, i) => { frame(ctx, tt); c2.drawImage(cv, (i % 6) * 360, Math.floor(i / 6) * 640, 360, 640); c2.fillStyle = '#f33'; c2.font = '22px sans-serif'; c2.fillText(tt.toFixed(1), (i % 6) * 360 + 6, Math.floor(i / 6) * 640 + 24); }); return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < Math.round(T * FPS); f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); await new Promise(r => ff.on('close', r)); } })();
