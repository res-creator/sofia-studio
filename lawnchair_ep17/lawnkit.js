// Episode 17 "The Man Who Flew in a Lawn Chair" (How It's Run) — sets, props and cast on hirkit.
// Generic re-enactment figures (no likenesses, no logos): Larry (generic), two airline pilots, the backyard, the street with power lines,
// the lawn chair (aluminium tube frame, webbing, water jugs, four ropes), 42 balloons, the pellet gun, an airliner, the cockpit, the FAA notice, the museum.
// World space for scenes: floor at y = 0, up is negative. Everything here is our own drawing code (nothing is imported from other episodes' branches).
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, shade, fillStroke, ell, px, tube } = R;
const W = 1080, H = 1920, CREAM = '#FFFDF8', NAVY = '#2E3A59';

// ---------- helpers (same behaviour as the earlier call kit, re-implemented here) ----------
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2 + (c.shx || 0) * d, H / 2 + (c.shy || 0) * d); ctx.rotate((c.r || 0) * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center') { ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align); return size; }
const path = (ctx, fn, fill, lw = 5) => { ctx.beginPath(); fn(ctx); ctx.closePath(); fillStroke(ctx, fill, lw); };
const poly = (ctx, pts, fill, lw = 5) => path(ctx, c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); }, fill, lw);

// ---------- cast ----------
const LARRY = { skin: '#E8B48F', hair: '#5A3A22', hairStyle: 'short', top: '#5B8DD6', cuff: '#4A78BA', pants: '#3E4F78', shoes: '#F4F1E8', sole: '#C9C1B1', iris: '#3A2414', brow: '#3A2414' };
const CAPTAIN = { skin: '#D9A27E', hair: '#B8B8BE', hairStyle: 'short', top: '#F4F1E8', cuff: '#2E3A59', pants: '#2E3A59', shoes: '#171717', iris: '#3A2414', brow: '#8A8A90' };
const FIRST = { skin: '#8D5A3C', hair: '#1E1612', hairStyle: 'short', top: '#F4F1E8', cuff: '#2E3A59', pants: '#2E3A59', shoes: '#171717', iris: '#2A1A10', brow: '#1E1612' };
const OFFICIAL = { skin: '#F0C3A2', hair: '#2A1E16', hairStyle: 'short', top: '#BFD4F2', cuff: '#A9C2E4', shirt: CREAM, pants: '#4A4F57', shoes: '#171717', iris: '#4E6B3C', brow: '#2A1A10' };

// ---------- sky ----------
function cloud(ctx, x, y, s, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  for (const [dx, dy, r, col] of [[-90, 14, 60, '#EAF3FF'], [-30, -20, 80, '#F4F9FF'], [40, -10, 70, '#F4F9FF'], [100, 16, 54, '#EAF3FF'], [0, 26, 90, '#FFFFFF'], [-150, 34, 44, '#EAF3FF']]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(dx, dy, r, 0, 7); ctx.fill(); }
  ctx.restore();
}
function skyFill(ctx, c0, c1, y0 = -6000, y1 = 400) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(-6000, y0, 12000, y1 - y0); }
// high sky with a cloud deck below the chair (o.deck: y of the cloud tops) and drifting clouds
function sky(ctx, t, o = {}) {
  skyFill(ctx, o.c0 || '#5FA3EE', o.c1 || '#CFE6FF', -7000, 4200); LT.glow(ctx, 1300, -2300, 1100, 'rgba(255,246,205,1)', 0.35);
  if (o.town) townBelow(ctx, o.town.y, o.town.s, o.town.haze ?? 0.5);
  for (let i = 0; i < (o.n ?? 7); i++) { const x = ((hash(i) * 5200 - 2600 + t * (8 + hash(i + 9) * 14) + 8000) % 5200) - 2600, y = (o.y0 ?? -2600) + hash(i + 3) * (o.span ?? 2600); cloud(ctx, x, y, 1 + hash(i + 5) * 1.2, 0.92); }
  if (o.deck !== undefined) { ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 26; i++) { const x = -2800 + i * 230 + Math.sin(t * 0.3 + i) * 12, y = o.deck + hash(i + 40) * 70; if (o.gap && x > o.gap[0] && x < o.gap[1]) continue; ctx.beginPath(); ctx.arc(x, y + 150, 150 + hash(i + 7) * 90, 0, 7); ctx.fill(); }
    const g = ctx.createLinearGradient(0, o.deck, 0, o.deck + 900); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(230,240,255,1)'); ctx.fillStyle = g; ctx.fillRect(-4000, o.deck + 60, 8000, 3000); }
}

