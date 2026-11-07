// "Свекровь учит воспитывать ребёнка" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node baby.js start end out.mp4 | --png=f1,f2
// A cosy living room: the heroine (pink jumper) on the left holding the baby (a blue swaddle bundle), her mother-in-law (lavender cardigan, pearls,
// cat-eye glasses) on the right, a sofa, a pram, a side table with a baby bottle, the door on the right.
// hook: "That's not how you hold a baby, dear. In my day..." — she reaches for the baby; on «Опять» she produces a huge book BABY CARE 1979.
// o1 «В ЛОБ»: "My baby, my rules!" / "Your baby, my grandson, my rules." — she simply takes the baby; the heroine's arms are empty.
// o2 «ВЕЖЛИВО»: "...we're doing fine." / "He's wearing socks with sandals!" — insert: the tiny foot in a striped sock and a sandal; deadpan.
// o3 «КАК НОСИТЕЛЬ»: "...we've got it covered." — she reluctantly shuts the book; the baby giggles; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the heroine hands the baby over on "Would you like the night shift?"; insert: NIGHT SHIFT card 2:00 4:00 5:00; MIL sweats.
// Twist: the baby bursts into tears in grandma's arms: "Oh! He wants his mum!" — she hands him back and hurries out (door slam); he stops at once,
// the heroine looks into the camera. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/baby/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift };
const MIL = { ...BASE.margot, top: { type: 'cardigan', col: '#8E6CC8', col2: '#F5EBDD' }, bottom: { type: 'skirt', col: '#4A3F5C' }, shoes: { col: '#6A3A4A', acc: null } };
const G = { her: geom(HER), mil: geom(MIL) };
const X = { her: -230, mil: 330 };
const DOORX = 1560, DOORW = 560;                      // the living-room door on the right (centre x, width)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// the baby: a blue swaddle bundle, (0,0) = centre of the bundle; head on the right (dir = 1) or the left (dir = -1)
// o = { mood: 'calm' | 'happy' | 'cry', t, sandals }
function baby(c, s, dir, o) { const t = o.t || 0; c.save(); c.scale(s * dir, s);
  const wob = o.mood === 'cry' ? Math.sin(t * 30) * 0.04 : Math.sin(t * 2.5) * 0.02; c.rotate(wob - 0.08);
  // little feet poking out at the far end
  for (const [fx, fy, a] of [[-150, -6, -0.25], [-146, 30, 0.2]]) { c.save(); c.translate(fx, fy); c.rotate(a + (o.mood === 'cry' ? Math.sin(t * 24 + fy) * 0.35 : Math.sin(t * 3 + fy) * 0.1));
    c.fillStyle = o.sandals ? '#FFFFFF' : '#F4A6C0'; c.strokeStyle = '#7A6A70'; c.lineWidth = 3; c.beginPath(); c.ellipse(-14, 0, 30, 18, 0, 0, TAU); c.fill(); c.stroke();
    if (o.sandals) { c.strokeStyle = '#3F7FC4'; c.lineWidth = 4; for (const x of [-4, 8]) { c.beginPath(); c.moveTo(x, -16); c.lineTo(x, 16); c.stroke(); }
      c.fillStyle = '#8A5A32'; rr(c, -48, 12, 62, 10, 4); c.fill(); c.strokeStyle = '#8A5A32'; c.lineWidth = 7; c.beginPath(); c.moveTo(-28, -16); c.lineTo(-28, 16); c.moveTo(-10, -17); c.lineTo(-10, 17); c.stroke(); }
    c.restore(); }
  // swaddle blanket
  paint(c, q => { q.m(-140, -40); q.q(-150, 40, -120, 60); q.q(-10, 92, 110, 62); q.q(150, 40, 140, -20); q.q(120, -70, 20, -68); q.q(-90, -70, -140, -40); q.z(); }, '#9CCBEA', { sd: 5, hd: 2, lw: 4 });
  c.strokeStyle = 'rgba(40,90,140,.35)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-100, -30); c.quadraticCurveTo(-20, 10, 40, 55); c.moveTo(-60, 50); c.quadraticCurveTo(0, 20, 50, -50); c.stroke();
  c.fillStyle = '#FFFFFF'; for (const [x, y] of [[-80, 20], [-30, -30], [20, 30], [-110, -10], [60, 0]]) { c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); }
  // hood + head
  paint(c, q => { q.m(60, -80); q.q(170, -120, 200, -20); q.q(205, 50, 150, 70); q.q(90, 70, 70, 10); q.z(); }, '#7FB6DE', { sd: 3, hd: 1, lw: 4 });
  const hx = 128, hy = -18, r = 56;
  c.fillStyle = o.mood === 'cry' ? '#F7B8A8' : '#F8D8C2'; c.strokeStyle = '#B88A7A'; c.lineWidth = 3; c.beginPath(); c.arc(hx, hy, r, 0, TAU); c.fill(); c.stroke();
  c.strokeStyle = '#6A4A3A'; c.lineWidth = 5; c.beginPath(); c.moveTo(hx - 6, hy - r + 4); c.quadraticCurveTo(hx + 4, hy - r - 16, hx + 16, hy - r + 2); c.stroke();   // curl
  c.fillStyle = 'rgba(240,120,140,.45)'; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(hx + sx * 30, hy + 16, 12, 8, 0, 0, TAU); c.fill(); }
  c.strokeStyle = '#3A2A2A'; c.fillStyle = '#3A2A2A'; c.lineWidth = 5; c.lineCap = 'round';
  if (o.mood === 'cry') {
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(hx + sx * 30 - 9, hy - 14); c.lineTo(hx + sx * 22, hy - 6); c.lineTo(hx + sx * 30 - 9, hy + 2); c.stroke(); }
    c.fillStyle = '#7A2A3A'; c.beginPath(); c.ellipse(hx, hy + 26, 18, 16 + Math.abs(Math.sin(t * 14)) * 6, 0, 0, TAU); c.fill();
    // tears streaming sideways + falling drops
    c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 2;
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const u = (t * 2.2 + i / 3) % 1, x = hx + sx * (36 + u * 70), y = hy - 4 + u * u * 90;
      c.beginPath(); c.moveTo(x, y - 12); c.quadraticCurveTo(x + 8, y, x, y + 6); c.quadraticCurveTo(x - 8, y, x, y - 12); c.fill(); c.stroke(); }
    c.strokeStyle = '#E0474C'; c.lineWidth = 6; for (const [a, l] of [[-1.9, 34], [-1.2, 40], [-0.5, 34]]) { const rr0 = r + 18 + Math.sin(t * 20) * 4; c.beginPath(); c.moveTo(hx + Math.cos(a) * rr0, hy + Math.sin(a) * rr0); c.lineTo(hx + Math.cos(a) * (rr0 + l), hy + Math.sin(a) * (rr0 + l)); c.stroke(); }
  } else if (o.mood === 'happy') {
    for (const sx of [-1, 1]) { c.beginPath(); c.arc(hx + sx * 20, hy - 4, 9, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    c.fillStyle = '#C0506E'; c.beginPath(); c.arc(hx, hy + 18, 14, 0, Math.PI); c.fill();
  } else {
    const bl = Math.sin(t * 1.3) > 0.97; for (const sx of [-1, 1]) { if (bl) { c.beginPath(); c.moveTo(hx + sx * 20 - 7, hy - 4); c.lineTo(hx + sx * 20 + 7, hy - 4); c.stroke(); } else { c.beginPath(); c.arc(hx + sx * 20, hy - 4, 7, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(hx + sx * 20 + 2, hy - 7, 2.5, 0, TAU); c.fill(); c.fillStyle = '#3A2A2A'; } }
    c.beginPath(); c.arc(hx, hy + 18, 7, 0.2, Math.PI - 0.2); c.stroke();
  }
  // a little fist on top of the blanket
  c.fillStyle = '#F8D8C2'; c.strokeStyle = '#B88A7A'; c.lineWidth = 3; c.beginPath(); c.arc(60 + (o.mood === 'cry' ? Math.sin(t * 22) * 8 : 0), -54, 17, 0, TAU); c.fill(); c.stroke();
  c.restore(); }
// a huge old advice book; open = 0..1
function book(c, s = 1, open = 0, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot);
  if (open > 0.5) { c.fillStyle = '#7A4A2A'; rr(c, -170, -120, 340, 240, 10); c.fill(); c.fillStyle = '#FBF5E6'; rr(c, -160, -110, 155, 220, 6); c.fill(); rr(c, 5, -110, 155, 220, 6); c.fill();
    c.fillStyle = '#B8AE9C'; for (let i = 0; i < 7; i++) { c.fillRect(-145, -90 + i * 28, 120 - (i % 3) * 20, 7); c.fillRect(20, -90 + i * 28, 120 - ((i + 1) % 3) * 20, 7); } c.restore(); return; }
  c.fillStyle = '#F2E8D0'; rr(c, -112, -150, 236, 300, 10); c.fill();   // page block
  c.fillStyle = '#7A3A2A'; c.strokeStyle = '#4A2216'; c.lineWidth = 5; rr(c, -120, -158, 230, 300, 14); c.fill(); c.stroke();
  c.fillStyle = '#5A2A1E'; c.fillRect(-120, -158, 26, 300);
  c.strokeStyle = '#E3C060'; c.lineWidth = 4; c.strokeRect(-80, -130, 170, 244);
  fitTxt(c, 'BABY', 5, -70, 52, '#E3C060', 150); fitTxt(c, 'CARE', 5, -20, 52, '#E3C060', 150); fitTxt(c, '1979', 5, 60, 40, '#E3C060', 120);
  c.restore(); }
const bookItem = (open, rot = 0) => ctx => { ctx.save(); ctx.translate(0, -40); book(ctx, 1.0, open, rot); ctx.restore(); };
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function heart(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-50, -5, -30, -45, 0, -20); c.bezierCurveTo(30, -45, 50, -5, 0, 30); c.fill(); c.restore(); }
function clockIcon(c, x, y, r, hh, col = '#2B2F3A') { c.save(); c.translate(x, y); c.fillStyle = '#FFFFFF'; c.strokeStyle = col; c.lineWidth = r * 0.16; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.stroke();
  c.lineCap = 'round'; c.lineWidth = r * 0.14; const a = (hh % 12) / 12 * TAU - Math.PI / 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); c.moveTo(0, 0); c.lineTo(0, -r * 0.75); c.stroke(); c.restore(); }
