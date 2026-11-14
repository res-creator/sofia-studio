// "Он оценил ваше свидание на 7 из 10" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node seventen.js start end out.mp4 | --png=f1,f2
// A candle-lit Italian place in New York: the heroine (burgundy top) and her date Liam (navy blazer, red tie) sit at a table; he rates the evening
// with a judge's scorecard «7/10». Absurd detail: at the next table three old judges keep holding up their own scorecards (9 · 9 · 3, ...).
// o1 «В ЛОБ»: "Seven?! You — three!" she whips out her own card «3»; the judges all flip to 3; "But I paid for dessert!"; his card slides off the table.
// o2 «ВЕЖЛИВО»: "Point one…" — insert: his list; it unrolls and rolls across the floor all the way to the door; she slumps.
// o3 «КАК НОСИТЕЛЬ»: "Wow. Tough crowd." — he laughs; insert: the marker crosses out the 7 and writes an 8; the judges: 8 · 8 · 8; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand line with her own card (5, then 6.5); he sweats; his card flips itself to 10; "...Ten. Final answer."; judges 10 · 10 · 10.
// Twist (music silent): a video call rings in his jacket — his mum (British, visiting from England) has been on the call all evening (1:12:47):
//   "Seven?! She's a ten. You're the seven!" with her own scorecard; his face; she holds up «10»; the judges: 7 · 7 · 7 for him; moral; end screen.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, hash, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/seventen/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_restaurant };
const LIAM = { ...BASE.mark, seed: 18, hair: { style: 'quiff', col: '#4A2E1C' }, brow: '#3A2414' };
const MUM = { ...BASE.margot, top: { type: 'cardigan', col: '#3E6FB0', col2: '#F7E6EC' } };
const J1 = { ...BASE.joe, top: { type: 'blazer', col: '#6A5A8A', shirt: '#FFFFFF', tie: '#E0B24A' } };
const J2 = { ...BASE.agnes };
const J3 = { ...BASE.reggie };
const G = { her: geom(HER), date5: geom(LIAM), mum: geom(MUM), j1: geom(J1), j2: geom(J2), j3: geom(J3) };
const SEAT = 330, TOP = -500;                 // seated upper body dropped by SEAT; table top at y = TOP
const HX = -580, DX = 580;                    // her seat, his seat
const TX0 = -860, TX1 = 860;                  // table ends
const PX = 250;                               // his scorecard on its little stand (on the table)
const JF = -400, JS = 0.66, JXS = [-330, 0, 330], JTOP = JF + JS * TOP;   // the judges' table at the back (scaled), floor line JF
const DR0 = 1720, DR1 = 2140, DRH = 1600;     // the entrance door (right)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function blushOn(c, head, k, col = '#FF5A7A') { if (k <= 0) return; c.save(); c.globalAlpha = 0.6 * k; c.fillStyle = col; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(head.x + s * head.hh * 0.48, head.y + head.hh * 0.18, head.hh * 0.2, head.hh * 0.11, 0, 0, TAU); c.fill(); } c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function handset(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-34, -22); c.quadraticCurveTo(-40, -40, -24, -44); c.lineTo(-12, -30); c.quadraticCurveTo(-10, -22, -18, -16); c.quadraticCurveTo(-8, 8, 16, 18); c.quadraticCurveTo(22, 10, 30, 12); c.lineTo(44, 24); c.quadraticCurveTo(40, 40, 22, 36); c.quadraticCurveTo(-24, 22, -34, -22); c.fill(); c.restore(); }
function camIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; rr(c, -30, -20, 40, 40, 8); c.fill(); c.beginPath(); c.moveTo(12, -4); c.lineTo(32, -18); c.lineTo(32, 18); c.lineTo(12, 4); c.closePath(); c.fill(); c.restore(); }

// ---------------- the scorecard (judge's paddle): (0,0) = bottom of the handle. txt: '7' | '7/10' | '8/10' (crossed 7 + marker 8) | '10/10' | ...
// o.flip 0..1 = spinning (text swaps at 0.5 to o.txt2), o.lean = rotation
function cardFace(c, txt, w, h) {
  c.fillStyle = '#FFFDF8'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 16); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  if (txt === '8/10') {   // the 7 crossed out, a hand-written red 8
    UI.font(c, 'Unb9', h * 0.62); c.fillStyle = '#2B2F3A'; c.fillText('7', -w * 0.24, h * 0.02);
    c.strokeStyle = '#2B2F3A'; c.lineWidth = h * 0.06; c.lineCap = 'round'; c.beginPath(); c.moveTo(-w * 0.4, -h * 0.25); c.lineTo(-w * 0.06, h * 0.25); c.stroke();
    mark8(c, w * 0.18, 0, h * 0.62, 1); fitTxt(c, '/10', w * 0.4, h * 0.3, h * 0.16, '#2B2F3A', w * 0.2); return; }
  const m = /^(.+)\/10$/.exec(txt);
  if (m) { UI.textFit(c, 'Unb9', h * 0.66, m[1], w * 0.62); c.fillStyle = m[1] === '10' ? '#C0303A' : '#2B2F3A'; c.fillText(m[1], -w * 0.12, h * 0.03); fitTxt(c, '/10', w * 0.33, h * 0.3, h * 0.17, '#2B2F3A', w * 0.26); return; }
  UI.textFit(c, 'Unb9', h * 0.7, txt, w * 0.82); c.fillStyle = txt === '3' ? '#C0303A' : '#2B2F3A'; c.fillText(txt, 0, h * 0.03); }
// the hand-written red 8 (k = how much of it is drawn, 0..1)
function mark8(c, x, y, h, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.strokeStyle = '#E0303A'; c.lineWidth = h * 0.11; c.lineCap = 'round'; c.lineJoin = 'round';
  const r1 = h * 0.2, r2 = h * 0.25, L1 = TAU * r1, L2 = TAU * r2;
  c.setLineDash([L1 * clamp(k * 2), 1e4]); c.beginPath(); c.arc(0, -h * 0.22, r1, Math.PI / 2, Math.PI / 2 + TAU); c.stroke();
  if (k > 0.5) { c.setLineDash([L2 * clamp(k * 2 - 1), 1e4]); c.beginPath(); c.arc(0, h * 0.23, r2, -Math.PI / 2, -Math.PI / 2 - TAU, true); c.stroke(); }
  c.setLineDash([]); c.restore(); }
function paddle(c, s, txt, o = {}) { c.save(); c.scale(s, s); c.rotate(o.lean || 0);
  c.fillStyle = '#A9744A'; c.strokeStyle = '#6A4426'; c.lineWidth = 4; rr(c, -11, -170, 22, 170, 8); c.fill(); c.stroke();
  const f = o.flip || 0, sx = f > 0 ? Math.abs(Math.cos(f * Math.PI)) : 1, tx = f > 0.5 && o.txt2 ? o.txt2 : txt;
  c.save(); c.translate(0, -265); c.scale(Math.max(0.04, sx), 1); cardFace(c, tx, 250, 200); c.restore(); c.restore(); }
// a paddle held in a hand: the handle sits in the fist, drawn under the hand
const padItem = (txt, o = {}) => ({ under: ctx => { ctx.save(); ctx.translate(0, 50); paddle(ctx, o.s || 0.85, txt, o); ctx.restore(); } });

