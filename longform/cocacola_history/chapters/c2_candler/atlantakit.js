// Chapter-local sets & props for c2 "The Salesman" / c3 "The One-Dollar Deal" (1890s-1910s Atlanta, trains, bottling plants, maps).
// Same ink/flat/cel-shade rules as longform/kit. Copied verbatim into both chapter folders (c2_candler, c3_bottles).
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon');
const { INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, darken, lighten, clamp, lerp, E, hash, fitText } = L;

// ---------- generic 1890s people (no likeness) ----------
const PEOPLE = {
  clerk: { skin: '#F2C9A0', hair: { style: 'side', col: '#5A3A22' }, stache: 1, top: '#F4F0E6', apron: '#FFFFFF', bow: RED, pants: '#3A3A48', hat: 'soda', hatCol: '#FFFFFF' },
  gent: { skin: '#E8B58A', hair: { style: 'short', col: '#2B1E16' }, stache: 1, top: '#6A5A44', top2: '#F4F0E6', tie: '#2F6DB5', pants: '#4A3A2E', hat: 'bowler', hatCol: '#3A2A24' },
  gent2: { skin: '#D39A6A', hair: { style: 'short', col: '#151313' }, top: '#3E5A4A', top2: '#F4F0E6', bow: '#1C1A1F', pants: '#2E3A34', hat: 'boater', hatCol: '#E9D9A8' },
  gent3: { skin: '#F6D3B3', hair: { style: 'side', col: '#A9A49C' }, stache: 1, stacheCol: '#A9A49C', top: '#4A3A5A', top2: '#F4F0E6', tie: RED, pants: '#3A2E44', build: 'round' },
  lady: { skin: '#F2C9A0', hair: { style: 'bun', col: '#5A3A22' }, top: '#8A5AA8', pants: '#5A3A6A' },
  lady2: { skin: '#B97A4E', hair: { style: 'bun', col: '#151313' }, top: '#2F8A6A', pants: '#2A5A48' },
  mailman: { skin: '#E8B58A', hair: { style: 'short', col: '#5A3A22' }, stache: 1, top: '#3E4E78', pants: '#3E4E78', buttons: 1, hat: 'cap', hatCol: '#2E3A5E' },
  chemist: { skin: '#F0CBA8', hair: { style: 'bald', col: '#8A8378' }, glasses: 'round', top: '#F4F0E6', apron: '#FFFFFF', bow: '#1C1A1F', pants: '#3A3A48' },
  worker: { skin: '#B97A4E', hair: { style: 'short', col: '#151313' }, top: '#8A6A4A', apron: '#C9B48A', pants: '#3A3A48', hat: 'cap', hatCol: '#4A4F5C' },
  worker2: { skin: '#F2C9A0', hair: { style: 'curly', col: '#A4462A' }, top: '#5A7A9A', apron: '#6A5A44', pants: '#3A3A48', hat: 'cap', hatCol: '#7A3A2A' },
  kid: { skin: '#E8B58A', hair: { style: 'short', col: '#D9B25A' }, top: '#D93A35', pants: '#2F6DB5', build: 'thin' },
};

// ---------- outdoors ----------
function sky(ctx, cols, t = 0, o = {}) { L.skyGrad(ctx, -2000, -1300, 4000, 1600, cols); if (o.sun) L.glow(ctx, o.sun[0], o.sun[1], 420, '#FFF0C0', 0.5);
  if (o.clouds !== false) for (let i = 0; i < 5; i++) L.cloud(ctx, -1500 + i * 720 + ((t * (8 + i * 3)) % 300), -700 + hash(i * 5) * 260, 0.8 + hash(i) * 0.7, o.cloudCol || '#FFF8EA'); }
function hills(ctx, y, col, amp = 60, seed = 0) { ctx.beginPath(); ctx.moveTo(-2200, y + 900); for (let x = -2200; x <= 2200; x += 80) ctx.lineTo(x, y - Math.sin(x / 260 + seed) * amp - Math.sin(x / 97 + seed * 2) * amp * 0.3); ctx.lineTo(2200, y + 900); ctx.closePath(); ink(ctx, col, 5); }
function trees(ctx, y, n, col, seed = 0, x0 = -2000, x1 = 2000) { for (let i = 0; i < n; i++) { const x = lerp(x0, x1, hash(i * 3.1 + seed)), s = 0.6 + hash(i * 7.7 + seed) * 0.6; rr(ctx, x - 6 * s, y - 50 * s, 12 * s, 50 * s, 3); ink(ctx, '#6B4123', 3); ell(ctx, x, y - 90 * s, 46 * s, 56 * s); ink(ctx, col, 4); L.shade(ctx, () => ell(ctx, x, y - 90 * s, 46 * s, 56 * s), 1, 0.15); } }
// low 1890s skyline silhouette (chimneys, a steeple, a dome), base at y
function skyline(ctx, y, col = '#C9A585', seed = 0) { for (let i = 0; i < 16; i++) { const x = -2000 + i * 260 + hash(i + seed) * 60, w = 170 + hash(i * 3 + seed) * 120, h = 140 + hash(i * 5 + seed) * 220;
    rr(ctx, x, y - h, w, h + 10, 2); ink(ctx, col, 4); for (let r = 0; r < h / 60 - 1; r++) for (let c = 0; c < w / 55 - 1; c++) { rr(ctx, x + 18 + c * 55, y - h + 22 + r * 60, 22, 30, 2); ink(ctx, darken(col, 0.82), 0); }
    if (hash(i * 9 + seed) > 0.5) { rr(ctx, x + w * 0.7, y - h - 40, 20, 42, 2); ink(ctx, col, 3.5); }
    if (i % 6 === 3) { poly(ctx, [[x + w / 2 - 26, y - h], [x + w / 2 + 26, y - h], [x + w / 2, y - h - 170]]); ink(ctx, darken(col, 0.9), 4); } } }
