// "The ex invites you to his wedding" episode renderer (hard_cut camera): node exwedding.js start end out.mp4 | --png=f1,f2
// Her living room (sofa, floor lamp, window): she sits with the phone; Mark is on a video call (call window in the room shots,
// full-screen phone insert when he speaks). Invitation card «YOU'RE INVITED!» changes: A1 +1 stamp, A2 the date, B2 a little ship.
// Finale (C2 twist): hard cut to the wedding on a ship deck: her (dressed up) + Priya (wedding dress) with «MARK: USER MANUAL», Mark pale behind.
// Shots tagged 'ui:<view>' (call, invite, photo) replace the world with a full-screen insert on a solid backdrop. No black card.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/exwedding/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const ORDER = ['hook', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'outro'], idx = L => ORDER.indexOf(L);

// ---------------- cast: her in a cosy jumper at home, dressed up (dress) at the wedding; Mark as is; Priya in a hoodie at home, white dress at the wedding
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#C9A0DC' }, bottom: { type: 'joggers', col: '#8A8FA8' }, shoes: { col: '#F4EFE6', acc: '#C9A0DC' } };
const HER_D = { ...BASE.her_lift, top: { type: 'tank', col: '#2E9E8A' }, bottom: { type: 'skirt', col: '#2E9E8A' }, shoes: { col: '#2E9E8A', acc: '#F2C14E' }, necklace: true };
const MARK = BASE.mark, MARK_P = { ...BASE.mark, skin: '#E3E6CC' };
const PRI = BASE.priya, PRI_W = { ...BASE.priya, top: { type: 'tank', col: '#FFFFFF' }, bottom: { type: 'skirt', col: '#FFFFFF' }, shoes: { col: '#FFFFFF', acc: '#F2C14E' } };
const G = { her: geom(HER), ex: geom(MARK), bride: geom(PRI) };
const SEAT = 330, HX = -180;                    // she sits on the sofa (upper body dropped by SEAT)
const SX_H = -400, SX_P = 400, SX_M = 0;        // ship deck: her, Priya (seated), Mark standing behind the table
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function heart(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.3, 0, -r * 0.9, -r * 1.1, 0, -r * 0.45); c.bezierCurveTo(r * 0.9, -r * 1.1, r * 1.3, 0, 0, r * 0.9); c.fill(); c.restore(); }
function shipIcon(c, x, y, s, k = 1, col = '#2F4F6F') { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round';
  const seg = (a, f) => { if (k > a) { c.save(); c.globalAlpha = clamp((k - a) / 0.25); f(); c.restore(); } };
  seg(0, () => { c.beginPath(); c.moveTo(-110, 0); c.lineTo(110, 0); c.lineTo(80, 45); c.lineTo(-85, 45); c.closePath(); c.fillStyle = '#FFFDF8'; c.fill(); c.stroke(); for (const px of [-50, 0, 50]) { c.beginPath(); c.arc(px, 22, 7, 0, TAU); c.stroke(); } });
  seg(0.25, () => { c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -130); c.stroke(); c.beginPath(); c.moveTo(6, -120); c.lineTo(80, -20); c.lineTo(6, -20); c.closePath(); c.fillStyle = '#F7B6CF'; c.fill(); c.stroke(); c.beginPath(); c.moveTo(-6, -100); c.lineTo(-62, -20); c.lineTo(-6, -20); c.closePath(); c.fillStyle = '#FFE15A'; c.fill(); c.stroke(); });
  seg(0.5, () => { c.fillStyle = C.pink; c.beginPath(); c.moveTo(0, -130); c.lineTo(36, -118); c.lineTo(0, -106); c.fill(); heart(c, 0, -150, 14, C.pink); });
  seg(0.7, () => { c.strokeStyle = '#3C8FE0'; c.beginPath(); for (let i = 0; i < 4; i++) { const x0 = -140 + i * 70; c.moveTo(x0, 62); c.quadraticCurveTo(x0 + 17, 48, x0 + 35, 62); c.quadraticCurveTo(x0 + 52, 76, x0 + 70, 62); } c.stroke(); });
  c.restore(); }

// ---------------- the invitation card (centered at origin, 640 x 860 at s = 1): o = { stamp, date, ship } progress 0..1
function invite(c, s, o = {}) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -320 + 12, -430 + 16, 640, 860, 26); c.fill();
  c.fillStyle = '#FFFBF2'; rr(c, -320, -430, 640, 860, 26); c.fill(); c.strokeStyle = C.pinkL; c.lineWidth = 14; rr(c, -296, -406, 592, 812, 18); c.stroke(); c.strokeStyle = '#C9A13A'; c.lineWidth = 4; rr(c, -276, -386, 552, 772, 12); c.stroke();
  fitTxt(c, "YOU'RE", 0, -320, 64, C.pink, 520); fitTxt(c, 'INVITED!', 0, -246, 92, C.pink, 540);
  heart(c, 0, -140, 48, '#E0474C'); for (const sd of [-1, 1]) { c.strokeStyle = '#C9A13A'; c.lineWidth = 4; c.beginPath(); c.moveTo(sd * 70, -140); c.lineTo(sd * 220, -140); c.stroke(); }
  fitTxt(c, 'MARK & PRIYA', 0, -40, 62, '#2F3E5C', 520); fitTxt(c, 'ARE GETTING MARRIED', 0, 26, 32, '#8A8480', 500, 'Nun9');
  if (o.date > 0) { c.save(); c.beginPath(); c.rect(-260, 70, 520 * eOut(o.date), 110); c.clip(); fitTxt(c, 'SAT 14 JUNE', 0, 122, 70, '#C23C4A', 500); c.restore(); }
  else { c.strokeStyle = '#D9D0BE'; c.lineWidth = 4; c.setLineDash([14, 12]); c.beginPath(); c.moveTo(-160, 150); c.lineTo(160, 150); c.stroke(); c.setLineDash([]); }
  if (o.ship > 0) shipIcon(c, -70, 300, 0.8, o.ship);
  else { c.fillStyle = '#C9A13A'; for (const dx of [-60, 0, 60]) { c.beginPath(); c.arc(dx, 290, 8, 0, TAU); c.fill(); } }
  if (o.stamp > 0) { const k = o.stamp, sc = lerp(2.4, 1, eIn(clamp(k / 0.6))), a = clamp(k / 0.3); c.save(); c.translate(185, 285); c.rotate(-0.28); c.scale(sc, sc); c.globalAlpha = a;
    c.strokeStyle = '#D6264A'; c.lineWidth = 10; c.beginPath(); c.arc(0, 0, 92, 0, TAU); c.stroke(); c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 76, 0, TAU); c.stroke();
    UI.font(c, 'Unb9', 92); c.fillStyle = '#D6264A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+1', 0, 6); c.restore(); }
  c.restore(); }
