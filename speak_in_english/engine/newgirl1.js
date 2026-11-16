// «Новенькая», серия 1 «Пельмени» — story (choose what happens next), hard_cut camera: node newgirl1.js start end out.mp4 | --png=f1,f2
// Locations (world x offsets): cafeteria (0), Sonya's room (20000), classroom (40000), hallway (60000); UI inserts at 50000+.
// hook: Brittany knocks Sonya's tray — dumplings fly in slow motion. caf: "Dog food?" phones up; accent mocking; the room laughs.
// eagle: the last dumpling rolls to the doors — the school mascot (eagle costume) slips on it and crashes into the principal; coffee everywhere;
// "…Whose is this?" — the whole room points (open palms) at Sonya. leo: the nerd eats a dumpling from the floor: "These are amazing."
// video: her room, phone insert «NEW GIRL CAN'T SPEAK ENGLISH», views climb, a like from TYLER. class: SPEECH CONTEST — FRIDAY; WINNER board.
// night: mirror, pencil in her teeth; mum's video call with a pot of dumplings. fork (music silent): sign-up sheet; Brittany; split screen A / B.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/newgirl1/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// ep_kit.bubbles finds a scene's lines by the id prefix '<scene>_': prefix the character lines with their scene id (SP keeps the old keys)
for (const sp of TL.speech) { if (sp.who === 'nar' || sp.id.startsWith('hook_')) continue; const sc = TL.scenes.find(x => sp.t >= x.s && sp.t < x.e); sp.id = sc.id + '_' + sp.id; }
const HOLD = {}; for (const [k, v] of Object.entries({ hook_b: -0.1, b1: -0.25, h1: -0.2, b2: -0.3, p1: -0.2, l1: -0.25, c1: -0.25, b3: -0.3, l2: -0.2, h2: -0.2, b4: -0.25 })) HOLD[SP[k].id] = v;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'hoodie', col: '#E9A23B' }, bottom: { type: 'jeans', col: '#3E4F7A' } };
const PINK = { type: 'longsleeve', col: '#F06AA6' }, WJ = { type: 'jeans', col: '#E9EBF2' };
const BRIT = { ...BASE.chloe, top: PINK, bottom: WJ, earrings: '#F2C14E' };
const CL1 = { ...BASE.priya, top: PINK, bottom: WJ, hair: { style: 'highpony', col: '#2A1E16' } };
const CL2 = { ...BASE.rita, top: PINK, bottom: WJ, hair: { style: 'highpony', col: '#B5652E' } };
const LEO = { ...BASE.dan, cap: null, stubble: null, jaw: 1.0, iris: '#4A6A3A', hair: { style: 'curly', col: '#5A3A22' }, glasses: { col: '#2B2F3A' }, top: { type: 'sweater', col: '#6F8F4E' }, bottom: { type: 'jeans', col: '#4A5A7A' } };
const PRIN = { ...BASE.ben };
const CARSON = { ...BASE.linda, glasses: { col: '#8A5A3A' }, top: { type: 'cardigan', col: '#7A6FB0' } };
const MUM = { ...BASE.linda, hair: { style: 'bun', col: '#4A3020' }, top: { type: 'sweater', col: '#C0504D' } };
const STU = [['mark', '#4E7FC0'], ['priya', '#58A57A'], ['max', '#E07A4A'], ['jay', '#8E5BD0'], ['rita', '#3FA7B5'], ['kai', '#D9534F'], ['tom', '#F2B33D'], ['dan', '#5A6A8A']]
  .map(([k, col]) => ({ ...BASE[k], cap: null, top: { type: k === 'kai' ? 'tee' : 'hoodie', col } }));
const G = { her: geom(HER), britt1: geom(BRIT), cl1: geom(CL1), cl2: geom(CL2), leo1: geom(LEO), princ1: geom(PRIN), carson1: geom(CARSON) };
const GS = STU.map(geom);
const OX = { caf: 0, room: 20000, class: 40000, hall: 60000 };
const LOC = { hook: 'caf', caf: 'caf', eagle: 'caf', leo: 'caf', video: 'room', class: 'class', night: 'room', fork: 'hall' };
const XC = { her: -380, britt1: 300, cl1: 700, cl2: 1000, leo0: -1700, leo1: -900, door: 2250 };

// ---------------- props
function dumpling(c, x, y, r, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#FBF4E6'; c.strokeStyle = '#B9A88A'; c.lineWidth = Math.max(2, r * 0.12);
  c.beginPath(); c.moveTo(-r, r * 0.25); c.quadraticCurveTo(-r * 0.9, -r * 0.9, 0, -r * 0.85); c.quadraticCurveTo(r * 0.9, -r * 0.9, r, r * 0.25); c.quadraticCurveTo(0, r * 0.75, -r, r * 0.25); c.fill(); c.stroke();
  c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(i * r * 0.32, -r * 0.82); c.lineTo(i * r * 0.28, -r * 0.55); } c.stroke(); c.restore(); }
function heartIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 22); c.bezierCurveTo(-40, -6, -24, -38, 0, -18); c.bezierCurveTo(24, -38, 40, -6, 0, 22); c.fill(); c.restore(); }
function eyeIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(0, -24, 26, 0); c.quadraticCurveTo(0, 24, -26, 0); c.stroke(); c.fillStyle = col; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill(); c.restore(); }
// the tray with the dumpling box (sticker «MOM»); full = box closed with dumplings, tilt in radians
function tray(c, x, y, full, tilt = 0) { c.save(); c.translate(x, y); c.rotate(tilt);
  paint(c, q => { q.m(-230, -10); q.l(230, -10); q.l(210, 30); q.l(-210, 30); q.z(); }, '#E0474C', { sd: 5, hd: 2, lw: 4 });
  if (full) { paint(c, q => { q.m(-140, -12); q.l(140, -12); q.l(130, -120); q.l(-130, -120); q.z(); }, '#F4F1EC', { sd: 4, hd: 2, lw: 4 });
    for (let i = 0; i < 4; i++) dumpling(c, -90 + i * 60, -128, 30, (i - 1.5) * 0.15);
    c.fillStyle = '#FFE08A'; c.save(); c.translate(0, -66); c.rotate(-0.06); rr(c, -70, -26, 140, 52, 10); c.fill(); c.restore(); fitTxt(c, 'MOM', 0, -64, 38, '#C0504D', 120); }
  c.restore(); }
const handItem = draw => (ctx, a) => { ctx.save(); ctx.rotate(a - Math.PI / 2); ctx.translate(0, 40); draw(ctx); ctx.restore(); };
const phoneItem = (lit = true) => handItem(q => { paint(q, z => { z.m(-40, -72); z.l(40, -72); z.l(40, 72); z.l(-40, 72); z.z(); }, '#2B2F3A', { sd: 5, hd: 2, lw: 3 }); q.fillStyle = lit ? '#BFE6FF' : '#1A1E26'; rr(q, -33, -64, 66, 128, 8); q.fill(); });
const cupItem = handItem(q => { paint(q, z => { z.m(-34, -60); z.l(34, -60); z.l(28, 40); z.l(-28, 40); z.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 3 }); q.fillStyle = '#7A4A2A'; q.fillRect(-26, -20, 52, 24); });
const dumpItem = handItem(q => dumpling(q, 0, -10, 34));
const penItem = handItem(q => { q.fillStyle = '#3E73B8'; rr(q, -8, -80, 16, 110, 6); q.fill(); q.fillStyle = '#2B2F3A'; q.beginPath(); q.moveTo(-8, 30); q.lineTo(8, 30); q.lineTo(0, 48); q.fill(); });
const potItem = handItem(q => { paint(q, z => { z.m(-90, -40); z.l(90, -40); z.l(80, 70); z.l(-80, 70); z.z(); }, '#9AA4AE', { sd: 5, hd: 2, lw: 4 }); q.fillStyle = '#FBF4E6'; q.beginPath(); q.ellipse(0, -40, 90, 18, 0, 0, TAU); q.fill(); for (let i = 0; i < 4; i++) dumpling(q, -54 + i * 36, -52, 18, i * 0.3); });

