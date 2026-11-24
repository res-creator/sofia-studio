// «Давай замуж!» — 4 alternative studio / seating layouts, each a vertical 1080x1920 wide shot, plus a comparison sheet.
// node variants.js -> studio_v1..v4.png + studio_variants.png   (reuses the cast and seating helpers from sheet.js)
const fs = require('fs'), {createCanvas, loadImage} = require('@napi-rs/canvas');
const src = fs.readFileSync(`${__dirname}/sheet.js`, 'utf8'), cut = src.indexOf('// ---------- layout ----------');
const H = new Function('require', '__dirname', src.slice(0, cut) + `
return {setG: v => { g = v; }, T, INK, P, fsx, ell, rr, ln, ch, body, pill, chair, seat, seatedLegs, LAP, backPerson, petrovich, pearls, shawl, shade, HIP, SEAT_H, ZH, EL, ZV, BR, MK, JS, RY};`)(require, __dirname);
const {T, INK, P, fsx, ell, rr, ln, body, chair, seat, LAP, backPerson, petrovich, pearls, shawl, shade, HIP, SEAT_H, ZH, EL, ZV, BR, MK, JS, RY} = H;
let g;
const VW = 1080, VH = 1920;
const sit = (def, x, y, sc, mood, look, extra) => { seat(def, x, y, sc, {arms: LAP, hands: {1: 'open', '-1': 'open'}, front: true, mood, look});
  const by = y + (HIP - SEAT_H) * sc; if (def === EL) pearls(x, by, sc); if (def === ZV) shawl(x, by, sc); if (extra) extra(by); };
const HOST_MOOD = {EL: 'proud', ZH: 'smugside', ZV: 'dreamy'};
// ---------- set pieces ----------
function wall(top, floor, cWall, cWall2, cFloor, cEdge, beams = true) { g.fillStyle = cWall; g.fillRect(0, 0, VW, floor); for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(k * VW / 9, top, VW / 9, floor - top); }
  if (beams) for (let k = 0; k < 4; k++) { g.save(); g.globalAlpha = .1; P(); const bx = VW * (.12 + k * .25); g.moveTo(bx, 0); g.lineTo(bx - 90, floor); g.lineTo(bx + 90, floor); g.closePath(); g.fillStyle = '#fff6c0'; g.fill(); g.restore(); }
  g.fillStyle = cFloor; g.fillRect(0, floor, VW, VH - floor); g.fillStyle = cEdge; g.fillRect(0, floor, VW, 16); }
function sign(cx, y, w, col = '#ff4f8f', text = '#ffffff') { const h = w * .2, x = cx - w / 2; rr(x, y, w, h, h / 2.4, col, 7); for (let k = 0; k < 16; k++) ell(x + w * .06 + k * w * .88 / 15, y + 10, 6, 6, '#fff3a0', 2); T.fitText(g, 'ДАВАЙ ЗАМУЖ!', {x: x + w * .05, y: y + h * .16, w: w * .9, h: h * .78}, {maxSize: 200, pad: 4, color: text}); }
function door(cx, floor, w, frame = '#f2d06a', inner = '#3a1a4a') { const h = w * 1.6, x = cx - w / 2, y = floor - h; rr(x - 16, y - 16, w + 32, h + 16, 20, frame); rr(x, y, w, h, 12, inner, 5); const hx = cx, hy = y - 46, k = 1.9;
  P(); g.moveTo(hx, hy + 22 * k); g.bezierCurveTo(hx - 40 * k, hy - 6 * k, hx - 20 * k, hy - 34 * k, hx, hy - 14 * k); g.bezierCurveTo(hx + 20 * k, hy - 34 * k, hx + 40 * k, hy - 6 * k, hx, hy + 22 * k); fsx('#ff4f8f', 5); }
