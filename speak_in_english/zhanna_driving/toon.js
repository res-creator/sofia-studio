// "Toon" character kit v3 (zhanna_grwm). v3: brows in normal layer order with the fringe trimmed above them, soft lipstick mouth
// with no black ink, continuous mouth shape (D <-> oval blend), mood blending (st.moodFrom / st.moodK), smoothing helpers follow / smooth / talk / moodAt.
// v3.1: st.sh = «ш» lips (pucker).
// v2: Backward compatible with v1: draw(g, st) with the same st fields.
// v2 adds: jaw drop + visemes (st.mouth 0..1, st.vis 0..1 noise, st.talking = a line is being spoken), st.nod (px), brows drawn over the fringe, 20 moods (MOODS),
// outfits (st.outfit: sequins | leopard | gold | blazer | fitness), IK arms (ik), shoulder rise, st.lean, head turn with st.look,
// hooks skinFx / faceFx / hairFx, drawArm / palOf for renderers that redraw raised arms in front of the head, laughEnv() bursts.
const OUT = '#2a2230', LW = 7;
let g;
const P = () => g.beginPath();
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
function fs(fill, lw = LW) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OUT; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = LW, rot = 0) { P(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); fs(fill, lw); }
function line(pts, w, col = OUT) { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function q(a, c, b, w = 7, col = OUT) { P(); g.moveTo(...a); g.quadraticCurveTo(...c, ...b); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); }
function limb(pts, w, col) { line(pts, w + LW * 2, OUT); line(pts, w, col); }

// ---------- head ----------
const HY = -1040; // head centre
let JAW = 0;      // chin drop in px (0..~22 = up to ~7% of the head height)
const jy = y => y > HY + 20 ? y + (y - (HY + 20)) / 136 * JAW : y;
function headPath() { P(); g.moveTo(0, HY - 165); g.bezierCurveTo(105, HY - 165, 150, HY - 110, 152, HY - 20); g.bezierCurveTo(154, jy(HY + 70), 110 - JAW * .3, jy(HY + 135), 30, jy(HY + 150));
  g.quadraticCurveTo(0, jy(HY + 156), -30, jy(HY + 150)); g.bezierCurveTo(-110 + JAW * .3, jy(HY + 135), -154, jy(HY + 70), -152, HY - 20); g.bezierCurveTo(-150, HY - 110, -105, HY - 165, 0, HY - 165); g.closePath(); }
function hairBack(st, c) { const h = st.hair;
  if (h === 'ponytail') { P(); g.moveTo(70, HY - 150); g.quadraticCurveTo(190, HY - 260, 250, HY - 170); g.lineTo(215, HY - 150); g.lineTo(270, HY - 95); g.lineTo(215, HY - 100); g.lineTo(240, HY - 40); g.quadraticCurveTo(150, HY - 80, 110, HY - 110); g.closePath(); fs(c.hair); ell(105, HY - 140, 22, 22, c.tie || '#e05a2a', 5); }
  if (h === 'long') { P(); g.moveTo(-160, HY - 40); g.lineTo(-175, HY + 190); g.lineTo(175, HY + 190); g.lineTo(160, HY - 40); g.closePath(); fs(c.hairS || c.hair); }
  if (h === 'bouffant') { P(); g.moveTo(-200, HY + 210); g.bezierCurveTo(-260, HY + 60, -250, HY - 190, -120, HY - 245); g.bezierCurveTo(-40, HY - 280, 60, HY - 280, 130, HY - 245); g.bezierCurveTo(250, HY - 190, 270, HY + 60, 210, HY + 210); g.quadraticCurveTo(260, HY + 250, 230, HY + 270); g.quadraticCurveTo(150, HY + 250, 160, HY + 200); g.lineTo(-160, HY + 200); g.quadraticCurveTo(-150, HY + 250, -230, HY + 270); g.quadraticCurveTo(-260, HY + 250, -200, HY + 210); g.closePath(); fs(c.hairS || c.hair); q([-170, HY - 120], [-210, HY + 40], [-180, HY + 170], 5); q([180, HY - 120], [220, HY + 40], [190, HY + 170], 5); }
  if (h === 'bun') { ell(0, HY - 215, 105, 95, c.hair); q([-40, HY - 250], [0, HY - 230], [40, HY - 250], 5); q([-60, HY - 200], [0, HY - 180], [50, HY - 205], 5); } }
