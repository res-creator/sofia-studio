// Episode 23 (Who said breakfast matters?) — character sheet in the channel style (howitsrun_style/, after emu_ep12 / lawnchair_ep17).
// Generic re-enactment people (no likenesses) + the cereal-box mascot (a prop with a simple face). Usage: node charsheet.js [out.png]
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people'); const SE = require('../howitsrun_style/sets');
const S = require('./bfkit');
const { C, rr } = K;
const { DAD, SANMAN, PACKER, PRMAN, DOCTOR, NEWSBOY, ACC, cerealBox, boxArm } = S.CS;
function nameplate(ctx, x, y, a, b) { ST.label(ctx, a, x, y, 1, { size: 30, rot: -0.02, maxW: 270 }); ST.fitTxt(ctx, b, x, y + 52, 24, '#4A4A48', 270, 'center', K.F.xb); }

const cv = createCanvas(2160, 1920), ctx = cv.getContext('2d');
ST.bg(ctx, '#F7F5F0');
ctx.save(); ctx.translate(1080, 1260); ctx.scale(0.75, 0.75); SE.room(ctx, 0, { wall: '#EFE3CB', floor: 'wood', window: 1000 }); ctx.restore();
ctx.save(); ctx.fillStyle = 'rgba(247,245,240,0.55)'; ctx.fillRect(0, 0, 2160, 1920); ctx.restore();
ST.txt(ctx, 'WHO SAID BREAKFAST MATTERS? · USA 1917 / 1920s — CAST', 1080, 110, 58, '#171717');
ST.fitTxt(ctx, 'style: howitsrun_style/ (after emu_ep12 & lawnchair_ep17) · generic re-enactment people, no likenesses', 1080, 165, 32, '#6A6A68', 1900, 'center', K.F.xb);
const fy = 960, F = (n, l = [1, 0]) => R.expr(n, { look: l });
// the cereal box at the podium
ctx.save(); ctx.translate(230, fy - 40); cerealBox(ctx, 0.75, { face: 'smile', look: [0, 0] }); ctx.restore();
ctx.save(); ctx.translate(230, fy); S.podium(ctx, 0.6); ctx.translate(0, -246); S.mics(ctx, 0.6); ctx.restore();
nameplate(ctx, 230, 1070, 'THE CEREAL BOX', 'mascot prop, suit, simple face');
P.seated(ctx, 520, fy, 1.0, 1, DAD, { face: F('smile'), armN: { hand: [150, -340], grip: 'hold', item: S.spoon } }, ACC.DAD);
nameplate(ctx, 560, 1070, '1950s DAD', 'cardigan + glasses');
P.person(ctx, 820, fy, 1.0, 1, SANMAN, { face: F('smile') }, ACC.SANMAN);
nameplate(ctx, 840, 1070, 'CORN-FLAKES MAN', 'sanitarium, white suit');
P.person(ctx, 1110, fy, 1.0, 1, PACKER, { face: F('smug') }, ACC.PACKER);
nameplate(ctx, 1110, 1070, 'BACON SELLER', 'meatpacker, brown suit + hat');
P.person(ctx, 1380, fy, 1.0, -1, PRMAN, { face: F('smug'), armN: { hand: [150, -360], grip: 'point' } }, ACC.PRMAN);
nameplate(ctx, 1380, 1070, 'THE PR MAN', 'navy suit + red tie');
P.person(ctx, 1650, fy, 1.0, -1, DOCTOR, { face: F('thinking') }, ACC.DOCTOR);
nameplate(ctx, 1650, 1070, 'THE DOCTOR', 'white coat + glasses');
P.person(ctx, 1930, fy, 1.0, -1, NEWSBOY, { face: F('grin'), armN: { hand: [140, -400], grip: 'hold', item: S.paperItem } }, ACC.NEWSBOY);
nameplate(ctx, 1930, 1070, 'NEWSBOY', 'cap, shouting');
// props lineup
ctx.save(); ctx.fillStyle = '#E9E1CE'; rr(ctx, 40, 1180, 2080, 700, 24); ctx.fill(); ctx.restore();
ST.fitTxt(ctx, 'props', 1080, 1230, 32, '#6A6A68', 1900, 'center', K.F.xb);
ctx.save(); ctx.translate(200, 1560); S.magazine(ctx, 0.42); ctx.restore();
ctx.save(); ctx.translate(470, 1700); S.crate(ctx, 0.6); ctx.restore();
ctx.save(); ctx.translate(730, 1720); S.mountain(ctx, 0.6); ctx.restore();
ctx.save(); ctx.translate(730, 1820); S.lightPlate(ctx, 0.5); ctx.restore();
ctx.save(); ctx.translate(980, 1780); S.mailSack(ctx, 0.6, 0); ctx.restore();
ctx.save(); ctx.translate(1230, 1560); S.newspaper(ctx, 0.33); ctx.restore();
ctx.save(); ctx.translate(1500, 1600); S.pan(ctx, 0.5, 0.3); ctx.restore();
ctx.save(); ctx.translate(1830, 1560); ctx.scale(0.45, 0.45); S.chart(ctx, 1); ctx.restore();
ctx.save(); ctx.translate(2040, 1820); S.register(ctx, 0.35, 1); ctx.restore();
ST.paper(ctx);
fs.writeFileSync(process.argv[2] || `${__dirname}/breakfast_cast_sheet.png`, cv.toBuffer('image/png')); console.log('sheet ok');