const stampK = t => t < ev('A1', 'stamp') + 0.3 ? 0 : clamp((t - ev('A1', 'stamp') - 0.3) / 0.12 * 0.6);
const dateK = t => clamp((t - ev('A2', 'date') - 0.15) / 0.55);
const shipK = t => clamp((t - ev('B2', 'shipc') - 0.1) / 0.8);
const cardState = t => ({ stamp: t < ev('A1', 'stamp') ? 0 : (t < ev('A1', 'stamp') + 0.42 ? stampK(t) : 1), date: dateK(t), ship: shipK(t) });

// ---------------- items
const phoneItem = ctx => { ctx.save(); ctx.rotate(0.12); ctx.fillStyle = '#2B2F3A'; rr(ctx, -40, -120, 80, 150, 14); ctx.fill(); ctx.fillStyle = '#4A5060'; ctx.beginPath(); ctx.arc(-18, -100, 8, 0, TAU); ctx.fill(); ctx.restore(); };
const cardItem = (o, s = 0.45) => ctx => { ctx.save(); ctx.translate(-30, -430 * s + 40); ctx.rotate(-0.06); invite(ctx, s, o); ctx.restore(); };
const penItem = ctx => { ctx.save(); ctx.rotate(0.6); ctx.fillStyle = '#2F3E5C'; rr(ctx, -8, -90, 16, 110, 6); ctx.fill(); ctx.fillStyle = '#F2C14E'; ctx.fillRect(-8, -90, 16, 16); ctx.restore(); };
const glassItem = ctx => { ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.moveTo(-26, -120); ctx.lineTo(26, -120); ctx.lineTo(12, -50); ctx.lineTo(-12, -50); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F2D06E'; ctx.beginPath(); ctx.moveTo(-20, -100); ctx.lineTo(20, -100); ctx.lineTo(10, -56); ctx.lineTo(-10, -56); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(-3, -50, 6, 50); ctx.fillRect(-20, -4, 40, 6); ctx.restore(); };

// ---------------- sets (prerendered, softly blurred): her living room, the ship deck, Mark's flat (call background)
const BX0 = -2200, BY0 = -2800, BW = 4400, BH = 4300, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#EADCE6'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.22)'; for (let x = BX0; x < BX0 + BW; x += 170) c.fillRect(x, BY0, 70, BH);
  c.fillStyle = '#FFFDF8'; rr(c, 650, -2250, 820, 1050, 16); c.fill(); c.fillStyle = '#BFE0F2'; rr(c, 680, -2220, 760, 990, 10); c.fill();      // window, day
  c.fillStyle = '#9CC2DA'; for (const [x, w, h] of [[700, 120, 300], [840, 90, 420], [950, 150, 260], [1120, 80, 500], [1220, 180, 340]]) c.fillRect(x, -1230 - h, w, h);
  c.fillStyle = '#FFFDF8'; c.fillRect(1050, -2220, 18, 990); c.fillRect(680, -1740, 760, 16);
  c.fillStyle = '#E9A0B8'; c.fillRect(600, -2300, 120, 1150); c.fillRect(1400, -2300, 120, 1150);                                                 // curtains
  c.fillStyle = '#C9A13A'; rr(c, -560, -2120, 520, 380, 12); c.fill(); c.fillStyle = '#F4E3C8'; rr(c, -530, -2090, 460, 320, 6); c.fill();       // framed picture (a cat)
  c.fillStyle = '#8A6A4A'; c.beginPath(); c.ellipse(-300, -1880, 90, 70, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-370, -1920); c.lineTo(-350, -1990); c.lineTo(-320, -1935); c.moveTo(-280, -1935); c.lineTo(-250, -1990); c.lineTo(-230, -1920); c.fill();
  c.fillStyle = '#B07A4E'; c.fillRect(-1900, -1650, 620, 26); for (let i = 0; i < 7; i++) { const h = 140 + hash(i) * 100; c.fillStyle = ['#E0474C', '#3C8FE0', '#F2C14E', '#4CAF6A', '#8E5BD6'][i % 5]; rr(c, -1880 + i * 84, -1650 - h, 70, h, 6); c.fill(); }
  c.fillStyle = '#C9A57E'; c.fillRect(BX0, -260, BW, 1600); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -260; y < 1300; y += 80) c.fillRect(BX0, y, BW, 5);
  c.fillStyle = '#E7C9D9'; c.beginPath(); c.ellipse(0, 190, 1300, 230, 0, 0, TAU); c.fill();                                                       // rug
}
function drawShip(c) {
  const g = c.createLinearGradient(0, BY0, 0, -900); g.addColorStop(0, '#7EC8F0'); g.addColorStop(1, '#DDF2FC'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#FFFFFF'; for (const [x, y, s] of [[-1500, -2400, 1], [300, -2550, 1.3], [1500, -2300, 0.9]]) { c.beginPath(); c.ellipse(x, y, 220 * s, 70 * s, 0, 0, TAU); c.ellipse(x + 120 * s, y - 50 * s, 140 * s, 70 * s, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#9BB7A0'; c.beginPath(); c.ellipse(-1300, -1180, 520, 120, 0, Math.PI, TAU); c.fill(); c.beginPath(); c.ellipse(1450, -1180, 380, 90, 0, Math.PI, TAU); c.fill();
  c.fillStyle = '#2E86C1'; c.fillRect(BX0, -1180, BW, 950); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 40; i++) c.fillRect(BX0 + hash(i) * BW, -1150 + hash(i + 9) * 850, 60 + hash(i + 3) * 80, 6);
  c.strokeStyle = '#3A3F55'; c.lineWidth = 7; for (const [x, y] of [[-600, -2100], [-480, -2160], [900, -2000]]) { c.beginPath(); c.moveTo(x - 40, y); c.quadraticCurveTo(x - 20, y - 20, x, y); c.quadraticCurveTo(x + 20, y - 20, x + 40, y); c.stroke(); }   // gulls
  c.fillStyle = '#C98B5A'; c.fillRect(BX0, -260, BW, 1600); c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = BX0; x < BX0 + BW; x += 120) c.fillRect(x, -260, 5, 1600);   // deck planks
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BG = { room: mkBG(drawRoom), ship: mkBG(drawShip) };
function lamp(c) { const x = -950; c.fillStyle = '#5A4632'; c.fillRect(x - 10, -1500, 20, 1500); c.fillRect(x - 90, -20, 180, 24);
  paint(c, q => { q.m(x - 150, -1500); q.l(x + 150, -1500); q.l(x + 100, -1780); q.l(x - 100, -1780); q.z(); }, '#F2C14E', { sd: 8, hd: 4, lw: 4 });
  const g = c.createRadialGradient(x, -1450, 20, x, -1450, 420); g.addColorStop(0, 'rgba(255,236,170,.45)'); g.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = g; c.fillRect(x - 420, -1870, 840, 840); }