// railway: ties + two rails at y (ground band below)
function rails(ctx, y, t = 0, speed = 0) { ctx.fillStyle = '#8C7458'; ctx.fillRect(-2600, y - 10, 5200, 60); for (let i = 0; i < 90; i++) { const x = -2600 + ((i * 60 - t * speed) % 5400 + 5400) % 5400; rr(ctx, x, y + 2, 26, 30, 3); ink(ctx, '#6B4123', 3); }
  for (const dy of [4, 20]) { ctx.fillStyle = '#9A9AA2'; ctx.fillRect(-2600, y + dy, 5200, 7); } ctx.beginPath(); ctx.moveTo(-2600, y + 4); ctx.lineTo(2600, y + 4); ink(ctx, null, 3); }
// steam locomotive (facing right) + tender, origin at rail level centre; t = time (wheel spin, rods, smoke)
function locomotive(ctx, x, y, s = 1, t = 0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const spin = t * (o.spin ?? 6), green = o.col || '#2E4A3E', red = '#9A2E22';
  // tender
  rr(ctx, -470, -250, 230, 180, 8); ink(ctx, green, 6); L.shade(ctx, () => rr(ctx, -470, -250, 230, 180, 8), 1, 0.14); ell(ctx, -355, -255, 105, 26); ink(ctx, '#2A2628', 5); fitText(ctx, o.tender || '', -355, -165, 32, YELLOW, 200);
  // frame
  rr(ctx, -230, -120, 520, 34, 6); ink(ctx, '#2A2628', 5);
  // boiler
  rr(ctx, -70, -250, 330, 132, 60); ink(ctx, green, 6); L.shade(ctx, () => rr(ctx, -70, -250, 330, 132, 60), 1, 0.16);
  for (const bx of [20, 110, 200]) { rr(ctx, bx, -252, 12, 136, 4); ink(ctx, '#D8B04A', 3.5); }
  ell(ctx, 262, -184, 22, 62); ink(ctx, '#3A3438', 5); // smokebox door
  // dome + sand box
  ctx.beginPath(); ctx.arc(60, -248, 34, Math.PI, 0); ctx.closePath(); ink(ctx, '#D8B04A', 5); ctx.beginPath(); ctx.arc(150, -248, 26, Math.PI, 0); ctx.closePath(); ink(ctx, green, 5);
  // diamond smokestack
  poly(ctx, [[196, -246], [230, -246], [252, -330], [174, -330]]); ink(ctx, '#2A2628', 5); rr(ctx, 166, -346, 94, 20, 6); ink(ctx, '#2A2628', 5);
  // headlamp
  rr(ctx, 240, -300, 56, 46, 6); ink(ctx, '#2A2628', 5); ctx.beginPath(); ctx.arc(292, -277, 16, 0, 6.27); ink(ctx, '#FFF2B0', 4); if (o.lamp) L.glow(ctx, 300, -277, 140, '#FFE7A0', 0.5);
  // cab
  rr(ctx, -230, -360, 170, 250, 8); ink(ctx, red, 6); L.shade(ctx, () => rr(ctx, -230, -360, 170, 250, 8), 1, 0.15); rr(ctx, -250, -384, 210, 34, 10); ink(ctx, '#2A2628', 5);
  rr(ctx, -205, -330, 110, 90, 8); ink(ctx, '#F7D27A', 5); if (o.driver) { ctx.save(); rr(ctx, -205, -330, 110, 90, 8); ctx.clip(); toon(ctx, -150, -180, 0.5, PEOPLE.worker, 'wave', 'happy', { t, noShadow: true }); ctx.restore(); }
  fitText(ctx, o.num || '1899', -145, -205, 30, YELLOW, 140);
  // cowcatcher
  poly(ctx, [[288, -120], [288, -30], [370, -30]]); ink(ctx, red, 5); for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(288 + i * 4, -120 + i * 22); ctx.lineTo(288 + i * 20, -30); ink(ctx, null, 3); }
  // wheels: drivers + leading + tender
  const wheel = (wx, r, sp = 6) => { ctx.save(); ctx.translate(wx, -r); ctx.rotate(spin * 46 / r); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, red, 6); ctx.beginPath(); ctx.arc(0, 0, r - 10, 0, 6.27); ink(ctx, '#2A2628', 3); for (let i = 0; i < sp; i++) { ctx.rotate(6.283 / sp); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r - 10); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); } ctx.beginPath(); ctx.arc(0, 0, 9, 0, 6.27); ink(ctx, '#D8B04A', 3); ctx.restore(); };
  wheel(-150, 62, 10); wheel(-10, 62, 10); wheel(190, 34); wheel(250, 34); wheel(-420, 36); wheel(-290, 36);
  // connecting rod
  const a = spin * 46 / 62, px = Math.sin(a) * 28, py = -62 + Math.cos(a) * 28; ctx.beginPath(); ctx.moveTo(-150 + px, py); ctx.lineTo(-10 + px, py); ctx.lineTo(130, -80); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = '#C9CDD2'; ctx.stroke();
  rr(ctx, 110, -100, 90, 44, 10); ink(ctx, '#3A3438', 5);
  ctx.restore(); }