// ---------------- the restaurant (prerendered, softly blurred); live: windows (traffic), candles, the judges' table, the door
const BX0 = -3200, BY0 = -3600, BW = 6600, BH = 5600, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#7A2E2E'; c.fillRect(BX0, BY0, BW, BH);                                      // deep red wall
  c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, BY0, 110, BH);
  c.fillStyle = '#5A3A22'; c.fillRect(BX0, -1150, BW, 820); c.fillStyle = 'rgba(0,0,0,.18)'; for (let x = BX0; x < BX0 + BW; x += 260) c.fillRect(x, -1150, 10, 820);   // wood wainscot
  c.fillStyle = '#C9A06A'; c.fillRect(BX0, -1170, BW, 30);
  // chalkboard specials (left), US prices
  c.fillStyle = '#8A5A36'; rr(c, -2900, -2700, 1000, 1200, 20); c.fill(); c.fillStyle = '#2E3A34'; c.fillRect(-2860, -2660, 920, 1120);
  fitTxt(c, "TONIGHT'S", -2400, -2540, 70, '#FFFDF8', 800); fitTxt(c, 'SPECIALS', -2400, -2450, 80, '#F2C14E', 800);
  [['Spaghetti', '$18'], ['Lasagna', '$21'], ['Tiramisu', '$9'], ['House wine', '$11']].forEach(([a, b], i) => { fitTxt(c, a, -2800, -2290 + i * 150, 58, '#FFFDF8', 560, 'Nun9', 'left'); fitTxt(c, b, -2000, -2290 + i * 150, 58, '#F2C14E', 200, 'Nun9', 'right'); });
  // framed pictures, a wine rack (right of the windows)
  for (const [x, y, col] of [[-1500, -2300, '#E0A08A'], [1250, -2350, '#9FC8E0']]) { c.fillStyle = '#C9A06A'; rr(c, x - 190, y - 240, 380, 480, 12); c.fill(); c.fillStyle = col; c.fillRect(x - 160, y - 210, 320, 420); c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.arc(x, y - 30, 80, 0, TAU); c.fill(); c.fillStyle = 'rgba(60,90,60,.5)'; c.beginPath(); c.moveTo(x - 160, y + 210); c.lineTo(x - 40, y + 40); c.lineTo(x + 60, y + 140); c.lineTo(x + 160, y + 20); c.lineTo(x + 160, y + 210); c.fill(); }
  c.fillStyle = '#4A2E1A'; c.fillRect(2350, -2700, 700, 1500); for (let r = 0; r < 5; r++) for (let k = 0; k < 4; k++) { c.fillStyle = '#2A1A10'; c.beginPath(); c.arc(2440 + k * 170, -2580 + r * 280, 62, 0, TAU); c.fill(); c.fillStyle = ['#5A1A2A', '#2F5A3A', '#5A1A2A', '#C9A06A'][(r + k) % 4]; c.beginPath(); c.arc(2440 + k * 170, -2580 + r * 280, 44, 0, TAU); c.fill(); }
  // string lights
  c.strokeStyle = 'rgba(30,20,10,.6)'; c.lineWidth = 6; c.beginPath(); for (let x = BX0; x <= BX0 + BW; x += 40) c.lineTo(x, -3050 + 120 * Math.sin((x - BX0) / 700 * Math.PI) ** 2); c.stroke();
  for (let x = BX0 + 100; x < BX0 + BW; x += 280) { const y = -3050 + 120 * Math.sin((x - BX0) / 700 * Math.PI) ** 2; c.fillStyle = 'rgba(255,220,140,.35)'; c.beginPath(); c.arc(x, y + 40, 60, 0, TAU); c.fill(); c.fillStyle = '#FFE6A0'; c.beginPath(); c.arc(x, y + 40, 26, 0, TAU); c.fill(); }
  // back floor strip (behind the judges) + front floor
  c.fillStyle = '#B88A5A'; c.fillRect(BX0, -330, BW, 330);
  c.fillStyle = '#E9DCC4'; c.fillRect(BX0, -12, BW, BY0 + BH + 12); c.fillStyle = 'rgba(60,30,20,.12)'; for (let y = -12; y < BY0 + BH; y += 170) for (let x = BX0 + ((Math.round((y + 12) / 170)) % 2) * 170; x < BX0 + BW; x += 340) c.fillRect(x, y, 170, 170);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
// the big window behind the couple: a New York street at night (brick, fire escape, a yellow cab passing), painted name on the glass
const WN0 = -1100, WN1 = 1000, WNY0 = -2650, WNY1 = -1300;
function windowView(c, t) { const w = WN1 - WN0, h = WNY1 - WNY0;
  c.fillStyle = '#3A2414'; rr(c, WN0 - 36, WNY0 - 36, w + 72, h + 72, 12); c.fill();
  c.save(); c.beginPath(); c.rect(WN0, WNY0, w, h); c.clip();
  const sky = c.createLinearGradient(0, WNY0, 0, WNY1); sky.addColorStop(0, '#1E2A4A'); sky.addColorStop(1, '#3A4A6E'); c.fillStyle = sky; c.fillRect(WN0, WNY0, w, h);
  c.fillStyle = '#8A3E2E'; c.fillRect(WN0 - 20, WNY0 + 120, 760, h); c.fillStyle = '#6E3226'; c.fillRect(WN0 + 820, WNY0 + 60, 680, h); c.fillStyle = '#7E3A2A'; c.fillRect(WN0 + 1560, WNY0 + 200, 600, h);
  c.fillStyle = 'rgba(255,214,120,.8)'; for (let i = 0; i < 18; i++) { const x = WN0 + 40 + (i % 6) * 120 + Math.floor(i / 6) * 0, y = WNY0 + 180 + Math.floor(i / 6) * 220; if (hash(i * 7) > 0.35) c.fillRect(x + (i % 6 > 2 ? 760 : 0) + 40, y, 64, 100); }
  c.strokeStyle = '#1A1A1A'; c.lineWidth = 8; for (let k = 0; k < 2; k++) { const y = WNY0 + 380 + k * 300; c.strokeRect(WN0 + 880, y, 520, 110); c.beginPath(); c.moveTo(WN0 + 900, y + 110); c.lineTo(WN0 + 1380, y + 410); c.stroke(); for (let x = WN0 + 900; x < WN0 + 1400; x += 40) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 110); c.stroke(); } }
  c.fillStyle = '#4A4A52'; c.fillRect(WN0, WNY1 - 170, w, 170); c.fillStyle = '#6A6A72'; c.fillRect(WN0, WNY1 - 190, w, 22);
  // the cab
  const cx = WN0 - 500 + ((t * 420) % (w + 1200)); c.fillStyle = '#F2C230'; rr(c, cx, WNY1 - 300, 440, 120, 30); c.fill(); rr(c, cx + 90, WNY1 - 380, 250, 100, 30); c.fill(); c.fillStyle = '#9FC8E0'; c.fillRect(cx + 110, WNY1 - 365, 95, 70); c.fillRect(cx + 225, WNY1 - 365, 95, 70);
  c.fillStyle = '#2B2F3A'; rr(c, cx + 160, WNY1 - 410, 110, 34, 8); c.fill(); fitTxt(c, 'TAXI', cx + 215, WNY1 - 392, 26, '#F2C230', 100); c.fillStyle = '#1A1A1A'; c.fillRect(cx, WNY1 - 250, 440, 16); for (const wx of [cx + 90, cx + 350]) { c.beginPath(); c.arc(wx, WNY1 - 180, 44, 0, TAU); c.fill(); }
  c.restore();
  c.fillStyle = '#3A2414'; c.fillRect(WN0 + w / 2 - 18, WNY0, 36, h);
  c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(WN0 + 100, WNY0); c.lineTo(WN0 + 300, WNY0); c.lineTo(WN0 + 60, WNY1); c.lineTo(WN0 - 140, WNY1); c.fill();
  // gold lettering on the glass
  c.save(); c.globalAlpha = 0.9; fitTxt(c, 'PASTA', WN0 + w * 0.25, WNY0 + 110, 96, '#F2C14E', 600); fitTxt(c, '& WINE', WN0 + w * 0.75, WNY0 + 110, 96, '#F2C14E', 600); c.restore(); }
