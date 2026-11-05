// Chapter 4 "Everywhere" — local sets & props (bank vault, 1920s office, 1930s street, gas station, painter's studio, WWII docks/ships/tents, world map).
// Built on longform/kit (look/props/toon); nothing here edits the kit.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon');
const { INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, E, hash, darken, lighten, fitText } = L;

// ---------- people ----------
const SANTA = { skin: '#F2C9A0', hair: { style: 'short', col: '#E9E6E0' }, beard: 'full', beardCol: '#F6F4EF', stacheCol: '#FFFFFF', hat: 'santa', top: '#D93A35', pants: '#D93A35', shoes: '#1C1A1F', build: 'round', buttons: 1, browCol: '#D8D4CC' };
const PAINTER = { skin: '#E8B58A', hair: { style: 'side', col: '#5A3A22' }, stache: 1, top: '#F4F0E6', apron: '#C9B79A', bow: '#2F6DB5', pants: '#4A4F5C', hat: 'boater', hatCol: '#E8D6A6' };
const ACCOUNTANT = { skin: '#F0CBA8', hair: { style: 'bald', col: '#6B5A48' }, glasses: 'round', top: '#5C6470', top2: '#F4F0E6', bow: '#D93A35', pants: '#4A4F5C', build: 'thin' };
const NAVY = { skin: '#B97A4E', hair: { style: 'short', col: '#151313' }, top: '#2E3A5A', pants: '#2E3A5A', hat: 'soda', buttons: 1 };
const HEIR = [ // Candler's family (generic, period clothes)
  { skin: '#EFC8A4', hair: { style: 'side', col: '#5A3A22' }, stache: 1, top: '#3A3F4A', top2: '#F4F0E6', tie: '#6A2A2A', pants: '#3A3F4A' },
  { skin: '#F2C9A0', hair: { style: 'bun', col: '#6B5A48' }, top: '#6A4A6A', pants: '#4A3A4A' },
  { skin: '#EFC8A4', hair: { style: 'short', col: '#8A6A4A' }, top: '#4A5A4A', top2: '#F4F0E6', bow: '#1C1A1F', pants: '#3A4A3A' }];
const INVESTORS = [
  { skin: '#F0CBA8', hair: { style: 'side', col: '#2B1E16' }, top: '#2E2A28', top2: '#F4F0E6', tie: '#7A2A2A', pants: '#2E2A28', hat: 'bowler' },
  { skin: '#E8B58A', hair: { style: 'short', col: '#A9A49C' }, stache: 1, top: '#3A3438', top2: '#F4F0E6', bow: '#2F6DB5', pants: '#3A3438', hat: 'top' },
  { skin: '#F2C9A0', hair: { style: 'fringe', col: '#5A3A22' }, glasses: 'round', top: '#4A4F5C', top2: '#F4F0E6', tie: '#2F8A6A', pants: '#4A4F5C', hat: 'bowler', hatCol: '#4A3A2E' }];
const ERNEST = LOOKS.banker; // generic banker look (top hat), labelled by the voice

// ---------- generic bits ----------
function floorBoards(ctx, col = '#8A5A33', y = 200) { L.planks(ctx, -2000, y, 4000, 1000, col, { pw: 40 }); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-2000, y, 4000, 26); }
function frame(ctx, x, y, w, h, fill, inner) { rr(ctx, x - w / 2, y - h / 2, w, h, 6); ink(ctx, '#B8873A', 6); rr(ctx, x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24, 3); ink(ctx, fill || '#E9DCC0', 4); if (inner) { ctx.save(); rr(ctx, x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24, 3); ctx.clip(); inner(ctx, x, y, w - 24, h - 24); ctx.restore(); } }
function window(ctx, x, y, w, h, scene) { rr(ctx, x - w / 2 - 14, y - h / 2 - 14, w + 28, h + 28, 8); ink(ctx, '#6B4123', 6); ctx.save(); rr(ctx, x - w / 2, y - h / 2, w, h, 4); ctx.clip(); scene(ctx, x - w / 2, y - h / 2, w, h); ctx.restore(); rr(ctx, x - w / 2, y - h / 2, w, h, 4); ink(ctx, null, 5);
  ctx.beginPath(); ctx.moveTo(x, y - h / 2); ctx.lineTo(x, y + h / 2); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.lineWidth = 10; ctx.strokeStyle = '#6B4123'; ctx.stroke(); rr(ctx, x - w / 2 - 24, y + h / 2 + 10, w + 48, 20, 5); ink(ctx, '#7A4A2A', 5); }
