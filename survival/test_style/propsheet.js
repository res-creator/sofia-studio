// Proportion sheet: old D vs D2 (hero, Gary -10% legs, Gary -20% legs). Usage: node propsheet.js out.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas'); require('../lib');
const R = require('./rig'), P = require('./props');
const W = 2400, H = 1080, FL = 900, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = '#e9e4f2'; x.fillRect(0, 0, W, H); x.fillStyle = '#cfc6dc'; x.fillRect(0, FL, W, H - FL);
x.strokeStyle = 'rgba(60,40,90,0.18)'; x.lineWidth = 2; x.font = '700 20px Nunito'; x.fillStyle = 'rgba(60,40,90,0.5)';
for (let i = 1; i <= 4; i++) { const y = FL - i * 162; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); x.fillText(i + ' head', 8, y - 6); }
function put(cx, skin, name, label, garyVar) {
  const base = Object.assign({}, R.SKINS[skin], { garyVar }), { S, C } = R.who(base, name);
  const pose = { x: cx, ground: FL };
  let J, o = { t: 0.3 };
  if (name === 'gary') { const J0 = R.solve(S, pose); const m = P.mug([J0.shN[0] - 80, J0.shN[1] + S.ua * 0.9], 1.05); J = R.solveGrip(S, pose, { near: m.grip }, label); o.holdNear = ctx => P.drawMug(ctx, S, m); }
  else J = R.solve(S, pose, label);
  R.drawChar(x, S, C, J, name === 'gary' ? { mouth: 'grin', brow: 'up', blood: 1, look: [-0.5, 0] } : { mouth: 'smile', brow: 'neutral', look: [-0.5, 0] }, o);
  const top = J.head[1] - S.headR * (name === 'gary' ? 1.0 : 1.4), tot = FL - top, legs = (S.ankle + S.thigh + S.shin);
  x.fillStyle = '#2a1f3d'; x.textAlign = 'center'; x.font = '900 30px Nunito'; x.fillText(label, cx, 960);
  x.font = '700 22px Nunito'; x.fillText(`${(tot / (S.headR * 1.98)).toFixed(1)} heads · legs ${Math.round(legs / tot * 100)}%`, cx, 995);
  x.fillText(`arm ${Math.round(20 * S.limbW * 1.1 * 2)}px · leg ${Math.round(26 * S.limbW * 1.2 * 2)}px`, cx, 1025); x.textAlign = 'left';
}
put(220, 'D', 'hero', 'OLD hero'); put(560, 'D', 'gary', 'OLD Gary');
x.fillStyle = '#7a6a9a'; x.fillRect(800, 60, 6, 960);
put(1080, 'D2', 'hero', 'NEW hero'); put(1480, 'D2', 'gary', 'Gary  -10% legs', '10'); put(1900, 'D2', 'gary', 'Gary  -20% legs', '20');
x.fillStyle = '#2a1f3d'; x.font = '900 40px Nunito'; x.fillText('Style D proportions: before  |  after', 20, 50);
console.log(R.QA.length ? R.QA.join('\n') : 'QA ok');
require('fs').writeFileSync(process.argv[2], c.toBuffer('image/png'));