// the entrance door on the right: EXIT sign above, OPEN sign on the glass; swing (0..1) = pushed open by the rolling list
function door(c, t, sw = 0) { const w = DR1 - DR0;
  c.fillStyle = '#3A2414'; c.fillRect(DR0 - 40, -DRH - 40, w + 80, DRH + 40 + 60);
  c.fillStyle = '#1E2A4A'; c.fillRect(DR0, -DRH, w, DRH + 60);
  c.save(); c.translate(DR1, 0); c.scale(1 - 0.35 * sw, 1); c.translate(-w, 0);
  c.fillStyle = '#6A3A22'; c.fillRect(0, -DRH, w, DRH + 60); c.fillStyle = '#2E3A5A'; c.fillRect(50, -DRH + 60, w - 100, 900); c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(80, -DRH + 60); c.lineTo(180, -DRH + 60); c.lineTo(80, -DRH + 400); c.fill();
  c.fillStyle = '#E0474C'; rr(c, 80, -DRH + 380, w - 160, 120, 16); c.fill(); fitTxt(c, 'OPEN', w / 2, -DRH + 440, 70, '#FFFDF8', w - 200);
  c.fillStyle = '#C9A06A'; c.fillRect(30, -700, 26, 200); c.restore();
  c.fillStyle = '#1A1A1A'; rr(c, DR0 + w / 2 - 150, -DRH - 190, 300, 110, 12); c.fill(); fitTxt(c, 'EXIT', DR0 + w / 2, -DRH - 134, 76, '#FF4A4A', 260);
  K.mark(c, 'door', (DR0 + DR1) / 2, -600, 300); }

// ---------------- the table + props
function candle(c, x, y, t) { c.fillStyle = '#2F5A3A'; paint(c, q => { q.m(x - 50, y); q.q(x - 70, y - 120, x - 18, y - 170); q.l(x - 18, y - 230); q.l(x + 18, y - 230); q.l(x + 18, y - 170); q.q(x + 70, y - 120, x + 50, y); q.z(); }, '#2F5A3A', { sd: 4, hd: 2, lw: 3 });
  c.fillStyle = '#FFFDF8'; rr(c, x - 16, y - 330, 32, 110, 8); c.fill(); const fl = 1 + 0.12 * Math.sin(t * 17) + 0.06 * Math.sin(t * 29);
  c.fillStyle = 'rgba(255,200,90,.25)'; c.beginPath(); c.arc(x, y - 370, 90 * fl, 0, TAU); c.fill(); c.fillStyle = '#FFB830'; c.beginPath(); c.ellipse(x, y - 370, 16, 34 * fl, 0, 0, TAU); c.fill(); c.fillStyle = '#FFF2C0'; c.beginPath(); c.ellipse(x, y - 362, 8, 16 * fl, 0, 0, TAU); c.fill(); }
function plateSet(c, x, y, pasta = true) { paint(c, q => q.e(x, y - 14, 170, 30), '#FFFDF8', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = 'rgba(0,0,0,.06)'; c.beginPath(); c.ellipse(x, y - 14, 110, 18, 0, 0, TAU); c.fill();
  if (pasta) { c.strokeStyle = '#F2C87A'; c.lineWidth = 6; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(x - 10 + i * 6, y - 34, 50 - i * 6, 14, 0.2, 0, TAU); c.stroke(); } c.fillStyle = '#D0402A'; c.beginPath(); c.arc(x + 20, y - 40, 14, 0, TAU); c.fill(); } }
function wineGlass(c, x, y) { c.fillStyle = 'rgba(220,235,245,.55)'; c.beginPath(); c.moveTo(x - 46, y - 220); c.quadraticCurveTo(x - 50, y - 120, x, y - 110); c.quadraticCurveTo(x + 50, y - 120, x + 46, y - 220); c.fill(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.stroke();
  c.fillStyle = 'rgba(120,20,40,.75)'; c.beginPath(); c.moveTo(x - 42, y - 175); c.quadraticCurveTo(x - 40, y - 120, x, y - 116); c.quadraticCurveTo(x + 40, y - 120, x + 42, y - 175); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y - 110); c.lineTo(x, y - 8); c.stroke(); c.beginPath(); c.ellipse(x, y - 6, 34, 7, 0, 0, TAU); c.stroke(); }
function tiramisu(c, x, y) { paint(c, q => q.e(x, y - 10, 120, 22), '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); paint(c, q => { q.m(x - 70, y - 20); q.l(x + 70, y - 20); q.l(x + 70, y - 110); q.l(x - 70, y - 110); q.z(); }, '#F4E2B8', { sd: 4, hd: 2, lw: 3 });
  c.fillStyle = '#8A5A36'; c.fillRect(x - 70, y - 72, 140, 16); c.fillStyle = '#6A4022'; c.fillRect(x - 70, y - 118, 140, 14); c.fillStyle = '#D0213A'; c.beginPath(); c.arc(x + 20, y - 130, 12, 0, TAU); c.fill(); }
function table(c, t) {
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(TX0 - 20, -20, TX1 - TX0 + 40, 40);
  paint(c, q => { q.m(TX0 + 30, TOP); q.l(TX1 - 30, TOP); q.l(TX1, -10); q.l(TX0, -10); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = 'rgba(200,40,50,.5)'; for (let x = TX0; x < TX1; x += 110) for (let y = TOP + 30; y < -10; y += 110) if (((x - TX0) / 110 + (y - TOP - 30) / 110) % 2 < 1) k.fillRect(x, y, 110, 110); } });
  paint(c, q => { q.m(TX0 - 10, TOP - 40); q.l(TX1 + 10, TOP - 40); q.l(TX1 - 20, TOP + 14); q.l(TX0 + 20, TOP + 14); q.z(); }, '#F4EAD8', { sd: 4, hd: 2, lw: 4 }); }
function tableTop(c, t, L) { plateSet(c, -360, TOP - 6); plateSet(c, 400, TOP - 6, false); wineGlass(c, -600, TOP - 6); wineGlass(c, 640, TOP - 6); candle(c, -20, TOP - 6, t); tiramisu(c, 110, TOP - 6); }
// the judges' table at the back (scaled): cloth + three cards lying flat when not raised
function judgesTable(c) { const y = JTOP; c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-550, JF - 10, 1100, 20);
  paint(c, q => { q.m(-520, y); q.l(520, y); q.l(540, JF); q.l(-540, JF); q.z(); }, '#F7F0E2', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = 'rgba(200,40,50,.35)'; c.fillRect(-540, JF - 40, 1080, 20);
  for (const x of [-140, 140]) { c.fillStyle = 'rgba(220,235,245,.6)'; rr(c, x - 22, y - 70, 44, 66, 6); c.fill(); } }

