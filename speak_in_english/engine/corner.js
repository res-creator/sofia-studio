// "Подруга-иностранка села на угол стола" — rubric «Наше за границей» (scene + 4 answers, worst -> best), hard_cut camera: node corner.js start end out.mp4 | --png=f1,f2
// An American apartment birthday party (HAPPY BIRTHDAY garland, brick buildings with a fire escape and a water tower outside the window).
// Laura (the heroine's American friend) has just plopped down on the front corner of the party table with the birthday cake in her hands; the heroine is horrified.
// Absurd detail: a red Soviet-style rug hangs on the wall, and on the rug, in a gold frame, the cat's diploma (DIPLOMA · MR. WHISKERS · BEST CAT).
// o1 «В ЛОБ»: "No! Corner! Never marry!" (palms out) — "Never marry? Is that a threat or a promise?" — she scoots out onto the very tip of the corner with the cake, wobbles.
// o2 «ВЕЖЛИВО»: "Maybe take a chair? It's… a thing." (open palm to the empty chair) — "But the corner has the best view of the cake." — she tucks a cushion under herself and leans back.
// o3 «КАК НОСИТЕЛЬ»: the explanation — "Seven YEARS?!" she leaps up, the cake flies to the ceiling, falls back, she catches it (cream on her nose); tip «They say…».
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the sweet line (Laura listens: shock -> intrigued) — she slowly sits back down on the corner — "…Honestly? That sounds like a dream." — hugs the cake.
// Twist (music silent): the doorbell — a handsome neighbour with flowers in the doorway — Laura flies off the corner onto the chair: "Right. Chair. Definitely a chair."
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/corner/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const LAU = { ...BASE.chloe, top: { type: 'sweater', col: '#F2B33D' }, bottom: { type: 'jeans', col: '#3E5C8A' }, shoes: { col: '#FFFFFF', acc: '#E0474C' } };
const NBR = { ...BASE.oliver, hair: { style: 'quiff', col: '#3A2618' }, brow: '#2A1A10', top: { type: 'blazer', col: '#5A7A9A', shirt: '#F7F9FC', tie: null }, bottom: { type: 'jeans', col: '#2F3E5C' } };
const DROP = 360;
const G = { her: geom(HER), lau: geom(LAU), lauS: geom(LAU, DROP), nbr: geom(NBR) };
const DT = -760;                                            // table-top height
const TX0 = -120, TX1 = 900;                                // table front: the LEFT end is the corner Laura sits on
const HX = -600, LX = 70, CHX = 560, NX = 1250;            // heroine, Laura on the corner, the empty chair, the neighbour in the doorway
const LY = DT - (-LAU.h * 0.47 + DROP);                     // Laura's origin when her hips sit on the table top (her feet dangle)
const DOOR = { x0: 1040, x1: 1460, y0: -1900 };
const RUG = { x0: 230, x1: 970, y0: -2080, y1: -1130 };
const WIN = { x0: -560, x1: -120, y0: -2280, y1: -1560 };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
function cake(c, x, y, s = 1, t = 0, flames = true) { c.save(); c.translate(x, y); c.scale(s, s); const O = { sd: 6, hd: 3, lw: 5 };
  paint(c, q => q.e(0, 6, 175, 30), '#F4F6F7', { sd: 4, hd: 2, lw: 4 });                                   // plate
  paint(c, q => { q.m(-140, 0); q.l(-140, -110); q.q(0, -140, 140, -110); q.l(140, 0); q.q(0, 26, -140, 0); q.z(); }, '#F7C6D6', O);   // lower tier
  c.fillStyle = '#FFFFFF'; for (let i = -3; i <= 3; i++) { c.beginPath(); c.arc(i * 40, -108 - Math.cos(i / 3) * 10, 22, 0, Math.PI); c.fill(); }   // cream drips
  paint(c, q => { q.m(-90, -120); q.l(-90, -200); q.q(0, -222, 90, -200); q.l(90, -120); q.z(); }, '#FBE3EA', O);   // upper tier
  c.fillStyle = '#E0474C'; for (const [dx, dy] of [[-100, -50], [-30, -40], [40, -45], [105, -55], [-50, -160], [45, -165]]) { c.beginPath(); c.arc(dx, dy, 13, 0, TAU); c.fill(); }   // berries
  for (const [k, dx] of [[0, -45], [1, 0], [2, 45]]) { c.fillStyle = ['#3E73B8', '#F2B33D', '#4CAF6A'][k]; rr(c, dx - 8, -280, 16, 70, 5); c.fill();
    if (flames) { const f = 1 + 0.15 * Math.sin(t * 17 + k * 2); c.save(); c.translate(dx, -292); c.scale(1, f); c.fillStyle = '#FFB43C'; c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(16, -4, 0, 8); c.quadraticCurveTo(-16, -4, 0, -30); c.fill(); c.fillStyle = '#FFF2A8'; c.beginPath(); c.ellipse(0, -2, 5, 8, 0, 0, TAU); c.fill(); c.restore(); } }
  c.restore(); }
function cushion(c, x, y, s = 1, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  paint(c, q => { q.m(-130, -40); q.q(0, -70, 130, -40); q.q(150, 0, 130, 40); q.q(0, 70, -130, 40); q.q(-150, 0, -130, -40); q.z(); }, '#8E5BD0', { sd: 5, hd: 3, lw: 5 });
  c.fillStyle = '#B48CE6'; c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill(); for (const k of [-1, 1]) { c.beginPath(); c.arc(k * 138, k * -38, 10, 0, TAU); c.arc(k * 138, k * 38, 10, 0, TAU); c.fill(); } c.restore(); }
