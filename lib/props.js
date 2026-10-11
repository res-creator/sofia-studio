const { OL, paint, line, curve, roundRect, hash, clamp, lerp } = require('./draw');
const F = require('./fonts');

// Fridge: x = left edge, y = top. W=470,H=1060. drawInside(ctx) draws stuff between back wall and door.
const FW = 470, FH = 1060;
function fridge(ctx, X, Y, o = {}, drawInside) {
  const open = clamp(o.open || 0), light = o.light ?? open;
  ctx.save(); ctx.translate(X, Y);
  // body shell
  paint(ctx, c => roundRect(c, 0, 0, FW, FH, 36), '#E8F4F2', { shade: '#C6DCD9', sx: 22, sy: 0, lw: 7 });
  // interior (visible when open)
  if (open > 0.01) {
    ctx.save(); ctx.beginPath(); roundRect(ctx, 22, 300, FW - 44, FH - 330, 18); ctx.clip();
    const g = ctx.createLinearGradient(0, 300, 0, FH); g.addColorStop(0, '#FFFBEA'); g.addColorStop(1, '#E5EEF0');
    ctx.fillStyle = g; ctx.fillRect(0, 280, FW, FH);
    if (light > 0) { const r = ctx.createRadialGradient(FW / 2, 330, 10, FW / 2, 330, 520); r.addColorStop(0, `rgba(255,248,200,${0.85 * light})`); r.addColorStop(1, 'rgba(255,248,200,0)'); ctx.fillStyle = r; ctx.fillRect(0, 280, FW, FH); }
    // back shelves (behind character)
    for (const sy of [560, 820]) { ctx.fillStyle = 'rgba(160,200,210,0.5)'; ctx.fillRect(22, sy, FW - 44, 14); }
    // goodies on shelves
    paint(ctx, c => roundRect(c, 50, 470, 70, 90, 10), '#FFFFFF', { lw: 5 }); paint(ctx, c => roundRect(c, 50, 450, 70, 30, 6), '#5BB8F0', { lw: 5 });
    paint(ctx, c => { c.moveTo(330, 556); c.lineTo(420, 556); c.lineTo(420, 500); c.closePath(); }, '#FFD54A', { lw: 5 });
    paint(ctx, c => roundRect(c, 340, 740, 70, 80, 14), '#FFF6D8', { lw: 5 }); paint(ctx, c => roundRect(c, 336, 726, 78, 22, 8), '#E5484D', { lw: 4 });
    ctx.restore();
    if (drawInside) { ctx.save(); ctx.beginPath(); roundRect(ctx, 22, 300, FW - 44, FH - 330, 18); ctx.clip(); drawInside(ctx); ctx.restore(); }
  } else if (drawInside && o.peek) { /* nothing */ }
  // freezer door (always closed)
  paint(ctx, c => roundRect(c, 10, 10, FW - 20, 270, 28), '#F4FBFA', { shade: '#D4E6E3', sx: 18, sy: 0, lw: 6 });
  paint(ctx, c => roundRect(c, FW - 70, 120, 22, 120, 11), '#B8C9CC', { lw: 5 });
  // magnets
  paint(ctx, c => c.arc(90, 90, 22, 0, 7), '#E5484D', { lw: 4 }); paint(ctx, c => roundRect(c, 150, 60, 120, 80, 6), '#FFFFFF', { lw: 4 });
  ctx.fillStyle = OL; ctx.font = '700 26px ' + F.EN; ctx.textAlign = 'center'; ctx.fillText('MILK', 210, 98); ctx.font = '600 20px ' + F.EN; ctx.fillText('EGGS?', 210, 126);
  // main door: swings open around the left hinge — gets narrower + darker, then flips to show its inside
  const dw = (FW - 20) * Math.cos(open * Math.PI * 0.62);
  if (dw > 4) {
    paint(ctx, c => roundRect(c, 10, 292, dw, FH - 302, 28), '#F4FBFA', { shade: '#D4E6E3', sx: 18, sy: 0, lw: 6 });
    if (dw > 120) { paint(ctx, c => roundRect(c, 10 + dw - 60, 330, 22, 200, 11), '#B8C9CC', { lw: 5 }); }
    if (open < 0.05 && o.note) { // sticky note on door
      ctx.save(); ctx.translate(140, 420); ctx.rotate(-0.06); paint(ctx, c => roundRect(c, 0, 0, 170, 150, 4), '#FFF07A', { lw: 4 });
      ctx.fillStyle = OL; ctx.font = '700 30px ' + F.EN; ctx.textAlign = 'center'; ctx.fillText('SOFIA', 85, 60); ctx.font = '600 22px ' + F.EN; ctx.fillText('sleeps here', 85, 100); ctx.restore();
    }
  } else {
    const sw = Math.sin(open * Math.PI * 0.62);
    const ow = (FW - 20) * 0.62 * sw;           // visible width of the swung-open door
    const ext = 46 * sw;                        // perspective: the outer edge looks taller
    const x1 = 10, x0 = 10 - ow, y0 = 292, y1 = FH - 10;
    const door = c => { c.moveTo(x1, y0); c.lineTo(x0, y0 - ext); c.quadraticCurveTo(x0 - 16, y0 - ext, x0 - 16, y0 - ext + 30); c.lineTo(x0 - 16, y1 + ext - 30); c.quadraticCurveTo(x0 - 16, y1 + ext, x0, y1 + ext); c.lineTo(x1, y1); c.closePath(); };
    paint(ctx, door, '#DCEBE9', { shade: '#C3D8D5', sx: -14, sy: 0, lw: 6 });
    // gasket + door bins with bottles and eggs
    ctx.save(); ctx.beginPath(); door(ctx); ctx.clip();
    line(ctx, [[x1 - 14, y0 + 20], [x0 + 6, y0 - ext + 26]], 8, '#B9CDCB'); line(ctx, [[x1 - 14, y1 - 20], [x0 + 6, y1 + ext - 26]], 8, '#B9CDCB');
    const bins = [430, 640, 850];
    bins.forEach((by, i) => {
      const k = (by - y0) / (y1 - y0), off = ext * (1 - 2 * k) * 0.0;
      const yy = by + off;
      if (i === 0) for (let e = 0; e < 4; e++) paint(ctx, c => c.ellipse(x0 + 40 + e * (ow - 70) / 3, yy - 26, 18, 24, 0, 0, 7), '#FFF6E8', { lw: 4 });
      if (i === 1) { paint(ctx, c => roundRect(c, x0 + 30, yy - 120, 44, 120, 12), '#7FC97A', { lw: 4 }); paint(ctx, c => roundRect(c, x0 + 90, yy - 100, 50, 100, 12), '#FFFFFF', { lw: 4 }); paint(ctx, c => roundRect(c, x0 + 90, yy - 112, 50, 20, 6), '#5BB8F0', { lw: 4 }); }
      if (i === 2) { paint(ctx, c => roundRect(c, x0 + 36, yy - 90, 60, 90, 14), '#FFF6D8', { lw: 4 }); paint(ctx, c => roundRect(c, x0 + 32, yy - 102, 68, 18, 6), '#E5484D', { lw: 4 }); }
      paint(ctx, c => { c.moveTo(x1 - 8, yy - 36); c.lineTo(x0 + 2, yy - 40); c.lineTo(x0 + 2, yy + 8); c.lineTo(x1 - 8, yy + 6); c.closePath(); }, 'rgba(200,225,230,0.85)', { lw: 4 });
    });
    ctx.restore();
    ctx.save(); ctx.beginPath(); door(ctx); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

function toaster(ctx, X, Y, pop = 0) {
  ctx.save(); ctx.translate(X, Y);
  paint(ctx, c => roundRect(c, -120, -150, 240, 150, 40), '#E9EEF2', { shade: '#BAC4CC', sx: 20, sy: 0, lw: 6 });
  for (const s of [-1, 1]) paint(ctx, c => roundRect(c, s * 50 - 36, -158, 72, 18, 8), '#3a221d', { lw: 0 });
  paint(ctx, c => roundRect(c, 100, -110 + pop * 60, 34, 18, 6), '#E5484D', { lw: 4 });
  ctx.globalAlpha = 0.6; curve(ctx, [-90, -120], [-80, -60], [-90, -20], 8, '#fff'); ctx.globalAlpha = 1;
  ctx.restore();
}
function toast(ctx, X, Y, rot = 0, s = 1, burnt = 0) {
  ctx.save(); ctx.translate(X, Y); ctx.rotate(rot); ctx.scale(s, s);
  paint(ctx, c => { c.moveTo(-50, 60); c.lineTo(-50, -20); c.bezierCurveTo(-70, -80, 70, -80, 50, -20); c.lineTo(50, 60); c.closePath(); }, '#D99A4E', { lw: 6 });
  paint(ctx, c => { c.moveTo(-38, 50); c.lineTo(-38, -16); c.bezierCurveTo(-54, -62, 54, -62, 38, -16); c.lineTo(38, 50); c.closePath(); }, burnt > 0.5 ? '#8C5A2E' : '#F6D598', { lw: 0 });
  ctx.restore();
}
function mug(ctx, X, Y, o = {}) {
  const { full = 1, t = 0, steam = 1, s = 1 } = o;
  ctx.save(); ctx.translate(X, Y); ctx.scale(s, s);
  if (steam > 0 && full > 0.1) {
    ctx.save(); ctx.globalAlpha = 0.55 * steam;
    for (let i = 0; i < 3; i++) { const ph = t * 2 + i; const xx = -24 + i * 24; ctx.beginPath(); ctx.moveTo(xx, -70); ctx.bezierCurveTo(xx + Math.sin(ph) * 16, -110, xx - Math.sin(ph) * 16, -140, xx + Math.sin(ph * 1.3) * 10, -180); ctx.lineWidth = 9; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.stroke(); }
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(52, -30, 26, -1.4, 1.4); ctx.lineWidth = 20; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = '#FF8FA6'; ctx.stroke();
  paint(ctx, c => roundRect(c, -52, -76, 104, 106, 18), '#FF8FA6', { shade: '#E06A85', sx: 14, sy: 0 });
  if (full > 0.05) { ctx.save(); ctx.beginPath(); ctx.ellipse(0, -70, 44, 10, 0, 0, 7); ctx.fillStyle = '#6B3A1F'; ctx.fill(); ctx.restore(); }
  ctx.fillStyle = '#fff'; ctx.font = '700 26px ' + F.EN; ctx.textAlign = 'center'; ctx.fillText('NO.1', 0, -14);
  ctx.restore();
}
function toothbrush(ctx, side) { // drawn in hand space (hand at origin, pointing +y)
  ctx.save(); ctx.rotate(side * 1.4);
  line(ctx, [[0, 0], [0, -120]], 18, OL); line(ctx, [[0, 0], [0, -120]], 10, '#5BB8F0');
  paint(ctx, c => roundRect(c, -10, -150, 20, 34, 6), '#FFFFFF', { lw: 4 });
  ctx.restore();
}
function tube(ctx, X, Y, rot = 0, label = 'MAYO') {
  ctx.save(); ctx.translate(X, Y); ctx.rotate(rot);
  paint(ctx, c => { c.moveTo(-40, -90); c.lineTo(40, -90); c.lineTo(28, 80); c.lineTo(-28, 80); c.closePath(); }, '#FFF6D8', { lw: 5 });
  paint(ctx, c => roundRect(c, -20, 80, 40, 30, 8), '#E5484D', { lw: 5 });
  ctx.fillStyle = '#E5484D'; ctx.font = '700 22px ' + F.EN; ctx.textAlign = 'center'; ctx.fillText(label, 0, -10);
  ctx.restore();
}
function wateringCan(ctx, X, Y, rot = 0) {
  ctx.save(); ctx.translate(X, Y); ctx.rotate(rot);
  paint(ctx, c => { c.moveTo(-60, -60); c.lineTo(60, -60); c.lineTo(70, 60); c.lineTo(-70, 60); c.closePath(); }, '#7FC97A', { shade: '#5FA95A', sx: 12, sy: 0 });
  line(ctx, [[60, 0], [150, -60]], 26, OL); line(ctx, [[60, 0], [150, -60]], 14, '#7FC97A');
  paint(ctx, c => c.ellipse(158, -66, 22, 14, -0.6, 0, 7), '#5FA95A', { lw: 5 });
  ctx.beginPath(); ctx.arc(0, -60, 50, Math.PI, 0); ctx.lineWidth = 16; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = 7; ctx.strokeStyle = '#7FC97A'; ctx.stroke();
  ctx.restore();
}
function water(ctx, X, Y, t, amount = 1, spread = 60, len = 520, seed = 1) {
  ctx.save(); ctx.globalAlpha = 0.85;
  const n = Math.round(26 * amount);
  for (let i = 0; i < n; i++) {
    const ph = (t * 2.2 + hash(i + seed) ) % 1;
    const xx = X + (hash(i * 7 + seed) - 0.5) * spread * (0.4 + ph);
    const yy = Y + ph * len;
    ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 34); ctx.lineWidth = 8; ctx.strokeStyle = '#7CCBFA'; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.restore();
}
function showerHead(ctx, X, Y) {
  line(ctx, [[X + 140, Y - 260], [X + 140, Y - 60], [X + 40, Y - 20]], 26, OL); line(ctx, [[X + 140, Y - 260], [X + 140, Y - 60], [X + 40, Y - 20]], 14, '#C8D3D9');
  paint(ctx, c => { c.moveTo(X - 60, Y + 10); c.lineTo(X + 60, Y + 10); c.lineTo(X + 34, Y - 40); c.lineTo(X - 34, Y - 40); c.closePath(); }, '#C8D3D9', { lw: 6 });
}
function door(ctx, open, t) { // hallway door in frame 330..750 x 450..1530
  ctx.save();
  if (open > 0) {
    const g = ctx.createLinearGradient(0, 450, 0, 1530); g.addColorStop(0, '#9ED8FF'); g.addColorStop(0.55, '#D8F1FF'); g.addColorStop(0.56, '#8CCB7A'); g.addColorStop(1, '#6AAE5C');
    ctx.fillStyle = g; ctx.fillRect(330, 450, 420, 1080);
    ctx.beginPath(); ctx.arc(620, 600, 50, 0, 7); ctx.fillStyle = '#FFE680'; ctx.fill();
  }
  const w = 420 * Math.cos(open * Math.PI * 0.45);
  paint(ctx, c => roundRect(c, 330, 450, w, 1080, 6), '#E5484D', { shade: '#C23338', sx: 14, sy: 0, lw: 6 });
  if (w > 150) {
    for (const yy of [520, 900]) paint(ctx, c => roundRect(c, 330 + w * 0.15, yy, w * 0.7, 300, 10), '#EE6166', { lw: 4.5 });
    paint(ctx, c => c.arc(330 + w - 50, 1000, 20, 0, 7), '#F2C14E', { lw: 5 });
  }
  ctx.restore();
}
function clock(ctx, X, Y, h, m) {
  paint(ctx, c => c.arc(X, Y, 80, 0, 7), '#FFFFFF', { lw: 7 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(ctx, [[X + Math.cos(a) * 62, Y + Math.sin(a) * 62], [X + Math.cos(a) * 70, Y + Math.sin(a) * 70]], 5, OL); }
  const ah = ((h % 12) + m / 60) / 12 * Math.PI * 2 - Math.PI / 2, am = m / 60 * Math.PI * 2 - Math.PI / 2;
  line(ctx, [[X, Y], [X + Math.cos(ah) * 38, Y + Math.sin(ah) * 38]], 10, OL);
  line(ctx, [[X, Y], [X + Math.cos(am) * 56, Y + Math.sin(am) * 56]], 7, '#E5484D');
  paint(ctx, c => c.arc(X, Y, 8, 0, 7), OL, { lw: 0 });
}
function sweater(ctx, X, Y, rot, s = 1) {
  ctx.save(); ctx.translate(X, Y); ctx.rotate(rot); ctx.scale(s, s);
  paint(ctx, c => { c.moveTo(-90, -80); c.lineTo(-170, 10); c.lineTo(-130, 50); c.lineTo(-80, 0); c.lineTo(-80, 110); c.lineTo(80, 110); c.lineTo(80, 0); c.lineTo(130, 50); c.lineTo(170, 10); c.lineTo(90, -80); c.quadraticCurveTo(0, -50, -90, -80); c.closePath(); }, '#F4B63F', { shade: '#D8901C', sx: 10, sy: 0 });
  ctx.restore();
}
// comic burst text
function burst(ctx, X, Y, text, k, col = '#FFD23F', rot = -0.08, size = 1) {
  if (k <= 0) return;
  const s = (k < 0.25 ? (k / 0.25) * 1.25 : 1.25 - Math.min(0.25, (k - 0.25) * 1.2)) * size;
  ctx.save(); ctx.translate(X, Y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.globalAlpha = k > 0.85 ? (1 - k) / 0.15 : 1;
  paint(ctx, c => { const n = 14; for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? 150 : 200; const xx = Math.cos(a) * r * 1.4, yy = Math.sin(a) * r * 0.75; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.closePath(); }, col, { lw: 8 });
  ctx.font = '700 110px ' + F.EN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 16; ctx.strokeStyle = OL; ctx.lineJoin = 'round'; ctx.strokeText(text, 0, 6);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(text, 0, 6);
  ctx.restore();
}
function zzz(ctx, X, Y, t) {
  ctx.save(); ctx.font = '700 70px ' + F.EN; ctx.textAlign = 'center';
  for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; const xx = X + ph * 80 + Math.sin(ph * 6) * 14, yy = Y - ph * 200; ctx.font = `700 ${50 + ph * 40}px ` + F.EN; ctx.strokeText('Z', xx, yy); ctx.fillStyle = '#7A5CC9'; ctx.fillText('Z', xx, yy); }
  ctx.restore();
}
function stars(ctx, X, Y, t, r = 120) { // dizzy stars orbit
  for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2; const xx = X + Math.cos(a) * r, yy = Y + Math.sin(a) * r * 0.3;
    ctx.save(); ctx.translate(xx, yy); ctx.rotate(a); paint(ctx, c => { for (let k = 0; k <= 10; k++) { const aa = k / 10 * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? 12 : 28; k ? c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr) : c.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.closePath(); }, '#FFD23F', { lw: 4 }); ctx.restore(); }
}
module.exports = { fridge, FW, FH, toaster, toast, mug, toothbrush, tube, wateringCan, water, showerHead, door, clock, sweater, burst, zzz, stars };
