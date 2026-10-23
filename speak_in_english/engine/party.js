// Noisy neighbours episode renderer: node party.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, noise1, mix, shade, rgba, dark, paint, rr, softShadow, human, catChar, poodle, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/party/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS);
const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
const endOf = id => SP[id].t + SP[id].d;
const TAU = Math.PI * 2;

// ---------------- world layout
const ST = { rocky: 0, jay: 2600, nana: 5200, tony: 7800, margot: 10400 };
const LSTAT = { hook: 'rocky', A1: 'rocky', A2: 'jay', B1: 'nana', B2: 'tony', C1: 'margot', C2: 'rocky', outro: 'rocky' };
const NAMES = { rocky: ['ROCKY', '#E0474C'], jay: ['JAY', '#8E5BD6'], nana: ['NANA', '#C2504A'], tony: ['TONY', '#E27D3C'], margot: ['MARGOT', '#2F3E5C'] };
const FLAT = {
  rocky: { num: '13', door: '#2B2F3A', panel: '#3A3F4B', room: ['#3A1E4A', '#120A1E'], lights: ['#FF4FA0', '#5BC0EB', '#F2C14E'], bpm: 140 },
  jay: { num: '14', door: '#2E9E8E', panel: '#3FB6A8', room: ['#16204A', '#05060E'], lights: ['#7CF29A', '#8E5BD6', '#5BC0EB'], bpm: 126 },
  nana: { num: '15', door: '#B8484A', panel: '#C2504A', room: ['#7A4A52', '#3A2228'], lights: ['#FFD27A', '#FF8FB0', '#FFB060'], bpm: 56 },
  tony: { num: '16', door: '#D9732F', panel: '#E27D3C', room: ['#2E3446', '#10121A'], lights: ['#E0474C', '#F2C14E', '#FFFFFF'], bpm: 150 },
  margot: { num: '17', door: '#2F3E5C', panel: '#3A4A6A', room: ['#5A4630', '#21180E'], lights: ['#F7D58A', '#FFE6B0', '#F2C14E'], bpm: 112 },
};
const OPEN_W = 400, OPEN_H = 1900; // half width, height of doorway
const HERX = 560, HERY = 30, NBX = -40;
const LV = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// ---------------- geometry + natural arm IK (shared pose.js)
const { geom, reach } = require('./pose');
function ik(g, side, tx, ty, bend = 1, fist = false) { return reach(g, side, tx, ty, { fist }); }
const G = {}; for (const k of ['her_party', 'rocky', 'jay', 'nana', 'tony', 'margot']) G[k] = geom(CAST[k]);
const beatOf = (who, t) => Math.pow(0.5 + 0.5 * Math.cos(TAU * t * FLAT[who].bpm / 60), 3);

// ---------------- timeline helpers per level
function lvEv(L) { return (SC[L] && SC[L].ev) || {}; }
function openK(L, t) { if (L === 'outro') return 1; const ev = lvEv(L); if (!ev.open) return 0; return eOut(P(t, ev.open - 0.05, ev.open + 0.45)); }
function musicOn(L, t) {
  if (L === 'hook') return 0.55; if (L === 'outro') return 1;
  const o = openK(L, t); if (o <= 0) return 0.45;
  if (L === 'B2' && t > endOf('b2_x') + 0.1) return 0.0;
  if (L === 'C1' && t > lvEv('C1').wrap + 0.5) return 1 - P(t, lvEv('C1').wrap + 0.5, lvEv('C1').wrap + 1.6);
  if (L === 'C2' && t > endOf('c2_her') - 0.05 && t < SP.c2_nar.t) return 0;
  if (L === 'B1' && t > lvEv('B1').knob + 0.45) return 1.8;
  return 1;
}
function loud(L, t) { return musicOn(L, t) * openK(L, t); }

// ---------------- small drawing helpers
function noteShape(c, x, y, s, col, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 7;
  c.beginPath(); c.ellipse(0, 0, 26, 19, -0.4, 0, TAU); c.fill(); c.beginPath(); c.moveTo(22, -6); c.lineTo(22, -110); c.quadraticCurveTo(60, -90, 58, -50); c.stroke(); c.restore();
}
function frame(c, x, y, w, h, col, inner) { c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x + 8, y + 10, w, h); c.fillStyle = col; c.fillRect(x, y, w, h); c.fillStyle = '#F3EDDF'; c.fillRect(x + 14, y + 14, w - 28, h - 28); if (inner) { c.save(); c.beginPath(); c.rect(x + 18, y + 18, w - 36, h - 36); c.clip(); inner(c, x + 18, y + 18, w - 36, h - 36); c.restore(); } }

// ---------------- corridor background (prerendered, slightly blurred)
const BX0 = -1700, BY0 = -2800, BW = 14000, BH = 3500, BS = 0.5;
function drawCorridor(c) {
  // wallpaper
  const g = c.createLinearGradient(0, -2800, 0, 0); g.addColorStop(0, '#24403F'); g.addColorStop(1, '#335752'); c.fillStyle = g; c.fillRect(BX0, -2800, BW, 2800);
  c.fillStyle = 'rgba(255,240,210,.05)'; for (let x = BX0; x < BX0 + BW; x += 120) c.fillRect(x, -2500, 40, 1800);
  c.fillStyle = 'rgba(255,240,210,.06)'; for (let x = BX0 + 60, i = 0; x < BX0 + BW; x += 120, i++) for (let y = -2400 + (i % 2) * 90; y < -800; y += 180) { c.beginPath(); c.moveTo(x, y - 26); c.quadraticCurveTo(x + 22, y, x, y + 26); c.quadraticCurveTo(x - 22, y, x, y - 26); c.fill(); }
  // ceiling + cornice
  c.fillStyle = '#1A2A2A'; c.fillRect(BX0, -2800, BW, 300); c.fillStyle = '#E8DCC8'; c.fillRect(BX0, -2510, BW, 28); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(BX0, -2482, BW, 14);
  // wainscot
  const wg = c.createLinearGradient(0, -760, 0, 0); wg.addColorStop(0, '#6A4630'); wg.addColorStop(1, '#4A3020'); c.fillStyle = wg; c.fillRect(BX0, -760, BW, 760);
  c.fillStyle = '#E8DCC8'; c.fillRect(BX0, -790, BW, 34); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(BX0, -756, BW, 10);
  c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 320) c.strokeRect(x + 30, -700, 260, 620);
  // floor + carpet runner
  const fg = c.createLinearGradient(0, 0, 0, 700); fg.addColorStop(0, '#5A3E2C'); fg.addColorStop(1, '#3A281C'); c.fillStyle = fg; c.fillRect(BX0, 0, BW, 700);
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 4; for (let y = 0, k = 0; y < 700; y += 40 + k * 14, k++) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
  c.fillStyle = '#8A2E3A'; c.fillRect(BX0, 90, BW, 420); c.fillStyle = '#B8A060'; c.fillRect(BX0, 104, BW, 12); c.fillRect(BX0, 484, BW, 12);
  c.fillStyle = 'rgba(242,193,78,.25)'; for (let x = BX0; x < BX0 + BW; x += 160) { c.beginPath(); c.moveTo(x, 300); c.lineTo(x + 50, 250); c.lineTo(x + 100, 300); c.lineTo(x + 50, 350); c.closePath(); c.fill(); }
  // skirting
  c.fillStyle = '#2E1E14'; c.fillRect(BX0, -40, BW, 40);
  // between-door decor
  const xs = Object.values(ST);
  for (let i = -1; i < xs.length; i++) {
    const a = i < 0 ? xs[0] - 2600 : xs[i], b = i + 1 < xs.length ? xs[i + 1] : xs[i] + 2600; const m = (a + b) / 2;
    // wall sconces
    for (const sx of [m - 650, m + 650]) { const lg = c.createRadialGradient(sx, -1750, 10, sx, -1750, 420); lg.addColorStop(0, 'rgba(255,214,150,.45)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = lg; c.fillRect(sx - 420, -2170, 840, 840); c.fillStyle = '#C9A06A'; c.fillRect(sx - 10, -1700, 20, 70); c.fillStyle = '#FFE6B0'; c.beginPath(); c.moveTo(sx - 55, -1700); c.lineTo(sx + 55, -1700); c.lineTo(sx + 35, -1800); c.lineTo(sx - 35, -1800); c.closePath(); c.fill(); }
    // radiator
    c.fillStyle = '#D8D2C4'; for (let k = 0; k < 9; k++) { rr(c, m - 260 + k * 58, -430, 44, 330, 18); c.fill(); } c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(m - 270, -110, 530, 16);
    // plant
    c.fillStyle = '#C98B5A'; rr(c, m + 360, -330, 160, 230, 20); c.fill(); for (let k = 0; k < 9; k++) { const an = -Math.PI / 2 + (k - 4) * 0.3; c.save(); c.translate(m + 440, -330); c.rotate(an + Math.PI / 2); c.fillStyle = k % 2 ? '#3E7A4A' : '#4E9A5A'; c.beginPath(); c.ellipse(0, -150, 46, 140, 0, 0, TAU); c.fill(); c.restore(); }
  }
  // ceiling lamps
  for (let x = BX0 + 600; x < BX0 + BW; x += 1300) { const lg = c.createRadialGradient(x, -2470, 10, x, -2350, 700); lg.addColorStop(0, 'rgba(255,230,180,.35)'); lg.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = lg; c.fillRect(x - 700, -2500, 1400, 900); c.fillStyle = '#FFF2D0'; c.beginPath(); c.ellipse(x, -2470, 120, 30, 0, 0, TAU); c.fill(); }
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)), bgc = BGS.getContext('2d');
bgc.scale(BS, BS); bgc.translate(-BX0, -BY0); drawCorridor(bgc);
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(3px)'; c.drawImage(BGS, 0, 0); }

