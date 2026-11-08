// Parallax sets, batch 3: S1b Paris room (empty) · S11 night office + press · S12 maze of companies · S13 Stockholm exchange (closed) ·
// S14 accountants' room · S15 US Senate hearing room · S16 today (the match lit again).
const P = require('./par.js'); const K = require('./kreuger.js'); const { person } = require('./sets2.js');
const { W, H, layer, camAt, fillShade, rect, poly, blob, sky, beams, dust, smoke, rain, flame, glow, grade, vignette, grain, hash, clamp, lerp, ss, back } = P;
const LINE = 'rgba(27,20,16,0.5)';
const putK = (ctx, cam, o, g, def) => { if (!o.k) return; const s = o.ks ?? def[2], st = Object.assign({ legs: 'stand' }, o.k), y = o.ky ?? (st.legs ? (def[1] - 648 * s) : def[1]);
  layer(ctx, cam, o.kz ?? def[3] ?? 1.0, x => K.kreuger(x, o.kx ?? def[0], y, s, st, g), { dof: 7 }); };
function matchStick(x, px, py, s, burnt, g, lit) { x.save(); x.translate(px, py); x.rotate(-1.45); x.scale(s, s); const len = 120 * (1 - burnt);
  fillShade(x, rect(-4, -len, 8, len), '#e8c88f', {}); fillShade(x, rect(-4, -len - 10 * burnt, 8, 10 * burnt + 2), '#2a1a12', {}); if (burnt < 0.95) { x.fillStyle = '#9b1d1d'; x.beginPath(); x.ellipse(0, -len, 6, 8, 0, 0, 7); x.fill(); }
  if (lit > 0) flame(x, 0, -len - 4, 0.6, g, lit); else if (burnt > 0.9) smoke(x, 0, -len, g, { col: '200,200,200', a: 0.25, s: 0.2, n: 5 }); x.restore(); }
// ============ S1b · THE PARIS ROOM (morning light, empty: desk, letters, a lamp, the burnt-out match) ============
function room(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, 0, 1.0, 1.0], [10, 0, 20, 1.15, 1.0]]);
  sky(ctx, [[0, '#4a4844'], [1, '#2c2a28']]);
  layer(ctx, cam, 2.2, x => { fillShade(x, rect(-500, -300, 3000, 1700), '#8f8a80', { y0: -300, y1: 1300 }); for (let i = 0; i < 30; i++) { x.strokeStyle = 'rgba(60,55,50,0.12)'; x.lineWidth = 2; x.beginPath(); x.moveTo(-500 + i * 110, -300); x.lineTo(-500 + i * 110, 1300); x.stroke(); }
    fillShade(x, rect(1100, 60, 520, 760), '#cfd6dc', { line: LINE }); x.fillStyle = 'rgba(160,170,180,0.6)'; for (let i = 0; i < 4; i++) x.fillRect(1120 + i * 125, 380 - hash(i) * 100, 110, 420);
    fillShade(x, rect(1340, 60, 20, 760), '#e8e4dc', {}); fillShade(x, rect(1080, 40, 70, 820), '#d8d0c0', { line: LINE }); fillShade(x, rect(1570, 40, 70, 820), '#d8d0c0', { line: LINE });
    fillShade(x, rect(240, 140, 320, 240), '#6a5a44', { line: LINE }); fillShade(x, rect(262, 162, 276, 196), '#a9a28e', {}); });
  beams(ctx, 1500, 0.9, '230,235,245');
  layer(ctx, cam, 1.0, x => { fillShade(x, rect(280, 720, 1300, 60), '#3c2a1c', { line: LINE }); fillShade(x, rect(320, 780, 40, 300), '#2f2116', {}); fillShade(x, rect(1500, 780, 40, 300), '#2f2116', {});
    for (let i = 0; i < 3; i++) fillShade(x, poly([[700 + i * 150, 712 - i * 4], [830 + i * 150, 708 - i * 4], [836 + i * 150, 724], [704 + i * 150, 728]]), '#f2ede2', { line: LINE });
    fillShade(x, rect(1200, 560, 18, 160), '#3a3a3a', {}); fillShade(x, poly([[1140, 560], [1280, 560], [1250, 480], [1170, 480]]), '#cfc1a0', { line: LINE });
    matchStick(x, 600, 714, 1.0, o.burn != null ? o.burn(g) : 1, g, o.lit != null ? o.lit(g) : 0); });
  layer(ctx, cam, 0.55, x => { fillShade(x, rect(-200, -100, 300, 1400), '#5a4a3a', { line: LINE }); fillShade(x, c => { c.beginPath(); c.roundRect(1700, 700, 400, 500, 40); }, '#5a2a24', { line: LINE }); });
  dust(ctx, g, 50, '235,240,250'); grade(ctx, 'grey', 0.8); grade(ctx, 'cold', 0.6); vignette(ctx, 0.45); grain(ctx, g); }
