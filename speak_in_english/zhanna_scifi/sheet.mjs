// Character sketch sheet: node sheet.mjs [boil 0..2] → out/sketch.png
import { createCanvas, GlobalFonts, Path2D } from '@napi-rs/canvas';
globalThis.Path2D = Path2D;
const D = new URL('.', import.meta.url).pathname;
for (const [f, n] of [['baloo2', 'Baloo 2'], ['bungee', 'Bungee'], ['vt323', 'VT323'], ['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL']]) GlobalFonts.registerFromPath(`${D}fonts/${f}.woff2`, n);
const T = await import('./lib/toon.mjs');
const C = await import('./chars.mjs');
const Wd = 2400, Ht = 1560, cv = createCanvas(Wd, Ht); T.init(cv);
T.frame(+(process.argv[2] || 0) / 12); T.translate(0, 70);
const g = T.g;
g.fillStyle = '#f6efe2'; g.fillRect(0, 0, Wd, Ht);
const lab = (s, x, y, size = 28) => { if (y > 100) y += 70; g.setTransform(1, 0, 0, 1, 0, 0); g.font = `900 ${size}px NBL, NBC`; g.textAlign = 'center'; const w = g.measureText(s).width + 24; g.fillStyle = '#fffaf0'; g.strokeStyle = '#1b1422'; g.lineWidth = 3; g.beginPath(); g.roundRect(x - w / 2, y - size, w, size * 1.4, 12); g.fill(); g.stroke(); g.fillStyle = '#2a2232'; g.fillText(s, x, y); };
lab('Sci-Fi Sitcom Toon × Тётя Жанна — эскиз персонажей', Wd / 2, 60, 44);
// row 1: Zhanna main + expressions
C.zhanna(260, 820, 1, 1, { arm: 'hips' }); lab('Жанна — троллит', 240, 880);
C.zhanna(640, 820, 1, 1, { arm: 'point', lid: .15, look: [.6, -.2], o: .55, sm: .5, skew: .2, brow: .9 }); lab('«Деточка, послушай…»', 640, 880);
C.zhanna(1060, 820, 1, 1, { arm: 'clutch', glow: 1, lid: .5, look: [.2, .1], sm: .7, skew: .8, brow: -.2 }); lab('портал из клатча', 1080, 880);
// Kaylee
C.kaylee(1520, 820, 1.05, -1, {}); lab('Кейли — студентка', 1500, 880);
C.kaylee(1880, 820, 1.05, -1, { o: .8, w: 1.1, sm: -.6, brow: 1.4, look: [0, -.2], jit: 2 }); lab('паника', 1870, 880);
// portal
C.portal(2230, 520, 120, .4, 1); lab('портал Жанны', 2230, 880);
// row 2: Petrovich + close-ups of face
C.petrovich(300, 1420, .85, {}); lab('Петрович — только со спины', 300, 1470);
// big face close-ups
T.push(); T.translate(0, 0);
C.zhanna(820, 1960, 1.35, 1, { arm: 'hips', lid: .55, look: [.5, 0], sm: .25, skew: 1, brow: -.1 }); T.pop();
lab('крупно: троллит', 820, 1470);
C.zhanna(1360, 1960, 1.35, -1, { arm: 'hips', lid: 0, look: [0, 0], o: .9, w: 1.2, sm: .2, brow: 1.4, jit: 1 }); lab('шок', 1360, 1470);
C.zhanna(1880, 1960, 1.35, 1, { arm: 'hips', lid: .3, look: [-.6, -.4], o: .35, sm: .9, skew: -.3, brow: .6 }); lab('смех', 1880, 1470);
// palette strip
const pal = ['#f6d35b', '#e9a94a', '#4fc8de', '#e0234f', '#ff3fa4', '#ffd23f', '#b03cff', '#7fd6b4', '#2c3f8f', '#1b1422'];
pal.forEach((c, i) => { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = c; g.fillRect(2120 + (i % 5) * 52, 1050 + Math.floor(i / 5) * 52, 46, 46); g.strokeStyle = '#1b1422'; g.lineWidth = 4; g.strokeRect(2120 + (i % 5) * 52, 1050 + Math.floor(i / 5) * 52, 46, 46); });
lab('палитра', 2240, 1110, 26);
const fs = await import('fs'); fs.mkdirSync(`${D}out`, { recursive: true });
fs.writeFileSync(`${D}out/sketch${process.argv[2] || ''}.png`, cv.toBuffer('image/png'));
console.log('ok');
