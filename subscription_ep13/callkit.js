// Episode 13 "The Comcast Call That Wouldn't End" sets, props and cast (on hirkit): Veronica and Ryan, the retention employee (always seen
// from behind, no face, no name), the 2014 apartment at dusk, the call centre (one desk, then the whole floor and the cords under it),
// a Comcast store counter, the executive office, a 2014 phone with the call timer, the laptop, WHY? bubbles, the statement, the memo,
// the training binder and the pay envelope. Generic places, no logos: brand names appear as plain text only.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, shade, fillStroke, ell, px } = R;

const W = 1080, H = 1920;
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2 + (c.shx || 0) * d, H / 2 + (c.shy || 0) * d); ctx.rotate((c.r || 0) * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center') { ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align); return size; }
const BLUE = '#4D8DFF', NAVY = '#2E3A59', CREAM = '#FFFDF8';

// ---------- cast (generic figures, no likeness) ----------
const VER = { skin: '#F0C3A2', hair: '#8A3B24', hairStyle: 'long', top: '#3E9E8A', cuff: '#2F8574', shirt: CREAM, pants: NAVY, shoes: '#3A2A22', iris: '#4E6B3C', lashes: 1, lips: '#B0504A', brow: '#6A2A18' };
const RYAN = { skin: '#E8B48F', hair: '#3A2618', hairStyle: 'short', top: '#6A7180', cuff: '#59606E', shirt: '#2E3A59', zip: 1, pants: '#3A3F48', shoes: '#F7F5F0', sole: '#C9C1B1', iris: '#3A2414', brow: '#2A1A10' };
const CLERK = { skin: '#8D5A3C', hair: '#1E1612', hairStyle: 'bun', top: NAVY, collar: CREAM, pants: '#3A3F48', shoes: '#3A2A22', iris: '#3A2414', lashes: 1, lips: '#7A3434' };
const REP_TOP = BLUE, REP_HAIR = '#2A1E16', REP_SKIN = '#D9A27E';
const STAFF = [['#4D8DFF', '#2A1E16', '#D9A27E'], ['#3E9E8A', '#4A3222', '#8D5A3C'], ['#E8A33D', '#1E1612', '#F0C3A2'], ['#9B6BC4', '#6A4A2A', '#C88A64'], ['#E06A6A', '#2A1E16', '#E8B48F'], ['#5A9BD5', '#8A6A3A', '#6E4630']];

// ---------- the retention employee, from behind (neck base at x, y; s scale). He has no face on screen. ----------
// o: { slump 0..1, talk 0..1 (head bob), turn -1..1 (tiny head turn), top, hair, skin, mic: true } -> returns the cord start (local units, ear cup bottom)
function repBack(ctx, x, y, s, o = {}) {
  const top = o.top || REP_TOP, hair = o.hair || REP_HAIR, sk = o.skin || REP_SKIN, sl = o.slump || 0, bob = Math.sin((o.t || 0) * 9) * 4 * (o.talk || 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // back + shoulders (a polo shirt), slumped shoulders rise and the head drops
  const sh = sl * 26;
  const back = () => { ctx.beginPath(); ctx.moveTo(-40, -10 + sh * 0.4); ctx.bezierCurveTo(-90, -8 + sh, -150, 10 + sh, -170, 60 + sh); ctx.bezierCurveTo(-188, 110, -190, 200, -188, 420);
    ctx.lineTo(188, 420); ctx.bezierCurveTo(190, 200, 188, 110, 170, 60 + sh); ctx.bezierCurveTo(150, 10 + sh, 90, -8 + sh, 40, -10 + sh * 0.4); ctx.closePath(); };
  back(); fillStroke(ctx, top);
  ctx.save(); back(); ctx.clip(); let g = ctx.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, 'rgba(255,255,255,0.14)'); g.addColorStop(1, 'rgba(20,10,30,0.28)'); ctx.fillStyle = g; ctx.fillRect(-200, -20, 400, 450);
  ctx.strokeStyle = shade(top, -0.3); ctx.lineWidth = px(ctx, 3.5); ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, 420); ctx.stroke(); // back seam
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 130, 50 + sh); ctx.bezierCurveTo(sx * 112, 150, sx * 118, 260, sx * 126, 420); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(-46, -6 + sh * 0.4); ctx.quadraticCurveTo(0, 18, 46, -6 + sh * 0.4); ctx.lineTo(40, -22); ctx.quadraticCurveTo(0, -2, -40, -22); ctx.closePath(); fillStroke(ctx, shade(top, -0.12)); // collar
  // neck + head (back of the head: hair, ears)
  const hy = -110 + sl * 34 + bob, hx = (o.turn || 0) * 10;
  R.tube(ctx, [[0, -4], [hx * 0.5, hy + 50]], 56, shade(sk, -0.1));
  for (const sx of [-1, 1]) { ell(ctx, hx + sx * 74, hy + 8, 15, 24); fillStroke(ctx, sk); }
  ell(ctx, hx, hy, 76, 84); fillStroke(ctx, hair);
  ctx.save(); ell(ctx, hx, hy, 76, 84); ctx.clip(); ctx.strokeStyle = shade(hair, 0.22); ctx.lineWidth = 4; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(hx + i * 18, hy - 80); ctx.quadraticCurveTo(hx + i * 22, hy, hx + i * 16, hy + 80); ctx.stroke(); }
  ell(ctx, hx, hy + 70, 60, 24); ctx.fillStyle = shade(sk, -0.15); ctx.fill(); ctx.restore(); // nape
  // headset: band over the head, ear cups, mic boom pointing forward (away from us)
  ctx.strokeStyle = INK; ctx.lineWidth = 13; ctx.beginPath(); ctx.arc(hx, hy + 6, 84, Math.PI * 1.04, Math.PI * 1.96); ctx.stroke();
  ctx.strokeStyle = '#4A4F57'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(hx, hy + 6, 84, Math.PI * 1.06, Math.PI * 1.94); ctx.stroke();
  for (const sx of [-1, 1]) { rr(ctx, hx + sx * 80 - 15, hy - 14, 30, 50, 12); fillStroke(ctx, '#3A3F48', 4.5); }
  if (o.mic !== false) { ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(hx - 82, hy + 30); ctx.quadraticCurveTo(hx - 110, hy + 80, hx - 70, hy + 110); ctx.stroke(); }
  ctx.restore();
  return [x + (hx - 82) * s, y + (hy + 36) * s]; // cord start in the caller's space
}

