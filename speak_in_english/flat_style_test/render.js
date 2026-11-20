// Flat vector style test (montage grammar of the reference: hard cuts every ~1.5–2 s, slow push/pull, inserts,
// metaphor cutaway, invisibility fade, snap zoom, phrase captions). Story: «Первый созвон на английском» (opening).
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./flat'); const {blob, poly, ell, rr, ln, curve, text, person, caption} = K;
const W = 1080, H = 1920, FPS = 30, D = __dirname, VD = path.join(D, 'voice'), OUT = path.join(D, 'out'), TMP = path.join(OUT, 'tmp'); fs.mkdirSync(TMP, {recursive: true});
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
let g;
const dur = f => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());
function envelope(f) { const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], {maxBuffer: 1 << 26}).stdout, n = raw.length / 2, per = 8000 / FPS, out = [];
  for (let i = 0; i * per < n; i++) { let s = 0, c = 0; for (let j = Math.floor(i * per); j < Math.min(n, (i + 1) * per); j++) { const v = raw.readInt16LE(j * 2) / 32768; s += v * v; c++; } out.push(Math.sqrt(s / Math.max(1, c))); }
  const srt = [...out].sort((a, b) => a - b), p = srt[Math.floor(srt.length * .93)] || 1; return out.map(v => clamp((v / p - .08) * 1.15)); }
const ORDER = [['a1', .4], ['a2', .3], ['a3', .3], ['b1', .5], ['a4', .5], ['a5', .4]];
const LN = {}; { let t = 0; for (const [id, gap] of ORDER) { const f = path.join(VD, id + '.mp3'), d = dur(f); t += gap; LN[id] = {at: t, dur: d, end: t + d, file: f, env: envelope(f), words: JSON.parse(fs.readFileSync(path.join(VD, id + '.words.json'), 'utf8')).words}; t += d; } }
const T = id => LN[id].at, E = id => LN[id].end, TOTAL = E('a5') + 1.6;
const wT = (id, i) => T(id) + (LN[id].words[i] ? LN[id].words[i].s : 0);
const talk = (id, t) => { const l = LN[id]; if (t < l.at || t > l.end) return 0; const i = Math.floor((t - l.at) * FPS); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); };
const blink = (t, s = 0) => ((t + s) % 3.3) < .12;
// phrase captions: [text, start, end]
const CAP = []; { const add = (id, groups) => { let wi = 0; groups.forEach((n, k) => { const s = wT(id, wi); wi += n; const e = k === groups.length - 1 ? E(id) + .25 : wT(id, wi); CAP.push([LN[id].words.slice(wi - n, wi).map(w => w.w).join(' '), s - .05, e]); }); };
  add('a1', [5, 3]); add('a2', [2, 2, 2, 1]); add('a3', [2, 3]); add('a4', [1]); add('a5', [3, 3]); }
const ANNA = {skin: '#fcd2b4', skinS: '#efb08c', hair: '#9a4a24', hairS: '#7a3418', hairL: '#c06a3a', hairStyle: 'part', top: '#8e7cc3', topS: '#6f5ca8', collar: '#fffaf0', pendant: '#ffcc12', freckles: true, brow: '#5a2a14'};
const BOSS = {skin: '#f2c6a2', skinS: '#dca880', hair: '#9a9aa2', hairStyle: 'bald', beard: '#9a9aa2', glasses: true, top: '#2f4a7a', topS: '#203560', collar: '#ffffff', brow: '#6a6a72'};
// ---------------- sets ----------------
function room() { rr(-20, -20, W + 40, H + 40, 0, '#f6e7c8', 0); for (let x = 0; x < W; x += 90) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, 0, 40, 1250); }
  rr(-20, 1180, W + 40, 60, 0, '#7fb9a8', 0); ln([[0, 1180], [W, 1180]], 6); rr(-20, 1240, W + 40, 800, 0, '#c99560', 0); ln([[0, 1240], [W, 1240]], 6); for (let x = -200; x < W + 200; x += 150) ln([[x, 1240], [x - 120, H]], 3, 'rgba(90,60,30,0.4)');
  rr(640, 260, 340, 420, 18, '#bfe6ff'); ln([[810, 266], [810, 674]], 7); ln([[646, 470], [974, 470]], 7); ell(900, 340, 46, 46, '#fff2a8', 0); rr(626, 680, 368, 34, 10, '#fff8ea');
  rr(80, 300, 220, 260, 12, '#ffd36e'); text('TO DO:', 190, 360, 40, '#2a1f1d'); text('be brave', 190, 430, 36, '#c0283a');
  blob([[120, 1000], [200, 1000], [190, 1150], [130, 1150]], '#e0703a', '#c05520'); for (let k = 0; k < 4; k++) blob([[160, 1000], [100 + k * 40, 860], [140 + k * 30, 880]], '#4fb06a', '#2f9050'); }
