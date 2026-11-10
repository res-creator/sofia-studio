// Episode 30 "Carnegie's Daughter" (Cassie Chadwick, 1897–1904) — How It's Run, ADULT DOCUMENTARY style (code pattern of poyais_ep29 v2):
// archive images (Chadwick 1904 cabinet card; Andrew Carnegie c.1913; her Euclid Avenue house postcard; Carnegie's signature; the Pacific Commercial
// Advertiser, Dec 8 1904, "ARREST OF MRS. CHADWICK WHO CALLS CARNEGIE FATHER" — Library of Congress, Chronicling America), dark sepia grade, film grain,
// red rubber stamps, typewriter tags, re-created documents labelled RE-CREATED, counters, push-ins and punch-ins on hits. 1080x1920, 30 fps. Voice: Chris (vo/).
// node episode.js cues | srt out.srt | still t1,t2,… out.png | frame t out.png | carousel t1,…,t6 | video out.mp4 | T | shots
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas'); const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Emoji');
const D = __dirname, W = 1080, H = 1920, FPS = 30;
const F = '"Inter Display", Inter, sans-serif', TW = '"DejaVu Sans Mono", monospace', SERIF = '"DejaVu Serif", serif';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, eo = u => 1 - Math.pow(1 - clamp(u), 3);
const back = u => { u = clamp(u); if (u <= 0) return 0; if (u >= 1) return 1; const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// ---------- timeline from the voice ----------
const LINES = JSON.parse(fs.readFileSync(path.join(D, 'script.json'))), SPEECH = JSON.parse(fs.readFileSync(path.join(D, 'vo/speech.json')));
const START = 0.25, GAP = { c01: 0.35, c02: 0.35, c03: 0.3, c04: 0.3, c05: 0.35, c06: 0.3, c07: 0.3, c08: 0.35, c09: 1.0, c10: 0.45 }, CARD = 2.8;
// spoken words → digits on screen (subtitles + SRT)
const MERGE = [['c01', ['twomilliondollar'], '$2,000,000'], ['c05', ['twentyfive', 'percent'], '25%'], ['c05', ['two', 'million', 'dollars'], '$2 million'], ['c07', ['hundred', 'and', 'ninety', 'thousand'], '$190,000'], ['c08', ['thirty'], '30']];
const SRTTXT = { c01: "She walked out of Carnegie's mansion... and dropped a $2,000,000 note he never signed.", c05: 'Some at 25%. By one estimate, about $2 million in all.',
  c07: 'Then one lender wanted his $190,000 back.', c08: "Carnegie's office said: he didn't know her, and hadn't signed a note in over 30 years." };
const nrm = s => s.toLowerCase().replace(/[^a-z0-9£$]/g, '');
const L = {}, E = {}, WD = {}; let t = START;
for (const l of LINES) { const a = JSON.parse(fs.readFileSync(path.join(D, `vo/${l.id}.align.json`))), [s0, s1] = SPEECH[l.id]; L[l.id] = t - s0; E[l.id] = L[l.id] + s1;
  let ws = []; let cur = null; a.characters.forEach((ch, i) => { if (/\s/.test(ch)) { if (cur) { ws.push(cur); cur = null; } return; } if (!cur) cur = { w: '', a: a.character_start_times_seconds[i] }; cur.w += ch; cur.b = a.character_end_times_seconds[i]; }); if (cur) ws.push(cur);
  ws = ws.map(x => ({ w: x.w, a: L[l.id] + x.a, b: L[l.id] + x.b }));
  for (const [id, seq, rep] of MERGE) if (id === l.id) { const i = ws.findIndex((_, k) => seq.every((s, j) => ws[k + j] && nrm(ws[k + j].w).startsWith(s) && (j < seq.length - 1 ? nrm(ws[k + j].w) === s : true))); if (i < 0) throw new Error('merge ' + id + ' ' + seq);
    const tail = ws[i + seq.length - 1].w.match(/[.,?!…]+$/); const rest = nrm(ws[i + seq.length - 1].w).slice(seq[seq.length - 1].length);
    ws.splice(i, seq.length, { w: rep + (rest ? ' ' + rest.toUpperCase() : '') + (tail ? tail[0] : ''), a: ws[i].a, b: ws[i + seq.length - 1].b }); }
  WD[l.id] = ws; t = E[l.id] + (GAP[l.id] ?? 0.3); }
const CARD0 = E.c11 + 0.8, T = +(CARD0 + CARD).toFixed(2);
const at = (id, w, n = 0) => { const h = WD[id].filter(x => nrm(x.w).startsWith(nrm(w))); if (!h[n]) throw new Error(`no ${w} in ${id}`); return h[n].a; };
// ---------- assets ----------
let CAS, CAR, HOUSE, SIG, NEWS;
async function load() { const A = f => loadImage(path.join(D, 'archive', f)); CAS = await A('chadwick_1904.jpg'); CAR = await A('carnegie_1913.jpg'); HOUSE = await A('euclid_house.jpg'); SIG = await A('carnegie_signature.png'); NEWS = await A('newspaper_1904-12-08_arrest.jpg'); }
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
function emigrant(x, cx, by, h, kind, ph, col = '#0b0907') { const b = Math.abs(Math.sin(ph)) * h * 0.02, st = Math.sin(ph) * h * 0.06; x.save(); x.fillStyle = col; x.translate(cx, by - b);
  const hw = h * 0.13; x.beginPath(); x.moveTo(-hw * 0.4, -h * 0.47); x.lineTo(-hw * 0.4 + st, 0); x.lineTo(-hw * 0.4 + st + h * 0.05, 0); x.lineTo(0, -h * 0.45); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(hw * 0.4, -h * 0.47); x.lineTo(hw * 0.4 - st, 0); x.lineTo(hw * 0.4 - st - h * 0.05, 0); x.lineTo(0, -h * 0.45); x.closePath(); x.fill();
  if (kind === 'w') { x.beginPath(); x.moveTo(-hw * 0.7, -h * 0.8); x.lineTo(hw * 0.7, -h * 0.8); x.lineTo(hw * 1.5, -h * 0.05); x.lineTo(-hw * 1.5, -h * 0.05); x.closePath(); x.fill(); }
  else { x.beginPath(); x.moveTo(-hw, -h * 0.82); x.lineTo(hw, -h * 0.82); x.lineTo(hw * 0.85, -h * 0.42); x.lineTo(-hw * 0.85, -h * 0.42); x.closePath(); x.fill(); }
  x.beginPath(); x.arc(0, -h * 0.89, h * 0.075, 0, 7); x.fill();
  if (kind === 'm') { x.fillRect(-h * 0.06, -h * 1.06, h * 0.12, h * 0.13); x.fillRect(-h * 0.1, -h * 0.94, h * 0.2, h * 0.02); }
  if (kind === 'w') { x.beginPath(); x.ellipse(0, -h * 0.93, h * 0.11, h * 0.07, 0, Math.PI, 0); x.fill(); }
  if (kind !== 'k') { x.fillRect(hw * 0.9, -h * 0.5, h * 0.22, h * 0.15); } x.restore(); }
// ---------- props ----------
const INK = '#2a2016';
function photo(x, im, cx, cy, h, rot = 0, a = 1, filt = PF, frame = true, crop) { const [sx, sy, sw, sh] = crop || [0, 0, im.width, im.height], w = h * sw / sh; x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(rot);
  if (frame) { x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 50; x.fillStyle = '#F2ECDF'; x.fillRect(-w / 2 - 22, -h / 2 - 22, w + 44, h + 44); x.shadowColor = 'transparent'; } x.filter = filt; x.drawImage(im, sx, sy, sw, sh, -w / 2, -h / 2, w, h); x.restore(); }
// the re-created $2,000,000 promissory note with Carnegie's real signature; centre at 0, size 900x430 at s=1
function note(c, s = 1) { c.save(); c.scale(s, s); c.shadowColor = 'rgba(0,0,0,0.75)'; c.shadowBlur = 50; c.shadowOffsetY = 18; c.fillStyle = '#EFE6CF'; c.fillRect(-450, -215, 900, 430); c.shadowColor = 'transparent';
  const g = c.createRadialGradient(0, 0, 150, 0, 0, 560); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(110,75,25,0.38)'); c.fillStyle = g; c.fillRect(-450, -215, 900, 430);
  c.strokeStyle = '#6a5436'; c.lineWidth = 4; c.strokeRect(-430, -195, 860, 390); c.lineWidth = 1.5; c.strokeRect(-418, -183, 836, 366);
  c.fillStyle = INK; c.textAlign = 'left'; c.font = `700 24px ${SERIF}`; c.fillText('PROMISSORY NOTE', -395, -140); c.textAlign = 'right'; c.font = `900 50px ${SERIF}`; c.fillText('$2,000,000.00', 395, -122);
  c.textAlign = 'left'; c.font = `italic 27px ${SERIF}`; c.fillText('New York, ____________', -395, -78); c.fillText('On demand I promise to pay', -395, -20); c.font = `italic 700 34px ${SERIF}`; c.fillText('Two Million Dollars', -395, 28);
  c.font = `italic 24px ${SERIF}`; c.fillText('value received.', -395, 70); c.strokeStyle = 'rgba(42,32,22,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(20, 140); c.lineTo(400, 140); c.stroke();
  if (SIG) { c.save(); c.globalAlpha = 0.9; const sw = 380, sh = sw * SIG.height / SIG.width; c.drawImage(SIG, 25, 140 - sh - 6, sw, sh); c.restore(); } c.restore(); }
// a gloved (women's opera glove) hand from the top-left pinching a point (0,0); open: 0 = pinch, 1 = fingers apart
function glove(c, s = 1, open = 0, rot = 0, col = '#2b2420') { c.save(); c.scale(s, s); c.rotate(rot); c.fillStyle = col; c.strokeStyle = 'rgba(255,235,205,0.45)'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(-620, -520); c.lineTo(-470, -620); c.lineTo(-40, -150); c.lineTo(-170, -40); c.closePath(); c.fill(); c.stroke();          // forearm
  c.beginPath(); c.ellipse(-80, -95, 120, 90, -0.75, 0, 7); c.fill(); c.stroke();                                                                   // palm
  const o = open * 0.6; [[-0.15 - o, 175], [0.25 - o * 0.3, 190], [0.6 + o * 0.2, 170], [0.95 + o * 0.5, 140]].forEach(([a, len], i) => { c.save(); c.translate(-40 + i * 6, -60 - i * 4); c.rotate(a); c.beginPath(); c.roundRect(0, -19, len * 0.75, 38, 19); c.fill(); c.stroke(); c.restore(); });
  c.save(); c.translate(-120, -10); c.rotate(-0.2 + o); c.beginPath(); c.roundRect(0, -21, 150, 42, 21); c.fill(); c.stroke(); c.restore();          // thumb
  c.fillStyle = 'rgba(255,240,220,0.08)'; for (let i = 0; i < 3; i++) { c.fillRect(-560 + i * 40, -560 + i * 34, 380, 4); } c.restore(); }
// a man's hand (white cuff, dark sleeve) reaching down from the top-right to pick something up at (0,0)
function manHand(c, s = 1, grip = 0) { c.save(); c.scale(s, s); c.fillStyle = '#1d1a18'; c.beginPath(); c.moveTo(700, -900); c.lineTo(900, -760); c.lineTo(250, -170); c.lineTo(90, -300); c.closePath(); c.fill();
  c.fillStyle = '#EDE6D6'; c.save(); c.translate(170, -235); c.rotate(-0.73); c.fillRect(-110, -40, 220, 80); c.restore(); c.fillStyle = '#C9A38A';
  c.beginPath(); c.ellipse(60, -110, 110, 80, -0.7, 0, 7); c.fill(); const k = grip * 0.5; [[2.1 - k, 160], [2.4 - k, 175], [2.7 - k * 0.6, 160], [3.0 - k * 0.4, 130]].forEach(([a, len], i) => { c.save(); c.translate(20 - i * 18, -60 + i * 10); c.rotate(a); c.beginPath(); c.roundRect(0, -17, len * 0.7, 34, 17); c.fill(); c.restore(); });
  c.save(); c.translate(120, -40); c.rotate(1.9 + k); c.beginPath(); c.roundRect(0, -19, 120, 38, 19); c.fill(); c.restore(); c.restore(); }
// neoclassical bank facade, base centre at 0
function bank(c, crack = 0, closed = 0) { c.save(); c.fillStyle = '#cbbd9c'; c.fillRect(-460, -760, 920, 760); c.fillStyle = '#b3a481'; c.beginPath(); c.moveTo(-500, -760); c.lineTo(0, -960); c.lineTo(500, -760); c.closePath(); c.fill(); c.fillStyle = '#a49470'; c.fillRect(-500, -790, 1000, 40);
  c.fillStyle = INK; c.textAlign = 'center'; c.font = `900 50px ${SERIF}`; c.fillText('CITIZENS NATIONAL BANK', 0, -680); for (let i = 0; i < 4; i++) { const cx = -330 + i * 220; c.fillStyle = '#e2d7bd'; c.fillRect(cx - 38, -620, 76, 560); c.fillStyle = 'rgba(0,0,0,0.15)'; for (let k = 0; k < 5; k++) c.fillRect(cx - 30 + k * 14, -620, 3, 560); }
  c.fillStyle = '#2b2018'; c.fillRect(-90, -400, 180, 340); c.fillStyle = '#9a8b6a'; for (let k = 0; k < 4; k++) c.fillRect(-540 + k * 20, -60 + k * 20, 1080 - k * 40, 20);
  if (closed > 0) { c.save(); c.globalAlpha = clamp(closed * 2); c.fillStyle = '#EFE6CF'; c.translate(0, -260); c.rotate(-0.06); c.fillRect(-150, -55, 300, 110); c.fillStyle = '#B3261B'; c.font = `900 66px ${F}`; c.fillText('CLOSED', 0, 24); c.restore(); }
  if (crack > 0) { c.save(); c.strokeStyle = '#1a120b'; c.lineWidth = 9; c.lineCap = 'round'; const pts = [[60, -940], [20, -820], [80, -720], [-10, -600], [50, -480], [-30, -330], [30, -200], [-20, -60]]; const n = 1 + crack * (pts.length - 1);
    c.beginPath(); c.moveTo(...pts[0]); for (let i = 1; i < n; i++) c.lineTo(...pts[i]); const fi = Math.floor(n); if (fi < pts.length) { const f = n - fi, a = pts[fi - 1], b = pts[fi]; c.lineTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); } c.stroke();
    if (crack > 0.6) { c.lineWidth = 5; c.beginPath(); c.moveTo(80, -720); c.lineTo(230, -650); c.moveTo(-10, -600); c.lineTo(-180, -520); c.stroke(); } c.restore(); } c.restore(); }