// ============ S11 · NIGHT OFFICE (desk lamp, a pen forging signatures; through the door a press prints bonds) ============
function nightoffice(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, 0, 1.0, 1.0], [10, 0, 30, 1.2, 1.0]]);
  sky(ctx, [[0, '#0e1220'], [1, '#1a1e2c']]);
  layer(ctx, cam, 2.0, x => { fillShade(x, rect(-500, -300, 3000, 1700), '#1e2434', { y0: -300, y1: 1300 }); fillShade(x, rect(1180, 120, 460, 760), '#2a2216', { line: LINE });   // doorway
    x.fillStyle = '#e8b45a'; x.fillRect(1200, 140, 420, 720); fillShade(x, rect(1240, 520, 340, 300), '#3a3a40', { line: LINE });   // the press
    x.save(); x.translate(1410, 470); x.rotate(g * 2); x.strokeStyle = '#1a1a1e'; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 60, 0, 7); x.stroke(); for (let k = 0; k < 6; k++) { x.rotate(1.047); x.beginPath(); x.moveTo(0, 0); x.lineTo(60, 0); x.stroke(); } x.restore();
    const n = Math.floor((g * 1.5) % 8); for (let i = 0; i < n; i++) fillShade(x, rect(1260, 780 - i * 10, 120, 8), '#e9dfc4', {}); });
  glow(ctx, 1410, 500, 500, '255,190,100', 0.25);
  putK(ctx, cam, o, g, [700, 420, 1.2, 1.0]);
  layer(ctx, cam, 0.85, x => { fillShade(x, rect(-100, 760, 1500, 70), '#2a1c12', { line: LINE }); fillShade(x, rect(-100, 830, 1500, 400), '#1c130c', {});
    fillShade(x, poly([[300, 600], [460, 600], [420, 520], [340, 520]]), '#2f6a45', { line: LINE }); fillShade(x, rect(370, 600, 20, 160), '#222', {}); glow(x, 380, 640, 340, '255,210,140', 0.55);
    for (let i = 0; i < 4; i++) { fillShade(x, poly([[560 + i * 40, 750 - i * 8], [820 + i * 40, 744 - i * 8], [826 + i * 40, 768 - i * 8], [564 + i * 40, 772 - i * 8]]), '#e9dfc4', { line: LINE }); }
    x.fillStyle = '#7a1c1c'; x.font = `italic 700 26px ${P.SERIF}`; x.fillText('Regno d’Italia', 640, 744); x.strokeStyle = '#1b2a6a'; x.lineWidth = 2.5; x.beginPath(); for (let k = 0; k <= 30; k++) { const u = k / 30; x.lineTo(700 + u * 100 * clamp((g % 3) / 2), 760 + Math.sin(u * 20) * 6); } x.stroke(); });
  dust(ctx, g, 30, '255,220,170'); grade(ctx, 'night', 0.6); grade(ctx, 'cold', 0.5); vignette(ctx, 0.5); grain(ctx, g, 0.055); }
// ============ S12 · MAZE OF COMPANIES (paper doors in depth, each a country; coins slip through and seem to multiply) ============
function maze(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, 0, 1.0, 2.0], [12, 0, 0, 1.35, 1.2]]);
  sky(ctx, [[0, '#0b0f1c'], [1, '#1a2034']]);
  const labs = ['LIECHTENSTEIN', 'NETHERLANDS', 'SWITZERLAND', 'GARANTA', 'CONTINENTAL', 'STOCKHOLM', 'NEW YORK', 'LUXEMBOURG'];
  for (let k = 7; k >= 0; k--) { const z = 0.6 + k * 0.45; layer(ctx, cam, z, x => { const side = k % 2 ? -1 : 1, ps = 1 / (1 + k * 0.42); x.translate(960, 540); x.scale(ps, ps); x.translate(-960, -540); x.globalAlpha = 1 - k * 0.08;
    for (const sd of [-1, 1]) { fillShade(x, rect(960 + sd * 620 - 160, 160, 320, 760), k % 3 ? '#e9e0cc' : '#d8ccb0', { line: LINE }); fillShade(x, rect(960 + sd * 620 - 100, 360, 200, 560), '#151a28', {}); }
    x.fillStyle = '#2a2016'; x.font = `900 30px ${P.F}`; x.textAlign = 'center'; x.fillText(labs[k], 960 + side * 620, 300); x.textAlign = 'left';
    for (let j = 0; j < 4; j++) { const u = ((g * 0.4 + j / 4 + k * 0.13) % 1); x.fillStyle = `rgba(240,183,47,${0.9 - u * 0.4})`; x.beginPath(); x.arc(960 + Math.sin(u * 6.28 + k) * 300, 540 + Math.cos(u * 6.28 + j) * 120, 16, 0, 7); x.fill(); } }, { dof: 5 }); }
  glow(ctx, 960, 540, 600, '255,190,90', 0.15); grade(ctx, 'cold', 0.5); vignette(ctx, 0.5); grain(ctx, g); }