function moon(c, x, y, r, col) { c.save(); c.fillStyle = col; c.beginPath(); c.arc(x, y, r, Math.PI * 0.35, Math.PI * 1.65); c.arc(x + r * 0.55, y, r * 0.8, Math.PI * 1.45, Math.PI * 0.55, true); c.closePath(); c.fill(); c.restore(); }

// ---------------- living room (prerendered, softly blurred)
const BX0 = -3800, BY0 = -5400, BW = 7800, BH = 8200, BS = 0.5, FLOOR = -130;
function drawRoom(c) {
  c.fillStyle = '#F4E6CC'; c.fillRect(BX0, BY0, BW, FLOOR - BY0);
  c.fillStyle = 'rgba(214,170,120,.18)'; for (let x = BX0; x < BX0 + BW; x += 180) c.fillRect(x, BY0, 70, FLOOR - BY0);   // wallpaper stripes
  c.fillStyle = '#E9D4B4'; c.fillRect(BX0, -3500, BW, 40);   // picture rail
  // window with curtains (left)
  c.fillStyle = '#FFFFFF'; c.fillRect(-2780, -2600, 1240, 1500); const sky = c.createLinearGradient(0, -2560, 0, -1140); sky.addColorStop(0, '#8CC8F0'); sky.addColorStop(1, '#D8EEF8'); c.fillStyle = sky; c.fillRect(-2740, -2560, 1160, 1420);
  c.fillStyle = '#6FAE5E'; c.beginPath(); c.ellipse(-2300, -1150, 500, 220, 0, Math.PI, TAU); c.fill(); c.beginPath(); c.ellipse(-1800, -1150, 380, 160, 0, Math.PI, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; c.fillRect(-2180, -2560, 40, 1420); c.fillRect(-2740, -1880, 1160, 36); c.fillStyle = '#E3D2B8'; c.fillRect(-2840, -1110, 1360, 60);
  for (const [x0, dir] of [[-3020, 1], [-1300, -1]]) { c.fillStyle = '#E58A8A'; c.beginPath(); c.moveTo(x0, -2720); c.lineTo(x0 + dir * 330, -2720); c.quadraticCurveTo(x0 + dir * 220, -1900, x0 + dir * 300, -1000); c.lineTo(x0, -1000); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 3; i++) c.fillRect(Math.min(x0, x0 + dir * 300) + 60 + i * 80, -2700, 18, 1680); }
  c.fillStyle = '#B8865A'; c.fillRect(-3060, -2760, 1800, 40);
  // framed pictures: a family photo + a little sailboat
  c.fillStyle = '#8A5A3A'; c.fillRect(-420, -2780, 520, 400); c.fillStyle = '#F7EFE2'; c.fillRect(-390, -2750, 460, 340);
  for (const [x, y, r, col] of [[-250, -2590, 50, '#E3A33A'], [-90, -2600, 56, '#8E6CC8'], [-170, -2640, 34, '#F4A6C0']]) { c.fillStyle = col; c.beginPath(); c.arc(x, y + 110, r * 1.2, Math.PI, TAU); c.fill(); c.fillStyle = '#F2CDB4'; c.beginPath(); c.arc(x, y, r * 0.75, 0, TAU); c.fill(); }
  c.fillStyle = '#8A5A3A'; c.fillRect(420, -2700, 340, 300); c.fillStyle = '#CFE7F2'; c.fillRect(444, -2676, 292, 252); c.fillStyle = '#3F7FC4'; c.fillRect(444, -2500, 292, 76);
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(590, -2640); c.lineTo(590, -2510); c.lineTo(670, -2510); c.fill(); c.fillStyle = '#E0474C'; c.fillRect(540, -2510, 150, 26);
  // sofa (behind, left)
  paint(c, q => { q.m(-2200, FLOOR - 40); q.l(-2200, -1180); q.q(-2200, -1300, -2080, -1300); q.l(-760, -1300); q.q(-640, -1300, -640, -1180); q.l(-640, FLOOR - 40); q.z(); }, '#5E8F8A', { sd: 8, hd: 3, lw: 5 });
  c.fillStyle = '#6FA39D'; rr(c, -2140, -820, 1440, 300, 40); c.fill(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-1440, -820, 10, 300);
  c.fillStyle = '#4E7C78'; rr(c, -2300, -1000, 220, 880, 60); c.fill(); rr(c, -760, -1000, 220, 880, 60); c.fill();
  for (const [x, col] of [[-1900, '#F2C14E'], [-1060, '#EE8AA8']]) { c.save(); c.translate(x, -1000); c.rotate(x < -1500 ? -0.15 : 0.12); c.fillStyle = col; rr(c, -150, -150, 300, 300, 60); c.fill(); c.restore(); }
  // standard lamp + side table with the baby bottle (right)
  c.fillStyle = '#5A4A40'; c.fillRect(2400, -2200, 26, 2080); c.fillStyle = '#F7E3B0'; c.beginPath(); c.moveTo(2240, -2200); c.lineTo(2590, -2200); c.lineTo(2500, -2520); c.lineTo(2330, -2520); c.fill(); c.fillStyle = 'rgba(255,240,180,.25)'; c.beginPath(); c.arc(2413, -2250, 420, 0, TAU); c.fill();
  c.fillStyle = '#9A6A44'; c.fillRect(820, -760, 420, 40); c.fillRect(850, -720, 30, 590); c.fillRect(1180, -720, 30, 590); c.fillRect(850, -380, 360, 24);
  c.fillStyle = 'rgba(255,255,255,.85)'; c.strokeStyle = '#8A93A2'; c.lineWidth = 6; rr(c, 960, -1000, 90, 240, 24); c.fill(); c.stroke(); c.fillStyle = '#FFF6E0'; rr(c, 966, -880, 78, 114, 18); c.fill();
  c.fillStyle = '#8CC8F0'; c.fillRect(950, -1040, 110, 46); c.fillStyle = '#F4C38A'; c.beginPath(); c.moveTo(975, -1040); c.quadraticCurveTo(1005, -1150, 1035, -1040); c.fill();
  for (let i = 0; i < 4; i++) { c.fillStyle = '#8A93A2'; c.fillRect(1050, -950 + i * 44, 22, 5); }
  c.fillStyle = '#4E9A4A'; for (const [dx, dy, r] of [[0, -880, 70], [-60, -840, 56], [60, -846, 56]]) { c.beginPath(); c.arc(1150 + dx, dy, r, 0, TAU); c.fill(); } c.fillStyle = '#C98A5A'; c.fillRect(1100, -830, 100, 70);
  // door (right): frame, panel, knob
  c.fillStyle = '#FFFFFF'; c.fillRect(DOORX - DOORW / 2 - 50, -2350, DOORW + 100, 2350 + FLOOR);
  // floor: wooden boards + rug + skirting
  c.fillStyle = '#C69A6A'; c.fillRect(BX0, FLOOR, BW, BY0 + BH - FLOOR); c.fillStyle = 'rgba(90,50,20,.12)';
  for (let y = FLOOR, r = 0; y < BY0 + BH; y += 90, r++) { c.fillRect(BX0, y, BW, 4); for (let x = BX0 + (r % 3) * 400; x < BX0 + BW; x += 1200) c.fillRect(x, y, 4, 90); }
  c.fillStyle = '#FFFFFF'; c.fillRect(BX0, FLOOR - 70, BW, 70); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(BX0, FLOOR - 6, BW, 6);
  c.fillStyle = '#C8606A'; c.beginPath(); c.ellipse(80, 120, 1500, 230, 0, 0, TAU); c.fill(); c.strokeStyle = '#F2C14E'; c.lineWidth = 16; c.beginPath(); c.ellipse(80, 120, 1380, 190, 0, 0, TAU); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(-1050 + i * 190, 120 + (i % 2 ? 50 : -50), 18, 0, TAU); c.fill(); }
  // toys on the floor
  c.fillStyle = '#F2C14E'; rr(c, -1500, 40, 110, 110, 14); c.fill(); fitTxt(c, 'A', -1445, 97, 70, '#E0474C', 90);
  c.fillStyle = '#3F7FC4'; rr(c, -1370, 70, 90, 90, 12); c.fill(); fitTxt(c, 'B', -1325, 117, 56, '#FFFFFF', 70);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
