// Thumbnail: Figma art (art/src/thumbnail_art.png, 1 generation) + headline in code. node film/thumbnail.js
const { createCanvas, loadImage } = require('@napi-rs/canvas'); const fs = require('fs'), path = require('path');
(async () => { const W = 1280, H = 720, cv = createCanvas(W, H), c = cv.getContext('2d'), F = '"Inter Display", Inter, sans-serif';
  const im = await loadImage(path.join(__dirname, '../art/src/thumbnail_art.png')); c.drawImage(im, 0, 0, W, H);
  const g = c.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, 'rgba(10,8,6,0.6)'); g.addColorStop(1, 'rgba(10,8,6,0)'); c.fillStyle = g; c.fillRect(0, 0, W * 0.7, 260);
  const line = (s, x, y, size, col, rot = 0) => { c.save(); c.translate(x, y); c.rotate(rot); c.font = `900 ${size}px ${F}`; c.lineJoin = 'round'; c.lineWidth = size * 0.2; c.strokeStyle = '#140c06'; c.strokeText(s, 0, 0); c.fillStyle = col; c.fillText(s, 0, 0); c.restore(); };
  line('LEGO ALMOST', 36, 110, 92, '#FFF4DC', -0.02); line('DESTROYED ITSELF', 36, 205, 78, '#FFD23F', -0.02);
  // red tag: the number
  c.save(); c.translate(1010, 640); c.rotate(-0.05); c.fillStyle = '#D8322A'; c.beginPath(); c.roundRect(-200, -52, 400, 104, 16); c.fill(); c.font = `900 56px ${F}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText('12,000+ PIECES', 0, 4); c.restore();
  fs.writeFileSync(path.join(__dirname, '../how_lego_almost_destroyed_itself_thumbnail.png'), cv.toBuffer('image/png')); console.log('ok'); })();
