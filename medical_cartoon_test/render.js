// node render.js still t1,t2,... out.png [cols] | video out.mp4 | chars out.png
const { createCanvas } = require('@napi-rs/canvas'); const fs = require('fs'); const { spawn } = require('child_process');
const { frame, W, H } = require('./scenes'); const FPS = 30, DUR = 15;
function sheet(ts, out, cols = 3, s = 0.5) {
  const rows = Math.ceil(ts.length / cols), sh = createCanvas(W * s * cols, H * s * rows), sx = sh.getContext('2d'), c = createCanvas(W, H), ctx = c.getContext('2d');
  sx.fillStyle = '#000'; sx.fillRect(0, 0, sh.width, sh.height);
  ts.forEach((t, i) => { frame(ctx, t); const x = (i % cols) * W * s, y = Math.floor(i / cols) * H * s; sx.drawImage(c, x, y, W * s, H * s); });
  fs.writeFileSync(out, sh.toBuffer('image/png'));
}
async function video(out) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = FPS * DUR, T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 90 === 0) console.error(`frame ${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
const [mode, a, b, c3] = process.argv.slice(2);
if (mode === 'still') sheet(a.split(',').map(Number), b, +(c3 || 3), 0.5);
else if (mode === 'one') { const c = createCanvas(W, H); frame(c.getContext('2d'), +a); fs.writeFileSync(b, c.toBuffer('image/png')); }
else if (mode === 'video') video(a);
