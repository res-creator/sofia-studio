// The American cafe set + its cast animation (hero plane: floor at the counter front = y 0, units ≈ px at z = 1).
// Layers use depth d (1 = hero plane); at the reference camera every layer lines up with the hero plane.
const K = require('../mcd_collage/kit');
const R = require('./rig');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, shade, fillStroke, ell, figure, walk, cup, card } = R;

const REF = { x: 300, y: -620, z: 0.5 };
function layer(ctx, cam, d, fn, VW, VH) {
  const z = REF.z * Math.pow(cam.z / REF.z, d), cx = REF.x + (cam.x - REF.x) * d, cy = REF.y + (cam.y - REF.y) * d;
  ctx.save(); ctx.translate(VW / 2 + (cam.shx || 0) * d, VH / 2 + (cam.shy || 0) * d); ctx.rotate((cam.r || 0) * d); ctx.scale(z, z); ctx.translate(-cx, -cy); fn(ctx); ctx.restore();
}
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
const ease = E.inOut, k = (t, a, b, e = ease) => e(seg(t, a, b));

// ---------- cast ----------
const CUST = { skin: '#8D5A3B', hair: '#1E1612', hairStyle: 'curly', top: C.red, cuff: '#B82533', shirt: '#FFFDF8', zip: 1, pants: '#2E3A59', shoes: '#FFFDF8', sole: '#C9C1B1' };
const BAR = { skin: '#F1C6A4', hair: '#B5482A', hairStyle: 'bun', top: '#2B2B2B', apron: C.yellow, pants: '#3A3A3A', shoes: '#5A3A22', iris: '#3D6E8C' };
const LAP = { skin: '#E0AC7E', hair: '#6B4A2E', hairStyle: 'short', beard: 1, glasses: 1, top: '#4D8DFF', pants: '#5B5148', shoes: '#3A2A22', iris: '#4A6B3A' };
const SIP = { skin: '#C68642', hair: '#2B1B14', hairStyle: 'long', top: '#2FA37E', collar: '#FFFDF8', pants: '#3B3F58', shoes: '#B5482A' };

// ---------- the world behind the window (d = 0.55) ----------
function street(ctx, t) {
  const sky = ctx.createLinearGradient(0, -2300, 0, -300); sky.addColorStop(0, '#7FB2FF'); sky.addColorStop(1, '#D8E8FF');
  ctx.fillStyle = sky; ctx.fillRect(-2600, -2600, 2600, 2700);
  // brownstones across the street
  const bld = [[-2400, '#B65A3C', 1250], [-1900, '#D9A441', 1500], [-1400, '#A44A3A', 1150], [-950, '#C7764A', 1420], [-480, '#8E3B33', 1300]];
  for (const [x0, col, h] of bld) {
    ctx.fillStyle = col; ctx.fillRect(x0, -300 - h, 470, h + 300);
    ctx.fillStyle = shade(col, -0.25); ctx.fillRect(x0, -300 - h, 470, 26);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { const wx = x0 + 60 + c * 135, wy = -300 - h + 90 + r * 190; if (wy > -420) continue;
      ctx.fillStyle = '#F7F5F0'; ctx.fillRect(wx - 8, wy - 8, 86, 126); ctx.fillStyle = (r + c + (x0 / 100 | 0)) % 4 === 0 ? '#FFE3A1' : '#4C6A94'; ctx.fillRect(wx, wy, 70, 110); }
    // fire escape
    ctx.strokeStyle = '#2B2B2B'; ctx.lineWidth = 6; for (let r = 1; r < 4; r++) { const y = -300 - h + 200 + r * 190; if (y > -500) continue; ctx.strokeRect(x0 + 150, y, 170, 50); }
  }
  // sidewalk + road
  ctx.fillStyle = '#C9C1B1'; ctx.fillRect(-2600, -420, 2600, 120); ctx.fillStyle = '#4A4A50'; ctx.fillRect(-2600, -300, 2600, 400);
  ctx.fillStyle = '#FFC857'; for (let x = -2600; x < 0; x += 160) ctx.fillRect(x, -150, 80, 12);
  // tree
  ctx.fillStyle = '#5A3A22'; ctx.fillRect(-1180, -760, 28, 340); ctx.fillStyle = '#3E9E6A'; for (const [dx, dy, r] of [[0, -820, 120], [-90, -760, 90], [90, -760, 95], [0, -930, 90]]) { ctx.beginPath(); ctx.arc(-1166 + dx, dy, r, 0, 7); ctx.fill(); }
  // pedestrians (silhouettes walking)
  for (let i = 0; i < 3; i++) { const px = -2400 + ((t * 120 + i * 900) % 2600); ctx.fillStyle = ['#2E3A59', '#6B4A2E', '#3A3A3A'][i];
    ctx.beginPath(); ctx.arc(px, -640, 24, 0, 7); ctx.fill(); rr(ctx, px - 24, -612, 48, 120, 18); ctx.fill(); const sw = Math.sin(t * 7 + i) * 14; ctx.fillRect(px - 16 + sw, -500, 14, 80); ctx.fillRect(px + 2 - sw, -500, 14, 80); }
  // the yellow cab driving past
  const cx = -2800 + ((t + 0.6) * 900) % 3600;
  ctx.save(); ctx.translate(cx, -170);
  rr(ctx, -230, -150, 460, 120, 30); fillStroke(ctx, C.yellow, 6); rr(ctx, -130, -240, 250, 110, [40, 40, 0, 0]); fillStroke(ctx, C.yellow, 6);
  ctx.fillStyle = '#9EC0F2'; rr(ctx, -110, -222, 100, 80, 12); ctx.fill(); rr(ctx, 5, -222, 95, 80, 12); ctx.fill();
  ctx.fillStyle = INK; for (let i = 0; i < 8; i++) ctx.fillRect(-220 + i * 56, -86, 28, 14);
  rr(ctx, -40, -272, 80, 30, 6); fillStroke(ctx, '#FFFDF8', 4);
  for (const wx of [-140, 140]) { ell(ctx, wx, -30, 46, 46); fillStroke(ctx, '#2B2B2B', 6); ell(ctx, wx, -30, 18, 18); ctx.fillStyle = '#C9C1B1'; ctx.fill(); }
  ctx.restore();
}