// the pram (live, sharp): a navy carriage by the sofa
function pram(c) { const x = -1250, y = FLOOR + 60;
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x, y + 10, 380, 30, 0, 0, TAU); c.fill();
  c.strokeStyle = '#4A5060'; c.lineWidth = 14; c.beginPath(); c.moveTo(x - 200, y - 100); c.lineTo(x + 210, y - 420); c.moveTo(x + 200, y - 100); c.lineTo(x - 180, y - 420); c.moveTo(x + 150, y - 470); c.lineTo(x + 330, y - 760); c.lineTo(x + 420, y - 760); c.stroke();
  for (const wx of [x - 220, x + 220]) { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(wx, y - 80, 80, 0, TAU); c.fill(); c.fillStyle = '#C9D2DA'; c.beginPath(); c.arc(wx, y - 80, 30, 0, TAU); c.fill(); }
  paint(c, q => { q.m(x - 300, -720); q.q(x - 310, -380, x, -380); q.q(x + 310, -380, x + 300, -720); q.z(); }, '#2F4A7A', { sd: 6, hd: 2, lw: 5 });
  paint(c, q => { q.m(x - 300, -720); q.q(x - 330, -1050, x - 40, -1060); q.l(x - 40, -720); q.z(); }, '#3E5E94', { sd: 4, hd: 2, lw: 5 });
  c.fillStyle = '#F4A6C0'; c.fillRect(x - 300, -740, 600, 34); }

