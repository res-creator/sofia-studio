// "Парень подарил на годовщину абонемент в спортзал" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node gymgift.js start end out.mp4 | --png=f1,f2
// Their living room on the anniversary evening (garland HAPPY ANNIVERSARY, balloons, candles; a window onto the street with his car).
// hook: he holds out a pink envelope with a bow, a FIT CLUB card inside: "Happy anniversary! Twelve months… of gym!" — she freezes; comment plate; card insert.
// 1 · ХОЛОДНО: "Gym. For me. Why?" -> "For balance! I got myself a pizza voucher." -> he proudly whips out his own pizza voucher and hugs it.
// 2 · С ЮМОРОМ: "couples' push-ups?" -> "Yes! I booked us a trainer!" -> phone insert: a huge trainer flexing, BOOKED -> her shocked face.
// 3 · КАК НОСИТЕЛЬ: "It's not really an anniversary gift, is it?" -> "…No. It was on sale." -> he hides the envelope (SALE sticker) behind his back + Bella tip.
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: "...to run away from men who give gym cards" (she mimes running) -> "Wait, there's a second envelope!" -> he frantically pats his pockets.
// Twist (music silent): she reads the card: MEMBER: WILL (circled) -> "Oh. That one's mine. Yours is the flowers in the car." -> the car outside with a bouquet -> moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/gymgift/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 treats hold 0 as 0.9 and clamps, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05, hold: 0.05 } : sp, t, an, side, name); }
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, hair: { style: 'long', col: '#3A2820', len: 1.5 }, top: { type: 'longsleeve', col: '#D94A6A' }, bottom: { type: 'skirt', col: '#3A3050' }, shoes: { col: '#2B2233', acc: '#F2C14E' } };
const BF = { ...BASE.tom, hair: { style: 'quiff', col: '#6A4126' }, top: { type: 'blazer', col: '#3E5A8A', shirt: '#FFFFFF', tie: '#E0474C' }, bottom: { type: 'trousers', col: '#2E3A4C' }, shoes: { col: '#3A2A20', acc: null } };
const G = { her: geom(HER), bf: geom(BF) };
const X = { her: -300, bf: 460 }, WX0 = 1050, WX1 = 1850, WY0 = -2250, WY1 = -950, TBX = -1350;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function star(c, x, y, r, a = 1, col = '#FFF6C8') { c.save(); c.globalAlpha *= a; c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; c.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } c.closePath(); c.fill(); c.restore(); }
// heart drawn with paths (fonts have no ♥)
function heart(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.35); c.bezierCurveTo(-r * 1.2, -r * 0.5, -r * 0.55, -r * 1.35, 0, -r * 0.6); c.bezierCurveTo(r * 0.55, -r * 1.35, r * 1.2, -r * 0.5, 0, r * 0.35); c.closePath(); c.fill(); c.restore(); }
function check(c, x, y, s, col = '#FFFFFF', lw = 10) { c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - s, y); c.lineTo(x - s * 0.3, y + s * 0.7); c.lineTo(x + s, y - s * 0.8); c.stroke(); c.restore(); }

// ---------------- props (all drawn with paths; English only on the props)
// gym card; (0,0) = centre, 360x220 at s = 1
function gymCard(c, s = 1, member = true) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-180, -110); q.l(180, -110); q.l(180, 110); q.l(-180, 110); q.z(); }, '#1F6F78', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#F2C14E'; c.fillRect(-180, -110 + 150, 360, 16);
  // dumbbell icon
  c.fillStyle = '#FFFFFF'; c.fillRect(-150, -66, 70, 12); for (const x of [-156, -86]) rr(c, x, -84, 14, 48, 4), c.fill(); for (const x of [-166, -76]) rr(c, x, -76, 10, 32, 3), c.fill();
  fitTxt(c, 'FIT CLUB', 40, -62, 58, '#FFFFFF', 240); fitTxt(c, '12 MONTHS', 0, 4, 40, '#F2C14E', 320);
  if (member) fitTxt(c, 'MEMBER: WILL', -40, 82, 26, '#FFFFFF', 250, 'Nun9');
  c.restore(); }
// pink gift envelope with a gold bow; open = flap open, card = the card sticks out; sale = the SALE sticker on the back
function envelope(c, s = 1, card = 0, sale = false) { c.save(); c.scale(s, s);
  if (card > 0) { c.save(); c.translate(0, -60 - 70 * card); c.rotate(-0.06); gymCard(c, 0.78, false); c.restore(); }
  paint(c, q => { q.m(-170, -100); q.l(170, -100); q.l(170, 100); q.l(-170, 100); q.z(); }, '#F59BBE', { sd: 6, hd: 3, lw: 4 });
  c.strokeStyle = 'rgba(160,40,90,.35)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-170, 100); c.lineTo(0, -10); c.lineTo(170, 100); c.stroke();
  c.fillStyle = '#F2C14E'; c.fillRect(-14, -100, 28, 200); c.fillRect(-170, -14, 340, 28);
  for (const sg of [-1, 1]) paint(c, q => { q.m(0, 0); q.b(sg * 70, -70, sg * 90, 30, 0, 0); q.z(); }, '#F2C14E', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#D99A2A'; c.beginPath(); c.arc(0, 0, 16, 0, TAU); c.fill();
  if (sale) { c.save(); c.translate(100, 50); c.rotate(-0.25); c.fillStyle = '#E0474C'; c.beginPath(); for (let i = 0; i < 20; i++) { const r = i % 2 ? 62 : 74, a = i / 20 * TAU; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); fitTxt(c, 'SALE', 0, -14, 34, '#FFFFFF', 100); fitTxt(c, '-50%', 0, 22, 32, '#FFF2B0', 100); c.restore(); }
  c.restore(); }
// pizza voucher (yellow ticket with a slice)
function voucher(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-170, -95); q.l(170, -95); q.l(170, -25); q.q(145, 0, 170, 25); q.l(170, 95); q.l(-170, 95); q.l(-170, 25); q.q(-145, 0, -170, -25); q.z(); }, '#FFD54A', { sd: 6, hd: 3, lw: 4 });
  c.setLineDash([12, 10]); c.strokeStyle = '#C98A1A'; c.lineWidth = 4; c.beginPath(); c.moveTo(-60, -85); c.lineTo(-60, 85); c.stroke(); c.setLineDash([]);
  c.save(); c.translate(-115, 5); paint(c, q => { q.m(-40, -50); q.q(0, -66, 40, -50); q.l(0, 60); q.z(); }, '#F2B33D', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#D9534F'; for (const [x, y] of [[-12, -28], [14, -22], [0, 8]]) { c.beginPath(); c.arc(x, y, 10, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; c.fillRect(-40, -56, 80, 10); c.restore();
  fitTxt(c, 'PIZZA', 55, -36, 62, '#B8343E', 210); fitTxt(c, '12 MONTHS', 55, 30, 34, '#7A4A10', 210); c.restore(); }
