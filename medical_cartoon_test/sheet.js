// characters.png (design sheet) and storyboard.png (contact sheet of key frames)
const { createCanvas } = require('@napi-rs/canvas'); const A = require('./art'); const C = require('./characters'); const { frame } = require('./scenes'); const fs = require('fs');
const out = process.argv[2] || '.';
{
  const c = createCanvas(1920, 1080), x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#26356f'); g.addColorStop(1, '#4a2f6a'); x.fillStyle = g; x.fillRect(0, 0, 1920, 1080);
  x.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 8; i++) x.fillRect(i * 260 + 40, 0, 130, 1080);
  x.fillStyle = '#2b1840'; x.fillRect(0, 930, 1920, 150);
  A.text(x, 'BRAIN  ·  HEART  ·  STOMACH', 960, 90, 70, '#fff', { stroke: 14 });
  C.drawBrain(x, { x: 400, y: 900, s: 1.45, mouth: { open: 0.5, curve: -0.6, teeth: true, w: 80 }, angry: 0.6, browY: 0.3, armL: { x: -200, y: -270, pose: 'fist' }, armR: { x: 190, y: -60, pose: 'point' }, sweat: 1, zap: 0.4, t: 1 });
  C.drawHeart(x, { x: 960, y: 900, s: 1.45, mouth: { open: 0.7, curve: -0.3, w: 70 }, angry: -0.5, browY: -0.8, armL: { x: -190, y: -250, pose: 'open' }, armR: { x: 190, y: -230, pose: 'open' }, sweat: 1, beat: 1, lookX: -0.5, t: 1 });
  C.drawStomach(x, { x: 1480, y: 900, s: 1.25, lid: 0.45, angry: -0.2, mouth: { open: 0.3, curve: -0.4, w: 90 }, armL: { x: -200, y: -40, pose: 'flat' }, armR: { x: 130, y: 10, pose: 'open' }, drool: 0.5, t: 1 });
  for (const [t, xx, col] of [['BRAIN: smart, nervous, irritated', 400, '#ff93b6'], ['HEART: emotional, panics first', 960, '#ff6b81'], ['STOMACH: lazy, grumpy, hungry', 1500, '#ffc247']]) A.text(x, t, xx, 1005, 32, col, { stroke: 0 });
  fs.writeFileSync(out + '/characters.png', c.toBuffer('image/png'));
}
{
  const ts = [0.3, 2.2, 3.4, 4.6, 5.8, 7.6, 9.6, 10.7, 11.9, 12.9, 13.8, 14.4], cols = 3, s = 0.5, W = 1920, H = 1080, rows = ts.length / cols;
  const c = createCanvas(W * s * cols + 20 * (cols + 1), (H * s + 50) * rows + 20), x = c.getContext('2d'); x.fillStyle = '#16102a'; x.fillRect(0, 0, c.width, c.height);
  const f = createCanvas(W, H), fx = f.getContext('2d');
  ts.forEach((t, i) => { frame(fx, t); const px = 20 + (i % cols) * (W * s + 20), py = 20 + Math.floor(i / cols) * (H * s + 50); x.drawImage(f, px, py, W * s, H * s); x.strokeStyle = '#fff'; x.lineWidth = 3; x.strokeRect(px, py, W * s, H * s); A.text(x, `${String(i + 1).padStart(2, '0')}  ·  ${t.toFixed(1)}s`, px + 6, py + H * s + 26, 30, '#fff', { align: 'left', stroke: 0 }); });
  fs.writeFileSync(out + '/storyboard.png', c.toBuffer('image/png'));
}