// audience: list of x positions on one foreground row; pIdx = Petrovich (same scale as everyone)
const AUD = [['#6a4a8a', '#3a2a20'], ['#3a6a8a', '#7a5030', 'long'], ['#8a4a5a', '#2a1f1a'], ['#4a7a5a', '#c9a060', 'bun'], ['#6a5a8a', '#5a3a2a'], ['#8a6a3a', '#2a2a2a', 'long']];
function audience(xs, y, sc, pIdx) { xs.forEach((x, k) => { if (k === pIdx) { petrovich(x, y, sc); return; } const c = AUD[k % AUD.length]; backPerson(x, y, sc, {top: c[0], hair: c[1], long: c[2] === 'long', bun: c[2] === 'bun'}); }); }
// furniture (units = character units, scaled by sc; y = floor under it)
function throne(x, y, sc) { body(x, y, sc, () => { P(); g.moveTo(-230, -SEAT_H + 40); g.lineTo(-230, -SEAT_H - 520); g.quadraticCurveTo(-230, -SEAT_H - 700, -120, -SEAT_H - 720); g.lineTo(-60, -SEAT_H - 800); g.lineTo(0, -SEAT_H - 720); g.lineTo(60, -SEAT_H - 800); g.lineTo(120, -SEAT_H - 720); g.quadraticCurveTo(230, -SEAT_H - 700, 230, -SEAT_H - 520); g.lineTo(230, -SEAT_H + 40); g.closePath(); fsx('#e9bb34');
  rr(-170, -SEAT_H - 620, 340, 560, 60, '#c8325a'); for (const s of [-1, 1]) ell(s * 60, -SEAT_H - 760, 18, 18, '#3ac8d8', 5);
  rr(-200, -SEAT_H - 20, 400, 90, 30, '#d8405f'); for (const s of [-1, 1]) { rr(s * 230 - 50, -SEAT_H - 170, 100, 260, 40, '#e9bb34'); rr(s * 190 - 20, -SEAT_H + 60, 40, SEAT_H - 60, 10, '#c99a1e', 5); } }); }
function heartSeat(x, y, sc) { body(x, y, sc, () => { const cy = -SEAT_H - 330; P(); g.moveTo(0, cy + 380); g.bezierCurveTo(-520, cy + 120, -460, cy - 380, 0, cy - 160); g.bezierCurveTo(460, cy - 380, 520, cy + 120, 0, cy + 380); g.closePath(); fsx('#e8506a');
  g.save(); g.clip(); g.fillStyle = '#c93a55'; g.fillRect(150, cy - 400, 400, 800); g.restore(); P(); g.moveTo(0, cy + 380); g.bezierCurveTo(-520, cy + 120, -460, cy - 380, 0, cy - 160); g.bezierCurveTo(460, cy - 380, 520, cy + 120, 0, cy + 380); g.closePath(); fsx(null);
  rr(-330, -SEAT_H - 20, 660, 100, 40, '#f07a90'); for (const s of [-1, 1]) rr(s * 270 - 18, -SEAT_H + 70, 36, SEAT_H - 70, 10, '#8a5a3a', 5); }); }
