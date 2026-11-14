// "На свидании он поправляет твой английский" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node corrects.js start end out.mp4 | --png=f1,f2
// A candle-lit American restaurant (brick wall, window onto a night street with brownstones and a yellow cab, chalkboard «TONIGHT'S SPECIAL ... $18»).
// The heroine (pink sweater) and her date Will (navy blazer, glasses) sit at a small table. Will holds a BIG red pen and corrects her English on her napkin.
// Absurd detail: five more red pens stick out of his breast pocket, and her napkin already carries the grade «B+» (circled in red).
// hook: he corrects her on the napkin — "Small thing: it's 'I've been', not 'I was'."; insert: the napkin («I was» struck out, «I've been», «B+»).
// o1 «В ЛОБ»: "Stop teach me!" -> "Stop teachING me." — insert: he adds «ING» with an arrow and downgrades «B+» to «B-»; steam from her ears.
// o2 «ВЕЖЛИВО»: "Thank you, I'm still learning." -> "…it's 'think', not 'sink'." — insert: he draws a sinking ship; her slow facepalm.
// o3 «КАК НОСИТЕЛЬ»: "I'm off duty tonight." -> "Fair. Sorry — teacher habit." — he slides the pen into the pocket (now six pens) and blushes; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand line; she takes his pen; insert: she writes «MANNERS: C-» on his napkin and circles it. "…Is there extra credit?"
// Twist (music silent): he takes yet another pen out of his pocket, writes on a fresh napkin, slides it over — «A+  FRIDAY?» — "No corrections. Just one question."
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/corrects/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const wT = (id, w, fb) => K.wordT(id, w) ?? fb;

// ---------------- cast (both seated: upper body lowered by DROP, legs hidden by the tablecloth)
const DROP = 330;
const HER = { ...BASE.her_lift };
const WILL = { ...BASE.tom, glasses: { col: '#2B2F3A' }, hair: { style: 'short', col: '#5A3A22' }, top: { type: 'blazer', col: '#2F3E5C', shirt: '#F7F9FC', tie: null }, bottom: { type: 'trousers', col: '#2F3E5C' } };
const G = { her: geom(HER, DROP), will: geom(WILL, DROP) };
const X = { her: -430, will: 430 };
const TOP = -560;                                   // near edge of the table top (world y); the floor is y = 0; the far edge is TOP - 70
const NAP1 = { x0: -330, x1: -40 };                 // her napkin (on the table, between her plate and the candle)
const RED = '#D8262E', INKC = '#4A4F5C';
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function heartPath(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.7, y - s * 1.1, x, y - s * 0.35); c.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9); c.closePath(); }
function starIcon(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr_ = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fill(); c.restore(); }

// the red pen (world-aligned at the wrist): tip down-left toward the napkin; k = scale
function drawPen(c, k = 1, ang = -0.35) { c.save(); c.rotate(ang); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -11, -150, 26, 270, 12); c.fill();
  c.fillStyle = RED; rr(c, -14, -160, 28, 230, 13); c.fill(); c.strokeStyle = '#7A1015'; c.lineWidth = 4; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.35)'; rr(c, -9, -150, 7, 200, 4); c.fill();
  c.fillStyle = '#ECECEC'; c.beginPath(); c.moveTo(-14, 66); c.lineTo(14, 66); c.lineTo(4, 110); c.lineTo(-4, 110); c.closePath(); c.fill(); c.strokeStyle = '#7A7F8A'; c.lineWidth = 3; c.stroke();
  c.fillStyle = RED; c.beginPath(); c.arc(0, 112, 5, 0, TAU); c.fill();
  c.fillStyle = '#C9CED6'; rr(c, 10, -150, 10, 90, 5); c.fill();               // clip
  c.fillStyle = '#7A1015'; rr(c, -10, -178, 20, 22, 6); c.fill();               // click button
  c.restore(); }
const penItem = (ang = -0.35, k = 1.5) => ({ under: (ctx) => drawPen(ctx, k, ang) });

