// usage: node tools/frames.mjs outdir t1,t2,...   -> one bundle, many stills (seconds)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const [out, list] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const comp = await selectComposition({ serveUrl, id: process.env.COMP || 'Main', browserExecutable });
for (const t of list.split(',')) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(parseFloat(t) * 30));
  await renderStill({ composition: comp, serveUrl, output: `${out}/f_${String(frame).padStart(5, '0')}.jpg`, frame, browserExecutable, imageFormat: 'jpeg', jpegQuality: 85, chromiumOptions: { gl: 'swiftshader' } });
}
console.log('done');
