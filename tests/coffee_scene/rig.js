// Full cartoon character rig for the coffee test (3/4 side view).
// Local space: feet on y = 0, up is -y, the figure faces +x (flip with facing = -1). Height ≈ 600 units at s = 1.
// Jointed arms and legs (2-bone IK), torso with lean, big head with eyes, lids, brows, mouth shapes, hands with fingers.
const K = require('../mcd_collage/kit');
const { C, clamp, lerp } = K;
const INK = '#171717';

function shade(hex, k) { // k < 0 darker, k > 0 lighter
  const p = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return '#' + p.map(v => Math.round(clamp(k < 0 ? v * (1 + k) : v + (255 - v) * k, 0, 255)).toString(16).padStart(2, '0')).join('');
}
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const rot = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

// 2-bone IK: joint between a and b; pick = function(j1, j2) -> chosen joint
function ik(a, b, L1, L2, pick) {
  const dx = b[0] - a[0], dy = b[1] - a[1]; let d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.01);
  const base = Math.atan2(dy, dx), off = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const j1 = [a[0] + Math.cos(base + off) * L1, a[1] + Math.sin(base + off) * L1], j2 = [a[0] + Math.cos(base - off) * L1, a[1] + Math.sin(base - off) * L1];
  const j = pick(j1, j2), r = Math.hypot(b[0] - j[0], b[1] - j[1]), e = Math.atan2(b[1] - j[1], b[0] - j[0]);
  return [j, [j[0] + Math.cos(e) * Math.min(r, L2), j[1] + Math.sin(e) * Math.min(r, L2)]];
}

// outlined tube through points (limbs): ink stroke under a colour stroke, round joints
function tube(ctx, pts, w, col, lw = 5) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i]);
  ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 2; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
}
function fillStroke(ctx, col, lw = 5) { ctx.fillStyle = col; ctx.fill(); if (lw) { ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); } }
function ell(ctx, x, y, rx, ry, r = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), r, 0, Math.PI * 2); }

// ---------- hands ----------
// drawn at the wrist, rotated along the forearm (a = forearm angle). grip: open | relax | fist | point | hold | pinch | wave
function hand(ctx, w, a, skin, grip = 'relax', o = {}) {
  ctx.save(); ctx.translate(w[0], w[1]); ctx.rotate(a); const sc = o.size || 1; ctx.scale(sc, sc * (o.mirror ? -1 : 1));
  const sk = skin, dk = shade(skin, -0.18), lw = 4.5;
  const finger = (x0, y0, ang, len, wd = 11) => { const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len; tube(ctx, [[x0, y0], [x1, y1]], wd, sk, lw); };
  if (o.under) o.under(ctx); // the held object, under the fingers
  if (grip === 'fist' || grip === 'hold' || grip === 'pinch' || grip === 'point') {
    if (grip === 'point') finger(14, -4, -0.1, 34, 11);
    ell(ctx, 12, 0, 21, 19); fillStroke(ctx, sk, lw);
    if (grip === 'hold') { // fingers wrapped around a cup: four little bands in front
      for (let i = 0; i < 3; i++) { ell(ctx, 26 + i * 2, -12 + i * 12, 9, 6.5, 0.2); fillStroke(ctx, sk, 3.5); }
    } else { ctx.strokeStyle = dk; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(24, -8); ctx.quadraticCurveTo(30, 0, 24, 9); ctx.stroke(); }
    // thumb over the top
    tube(ctx, [[4, -14], [grip === 'pinch' ? 26 : 20, grip === 'pinch' ? -18 : -16]], 11, sk, lw);
  } else {
    const spread = grip === 'open' || grip === 'wave' ? 0.22 : 0.1, len = grip === 'relax' ? 24 : 30;
    for (let i = 0; i < 4; i++) finger(20, -10 + i * 7, (i - 1.5) * spread + (grip === 'relax' ? 0.35 : 0), len - Math.abs(i - 1.2) * 3, 10.5);
    ell(ctx, 10, 0, 20, 17); fillStroke(ctx, sk, lw);
    ell(ctx, 13, 0, 15, 12); ctx.fillStyle = sk; ctx.fill(); // hide the finger roots
    tube(ctx, [[6, -12], [18, -26]], 11, sk, lw); // thumb
  }
  if (o.over) o.over(ctx);
  ctx.restore();
}