// ---------------- the eagle mascot (big costume: brown body, white head, yellow beak, wings), feet at (x, y); s scale; rot (fall); flap 0..1
function eagle(c, x, y, s, rot = 0, flap = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (const sd of [-1, 1]) { c.fillStyle = '#F2B33D'; c.fillRect(sd * 70 - 30, -60, 60, 60); }
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 200, -900); c.rotate(sd * (0.3 + flap * 1.2)); paint(c, q => { q.m(0, 0); q.l(sd * 260, 120); q.l(sd * 230, 260); q.l(sd * 40, 380); q.z(); }, '#6A4126', { sd: 6, hd: 3, lw: 5 }); c.restore(); }
  paint(c, q => q.e(0, -560, 260, 520), '#7A4E2E', { sd: 8, hd: 4, lw: 6 });
  paint(c, q => q.e(0, -470, 150, 330), '#E9D8B8', { sd: 4, hd: 2, lw: 4 });
  paint(c, q => q.e(0, -1180, 220, 210), '#FFFFFF', { sd: 6, hd: 3, lw: 6 });
  paint(c, q => { q.m(-40, -1160); q.l(170, -1140); q.l(40, -1060); q.z(); }, '#F2B33D', { sd: 4, hd: 2, lw: 5 });
  for (const sd of [-1, 1]) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(sd * 80, -1230, 42, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.stroke(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(sd * 80 + 10, -1225, 18, 0, TAU); c.fill(); }
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-130, -1300); c.lineTo(-30, -1275); c.moveTo(130, -1300); c.lineTo(30, -1275); c.stroke();
  fitTxt(c, 'EAGLES', 0, -470, 64, '#7A4E2E', 240); c.restore(); }

// ---------------- backgrounds (prerendered, softly blurred), local coordinates around each location's 0
const BX0 = -2800, BY0 = -4400, BW = 5600, BH = 5600, BS = 0.5;
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
function floorTiles(c, a, b) { for (let y = -10, r = 0; y < BY0 + BH; y += 160, r++) for (let x = BX0, i = 0; x < BX0 + BW; x += 160, i++) { c.fillStyle = (i + r) % 2 ? a : b; c.fillRect(x, y, 160, 160); } }
function drawCaf(c) {
  c.fillStyle = '#DDEBD8'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.35)'; for (let y = -1600; y < 0; y += 120) c.fillRect(BX0, y, BW, 4);
  c.fillStyle = '#B9CFB2'; c.fillRect(BX0, -1700, BW, 40);
  for (const wx of [-2300, -1300, -300, 700]) { c.fillStyle = '#FFFFFF'; c.fillRect(wx - 20, -3500, 640, 1300); const g = c.createLinearGradient(0, -3480, 0, -2220); g.addColorStop(0, '#9FD2F0'); g.addColorStop(1, '#E6F2F6'); c.fillStyle = g; c.fillRect(wx, -3480, 600, 1260); c.fillStyle = '#FFFFFF'; c.fillRect(wx + 290, -3480, 20, 1260); c.fillRect(wx, -2870, 600, 20); }
  // banner GO EAGLES with a drawn eagle head
  c.fillStyle = '#7A4E2E'; rr(c, -1400, -2120, 1500, 300, 30); c.fill(); fitTxt(c, 'GO EAGLES!', -500, -1970, 150, '#F2B33D', 1100);
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-1250, -1970, 110, 0, TAU); c.fill(); c.fillStyle = '#F2B33D'; c.beginPath(); c.moveTo(-1250, -1980); c.lineTo(-1110, -1960); c.lineTo(-1230, -1920); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-1220, -2010, 16, 0, TAU); c.fill();
  // menu board
  c.fillStyle = '#2E4A3A'; rr(c, 300, -2150, 1100, 560, 20); c.fill(); c.strokeStyle = '#C08A50'; c.lineWidth = 24; c.stroke();
  fitTxt(c, 'LUNCH MENU', 850, -2060, 80, '#FFFFFF', 900); fitTxt(c, 'PIZZA  $3', 850, -1930, 64, '#F7E7A8', 900, 'Nun9'); fitTxt(c, 'TACOS  $3', 850, -1830, 64, '#F7E7A8', 900, 'Nun9'); fitTxt(c, 'SALAD  $2', 850, -1730, 64, '#F7E7A8', 900, 'Nun9');
  // the door frame on the right (the panels are live)
  c.fillStyle = '#9AA4AE'; c.fillRect(1950, -2450, 650, 2450); c.fillStyle = '#4A5060'; c.fillRect(2000, -2400, 550, 2400);
  fitTxt(c, 'EXIT', 2275, -2560, 70, '#E0474C', 300);
  // back tables (benches) — the students sit behind them (live)
  floorTiles(c, '#E9E3D6', '#D8CFBE');
}
function drawRoom(c) {
  c.fillStyle = '#E3D9F0'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.3)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 60, BH);
  // night window
  c.fillStyle = '#FFFFFF'; c.fillRect(-1820, -3120, 1040, 1320); c.fillStyle = '#1E2A4A'; c.fillRect(-1780, -3080, 960, 1240); c.fillStyle = '#F7E7A8'; c.beginPath(); c.arc(-1050, -2850, 90, 0, TAU); c.fill(); c.fillStyle = '#1E2A4A'; c.beginPath(); c.arc(-1010, -2880, 80, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,.8)'; for (const [sx, sy] of [[-1600, -2900], [-1400, -2600], [-1200, -2300], [-1700, -2200], [-1000, -2500]]) { c.beginPath(); c.arc(sx, sy, 8, 0, TAU); c.fill(); }
  c.fillStyle = '#FFFFFF'; c.fillRect(-1320, -3080, 30, 1240); c.fillRect(-1780, -2480, 960, 30);
  // a poster: the flag of Kazakhstan (blue, golden sun with rays and a soaring eagle)
  c.fillStyle = '#00AFCA'; c.fillRect(-500, -3000, 900, 560); c.fillStyle = '#FEC50C'; c.beginPath(); c.arc(-50, -2760, 90, 0, TAU); c.fill();
  c.strokeStyle = '#FEC50C'; c.lineWidth = 10; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; c.beginPath(); c.moveTo(-50 + Math.cos(a) * 110, -2760 + Math.sin(a) * 110); c.lineTo(-50 + Math.cos(a) * 150, -2760 + Math.sin(a) * 150); c.stroke(); }
  c.fillStyle = '#FEC50C'; c.beginPath(); c.moveTo(-230, -2600); c.quadraticCurveTo(-50, -2700, 130, -2600); c.quadraticCurveTo(-50, -2640, -230, -2600); c.fill(); c.fillRect(-460, -2980, 30, 520);
  // bed (left) with a plush snow leopard
  paint(c, q => { q.m(-2400, -900); q.l(-700, -900); q.l(-700, 0); q.l(-2400, 0); q.z(); }, '#8E7AB8', { sd: 8, hd: 4, lw: 5 }); c.fillStyle = '#F4F1EC'; rr(c, -2380, -1080, 1660, 220, 60); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -2350, -1260, 420, 220, 60); c.fill();
  c.fillStyle = '#E9E3EE'; c.beginPath(); c.ellipse(-1700, -1140, 180, 110, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(-1530, -1230, 80, 0, TAU); c.fill(); c.fillStyle = '#6A6A7A'; for (const [sx, sy] of [[-1750, -1150], [-1650, -1100], [-1800, -1080], [-1560, -1240], [-1700, -1200]]) { c.beginPath(); c.arc(sx, sy, 14, 0, TAU); c.fill(); }
  // mirror on a stand (right) — live reflection not drawn
  c.fillStyle = '#C08A50'; rr(c, 900, -2300, 560, 2300, 30); c.fill(); const g = c.createLinearGradient(940, -2260, 1420, -300); g.addColorStop(0, '#DDEEF6'); g.addColorStop(1, '#AFC9D8'); c.fillStyle = g; rr(c, 940, -2260, 480, 1960, 24); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(1000, -2200); c.lineTo(1100, -2200); c.lineTo(980, -1900); c.fill();
  c.fillStyle = '#B48A60'; c.fillRect(BX0, -10, BW, 2000); c.fillStyle = 'rgba(80,50,20,.12)'; for (let y = 40; y < 1600; y += 110) c.fillRect(BX0, y, BW, 6);
  c.fillStyle = '#5A8FB0'; c.beginPath(); c.ellipse(0, 60, 900, 90, 0, 0, TAU); c.fill(); }