function hairFront(st, c) { const h = st.hair;
  if (h === 'spiky') { P(); g.moveTo(-158, HY - 10); g.lineTo(-170, HY - 90); g.lineTo(-205, HY - 120); g.lineTo(-150, HY - 150); g.lineTo(-150, HY - 200); g.lineTo(-80, HY - 185); g.lineTo(-40, HY - 245); g.lineTo(20, HY - 195);
    g.lineTo(90, HY - 240); g.lineTo(110, HY - 180); g.lineTo(185, HY - 175); g.lineTo(150, HY - 120); g.lineTo(195, HY - 70); g.lineTo(150, HY - 55); g.lineTo(150, HY - 10); g.lineTo(120, HY - 95); g.lineTo(40, HY - 120); g.lineTo(-30, HY - 100); g.lineTo(-110, HY - 120); g.closePath(); fs(c.hair);
    q([10, HY - 240], [30, HY - 290], [60, HY - 270], 6); }
  else if (h === 'bouffant') { P(); g.moveTo(-170, HY + 10); g.bezierCurveTo(-200, HY - 170, -60, HY - 250, 40, HY - 230); g.bezierCurveTo(160, HY - 220, 210, HY - 120, 170, HY + 10);   // v3: fringe ends above the brows
    g.quadraticCurveTo(168, HY - 100, 112, HY - 156); g.quadraticCurveTo(50, HY - 200, -10, HY - 176); g.quadraticCurveTo(-80, HY - 204, -124, HY - 154); g.quadraticCurveTo(-170, HY - 100, -170, HY + 10); g.closePath(); fs(c.hair);
    q([-30, HY - 214], [40, HY - 240], [110, HY - 204], 6); q([-110, HY - 190], [-60, HY - 214], [0, HY - 200], 5); }
  else if (h === 'ponytail' || h === 'long') { P(); g.moveTo(-160, HY + 20); g.bezierCurveTo(-175, HY - 120, -100, HY - 185, 0, HY - 182); g.bezierCurveTo(100, HY - 185, 172, HY - 120, 160, HY + 20); g.lineTo(140, HY - 40);
    g.quadraticCurveTo(110, HY - 110, 20, HY - 110); g.lineTo(0, HY - 60); g.lineTo(-30, HY - 112); g.quadraticCurveTo(-120, HY - 105, -140, HY - 40); g.closePath(); fs(c.hair);
    }
  else if (h === 'bun' || h === 'short') { P(); g.moveTo(-156, HY - 10); g.bezierCurveTo(-170, HY - 130, -90, HY - 182, 0, HY - 180); g.bezierCurveTo(90, HY - 182, 170, HY - 130, 156, HY - 10); g.quadraticCurveTo(140, HY - 90, 60, HY - 112);
    g.quadraticCurveTo(-20, HY - 95, -70, HY - 120); g.quadraticCurveTo(-140, HY - 95, -156, HY - 10); g.closePath(); fs(c.hair); }
  else if (h === 'curly') { for (let k = 0; k < 9; k++) { const a = Math.PI * (1.02 + k / 8 * .96); ell(Math.cos(a) * 150, HY - 30 + Math.sin(a) * 150, 46, 42, c.hair, 6); } ell(0, HY - 150, 120, 50, c.hair, 0); } }

// ---------- moods ----------
// lid/low: upper/lower lid cover 0..1; wide; pr pupil radius; px/py pupil offset; closed: 'happy' (arc) | 'squeeze' (><); winkR;
// brows [lift, tilt] (lift < 0 = raised, tilt > 0 = angry inner-down) or browsL / browsR; mouth: closed shape; corner: mouth-corner lift
// while talking (< 0 = up); jaw: minimum jaw drop 0..1; tilt: extra head tilt (< 0 = back); up: features shift up (chin up); tears; nose (scrunch)
const MOODS = {
  neutral: {brows: [0, 0], mouth: 'smile', corner: -4},
  smug: {lid: .42, py: 10, brows: [0, 5], mouth: 'smirk', corner: -6},
  smugside: {lid: .4, px: 16, py: 10, browsL: [4, 7], browsR: [-22, -2], mouth: 'smirk2', corner: -8},
  happy: {closed: 'happy', brows: [-8, 0], mouth: 'smile', corner: -10},
  grin: {low: .15, brows: [-6, 0], mouth: 'grin', corner: -12},
  laugh: {closed: 'squeeze', brows: [-12, -6], mouth: 'laugh', corner: -14, tilt: -.08, up: 8, jaw: .35},
  cryinglaugh: {closed: 'squeeze', tears: true, brows: [-8, -18], mouth: 'laugh', corner: -12, tilt: -.05, jaw: .35},
  surprised: {wide: 1.1, pr: 8, brows: [-20, 0], mouth: 'o', corner: 0},
  shocked: {wide: 1.18, pr: 5, brows: [-30, -6], mouth: 'O', jaw: .9, corner: 4},
  angry: {lid: .28, brows: [2, 20], mouth: 'frown', corner: 8},
  sad: {lid: .2, brows: [0, -18], mouth: 'frown', corner: 8},
  worried: {wide: 1.04, pr: 9, brows: [-14, -24], mouth: 'wavy', corner: 6},
  flat: {lid: .4, brows: [0, 0], mouth: 'line', corner: 0},
  sleepy: {lid: .55, brows: [0, 0], mouth: 'line', corner: 0},
  kind: {low: .4, brows: [-14, -9], mouth: 'smile', corner: -8},
  disgusted: {lid: .4, low: .3, py: 4, browsL: [6, 20], browsR: [-14, -4], mouth: 'ew', corner: 6, nose: true},
  flirty: {winkR: true, lid: .3, browsL: [-18, -2], browsR: [4, 6], mouth: 'smirk', corner: -10, blush: .6},
  eyeroll: {lid: .14, py: -42, px: 10, brows: [-10, -4], mouth: 'side', corner: 2},
  dreamy: {lid: .5, py: 18, px: -10, brows: [-14, -8], mouth: 'soft', corner: -6, blush: .55},
  proud: {lid: .45, py: 22, brows: [-8, 5], mouth: 'smile', corner: -10, tilt: -.05, up: 14},
};
const moodOf = st => MOODS[st.mood] || MOODS.neutral;
let FX = 0, UP = 0;   // head-turn feature shift, chin-up feature shift