function bouquet(c, s = 1) { c.save(); c.scale(s, s); c.strokeStyle = '#3E8F5A'; c.lineWidth = 9; c.lineCap = 'round'; for (const a of [-0.3, 0, 0.3]) { c.beginPath(); c.moveTo(0, 60); c.lineTo(Math.sin(a) * 120, -110); c.stroke(); }
  paint(c, q => { q.m(-60, -10); q.l(60, -10); q.l(18, 90); q.l(-18, 90); q.z(); }, '#F4EFE6', { sd: 4, hd: 2, lw: 4 });
  for (const [dx, dy, col] of [[-50, -130, '#E0474C'], [10, -160, '#F28AB0'], [60, -120, '#E0474C'], [-15, -95, '#F2B33D'], [40, -70, '#F28AB0'], [-60, -70, '#F2B33D']]) {
    c.fillStyle = col; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; c.beginPath(); c.arc(dx + Math.cos(a) * 16, dy + Math.sin(a) * 16, 16, 0, TAU); c.fill(); } c.fillStyle = '#FFE15A'; c.beginPath(); c.arc(dx, dy, 10, 0, TAU); c.fill(); }
  c.restore(); }
const bouquetItem = ctx => { ctx.save(); ctx.translate(0, -30); ctx.rotate(-0.15); bouquet(ctx, 0.95); ctx.restore(); };
const cushionItem = ctx => { ctx.save(); ctx.translate(0, -20); cushion(ctx, 0, 0, 1.0, 0.3); ctx.restore(); };
function chair(c, x, y) { c.save(); c.translate(x, y); const O = { sd: 6, hd: 3, lw: 5 };
  paint(c, q => { q.m(-150, -1080); q.q(0, -1130, 150, -1080); q.l(150, -880); q.q(0, -900, -150, -880); q.z(); }, '#B8834A', O);   // backrest top rail
  for (const k of [-1, 1]) paint(c, q => { q.m(k * 150 - 18, -1080); q.l(k * 150 + 18, -1080); q.l(k * 150 + 18, -420); q.l(k * 150 - 18, -420); q.z(); }, '#A0703C', O);
  for (const k of [-0.5, 0, 0.5]) paint(c, q => { q.m(k * 200 - 10, -880); q.l(k * 200 + 10, -880); q.l(k * 200 + 10, -440); q.l(k * 200 - 10, -440); q.z(); }, '#A0703C', { sd: 3, hd: 2, lw: 4 });
  paint(c, q => { q.m(-190, -440); q.l(190, -440); q.l(175, -390); q.l(-175, -390); q.z(); }, '#C9955A', O);   // seat
  for (const k of [-1, 1]) paint(c, q => { q.m(k * 165 - 16, -392); q.l(k * 165 + 16, -392); q.l(k * 170 + 14, 0); q.l(k * 170 - 14, 0); q.z(); }, '#A0703C', O);
  c.restore(); }
// the table: tablecloth top (seen slightly from above, the LEFT front corner pointing at the viewer), food, cloth hanging in front
function tableBack(c, t) {
  // top surface (parallelogram going back-right), the corner at (TX0, DT)
  paint(c, q => { q.m(TX0, DT); q.l(TX0 + 90, DT - 120); q.l(TX1 + 160, DT - 120); q.l(TX1, DT); q.z(); }, '#FFFFFF', { sd: 3, hd: 2, lw: 5 });
  c.strokeStyle = 'rgba(224,71,76,.25)'; c.lineWidth = 10; for (let x = TX0 + 60; x < TX1 + 100; x += 90) { c.beginPath(); c.moveTo(x, DT); c.lineTo(x + 90, DT - 120); c.stroke(); }
  // food: salad bowls, a jug of lemonade, plates, cups (no brands)
  const bowl = (x, col) => { paint(c, q => { q.m(x - 95, DT - 60); q.q(x, DT + 10, x + 95, DT - 60); q.z(); }, '#F4F6F7', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = col; c.beginPath(); c.ellipse(x, DT - 66, 88, 26, 0, Math.PI, TAU); c.fill(); };
  bowl(330, '#F2E08A'); c.fillStyle = '#E8875A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(270 + i * 24, DT - 80 + (i % 2) * 6, 9, 0, TAU); c.fill(); }   // potato salad with carrots
  bowl(620, '#7CC46A'); c.fillStyle = '#E0474C'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(570 + i * 34, DT - 82, 12, 0, TAU); c.fill(); }
  paint(c, q => { q.m(820, DT - 40); q.l(820, DT - 250); q.q(860, DT - 270, 900, DT - 250); q.l(900, DT - 40); q.z(); }, 'rgba(250,240,170,.9)', { sd: 3, hd: 2, lw: 4 });   // lemonade jug
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(850, DT - 190, 12, 0, TAU); c.arc(872, DT - 120, 10, 0, TAU); c.fill();
  for (const x of [130, 470, 760]) { c.fillStyle = '#E8EEF2'; c.beginPath(); c.ellipse(x, DT - 30, 60, 14, 0, 0, TAU); c.fill(); }
  for (const [x, col] of [[200, '#3E73B8'], [500, '#E0474C']]) { c.fillStyle = col; c.beginPath(); c.moveTo(x - 26, DT - 120); c.lineTo(x + 26, DT - 120); c.lineTo(x + 18, DT - 30); c.lineTo(x - 18, DT - 30); c.fill(); }
  K.mark(c, 'corner', TX0 + 40, DT - 20, 120); }
