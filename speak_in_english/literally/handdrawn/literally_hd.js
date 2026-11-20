// "Literally" pilot, hand-drawn style: node ourcast/literally_hd.js a b part.mp4 | --png=t1,t2 | --mix out.mp4
const fs = require('fs'), path = require('path'), { spawn, spawnSync } = require('child_process');
const K = require('./hand_kit'); const { heroine, tom, ease } = require('./cast');
const W = 1080, H = 1920, FPS = 30, SR = 48000, FONT = K.FONT, INK = '#251c1a';
const VO = '/tmp/claude-0/-home-user-sofia-studio/43e73c66-8e6e-5633-a8a3-d2d45001da3f/scratchpad/hd/vo';
const AUD = path.join(__dirname, '..', 'asya', 'audio');
const S = JSON.parse(fs.readFileSync(path.join(__dirname, 'literally_hd.json'), 'utf8'));
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
// ---- voices: duration + loudness envelope per frame
const CL = {}; for (const [id, who, , text] of S.lines) { const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', `${VO}/${id}.wav`, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 }).stdout;
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length >> 2), spf = SR / FPS, env = []; for (let f = 0; f * spf < x.length; f++) { let s = 0, n = 0; for (let k = Math.floor(f * spf); k < Math.min(x.length, (f + 1) * spf); k++) { s += x[k] * x[k]; n++; } env.push(Math.sqrt(s / Math.max(1, n))); }
  const mx = Math.max(...env) || 1; CL[id] = { id, who, text, dur: x.length / SR, env: env.map(v => v / mx) }; }
// ---- timeline: [kind, id|card, pre-gap, hold-after]
const SEQ = [['line', 'h0', .3, .25], ['line', 'h1', 0, .35], ['line', 'h2', 0, .15], ['line', 'h3', 0, 1.4, 'cloud'], ['line', 'h4', 0, .2], ['card', 0, 0, 2.4],
  ['line', 'h5', 0, .1], ['line', 'h6', 0, 1.4, 'ears'], ['card', 1, 0, 2.2], ['line', 'h7', 0, 1.9, 'rain'], ['card', 2, 0, 2.8],
  ['line', 'h8', 0, .15], ['line', 'h9', 0, .7, 'call'], ['line', 'h10', 0, 1.0, 'call'], ['card', 3, 0, 2.4], ['card', 'end', 0, 3.2]];
const EV = []; let tc = 0;
for (const [kind, id, pre, hold, fx] of SEQ) { tc += pre; const d = kind === 'line' ? CL[id].dur : 0; EV.push({ kind, id, t: tc, d, end: tc + d + hold, fx }); tc += d + hold; }
const TOTAL = tc, NF = Math.ceil(TOTAL * FPS);
const evAt = t => EV.find(e => t >= e.t && t < e.end) || EV[EV.length - 1];
const speaking = (who, t) => { for (const e of EV) if (e.kind === 'line' && CL[e.id].who === who && t >= e.t && t < e.t + e.d) return CL[e.id].env[Math.min(CL[e.id].env.length - 1, Math.floor((t - e.t) * FPS))] || 0; return 0; };
const fxStart = e => e.t + e.d * 0.8;
// ---- direction
function direction(t) { const e = evAt(t), id = e.id, after = e.kind === 'line' && t > fxStart(e);
  let A = { pose: 'down', mood: 'neutral' }, T = { pose: 'down', mood: 'neutral' };
  if (id === 'h0') T = { pose: 'hips', mood: 'smug' };
  if (id === 'h1') { A = { pose: 'cross', mood: 'sleepy' }; T = { pose: 'hips', mood: 'smug' }; }
  if (id === 'h2') A = { pose: 'presentL', mood: 'neutral' };
  if (id === 'h3') T = after ? { pose: 'down', mood: 'surprised' } : { pose: 'cheer', mood: 'happy' };
  if (id === 'h4') { A = { pose: 'pointL', mood: 'neutral' }; T = { pose: 'down', mood: 'sad' }; }
  if (id === 'h6') { A = { pose: 'presentL', mood: 'neutral' }; T = after ? { pose: 'shrug', mood: 'surprised' } : { pose: 'presentR', mood: 'happy' }; }
  if (id === 'h7') { T = { pose: 'pointR', mood: 'surprised' }; A = { pose: 'down', mood: after ? 'surprised' : 'neutral' }; }
  if (id === 'h8') A = { pose: 'cross', mood: 'smug' };
  if (id === 'h9') T = after ? { pose: 'down', mood: 'surprised' } : { pose: 'presentR', mood: 'happy' };
  if (id === 'h10') { T = { pose: 'shrug', mood: 'surprised' }; A = { pose: 'cross', mood: 'sleepy' }; }
  return { A, T }; }
