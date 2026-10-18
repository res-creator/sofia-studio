// Ep1 renderer. node render.js video <block> out.mp4 | still <block> t1,t2,.. out.png (t relative to block start) | one <abs t> out.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const { spawn } = require('child_process');
const C = require('./lib/core'), { TL } = require('./seq'), { R } = require('./lib/cast');
const { W, H, FPS } = C, CAPS = C.makeCaptions(TL);
const SC = {}; const scene = b => SC[b] || (SC[b] = require('./scenes/' + b));
function blockAt(t) { for (const b of Object.keys(TL.blocks)) if (t >= TL.blocks[b].t0 && t < TL.blocks[b].t1) return b; return 'final'; }
function frame(ctx, t, b) {
  b = b || blockAt(t); const sc = scene(b);
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const info = sc.draw(ctx, t, TL) || {}; ctx.restore();
  C.whipSmear(ctx, C.getWhip());
  if (!info.noFinish) C.finish(ctx, t, info.vig ?? 0.45);
  if (info.post) info.post(ctx);
  if (!info.noCaps) C.caption(ctx, CAPS, t, sc.capTop ? sc.capTop(t, TL) : false);
  if (info.fade) C.fade(ctx, info.fade);
}
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'still') {
  const B = TL.blocks[a1], ts = a2.split(',').map(Number), cols = Math.min(3, ts.length), rows = Math.ceil(ts.length / cols), sw = 640, sh = 360;
  const out = createCanvas(cols * sw, rows * sh), ox = out.getContext('2d'), c = createCanvas(W, H), x = c.getContext('2d');
  ts.forEach((t, k) => { frame(x, B.t0 + t, a1); ox.drawImage(c, (k % cols) * sw, Math.floor(k / cols) * sh, sw, sh); ox.fillStyle = '#ff0'; ox.font = '22px Nunito'; ox.fillText(t.toFixed(2), (k % cols) * sw + 8, Math.floor(k / cols) * sh + 24); });
  require('fs').writeFileSync(a3, out.toBuffer('image/png'));
  const qa = [...new Set(R.QA)]; console.log(qa.length ? 'QA:\n' + qa.slice(0, 30).join('\n') : 'QA ok');
} else if (mode === 'qa') {   // reach errors with their times (block-relative), every 3rd frame
  const B = TL.blocks[a1], c = createCanvas(W, H), x = c.getContext('2d'); let n = 0;
  for (let f = Math.round(B.t0 * FPS); f < Math.round(B.t1 * FPS); f += (+process.env.STEP || 3)) { frame(x, f / FPS, a1); const add = R.QA.slice(n); n = R.QA.length;
    const bad = add.filter(q => +q.match(/(\d+)px/)[1] > (+process.env.MIN || 8)); if (bad.length) console.log((f / FPS - B.t0).toFixed(2), bad.join(' | ')); }
} else if (mode === 'one') {
  const c = createCanvas(W, H), x = c.getContext('2d'); frame(x, +a1); require('fs').writeFileSync(a2, c.toBuffer('image/png'));
} else {
  const B = TL.blocks[a1], c = createCanvas(W, H), x = c.getContext('2d'), f0 = Math.round(B.t0 * FPS), f1 = Math.round(B.t1 * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', a2], { stdio: ['pipe', 'inherit', 'inherit'] });
  (async () => { const t0 = Date.now(); for (let f = f0; f < f1; f++) { frame(x, f / FPS, a1); const b = x.getImageData(0, 0, W, H).data; if (!ff.stdin.write(Buffer.from(b.buffer))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end();
    const qa = [...new Set(R.QA)]; console.log(a1, (f1 - f0) + ' frames', ((Date.now() - t0) / 1000).toFixed(0) + 's', qa.length ? 'QA:\n' + qa.slice(0, 30).join('\n') : 'QA ok'); })();
}