// the town far below: a patchwork of fields, streets and tiny houses; y = its top edge, s = scale, haze 0..1 blue distance haze
function townBelow(ctx, y, s, haze = 0.5) {
  ctx.save(); ctx.translate(0, y); ctx.scale(s, s); const cols = ['#9ACB86', '#B7D68A', '#CBC48C', '#8CBF7E', '#D8C79A'];
  ctx.fillStyle = '#A9CF88'; ctx.fillRect(-4000, 0, 8000, 4000);
  for (let r = 0; r < 9; r++) for (let c = -14; c < 14; c++) { const x = c * 260 + (r % 2) * 90, yy = r * 230; ctx.fillStyle = cols[Math.floor(hash(r * 31 + c) * 5)]; ctx.fillRect(x, yy, 240, 210); }
  ctx.fillStyle = '#8A8F98'; for (let r = 0; r <= 9; r++) ctx.fillRect(-4000, r * 230 - 20, 8000, 20); for (let c = -14; c < 14; c++) ctx.fillRect(c * 260 - 20, 0, 20, 2100);
  for (let r = 0; r < 8; r++) for (let c = -12; c < 12; c++) if (hash(r * 17 + c + 4) > 0.35) { const x = c * 260 + (r % 2) * 90 + 60, yy = r * 230 + 50; ctx.fillStyle = '#F2E2C0'; ctx.fillRect(x, yy, 70, 50); ctx.fillStyle = '#C86A4A'; ctx.fillRect(x - 6, yy - 18, 82, 22); }
  ctx.restore();
  const g = ctx.createLinearGradient(0, y, 0, y + 1200 * s); g.addColorStop(0, `rgba(205,228,255,${haze + 0.35})`); g.addColorStop(1, `rgba(205,228,255,${haze * 0.4})`); ctx.fillStyle = g; ctx.fillRect(-4000, y, 8000, 4000);
}

// a cloud ceiling seen from below: everything above y is cloud, with bulging bottoms
function ceiling(ctx, t, y) {
  const g = ctx.createLinearGradient(0, y - 1400, 0, y + 80); g.addColorStop(0, '#EEF3FA'); g.addColorStop(1, '#DCE6F3'); ctx.fillStyle = g; ctx.fillRect(-4000, y - 6000, 8000, 6000 + 60);
  for (let i = 0; i < 24; i++) { const x = -2800 + i * 240 + Math.sin(t * 0.4 + i) * 14; ctx.fillStyle = i % 2 ? '#F4F8FD' : '#E6EEF8'; ctx.beginPath(); ctx.arc(x, y + 20 + hash(i + 70) * 30, 130 + hash(i + 80) * 80, 0, 7); ctx.fill(); }
}

// ---------- balloons ----------
const BCOL = [C.red, C.yellow, '#4D8DFF', '#26A69A', '#F2A64C', '#FFFDF8', '#B06CD8'];
function balloon(ctx, x, y, r, col, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath(); ctx.moveTo(-9, r * 1.18); ctx.lineTo(9, r * 1.18); ctx.lineTo(0, r * 1.02); ctx.closePath(); fillStroke(ctx, shade(col, -0.2), 3.5);
  ell(ctx, 0, 0, r * 0.88, r * 1.1); fillStroke(ctx, col, 4.5);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ell(ctx, -r * 0.32, -r * 0.4, r * 0.16, r * 0.3, 0.5); ctx.fill();
  ctx.restore();
}
// 42 balloons (7 rows 4-6-7-8-7-6-4) above the anchor point where the ropes meet; o.n = how many are tied on, o.pop = { index: time } for burst ones, o.s = scale, o.t = time
const ROWS = [4, 6, 7, 8, 7, 6, 4];
const BAL = []; ROWS.forEach((m, k) => { for (let i = 0; i < m; i++) BAL.push({ k, i, m }); });
function balloons(ctx, ax, ay, o = {}) {
  const t = o.t || 0, s = o.s || 1, n = o.n ?? 42, pop = o.pop || {}, order = o.order || BAL.map((_, i) => i);
  ctx.save(); ctx.translate(ax, ay); ctx.scale(s, s);
  const vis = BAL.map((b, idx) => ({ ...b, idx, rank: order.indexOf(idx) })).filter(b => b.rank < n);
  const grow = b => E.back(clamp(n - b.rank), 2.2);
  const pos = b => ({ x: (b.i - (b.m - 1) / 2) * 172 + (hash(b.idx) - 0.5) * 34 + Math.sin(t * 1.3 + b.idx) * 7, y: -150 - b.k * 128 + (hash(b.idx + 50) - 0.5) * 30 + Math.cos(t * 1.1 + b.idx * 1.7) * 6 });
  ctx.lineWidth = px(ctx, 2.6); ctx.strokeStyle = 'rgba(23,23,23,0.55)'; ctx.lineCap = 'round';
  for (const b of vis) { if (pop[b.idx] !== undefined && t > pop[b.idx]) continue; const p = pos(b); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(p.x * 0.35, p.y * 0.4, p.x, p.y + 118); ctx.stroke(); }
  for (const b of vis.slice().sort((a, c) => c.k - a.k)) { // top rows first so lower balloons overlap
    const p = pos(b), pt = pop[b.idx];
    if (pt !== undefined && t > pt) { const u = (t - pt) / 0.4; if (u < 1) { // burst: paper-like scraps fly out
      for (let j = 0; j < 7; j++) { const a = j / 7 * 6.28 + hash(b.idx + j), d = 40 + u * 190 * (0.6 + hash(j + b.idx)); ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); ctx.rotate(a + u * 5); poly(ctx, [[-16, -9], [16, -5], [8, 11]], BCOL[b.idx % BCOL.length], 3); ctx.restore(); }
      ctx.save(); ctx.globalAlpha = 1 - u; ctx.strokeStyle = '#FFF'; ctx.lineWidth = 8; ctx.beginPath(); for (let j = 0; j < 8; j++) { const a = j * 0.785; ctx.moveTo(p.x + Math.cos(a) * (60 + u * 40), p.y + Math.sin(a) * (60 + u * 40)); ctx.lineTo(p.x + Math.cos(a) * (95 + u * 60), p.y + Math.sin(a) * (95 + u * 60)); } ctx.stroke(); ctx.restore(); } continue; }
    balloon(ctx, p.x, p.y, 92 * grow(b), BCOL[(b.idx * 3 + b.k) % BCOL.length], Math.sin(t * 1.2 + b.idx) * 0.06);
  }
  ctx.restore();
}
function aliveCount(n, pop, t) { let c = n; for (const k in pop) if (t > pop[k]) c--; return c; }

