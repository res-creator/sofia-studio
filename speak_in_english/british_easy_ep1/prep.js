// Timeline for «British is easy» from word timings of the Suno track. node prep.js -> timeline.json + out/audio.wav
const fs = require('fs'), {spawnSync} = require('child_process');
// [start, end, who (A = Russian guy / B = Brit / AB = both), text on screen, translation, card [phrase, meaning]]
const L = [
 [0.0, 2.6, 'A', 'Бро. Британский английский — это шифр.'],
 [3.4, 5.0, 'B', 'Nah, mate. British is easy.', 'Не, приятель. Британский — это просто.'],
 [5.38, 6.1, 'A', 'Easy?', 'Просто?'], [6.4, 7.6, 'B', 'Test me.', 'Проверь меня.'],
 [9.58, 11.2, 'AB', 'British is easy?', 'Британский — это просто?'], [11.46, 12.6, 'B', 'Say it sweet —', 'Говори мило —'], [12.92, 14.4, 'AB', 'Mean the opposite!', 'а имей в виду обратное!'],
 [14.74, 15.4, 'A', '«Отлично»?'], [15.58, 16.1, 'B', 'Not bad.', 'Неплохо.', ['NOT BAD', 'отлично']],
 [16.22, 16.85, 'A', '«Так себе»?'], [16.96, 17.7, 'B', 'Quite good.', 'Вполне хорошо.', ['QUITE GOOD', 'так себе']],
 [17.88, 18.35, 'A', '«Ты дурак»?'], [18.4, 19.7, 'B', 'With all due respect…', 'При всём уважении…', ['WITH ALL DUE RESPECT', 'ты не прав (ты дурак)']],
 [19.8, 20.45, 'A', '«Это бред»?'], [20.56, 21.5, 'B', 'Very interesting.', 'Очень интересно.', ['VERY INTERESTING', 'это бред']],
 [21.58, 22.15, 'A', '«Ты псих»?'], [22.24, 23.5, 'B', "That's very brave.", 'Это очень смело.', ["THAT'S VERY BRAVE", 'ты сошёл с ума']],
 [23.66, 24.7, 'A', '«Уже забыл»?'], [25.32, 26.95, 'B', "I'll bear it in mind.", 'Я учту.', ["I'LL BEAR IT IN MIND", 'уже забыл']],
 [27.22, 28.7, 'AB', 'British is easy?', 'Британский — это просто?'], [28.8, 31.5, 'B', 'Say it sweet —', 'Говори мило —'], [31.58, 33.4, 'AB', 'Mean the opposite!', 'а имей в виду обратное!'],
 [33.48, 34.65, 'A', '«Ты виноват»?'], [34.72, 35.8, 'B', "I'm sure it's my fault.", 'Наверное, это я виноват.', ["I'M SURE IT'S MY FAULT", 'виноват ты']],
 [35.82, 37.35, 'A', '«Идея — отстой»?'], [37.42, 39.55, 'B', 'Could we consider other options?', 'Рассмотрим другие варианты?', ['COULD WE CONSIDER OTHER OPTIONS?', 'мне не нравится твоя идея']],
 [39.64, 40.7, 'A', '«Переделай всё»?'], [40.74, 42.4, 'B', 'Just a few minor comments.', 'Пара мелких замечаний.', ['JUST A FEW MINOR COMMENTS', 'переделай всё']],
 [42.48, 43.65, 'A', '«Я в бешенстве»?'], [43.72, 45.2, 'B', "I'm a bit disappointed.", 'Я немного расстроен.', ["I'M A BIT DISAPPOINTED", 'я в бешенстве']],
 [45.28, 46.65, 'A', '«Не приходи»?'], [46.74, 48.6, 'B', 'You must come round for dinner!', 'Обязательно приходи на ужин!', ['YOU MUST COME ROUND FOR DINNER', 'это не приглашение']],
 [49.38, 51.4, 'A', 'Стоп. Мой трек ты назвал… «very brave».'], [52.4, 52.95, 'B', 'Did I?', 'Разве?'],
 [53.06, 54.35, 'A', 'Мой рэп — «quite good».'], [54.46, 54.85, 'B', 'Quite.', 'Вполне.'],
 [54.88, 56.8, 'A', 'Мою идею — «very interesting».'], [56.92, 57.6, 'B', 'Very.', 'Очень.'],
 [57.7, 59.65, 'A', 'То есть ты меня… всё это время?!'], [59.72, 61.3, 'B', "I hear what you're saying.", 'Я тебя слышу.', ["I HEAR WHAT YOU'RE SAYING", 'не согласен, тема закрыта']],
 [61.68, 63.5, 'AB', 'British is easy?', 'Британский — это просто?'], [63.76, 65.8, 'B', 'Say it sweet —', 'Говори мило —'], [66.58, 67.95, 'AB', 'Mean the opposite!', 'а имей в виду обратное!'],
 [68.14, 70.95, 'A', 'Окей, последний вопрос. Подпишешься на канал?'], [71.04, 74.15, 'B', "I'll bear it in mind.", 'Я учту… (то есть «уже забыл»)'], [74.26, 75.1, 'A', '…Это да?'],
];
const TOTAL = 79;
// shots: one per Q/A pair + hooks wide + break close-ups
const SH = []; const push = (t, k) => SH.push([t, k]);
push(0, 'WIDE'); push(3.4, 'B_MED'); push(5.38, 'A_MED'); push(6.4, 'B_MED'); push(9.4, 'HOOK');
let pair = 0; for (const l of L) { if (l[2] === 'A' && l[0] >= 14 && l[0] < 49) { push(l[0] - .05, pair % 2 ? 'OTS_A' : 'OTS_B'); pair++; } }
push(27.1, 'HOOK'); SH.sort((a, b) => a[0] - b[0]);
push(49.3, 'A_CU'); push(52.35, 'B_CU'); push(53.0, 'A_CU'); push(54.42, 'B_CU'); push(54.85, 'A_CU'); push(56.9, 'B_CU'); push(57.65, 'A_CU'); push(59.7, 'B_CU');
push(61.5, 'HOOK'); push(68.05, 'A_MED'); push(71.0, 'B_MED'); push(74.2, 'A_CU'); push(75.4, 'END');
SH.sort((a, b) => a[0] - b[0]);
// envelope of the track (mouths)
const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', 'audio/track.mp3', '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], {maxBuffer: 1 << 27}).stdout, n = raw.length / 2, per = 8000 / 30, env = [];
for (let i = 0; i * per < n; i++) { let s = 0, c = 0; for (let j = Math.floor(i * per); j < Math.min(n, (i + 1) * per); j++) { const v = raw.readInt16LE(j * 2) / 32768; s += v * v; c++; } env.push(Math.sqrt(s / Math.max(1, c))); }
const srt = [...env].sort((a, b) => a - b), p = srt[Math.floor(srt.length * .93)] || 1;
fs.writeFileSync('timeline.json', JSON.stringify({TOTAL, L, SH, env: env.map(v => +Math.max(0, Math.min(1, (v / p - .25) * 1.4)).toFixed(3))}));
fs.mkdirSync('out', {recursive: true});
spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', 'audio/track.mp3', '-af', `atrim=0:${TOTAL},afade=t=out:st=${TOTAL - 3}:d=3`, '-ar', '44100', '-ac', '2', 'out/audio.wav']);
// SRT
const f2 = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
fs.writeFileSync('out/british_easy_ep1.srt', L.map((l, i) => `${i + 1}\n${f2(l[0])} --> ${f2(l[1] + .2)}\n${l[3]}${l[4] ? '\n' + l[4] : ''}\n`).join('\n'));
console.log('shots', SH.length);