function plant(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 7; i++) { const a = -1.3 + i * 0.43; ctx.save(); ctx.rotate(a * 0.6); ell(ctx, 0, -110, 26, 80); ink(ctx, i % 2 ? '#3E8E4A' : '#4FA35A', 4); ctx.restore(); } poly(ctx, [[-60, -70], [60, -70], [44, 0], [-44, 0]]); ink(ctx, '#C46A4A', 5); ctx.restore(); }
function nameplate(ctx, x, y, s, txt) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -150, -30, 300, 60, 6); ink(ctx, '#3A2A1E', 5); rr(ctx, -138, -20, 276, 40, 4); ink(ctx, '#D8B04A', 3); fitText(ctx, txt, 0, 1, 26, INK, 260); ctx.restore(); }
function stamp(ctx, txt, x, y, u, o = {}) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.16); const k = u < 1 ? lerp(2.4, 1, E.out(clamp(u))) : 1; ctx.scale(k, k); ctx.globalAlpha = clamp(u * 3) * 0.92;
  const s = o.size || 120; ctx.font = `${s}px ${L.F.black}`; const w = ctx.measureText(txt).width + s * 0.7, h = s * 1.3; rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.lineWidth = 12; ctx.strokeStyle = o.col || RED; ctx.stroke(); rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
  fitText(ctx, txt, 0, s * 0.05, s, o.col || RED, w - 40); ctx.restore(); }

// ---------- bank vault ----------
function vaultWall(ctx, t) { ctx.fillStyle = '#7E868C'; ctx.fillRect(-2000, -1200, 4000, 1500);
  for (let i = -8; i < 8; i++) for (let j = -5; j < 2; j++) { rr(ctx, i * 240 + 6, j * 200 + 6, 228, 188, 6); ink(ctx, j % 2 ? '#8C949A' : '#858D93', 4); for (const [a, b] of [[20, 20], [208, 20], [20, 168], [208, 168]]) { ctx.beginPath(); ctx.arc(i * 240 + 6 + a, j * 200 + 6 + b, 5, 0, 6.28); ink(ctx, '#B9C0C5', 2); } } }
function depositBoxes(ctx, x, y, cols, rows) { for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const bx = x + i * 92, by = y + j * 62; rr(ctx, bx, by, 86, 56, 4); ink(ctx, '#C9A86A', 4); ctx.beginPath(); ctx.arc(bx + 70, by + 28, 6, 0, 6.28); ink(ctx, '#7A5A2A', 2); fitText(ctx, String(100 + i * rows + j), bx + 32, by + 28, 18, '#5A3A1A', 50); } }
function vaultDoor(ctx, x, y, r, open = 0, spin = 0) { // open 0..1 swings the door to the right (squash)
  ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, r * 1.12, 0, 6.28); ink(ctx, '#5E666C', 8); ctx.beginPath(); ctx.arc(0, 0, r * 1.02, 0, 6.28); ink(ctx, '#2A2628', 6);
  if (open > 0) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ctx.clip(); ctx.fillStyle = '#3A2E22'; ctx.fillRect(-r, -r, 2 * r, 2 * r); for (let i = 0; i < 6; i++) P.moneyBag(ctx, -r * 0.6 + (i % 3) * r * 0.6, r * 0.75 - Math.floor(i / 3) * r * 0.5, 0.75, '$'); L.glow(ctx, 0, 0, r, '#FFD58A', 0.5 * open); ctx.restore(); }
  const k = Math.cos(open * 1.35); ctx.translate(open * r * 1.15, 0); ctx.scale(Math.max(0.12, k), 1);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ink(ctx, '#A7AFB5', 8); L.shade(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); }, 1, 0.15);
  ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, 6.28); ink(ctx, null, 4); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.91, Math.sin(a) * r * 0.91, 8, 0, 6.28); ink(ctx, '#D8DEE2', 3); }
  ctx.save(); ctx.rotate(spin); for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI / 3); rr(ctx, -r * 0.5, -9, r, 18, 9); ink(ctx, '#C9A86A', 4); } ctx.beginPath(); ctx.arc(0, 0, r * 0.16, 0, 6.28); ink(ctx, '#D8B04A', 5); ctx.restore(); ctx.restore(); }
function armored(ctx, x, y, s, t, o = {}) { P.truck(ctx, x, y, s, { era: 1930, col: '#4A5A6A', box: '#7E868C', text: o.text || 'BANK', t, flip: o.flip }); }
function marble(ctx, y = 200) { L.tiles(ctx, -2200, y, 4400, 1000, '#E6E1D6', '#CFC8BA', 110); ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(-2200, y, 4400, 20); }
function columns(ctx, xs, top = -700, bot = 200) { for (const x of xs) { rr(ctx, x - 50, top, 100, bot - top, 4); ink(ctx, '#EDE6D6', 5); for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 16, top + 40); ctx.lineTo(x + i * 16, bot - 40); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.stroke(); } rr(ctx, x - 70, top - 10, 140, 40, 4); ink(ctx, '#DCD3C0', 5); rr(ctx, x - 70, bot - 30, 140, 30, 4); ink(ctx, '#DCD3C0', 5); } }
function bankHall(ctx, t) { L.wallpaper(ctx, -2000, -1100, 4000, 1400, '#D8C9A6', '#CDBD98', 60); columns(ctx, [-1300, -700, 700, 1300]);
  for (const x of [-1000, 1000]) { rr(ctx, x - 160, -520, 320, 300, 10); ink(ctx, '#6B4123', 6); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - 140 + i * 56, -500); ctx.lineTo(x - 140 + i * 56, -240); ctx.lineWidth = 5; ctx.strokeStyle = '#D8B04A'; ctx.stroke(); } fitText(ctx, 'TELLER', x, -560, 40, '#5A3A1A', 300); }
  rr(ctx, -380, -820, 760, 110, 10); ink(ctx, '#3A2A1E', 6); fitText(ctx, 'NATIONAL BANK', 0, -765, 64, '#D8B04A', 700); P.clock(ctx, 0, -560, 80, t * 2, { rim: '#6B4123' }); }

