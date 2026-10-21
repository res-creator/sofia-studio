// Cover 1080x1920 for "Your Tip Wasn't Extra": YOUR $9 TIP / CHANGED NOTHING?! — the phone with TIP $9, the driver, the money.
// v2: the hero group sits ~120 px higher (fully inside the profile-grid crop). TikTok-safe: title + hero inside the 3:4 grid crop (y 240..1680), nothing under the right rail, brand as text only. Usage: node cover.js
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr, hash } = K;
const { text } = require('../rent_ep4/rentkit');
const { brick, tipPhone, pointer, driver, card, BLUE } = require('./ddkit');
const W = 1080, H = 1920, c = createCanvas(W, H), x = c.getContext('2d');
x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
for (let i = 0; i < 14; i++) { x.save(); x.translate(hash(i) * W, hash(i + 40) * H); x.rotate(-0.25 + hash(i + 9) * 0.2); x.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.2)'][i % 3]; x.fillRect(-130, -22, 260, 44); x.restore(); }
x.fillStyle = C.yellow; x.beginPath(); x.arc(330, 960, 330, 0, 7); x.fill();
x.fillStyle = 'rgba(77,141,255,0.18)'; x.beginPath(); x.arc(720, 1140, 300, 0, 7); x.fill();
// headline
x.textAlign = 'center'; x.lineJoin = 'round'; x.font = `128px ${F.black}`; x.lineWidth = 20; x.strokeStyle = '#FFFDF8'; x.strokeText('YOUR $9 TIP', 500, 400); x.fillStyle = C.ink; x.fillText('YOUR $9 TIP', 500, 400);
x.font = `104px ${F.black}`; const tw = Math.min(900, x.measureText('CHANGED NOTHING?!').width + 70);
x.save(); x.translate(500, 550); x.rotate(-0.03); cut(x, () => rr(x, -tw / 2, -84, tw, 156, 14), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(x, 'CHANGED NOTHING?!', 0, 40, 104, '#FFFFFF', F.black, 'center', tw - 50); x.restore();
// the phone with TIP $9 + the tapping hand
x.save(); x.translate(300, 900); x.rotate(-0.07); x.scale(1.0, 1.0); tipPhone(x, { tip: '$9', flash: 0.6 }); x.restore();
x.save(); x.translate(395, 1038); x.scale(0.8, 0.8); pointer(x, 0.5); x.restore();
// yellow money flying to the driver, the driver's total stuck at $10
const B = [[560, 690, -0.3], [640, 790, 0.2], [540, 840, 0.35], [700, 670, -0.15], [600, 930, -0.25]];
for (const [bx, by, r] of B) { x.save(); x.translate(bx, by); x.rotate(r); x.scale(0.85, 0.85); brick(x, 'y'); x.restore(); }
x.save(); x.translate(735, 900); x.rotate(0.05); x.scale(0.75, 0.75); card(x, 'DRIVER GETS', '$10', BLUE, { w: 360, h: 196, as: 120 }); x.restore();
driver(x, 700, 1520, 1.05, { look: -0.5, mood: 'flat', eyes: 1, arms: 'shrug', sweat: 1 });
x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.55; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
require('fs').writeFileSync(__dirname + '/doordash_tip_v2_cover.png', c.toBuffer('image/png'));
