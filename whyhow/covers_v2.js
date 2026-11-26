// Thumbnails v2 (Nov 26 2026) built on the niche's top-CTR patterns (see style_research/thumbnail_ctr.md):
// one idea readable in 0.5 s, 1-3 words, before/after split, one giant number, arrow + highlight. Run: node covers_v2.js
const K = require('./atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { C, F, text, chip } = K; const W = 1280, H = 720, CORAL = '#E4572E', INK = '#111418';
const T = (ctx, s, x, y, size, o = {}) => text(ctx, s, x, y, { size, font: F.head, color: o.color || '#FFFFFF', stroke: o.stroke == null ? 12 : o.stroke, strokeColor: INK, shadow: 24, align: o.align || 'center' });
const cover = (ctx, im, o = {}) => { const s = Math.max((o.w || W) / im.width, H / im.height) * (o.z || 1); ctx.filter = o.filter || 'contrast(1.15) saturate(1.25)';
  ctx.drawImage(im, (o.x || 0) + ((o.w || W) - im.width * s) * (o.fx == null ? 0.5 : o.fx), (H - im.height * s) * (o.fy == null ? 0.5 : o.fy), im.width * s, im.height * s); ctx.filter = 'none'; };
const shade = (ctx, y0, y1, a) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0)); };
const box = (ctx, s, x, y, size, bg = CORAL) => { ctx.save(); chip(ctx, s, x, y, { size, bg, color: '#FFFFFF', align: 'center' }); ctx.restore(); };
const arrow = (ctx, x0, y0, cx, cy, x1, y1) => { ctx.save(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke(); const a = Math.atan2(y1 - cy, x1 - cx);
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(x1 + Math.cos(a) * 30, y1 + Math.sin(a) * 30); ctx.lineTo(x1 + Math.cos(a + 2.4) * 34, y1 + Math.sin(a + 2.4) * 34); ctx.lineTo(x1 + Math.cos(a - 2.4) * 34, y1 + Math.sin(a - 2.4) * 34); ctx.fill(); ctx.restore(); };
const split = async (ctx, a, b, la, lb, fa = 'grayscale(1) contrast(1.25)', fb, same, oa = {}, ob = {}) => { const A = await loadImage(a), B = await loadImage(b);
  for (const [im, x, f] of [[A, 0, fa], [B, W / 2, fb]]) { ctx.save(); ctx.beginPath(); ctx.rect(x, 0, W / 2, H); ctx.clip(); cover(ctx, im, { ...(same ? {} : { x, w: W / 2 }), filter: f, ...(x ? ob : oa) }); ctx.restore(); }
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(W / 2 - 4, 0, 8, H); for (const [s, x] of [[la, W / 4], [lb, W * 3 / 4]]) T(ctx, s, x, 90, 64, { stroke: 10 }); };
const save = (cv, f) => { fs.writeFileSync(f, cv.toBuffer('image/jpeg', 92)); console.log(f); };
const make = async (f, draw) => { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); await draw(ctx); save(cv, f); };
(async () => {
  // Singapore D: before / after split
  await make('ep14_singapore/singapore_cover_D.jpg', async ctx => { await split(ctx, 'ep14_singapore/footage/cm_kampong_braddell_hill_1964.jpg', 'ep14_singapore/cover_src_mbs.jpg', '1964', 'TODAY', undefined, undefined, false, {}, { z: 1.3, fx: 0.02, fy: 0.85 });
    shade(ctx, H, H - 260, 0.75); box(ctx, 'SAME COUNTRY', W / 2, 640, 96); });
  // Singapore E: arrow at the land that used to be sea
  await make('ep14_singapore/singapore_cover_E.jpg', async ctx => { cover(ctx, await loadImage('ep14_singapore/cover_src_mbs.jpg'), { z: 1.1, fx: 0.3, fy: 0.6 }); shade(ctx, 0, 300, 0.6);
    T(ctx, 'THIS WAS', 860, 160, 130); box(ctx, 'SEA', 860, 310, 150); arrow(ctx, 700, 300, 420, 330, 330, 520); });
  // Dubai D: one giant number
  await make('ep15_dubai/dubai_cover_D.jpg', async ctx => { cover(ctx, await loadImage('ep15_dubai/cover_src_haze.jpg'), { filter: 'contrast(1.2) saturate(1.35)' }); shade(ctx, 0, 380, 0.55);
    T(ctx, '0 RIVERS', W / 2, 300, 250); box(ctx, '4 MILLION PEOPLE', W / 2, 640, 80); });
  // Tokyo D: one giant number on a rush-hour crowd
  await make('ep16_tokyo/tokyo_cover_D.jpg', async ctx => { cover(ctx, await loadImage('ep16_tokyo/footage/cm_tokyu_shibuya_rush_hour.jpg')); shade(ctx, 0, 360, 0.6);
    T(ctx, '40,000,000', W / 2, 240, 200); box(ctx, 'RIDES A DAY', W / 2, 640, 96); });
  // Tokyo E: the funny apology
  await make('ep16_tokyo/tokyo_cover_E.jpg', async ctx => { cover(ctx, await loadImage('ep16_tokyo/footage/cm_e235_yamanote_shibuya_2026.jpg'), { fx: 0.6 }); shade(ctx, 0, 380, 0.6);
    T(ctx, 'SORRY!', 380, 250, 230); box(ctx, '20 SEC EARLY', 380, 400, 84); });
})();