// phone (screen faces the camera); (0,0) = centre
function phoneSmall(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-60, -110); q.l(60, -110); q.l(60, 110); q.l(-60, 110); q.z(); }, '#2B2F3A', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#8EC9F0'; rr(c, -50, -96, 100, 186, 10); c.fill(); c.fillStyle = '#E8A13A'; c.beginPath(); c.arc(0, -10, 34, 0, TAU); c.fill(); c.fillStyle = '#4CAF6A'; rr(c, -40, 50, 80, 24, 8); c.fill(); c.restore(); }
// bouquet (in the car / in his hands on the end screen)
function bouquet(c, s = 1) { c.save(); c.scale(s, s);
  c.strokeStyle = '#4E8A3A'; c.lineWidth = 8; for (const a of [-0.3, -0.1, 0.1, 0.3]) { c.beginPath(); c.moveTo(0, 120); c.lineTo(Math.sin(a) * 140, -60); c.stroke(); }
  const fl = [[-70, -90, '#EE5E9A'], [0, -120, '#E0474C'], [70, -90, '#F7A8C8'], [-35, -40, '#F2C14E'], [40, -45, '#EE5E9A']];
  for (const [x, y, col] of fl) { c.fillStyle = col; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.beginPath(); c.arc(x + Math.cos(a) * 22, y + Math.sin(a) * 22, 20, 0, TAU); c.fill(); } c.fillStyle = '#FFF2B0'; c.beginPath(); c.arc(x, y, 14, 0, TAU); c.fill(); }
  paint(c, q => { q.m(-80, 10); q.l(80, 10); q.l(25, 150); q.l(-25, 150); q.z(); }, '#9C7BD0', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#F2C14E'; c.fillRect(-30, 70, 60, 16); c.restore(); }
const cardItem = (s = 0.42, rot = 0.1) => ctx => { ctx.save(); ctx.translate(0, -50); ctx.rotate(rot); gymCard(ctx, s); ctx.restore(); };
const envItem = (card = 0, sc = 0.62) => ctx => { ctx.save(); ctx.translate(0, -40 * sc / 0.62); ctx.rotate(0.05); envelope(ctx, sc, card); ctx.restore(); };
const voucherItem = ctx => { ctx.save(); ctx.translate(0, -50); ctx.rotate(-0.08); voucher(ctx, 0.85); ctx.restore(); };
const phoneItem = ctx => { ctx.save(); ctx.translate(0, -60); phoneSmall(ctx, 0.9); ctx.restore(); };
const bouquetItem = ctx => { ctx.save(); ctx.translate(0, -90); ctx.rotate(-0.15); bouquet(ctx, 0.75); ctx.restore(); };

// ---------------- the car outside the window (red hatchback, bouquet on the back seat)
function car(c, t, glow = 0) { c.save();
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 10, 330, 26, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-320, -40); q.q(-320, -150, -230, -160); q.l(-140, -270); q.q(-100, -300, 0, -300); q.l(120, -300); q.q(170, -300, 210, -250); q.l(280, -165); q.q(330, -150, 330, -60); q.l(330, -40); q.z(); }, '#E0474C', { sd: 10, hd: 5, lw: 4 });
  c.fillStyle = '#B9E0F5'; c.beginPath(); c.moveTo(-200, -170); c.lineTo(-125, -262); c.lineTo(-10, -262); c.lineTo(-10, -170); c.closePath(); c.fill(); c.beginPath(); c.moveTo(10, -170); c.lineTo(10, -262); c.lineTo(115, -262); c.lineTo(190, -170); c.closePath(); c.fill();
  // bouquet on the back seat (behind the rear side window)
  c.save(); c.beginPath(); c.moveTo(-200, -170); c.lineTo(-125, -262); c.lineTo(-10, -262); c.lineTo(-10, -170); c.closePath(); c.clip(); c.translate(-100, -150); c.rotate(-0.2); bouquet(c, 0.62); c.restore();
  for (const x of [-190, 190]) { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x, -30, 58, 0, TAU); c.fill(); c.fillStyle = '#B8BEC8'; c.beginPath(); c.arc(x, -30, 24, 0, TAU); c.fill(); }
  const bl = glow > 0 && Math.sin(t * 9) > 0; c.fillStyle = bl ? '#FFE38A' : '#F2B33D'; rr(c, 300, -120, 34, 30, 8); c.fill(); c.fillStyle = bl ? '#FF8A80' : '#9A2A2A'; rr(c, -334, -120, 26, 32, 8); c.fill();
  c.restore(); }

