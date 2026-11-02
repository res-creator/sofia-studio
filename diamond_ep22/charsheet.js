// Episode 22 ("Your ring is an ad", De Beers / N.W. Ayer) — character sheet in the channel style (howitsrun_style/, after emu_ep12 / lawnchair_ep17).
// Generic re-enactment people (no likenesses). Usage: node charsheet.js [out.png]
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people'); const SE = require('../howitsrun_style/sets');
const { C, rr } = K;
const S = require('./diakit'); const CS = S.CS;
function nameplate(ctx, x, y, a, b) { ST.label(ctx, a, x, y, 1, { size: 40, rot: -0.02 }); ST.fitTxt(ctx, b, x, y + 58, 26, '#4A4A48', 330, 'center', K.F.xb); }
const KNEEL = { hip: [-10, -170], legN: { foot: [120, 0] }, legF: { foot: [-170, 0] } };

const cv = createCanvas(2160, 1920), ctx = cv.getContext('2d');
ST.bg(ctx, '#F7F5F0');
ctx.save(); ctx.translate(1080, 1500); ctx.scale(0.75, 0.75); SE.room(ctx, 0, { wall: '#F2DCD8', floor: 'wood' }); ctx.restore();
ctx.save(); ctx.fillStyle = 'rgba(247,245,240,0.55)'; ctx.fillRect(0, 0, 2160, 1920); ctx.restore();
ST.txt(ctx, 'YOUR RING = AN AD · USA 1938–1980s — CAST', 1080, 120, 60, '#171717');
ST.fitTxt(ctx, 'style: howitsrun_style/ (after emu_ep12 & lawnchair_ep17) · generic re-enactment people, no likenesses, no logos', 1080, 180, 32, '#6A6A68', 1900, 'center', K.F.xb);
const fy = 860;
// row 1: the boyfriend (kneeling with the ring box), the girlfriend, the ad man (megaphone), the diamond boss
P.person(ctx, 230, fy, 1.0, 1, CS.GUY, { ...KNEEL, face: R.expr('grin', { look: [1, -0.4] }), armN: { hand: [150, -290], grip: 'hold', item: g => S.ringBox(g, 0.5, 1, 1, 0.3) }, armF: { hand: [110, -300], grip: 'hold' } });
CS.lady(ctx, 560, fy, 1.0, -1, CS.GIRL, { face: R.expr('surprised', { look: [1, 0.3] }), armN: { hand: [80, -420], grip: 'open' } });
nameplate(ctx, 400, fy + 110, 'THE BOYFRIEND', 'proposes; later tries to sell the ring');
P.person(ctx, 900, fy, 1.0, 1, CS.ADMAN, { face: R.expr('grin', { look: [1, 0] }), armN: { hand: [140, -420], grip: 'hold', item: g => CS.megaphone(g, 0.9) } }, { tie: C.yellow });
nameplate(ctx, 960, fy + 110, 'THE AD MAN', 'ad agency, grey suit + megaphone');
P.person(ctx, 1360, fy, 1.0, 1, CS.BOSS, { face: R.expr('worried', { look: [1, 0.2] }) }, { stache: '#B8B8BE', tie: C.red });
ctx.save(); ctx.translate(1640, fy); S.sack(ctx, 0.7); ctx.restore();
nameplate(ctx, 1500, fy + 110, 'THE DIAMOND BOSS', 'the diamond giant, plain text name only');
CS.lady(ctx, 1940, fy, 1.0, -1, CS.GIRL, { face: R.expr('smile', { look: [1, 0] }) });
nameplate(ctx, 1940, fy + 110, 'THE GIRLFRIEND', 'pink dress');
// row 2: the copywriter at the typewriter, the dealer with the loupe, the bride, the boyfriend walking
const fy2 = 1700;
P.seated(ctx, 230, fy2, 1.0, 1, CS.WRITER, { face: R.expr('thinking', { look: [1, -0.3] }), armN: { hand: [150, -290], grip: 'relax' }, armF: { hand: [130, -280], grip: 'relax' } });
ctx.save(); ctx.translate(0, fy2); SE.desk(ctx, 430, 360, -260); ctx.restore(); ctx.save(); ctx.translate(430, fy2 - 260); S.typewriter(ctx, 0.6, ['A DIAMOND', 'IS FOREVER'], 99); ctx.restore();
nameplate(ctx, 360, fy2 + 110, 'THE COPYWRITER', 'ad agency, late 1940s');
P.person(ctx, 880, fy2, 1.0, -1, CS.DEALER, { face: R.expr('skeptical', { look: [1, 0] }), armN: { hand: [100, -545], grip: 'pinch', item: S.loupe } });
nameplate(ctx, 860, fy2 + 110, 'THE DEALER', 'buys used rings, cardigan + glasses');
CS.lady(ctx, 1300, fy2, 1.0, 1, CS.BRIDE, { face: R.expr('happy', { look: [1, 0] }), armN: { hand: [120, -300], grip: 'hold', item: g => { g.save(); g.translate(0, -30); S.star(g, 0, 0, 40); g.restore(); } }, armF: { hand: [100, -300], grip: 'hold' } }, { veil: 1 });
nameplate(ctx, 1320, fy2 + 110, 'A BRIDE', 'white dress + veil (the brides line)');
P.person(ctx, 1820, fy2, 1.0, 1, CS.GUY, { ...R.walk(1.2), face: R.expr('smile', { look: [1, 0] }) });
nameplate(ctx, 1820, fy2 + 110, 'THE BOYFRIEND, LATER', 'walks into the shop to sell the ring');
ST.paper(ctx);
fs.writeFileSync(process.argv[2] || `${__dirname}/diamond_cast_sheet.png`, cv.toBuffer('image/png')); console.log('sheet ok');