function eye(st, c, E, s) { const cx = s * 50 + FX, ey = HY - 30 - UP, wide = E.wide || 1, rx = 50 * wide, ry = 70 * wide, lidCol = c.lid || c.skin;
  if (st.blink || E.closed === 'happy' || (s > 0 && (E.winkR || st.wink))) { q([cx - 42, ey + 8], [cx, ey - 20], [cx + 42, ey + 8], LW + 2); if (st.lashes) line([[cx + s * 40, ey + 6], [cx + s * 54, ey - 4]], 6); return; }
  if (E.closed === 'squeeze') { line([[cx + s * 34, ey - 26], [cx - s * 28, ey - 2], [cx + s * 34, ey + 20]], LW + 3); return; }
  ell(cx, ey, rx, ry, '#ffffff', 0);   // outline drawn later, only where the eye is visible
  g.save(); P(); g.ellipse(cx, ey, rx - 2, ry - 2, 0, 0, 7); g.clip();
  const pr = E.pr || 11, px = cx + (E.px || 0) + (st.look || 0) * 14 - s * 6, py = ey + 8 + (E.py || 0);
  ell(px, py, pr, pr * 1.4, OUT, 0); ell(px - pr * .35, py - pr * .55, pr * .38, pr * .38, '#ffffff', 0);
  const lid = E.lid || 0, low = E.low || 0;
  g.restore(); g.save(); P(); g.ellipse(cx, ey, rx + 3, ry + 3, 0, 0, 7); g.clip();   // lids cover the whole eye incl. its rim
  if (lid > 0) { const ly = ey - ry + 2 * ry * lid; g.save(); P(); g.rect(cx - rx - 4, ey - ry - 4, rx * 2 + 8, ly - (ey - ry) + 4); g.clip(); g.fillStyle = lidCol; g.fill(); if (!c.lid) ell(110, HY + 40, 70, 160, c.skinS, 0); g.restore(); line([[cx - rx, ly], [cx + rx, ly]], LW); }
  if (low > 0) { const ly = ey + ry - 2 * ry * low; P(); g.moveTo(cx - rx - 4, ey + ry + 4); g.lineTo(cx + rx + 4, ey + ry + 4); g.lineTo(cx + rx + 4, ly + 20); g.quadraticCurveTo(cx, ly - 18, cx - rx - 4, ly + 20); g.closePath(); g.fillStyle = lidCol; g.fill(); g.save(); g.clip(); if (!c.lid) ell(110, HY + 40, 70, 160, c.skinS, 0); g.restore(); q([cx - rx * .8, ly + 10], [cx, ly - 14], [cx + rx * .8, ly + 10], 5); }
  g.restore();
  const top = ey - ry + 2 * ry * lid, bot = ey + ry - 2 * ry * low * .8;   // outline only where the eye is visible (not above the lid)
  g.save(); P(); g.rect(cx - rx - 10, top - 3, rx * 2 + 20, bot - top + 13); g.clip(); ell(cx, ey, rx, ry, null, LW); g.restore();
  if (st.lashes) { if (lid > .05) { const hw = Math.sqrt(Math.max(0, 1 - ((top - ey) / ry) ** 2)) * rx; for (let j = 0; j < 3; j++) line([[cx + s * (hw - 6 - j * 12), top], [cx + s * (hw + 8 - j * 8), top - 16 + j * 2]], 6); }
    else for (let j = 0; j < 3; j++) { const an = -Math.PI / 2 + s * (.75 + j * .3), bx = cx + Math.cos(an) * rx, by = ey + Math.sin(an) * ry; line([[bx, by], [bx + Math.cos(an) * 16 + s * 6, by + Math.sin(an) * 16]], 6); } } }   // v3: lashes on the outer upper rim
function brows(st, c, E) { const ey = HY - 30 - UP;   // v3: normal layer order (face -> brows -> fringe); fringe is trimmed above them
  for (const s of [-1, 1]) { let [lift, tilt] = (s < 0 ? E.browsL : E.browsR) || E.brows || [0, 0]; if (st.brows === 'up') { lift -= 6; tilt -= 6; }
    lift = Math.max(-18, lift); const arch = 14 + Math.max(0, -lift) * .5, cx = s * 56 + FX, by = ey - 100 + lift;
    P(); g.moveTo(cx - s * 36, by + tilt * 1.15); g.quadraticCurveTo(cx, by - arch, cx + s * 36, by - tilt * .35);
    g.strokeStyle = c.brow || OUT; g.lineWidth = 16; g.lineCap = 'round'; g.stroke(); } }
// ---------- mouth v3: one continuous shape (no hard viseme switches). r = roundness 0 (wide "a/e") .. 1 (round "o");
// control points of a D-shape and an ellipse are blended by r. No black ink: soft lipstick lips + thin darker lip edge.
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
function mouthShape(w, h, my, cor, r) { const X = FX, lp = (a, b) => a + (b - a) * r, cy = my + h * .45, ry = h * .55 + .5, k = .5523;
  const D = [[-w, my - 8 + cor], [-w * .6, my - 6 + cor * .5], [-w * .3, my - 2], [0, my - 2], [w * .3, my - 2], [w * .6, my - 6 + cor * .5], [w, my - 8 + cor], [w * .95, my + h * .55], [w * .5, my + h + 6], [0, my + h + 6], [-w * .5, my + h + 6], [-w * .95, my + h * .55]];
  const O = [[-w, cy], [-w, cy - k * ry], [-k * w, cy - ry], [0, cy - ry], [k * w, cy - ry], [w, cy - k * ry], [w, cy], [w, cy + k * ry], [k * w, cy + ry], [0, cy + ry], [-k * w, cy + ry], [-w, cy + k * ry]];
  const Pt = D.map((d, i) => [lp(d[0], O[i][0]) + X, lp(d[1], O[i][1])]);
  P(); g.moveTo(...Pt[0]); for (let i = 0; i < 4; i++) g.bezierCurveTo(...Pt[i * 3 + 1], ...Pt[i * 3 + 2], ...Pt[(i * 3 + 3) % 12]); g.closePath(); }
const lipOf = c => c.lip || '#c46a72';
function openMouth(c, w, h, my, cor, r, alpha = 1) { if (h < .5 || alpha <= 0) return; g.save(); g.globalAlpha *= alpha; const lip = lipOf(c);
  mouthShape(w, h, my, cor, r); g.fillStyle = '#6a1a2a'; g.fill();
  g.save(); g.clip(); if (h > 14) { g.fillStyle = '#ffffff'; g.fillRect(-w + FX, my - 14, w * 2, Math.min(15, h * .3)); } ell(FX, my + h + 4, w * .55, Math.max(5, h * .34), '#f07a8a', 0); g.restore();
  mouthShape(w, h, my, cor, r); g.lineJoin = 'round'; g.strokeStyle = lip; g.lineWidth = Math.min(10, 4 + h * .25); g.stroke(); g.strokeStyle = shade(lip, .72); g.lineWidth = 2.2; g.stroke(); g.restore(); }