function drawClass(c) {
  c.fillStyle = '#F2E6C8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#C08A50'; c.fillRect(-2160, -3260, 1860, 1220); c.fillStyle = '#2E5A44'; c.fillRect(-2120, -3220, 1780, 1140);
  c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(-2120, -3220, 1780, 1140);
  fitTxt(c, 'SPEECH CONTEST', -1230, -2900, 150, '#FFFFFF', 1600, 'Unb9'); fitTxt(c, '— FRIDAY —', -1230, -2650, 120, '#F7E7A8', 1500, 'Unb9');
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 10; c.beginPath(); c.moveTo(-1900, -2420); c.lineTo(-560, -2420); c.stroke();
  // WINNER board (3 years of Brittany)
  c.fillStyle = '#C9A06A'; rr(c, 100, -3260, 1700, 1100, 24); c.fill(); fitTxt(c, 'WINNER', 950, -3120, 110, '#7A3A2A', 1200);
  for (let i = 0; i < 3; i++) { const px = 380 + i * 560, py = -2620; c.fillStyle = '#FFFFFF'; c.fillRect(px - 210, py - 300, 420, 560); c.fillStyle = '#FBD8E6'; c.fillRect(px - 180, py - 270, 360, 380);
    c.fillStyle = '#E8C27A'; c.beginPath(); c.ellipse(px, py - 120, 110, 120, 0, 0, TAU); c.fill(); c.fillStyle = '#F6D2B6'; c.beginPath(); c.ellipse(px, py - 80, 80, 92, 0, 0, TAU); c.fill(); c.fillStyle = '#F06AA6'; c.beginPath(); c.ellipse(px, py + 110, 150, 80, 0, Math.PI, TAU); c.fill();
    c.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { c.beginPath(); c.arc(px + s * 28, py - 90, 8, 0, TAU); c.fill(); } c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.beginPath(); c.arc(px, py - 60, 30, 0.2, Math.PI - 0.2); c.stroke();
    fitTxt(c, 'BRITTANY', px, py + 170, 54, '#7A3A2A', 380); fitTxt(c, String(2024 + i), px, py + 230, 44, '#7A3A2A', 300, 'Nun9'); }
  c.fillStyle = '#9AA4AE'; c.fillRect(BX0, -1560, BW, 30); c.fillStyle = '#C89A6A'; c.fillRect(BX0, -10, BW, 2000); c.fillStyle = 'rgba(90,50,20,.12)'; for (let y = 40; y < 1600; y += 110) c.fillRect(BX0, y, BW, 6); }
function drawHall(c) {
  c.fillStyle = '#E6EEF5'; c.fillRect(BX0, BY0, BW, BH);
  for (let x = -2800; x < 2800; x += 300) { if (x > -1400 && x < -100) continue; c.fillStyle = (x / 300) % 2 ? '#3E73B8' : '#4A82C8'; c.fillRect(x + 10, -2500, 280, 2500); c.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 3; k++) c.fillRect(x + 60, -2400 + k * 60, 180, 14); c.fillStyle = '#C9D3DE'; rr(c, x + 220, -1300, 24, 120, 8); c.fill(); }
  // cork board with the sign-up sheet
  c.fillStyle = '#B07A4A'; rr(c, -1400, -2700, 1300, 1500, 24); c.fill(); c.fillStyle = '#C99A6A'; rr(c, -1360, -2660, 1220, 1420, 18); c.fill();
  c.fillStyle = '#FFFFFF'; c.save(); c.translate(-750, -1950); c.rotate(-0.02); c.fillRect(-380, -560, 760, 1120);
  fitTxt(c, 'SPEECH CONTEST', 0, -470, 74, '#2B2F3A', 680); fitTxt(c, 'SIGN UP', 0, -380, 60, '#E0474C', 600);
  c.strokeStyle = '#9AA4AE'; c.lineWidth = 5; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-300, -250 + i * 140); c.lineTo(300, -250 + i * 140); c.stroke(); fitTxt(c, (i + 1) + '.', -330, -275 + i * 140, 44, '#6A7A8A', 60, 'Nun9'); }
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, -555, 22, 0, TAU); c.fill();
  c.save(); c.font = 'italic 64px Nun9'; c.fillStyle = '#C0307A'; c.textAlign = 'left'; c.fillText('Brittany', -260, -282); c.restore(); c.restore();
  c.fillStyle = '#9AA4AE'; c.fillRect(BX0, -3000, BW, 60); floorTiles(c, '#D8DEE6', '#C8D0DA'); }
const BG = { caf: mkBG(drawCaf), room: mkBG(drawRoom), class: mkBG(drawClass), hall: mkBG(drawHall) };

// ---------------- pose helpers
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const down = (g, s) => reach(g, s, s * g.sw * 1.05, g.ySh + 520, { planar: true });
const chest = (g, s, dy = 330, k = 0.55) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const raise = (g, s, dy = 200) => reach(g, s, s * g.sw * 1.15, g.headY - dy, { planar: true });          // hand up beside the head (never behind it)
const toward = (g, s, dx, dy = 140) => reach(g, s, dx, g.ySh + dy, { planar: true });                     // an open palm pointing toward x (local)
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, b = 120) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };

