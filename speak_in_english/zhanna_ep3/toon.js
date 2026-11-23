// "Toon" character kit: thin even outline, very big touching eyes with small pupils, thick separate brows,
// wide expressive mouth with teeth, big C-ears, thin limbs, chunky sneakers. Original characters (style-inspired, not copies).
// draw(g, st): st = {x, y (ground), s, pal, hair, glasses, pose, mood, mouth, blink, look, sweat, tongue, seated, skirt, alpha}
const OUT = '#2a2230', LW = 7;
let g;
const P = () => g.beginPath();
function fs(fill, lw = LW) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OUT; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = LW, rot = 0) { P(); g.ellipse(x, y, rx, ry, rot, 0, 7); fs(fill, lw); }
function line(pts, w, col = OUT) { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function q(a, c, b, w = 7, col = OUT) { P(); g.moveTo(...a); g.quadraticCurveTo(...c, ...b); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); }
function limb(pts, w, col) { line(pts, w + LW * 2, OUT); line(pts, w, col); }

// ---------- head ----------
const HY = -1040; // head centre
function headPath() { P(); g.moveTo(0, HY - 165); g.bezierCurveTo(105, HY - 165, 150, HY - 110, 152, HY - 20); g.bezierCurveTo(154, HY + 70, 110, HY + 135, 30, HY + 150);
  g.quadraticCurveTo(0, HY + 156, -30, HY + 150); g.bezierCurveTo(-110, HY + 135, -154, HY + 70, -152, HY - 20); g.bezierCurveTo(-150, HY - 110, -105, HY - 165, 0, HY - 165); g.closePath(); }
function hairBack(st, c) { const h = st.hair;
  if (h === 'ponytail') { P(); g.moveTo(70, HY - 150); g.quadraticCurveTo(190, HY - 260, 250, HY - 170); g.lineTo(215, HY - 150); g.lineTo(270, HY - 95); g.lineTo(215, HY - 100); g.lineTo(240, HY - 40); g.quadraticCurveTo(150, HY - 80, 110, HY - 110); g.closePath(); fs(c.hair); ell(105, HY - 140, 22, 22, c.tie || '#e05a2a', 5); }
  if (h === 'long') { P(); g.moveTo(-160, HY - 40); g.lineTo(-175, HY + 190); g.lineTo(175, HY + 190); g.lineTo(160, HY - 40); g.closePath(); fs(c.hairS || c.hair); }
  if (h === 'bouffant') { P(); g.moveTo(-200, HY + 210); g.bezierCurveTo(-260, HY + 60, -250, HY - 190, -120, HY - 245); g.bezierCurveTo(-40, HY - 280, 60, HY - 280, 130, HY - 245); g.bezierCurveTo(250, HY - 190, 270, HY + 60, 210, HY + 210); g.quadraticCurveTo(260, HY + 250, 230, HY + 270); g.quadraticCurveTo(150, HY + 250, 160, HY + 200); g.lineTo(-160, HY + 200); g.quadraticCurveTo(-150, HY + 250, -230, HY + 270); g.quadraticCurveTo(-260, HY + 250, -200, HY + 210); g.closePath(); fs(c.hairS || c.hair); q([-170, HY - 120], [-210, HY + 40], [-180, HY + 170], 5); q([180, HY - 120], [220, HY + 40], [190, HY + 170], 5); }
  if (h === 'bun') { ell(0, HY - 215, 105, 95, c.hair); q([-40, HY - 250], [0, HY - 230], [40, HY - 250], 5); q([-60, HY - 200], [0, HY - 180], [50, HY - 205], 5); } }