function sofa(c) { paint(c, q => { q.m(-760, -780); q.l(760, -780); q.l(760, -300); q.l(-760, -300); q.z(); }, '#6A8FC9', { sd: 12, hd: 6, lw: 3 }); }
function sofaFront(c) { paint(c, q => { q.m(-820, -420); q.l(820, -420); q.l(820, -80); q.l(-820, -80); q.z(); }, '#7FA2D8', { sd: 10, hd: 5, lw: 3 }); c.fillStyle = '#4A3A2A'; c.fillRect(-780, -80, 30, 120); c.fillRect(750, -80, 30, 120);
  for (const [px, col] of [[-640, '#F7B6CF'], [600, '#F2C14E']]) { c.save(); c.translate(px, -540); c.rotate(px < 0 ? -0.2 : 0.2); paint(c, q => q.e(0, 0, 120, 100), col, { sd: 6, hd: 3, lw: 3 }); c.restore(); }
  // knitted blanket over the arm + coffee table with a mug
  paint(c, q => { q.m(320, -430); q.l(760, -430); q.l(780, -120); q.l(340, -150); q.z(); }, '#B9A2E6', { sd: 8, hd: 4, lw: 3 });
  paint(c, q => { q.m(880, -330); q.l(1300, -330); q.l(1300, -300); q.l(880, -300); q.z(); }, '#B98A62', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#8A6A4A'; c.fillRect(900, -300, 22, 360); c.fillRect(1258, -300, 22, 360);
  c.fillStyle = '#EE5E9A'; rr(c, 960, -420, 100, 90, 12); c.fill(); c.strokeStyle = '#EE5E9A'; c.lineWidth = 10; c.beginPath(); c.arc(1068, -378, 22, -1.4, 1.4); c.stroke();
  c.save(); c.translate(1170, -336); c.rotate(-0.15); c.fillStyle = '#F4E3C8'; rr(c, -70, -8, 140, 14, 3); c.fill(); c.fillStyle = C.pinkL; rr(c, -70, -10, 140, 6, 3); c.fill(); c.restore(); }   // the opened envelope
// ship deck props
function railing(c) { c.fillStyle = '#FFFDF8'; c.fillRect(BX0, -900, BW, 22); c.fillRect(BX0, -620, BW, 14); for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, -900, 16, 640);
  c.save(); c.translate(1150, -720); c.strokeStyle = '#E0474C'; c.lineWidth = 40; c.beginPath(); c.arc(0, 0, 90, 0, TAU); c.stroke(); c.strokeStyle = '#FFFDF8'; c.lineWidth = 40; c.setLineDash([70, 71]); c.beginPath(); c.arc(0, 0, 90, 0.3, TAU + 0.3); c.stroke(); c.setLineDash([]); c.restore(); }
function garlands(c, t) { for (const [x0, x1, y, sag] of [[-2000, 0, -2050, 160], [0, 2000, -2050, 160], [-1300, 1300, -1750, 120]]) {
    c.strokeStyle = '#3A3F55'; c.lineWidth = 4; c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, x = lerp(x0, x1, u), yy = y + Math.sin(u * Math.PI) * sag; i ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke();
    for (let i = 1; i < 12; i++) { const u = i / 12, x = lerp(x0, x1, u), yy = y + Math.sin(u * Math.PI) * sag; const col = ['#EE5E9A', '#F2C14E', '#7FB0D8', '#FFFDF8'][i % 4]; c.fillStyle = col; c.beginPath(); c.moveTo(x - 34, yy); c.lineTo(x + 34, yy); c.lineTo(x, yy + 70); c.fill();
      c.fillStyle = Math.sin(t * 5 + i) > 0 ? '#FFF4B8' : '#FFE07A'; c.beginPath(); c.arc(x + 50, yy + 8, 11, 0, TAU); c.fill(); } }
  c.fillStyle = '#FFFDF8'; rr(c, -560, -1640, 1120, 150, 26); c.fill(); c.strokeStyle = C.pink; c.lineWidth = 8; rr(c, -560, -1640, 1120, 150, 26); c.stroke(); fitTxt(c, 'JUST MARRIED', 0, -1564, 96, C.pink, 1020); heart(c, -500, -1564, 24, '#E0474C'); heart(c, 500, -1564, 24, '#E0474C'); }