// smoke puffs trailing behind a stack at (x,y) in world coords; t time, wind = drift to the left
function smoke(ctx, x, y, t, o = {}) { const n = o.n || 9, rate = o.rate || 0.9; for (let i = 0; i < n; i++) { const ph = (t * rate + i / n) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * (o.a || 0.9);
    L.cloud(ctx, x - ph * (o.drift ?? 700) + Math.sin(i * 2.3 + ph * 5) * 30, y - ph * (o.rise ?? 260), (o.s || 0.5) * (0.5 + ph * 1.6), o.col || '#ECE6DC'); ctx.restore(); } }
// passenger car (origin at rail level, centre)
function railcar(ctx, x, y, s = 1, t = 0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const col = o.col || '#7A3A2A';
  rr(ctx, -300, -300, 600, 210, 10); ink(ctx, col, 6); L.shade(ctx, () => rr(ctx, -300, -300, 600, 210, 10), 1, 0.13); rr(ctx, -320, -330, 640, 40, 16); ink(ctx, '#3A2A24', 5);
  for (let i = 0; i < 6; i++) { rr(ctx, -270 + i * 92, -270, 66, 80, 6); ink(ctx, '#F7D27A', 4); if (o.faces && hash(i + (o.seed || 0)) > 0.4) { ctx.save(); rr(ctx, -270 + i * 92, -270, 66, 80, 6); ctx.clip(); ctx.beginPath(); ctx.arc(-237 + i * 92, -205, 24, 0, 6.27); ink(ctx, L.SKIN[i % 7], 3); ctx.restore(); } }
  rr(ctx, -260, -170, 520, 40, 4); ink(ctx, darken(col, 0.85), 3); if (o.text) fitText(ctx, o.text, 0, -150, 30, YELLOW, 480);
  rr(ctx, -310, -100, 620, 26, 6); ink(ctx, '#2A2628', 4);
  for (const wx of [-230, -160, 160, 230]) { ctx.save(); ctx.translate(wx, -36); ctx.rotate(t * 8); ctx.beginPath(); ctx.arc(0, 0, 36, 0, 6.27); ink(ctx, '#2A2628', 5); ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.moveTo(0, -26); ctx.lineTo(0, 26); ink(ctx, '#8A8F96', 4); ctx.restore(); }
  ctx.restore(); }
// small railway station with a name board (origin = ground, centre)
function station(ctx, x, y, s = 1, name = 'STATION') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); L.planks(ctx, -330, -360, 660, 360, '#C9A06A', { vertical: true, pw: 30 }); ctx.beginPath(); ctx.rect(-330, -360, 660, 360); ink(ctx, null, 6);
  poly(ctx, [[-400, -350], [400, -350], [300, -470], [-300, -470]]); ink(ctx, '#7A3A2A', 6); L.shade(ctx, () => poly(ctx, [[-400, -350], [400, -350], [300, -470], [-300, -470]]), 1, 0.15);
  for (const wx of [-260, 140]) { rr(ctx, wx, -280, 120, 140, 6); ink(ctx, '#9CC7D8', 5); ctx.beginPath(); ctx.moveTo(wx + 60, -280); ctx.lineTo(wx + 60, -140); ctx.moveTo(wx, -210); ctx.lineTo(wx + 120, -210); ink(ctx, null, 4); }
  rr(ctx, -60, -260, 120, 260, 6); ink(ctx, '#5A3420', 5); rr(ctx, -260, -440, 520, 70, 8); ink(ctx, CREAM, 5); fitText(ctx, name, 0, -404, 46, INK, 480); ctx.restore(); }

// ---------- streets ----------
// generic 1890s Atlanta street front: row of storefronts; o.signs list, o.night
function streetRow(ctx, x0, y, o = {}) { const S = o.shops || [['DRY GOODS', '#A65A3E', ['#2E5A3E', CREAM]], ['HARDWARE', '#8E5A3E', [YELLOW, '#5A3420']], ['BANK', '#B8714C', null], ['HATS', '#9A6A4A', [RED, CREAM]], ['BOOKS', '#7E5A48', [BLUE, CREAM]]];
  let x = x0; S.forEach(([sign, col, aw], i) => { const w = 520 + hash(i * 3 + (o.seed || 0)) * 120, h = 520 + hash(i * 5 + (o.seed || 0)) * 140; P.storefront(ctx, x, y, { w, h, col, sign, awning: aw, night: o.night, upper: 3, ...(o.extra ? o.extra(i) : {}) }); x += w + 30; }); return x; }

