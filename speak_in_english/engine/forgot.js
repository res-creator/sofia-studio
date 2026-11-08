// "Муж забыл тебя на заправке" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node forgot.js start end out.mp4 | --png=f1,f2
// An empty petrol station: the heroine (pink jumper) by the shop with two takeaway coffees; her husband Roger (blue jumper) has just skidded back in
// with his family car (tyre smoke, skid marks) — twenty minutes after driving off without her. Running prop: the car's doors.
// Hook insert: the shop clock — the minute hand sweeps twenty minutes.
// o1 «В ЛОБ»: "You! Forget! Me!" — he shrugs, both palms out ("I just... remembered later"); she squeezes the cups and coffee squirts out of both lids.
// o2 «ВЕЖЛИВО»: "Me too! Why is it so quiet?" — he smiles, contented; insert: her seat is covered with his sandwiches and crisps; her jaw drops.
// o3 «КАК НОСИТЕЛЬ»: "...I'm so sorry. Coffee's on me for a month." — he walks to the car and opens her door like a chauffeur, with a bow; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand line while she sips her free refill; he panics; "Please get in" — on his knees he wipes her seat with a cloth.
// Twist (music silent): she slides the back door open — a strange granny with a basket is already sitting there: "He said I looked like you from behind."
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/forgot/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const HUB = { ...BASE.tom, top: { type: 'sweater', col: '#3E73B8' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#FFFFFF', acc: '#3E73B8' } };
const GRAN = { ...BASE.nana, top: { type: 'cardigan', col: '#8E5BD0', col2: '#F7E6EC' } };
const G = { her: geom(HER), hub2: geom(HUB), kneel: geom(HUB, 380), gran3: geom(GRAN, 330) };
const CX0 = 760, CX1 = 2300;                                         // car: front bumper (left) .. rear bumper (right)
const FD0 = CX0 + 470, FD1 = CX0 + 1025;                             // front door (hinge at FD0)
const RD0 = CX0 + 1045, RD1 = CX1 - 190, RDB = -330;                 // sliding back door opening (bottom above the wheel arch)
const X = { her: -80, hub: 430 };
const HUBX_DOOR = 1020;                                              // o3/o4: he stands by her (front) door
const HERX_END = 1500;                                               // twist: she stands at the back door
const GRANX = 1990, GRANY = 40;                                                  // the granny on the back seat
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// takeaway coffee cup (white cup, kraft sleeve, pink lid); (0,0) = bottom centre
function cup(c, s = 1, lidOff = 0) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-46, 0); q.l(46, 0); q.l(58, -150); q.l(-58, -150); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#C98B5A'; c.beginPath(); c.moveTo(-51, -45); c.lineTo(51, -45); c.lineTo(55, -110); c.lineTo(-55, -110); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, -78, 14, 0, TAU); c.fill();
  c.save(); c.translate(0, -lidOff); c.fillStyle = '#EE5E9A'; c.strokeStyle = '#8A2A50'; c.lineWidth = 3; rr(c, -64, -172, 128, 24, 8); c.fill(); c.stroke(); rr(c, -40, -186, 80, 16, 6); c.fill(); c.stroke(); c.restore();
  c.restore(); }
const cupItem = (lid = 0) => ctx => { ctx.save(); ctx.translate(0, 70); cup(ctx, 1.0, lid); ctx.restore(); };
// basket with a loaf and apples
function basket(c, s = 1) { c.save(); c.scale(s, s);
  c.fillStyle = '#E8B04A'; c.beginPath(); c.ellipse(-30, -70, 60, 34, -0.3, 0, TAU); c.fill(); c.fillStyle = '#E0474C'; for (const [x, y] of [[40, -64], [70, -58]]) { c.beginPath(); c.arc(x, y, 24, 0, TAU); c.fill(); }
  paint(c, q => { q.m(-110, -60); q.l(110, -60); q.l(90, 30); q.l(-90, 30); q.z(); }, '#B8834A', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = 'rgba(90,50,20,.45)'; c.lineWidth = 4; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 28, -60); c.lineTo(i * 24, 30); c.stroke(); } for (const y of [-30, 0]) { c.beginPath(); c.moveTo(-104, y); c.lineTo(104, y); c.stroke(); }
  c.strokeStyle = '#8A5A2A'; c.lineWidth = 10; c.beginPath(); c.moveTo(-90, -60); c.quadraticCurveTo(0, -200, 90, -60); c.stroke(); c.restore(); }
// cleaning cloth (yellow)
const clothItem = t => ctx => { ctx.save(); ctx.translate(0, 30); ctx.rotate(Math.sin(t * 14) * 0.25); ctx.fillStyle = '#F2D94E'; ctx.strokeStyle = '#B89A20'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-50, -30); ctx.lineTo(55, -36); ctx.lineTo(48, 40); ctx.quadraticCurveTo(0, 55, -45, 38); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); };
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function pumpIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = col;
  rr(c, -34, -46, 46, 92, 8); c.fill(); c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, -26, -36, 30, 24, 4); c.fill(); c.fillStyle = col; c.fillRect(-42, 40, 62, 10);
  c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(12, -20); c.lineTo(30, -20); c.lineTo(36, 26); c.quadraticCurveTo(38, 36, 46, 30); c.lineTo(44, -26); c.lineTo(34, -40); c.stroke(); c.restore(); }
function cupIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-30, -30); c.lineTo(30, -30); c.lineTo(24, 40); c.lineTo(-24, 40); c.fill(); rr(c, -36, -44, 72, 16, 5); c.fill();
  c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round'; for (const dx of [-12, 8]) { c.beginPath(); c.moveTo(dx, -56); c.quadraticCurveTo(dx + 10, -70, dx, -84); c.stroke(); } c.restore(); }