function desk() { rr(150, 1300, 780, 420, 10, '#a86a3c'); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(150, 1300, 780, 40); rr(120, 1250, 840, 60, 14, '#c8864f'); ln([[540, 1320], [540, 1700]], 4, 'rgba(60,30,10,0.35)'); }
function laptopBack(x, y) { poly([[x - 170, y], [x + 170, y], [x + 150, y - 220], [x - 150, y - 220]], '#c9ced6'); ell(x, y - 110, 26, 26, '#ffffff', 4); }
function callScreen(t, mode) { // full-screen video call UI
  rr(-900, -900, W + 1800, H + 1800, 0, '#1f2430', 0);
  const tiles = [[60, 260, BOSS, 'Mr. Harris'], [560, 260, null, 'Sophie'], [60, 820, null, 'Raj'], [560, 820, 'anna', 'Anna']];
  tiles.forEach(([x, y, who, name], i) => { const speaking = mode === 'boss' && i === 0; rr(x, y, 460, 520, 26, '#33394a', speaking ? 0 : 0); if (speaking) rr(x - 6, y - 6, 472, 532, 30, null, 0), (g.strokeStyle = '#3cff8a', g.lineWidth = 10, g.stroke());
    if (who === BOSS) { g.save(); g.beginPath(); g.roundRect(x, y, 460, 520, 26); g.clip(); person(BOSS, {x: x + 230, y: y + 250, s: .85, mouth: talk('b1', t), blink: blink(t, 1), mood: 'smile', arms: 'none'}); g.restore(); }
    else if (who === 'anna') { ell(x + 230, y + 230, 90, 90, '#5a6278', 0); text('A', x + 230, y + 232, 90, '#ffffff'); rr(x + 170, y + 400, 120, 44, 22, '#c0283a', 0); text('camera off', x + 230, y + 422, 24, '#ffffff'); }
    else { ell(x + 230, y + 230, 90, 90, ['#c99560', '#7fb9a8', '#e0703a'][i], 0); text(name[0], x + 230, y + 232, 90, '#ffffff'); }
    rr(x + 20, y + 460, 220, 44, 12, 'rgba(0,0,0,0.5)', 0); text(name, x + 130, y + 482, 28, '#ffffff'); });
  // control bar
  rr(240, 1420, 600, 140, 70, '#2b3040', 0); const camOff = t > wT('a2', 2) - .1, micOff = t > wT('a2', 4) - .1;
  for (const [cx, off, lbl] of [[400, camOff, 'cam'], [540, micOff, 'mic'], [680, false, 'end']]) { ell(cx, 1490, 50, 50, lbl === 'end' ? '#e0303f' : off ? '#e0303f' : '#4a5168', 0); text(lbl, cx, 1490, 28, '#ffffff'); if (off) ln([[cx - 34, 1456], [cx + 34, 1524]], 8, '#ffffff'); }
  if (mode === 'click') { const tgt = t < wT('a2', 4) - .1 ? 400 : 540, tap = Math.abs(Math.sin(t * 7)) * 18; ln([[tgt + 90, 1820], [tgt + 20, 1540 + tap]], 70, '#2a1f1d'); ln([[tgt + 90, 1820], [tgt + 20, 1540 + tap]], 56, '#ffd8bf'); }
}
function cactus(x, y) { blob([[x - 90, y + 180], [x + 90, y + 180], [x + 70, y + 330], [x - 70, y + 330]], '#e0703a', '#c05520'); blob([[x - 60, y + 190], [x - 70, y - 120], [x - 30, y - 200], [x + 30, y - 200], [x + 70, y - 120], [x + 60, y + 190]], '#4fb06a', '#2f9050');
  blob([[x - 60, y - 20], [x - 150, y - 40], [x - 160, y - 140], [x - 120, y - 140], [x - 110, y - 80], [x - 60, y - 70]], '#4fb06a', '#2f9050'); for (let k = 0; k < 6; k++) ln([[x - 40 + (k % 3) * 40, y - 150 + Math.floor(k / 3) * 120], [x - 50 + (k % 3) * 40, y - 166 + Math.floor(k / 3) * 120]], 4);
  // Anna's hair bow + headphones on the cactus
  g.beginPath(); g.arc(x, y - 150, 110, Math.PI * 1.1, Math.PI * 1.9); g.strokeStyle = '#2a1f1d'; g.lineWidth = 16; g.stroke(); ell(x - 104, y - 120, 30, 44, '#3a3f55'); ell(x + 104, y - 120, 30, 44, '#3a3f55'); }

