// Style test rig: one skeleton (2-bone IK arms/legs, walk cycle, lean, crouch) drawn by two skins (A+ and D).
// Characters face left (dir -1). Hands are placed on targets (IK), so props hold exactly where the hands are.
const lerp = (a, b, u) => a + (b - a) * u;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = v => Math.hypot(v[0], v[1]);
const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const QA = []; // reach errors collected during rendering

// two-bone IK; bend = +1/-1 picks the elbow/knee side
function ik(a, t, l1, l2, bend, tag) {
  let d = sub(t, a), dist = len(d);
  const max = l1 + l2 - 0.5;
  if (dist > max) { if (tag && dist - max > 4) QA.push(`${tag}: target ${Math.round(dist - max)}px out of reach`); d = [d[0] / dist * max, d[1] / dist * max]; dist = max; t = add(a, d); }
  const cosA = clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
  const base = Math.atan2(d[1], d[0]), ang = base + bend * Math.acos(cosA);
  return { mid: [a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1], end: t };
}

// ---- skins: proportions + palette + line weight ----------------------------------------------
const SKINS = {
  A: { name: 'A', ink: '#1c1d22', lw: 4.5, shadeK: 0.8, off: 10,
    headR: 54, neck: 22, torso: 206, thigh: 150, shin: 146, ankle: 14, foot: 64, ua: 122, fa: 116, shW: 30, limbW: 1,
    eyeR: 0.235, eyeY: -0.02, eyeNear: -0.14, eyeFar: -0.6, glassR: 1.38, mouthX: -0.48, mouthY: 0.52, mouthW: 0.36, noseK: 1 },
  D: { name: 'D', ink: '#141210', lw: 7.5, shadeK: 0.86, off: 7,
    headR: 82, neck: 14, torso: 172, thigh: 116, shin: 108, ankle: 12, foot: 70, ua: 108, fa: 104, shW: 26, limbW: 1.12,
    eyeR: 0.36, eyeY: -0.08, eyeNear: -0.06, eyeFar: -0.66, glassR: 1.2, mouthX: -0.42, mouthY: 0.58, mouthW: 0.52, noseK: 1.6 },
};
const CAST = {
  hero: { A: { skin: '#e9b98f', top: '#d9a02e', top2: '#b9821c', pants: '#34405a', shoe: '#ece8e0', sole: '#9a958c', hair: '#3a2a20', glasses: true, hood: true },
          D: { skin: '#f6c99c', top: '#f0aa22', top2: '#d38c10', pants: '#3f62b0', shoe: '#ffffff', sole: '#b9b4ab', hair: '#5a3418', glasses: true, hood: true } },
  gary: { A: { skin: '#b9c39d', top: '#e6e1d3', top2: '#c9c2ae', pants: '#6a5640', shoe: '#5a4a3a', sole: '#3a3028', hair: '#6d6250', bald: true, belly: 1, stain: true, arm: 'skin', wide: 1.3 },
          D: { skin: '#bccb8f', top: '#f2eee2', top2: '#d6cfba', pants: '#8a6a45', shoe: '#6a5236', sole: '#3a3028', hair: '#7a6a55', bald: true, belly: 1, stain: true, arm: 'skin', wide: 1.3 } },
};
function shade(c, k) { const v = [1, 3, 5].map(i => Math.round(parseInt(c.slice(i, i + 2), 16) * k)); return '#' + v.map(x => Math.min(255, x).toString(16).padStart(2, '0')).join(''); }