// ---------- the lawn chair (side view facing right; seat top at (0,0); frame ~ 1.0 = figure scale) ----------
function jug(ctx, x, y, s = 1, water = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-26, -34); ctx.lineTo(26, -34); ctx.lineTo(30, 40); ctx.quadraticCurveTo(0, 48, -30, 40); ctx.closePath(); fillStroke(ctx, 'rgba(190,225,250,0.92)', 4);
  if (water > 0.02) { ctx.save(); ctx.beginPath(); ctx.moveTo(-26, -34); ctx.lineTo(26, -34); ctx.lineTo(30, 40); ctx.quadraticCurveTo(0, 48, -30, 40); ctx.closePath(); ctx.clip(); ctx.fillStyle = '#4D8DFF'; ctx.fillRect(-40, 40 - 74 * water, 80, 90); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-40, 40 - 74 * water, 80, 6); ctx.restore(); }
  rr(ctx, -12, -50, 24, 18, 4); fillStroke(ctx, CREAM, 3.5); path(ctx, c => { c.moveTo(22, -26); c.quadraticCurveTo(52, -26, 50, -4); c.quadraticCurveTo(48, 12, 28, 10); }, 'rgba(190,225,250,0.9)', 3);
  ctx.restore();
}
// o: { jugs: 0..13 hung under the seat, water: 0..1 fill, ropes: [x,y] anchor in chair space (draws 4 ropes) or null, slack: 0..1 hanging ropes (museum), tilt, spill: 0..1 jug tipped & pouring, t }
function chair(ctx, o = {}) {
  const t = o.t || 0; ctx.save(); ctx.rotate(o.tilt || 0);
  const alu = '#C9CED6', aluD = '#9AA1AD', web = (x0, y0, x1, y1) => { const n = 9; for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n; ctx.beginPath(); ctx.moveTo(lerp(x0, x1, u0), lerp(y0, y1, u0)); ctx.lineTo(lerp(x0, x1, u1), lerp(y0, y1, u1)); ctx.lineWidth = px(ctx, 26); ctx.lineCap = 'butt'; ctx.strokeStyle = i % 2 ? CREAM : '#26A69A'; ctx.stroke(); } };
  // jugs hang from the frame on short cords (13 like the real one: a mix of two rows)
  const nj = o.jugs ?? 13;
  if (o.jugsFloor) { for (let i = 0; i < 13; i++) { const row = i < 6 ? 0 : 1, c = row ? i - 6 : i; jug(ctx, row ? -170 + c * 62 + 30 : -190 + c * 66, row ? 140 : 160, 0.78, 1, (hash(i) - 0.5) * 0.06); } }
  else for (let i = 0; i < nj; i++) { const row = i % 2, col = Math.floor(i / 2), x = -92 + col * 36 + (row ? 14 : 0), y = 170 + row * 58; const sw = Math.sin(t * 2 + i) * 0.05 * (o.sway ?? 1);
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 2.4); ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, -(60 + row * 58)); ctx.stroke(); jug(ctx, 0, 0, 0.78, o.water ?? 1, 0); ctx.restore(); }
  // far legs & far armrest
  tube(ctx, [[-60, 8], [-96, 170]], 14, aluD, 4); tube(ctx, [[104, 8], [128, 170]], 14, aluD, 4);
  // back rest webbing (slanted) + frame
  tube(ctx, [[-64, 0], [-148, -300]], 14, alu, 4.5); tube(ctx, [[-40, 0], [-124, -300]], 14, aluD, 4.5);
  ctx.save(); web(-132, -270, -62, -16); ctx.restore();
  // seat webbing (side view = a band) and front frame
  rr(ctx, -80, -4, 220, 22, 8); fillStroke(ctx, '#26A69A', 4.5); for (let i = 0; i < 8; i++) { ctx.fillStyle = CREAM; ctx.fillRect(-70 + i * 28, -2, 12, 18); }
  tube(ctx, [[-84, 12], [136, 12]], 14, alu, 4.5);
  // near legs
  tube(ctx, [[-66, 14], [-110, 178]], 16, alu, 4.5); tube(ctx, [[112, 14], [142, 178]], 16, alu, 4.5);
  tube(ctx, [[-110, 178], [-120, 178]], 10, INK, 3); tube(ctx, [[142, 178], [152, 178]], 10, INK, 3);
  // armrest + front post
  tube(ctx, [[-70, -112], [136, -112]], 16, alu, 4.5); rr(ctx, -50, -122, 170, 22, 10); fillStroke(ctx, '#3E8E7A', 4); tube(ctx, [[126, -112], [120, 8]], 14, alu, 4.5); tube(ctx, [[-62, -112], [-60, 0]], 14, alu, 4.5);
  // ropes
  if (o.ropes) { const [ax, ay] = o.ropes, pts = [[-148, -300], [-60, -112], [126, -112], [140, 12]]; ctx.strokeStyle = '#E8DCC0'; ctx.lineCap = 'round';
    for (const p of pts) { ctx.lineWidth = px(ctx, 7) + 1; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(ax, ay); ctx.stroke(); ctx.lineWidth = px(ctx, 7) - 3; ctx.strokeStyle = '#E8DCC0'; ctx.stroke(); } }
  if (o.slack) { const pts = [[-148, -300], [-60, -112], [126, -112], [140, 12]]; pts.forEach((p, i) => { ctx.lineWidth = px(ctx, 7) + 1; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.bezierCurveTo(p[0] + 10, p[1] - 140 * o.slack, p[0] + 60 * (i - 1.5), p[1] - 90 * o.slack, p[0] + 80 * (i - 1.5), p[1] + 30); ctx.stroke(); ctx.lineWidth = px(ctx, 7) - 3; ctx.strokeStyle = '#E8DCC0'; ctx.stroke(); }); }
  ctx.restore();
}