// ---------- interiors ----------
// 1890s office back wall: wallpaper, wainscot, window with skyline, framed picture, bookcase. Floor from y=200.
function office(ctx, t = 0, o = {}) { const wp = o.wall || '#5E6B4E';
  L.wallpaper(ctx, -2000, -1200, 4000, 1400, wp, lighten(wp, 0.1), 54); L.planks(ctx, -2000, -40, 4000, 240, o.wood || '#6B4123', { vertical: true, pw: 60 }); rr(ctx, -2000, -52, 4000, 22, 4); ink(ctx, '#4A2E1E', 4);
  // window
  const wx = o.winX ?? -900; rr(ctx, wx - 20, -700, 520, 560, 10); ink(ctx, '#4A2E1E', 6); ctx.save(); rr(ctx, wx, -680, 480, 520, 6); ctx.clip();
  L.skyGrad(ctx, wx, -680, 480, 520, o.night ? ['#1E2240', '#4A3A5A'] : ERA.sepia.sky); if (o.night) { ctx.fillStyle = '#F6EBD3'; ctx.beginPath(); ctx.arc(wx + 360, -580, 34, 0, 6.27); ctx.fill(); }
  ctx.save(); ctx.translate(wx + 240, -160); ctx.scale(0.6, 0.6); skyline(ctx, 0, o.night ? '#3A3050' : '#C9A585', 4); ctx.restore(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(wx + 240, -680); ctx.lineTo(wx + 240, -160); ctx.moveTo(wx, -420); ctx.lineTo(wx + 480, -420); ink(ctx, '#4A2E1E', 8); rr(ctx, wx - 40, -168, 560, 30, 6); ink(ctx, '#7A4A2A', 5);
  // curtains
  for (const sx of [-1, 1]) { const cx = sx < 0 ? wx - 60 : wx + 540; ctx.beginPath(); ctx.moveTo(cx - 50, -740); ctx.lineTo(cx + 50, -740); ctx.bezierCurveTo(cx + 30, -500, cx + 70, -300, cx + 40, -120); ctx.lineTo(cx - 40, -120); ctx.bezierCurveTo(cx - 70, -300, cx - 30, -500, cx - 50, -740); ink(ctx, o.curtain || '#8A2E2A', 5); }
  rr(ctx, wx - 140, -760, 800, 24, 10); ink(ctx, '#D8B04A', 4);
  // framed picture + bookcase
  const px = o.picX ?? 250; rr(ctx, px, -640, 220, 280, 8); ink(ctx, '#B8863A', 7); rr(ctx, px + 22, -618, 176, 236, 4); ink(ctx, '#C9B48A', 3);
  ctx.save(); rr(ctx, px + 22, -618, 176, 236, 4); ctx.clip(); L.skyGrad(ctx, px, -620, 220, 240, ['#9DB4C0', '#E9D9B4']); ctx.translate(px + 110, -420); hills(ctx, 0, '#7FA36A', 20, 2); ctx.restore();
  if (o.books !== false) bookcase(ctx, o.bookX ?? 700, -720, 520, 700);
  if (o.clock) P.clock(ctx, o.clock[0], o.clock[1], 64, t * 2, { rim: '#7A4A2A' });
  L.planks(ctx, -2000, 200, 4000, 900, o.floor || '#8A5A33'); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-2000, 200, 4000, 30); }
function bookcase(ctx, x, y, w, h) { rr(ctx, x, y, w, h, 6); ink(ctx, '#4A2E1E', 6); const rows = 4, rh = (h - 20) / rows; for (let r = 0; r < rows; r++) { const yy = y + 10 + (r + 1) * rh; rr(ctx, x + 6, yy - 10, w - 12, 12, 2); ink(ctx, '#7A4A2A', 3);
    let xx = x + 16, i = 0; while (xx < x + w - 40) { const v = hash(r * 41 + i * 7 + x), bw = 18 + v * 22, bh = rh * (0.55 + v * 0.3); rr(ctx, xx, yy - 10 - bh, bw, bh, 3); ink(ctx, ['#8A2E2A', '#2E4A6A', '#3E5A3A', '#B8863A', '#5A3A5A', '#C9B48A'][Math.floor(v * 6)], 3); xx += bw + 3; i++; } } }
// big wooden desk; top surface at y; front panel below
function desk(ctx, x, y, w = 900, o = {}) { const col = o.col || '#7A4A2A'; rr(ctx, x - w / 2 - 20, y - 24, w + 40, 34, 8); ink(ctx, darken(col, 0.85), 6); rr(ctx, x - w / 2, y + 10, w, 300, 6); ink(ctx, col, 6); L.planks(ctx, x - w / 2 + 4, y + 14, w - 8, 292, col, { vertical: true, pw: 52 }); rr(ctx, x - w / 2, y + 10, w, 300, 6); ink(ctx, null, 6);
  for (const dx of [-w / 2 + 40, w / 2 - 260]) { rr(ctx, x + dx, y + 40, 220, 100, 6); ink(ctx, lighten(col, 0.08), 4); rr(ctx, x + dx + 85, y + 82, 50, 14, 6); ink(ctx, '#D8B04A', 3); } }
