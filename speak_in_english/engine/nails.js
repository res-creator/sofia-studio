// "Парень спрашивает, сколько стоил маникюр" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node nails.js start end out.mp4 | --png=f1,f2
// A cosy living room: the heroine (pink jumper) on the left admires her fresh glossy pink nails; her boyfriend (glasses, green jumper) on the right
// leans in with a calculator. A new fishing rod with a price tag leans in the right corner. Sofa, window, floor lamp, picture.
// hook: his squinting close-up (calculator beeps), insert of her nails on «маникюр», wide on «Четыре ответа».
// o1 «В ЛОБ»: "It's OUR money! We have a spreadsheet!" — he unrolls a spreadsheet down to the floor and across it; insert of the rows (NAILS ???); facepalm.
// o2 «ВЕЖЛИВО»: "'Not much' isn't a number." — he taps the calculator with a pen; insert: display NOT MUCH -> ERROR; she rolls her eyes.
// o3 «КАК НОСИТЕЛЬ»: "...Fair enough. They do look great." — he puts the calculator away into his pocket and smiles; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: in the pause after "...fishing rod." insert of the rod with its big price tag; on "compliments" she shows her nails (sparkles);
//   "...The rod caught a boot once." — insert: his phone photo of a wet boot on the hook.
// Twist (music silent): she squints at his hands, he whips them behind his back; "...Okay. Same salon." — he shows his own glossy navy manicure;
//   insert of his hands; she laughs; moral: both show their nails. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/nails/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift };
const BF = { ...BASE.oliver, watch: null, glasses: { col: '#2B2F3A' }, hair: { style: 'short', col: '#6A4A2E' }, brow: '#4A3220',
  top: { type: 'sweater', col: '#5E8C6A' }, bottom: { type: 'trousers', col: '#4A5468' }, shoes: { col: '#3A2A20', acc: null } };
const G = { her: geom(HER), bf9: geom(BF) };
const X = { her: -330, bf: 330 };
const RODX = 820;                                                      // the fishing rod leans in the corner (base x)
const PINK = '#FF5FA2', NAVY = '#24306E';
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function star4(c, x, y, r, col = '#FFFFFF', a = 1) { if (r <= 0 || a <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = col; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); c.restore(); }
function sparkleBurst(c, t, x, y, R, k, n = 5, col = '#FFF6B0') { if (k <= 0) return; for (let i = 0; i < n; i++) { const a = i * 2.4 + 0.5, ph = (t * 2.2 + i * 0.37) % 1, r = R * (0.45 + 0.55 * ((i * 37) % 10) / 10);
  star4(c, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, R * 0.22 * Math.sin(ph * Math.PI) * k, col, k); } }

// ---------------- props
// nails on the in-world mitten hand: drawn over the hand (origin = wrist, local +y towards the fingertips)
const handR = (g, A, h) => { const near = 1 + 0.35 * (1 - Math.min(1, A.fl ?? 1)); return h * 0.021 * near * 1.06; };
function nailsOver(col, r, glitter = false) { return (ctx, ha, side) => { ctx.save(); ctx.rotate(ha - Math.PI / 2); ctx.scale(side < 0 ? -1 : 1, 1);
  for (const [fx, fy] of [[-0.42, 1.2], [-0.05, 1.33], [0.32, 1.27]]) { ctx.fillStyle = col; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(fx * r, fy * r, r * 0.15, r * 0.12, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(fx * r - r * 0.04, fy * r - r * 0.03, r * 0.05, r * 0.035, 0, 0, TAU); ctx.fill();
    if (glitter) { ctx.fillStyle = '#F2C14E'; ctx.beginPath(); ctx.arc(fx * r + r * 0.05, fy * r + r * 0.03, r * 0.03, 0, TAU); ctx.fill(); } }
  ctx.restore(); }; }
// calculator; (0,0) = centre; s = scale (world 1 = 130 x 190)
function calcDraw(c, s = 1, disp = '0.', dispCol = '#2B3A2B', t = 0) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -65 + 5, -95 + 7, 130, 190, 16); c.fill();
  c.fillStyle = '#3E4756'; c.strokeStyle = '#1E232C'; c.lineWidth = 4; rr(c, -65, -95, 130, 190, 16); c.fill(); c.stroke();
  c.fillStyle = '#BFD8B0'; rr(c, -52, -82, 104, 44, 6); c.fill();
  if (disp) { c.save(); c.font = '30px Unb9'; let w = c.measureText(disp).width; const fs_ = w > 92 ? 30 * 92 / w : 30; c.font = `${fs_}px Unb9`; c.fillStyle = dispCol; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(disp, 46, -59); c.restore(); }
  for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { c.fillStyle = q === 3 ? '#F28C28' : r === 0 ? '#9AA6B4' : '#E9EDF1'; rr(c, -52 + q * 27, -28 + r * 29, 22, 22, 5); c.fill(); }
  c.restore(); }