// ============ S13 · STOCKHOLM STOCK EXCHANGE, CLOSED (rain, a notice on the doors, a queue) ============
function exchange(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, -60, 1.0, 1.2], [9, 0, 60, 1.12, 1.2]]);
  sky(ctx, [[0, '#5a6068'], [1, '#8e939a']]);
  layer(ctx, cam, 1.2, x => { fillShade(x, rect(200, 60, 1520, 1000), '#d0c2a4', { y0: 60, y1: 1060 }); fillShade(x, poly([[160, 60], [960, -120], [1760, 60]]), '#b9aa8a', { line: LINE });
    for (let i = 0; i < 6; i++) fillShade(x, rect(330 + i * 240, 240, 70, 820), '#e4d8bc', { line: LINE, hi: 0.3 });
    x.fillStyle = '#3a3026'; x.font = `900 46px ${P.SERIF}`; x.textAlign = 'center'; x.fillText('BÖRSEN', 960, 190); x.textAlign = 'left';
    fillShade(x, rect(820, 640, 280, 420), '#3a2a1c', { line: LINE }); fillShade(x, rect(900, 760, 120, 150), '#f4eedf', { line: LINE }); x.fillStyle = '#2a2016'; x.font = `900 22px ${P.F}`; x.textAlign = 'center'; x.fillText('STÄNGT', 960, 800); x.fillText('CLOSED', 960, 840); x.textAlign = 'left'; });
  layer(ctx, cam, 0.85, x => { fillShade(x, rect(-300, 1000, 2500, 200), '#4d5258', {}); for (let i = 0; i < 10; i++) person(x, (i < 5 ? 160 + i * 125 : 1180 + (i - 5) * 125) + Math.sin(g + i) * 3, 760 + (i % 2) * 14, 0.62, ['#23262c', '#2f2a26'][i % 2], { hat: true, back: true }); });
  rain(ctx, g, 1); grade(ctx, 'grey', 0.9); grade(ctx, 'cold', 0.6); vignette(ctx, 0.45); grain(ctx, g); }
// ============ S14 · ACCOUNTANTS' ROOM (piles of ledgers, green lamps, red pencils) ============
function accountants(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, -80, 0, 1.0, 1.0], [10, 80, 20, 1.15, 1.0]]);
  sky(ctx, [[0, '#3a3a34'], [1, '#2a2a26']]);
  layer(ctx, cam, 2.0, x => { fillShade(x, rect(-500, -300, 3000, 1700), '#5d5a4c', { y0: -300, y1: 1300 }); for (let i = 0; i < 7; i++) { fillShade(x, rect(-300 + i * 380, 120, 300, 520), '#4a3a26', { line: LINE }); for (let sh = 0; sh < 5; sh++) for (let b = 0; b < 9; b++) fillShade(x, rect(-290 + i * 380 + b * 32, 140 + sh * 100, 26, 86), ['#6a2a24', '#2a4a3a', '#3a3a5a', '#8a6a3a'][(b + sh + i) % 4], {}); } });
  layer(ctx, cam, 1.05, x => { for (let i = 0; i < 3; i++) person(x, 460 + i * 500, 540, 0.85, '#2a2c32', { glasses: i !== 1, hair: ['#7a7068', '#2a2420', '#5a4a40'][i] }); });
  layer(ctx, cam, 0.95, x => { fillShade(x, rect(80, 780, 1760, 60), '#4a3420', { line: LINE }); fillShade(x, rect(120, 840, 1680, 300), '#33251a', {});
    for (let i = 0; i < 3; i++) { const lx = 300 + i * 600; fillShade(x, poly([[lx, 680], [lx + 160, 680], [lx + 120, 610], [lx + 40, 610]]), '#2f6a45', { line: LINE }); glow(x, lx + 80, 700, 220, '255,220,150', 0.4);
      for (let k = 0; k < 5; k++) fillShade(x, rect(lx + 180, 770 - k * 22, 200, 20), ['#6a2a24', '#2a3a5a', '#7a5a2a'][k % 3], { line: LINE }); }
    if (o.crumble) for (let i = 0; i < 40; i++) { const u = clamp(o.crumble(g)); x.fillStyle = `rgba(230,220,200,${0.8 * (1 - u)})`; x.fillRect(900 + hash(i) * 200, 700 - u * 200 * hash(i * 3), 8, 6); } });
  dust(ctx, g, 40); grade(ctx, 'grey', 0.5); vignette(ctx, 0.45); grain(ctx, g); }
