// Timeline + audio for «Первый день в Лондоне»: trims silence, measures each line, builds shots, captions and the mix.
// node prep.js -> timeline.json + out/mix.wav
const fs = require('fs'), path = require('path'), {spawnSync} = require('child_process');
const D = __dirname, VD = path.join(D, 'voice'), TMP = path.join(D, 'out', 'tmp'); fs.mkdirSync(TMP, {recursive: true});
const S = JSON.parse(fs.readFileSync(path.join(VD, 'script.json'), 'utf8')).lines;
const dur = f => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());
function trimmed(id) { const o = path.join(TMP, id + '.wav'); spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(VD, id + '.mp3'), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar', '44100', '-ac', '1', o]); return o; }
function envelope(f) { const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], {maxBuffer: 1 << 26}).stdout, n = raw.length / 2, per = 8000 / 30, out = [];
  for (let i = 0; i * per < n; i++) { let s = 0, c = 0; for (let j = Math.floor(i * per); j < Math.min(n, (i + 1) * per); j++) { const v = raw.readInt16LE(j * 2) / 32768; s += v * v; c++; } out.push(Math.sqrt(s / Math.max(1, c))); }
  const srt = [...out].sort((a, b) => a - b), p = srt[Math.floor(srt.length * .93)] || 1; return out.map(v => Math.max(0, Math.min(1, (v / p - .08) * 1.15))); }
const ORDER = [['n1', .3], ['o1', .35], ['n2', .2], ['b1', .45], ['n3', .2], ['b2', .25], ['g1', .45], ['n4', .2], ['h1', .4], ['g2', .2], ['n5', .2], ['g3', .45], ['n6', .2], ['h2', .1], ['n7', .25],
  ['h3', .5], ['p1', .1], ['n8', .2], ['n9', .5], ['h4', .25], ['n10', .2], ['g4', .25], ['n11', .45]];
// text shown on screen (English as spoken; Russian translation under English lines)
const SHOWN = {n1: 'Ты летишь в Лондон. У тебя железная база: «London is the capital of Great Britain». Что может пойти не так?', o1: 'Cheers!', b1: 'Alright?', b2: '…It just means "hi".',
  g1: 'Is this the queue?', h1: 'Where is the toilet?', g2: "The loo's upstairs, love.", g3: 'Fancy a cuppa?', h2: 'No, normal cup, please.', h3: 'Alright? A pint, please. Cheers!', p1: 'Cheers!', h4: 'Cheers!', g4: 'Alright, love?',
  n2: '«Cheers» — это же «за здоровье». Ты ищешь бокал. Бокала нет. Офицер тоже ищет — что с тобой не так.', n5: '«Love»?! Вы знакомы три минуты. Ты бежишь по лестнице. От бабушки, а не в туалет.', n6: '«Fancy» — это «модный». Ты гордо отвечаешь:',
  n4: 'Ты читаешь «кью-ю-е». Пока ты это произносишь, кто-то влезает. Двенадцать британцев молча смотрят на тебя так, будто ты украл королеву.'};
const TR = {o1: 'Спасибо!', b1: 'Привет!', b2: '…Это просто «привет».', g1: 'Это очередь?', h1: 'Где туалет?', g2: 'Туалет наверху, дорогуша.', g3: 'Чайку хочешь?', h2: 'Нет, обычную чашку, пожалуйста.', h3: 'Привет! Пинту, пожалуйста. Спасибо!', p1: 'Ура!', h4: 'Спасибо!', g4: 'Привет, дорогуша!'};
const lines = {}; let t = 0;
for (const [id, gap] of ORDER) { const f = trimmed(id), d = dur(f); t += gap; const text = SHOWN[id] || S[id][1].replace(/\[[^\]]*\]\s*/g, '');
  const ws = text.split(' '), out = []; let cur = ''; for (const w of ws) { const q = cur ? cur + ' ' + w : w; if (cur && (q.length > 24 || /[.?!…:]$/.test(cur))) { out.push(cur); cur = w; } else cur = q; } out.push(cur);
  const tot = out.reduce((a, c) => a + c.length, 0); let acc = 0; const ch = out.map(c => { const o = {s: acc / tot * d, txt: c}; acc += c.length; return o; });
  lines[id] = {at: t, end: t + d, who: S[id][0], env: envelope(f), ch, text, file: f}; t += d; }