function pouf(x, y, sc, col) { body(x, y, sc, () => { rr(-190, -SEAT_H - 30, 380, SEAT_H + 30, 90, col); g.save(); P(); g.roundRect(-190, -SEAT_H - 30, 380, SEAT_H + 30, 90); g.clip(); g.fillStyle = shade(col, .85); g.fillRect(100, -SEAT_H - 40, 120, SEAT_H + 50); for (let k = 0; k < 3; k++) ln([[-190, -SEAT_H + 90 + k * 110], [190, -SEAT_H + 90 + k * 110]], 4, shade(col, .75)); g.restore(); rr(-190, -SEAT_H - 30, 380, SEAT_H + 30, 90, null); ell(0, -SEAT_H - 20, 180, 40, shade(col, 1.08), 5); }); }
function roundTable(x, y, sc) { body(x, y, sc, () => { rr(-30, -380, 60, 380, 10, '#8a5a3a'); ell(0, -10, 160, 26, '#8a5a3a'); ell(0, -400, 420, 70, '#b87a48'); ell(0, -414, 420, 60, '#d49a62');
  for (const [cx, col] of [[-230, '#ffffff'], [0, '#ffe0ec'], [230, '#ffffff']]) { rr(cx - 46, -500, 92, 76, 18, col, 5); P(); g.ellipse(cx + 58, -470, 22, 20, 0, -1.4, 1.4); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); ell(cx, -426, 70, 12, col, 4);
    for (const s of [-1, 1]) { P(); g.moveTo(cx + s * 14, -510); g.quadraticCurveTo(cx + s * 30, -540, cx + s * 12, -570); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5; g.stroke(); } }
  ell(110, -440, 40, 16, '#f2c820', 4); }); }   // a plate of cookies
function lamp(x, y, sc) { body(x, y, sc, () => { ln([[0, 0], [0, -1500]], 14); ell(0, -6, 120, 20, '#8a5a3a'); P(); g.moveTo(-170, -1500); g.lineTo(170, -1500); g.lineTo(110, -1760); g.lineTo(-110, -1760); g.closePath(); fsx('#fbe2b0'); g.save(); g.globalAlpha = .25; P(); g.moveTo(-170, -1500); g.lineTo(170, -1500); g.lineTo(420, -900); g.lineTo(-420, -900); g.closePath(); g.fillStyle = '#fff3c0'; g.fill(); g.restore(); }); }
function judgesDesk(x0, x1, top, bottom) { rr(x0, top, x1 - x0, bottom - top, 18, '#c8325a', 7); g.save(); P(); g.roundRect(x0, top, x1 - x0, bottom - top, 18); g.clip(); g.fillStyle = '#a82848'; g.fillRect(x1 - 80, top, 80, bottom - top); g.restore(); rr(x0, top, x1 - x0, bottom - top, 18, null, 7);
  rr(x0 - 14, top - 18, x1 - x0 + 28, 30, 12, '#e9bb34', 6); for (let k = 0; k < 5; k++) { const hx = x0 + (x1 - x0) * (.15 + k * .175), hy = (top + bottom) / 2 + 8, s = 1.2; P(); g.moveTo(hx, hy + 22 * s); g.bezierCurveTo(hx - 40 * s, hy - 6 * s, hx - 20 * s, hy - 34 * s, hx, hy - 14 * s); g.bezierCurveTo(hx + 20 * s, hy - 34 * s, hx + 40 * s, hy - 6 * s, hx, hy + 22 * s); fsx('#ffd0e0', 4); } }
// ---------- variants ----------
function frame(draw) { const cv = createCanvas(VW, VH); g = cv.getContext('2d'); H.setG(g); draw(); return cv; }
const V = [];
// 1. Talk-show semicircle: bride on a raised round platform in the centre, door behind her; grooms' curved bench left, hosts' curved sofa right
V.push(['Полукруг ток-шоу', frame(() => { const FL = 960; wall(0, FL, '#6a2f7a', null, '#e88ab0', '#d9739e'); sign(VW / 2, 150, 800); door(VW / 2, FL, 230);
  ell(VW / 2, 1235, 250, 62, '#f2d06a'); g.fillStyle = '#d9b04a'; g.fillRect(VW / 2 - 250, 1235, 500, 40); ell(VW / 2, 1275, 250, 62, '#d9b04a'); ell(VW / 2, 1235, 250, 62, '#f2d06a'); ell(VW / 2, 1235, 210, 46, '#ffe08a', 0);   // platform
  const G = [[MK, 345, 1150, .22], [JS, 225, 1235, .235], [RY, 108, 1330, .25]], Hs = [[EL, 735, 1150, .22, 'EL'], [ZH, 855, 1235, .235, 'ZH'], [ZV, 972, 1330, .25, 'ZV']];
  for (const [d, x, y, s] of G) { chair(x, y, s, 470, '#3a6aa8', 'sofa'); sit(d, x, y, s, d === JS ? 'kind' : 'smug', .7); }
  for (const [d, x, y, s, k] of Hs) { chair(x, y, s, 470, '#c8325a', 'sofa'); sit(d, x, y, s, HOST_MOOD[k], -.7); }
  chair(VW / 2, 1240, .25, 420, '#f2a0c0'); sit(BR, VW / 2, 1240, .25, 'proud', 0);
  audience([95, 300, 505, 710, 915], VH + 40, .5, 3); })]);