const calcItem = (disp = '0.', k = 1) => ({ under: (ctx, ha, side) => { if (k <= 0) return; ctx.save(); ctx.translate(side * 10, -28); calcDraw(ctx, 0.95 * k, disp); ctx.restore(); } });
const penItem = () => ({ over: (ctx, ha, side) => { ctx.save(); ctx.rotate(ha - Math.PI / 2); ctx.fillStyle = '#2E5AA8'; ctx.strokeStyle = '#1A2A50'; ctx.lineWidth = 3; rr(ctx, -6, 10, 12, 95, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#C9D2DA'; ctx.beginPath(); ctx.moveTo(-6, 105); ctx.lineTo(6, 105); ctx.lineTo(0, 124); ctx.closePath(); ctx.fill(); ctx.restore(); } });
const phoneItem = () => ({ over: (ctx, ha, side) => { ctx.save(); ctx.translate(side * 6, -40); ctx.fillStyle = '#2B2F3A'; rr(ctx, -42, -80, 84, 150, 14); ctx.fill(); ctx.fillStyle = '#7FC4E8'; rr(ctx, -34, -70, 68, 128, 8); ctx.fill(); ctx.fillStyle = '#7A4A2A'; rr(ctx, -16, -20, 30, 36, 6); ctx.fill(); ctx.restore(); } });
const combo = (...fs_) => ({ under: (ctx, ha, side) => fs_.forEach(f => f && f.under && f.under(ctx, ha, side)), over: (ctx, ha, side) => fs_.forEach(f => f && (f.over ? f.over(ctx, ha, side) : (typeof f === 'function' ? f(ctx, ha, side) : 0))) });
// the fishing rod (world, leaning in the corner) + its price tag
function rod(c, t, x0 = RODX) { c.save(); c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; c.lineWidth = 26; c.beginPath(); c.moveTo(x0, -20); c.lineTo(x0 + 60, -420); c.stroke();
  c.lineWidth = 14; c.strokeStyle = '#3A6FB0'; c.beginPath(); c.moveTo(x0 + 60, -420); c.lineTo(x0 - 120, -2350); c.stroke();
  c.fillStyle = '#C9D2DA'; c.strokeStyle = '#5A606E'; c.lineWidth = 5; c.beginPath(); c.arc(x0 + 80, -330, 46, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#5A606E'; c.beginPath(); c.arc(x0 + 80, -330, 14, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + 80, -330); c.lineTo(x0 - 120, -2350); c.stroke();
  for (const u of [0.3, 0.55, 0.8]) { const yx = lerp(x0 + 60, x0 - 120, u), yy = lerp(-420, -2350, u); c.strokeStyle = '#C9D2DA'; c.lineWidth = 5; c.beginPath(); c.arc(yx + 10, yy, 12, 0, TAU); c.stroke(); }
  // price tag on a string, swinging a little
  const tx = lerp(x0 + 60, x0 - 120, 0.22), ty = lerp(-420, -2350, 0.22), sw = Math.sin(t * 2.2) * 0.08;
  c.save(); c.translate(tx, ty); c.rotate(sw); c.strokeStyle = '#8A6A4A'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(-60, 130); c.stroke(); c.translate(-60, 130); c.rotate(-0.25);
  c.fillStyle = '#FFE15A'; c.strokeStyle = '#B8902A'; c.lineWidth = 5; c.beginPath(); c.moveTo(-70, 0); c.lineTo(70, 0); c.lineTo(70, 160); c.lineTo(-70, 160); c.closePath(); c.fill(); c.stroke(); fitTxt(c, '$450', 0, 82, 58, '#C8383E', 120); c.restore();
  c.restore(); K.mark(c, 'rod', x0 - 20, -1300, 300); }
// the spreadsheet: rolled tube between his hands, the paper falls to the floor and runs across it towards her
function sheetPaper(c, x0, x1, y0, len, w = 250) { // vertical part from y0 down to the floor, then along the floor to the left
  const vert = Math.min(len, -y0), flat = Math.max(0, len - vert);
  c.save(); c.fillStyle = 'rgba(0,0,0,.15)'; if (flat > 0) { c.fillRect(x0 - flat - w / 2 + 10, 8, flat + w / 2, 34); }
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#9AA6B4'; c.lineWidth = 4; c.fillRect(x0 - w / 2, y0, w, vert); c.strokeRect(x0 - w / 2, y0, w, vert);
  c.strokeStyle = '#C9DCD0'; c.lineWidth = 3; for (let y = y0 + 40; y < y0 + vert; y += 46) { c.beginPath(); c.moveTo(x0 - w / 2, y); c.lineTo(x0 + w / 2, y); c.stroke(); }
  c.beginPath(); c.moveTo(x0 + 30, y0); c.lineTo(x0 + 30, y0 + vert); c.stroke();
  c.fillStyle = '#9AA6B4'; for (let y = y0 + 52, i = 0; y < y0 + vert - 10; y += 46, i++) { c.fillRect(x0 - w / 2 + 16, y, 60 + (i * 37) % 70, 12); c.fillRect(x0 + 48, y, 40 + (i * 23) % 40, 12); }
  if (flat > 0) { // on the floor (slightly foreshortened)
    c.fillStyle = '#FFFFFF'; c.strokeStyle = '#9AA6B4'; c.beginPath(); c.moveTo(x0 + w / 2, -6); c.lineTo(x0 - w / 2 - flat, -6); c.lineTo(x0 - w / 2 - flat - 20, 34); c.lineTo(x0 + w / 2 + 14, 34); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#C9DCD0'; c.lineWidth = 3; for (let x = x0 - w / 2 - 40; x > x0 - w / 2 - flat; x -= 46) { c.beginPath(); c.moveTo(x, -6); c.lineTo(x - 6, 34); c.stroke(); }
    c.fillStyle = '#F2F5F7'; c.strokeStyle = '#9AA6B4'; c.beginPath(); c.ellipse(x0 - w / 2 - flat - 10, 14, 26, 24, 0, 0, TAU); c.fill(); c.stroke(); }
  c.restore(); }
function tube(c, x, y, w = 300) { c.save(); c.fillStyle = '#FFFFFF'; c.strokeStyle = '#9AA6B4'; c.lineWidth = 5; rr(c, x - w / 2, y - 30, w, 60, 30); c.fill(); c.stroke(); c.strokeStyle = '#C9DCD0'; c.lineWidth = 3; for (const d of [-0.3, 0, 0.3]) { c.beginPath(); c.moveTo(x + d * w, y - 28); c.lineTo(x + d * w, y + 28); c.stroke(); } c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }

// ---------------- the living room (prerendered, softly blurred)
const BX0 = -3200, BY0 = -4400, BW = 7000, BH = 6400, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F4E2CF'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#FBF4EA'; c.fillRect(BX0, BY0, BW, -2620 - BY0); c.fillStyle = '#E6D2B8'; c.fillRect(BX0, -2640, BW, 40);
  // wallpaper stripes + wainscot
  c.fillStyle = 'rgba(255,255,255,.28)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, -2600, 90, 1700);
  c.fillStyle = '#E9D2B6'; c.fillRect(BX0, -900, BW, 900); c.fillStyle = '#D9BE9C'; c.fillRect(BX0, -920, BW, 30);
  c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 6; for (let x = BX0 + 100; x < BX0 + BW; x += 420) c.strokeRect(x, -820, 320, 680);
  // window (left)
  c.fillStyle = '#FFFFFF'; c.fillRect(-1700, -2250, 760, 900); c.fillStyle = '#A8D8F0'; c.fillRect(-1660, -2210, 680, 820); c.fillStyle = '#FFFFFF'; c.fillRect(-1330, -2210, 22, 820); c.fillRect(-1660, -1820, 680, 18);
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(-1500, -2080, 60, 0, TAU); c.arc(-1430, -2100, 72, 0, TAU); c.fill();
  c.fillStyle = '#E88AA8'; c.beginPath(); c.moveTo(-1760, -2300); c.lineTo(-1600, -2300); c.quadraticCurveTo(-1640, -1800, -1580, -1300); c.lineTo(-1780, -1300); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-880, -2300); c.lineTo(-1040, -2300); c.quadraticCurveTo(-1000, -1800, -1060, -1300); c.lineTo(-860, -1300); c.closePath(); c.fill();
  // framed picture (a sunset) above the sofa
  c.fillStyle = '#C9A060'; c.fillRect(-330, -2160, 560, 400); c.fillStyle = '#FBE2B8'; c.fillRect(-300, -2130, 500, 340); c.fillStyle = '#F2A65A'; c.beginPath(); c.arc(-50, -1880, 80, Math.PI, 0); c.fill(); c.fillStyle = '#7FB0D8'; c.fillRect(-300, -1880, 500, 90);
  // sofa (behind the people)
  paint(c, q => { q.m(-1050, -330); q.l(1050, -330); q.l(1050, -1000); q.q(1050, -1060, 990, -1060); q.l(-990, -1060); q.q(-1050, -1060, -1050, -1000); q.z(); }, '#4E9A94', { sd: 8, hd: 4, lw: 4 });
  for (const x0 of [-1000, 0]) paint(c, q => { q.m(x0 + 30, -520); q.l(x0 + 970, -520); q.l(x0 + 970, -330); q.l(x0 + 30, -330); q.z(); }, '#5CB0A8', { sd: 6, hd: 3, lw: 4 });
  for (const s of [-1, 1]) paint(c, q => { q.m(s * 1050, -130); q.l(s * 1230, -130); q.l(s * 1230, -760); q.q(s * 1140, -820, s * 1050, -760); q.z(); }, '#448A84', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#2B2F3A'; for (const x of [-1180, 1180]) c.fillRect(x - 15, -130, 30, 110);
  paint(c, q => { q.m(-820, -540); q.l(-480, -560); q.l(-470, -820); q.l(-830, -800); q.z(); }, '#F2C14E', { sd: 4, hd: 2, lw: 4 });   // cushion
  // floor lamp (left) + plant (far right)
  c.fillStyle = '#5A606E'; c.fillRect(-1900, -1700, 18, 1690); c.fillRect(-1990, -30, 200, 26); paint(c, q => { q.m(-2020, -1700); q.l(-1760, -1700); q.l(-1820, -1960); q.l(-1960, -1960); q.z(); }, '#FFF0C8', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = 'rgba(255,240,180,.25)'; c.beginPath(); c.arc(-1890, -1650, 320, 0, TAU); c.fill();
  c.fillStyle = '#C8784C'; rr(c, 1480, -330, 240, 320, 20); c.fill(); c.fillStyle = '#4E9A4A'; for (const [dx, dy, r] of [[0, -420, 140], [-110, -560, 110], [110, -580, 120], [0, -720, 110]]) { c.beginPath(); c.arc(1600 + dx, dy, r, 0, TAU); c.fill(); }
  // floor + rug
  c.fillStyle = '#C9A57E'; c.fillRect(BX0, -10, BW, BY0 + BH + 10); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -10; y < BY0 + BH; y += 120) c.fillRect(BX0, y, BW, 6);
  c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(BX0, -20, BW, 14);
  c.fillStyle = '#E89AA0'; c.beginPath(); c.ellipse(0, 120, 1300, 150, 0, 0, TAU); c.fill(); c.strokeStyle = '#FFF0E6'; c.lineWidth = 14; c.beginPath(); c.ellipse(0, 120, 1180, 120, 0, 0, TAU); c.stroke();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hip = (g, s) => reach(g, s, s * g.sw * 0.95, g.ySh + 470, { planar: true });
const behind = (g, s) => reach(g, s, s * g.sw * 0.35, g.ySh + 430, { planar: true });
const show = (g, s, k = 1.15, dy = -10, w = 0) => reach(g, s, s * g.sw * k + w, g.ySh + dy, { planar: true });   // hand up at shoulder height, back of the hand to camera (nails)
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
// put her nails on whatever her hands do
function herNails(st, g) { for (const [s, k] of [[-1, 'L'], [1, 'R']]) { const A = s < 0 ? st.armL : st.armR, nv = nailsOver(PINK, handR(g, A, HER.h)); st.items[k] = st.items[k] ? combo(st.items[k], nv) : nv; } return st; }
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'neutral', turn: 0.25, look: 0.7 };
  if (L === 'hook') { st.mood = 'happy'; st.blink = 0.5; st.headFirst = true; st.look = 0.35; st.lookY = 0.1; st.armL = hip(g, -1); st.armR = show(g, 1, 1.55, 40 + Math.sin(t * 3) * 10, Math.sin(t * 2.5) * 14);
    if (t > hev('nar') + 0.4) { st.mood = 'annoyed'; st.blink = 0; st.look = 0.75; st.lookY = 0; }
    if (t > hev('wide')) { st.mood = 'angry'; st.armR = hip(g, 1); st.headFirst = false; } }
  if (L === 'o1') { st.mood = 'angry'; st.armL = hip(g, -1); st.armR = hip(g, 1);
    if (speaking('o1_h', t, 0.05, 0.15)) { st.armL = open(g, -1, 2.0, 40 + Math.sin(t * 9) * 25); st.armR = reach(g, 1, g.sw * 2.1, g.ySh + 60 + Math.sin(t * 9) * 20, { planar: true }); }
    if (t > SP.o1_b.t) { st.mood = 'surprised'; st.armL = hip(g, -1); st.armR = hip(g, 1); }
    if (t > e('unroll') + 0.2) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.5; st.look = 0.4; st.armL = open(g, -1, 1.4, 120); st.armR = open(g, 1, 1.4, 120); }
    if (t > e('palm')) { st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armR = forehead(g, 1); st.armL = hip(g, -1); st.headY = 6; st.look = 0; st.turn = 0.1; st.lookY = 0; } }
  if (L === 'o2') { st.mood = 'worried'; st.armL = hold(g, -1, 330, 0.25); st.armR = hold(g, 1, 330, 0.25); st.look = 0.2; st.lookY = 0.3;
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'worried'; st.look = -0.3 + 0.2 * Math.sin(t * 3); st.lookY = 0.2; st.tilt = 0.05; }
    if (t > SP.o2_b.t) { st.mood = 'surprised'; st.look = 0.7; st.lookY = 0; st.tilt = 0; }
    if (t > e('roll')) { st.mood = 'annoyed'; st.blink = 0.55; st.lookY = -0.9; st.look = 0.2; st.turn = 0.15; st.armL = hip(g, -1); st.armR = hip(g, 1); } }
  if (L === 'o3') { st.mood = 'smug'; st.armL = hip(g, -1); st.armR = hip(g, 1);
    if (speaking('o3_h', t, 0.05, 0.15)) { const u = t - SP.o3_h.t; st.mood = 'smug'; st.blink = 0.4; st.tilt = -0.05; st.headFirst = true; st.armR = show(g, 1, 1.55, 40 + Math.sin(u * 4) * 8); }
    if (t > SP.o3_b.t) { st.mood = 'happy'; st.blink = 0; st.tilt = 0; st.armR = hip(g, 1); st.headFirst = false; }
    if (t > e('smile')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; }
    if (t > SP.o3_nar.t) { st.laugh = false; st.blink = 0; } }
  if (L === 'o4') { st.mood = 'smug'; st.armL = hip(g, -1); st.armR = hip(g, 1);
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t; st.mood = 'happy'; st.look = 0.8;
      if (t < e('rod')) { st.armR = reach(g, 1, g.sw * (1.8 + 0.15 * Math.sin(u * 3)), g.ySh + 120 + Math.cos(u * 3) * 25, { planar: true }); }   // open palm towards the rod
      else if (t < e('show')) { st.mood = 'smug'; st.blink = 0.4; }
      else { st.mood = 'happy'; st.blink = 0.3; st.headFirst = true; st.look = 0.3; const w = Math.sin(clamp((t - e('show')) / 0.3) * Math.PI) * 30; st.armL = show(g, -1, 1.6, 40, -w); st.armR = show(g, 1, 1.6, 40, w); } }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; st.headFirst = true; st.armL = show(g, -1, 1.6, 40); st.armR = show(g, 1, 1.6, 40); }
    if (t > SP.o4_b.t + 0.2) { st.headFirst = false; st.armL = hip(g, -1); st.armR = hip(g, 1); st.mood = 'surprised'; st.blink = 0; } }
  if (L === 'end') { st.mood = 'neutral'; st.armL = hip(g, -1); st.armR = hip(g, 1);
    if (t > e('look')) { st.mood = 'annoyed'; st.blink = 0.55; st.lookY = 0.55; st.look = 0.8; }
    if (t > SP.end_b.t) { st.lookY = 0.1; st.blink = 0.3; }
    if (t > e('reveal')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.3; st.armL = open(g, -1, 1.4, 100); st.armR = open(g, 1, 1.4, 100); }
    if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armL = open(g, -1, 1.6, 40 + Math.sin(t * 10) * 15); st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 380, { planar: true }); st.headFirst = false; }
    if (t > e('both')) { st.laugh = false; st.mood = 'smug'; st.blink = 0.3; st.look = 0.5; st.headFirst = true; st.armL = hip(g, -1); st.armR = show(g, 1, 1.6, 40, Math.sin(t * 2.5) * 10); } }
  return herNails(st, g); }
