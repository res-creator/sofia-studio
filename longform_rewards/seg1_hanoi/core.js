// Long-form segment core (16:9): voice timeline from script.json + vo/speech.json, automatic subtitle chunks (≤ 2 lines on the wide band),
// the frame compositor (edit + overlays + paper + subtitles) and the CLI shared by seg0_intro and seg1_hanoi.
// Requires HIR_WIDE=1 to be set by the caller BEFORE this file is required.
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const EN = require('../../mcd_ep1/engine');         // voice timings + subtitle drawing only (read-only use)
const { makeEdit } = require('../../hirkit/edit');
const ST = require('../../howitsrun_style/style');
const { W, H, FPS } = ST;

// voice timeline: first line starts at `start`, gaps between lines (default 0.7 s); T = last voice end + 0.6 s
function timeline(dir, start, gaps = {}) {
  const LINES = JSON.parse(fs.readFileSync(`${dir}/script.json`)), SP = JSON.parse(fs.readFileSync(`${dir}/vo/speech.json`));
  const Z = {}; let t = start;
  LINES.forEach((L, i) => { Z[L.id] = +(t - SP[L.id][0]).toFixed(3); t += SP[L.id][1] - SP[L.id][0]; if (i < LINES.length - 1) t += gaps[LINES[i + 1].id] ?? 0.7; });
  const V = EN.voice(`${dir}/vo`, Z);
  const end = id => Z[id] + SP[id][1];
  const last = LINES[LINES.length - 1].id, tEnd = end(last), T = +(tEnd + 0.6).toFixed(2);
  return { LINES, SP, Z, V, at: (id, w, n = 0) => V.at(id, w, n), end, tEnd, T };
}

// subtitle chunks: break after punctuation once a chunk has >= 16 chars, or before a word that would push it over maxC chars
function subs(TL, o = {}) {
  const maxC = o.maxC || 42, REPL = o.repl || [], G = [];
  for (const id of Object.keys(TL.Z)) {
    const ws = TL.V.words(id), len = a => a.map(x => x.w).join(' ').length;
    const units = []; let u = [];
    ws.forEach((w, i) => { u.push(w); const nx = ws[i + 1]; if (!nx || (nx.w !== '—' && /[,.?!:;"—]$/.test(w.w))) { units.push(u); u = []; } });
    let cur = [];
    const flush = () => { if (cur.length) G.push({ id, words: cur }); cur = []; };
    for (const un of units) {
      if (len(un) > maxC) { flush(); const n = Math.ceil(len(un) / maxC), tot = len(un); let part = [];
        un.forEach(w => { part.push(w); if (len(part) >= tot / n - 3 && G.length >= 0 && part.length > 1 && un.indexOf(w) < un.length - 2) { G.push({ id, words: part }); part = []; } });
        if (part.length) { if (len(part) < 12 && G.length && G[G.length - 1].id === id) G[G.length - 1].words.push(...part); else G.push({ id, words: part }); } continue; }
      if (cur.length && len([...cur, ...un]) > maxC) flush();
      cur.push(...un);
    }
    flush();
  }
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, TL.end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, TL.T);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}

// ep: { dir, TL, SH (shots), overlays(ctx, t), cues() -> sfx list, music [[t, mood]...], highlight [...], repl [...] }
function run(ep) {
  const { TL, SH } = ep; SH.sort((a, b) => a.t0 - b.t0);
  const ED = makeEdit(SH, W, H), SUBS = subs(TL, { repl: ep.repl });
  function frame(ctx, t, o = {}) {
    ED.frame(ctx, t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (ep.overlays) ep.overlays(ctx, t); ST.stampLabel(ctx); ctx.restore();
    ST.paper(ctx);
    if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ep.highlight || [] });
  }
  const [mode, a1, a2, a3] = process.argv.slice(2);
  if (require.main !== ep.module) return { frame, SUBS };
  const T = TL.T;
  if (mode === 'cues') {
    fs.writeFileSync(`${ep.dir}/cues.json`, JSON.stringify({ T, vo: Object.entries(TL.Z), sfx: ep.cues().filter(c => c[1] >= 0 && c[1] < T).map(c => [c[0], +c[1].toFixed(3), c[2] ?? 1]), music: { sections: ep.music.map(([t, m]) => [+t.toFixed(2), m]) } }));
    console.log('cues ok, T =', T);
  } else if (mode === 'srt') {
    const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
    fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
  } else if (mode === 'still') {
    const ts = a1.split(',').map(Number), tw = 480, th = 270, cols = Math.min(ts.length, 4), rows = Math.ceil(ts.length / cols);
    const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
    ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
    fs.writeFileSync(a2, sheet.toBuffer('image/png'));
  } else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1, { nosubs: a3 === 'nosubs' }); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n') + `\nT = ${T}`);
  else if (mode === 'video') (async () => {
    const cv = createCanvas(W, H), ctx = cv.getContext('2d');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(T * FPS), T0 = Date.now();
    for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 300 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  })();
  return { frame, SUBS };
}

module.exports = { timeline, subs, run };