function closedMouth(c, shape, my, alpha = 1) { if (alpha <= 0) return; g.save(); g.globalAlpha *= alpha; const lc = lipOf(c), lw = c.lip ? 12 : 8, X = FX;
  switch (shape) {
    case 'smirk': q([-34 + X, my + 4], [10 + X, my + 16], [40 + X, my - 10], lw, lc); break;
    case 'smirk2': q([-28 + X, my + 6], [16 + X, my + 14], [48 + X, my - 20], lw, lc); break;
    case 'frown': q([-32 + X, my + 12], [X, my - 10], [32 + X, my + 12], lw, lc); break;
    case 'line': line([[-26 + X, my], [26 + X, my]], lw, lc); break;
    case 'side': line([[-12 + X, my + 4], [32 + X, my - 4]], lw, lc); break;
    case 'wavy': line([[-30 + X, my + 6], [-14 + X, my - 2], [2 + X, my + 6], [18 + X, my - 2], [32 + X, my + 6]], lw, lc); break;
    case 'ew': line([[-34 + X, my + 10], [-14 + X, my - 2], [6 + X, my + 8], [30 + X, my - 6]], lw, lc); ell(-6 + X, my + 18, 12, 10, '#f07a8a', 0); break;
    case 'soft': q([-24 + X, my], [X, my + 12], [24 + X, my], lw, lc); break;
    case 'o': openMouth(c, 16, 22, my - 2, 0, 1); break;
    case 'O': openMouth(c, 30, 70, my - 4, 0, 1); break;
    case 'grin': openMouth(c, 62, 40, my, -12, 0); break;
    case 'laugh': openMouth(c, 64, 58, my, -14, 0); break;
    default: q([-38 + X, my - 4], [X, my + 20], [38 + X, my - 4], lw, lc); }
  g.restore(); }
// rest shape while a line is spoken: open moods close down between syllables
const restShape = (shape, talking) => talking ? ({O: 'o', grin: 'smile', laugh: 'smile'}[shape] || shape) : shape;
// «ш» viseme (st.sh 0..1, crossfaded): lips pushed forward into a small rounded opening, teeth showing
function pucker(c) { const my = HY + 92 - UP + JAW * .5, lip = lipOf(c); openMouth(c, 26, 20, my - 2, 0, .85); mouthShape(26, 20, my - 2, 0, .85); g.strokeStyle = lip; g.lineWidth = 15; g.lineJoin = 'round'; g.stroke(); g.strokeStyle = shade(lip, .72); g.lineWidth = 2.2; g.stroke();
  P(); g.ellipse(FX, my + 20, 16, 4, 0, 0, 7); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); }
function mouth(st, c, E) { const sh = clamp(st.sh || 0); if (sh > 0) { if (sh < 1) { g.save(); g.globalAlpha *= 1 - sh; mouthCore(st, c, E); g.restore(); } g.save(); g.globalAlpha *= sh; pucker(c); g.restore(); return; } mouthCore(st, c, E); }
function mouthCore(st, c, E) { const m = clamp(st.mouth || 0), my = HY + 92 - UP + JAW * .5, cor = E.corner || 0;
  if (st.tongue) { P(); g.moveTo(-50, my - 6); g.quadraticCurveTo(0, my - 14, 50, my - 6); g.quadraticCurveTo(40, my + 46, 0, my + 50); g.quadraticCurveTo(-40, my + 46, -50, my - 6); fs('#7a2230');
    P(); g.moveTo(-26, my + 12); g.lineTo(26, my + 12); g.lineTo(26, my + 70); g.quadraticCurveTo(0, my + 96, -26, my + 70); g.closePath(); fs('#f07a8a', 6); return; }
  const r = clamp(st.round ?? ((st.vis ?? .5) < .4 ? 1 : 0)), laugh = E.mouth === 'laugh', wide = clamp(-cor / 12);
  const w = (1 - r) * (46 + 14 * wide + m * 8) + r * (18 + m * 16), h = m * (laugh ? 70 : 58), aOpen = clamp(m / .14);
  const kB = clamp(st.moodK ?? 1), A = st.moodFrom ? (MOODS[st.moodFrom] || MOODS.neutral).mouth : E.mouth, rest = restShape(E.mouth, st.talking), restA = restShape(A, st.talking);
  if (aOpen < 1) { if (restA !== rest && kB < 1) closedMouth(c, restA, my, (1 - aOpen) * (1 - kB)); closedMouth(c, rest, my, (1 - aOpen) * (restA !== rest ? kB : 1)); }
  openMouth(c, laugh ? 64 : w, h + 4 * r * m, my, cor * (1 - r), laugh ? 0 : r, aOpen); }
// mood blending: numeric fields lerp, closed-eye style / wink switch at the middle (a blink covers it)
function blendMood(A, B, k) { if (k >= 1 || !A) return B; const o = {}, keys = new Set([...Object.keys(A), ...Object.keys(B)]), lerp = (a, b) => a + (b - a) * k;
  for (const key of keys) { const a = A[key], b = B[key];
    if (key === 'brows' || key === 'browsL' || key === 'browsR') continue;
    if (typeof a === 'number' || typeof b === 'number') o[key] = lerp(a ?? (key === 'wide' ? 1 : key === 'pr' ? 11 : 0), b ?? (key === 'wide' ? 1 : key === 'pr' ? 11 : 0)); else o[key] = k < .5 ? a : b; }
  for (const side of ['browsL', 'browsR']) { const a = A[side] || A.brows || [0, 0], b = B[side] || B.brows || [0, 0]; o[side] = [lerp(a[0], b[0]), lerp(a[1], b[1])]; }
  o.mouth = B.mouth; return o; }
