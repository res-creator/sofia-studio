// Collage-documentary engine (reusable for future episodes). Built from tests/mcd_collage + mcd_final:
// camera keys, plane compositing, foreground parallax, motion blur on fast moves, background (world) blur,
// subtitles from ElevenLabs word timings, render CLI (video | still | cues).
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const { C, F, clamp, lerp, seg, E, applyCam, sprite, LIGHT, fries, receipt, cloud, coin, bill } = K;

const W = 1080, H = 1920, FPS = 30, A = [510, 820]; // anchor: action sits above the subtitle band and left of TikTok's right rail

// ---------- voice-over timing ----------
function voice(dir, starts) { // starts: {id: seconds}
  const AL = {}; for (const id in starts) AL[id] = JSON.parse(fs.readFileSync(`${dir}/${id}.align.json`));
  const words = id => { const a = AL[id], s = a.characters.join(''), out = []; const re = /\S+/g; let m;
    while ((m = re.exec(s))) out.push({ w: m[0], t0: starts[id] + a.character_start_times_seconds[m.index], t1: starts[id] + a.character_end_times_seconds[m.index + m[0].length - 1] });
    return out; };
  const at = (id, w, n = 0) => { const ws = words(id).filter(x => x.w.toLowerCase().replace(/[^a-z0-9'-]/g, '').startsWith(w)); return (ws[n] || ws[0] || { t0: starts[id] }).t0; };
  const end = id => starts[id] + AL[id].character_end_times_seconds.slice(-1)[0];
  return { words, at, end, starts };
}

// ---------- camera: keyframes {t, x, y, z, r, e} + slow breath + impact shakes ----------
function camera(keys, o = {}) {
  return t => {
    let c;
    if (t <= keys[0].t) c = { ...keys[0] };
    else if (t >= keys[keys.length - 1].t) c = { ...keys[keys.length - 1] };
    else for (let i = 1; i < keys.length; i++) if (t < keys[i].t) {
      const a = keys[i - 1], b = keys[i], u = (E[b.e || 'inOut'] || E.inOut)(seg(t, a.t, b.t));
      c = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)), r: lerp(a.r || 0, b.r || 0, u) }; break;
    }
    const env = o.breath ? o.breath(t) : 1;
    c.x += Math.sin(t * 0.9) * 9 * env / c.z; c.y += Math.cos(t * 0.7 + 0.5) * 6 * env / c.z; c.r = (c.r || 0) + Math.sin(t * 0.55 + 1) * 0.005 * env; c.z *= 1 + Math.sin(t * 0.8) * 0.01 * env;
    let sh = 0; for (const [t0, a] of o.shakes || []) if (t > t0 && t < t0 + 0.5) sh += a * Math.exp(-(t - t0) * 9) * Math.sin((t - t0) * 70);
    c.shx = sh * 0.4; c.shy = sh; return c;
  };
}

// ---------- foreground plane (out of focus, closer to the lens) ----------
// pos = anchor + (p - anchor) * zoomRatio^par + par * (hero-plane pan since tr) + own drift
const FGDRAW = { fries: x => fries(x, 1), coin: x => coin(x, 0, 0, 60, 0.15, { markCol: C.yellowD }), bill: x => bill(x, 0, 0, 1.6, 0), receipt: x => receipt(x, 1), cloud: x => cloud(x, 1) };
const FGSIZE = { fries: [190, 300], coin: [140, 140], bill: [180, 100], receipt: [170, 350], cloud: [320, 180] };
function foreground(ctx, t, cam, items, camAt) {
  for (const f of items) {
    if (t < f.t0 || t > f.t1) continue;
    const fade = seg(t, f.t0, f.t0 + 0.4) * (1 - seg(t, f.t1 - 0.4, f.t1)); if (fade <= 0) continue;
    const ref = camAt(f.tr), zr = Math.pow(cam.z / ref.z, f.par), panX = (ref.x - cam.x) * cam.z * f.par, panY = (ref.y - cam.y) * cam.z * f.par;
    const ent = f.in ? (1 - E.out(seg(t, f.t0, f.t0 + 0.6))) : 0;
    const x = A[0] + (f.x - A[0]) * zr + panX + Math.sin(t * 0.6 + f.x) * 14 + (f.in ? f.in[0] * ent * 420 : 0), y = A[1] + (f.y - A[1]) * zr + panY + Math.cos(t * 0.5 + f.y) * 12 + (f.in ? f.in[1] * ent * 300 : 0);
    const sz = FGSIZE[f.k], spr = sprite(f.k + f.blur, sz[0] * 2, sz[1] * 2, x2 => { x2.scale(2, 2); FGDRAW[f.k](x2); }, f.blur * 2, f.k === 'cloud' ? 2 : 3.2);
    const sc = f.s * zr * 0.5;
    if (x < -spr.width * sc || x > W + spr.width * sc || y < -spr.height * sc || y > H + spr.height * sc) continue;
    ctx.save(); ctx.globalAlpha = fade * (f.a ?? 1); ctx.translate(x, y); ctx.rotate(f.rot + Math.sin(t * 0.7 + f.y) * 0.06 + (cam.r || 0) * (f.par - 1)); ctx.scale(sc, sc);
    ctx.drawImage(spr, -spr.width / 2, -spr.height / 2); ctx.restore();
  }
}

// ---------- subtitles ----------
// groups of 3-5 words, break on punctuation; display overrides (numbers), a few highlighted words in yellow
function subtitleGroups(V, ids, o = {}) {
  const G = [];
  for (const id of ids) {
    let cur = [];
    const ws = V.words(id);
    const P = x => /[,.?!:]$/.test(x.w);
    ws.forEach((w, i) => { cur.push(w); const last = i === ws.length - 1, rest = ws.length - 1 - i;
      let toP = 0; for (let j = i + 1; j < ws.length; j++) { toP++; if (P(ws[j])) break; }
      const brk = last || (P(w) && cur.length >= 2 && rest > 2) || (cur.length >= (o.max || 5) && toP > 2) || cur.length >= 7;
      if (brk) { G.push({ id, words: cur }); cur = []; } });
    if (cur.length) G.push({ id, words: cur });
  }
  G.forEach((g, i) => { g.t0 = g.words[0].t0 - 0.05; const nx = G[i + 1]; const end = g.words[g.words.length - 1].t1 + 0.35; g.t1 = nx && nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(end + 0.3, nx ? nx.words[0].t0 - 0.05 : end + 0.3);
    let txt = g.words.map(w => w.w).join(' '); for (const [a, b] of o.replace || []) txt = txt.replace(a, b); g.text = txt; });
  return G;
}
function drawSubtitles(ctx, t, G, o = {}) {
  const g = G.find(x => t >= x.t0 && t < x.t1); if (!g) return;
  const size = o.size || 64, cx = o.x || A[0], base = o.y || 1360, maxW = o.maxW || 800, HL = o.highlight || [];
  ctx.save(); ctx.font = `${size}px ${F.black}`; ctx.textBaseline = 'alphabetic';
  // wrap to max two lines
  const tokens = g.text.split(' '), lines = [[]]; for (const tk of tokens) { const L = lines[lines.length - 1]; const test = [...L, tk].join(' ');
    if (ctx.measureText(test).width > maxW && L.length) lines.push([tk]); else L.push(tk); }
  const u = E.out(seg(t, g.t0, g.t0 + 0.14)), lh = size * 1.12, y0 = base - (lines.length - 1) * lh + (1 - u) * 14;
  ctx.globalAlpha = u * (1 - seg(t, g.t1 - 0.08, g.t1));
  lines.forEach((L, li) => {
    const parts = L.map(tk => ({ tk, w: ctx.measureText(tk).width })), sp = size * 0.27, tw = parts.reduce((a, p) => a + p.w, 0) + sp * (parts.length - 1);
    let x = cx - tw / 2; const y = y0 + li * lh;
    for (const p of parts) {
      const key = p.tk.toLowerCase().replace(/[^a-z0-9$%]/g, ''), hl = HL.some(h => key === h || key.startsWith(h));
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
      ctx.lineJoin = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = '#171717'; ctx.strokeText(p.tk, x, y); ctx.restore();
      ctx.fillStyle = hl ? C.yellow : '#FFFFFF'; ctx.fillText(p.tk, x, y); x += p.w + sp;
    }
  });
  ctx.restore();
}

// ---------- frame compositing ----------
function makeRenderer(ep) {
  const TEX = K.paperTexture(W, H);
  const sub = createCanvas(W, H), sx = sub.getContext('2d');
  const wC = createCanvas(W / 2, H / 2), wX = wC.getContext('2d');
  function drawFrame(ctx, t) {
    const cam = ep.cam(t);
    LIGHT.elev = 1; ep.background(ctx, t, cam); LIGHT.elev = 1;
    const wb = ep.worldBlur ? ep.worldBlur(t) : 0;
    if (wb > 0.05) { // background blur: the whole story world goes soft behind a hero layer
      wX.setTransform(1, 0, 0, 1, 0, 0); wX.clearRect(0, 0, W / 2, H / 2); wX.scale(0.5, 0.5);
      wX.save(); applyCam(wX, cam, A); ep.world(wX, t, cam); wX.restore();
      ctx.save(); ctx.filter = `blur(${wb.toFixed(2)}px)`; ctx.drawImage(wC, 0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.5 * clamp(wb / 8); ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); ctx.restore(); // paper wash pushes the world back
    } else { ctx.save(); applyCam(ctx, cam, A); ep.world(ctx, t, cam); ctx.restore(); }
    LIGHT.elev = 3; foreground(ctx, t, cam, ep.fg || [], ep.cam); LIGHT.elev = 1;
    if (ep.overlay) ep.overlay(ctx, t, cam);
    if (ep.subs) drawSubtitles(ctx, t, ep.subs, ep.subStyle);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.6; ctx.drawImage(TEX, 0, 0); ctx.restore();
  }
  const edgeSpeed = t => { const a = ep.cam(t), b = ep.cam(t - 1 / FPS); return Math.abs(Math.log(a.z / b.z)) * 1100 + Math.hypot(a.x - b.x, a.y - b.y) * a.z; };
  function frame(ctx, t) { // camera motion blur only on fast camera moves
    const v = edgeSpeed(t), n = v > 70 ? Math.min(6, Math.ceil(v / 45)) : 1;
    if (n === 1) return drawFrame(ctx, t);
    for (let j = 0; j < n; j++) { drawFrame(sx, t - (j / n) * (0.6 / FPS)); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(sub, 0, 0); }
    ctx.globalAlpha = 1;
  }
  return { frame, edgeSpeed };
}

function cli(ep, dir) {
  const R = makeRenderer(ep);
  const [mode, a1, a2] = process.argv.slice(2);
  if (mode === 'cues') { fs.writeFileSync(`${dir}/cues.json`, JSON.stringify({ T: ep.T, vo: ep.vo, sfx: ep.cues(), music: ep.music || {} })); console.log('cues ok'); return; }
  if (mode === 'still') {
    const ts = a1.split(',').map(Number), tw = 270, th = 480, cols = Math.min(ts.length, 8), rows = Math.ceil(ts.length / cols);
    const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
    ts.forEach((t, i) => { ctx.globalAlpha = 1; R.frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
    fs.writeFileSync(a2, sheet.toBuffer('image/png')); return;
  }
  if (mode === 'video') (async () => {
    const cv = createCanvas(W, H), ctx = cv.getContext('2d');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(ep.T * FPS), T0 = Date.now();
    for (let f = 0; f < N; f++) {
      ctx.globalAlpha = 1; R.frame(ctx, f / FPS);
      const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  })();
}

module.exports = { W, H, FPS, A, voice, camera, foreground, subtitleGroups, drawSubtitles, makeRenderer, cli };