// a coiled-then-smooth phone/headset cord through points (current transform). coil: number of loops near the start
function cord(ctx, pts, o = {}) {
  if (pts.length < 2) return;
  const w = o.w ?? 9, path = [];
  // Catmull-Rom through the points
  for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 12; k++) { const u = k / 12, u2 = u * u, u3 = u2 * u;
      path.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]); } }
  path.push(pts[pts.length - 1]);
  const n = Math.floor(path.length * clamp(o.upto ?? 1)); if (n < 2) return;
  const coil = o.coil || 0;
  const stroke = (col, lw) => { ctx.beginPath(); ctx.moveTo(...path[0]);
    for (let i = 1; i < n; i++) { const p = path[i]; if (coil && i < coil * 6) { const a = i * 1.1, q = path[i - 1], dx = p[0] - q[0], dy = p[1] - q[1], l = Math.hypot(dx, dy) || 1; ctx.lineTo(p[0] - dy / l * Math.sin(a) * w * 1.6, p[1] + dx / l * Math.sin(a) * w * 1.6); } else ctx.lineTo(...p); }
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
  stroke(INK, w + px(ctx, 5) * 1.6); stroke(o.col || '#2B2F36', w); stroke('rgba(255,255,255,0.22)', w * 0.3);
  return path[n - 1];
}

// ---------- WHY? speech bubble (paper), centred; tail toward (tx, ty) local; o: { s, col, fg, squash, label } ----------
function whyBubble(ctx, o = {}) {
  const s = o.s ?? 1, label = o.label || 'WHY?';
  ctx.save(); ctx.scale(s * (o.squash ? 1 + o.squash * 0.15 : 1), s * (o.squash ? 1 - o.squash * 0.45 : 1)); ctx.rotate(o.rot || 0);
  ctx.font = `92px ${F.black}`; const w = ctx.measureText(label).width + 90, h = 150, tx = o.tail?.[0] ?? -w * 0.3, ty = o.tail?.[1] ?? h * 0.9;
  CL.cutout(ctx, () => { rr(ctx, -w / 2, -h / 2, w, h, 60); ctx.moveTo(-w * 0.12, h / 2 - 2); ctx.lineTo(tx, ty); ctx.lineTo(-w * 0.32, h / 2 - 2); }, o.col || CREAM, { elev: o.elev ?? 1.3 });
  txt(ctx, label, 0, 32, 92, o.fg || C.red); ctx.restore();
}
// a general speech bubble with wrapped text lines (quotes); returns height. o: { w, size, col, fg, tail: [x,y], hl: {word: colour} }
function quoteBubble(ctx, lines, o = {}) {
  const size = o.size || 56, lh = size * 1.18, w = o.w || 900, h = lines.length * lh + size * 1.1, tx = o.tail?.[0] ?? -w * 0.25, ty = o.tail?.[1] ?? h / 2 + 90;
  CL.cutout(ctx, () => { rr(ctx, -w / 2, -h / 2, w, h, 44); ctx.moveTo(-w * 0.1 + (tx > 0 ? w * 0.3 : 0), h / 2 - 2); ctx.lineTo(tx, ty); ctx.lineTo(-w * 0.26 + (tx > 0 ? w * 0.3 : 0), h / 2 - 2); }, o.col || CREAM, { elev: 1.5 });
  lines.forEach((L, i) => { const y = -h / 2 + size * 0.55 + lh * (i + 0.72);
    if (o.hl && o.hl[i] !== undefined) { ctx.font = `${size}px ${F.black}`; const ww = Math.min(w - 50, ctx.measureText(L).width + 30); ctx.fillStyle = o.hl[i]; rr(ctx, -ww / 2, y - size * 0.82, ww, size * 1.06, 10); ctx.fill(); }
    fitTxt(ctx, L, 0, y, size, o.fg || INK, w - 60); });
  return h;
}