// ---------- 1920s office ----------
function office(ctx, t, o = {}) {
  L.planks(ctx, -2000, -1100, 4000, 1400, '#7A4A2A', { vertical: true, pw: 70 }); ctx.fillStyle = '#5A3420'; ctx.fillRect(-2000, -160, 4000, 30); ctx.fillStyle = '#E2C394'; ctx.fillRect(-2000, -1100, 4000, 240); L.wallpaper(ctx, -2000, -1100, 4000, 240, '#D9BE8E', '#C9A877', 50);
  window(ctx, o.wx ?? -560, -470, 420, 420, o.view || ((g, x, y, w, h) => { L.skyGrad(g, x, y, w, h, ERA.jazz.sky); for (let i = 0; i < 5; i++) { rr(g, x + i * 90 - 10, y + h - 120 - hash(i) * 160, 80, 400, 3); ink(g, ['#B9A88E', '#A6907A', '#C9B79A'][i % 3], 3); } }));
  frame(ctx, o.fx ?? 520, -520, 240, 300, '#E9DCC0', (g, x, y) => { P.bottle(g, x, y + 110, 0.85, { kind: 'contour' }); });
  P.shelves(ctx, 860, -760, 520, 640, { rows: 4, seed: 4 }); P.clock(ctx, 120, -700, 70, t * 3, { rim: '#6B4123' }); floorBoards(ctx, '#6B4123'); }
function bigChair(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -170, -560, 340, 420, 60); ink(ctx, '#7A2626', 7); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.arc(-90 + i * 90, -480 + j * 85, 7, 0, 6.28); ink(ctx, '#D8B04A', 2); }
  rr(ctx, -200, -180, 400, 90, 30); ink(ctx, '#8A2E2E', 7); for (const sx of [-1, 1]) { rr(ctx, sx * 210 - 45, -330, 90, 230, 36); ink(ctx, '#8A2E2E', 7); } rr(ctx, -150, -90, 20, 90, 6); ink(ctx, '#3A2A1E', 4); rr(ctx, 130, -90, 20, 90, 6); ink(ctx, '#3A2A1E', 4); ctx.restore(); }
function desk(ctx, x, y, w = 760, o = {}) { rr(ctx, x - w / 2, y - 210, w, 40, 8); ink(ctx, '#5A3420', 6); rr(ctx, x - w / 2 + 20, y - 172, w - 40, 172, 6); ink(ctx, '#7A4A2A', 6); L.planks(ctx, x - w / 2 + 26, y - 166, w - 52, 160, '#7A4A2A', { vertical: true, pw: 60 });
  rr(ctx, x - w / 2 + 20, y - 172, w - 40, 172, 6); ink(ctx, null, 6); if (o.plate) nameplate(ctx, x, y - 90, 0.9, o.plate); }
function chalkboard(ctx, x, y, w, h) { rr(ctx, x - w / 2, y - h / 2, w, h, 8); ink(ctx, '#8A5A33', 8); rr(ctx, x - w / 2 + 16, y - h / 2 + 16, w - 32, h - 32, 4); ink(ctx, '#2E4A3E', 4); }

// ---------- 1930s street / gas station ----------
function car(ctx, x, y, s = 1, col = '#2F6DB5', t = 0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  const wheel = wx => { ctx.save(); ctx.translate(wx, -40); ctx.rotate(t * 10); ctx.beginPath(); ctx.arc(0, 0, 40, 0, 6.28); ink(ctx, '#2A2628', 5); ctx.beginPath(); ctx.arc(0, 0, 18, 0, 6.28); ink(ctx, '#E9E3D6', 4); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ink(ctx, null, 3); ctx.restore(); };
  ctx.beginPath(); ctx.moveTo(-210, -50); ctx.lineTo(-215, -110); ctx.quadraticCurveTo(-200, -130, -150, -130); ctx.lineTo(-110, -200); ctx.lineTo(60, -200); ctx.lineTo(100, -130); ctx.lineTo(190, -125); ctx.quadraticCurveTo(220, -115, 222, -50); ctx.closePath(); ink(ctx, col, 6); L.shade(ctx, () => { ctx.beginPath(); ctx.rect(-230, -90, 460, 60); }, 1, 0.12);
  poly(ctx, [[-95, -185], [-20, -185], [-20, -135], [-125, -135]]); ink(ctx, '#BFE3F0', 4); poly(ctx, [[0, -185], [52, -185], [82, -135], [0, -135]]); ink(ctx, '#BFE3F0', 4);
  for (const wx of [-140, 140]) { ctx.beginPath(); ctx.arc(wx, -50, 56, Math.PI, 0); ink(ctx, darken(col, 0.75), 5); } wheel(-140); wheel(140); ell(ctx, 215, -105, 12, 16); ink(ctx, '#FFF2B0', 4); rr(ctx, -228, -60, 456, 14, 6); ink(ctx, '#C9CDD2', 4);
  if (o.driver) { ctx.save(); ctx.beginPath(); ctx.rect(-130, -200, 200, 70); ctx.clip(); toon(ctx, -20, 40, 0.62, o.driver, 'stand', o.expr || 'happy', { t, noShadow: true }); ctx.restore(); }
  ctx.restore(); }