// ---------------- the scorecards: his (stand / hand / sliding / flipping), hers, the judges'
function hisCard(t, L) {   // -> {mode: 'stand' | 'hand' | 'slide' | 'floor', txt, flip, txt2, k}
  if (L === 'hook') return { mode: 'hand', txt: '7/10', up: 1 };
  if (L === 'o1') { const sl = ev('o1', 'slide'), fa = ev('o1', 'fall'); if (t > sl) return { mode: t < fa ? 'slide' : 'floor', txt: '7/10', k: clamp((t - sl) / (fa - sl)) }; return { mode: 'stand', txt: '7/10' }; }
  if (L === 'o3') { const d = ev('o3', 'draw'), sh = ev('o3', 'show'); if (t > sh - 0.05) return { mode: 'hand', txt: '8/10', up: eOut(clamp((t - sh + 0.05) / 0.3)) }; return { mode: 'stand', txt: t > d ? '8/10' : '7/10' }; }
  if (L === 'o4') { const f = ev('o4', 'flip'); if (t > f) return { mode: 'stand', txt: '7/10', txt2: '10/10', spin: clamp((t - f) / 0.5) }; return { mode: 'stand', txt: '7/10' }; }
  if (L === 'end') return { mode: 'stand', txt: '10/10' };
  return { mode: 'stand', txt: '7/10' }; }
function herCard(t, L) {   // -> null | {txt, up, flip, txt2}
  if (L === 'o1') { const a = ev('o1', 'three'); if (t > a - 0.1) return { txt: '3', up: eBack(clamp((t - a + 0.1) / 0.28), 1.6) }; }
  if (L === 'o4') { const a = ev('o4', 'five'), b = ev('o4', 'half'), e = ev('o4', 'compare'); if (t > a - 0.1 && t < e + 0.1) return { txt: '5', txt2: '6.5', flip: clamp((t - b) / 0.35), up: eBack(clamp((t - a + 0.1) / 0.28), 1.6) * (1 - eIO(clamp((t - e + 0.2) / 0.3))) }; }
  if (L === 'end') { const a = ev('end', 'grin'); if (t > a - 0.1) return { txt: '10', up: eBack(clamp((t - a + 0.1) / 0.28), 1.6) }; }
  return null; }
function judgeCards(t, L) {   // -> {txt: [..3], up}
  const show = (t0, txt, hold = 99) => ({ txt, up: eBack(clamp((t - t0) / 0.25), 1.8) * (1 - eIO(clamp((t - t0 - hold) / 0.3))), t0 });
  if (L === 'hook') return show(hev('judges'), ['9', '9', '3']);
  if (L === 'o1' && t > ev('o1', 'j3')) return show(ev('o1', 'j3'), ['3', '3', '3']);
  if (L === 'o3' && t > ev('o3', 'j8')) return show(ev('o3', 'j8'), ['8', '8', '8']);
  if (L === 'o4' && t > ev('o4', 'j10')) return show(ev('o4', 'j10'), ['10', '10', '10']);
  if (L === 'end' && t > ev('end', 'j7')) return show(ev('end', 'j7'), ['7', '7', '7']);
  return { txt: ['', '', ''], up: 0 }; }

// ---------------- characters
const onTable = (g, s, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + 335, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const raise = (g, s, k = 1.25, dy = -60) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });          // card held up beside the shoulder (never behind the head)
const chinUp = g => reach(g, 1, g.hw * 0.35, g.headY + g.hh * 1.05, { planar: true });                         // chin on the palm
const gest = (st, g, who, t, side, base_) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base_ + Math.cos(u) * 20, { planar: true }); } };
const seated = (g, t, who, turn) => ({ t, talk: talk(who, t), mood: 'neutral', turn, look: Math.sign(turn) * 0.8, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = seated(g, t, 'her', 0.3);
  const hc = herCard(t, L); if (hc && hc.up > 0) { st.armR = reach(g, 1, lerp(g.sw * 0.8, g.sw * 1.3, hc.up), lerp(g.ySh + 330, g.ySh - 70, hc.up), { planar: true }); st.items = { R: padItem(hc.txt, { txt2: hc.txt2, flip: hc.flip, s: 0.8 }) }; }
  if (L === 'hook') { st.mood = 'surprised'; st.blink = 0;
    if (t > hev('nar') - 0.05) { st.mood = 'shock'; st.breathe = 0; st.look = 0.9; }
    if (t > hev('jcu') + 1.0) { st.mood = 'annoyed'; } }
  if (L === 'o1') { st.mood = 'angry'; st.look = 0.9;
    if (speaking('o1_h', t, 0.05, 0.1)) { st.headY = Math.abs(Math.sin((t - SP.o1_h.t) * 7)) * 6; st.armL = open(g, -1, 1.5, 150); }
    if (t > SP.o1_d.t) { st.mood = 'skeptical'; }
    if (t > e('slide')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o2') { st.mood = 'worried';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.tilt = 0.06; st.armR = reach(g, 1, g.sw * 1.15, g.ySh + 40, { planar: true }); }
    if (t > SP.o2_d.t) { st.mood = 'surprised'; st.tilt = 0; }
    if (t > e('unroll')) { st.mood = 'shock'; st.look = 1; st.lookY = 0.5; }
    if (t > e('slump')) { st.mood = 'tired'; st.blink = 1; st.lookY = 0; st.headFirst = false; st.armR = chinUp(g); st.tilt = 0.08; st.headY = 12; } }
  if (L === 'o3') { st.mood = 'smug';
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'skeptical'; st.armR = open(g, 1, 1.5, 190); }
    if (t > endOf('o3_h') + 0.1) { st.mood = 'happy'; }
    if (t > SP.o3_d.t + 0.3) { st.mood = 'happy'; st.laugh = true; }
    if (t > e('show')) { st.laugh = false; st.mood = 'happy'; st.blink = 1; } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = t > ev('o4', 'compare') ? 'smug' : 'happy'; st.tilt = 0.05 * Math.sin(t * 2); if (!(hc && hc.up > 0.1)) gest(st, g, 'her', t, 1, 200); st.armL = open(g, -1, 1.4, 180); }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; st.armL = onTable(g, -1); }
    if (t > e('flip') + 0.3) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.o4_d.t + 0.4) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'happy';
    if (t > ev('end', 'ring')) { st.mood = 'surprised'; st.blink = 0; st.look = 0.9; st.lookY = 0.3; }
    if (t > ev('end', 'shock')) { st.mood = 'happy'; st.laugh = true; }
    if (t > ev('end', 'grin')) { st.mood = 'smug'; st.laugh = false; st.blink = 1; st.look = 0.4; }
    if (t > ev('end', 'moral')) { st.mood = 'happy'; st.laugh = true; st.blink = 0; } }
  return st; }
