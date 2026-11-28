// Frame-exact renderer: node render.js frames [fps] [from] [to]   |   node render.js stills t1 t2 ...
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const DIR = __dirname, T = 14.0;
(async () => {
  const mode = process.argv[2] || 'stills';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[err]', e.message));
  await page.goto('file://' + path.join(DIR, 'scene.html'));
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  const el = await page.$('#c');
  if (mode === 'stills') {
    fs.mkdirSync(path.join(DIR, 'stills'), { recursive: true });
    for (const s of process.argv.slice(3)) {
      const t = parseFloat(s);
      await page.evaluate(t => window.renderFrame(t), t);
      await el.screenshot({ path: path.join(DIR, 'stills', `t${t.toFixed(2).padStart(5, '0')}.png`) });
      console.log('still', t);
    }
  } else {
    const fps = parseInt(process.argv[3] || '30'), N = Math.round(T * fps);
    const from = parseInt(process.argv[4] || '0'), to = Math.min(N, parseInt(process.argv[5] || String(N)));
    fs.mkdirSync(path.join(DIR, 'frames'), { recursive: true });
    const t0 = Date.now();
    for (let i = from; i < to; i++) {
      const f = path.join(DIR, 'frames', `f${String(i).padStart(4, '0')}.jpg`);
      if (fs.existsSync(f)) continue;
      await page.evaluate(t => window.renderFrame(t), i / fps);
      await page.screenshot({ path: f + '.tmp', type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
      fs.renameSync(f + '.tmp', f);
      if (i % 30 === 0) console.log('frame', i, '/', N, ((Date.now() - t0) / 1000).toFixed(1) + 's');
    }
    console.log('DONE');
  }
  await browser.close();
})();