// ---------- the 2014 phone (portrait, centred, ~260 x 520 at s = 1) ----------
// o: { min (call minutes, float), name, ended, rec, glow, buzz, screen(ctx, w, h) override }
function mmss(m) { const s = Math.max(0, Math.floor(m * 60)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
function phone(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); if (o.buzz) ctx.translate(Math.sin(o.buzz * 90) * 5, 0);
  CL.cutout(ctx, () => rr(ctx, -130, -260, 260, 520, 38), '#1B1D24', { elev: o.elev ?? 1.2, tex: 0 });
  if (o.back) { ctx.fillStyle = '#2E323B'; rr(ctx, -118, -248, 236, 496, 30); ctx.fill(); ell(ctx, -70, -200, 22, 22); ctx.fillStyle = '#0E0F12'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#5A5F68'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-118, -248, 40, 496); ctx.restore(); return; }
  ctx.fillStyle = '#2A2D35'; rr(ctx, -122, -252, 244, 504, 32); ctx.fill();
  ell(ctx, 0, 222, 22, 22); ctx.lineWidth = 3; ctx.strokeStyle = '#4A4F57'; ctx.stroke(); // home button
  rr(ctx, -26, -232, 52, 8, 4); ctx.fillStyle = '#0E0F12'; ctx.fill();
  ctx.save(); rr(ctx, -112, -205, 224, 400, 6); ctx.clip(); ctx.translate(-112, -205);
  (o.screen || callScreen)(ctx, 224, 400, o); ctx.restore();
  ctx.restore();
}
function callScreen(ctx, w, h, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, o.ended ? '#3A3F48' : '#2B3B57'); g.addColorStop(1, o.ended ? '#24272E' : '#16202F'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  fitTxt(ctx, o.name || 'COMCAST', w / 2, 52, 26, '#FFFDF8', w - 20); txt(ctx, o.ended ? 'CALL ENDED' : 'CUSTOMER SERVICE', w / 2, 80, 14, o.ended ? C.red : '#A9B8CE');
  txt(ctx, mmss(o.min || 0), w / 2, 150, 58, o.ended ? C.red : '#FFFDF8');
  if (o.rec) { ell(ctx, w / 2 - 38, 180, 7, 7); ctx.fillStyle = C.red; ctx.fill(); txt(ctx, 'REC', w / 2 + 8, 186, 18, C.red); }
  const lb = ['mute', 'keypad', 'speaker', 'add', 'hold', 'contacts'];
  for (let i = 0; i < 6; i++) { const x = w / 2 + ((i % 3) - 1) * 70, y = 232 + Math.floor(i / 3) * 70; ell(ctx, x, y, 26, 26); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke(); txt(ctx, lb[i], x, y + 42, 11, '#A9B8CE'); }
  ell(ctx, w / 2, 365, 28, 28); ctx.fillStyle = o.ended ? '#5A5F68' : '#E0393E'; ctx.fill();
  ctx.save(); ctx.translate(w / 2, 365); ctx.rotate(2.35); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 11, -0.9, 0.9); ctx.stroke(); ctx.restore();
}
// a voice-recorder app screen (generic), big red button
function recScreen(ctx, w, h, o = {}) {
  ctx.fillStyle = '#EDEBE6'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = NAVY; ctx.fillRect(0, 0, w, 50); txt(ctx, 'VOICE RECORDER', w / 2, 33, 18, '#FFFDF8');
  const on = o.on || 0; txt(ctx, on > 0 ? mmss((o.recMin || 0)) : '00:00', w / 2, 140, 44, on > 0 ? C.red : '#5A5450');
  // waveform
  ctx.fillStyle = on > 0 ? C.red : '#B8B2A8'; for (let i = 0; i < 30; i++) { const a = on > 0 ? (0.2 + 0.8 * Math.abs(Math.sin(i * 1.7 + (o.t || 0) * 9) * Math.sin(i * 0.4 + (o.t || 0) * 3))) : 0.08; ctx.fillRect(16 + i * 6.5, 210 - a * 40, 4, a * 80); }
  ell(ctx, w / 2, 320, 46 + on * 4, 46 + on * 4); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#3A3F48'; ctx.stroke();
  if (on > 0) { rr(ctx, w / 2 - 18, 302, 36, 36, 6); ctx.fillStyle = C.red; ctx.fill(); } else { ell(ctx, w / 2, 320, 30, 30); ctx.fillStyle = C.red; ctx.fill(); }
}

// ---------- laptop (side view, hinge at 0,0, screen up) ----------
function laptop(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-200, 0); ctx.lineTo(200, 0); ctx.lineTo(220, 18); ctx.lineTo(-220, 18); ctx.closePath(); fillStroke(ctx, '#B8BEC8', 4.5);
  ctx.save(); ctx.transform(1, 0, -0.18, 1, 0, 0); rr(ctx, -190, -270, 380, 266, 14); fillStroke(ctx, '#3A3F48', 4.5);
  ctx.save(); rr(ctx, -176, -256, 352, 238, 6); ctx.clip(); ctx.translate(-176, -256); (o.screen || ((c, w, h) => { c.fillStyle = '#DDE6F2'; c.fillRect(0, 0, w, h); }))(ctx, 352, 238); ctx.restore();
  ctx.restore(); if (o.glow) LT.glow(ctx, 0, -130, 420, 'rgba(170,200,255,1)', o.glow);
  ctx.restore();
}

