// Calibration (Master Prompts 3.3): rebuild ONE reference composition (back-of-class view) with our own characters and props,
// then compare side by side. node calib.js <step 1..4> -> out/calib_<step>.png
const fs = require('fs'), path = require('path');
const {createCanvas, GlobalFonts, loadImage} = require('@napi-rs/canvas');
const T = require('./toon'), C = require('./cast_toon');
GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'neucha-latin-400-normal.woff2'), 'HWL'); GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'neucha-cyrillic-400-normal.woff2'), 'HWC');
const W = 1080, H = 1920, INK = '#3a2f3a';
const cv = createCanvas(W, H), g = cv.getContext('2d');
const P = () => g.beginPath();
const fs_ = (fill, lw = 5) => { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } };
const rr = (x, y, w, h, r, fill, lw = 5) => { P(); g.roundRect(x, y, w, h, r); fs_(fill, lw); };
const ell = (x, y, rx, ry, fill, lw = 5) => { P(); g.ellipse(x, y, rx, ry, 0, 0, 7); fs_(fill, lw); };
const ln = (pts, w = 5, col = INK) => { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); };
const quad = (pts, fill, lw = 5) => { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); fs_(fill, lw); };
// ---- 1. room ----
function room() {
  g.fillStyle = '#f2e3c0'; g.fillRect(0, 0, W, 920); g.fillStyle = '#ead7ae'; for (let x = 20; x < W; x += 92) g.fillRect(x, 0, 40, 920);
  g.fillStyle = '#e2cfa4'; g.fillRect(0, 96, W, 14); ln([[0, 110], [W, 110]], 3, 'rgba(58,47,58,0.35)');
  g.fillStyle = '#8fb9a4'; g.fillRect(0, 920, W, 270); g.fillStyle = '#7aa892'; g.fillRect(0, 920, W, 14); ln([[0, 920], [W, 920]], 5); ln([[0, 934], [W, 934]], 3);
  // floor with perspective planks to a vanishing point
  g.fillStyle = '#d9a46c'; g.fillRect(0, 1185, W, H - 1185); ln([[0, 1185], [W, 1185]], 5);
  for (let x = -1600; x < 2800; x += 150) ln([[540 + (x - 540) * .28, 1185], [x, H]], 3, 'rgba(120,70,30,0.35)');
  // clock
  ell(398, 228, 58, 58, '#ffffff', 6); ln([[398, 228], [398, 192]], 6); ln([[398, 228], [424, 238]], 6); ell(398, 228, 5, 5, INK, 0);
  // chalkboard with wooden frame + chalk ledge + chalk smudges
  rr(26, 337, 750, 433, 8, '#9a6a3a', 6); rr(48, 358, 706, 392, 4, '#355f50', 4);
  g.save(); g.globalAlpha = .12; ell(220, 470, 170, 36, '#ffffff', 0); ell(520, 640, 200, 40, '#ffffff', 0); ell(330, 720, 260, 26, '#ffffff', 0); g.restore();
  g.font = '50px HWL, HWC'; g.fillStyle = '#eef3e8'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('21 ноября', 400, 430); g.fillText('Classwork', 400, 500); g.textAlign = 'left'; g.fillText('Reading, p. 42', 110, 610);
  rr(40, 760, 720, 18, 4, '#8a5a2e', 5); rr(160, 750, 60, 12, 4, '#ffffff', 3);
  // door: frame, two panels, lever handle, threshold
  rr(822, 476, 256, 716, 4, '#9a6a3a', 6); rr(840, 494, 220, 690, 3, '#c98f55', 5);
  rr(866, 524, 168, 290, 6, null, 4); rr(866, 846, 168, 300, 6, null, 4);
  ell(866, 826, 11, 11, '#d8d8de', 4); rr(866, 820, 52, 12, 6, '#d8d8de', 4); quad([[812, 1186], [1078, 1186], [1070, 1200], [820, 1200]], '#b8b0a8', 4);
}
// teacher's desk with props
function teacherDesk() {
  rr(100, 994, 548, 28, 6, '#d39a5c', 6); rr(118, 1022, 512, 186, 4, '#b07a42', 6); rr(146, 1050, 456, 128, 6, null, 4);
  rr(212, 962, 110, 32, 5, '#e05a3a', 4); rr(220, 934, 96, 30, 5, '#f0b030', 4); rr(206, 906, 104, 30, 5, '#3a6ad0', 4);  // books
  rr(128, 950, 52, 44, 6, '#c8664a', 4); for (let i = -2; i <= 2; i++) { P(); g.ellipse(154 + i * 12, 912 - Math.abs(i) * 6, 9, 34, i * .25, 0, 7); fs_('#4cae6a', 4); } ell(160, 862, 12, 12, '#e8506a', 4); // plant
  rr(360, 978, 120, 16, 3, '#ffffff', 3); rr(370, 966, 100, 14, 3, '#f4f0e6', 3); // exercise books
  ln([[548, 994], [548, 946]], 6); ell(548, 916, 34, 34, '#4ab0e0', 5); P(); g.ellipse(540, 908, 14, 10, .4, 0, 7); fs_('#7ac070', 0); P(); g.ellipse(560, 928, 9, 7, 0, 0, 7); fs_('#7ac070', 0); // globe
}
// ---- 3. a student seen from behind, seated ----
function studentBack(x, yHeadTop, s, pal, hair) {
  g.save(); g.translate(x, yHeadTop); g.scale(s, s);
  // torso (back of hoodie) + arms resting forward
  quad([[-120, 250], [120, 250], [150, 480], [-150, 480]], pal.top); g.save(); P(); g.moveTo(-120, 250); g.lineTo(120, 250); g.lineTo(150, 480); g.lineTo(-150, 480); g.closePath(); g.clip(); g.fillStyle = pal.topS; g.fillRect(90, 240, 80, 250); g.restore(); quad([[-120, 250], [120, 250], [150, 480], [-150, 480]], null); for (const q of [-1, 1]) ln([[q * 128, 300], [q * 150, 470]], 5);
  rr(-34, 200, 68, 70, 12, pal.skinS, 5);
  for (const q of [-1, 1]) ell(q * 142, 130, 20, 34, pal.skin, 5);
  if (hair === 'spiky') { P(); const pts = []; for (let k = 0; k <= 16; k++) { const a = Math.PI * (1 + k / 16), r = k % 2 ? 175 : 145; pts.push([Math.cos(a) * r, 120 + Math.sin(a) * r * 1.05]); } pts.push([150, 200], [-150, 200]); quad(pts, pal.hair); }
  else { ell(0, 120, 148, 150, pal.hair, 6); g.save(); P(); g.ellipse(0, 120, 148, 150, 0, 0, 7); g.clip(); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 4; for (let i = -3; i <= 3; i++) { P(); g.moveTo(i * 36, -20); g.quadraticCurveTo(i * 44, 120, i * 30, 260); g.stroke(); } g.restore(); }
  g.restore(); }
