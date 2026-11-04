// "Продавец: «Вам не подойдёт»" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best + twist), hard_cut camera: node size.js start end out.mp4 | --png=f1,f2
// A clothes boutique seen from the front: the heroine (casual jumper + jeans) holds a coral dress on a hanger; the snobbish shop assistant
// (black outfit, sleek bun, cat-eye glasses, STAFF badge, yellow measuring tape round her neck) stands by the FITTING ROOM curtain.
// Back wall: dress rack (left), a tall mirror (centre), the fitting-room curtain with a hanging sign (right); a big heap of scarves on the floor (far right).
// o1 «В ЛОБ»: she drapes a granny scarf over the heroine's shoulder; the heroine tugs at it and it wraps round her head.
// o2 «ВЕЖЛИВО»: she flips the curtain sign FITTING ROOM -> FOR BRAVE PEOPLE (sign close-up, the heroine gulps).
// o3 «КАК НОСИТЕЛЬ»: she stiffens with a frozen polite smile (stretch + eye twitch); the heroine lifts the dress, sparkles.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: she goes pale and twists her tape into a knot. Twist: the heroine pins on NEW MANAGER / STARTS MONDAY,
// badge close-up, the assistant faints backwards onto the scarf heap (scarves rain down). End screen: 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, mix, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/size/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#5C86C9' }, bottom: { type: 'jeans', col: '#3E4F72' }, shoes: { col: '#F4EFE6', acc: '#C98B5A' } };
const CLK0 = { ...BASE.linda, hair: { style: 'bun', col: '#2A1E1A' }, glasses: { col: '#1E1A22', shape: 'cat' }, lips: '#B02848',
  top: { type: 'longsleeve', col: '#2B2A33' }, bottom: { type: 'trousers', col: '#2B2A33' }, shoes: { col: '#1A1A1E', acc: null } };
const G = { her: geom(HER), clerk: geom(CLK0) };
const HX = -330, LX = 330;
const SGX = 820, SGY = -1500;            // curtain sign centre
const PILE = { x0: 1000, x1: 1950, top: -400 };
const DRESS = '#E8506A', DRESS2 = '#F58A9C';
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// coral dress on a hanger; (0,0) = top of the hanger hook, hangs down (+y)
function dressDraw(c, s = 1) { c.save(); c.scale(s, s);
  c.strokeStyle = '#8A8F98'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.arc(0, 14, 13, Math.PI, Math.PI * 2.3); c.stroke(); c.beginPath(); c.moveTo(0, 24); c.lineTo(0, 40); c.stroke();
  paint(c, q => { q.m(0, 34); q.l(130, 82); q.l(122, 92); q.l(0, 50); q.l(-122, 92); q.l(-130, 82); q.z(); }, '#C9A06A', { sd: 3, hd: 2, lw: 3 });   // wooden hanger
  paint(c, q => { q.m(-70, 70); q.q(-40, 64, -30, 96); q.q(0, 130, 30, 96); q.q(40, 64, 70, 70); q.l(80, 150); q.q(64, 230, 70, 290); q.l(-70, 290); q.q(-64, 230, -80, 150); q.z(); }, DRESS, { sd: 8, hd: 4, lw: 4 });   // bodice
  paint(c, q => { q.m(-72, 280); q.l(72, 280); q.q(160, 470, 215, 640); q.q(0, 680, -215, 640); q.q(-160, 470, -72, 280); q.z(); }, DRESS, { sd: 10, hd: 5, lw: 4,
    inner: k => { k.strokeStyle = 'rgba(150,20,50,.25)'; k.lineWidth = 5; for (const x of [-110, -40, 40, 110]) { k.beginPath(); k.moveTo(x * 0.4, 300); k.quadraticCurveTo(x * 0.8, 470, x * 1.3, 650); k.stroke(); } } });
  c.fillStyle = DRESS2; rr(c, -74, 270, 148, 26, 10); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, 283, 12, 0, TAU); c.fill();   // belt + buckle
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-36, 160, 12, 50, 0.1, 0, TAU); c.fill();
  c.restore(); }
const dressItem = ctx => dressDraw(ctx, 1);
// granny scarf (mustard with brown dots + fringe)
const SCARF = '#C9A13A', SCARFD = '#7A4A2A';
function dots(c, x0, y0, w, h) { c.fillStyle = SCARFD; for (let i = 0; i < 18; i++) { c.beginPath(); c.arc(x0 + hash(i * 3) * w, y0 + hash(i * 7 + 1) * h, 7, 0, TAU); c.fill(); } }
function scarfLoose(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-30, 0); q.q(-120, 120, -60, 330); q.l(30, 330); q.q(-20, 140, 60, 0); q.z(); }, SCARF, { sd: 6, hd: 3, lw: 4, inner: k => dots(k, -110, 10, 170, 320) });
  c.strokeStyle = SCARFD; c.lineWidth = 5; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-55 + i * 16, 330); c.lineTo(-58 + i * 16, 365); c.stroke(); } c.restore(); }
