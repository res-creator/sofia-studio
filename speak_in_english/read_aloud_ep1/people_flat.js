// Flat people (based on Anna v3, the channel's approved flat style). draw(g, st) with st.pal (colour overrides) and st.look2 = {hair:'long'|'short'|'curly', beard, mustache, glasses, cap, freckles}.
// Anna v3 — full-body flat cartoon (reference proportions: big egg head ≈ 1/3.4 of height, volumetric hair,
// trapezoid top, thin arms with mitten hands, straight jeans, big white sneakers). Origin = between the feet.
// draw(g, st): st = {x, y (ground), s, pose, mood, mouth, blink, look, brows, wide, sweat, alpha}
const OUT = '#2a1f1d', LW = 7;
const C = {skin: '#fcd5b8', skinS: '#efb491', blush: 'rgba(255,110,120,0.30)', hair: '#7a3a1e', hairS: '#5c2a14', hairL: '#a3582c',
  card: '#7ccfb6', cardS: '#5bb39a', tee: '#fffaf0', jeans: '#4a6fb5', jeansS: '#3a5a98', shoe: '#ffffff', shoeS: '#d9dde4', sole: '#e8ebf0', iris: '#3b2416', brow: '#4a2412', lips: '#d9566b'};
let g, LOOK = {};
const P = () => g.beginPath();
function fs(fill, lw = LW) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OUT; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
function shadeClip(pathFn, fn) { g.save(); pathFn(); g.clip(); fn(); g.restore(); }
function ell(x, y, rx, ry, fill, lw = LW) { P(); g.ellipse(x, y, rx, ry, 0, 0, 7); fs(fill, lw); }
function line(pts, w, col = OUT) { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function q(a, c, b, w = 6, col = OUT) { P(); g.moveTo(...a); g.quadraticCurveTo(...c, ...b); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); }

// ---------- head ----------
function headPath() { P(); g.moveTo(0, -1268); g.bezierCurveTo(88, -1268, 150, -1208, 150, -1118); g.bezierCurveTo(150, -1030, 122, -962, 66, -930);
  g.quadraticCurveTo(0, -902, -66, -930); g.bezierCurveTo(-122, -962, -150, -1030, -150, -1118); g.bezierCurveTo(-150, -1208, -88, -1268, 0, -1268); g.closePath(); }
function hairBack() { if (LOOK.hair && LOOK.hair !== 'long') return; P(); g.moveTo(-150, -1150); g.bezierCurveTo(-190, -1060, -196, -940, -184, -862); g.quadraticCurveTo(-170, -836, -140, -846);
  g.lineTo(140, -846); g.quadraticCurveTo(170, -836, 184, -862); g.bezierCurveTo(196, -940, 190, -1060, 150, -1150); g.closePath(); fs(C.hairS); }
