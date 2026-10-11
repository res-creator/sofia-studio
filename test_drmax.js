// Render Dr. Max character sheet: 6 poses + scale comparison with Sofia & Gus
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const { drawDrMax, drawPen, drawClipboard } = require('./lib/drmax');
const { drawSofia } = require('./lib/sofia');
const { drawGus } = require('./lib/gus');

const W = 2400, H = 2400;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#F0EDE8';
ctx.fillRect(0, 0, W, H);

ctx.fillStyle = '#3a221d';
ctx.font = 'bold 32px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Dr. Max — Character Sheet', W / 2, 40);

// ---- 6 poses (top 2/3) ----
const poses = [
  { label: 'Neutral (clipboard)', pose: { mouth: { smile: 0.3, open: 0 }, browL: 0.15, browR: 0.15 } },
  { label: 'Friendly greeting', pose: { mouth: { smile: 0.8, open: 0.4 }, browL: 0.4, browR: 0.4, wide: 0.2, armL: [-180, -360], handL: 'open' } },
  { label: 'Surprised (Gus honk)', pose: { surprise: 1, mouth: { open: 0.6, smile: 0, w: 1.2 }, lean: 0.06, browL: 1.0, browR: 1.0, wide: 0.5, blink: -0.15, clipboard: false, armR: [120, -200], armL: [-120, -200], handR: 'open', handL: 'open' } },
  { label: 'Writing on clipboard', pose: { look: [0.2, 0.5], mouth: { smile: 0.1, open: 0 }, browL: 0.2, browR: 0.15, tilt: 0.06, turn: 0.08, clipboard: false, armsFront: true, armR: [50, -80], holdR: (c,s,a) => drawClipboard(c,s,a), armL: [-20, -100], holdL: (c,s,a) => drawPen(c,s,a) } },
  { label: 'Deadpan hold', pose: { mouth: { smile: -0.1, open: 0, w: 0.7 }, blink: 0.25, clipboard: false, armR: [110, -50], armL: [-110, -50] } },
  { label: 'Head shake (no)', pose: { turn: 0.4, tilt: -0.1, mouth: { smile: 0.2, open: 0.15 }, browL: 0.5, browR: 0.1, clipboard: false, armR: [100, -80], handR: 'open' } },
];

const cols = 3, rows = 2;
const gridH = 1600;
const cellW = W / cols, cellH = gridH / rows;

for (let i = 0; i < poses.length; i++) {
  const col = i % cols, row = Math.floor(i / cols);
  const cx = col * cellW + cellW / 2;
  const cy = 60 + row * cellH + cellH / 2 + 30;

  ctx.save();
  ctx.strokeStyle = '#D0C8C0'; ctx.lineWidth = 2;
  ctx.strokeRect(col * cellW + 10, 60 + row * cellH + 10, cellW - 20, cellH - 20);
  ctx.restore();

  ctx.fillStyle = '#3a221d'; ctx.font = 'bold 24px sans-serif';
  ctx.fillText(poses[i].label, cx, 60 + row * cellH + 38);

  drawDrMax(ctx, cx, cy + 180, 0.65, poses[i].pose);
}

// ---- Scale comparison (bottom strip) ----
const compY = gridH + 100;
ctx.save();
ctx.strokeStyle = '#D0C8C0'; ctx.lineWidth = 2;
ctx.strokeRect(10, compY - 20, W - 20, H - compY + 10);
ctx.restore();

ctx.fillStyle = '#3a221d'; ctx.font = 'bold 28px sans-serif';
ctx.fillText('Scale Comparison', W / 2, compY + 10);

// Floor line
const floorY = compY + 520;
ctx.save(); ctx.strokeStyle = '#C0B8B0'; ctx.lineWidth = 2; ctx.setLineDash([10, 6]);
ctx.beginPath(); ctx.moveTo(100, floorY); ctx.lineTo(W - 100, floorY); ctx.stroke();
ctx.restore();
ctx.fillStyle = '#9A8A7A'; ctx.font = '18px sans-serif';
ctx.fillText('floor line', W / 2, floorY + 22);

// Draw all three at consistent scale
const sc = 0.6;
// Sofia — origin at hip, feet at ~+280
drawSofia(ctx, 500, floorY - 280 * sc, sc, { mouth: { smile: 0.5, open: 0 }, outfit: 'sweater' });
ctx.fillStyle = '#3a221d'; ctx.font = 'bold 22px sans-serif';
ctx.fillText('Sofia', 500, floorY + 44);

// Dr. Max — origin at hip, feet at ~+280 (slightly taller)
drawDrMax(ctx, 1200, floorY - 280 * sc, sc, { mouth: { smile: 0.3, open: 0 } });
ctx.fillText('Dr. Max', 1200, floorY + 44);

// Gus — origin at feet, ~520 tall
drawGus(ctx, 1900, floorY, sc, { honk: 0, wing: 0, lids: 0.55, tie: true });
ctx.fillText('Gus', 1900, floorY + 44);

const buf = canvas.toBuffer('image/png');
fs.writeFileSync('drmax_sheet.png', buf);
console.log('Saved drmax_sheet.png', W, 'x', H);