// ---------------- the restaurant (prerendered, softly blurred)
const BX0 = -2800, BY0 = -4400, BW = 5600, BH = 5600, BS = 0.5;
function drawRoom(c) {
  // back wall: warm plaster + exposed brick on the left
  c.fillStyle = '#E9C9A0'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#A9533C'; c.fillRect(BX0, BY0, 2050, BH);
  c.strokeStyle = 'rgba(240,210,180,.35)'; c.lineWidth = 6; for (let y = BY0, r = 0; y < 0; y += 70, r++) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + 2050, y); c.stroke(); for (let x = BX0 + (r % 2) * 80; x < BX0 + 2050; x += 160) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 70); c.stroke(); } }
  // window onto a night street (center): brownstones, a street lamp, a yellow cab
  const wx0 = -620, wx1 = 620, wy0 = -3150, wy1 = -1500;
  const g = c.createLinearGradient(0, wy0, 0, wy1); g.addColorStop(0, '#1E2A4A'); g.addColorStop(1, '#3E4A70'); c.fillStyle = g; c.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  c.fillStyle = '#6A3A30'; c.fillRect(wx0, -2700, 560, 1200); c.fillStyle = '#5A4038'; c.fillRect(wx0 + 600, -2900, 700, 1400);
  c.fillStyle = 'rgba(255,220,140,.9)'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if ((i + j) % 3 !== 1) c.fillRect(wx0 + 50 + i * 170, -2620 + j * 300, 90, 160); c.fillRect(wx0 + 650 + i * 190, -2820 + j * 320, 100, 170); }
  c.fillStyle = '#2B2F3A'; c.fillRect(wx0, -1700, wx1 - wx0, 200);     // street
  c.fillStyle = '#F2C14E'; rr(c, -260, -1840, 460, 130, 40); c.fill(); c.fillRect(-180, -1910, 260, 90); c.fillStyle = '#9FD2F0'; c.fillRect(-160, -1895, 100, 60); c.fillRect(-40, -1895, 100, 60);
  c.fillStyle = '#2B2F3A'; for (const wxx of [-170, 110]) { c.beginPath(); c.arc(wxx, -1710, 42, 0, TAU); c.fill(); } c.fillStyle = '#FFFFFF'; rr(c, -110, -1940, 140, 30, 8); c.fill(); fitTxt(c, 'TAXI', -40, -1925, 24, '#2B2F3A', 120);
  c.strokeStyle = '#1A1E26'; c.lineWidth = 16; c.beginPath(); c.moveTo(420, -1500); c.lineTo(420, -2500); c.quadraticCurveTo(420, -2580, 340, -2580); c.stroke(); c.fillStyle = 'rgba(255,230,160,.95)'; c.beginPath(); c.arc(330, -2550, 38, 0, TAU); c.fill();
  // window frame
  c.fillStyle = '#3A2A20'; c.fillRect(wx0 - 60, wy0 - 60, wx1 - wx0 + 120, 60); c.fillRect(wx0 - 60, wy1, wx1 - wx0 + 120, 70); c.fillRect(wx0 - 60, wy0, 60, wy1 - wy0); c.fillRect(wx1, wy0, 60, wy1 - wy0); c.fillRect(-20, wy0, 40, wy1 - wy0);
  // gold lettering on the glass
  fitTxt(c, 'Trattoria', -310, -3000, 70, '#F2C14E', 520, 'Cav7'); fitTxt(c, 'since 1962', 310, -3000, 52, '#F2C14E', 420, 'Cav7');
  // chalkboard on the brick: tonight's special in dollars
  { const bx = -1250, by = -2350; c.fillStyle = '#6A4A30'; c.fillRect(bx - 330, by - 400, 660, 800); c.fillStyle = '#2E3A34'; c.fillRect(bx - 300, by - 370, 600, 740);
    fitTxt(c, "TONIGHT'S", bx, by - 270, 60, '#F4F1EC', 520, 'Cav7'); fitTxt(c, 'SPECIAL', bx, by - 190, 60, '#F4F1EC', 520, 'Cav7');
    fitTxt(c, 'Lasagna', bx, by - 50, 70, '#F7D46A', 520, 'Cav7'); fitTxt(c, '$18', bx, by + 50, 80, '#F7D46A', 520, 'Cav7');
    fitTxt(c, 'Tiramisu  $9', bx, by + 180, 54, '#F4F1EC', 520, 'Cav7'); fitTxt(c, 'Espresso  $4', bx, by + 270, 54, '#F4F1EC', 520, 'Cav7'); }
  // framed picture on the right wall
  { const fx = 1350, fy = -2400; c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(fx - 230 + 14, fy - 280 + 18, 460, 560); c.fillStyle = '#B08A50'; c.fillRect(fx - 230, fy - 280, 460, 560); c.fillStyle = '#9FC8E0'; c.fillRect(fx - 190, fy - 240, 380, 480);
    c.fillStyle = '#E8D9B8'; c.fillRect(fx - 190, fy + 60, 380, 180); c.fillStyle = '#C9774A'; c.beginPath(); c.moveTo(fx - 120, fy + 60); c.lineTo(fx - 40, fy - 140); c.lineTo(fx + 40, fy + 60); c.fill(); c.fillStyle = '#5FA35A'; c.beginPath(); c.arc(fx + 110, fy - 20, 70, 0, TAU); c.fill(); }
  // string lights across the top
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.beginPath(); c.moveTo(BX0, -3500); for (let x = BX0; x <= BX0 + BW; x += 400) c.quadraticCurveTo(x + 200, -3330, x + 400, -3500); c.stroke();
  for (let x = BX0 + 100; x < BX0 + BW; x += 200) { const yy = -3500 + 120 * Math.sin(((x - BX0) % 400) / 400 * Math.PI); c.fillStyle = 'rgba(255,220,140,.35)'; c.beginPath(); c.arc(x, yy + 30, 40, 0, TAU); c.fill(); c.fillStyle = '#FFE6A0'; c.beginPath(); c.ellipse(x, yy + 30, 14, 20, 0, 0, TAU); c.fill(); }
  // wainscot + floor
  c.fillStyle = '#5A2E24'; c.fillRect(BX0, -900, BW, 900); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(BX0, -900, BW, 20);
  c.fillStyle = '#3A2A20'; c.fillRect(BX0, -10, BW, BY0 + BH + 10); c.fillStyle = 'rgba(255,255,255,.05)'; for (let x = BX0; x < BX0 + BW; x += 240) for (let y = 0, r = 0; y < BY0 + BH; y += 120, r++) if ((x / 240 + r) % 2 === 0) c.fillRect(x, y, 240, 120);
  // a plant in the corner
  c.fillStyle = '#C9774A'; rr(c, 1700, -500, 300, 500, 30); c.fill(); c.fillStyle = '#4F8F4A'; for (const [dx, dy, a] of [[-90, -260, -0.5], [0, -360, 0], [90, -260, 0.5], [-40, -180, -0.2], [50, -200, 0.3]]) { c.save(); c.translate(1850 + dx, -500 + dy); c.rotate(a); c.beginPath(); c.ellipse(0, 0, 50, 160, 0, 0, TAU); c.fill(); c.restore(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);

// chair backs (behind the characters)
function chairs(c) { for (const x of [X.her, X.will]) { const s = x < 0 ? -1 : 1;
  paint(c, q => { q.m(x - 230, TOP + 40); q.l(x - 210, -1060); q.q(x, -1130, x + 210, -1060); q.l(x + 230, TOP + 40); q.z(); }, '#6A3A2A', { sd: 6, hd: 3, lw: 5 });
  c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x - 150 * s - 10, -1020, 20, 420); } }

