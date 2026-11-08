// Ivar Kreuger — code-drawn puppet after the period portraits (c. 1920 studio portrait, 1930 autochrome): long oval face, high forehead with a
// receding hairline, hair combed straight back, clean-shaven, straight nose, thin lips; dark three-piece suit, stiff white collar, dark tie.
// Two versions: st.age = 'young' (engineer, 1900s: fuller hair, shirt-sleeves + waistcoat) or 'king' (1920s: receding hair, grey temples, three-piece).
// Origin = base of the neck (centre between the shoulders). One unit ≈ 1 px at s = 1; the head is ≈ 150 tall.
// st: { age, expr: neutral|smile|serious|worried|surprised|cold, m: mouth 0–1, blink 0–1, tilt, turn (−1…1, 3/4 look), look: [x, y] eye offset,
//       pose: rest|sign|point|open|match|hand|hold|chin|count, legs: false|'stand'|'walk', walk phase, rim: 'r,g,b' backlight, prop(hand ctx) }
const P = require('./par.js'); const { fillShade, clamp, lerp } = P;
const LINE = 'rgba(27,20,16,0.55)';
const C = { skin: '#eac4a2', skinSh: '#c99878', hair: '#2e231b', hairGrey: '#7a6f66', suit: '#2b2f3c', suitDk: '#1f222c', young: '#4a4f5c', shirt: '#f5f1e8', tie: '#3b1d2a', tiePin: '#d8b45a', lips: '#a96458', eye: '#2a2320' };
const POSES = { // [shoulder swing outward, elbow bend inward (+) / outward (−)] for L and R arm, radians; 0,0 = hanging straight down
  rest: [[0.07, 0.12], [0.07, 0.12]], sign: [[0.08, 0.2], [0.42, 1.55]], point: [[0.07, 0.12], [1.75, -0.1]], open: [[0.32, -0.55], [0.32, -0.55]],
  match: [[0.28, 2.15], [0.3, 2.25]], hand: [[0.07, 0.12], [0.75, -0.25]], hold: [[0.22, 1.7], [0.22, 1.7]], chin: [[0.07, 0.15], [0.18, 2.75]], count: [[0.3, 1.85], [0.36, 1.6]] };
function arms(st, g) { const p = POSES[st.pose || 'rest']; const q = st.pose2 ? POSES[st.pose2] : p, u = st.poseMix || 0; const mix = (i, j) => lerp(p[i][j], q[i][j], u);
  let L = [mix(0, 0), mix(0, 1)], R = [mix(1, 0), mix(1, 1)]; if ((st.pose === 'sign' || st.pose2 === 'sign') && st.write) { R[1] += Math.sin(g * 14) * 0.08; R[0] += Math.sin(g * 9) * 0.05; } return { L, R }; }
function hand(ctx, s, open) { // mitten + thumb; s = +1 right, −1 left
  fillShade(ctx, c => { c.beginPath(); c.ellipse(0, 18, 17, 22, 0, 0, 7); }, C.skin, { line: LINE, y0: -10, y1: 40 });
  fillShade(ctx, c => { c.beginPath(); c.ellipse(-12 * s, 8, 6, 12, -0.5 * s, 0, 7); }, C.skin, { line: LINE });
  if (open) { ctx.strokeStyle = 'rgba(120,70,50,0.5)'; ctx.lineWidth = 1.5; for (const dx of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(dx, 26); ctx.lineTo(dx, 38); ctx.stroke(); } } }
function arm(ctx, side, a, st, g) { const s = side; ctx.save(); ctx.translate(76 * s, 30); ctx.rotate(-a[0] * s);
  const sleeve = st.age === 'young' ? C.shirt : C.suit;
  fillShade(ctx, c => { c.beginPath(); c.roundRect(-23, -22, 46, 150, 22); }, sleeve, { line: LINE, y0: -20, y1: 150, rim: st.rim ? `rgba(${st.rim},0.5)` : null });
  ctx.translate(0, 124); ctx.rotate(a[1] * s);
  fillShade(ctx, c => { c.beginPath(); c.roundRect(-19, -16, 38, 132, 17); }, sleeve, { line: LINE, y0: -10, y1: 130 });
  if (st.age === 'young') fillShade(ctx, c => { c.beginPath(); c.roundRect(-20, 60, 40, 22, 8); }, '#e4ddcc', { line: LINE });   // rolled sleeve
  else fillShade(ctx, c => { c.beginPath(); c.rect(-16, 108, 32, 12); }, C.shirt, { line: LINE });                                    // cuff
  ctx.translate(0, 120); hand(ctx, s, ['open', 'point'].includes(st.pose)); if (s > 0 && st.prop) st.prop(ctx, g); if (s < 0 && st.propL) st.propL(ctx, g); ctx.restore(); }
