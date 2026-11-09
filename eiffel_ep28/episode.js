// Episode 28 "The Man Who Sold the Eiffel Tower" (Victor Lustig, 1925) — How It's Run, ADULT DOCUMENTARY style (A/B test vs the cartoon style):
// archive photos (Library of Congress 1927 stereograph; 1935 newspaper photo), dark grade, film grain, red rubber stamps, typewriter tags,
// re-created documents labelled RE-CREATED, counters, push-ins and punch-ins on hits. 1080x1920, 30 fps. Voice: Chris (vo/, word timings in *.align.json).
// node episode.js cues | srt out.srt | still t1,t2,… out.png | frame t out.png | video out.mp4 | T
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas'); const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Emoji');
const D = __dirname, W = 1080, H = 1920, FPS = 30;
const F = '"Inter Display", Inter, sans-serif', TW = '"DejaVu Sans Mono", monospace', SERIF = '"DejaVu Serif", serif';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, eo = u => 1 - Math.pow(1 - clamp(u), 3);
const back = u => { u = clamp(u); if (u <= 0) return 0; if (u >= 1) return 1; const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// ---------- timeline from the voice ----------
const LINES = JSON.parse(fs.readFileSync(path.join(D, 'script.json'))), SPEECH = JSON.parse(fs.readFileSync(path.join(D, 'vo/speech.json')));
const START = 0.25, GAP = { e01: 0.3, e02: 0.35, e03: 0.3, e04: 0.3, e05: 0.35, e06: 0.3, e07: 0.3, e08: 0.3, e09: 0.35 }, CARD = 2.6;
const L = {}, E = {}, WD = {}; let t = START;
for (const l of LINES) { const a = JSON.parse(fs.readFileSync(path.join(D, `vo/${l.id}.align.json`))), [s0, s1] = SPEECH[l.id]; L[l.id] = t - s0; E[l.id] = L[l.id] + s1;
  const ws = []; let cur = null; a.characters.forEach((ch, i) => { if (/\s/.test(ch)) { if (cur) { ws.push(cur); cur = null; } return; } if (!cur) cur = { w: '', a: a.character_start_times_seconds[i] }; cur.w += ch; cur.b = a.character_end_times_seconds[i]; }); if (cur) ws.push(cur);
  WD[l.id] = ws.map(x => ({ w: x.w, a: L[l.id] + x.a, b: L[l.id] + x.b })); t = E[l.id] + (GAP[l.id] ?? 0.3); }
const CARD0 = E.e10 + 0.45, T = +(CARD0 + CARD).toFixed(2);
const at = (id, w, n = 0) => { const h = WD[id].filter(x => x.w.toLowerCase().replace(/[^a-z0-9$]/g, '').startsWith(w.toLowerCase())); if (!h[n]) throw new Error(`no ${w} in ${id}`); return h[n].a; };
// ---------- assets ----------
let TOWER, LUSTIG, TOWERH;
async function load() { const st = await loadImage(path.join(D, 'archive/tower_1927_loc.jpg')); LUSTIG = await loadImage(path.join(D, 'archive/Victor_Lustig.jpg'));
  const hw = st.width / 2; TOWERH = createCanvas(hw - 50, st.height - 20); TOWERH.getContext('2d').drawImage(st, 25, 10, hw - 50, st.height - 20, 0, 0, hw - 50, st.height - 20); }
const GR = (() => { const c = createCanvas(540, 540), x = c.getContext('2d'), d = x.createImageData(540, 540); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; })();
function grain(x, g, a = 0.09) { x.save(); x.globalAlpha = a; x.globalCompositeOperation = 'overlay'; const ox = Math.floor(hash(Math.floor(g * 24)) * 540), oy = Math.floor(hash(Math.floor(g * 24) + 7) * 540); for (let yy = -oy; yy < H; yy += 540) for (let xx = -ox; xx < W; xx += 540) x.drawImage(GR, xx, yy); x.restore();
  if (hash(Math.floor(g * 24) * 3.1) > 0.82) { x.save(); x.globalAlpha = 0.25; x.fillStyle = '#ddd'; x.fillRect(hash(Math.floor(g * 24)) * W, 0, 2, H); x.restore(); } }
function vignette(x, a = 0.65) { const g = x.createRadialGradient(W / 2, H * 0.45, H * 0.22, W / 2, H * 0.45, H * 0.78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); x.fillStyle = g; x.fillRect(0, 0, W, H); }
function dust(x, g, n = 40) { x.save(); for (let i = 0; i < n; i++) { const h = hash(i * 3.7), px = (h * W + g * 14 * (0.4 + h)) % W, py = (hash(i * 9.1) * H - g * 9 * (0.3 + h) + H * 10) % H; x.fillStyle = `rgba(240,225,200,${0.15 + 0.3 * h})`; x.beginPath(); x.arc(px, py, 1 + h * 2.2, 0, 7); x.fill(); } x.restore(); }
const BW = 'grayscale(1) contrast(1.3) brightness(0.78) sepia(0.28)';
function towerPhoto(x, z, dx = 0, dy = 0, filter = BW) { const h = 2350 * z, w = h * TOWERH.width / TOWERH.height; x.save(); x.filter = filter; x.drawImage(TOWERH, W / 2 - w * 0.47 + dx, 1040 - h * 0.52 + dy, w, h); x.restore(); }
function darkBg(x, top = '#1c1510', bot = '#080605') { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, W, H); }
function shadeTopBottom(x, a = 0.85) { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(10,8,6,${a})`); g.addColorStop(0.3, 'rgba(10,8,6,0.05)'); g.addColorStop(0.72, 'rgba(10,8,6,0.15)'); g.addColorStop(1, `rgba(10,8,6,${a})`); x.fillStyle = g; x.fillRect(0, 0, W, H); }
function stamp(x, s, cx, cy, size, rot, u) { if (u <= 0) return; const k = lerp(2.2, 1, back(u / 1)); x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(k, k); x.globalAlpha = clamp(u * 3) * 0.93; x.font = `900 ${size}px ${F}`; x.textAlign = 'center'; x.textBaseline = 'middle';
  const w = x.measureText(s).width + size * 0.6; x.strokeStyle = '#D42A1D'; x.lineWidth = size * 0.1; x.strokeRect(-w / 2, -size * 0.72, w, size * 1.44); x.fillStyle = '#D42A1D'; x.fillText(s, 0, size * 0.05);
  x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(0,0,0,${0.5 * hash(i)})`; x.fillRect((hash(i * 3) - 0.5) * w, (hash(i * 7) - 0.5) * size * 1.4, 4 + hash(i) * 10, 3); } x.restore(); }