function poseState(who, t) { const f = Math.round(t * FPS), cur = direction(t)[who].pose; let k = f, prev = cur;
  while (k > 0 && f - k < 30) { const q = direction((k - 1) / FPS)[who].pose; if (q !== cur) { prev = q; break; } k--; }
  return { pose: cur, prevPose: prev, poseK: prev === cur ? 1 : ease((f - k) / (0.32 * FPS)) }; }
// ---- shots
const TX = 330, AX = 750;
const SH = { WIDE: { z: 1, cx: 540, cy: 960 }, TWO: { z: 1.25, cx: 540, cy: 1060 }, HER: { z: 1.55, cx: AX, cy: 1060 }, HER_CU: { z: 2.0, cx: AX, cy: 990 }, TOM: { z: 1.4, cx: TX + 40, cy: 990 }, TOM_CU: { z: 1.9, cx: TX, cy: 960 } };
const SHOT = { h0: 'TOM', h1: 'HER_CU', h2: 'HER', h3: 'TOM', h4: 'TWO', h5: 'HER', h6: 'TOM', h7: 'WIDE', h8: 'HER_CU', h9: 'TOM', h10: 'TOM_CU' };
// ---- brush-style effects (world coordinates)
const D = (pts, o) => K.draw(pts, o), P = K.potato;
function cloud(cx, cy, k) { if (k <= 0) return; const g = K.g; g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy);
  D(P(cx, cy + 10, 170, 62, 801, .08), { fill: '#f4f7fb', shade: '#cfd9e6', seed: 802, lw: 7 }); D(P(cx - 60, cy - 30, 80, 66, 803, .1), { fill: '#f4f7fb', shade: '#cfd9e6', seed: 804, lw: 7 }); D(P(cx + 50, cy - 46, 92, 76, 805, .1), { fill: '#f4f7fb', shade: '#cfd9e6', seed: 806, lw: 7 }); g.restore(); }
function drops(x0, x1, y0, y1, t, n, seed = 1) { for (let i = 0; i < n; i++) { const x = x0 + ((i * 97 + seed * 31) % (x1 - x0)), y = y0 + ((t * 900 + i * 137) % (y1 - y0)); D([[x, y], [x - 6, y + 36]], { closed: false, lw: 8, seed: 820 + i, col: '#3d93e0', amp: .5 }); } }
function ear(x, y, a, k) { if (k <= 0) return; const g = K.g; g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k);
  D([[-28, -62], [12, -74], [44, -40], [42, 10], [24, 50], [-4, 70], [-26, 52], [-12, 20], [-34, -10]], { fill: '#ffc79c', shade: '#ea9a6c', seed: 830, lw: 6 }); K.curve([-6, -36], [24, -20], [4, 22], 5, 831); g.restore(); }
