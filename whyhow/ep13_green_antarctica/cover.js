// EP13 thumbnails (1280x720), v2 rules: one big real subject, 2-4 words, high contrast. Real fossil photo / licensed paleoart / NASA (see CREDITS).
// node cover.js OUT_A.jpg OUT_B.jpg OUT_C.jpg   (run from atlaskit/)
const K = require('../atlaskit/core'); const fs = require('fs'); const { loadImage } = require('@napi-rs/canvas');
const { C, F, text, chip } = K; const W = 1280, H = 720;
const img = f => loadImage(__dirname + '/footage/' + f + '.jpg');
const vign = (ctx, a) => { const g = ctx.createRadialGradient(W * 0.6, H * 0.5, 250, W * 0.6, H * 0.5, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
const T = (ctx, s, x, y, size, color, align) => text(ctx, s, x, y, { size, font: F.head, color: color || C.cream, stroke: 14, strokeColor: C.ink, shadow: 20, align });
(async () => {
  // A: Cryolophosaurus skull (museum cast of the Antarctic fossil)
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('cm_cryolophosaurus_skull_cast_aurora');
    ctx.filter = 'contrast(1.2) saturate(1.2)'; ctx.drawImage(im, 0, 100, 1920, 1080, 250, 0, 1280, 720); ctx.filter = 'none';
    const g = ctx.createLinearGradient(0, 0, 760, 0); g.addColorStop(0, 'rgba(6,12,24,1)'); g.addColorStop(0.55, 'rgba(6,12,24,0.85)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 800, H); vign(ctx, 0.5);
    ctx.save(); ctx.translate(50, 120); chip(ctx, '190 MILLION YEARS AGO', 0, 0, { size: 50, bg: C.red, color: C.cream }); ctx.restore();
    T(ctx, 'DINOSAURS', 44, 330, 160);
    ctx.save(); ctx.translate(50, 470); chip(ctx, 'IN ANTARCTICA', 0, 0, { size: 104, bg: C.yellow, color: C.ink }); ctx.restore();
    fs.writeFileSync(process.argv[2], cv.toBuffer('image/jpeg', 92)); }
  // B: NASA bedrock under the ice
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const im = await img('gov_nasa_bedmachine_still');
    ctx.filter = 'contrast(1.2) saturate(1.3)'; ctx.drawImage(im, 0, 0, 1920, 1080, 0, 0, W, H); ctx.filter = 'none'; vign(ctx, 0.55);
    const g = ctx.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, 'rgba(6,12,24,0.85)'); g.addColorStop(1, 'rgba(6,12,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 300);
    T(ctx, 'UNDER THE ICE', W / 2, 170, 150, null, 'center');
    ctx.save(); ctx.translate(W / 2, 640); chip(ctx, 'THE DEEPEST CANYON ON LAND', 0, 0, { size: 84, bg: C.yellow, color: C.ink, align: 'center' }); ctx.restore();
    fs.writeFileSync(process.argv[3], cv.toBuffer('image/jpeg', 92)); }
  // C: THEN (paleoart) / NOW (real aerial) split
  { const cv = K.createCanvas(W, H), ctx = cv.getContext('2d'); const a = await img('cm_reconstruction_snow_hill_island_cretaceous'), b = await img('cm_transantarctic_beardmore_icebridge_2013');
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(700, 0); ctx.lineTo(580, H); ctx.lineTo(0, H); ctx.clip(); ctx.filter = 'saturate(1.35) contrast(1.15)'; ctx.drawImage(a, 0, 100, 1300, 1100, 0, 0, 700 * 1.1, H); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.moveTo(700, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(580, H); ctx.clip(); ctx.filter = 'contrast(1.2)'; ctx.drawImage(b, 500, 0, 1200, 1080, 560, 0, 720, H); ctx.restore();
    ctx.strokeStyle = C.cream; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(700, 0); ctx.lineTo(580, H); ctx.stroke(); vign(ctx, 0.4);
    T(ctx, 'THEN', 50, 170, 150); T(ctx, 'NOW', 1230, 170, 150, null, 'right');
    ctx.save(); ctx.translate(W / 2, 640); chip(ctx, 'SAME CONTINENT', 0, 0, { size: 96, bg: C.yellow, color: C.ink, align: 'center' }); ctx.restore();
    text(ctx, 'RECONSTRUCTION', 40, 700, { size: 22, font: F.monoB, color: C.cream, stroke: 4, strokeColor: C.ink });
    fs.writeFileSync(process.argv[4], cv.toBuffer('image/jpeg', 92)); }
})();