function chair(c, x) { paint(c, q => { q.m(x - 170, -980); q.l(x + 170, -980); q.l(x + 170, -300); q.l(x - 170, -300); q.z(); }, '#FFFDF8', { sd: 8, hd: 4, lw: 3 }); c.fillStyle = '#F7B6CF'; rr(c, x - 120, -940, 240, 60, 20); c.fill(); }
function table(c) { const y = -470;
  paint(c, q => { q.m(-430, y); q.l(430, y); q.l(520, 0); q.l(-520, 0); q.z(); }, '#FFFFFF', { sd: 10, hd: 5, lw: 3 }); c.fillStyle = 'rgba(0,0,0,.06)'; for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(i * 100, y + 20); c.lineTo(i * 125, 0); c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.05)'; c.stroke(); }
  c.fillStyle = '#F3EEE4'; c.beginPath(); c.ellipse(0, y, 440, 46, 0, 0, TAU); c.fill();
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 120, y - 4); c.fillStyle = C.pinkL; c.beginPath(); c.ellipse(0, 0, 44, 10, 0, 0, TAU); c.fill(); c.restore(); } }
function folder(c, t) { const x = 0, y = -480;   // thick binder standing on the table: «MARK: USER MANUAL»
  c.save(); c.translate(x, y); c.rotate(-0.03);
  paint(c, q => { q.m(-180, 0); q.l(180, 0); q.l(180, -420); q.l(-180, -420); q.z(); }, '#C23C4A', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#8A1C2E'; c.fillRect(-180, -420, 54, 420); for (const yy of [-330, -90]) { c.fillStyle = '#C9C3B4'; c.beginPath(); c.arc(-153, yy, 14, 0, TAU); c.fill(); }
  c.fillStyle = '#FFFDF8'; c.fillRect(176, -410, 12, 400); for (let k = 0; k < 8; k++) { c.fillStyle = ['#F2C14E', '#7FB0D8', '#4CAF6A', C.pinkL][k % 4]; c.fillRect(180, -400 + k * 48, 26, 30); }   // sticky tabs
  c.fillStyle = '#FFFDF8'; rr(c, -110, -360, 270, 200, 12); c.fill(); fitTxt(c, 'MARK:', 25, -310, 54, '#2B2F3A', 240); fitTxt(c, 'USER', 25, -246, 50, '#C23C4A', 240); fitTxt(c, 'MANUAL', 25, -194, 50, '#C23C4A', 240);
  fitTxt(c, 'VOL. 1', 25, -100, 34, '#FFFDF8', 240); c.restore(); }
function notebook(c, t) { c.save(); c.translate(250, -476); c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(-90, 0); c.lineTo(90, 0); c.lineTo(110, 24); c.lineTo(-110, 24); c.closePath(); c.fill(); c.fillStyle = '#7FB0D8'; c.fillRect(-110, 24, 220, 8); c.restore(); }

// ---------------- characters
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const lap = (g, s) => reach(g, s, s * g.sw * 0.5, g.ySh + 260);
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const holdPhone = g => reach(g, 1, g.sw * 0.75, g.ySh + 150, { planar: true });
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } }
function herSofa(t, L, o = {}) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.2, look: 0.3, legPose: 'sit', drop: SEAT, legs: false, armL: lap(g, -1), armR: holdPhone(g), items: { R: phoneItem } };
  if (L === 'hook') { st.mood = 'skeptical'; st.turn = 0.1; st.look = 0.1; st.items = { R: phoneItem, L: cardItem({ stamp: 1 }, 0.55) }; st.armL = reach(g, -1, -g.sw * 1.45, g.ySh + 160, { planar: true });
    if (t > hev('deadpan') - 0.1) { st.mood = 'bored'; st.blink = 0.5; } if (t > hev('cover')) { st.mood = 'skeptical'; st.blink = 0; } if (o.cover) { st.mood = 'skeptical'; st.blink = 0; } }
  if (L === 'A1') { st.mood = 'neutral'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'annoyed'; st.armL = reach(g, -1, -g.sw * (1.7 + Math.sin(t * 9) * 0.15), g.ySh + 110, { planar: true }); } if (t > endOf('a1_m')) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'A2') { st.mood = 'worried'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'worried'; gest(st, g, 'her', t, -1, 170); } if (t > SP.a2_m.t + 0.8) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'B1') { st.mood = 'happy'; if (speaking('b1_h', t, 0.05, 0.3)) gest(st, g, 'her', t, -1, 160); if (t > endOf('b1_m') - 0.3) { st.mood = 'worried'; } }
  if (L === 'B2') { st.mood = 'smug'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'bored'; st.armL = open(g, -1, 1.5, 150); } if (t > SP.b2_m.t + 0.3) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_h', t, 0.05, 0.3)) { gest(st, g, 'her', t, -1, 160); } if (t > endOf('c1_m') - 0.2) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'C2') { st.mood = 'neutral';
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.turn = 0.1; st.look = 0.1; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 40 + Math.sin(t * 2) * 30, { planar: true }); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; } if (t > ev('C2', 'grab')) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('c2_h2', t, 0.05, 0.3)) { const p = (t - SP.c2_h2.t) / SP.c2_h2.d; st.mood = p < 0.55 ? 'skeptical' : 'smug'; st.blink = 0; } }
  return st; }
