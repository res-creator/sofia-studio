// Episode 14 "The $1,400 Hotel Room" sets, props and cast (on hirkit): Kristine and Jimmy (generic figures, no likeness), the front-desk
// clerk (neutral, never a cartoon villain), the hospitality professor; night-time Nassau (sky, moon, pastel colonial facades with shutters,
// palms, street lamps, string lights), the hotel lobby at night (desk, key wall, monitor), the resort at the end of the street and its desk,
// the booking phone, the 8-night trip tag, the price terminal, the inbox, the TV camera, the website, the slang card, the taxi.
// Generic places, no logos: brand names appear as plain text only.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const SK = require('../scratch_ep11/scankit'); // read-only reuse: suitcase, phone, receipt strip, paper plane, monitor
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, shade, fillStroke, ell, px } = R;

const W = 1080, H = 1920;
const { layer, txt, fitTxt, suitcase, phone, receiptStrip, paperPlane, monitor } = SK;
const CREAM = '#FFFDF8', NAVY = '#2E3A59', GREEN = '#2FA37E', NIGHT = '#141B36';

// ---------- cast (generic figures) ----------
const KRIS = { skin: '#F0C3A2', hair: '#C98A4A', hairStyle: 'long', top: '#E06A6A', cuff: '#C85656', shirt: CREAM, pants: NAVY, shoes: '#F7F5F0', sole: '#C9C1B1', iris: '#4E6B3C', lashes: 1, lips: '#B0504A', brow: '#8A5A2A' };
const JIM = { skin: '#E8B48F', hair: '#4A3222', hairStyle: 'short', top: '#4D8DFF', cuff: '#3A72D9', shirt: CREAM, zip: 1, pants: '#3A3F48', shoes: '#3A2A22', iris: '#3A2414', brow: '#3A2416', beard: 1 };
const CLERK = { skin: '#8D5A3C', hair: '#1E1612', hairStyle: 'short', top: NAVY, collar: CREAM, shirt: CREAM, pants: '#3A3F48', shoes: '#3A2A22', iris: '#3A2414', brow: '#1E1612' };
const PROF = { skin: '#D9A27E', hair: '#B9B4AC', hairStyle: 'short', top: '#6B4A2B', cuff: '#573A20', shirt: '#E9DCC7', pants: '#3A3F48', shoes: '#3A2A22', iris: '#3A2414', glasses: 1, brow: '#8A8580' };

