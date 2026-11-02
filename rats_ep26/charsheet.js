// Episode 26 (Paid per rat tail, Hanoi 1902) — cast sheet in the channel style (howitsrun_style/, after emu_ep12 / lawnchair_ep17).
// Generic re-enactment people (no likenesses) + the cartoon rats and the key props. Usage: node charsheet.js [out.png]
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs');
const K = require('../tests/mcd_collage/kit'); const R = require('../hirkit/rig');
const ST = require('../howitsrun_style/style'); const SE = require('../howitsrun_style/sets');
const S = require('./ratkit'); const CS = S.CS;
const { rr } = K;
function nameplate(ctx, x, y, a, b) { ST.label(ctx, a, x, y, 1, { size: 40, rot: -0.02 }); ST.fitTxt(ctx, b, x, y + 58, 26, '#4A4A48', 360, 'center', K.F.xb); }

const cv = createCanvas(2160, 1920), ctx = cv.getContext('2d');
ST.bg(ctx, '#F7F5F0');
ctx.save(); ctx.translate(1080, 1120); ctx.scale(0.8, 0.8); S.street(ctx, 0, { n: 9, x0: -1800, trees: false }); ctx.restore();
ctx.save(); ctx.fillStyle = 'rgba(247,245,240,0.6)'; ctx.fillRect(0, 0, 2160, 1920); ctx.restore();
ST.txt(ctx, 'PAID PER RAT TAIL · HANOI 1902 — CAST', 1080, 110, 64, '#171717');
ST.fitTxt(ctx, 'style: howitsrun_style/ (after emu_ep12 & lawnchair_ep17) · generic re-enactment people · cartoon rats, never gory', 1080, 170, 32, '#6A6A68', 2000, 'center', K.F.xb);
const fy = 1020, s = 1.0, F = (n, l = [1, 0]) => R.expr(n, { look: l });
CS.cast(ctx, 160, fy, s, 1, 'official', { face: F('smug') });
CS.cast(ctx, 420, fy, s, -1, 'official', { face: F('smile'), armN: { hand: [150, -330], grip: 'pinch', item: g => S.coin(g, 34) } });
nameplate(ctx, 290, fy + 90, 'THE OFFICIAL', 'French colonial administration');
CS.cast(ctx, 720, fy, s, 1, 'hunter', { face: F('grin'), armN: { hand: [150, -380], grip: 'pinch', item: g => S.tail(g, 150, 0) } });
CS.cast(ctx, 960, fy, s, -1, 'woman', { face: F('smile'), armN: { hand: [110, -230], grip: 'hold', item: g => S.basket(g, 0.6, 8) }, armF: { hand: [90, -225], grip: 'hold' } });
CS.cast(ctx, 1200, fy, s, 1, 'elder', { face: F('skeptical') });
CS.cast(ctx, 1420, fy, s, -1, 'youth', { face: F('smile') });
nameplate(ctx, 1070, fy + 90, 'THE TOWNSPEOPLE', 'rat catchers & tail sellers (period clothes)');
CS.cast(ctx, 1720, fy, s, 1, 'inspector', { face: F('squint', [1, 0.3]), armN: { hand: [150, -340], grip: 'hold', item: g => S.magnifier(g, 0.8) } });
nameplate(ctx, 1760, fy + 90, 'THE INSPECTOR', 'sanitary service, khaki');
// rats + props row
ctx.save(); ctx.fillStyle = '#E9E1CE'; rr(ctx, 40, 1240, 2080, 640, 24); ctx.fill(); ctx.restore();
ST.fitTxt(ctx, 'the rats & props', 1080, 1290, 32, '#6A6A68', 1900, 'center', K.F.xb);
ctx.save(); ctx.translate(230, 1560); S.rat(ctx, { s: 1.1 }); ctx.restore();
ctx.save(); ctx.translate(560, 1560); S.rat(ctx, { s: 1.1, tail: 'stub', blush: 1, mood: 'shock', run: 1, phase: 1 }); ctx.restore();
ctx.save(); ctx.translate(820, 1480); S.ratPeek(ctx, 0.9); ctx.restore();
ctx.save(); ctx.translate(1040, 1600); S.basket(ctx, 0.9, 14); ctx.restore();
ctx.save(); ctx.translate(1240, 1480); S.coin(ctx, 70); ctx.restore();
ctx.save(); ctx.translate(1420, 1650); S.sack(ctx, 0.8); ctx.restore();
ctx.save(); ctx.translate(1660, 1470); S.scissors(ctx, 0.9, 0.6); ctx.restore();
ctx.save(); ctx.translate(1960, 1640); S.magnifier(ctx, 1); ctx.restore();
ctx.save(); ctx.translate(1400, 1800); ctx.scale(0.9, 0.9); S.crate(ctx, 220, 150, 1, 0, 0); ctx.restore();
ctx.save(); ctx.translate(600, 1800); ctx.scale(1, 1); S.tailHeap(ctx, 20, 500, 120); ctx.restore();
ST.paper(ctx);
fs.writeFileSync(process.argv[2] || `${__dirname}/rats_cast_sheet.png`, cv.toBuffer('image/png')); console.log('sheet ok');