// ---------------- the living room (prerendered, softly blurred)
const BX0 = -3300, BY0 = -3800, BW = 6600, BH = 5400, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F6E2DA'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(220,140,150,.10)'; for (let x = BX0; x < BX0 + BW; x += 200) for (let y = BY0 + 40; y < -100; y += 200) heart(c, x + ((y / 200) % 2 ? 100 : 0), y, 22, 'rgba(220,120,140,.12)');
  // window with the evening street and his car
  const g = c.createLinearGradient(0, WY0, 0, WY1); g.addColorStop(0, '#3A3F7A'); g.addColorStop(0.6, '#8A6FA8'); g.addColorStop(1, '#E8A08A');
  c.fillStyle = '#FFFDF6'; rr(c, WX0 - 40, WY0 - 40, WX1 - WX0 + 80, WY1 - WY0 + 80, 16); c.fill(); c.fillStyle = g; c.fillRect(WX0, WY0, WX1 - WX0, WY1 - WY0);
  c.fillStyle = '#5A4A7A'; for (const [x, w, h] of [[WX0 + 20, 180, 520], [WX0 + 230, 140, 680], [WX0 + 420, 210, 450], [WX0 + 660, 130, 600]]) c.fillRect(x, WY1 - h, w, h);
  c.fillStyle = '#FFE38A'; for (const [x, y] of [[WX0 + 60, WY1 - 450], [WX0 + 120, WY1 - 330], [WX0 + 270, WY1 - 600], [WX0 + 300, WY1 - 420], [WX0 + 480, WY1 - 380], [WX0 + 700, WY1 - 520]]) c.fillRect(x, y, 40, 50);
  c.fillStyle = '#6A6A78'; c.fillRect(WX0, WY1 - 120, WX1 - WX0, 120);
  c.fillStyle = '#FFF2C0'; c.fillRect(WX0 + 600, WY1 - 520, 14, 400); c.beginPath(); c.arc(WX0 + 607, WY1 - 530, 30, 0, TAU); c.fill();
  c.fillStyle = '#FFFDF6'; c.fillRect((WX0 + WX1) / 2 - 10, WY0, 20, WY1 - WY0); c.fillRect(WX0, (WY0 + WY1) / 2 - 10, WX1 - WX0, 20);
  c.fillStyle = '#E8889E'; rr(c, WX0 - 190, WY0 - 120, 160, WY1 - WY0 + 260, 30); c.fill(); rr(c, WX1 + 30, WY0 - 120, 160, WY1 - WY0 + 260, 30); c.fill();
  // garland HAPPY ANNIVERSARY across the wall
  const word = 'HAPPY ANNIVERSARY', x0 = -1900, x1 = 900, n = word.length, sag = 140;
  c.strokeStyle = '#8A6A4A'; c.lineWidth = 6; c.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; c.lineTo(lerp(x0, x1, u), -2500 + Math.sin(u * Math.PI) * sag); } c.stroke();
  const cols = ['#EE5E9A', '#F2C14E', '#5BB6E8', '#8E5BD8', '#4CAF6A'];
  for (let i = 0; i < n; i++) { if (word[i] === ' ') continue; const u = (i + 0.5) / n, x = lerp(x0, x1, u), y = -2500 + Math.sin(u * Math.PI) * sag;
    c.fillStyle = cols[i % 5]; c.beginPath(); c.moveTo(x - 70, y); c.lineTo(x + 70, y); c.lineTo(x, y + 170); c.closePath(); c.fill();
    c.fillStyle = '#FFFFFF'; c.font = '72px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word[i], x, y + 58); }
  // framed photo of the couple (simple heads) + wall lamp
  c.fillStyle = '#C98B6A'; rr(c, -2850, -2150, 460, 380, 14); c.fill(); c.fillStyle = '#FCE6D8'; rr(c, -2820, -2120, 400, 320, 8); c.fill();
  for (const [x, col] of [[-2700, '#3A2820'], [-2540, '#6A4126']]) { c.fillStyle = col; c.beginPath(); c.arc(x, -1960, 62, 0, TAU); c.fill(); c.fillStyle = '#F6D2B6'; c.beginPath(); c.arc(x, -1945, 48, 0, TAU); c.fill(); }
  heart(c, -2620, -2040, 34, '#EE5E9A');
  // skirting + floor + rug
  c.fillStyle = '#E8CBBE'; c.fillRect(BX0, -90, BW, 90);
  c.fillStyle = '#A8754E'; c.fillRect(BX0, 0, BW, 1600); c.fillStyle = 'rgba(0,0,0,.07)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, 0, 8, 1600);
  c.fillStyle = '#E8B8C8'; c.beginPath(); c.ellipse(0, 150, 1300, 120, 0, 0, TAU); c.fill(); c.strokeStyle = '#F7E0E8'; c.lineWidth = 14; c.beginPath(); c.ellipse(0, 150, 1180, 95, 0, 0, TAU); c.stroke();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
// candle-lit table on the left (sharp, in front of the wall)
function table(c, t) { const x0 = TBX - 520, x1 = TBX + 520;
  c.fillStyle = '#FFFFFF'; paint(c, q => { q.m(x0, -760); q.l(x1, -760); q.l(x1 + 40, -420); q.l(x0 - 40, -420); q.z(); }, '#FFFFFF', { sd: 8, hd: 4, lw: 3 });
  c.fillStyle = '#EE5E9A'; c.fillRect(x0 - 40, -470, x1 - x0 + 80, 50);
  c.fillStyle = '#6A4A34'; c.fillRect(x0, -420, 40, 420); c.fillRect(x1 - 40, -420, 40, 420);
  for (const [x, h] of [[TBX - 160, 220], [TBX + 160, 180]]) { c.fillStyle = '#FFF6E0'; c.fillRect(x - 18, -760 - h, 36, h); const f = 1 + 0.12 * Math.sin(t * 13 + x);
    c.fillStyle = 'rgba(255,220,120,.25)'; c.beginPath(); c.arc(x, -760 - h - 40, 70, 0, TAU); c.fill(); c.fillStyle = '#F2B33D'; c.beginPath(); c.ellipse(x, -760 - h - 34, 14, 30 * f, 0, 0, TAU); c.fill(); c.fillStyle = '#FFF2B0'; c.beginPath(); c.ellipse(x, -760 - h - 26, 6, 14 * f, 0, 0, TAU); c.fill(); }
  for (const x of [TBX - 360, TBX + 360]) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, -760); c.lineTo(x, -860); c.stroke(); c.fillStyle = 'rgba(200,40,70,.75)'; c.beginPath(); c.moveTo(x - 40, -960); c.lineTo(x + 40, -960); c.quadraticCurveTo(x + 40, -860, x, -860); c.quadraticCurveTo(x - 40, -860, x - 40, -960); c.fill(); }
  heart(c, TBX, -800, 40, '#E0474C'); }