function liamState(t, L) { const g = G.date5, e = k => ev(L, k), st = seated(g, t, 'date5', -0.3);
  const hc = hisCard(t, L);
  if (hc.mode === 'hand') { const u = hc.up ?? 1; st.armL = reach(g, -1, -lerp(g.sw * 0.8, g.sw * 1.6, u), lerp(g.ySh + 330, g.ySh + 30, u), { planar: true }); st.items = { L: padItem(hc.txt, { s: 0.85 }) }; }
  if (L === 'hook') { st.mood = 'smug'; st.blink = 0;
    if (speaking('hook_d', t, 0.1, 0.1)) { st.mood = 'happy'; gest(st, g, 'date5', t, 1, 200); st.tilt = 0.04 * Math.sin(t * 3); }
    if (t > endOf('hook_d') + 0.1) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o1') { st.mood = 'happy';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('j3')) { st.mood = 'shock'; st.blink = 0; st.look = 0.3; }
    if (speaking('o1_d', t, 0.05, 0.1)) { st.mood = 'sad'; st.blink = 0; if (t > e('dessert') - 0.15) st.armL = reach(g, -1, 110 - DX, TOP - 70 - SEAT, { planar: true }); else st.armL = open(g, -1, 1.6, 150); }
    if (t > e('slide')) { st.mood = 'sad'; st.look = -0.5; st.lookY = 0.4; st.armL = onTable(g, -1); }
    if (t > e('peek')) { st.mood = 'sad'; st.lookY = 0.9; st.tilt = -0.12; st.headY = 20; } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > e('pull')) { st.mood = 'happy'; const k = eOut(clamp((t - e('pull')) / 0.3)); st.armR = reach(g, 1, lerp(g.sw * 0.3, g.sw * 1.2, k), lerp(g.ySh + 200, g.ySh + 60, k), { planar: true }); st.items = { R: scrollItem }; st.armL = open(g, -1, 1.5, 120); }
    if (t > e('unroll') - 0.05) { st.mood = 'smug'; st.blink = 1; st.armR = open(g, 1, 1.4, 160); st.items = { R: scrollEnd }; }
    if (t > e('slump')) { st.mood = 'happy'; st.blink = 0; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o3_d.t - 0.05) { st.mood = 'happy'; st.laugh = t < SP.o3_d.t + 0.8; gest(st, g, 'date5', t, 1, 180); }
    if (t > e('show') - 0.05) { st.mood = 'happy'; st.blink = 1; st.laugh = false; } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > ev('o4', 'five') ? 'worried' : 'happy'; if (t > ev('o4', 'compare')) { st.mood = 'shock'; st.blink = 0; } }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('flip') + 0.4) { st.mood = 'worried'; st.blink = 0; }
    if (speaking('o4_d', t, 0.05, 0.1)) { st.mood = 'worried'; st.armL = open(g, -1, 1.7, 80); st.armR = open(g, 1, 1.7, 80); }
    if (t > e('j10')) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'happy'; const r = ev('end', 'ring'), p = ev('end', 'pull');
    if (t > r) { st.mood = 'shock'; st.blink = 0; st.headY = Math.sin(t * 40) * 3 * clamp(1 - (t - r)); }
    if (t > p) { const k = eOut(clamp((t - p) / 0.3)); st.mood = 'worried'; st.lookY = 0.4; st.armR = reach(g, 1, lerp(g.sw * 0.3, g.sw * 0.9, k), lerp(g.ySh + 260, g.ySh + 150, k), { planar: true }); st.items = { R: phoneItem(t) }; }
    if (t > ev('end', 'shock')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0; st.look = -0.3; }
    if (t > ev('end', 'j7')) { st.mood = 'sad'; st.look = -0.2; st.lookY = 0.3; st.tilt = -0.06; } }
  return st; }
