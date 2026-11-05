// FINAL YouTube thumbnail: base illustration generated in Figma AI (gpt-image-2.5-sunburst, owner-approved, no text/logo in the image:
// art/thumbnail_figma_base.png) + our crisp type: headline "9 COKES A DAY?!" and plain "COCA-COLA" on the blank red label. Usage: node thumb_figma.js
const { createCanvas, loadImage } = require('@napi-rs/canvas'); const fs = require('fs');
const L = require('../kit/look'); const { INK, YELLOW, ink, rr } = L;
(async () => {
  const W = 1920, H = 1080, cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ctx.drawImage(await loadImage(`${__dirname}/art/thumbnail_figma_base.png`), 0, 0, W, H);
  // label text on the blank red band (band ~ x 1175-1490, y 420-625 at 1920 wide)
  ctx.save(); ctx.translate(1332, 523); ctx.scale(1, 1.08);
  ctx.globalAlpha = 0.25; L.fitText(ctx, 'COCA-COLA', 3, 4, 72, '#5A0A08', 290); ctx.globalAlpha = 1;
  L.fitText(ctx, 'COCA-COLA', 0, 0, 72, '#FFFFFF', 290); ctx.restore();
  // headline in the calm sky (top-left)
  ctx.save(); ctx.translate(585, 150); ctx.rotate(-0.03);
  ctx.save(); ctx.translate(10, 12); ctx.globalAlpha = 0.35; rr(ctx, -545, -112, 1090, 214, 26); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  rr(ctx, -545, -112, 1090, 214, 26); ink(ctx, YELLOW, 9);
  L.fitText(ctx, '9 COKES A DAY?!', 0, 2, 160, INK, 1000);
  ctx.restore();
  const out = createCanvas(1280, 720); const ox = out.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(cv, 0, 0, 1280, 720);
  fs.writeFileSync(`${__dirname}/how_coca_cola_took_over_the_world_thumbnail_final.png`, out.toBuffer('image/png')); console.log('final thumb (figma) ok');
})();