// ---------------- states
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'neutral', turn: 0.2, look: 0.6 };
  if (L === 'hook' && t < ev('hook', 'land')) { st.armL = chest(g, -1, 330, 0.9); st.armR = chest(g, 1, 330, 0.9); }
  if (L === 'caf' || L === 'eagle' || L === 'leo') { st.armL = chest(g, -1, 420, 0.35); st.armR = chest(g, 1, 420, 0.35); }
  if (L === 'hook') { st.mood = 'happy'; if (t > ev('hook', 'push')) { st.mood = 'shock'; st.blink = 0; } if (t > ev('hook', 'land')) st.mood = 'sad'; }
  if (L === 'caf') { st.mood = 'sad'; st.lookY = 0.15;
    if (speaking('h1', t, 0.05, 0.1)) { st.mood = 'worried'; st.lookY = 0.1; }
    if (t > SP.b2.t) { st.mood = 'shock'; }
    if (t > e('laugh')) { st.mood = 'sad'; st.lookY = 0.35; st.look = 0.2; } }
  if (L === 'eagle') { st.mood = 'sad'; st.look = 0.9; if (t > e('fall')) { st.mood = 'shock'; st.blink = 0; } if (t > e('point')) { st.mood = 'worried'; st.look = 0.3; st.lookY = 0.2; } }
  if (L === 'leo') { st.mood = 'sad'; st.look = -0.8; st.turn = -0.2; if (t > SP.l1.t + 0.5) st.mood = 'surprised'; if (t > e('smile')) { st.mood = 'happy'; st.blink = 0; } }
  if (L === 'video') { st.mood = 'sad'; st.look = 0; st.turn = 0; st.lookY = 0.4; st.armR = chest(g, 1, 150, 0.6); st.items = { R: phoneItem(true) };
    if (t > e('down')) { st.armR = down(g, 1); st.items = {}; st.mood = 'sad'; st.lookY = 0.2; st.look = -0.5; } }
  if (L === 'class') { st.mood = 'neutral'; st.look = -0.6; st.turn = -0.15; st.armL = chest(g, -1, 360, 0.9); st.armR = chest(g, 1, 360, 0.9);
    if (t > SP.b3.t) { st.mood = 'annoyed'; st.look = -0.9; }
    if (t > SP.l2.t - 0.1) { st.mood = 'worried'; st.look = 0.7; st.turn = 0.2; } }
  if (L === 'night') { st.mood = 'neutral'; st.look = 0.8; st.turn = 0.3;
    if (t < e('drop') + 0.1) { st.mood = 'skeptical'; st.items = { pencil: true }; }
    if (t > e('drop') + 0.1) { st.mood = 'tired'; }
    if (t > e('call') - 0.05) { st.mood = 'happy'; st.look = 0; st.armR = chest(g, 1, 150, 0.6); st.items = { R: phoneItem(true) }; } }
  if (L === 'fork') { st.mood = 'neutral'; st.look = -0.7; st.turn = -0.25; st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 160, { planar: true }); st.items = { R: penItem };
    if (t > SP.b4.t - 0.05) { st.mood = 'shock'; st.blink = 0; st.look = 0.7; st.turn = 0.2; } }
  return st; }
function brittState(t, L, who = 'britt1') { const g = G[who], e = k => ev(L, k), st = { ...base(g, t, who), mood: 'smug', turn: -0.2, look: -0.7, armR: reach(g, 1, g.sw * 1.35, g.ySh + 380, { planar: true }) };   // hand on hip
  const lead = who === 'britt1';
  if (L === 'hook') { st.mood = 'smug'; if (lead && t < ev('hook', 'push') + 0.35) { const k = eOut(clamp((t - 0.1) / 0.35)); st.armL = reach(g, -1, lerp(-g.sw * 1.05, -(XC.britt1 - XC.her) + 120, k), lerp(g.ySh + 520, g.ySh + 300, k), { planar: true }); } }
  if (L === 'caf') { st.mood = 'smug';
    if (lead && speaking('b1', t, 0.05, 0.1)) { st.mood = 'skeptical'; st.armL = open(g, -1, 1.6, 60); }
    if (t > e('phones') - 0.1) { st.items = { L: phoneItem(true) }; st.armL = raise(g, -1, -120); }
    if (lead && speaking('b2', t, 0.05, 0.05)) { st.mood = 'happy'; st.laugh = true; gest(st, g, who, t, -1, 60); st.items = {}; }
    if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; st.armL = chest(g, -1, 330, 0.3); st.headY = Math.abs(Math.sin(t * 9)) * 8; } }
  if (L === 'eagle') { st.mood = 'smug'; st.look = 0.8; st.turn = 0.2; if (t > ev('eagle', 'fall')) { st.mood = 'shock'; st.blink = 0; } if (t > ev('eagle', 'point')) { st.mood = 'smug'; st.look = -0.7; st.turn = -0.2; st.armL = toward(g, -1, -g.sw * 2.2, 100); } if (lead && t > ev('eagle', 'smile')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'leo') { st.mood = 'skeptical'; st.look = -0.8; }
  if (L === 'class' && lead) { st.mood = 'smug'; st.look = -0.5; st.armL = chest(g, -1, 360, 0.9); st.armR = chest(g, 1, 360, 0.9);
    if (t > SP.b3.t - 0.35) { st.armR = raise(g, 1, 180); st.mood = 'happy'; } if (t > endOf('b3') + 0.6) { st.armR = chest(g, 1, 360, 0.9); st.mood = 'smug'; } }
  if (L === 'fork') { st.mood = 'smug'; st.look = -0.8; if (lead && speaking('b4', t, 0.05, 0.1)) { st.mood = 'smug'; st.tilt = -0.06; st.armL = open(g, -1, 1.4, 40); } }
  return st; }
function leoState(t, L) { const g = G.leo1, e = k => ev(L, k), st = { ...base(g, t, 'leo1'), mood: 'neutral', turn: 0.2, look: 0.7 };
  if (L === 'leo') { st.mood = 'neutral';
    if (t > e('eat') - 0.2) { const k = eOut(clamp((t - e('eat') + 0.2) / 0.4)); st.armR = reach(g, 1, lerp(g.sw * 1.05, g.sw * 0.25, k), lerp(g.ySh + 520, g.headY + g.hh * 0.75, k), { planar: true }); st.items = t < e('eat') + 0.5 ? { R: dumpItem } : {}; st.headFirst = false; }
    if (t > e('eat') + 0.45) { st.mood = 'surprised'; st.blink = 0; st.armR = down(g, 1); }
    if (speaking('l1', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'leo1', t, 1, 140); }
    if (t > endOf('l1')) { st.mood = 'happy'; } }
  if (L === 'class') { st.mood = 'neutral'; st.look = -0.6; st.armL = chest(g, -1, 360, 0.9); st.armR = chest(g, 1, 360, 0.9);
    if (speaking('l2', t, 0.05, 0.1)) { st.mood = 'worried'; st.look = -0.9; st.turn = -0.25; st.tilt = -0.08; } }
  return st; }
function prinState(t) { const g = G.princ1, e = k => ev('eagle', k), st = { ...base(g, t, 'princ1'), mood: 'neutral', turn: -0.2, look: -0.6, armR: chest(g, 1, 200, 0.9), items: { R: cupItem } };
  if (t > e('fall') - 0.05) { st.mood = 'shock'; st.blink = 0; st.items = {}; st.armL = open(g, -1, 1.9, -40); st.armR = open(g, 1, 1.9, -40); }
  if (t > e('hold')) { st.mood = 'tired'; st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 230, { planar: true }); st.items = { R: dumpItem }; st.armL = down(g, -1); st.blink = 0; }
  if (speaking('p1', t, 0.05, 0.1)) { st.mood = 'skeptical'; }
  return st; }