// live (sharp) wall items that rattle with the music
function wallLive(c, x0, who, t, L) {
  const shake = loud(L, t) * (LSTAT[L] === who ? 1 : 0); const bt = beatOf(who, t);
  const jig = (k) => (shake > 0 ? (Math.sin(t * 40 + k) * 3 + bt * 4) * Math.min(shake, 2) : 0);
  // framed picture right of the door
  c.save(); c.translate(x0 + 760, -1500); c.rotate(jig(1) * 0.006 + 0.02);
  frame(c, -150, -120, 300, 240, '#C9A06A', (k, x, y, w, h) => { const sg = k.createLinearGradient(0, y, 0, y + h); sg.addColorStop(0, '#9CC8E8'); sg.addColorStop(1, '#F8E0B8'); k.fillStyle = sg; k.fillRect(x, y, w, h); k.fillStyle = '#5E9E6E'; k.beginPath(); k.moveTo(x, y + h); k.lineTo(x + w * 0.35, y + h * 0.45); k.lineTo(x + w * 0.6, y + h * 0.75); k.lineTo(x + w * 0.8, y + h * 0.5); k.lineTo(x + w, y + h); k.fill(); k.fillStyle = '#F2C14E'; k.beginPath(); k.arc(x + w * 0.78, y + h * 0.25, 22, 0, TAU); k.fill(); });
  c.restore();
  // "quiet hours" notice left of the door
  c.save(); c.translate(x0 - 760, -1350); c.rotate(-0.03 + jig(2) * 0.004);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-150 + 8, -110 + 10, 300, 230); c.fillStyle = '#FFFDF8'; c.fillRect(-150, -110, 300, 230);
  c.fillStyle = '#C23C4A'; c.fillRect(-150, -110, 300, 56); c.fillStyle = '#FFFFFF'; c.font = '34px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NOTICE', 0, -82);
  c.fillStyle = '#2B2F3A'; c.font = '30px Unb9'; c.fillText('QUIET HOURS', 0, -10); c.font = '40px Unb9'; c.fillText('23:00–07:00', 0, 48);
  c.fillStyle = '#C9A06A'; c.beginPath(); c.arc(0, -104, 9, 0, TAU); c.fill(); c.restore();
}