// ---- pose -> joints ------------------------------------------------------------------------------
// pose: { x, ground, crouch, lean, tilt, walk:{w,u,stride}, near:[x,y]|null, far:[x,y]|null, bendNear, bendFar }
function solve(S, pose, tag = '') {
  const dir = -1, cr = pose.crouch || 0, w = pose.walk ? pose.walk.w : 0, u = pose.walk ? pose.walk.u : 0, stride = pose.walk ? pose.walk.stride : 0;
  const legL = S.thigh + S.shin;
  const bob = w * (1 - Math.cos(u * Math.PI * 4)) * 4;
  const hip = [pose.x, pose.ground - S.ankle - legL * (1 - 0.2 * cr) + bob + (pose.hop || 0)];
  // feet: planted stance / swing, blended with standing stance by walk weight
  const foot = (off, standDx) => {
    const fu = ((u + off) % 1 + 1) % 1; let fx, lift = 0;
    if (fu < 0.5) fx = pose.x - dir * stride * (fu - 0.25);
    else { const s = (fu - 0.5) / 0.5, e = s * s * (3 - 2 * s); fx = pose.x + dir * stride * (-0.25 + 0.5 * e); lift = Math.sin(s * Math.PI) * 26; }
    const sx = pose.x + standDx * (1 + cr * 0.6);
    return [lerp(sx, fx, w), pose.ground - S.ankle - lerp(0, lift, w) + (pose.hop || 0) * 0.85];
  };
  const fN = pose.footN || foot(0, -16), fF = pose.footF || foot(0.5, 20);
  const kN = ik([hip[0] - 8, hip[1]], fN, S.thigh, S.shin, 1, tag && tag + ' near leg').mid;
  const kF = ik([hip[0] + 8, hip[1]], fF, S.thigh, S.shin, 1, tag && tag + ' far leg').mid;
  const lean = pose.lean || 0;
  const tv = [Math.sin(lean) * dir, -Math.cos(lean)];
  const neck = add(hip, [tv[0] * S.torso, tv[1] * S.torso]);
  const shN = add(neck, [tv[0] * -16 + dir * -4, tv[1] * -16 + 4]), shF = add(shN, [-dir * 14, -6]);
  const ht = lean * 0.6 + (pose.tilt || 0);
  const head = add(neck, rot([0, -(S.neck + S.headR * 0.92)], -ht));
  // arms
  const sw = w * Math.sin(u * Math.PI * 2) * 26;
  const rest = (sh, k) => add(sh, [dir * -6 + k * sw, S.ua + S.fa - 22]);
  const hN = pose.near || rest(shN, 1), hF = pose.far || rest(shF, -1);
  const aN = ik(shN, hN, S.ua, S.fa, pose.bendNear || -1, tag && pose.near && tag + ' near hand');
  const aF = ik(shF, hF, S.ua, S.fa, pose.bendFar || -1, tag && pose.far && tag + ' far hand');
  return { hip, kN, kF, fN, fF, neck, shN, shF, head, eN: aN.mid, wN: aN.end, eF: aF.mid, wF: aF.end, lean, ht };
}