// heart balloons (drawn with paths), gently bobbing
function balloons(c, t) { for (const [x, y, col, ph] of [[-2100, -1800, '#EE5E9A', 0], [-1900, -1950, '#E0474C', 1.3], [-1720, -1760, '#F7A8C8', 2.1], [2250, -1900, '#EE5E9A', 0.7], [2450, -1750, '#E0474C', 1.9]]) {
  const by = y + Math.sin(t * 1.4 + ph) * 18; c.strokeStyle = 'rgba(90,70,60,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, by + 60); c.quadraticCurveTo(x + 30, by + 400, x - 10, -500); c.stroke(); heart(c, x, by, 120, col); c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(x - 50, by - 60, 18, 30, -0.5, 0, TAU); c.fill(); } }

// ---------------- characters (standing)
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, b) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };
// does she hold the card? (from the hook's "take" until she gives it back in the twist)
const herCard = (t, L) => !((L === 'hook' && t < hev('take')) || (L === 'end' && t > ev('end', 'swap')));
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'happy', turn: 0.25, look: 0.7 };
  const cardR = (dy = 300, k = 0.95, s = 0.42) => { st.armR = hold(g, 1, dy, k); st.items = { R: cardItem(s) }; };
  if (herCard(t, L)) cardR();
  if (L === 'hook') { st.mood = 'happy'; st.armL = hold(g, -1, 320, 0.7); if (t > hev('gym')) { st.mood = 'surprised'; st.blink = 0; } if (t > hev('freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > hev('take') - 0.3 && t < hev('take')) { const k = eIO(clamp((t - hev('take') + 0.3) / 0.3)); st.armR = reach(g, 1, lerp(g.sw * 0.95, g.sw * 2.2, k), g.ySh + lerp(300, 200, k), { planar: true }); }
    if (t > hev('take')) { st.mood = 'skeptical'; cardR(lerp(200, 300, eIO(clamp((t - hev('take')) / 0.4))), 1.2); st.look = 0.2; st.lookY = 0.4; }
    if (t > hev('wide')) { st.mood = 'annoyed'; st.lookY = 0; st.look = 0.8; } }
  if (L === 'o1') { st.mood = 'annoyed'; st.turn = 0.2; st.look = 0.6; if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'annoyed'; gest(st, g, 'her', t, -1, 160); }
    if (t > e('voucher')) { st.mood = 'skeptical'; st.look = 0.9; st.turn = 0.35; } if (t > SP.o1_nar.t + 0.3) { st.mood = 'tired'; st.look = 0.9; st.blink = 1; } }
  if (L === 'o2') { st.mood = 'smug'; st.turn = 0.25; st.look = 0.7; if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 120); }
    if (t > SP.o2_b.t + 0.2) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('react')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armL = open(g, -1, 1.5, 200); st.headY = 6; } }
  if (L === 'o3') { st.mood = 'happy'; st.turn = 0.25; st.look = 0.7; st.tilt = 0.05;
    if (speaking('o3_h', t, 0.1, 0.1)) { st.armL = open(g, -1, 1.6, 140 + Math.sin(t * 5) * 12); }
    if (t > SP.o3_b.t) { st.mood = 'surprised'; st.tilt = 0; } if (t > e('hide') + 0.5) { st.mood = 'skeptical'; st.look = 1; st.turn = 0.4; }
    if (t > SP.o3_nar.t + 0.9) { st.mood = 'happy'; st.blink = 1; st.turn = 0.05; st.look = 0.1; st.tilt = 0.06; } }
  if (L === 'o4') { st.mood = 'happy'; st.turn = 0.2; st.look = 0.5;
    if (speaking('o4_h', t, 0.1, 0.1)) { const u = t - SP.o4_h.t; st.mood = 'happy'; if (u < 1.2) { st.laugh = true; st.blink = 1; }
      if (t > e('run') && t < endOf('o4_h')) { const r = (t - e('run')) * 9; st.mood = 'smug'; st.legPose = 'walk'; st.t = t * 2.2; st.armL = reach(g, -1, -g.sw * (1.05 + 0.25 * Math.sin(r)), g.ySh + 230 - 70 * Math.sin(r), { planar: true }); cardR(230 + 70 * Math.sin(r), 1.05); st.lean = 0.08; }
      else gest(st, g, 'her', t, -1, 120); }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'smug'; st.blink = 1; }
    if (t > SP.o4_b.t + 0.3) { st.mood = 'skeptical'; st.blink = 0; st.look = 0.9; } }
  if (L === 'end') { st.mood = 'skeptical'; st.look = 0.2; st.turn = 0.2; st.lookY = 0.5; cardR(140, 1.2, 0.5);
    if (t > e('circle')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.end_b.t) { st.lookY = 0; st.look = 0.8; st.turn = 0.3; st.mood = 'surprised'; cardR(300); }
    if (t > e('car')) { st.mood = 'happy'; st.look = 0.9; }
    if (t > e('swap') - 0.4 && t < e('swap')) { const k = eIO(clamp((t - e('swap') + 0.4) / 0.4)); st.armR = reach(g, 1, lerp(g.sw * 0.95, g.sw * 2.6, k), g.ySh + lerp(300, 180, k), { planar: true }); st.items = { R: cardItem() }; }
    if (t > e('swap')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armL = open(g, -1, 1.4, 160); st.items = {}; } }
  return st; }