function pump(ctx, x, y, s = 1, col = RED) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -45, -300, 90, 300, 14); ink(ctx, col, 6); ell(ctx, 0, -330, 52, 52); ink(ctx, '#F4F0E6', 6); fitText(ctx, 'GAS', 0, -330, 34, col, 80); rr(ctx, -30, -250, 60, 60, 6); ink(ctx, '#F4F0E6', 4); fitText(ctx, '19¢', 0, -220, 24, INK, 50);
  ctx.beginPath(); ctx.moveTo(45, -160); ctx.quadraticCurveTo(110, -120, 80, -40); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
function cooler(ctx, x, y, s = 1, lid = 0, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -170, -230, 340, 210, 12); ink(ctx, RED, 6); L.shade(ctx, () => rr(ctx, -170, -230, 340, 210, 12), 1, 0.14); rr(ctx, -140, -170, 280, 70, 8); ink(ctx, CREAM, 4); fitText(ctx, 'COCA-COLA', 0, -150, 34, RED, 250); fitText(ctx, 'ICE COLD', 0, -116, 22, INK, 250, { font: L.F.type });
  for (const sx of [-1, 1]) { rr(ctx, sx * 140 - 14, -24, 28, 26, 4); ink(ctx, '#3A3438', 4); }
  if (lid > 0) { for (let i = 0; i < 5; i++) P.bottle(ctx, -110 + i * 55, -205 - Math.sin(i + t * 3) * 3, 0.36, { label: '', kind: 'contour' }); ctx.save(); for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + i * 0.25) % 1; ctx.globalAlpha = (1 - ph) * 0.5 * lid; L.cloud(ctx, -100 + i * 70, -260 - ph * 120, 0.3, '#E8F6FF'); } ctx.restore(); }
  ctx.save(); ctx.translate(0, -230); ctx.scale(1, Math.cos(lid * 1.4)); rr(ctx, -178, -36, 356, 40, 8); ink(ctx, '#B82E2A', 6); ctx.restore(); ctx.restore(); }
function gasStation(ctx, t) { // far hills + sky are separate; this is the station building + canopy (ground y=200)
  rr(ctx, 240, -520, 820, 720, 8); ink(ctx, '#F4F0E6', 6); L.stripes(ctx, 246, -170, 808, 60, RED, '#F4F0E6', 30); rr(ctx, 240, -520, 820, 720, 8); ink(ctx, null, 6);
  rr(ctx, 300, -60, 260, 260, 6); ink(ctx, '#9CC7D8', 5); rr(ctx, 640, -80, 160, 280, 6); ink(ctx, '#2F6DB5', 5); rr(ctx, 860, -60, 160, 160, 6); ink(ctx, '#9CC7D8', 5);
  rr(ctx, 300, -460, 700, 120, 10); ink(ctx, '#2F6DB5', 6); fitText(ctx, 'SERVICE STATION', 650, -400, 64, CREAM, 660);
  poly(ctx, [[-900, -380], [260, -380], [300, -320], [-940, -320]]); ink(ctx, RED, 6); rr(ctx, -880, -320, 30, 520, 6); ink(ctx, '#E9E3D6', 5); rr(ctx, 180, -320, 30, 520, 6); ink(ctx, '#E9E3D6', 5);
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(-860 + i * 150, -318, 10, 0, 6.28); ink(ctx, '#FFF2B0', 3); }
  rr(ctx, 360, -720, 300, 180, 10); ink(ctx, CREAM, 6); fitText(ctx, 'DRINK', 510, -680, 44, INK, 260); fitText(ctx, 'COCA-COLA', 510, -610, 56, RED, 270); rr(ctx, 500, -540, 20, 30, 3); ink(ctx, '#6B6B6B', 3); }
function countryside(ctx, t, sky = ERA.jazz.sky) { L.skyGrad(ctx, -2200, -1300, 4400, 1600, sky); L.cloud(ctx, -700 + t * 10, -600, 1.3); L.cloud(ctx, 500 + t * 7, -720, 1.0); L.cloud(ctx, 1300 + t * 8, -560, 0.8);
  ctx.beginPath(); ctx.moveTo(-2200, 120); for (let x = -2200; x <= 2200; x += 100) ctx.lineTo(x, -40 - Math.sin(x * 0.003) * 90 - Math.sin(x * 0.011) * 30); ctx.lineTo(2200, 400); ctx.lineTo(-2200, 400); ctx.closePath(); ink(ctx, '#8FBF6A', 5);
  for (let i = 0; i < 16; i++) { const x = -2000 + i * 260 + hash(i) * 80, y = 40 + hash(i * 3) * 40; ctx.beginPath(); ctx.arc(x, y - 40, 40 + hash(i * 5) * 20, 0, 6.28); ink(ctx, '#5E9E4E', 4); } }