// ---------------- rooms (inside the doorway)
function roomBase(c, x0, f, t) {
  const g = c.createLinearGradient(0, -OPEN_H, 0, 0); g.addColorStop(0, f.room[0]); g.addColorStop(1, f.room[1]); c.fillStyle = g; c.fillRect(x0 - OPEN_W, -OPEN_H, OPEN_W * 2, OPEN_H);
  // room floor in perspective
  c.fillStyle = rgba(shade(f.room[1], 1.6), 1); c.beginPath(); c.moveTo(x0 - OPEN_W, -380); c.lineTo(x0 + OPEN_W, -380); c.lineTo(x0 + OPEN_W, 0); c.lineTo(x0 - OPEN_W, 0); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 4; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(x0 + k * 60, -380); c.lineTo(x0 + k * 150, 0); c.stroke(); }
}
function beams(c, x0, f, t, amt, who) {
  if (amt <= 0) return; const bt = beatOf(who, t);
  c.save(); c.globalCompositeOperation = 'lighter';
  f.lights.forEach((col, i) => { const ang = Math.sin(t * (0.9 + i * 0.35) + i * 2) * 0.55 + (i - 1) * 0.35; const ox = x0 + (i - 1) * 330, oy = -OPEN_H + 40;
    c.save(); c.translate(ox, oy); c.rotate(ang); const gr = c.createLinearGradient(0, 0, 0, 1900); gr.addColorStop(0, rgba(col, (0.30 + 0.25 * bt) * amt)); gr.addColorStop(1, rgba(col, 0)); c.fillStyle = gr; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(230, 1900); c.lineTo(-230, 1900); c.closePath(); c.fill(); c.restore(); });
  c.restore();
}
function crowd(c, x0, t, who, amt, n = 6, y = -380, col = '#1A0E24') {
  const bt = beatOf(who, t);
  for (let i = 0; i < n; i++) { const x = x0 - OPEN_W + 60 + i * (OPEN_W * 2 - 120) / (n - 1), hop = (bt * 26 + Math.sin(t * 7 + i) * 6) * amt, s = 0.85 + hash(i * 7) * 0.3;
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y - 250 * s - hop, 62 * s, 120 * s, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x, y - 420 * s - hop, 54 * s, 0, TAU); c.fill();
    if (i % 2 === 0 && amt > 0.2) { c.strokeStyle = col; c.lineWidth = 26 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 30, y - 330 * s - hop); c.lineTo(x + 70 + Math.sin(t * 9 + i) * 20, y - 520 * s - hop); c.stroke(); } }
}
function confettiIn(c, x0, t, amt, seed = 1) {
  if (amt <= 0) return; const cols = ['#FF4FA0', '#F2C14E', '#5BC0EB', '#7CF29A', '#FFFFFF'];
  for (let i = 0; i < 40; i++) { const x = x0 - OPEN_W + hash(i * 3 + seed) * OPEN_W * 2, y = -OPEN_H + ((hash(i * 5 + seed) * OPEN_H + t * (160 + hash(i) * 120)) % OPEN_H); c.save(); c.translate(x + Math.sin(t * 3 + i) * 20, y); c.rotate(t * 4 + i); c.globalAlpha = amt; c.fillStyle = cols[i % 5]; c.fillRect(-9, -5, 18, 10); c.restore(); }
}
function discoBall(c, x, y, t, r = 90) {
  c.strokeStyle = '#9AA3B2'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, -OPEN_H); c.lineTo(x, y - r); c.stroke();
  c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); c.fillStyle = '#B9C2CE'; c.fillRect(x - r, y - r, r * 2, r * 2);
  for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) { const v = hash(i * 13 + j * 7 + Math.floor(t * 6)); c.fillStyle = v > 0.8 ? '#FFFFFF' : v > 0.5 ? '#DDE4EC' : '#8C96A4'; c.fillRect(x + i * r / 5, y + j * r / 5, r / 5 - 3, r / 5 - 3); }
  c.restore();
}
function roomRocky(c, x0, t, L) {
  const f = FLAT.rocky, amt = Math.min(1, musicOn(L, t)); roomBase(c, x0, f, t);
  // posters
  c.save(); c.translate(x0 - 250, -1450); c.rotate(-0.05); c.fillStyle = '#EE5E9A'; c.fillRect(-110, -160, 220, 320); c.fillStyle = '#1A0E24'; c.font = '34px Unb9'; c.textAlign = 'center'; c.fillText('THE', 0, -90); c.font = '30px Unb9'; c.fillText('NEIGH-', 0, -30); c.fillText('BOURS', 0, 10); c.font = '24px Nun9'; c.fillText('LIVE · 1 AM', 0, 80); c.restore();
  c.save(); c.translate(x0 + 250, -1250); c.rotate(0.06); c.fillStyle = '#F2C14E'; c.fillRect(-100, -130, 200, 260); c.fillStyle = '#1A0E24'; c.font = '56px Unb9'; c.textAlign = 'center'; c.fillText('LOUD', 0, -10); c.font = '24px Nun9'; c.fillText('is a lifestyle', 0, 50); c.restore();
  // amp stack
  for (let k = 0; k < 2; k++) { const y = -380 - k * 300; paint(c, q => { q.m(x0 - 390, y - 290); q.l(x0 - 170, y - 290); q.l(x0 - 170, y); q.l(x0 - 390, y); q.z(); }, '#1E2128', { sd: 6, hd: 3, lw: 3, inner: k2 => { k2.fillStyle = '#3A3F4B'; k2.fillRect(x0 - 375, y - 270, 190, 250); k2.strokeStyle = 'rgba(0,0,0,.4)'; k2.lineWidth = 3; for (let i = 0; i < 12; i++) { k2.beginPath(); k2.moveTo(x0 - 375, y - 260 + i * 20); k2.lineTo(x0 - 185, y - 260 + i * 20); k2.stroke(); } k2.fillStyle = '#F2C14E'; k2.font = '26px Unb9'; k2.textAlign = 'center'; k2.fillText('ROCK', x0 - 280, y - 140); } }); }
  discoBall(c, x0 + 160, -1700, t, 80);
  crowd(c, x0, t, 'rocky', amt, 6, -380, '#24102E');
  beams(c, x0, f, t, amt, 'rocky'); confettiIn(c, x0, t, amt * 0.9, 1);
}
function roomJay(c, x0, t, L) {
  const f = FLAT.jay, amt = Math.min(1, musicOn(L, t)); roomBase(c, x0, f, t);
  // neon sign
  c.save(); c.translate(x0, -1580); c.font = '74px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#5BC0EB'; c.shadowBlur = 40 * (0.4 + 0.6 * amt); c.fillStyle = '#BDEBFF'; c.fillText('DROP', 0, -50); c.shadowColor = '#FF4FA0'; c.fillStyle = '#FFC2E0'; c.fillText('THE BEAT', 0, 40); c.restore();
  // lasers
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const a = Math.sin(t * 2 + i) * 0.9 + i * 0.15; c.strokeStyle = rgba(i % 2 ? '#7CF29A' : '#8E5BD6', 0.55 * amt); c.lineWidth = 5; c.beginPath(); c.moveTo(x0 - OPEN_W + 30, -1300); c.lineTo(x0 - OPEN_W + 30 + Math.cos(a) * 1200, -1300 + Math.sin(a) * 900 + 400); c.stroke(); } c.restore();
  // DJ table
  paint(c, q => { q.m(x0 - 330, -760); q.l(x0 + 330, -760); q.l(x0 + 300, -380); q.l(x0 - 300, -380); q.z(); }, '#1E2128', { sd: 8, hd: 4, lw: 3 });
  c.fillStyle = '#2B2F3A'; c.fillRect(x0 - 330, -790, 660, 40);
  for (const s of [-1, 1]) { c.fillStyle = '#10141A'; c.beginPath(); c.ellipse(x0 + s * 190, -790, 110, 26, 0, 0, TAU); c.fill(); c.strokeStyle = '#3A3F4B'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#E0474C'; c.beginPath(); c.ellipse(x0 + s * 190, -790, 30, 8, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#C9CED6'; c.beginPath(); c.moveTo(x0 - 70, -790); c.lineTo(x0 + 70, -790); c.lineTo(x0 + 80, -930); c.lineTo(x0 - 80, -930); c.closePath(); c.fill(); c.fillStyle = rgba('#7CF29A', 0.6 + 0.4 * beatOf('jay', t)); c.fillRect(x0 - 66, -920, 132, 120);
  // LED strip
  for (let i = 0; i < 20; i++) { c.fillStyle = `hsla(${(i * 25 + t * 200) % 360},90%,60%,${0.4 + 0.6 * amt})`; c.fillRect(x0 - OPEN_W + i * 40, -400, 34, 14); }
  crowd(c, x0, t, 'jay', amt, 5, -380, '#0A0F24');
  beams(c, x0, f, t, amt * 0.8, 'jay');
}
function roomNana(c, x0, t, L) {
  const f = FLAT.nana, amt = Math.min(1, musicOn(L, t)); roomBase(c, x0, f, t);
  // wallpaper flowers
  c.fillStyle = 'rgba(255,220,230,.18)'; for (let i = 0; i < 40; i++) { const x = x0 - OPEN_W + hash(i) * OPEN_W * 2, y = -OPEN_H + hash(i * 3) * (OPEN_H - 400); for (let p = 0; p < 5; p++) { c.beginPath(); c.arc(x + Math.cos(p * 1.26) * 14, y + Math.sin(p * 1.26) * 14, 10, 0, TAU); c.fill(); } }
  // photos
  frame(c, x0 - 340, -1650, 170, 210, '#C9A06A', (k, x, y, w, h) => { k.fillStyle = '#E8D0B0'; k.fillRect(x, y, w, h); k.fillStyle = '#8A6A50'; k.beginPath(); k.arc(x + w / 2, y + h * 0.42, 34, 0, TAU); k.fill(); k.fillRect(x + w / 2 - 44, y + h * 0.62, 88, 80); });
  frame(c, x0 - 120, -1720, 150, 150, '#C9A06A', (k, x, y, w, h) => { k.fillStyle = '#F2C14E'; k.fillRect(x, y, w, h); k.fillStyle = '#EBA15E'; k.beginPath(); k.arc(x + w / 2, y + h / 2 + 10, 34, 0, TAU); k.fill(); k.beginPath(); k.moveTo(x + w / 2 - 32, y + h / 2 - 10); k.lineTo(x + w / 2 - 20, y + h / 2 - 50); k.lineTo(x + w / 2 - 6, y + h / 2 - 22); k.fill(); k.beginPath(); k.moveTo(x + w / 2 + 32, y + h / 2 - 10); k.lineTo(x + w / 2 + 20, y + h / 2 - 50); k.lineTo(x + w / 2 + 6, y + h / 2 - 22); k.fill(); });
  // karaoke TV
  paint(c, q => { q.m(x0 - 300, -1250); q.l(x0 + 120, -1250); q.l(x0 + 120, -960); q.l(x0 - 300, -960); q.z(); }, '#2B2F3A', { sd: 6, hd: 3, lw: 3 });
  c.fillStyle = '#3C3A8A'; c.fillRect(x0 - 280, -1232, 380, 254); c.fillStyle = '#FFFFFF'; c.font = '40px Unb9'; c.textAlign = 'center'; c.fillText('KARAOKE', x0 - 90, -1170);
  c.font = '30px Nun9'; const lyr = 'la  la  laaa  ~  la'; c.fillStyle = '#9FE0FF'; c.fillText(lyr, x0 - 90, -1060); const pr = (t * 0.3) % 1; c.save(); c.beginPath(); c.rect(x0 - 240, -1100, 300 * pr, 60); c.clip(); c.fillStyle = '#FFD84A'; c.fillText(lyr, x0 - 90, -1060); c.restore();
  c.fillStyle = '#FF8FB0'; c.beginPath(); c.arc(x0 - 240 + 300 * pr, -1110 - Math.abs(Math.sin(t * 8)) * 26, 12, 0, TAU); c.fill();
  c.fillStyle = '#6A4630'; c.fillRect(x0 - 280, -960, 30, 580); c.fillRect(x0 + 70, -960, 30, 580); c.fillRect(x0 - 300, -700, 420, 26);
  // standing lamp
  c.fillStyle = '#C9A06A'; c.fillRect(x0 + 290, -1300, 14, 920); paint(c, q => { q.m(x0 + 210, -1300); q.l(x0 + 384, -1300); q.l(x0 + 340, -1450); q.l(x0 + 254, -1450); q.z(); }, '#F7B6CF', { sd: 6, hd: 4, lw: 3 });
  c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(x0 + 297, -1300, 10, x0 + 297, -1300, 500); lg.addColorStop(0, 'rgba(255,200,150,.35)'); lg.addColorStop(1, 'rgba(255,200,150,0)'); c.fillStyle = lg; c.fillRect(x0 - OPEN_W, -OPEN_H, OPEN_W * 2, OPEN_H); c.restore();
  beams(c, x0, f, t, amt * 0.45, 'nana');
}
function roomTony(c, x0, t, L) {
  const f = FLAT.tony, amt = Math.min(1, musicOn(L, t)); roomBase(c, x0, f, t);
  // foam panels
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = x0 - 380 + i * 195, y = -1850 + j * 300; c.fillStyle = (i + j) % 2 ? '#3A4058' : '#323850'; c.fillRect(x, y, 185, 290); c.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 6; k++) for (let m = 0; m < 4; m++) { c.beginPath(); c.arc(x + 25 + m * 45, y + 25 + k * 46, 12, 0, TAU); c.fill(); } }
  c.save(); c.translate(x0, -1700); c.fillStyle = '#FFFDF8'; c.fillRect(-170, -50, 340, 100); c.fillStyle = '#C23C4A'; c.font = '32px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SOUNDPROOF*', 0, -8); c.font = '20px Nun9'; c.fillStyle = '#2B2F3A'; c.fillText('*not really', 0, 30); c.restore();
  beams(c, x0, f, t, amt * 0.7, 'tony');
}
function drumKit(c, x0, t, L, front) {
  const play = Math.min(1, musicOn(L, t)); const bt = beatOf('tony', t);
  if (!front) {
    // cymbals + stands behind
    for (const [cx, cy, r, s] of [[x0 - 330, -1000, 110, -1], [x0 + 280, -1180, 140, 1]]) { c.strokeStyle = '#9AA3B2'; c.lineWidth = 8; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + s * 20, -380); c.stroke(); c.save(); c.translate(cx, cy); c.rotate(s * 0.15 + Math.sin(t * 30) * 0.08 * play * bt); paint(c, q => q.e(0, 0, r, r * 0.18), '#E8C25A', { sd: 6, hd: 4, lw: 3 }); c.restore(); }
    // toms on bass drum
    for (const s of [-1, 1]) paint(c, q => q.e(x0 - 215 + s * 95, -700, 75, 56), '#C23C4A', { sd: 8, hd: 5, lw: 3, inner: k => { k.fillStyle = '#F3EDDF'; k.beginPath(); k.ellipse(x0 - 215 + s * 95, -724, 70, 24, 0, 0, TAU); k.fill(); } });
    // bass drum facing us
    const pump = 1 + 0.025 * bt * play; c.save(); c.translate(x0 - 215, -470); c.scale(pump * 0.78, pump * 0.78);
    paint(c, q => q.a(0, 0, 250), '#C23C4A', { sd: 14, hd: 8 }); c.fillStyle = '#F3EDDF'; c.beginPath(); c.arc(0, 0, 210, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.stroke();
    c.fillStyle = '#2B2F3A'; c.font = '86px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TONY', 0, -10); c.font = '30px Nun9'; c.fillText('VERY LOUD DRUMS', 0, 60); c.restore();
  } else {
    // snare in front-left
    paint(c, q => q.e(x0 - 300, -560, 110, 40), '#D8DEE6', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = '#9AA3B2'; c.fillRect(x0 - 305, -540, 10, 160);
  }
}
function roomMargot(c, x0, t, L) {
  const f = FLAT.margot, ev = lvEv('C1'); const dim = L === 'C1' && ev.wrap ? eIO(P(t, ev.wrap + 0.6, ev.wrap + 1.5)) : 0; const amt = Math.min(1, musicOn(L, t));
  roomBase(c, x0, f, t);
  c.fillStyle = 'rgba(242,193,78,.12)'; for (let x = x0 - OPEN_W; x < x0 + OPEN_W; x += 90) c.fillRect(x, -OPEN_H, 36, OPEN_H - 380);
  frame(c, x0 - 330, -1600, 260, 330, '#C9A06A', (k, x, y, w, h) => { k.fillStyle = '#2F3E5C'; k.fillRect(x, y, w, h); k.fillStyle = '#F7F2E8'; k.beginPath(); k.ellipse(x + w / 2, y + h * 0.42, 50, 64, 0, 0, TAU); k.fill(); k.fillStyle = '#C8283E'; k.beginPath(); k.ellipse(x + w / 2, y + h * 0.5, 14, 6, 0, 0, TAU); k.fill(); });
  // chandelier
  c.strokeStyle = '#C9A06A'; c.lineWidth = 5; c.beginPath(); c.moveTo(x0 + 120, -OPEN_H); c.lineTo(x0 + 120, -1700); c.stroke();
  for (let i = -3; i <= 3; i++) { c.strokeStyle = '#C9A06A'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0 + 120, -1700); c.quadraticCurveTo(x0 + 120 + i * 40, -1640, x0 + 120 + i * 55, -1660); c.stroke(); c.fillStyle = dim > 0.5 ? '#8A7A60' : '#FFF2C8'; c.beginPath(); c.arc(x0 + 120 + i * 55, -1675, 14, 0, TAU); c.fill(); }
  if (dim < 1) { c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(x0 + 120, -1660, 10, x0 + 120, -1500, 700); lg.addColorStop(0, `rgba(255,230,170,${0.4 * (1 - dim)})`); lg.addColorStop(1, 'rgba(255,230,170,0)'); c.fillStyle = lg; c.fillRect(x0 - OPEN_W, -OPEN_H, OPEN_W * 2, OPEN_H); c.restore(); }
  // elegant guests (silhouettes with glasses), leaving after wrap
  const leave = L === 'C1' && ev.wrap ? P(t, ev.wrap + 0.4, ev.wrap + 2.4) : 0;
  for (let i = 0; i < 4; i++) { const x = x0 - 300 + i * 200 - leave * (900 + i * 120), y = -380, s = 0.9 + hash(i * 5) * 0.2, sway = Math.sin(t * 2 + i) * 6 * amt;
    c.save(); c.globalAlpha = 1 - clamp(leave * 1.3 - i * 0.1); c.fillStyle = '#2A1C10'; c.beginPath(); c.moveTo(x - 60 * s, y); c.lineTo(x - 80 * s, y - 520 * s); c.quadraticCurveTo(x, y - 600 * s, x + 80 * s, y - 520 * s); c.lineTo(x + 60 * s, y); c.fill(); c.beginPath(); c.arc(x + sway, y - 660 * s, 60 * s, 0, TAU); c.fill();
    c.strokeStyle = '#2A1C10'; c.lineWidth = 20 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 60 * s, y - 480 * s); c.lineTo(x + 110 * s, y - 600 * s); c.stroke(); c.fillStyle = rgba('#F7D58A', 0.8); c.beginPath(); c.moveTo(x + 90 * s, y - 680 * s); c.lineTo(x + 140 * s, y - 680 * s); c.lineTo(x + 115 * s, y - 630 * s); c.fill(); c.restore(); }
  beams(c, x0, f, t, amt * 0.35 * (1 - dim), 'margot');
  if (dim > 0) { c.fillStyle = `rgba(10,8,6,${0.6 * dim})`; c.fillRect(x0 - OPEN_W, -OPEN_H, OPEN_W * 2, OPEN_H); }
}
const ROOMS = { rocky: roomRocky, jay: roomJay, nana: roomNana, tony: roomTony, margot: roomMargot };

