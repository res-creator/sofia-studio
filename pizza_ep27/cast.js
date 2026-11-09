// Episode 27 (Bitcoin Pizza, 2010) cast in the channel style (howitsrun_style/): Laszlo (programmer, Jacksonville FL) and the kid in California
// who ordered the pizzas — generic re-enactment people (no likenesses) — plus the props: pizza box, BTC coin, GPU, laptop. Brand names as plain text only.
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig'); const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people');
const { rr } = K;
const LASZLO = { ...P.LOOKS.casual, skin: '#EDC3A0', hair: '#4A3020', hairStyle: 'short', top: '#3A3F4A', cuff: '#2E323B', pants: '#2E3A59', shoes: '#F4F1E8', sole: '#C9C1B1', zip: 1, iris: '#3A2414', brow: '#3A2414' };   // dark hoodie, 2010 coder
const KID = { ...P.LOOKS.casual, skin: '#E3A97E', hair: '#2A1A10', hairStyle: 'short', top: '#D9822B', cuff: '#B86A1E', pants: '#3E4F78', shoes: '#C9302C', sole: '#F4F1E8', iris: '#3A2414', brow: '#2A1A10' };      // orange tee, red sneakers
// pizza box (closed or open), base centre at 0
function pizzaBox(ctx, s = 1, open = 0, flip = 1) { ctx.save(); ctx.scale(s * flip, s);
  CL.cutout(ctx, () => rr(ctx, -150, -40, 300, 40, 6), '#E9DCC0', { elev: 1 });
  if (open > 0) { ctx.fillStyle = '#E8A73A'; ctx.beginPath(); ctx.ellipse(0, -40, 130, 26, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#C9302C'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(-90 + (i % 5) * 45, -44 + Math.floor(i / 5) * 10, 12, 5, 0, 0, 7); ctx.fill(); } }
  ctx.save(); ctx.translate(-150, -40); ctx.rotate(-1.9 * open); CL.cutout(ctx, () => rr(ctx, 0, -8, 300, 14, 4), '#F2E8D2', { elev: 1 }); ctx.restore();
  if (open < 0.5) { ctx.save(); ST.fitTxt(ctx, "PAPA JOHN'S", 0, -54, 34, '#2E7D4F', 260); ctx.restore(); } ctx.restore(); }
// a gold BTC coin, centre at 0
function coin(ctx, s = 1) { ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#E8A73A'; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#171717'; ctx.stroke();
  ctx.fillStyle = '#F6C65B'; ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fill(); ST.fitTxt(ctx, '₿', 0, 22, 62, '#171717', 80); ctx.restore(); }
// a graphics card (GPU), centre at 0
function gpu(ctx, s = 1) { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -150, -55, 300, 110, 12), '#3A3F4A', { elev: 1 });
  for (const x of [-70, 60]) { ctx.fillStyle = '#22252C'; ctx.beginPath(); ctx.arc(x, 0, 40, 0, 7); ctx.fill(); ctx.strokeStyle = '#8A8F98'; ctx.lineWidth = 4; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + Math.cos(k) * 36, Math.sin(k) * 36); ctx.stroke(); } }
  ctx.fillStyle = '#E8A73A'; ctx.fillRect(-140, 50, 200, 12); ctx.restore(); }
function laptop(ctx, s = 1) { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -120, -170, 240, 160, 10), '#2A2A30', { elev: 1 }); ctx.fillStyle = '#E8F0FF'; ctx.fillRect(-104, -156, 208, 130);
  ctx.fillStyle = '#4A78BA'; ctx.fillRect(-104, -156, 208, 20); for (let i = 0; i < 5; i++) { ctx.fillStyle = '#9AA4B4'; ctx.fillRect(-90, -124 + i * 20, 160 - (i % 2) * 40, 8); }
  CL.cutout(ctx, () => rr(ctx, -150, -10, 300, 18, 6), '#8A8F98', { elev: 1 }); ctx.restore(); }
module.exports = { LASZLO, KID, pizzaBox, coin, gpu, laptop };