function studentDesk(x, y, w) { // far edge y, top surface + front panel + metal legs
  quad([[x - w / 2 + 14, y], [x + w / 2 - 14, y], [x + w / 2, y + 44], [x - w / 2, y + 44]], '#e6b47a', 5); rr(x - w / 2, y + 44, w, 22, 3, '#c98a4a', 5);
  rr(x - w / 2 + 18, y + 66, w - 36, 150, 3, '#b07a42', 5); for (const q of [-1, 1]) ln([[x + q * (w / 2 - 22), y + 66], [x + q * (w / 2 - 22), y + 270]], 12, '#5a5f6a'); }
function chairBack(x, y) { rr(x - 82, y, 164, 74, 10, '#a8703c', 5); for (const q of [-1, 1]) ln([[x + q * 66, y + 74], [x + q * 70, y + 210]], 10, '#8a8f9a'); }
// ---- render steps ----
async function main() {
  const step = +(process.argv[2] || 4);
  room(); teacherDesk();
  if (step >= 3) {
    // teacher: 0.8 of the door height, standing in front of the board edge, hands on hips
    T.draw(g, {x: 640, y: 1180, s: .44, ...C.teacher, pose: 'hips', mood: 'smug', look: 0});
    // far row: one student at a desk, seen from behind
    studentDesk(300, 1350, 270); studentDesk(780, 1350, 420);
    studentBack(780, 1120, .66, C.sasha.pal, 'short'); chairBack(780, 1420);
    // foreground: our hero cropped at the left edge + his desk
    studentBack(40, 1300, 1.25, C.hero.pal, 'spiky');
    studentDesk(250, 1660, 520);
  }
  if (step >= 2) { // light: warm window light patch + soft shadows + vignette
    g.save(); g.globalCompositeOperation = 'soft-light'; const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, 'rgba(255,230,180,0.5)'); gr.addColorStop(1, 'rgba(120,90,140,0.25)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
    const v = g.createRadialGradient(W / 2, H * .45, 600, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(40,20,30,0)'); v.addColorStop(1, 'rgba(40,20,30,0.18)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  }
  fs.writeFileSync(path.join(__dirname, 'out', `calib_${step}.png`), cv.toBuffer('image/png'));
  // side by side with the reference frame (analysis only, not shipped)
  const ref = process.argv[3]; if (ref) { const im = await loadImage(ref), sb = createCanvas(W * 2, H), sg = sb.getContext('2d');
    sg.drawImage(im, 0, 180, im.width, 1640, 0, 0, W, H); sg.drawImage(cv, W, 0); fs.writeFileSync(path.join(__dirname, 'out', `calib_side_${step}.png`), sb.toBuffer('image/png')); }
}
main();