function face(st, c) { const E = st.moodFrom ? blendMood(MOODS[st.moodFrom] || MOODS.neutral, moodOf(st), clamp(st.moodK ?? 1)) : moodOf(st), talk = clamp(st.mouth || 0);
  // jaw follows the (smoothed) mouth opening; mood minimum for laugh / shock
  JAW = 26 * Math.max(E.jaw || 0, talk);
  FX = (st.look || 0) * 12; UP = E.up || 0;
  for (const s of [-1, 1]) { ell(s * 150, HY + 10, 26, 40, c.skin); q([s * 146, HY - 6], [s * 160, HY + 10], [s * 148, HY + 28], 5); }
  headPath(); fs(c.skin);
  g.save(); headPath(); g.clip(); ell(110, HY + 40, 70, 160, c.skinS, 0); ell(0, jy(HY + 150), 60, 12, c.skinS, 0); g.restore(); headPath(); fs(null);
  if (st.skinFx) { g.save(); headPath(); g.clip(); st.skinFx(g, HY); g.restore(); headPath(); fs(null); }   // face masks under eyes/brows/mouth
  for (const s of [-1, 1]) eye(st, c, E, s);
  brows(st, c, E);
  if (st.glasses) { const ey = HY - 30 - UP; for (const s of [-1, 1]) { P(); g.ellipse(s * 56 + FX, ey + 4, 60, 56, 0, 0, 7); g.strokeStyle = OUT; g.lineWidth = 5; g.stroke(); } line([[-150, ey - 6], [-116 + FX, ey]], 5); line([[150, ey - 6], [116 + FX, ey]], 5); }
  if (st.probe) { ell(-50, HY - 30, 20, 20, '#ff00ff', 0); ell(50, HY - 30, 20, 20, '#ff00ff', 0); ell(0, HY + 100, 20, 14, '#ff00ff', 0); }
  if (st.earrings) for (const s of [-1, 1]) { P(); g.roundRect(s * 152 - 14, HY + 44, 28, 34, 8); fs(st.earrings, 5); }
  ell(4 + FX * 1.3, HY + 40 - UP, 14, 11, c.skinS, 5);
  if (E.nose) for (const s of [-1, 1]) q([s * 10 + FX, HY + 14 - UP], [s * 22 + FX, HY + 8 - UP], [s * 30 + FX, HY + 16 - UP], 4);
  if (st.blush !== false) { const a = .28 + (E.blush || 0) * .4, by = HY + 60 + JAW * .35 - UP; ell(-92 + FX, by, 22 + (E.blush || 0) * 8, 11, `rgba(255,120,110,${a})`, 0); ell(92 + FX, by, 22 + (E.blush || 0) * 8, 11, `rgba(255,120,110,${a})`, 0); }
  mouth(st, c, E);
  if (E.tears) for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const u = (((st.t || 0) * 1.4 + k * .5) % 1), x = s * 100 + FX, y = HY - 10 + u * 120; g.save(); g.globalAlpha = 1 - u * .5; P(); g.moveTo(x, y - 18); g.quadraticCurveTo(x + 12, y + 2, x, y + 8); g.quadraticCurveTo(x - 12, y + 2, x, y - 18); fs('#8fd2ff', 4); g.restore(); }
}
// ---------- body ----------
// arm: [shoulder, elbow, hand] per side; s=-1 screen-left
const POSES = {
  down: s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]],
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  wave: s => s > 0 ? [[78, -860], [190, -930], [215, -1080]] : POSES.down(s),
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  cheer: s => [[s * 78, -860], [s * 170, -980], [s * 200, -1120]],
  hold: s => [[s * 78, -860], [s * 120, -730], [s * 40, -690]],
  desk: s => [[s * 78, -860], [s * 140, -700], [s * 60, -610]],
  fists: s => [[s * 78, -860], [s * 120, -760], [s * 30, -800]],
};
function legs(st, c) { for (const s of [-1, 1]) { limb([[s * 40, -580], [s * 46, -90]], 44, c.legs || c.bottom);
    P(); g.moveTo(s * 46 - 50 + (s > 0 ? 24 : -24), -20); g.bezierCurveTo(s * 46 - 50 + (s > 0 ? 24 : -24), -90, s * 46 + 50 + (s > 0 ? 24 : -24), -100, s * 46 + 60 + (s > 0 ? 24 : -24), -30); g.lineTo(s * 46 + 60 + (s > 0 ? 24 : -24), 0); g.lineTo(s * 46 - 50 + (s > 0 ? 24 : -24), 0); g.closePath(); fs(c.shoe || '#ffffff');
    line([[s * 46 - 50 + (s > 0 ? 24 : -24), -12], [s * 46 + 60 + (s > 0 ? 24 : -24), -12]], 6, c.sole || '#e05a2a'); } }
function torsoBase(st, c) {
  limb([[0, -930], [0, -860]], 34, c.skin);
  P(); g.moveTo(-82, -880); g.quadraticCurveTo(0, -895, 82, -880); g.lineTo(96, -560); g.quadraticCurveTo(0, -548, -96, -560); g.closePath(); fs(c.top);
  g.save(); g.clip(); g.fillStyle = c.topS || c.top; g.fillRect(60, -900, 60, 360); g.restore(); P(); g.moveTo(-82, -880); g.quadraticCurveTo(0, -895, 82, -880); g.lineTo(96, -560); g.quadraticCurveTo(0, -548, -96, -560); g.closePath(); fs(null);
  q([-34, -882], [0, -856], [34, -882], 6, c.collar || OUT);
  if (c.pocket) { P(); g.roundRect(-56, -700, 112, 70, 14); fs(c.topS || c.top, 5); }
  if (c.tie) { P(); g.moveTo(-12, -876); g.lineTo(12, -876); g.lineTo(20, -680); g.lineTo(0, -650); g.lineTo(-20, -680); g.closePath(); fs(c.tie, 5); }
  if (st.skirt || c.skirt) { P(); g.moveTo(-96, -580); g.lineTo(96, -580); g.lineTo(140, -380); g.quadraticCurveTo(0, -360, -140, -380); g.closePath(); fs(c.skirt || c.bottom); for (const xx of [-50, 0, 50]) line([[xx, -560], [xx * 1.3, -390]], 4); }
  else { P(); g.moveTo(-96, -570); g.lineTo(96, -570); g.lineTo(90, -520); g.lineTo(-90, -520); g.closePath(); fs(c.bottom); }
}

