// Episode 25 (More Doctors Smoke Camels, USA 1946) — character sheet in the channel style (howitsrun_style/, after emu_ep12 / lawnchair_ep17).
// Generic re-enactment people (no likenesses): the doctor, the ad-agency man, doctor variations + the sealed props. Usage: node charsheet.js [out.png]
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people'); const SE = require('../howitsrun_style/sets');
const { C, rr } = K;
const CS = require('./cast');
function nameplate(ctx, x, y, a, b) { ST.label(ctx, a, x, y, 1, { size: 44, rot: -0.02 }); ST.fitTxt(ctx, b, x, y + 62, 28, '#4A4A48', 380, 'center', K.F.xb); }

const cv = createCanvas(2160, 1920), ctx = cv.getContext('2d');
ST.bg(ctx, '#F7F5F0');
ctx.save(); ctx.translate(1080, 1500); ctx.scale(0.75, 0.75); SE.room(ctx, 0, { wall: '#E8E2D0', floor: 'tile', window: 900 }); ctx.restore();
ctx.save(); ctx.fillStyle = 'rgba(247,245,240,0.55)'; ctx.fillRect(0, 0, 2160, 1920); ctx.restore();
ST.txt(ctx, 'MORE DOCTORS SMOKE CAMELS · USA 1946 — CAST', 1080, 120, 60, '#171717');
ST.fitTxt(ctx, 'style: howitsrun_style/ · generic re-enactment people · sealed packs only, no smoking, no logos', 1080, 180, 34, '#6A6A68', 1900, 'center', K.F.xb);
const fy = 1180;
CS.doctor(ctx, 200, fy, 1.15, 1, CS.DOCTOR, { face: R.expr('smile', { look: [1, 0] }) }, { mirror: true });
CS.doctor(ctx, 600, fy, 1.15, -1, CS.DOCTOR, { face: R.expr('thinking', { look: [1, 0.6] }), armN: { hand: [120, -250], grip: 'hold', item: g => CS.carton(g, 0.6) }, armF: { hand: [96, -245], grip: 'hold' } }, { mirror: true });
nameplate(ctx, 400, 1290, 'THE DOCTOR', 'white coat, stethoscope, head mirror');
CS.adman(ctx, 900, fy, 1.15, 1, CS.AGENT, { face: R.expr('smug', { look: [1, 0] }), armN: { hand: [130, -330], grip: 'hold', item: g => CS.clipboard(g, 0.55) } });
CS.adman(ctx, 1260, fy, 1.15, -1, CS.AGENT, { face: R.expr('grin', { look: [1, 0] }), armN: { hand: [120, -250], grip: 'hold', item: g => CS.carton(g, 0.6) }, armF: { hand: [96, -245], grip: 'hold' } });
nameplate(ctx, 1080, 1290, 'THE AD MAN', 'the ad agency · 1940s suit + fedora');
CS.DOCS.slice(1).forEach((L, i) => CS.doctor(ctx, 1500 + i * 165, fy, 0.85, i % 2 ? -1 : 1, L, { face: R.expr(['smile', 'neutral', 'skeptical', 'smile'][i], { look: [1, 0] }) }));
nameplate(ctx, 1750, 1290, 'THE DOCTORS', 'convention crowd variations');
ctx.save(); ctx.fillStyle = '#E9E1CE'; rr(ctx, 40, 1400, 2080, 480, 24); ctx.fill(); ctx.restore();
ST.fitTxt(ctx, 'props: sealed pack and carton (plain, no logo), survey clipboard', 1080, 1450, 32, '#6A6A68', 1900, 'center', K.F.xb);
ctx.save(); ctx.translate(400, 1680); CS.pack(ctx, 1.6); ctx.restore();
ctx.save(); ctx.translate(900, 1680); CS.carton(ctx, 1.2, { tag: 'FREE' }); ctx.restore();
ctx.save(); ctx.translate(1550, 1680); CS.clipboard(ctx, 0.75, 1); ctx.restore();
ST.paper(ctx);
fs.writeFileSync(process.argv[2] || `${__dirname}/camel_cast_sheet.png`, cv.toBuffer('image/png')); console.log('sheet ok');