// Mark / Priya inside the call (h = head-and-shoulders layout)
function markState(t, L, o = {}) { const g = G.ex, st = { t, talk: talk('ex', t), mood: 'happy', turn: 0, look: 0, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'happy'; if (speaking('hook_m', t, 0.05, 0.2)) { st.mood = 'worried'; st.laugh = false; } else { st.laugh = t > hev('cover'); if (st.laugh) st.armR = reach(g, 1, g.sw * 1.8, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }); } }
  if (L === 'A1') { if (speaking('a1_m', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = open(g, -1, 1.8); } }
  if (L === 'A2') { if (speaking('a2_m', t, 0.05, 0.3)) { st.mood = 'skeptical'; gest(st, g, 'ex', t, -1, 120); } }
  if (L === 'B1') { if (speaking('b1_m', t, 0.05, 0.3)) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 140, { planar: true }); st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 140, { planar: true }); } if (t > ev('B1', 'wave')) { st.mood = 'happy'; st.turn = 0.3; st.look = 0.6; } }
  if (L === 'B2') { if (speaking('b2_m', t, 0.05, 0.3)) { st.mood = 'happy'; st.laugh = true; st.armL = open(g, -1, 2.0, -60); st.armR = open(g, 1, 2.0, -60); } }
  if (L === 'C1') { if (t > SP.c1_h.t + 1.0) st.mood = 'surprised'; if (speaking('c1_m', t, 0.05, 0.5)) { st.mood = 'surprised'; st.headY = Math.abs(Math.sin((t - SP.c1_m.t) * 6)) * 16; } }
  if (L === 'C2') { st.mood = 'worried'; if (t > endOf('c2_h') - 0.2) { st.mood = 'shock'; st.blink = 0; } if (t > ev('C2', 'grab')) { st.mood = 'shock'; st.turn = 0.5; st.look = 0.9; } }
  return st; }
function priyaCall(t, L, close) { const g = G.bride, st = { t, talk: talk('bride', t), mood: 'happy', laugh: true, turn: close ? 0 : -0.2, look: close ? 0 : -0.3, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 320 + Math.sin(t * 10) * 50, { planar: true });
  if (close) { st.laugh = !speaking('c2_b', t, 0.05, 0.1) || Math.sin(t * 3) > 0.6; st.armR = reach(g, 1, g.sw * 0.8, g.ySh + 280); st.armL = reach(g, -1, -g.sw * 0.8, g.ySh + 280); st.headX = Math.sin(t * 3) * 6; }
  return st; }
// the call picture (Mark's flat) in a w x h screen; returns heads in local coords
function callScene(cc, w, h, t, L) { const heads = {};
  cc.fillStyle = '#E7DCCB'; cc.fillRect(0, 0, w, h); cc.fillStyle = '#D6C7AE'; cc.fillRect(0, h * 0.62, w, h * 0.38);
  cc.fillStyle = '#C9A13A'; rr(cc, w * 0.06, h * 0.08, w * 0.3, w * 0.22, 6); cc.fill(); cc.fillStyle = '#BFE0F2'; rr(cc, w * 0.075, h * 0.08 + w * 0.015, w * 0.27, w * 0.19, 4); cc.fill();
  shipIcon(cc, w * 0.21, h * 0.08 + w * 0.12, w / 1500, 1, '#2F4F6F');
  cc.fillStyle = '#5E9E6E'; for (let k = 0; k < 5; k++) { cc.beginPath(); cc.ellipse(w * 0.88 + Math.cos(k) * w * 0.05, h * 0.2 - k * h * 0.03, w * 0.05, w * 0.025, k, 0, TAU); cc.fill(); }
  const s = w / 416 * 0.5, grab = L === 'C2' && t > ev('C2', 'grab') + 0.15, wave = L === 'B1' && t > ev('B1', 'wave');
  const mx = grab ? w * 0.1 : w * 0.5, my = h * 0.37, ms = grab ? s * 0.9 : s;
  if (wave) { const ps = s * 0.72, py = h * 0.27; heads.bride = K.put(cc, PRI, priyaCall(t, L, false), w * 0.8, py - G.bride.headY * ps, ps); }
  heads.ex = K.put(cc, MARK, markState(t, L), mx, my - G.ex.headY * ms, ms);
  if (grab) { const ps = s * 1.5, py = h * 0.42; heads.bride = K.put(cc, PRI, priyaCall(t, L, true), w * 0.56, py - G.bride.headY * ps, ps); }
  return heads; }

// wedding (ship deck)
function veil(c, x, g, s = 1) { const hy = SEAT + g.headY; c.save(); c.translate(x, hy); c.fillStyle = 'rgba(255,255,255,.72)'; c.beginPath(); c.moveTo(-g.hw * 0.8, -g.hh * 0.7); c.quadraticCurveTo(-g.hw * 2.0, g.hh * 1.6, -g.hw * 1.8, g.hh * 3.4); c.lineTo(g.hw * 1.8, g.hh * 3.4); c.quadraticCurveTo(g.hw * 2.0, g.hh * 1.6, g.hw * 0.8, -g.hh * 0.7); c.closePath(); c.fill(); c.restore(); }
function flowerCrown(c, gg, g) { const x = gg.head.x, y = gg.head.y - g.hh * 0.78; for (let k = -2; k <= 2; k++) { c.fillStyle = ['#FFFDF8', '#F7B6CF', '#FFFDF8', '#F7B6CF', '#FFFDF8'][k + 2]; c.beginPath(); c.arc(x + k * g.hw * 0.32, y + Math.abs(k) * 10, 15, 0, TAU); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x + k * g.hw * 0.32, y + Math.abs(k) * 10, 5, 0, TAU); c.fill(); } }
function lace(c, a, g) { c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = 'rgba(200,190,170,.7)'; c.lineWidth = 3; for (let k = -3; k <= 3; k++) { c.beginPath(); c.arc(k * a.sw * 0.22, a.ySh + 40, 12, 0, TAU); c.fill(); c.stroke(); } }
function herShip(t) { const g = G.her, st = { t, talk: talk('her', t), mood: 'happy', laugh: true, turn: 0.25, look: 0.5, legPose: 'sit', drop: SEAT, legs: false, armL: lap(g, -1), armR: open(g, 1, 1.8, 130), items: { L: glassItem } };
  st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 130, { planar: true }); if (Math.sin(t * 3) > 0.3) st.laugh = false; return st; }
function priShip(t) { const g = G.bride, st = { t, talk: 0, mood: 'happy', laugh: Math.sin(t * 2.5) > 0, turn: -0.3, look: -0.5, lookY: 0.35, legPose: 'sit', drop: SEAT, legs: false, armR: hang(g, 1), items: { L: penItem } };
  st.armL = reach(g, -1, -g.sw * 0.9 + Math.sin(t * 14) * 14, g.ySh + 270 + Math.cos(t * 14) * 6, { planar: true });
  st.afterTorso = (cc, a) => lace(cc, a, g); st.front = (cc, a) => flowerCrown(cc, a, g); return st; }
