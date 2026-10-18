// Style test frames: same moment (Day 2, 3 AM, Gary behind the door) in three looks.
// Usage: node frames.js  -> flat.png, comic.png, bold.png, compare.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
require('../lib'); // fonts
const W = 1920, H = 1080;

// ---- skeleton (realistic proportions, ~7.5 heads), facing left toward the door ----
const P = {
  head: [1196, 318], neck: [1222, 382], shB: [1268, 420], shF: [1214, 418], hip: [1268, 652],
  kneeB: [1316, 806], ankB: [1340, 952], kneeF: [1204, 806], ankF: [1180, 955],
  elbB: [1176, 556], wriB: [1094, 522], elbF: [1146, 508], wriF: [1052, 500],
};
const TORCH = [[1112, 520], [968, 486]]; // flashlight body, held with both hands

function cap(ctx, a, b, ra, rb) { // tapered capsule a->b
  const an = Math.atan2(b[1] - a[1], b[0] - a[0]), px = Math.cos(an + Math.PI / 2), py = Math.sin(an + Math.PI / 2);
  ctx.moveTo(a[0] + px * ra, a[1] + py * ra); ctx.lineTo(b[0] + px * rb, b[1] + py * rb);
  ctx.arc(b[0], b[1], rb, an + Math.PI / 2, an - Math.PI / 2, true); ctx.lineTo(a[0] - px * ra, a[1] - py * ra);
  ctx.arc(a[0], a[1], ra, an - Math.PI / 2, an + Math.PI / 2, true); ctx.closePath();
}
// cel-shaded shape: whole shape in shadow colour, lit part = same shape shifted towards the light
function shape(ctx, path, base, S, shade) {
  ctx.save();
  if (S.lw) { ctx.beginPath(); path(ctx); ctx.lineWidth = S.lw * 2; ctx.strokeStyle = S.ink; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.beginPath(); path(ctx); ctx.fillStyle = shade || S.shadeOf(base); ctx.fill();
  ctx.save(); ctx.clip(); ctx.translate(S.light[0] * S.off, S.light[1] * S.off); ctx.beginPath(); path(ctx); ctx.fillStyle = base; ctx.fill(); ctx.restore();
  ctx.restore();
}
function hand(ctx, at, S, ang) { // fist wrapped around a handle: knuckles on top, thumb over
  shape(ctx, c => { c.save(); c.translate(...at); c.rotate(ang); c.moveTo(24, -4); c.ellipse(0, -2, 25, 21, 0, 0, 7); c.restore(); }, S.skin, S);
  ctx.save(); ctx.translate(...at); ctx.rotate(ang); ctx.strokeStyle = S.faceInk; ctx.globalAlpha = 0.55; ctx.lineWidth = 3; for (const x of [-10, 0, 10]) { ctx.beginPath(); ctx.moveTo(x, -18); ctx.lineTo(x + 2, -6); ctx.stroke(); } ctx.restore(); }

function hero(ctx, S) {
  const C = S.hero;
  // back leg + back arm first
  shape(ctx, c => { cap(c, P.hip, P.kneeB, 30, 24); cap(c, P.kneeB, P.ankB, 24, 18); }, C.pants, S);
  shape(ctx, c => { c.moveTo(P.ankB[0] - 52, P.ankB[1] + 14); c.quadraticCurveTo(P.ankB[0] - 56, P.ankB[1] - 22, P.ankB[0] + 4, P.ankB[1] - 22); c.lineTo(P.ankB[0] + 26, P.ankB[1] + 14); c.closePath(); }, C.shoe, S);
  shape(ctx, c => { cap(c, P.shB, P.elbB, 23, 20); cap(c, P.elbB, P.wriB, 20, 16); }, C.top, S);
  // torso (hoodie) with hood behind the neck
  shape(ctx, c => { c.moveTo(1168, 424); c.quadraticCurveTo(1228, 376, 1300, 400); c.quadraticCurveTo(1330, 470, 1318, 560); c.lineTo(1314, 680); c.quadraticCurveTo(1262, 696, 1214, 684); c.lineTo(1196, 572); c.quadraticCurveTo(1170, 500, 1168, 424); c.closePath(); }, C.top, S);
  shape(ctx, c => { c.moveTo(1232, 372); c.quadraticCurveTo(1300, 352, 1298, 420); c.quadraticCurveTo(1270, 430, 1246, 410); c.closePath(); }, C.top2, S);
  ctx.save(); ctx.strokeStyle = S.light2 || '#f4efe4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1206, 428); ctx.lineTo(1200, 500); ctx.moveTo(1222, 432); ctx.lineTo(1220, 494); ctx.stroke(); ctx.restore();
  // front leg
  shape(ctx, c => { cap(c, [1250, 652], P.kneeF, 31, 25); cap(c, P.kneeF, P.ankF, 25, 18); }, C.pants, S);
  shape(ctx, c => { c.moveTo(P.ankF[0] - 62, P.ankF[1] + 14); c.quadraticCurveTo(P.ankF[0] - 66, P.ankF[1] - 24, P.ankF[0] - 2, P.ankF[1] - 24); c.lineTo(P.ankF[0] + 24, P.ankF[1] + 14); c.closePath(); }, C.shoe, S);
  // neck + head (3/4, facing left)
  shape(ctx, c => cap(c, [1224, 392], [1214, 350], 15, 15), S.skin, S);
  shape(ctx, c => { c.moveTo(1150, 300); c.quadraticCurveTo(1150, 252, 1200, 250); c.quadraticCurveTo(1252, 250, 1254, 304); c.quadraticCurveTo(1256, 352, 1222, 372); c.quadraticCurveTo(1196, 384, 1170, 368); c.lineTo(1160, 344); c.lineTo(1146, 336); c.lineTo(1154, 322); c.closePath(); }, S.skin, S);
  shape(ctx, c => { c.ellipse(1226, 318, 9, 15, 0, 0, 7); }, S.skin, S);
  shape(ctx, c => { c.moveTo(1146, 296); c.quadraticCurveTo(1142, 238, 1204, 236); c.quadraticCurveTo(1266, 236, 1262, 300); c.quadraticCurveTo(1258, 318, 1248, 326); c.lineTo(1238, 296); c.quadraticCurveTo(1210, 278, 1172, 290); c.lineTo(1160, 276); c.closePath(); }, C.hair, S);
  // face details: brow, eye, glasses, mouth
  const ink = S.faceInk;
  ctx.save(); ctx.strokeStyle = ink; ctx.lineCap = 'round';
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1160, 300); ctx.lineTo(1188, 304); ctx.stroke();
  ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(1176, 318, 4.5, 5.5, 0, 0, 7); ctx.fill();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(1176, 318, 17, 14, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(1193, 316); ctx.lineTo(1226, 312); ctx.stroke();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1162, 356); ctx.lineTo(1180, 354); ctx.stroke();
  ctx.restore();
  // flashlight between the hands, then both hands wrapped around it, then front arm on top
  shape(ctx, c => { cap(c, TORCH[0], TORCH[1], 13, 17); }, '#2a2c31', S, '#141518');
  shape(ctx, c => { c.ellipse(TORCH[1][0], TORCH[1][1], 9, 19, -0.23, 0, 7); }, '#fff6c8', S, '#e9d68a');
  hand(ctx, [1094, 520], S, -0.2);
  shape(ctx, c => { cap(c, P.shF, P.elbF, 24, 21); cap(c, P.elbF, P.wriF, 21, 17); }, C.top, S);
  hand(ctx, [1040, 500], S, -0.2);
}