function moustache(st, c) { const y = HY + 66; for (const s of [-1, 1]) { P(); g.moveTo(0, y - 8); g.bezierCurveTo(s * 30, y - 22, s * 70, y - 16, s * 84, y + 14); g.bezierCurveTo(s * 70, y + 10, s * 50, y + 18, s * 30, y + 14); g.quadraticCurveTo(s * 10, y + 10, 0, y + 4); g.closePath(); fs(c.stache || c.hair, 6); } }
function cap(st, c) { const lift = st.capLift || 0;
  if (lift > 0 && st.bald) { ell(0, HY - 140, 140, 52, c.skin, 6); ell(-40, HY - 160, 34, 12, 'rgba(255,255,255,.85)', 0); }   // shiny bald top under the cap
  g.save(); g.translate(0, HY - 120 - lift * 40); g.rotate(-Math.min(lift, 1) * .12); g.translate(0, -(HY - 120));
  P(); g.moveTo(-170, HY - 64); g.bezierCurveTo(-182, HY - 215, 182, HY - 232, 172, HY - 70); g.quadraticCurveTo(0, HY - 108, -170, HY - 64); g.closePath(); fs(c.cap);
  g.save(); g.clip(); g.fillStyle = c.capS || c.cap; g.fillRect(70, HY - 260, 140, 220); g.restore(); P(); g.moveTo(-170, HY - 64); g.bezierCurveTo(-182, HY - 215, 182, HY - 232, 172, HY - 70); g.quadraticCurveTo(0, HY - 108, -170, HY - 64); g.closePath(); fs(null);
  q([-120, HY - 150], [0, HY - 190], [120, HY - 160], 5); ell(0, HY - 196, 14, 9, c.capS || c.cap, 5);
  P(); g.moveTo(-150, HY - 74); g.quadraticCurveTo(0, HY - 120, 152, HY - 78); g.quadraticCurveTo(160, HY - 52, 130, HY - 48); g.quadraticCurveTo(0, HY - 78, -128, HY - 46); g.quadraticCurveTo(-160, HY - 50, -150, HY - 74); g.closePath(); fs(c.capS || c.cap); g.restore(); }

// ---------- outfits (shape + palette; the character stays recognisable: hair, brooch, earrings come from the renderer / st) ----------
const OUTFITS = {
  sequins: {pal: {}},                                                                                   // default pink sequinned top
  leopard: {pal: {top: '#cf8a48', topS: '#b47236', sleeve: '#cf8a48', arm: '#cf8a48', trim: '#ff8ab8', skirt: '#cf8a48', bottom: '#cf8a48'}},
  gold:    {bare: true, pal: {top: '#e9bb34', topS: '#c99a1e', skirt: '#e9bb34', bottom: '#e9bb34'}},
  blazer:  {pal: {top: '#d42a3a', topS: '#a81e2c', sleeve: '#d42a3a', arm: '#d42a3a', under: '#2a2230', cuff: '#ffffff', bottom: '#2a2230', skirt: '#2a2230'}},
  fitness: {bare: true, pal: {top: '#26b5a6', topS: '#1c9084', band: '#ff5a9a', bottom: '#2a2230', skirt: null, legs: '#2a2230'}},
};
function palOf(st) { const o = OUTFITS[st.outfit], c = Object.assign({}, st.pal, o ? o.pal : {}); if (o && o.bare) { c.sleeve = c.skin; c.arm = c.skin; } return c; }
const hsh = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function torsoShape(c, wTop = 82, wBot = 96) { P(); g.moveTo(-wTop, -880); g.quadraticCurveTo(0, -895, wTop, -880); g.lineTo(wBot, -560); g.quadraticCurveTo(0, -548, -wBot, -560); g.closePath(); }
function torso(st, c) { const o = st.outfit;
  if (!o || o === 'sequins') { torsoBase(st, c); if (o === 'sequins') { g.save(); torsoShape(c); g.clip(); for (let i = 0; i < 40; i++) ell(-90 + hsh(i) * 180, -870 + hsh(i + 50) * 300, 5, 5, 'rgba(255,220,240,.75)', 0); g.restore(); } return; }
  limb([[0, -930], [0, -860]], 34, c.skin);
  if (o === 'leopard') {   // wrap robe: V neck with satin trim crossing over, spots, belt with a knot
    torsoShape(c, 90, 104); fs(c.top); g.save(); torsoShape(c, 90, 104); g.clip();
    for (let i = 0; i < 34; i++) { const x = -96 + hsh(i) * 192, y = -880 + hsh(i + 7) * 330; ell(x, y, 11, 8, '#4a2a12', 0, hsh(i) * 3); ell(x, y, 6, 4, '#e0a860', 0, hsh(i) * 3); }
    g.fillStyle = c.topS; g.fillRect(64, -900, 60, 360); g.restore(); torsoShape(c, 90, 104); fs(null);
    P(); g.moveTo(-34, -884); g.lineTo(0, -760); g.lineTo(34, -884); g.closePath(); fs(c.skin, 5);
    line([[-50, -884], [14, -690]], 26, OUT); line([[-50, -884], [14, -690]], 18, c.trim); line([[50, -884], [-6, -730]], 26, OUT); line([[50, -884], [-6, -730]], 18, c.trim);
    P(); g.roundRect(-102, -650, 204, 30, 10); fs(c.trim, 5); ell(44, -636, 18, 14, c.trim, 5); line([[40, -626], [30, -560]], 12, OUT); line([[40, -626], [30, -560]], 6, c.trim); line([[50, -626], [64, -566]], 12, OUT); line([[50, -626], [64, -566]], 6, c.trim);
    return; }
  if (o === 'gold') {      // bare shoulders, sweetheart neckline, shimmer, thin necklace
    torsoShape(c, 80, 96); fs(c.skin);
    P(); g.moveTo(-88, -790); g.quadraticCurveTo(-46, -838, 0, -800); g.quadraticCurveTo(46, -838, 88, -790); g.lineTo(98, -560); g.quadraticCurveTo(0, -548, -98, -560); g.closePath(); fs(c.top);
    g.save(); P(); g.moveTo(-88, -790); g.quadraticCurveTo(-46, -838, 0, -800); g.quadraticCurveTo(46, -838, 88, -790); g.lineTo(98, -560); g.lineTo(-98, -560); g.closePath(); g.clip();
    for (let k = 0; k < 6; k++) line([[-120 + k * 50, -560], [-60 + k * 50, -820]], 6, 'rgba(255,248,200,.6)'); g.fillStyle = c.topS; g.fillRect(62, -840, 60, 300); g.restore();
    q([-40, -880], [0, -846], [40, -880], 4, '#f2d06a'); return; }
  if (o === 'blazer') {    // red blazer, notch lapels, black top, gold buttons
    torsoShape(c, 88, 100); fs(c.top); g.save(); torsoShape(c, 88, 100); g.clip(); g.fillStyle = c.topS; g.fillRect(66, -900, 60, 360); g.restore(); torsoShape(c, 88, 100); fs(null);
    P(); g.moveTo(-34, -886); g.lineTo(0, -720); g.lineTo(34, -886); g.closePath(); fs(c.under, 5);
    for (const s of [-1, 1]) { P(); g.moveTo(s * 34, -886); g.lineTo(s * 66, -868); g.lineTo(s * 54, -830); g.lineTo(s * 70, -820); g.lineTo(s * 8, -712); g.closePath(); fs(c.topS, 5); }
    for (const y of [-680, -620]) ell(0, y, 9, 9, '#f2c820', 4); return; }
  if (o === 'fitness') {   // racer tank, bare shoulders, side stripe
    torsoShape(c, 80, 92); fs(c.skin);
    P(); g.moveTo(-50, -884); g.lineTo(-30, -884); g.quadraticCurveTo(0, -800, 30, -884); g.lineTo(50, -884); g.lineTo(92, -760); g.lineTo(96, -560); g.quadraticCurveTo(0, -548, -96, -560); g.lineTo(-92, -760); g.closePath(); fs(c.top);
    line([[-88, -760], [-90, -570]], 8, '#ffffff'); line([[88, -760], [90, -570]], 8, '#ffffff'); return; }
  torsoBase(st, c); }