// envelope: in his hand towards her (hook..o3 hide), then behind his back (peeking out, SALE sticker)
const envState = (t, L) => { if (L === 'hook' || L === 'o1' || L === 'o2') return 'hand'; if (L === 'o3') return t < ev('o3', 'hide') + 0.2 ? 'hand' : 'back'; return 'none'; };
function bfState(t, L) { const g = G.bf, e = k => ev(L, k), st = { ...base(g, t, 'bf5'), mood: 'happy', turn: -0.25, look: -0.7 };
  const envOut = (card = 0, k = 1.9, dy = 150) => { st.armL = reach(g, -1, -g.sw * k, g.ySh + dy + Math.sin(t * 4) * 6, { planar: true }); st.items = { L: envItem(card, 0.85) }; };
  const envLow = () => { st.armL = hold(g, -1, 360, 0.8); st.items = { L: envItem(0) }; };
  if (envState(t, L) === 'hand') envLow();
  if (L === 'hook') { const cardUp = t < hev('take') - 0.2 ? eBack(clamp((t - hev('gym')) / 0.3), 2) : 0;
    envOut(t < hev('gym') ? 0.25 : t < hev('take') - 0.2 ? 0.25 + 0.75 * cardUp : 0); st.mood = 'happy';
    if (t > hev('gym')) { st.laugh = !speaking('hook_b', t, 0, 0); st.mood = 'happy'; }
    if (t > hev('freeze')) { st.laugh = true; st.blink = 1; }
    if (t > hev('take')) { envLow(); st.armR = open(g, 1, 1.4, 120); } }
  if (L === 'o1') { st.mood = 'happy'; st.look = -0.7;
    if (speaking('o1_h', t, 0, 0.1)) st.mood = 'surprised';
    if (speaking('o1_b', t, 0.05, 0)) { st.mood = 'smug'; gest(st, g, 'bf5', t, 1, 180); }
    if (t > e('voucher')) { const k = eBack(clamp((t - e('voucher')) / 0.35), 1.6); st.armR = reach(g, 1, g.sw * lerp(1.0, 1.8, k), g.ySh + lerp(400, -40, k), { planar: true }); st.items = { ...st.items, R: voucherItem }; st.mood = 'happy'; st.laugh = true; st.blink = 1; }
    if (t > e('kiss')) { const k = eIO(clamp((t - e('kiss')) / 0.35)); st.armR = reach(g, 1, g.sw * lerp(1.8, 0.7, k), g.ySh + lerp(-40, 200, k), { planar: true }); st.mood = 'happy'; st.laugh = true; st.blink = 1; st.tilt = -0.08 * k; } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0, 0.1)) { st.mood = t > SP.o2_h.t + 2.3 ? 'surprised' : 'happy'; }
    if (t > SP.o2_b.t - 0.1) { st.mood = 'happy'; st.laugh = !speaking('o2_b', t, 0, 0); }
    if (t > e('phone')) { const k = eBack(clamp((t - e('phone')) / 0.3), 1.6); st.armR = reach(g, 1, g.sw * lerp(1.0, 1.9, k), g.ySh + lerp(400, 40, k), { planar: true }); st.items = { ...st.items, R: phoneItem }; }
    if (t > e('react')) { const f = Math.sin((t - e('react')) * 6); st.mood = 'happy'; st.laugh = true; st.blink = 1; st.items = {}; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 40 + f * 20, { planar: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 40 - f * 20, { planar: true }); } }
  if (L === 'o3') { st.mood = 'happy'; st.look = -0.7;
    if (speaking('o3_h', t, 0, 0.1)) { st.mood = t > SP.o3_h.t + 1.6 ? 'worried' : 'happy'; }
    if (speaking('o3_b', t, 0.05, 0.3)) { st.mood = 'sad'; st.headY = 10; st.lookY = 0.3; }
    if (t > e('hide') && t < e('hide') + 0.2) { const k = eIO(clamp((t - e('hide')) / 0.2)); st.armL = reach(g, -1, -g.sw * lerp(0.8, 1.05, k), g.ySh + lerp(360, 470, k), { planar: true }); }
    if (envState(t, L) === 'back') { st.items = {}; st.armL = reach(g, -1, -g.sw * 0.95, g.ySh + 470, { planar: true }); st.armR = reach(g, 1, g.sw * 0.95, g.ySh + 470, { planar: true }); st.mood = t > endOf('o3_b') ? 'worried' : 'sad'; }
    if (t > SP.o3_nar.t + 0.4) { st.mood = 'worried'; st.blink = 1; st.headY = 6; } }
  if (L === 'o4') { st.mood = 'happy'; st.look = -0.7;
    if (speaking('o4_h', t, 0, 0)) { const u = t - SP.o4_h.t; st.mood = u > 4.4 ? 'worried' : 'happy'; }
    if (t > endOf('o4_h') - 0.2) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('pat')) { patPockets(st, g, t - e('pat')); } }
  if (L === 'end') { st.mood = 'worried'; st.look = -0.6;
    if (t < SP.end_b.t - 0.2) patPockets(st, g, t - ev('o4', 'pat'));
    if (t > SP.end_b.t - 0.2) { st.mood = 'worried'; st.headY = 4; st.armL = hold(g, -1, 330, 0.7); }
    if (speaking('end_b', t, 0, 0) && t > SP.end_b.t + 0.9) { st.mood = 'happy'; }
    if (t > ev('end', 'point')) { const k = eBack(clamp((t - ev('end', 'point')) / 0.3), 1.6); st.armR = reach(g, 1, g.sw * lerp(1.0, 2.2, k), g.ySh + lerp(400, 60, k), { planar: true }); st.turn = 0.1; st.look = 0.4; st.mood = 'happy'; }
    if (t > ev('end', 'car')) { st.look = -0.6; st.turn = -0.25; st.armR = hold(g, 1, 330, 0.7); }
    if (t > ev('end', 'swap')) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 180, { planar: true }); st.items = { L: cardItem() }; st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  return st; }