// ---------- back wall (d = 0.82) ----------
const WIN = [[-1350, -1700, 1060, 1260]]; // x, y, w, h (wall coords)
function wall(ctx, t) {
  ctx.fillStyle = '#F6E7CC'; ctx.fillRect(-3000, -3200, 6400, 3400);
  // ceiling band + beams
  ctx.fillStyle = '#3A2A22'; ctx.fillRect(-3000, -3200, 6400, 1000); ctx.fillStyle = '#5A3F30'; for (let x = -3000; x < 3400; x += 360) ctx.fillRect(x, -2260, 60, 60);
  ctx.fillStyle = '#E9D2AE'; ctx.fillRect(-3000, -2200, 6400, 24);
  // subway tiles behind the bar
  ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-150, -1100, 2200, 1100);
  ctx.strokeStyle = '#E2DACB'; ctx.lineWidth = 3; for (let y = -1100; y < 0; y += 44) { ctx.beginPath(); ctx.moveTo(-150, y); ctx.lineTo(2050, y); ctx.stroke(); for (let x = -150 + ((y / 44) % 2 ? 0 : 45); x < 2050; x += 90) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 44); ctx.stroke(); } }
  // wainscot under the window side
  ctx.fillStyle = '#2F4C7A'; ctx.fillRect(-3000, -420, 2850, 420); ctx.fillStyle = '#3E5F95'; for (let x = -2950; x < -200; x += 170) { rr(ctx, x, -380, 130, 330, 10); ctx.fill(); }
  ctx.fillStyle = C.yellow; ctx.fillRect(-3000, -436, 2850, 20);
  // the big street window
  for (const [x, y, w, h] of WIN) {
    rr(ctx, x - 30, y - 30, w + 60, h + 60, 18); fillStroke(ctx, '#2B2B2B', 0);
  }
  // menu board
  ctx.save(); ctx.translate(380, -1820);
  rr(ctx, -20, -20, 900, 560, 20); fillStroke(ctx, C.yellow, 8); rr(ctx, 10, 10, 840, 500, 10); ctx.fillStyle = '#232625'; ctx.fill();
  txt(ctx, 'MENU', 430, 110, 86, C.yellow);
  const items = [['COFFEE', '$5.00'], ['LATTE', '$5.50'], ['MUFFIN', '$3.25']];
  items.forEach(([a, b], i) => { txt(ctx, a, 70, 220 + i * 100, 58, '#F7F5F0', 'left'); txt(ctx, b, 790, 220 + i * 100, 58, i === 0 ? C.yellow : '#F7F5F0', 'right');
    ctx.fillStyle = 'rgba(247,245,240,0.35)'; for (let x = 360; x < 600; x += 22) ctx.fillRect(x, 205 + i * 100, 8, 8); });
  ctx.restore();
  // big red lettering
  ctx.save(); ctx.translate(1700, -1430); ctx.rotate(-0.04); txt(ctx, 'FRESH', 0, -40, 120, C.red); txt(ctx, 'BREW', 0, 90, 150, C.red); ctx.restore();
  // shelves with mugs and jars
  for (const [y, n] of [[-1000, 7], [-760, 6]]) {
    ctx.fillStyle = '#8B5A3C'; ctx.fillRect(1150, y, 1000, 22); ctx.fillStyle = '#6E4630'; ctx.fillRect(1150, y + 22, 1000, 8);
    for (let i = 0; i < n; i++) { const x = 1200 + i * 135, col = [C.red, C.yellow, '#FFFDF8', '#4D8DFF'][i % 4];
      if (i % 3 === 2) { rr(ctx, x, y - 120, 80, 120, 14); fillStroke(ctx, '#D9C7A8', 4); ctx.fillStyle = '#6B4A2E'; ctx.fillRect(x + 6, y - 70, 68, 64); rr(ctx, x - 4, y - 136, 88, 22, 6); fillStroke(ctx, '#3A2A22', 4); }
      else { rr(ctx, x, y - 80, 74, 80, 12); fillStroke(ctx, col, 4); ctx.beginPath(); ctx.arc(x + 82, y - 42, 18, -1.4, 1.4); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); } }
  }
  // hanging plant by the window
  ctx.strokeStyle = '#5A463C'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-160, -2200); ctx.lineTo(-160, -1880); ctx.stroke();
  rr(ctx, -220, -1890, 120, 90, 20); fillStroke(ctx, '#FFFDF8', 5);
  for (let i = 0; i < 7; i++) { const a = -0.3 + i * 0.25 + Math.sin(t * 1.3 + i) * 0.03; ctx.save(); ctx.translate(-160, -1840); ctx.rotate(a); ell(ctx, 0, 90 + (i % 3) * 40, 26, 46); fillStroke(ctx, '#3E9E6A', 4); ctx.restore(); }
  // framed print
  rr(ctx, 2200, -1650, 280, 360, 8); fillStroke(ctx, '#2B2B2B', 6); ctx.fillStyle = C.yellow; ctx.fillRect(2230, -1620, 220, 300); ell(ctx, 2340, -1470, 70, 70); ctx.fillStyle = C.red; ctx.fill();
}