const scarfItem = ctx => { ctx.save(); ctx.translate(-20, -20); scarfLoose(ctx, 1); ctx.restore(); };
// over the shoulders (afterTorso): band round the neck + one long tail down her front
function scarfShoulder(cc, g, k = 1) { const sw = g.sw, y0 = g.ySh; cc.save(); cc.globalAlpha = k;
  paint(cc, q => { q.m(-sw * 0.95, y0 + 20); q.q(0, y0 - 40, sw * 0.95, y0 + 20); q.l(sw * 0.9, y0 + 110); q.q(0, y0 + 60, -sw * 0.9, y0 + 110); q.z(); }, SCARF, { sd: 6, hd: 3, lw: 4, inner: kk => dots(kk, -sw, y0 - 30, sw * 2, 140) });
  paint(cc, q => { q.m(sw * 0.2, y0 + 60); q.l(sw * 0.75, y0 + 80); q.q(sw * 0.8, y0 + 300, sw * 0.62, y0 + 520); q.l(sw * 0.1, y0 + 500); q.q(sw * 0.3, y0 + 300, sw * 0.2, y0 + 60); q.z(); }, SCARF, { sd: 6, hd: 3, lw: 4, inner: kk => dots(kk, sw * 0.1, y0 + 60, sw * 0.7, 460) });
  cc.strokeStyle = SCARFD; cc.lineWidth = 5; for (let i = 0; i < 6; i++) { const x = sw * 0.12 + i * sw * 0.09; cc.beginPath(); cc.moveTo(x, y0 + 505); cc.lineTo(x - 2, y0 + 545); cc.stroke(); }
  cc.restore(); }
// babushka wrap round the head (front): frames the face, knot under the chin
function scarfHead(cc, a, g, k) { const { hw, hh } = g; cc.save(); cc.translate(a.head.x, a.head.y); const s = eBack(k, 1.8); cc.scale(s, s);
  paint(cc, q => { q.m(-hw * 1.18, hh * 0.35); q.q(-hw * 1.35, -hh * 1.25, 0, -hh * 1.25); q.q(hw * 1.35, -hh * 1.25, hw * 1.18, hh * 0.35); q.q(hw * 0.9, hh * 1.0, hw * 0.25, hh * 1.05);
    q.l(hw * 0.7, hh * 0.25); q.q(hw * 0.75, -hh * 0.8, 0, -hh * 0.82); q.q(-hw * 0.75, -hh * 0.8, -hw * 0.7, hh * 0.25); q.l(-hw * 0.25, hh * 1.05); q.q(-hw * 0.9, hh * 1.0, -hw * 1.18, hh * 0.35); q.z(); }, SCARF, { sd: 6, hd: 3, lw: 4, inner: kk => dots(kk, -hw * 1.3, -hh * 1.3, hw * 2.6, hh * 2.4) });
  paint(cc, q => { q.m(-hw * 0.3, hh * 1.0); q.q(0, hh * 0.85, hw * 0.3, hh * 1.0); q.q(hw * 0.5, hh * 1.4, hw * 0.2, hh * 1.6); q.l(0, hh * 1.15); q.l(-hw * 0.2, hh * 1.6); q.q(-hw * 0.5, hh * 1.4, -hw * 0.3, hh * 1.0); q.z(); }, SCARF, { sd: 4, hd: 2, lw: 4 });
  cc.restore(); }
// yellow measuring tape round the clerk's neck (afterTorso); knot = 0..1 tangled ball at her chest (o4)
function tape(cc, g, t, wig = 0, knot = 0) { const sw = g.sw, y0 = g.ySh; cc.save(); cc.lineCap = 'round';
  const end = (s) => { const x0 = s * sw * 0.42, w1 = Math.sin(t * 17 + s) * wig * 26, w2 = Math.cos(t * 13 + s * 2) * wig * 22;
    const pts = [[x0 * 1.25, y0 + 8], [x0 + w1 * 0.4, y0 + 150], [x0 * 0.85 + w2, y0 + 330], [x0 * 0.8 + w1, y0 + 470 - knot * 160]];
    cc.strokeStyle = '#B88A12'; cc.lineWidth = 34; cc.beginPath(); cc.moveTo(...pts[0]); cc.bezierCurveTo(...pts[1], ...pts[2], ...pts[3]); cc.stroke();
    cc.strokeStyle = '#F2C94E'; cc.lineWidth = 27; cc.stroke();
    cc.strokeStyle = 'rgba(60,40,10,.7)'; cc.lineWidth = 3; for (let i = 1; i < 12; i++) { const u = i / 12, mt = 1 - u; const px = mt ** 3 * pts[0][0] + 3 * mt * mt * u * pts[1][0] + 3 * mt * u * u * pts[2][0] + u ** 3 * pts[3][0], py = mt ** 3 * pts[0][1] + 3 * mt * mt * u * pts[1][1] + 3 * mt * u * u * pts[2][1] + u ** 3 * pts[3][1]; cc.beginPath(); cc.moveTo(px - 9, py); cc.lineTo(px + (i % 2 ? 3 : 9), py); cc.stroke(); } };
  end(-1); end(1);
  if (knot > 0) { const r = 34 + 46 * knot, cy = y0 + 300; cc.save(); cc.translate(0, cy); cc.rotate(t * 3 * (knot < 1 ? 1 : 0));
    for (let i = 0; i < 7; i++) { cc.strokeStyle = i % 2 ? '#F2C94E' : '#D9A92A'; cc.lineWidth = 16; cc.beginPath(); cc.ellipse(0, 0, r * (0.6 + 0.4 * hash(i)), r * (0.35 + 0.3 * hash(i + 9)), i * 0.9, 0, TAU); cc.stroke(); }
    cc.restore(); }
  cc.restore(); }