function lamp(ctx, x, y, s = 1, lit = true) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -40, -14, 80, 14, 6); ink(ctx, '#B8863A', 4); rr(ctx, -6, -130, 12, 118, 4); ink(ctx, '#B8863A', 4); poly(ctx, [[-60, -120], [60, -120], [34, -190], [-34, -190]]); ink(ctx, '#2F7A4A', 5); if (lit) L.glow(ctx, 0, -100, 220, '#FFD58A', 0.45); ctx.restore(); }
function inkwell(ctx, x, y) { rr(ctx, x - 22, y - 30, 44, 30, 6); ink(ctx, '#2A2628', 4); ctx.beginPath(); ctx.moveTo(x + 6, y - 30); ctx.lineTo(x + 40, y - 110); ink(ctx, null, 5); ctx.beginPath(); ctx.moveTo(x + 40, y - 110); ctx.quadraticCurveTo(x + 70, y - 140, x + 54, y - 80); ctx.closePath(); ink(ctx, '#F4F0E6', 3); }
// paper document with typed lines; o.title, o.lines (n), o.stamp
function doc(ctx, x, y, w, h, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.save(); ctx.translate(6, 8); ctx.globalAlpha = 0.25; rr(ctx, -w / 2, -h / 2, w, h, 4); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, 4); ink(ctx, o.bg || '#F4ECD8', 4); if (o.title) fitText(ctx, o.title, 0, -h / 2 + h * 0.12, Math.min(40, h * 0.09), INK, w * 0.85, { font: L.F.type });
  const n = o.lines ?? 6; ctx.strokeStyle = 'rgba(28,26,31,0.45)'; ctx.lineWidth = 3; for (let i = 0; i < n; i++) { const ly = -h / 2 + h * 0.26 + i * (h * 0.62 / n); ctx.beginPath(); ctx.moveTo(-w * 0.38, ly); ctx.lineTo(w * (0.38 - hash(i * 3 + w) * 0.25), ly); ctx.stroke(); }
  if (o.sign) { ctx.beginPath(); const sx = -w * 0.3, sy = h / 2 - h * 0.12, u = clamp(o.sign); ctx.moveTo(sx, sy); for (let i = 1; i <= 24 * u; i++) ctx.lineTo(sx + i * w * 0.022, sy + Math.sin(i * 1.3) * 10 - i * 0.6); ctx.lineWidth = 4; ctx.strokeStyle = '#1C2A5A'; ctx.stroke(); }
  if (o.draw) o.draw(ctx, w, h); ctx.restore(); }
// rubber stamp mark (pops at u, rotated)
function stampMark(ctx, s, x, y, u, o = {}) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); const k = 1 + (1 - E.out(clamp(u))) * 1.6; ctx.scale(k, k); ctx.globalAlpha = clamp(u * 3) * 0.92;
  const size = o.size || 70; ctx.font = `${size}px ${L.F.black}`; const w = ctx.measureText(s).width + size * 0.8, h = size * 1.4; rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.lineWidth = 8; ctx.strokeStyle = o.col || RED; ctx.stroke(); fitText(ctx, s, 0, 4, size, o.col || RED, w - 30); ctx.restore(); }
// soda-fountain room (Jacobs'-style): back bar with mirror + jars, marble counter (props.fountain), floor tiles. Floor at y=200.
function fountainRoom(ctx, t = 0, o = {}) { L.wallpaper(ctx, -2200, -1200, 4400, 1400, o.wall || '#7A3F2E', lighten(o.wall || '#7A3F2E', 0.1));
  rr(ctx, -1100, -720, 2200, 560, 10); ink(ctx, '#5A3420', 8); rr(ctx, -1040, -680, 2080, 300, 8); ink(ctx, '#BFD6D8', 5); ctx.save(); rr(ctx, -1040, -680, 2080, 300, 8); ctx.clip(); ctx.globalAlpha = 0.35; for (let i = 0; i < 6; i++) { poly(ctx, [[-1000 + i * 380, -680], [-920 + i * 380, -680], [-1080 + i * 380, -380], [-1160 + i * 380, -380]]); ctx.fillStyle = '#FFF'; ctx.fill(); } ctx.restore();
  fitText(ctx, o.sign || 'SODA FOUNTAIN', 0, -620, 60, '#5A3420', 900); for (let i = 0; i < 14; i++) { const jx = -1000 + i * 150, v = hash(i * 3); rr(ctx, jx, -360 - v * 60, 70, 140 + v * 60, 10); ink(ctx, ['#B7D7C9', '#E3C77D', '#C46A4A', '#8FB6D8', '#D9D2C2'][i % 5], 4); rr(ctx, jx + 14, -374 - v * 60, 42, 16, 4); ink(ctx, '#3A2A1E', 3); }
  rr(ctx, -1100, -190, 2200, 30, 6); ink(ctx, '#7A4A2A', 5);
  for (const lx of [-700, 0, 700]) { ctx.beginPath(); ctx.moveTo(lx, -1200); ctx.lineTo(lx, -800); ink(ctx, null, 4); ell(ctx, lx, -780, 50, 30); ink(ctx, '#F7D27A', 5); L.glow(ctx, lx, -760, 300, '#FFD58A', 0.3); }
  L.tiles(ctx, -2200, 200, 4400, 900, '#E8DCC4', '#B9A88E', 70); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-2200, 200, 4400, 30); }