function windowDeco(ctx, t) {
  for (const [x, y, w, h] of WIN) {
    ctx.fillStyle = '#2B2B2B'; ctx.fillRect(x + w / 2 - 12, y, 24, h); ctx.fillRect(x, y + h * 0.3 - 10, w, 20);
    // window letters + neon OPEN
    ctx.save(); ctx.globalAlpha = 0.9; txt(ctx, 'COFFEE & CO.', x + w / 2, y + h * 0.3 + 90, 70, C.yellow); ctx.restore();
    const on = (Math.sin(t * 9) > -0.7) ? 1 : 0.4; ctx.save(); ctx.shadowColor = C.red; ctx.shadowBlur = 40 * on;
    rr(ctx, x + w - 330, y + h - 210, 260, 110, 50); ctx.lineWidth = 12; ctx.strokeStyle = on > 0.5 ? '#FF5A66' : '#B03040'; ctx.stroke();
    txt(ctx, 'OPEN', x + w - 200, y + h - 128, 66, on > 0.5 ? '#FFD0D4' : '#C0606A'); ctx.restore();
  }
}

// ---------- floor + back counter (d = 0.95) ----------
function floor(ctx) {
  ctx.fillStyle = '#C98E5F'; ctx.fillRect(-3000, -60, 6400, 3000);
  ctx.strokeStyle = 'rgba(110,70,40,0.45)'; ctx.lineWidth = 4;
  for (let i = 0, y = -60; i < 22; i++) { y += 26 + i * 12; ctx.beginPath(); ctx.moveTo(-3000, y); ctx.lineTo(3400, y); ctx.stroke(); for (let x = -3000 + (i % 2) * 130; x < 3400; x += 260 + i * 6) { ctx.beginPath(); ctx.moveTo(x, y - 26 - i * 12); ctx.lineTo(x, y); ctx.stroke(); } }
  const g = ctx.createLinearGradient(0, -60, 0, 300); g.addColorStop(0, 'rgba(60,35,20,0.35)'); g.addColorStop(1, 'rgba(60,35,20,0)'); ctx.fillStyle = g; ctx.fillRect(-3000, -60, 6400, 360);
}
function machine(ctx, t, pour) { // espresso machine, base at 0
  rr(ctx, -150, -300, 300, 300, 26); fillStroke(ctx, C.red, 6);
  ctx.save(); rr(ctx, -150, -300, 300, 300, 26); ctx.clip(); ctx.fillStyle = shade(C.red, -0.18); ctx.fillRect(80, -300, 80, 300); ctx.restore();
  rr(ctx, -165, -330, 330, 40, 12); fillStroke(ctx, '#D8D8DC', 5); rr(ctx, -110, -20, 220, 26, 8); fillStroke(ctx, '#B9B9C0', 4);
  ell(ctx, -70, -220, 34, 34); fillStroke(ctx, '#FFFDF8', 5); ctx.save(); ctx.translate(-70, -220); ctx.rotate(-0.8 + Math.sin(t * 3) * 0.1); ctx.fillStyle = INK; ctx.fillRect(-2, -26, 4, 26); ctx.restore();
  ell(ctx, 50, -230, 18, 18); fillStroke(ctx, C.yellow, 4);
  rr(ctx, -30, -150, 80, 40, 10); fillStroke(ctx, '#B9B9C0', 5); rr(ctx, -6, -112, 32, 24, 6); fillStroke(ctx, '#8E8E96', 4);
  // portafilter handle
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(40, -130); ctx.lineTo(120, -122); ctx.stroke();
  // steam wand + puffs
  ctx.lineWidth = 9; ctx.strokeStyle = '#B9B9C0'; ctx.beginPath(); ctx.moveTo(130, -200); ctx.lineTo(170, -60); ctx.stroke();
  for (let i = 0; i < 4; i++) { const u = ((t * 0.8 + i * 0.25) % 1); ctx.fillStyle = `rgba(255,255,255,${0.55 * Math.sin(u * Math.PI)})`; ctx.beginPath(); ctx.arc(-20 - u * 50 + i * 10, -360 - u * 160, 20 + u * 30, 0, 7); ctx.fill(); }
  if (pour > 0) { ctx.strokeStyle = '#5A3220'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(10, -88); ctx.lineTo(10, -88 + 72 * pour); ctx.stroke(); }
  ctx.lineCap = 'butt';
}
function backCounter(ctx, t, S) {
  rr(ctx, 820, -470, 1300, 40, 8); fillStroke(ctx, '#8B5A3C', 5); ctx.fillStyle = '#6E4630'; ctx.fillRect(825, -430, 1290, 400);
  ctx.save(); ctx.translate(1000, -470); machine(ctx, t, S.pour); ctx.restore();
  if (S.cupAt === 'machine') { ctx.save(); ctx.translate(1010, -470); cup(ctx, 0.75); ctx.restore(); }
  // grinder + cup stack
  ctx.save(); ctx.translate(1330, -470); rr(ctx, -50, -200, 100, 200, 14); fillStroke(ctx, '#2B2B2B', 5); ctx.beginPath(); ctx.moveTo(-60, -200); ctx.lineTo(60, -200); ctx.lineTo(40, -300); ctx.lineTo(-40, -300); ctx.closePath(); fillStroke(ctx, '#C9A27E', 5); ctx.restore();
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(1480, -470 - i * 22); cup(ctx, 0.6); ctx.restore(); }
}