function staffBadge(cc, g) { const sw = g.sw, y0 = g.ySh; cc.save(); cc.translate(-sw * 0.05, y0 + 175); cc.rotate(-0.04); cc.fillStyle = 'rgba(0,0,0,.25)'; rr(cc, -62 + 4, -26 + 5, 124, 52, 9); cc.fill(); cc.fillStyle = '#FFFDF8'; rr(cc, -62, -26, 124, 52, 9); cc.fill(); cc.strokeStyle = '#C23C76'; cc.lineWidth = 3; cc.stroke(); fitTxt(cc, 'STAFF', 0, 1, 28, '#C23C76', 108); cc.restore(); }
// NEW MANAGER badge; (0,0) = badge centre, s = scale
function mgrBadge(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -112 + 5, -56 + 7, 224, 112, 14); c.fill();
  c.fillStyle = '#F2C14E'; rr(c, -112, -56, 224, 112, 14); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 5; c.stroke(); c.fillStyle = '#FFFDF8'; rr(c, -100, -44, 200, 88, 9); c.fill();
  fitTxt(c, 'NEW MANAGER', 0, -12, 34, '#C23C76', 184); fitTxt(c, 'STARTS MONDAY', 0, 24, 20, '#3E471E', 170);
  c.fillStyle = '#9AA2AA'; c.beginPath(); c.arc(0, -60, 9, 0, TAU); c.fill(); c.restore(); }
function mgrOn(cc, g, k) { if (k <= 0) return; cc.save(); cc.translate(g.sw * 0.42, g.ySh + 185); cc.rotate(0.05); mgrBadge(cc, 0.62 * eBack(k, 2.4)); cc.restore(); }

// ---------------- boutique (prerendered, softly blurred)
const BX0 = -2600, BY0 = -3400, BW = 5400, BH = 4800, BS = 0.5;
function drawShop(c) {
  c.fillStyle = '#F6E3E6'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(230,170,185,.28)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, BY0, 8, 3400);   // thin wall stripes
  c.fillStyle = '#FFFDF8'; c.fillRect(BX0, -2560, BW, 40); c.fillStyle = '#E9CBD2'; c.fillRect(BX0, -700, BW, 520); c.fillStyle = '#FFFDF8'; c.fillRect(BX0, -720, BW, 26);   // cornice + wainscot
  c.fillStyle = 'rgba(0,0,0,.04)'; for (let x = BX0 + 40; x < BX0 + BW; x += 300) { rr(c, x, -650, 240, 420, 14); c.fill(); }
  // shop name on the wall (English only)
  c.fillStyle = '#C23C76'; c.font = '700 150px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Boutique', -560, -2280);
  // wall lamps
  for (const x of [-1500, 400, 1500]) { c.fillStyle = '#C9A13A'; rr(c, x - 10, -2350, 20, 140, 8); c.fill(); c.fillStyle = '#FFF4D0'; c.beginPath(); c.ellipse(x, -2200, 70, 40, 0, 0, TAU); c.fill(); }
  // dress rack (left): rail + hanging dresses
  c.fillStyle = '#B8BFC6'; c.fillRect(-1420, -1700, 18, 1700); c.fillRect(-560, -1700, 18, 1700); c.fillRect(-1440, -1720, 900, 22);
  const dc = ['#3C8FE0', '#F2C14E', '#5E9E6E', '#8E5BD6', '#EF7FAA', '#E9A23B', '#3FB6A8', '#E0474C'];
  for (let i = 0; i < 8; i++) { const x = -1370 + i * 108, col = dc[i]; c.strokeStyle = '#8A8F98'; c.lineWidth = 5; c.beginPath(); c.arc(x, -1708, 12, Math.PI, TAU); c.stroke();
    paint(c, q => { q.m(x - 50, -1680); q.l(x + 50, -1680); q.l(x + 56, -1460); q.q(x + 110, -1160, x + 90, -1000); q.l(x - 90, -1000); q.q(x - 110, -1160, x - 56, -1460); q.z(); }, col, { sd: 6, hd: 3, lw: 3 }); }
  // tall mirror (centre, between them)
  c.fillStyle = '#C9A13A'; rr(c, -190, -2050, 380, 1980, 190); c.fill(); const mg = c.createLinearGradient(-160, -2000, 160, -200); mg.addColorStop(0, '#E6F2F8'); mg.addColorStop(1, '#B9D3E2'); c.fillStyle = mg; rr(c, -160, -2020, 320, 1920, 160); c.fill();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(-110, -1700); c.lineTo(-60, -1760); c.lineTo(-60, -900); c.lineTo(-110, -840); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-20, -1500); c.lineTo(10, -1540); c.lineTo(10, -1100); c.lineTo(-20, -1060); c.closePath(); c.fill();
  c.fillStyle = '#9C7A2A'; rr(c, -230, -90, 460, 90, 20); c.fill();
  // fitting room: rail + velvet curtain (right)
  c.fillStyle = '#9C7A2A'; c.fillRect(540, -1980, 760, 24); c.fillStyle = '#5A2A6A'; c.fillRect(560, -1956, 720, 1956);
  for (let i = 0; i < 8; i++) { const x = 560 + i * 90; const g = c.createLinearGradient(x, 0, x + 90, 0); g.addColorStop(0, '#6E3480'); g.addColorStop(0.5, '#9A52AE'); g.addColorStop(1, '#6E3480'); c.fillStyle = g; c.fillRect(x, -1956, 90, 1956); }
  c.fillStyle = '#F2C14E'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(560 + i * 90, -1966, 12, 0, TAU); c.fill(); }
  // shelves with folded jumpers far right
  c.fillStyle = '#E8D5C8'; rr(c, 1500, -1900, 700, 1300, 16); c.fill(); for (let r = 0; r < 4; r++) { c.fillStyle = '#C9B2A2'; c.fillRect(1500, -1600 + r * 300, 700, 16); for (let k = 0; k < 4; k++) { c.fillStyle = dc[(r * 3 + k) % 8]; rr(c, 1530 + k * 165, -1680 + r * 300, 140, 78, 12); c.fill(); } }
  c.fillStyle = '#D9B99A'; c.fillRect(BX0, -180, BW, 1600); c.fillStyle = 'rgba(0,0,0,.07)'; for (let x = BX0; x < BX0 + BW; x += 260) c.fillRect(x, -180, 8, 1600);   // floor
  c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(BX0, -180, BW, 14);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawShop);