// o4/twist: frantic pocket pats (open hands alternate between chest and hip pockets)
function patPockets(st, g, u) { const a = Math.sin(u * 14), b = Math.sin(u * 14 + Math.PI), hi = Math.floor(u * 2.3) % 2;
  st.items = {}; st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.headY = Math.sin(u * 7) * 6; st.turn = -0.15 + 0.2 * Math.sin(u * 3); st.look = -0.3;
  st.armL = reach(g, -1, -g.sw * (0.75 + 0.1 * a), g.ySh + (hi ? 160 : 470) - 30 * a, { planar: true });
  st.armR = reach(g, 1, g.sw * (0.75 + 0.1 * b), g.ySh + (hi ? 470 : 160) - 30 * b, { planar: true }); st.sweat = true; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'bf'], cover: ['her', 'bf'], two: ['her', 'bf'], her: ['her'], bf: ['bf'], car: [], endw: ['her', 'bf'] };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  // the car outside: hazard lights blink when he mentions it
  c.save(); c.beginPath(); c.rect(WX0, WY0, WX1 - WX0, WY1 - WY0); c.clip(); c.translate(1450, WY1 - 40); c.scale(0.95, 0.95); car(c, t, L === 'end' && t > ev('end', 'car') ? 1 : 0); c.restore();
  c.fillStyle = '#FFFDF6'; c.fillRect((WX0 + WX1) / 2 - 10, WY0, 20, WY1 - WY0); c.fillRect(WX0, (WY0 + WY1) / 2 - 10, WX1 - WX0, 20);
  if (L === 'end' && t > ev('end', 'car')) { const u = t - ev('end', 'car'), k = eBack(clamp(u / 0.3), 2); star(c, 1350, WY1 - 330, 70 * k * (0.8 + 0.2 * Math.sin(t * 8))); star(c, 1210, WY1 - 240, 36 * k, 0.9); }
  K.mark(c, 'car', 1450, WY1 - 200, 300);
  balloons(c, t); table(c, t);
  // envelope peeking out behind his back (o3 on): drawn before him
  const bfx = X.bf;
  if (who.includes('bf') && envState(t, L) === 'back') { c.save(); c.translate(bfx + G.bf.sw * 1.25, G.bf.ySh + 400); c.rotate(0.3); envelope(c, 0.85, 0, true); c.restore(); }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  if (who.includes('bf')) { const st = bfState(t, L); heads.bf5 = K.put(c, BF, st, bfx, 0);
    if (st.sweat) { const hd = heads.bf5; for (let i = 0; i < 3; i++) { const u = ((t * 1.6 + i / 3) % 1); c.save(); c.globalAlpha = 1 - u; c.fillStyle = '#7FD0F5'; c.translate(hd.x + (i - 1) * hd.hh * 0.8, hd.y - hd.hh * 0.6 + u * 120); c.beginPath(); c.moveTo(0, -22); c.quadraticCurveTo(16, 4, 0, 12); c.quadraticCurveTo(-16, 4, 0, -22); c.fill(); c.restore(); } } }
  // sparkle on his pizza voucher (o1)
  if (L === 'o1' && heads.bf5 && t > ev('o1', 'voucher') + 0.2) { const u = t - ev('o1', 'voucher') - 0.2, k = eBack(clamp(u / 0.3), 2) * (0.8 + 0.2 * Math.sin(t * 8)); const hd = heads.bf5; star(c, hd.x + hd.hh * 1.6, hd.y + hd.hh * 0.2, 60 * k); star(c, hd.x + hd.hh * 2.4, hd.y + hd.hh * 0.9, 30 * k, 0.8); }
  // the gym card popping out of the envelope with a sparkle (hook)
  if (L === 'hook' && heads.bf5 && t > hev('gym') && t < hev('take')) { const u = t - hev('gym'), k = eBack(clamp(u / 0.3), 2); star(c, X.bf - G.bf.sw * 2.1, G.bf.ySh - 160, 50 * k * (0.8 + 0.2 * Math.sin(t * 9))); }
  K.mark(c, 'env', X.bf - G.bf.sw * 1.9, G.bf.ySh + 60, 160);
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(90, fy(HY('bf'), 0.62, 720), 0.62, 'cover'), WIDE: S(240, fy(HY('bf'), 0.5, 610), 0.5, 'wide'), TWO: S(90, fy(HY('bf'), 0.7, 820), 0.7, 'two'),
  HER: S(X.her + 40, fy(HY('her'), 1.0), 1.0, 'her'), HER_CU: S(X.her + 10, fy(HY('her'), 1.35, 980), 1.35, 'her'), HER_W: S(X.her + 60, fy(HY('her'), 0.72, 640), 0.72, 'her'), HER_R: S(X.her + 60, fy(HY('her'), 1.05, 880), 1.05, 'her'),
  BF: S(X.bf + 40, fy(HY('bf'), 0.92, 860), 0.92, 'bf'), BF_CU: S(X.bf + 10, fy(HY('bf'), 1.25, 980), 1.25, 'bf'), BF_V: S(X.bf + 120, fy(HY('bf'), 0.85, 820), 0.85, 'bf'), BF_H: S(X.bf - 60, fy(HY('bf'), 0.85, 1060), 0.85, 'bf'),
  CAR: S(1450, WY1 - 380, 1.15, 'car'), PHONE: U('phone', 1), CARD: U('card', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('ch2')) return SH.COVER; if (t < hev('freeze') - 0.02) return f(SH.BF_H); if (t < hev('take') - 0.35) return f(SH.HER_CU); if (t < hev('card') - 0.02) return f(SH.TWO); if (t < hev('wide') - 0.05) return f(SH.CARD); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_b.t - 0.1) return f(SH.HER); if (t < e('kiss') - 0.02) return f(SH.BF_V); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_b.t - 0.1) return f(SH.HER); if (t < e('insert') - 0.02) return f(SH.BF_V); if (t < e('react') - 0.02) return f(SH.PHONE); if (t < SP.o2_nar.t + 0.7) return f(SH.HER_CU); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_b.t - 0.1) return f(SH.HER); if (t < SP.o3_nar.t - 0.02) return f(SH.BF); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('run') - 0.02) return f(SH.HER); if (t < SP.o4_b.t - 0.1) return f(SH.HER_W); return f(SH.BF); }
  if (L === 'end') { if (t < e('insert') - 0.02) return f(SH.HER_R); if (t < SP.end_b.t - 0.1) return f(SH.CARD); if (t < e('car') - 0.02) return f(SH.BF); if (t < e('swap') - 0.45) return f(SH.CAR); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on solid backdrops
// gym card close-up (hook: card on teal; twist: MEMBER: WILL circled)
function cardView(c, t, L) { const a = L === 'end' ? ev('end', 'insert') : hev('card'), u = t - a; c.fillStyle = L === 'end' ? '#2B2F3A' : '#F59BBE'; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'card' });
  c.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  const k = eBack(clamp(u / 0.3), 1.7), zoom = L === 'end' ? lerp(2.3, 2.45, clamp(u / 1.5)) : lerp(2.25, 2.35, clamp(u / 1.8));
  c.save(); c.translate(540, 1000); c.rotate(-0.04 * k); c.scale(k * zoom, k * zoom); gymCard(c, 1, true); c.restore();
  if (L === 'end') { const ck = clamp((t - ev('end', 'circle')) / 0.35); if (ck > 0) { c.save(); c.translate(540 - 40 * zoom, 1000 + 82 * zoom); c.strokeStyle = '#EE5E9A'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); const nS = Math.max(2, Math.round(64 * ck)); for (let i = 0; i <= nS; i++) { const a = -1.4 + TAU * 1.05 * ck * i / nS; c.lineTo(Math.cos(a) * 330, Math.sin(a) * 70 - 0.05 * Math.cos(a) * 330); } c.stroke(); c.restore(); } } }