// ---------------- the baby's holder over time
const holdAnchor = who => who === 'her' ? { x: X.her + 70, y: G.her.ySh + 215, dir: 1 } : { x: X.mil - 60, y: G.mil.ySh + 215, dir: -1 };
// returns { who | null (moving), x, y, dir }
function babyAt(t, L) {
  const at = w => ({ who: w, ...holdAnchor(w) });
  const tr = (a, b, t0, d) => { const k = clamp((t - t0) / d); if (k <= 0) return at(a); if (k >= 1) return at(b); const A = holdAnchor(a), B = holdAnchor(b), e = eIO(k); return { who: null, x: lerp(A.x, B.x, e), y: lerp(A.y, B.y, e) - Math.sin(e * Math.PI) * 60, dir: e < 0.5 ? A.dir : B.dir }; };
  if (L === 'o1') return tr('her', 'mil', ev('o1', 'take'), 0.4);
  if (L === 'o4') return tr('her', 'mil', ev('o4', 'hand'), 0.45);
  if (L === 'end') return tr('mil', 'her', ev('end', 'back'), 0.3);
  if (L === 'outro') return at('her');
  return at('her'); }
function babyMood(t, L) { if (L === 'end') { if (t > ev('end', 'cry') && t < ev('end', 'hush')) return 'cry'; if (t >= ev('end', 'hush')) return 'happy'; }
  if (L === 'o1' && t > ev('o1', 'take') + 0.3) return 'happy'; if (L === 'o3' && t > ev('o3', 'relief')) return 'happy'; if (L === 'o4' && t > ev('o4', 'hand') + 0.4) return 'calm'; return 'calm'; }