function hairFront(st, c) { const h = st.hair;
  if (h === 'spiky') { P(); g.moveTo(-158, HY - 10); g.lineTo(-170, HY - 90); g.lineTo(-205, HY - 120); g.lineTo(-150, HY - 150); g.lineTo(-150, HY - 200); g.lineTo(-80, HY - 185); g.lineTo(-40, HY - 245); g.lineTo(20, HY - 195);
    g.lineTo(90, HY - 240); g.lineTo(110, HY - 180); g.lineTo(185, HY - 175); g.lineTo(150, HY - 120); g.lineTo(195, HY - 70); g.lineTo(150, HY - 55); g.lineTo(150, HY - 10); g.lineTo(120, HY - 95); g.lineTo(40, HY - 120); g.lineTo(-30, HY - 100); g.lineTo(-110, HY - 120); g.closePath(); fs(c.hair);
    q([10, HY - 240], [30, HY - 290], [60, HY - 270], 6); }
  else if (h === 'bouffant') { P(); g.moveTo(-170, HY + 10); g.bezierCurveTo(-200, HY - 170, -60, HY - 250, 40, HY - 230); g.bezierCurveTo(160, HY - 220, 210, HY - 120, 170, HY + 10); g.quadraticCurveTo(150, HY - 80, 90, HY - 105);
    g.quadraticCurveTo(30, HY - 60, -40, HY - 100); g.quadraticCurveTo(-110, HY - 70, -170, HY + 10); g.closePath(); fs(c.hair); q([-40, HY - 200], [40, HY - 230], [120, HY - 170], 6); q([-120, HY - 150], [-60, HY - 190], [0, HY - 170], 5); }
  else if (h === 'ponytail' || h === 'long') { P(); g.moveTo(-160, HY + 20); g.bezierCurveTo(-175, HY - 120, -100, HY - 185, 0, HY - 182); g.bezierCurveTo(100, HY - 185, 172, HY - 120, 160, HY + 20); g.lineTo(140, HY - 40);
    g.quadraticCurveTo(110, HY - 110, 20, HY - 110); g.lineTo(0, HY - 60); g.lineTo(-30, HY - 112); g.quadraticCurveTo(-120, HY - 105, -140, HY - 40); g.closePath(); fs(c.hair);
    }
  else if (h === 'bun' || h === 'short') { P(); g.moveTo(-156, HY - 10); g.bezierCurveTo(-170, HY - 130, -90, HY - 182, 0, HY - 180); g.bezierCurveTo(90, HY - 182, 170, HY - 130, 156, HY - 10); g.quadraticCurveTo(140, HY - 90, 60, HY - 112);
    g.quadraticCurveTo(-20, HY - 95, -70, HY - 120); g.quadraticCurveTo(-140, HY - 95, -156, HY - 10); g.closePath(); fs(c.hair); }
  else if (h === 'curly') { for (let k = 0; k < 9; k++) { const a = Math.PI * (1.02 + k / 8 * .96); ell(Math.cos(a) * 150, HY - 30 + Math.sin(a) * 150, 46, 42, c.hair, 6); } ell(0, HY - 150, 120, 50, c.hair, 0); } }