// ---- drawing primitives ------------------------------------------------------------------------
function cap(c, a, b, ra, rb) {
  const an = Math.atan2(b[1] - a[1], b[0] - a[0]), px = Math.cos(an + Math.PI / 2), py = Math.sin(an + Math.PI / 2);
  c.moveTo(a[0] + px * ra, a[1] + py * ra); c.lineTo(b[0] + px * rb, b[1] + py * rb);
  c.arc(b[0], b[1], rb, an + Math.PI / 2, an - Math.PI / 2, true); c.lineTo(a[0] - px * ra, a[1] - py * ra);
  c.arc(a[0], a[1], ra, an - Math.PI / 2, an + Math.PI / 2, true); c.closePath();
}
// inked, cel-shaded fill: ink pass first (no seams), shadow colour, lit colour shifted towards the light
function paint(ctx, S, path, base, opt = {}) {
  const k = opt.k ?? S.shadeK;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (!opt.noInk) { ctx.beginPath(); path(ctx); ctx.lineWidth = S.lw * 2; ctx.strokeStyle = S.ink; ctx.stroke(); }
  ctx.beginPath(); path(ctx); ctx.fillStyle = opt.flat ? base : shade(base, k); ctx.fill();
  if (!opt.flat) { ctx.save(); ctx.clip(); ctx.translate(-S.off * (opt.lx ?? 1), -S.off * 0.7); ctx.beginPath(); path(ctx); ctx.fillStyle = base; ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function line(ctx, pts, w, col) { ctx.save(); ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach(p => ctx.lineTo(...p)); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }

// hand at wrist w, pointing along forearm (from elbow e). kind: fist | open | wave
function hand(ctx, S, C, e, w, kind = 'fist', t = 0) {
  const a = Math.atan2(w[1] - e[1], w[0] - e[0]), k = S.limbW, r = (S.name === 'D' ? 22 : 18) * k;
  ctx.save(); ctx.translate(...w); ctx.rotate(a);
  if (kind === 'fist') {
    paint(ctx, S, c => c.ellipse(r * 0.7, 0, r * 1.05, r * 0.92, 0, 0, 7), C.skin);
    ctx.strokeStyle = S.ink; ctx.lineWidth = S.lw * 0.6; for (const y of [-0.45, 0, 0.45]) { ctx.beginPath(); ctx.moveTo(r * 1.15, y * r); ctx.lineTo(r * 1.6, y * r * 1.1); ctx.stroke(); }
  } else {
    const spread = kind === 'wave' ? 0.35 + Math.sin(t * 16) * 0.12 : 0.18;
    for (let i = 0; i < 4; i++) { const fa = (i - 1.5) * spread; paint(ctx, S, c => cap(c, [r * 0.8, 0], [r * 0.8 + Math.cos(fa) * r * 1.5, Math.sin(fa) * r * 1.5], r * 0.26, r * 0.22), C.skin); }
    paint(ctx, S, c => cap(c, [r * 0.4, r * 0.4], [r * 0.9, r * 1.2], r * 0.28, r * 0.24), C.skin);
    paint(ctx, S, c => c.ellipse(r * 0.6, 0, r * 0.95, r * 0.8, 0, 0, 7), C.skin);
  }
  ctx.restore();
}
function limb(ctx, S, a, m, b, w1, w2, w3, col) { paint(ctx, S, c => { cap(c, a, m, w1, w2); cap(c, m, b, w2, w3); }, col); }
function shoe(ctx, S, C, f) {
  const L = S.foot;
  paint(ctx, S, c => { c.moveTo(f[0] + 18, f[1] + 14); c.lineTo(f[0] - L, f[1] + 14); c.quadraticCurveTo(f[0] - L - 8, f[1] - 6, f[0] - L * 0.55, f[1] - 14); c.quadraticCurveTo(f[0] - 6, f[1] - 22, f[0] + 16, f[1] - 14); c.closePath(); }, C.shoe);
  line(ctx, [[f[0] + 16, f[1] + 12], [f[0] - L - 2, f[1] + 12]], 6, C.sole);
}

// ---- face ------------------------------------------------------------------------------------------
// e: { eyes: open|wide|squint|closed|half, look:[x,y], brow: neutral|up|worried|angry|flat|skeptic, mouth: closed|smile|grin|o|small|wide|frown|smirk|flat|teeth, open:0..1, sweat, twitch, blood }
function face(ctx, S, C, R, e) {
  const ink = S.ink, D = S.name === 'D';
  const eye = (cx, sc, near) => {
    const ex = cx * R, ey = S.eyeY * R, rx = S.eyeR * R * sc, ry = S.eyeR * R * (D ? 1.08 : 1.15);
    let open = { open: 1, wide: 1.25, squint: 0.35, closed: 0, half: 0.55 }[e.eyes || 'open'];
    if (e.twitch && near) open *= 0.55;
    const W = rx * (e.eyes === 'wide' ? 1.12 : 1), H = ry * (e.eyes === 'wide' ? 1.15 : 1);
    if (open > 0.02) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, W, H, 0, 0, 7); ctx.fillStyle = '#fbfaf6'; ctx.fill(); ctx.lineWidth = S.lw * 0.9; ctx.strokeStyle = ink; ctx.stroke();
      ctx.clip();
      if (e.blood) { ctx.strokeStyle = '#d0453c'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { const a = i * 1.3; ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * W, ey + Math.sin(a) * H); ctx.lineTo(ex + Math.cos(a) * W * 0.45, ey + Math.sin(a + 0.4) * H * 0.45); ctx.stroke(); } }
      const lk = e.look || [-0.4, 0], pr = (D ? 0.36 : 0.5) * Math.min(W, H) * (e.eyes === 'wide' ? 0.7 : 1);
      ctx.beginPath(); ctx.arc(ex + lk[0] * W * 0.45, ey + lk[1] * H * 0.4, pr, 0, 7); ctx.fillStyle = ink; ctx.fill();
      ctx.beginPath(); ctx.arc(ex + lk[0] * W * 0.45 + pr * 0.35, ey + lk[1] * H * 0.4 - pr * 0.35, pr * 0.28, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
      // eyelids (skin) for squint/half
      if (open < 1) { ctx.fillStyle = C.skin; ctx.fillRect(ex - W - 2, ey - H - 2, W * 2 + 4, (H * 2 + 4) * (1 - open) * 0.62); ctx.beginPath(); ctx.moveTo(ex - W, ey - H + (H * 2) * (1 - open) * 0.62); ctx.lineTo(ex + W, ey - H + (H * 2) * (1 - open) * 0.62); ctx.lineWidth = S.lw; ctx.strokeStyle = ink; ctx.stroke(); }
      ctx.restore();
    } else line(ctx, [[ex - W, ey], [ex + W, ey + 2]], S.lw * 1.1, ink);
    // brow
    const by = ey - H - R * 0.1, b = e.brow || 'neutral';
    const tilt = { neutral: 0, up: 0, worried: -0.35, angry: 0.4, flat: 0, skeptic: near ? -0.3 : 0.25 }[b] * (near ? 1 : -1) * -1;
    const lift = { up: -R * 0.1, worried: -R * 0.04, skeptic: near ? -R * 0.1 : 0, flat: R * 0.03 }[b] || 0;
    ctx.save(); ctx.translate(ex, by + lift); ctx.rotate(tilt); ctx.beginPath(); ctx.ellipse(0, 0, W * 1.05, R * (D ? 0.05 : 0.055), 0, 0, 7); ctx.fillStyle = C.bald ? shade(C.skin, 0.55) : C.hair; ctx.fill(); ctx.lineWidth = S.lw * 0.6; ctx.strokeStyle = ink; ctx.stroke(); ctx.restore();
    return [ex, ey, W, H];
  };
  const eF = eye(S.eyeFar, 0.78, false), eN = eye(S.eyeNear, 1, true);
  if (C.glasses) { ctx.save(); ctx.lineWidth = S.lw * 1.05; ctx.strokeStyle = ink; for (const [x, y, w, h] of [eF, eN]) { ctx.beginPath(); ctx.ellipse(x, y, w * S.glassR, h * S.glassR * 0.95, 0, 0, 7); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(eF[0] + eF[2] * S.glassR, eF[1]); ctx.lineTo(eN[0] - eN[2] * S.glassR, eN[1]); ctx.stroke(); ctx.beginPath(); ctx.moveTo(eN[0] + eN[2] * S.glassR, eN[1] - 2); ctx.lineTo(R * 0.5, eN[1] - R * 0.06); ctx.stroke(); ctx.restore(); }
  // nose
  const nk = S.noseK;
  paint(ctx, S, c => { c.moveTo(-R * 0.62, -R * 0.02); c.quadraticCurveTo(-R * (0.82 + 0.12 * nk), R * 0.22, -R * (0.72 + 0.08 * nk), R * (0.3 + 0.04 * nk)); c.quadraticCurveTo(-R * 0.62, R * 0.36, -R * 0.52, R * 0.3); }, C.skin, { k: 0.9 });
  // mouth
  const mx = S.mouthX * R, my = S.mouthY * R, mw = S.mouthW * R, o = e.open || 0, m = e.mouth || 'flat';
  ctx.save(); ctx.lineWidth = S.lw * 0.9; ctx.strokeStyle = ink; ctx.lineCap = 'round';
  const dark = '#5b1f22';
  if (o > 0.08 || m === 'o' || m === 'wide' || m === 'small') {
    const oo = Math.max(o, { o: 0.6, wide: 0.9, small: 0.3 }[m] || 0), round = m === 'o';
    ctx.beginPath(); ctx.ellipse(mx, my + oo * R * 0.06, round ? mw * 0.3 : mw * (0.45 + oo * 0.15), R * (0.04 + oo * 0.16), 0, 0, 7); ctx.fillStyle = dark; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(mx - mw, my - R * 0.25, mw * 2, R * 0.08 + R * 0.12); ctx.fillStyle = '#d9686a'; ctx.beginPath(); ctx.ellipse(mx, my + R * (0.12 + oo * 0.1), mw * 0.3, R * 0.06, 0, 0, 7); ctx.fill(); ctx.restore();
  } else if (m === 'grin' || m === 'teeth') {
    ctx.beginPath(); ctx.moveTo(mx - mw * 0.75, my - R * 0.06); ctx.quadraticCurveTo(mx, my + R * 0.32, mx + mw * 0.6, my - R * 0.1); ctx.quadraticCurveTo(mx, my + R * 0.08, mx - mw * 0.75, my - R * 0.06); ctx.fillStyle = '#fbfaf2'; ctx.fill(); ctx.stroke();
    ctx.lineWidth = S.lw * 0.45; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(mx + i * mw * 0.22, my); ctx.lineTo(mx + i * mw * 0.22, my + R * 0.14 - Math.abs(i) * R * 0.03); ctx.stroke(); }
  } else if (m === 'smile') { ctx.beginPath(); ctx.moveTo(mx - mw * 0.5, my - R * 0.03); ctx.quadraticCurveTo(mx, my + R * 0.14, mx + mw * 0.45, my - R * 0.06); ctx.stroke(); }
  else if (m === 'smirk') { ctx.beginPath(); ctx.moveTo(mx - mw * 0.45, my + R * 0.02); ctx.quadraticCurveTo(mx + mw * 0.1, my + R * 0.04, mx + mw * 0.45, my - R * 0.1); ctx.stroke(); }
  else if (m === 'frown') { ctx.beginPath(); ctx.moveTo(mx - mw * 0.45, my + R * 0.06); ctx.quadraticCurveTo(mx, my - R * 0.06, mx + mw * 0.45, my + R * 0.06); ctx.stroke(); }
  else if (m === 'closed') { ctx.beginPath(); ctx.moveTo(mx - mw * 0.35, my); ctx.lineTo(mx + mw * 0.3, my - R * 0.01); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(mx - mw * 0.42, my + R * 0.01); ctx.lineTo(mx + mw * 0.42, my); ctx.stroke(); }
  if (D && !C.bald && (m === 'flat' || m === 'closed' || m === 'frown') && o < 0.08) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(mx - mw * 0.2, my); ctx.lineTo(mx + mw * 0.05, my); ctx.lineTo(mx - mw * 0.07, my + R * 0.07); ctx.fill(); ctx.lineWidth = S.lw * 0.5; ctx.stroke(); }
  ctx.restore();
  if (e.sweat) for (const [sx, sy, sc] of [[R * 0.32, -R * 0.42, 1], [R * 0.5, -R * 0.12, 0.7]]) { ctx.save(); ctx.translate(sx, sy + (e.t ? (e.t * 60) % 20 : 0)); ctx.scale(sc, sc); ctx.beginPath(); ctx.moveTo(0, -R * 0.16); ctx.quadraticCurveTo(R * 0.09, R * 0.02, 0, R * 0.06); ctx.quadraticCurveTo(-R * 0.09, R * 0.02, 0, -R * 0.16); ctx.fillStyle = '#9fd6ff'; ctx.fill(); ctx.lineWidth = S.lw * 0.5; ctx.strokeStyle = ink; ctx.stroke(); ctx.restore(); }
}
function head(ctx, S, C, at, tilt, e) {
  const R = S.headR, D = S.name === 'D';
  ctx.save(); ctx.translate(...at); ctx.rotate(tilt);
  // ear
  paint(ctx, S, c => c.ellipse(R * 0.42, R * 0.06, R * 0.13, R * 0.2, 0, 0, 7), C.skin);
  // skull + jaw (3/4 left)
  const skull = c => { c.moveTo(-R * 0.86, -R * 0.1); c.quadraticCurveTo(-R * 0.92, -R * 1.02, R * 0.02, -R * 1.0); c.quadraticCurveTo(R * 0.9, -R * 0.98, R * 0.86, -R * 0.06);
    c.quadraticCurveTo(R * 0.84, R * (D ? 0.7 : 0.62), R * 0.18, R * (D ? 0.86 : 0.9)); c.quadraticCurveTo(-R * 0.42, R * (D ? 0.98 : 1.0), -R * 0.66, R * 0.6); c.quadraticCurveTo(-R * 0.84, R * 0.3, -R * 0.86, -R * 0.1); c.closePath(); };
  paint(ctx, S, skull, C.skin);
  if (C.stain) { ctx.save(); ctx.beginPath(); skull(ctx); ctx.clip(); ctx.fillStyle = 'rgba(70,80,50,0.35)'; for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc(-R * 0.75 + ((i * 37) % 100) / 100 * R * 1.3, R * 0.35 + ((i * 53) % 60) / 100 * R, 1.8, 0, 7); ctx.fill(); } ctx.restore(); }
  // hair
  if (C.bald) { ctx.save(); ctx.strokeStyle = C.hair; ctx.lineWidth = D ? 6 : 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(R * 0.7, -R * (0.55 - i * 0.12)); ctx.quadraticCurveTo(R * 0.05, -R * (1.25 - i * 0.12), -R * 0.62, -R * (0.62 - i * 0.1)); ctx.stroke(); } ctx.restore(); }
  else {
    paint(ctx, S, c => { c.moveTo(-R * 0.92, -R * 0.22); c.quadraticCurveTo(-R * 1.02, -R * 1.18, R * 0.08, -R * 1.16); c.quadraticCurveTo(R * 1.06, -R * 1.12, R * 0.96, -R * 0.1); c.lineTo(R * 0.7, R * 0.04); c.lineTo(R * 0.62, -R * 0.4);
      c.quadraticCurveTo(R * 0.2, -R * 0.62, -R * 0.2, -R * 0.56); c.lineTo(-R * 0.34, -R * 0.74); c.lineTo(-R * 0.5, -R * 0.5); c.lineTo(-R * 0.7, -R * 0.62); c.closePath(); }, C.hair, { k: 0.7 });
    paint(ctx, S, c => { c.moveTo(-R * 0.1, -R * 1.08); c.lineTo(R * 0.06, -R * 1.42); c.lineTo(R * 0.26, -R * 1.06); c.moveTo(R * 0.36, -R * 1.04); c.lineTo(R * 0.64, -R * 1.3); c.lineTo(R * 0.66, -R * 0.94); }, C.hair, { k: 0.7 });
  }
  face(ctx, S, C, R, e);
  ctx.restore();
}

