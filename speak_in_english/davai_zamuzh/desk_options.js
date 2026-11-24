// «Давай замуж!» — 3 layouts with the hosts' heart desk standing ON the stage floor (3/4 view), bigger faces.
// node desk_options.js -> studio_desk_A/B/V.png + studio_desk_options.png   (cast + seating helpers come from sheet.js)
const fs = require('fs'), {createCanvas} = require('@napi-rs/canvas');
const src = fs.readFileSync(`${__dirname}/sheet.js`, 'utf8'), cut = src.indexOf('// ---------- layout ----------');
const H = new Function('require', '__dirname', src.slice(0, cut) + `
return {setG: v => { g = v; }, T, INK, P, fsx, ell, rr, ln, body, pill, chair, seat, LAP, backPerson, petrovich, pearls, shawl, shade, HIP, SEAT_H, ZH, EL, ZV, BR, MK, JS, RY};`)(require, __dirname);
const {T, INK, P, fsx, ell, rr, ln, body, chair, seat, LAP, backPerson, petrovich, pearls, shawl, shade, HIP, SEAT_H, ZH, EL, ZV, BR, MK, JS, RY} = H;
let g; const VW = 1080, VH = 1920, FL = 860;   // wall/floor line
const MOOD = new Map([[EL, 'proud'], [ZH, 'smugside'], [ZV, 'dreamy'], [BR, 'proud'], [MK, 'smug'], [JS, 'kind'], [RY, 'smug']]);
const headW = sc => 2 * 152 * 1.2 * sc;   // head width in px
const sit = (def, x, y, sc, look = 0) => { seat(def, x, y, sc, {arms: LAP, hands: {1: 'open', '-1': 'open'}, front: true, mood: MOOD.get(def), look}); const by = y + (HIP - SEAT_H) * sc; if (def === EL) pearls(x, by, sc); if (def === ZV) shawl(x, by, sc); };
// ---------- set ----------
function room() { g.fillStyle = '#5a2a6a'; g.fillRect(0, 0, VW, FL); for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(k * VW / 9, 0, VW / 9, FL); }
  for (let k = 0; k < 4; k++) { g.save(); g.globalAlpha = .1; P(); const bx = VW * (.12 + k * .25); g.moveTo(bx, 0); g.lineTo(bx - 90, FL); g.lineTo(bx + 90, FL); g.closePath(); g.fillStyle = '#fff6c0'; g.fill(); g.restore(); }
  g.fillStyle = '#e88ab0'; g.fillRect(0, FL, VW, VH - FL); g.fillStyle = '#d9739e'; g.fillRect(0, FL, VW, 16); for (let k = 1; k < 7; k++) ln([[0, FL + k * 150 + k * k * 6], [VW, FL + k * 150 + k * k * 6]], 3, 'rgba(160,60,110,.18)'); }
function sign(cx, y, w) { const h = w * .2, x = cx - w / 2; rr(x, y, w, h, h / 2.4, '#ff4f8f', 7); for (let k = 0; k < 16; k++) ell(x + w * .06 + k * w * .88 / 15, y + 10, 6, 6, '#fff3a0', 2); T.fitText(g, 'ДАВАЙ ЗАМУЖ!', {x: x + w * .05, y: y + h * .16, w: w * .9, h: h * .78}, {maxSize: 200, pad: 4, color: '#ffffff'}); }
function heart(hx, hy, s, col) { P(); g.moveTo(hx, hy + 22 * s); g.bezierCurveTo(hx - 40 * s, hy - 6 * s, hx - 20 * s, hy - 34 * s, hx, hy - 14 * s); g.bezierCurveTo(hx + 20 * s, hy - 34 * s, hx + 40 * s, hy - 6 * s, hx, hy + 22 * s); fsx(col, 4); }
function door(cx, w) { const h = w * 1.6, x = cx - w / 2, y = FL - h; rr(x - 16, y - 16, w + 32, h + 16, 20, '#f2d06a'); rr(x, y, w, h, 12, '#3a1a4a', 5); heart(cx, y - 46, 1.9, '#ff4f8f'); }
const poly = (pts, fill, lw = 7) => { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); fsx(fill, lw); };
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
// heart desk in 3/4: front face TL,TR,BR,BL; d = top depth going back; side = 'L' | 'R' visible end; a ~20 px step under it
function desk(TL, TR, BR, BL, d, side) { const step = 20; poly([add(BL, [-14, 0]), add(BR, [14, 0]), add(BR, [14, step]), add(BL, [-14, step])], '#4a2050', 6);
  if (side === 'R') poly([TR, add(TR, d), add(BR, d), BR], '#a82848'); if (side === 'L') poly([TL, add(TL, d), add(BL, d), BL], '#a82848');
  poly([TL, TR, BR, BL], '#c8325a'); poly([TL, TR, add(TR, d), add(TL, d)], '#e9bb34', 6);
  for (let k = 0; k < 4; k++) { const u = (k + .5) / 4, p = lerp(lerp(TL, TR, u), lerp(BL, BR, u), .52); heart(p[0], p[1], 1.15, '#ffd0e0'); } }