function face(st, c) {
  for (const s of [-1, 1]) { ell(s * 150, HY + 10, 26, 40, c.skin); q([s * 146, HY - 6], [s * 160, HY + 10], [s * 148, HY + 28], 5); }
  headPath(); fs(c.skin);
  g.save(); headPath(); g.clip(); ell(110, HY + 40, 70, 160, c.skinS, 0); g.restore(); headPath(); fs(null);
  // eyes: big touching ovals, small pupils
  const look = (st.look || 0) * 14, wide = st.mood === 'surprised' ? 1.1 : 1, ey = HY - 30;
  for (const s of [-1, 1]) { const cx = s * 50;
    if (st.blink || st.mood === 'happy') { q([cx - 40, ey + 6], [cx, ey - 18], [cx + 40, ey + 6], LW); continue; }
    ell(cx, ey, 50 * wide, 70 * wide, '#ffffff', LW);
    if (st.mood === 'sleepy' || st.mood === 'smug') { g.save(); P(); g.ellipse(cx, ey, 52, 64, 0, 0, 7); g.clip(); g.fillStyle = c.skin; g.fillRect(cx - 60, ey - 70, 120, 62); g.restore(); line([[cx - 48, ey - 8], [cx + 48, ey - 8]], LW); }
    if (st.lashes) for (let j = 0; j < 3; j++) line([[cx + s * (26 + j * 12), ey - 62 + j * 14], [cx + s * (44 + j * 18), ey - 84 + j * 12]], 6);
    const pr = st.mood === 'surprised' ? 8 : 11; ell(cx + look - s * 6, ey + 8, pr, pr * 1.4, OUT, 0); }
  if (st.glasses) { for (const s of [-1, 1]) { P(); g.ellipse(s * 56, ey + 4, 60, 56, 0, 0, 7); g.strokeStyle = OUT; g.lineWidth = 5; g.stroke(); } line([[-150, ey - 6], [-116, ey]], 5); line([[150, ey - 6], [116, ey]], 5); }
  // brows: thick, separate from the eyes
  const by = ey - 100 - (st.mood === 'surprised' ? 16 : 0);
  for (const s of [-1, 1]) { const cx = s * 56, tilt = st.mood === 'angry' ? 18 : st.mood === 'sad' ? -16 : st.brows === 'up' ? -6 : 0;
    P(); g.moveTo(cx - s * 34, by + tilt); g.quadraticCurveTo(cx, by - 14, cx + s * 34, by - tilt * .3); g.strokeStyle = c.brow || OUT; g.lineWidth = 15; g.lineCap = 'round'; g.stroke(); }
  if (st.earrings) for (const q2 of [-1, 1]) { P(); g.roundRect(q2 * 152 - 14, HY + 44, 28, 34, 8); fs(st.earrings, 5); }
  // nose + blush
  ell(4, HY + 40, 14, 11, c.skinS, 5);
  if (st.blush !== false) { ell(-92, HY + 60, 22, 11, 'rgba(255,120,110,0.28)', 0); ell(92, HY + 60, 22, 11, 'rgba(255,120,110,0.28)', 0); }
  // mouth
  const my = HY + 92, m = st.mouth || 0;
  if (st.tongue) { P(); g.moveTo(-50, my - 6); g.quadraticCurveTo(0, my - 14, 50, my - 6); g.quadraticCurveTo(40, my + 46, 0, my + 50); g.quadraticCurveTo(-40, my + 46, -50, my - 6); fs('#7a2230');
    P(); g.moveTo(-26, my + 12); g.lineTo(26, my + 12); g.lineTo(26, my + 70); g.quadraticCurveTo(0, my + 96, -26, my + 70); g.closePath(); fs('#f07a8a', 6); }
  else if (m > .12 || st.mood === 'grin') { const h = st.mood === 'grin' ? 44 : 14 + m * 46, w = 62;
    P(); g.moveTo(-w, my - 8); g.quadraticCurveTo(0, my - 2, w, my - 8); g.quadraticCurveTo(w * .8, my + h, 0, my + h + 6); g.quadraticCurveTo(-w * .8, my + h, -w, my - 8); g.closePath(); fs('#7a2230');
    g.save(); g.clip(); g.fillStyle = '#ffffff'; g.fillRect(-w, my - 10, w * 2, Math.min(18, h * .45)); ell(0, my + h + 2, w * .5, h * .35, '#f07a8a', 0); g.restore();
    P(); g.moveTo(-w, my - 8); g.quadraticCurveTo(0, my - 2, w, my - 8); g.quadraticCurveTo(w * .8, my + h, 0, my + h + 6); g.quadraticCurveTo(-w * .8, my + h, -w, my - 8); g.closePath(); fs(null);
  }
  else if (st.mood === 'sad' || st.mood === 'angry') q([-30, my + 10], [0, my - 8], [30, my + 10], 7);
  else if (st.mood === 'surprised') ell(0, my + 6, 16, 20, '#7a2230', 6);
  else if (st.mood === 'flat' || st.mood === 'sleepy') line([[-24, my], [24, my]], 7);
  else if (st.mood === 'smug') q([-34, my + 4], [10, my + 16], [40, my - 10], c.lip ? 12 : 7, c.lip || OUT);
  else q([-38, my - 4], [0, my + 20], [38, my - 4], c.lip ? 12 : 7, c.lip || OUT);
  if (false) { P(); g.moveTo(175, HY - 120); g.quadraticCurveTo(200, HY - 76, 188, HY - 58); g.quadraticCurveTo(175, HY - 46, 162, HY - 58); g.quadraticCurveTo(156, HY - 76, 175, HY - 120); fs('#8fd2ff', 5); }
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
function arm(st, c, s) { const [S, E, H] = st.arms ? st.arms(s) : (POSES[st.pose] || POSES.down)(s); limb([S, [S[0] + (E[0] - S[0]) * .45, S[1] + (E[1] - S[1]) * .45]], 46, c.top); limb([[S[0] + (E[0] - S[0]) * .4, S[1] + (E[1] - S[1]) * .4], E, H], c.armW || 30, c.arm || c.skin); ell(H[0], H[1], 26, 24, c.skin, 6); }
function legs(st, c) { for (const s of [-1, 1]) { limb([[s * 40, -580], [s * 46, -90]], 44, c.legs || c.bottom);
    P(); g.moveTo(s * 46 - 50 + (s > 0 ? 24 : -24), -20); g.bezierCurveTo(s * 46 - 50 + (s > 0 ? 24 : -24), -90, s * 46 + 50 + (s > 0 ? 24 : -24), -100, s * 46 + 60 + (s > 0 ? 24 : -24), -30); g.lineTo(s * 46 + 60 + (s > 0 ? 24 : -24), 0); g.lineTo(s * 46 - 50 + (s > 0 ? 24 : -24), 0); g.closePath(); fs(c.shoe || '#ffffff');
    line([[s * 46 - 50 + (s > 0 ? 24 : -24), -12], [s * 46 + 60 + (s > 0 ? 24 : -24), -12]], 6, c.sole || '#e05a2a'); }
  if (c.shorts) { P(); g.moveTo(-96, -580); g.lineTo(96, -580); g.lineTo(104, -400); g.lineTo(8, -392); g.lineTo(0, -470); g.lineTo(-8, -392); g.lineTo(-104, -400); g.closePath(); fs(c.shorts); line([[60, -575], [66, -405]], 5, c.stripe || '#ffffff'); line([[-60, -575], [-66, -405]], 5, c.stripe || '#ffffff'); } }
function torso(st, c) {
  limb([[0, -930], [0, -860]], 34, c.skin);
  P(); g.moveTo(-82, -880); g.quadraticCurveTo(0, -895, 82, -880); g.lineTo(96, -560); g.quadraticCurveTo(0, -548, -96, -560); g.closePath(); fs(c.top);
  g.save(); g.clip(); g.fillStyle = c.topS || c.top; g.fillRect(60, -900, 60, 360); g.restore(); P(); g.moveTo(-82, -880); g.quadraticCurveTo(0, -895, 82, -880); g.lineTo(96, -560); g.quadraticCurveTo(0, -548, -96, -560); g.closePath(); fs(null);
  q([-34, -882], [0, -856], [34, -882], 6, c.collar || OUT);
  if (c.whistle) { line([[-34, -880], [-6, -760], [34, -880]], 4, c.whistle); P(); g.roundRect(-22, -768, 40, 22, 8); fs('#c8ccd4', 4); }
  if (c.label) { g.fillStyle = '#ffffff'; g.font = '900 44px NBL'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c.label, 0, -660); }
  if (c.pocket) { P(); g.roundRect(-56, -700, 112, 70, 14); fs(c.topS || c.top, 5); }
  if (c.tie) { P(); g.moveTo(-12, -876); g.lineTo(12, -876); g.lineTo(20, -680); g.lineTo(0, -650); g.lineTo(-20, -680); g.closePath(); fs(c.tie, 5); }
  if (st.skirt || c.skirt) { P(); g.moveTo(-96, -580); g.lineTo(96, -580); g.lineTo(140, -380); g.quadraticCurveTo(0, -360, -140, -380); g.closePath(); fs(c.skirt || c.bottom); for (const xx of [-50, 0, 50]) line([[xx, -560], [xx * 1.3, -390]], 4); }
  else { P(); g.moveTo(-96, -570); g.lineTo(96, -570); g.lineTo(90, -520); g.lineTo(-90, -520); g.closePath(); fs(c.bottom); }
}
function draw(gg, st) { g = gg; const c = st.pal; g.save(); g.translate(st.x, st.y); g.scale(st.s || 1, st.s || 1); if (st.sq) g.scale(1 + (1 - st.sq) * .5, st.sq); g.globalAlpha = st.alpha ?? 1;
  g.save(); g.translate(0, -930); g.rotate(st.tilt || 0); g.scale(1.2, 1.2); g.translate(0, 930); hairBack(st, c); g.restore(); if (!st.seated) legs(st, c);
  const front = st.front ?? (st.pose === 'hold' || st.pose === 'desk' || st.pose === 'fists');
  if (!front) { arm(st, c, -1); arm(st, c, 1); } torso(st, c); if (front) { arm(st, c, -1); arm(st, c, 1); }
  g.save(); g.translate(0, -930); g.rotate(st.tilt || 0); g.scale(1.2, 1.2); g.translate(0, 930); face(st, c); hairFront(st, c); if (st.headband) { P(); g.moveTo(-158, HY - 92); g.quadraticCurveTo(0, HY - 150, 158, HY - 92); g.lineTo(156, HY - 58); g.quadraticCurveTo(0, HY - 116, -156, HY - 58); g.closePath(); fs(st.headband, 6); } if (st.sweat) { P(); g.moveTo(190, HY - 60); g.quadraticCurveTo(218, HY - 14, 204, HY + 6); g.quadraticCurveTo(190, HY + 20, 176, HY + 6); g.quadraticCurveTo(168, HY - 14, 190, HY - 60); fs('#8fd2ff', 5); } g.restore();
  g.restore(); }
module.exports = {draw, POSES};