function hairFront() {
  if (LOOK.hair === 'bald') { for (const s2 of [-1, 1]) { P(); g.ellipse(s2 * 146, -1110, 18, 46, 0, 0, 7); fs(C.hair, 5); } return; }
  if (LOOK.hair === 'bun') { ell(0, -1300, 62, 50, C.hair, 7); P(); g.moveTo(-154, -1060); g.bezierCurveTo(-170, -1220, -90, -1290, 0, -1290); g.bezierCurveTo(90, -1290, 170, -1220, 154, -1060); g.quadraticCurveTo(130, -1170, 40, -1196); g.quadraticCurveTo(-60, -1190, -130, -1150); g.quadraticCurveTo(-150, -1110, -154, -1060); g.closePath(); fs(C.hair); q([-60, -1270], [0, -1250], [60, -1270], 4); return; }
  if (LOOK.hair === 'swoop') { P(); g.moveTo(-154, -1070); g.bezierCurveTo(-176, -1230, -80, -1310, 20, -1306); g.bezierCurveTo(120, -1302, 178, -1230, 156, -1080); g.quadraticCurveTo(150, -1150, 120, -1170); g.quadraticCurveTo(60, -1150, 10, -1186); g.quadraticCurveTo(-40, -1150, -100, -1186); g.quadraticCurveTo(-140, -1150, -154, -1070); g.closePath(); fs(C.hair); P(); g.moveTo(-40, -1300); g.quadraticCurveTo(40, -1360, 70, -1290); fs(C.hair, 6); return; }
  if (LOOK.hair === 'short') { P(); g.moveTo(-152, -1080); g.bezierCurveTo(-170, -1220, -90, -1300, 0, -1300); g.bezierCurveTo(100, -1300, 172, -1220, 152, -1080); g.quadraticCurveTo(140, -1150, 110, -1176); g.quadraticCurveTo(20, -1150, -60, -1186); g.quadraticCurveTo(-130, -1170, -152, -1080); g.closePath(); fs(C.hair); return; }
  if (LOOK.hair === 'curly') { for (let k = 0; k <= 9; k++) { const a = Math.PI * (1.02 + k / 9 * .96); ell(Math.cos(a) * 150, -1130 + Math.sin(a) * 150, 46, 44, C.hair, 6); } ell(0, -1250, 110, 60, C.hair, 0); return; }

  // crown + side locks in one piece; bangs end above the brows and sweep to the left; ends flick outward at the shoulders
  P(); g.moveTo(-160, -1050); g.bezierCurveTo(-178, -1200, -104, -1304, 8, -1302); g.bezierCurveTo(128, -1300, 186, -1216, 174, -1090);
  g.bezierCurveTo(180, -1000, 184, -930, 198, -872); g.quadraticCurveTo(176, -856, 150, -872); g.bezierCurveTo(140, -940, 136, -1010, 140, -1090);
  g.bezierCurveTo(132, -1170, 100, -1196, 60, -1200); g.bezierCurveTo(10, -1206, -50, -1206, -96, -1190); g.bezierCurveTo(-128, -1176, -140, -1140, -138, -1090);
  g.bezierCurveTo(-138, -1010, -142, -940, -150, -884); g.quadraticCurveTo(-176, -860, -200, -876); g.bezierCurveTo(-182, -940, -172, -1000, -160, -1050); g.closePath();
  fs(C.hair);
  P(); g.moveTo(-80, -1258); g.quadraticCurveTo(0, -1286, 84, -1254); g.strokeStyle = C.hairL; g.lineWidth = 14; g.lineCap = 'round'; g.stroke();
  q([40, -1270], [0, -1236], [-40, -1206], 4); q([150, -1150], [158, -1060], [168, -960], 4); q([-150, -1150], [-158, -1060], [-166, -960], 4);
  P(); g.roundRect(84, -1236, 52, 22, 10); fs('#ffcc12', 5);
}
function cap() { if (!LOOK.cap) return; P(); g.moveTo(-158, -1130); g.bezierCurveTo(-160, -1260, -80, -1310, 0, -1310); g.bezierCurveTo(80, -1310, 160, -1260, 158, -1130); g.closePath(); fs(LOOK.cap); P(); g.moveTo(40, -1140); g.quadraticCurveTo(170, -1150, 230, -1120); g.quadraticCurveTo(170, -1110, 40, -1124); g.closePath(); fs(LOOK.cap); P(); g.roundRect(-34, -1250, 68, 48, 10); fs('#ffcc12', 4); }
function face(st) {
  const lk = (st.look || 0) * 10, R = st.wide ? 48 : 44, Ry = st.wide ? 54 : 50, ey = -1100;
  for (const s of [-1, 1]) { ell(s * 150, -1090, 18, 30, C.skin); q([s * 146, -1104], [s * 158, -1090], [s * 148, -1076], 4); }
  headPath(); fs(C.skin, 0); shadeClip(headPath, () => { ell(96, -1040, 72, 150, C.skinS, 0); }); headPath(); fs(null);
  // blush + freckles
  ell(-84, -1030, 26, 13, C.blush, 0); ell(84, -1030, 26, 13, C.blush, 0);
  if (LOOK.freckles !== false) for (const [a, b] of [[-74, -1046], [-60, -1036], [-88, -1034], [74, -1046], [60, -1036], [88, -1034]]) ell(a, b, 3.5, 3.5, '#c8784a', 0);
  // eyes
  for (const s of [-1, 1]) { const cx = s * 50;
    if (st.blink) { q([cx - 34, ey + 4], [cx, ey + 20], [cx + 34, ey + 4], LW); continue; }
    ell(cx, ey, R, Ry, '#ffffff', LW - 1);
    if (st.mood === 'sleepy') { g.save(); P(); g.ellipse(cx, ey, R, Ry, 0, 0, 7); g.clip(); g.fillStyle = C.skin; g.fillRect(cx - R, ey - Ry, R * 2, Ry * .95); g.restore(); line([[cx - R + 4, ey - 2], [cx + R - 4, ey - 2]], LW - 1); }
    const pr = st.wide ? 10 : 14; ell(cx + lk, ey + 8, pr, pr + 1, C.iris, 0); ell(cx + lk + 4, ey + 3, 4.5, 4.5, '#ffffff', 0);
    line([[cx + s * (R - 6), ey - Ry * .55], [cx + s * (R + 10), ey - Ry * .85]], 5); }
  // brows
  const by = ey - Ry - 18 - (st.brows === 'up' ? 14 : 0);
  for (const s of [-1, 1]) { const cx = s * 50, inner = st.brows === 'angry' ? 14 : st.brows === 'sad' ? -12 : 0;
    P(); g.moveTo(cx - s * 30, by + 6 + inner); g.quadraticCurveTo(cx, by - 8 + inner * .4, cx + s * 30, by + 4); g.strokeStyle = C.brow; g.lineWidth = 11; g.lineCap = 'round'; g.stroke(); }
  if (LOOK.beard) { P(); g.moveTo(-148, -1080); g.bezierCurveTo(-150, -990, -100, -912, 0, -900); g.bezierCurveTo(100, -912, 150, -990, 148, -1080); g.quadraticCurveTo(120, -1020, 60, -1012); g.quadraticCurveTo(0, -1030, -60, -1012); g.quadraticCurveTo(-120, -1020, -148, -1080); g.closePath(); fs(LOOK.beard, 6); }
  if (LOOK.mustache) { P(); g.moveTo(-50, -1000); g.quadraticCurveTo(0, -1030, 50, -1000); g.quadraticCurveTo(26, -1006, 0, -998); g.quadraticCurveTo(-26, -1006, -50, -1000); g.closePath(); fs(LOOK.mustache, 5); }
  if (LOOK.glasses) { for (const s of [-1, 1]) { P(); g.arc(s * 54, ey, 50, 0, 7); g.strokeStyle = OUT; g.lineWidth = 8; g.stroke(); } line([[-4, ey - 4], [4, ey - 4]], 7); }
  if (st.twitch) for (let i = 0; i < 3; i++) line([[118 + i * 6, ey - 50 + i * 30], [150 + i * 6, ey - 58 + i * 30]], 6);
  // nose + mouth
  q([2, -1050], [16, -1034], [-2, -1028], 5);
  const my = -985, m = st.mouth || 0;
  if (st.tongue) { P(); g.moveTo(-34, my - 6); g.quadraticCurveTo(0, my - 12, 34, my - 6); g.quadraticCurveTo(30, my + 30, 0, my + 34); g.quadraticCurveTo(-30, my + 30, -34, my - 6); fs('#7a2230', LW - 1);
    P(); g.moveTo(-22, my + 6); g.lineTo(22, my + 6); g.lineTo(22, my + 60); g.quadraticCurveTo(0, my + 84, -22, my + 60); g.closePath(); fs('#f07a8a', 6); line([[0, my + 14], [0, my + 50]], 4); }
  else if (m > .12) { const h = 8 + m * 28; P(); g.moveTo(-28, my - 4); g.quadraticCurveTo(0, my - 10, 28, my - 4); g.quadraticCurveTo(24, my + h, 0, my + h + 4); g.quadraticCurveTo(-24, my + h, -28, my - 4); fs('#7a2230', LW - 1); ell(0, my + h * .72, 12, h * .24, '#e8707e', 0); }
  else if (st.mood === 'flat' || st.mood === 'sleepy') line([[-16, my], [16, my]], 6);
  else if (st.mood === 'sad') q([-20, my + 8], [0, my - 6], [20, my + 8], 6);
  else if (st.mood === 'o') ell(0, my + 4, 11, 13, '#7a2230', LW - 1);
  else q([-22, my - 4], [0, my + 12], [22, my - 4], 6, C.lips);
  if (st.sweat) { P(); g.moveTo(168, -1170); g.quadraticCurveTo(190, -1130, 180, -1112); g.quadraticCurveTo(168, -1100, 156, -1112); g.quadraticCurveTo(150, -1130, 168, -1170); fs('#8fd2ff', 4); }
}
// ---------- body ----------
const POSES = { // [shoulder, elbow, hand, handAngle] per side (s=-1 left of screen, +1 right)
  desk: s => [[s * 112, -846], [s * 176, -690], [s * 70, -590], s > 0 ? Math.PI : 0],
  cheer: s => [[s * 112, -846], [s * 210, -950], [s * 250, -1110], -Math.PI / 2],
  down: s => [[s * 112, -846], [s * 142, -700], [s * 150, -556], Math.PI / 2],
  hips: s => [[s * 112, -846], [s * 196, -730], [s * 122, -640], s > 0 ? Math.PI * .9 : Math.PI * .1],
  wave: s => s > 0 ? [[112, -846], [220, -930], [236, -1080], -Math.PI / 2] : POSES.down(s),
  phone: s => s > 0 ? [[112, -846], [196, -800], [150, -1040], -Math.PI * .6] : POSES.down(s),
  shrug: s => [[s * 112, -846], [s * 190, -760], [s * 250, -840], s > 0 ? -Math.PI * .25 : -Math.PI * .75],
  point: s => s > 0 ? [[112, -846], [230, -860], [340, -900], -.3] : POSES.down(s),
  face: s => [[s * 112, -846], [s * 180, -820], [s * 110, -1010], -Math.PI / 2],
  hold: s => [[s * 112, -846], [s * 150, -730], [s * 60, -690], s > 0 ? Math.PI : 0],
};
function arm(pose, s) { const [S, E, Hh, ang] = POSES[pose || 'down'](s);
  line([S, E, Hh], 52, OUT); line([S, E, Hh], 38, C.card);
  // cuff
  const dx = Hh[0] - E[0], dy = Hh[1] - E[1], L = Math.hypot(dx, dy) || 1, cx = Hh[0] - dx / L * 18, cy = Hh[1] - dy / L * 18; line([[cx - dy / L * 22, cy + dx / L * 22], [cx + dy / L * 22, cy - dx / L * 22]], 5);
  // mitten hand
  g.save(); g.translate(Hh[0], Hh[1]); g.rotate(ang); g.scale(1.3, 1.3 * s);
  P(); g.moveTo(-6, -22); g.bezierCurveTo(20, -30, 46, -20, 46, 2); g.bezierCurveTo(46, 24, 20, 30, -6, 22); g.closePath(); fs(C.skin, 6);
  P(); g.moveTo(4, -22); g.quadraticCurveTo(18, -44, 30, -34); g.quadraticCurveTo(28, -22, 18, -16); fs(C.skin, 5);
  line([[30, -4], [44, -3]], 4); line([[28, 8], [42, 10]], 4); g.restore();
}
function legs() {
  for (const s of [-1, 1]) {
    P(); g.moveTo(s * 18, -545); g.lineTo(s * 118, -545); g.lineTo(s * 108, -46); g.lineTo(s * 38, -46); g.closePath(); fs(C.jeans);
    shadeClip(() => { P(); g.moveTo(s * 18, -545); g.lineTo(s * 118, -545); g.lineTo(s * 108, -46); g.lineTo(s * 38, -46); g.closePath(); }, () => { g.fillStyle = C.jeansS; g.fillRect(s > 0 ? 84 : -40, -545, 40, 560); });
    P(); g.moveTo(s * 18, -545); g.lineTo(s * 118, -545); g.lineTo(s * 108, -46); g.lineTo(s * 38, -46); g.closePath(); fs(null);
    // sneaker
    const fx = s * 74 + s * 8; P(); g.moveTo(fx - 56, -12); g.bezierCurveTo(fx - 58, -46, fx - 40, -62, fx - 8, -62); g.bezierCurveTo(fx + 30, -62, fx + 58, -44, fx + 60, -12); g.closePath(); fs(C.shoe);
    P(); g.roundRect(fx - 62, -18, 124, 20, 10); fs(C.sole, 5); line([[fx - 24, -50], [fx + 6, -44]], 4); line([[fx - 18, -38], [fx + 10, -32]], 4);
  }
}
function torso() {
  // neck
  P(); g.moveTo(-24, -940); g.lineTo(24, -940); g.lineTo(26, -860); g.lineTo(-26, -860); g.closePath(); fs(C.skinS, 6);
  // tee
  P(); g.moveTo(-60, -868); g.lineTo(60, -868); g.lineTo(70, -548); g.lineTo(-70, -548); g.closePath(); fs(C.tee, 6);
  q([-34, -866], [0, -840], [34, -866], 5);
  if (LOOK.tie) { P(); g.moveTo(-12, -862); g.lineTo(12, -862); g.lineTo(20, -640); g.lineTo(0, -610); g.lineTo(-20, -640); g.closePath(); fs(LOOK.tie, 5); }
  if (LOOK.hoodie) { const hp = () => { P(); g.moveTo(-60, -880); g.bezierCurveTo(-110, -884, -128, -860, -134, -830); g.lineTo(-150, -536); g.quadraticCurveTo(0, -520, 150, -536); g.lineTo(134, -830); g.bezierCurveTo(128, -860, 110, -884, 60, -880); g.quadraticCurveTo(0, -840, -60, -880); g.closePath(); };
    P(); g.ellipse(0, -880, 96, 30, 0, 0, 7); fs(C.cardS, 6); hp(); fs(C.card, 0); shadeClip(hp, () => { g.fillStyle = C.cardS; g.fillRect(110, -900, 50, 380); }); hp(); fs(null);
    P(); g.roundRect(-80, -680, 160, 100, 20); fs(C.cardS, 5); line([[-16, -860], [-20, -790]], 5); line([[16, -860], [20, -790]], 5); line([[-118, -546], [118, -546]], 6); return; }
  // cardigan (two panels)
  for (const s of [-1, 1]) { const path = () => { P(); g.moveTo(s * 34, -872); g.bezierCurveTo(s * 80, -884, s * 116, -872, s * 128, -840); g.lineTo(s * 144, -536); g.quadraticCurveTo(s * 100, -524, s * 50, -530); g.lineTo(s * 40, -760); g.closePath(); };
    path(); fs(C.card, 0); shadeClip(path, () => { g.fillStyle = C.cardS; g.fillRect(s > 0 ? 112 : -144, -900, 40, 380); }); path(); fs(null);
    for (let k = 0; k < 3; k++) ell(s * 52, -800 + k * 60, 6, 6, '#ffffff', 3); }
  // belt line of jeans
  line([[-118, -546], [118, -546]], 6);
}
function draw(gg, st) { g = gg; LOOK = st.look2 || {}; const SAVED = {...C}; Object.assign(C, st.pal || {}); g.save(); g.translate(st.x, st.y); g.scale(st.s || 1, st.s || 1); g.globalAlpha = st.alpha ?? 1;
  const pose = st.pose || 'down', back = POSES[pose](1)[2][1] < -900 && pose !== 'phone';
  const front = pose === 'desk' || pose === 'hold'; hairBack(); if (!st.seated) legs(); if (!front) { arm(pose, -1); if (pose !== 'face' && pose !== 'phone') arm(pose, 1); } torso(); if (front) { arm(pose, -1); arm(pose, 1); } hairFront && null;
  face(st); hairFront(); cap(); if (pose === 'face') { arm(pose, -1); arm(pose, 1); } if (pose === 'phone') { P(); g.roundRect(118, -1110, 44, 90, 10); fs('#2b2b33', 5); arm(pose, 1); }
  g.restore(); Object.assign(C, SAVED); }
module.exports = {draw, C, POSES};