function cat(x, y, r, s) { const g = K.g; g.save(); g.translate(x, y); g.rotate(r); D([[-40, -18], [-32, -66], [-6, -36]], { fill: '#9aa3b5', seed: s, lw: 6 }); D([[40, -18], [32, -66], [6, -36]], { fill: '#9aa3b5', seed: s + 1, lw: 6 });
  D(P(0, 0, 50, 42, s + 2, .08), { fill: '#9aa3b5', shade: '#7c8598', seed: s + 3, lw: 7 }); D(P(-16, -6, 7, 9, s + 4), { fill: INK, line: false, seed: 1 }); D(P(16, -6, 7, 9, s + 5), { fill: INK, line: false, seed: 1 });
  for (const q of [-1, 1]) K.stroke([[q * 14, 12], [q * 60, 4]], 3, s + 6 + q); g.restore(); }
function dog(x, y, r, s) { const g = K.g; g.save(); g.translate(x, y); g.rotate(r); D(P(-48, 8, 18, 34, s, .12), { fill: '#8a5a33', seed: s + 1, lw: 6 }); D(P(48, 8, 18, 34, s + 2, .12), { fill: '#8a5a33', seed: s + 3, lw: 6 });
  D(P(0, 0, 50, 44, s + 4, .08), { fill: '#d59a5c', shade: '#b97c40', seed: s + 5, lw: 7 }); D(P(-16, -8, 7, 9, s + 6), { fill: INK, line: false, seed: 1 }); D(P(16, -8, 7, 9, s + 7), { fill: INK, line: false, seed: 1 }); D(P(0, 14, 13, 9, s + 8), { fill: INK, line: false, seed: 1 }); g.restore(); }
