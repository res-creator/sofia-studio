// camera at local times: node tools/cam.mjs <film> t1 t2 …  (library root)
import path from 'path';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const [dir, ...ts] = process.argv.slice(2);
const { browser, page } = await openDemo(dir, { gl: false });
console.log(JSON.stringify(await page.evaluate(ts => ts.map(t => [t, window.CAM(+t)]), ts)));
await browser.close(); closeServer(); process.exit(0);