// 2. Two tiers: hosts behind a raised judges' desk at the back; bride + grooms on one long sofa in front (2 grooms | bride | 1 groom)
V.push(['Два яруса: жюри сзади', frame(() => { const FL = 1000; wall(0, FL, '#5a2a6a', null, '#e88ab0', '#d9739e'); sign(VW / 2, 110, 760); door(150, FL, 170);
  rr(300, 870, 740, 130, 14, '#4a2050', 6);   // riser
  const hy = 820; for (const [d, x, k] of [[EL, 455, 'EL'], [ZH, 670, 'ZH'], [ZV, 885, 'ZV']]) { chair(x, hy, .21, 470, '#7a3a8a', 'sofa'); sit(d, x, hy, .21, HOST_MOOD[k], 0); }
  judgesDesk(310, 1030, 760, 880);
  const sy = 1440, sc = .245; chair(VW / 2, sy, sc, 4000, '#3a6aa8', 'sofa');
  for (const [d, x, m] of [[MK, 175, 'smug'], [JS, 420, 'kind'], [BR, 665, 'proud'], [RY, 910, 'smug']]) sit(d, x, sy, sc, m, 0);
  audience([95, 300, 505, 710, 915], VH + 40, .5, 1); })]);
// 3. Separate islands, warm living room: heart loveseat for the bride, a pouf per groom, hosts at a round tea table; rug + lamp
V.push(['Островки, тёплая гостиная', frame(() => { const FL = 1000; g.fillStyle = '#f6d7b0'; g.fillRect(0, 0, VW, FL); for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? '#f1cc9e' : '#f6d7b0'; g.fillRect(k * VW / 9, 0, VW / 9, FL); }
  g.fillStyle = '#c98f5a'; g.fillRect(0, FL, VW, VH - FL); for (let k = 0; k < 10; k++) ln([[0, FL + 40 + k * 95], [VW, FL + 40 + k * 95]], 3, '#a8703f'); g.fillStyle = '#b87a48'; g.fillRect(0, FL, VW, 16);
  sign(VW / 2, 110, 760, '#e9bb34', '#5a2a1a'); door(170, FL, 180, '#e9bb34', '#8a5a3a'); lamp(985, 1180, .42);
  ell(540, 1470, 520, 110, '#e06a7a'); ell(540, 1470, 450, 86, '#f2a07a', 0); ell(540, 1470, 380, 66, '#e06a7a', 0);   // rug
  const ty = 1080, ts = .2; for (const [d, x, k] of [[EL, 500, 'EL'], [ZH, 690, 'ZH'], [ZV, 880, 'ZV']]) { chair(x, ty, ts, 470, '#d4a82a', 'sofa'); sit(d, x, ty, ts, HOST_MOOD[k], 0); }
  roundTable(690, ty + 30, .38);
  const fy = 1460, fs2 = .245; heartSeat(170, fy, fs2); sit(BR, 170, fy, fs2, 'proud', .6);
  for (const [d, x, c, m] of [[MK, 460, '#7aa0c8', 'smug'], [JS, 690, '#9ac07a', 'kind'], [RY, 920, '#c89ac8', 'smug']]) { pouf(x, fy, fs2, c); sit(d, x, fy, fs2, m, -.5); }
  audience([95, 300, 505, 710, 915], VH + 40, .5, 2); })]);