// ---------- sets ----------
// the apartment, dusk, 2014 (floor y = 0, world x -2400..2400): window with the city, lamp, sofa, coffee table with the new router box and tea,
// Ryan's desk on the right, wall clock. o: { clock (minutes past), steam 0..1, lamp 1, sofa: true, desk: true, table: true, why: n bubbles on the wall }
function apartment(ctx, t, o = {}) {
  ctx.fillStyle = '#E9DCC6'; ctx.fillRect(-2600, -2400, 5200, 2400);
  ctx.fillStyle = 'rgba(160,120,90,0.08)'; for (let x = -2600; x < 2600; x += 120) ctx.fillRect(x, -2400, 50, 2400); // wallpaper stripes
  // window: dusk sky, skyline with lit windows, curtains
  ctx.save(); ctx.translate(-760, -1000);
  ctx.save(); ctx.beginPath(); ctx.rect(-360, -480, 720, 760); ctx.clip();
  let g = ctx.createLinearGradient(0, -480, 0, 280); g.addColorStop(0, '#5D5FA8'); g.addColorStop(0.6, '#D88A7A'); g.addColorStop(1, '#F6B979'); ctx.fillStyle = g; ctx.fillRect(-360, -480, 720, 760);
  for (let i = 0; i < 9; i++) { const bw = 70 + K.hash(i) * 70, bh = 180 + K.hash(i + 5) * 330, bx = -380 + i * 92; ctx.fillStyle = i % 2 ? '#3A3550' : '#4A4262'; ctx.fillRect(bx, 280 - bh, bw, bh);
    for (let r = 0; r < bh / 40 - 1; r++) for (let c = 0; c < bw / 30 - 1; c++) if (K.hash(i * 31 + r * 7 + c) > 0.55) { ctx.fillStyle = 'rgba(255,214,140,0.9)'; ctx.fillRect(bx + 10 + c * 28, 300 - bh + r * 40, 12, 18); } }
  ctx.restore();
  ctx.strokeStyle = '#F7F1E6'; ctx.lineWidth = 26; ctx.strokeRect(-360, -480, 720, 760); ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, -480); ctx.lineTo(0, 280); ctx.moveTo(-360, -100); ctx.lineTo(360, -100); ctx.stroke();
  ctx.lineWidth = px(ctx, 4); ctx.strokeStyle = INK; ctx.strokeRect(-373, -493, 746, 786);
  rr(ctx, -420, 290, 840, 36, 8); fillStroke(ctx, '#F7F1E6', 4);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 380, -560); ctx.quadraticCurveTo(sx * 470, -100, sx * 430, 520); ctx.lineTo(sx * 560, 520); ctx.quadraticCurveTo(sx * 600, -100, sx * 540, -560); ctx.closePath(); fillStroke(ctx, '#C9503F', 4.5); }
  ctx.fillStyle = '#5A3A22'; ctx.fillRect(-620, -580, 1240, 22);
  ctx.restore();
  LT.glow(ctx, -760, -1000, 700, 'rgba(255,170,120,1)', 0.12);
  // picture frames + wall clock
  ctx.save(); ctx.translate(300, -1380); rr(ctx, -150, -110, 300, 220, 8); fillStroke(ctx, '#5A3A22', 4.5); ctx.fillStyle = '#9CC9F0'; ctx.fillRect(-126, -86, 252, 172); ctx.fillStyle = '#3E9E6A'; ctx.beginPath(); ctx.moveTo(-126, 86); ctx.lineTo(-40, -20); ctx.lineTo(40, 40); ctx.lineTo(90, -10); ctx.lineTo(126, 86); ctx.closePath(); ctx.fill(); ctx.restore();
  clock(ctx, 760, -1420, 120, o.clock ?? 0);
  // floor + rug + baseboard
  g = ctx.createLinearGradient(0, -60, 0, 900); g.addColorStop(0, '#B98A5E'); g.addColorStop(1, '#9A6E48'); ctx.fillStyle = g; ctx.fillRect(-2600, -60, 5200, 2400);
  ctx.strokeStyle = 'rgba(70,40,20,0.25)'; ctx.lineWidth = 3; for (let y = 0; y < 900; y += 90) { ctx.beginPath(); ctx.moveTo(-2600, y); ctx.lineTo(2600, y); ctx.stroke(); }
  ctx.fillStyle = '#F7F1E6'; ctx.fillRect(-2600, -96, 5200, 40); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-2600, -56); ctx.lineTo(2600, -56); ctx.stroke();
  ell(ctx, -300, 120, 900, 120); ctx.fillStyle = '#C96B4A'; ctx.fill(); ell(ctx, -300, 120, 780, 96); ctx.strokeStyle = '#FFC857'; ctx.lineWidth = 8; ctx.stroke();
  // floor lamp (left)
  ctx.save(); ctx.translate(-1500, 0); ctx.fillStyle = INK; ctx.fillRect(-8, -1180, 16, 1180); ell(ctx, 0, -6, 90, 18); fillStroke(ctx, '#3A3F48', 4);
  ctx.beginPath(); ctx.moveTo(-130, -1180); ctx.lineTo(130, -1180); ctx.lineTo(90, -1380); ctx.lineTo(-90, -1380); ctx.closePath(); fillStroke(ctx, '#FFE3A8', 4.5); ctx.restore();
  if (o.lamp !== 0) { LT.glow(ctx, -1500, -1260, 900, 'rgba(255,200,120,1)', 0.28 * (o.lamp ?? 1)); LT.glow(ctx, -1500, -1180, 260, 'rgba(255,240,200,1)', 0.35 * (o.lamp ?? 1)); }
  // bookshelf (far right)
  ctx.save(); ctx.translate(1550, 0); rr(ctx, -260, -1500, 520, 1500, 8); fillStroke(ctx, '#8B5A3C', 4.5);
  for (let r = 0; r < 5; r++) { const y = -1460 + r * 290; ctx.fillStyle = '#6E4630'; ctx.fillRect(-240, y + 250, 480, 20); let x = -230;
    for (let b = 0; b < 9; b++) { const bw = 30 + K.hash(r * 9 + b) * 26, bh = 160 + K.hash(r * 13 + b) * 80; if (x + bw > 230) break; ctx.fillStyle = ['#E63946', '#FFC857', '#4D8DFF', '#3E9E8A', '#F7F5F0', '#2E3A59'][(r + b) % 6]; ctx.fillRect(x, y + 250 - bh, bw, bh); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x, y + 250 - bh, bw, bh); x += bw + 4; } }
  ctx.restore();
  if (o.sofa !== false) sofa(ctx, -420, 0);
  if (o.desk !== false) desk(ctx, 900, 0, t, o);
  if (o.table !== false) coffeeTable(ctx, -380, 160, t, o);
}
function clock(ctx, x, y, r, minutes) {
  ctx.save(); ctx.translate(x, y); ell(ctx, 0, 0, r, r); fillStroke(ctx, CREAM, 5); ell(ctx, 0, 0, r * 0.9, r * 0.9); ctx.lineWidth = px(ctx, 2.5); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.lineWidth = i % 3 ? 4 : 8; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r * 0.72, -Math.cos(a) * r * 0.72); ctx.lineTo(Math.sin(a) * r * 0.84, -Math.cos(a) * r * 0.84); ctx.stroke(); }
  const ma = (minutes % 60) / 60 * Math.PI * 2, ha = ((7 + minutes / 60) % 12) / 12 * Math.PI * 2; // 7 pm
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * r * 0.45, -Math.cos(ha) * r * 0.45); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ma) * r * 0.7, -Math.cos(ma) * r * 0.7); ctx.stroke();
  ell(ctx, 0, 0, 10, 10); ctx.fillStyle = C.red; ctx.fill(); ctx.restore();
}
function sofa(ctx, x, y) { // front view, seat top at y - 257 (drawn squashed to 78 %)
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.78);
  rr(ctx, -560, -640, 1120, 380, 60); fillStroke(ctx, '#3D5A80', 5);          // back
  for (const sx of [-1, 1]) { rr(ctx, sx * 560 - 110, -420, 220, 380, 50); fillStroke(ctx, '#34506F', 5); } // arms
  rr(ctx, -470, -330, 940, 200, 40); fillStroke(ctx, '#4A6A92', 5);           // seat cushion
  ctx.strokeStyle = shade('#4A6A92', -0.25); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -330); ctx.lineTo(0, -130); ctx.stroke();
  rr(ctx, -500, -140, 1000, 100, 20); fillStroke(ctx, '#2F4766', 5);
  for (const sx of [-1, 1]) { ctx.fillStyle = INK; ctx.fillRect(sx * 470 - 12, -40, 24, 40); }
  rr(ctx, 230, -520, 200, 190, 40); fillStroke(ctx, '#FFC857', 4.5);             // a cushion
  ctx.restore();
}
function coffeeTable(ctx, x, y, t, o = {}) {
  ctx.save(); ctx.translate(x, y);
  rr(ctx, -380, -230, 760, 40, 10); fillStroke(ctx, '#8B5A3C', 5); for (const sx of [-1, 1]) { ctx.fillStyle = '#6E4630'; ctx.fillRect(sx * 330 - 12, -190, 24, 190); }
  // the new provider's router box (generic, no brand)
  ctx.save(); ctx.translate(-150, -230); CL.cutout(ctx, () => { ctx.beginPath(); ctx.rect(-130, -170, 260, 170); }, '#FFFDF8', { elev: 0.8 });
  ctx.fillStyle = BLUE; ctx.fillRect(-130, -170, 260, 40); txt(ctx, 'NEW ROUTER', 0, -140, 24, '#FFFDF8'); ctx.strokeStyle = BLUE; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, -40, 20 + i * 20, -2.4, -0.74); ctx.stroke(); } ctx.restore();
  // tea mug
  ctx.save(); ctx.translate(170, -230); rr(ctx, -50, -110, 100, 110, 14); fillStroke(ctx, C.red, 4.5); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(54, -56, 30, -1.3, 1.3); ctx.stroke(); ctx.lineWidth = 7; ctx.strokeStyle = C.red; ctx.stroke();
  const st = o.steam ?? 1; if (st > 0) { ctx.lineCap = 'round'; ctx.lineWidth = 9; for (let i = 0; i < 3; i++) { const u = ((t * 0.5 + i * 0.33) % 1); ctx.strokeStyle = `rgba(255,255,255,${0.75 * st * Math.sin(u * Math.PI)})`;
    ctx.beginPath(); ctx.moveTo(-20 + i * 20, -130 - u * 90); ctx.bezierCurveTo(-34 + i * 20, -160 - u * 90, -6 + i * 20, -190 - u * 90, -20 + i * 20, -220 - u * 90); ctx.stroke(); } }
  ctx.restore();
  ctx.restore();
}
function desk(ctx, x, y, t, o = {}) { // Ryan's desk, side-ish view, desktop at y - 420, laptop on it
  ctx.save(); ctx.translate(x, y);
  rr(ctx, -360, -440, 720, 40, 8); fillStroke(ctx, '#A87A52', 5); for (const sx of [-1, 1]) { ctx.fillStyle = '#7A5636'; ctx.fillRect(sx * 320 - 14, -400, 28, 400); }
  ctx.save(); ctx.translate(-60, -440); laptop(ctx, 0.9, { screen: o.deskScreen, glow: o.deskGlow ?? 0.12 }); ctx.restore();
  // desk lamp
  ctx.save(); ctx.translate(250, -440); ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -190); ctx.lineTo(-120, -260); ctx.stroke(); ell(ctx, 0, -4, 46, 10); fillStroke(ctx, '#3A3F48', 4);
  ctx.save(); ctx.translate(-120, -260); ctx.rotate(-0.5); ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(50, 0); ctx.lineTo(30, -60); ctx.lineTo(-30, -60); ctx.closePath(); fillStroke(ctx, '#FFC857', 4); ctx.restore(); ctx.restore();
  ctx.restore();
}
// desk chair (side view, seat top at y - 250)
function chair(ctx, x, y, facing = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(facing, 1);
  rr(ctx, -110, -250, 220, 40, 14); fillStroke(ctx, '#3A3F48', 4.5); rr(ctx, -140, -590, 46, 360, 18); fillStroke(ctx, '#3A3F48', 4.5);
  ctx.fillStyle = INK; ctx.fillRect(-10, -210, 20, 160); ctx.fillRect(-120, -56, 240, 16); for (const sx of [-1, 1]) { ell(ctx, sx * 110, -24, 20, 20); fillStroke(ctx, '#5A5F68', 3.5); }
  ctx.restore();
}