function scene(ctx, S) {
  // wall, floor, door
  ctx.fillStyle = S.wall; ctx.fillRect(0, 0, W, H);
  if (S.wallLines) { ctx.fillStyle = S.wallLines; for (let x = 0; x < W; x += 120) ctx.fillRect(x, 0, 60, 900); }
  ctx.fillStyle = S.floor; ctx.fillRect(0, 900, W, 180); ctx.fillStyle = S.trim; ctx.fillRect(0, 890, W, 16);
  ctx.fillStyle = S.trim; ctx.fillRect(230, 150, 460, 760); ctx.fillStyle = S.door; ctx.fillRect(260, 180, 400, 716);
  ctx.fillStyle = S.door2; ctx.fillRect(300, 230, 320, 260); ctx.fillRect(300, 540, 320, 300);
  ctx.fillStyle = S.metal; ctx.beginPath(); ctx.arc(612, 560, 16, 0, 7); ctx.fill(); ctx.fillRect(520, 470, 90, 12);
  // chain lock
  ctx.strokeStyle = S.metal; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(560, 420); ctx.quadraticCurveTo(600, 470, 650, 430); ctx.stroke();
  // gap under the door with light and two feet shadows from the other side
  ctx.fillStyle = S.gap; ctx.fillRect(262, 890, 396, 10); ctx.fillStyle = S.ink2; ctx.fillRect(360, 890, 60, 10); ctx.fillRect(480, 890, 60, 10);
  // peephole
  ctx.fillStyle = S.ink2; ctx.beginPath(); ctx.arc(460, 360, 10, 0, 7); ctx.fill();
  // picture frame + side table + umbrella for depth
  ctx.fillStyle = S.trim; ctx.fillRect(1500, 260, 260, 190); ctx.fillStyle = S.frameIn; ctx.fillRect(1516, 276, 228, 158);
  ctx.fillStyle = S.furn; ctx.fillRect(1560, 700, 220, 30); ctx.fillRect(1576, 730, 16, 170); ctx.fillRect(1748, 730, 16, 170);
  ctx.fillStyle = S.furn2; ctx.fillRect(1600, 640, 70, 60);
}
function lightCone(ctx, S) {
  ctx.save(); ctx.globalCompositeOperation = S.coneMode || 'lighter';
  const g = ctx.createLinearGradient(968, 486, 400, 420); g.addColorStop(0, S.cone); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(968, 470); ctx.lineTo(300, 250); ctx.lineTo(320, 700); ctx.lineTo(968, 504); ctx.closePath(); ctx.fill();
  const r = ctx.createRadialGradient(470, 430, 10, 470, 430, 240); r.addColorStop(0, S.spot); r.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = r; ctx.fillRect(200, 150, 540, 560);
  ctx.restore();
}
function halftone(ctx, x0, y0, w, h, col, step = 14) {
  ctx.save(); ctx.fillStyle = col; for (let y = y0; y < y0 + h; y += step) for (let x = x0 + ((y / step) % 2) * step / 2; x < x0 + w; x += step) { ctx.beginPath(); ctx.arc(x, y, step * 0.28, 0, 7); ctx.fill(); } ctx.restore();
}
function bubble(ctx, x, y, w, h, text, S, tail) {
  ctx.save(); ctx.fillStyle = S.bubble; ctx.strokeStyle = S.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, h / 2, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tail[0], tail[1]); ctx.lineTo(x - 40, y + h / 2 - 8); ctx.lineTo(x + 10, y + h / 2 - 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = S.bubble; ctx.fillRect(x - 38, y + h / 2 - 16, 46, 14);
  ctx.fillStyle = '#111'; ctx.font = S.bubbleFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  text.split('\n').forEach((l, i, a) => ctx.fillText(l, x, y + (i - (a.length - 1) / 2) * 44)); ctx.restore();
}
function caption(ctx, text, sub) { // video-style subtitle
  ctx.save(); ctx.font = '92px Anton'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = '#0d0e11'; ctx.strokeText(text, W / 2, 1010); ctx.fillStyle = '#fff'; ctx.fillText(text, W / 2, 1010); ctx.restore();
}
function vignette(ctx, a) { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
const shadeBy = k => c => { const v = [1, 3, 5].map(i => Math.round(parseInt(c.slice(i, i + 2), 16) * k)); return '#' + v.map(x => x.toString(16).padStart(2, '0')).join(''); };

// ---- styles ----
const STY = {
  flat: { lw: 4, ink: '#1b1c21', faceInk: '#1b1c21', off: 12, light: [-1, -0.6], shadeOf: shadeBy(0.78), skin: '#e9b98f',
    hero: { top: '#d9a02e', top2: '#b9821c', pants: '#34405a', shoe: '#e9e6df', hair: '#3a2a20' },
    wall: '#5c6f86', wallLines: 'rgba(255,255,255,0.035)', floor: '#6b5544', trim: '#d9d2c3', door: '#8a5a3a', door2: '#7a4e32', metal: '#d8c08a', gap: '#ffe9a8', ink2: '#16171b',
    frameIn: '#7f9bb5', furn: '#6b4a33', furn2: '#c9c2b0', cone: 'rgba(255,240,190,0.35)', spot: 'rgba(255,240,190,0.35)', bubble: '#fff', bubbleFont: '800 36px Nunito' },
  comic: { lw: 7, ink: '#0a0a0c', faceInk: '#0a0a0c', off: 18, light: [-1, -0.3], shadeOf: () => '#0b0d12', skin: '#d9a77e', light2: '#c9c2b0',
    hero: { top: '#c48a2a', top2: '#9c6a1c', pants: '#2a3348', shoe: '#cfcabf', hair: '#1c140f' },
    wall: '#1d2a33', wallLines: 'rgba(0,0,0,0.25)', floor: '#16120f', trim: '#2b3a44', door: '#3a2a20', door2: '#2c2018', metal: '#8f8a7a', gap: '#ffb347', ink2: '#000',
    frameIn: '#24323d', furn: '#1f1712', furn2: '#2b3a44', cone: 'rgba(255,200,120,0.55)', spot: 'rgba(255,190,110,0.45)', bubble: '#f6f1e2', bubbleFont: '42px Anton' },
  bold: { lw: 0, ink: '#000', faceInk: '#120808', off: 22, light: [-1, -0.2], shadeOf: shadeBy(0.45), skin: '#e0a27a',
    hero: { top: '#e6a321', top2: '#b37a10', pants: '#1c2235', shoe: '#d6d0c4', hair: '#120c08' },
    wall: '#3b0f12', floor: '#120607', trim: '#5a171c', door: '#1a0a0b', door2: '#240d0f', metal: '#c9a46a', gap: '#ff3b2f', ink2: '#000',
    frameIn: '#2a0b0d', furn: '#1a0708', furn2: '#5a171c', cone: 'rgba(255,214,150,0.6)', spot: 'rgba(255,214,150,0.35)', bubble: '#fff', bubbleFont: '42px Anton' },
};

function render(name) {
  const S = STY[name], c = createCanvas(W, H), ctx = c.getContext('2d');
  scene(ctx, S);
  if (name === 'comic') { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H); }
  if (name === 'bold') { // huge window with a red moon behind, silhouette shapes
    ctx.fillStyle = '#e8401f'; ctx.beginPath(); ctx.arc(1560, 330, 150, 0, 7); ctx.fill(); ctx.fillStyle = '#3b0f12'; ctx.fillRect(1390, 160, 20, 360); ctx.fillRect(1390, 160, 360, 20); ctx.fillRect(1730, 160, 20, 360); ctx.fillRect(1390, 500, 360, 20); ctx.fillRect(1560, 160, 14, 360); }
  lightCone(ctx, S);
  hero(ctx, S);
  if (name === 'comic') {
    halftone(ctx, 1400, 0, 520, 900, 'rgba(0,0,0,0.35)', 16); halftone(ctx, 0, 0, 230, 900, 'rgba(0,0,0,0.35)', 16);
    vignette(ctx, 0.7);
    ctx.save(); ctx.fillStyle = '#ffd34d'; ctx.strokeStyle = '#000'; ctx.lineWidth = 5; ctx.fillRect(40, 40, 520, 110); ctx.strokeRect(40, 40, 520, 110);
    ctx.fillStyle = '#111'; ctx.font = '54px Anton'; ctx.fillText('DAY 2.  3:12 AM.', 70, 118); ctx.restore();
    bubble(ctx, 520, 760, 520, 190, 'HIII... IT\'S GARY.\nGOT ANY SUGAR?', S, [440, 880]);
    ctx.save(); ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeRect(8, 8, W - 16, H - 16); ctx.restore();
  } else if (name === 'flat') {
    vignette(ctx, 0.35);
    caption(ctx, 'GARY DOES NOT NEED SUGAR.');
    ctx.save(); ctx.translate(250, 120); ctx.rotate(-0.04); ctx.fillStyle = '#efe6cf'; ctx.fillRect(-170, -60, 340, 120); ctx.fillStyle = '#1e2026'; ctx.font = '84px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DAY 2', 0, 4); ctx.restore();
  } else {
    vignette(ctx, 0.6);
    ctx.save(); ctx.fillStyle = '#fff'; ctx.font = '150px Anton'; ctx.fillText('DAY 2', 80, 200); ctx.font = '900 40px Nunito'; ctx.fillStyle = '#ff6a4f'; ctx.fillText('TRUST NO ONE. ESPECIALLY GARY.', 86, 262); ctx.restore();
  }
  require('fs').writeFileSync(`${__dirname}/${name}.png`, c.toBuffer('image/png'));
  return c;
}
const cs = ['flat', 'comic', 'bold'].map(render);
const cmp = createCanvas(960, 1620), x = cmp.getContext('2d');
cs.forEach((c, i) => { x.drawImage(c, 0, i * 540, 960, 540); x.fillStyle = '#ff0'; x.font = '900 34px Nunito'; x.fillText(['A', 'B', 'C'][i], 18, i * 540 + 44); });
require('fs').writeFileSync(`${__dirname}/compare.png`, cmp.toBuffer('image/png'));