// curtain sign (live: it flips in o2)
function signDraw(c, t, L) { const f = L === 'o2' ? clamp((t - ev('o2', 'flip')) / 0.35) : 0, sy = Math.cos(f * Math.PI), back = f > 0.5;
  c.strokeStyle = '#9C7A2A'; c.lineWidth = 5; c.beginPath(); c.moveTo(SGX - 120, -1956); c.lineTo(SGX - 120, SGY - 70); c.moveTo(SGX + 120, -1956); c.lineTo(SGX + 120, SGY - 70); c.stroke();
  c.save(); c.translate(SGX, SGY); c.scale(1, Math.max(0.04, Math.abs(sy)) * (1 + 0.08 * Math.sin(clamp((t - ev('o2', 'flip') - 0.35) / 0.4) * Math.PI)));
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -175 + 6, -75 + 8, 350, 150, 18); c.fill();
  c.fillStyle = back ? '#FFF1C9' : '#FFFDF8'; rr(c, -175, -75, 350, 150, 18); c.fill(); c.strokeStyle = '#9C7A2A'; c.lineWidth = 6; c.stroke();
  if (!back) { fitTxt(c, 'FITTING', 0, -26, 50, '#5A2A6A', 300); fitTxt(c, 'ROOM', 0, 30, 50, '#5A2A6A', 300); }
  else { fitTxt(c, 'FOR BRAVE', 0, -26, 50, '#E0474C', 310); fitTxt(c, 'PEOPLE', 0, 30, 50, '#E0474C', 310); }
  c.restore(); K.mark(c, 'sign', SGX, SGY, 180); }

// scarf heap (back part before the clerk, front scarves after her when she has fallen into it)
const PCOL = ['#E0474C', '#F2C14E', '#3C8FE0', '#8E5BD6', '#EF7FAA', '#3FB6A8', '#E9A23B', '#5E9E6E'];
function pileBack(c) { c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse((PILE.x0 + PILE.x1) / 2, -6, 520, 40, 0, 0, TAU); c.fill();
  for (let i = 0; i < 22; i++) { const u = i / 21, x = lerp(PILE.x0 + 40, PILE.x1 - 40, hash(i * 5)), hmax = PILE.top * Math.sin(Math.PI * clamp((x - PILE.x0) / (PILE.x1 - PILE.x0))), y = lerp(-30, hmax + 40, hash(i * 11) * 0.9);
    c.save(); c.translate(x, y); c.rotate((hash(i * 3) - 0.5) * 1.4); paint(c, q => { q.m(-110, -26); q.q(0, -60, 110, -26); q.q(130, 0, 110, 26); q.q(0, 50, -110, 26); q.q(-130, 0, -110, -26); q.z(); }, PCOL[i % 8], { sd: 5, hd: 3, lw: 3 }); c.restore(); }
  c.fillStyle = '#FFFDF8'; rr(c, PILE.x1 - 330, -150, 290, 80, 14); c.fill(); c.strokeStyle = '#C23C76'; c.lineWidth = 4; c.stroke(); fitTxt(c, 'SCARVES', PILE.x1 - 185, -108, 40, '#C23C76', 260); }
function pileFront(c, k) { if (k <= 0) return; for (let i = 0; i < 6; i++) { const x = lerp(900, 1700, hash(i * 13 + 2)), y = lerp(-140, -420, hash(i * 17)) ; c.save(); c.globalAlpha = k; c.translate(x, y); c.rotate((hash(i * 7) - 0.5) * 1.6);
  paint(c, q => { q.m(-100, -22); q.q(0, -50, 100, -22); q.q(120, 0, 100, 22); q.q(0, 44, -100, 22); q.q(-120, 0, -100, -22); q.z(); }, PCOL[(i + 3) % 8], { sd: 5, hd: 3, lw: 3 }); c.restore(); } }