// ---------- Larry in the chair: hip at (hx, hy); the chair's seat top sits just under him ----------
function larrySeated(ctx, hx, hy, o = {}) {
  const sc = o.s ?? 1;
  ctx.save(); ctx.translate(hx, hy); ctx.scale(sc, sc);
  ctx.save(); ctx.translate(-4, 34); chair(ctx, { jugs: o.jugs, water: o.water, ropes: o.ropes, t: o.t, sway: o.sway, slack: o.slack }); ctx.restore();
  const dang = o.dangle ?? 0; // 0 feet resting forward on the ground, 1 feet dangling
  if (!o.noFigure) LT.lit(ctx, c => R.figure(c, 0, 96, 1, 1, o.L || LARRY, {
    hip: [0, -96], lean: o.lean ?? -0.04, headTilt: o.tilt || 0, noShadow: true,
    legN: { foot: [lerp(160, 128, dang) + (o.sw || 0) * Math.sin((o.t || 0) * 3) * 16, lerp(116, 56, dang)] }, legF: { foot: [lerp(138, 108, dang) - (o.sw || 0) * Math.sin((o.t || 0) * 3) * 16, lerp(116, 50, dang)] },
    armN: o.armN || { hand: [96, -152], grip: 'fist' }, armF: o.armF || { hand: [78, -150], grip: 'fist' }, face: o.face || R.expr('smile', { look: [1, 0] }), farFront: o.farFront }), { rim: o.rim || { dir: [-1, -0.4], color: '#FFF6E0', w: 8, a: 0.9 } });
  ctx.restore();
}

// ---------- the pellet gun (barrel to the right, ~230 long, grip at x = 0) ----------
function gun(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  poly(ctx, [[-70, -14], [-8, -16], [0, 14], [-24, 40], [-60, 22]], '#8A5A34', 4.5); // stock + grip
  rr(ctx, -10, -26, 230, 22, 6); fillStroke(ctx, '#4A4F57', 4.5); rr(ctx, 200, -30, 30, 30, 5); fillStroke(ctx, '#2A2F3A', 4);
  rr(ctx, -2, -4, 120, 14, 5); fillStroke(ctx, '#8A5A34', 4); ctx.restore();
}