function carsonState(t) { const g = G.carson1, st = { ...base(g, t, 'carson1'), mood: 'happy', turn: 0.2, look: 0.6 }; gest(st, g, 'carson1', t, -1, 100); if (t > SP.b3.t) { st.mood = 'tired'; st.armL = open(g, -1, 1.5, 120); } return st; }
function student(i, t, L) { const g = GS[i], e = k => ev(L, k), st = { t, talk: 0, mood: 'neutral', turn: 0, look: (i % 2 ? 0.4 : -0.4), armL: down(g, -1), armR: down(g, 1), items: {} };
  if (L === 'hook' && t > ev('hook', 'land')) { st.mood = 'surprised'; }
  if (L === 'caf') { st.mood = 'surprised'; if (t > e('phones') + i * 0.1) { st.armR = raise(g, 1, -150); st.items = { R: phoneItem(true) }; st.mood = 'happy'; } if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; st.headY = Math.abs(Math.sin(t * 9 + i)) * 10; } }
  if (L === 'eagle') { st.mood = t > e('fall') ? 'shock' : 'surprised'; if (t > e('point')) { const sx = XC.her - SX[i]; st.mood = 'neutral'; st.blink = 1; st[sx < 0 ? 'armL' : 'armR'] = toward(g, sx < 0 ? -1 : 1, clamp(sx, -g.sw * 2.4, g.sw * 2.4), 60); } }
  if (L === 'leo') { st.mood = 'skeptical'; }
  return st; }
const SX = [-2500, -1900, -1350, -820, 1450, 1900, 2350, 2750];

// ---------------- the cafeteria (live)
function rolling(t) { const s = ev('eagle', 'roll'), sl = ev('eagle', 'slip'); const k = clamp((t - s) / (sl - s)); return { x: lerp(500, XC.door - 260, eIO(k)), rot: k * 14 }; }
const FLOORD = [[-900, 60, 0.4], [-200, 120, 2], [150, 40, 1], [520, 140, 2.6], [-620, 160, 0.8], [880, 70, 1.7], [-1300, 100, 1.2], [1250, 150, 0.2]];
function cafeteria(c, t, L) { const heads = {}, ox = OX.caf;
  c.drawImage(BG.caf, ox + BX0, BY0, BW, BH);
  // back table + students (scale .8, standing behind the long table)
  STU.forEach((cfg, i) => { K.put(c, cfg, student(i, t, L), ox + SX[i], -760, 0.66); });
  paint(c, q => { q.m(ox - 2800, -1240); q.l(ox + 2800, -1240); q.l(ox + 2800, -1170); q.l(ox - 2800, -1170); q.z(); }, '#F4F1EC', { sd: 4, hd: 2, lw: 5 });
  c.fillStyle = '#C9B79A'; c.fillRect(ox - 2800, -1170, 5600, 420);
  // doors (live panels) + the eagle and the principal
  const dOpen = L === 'eagle' ? eOut(clamp((t - ev('eagle', 'doors')) / 0.3)) : 0;
  for (const sd of [-1, 1]) { const w = 275 * (1 - dOpen * 0.85); c.fillStyle = '#7A8492'; c.fillRect(ox + XC.door + (sd < 0 ? -275 : 275 - w), -2400, w, 2400); c.fillStyle = 'rgba(200,230,250,.8)'; if (w > 120) c.fillRect(ox + XC.door + (sd < 0 ? -230 : 275 - w + 45), -2200, w - 90, 600); }
  if (L === 'eagle') { const e = k => ev('eagle', k), walk = clamp((t - e('doors') - 0.15) / (e('slip') - e('doors') - 0.15));
    const ex = lerp(XC.door + 150, XC.door - 330, walk), fall = eIn(clamp((t - e('slip')) / (e('fall') - e('slip') + 0.25)));
    const px = XC.door + 60 + lerp(0, -40, walk);
    heads.princ1 = K.put(c, PRIN, prinState(t), ox + px, 0);
    if (false) { const hd = heads.princ1; c.fillStyle = 'rgba(122,74,42,.85)'; c.beginPath(); c.ellipse(hd.x, hd.y - hd.hh * 0.85, hd.hh * 0.9, hd.hh * 0.35, 0, 0, TAU); c.fill(); for (let i = 0; i < 4; i++) { const u = ((t * 0.8 + i * 0.25) % 1); c.fillRect(hd.x - hd.hh * 0.6 + i * hd.hh * 0.4, hd.y - hd.hh * 0.6 + u * hd.hh * 1.2, 10, 26); } }
    if (t > e('doors')) eagle(c, ox + ex - fall * 180, 0, 0.82, -fall * 1.45, (t < e('slip') ? 0 : clamp((t - e('slip')) / 0.3)) * (fall < 1 ? 1 : 0.2));
    // coffee splash flying up and over
    if (t > e('coffee') && t < e('coffee') + 1.0) { const u = (t - e('coffee')) / 1.0; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22; c.fillStyle = '#7A4A2A'; c.beginPath(); c.arc(ox + px + Math.cos(a) * 600 * u, -1700 + Math.sin(a) * 900 * u + 1600 * u * u, 26, 0, TAU); c.fill(); } }
  }
  // dumplings on the floor (after the landing), the rolling one in the eagle scene
  const landed = L !== 'hook' || t > ev('hook', 'land');
  if (landed) FLOORD.forEach(([dx, dy, r], i) => { if (L === 'leo' && i === 1 && t > ev('leo', 'eat') - 0.2) return; const bounce = L === 'hook' ? Math.abs(Math.sin((t - ev('hook', 'land')) * 9 + i)) * 60 * Math.exp(-(t - ev('hook', 'land')) * 2.5) : 0; dumpling(c, ox + XC.her + dx, dy - 40 - bounce, 64, r); });
  if (L === 'eagle' && t < ev('eagle', 'slip') + 0.1) { const r = rolling(t); dumpling(c, ox + r.x, -40, 64, r.rot); }
  if (L === 'hook' && t >= ev('hook', 'push') && t < ev('hook', 'land')) { const u = (t - ev('hook', 'push')) / (ev('hook', 'land') - ev('hook', 'push')); FLOORD.forEach(([dx, dy, r], i) => { const x0 = XC.her + 60, y0 = G.her.ySh + 200; dumpling(c, ox + lerp(x0, XC.her + dx, u * u), lerp(y0, dy - 20, u * u) - Math.sin(u * Math.PI) * (300 + i * 50), 70, r + u * 8); }); }
  // characters
  if (L !== 'leo' || true) { heads.cl2 = K.put(c, CL2, brittState(t, L, 'cl2'), ox + XC.cl2, 0); heads.cl1 = K.put(c, CL1, brittState(t, L, 'cl1'), ox + XC.cl1, 0); heads.britt1 = K.put(c, BRIT, brittState(t, L), ox + XC.britt1, 0); }
  if (L === 'leo') { const k = eOut(clamp((t - ev('leo', 'walk')) / 0.9)); heads.leo1 = K.put(c, LEO, leoState(t, L), ox + lerp(XC.leo0, XC.leo1, k), 0); }
  heads.her = K.put(c, { ...HER, ...(L === 'caf' && t > ev('caf', 'ears') - 0.3 ? { blush: '#E8333F', blushA: 0.85 } : {}) }, herState(t, L), ox + XC.her, 0);
  // the tray in her hands
  { const g = G.her; if (L === 'hook' && t < ev('hook', 'land')) { const full = t < ev('hook', 'push'), tilt = -eOut(clamp((t - ev('hook', 'push')) / 0.2)) * 0.5; tray(c, ox + XC.her + 20, g.ySh + 300, full, tilt); }
    else { const u = L === 'hook' ? eIn(clamp((t - ev('hook', 'land')) / 0.3)) : 1; tray(c, ox + XC.her + 150, lerp(g.ySh + 300, -30, u), false, lerp(-0.5, 0.05, u)); } }
  if (L === 'eagle' && t > ev('eagle', 'coffee') + 0.6 && heads.princ1) { const hd = heads.princ1; c.fillStyle = 'rgba(122,74,42,.9)'; c.beginPath(); c.ellipse(hd.x, hd.y - hd.hh * 1.05, hd.hh * 0.95, hd.hh * 0.32, 0, 0, TAU); c.fill(); for (let i = 0; i < 4; i++) { const u = ((t * 0.8 + i * 0.25) % 1); c.fillRect(hd.x - hd.hh * 0.7 + i * hd.hh * 0.45, hd.y - hd.hh * 0.95 + u * hd.hh * 0.5, 12, 30); } }
  K.mark(c, 'tray', ox + XC.her, G.her.ySh + 250, 260);
  return heads; }