function bucket(x, y, r, s) { const g = K.g; g.save(); g.translate(x, y); g.rotate(r); K.curve([-48, -36], [0, -110], [48, -36], 6, s); D([[-54, -36], [54, -36], [42, 42], [-42, 42]], { fill: '#a9bed4', shade: '#8aa1ba', seed: s + 1, lw: 7 }); D(P(0, -36, 54, 13, s + 2), { fill: '#7f98b3', seed: s + 3, lw: 6 }); g.restore(); }
const FX = {
  cloud: (k, t, hx, hy) => { if (k <= 0) return; const g = K.g; g.save(); g.beginPath(); g.rect(hx - 170, hy - 200, 340, 520); g.clip(); g.globalAlpha = k; drops(hx - 150, hx + 150, hy - 200, hy + 320, t, 11); g.restore(); cloud(hx, hy - 250, k); },
  ears: (k, t, hx, hy) => { const PP = [[-210, -60, -0.6], [210, -60, 0.6], [-180, -210, -0.9], [180, -210, 0.9], [-80, -300, -0.2], [80, -300, 0.2], [-230, 100, -0.3], [230, 100, 0.3]];
    PP.forEach(([dx, dy, a], i) => { const u = clamp(k * 1.6 - i * 0.08); ear(hx + dx, hy + dy, a + Math.sin(t * 6 + i) * 0.08, u * (1 + 0.15 * Math.sin(Math.PI * u))); }); },
  rain: (k, t) => { if (k <= 0) return; drops(60, 1020, 0, 1900, t, 22, 3); const items = [[cat, 200, 0], [dog, 860, 400], [cat, 640, 800], [dog, 400, 1150], [bucket, 540, 600], [cat, 930, 1300], [dog, 120, 700]];
    items.forEach(([fn, x, off], i) => fn(x, -100 + ((t * 650 + off) % 2000), Math.sin(t * 3 + i) * 0.5, 850 + i * 10)); },
};
function phoneOverlay(t, k) { if (k <= 0) return; const g = K.g, sh = Math.sin(t * 40) * 6 * (Math.sin(t * 3) > 0 ? 1 : 0); g.save(); g.translate(760 + sh, 1250); g.scale(k * 0.8, k * 0.8); g.rotate(0.06);
  D(K.rr(-170, -300, 340, 600, 50), { fill: '#2b2b33', seed: 880, lw: 8 }); D(K.rr(-140, -260, 280, 520, 30), { fill: '#fff6e6', seed: 881, lw: 5 });
  g.font = `110px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.fillText('MUM', 0, -40); g.font = `46px ${FONT}`; g.fillStyle = '#2f9a5a'; g.fillText('incoming call', 0, 50);
  for (const s of [-1, 1]) for (let q = 1; q <= 2; q++) { g.beginPath(); g.arc(0, 0, 330 + q * 40, s > 0 ? -.35 : Math.PI - .35, s > 0 ? .35 : Math.PI + .35); g.strokeStyle = 'rgba(37,28,26,0.6)'; g.lineWidth = 7; g.stroke(); } g.restore(); }
// ---- cards
const CARDS = [
  ['UNDER THE WEATHER', '= приболеть', 'тучка тут ни при чём'],
  ['ALL EARS', '= весь внимание', 'уши — по желанию'],
  ['RAINING CATS AND DOGS', '= льёт как из ведра', 'у них кошки и собаки, у нас ведро'],
  ["MUM'S THE WORD", '= я могила, никому ни слова', 'но мама уже звонит']];
function card(i, t) { const g = K.g, k = clamp(t / 0.25); g.fillStyle = '#ffe6b0'; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = k; D(K.rr(90, 520, 900, 760, 50), { fill: '#fff8e8', shade: '#f0dfb8', seed: 900 + (i === 'end' ? 9 : i), lw: 9 });
  g.textAlign = 'center'; g.textBaseline = 'middle'; const hand = (s, y, size, col) => { g.font = `${size}px ${FONT}`; let w = g.measureText(s).width; if (w > 820) { g.font = `${Math.floor(size * 820 / w)}px ${FONT}`; } g.fillStyle = col; g.fillText(s, 540, y); };
  if (i === 'end') { hand('Какую идиому', 680, 100, INK); hand('показать буквально?', 800, 100, INK); hand('Пиши в комментах', 960, 80, '#e0503f'); hand('и сохрани!', 1060, 80, '#e0503f'); }
  else { const [en, ru, note] = CARDS[i]; const ws = en.split(' '); const l1 = ws.length > 2 ? ws.slice(0, 2).join(' ') : en, l2 = ws.length > 2 ? ws.slice(2).join(' ') : '';
    hand(l1, l2 ? 680 : 740, 120, INK); if (l2) hand(l2, 800, 120, INK); hand(ru, 960, 82, '#e0503f'); hand(note, 1100, 60, '#5a6f8a');
    if (i === 0) cloud(540, 1430, .8); if (i === 1) { ear(470, 1430, -0.3, 1.1); ear(610, 1430, 0.3, 1.1); } if (i === 2) { cat(380, 1440, -0.2, 950); dog(540, 1450, 0.1, 960); bucket(700, 1450, 0.1, 970); } }
  g.restore(); }
// ---- frame
function frame(t) { const g = K.g, e = evAt(t);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (e.kind === 'card') { card(e.id, t - e.t); g.drawImage(K.PAPER, 0, 0); return; }
  const cam = SH[SHOT[e.id]] || SH.TWO; g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  K.room(t); const d = direction(t), br = s => Math.sin(t * 1.6 + s) * 3;
  const fk = e.fx ? clamp((t - fxStart(e)) / 0.4) : 0;
  if (e.fx === 'rain') FX.rain(fk, t - fxStart(e));
  tom({ x: TX, by: br(1), mouth: speaking('tom', t), blink: ((t + 1.3) % 3.4) < 0.12, mood: d.T.mood, look: 'right', ...poseState('T', t) });
  heroine({ x: AX, by: br(0), mouth: speaking('her', t), blink: (t % 3.7) < 0.12, mood: d.A.mood, look: 'left', ...poseState('A', t) });
  if (e.fx === 'cloud' || e.fx === 'ears') FX[e.fx](fk, t, TX, 930);
  if (e.fx === 'rain') FX.rain(fk, t - fxStart(e) + 0.41);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (e.fx === 'call') { const c0 = EV.find(x => x.id === 'h9'); phoneOverlay(t, clamp((t - fxStart(c0)) / 0.3)); }
  g.drawImage(K.PAPER, 0, 0); const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  // subtitles (hand font), Russian translation under English lines
  const RU = { h1: 'О нет.', h2: 'Ну, как ты?', h3: 'Я под погодой!', h4: 'Это значит, ты заболел.', h5: 'Так, слушай.', h6: 'Я весь уши!', h7: 'Ого! Идёт дождь из кошек и собак!', h8: 'Только никому не говори.', h9: 'Мама — это слово!' };
  if (e.kind === 'line' && t < e.t + e.d + 0.4) { const L = CL[e.id]; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.font = `72px ${FONT}`; let w = g.measureText(L.text).width, f = w > 960 ? Math.floor(72 * 960 / w) : 72; g.font = `${f}px ${FONT}`; g.lineWidth = 11; g.strokeStyle = 'rgba(30,20,15,0.92)'; g.strokeText(L.text, W / 2, 1500); g.fillStyle = L.who === 'tom' ? '#cdeffa' : '#fffaf0'; g.fillText(L.text, W / 2, 1500);
    if (RU[e.id]) { g.font = `50px ${FONT}`; g.lineWidth = 8; g.strokeText(RU[e.id], W / 2, 1580); g.fillStyle = '#ffd23f'; g.fillText(RU[e.id], W / 2, 1580); } } }
// ---- output
const cv = K.createCanvas(W, H); K.setG(cv.getContext('2d')); const g0 = K.g;
const [a0, a1, OUT] = process.argv.slice(2);
if (a0 && a0.startsWith('--png')) { const dir = a1; for (const s of a0.split('=')[1].split(',').map(Number)) { frame(s); fs.writeFileSync(`${dir}/hd_${s}.png`, cv.toBuffer('image/png')); } console.log(EV.map(e => `${e.kind}:${e.id}@${e.t.toFixed(2)}`).join(' '), 'total', TOTAL.toFixed(1)); process.exit(0); }
if (a0 === '--mix') { const out = a1, silent = process.argv[4]; const ev = []; for (const e of EV) { if (e.kind === 'line') ev.push([`${VO}/${e.id}.wav`, e.t, 1.0]); else ev.push([path.join(AUD, 'pop.mp3'), e.t, .35]);
    if (e.fx === 'cloud' || e.fx === 'ears') ev.push([path.join(AUD, 'whoosh.mp3'), fxStart(e), .5]); if (e.fx === 'rain') { ev.push([path.join(AUD, 'whoosh.mp3'), fxStart(e), .5]); ev.push([path.join(AUD, 'meow.mp3'), fxStart(e) + .5, .5]); }
    if (e.id === 'h9') ev.push([path.join(AUD, 'beep.mp3'), fxStart(e), .55]); if (e.id === 'end') ev.push([path.join(AUD, 'ding.mp3'), e.t + .1, .5]); }
  const args = ['-y', '-v', 'error', '-i', silent, '-stream_loop', '-1', '-i', path.join(AUD, 'theme.mp3')]; ev.forEach(([f]) => args.push('-i', f));
  let fc = `[1:a]atrim=0:${TOTAL},asetpts=N/SR/TB,volume=0.12,afade=t=out:st=${(TOTAL - 0.8).toFixed(2)}:d=0.8[m]`; const lab = ['[m]'];
  ev.forEach(([, s, v], i) => { const ms = Math.round(s * 1000); fc += `;[${i + 2}:a]aresample=48000,volume=${v},adelay=${ms}|${ms}[s${i}]`; lab.push(`[s${i}]`); });
  fc += `;${lab.join('')}amix=inputs=${lab.length}:normalize=0:duration=first,alimiter=limit=0.9:level=disabled[a]`;
  args.push('-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', TOTAL.toFixed(2), '-movflags', '+faststart', out);
  if (spawnSync('ffmpeg', args, { stdio: 'inherit' }).status) throw new Error('mix failed'); console.log('mixed', out); process.exit(0); }
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
(async () => { for (let f = +a0; f < Math.min(+a1, NF); f++) { frame(f / FPS); if (!ff.stdin.write(Buffer.from(g0.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done'); })();