// ---------------- door
function door(c, x0, who, k, t, L) {
  const f = FLAT[who];
  // casing
  paint(c, q => { q.m(x0 - OPEN_W - 70, -OPEN_H - 80); q.l(x0 + OPEN_W + 70, -OPEN_H - 80); q.l(x0 + OPEN_W + 70, 0); q.l(x0 - OPEN_W - 70, 0); q.z(); }, '#E8DCC8', { sd: 10, hd: 6 });
  c.fillStyle = '#0C0810'; c.fillRect(x0 - OPEN_W, -OPEN_H, OPEN_W * 2, OPEN_H);
  if (k > 0.01) { c.save(); c.beginPath(); c.rect(x0 - OPEN_W, -OPEN_H, OPEN_W * 2, OPEN_H); c.clip(); ROOMS[who](c, x0, t, L); c.restore(); }
}
function doorLeaf(c, x0, who, k, t, L) {
  const f = FLAT[who]; const thump = (L === 'hook' || (k < 0.05 && LV.includes(L))) ? beatOf(who, t) * 3 : 0;
  const ex = lerp(x0 + OPEN_W, x0 - OPEN_W + 120, k), dy = 70 * k, x1 = x0 - OPEN_W;
  c.save(); c.beginPath(); c.rect(x0 - OPEN_W, -OPEN_H, OPEN_W * 2, OPEN_H); c.clip(); c.translate(thump, 0);
  paint(c, q => { q.m(x1, -OPEN_H); q.l(ex, -OPEN_H + dy); q.l(ex, -dy * 0.6); q.l(x1, 0); q.z(); }, k > 0.05 ? shade(f.door, 0.8) : f.door, { sd: 12, hd: 6, inner: kk => {
    const w = ex - x1; if (w < 40) return;
    kk.strokeStyle = 'rgba(0,0,0,.28)'; kk.lineWidth = 6; for (const [a, b] of [[0.08, 0.46], [0.54, 0.92]]) { kk.beginPath(); kk.moveTo(x1 + w * 0.14, lerp(-OPEN_H, -OPEN_H + dy, 0.14) + OPEN_H * a); kk.lineTo(x1 + w * 0.86, lerp(-OPEN_H, -OPEN_H + dy, 0.86) + OPEN_H * a); kk.lineTo(x1 + w * 0.86, lerp(-OPEN_H, -OPEN_H + dy, 0.86) + OPEN_H * b - lerp(0, dy * 1.6, 0.86) * 0.2); kk.lineTo(x1 + w * 0.14, lerp(-OPEN_H, -OPEN_H + dy, 0.14) + OPEN_H * b); kk.closePath(); kk.stroke(); }
    if (k < 0.3) {
      // number plaque, peephole, handle
      kk.fillStyle = '#C9A06A'; rr(kk, x0 - 70, -1600, 140, 90, 14); kk.fill(); kk.fillStyle = '#2B2F3A'; kk.font = '60px Unb9'; kk.textAlign = 'center'; kk.textBaseline = 'middle'; kk.fillText(f.num, x0, -1552);
      kk.fillStyle = '#C9A06A'; kk.beginPath(); kk.arc(x0, -1380, 16, 0, TAU); kk.fill(); kk.fillStyle = '#1A1014'; kk.beginPath(); kk.arc(x0, -1380, 7, 0, TAU); kk.fill();
      kk.fillStyle = '#E8C25A'; rr(kk, ex - 120, -960, 80, 26, 12); kk.fill(); kk.beginPath(); kk.arc(ex - 80, -947, 26, 0, TAU); kk.fill();
      if (who === 'nana') { for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; kk.fillStyle = i % 2 ? '#5E9E6E' : '#4E8A5A'; kk.beginPath(); kk.ellipse(x0 + Math.cos(a) * 110, -1150 + Math.sin(a) * 110, 34, 20, a, 0, TAU); kk.fill(); } kk.fillStyle = '#E0474C'; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; kk.beginPath(); kk.arc(x0 + Math.cos(a) * 110, -1150 + Math.sin(a) * 110, 16, 0, TAU); kk.fill(); } }
      if (who === 'rocky') { kk.save(); kk.translate(x0 - 120, -1150); kk.rotate(-0.2); kk.fillStyle = '#F2C14E'; kk.fillRect(-90, -40, 180, 80); kk.fillStyle = '#2B2F3A'; kk.font = '30px Unb9'; kk.fillText('ROCK ON', 0, 2); kk.restore(); kk.save(); kk.translate(x0 + 130, -800); kk.rotate(0.15); kk.fillStyle = '#EE5E9A'; kk.beginPath(); kk.arc(0, 0, 60, 0, TAU); kk.fill(); kk.fillStyle = '#FFFFFF'; kk.font = '28px Unb9'; kk.fillText('LOUD', 0, 2); kk.restore(); }
      if (who === 'jay') { kk.save(); kk.translate(x0, -1200); kk.rotate(-0.08); kk.fillStyle = '#FFFFFF'; kk.fillRect(-150, -50, 300, 100); kk.fillStyle = '#7A5BC6'; kk.font = '30px Unb9'; kk.fillText('DJ JAY', 0, -10); kk.font = '22px Nun9'; kk.fillText('do not disturb', 0, 28); kk.restore(); }
      if (who === 'margot') { kk.fillStyle = '#E8C25A'; kk.beginPath(); kk.arc(x0, -1250, 46, 0, TAU); kk.lineWidth = 12; kk.strokeStyle = '#E8C25A'; kk.stroke(); }
      if (who === 'tony') { kk.save(); kk.translate(x0, -1180); kk.rotate(0.05); kk.fillStyle = '#FFFDF8'; kk.fillRect(-160, -60, 320, 120); kk.fillStyle = '#C23C4A'; kk.font = '28px Unb9'; kk.fillText('PRACTICE', 0, -16); kk.fillText('24/7', 0, 26); kk.restore(); }
    }
  } });
  c.restore();
  // light leaking under/around a closed door
  if (k < 0.05) { const bt = beatOf(who, t); c.save(); c.globalCompositeOperation = 'lighter'; const col = f.lights[Math.floor(t * f.bpm / 60) % f.lights.length]; const lg = c.createLinearGradient(0, -10, 0, 180); lg.addColorStop(0, rgba(col, 0.55 + 0.35 * bt)); lg.addColorStop(1, rgba(col, 0)); c.fillStyle = lg; c.beginPath(); c.moveTo(x0 - OPEN_W, -8); c.lineTo(x0 + OPEN_W, -8); c.lineTo(x0 + OPEN_W + 160, 180); c.lineTo(x0 - OPEN_W - 160, 180); c.fill(); c.restore(); }
}
function spill(c, x0, who, t, L) {
  const a = loud(L, t); if (a <= 0.01) return; const f = FLAT[who], bt = beatOf(who, t);
  c.save(); c.globalCompositeOperation = 'lighter';
  const col = f.lights[Math.floor(t * f.bpm / 60) % f.lights.length];
  const g = c.createRadialGradient(x0, 80, 30, x0, 80, 900); g.addColorStop(0, rgba(col, Math.min(0.5, (0.18 + 0.16 * bt) * a))); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.moveTo(x0 - OPEN_W, 0); c.lineTo(x0 + OPEN_W, 0); c.lineTo(x0 + OPEN_W + 700, 600); c.lineTo(x0 - OPEN_W - 700, 600); c.fill();
  c.restore();
}
function notesOut(c, x0, who, t, L) {
  const a = Math.min(2, loud(L, t) + (openK(L, t) < 0.05 && (L === 'hook' || LV.includes(L)) ? 0.6 : 0)); if (a <= 0.05) return;
  const cols = FLAT[who].lights; const closed = openK(L, t) < 0.05;
  for (let i = 0; i < Math.round(5 * a); i++) { const ph = (t * 0.45 + hash(i * 7 + x0) ) % 1; const sx = closed ? x0 + (hash(i * 3) - 0.5) * 700 : x0 + (hash(i * 3) - 0.3) * 600; const sy = closed ? -20 : -1100 + hash(i * 11) * 500;
    const x = sx + ph * (closed ? (hash(i) - 0.5) * 300 : 300 + hash(i) * 400) + Math.sin(t * 4 + i) * 30, y = sy - ph * (closed ? 500 : 700);
    c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * Math.min(1, a); noteShape(c, x, y, 0.9 + hash(i * 5) * 0.6, cols[i % cols.length], Math.sin(t * 3 + i) * 0.3); c.restore(); }
}
function speaker(c, x, t, L) { // Nana's speaker with the volume knob (inside doorway, right)
  const ev = lvEv('B1'); const kn = L === 'B1' && ev.knob ? eIO(P(t, ev.knob, ev.knob + 0.6)) : 0; const ang = lerp(-1.1, 2.3, kn);
  const lv = Math.min(1, musicOn(L, t) / 1.8) * openK(L, t); const bt = beatOf('nana', t); const pump = 1 + (0.02 + 0.07 * (kn > 0.5 ? 1 : 0)) * bt * (lv > 0 ? 1 : 0);
  c.save(); c.translate(x, 0);
  paint(c, q => { q.m(-120, -980); q.l(120, -980); q.l(120, 0); q.l(-120, 0); q.z(); }, '#3A3F4B', { sd: 10, hd: 5 });
  for (const [yy, r] of [[-560, 70], [-260, 100]]) { c.save(); c.translate(0, yy); c.scale(pump, pump); c.fillStyle = '#1E2128'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.fillStyle = '#6A707A'; c.beginPath(); c.arc(0, 0, r * 0.32, 0, TAU); c.fill(); c.restore(); }
  // control panel
  c.fillStyle = '#2B2F3A'; c.fillRect(-100, -950, 200, 230); c.fillStyle = '#FFFFFF'; c.font = '24px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VOLUME', 0, -925);
  c.save(); c.translate(0, -850); c.fillStyle = '#C9CED6'; c.beginPath(); c.arc(0, 0, 48, 0, TAU); c.fill(); c.strokeStyle = '#1E2128'; c.lineWidth = 4; c.stroke(); c.rotate(ang); c.strokeStyle = '#E0474C'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -38); c.stroke(); c.restore();
  c.font = '18px Unb9'; c.fillStyle = '#9AA3B2'; c.fillText('MIN', -70, -800); c.fillStyle = '#E0474C'; c.fillText('MAX', 70, -800);
  const bars = Math.round(lerp(4, 10, kn) * (0.75 + 0.25 * bt)); for (let i = 0; i < 10; i++) { c.fillStyle = i < bars ? (i > 7 ? '#E0474C' : i > 5 ? '#F2C14E' : '#7CF29A') : '#3A3F4B'; c.fillRect(-90 + i * 18, -760, 14, 20); }
  c.restore();
}

