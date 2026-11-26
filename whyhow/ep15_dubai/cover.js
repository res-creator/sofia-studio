// EP15 thumbnails (1280x720), v2 rules: one big real subject, 2-4 words, high contrast. Real Dubai footage frames / real 2024 flood photo (see CREDITS).
// node cover.js OUT_A.jpg OUT_B.jpg OUT_C.jpg   (run from atlaskit/)
const K = require('../atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { C, F, text, chip } = K; const W = 1280, H = 720;
const img = f => loadImage(__dirname + '/' + f);
const vign = (ctx, a) => { const g = ctx.createRadialGradient(W * 0.6, H * 0.5, 250, W * 0.6, H * 0.5, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const T = (ctx, s, x, y, size, color, align) => text(ctx, s, x, y, { size, font: F.head, color: color || C.cream, stroke: 14, strokeColor: C.ink, shadow: 20, align });
(async () => {
  // A: Burj Khalifa, "DRINKING THE SEA"
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('cover_src_burj.jpg');
    ctx.filter = 'contrast(1.15) saturate(1.25)'; ctx.drawImage(im, 0, 0, 1920, 1080, 0, 0, W, H); ctx.filter = 'none';
    const g = ctx.createLinearGradient(0, 0, 700, 0); g.addColorStop(0, 'rgba(6,12,24,0.95)'); g.addColorStop(0.6, 'rgba(6,12,24,0.6)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 720, H); vign(ctx, 0.45);
    ctx.save(); ctx.translate(50, 110); chip(ctx, '125°F', 0, 0, { size: 60, bg: C.red, color: C.cream }); ctx.restore();
    T(ctx, 'ITS WATER', 44, 300, 140); T(ctx, 'COMES FROM', 44, 420, 110);
    ctx.save(); ctx.translate(50, 580); chip(ctx, 'THE SEA', 0, 0, { size: 120, bg: C.yellow, color: C.ink }); ctx.restore();
    fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
  // B: the real 16 April 2024 flood photo
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('footage/cm_uae_flood_16_april_2024_cars.jpg');
    const s = Math.max(W / im.width, H / im.height); ctx.filter = 'contrast(1.2) saturate(1.2)'; ctx.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s); ctx.filter = 'none'; vign(ctx, 0.55);
    const g = ctx.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, 'rgba(6,12,24,0.9)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 300);
    T(ctx, 'THE DESERT FLOODED', W / 2, 160, 120, null, 'center');
    ctx.save(); ctx.translate(W / 2, 640); chip(ctx, '1.5 YEARS OF RAIN IN A DAY', 0, 0, { size: 76, bg: C.yellow, color: C.ink, align: 'center' }); ctx.restore();
    text(ctx, 'UAE, 16 APRIL 2024', 1240, 40, { size: 24, font: F.monoB, color: C.cream, align: 'right', stroke: 5, strokeColor: C.ink });
    fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }
  // C: hazy skyline, "HOW IS THIS ALIVE?"
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('cover_src_haze.jpg');
    ctx.filter = 'contrast(1.25) saturate(1.3)'; ctx.drawImage(im, 200, 100, 1520, 855, 0, 0, W, H); ctx.filter = 'none'; vign(ctx, 0.5);
    T(ctx, 'NO RIVERS.', W / 2, 150, 120, null, 'center'); T(ctx, 'ALMOST NO RAIN.', W / 2, 280, 110, null, 'center');
    ctx.save(); ctx.translate(W / 2, 620); chip(ctx, '4.6 MILLION PEOPLE', 0, 0, { size: 96, bg: C.yellow, color: C.ink, align: 'center' }); ctx.restore();
    fs.writeFileSync(process.argv[4], cv.toBuffer('image/jpeg', 92)); }
})();
