// EP11 thumbnails v2 (1280x720), after studying the top Aleutian/Attu videos on YouTube (Nov 2026):
// one big real subject, 2-4 words max, high contrast. Real photos (see CREDITS).
// node cover2.js OUT_C.jpg OUT_D.jpg   (run from atlaskit/)
const K = require('../atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { C, F, text, chip } = K; const W = 1280, H = 720;
async function img(file, sx, sy, sw, sh, filt) { const im = await loadImage(__dirname + '/footage/' + file + '.jpg'); const cv = K.createCanvas(W, H), ctx = cv.getContext('2d');
  ctx.filter = filt; ctx.drawImage(im, sx, sy, sw, sh, 0, 0, W, H); ctx.filter = 'none'; return [cv, ctx]; }
const vign = (ctx, a) => { const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 250, W * 0.5, H * 0.5, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
(async () => {
  // C: the Attu soldier in the snow, 1943 (US Army Signal Corps) + "JAPAN INVADED / AMERICA"
  { const [cv, ctx] = await img('cm_attu_1943_us_troops', 0, 120, 1920, 1080, 'contrast(1.35) brightness(1.02)');
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(77,141,255,0.45)'; ctx.fillRect(0, 0, W, H); ctx.restore(); vign(ctx, 0.55);
    const g = ctx.createLinearGradient(W, 0, W * 0.45, 0); g.addColorStop(0, 'rgba(6,12,24,0.85)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(W * 0.4, 0, W * 0.6, H);
    ctx.save(); ctx.translate(1236, 130); chip(ctx, 'ALASKA, 1942', 0, 0, { size: 60, bg: C.red, color: C.cream, align: 'right' }); ctx.restore();
    text(ctx, 'JAPAN', 1236, 330, { size: 170, font: F.head, align: 'right', color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 20 });
    text(ctx, 'INVADED', 1236, 490, { size: 170, font: F.head, align: 'right', color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 20 });
    ctx.save(); ctx.translate(1236, 630); chip(ctx, 'AMERICA', 0, 0, { size: 110, bg: C.yellow, color: C.ink, align: 'right' }); ctx.restore();
    fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
  // D: the ruined Navy home on Adak, one big number
  { const [cv, ctx] = await img('cm_adak_ruined_homes', 0, 100, 1920, 1080, 'saturate(1.25) contrast(1.2)'); vign(ctx, 0.5);
    const g = ctx.createLinearGradient(0, 0, 700, 0); g.addColorStop(0, 'rgba(6,12,24,0.88)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, H);
    text(ctx, 'ADAK', 50, 200, { size: 170, font: F.head, color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 20 });
    ctx.save(); ctx.translate(56, 400); chip(ctx, '96% GONE', 0, 0, { size: 140, bg: C.red, color: C.cream }); ctx.restore();
    ctx.save(); ctx.translate(56, 600); chip(ctx, 'WHY?', 0, 0, { size: 110, bg: C.yellow, color: C.ink }); ctx.restore();
    fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }
})();