// ---------------- props
const prop = {
  pillow: () => (ctx, a) => { ctx.rotate(0.25); paint(ctx, q => { q.m(-110, -70); q.q(0, -95, 110, -70); q.q(130, 0, 110, 70); q.q(0, 95, -110, 70); q.q(-130, 0, -110, -70); q.z(); }, '#FFFDF8', { sd: 10, hd: 6, lw: 3.5, inner: k => { k.strokeStyle = '#F7B6CF'; k.lineWidth = 6; k.beginPath(); k.moveTo(-90, -40); k.quadraticCurveTo(0, -58, 90, -40); k.stroke(); } }); },
  mic: () => (ctx, a) => { ctx.rotate(a - Math.PI / 2 + Math.PI); paint(ctx, q => { q.m(-14, -10); q.l(14, -10); q.l(10, 120); q.l(-10, 120); q.z(); }, '#2B2F3A', { sd: 3, hd: 2, lw: 3 }); paint(ctx, q => q.a(0, -36, 34), '#C9CED6', { sd: 5, hd: 3, lw: 3, inner: k => { k.strokeStyle = 'rgba(0,0,0,.3)'; k.lineWidth = 2; for (let i = -2; i <= 2; i++) { k.beginPath(); k.moveTo(-30, -36 + i * 10); k.lineTo(30, -36 + i * 10); k.stroke(); } } }); },
  stick: () => (ctx, a) => { ctx.rotate(a - Math.PI / 2 + Math.PI * 0.8); paint(ctx, q => { q.m(-6, -10); q.l(6, -10); q.l(3, 210); q.l(-3, 210); q.z(); }, '#E8C890', { sd: 2, hd: 2, lw: 2.5 }); },
  feather: (t) => (ctx, a) => { ctx.rotate(a - Math.PI / 2 + Math.PI * 0.85 + Math.sin(t * 12) * 0.1); ctx.strokeStyle = '#F7F2E8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 190); ctx.stroke(); paint(ctx, q => { q.m(0, 20); q.b(60, 60, 50, 170, 0, 200); q.b(-50, 170, -60, 60, 0, 20); q.z(); }, '#F7B6CF', { sd: 6, hd: 3, lw: 3, inner: k => { k.strokeStyle = 'rgba(255,255,255,.7)'; k.lineWidth = 3; for (let i = 0; i < 6; i++) { k.beginPath(); k.moveTo(0, 50 + i * 24); k.lineTo(38 - i * 3, 34 + i * 24); k.moveTo(0, 50 + i * 24); k.lineTo(-38 + i * 3, 34 + i * 24); k.stroke(); } } }); },
  pizza: () => (ctx, a) => { ctx.rotate(-0.15); paint(ctx, q => { q.m(-150, -30); q.l(150, -30); q.l(150, 30); q.l(-150, 30); q.z(); }, '#E8C890', { sd: 6, hd: 3, lw: 3, inner: k => { k.fillStyle = '#C23C4A'; k.font = '30px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('PIZZA', 0, 2); } }); ctx.translate(0, -34); paint(ctx, q => { q.m(-150, 0); q.l(150, 0); q.l(130, -150); q.l(-130, -150); q.z(); }, '#F2D49A', { sd: 6, hd: 3, lw: 3, inner: k => { k.fillStyle = '#E0474C'; k.beginPath(); k.ellipse(0, -60, 110, 50, 0, 0, TAU); k.fill(); k.fillStyle = '#F7E08A'; for (let i = 0; i < 7; i++) { k.beginPath(); k.arc(-80 + i * 26, -60 + Math.sin(i * 2) * 26, 12, 0, TAU); k.fill(); } k.fillStyle = '#8A2E2A'; for (let i = 0; i < 6; i++) { k.beginPath(); k.arc(-70 + i * 30, -50 + Math.cos(i * 3) * 24, 10, 0, TAU); k.fill(); } } }); },
};

// ---------------- characters
function guitar(c, g, st, t, strum) {
  // electric guitar slung across the belly (screen space of the character)
  c.save(); c.translate(-g.sw * 0.05, g.ySh + 470); c.rotate(-0.55);
  paint(c, q => { q.m(-30, -16); q.l(520, -16); q.l(520, 16); q.l(-30, 16); q.z(); }, '#6A4630', { sd: 4, hd: 2, lw: 3, inner: k => { k.strokeStyle = 'rgba(255,240,210,.5)'; k.lineWidth = 2; for (let i = 0; i < 8; i++) { k.beginPath(); k.moveTo(60 + i * 56, -16); k.lineTo(60 + i * 56, 16); k.stroke(); } } });
  paint(c, q => { q.m(510, -30); q.l(610, -40); q.l(620, 30); q.l(510, 26); q.z(); }, '#1E2128', { sd: 4, hd: 2, lw: 3 });
  paint(c, q => { q.m(-40, -60); q.b(-40, -170, -250, -170, -250, -60); q.b(-310, -40, -310, 60, -250, 80); q.b(-250, 190, -40, 170, -40, 70); q.q(-10, 0, -40, -60); q.z(); }, '#E0474C', { sd: 12, hd: 8, inner: k => { k.fillStyle = '#FFFDF8'; k.beginPath(); k.ellipse(-140, 30, 70, 50, 0.3, 0, TAU); k.fill(); k.fillStyle = '#1E2128'; k.fillRect(-170, -30, 16, 60); k.fillRect(-120, -30, 16, 60); } });
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-220, i * 6 + (strum ? Math.sin(t * 60 + i) * 2 : 0)); c.lineTo(600, i * 5); c.stroke(); }
  c.restore();
  // strap
  c.strokeStyle = '#1E2128'; c.lineWidth = 16; c.beginPath(); c.moveTo(-g.sw * 0.7, g.ySh + 20); c.quadraticCurveTo(0, g.ySh + 200, g.sw * 0.75, g.ySh + 330); c.stroke();
}
function rockyState(t, L) {
  const g = G.rocky; const bt = beatOf('rocky', t); const on = Math.min(1, musicOn(L, t)) * (L === 'outro' ? 1 : openK(L, t));
  const strumY = g.ySh + 470 + Math.sin(t * TAU * 140 / 60) * 40 * on;
  const st = { t, talk: talk('rocky', t), mood: 'happy', turn: 0.35, look: 0.8, headY: bt * 10 * on, tilt: Math.sin(t * 4.6) * 0.05 * on,
    armL: ik(g, -1, -g.sw * 1.35, g.ySh + 300, 1), armR: { ...ik(g, 1, g.sw * 0.15, strumY, -1), fist: true } };
  st.front = (cc, gg) => guitar(cc, g, st, t, on > 0.3);
  st.armsFirst = false;
  return st;
}
function drawRocky(c, t, L, x0, extra = {}) {
  const st = rockyState(t, L); const g = G.rocky;
  if (L === 'A1') {
    if (t > SP.a1_her.t + 0.3) { st.mood = 'shock'; st.headY = 0; }
    if (t > SP.a1_x.t - 0.1) { st.mood = 'happy'; st.laugh = speaking('a1_x', t); st.armR = ik(g, 1, g.sw * 1.6 + Math.sin(t * 10) * 40, g.ySh - 120, -1); }
  }
  if (L === 'C2') {
    const ce = endOf('c2_her');
    if (t > SP.c2_her.t + 1.2) { st.mood = 'shock'; st.headY = 0; st.tilt = 0; st.armR = { ...ik(g, 1, g.sw * 0.15, g.ySh + 470, -1), fist: true }; }
    if (t > ce + 0.6) st.mood = 'skeptical';
    if (t > SP.c2_x.t - 0.1) { st.mood = 'happy'; st.armR = ik(g, 1, g.sw * 1.6, g.ySh - 60, -1); }
    if (t > SP.c2_her2.t + 0.8) { st.mood = 'happy'; st.laugh = true; st.armR = ik(g, 1, g.sw * 0.9, g.ySh - 420, -1); st.items = { R: prop.pizza() }; }
  }
  if (L === 'outro') { st.armR = ik(g, 1, g.sw * 1.2, g.ySh - 520, -1); st.mood = 'happy'; }
  Object.assign(st, extra);
  c.save(); c.translate(x0, 0); const r = human(c, CAST.rocky, st); c.restore();
  return { x: x0 + r.head.x, y: r.head.y, hh: r.hh };
}
function drawJay(c, t, L, x0) {
  const g = G.jay, cfg = CAST.jay; const bt = beatOf('jay', t); const on = Math.min(1, musicOn(L, t));
  let phonesOn = L === 'A2' && SP.a2_x && t > endOf('a2_x') + 0.15 ? eIO(P(t, endOf('a2_x') + 0.15, endOf('a2_x') + 0.6)) : 0;
  const st = { t, talk: talk('jay', t), mood: 'smug', turn: 0.3, look: 0.8, headY: bt * 12 * on, tilt: Math.sin(t * 4.2) * 0.06 * on, armL: { a: 0.3, b: 0.5 }, armR: ik(g, 1, g.sw * 1.1, g.ySh + 150 + Math.sin(t * 9) * 30 * on, -1) };
  if (L === 'A2') {
    if (t > SP.a2_her.t + 0.4) { st.mood = 'annoyed'; st.headY = 0; st.tilt = 0; st.armR = { a: 0.2, b: 0.4 }; }
    if (speaking('a2_x', t, 0.1, 0.2)) { st.mood = 'skeptical'; st.armR = ik(g, 1, g.sw * 1.6, g.ySh + 40, -1); }
    if (phonesOn > 0) { st.mood = 'bored'; st.turn = lerp(0.3, -0.1, phonesOn); st.look = lerp(0.8, -0.3, phonesOn); st.armL = ik(g, -1, -g.hw * 1.05, g.headY + 20 - (1 - phonesOn) * -300, 1); st.armR = ik(g, 1, g.hw * 1.05, g.headY + 20 - (1 - phonesOn) * -300, -1); if (phonesOn >= 1) { st.headY = bt * 14; st.tilt = Math.sin(t * 4.2) * 0.07; } }
  }
  if (L === 'C2' && t > SP.c2_her.t + 1.2 && t < SP.c2_nar.t) { st.mood = 'shock'; st.headY = 0; st.tilt = 0; st.turn = 0.4; st.look = 1; }
  st.front = (cc, gg) => { // headphones: around neck -> over ears
    const hx = gg.head.x, hy = gg.head.y; const yy = lerp(gg.ySh - 10, hy, phonesOn), ww = lerp(g.hw * 0.95, g.hw * 1.12, phonesOn);
    cc.strokeStyle = '#1E2128'; cc.lineWidth = 16; cc.beginPath(); if (phonesOn > 0.5) cc.arc(hx, hy - 10, g.hw * 1.12, Math.PI * 1.08, Math.PI * 1.92); else cc.arc(hx, yy + 40, ww, Math.PI * 0.05, Math.PI * 0.95); cc.stroke();
    for (const s of [-1, 1]) paint(cc, q => q.e(hx + s * ww, yy + (phonesOn > 0.5 ? 10 : 30), 34, 50), '#E0474C', { sd: 6, hd: 3, lw: 3, inner: k => { k.fillStyle = '#7CF29A'; k.beginPath(); k.arc(hx + s * ww, yy + (phonesOn > 0.5 ? 10 : 30), 12, 0, TAU); k.fill(); } });
  };
  c.save(); c.translate(x0, 0); const r = human(c, cfg, st); c.restore();
  return { x: x0 + r.head.x, y: r.head.y, hh: r.hh };
}
function drawNana(c, t, L, x0, speakerX) {
  const g = G.nana, cfg = CAST.nana; const bt = beatOf('nana', t); const on = Math.min(1, musicOn(L, t));
  const st = { t, talk: talk('nana', t), mood: 'happy', turn: 0.3, look: 0.7, headY: bt * 8 * on, tilt: Math.sin(t * 1.9) * 0.08 * on, armL: { a: 0.25, b: 0.6 }, armR: ik(g, 1, g.hw * 0.7, g.headY + 140, -1), items: { R: prop.mic() } };
  if (L === 'B1') {
    const ev = lvEv('B1');
    if (t > SP.b1_her.t + 0.3) { st.armR = ik(g, 1, g.sw * 0.9, g.ySh + 260, -1); st.headY = 0; st.tilt = 0.08; st.mood = 'happy'; }
    if (speaking('b1_x', t, 0, 0.1)) { st.armL = ik(g, -1, -g.sw * 1.2, g.ySh + 40, 1); }
    if (t > endOf('b1_x') && t < ev.knob + 0.9) { const k = eOut(P(t, endOf('b1_x'), ev.knob)); st.armR = ik(g, 1, lerp(g.sw * 0.9, speakerX - x0 - 10, k), lerp(g.ySh + 260, -860, k), -1); st.items = {}; st.turn = 0.7; st.look = 1; }
    if (t > ev.knob + 0.9) { st.mood = 'happy'; st.laugh = true; st.headY = bt * 16; st.tilt = Math.sin(t * 3) * 0.1; st.armR = ik(g, 1, g.hw * 0.7, g.headY + 140, -1); st.items = { R: prop.mic() }; st.armL = ik(g, -1, -g.sw * 1.6, g.ySh - 200, 1); }
  }
  if (L === 'C2' && t > SP.c2_her.t + 1.2 && t < SP.c2_nar.t) { st.mood = 'shock'; st.headY = 0; st.tilt = 0; st.turn = 0.4; st.look = 1; }
  c.save(); c.translate(x0, 0); const r = human(c, cfg, st); c.restore();
  return { x: x0 + r.head.x, y: r.head.y, hh: r.hh };
}
function drawTony(c, t, L, x0) {
  const g = G.tony, cfg = CAST.tony; const on = Math.min(1, musicOn(L, t)); const ph = t * TAU * 150 / 60;
  const hitL = Math.max(0, Math.sin(ph)) * on, hitR = Math.max(0, Math.sin(ph + Math.PI)) * on;
  const st = { t, talk: talk('tony', t), mood: 'happy', turn: 0.3, look: 0.7, headY: hitL * 10, armL: ik(g, -1, -g.sw * 1.0, g.ySh + 260 + hitL * 90, 1), armR: ik(g, 1, g.sw * 1.0, g.ySh + 260 + hitR * 90, -1), items: { L: prop.stick(), R: prop.stick() } };
  if (L === 'B2') {
    const ev = lvEv('B2');
    if (t > SP.b2_her.t + 0.3) { st.armL = ik(g, -1, -g.sw * 1.1, g.ySh + 300, 1); st.armR = ik(g, 1, g.sw * 1.1, g.ySh + 300, -1); st.headY = 0; st.mood = 'neutral'; }
    if (speaking('b2_x', t, 0.1, 0.2)) { st.mood = 'happy'; st.armR = ik(g, 1, g.sw * 1.5, g.ySh + 20, -1); }
    if (ev.feather && t > ev.feather - 0.3) { const tp = Math.sin((t - ev.feather) * 14); st.items = { L: prop.feather(t), R: prop.feather(t + 0.3) }; st.mood = 'happy'; st.squint = true; st.armL = ik(g, -1, -g.sw * 0.9, g.ySh + 300 + Math.max(0, tp) * 25, 1); st.armR = ik(g, 1, g.sw * 0.9, g.ySh + 300 + Math.max(0, -tp) * 25, -1); }
  }
  if (L === 'C2' && t > SP.c2_her.t + 1.2 && t < SP.c2_nar.t) { st.mood = 'shock'; st.headY = 0; st.turn = 0.4; st.look = 1; st.armL = ik(g, -1, -g.sw * 1.1, g.ySh + 300, 1); st.armR = ik(g, 1, g.sw * 1.1, g.ySh + 300, -1); }
  c.save(); c.translate(x0, 0); const r = human(c, cfg, st); c.restore();
  return { x: x0 + r.head.x, y: r.head.y, hh: r.hh };
}
function drawMargot(c, t, L, x0) {
  const g = G.margot, cfg = CAST.margot; const on = Math.min(1, musicOn(L, t));
  const st = { t, talk: talk('margot', t), mood: 'happy', turn: 0.3, look: 0.7, headY: Math.sin(t * 2.2) * 5 * on, armL: { a: 0.2, b: 0.4 }, armR: ik(g, 1, g.sw * 1.0, g.ySh + 200, -1), items: { R: items.wine(0.6) } };
  if (L === 'C1') {
    const ev = lvEv('C1');
    if (t > SP.c1_her.t + 0.5) { st.mood = 'neutral'; }
    if (t > SP.c1_her.t + 2.6) { st.mood = 'shock'; }
    if (speaking('c1_x', t, 0.1, 0.1)) { st.mood = 'happy'; st.armL = ik(g, -1, -g.hw * 0.4, g.ySh + 90, 1); }
    if (ev.wrap && t > ev.wrap - 0.2 && t < ev.wrap + 0.9) { const cl = Math.abs(Math.sin((t - ev.wrap) * Math.PI / 0.28)); st.items = {}; st.armL = ik(g, -1, -40 - cl * 70, g.ySh + 230, 1); st.armR = ik(g, 1, 40 + cl * 70, g.ySh + 230, -1); st.mood = 'happy'; st.squint = true; }
    if (ev.wrap && t > ev.wrap + 0.9) { st.mood = 'happy'; st.items = { R: items.wine(0.6) }; }
  }
  if (L === 'C2' && t > SP.c2_her.t + 1.2 && t < SP.c2_nar.t) { st.mood = 'shock'; st.turn = 0.4; st.look = 1; }
  c.save(); c.translate(x0, 0); const r = human(c, cfg, st); c.restore();
  return { x: x0 + r.head.x, y: r.head.y, hh: r.hh };
}
function herState(t, L) {
  const g = G.her_party; const ev = lvEv(L);
  const st = { t, talk: talk('her', t), mood: 'tired', turn: -0.45, look: -0.7, armL: { a: 0.18, b: 0.35 }, armR: ik(g, 1, g.sw * 0.5, g.ySh + 280, -1), items: { R: prop.pillow() } };
  if (L === 'hook') { st.mood = 'annoyed'; st.turn = -0.2; st.look = -0.4; }
  // knocking on the door (left arm)
  if (ev.knock && t > ev.knock - 0.5 && t < ev.open + 0.15) { const kt = t - ev.knock; const hit = kt > 0 && kt < 0.66 ? Math.max(0, Math.cos(kt / 0.22 * TAU)) : 0.4; st.armL = { ...ik(g, -1, -(HERX - 160) + (1 - hit) * 50, g.ySh + 90, 1), fist: true }; st.mood = 'annoyed'; }
  const l = (L || '').toLowerCase(); const hs = SP[l + '_her'];
  if (hs && speaking(l + '_her', t, 0.05)) { const gg = Math.sin((t - hs.t) * 5); st.armL = reach(g, -1, -g.sw * 0.2 + gg * 50, g.ySh + 200 - Math.abs(gg) * 40); }
  if (L === 'A1') { if (t > SP.a1_her.t - 0.2) st.mood = 'annoyed'; if (speaking('a1_her', t)) { st.armL = ik(g, -1, -g.sw * 1.9, g.ySh + 30 + Math.sin(t * 9) * 20, -1); } if (t > SP.a1_x.t + 0.3) st.mood = 'shock'; if (t > SP.a1_nar.t) st.mood = 'worried'; }
  if (L === 'A2') { st.mood = speaking('a2_her', t) ? 'angry' : (t > endOf('a2_her') ? 'shock' : 'annoyed'); if (speaking('a2_her', t)) st.armL = ik(g, -1, -g.sw * 1.7, g.ySh + 60, -1, true); if (t > SP.a2_nar.t) st.mood = 'annoyed'; }
  if (L === 'B1') { st.mood = 'happy'; const k = ev.knob; if (k && t > k + 0.45) { st.mood = 'shock'; st.items = {}; st.armL = ik(g, -1, -g.hw * 1.0, g.headY + 30, 1); st.armR = ik(g, 1, g.hw * 1.0, g.headY + 30, -1); st.hairSway = Math.sin(t * 30) * 0.15; } if (t > SP.b1_nar.t + 0.5) st.mood = 'worried'; }
  if (L === 'B2') { st.mood = 'neutral'; if (SP.b2_x && t > SP.b2_x.t + 0.6) st.mood = 'happy'; if (ev.feather && t > ev.feather + 0.4) { st.mood = 'happy'; st.squint = true; } }
  if (L === 'C1') { st.mood = speaking('c1_her', t) ? 'neutral' : (t > SP.c1_x.t ? 'happy' : 'neutral'); if (ev.wrap && t > ev.wrap + 0.6) { st.mood = 'smug'; } }
  if (L === 'C2') {
    st.mood = 'smug'; if (speaking('c2_her', t, 0.1)) { st.armL = reach(g, -1, -g.sw * 0.15, g.ySh + 130); st.armR = reach(g, 1, g.sw * 1.55 + Math.sin(t * 2.4) * 40, g.ySh + 40 + Math.cos(t * 2.4) * 30); st.items = {}; st.turn = -0.25; }
    if (t > endOf('c2_her') + 0.2) st.mood = 'worried';
    if (t > SP.c2_her2.t - 0.1) st.mood = 'neutral';
    if (t > SP.c2_her2.t + 0.9) { st.mood = 'happy'; st.laugh = true; }
  }
  if (L === 'outro') { st.mood = 'happy'; st.items = {}; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(t * 8) * 40, g.headY - 220); st.armR = reach(g, 1, g.sw * 1.5 + Math.sin(t * 8 + 1) * 40, g.headY - 200); st.turn = 0; st.look = 0; st.headY = beatOf('rocky', t) * 12; }
  return st;
}
function herX(t, L, x0) { if (L === 'C2' && SP.c2_nar) { const k = eIO(P(t, SP.c2_nar.t + 0.8, SP.c2_nar.t + 3.0)); return x0 + lerp(HERX, 120, k); } return x0 + HERX; }
function drawHer(c, t, L, x, s = 1, y = HERY) { c.save(); c.translate(x, y); c.scale(s, s); const st = herState(t, L); if (L === 'C2' && SP.c2_nar && t > SP.c2_nar.t + 0.8) { st.legPose = 'walk'; st.turn = -0.6; } const r = human(c, CAST.her_party, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s }; }
function drawCat(c, t, L, x) {
  const lo = loud(L, t), cover = lo > 0.9 || (L === 'B1' && lo > 0.5);
  c.save(); c.translate(x, HERY + 10); c.scale(0.4, 0.4);
  catChar(c, { t, mood: cover ? 'annoyed' : (L === 'B2' && lvEv('B2').feather && t > lvEv('B2').feather + 0.4 ? 'happy' : 'bored'), turn: -0.4, look: -0.8, armL: cover ? { a: 2.6, b: 1.8 } : { a: 0.5, b: 1.6 }, armR: cover ? { a: 2.6, b: 1.8 } : { a: 0.3, b: 0.5 },
    outfit: (cc, br) => { paint(cc, q => { q.m(-150, -560 + br); q.l(150, -560 + br); q.l(165, -300); q.l(-165, -300); q.z(); }, '#8E78C8', { sd: 10, hd: 5, inner: k => { k.fillStyle = '#FFFFFF'; for (let i = 0; i < 12; i++) { k.beginPath(); k.arc(-120 + (i % 4) * 80, -520 + Math.floor(i / 4) * 70 + br, 10, 0, TAU); k.fill(); } } }); },
    hat: (cc) => { paint(cc, q => { q.m(-150, -230); q.q(0, -270, 150, -230); q.l(140, -175); q.q(0, -215, -140, -175); q.z(); }, '#F7B6CF', { sd: 6, hd: 4, lw: 3 }); } });
  c.restore();
}

// ---------------- composition
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {};
  const who = LSTAT[L], x0 = ST[who];
  for (const [w, xx] of Object.entries(ST)) {
    if (Math.abs(xx - x0) > 2700) continue;
    const k = w === who ? openK(L, t) : 0;
    wallLive(c, xx, w, t, L);
    door(c, xx, w, k, t, L);
    if (w === who && k > 0.01) {
      // inside: crowd of neighbours at Rocky's in C2/outro
      if (w === 'rocky' && (L === 'C2' || L === 'outro')) {
        c.save(); c.beginPath(); c.rect(xx - OPEN_W, -OPEN_H, OPEN_W * 2, OPEN_H); c.clip();
        const S = 0.6, by = -360;
        const put = (fn, dx) => { c.save(); c.translate(xx + dx, by); c.scale(S, S); const r = fn(c, t, L, 0); c.restore(); return { x: xx + dx + r.x * S, y: by + r.y * S, hh: r.hh * S }; };
        heads.tony = put(drawTony, -300); heads.margot = put(drawMargot, 300); heads.jay = put(drawJay, -130); heads.nana = put((cc, tt, LL, xx2) => drawNana(cc, tt, LL, xx2, 0), 140);
        c.restore();
      }
      if (w === 'tony') drumKit(c, xx, t, L, false);
    }
    doorLeaf(c, xx, w, k, t, L);
    if (w === who && k > 0.01) {
      c.save(); c.beginPath(); c.rect(xx - OPEN_W - 200, -OPEN_H - 400, OPEN_W * 2 + 400, OPEN_H + 800); c.clip();
      if (w === 'nana') speaker(c, xx + 255, t, L);
      const nb = { rocky: drawRocky, jay: drawJay, nana: (cc, tt, LL, xx2) => drawNana(cc, tt, LL, xx2, xx + 255), tony: drawTony, margot: drawMargot }[w];
      const hx = xx + NBX + (w === 'nana' ? -60 : w === 'tony' ? 90 : 0);
      if (!(L === 'C2' && SP.c2_nar && t > SP.c2_nar.t + 2.2 && false)) heads[w] = nb(c, t, L, hx);
      if (w === 'tony') drumKit(c, xx, t, L, true);
      if (w === 'margot') { c.save(); c.translate(hx - 260, 0); c.scale(0.5, 0.5); poodle(c, { t, flip: true }); c.restore(); }
      c.restore();
    }
    spill(c, xx, w, t, L);
    notesOut(c, xx, w, t, L);
  }
  if (L !== 'outro') { const hx = herX(t, L, x0); heads.her = drawHer(c, t, L, hx); if (L !== 'C2' || !SP.c2_nar || t < SP.c2_nar.t + 0.8) drawCat(c, t, L, x0 + HERX + 230); }
  // feather taps: tiny "tss" marks
  if (L === 'B2' && lvEv('B2').feather && t > lvEv('B2').feather && t < SP.b2_nar.t + 0.3) { for (let i = 0; i < 3; i++) { const ph = ((t - lvEv('B2').feather) * 1.4 + i / 3) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI); c.font = '70px Cav7'; c.textAlign = 'center'; c.lineJoin = 'round'; c.strokeStyle = '#3E471E'; c.lineWidth = 10; c.strokeText('тсс...', x0 + NBX + 90 + (i - 1) * 190, -1050 - ph * 200); c.fillStyle = '#FFFDF8'; c.fillText('тсс...', x0 + NBX + 90 + (i - 1) * 190, -1050 - ph * 200); c.restore(); } }
  return heads;
}