// ---------- an airliner far away (side view facing right, ~900 wide at s = 1; generic, no airline marks) ----------
function airliner(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  poly(ctx, [[-300, -20], [-470, -190], [-400, -190], [-190, -40]], '#E8EDF5', 4); // tail fin
  poly(ctx, [[-310, 10], [-440, 60], [-400, 70], [-250, 30]], '#D5DCE8', 4);        // stabiliser
  poly(ctx, [[-60, 30], [-340, 190], [-250, 195], [100, 36]], '#D5DCE8', 4);          // wing (far side)
  path(ctx, c => { c.moveTo(-460, -10); c.bezierCurveTo(-470, -80, -300, -80, -100, -78); c.bezierCurveTo(200, -78, 400, -70, 470, -10); c.bezierCurveTo(430, 56, 220, 74, -60, 70); c.bezierCurveTo(-260, 66, -450, 50, -460, -10); }, '#F4F7FC', 5);
  ctx.save(); ctx.beginPath(); ctx.rect(-480, 14, 960, 22); ctx.clip(); path(ctx, c => { c.moveTo(-460, -10); c.bezierCurveTo(-470, -80, -300, -80, -100, -78); c.bezierCurveTo(200, -78, 400, -70, 470, -10); c.bezierCurveTo(430, 56, 220, 74, -60, 70); c.bezierCurveTo(-260, 66, -450, 50, -460, -10); }, '#2E5DB8', 0); ctx.restore();
  for (let i = 0; i < 18; i++) { ctx.fillStyle = '#2E3A59'; ell(ctx, -300 + i * 36, -30, 8, 10); ctx.fill(); }
  poly(ctx, [[330, -52], [420, -30], [300, -26]], '#2E3A59', 3.5); // cockpit windows
  poly(ctx, [[-20, 36], [-300, 212], [-210, 212], [160, 44]], '#EEF2F9', 4.5); // wing (near side)
  path(ctx, c => { c.moveTo(-80, 130); c.bezierCurveTo(-80, 100, 90, 100, 100, 130); c.bezierCurveTo(90, 160, -80, 160, -80, 130); }, '#C9D2E0', 4.5); // engine
  ell(ctx, 100, 130, 14, 30); fillStroke(ctx, '#8A94A8', 3.5);
  ctx.restore();
}

// ---------- the cockpit (screen space, side view: two pilots in profile facing right, sky through the big side window) ----------
// o: { sky(ctx) draws the window content in window space (0,0 = window centre), reveal 0..1 }
const WIN = { x: 330, y: 250, w: 700, h: 980 };
function cockpitBack(ctx, t, o = {}) {
  ctx.fillStyle = '#2A2F3A'; ctx.fillRect(0, 0, W, H);
  // window with the sky and what is in it
  ctx.save(); ctx.translate(WIN.x + WIN.w / 2, WIN.y + WIN.h / 2); ctx.beginPath(); ctx.moveTo(-WIN.w / 2 + 40, -WIN.h / 2); ctx.lineTo(WIN.w / 2, -WIN.h / 2 - 20); ctx.lineTo(WIN.w / 2 + 10, WIN.h / 2); ctx.lineTo(-WIN.w / 2, WIN.h / 2); ctx.closePath(); ctx.clip();
  if (o.sky) o.sky(ctx); ctx.restore();
  // window frame (grey plastic), sun shade rail and a handle
  ctx.save(); ctx.translate(WIN.x + WIN.w / 2, WIN.y + WIN.h / 2); ctx.beginPath(); ctx.moveTo(-WIN.w / 2 + 40, -WIN.h / 2); ctx.lineTo(WIN.w / 2, -WIN.h / 2 - 20); ctx.lineTo(WIN.w / 2 + 10, WIN.h / 2); ctx.lineTo(-WIN.w / 2, WIN.h / 2); ctx.closePath();
  ctx.lineJoin = 'round'; ctx.lineWidth = 46; ctx.strokeStyle = '#4A5060'; ctx.stroke(); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  // left cabin wall (dark) with an overhead panel of switches
  ctx.fillStyle = '#383E4C'; ctx.fillRect(0, 0, 300, 1420);
  rr(ctx, 0, 0, W, 200, 0); ctx.fillStyle = '#3B4150'; ctx.fillRect(0, 0, W, 220); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.strokeRect(-4, -4, W + 8, 224);
  for (let i = 0; i < 22; i++) { const x = 40 + (i % 11) * 92, y = 50 + Math.floor(i / 11) * 80; rr(ctx, x, y, 60, 42, 8); fillStroke(ctx, '#2A2F3A', 3.5); ctx.fillStyle = i % 5 === 0 ? C.yellow : i % 7 === 0 ? C.red : '#7FD8A8'; ctx.beginPath(); ctx.arc(x + 30, y + 21, 7, 0, 7); ctx.fill(); }
  // glareshield + instrument panel along the bottom
  poly(ctx, [[0, 1300], [W, 1260], [W, H], [0, H]], '#30353F', 5);
  poly(ctx, [[300, 1330], [W, 1290], [W, 1420], [300, 1440]], '#1F232B', 4);
  for (let i = 0; i < 3; i++) { rr(ctx, 360 + i * 210, 1350 + i * -4, 180, 80, 10); fillStroke(ctx, '#0E1620', 4); ctx.strokeStyle = ['#7FD8A8', '#6AB0FF', '#FFC857'][i]; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(380 + i * 210, 1400 - i * 4); for (let j = 0; j < 7; j++) ctx.lineTo(380 + i * 210 + j * 24, 1390 + Math.sin(t * 2 + j + i) * 14 - i * 4); ctx.stroke(); }
  // the yoke (control wheel) coming out of the panel
  tube(ctx, [[620, 1500], [560, 1330]], 30, '#1F232B', 4.5); ctx.save(); ctx.translate(560, 1318); ell(ctx, 0, 0, 74, 22); fillStroke(ctx, '#1F232B', 5); ctx.restore();
}
// one pilot seated (profile facing right); hip at (hx, hy); seat drawn behind with a headrest
function pilotSeated(ctx, hx, hy, L, o = {}) {
  ctx.save(); ctx.translate(hx, hy); ctx.scale(o.s || 1, o.s || 1);
  rr(ctx, -118, -330, 80, 330, 26); fillStroke(ctx, '#4A4F57', 5); rr(ctx, -112, -420, 64, 120, 22); fillStroke(ctx, '#5A606B', 5); rr(ctx, -118, -26, 260, 52, 16); fillStroke(ctx, '#4A4F57', 5);
  const lean = o.lean ?? 0.05, hd = [12 + Math.sin(lean) * 60, -267 - 4];
  LT.lit(ctx, c => R.figure(c, 0, 96, 1, 1, L, { hip: [0, -96], lean, headTilt: o.tilt || 0, noShadow: true,
    legN: { foot: [150, 0] }, legF: { foot: [128, 0] }, armN: o.armN || { hand: [110, -128], grip: 'fist' }, armF: o.armF || { hand: [96, -126], grip: 'fist' }, face: o.face || R.expr('neutral', { look: [1, 0] }), farFront: o.farFront }), { rim: { dir: [1, -0.3], color: '#D8F0FF', w: 7, a: 0.8 } });
  // pilot cap (navy crown, short brim to the front, gold badge)
  if (o.cap !== false) { ctx.save(); ctx.translate(hd[0] + 8, hd[1] - 74); ctx.rotate(lean * 0.6 + (o.tilt || 0) * 0.4); path(ctx, c => { c.moveTo(-70, 10); c.bezierCurveTo(-72, -36, 66, -40, 70, 10); c.closePath(); }, '#2E3A59', 4.5); rr(ctx, -68, 2, 150, 16, 6); fillStroke(ctx, '#171717', 3.5);
    ell(ctx, 8, -10, 13, 11); fillStroke(ctx, C.yellow, 3); ctx.restore(); }
  ctx.restore();
}

