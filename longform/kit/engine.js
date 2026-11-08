// How It's Run LONG-FORM engine (1920x1080, 30 fps): voice timeline -> scenes with parallax layers + camera -> transitions -> overlays -> finish.
// One chapter folder = one `episode.js` that calls run({...}). CLI (from the chapter folder):
//   node episode.js T | cues | srt out.srt | still t1,t2,... out.png | frame t out.png | video out.mp4 | shots
// No burned-in subtitle band in the long-form: key words / dates / sums appear as on-screen plates; full subtitles go to the SRT.
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const L = require('./look');
const { makeEdit } = require('../../hirkit/edit');
const { W, H, FPS, clamp, lerp, seg, E } = L;

// ---------- voice ----------
function voice(dir, starts) {
  const AL = {}; for (const id in starts) AL[id] = JSON.parse(fs.readFileSync(`${dir}/${id}.align.json`));
  const words = id => { const a = AL[id], s = a.characters.join(''), out = [], re = /\S+/g; let m;
    while ((m = re.exec(s))) out.push({ w: m[0], t0: starts[id] + a.character_start_times_seconds[m.index], t1: starts[id] + a.character_end_times_seconds[m.index + m[0].length - 1] }); return out; };
  const norm = w => w.toLowerCase().replace(/[^a-z0-9'$-]/g, '');
  const at = (id, w, n = 0) => { const ws = words(id).filter(x => norm(x.w).startsWith(norm(w))); if (!ws.length) { if (!at.warned) at.warned = {}; const k = id + ':' + w; if (!at.warned[k]) { at.warned[k] = 1; process.stderr.write(`WARN word not found: ${k}\n`); } }
    return (ws[n] || ws[ws.length - 1] || { t0: starts[id] }).t0; };
  return { words, at };
}
// timeline: chapter card (cardDur s, no voice) then lines with gaps; T = last voice end + tail
function timeline(dir, o = {}) {
  const LINES = JSON.parse(fs.readFileSync(`${dir}/script.json`)), SP = JSON.parse(fs.readFileSync(`${dir}/vo/speech.json`));
  const Z = {}; let t = o.start ?? 3.0;
  LINES.forEach((Ln, i) => { Z[Ln.id] = +(t - SP[Ln.id][0]).toFixed(3); t += SP[Ln.id][1] - SP[Ln.id][0]; if (i < LINES.length - 1) t += (o.gaps || {})[LINES[i + 1].id] ?? (o.gap ?? 0.55); });
  const V = voice(`${dir}/vo`, Z), begin = id => Z[id] + SP[id][0], end = id => Z[id] + SP[id][1];
  const tEnd = end(LINES[LINES.length - 1].id), T = +(tEnd + (o.tail ?? 0.8)).toFixed(2);
  return { LINES, SP, Z, V, at: (id, w, n = 0) => V.at(id, w, n), begin, end, tEnd, T, ids: LINES.map(x => x.id) };
}

// ---------- camera & parallax ----------
// cam(keys, lt): keys [[t, x, y, z, r?], ...] in scene-local time; eased; slow breathing drift so nothing is ever frozen
function cam(keys, lt, o = {}) {
  let c; if (lt <= keys[0][0]) c = keys[0]; else if (lt >= keys[keys.length - 1][0]) c = keys[keys.length - 1];
  else for (let i = 1; i < keys.length; i++) if (lt < keys[i][0]) { const a = keys[i - 1], b = keys[i], u = (E[b[5] || 'inOut'] || E.inOut)(seg(lt, a[0], b[0]));
    c = [lt, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), lerp(a[4] || 0, b[4] || 0, u)]; break; }
  const br = o.breath ?? 1;
  return { x: c[1] + Math.sin(lt * 0.7) * 6 * br / c[3], y: c[2] + Math.cos(lt * 0.53) * 4 * br / c[3], z: c[3] * (1 + Math.sin(lt * 0.45) * 0.006 * br), r: (c[4] || 0) + Math.sin(lt * 0.4) * 0.002 * br };
}
// world coordinates: (0,0) = screen centre at z=1; a layer with depth d moves d times as much as the camera (d<1 far, d>1 foreground)
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(c.r * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
function layers(ctx, c, list) { for (const [d, fn] of list) layer(ctx, c, d, fn); }
// impact shake helper: returns {x,y} offset for hits at times [t0...]
function shake(t, hits, amp = 14) { let x = 0, y = 0; for (const h of hits) { const d = t - h; if (d > 0 && d < 0.45) { const k = Math.exp(-d * 10) * amp; x += Math.sin(d * 83) * k; y += Math.cos(d * 71) * k; } } return { x, y }; }

// ---------- subtitles -> SRT only ----------
function subs(TL, o = {}) {
  const maxC = o.maxC || 64, REPL = o.repl || [], G = [];
  for (const id of TL.ids) {
    const ws = TL.V.words(id); let cur = [];
    const len = a => a.map(x => x.w).join(' ').length, flush = () => { if (cur.length) G.push({ id, words: cur }); cur = []; };
    ws.forEach((w, i) => { if (cur.length && len([...cur, w]) > maxC) flush(); cur.push(w); if (/[.?!]$/.test(w.w) && len(cur) > 18) flush(); });
    flush();
  }
  G.forEach((g, i) => { const nx = G[i + 1]; g.t0 = g.words[0].t0 - 0.05; g.t1 = nx && nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(g.words[g.words.length - 1].t1 + 0.5, nx ? nx.words[0].t0 - 0.05 : TL.T);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const srtTime = x => { x = Math.max(0, x); const h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), s = x % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(Math.floor(s)).padStart(2, '0')},${String(Math.round((s % 1) * 1000) % 1000).padStart(3, '0')}`; };
const wrap2 = (s, n = 42) => { if (s.length <= n) return s; const ws = s.split(' '); let a = ''; while (ws.length && (a + ' ' + ws[0]).trim().length <= Math.ceil(s.length / 2) + 4) a = (a + ' ' + ws.shift()).trim(); return a + '\n' + ws.join(' '); };

// ---------- run ----------
// ep: { module, dir, TL, scenes:[{t0,t1,era,draw(ctx,t,lt), out:{type:'cut'|'whip'|'tear', dur, dir}}], overlay(ctx,t), card:{n,title,sub,era} | null,
//       cues() -> [[sfx, t, gain], ...], music: [[t, mood], ...], repl: [[from,to]] }
function run(ep) {
  const { TL } = ep; const T = TL.T; const SC = ep.scenes.slice().sort((a, b) => a.t0 - b.t0);
  SC.forEach((s, i) => { if (i < SC.length - 1) s.t1 = s.t1 ?? SC[i + 1].t0; else s.t1 = s.t1 ?? T + 1; });
  const shots = SC.map(s => ({ ...s, draw: (ctx, t, lt) => { ctx.fillStyle = (L.ERA[s.era || 'sepia'] || L.ERA.sepia).sky[1]; ctx.fillRect(0, 0, W, H); s.draw(ctx, t, lt); L.finish(ctx, s.era || 'sepia', s.finish || {}); } }));
  const ED = makeEdit(shots, W, H);
  function frame(ctx, t) {
    ED.frame(ctx, t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    if (ep.overlay) ep.overlay(ctx, t);
    if (ep.card) { const u = clamp(t / 0.45), v = clamp((t - (ep.card.dur || 2.6)) / 0.35); if (v < 1) { ctx.save(); ctx.globalAlpha = 1 - v; L.chapterCard(ctx, ep.card.n, ep.card.title, ep.card.sub, u, ep.card.era); ctx.restore(); } }
    ctx.restore();
  }
  if (require.main !== ep.module) return { frame, T };
  const [mode, a1, a2] = process.argv.slice(2);
  if (mode === 'T') { console.log(T); return; }
  if (mode === 'cues') { fs.writeFileSync(`${ep.dir}/cues.json`, JSON.stringify({ T, vo: TL.ids.map(id => [id, TL.Z[id]]), sfx: ep.cues ? ep.cues() : [], music: { sections: ep.music || [[0, 'calm']] } })); console.log('cues ok', T); return; }
  if (mode === 'srt') { const G = subs(TL, { repl: ep.repl }); fs.writeFileSync(a1, G.map((g, i) => `${i + 1}\n${srtTime(g.t0)} --> ${srtTime(g.t1)}\n${wrap2(g.text)}\n`).join('\n')); console.log('srt', G.length); return; }
  if (mode === 'shots') { SC.forEach(s => console.log(s.t0.toFixed(2), (s.t1 - s.t0).toFixed(2), s.name || '')); console.log('scenes', SC.length, 'avg', (T / SC.length).toFixed(2), 's'); return; }
  if (mode === 'still') { const ts = a1.split(',').map(Number), tw = 480, th = 270, cols = Math.min(ts.length, 4), rows = Math.ceil(ts.length / cols);
    const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
    ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E8322E'; sc.font = '22px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 24); });
    fs.writeFileSync(a2, sheet.toBuffer('image/png')); return; }
  if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); return; }
  if (mode === 'video') (async () => {
    const cv = createCanvas(W, H), ctx = cv.getContext('2d');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-tune', 'animation', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(T * FPS), T0 = Date.now();
    for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 300 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  })();
  return { frame, T };
}
module.exports = { voice, timeline, cam, layer, layers, shake, subs, run, srtTime };