// ---------- front counter (hero plane) ----------
function terminal(ctx, t, S) { // payment terminal on its stand, base at 0 (world scale)
  ctx.fillStyle = '#2B2B2B'; rr(ctx, -34, -14, 68, 14, 4); ctx.fill();
  ctx.save(); ctx.translate(0, -12); ctx.rotate(-0.12);
  rr(ctx, -40, -120, 80, 120, 12); fillStroke(ctx, '#2B2B2B', 4); ctx.fillStyle = C.red; ctx.fillRect(-40, -18, 80, 6);
  rr(ctx, -30, -110, 60, 46, 5); const st = S.screen; ctx.fillStyle = st === 'ok' ? '#21A46B' : '#20262E'; ctx.fill();
  ctx.save(); ctx.shadowColor = st === 'ok' ? '#7CFFB5' : '#FFC857'; ctx.shadowBlur = 10;
  txt(ctx, st === 'ok' ? 'OK' : '$5', 0, -80, 22, '#FFFFFF'); ctx.restore();
  ctx.fillStyle = C.yellow; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-24 + c * 18, -56 + r * 13, 12, 8);
  ctx.restore();
  if (st === 'ok') { const g = ctx.createRadialGradient(0, -70, 0, 0, -70, 140); g.addColorStop(0, 'rgba(255,220,120,0.5)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.fillRect(-140, -210, 280, 280); }
}
function pastry(ctx) { // glass case with pastries
  rr(ctx, 0, -230, 380, 230, 14); ctx.fillStyle = 'rgba(210,235,255,0.35)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = '#FFFDF8'; ctx.fillRect(10, -118, 360, 8);
  const p = (x, y, kind) => { if (kind === 0) { ell(ctx, x, y, 44, 22); fillStroke(ctx, '#E9A93A', 4); ctx.strokeStyle = '#B97A26'; ctx.lineWidth = 3; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + i * 16, y - 18); ctx.lineTo(x + i * 16 + 6, y + 18); ctx.stroke(); } }
    else if (kind === 1) { ell(ctx, x, y, 36, 26); fillStroke(ctx, '#F29AC0', 4); ell(ctx, x, y - 4, 10, 6); ctx.fillStyle = '#E9A93A'; ctx.fill(); for (let i = 0; i < 6; i++) { ctx.fillStyle = [C.yellow, '#4D8DFF', '#FFFDF8'][i % 3]; ctx.fillRect(x - 22 + i * 8, y - 16 + (i % 2) * 6, 6, 3); } }
    else { rr(ctx, x - 26, y - 6, 52, 30, 6); fillStroke(ctx, '#C9A27E', 4); ell(ctx, x, y - 10, 34, 22); fillStroke(ctx, '#7A4A2E', 4); } };
  [[70, -150, 0], [190, -148, 1], [310, -150, 2], [80, -40, 2], [200, -36, 0], [310, -38, 1]].forEach(a => p(...a));
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.moveTo(30, -220); ctx.lineTo(80, -220); ctx.lineTo(20, -20); ctx.lineTo(10, -60); ctx.closePath(); ctx.fill();
}
function frontCounter(ctx, t, S) {
  // body: cream panel, red band, yellow kick strip
  ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-60, -320, 1900, 320);
  ctx.fillStyle = '#EDE3D0'; for (let x = -40; x < 1840; x += 70) ctx.fillRect(x, -280, 36, 250);
  ctx.fillStyle = C.red; ctx.fillRect(-60, -320, 1900, 46); ctx.fillStyle = C.yellow; ctx.fillRect(-60, -30, 1900, 30);
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(-60, -320, 1900, 320);
  // top slab
  rr(ctx, -90, -352, 1960, 40, 10); fillStroke(ctx, '#9C6B45', 6); ctx.fillStyle = '#B98457'; ctx.fillRect(-84, -348, 1948, 10);
  // logo roundel on the counter front
  ell(ctx, 920, -160, 70, 70); fillStroke(ctx, C.yellow, 6); ctx.save(); ctx.translate(920, -120); cup(ctx, 0.55); ctx.restore();
  // tip jar, napkins, terminal, pastry case
  ctx.save(); ctx.translate(650, -352); rr(ctx, -34, -90, 68, 90, 14); ctx.fillStyle = 'rgba(210,235,255,0.5)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = '#7FBF8E'; ctx.fillRect(-24, -40, 48, 34); txt(ctx, 'TIPS', 0, -56, 22, INK); ctx.restore();
  ctx.save(); ctx.translate(1300, -352); pastry(ctx); ctx.restore();
  ctx.save(); ctx.translate(TERM[0], TERM[1]); terminal(ctx, t, S); ctx.restore();
}
const TERM = [450, -352];