function cash(c, cx, cy, w, rot = 0) { c.save(); c.translate(cx, cy); c.rotate(rot); c.fillStyle = '#c9cdb5'; c.fillRect(-w / 2, -w * 0.22, w, w * 0.44); c.strokeStyle = '#4d5a44'; c.lineWidth = 3; c.strokeRect(-w / 2 + 6, -w * 0.22 + 6, w - 12, w * 0.44 - 12);
  c.fillStyle = '#4d5a44'; c.font = `900 ${Math.round(w * 0.16)}px ${SERIF}`; c.textAlign = 'center'; c.fillText('$', -w * 0.33, w * 0.06); c.fillText('$', w * 0.33, w * 0.06); c.fillStyle = '#e8c14a'; c.fillRect(-w * 0.06, -w * 0.22, w * 0.12, w * 0.44); c.restore(); }
function phone(c, s = 1, shake = 0) { c.save(); c.scale(s, s); c.translate(Math.sin(shake * 60) * 6 * (shake > 0), 0); c.fillStyle = '#121010'; c.beginPath(); c.ellipse(0, 0, 150, 40, 0, 0, 7); c.fill(); c.fillRect(-28, -520, 56, 520);
  c.beginPath(); c.ellipse(0, -540, 70, 34, 0, 0, 7); c.fill(); c.fillStyle = '#2a2622'; c.beginPath(); c.ellipse(0, -545, 46, 20, 0, 0, 7); c.fill();
  c.fillStyle = '#121010'; c.fillRect(30, -420, 150, 26); c.beginPath(); c.roundRect(150, -470, 40, 260, 18); c.fill(); c.beginPath(); c.ellipse(170, -470, 46, 30, 0, 0, 7); c.fill(); c.restore(); }