// ---------------- the room / class / hall (live)
function room(c, t, L) { const heads = {}, ox = OX.room; c.drawImage(BG.room, ox + BX0, BY0, BW, BH);
  if (L === 'video') heads.her = K.put(c, HER, herState(t, L), ox - 300, 0);
  if (L === 'night') { heads.her = K.put(c, HER, herState(t, L), ox + 650, 0);
    const hd = heads.her; if (t < ev('night', 'drop') + 0.1) { c.save(); c.translate(hd.x - hd.hh * 0.05, hd.y + hd.hh * 0.42); c.rotate(-0.08); c.fillStyle = '#F2C14E'; rr(c, -110, -10, 220, 20, 8); c.fill(); c.fillStyle = '#F6D2B6'; c.beginPath(); c.moveTo(110, -10); c.lineTo(140, 0); c.lineTo(110, 10); c.fill(); c.fillStyle = '#E9A0B0'; rr(c, -130, -10, 24, 20, 6); c.fill(); c.restore(); }
    else if (t < ev('night', 'drop') + 0.6) { const u = (t - ev('night', 'drop') - 0.1) / 0.5; c.save(); c.translate(hd.x, hd.y + hd.hh * 0.42 + u * u * 1400); c.rotate(u * 6); c.fillStyle = '#F2C14E'; rr(c, -110, -10, 220, 20, 8); c.fill(); c.restore(); } }
  return heads; }
function desk(c, x, y) { paint(c, q => { q.m(x - 330, y - 760); q.l(x + 330, y - 760); q.l(x + 330, y - 700); q.l(x - 330, y - 700); q.z(); }, '#C08A50', { sd: 5, hd: 2, lw: 4 }); c.fillStyle = '#A8763E'; c.fillRect(x - 300, y - 700, 600, 700); }
function classroom(c, t, L) { const heads = {}, ox = OX.class; c.drawImage(BG.class, ox + BX0, BY0, BW, BH);
  heads.carson1 = K.put(c, CARSON, carsonState(t), ox - 2350, 0);
  const SY = 330;   // seated: lower the body, the desk covers the legs
  heads.britt1 = K.put(c, BRIT, brittState(t, 'class'), ox - 1100, SY); desk(c, ox - 1100, 0);
  heads.her = K.put(c, HER, herState(t, 'class'), ox + 350, SY); desk(c, ox + 350, 0);
  heads.leo1 = K.put(c, LEO, leoState(t, 'class'), ox + 1150, SY); desk(c, ox + 1150, 0);
  return heads; }
function hallway(c, t, L) { const heads = {}, ox = OX.hall; c.drawImage(BG.hall, ox + BX0, BY0, BW, BH);
  const k = eOut(clamp((t - SC.fork.s - 0.2) / 0.7));
  heads.cl2 = K.put(c, CL2, brittState(t, 'fork', 'cl2'), ox + lerp(2400, 1500, k), 0); heads.cl1 = K.put(c, CL1, brittState(t, 'fork', 'cl1'), ox + lerp(2100, 1150, k), 0);
  heads.britt1 = K.put(c, BRIT, brittState(t, 'fork'), ox + lerp(1700, 650, k), 0);
  heads.her = K.put(c, HER, herState(t, 'fork'), ox - 150, 0);
  K.mark(c, 'sheet', ox - 750, -1950, 500);
  return heads; }
function world(c, t, L) { const loc = LOC[L]; return loc === 'caf' ? cafeteria(c, t, L) : loc === 'room' ? room(c, t, L) : loc === 'class' ? classroom(c, t, L) : hallway(c, t, L); }