// ---------------- camera
function shotFor(t) {
  const sc = sceneAt(t), L = sc.id; const who = LSTAT[L], x0 = ST[who];
  const herHY = HERY + G.her_party.headY, nbHY = G[who === 'nana' ? 'nana' : who].headY;
  const hx = x0 + HERX, nx = x0 + NBX + (who === 'nana' ? -60 : who === 'tony' ? 90 : 0);
  const two = { x: x0 + 260, y: Math.min(herHY, nbHY) + 150, z: 0.95, r: 0 };
  if (L === 'hook') return { x: x0 + 200, y: -1000, z: 0.9, r: 0 };
  if (L === 'outro') return { x: x0 + 200, y: -1000, z: 0.9, r: 0 };
  const u = t - sc.s; const ev = sc.ev || {};
  if (u < 1.15) return { ...two, z: 0.9, cut: u < 0.85 };
  if (t < ev.open + 0.4) return { x: x0 + 300, y: -1050, z: lerp(0.9, 1.02, P(t, sc.s + 1.15, ev.open)), r: 0 };
  const l = L.toLowerCase(); const her = l + '_her', oth = l + '_x', nar = l + '_nar';
  const herC = { x: hx - 40, y: herHY + 115, z: 1.5, r: -0.5 }, othC = { x: nx + 40, y: nbHY + 115, z: 1.45, r: 0.5 };
  if (L === 'C2') {
    const he = endOf('c2_her');
    if (t < SP.c2_her.t - 0.2) return two;
    if (t < he + 0.1) return { ...herC, z: lerp(1.4, 1.85, P(t, SP.c2_her.t, he)), y: lerp(herHY + 120, herHY + 85, P(t, SP.c2_her.t, he)) };
    if (t < SP.c2_x.t - 0.15) return { ...othC, z: 1.6, y: nbHY + 110, cut: true };
    if (t < SP.c2_her2.t - 0.05) return { ...othC, z: 1.6, y: nbHY + 110, cut: t < SP.c2_x.t };
    if (t < SP.c2_nar.t - 0.1) return { ...herC, z: 1.75, y: herHY + 100, cut: t < SP.c2_her2.t + 0.05 };
    return { ...two, z: 0.93 };
  }
  if (L === 'B1' && ev.knob && t > endOf('b1_x') - 0.1 && t < SP.b1_her2.t - 0.1) return { x: x0 + 150, y: -1050, z: 1.0, r: 0 };
  if (L === 'B2' && ev.feather && t > ev.feather - 0.4 && t < SP.b2_nar.t - 0.1) return { x: nx + 60, y: nbHY + 330, z: 1.35, r: 0 };
  if (L === 'C1' && ev.wrap && t > ev.wrap - 0.4 && t < SP.c1_nar.t - 0.1) return { x: x0 + 120, y: -1050, z: 0.95, r: 0 };
  if (speaking(her, t, 0.3, 0.1)) return herC;
  if (L === 'B1' && speaking('b1_her2', t, 0.3, 0.1)) return { ...herC, z: 1.4 };
  if (SP[nar] && t >= SP[nar].t - 0.15) return { ...two, z: 0.93 };
  if (speaking(oth, t, 0.3, 0.3)) return othC;
  return two;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shakeBase = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'drop', 'boom']);
