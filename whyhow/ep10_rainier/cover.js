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
  // lahar zone: the flat valley floor where the town stands, tinted red with a glowing edge
  const Z = [[430, 720], [470, 640], [560, 585], [700, 560], [860, 548], [1020, 532], [1160, 522], [1280, 518], [1280, 720]];
  const zpath = () => { ctx.beginPath(); Z.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
  ctx.save(); zpath(); ctx.clip();
  const zg = ctx.createLinearGradient(0, 520, 0, 720); zg.addColorStop(0, 'rgba(230,57,70,0.55)'); zg.addColorStop(1, 'rgba(230,57,70,0.2)');
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,120,110,1)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = zg; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.shadowColor = 'rgba(255,70,60,1)'; ctx.shadowBlur = 22; ctx.strokeStyle = '#FF5A4E'; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.beginPath(); Z.slice(0, -1).forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
  // the path the mud takes: a glowing dashed line from the mountain down the valley
  ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,90,60,1)'; ctx.shadowBlur = 18;
  ctx.strokeStyle = '#FF6B57'; ctx.lineWidth = 9; ctx.setLineDash([2, 20]);
  ctx.beginPath(); ctx.moveTo(905, 335); ctx.bezierCurveTo(820, 400, 860, 470, 760, 555); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(980, 600); chip(ctx, 'LAHAR ZONE', 0, 0, { size: 44, bg: C.red, color: C.cream }); ctx.restore();
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