// ---------- small props ----------
function envelope(ctx, x, y, s = 1, rot = 0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(ctx, -70, -45, 140, 90, 5); ink(ctx, o.col || '#F4ECD8', 4); ctx.beginPath(); ctx.moveTo(-70, -45); ctx.lineTo(0, 8); ctx.lineTo(70, -45); ink(ctx, null, 3); rr(ctx, 36, -36, 24, 26, 2); ink(ctx, RED, 2.5); ctx.restore(); }
function miniTicket(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); rr(ctx, -70, -34, 140, 68, 6); ink(ctx, CREAM, 4); ctx.setLineDash([6, 6]); rr(ctx, -58, -24, 116, 48, 4); ink(ctx, null, 2); ctx.setLineDash([]); fitText(ctx, 'FREE', 0, -4, 30, RED, 100); fitText(ctx, 'ONE GLASS', 0, 18, 13, INK, 100, { font: L.F.type }); ctx.restore(); }
function bulb(ctx, x, y, s = 1, u = 1) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); const k = E.back(clamp(u), 2.4) * s; ctx.scale(k, k); L.glow(ctx, 0, 0, 160, '#FFF0A0', 0.6); ctx.beginPath(); ctx.arc(0, 0, 46, 0.7, Math.PI - 0.7, true); ctx.lineTo(-20, 52); ctx.lineTo(20, 52); ctx.closePath(); ink(ctx, '#FFF2A0', 5); rr(ctx, -22, 50, 44, 30, 6); ink(ctx, '#B8B2A8', 4);
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 62, Math.sin(a) * 62); ctx.lineTo(Math.cos(a) * 84, Math.sin(a) * 84); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); } ctx.restore(); }
function cobweb(ctx, x, y, r, u = 1, dir = 1) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.globalAlpha = clamp(u) * 0.85; ctx.strokeStyle = '#F4F0E6'; ctx.lineWidth = 2.5; const n = 6;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * u, Math.sin(a) * r * u); ctx.stroke(); }
  for (let k = 1; k <= 4; k++) { const rk = r * u * k / 4.4; ctx.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2, m = i ? 0.9 : 1; const px = Math.cos(a) * rk, py = Math.sin(a) * rk; if (!i) ctx.moveTo(px, py); else ctx.quadraticCurveTo(Math.cos(a - Math.PI / 12) * rk * 0.85, Math.sin(a - Math.PI / 12) * rk * 0.85, px, py); } ctx.stroke(); } ctx.restore(); }
function spider(ctx, x, y, s = 1, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(0, -14); ctx.strokeStyle = '#F4F0E6'; ctx.lineWidth = 2; ctx.stroke(); for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(sx * 22, -14 + i * 8, sx * (30 + Math.sin(t * 8 + i) * 3), 6 + i * 6); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); }
  ell(ctx, 0, 0, 16, 18); ink(ctx, '#2A2628', 3); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 6, -6, 4, 0, 6.27); ctx.fillStyle = '#FFF'; ctx.fill(); } ctx.restore(); }
function dust(ctx, x, y, w, h, t, a = 0.5) { ctx.save(); for (let i = 0; i < 26; i++) { const ph = (t * 0.08 + hash(i * 3.3)) % 1; ctx.globalAlpha = a * Math.sin(ph * Math.PI); ctx.beginPath(); ctx.arc(x + hash(i * 1.7) * w + Math.sin(t + i) * 10, y + ph * h, 2 + hash(i) * 3, 0, 6.27); ctx.fillStyle = '#FFF4DA'; ctx.fill(); } ctx.restore(); }
// round serving tray, wall calendar, paper fan (name in plain bold type)
function tray(ctx, x, y, r = 90, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, RED, 6); ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, 6.27); ink(ctx, '#B82E2A', 3); P.glassCup(ctx, 0, r * 0.45, r / 180, { fill: 0.8 }); fitText(ctx, 'COCA-COLA', 0, -r * 0.45, r * 0.24, CREAM, r * 1.5); ctx.restore(); }
function fan(ctx, x, y, r = 110, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); rr(ctx, -10, -10, 20, r * 0.9, 6); ink(ctx, '#B8863A', 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, Math.PI * 1.1, Math.PI * 1.9); ctx.closePath(); ink(ctx, CREAM, 5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, Math.PI * 1.1, Math.PI * 1.9); ctx.closePath(); ctx.clip(); for (let i = 0; i < 9; i++) { const a = Math.PI * (1.1 + i * 0.1); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(28,26,31,0.3)'; ctx.stroke(); } ctx.restore();
  fitText(ctx, 'COCA-COLA', 0, -r * 0.62, r * 0.2, RED, r * 1.0); ctx.restore(); }
// painted wall sign
function wallSign(ctx, x, y, w, h, s, u = 1, o = {}) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); const k = E.back(clamp(u), 2); ctx.scale(k, k); ctx.rotate(o.rot || 0); rr(ctx, -w / 2, -h / 2, w, h, 6); ink(ctx, o.bg || RED, 5); rr(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 4); ink(ctx, null, 2, { stroke: CREAM }); fitText(ctx, s, 0, 3, h * 0.42, o.fg || CREAM, w - 40); if (o.sub) fitText(ctx, o.sub, 0, h * 0.3, h * 0.14, o.fg || CREAM, w - 40, { font: L.F.type }); ctx.restore(); }
// mitten hand with a sleeve, pointing in direction a (rad), tip at (x,y)
function arm(ctx, x, y, a, len, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); rr(ctx, -len, -34, len - 30, 68, 20); ink(ctx, o.sleeve || '#3A3F4A', 6); rr(ctx, -60, -40, 22, 80, 8); ink(ctx, '#F4F0E6', 5); ell(ctx, -6, 0, 40, 34); ink(ctx, o.skin || '#EFC8A4', 6); ell(ctx, 4, -26, 16, 12, 0.6); ink(ctx, o.skin || '#EFC8A4', 5); ctx.restore(); }
// stone pedestal + spotlight cone
function spotlight(ctx, x, yTop, yBot, w, a = 0.35) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createLinearGradient(0, yTop, 0, yBot); g.addColorStop(0, 'rgba(255,240,200,0.9)'); g.addColorStop(1, 'rgba(255,240,200,0.15)'); ctx.fillStyle = g; poly(ctx, [[x - 40, yTop], [x + 40, yTop], [x + w, yBot], [x - w, yBot]]); ctx.fill(); ctx.restore(); }
function pedestal(ctx, x, y, s = 1, label) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -150, -40, 300, 40, 6); ink(ctx, '#B9B0A0', 5); rr(ctx, -110, -300, 220, 262, 6); ink(ctx, '#D9D2C2', 5); L.shade(ctx, () => rr(ctx, -110, -300, 220, 262, 6), 1, 0.12); rr(ctx, -140, -330, 280, 36, 6); ink(ctx, '#B9B0A0', 5); if (label) { rr(ctx, -80, -190, 160, 50, 4); ink(ctx, '#D8B04A', 4); fitText(ctx, label, 0, -164, 26, INK, 140, { font: L.F.type }); } ctx.restore(); }
function barrel(ctx, x, y, s = 1, label = 'SYRUP', rot = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(-70, 0); ctx.bezierCurveTo(-90, -60, -90, -140, -70, -200); ctx.lineTo(70, -200); ctx.bezierCurveTo(90, -140, 90, -60, 70, 0); ctx.closePath(); ink(ctx, '#A8743F', 6);
  L.shade(ctx, () => { ctx.beginPath(); ctx.moveTo(-70, 0); ctx.bezierCurveTo(-90, -60, -90, -140, -70, -200); ctx.lineTo(70, -200); ctx.bezierCurveTo(90, -140, 90, -60, 70, 0); ctx.closePath(); }, 1, 0.16);
  for (const by of [-30, -170]) { rr(ctx, -82, by - 8, 164, 16, 4); ink(ctx, '#5A5A62', 4); } if (label) { rr(ctx, -56, -124, 112, 46, 4); ink(ctx, CREAM, 4); fitText(ctx, label, 0, -100, 26, '#7A2E1E', 100); } ctx.restore(); }