const drawBaby = (c, t, L, b) => { c.save(); c.translate(b.x, b.y); baby(c, 1.1, b.dir, { mood: babyMood(t, L), t, sandals: L === 'o2' }); c.restore(); K.mark(c, 'baby', b.x, b.y, 200); };

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const clasp = (st, g) => { st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 310, { planar: true }); };
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
// cradle: both hands under the bundle; the bundle is drawn under the screen-left hand (so both hands sit on top of it)
let WORLDM = null;
function cradle(st, g, who, x0, t, L, b) { const lx = b.x - x0, ly = b.y; st.armL = reach(g, -1, lx - 95 * b.dir, ly + 35, { planar: true }); st.armR = reach(g, 1, lx + 70 * b.dir, ly + 10, { planar: true });
  if (b.dir < 0) { st.armL = reach(g, -1, lx - 80, ly + 15, { planar: true }); st.armR = reach(g, 1, lx + 95, ly + 35, { planar: true }); }
  st.items = { ...st.items, L: { under: ctx => { if (!WORLDM) return; ctx.save(); ctx.setTransform(WORLDM); drawBaby(ctx, t, L, b); ctx.restore(); } } }; }
function herState(t, L, b) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'neutral', turn: 0.25, look: 0.7 };
  const holding = b.who === 'her';
  if (holding) cradle(st, g, 'her', X.her, t, L, b);
  if (L === 'hook') { st.mood = 'skeptical'; if (t > hev('nar') + 0.2) { st.mood = 'tired'; st.lookY = -0.7; st.look = 0.2; st.turn = 0.1; } if (t > hev('book') + 0.3) { st.mood = 'annoyed'; st.lookY = 0; st.look = 0.7; st.turn = 0.25; } }
  if (L === 'o1') { st.mood = 'annoyed';
    if (speaking('o1_h', t, 0.05, 0.15)) { st.mood = 'angry'; st.tilt = -0.04; }
    if (t > SP.o1_m.t) st.mood = 'surprised';
    if (!holding && b.who === 'mil') { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armL = open(g, -1, 1.1, 260); st.armR = open(g, 1, 1.4, 250); st.look = 0.8; }
    if (t > e('empty') + 0.5) { st.mood = 'annoyed'; st.look = 0.3; st.turn = 0.1; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.15)) st.mood = 'happy';
    if (t > SP.o2_m.t) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('deadpan')) { st.mood = 'tired'; st.look = 0; st.turn = 0; st.lookY = 0; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'happy'; st.tilt = 0.04; }
    if (t > SP.o3_m.t) st.mood = 'happy';
    if (t > e('relief')) { st.mood = 'happy'; st.laugh = t < e('relief') + 1.2; st.look = 0.5; } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = t > e('hand') ? 'smug' : 'happy'; st.tilt = t < e('hand') ? 0.05 : 0; }
    if (!holding && b.who !== 'her') { st.armL = hold(g, -1, 330, 0.6); st.armR = (b.who === null) ? reach(g, 1, b.x - X.her + 40, b.y + 20, { planar: true }) : open(g, 1, 1.9, 160 + Math.sin(t * 4) * 20); }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; clasp(st, g); }
    if (t > SP.o4_m.t + 1.5) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'smug'; if (!holding && b.who === 'mil') { clasp(st, g); }
    if (b.who === null) { st.armL = reach(g, -1, b.x - X.her - 90, b.y + 35, { planar: true }); st.armR = reach(g, 1, b.x - X.her + 60, b.y + 10, { planar: true }); }
    if (t > e('cry')) st.mood = 'smug';
    if (t > e('back')) { st.mood = 'happy'; st.look = 0.8; }
    if (t > e('look')) { st.mood = 'smug'; st.look = 0; st.turn = 0; st.lookY = 0; st.blink = t > e('look') + 1.2 && t < e('look') + 1.5 ? 1 : undefined; } }
  return st; }
