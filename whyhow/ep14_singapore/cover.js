// EP14 thumbnails (1280x720), v2 rules: one big real subject, 2-4 words, high contrast. Real Singapore footage / Commons photos (see CREDITS).
// node cover.js OUT_A.jpg OUT_B.jpg OUT_C.jpg   (run from atlaskit/)
const K = require('../atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { C, F, text, chip } = K; const W = 1280, H = 720;
const img = f => loadImage(__dirname + '/' + f);
const vign = (ctx, a) => { const g = ctx.createRadialGradient(W * 0.6, H * 0.5, 250, W * 0.6, H * 0.5, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const T = (ctx, s, x, y, size, color, align) => text(ctx, s, x, y, { size, font: F.head, color: color || C.cream, stroke: 14, strokeColor: C.ink, shadow: 20, align });
(async () => {
  // A: Marina Bay Sands at dusk, "+28% BIGGER" / "MADE FROM SAND"
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('cover_src_mbs.jpg');
    ctx.filter = 'contrast(1.15) saturate(1.3)'; ctx.drawImage(im, 0, 0, 1920, 1080, 0, 0, W, H); ctx.filter = 'none'; vign(ctx, 0.45);
    const g = ctx.createLinearGradient(0, 0, 0, 330); g.addColorStop(0, 'rgba(6,12,24,0.9)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 330);
    T(ctx, 'THIS LAND', W / 2, 165, 140, null, 'center'); 
    ctx.save(); ctx.translate(W / 2, 620); chip(ctx, 'WAS SEA', 0, 0, { size: 120, bg: C.yellow, color: C.ink, align: 'center' }); ctx.restore();
    ctx.save(); ctx.translate(50, 60); chip(ctx, '+28%', 0, 0, { size: 60, bg: C.red, color: C.cream }); ctx.restore();
    fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
  // B: Lee Kuan Yew 1965 (public domain) + "HE CRIED. THEN HE BUILT LAND."
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('footage/cm_lee_kuan_yew_1965.jpg');
    ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H); const s = H / im.height; ctx.filter = 'grayscale(1) contrast(1.2)'; ctx.drawImage(im, W - im.width * s, 0, im.width * s, H); ctx.filter = 'none';
    const g = ctx.createLinearGradient(0, 0, 820, 0); g.addColorStop(0, 'rgba(6,12,24,1)'); g.addColorStop(0.7, 'rgba(6,12,24,0.85)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 900, H);
    T(ctx, 'HE CRIED.', 44, 270, 130); T(ctx, 'THEN HE', 44, 400, 110);
    ctx.save(); ctx.translate(50, 560); chip(ctx, 'BUILT LAND', 0, 0, { size: 110, bg: C.yellow, color: C.ink }); ctx.restore();
    text(ctx, '1965', 1240, 690, { size: 26, font: F.monoB, color: C.cream, align: 'right', stroke: 5, strokeColor: C.ink });
    fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }
  // C: aerial 2024, "THE COUNTRY THAT BUILDS ITS OWN LAND"
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('footage/cm_aerial_2024_04.jpg');
    const s = Math.max(W / im.width, H / im.height); ctx.filter = 'contrast(1.2) saturate(1.25)'; ctx.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s); ctx.filter = 'none'; vign(ctx, 0.5);
    T(ctx, 'SINGAPORE', W / 2, 170, 140, null, 'center');
    ctx.save(); ctx.translate(W / 2, 620); chip(ctx, 'BUILDS ITS OWN LAND', 0, 0, { size: 90, bg: C.yellow, color: C.ink, align: 'center' }); ctx.restore();
    fs.writeFileSync(process.argv[4], cv.toBuffer('image/jpeg', 92)); }
})();
