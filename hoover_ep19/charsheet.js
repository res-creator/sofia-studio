// Episode 19 (Hoover free flights, UK 1992) — character sheet in the channel style (howitsrun_style/, after emu_ep12 / lawnchair_ep17).
// Generic re-enactment people (no likenesses): the customer, the Hoover manager, the travel agent. Usage: node charsheet.js out.png
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig'); const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people'); const SE = require('../howitsrun_style/sets');
const { C, rr } = K;
const { CUSTOMER, MANAGER, AGENT, vacBox, PHONE } = require('./cast');
function nameplate(ctx, x, y, a, b) { ST.label(ctx, a, x, y, 1, { size: 44, rot: -0.02 }); ST.fitTxt(ctx, b, x, y + 62, 28, '#4A4A48', 330, 'center', K.F.xb); }

const cv = createCanvas(2160, 1920), ctx = cv.getContext('2d');
// background: a UK street (left) and an office interior (right), soft
ST.bg(ctx, '#F7F5F0');
ctx.save(); ctx.translate(1080, 1500); ctx.scale(0.75, 0.75); SE.room(ctx, 0, { wall: '#EFE3CB', floor: 'tile', window: 900 }); ctx.restore();
ctx.save(); ctx.fillStyle = 'rgba(247,245,240,0.55)'; ctx.fillRect(0, 0, 2160, 1920); ctx.restore();
ST.txt(ctx, 'HOOVER FREE FLIGHTS · UK 1992 — CAST', 1080, 120, 64, '#171717');
ST.fitTxt(ctx, 'style: howitsrun_style/ (after emu_ep12 & lawnchair_ep17) · generic re-enactment people', 1080, 180, 34, '#6A6A68', 1900, 'center', K.F.xb);
// 1) the customer: standing, then holding the vacuum box, reaction bust
const fy = 1180;
P.person(ctx, 170, fy, 1.15, 1, CUSTOMER, { face: R.expr('smile', { look: [1, 0] }) });
P.person(ctx, 560, fy, 1.15, -1, CUSTOMER, { face: R.expr('grin', { look: [1, -0.1] }), armN: { hand: [130, -190], grip: 'hold', item: g => vacBox(g, 0.72, -1) }, armF: { hand: [100, -185], grip: 'hold' } });
nameplate(ctx, 380, 1290, 'THE CUSTOMER', 'buys a vacuum for the free flights');
// 2) the manager: standing with a tie, then on the phone (worried), reaction bust
P.person(ctx, 840, fy, 1.15, 1, MANAGER, { face: R.expr('smug', { look: [1, 0] }) }, { tie: C.red });
P.person(ctx, 1220, fy, 1.15, -1, MANAGER, P.POSE.phone(R.expr('shocked', { look: [1, 0] }), PHONE), { tie: C.red });
nameplate(ctx, 1040, 1290, 'THE MANAGER', 'Hoover UK, dark suit + red tie');
// 3) the travel agent: standing, then seated at the desk with the phone
P.person(ctx, 1520, fy, 1.15, 1, AGENT, { face: R.expr('smile', { look: [1, 0] }) });
P.seated(ctx, 1780, fy, 1.0, 1, AGENT, P.POSE.phone(R.expr('worried', { look: [1, 0.1] }), PHONE));
ctx.save(); ctx.translate(0, fy); SE.desk(ctx, 2010, 300, -290, '#8A5A34'); ctx.restore();
nameplate(ctx, 1700, 1290, 'THE TRAVEL AGENT', 'blazer, at the booking desk');
// reaction close-ups (chest-up), used rarely
ctx.save(); ctx.fillStyle = '#E9E1CE'; rr(ctx, 40, 1400, 2080, 480, 24); ctx.fill(); ctx.restore();
ST.fitTxt(ctx, 'reaction close-ups (short, face above the subtitles)', 1080, 1450, 32, '#6A6A68', 1900, 'center', K.F.xb);
P.personBust(ctx, 380, 1800, 1.15, CUSTOMER, { face: R.expr('surprised', { look: [0, 0] }) });
P.personBust(ctx, 1040, 1800, 1.15, MANAGER, { face: R.expr('worried', { look: [0, 0] }) }, { tie: C.red });
P.personBust(ctx, 1700, 1800, 1.15, AGENT, { face: R.expr('skeptical', { look: [0, 0] }) });
ST.paper(ctx);
fs.writeFileSync(process.argv[2] || `${__dirname}/hoover_cast_sheet.png`, cv.toBuffer('image/png')); console.log('sheet ok');
