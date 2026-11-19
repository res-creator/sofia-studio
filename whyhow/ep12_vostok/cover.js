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
  if (sub) text(ctx, sub, 50, 404, { size: 64, font: F.head, color: C.frost, stroke: 8, strokeColor: C.ink });
  text(ctx, l1, 44, 530, { size: s1, font: F.head, color: C.cream, stroke: 12, strokeColor: C.ink, shadow: 18 });
  ctx.save(); ctx.translate(50, 664); chip(ctx, l2, 0, 0, { size: s2, bg: C.yellow, color: C.ink }); ctx.restore();
}
(async () => {
  { const [cv, ctx] = await base('cm_vostok_1970s_view', 0, 200, 1920, 1080, 'saturate(0.7) contrast(1.5) brightness(0.92)');
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(77,141,255,0.55)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    stack(ctx, 'VOSTOK', '−89.2°C', C.ice, 'NO PLANE', 'FOR 9 MONTHS', 112, 96, '= −128°F');
    fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
  { const img = await loadImage(__dirname + '/cover_stove_bg.jpg'); const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); ctx.fillStyle = '#0B0806'; ctx.fillRect(0, 0, W, H); ctx.filter = 'saturate(1.4) contrast(1.25)'; ctx.drawImage(img, 0, 0, 1500, 844, 420, 120, 860, 484); ctx.filter = 'none';
    const sg = ctx.createLinearGradient(0, 0, 720, 0); sg.addColorStop(0, 'rgba(6,8,12,0.9)'); sg.addColorStop(1, 'rgba(6,8,12,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, 780, H);
    const g = ctx.createRadialGradient(W * 0.72, H * 0.85, 40, W * 0.72, H * 0.85, 700); g.addColorStop(0, 'rgba(255,138,61,0.75)'); g.addColorStop(1, 'rgba(255,138,61,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    stack(ctx, '1982', 'NO POWER', C.red, '227 DAYS', 'ON THEIR OWN', 112, 96, 'VOSTOK, ANTARCTICA');
    fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }

  // C (v2, after the top Vostok/coldest-place videos on YouTube, Nov 2026): one real station, night-blue, huge number, crossed-out plane.
  if (process.argv[4]) { const [cv, ctx] = await base('cm_vostok_1970s_view', 0, 180, 1920, 1080, 'saturate(0.5) contrast(1.4) brightness(0.62)');
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#5C7FC8'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const fr = ctx.createLinearGradient(0, 0, 0, H * 0.45); fr.addColorStop(0, 'rgba(10,18,40,0.7)'); fr.addColorStop(1, 'rgba(10,18,40,0)'); ctx.fillStyle = fr; ctx.fillRect(0, 0, W, H * 0.45);
    K.snow(ctx, 3.3, 140, 0.55, 60);
    text(ctx, '−89°C', 40, 250, { size: 250, font: F.head, color: '#DDEBFF', stroke: 16, strokeColor: '#0B1426', shadow: 30 });
    // plane with a red cross
    ctx.save(); ctx.translate(1060, 150); ctx.rotate(-0.12); ctx.fillStyle = '#F7F5F0';
    ctx.beginPath(); ctx.ellipse(0, 0, 120, 18, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(30, -95); ctx.lineTo(55, -95); ctx.lineTo(35, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(30, 95); ctx.lineTo(55, 95); ctx.lineTo(35, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-100, 0); ctx.lineTo(-125, -42); ctx.lineTo(-108, -42); ctx.lineTo(-80, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(940, 40); ctx.lineTo(1180, 260); ctx.moveTo(1180, 40); ctx.lineTo(940, 260); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(50, 560); chip(ctx, 'NO PLANES', 0, 0, { size: 120, bg: C.yellow, color: C.ink }); ctx.restore();
    text(ctx, 'FOR 9 MONTHS', 56, 690, { size: 84, font: F.head, color: C.cream, stroke: 10, strokeColor: C.ink, shadow: 16 });
    fs.writeFileSync(process.argv[4], cv.toBuffer('image/jpeg', 92)); }
})();