// ---------------- the table (live, in front of the characters) + things on it
function napkinFlat(c, x0, x1, content, t) { // a napkin lying on the table top (seen at a low angle)
  const y0 = TOP - 62, y1 = TOP - 4, sk = 18;
  paint(c, q => { q.m(x0 + sk, y0); q.l(x1 - sk, y0); q.l(x1, y1); q.l(x0, y1); q.z(); }, '#FFFFFF', { sd: 3, hd: 2, lw: 3 });
  c.strokeStyle = 'rgba(150,150,160,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo((x0 + x1) / 2, y0); c.lineTo((x0 + x1) / 2, y1); c.stroke();
  c.save(); c.translate((x0 + x1) / 2, (y0 + y1) / 2); c.scale(1, 0.42); content(c, x1 - x0); c.restore(); }
function nap1Content(c, w) { c.strokeStyle = INKC; c.lineWidth = 7; c.lineCap = 'round'; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(-w * 0.42, -40 + i * 50); c.lineTo(w * 0.05 - i * 40, -40 + i * 50); c.stroke(); }
  c.strokeStyle = RED; c.lineWidth = 7; c.beginPath(); c.moveTo(-w * 0.44, -40); c.lineTo(-w * 0.2, -46); c.stroke();
  c.save(); c.translate(w * 0.27, 0); c.strokeStyle = RED; c.lineWidth = 8; c.beginPath(); c.ellipse(0, 0, 62, 54, 0, 0, TAU); c.stroke(); fitTxt(c, 'B+', 0, 4, 70, RED, 110, 'Cav7'); c.restore(); }
function nap2Content(c, w) { c.save(); c.strokeStyle = RED; c.lineWidth = 8; c.beginPath(); c.ellipse(-w * 0.18, 0, 62, 54, 0, 0, TAU); c.stroke(); fitTxt(c, 'A+', -w * 0.18, 4, 72, RED, 110, 'Cav7');
  c.fillStyle = RED; heartPath(c, w * 0.22, 0, 34); c.fill(); c.restore(); }
function nap2X(t, L) { if (L !== 'end') return null; const k = eIO(clamp((t - ev('end', 'slide')) / 0.6)); return lerp(300, -40, k); }   // center of the fresh napkin
function candle(c, x, t) { c.fillStyle = '#C9A86A'; rr(c, x - 50, TOP - 80, 100, 34, 10); c.fill(); c.fillStyle = '#FFF6E6'; rr(c, x - 22, TOP - 230, 44, 160, 8); c.fill(); c.strokeStyle = 'rgba(180,160,130,.5)'; c.lineWidth = 3; c.stroke();
  const f = 1 + 0.08 * Math.sin(t * 17) + 0.05 * Math.sin(t * 29); c.fillStyle = 'rgba(255,200,90,.25)'; c.beginPath(); c.arc(x, TOP - 275, 70 * f, 0, TAU); c.fill();
  c.fillStyle = '#FFB43A'; c.beginPath(); c.ellipse(x, TOP - 270, 16 * f, 34 * f, 0.05 * Math.sin(t * 9), 0, TAU); c.fill(); c.fillStyle = '#FFF2B0'; c.beginPath(); c.ellipse(x, TOP - 262, 7, 16, 0, 0, TAU); c.fill(); }
function plate(c, x, pasta) { c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x, TOP - 22, 175, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x, TOP - 30, 170, 32, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9CED6'; c.lineWidth = 4; c.stroke();
  if (pasta) { c.fillStyle = '#F2C14E'; c.beginPath(); c.ellipse(x, TOP - 44, 100, 30, 0, Math.PI, TAU); c.fill(); c.fillStyle = '#D8462E'; c.beginPath(); c.ellipse(x - 10, TOP - 62, 50, 14, 0, 0, TAU); c.fill(); c.fillStyle = '#5FA35A'; c.beginPath(); c.arc(x + 20, TOP - 70, 10, 0, TAU); c.fill(); } }
function glass(c, x) { c.fillStyle = 'rgba(220,235,245,.55)'; c.strokeStyle = 'rgba(120,140,160,.8)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 50, TOP - 260); c.quadraticCurveTo(x - 55, TOP - 170, x, TOP - 160); c.quadraticCurveTo(x + 55, TOP - 170, x + 50, TOP - 260); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#8A1C2E'; c.beginPath(); c.moveTo(x - 46, TOP - 215); c.quadraticCurveTo(x, TOP - 205, x + 46, TOP - 215); c.quadraticCurveTo(x + 40, TOP - 168, x, TOP - 164); c.quadraticCurveTo(x - 40, TOP - 168, x - 46, TOP - 215); c.fill();
  c.beginPath(); c.moveTo(x, TOP - 160); c.lineTo(x, TOP - 40); c.stroke(); c.beginPath(); c.ellipse(x, TOP - 36, 40, 8, 0, 0, TAU); c.stroke(); }
