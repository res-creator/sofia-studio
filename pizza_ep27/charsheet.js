// Episode 27 (Bitcoin Pizza, 2010) — character sheet in the channel style (after hoover_ep19/charsheet.js). Usage: node charsheet.js out.png
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people'); const SE = require('../howitsrun_style/sets');
const { C, rr } = K; const { LASZLO, KID, pizzaBox, coin, gpu, laptop } = require('./cast');
function nameplate(ctx, x, y, a, b) { ST.label(ctx, a, x, y, 1, { size: 44, rot: -0.02 }); ST.fitTxt(ctx, b, x, y + 62, 28, '#4A4A48', 380, 'center', K.F.xb); }
const cv = createCanvas(2160, 1920), ctx = cv.getContext('2d');
ST.bg(ctx, '#F7F5F0'); ctx.save(); ctx.translate(1080, 1500); ctx.scale(0.75, 0.75); SE.room(ctx, 0, { wall: '#EFE3CB', floor: 'tile', window: 900 }); ctx.restore();
ctx.save(); ctx.fillStyle = 'rgba(247,245,240,0.55)'; ctx.fillRect(0, 0, 2160, 1920); ctx.restore();
ST.txt(ctx, 'BITCOIN PIZZA · 2010 — CAST', 1080, 120, 64, '#171717');
ST.fitTxt(ctx, 'style: howitsrun_style/ · generic re-enactment people, no likenesses', 1080, 180, 34, '#6A6A68', 1900, 'center', K.F.xb);
const fy = 1180;
P.person(ctx, 200, fy, 1.15, 1, LASZLO, { face: R.expr('smile', { look: [1, 0] }) });
P.person(ctx, 600, fy, 1.15, -1, LASZLO, P.POSE.hold(R.expr('grin', { look: [1, -0.1] }), g => pizzaBox(g, 0.55, 0, -1)));
nameplate(ctx, 400, 1290, 'LASZLO', 'programmer · Florida · dark hoodie');
P.person(ctx, 1000, fy, 1.15, 1, KID, P.POSE.phone(R.expr('smug', { look: [1, 0] }), g => { rr(g, -14, -60, 28, 100, 8); R.fillStroke(g, '#2A2A30', 4); }));
P.person(ctx, 1360, fy, 1.15, -1, KID, P.POSE.shrug(R.expr('grin', { look: [1, 0] })));
nameplate(ctx, 1180, 1290, 'THE KID', '"jercos" · California · orange tee');
ctx.save(); ctx.translate(1720, 1060); pizzaBox(ctx, 1.0, 0); ctx.restore(); ctx.save(); ctx.translate(1720, 1180); pizzaBox(ctx, 1.0, 1); ctx.restore();
ctx.save(); ctx.translate(1960, 760); coin(ctx, 1.2); ctx.restore(); ctx.save(); ctx.translate(1700, 760); gpu(ctx, 0.8); ctx.restore(); ctx.save(); ctx.translate(1840, 560); laptop(ctx, 0.9); ctx.restore();
nameplate(ctx, 1820, 1290, 'PROPS', 'pizza box · ₿ coin · GPU · laptop');
ctx.save(); ctx.fillStyle = '#E9E1CE'; rr(ctx, 40, 1400, 2080, 480, 24); ctx.fill(); ctx.restore();
ST.fitTxt(ctx, 'reaction close-ups (short, face above the subtitles)', 1080, 1450, 32, '#6A6A68', 1900, 'center', K.F.xb);
P.personBust(ctx, 520, 1800, 1.15, LASZLO, { face: R.expr('shocked', { look: [0, 0] }) });
P.personBust(ctx, 1080, 1800, 1.15, LASZLO, { face: R.expr('skeptical', { look: [1, 0] }) });
P.personBust(ctx, 1640, 1800, 1.15, KID, { face: R.expr('smug', { look: [0, 0] }) });
ST.paper(ctx);
fs.writeFileSync(process.argv[2] || `${__dirname}/pizza_cast_sheet.png`, cv.toBuffer('image/png')); console.log('sheet ok');