function tableFront(c) {
  paint(c, q => { q.m(TX0, DT); q.l(TX1, DT); q.l(TX1, DT + 470); for (let x = TX1; x > TX0; x -= 85) q.q(x - 42, DT + 500, x - 85, DT + 470); q.l(TX0, DT + 470); q.z(); }, '#F7F2EC', { sd: 8, hd: 4, lw: 5,
    inner: k => { k.fillStyle = 'rgba(224,71,76,.16)'; for (let x = TX0 + 20; x < TX1; x += 120) k.fillRect(x, DT, 46, 470); k.fillStyle = 'rgba(224,71,76,.12)'; for (let y = DT + 30; y < DT + 470; y += 120) k.fillRect(TX0, y, TX1 - TX0, 46); } });
  // the corner's draped point (left side of the cloth)
  paint(c, q => { q.m(TX0 + 10, DT - 4); q.l(TX0 - 70, DT + 540); q.l(TX0 + 40, DT + 470); q.z(); }, '#EDE4DA', { sd: 3, hd: 2, lw: 4 });
  c.fillStyle = '#8A5A34'; for (const x of [TX0 + 40, TX1 - 40]) c.fillRect(x - 16, DT + 480, 32, -DT - 480); }

// ---------------- the apartment (prerendered, softly blurred)
const BX0 = -3200, BY0 = -4200, BW = 7400, BH = 6200, BS = 0.5;
function outside(c, x0, x1, y0, y1) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#8EC5E8'); g.addColorStop(1, '#D8ECF6'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  // brick buildings, a fire escape and a rooftop water tower (New York-style)
  c.fillStyle = '#B5654A'; c.fillRect(x0, y0 + 260, 230, y1 - y0 - 260); c.fillStyle = '#9A5240'; c.fillRect(x0 + 250, y0 + 170, x1 - x0 - 250, y1 - y0 - 170);
  c.strokeStyle = 'rgba(70,30,20,.25)'; c.lineWidth = 3; for (let y = y0 + 190; y < y1; y += 26) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
  c.fillStyle = '#F4E3C0'; for (let x = x0 + 30; x < x0 + 220; x += 90) for (let y = y0 + 300; y < y1 - 60; y += 150) c.fillRect(x, y, 50, 80);
  c.fillStyle = '#E8D7B0'; for (let x = x0 + 290; x < x1 - 40; x += 80) for (let y = y0 + 220; y < y1 - 60; y += 140) c.fillRect(x, y, 44, 76);
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; for (let y = y0 + 380; y < y1; y += 170) { c.beginPath(); c.moveTo(x0 + 270, y); c.lineTo(x1 - 20, y); c.stroke(); c.lineWidth = 3; for (let x = x0 + 270; x < x1; x += 22) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 40); c.stroke(); } c.lineWidth = 7; c.beginPath(); c.moveTo(x0 + 300, y); c.lineTo(x1 - 60, y - 170); c.stroke(); }
  const tx = x0 + 110, ty = y0 + 260; c.fillStyle = '#7A5A3A'; c.fillRect(tx - 50, ty - 120, 100, 110); c.beginPath(); c.moveTo(tx - 62, ty - 120); c.lineTo(tx, ty - 175); c.lineTo(tx + 62, ty - 120); c.fill(); c.fillStyle = '#5A4028'; for (const k of [-36, 36]) c.fillRect(tx + k - 4, ty - 12, 8, 14); }
function rug(c) { const { x0, x1, y0, y1 } = RUG, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x0 + 14, y0 + 18, x1 - x0, y1 - y0);
  c.fillStyle = '#A8262E'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  c.strokeStyle = '#E8B04A'; c.lineWidth = 22; c.strokeRect(x0 + 40, y0 + 40, x1 - x0 - 80, y1 - y0 - 80); c.strokeStyle = '#1E3A6A'; c.lineWidth = 12; c.strokeRect(x0 + 72, y0 + 72, x1 - x0 - 144, y1 - y0 - 144);
  // ornament: central medallion of nested rhombi + corner motifs
  for (const [r, col] of [[300, '#1E3A6A'], [240, '#E8B04A'], [180, '#C9403E'], [120, '#F4E3C0'], [60, '#1E3A6A']]) { c.fillStyle = col; c.beginPath(); c.moveTo(cx, cy - r * 1.25); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r * 1.25); c.lineTo(cx - r, cy); c.closePath(); c.fill(); }
  for (const [px, py] of [[x0 + 150, y0 + 150], [x1 - 150, y0 + 150], [x0 + 150, y1 - 150], [x1 - 150, y1 - 150]]) { c.fillStyle = '#E8B04A'; c.beginPath(); c.moveTo(px, py - 50); c.lineTo(px + 40, py); c.lineTo(px, py + 50); c.lineTo(px - 40, py); c.fill(); c.fillStyle = '#1E3A6A'; c.beginPath(); c.arc(px, py, 14, 0, TAU); c.fill(); }
  c.strokeStyle = '#F4E3C0'; c.lineWidth = 5; for (let x = x0 + 6; x < x1; x += 16) { c.beginPath(); c.moveTo(x, y1); c.lineTo(x + 3, y1 + 34); c.stroke(); c.beginPath(); c.moveTo(x, y0); c.lineTo(x + 3, y0 - 30); c.stroke(); } }
function diploma(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-190 + 10, -150 + 14, 380, 300);
  c.fillStyle = '#C99A2E'; c.fillRect(-190, -150, 380, 300); c.fillStyle = '#E8C25A'; c.fillRect(-176, -136, 352, 272); c.fillStyle = '#FFF8E6'; c.fillRect(-160, -120, 320, 240);
  c.strokeStyle = '#C99A2E'; c.lineWidth = 3; c.strokeRect(-150, -110, 300, 220);
  fitTxt(c, 'DIPLOMA', 0, -84, 40, '#7A3A20', 260);
  // the cat portrait (paths)
  c.save(); c.translate(-80, 18); c.fillStyle = '#E8935A'; c.beginPath(); c.arc(0, 0, 44, 0, TAU); c.fill(); for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 40, -20); c.lineTo(k * 30, -62); c.lineTo(k * 8, -40); c.fill(); }
  c.fillStyle = '#2B1A1A'; for (const k of [-1, 1]) { c.beginPath(); c.ellipse(k * 16, -6, 6, 9, 0, 0, TAU); c.fill(); } c.fillStyle = '#E0607E'; c.beginPath(); c.moveTo(-6, 8); c.lineTo(6, 8); c.lineTo(0, 15); c.fill();
  c.strokeStyle = '#2B1A1A'; c.lineWidth = 2.5; for (const k of [-1, 1]) for (const d of [-4, 6]) { c.beginPath(); c.moveTo(k * 12, 14); c.lineTo(k * 46, 12 + d); c.stroke(); } c.restore();
  fitTxt(c, 'MR. WHISKERS', 60, 0, 26, '#2E3550', 170); fitTxt(c, 'BEST CAT', 60, 36, 24, '#C2504A', 170);
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(100, 84, 20, 0, TAU); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(90, 96); c.lineTo(84, 124); c.lineTo(100, 112); c.lineTo(116, 124); c.lineTo(110, 96); c.fill();   // seal + ribbon
  c.restore(); }