function milState(t, L, b) { const g = G.mil, e = k => ev(L, k), st = { ...base(g, t, 'mil'), mood: 'happy', turn: -0.25, look: -0.7 };
  const holding = b.who === 'mil';
  if (holding) cradle(st, g, 'mil', milX(t, L), t, L, b);
  if (L === 'hook') { st.mood = 'smug';
    if (speaking('hook_m', t, 0.25, 0.1)) { st.mood = 'happy'; const hb = holdAnchor('her'); st.armL = reach(g, -1, hb.x - X.mil + 140 + Math.sin(t * 5) * 15, hb.y - 40, { planar: true }); gest(st, g, 'mil', t, 1, 160); }
    if (t > hev('book') - 0.25) { const k = eOut(clamp((t - hev('book') + 0.25) / 0.25)); st.mood = 'smug'; st.armR = reach(g, 1, g.sw * lerp(1.1, 0.9, k), g.ySh + lerp(400, 140, k), { planar: true }); st.items = { R: bookItem(0, -0.1) }; st.armL = down(g, -1); st.look = -0.2; st.turn = -0.1; } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_m', t, 0.05, 0.1)) { st.mood = 'smug'; }
    if (b.who === null) { st.armL = reach(g, -1, b.x - X.mil - 80, b.y + 20, { planar: true }); st.armR = reach(g, 1, b.x - X.mil + 90, b.y + 30, { planar: true }); }
    if (holding) { st.mood = 'happy'; st.laugh = true; st.look = -0.4; st.lookY = 0.4; st.tilt = -0.06; }
    if (t > e('empty') + 0.3) { st.look = -0.2; st.lookY = 0.5; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.1)) st.mood = 'skeptical';
    if (t > SP.o2_m.t - 0.05) { st.mood = 'shock'; st.blink = 0; const hb = holdAnchor('her'); const k = eOut(clamp((t - e('point') + 0.1) / 0.25));
      st.armL = reach(g, -1, lerp(-g.sw * 1.2, hb.x - 150 - X.mil + 40, k), lerp(g.ySh + 400, hb.y + 10, k), { planar: true }); st.armR = open(g, 1, 1.5, 60 + Math.sin(t * 8) * 15); st.look = -0.8; st.lookY = 0.4; }
    if (t > endOf('o2_m') + 0.2) { st.mood = 'worried'; st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 280, { planar: true }); } }
  if (L === 'o3') { const cl = e('close'); st.mood = 'skeptical'; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 230, { planar: true }); st.items = { R: bookItem(t < cl ? 1 : 0, 0.05) }; st.armL = reach(g, -1, -g.sw * 0.2, g.ySh + 250, { planar: true });
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'surprised'; }
    if (t > cl) { st.mood = 'worried'; st.armL = down(g, -1); st.armR = hold(g, 1, 290, 1.05); st.items = { R: bookItem(0, 0.25) }; st.lookY = 0.3; }
    if (t > e('relief')) { st.mood = 'happy'; st.lookY = 0.2; st.look = -0.6; } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t < SP.o4_h.t + 4.6 ? 'happy' : 'surprised'; st.laugh = t > SP.o4_h.t + 0.9 && t < SP.o4_h.t + 3.2; }
    if (b.who === null) { st.armL = reach(g, -1, b.x - X.mil - 80, b.y + 20, { planar: true }); st.armR = reach(g, 1, b.x - X.mil + 90, b.y + 30, { planar: true }); }
    if (holding) { st.mood = 'surprised'; st.lookY = 0.3; }
    if (t > SP.o4_h.t + SP.o4_h.words[17][1]) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('sweat')) { st.mood = 'worried'; st.tilt = Math.sin(t * 10) * 0.03; st.look = -0.3; st.lookY = 0; } }
  if (L === 'end') { st.mood = 'worried';
    if (t > e('cry')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.lookY = 0.5; st.look = -0.3; }
    if (speaking('end_m', t, 0, 0)) { st.mood = 'surprised'; st.lookY = 0; st.look = -0.8; }
    if (b.who === null) { st.armL = reach(g, -1, b.x - milX(t, L) - 80, b.y + 20, { planar: true }); st.armR = reach(g, 1, b.x - milX(t, L) + 90, b.y + 30, { planar: true }); }
    if (t > e('back') + 0.3) { st.mood = 'happy'; st.armL = open(g, -1, 1.3, 200); st.armR = open(g, 1, 1.3, 200); st.items = {}; }
    if (t > e('run')) { st.mood = 'worried'; st.turn = 0.55; st.look = 1; st.legPose = 'walk'; st.armL = reach(g, -1, -g.sw * 1.1, g.ySh + 420, { planar: true }); st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 380, { planar: true }); } }
  return st; }