const T = id => lines[id].at, M = (id, k) => lines[id].at + (lines[id].end - lines[id].at) * k, TOTAL = lines.n11.end + 2.8;
// shots: [start, kind]
const SH = [[0, 'PLANE'], [T('o1'), 'PASS_OFF'], [T('n2'), 'PASS_HERO'], [M('n2', .7), 'PASS_OFF2'], [T('b1'), 'CAFE_BAR'], [T('n3'), 'CAFE_TALK'], [M('n3', .72), 'CAFE_QUEUE'], [T('b2'), 'CAFE_BAR'],
  [T('g1'), 'STOP_GRAN'], [T('n4'), 'STOP_HERO'], [M('n4', .42), 'STOP_CUT'], [M('n4', .66), 'STOP_STARE'], [T('h1'), 'STREET_DANCE'], [T('g2'), 'STOP_GRAN2'], [T('n5'), 'HERO_SHOCK'], [M('n5', .5), 'STAIRS'],
  [T('g3'), 'TEA_GRAN'], [T('n6'), 'TEA_HERO'], [T('n7'), 'TEA_POUR'], [T('h3'), 'PUB_BAR'], [T('p1'), 'PUB_CROWD'], [T('n9'), 'SVO_WIDE'], [T('h4'), 'SVO_HERO'], [T('n10'), 'SVO_GUARD'], [T('g4'), 'SVO_GRAN'], [T('n11') - .2, 'END']];
// school-English meter and word cards
const METER = [[0, 100], [T('o1') + .5, 80], [T('b2'), 60], [M('n4', .5), 40], [T('n5'), 25], [T('n7'), 12], [T('n8'), 200]];
const CARDS = [[T('n2') + .6, M('n2', .99), 'CHEERS', 'спасибо / пока'], [M('n3', .4), lines.b2.end + .4, 'ALRIGHT?', 'привет · ответ: Yeah, you?'], [M('n4', .3), M('n4', .99), 'QUEUE', 'очередь · читается «кью»'],
  [M('n5', .55), lines.n5.end + .2, 'LOO', 'туалет · бонус: LOVE = «дорогуша»'], [M('n7', .1), lines.n7.end + .3, 'FANCY A…?', 'хочешь…?']];
fs.writeFileSync(path.join(D, 'timeline.json'), JSON.stringify({TOTAL, SH, lines: Object.fromEntries(Object.entries(lines).map(([k, v]) => [k, {...v, file: undefined}])), TR, METER, CARDS}));
// audio mix: voices + light sfx + music (ducked under narration a little)
const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = Object.values(lines).map(l => [l.file, l.at, 1.0]);
ev.push([sfx('whoosh'), 0.05, .4], [sfx('ding'), T('o1') - .2, .35], [sfx('pop'), M('n4', .42), .5], [sfx('whoosh'), M('n5', .5), .55], [sfx('chime'), T('p1'), .5], [sfx('coin'), T('n8'), .35], [sfx('ding'), T('n11'), .35]);
const args = ['-y', '-v', 'error']; ev.forEach(([f]) => args.push('-i', f)); args.push('-stream_loop', '-1', '-i', sfx('music'));
const fl = ev.map(([f, at, g], i) => `[${i}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${g},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`), m = ev.length;
fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume='0.17*(1-0.6*between(t,${T('n10')},${lines.n10.end}))':eval=frame,afade=t=in:d=0.3,afade=t=out:st=${TOTAL - 1.5}:d=1.5[mus]`);
fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus]amix=inputs=${m + 1}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(D, 'out', 'mix.wav'));
const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); }
// SRT
const f2 = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
let n = 0, srt = ''; for (const [id, l] of Object.entries(lines)) srt += `${++n}\n${f2(l.at)} --> ${f2(l.end + .2)}\n${l.text}${TR[id] ? '\n' + TR[id] : ''}\n\n`;
fs.writeFileSync(path.join(D, 'out', 'london_words_ep1.srt'), srt);
console.log('timeline', SH.length, 'shots', TOTAL.toFixed(2), 's');
