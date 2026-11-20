// Rubric «От вежливого до грубого», pilot: how to say «отстань» (American English). Host: Anna (anna.js), flat style.
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./flat'), A = require('./anna'); const {rr, ell, ln, text, caption} = K;
const W = 1080, H = 1920, FPS = 30, D = __dirname, VD = path.join(D, 'voice'), OUT = path.join(D, 'out'), TMP = path.join(OUT, 'tmp'); fs.mkdirSync(TMP, {recursive: true});
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
let g;
const dur = f => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());
function envelope(f) { const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], {maxBuffer: 1 << 26}).stdout, n = raw.length / 2, per = 8000 / FPS, out = [];
  for (let i = 0; i * per < n; i++) { let s = 0, c = 0; for (let j = Math.floor(i * per); j < Math.min(n, (i + 1) * per); j++) { const v = raw.readInt16LE(j * 2) / 32768; s += v * v; c++; } out.push(Math.sqrt(s / Math.max(1, c))); }
  const srt = [...out].sort((a, b) => a - b), p = srt[Math.floor(srt.length * .93)] || 1; return out.map(v => clamp((v / p - .08) * 1.15)); }
const SCRIPT = JSON.parse(fs.readFileSync(path.join(VD, 'script.json'), 'utf8'));
const ORDER = [['h1', .3], ['h2', .2], ['r1', .5], ['e1', .25], ['t1', .25], ['r2', .6], ['e2', .25], ['t2', .25], ['r3', .6], ['e3', .25], ['t3', .25], ['r4', .6], ['e4', .25], ['t4', .25],
  ['r5', .6], ['e5', .25], ['t5', .25], ['b1', .7], ['e6', .25], ['t6', .25], ['o1', .7]];
const LN = {}; { let t = 0; for (const [id, gap] of ORDER) { const f = path.join(VD, id + '.mp3'), d = dur(f); t += gap; LN[id] = {at: t, dur: d, end: t + d, file: f, env: envelope(f), text: SCRIPT.lines[id][1].replace(/\[[^\]]+\]\s*/g, '')}; t += d; } }
const T = id => LN[id].at, E = id => LN[id].end, TOTAL = E('o1') + 3.2;
const talk = (t) => { for (const id in LN) { if (id[0] === 'e') continue; const l = LN[id]; if (t >= l.at && t < l.end) { const i = Math.floor((t - l.at) * FPS); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); } } return 0; };
const blink = t => (t % 3.4) < .12;
const LV = [
  {n: 1, en: "I'd rather be alone right now.", ru: 'Я бы хотела сейчас побыть одна.', who: 'начальнику', col: '#3cc28a', icon: 'tie'},
  {n: 2, en: 'I need some space.', ru: 'Мне нужно немного пространства.', who: 'парню или подруге', col: '#a8d84a', icon: 'heart'},
  {n: 3, en: 'Leave me alone.', ru: 'Оставь меня в покое.', who: 'брату', col: '#ffcc12', icon: 'sib'},
  {n: 4, en: 'Back off!', ru: 'Отвали!', who: 'назойливому незнакомцу', col: '#ff8a2a', icon: 'stranger'},
  {n: 5, en: 'Get lost!', ru: 'Проваливай!', who: 'только в кино', col: '#e0303f', icon: 'film'},
];
const BONUS = {en: 'Would you mind giving me a minute?', ru: 'Вы не дадите мне минутку?', who: 'вежливо, но значит «уйди»', col: '#b48cff'};
const lvAt = t => { let k = 0; for (let i = 1; i <= 5; i++) if (t >= T('r' + i) - .1) k = i; if (t >= T('b1') - .1) k = 6; if (t >= T('o1') - .2) k = 7; return k; };