function markShip(t) { const g = G.ex, st = { t, talk: 0, mood: 'worried', blink: 0, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 240), armR: reach(g, 1, g.sw * 0.5, g.ySh + 240), items: {} };
  st.headX = Math.sin(t * 20) * 3;   // trembling
  st.front = (cc, a) => { const x = a.head.x + g.hw * 0.8, y = a.head.y - g.hh * 0.3 + ((t * 1.2) % 1) * 60; cc.fillStyle = '#9CD3F0'; cc.beginPath(); cc.moveTo(x, y - 26); cc.quadraticCurveTo(x + 16, y, x, y + 12); cc.quadraticCurveTo(x - 16, y, x, y - 26); cc.fill();
    cc.fillStyle = '#FFFDF8'; cc.beginPath(); cc.arc(-a.sw * 0.45, a.ySh + 70, 16, 0, TAU); cc.fill(); };
  return st; }

// ---------------- the world: set + characters by shot tag (clean singles draw only the tagged character)
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag, o) { const heads = {};
  if (tag === 'ship') { c.drawImage(BG.ship, BX0, BY0, BW, BH); railing(c); garlands(c, t);
    const sm = 0.8; heads.ex = K.put(c, MARK_P, markShip(t), SX_M, -70, sm);
    chair(c, SX_H); chair(c, SX_P); veil(c, SX_P, G.bride);
    heads.her = K.put(c, HER_D, herShip(t), SX_H, 0); heads.bride = K.put(c, PRI_W, priShip(t), SX_P, 0);
    table(c); folder(c, t); notebook(c, t); K.mark(c, 'folder', 0, -700, 260);
    heads.ex = OFF; heads.bride = OFF; heads.her = OFFL; return heads; }
  c.drawImage(BG.room, BX0, BY0, BW, BH); lamp(c); sofa(c);
  heads.her = K.put(c, HER, herSofa(t, L, o), HX, 0); sofaFront(c); K.mark(c, 'sofa', 0, -450, 600);
  heads.ex = OFF; heads.bride = OFF; return heads; }

// ---------------- shots
const S = (x, y, z, tag, win) => ({ x, y, z, r: 0, tag, win });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hSit = SEAT + G.her.headY, bSit = SEAT + G.bride.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(HX + 130, fy(hSit, 0.86, 930), 0.86, 'cover', [622, 820, 410, 560]), ROOM: S(HX + 380, fy(hSit, 0.6, 1050), 0.6, 'room', [600, 860, 420, 580]),
  CARD: S(HX + 300, fy(hSit, 0.8, 1130), 0.8, 'card', [618, 940, 400, 560]),
  HER: S(HX + 60, fy(hSit, 1.0), 1.0, 'her'), HER_CU: S(HX + 20, fy(hSit, 1.6, 980), 1.6, 'her'),
  SHIP: S(0, fy(bSit, 0.64, 1000), 0.64, 'ship'), SHIP_CARD: S(0, fy(bSit, 0.5, 1030), 0.5, 'ship'),
  CALL: U('call', 1), INVITE: U('invite', 2), PHOTO: U('photo', 3) };
const C2Z = [1.0, 1.22, 1.45].map(z => S(HX + 40, fy(hSit, z, 960), z, 'her'));
const c2Chunk = t => { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0), chars = ch.map(([en]) => en.length), ctot = chars.reduce((a, b) => a + b, 0);
  let wi = 0, ci = 0, i = 0; ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * ci / ctot; if (t >= a - 0.05) i = k; wi += cnt[k]; ci += chars[k]; }); return i; };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.ROOM;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('cu')) return SH.COVER; if (t < hev('call')) return f(SH.INVITE); if (t < hev('deadpan')) return f(SH.CALL); if (t < hev('cover')) return f(SH.HER_CU);
    const h = t - hev('cover'); if (h < 2.0) return f(SH.COVER); if (h < 3.3) return f(SH.CALL); if (h < 5.3) return f(SH.COVER); return f(SH.HER_CU); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (L === 'C2' && t > e('ship') - 0.03) return f(t >= nar.t - 0.1 ? SH.SHIP_CARD : SH.SHIP);
  if (u < 1.15) return f(SH.ROOM);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('stamp') - 0.03) return f(SH.INVITE);
  if (L === 'A2' && t > e('date') - 0.03) return f(SH.INVITE);
  if (L === 'B1' && t > e('wave') - 0.03) return f(SH.CALL);
  if (L === 'B2') { if (t > e('shipc') - 0.03) return f(SH.INVITE); if (t > e('photo') - 0.03) return f(SH.PHOTO); }
  if (L === 'C2') { if (sp('c2_h')) return f(C2Z[c2Chunk(t)] || SH.HER); if (t > endOf('c2_h') + 0.1 && t < SP.c2_h2.t - 0.1) return f(SH.CALL); if (t >= SP.c2_h2.t - 0.1) return f(SH.HER_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.CALL;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.HER; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh, o) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag, o); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen inserts (solid backdrop)