// ---------- night sky with stars and the moon (world rect) ----------
function nightSky(ctx, t, x0 = -4000, x1 = 4000, y0 = -3200, y1 = 0, o = {}) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#0B1028'); g.addColorStop(0.65, '#1C2850'); g.addColorStop(1, '#3B3F6E');
  ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let i = 0; i < 140; i++) { const x = lerp(x0, x1, hash(i * 3.7)), y = lerp(y0, y1 - 600, hash(i * 5.3)), tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.7);
    ctx.fillStyle = `rgba(255,248,225,${(0.35 + 0.5 * tw) * (0.4 + hash(i) * 0.6)})`; ctx.beginPath(); ctx.arc(x, y, 2 + hash(i + 9) * 3, 0, 7); ctx.fill(); }
  if (o.moon !== false) { const [mx, my] = o.moonAt || [600, -1900], mr = o.moonR || 120; LT.glow(ctx, mx, my, mr * 4, 'rgba(255,240,200,1)', 0.25);
    CL.cutout(ctx, () => ell(ctx, mx, my, mr, mr), '#FFF3D0', { elev: 0.5, lw: 0 }); ell(ctx, mx - mr * 0.3, my + mr * 0.2, mr * 0.18, mr * 0.18); ctx.fillStyle = 'rgba(200,180,140,0.35)'; ctx.fill();
    ell(ctx, mx + mr * 0.35, my - mr * 0.25, mr * 0.12, mr * 0.12); ctx.fill(); }
}
// ---------- palm tree (base at x, y; sway in radians) ----------
function palm(ctx, x, y, s = 1, sway = 0, col = '#2E7D5B') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const top = [Math.sin(sway) * 120 + 60, -900];
  ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const u0 = i / 12, u1 = (i + 1) / 12, p = u => [lerp(0, top[0], u * u), lerp(0, top[1], u)];
    const a = p(u0), b = p(u1); ctx.strokeStyle = INK; ctx.lineWidth = lerp(64, 36, u0) + px(ctx, 5) * 2; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    ctx.strokeStyle = i % 2 ? '#7A5A3A' : '#8A6A48'; ctx.lineWidth = lerp(64, 36, u0); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
  ctx.translate(...top);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.55 + Math.sin(sway * 3 + i) * 0.05, L = 330 + (i % 2) * 60;
    ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.5, -70, L, 40 + Math.abs(i - 3) * 30); ctx.quadraticCurveTo(L * 0.5, 30, 0, 0); ctx.closePath();
    fillStroke(ctx, i % 2 ? col : shade(col, 0.15), 4.5); ctx.strokeStyle = shade(col, -0.35); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, 0); ctx.quadraticCurveTo(L * 0.5, -25, L * 0.95, 34 + Math.abs(i - 3) * 30); ctx.stroke(); ctx.restore(); }
  for (const [cx, cy] of [[-18, 14], [16, 18], [0, 30]]) { ell(ctx, cx, cy, 20, 20); fillStroke(ctx, '#5A3A22', 4); }
  ctx.restore();
}
// ---------- street lamp (base at x, y), light pool on the ground ----------
function lamp(ctx, x, y, on = 1) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#20232A'; ctx.fillRect(-10, -760, 20, 760); rr(ctx, -26, -40, 52, 40, 6); fillStroke(ctx, '#20232A', 4);
  ctx.beginPath(); ctx.moveTo(-60, -760); ctx.lineTo(60, -760); ctx.lineTo(36, -820); ctx.lineTo(-36, -820); ctx.closePath(); fillStroke(ctx, '#20232A', 4);
  ell(ctx, 0, -750, 34, 16); ctx.fillStyle = on ? '#FFE3A0' : '#55585E'; ctx.fill();
  ctx.restore();
  if (on) { LT.glow(ctx, x, y - 750, 260, 'rgba(255,214,140,1)', 0.45 * on); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.16 * on;
    const g = ctx.createLinearGradient(0, y - 750, 0, y); g.addColorStop(0, 'rgba(255,214,140,1)'); g.addColorStop(1, 'rgba(255,214,140,0.2)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x - 30, y - 750); ctx.lineTo(x + 30, y - 750); ctx.lineTo(x + 260, y); ctx.lineTo(x - 260, y); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 * on; ell(ctx, x, y + 10, 300, 50); ctx.fillStyle = 'rgba(255,200,120,1)'; ctx.fill(); ctx.restore(); }
}
// ---------- colonial facade (base centre at x, y): pastel walls, shutters, balcony, hip roof. lit: which windows glow ----------
const PASTEL = ['#E99A96', '#EFC86E', '#8FC9AE', '#8DB4DE', '#F1B98A', '#C8A6D8'];
function facade(ctx, x, y, w, h, col, seed = 1, o = {}) {
  ctx.save(); ctx.translate(x, y);
  const nite = o.night ?? 0.45, wall = shade(col, -nite), wallD = shade(col, -nite - 0.15);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h, w, h, 4), wall, { elev: 1, tex: 0.5 });
  ctx.fillStyle = wallD; ctx.fillRect(-w / 2, -h, w, 30); ctx.fillRect(-w / 2, -h * 0.5 - 10, w, 18); // cornices
  // hip roof
  ctx.beginPath(); ctx.moveTo(-w / 2 - 30, -h); ctx.lineTo(-w / 2 + 70, -h - 170); ctx.lineTo(w / 2 - 70, -h - 170); ctx.lineTo(w / 2 + 30, -h); ctx.closePath(); fillStroke(ctx, shade('#9A4A3A', -nite * 0.6), 5);
  const cols = Math.max(2, Math.round(w / 230)), floors = 2, ww = 100, wh = 170;
  for (let f = 0; f < floors; f++) for (let i = 0; i < cols; i++) {
    const cx = -w / 2 + (i + 0.5) * w / cols, cy = -h * (f === 0 ? 0.25 : 0.72), lit = (o.lit || []).includes(f * cols + i) || hash(seed * 17 + f * 5 + i) < (o.litP ?? 0.25);
    if (f === 0 && i === Math.floor(cols / 2) && o.door !== false) { rr(ctx, cx - 70, -250, 140, 250, 6); fillStroke(ctx, shade('#3E2A1E', -0.2), 4.5); ctx.fillStyle = 'rgba(255,214,140,0.25)'; if (lit) ctx.fillRect(cx - 60, -240, 120, 30); continue; }
    rr(ctx, cx - ww / 2, cy - wh / 2, ww, wh, 4); fillStroke(ctx, lit ? '#FFD38A' : '#1E2338', 4);
    if (lit) LT.glow(ctx, cx, cy, 160, 'rgba(255,200,120,1)', 0.35);
    // louvred shutters (open)
    for (const sx of [-1, 1]) { ctx.save(); ctx.translate(cx + sx * (ww / 2 + 30), cy); rr(ctx, -26, -wh / 2, 52, wh, 3); fillStroke(ctx, shade(o.shutter || '#3E8A6A', -nite), 3.5);
      ctx.strokeStyle = shade(o.shutter || '#3E8A6A', -nite - 0.2); ctx.lineWidth = 3; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(-20, -wh / 2 + 16 + k * 22); ctx.lineTo(20, -wh / 2 + 22 + k * 22); ctx.stroke(); } ctx.restore(); }
  }
  if (o.balcony !== false) { const by = -h * 0.5 + 10; ctx.fillStyle = shade('#E9E2D2', -nite); ctx.fillRect(-w / 2 + 20, by, w - 40, 16); ctx.strokeStyle = shade('#E9E2D2', -nite); ctx.lineWidth = 6;
    for (let bx = -w / 2 + 30; bx < w / 2 - 20; bx += 26) { ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - 70); ctx.stroke(); } ctx.fillRect(-w / 2 + 20, by - 80, w - 40, 12); }
  if (o.sign) { const sy = -h * 0.5 - 140; CL.cutout(ctx, () => rr(ctx, -o.sign.w / 2, sy - 50, o.sign.w, 100, 12), o.sign.col || CREAM, { elev: 1.2 }); fitTxt(ctx, o.sign.text, 0, sy + 18, 54, o.sign.fg || INK, o.sign.w - 30); if (o.sign.glow) LT.glow(ctx, 0, sy, o.sign.w * 0.8, o.sign.glow, 0.35); }
  ctx.restore();
}
// string of party bulbs between two points (sagging)
function bulbs(ctx, a, b, t, n = 14, sag = 120) {
  ctx.strokeStyle = '#20232A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...a); ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag * 2, ...b); ctx.stroke();
  for (let i = 1; i < n; i++) { const u = i / n, x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * (a[0] + b[0]) / 2 + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * ((a[1] + b[1]) / 2 + sag * 2) + u * u * b[1];
    const on = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.9), col = ['#FFC857', '#E63946', '#8FD3FF', '#9BE59B'][i % 4];
    ell(ctx, x, y + 10, 9, 12); ctx.fillStyle = col; ctx.fill(); LT.glow(ctx, x, y + 10, 40, col, 0.35 * on); }
}
// ---------- Nassau street at night (street level y = 0, world x -3000..3600). o.resort: the resort at the far right end ----------
function street(ctx, t, o = {}) {
  nightSky(ctx, t, -4000, 6000, -3400, 0, { moonAt: o.moonAt || [300, -2100], moonR: 130 });
  // far hills + harbour lights
  ctx.fillStyle = '#20284A'; ctx.beginPath(); ctx.moveTo(-4000, -700); for (let x = -4000; x <= 6000; x += 400) ctx.lineTo(x, -760 - 120 * Math.sin(x * 0.0013) - 60 * hash(x)); ctx.lineTo(6000, 0); ctx.lineTo(-4000, 0); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 40; i++) { const x = -4000 + hash(i * 7) * 10000, y = -680 + hash(i * 3) * 80; ctx.fillStyle = 'rgba(255,214,140,0.8)'; ctx.fillRect(x, y, 8, 8); }
  const B = o.buildings || [[-2600, 760, 1150], [-1800, 700, 1050], [-1050, 720, 1250], [-300, 680, 1000], [450, 760, 1180], [1250, 700, 1080], [2000, 760, 1200], [2800, 700, 1050]];
  B.forEach(([x, w, h], i) => facade(ctx, x, -150, w, h, PASTEL[i % PASTEL.length], i + 1, { litP: o.litP ?? 0.18, night: 0.42, shutter: ['#3E8A6A', '#4D7FB8', '#B85A4A'][i % 3] }));
  if (o.resort) resort(ctx, o.resort[0], -150, t, o.resortO || {});
  // sidewalk + road
  ctx.fillStyle = '#4A4E5C'; ctx.fillRect(-4000, -150, 10000, 150); ctx.fillStyle = '#6A6E7C'; ctx.fillRect(-4000, -150, 10000, 14);
  ctx.fillStyle = '#272B36'; ctx.fillRect(-4000, 0, 10000, 900); ctx.fillStyle = '#8A8E9A'; ctx.fillRect(-4000, 0, 10000, 16);
  ctx.fillStyle = 'rgba(255,248,225,0.35)'; for (let x = -4000; x < 6000; x += 300) ctx.fillRect(x, 420, 160, 16);
  for (let x = -2900; x < 3600; x += 950) lamp(ctx, x, -20, 1);
  for (let x = -2400; x < 3600; x += 1250) palm(ctx, x + 380, -60, 0.95, Math.sin(t * 0.8 + x) * 0.06, '#2C6E52');
  if (o.bulbs !== false) for (let x = -2900; x < 3000; x += 950) bulbs(ctx, [x, -760], [x + 950, -760], t, 12, 50);
}
// the resort at the end of the street: wide, lit, turquoise and yellow, the name as plain text on a lit sign. o.oneLeft: 0..1 (one window lights)
function resort(ctx, x, y, t, o = {}) {
  ctx.save(); ctx.translate(x, y); const w = 1500, h = 1400;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h, w, h, 6), '#3E8E96', { elev: 1, tex: 0.5 });
  ctx.fillStyle = '#2F737A'; ctx.fillRect(-w / 2, -h, w, 40);
  for (let f = 0; f < 4; f++) for (let i = 0; i < 6; i++) { const cx = -w / 2 + 125 + i * 250, cy = -h + 300 + f * 260, one = o.oneLeft > 0 && f === 1 && i === 4;
    rr(ctx, cx - 70, cy - 80, 140, 160, 6); fillStroke(ctx, one ? '#FFE9A8' : (hash(f * 9 + i) < 0.92 ? '#FFC870' : '#1E2338'), 4);
    if (!one) { ctx.fillStyle = 'rgba(60,30,10,0.18)'; ctx.fillRect(cx - 70, cy - 80, 140, 160); }
    ctx.fillStyle = '#E9E2D2'; ctx.fillRect(cx - 90, cy + 80, 180, 14); }
  // the sign
  CL.cutout(ctx, () => rr(ctx, -560, -h - 230, 1120, 190, 26), '#FFC857', { elev: 1.4 }); fitTxt(ctx, 'MARGARITAVILLE', 0, -h - 105, 120, '#1E5E66', 1040);
  LT.glow(ctx, 0, -h - 130, 900, 'rgba(255,200,87,1)', 0.35 + 0.05 * Math.sin(t * 4));
  // entrance
  rr(ctx, -160, -330, 320, 330, 10); fillStroke(ctx, '#FFD38A', 5); LT.glow(ctx, 0, -160, 360, 'rgba(255,200,120,1)', 0.4);
  ctx.restore();
  if (o.oneLeft > 0) { const cx = x - w / 2 + 125 + 4 * 250, cy = y - h + 300 + 260; LT.glow(ctx, cx, cy, 300, 'rgba(255,240,170,1)', 0.6 * o.oneLeft); }
}
// ---------- the hotel lobby at night (floor y = 0; desk front at x 0). o: { sign, keys: hooks filled 0..1, empty: n hooks emptied, resort } ----------
function lobby(ctx, t, o = {}) {
  const rs = o.resort, wall = rs ? '#D9C79E' : '#CBBFAE', wallD = shade(wall, -0.15);
  ctx.fillStyle = wall; ctx.fillRect(-3000, -2600, 6000, 2600);
  ctx.fillStyle = wallD; for (let x = -3000; x < 3000; x += 240) ctx.fillRect(x, -2600, 8, 2600);
  ctx.fillStyle = rs ? '#B88E5A' : '#8C7A66'; ctx.fillRect(-3000, -260, 6000, 260); ctx.fillStyle = shade(rs ? '#B88E5A' : '#8C7A66', -0.2); ctx.fillRect(-3000, -268, 6000, 12);
  // the window on the left: night street outside
  ctx.save(); rr(ctx, -2300, -1700, 900, 1250, 8); ctx.clip(); nightSky(ctx, t, -2300, -1400, -1700, -450, { moonAt: [-1650, -1450], moonR: 60 }); palm(ctx, -1800, -380, 0.6, Math.sin(t) * 0.05, '#20503C'); ctx.restore();
  rr(ctx, -2300, -1700, 900, 1250, 8); ctx.lineWidth = px(ctx, 14); ctx.strokeStyle = '#5A4632'; ctx.stroke(); ctx.fillStyle = '#5A4632'; ctx.fillRect(-1858, -1700, 16, 1250);
  // wall sign (plain text)
  if (o.sign) { CL.cutout(ctx, () => rr(ctx, -520, -1980, 1040, 200, 16), rs ? '#1E5E66' : '#2E3A59', { elev: 1.2 }); fitTxt(ctx, o.sign, 0, -1852, 100, rs ? '#FFC857' : CREAM, 960); LT.glow(ctx, 0, -1880, 700, 'rgba(255,230,180,1)', 0.18); }
  // key wall (pigeonholes) behind the desk
  const cols = 8, rows = 3, cw = 150, rh = 150, x0 = 600, y0 = -1660;
  CL.cutout(ctx, () => rr(ctx, x0 - 30, y0 - 30, cols * cw + 60, rows * rh + 60, 10), '#6B4A2B', { elev: 1 });
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, x = x0 + c * cw, y = y0 + r * rh; rr(ctx, x + 8, y + 8, cw - 16, rh - 16, 4); ctx.fillStyle = '#3E2A1E'; ctx.fill();
    const has = i >= (o.empty ?? 0) && (o.keys ?? 1) > 0; if (has) { ctx.fillStyle = '#E8C66A'; ctx.fillRect(x + cw / 2 - 5, y + 30, 10, 60); ell(ctx, x + cw / 2, y + 30, 18, 18); ctx.lineWidth = 6; ctx.strokeStyle = '#E8C66A'; ctx.stroke();
      rr(ctx, x + cw / 2 - 24, y + 90, 48, 34, 5); ctx.fillStyle = rs ? '#3E8E96' : '#E06A6A'; ctx.fill(); } }
  // potted palm + lamp glow
  palm(ctx, 2200, 0, 0.75, Math.sin(t * 0.5) * 0.03, '#3E8E5A'); rr(ctx, 2090, -180, 220, 180, 20); fillStroke(ctx, '#B85A4A', 4.5);
  LT.glow(ctx, 0, -2000, 1400, 'rgba(255,220,160,1)', 0.18);
  ctx.fillStyle = rs ? '#C8B38A' : '#B8AC98'; ctx.fillRect(-3000, 0, 6000, 1400); ctx.fillStyle = 'rgba(0,0,0,0.08)'; for (let x = -3000; x < 3000; x += 300) ctx.fillRect(x, 0, 6, 1400);
}
// the front desk (front at y = 0, top at -420, centred at x): drawn in front of the clerk. o: { bell, resort }
function desk(ctx, x, w = 1500, o = {}) {
  ctx.save(); ctx.translate(x, 0); const col = o.resort ? '#1E5E66' : '#5A3C26';
  CL.cutout(ctx, () => rr(ctx, -w / 2, -420, w, 420, 10), col, { elev: 1.4 });
  ctx.fillStyle = shade(col, 0.15); ctx.fillRect(-w / 2, -420, w, 40); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(-w / 2, -420, w, 40);
  ctx.fillStyle = shade(col, -0.2); for (let i = 1; i < 5; i++) ctx.fillRect(-w / 2 + i * w / 5 - 4, -380, 8, 380);
  if (o.label) { CL.cutout(ctx, () => rr(ctx, -260, -300, 520, 110, 12), CREAM, { elev: 0.8 }); fitTxt(ctx, o.label, 0, -228, 52, INK, 480); }
  if (o.bell !== false) { ctx.save(); ctx.translate(w * 0.3, -420); ell(ctx, 0, 0, 60, 14); fillStroke(ctx, '#C9CED6', 4); ctx.beginPath(); ctx.arc(0, -4, 44, Math.PI, 0); ctx.closePath(); fillStroke(ctx, '#E8C66A', 4); ell(ctx, 0, -52, 10, 8); fillStroke(ctx, '#C9CED6', 3); ctx.restore(); }
  ctx.restore();
}
// desk monitor seen from the side of the guest (back of the screen) or front; screen(ctx, w, h)
function deskMonitor(ctx, x, y, s, screen) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); monitor(ctx, 360, 230, screen); ctx.restore(); }
// availability screen: rows of room numbers, all red; big 0 ROOMS
function roomsScreen(ctx, w, h, u = 1) {
  ctx.fillStyle = '#1B2236'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = NAVY; ctx.fillRect(0, 0, w, 44); fitTxt(ctx, 'ROOMS TONIGHT', w / 2, 30, 24, CREAM, w - 20);
  for (let i = 0; i < 12; i++) { const x = 14 + (i % 4) * (w - 28) / 4, y = 56 + Math.floor(i / 4) * 40, on = u > i / 12; rr(ctx, x + 3, y, (w - 28) / 4 - 6, 32, 5); ctx.fillStyle = on ? C.red : '#4A5068'; ctx.fill(); fitTxt(ctx, String(101 + i), x + (w - 28) / 8, y + 23, 18, CREAM, 60); }
  if (u >= 1) { ctx.fillStyle = 'rgba(230,57,70,0.92)'; rr(ctx, 20, h - 64, w - 40, 52, 10); ctx.fill(); fitTxt(ctx, '0 AVAILABLE', w / 2, h - 26, 34, CREAM, w - 60); }
}