// ---- full character ----------------------------------------------------------------------------
// hooks: { behind(ctx) - between far arm and body, hold(ctx) - prop in hands (after far hand, before near arm) }
function drawChar(ctx, S, C, J, e, o = {}) {
  const k = S.limbW, legW = (S.name === 'D' ? 26 : 22) * k, armW = (S.name === 'D' ? 20 : 17) * k;
  const shadowK = 0.82;
  // contact shadow on the floor
  ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse((J.fN[0] + J.fF[0]) / 2, Math.max(J.fN[1], J.fF[1]) + S.ankle + 6, 80, 12, 0, 0, 7); ctx.fill(); ctx.restore();
  // far leg + far arm (darker)
  const armCol = C.arm === 'skin' ? C.skin : C.top;
  const far = Object.assign({}, C, { pants: shade(C.pants, shadowK), top: shade(C.top, shadowK), skin: shade(C.skin, 0.9), shoe: shade(C.shoe, 0.88), armCol: shade(armCol, shadowK) });
  limb(ctx, S, [J.hip[0] + 8, J.hip[1]], J.kF, J.fF, legW * 1.2, legW, legW * 0.8, far.pants); shoe(ctx, S, far, J.fF);
  if (o.underFar) o.underFar(ctx);
  if (!o.farFront) { limb(ctx, S, J.shF, J.eF, J.wF, armW * 1.1, armW, armW * 0.85, far.armCol); hand(ctx, S, far, J.eF, J.wF, o.farHand || 'fist', o.t); }
  if (o.behind) o.behind(ctx);
  // near leg
  limb(ctx, S, [J.hip[0] - 8, J.hip[1]], J.kN, J.fN, legW * 1.2, legW, legW * 0.8, C.pants); shoe(ctx, S, C, J.fN);
  // torso in its own frame
  const tl = Math.hypot(J.neck[0] - J.hip[0], J.neck[1] - J.hip[1]), ang = Math.atan2(J.neck[1] - J.hip[1], J.neck[0] - J.hip[0]) + Math.PI / 2;
  ctx.save(); ctx.translate(...J.hip); ctx.rotate(ang);
  const B = (C.belly ? 1.25 : 1), T = tl, sw = (S.shW + 18) * (C.wide || 1);
  const torso = c => { c.moveTo(-sw * 1.25, -T + 8); c.quadraticCurveTo(0, -T - 22, sw * 1.25, -T + 4); c.quadraticCurveTo(sw * 1.5, -T * 0.55, sw * 1.15 * B, -T * 0.25); c.quadraticCurveTo(sw * 1.25 * B, 10, sw * 0.9, 16);
    c.lineTo(-sw * 0.9, 16); c.quadraticCurveTo(-sw * 1.35 * B, 6, -sw * 1.2 * B, -T * 0.3); c.quadraticCurveTo(-sw * 1.45, -T * 0.6, -sw * 1.25, -T + 8); c.closePath(); };
  paint(ctx, S, torso, C.top);
  ctx.save(); ctx.beginPath(); torso(ctx); ctx.clip();
  if (C.hood) { ctx.fillStyle = C.top2; ctx.fillRect(-sw * 2, -4, sw * 4, 30); line(ctx, [[-sw * 0.5, -T + 14], [-sw * 0.6, -T * 0.62]], 4, '#f4efe4'); line(ctx, [[-sw * 0.15, -T + 12], [-sw * 0.2, -T * 0.64]], 4, '#f4efe4');
    ctx.beginPath(); ctx.roundRect(-sw * 1.05, -T * 0.38, sw * 1.6, T * 0.26, 10); ctx.lineWidth = S.lw * 0.6; ctx.strokeStyle = S.ink; ctx.stroke(); }
  if (C.stain) { ctx.fillStyle = 'rgba(140,60,40,0.4)'; ctx.beginPath(); ctx.ellipse(-sw * 0.3, -T * 0.42, 22, 14, 0.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(sw * 0.2, -T * 0.18, 12, 9, 0, 0, 7); ctx.fill(); }
  ctx.restore();
  if (C.hood) paint(ctx, S, c => { c.moveTo(-sw * 0.2, -T - 6); c.quadraticCurveTo(sw * 0.9, -T - 46, sw * 1.35, -T + 6); c.quadraticCurveTo(sw * 0.9, -T + 18, sw * 0.3, -T + 6); c.closePath(); }, C.top2);
  ctx.restore();
  // neck + head
  paint(ctx, S, c => cap(c, J.neck, add(J.neck, rot([0, -S.neck - 10], -J.ht)), 12 * k + (S.name === 'D' ? 2 : 0), 12 * k), C.skin);
  head(ctx, S, C, J.head, -J.ht + (o.headRot || 0), Object.assign({ t: o.t }, e));
  if (o.farFront) { limb(ctx, S, J.shF, J.eF, J.wF, armW * 1.1, armW, armW * 0.85, far.armCol); }
  if (o.hold) o.hold(ctx, 'mid');
  if (o.farFront) hand(ctx, S, far, J.eF, J.wF, o.farHand || 'fist', o.t);
  limb(ctx, S, J.shN, J.eN, J.wN, armW * 1.1, armW, armW * 0.85, armCol);
  if (o.holdNear) o.holdNear(ctx);
  hand(ctx, S, C, J.eN, J.wN, o.nearHand || 'fist', o.t);
  if (o.front) o.front(ctx);
}

// solve with hand grips: the fist (not the wrist) lands on the grip point
function solveGrip(S, pose, grips = {}, tag) {
  const J0 = solve(S, Object.assign({}, pose, { near: null, far: null }));
  const r = (S.name === 'D' ? 22 : 18) * S.limbW * 0.75, P = Object.assign({}, pose);
  for (const [k, sh] of [['near', J0.shN], ['far', J0.shF]]) if (grips[k]) { const g = grips[k], d = sub(g, sh), l = len(d) || 1; P[k] = [g[0] - d[0] / l * r, g[1] - d[1] / l * r]; }
  return solve(S, P, tag);
}
module.exports = { solveGrip, SKINS, CAST, solve, drawChar, paint, cap, line, shade, lerp, clamp, add, sub, rot, len, QA };