function road(ctx, y = 200) { ctx.fillStyle = '#8A8478'; ctx.fillRect(-2400, y, 4800, 1000); ctx.fillStyle = '#C9BFA8'; ctx.fillRect(-2400, y, 4800, 22); ctx.beginPath(); ctx.moveTo(-2400, y + 22); ctx.lineTo(2400, y + 22); ink(ctx, null, 4);
  for (let i = 0; i < 24; i++) { rr(ctx, -2400 + i * 220, y + 260, 120, 16, 6); ink(ctx, '#EDE6D6', 0); } }
function cityRow(ctx, t, o = {}) { // 1930s brick street facades (x -1800..1800, ground 200)
  const S = o.signs || ['GROCERY', 'DRUGS', 'BAKERY', 'HARDWARE', 'DINER'];
  P.storefront(ctx, -1820, 210, { w: 640, h: 600, col: '#B8714C', sign: S[0], awning: ['#2F8A6A', CREAM], upper: 3, display: o.display0 });
  P.storefront(ctx, -1140, 210, { w: 560, h: 680, col: '#E2C394', brick: false, sign: S[1], signCol: '#2F6DB5', signFg: CREAM, awning: [RED, CREAM], upper: 2 });
  P.storefront(ctx, -540, 210, { w: 600, h: 560, col: '#9A5B44', sign: S[2], awning: [YELLOW, '#5A3420'] });
  P.storefront(ctx, 100, 210, { w: 640, h: 640, col: '#C9A06A', brick: false, sign: S[3], signCol: '#3A2A1E', awning: ['#2F6DB5', CREAM] });
  P.storefront(ctx, 780, 210, { w: 620, h: 580, col: '#A65A3E', sign: S[4], signCol: RED, signFg: CREAM, awning: [RED, CREAM] });
  P.storefront(ctx, 1440, 210, { w: 520, h: 660, col: '#8E5A3E', sign: S[5] || 'BARBER', awning: ['#2F8A6A', YELLOW] }); }

// ---------- painter's studio ----------
function studio(ctx, t, o = {}) { L.planks(ctx, -2000, -1100, 4000, 1400, '#C9A877', { vertical: true, pw: 90 });
  window(ctx, -600, -480, 460, 460, (g, x, y, w, h) => { L.skyGrad(g, x, y, w, h, ['#5A6E8E', '#B9C8DA']); for (let i = 0; i < 40; i++) { const sx = x + (hash(i) * w + t * 20) % w, sy = y + ((hash(i * 3) * h + t * 70 * (0.6 + hash(i * 7))) % h); g.beginPath(); g.arc(sx, sy, 4 + hash(i * 9) * 3, 0, 6.28); g.fillStyle = '#FFFFFF'; g.fill(); }
    for (let i = 0; i < 4; i++) { poly(g, [[x + i * 130 - 20, y + h], [x + i * 130 + 50, y + h - 140 - hash(i) * 60], [x + i * 130 + 120, y + h]]); ink(g, '#F4F6FA', 3); } });
  for (let i = 0; i < 6; i++) frame(ctx, 380 + (i % 3) * 230, -720 + Math.floor(i / 3) * 260, 190, 210, ['#F7C548', '#9CC7D8', '#E8B58A', '#8FBF6A', '#D9A0A0', '#C9B79A'][i], (g, x, y) => { ell(g, x, y + 10, 40, 50); ink(g, lighten(['#F7C548', '#9CC7D8', '#E8B58A', '#8FBF6A', '#D9A0A0', '#C9B79A'][i], -0.2), 3); });
  rr(ctx, -2000, -100, 4000, 24, 4); ink(ctx, '#8A5A33', 4); floorBoards(ctx, '#9A6A3E'); }
function easel(ctx, x, y, s, draw) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 16; ctx.strokeStyle = INK; for (const [a, b] of [[-150, 160], [150, 160], [0, 140]]) { ctx.beginPath(); ctx.moveTo(a * 0.2, -620); ctx.lineTo(a, b); ctx.stroke(); }
  ctx.lineWidth = 9; ctx.strokeStyle = '#9A6A3E'; for (const [a, b] of [[-150, 160], [150, 160]]) { ctx.beginPath(); ctx.moveTo(a * 0.2, -620); ctx.lineTo(a, b); ctx.stroke(); }
  rr(ctx, -240, -560, 480, 560, 6); ink(ctx, '#F7F2E6', 7); ctx.save(); rr(ctx, -232, -552, 464, 544, 4); ctx.clip(); if (draw) draw(ctx, 0, -280, 464, 544); ctx.restore(); rr(ctx, -260, 0, 520, 30, 6); ink(ctx, '#9A6A3E', 5); ctx.restore(); }