// small brick bottling plant (origin = ground centre), smoke with t; o.sign
function plant(ctx, x, y, s = 1, t = 0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, 150, -420, 60, 300, 4); ink(ctx, '#7E4634', 5); rr(ctx, 142, -436, 76, 22, 4); ink(ctx, '#3A3438', 4);
  L.bricks(ctx, -260, -300, 520, 300, o.col || '#A65A44', { bw: 40, bh: 16 }); ctx.beginPath(); ctx.rect(-260, -300, 520, 300); ink(ctx, null, 6);
  poly(ctx, [[-290, -296], [290, -296], [180, -380], [-180, -380]]); ink(ctx, '#5A5A62', 6); for (let i = 0; i < 3; i++) { rr(ctx, -220 + i * 120, -250, 80, 90, 6); ink(ctx, o.night ? '#F7D27A' : '#9CC7D8', 4); }
  rr(ctx, 120, -150, 110, 150, 6); ink(ctx, '#5A3420', 5); rr(ctx, -240, -140, 330, 56, 6); ink(ctx, CREAM, 4); fitText(ctx, o.sign || 'BOTTLING WORKS', -75, -112, 30, '#7A2E1E', 300);
  if (o.smoke !== false) smoke(ctx, 180, -440, t, { n: 6, rate: 0.5, drift: 200, rise: 260, s: 0.45, col: '#E4DED4' }); ctx.restore(); }
// conveyor belt with bottles moving right
function conveyor(ctx, x0, x1, y, t, o = {}) { rr(ctx, x0, y, x1 - x0, 34, 16); ink(ctx, '#3A3438', 5); for (let i = 0; i < (x1 - x0) / 60; i++) { ctx.beginPath(); ctx.arc(x0 + 30 + i * 60, y + 17, 9, 0, 6.27); ink(ctx, '#8A8F96', 3); }
  for (let i = 0; i < (x1 - x0) / (o.gap || 110) + 1; i++) { const bx = x0 + ((i * (o.gap || 110) + t * (o.speed || 120)) % (x1 - x0)); P.bottle(ctx, bx, y, o.s || 0.42, { kind: o.kind || 'straight', label: o.label ?? '' }); } }

// ---------- map of the United States (lower 48, simplified outline) ----------
const US = [[-124.7, 48.4], [-123, 49], [-95.2, 49], [-95.2, 49.4], [-89.6, 48], [-84.8, 46.5], [-83, 46], [-82.5, 43], [-79, 43.3], [-76.5, 44.2], [-75, 45], [-71.5, 45], [-69.2, 47.4], [-67.8, 47], [-67, 44.8], [-70, 43.7], [-70.6, 42.6], [-70, 41.7],
  [-71.8, 41.3], [-74, 40.6], [-74, 39.4], [-75.5, 38.5], [-76, 37], [-75.5, 35.3], [-77, 34.4], [-79, 33.2], [-81, 31.5], [-81.4, 30], [-80.1, 26.8], [-80.3, 25.3], [-81.1, 25.1], [-82.7, 27.5], [-82.7, 29], [-84, 30], [-85.4, 29.7], [-87, 30.4], [-89.5, 30.2], [-89.3, 29.1],
  [-91, 29.2], [-93.8, 29.7], [-95, 29.2], [-97.2, 27.6], [-97.2, 25.9], [-99.5, 27.5], [-101.4, 29.8], [-103, 29], [-104.5, 29.6], [-106.5, 31.8], [-108.2, 31.8], [-111, 31.3], [-114.8, 32.5], [-117.1, 32.5], [-118.5, 34], [-120.6, 34.6], [-122.4, 37.2], [-124.2, 40.3], [-124.4, 42.8], [-124, 46.3]];