// ---------- booking on the phone: hotel, 1 night, PAID stamp ----------
function bookingScreen(ctx, w, h, o = {}) {
  ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = NAVY; ctx.fillRect(0, 0, w, 64); fitTxt(ctx, 'BOOKING CONFIRMED', w / 2, 42, 22, CREAM, w - 24);
  ell(ctx, w / 2, 130, 40, 40); ctx.fillStyle = GREEN; ctx.fill(); ctx.strokeStyle = CREAM; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(w / 2 - 18, 130); ctx.lineTo(w / 2 - 4, 146); ctx.lineTo(w / 2 + 20, 114); ctx.stroke();
  fitTxt(ctx, 'COURTYARD', w / 2, 210, 30, INK, w - 30); fitTxt(ctx, 'BY MARRIOTT · NASSAU', w / 2, 240, 15, '#5A5450', w - 30);
  ctx.fillStyle = '#E9E2D2'; rr(ctx, 16, 262, w - 32, 70, 10); ctx.fill(); fitTxt(ctx, 'NIGHT 1 · 1 ROOM', w / 2, 306, 20, INK, w - 50);
  if ((o.paid ?? 1) > 0) { ctx.save(); ctx.translate(w / 2, 385); const p = o.paid ?? 1; ctx.scale(lerp(2, 1, E.out(clamp(p))), lerp(2, 1, E.out(clamp(p)))); ctx.globalAlpha *= clamp(p * 2); ctx.rotate(-0.12);
    ctx.strokeStyle = GREEN; ctx.lineWidth = 6; rr(ctx, -84, -32, 168, 60, 8); ctx.stroke(); txt(ctx, 'PREPAID', 0, 13, 36, GREEN); ctx.restore(); }
  if (o.sold > 0) { ctx.save(); ctx.translate(w / 2, 250); const p = o.sold; ctx.scale(lerp(2.4, 1, E.out(clamp(p))), lerp(2.4, 1, E.out(clamp(p)))); ctx.globalAlpha *= clamp(p * 2); ctx.rotate(-0.2);
    ctx.fillStyle = 'rgba(255,253,248,0.6)'; rr(ctx, -100, -42, 200, 80, 10); ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 8; rr(ctx, -100, -42, 200, 80, 10); ctx.stroke(); txt(ctx, 'SOLD OUT', 0, 14, 38, C.red); ctx.restore(); }
}
// ---------- the trip tag (luggage tag with 8 night boxes) ----------
function tripTag(ctx, s, u, o = {}) { // u: 0..1 boxes filled
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-420, -150); ctx.lineTo(380, -150); ctx.lineTo(440, -90); ctx.lineTo(440, 150); ctx.lineTo(-420, 150); ctx.closePath(); }, '#FFE6A8', { elev: 1.4 });
  ell(ctx, 400, -96, 14, 14); ctx.fillStyle = 'rgba(40,25,10,0.6)'; ctx.fill();
  txt(ctx, '8-DAY TRIP', -400, -90, 46, INK, 'left'); txt(ctx, 'NASSAU', 340, -90, 34, '#5A5450', 'right');
  for (let i = 0; i < 8; i++) { const x = -400 + i * 104, a = clamp((u * 8 - i) * 1.5); if (a <= 0) continue; ctx.save(); ctx.globalAlpha *= a;
    rr(ctx, x, -50, 92, 120, 10); fillStroke(ctx, i === 0 ? CREAM : '#8FD3C8', 4); txt(ctx, `N${i + 1}`, x + 46, -14, 26, '#5A5450');
    if (i === 0) { ctx.save(); ctx.translate(x + 46, 34); ctx.rotate(-0.25); ctx.strokeStyle = GREEN; ctx.lineWidth = 4; rr(ctx, -40, -16, 80, 32, 5); ctx.stroke(); txt(ctx, 'PAID', 0, 9, 22, GREEN); ctx.restore(); }
    else { ctx.save(); ctx.translate(x + 46, 34); palmIcon(ctx, 0.28); ctx.restore(); } ctx.restore(); }
  if (u > 0.2) { txt(ctx, 'HOTEL', -354, 108, 22, INK); txt(ctx, 'RESORT · 7 NIGHTS', 30, 108, 24, INK); }
  ctx.restore();
}
function palmIcon(ctx, s) { ctx.save(); ctx.scale(s, s); ctx.strokeStyle = '#7A5A3A'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 60); ctx.quadraticCurveTo(10, 0, 0, -40); ctx.stroke();
  ctx.fillStyle = '#2E7D5B'; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(0, -40); ctx.rotate(-Math.PI / 2 + (i - 2) * 0.7); ell(ctx, 50, 0, 50, 14); ctx.fill(); ctx.restore(); } ctx.restore(); }