function table(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-880, TOP + 10, 1760, 40);
  paint(c, q => { q.m(-860, TOP); q.l(860, TOP); q.l(900, 0); q.l(-900, 0); q.z(); }, '#FBF7F0', { sd: 8, hd: 4, lw: 5 });
  c.fillStyle = 'rgba(200,60,60,.85)'; c.beginPath(); c.moveTo(-170, TOP); c.lineTo(170, TOP); c.lineTo(190, 0); c.lineTo(-190, 0); c.fill();   // red runner
  c.strokeStyle = 'rgba(160,150,140,.35)'; c.lineWidth = 5; for (const x of [-620, -380, 380, 620]) { c.beginPath(); c.moveTo(x, TOP + 30); c.quadraticCurveTo(x + (x < 0 ? -20 : 20), -250, x + (x < 0 ? -30 : 30), -10); c.stroke(); }
  paint(c, q => { q.m(-820, TOP - 70); q.l(820, TOP - 70); q.l(860, TOP + 6); q.l(-860, TOP + 6); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 5 });
  glass(c, -720); glass(c, 720); plate(c, -560, true); plate(c, 590, true); candle(c, 70, t);
  napkinFlat(c, NAP1.x0, NAP1.x1, nap1Content, t);
  const n2 = nap2X(t, L); if (n2 !== null && t > ev('end', 'write') + 0.2) napkinFlat(c, n2 - 140, n2 + 140, t > ev('end', 'write') + 1.25 ? nap2Content : () => {}, t);
  K.mark(c, 'napkin', (NAP1.x0 + NAP1.x1) / 2, TOP - 30, 160); }

// breast pocket with pens (on his chest, screen-left side): drawn over his body
function pocketPens(t, L) { if (L === 'o3' && t > ev('o3', 'pocket') + 0.55) return 6; if (L === 'end' && t > ev('end', 'write') + 0.3) return 4; return 5; }
function pocket(c, t, L) { const g = G.will, px = X.will - 78, py = g.ySh + 175, n = pocketPens(t, L);
  for (let i = 0; i < n; i++) { const x = px - 40 + i * (80 / Math.max(1, n - 1)), a = (i - (n - 1) / 2) * 0.06; c.save(); c.translate(x, py - 10); c.rotate(a); c.fillStyle = RED; rr(c, -9, -70, 18, 80, 8); c.fill(); c.strokeStyle = '#7A1015'; c.lineWidth = 3; c.stroke(); c.fillStyle = '#C9CED6'; rr(c, 3, -64, 6, 40, 3); c.fill(); c.restore(); }
  c.fillStyle = '#26324C'; rr(c, px - 62, py - 14, 124, 70, 8); c.fill(); c.strokeStyle = '#1A2238'; c.lineWidth = 4; c.stroke();
  K.mark(c, 'pocket', px, py, 90); }

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const rest = (g, s, dx = 0.62) => reach(g, s, s * g.sw * dx, TOP - 70);          // hand on the table
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const chest = (g, s, dy = 260, k = 0.55) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: rest(g, -1), armR: rest(g, 1), items: {}, drop: DROP, legs: false, legPose: 'sit', floorShadow: false });
const steamK = (t, L) => L === 'o1' ? clamp((t - ev('o1', 'steam')) / 0.2) * (1 - clamp((t - ev('o1', 'steam') - 2.6) / 0.4)) : 0;
const herHasPen = (t, L) => (L === 'o4' && t > ev('o4', 'take') + 0.25) || L === 'end';
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'neutral', turn: 0.25, look: 0.7 };
  if (L === 'hook') { st.mood = 'tired'; st.look = 0.5; st.lookY = 0.45; st.armL = rest(g, -1, 1.0);
    if (t > hev('grade')) { st.mood = 'annoyed'; st.lookY = 0.1; st.look = 0.9; }
    if (t > hev('wide')) { st.mood = 'skeptical'; st.lookY = 0; st.armR = reach(g, 1, g.sw * 1.25, TOP - 95 - Math.abs(Math.sin(t * 9)) * 26, { planar: true }); } }   // drums her fingers on the table
  if (L === 'o1') { st.mood = 'angry';
    if (t < SP.o1_h.t + 0.1) { const k = eOut(clamp((t - SC.o1.s - 0.1) / 0.25)); st.armR = reach(g, 1, g.sw * 0.75, lerp(TOP - 70, g.ySh + 40, k), { fist: true }); }
    if (speaking('o1_h', t, 0, 0.1) && t >= SP.o1_h.t + 0.1) { st.armR = reach(g, 1, g.sw * 0.7, TOP - 70, { fist: true }); st.headY = Math.abs(Math.sin((t - SP.o1_h.t) * 6)) * 8; }
    if (t > SP.o1_d.t) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('steam') - 0.05) { st.mood = 'angry'; st.blink = 0; st.headY = Math.sin(t * 40) * 3; st.armL = reach(g, -1, -g.sw * 0.65, TOP - 70, { fist: true }); st.armR = reach(g, 1, g.sw * 0.65, TOP - 70, { fist: true }); } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'happy'; st.tilt = 0.07; st.armL = chest(g, -1, 210, 0.25); st.armR = chest(g, 1, 230, 0.25); }
    if (t > SP.o2_d.t + 1.0) { st.mood = 'surprised'; st.tilt = 0; }
    if (t > e('palm')) { const k = eOut(clamp((t - e('palm')) / 0.45)); st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armL = k > 0.05 ? reach(g, -1, lerp(-g.sw * 1.05, -g.hw * 0.1, k), lerp(TOP - 78, g.headY - g.hh * 0.38, k), { planar: true }) : st.armL; st.headY = 10 * k; st.tilt = -0.05 * k; } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'happy'; st.tilt = -0.04; gest(st, g, 'her', t, 1, 150); }
    if (t > SP.o3_d.t) { st.mood = 'neutral'; }
    if (t > e('blush') - 0.1) { st.mood = 'happy'; st.blink = 0; }
    if (t > SP.o3_nar.t + 0.6) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o4') { st.mood = 'smug';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.look = 0.8; const u = (t - SP.o4_h.t) * 3; if (t < e('take') - 0.4) st.armL = reach(g, -1, -g.sw * (1.5 + 0.15 * Math.sin(u)), g.ySh + 170 + Math.cos(u) * 20, { planar: true }); }
    if (t > e('take') - 0.4) { const k = eOut(clamp((t - e('take') + 0.4) / 0.4)), back = eIO(clamp((t - e('take') - 0.3) / 0.4)); st.armR = reach(g, 1, lerp(g.sw * 1.05, 700 - 120, k * (1 - back)) + back * g.sw * 1.1, lerp(TOP - 78, TOP - 140, k) + back * (g.ySh + 140 - TOP + 140), { planar: true }); }
    if (herHasPen(t, L)) { st.items = { R: penItem(-0.9, 1) }; if (t > endOf('o4_h')) { st.mood = 'smug'; st.blink = 1; } }
    if (t > SP.o4_d.t - 0.05) { st.mood = 'smug'; st.blink = 0; st.tilt = -0.05; } }
  if (L === 'end') { st.mood = 'smug'; st.items = { R: penItem(-0.9, 1) }; st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 140, { planar: true });
    if (t > e('write')) { st.mood = 'skeptical'; st.look = 0.9; st.lookY = 0.3; }
    if (t > e('slide')) { st.mood = 'surprised'; st.lookY = 0.5; st.look = 0.5; }
    if (t > SP.end_d.t) { st.mood = 'surprised'; st.lookY = 0; st.look = 0.9; }
    if (t > e('yes') - 0.1) { st.mood = 'happy'; st.blink = 0; st.laugh = false; st.lookY = 0; st.look = 0.8; st.armL = chest(g, -1, 200, 0.15); st.armR = chest(g, 1, 200, 0.15); st.items = {}; }
    if (t > e('moral')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  return st; }