// ---------------- shots
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = {
  COVER: S(-40, fy(HY('her'), 0.62, 900), 0.62, 'cover'), TRAY: S(XC.her + 200, -1400, 0.85, 'tray'),
  WIDE: S(250, fy(HY('her'), 0.45, 1250), 0.45, 'wide'), HER: S(XC.her + 60, fy(HY('her'), 1.0, 860), 1.0, 'her'), HER_CU: S(XC.her + 40, fy(HY('her'), 1.3, 900), 1.3, 'her'),
  BRIT: S(XC.britt1 + 260, fy(HY('britt1'), 0.85, 860), 0.85, 'brit'), BRIT_CU: S(XC.britt1 + 30, fy(HY('britt1'), 1.3, 900), 1.3, 'brit'),
  STUD: S(500, -1450, 0.55, 'stud'), DOOR: S(XC.door - 300, fy(HY('princ1'), 0.5, 980), 0.5, 'door'), FLOOR: S(1350, -350, 0.8, 'floor'),
  PRIN: S(XC.door, fy(HY('princ1'), 1.0, 860), 1.0, 'prin'), POINT: S(-100, fy(HY('her'), 0.45, 1250), 0.45, 'point'),
  LEO2: S(-640, fy(HY('her'), 0.75, 820), 0.75, 'leo2'), LEO: S(XC.leo1 - 40, fy(HY('leo1'), 1.0, 860), 1.0, 'leo'),
  ROOM: S(OX.room - 300, fy(HY('her'), 0.62, 900), 0.62, 'room'), ROOM_CU: S(OX.room - 280, fy(HY('her'), 1.25, 900), 1.25, 'room'),
  CLASS: S(OX.class - 600, -1350, 0.36, 'class'), CARSON: S(OX.class - 2250, fy(HY('carson1'), 0.95, 860), 0.95, 'carson'),
  BRIT_CL: S(OX.class - 1100, fy(HY('britt1') + 330, 1.0, 860), 1.0, 'britcl'), BOARD: S(OX.class + 950, -2700, 0.62, 'board'), SL: S(OX.class + 750, fy(HY('her') + 330, 0.8, 820), 0.8, 'sl'),
  MIRROR: S(OX.room + 850, fy(HY('her'), 1.05, 880), 1.05, 'mirror'),
  HALL: S(OX.hall - 250, fy(HY('her'), 0.45, 1150), 0.45, 'hall'), SHEET: S(OX.hall - 650, -1900, 0.85, 'sheet'), HALL2: S(OX.hall + 250, fy(HY('britt1'), 0.85, 860), 0.85, 'hall2'),
  VIDEO: U('video', 1), CALL: U('call', 2), SPLIT: U('split', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < 0.4) return SH.COVER; if (t < e('land')) return f(SH.TRAY); return f(SH.WIDE); }
  if (L === 'caf') { if (t < e('phones') - 0.05) return f(SH.BRIT); if (t < SP.h1.t - 0.1) return f(SH.STUD); if (t < SP.b2.t - 0.1) return f(SH.HER); if (t < e('laugh')) return f(SH.BRIT_CU); if (t < SP.n1.t - 0.05) return f(SH.WIDE); return f(SH.HER_CU); }
  if (L === 'eagle') { if (t < e('doors') - 0.05) return f(SH.FLOOR); if (t < e('hold') - 0.05) return f(SH.DOOR); if (t < e('point') - 0.05) return f(SH.PRIN); if (t < e('smile') - 0.05) return f(SH.POINT); return f(SH.BRIT_CU); }
  if (L === 'leo') { if (t < SP.l1.t - 0.1) return f(SH.LEO2); if (t < e('smile') - 0.05) return f(SH.LEO); if (t < SP.n2.t) return f(SH.HER_CU); return f(SH.LEO2); }
  if (L === 'video') { if (t < e('phone')) return f(SH.ROOM); if (t < e('down') - 0.1) return f(SH.VIDEO); return f(SH.ROOM_CU); }
  if (L === 'class') { if (t < SP.c1.t - 0.1) return f(SH.CLASS); if (t < SP.b3.t - 0.1) return f(SH.CARSON); if (t < e('board') - 0.05) return f(SH.BRIT_CL); if (t < SP.l2.t - 0.1) return f(SH.BOARD); return f(SH.SL); }
  if (L === 'night') { if (t < e('call') + 0.3) return f(SH.MIRROR); return f(SH.CALL); }
  if (L === 'fork') { if (t < SP.b4.t - 0.6) return f(SH.HALL); if (t < SP.b4.t - 0.1) return f(SH.SHEET); if (t < e('split') - 0.05) return f(SH.HALL2); return f(SH.SPLIT); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const PS = 1.45, PY = 860;
function insertPhone(c, t, t0, screen) { const k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6); K.phone(c, 540, PY, PS * k, screen, 0); }
function videoView(c, t) { backdrop(c, t, '#2B2F3A', '#1A1E26'); const e = k => ev('video', k);
  insertPhone(c, t, e('phone'), (q, w, h) => { q.fillStyle = '#111318'; q.fillRect(0, 0, w, h);
    // the clip: Sonya with an empty tray, dumplings on the floor
    q.fillStyle = '#DDEBD8'; q.fillRect(0, 70, w, 300); q.save(); q.beginPath(); q.rect(0, 70, w, 300); q.clip(); K.put(q, HER, { t, talk: 0, mood: 'sad', turn: 0.1, look: 0.2, lookY: 0.3, armL: chest(G.her, -1, 330, 0.9), armR: chest(G.her, 1, 330, 0.9), items: {} }, w / 2, 520, 0.28);
    for (const [dx, r] of [[-120, 0.4], [-40, 2], [90, 1]]) dumpling(q, w / 2 + dx, 360, 14, r); q.restore();
    q.fillStyle = '#E0474C'; rr(q, 14, 84, 70, 30, 8); q.fill(); fitTxt(q, 'LIVE', 49, 99, 20, '#FFFFFF', 60, 'Nun9');
    fitTxt(q, "NEW GIRL CAN'T", 18, 410, 34, '#FFFFFF', w - 36, 'Unb9', 'left'); fitTxt(q, 'SPEAK ENGLISH', 18, 450, 34, '#FFFFFF', w - 36, 'Unb9', 'left');
    const views = Math.round(lerp(2.1, 5.0, eIO(clamp((t - e('views')) / 1.5))) * 10) / 10; eyeIcon(q, 40, 500, 0.8, '#B9C1CA'); fitTxt(q, views.toFixed(1) + 'K views', 72, 500, 28, '#B9C1CA', 300, 'Nun9', 'left');
    const cm = [['@kyle_22', 'lol'], ['@madison.b', 'dog food'], ['@tre', 'go home']]; cm.forEach(([u, m], i) => { const k = clamp((t - e('comments') - i * 0.35) / 0.2); if (k <= 0) return; q.globalAlpha = k; fitTxt(q, u, 18, 548 + i * 44, 22, '#8A93A0', 200, 'Nun9', 'left'); fitTxt(q, m, 150, 548 + i * 44, 26, '#FFFFFF', 250, 'Nun9', 'left'); q.globalAlpha = 1; });
    const lk = eBack(clamp((t - e('like')) / 0.3), 2); if (lk > 0) { q.save(); q.translate(w / 2, 700); q.scale(lk, lk); q.fillStyle = '#F6F6F8'; rr(q, -190, -32, 380, 64, 32); q.fill(); heartIcon(q, -150, 2, 0.8, '#E0474C'); fitTxt(q, 'tyler liked this', 20, 0, 28, '#2B2F3A', 300, 'Nun9'); q.restore(); } }); }
function callView(c, t) { backdrop(c, t, '#F7D0DC', '#E8A0B8'); const e = k => ev('night', k);
  insertPhone(c, t, e('call') + 0.3, (q, w, h) => { const g = q.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#F4E3C8'); g.addColorStop(1, '#E9CFA6'); q.fillStyle = g; q.fillRect(0, 0, w, h);
    q.fillStyle = '#C8A070'; q.fillRect(0, h * 0.62, w, h * 0.38);   // kitchen counter
    const gm = geom(MUM), st = { t, talk: speaking('mum', t) ? talk('nar', t) : 0, mood: 'happy', turn: 0, look: 0, armL: chest(gm, -1, 240, 0.9), armR: chest(gm, 1, 240, 0.9), items: {} };
    if (t > e('pot') - 0.1) { st.armL = reach(gm, -1, -gm.sw * 0.8, gm.ySh + 120, { planar: true }); st.armR = reach(gm, 1, gm.sw * 0.8, gm.ySh + 120, { planar: true }); st.items = { R: potItem }; }
    K.put(q, MUM, st, w / 2, h * 1.18, 0.42);
    fitTxt(q, 'MOM', w / 2, 40, 30, '#2B2F3A', 200, 'Unb9'); q.fillStyle = '#4CAF6A'; q.beginPath(); q.arc(w / 2 - 62, 40, 8, 0, TAU); q.fill(); }); }