function accessories(st, c) { const o = st.outfit;
  if (o === 'blazer') { for (const s of [-1, 1]) { ell(s * 62, HY - 200, 52, 34, '#2a2230', 6); ell(s * 62 - 14, HY - 210, 12, 7, 'rgba(255,255,255,.7)', 0); } line([[-12, HY - 204], [12, HY - 204]], 8); }   // sunglasses on the hair
  if (o === 'fitness') { P(); g.moveTo(-210, HY - 160); g.quadraticCurveTo(0, HY - 270, 210, HY - 160); g.strokeStyle = OUT; g.lineWidth = 36; g.stroke(); g.strokeStyle = c.band; g.lineWidth = 26; g.stroke(); } }

// ---------- arms: IK (natural elbow, no backward bend), shoulder rise, breathing ----------
const L1 = 170, L2 = 190;
function solveArm(S, H, hint, s, rise = 0) {
  S = [S[0], S[1] - clamp((-900 - H[1]) * .05, 0, 18) - rise];   // shoulder rises when the hand goes up
  let dx = H[0] - S[0], dy = H[1] - S[1], d = Math.hypot(dx, dy); const k = clamp(d / (L1 + L2 - 4), 1, 1.5), a = L1 * k, b = L2 * k;   // stretchy cartoon arm, max 1.5x
  if (d > a + b - 2) { const f = (a + b - 2) / d; H = [S[0] + dx * f, S[1] + dy * f]; dx = H[0] - S[0]; dy = H[1] - S[1]; d = a + b - 2; }
  d = Math.max(d, Math.abs(a - b) + 2); const ca = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1), base = Math.atan2(dy, dx), off = Math.acos(ca);
  const c1 = [S[0] + Math.cos(base + off) * a, S[1] + Math.sin(base + off) * a], c2 = [S[0] + Math.cos(base - off) * a, S[1] + Math.sin(base - off) * a];
  const score = E => s * E[0] + .6 * E[1] - (hint ? Math.hypot(E[0] - hint[0], E[1] - hint[1]) * .15 : 0);   // elbow out and down
  return [S, score(c1) >= score(c2) ? c1 : c2, H]; }
const ik = (fn, rise = 0) => s => { const [S, E, H] = fn(s); return solveArm(S, H, E, s, rise); };
function drawArm(gg, st, s, pts, c0) { if (gg) g = gg; const c = c0 || palOf(st), [S, E, H] = pts, m = k => [S[0] + (E[0] - S[0]) * k, S[1] + (E[1] - S[1]) * k];
  const robe = st.outfit === 'leopard', sw = robe ? 54 : 46;
  limb([S, m(.45)], sw, c.sleeve || c.top); limb([m(.4), E, H], robe ? 38 : 30, c.arm || c.skin);
  const w = k => [E[0] + (H[0] - E[0]) * k, E[1] + (H[1] - E[1]) * k];
  if (robe) { line([w(.72), w(.8)], 52, OUT); line([w(.72), w(.8)], 42, c.trim); }
  if (st.outfit === 'blazer') { line([w(.8), w(.86)], 40, OUT); line([w(.8), w(.86)], 30, c.cuff); }
  if (st.outfit === 'fitness') { line([w(.72), w(.8)], 40, OUT); line([w(.72), w(.8)], 30, c.band); }
  ell(H[0], H[1], 26, 24, c.skin, 6); }
