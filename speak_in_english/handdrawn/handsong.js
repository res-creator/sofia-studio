// Song clip in the hand-drawn style: node ourcast/handsong.js <timeline.json> start end out.mp4 | --png=t1,t2 outdir
const fs = require('fs'), { spawn } = require('child_process');
const K = require('./hand_kit'); const { heroine, tom, ease } = require('./cast');
const W = 1080, H = 1920, FPS = 30;
const [TLF, a0, a1, OUT, PNGDIR] = process.argv.slice(2);
const TL = JSON.parse(fs.readFileSync(TLF, 'utf8')), SG = TL.song, NF = Math.ceil(TL.dur * FPS);
const cv = K.createCanvas(W, H), g = cv.getContext('2d'); K.setG(g);
const YEL = '#ffd23f', INK = '#251c1a', FONT = K.FONT, TX = 330, AX = 750;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), P = (t, a, b) => clamp((t - a) / (b - a));
// ---- song helpers
const allPairs = SG.pairs.flatMap((r, ri) => r.map((p, k) => ({ ...p, ri, k })));
const pairAt = t => { let c = null; for (const p of allPairs) if (t >= p.tr - 0.08) c = p; return c; };
const lineAt = t => SG.lines.find(l => t >= l.t - 0.15 && t < l.e + 0.35);
const roundEnd = ri => (SG.lines.find(l => l.r === ri) || { t: 1e9 }).t;
const talkSp = t => (t < 0.3 ? TL.speech[0] : TL.speech.find(x => x.kind === 'talk' && t >= x.t - 0.05 && t < x.t + x.d + 0.45));
const env = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) a = Math.max(a, s.env[Math.min(s.env.length - 1, Math.floor((t - s.t) * FPS))] || 0); return a; };
const music = t => t >= SG.off && t < SG.last_word + 0.3;
const beatPulse = t => { if (!music(t)) return 0; const ph = (((t - SG.beat0) / SG.beat) % 1 + 1) % 1; return Math.pow(Math.max(0, 1 - ph * 2.5), 1.5); };
// ---- direction: pose + mood per character over time
function direction(t) {
  const sp = talkSp(t), id = sp && sp.id, l = lineAt(t), p = pairAt(t);
  let A = { pose: 'down', mood: 'neutral' }, T = { pose: 'down', mood: 'neutral' };
  if (t < SG.off) { T = { pose: 'shrug', mood: 'angry' }; A = { pose: 'down', mood: 'neutral' };
    if (t >= (TL.speech.find(x => x.id === 'i2') || {}).t - 0.1) { A = { pose: 'cross', mood: 'smug' }; T = { pose: 'down', mood: 'neutral' }; }
    if (id === 'i3') { T = { pose: 'down', mood: 'surprised' }; }
    if (t >= (TL.speech.find(x => x.id === 'i4') || {}).t - 0.1) { A = { pose: 'presentL', mood: 'neutral' }; T = { pose: 'down', mood: 'surprised' }; } }
  else if (t > SG.last_word + 0.3) { A = { pose: 'presentL', mood: 'smug' }; T = { pose: 'down', mood: 'neutral' };
    const o2 = TL.speech.find(x => x.id === 'o2'), o3 = TL.speech.find(x => x.id === 'o3');
    if (o2 && t >= o2.t - 0.1) T = { pose: 'shrug', mood: 'smug' }; if (o3 && t >= o3.t - 0.1) A = { pose: 'cross', mood: 'happy' }; }
  else if (l) { A = { pose: 'cheer', mood: 'neutral' }; T = { pose: l.tag === 'echo' ? 'cheer' : 'hips', mood: 'neutral' }; }
  else if (p) { const ans = t >= p.te - 0.06; T = { pose: 'presentR', mood: ans ? 'surprised' : 'neutral' }; A = { pose: ans ? (p.k % 2 ? 'pointL' : 'presentL') : 'down', mood: 'neutral' };
    if (p.k === 5 && t > p.te + 0.75 && t < roundEnd(p.ri) - 0.15) { T = { pose: 'shrug', mood: 'neutral' }; A = { pose: 'cross', mood: 'smug' }; } }
  else { A = { pose: 'down', mood: 'neutral' }; T = { pose: 'down', mood: 'neutral' }; }
  return { A, T };
}
// pose blending: find when the current pose started (scan back in 1/30 s steps, cached per frame)
const poseHist = { A: [], T: [] };
function poseState(who, t) { const f = Math.round(t * FPS); const cur = direction(t)[who].pose; let k = f, prev = cur;
  while (k > 0 && f - k < 30) { const q = direction((k - 1) / FPS)[who].pose; if (q !== cur) { prev = q; break; } k--; }
  return { pose: cur, prevPose: prev, poseK: prev === cur ? 1 : ease((f - k) / (0.32 * FPS)) }; }