function palette(ctx) { ell(ctx, 0, 0, 60, 40); ink(ctx, '#D9B27A', 4); for (const [c, a] of [[RED, 0], [YELLOW, 1], [BLUE, 2], ['#FFFFFF', 3], ['#3E8E4A', 4]]) { ctx.beginPath(); ctx.arc(Math.cos(a * 1.1 - 2.4) * 36, Math.sin(a * 1.1 - 2.4) * 22, 9, 0, 6.28); ink(ctx, c, 2.5); } }
function brush(ctx) { ctx.save(); ctx.rotate(-0.6); rr(ctx, -5, -90, 10, 90, 4); ink(ctx, '#C9A86A', 3); poly(ctx, [[-6, -90], [6, -90], [3, -115], [-3, -115]]); ink(ctx, RED, 3); ctx.restore(); }

// ---------- war: sea, ships, docks, tents, planes ----------
function sea(ctx, y, t, col = '#5E7C8E') { ctx.fillStyle = col; ctx.fillRect(-2400, y, 4800, 1400); for (let r = 0; r < 9; r++) for (let i = 0; i < 16; i++) { const x = -2400 + i * 320 + ((r * 97 + t * (30 + r * 8)) % 320), yy = y + 30 + r * 70; ctx.beginPath(); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 40, yy - 14, x + 80, yy); ctx.lineWidth = 5; ctx.strokeStyle = lighten(col, 0.3); ctx.lineCap = 'round'; ctx.stroke(); } }
function ship(ctx, x, y, s = 1, t = 0, o = {}) { ctx.save(); ctx.translate(x, y + Math.sin(t * 1.5) * 6); ctx.rotate(Math.sin(t * 1.2) * 0.012); ctx.scale(s * (o.flip ? -1 : 1), s);
  poly(ctx, [[-760, -150], [700, -150], [600, 60], [-680, 60]]); ink(ctx, o.hull || '#5E6640', 7); L.shade(ctx, () => poly(ctx, [[-760, -150], [700, -150], [600, 60], [-680, 60]]), 1, 0.15); rr(ctx, -700, -20, 1360, 16, 4); ink(ctx, '#C9302C', 0);
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-560 + i * 130, -90, 13, 0, 6.28); ink(ctx, '#2A2628', 3); }
  rr(ctx, 360, -360, 260, 210, 8); ink(ctx, '#8A9068', 6); rr(ctx, 400, -440, 180, 80, 6); ink(ctx, '#8A9068', 6); for (let i = 0; i < 4; i++) { rr(ctx, 380 + i * 58, -320, 40, 30, 4); ink(ctx, '#BFE3F0', 3); } rr(ctx, 440, -560, 60, 120, 6); ink(ctx, '#3A3438', 5);
  for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * 0.6; L.cloud(ctx, 470 - ph * 260, -600 - ph * 160, 0.4 + ph * 0.5, '#D9D6CC'); ctx.restore(); }
  if (o.cargo) o.cargo(ctx); if (o.flag !== false) { rr(ctx, -700, -460, 10, 310, 3); ink(ctx, INK, 3); } ctx.restore(); }
function equipCrate(ctx, x, y, w, h, label = 'BOTTLING EQUIPMENT', sub = 'THIS SIDE UP') { rr(ctx, x - w / 2, y - h, w, h, 6); ink(ctx, '#C8954F', 6); L.planks(ctx, x - w / 2 + 5, y - h + 5, w - 10, h - 10, '#C8954F', { pw: 26 }); rr(ctx, x - w / 2, y - h, w, h, 6); ink(ctx, null, 6);
  ctx.beginPath(); ctx.moveTo(x - w / 2, y - h); ctx.lineTo(x + w / 2, y); ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x - w / 2, y); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(90,52,32,0.55)'; ctx.stroke();
  rr(ctx, x - w * 0.42, y - h * 0.72, w * 0.84, h * 0.42, 4); ink(ctx, '#E9D6A6', 3); fitText(ctx, label, x, y - h * 0.58, h * 0.13, '#7A2E1E', w * 0.78); fitText(ctx, sub, x, y - h * 0.4, h * 0.08, '#7A2E1E', w * 0.7, { font: L.F.type }); }
function crane(ctx, x, y, s, t, hookY, load) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(-40, -i * 80); ctx.lineTo(40, -i * 80 - 80); ctx.moveTo(40, -i * 80); ctx.lineTo(-40, -i * 80 - 80); ctx.lineWidth = 6; ctx.strokeStyle = '#3A3438'; ctx.stroke(); }
  rr(ctx, -50, -820, 16, 820, 4); ink(ctx, '#D8A43A', 4); rr(ctx, 34, -820, 16, 820, 4); ink(ctx, '#D8A43A', 4); rr(ctx, -120, -860, 900, 44, 6); ink(ctx, '#D8A43A', 6); rr(ctx, -140, -900, 140, 100, 8); ink(ctx, '#8A9068', 5);
  ctx.beginPath(); ctx.moveTo(600, -816); ctx.lineTo(600, hookY); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.arc(600, hookY + 14, 14, -0.3, Math.PI); ink(ctx, null, 6); if (load) { ctx.save(); ctx.translate(600, hookY + 30); ctx.rotate(Math.sin(t * 2) * 0.04); load(ctx); ctx.restore(); } ctx.restore(); }