// phone close-up: the booked couples' trainer (huge, flexing)
function trainer(c, t, flex) { // (0,0) = feet centre; cartoon bodybuilder drawn with paths
  const skin = '#D9A07A', a = flex * 0.9 + Math.sin(t * 8) * 0.04 * flex;
  paint(c, q => { q.m(-70, 0); q.l(-90, -330); q.l(90, -330); q.l(70, 0); q.z(); }, '#2B2F3A', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(-110, -330); q.q(-240, -640, -190, -700); q.l(190, -700); q.q(240, -640, 110, -330); q.z(); }, skin, { sd: 10, hd: 5, lw: 4, inner: k => { k.strokeStyle = 'rgba(120,60,30,.4)'; k.lineWidth = 5; k.beginPath(); k.moveTo(0, -660); k.lineTo(0, -380); k.moveTo(-90, -600); k.quadraticCurveTo(-30, -560, 0, -600); k.moveTo(90, -600); k.quadraticCurveTo(30, -560, 0, -600); for (const y of [-500, -440]) { k.moveTo(-50, y); k.lineTo(50, y); } k.stroke(); } });
  c.fillStyle = '#E0474C'; c.fillRect(-120, -380, 240, 50);
  for (const sg of [-1, 1]) { c.save(); c.translate(sg * 190, -680); c.rotate(sg * (0.2 - 0.9 * a));
    paint(c, q => { q.m(-46, 0); q.q(sg * 120, -40, sg * 200, 0); q.l(sg * 200, 70); q.q(sg * 100, 60, -40, 70); q.z(); }, skin, { sd: 8, hd: 4, lw: 4 });
    c.save(); c.translate(sg * 190, 30); c.rotate(-sg * (1.4 * a)); paint(c, q => { q.m(-40, 0); q.l(40, 0); q.l(30, -170); q.l(-30, -170); q.z(); }, skin, { sd: 6, hd: 3, lw: 4 }); c.beginPath(); c.fillStyle = skin; c.arc(0, -185, 42, 0, TAU); c.fill(); c.restore();
    c.fillStyle = '#E8B08A'; c.beginPath(); c.ellipse(sg * 100, -20, 60, 44, 0, 0, TAU); c.fill(); c.restore(); }
  c.save(); c.translate(0, -790); paint(c, q => q.e(0, 0, 70, 82), skin, { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#2B2F3A'; c.fillRect(-72, -50, 144, 20); c.fillStyle = '#E0474C'; c.fillRect(-74, -40, 148, 24);
  c.fillStyle = '#1E2030'; for (const sg of [-1, 1]) { c.beginPath(); c.arc(sg * 26, 4, 8, 0, TAU); c.fill(); } c.strokeStyle = '#1E2030'; c.lineWidth = 6; c.beginPath(); c.arc(0, 30, 26, 0.2, Math.PI - 0.2); c.stroke(); c.restore(); }
function phoneView(c, t) { const a = ev('o2', 'insert'), u = t - a; c.fillStyle = '#4CAF6A'; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'phone' });
  c.fillStyle = 'rgba(255,255,255,.06)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  const k = eBack(clamp(u / 0.3), 1.6); c.save(); c.translate(540, 1000); c.scale(k, k); c.rotate(-0.03);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -340 + 14, -620 + 20, 680, 1240, 70); c.fill(); c.fillStyle = '#1E2030'; rr(c, -340, -620, 680, 1240, 70); c.fill();
  c.fillStyle = '#F7F7FA'; rr(c, -310, -580, 620, 1160, 46); c.fill();
  c.fillStyle = '#3E6FA8'; rr(c, -310, -580, 620, 120, [46, 46, 0, 0]); c.fill(); fitTxt(c, 'COUPLES TRAINING', 0, -520, 40, '#FFFFFF', 540);
  c.save(); c.beginPath(); rr(c, -280, -440, 560, 700, 24); c.clip(); const g = c.createLinearGradient(0, -440, 0, 260); g.addColorStop(0, '#FFE38A'); g.addColorStop(1, '#F2A13A'); c.fillStyle = g; c.fillRect(-280, -440, 560, 700);
  c.save(); c.translate(0, 300); c.scale(0.72, 0.72); trainer(c, t, eIO(clamp((t - ev('o2', 'flex')) / 0.3))); c.restore(); c.restore();
  fitTxt(c, 'COACH BRUNO', 0, 320, 52, '#1E2030', 540); fitTxt(c, 'MON  6:00 AM  ·  2 PEOPLE', 0, 385, 32, '#5A5F6E', 540, 'Nun9');
  const bk = eBack(clamp((t - ev('o2', 'booked')) / 0.25), 2.4); if (bk > 0) { c.save(); c.translate(0, 480); c.scale(bk, bk); c.fillStyle = '#4CAF6A'; rr(c, -220, -50, 440, 100, 50); c.fill(); check(c, -140, 0, 26); fitTxt(c, 'BOOKED', 30, 4, 50, '#FFFFFF', 300); c.restore(); }
  c.restore(); }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 380); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -450 + 8, -160 + 12, 900, 320, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -450, -160, 900, 320, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-330, 155); c.lineTo(-290, 203); c.lineTo(-270, 155); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -450, -160, 900, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -410, -143, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-402, -113); c.lineTo(-406, -97); c.lineTo(-386, -111); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -345, -125, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'Парень подарил мне на годовщину', 0, -36, 48, '#1E2030', 840, 'Unb9'); fitTxt(c, 'абонемент в спортзал. Это намёк?!', 0, 30, 48, '#1E2030', 840, 'Unb9'); fitTxt(c, 'Как ему ответить?', 0, 100, 46, '#D9407A', 840, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 90, y: 220, w: 900, h: 320, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD8'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  c.save(); UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * Math.min(lerp(1, 1.4, big), 900 / w), y = 215;
  c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w * s / 2, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: «КАКОЙ ОТВЕТ ТВОЙ?», 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + boyfriend (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640) — he finally brings the flowers
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bf;
    K.put(c, BF, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.5, armL: reach(gb, -1, -gb.sw * 1.5, gb.ySh + 160, { planar: true }), armR: hold(gb, 1, 300, 0.8), items: { L: bouquetItem } }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: hold(g, 1, 300, 0.95), items: { R: cardItem() } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'Gym. For me. Why?', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', "Do they do couples' push-ups?", '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', "It's not really a gift, is it?", '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', "I'll use it — to run away.", '#8E5BD8', 'четыре']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.3 + i * 0.35) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 520 + i * 160;
    c.save(); c.translate(CX, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -420 + 8, -66 + 12, 840, 132, 36); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -420, -66, 840, 132, 36); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-340, 0, 50, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -340, 4, 70, C.white, 70);
    fitTxt(c, ru, -265, -24, 40, C.oliveD, 650, 'Unb9', 'left'); fitTxt(c, en, -265, 28, 34, C.pinkD, 650, 'Nun9', 'left'); c.restore(); });
  const bt = wt('пиши', 3.55) - 0.2, bk = eBack(P(t, bt, bt + 0.35), 2.2), by = 1185;
  if (bk > 0) { c.save(); c.translate(CX, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -420, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-370, -30); c.lineTo(-330, -30); c.lineTo(-330, 32); c.lineTo(-350, 16); c.lineTo(-370, 32); c.closePath(); c.fill(); fitTxt(c, 'СОХРАНИ', -200, 4, 40, C.oliveD, 250);
    const subT = bt + 0.6, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(220, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -200, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 340); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(930, CX + 260, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads = {}, proj;
  if (tag.startsWith('ui:')) { if (tag === 'ui:phone') phoneView(c, t); else cardView(c, t, L); proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  // bubbles only for characters drawn in this shot (an off-screen speaker never gets a bubble over another shot)
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names: { bf5: ['WILL', '#3E6FA8'] }, hold: { hook_b: -0.15, o1_h: -0.2, o1_b: -0.1, o2_h: -0.2, o2_b: -0.15, o3_h: -0.2, o3_b: -0.1, o4_h: -0.2, o4_b: 0.3, end_b: -0.15 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('gymgift', NF, renderFrame);