function garland(c) { const msg = 'HAPPY BIRTHDAY!', x0 = -620, x1 = 1000, y = -2330, n = msg.length, cols = ['#E0474C', '#F2B33D', '#4CAF6A', '#3E73B8', '#8E5BD0'];
  c.strokeStyle = '#5A4028'; c.lineWidth = 5; c.beginPath(); c.moveTo(x0 - 40, y - 20); c.quadraticCurveTo((x0 + x1) / 2, y + 120, x1 + 40, y - 20); c.stroke();
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = lerp(x0, x1, u), yy = y - 20 + Math.sin(u * Math.PI) * 70 * 1.0; if (msg[i] === ' ') continue;
    c.fillStyle = cols[i % 5]; c.beginPath(); c.moveTo(x - 44, yy); c.lineTo(x + 44, yy); c.lineTo(x, yy + 120); c.closePath(); c.fill(); fitTxt(c, msg[i], x, yy + 40, 52, '#FFFFFF', 70); } }
function door(c, open) { const { x0, x1, y0 } = DOOR;
  c.fillStyle = '#F4F1EA'; c.fillRect(x0 - 40, y0 - 40, x1 - x0 + 80, -y0 + 40);
  c.fillStyle = '#3A3630'; c.fillRect(x0, y0, x1 - x0, -y0);   // dark hallway behind
  c.fillStyle = '#5A544A'; c.fillRect(x0, -200, x1 - x0, 200);
  return open; }
function doorPanel(c, open) { const { x0, x1, y0 } = DOOR, w = (x1 - x0) * (1 - 0.82 * open);
  paint(c, q => { q.m(x0, y0); q.l(x0 + w, y0 + 30 * open); q.l(x0 + w, -30 * open); q.l(x0, 0); q.z(); }, '#E9E2D4', { sd: 5, hd: 3, lw: 5,
    inner: k => { k.strokeStyle = 'rgba(0,0,0,.12)'; k.lineWidth = 8; k.strokeRect(x0 + w * 0.15, y0 + 140, w * 0.7, 700); k.strokeRect(x0 + w * 0.15, y0 + 960, w * 0.7, 760); } });
  c.fillStyle = '#C9A85A'; c.beginPath(); c.arc(x0 + w * 0.86, -950, 22, 0, TAU); c.fill(); }