function stool(x, y, sc, lift) { body(x, y, sc, () => { const top = -SEAT_H - lift; for (const s of [-1, 1]) ln([[s * 70, top + 40], [s * 110, 0]], 16); ell(0, top + lift * .55, 120, 22, null, 10); P(); g.ellipse(0, top + lift * .55, 120, 22, 0, 0, 7); g.strokeStyle = '#c9c4d0'; g.lineWidth = 6; g.stroke(); rr(-150, top - 10, 300, 60, 26, '#e9bb34'); }); }
function heartSeat(x, y, sc) { body(x, y, sc, () => { const cy = -SEAT_H - 330; P(); g.moveTo(0, cy + 380); g.bezierCurveTo(-520, cy + 120, -460, cy - 380, 0, cy - 160); g.bezierCurveTo(460, cy - 380, 520, cy + 120, 0, cy + 380); g.closePath(); fsx('#e8506a');
  rr(-330, -SEAT_H - 20, 660, 100, 40, '#f07a90'); for (const s of [-1, 1]) rr(s * 270 - 18, -SEAT_H + 70, 36, SEAT_H - 70, 10, '#8a5a3a', 5); }); }
function riser(cx, y, w, h) { ell(cx, y + h, w / 2, w * .1, '#b0507a'); g.fillStyle = '#c86090'; g.fillRect(cx - w / 2, y, w, h); ell(cx, y, w / 2, w * .1, '#f2a0c0'); ln([[cx - w / 2, y], [cx - w / 2, y + h]], 7); ln([[cx + w / 2, y], [cx + w / 2, y + h]], 7); }
// angled armchair: a side panel shows on the side turned away (3/4)
function armchair34(x, y, sc, col, turn) { body(x, y, sc, () => { const s = Math.sign(turn); poly([[s * 205, -SEAT_H - 410], [s * 285, -SEAT_H - 360], [s * 285, -SEAT_H + 90], [s * 205, -SEAT_H + 110]], shade(col, .75), 6); }); chair(x, y, sc, 420, col); }
const AUD = [['#6a4a8a', '#3a2a20'], ['#3a6a8a', '#7a5030', 'long'], ['#8a4a5a', '#2a1f1a'], ['#4a7a5a', '#c9a060', 'bun'], ['#6a5a8a', '#5a3a2a']];
function audience(pIdx, sc = .5) { [95, 300, 505, 710, 915].forEach((x, k) => { if (k === pIdx) return petrovich(x, VH + 40, sc); const c = AUD[k]; backPerson(x, VH + 40, sc, {top: c[0], hair: c[1], long: c[2] === 'long', bun: c[2] === 'bun'}); }); }
function frame(fn) { const cv = createCanvas(VW, VH); g = cv.getContext('2d'); H.setG(g); fn(); return cv; }
const OUT = [];
// А — desk on the right angled to the centre; bride front-left angled to the hosts; grooms on separate chairs in a diagonal back to the door (Z)
OUT.push(['А', 'Стол справа, женихи по диагонали к двери', frame(() => { room(); sign(VW / 2, 70, 760); door(215, 200);
  const hy = 1150, hs = .31; for (const [d, x] of [[EL, 655], [ZH, 815], [ZV, 970]]) { chair(x, hy, hs, 400, '#7a3a8a'); sit(d, x, hy, hs, -.8); }
  desk([560, hy - 470 * hs], [1072, hy - 500 * hs], [1072, hy + 30], [560, hy + 70], [26, -26], 'L');
  for (const [d, x, y, s] of [[RY, 180, 1030, .3], [JS, 330, 1200, .31], [MK, 490, 1375, .32]]) { chair(x, y, s, 400, '#3a6aa8'); sit(d, x, y, s, .7); }
  armchair34(165, 1560, .35, '#f2a0c0', -1); sit(BR, 165, 1560, .35, .8);
  audience(3); })]);