function fit(x, s, size, maxW, font = F, weight = 900) { let z = size; x.font = `${weight} ${z}px ${font}`; while (x.measureText(s).width > maxW && z > 20) { z -= 2; x.font = `${weight} ${z}px ${font}`; } return z; }
function headline(x, a, b, y, u = 1) { if (u <= 0) return; x.save(); x.globalAlpha = clamp(u * 2); x.textAlign = 'center'; x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 24; const dy = (1 - eo(u)) * 40;
  fit(x, a, 100, 960); x.fillStyle = '#F2EDE4'; x.fillText(a, W / 2, y + dy); if (b) { fit(x, b, 100, 960); x.fillStyle = '#E8B84A'; x.fillText(b, W / 2, y + 112 + dy); } x.restore(); }
function tag(x, s, X, Y, u = 1, o = {}) { if (u <= 0) return; x.save(); x.globalAlpha = clamp(u * 2); const n = Math.floor(clamp(u * 1.6) * s.length), vis = s.slice(0, n); const z = fit(x, s, o.size || 34, o.maxW || 940, TW, 700); const w = x.measureText(s).width;
  const X0 = o.align === 'center' ? X - w / 2 - 16 : X; x.fillStyle = o.bg || 'rgba(242,237,228,0.93)'; x.fillRect(X0, Y - z * 0.9, w + 32, z * 1.6); x.fillStyle = o.col || '#171717'; x.textAlign = 'left'; x.fillText(vis, X0 + 16, Y + z * 0.2); x.restore(); }