// ---------- head / face ----------
// f: { look:[x,y] -1..1, blink 0..1, happy 0..1 (eye arcs), brow -1..1 (raise), browAng, mouth: smile|grin|talk|o|flat|sip, talk 0..1, blush }
function head(ctx, cx, cy, R, L, f = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(f.tilt || 0);
  const sk = L.skin, hair = L.hair;
  // hair behind (bun / long)
  if (L.hairStyle === 'bun') { ell(ctx, -R * 0.55, -R * 0.78, R * 0.42, R * 0.4); fillStroke(ctx, hair); ell(ctx, -R * 0.3, -R * 0.55, R * 0.16, R * 0.08, -0.6); fillStroke(ctx, C.red, 4); }
  if (L.hairStyle === 'long') { ctx.beginPath(); ctx.moveTo(-R * 1.0, -R * 0.2); ctx.quadraticCurveTo(-R * 1.25, R * 0.9, -R * 0.55, R * 1.15); ctx.lineTo(R * 0.2, R * 0.6); ctx.lineTo(R * 0.1, -R * 0.6); ctx.closePath(); fillStroke(ctx, hair); }
  // ear (behind face, near the back of the head)
  ell(ctx, -R * 0.12, R * 0.08, R * 0.2, R * 0.25); fillStroke(ctx, sk);
  // skull + cheek/jaw toward the facing side
  ctx.beginPath(); ctx.moveTo(-R * 0.9, -R * 0.3);
  ctx.bezierCurveTo(-R * 0.95, -R * 1.25, R * 0.95, -R * 1.25, R * 0.98, -R * 0.15);
  ctx.bezierCurveTo(R * 1.02, R * 0.3, R * 0.85, R * 0.88, R * 0.25, R * 0.92);
  ctx.bezierCurveTo(-R * 0.3, R * 0.95, -R * 0.82, R * 0.6, -R * 0.9, -R * 0.3); ctx.closePath();
  fillStroke(ctx, sk);
  // soft shade on the back side
  ctx.save(); ctx.clip(); ell(ctx, -R * 1.05, R * 0.1, R * 0.5, R * 1.2); ctx.fillStyle = shade(sk, -0.12); ctx.fill(); ctx.restore();
  ell(ctx, -R * 0.12, R * 0.08, R * 0.11, R * 0.15); ctx.fillStyle = shade(sk, -0.2); ctx.fill();
  // nose
  ctx.beginPath(); ctx.moveTo(R * 0.92, -R * 0.02); ctx.quadraticCurveTo(R * 1.22, R * 0.2, R * 0.93, R * 0.3); ctx.fillStyle = sk; ctx.fill();
  ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke();
  // cheeks
  if ((f.blush ?? 0.5) > 0) { ell(ctx, R * 0.42, R * 0.4, R * 0.17, R * 0.1); ctx.fillStyle = `rgba(230,57,70,${0.28 * (f.blush ?? 0.5) * 2})`; ctx.fill(); }
  // eyes
  const lk = f.look || [0.4, 0], bl = clamp(f.blink || 0), hp = clamp(f.happy || 0);
  const eyes = [[R * 0.3, -R * 0.12, 1], [R * 0.74, -R * 0.12, 0.78]];
  for (const [ex, ey, k] of eyes) {
    const rx = R * 0.15 * k, ry = R * 0.2 * (f.wide ? 1.15 : 1);
    if (hp > 0.5) { // happy closed arcs ^ ^
      ctx.beginPath(); ctx.arc(ex, ey + ry * 0.35, rx * 1.05, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); continue;
    }
    ell(ctx, ex, ey, rx, ry); fillStroke(ctx, '#FFFFFF', 3.5);
    ctx.save(); ell(ctx, ex, ey, rx, ry); ctx.clip();
    const px = ex + lk[0] * rx * 0.45, py = ey + lk[1] * ry * 0.4 + ry * 0.08;
    ell(ctx, px, py, rx * 0.68, ry * 0.62); ctx.fillStyle = L.iris || '#5A3A22'; ctx.fill();
    ell(ctx, px, py, rx * 0.38, ry * 0.36); ctx.fillStyle = INK; ctx.fill();
    ell(ctx, px + rx * 0.22, py - ry * 0.26, rx * 0.2, ry * 0.15); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    // lids: blink + happy squint from below
    const lid = Math.max(bl, hp * 0.6);
    if (lid > 0.02) { ctx.fillStyle = shade(sk, -0.05); ctx.fillRect(ex - rx * 1.2, ey - ry * 1.2, rx * 2.4, ry * 2.4 * lid); }
    if (hp > 0.05) { ctx.fillStyle = sk; ell(ctx, ex, ey + ry * 1.25, rx * 1.3, ry * (0.35 + hp * 0.55)); ctx.fill(); }
    ctx.restore();
    if (lid > 0.02) { ctx.beginPath(); ctx.moveTo(ex - rx, ey - ry + ry * 2 * lid); ctx.lineTo(ex + rx, ey - ry + ry * 2 * lid); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
  }
  // brows
  const br = f.brow || 0, ba = f.browAng || 0;
  ctx.lineWidth = 7; ctx.strokeStyle = L.brow || shade(hair, -0.2); ctx.lineCap = 'round';
  for (const [ex, ey, k] of eyes) { const by = ey - R * 0.36 - br * R * 0.1; ctx.beginPath(); ctx.moveTo(ex - R * 0.13 * k, by + ba * R * 0.06 * (k === 1 ? 1 : -1)); ctx.quadraticCurveTo(ex, by - R * 0.05, ex + R * 0.13 * k, by - ba * R * 0.06 * (k === 1 ? 1 : -1)); ctx.stroke(); }
  // mouth
  const mx = R * 0.55, my = R * 0.5, m = f.mouth || 'smile', tk = clamp(f.talk || 0);
  ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  if (m === 'smile' && tk < 0.05) { ctx.beginPath(); ctx.moveTo(mx - R * 0.22, my - R * 0.06); ctx.quadraticCurveTo(mx, my + R * 0.16, mx + R * 0.22, my - R * 0.1); ctx.stroke(); }
  else if (m === 'flat') { ctx.beginPath(); ctx.moveTo(mx - R * 0.15, my); ctx.lineTo(mx + R * 0.15, my - R * 0.02); ctx.stroke(); }
  else if (m === 'sip') { ell(ctx, mx + R * 0.1, my, R * 0.07, R * 0.06); fillStroke(ctx, '#6B2A2A', 4); }
  else { // open mouth: grin / talk / o
    const open = m === 'grin' ? 0.55 + tk * 0.2 : m === 'o' ? 0.6 : 0.15 + tk * 0.55, wdt = m === 'o' ? 0.13 : 0.24;
    ctx.beginPath(); ctx.moveTo(mx - R * wdt, my - R * 0.06);
    ctx.quadraticCurveTo(mx, my - R * (m === 'grin' ? 0.0 : 0.08), mx + R * wdt, my - R * 0.08);
    ctx.quadraticCurveTo(mx + R * wdt * 0.6, my + R * 0.3 * open + R * 0.04, mx - R * 0.02, my + R * 0.32 * open + R * 0.04);
    ctx.quadraticCurveTo(mx - R * wdt * 0.8, my + R * 0.22 * open, mx - R * wdt, my - R * 0.06); ctx.closePath();
    ctx.fillStyle = '#6B2A2A'; ctx.fill();
    ctx.save(); ctx.clip(); ell(ctx, mx, my + R * 0.34 * open, R * 0.16, R * 0.1); ctx.fillStyle = '#E86A6A'; ctx.fill();
    if (m === 'grin') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - R * 0.3, my - R * 0.12, R * 0.6, R * 0.1); } ctx.restore();
    ctx.lineWidth = 4.5; ctx.stroke();
  }
  // hair on top
  ctx.fillStyle = hair;
  if (L.hairStyle === 'curly') {
    const blobs = [[-0.75, -0.55, 0.32], [-0.5, -0.85, 0.34], [-0.1, -1.0, 0.36], [0.3, -0.98, 0.33], [0.65, -0.78, 0.28], [-0.85, -0.15, 0.25], [0.85, -0.5, 0.2]];
    ctx.beginPath(); for (const [x, y, r] of blobs) { ctx.moveTo(x * R + r * R, y * R); ctx.arc(x * R, y * R, r * R, 0, 7); }
    ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.fill();
    ctx.beginPath(); ctx.arc(-0.05 * R, -0.62 * R, 0.62 * R, 0, 7); ctx.fill();
    ctx.strokeStyle = shade(hair, 0.25); ctx.lineWidth = 3.5;
    for (const [x, y, r] of blobs.slice(0, 5)) { ctx.beginPath(); ctx.arc(x * R + 4, y * R + 2, r * R * 0.5, 3.6, 5.2); ctx.stroke(); }
  } else if (L.hairStyle === 'bun' || L.hairStyle === 'long') {
    ctx.beginPath(); ctx.moveTo(-R * 0.95, R * 0.1); ctx.bezierCurveTo(-R * 1.05, -R * 1.25, R * 0.9, -R * 1.3, R * 0.95, -R * 0.4);
    ctx.quadraticCurveTo(R * 0.5, -R * 0.75, R * 0.05, -R * 0.55); ctx.quadraticCurveTo(-R * 0.4, -R * 0.4, -R * 0.55, R * 0.05); ctx.closePath(); fillStroke(ctx, hair);
    ctx.strokeStyle = shade(hair, 0.25); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-R * 0.5, -R * 0.75); ctx.quadraticCurveTo(R * 0.1, -R * 1.0, R * 0.6, -R * 0.8); ctx.stroke();
  } else if (L.hairStyle === 'short') {
    ctx.beginPath(); ctx.moveTo(-R * 0.92, -R * 0.05); ctx.bezierCurveTo(-R * 1.0, -R * 1.2, R * 0.9, -R * 1.25, R * 0.92, -R * 0.45);
    ctx.quadraticCurveTo(R * 0.4, -R * 0.62, -R * 0.2, -R * 0.5); ctx.quadraticCurveTo(-R * 0.5, -R * 0.3, -R * 0.6, R * 0.0); ctx.closePath(); fillStroke(ctx, hair);
  }
  if (L.beard) { ctx.beginPath(); ctx.moveTo(-R * 0.4, R * 0.2); ctx.quadraticCurveTo(-R * 0.2, R * 1.1, R * 0.45, R * 0.95); ctx.quadraticCurveTo(R * 0.9, R * 0.75, R * 0.9, R * 0.35);
    ctx.quadraticCurveTo(R * 0.55, R * 0.7, R * 0.2, R * 0.45); ctx.closePath(); fillStroke(ctx, L.hair); }
  if (L.glasses) { ctx.lineWidth = 5; ctx.strokeStyle = INK; for (const [ex, ey, k] of eyes) { ell(ctx, ex, ey, R * 0.21 * k, R * 0.2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(eyes[0][0] + R * 0.21, eyes[0][1]); ctx.lineTo(eyes[1][0] - R * 0.16, eyes[1][1]); ctx.moveTo(eyes[0][0] - R * 0.21, eyes[0][1]); ctx.lineTo(-R * 0.15, -R * 0.05); ctx.stroke(); }
  ctx.restore();
}

// ---------- the whole figure ----------
// P (pose, local units): hip [x,y], lean (rad, + = forward), headTilt, armN/armF: {hand:[x,y], grip, size, item(ctx), itemOver(ctx)},
// legN/legF: {foot:[x,y], sit:bool}, face {...}
function figure(ctx, x, y, s, facing, L, P) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s);
  const lw = 5;
  // contact shadow
  if (!P.noShadow) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 150); g.addColorStop(0, 'rgba(60,35,20,0.32)'); g.addColorStop(1, 'rgba(60,35,20,0)'); ctx.save(); ctx.scale(1, 0.16); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.fill(); ctx.restore(); }
  const hip = P.hip || [0, -256], lean = P.lean || 0, TL = 175;
  const neck = add(hip, rot([0, -TL], lean));
  const shN = add(neck, rot([8, 18], lean)), shF = add(neck, rot([-10, 16], lean));
  const hipN = add(hip, [6, 0]), hipF = add(hip, [-8, 0]);
  const legPts = (hp, lg) => { const [k, a] = ik(hp, add(lg.foot, [0, -24]), 124, 112, (j1, j2) => (j1[0] > j2[0] ? j1 : j2)); return [hp, k, a]; };
  const armPts = (sh, ar) => { const [e, w] = ik(sh, ar.hand, 102, 96, (j1, j2) => ar.elbowUp ? (j1[1] < j2[1] ? j1 : j2) : (j1[1] > j2[1] ? j1 : j2)); return [sh, e, w]; };
  const legN = legPts(hipN, P.legN || { foot: [14, 0] }), legF = legPts(hipF, P.legF || { foot: [-16, 0] });
  const armN = armPts(shN, P.armN || { hand: [18, -60] }), armF = armPts(shF, P.armF || { hand: [-14, -64] });
  const top = L.top, topD = shade(top, -0.22), pants = L.pants, pantsD = shade(pants, -0.25);
  const shoe = (a, col) => { ctx.save(); ctx.translate(a[0], a[1] + 24); ell(ctx, 22, -12, 44, 19); fillStroke(ctx, col, lw); ctx.fillStyle = L.sole || '#3B3B3B'; ctx.fillRect(-22, -6, 88, 6); ell(ctx, 22, -12, 44, 19); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); };
  const leg = (pts, far) => { tube(ctx, pts, 46, far ? pantsD : pants, lw); shoe(pts[2], far ? shade(L.shoes, -0.2) : L.shoes); };
  const arm = (pts, ar, far) => {
    const [sh, e, w] = pts, col = far ? topD : top;
    tube(ctx, [sh, e, w], 40, col, lw);
    // cuff
    const a = Math.atan2(w[1] - e[1], w[0] - e[0]), cuff = add(w, [-Math.cos(a) * 12, -Math.sin(a) * 12]);
    tube(ctx, [cuff, add(cuff, [Math.cos(a) * 3, Math.sin(a) * 3])], 44, far ? shade(L.cuff || top, -0.22) : (L.cuff || top), 4);
    if (ar.item) { ctx.save(); ctx.translate(w[0] + Math.cos(a) * 18, w[1] + Math.sin(a) * 18); ar.item(ctx); ctx.restore(); } // held upright
    hand(ctx, add(w, [Math.cos(a) * 4, Math.sin(a) * 4]), a + (ar.twist || 0), far ? shade(L.skin, -0.1) : L.skin, ar.grip || 'relax', { over: ar.itemOver, size: ar.size || 1, mirror: ar.mirror });
  };
  // back to front (farFront: the far arm reaches across the chest, draw it over the torso)
  if (!P.farFront) arm(armF, P.armF || {}, true);
  leg(legF, true);
  // torso
  ctx.save(); ctx.translate(hip[0], hip[1]); ctx.rotate(lean);
  const tb = () => { ctx.beginPath(); ctx.moveTo(-58, 18); ctx.bezierCurveTo(-66, -60, -70, -130, -50, -TL + 4); ctx.quadraticCurveTo(0, -TL - 22, 52, -TL + 2);
    ctx.bezierCurveTo(72, -130, 70, -60, 60, 18); ctx.quadraticCurveTo(0, 30, -58, 18); ctx.closePath(); };
  // pants seat under the top
  ell(ctx, 0, 6, 62, 30); fillStroke(ctx, pants, lw);
  tb(); fillStroke(ctx, top, lw);
  ctx.save(); tb(); ctx.clip(); ell(ctx, -78, -80, 40, 140); ctx.fillStyle = topD; ctx.fill();
  if (L.shirt) { ctx.beginPath(); ctx.moveTo(20, -TL - 10); ctx.lineTo(44, -TL + 50); ctx.lineTo(64, -TL + 40); ctx.lineTo(64, -TL - 10); ctx.closePath(); ctx.fillStyle = L.shirt; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  if (L.zip) { ctx.strokeStyle = shade(top, -0.4); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(44, -TL + 50); ctx.quadraticCurveTo(58, -60, 56, 14); ctx.stroke(); }
  if (L.stripe) { ctx.fillStyle = L.stripe; ctx.fillRect(-80, -4, 160, 14); }
  ctx.restore();
  if (L.apron) { ctx.beginPath(); ctx.moveTo(8, -TL + 28); ctx.lineTo(56, -TL + 30); ctx.bezierCurveTo(70, -100, 74, -10, 70, 120); ctx.lineTo(-6, 120); ctx.bezierCurveTo(-4, 40, 0, -60, 8, -TL + 28); ctx.closePath(); fillStroke(ctx, L.apron, lw);
    ctx.lineWidth = 6; ctx.strokeStyle = shade(L.apron, -0.35); ctx.beginPath(); ctx.moveTo(-50, -70); ctx.lineTo(14, -70); ctx.stroke();
    // little cup logo on the apron
    ctx.save(); ctx.translate(40, -40); ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, -12); ctx.lineTo(9, 12); ctx.lineTo(-9, 12); ctx.closePath(); fillStroke(ctx, C.red, 3); ctx.restore(); }
  // neck
  ctx.restore();
  const hd = add(neck, rot([12, -92], lean + (P.headTilt || 0) * 0.4));
  tube(ctx, [add(neck, [4, 6]), add(hd, [-8, 30])], 40, shade(L.skin, -0.12), lw);
  if (L.collar) { ctx.save(); ctx.translate(neck[0], neck[1]); ctx.rotate(lean); ell(ctx, 4, 2, 46, 16); fillStroke(ctx, L.collar, lw); ctx.restore(); }
  leg(legN, false);
  if (P.farFront) arm(armF, P.armF || {}, true);
  head(ctx, hd[0], hd[1], 78, L, { ...(P.face || {}), tilt: (P.headTilt || 0) + lean * 0.3 });
  arm(armN, P.armN || {}, false);
  ctx.restore();
  return { hd, neck, armN, armF };
}