function legs(ctx, st, g) { const w = st.legs === 'walk' ? Math.sin((st.walk || 0) * 6.283) : 0; const col = st.age === 'young' ? '#3a3f4c' : C.suit;
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(30 * s, 300); ctx.rotate(w * 0.26 * s);
    fillShade(ctx, c => { c.beginPath(); c.moveTo(-32, 0); c.lineTo(32, 0); c.lineTo(26, 170); c.lineTo(-24, 170); c.closePath(); }, col, { line: LINE, y0: 0, y1: 340, hi: 0.1, lo: 0.2 }); ctx.translate(0, 166); ctx.rotate(Math.max(0, -w * s) * 0.35);
    fillShade(ctx, c => { c.beginPath(); c.moveTo(-25, -4); c.lineTo(26, -4); c.lineTo(22, 166); c.lineTo(-22, 166); c.closePath(); }, col, { line: LINE, y0: -170, y1: 170, hi: 0.1, lo: 0.2 });
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 160); ctx.stroke();
    fillShade(ctx, c => { c.beginPath(); c.moveTo(-24, 158); c.lineTo(20, 158); c.quadraticCurveTo(26 + 26 * s, 162, 30 + 22 * s, 180); c.lineTo(-26, 182); c.closePath(); }, '#17120e', { line: LINE, hi: 0.35 }); ctx.restore(); } }
function torso(ctx, st) { const king = st.age !== 'young';
  // jacket / waistcoat body
  const body = c => { c.beginPath(); c.moveTo(-100, 34); c.bezierCurveTo(-98, 120, -76, 190, -78, 250); c.quadraticCurveTo(-82, 300, -86, 316); c.quadraticCurveTo(0, 326, 86, 316); c.quadraticCurveTo(82, 300, 78, 250); c.bezierCurveTo(76, 190, 98, 120, 100, 34); c.bezierCurveTo(90, 6, 40, -6, 0, -6); c.bezierCurveTo(-40, -6, -90, 6, -100, 34); c.closePath(); };
  if (king) fillShade(ctx, body, C.suit, { line: LINE, y0: -10, y1: 360, rim: st.rim ? `rgba(${st.rim},0.45)` : null, rimW: 8 });
  else { fillShade(ctx, body, C.shirt, { line: LINE, y0: -10, y1: 360 }); fillShade(ctx, c => { c.beginPath(); c.moveTo(-66, 40); c.lineTo(-62, 300); c.lineTo(62, 300); c.lineTo(66, 40); c.lineTo(28, 20); c.lineTo(0, 120); c.lineTo(-28, 20); c.closePath(); }, C.young, { line: LINE }); }
  // shirt V, waistcoat, lapels
  fillShade(ctx, c => { c.beginPath(); c.moveTo(-34, -2); c.lineTo(0, 120); c.lineTo(34, -2); c.closePath(); }, C.shirt, { line: LINE, hi: 0.05 });
  if (king) { fillShade(ctx, c => { c.beginPath(); c.moveTo(-30, 60); c.lineTo(0, 150); c.lineTo(30, 60); c.lineTo(44, 270); c.lineTo(-44, 270); c.closePath(); }, C.suitDk, { line: LINE });
    for (let i = 0; i < 3; i++) { ctx.fillStyle = '#0e0f14'; ctx.beginPath(); ctx.arc(0, 170 + i * 26, 4, 0, 7); ctx.fill(); }
    fillShade(ctx, c => { c.beginPath(); c.moveTo(-36, -2); c.lineTo(-6, 150); c.lineTo(-40, 110); c.lineTo(-66, 40); c.closePath(); }, C.suitDk, { line: LINE });
    fillShade(ctx, c => { c.beginPath(); c.moveTo(36, -2); c.lineTo(6, 150); c.lineTo(40, 110); c.lineTo(66, 40); c.closePath(); }, C.suitDk, { line: LINE });
    fillShade(ctx, c => { c.beginPath(); c.moveTo(54, 120); c.lineTo(82, 114); c.lineTo(78, 128); c.lineTo(56, 132); c.closePath(); }, C.shirt, { line: LINE }); }
  // stiff collar + tie + pin
  fillShade(ctx, c => { c.beginPath(); c.moveTo(-30, -16); c.lineTo(-4, 12); c.lineTo(-24, 24); c.lineTo(-36, 0); c.closePath(); c.moveTo(30, -16); c.lineTo(4, 12); c.lineTo(24, 24); c.lineTo(36, 0); c.closePath(); }, '#ffffff', { line: LINE, hi: 0 });
  fillShade(ctx, c => { c.beginPath(); c.moveTo(-9, 10); c.lineTo(9, 10); c.lineTo(13, 100); c.lineTo(0, 118); c.lineTo(-13, 100); c.closePath(); }, king ? C.tie : '#5a2a2a', { line: LINE });
  if (king) { ctx.fillStyle = C.tiePin; ctx.fillRect(-10, 62, 20, 4); } }