// his list: rolled (in hand), then only the paper end in his fingers
const scrollItem = ctx => { ctx.save(); ctx.translate(0, -10); paint(ctx, q => { q.m(-24, -110); q.l(24, -110); q.l(24, 40); q.l(-24, 40); q.z(); }, '#FFFDF8', { sd: 4, hd: 2, lw: 3 }); ctx.fillStyle = '#E8DCC4'; ctx.beginPath(); ctx.ellipse(0, -110, 24, 8, 0, 0, TAU); ctx.fill(); ctx.restore(); };
const scrollEnd = ctx => { ctx.save(); ctx.fillStyle = '#FFFDF8'; ctx.strokeStyle = '#B8A888'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, -20); ctx.lineTo(40, -20); ctx.lineTo(44, 120); ctx.lineTo(-36, 120); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); };
const phoneItem = t => ctx => { ctx.save(); ctx.translate(0, -60); paint(ctx, q => { q.m(-46, -84); q.l(46, -84); q.l(46, 84); q.l(-46, 84); q.z(); }, '#2B2F3A', { sd: 6, hd: 3, lw: 3 }); ctx.fillStyle = '#7FD0FF'; rr(ctx, -38, -74, 76, 148, 8); ctx.fill();
  ctx.fillStyle = '#F2C9A8'; ctx.beginPath(); ctx.arc(0, -10, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#F1E3C2'; ctx.beginPath(); ctx.arc(0, -26, 22, Math.PI, TAU); ctx.fill(); ctx.restore(); };
// the judges (scaled, seated at the back table, facing the camera)
const JCFG = [J1, J2, J3], JG = [G.j1, G.j2, G.j3];
function judgeState(i, t, L) { const g = JG[i], st = { t, talk: 0, mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1, 0.6), armR: onTable(g, 1, 0.6), items: {} };
  const jc = judgeCards(t, L), s = i === 2 ? 1 : -1;
  if (jc.up > 0 && jc.txt[i]) { const k = jc.up; st[s < 0 ? 'armL' : 'armR'] = reach(g, s, s * lerp(g.sw * 0.6, g.sw * 1.0, k), lerp(g.ySh + 330, g.ySh + 0, k), { planar: true }); st.items = { [s < 0 ? 'L' : 'R']: padItem(jc.txt[i], { s: 0.95 }) }; }
  const grumpy = i === 2;
  st.mood = grumpy ? 'skeptical' : 'neutral'; st.blink = Math.sin(t * 1.3 + i * 2.1) > 0.97 ? 1 : 0;
  if (L === 'hook') { if (grumpy && t > hev('jcu') + 0.5) { st.mood = 'annoyed'; st.turn = Math.sin((t - hev('jcu')) * 9) * 0.25 * clamp(1 - (t - hev('jcu') - 0.5) / 1.2); } if (!grumpy && t > hev('judges')) st.mood = 'happy'; }
  if (L === 'o1' && t > ev('o1', 'j3')) st.mood = 'annoyed';
  if (L === 'o3' && t > ev('o3', 'j8')) { st.mood = 'happy'; st.headY = Math.abs(Math.sin((t - ev('o3', 'j8')) * 6)) * 8; }
  if (L === 'o4' && t > ev('o4', 'j10')) { st.mood = 'happy'; st.laugh = true; }
  if (L === 'end' && t > ev('end', 'j7')) { st.mood = grumpy ? 'smug' : 'skeptical'; }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'date5'], cover: ['her', 'date5'], two: ['her', 'date5'], her: ['her', 'date5'], herb: ['her'], date: ['her', 'date5'], dateb: ['date5'], judges: [], tablecu: ['her', 'date5'], door: ['her', 'date5'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function chair(c, x, h = 600) { c.fillStyle = '#4A2A18'; rr(c, x - 175, -460 - h, 350, h + 20, 50); c.fill(); c.fillStyle = '#8A2A2A'; rr(c, x - 145, -430 - h, 290, h - 40, 40); c.fill(); }
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  windowView(c, t);
  // the judges' table at the back (the absurd detail)
  c.save(); for (let i = 0; i < 3; i++) { c.save(); c.translate(JXS[i], JF); c.scale(JS, JS); chair(c, 0, 560); c.restore(); }
  for (let i = 0; i < 3; i++) K.put(c, JCFG[i], judgeState(i, t, L), JXS[i], JF, JS);
  judgesTable(c); c.restore(); K.mark(c, 'judges', 0, JF - 420, 420);
  door(c, t, L === 'o2' ? 0.6 * clamp((t - ev('o2', 'door')) / 0.25) * (1 - clamp((t - ev('o2', 'door') - 0.9) / 0.6)) : 0);
  chair(c, HX - 60); chair(c, DX + 60, 640);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (who.includes('date5')) { const qa = global.__QA; if (tag === 'tablecu') global.__QA = null; heads.date5 = K.put(c, LIAM, liamState(t, L), DX, 0); global.__QA = qa; }   // table close-up: his cut-off body must not pull the camera assist
  if (heads.date5 && L === 'o4' && t > ev('o4', 'compare')) sweat(c, heads.date5, t, clamp((t - ev('o4', 'compare')) / 0.3));
  if (heads.date5 && L === 'end' && t > ev('end', 'shock')) sweat(c, heads.date5, t, clamp((t - ev('end', 'shock')) / 0.3));
  if (heads.date5 && L === 'o3' && t > SP.o3_d.t) blushOn(c, heads.date5, 0.4 * clamp((t - SP.o3_d.t) / 0.3));
  if (heads.her && L === 'end' && t > ev('end', 'grin')) blushOn(c, heads.her, 0.5);
  // ring waves from his jacket pocket (twist)
  if (L === 'end' && heads.date5) { const r = ev('end', 'ring'), p = ev('end', 'pull'); if (t > r && t < p + 0.2) { const px = DX - 60, py = -830; c.save(); c.globalAlpha = clamp((p + 0.2 - t) / 0.2); c.fillStyle = 'rgba(127,208,255,.45)'; c.beginPath(); c.arc(px, py, 70 + Math.sin(t * 30) * 8, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const rr_ = 90 + i * 50 + ((t * 3) % 1) * 30; for (const s of [-1, 1]) { c.beginPath(); c.arc(px, py, rr_, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6); c.stroke(); } } c.restore(); } }
  if (tag === 'judges') { if (!heads.her) heads.her = OFFL; if (!heads.date5) heads.date5 = OFF; return heads; }
  table(c, t); tableTop(c, t, L);
  // his card on its stand / sliding off / on the floor
  const hc = hisCard(t, L);
  if (hc.mode === 'stand') { c.save(); c.translate(PX, TOP - 6); c.fillStyle = '#6A4426'; rr(c, -50, -16, 100, 16, 6); c.fill(); const sp = hc.spin || 0; if (sp > 0 && sp < 1) { c.translate(0, -Math.sin(sp * Math.PI) * 90); }
    paddle(c, 0.8, hc.txt, { flip: hc.spin ? (sp < 1 ? (sp * 2.5) % 1 : 1) : 0, txt2: hc.txt2 }); if (sp > 0) { const shine = clamp((sp - 0.9) / 0.1) * (1 - clamp((t - ev('o4', 'flip') - 1.6) / 0.4)); if (shine > 0) { c.save(); c.globalAlpha = shine; c.fillStyle = C.gold; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 2; UI.star(c, Math.cos(a) * 190, -215 + Math.sin(a) * 150, 22, a); } c.restore(); } } c.restore(); K.mark(c, 'card', PX, TOP - 220, 140); }
  if (hc.mode === 'slide' || hc.mode === 'floor') { const k = hc.mode === 'floor' ? 1 : hc.k; c.save();
    if (hc.mode === 'slide') { const x = lerp(PX, TX1 - 40, eIn(clamp(k / 0.55))), drop = k > 0.55 ? eIn(clamp((k - 0.55) / 0.45)) : 0; c.translate(x + drop * 120, TOP - 6 + drop * 480); c.rotate(lerp(0, 0.35, clamp(k / 0.55)) + drop * 1.2); paddle(c, 0.8, hc.txt); }
    else { c.translate(TX1 + 130, 40); c.rotate(1.57); paddle(c, 0.8, hc.txt); }
    c.restore(); }
  // o2: the list unrolls along the floor to the door
  if (L === 'o2' && t > ev('o2', 'unroll')) { const u = ev('o2', 'unroll'), d = ev('o2', 'door'), k = clamp((t - u) / (d - u)), x0 = DX + 120, x1 = lerp(x0, DR0 + 40, eOut(k)), y = 90;
    c.fillStyle = '#FFFDF8'; c.strokeStyle = '#B8A888'; c.lineWidth = 4; c.beginPath(); c.moveTo(DX + 160, -380); c.quadraticCurveTo(x0 + 40, -60, x0, y - 30); c.lineTo(x1, y - 50); c.lineTo(x1, y + 50); c.lineTo(x0 - 40, y + 50); c.quadraticCurveTo(x0, -60, DX + 110, -380); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(40,40,60,.55)'; c.lineWidth = 7; for (let x = x0 + 30; x < x1 - 90; x += 110) { c.beginPath(); c.moveTo(x, y - 20); c.lineTo(x + 70, y - 20); c.moveTo(x, y + 14); c.lineTo(x + 46, y + 14); c.stroke(); }
    const r = 80 * (1 - 0.5 * k); c.save(); c.translate(x1, y + 50 - r); c.rotate((x1 - x0) / r); c.fillStyle = '#F4EAD8'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#B8A888'; c.beginPath(); c.arc(0, 0, r * 0.4, 0, 5); c.stroke(); c.restore(); K.mark(c, 'list', (x0 + x1) / 2, y, 200); }
  if (!heads.her) heads.her = OFFL; if (!heads.date5) heads.date5 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, dHY = G.date5.headY + SEAT, jHY = JF + JS * (G.j1.headY + SEAT);
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(0, fy(dHY, 0.6, 980), 0.6, 'cover'), WIDE: S(0, fy(dHY, 0.58, 840), 0.58, 'wide'), TWO: S(0, fy(dHY, 0.66, 820), 0.66, 'two'),
  HER: S(HX + 120, fy(hHY, 1.0, 880), 1.0, 'her'), HER_CU: S(HX + 60, fy(hHY, 1.3, 900), 1.3, 'herb'),
  DATE: S(DX - 110, fy(dHY, 0.95, 860), 0.95, 'date'), DATE_CU: S(DX - 40, fy(dHY, 1.25, 900), 1.25, 'dateb'),
  JUD: S(0, fy(jHY, 0.98, 1100), 0.98, 'judges'), CARD: S(PX + 20, -640, 1.6, 'tablecu'), DOOR: S(1400, fy(-500, 0.6, 820), 0.6, 'door'),
  LIST: U('list', 1), MARKER: U('marker', 2), CALL: U('call', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.05) return SH.COVER; if (t < hev('jcu') - 0.03) return f(SH.HER_CU); if (t < SC.hook.e) return f(SH.JUD); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < e('j3') - 0.03) return f(SH.HER); if (t < SP.o1_d.t - 0.1) return f(SH.JUD); if (t < e('slide') - 0.03) return f(SH.DATE); if (t < e('peek') - 0.03) return f(SH.CARD); if (t < SP.o1_nar.t - 0.05) return f(SH.DATE_CU); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_d.t - 0.1) return f(SH.HER); if (t < e('list') - 0.03) return f(SH.DATE); if (t < e('unroll') - 0.03) return f(SH.LIST); if (t < e('slump') - 0.03) return f(SH.DOOR); return f(SH.HER_CU); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_d.t - 0.1) return f(SH.HER); if (t < e('draw') - 0.03) return f(SH.DATE); if (t < e('show') - 0.03) return f(SH.MARKER); if (t < e('j8') - 0.03) return f(SH.TWO); if (t < SP.o3_nar.t - 0.05) return f(SH.JUD); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('compare') - 0.03) return f(SH.HER); if (t < e('flip') - 0.03) return f(SH.DATE_CU); if (t < SP.o4_d.t - 0.1) return f(SH.CARD); if (t < e('j10') - 0.03) return f(SH.DATE); return f(SH.WIDE); }
  if (L === 'end') { if (t < e('phone') - 0.03) return f(SH.DATE); if (t < e('shock') - 0.03) return f(SH.CALL); if (t < e('grin') - 0.03) return f(SH.DATE_CU); if (t < e('j7') - 0.03) return f(SH.HER); if (t < e('moral') - 0.05) return f(SH.JUD); return f(SH.WIDE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'stamp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const pop = (t, t0) => eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
// o2: the top of his list (hand-written, English)
function listView(c, t) { backdrop(c, t, '#FFF1D6', '#F2B33D'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'list' });
  const t0 = ev('o2', 'list'), u = t - t0, k = pop(t, t0); c.save(); c.translate(540, 900); c.scale(k, k); c.rotate(-0.04);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-380 + 14, -560 + 18, 760, 1300); c.fillStyle = '#FFFDF8'; c.fillRect(-380, -560, 760, 1300);
  c.fillStyle = '#F4EAD8'; c.beginPath(); c.ellipse(0, -560, 400, 46, 0, 0, TAU); c.fill(); c.strokeStyle = '#B8A888'; c.lineWidth = 4; c.stroke();
  c.strokeStyle = '#9FC8E0'; c.lineWidth = 3; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(-340, -380 + i * 100); c.lineTo(340, -380 + i * 100); c.stroke(); }
  fitTxt(c, 'DATE REVIEW', 0, -450, 72, '#C0303A', 640);
  const rows = ['1. Pasta: great', '2. Dinner: a bit long', '3. Candle: too bright', '4. You laughed late', '5. Bread: not free'];
  rows.forEach((s, i) => { const kk = eOut(clamp((u - 0.25 - i * 0.2) / 0.2)); if (kk <= 0) return; c.save(); c.globalAlpha = kk; fitTxt(c, s, -320, -330 + i * 100, 54, '#2B2F3A', 640, 'Nun9', 'left'); c.restore(); });
  c.save(); c.globalAlpha = clamp((u - 1.2) / 0.2); fitTxt(c, '...', -320, 180, 70, '#2B2F3A', 200, 'Unb9', 'left'); c.restore();
  c.restore(); }