// scarves flying up and floating down after the fall
function scarfRain(c, t) { const u = t - ev('end', 'rain'); if (u < 0 || u > 3.2) return;
  for (let i = 0; i < 14; i++) { const x0 = lerp(PILE.x0 + 100, PILE.x1 - 200, hash(i * 9)), vx = (hash(i * 4) - 0.5) * 700, vy = -1500 - hash(i * 6) * 900, g = 1700;
    const tt = Math.min(u, 2.4), x = x0 + vx * tt * 0.6 + Math.sin(u * 4 + i) * 40, y = Math.min(PILE.top - 60 + hash(i) * 200, -300 + vy * tt + g * tt * tt * (tt > 0.6 ? 0.55 : 1));
    c.save(); c.globalAlpha = clamp((3.2 - u) / 0.5); c.translate(x, y); c.rotate(u * (2 + hash(i) * 3) * (i % 2 ? 1 : -1));
    paint(c, q => { q.m(-80, -16); q.q(0, -40 + Math.sin(u * 9 + i) * 20, 80, -16); q.l(80, 16); q.q(0, -6 + Math.sin(u * 9 + i) * 20, -80, 16); q.z(); }, PCOL[i % 8], { sd: 4, hd: 2, lw: 3 }); c.restore(); } }

// ---------------- characters (standing; feet at y = 0)
const hang = (g, s) => reach(g, s, s * g.sw * 0.85, g.ySh + 330);
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const chest = (g, s, k = 0.4, dy = 230) => reach(g, s, s * g.sw * k, g.ySh + dy);
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.45 + Math.sin(u) * 18), g.ySh + base + Math.cos(u) * 18, { planar: true }); } };
const dressSide = g => reach(g, -1, -g.sw * 1.05, g.ySh + 300);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.75, armL: dressSide(g), armR: hang(g, 1), items: { L: dressItem } };
  const after = [];
  if (L === 'hook') { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 0.12, g.ySh - 30, { planar: true }); st.items = { R: dressItem }; st.armL = reach(g, -1, -g.sw * 0.75, g.ySh + 330); st.turn = 0.15; st.look = 0.2;
    if (t > hev('react')) { st.mood = 'skeptical'; st.browUp = 0.3; st.look = 0.85; st.turn = 0.3; } if (t > hev('wide')) { st.mood = 'annoyed'; } }
  if (L === 'o1') { st.mood = 'neutral'; if (speaking('o1_h', t, 0.1, 0.2)) { st.mood = 'angry'; gest(st, g, 'her', t, 1, 110); }
    if (t > SP.o1_c.t) { st.mood = 'annoyed'; }
    const d = e('drape'); if (t > d + 0.35) after.push(cc => scarfShoulder(cc, g, 1));
    if (t > e('react')) { st.mood = 'annoyed'; st.look = 0.1; st.lookY = 0.4; st.turn = 0.1; }
    const tg = e('tug'); if (t > tg && t < tg + 0.45) { st.armR = reach(g, 1, g.sw * 0.55, g.ySh + 40 + Math.sin(t * 30) * 20, { planar: true }); st.mood = 'angry'; }
    if (t > tg + 0.45) { st.mood = 'bored'; st.look = 0; st.lookY = 0; st.turn = 0; st.front = (cc, a) => scarfHead(cc, a, g, clamp((t - tg - 0.45) / 0.25)); st.armR = hang(g, 1); } }
  if (L === 'o2') { st.mood = 'happy'; if (speaking('o2_h', t, 0.1, 0.2)) { st.mood = 'happy'; st.armR = chest(g, 1, 0.3, 200); }
    if (t > SP.o2_c.t) st.mood = 'neutral'; if (t > e('flip')) { st.mood = 'surprised'; st.look = 0.9; st.lookY = -0.5; }
    if (t > e('gulp')) { const u = t - e('gulp'); st.mood = 'worried'; st.headY = u < 0.3 ? Math.sin(u / 0.3 * Math.PI) * 10 : 0; st.lookY = -0.3; st.look = 0.8; st.armR = chest(g, 1, 0.2, 200); } }
  if (L === 'o3') { st.mood = 'happy'; if (speaking('o3_h', t, 0.1, 0.2)) { st.mood = 'smug'; gest(st, g, 'her', t, 1, 140); }
    if (t > e('walk')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.turn = 0; st.look = 0.2; st.armL = reach(g, -1, -g.sw * 1.0, g.ySh - 60, { planar: true }); st.armR = open(g, 1, 1.6, 120); }
    if (t > SP.o3_nar.t) { st.laugh = false; st.blink = 0; } }
  if (L === 'o4') { st.mood = 'happy'; if (speaking('o4_h', t, 0.1, 0.2)) { st.mood = 'happy'; st.armR = chest(g, 1, 0.25, 210); }
    if (t > endOf('o4_h') + 0.2) { st.mood = 'smug'; st.look = 0.9; } }
  if (L === 'end') { st.mood = 'smug'; st.look = 0.85; const pin = e('pin');
    if (speaking('end_h', t, 0.05, 0.1)) st.mood = 'happy';
    if (t > pin - 0.35 && t < pin + 0.45) { st.armR = reach(g, 1, g.sw * 0.45, g.ySh + 200, { planar: true }); st.lookY = 0.5; st.look = 0.3; }
    after.push(cc => mgrOn(cc, g, clamp((t - pin) / 0.3)));
    if (t > e('sway')) { st.mood = 'surprised'; st.look = 0.9; }
    if (t > e('fall') + 0.6) { st.mood = 'happy'; st.look = 0.4; st.armL = open(g, -1, 1.5, 130); st.armR = open(g, 1, 1.5, 130); st.items = {}; } }
  if (after.length) st.afterTorso = cc => after.forEach(f => f(cc));
  return st; }