const EXPR = { // brow lift L/R, brow angle, mouth curve, mouth width
  neutral: [0, 0, 0, 0, 1], smile: [2, 2, 0.05, 6, 1.05], serious: [-3, -3, -0.12, -2, 0.92], worried: [5, 5, 0.25, -5, 0.9], surprised: [10, 10, 0.05, 0, 0.85], cold: [-2, 1, -0.08, 1, 0.95] };
function head(ctx, st, g) { const king = st.age !== 'young', E = EXPR[st.expr || 'neutral'], tn = st.turn || 0, fx = tn * 10, [lx, ly] = st.look || [0, 0];
  ctx.save(); ctx.translate(0, -8); ctx.rotate(st.tilt || 0);
  fillShade(ctx, c => { c.beginPath(); c.roundRect(-22, -40, 44, 50, 10); }, C.skinSh, { line: LINE });                                   // neck
  for (const s of [-1, 1]) fillShade(ctx, c => { c.beginPath(); c.ellipse(s * 58 - tn * 8, -104, 12, 22, 0, 0, 7); }, C.skin, { line: LINE }); // ears
  const face = c => { c.beginPath(); c.moveTo(-56, -120); c.bezierCurveTo(-60, -60, -48, -30, -14, -22); c.quadraticCurveTo(0, -18, 14, -22); c.bezierCurveTo(48, -30, 60, -60, 56, -120);
    c.bezierCurveTo(54, -178, 30, -196, 0, -196); c.bezierCurveTo(-30, -196, -54, -178, -56, -120); c.closePath(); };
  fillShade(ctx, face, C.skin, { line: LINE, y0: -200, y1: -10, hi: 0.12, lo: 0.2, rim: st.rim ? `rgba(${st.rim},0.55)` : null, rimW: 8 });
  ctx.save(); face(ctx); ctx.clip(); ctx.fillStyle = 'rgba(160,90,70,0.12)'; ctx.beginPath(); ctx.ellipse(-30 + fx, -78, 16, 10, 0, 0, 7); ctx.ellipse(30 + fx, -78, 16, 10, 0, 0, 7); ctx.fill();   // cheeks
  ctx.fillStyle = 'rgba(120,70,50,0.14)'; ctx.beginPath(); ctx.ellipse(-48 + tn * 20, -80, 16, 50, 0, 0, 7); ctx.fill(); ctx.restore();                                                 // side shade
  // hair: young = full, swept back; king = receding, swept back, grey temples
  if (king) { fillShade(ctx, c => { c.beginPath(); c.moveTo(-58, -118); c.bezierCurveTo(-66, -196, -28, -214, 0, -213); c.bezierCurveTo(28, -214, 66, -196, 58, -118);
      c.bezierCurveTo(54, -150, 46, -168, 34, -178); c.quadraticCurveTo(18, -170, 8, -186); c.quadraticCurveTo(0, -192, -8, -186); c.quadraticCurveTo(-18, -170, -34, -178); c.bezierCurveTo(-46, -168, -54, -150, -58, -118); c.closePath(); }, C.hair, { line: LINE, hi: 0.22, y0: -215, y1: -110 });
    for (const sd of [-1, 1]) { ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = C.hairGrey; ctx.beginPath(); ctx.moveTo(sd * 57, -122); ctx.quadraticCurveTo(sd * 60, -150, sd * 50, -164); ctx.lineTo(sd * 46, -150); ctx.quadraticCurveTo(sd * 52, -136, sd * 51, -120); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  else fillShade(ctx, c => { c.beginPath(); c.moveTo(-58, -116); c.bezierCurveTo(-68, -204, -20, -222, 6, -218); c.bezierCurveTo(44, -214, 68, -190, 58, -116); c.bezierCurveTo(52, -146, 44, -162, 26, -170);
      c.quadraticCurveTo(-10, -178, -28, -158); c.quadraticCurveTo(-46, -150, -58, -116); c.closePath(); }, C.hair, { line: LINE, hi: 0.22, y0: -220, y1: -110 });
  // eyes
  const ey = -112, bl = 1 - (st.blink || 0);
  for (const s of [-1, 1]) { const ex = s * 22 + fx; ctx.fillStyle = '#fbf7ef'; ctx.beginPath(); ctx.ellipse(ex, ey, 11, 7 * bl + 0.4, 0, 0, 7); ctx.fill();
    if (bl > 0.2) { ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, 11, 7 * bl, 0, 0, 7); ctx.clip(); ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.arc(ex + lx * 4 + tn * 3, ey + ly * 3, 5.5, 0, 7); ctx.fill();
      ctx.fillStyle = C.eye; ctx.beginPath(); ctx.arc(ex + lx * 4 + tn * 3, ey + ly * 3, 3, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + lx * 4 + tn * 3 + 1.5, ey + ly * 3 - 1.5, 1.2, 0, 7); ctx.fill(); ctx.restore(); }
    ctx.strokeStyle = 'rgba(40,25,20,0.8)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(ex, ey, 12, 8 * bl + 0.6, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }  // upper lid
  // brows
  ctx.strokeStyle = C.hair; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const s of [-1, 1]) { const lift = s < 0 ? E[0] : E[1]; ctx.beginPath(); ctx.moveTo(s * 8 + fx, ey - 16 - lift + E[2] * 20 * 0); ctx.quadraticCurveTo(s * 22 + fx, ey - 24 - lift - E[2] * 10, s * 36 + fx, ey - 17 - lift + E[2] * 14); ctx.stroke(); }
  // nose
  ctx.strokeStyle = 'rgba(120,70,50,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-2 + fx, ey + 4); ctx.lineTo(-6 + fx * 1.4, ey + 34); ctx.quadraticCurveTo(2 + fx * 1.4, ey + 40, 9 + fx * 1.3, ey + 34); ctx.stroke();
  // mouth: width & curve by expression, opens with the voice
  const mw = 18 * E[4], mo = clamp(st.m || 0), my = ey + 58, cv = E[3];
  ctx.fillStyle = '#5c2a26'; ctx.beginPath(); ctx.moveTo(-mw + fx, my - cv * 0.4); ctx.quadraticCurveTo(fx, my + 3 + mo * 16 + cv, mw + fx, my - cv * 0.4); ctx.quadraticCurveTo(fx, my - 2 + cv * 0.3, -mw + fx, my - cv * 0.4); ctx.fill();
  if (mo > 0.35) { ctx.fillStyle = '#f2ece2'; ctx.fillRect(-mw * 0.55 + fx, my - 1, mw * 1.1, 3); }
  ctx.strokeStyle = C.lips; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-mw + fx, my - cv * 0.4); ctx.quadraticCurveTo(fx, my + 3 + mo * 16 + cv, mw + fx, my - cv * 0.4); ctx.stroke();
  ctx.restore(); }
// whole figure. st.legs: 'stand' / 'walk' adds legs (for seated shots leave it off and draw a desk in front)
function kreuger(ctx, x, y, s, st = {}, g = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s * (st.flip ? -1 : 1), s); ctx.lineJoin = 'round';
  const breath = Math.sin(g * 1.7) * 2.2; ctx.translate(0, breath * 0.3);
  if (st.legs) legs(ctx, st, g);
  const A = arms(st, g), Lfront = A.L[1] > 1.0;                       // an arm bent across the body is drawn in front of the torso
  if (!Lfront) arm(ctx, -1, A.L, st, g); torso(ctx, st); if (Lfront) arm(ctx, -1, A.L, st, g); arm(ctx, 1, A.R, st, g);
  ctx.save(); ctx.translate(0, -breath * 0.3); head(ctx, st, g); ctx.restore(); ctx.restore(); }
// automatic life: blinks every ~3.3 s with jitter, small idle tilt; mouth from a loudness envelope
function life(g, seed = 0) { const p = (g + seed) % 3.3; return { blink: p < 0.12 ? Math.sin(p / 0.12 * Math.PI) : 0, tilt: Math.sin(g * 0.9 + seed) * 0.03 }; }
module.exports = { kreuger, life, POSES, EXPR, C };