// ---------------- petrol station (prerendered, softly blurred)
const BX0 = -4200, BY0 = -5600, BW = 8800, BH = 8600, BS = 0.5;
function drawStation(c) {
  const g = c.createLinearGradient(0, BY0, 0, -900); g.addColorStop(0, '#F2B880'); g.addColorStop(0.55, '#F8D9A8'); g.addColorStop(1, '#FBEBD0'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.7)'; for (const [x, y, s] of [[-3000, -4300, 1.1], [-600, -4700, 0.9], [1900, -4100, 1.2], [3600, -4800, 0.9]]) { for (const [dx, dy, r] of [[0, 0, 150], [150, -40, 180], [320, 10, 140], [160, 50, 160]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); } }
  // far fields + a lonely road
  c.fillStyle = '#C9B07A'; c.fillRect(BX0, -1500, BW, 700); c.fillStyle = '#A8C07A'; c.beginPath(); c.moveTo(BX0, -1450); for (let x = BX0; x <= BX0 + BW; x += 400) c.lineTo(x, -1500 - 120 * Math.sin(x / 900)); c.lineTo(BX0 + BW, -800); c.lineTo(BX0, -800); c.fill();
  c.fillStyle = '#6E7380'; c.fillRect(BX0, -900, BW, 160); c.fillStyle = '#F7F4EE'; for (let x = BX0; x < BX0 + BW; x += 460) c.fillRect(x, -830, 220, 14);
  // the shop on the left: COFFEE sign, big window, glass door
  c.fillStyle = '#F4EFE6'; c.fillRect(BX0, -2900, -700 - BX0, 2900 - 120); c.fillStyle = '#E0474C'; c.fillRect(BX0, -2900, -700 - BX0, 180); c.fillStyle = '#F4EFE6'; c.fillRect(BX0, -2740, -700 - BX0, 24);
  fitTxt(c, 'SHOP', -2900, -2810, 120, '#FFFFFF', 600); cupIcon(c, -1500, -2810, 1.3, '#FFFFFF'); fitTxt(c, 'COFFEE', -1100, -2810, 100, '#FFFFFF', 520);
  c.fillStyle = '#8CB8D8'; c.fillRect(-3900, -2400, 1900, 1300); c.fillStyle = '#F4EFE6'; c.fillRect(-2970, -2400, 30, 1300); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-3800, -2400); c.lineTo(-3500, -2400); c.lineTo(-3800, -1900); c.fill();
  c.fillStyle = '#D9C9A8'; for (let i = 0; i < 4; i++) c.fillRect(-3860, -1700 + i * 140, 1820, 18);   // shelves inside
  c.fillStyle = '#5A6070'; c.fillRect(-1800, -2400, 900, 2280); c.fillStyle = '#9CCBE4'; c.fillRect(-1760, -2360, 820, 2200); c.fillStyle = '#5A6070'; c.fillRect(-1360, -2360, 20, 2200);
  c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(-1700, -2360); c.lineTo(-1550, -2360); c.lineTo(-1700, -2000); c.fill();
  c.fillStyle = '#F4EFE6'; c.beginPath(); c.arc(-2470, -2560, 70, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 8; c.stroke(); c.beginPath(); c.moveTo(-2470, -2560); c.lineTo(-2470, -2610); c.moveTo(-2470, -2560); c.lineTo(-2430, -2540); c.stroke();
  // canopy over the forecourt on pillars
  c.fillStyle = '#E9EDF1'; for (const px of [-300, 1700, 3700]) c.fillRect(px - 60, -2300, 120, 2200);
  c.fillStyle = '#2E9A6A'; c.fillRect(-700, -2700, 5100, 260); c.fillStyle = '#F4EFE6'; c.fillRect(-700, -2440, 5100, 40); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-700, -2400, 5100, 30);
  pumpIcon(c, 1700, -2570, 1.6, '#FFFFFF'); fitTxt(c, 'FUEL', 2050, -2570, 130, '#FFFFFF', 420);
  // pump island behind the car
  c.fillStyle = '#B8B2A6'; c.fillRect(-500, -260, 4400, 120);
  for (const px of [300, 2600]) { c.fillStyle = '#2E9A6A'; rr(c, px - 170, -1150, 340, 900, 26); c.fill(); c.fillStyle = '#F4EFE6'; rr(c, px - 130, -1090, 260, 200, 14); c.fill(); fitTxt(c, '1.49', px, -990, 92, '#2B2F3A', 220);
    c.fillStyle = '#2B2F3A'; rr(c, px - 120, -840, 80, 160, 12); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 14; c.beginPath(); c.moveTo(px - 80, -690); c.quadraticCurveTo(px - 260, -400, px - 140, -270); c.stroke(); }
  // price board on the right
  c.fillStyle = '#8A93A2'; c.fillRect(4050, -2600, 60, 2500); c.fillStyle = '#2B2F3A'; rr(c, 3800, -3300, 560, 760, 30); c.fill();
  fitTxt(c, 'UNLEADED', 4080, -3160, 64, '#FFFFFF', 480); fitTxt(c, '1.49', 4080, -3020, 110, '#F2C14E', 400); fitTxt(c, 'DIESEL', 4080, -2860, 64, '#FFFFFF', 480); fitTxt(c, '1.56', 4080, -2720, 110, '#F2C14E', 400);
  // forecourt concrete (the ground the characters stand on)
  c.fillStyle = '#CFC9BE'; c.fillRect(BX0, -140, BW, BY0 + BH + 140); c.fillStyle = 'rgba(0,0,0,.06)';
  for (let y = -140; y < BY0 + BH; y += 300) c.fillRect(BX0, y, BW, 6); for (let x = BX0; x < BX0 + BW; x += 600) c.fillRect(x, -140, 6, BY0 + BH + 140);
  c.fillStyle = 'rgba(60,50,40,.12)'; for (const [x, y, rx] of [[-900, 300, 160], [2900, 500, 220], [-2600, 900, 200]]) { c.beginPath(); c.ellipse(x, y, rx, rx * 0.3, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#F2C14E'; for (let x = -600; x < 4200; x += 500) c.fillRect(x, 700, 260, 26);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawStation);

// ---------------- the car (live): blue family car facing left; front door (her seat) swings open, the back door slides
const frontOpen = (t, L) => L === 'o3' ? eOut(clamp((t - ev('o3', 'door')) / 0.4)) : L === 'o4' ? 1 : 0;
const rearOpen = (t, L) => L === 'end' ? eIO(clamp((t - ev('end', 'open')) / 0.45)) : 0;
function smoke(c, t, L) { if (L !== 'hook') return; const k = 1 - clamp((t - 0.4) / 2.6); if (k <= 0) return;   // tyre smoke rolling forward from both wheels
  for (const wx of [CX0 + 270, CX1 - 250]) for (let i = 0; i < 7; i++) { const u = clamp(t / 3 + i * 0.07), x = wx + 120 - i * 90 - u * 260, y = -40 - u * (160 + i * 30), r = 80 + u * 170 + i * 12; c.fillStyle = `rgba(245,245,245,${0.75 * k * (1 - u * 0.5)})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }
function skid(c, L) { if (L !== 'hook' && L !== 'o1') return; c.fillStyle = 'rgba(30,30,34,.35)'; for (const dy of [-10, 40]) { c.beginPath(); c.moveTo(CX0 + 270, dy); c.quadraticCurveTo(CX1 + 900, dy + 30, CX1 + 1800, dy + 120); c.lineTo(CX1 + 1800, dy + 150); c.quadraticCurveTo(CX1 + 900, dy + 58, CX0 + 270, dy + 26); c.fill(); } }
const glassF = q => { q.m(FD0, -640); q.q(CX0 + 580, -900, CX0 + 680, -975); q.l(CX0 + 1000, -975); q.l(CX0 + 1000, -640); q.z(); };
const Q = c => ({ m: (x, y) => c.moveTo(x, y), l: (x, y) => c.lineTo(x, y), q: (a, b, x, y) => c.quadraticCurveTo(a, b, x, y), z: () => c.closePath() });
const body = '#3F7FD0', bodyD = '#2C5E9E';
function seat(c, x0, x1, top, sitY) { c.fillStyle = '#4A5060'; rr(c, x1 - 150, top + 40, 120, sitY - top + 20, 30); c.fill(); c.fillStyle = '#5A6274'; rr(c, x0 + 10, sitY - 40, x1 - x0 - 30, 110, 30); c.fill(); c.fillStyle = 'rgba(255,255,255,.08)'; rr(c, x1 - 140, top + 60, 30, sitY - top - 40, 12); c.fill(); }
function interior(c, x0, x1, top, bot) { c.fillStyle = '#2B2F3A'; c.fillRect(x0, top, x1 - x0, bot - top); c.fillStyle = '#3A4050'; c.fillRect(x0, top, x1 - x0, 60); }
function car(c, t, L, drawGran) {
  const bounce = L === 'hook' ? Math.sin(t * 14) * 10 * Math.exp(-t * 2.2) : 0;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse((CX0 + CX1) / 2, 0, (CX1 - CX0) / 2 + 40, 34, 0, 0, TAU); c.fill();
  c.save(); c.translate((CX0 + CX1) / 2, -100); c.rotate(bounce * 0.002); c.translate(-(CX0 + CX1) / 2, 100);
  c.fillStyle = '#2B2F3A'; for (const wx of [CX0 + 270, CX1 - 250]) { c.beginPath(); c.arc(wx, -150, 175, Math.PI, TAU); c.fill(); }
  paint(c, q => { q.m(CX0 + 20, -100); q.q(CX0 - 10, -110, CX0, -300); q.q(CX0 + 10, -500, CX0 + 120, -540); q.l(CX0 + 400, -600); q.q(CX0 + 520, -900, CX0 + 650, -1000); q.q(CX0 + 700, -1030, CX0 + 780, -1030);
    q.l(CX1 - 200, -1030); q.q(CX1 - 90, -1030, CX1 - 50, -900); q.l(CX1 - 10, -640); q.q(CX1 + 10, -500, CX1, -300); q.q(CX1, -110, CX1 - 30, -100);
    q.l(CX1 - 70, -100); q.q(CX1 - 80, -330, CX1 - 250, -330); q.q(CX1 - 420, -330, CX1 - 430, -100); q.l(CX0 + 450, -100); q.q(CX0 + 440, -330, CX0 + 270, -330); q.q(CX0 + 100, -330, CX0 + 90, -100); q.z(); }, body, { sd: 10, hd: 5, lw: 5 });
  c.fillStyle = 'rgba(255,255,255,.22)'; rr(c, CX0 + 140, -560, CX1 - CX0 - 260, 26, 13); c.fill();
  c.fillStyle = '#E9EDF1'; rr(c, CX0 - 10, -250, 120, 60, 20); c.fill(); rr(c, CX1 - 110, -250, 120, 60, 20); c.fill();
  // front glass with dashboard + steering wheel
  c.save(); c.beginPath(); glassF(Q(c)); c.clip();
  const gg = c.createLinearGradient(0, -975, 0, -640); gg.addColorStop(0, '#BFE3F5'); gg.addColorStop(1, '#8EC2DE'); c.fillStyle = gg; c.fillRect(CX0 + 400, -1000, 700, 400);
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(CX0 + 400, -1000, 700, 400);
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(CX0 + 420, -700); c.quadraticCurveTo(CX0 + 600, -712, CX0 + 900, -700); c.lineTo(CX0 + 1000, -690); c.lineTo(CX0 + 1000, -600); c.lineTo(CX0 + 400, -600); c.fill();
  c.fillStyle = '#4A5060'; rr(c, CX0 + 900, -900, 90, 200, 20); c.fill();
  c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(CX0 + 600, -975); c.lineTo(CX0 + 700, -975); c.lineTo(CX0 + 560, -640); c.lineTo(CX0 + 480, -640); c.fill();
  c.restore(); c.strokeStyle = bodyD; c.lineWidth = 8; c.beginPath(); glassF(Q(c)); c.stroke();
  // rear: tinted side window (the granny is invisible until the door slides), rear screen
  paint(c, q => { q.m(RD0, -640); q.l(RD0, -975); q.l(CX1 - 220, -975); q.q(CX1 - 130, -960, CX1 - 90, -840); q.l(CX1 - 50, -640); q.z(); }, '#3A4A5E', { sd: 3, hd: 1, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(RD0 + 100, -975); c.lineTo(RD0 + 180, -975); c.lineTo(RD0 + 100, -640); c.lineTo(RD0 + 30, -640); c.fill();
  // door lines, handles, mirror, lights
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 5; c.beginPath(); c.moveTo(FD1, -1000); c.lineTo(FD1, -330); c.moveTo(FD0, -620); c.lineTo(FD0, -330); c.moveTo(RD1, -980); c.lineTo(RD1, RDB); c.moveTo(RD0, -640); c.lineTo(RD1, -640); c.stroke();
  c.fillStyle = '#E9EDF1'; rr(c, CX0 + 880, -540, 90, 22, 10); c.fill(); rr(c, RD0 + 40, -540, 90, 22, 10); c.fill();
  paint(c, q => { q.m(CX0 + 440, -700); q.l(CX0 + 360, -720); q.q(CX0 + 330, -650, CX0 + 380, -630); q.l(CX0 + 460, -640); q.z(); }, body, { sd: 3, hd: 1, lw: 4 });
  c.fillStyle = '#FFF6C0'; c.strokeStyle = '#B8A060'; c.lineWidth = 4; c.beginPath(); c.ellipse(CX0 + 70, -430, 50, 40, -0.3, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = '#E0474C'; rr(c, CX1 - 50, -500, 40, 110, 10); c.fill();
  c.fillStyle = '#5A606E'; rr(c, CX1 - 120, -130, 90, 26, 10); c.fill();
  // roof box
  paint(c, q => { q.m(CX0 + 900, -1030); q.q(CX0 + 900, -1130, CX0 + 1050, -1140); q.l(CX1 - 420, -1140); q.q(CX1 - 300, -1130, CX1 - 300, -1030); q.z(); }, '#2B2F3A', { sd: 3, hd: 1, lw: 4 });
  // the front door open (her seat): interior + door panel swung toward the camera
  const fo = frontOpen(t, L);
  if (fo > 0) { const top = -975, bot = -150; interior(c, FD0, FD1, top, bot); seat(c, FD0, FD1, top, -470);
    const w = (FD1 - FD0) * (1 - 0.62 * fo), grow = 60 * fo;   // foreshortened panel, its free edge nearer the camera (taller)
    paint(c, q => { q.m(FD0, -980); q.l(FD0 + w, -980 - grow); q.l(FD0 + w, -130 + grow); q.l(FD0, -130); q.z(); }, body, { sd: 6, hd: 3, lw: 5 });
    c.fillStyle = '#9CCBE4'; c.beginPath(); c.moveTo(FD0 + 20, -960); c.lineTo(FD0 + w - 20, -955 - grow); c.lineTo(FD0 + w - 20, -650 - grow * 0.4); c.lineTo(FD0 + 20, -650); c.fill();
    c.fillStyle = '#E9EDF1'; rr(c, FD0 + w - 80, -540 - grow * 0.4, 50, 20, 8); c.fill(); }
  // the sliding back door: the opening shows the back seat (+ the granny), the panel slides back over the rear
  const ro = rearOpen(t, L);
  if (ro > 0) { const ox = RD0, ow = (RD1 - RD0) * ro; c.save(); c.beginPath(); c.rect(ox, -985, ow, RDB + 985); c.clip();
    interior(c, RD0, RD1, -985, RDB); seat(c, RD0, RD1 + 40, -985, -470); if (drawGran) drawGran(c); c.restore();
    c.save(); c.translate(ow * 1.02, 0); paint(c, q => { q.m(RD0, -980); q.l(RD1, -980); q.l(RD1, RDB); q.l(RD0, RDB); q.z(); }, body, { sd: 6, hd: 3, lw: 5 });
    paint(c, q => { q.m(RD0 + 10, -640); q.l(RD0 + 10, -965); q.l(RD1 - 10, -965); q.l(RD1 - 10, -640); q.z(); }, '#3A4A5E', { sd: 2, hd: 1, lw: 3 }); c.restore(); }
  // wheels
  for (const wx of [CX0 + 270, CX1 - 250]) { c.fillStyle = '#22252E'; c.beginPath(); c.arc(wx, -150, 150, 0, TAU); c.fill(); c.fillStyle = '#C9D2DA'; c.beginPath(); c.arc(wx, -150, 78, 0, TAU); c.fill(); c.fillStyle = '#8A93A2'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + (L === 'hook' ? Math.max(0, 0.6 - t) * 20 : 0); c.beginPath(); c.arc(wx + Math.cos(a) * 44, -150 + Math.sin(a) * 44, 12, 0, TAU); c.fill(); } }
  c.restore();
  K.mark(c, 'car', (CX0 + CX1) / 2, -560, 500); }

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
// her cups: where they are (local hand target) for the squirt gag
const CUPDY = 300, CUPK = 1.05;
const squirtK = (t, L) => L === 'o1' ? clamp((t - ev('o1', 'squirt')) / 0.12) : 0;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'annoyed', turn: 0.25, look: 0.7 };
  const cups = (dy = CUPDY, k = CUPK, lid = 0) => { st.armL = hold(g, -1, dy, k); st.armR = hold(g, 1, dy, k); st.items = { L: cupItem(lid), R: cupItem(lid) }; };
  cups();
  if (L === 'hook') { st.mood = 'angry'; st.headY = Math.abs(Math.sin(t * 6)) * 6;
    if (t > hev('nar') + 0.3) { st.mood = 'annoyed'; st.blink = 1; st.headY = 0; }
    if (t > hev('wide')) { st.mood = 'angry'; st.blink = 0; } }
  if (L === 'o1') { st.mood = 'angry';
    if (speaking('o1_h', t, 0.05, 0.1)) { const u = t - SP.o1_h.t, hit = Math.abs(Math.sin(u * 7)); cups(CUPDY - 140 - hit * 60, 1.5); st.headY = hit * 10; }
    if (t > SP.o1_m.t) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('squirt') - 0.1) { st.mood = 'angry'; cups(CUPDY - 40, 0.75); st.headY = 4; }
    if (t > e('drip')) { st.mood = 'tired'; st.blink = 1; cups(CUPDY + 40, 1.2); st.look = 0; st.turn = 0.1; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'worried'; st.tilt = 0.06; st.lookY = 0.15; }
    if (t > SP.o2_m.t) { st.mood = 'happy'; st.tilt = 0; st.lookY = 0; }
    if (t > e('horror')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; cups(CUPDY + 80, 1.5); st.turn = 0.05; st.look = 0.2; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'skeptical'; st.armL = hold(g, -1, CUPDY, CUPK); const u = (t - SP.o3_h.t) * 4.5; st.armR = reach(g, 1, g.sw * (1.5 + 0.15 * Math.sin(u)), g.ySh + 150 + Math.cos(u) * 20, { planar: true }); }
    if (t > SP.o3_m.t) { st.mood = 'surprised'; }
    if (t > e('walk')) { st.look = 1; st.turn = 0.4; }
    if (t > e('smile')) { st.mood = 'happy'; st.blink = 1; st.look = 0.8; } }
  if (L === 'o4') { st.mood = 'smug';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.look = 0.8;
      if (t > e('sip') - 0.15 && t < e('dar')) { const k = eOut(clamp((t - e('sip') + 0.15) / 0.25)); st.armR = reach(g, 1, lerp(g.sw * CUPK, g.hw * 0.7, k), lerp(g.ySh + CUPDY, g.headY + g.hh * 0.95 + 100, k), { planar: true }); st.blink = k > 0.6 ? 1 : 0; st.mood = 'smug'; st.headFirst = false; }
      else if (t >= e('dar')) { const u = (t - SP.o4_h.t) * 3; st.armR = reach(g, 1, g.sw * (1.55 + 0.2 * Math.sin(u)), g.ySh + 160 + Math.cos(u) * 25, { planar: true }); } }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; }
    if (t > e('kneel') + 0.6) { st.blink = 0; st.mood = 'happy'; st.look = 0.9; } }
  if (L === 'end') { st.mood = 'happy'; st.turn = 0.45; st.look = 0.9; st.armL = hold(g, -1, CUPDY, CUPK); st.items = { L: cupItem() };
    const o = ev('end', 'open'); st.armR = reach(g, 1, lerp(g.sw * 2.1, g.sw * 2.6, eIO(clamp((t - o) / 0.45))), g.ySh + 230, { planar: true });
    if (t > e('reveal')) { st.mood = 'surprised'; st.blink = 0; st.armR = open(g, 1, 1.9, 120); }
    if (t > SP.end_g.t + 0.4) { st.mood = 'worried'; st.blink = 0; }
    if (t > e('shock')) { st.mood = 'shock'; st.breathe = 0; st.turn = 0.1; st.look = 0.1; st.armR = open(g, 1, 1.8, 110); }
    if (t > e('moral')) { st.mood = 'angry'; st.turn = -0.3; st.look = -0.9; } }
  return st; }
function hubState(t, L) { const kn = L === 'o4' && t > ev('o4', 'kneel'), g = kn ? G.kneel : G.hub2, e = k => ev(L, k), st = { ...base(g, t, 'hub2'), mood: 'happy', turn: -0.25, look: -0.7 };
  if (L === 'hook') { st.mood = 'surprised'; st.blink = 0;
    if (speaking('hook_m', t, 0.1, 0.1)) { const u = t - SP.hook_m.t; st.armL = open(g, -1, 1.9, 60 + Math.sin(u * 5) * 20); st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 120, { planar: true }); st.turn = u < 1.2 ? 0.25 : -0.25; st.look = u < 1.2 ? 0.9 : -0.7; }
    if (t > hev('nar') + 0.3) { st.mood = 'worried'; st.tilt = 0.05; st.armL = hold(g, -1, 280, 0.35); st.armR = hold(g, 1, 290, 0.35); } }
  if (L === 'o1') { st.mood = 'neutral'; if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('shrug') - 0.15) { const k = eOut(clamp((t - e('shrug') + 0.15) / 0.25)); st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * lerp(1.1, 2.2, k), g.ySh + lerp(500, 40, k), { planar: true }); st.armR = reach(g, 1, g.sw * lerp(1.1, 2.2, k), g.ySh + lerp(500, 40, k), { planar: true }); st.headY = -6 * k; st.tilt = 0.06 * Math.sin(t * 3); }
    if (t > endOf('o1_m') + 0.1) { st.mood = 'happy'; st.blink = 1; }
    if (t > e('squirt')) { st.mood = 'shock'; st.blink = 0; st.armL = open(g, -1, 1.5, 60); st.armR = open(g, 1, 1.5, 60); } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_m', t, 0.05, 0.1)) { st.mood = 'happy'; st.laugh = t > SP.o2_m.t + 1.2; gest(st, g, 'hub2', t, 1, 140); }
    if (t > endOf('o2_m')) { st.mood = 'happy'; st.blink = 1; st.armL = hold(g, -1, 330, 0.5); st.armR = hold(g, 1, 330, 0.5); } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o3_m.t - 0.05) { st.mood = 'worried'; st.blink = 0; st.armL = hold(g, -1, 270, 0.25); st.armR = hold(g, 1, 280, 0.25); st.tilt = 0.08; st.lookY = 0.2; }
    if (t > e('walk')) { st.mood = 'happy'; st.tilt = 0; st.lookY = 0; st.armL = down(g, -1); st.armR = down(g, 1); st.legPose = t < e('door') - 0.05 ? 'walk' : 'stand'; st.turn = 0.5; st.look = 1; }
    if (t > e('door') - 0.05) { st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 230, { planar: true }); }
    if (t > e('bow')) { const k = eOut(clamp((t - e('bow')) / 0.3)); st.turn = -0.35; st.look = -0.8; st.mood = 'happy'; st.blink = 1; st.headY = 30 * k; st.tilt = -0.08 * k; st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 300, { planar: true }); st.armR = open(g, 1, 2.2, 160); } }
  if (L === 'o4') { st.mood = 'happy'; st.turn = -0.35; st.look = -0.8; st.armR = hold(g, 1, 330, 0.6);
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > ev('o4', 'dar') ? 'worried' : 'happy'; if (t > ev('o4', 'purpose')) { st.mood = 'shock'; st.blink = 0; } }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (kn) { st.legPose = 'squat'; st.drop = 380; st.mood = 'worried'; st.blink = 0; st.turn = -0.3; st.look = -0.8; const u = (t - e('kneel')) * 7;
      st.armR = reach(g, 1, g.sw * (2.0 + 0.35 * Math.sin(u)), g.ySh + 380 + 30 * Math.cos(u), { planar: true }); st.items = { R: clothItem(t) }; st.armL = open(g, -1, 1.6, 120); } }
  if (L === 'end') { st.mood = 'neutral'; st.turn = 0.3; st.look = 0.8;
    if (t > ev('end', 'reveal')) { st.mood = 'worried'; }
    if (t > ev('end', 'grin')) { st.mood = 'happy'; st.laugh = true; st.blink = 0; st.turn = -0.2; st.look = -0.6; st.armL = open(g, -1, 1.7, 80); st.armR = open(g, 1, 1.7, 80); st.headY = -4; } }
  return st; }
const hubX = (t, L) => { if (L === 'o3') { const w = ev('o3', 'walk'), d = ev('o3', 'door'); if (t > w) return lerp(X.hub, HUBX_DOOR, eIO(clamp((t - w) / (d - w)))); }
  if (L === 'o4') return t > ev('o4', 'kneel') ? HUBX_DOOR + 170 : HUBX_DOOR; if (L === 'end') return 760; return X.hub; };
const herX = L => L === 'end' ? HERX_END : X.her;
function granState(t) { const g = G.gran3, sp = speaking('end_g', t, 0.05, 0.1);
  const st = { t, talk: talk('gran3', t), mood: 'happy', turn: -0.3, look: -0.8, legPose: 'sit', drop: 330, legs: false, armL: reach(g, -1, -g.sw * 0.55, g.ySh + 330, { planar: true }), armR: reach(g, 1, g.sw * 0.55, g.ySh + 330, { planar: true }), items: {} };
  if (t < ev('end', 'reveal') + 0.3) { st.mood = 'happy'; st.blink = 1; }
  if (sp) { const u = (t - SP.end_g.t) * 5; if (t < SP.end_g.t + 1.0) st.armL = reach(g, -1, -g.sw * (1.6 + 0.15 * Math.sin(u * 2)), g.ySh - 40 + Math.cos(u * 2) * 20, { planar: true }); st.mood = 'happy'; st.tilt = 0.05 * Math.sin(u * 0.5); }
  if (t > endOf('end_g')) { st.mood = 'happy'; st.blink = 1; }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'hub2'], cover: ['her', 'hub2'], two: ['her', 'hub2'], her: ['her'], hub: ['hub2'], three: ['her', 'hub2'], door: ['hub2'], gran: [], endw: ['her', 'hub2'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function squirts(c, t, L) { const k = squirtK(t, L); if (k <= 0) return; const g = G.her, u = t - ev('o1', 'squirt'), fade = 1 - clamp((u - 1.0) / 0.4); if (fade <= 0) return;
  for (const s of [-1, 1]) { const x0 = X.her + s * g.sw * 0.75, y0 = g.ySh + CUPDY - 40 - 70 - 186; c.save(); c.globalAlpha = fade;
    c.strokeStyle = '#6A4022'; c.lineWidth = 26; c.lineCap = 'round'; const h = 520 * eOut(clamp(u / 0.35)); c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + s * 80, y0 - h, x0 + s * 200 * clamp(u / 0.5), y0 - h * 0.6 + 400 * clamp((u - 0.35) / 0.6)); c.stroke();
    c.fillStyle = '#6A4022'; for (let i = 0; i < 6; i++) { const v = clamp(u * 1.4 - i * 0.08), xx = x0 + s * (60 + i * 40) * v, yy = y0 - (380 + i * 30) * v + 900 * v * v; c.beginPath(); c.arc(xx, yy, 16 - i, 0, TAU); c.fill(); }
    // the lid pops off
    const lx = x0 + s * 90 * clamp(u / 0.4), ly = y0 - 360 * Math.sin(Math.PI * clamp(u / 0.9)) + 200 * clamp((u - 0.9) / 0.3); c.save(); c.translate(lx, ly); c.rotate(s * u * 9); c.fillStyle = '#EE5E9A'; c.strokeStyle = '#8A2A50'; c.lineWidth = 3; rr(c, -64, -12, 128, 24, 8); c.fill(); c.stroke(); c.restore(); c.restore(); }
  // brown splats on her jumper
  const sp = clamp((u - 0.3) / 0.2); if (sp > 0) { c.save(); c.fillStyle = 'rgba(106,64,34,.8)'; for (const [dx, dy, r] of [[-60, 120, 26], [40, 170, 20], [-10, 240, 16], [70, 90, 14]]) { c.beginPath(); c.arc(X.her + dx, g.ySh + dy, r * sp, 0, TAU); c.fill(); } c.restore(); } }
function tumble(c, t, L) { if (L !== 'hook') return; const t0 = hev('wide') - 0.1, u = t - t0; if (u < 0 || u > 4) return; const x = -2600 + u * 1500, y = -120 - Math.abs(Math.sin(u * 5)) * 120;
  c.save(); c.translate(x, y); c.rotate(u * 7); c.strokeStyle = '#A8824A'; c.lineWidth = 7; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(0, 0, 110, 60 + i * 6, i * 0.7, 0, TAU); c.stroke(); } c.restore(); }
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'hub2'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); skid(c, L);
  let granHead = null; const gDraw = L === 'end' ? q => { granHead = K.put(q, GRAN, granState(t), GRANX, GRANY); q.save(); q.translate(GRANX + 10, -400); basket(q, 0.9); q.restore(); } : null;
  car(c, t, L, gDraw); smoke(c, t, L); tumble(c, t, L);
  if (who.includes('hub2')) heads.hub2 = K.put(c, HUB, hubState(t, L), hubX(t, L), 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), herX(L), 0);
  if (who.includes('her')) squirts(c, t, L);
  if (L === 'o4' && heads.hub2) sweat(c, heads.hub2, t, clamp((t - ev('o4', 'purpose')) / 0.3));
  if (L === 'end' && heads.hub2 && t > ev('end', 'grin')) sweat(c, heads.hub2, t, clamp((t - ev('end', 'grin')) / 0.3));
  if (granHead && rearOpen(t, L) > 0.6) heads.gran3 = granHead;
  if (!heads.her) heads.her = OFFL; if (!heads.hub2) heads.hub2 = OFF; if (!heads.gran3) heads.gran3 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(720, fy(HY('hub2'), 0.47, 1130), 0.47, 'cover'), WIDE: S(880, fy(HY('hub2'), 0.44, 820), 0.44, 'wide'),
  TWO: S((X.her + X.hub) / 2, fy(HY('hub2'), 0.78, 600), 0.78, 'two'),
  HER: S(X.her + 30, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.05, 640), 1.05, 'her'),
  HUB: S(X.hub + 40, fy(HY('hub2'), 1.0), 1.0, 'hub'), HUB_CU: S(X.hub + 10, fy(HY('hub2'), 1.25, 900), 1.25, 'hub'),
  DOOR: S(1250, fy(HY('hub2'), 0.62, 820), 0.62, 'door'), THREE: S(470, fy(HY('hub2'), 0.52, 820), 0.52, 'three'),
  KNEEL: S(HUBX_DOOR + 330, -720, 0.8, 'door'), HUB_D: S(HUBX_DOOR + 30, fy(HY('hub2'), 1.15, 900), 1.15, 'hub'),
  ENDA: S(HERX_END + 280, fy(HY('her'), 0.66, 860), 0.66, 'endw'), GRAN: S(GRANX + 20, fy(GRANY + G.gran3.headY, 1.15, 980), 1.15, 'gran'),
  HER_E: S(HERX_END + 20, fy(HY('her'), 1.2, 880), 1.2, 'her'), HUB_E: S(760 + 10, fy(HY('hub2'), 1.2, 900), 1.2, 'hub'),
  ENDW: S(1300, fy(HY('hub2'), 0.5, 650), 0.5, 'endw'), CLOCK: U('clock', 1), SEAT: U('seat', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('clock') - 0.05) return f(SH.TWO); if (t < hev('wide') - 0.05) return f(SH.CLOCK); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_m.t - 0.1) return f(SH.HER); if (t < e('squirt') - 0.1) return f(SH.HUB); if (t < SP.o1_nar.t - 0.05) return f(SH.TWO); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_m.t - 0.1) return f(SH.HER); if (t < e('seat')) return f(SH.HUB); if (t < e('horror') - 0.02) return f(SH.SEAT); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_m.t - 0.1) return f(SH.HER); if (t < e('walk')) return f(SH.HUB); if (t < e('smile') - 0.02) return f(SH.DOOR); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('gasp') - 0.02) return f(SH.THREE); if (t < e('kneel')) return f(SH.HUB_D); return f(SH.KNEEL); }
  if (L === 'end') { if (t < e('reveal') + 0.1) return f(SH.ENDA); if (t < e('shock') - 0.02) return f(SH.GRAN); if (t < e('grin') - 0.02) return f(SH.HER_E); if (t < e('moral') - 0.05) return f(SH.HUB_E); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'slam']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// the shop clock: the minute hand sweeps twenty minutes, the swept sector turns red
function clockView(c, t) { backdrop(c, t, '#F7E3B0', '#E3B860'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'clock' });
  const t0 = hev('clock'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6), sw = eIO(clamp((u - 0.2) / 1.0)), R0 = 360;
  c.save(); c.translate(540, 900); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(14, 22, R0 + 40, 0, TAU); c.fill();
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, 0, R0 + 40, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, 0, R0, 0, TAU); c.fill();
  const a0 = -Math.PI / 2, a1 = a0 + sw * TAU / 3;
  if (sw > 0) { c.fillStyle = 'rgba(224,71,76,.3)'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R0 - 20, a0, a1); c.closePath(); c.fill(); }
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = i % 5 === 0 ? R0 - 60 : R0 - 30; c.strokeStyle = '#2B2F3A'; c.lineWidth = i % 5 === 0 ? 12 : 5; c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * (R0 - 12), Math.sin(a) * (R0 - 12)); c.stroke(); }
  c.lineCap = 'round'; const ha = a0 + (10.5 + sw / 3) / 12 * TAU; c.strokeStyle = '#2B2F3A'; c.lineWidth = 26; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ha) * 190, Math.sin(ha) * 190); c.stroke();
  c.strokeStyle = '#E0474C'; c.lineWidth = 16; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a1) * 290, Math.sin(a1) * 290); c.stroke();
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, 0, 26, 0, TAU); c.fill(); c.restore(); }
// her seat in his car: sandwiches, crisps and a juice box all over it
function seatView(c, t) { backdrop(c, t, '#BFE0F0', '#7FB4D8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'seat' });
  const t0 = ev('o2', 'seat'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 1000); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -360, -620, 720, 1100, 90); c.fill();
  c.fillStyle = '#4A5060'; rr(c, -330, -650, 660, 760, 110); c.fill(); c.fillStyle = '#5A6274'; rr(c, -260, -580, 520, 620, 80); c.fill();
  c.fillStyle = '#4A5060'; rr(c, -150, -800, 300, 150, 50); c.fill();   // headrest
  c.fillStyle = '#5A6274'; rr(c, -400, 60, 800, 300, 80); c.fill(); c.fillStyle = '#4A5060'; rr(c, -360, 90, 720, 60, 30); c.fill();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 16; c.beginPath(); c.moveTo(-300, -560); c.lineTo(250, 120); c.stroke();   // seat belt
  const pop = i => eBack(clamp((u - 0.15 - i * 0.12) / 0.25), 2.2);
  const sand = (x, y, r, i) => { const s = pop(i); if (s <= 0) return; c.save(); c.translate(x, y); c.rotate(r); c.scale(s, s); c.fillStyle = '#F4E2B8'; c.strokeStyle = '#B8935A'; c.lineWidth = 6; c.beginPath(); c.moveTo(-110, 60); c.lineTo(110, 60); c.lineTo(0, -110); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#7DBA4A'; c.fillRect(-100, 46, 200, 12); c.fillStyle = '#E0474C'; c.fillRect(-90, 34, 180, 10); c.restore(); };
  sand(-170, 170, -0.3, 0); sand(120, 210, 0.4, 1); sand(-40, -280, 0.1, 2);
  { const s = pop(3); if (s > 0) { c.save(); c.translate(210, -120); c.rotate(-0.25); c.scale(s, s); paint(c, q => { q.m(-90, -150); q.l(90, -150); q.l(100, 150); q.l(-100, 150); q.z(); }, '#C9D2DA', { sd: 4, hd: 2, lw: 4 });
    c.fillStyle = '#E0474C'; rr(c, -70, -60, 140, 120, 20); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.ellipse(0, 0, 44, 30, 0.3, 0, TAU); c.fill(); c.restore(); } }
  { const s = pop(4); if (s > 0) { c.save(); c.translate(-210, -170); c.rotate(0.2); c.scale(s, s); paint(c, q => { q.m(-55, -100); q.l(55, -100); q.l(55, 100); q.l(-55, 100); q.z(); }, '#F2A33A', { sd: 4, hd: 2, lw: 4 }); c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; c.beginPath(); c.moveTo(20, -100); c.lineTo(36, -160); c.stroke();
    c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, 10, 30, 0, TAU); c.fill(); c.restore(); } }
  // crumbs
  c.fillStyle = '#C9A46A'; for (let i = 0; i < 18; i++) { const s = pop(5); if (s <= 0) break; c.beginPath(); c.arc(-300 + (i * 97) % 600, 120 + (i * 53) % 200, 7 * s, 0, TAU); c.fill(); }
  c.restore(); }

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
  // heroine with her coffee + Roger (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.hub2; K.put(c, HUB, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: {}, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6 + 1) * 15, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: hold(g, 1, CUPDY, CUPK), items: { R: cupItem() } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - wAt('outro', 'сохрани', sp.t + 3.7)) / 0.5) * Math.PI);
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
  if (tag.startsWith('ui:')) { if (tag === 'ui:seat') seatView(c, t); else clockView(c, t); heads = { her: OFFL, hub2: OFF, gran3: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { hub2: ['ROGER', '#2C5E9E'], gran3: ['GRANNY', '#8E5BD0'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_m: -0.2, o1_h: -0.22, o1_m: -0.2, o2_h: -0.22, o2_m: -0.2, o3_h: -0.22, o3_m: -0.2, o4_h: -0.15, o4_m: 0.2, end_g: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('forgot', NF, renderFrame);