// ---------------- shots: [start, draw(t, u), camera(u) -> {z, fx, fy}] ----------------
const SH = [
  [0, (t) => { room(); laptopBack(540, 1250); person(ANNA, {x: 540, y: 820, mouth: 0, blink: blink(t), mood: 'smile', arms: 'desk'}); desk(); }, u => ({z: 1 + u * .05, fx: 540, fy: 900})],
  [wT('a1', 4) - .05, (t) => { room(); laptopBack(540, 1250); person(ANNA, {x: 540, y: 820, mood: 'grin', brows: 'up', blink: blink(t), arms: 'desk'}); desk(); }, u => ({z: 1.5 - u * .06, fx: 540, fy: 820})],
  [T('a2') - .1, (t) => callScreen(t, 'click'), u => ({z: 1.15 + u * .1, fx: 540, fy: 1250})],
  [wT('a2', 6) - .05, (t) => { room(); person(ANNA, {x: 540, y: 820 + Math.sin(t * 9) * 16, mood: 'flat', blink: blink(t), arms: 'desk', look: 0}); desk(); }, u => ({z: 1.6, fx: 540, fy: 860})],
  [T('a3') - .1, (t, u) => { room(); const k = ease((t - T('a3') - .3) / .4); g.save(); g.globalAlpha = 1 - k; person(ANNA, {x: 540, y: 820, mood: 'flat', blink: true, arms: 'desk'}); g.restore(); g.save(); g.globalAlpha = k; cactus(540, 900); g.restore(); desk(); }, u => ({z: 1.1, fx: 540, fy: 950})],
  [wT('a3', 2) - .05, (t) => { room(); const k = ease((t - wT('a3', 2)) / .9); person(ANNA, {x: 540, y: 820, mood: 'smile', blink: true, arms: 'desk', alpha: 1 - k * .8}); desk(); }, u => ({z: 1 + u * .03, fx: 540, fy: 900})],
  [T('b1') - .3, (t) => callScreen(t, 'boss'), u => ({z: 1.15 + u * .35, fx: 290, fy: 560})],
  [T('a4') - .15, (t) => { room(); person(ANNA, {x: 540, y: 820, mood: 'o', wide: true, blink: false, brows: 'up', arms: 'desk', mouth: talk('a4', t) * .4}); desk(); }, u => ({z: 2.6 - (1 - ease(u * 6)) * .9, fx: 540, fy: 800})],
  [T('a5') - .1, (t) => { room(); laptopBack(540, 1250); person(ANNA, {x: 540, y: 820, mood: 'flat', wide: true, sweat: true, blink: false, arms: 'face'}); desk(); }, u => ({z: 1.7 - u * .5, fx: 540, fy: 900})],
];
function frame(t) {
  let k = 0; for (let i = 0; i < SH.length; i++) if (t >= SH[i][0]) k = i; const [t0, draw, cam] = SH[k], t1 = SH[k + 1] ? SH[k + 1][0] : TOTAL, u = clamp((t - t0) / Math.max(.1, t1 - t0)), c = cam(u);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#f6e7c8'; g.fillRect(0, 0, W, H);
  g.setTransform(c.z, 0, 0, c.z, W / 2 - c.fx * c.z, H / 2 - c.fy * c.z); draw(t, u);
  g.setTransform(1, 0, 0, 1, 0, 0);
  for (const [s, a, b] of CAP) if (t >= a && t < b) caption(s, 1520, 78);
  if (t >= T('b1') - .05 && t < E('b1') + .3) { caption('And Anna... what do you think?', 1420, 70); caption('А что думает Анна?', 1520, 54, '#ffe066'); }
  if (t > E('a5') + .3) { const kk = ease((t - E('a5') - .3) / .3); g.fillStyle = `rgba(0,0,0,${.6 * kk})`; g.fillRect(0, 0, W, H); g.globalAlpha = kk; caption('Продолжение следует...', 960, 76); g.globalAlpha = 1; }
}
function audio() { const args = ['-y', '-v', 'error'], fl = [], ids = Object.keys(LN); ids.forEach(id => args.push('-i', LN[id].file)); args.push('-stream_loop', '-1', '-i', path.join(D, 'sfx', 'theme.mp3'), '-i', path.join(D, 'sfx', 'pop.mp3'), '-i', path.join(D, 'sfx', 'tap.mp3'), '-i', path.join(D, 'sfx', 'whoosh.mp3'));
  ids.forEach((id, i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${Math.round(LN[id].at * 1000)}|${Math.round(LN[id].at * 1000)}[a${i}]`)); const m = ids.length;
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume=0.11[mus]`);
  const sfx = [[m + 2, wT('a2', 2), .7], [m + 2, wT('a2', 4), .7], [m + 1, wT('a3', 0) + .3, .6], [m + 3, T('a4') - .15, .7], [m + 1, T('b1') - .3, .5]];
  sfx.forEach(([inp, at, v], j) => fl.push(`[${inp}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${v},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[s${j}]`));
  fl.push(`${ids.map((_, i) => `[a${i}]`).join('')}${sfx.map((_, j) => `[s${j}]`).join('')}[mus]amix=inputs=${m + sfx.length + 1}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[o]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[o]', path.join(TMP, 'mix.wav')); const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } }
const cv = K.createCanvas(W, H); g = cv.getContext('2d'); K.setG(g);
const [mode, a1] = process.argv.slice(2);
if (mode === 'still') { for (const s of a1.split(',')) { frame(+s); fs.writeFileSync(path.join(OUT, `still_${s}.png`), cv.toBuffer('image/png')); } console.log('total', TOTAL.toFixed(2)); }
else { audio(); const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-i', path.join(TMP, 'mix.wav'), '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', path.join(OUT, 'flat_style_test.mp4')]);
  (async () => { for (let f = 0; f < Math.ceil(TOTAL * FPS); f++) { frame(f / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })(); ff.on('close', c => console.log('done', c)); }
