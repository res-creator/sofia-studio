// Episode 21 (Sugar paid scientists, USA 1965–67 / 2016) — character + prop sheet in the channel style (howitsrun_style/).
// Generic re-enactment people (no likenesses). Usage: node charsheet.js [out.png]
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style'); const P = require('../howitsrun_style/people'); const SE = require('../howitsrun_style/sets');
const S = require('./sugarkit'); const { EXEC, SCI, RESEARCHER, READER, ACC, scientist } = require('./cast');
const { C, rr } = K;
function nameplate(ctx, x, y, a, b) { ST.label(ctx, a, x, y, 1, { size: 44, rot: -0.02 }); ST.fitTxt(ctx, b, x, y + 62, 28, '#4A4A48', 380, 'center', K.F.xb); }
const cv = createCanvas(2160, 1920), ctx = cv.getContext('2d');
ST.bg(ctx, '#F7F5F0');
ctx.save(); ctx.translate(1080, 1200); ctx.scale(0.7, 0.7); S.campus(ctx, 0); ctx.restore();
ctx.save(); ctx.fillStyle = 'rgba(247,245,240,0.6)'; ctx.fillRect(0, 0, 2160, 1920); ctx.restore();
ST.txt(ctx, 'SUGAR PAID SCIENTISTS · USA 1965–67 / 2016 — CAST', 1080, 120, 60, '#171717');
ST.fitTxt(ctx, 'style: howitsrun_style/ (after emu_ep12 & lawnchair_ep17) · generic re-enactment people, no likenesses', 1080, 180, 32, '#6A6A68', 1900, 'center', K.F.xb);
const fy = 1150;
P.person(ctx, 200, fy, 1.1, 1, EXEC, { face: R.expr('smug', { look: [1, 0] }), armN: { hand: [130, -260], grip: 'hold', item: g => S.envelope(g, 0.45) } }, ACC.EXEC);
P.person(ctx, 470, fy, 1.1, -1, EXEC, { face: R.expr('worried', { look: [1, 0] }), armN: { hand: [60, -400], grip: 'pinch' } }, ACC.EXEC);
nameplate(ctx, 340, 1260, 'THE SUGAR MAN', 'industry group, 1960s · brown suit + red tie');
scientist(ctx, 760, fy, 1.1, 1, { face: R.expr('smile', { look: [1, 0] }) });
P.seated(ctx, 1000, fy, 1.0, 1, SCI, { face: R.expr('thinking', { look: [1, 0] }) });
nameplate(ctx, 880, 1260, 'THE SCIENTIST', 'university, 1960s · lab coat + glasses');
P.person(ctx, 1380, fy, 1.1, 1, RESEARCHER, { face: R.expr('surprised', { look: [1, -0.2] }), armN: { hand: [140, -380], grip: 'pinch', item: g => { g.save(); g.translate(20, -60); g.scale(0.18, 0.18); S.letter(g, {}); g.restore(); } } }, ACC.RESEARCHER);
nameplate(ctx, 1400, 1260, 'THE RESEARCHER', '2016, in the archives · badge');
P.person(ctx, 1860, fy, 1.1, -1, READER, { face: R.expr('neutral', { look: [1, 0.2] }), armN: { hand: [140, -330], grip: 'hold', item: g => { g.save(); g.translate(30, -40); g.scale(-1, 1); S.journal(g, 0.3); g.restore(); } }, armF: { hand: [110, -330], grip: 'hold' } }, ACC.READER);
nameplate(ctx, 1860, 1260, 'THE READER', '1967 · moustache');
ctx.save(); ctx.fillStyle = '#E9E1CE'; rr(ctx, 40, 1400, 2080, 480, 24); ctx.fill(); ctx.restore();
ST.fitTxt(ctx, 'props', 1080, 1450, 32, '#6A6A68', 1900, 'center', K.F.xb);
const prop = (x, y, f) => { ctx.save(); ctx.translate(x, y); f(ctx); ctx.restore(); };
prop(170, 1680, g => S.envelope(g, 0.7)); prop(430, 1820, g => S.sugarBowl(g, 0.9)); prop(690, 1800, g => S.butter(g, 0.8)); prop(900, 1680, g => S.heart(g, 0.7));
prop(1100, 1680, g => S.journal(g, 0.4)); prop(1300, 1660, g => { g.scale(0.26, 0.26); S.letter(g, { quote: ['We are well aware'], rot: 0 }); });
prop(1500, 1830, g => S.archiveBox(g, 0.9)); prop(1720, 1830, g => S.typewriter(g, 0.8)); prop(1950, 1560, g => S.priceTag(g, 0.7, '$6,500'));
ST.paper(ctx);
fs.writeFileSync(process.argv[2] || `${__dirname}/sugar_cast_sheet.png`, cv.toBuffer('image/png')); console.log('sheet ok');