const herCfg = (t, L) => { const k = L === 'end' ? clamp((t - ev('end', 'yes') + 0.1) / 0.3) : 0; return k > 0 ? { ...HER, blush: '#E8333F', blushA: 0.45 + 0.5 * k } : HER; };
const willHasPen = (t, L) => { if (L === 'o3' && t > ev('o3', 'pocket') + 0.55) return false; if (L === 'o4' && t > ev('o4', 'take') + 0.25) return false; if (L === 'end') return t > ev('end', 'write') + 0.3; return true; };
function willState(t, L) { const g = G.will, e = k => ev(L, k), st = { ...base(g, t, 'date4'), mood: 'happy', turn: -0.25, look: -0.7 };
  const toNap = (cx, k = 1, wig = 0) => reach(g, -1, lerp(-g.sw * 1.05, cx - X.will + 40 + Math.sin(t * 26) * wig, k), lerp(TOP - 78, TOP - 120 + Math.cos(t * 21) * wig * 0.5, k), { planar: true });
  const penUp = () => reach(g, -1, -g.sw * 1.45, g.ySh + 130, { planar: true });
  st.armL = penUp(); st.items = { L: penItem(-0.35, 1) };
  if (L === 'hook') { st.mood = 'happy'; st.lookY = 0.5; st.look = -0.6; st.lean = -0.4; st.armL = toNap((NAP1.x0 + NAP1.x1) / 2, 1, t < hev('grade') + 0.6 ? 14 : 0);
    if (t > hev('grade') + 0.6) { st.lean = 0; st.lookY = 0; st.mood = 'smug'; const k = eOut(clamp((t - hev('grade') - 0.6) / 0.35)); st.armL = reach(g, -1, lerp(-g.sw * 2.3, -g.sw * 1.45, k), lerp(TOP - 120, g.ySh + 130, k), { planar: true }); }
    if (t > hev('wide')) { st.mood = 'smug'; st.blink = 1; st.armL = reach(g, -1, -g.sw * 1.2, g.ySh + 60 + (Math.floor((t - hev('wide') - 0.25) / 0.22) % 2 === 0 && t < hev('wide') + 0.95 ? 12 : 0), { planar: true }); st.items = { L: penItem(0, 1) }; } }   // clicks the pen proudly
  if (L === 'o1') { st.mood = 'happy';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.o1_d.t - 0.05) { st.mood = 'smug'; st.lookY = 0; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 110, { planar: true }); st.items = { L: penItem(-1.1, 1) }; }   // pen pointed at her like a teacher
    if (t > e('steam') - 0.05) { st.mood = 'worried'; st.blink = 0; st.armL = open(g, -1, 1.6, 120); st.armR = open(g, 1, 1.6, 120); st.items = { L: penItem(-0.2, 1) }; }
    if (t > SP.o1_nar.t + 0.4) { st.mood = 'happy'; st.blink = 1; st.lookY = -0.3; st.look = 0.2; st.armL = penUp(); st.armR = rest(g, 1); } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0.05, 0.1)) { st.mood = 'happy'; }
    if (t > SP.o2_d.t - 0.05) { st.mood = 'happy'; gest(st, g, 'date4', t, 1, 120); }
    if (t > SP.o2_d.t + 1.3) { st.lookY = 0.5; st.look = -0.6; st.armL = toNap((NAP1.x0 + NAP1.x1) / 2, 1, 12); st.lean = -0.3; }   // drawing on her napkin
    if (t > e('palm')) { st.mood = 'smug'; st.lean = 0; st.lookY = 0; st.armL = reach(g, -1, -g.sw * 1.2, g.ySh + 60, { planar: true }); st.items = { L: penItem(0, 1) }; } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = t > SP.o3_h.t + 1.5 ? 'worried' : 'surprised'; }
    if (t > SP.o3_d.t - 0.05) { st.mood = 'worried'; st.blink = 0; st.tilt = 0.08; st.lookY = 0.25; }
    if (t > e('pocket') - 0.05) { const k = eIO(clamp((t - e('pocket')) / 0.5)), back = eIO(clamp((t - e('pocket') - 0.75) / 0.35)); st.armL = reach(g, -1, lerp(-g.sw * 1.45, -78, k) + back * (-g.sw * 1.05 + 78), lerp(g.ySh + 130, g.ySh + 120, k) + back * (TOP - 78 - g.ySh - 120), { planar: true });
      st.items = t < e('pocket') + 0.55 ? { L: penItem(lerp(-0.35, 0, k), 1) } : {}; }
    if (t > e('blush') - 0.1) { st.mood = 'worried'; st.lookY = 0.45; st.look = -0.4; }
    if (t > SP.o3_nar.t + 0.6) { st.mood = 'happy'; st.blink = 1; st.lookY = 0.2; } }
  if (L === 'o4') { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 230, { planar: true }); st.items = { L: penItem(-0.6, 1) };
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > SP.o4_h.t + 2.4 ? 'worried' : 'happy'; }
    if (t > e('take') - 0.4) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (!willHasPen(t, L)) { st.items = {}; st.armL = rest(g, -1); }
    if (t > SP.o4_d.t - 0.05) { st.mood = 'sad'; st.blink = 0; st.tilt = 0.06; st.lookY = 0.2; st.armL = chest(g, -1, 220, 0.2); st.armR = chest(g, 1, 230, 0.2); } }
  if (L === 'end') { st.mood = 'happy'; st.items = {}; st.armL = rest(g, -1);
    if (t > e('write') - 0.05) { const k = eIO(clamp((t - e('write')) / 0.3)); st.armL = reach(g, -1, lerp(-g.sw * 1.05, -78, k), lerp(TOP - 78, g.ySh + 120, k), { planar: true }); st.mood = 'happy'; st.lookY = 0.2; }
    if (t > e('write') + 0.3) { st.items = { L: penItem(-0.35, 1) }; const k = eOut(clamp((t - e('write') - 0.3) / 0.3)); st.armL = reach(g, -1, lerp(-78, 300 - X.will + 40 + Math.sin(t * 26) * 12 * (t < e('slide') - 0.1 ? 1 : 0), k), lerp(g.ySh + 120, TOP - 120, k), { planar: true }); st.lookY = 0.5; st.look = -0.3; st.lean = -0.2; }
    if (t > e('slide') - 0.1) { const k = eIO(clamp((t - e('slide')) / 0.6)); st.items = {}; st.armL = reach(g, -1, lerp(300, -40, k) - X.will + 60, TOP - 110, { planar: true }); st.lookY = 0.3; st.look = -0.7; st.lean = -0.4 * k; }
    if (t > e('slide') + 0.75) { st.lean = 0; st.mood = 'happy'; st.blink = 1; st.armL = chest(g, -1, 220, 0.2); st.armR = chest(g, 1, 230, 0.2); st.lookY = 0.25; st.tilt = 0.06; }
    if (t > e('yes') - 0.1) { st.mood = 'happy'; st.blink = 0; st.lookY = 0; st.tilt = 0; }
    if (t > e('moral')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  return st; }
const willCfg = (t, L) => { const k = L === 'o3' ? clamp((t - ev('o3', 'blush') + 0.1) / 0.3) : L === 'end' && t > ev('end', 'slide') + 0.6 ? 0.7 : L === 'o4' && t > SP.o4_d.t - 0.05 ? 0.4 : 0; return k > 0 ? { ...WILL, blush: '#E8333F', blushA: 0.4 + 0.6 * k } : WILL; };

// steam puffs from her ears (o1), sweat drops (o4)
function steam(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = 0.9 * k; for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const u = (t * 1.6 + i / 4) % 1, x = hd.x + s * (hd.hh * 0.95 + u * hd.hh * 0.6), y = hd.y - u * hd.hh * 1.3, r = hd.hh * (0.28 + u * 0.4);
  c.fillStyle = `rgba(255,255,255,${1 - u * 0.7})`; c.strokeStyle = `rgba(150,160,175,${1 - u * 0.7})`; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke(); } c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function hearts(c, hd, t, t0) { const u = t - t0; if (u < 0 || u > 2.4) return; c.save(); for (let i = 0; i < 5; i++) { const k = clamp((u - i * 0.12) / 1.6); if (k <= 0) continue; c.globalAlpha = 1 - k; c.fillStyle = '#EE5E9A'; heartPath(c, hd.x + (i - 2) * 60 + Math.sin(u * 4 + i) * 14, hd.y - hd.hh * 1.2 - k * 240, 22 + (i % 2) * 8); c.fill(); } c.restore(); }

function world(c, t, L) { const heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  chairs(c);
  heads.date4 = K.put(c, willCfg(t, L), willState(t, L), X.will, 0);
  pocket(c, t, L);
  heads.her = K.put(c, herCfg(t, L), herState(t, L), X.her, 0);
  table(c, t, L);
  K.mark(c, 'pen', X.will - 200, G.will.ySh + 150, 160);
  steam(c, heads.her, t, steamK(t, L));
  if (L === 'o4') sweat(c, heads.date4, t, t > SP.o4_d.t - 0.1 ? 1 : clamp((t - ev('o4', 'take')) / 0.3) * 0.8);
  if (L === 'o3') sweat(c, heads.date4, t, clamp((t - ev('o3', 'blush')) / 0.3) * 0.7);
  if (L === 'end') hearts(c, heads.her, t, ev('end', 'yes'));
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-10, fy(HY('will'), 0.92, 985), 0.92, 'cover'), WIDE: S(0, fy(HY('will'), 0.56, 980), 0.56, 'wide'),
  TWO: S(0, fy(HY('will'), 0.84, 800), 0.84, 'two'),
  HER: S(X.her + 90, fy(HY('her'), 1.0, 820), 1.0, 'her'), HER_CU: S(X.her + 50, fy(HY('her'), 1.3, 860), 1.3, 'her'),
  WILL: S(X.will - 90, fy(HY('will'), 1.0, 760), 1.0, 'will'), WILL_CU: S(X.will - 60, fy(HY('will'), 1.25, 760), 1.25, 'will'),
  NAP: U('nap', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nap')) return SH.COVER; if (t < hev('wide')) return f(SH.NAP); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_d.t - 0.1) return f(SH.HER); if (t < e('arrow')) return f(SH.WILL); if (t < e('steam') - 0.05) return f(SH.NAP); if (t < SP.o1_nar.t - 0.05) return f(SH.HER_CU); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_d.t - 0.1) return f(SH.HER); if (t < e('ship')) return f(SH.WILL); if (t < e('palm') - 0.05) return f(SH.NAP); if (t < SP.o2_nar.t - 0.05) return f(SH.HER); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_d.t - 0.1) return f(SH.HER); if (t < e('pocket') - 0.05) return f(SH.WILL); if (t < SP.o3_nar.t - 0.05) return f(SH.WILL_CU); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('take') - 0.45) return f(SH.HER); if (t < e('circle')) return f(SH.TWO); if (t < SP.o4_d.t - 0.1) return f(SH.NAP); return f(SH.WILL_CU); }
  if (L === 'end') { if (t < e('slide') - 0.05) return f(SH.WILL); if (t < SP.end_d.t - 0.1) return f(SH.TWO); if (t < e('fri')) return f(SH.WILL_CU); if (t < e('yes') - 0.05) return f(SH.NAP); if (t < e('moral') - 0.05) return f(SH.HER_CU); return f(SH.WIDE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- napkin close-ups on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const NY = 860, NS = 780;
function napkinBig(c, t, t0, rot = -0.035) { const k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6); c.translate(540, NY); c.scale(k, k); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(-NS / 2 + 16, -NS / 2 + 22, NS, NS); c.fillStyle = '#FFFFFF'; c.fillRect(-NS / 2, -NS / 2, NS, NS);
  c.strokeStyle = 'rgba(160,165,175,.35)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -NS / 2); c.lineTo(0, NS / 2); c.moveTo(-NS / 2, 0); c.lineTo(NS / 2, 0); c.stroke();
  c.strokeStyle = 'rgba(200,205,215,.7)'; c.lineWidth = 6; c.strokeRect(-NS / 2 + 26, -NS / 2 + 26, NS - 52, NS - 52); }
const hand = (c, s, x, y, size, col, maxW) => fitTxt(c, s, x, y, size, col, maxW, 'Cav7');
function writeOn(c, s, x, y, size, col, k, align = 'left') { if (k <= 0) return; UI.textFit(c, 'Cav7', size, s, 700); const w = c.measureText(s).width, x0 = align === 'center' ? x - w / 2 : x; c.save(); c.beginPath(); c.rect(x0 - 10, y - size, (w + 20) * clamp(k), size * 2); c.clip(); c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(s, x0, y); c.restore(); return w; }
function circleOn(c, x, y, rx, ry, k, lw = 9) { if (k <= 0) return; c.strokeStyle = RED; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.ellipse(x, y, rx, ry, -0.08, -1.9, -1.9 + TAU * 1.05 * clamp(k)); c.stroke(); }
function strike(c, x0, x1, y, k) { if (k <= 0) return; c.strokeStyle = RED; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y + 4); c.lineTo(lerp(x0, x1, clamp(k)), y - 6 * clamp(k)); c.stroke(); }
function napView(c, t) { const sc = sceneAt(t), L = sc.id; if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'nap_' + L });
  backdrop(c, t, '#F6E3C8', '#E2B98A'); c.save();
  if (L === 'hook') { const t0 = hev('nap'), u = t - t0; napkinBig(c, t, t0);
    hand(c, 'I was to Miami twice.', -300 + 260, -150, 76, INKC, 640); strike(c, -312, -150, -146, 1);
    writeOn(c, "I've been", -320, -255, 72, RED, 1);
    const bk = eBack(clamp((u - 0.45) / 0.3), 2.4), pulse = 1 + 0.06 * Math.sin(Math.max(0, u - 0.75) * 7);
    if (bk > 0) { c.save(); c.translate(150, 170); c.scale(bk * pulse, bk * pulse); c.rotate(-0.12); circleOn(c, 0, 0, 120, 100, 1, 11); fitTxt(c, 'B+', 0, 6, 150, RED, 220, 'Cav7'); c.restore(); } }
  if (L === 'o1') { const t0 = ev('o1', 'arrow'), u = t - t0; napkinBig(c, t, t0);
    hand(c, 'Stop teach me!', 0, -140, 92, INKC, 640);
    const k1 = clamp((u - 0.35) / 0.35); if (k1 > 0) { c.strokeStyle = RED; c.lineWidth = 8; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-10, -70); c.lineTo(-10 + 15 * k1, -100 * k1 - 70 * (1 - k1)); c.lineTo(-10 + 30 * k1, -70); c.stroke(); }
    writeOn(c, 'ING', -45, -10, 88, RED, clamp((u - 0.7) / 0.5));
    c.save(); c.translate(150, 190); c.rotate(-0.12); circleOn(c, 0, 0, 120, 100, 1, 11); fitTxt(c, 'B+', 0, 6, 150, RED, 220, 'Cav7');
    strike(c, -90, 90, 0, clamp((u - 1.35) / 0.2)); c.restore();
    const mk = eBack(clamp((u - 1.6) / 0.3), 2.4); if (mk > 0) { c.save(); c.translate(-170, 230); c.scale(mk, mk); c.rotate(0.1); fitTxt(c, 'B-', 0, 0, 140, RED, 220, 'Cav7'); c.restore(); } }
  if (L === 'o2') { const t0 = ev('o2', 'ship'), u = t - t0; napkinBig(c, t, t0);
    writeOn(c, 'think, not sink', 0, -250, 84, RED, clamp((u - 0.2) / 0.7), 'center');
    // a little ship drawn in red ink, then it sinks: tilts and slides under the waves, bubbles come up
    const dk = clamp((u - 0.5) / 0.9), sink = eIn(clamp((u - 1.55) / 0.8));
    c.save(); c.beginPath(); c.rect(-NS / 2, -NS / 2, NS, 180 + NS / 2); c.clip();
    c.save(); c.translate(0, 70 + sink * 170); c.rotate(sink * 0.5); c.strokeStyle = RED; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round';
    const segs = [[[-170, 40], [170, 40]], [[170, 40], [110, 110]], [[110, 110], [-110, 110]], [[-110, 110], [-170, 40]], [[0, 40], [0, -160]], [[0, -150], [110, 10]], [[110, 10], [0, 10]], [[-20, -120], [-120, 10]], [[-120, 10], [-20, 10]]];
    segs.forEach(([a, b], i) => { const kk = clamp(dk * segs.length - i); if (kk <= 0) return; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(lerp(a[0], b[0], kk), lerp(a[1], b[1], kk)); c.stroke(); }); c.restore(); c.restore();
    c.strokeStyle = RED; c.lineWidth = 8; c.beginPath(); for (let x = -300; x <= 300; x += 10) { const y = 180 + 14 * Math.sin(x / 30 + t * 4); x === -300 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
    if (sink > 0.2) for (let i = 0; i < 5; i++) { const b = ((u - 1.8) * 0.9 + i * 0.2) % 1; if (b < 0) continue; c.strokeStyle = `rgba(216,38,46,${1 - b})`; c.lineWidth = 5; c.beginPath(); c.arc(-40 + i * 22 + Math.sin(i * 3) * 30, 170 - b * 160, 10 + i * 2, 0, TAU); c.stroke(); } }
  if (L === 'o4') { const t0 = ev('o4', 'circle'), u = t - t0; napkinBig(c, t, t0, 0.03);
    hand(c, 'Will', -200, -260, 70, INKC, 300);
    writeOn(c, 'MANNERS:', -300, -60, 110, RED, clamp((u - 0.25) / 0.7));
    const ck = eBack(clamp((u - 1.0) / 0.25), 2.4); if (ck > 0) { c.save(); c.translate(170, 130); c.scale(ck, ck); fitTxt(c, 'C-', 0, 0, 200, RED, 300, 'Cav7'); c.restore(); }
    circleOn(c, 160, 130, 150, 120, clamp((u - 1.3) / 0.5), 12); }
  if (L === 'end') { const t0 = ev('end', 'fri'), u = t - t0; napkinBig(c, t, t0, 0.02);
    const ak = eBack(clamp((u - 0.05) / 0.3), 2.4); if (ak > 0) { c.save(); c.translate(0, -150); c.scale(ak, ak); c.rotate(-0.06); fitTxt(c, 'A+', 0, 10, 260, RED, 460, 'Cav7'); circleOn(c, 0, 0, 190, 150, 1, 13); c.restore(); }
    writeOn(c, 'FRIDAY?', 0, 160, 140, RED, clamp((u - 0.4) / 0.6), 'center');
    const hk = eBack(clamp((u - 1.0) / 0.3), 2.4); if (hk > 0) { c.fillStyle = RED; heartPath(c, 0, 300, 44 * hk); c.fill(); } }
  c.restore(); }
