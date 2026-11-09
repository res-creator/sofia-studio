// Episode 28 (Victor Lustig) — style frames for the owner: the adult documentary look (archive photos + dark cinematic grade + red stamps,
// typewriter tags), 1080x1920. Three frames: frame 0 (hook), the forged letter, Lustig's portrait. node styleframe.js out.png
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas'); const fs = require('fs'), path = require('path');
const W = 1080, H = 1920, F = '"Inter Display", Inter, sans-serif', TW = '"DejaVu Sans Mono", monospace', SERIF = '"DejaVu Serif", serif';
function grain(x, a = 0.07) { const d = x.getImageData(0, 0, W, H), p = d.data; for (let i = 0; i < p.length; i += 4) { const n = (Math.random() - 0.5) * 255 * a; p[i] += n; p[i + 1] += n; p[i + 2] += n; } x.putImageData(d, 0, 0); }
function vignette(x, a = 0.6) { const g = x.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); x.fillStyle = g; x.fillRect(0, 0, W, H); }
function photo(x, im, cx, cy, h, filter = 'grayscale(1) contrast(1.25) brightness(0.8) sepia(0.25)') { const w = h * im.width / im.height; x.save(); x.filter = filter; x.drawImage(im, cx - w / 2, cy - h / 2, w, h); x.restore(); }
function stamp(x, s, cx, cy, size, rot) { x.save(); x.translate(cx, cy); x.rotate(rot); x.font = `900 ${size}px ${F}`; x.textAlign = 'center'; x.textBaseline = 'middle'; const w = x.measureText(s).width + size * 0.6;
  x.globalAlpha = 0.92; x.strokeStyle = '#D0281C'; x.lineWidth = size * 0.1; x.strokeRect(-w / 2, -size * 0.7, w, size * 1.4); x.fillStyle = '#D0281C'; x.fillText(s, 0, size * 0.05); x.restore(); }
function headline(x, a, b, y) { x.textAlign = 'center'; x.font = `900 92px ${F}`; x.fillStyle = '#F2EDE4'; x.fillText(a, W / 2, y); x.fillStyle = '#E3B341'; x.fillText(b, W / 2, y + 104); }
function tag(x, s, X, Y) { x.font = `700 34px ${TW}`; const w = x.measureText(s).width; x.fillStyle = 'rgba(242,237,228,0.92)'; x.fillRect(X, Y - 30, w + 32, 52); x.fillStyle = '#171717'; x.textAlign = 'left'; x.fillText(s, X + 16, Y + 6); }
(async () => { const A = path.join(__dirname, 'archive'); const tower = await loadImage(path.join(A, 'tower_1927_loc.jpg')), lustig = await loadImage(path.join(A, 'Victor_Lustig.jpg'));
  const sheet = createCanvas(W * 3 + 80, H + 40), S = sheet.getContext('2d'); S.fillStyle = '#222'; S.fillRect(0, 0, sheet.width, sheet.height);
  const frames = [];
  // 1 · frame 0: the tower (one half of the 1927 stereo card, cropped tall), SOLD stamp, headline
  { const c = createCanvas(W, H), x = c.getContext('2d'); x.fillStyle = '#0d0c0b'; x.fillRect(0, 0, W, H);
    x.save(); x.beginPath(); x.rect(0, 0, W, H); x.clip(); x.filter = 'grayscale(1) contrast(1.3) brightness(0.75) sepia(0.3)'; const sw = tower.width / 2; x.drawImage(tower, 20, 0, sw - 40, tower.height, -620, 200, 2300, 2300 * tower.height / (sw - 40)); x.restore();
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(10,8,6,0.85)'); g.addColorStop(0.35, 'rgba(10,8,6,0.1)'); g.addColorStop(0.8, 'rgba(10,8,6,0.2)'); g.addColorStop(1, 'rgba(10,8,6,0.9)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    headline(x, 'HE SOLD THE', 'EIFFEL TOWER', 330); stamp(x, 'SOLD', 560, 1000, 150, -0.18); tag(x, 'PARIS · 1925', 70, 1430);
    x.font = `600 22px ${F}`; x.fillStyle = 'rgba(242,237,228,0.7)'; x.textAlign = 'right'; x.fillText('PHOTO: LIBRARY OF CONGRESS, 1927', W - 50, 1500); vignette(x); grain(x); frames.push(c); }
  // 2 · the forged letter on a desk, CONFIDENTIAL
  { const c = createCanvas(W, H), x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1d14'); g.addColorStop(1, '#0e0906'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.save(); x.translate(W / 2, 900); x.rotate(-0.05); x.shadowColor = 'rgba(0,0,0,0.7)'; x.shadowBlur = 60; x.fillStyle = '#efe6d0'; x.fillRect(-380, -500, 760, 1000); x.shadowColor = 'transparent';
    x.fillStyle = '#2a2016'; x.textAlign = 'center'; x.font = `700 40px ${SERIF}`; x.fillText('RÉPUBLIQUE FRANÇAISE', 0, -400); x.font = `italic 30px ${SERIF}`; x.fillText('Ministère des Postes et Télégraphes', 0, -350);
    for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(42,32,22,0.5)'; x.fillRect(-300, -250 + i * 50, 600 - (i % 3) * 90, 10); } x.restore();
    stamp(x, 'CONFIDENTIAL', 540, 760, 86, -0.12); headline(x, 'THE TOWER', 'IS RUSTING', 260); tag(x, 'RE-CREATED LETTER', 70, 1430); vignette(x, 0.7); grain(x); frames.push(c); }
  // 3 · Lustig's portrait (archive), name tag, "$70,000" counter
  { const c = createCanvas(W, H), x = c.getContext('2d'); x.fillStyle = '#0d0c0b'; x.fillRect(0, 0, W, H);
    x.save(); x.translate(W / 2, 860); x.rotate(0.03); x.shadowColor = 'rgba(0,0,0,0.8)'; x.shadowBlur = 50; x.fillStyle = '#f4efe4'; x.fillRect(-370, -400, 740, 860); x.shadowColor = 'transparent'; x.restore();
    photo(x, lustig, W / 2, 820, 700); x.font = `700 36px ${TW}`; x.fillStyle = '#2a2016'; x.textAlign = 'center'; x.fillText('VICTOR LUSTIG (CENTER) · NEWSPAPER, 1935', W / 2, 1270);
    x.font = `900 130px ${F}`; x.fillStyle = '#E3B341'; x.fillText('$70,000', W / 2, 330); tag(x, 'BY ONE ACCOUNT · DISPUTED', 230, 420); vignette(x); grain(x); frames.push(c); }
  frames.forEach((c, i) => S.drawImage(c, 20 + i * (W + 20), 20)); fs.writeFileSync(process.argv[2] || path.join(__dirname, 'eiffel_style_frames.png'), sheet.toBuffer('image/png')); console.log('ok'); })();