// ---------- backyard (California, 1982): house, fence, palm tree, lawn; floor y = 0 ----------
function backyard(ctx, t, o = {}) {
  skyFill(ctx, '#7FB6F2', '#DDF0FF', -3200, 0); LT.glow(ctx, 1400, -1800, 900, 'rgba(255,245,200,1)', 0.35);
  cloud(ctx, -700 + t * 6, -1500, 1.3, 0.95); cloud(ctx, 900 + t * 4, -1750, 1.1, 0.9);
  ctx.fillStyle = '#9DB8A0'; ctx.beginPath(); ctx.moveTo(-3000, -150); for (let x = -3000; x <= 3000; x += 160) ctx.lineTo(x, -230 - Math.sin(x / 400) * 80 - hash(x) * 30); ctx.lineTo(3000, 0); ctx.lineTo(-3000, 0); ctx.closePath(); ctx.fill(); // low hills
  // house at the left
  ctx.save(); ctx.translate(-760, 0); rr(ctx, -330, -620, 780, 620, 8); fillStroke(ctx, '#F2E2C0', 5);
  poly(ctx, [[-380, -620], [60, -780], [500, -620]], '#C86A4A', 5);
  for (const [wx, wy] of [[-180, -420], [230, -420]]) { rr(ctx, wx - 80, wy - 80, 160, 170, 8); fillStroke(ctx, '#BFE0FA', 5); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(wx, wy - 80); ctx.lineTo(wx, wy + 90); ctx.moveTo(wx - 80, wy + 5); ctx.lineTo(wx + 80, wy + 5); ctx.stroke(); }
  rr(ctx, 20, -380, 130, 380, 8); fillStroke(ctx, '#8A5A34', 5); ctx.restore();
  // wooden fence with posts
  for (let x = -1500; x < 2200; x += 78) { poly(ctx, [[x, 0], [x, -230 - (hash(x) - 0.5) * 12], [x + 33, -255], [x + 66, -230 - (hash(x + 1) - 0.5) * 12], [x + 66, 0]], x % 156 ? '#E8C890' : '#D6B07A', 4); }
  ctx.fillStyle = 'rgba(70,45,25,0.25)'; ctx.fillRect(-1500, -90, 3700, 14);
  // palm tree at the right
  ctx.save(); ctx.translate(900, 0); tube(ctx, [[0, 0], [30, -420], [10, -820]], 54, '#9A7A52', 5);
  for (let i = 0; i < 7; i++) { const a = -2.9 + i * 0.5 + Math.sin(t * 0.8 + i) * 0.03; ctx.save(); ctx.translate(10, -840); ctx.rotate(a); path(ctx, c => { c.moveTo(0, 0); c.bezierCurveTo(90, -70, 220, -40, 300, 50); c.bezierCurveTo(200, -10, 90, -20, 0, 0); }, '#3E9E5A', 4.5); ctx.restore(); } ctx.restore();
  // lawn (paper green with slightly darker stripes)
  ctx.fillStyle = '#7CC27A'; ctx.fillRect(-3000, 0, 6000, 1600); for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? 'rgba(60,140,70,0.18)' : 'rgba(255,255,255,0)'; ctx.fillRect(-3000, i * 90, 6000, 90); }
  for (let i = 0; i < 40; i++) { const gx = -1500 + hash(i) * 3200, gy = 40 + hash(i + 20) * 500; ctx.strokeStyle = '#4C9A56'; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 6, gy - 22); ctx.moveTo(gx, gy); ctx.lineTo(gx + 8, gy - 20); ctx.stroke(); }
}

