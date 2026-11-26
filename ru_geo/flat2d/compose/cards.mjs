import { chromium } from '/home/user/sofia-studio/2d-video/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const D = path.dirname(fileURLToPath(import.meta.url)); const list = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const css = `@font-face{font-family:Neucha;src:url(data:font/ttf;base64,${fs.readFileSync(D + '/fonts/Neucha.ttf').toString('base64')})}*{margin:0;box-sizing:border-box}body{width:1920px;height:1080px;overflow:hidden;font-family:Neucha,Inter,sans-serif;color:#fff}
.dark{background:#1d1d1f}.light{background:#f6f5f2;color:#111}.black{background:#000}
.frame{position:absolute;inset:30px;border:3px solid rgba(255,255,255,.55);border-radius:36px}
.num{position:absolute;top:360px;width:100%;text-align:center;font-size:34px;opacity:.85;letter-spacing:6px}
.title{position:absolute;top:410px;width:100%;text-align:center;font-size:118px;line-height:1.08;text-transform:uppercase;font-weight:700;padding:0 160px;text-shadow:0 0 0 #fff}
.icon{position:absolute;bottom:150px;width:100%;text-align:center;font-size:150px;filter:grayscale(1) brightness(0) invert(1)}
.big{position:absolute;top:0;bottom:0;left:0;right:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Inter,sans-serif}
.big b{font-size:230px;font-weight:800;letter-spacing:-4px}.big span{font-size:62px;margin-top:20px;opacity:.85;font-family:Neucha,Inter,sans-serif}`;
const html = (c) => c.type === 'chapter' ? `<body class="dark"><div class="frame"></div><div class="num">${c.num}</div><div class="title">${c.title}</div><div class="icon">${c.icon || ''}</div></body>`
  : `<body class="${c.bg || 'black'}"><div class="big"><b>${c.big}</b><span>${c.label || ''}</span></div></body>`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
for (const c of list) { await pg.setContent(`<style>${css}</style>${html(c)}`); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150); await pg.screenshot({ path: c.out }); }
await b.close(); console.log('cards', list.length);