// ---- shots (hard cuts)
const S = { WIDE: { z: 1, cx: 540, cy: 960 }, TWO: { z: 1.28, cx: 540, cy: 1060 }, HER: { z: 1.6, cx: AX, cy: 1060 }, TOM: { z: 1.6, cx: TX, cy: 1040 }, HER_CU: { z: 2.05, cx: AX, cy: 990 }, TOM_CU: { z: 2.05, cx: TX, cy: 965 } };
function shot(t) {
  if (t < SG.off) { const s = talkSp(t); if (t < 0.25 || !s) return S.TWO; return { i1: S.TOM, i2: S.HER, i3: S.TOM_CU, i4: S.HER_CU }[s.id] || S.TWO; }
  const l = lineAt(t);
  if (l) { if (l.tag === 'echo') return S.TOM_CU; const half = t > (l.t + l.e) / 2; return l.tag === 'p1' ? (half ? S.HER : S.WIDE) : (half ? S.HER_CU : S.TWO); }
  if (t > SG.last_word + 0.3) { const s = talkSp(t); if (t >= SG.card - 0.1 || !s) return S.WIDE; return { o1: S.HER, o2: S.TOM_CU, o3: S.HER_CU }[s.id] || S.TWO; }
  const p = pairAt(t); if (!p) return S.WIDE;
  if (p.k === 5 && t > p.te + 0.75 && t < roundEnd(p.ri) - 0.15) return S.TOM;
  const n = (p.ri * 6 + p.k) % 3, ans = t >= p.te - 0.05;
  if (n === 0) return S.TWO; if (n === 1) return ans ? S.HER_CU : S.TOM_CU; return ans ? S.HER : S.TOM;
}
// ---- text (hand-written font, dark outline, family letters yellow)
const RU_TR = { i2: 'Да ладно. Это легко.', i4: 'Спроси что угодно.', o1: 'Видишь? Легко.', o3: 'Чуть-чуть.' };
const SPLIT = [5, 6], TRH = [['э брайт лайт ин флайт', 'гэйв э найт э фрайт ласт найт'], ['э снэйк кэн бэйк э кэйк,', 'мэйк ит, тэйк ит ту зэ лэйк']];
function sf(s, x, y, col, sw) { g.lineJoin = 'round'; g.lineWidth = sw; g.strokeStyle = 'rgba(30,20,15,0.92)'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); }
function shade() { const gr = g.createLinearGradient(0, 0, 0, 720); gr.addColorStop(0, 'rgba(30,20,15,.45)'); gr.addColorStop(1, 'rgba(30,20,15,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 720); }
function layout(words, size, maxW) { g.font = `${size}px ${FONT}`; const sp = g.measureText(' ').width, rows = [[]]; let w = 0;
  words.forEach(o => { const ww = g.measureText(o.w).width; if (w && w + sp + ww > maxW) { rows.push([]); w = 0; } rows[rows.length - 1].push({ ...o, ww }); w += (w ? sp : 0) + ww; });
  return rows.map(r => { const tot = r.reduce((a, o) => a + o.ww, 0) + sp * (r.length - 1); let x = 540 - tot / 2; return r.map(o => { const q = { ...o, x }; x += o.ww + sp; return q; }); }); }
function words(rows, size, y, lh, n, alpha = 1) { let k = 0; g.save(); g.globalAlpha = alpha; g.font = `${size}px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle';
  rows.forEach((r, ri) => r.forEach(o => { if (k++ >= n) return; const yy = y + ri * lh; sf(o.w, o.x, yy, o.col || '#fffaf0', size * 0.16);
    if (o.fam) { const i = o.w.toLowerCase().indexOf(o.fam.toLowerCase()); if (i >= 0) { g.fillStyle = YEL; g.fillText(o.w.slice(i, i + o.fam.length), o.x + g.measureText(o.w.slice(0, i)).width, yy); } } })); g.restore(); return y + rows.length * lh; }
function reveal(ws, t0, d, t) { if (t < t0) return 0; const tot = ws.reduce((a, w) => a + w.w.length + 1, 0); let acc = 0, n = 0; for (const w of ws) { if (t >= t0 + d * acc / tot - 0.04) n++; acc += w.w.length + 1; } return n; }
function bigWord(word, fam, k) { g.save(); g.translate(540, 1500); g.scale(k, k); g.font = `230px ${FONT}`; let w = g.measureText(word).width; if (w > 980) { g.font = `${Math.floor(230 * 980 / w)}px ${FONT}`; w = g.measureText(word).width; }
  g.textAlign = 'left'; g.textBaseline = 'middle'; const i = word.indexOf(fam), x0 = -w / 2; sf(word, x0, 0, '#fffaf0', 26); if (i >= 0) { g.fillStyle = YEL; g.fillText(fam, x0 + g.measureText(word.slice(0, i)).width, 0); } g.restore(); }
function overlays(t) {
  const s = talkSp(t);
  if (s && t < SG.card - 0.05) { shade(); const ws = s.text.split(' ').map(w => ({ w })); const rows = layout(ws, 84, 920); const n = t < 0.3 ? ws.length : reveal(ws, s.t, s.d * 0.85, t);
    const y2 = words(rows, 84, 290, 92, n); if (RU_TR[s.id] && n >= ws.length) { g.font = `56px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; sf(RU_TR[s.id], 540, y2 + 8, '#cdeffa', 9); } }
  if (t >= SG.off && t < SG.last_word + 0.4) {
    const l = lineAt(t);
    if (l) { shade(); const fam = SG.fam[l.r], ws = l.words.map(w => ({ w: w[0], fam })), n = l.words.filter(w => t >= w[1] - 0.06).length;
      if (l.tag === 'echo') { words(layout(ws, 110, 940), 110, 320, 110, n); return; }
      const sp = SPLIT[l.r], fit = part => { g.font = `100px ${FONT}`; return Math.min(100, Math.floor(100 * 990 / g.measureText(part.map(o => o.w).join(' ')).width)); };
      const z1 = fit(ws.slice(0, sp)), z2 = fit(ws.slice(sp));
      words(layout(ws.slice(0, sp), z1, 5000), z1, 270, 100, n); g.font = `50px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; if (n > 0) sf(TRH[l.r][0], 540, 345, '#cdeffa', 8);
      words(layout(ws.slice(sp), z2, 5000), z2, 440, 100, Math.max(0, n - sp)); g.font = `50px ${FONT}`; g.textAlign = 'center'; if (n > sp) sf(TRH[l.r][1], 540, 515, '#cdeffa', 8); return; }
    const p = pairAt(t);
    if (p) { const fam = SG.fam[p.ri];
      if (p.k === 5 && t > p.te + 0.75 && t < roundEnd(p.ri) - 0.15) { shade(); const a0 = p.te + 0.75, d = roundEnd(p.ri) - 0.3 - a0;
        words(layout('Ладно… а как сказать:'.split(' ').map(w => ({ w })), 66, 920), 66, 260, 74, 99);
        const ws = SG.ru[p.ri].split(' ').map(w => ({ w, col: YEL })); words(layout(ws, 80, 940), 80, 360, 88, reveal(ws, a0 + 0.15, d * 0.8, t)); return; }
      shade(); const q = p.k === 0 ? [{ w: 'Как' }, { w: 'будет' }, { w: '«' + p.ru.toLowerCase() + '»?', col: YEL }] : [{ w: p.ru + '?', col: YEL }];
      const qa = t >= p.te - 0.05 ? 0.45 : clamp(P(t, p.tr - 0.1, p.tr + 0.05)); words(layout(q, 96, 940), 96, 310, 100, q.length, qa);
      if (t >= p.te - 0.06) { const u = P(t, p.te - 0.06, p.te + 0.2); bigWord(p.en, fam, u < 1 ? 1 + 0.25 * Math.sin(Math.PI * u) * (1 - u) + (u - 1) * 0 : 1); } } }
  if (t >= SG.card - 0.05) { const k = clamp(P(t, SG.card - 0.05, SG.card + 0.25)); g.save(); g.translate(540, 1480); g.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); g.globalAlpha = k;
    K.draw(K.rr(-450, -180, 900, 360, 50), { fill: '#fff2c9', shade: '#ead79c', seed: 900, lw: 8 }); g.font = `110px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = INK; g.fillText('ENGLISH IS', 0, -70); g.fillStyle = '#e0503f'; g.font = `140px ${FONT}`; g.fillText('EASY', 0, 40); g.fillStyle = INK; g.font = `64px ${FONT}`; g.fillText('(почти)', 0, 130); g.restore(); }
}
function frame(t) {
  const cam = shot(t), d = direction(t), bp = beatPulse(t), blinkA = ((t + 0.0) % 3.7) < 0.12, blinkT = ((t + 1.3) % 3.4) < 0.12;
  g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  K.room(t);
  const breathe = (s) => Math.sin(t * 1.6 + s) * 3;
  tom({ x: TX, by: breathe(1) - bp * 10, mouth: env('tom', t), blink: blinkT, mood: d.T.mood, look: 'right', ...poseState('T', t) });
  heroine({ x: AX, by: breathe(0) - bp * 10, mouth: env('her', t), blink: blinkA, mood: d.A.mood, look: 'left', ...poseState('A', t) });
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(K.PAPER, 0, 0);
  const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  overlays(t);
}
if (OUT.startsWith('--png')) { for (const s of OUT.split('=')[1].split(',').map(Number)) { frame(s); fs.writeFileSync(`${PNGDIR}/hs_${s}.png`, cv.toBuffer('image/png')); } process.exit(0); }
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
(async () => { const t0 = Date.now(); for (let f = +a0; f < Math.min(+a1, NF); f++) { frame(f / FPS); if (!ff.stdin.write(Buffer.from(g.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) console.error('frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done'); })();