// ---------- drawing ----------
function bgGrad() { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1b1433'); gr.addColorStop(1, '#2c1d4d'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 2; for (let x = 0; x <= W; x += 90) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } }
function pill(s, x, y, col, fg = '#1b1433', size = 34) { g.font = `${size}px NL, NC`; const w = g.measureText(s).width + 50; rr(x - w / 2, y - size * .8, w, size * 1.6, size * .8, col, 0); text(s, x, y + 2, size, fg); }
function wrapText(s, x, y, size, col, maxW, lh = 1.1) { g.font = `${size}px NL, NC`; const words = s.split(' '), lines = []; let l = ''; for (const w of words) { const t2 = l ? l + ' ' + w : w; if (g.measureText(t2).width > maxW && l) { lines.push(l); l = w; } else l = t2; } lines.push(l);
  lines.forEach((ln_, i) => text(ln_, x, y + (i - (lines.length - 1) / 2) * size * lh, size, col)); return lines.length; }
function thermo(level, t) {
  const x = 110, y0 = 1380, y1 = 440, h = y0 - y1; rr(x - 34, y1 - 30, 68, h + 60, 34, '#ffffff22', 0); rr(x - 26, y1 - 22, 52, h + 44, 26, '#120d24', 0);
  const lvl = Math.min(level, 5), prev = Math.max(0, lvl - 1), k = ease((t - T('r' + Math.max(1, lvl)) + .1) / .5), fillTo = lvl === 0 ? 0 : (prev + (lvl - prev) * (level > 5 ? 1 : k)) / 5;
  const col = level >= 6 ? '#b48cff' : LV[Math.max(0, lvl - 1)].col; rr(x - 20, y0 - h * fillTo, 40, h * fillTo + 20, 20, col, 0);
  ell(x, y0 + 40, 46, 46, lvl ? col : '#120d24', 0); g.beginPath(); g.ellipse(x, y0 + 40, 46, 46, 0, 0, 7); g.strokeStyle = '#ffffff55'; g.lineWidth = 6; g.stroke();
  for (let i = 1; i <= 5; i++) { const y = y0 - h * i / 5; ln([[x + 40, y], [x + 60, y]], 5, '#ffffff66'); text(String(i), x + 84, y, 34, i <= lvl ? LV[i - 1].col : '#ffffff55'); }
}
function icon(kind, x, y) { g.save(); g.translate(x, y);
  if (kind === 'tie') { rr(-26, -40, 52, 18, 6, '#fffaf0'); g.beginPath(); g.moveTo(-12, -22); g.lineTo(12, -22); g.lineTo(18, 30); g.lineTo(0, 44); g.lineTo(-18, 30); g.closePath(); g.fillStyle = '#e0303f'; g.fill(); }
  if (kind === 'heart') { g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-50, -4, -30, -46, 0, -20); g.bezierCurveTo(30, -46, 50, -4, 0, 30); g.fillStyle = '#ff6f9f'; g.fill(); }
  if (kind === 'sib') { ell(-16, -6, 20, 20, '#ffd8bf', 4); ell(18, 0, 16, 16, '#ffd8bf', 4); }
  if (kind === 'stranger') { ell(0, -10, 22, 22, '#9aa3b5', 4); rr(-24, 14, 48, 26, 10, '#9aa3b5', 4); text('?', 0, -10, 30, '#1b1433'); }
  if (kind === 'film') { rr(-32, -14, 64, 44, 6, '#2b2b33', 4); g.save(); g.translate(0, -14); g.rotate(-.25); rr(-32, -16, 64, 16, 4, '#fffaf0', 4); g.restore(); }
  g.restore(); }
function card(L, t, t0, tr, n, bonus) {
  const k = ease((t - t0) / .3); if (k <= 0) return; g.save(); g.translate((1 - k) * 600, 0); g.globalAlpha = k;
  const x = 230, y = 430, w = 790, h = 640; rr(x, y, w, h, 40, '#2a2147', 0); g.beginPath(); g.roundRect(x, y, w, h, 40); g.strokeStyle = L.col; g.lineWidth = 6; g.stroke();
  pill(bonus ? 'БОНУС' : `УРОВЕНЬ ${n}`, x + 170, y + 70, L.col);
  if (!bonus) icon(L.icon, x + 90, y + 190); text(bonus ? '' : 'кому:', x + 150, y + 170, 30, '#ffffff88', 'left'); text(L.who, bonus ? x + w / 2 : x + 150, y + 215, 40, '#ffffff', bonus ? 'center' : 'left');
  const pk = ease((t - t0 - .4) / .25); g.save(); g.translate(x + w / 2, y + 380); g.scale(.8 + .2 * pk, .8 + .2 * pk); wrapText(L.en, 0, 0, L.en.length > 22 ? 64 : 92, '#ffffff', w - 90); g.restore();
  // sound wave: native speaker voice
  const wk = tr > t ? 1 : 0; for (let i = 0; i < 5; i++) { const hh = 10 + Math.abs(Math.sin(t * 12 + i)) * 26 * wk; rr(x + w / 2 - 70 + i * 30, y + 500 - hh / 2, 14, hh, 7, '#ffffff66', 0); }
  const rk = ease((t - tr + .05) / .25); if (rk > 0) { g.globalAlpha = k * rk; wrapText(L.ru, x + w / 2, y + 580, 44, '#ffe066', w - 90); }
  g.restore(); }
function summary(t) { const k = ease((t - T('o1') + .2) / .35); if (k <= 0) return; g.save(); g.globalAlpha = k;
  text('Шкала «отстань»', 560, 470, 60, '#ffffff');
  LV.forEach((L, i) => { const a = ease((t - T('o1') - i * .12) / .25); g.globalAlpha = k * a; const y = 560 + i * 110; rr(240, y, 760, 92, 22, L.col, 0); text(String(L.n), 290, y + 48, 48, '#1b1433'); text(L.en, 640, y + 48, L.en.length > 22 ? 34 : 44, '#1b1433'); });
  g.globalAlpha = k * ease((t - T('o1') - 1) / .3); rr(330, 1130, 460, 90, 45, '#ffe066', 0); text('СОХРАНИ', 560, 1176, 48, '#1b1433'); g.restore(); }