function backdrop(c, id, a = '#2B3040', b = '#171A24') { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
const PH = { x: 540, y: 1250, s: 1.3 };
function callView(c, t, L) { backdrop(c, 'call'); let loc = {};
  const g0 = ev('C2', 'grab'), rot = L === 'C2' && t > g0 && t < g0 + 0.45 ? Math.sin((t - g0) * 40) * 0.12 * (1 - (t - g0) / 0.45) : 0;
  const scr = (cc, w, h) => { loc = callScene(cc, w, h, t, L);
    cc.fillStyle = 'rgba(0,0,0,.35)'; cc.fillRect(0, 0, w, 64); fitTxt(cc, L === 'C2' && t > g0 + 0.15 ? 'MARK + PRIYA' : 'MARK', 24, 34, 28, '#FFFFFF', w - 160, 'Unb9', 'left'); fitTxt(cc, '00:' + String(10 + Math.floor(t) % 50).padStart(2, '0'), w - 24, 34, 24, '#DDE3EA', 120, 'Nun9', 'right');
    // self view (her) in the corner
    cc.save(); cc.translate(w - 120, 84); cc.fillStyle = '#2B2F3A'; rr(cc, -4, -4, 108, 148, 14); cc.fill(); cc.beginPath(); rr(cc, 0, 0, 100, 140, 10); cc.clip(); cc.fillStyle = '#EADCE6'; cc.fillRect(0, 0, 100, 140);
    K.put(cc, HER, { ...herSofa(t, L), legPose: 'stand', drop: 0, legs: false, armR: hang(G.her, 1), armL: hang(G.her, -1), items: {} }, 50, 70 - G.her.headY * 0.13, 0.13); cc.restore();
    for (const [x, col] of [[w * 0.3, '#4A5060'], [w * 0.5, '#E0474C'], [w * 0.7, '#4A5060']]) { cc.fillStyle = col; cc.beginPath(); cc.arc(x, h - 60, 34, 0, TAU); cc.fill(); }
    cc.strokeStyle = '#FFFFFF'; cc.lineWidth = 6; cc.lineCap = 'round'; cc.beginPath(); cc.moveTo(w * 0.5 - 16, h - 56); cc.quadraticCurveTo(w * 0.5, h - 70, w * 0.5 + 16, h - 56); cc.stroke(); };
  K.phone(c, PH.x, PH.y, PH.s, scr, rot);
  const tr = p => ({ x: PH.x + PH.s * (p.x - 208), y: PH.y + PH.s * (p.y - 370), hh: p.hh * PH.s });
  const heads = { her: OFFL, ex: OFF, bride: OFF }; for (const k of ['ex', 'bride']) if (loc[k] && loc[k].x > -50 && loc[k].x < 466) heads[k] = tr(loc[k]);
  return heads; }
function inviteView(c, t, L) { backdrop(c, 'invite', '#F7D6E2', '#E6A9C0');
  c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 14; i++) heart(c, hash(i) * W, hash(i + 7) * HH, 26 + hash(i + 3) * 30, 'rgba(255,255,255,.35)');
  if (L === 'hook') { const k = eOut(P(t, hev('cu') + 0.02, hev('cu') + 0.5)), y = lerp(1500, 930, k);
    c.save(); c.translate(540, 1500); c.fillStyle = '#F4E3C8'; rr(c, -380, -40, 760, 460, 18); c.fill(); c.restore();      // envelope back
    c.save(); c.translate(540, y); c.rotate(lerp(0.1, -0.03, k)); invite(c, 0.95, { stamp: 0, date: 0, ship: 0 }); c.restore();
    c.save(); c.translate(540, 1500); c.fillStyle = '#EED6B6'; c.beginPath(); c.moveTo(-380, -20); c.lineTo(0, 200); c.lineTo(380, -20); c.lineTo(380, 420); c.lineTo(-380, 420); c.closePath(); c.fill(); c.strokeStyle = '#D9BE95'; c.lineWidth = 6; c.stroke();
    heart(c, 0, 210, 40, '#E0474C'); c.restore(); return; }
  const st = cardState(t); let s = 1.05; c.save(); c.translate(540, 960); c.rotate(-0.025); invite(c, s, st); c.restore();
  if (L === 'B2') for (let k = 0; k < 5; k++) { const a = t * 3 + k * 1.25; c.fillStyle = C.gold; UI.star(c, 540 + Math.cos(a) * 420, 1270 + Math.sin(a) * 120, 26); } }
function photoView(c, t) { backdrop(c, 'photo', '#2E86C1', '#1B4F72'); const a = ev('B2', 'photo'), k = eBack(P(t, a, a + 0.3), 1.6); if (k <= 0) return;
  c.save(); c.translate(540, 1110); c.rotate(0.04); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-400 + 14, -470 + 18, 800, 940); c.fillStyle = '#FFFDF8'; c.fillRect(-400, -470, 800, 940);
  c.save(); c.beginPath(); c.rect(-360, -430, 720, 720); c.clip(); const g = c.createLinearGradient(0, -430, 0, 290); g.addColorStop(0, '#7EC8F0'); g.addColorStop(1, '#DDF2FC'); c.fillStyle = g; c.fillRect(-360, -430, 720, 720);
  c.fillStyle = '#2E86C1'; c.fillRect(-360, 120, 720, 170); c.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 10; i++) c.fillRect(-340 + hash(i) * 640, 140 + hash(i + 4) * 130, 50, 5);
  // the white wedding ship with garlands
  paint(c, q => { q.m(-300, 60); q.l(300, 60); q.l(240, 170); q.l(-250, 170); q.z(); }, '#FFFDF8', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#2F3E5C'; c.fillRect(-250, 150, 490, 20);
  paint(c, q => { q.m(-180, -40); q.l(200, -40); q.l(200, 60); q.l(-180, 60); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4 }); for (let i = 0; i < 6; i++) { c.fillStyle = '#7FB0D8'; rr(c, -160 + i * 60, -20, 40, 40, 8); c.fill(); }
  c.fillStyle = '#E0474C'; c.fillRect(60, -180, 70, 140); c.fillStyle = '#2B2F3A'; c.fillRect(60, -180, 70, 26);
  c.strokeStyle = '#3A3F55'; c.lineWidth = 3; c.beginPath(); c.moveTo(-300, 60); c.quadraticCurveTo(-120, 0, 95, -180); c.quadraticCurveTo(220, -60, 300, 60); c.stroke();
  for (let i = 0; i < 14; i++) { const u = i / 14, x = u < 0.5 ? lerp(-280, 90, u * 2) : lerp(100, 290, (u - 0.5) * 2), y = u < 0.5 ? lerp(50, -170, u * 2) : lerp(-170, 50, (u - 0.5) * 2); c.fillStyle = ['#EE5E9A', '#F2C14E', '#7FB0D8'][i % 3]; c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x + 10, y); c.lineTo(x, y + 20); c.fill(); }
  heart(c, -260, -330, 30, '#E0474C'); heart(c, 270, -300, 24, '#EE5E9A'); c.restore();
  fitTxt(c, 'OUR WEDDING SHIP!', 0, 380, 58, '#2F3E5C', 700); c.restore(); }