// ---------- price terminal printing the receipt ----------
function terminal(ctx, s = 1) { ctx.save(); ctx.scale(s, s); rr(ctx, -300, -40, 600, 160, 30); fillStroke(ctx, '#3A3F48', 5); rr(ctx, -240, -52, 480, 26, 10); fillStroke(ctx, '#20232A', 4); ell(ctx, 220, 50, 14, 14); ctx.fillStyle = '#7BE495'; ctx.fill(); ctx.restore(); }

// ---------- inbox on a laptop/phone: sent emails, no replies ----------
function inboxScreen(ctx, w, h, n, o = {}) {
  ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = NAVY; ctx.fillRect(0, 0, w, 64); fitTxt(ctx, 'SENT', w / 2, 42, 24, CREAM, w - 20);
  for (let i = 0; i < n; i++) { const y = 80 + i * 78; ctx.fillStyle = CREAM; rr(ctx, 12, y, w - 24, 68, 10); ctx.fill(); ctx.strokeStyle = 'rgba(90,84,80,0.3)'; ctx.lineWidth = 2; ctx.stroke();
    fitTxt(ctx, i ? `${'RE: '.repeat(Math.min(i, 3))}HELP PLEASE` : 'HELP PLEASE', 24, y + 28, 15, INK, w - 48, 'left'); fitTxt(ctx, 'sent · waiting for a reply', 24, y + 52, 13, '#5A5450', w - 48, 'left'); }
  if (o.replies != null) { ctx.fillStyle = 'rgba(46,58,89,0.92)'; rr(ctx, 20, h - 82, w - 40, 62, 12); ctx.fill(); fitTxt(ctx, `REPLIES: ${o.replies}`, w / 2, h - 40, 28, C.yellow, w - 60); }
}
// ---------- news camera on a tripod (side view, lens to +x, base at 0) ----------
function tvCamera(ctx, s = 1, t = 0, o = {}) {
  ctx.save(); ctx.scale(s, s); ctx.strokeStyle = '#20232A'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  for (const dx of [-120, 0, 120]) { ctx.beginPath(); ctx.moveTo(0, -420); ctx.lineTo(dx, 0); ctx.stroke(); }
  rr(ctx, -170, -620, 300, 190, 24); fillStroke(ctx, '#3A3F48', 5); rr(ctx, 120, -590, 120, 130, 16); fillStroke(ctx, '#20232A', 5); ell(ctx, 240, -525, 22, 60); fillStroke(ctx, '#5A7FB8', 4);
  rr(ctx, -150, -680, 160, 60, 10); fillStroke(ctx, '#20232A', 4);
  const rec = Math.sin(t * 6) > -0.2; ell(ctx, -100, -580, 14, 14); ctx.fillStyle = rec ? C.red : '#5A2A2A'; ctx.fill(); if (rec) LT.glow(ctx, -100, -580, 60, 'rgba(255,60,60,1)', 0.5);
  if (o.label) { CL.cutout(ctx, () => rr(ctx, -150, -540, 250, 70, 10), CREAM, { elev: 0.5, tex: 0 }); fitTxt(ctx, o.label, -25, -495, 30, INK, 230); }
  ctx.restore();
}
// ---------- website page (browser window), centred ~ 820 x 900 ----------
function website(ctx, s, u, t) {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => rr(ctx, -420, -460, 840, 920, 22), CREAM, { elev: 1.6, tex: 0.3 });
  ctx.fillStyle = '#D9D3C6'; rr(ctx, -420, -460, 840, 70, 22); ctx.fill(); ctx.fillRect(-420, -420, 840, 30);
  for (let i = 0; i < 3; i++) { ell(ctx, -380 + i * 34, -424, 11, 11); ctx.fillStyle = ['#E06A6A', '#FFC857', '#7BE495'][i]; ctx.fill(); }
  ctx.fillStyle = CREAM; rr(ctx, -260, -444, 560, 40, 20); ctx.fill(); fitTxt(ctx, 'MARRIOTT WEBSITE · AS REVIEWED BY NBC', 20, -416, 20, '#5A5450', 520);
  txt(ctx, 'OVERBOOKING', 0, -280, 72, INK); txt(ctx, 'mentioned once:', 0, -210, 40, '#5A5450'); ctx.fillStyle = 'rgba(90,84,80,0.25)'; for (let i = 0; i < 3; i++) ctx.fillRect(-340, -150 + i * 40, 680 - (i % 2) * 120, 18);
  // the one promise: highlighted, with the elite card
  const hl = clamp(u * 1.4); ctx.fillStyle = `rgba(255,200,87,${0.6 * hl})`; rr(ctx, -360, 10, 720, 150, 16); ctx.fill();
  txt(ctx, 'A NEW ROOM IS PROMISED', 0, 72, 46, INK); txt(ctx, 'TO ELITE MEMBERS', 0, 132, 46, hl > 0.5 ? C.red : INK);
  // elite card vs a regular booking
  ctx.save(); ctx.translate(-190, 320); ctx.rotate(-0.08); CL.cutout(ctx, () => rr(ctx, -150, -90, 300, 180, 16), '#E8C66A', { elev: 1.2 }); txt(ctx, 'ELITE', 0, -10, 52, '#5A3C10'); txt(ctx, 'MEMBER', 0, 40, 32, '#5A3C10');
  if (u > 0.5) { ctx.strokeStyle = GREEN; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(90, 50); ctx.lineTo(120, 80); ctx.lineTo(170, 10); ctx.stroke(); } ctx.restore();
  ctx.save(); ctx.translate(200, 320); ctx.rotate(0.06); CL.cutout(ctx, () => rr(ctx, -150, -90, 300, 180, 16), '#E9E2D2', { elev: 1.2 }); txt(ctx, 'REGULAR', 0, -6, 46, INK); txt(ctx, 'BOOKING', 0, 40, 32, INK);
  if (u > 0.7) { ctx.fillStyle = '#5A5450'; txt(ctx, '?', 150, 30, 120, C.red); } ctx.restore();
  ctx.restore();
}
// ---------- slang card (dictionary entry) ----------
function slangCard(ctx, s, u) {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => rr(ctx, -460, -230, 920, 460, 20), CREAM, { elev: 1.8 });
  ctx.fillStyle = 'rgba(90,84,80,0.15)'; for (let i = 0; i < 6; i++) ctx.fillRect(-430, -150 + i * 64, 860, 3);
  txt(ctx, 'walked', -400, -90, 110, INK, 'left'); txt(ctx, '(hotel slang)', 40, -96, 40, '#5A5450', 'left');
  if (u > 0) { ctx.save(); ctx.globalAlpha *= clamp(u * 2); fitTxt(ctx, 'sent to another hotel', -400, 30, 64, NAVY, 820, 'left'); fitTxt(ctx, 'because yours is full', -400, 110, 64, NAVY, 820, 'left'); ctx.restore(); }
  ctx.fillStyle = C.red; ctx.fillRect(-400, -60, 330 * clamp(u * 3), 10);
  ctx.restore();
}
// ---------- taxi (side view, faces +x, wheels on 0, ~620 long) ----------
function taxi(ctx, s = 1, rot = 0, o = {}) {
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-300, -60); ctx.lineTo(-300, -170); ctx.lineTo(-150, -190); ctx.lineTo(-90, -300); ctx.lineTo(130, -300); ctx.lineTo(200, -190); ctx.lineTo(310, -170); ctx.lineTo(310, -60); ctx.closePath(); fillStroke(ctx, '#FFC857', 5);
  ctx.fillStyle = '#2C3A4E'; ctx.beginPath(); ctx.moveTo(-130, -190); ctx.lineTo(-80, -280); ctx.lineTo(10, -280); ctx.lineTo(10, -190); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(30, -190); ctx.lineTo(30, -280); ctx.lineTo(120, -280); ctx.lineTo(176, -190); ctx.closePath(); ctx.fill();
  ctx.fillStyle = INK; for (let i = 0; i < 8; i++) ctx.fillRect(-280 + i * 70, -130, 35, 22);
  rr(ctx, -60, -350, 140, 50, 8); fillStroke(ctx, CREAM, 4); txt(ctx, 'TAXI', 10, -312, 34, INK);
  if (o.label) { CL.cutout(ctx, () => rr(ctx, -220, -110, 440, 70, 10), CREAM, { elev: 0.5, tex: 0 }); fitTxt(ctx, o.label, 0, -62, 34, C.red, 420); }
  for (const x of [-190, 200]) { ctx.save(); ctx.translate(x, -40); ell(ctx, 0, 0, 62, 62); fillStroke(ctx, '#262629', 5); ctx.rotate(rot); ell(ctx, 0, 0, 30, 30); fillStroke(ctx, '#C9CED6', 4); ctx.fillStyle = '#5A6068'; ctx.fillRect(-4, -28, 8, 56); ctx.restore(); }
  ell(ctx, 300, -150, 20, 14); ctx.fillStyle = '#FFF3C0'; ctx.fill(); LT.glow(ctx, 330, -150, 120, 'rgba(255,240,180,1)', 0.4);
  ctx.restore();
}
// ---------- refund notice (paper envelope + card) ----------
function refundCard(ctx, s, u) {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => rr(ctx, -440, -300, 880, 600, 20), CREAM, { elev: 1.8 });
  ctx.fillStyle = NAVY; rr(ctx, -440, -300, 880, 110, 20); ctx.fill(); ctx.fillRect(-440, -220, 880, 30); txt(ctx, 'MARRIOTT RESPONDED', 0, -228, 46, CREAM);
  const rows = [['THE EXTRA NIGHT', '$1,400'], ['PLUS THE ORIGINAL ROOM', 'PREPAID STAY']];
  rows.forEach(([a, b], i) => { const v = clamp(u * 2 - i * 0.6); if (v <= 0) return; ctx.save(); ctx.globalAlpha *= v; const y = -110 + i * 150;
    txt(ctx, a, -400, y, 40, '#5A5450', 'left'); fitTxt(ctx, b, 400, y + 95, 80, i ? GREEN : INK, 560, 'right'); ctx.fillStyle = 'rgba(90,84,80,0.3)'; ctx.fillRect(-400, y + 100, 800, 4); ctx.restore(); });
  if (u > 0.85) { ctx.save(); ctx.translate(150, 220); const p = E.back(seg(u, 0.85, 1), 2.4); ctx.scale(p, p); ctx.rotate(-0.12); ctx.strokeStyle = GREEN; ctx.lineWidth = 12; rr(ctx, -240, -60, 480, 120, 14); ctx.stroke(); fitTxt(ctx, 'AGREED TO REPAY', 0, 30, 70, GREEN, 460); ctx.restore(); }
  ctx.restore();
}

module.exports = { W, H, layer, txt, fitTxt, suitcase, phone, receiptStrip, paperPlane, monitor, CREAM, NAVY, GREEN, NIGHT,
  KRIS, JIM, CLERK, PROF, nightSky, palm, lamp, facade, bulbs, street, resort, lobby, desk, deskMonitor, roomsScreen,
  bookingScreen, tripTag, palmIcon, terminal, inboxScreen, tvCamera, website, slangCard, taxi, refundCard };