// ---------- pendant lamps (d = 1.06) ----------
function lamps(ctx, t) {
  for (const [x, len] of [[-500, 380], [300, 300], [1100, 380]]) {
    const sw = Math.sin(t * 1.1 + x) * 0.02; ctx.save(); ctx.translate(x, -2200); ctx.rotate(sw);
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, len); ctx.stroke();
    ctx.translate(0, len); const g = ctx.createRadialGradient(0, 70, 0, 0, 70, 380); g.addColorStop(0, 'rgba(255,214,120,0.55)'); g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 70, 380, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.lineTo(110, 90); ctx.lineTo(-110, 90); ctx.closePath(); fillStroke(ctx, C.yellow, 6);
    ell(ctx, 0, 92, 34, 20); ctx.fillStyle = '#FFF6D8'; ctx.fill(); ctx.restore();
  }
}

// ---------- cast animation ----------
// customer: walks in, orders, takes the cup, taps the card, smiles, walks out
function custState(t) {
  const st = { x: 300, f: 1, P: {} };
  const breathe = Math.sin(t * 2.3) * 3;
  if (t < 1.45) { // walk in from the left
    const u = seg(t, 0, 1.45), x = lerp(-420, 300, E.out(u) * 0.35 + u * 0.65);
    const ph = (x + 420) / 62 * 0.5; st.x = x; st.P = walk(ph * 1.0); st.P.face = { mouth: 'smile', look: [0.6, -0.6], blink: t > 0.9 && t < 1.0 ? 1 : 0 };
    st.P.headTilt = -0.08; return st;
  }
  const P = { hip: [0, -256 + breathe], lean: 0.03, legN: { foot: [16, 0] }, legF: { foot: [-22, 0] }, armN: { hand: [26, -70], grip: 'relax' }, armF: { hand: [-14, -74], grip: 'relax' } };
  const blink = [2.2, 3.9, 5.2, 8.6].some(b => t > b && t < b + 0.1) ? 1 : 0;
  P.face = { mouth: 'smile', look: [0.7, -0.2], blink, brow: 0.2 };
  // order: look up to the menu, point, talk
  const talkOn = t > 1.75 && t < 2.85, tk = talkOn ? Math.abs(Math.sin(t * 15)) * 0.8 + 0.2 : 0;
  if (t < 3.0) {
    const up = k(t, 1.5, 1.8) * (1 - k(t, 2.6, 2.9));
    P.face = { mouth: talkOn ? 'talk' : 'smile', talk: tk, look: [0.6, -0.9 * up], blink, brow: 0.6 * up + 0.2 };
    P.headTilt = -0.12 * up;
    const pt = k(t, 1.65, 1.95) * (1 - k(t, 2.55, 2.9));
    P.armN = { hand: R.mix([26, -70], [150, -470 + Math.sin(t * 8) * 6], pt), grip: pt > 0.4 ? 'point' : 'relax', elbowUp: 0 };
  }
  // waiting, then reaching for the cup with the far hand (over the chest)
  if (t >= 3.0 && t < 4.65) {
    P.face = { mouth: t > 3.9 ? 'grin' : 'smile', look: [1, 0.1], blink, brow: 0.3 };
    P.armN = { hand: [60, -230], grip: 'relax' };
  }
  const reach = k(t, 3.55, 4.05) * (1 - k(t, 4.2, 4.6));
  const custHandW = R.mix(R.toLocal(300, 0, 1, 1, HANDOFF), [70, -330], 1 - reach); // reach out then bring the cup to the chest
  if (t >= 3.55) {
    P.farFront = 1; P.lean = 0.03 + 0.1 * reach;
    const holds = t >= 4.1;
    P.armF = { hand: holds ? R.mix([70, -330], R.toLocal(300, 0, 1, 1, HANDOFF), reach) : R.mix([-14, -74], R.toLocal(300, 0, 1, 1, HANDOFF), reach), grip: holds ? 'hold' : 'open',
      item: holds ? c => { c.save(); c.translate(-6, 56); cup(c, 0.75, { steam: t }); c.restore(); } : null };
  }
  // card: hand to the jacket pocket, out with the card, tap the terminal
  if (t >= 4.65 && t < 7.4) {
    const toPocket = k(t, 4.65, 4.95), up = k(t, 5.05, 5.45), tap = Math.sin(clamp((t - 5.5) / 0.3) * Math.PI) * 14;
    const pocket = [52, -250], term = R.toLocal(300, 0, 1, 1, [TERM[0] + 14, TERM[1] - 100]);
    let h = R.mix([60, -230], pocket, toPocket); h = R.mix(h, [term[0] - tap * 0.4, term[1] + tap], up);
    const hasCard = t > 4.98;
    P.armN = { hand: h, grip: hasCard ? 'pinch' : 'relax', itemOver: hasCard ? c => { c.save(); c.translate(36, -16); c.rotate(0.35); card(c, 0.62); c.restore(); } : null };
    P.face = { mouth: 'smile', look: [0.9, 0.5 * up], blink, brow: 0.2 };
    P.lean = 0.05 + 0.06 * up;
  }
  // smile (close-up), then turn and walk out to the left with the cup
  if (t >= 7.4) {
    const g = k(t, 7.4, 7.6);
    P.face = { mouth: 'grin', happy: g, brow: 0.5, look: [0.4, 0], blush: 1 };
    P.headTilt = Math.sin(clamp((t - 7.5) / 0.5) * Math.PI) * 0.12;
    P.armN = { hand: [60, -220], grip: 'relax' };
    if (t >= 8.05) {
      const wt = t - 8.05, x = 300 - wt * 330 - wt * wt * 60; st.x = x; st.f = -1;
      const w = walk((300 - x) / 62 * 0.5 * 1.0);
      Object.assign(P, w); P.farFront = 0; P.armN = { hand: [70, -330], grip: 'hold', item: c => { c.save(); c.translate(-6, 56); cup(c, 0.75, { steam: t }); c.restore(); } };
      P.face = { mouth: 'grin', happy: 1, look: [0.5, 0], blush: 1 }; delete P.armF.item;
    } else if (t >= 7.95) { // squash on the turn
      st.sq = Math.sin(seg(t, 7.95, 8.05) * Math.PI);
    }
  }
  st.P = P; return st;
}
const HANDOFF = [535, -440];
// barista: listens, nods, turns to the machine, takes the cup, hands it over, waves goodbye
function barState(t) {
  const st = { x: 760, y: -70, f: -1, P: {} }, S = { cupAt: 'machine', pour: 0 };
  const blink = [1.2, 3.3, 6.0, 8.4].some(b => t > b && t < b + 0.1) ? 1 : 0;
  const P = { hip: [0, -256 + Math.sin(t * 2.1 + 1) * 3], lean: 0.12, legN: { foot: [16, 0] }, legF: { foot: [-22, 0] }, armN: { hand: [150, -270], grip: 'open' }, armF: { hand: [120, -262], grip: 'open' } };
  const nod = t > 1.8 && t < 2.7 ? Math.sin((t - 1.8) * 9) * 0.06 : 0;
  P.face = { mouth: t > 2.3 && t < 2.6 ? 'talk' : 'smile', talk: Math.abs(Math.sin(t * 16)), look: [0.8, -0.1], blink, brow: 0.3 }; P.headTilt = nod;
  // wiping the counter at the start
  if (t < 1.7) { P.armN = { hand: [150 + Math.sin(t * 6) * 30, -262 + Math.cos(t * 6) * 6], grip: 'open' }; P.face.look = [0.8, 0.6]; }
  if (t >= 2.55 && t < 3.3) { // to the machine
    st.f = 1; const u = k(t, 2.55, 2.85); st.x = lerp(760, 820, u);
    const r = k(t, 2.75, 3.05); const w = R.toLocal(st.x, st.y, 1, 1, [1010, -520]);
    P.armN = { hand: R.mix([30, -80], w, r), grip: r > 0.8 ? 'hold' : 'open' }; P.face = { mouth: 'smile', look: [0.8, 0.5], blink, brow: 0.1 };
    S.pour = clamp((t - 2.2) / 0.3) * (1 - seg(t, 2.9, 3.0));
    if (t > 3.05) { S.cupAt = 'bar'; P.armN.item = c => { c.save(); c.translate(-4, 56); cup(c, 0.75, { steam: t }); c.restore(); }; }
  }
  if (t < 2.55) S.pour = clamp((t - 2.0) / 0.3);
  if (t >= 3.3) { // back to the customer and hand over
    st.f = -1; st.x = lerp(820, 760, k(t, 3.3, 3.55));
    const r = k(t, 3.45, 3.95) * (1 - k(t, 4.15, 4.55));
    const hw = R.toLocal(st.x, st.y, 1, -1, HANDOFF);
    P.lean = 0.12 + 0.14 * r;
    P.armN = { hand: R.mix([60, -150], hw, r), grip: t < 4.1 ? 'hold' : 'open' };
    if (t < 4.1) { S.cupAt = 'bar'; P.armN.item = c => { c.save(); c.translate(-4, 56); cup(c, 0.75, { steam: t }); c.restore(); }; } else S.cupAt = 'cust';
    P.face = { mouth: t > 3.6 ? 'grin' : 'smile', look: [0.8, 0.2], blink, brow: 0.4 };
    if (t > 4.6) { P.armN = { hand: [120, -262], grip: 'open' }; P.face = { mouth: 'smile', look: [0.8, 0.4], blink, brow: 0.3 }; }
    if (t > 8.1) { const wv = k(t, 8.1, 8.35); P.armN = { hand: R.mix([120, -262], [150, -620 + Math.sin(t * 14) * 12], wv), grip: wv > 0.5 ? 'wave' : 'open', elbowUp: 0 }; P.face = { mouth: 'grin', happy: wv, brow: 0.5, look: [0.8, 0] }; }
  }
  st.P = P; return { st, S };
}
// screen state of the terminal
const screenAt = t => t >= 6.55 ? 'ok' : 'pay';