// ---------------- overlays: title ribbon, cover badge, the call window in room shots, the invitation widget
function title(c, t) { const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.translate(540, 470); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore(); }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1745); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -340 + 6, -60 + 10, 680, 120, 60); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -340, -60, 680, 120, 60); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -340, -60, 680, 120, 60); c.stroke();
  fitTxt(c, 'SO... ARE YOU COMING?', 0, 4, 56, '#E0474C', 620); c.restore(); }
function roomWindow(c, t, L, win) { const [x, y, w, h] = win; K.callWindow(c, x, y, w, h, 'MARK', '#2F3E5C', 1, (cc, ww, hh) => { callScene(cc, ww, hh, t, L); }, '#E7DCCB'); }
function widget(c, t, sc, tag) { return; /* owner: no corner counter/icons in the video */ const L = sc.id; if (L === 'hook' || L === 'outro' || tag.startsWith('ui:') || tag === 'ship') return; const nar = SP[L.toLowerCase() + '_nar'], u = t - sc.s;
  if (u < 1.2 || (nar && t > nar.t - 0.2)) return;
  const chg = [[ev('A1', 'stamp') + 0.6, 'ПЛЮС ОДИН'], [ev('A2', 'date') + 0.6, 'ДАТА: 14 ИЮНЯ'], [ev('B2', 'shipc') + 0.8, 'НА КОРАБЛЕ']].filter(q => t >= q[0]); const last = chg[chg.length - 1];
  const since = last ? t - last[0] : 9, bubble = TL.speech.some(s => s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.4);
  const label = last && since < 2.0 && !bubble, bump = since > 0 && since < 0.4 ? 1 + 0.3 * Math.sin(since / 0.4 * Math.PI) : 1, k = eBack(P(u, 1.2, 1.5), 1.6) * bump;
  const st = cardState(t), n = (st.stamp > 0.5) + (st.date > 0.5) + (st.ship > 0.5), w = label ? 340 : 110 + n * 70, h = label ? 128 : 96;
  c.save(); c.translate(70, 1530); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, 6, 8, w, h, 22); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, 0, 0, w, h, 22); c.fill(); c.stroke();
  const iy = label ? 84 : 48; c.save(); c.translate(50, iy); c.fillStyle = '#FFFBF2'; c.strokeStyle = C.pink; c.lineWidth = 3; rr(c, -26, -34, 52, 68, 6); c.fill(); c.stroke(); heart(c, 0, -2, 12, '#E0474C'); c.restore();
  let x = 110; if (st.stamp > 0.5) { c.strokeStyle = '#D6264A'; c.lineWidth = 4; c.beginPath(); c.arc(x + 20, iy, 26, 0, TAU); c.stroke(); fitTxt(c, '+1', x + 20, iy + 2, 26, '#D6264A', 44); x += 70; }
  if (st.date > 0.5) { c.fillStyle = '#C23C4A'; rr(c, x, iy - 26, 44, 14, 4); c.fill(); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#C23C4A'; c.lineWidth = 3; rr(c, x, iy - 26, 44, 52, 6); c.stroke(); fitTxt(c, '14', x + 22, iy + 8, 24, '#2B2F3A', 40); x += 70; }
  if (st.ship > 0.5) { shipIcon(c, x + 22, iy + 10, 0.2, 1); x += 70; }
  if (label) { UI.textFit(c, 'Unb9', 30, last[1], w - 40); c.fillStyle = C.oliveD; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(last[1], 22, 32); }
  c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No. Never. Bye!'], ['B1', "I don't think I can make it."], ['B2', 'That ship has sailed.'], ['C1', "I think it's best if I sit this one out."]];
    K.outro(c, t, { q: ['А ТЫ БЫ ПОШЛА', 'НА СВАДЬБУ БЫВШЕГО?'], rows, cta: ['ОТПРАВЬ ПОДРУГЕ, У КОТОРОЙ', 'БЫВШИЙ ЖЕНИТСЯ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gp = G.bride;
        K.put(cc, PRI_W, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gp, -1, -gp.sw * 2.0, gp.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gp, 1), items: {}, afterTorso: (c2, a) => lace(c2, a, gp), front: (c2, a) => flowerCrown(c2, a, gp) }, 640, 330);
        K.put(cc, HER_D, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'room', win = cam.win || (tag === 'cover' ? SH.COVER.win : tag === 'card' ? SH.CARD.win : tag === 'room' ? SH.ROOM.win : null);
  let heads, proj;
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); const v = tag.slice(3);
    if (v === 'call') heads = callView(c, t, L); else { heads = { her: OFFL, ex: OFF, bride: OFF }; if (v === 'invite') inviteView(c, t, L); else if (v === 'photo') photoView(c, t); }
    c.restore(); proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh, { cover: tag === 'cover' }); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26);
    if (win) roomWindow(c, t, L, win); }
  const names = { ex: ['MARK', '#2F3E5C'], bride: ['PRIYA', '#3FB6A8'] };
  if (L === 'hook') { const cover = tag === 'cover'; if (cover) { title(c, t); if (t < SP.hook_m.t) coverBadge(c, t); }
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { cleanChunks: true, names, hold: { hook_m: 0.1 } }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (L === 'C2') { const e = k => ev(L, k); if (t > endOf('c2_h') + 0.15 && t < e('grab') - 0.05) K.dots(c, t, endOf('c2_h') + 0.2, e('grab') - 0.1, 600); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_m: 0.02, a2_m: 0.02, b1_m: 0.3, b2_m: 0.05, c1_m: 0.3, c2_h: 0.05, c2_b: 0.1, c2_h2: 0.05 } });
  widget(c, t, sc, tag);
  K.hud(c, t, sc);
}
E.run('exwedding', NF, renderFrame);