// the call centre (floor y = 0): back wall, cubicle rows behind, the RETENTION sign, fluorescent light. o: { sign: 1, rows: 2, lightA }
function callCentre(ctx, t, o = {}) {
  ctx.fillStyle = '#D6DEE8'; ctx.fillRect(-3200, -2600, 6400, 2600);
  ctx.fillStyle = '#C6D0DC'; for (let x = -3200; x < 3200; x += 640) ctx.fillRect(x, -2600, 26, 2600);
  // ceiling panels + tubes
  ctx.fillStyle = '#EEF2F7'; ctx.fillRect(-3200, -2600, 6400, 560); ctx.strokeStyle = '#C3CCD8'; ctx.lineWidth = 6; for (let x = -3200; x < 3200; x += 400) { ctx.beginPath(); ctx.moveTo(x, -2600); ctx.lineTo(x, -2040); ctx.stroke(); }
  for (let x = -2800; x < 3200; x += 800) { rr(ctx, x - 220, -2090, 440, 34, 8); ctx.fillStyle = '#FFFFFF'; ctx.fill(); LT.glow(ctx, x, -2060, 520, 'rgba(225,240,255,1)', 0.3 * (o.lightA ?? 1)); }
  // window strip (night city) on the far wall
  ctx.fillStyle = '#28324A'; ctx.fillRect(-3200, -1820, 6400, 420); for (let i = 0; i < 70; i++) { if (K.hash(i * 3) > 0.45) { ctx.fillStyle = 'rgba(255,214,140,0.8)'; ctx.fillRect(-3150 + i * 90, -1760 + K.hash(i) * 260, 16, 22); } }
  ctx.strokeStyle = '#9AA6B6'; ctx.lineWidth = 14; for (let x = -3200; x < 3200; x += 480) { ctx.beginPath(); ctx.moveTo(x, -1820); ctx.lineTo(x, -1400); ctx.stroke(); }
  // RETENTION department sign (hanging)
  if (o.sign !== 0) { ctx.save(); ctx.translate(o.signX ?? 0, -1980); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-240, -60); ctx.lineTo(-240, 0); ctx.moveTo(240, -60); ctx.lineTo(240, 0); ctx.stroke();
    CL.cutout(ctx, () => rr(ctx, -330, 0, 660, 140, 14), NAVY, { elev: 1.2, tex: 0.2 }); txt(ctx, 'RETENTION', 0, 96, 78, '#FFFDF8'); ctx.restore(); }
  // far cubicle rows: partitions with heads of other staff from behind
  for (let r = (o.rows ?? 2); r >= 1; r--) { const y = -1100 + r * 260, s = 0.5 + r * 0.12;
    for (let i = -6; i <= 6; i++) { const x = i * 560 * s + (r % 2) * 180; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      const st = STAFF[(i + 9 + r * 2) % STAFF.length]; repBack(ctx, 0, -380, 0.9, { top: st[0], hair: st[1], skin: st[2], t: t + i, talk: 0.5, mic: false });
      rr(ctx, -300, -330, 600, 340, 10); fillStroke(ctx, '#9AA8BA', 4.5); ctx.fillStyle = '#8796AA'; ctx.fillRect(-300, -330, 600, 24); ctx.restore(); } }
  const g = ctx.createLinearGradient(0, -400, 0, 900); g.addColorStop(0, '#8C97A6'); g.addColorStop(1, '#6E7888'); ctx.fillStyle = g; ctx.fillRect(-3200, -400, 6400, 2400);
}
// the hero desk at the call centre (desk top at y - 300): monitor with the account screen, keyboard, a sticky note, a mug. o.screen
function repDesk(ctx, x, y, t, o = {}) {
  ctx.save(); ctx.translate(x, y);
  // cubicle side walls
  for (const sx of [-1, 1]) { rr(ctx, sx * 560 - 20, -900, 40, 900, 8); fillStroke(ctx, '#9AA8BA', 4.5); }
  rr(ctx, -560, -900, 1120, 60, 8); fillStroke(ctx, '#8796AA', 4.5);
  // monitor
  ctx.save(); ctx.translate(0, -560); ctx.fillStyle = '#3A3F48'; ctx.fillRect(-20, 60, 40, 200); rr(ctx, -300, -220, 600, 300, 16); fillStroke(ctx, '#20232A', 5);
  ctx.save(); rr(ctx, -280, -200, 560, 260, 6); ctx.clip(); ctx.translate(-280, -200); (o.screen || accountScreen)(ctx, 560, 260, t, o); ctx.restore(); ctx.restore();
  LT.glow(ctx, 0, -620, 520, 'rgba(160,200,255,1)', 0.22 * (o.glow ?? 1));
  // desk
  rr(ctx, -560, -320, 1120, 50, 8); fillStroke(ctx, '#A6B2C2', 5); ctx.fillStyle = '#7F8B9C'; ctx.fillRect(-540, -270, 1080, 270);
  rr(ctx, -200, -350, 400, 34, 8); fillStroke(ctx, '#3A3F48', 4); // keyboard
  ctx.save(); ctx.translate(-430, -470); ctx.rotate(0.06); rr(ctx, -60, -60, 120, 120, 4); fillStroke(ctx, C.yellow, 3.5); ctx.strokeStyle = 'rgba(60,50,40,0.6)'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-40, -24 + i * 22); ctx.lineTo(40 - i * 12, -24 + i * 22); ctx.stroke(); } ctx.restore();
  ctx.save(); ctx.translate(400, -320); rr(ctx, -40, -90, 80, 90, 10); fillStroke(ctx, CREAM, 4); ctx.restore();
  ctx.restore();
}
function accountScreen(ctx, w, h, t, o = {}) {
  ctx.fillStyle = '#E8EEF6'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = NAVY; ctx.fillRect(0, 0, w, 40); txt(ctx, 'ACCOUNT', 20, 28, 20, '#FFFDF8', 'left');
  ctx.fillStyle = '#B8C4D4'; for (let i = 0; i < 5; i++) ctx.fillRect(20, 62 + i * 34, 160 + K.hash(i) * 200, 14);
  rr(ctx, w - 220, 60, 200, 60, 10); ctx.fillStyle = o.cancelled ? '#9AA3AE' : C.red; ctx.fill(); txt(ctx, o.cancelled ? 'DONE' : 'DISCONNECT', w - 120, 98, 22, '#FFFDF8');
  if (o.offers !== false) { rr(ctx, w - 220, 140, 200, 90, 10); ctx.fillStyle = '#4D8DFF'; ctx.fill(); txt(ctx, 'OFFERS', w - 120, 178, 22, '#FFFDF8'); txt(ctx, '▸ ▸ ▸', w - 120, 210, 20, '#FFFDF8'); }
}