const paleK = (t, L) => L === 'o4' ? clamp((t - ev('o4', 'pale')) / 0.5) : L === 'end' ? 1 : 0;
function clerkCfg(t, L) { const k = paleK(t, L); return k > 0 ? { ...CLK0, skin: mix(CLK0.skin, '#DCE8E0', k), blush: mix(CLK0.blush, '#C8DCD0', k) } : CLK0; }
function clerkState(t, L) { const g = G.clerk, e = k => ev(L, k), st = { t, talk: talk('clerk', t), mood: 'smug', turn: -0.3, look: -0.75, armL: chest(g, -1, 0.3, 240), armR: reach(g, 1, g.sw * 1.0, g.ySh + 300, { planar: true }), items: {} };
  let wig = 0, knot = 0; const extra = [];
  if (L === 'hook') { st.mood = 'smug'; st.lookY = 0.35; st.look = -0.6; if (speaking('hook_c', t, 0.05, 0.1)) gest(st, g, 'clerk', t, -1, 170); if (t > endOf('hook_c') + 0.1) { st.mood = 'smug'; st.blink = 1; st.lookY = 0; } }
  if (L === 'o1') { if (speaking('o1_h', t, 0, 0.1)) st.mood = 'surprised'; if (speaking('o1_c', t, 0.05, 0.1)) { st.mood = 'smug'; gest(st, g, 'clerk', t, -1, 160); }
    const d = e('drape'), u = t - d; if (u > -0.1 && u < 0.55) { const hx = HX + G.her.sw * 0.7 - LX, hy = G.her.ySh - 10; st.armL = reach(g, -1, lerp(-g.sw * 1.2, hx, eIO(clamp((u + 0.1) / 0.4))), lerp(g.ySh + 150, hy, eIO(clamp((u + 0.1) / 0.4))), { planar: true }); if (u < 0.35) st.items = { L: scarfItem }; st.mood = 'happy'; }
    if (u > 0.55) { st.mood = 'smug'; st.blink = 1; } if (t > e('tug') + 0.45) { st.blink = 0; st.mood = 'happy'; st.laugh = true; } }
  if (L === 'o2') { if (speaking('o2_c', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'clerk', t, -1, 160); }
    const f = e('flip'), u = t - f; if (u > -0.3 && u < 0.4) { st.armR = reach(g, 1, SGX - LX - 150, SGY + 40 - 0 * u, { planar: true }); st.turn = 0.1; st.look = 0.5; }
    if (u > 0.4) { st.mood = 'smug'; st.turn = -0.25; st.look = -0.7; st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 300, { planar: true }); } }
  let sy = 1;
  if (L === 'o3') { const s0 = e('stiff'); if (t > s0) { const u = t - s0; sy = 1 + 0.035 * eBack(clamp(u / 0.25), 2.5); st.mood = 'happy'; st.blink = 0; st.breathe = 0; st.turn = -0.2; st.look = -0.5; st.armL = reach(g, -1, -g.sw * 0.8, g.ySh + 345); st.armR = reach(g, 1, g.sw * 0.8, g.ySh + 345); st.headY = -6;
      const tw = e('twitch'); if (t > tw && t < tw + 0.9) st.blink = ((t - tw) % 0.3) < 0.1 ? 1 : 0;
      if (t > tw) extra.push((c, hd) => sweat(c, hd, t - tw)); } }
  if (L === 'o4') { if (speaking('o4_h', t, 0, 0.1)) { st.mood = 'neutral'; st.blink = 0; } if (t > SP.o4_h.t + SP.o4_h.d * 0.55) st.mood = 'worried';
    const p = e('pale'); if (t > p) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; wig = 1; st.armL = chest(g, -1, 0.35, 260 + Math.sin(t * 19) * 14); st.armR = chest(g, 1, 0.35, 260 + Math.cos(t * 17) * 14); extra.push((c, hd) => sweat(c, hd, t - p)); }
    if (t > SP.o4_c.t + SP.o4_c.d + 0.1) st.mood = 'worried';
    const kn = e('knot'); if (t > kn) { knot = clamp((t - kn) / 1.1); st.armL = chest(g, -1, 0.2, 300 + Math.sin(t * 22) * 22); st.armR = chest(g, 1, 0.2, 300 + Math.cos(t * 21) * 22); }
    if (t > e('tight')) { wig = 0.2; st.mood = 'worried'; st.lookY = 0.6; st.look = 0; st.turn = 0; } }
  if (L === 'end') { st.mood = 'worried'; st.blink = 0; knot = 1; st.armL = chest(g, -1, 0.2, 300); st.armR = chest(g, 1, 0.2, 300); extra.push((c, hd) => sweat(c, hd, 1));
    if (t > e('pin') + 0.2) { st.mood = 'shock'; st.look = -0.8; st.lookY = 0.3; }
    if (t > e('sway')) { st.mood = 'shock'; st.armL = open(g, -1, 1.3, 260); st.armR = open(g, 1, 1.3, 260); st.look = Math.sin(t * 12) * 0.8; }
    if (t > e('fall') + 0.1) { st.mood = 'tired'; st.blink = 1; st.talk = 0; st.armL = open(g, -1, 1.8, 40); st.armR = open(g, 1, 1.8, 40); extra.push((c, hd) => dizzy(c, hd, t)); } }
  st.afterTorso = cc => { tape(cc, g, t, wig, knot); staffBadge(cc, g); };
  return { st, sy, extra }; }