const milX = (t, L) => { if (L === 'end') { const r = ev('end', 'run'); if (t > r) return lerp(X.mil, DOORX, eIn(clamp((t - r) / 0.6))); } return X.mil; };
const milGone = (t, L) => L === 'end' && t > ev('end', 'run') + 0.6;

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'mil'], cover: ['her', 'mil'], two: ['her', 'mil'], her: ['her'], mil: ['mil'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function door(c, t, L) { const x0 = DOORX - DOORW / 2, top = -2300, r = ev('end', 'run'), sl = ev('end', 'slam');
  const op = L === 'end' ? (t < r + 0.1 ? 0 : t < sl ? eOut(clamp((t - r - 0.1) / 0.25)) : 0) : 0;
  c.fillStyle = '#3A2E2A'; c.fillRect(x0, top, DOORW, -top + FLOOR);   // doorway (dark hall)
  const shk = L === 'end' && t > sl && t < sl + 0.4 ? Math.sin((t - sl) * 60) * 10 * (1 - (t - sl) / 0.4) : 0;
  const w = DOORW * (1 - 0.82 * op); c.save(); c.translate(shk, 0);
  c.fillStyle = '#F7F4EE'; c.strokeStyle = '#C9C0B0'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, top); c.lineTo(x0 + w, top + 60 * op); c.lineTo(x0 + w, FLOOR - 60 * op); c.lineTo(x0, FLOOR); c.closePath(); c.fill(); c.stroke();
  if (op < 0.5) { c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 8; for (const [px, py, pw, ph] of [[60, 120, 180, 760], [300, 120, 180, 760], [60, 1000, 180, 980], [300, 1000, 180, 980]]) c.strokeRect(x0 + px * w / DOORW, top + py, pw * w / DOORW, ph); c.fillStyle = '#E3C060'; c.beginPath(); c.arc(x0 + w - 70 * w / DOORW, -1150, 26, 0, TAU); c.fill(); }
  c.restore();
  if (shk) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.lineCap = 'round'; for (const [a, b2] of [[-1, -1500], [-1, -900], [1, -1500], [1, -900]]) { const xx = a < 0 ? x0 - 60 : x0 + DOORW + 60; c.beginPath(); c.moveTo(xx, b2); c.lineTo(xx + a * 90, b2 - 40); c.stroke(); } } }
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'mil'], heads = {}, b = babyAt(t, L);
  c.drawImage(BGR, BX0, BY0, BW, BH); door(c, t, L); pram(c);
  WORLDM = c.getTransform();
  if (who.includes('mil') && !milGone(t, L)) heads.mil = K.put(c, MIL, milState(t, L, b), milX(t, L), 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L, b), X.her, 0);
  if (b.who === null && (who.includes('her') || who.includes('mil'))) drawBaby(c, t, L, b);
  if (heads.mil && L === 'o4') sweat(c, heads.mil, t, clamp((t - ev('o4', 'sweat') + 0.2) / 0.3));
  if (heads.mil && L === 'end' && t < ev('end', 'back')) sweat(c, heads.mil, t, clamp((t - ev('end', 'cry')) / 0.3));
  if (L === 'end' && heads.mil && t > ev('end', 'run')) { c.save(); c.strokeStyle = 'rgba(80,60,60,.5)'; c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { const y = -300 - i * 260, x = milX(t, L) - 300 - (i % 2) * 80; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 200, y); c.stroke(); } c.restore(); }
  if (L === 'o3' && heads.her && t > ev('o3', 'relief') && t < ev('o3', 'relief') + 1.8) { const hb = holdAnchor('her'), u = t - ev('o3', 'relief'); for (let i = 0; i < 3; i++) { const v = (u * 0.8 + i / 3) % 1; c.save(); c.globalAlpha = 1 - v; heart(c, hb.x + 120 + Math.sin(v * 6 + i) * 40, hb.y - 120 - v * 260, 1.2, '#EE5E9A'); c.restore(); } }
  if (!heads.her) heads.her = OFFL; if (!heads.mil) heads.mil = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(60, fy(HY('mil'), 0.62, 1000), 0.62, 'cover'), WIDE: S(250, fy(HY('mil'), 0.44, 820), 0.44, 'wide'),
  TWO: S((X.her + X.mil) / 2, fy(HY('mil'), 0.74, 800), 0.74, 'two'),
  HER: S(X.her + 50, fy(HY('her'), 0.95, 860), 0.95, 'her'), HER_R: S(X.her + 60, fy(HY('her'), 0.85, 720), 0.85, 'her'),
  MIL: S(X.mil - 30, fy(HY('mil'), 0.88, 800), 0.88, 'mil'), MIL_B: S(X.mil - 30, fy(HY('mil'), 0.88, 690), 0.88, 'mil'), MIL_CU: S(X.mil - 50, fy(HY('mil'), 0.98, 760), 0.98, 'mil'),
  FEET: U('feet', 1), CARD: U('card', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('book') - 0.3) return f(SH.HER_R); return f(SH.MIL_B); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_m.t - 0.1) return f(SH.HER); if (t < e('empty')) return f(SH.TWO); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_m.t - 0.1) return f(SH.HER); if (t < e('feet')) return f(SH.TWO); if (t < e('deadpan') - 0.02) return f(SH.FEET); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_m.t - 0.1) return f(SH.HER); if (t < e('relief') + 0.3) return f(SH.MIL); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('hand') - 0.1) return f(SH.HER); if (t < e('card')) return f(SH.TWO); if (t < e('sweat') - 0.1) return f(SH.CARD); return f(SH.MIL_CU); }
  if (L === 'end') { if (t < e('back') - 0.05) return f(SH.MIL_CU); if (t < e('run')) return f(SH.TWO); if (t < e('look') - 0.02) return f(SH.WIDE); return f(SH.HER_R); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// the tiny foot: striped sock + brown sandal, wiggling toes
function feetView(c, t) { backdrop(c, t, '#BFE3F5', '#7FB6DE'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'feet' });
  const u = t - ev('o2', 'feet'), k = eBack(clamp((u + 0.05) / 0.3), 1.6); c.save(); c.translate(540, 960); c.scale(k, k); c.rotate(-0.12 + Math.sin(t * 5) * 0.04);
  // the blanket cuff at the top, then the sock (side view, toes to the right) with blue stripes
  paint(c, q => { q.m(-330, -620); q.l(70, -620); q.l(40, -330); q.l(-300, -330); q.z(); }, '#9CCBEA', { sd: 6, hd: 3, lw: 6 });
  const footP = q => { q.m(-270, -360); q.l(-10, -360); q.q(10, -160, 120, -110); q.q(330, -60, 360, 40); q.q(380, 110, 300, 120); q.l(-230, 120); q.q(-330, 120, -320, 20); q.q(-310, -120, -270, -360); q.z(); };
  paint(c, footP, '#FFFFFF', { sd: 6, hd: 3, lw: 7 });
  c.save(); c.beginPath(); { const q = { m: (x, y) => c.moveTo(x, y), l: (x, y) => c.lineTo(x, y), q: (a, b, x, y) => c.quadraticCurveTo(a, b, x, y), z: () => c.closePath() }; footP(q); } c.clip();
  c.fillStyle = '#3F7FC4'; for (let y = -340; y < 140; y += 76) c.fillRect(-400, y, 800, 34); c.restore();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; c.beginPath(); { const q = { m: (x, y) => c.moveTo(x, y), l: (x, y) => c.lineTo(x, y), q: (a, b, x, y) => c.quadraticCurveTo(a, b, x, y), z: () => c.closePath() }; footP(q); } c.stroke();
  // sandal: thick sole, ankle strap with a buckle, toe strap
  c.fillStyle = '#6A3E20'; rr(c, -340, 112, 730, 62, 30); c.fill(); c.fillStyle = '#8A5A32'; rr(c, -340, 104, 730, 30, 14); c.fill();
  c.fillStyle = '#8A5A32'; c.strokeStyle = '#5A3418'; c.lineWidth = 5;
  c.save(); c.translate(-150, -190); c.rotate(0.12); rr(c, -190, -34, 360, 68, 20); c.fill(); c.stroke(); c.fillStyle = '#E3C060'; rr(c, 40, -30, 60, 60, 8); c.fill(); c.fillStyle = '#8A5A32'; c.fillRect(56, -14, 28, 28); c.restore();
  c.save(); c.translate(-140, -40); c.rotate(1.45); c.fillStyle = '#8A5A32'; rr(c, -130, -30, 280, 60, 20); c.fill(); c.stroke(); c.restore();
  c.save(); c.translate(200, -10); c.rotate(-0.5); c.fillStyle = '#8A5A32'; rr(c, -40, -150, 80, 290, 26); c.fill(); c.stroke(); c.restore();
  c.restore();
  const rk = clamp((u - 0.45) / 0.2); if (rk > 0) { c.save(); c.globalAlpha = rk; c.strokeStyle = '#E0474C'; c.lineWidth = 14; c.setLineDash([30, 18]); c.lineDashOffset = -t * 120; c.beginPath(); c.ellipse(560, 960, 480, 420, -0.12, 0, TAU); c.stroke(); c.restore(); } }
