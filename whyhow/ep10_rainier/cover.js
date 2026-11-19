// EP10 thumbnails (1280x720), Norilsk "final" layout: place name, blue number badge, 2-line hook with yellow strip.
// Photo: USGS (public domain), Mount Rainier over the Puyallup Valley near Orting. Arrow = our graphic.
// node cover.js OUT_A.jpg OUT_B.jpg
const K = require('../atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { C, F, text, chip } = K; const W = 1280, H = 720;
async function base() {
  const img = await loadImage(__dirname + '/footage/gov_usgs_rainier_over_puyallup_valley_orting_b.jpg');
  const cv = K.createCanvas(W, H), ctx = cv.getContext('2d');
  // crop: mountain to the right, houses at the bottom
  const s = 1.25, sw = W / s * (img.width / 1920) * 1.0;
  ctx.filter = 'saturate(1.25) contrast(1.12)';
  ctx.drawImage(img, 240, 110, 1680, 945, 0, 0, W, H); ctx.filter = 'none';
  // mud arrow from the mountain foot down the valley into town
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pts = [[900, 360], [820, 440], [730, 520], [650, 580]];
  for (const [lw, col] of [[46, 'rgba(0,0,0,0.55)'], [34, '#9A6230']]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
  const head = (col, g) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(595 - g, 635 + g); ctx.lineTo(610 - g, 525 - g * 1.4); ctx.lineTo(710 + g * 1.4, 620 + g); ctx.closePath(); ctx.fill(); };
  head('rgba(0,0,0,0.55)', 8); head('#9A6230', 0);
  ctx.restore();
  const sh = ctx.createLinearGradient(0, 0, 620, 0); sh.addColorStop(0, 'rgba(6,12,24,0.85)'); sh.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = sh; ctx.fillRect(0, 0, 680, H);
  return [cv, ctx];
}
function stack(ctx, l1, l2) {
  text(ctx, 'RAINIER', 44, 180, { size: 150, font: F.head, color: C.cream, stroke: 14, strokeColor: C.ink, shadow: 20 });
  ctx.save(); ctx.translate(50, 300); chip(ctx, '40 MIN', 0, 0, { size: 76, bg: C.ice, color: C.cream }); ctx.restore();
  text(ctx, l1, 44, 520, { size: 124, font: F.head, color: C.cream, stroke: 12, strokeColor: C.ink, shadow: 18 });
  ctx.save(); ctx.translate(50, 664); chip(ctx, l2, 0, 0, { size: 116, bg: C.yellow, color: C.ink }); ctx.restore();
}
(async () => {
  { const [cv, ctx] = await base(); stack(ctx, 'WALK', 'UPHILL'); fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
  { const [cv, ctx] = await base(); stack(ctx, 'RIVER OF', 'MUD'); fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }
})();