// a Comcast store counter (daylight). o: { status 0..1 (screen turns to the customer and shows the status) }
function store(ctx, t, o = {}) {
  ctx.fillStyle = '#F2EEE6'; ctx.fillRect(-3000, -2600, 6000, 2600);
  ctx.fillStyle = '#E4DED2'; for (let x = -3000; x < 3000; x += 500) ctx.fillRect(x, -2600, 30, 2600);
  // store name (text only) + wall screens
  ctx.save(); ctx.translate(0, -1640); CL.cutout(ctx, () => rr(ctx, -520, -100, 1040, 200, 20), '#FFFDF8', { elev: 1, tex: 0.3 }); txt(ctx, 'COMCAST STORE', 0, 34, 92, NAVY); ctx.restore();
  for (const x of [-1150, 1150]) { ctx.save(); ctx.translate(x, -1150); rr(ctx, -360, -220, 720, 420, 16); fillStroke(ctx, '#20232A', 5); const g = ctx.createLinearGradient(-340, -200, 340, 180); g.addColorStop(0, '#4D8DFF'); g.addColorStop(1, '#9B6BC4'); ctx.fillStyle = g; rr(ctx, -340, -200, 680, 380, 8); ctx.fill(); txt(ctx, 'TV · INTERNET · VOICE', 0, 10, 46, '#FFFDF8'); ctx.restore(); }
  // daylight from the shop window (left)
  LT.shafts(ctx, [[[-2600, -2000], [-2000, -2000], [-600, 0], [-1400, 0]], [[-1900, -2000], [-1500, -2000], [-200, 0], [-700, 0]]], 'rgba(255,240,205,1)', 0.16, t);
  const g = ctx.createLinearGradient(0, -100, 0, 900); g.addColorStop(0, '#D8D2C6'); g.addColorStop(1, '#C4BCAE'); ctx.fillStyle = g; ctx.fillRect(-3000, -100, 6000, 2400);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; for (let x = -3000; x < 3000; x += 300) ctx.fillRect(x, -100, 10, 1200);
}
function storeCounter(ctx, x, y, t, o = {}) {
  ctx.save(); ctx.translate(x, y);
  rr(ctx, -700, -520, 1400, 60, 12); fillStroke(ctx, '#FFFDF8', 5); rr(ctx, -680, -460, 1360, 460, 8); fillStroke(ctx, NAVY, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-680, -440, 1360, 30);
  // the monitor turns toward the customer (scaleX through 0)
  const u = clamp(o.status || 0), sx = Math.cos(u * Math.PI), front = u > 0.5;
  ctx.save(); ctx.translate(-160, -760); ctx.fillStyle = '#3A3F48'; ctx.fillRect(-14, 120, 28, 120); ctx.scale(Math.max(0.04, Math.abs(sx)), 1);
  rr(ctx, -230, -150, 460, 280, 14); fillStroke(ctx, '#20232A', 5);
  if (front) { ctx.save(); rr(ctx, -214, -134, 428, 248, 6); ctx.clip(); ctx.fillStyle = '#EAF6EE'; ctx.fillRect(-214, -134, 428, 248); txt(ctx, 'SERVICE STATUS', 0, -76, 32, '#5A5450');
    const p = E.back(seg(u, 0.55, 0.95), 2.2); ctx.save(); ctx.translate(0, 10); ctx.scale(p, p); CL.cutout(ctx, () => rr(ctx, -190, -50, 380, 100, 14), '#1C8A52', { elev: 0.8, tex: 0 }); txt(ctx, '✓ DISCONNECTED', 0, 18, 44, '#FFFDF8'); ctx.restore(); ctx.restore(); }
  else { ctx.fillStyle = '#3A3F48'; rr(ctx, -214, -134, 428, 248, 6); ctx.fill(); }
  ctx.restore();
  ctx.restore();
}