// 4. Red carpet from the door to the camera: bride on a throne at the far end; grooms' chairs along the left edge, hosts' sofa along the right; audience both sides in front
V.push(['Красная дорожка', frame(() => { const FL = 900; wall(0, FL, '#3a1f5a', null, '#7a3a8a', '#5a2a6a'); sign(VW / 2, 90, 760); door(VW / 2, FL, 170);
  P(); g.moveTo(VW / 2 - 95, FL); g.lineTo(VW / 2 + 95, FL); g.lineTo(VW / 2 + 330, VH); g.lineTo(VW / 2 - 330, VH); g.closePath(); fsx('#d42a3a', 0); ln([[VW / 2 - 95, FL], [VW / 2 - 330, VH]], 10, '#f2c820'); ln([[VW / 2 + 95, FL], [VW / 2 + 330, VH]], 10, '#f2c820');
  for (let k = 0; k < 6; k++) { const y = FL + 120 + k * 150, half = 95 + (y - FL) / (VH - FL) * 235; ln([[VW / 2 - half + 14, y], [VW / 2 + half - 14, y]], 3, 'rgba(0,0,0,.12)'); }
  throne(VW / 2, 1110, .2); sit(BR, VW / 2, 1110, .2, 'proud', 0);
  const L = [[MK, 255, 1090, .205], [JS, 185, 1270, .225], [RY, 112, 1460, .25]], R = [[EL, 825, 1090, .205, 'EL'], [ZH, 895, 1270, .225, 'ZH'], [ZV, 968, 1460, .25, 'ZV']];
  for (const [d, x, y, s] of L) { chair(x, y, s, 470, '#e9bb34'); sit(d, x, y, s, d === JS ? 'kind' : 'smug', .7); }
  for (const [d, x, y, s, k] of R) { chair(x, y, s, 470, '#c8325a', 'sofa'); sit(d, x, y, s, HOST_MOOD[k], -.7); }
  audience([90, 270, 810, 990], VH + 40, .48, 2); })]);
V.forEach(([, cv], i) => fs.writeFileSync(`${__dirname}/studio_v${i + 1}.png`, cv.toBuffer('image/png')));
// ---------- comparison sheet ----------
(async () => { const cur = await loadImage(`${__dirname}/studio_vertical.png`);
  const SW = 2600, SH = 1180, sheet = createCanvas(SW, SH); g = sheet.getContext('2d'); H.setG(g); g.fillStyle = '#fbf3f6'; g.fillRect(0, 0, SW, SH);
  g.font = '50px NBL, NBC'; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('«ДАВАЙ ЗАМУЖ!» — варианты студии и рассадки (кадр 9:16)', SW / 2, 56);
  const k = .45, tw = VW * k, th = VH * k, top = 150;
  V.forEach(([name, cv], i) => { const x = 40 + i * (tw + 30); g.drawImage(cv, x, top, tw, th); rr(x, top, tw, th, 0, null, 5); H.pill(`Вариант ${i + 1} — ${name}`, x + tw / 2, top + th + 40, tw); });
  const ks = .3, cx = 40 + 4 * (tw + 30) + 10; g.drawImage(cur, cx, top + th - VH * ks, VW * ks, VH * ks); rr(cx, top + th - VH * ks, VW * ks, VH * ks, 0, null, 5); H.pill('Сейчас', cx + VW * ks / 2, top + th + 40, VW * ks);
  g.font = '26px NBL, NBC'; g.fillStyle = '#6a5a70'; g.fillText('Петрович в каждом варианте сидит в зале, в масштабе остальных зрителей, со спины.', SW / 2, SH - 50);
  fs.writeFileSync(`${__dirname}/studio_variants.png`, sheet.toBuffer('image/png')); console.log('ok'); })();