function drawRoom(c) {
  c.fillStyle = '#F2E6D0'; c.fillRect(BX0, BY0, BW, -240 - BY0);                // warm wall
  c.fillStyle = 'rgba(200,150,110,.10)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 70, -240 - BY0);   // wallpaper stripes
  c.fillStyle = '#FFFFFF'; c.fillRect(BX0, BY0 + 1380, BW, 40);                  // crown moulding
  // window with the city view
  c.fillStyle = '#FFFFFF'; c.fillRect(WIN.x0 - 40, WIN.y0 - 40, WIN.x1 - WIN.x0 + 80, WIN.y1 - WIN.y0 + 80);
  outside(c, WIN.x0, WIN.x1, WIN.y0, WIN.y1); const mid = (WIN.x0 + WIN.x1) / 2; c.fillStyle = '#FFFFFF'; c.fillRect(mid - 12, WIN.y0, 24, WIN.y1 - WIN.y0); c.fillRect(WIN.x0, (WIN.y0 + WIN.y1) / 2 - 12, WIN.x1 - WIN.x0, 24);
  c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(WIN.x0 + 20, WIN.y0); c.lineTo(WIN.x0 + 160, WIN.y0); c.lineTo(WIN.x0 + 20, WIN.y0 + 260); c.fill();
  c.fillStyle = '#EDE7DC'; c.fillRect(WIN.x0 - 70, WIN.y1 + 30, WIN.x1 - WIN.x0 + 140, 36);
  // curtains
  for (const [x, s] of [[WIN.x0 - 90, -1], [WIN.x1 + 90, 1]]) paint(c, q => { q.m(x - 70, WIN.y0 - 80); q.l(x + 70, WIN.y0 - 80); q.q(x + 40 * s + 20, (WIN.y0 + WIN.y1) / 2, x + 60, WIN.y1 + 120); q.l(x - 60, WIN.y1 + 120); q.q(x - 20, (WIN.y0 + WIN.y1) / 2, x - 70, WIN.y0 - 80); q.z(); }, '#7CB8A8', { sd: 6, hd: 3, lw: 4 });
  rug(c); diploma(c, (RUG.x0 + RUG.x1) / 2, (RUG.y0 + RUG.y1) / 2 + 10, 0.95);
  garland(c);
  // far left: a bookcase + a floor lamp; far right beyond the door: a coat rack
  c.fillStyle = '#8A6A44'; c.fillRect(-1900, -1700, 700, 1460); c.fillStyle = '#6A4E30'; for (let k = 0; k < 4; k++) c.fillRect(-1880, -1650 + k * 360, 660, 24);
  for (let k = 0; k < 4; k++) for (let b = 0; b < 8; b++) { c.fillStyle = ['#3E73B8', '#C2504A', '#4CAF6A', '#F2B33D', '#8E5BD0'][(k * 3 + b) % 5]; c.fillRect(-1860 + b * 76, -1620 + k * 360 + (b % 3) * 20, 56, 300 - (b % 3) * 20); }
  c.fillStyle = '#5A606E'; c.fillRect(-1000, -1700, 18, 1460); paint(c, q => { q.m(-1100, -1700); q.l(-880, -1700); q.l(-930, -1900); q.l(-1050, -1900); q.z(); }, '#F2D58A', { sd: 3, hd: 2, lw: 4 });
  c.fillStyle = '#5A4028'; c.fillRect(1780, -1900, 24, 1660); for (const k of [-1, 1]) { c.fillRect(1792, -1880, k * 120, 16); } c.fillStyle = '#C2504A'; rr(c, 1660, -1860, 120, 420, 40); c.fill();
  // skirting + wooden floor + a rug on the floor
  c.fillStyle = '#FFFFFF'; c.fillRect(BX0, -280, BW, 60);
  c.fillStyle = '#C08A5A'; c.fillRect(BX0, -220, BW, BY0 + BH + 220); c.strokeStyle = 'rgba(80,40,20,.18)'; c.lineWidth = 6; for (let y = -180; y < 2000; y += 110) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
  for (let x = BX0; x < BX0 + BW; x += 380) for (let y = -220, k = 0; y < 2000; y += 110, k++) { c.beginPath(); c.moveTo(x + (k % 2) * 190, y); c.lineTo(x + (k % 2) * 190, y + 110); c.stroke(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.2px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);

// ---------------- characters
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const chest = (g, s) => reach(g, s, s * g.sw * 0.1, g.ySh + 170, { planar: true });
const hips = (g, s) => reach(g, s, s * g.sw * 1.15, g.ySh + 420, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gestR = (st, g, id, t, k = 1.6, dy = 120) => { const u = (t - SP[id].t) * 4.5; st.armR = reach(g, 1, g.sw * (k + 0.15 * Math.sin(u)), g.ySh + dy + Math.cos(u) * 22, { planar: true }); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'worried', turn: 0.3, look: 0.75 };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.armL = open(g, -1, 1.5, 120); st.armR = open(g, 1, 1.7, 80);
    if (t > hev('her') - 0.1) { st.mood = 'worried'; st.armL = chest(g, -1); st.armR = chest(g, 1); st.look = 0.9; }
    if (t > hev('fr')) { st.mood = 'skeptical'; st.armR = hips(g, 1); st.armL = hips(g, -1); } }
  if (L === 'o1') { st.mood = 'annoyed'; st.armL = hips(g, -1); st.armR = hips(g, 1);
    if (speaking('o1_h', t, 0.05, 0.05)) { st.mood = 'shock'; st.blink = 0; const sh = Math.sin((t - SP.o1_h.t) * 20) * 10; st.armL = open(g, -1, 1.5, 60 + sh); st.armR = open(g, 1, 2.0, -10 + sh); st.look = 1; }
    if (t > SP.o1_f.t) { st.mood = 'skeptical'; }
    if (t > e('scoot')) { st.mood = 'shock'; st.blink = 0; st.armL = open(g, -1, 1.3, 140); st.armR = open(g, 1, 1.9, 40); }
    if (t > e('wobble') + 0.8) { st.mood = 'annoyed'; st.armL = hips(g, -1); st.armR = hips(g, 1); } }
  if (L === 'o2') { st.mood = 'happy'; st.armL = chest(g, -1); st.armR = chest(g, 1);
    if (speaking('o2_h', t, 0.05, 0.1)) { st.tilt = 0.06; st.mood = 'worried'; const u = (t - SP.o2_h.t) * 3; st.armR = reach(g, 1, g.sw * (2.0 + 0.1 * Math.sin(u)), g.ySh + 230, { planar: true }); }
    if (t > SP.o2_f.t + 0.4) { st.mood = 'skeptical'; st.tilt = 0; }
    if (t > e('lean')) { st.mood = 'annoyed'; st.armL = hips(g, -1); st.armR = hips(g, 1); } }
  if (L === 'o3') { st.mood = 'happy'; st.armL = chest(g, -1); st.armR = hips(g, 1);
    if (speaking('o3_h', t, 0.05, 0.15)) { gestR(st, g, 'o3_h', t, 1.9, 80); st.mood = 'worried'; st.look = 0.8; st.tilt = 0.03 * Math.sin(t * 2); if (t > SP.o3_h.t + 2.2) st.mood = 'happy'; }
    if (t > e('jump')) { st.mood = 'shock'; st.blink = 0; st.lookY = -0.5; st.armL = open(g, -1, 1.5, 60); st.armR = open(g, 1, 1.6, 60); }
    if (t > e('catch')) { st.mood = 'happy'; st.laugh = t < e('catch') + 1.0; st.lookY = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'o4') { st.mood = 'happy'; st.armL = chest(g, -1); st.armR = chest(g, 1);
    if (speaking('o4_h', t, 0.05, 0.2)) { st.tilt = 0.05 * Math.sin(t * 1.6); st.look = 0.8; gestR(st, g, 'o4_h', t, 1.7, 110); if (t > e('two')) st.mood = 'smug'; }
    if (t > endOf('o4_h') + 0.2) { st.mood = 'smug'; st.blink = 1; st.armR = hips(g, 1); st.armL = hips(g, -1); }
    if (t > SP.o4_f.t + 0.5) { st.blink = 0; st.mood = 'surprised'; } }
  if (L === 'end') { st.mood = 'surprised'; st.armL = chest(g, -1); st.armR = chest(g, 1); st.look = 1; st.turn = 0.45;
    if (t > ev('end', 'land')) { st.mood = 'smug'; st.turn = 0.3; st.look = 0.6; st.armL = hips(g, -1); st.armR = hips(g, 1); }
    if (t > ev('end', 'smug')) { st.mood = 'smug'; st.blink = Math.sin(t * 3) > 0.8 ? 1 : 0; }
    if (t > ev('end', 'moral')) { st.mood = 'happy'; st.turn = 0.1; st.look = 0.2; st.blink = 0; } }
  return st; }
// Laura: pose = where her origin is + sitting/standing; the cake is drawn in front of her chest by a front callback
const cakePos = (g, sit) => ({ x: 0, y: g.ySh + (sit ? 300 : 330) });
function lauState(t, L) { const e = k => ev(L, k);
  let x = LX, y = LY, rot = 0, sit = 1, cakeOn = true, cream = false, cush = 0, hug = 0, onChair = false;
  if (L === 'o1' && t > e('scoot')) { const k = eIO(P(t, e('scoot'), e('scoot') + 0.7)); x = LX - 140 * k; rot = -0.1 * k;
    if (t > e('wobble')) { const u = t - e('wobble'); rot += Math.sin(u * 14) * 0.06 * Math.exp(-u * 2.5); } }
  if (L === 'o2') { if (t > e('tuck')) cush = 1; if (t > e('tuck')) y = LY - 50 * eBack(P(t, e('tuck'), e('tuck') + 0.25), 2); if (t > e('lean')) rot = 0.06 * eOut(P(t, e('lean'), e('lean') + 0.4)); }
  if (['o3', 'o4', 'end'].includes(L)) cush = 1;
  if (L === 'o3') { y = LY - 50; if (t > e('jump')) { const k = eOut(P(t, e('jump'), e('jump') + 0.22)); sit = 1 - k; y = lerp(LY - 50, 0, k) - Math.sin(clamp((t - e('jump')) / 0.35) * Math.PI) * 120; x = LX - 40 * k; }
    if (t > e('jump') && t < e('catch')) cakeOn = false; if (t > e('catch')) cream = true; }
  if (L === 'o4') { cream = true; x = LX - 40; y = 0; sit = 0;
    if (t > e('sit')) { const k = eIO(P(t, e('sit'), e('down'))); sit = k; x = lerp(LX - 40, LX, k); y = lerp(0, LY - 50, k); }
    if (t > SP.o4_f.t) hug = clamp((t - SP.o4_f.t) / 0.4); }
  if (L === 'end') { cream = true; y = LY - 50; hug = 0;
    if (t > e('fly')) { const k = eIO(P(t, e('fly'), e('land'))); x = lerp(LX, CHX, k); y = lerp(LY - 50, 0, k) - Math.sin(k * Math.PI) * 420; rot = Math.sin(k * Math.PI) * 0.25; }
    if (t > e('land')) { onChair = true; x = CHX; y = -Math.max(0, Math.sin(clamp((t - e('land')) / 0.3) * Math.PI)) * 30; rot = 0; } }
  if (L === 'outro') { x = CHX; y = 0; onChair = true; }
  const g = sit > 0.5 ? G.lauS : G.lau;
  const st = { ...base(g, t, 'friend5'), mood: 'happy', turn: -0.25, look: -0.7, legPose: sit > 0.5 ? 'sit' : undefined, drop: sit > 0.5 ? DROP : 0, floorShadow: sit > 0.5 && !onChair ? false : undefined };
  const cp = cakePos(g, sit > 0.5), hugK = 1 - 0.35 * hug;
  const holdCake = () => { st.armL = reach(g, -1, cp.x - g.sw * 1.0 * hugK, cp.y - 20, { planar: true }); st.armR = reach(g, 1, cp.x + g.sw * 1.0 * hugK, cp.y - 20, { planar: true }); };
  holdCake();
  if (L === 'hook') { const b = Math.sin(clamp(t / 0.5) * Math.PI) * Math.exp(-t * 2) * 30; y -= b;
    if (speaking('hook_f', t, 0, 0.05)) { st.mood = 'happy'; st.tilt = 0.04 * Math.sin(t * 3); }
    if (t > endOf('hook_f') + 0.1) { st.blink = Math.sin(t * 2.3) > 0.92 ? 1 : 0; st.mood = 'happy'; } }
  if (L === 'o1') { if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_f', t, 0, 0.1)) { st.mood = 'smug'; st.tilt = 0.05 * Math.sin((t - SP.o1_f.t) * 3); }
    if (t > e('scoot')) { st.mood = 'happy'; st.laugh = t < e('wobble'); }
    if (t > e('wobble')) { st.mood = 'surprised'; } if (t > e('wobble') + 0.7) st.mood = 'smug'; }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_f', t, 0, 0.1)) { st.mood = 'happy'; st.tilt = 0.04 * Math.sin(t * 2.5); }
    if (t > e('cush') && t < e('tuck')) { st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 280, { planar: true }); st.items = { R: cushionItem }; st.look = 0.4; }
    if (t > e('tuck')) { st.mood = 'happy'; st.blink = 1; }
    if (t > e('lean')) { st.mood = 'happy'; st.blink = 1; st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 420, { planar: true }); } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0, 0.1)) { st.mood = t < SP.o3_h.t + 2.5 ? 'surprised' : 'worried'; st.blink = 0; }
    if (speaking('o3_f', t, 0, 0.1)) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('jump') && t < e('catch')) { st.mood = 'shock'; st.blink = 0; st.lookY = -0.7; st.look = -0.2; st.armL = open(g, -1, 1.9, -60); st.armR = open(g, 1, 1.9, -60); }
    if (t > e('fall') && t < e('catch')) { st.lookY = lerp(-0.7, 0.2, P(t, e('fall'), e('catch'))); }
    if (t > e('catch')) { st.mood = 'surprised'; st.lookY = 0.4; st.look = 0; if (t > e('catch') + 0.6) { st.mood = 'happy'; st.look = -0.6; st.lookY = 0; } } }
  if (L === 'o4') { st.mood = 'worried';
    if (t > ev('o4', 'two')) st.mood = 'surprised';
    if (t > SP.o4_h.t + 5.0) { st.mood = 'happy'; st.look = -0.5; }
    if (t > e('sit')) { st.mood = 'happy'; st.blink = 1; st.tilt = 0.08 * P(t, e('sit'), e('down')); }
    if (speaking('o4_f', t, 0, 0.3) || t > SP.o4_f.t) { st.mood = 'happy'; st.blink = 1; st.tilt = 0.1 + 0.03 * Math.sin(t * 2); st.look = 0; st.turn = 0; }
    if (speaking('o4_f', t, 0, 0)) st.blink = t < SP.o4_f.t + 0.9 ? 1 : 0; }
  if (L === 'end') { st.mood = 'surprised'; st.turn = 0.4; st.look = 1;
    if (t > e('door') + 0.3) { st.mood = 'happy'; st.blink = 0; st.lookY = 0; }
    if (t > e('fly') - 0.1 && t < e('land')) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('land')) { st.mood = 'happy'; st.turn = 0.1; st.look = 0.3; st.tilt = 0;
      if (speaking('end_f', t, 0, 0.1)) { st.mood = 'smug'; st.headY = Math.abs(Math.sin((t - SP.end_f.t) * 7)) * -8; }
      if (t > e('give')) { st.mood = 'happy'; st.turn = 0.4; st.look = 1; st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 60 + Math.sin(t * 9) * 25, { planar: true }); st.armL = reach(g, -1, cp.x - g.sw * 0.9, cp.y - 20, { planar: true }); } } }
  const showCake = cakeOn && !(L === 'end' && t > e('give'));
  const hasCake = cakeOn;
  st.front = (cc, gg) => { if (cream) { cc.fillStyle = '#FFFFFF'; cc.beginPath(); cc.ellipse(gg.head.x + st.turn * g.hw * 0.25, gg.head.y + g.hh * 0.28, 22, 15, 0, 0, TAU); cc.fill(); }
    if (hasCake) cake(cc, cp.x, cp.y + 40, 0.85, t, !(L === 'end' && t > ev('end', 'fly'))); };
  if (!showCake && L === 'end') st.front = (cc, gg) => { if (cream) { cc.fillStyle = '#FFFFFF'; cc.beginPath(); cc.ellipse(gg.head.x + st.turn * g.hw * 0.25, gg.head.y + g.hh * 0.28, 22, 15, 0, 0, TAU); cc.fill(); } cake(cc, cp.x - g.sw * 0.2, cp.y + 40, 0.85, t, false); };
  return { st, g, x, y, rot, cush, onChair, cp }; }