function anna(t, level) {
  const moods = [{pose: 'wave', mood: 'smile'}, {pose: 'down', mood: 'smile'}, {pose: 'down', mood: 'smile'}, {pose: 'hips', mood: 'flat'}, {pose: 'hips', mood: 'flat', brows: 'angry'}, {pose: 'face', mood: 'o', wide: true}, {pose: 'down', mood: 'sleepy'}, {pose: 'wave', mood: 'smile'}];
  const st = moods[Math.min(level, 7)], m = talk(t); A.draw(g, {x: 560, y: 1930, s: .5, blink: blink(t), mouth: m, ...st, mood: m > .12 ? undefined : st.mood});
}
function frame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); bgGrad();
  const lv = lvAt(t);
  pill('ОТ ВЕЖЛИВОГО ДО ГРУБОГО', 540, 150, '#ffe066', '#1b1433', 32);
  if (lv === 0) { const k = ease((t - .1) / .4); g.save(); g.globalAlpha = k; text('Как сказать', 540, 520, 80, '#ffffff'); g.save(); g.translate(540, 680); g.rotate(-.04); g.scale(.7 + .3 * k, .7 + .3 * k); text('«ОТСТАНЬ»', 0, 0, 150, '#ff6f6f'); g.restore(); text('по-английски', 540, 840, 80, '#ffffff');
    const k2 = ease((t - T('h2')) / .4); g.globalAlpha = k2; LV.forEach((L, i) => rr(190 + i * 140, 960, 120, 40, 20, L.col, 0)); text('5 уровней', 540, 1060, 52, '#ffe066'); g.restore(); }
  else if (lv <= 6) { thermo(lv, t); const L = lv === 6 ? BONUS : LV[lv - 1], n = lv; card(L, t, lv === 6 ? T('b1') - .1 : T('r' + n) - .1, T(lv === 6 ? 't6' : 't' + n), n, lv === 6); }
  else { thermo(5, t + 99); summary(t); }
  // narrator caption
  for (const id in LN) { if (id[0] === 'e' || id[0] === 't') continue; const l = LN[id]; if (t >= l.at - .05 && t < l.end + .2 && id !== 'h1' && id !== 'o1') caption(l.text.replace(/ё/g, 'е'), 1180, 50); }
  if (t >= T('o1') - .05 && t < E('o1') + .3) caption('Пиши цифру в комментариях!', 1240, 54);
  anna(t, lv);
}
function audio() { const ids = Object.keys(LN), args = ['-y', '-v', 'error'], fl = []; ids.forEach(id => args.push('-i', LN[id].file)); args.push('-stream_loop', '-1', '-i', path.join(D, 'sfx', 'theme.mp3'), '-i', path.join(D, 'sfx', 'swipe.mp3'), '-i', path.join(D, 'sfx', 'pop.mp3'), '-i', path.join(D, 'sfx', 'ding.mp3'));
  ids.forEach((id, i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${id[0] === 'e' ? 1.1 : 1},adelay=${Math.round(LN[id].at * 1000)}|${Math.round(LN[id].at * 1000)}[a${i}]`)); const m = ids.length;
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume=0.1,afade=t=out:st=${TOTAL - 1}:d=1[mus]`);
  const sx = []; for (let i = 1; i <= 5; i++) { sx.push([m + 1, T('r' + i) - .1, .4]); sx.push([m + 2, T('e' + i) + .3, .45]); } sx.push([m + 1, T('b1') - .1, .4]); sx.push([m + 3, T('o1') + 1, .45]);
  sx.forEach(([inp, at, v], j) => fl.push(`[${inp}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${v},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[s${j}]`));
  fl.push(`${ids.map((_, i) => `[a${i}]`).join('')}${sx.map((_, j) => `[s${j}]`).join('')}[mus]amix=inputs=${m + sx.length + 1}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[o]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[o]', path.join(TMP, 'mix.wav')); const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } }
const cv = K.createCanvas(W, H); g = cv.getContext('2d'); K.setG(g);
const [mode, a1] = process.argv.slice(2);
if (mode === 'still') { for (const s of a1.split(',')) { frame(+s); fs.writeFileSync(path.join(OUT, `still_${s}.png`), cv.toBuffer('image/png')); } console.log('total', TOTAL.toFixed(1), JSON.stringify(Object.fromEntries(Object.entries(LN).map(([k, v]) => [k, +v.at.toFixed(1)])))); }
else if (mode === 'cover') { frame(+a1); fs.writeFileSync(path.join(OUT, 'polite_scale_cover.png'), cv.toBuffer('image/png')); }
else { audio(); const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-i', path.join(TMP, 'mix.wav'), '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', path.join(OUT, 'polite_scale.mp4')]);
  (async () => { for (let f = 0; f < Math.ceil(TOTAL * FPS); f++) { frame(f / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })(); ff.on('close', c => console.log('done', c)); }