// ---------- street with houses and power lines (floor y = 0). Poles at POLES; wires hang between them; WIRE_Y is the sag height at x ----------
const POLES = [-900, 700, 2300];
function street(ctx, t, o = {}) {
  skyFill(ctx, '#8CC0F4', '#E3F3FF', -3200, 0); cloud(ctx, 200 + t * 5, -1900, 1.1, 0.9); cloud(ctx, 1700, -1500, 1.4, 0.95);
  // houses behind
  const cols = ['#F2E2C0', '#E8C8B0', '#CFE3D0', '#E6D8F0'], roofs = ['#C86A4A', '#8A5A6A', '#6A7AA0', '#B07A4A'];
  for (let i = 0; i < 9; i++) { const x = -1700 + i * 520, h = 360 + hash(i) * 120; rr(ctx, x, -h, 420, h, 6); fillStroke(ctx, cols[i % 4], 5); poly(ctx, [[x - 30, -h], [x + 210, -h - 150], [x + 450, -h]], roofs[i % 4], 5);
    rr(ctx, x + 50, -h + 90, 90, 100, 6); fillStroke(ctx, '#BFE0FA', 4); rr(ctx, x + 280, -h + 90, 90, 100, 6); fillStroke(ctx, '#BFE0FA', 4); rr(ctx, x + 180, -150, 70, 150, 6); fillStroke(ctx, '#8A5A34', 4); }
  ctx.fillStyle = '#7CC27A'; ctx.fillRect(-3000, 0, 6000, 130); ctx.fillStyle = '#B9B1A3'; ctx.fillRect(-3000, 130, 6000, 70); ctx.fillStyle = '#5A606B'; ctx.fillRect(-3000, 200, 6000, 900);
  ctx.fillStyle = '#E9D36A'; for (let x = -3000; x < 3000; x += 240) ctx.fillRect(x, 480, 130, 14);
  // poles
  for (const p of POLES) { ctx.save(); ctx.translate(p, 40); tube(ctx, [[0, 0], [0, -900]], 38, '#8A6A48', 5); tube(ctx, [[-130, -840], [130, -840]], 24, '#7A5A3A', 4.5); for (const dx of [-110, 0, 110]) { ctx.beginPath(); ctx.arc(dx, -866, 11, 0, 7); fillStroke(ctx, '#BFD4F2', 3.5); } ctx.restore(); }
  // wires (three, staggered) between the poles; o.dip(x, k) lets a caught wire sag
  ctx.lineCap = 'round'; for (let k = -1; k <= 1; k++) { ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3.2); ctx.beginPath(); for (let a = 0; a < POLES.length - 1; a++) { const x0 = POLES[a], x1 = POLES[a + 1]; ctx.moveTo(x0, -826 + k * 38); for (let u = 0; u <= 1.001; u += 0.025) { const x = lerp(x0, x1, u); ctx.lineTo(x, -826 + k * 38 + Math.sin(u * Math.PI) * 64 + (o.dip ? o.dip(x, k) : 0)); } } ctx.stroke(); }
}
const wireAt = x => { const a = POLES.findIndex((p, i) => i < POLES.length - 1 && x >= p && x <= POLES[i + 1]); if (a < 0) return -826; const u = (x - POLES[a]) / (POLES[a + 1] - POLES[a]); return -826 + Math.sin(u * Math.PI) * 64; };

