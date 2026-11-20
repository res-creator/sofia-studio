// Parametric hand-drawn people for the sketch rubrics (new characters every episode).
// person(spec, st): spec = look (colours, hair, clothes, accessories); st = animation (x, by, pose, mood, mouth, blink, look, poseK, prevPose).
const K = require('./hand_kit');
const CA = require('./cast');
const {draw: DR, stroke, spot, potato: P, tube} = K;

function hairBack(s, x, hy) {
  const h = s.hair || {}; if (!h.style) return;
  const c = {fill: h.c, shade: h.cS || h.c, seed: 3010, lw: 7};
  if (h.style === 'long') { DR([[x - 160, hy - 60], [x - 190, hy + 120], [x - 170, hy + 260], [x + 170, hy + 260], [x + 190, hy + 120], [x + 160, hy - 60]], c); }
  if (h.style === 'bob') DR([[x - 160, hy - 80], [x - 176, hy + 80], [x - 150, hy + 150], [x + 150, hy + 150], [x + 176, hy + 80], [x + 160, hy - 80]], c);
  if (h.style === 'curly') for (let k = 0; k < 11; k++) { const a = Math.PI * (0.9 + k / 10 * 1.2); DR(P(x + Math.cos(a) * 158, hy - 20 + Math.sin(a) * 158, 60, 56, 3020 + k, .12), {...c, seed: 3040 + k}); }
  if (h.style === 'bun') DR(P(x, hy - 200, 70, 56, 3060, .1), {...c, seed: 3061});
}
function hairFront(s, x, hy) {
  const h = s.hair || {}; if (!h.style || h.style === 'bald') { if (h.style === 'bald') for (const q of [-1, 1]) DR(P(x + q * 132, hy - 10, 30, 50, 3070 + q, .12), {fill: h.c, seed: 3072 + q, lw: 6}); return; }
  const c = {fill: h.c, shade: h.cS || h.c, shadeDir: [0, 12], seed: 3080, lw: 8};
  if (h.style === 'curly') { for (let k = 0; k < 6; k++) DR(P(x - 110 + k * 44, hy - 112 + Math.abs(k - 2.5) * 10, 40, 36, 3090 + k, .12), {...c, seed: 3100 + k, lw: 6}); return; }
  if (h.style === 'spiky') { const pts = []; for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; pts.push([x + Math.cos(a) * 150 * (k % 2 ? 1.12 : 1), hy - 30 + Math.sin(a) * 160 * (k % 2 ? 1.12 : 1)]); } DR(pts.concat([[x + 120, hy - 60], [x - 120, hy - 60]]), c); return; }
  // short / long / bob / bun share a cap with a side fringe
  DR([[x - 150, hy + (h.style === 'short' ? -20 : 10)], [x - 156, hy - 80], [x - 110, hy - 150], [x - 30, hy - 182], [x + 50, hy - 180], [x + 118, hy - 146], [x + 156, hy - 76], [x + 150, hy + (h.style === 'short' ? -20 : 10)], [x + 128, hy - 50], [x + 70, hy - 84], [x, hy - 92], [x - 70, hy - 76], [x - 128, hy - 50]], c);
}
function person(s, st) {
  const x = st.x, by = st.by || 0, sy = 1215 + by, hy = 960 + by, b = s.bottom || {c: '#3a4866', cS: '#27324a', type: 'pants'}, t = s.top || {c: '#9aa8b8', cS: '#7a889a'};
  const wide = s.wide || 1;
  if (b.type === 'skirt') CA.legs(x, 1470, 1690, s.skin, s.skinS, s.shoe || '#3a2a2a', s.shoeS || '#221818', 3200, 40);
  else CA.legs(x, 1470, 1690, b.c, b.cS, s.shoe || '#3a2a2a', s.shoeS || '#221818', 3200, 48);
  hairBack(s, x, hy);
  if (s.tail) DR([[x - 96 * wide, sy + 100], [x + 96 * wide, sy + 100], [x + 120 * wide, 1600], [x - 120 * wide, 1600]], {fill: t.c, shade: t.cS, seed: 3205, lw: 7});
  DR([[x - 104 * wide, sy - 25], [x + 104 * wide, sy - 25], [x + 138 * wide, 1490], [x - 136 * wide, 1494]], {fill: t.c, shade: t.cS, seed: 3210, lw: 8});
  if (b.type === 'skirt') DR([[x - 130 * wide, 1400], [x + 130 * wide, 1396], [x + 160 * wide, 1560], [x - 158 * wide, 1564]], {fill: b.c, shade: b.cS, seed: 3211, lw: 7});
  if (s.waistcoat) for (const q of [-1, 1]) DR([[x + q * 20, sy - 10], [x + q * 100 * wide, sy - 20], [x + q * 120 * wide, 1440], [x + q * 20, 1460]], {fill: s.waistcoat, seed: 3212 + q, lw: 6});
  if (s.apron) DR([[x - 84, sy + 110], [x + 84, sy + 110], [x + 112, 1500], [x - 110, 1502]], {fill: s.apron, shade: s.apronS || s.apron, seed: 3214, lw: 6});
  if (s.tie) DR([[x - 16, sy - 12], [x + 16, sy - 12], [x + 24, sy + 200], [x, sy + 230], [x - 24, sy + 200]], {fill: s.tie, seed: 3215, lw: 5});
  if (s.label) { DR(K.rr(x - 92, sy + 70, 184, 110, 16), {fill: '#fffaf0', seed: 3216, lw: 5}); const g = K.g; g.save(); g.font = `${s.label.length > 5 ? 56 : 76}px ${K.FONT}`; let f = s.label.length > 5 ? 56 : 76; while (g.measureText(s.label).width > 168) { f -= 2; g.font = `${f}px ${K.FONT}`; } g.restore(); K.hand(s.label, x, sy + 126, f, s.labelC || '#c0283a'); }
  CA.arms(st, x, sy, t.c, t.cS, s.skin, s.skinS, 3220, 42, 34);
  DR(tube([[x, hy + 120], [x, sy - 20]], 48, 54), {fill: s.skinS, seed: 3230, lw: 6});
  if (s.pearls) for (let k = 0; k < 9; k++) DR(P(x - 70 + k * 17.5, sy - 4 + Math.sin(k / 8 * Math.PI) * 30, 9, 9, 3240 + k), {fill: '#fffaf0', seed: 3250 + k, lw: 3});
  // head
  const fw = s.fw || 138, fh = s.fh || 150;
  for (const q of [-1, 1]) DR(P(x + q * (fw + 6), hy + 34, 18, 26, 3260 + q, .15), {fill: s.skin, shade: s.skinS, seed: 3262 + q, lw: 6});
  DR(P(x, hy + 22, fw, fh, 3264, .05), {fill: s.skin, shade: s.skinS, shadeDir: [16, 12], seed: 3265, lw: 8});
  if (s.beard) DR([[x - fw + 6, hy + 30], [x - fw + 20, hy + 120], [x - 60, hy + 166], [x, hy + 180], [x + 60, hy + 166], [x + fw - 20, hy + 120], [x + fw - 6, hy + 30], [x + 90, hy + 92], [x, hy + 90], [x - 90, hy + 92]], {fill: s.beard, seed: 3266, lw: 6});
  if (s.stubble) spot(x, hy + 120, 100, 50, 'rgba(60,40,30,0.18)');
  hairFront(s, x, hy);
  spot(x - 94, hy + 82, 34, 20, s.blush || 'rgba(255,90,120,0.32)'); spot(x + 94, hy + 82, 34, 20, s.blush || 'rgba(255,90,120,0.32)');
  CA.eyes(x, hy + 14, st, {dx: 54, rx: 26, ry: 30, iris: s.iris || '#3a2620', lashes: !!s.lashes, brow: (s.hair && s.hair.c) || '#3a2620', browW: s.lashes ? 6 : 8, skin: s.skin});
  if (s.glasses) for (const q of [-1, 1]) DR(P(x + q * 54, hy + 14, 42, 40, 3270 + q, .03), {lw: 6, seed: 3272 + q, col: s.glasses});
  if (s.monocle) { DR(P(x + 54, hy + 14, 44, 44, 3274, .02), {lw: 7, seed: 3275, col: '#c99128'}); K.stroke([[x + 96, hy + 30], [x + 120, hy + 200]], 3, 3276); }
  DR(P(x + 4, hy + 62, 18, 24, 3277, .14), {fill: s.skinS, seed: 3278, lw: 6});
  if (s.mustache) DR([[x - 60, hy + 92], [x, hy + 80], [x + 60, hy + 92], [x + 40, hy + 104], [x, hy + 96], [x - 40, hy + 104]], {fill: s.mustache, seed: 3279, lw: 5});
  CA.mouth(x, hy + 112, st, s.lips || null, 3280);
  if (s.hat === 'top') { DR(K.rr(x - 100, hy - 330, 200, 200, 14), {fill: '#2b2b33', seed: 3290, lw: 7}); DR(P(x, hy - 130, 170, 26, 3291), {fill: '#2b2b33', seed: 3292, lw: 7}); }
  if (s.hat === 'lady') { DR(P(x, hy - 140, 200, 40, 3293, .06), {fill: s.hatC || '#b06ab8', seed: 3294, lw: 7}); DR(P(x, hy - 190, 110, 70, 3295, .08), {fill: s.hatC || '#b06ab8', seed: 3296, lw: 7}); DR(P(x + 70, hy - 210, 26, 26, 3297), {fill: '#ff8fb0', seed: 3298, lw: 4}); }
  if (s.hat === 'cap') { DR([[x - 150, hy - 70], [x - 140, hy - 160], [x - 60, hy - 200], [x + 60, hy - 200], [x + 140, hy - 160], [x + 150, hy - 70]], {fill: s.hatC || '#3cb371', seed: 3299, lw: 7}); DR([[x + 60, hy - 80], [x + 240, hy - 70], [x + 230, hy - 40], [x + 60, hy - 50]], {fill: s.hatC || '#3cb371', seed: 3300, lw: 6}); }
}
module.exports = {person};
