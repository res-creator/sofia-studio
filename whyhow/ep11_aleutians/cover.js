// EP11 thumbnails (1280x720), our template: place name, blue number badge, 2-line hook with a yellow strip. Real photos (see CREDITS).
// node cover.js OUT_A.jpg OUT_B.jpg   (run from atlaskit/)
const K = require('../atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { C, F, text, chip } = K; const W = 1280, H = 720;
async function base(file, sx, sy, sw, sh, warm) {
  const img = await loadImage(__dirname + '/footage/' + file + '.jpg');
  const cv = K.createCanvas(W, H), ctx = cv.getContext('2d');
  ctx.filter = 'saturate(1.2) contrast(1.15)'; ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H); ctx.filter = 'none';
  const sg = ctx.createLinearGradient(0, 0, 700, 0); sg.addColorStop(0, 'rgba(6,12,24,0.88)'); sg.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, 760, H);
  const vg = ctx.createRadialGradient(W * 0.7, H * 0.5, 200, W * 0.6, H * 0.5, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  return [cv, ctx];
}
function stack(ctx, place, badge, badgeBg, l1, l2, s1 = 120, s2 = 104) {
  text(ctx, place, 44, 180, { size: 160, font: F.head, color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 20 });
  ctx.save(); ctx.translate(50, 300); chip(ctx, badge, 0, 0, { size: 72, bg: badgeBg, color: C.cream }); ctx.restore();
  text(ctx, l1, 44, 520, { size: s1, font: F.head, color: C.cream, stroke: 12, strokeColor: C.ink, shadow: 18 });
  ctx.save(); ctx.translate(50, 664); chip(ctx, l2, 0, 0, { size: s2, bg: C.yellow, color: C.ink }); ctx.restore();
}
(async () => {
  { const [cv, ctx] = await base('cm_adak_ruined_homes', 0, 60, 1920, 1080); stack(ctx, 'ADAK', '96% GONE', C.red, 'WHERE DID', 'EVERYONE GO?', 120, 96); fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
  { const [cv, ctx] = await base('cm_attu_jarmin_pass_panorama', 600, 0, 1024, 576); stack(ctx, 'ATTU', '0 PEOPLE', C.ice, 'JAPAN', 'INVADED HERE'); fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }
})();
