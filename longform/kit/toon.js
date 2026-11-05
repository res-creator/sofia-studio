// How It's Run LONG-FORM characters: chunky "3-heads-tall" cartoon people with big expressive eyes, coloured clothes and a bold ink outline.
// Origin = between the feet on the ground. Size: s = 1 -> ~310 px tall. Front-facing body; the head turns with `look`.
//   toon(ctx, x, y, s, LOOK, POSE, EXPR, o)
//   LOOK: { skin, hair:{style,col}, beard, beardCol, stache, glasses, hat, hatCol, top, top2, tie, bow, apron, pants, shoes, build }
//   POSE: preset name ('stand','wave','point','cheer','shrug','hold','think','facepalm','shock','walk','run','sit','carry','pour','drink','arms','fist','present')
//         or an object { la:[sh,el], ra:[sh,el], ll:[hip,knee], rl:[hip,knee], lean, bob, sit } (angles in rad, 0 = straight down, + = outwards)
//   EXPR: preset ('neutral','happy','grin','laugh','shock','angry','sad','worried','smug','think','sleepy','wink','determined','disgust') or object
//   o: { t (time, for blink/walk), ph (walk phase), look:[dx,dy], itemL/itemR: (ctx)=>{} drawn in the hand, flip, talk (0..1 mouth flap) }
const L = require('./look');
const { INK, ink, rr, ell, poly, darken, lighten, clamp, lerp, E } = L;
const HAIR = { dark: '#2B1E16', brown: '#5A3A22', gray: '#A9A49C', white: '#E9E6E0', blond: '#D9B25A', red: '#A4462A', black: '#151313' };
const PRESET_POSE = {
  stand: { la: [0.18, 0.1], ra: [0.18, 0.1] },
  wave: { la: [0.18, 0.1], ra: [2.6, 0.5] },
  point: { la: [0.15, 0.1], ra: [1.45, 0.05] },
  cheer: { la: [2.6, 0.3], ra: [2.6, 0.3] },
  shrug: { la: [0.9, -1.9], ra: [0.9, -1.9] },
  hold: { la: [0.75, -0.9], ra: [0.75, -0.9] },
  present: { la: [0.2, 0.1], ra: [1.2, -0.5] },
  think: { la: [0.5, -1.4], ra: [0.55, -2.35] },
  facepalm: { la: [0.2, 0.1], ra: [0.7, -2.6] },
  shock: { la: [1.9, 1.2], ra: [1.9, 1.2] },
  arms: { la: [0.5, -2.0], ra: [0.5, -2.0] },
  fist: { la: [0.18, 0.1], ra: [2.4, -1.4] },
  carry: { la: [1.2, -0.6], ra: [1.2, -0.6] },
  pour: { la: [0.7, -0.8], ra: [1.6, -0.3] },
  drink: { la: [0.18, 0.1], ra: [0.8, -2.5] },
  sit: { la: [0.5, -0.8], ra: [0.5, -0.8], ll: [1.45, -1.45], rl: [1.45, -1.45], sit: 1 },
};
const PRESET_EXPR = {
  neutral: { eyes: 'open', brows: 'flat', mouth: 'smile' },
  happy: { eyes: 'open', brows: 'up', mouth: 'grin' },
  grin: { eyes: 'happy', brows: 'up', mouth: 'teeth' },
  laugh: { eyes: 'happy', brows: 'up', mouth: 'open', blush: 1 },
  shock: { eyes: 'wide', brows: 'high', mouth: 'o' },
  angry: { eyes: 'open', brows: 'angry', mouth: 'teethFrown', red: 1 },
  sad: { eyes: 'open', brows: 'sad', mouth: 'frown' },
  worried: { eyes: 'open', brows: 'sad', mouth: 'wavy', sweat: 1 },
  smug: { eyes: 'half', brows: 'raised1', mouth: 'smirk' },
  think: { eyes: 'open', brows: 'raised1', mouth: 'flat', look: [0.5, -0.7] },
  sleepy: { eyes: 'half', brows: 'flat', mouth: 'flat' },
  wink: { eyes: 'wink', brows: 'up', mouth: 'grin' },
  determined: { eyes: 'open', brows: 'angry', mouth: 'flat' },
  disgust: { eyes: 'half', brows: 'angry', mouth: 'wavy' },
};
function limb(ctx, x, y, a1, a2, l1, l2, w, col, end) { // two-segment limb, rounded; returns tip
  const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a1 + a2) * l2, y2 = y1 + Math.cos(a1 + a2) * l2;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = w + 9; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  return [x2, y2, a1 + a2]; }