// the NIGHT SHIFT card: three alarm times pop in one after another
function cardView(c, t) { backdrop(c, t, '#24305A', '#121A36'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'card' });
  const u = t - ev('o4', 'card'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  for (let i = 0; i < 14; i++) { const x = (i * 263) % 1000 + 40, y = (i * 397) % 600 + 120, tw = 0.6 + 0.4 * Math.sin(t * 4 + i); c.fillStyle = `rgba(255,240,180,${tw})`; c.beginPath(); c.arc(x, y, 6 + (i % 3) * 3, 0, TAU); c.fill(); }
  moon(c, 860, 300, 110, '#F7E3B0');
  c.save(); c.translate(540, 1030); c.scale(k, k); c.rotate(-0.03);
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -400 + 12, -470 + 18, 800, 940, 46); c.fill(); c.fillStyle = '#FFFDF6'; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -400, -470, 800, 940, 46); c.fill(); c.stroke();
  c.save(); rr(c, -400, -470, 800, 940, 46); c.clip(); c.fillStyle = '#3B4A8A'; c.fillRect(-400, -470, 800, 170); c.restore(); c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -400, -470, 800, 940, 46); c.stroke(); moon(c, -320, -385, 46, '#F7E3B0'); fitTxt(c, 'NIGHT SHIFT', 50, -382, 80, '#FFFFFF', 520);
  [['2:00', 2], ['4:00', 4], ['5:00', 5]].forEach(([s, h], i) => { const kk = eBack(clamp((u - 0.25 - i * 0.3) / 0.25), 2.4); if (kk <= 0) return; const y = -170 + i * 230, sh = (t - ev('o4', 'card') - 0.25 - i * 0.3) < 0.5 ? Math.sin(t * 50) * 6 : 0;
    c.save(); c.translate(sh, y); c.scale(kk, kk); c.fillStyle = i === 2 ? '#FDE0E6' : '#EEF2FA'; rr(c, -340, -95, 680, 190, 30); c.fill();
    clockIcon(c, -230, 0, 70, h, i === 2 ? '#E0474C' : '#2B2F3A'); fitTxt(c, s, 80, 6, 130, i === 2 ? '#E0474C' : '#2B2F3A', 380); c.restore(); });
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
  // heroine with the happy baby + grandma waving (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.mil; WORLDM = c.getTransform();
    K.put(c, MIL, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gm, -1, -gm.sw * 1.6, gm.ySh + 120 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 0.9, gm.ySh + 330, { planar: true }), items: {} }, 640, 0);
    const st = { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.2, items: {} }; const b = { who: 'her', x: X.her + 70 - X.her, y: G.her.ySh + 215, dir: 1 };
    cradle(st, g, 'her', 0, t, 'outro', b); K.put(c, HER, st, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.25), wAt('outro', 'два', sp.t + 1.58), wAt('outro', 'три', sp.t + 1.92), wAt('outro', 'четыре', sp.t + 2.32)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.04) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - wAt('outro', 'сохрани', sp.t + 3.66)) / 0.5) * Math.PI);
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
  if (tag.startsWith('ui:')) { if (tag === 'ui:card') cardView(c, t); else feetView(c, t); heads = { her: OFFL, mil: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { mil: ['MOTHER-IN-LAW', '#7A5BC6'] };
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { hook_m: -0.2, o1_h: -0.22, o1_m: -0.2, o2_h: -0.22, o2_m: -0.25, o3_h: -0.22, o3_m: -0.3, o4_h: -0.15, o4_m: -0.2, end_m: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('baby', NF, renderFrame);