// o3: the scorecard close-up — the marker crosses out the 7 and writes an 8
function markerView(c, t) { backdrop(c, t, '#E2F4E6', '#4CAF6A'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'marker' });
  const t0 = ev('o3', 'draw'), u = t - t0, k = pop(t, t0), cross = clamp((u - 0.25) / 0.25), eight = clamp((u - 0.55) / 0.6), w = 250, h = 200;
  c.save(); c.translate(540, 880); c.scale(k * 3.2, k * 3.2); c.rotate(-0.03);
  c.fillStyle = '#A9744A'; rr(c, -11, h / 2, 22, 140, 8); c.fill();
  c.fillStyle = '#FFFDF8'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 16); c.fill(); c.stroke();
  UI.font(c, 'Unb9', h * 0.66); c.fillStyle = '#2B2F3A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7', eight > 0 || cross > 0 ? lerp(-w * 0.12, -w * 0.24, clamp(u / 0.25)) : -w * 0.12, h * 0.03);
  if (u < 0.25) { /* sliding aside */ }
  fitTxt(c, '/10', w * 0.33 + (u > 0.25 ? w * 0.07 : 0), h * 0.3, h * 0.16, '#2B2F3A', w * 0.2);
  if (cross > 0) { c.strokeStyle = '#2B2F3A'; c.lineWidth = h * 0.06; c.lineCap = 'round'; c.beginPath(); c.moveTo(-w * 0.4, -h * 0.25); c.lineTo(lerp(-w * 0.4, -w * 0.06, cross), lerp(-h * 0.25, h * 0.25, cross)); c.stroke(); }
  mark8(c, w * 0.18, 0, h * 0.62, eight);
  // the marker follows the pen tip
  let px, py; if (cross < 1) { px = lerp(-w * 0.4, -w * 0.06, cross); py = lerp(-h * 0.25, h * 0.25, cross); } else { const a = eight < 0.5 ? Math.PI / 2 + TAU * eight * 2 : -Math.PI / 2 - TAU * (eight * 2 - 1), r = eight < 0.5 ? h * 0.124 : h * 0.155, cy = eight < 0.5 ? -h * 0.136 : h * 0.143; px = w * 0.18 + Math.cos(a) * r; py = cy + Math.sin(a) * r; }
  if (u < 1.3) { c.save(); c.translate(px, py); c.rotate(-0.7); c.fillStyle = '#E0303A'; rr(c, -9, -110, 18, 100, 5); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -9, -120, 18, 20, 4); c.fill(); c.fillStyle = '#C02020'; c.beginPath(); c.moveTo(-6, -10); c.lineTo(6, -10); c.lineTo(0, 4); c.closePath(); c.fill(); c.restore(); }
  c.restore(); }
// twist: his phone — a video call with his mum (British, visiting from England), on the line all evening
const PS = 1.45, PY = 900, MUMS = 0.36, MUMX = 208, MUMY = 760;
function mumState(t) { const g = G.mum, st = { t, talk: talk('hismum4', t), mood: 'angry', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 330, { planar: true }), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330, { planar: true }), items: {} };
  const a = ev('end', 'ten'), b = ev('end', 'you');
  if (t < SP.end_m.t) { st.mood = 'skeptical'; st.items = { L: cupItem }; st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 230, { planar: true }); }
  if (t > SP.end_m.t) { st.mood = 'angry'; st.headY = Math.abs(Math.sin((t - SP.end_m.t) * 6)) * 6; }
  if (t > a - 0.1) { const k = eBack(clamp((t - a + 0.1) / 0.25), 1.6), fl = clamp((t - b) / 0.3); st.mood = fl > 0 ? 'annoyed' : 'happy'; st.armR = reach(g, 1, lerp(g.sw * 0.6, g.sw * 1.2, k), lerp(g.ySh + 330, g.ySh - 60, k), { planar: true }); st.items = { R: padItem('10', { txt2: '7', flip: fl, s: 0.95 }) }; }
  if (t > b) { st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 60, { planar: true }); }   // open palm toward the camera (at him)
  if (t > endOf('end_m') + 0.1) { st.mood = 'smug'; st.blink = 1; }
  return st; }