function dock(ctx, y = 200) { L.planks(ctx, -2400, y, 4800, 1000, '#7A6040', { vertical: true, pw: 60 }); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-2400, y, 4800, 24); for (let i = 0; i < 12; i++) { rr(ctx, -2300 + i * 400, y - 50, 50, 70, 10); ink(ctx, '#3A3438', 4); } }
function warehouse(ctx) { L.bricks(ctx, -2200, -760, 1200, 960, '#9A5B44'); ctx.beginPath(); ctx.rect(-2200, -760, 1200, 960); ink(ctx, null, 6); rr(ctx, -1900, -300, 500, 500, 6); ink(ctx, '#4A3A2E', 5); fitText(ctx, 'PIER 9', -1600, -620, 80, CREAM, 500); }
function plane(ctx, x, y, s = 1, col = '#7C8456') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ell(ctx, 0, 0, 120, 26); ink(ctx, col, 5); poly(ctx, [[-20, -6], [30, -6], [10, 90], [-30, 90]]); ink(ctx, darken(col, 0.85), 5); poly(ctx, [[-20, 6], [30, 6], [10, -90], [-30, -90]]); ink(ctx, darken(col, 0.85), 5); poly(ctx, [[-120, 0], [-100, -50], [-80, 0]]); ink(ctx, col, 4); ell(ctx, 50, -10, 26, 14); ink(ctx, '#BFE3F0', 3); ctx.restore(); }
function tent(ctx, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); poly(ctx, [[-420, 0], [-340, -300], [340, -300], [420, 0]]); ink(ctx, '#8A8F5C', 7); poly(ctx, [[-340, -300], [0, -420], [340, -300]]); ink(ctx, '#7C8456', 7);
  L.shade(ctx, () => poly(ctx, [[-420, 0], [-340, -300], [340, -300], [420, 0]]), 1, 0.12); poly(ctx, [[-150, 0], [-110, -260], [110, -260], [150, 0]]); ink(ctx, '#2E2A22', 5); if (o.inside) { ctx.save(); poly(ctx, [[-150, 0], [-110, -260], [110, -260], [150, 0]]); ctx.clip(); o.inside(ctx); ctx.restore(); }
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 340, -300); ctx.lineTo(sx * 520, 0); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); } if (o.sign) { rr(ctx, -200, -400, 400, 70, 6); ink(ctx, CREAM, 5); fitText(ctx, o.sign, 0, -365, 38, '#7A2E1E', 370); } ctx.restore(); }
function bottler(ctx, x, y, s, t) { // small bottling machine with a conveyor of bottles
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -120, -260, 240, 200, 12); ink(ctx, '#A7AFB5', 6); ctx.beginPath(); ctx.arc(0, -160, 50, 0, 6.28); ink(ctx, '#C9CDD2', 5); ctx.save(); ctx.translate(0, -160); ctx.rotate(t * 3); for (let i = 0; i < 6; i++) { ctx.rotate(1.047); ctx.beginPath(); ctx.arc(32, 0, 8, 0, 6.28); ink(ctx, '#3A3438', 2); } ctx.restore();
  rr(ctx, -360, -60, 720, 30, 8); ink(ctx, '#3A3438', 5); for (let i = 0; i < 8; i++) { const bx = -340 + ((i * 90 + t * 120) % 720); P.bottle(ctx, bx, -60, 0.24, { label: '', kind: 'contour' }); } rr(ctx, -100, -30, 30, 30, 4); ink(ctx, '#3A3438', 4); rr(ctx, 70, -30, 30, 30, 4); ink(ctx, '#3A3438', 4); ctx.restore(); }
function smokeFar(ctx, t, n = 5) { for (let i = 0; i < n; i++) { const x = -1400 + i * 620 + hash(i) * 200; for (let k = 0; k < 4; k++) { const ph = (t * 0.15 + k / 4 + hash(i * 3)) % 1; ctx.save(); ctx.globalAlpha = 0.45 * (1 - ph); L.cloud(ctx, x + ph * 120, -60 - ph * 380, 0.5 + ph * 0.9, '#8C8A80'); ctx.restore(); } } }