function splitView(c, t) { const e = k => ev('fork', k), k = eOut(clamp((t - e('split')) / 0.35));
  c.fillStyle = '#F2C14E'; c.fillRect(0, 0, W / 2, HH); c.fillStyle = '#5BA0E0'; c.fillRect(W / 2, 0, W / 2, HH);
  c.save(); c.translate(W / 4, 520); c.scale(k, k); UI.font(c, 'Unb9', 260); UI.strokeText(c, 'А', 0, 0, C.oliveD, C.white, 18); c.restore();
  c.save(); c.translate(W * 3 / 4, 520); c.scale(k, k); UI.font(c, 'Unb9', 260); UI.strokeText(c, 'Б', 0, 0, C.oliveD, C.white, 18); c.restore();
  // A: the sign-up sheet with her name being written
  c.save(); c.translate(W / 4, 900); c.scale(k * 0.9, k * 0.9); c.fillStyle = '#FFFFFF'; c.fillRect(-190, -240, 380, 480); fitTxt(c, 'SIGN UP', 0, -190, 40, '#E0474C', 320);
  c.save(); c.font = 'italic 40px Nun9'; c.fillStyle = '#C0307A'; c.textAlign = 'left'; c.fillText('1. Brittany', -160, -110); c.fillStyle = '#3E73B8'; const nm = '2. Sonya'; c.fillText(nm.slice(0, Math.floor(clamp((t - e('split') - 0.4) / 1.2) * nm.length)), -160, -30); c.restore(); c.restore();
  // B: a phone with her video
  c.save(); c.translate(W * 3 / 4, 900); c.scale(k * 0.62, k * 0.62); K.phone(c, 0, 0, 1, (q, w, h) => { q.fillStyle = '#111318'; q.fillRect(0, 0, w, h); q.fillStyle = '#F4E3C8'; q.fillRect(0, 60, w, 420); for (let i = 0; i < 5; i++) dumpling(q, 90 + i * 60, 300, 28, i * 0.3); fitTxt(q, 'HOW TO MAKE', w / 2, 530, 40, '#FFFFFF', w - 40); fitTxt(q, 'DUMPLINGS', w / 2, 585, 50, '#F2C14E', w - 40); fitTxt(q, '— for Brittany', w / 2, 645, 34, '#FFFFFF', w - 40, 'Nun9'); }); c.restore();
  c.save(); c.globalAlpha = k; fitTxt(c, 'КОНКУРС', W / 4, 1250, 64, C.oliveD, 480); fitTxt(c, 'ВИДЕО-ОТВЕТ', W * 3 / 4, 1250, 58, '#FFFFFF', 480); c.restore();
  c.fillStyle = C.oliveD; c.fillRect(W / 2 - 6, 0, 12, HH); }
const VIEWS = { 'ui:video': videoView, 'ui:call': callView, 'ui:split': splitView };

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 0.25, 0.4); if (a <= 0) return; const lines = TL.cfg.hook_title;
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  c.fillStyle = C.pink; rr(c, -470, -215, 260, 64, 20); c.fill(); UI.textFit(c, 'Unb9', 34, 'СЕРИЯ 1', 220); c.fillStyle = C.white; c.fillText('СЕРИЯ 1', -340, -183); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
function chapter(c, t, txt) { c.save(); UI.font(c, 'Unb9', 40); const w = c.measureText(txt).width + 60; c.fillStyle = 'rgba(43,47,58,.82)'; rr(c, 540 - w / 2, 150, w, 70, 35); c.fill(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 540, 187); c.restore(); }

// ---------------- end screen: А / Б buttons, СОХРАНИ, ПОДПИСАТЬСЯ (cursor); the ask line big at the top
function endScreen(c, t) { const s = SC.outro.s, u = t - s, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gl = G.leo1; K.put(c, LEO, { t, mood: 'happy', turn: -0.2, look: -0.4, armL: open(gl, -1, 1.6, 60), armR: down(gl, 1), items: { L: dumpItem } }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: down(g, 1) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const askK = eBack(P(t, ask.t - 0.1, ask.t + 0.2), 2.0), q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - P(t, ask.t - 0.25, ask.t - 0.1));
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 66); strokeText(c, 'ЧТО ДЕЛАТЬ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'СОНЕ?', 0, 40, C.pink, C.white, 14); c.restore(); }
  if (askK > 0) { c.save(); c.translate(540, 300); c.scale(askK, askK); textFit(c, 'Unb9', 66, 'А ТЕБЯ ТРАВИЛИ', 900); strokeText(c, 'А ТЕБЯ ТРАВИЛИ', 0, -50, C.oliveD, C.white, 14); textFit(c, 'Unb9', 78, 'В ШКОЛЕ?', 900); strokeText(c, 'В ШКОЛЕ?', 0, 45, C.pink, C.white, 14); c.restore(); }
  [['А', 'КОНКУРС', '#F2C14E', C.oliveD], ['Б', 'ВИДЕО-ОТВЕТ', '#5BA0E0', C.white]].forEach(([l, txt, col, tc], i) => { const kk = eBack(P(t, s + 0.6 + i * 0.25, s + 0.9 + i * 0.25), 2.2); if (kk <= 0) return;
    c.save(); c.translate(540, 620 + i * 210); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -400 + 8, -85 + 12, 800, 170, 40); c.fill(); c.fillStyle = col; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -400, -85, 800, 170, 40); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = tc; c.textAlign = 'center'; c.fillText(l, -300, 8); textFit(c, 'Unb9', 62, txt, 520); c.fillText(txt, 60, 6); c.restore(); });
  const svT = s + 1.2, sk = eBack(P(t, svT, svT + 0.3), 2.2);
  if (sk > 0) { c.save(); c.translate(540, 1080); c.scale(sk, sk); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill(); textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = svT + 0.6, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1260;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  // the phrase of the episode
  const pk = eBack(P(t, s + 0.3, s + 0.6), 2); if (pk > 0) { c.save(); c.translate(540, 1460); c.scale(pk, pk); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -430, -70, 860, 140, 30); c.fill(); c.stroke(); textFit(c, 'Nun9', 30, 'ФРАЗА СЕРИИ', 700); c.fillStyle = C.pink; c.fillText('ФРАЗА СЕРИИ', 0, -36); textFit(c, 'Unb9', 46, "Don't even think about it.", 780); c.fillStyle = C.oliveD; c.fillText("Don't even think about it.", 0, 20); c.restore(); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

const CHAP = { video: 'ВЕЧЕРОМ', class: 'НА СЛЕДУЮЩИЙ ДЕНЬ', night: 'НОЧЬЮ', fork: 'УТРОМ' };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { VIEWS[tag](c, t); heads = {}; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  // slow motion tint on the tray close-up
  if (tag === 'tray') { c.fillStyle = 'rgba(255,240,200,.12)'; c.fillRect(0, 0, W, HH); }
  const names = { britt1: ['BRITTANY', '#F06AA6'], leo1: ['LEO', '#6F8F4E'], princ1: ['PRINCIPAL', '#5A6A8A'], carson1: ['MISS CARSON', '#7A6FB0'] }, onScr = {};
  for (const k in heads) { const p = proj(heads[k]); if (p.x > 40 && p.x < W - 40) onScr[k] = heads[k]; }
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: HOLD });
  if (L === 'hook') title(c, t);
  if (CHAP[L] && t < sc.s + 1.4 && !tag.startsWith('ui:')) chapter(c, t, CHAP[L]);
  UI.captions(c, t); if (L !== 'fork' || t < ev('fork', 'split')) UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'fork' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('newgirl1', NF, renderFrame);
