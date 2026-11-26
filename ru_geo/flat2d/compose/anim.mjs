// node anim.mjs jobs.json : анимированные карточки (кадры PNG 30 fps) в стиле «редакторской» графики
import { chromium } from '/home/user/sofia-studio/2d-video/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const D = path.dirname(fileURLToPath(import.meta.url)); const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const font = fs.readFileSync(D + '/fonts/Neucha.ttf').toString('base64');
const css = `@font-face{font-family:Neucha;src:url(data:font/ttf;base64,${font})}*{margin:0;box-sizing:border-box}body{width:1920px;height:1080px;overflow:hidden;font-family:Neucha,Inter,sans-serif;color:#fff;background:#000}
#bg{position:absolute;inset:0}.dark{background:#1d1d1f}.black{background:#000}
#frame{position:absolute;inset:30px}#num{position:absolute;top:350px;width:100%;text-align:center;font-size:36px;letter-spacing:6px}
#title{position:absolute;top:405px;width:100%;text-align:center;font-size:124px;line-height:1.06;text-transform:uppercase;font-weight:700;padding:0 140px}
#icon{position:absolute;bottom:140px;width:100%;text-align:center;font-size:150px;filter:grayscale(1) brightness(0) invert(1)}
#big{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Inter,sans-serif}#bn{font-size:240px;font-weight:800;letter-spacing:-4px;white-space:nowrap}#bl{font-size:64px;margin-top:22px;font-family:Neucha,Inter,sans-serif;opacity:0}
#bar{height:6px;background:#fff;margin-top:34px;width:0}`;
const html = (j) => j.type === 'chapter' ? `<div id="bg" class="dark"></div><svg id="frame" width="1860" height="1020" viewBox="0 0 1860 1020"><rect id="rc" x="2" y="2" width="1856" height="1016" rx="36" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg><div id="num"></div><div id="title"></div><div id="icon"></div>`
  : `<div id="bg" class="black"></div><div id="big"><div id="bn"></div><div id="bar"></div><div id="bl"></div></div>`;
const E3 = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
for (const j of jobs) {
  await pg.setContent(`<style>${css}</style>${html(j)}`); await pg.evaluate(() => document.fonts.ready); fs.mkdirSync(j.dir, { recursive: true });
  const N = Math.round(j.dur * 30);
  for (let f = 0; f < N; f++) {
    const t = f / 30;
    await pg.evaluate(({ j, t }) => {
      const E3 = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3); const $ = (i) => document.getElementById(i);
      if (j.type === 'chapter') {
        $('rc').setAttribute('stroke-dashoffset', 1 - E3(t / 0.9)); $('num').textContent = j.num; $('num').style.opacity = E3((t - 0.25) / 0.4);
        const ti = $('title'); ti.textContent = j.title; ti.style.opacity = E3((t - 0.35) / 0.5); ti.style.transform = `translateY(${(1 - E3((t - 0.35) / 0.5)) * 40}px)`;
        const ic = $('icon'); ic.textContent = j.icon || ''; const k = E3((t - 0.9) / 0.35); ic.style.opacity = k; ic.style.transform = `scale(${0.6 + 0.4 * k})`;
        document.body.style.transform = `scale(${1 + 0.02 * (t / 2.6)})`; document.body.style.transformOrigin = '50% 50%';
      } else {
        const m = String(j.big).match(/^([^0-9\-−]*)(-?[−]?[0-9][0-9 .,]*)(.*)$/); const bn = $('bn');
        if (m && !/[.,]\d/.test(m[2])) { const raw = m[2].replace(/[ ]/g, ''); const target = parseFloat(raw.replace('−', '-')); const cur = Math.round(target * E3(t / 1.1)); bn.textContent = m[1] + cur.toLocaleString('ru-RU').replace(/,/g, ' ') + m[3]; }
        else bn.textContent = j.big;
        const sc = 0.9 + 0.1 * E3(t / 0.35) + 0.04 * (t / 3.2); $('big').style.transform = `scale(${sc})`; $('big').style.opacity = E3(t / 0.12);
        $('bar').style.width = (E3((t - 0.4) / 0.6) * 520) + 'px'; $('bl').textContent = j.label || ''; $('bl').style.opacity = E3((t - 0.6) / 0.5);
      }
    }, { j, t });
    await pg.screenshot({ path: path.join(j.dir, `f${String(f).padStart(4, '0')}.png`) });
  }
}
await b.close(); console.log('anim', jobs.length);
