// EP12 thumbnails (1280x720), our template: place name, number badge, 2-line hook with a yellow strip. Real Vostok photos (see CREDITS).
// node cover.js OUT_A.jpg OUT_B.jpg   (run from atlaskit/)
const K = require('../atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { C, F, text, chip } = K; const W = 1280, H = 720;
async function base(file, sx, sy, sw, sh, filt) {
  const img = await loadImage(__dirname + '/footage/' + file + '.jpg');
  const cv = K.createCanvas(W, H), ctx = cv.getContext('2d');
  ctx.filter = filt || 'saturate(1.1) contrast(1.15)'; ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H); ctx.filter = 'none';
  const sg = ctx.createLinearGradient(0, 0, 720, 0); sg.addColorStop(0, 'rgba(6,12,24,0.9)'); sg.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, 780, H);
  const vg = ctx.createRadialGradient(W * 0.7, H * 0.5, 200, W * 0.6, H * 0.5, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  return [cv, ctx];
}
function stack(ctx, place, badge, badgeBg, l1, l2, s1 = 112, s2 = 96, sub) {
  text(ctx, place, 44, 180, { size: 160, font: F.head, color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 20 });
  ctx.save(); ctx.translate(50, 300); chip(ctx, badge, 0, 0, { size: 72, bg: badgeBg, color: C.cream }); ctx.restore();
  if (sub) text(ctx, sub, 50, 392, { size: 44, font: F.head, color: C.frost, stroke: 8, strokeColor: C.ink });
  text(ctx, l1, 44, 530, { size: s1, font: F.head, color: C.cream, stroke: 12, strokeColor: C.ink, shadow: 18 });
  ctx.save(); ctx.translate(50, 664); chip(ctx, l2, 0, 0, { size: s2, bg: C.yellow, color: C.ink }); ctx.restore();
}
(async () => {
  { const [cv, ctx] = await base('cm_vostok_1970s_view', 0, 200, 1920, 1080, 'saturate(0.6) contrast(1.2) hue-rotate(-10deg)');
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(77,141,255,0.55)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    stack(ctx, 'VOSTOK', '−89.2°C', C.ice, 'NO PLANE', 'FOR 9 MONTHS', 112, 96, '= −128°F, THE COLDEST EVER');
    fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
  { const img = await loadImage(__dirname + '/cover_stove_bg.jpg'); const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); ctx.fillStyle = '#0B0806'; ctx.fillRect(0, 0, W, H); ctx.filter = 'saturate(1.4) contrast(1.25)'; ctx.drawImage(img, 0, 0, 1500, 844, 420, 120, 860, 484); ctx.filter = 'none';
    const sg = ctx.createLinearGradient(0, 0, 720, 0); sg.addColorStop(0, 'rgba(6,8,12,0.9)'); sg.addColorStop(1, 'rgba(6,8,12,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, 780, H);
    const g = ctx.createRadialGradient(W * 0.72, H * 0.85, 40, W * 0.72, H * 0.85, 700); g.addColorStop(0, 'rgba(255,138,61,0.75)'); g.addColorStop(1, 'rgba(255,138,61,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    stack(ctx, '1982', 'NO POWER', C.red, '227 DAYS', 'ON THEIR OWN', 112, 96, 'VOSTOK, ANTARCTICA');
    fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }
})();