// ---------- shots ----------
const SH = [];
const shot = (t0, fn) => SH.push({ t0, fn });
const push = (g, t0, t1, z0 = 1.0, z1 = 1.08) => lerp(z0, z1, ss((g - t0) / Math.max(0.5, t1 - t0)));
const zoomAt = (x, cx, cy, z) => { x.translate(cx, cy); x.scale(z, z); x.translate(-cx, -cy); };
// c01 · frame 0: the gloved hand holds the note, FORGED at 0.0; at "dropped" the fingers open and the note tumbles toward camera
function hook(x, g, card = false) { table(x); const dr = card ? 99 : at("c01", "dropped"), fallU = clamp((g - dr - 0.1) / 0.9), z = push(g, 0, 4.4, 1.0, 1.07);
  x.save(); zoomAt(x, W / 2, 960, z);
  // mansion doorway behind (dark brownstone + lit door)
  x.fillStyle = '#120d09'; x.fillRect(0, 0, W, 1250); x.fillStyle = 'rgba(255,205,140,0.16)'; x.fillRect(640, 250, 300, 760); x.fillStyle = '#2a1f17'; for (let i = 0; i < 6; i++) x.fillRect(590 + i * 2, 220 + i * 4, 4, 820);
  x.fillStyle = '#1d1610'; x.fillRect(0, 1030, W, 40); x.fillRect(0, 1100, W, 40);
  const nx = W / 2 + 10, ny = lerp(880, 1010, eo(fallU)), nr = lerp(-0.12, 0.08, eo(fallU)) + Math.sin(fallU * 7) * 0.05 * (1 - fallU), ns = lerp(0.98, 1.04, eo(fallU));
  x.save(); x.translate(nx, ny); x.rotate(nr); note(x, ns); x.restore();
  if (!card) { x.save(); x.translate(nx - 380 * ns - fallU * 220, ny - 150 - fallU * 260); glove(x, 1.3, clamp((g - dr) / 0.25), 0.25); x.restore(); } x.restore();
  shadeTopBottom(x, 0.75); dust(x, g); }