// world position of a local point of a figure (for handing props between characters)
const toWorld = (x, y, s, facing, p) => [x + p[0] * s * facing, y + p[1] * s];
const toLocal = (x, y, s, facing, w) => [(w[0] - x) / (s * facing), (w[1] - y) / s];

// walk cycle: phase in radians, returns pose pieces (local, facing +x)
function walk(phase, o = {}) {
  const st = o.stride || 62, lift = o.lift || 34, bob = o.bob || 10;
  const hip = [0, -250 + bob * Math.abs(Math.cos(phase)) - bob * 0.5];
  const foot = ph => [st * Math.sin(ph), -lift * Math.max(0, Math.cos(ph))];
  const handSw = ph => [-38 * Math.sin(ph) + 10, -40 + 6 * Math.cos(ph * 2)];
  return { hip, lean: 0.06, legN: { foot: foot(phase) }, legF: { foot: foot(phase + Math.PI) }, armN: { hand: add(handSw(phase + Math.PI), [8, 0]), grip: 'relax' }, armF: { hand: handSw(phase), grip: 'relax' } };
}

// ---------- props ----------
function cup(ctx, s = 1, o = {}) { // takeaway cup, base at 0, ~100 tall
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-30, -96); ctx.lineTo(30, -96); ctx.lineTo(24, 0); ctx.lineTo(-24, 0); ctx.closePath(); fillStroke(ctx, '#FFFDF8', 4.5);
  ctx.beginPath(); ctx.moveTo(-29, -62); ctx.lineTo(29, -62); ctx.lineTo(27, -30); ctx.lineTo(-27, -30); ctx.closePath(); fillStroke(ctx, C.red, 4);
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(0, -46, 8, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-36, -96); ctx.lineTo(36, -96); ctx.lineTo(33, -110); ctx.lineTo(-33, -110); ctx.closePath(); fillStroke(ctx, '#3A2A22', 4.5);
  ctx.fillStyle = '#5A463C'; ctx.fillRect(-20, -116, 40, 8);
  if (o.steam) { ctx.lineCap = 'round'; ctx.lineWidth = 7; for (let i = 0; i < 3; i++) { const ph = o.steam * 2 + i * 2.1, u = (ph % 2) / 2; ctx.strokeStyle = `rgba(255,255,255,${0.7 * Math.sin(u * Math.PI)})`;
    ctx.beginPath(); ctx.moveTo(-14 + i * 14, -124 - u * 60); ctx.bezierCurveTo(-24 + i * 14, -140 - u * 60, -4 + i * 14, -158 - u * 60, -14 + i * 14, -176 - u * 60); ctx.stroke(); } }
  ctx.restore();
}
function card(ctx, s = 1) { // bank card centred, 86 x 54
  ctx.save(); ctx.scale(s, s);
  K.rr(ctx, -43, -27, 86, 54, 7); fillStroke(ctx, C.red, 4);
  ctx.save(); K.rr(ctx, -43, -27, 86, 54, 7); ctx.clip(); ctx.fillStyle = shade(C.red, -0.2); ctx.beginPath(); ctx.arc(46, 32, 46, 0, 7); ctx.fill(); ctx.restore();
  K.rr(ctx, -32, -12, 18, 14, 3); fillStroke(ctx, C.yellow, 2.5);
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 4; i++) ctx.fillRect(-32 + i * 15, 10, 11, 4);
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(22, -10, 5 + i * 5, -0.7, 0.7); ctx.stroke(); }
  ctx.restore();
}

module.exports = { INK, shade, ik, tube, fillStroke, ell, hand, head, figure, walk, cup, card, toWorld, toLocal, add, mix, rot };