// ---------- seated patrons ----------
function laptopGuy(ctx, t) { // d = 0.92 by the window
  ctx.save(); ctx.translate(-640, 0);
  // chair
  ctx.lineWidth = 10; ctx.strokeStyle = '#3A2A22'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-60, -170); ctx.lineTo(-70, -420); ctx.moveTo(-60, -170); ctx.lineTo(-60, 0); ctx.moveTo(40, -170); ctx.lineTo(40, 0); ctx.stroke();
  rr(ctx, -80, -186, 140, 26, 8); fillStroke(ctx, '#8B5A3C', 5);
  const ty = Math.sin(t * 14) * 4, ty2 = Math.cos(t * 13) * 4;
  figure(ctx, 0, 0, 1, 1, LAP, { hip: [0, -180], lean: 0.12, legN: { foot: [110, 0] }, legF: { foot: [85, 0] }, armN: { hand: [150, -320 + ty], grip: 'relax' }, armF: { hand: [140, -322 + ty2], grip: 'relax' },
    face: { mouth: 'flat', look: [0.8, 0.8], brow: -0.2, blink: (t % 3.4) > 3.3 ? 1 : 0 }, headTilt: 0.12 });
  // table + laptop
  ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(250, -300); ctx.lineTo(250, 0); ctx.stroke(); rr(ctx, 170, -18, 160, 18, 8); fillStroke(ctx, INK, 0);
  rr(ctx, 90, -318, 320, 24, 10); fillStroke(ctx, '#FFFDF8', 5);
  ctx.save(); ctx.translate(180, -318); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(130, 0); ctx.lineTo(118, -10); ctx.closePath(); fillStroke(ctx, '#B9B9C0', 4);
  ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(-30, -130); ctx.lineTo(-16, -132); ctx.lineTo(6, -4); ctx.closePath(); fillStroke(ctx, '#B9B9C0', 4); ctx.restore();
  // his mug
  ctx.save(); ctx.translate(340, -318); rr(ctx, -22, -50, 44, 50, 8); fillStroke(ctx, C.yellow, 4); ctx.restore();
  ctx.restore();
}
function sipper(ctx, t) { // foreground right (d = 1.35), faces left, sips from a mug
  ctx.save(); ctx.translate(920, 720);
  const cyc = (t + 0.4) % 4.2, up = E.inOut(seg(cyc, 0.6, 1.2)) * (1 - E.inOut(seg(cyc, 2.2, 2.8)));
  ctx.lineWidth = 12; ctx.strokeStyle = '#3A2A22'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-60, -170); ctx.lineTo(-74, -430); ctx.moveTo(-60, -170); ctx.lineTo(-60, 0); ctx.moveTo(40, -170); ctx.lineTo(40, 0); ctx.stroke();
  ctx.save(); ctx.scale(-1, 1); rr(ctx, -80, -186, 140, 26, 8); fillStroke(ctx, '#8B5A3C', 5); ctx.restore();
  const mug = c => { c.save(); c.translate(-4, 30); rr(c, -26, -56, 52, 56, 10); fillStroke(c, '#FFFDF8', 4); c.fillStyle = C.red; c.fillRect(-26, -40, 52, 12); c.restore(); };
  figure(ctx, 0, 0, 1, -1, SIP, { hip: [0, -180], lean: 0.05 - up * 0.05, legN: { foot: [100, 0] }, legF: { foot: [80, 0] },
    armN: { hand: R.mix([150, -300], [92, -420], up), grip: 'hold', item: mug }, armF: { hand: [140, -296], grip: 'relax' },
    face: { mouth: up > 0.7 ? 'sip' : 'smile', happy: up > 0.7 ? 0.8 : 0, look: [0.8, 0.2], blink: (cyc > 3.6 && cyc < 3.7) ? 1 : 0 }, headTilt: -0.1 * up });
  ctx.restore();
  // table in front of her
  ctx.save(); ctx.translate(660, 720); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(0, 0); ctx.stroke();
  rr(ctx, -170, -320, 340, 26, 12); fillStroke(ctx, '#FFFDF8', 6); ctx.save(); ctx.translate(-60, -320); ell(ctx, 0, -6, 60, 12); fillStroke(ctx, '#E9A93A', 4); ctx.restore(); ctx.restore();
}
function plant(ctx, t) { // big foreground leaves, left
  ctx.save(); ctx.translate(-560, 1100);
  rr(ctx, -120, -200, 240, 220, 30); fillStroke(ctx, C.red, 6);
  for (let i = 0; i < 8; i++) { const a = -2.4 + i * 0.32 + Math.sin(t * 0.9 + i) * 0.03; ctx.save(); ctx.translate(0, -180); ctx.rotate(a + Math.PI / 2); ctx.translate(0, -260 - (i % 3) * 60);
    ell(ctx, 0, 0, 70, 150); fillStroke(ctx, i % 2 ? '#2E8B57' : '#3E9E6A', 6); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 140); ctx.lineTo(0, -130); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}