function nbrState(t, L) { const g = G.nbr, e = k => ev('end', k), st = { ...base(g, t, 'x'), mood: 'happy', turn: -0.4, look: -0.8, armL: down(g, -1), armR: chest(g, 1), items: { R: bouquetItem } };
  if (t > e('give')) { const k = eOut(P(t, e('give'), e('give') + 0.4)); st.armR = reach(g, 1, -g.sw * lerp(0.1, 1.6, k), g.ySh + lerp(170, 60, k), { planar: true }); st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 40 + Math.sin(t * 8) * 20, { planar: true }); }
  return st; }
function sparkleAt(c, x, y, k, s = 1) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s * k, s * k); c.fillStyle = '#FFF6B0'; c.strokeStyle = '#F2B33D'; c.lineWidth = 4;
  c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 14 : 48; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); c.restore(); }
// drawn heart (canvas path, not a glyph)
function heart(c, x, y, s, col = '#F06A8E') { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -30, -60, 0, -28); c.bezierCurveTo(30, -60, 60, -10, 0, 30); c.fill(); c.restore(); }

// ---------------- world
const DRAW = { wide: ['her', 'friend5', 'nbr'], two: ['her', 'friend5'], her: ['her'], fr: ['friend5'], door: ['nbr'], chair: ['friend5'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function flyingCake(c, t, L, ls) { if (L !== 'o3') return; const j = ev('o3', 'jump'), f = ev('o3', 'fall'), k = ev('o3', 'catch'); if (t < j || t > k) return;
  const hx = ls.x, hy = ls.y + ls.cp.y + 40; let y, x = hx, r;
  if (t < f) { const u = P(t, j, j + 0.7); y = lerp(LY - 50 + G.lauS.ySh + 340, -4200, eOut(u)); r = u * 5; }
  else { const u = P(t, f, k); y = lerp(-3600, hy, eIn(u)); r = 5 + u * 1.3; x = hx; }
  c.save(); c.translate(x, y); c.rotate(Math.sin(r) * 0.4); cake(c, 0, 0, 0.85, t, t > f); c.restore(); }
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  // the door (right): opens in the twist; the neighbour stands in it
  const op = L === 'end' ? eIO(P(t, ev('end', 'door'), ev('end', 'door') + 0.45)) : L === 'outro' ? 1 : 0;
  door(c, op);
  if (op > 0.05 && who.includes('nbr')) { heads.nbr = K.put(c, NBR, nbrState(t, L), NX, 0); if (L === 'end') { const hd = heads.nbr, sk = P(t, ev('end', 'shine'), ev('end', 'shine') + 0.2) * (1 - P(t, ev('end', 'shine') + 0.9, ev('end', 'shine') + 1.1)); sparkleAt(c, hd.x + 40, hd.y + 60, sk, 0.9 + 0.2 * Math.sin(t * 20)); } }
  doorPanel(c, op);
  tableBack(c, t);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  tableFront(c); chair(c, CHX, 0);
  const ls = lauState(t, L);
  if (ls.cush) cushion(c, LX, DT - 18, 0.85, -0.05);
  if (who.includes('friend5') && !ls.onChair && ls.y < -150) { c.fillStyle = 'rgba(60,30,10,.22)'; c.beginPath(); c.ellipse(ls.x, 10, 170, 26, 0, 0, TAU); c.fill(); }
  if (who.includes('friend5')) { c.save(); c.translate(ls.x, ls.y); c.rotate(ls.rot); const hd = K.put(c, LAU, ls.st, 0, 0); c.restore(); heads.friend5 = rotHead(ls, hd); }
  flyingCake(c, t, L, ls);
  // o4 dreamy hearts around Laura (drawn paths)
  if (L === 'o4' && t > SP.o4_f.t && heads.friend5) { for (let i = 0; i < 3; i++) { const u = ((t - SP.o4_f.t) * 0.6 + i / 3) % 1; c.save(); c.globalAlpha = Math.sin(u * Math.PI); heart(c, heads.friend5.x + (i - 1) * 150 + Math.sin(u * 6 + i) * 20, heads.friend5.y - 160 - u * 220, 0.9); c.restore(); } }
  if (!heads.her) heads.her = OFFL; if (!heads.friend5) heads.friend5 = OFF;
  return heads; }
// head position of a rotated/translated put()
function rotHead(ls, hd) { const cs = Math.cos(ls.rot), sn = Math.sin(ls.rot); return { x: ls.x + hd.x * cs - hd.y * sn, y: ls.y + hd.x * sn + hd.y * cs, hh: hd.hh }; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const LHS = LY + G.lauS.headY, LHU = G.lau.headY;              // Laura's head y: sitting on the corner / standing
const SH = { WIDE: S(260, -1100, 0.48, 'wide'), COVER: S(260, -1360, 0.48, 'wide'),
  TWO: S((HX + LX) / 2 - 20, fy(G.her.headY, 0.66, 800), 0.66, 'two'),
  HER: S(HX - 60, fy(G.her.headY, 0.95, 700), 0.95, 'her'),
  FR: S(LX - 40, fy(LHS, 0.85, 700), 0.85, 'fr'), FR_ST: S(LX, fy(LHU, 0.92, 720), 0.92, 'fr'),
  DOOR: S(NX - 20, fy(G.nbr.headY, 0.8, 760), 0.8, 'door'),
  CHAIR: S(CHX + 40, fy(G.lauS.headY, 0.92, 720), 0.92, 'chair') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('her')) return SH.COVER; if (t < hev('fr')) return f(SH.HER); return f(SH.FR); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_f.t - 0.1) return f(SH.HER); if (t < e('scoot') - 0.05) return f(SH.FR); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_f.t - 0.1) return f(SH.HER); if (t < e('cush')) return f(SH.FR); return f(SH.WIDE); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_f.t - 0.1) return f(SH.HER); if (t < endOf('o3_f') + 0.1) return f(SH.FR); if (t < SP.o3_nar.t + 1.2) return f(SH.WIDE); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('two')) return f(SH.HER); if (t < endOf('o4_h') + 0.05) return f(SH.TWO); return f(SH.FR); }
  if (L === 'end') { if (t < e('door') - 0.05) return f(SH.WIDE); if (t < e('fly') - 0.1) return f(SH.DOOR); if (t < SP.end_f.t - 0.1) return f(SH.WIDE); if (t < endOf('end_f') + 0.15) return f(SH.CHAIR); return f(SH.WIDE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  UI.font(c, 'Unb9', 30); const rw = c.measureText('НАШЕ ЗА ГРАНИЦЕЙ').width + 56; c.fillStyle = C.olive; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -rw / 2, -165 - 30, rw, 52, 26); c.fill(); c.stroke(); c.fillStyle = C.white; c.fillText('НАШЕ ЗА ГРАНИЦЕЙ', 0, -165 - 3);
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 105, w: 980, h: 360, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI, aT = SC.outro.ev.ask;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Laura on a chair with the cake — owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gl = G.lauS; chair(c, 640, 0);
    const cp = cakePos(gl, true);
    K.put(c, LAU, { t, mood: 'happy', blink: 1, turn: -0.2, look: -0.4, legPose: 'sit', drop: DROP, armL: reach(gl, -1, cp.x - gl.sw, cp.y - 20, { planar: true }), armR: reach(gl, 1, cp.x + gl.sw, cp.y - 20, { planar: true }), items: {}, front: (cc) => cake(cc, cp.x, cp.y + 40, 0.85, t, true) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.2, items: {}, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.9, g.ySh + 60 + Math.sin(t * 8 + 1) * 20, { planar: true }) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const swap = P(t, aT - 0.12, aT + 0.05), q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap);
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const qa = eBack(P(t, aT - 0.05, aT + 0.3), 2.2);
  if (qa > 0) { c.save(); c.translate(540, 300); c.rotate(-0.02); c.scale(qa, qa); textFit(c, 'Unb9', 84, 'А ТЫ САДИШЬСЯ', 860); strokeText(c, 'А ТЫ САДИШЬСЯ', 0, -62, C.oliveD, C.white, 16); textFit(c, 'Unb9', 104, 'НА УГОЛ?', 900); strokeText(c, 'НА УГОЛ?', 0, 52, C.pink, C.white, 16); c.restore(); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.5, sp.t + sp.d - 0.9), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < aT - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); } Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  const r = drawWorld(c, t, L, cam, tag, sh), heads = r.heads, M = r.M; const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24);
  const names = { friend5: ['LAURA', '#C2508A'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4 && k !== 'nbr') onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_f: 0.05, o1_h: -0.12, o1_f: 0.05, o2_h: -0.12, o2_f: 0.05, o3_h: -0.12, o3_f: 0.05, o4_h: 0.05, o4_f: 0.05, end_f: 0.05 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('corner', NF, renderFrame);