const VIEWS = { 'ui:nap': napView };

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 262); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 97, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate_(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 190;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor; then the comment question (ask) big above the buttons
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Will (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640) — standing, Will holds his red pen
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = geom(WILL); K.put(c, WILL, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { L: penItem(0, 1) }, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 0.6, gm.ySh + 250, { planar: true }) }, 640, 0);
    const gh = geom(HER); K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(gh, -1, -gh.sw * 2.0, gh.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(gh, 1, gh.sw * 0.7, gh.ySh + 300, { planar: true }) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const askK = eBack(P(t, ask.t - 0.1, ask.t + 0.2), 2.0), qOut = P(t, ask.t - 0.25, ask.t - 0.1);
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - qOut);
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  if (askK > 0) { c.save(); c.translate(540, 300); c.scale(askK, askK); textFit(c, 'Unb9', 66, 'ВТОРОЕ СВИДАНИЕ —', 900); strokeText(c, 'ВТОРОЕ СВИДАНИЕ —', 0, -50, C.oliveD, C.white, 14);
    textFit(c, 'Unb9', 80, 'ДА ИЛИ НЕТ?', 900); strokeText(c, 'ДА ИЛИ НЕТ?', 0, 50, C.pink, C.white, 14); c.restore(); }
  const tw = [wT('outro', 'один', sp.t + 1.06), wT('outro', 'два', sp.t + 1.82), wT('outro', 'три', sp.t + 2.1), wT('outro', 'четыре', sp.t + 2.45)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wT('outro', 'пиши', sp.t + 3.03) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.3) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = svT + 0.6, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < ask.t - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); }   // the ask line is shown big at the top instead of a caption
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { VIEWS[tag](c, t); heads = {}; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { date4: ['WILL', '#3E73B8'] }, onScr = {}; for (const k in heads) { const p = proj(heads[k]); if (p.x > 40 && p.x < W - 40) onScr[k] = heads[k]; }   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_d: -0.2, o1_h: -0.22, o1_d: -0.25, o2_h: -0.22, o2_d: -0.3, o3_h: -0.22, o3_d: -0.3, o4_h: -0.3, o4_d: -0.3, end_d: -0.3 } });
  if (L === 'hook') title(c, t);
  plate_(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('corrects', NF, renderFrame);