function shake(t) { const s = shakeBase(t); const sc = sceneAt(t); if (sc.id === 'B1' && sc.ev && sc.ev.knob && t > sc.ev.knob + 0.5 && t < SP.b1_nar.t + 0.5) { const a = 6 * beatOf('nana', t) + 3; s.x += noise1(t * 30) * a; s.y += noise1(t * 33 + 5) * a; } return s; }

// ---------------- hook / outro
function clock01(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.05);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -150, -70, 300, 150, 26); c.fill(); c.fillStyle = '#1E2128'; rr(c, -160, -80, 300, 150, 26); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 7; c.stroke();
  c.font = '84px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#E0474C'; c.shadowBlur = 20; c.fillStyle = '#FF6A6A'; c.fillText(Math.floor(t * 2) % 2 ? '01:00' : '01 00', -10, 0); c.restore();
}
function drawHook(c, t) {
  const cam = { x: 200, y: -1000, z: 0.9 };
  c.save(); c.translate(540, 960); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); world(c, t, 'hook'); c.restore();
  c.fillStyle = 'rgba(243,237,223,0.80)'; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(-0.35); c.fillStyle = 'rgba(238,94,154,.08)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 160 + (t * 60) % 160, 3200, 70); c.restore();
  const { textFit, strokeText, font, rr: R } = UI;
  const lines = TL.cfg.hook_title.map(([tx, cc], i) => [tx, [0.05, 0.55, 0.9, 1.25][i], cc === 'p' ? C.pink : C.oliveD]);
  const up = eIO(P(t, 2.35, 2.8)); const bt = beatOf('rocky', t);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  lines.forEach(([txt, t0, col], i) => {
    const k = eBack(P(t, t0, t0 + 0.28), 2.4); if (k <= 0) return;
    const fsz = i === 2 ? 150 : 104; const s = textFit(c, 'Unb9', fsz, txt, 980);
    const y = lerp(520 + i * 165 + (i >= 2 ? 30 : 0) + (i === 3 ? 40 : 0), 450 + i * 118 + (i >= 2 ? 20 : 0) + (i === 3 ? 30 : 0), up);
    c.save(); c.translate(540, y); const scl = k * lerp(1, 0.74, up) * (i === 2 ? 1 + 0.04 * bt : 1); c.scale(scl, scl); c.rotate(i % 2 ? 0.02 : -0.02);
    font(c, 'Unb9', s); c.fillStyle = 'rgba(62,71,30,.18)'; c.fillText(txt, 8, 12); strokeText(c, txt, 0, 0, col, C.white, 18); c.restore();
  });
  UI.levelBar(c, t, { id: 'hook' });
  const stT = SC.hook.stamp_t, sk = P(t, stT - 0.02, stT + 0.15);
  if (sk > 0) { const s = lerp(2.6, 1, eOut(sk)); c.save(); c.translate(540, 1010); c.rotate(-0.13); c.scale(s, s); c.globalAlpha = clamp(sk * 3); c.strokeStyle = C.pink; c.lineWidth = 14; R(c, -380, -90, 760, 180, 24); c.stroke(); textFit(c, 'Unb9', 110, TL.cfg.stamp, 700); c.fillStyle = C.pink; c.fillText(TL.cfg.stamp, 0, 6); c.restore(); }
  // music notes flying across
  for (let i = 0; i < 6; i++) { const ph = (t * 0.35 + i / 6) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * 0.8; noteShape(c, 120 + ph * 840 + Math.sin(t * 3 + i) * 30, 1560 - ph * 260 - (i % 3) * 120, 1.0, ['#EE5E9A', '#8E78C8', '#E9A23B'][i % 3], Math.sin(t * 4 + i) * 0.3); c.restore(); }
  const pk = eBack(P(t, 1.5, 2.0), 1.4);
  if (pk > 0) {
    c.save(); c.translate(270, lerp(3000, 2560, pk)); c.scale(0.78, 0.78); human(c, CAST.her_party, herState(t, 'hook')); c.restore();
    c.save(); c.translate(810, lerp(3100, 2760, eBack(P(t, 1.7, 2.2), 1.4))); c.scale(0.7, 0.7); human(c, CAST.rocky, rockyState(t, 'outro')); c.restore();
    clock01(c, 230, lerp(2300, 1300, pk) + Math.sin(t * 6) * 6, 0.8 * pk, t);
  }
}
function drawOutro(c, t) {
  const s = SC.outro.s, u = t - s, o = SP.outro;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  const { textFit, strokeText, font, rr: R } = UI;
  const ck = eBack(P(u, 0.4, 0.9), 1.4);
  c.save(); c.translate(180, lerp(2900, 2420, ck)); c.scale(0.6, 0.6); human(c, CAST.her_party, herState(t, 'outro')); c.restore();
  c.save(); c.translate(560, lerp(2800, 2330, eBack(P(u, 0.6, 1.1), 1.4))); c.scale(0.62, 0.62); drawNana(c, t, 'outro', 0, 0); c.restore();
  c.save(); c.translate(900, lerp(3000, 2560, eBack(P(u, 0.5, 1.0), 1.4))); c.scale(0.55, 0.55); drawRocky(c, t, 'outro', 0); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.35, 0.7), 2.2);
  c.save(); c.translate(540, 450); c.scale(q, q); font(c, 'Unb9', 74); strokeText(c, 'А КАК ПОПРОСИШЬ', 0, -66, C.oliveD, C.white, 16); strokeText(c, 'ТЫ?', 0, 40, C.pink, C.white, 16); c.restore();
  const ex = [['Music. No. Sleep!', true], ['Could you turn it down?', false], ['Would you mind keeping it down?', false], ['Sorry to bother you, but...', false]];
  ex.forEach(([e, bad], i) => { const k = eBack(P(u, 1.05 + i * 0.22, 1.4 + i * 0.22), 2.2); if (k <= 0) return; c.save(); c.translate(540 + (i % 2 ? 30 : -30), 660 + i * 115 + Math.sin(t * 3 + i) * 5); c.scale(k, k); textFit(c, 'Nun9', 52, e, 760); const w = c.measureText(e).width + 70; c.fillStyle = 'rgba(0,0,0,.12)'; R(c, -w / 2 + 6, -44 + 8, w, 88, 44); c.fill(); c.fillStyle = bad ? '#B9B2A4' : [LVCOL.B1, LVCOL.B2, LVCOL.C1][i - 1]; R(c, -w / 2, -44, w, 88, 44); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); c.fillStyle = C.white; c.fillText(e, 0, 3); if (bad) { c.strokeStyle = C.red; c.lineWidth = 9; c.beginPath(); c.moveTo(-w / 2 + 20, 4); c.lineTo(w / 2 - 20, 0); c.stroke(); } c.restore(); });
  const ak = eOut(P(t, o.t + 1.3, o.t + 1.6));
  if (ak > 0) { c.save(); c.globalAlpha = ak; c.translate(540, 1170 + Math.sin(t * 7) * 10); font(c, 'Unb9', 46); c.fillStyle = C.oliveD; c.fillText('ПИШИ В КОММЕНТЫ', 0, 0); c.fillStyle = C.pink; c.beginPath(); c.moveTo(-40, 50); c.lineTo(40, 50); c.lineTo(0, 100); c.fill(); c.restore(); }
  const sk = eBack(P(t, o.t + 4.2, o.t + 4.5), 2);
  if (sk > 0) { const click = P(t, o.t + 5.0, o.t + 5.15), pressed = t > o.t + 5.1; c.save(); c.translate(540, 1420); const ss = sk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; R(c, -250, -62, 500, 124, 62); c.fill(); font(c, 'Unb9', 44); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, o.t + 4.4, o.t + 5.0)); UI.tapCursor(c, lerp(840, 610, mv), lerp(1700, 1440, mv), 1, P(t, o.t + 5.05, o.t + 5.6));
    if (pressed) { c.fillStyle = C.gold; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28, r = 120 + 200 * P(t, o.t + 5.1, o.t + 5.6); c.globalAlpha = 1 - P(t, o.t + 5.1, o.t + 5.8); UI.star(c, 540 + Math.cos(a) * r * 1.6, 1420 + Math.sin(a) * r, 16, a); } c.globalAlpha = 1; } }
  for (let i = 0; i < 8; i++) { const ph = (t * 0.3 + i / 8) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * 0.6; noteShape(c, 80 + (i * 137) % 920, 1900 - ph * 1700, 0.8, ['#EE5E9A', '#8E78C8', '#E9A23B', '#5E9E6E'][i % 4], Math.sin(t * 3 + i) * 0.3); c.restore(); }
}