function bfState(t, L) { const g = G.bf9, e = k => ev(L, k), st = { ...base(g, t, 'bf9'), mood: 'neutral', turn: -0.25, look: -0.7 };
  const calcL = (disp, k = 1) => { st.armL = hold(g, -1, 300, 0.35); st.items.L = calcItem(disp, k); };
  const penR = (tap = 0) => { st.armR = reach(g, 1, -g.sw * 0.2 + 20, g.ySh + 230 + tap, { planar: true }); st.items.R = penItem(); };
  if (L === 'hook') { calcL('0.'); st.mood = 'annoyed'; st.blink = 0.5; st.lean = -0.3; st.look = -0.8;
    st.armR = reach(g, 1, g.sw * 0.1, g.ySh + 270 - (t > hev('tap') && t < hev('tap') + 0.5 ? Math.abs(Math.sin((t - hev('tap')) * 25)) * 20 : 0), { planar: true });
    if (speaking('hook_b', t, 0.05, 0.1)) { st.mood = t < 1.2 ? 'smug' : 'annoyed'; }
    if (t > hev('nar') - 0.1) { st.armL = hold(g, -1, 140, 0.35); st.mood = 'annoyed'; st.blink = 0.6; st.lookY = 0.3; st.items.L = calcItem(t > hev('nar') + 0.8 ? '45.00' : t > hev('nar') + 0.3 ? '45' : '4'); st.armR = reach(g, 1, g.sw * 0.1, g.ySh + 110 - Math.abs(Math.sin(t * 18)) * 18 * (t < hev('nar') + 1.0 ? 1 : 0), { planar: true }); }
    if (t > hev('wide')) { st.lean = 0; st.lookY = 0; st.items.L = calcItem('???'); } }
  if (L === 'o1') { st.mood = 'neutral'; const hy = g.ySh + 260;
    st.armL = reach(g, -1, -150, hy, { planar: true }); st.armR = reach(g, 1, 150, hy, { planar: true });
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_b', t, 0.05, 0.1)) { st.mood = 'angry'; }
    if (t > e('unroll')) { const k = eBack(clamp((t - e('unroll')) / 0.3), 2); st.armL = reach(g, -1, -150, hy - 160 * k, { planar: true }); st.armR = reach(g, 1, 150, hy - 160 * k, { planar: true }); st.mood = 'smug'; st.blink = 0.3; }
    if (t > SP.o1_nar.t) { st.mood = 'smug'; st.laugh = false; } }
  if (L === 'o2') { calcL('0.'); penR(); st.mood = 'neutral';
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o2_b.t - 0.05) { st.mood = 'annoyed'; st.blink = 0.4; st.items.L = calcItem('?'); }
    if (t > e('tap') && t < e('tap') + 0.6) { penR(-Math.abs(Math.sin((t - e('tap')) * 17)) * 26); }
    if (t > e('roll')) { st.mood = 'smug'; st.items.L = calcItem('ERROR'); } }
  if (L === 'o3') { calcL('0.'); st.mood = 'neutral'; st.armR = reach(g, 1, g.sw * 0.1, g.ySh + 270, { planar: true });
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.o3_b.t - 0.05) { st.mood = 'worried'; st.tilt = 0.06; st.lookY = 0.1; }
    if (t > SP.o3_b.t + 0.9) { st.mood = 'happy'; st.tilt = 0; }
    if (t > e('away')) { const k = clamp((t - e('away')) / 0.45); st.armL = reach(g, -1, lerp(-g.sw * 0.35, -g.sw * 0.95, k), lerp(g.ySh + 300, g.ySh + 520, k), { planar: true }); st.items.L = calcItem('0.', 1 - clamp((k - 0.6) / 0.4)); st.mood = 'happy'; }
    if (t > e('smile')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.items = {}; st.armL = down(g, -1); st.armR = open(g, 1, 1.6, 60); }
    if (t > SP.o3_nar.t) { st.laugh = false; st.blink = 0; st.armR = down(g, 1); } }
  if (L === 'o4') { calcL('0.'); st.armR = reach(g, 1, g.sw * 0.1, g.ySh + 270, { planar: true }); st.mood = 'neutral';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > e('rod') ? 'worried' : 'surprised'; if (t > e('comp')) st.mood = 'shock'; }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; }
    if (t > SP.o4_b.t - 0.1) { st.mood = 'sad'; st.tilt = 0.06; st.lookY = 0.1; }
    if (t > SP.o4_b.t + 0.6) { st.mood = 'happy'; st.tilt = 0; st.items.R = phoneItem(); st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 40 + 80 * (1 - eOut(clamp((t - SP.o4_b.t - 0.6) / 0.3))), { planar: true }); } }
  if (L === 'end') { st.mood = 'neutral'; st.armL = down(g, -1); st.armR = down(g, 1);
    if (t > e('look') + 0.2) { st.mood = 'worried'; st.blink = 0; }
    if (t > e('hide')) { st.behind = true; st.armL = behind(g, -1); st.armR = behind(g, 1); st.mood = 'worried'; st.lookY = -0.5; st.look = -0.2; st.turn = -0.1; }
    if (t > SP.end_b.t) { st.mood = 'sad'; st.lookY = 0.2; st.look = -0.5; }
    if (t > e('reveal')) { st.behind = false; const k = eBack(clamp((t - e('reveal')) / 0.3), 1.8); st.armL = show(g, -1, lerp(0.35, 1.5, k), lerp(430, 50, k)); st.armR = show(g, 1, lerp(0.35, 1.5, k), lerp(430, 50, k)); st.headFirst = true; st.mood = 'happy'; st.blink = 0.3; st.look = -0.3; }
    if (t > SP.end_b.t + 2.0) { st.mood = 'smug'; st.blink = 0.5; }
    if (t > e('both')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armR = down(g, 1); st.armL = show(g, -1, 1.6, 40, -Math.sin(t * 2.5) * 10); } }
  if (L === 'end' && t > e('reveal')) for (const [s, k] of [[-1, 'L'], [1, 'R']]) { const A = s < 0 ? st.armL : st.armR; st.items[k] = nailsOver(NAVY, handR(g, A, BF.h), true); }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'bf9'], cover: ['her', 'bf9'], two: ['her', 'bf9'], her: ['her'], bf: ['bf9'], three: ['her', 'bf9'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function sheetLen(t, L) { if (L !== 'o1' || t < ev('o1', 'unroll')) return 0; const u = t - ev('o1', 'unroll'); return 2600 * eOut(clamp(u / 0.9)); }
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'bf9'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); rod(c, t);
  if (who.includes('bf9')) { const st = bfState(t, L), g = G.bf9;
    if (st.behind) { K.put(c, BF, st, X.bf, 0); heads.bf9 = K.put(c, BF, { ...st, noArms: true, floorShadow: false }, X.bf, 0); }
    else heads.bf9 = K.put(c, BF, st, X.bf, 0);
    if (L === 'o1') { const ty = g.ySh + 260 - (t > ev('o1', 'unroll') ? 160 * eBack(clamp((t - ev('o1', 'unroll')) / 0.3), 2) : 0), len = sheetLen(t, L); if (len > 0) sheetPaper(c, X.bf, X.bf, ty, len); tube(c, X.bf, ty); } }
  if (who.includes('her')) { const st = herState(t, L); heads.her = K.put(c, HER, st, X.her, 0);
    // sparkles on her nails whenever she shows them
    const showing = (L === 'hook' && t < hev('nar') + 0.4) || (L === 'o3' && speaking('o3_h', t)) || (L === 'o4' && t > ev('o4', 'show') && t < SP.o4_b.t + 0.2) || (L === 'end' && t > ev('end', 'both'));
    if (showing) { const g = G.her; sparkleBurst(c, t, X.her + g.sw * 1.6, g.ySh + 100, 120, 1, 5); if (L === 'o4') sparkleBurst(c, t + 0.4, X.her - g.sw * 1.6, g.ySh + 100, 120, 1, 5); } }
  if (L === 'end' && heads.bf9 && t > ev('end', 'reveal')) { const g = G.bf9; sparkleBurst(c, t, X.bf - g.sw * 1.5, g.ySh + 110, 130, clamp((t - ev('end', 'reveal')) / 0.3), 5, '#FFE15A'); sparkleBurst(c, t + 0.3, X.bf + g.sw * 1.5, g.ySh + 110, 130, clamp((t - ev('end', 'reveal')) / 0.3), 5, '#FFE15A'); }
  if (L === 'end' && heads.bf9 && t > ev('end', 'hide') && t < ev('end', 'reveal')) sweat(c, heads.bf9, t, clamp((t - ev('end', 'hide')) / 0.3));
  if (L === 'o4' && heads.bf9 && t > ev('o4', 'rod') && t < SP.o4_b.t) sweat(c, heads.bf9, t, clamp((t - ev('o4', 'back')) / 0.3));
  if (!heads.her) heads.her = OFFL; if (!heads.bf9) heads.bf9 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(20, fy(HY('bf9'), 0.56, 960), 0.56, 'cover'), WIDE: S(60, fy(HY('bf9'), 0.47, 860), 0.47, 'wide'),
  TWO: S((X.her + X.bf) / 2 + 20, fy(HY('bf9'), 0.72, 860), 0.72, 'two'), TWO_LO: S((X.her + X.bf) / 2 - 80, fy(HY('bf9'), 0.6, 760), 0.6, 'two'),
  HER: S(X.her + 30, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.15, 880), 1.15, 'her'),
  BF: S(X.bf + 40, fy(HY('bf9'), 0.95), 0.95, 'bf'), BF_CU: S(X.bf + 10, fy(HY('bf9'), 1.2, 900), 1.2, 'bf'),
  THREE: S(200, fy(HY('bf9'), 0.56, 860), 0.56, 'three'),
  NAILS: U('nails', 1), SHEET: U('sheet', 2), CALC: U('calc', 3), ROD: U('rod', 4), PHOTO: U('photo', 5), HIS: U('his', 6) };
