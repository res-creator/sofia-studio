// node shoot.js still t1,t2 | video seconds  -> out/still_*.png | out/test.mp4 (silent)
const {chromium} = require('playwright'), {spawn} = require('child_process'), http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, types = {'.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2'};
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'Content-Type': types[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); }).listen(0);
(async () => {
  const port = srv.address().port, b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('PAGE ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await p.goto(`http://localhost:${port}/index.html`); await p.waitForFunction(() => window.renderAt && window.ready, null, {timeout: 60000}); await p.evaluate(() => window.ready);
  const [mode, arg] = process.argv.slice(2);
  const grab = async t => { await p.evaluate(t => window.renderAt(t), t); return Buffer.from((await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png'))).split(',')[1], 'base64'); };
  if (mode === 'still') for (const t of arg.split(',')) { fs.writeFileSync(`out/still_${t}.png`, await grab(+t)); console.log('still', t); }
  else { const N = Math.round(+arg * 30), ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', 'out/test.mp4']);
    const t0 = Date.now(); for (let i = 0; i < N; i++) { ff.stdin.write(await grab(i / 30)); if (i % 30 === 0) console.log('frame', i, ((Date.now() - t0) / (i + 1) / 1000).toFixed(2), 's/frame'); } ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
  await b.close(); srv.close();
})();