function toon(ctx, x, y, s, LOOK = {}, POSE = 'stand', EXPR = 'neutral', o = {}) {
  const P = typeof POSE === 'string' ? (PRESET_POSE[POSE] || (POSE === 'walk' || POSE === 'run' ? {} : PRESET_POSE.stand)) : POSE;
  const X = typeof EXPR === 'string' ? (PRESET_EXPR[EXPR] || PRESET_EXPR.neutral) : EXPR;
  const t = o.t || 0, build = LOOK.build || 'avg', bw = build === 'round' ? 1.25 : build === 'thin' ? 0.86 : 1;
  const skin = LOOK.skin || L.SKIN[0], top = LOOK.top || '#3D6FA8', pants = LOOK.pants || '#3A3A48', shoes = LOOK.shoes || '#2A1E18';
  let la = P.la || [0.18, 0.1], ra = P.ra || [0.18, 0.1], ll = P.ll || [0.06, 0], rl = P.rl || [0.06, 0], bob = P.bob || 0, lean = P.lean || 0;
  if (POSE === 'walk' || POSE === 'run') { const run = POSE === 'run', ph = (o.ph ?? t * (run ? 9 : 6)), A = run ? 0.5 : 0.28;
    ll = [Math.sin(ph) * A, Math.max(0, -Math.cos(ph)) * (run ? -1.1 : -0.5)]; rl = [-Math.sin(ph) * A, Math.max(0, Math.cos(ph)) * (run ? -1.1 : -0.5)];
    la = [-Math.sin(ph) * A * 0.9 + 0.15, run ? -1.2 : -0.3]; ra = [Math.sin(ph) * A * 0.9 + 0.15, run ? -1.2 : -0.3]; bob = Math.abs(Math.cos(ph)) * (run ? 10 : 5); lean = run ? 0.12 : 0.03; }
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  if (!o.noShadow) { ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#000'; ell(ctx, 0, 0, 70 * bw, 11); ctx.fill(); ctx.restore(); }
  const sit = P.sit ? 1 : 0, legL = 92, hipY = -legL + sit * 40 - bob;
  ctx.translate(0, 0); ctx.rotate(lean);
  // legs (thighs bend forward when sitting)
  const lw = 26 * bw, hipX = 20 * bw;
  const legTip = (side, a) => { const [lx, ly] = limb(ctx, side * hipX, hipY, side * a[0] * (sit ? 0 : 1) + (sit ? -a[0] * 0 : 0), a[1] * side, 48, 46, lw, pants);
    return [lx, ly]; };
  const footAt = (fx, fy, side) => { ctx.save(); ctx.translate(fx, fy); ell(ctx, side * 8, 2, 22, 12); ink(ctx, shoes, 5); ctx.restore(); };
  if (sit) { // seated: thighs horizontal toward camera-ish, shins down
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(side * hipX, hipY); ctx.lineTo(side * hipX * 1.2, hipY + 16); ctx.lineTo(side * hipX * 1.25, -4);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = lw + 9; ctx.stroke(); ctx.strokeStyle = pants; ctx.lineWidth = lw; ctx.stroke(); footAt(side * hipX * 1.25, -4, side); }
  } else { const [a, b] = legTip(-1, ll), [c, d] = legTip(1, rl); footAt(a, b, -1); footAt(c, d, 1); }
  // torso (rounded trapezoid), shoulders at sy
  const tw = 52 * bw, th = 96, ty = hipY + 6, sy = ty - th + 14;
  const torso = () => { ctx.beginPath(); ctx.moveTo(-tw * 0.82, ty); ctx.bezierCurveTo(-tw * 1.08, ty - th * 0.4, -tw * 0.98, ty - th, -tw * 0.6, ty - th); ctx.lineTo(tw * 0.6, ty - th); ctx.bezierCurveTo(tw * 0.98, ty - th, tw * 1.08, ty - th * 0.4, tw * 0.82, ty); ctx.closePath(); };
  // back arm first when holding something across the body? keep both arms after torso; draw left arm behind torso for depth
  const armW = 22 * bw, shX = tw * 0.78;
  const hand = (hx, hy, ang, item) => { if (item) { ctx.save(); ctx.translate(hx, hy); ctx.rotate(-ang + Math.PI / 2 * 0); item(ctx, ang); ctx.restore(); } ctx.beginPath(); ctx.arc(hx, hy, 14 * bw, 0, 6.27); ink(ctx, skin, 5); };
  const sleeve = LOOK.sleeve || top;
  const [lhx, lhy, lha] = limb(ctx, -shX, sy + 8, -la[0], -la[1], 46, 42, armW, sleeve);
  torso(); ink(ctx, top, 6); L.shade(ctx, torso, 1, 0.13);
  if (LOOK.top2) { ctx.save(); torso(); ctx.clip(); ctx.beginPath(); ctx.moveTo(-tw * 0.38, ty - th); ctx.lineTo(0, ty - th * 0.25); ctx.lineTo(tw * 0.38, ty - th); ctx.closePath(); ink(ctx, LOOK.top2, 4); ctx.restore(); } // shirt V under a jacket
  if (LOOK.apron) { ctx.save(); torso(); ctx.clip(); rr(ctx, -tw * 0.62, ty - th * 0.72, tw * 1.24, th * 0.9, 10); ink(ctx, LOOK.apron, 4); ctx.restore(); }
  if (LOOK.tie) { poly(ctx, [[-7, ty - th + 6], [7, ty - th + 6], [10, ty - th * 0.35], [0, ty - th * 0.25], [-10, ty - th * 0.35]]); ink(ctx, LOOK.tie, 4); }
  if (LOOK.bow) { poly(ctx, [[0, ty - th + 10], [-18, ty - th + 1], [-18, ty - th + 19]]); ink(ctx, LOOK.bow, 4); poly(ctx, [[0, ty - th + 10], [18, ty - th + 1], [18, ty - th + 19]]); ink(ctx, LOOK.bow, 4); }
  if (LOOK.buttons) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, ty - th * 0.62 + i * 22, 3.5, 0, 6.27); ctx.fillStyle = INK; ctx.fill(); }
  if (LOOK.badge) { ctx.beginPath(); ctx.arc(-tw * 0.42, ty - th * 0.62, 9, 0, 6.27); ink(ctx, LOOK.badge, 3); }
  hand(lhx, lhy, lha, o.itemL);
  // head
  const hy = sy - 6, HW = 62, HH = 66, look = X.look || o.look || [0, 0];
  ctx.save(); ctx.translate(0, hy - HH + 4); ctx.rotate((P.tilt || 0) + (o.tilt || 0));
  // neck
  rr(ctx, -12, HH - 14, 24, 22, 8); ink(ctx, skin, 5);
  const headShape = () => { ctx.beginPath(); ctx.moveTo(-HW, -HH * 0.15); ctx.bezierCurveTo(-HW, -HH * 1.02, HW, -HH * 1.02, HW, -HH * 0.15); ctx.bezierCurveTo(HW * 1.02, HH * 0.75, -HW * 1.02, HH * 0.75, -HW, -HH * 0.15); ctx.closePath(); };
  // back hair (long) behind head
  const hair = LOOK.hair || { style: 'short', col: HAIR.brown }, hc = hair.col || HAIR.brown;
  if (hair.style === 'long') { for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * HW * 0.6, -HH * 0.8); ctx.bezierCurveTo(sx * HW * 1.3, -HH * 0.7, sx * HW * 1.35, HH * 0.5, sx * HW * 1.15, HH * 1.05); ctx.lineTo(sx * HW * 0.72, HH * 0.95); ctx.bezierCurveTo(sx * HW * 0.9, HH * 0.3, sx * HW * 0.8, -HH * 0.3, sx * HW * 0.3, -HH * 0.6); ctx.closePath(); ink(ctx, hc, 5); } }
  // ears
  for (const sx of [-1, 1]) { ell(ctx, sx * HW * 0.98, HH * 0.02, 11, 15); ink(ctx, skin, 5); }
  headShape(); ink(ctx, skin, 6);
  L.shade(ctx, headShape, 1, 0.1);
  ctx.save(); headShape(); ctx.clip(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#FFF'; ell(ctx, -HW * 0.4, -HH * 0.55, HW * 0.35, HH * 0.18, -0.4); ctx.fill(); ctx.restore();
  if (X.red) { ctx.save(); headShape(); ctx.clip(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#E8322E'; ctx.fillRect(-HW, -HH, 2 * HW, HH * 0.9); ctx.restore(); }
  // front hair
  if (hair.style === 'short' || hair.style === 'side' || hair.style === 'long' || hair.style === 'bun' || hair.style === 'curly') { ctx.save(); headShape(); ctx.clip();
    ctx.beginPath(); if (hair.style === 'side') { ctx.moveTo(-HW * 1.1, -HH * 0.25); ctx.bezierCurveTo(-HW * 0.8, -HH * 0.75, HW * 0.2, -HH * 0.55, HW * 1.1, -HH * 0.45); ctx.lineTo(HW * 1.1, -HH * 1.1); ctx.lineTo(-HW * 1.1, -HH * 1.1); }
    else if (hair.style === 'curly') { ctx.moveTo(-HW * 1.1, -HH * 0.2); for (let i = 0; i <= 8; i++) { const xx = -HW + i * HW / 4; ctx.quadraticCurveTo(xx - HW / 8, -HH * 0.32 - (i % 2) * 14, xx, -HH * 0.42); } ctx.lineTo(HW * 1.1, -HH * 1.1); ctx.lineTo(-HW * 1.1, -HH * 1.1); }
    else { ctx.moveTo(-HW * 1.1, -HH * 0.2); ctx.bezierCurveTo(-HW * 0.6, -HH * 0.5, HW * 0.6, -HH * 0.5, HW * 1.1, -HH * 0.2); ctx.lineTo(HW * 1.1, -HH * 1.1); ctx.lineTo(-HW * 1.1, -HH * 1.1); }
    ctx.closePath(); ctx.fillStyle = hc; ctx.fill(); ctx.restore(); headShape(); ink(ctx, null, 6); if (hair.style === 'bun') { ctx.beginPath(); ctx.arc(0, -HH * 0.98, 20, 0, 6.27); ink(ctx, hc, 5); } }
  if (hair.style === 'bald' || hair.style === 'fringe') { for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * HW * 1.01, -HH * 0.05); ctx.bezierCurveTo(sx * HW * 1.08, -HH * 0.35, sx * HW * 0.85, -HH * 0.55, sx * HW * 0.6, -HH * 0.6); ctx.lineTo(sx * HW * 0.72, -HH * 0.2); ctx.closePath(); ink(ctx, hc, 4); } }
  // eyes
  const ex = HW * 0.4, ey = -HH * 0.14, er = 18, blink = o.blink !== false && ((t * 0.37 + (o.seed || 0)) % 3.1 < 0.12);
  const eyes = blink && X.eyes !== 'happy' ? 'closed' : X.eyes;
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * ex, ey);
    if (eyes === 'closed' || (eyes === 'wink' && sx > 0)) { ctx.beginPath(); ctx.moveTo(-er, 2); ctx.quadraticCurveTo(0, 9, er, 2); ink(ctx, null, 5); }
    else if (eyes === 'happy') { ctx.beginPath(); ctx.moveTo(-er, 5); ctx.quadraticCurveTo(0, -12, er, 5); ink(ctx, null, 6); }
    else { const rY = eyes === 'wide' ? er * 1.35 : er * 1.12, rX = eyes === 'wide' ? er * 1.15 : er * 0.92; ell(ctx, 0, 0, rX, rY); ink(ctx, '#FFFFFF', 4.5);
      const pr = eyes === 'wide' ? 5.5 : 7.5; ctx.beginPath(); ctx.arc(look[0] * rX * 0.45, look[1] * rY * 0.45 + 2, pr, 0, 6.27); ctx.fillStyle = INK; ctx.fill();
      ctx.beginPath(); ctx.arc(look[0] * rX * 0.45 - 2.5, look[1] * rY * 0.45 - 1, 2.2, 0, 6.27); ctx.fillStyle = '#FFF'; ctx.fill();
      if (eyes === 'half') { ctx.save(); ell(ctx, 0, 0, rX, rY); ctx.clip(); ctx.fillStyle = skin; ctx.fillRect(-rX - 2, -rY - 2, 2 * rX + 4, rY + 2); ctx.restore(); ctx.beginPath(); ctx.moveTo(-rX, 0); ctx.lineTo(rX, 0); ink(ctx, null, 5); ell(ctx, 0, 0, rX, rY); ink(ctx, null, 4.5); } }
    // brows
    const b = X.brows; ctx.beginPath(); const by = -er * 1.75 - (b === 'high' ? 9 : b === 'up' ? 4 : 0);
    if (b === 'angry') { ctx.moveTo(-sx * er * 1.1, by - 6); ctx.lineTo(sx * er * 0.9, by + 6); }
    else if (b === 'sad') { ctx.moveTo(-sx * er * 1.1, by + 5); ctx.lineTo(sx * er * 0.9, by - 5); }
    else if (b === 'raised1' && sx > 0) { ctx.moveTo(-er, by - 8); ctx.quadraticCurveTo(0, by - 16, er, by - 6); }
    else { ctx.moveTo(-er, by); ctx.quadraticCurveTo(0, by - 6, er, by); }
    ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = LOOK.browCol || darken(hc === HAIR.white ? '#8A8A8A' : hc, 0.8); ctx.stroke();
    ctx.restore(); }
  if (LOOK.glasses) { ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = INK; for (const sx of [-1, 1]) { ell(ctx, sx * ex, ey, er * 1.25, er * 1.25); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-ex + er * 1.25, ey); ctx.lineTo(ex - er * 1.25, ey); ctx.stroke(); ctx.restore(); }
  // nose
  ctx.beginPath(); ctx.moveTo(look[0] * 4 - 2, HH * 0.04); ctx.quadraticCurveTo(look[0] * 4 + 9, HH * 0.14, look[0] * 4 - 3, HH * 0.2); ctx.lineWidth = 4; ctx.strokeStyle = darken(skin, 0.6); ctx.stroke();
  // beard / moustache (under mouth)
  const bc = LOOK.beardCol || hc;
  if (LOOK.beard === 'full') { ctx.beginPath(); ctx.moveTo(-HW * 0.99, -HH * 0.05); ctx.bezierCurveTo(-HW * 1.0, HH * 0.75, -HW * 0.45, HH * 1.2, 0, HH * 1.22); ctx.bezierCurveTo(HW * 0.45, HH * 1.2, HW * 1.0, HH * 0.75, HW * 0.99, -HH * 0.05);
    ctx.bezierCurveTo(HW * 0.75, HH * 0.3, HW * 0.35, HH * 0.22, 0, HH * 0.24); ctx.bezierCurveTo(-HW * 0.35, HH * 0.22, -HW * 0.75, HH * 0.3, -HW * 0.99, -HH * 0.05); ctx.closePath(); ink(ctx, bc, 5);
    ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = darken(bc, 0.6); ctx.lineWidth = 3; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * HW * 0.2, HH * 0.55); ctx.quadraticCurveTo(i * HW * 0.22, HH * 0.8, i * HW * 0.14, HH * 1.0); ctx.stroke(); } ctx.restore(); }
  if (LOOK.beard === 'goatee') { ell(ctx, 0, HH * 0.52, 16, 14); ink(ctx, bc, 4); }
  // mouth
  const my = HH * 0.36 + (LOOK.beard === 'full' ? 4 : 0), talk = o.talk ? Math.abs(Math.sin(t * 17)) * o.talk : 0; let M = X.mouth; if (talk > 0.35 && (M === 'smile' || M === 'flat')) M = 'open';
  ctx.save(); ctx.translate(0, my);
  const mfill = c => ink(ctx, c, 4.5);
  if (M === 'smile') { ctx.beginPath(); ctx.moveTo(-15, -3); ctx.quadraticCurveTo(0, 10, 15, -3); ink(ctx, null, 5); }
  else if (M === 'grin') { ctx.beginPath(); ctx.moveTo(-20, -5); ctx.quadraticCurveTo(0, 20, 20, -5); ctx.closePath(); mfill('#7A2626'); }
  else if (M === 'teeth') { ctx.beginPath(); ctx.moveTo(-22, -6); ctx.quadraticCurveTo(0, 22, 22, -6); ctx.closePath(); mfill('#FFFFFF'); ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(18, 2); ink(ctx, null, 3); }
  else if (M === 'open') { ell(ctx, 0, 2, 13, 11 + talk * 4); mfill('#7A2626'); }
  else if (M === 'o') { ell(ctx, 0, 4, 10, 14); mfill('#5A1A1A'); }
  else if (M === 'frown') { ctx.beginPath(); ctx.moveTo(-14, 6); ctx.quadraticCurveTo(0, -6, 14, 6); ink(ctx, null, 5); }
  else if (M === 'teethFrown') { rr(ctx, -18, -6, 36, 14, 5); mfill('#FFFFFF'); ctx.beginPath(); ctx.moveTo(-18, 1); ctx.lineTo(18, 1); ink(ctx, null, 3); }
  else if (M === 'wavy') { ctx.beginPath(); ctx.moveTo(-16, 2); ctx.bezierCurveTo(-8, -6, -4, 8, 0, 2); ctx.bezierCurveTo(4, -6, 8, 8, 16, 2); ink(ctx, null, 4.5); }
  else if (M === 'smirk') { ctx.beginPath(); ctx.moveTo(-12, 3); ctx.quadraticCurveTo(6, 8, 16, -6); ink(ctx, null, 5); }
  else { ctx.beginPath(); ctx.moveTo(-12, 2); ctx.lineTo(12, 2); ink(ctx, null, 5); }
  ctx.restore();
  if (LOOK.stache || LOOK.beard === 'full') { ctx.beginPath(); ctx.moveTo(0, HH * 0.24); ctx.bezierCurveTo(-14, HH * 0.15, -34, HH * 0.22, -36, HH * 0.36); ctx.bezierCurveTo(-24, HH * 0.32, -10, HH * 0.34, 0, HH * 0.3); ctx.bezierCurveTo(10, HH * 0.34, 24, HH * 0.32, 36, HH * 0.36); ctx.bezierCurveTo(34, HH * 0.22, 14, HH * 0.15, 0, HH * 0.24); ctx.closePath(); ink(ctx, LOOK.stacheCol || bc, 4); }
  if (X.blush) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#E8607A'; for (const sx of [-1, 1]) { ell(ctx, sx * HW * 0.62, HH * 0.18, 12, 7); ctx.fill(); } ctx.restore(); }
  if (X.sweat) { ctx.save(); ctx.translate(HW * 0.95, -HH * 0.55); ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(10, 4, 0, 8); ctx.quadraticCurveTo(-10, 4, 0, -14); ink(ctx, '#9AD7FF', 3.5); ctx.restore(); }
  // hats
  const hat = LOOK.hat, hcol = LOOK.hatCol || INK;
  if (hat === 'bowler') { ell(ctx, 0, -HH * 0.78, HW * 1.15, 12); ink(ctx, hcol, 5); ctx.beginPath(); ctx.moveTo(-HW * 0.72, -HH * 0.78); ctx.bezierCurveTo(-HW * 0.75, -HH * 1.55, HW * 0.75, -HH * 1.55, HW * 0.72, -HH * 0.78); ctx.closePath(); ink(ctx, hcol, 5); }
  if (hat === 'top') { ell(ctx, 0, -HH * 0.8, HW * 1.15, 12); ink(ctx, hcol, 5); rr(ctx, -HW * 0.62, -HH * 1.85, HW * 1.24, HH * 1.08, 6); ink(ctx, hcol, 5); rr(ctx, -HW * 0.62, -HH * 1.0, HW * 1.24, 12, 2); ink(ctx, LOOK.band || RED_BAND, 3); }
  if (hat === 'boater') { ell(ctx, 0, -HH * 0.8, HW * 1.3, 13); ink(ctx, hcol, 5); rr(ctx, -HW * 0.7, -HH * 1.22, HW * 1.4, HH * 0.44, 6); ink(ctx, hcol, 5); rr(ctx, -HW * 0.7, -HH * 0.96, HW * 1.4, 11, 2); ink(ctx, LOOK.band || RED_BAND, 3); }
  if (hat === 'cap' || hat === 'army' || hat === 'soda') { ctx.beginPath(); ctx.moveTo(-HW * 0.95, -HH * 0.55); ctx.bezierCurveTo(-HW * 0.9, -HH * 1.25, HW * 0.9, -HH * 1.25, HW * 0.95, -HH * 0.55); ctx.closePath(); ink(ctx, hcol, 5);
    if (hat !== 'soda') { ctx.beginPath(); ctx.moveTo(-HW * 0.2, -HH * 0.58); ctx.quadraticCurveTo(HW * 0.9, -HH * 0.62, HW * 1.35, -HH * 0.42); ctx.lineTo(HW * 0.9, -HH * 0.52); ctx.closePath(); ink(ctx, darken(hcol, 0.8), 5); }
    else { rr(ctx, -HW * 0.95, -HH * 0.66, HW * 1.9, 14, 4); ink(ctx, '#FFFFFF', 4); } }
  if (hat === 'helmet') { ctx.beginPath(); ctx.moveTo(-HW * 1.15, -HH * 0.45); ctx.bezierCurveTo(-HW * 1.1, -HH * 1.4, HW * 1.1, -HH * 1.4, HW * 1.15, -HH * 0.45); ctx.closePath(); ink(ctx, hcol, 5); }
  if (hat === 'santa') { ctx.beginPath(); ctx.moveTo(-HW * 0.95, -HH * 0.6); ctx.bezierCurveTo(-HW * 0.6, -HH * 1.6, HW * 0.8, -HH * 1.7, HW * 1.4, -HH * 1.0); ctx.lineTo(HW * 0.95, -HH * 0.6); ctx.closePath(); ink(ctx, '#D93A35', 5); rr(ctx, -HW * 1.05, -HH * 0.72, HW * 2.1, 22, 11); ink(ctx, '#FFFFFF', 5); ctx.beginPath(); ctx.arc(HW * 1.45, -HH * 0.95, 13, 0, 6.27); ink(ctx, '#FFFFFF', 4); }
  ctx.restore();
  // front arm
  const [rhx, rhy, rha] = limb(ctx, shX, sy + 8, ra[0], ra[1], 46, 42, armW, sleeve);
  hand(rhx, rhy, rha, o.itemR);
  ctx.restore();
  return { hand: [x + rhx * s * (o.flip ? -1 : 1), y + rhy * s] };
}
const RED_BAND = '#D93A35';
// ready-made LOOKs for reuse (historical people: features from period photos; generic people: no likeness)
const LOOKS = {
  pemberton: { skin: '#EBC09A', hair: { style: 'side', col: '#B9B4AA' }, beard: 'full', beardCol: '#C9C4BA', top: '#2E2A28', top2: '#F2EEE4', bow: '#1C1A1F', pants: '#2E2A28', build: 'thin' },
  candler: { skin: '#EFC8A4', hair: { style: 'fringe', col: '#6B5A48' }, stache: 1, stacheCol: '#5A4A3A', glasses: 'round', top: '#3A3F4A', top2: '#F4F0E6', tie: '#6A2A2A', pants: '#3A3F4A', build: 'avg' },
  robinson: { skin: '#F0CBA8', hair: { style: 'short', col: '#3A2A1E' }, stache: 1, top: '#5A4A3A', top2: '#F4F0E6', bow: '#2F6DB5', pants: '#4A3A2E' },
  pharmacist: { skin: '#E8B58A', hair: { style: 'side', col: '#2B1E16' }, stache: 1, top: '#F4F0E6', apron: '#FFFFFF', bow: '#D93A35', pants: '#3A3A48', hat: 'soda', hatCol: '#FFFFFF' },
  woodruff: { skin: '#EBC09A', hair: { style: 'fringe', col: '#4A3A2E' }, top: '#2A3140', top2: '#F4F0E6', tie: '#8A2A2A', pants: '#2A3140', build: 'round' },
  banker: { skin: '#F0CBA8', hair: { style: 'bald', col: '#8A8378' }, stache: 1, stacheCol: '#8A8378', top: '#2E2A28', top2: '#F4F0E6', tie: '#2F6DB5', pants: '#2E2A28', hat: 'top', build: 'round' },
  lawyerA: { skin: '#F2C9A0', hair: { style: 'side', col: '#3A2A1E' }, stache: 1, top: '#4A4F5C', top2: '#F4F0E6', bow: '#1C1A1F', pants: '#4A4F5C', hat: 'bowler' },
  lawyerB: { skin: '#E8B58A', hair: { style: 'short', col: '#5A3A22' }, top: '#5C4A3A', top2: '#F4F0E6', tie: '#7A2A2A', pants: '#5C4A3A', hat: 'bowler', hatCol: '#4A3A2E' },
  soldier: { skin: '#D39A6A', hair: { style: 'short', col: '#2B1E16' }, top: '#6E7650', pants: '#5E6640', hat: 'army', hatCol: '#5E6640', buttons: 1 },
  worker: { skin: '#B97A4E', hair: { style: 'short', col: '#151313' }, top: '#2F6DB5', pants: '#3A3A48', hat: 'cap', hatCol: '#D93A35' },
  exec80s: { skin: '#E8B58A', hair: { style: 'side', col: '#2B1E16' }, glasses: 'round', top: '#2A3140', top2: '#F4F0E6', tie: '#D93A35', pants: '#2A3140' },
  shopper: { skin: '#8E5A36', hair: { style: 'curly', col: '#151313' }, top: '#F7C548', pants: '#2F6DB5' },
  woman: { skin: '#F2C9A0', hair: { style: 'long', col: '#A4462A' }, top: '#2F8A6A', pants: '#2A2A38' },
  kid: { skin: '#E8B58A', hair: { style: 'short', col: '#D9B25A' }, top: '#D93A35', pants: '#2F6DB5', build: 'thin' },
};
module.exports = { toon, LOOKS, HAIR, PRESET_POSE, PRESET_EXPR };