const HO = 0.12;   // cut to the next speaker this long before the line starts
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('nails') - 0.05) return f(SH.BF_CU); if (t < hev('wide') - 0.05) return f(SH.NAILS); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - HO) return f(SH.WIDE); if (t < SP.o1_b.t - HO) return f(SH.HER); if (t < e('unroll') - 0.05) return f(SH.BF); if (t < e('sheet')) return f(SH.TWO_LO); if (t < e('palm') - 0.02) return f(SH.SHEET); return f(SH.TWO_LO); }
  if (L === 'o2') { if (t < SP.o2_h.t - HO) return f(SH.WIDE); if (t < SP.o2_b.t - HO) return f(SH.HER); if (t < e('calc')) return f(SH.BF); if (t < e('roll') - 0.02) return f(SH.CALC); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - HO) return f(SH.WIDE); if (t < SP.o3_b.t - HO) return f(SH.HER); if (t < e('away')) return f(SH.BF); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - HO) return f(SH.WIDE); if (t < e('rod') - 0.02) return f(SH.THREE); if (t < e('back') - 0.02) return f(SH.ROD); if (t < SP.o4_b.t - HO) return f(SH.HER); if (t < e('photo')) return f(SH.BF_CU); return f(SH.PHOTO); }
  if (L === 'end') { if (t < e('hide') - 0.05) return f(SH.HER_R); if (t < SP.end_b.t - HO) return f(SH.TWO); if (t < e('his') - 0.02) return f(SH.BF); if (t < e('laugh') - 0.02) return f(SH.HIS); if (t < e('both') - 0.05) return f(SH.HER_R); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.1)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const sleeve = (c, col, x0, y0, x1, y1, w = 70) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.fillStyle = '#F2C9A8'; c.beginPath(); c.arc(x1, y1, w * 0.62, 0, TAU); c.fill(); };
