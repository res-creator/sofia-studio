// atlaskit renderer. Episode dir must contain shots.js exporting { assets: {name: path}, build(T) -> [{t, scene, p, trans}] } and timeline.json + words.json.
// node render.js EPDIR stills t1,t2,... OUT_PREFIX   — PNG stills
// node render.js EPDIR sheet STEP OUT.jpg           — contact sheet every STEP seconds
// node render.js EPDIR video OUT.mp4 [JOBS] [FROM TO] — silent video, parallel chunks
// node render.js EPDIR chunk F0 F1 OUT.mp4          — (internal) one chunk
const path = require('path'), fs = require('fs'), { spawn, execFileSync } = require('child_process');
const K = require('./core'); const S = require('./scenes'); const X = require('./xsec');
const V = require('./video');
const S2 = require('./scenes2');
const SC = { ...S, ...S2, xsec: X.xsec, siphon: X.siphonCloseup, examples: X.examples };
// scenes that do not draw overlays themselves get them drawn on top when p.over is set
for (const n of ['stats', 'split', 'bars', 'ratio', 'calendar', 'thermo', 'countdown', 'mythq', 'compare', 'ring', 'river', 'district', 'shaft', 'frost', 'vapour']) if (SC[n]) { const f = SC[n]; SC[n] = (ctx, t, d, p) => { f(ctx, t, d, p); if (p.over) S.overlays(ctx, t, d, p); }; }
const [, , EPD, MODE, ...ARGS] = process.argv; const EP = path.resolve(EPD);
const TL = JSON.parse(fs.readFileSync(path.join(EP, 'timeline.json'))); const WORDS = JSON.parse(fs.readFileSync(fs.existsSync(path.join(EP, 'words_script.json')) ? path.join(EP, 'words_script.json') : path.join(EP, 'words.json')));
const norm = s => s.toLowerCase().replace(/[^a-z0-9']/g, '');
// T: timing helpers for the episode
const P = Object.fromEntries(TL.paras.map(p => [p.id, p]));
const T = {
  tl: TL, P,
  s: id => P[id].start, e: id => P[id].start + P[id].dur,
  // time of the n-th occurrence (n>=1) of a word in paragraph id; number = fraction of the paragraph
  at(id, w, n = 1) { const p = P[id]; if (typeof w === 'number') return p.start + p.dur * w;
    const ws = WORDS[id] || []; let k = 0; for (const x of ws) if (norm(x.w) === norm(w) && ++k === n) return p.start + x.s;
    console.error('word not found', id, w); return p.start; },
  end: TL.voiceEnd + TL.qcard + TL.endscreen,
  words: id => (WORDS[id] || []).map(x => ({ w: x.w, s: P[id].start + x.s, e: P[id].start + x.e })),
};
const ep = require(path.join(EP, 'shots.js'));
const shots = ep.build(T).sort((a, b) => a.t - b.t);
shots.forEach((s, i) => { s.end = i + 1 < shots.length ? shots[i + 1].t : T.end; s.d = s.end - s.t; if (!SC[s.scene]) throw new Error('no scene ' + s.scene); });
// auto-split long shots of photo/video/diagram into parts with a hard cut and a different framing (punch-in), time continues
// usage check: each photo/clip at most 2 times, never back to back
{ const cnt = {}; let last = null; for (const s of shots) { const k = s.p && (s.p.img || s.p.file); if (!k) { last = null; continue; } cnt[k] = (cnt[k] || 0) + 1; if (k === last) console.error('WARN back-to-back', k, s.t.toFixed(1)); last = k; }
  for (const [k, n] of Object.entries(cnt)) if (n > 2) console.error('WARN used', n, 'times:', k); }
if (ep.splitOver) { const SPL = ['photo', 'video', 'xsec', 'sat', 'siphon']; const res = [];
  for (const s of shots) { if (!SPL.includes(s.scene) || s.d <= ep.splitOver) { res.push(s); continue; }
    const n = Math.ceil(s.d / (ep.splitTo || 6)); const part = s.d / n;
    for (let k = 0; k < n; k++) { const pk = k % 2 ? { ...s.p, _punch: 1.22, _fx: 0.35 + 0.3 * (k % 4 === 1 ? 1 : 0), _fy: 0.45 } : { ...s.p, _punch: 1, _fx: 0.5, _fy: 0.5 };
      res.push({ ...s, t: s.t + k * part, end: s.t + (k + 1) * part, d: part, p: pk, off: k * part, dd: s.d, trans: k ? 'cut' : s.trans, _parent: s }); } }
  shots.length = 0; shots.push(...res); }
const DUR = T.end, NF = Math.ceil(DUR * K.FPS);
const XF = 0.5; // crossfade seconds
shots.forEach(s => { if (!s.trans) s.trans = ep.defaultTrans || 'fade'; });
let cvA, cvB;
function drawShot(ctx, s, time) { ctx.save(); SC[s.scene](ctx, time - s.t + (s.off || 0), s.dd || s.d, s.p || {}); ctx.restore(); }
async function frame(ctx, time) {
  let i = shots.findIndex(s => time >= s.t && time < s.end); if (i < 0) i = shots.length - 1; const s = shots[i];
  const lt0 = time - s.t, need = [s]; if (i > 0 && lt0 < XF && s.trans !== 'cut') need.push(shots[i - 1]);
  for (const x of need) await V.prepare(x, time, EP); V.release(need);
  drawShot(ctx, s, time);
  const lt = time - s.t; if (i > 0 && lt < XF && s.trans !== 'cut') { // dissolve from previous shot
    const pv = shots[i - 1]; if (!cvB) cvB = K.createCanvas(K.W, K.H); const b = cvB.getContext('2d'); drawShot(b, pv, time);
    ctx.save(); ctx.globalAlpha = 1 - K.E.sine(lt / XF); ctx.drawImage(cvB, 0, 0); ctx.restore(); }
  // global fade from black at start, to black at end
  const fin = K.clamp(time / 0.6), fout = K.clamp((DUR - time) / 1.0); if (fin < 1 || fout < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - Math.min(fin, fout)})`; ctx.fillRect(0, 0, K.W, K.H); }
}
async function main() {
  if (MODE === 'cues') { fs.writeFileSync(ARGS[0], JSON.stringify({ dur: DUR, shots: shots.filter(s => !s.off).map(s => ({ t: +s.t.toFixed(3), scene: s.scene })), cuts: shots.map(s => +s.t.toFixed(3)) })); return; }
  await K.preload(Object.fromEntries(Object.entries(ep.assets).map(([k, f]) => [k, path.resolve(EP, f)])));
  const cv = K.createCanvas(K.W, K.H), ctx = cv.getContext('2d');
  if (MODE === 'stills') { for (const ts of ARGS[0].split(',')) { await frame(ctx, +ts); fs.writeFileSync(`${ARGS[1]}_${(+ts).toFixed(1)}.png`, cv.toBuffer('image/png')); } return; }
  if (MODE === 'sheet') { const step = +ARGS[0], out = ARGS[1], cols = 6, tw = 320, th = 180; const n = Math.floor(DUR / step); const sh = K.createCanvas(cols * tw, Math.ceil(n / cols) * (th + 22)); const sc = sh.getContext('2d');
    sc.fillStyle = '#000'; sc.fillRect(0, 0, sh.width, sh.height);
    for (let i = 0; i < n; i++) { const ts = i * step + 0.01; await frame(ctx, ts); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * (th + 22), tw, th);
      sc.fillStyle = '#fff'; sc.font = '16px JBMono'; sc.fillText(`${Math.floor(ts / 60)}:${String(Math.floor(ts % 60)).padStart(2, '0')}`, (i % cols) * tw + 4, Math.floor(i / cols) * (th + 22) + th + 17); }
    fs.writeFileSync(out, sh.toBuffer('image/jpeg', 82)); return; }
  if (MODE === 'chunk') { const [f0, f1, out] = [+ARGS[0], +ARGS[1], ARGS[2]];
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${K.W}x${K.H}`, '-r', String(K.FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    process.on('unhandledRejection', e => { console.error(e); process.exit(2); });
    for (let f = f0; f < f1; f++) { await frame(ctx, f / K.FPS); const buf = Buffer.from(ctx.getImageData(0, 0, K.W, K.H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); return; }
  if (MODE === 'video') { const out = ARGS[0], jobs = +(ARGS[1] || 4); const from = ARGS[2] ? Math.floor(+ARGS[2] * K.FPS) : 0, to = ARGS[3] ? Math.ceil(+ARGS[3] * K.FPS) : NF;
    const tmp = out + '_parts'; fs.mkdirSync(tmp, { recursive: true }); const per = Math.ceil((to - from) / jobs); const parts = [];
    await Promise.all(Array.from({ length: jobs }, (_, j) => { const a = from + j * per, b = Math.min(to, a + per); const o = path.join(tmp, `p${j}.mp4`); parts.push(o);
      return new Promise((r, j) => spawn('node', [__filename, EPD, 'chunk', a, b, o], { stdio: 'inherit' }).on('close', c => c ? j(new Error('chunk ' + j + ' failed')) : r())); }));
    fs.writeFileSync(path.join(tmp, 'list.txt'), parts.map(p => `file '${path.resolve(p)}'`).join('\n'));
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c', 'copy', out]); fs.rmSync(tmp, { recursive: true });
    console.log('video', out, (to - from) / K.FPS, 's'); return; }
}
main().then(() => { V.release([]); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
module.exports = { T };