shot(0, (x, g) => { hook(x, g); headline(x, '$2,000,000', 'NOTE', 300, 0.55 + g * 2); stamp(x, 'FORGED', 760, 1180, 120, -0.16, (g + 0.25) / 0.4); tag(x, 'NEW YORK', 70, 1420, 1);
  tag(x, 'HE NEVER SIGNED IT', 70, 1490, (g - at('c01', 'never') + 0.1) / 0.5, { size: 30, bg: 'rgba(212,42,29,0.92)', col: '#F2EDE4' }); credit(x, 'RE-CREATED NOTE · SIGNATURE: A. CARNEGIE (ARCHIVE)', 1545); });
// c02 · a man's hand picks it up (close-up) → at "one day": flash-forward, a crack runs down a bank facade
shot(L.c02 - 0.15, (x, g) => { const od = at('c02', 'one') - 0.1;
  if (g < od) { table(x); const u = clamp((g - L.c02) / 1.6), z = push(g, L.c02, od, 1.05, 1.15); x.save(); zoomAt(x, W / 2, 1000, z);
    x.fillStyle = '#17110c'; x.fillRect(0, 0, W, H); x.fillStyle = '#251a12'; for (let i = 0; i < 10; i++) x.fillRect(0, 300 + i * 160, W, 6);
    const lift = eo(clamp((g - L.c02 - 1.2) / 1.0)); x.save(); x.translate(W / 2, 1050 - lift * 180); x.rotate(0.12 - lift * 0.1); note(x, 0.95); x.restore();
    x.save(); x.translate(W / 2 + 330, lerp(300, 880, eo(u)) - lift * 180); manHand(x, 1.15, clamp((g - L.c02 - 1.0) / 0.3)); x.restore(); x.restore();
    shadeTopBottom(x, 0.7); headline(x, 'A MAN', 'FROM OHIO', 250, (g - L.c02) / 0.3); tag(x, '30 MIN. WITH THE STAFF. NO CARNEGIE.', W / 2, 1450, (g - L.c02 - 0.5) / 0.6, { align: 'center', size: 32 }); }
  else { const sky = x.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#2a241f'); sky.addColorStop(1, '#0c0907'); x.fillStyle = sky; x.fillRect(0, 0, W, H); const z = push(g, od, E.c02 + 0.4, 1.0, 1.1);
    x.save(); zoomAt(x, W / 2, 1300, z); x.translate(W / 2, 1380); x.filter = 'sepia(0.5) brightness(0.8)'; bank(x, clamp((g - at('c02', 'collapse') + 0.05) / 0.6)); x.restore(); x.filter = 'none';
    shadeTopBottom(x, 0.7); headline(x, 'ONE DAY...', null, 250, (g - od) / 0.3); headline(x, '', 'A BANK FALLS', 250, (g - at('c02', 'collapse') + 0.05) / 0.3); tag(x, 'OBERLIN, OHIO', 70, 1520, (g - od - 0.2) / 0.5, { size: 30 }); tag(x, 'ILLUSTRATION', W - 230, 1520, 1, { size: 22 }); }
  dust(x, g); });
// c03 · her portrait (archive), zoom toward the eyes; CLAIMED stamp on "daughter"
shot(L.c03 - 0.15, (x, g) => { darkBg(x, '#201712', '#080605'); const z = push(g, L.c03, E.c03 + 0.3, 1.0, 1.45); x.save(); zoomAt(x, W / 2, 640, z); photo(x, CAS, W / 2, 900, 1150, 0.02, 1, PF, true, [0, 0, CAS.width, CAS.height * 0.86]); x.restore();
  shadeTopBottom(x, 0.6); headline(x, 'HER SECRET:', null, 230, (g - L.c03) / 0.3); headline(x, '', "CARNEGIE'S DAUGHTER", 230, (g - at('c03', 'Carnegie') + 0.05) / 0.3, 960);
  stamp(x, 'CLAIMED', 760, 1250, 100, -0.14, (g - at('c03', 'daughter') - 0.05) / 0.35); tag(x, 'CASSIE L. CHADWICK · 1904 (ARCHIVE)', 70, 1470, (g - L.c03 - 0.3) / 0.6, { size: 28 }); dust(x, g); });