// a big hand seen from the back, fingers up; (0,0) = wrist; nails with gloss (+ glitter)
function bigHand(c, x, y, s, rot, skin, sleeveCol, nail, glitter, t, spread = 0, flip = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * flip, s);
  const line = 'rgba(120,70,50,.55)';
  c.fillStyle = sleeveCol; c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 6; rr(c, -118, 120, 236, 500, 40); c.fill(); c.stroke(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-118, 150, 236, 26);
  // thumb
  c.save(); c.translate(-92, 40); c.rotate(-0.75 - spread * 0.2); c.fillStyle = skin; c.strokeStyle = line; c.lineWidth = 5; rr(c, -26, -150, 52, 175, 26); c.fill(); c.stroke();
  c.fillStyle = nail; c.beginPath(); c.ellipse(0, -118, 17, 24, 0, 0, TAU); c.fill(); c.restore();
  // fingers
  const FL = [150, 178, 168, 130];
  FL.forEach((len, i) => { const fx = -66 + i * 46, a = (i - 1.5) * 0.06 * (1 + spread); c.save(); c.translate(fx, -30); c.rotate(a); c.fillStyle = skin; c.strokeStyle = line; c.lineWidth = 5; rr(c, -23, -len, 46, len + 40, 23); c.fill(); c.stroke();
    c.fillStyle = nail; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -len + 30, 16, 25, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.ellipse(-5, -len + 20, 5, 9, -0.2, 0, TAU); c.fill();
    if (glitter) { c.fillStyle = '#F2C14E'; for (const [gx, gy] of [[5, -len + 36], [-6, -len + 40], [4, -len + 46]]) { c.beginPath(); c.arc(gx, gy, 2.6, 0, TAU); c.fill(); } }
    c.strokeStyle = line; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -len * 0.45); c.quadraticCurveTo(0, -len * 0.42, 10, -len * 0.45); c.stroke(); c.restore(); });
  c.fillStyle = skin; c.strokeStyle = line; c.lineWidth = 5; rr(c, -112, -60, 224, 220, 80); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(120,70,50,.3)'; c.lineWidth = 3; for (const fx of [-66, -20, 26, 72]) { c.beginPath(); c.arc(fx, -40, 10, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  c.restore(); }
