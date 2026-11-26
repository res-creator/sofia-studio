// Thumbnails v3 (Nov 26 2026): premium look like the niche leaders — one clean real image (NASA / aerial),
// heavy sans in solid boxes (no outlines), one curved white arrow, 2-3 words. Run: node covers_v3.js
const K = require('./atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { F, text, measure, rr } = K; const W = 1280, H = 720, CORAL = '#E4572E', INK = '#101214';
const draw = (ctx, im, o = {}) => { const s = Math.max(W / im.width, H / im.height) * (o.z || 1); ctx.filter = o.filter || 'contrast(1.18) saturate(1.3) brightness(1.04)';
  ctx.drawImage(im, (W - im.width * s) * (o.fx == null ? 0.5 : o.fx), (H - im.height * s) * (o.fy == null ? 0.5 : o.fy), im.width * s, im.height * s); ctx.filter = 'none';
  const g = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${o.vig == null ? 0.35 : o.vig})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
// solid label: heavy sans, tight box, soft drop shadow
const label = (ctx, s, x, y, size, bg = INK, fg = '#FFFFFF', rot = 0) => { const pad = size * 0.28, w = measure(ctx, s, size, F.black, -1) + pad * 2, h = size * 1.12;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6; ctx.fillStyle = bg; rr(ctx, -w / 2, -h / 2, w, h, size * 0.1); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); text(ctx, s, 0, size * 0.36, { size, font: F.black, color: fg, align: 'center', ls: -1 }); ctx.restore(); return w; };
const arrow = (ctx, x0, y0, cx, cy, x1, y1, w = 14) => { ctx.save(); ctx.strokeStyle = '#FFFFFF'; ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke(); const a = Math.atan2(y1 - cy, x1 - cx), L = w * 3.2;
  ctx.beginPath(); ctx.moveTo(x1 + Math.cos(a) * L * 0.6, y1 + Math.sin(a) * L * 0.6); ctx.lineTo(x1 + Math.cos(a + 2.5) * L, y1 + Math.sin(a + 2.5) * L); ctx.lineTo(x1 + Math.cos(a - 2.5) * L, y1 + Math.sin(a - 2.5) * L); ctx.closePath(); ctx.fill(); ctx.restore(); };
const ring = (ctx, x, y, r) => { ctx.save(); ctx.strokeStyle = CORAL; ctx.lineWidth = 9; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore(); };
const make = async (f, fn) => { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); await fn(ctx); fs.writeFileSync(f, cv.toBuffer('image/jpeg', 93)); console.log(f); };
(async () => {
  // Dubai: Palm Jumeirah from the ISS (NASA) — the city drinks the sea
  await make('ep15_dubai/dubai_cover_F.jpg', async ctx => { draw(ctx, await loadImage('ep15_dubai/footage/gov_nasa_iss_2014_palm_jumeirah.jpg'), { z: 1.25, fx: 0.22, fy: 0.5, filter: 'contrast(1.45) saturate(1.7) brightness(0.98)' });
    label(ctx, 'THEY DRINK', 345, 150, 96); label(ctx, 'THIS', 345, 274, 120, CORAL); arrow(ctx, 345, 350, 300, 520, 460, 600); });
  // Singapore: Gardens by the Bay from the air — this land was sea
  await make('ep14_singapore/singapore_cover_F.jpg', async ctx => { draw(ctx, await loadImage('ep14_singapore/footage/cm_gardens_by_the_bay_aerial.jpg'), { z: 1.05, fx: 0.3, fy: 0.55 });
    label(ctx, 'THIS WAS', 930, 150, 96); label(ctx, 'SEA', 930, 272, 120, CORAL); arrow(ctx, 860, 350, 760, 520, 560, 560); });
  // Tokyo: Tokyo Station at night — one giant number
  await make('ep16_tokyo/tokyo_cover_F.jpg', async ctx => { draw(ctx, await loadImage('ep16_tokyo/footage/pxp_tokyo_station_night_aerial.jpg'), { fy: 0.7 });
    label(ctx, '40 MILLION', W / 2, 140, 120); label(ctx, 'RIDES A DAY', W / 2, 272, 84, CORAL); });
})();