function sweat(c, hd, u) { const k = clamp(u / 0.3); if (k <= 0) return; for (const [dx, dy, s] of [[1.05, -0.55, 1], [-1.1, -0.3, 0.8]]) { const x = hd.x + dx * hd.hh, y = hd.y + dy * hd.hh + ((u * 60 * s) % 40);
  c.fillStyle = '#9AD3F0'; c.beginPath(); c.moveTo(x, y - 30 * s * k); c.quadraticCurveTo(x + 18 * s * k, y + 4, x, y + 16 * s * k); c.quadraticCurveTo(x - 18 * s * k, y + 4, x, y - 30 * s * k); c.fill(); c.strokeStyle = '#3C7AA8'; c.lineWidth = 3; c.stroke(); } }
function dizzy(c, hd, t) { for (let i = 0; i < 3; i++) { const a = t * 4 + i * TAU / 3; c.fillStyle = C.gold; UI.star(c, hd.x + Math.cos(a) * hd.hh * 1.2, hd.y - hd.hh * 1.1 + Math.sin(a) * hd.hh * 0.35, 26); } }
// the clerk's whole-body pose: stiff stretch (o3) and the faint (sway, fall backwards onto the scarves, around her feet)
function clerkRot(t, L) { if (L !== 'end') return 0; const s = ev('end', 'sway'), f = ev('end', 'fall');
  if (t < s) return 0; if (t < f) return 0.05 * Math.sin((t - s) * 14) * clamp((t - s) / 0.2);
  const u = t - f; return u < 0.45 ? 1.2 * eIn(u / 0.45) : 1.2 + 0.06 * Math.sin((u - 0.45) * 18) * Math.exp(-(u - 0.45) * 6); }