// the executive office (dusk): wood panels, a window, a big desk; a door on the right with light under it
function execOffice(ctx, t, o = {}) {
  ctx.fillStyle = '#7A5636'; ctx.fillRect(-3000, -2600, 6000, 2600);
  ctx.fillStyle = '#6E4C30'; for (let x = -3000; x < 3000; x += 360) { rr(ctx, x + 30, -2400, 300, 1100, 10); ctx.fill(); rr(ctx, x + 30, -1200, 300, 900, 10); ctx.fill(); }
  ctx.save(); ctx.translate(-900, -1500); ctx.beginPath(); ctx.rect(-420, -500, 840, 900); ctx.clip(); const g = ctx.createLinearGradient(0, -500, 0, 400); g.addColorStop(0, '#3B3F78'); g.addColorStop(1, '#D98A6A'); ctx.fillStyle = g; ctx.fillRect(-420, -500, 840, 900);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = '#2A2C4A'; const bh = 300 + K.hash(i + 2) * 400; ctx.fillRect(-420 + i * 110, 400 - bh, 90, bh); } ctx.restore();
  ctx.strokeStyle = '#3A2614'; ctx.lineWidth = 30; ctx.strokeRect(-1320, -2000, 840, 900);
  // door (right) with a bright gap under it
  ctx.save(); ctx.translate(1100, 0); rr(ctx, -330, -1500, 660, 1500, 8); fillStroke(ctx, '#5A3A22', 5); rr(ctx, -270, -1430, 540, 600, 8); ctx.strokeStyle = '#3A2614'; ctx.lineWidth = 8; ctx.stroke(); rr(ctx, -270, -760, 540, 640, 8); ctx.stroke();
  ell(ctx, -250, -760, 22, 22); fillStroke(ctx, C.yellow, 4); ctx.fillStyle = '#FFF4D0'; ctx.fillRect(-330, -14, 660, 14); LT.glow(ctx, 0, 0, 600, 'rgba(255,230,170,1)', 0.35); ctx.restore();
  const g2 = ctx.createLinearGradient(0, 0, 0, 900); g2.addColorStop(0, '#5A2E2E'); g2.addColorStop(1, '#3E1E20'); ctx.fillStyle = g2; ctx.fillRect(-3000, 0, 6000, 1800);
}
// the internal memo envelope (centred, ~560 x 360 at s = 1)
function envelope(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  CL.cutout(ctx, () => rr(ctx, -280, -180, 560, 360, 14), '#E9D7B0', { elev: o.elev ?? 1.4 });
  ctx.strokeStyle = 'rgba(120,90,50,0.6)'; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-280, -180); ctx.lineTo(0, 30); ctx.lineTo(280, -180); ctx.stroke();
  ctx.save(); ctx.rotate(-0.12); ctx.strokeStyle = C.red; ctx.lineWidth = 7; rr(ctx, -170, 50, 340, 90, 10); ctx.stroke(); txt(ctx, 'INTERNAL', 0, 117, 62, C.red); ctx.restore();
  ctx.restore();
}
// paper sheet with lines of text; spec: [{ s, size, col, y, hl, hlT 0..1, align }] in local units; sheet w x h centred at 0, top at -h/2
function sheet(ctx, w, h, spec, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 8), o.col || '#FFFDF8', { elev: o.elev ?? 1.6 });
  for (const L of spec) {
    const size = L.size || 40;
    if (L.hl && (L.hlT ?? 1) > 0) { ctx.font = `${size}px ${L.font || F.black}`; const tw = ctx.measureText(L.s).width, x0 = L.align === 'left' ? L.x : (L.x || 0) - tw / 2;
      ctx.fillStyle = L.hl; rr(ctx, x0 - 10, L.y - size * 0.86, (tw + 20) * clamp(L.hlT ?? 1), size * 1.12, 8); ctx.fill(); }
    txt(ctx, L.s, L.x || 0, L.y, size, L.col || INK, L.align || 'center', L.font || F.black);
  }
}
// training binder (front, standing), ~600 x 760, rings on the left edge; o: { label }
function binder(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => rr(ctx, -300, -380, 600, 760, 22), NAVY, { elev: 1.6, tex: 0.3 });
  ctx.fillStyle = shade(NAVY, -0.3); ctx.fillRect(-300, -380, 70, 760);
  CL.cutout(ctx, () => rr(ctx, -170, -250, 400, 170, 12), '#FFFDF8', { elev: 0.6 }); fitTxt(ctx, o.label || 'TRAINING', 30, -142, 70, NAVY, 360);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 4; i++) ctx.fillRect(-150, -20 + i * 60, 360 - i * 40, 16);
  ctx.restore();
}
function binderRing(ctx, x, y, r, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 15; ctx.stroke(); ctx.restore(); }
// pay envelope with a paycheck sticking out, ~620 x 420; o: { label }
function payEnvelope(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  ctx.save(); ctx.translate(30, -170); ctx.rotate(-0.06); CL.cutout(ctx, () => rr(ctx, -270, -120, 540, 240, 10), '#D7EBD0', { elev: 1 }); ctx.strokeStyle = '#3D8C6A'; ctx.lineWidth = 4; rr(ctx, -250, -100, 500, 200, 8); ctx.stroke();
  txt(ctx, 'PAY TO THE ORDER OF', -40, -50, 26, '#2F7A58'); ctx.fillStyle = '#2F7A58'; ctx.fillRect(-230, -20, 420, 4); txt(ctx, '$', 200, -4, 56, '#2F7A58'); ctx.restore();
  CL.cutout(ctx, () => rr(ctx, -310, -150, 620, 300, 16), '#E9D7B0', { elev: 1.6 });
  ctx.strokeStyle = 'rgba(120,90,50,0.6)'; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(-310, -150); ctx.lineTo(0, 40); ctx.lineTo(310, -150); ctx.stroke();
  fitTxt(ctx, o.label || 'PAY', 0, 110, 92, '#2F7A58', 520);
  ctx.restore();
}
// a hand holding a phone, seen from the front (for the viral grid); col = sleeve
function handPhone(ctx, s, skin, sleeve, screen, t) {
  ctx.save(); ctx.scale(s, s);
  rr(ctx, -70, 120, 140, 260, 40); fillStroke(ctx, sleeve, 4.5);
  phone(ctx, 0.55, { screen, elev: 0.6 });
  for (let i = 0; i < 4; i++) { rr(ctx, 60, -40 + i * 40, 46, 30, 14); fillStroke(ctx, skin, 4); }
  rr(ctx, -110, 40, 50, 110, 22); fillStroke(ctx, skin, 4);
  ctx.restore();
}
// audio clip card (generic player): play button, waveform, 8:15
function audioCard(ctx, w, h, t, o = {}) {
  ctx.fillStyle = '#FFFDF8'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#F2602B'; ell(ctx, 44, h / 2, 26, 26); ctx.fill();
  ctx.fillStyle = '#FFFDF8'; ctx.beginPath(); ctx.moveTo(36, h / 2 - 14); ctx.lineTo(58, h / 2); ctx.lineTo(36, h / 2 + 14); ctx.closePath(); ctx.fill();
  const n = Math.floor((w - 130) / 7); for (let i = 0; i < n; i++) { const a = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.31 + 1)); ctx.fillStyle = i / n < (o.prog ?? 0.3) ? '#F2602B' : '#B8B2A8'; ctx.fillRect(84 + i * 7, h / 2 - a * h * 0.3, 4, a * h * 0.6); }
  txt(ctx, o.len || '8:15', w - 12, h - 10, 18, '#5A5450', 'right');
}
function trophy(ctx, s = 1) { // a gold "#1" trophy (base at 0)
  ctx.save(); ctx.scale(s, s);
  rr(ctx, -110, -60, 220, 60, 8); fillStroke(ctx, '#5A3A22', 5); ctx.fillStyle = '#E8B23A'; rr(ctx, -40, -150, 80, 90, 8); ctx.fill(); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-150, -420); ctx.lineTo(150, -420); ctx.quadraticCurveTo(140, -170, 0, -150); ctx.quadraticCurveTo(-140, -170, -150, -420); ctx.closePath(); fillStroke(ctx, '#F4C64A', 5);
  ctx.lineWidth = 16; ctx.strokeStyle = INK; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 160, -340, 60, sx > 0 ? -1.6 : 1.6 + Math.PI * 0, sx > 0 ? 1.6 : 4.7); ctx.stroke(); }
  ctx.lineWidth = 8; ctx.strokeStyle = '#F4C64A'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 160, -340, 60, sx > 0 ? -1.6 : 1.6, sx > 0 ? 1.6 : 4.7); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.moveTo(-110, -400); ctx.lineTo(-70, -400); ctx.quadraticCurveTo(-80, -260, -40, -190); ctx.quadraticCurveTo(-100, -230, -110, -400); ctx.fill();
  txt(ctx, '#1', 0, -250, 120, C.red);
  ctx.restore();
}

module.exports = { W, H, layer, txt, fitTxt, BLUE, NAVY, CREAM, VER, RYAN, CLERK, STAFF, repBack, cord, whyBubble, quoteBubble, mmss, phone, callScreen, recScreen, laptop,
  apartment, clock, sofa, coffeeTable, desk, chair, callCentre, repDesk, accountScreen, store, storeCounter, execOffice, envelope, sheet, binder, binderRing, payEnvelope, handPhone, audioCard, trophy };