// ---------- world map (equirectangular, lon -170..190 -> x, lat 82..-58 -> y) ----------
const LAND = {
  na: [[-168, 66], [-140, 70], [-100, 72], [-80, 72], [-62, 60], [-55, 50], [-66, 44], [-76, 35], [-81, 25], [-97, 26], [-97, 20], [-87, 15], [-78, 8], [-85, 10], [-92, 15], [-105, 20], [-112, 30], [-118, 34], [-124, 40], [-125, 48], [-135, 58], [-150, 60], [-165, 60]],
  gr: [[-50, 82], [-25, 82], [-20, 70], [-42, 60], [-55, 68]],
  sa: [[-78, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-72, -50], [-72, -30], [-70, -18], [-80, -5], [-80, 2]],
  eu: [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [10, 58], [5, 62], [15, 69], [28, 71], [40, 68], [40, 55], [30, 46], [28, 41], [22, 37], [15, 38], [12, 44], [8, 44], [3, 42], [-5, 36]],
  uk: [[-5, 50], [1, 51], [0, 54], [-3, 58], [-6, 56]],
  af: [[-17, 15], [-16, 22], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [20, -35], [17, -28], [12, -15], [13, -5], [9, 4], [-5, 5], [-12, 7]],
  as: [[28, 41], [36, 36], [35, 30], [44, 12], [58, 22], [60, 25], [67, 25], [73, 20], [78, 8], [80, 15], [88, 22], [92, 22], [98, 15], [100, 3], [104, 1], [106, 10], [109, 20], [121, 30], [122, 40], [129, 35], [130, 43], [141, 46], [140, 53], [135, 55], [160, 60], [170, 65], [180, 68], [140, 73], [110, 77], [80, 73], [68, 70], [60, 68], [40, 68], [40, 55], [30, 46]],
  jp: [[130, 31], [136, 34], [141, 38], [142, 44], [140, 41], [135, 36]],
  au: [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [132, -32], [117, -35], [114, -28]],
  ng: [[131, -1], [141, -3], [150, -6], [147, -10], [141, -9], [134, -4]],
  ph: [[120, 18], [122, 14], [125, 7], [126, 10], [123, 16]],
  bo: [[109, 2], [117, 7], [119, 1], [116, -4], [110, -3]],
  su: [[95, 5], [106, -6], [104, -5], [98, 0]],
  md: [[44, -13], [50, -15], [48, -25], [44, -24]],
  nz: [[172, -35], [178, -38], [174, -42], [168, -46], [171, -41]],
};
function mapXY(x0, y0, w, h, lon, lat) { return [x0 + (lon + 170) / 360 * w, y0 + (82 - lat) / 140 * h]; }
function worldMap(ctx, x0, y0, w, h, o = {}) { rr(ctx, x0 - 20, y0 - 20, w + 40, h + 40, 12); ink(ctx, o.frame || '#8A5A33', 8); ctx.save(); rr(ctx, x0, y0, w, h, 6); ctx.clip(); ctx.fillStyle = o.sea || '#A9CFE0'; ctx.fillRect(x0, y0, w, h);
  ctx.globalAlpha = 0.25; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; for (let i = 1; i < 12; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * w / 12, y0); ctx.lineTo(x0 + i * w / 12, y0 + h); ctx.stroke(); } for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x0, y0 + i * h / 6); ctx.lineTo(x0 + w, y0 + i * h / 6); ctx.stroke(); } ctx.globalAlpha = 1;
  for (const k in LAND) { ctx.beginPath(); LAND[k].forEach(([lo, la], i) => { const [px, py] = mapXY(x0, y0, w, h, lo, la); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.closePath(); ink(ctx, (o.col && o.col[k]) || o.land || '#E9D6A6', 4); }
  if (o.after) o.after(ctx); ctx.restore(); rr(ctx, x0, y0, w, h, 6); ink(ctx, null, 6); }
function pin(ctx, x, y, u, col = RED, s = 1) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); const k = E.back(clamp(u), 2.5) * s; ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-16, -22, -16, -40, 0, -40); ctx.bezierCurveTo(16, -40, 16, -22, 0, 0); ink(ctx, col, 3.5); ctx.beginPath(); ctx.arc(0, -28, 5, 0, 6.28); ctx.fillStyle = '#FFF'; ctx.fill(); ctx.restore(); }
function telegram(ctx, x, y, w, h, lines, u, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.02); rr(ctx, -w / 2, -h / 2, w, h, 6); ink(ctx, '#F4E8C8', 6); rr(ctx, -w / 2, -h / 2, w, 80, 6); ink(ctx, '#D8B04A', 5); fitText(ctx, o.head || 'TELEGRAM', 0, -h / 2 + 42, 46, INK, w - 60);
  const total = lines.join('').length; let shown = Math.floor(clamp(u) * total); lines.forEach((s, i) => { const n = Math.max(0, Math.min(s.length, shown)); shown -= s.length; if (n > 0) fitText(ctx, s.slice(0, n), -w / 2 + 50, -h / 2 + 140 + i * 66, 44, INK, w - 100, { font: L.F.type, align: 'left' }); }); ctx.restore(); }

module.exports = { SANTA, PAINTER, ACCOUNTANT, NAVY, HEIR, INVESTORS, ERNEST, floorBoards, frame, window, plant, nameplate, stamp, vaultWall, depositBoxes, vaultDoor, armored, marble, columns, bankHall, office, bigChair, desk, chalkboard,
  car, pump, cooler, gasStation, countryside, road, cityRow, studio, easel, palette, brush, sea, ship, equipCrate, crane, dock, warehouse, plane, tent, bottler, smokeFar, LAND, mapXY, worldMap, pin, telegram };