// hook: her hand with glossy pink nails, sparkles
function nailsView(c, t) { backdrop(c, t, '#FFE0EE', '#F7A8C8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'nails' });
  const u = t - hev('nails'), k = eBack(clamp((u + 0.05) / 0.3), 1.6), wob = Math.sin(t * 3) * 0.04;
  bigHand(c, 560, 1250 + (1 - k) * 300, 2.0, 0.12 + wob, '#F6D2B6', '#EF7FAA', PINK, false, t);
  for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + i * 0.29) % 1, a = i * 1.05; star4(c, 560 + Math.cos(a) * 330, 640 + Math.sin(a) * 220, 70 * Math.sin(ph * Math.PI), '#FFFFFF', 0.95); } }
// o1: the spreadsheet close-up: rows, NAILS ??? circled
function sheetView(c, t) { backdrop(c, t, '#E6F2EA', '#B9D9C4'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'sheet' });
  const u = t - ev('o1', 'sheet'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 900); c.scale(k, k); c.rotate(-0.03);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-380 + 14, -620 + 18, 760, 1500); c.fillStyle = '#FFFFFF'; c.fillRect(-380, -620, 760, 1500);
  c.fillStyle = '#4CAF6A'; c.fillRect(-380, -620, 760, 130); fitTxt(c, 'OUR MONEY', 0, -555, 80, '#FFFFFF', 660);
  const rows = [['COFFEE', '3.50'], ['GUM', '1.20'], ['BUS', '2.80'], ['SOCKS', '4.00'], ['NAILS', '???']];
  c.strokeStyle = '#C9DCD0'; c.lineWidth = 4; c.beginPath(); c.moveTo(150, -490); c.lineTo(150, 880); c.stroke();
  rows.forEach(([a, b], i) => { const y = -400 + i * 150, rk = eBack(clamp((u - 0.08 - i * 0.1) / 0.18), 2); c.strokeStyle = '#C9DCD0'; c.beginPath(); c.moveTo(-380, y + 75); c.lineTo(380, y + 75); c.stroke(); if (rk <= 0) return;
    c.save(); c.translate(0, y); c.scale(1, rk); const last = i === rows.length - 1; fitTxt(c, a, -330, 0, 70, last ? '#C8383E' : '#2B2F3A', 460, 'Unb9', 'left'); fitTxt(c, b, 270, 0, 70, last ? '#C8383E' : '#2B2F3A', 200); c.restore(); });
  const ck = clamp((u - 0.75) / 0.3); if (ck > 0) { c.strokeStyle = '#E0474C'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.ellipse(0, -400 + 4 * 150, 370, 92, -0.03, -1.6, -1.6 + TAU * ck); c.stroke(); }
  c.fillStyle = '#9AA6B4'; for (let i = 0; i < 2; i++) { c.fillRect(-330, 400 + i * 150, 200, 20); c.fillRect(200, 400 + i * 150, 120, 20); }
  c.restore(); }
