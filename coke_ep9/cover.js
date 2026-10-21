// Cover 1080x1920 for "Coca-Cola's Impossible Coin": COCA-COLA / WANTED THIS COIN?! — the giant 7½¢ coin (the proposal, tagged
// NEVER MINTED) and the contour bottle. TikTok-safe: title + hero inside the 3:4 grid crop (y 240..1680), nothing under the right rail,
// brand as text only (no logo). Usage: node cover.js
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr, hash, tag } = K;
const { text } = require('../rent_ep4/rentkit');
const P = require('./cokekit');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
for (let i = 0; i < 16; i++) { x.save(); x.translate(hash(i) * W, hash(i + 40) * H); x.rotate(-0.25 + hash(i + 9) * 0.2); x.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.2)'][i % 3]; x.fillRect(-130, -22, 260, 44); x.restore(); }
const g = x.createRadialGradient(560, 1020, 0, 560, 1020, 520); g.addColorStop(0, 'rgba(255,200,87,0.85)'); g.addColorStop(1, 'rgba(255,200,87,0)'); x.fillStyle = g; x.beginPath(); x.arc(560, 1020, 520, 0, 7); x.fill();
// headline: COCA-COLA / WANTED THIS COIN?! (the key words on a red strip)
x.textAlign = 'center'; x.lineJoin = 'round'; x.font = `140px ${F.black}`; x.lineWidth = 22; x.strokeStyle = '#FFFDF8'; x.strokeText('COCA-COLA', 490, 410); x.fillStyle = C.ink; x.fillText('COCA-COLA', 490, 410);
x.font = `100px ${F.black}`; const tw = Math.min(900, x.measureText('WANTED THIS COIN?!').width + 70);
x.save(); x.translate(490, 560); x.rotate(-0.03); cut(x, () => rr(x, -tw / 2, -82, tw, 152, 14), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(x, 'WANTED THIS COIN?!', 0, 38, 100, '#FFFFFF', F.black, 'center', tw - 50); x.restore();
// the bottle behind, the giant coin in front
x.save(); x.translate(250, 1560); x.rotate(-0.08); x.scale(1.05, 1.05); P.bottle(x, {}); x.restore();
x.save(); x.translate(590, 1060); x.rotate(0.04); P.coin(x, 330, { face: 'half', spin: 0.28, shine: 0.35 }); x.restore();
tag(x, 'NEVER MINTED', 640, 1470, { size: 50, bg: C.ink, rot: -0.04 });
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.55; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(__dirname + '/cokes_impossible_coin_cover.png', c.toBuffer('image/png'));