const CITY = { atlanta: [-84.4, 33.75], chattanooga: [-85.3, 35.05], birmingham: [-86.8, 33.5], nashville: [-86.8, 36.2], memphis: [-90, 35.1], neworleans: [-90.1, 30], dallas: [-96.8, 32.8], stlouis: [-90.2, 38.6], chicago: [-87.6, 41.9], louisville: [-85.7, 38.2],
  richmond: [-77.4, 37.5], charlotte: [-80.8, 35.2], jacksonville: [-81.7, 30.3], kansascity: [-94.6, 39.1], denver: [-105, 39.7], philadelphia: [-75.2, 40], cleveland: [-81.7, 41.5], minneapolis: [-93.3, 45], omaha: [-96, 41.3], houston: [-95.4, 29.8],
  sanantonio: [-98.5, 29.4], oklahoma: [-97.5, 35.5], losangeles: [-118.2, 34], sanfrancisco: [-122.4, 37.8], seattle: [-122.3, 47.6], saltlake: [-111.9, 40.8], phoenix: [-112, 33.4], savannah: [-81.1, 32.1], pittsburgh: [-80, 40.4], detroit: [-83, 42.3], indianapolis: [-86.2, 39.8], baltimore: [-76.6, 39.3], elpaso: [-106.5, 31.8], portland: [-122.7, 45.5] };
const usXY = (lon, lat, k) => [(lon + 96) * k * 0.8, -(lat - 37.5) * k];
// usMap(ctx, cx, cy, k, o): k = px per degree; o.cell(cx,cy,lon,lat,i) -> fill colour | null (state-like quilt cells); o.base, o.lw
function usMap(ctx, cx, cy, k, o = {}) { ctx.save(); ctx.translate(cx, cy); const path = () => { ctx.beginPath(); US.forEach(([lo, la], i) => { const [x, y] = usXY(lo, la, k); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); };
  ctx.save(); ctx.translate(12, 16); path(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; ctx.fill(); ctx.restore(); path(); ink(ctx, o.base || '#EADCB8', 0);
  ctx.save(); path(); ctx.clip(); const nx = 15, ny = 7, lon0 = -125.5, lon1 = -66.5, lat0 = 24.5, lat1 = 49.6, dl = (lon1 - lon0) / nx, dt = (lat1 - lat0) / ny;
  const V = (i, j) => { const jit = (i > 0 && i < nx && j > 0 && j < ny) ? 1 : 0; return usXY(lon0 + i * dl + jit * (hash(i * 31 + j * 7) - 0.5) * dl * 0.5, lat1 - j * dt + jit * (hash(i * 13 + j * 17) - 0.5) * dt * 0.5, k); };
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const lon = lon0 + (i + 0.5) * dl, lat = lat1 - (j + 0.5) * dt; const col = o.cell ? o.cell(lon, lat, i * ny + j) : null; poly(ctx, [V(i, j), V(i + 1, j), V(i + 1, j + 1), V(i, j + 1)]); ctx.fillStyle = col || (o.base || '#EADCB8'); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(90,60,40,0.45)'; ctx.setLineDash([7, 6]); ctx.stroke(); ctx.setLineDash([]); }
  ctx.restore(); path(); ink(ctx, null, o.lw || 6); ctx.restore(); }
const usPt = (cx, cy, k, name) => { const c = typeof name === 'string' ? CITY[name] : name, [x, y] = usXY(c[0], c[1], k); return [cx + x, cy + y]; };
// map backdrop: sea paper + compass + waves
function mapSea(ctx, t = 0) { ctx.fillStyle = '#A9C9C6'; ctx.fillRect(-2400, -1400, 4800, 2800); ctx.strokeStyle = 'rgba(40,80,90,0.35)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 70; i++) { const x = -2200 + hash(i * 1.3) * 4400 + Math.sin(t + i) * 8, y = -1200 + hash(i * 2.9) * 2400; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20, y - 12, x + 40, y); ctx.quadraticCurveTo(x + 60, y + 12, x + 80, y); ctx.stroke(); }
  ctx.save(); ctx.translate(780, 300); ctx.rotate(Math.sin(t * 0.3) * 0.05); ctx.beginPath(); ctx.arc(0, 0, 90, 0, 6.27); ink(ctx, CREAM, 5); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); poly(ctx, [[0, -110], [16, 0], [-16, 0]]); ink(ctx, i % 2 ? CREAM : RED, 4); } fitText(ctx, 'N', 0, -140, 40, INK, 60); ctx.restore(); }
// tiny factory pin for maps
function pinPlant(ctx, x, y, u, t = 0, s = 1) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); const k = E.back(clamp(u), 2.6) * s; ctx.scale(k, k); rr(ctx, 4, -62, 12, 30, 2); ink(ctx, '#7E4634', 3); rr(ctx, -22, -36, 44, 36, 3); ink(ctx, '#B8573E', 4); poly(ctx, [[-26, -34], [26, -34], [0, -52]]); ink(ctx, '#5A5A62', 3);
  for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * 0.8; ctx.beginPath(); ctx.arc(10 - ph * 30, -66 - ph * 40, 6 + ph * 10, 0, 6.27); ctx.fillStyle = '#F4F0E6'; ctx.fill(); ctx.restore(); } ctx.restore(); }

module.exports = { PEOPLE, sky, hills, trees, skyline, rails, locomotive, smoke, railcar, station, streetRow, office, bookcase, desk, lamp, inkwell, doc, stampMark, fountainRoom, envelope, miniTicket, bulb, cobweb, spider, dust, tray, fan, wallSign, arm, spotlight, pedestal, barrel, plant, conveyor, US, CITY, usXY, usMap, usPt, mapSea, pinPlant };