// o2: the calculator: pen taps, NOT MUCH -> ERROR
function calcView(c, t) { backdrop(c, t, '#E3E8F2', '#AEB9CE'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'calc' });
  const t0 = ev('o2', 'calc'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6), er = t > ev('o2', 'err'), blink = er && Math.sin((t - ev('o2', 'err')) * 14) > -0.3;
  const sh = er && t < ev('o2', 'err') + 0.3 ? Math.sin((t - ev('o2', 'err')) * 70) * 10 : 0;
  c.save(); c.translate(540 + sh, 980); c.scale(k * 4.6, k * 4.6); calcDraw(c, 1, er ? (blink ? 'ERROR' : '') : 'NOT MUCH', er ? '#C8383E' : '#2B3A2B'); c.restore();
  // the pen taps three keys
  const taps = [0.23, 0.4, 0.57], keys = [[1, 1], [2, 2], [3, 3]]; let px = 1200, py = 1500, down_ = 0;
  for (let i = 0; i < 3; i++) { const a = u - taps[i]; if (a > -0.12) { const [q, r] = keys[i]; px = 540 + (-52 + q * 27 + 11) * 4.6; py = 980 + (-28 + r * 29 + 11) * 4.6; down_ = Math.max(0, 1 - Math.abs(a) / 0.08); } }
  if (u > 0.9) { px = lerp(px, 1150, clamp((u - 0.9) / 0.3)); py = lerp(py, 1600, clamp((u - 0.9) / 0.3)); }
  c.save(); c.translate(px + 40, py + 40 - down_ * 30); c.rotate(-0.6); c.fillStyle = '#2E5AA8'; c.strokeStyle = '#1A2A50'; c.lineWidth = 6; rr(c, -20, 0, 40, 420, 16); c.fill(); c.stroke(); c.fillStyle = '#C9D2DA'; c.beginPath(); c.moveTo(-20, 0); c.lineTo(20, 0); c.lineTo(0, -60); c.closePath(); c.fill(); c.restore();
  sleeve(c, '#5E8C6A', 1300, py + 600, px + 260, py + 380, 130); }
// o4: the new fishing rod with its big price tag
function rodView(c, t) { backdrop(c, t, '#DDEFF8', '#9FCBE6'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'rod' });
  const u = t - ev('o4', 'rod'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 960); c.scale(k, k); c.rotate(-0.5);
  c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; c.lineWidth = 60; c.beginPath(); c.moveTo(0, 900); c.lineTo(0, 420); c.stroke(); c.strokeStyle = '#3A6FB0'; c.lineWidth = 32; c.beginPath(); c.moveTo(0, 420); c.lineTo(0, -1100); c.stroke();
  c.fillStyle = '#C9D2DA'; c.strokeStyle = '#5A606E'; c.lineWidth = 10; c.beginPath(); c.arc(70, 560, 110, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#5A606E'; c.beginPath(); c.arc(70, 560, 34, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 4; c.beginPath(); c.moveTo(70, 560); c.lineTo(0, -1100); c.stroke();
  c.restore();
  const tk = eBack(clamp((u - 0.1) / 0.3), 2.2), sw = Math.sin(t * 4) * 0.06;
  c.save(); c.translate(560, 820); c.rotate(sw); c.strokeStyle = '#8A6A4A'; c.lineWidth = 8; c.beginPath(); c.moveTo(-60, -260); c.lineTo(0, -10); c.stroke(); c.scale(tk, tk); c.rotate(-0.12);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -230 + 12, 0 + 16, 460, 330, 30); c.fill(); c.fillStyle = '#FFE15A'; c.strokeStyle = '#B8902A'; c.lineWidth = 10; rr(c, -230, 0, 460, 330, 30); c.fill(); c.stroke();
  c.fillStyle = '#B8902A'; c.beginPath(); c.arc(0, 40, 16, 0, TAU); c.fill(); fitTxt(c, '$450', 0, 185, 170, '#C8383E', 400); c.restore();
  const nk = eBack(clamp((u - 0.3) / 0.25), 2.4); if (nk > 0) { c.save(); c.translate(780, 1260); c.rotate(0.2); c.scale(nk, nk); c.fillStyle = '#E0474C'; c.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 120 : 145; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); fitTxt(c, 'NEW!', 0, 4, 70, '#FFFFFF', 190); c.restore(); } }
