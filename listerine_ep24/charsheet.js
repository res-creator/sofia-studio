// Episode 24 (Listerine: floor cleaner → mouthwash, 1880s–1920s) — character sheet in the channel style (howitsrun_style/).
// Generic re-enactment people (no likenesses). Usage: node charsheet.js [out.png]
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people'); const SE = require('../howitsrun_style/sets');
const { C, rr } = K;
const CS = require('./cast');
function nameplate(ctx, x, y, a, b) { ST.label(ctx, a, x, y, 1, { size: 36, rot: -0.02, maxW: 400 }); ST.fitTxt(ctx, b, x, y + 58, 26, '#4A4A48', 380, 'center', K.F.xb); }
const cv = createCanvas(2160, 1920), ctx = cv.getContext('2d');
ST.bg(ctx, '#F7F5F0');
ctx.save(); ctx.translate(1080, 1500); ctx.scale(0.75, 0.75); SE.room(ctx, 0, { wall: '#EFE3CB', floor: 'tile', window: 900 }); ctx.restore();
ctx.save(); ctx.fillStyle = 'rgba(247,245,240,0.55)'; ctx.fillRect(0, 0, 2160, 1920); ctx.restore();
ST.txt(ctx, 'FLOOR CLEANER → MOUTHWASH · 1880s–1920s — CAST', 1080, 110, 60, '#171717');
ST.fitTxt(ctx, 'style: howitsrun_style/ (after emu_ep12 & lawnchair_ep17) · generic re-enactment people · amber bottle, no logo', 1080, 166, 30, '#6A6A68', 1900, 'center', K.F.xb);
const f = R.expr, fy = 820;
P.person(ctx, 160, fy, 0.95, 1, CS.JANITOR, { face: f('neutral', { look: [1, 0.3] }) }, { cap: ['#5A606B', null] });
P.person(ctx, 430, fy, 0.95, -1, CS.GARGLER, { face: f('squint', { look: [1, -0.6] }), headTilt: -0.25, armN: { hand: [96, -470], grip: 'hold', item: g => CS.glass(g, 0.8) } }, { tie: C.red });
P.person(ctx, 700, fy, 0.95, 1, CS.SURGEON, { face: f('neutral', { look: [1, 0.3] }), armN: { hand: [140, -300], grip: 'hold', item: g => CS.bottle(g, 0.45) } }, { stache: '#7A5A3A' });
P.person(ctx, 980, fy, 0.95, -1, CS.PHARMACIST, { face: f('tired', { look: [1, 0] }) });
P.person(ctx, 1260, fy, 0.95, 1, CS.LAMBERT, { face: f('thinking', { look: [1, -0.5] }) }, { tie: C.red });
P.person(ctx, 1530, fy, 0.95, -1, CS.ADMAN1, { face: f('smile', { look: [1, 0] }) });
P.person(ctx, 1790, fy, 0.95, 1, CS.ADMAN2, { face: f('grin', { look: [1, 0] }) }, { tie: '#2E3A59' });
nameplate(ctx, 300, fy + 90, 'JANITOR + GARGLER', 'frame 0 / end card');
nameplate(ctx, 840, fy + 90, 'SURGEON · PHARMACIST', '1880s antiseptic · dusty drugstore');
nameplate(ctx, 1260, fy + 90, 'THE BOSS’S SON', 'Gerard Lambert, generic drawing');
nameplate(ctx, 1660, fy + 90, 'THE AD MEN', 'his team');
const fy2 = 1760;
CS.FRIENDS.forEach((L, i) => { P.person(ctx, 160 + i * 230, fy2, 0.95, i === 1 ? -1 : 1, L, { face: f(i === 1 ? 'skeptical' : 'squint', { look: [1, 0] }) }); if (L.hairStyle !== 'short') CS.skirt(ctx, 160 + i * 230, fy2, 0.95, i === 1 ? -1 : 1, L.top); });
P.person(ctx, 940, fy2, 0.95, 1, CS.EDNA, { face: f('worried', { look: [1, 0] }), armN: { hand: [110, -250], grip: 'hold', item: g => CS.bouquet(g, 1) }, armF: { hand: [90, -250], grip: 'hold' } }); CS.skirt(ctx, 940, fy2, 0.95, 1, CS.EDNA.top);
P.person(ctx, 1230, fy2, 0.95, 1, CS.BRIDE, { face: f('happy', { look: [1, 0] }), armN: { hand: [110, -250], grip: 'hold', item: g => CS.bouquet(g, 1) } }); CS.skirt(ctx, 1230, fy2, 0.95, 1, CS.BRIDE.top, 20);
P.person(ctx, 1460, fy2, 0.95, 1, CS.GROOM, { face: f('smile', { look: [1, 0] }) }, { tie: '#FFFDF8' });
for (const [x, s] of [[1720, 1.1], [1900, 0.7], [2040, 0.45]]) { ctx.save(); ctx.translate(x, fy2); CS.bottle(ctx, s, { name: s > 1 ? 'LISTERINE' : '' }); ctx.restore(); }
nameplate(ctx, 390, fy2 + 80, 'PARTY FRIENDS', '“…would never tell you”'); nameplate(ctx, 1100, fy2 + 80, 'EDNA · BRIDE · GROOM', '1920s ad characters'); nameplate(ctx, 1880, fy2 + 80, 'THE BOTTLE', 'amber, no logo');
ST.paper(ctx);
fs.writeFileSync(process.argv[2] || `${__dirname}/listerine_cast_sheet.png`, cv.toBuffer('image/png')); console.log('sheet ok');