// c04 · loan papers land on a banker's desk → "Nobody asked Carnegie": a telephone nobody picks up
function loanDoc(c, w, h, i) { c.strokeStyle = '#5a4630'; c.lineWidth = 3; c.strokeRect(-w / 2 + 20, -h / 2 + 20, w - 40, h - 40); c.fillStyle = INK; c.textAlign = 'center'; c.font = `700 30px ${SERIF}`; c.fillText(['LOAN AGREEMENT', 'DEMAND NOTE', 'LOAN AGREEMENT'][i % 3], 0, -h / 2 + 80);
  c.font = `italic 26px ${SERIF}`; c.fillText('Borrower: Mrs. C. L. Chadwick', 0, -h / 2 + 130); c.font = `900 54px ${SERIF}`; c.fillText(['$100,000', '$250,000', '$500,000'][i % 3], 0, -h / 2 + 220); for (let k = 0; k < 5; k++) { c.fillStyle = 'rgba(42,32,22,0.4)'; c.fillRect(-w / 2 + 60, -h / 2 + 270 + k * 34, w - 120 - (k % 2) * 90, 8); } }
shot(L.c04 - 0.15, (x, g) => { const nb = at('c04', 'Nobody') - 0.1;
  if (g < nb) { table(x); const z = push(g, L.c04, nb, 1, 1.07); x.save(); zoomAt(x, W / 2, 1000, z);
    for (let i = 0; i < 4; i++) { const u = eo((g - L.c04 + 0.2 - i * 0.42) / 0.4); if (u <= 0) continue; paperDoc(x, lerp(-700, 470 + (i % 2) * 120, u), 760 + i * 150, 640, 560, (i % 2 ? 0.08 : -0.07), (c, w, h) => loanDoc(c, w, h, i)); } x.restore();
    headline(x, 'BANKS LENT', null, 230, (g - L.c04 + 0.15) / 0.25); headline(x, '', 'TO "THE DAUGHTER"', 230, (g - at('c04', 'daughter') + 0.05) / 0.3, 960); tag(x, 'RE-CREATED DOCUMENTS · AMOUNTS ILLUSTRATIVE', 70, 1500, (g - L.c04 - 0.4) / 0.6, { size: 24 }); }
  else { darkBg(x, '#1e1610', '#070504'); const z = push(g, nb, E.c04 + 0.3, 1.0, 1.12); x.save(); zoomAt(x, W / 2, 1100, z); const lg = x.createRadialGradient(W / 2, 1100, 50, W / 2, 1100, 700); lg.addColorStop(0, 'rgba(255,210,150,0.25)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = lg; x.fillRect(0, 0, W, H);
    x.fillStyle = '#2a1d14'; x.fillRect(0, 1380, W, 540); x.save(); x.translate(W / 2 - 40, 1380); phone(x, 1.25, g - nb); x.restore(); x.restore();
    headline(x, 'NOBODY ASKED', 'CARNEGIE', 260, (g - nb) / 0.3); stamp(x, 'NO CALL', 760, 1500, 80, 0.12, (g - at('c04', 'Carnegie', 1) - 0.1) / 0.35); }
  dust(x, g); });
// c05 · "25%" (stamped) → counter to ~$2,000,000 with cash bundles stacking; tag ≈ $72M today
shot(L.c05 - 0.15, (x, g) => { table(x); const by = at('c05', 'By') - 0.1;
  if (g < by) { const u = (g - at('c05', '25%') + 0.05) / 0.3; bigNum(x, '25%', 960, u, '#E8B84A', 330); headline(x, 'SOME LOANS AT', null, 300, (g - L.c05) / 0.3, 940); stamp(x, 'INTEREST', 540, 1230, 90, -0.08, u - 0.5); }
  else { const c = clamp((g - by) / (at('c05', '$2') + 0.5 - by)), n = Math.floor(eo(c) * 22);
    for (let i = 0; i < n; i++) cash(x, 300 + (i % 3) * 240 + (Math.floor(i / 3) % 2) * 60, 1360 - Math.floor(i / 3) * 70, 300, (hash(i) - 0.5) * 0.15);
    const val = Math.round(2000000 * eo(c) / 10000) * 10000; bigNum(x, '$' + val.toLocaleString('en-US'), 560, (g - by + 0.1) / 0.2, '#E8B84A', 150); headline(x, 'BY ONE ESTIMATE', null, 300, (g - by + 0.1) / 0.2, 900);
    tag(x, '≈ $72 MILLION TODAY', W / 2, 700, (g - at('c05', 'in') + 0.05) / 0.5, { align: 'center', size: 38 }); }
  dust(x, g); });
// c06 · the Euclid Avenue house (archive postcard), slow pan + push
shot(L.c06 - 0.15, (x, g) => { darkBg(x); const k = ss((g - L.c06 + 0.15) / 3.0), h = 1250, w = h * HOUSE.width / HOUSE.height; x.save(); x.filter = 'grayscale(0.3) sepia(0.5) contrast(1.1) brightness(0.85)'; x.drawImage(HOUSE, lerp(-80, W - w + 60, k), 400, w, h); x.restore();
  shadeTopBottom(x, 0.8); headline(x, 'PLAYING', 'THE HEIRESS', 230, (g - L.c06) / 0.3); tag(x, 'EUCLID AVENUE · CLEVELAND', 70, 1460, (g - at('c06', 'Cleveland') + 0.05) / 0.5, { size: 32 }); credit(x, 'POSTCARD: "CASSIE L. CHADWICK RESIDENCE" (ARCHIVE)', 1530); dust(x, g); });
// c07 · the lawsuit: NEWTON v. CHADWICK, $190,000 — DUE NOW (music turns dark here)
shot(L.c07 - 0.15, (x, g) => { table(x); const u = eo((g - L.c07 + 0.18) / 0.4), z = push(g, L.c07, E.c07 + 0.3, 1, 1.1); x.save(); zoomAt(x, W / 2, 1050, z);
  paperDoc(x, W / 2, lerp(2000, 1060, u), 820, 900, 0.03, c => { c.fillStyle = INK; c.textAlign = 'center'; c.font = `700 30px ${SERIF}`; c.fillText('IN THE CIRCUIT COURT', 0, -360); c.font = `900 50px ${SERIF}`; c.fillText('HERBERT B. NEWTON', 0, -270); c.font = `italic 30px ${SERIF}`; c.fillText('v.', 0, -220);
    c.font = `900 50px ${SERIF}`; c.fillText('CASSIE L. CHADWICK', 0, -160); for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(42,32,22,0.4)'; c.fillRect(-320, -80 + i * 40, 640 - (i % 3) * 90, 9); } }); x.restore();
  bigNum(x, '$190,000', 400, (g - at('c07', '$190') + 0.05) / 0.3, '#E8B84A', 170); headline(x, 'ONE LENDER WANTED', null, 220, (g - L.c07 + 0.15) / 0.25, 940);
  stamp(x, 'DUE NOW', 740, 1300, 110, -0.13, (g - at('c07', 'back') + 0.0) / 0.35); tag(x, 'NOV 1904 · RE-CREATED DOCUMENT', 70, 1520, (g - L.c07 - 0.4) / 0.6, { size: 26 }); dust(x, g); });
// c08 · Carnegie (archive portrait #1) → his office's statement (typed, quoted), stamp 30+ YEARS
shot(L.c08 - 0.15, (x, g) => { const st = at('c08', 'hadn') - 0.1;
  if (g < st) { darkBg(x, '#1c140e', '#060504'); const z = push(g, L.c08, st, 1.0, 1.15); x.save(); zoomAt(x, W / 2, 800, z); photo(x, CAR, W / 2, 900, 1050, -0.02, 1, PF); x.restore(); shadeTopBottom(x, 0.6);
    headline(x, "CARNEGIE'S OFFICE:", null, 220, (g - L.c08) / 0.3, 960); stamp(x, "DOESN'T KNOW HER", 540, 1300, 76, -0.1, (g - at('c08', 'know') + 0.05) / 0.35); tag(x, 'ANDREW CARNEGIE · c. 1913 (ARCHIVE)', 70, 1500, 1, { size: 24 }); }
  else { table(x); const u = eo((g - st) / 0.4), n = Math.floor(clamp((g - st) / 1.6) * 999); const lines = ['Mr. Carnegie does not know', 'Mrs. Chadwick of Cleveland.', '. . .', 'Mr. Carnegie has not signed', 'a note for more than', 'thirty years.'];
    paperDoc(x, W / 2, lerp(1900, 980, u), 860, 760, -0.02, c => { c.fillStyle = INK; c.textAlign = 'center'; c.font = `700 30px ${SERIF}`; c.fillText('STATEMENT · NEW YORK, 1904', 0, -290); c.textAlign = 'left'; c.font = `700 40px ${TW}`; let left = n;
      lines.forEach((s, i) => { const vis = s.slice(0, Math.max(0, Math.min(s.length, left))); left -= s.length; c.fillText(vis, -360, -190 + i * 72); }); });
    headline(x, 'NO NOTE IN', '30+ YEARS', 220, (g - st) / 0.3); tag(x, 'PRESS STATEMENT · RE-CREATED', 70, 1500, 1, { size: 26 }); }
  dust(x, g); });
// c09 · bank run at the Oberlin bank (crowd silhouettes) → CLOSED; in the silence after: the real 1904 headline slams in
shot(L.c09 - 0.15, (x, g) => { const fl = at('c09', 'failed') - 0.08, nw = E.c09 + 0.25;
  if (g < nw) { const sky = x.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#2c2620'); sky.addColorStop(1, '#0b0806'); x.fillStyle = sky; x.fillRect(0, 0, W, H); const z = push(g, L.c09, nw, 1.0, 1.08);
    x.save(); zoomAt(x, W / 2, 1300, z); x.save(); x.translate(W / 2, 1380); x.filter = 'sepia(0.5) brightness(0.75)'; bank(x, 1, clamp((g - fl) / 0.3)); x.restore(); x.filter = 'none';
    for (let i = 0; i < 16; i++) { const kind = ['m', 'w', 'm', 'm'][i % 4], px = 80 + (i * 67) % 960 + Math.sin(g * 3 + i) * (g < fl ? 10 : 2), h = 250 + hash(i) * 50; emigrant(x, px, 1500 + (i % 3) * 30, h, kind, g * (g < fl ? 7 : 0) + i, '#0b0907'); } x.restore();
    shadeTopBottom(x, 0.7); headline(x, 'A BANK RUN', null, 240, (g - L.c09 + 0.15) / 0.25); headline(x, '', 'IT FAILED.', 240, (g - fl) / 0.3); tag(x, 'OBERLIN, OHIO · 1904', 70, 1440, (g - L.c09 - 0.3) / 0.5, { size: 30 }); tag(x, 'ILLUSTRATION', W - 230, 1440, 1, { size: 22 }); }
  else { table(x); const u = back((g - nw) / 0.35), z = push(g, nw, L.c10 + 1.5, 1.0, 1.08), w = 1000 * lerp(1.6, 1, clamp(u)); x.save(); x.translate(W / 2, 880); x.scale(z, z); x.rotate(-0.03);
    x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 50; x.fillStyle = '#e6dcc4'; const h = w * NEWS.height / NEWS.width; x.globalAlpha = clamp(u * 3); x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = 'transparent'; x.filter = 'sepia(0.4) contrast(1.15) brightness(0.92)'; x.drawImage(NEWS, -w / 2, -h / 2, w, h); x.restore();
    tag(x, 'PACIFIC COMMERCIAL ADVERTISER · DEC 8, 1904', 70, 1460, (g - nw - 0.2) / 0.5, { size: 26 }); credit(x, 'LIBRARY OF CONGRESS, CHRONICLING AMERICA (ARCHIVE)', 1530); headline(x, 'ARRESTED', null, 230, (g - nw - 0.1) / 0.3); }
  dust(x, g); });
// c10 · prison bars slide over her portrait, which turns grey — OHIO PENITENTIARY · 1907
shot(L.c10 - 0.1, (x, g) => { darkBg(x, '#151110', '#040303'); const gr = clamp((g - L.c10) / 1.2), z = push(g, L.c10, E.c10 + 0.6, 1.05, 1.15); x.save(); zoomAt(x, W / 2, 800, z);
  photo(x, CAS, W / 2, 860, 1000, 0, 1, `grayscale(1) contrast(1.2) brightness(${lerp(0.85, 0.55, gr)}) sepia(${lerp(0.32, 0, gr)})`, true, [0, 0, CAS.width, CAS.height * 0.86]); x.restore();
  const b = eo((g - L.c10 + 0.1) / 0.5); x.fillStyle = '#0a0908'; for (let i = 0; i < 8; i++) { const bx = 70 + i * 135; x.fillRect(bx - 16, lerp(-1900, 0, b), 32, H); } x.fillRect(0, lerp(-1900, 300, b), W, 30); x.fillRect(0, lerp(-1900, 1380, b), W, 30);
  shadeTopBottom(x, 0.6); headline(x, 'DIED IN PRISON', null, 230, (g - L.c10) / 0.3); tag(x, 'OHIO PENITENTIARY · 1907', W / 2, 1520, (g - L.c10 - 0.2) / 0.5, { align: 'center', size: 34 }); dust(x, g); });
// c11 · Carnegie (portrait #2) "CARNEGIE PAID: $0" → a bank vault spills cash "THE BANKS PAID." → his signature: "FOR HIS NAME"
shot(L.c11 - 0.15, (x, g) => { const bk = at('c11', 'The') - 0.1, nm = at('c11', 'name') - 0.15;
  if (g < bk) { darkBg(x, '#1c140e', '#060504'); const z = push(g, L.c11, bk, 1.0, 1.1); x.save(); zoomAt(x, W / 2, 900, z); photo(x, CAR, W / 2, 900, 950, 0.02, 1, PF); x.restore(); shadeTopBottom(x, 0.5);
    headline(x, 'CARNEGIE PAID', null, 230, (g - L.c11) / 0.3); stamp(x, '$0', 540, 1320, 170, -0.12, (g - at('c11', 'cent') + 0.0) / 0.35); }
  else { table(x); const vu = eo((g - bk) / 0.6), z = push(g, bk, E.c11 + 0.5, 1, 1.06); x.save(); zoomAt(x, W / 2, 900, z);
    x.save(); x.translate(W / 2, 880); x.fillStyle = '#3a3532'; x.beginPath(); x.arc(0, 0, 360, 0, 7); x.fill(); x.fillStyle = '#100d0b'; x.beginPath(); x.arc(0, 0, 320, 0, 7); x.fill();
    x.save(); x.scale(lerp(1, 0.12, vu), 1); x.translate(lerp(0, -2400, vu) * 0, 0); x.fillStyle = '#6b6560'; x.beginPath(); x.arc(0, 0, 315, 0, 7); x.fill(); x.strokeStyle = '#2b2724'; x.lineWidth = 14; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(k + g * 0.5) * 140, Math.sin(k + g * 0.5) * 140); x.stroke(); } x.beginPath(); x.arc(0, 0, 150, 0, 7); x.stroke(); x.restore(); x.restore();
    for (let i = 0; i < 18; i++) { const u = eo(clamp((g - bk - 0.3 - i * 0.04) / 0.6)); if (u <= 0) continue; cash(x, W / 2 + (hash(i) - 0.5) * 300 + (hash(i * 3) - 0.5) * 700 * u, 900 + u * (300 + hash(i * 7) * 280), 260, (hash(i * 5) - 0.5) * 1.2 * u); }
    if (g > nm) { const su = eo((g - nm) / 0.4), sw = 760, sh = sw * SIG.height / SIG.width; x.save(); x.globalAlpha = su; x.fillStyle = 'rgba(239,230,207,0.95)'; x.translate(W / 2, 1240); x.rotate(-0.04); x.fillRect(-sw / 2 - 30, -sh / 2 - 30, sw + 60, sh + 60); x.drawImage(SIG, -sw / 2, -sh / 2, sw, sh); x.restore(); }
    x.restore(); headline(x, 'THE BANKS PAID.', null, 230, (g - bk + 0.05) / 0.2); headline(x, '', '...FOR HIS NAME', 230, (g - nm) / 0.3); }
  dust(x, g); });
// card · back to the frame-0 picture (note + FORGED) + the question (no voice), brighter
shot(CARD0 - 0.1, (x, g) => { hook(x, 4.4, true); x.fillStyle = 'rgba(255,240,215,0.06)'; x.fillRect(0, 0, W, H); stamp(x, 'FORGED', 760, 1180, 120, -0.16, 1);
  const u = (g - CARD0) / 0.35; x.save(); x.globalAlpha = clamp(u * 2) * 0.82; x.fillStyle = '#0d0a08'; x.fillRect(40, 150, 1000, 470); x.restore();
  headline(x, "WHO'S MORE TO BLAME:", null, 280, u, 940); headline(x, '', 'HER...', 280, u - 0.3, 940); headline(x, 'OR THE BANKS', null, 510, u - 0.6, 940); x.save(); x.globalAlpha = clamp(u - 0.6); x.textAlign = 'center'; fit(x, 'THAT NEVER CHECKED?', 70, 940); x.fillStyle = '#E8B84A'; x.shadowColor = 'rgba(0,0,0,0.9)'; x.shadowBlur = 20; x.fillText('THAT NEVER CHECKED?', W / 2, 590); x.restore();
  x.save(); x.globalAlpha = clamp(u - 0.9); const ey = 1500 + Math.sin(g * 5) * 12; x.fillStyle = 'rgba(242,237,228,0.92)'; x.beginPath(); x.arc(W / 2, ey - 60, 115, 0, 7); x.fill(); x.font = '150px Emoji'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👇', W / 2, ey - 50); x.restore(); dust(x, g); });
// ---------- subtitles (word groups, current word highlighted), safe zone y≈1600 ----------
const SUB = []; for (const l of LINES) { const ws = WD[l.id]; let grp = []; ws.forEach((w, k) => { grp.push(w); if (grp.length === 3 || /[.,?!:…"]$/.test(w.w) || k === ws.length - 1) { grp.id = l.id; SUB.push(grp); grp = []; } }); }
function subs(x, g) { const gi = SUB.findIndex(gr => g >= gr[0].a - 0.05 && g <= Math.min(gr[gr.length - 1].b + 0.12, E[gr.id] + 0.05)); if (gi < 0 || g >= CARD0) return; const gr = SUB[gi];
  x.save(); x.font = `900 66px ${F}`; x.textBaseline = 'middle'; const words = gr.map(w => w.w.replace(/["“”]/g, '').replace(/\.+$/, '').replace(/…/g, '').replace(/,$/, ',').toUpperCase()); const sp = 20; let ws = words.map(w => x.measureText(w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  if (tw > 980) { const k = 980 / tw; x.font = `900 ${Math.floor(66 * k)}px ${F}`; ws = words.map(w => x.measureText(w).width); tw = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1); }
  let cx = W / 2 - tw / 2; words.forEach((w, i) => { const cur = g >= gr[i].a - 0.03 && (i === gr.length - 1 || g < gr[i + 1].a - 0.03); x.lineWidth = 12; x.strokeStyle = '#000'; x.lineJoin = 'round'; x.strokeText(w, cx, 1600); x.fillStyle = cur ? '#E8B84A' : '#FFFFFF'; x.fillText(w, cx, 1600); cx += ws[i] + sp; }); x.restore(); }
// ---------- frame ----------
const CA = createCanvas(W, H);
function draw(cv, sh, g) { const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; sh.fn(x, g); }
const HITS = [0.0, at('c01', 'dropped'), at('c03', 'daughter'), at('c05', '25%'), at('c07', 'back'), at('c09', 'failed'), E.c09 + 0.25, at('c11', 'cent')];
function frame(ctx, g, noSubs) { let i = SH.findLastIndex(s => g >= s.t0); if (i < 0) i = 0; const sh = SH[i]; draw(CA, sh, g); const lt = g - sh.t0;
  let k = 1, dx = Math.sin(g * 0.8) * 5, dy = Math.cos(g * 0.7) * 4; for (const h of HITS) { const d = g - h - 0.1; if (d >= 0 && d < 0.5) { const e = Math.exp(-d * 8); k += 0.04 * e; dx += Math.sin(d * 80) * 12 * e; dy += Math.cos(d * 70) * 8 * e; } }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(W / 2 + dx, H / 2 + dy); ctx.scale(k * 1.02, k * 1.02); ctx.drawImage(CA, -W / 2, -H / 2); ctx.restore();
  if (i > 0 && lt < 0.18) { ctx.fillStyle = `rgba(255,245,230,${0.1 * (1 - lt / 0.18)})`; ctx.fillRect(0, 0, W, H); }
  vignette(ctx, g >= CARD0 ? 0.45 : 0.65); grain(ctx, g); if (!noSubs) subs(ctx, g); }
module.exports = { T, L, E, WD, CARD0, at, load, note, stamp, tag, fit, grain, vignette, darkBg, table, shadeTopBottom, dust, photo, F, TW, W, H, hook, get CAS() { return CAS; } };
if (require.main === module) (async () => { const [mode, a1, a2] = process.argv.slice(2); if (mode === 'T') return console.log(T);
  if (mode === 'cues') { const cues = { T, lines: LINES.map(l => [l.id, +L[l.id].toFixed(3)]), card: CARD0,
      hits: { forged: 0.0, dropped: at('c01', 'dropped'), never: at('c01', 'never'), pick: L.c02 + 1.0, oneday: at('c02', 'one'), collapse: at('c02', 'collapse'), portrait: L.c03, daughter: at('c03', 'daughter'),
        loans: L.c04, nobody: at('c04', 'Nobody'), noCall: at('c04', 'Carnegie', 1), pct: at('c05', '25%'), by: at('c05', 'By'), count: at('c05', '$2'), house: L.c06, suit: L.c07, due: at('c07', 'back'),
        carnegie: L.c08, know: at('c08', 'know'), statement: at('c08', 'hadn'), run: L.c09, failed: at('c09', 'failed'), news: E.c09 + 0.25, prison: L.c10, zero: at('c11', 'cent'), banks: at('c11', 'The'), name: at('c11', 'name') }, shots: SH.map(s => +s.t0.toFixed(3)) };
    return fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify(cues, null, 1)); }
  if (mode === 'srt') { const ts = v => { const ms = Math.round(v * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
    return fs.writeFileSync(a1, LINES.map((l, i) => `${i + 1}\n${ts(L[l.id])} --> ${ts(E[l.id] + 0.1)}\n${SRTTXT[l.id] || l.text}\n`).join('\n')); }
  await load(); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'shots') return console.log(SH.map(s => s.t0.toFixed(2)).join(' '), 'T', T);
  if (mode === 'carousel') { fs.mkdirSync(path.join(D, 'carousel'), { recursive: true }); a1.split(',').map(Number).forEach((tt, i) => { frame(ctx, tt, true); fs.writeFileSync(path.join(D, 'carousel', `0${i + 1}.png`), cv.toBuffer('image/png')); }); return; }
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(360 * 6, 640 * Math.ceil(ts.length / 6)), c2 = sh.getContext('2d'); ts.forEach((tt, i) => { frame(ctx, tt); c2.drawImage(cv, (i % 6) * 360, Math.floor(i / 6) * 640, 360, 640); c2.fillStyle = '#f33'; c2.font = '22px sans-serif'; c2.fillText(tt.toFixed(1), (i % 6) * 360 + 6, Math.floor(i / 6) * 640 + 24); }); return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < Math.round(T * FPS); f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); await new Promise(r => ff.on('close', r)); } })();