const cupItem = ctx => { ctx.save(); ctx.translate(0, -30); paint(ctx, q => { q.m(-40, -40); q.l(40, -40); q.l(32, 30); q.l(-32, 30); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(46, -6, 18, -1.2, 1.2); ctx.stroke(); ctx.fillStyle = '#3E6FB0'; ctx.fillRect(-36, -14, 72, 12); ctx.restore(); };
function unionJack(c, x, y, w, h) { c.save(); c.translate(x, y); c.fillStyle = '#1F3E8A'; c.fillRect(-w / 2, -h / 2, w, h); c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = h * 0.22; c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, h / 2); c.moveTo(w / 2, -h / 2); c.lineTo(-w / 2, h / 2); c.stroke();
  c.strokeStyle = '#C8202E'; c.lineWidth = h * 0.08; c.stroke(); c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2, -h * 0.17, w, h * 0.34); c.fillRect(-w * 0.1, -h / 2, w * 0.2, h); c.fillStyle = '#C8202E'; c.fillRect(-w / 2, -h * 0.1, w, h * 0.2); c.fillRect(-w * 0.06, -h / 2, w * 0.12, h); c.restore(); c.restore(); }
let MUMHEAD = null;
function callScreen(q, w, h, t) { // a video call: mum in a guest room (floral wallpaper, suitcase with a flag sticker), call timer
  q.fillStyle = '#F2E2CC'; q.fillRect(0, 0, w, h); q.fillStyle = 'rgba(200,120,140,.35)'; for (let y = 20; y < h; y += 70) for (let x = (y / 70 % 2) * 35; x < w; x += 70) { q.beginPath(); q.arc(x, y, 12, 0, TAU); q.fill(); }
  q.fillStyle = '#8AB8D8'; rr(q, 250, 120, 140, 200, 8); q.fill(); q.strokeStyle = '#FFFDF8'; q.lineWidth = 8; q.strokeRect(250, 120, 140, 200); q.beginPath(); q.moveTo(320, 120); q.lineTo(320, 320); q.stroke();   // window
  q.fillStyle = '#8A2A2A'; rr(q, 290, 520, 110, 150, 12); q.fill(); unionJack(q, 345, 590, 70, 44);   // suitcase
  q.save(); q.translate(MUMX, MUMY); q.scale(MUMS, MUMS); const r = K.put(q, MUM, mumState(t), 0, 0); q.restore(); MUMHEAD = { x: MUMX + (r.x) * MUMS, y: MUMY + r.y * MUMS, hh: r.hh * MUMS };
  // call chrome
  q.fillStyle = 'rgba(20,20,30,.55)'; q.fillRect(0, 0, w, 110); camIcon(q, 40, 56, 0.7, '#FFFFFF'); fitTxt(q, 'MOM', 78, 44, 40, '#FFFFFF', 200, 'Unb9', 'left');
  const s0 = 72 * 60 + 47 + Math.floor(Math.max(0, t - ev('end', 'phone'))), hh_ = Math.floor(s0 / 3600), mm = Math.floor(s0 / 60) % 60, ss = s0 % 60; fitTxt(q, `${hh_}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 78, 84, 28, '#7FE08A', 200, 'Nun9', 'left');
  q.fillStyle = '#E0303A'; q.beginPath(); q.arc(w - 50, 56, 16, 0, TAU); q.fill(); fitTxt(q, 'LIVE', w - 110, 56, 24, '#FFFFFF', 80, 'Unb9');
  // his own little self-view (pocket = dark)
  q.fillStyle = '#1A1E26'; rr(q, w - 130, h - 210, 110, 160, 14); q.fill(); q.strokeStyle = '#FFFFFF'; q.lineWidth = 3; q.stroke(); fitTxt(q, 'pocket', w - 75, h - 130, 18, 'rgba(255,255,255,.6)', 100, 'Nun9');
  q.fillStyle = '#E0303A'; q.beginPath(); q.arc(w / 2, h - 60, 36, 0, TAU); q.fill(); q.save(); q.translate(w / 2, h - 60); q.rotate(2.36); handset(q, 0, 0, 0.55, '#FFFFFF'); q.restore(); }
function callView(c, t) { backdrop(c, t, '#F7D0DC', '#E8A0B8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'call' });
  const t0 = ev('end', 'phone'), k = pop(t, t0); K.phone(c, 540, PY, PS * k, (q, w, h) => callScreen(q, w, h, t), 0); }
const mumHeadScreen = () => MUMHEAD ? { x: 540 + PS * (-208 + MUMHEAD.x), y: PY + PS * (-370 + MUMHEAD.y), hh: MUMHEAD.hh * PS } : OFF;
const VIEWS = { 'ui:list': listView, 'ui:marker': markerView, 'ui:call': callView };

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.3, 2.55); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 250); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 85, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question (ask)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Liam with his «10» (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gl = geom(LIAM);
    K.put(c, LIAM, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { L: padItem('10/10', { s: 0.9 }) }, armL: reach(gl, -1, -gl.sw * 1.25, gl.ySh - 70, { planar: true }), armR: reach(gl, 1, gl.sw * 1.7, gl.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.25, g.ySh + 200, { planar: true }), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const swap = eIO(P(t, ask.t - 0.15, ask.t + 0.15));
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const q2 = eBack(P(t, ask.t, ask.t + 0.3), 2.2); if (q2 > 0) { c.save(); c.translate(540, 290); c.scale(q2, q2); c.rotate(-0.02);
    c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -470 + 8, -200 + 12, 940, 400, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -470, -200, 940, 400, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 72, 'СКОЛЬКО БЫ', 600); c.fillStyle = C.oliveD; c.fillText('СКОЛЬКО БЫ', -110, -110);
    textFit(c, 'Unb9', 92, 'ТЫ ЕМУ', 600); strokeText(c, 'ТЫ ЕМУ', -110, -10, C.pink, C.white, 12);
    textFit(c, 'Unb9', 64, 'ПОСТАВИЛА?', 600); c.fillStyle = C.oliveD; c.fillText('ПОСТАВИЛА?', -110, 100);
    c.save(); c.translate(335, 110); c.rotate(0.08 * Math.sin(t * 3)); paddle(c, 0.62, '?/10'); c.restore(); c.restore(); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 640 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1040); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 0.9), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1230;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < ask.t - 0.1) { c.save(); c.translate(0, -60); UI.captions(c, t); c.restore(); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { VIEWS[tag](c, t); heads = { her: OFFL, date5: OFF, hismum4: tag === 'ui:call' ? mumHeadScreen() : OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { date5: ['LIAM', '#2F3E5C'], hismum4: ['MOM', '#3E6FB0'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_d: -0.05, o1_h: -0.15, o1_d: -0.1, o2_h: -0.12, o2_d: -0.1, o3_h: -0.12, o3_d: -0.1, o4_h: -0.12, o4_d: 0.1, end_m: -0.12 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('seventen', NF, renderFrame);
