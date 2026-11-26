// EP16 thumbnails (1280x720), v2 rules: one big real subject, 2-4 words, high contrast. Real Tokyo footage / photos (see CREDITS).
// node cover.js OUT_A.jpg OUT_B.jpg OUT_C.jpg   (run from atlaskit/)
const K = require('../atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { C, F, text, chip } = K; const W = 1280, H = 720;
const img = f => loadImage(__dirname + '/' + f);
const vign = (ctx, a) => { const g = ctx.createRadialGradient(W * 0.6, H * 0.5, 250, W * 0.6, H * 0.5, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const T = (ctx, s, x, y, size, color, align) => text(ctx, s, x, y, { size, font: F.head, color: color || C.cream, stroke: 14, strokeColor: C.ink, shadow: 20, align });
(async () => {
  // A: packed platform, "20 SECONDS EARLY" + apology stamp
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('footage/pxp_packed_platform_shibuya.jpg');
    const s = Math.max(W / im.width, H / im.height); ctx.filter = 'contrast(1.2) saturate(1.15)'; ctx.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s); ctx.filter = 'none'; vign(ctx, 0.55);
    const g = ctx.createLinearGradient(0, 0, 0, 330); g.addColorStop(0, 'rgba(6,12,24,0.92)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 330);
    T(ctx, '20 SECONDS EARLY', W / 2, 170, 140, null, 'center');
    ctx.save(); ctx.translate(W / 2 + 230, 600); ctx.rotate(-0.08); chip(ctx, 'WE DEEPLY APOLOGIZE', 0, 0, { size: 70, bg: C.red, color: C.cream, align: 'center' }); ctx.restore();
    fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
  // B: Shibuya at night, "40 MILLION RIDES A DAY"
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('cover_src_shibuya.jpg');
    ctx.filter = 'contrast(1.2) saturate(1.3)'; ctx.drawImage(im, 0, 0, 1920, 1080, 0, 0, W, H); ctx.filter = 'none'; vign(ctx, 0.5);
    T(ctx, '40 MILLION', W / 2, 190, 170, null, 'center');
    ctx.save(); ctx.translate(W / 2, 620); chip(ctx, 'RIDES A DAY. NO CHAOS.', 0, 0, { size: 90, bg: C.yellow, color: C.ink, align: 'center' }); ctx.restore();
    fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }
  // C: "LATE 15 DAYS A MONTH" over a Yamanote train
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('footage/cm_e235_yamanote_shibuya_2026.jpg');
    const s = Math.max(W / im.width, H / im.height); ctx.filter = 'contrast(1.15) saturate(1.2)'; ctx.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s); ctx.filter = 'none'; vign(ctx, 0.55);
    const g = ctx.createLinearGradient(0, 0, 760, 0); g.addColorStop(0, 'rgba(6,12,24,0.92)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 760, H);
    T(ctx, 'NOT ALWAYS', 44, 260, 120); T(ctx, 'ON TIME', 44, 390, 130);
    ctx.save(); ctx.translate(50, 560); chip(ctx, 'LATE NOTES 15 DAYS A MONTH', 0, 0, { size: 60, bg: C.yellow, color: C.ink }); ctx.restore();
    fs.writeFileSync(process.argv[4], cv.toBuffer('image/jpeg', 92)); }
})();