// ---------- the FAA notice (generic paper, plain text, no logo) ----------
function notice(ctx, w, h, o = {}) {
  ctx.save(); CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 10), '#FFFDF8', { elev: 1.6 });
  txt(ctx, 'FAA', -w / 2 + 70, -h / 2 + 76, 60, NAVY, 'left'); ctx.fillStyle = NAVY; ctx.fillRect(-w / 2 + 40, -h / 2 + 100, w - 80, 6);
  fitTxt(ctx, 'NOTICE OF CIVIL PENALTY', 0, -h / 2 + 168, 38, '#4A4F57', w - 70);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(23,23,23,0.16)'; rr(ctx, -w / 2 + 50, -h / 2 + 220 + i * 46, (w - 100) * (i % 3 === 2 ? 0.62 : 1), 16, 8); ctx.fill(); }
  ctx.restore();
}
function stampMark(ctx, s, o = {}) { // a rubber stamp in red: rounded frame + text
  ctx.save(); ctx.rotate(o.rot ?? -0.12); const size = o.size || 110; ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 70, h = size * 1.35;
  ctx.globalAlpha *= 0.96; ctx.lineWidth = 12; ctx.strokeStyle = o.col || C.red; rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.stroke(); ctx.lineWidth = 4; rr(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 14); ctx.stroke();
  txt(ctx, s, 0, size * 0.34, size, o.col || C.red); ctx.restore();
}

// ---------- the museum hall: warm wall, wood floor, big window with sky, plinth with a glass case, spotlight; floor y = 0 ----------
function museum(ctx, t, o = {}) {
  ctx.fillStyle = '#E4D8C4'; ctx.fillRect(-3000, -3000, 6000, 3000);
  const g = ctx.createLinearGradient(0, -1800, 0, 0); g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(120,90,60,0.12)'); ctx.fillStyle = g; ctx.fillRect(-3000, -3000, 6000, 3000);
  // tall window with the sky behind the exhibit
  ctx.save(); ctx.translate(0, -1080); rr(ctx, -430, -520, 860, 1040, 8); ctx.save(); ctx.clip(); skyFill(ctx, '#6FB0F2', '#DDF0FF', -520, 520); cloud(ctx, -120 + t * 5, 40, 1.2, 0.95); cloud(ctx, 220 - t * 3, -190, 0.9, 0.9); ctx.restore();
  rr(ctx, -430, -520, 860, 1040, 8); ctx.lineWidth = px(ctx, 10); ctx.strokeStyle = INK; ctx.stroke(); ctx.strokeStyle = '#B9B1A3'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, -520); ctx.lineTo(0, 520); ctx.moveTo(-430, 0); ctx.lineTo(430, 0); ctx.stroke(); ctx.restore();
  // wood floor
  ctx.fillStyle = '#B98A5A'; ctx.fillRect(-3000, 0, 6000, 1400); for (let i = 0; i < 16; i++) { ctx.strokeStyle = 'rgba(70,40,15,0.18)'; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(-3000, i * 80 + 20); ctx.lineTo(3000, i * 80 + 20); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-3000, 0, 6000, 24);
  // spotlight cone from above
  const cone = ctx.createLinearGradient(0, -2000, 0, 0); cone.addColorStop(0, 'rgba(255,244,205,0.0)'); cone.addColorStop(1, 'rgba(255,244,205,0.34)'); ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(-90, -2000); ctx.lineTo(90, -2000); ctx.lineTo(520, 0); ctx.lineTo(-520, 0); ctx.closePath(); ctx.fill();
}
function plinth(ctx, t, o = {}) { // plinth (front) + glass case around the chair; chair sits on top, seat at y = -(plinth + 150)
  ctx.save(); rr(ctx, -330, -250, 660, 250, 8); fillStroke(ctx, '#F4EFE6', 5); rr(ctx, -350, -278, 700, 36, 8); fillStroke(ctx, '#FFFDF8', 5);
  CL.cutout(ctx, () => rr(ctx, -150, -170, 300, 96, 8), '#2E3A59', { elev: 0.8, tex: 0 }); fitTxt(ctx, "LARRY WALTERS' LAWN CHAIR", 0, -128, 26, C.yellow, 270); fitTxt(ctx, 'JULY 2, 1982', 0, -96, 22, '#FFFDF8', 270);
  ctx.restore();
}
function stanchions(ctx, x0, x1) { for (const x of [x0, x1]) { ctx.save(); ctx.translate(x, 0); ell(ctx, 0, 0, 52, 14); fillStroke(ctx, '#C9A04A', 4); tube(ctx, [[0, 0], [0, -190]], 14, '#C9A04A', 4); ell(ctx, 0, -196, 22, 14); fillStroke(ctx, '#C9A04A', 4); ctx.restore(); }
  ctx.strokeStyle = C.red; ctx.lineWidth = px(ctx, 8); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, -190); ctx.quadraticCurveTo((x0 + x1) / 2, -110, x1, -190); ctx.stroke(); }

module.exports = { ceiling, townBelow, W, H, CREAM, NAVY, layer, txt, fitTxt, path, poly, LARRY, CAPTAIN, FIRST, OFFICIAL, cloud, skyFill, sky, balloon, balloons, BAL, aliveCount, jug, chair, larrySeated, gun, airliner, WIN, cockpitBack, pilotSeated,
  backyard, street, POLES, wireAt, notice, stampMark, museum, plinth, stanchions };