// ============ S15 · US SENATE HEARING ROOM, 1933 (curved wooden benches, microphones, the witness table) ============
function senate(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, -40, 1.0, 1.1], [10, 0, 40, 1.15, 1.1]]);
  sky(ctx, [[0, '#4a3a2a'], [1, '#2e2418']]);
  layer(ctx, cam, 2.4, x => { fillShade(x, rect(-500, -300, 3000, 1700), '#7a6a52', { y0: -300, y1: 1300 }); for (let i = 0; i < 5; i++) { fillShade(x, rect(-200 + i * 520, 40, 240, 560), '#c9d2d6', { line: LINE }); fillShade(x, rect(-230 + i * 520, 20, 300, 30), '#5a4632', {}); } });
  beams(ctx, 1200, 0.6);
  layer(ctx, cam, 1.3, x => { fillShade(x, c => { c.beginPath(); c.moveTo(0, 520); c.quadraticCurveTo(960, 380, 1920, 520); c.lineTo(1920, 640); c.quadraticCurveTo(960, 500, 0, 640); c.closePath(); }, '#5a3a22', { line: LINE });
    for (let i = 0; i < 9; i++) { const px = 150 + i * 205, py = 470 - Math.sin(i / 8 * Math.PI) * 90; person(x, px, py - 40, 0.42, '#24262c', { glasses: i % 3 === 0, hair: i % 2 ? '#8a8078' : '#2a2420' }); } });
  layer(ctx, cam, 0.9, x => { fillShade(x, rect(500, 800, 920, 60), '#4a3020', { line: LINE }); fillShade(x, rect(540, 860, 840, 300), '#33221a', {});
    for (const mx of [760, 1160]) { fillShade(x, rect(mx - 4, 700, 8, 100), '#222', {}); fillShade(x, c => { c.beginPath(); c.ellipse(mx, 690, 22, 30, 0, 0, 7); }, '#3a3a3e', { line: LINE }); } person(x, 960, 610, 0.7, '#2a2c34', { back: true, hair: '#4a3a30' }); });
  dust(ctx, g, 40); grade(ctx, 'warm', 0.5); vignette(ctx, 0.42); grain(ctx, g);
  if (o.date !== false) P.plate(ctx, 'WASHINGTON · JANUARY 1933', 120, 140, clamp((g - 0.5) / 0.4), { size: 46, bar: '#e3a83a' }); }
// ============ S16 · TODAY (a modern table, a matchbox, the match lit again; the old portrait fades into the smoke) ============
function today(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, 0, 1.0, 1.0], [10, 0, 0, 1.25, 1.0]]);
  sky(ctx, [[0, '#111214'], [1, '#1e1f22']]);
  layer(ctx, cam, 2.5, x => { if (o.ghost) { x.save(); x.globalAlpha = clamp(o.ghost(g)) * 0.5; K.kreuger(x, 960, 300, 1.6, { age: 'king', expr: 'cold', legs: false }, g); x.restore(); } });
  layer(ctx, cam, 1.0, x => { fillShade(x, rect(-400, 760, 2800, 500), '#6a4a34', { y0: 760, y1: 1260, hi: 0.25 }); for (let i = 0; i < 20; i++) { x.strokeStyle = 'rgba(40,25,15,0.25)'; x.beginPath(); x.moveTo(-400, 780 + i * 22); x.lineTo(2400, 790 + i * 22); x.stroke(); }
    x.save(); x.translate(760, 790); x.rotate(-0.08); x.scale(2, 2); fillShade(x, rect(-120, -60, 240, 70), '#f2c230', { line: LINE }); fillShade(x, rect(-120, -40, 240, 26), '#b8231b', {}); x.restore();
    x.save(); x.translate(1180, 760); x.scale(2.6, 2.6); fillShade(x, rect(-4, -120, 8, 120), '#e8c88f', { line: LINE }); x.fillStyle = '#9b1d1d'; x.beginPath(); x.ellipse(0, -122, 7, 9, 0, 0, 7); x.fill(); flame(x, 0, -126, 0.75, g, o.lit ? clamp(o.lit(g)) : 1); x.restore(); glow(x, 1180, 380, 600, '255,180,90', 0.4 * (o.lit ? clamp(o.lit(g)) : 1)); });
  vignette(ctx, 0.55); grain(ctx, g); }
module.exports = { room, nightoffice, maze, exchange, accountants, senate, today, matchStick };
