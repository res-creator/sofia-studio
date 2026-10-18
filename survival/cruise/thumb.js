// Thumbnail: DAY 1 (sunset pool deck, waiter with a tray) | DAY 30 (engine room, BRIDGE OVERRIDE, frying pan). node thumb.js out.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const C = require('./lib/core'), K = require('./lib/cast'), SH = require('./lib/ship'), PR = require('./lib/props'), R = K.R;
const W = 1920, H = 1080, c = createCanvas(W, H), x = c.getContext('2d'), F = SH.FLOOR, W8 = K.WAITER;
const mir = (X, p) => [2 * X - p[0], p[1]];
// left half: day 1
x.save(); x.beginPath(); x.moveTo(0, 0); x.lineTo(1010, 0); x.lineTo(910, H); x.lineTo(0, H); x.clip();
x.save(); x.translate(480, 600); x.scale(1.8, 1.8); x.translate(-1500, -560); SH.poolDeck(x, 1, {});
{ const pose = { x: 1560, ground: F, lean: 0.03 }, J0 = R.solve(W8.S, pose), tr = PR.tray([J0.shN[0] - 150, J0.shN[1] + 40], 0);
  K.person(x, W8, { pose, grips: { near: tr.grip }, e: { eyes: 'happy', brow: 'up', mouth: 'smile', look: [-0.6, 0] }, t: 0.4, holdNear: q => PR.drawTray(q, tr) }, 'thumb'); }
x.restore(); x.restore();
// right half: day 30
x.save(); x.beginPath(); x.moveTo(1010, 0); x.lineTo(W, 0); x.lineTo(W, H); x.lineTo(910, H); x.clip();
x.save(); x.translate(1440, 600); x.scale(1.7, 1.7); x.translate(-1820, -440);
SH.engineRoom(x, 1, { running: true, override: true, rudder: 0.8, fuel: 0.05, cctv: (q, t, X, Y, w, h) => SH.cctvBridge(q, t, X, Y, w, h, { turn: 0.6 }) });
{ const HX = 1700, pose = { x: HX, ground: 700, crouch: 0.15, lean: 0.05 }, J0 = R.solve(W8.S, pose);
  K.person(x, W8, { pose, flip: true, grips: { near: mir(HX, [HX + 40, J0.shN[1] + 130]) }, nearHand: 'fist', e: { eyes: 'wide', brow: 'worried', mouth: 'o', look: [0.4, -0.9], sweat: 1 }, t: 0.4, holdNear: (q, J) => PR.drawPan(q, PR.pan([J.wN[0], J.wN[1]], -2.5, 150)) }, 'thumb'); }
SH.darkness(x, 0.5, [{ x: 1930, y: 480, r: 520 }, { x: 1700, y: 380, r: 420 }]); C.glow(x, 1930, 480, 500, 'rgba(255,40,30,0.25)');
x.restore(); x.restore();
// divider + labels
R.line(x, [[1010, -10], [910, H + 10]], 26, '#111'); R.line(x, [[1010, -10], [910, H + 10]], 12, '#ffd23f');
C.outlined(x, 'DAY 1', 250, 130, 190, '#ffd23f', { lw: 26 }); C.outlined(x, 'DAY 30', 1640, 130, 190, '#ff4a3a', { lw: 26 });
require('fs').writeFileSync(process.argv[2], c.toBuffer('image/png'));
console.log([...new Set(R.QA)].join('\n') || 'QA ok');