// ---------------- C2 montage inserts: frozen neighbours, one face per cut
const MONT = ['jay', 'nana', 'tony', 'margot'];
function montageIdx(t) { if (!SP.c2_her) return -1; const he = endOf('c2_her'); if (t < he + 0.1 || t >= SP.c2_x.t - 0.15) return -1; return Math.min(3, Math.floor((t - he - 0.1) / 0.55)); }
function drawInsert(c, t, idx) {
  const who = MONT[idx], he = endOf('c2_her'), t0 = he + 0.1 + idx * 0.55, u = t - t0; const f = FLAT.rocky;
  const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, f.room[0]); g.addColorStop(1, f.room[1]); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 1500); c.scale(1.6, 1.6); c.translate(0, 0); crowd(c, 0, he, 'rocky', 0, 5, 300, '#24102E'); c.restore();
  c.save(); c.translate(-ST.rocky + 540, 1900); c.scale(1, 1); beams(c, 540, f, he, 0.6, 'rocky'); c.restore();
  const S = 1.25 + u * 0.08, ty = 860 - G[who].headY * S;
  c.save(); c.translate(540, ty); c.scale(S, S);
  if (who === 'jay') drawJay(c, t, 'C2', 0); else if (who === 'nana') drawNana(c, t, 'C2', 0, 0); else if (who === 'tony') drawTony(c, t, 'C2', 0); else drawMargot(c, t, 'C2', 0);
  c.restore();
  Hq.vignette(c, W, HH, 0.4);
}

// ---------------- frame
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.05); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { drawOutro(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const mi = sc.id === 'C2' ? montageIdx(t) : -1;
  c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  const heads = mi >= 0 ? {} : world(c, t, sc.id);
  const M = c.getTransform(); c.restore();
  if (mi >= 0) drawInsert(c, t, mi);
  // night grade + party light wash from the door side
  const gr = c.createLinearGradient(0, 0, 0, HH); gr.addColorStop(0, 'rgba(40,30,90,.10)'); gr.addColorStop(1, 'rgba(60,30,80,.14)'); c.fillStyle = gr; c.fillRect(0, 0, W, HH);
  const who = LSTAT[sc.id]; const lo = loud(sc.id, t);
  if (lo > 0.01) { const f2 = FLAT[who]; const col = f2.lights[Math.floor(t * f2.bpm / 60) % f2.lights.length]; c.save(); c.globalCompositeOperation = 'soft-light'; const wg = c.createLinearGradient(0, 0, W, 0); wg.addColorStop(0, rgba(col, Math.min(0.55, 0.3 * lo * (0.6 + 0.4 * beatOf(who, t))))); wg.addColorStop(1, rgba(col, 0)); c.fillStyle = wg; c.fillRect(0, 0, W, HH); c.restore(); }
  Hq.vignette(c, W, HH, 0.34);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  const l = sc.id.toLowerCase();
  const lineIds = TL.speech.filter(x => x.id.startsWith(l + '_') && x.who !== 'nar' && x.who !== 'tip');
  const holdFor = sp => { if (sp.id === 'c2_her') return 0.0; const i = lineIds.indexOf(sp); const nx = lineIds[i + 1]; return nx ? Math.max(0.05, Math.min(0.9, nx.t - (sp.t + sp.d) - 0.25)) : 0.9; };
  for (const sp of lineIds) {
    const hd = heads[sp.who]; if (!hd) continue;
    if (sp.who === 'her') UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x - 30, y: hd.y - hd.hh * 1.25 }), 'left');
    else UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x + 30, y: hd.y - hd.hh * 1.25 }), 'right', NAMES[sp.who]);
  }
  if (sc.id === 'C2') {
    const a = endOf('c2_her') + 0.3, b = SP.c2_x.t - 0.1;
    if (t > a && t < b) { const dots = Math.min(3, Math.floor((t - a) / 0.55) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(dots).padEnd(3, ' '), 540, 1450, C.white, C.oliveD, 16); UI.font(c, 'Nun9', 40); UI.strokeText(c, '*вечеринка замерла*', 540, 1560, C.white, C.oliveD, 10); c.restore(); }
  }
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t);
  Hq.grain(c, W, HH, t, 0.045);
  UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('party', NF, renderFrame);