// o4: his phone photo: a wet boot on the hook
function photoView(c, t) { backdrop(c, t, '#E6F0E0', '#B9D3A8');
  const u = t - ev('o4', 'photo'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  K.phone(c, 540, 930 + (1 - k) * 400, 1.75, (q, w, h) => {
    q.fillStyle = '#BFE3F5'; q.fillRect(0, 0, w, h); q.fillStyle = '#3E8FC4'; q.fillRect(0, h * 0.62, w, h * 0.38); q.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 5; i++) q.fillRect(30 + i * 70, h * 0.68 + (i % 2) * 40, 50, 6);
    q.fillStyle = '#5E9A5A'; q.beginPath(); q.moveTo(0, h * 0.62); q.quadraticCurveTo(w * 0.3, h * 0.5, w * 0.6, h * 0.62); q.fill();
    q.fillStyle = '#FFFFFF'; q.fillRect(0, 0, w, 64); fitTxt(q, 'MY CATCH!', w / 2, 34, 38, '#2B2F3A', w - 40);
    q.strokeStyle = '#2B2F3A'; q.lineWidth = 3; q.beginPath(); q.moveTo(w * 0.55, 64); q.lineTo(w * 0.55, 250); q.stroke();
    const sw = Math.sin(t * 3) * 0.08; q.save(); q.translate(w * 0.55, 250); q.rotate(sw);
    q.strokeStyle = '#9AA6B4'; q.lineWidth = 5; q.beginPath(); q.arc(0, 14, 14, -Math.PI / 2, Math.PI * 0.9); q.stroke();
    q.fillStyle = '#6A4A2E'; q.strokeStyle = '#3A2A1A'; q.lineWidth = 5; q.beginPath(); q.moveTo(-40, 20); q.lineTo(30, 20); q.lineTo(34, 170); q.lineTo(120, 190); q.quadraticCurveTo(140, 240, 110, 250); q.lineTo(-44, 250); q.closePath(); q.fill(); q.stroke();
    q.fillStyle = '#4A321E'; q.fillRect(-44, 236, 158, 16); q.strokeStyle = '#C9A060'; q.lineWidth = 4; for (let i = 0; i < 4; i++) { q.beginPath(); q.moveTo(-20, 50 + i * 30); q.lineTo(20, 50 + i * 30); q.stroke(); }
    for (let i = 0; i < 4; i++) { const ph = (t * 1.5 + i * 0.25) % 1; q.fillStyle = `rgba(80,160,220,${1 - ph})`; q.beginPath(); q.ellipse(-30 + i * 45, 262 + ph * 140, 7, 11, 0, 0, TAU); q.fill(); }
    q.restore(); }); }
// twist: his hands, glossy navy nails with gold glitter
function hisView(c, t) { backdrop(c, t, '#E8E4F6', '#B5ACDE'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'his' });
  const u = t - ev('end', 'his'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  bigHand(c, 330, 1300 + (1 - k) * 400, 1.45, -0.18, '#F2C9A8', '#5E8C6A', NAVY, true, t, 0, -1);
  bigHand(c, 760, 1300 + (1 - k) * 400, 1.45, 0.18, '#F2C9A8', '#5E8C6A', NAVY, true, t);
  for (let i = 0; i < 7; i++) { const ph = (t * 1.7 + i * 0.23) % 1, a = i * 0.9 - 0.3; star4(c, 540 + Math.cos(a) * 420, 700 + Math.sin(a) * 200, 66 * Math.sin(ph * Math.PI), '#FFE15A', 0.95); } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + boyfriend, both showing their nails (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.bf9, aL = show(gm, -1, 1.6, 40), aR = show(g, 1, 1.6, 40);
    K.put(c, BF, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, headFirst: true, armL: aL, armR: down(gm, 1), items: { L: nailsOver(NAVY, handR(gm, aL, BF.h), true) } }, 640, 0);
    sparkleBurst(c, t, 640 - gm.sw * 1.6, gm.ySh + 100, 160, 1, 5, '#FFE15A');
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.2, headFirst: true, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: aR, items: { R: nailsOver(PINK, handR(g, aR, HER.h)) } }, 0, 0);
    sparkleBurst(c, t + 0.4, g.sw * 1.6, g.ySh + 100, 160, 1, 5); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.36), wAt('outro', 'два', sp.t + 1.72), wAt('outro', 'три', sp.t + 2.08), wAt('outro', 'четыре', sp.t + 2.52)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.21) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - wAt('outro', 'сохрани', sp.t + 3.86)) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { ({ 'ui:nails': nailsView, 'ui:sheet': sheetView, 'ui:calc': calcView, 'ui:rod': rodView, 'ui:photo': photoView, 'ui:his': hisView })[tag](c, t); heads = { her: OFFL, bf9: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, hold: { hook_b: -0.2, o1_h: -0.22, o1_b: -0.2, o2_h: -0.22, o2_b: -0.2, o3_h: -0.22, o3_b: -0.2, o4_h: -0.15, o4_b: -0.2, end_b: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('nails', NF, renderFrame);