function arm(st, c, s) { const fn = st.arms || (POSES[st.pose] || POSES.down); const pts = st.ik === false ? fn(s) : solveArm(fn(s)[0], fn(s)[2], fn(s)[1], s, st.breath || 0); drawArm(null, st, s, pts, c); }

// laugh bursts: a few wide "ha-ha-ha" openings (not a fast sine); u = seconds since the laugh started
function laughEnv(u) { if (u < 0) return 0; const bursts = [[0, .28], [.36, .26], [.7, .24], [1.05, .3]]; for (const [a, d] of bursts) if (u >= a && u < a + d) return .55 + .45 * Math.sin(Math.PI * (u - a) / d); return 0; }

function draw(gg, st) { g = gg; const c = palOf(st), E = st.moodFrom ? blendMood(MOODS[st.moodFrom] || MOODS.neutral, moodOf(st), clamp(st.moodK ?? 1)) : moodOf(st); g.save(); g.translate(st.x, st.y); g.rotate(st.lean || 0); g.scale(st.s || 1, st.s || 1); if (st.sq) g.scale(1 + (1 - st.sq) * .5, st.sq); g.globalAlpha = st.alpha ?? 1;
  const headT = () => { g.translate(0, -930 + (st.nod || 0) - (E.up || 0) * .4); g.rotate((st.tilt || 0) + (E.tilt || 0)); g.scale(1.2, 1.2); g.translate((st.look || 0) * 4, 930); };
  g.save(); headT(); hairBack(st, c); g.restore(); if (!st.seated) legs(st, c);
  const front = st.front ?? (st.pose === 'hold' || st.pose === 'desk' || st.pose === 'fists');
  if (!front) { arm(st, c, -1); arm(st, c, 1); } torso(st, c); if (front) { arm(st, c, -1); arm(st, c, 1); }
  g.save(); headT(); face(st, c); if (st.moustache) moustache(st, c); if (st.faceFx) st.faceFx(g, HY); hairFront(st, c); accessories(st, c); if (st.hairFx) st.hairFx(g, HY); if (st.cap) cap(st, c);
  if (st.sweat) { P(); g.moveTo(190, HY - 60); g.quadraticCurveTo(218, HY - 14, 204, HY + 6); g.quadraticCurveTo(190, HY + 20, 176, HY + 6); g.quadraticCurveTo(168, HY - 14, 190, HY - 60); fs('#8fd2ff', 5); } g.restore();
  g.restore(); }
// ---------- v3 smoothing helpers (for renderers) ----------
// attack / release are settle times in seconds (~95%: time constant = value / 3).
// follow(): STATELESS. Simulates the follower over the last `look` seconds, so it is deterministic for random access (stills)
// and identical across parallel render chunks. targetFn(t) -> number.
// o.maxRate (units/s) caps the speed so nothing jumps; o.onsetBelow: when rising from below this value the cap is lifted (true onsets snap open)
function follow(targetFn, t, attack = .05, release = .08, look = .45, step = 1 / 240, o = {}) { let x = targetFn(t - look);
  for (let u = t - look + step; u <= t + 1e-9; u += step) { const tg = targetFn(u), up = tg > x, tau = (up ? attack : release) / 3; let d = (tg - x) * (1 - Math.exp(-step / Math.max(1e-4, tau)));
    if (o.maxRate && !(up && o.onsetBelow != null && x < o.onsetBelow)) d = Math.max(-o.maxRate * step, Math.min(o.maxRate * step, d)); x += d; } return x; }
// smooth(): STATEFUL per id (for sequential renders); dt = frame time.
const SM = new Map();
function smooth(id, target, dt, attack = .05, release = .08) { if (!SM.has(id)) { SM.set(id, target); return target; } const x = SM.get(id), tau = (target > x ? attack : release) / 3, y = x + (target - x) * (1 - Math.exp(-dt / Math.max(1e-4, tau))); SM.set(id, y); return y; }
// envelope of a spoken line (array at fps) as a continuous function of absolute time, 0 outside the line
const envAt = (line, t, fps = 30) => { const f = (t - line.at) * fps; if (f < 0 || f > line.env.length - 1) return 0; const i = Math.floor(f), k = f - i; return (line.env[i] || 0) * (1 - k) + (line.env[i + 1] || 0) * k; };
// mouth for a line: smoothed openness (attack 50 ms / release 80 ms, rate-limited to 15%/frame except true onsets; closures become eased dips), roundness crossfade, nod on stressed syllables
function talk(line, t, seed = 0, o = {}) { if (!line) return {mouth: 0, round: .5, nod: 0};
  const e = u => envAt(line, u), mouth = follow(e, t, o.attack ?? .05, o.release ?? .08, .5, 1 / 240, {maxRate: o.maxRate ?? 4.2, onsetBelow: .12});   // <= 15% of the opening per frame at 30 fps, except true onsets
  const hsh2 = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }, round = follow(u => hsh2(Math.floor(u * 9) + seed) < .4 ? 1 : 0, t, .09, .09, .3);
  const nod = follow(u => 9 * clamp(e(u) - e(u - .1)), t, .08, .16, .4); return {mouth, round, nod}; }
// emotion blending: moodFn(t) -> mood name; returns {mood, moodFrom, moodK} with a blend over `dur` and blink=true around the switch
function moodAt(moodFn, t, dur = .25) { const m = moodFn(t); for (let d = 1 / 60; d <= dur; d += 1 / 60) { const p = moodFn(t - d); if (p !== m) { const k = (dur - d) / dur; return {mood: m, moodFrom: p, moodK: 1 - k, blink: d < .1}; } } return {mood: m, moodFrom: null, moodK: 1, blink: false}; }
module.exports = {draw, POSES, MOODS, OUTFITS, ik, solveArm, drawArm, palOf, laughEnv, follow, smooth, envAt, talk, moodAt, blendMood};