// window light shafts + dust (hero plane, additive)
function light(ctx, t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { const x0 = -1250 + i * 330; ctx.fillStyle = `rgba(255,236,190,${0.07 + 0.02 * Math.sin(t * 0.8 + i)})`;
    ctx.beginPath(); ctx.moveTo(x0, -1600); ctx.lineTo(x0 + 230, -1600); ctx.lineTo(x0 + 900, 400); ctx.lineTo(x0 + 520, 400); ctx.closePath(); ctx.fill(); }
  for (let i = 0; i < 40; i++) { const h = K.hash(i), x = -1200 + h * 2600 + Math.sin(t * 0.4 + i) * 40, y = -1700 + K.hash(i + 50) * 1800 - (t * 20 * (0.5 + h)) % 300;
    ctx.fillStyle = `rgba(255,245,220,${0.25 + 0.25 * Math.sin(t * 2 + i)})`; ctx.beginPath(); ctx.arc(x, y, 3 + h * 4, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- draw the cafe ----------
// passes: 'back' (outside, wall, patrons by the wall, floor, back counter) | 'hero' (barista, counter, customer, lamps) | 'fg' (foreground patron, plant)
function drawCafe(ctx, t, cam, pass, VW, VH) {
  const { st: b, S } = barState(t); S.screen = screenAt(t); if (t >= 4.1) S.cupAt = S.cupAt === 'machine' ? 'cust' : S.cupAt;
  if (pass === 'back') {
    layer(ctx, cam, 0.82, c => wall(c, t), VW, VH);
    drawStreet(ctx, t, cam, VW, VH);
    layer(ctx, cam, 0.82, c => windowDeco(c, t), VW, VH);
    layer(ctx, cam, 0.95, c => { floor(c); backCounter(c, t, S); }, VW, VH);
    layer(ctx, cam, 0.92, c => laptopGuy(c, t), VW, VH);
    return;
  }
  if (pass === 'hero') {
    layer(ctx, cam, 1, c => {
      const BB = b.P; figure(c, b.x, b.y, 1, b.f, BAR, BB);
      frontCounter(c, t, S);
      const cs = custState(t); const sq = cs.sq || 0;
      c.save(); c.translate(cs.x, 0); c.scale(1 + sq * 0.06, 1 - sq * 0.05); figure(c, 0, 0, 1, cs.f, CUST, cs.P); c.restore();
      light(c, t);
    }, VW, VH);
    layer(ctx, cam, 1.06, c => lamps(c, t), VW, VH);
    return;
  }
  if (pass === 'fg') { layer(ctx, cam, 1.35, c => sipper(c, t), VW, VH); layer(ctx, cam, 1.7, c => plant(c, t), VW, VH); }
}
// the street seen through the window: drawn with a clip built in wall space
function drawStreet(ctx, t, cam, VW, VH) {
  ctx.save(); const base = ctx.getTransform();
  const z = REF.z * Math.pow(cam.z / REF.z, 0.82), cx = REF.x + (cam.x - REF.x) * 0.82, cy = REF.y + (cam.y - REF.y) * 0.82;
  ctx.translate(VW / 2 + (cam.shx || 0) * 0.82, VH / 2 + (cam.shy || 0) * 0.82); ctx.rotate((cam.r || 0) * 0.82); ctx.scale(z, z); ctx.translate(-cx, -cy);
  const [x, y, w, h] = WIN[0]; ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.setTransform(base);
  layer(ctx, cam, 0.55, c => street(c, t), VW, VH);
  ctx.restore();
}

module.exports = { drawCafe, drawStreet, layer, REF, TERM, CUST, BAR, custState, screenAt, terminal, txt, cup, card };