// Б — desk at the back centre on the floor; bride's armchair front-left and grooms' sofa front-right turned to each other (~45°)
OUT.push(['Б', 'Стол сзади по центру, невеста и женихи лицом друг к другу', frame(() => { room(); sign(VW / 2, 70, 760); door(110, 170);
  const hy = 1100, hs = .3; for (const [d, x] of [[EL, 380, ], [ZH, 545], [ZV, 710]]) { chair(x, hy, hs, 400, '#7a3a8a'); sit(d, x, hy, hs, 0); }
  desk([255, hy - 470 * hs], [800, hy - 470 * hs], [800, hy + 40], [255, hy + 40], [28, -28], 'R');
  armchair34(190, 1580, .36, '#f2a0c0', -1); sit(BR, 190, 1580, .36, .9);
  const sy = 1580, ss = .32; body(800, sy, ss, () => poly([[-560, -SEAT_H - 380], [-660, -SEAT_H - 300], [-660, -40], [-560, 0]], shade('#3a6aa8', .75), 6)); chair(800, sy, ss, 1560, '#3a6aa8', 'sofa');
  for (const [d, x] of [[MK, 640], [JS, 800], [RY, 960]]) sit(d, x, sy, ss, -.9);
  audience(1); })]);
// В — desk on the left in profile/3-4 facing right; bride on a raised heart loveseat right; grooms on bar stools by the door at the back
OUT.push(['В', 'Стол слева в профиль, женихи ждут на барных стульях', frame(() => { room(); sign(VW / 2, 70, 760); door(720, 210);
  for (const [d, x] of [[MK, 560], [JS, 720], [RY, 880]]) { const y = 1010, s = .3, lift = 230; stool(x, y, s, lift); sit(d, x, y - lift * s, s, -.4); }
  const H3 = [[EL, 105, 1000, .3], [ZH, 275, 1135, .31], [ZV, 445, 1275, .32]]; for (const [d, x, y, s] of H3) { chair(x, y, s, 400, '#7a3a8a'); sit(d, x, y, s, .9); }
  desk([22, 1000 - 470 * .3], [575, 1275 - 470 * .32], [575, 1318], [22, 1042], [-24, -26], 'R');
  riser(820, 1500, 440, 40); heartSeat(820, 1520, .34); sit(BR, 820, 1520, .34, -.9);
  audience(2); })]);
OUT.forEach(([k, , cv]) => fs.writeFileSync(`${__dirname}/studio_desk_${k === 'А' ? 'A' : k === 'Б' ? 'B' : 'V'}.png`, cv.toBuffer('image/png')));
// comparison sheet
{ const k = .5, tw = VW * k, th = VH * k, SW = 3 * tw + 4 * 40, SH = th + 260, cv = createCanvas(SW, SH); g = cv.getContext('2d'); H.setG(g); g.fillStyle = '#fbf3f6'; g.fillRect(0, 0, SW, SH);
  g.font = '46px NBL, NBC'; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Стол ведущих с сердечками стоит на полу — 3 варианта рассадки', SW / 2, 52);
  OUT.forEach(([kk, name, c], i) => { const x = 40 + i * (tw + 40), y = 110; g.drawImage(c, x, y, tw, th); rr(x, y, tw, th, 0, null, 5); H.pill(`Вариант ${kk} — ${name}`, x + tw / 2, y + th + 44, tw); });
  fs.writeFileSync(`${__dirname}/studio_desk_options.png`, cv.toBuffer('image/png')); }
console.log('head px at .30 =', Math.round(headW(.3)), ' at .35 =', Math.round(headW(.35)));