function bigNum(x, s, y, u, col = '#E8B84A') { if (u <= 0) return; x.save(); x.globalAlpha = clamp(u * 2); x.textAlign = 'center'; x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 30; fit(x, s, 150, 980); x.fillStyle = col; x.fillText(s, W / 2, y); x.restore(); }
function paperDoc(x, cx, cy, w, h, rot, draw) { x.save(); x.translate(cx, cy); x.rotate(rot); x.shadowColor = 'rgba(0,0,0,0.75)'; x.shadowBlur = 60; x.shadowOffsetY = 20; x.fillStyle = '#EDE3CB'; x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = 'transparent';
  const g = x.createRadialGradient(0, 0, w * 0.2, 0, 0, w * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(90,60,20,0.35)'); x.fillStyle = g; x.fillRect(-w / 2, -h / 2, w, h); draw(x); x.restore(); }
function letter(x, name, hl) { x.fillStyle = '#2a2016'; x.textAlign = 'center'; x.font = `700 40px ${SERIF}`; x.fillText('RÉPUBLIQUE FRANÇAISE', 0, -400); x.font = `italic 28px ${SERIF}`; x.fillText('Ministère des Postes et Télégraphes', 0, -352);
  x.textAlign = 'left'; x.font = `26px ${SERIF}`; x.fillText(`À l'attention de ${name}`, -300, -280); for (let i = 0; i < 11; i++) { x.fillStyle = i === hl ? 'rgba(212,42,29,0.35)' : 'rgba(42,32,22,0.45)'; x.fillRect(-300, -220 + i * 46, 600 - (i % 3) * 90, 10); } }
function lustigPrint(x, cx, cy, h, rot, a = 1) { const w = h * LUSTIG.width / LUSTIG.height; x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(rot); x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 50; x.fillStyle = '#F2ECDF'; x.fillRect(-w / 2 - 22, -h / 2 - 22, w + 44, h + 90); x.shadowColor = 'transparent';
  x.filter = 'grayscale(1) contrast(1.15) brightness(0.92)'; x.drawImage(LUSTIG, -w / 2, -h / 2, w, h); x.restore(); }
function silhouette(x, px, py, s, lit) { x.save(); x.translate(px, py); x.scale(s, s); x.fillStyle = lit ? '#C9A35A' : '#0a0806'; x.beginPath(); x.arc(0, -250, 42, 0, 7); x.fill(); x.fillRect(-46, -300, 92, 14); x.fillRect(-28, -326, 56, 30);
  x.beginPath(); x.moveTo(-70, -200); x.lineTo(70, -200); x.lineTo(84, 60); x.lineTo(-84, 60); x.closePath(); x.fill(); x.restore(); }
function bill(x, cx, cy, rot, s = 1) { x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s, s); x.fillStyle = '#C9D3B8'; x.fillRect(-150, -66, 300, 132); x.strokeStyle = '#3A5A3A'; x.lineWidth = 6; x.strokeRect(-138, -54, 276, 108);
  x.fillStyle = '#3A5A3A'; x.font = `900 44px ${SERIF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('100', -92, -16); x.fillText('100', 92, 20); x.beginPath(); x.ellipse(0, 0, 34, 42, 0, 0, 7); x.stroke(); x.restore(); }
// ---------- shots ----------
const SH = [];
const shot = (t0, fn, tr = 'cut') => SH.push({ t0, fn, tr });
const push = (g, t0, t1, z0 = 1.0, z1 = 1.08) => lerp(z0, z1, ss((g - t0) / Math.max(0.5, t1 - t0)));
// 0 · hook: the tower, SOLD stamp, headline — moving at t = 0
shot(0, (x, g) => { darkBg(x); const z = push(g, 0, L.e02, 1.0, 1.12); towerPhoto(x, z, 0, (z - 1) * 260); shadeTopBottom(x); dust(x, g);
  headline(x, 'HE SOLD THE', 'EIFFEL TOWER', 330, 0.55 + g * 2); stamp(x, 'SOLD', 560, 980, 150, -0.18, (g + 0.25) / 0.4); tag(x, 'PARIS · 1925', 70, 1420, 1);
  x.save(); x.font = `600 22px ${F}`; x.fillStyle = 'rgba(242,237,228,0.7)'; x.textAlign = 'right'; x.fillText('PHOTO: LIBRARY OF CONGRESS, 1927', W - 50, 1480); x.restore(); });
// e02 · the agent's memoir → Lustig's real newspaper photo
shot(L.e02 - 0.15, (x, g) => { darkBg(x, '#211812', '#0a0705'); const u = eo((g - L.e02 + 0.15) / 0.5), z = push(g, L.e02, E.e02 + 2, 1, 1.06);
  x.save(); x.translate(W / 2, 820); x.scale(z, z); x.translate(-W / 2, -820); lustigPrint(x, lerp(1400, W / 2, u), 800, 640, lerp(0.2, 0.03, u)); x.restore();
  tag(x, 'VICTOR LUSTIG (CENTER) · NEWSPAPER, 1935', W / 2, 1280, (g - L.e02) / 0.6, { align: 'center', size: 30 });
  headline(x, 'THE STORY COMES FROM', 'THE AGENT WHO CAUGHT HIM', 250, (g - at('e02', 'agent') + 0.1) / 0.3);
  tag(x, 'J. F. JOHNSON (EX-SECRET SERVICE) · MEMOIR, 1961', W / 2, 1420, (g - at('e02', 'agent')) / 0.6, { align: 'center', size: 26 }); dust(x, g); });
// e03 · the forged letter: rusting → scrapped → CONFIDENTIAL (rust creeps over a tower inset)
shot(L.e03 - 0.15, (x, g) => { darkBg(x); const z = push(g, L.e03, E.e03, 1, 1.08); x.save(); x.translate(W / 2, 900); x.scale(z, z); x.translate(-W / 2, -900);
  paperDoc(x, W / 2, 900, 760, 1000, -0.04, c => letter(c, 'M. le Ferrailleur', Math.floor(clamp((g - L.e03) / 3) * 6)));
  x.save(); x.translate(820, 560); x.rotate(0.12); x.fillStyle = '#F2ECDF'; x.fillRect(-120, -170, 240, 340); x.save(); x.beginPath(); x.rect(-104, -154, 208, 290); x.clip(); x.filter = BW; const iw = 208, ih = iw * TOWERH.height / TOWERH.width; x.drawImage(TOWERH, -104, -154, iw, ih); x.restore();
  const r = clamp((g - at('e03', 'rusting')) / 1.2); x.save(); x.beginPath(); x.rect(-104, -154, 208, 290); x.clip(); for (let i = 0; i < 160 * r; i++) { x.fillStyle = `rgba(${150 + hash(i) * 50},${60 + hash(i * 2) * 30},20,${0.5 + 0.4 * hash(i * 3)})`; x.beginPath(); x.arc(-104 + hash(i * 5) * 208, 136 - hash(i * 7) * 290 * r, 4 + hash(i) * 12, 0, 7); x.fill(); } x.restore(); x.restore();
  x.restore(); stamp(x, 'CONFIDENTIAL', 540, 700, 86, -0.12, (g - at('e03', 'Secretly')) / 0.35);
  headline(x, 'THE TOWER IS RUSTING.', '7,000 TONS OF SCRAP.', 230, (g - at('e03', 'rusting') + 0.1) / 0.3); tag(x, 'RE-CREATED LETTER', 70, 1440, 1, { size: 28 }); dust(x, g); });
// e04 · the luxury hotel: dealers in silhouette, one lights up
shot(L.e04 - 0.15, (x, g) => { darkBg(x, '#4a3420', '#140d08'); for (let i = 0; i < 9; i++) { const gx = 120 + i * 110; x.fillStyle = `rgba(255,200,120,${0.06 + 0.03 * Math.sin(g * 2 + i)})`; x.beginPath(); x.arc(gx, 300, 50, 0, 7); x.fill(); }
  x.fillStyle = '#3a2a1a'; x.fillRect(0, 1180, W, 40); const lit = (g - at('e04', 'One') + 0.05) / 0.3, z = push(g, L.e04, E.e04 + 1, 1, 1.12);
  x.save(); x.translate(W / 2, 1100); x.scale(z, z); x.translate(-W / 2, -1100); for (let i = 0; i < 5; i++) silhouette(x, 160 + i * 190, 1170, 1.15 + (i === 2 ? 0.1 : 0), i === 2 && lit > 0); x.restore();
  if (lit > 0) { const gl = x.createRadialGradient(W / 2, 900, 0, W / 2, 900, 420); gl.addColorStop(0, `rgba(255,200,110,${0.35 * clamp(lit)})`); gl.addColorStop(1, 'rgba(255,200,110,0)'); x.fillStyle = gl; x.fillRect(0, 0, W, H); }
  headline(x, 'A LUXURY HOTEL.', 'ONE DEALER BIT.', 260, (g - L.e04) / 0.35); tag(x, 'HÔTEL DE CRILLON · STANDARD VERSION', 70, 1440, (g - L.e04 - 0.3) / 0.6, { size: 28 }); dust(x, g); });
// e05 · the bribe: envelope slides, counter to $70,000
shot(L.e05 - 0.15, (x, g) => { darkBg(x, '#1e150e', '#080605'); x.fillStyle = '#2e2216'; x.fillRect(0, 1000, W, 900); const u = eo((g - L.e05) / 0.7);
  x.save(); x.translate(lerp(-300, W / 2, u), 1150); x.rotate(-0.08); x.shadowColor = 'rgba(0,0,0,0.7)'; x.shadowBlur = 40; x.fillStyle = '#D9C49A'; x.fillRect(-260, -150, 520, 300); x.shadowColor = 'transparent'; x.strokeStyle = '#8a7046'; x.lineWidth = 4; x.beginPath(); x.moveTo(-260, -150); x.lineTo(0, 30); x.lineTo(260, -150); x.stroke(); x.restore();
  const c = clamp((g - at('e05', 'seventy') + 0.1) / 1.0), val = Math.round(70000 * eo(c) / 100) * 100; bigNum(x, '$' + val.toLocaleString('en-US'), 560, (g - at('e05', 'seventy') + 0.2) / 0.3);
  tag(x, 'BY ONE ACCOUNT · AMOUNT DISPUTED', W / 2, 660, (g - at('e05', 'One') ) / 0.6, { align: 'center', size: 30 }); headline(x, 'A BRIBE, TOO.', null, 260, (g - L.e05) / 0.3); dust(x, g); });
// e06 · silence → he comes back, same letter, new name, AGAIN
shot(L.e06 - 0.15, (x, g) => { darkBg(x); const z = push(g, L.e06, E.e06, 1.05, 1.15); x.save(); x.translate(W / 2, 950); x.scale(z, z); x.translate(-W / 2, -950);
  paperDoc(x, W / 2, 950, 760, 1000, 0.03, c => letter(c, g > at('e06', 'So') ? 'M. le Second Acheteur' : 'M. le Ferrailleur', -1)); x.restore();
  headline(x, 'THE BUYER STAYED QUIET.', null, 260, (g - L.e06) / 0.3); stamp(x, 'AGAIN', 560, 1000, 140, -0.16, (g - at('e06', 'again') + 0.05) / 0.35); tag(x, 'RE-CREATED LETTER', 70, 1440, 1, { size: 28 }); dust(x, g); });
// e07 · reported → he flees to America (ship across a dark sea)
shot(L.e07 - 0.15, (x, g) => { const fled = g > at('e07', 'He') - 0.15; darkBg(x, fled ? '#101822' : '#140d0a', '#05070a');
  if (!fled) { x.fillStyle = '#2a1d14'; x.fillRect(300, 560, 480, 880); x.fillStyle = '#1a120c'; x.fillRect(340, 610, 400, 800); x.fillStyle = '#C9A35A'; x.beginPath(); x.arc(700, 1020, 16, 0, 7); x.fill();
    x.save(); x.font = `900 66px ${F}`; x.fillStyle = '#E8DCC0'; x.textAlign = 'center'; x.fillText('POLICE', 540, 530); x.restore(); headline(x, 'SOMEONE TOLD', 'THE POLICE.', 220, (g - at('e07', 'someone') + 0.1) / 0.3); }
  else { x.fillStyle = '#0c1620'; x.fillRect(0, 1150, W, 800); x.strokeStyle = 'rgba(200,220,240,0.12)'; for (let i = 0; i < 14; i++) { x.beginPath(); x.moveTo(((i * 137 + g * 60) % 1300) - 100, 1180 + i * 40); x.lineTo(((i * 137 + g * 60) % 1300) + 20, 1180 + i * 40); x.stroke(); }
    const sx = lerp(180, 780, ss((g - at('e07', 'He') + 0.15) / 2.4)); x.fillStyle = '#05070a'; x.beginPath(); x.moveTo(sx - 220, 1120); x.lineTo(sx + 240, 1120); x.lineTo(sx + 180, 1180); x.lineTo(sx - 180, 1180); x.fill(); x.fillRect(sx - 80, 1050, 160, 70); x.fillRect(sx - 30, 980, 40, 70);
    for (let k = 0; k < 5; k++) { x.fillStyle = `rgba(160,170,180,${0.25 - k * 0.04})`; x.beginPath(); x.arc(sx - 10 - k * 40, 960 - k * 30, 20 + k * 10, 0, 7); x.fill(); }
    headline(x, 'HE FLED', 'TO AMERICA.', 260, (g - at('e07', 'He')) / 0.3); tag(x, 'ATTEMPT #2: REPORTED', 70, 1440, 1, { size: 30 }); }
  dust(x, g); });
// e08 · fake $100 bills pour
shot(L.e08 - 0.15, (x, g) => { darkBg(x, '#121810', '#050705'); const n = clamp((g - L.e08) / 1.8) * 30; for (let i = 0; i < n; i++) { const fall = clamp((g - L.e08 - i * 0.06) / 0.6); bill(x, 140 + hash(i) * 800, lerp(-200, 520 + hash(i * 3) * 620, eo(fall)), (hash(i * 5) - 0.5) * 1.4, 1.1); }
  headline(x, 'FAKE $100 BILLS', null, 260, (g - L.e08) / 0.3);
  tag(x, '"ISSUING MONEY IN RIVALRY WITH THE U.S. TREASURY"', W / 2, 1300, (g - L.e08 - 0.5) / 0.8, { align: 'center', size: 26 }); tag(x, '— A JUDGE ON LUSTIG', W / 2, 1380, (g - L.e08 - 0.9) / 0.6, { align: 'center', size: 24 }); });
// e09 · bedsheet rope → Alcatraz
shot(L.e09 - 0.15, (x, g) => { const alc = g > at('e09', 'still') - 0.15;
  if (!alc) { darkBg(x, '#1a1612', '#080605'); x.fillStyle = '#4a4036'; x.fillRect(0, 0, W, H); for (let r = 0; r < 40; r++) for (let c = 0; c < 8; c++) { x.strokeStyle = 'rgba(20,15,10,0.35)'; x.strokeRect(c * 140 + (r % 2) * 70 - 70, r * 50, 140, 50); }
    x.fillStyle = '#0c0a08'; x.fillRect(560, 300, 260, 340); x.strokeStyle = '#2a2420'; x.lineWidth = 10; for (let k = 0; k < 5; k++) { x.beginPath(); x.moveTo(590 + k * 52, 300); x.lineTo(590 + k * 52, 640); x.stroke(); }
    const len = clamp((g - L.e09) / 1.4) * 1100; x.strokeStyle = '#E8E0CC'; x.lineWidth = 22; x.beginPath(); x.moveTo(690, 640); for (let y = 0; y <= len; y += 20) x.lineTo(690 + Math.sin(y * 0.02 + g * 3) * 14, 640 + y); x.stroke();
    for (let y = 120; y < len; y += 160) { x.fillStyle = '#E8E0CC'; x.beginPath(); x.ellipse(690 + Math.sin(y * 0.02 + g * 3) * 14, 640 + y, 30, 18, 0, 0, 7); x.fill(); }
    tag(x, 'SEPT 1935 · THE DAY BEFORE HIS TRIAL', 70, 1440, (g - L.e09) / 0.6, { size: 28 }); headline(x, 'A BEDSHEET ROPE', null, 220, (g - L.e09) / 0.3); }
  else { darkBg(x, '#18202a', '#06080a'); x.fillStyle = '#0a0e12'; x.fillRect(0, 1100, W, 820); x.fillStyle = '#05070a'; x.beginPath(); x.moveTo(80, 1110); x.lineTo(240, 880); x.lineTo(820, 860); x.lineTo(1000, 1110); x.fill(); x.fillRect(360, 700, 380, 180); x.fillRect(560, 560, 40, 150);
    const sw = (g * 0.6) % 1; x.save(); x.globalCompositeOperation = 'lighter'; const bx = 580, by = 580, ang = lerp(-0.9, 0.9, Math.abs(sw * 2 - 1)); x.fillStyle = 'rgba(255,240,200,0.08)'; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + Math.cos(ang) * 1400, by + Math.sin(ang) * 700 - 300); x.lineTo(bx + Math.cos(ang + 0.15) * 1400, by + Math.sin(ang + 0.15) * 700 - 300); x.fill(); x.restore();
    headline(x, 'ALCATRAZ', null, 260, (g - at('e09', 'still') + 0.15) / 0.3); tag(x, 'PRISONER #300 · 1936', W / 2, 1440, (g - at('e09', 'Alcatraz')) / 0.6, { align: 'center', size: 30 }); }
  dust(x, g); });
// e10 · the death certificate: APPRENTICE SALESMAN (Lustig photo dim behind)
shot(L.e10 - 0.15, (x, g) => { darkBg(x); lustigPrint(x, W / 2, 640, 520, -0.05, 0.35);
  paperDoc(x, W / 2, 1060, 860, 520, 0.02, c => { c.fillStyle = '#2a2016'; c.textAlign = 'center'; c.font = `700 34px ${SERIF}`; c.fillText('CERTIFICATE OF DEATH', 0, -190); c.textAlign = 'left'; c.font = `26px ${TW}`;
    [['NAME', 'VICTOR LUSTIG'], ['DATE', 'MARCH 11, 1947'], ['PLACE', 'SPRINGFIELD, MISSOURI'], ['OCCUPATION', '']].forEach(([a, b], i) => { c.fillText(a + ':', -380, -110 + i * 62); c.fillText(b, -120, -110 + i * 62); c.fillStyle = 'rgba(42,32,22,0.4)'; c.fillRect(-130, -100 + i * 62, 500, 2); c.fillStyle = '#2a2016'; }); });
  stamp(x, 'APPRENTICE SALESMAN', 560, 1170, 66, -0.06, (g - at('e10', 'apprentice') + 0.05) / 0.35); tag(x, 'RE-CREATED DOCUMENT', 70, 1440, 1, { size: 28 }); headline(x, 'HIS JOB, OFFICIALLY:', null, 260, (g - at('e10', 'job')) / 0.3); dust(x, g); });
// card · back to the frame-0 picture + the question (no voice)
shot(CARD0 - 0.1, (x, g) => { darkBg(x); towerPhoto(x, 1.12, 0, 31); shadeTopBottom(x, 0.9); x.fillStyle = 'rgba(8,6,5,0.45)'; x.fillRect(0, 0, W, H); stamp(x, 'SOLD', 560, 980, 150, -0.18, 1);
  const u = (g - CARD0) / 0.35; headline(x, 'GENIUS CON MAN...', 'OR JUST A LIAR?', 380, u); x.save(); x.globalAlpha = clamp(u); x.font = '120px Emoji'; x.textAlign = 'center'; x.fillText('👇', W / 2, 1360 + Math.sin(g * 5) * 12); x.restore(); dust(x, g); });
// ---------- subtitles (word groups, current word highlighted), safe zone y≈1590 ----------
const SUB = []; for (const l of LINES) { const ws = WD[l.id]; let grp = []; ws.forEach((w, k) => { grp.push(w); if (grp.length === 3 || /[.,?!:…"]$/.test(w.w) || k === ws.length - 1) { SUB.push(grp); grp = []; } }); }
function subs(x, g) { const gi = SUB.findIndex(gr => g >= gr[0].a - 0.05 && g <= gr[gr.length - 1].b + 0.12); if (gi < 0 || g >= CARD0) return; const gr = SUB[gi];
  x.save(); x.font = `900 66px ${F}`; x.textBaseline = 'middle'; const words = gr.map(w => w.w.replace(/[".]/g, '').replace(/…/g, '').toUpperCase()); const sp = 20, ws = words.map(w => x.measureText(w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let cx = W / 2 - tw / 2; words.forEach((w, i) => { const cur = g >= gr[i].a - 0.03 && (i === gr.length - 1 || g < gr[i + 1].a - 0.03); x.lineWidth = 12; x.strokeStyle = '#000'; x.lineJoin = 'round'; x.strokeText(w, cx, 1600); x.fillStyle = cur ? '#E8B84A' : '#FFFFFF'; x.fillText(w, cx, 1600); cx += ws[i] + sp; }); x.restore(); }
// ---------- frame ----------
const CA = createCanvas(W, H), CB = createCanvas(W, H);
function draw(cv, sh, g) { const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; sh.fn(x, g); }
const HITS = [0.0, at('e03', 'Secretly'), at('e05', 'seventy'), at('e06', 'again'), at('e07', 'police'), at('e09', 'Alcatraz'), at('e10', 'apprentice')];
function frame(ctx, g, noSubs) { let i = SH.findLastIndex(s => g >= s.t0); if (i < 0) i = 0; const sh = SH[i]; draw(CA, sh, g); const lt = g - sh.t0;
  let k = 1, dx = Math.sin(g * 0.8) * 5, dy = Math.cos(g * 0.7) * 4; for (const h of HITS) { const d = g - h - 0.1; if (d >= 0 && d < 0.5) { const e = Math.exp(-d * 8); k += 0.04 * e; dx += Math.sin(d * 80) * 12 * e; dy += Math.cos(d * 70) * 8 * e; } }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(W / 2 + dx, H / 2 + dy); ctx.scale(k * 1.02, k * 1.02); ctx.drawImage(CA, -W / 2, -H / 2); ctx.restore();
  if (i > 0 && lt < 0.18) { ctx.fillStyle = `rgba(255,245,230,${0.35 * (1 - lt / 0.18)})`; ctx.fillRect(0, 0, W, H); }
  vignette(ctx); grain(ctx, g); if (!noSubs) subs(ctx, g); }
module.exports = { T, L, E, WD, CARD0, at, load, towerPhoto, stamp, tag, fit, grain, vignette, darkBg, shadeTopBottom, dust, F, TW, W, H };
if (require.main === module) (async () => { const [mode, a1, a2] = process.argv.slice(2); if (mode === 'T') return console.log(T);
  if (mode === 'cues') { const cues = { T, lines: LINES.map(l => [l.id, +L[l.id].toFixed(3)]), card: CARD0, hits: { sold: 0.0, confidential: at('e03', 'Secretly'), counter: at('e05', 'seventy'), again: at('e06', 'again'), police: at('e07', 'police'), ship: at('e07', 'He'), bills: L.e08, rope: L.e09, alcatraz: at('e09', 'Alcatraz'), salesman: at('e10', 'apprentice'), letter: L.e03, hotel: L.e04, one: at('e04', 'One'), envelope: L.e05 }, shots: SH.map(s => +s.t0.toFixed(3)) };
    return fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify(cues, null, 1)); }
  if (mode === 'srt') { const ts = v => { const ms = Math.round(v * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
    return fs.writeFileSync(a1, LINES.map((l, i) => `${i + 1}\n${ts(L[l.id])} --> ${ts(E[l.id] + 0.1)}\n${l.text}\n`).join('\n')); }
  await load(); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'carousel') { fs.mkdirSync(path.join(D, 'carousel'), { recursive: true }); a1.split(',').map(Number).forEach((tt, i) => { frame(ctx, tt, true); fs.writeFileSync(path.join(D, 'carousel', `0${i + 1}.png`), cv.toBuffer('image/png')); }); return; }
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(360 * 6, 640 * Math.ceil(ts.length / 6)), c2 = sh.getContext('2d'); ts.forEach((tt, i) => { frame(ctx, tt); c2.drawImage(cv, (i % 6) * 360, Math.floor(i / 6) * 640, 360, 640); c2.fillStyle = '#f33'; c2.font = '22px sans-serif'; c2.fillText(tt.toFixed(1), (i % 6) * 360 + 6, Math.floor(i / 6) * 640 + 24); }); return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < Math.round(T * FPS); f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); await new Promise(r => ff.on('close', r)); } })();
