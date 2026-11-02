// Episode 20 (The lightbulb cartel, Geneva 1924) — cast sheet in the channel style (howitsrun_style/, after emu_ep12 / lawnchair_ep17).
// Generic re-enactment people (no likenesses). Usage: node charsheet.js [out.png]  (default: bulbs_cast_sheet.png)
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people'); const SE = require('../howitsrun_style/sets');
const S = require('./bulbkit');
const { rr } = K;
const CS = require('./cast'); const F = CS.FACE;
function nameplate(ctx, x, y, a, b) { ST.label(ctx, a, x, y, 1, { size: 34, rot: -0.02, maxW: 330 }); ST.fitTxt(ctx, b, x, y + 58, 26, '#4A4A48', 380, 'center', K.F.xb); }

const cv = createCanvas(2160, 1920), ctx = cv.getContext('2d');
ST.bg(ctx, '#F7F5F0');
ctx.save(); ctx.translate(1080, 1500); ctx.scale(0.75, 0.75); S.meetRoom(ctx, 0, { window: 900 }); ctx.restore();
ctx.save(); ctx.fillStyle = 'rgba(247,245,240,0.6)'; ctx.fillRect(0, 0, 2160, 1920); ctx.restore();
ST.txt(ctx, 'THE LIGHTBULB CARTEL · GENEVA 1924 — CAST', 1080, 120, 62, '#171717');
ST.fitTxt(ctx, 'style: howitsrun_style/ (after emu_ep12 & lawnchair_ep17) · generic re-enactment people, no likenesses', 1080, 180, 32, '#6A6A68', 1900, 'center', K.F.xb);
const fy = 1120;
// the three executives shaking hands over the pile (frame 0 pose)
ctx.save(); ctx.translate(560, fy + 10); S.bulbPile(ctx, 520); ctx.restore();
P.person(ctx, 140, fy, 1.0, 1, CS.EXEC_C, { face: F('smug', [1, 0]) }, CS.ACC_C);
P.person(ctx, 400, fy, 1.0, 1, CS.EXEC_A, { face: F('grin', [1, 0]), armN: { hand: [190, -360], grip: 'fist' } }, CS.ACC_A);
P.person(ctx, 720, fy, 1.0, -1, CS.EXEC_B, { face: F('smug', [1, 0]), armN: { hand: [190, -360], grip: 'fist' } }, CS.ACC_B);
nameplate(ctx, 440, 1230, 'THE BULB MAKERS', 'three executives, 1920s suits');
// the lab technician with the stopwatch
P.person(ctx, 1060, fy, 1.0, 1, CS.TECH, { face: F('squint', [1, -0.2]), armN: { hand: [130, -380], grip: 'hold', item: g => S.stopwatch(g, 0.5, 1) } });
nameplate(ctx, 1080, 1230, 'THE TEST LAB', 'Switzerland, stopwatch');
// the factory owner (pays the fine)
P.person(ctx, 1420, fy, 1.0, 1, CS.OWNER, { face: F('worried', [1, 0]), armN: { hand: [140, -300], grip: 'pinch', item: g => S.note(g, 0.5) } }, CS.ACC_OWNER);
nameplate(ctx, 1440, 1230, 'FACTORY OWNER', 'pays the fine');
// the customer + the clerk
P.person(ctx, 1760, fy, 1.0, 1, CS.CUSTOMER, { face: F('skeptical', [1, 0]), armN: { hand: [130, -330], grip: 'hold', item: g => S.bulb(g, 0.28, { burnt: true }) } });
P.person(ctx, 2040, fy, 1.0, -1, CS.CLERK, { face: F('smile', [1, 0]) }, { tie: '#B5304A' });
nameplate(ctx, 1900, 1230, 'CUSTOMER · CLERK', 'buys the bulb again');
ctx.save(); ctx.fillStyle = '#E9E1CE'; rr(ctx, 40, 1400, 2080, 480, 24); ctx.fill(); ctx.restore();
ST.fitTxt(ctx, 'props: bulb (on / off / burnt out), the agreement, hours plate', 1080, 1450, 32, '#6A6A68', 1900, 'center', K.F.xb);
for (const [x, o] of [[200, { on: 1 }], [400, {}], [600, { burnt: true }]]) { ctx.save(); ctx.translate(x, 1840); S.bulb(ctx, 1, o); ctx.restore(); }
ctx.save(); ctx.translate(1000, 1660); S.agreement(ctx, 0.62, { stamp: 1 }); ctx.restore();
ctx.save(); ctx.translate(1650, 1660); S.hourPlate(ctx, 0.85, '2,000', 'HOURS'); ctx.restore();
ST.paper(ctx);
fs.writeFileSync(process.argv[2] || `${__dirname}/bulbs_cast_sheet.png`, cv.toBuffer('image/png')); console.log('sheet ok');