function putClerk(c, t, L) { const { st, sy, extra } = clerkState(t, L), rot = clerkRot(t, L), cfg = clerkCfg(t, L);
  c.save(); c.translate(LX, 0); c.rotate(rot); c.scale(1, sy); const r = K.put(c, cfg, st, 0, 0); c.restore();
  const cs = Math.cos(rot), sn = Math.sin(rot), hx = r.x - LX, hy = r.y * sy, hd = { x: LX + hx * cs - hy * sn, y: hx * sn + hy * cs, hh: r.hh, r: r.r };
  for (const f of extra) f(c, hd); return hd; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'clerk'], cover: ['her', 'clerk'], two: ['her', 'clerk'], her: ['her'], clerk: ['clerk'], sign: [], faint: ['clerk'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); signDraw(c, t, L); pileBack(c);
  if (who.includes('clerk')) heads.clerk = putClerk(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  const fl = L === 'end' ? clamp((t - ev('end', 'fall') - 0.4) / 0.2) : 0; if (who.includes('clerk')) pileFront(c, fl);
  if (L === 'end') scarfRain(c, t);
  if (!heads.her) heads.her = OFFL; if (!heads.clerk) heads.clerk = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z, AVG = (HY('her') + HY('clerk')) / 2;
const SH = { COVER: S(0, fy(AVG, 0.86, 1090), 0.86, 'cover'), WIDE: S(120, fy(AVG, 0.5, 790), 0.5, 'wide'), TWO: S(0, fy(AVG, 0.78, 1000), 0.78, 'two'),
  HER: S(HX + 40, fy(HY('her'), 1.0), 1.0, 'her'), HER_CU: S(HX + 20, fy(HY('her'), 1.35, 950), 1.35, 'her'), HER_B: S(HX + 30, fy(HY('her'), 0.85, 860), 0.85, 'her'),
  CLK: S(LX - 40, fy(HY('clerk'), 1.0), 1.0, 'clerk'), CLK_CU: S(LX - 30, fy(HY('clerk'), 1.35, 950), 1.35, 'clerk'),
  SIGNSHOT: S(560, fy(HY('clerk'), 0.8, 1010), 0.8, 'clerk'), SIGN: S(SGX, SGY + 160, 1.75, 'sign'),
  FAINT: S(1020, -(1400 - 960) / 0.55, 0.55, 'faint'), END: S(700, -(1340 - 960) / 0.4, 0.4, 'wide'),
  DRESS: U('dress', 1), BADGE: U('badge', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.END;
  const sp = (id, pre = 0.1, post = 0.27) => speaking(id, t, pre, post);
  if (L === 'hook') { if (t < hev('react') - 0.02) return SH.COVER; if (t < hev('dress') - 0.05) return f(SH.HER_CU); if (t < hev('clerk') - 0.05) return f(SH.DRESS); if (t < hev('wide') - 0.05) return f(SH.CLK_CU); return f(SH.WIDE); }
  if (t < sc.s + 0.5 - 0.1) return f(SH.WIDE);   // option plate pops over the wide
  if (L === 'o1') { if (sp('o1_h')) return f(SH.HER); if (t < e('drape') - 0.1) return f(SH.CLK); if (t < e('tug') - 0.05) return f(SH.TWO); return f(SH.HER); }
  if (L === 'o2') { if (sp('o2_h')) return f(SH.HER); if (t < e('flip') - 0.3) return f(SH.CLK); if (t < e('sign')) return f(SH.SIGNSHOT); if (t < e('gulp') - 0.05) return f(SH.SIGN); return f(SH.HER); }
  if (L === 'o3') { if (sp('o3_h')) return f(SH.HER); if (t < e('twitch') - 0.05) return f(SH.CLK); if (t < e('walk') - 0.05) return f(SH.CLK_CU); if (t < SP.o3_tip.t - 0.1) return f(SH.HER_B); return f(SH.TWO); }
  if (L === 'o4') { const ch2 = K.wordT('o4_h', 'could') ?? SP.o4_h.t + 2.0; if (t < ch2 - 0.05) return f(SH.HER); if (t < endOf('o4_h') + 0.25) return f(SH.TWO); if (t < e('knot') - 0.05) return f(SH.CLK_CU); return f(SH.CLK); }
  if (L === 'end') { if (t < SP.end_h.t - 0.1) return f(SH.TWO); if (t < e('badge')) return f(SH.HER); if (t < e('sway') - 0.1) return f(SH.BADGE); if (t < e('fall') + 1.1) return f(SH.FAINT); return f(SH.END); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'plop']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id });
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.2)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
function insertView(c, t, name) {
  if (name === 'dress') { backdrop(c, t, '#F7D9E4', '#E9A9BF', 'dress'); const k = eBack(clamp((t - hev('dress') + 0.05) / 0.3), 1.6); c.save(); c.translate(540, 470); c.rotate(Math.sin(t * 2.2) * 0.04); c.scale(1.9 * k, 1.9 * k); dressDraw(c, 1); c.restore();
    for (let i = 0; i < 5; i++) { const a = t * 2.5 + i * 1.3; c.fillStyle = C.gold; UI.star(c, 540 + Math.cos(a) * 400, 900 + Math.sin(a * 1.2) * 300, 26); } }
  if (name === 'badge') { backdrop(c, t, '#7FA3DC', '#5C86C9', 'badge'); const k = eBack(clamp((t - ev('end', 'badge') + 0.05) / 0.3), 1.8); c.save(); c.translate(540, 820); c.rotate(-0.05); c.scale(3.6 * k, 3.6 * k); mgrBadge(c, 1); c.restore();
    for (let i = 0; i < 6; i++) { const a = t * 2.2 + i * 1.05; c.fillStyle = C.gold; UI.star(c, 540 + Math.cos(a) * 440, 820 + Math.sin(a * 1.3) * 380, 28); } }
}

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.45, 2.75); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 360); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 110, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore(); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD6'] };
// option plate: pops big at the start of the option (<= 0.5 s), then stays as a small label at the top
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, sMax = Math.min(1.4, 1000 / w), s = k * lerp(Math.min(1, 960 / w), sMax, big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 54); c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4 with the English answers, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d);
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine (badge on) + the clerk, bottom-left (owner-approved outro layout: heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 2060, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gr = G.clerk; K.put(c, { ...CLK0, skin: '#F4D0B8' }, { t, mood: 'happy', laugh: true, blink: 1, turn: -0.2, look: -0.4, armL: open(gr, -1, 1.9, 60 + Math.sin(t * 8) * 30), armR: hang(gr, 1), items: {}, afterTorso: cc => { tape(cc, gr, t); staffBadge(cc, gr); } }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: hang(g, 1), items: {}, afterTorso: cc => mgrOn(cc, g, 1) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); UI.font(c, 'Unb9', 74); UI.strokeText(c, 'А ТЫ БЫ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ОТВЕТИЛА КАК?', 0, 46, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'В ЛОБ', 'You rude!', '#E0474C', 'один'], ['2', 'ВЕЖЛИВО', "I'd like to try it anyway.", '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', "I'll be the judge of that.", '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', 'Could I speak to the manager?', '#8E5BD6', 'четыре']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.3 + i * 0.3) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 535 + i * 160, bump = 1 + 0.05 * Math.sin(clamp((t - a - 0.28) / 0.35) * Math.PI);
    c.save(); c.translate(500, y); c.scale(k * bump, k * bump); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -420 + 8, -68 + 12, 840, 136, 36); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -420, -68, 840, 136, 36); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-345, 0, 52, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -345, 4, 72, C.white, 72);
    fitTxt(c, ru, -268, -24, 42, C.oliveD, 660, 'Unb9', 'left'); fitTxt(c, en, -268, 28, 36, C.pinkD, 660, 'Nun9', 'left'); c.restore(); });
  const sv = wt('пиши', 2.7) - 0.15, bk = eBack(P(t, sv, sv + 0.3), 2.2), by = 1215;
  if (bk > 0) { c.save(); c.translate(500, by); c.scale(bk, bk); c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -440 + 6, -55 + 10, 420, 110, 55); c.fill(); c.fillStyle = C.gold; rr(c, -440, -55, 420, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-385, -30); c.lineTo(-345, -30); c.lineTo(-345, 32); c.lineTo(-365, 15); c.lineTo(-385, 32); c.closePath(); c.fill();   // bookmark icon (path)
    fitTxt(c, 'СОХРАНИ', -205, 4, 40, C.oliveD, 290);
    const subT = Math.min(sv + 0.9, sp.t + sp.d - 0.2), click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(230, 0); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -210 + 6, -55 + 10, 420, 110, 55); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -210, -55, 420, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 360); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(930, 760, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  UI.captions(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { insertView(c, t, tag.slice(3)); heads = { her: OFFL, clerk: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, hold: { hook_c: -0.2, o1_h: -0.22, o1_c: -0.3, o2_h: -0.22, o2_c: -0.2, o3_h: -0.22, o3_c: 0.05, o4_h: -0.22, o4_c: -0.1, end_h: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('size', NF, renderFrame);
