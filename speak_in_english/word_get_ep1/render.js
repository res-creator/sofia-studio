// «Жизнь слова», выпуск 1 «GET». Hand-drawn sketch (folk.js + cast_get.js).
// node render.js still t1,t2 | chunk i n | audio | srt | cover t
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./hand_kit'), CA = require('./cast'), F = require('./folk'), CC = require('./cast_get');
const {heroine, tom, ease} = CA;
const W = 1080, H = 1920, FPS = 30, FONT = K.FONT, INK = '#251c1a';
const D = __dirname, VD = path.join(D, 'voice'), OUT = path.join(D, 'out'), TMP = path.join(OUT, 'tmp');
fs.mkdirSync(TMP, {recursive: true});
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const DR = (pts, o) => K.draw(pts, o), P = K.potato;
let g;
const spot = (...a) => K.spot(...a), stroke = (...a) => K.stroke(...a);

// ---------------- voices ----------------
const SCRIPT = JSON.parse(fs.readFileSync(path.join(VD, 'script.json'), 'utf8'));
const dur = f => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());
function envelope(f) {
  const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], {maxBuffer: 1 << 26}).stdout;
  const n = raw.length / 2, per = 8000 / FPS, out = [];
  for (let i = 0; i * per < n; i++) { let s = 0, c = 0; for (let j = Math.floor(i * per); j < Math.min(n, (i + 1) * per); j++) { const v = raw.readInt16LE(j * 2) / 32768; s += v * v; c++; } out.push(Math.sqrt(s / Math.max(1, c))); }
  const srt = [...out].sort((a, b) => a - b), p = srt[Math.floor(srt.length * .93)] || 1;
  return out.map(v => clamp((v / p - .08) * 1.15));
}
function cloud(cx, cy, k) { if (k <= 0) return; g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy);
  DR(P(cx, cy + 10, 170, 62, 801, .08), {fill: '#c9d2e2', shade: '#a6b2c8', seed: 802, lw: 7}); DR(P(cx - 60, cy - 30, 80, 66, 803, .1), {fill: '#c9d2e2', shade: '#a6b2c8', seed: 804, lw: 7}); DR(P(cx + 50, cy - 46, 92, 76, 805, .1), {fill: '#c9d2e2', shade: '#a6b2c8', seed: 806, lw: 7}); g.restore(); }
function drops(x0, x1, y0, y1, t, n, seed = 1) { for (let i = 0; i < n; i++) { const x = x0 + ((i * 97 + seed * 31) % (x1 - x0)), y = y0 + ((t * 900 + i * 137) % (y1 - y0)); DR([[x, y], [x - 6, y + 36]], {closed: false, lw: 8, seed: 820 + i, col: '#3d93e0', amp: .5}); } }
const talk = (who, t) => { for (const id in LN) { const l = LN[id]; if (l.who === who && t >= l.at && t < l.end) { const i = Math.floor((t - l.at) * FPS); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); } } return 0; };
const blink = (t, seed) => ((t + seed * 1.3) % (3.1 + seed * .5)) < .12;
// pose with smooth blend from the previous one
function posed(fn, t) { const f = Math.round(t * FPS), cur = fn(t); let k = f, prev = cur;
  while (k > 0 && f - k < 12) { const q = fn((k - 1) / FPS); if (q.pose !== cur.pose) { prev = q; break; } k--; }
  return {...cur, prevPose: prev.pose, poseK: prev.pose === cur.pose ? 1 : ease((f - k) / (.3 * FPS))}; }
function tokens(s) { let hot = false; return s.split(' ').map(w => { if (w.startsWith('*')) hot = true; const o = {t: w.replace(/\*/g, ''), hot}; if (/\*[.!?]?$/.test(w)) hot = false; return o; }); }
function lines(words, font, maxW) { g.font = font; const L = []; let l = []; for (const w of words) { const t = [...l, w].map(q => q.t).join(' '); if (g.measureText(t).width > maxW && l.length) { L.push(l); l = [w]; } else l.push(w); } L.push(l); return L; }
function outlined(ln, y, size, colFn) { g.font = `${size}px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.lineJoin = 'round';
  const parts = ln.map(w => w.t + ' '), ws = parts.map(q => g.measureText(q).width), tw = ws.reduce((a, b) => a + b, 0) - g.measureText(' ').width; let x = (W - tw) / 2;
  const xs = []; parts.forEach((p, j) => { xs.push(x); x += ws[j]; });
  g.lineWidth = size * .13; g.strokeStyle = 'rgba(30,20,15,0.92)'; parts.forEach((p, j) => g.strokeText(p.trim(), xs[j], y));
  parts.forEach((p, j) => { g.fillStyle = colFn(ln[j]); g.fillText(p.trim(), xs[j], y); }); }
function subtitle(id, t) {
  const [en, ru] = TXT[id], k = ease((t - T(id)) / .12) * (1 - ease((t - E(id) - .3) / .15)); if (k <= 0) return;
  g.save(); g.globalAlpha = k;
  const ens = en ? lines(tokens(en), `76px ${FONT}`, 980) : [], rus = lines(ru.split(' ').map(q => ({t: q})), en ? `52px ${FONT}` : `70px ${FONT}`, 980);
  let y = SUBY - (ens.length - 1) * 40;
  ens.forEach(l => { outlined(l, y, 76, w => w.hot ? '#ffd23f' : '#fffaf0'); y += 82; });
  rus.forEach(l => { outlined(l, y + (en ? -8 : 0), en ? 52 : 70, () => en ? '#bfe9ff' : '#fffaf0'); y += en ? 58 : 78; });
  g.restore();
}



// ---------------- timeline ----------------
const ORDER = [['n1', .9], ['n2', .9], ['n3', .5], ['g1', .2], ['x1', .5], ['n4', .7], ['o1', .3], ['b1', .9], ['g2', .1], ['e1', .8], ['g3', .1], ['e2', .2], ['w1', .8], ['g4', .1],
  ['n5', .8], ['n6', .9], ['b2', .7], ['e3', .8], ['w2', .8], ['r1', .1], ['n7', .4], ['g5', 1.0], ['g6', .4], ['n8', .7], ['t1', .8], ['g7', .4], ['n9', .3], ['f1', .9], ['n10', .3]];
const LN = {};
{ let t = 0; for (const [id, gap] of ORDER) { const f = path.join(VD, id + '.mp3'), d = dur(f); t += gap; const w = JSON.parse(fs.readFileSync(path.join(VD, id + '.words.json'), 'utf8')).words;
  LN[id] = {id, at: t, dur: d, end: t + d, who: id === 'x1' ? 'x' : id[0], env: envelope(f), words: w, file: f}; t += d; } }
const T = id => LN[id].at, E = id => LN[id].end, inW = (t, a, b) => t >= a && t < b;
const END0 = E('n10') + .6, TOTAL = END0 + 4.6;
const SC = [['amb', 0], ['title', T('n2') - .4], ['bed', T('n3') - .2], ['hq', T('n4') - .4], ['bus', T('b1') - .5], ['office', T('e1') - .5], ['wed', T('w1') - .5], ['fall', T('n5') - .4],
  ['hq2', T('n6') - .4], ['bus2', T('b2') - .4], ['office2', T('e3') - .4], ['wed2', T('w2') - .4], ['rise', T('g5') - .7], ['beach', T('n8') - .4], ['fine', T('f1') - .6]];
const scAt = t => { let s = SC[0]; for (const x of SC) if (t >= x[1]) s = x; return {name: s[0], t0: s[1]}; };
let SUBY = 1470, NOSUB = false;
const TXT = {
  n1: [null, 'Пациент: слово GET. Диагноз: переработка.'], n2: [null, 'Восемнадцать часов назад.'], n3: [null, 'Шесть утра. Слово GET встаёт.'],
  g1: ["*Get up!* Let's go!", 'Подъём! Погнали!'], x1: ['GET! We need you!', 'GET! Ты нам нужен!'],
  n4: [null, 'А это аристократы английского языка: OBTAIN, RECEIVE и BECOME. Они не работают. Они... присутствуют.'], o1: ["We don't do buses, darling.", 'Мы не ездим на автобусах, дорогуша.'],
  b1: ['I need to *get on* the bus!', 'Мне надо сесть в автобус!'], g2: ['*Get on!* Go, go, go!', 'Садись! Давай, давай!'],
  e1: ["Sorry... I don't *get it.*", 'Простите... я не понимаю.'], g3: ['You *get it* now?', 'Теперь понял?'], e2: ['Oh! I *get it!*', 'О! Понял!'],
  w1: ["We're *getting married!*", 'Мы женимся!'], g4: ['*Getting married!* Congrats! Next!', 'Женитесь! Поздравляю! Следующий!'],
  n5: [null, 'Но даже у самого трудолюбивого слова есть предел.'], n6: [null, 'Работу взяли на себя аристократы.'],
  b2: ['I must... *board* the bus.', 'Я обязан... взойти на борт автобуса.'], e3: ['I do not... *receive* it.', 'Я не... получаю это.'],
  w2: ['We are... *becoming* married?', 'Мы... становимся женатыми?'], r1: ['*Becoming?!*', 'Становимся?!'], n7: [null, 'Лондон был на грани катастрофы.'],
  g5: ['*Get on. Get it. Get married.*', 'Садись. Понял. Женитесь.'], g6: ['And you three... *get a life.*', 'А вы трое... займитесь уже чем-нибудь.'],
  n8: [null, 'Лондон спасён. А GET наконец ушёл в отпуск.'], t1: ["I can't *get over* this view...", 'Не могу налюбоваться этим видом...'], g7: ['...Seriously?', '...Серьёзно?'],
  n9: [null, 'Отпуск GET длился ноль целых четыре десятых секунды.'], f1: ["I'm *fine!*", 'У меня всё хорошо!'], n10: [null, 'В следующем выпуске: слово FINE. Которое всегда врёт.'],
};
const STICK = {g1: 'get up = вставать', g2: 'get on = сесть (в транспорт)', g3: 'get it = понять', w1: 'get married = пожениться', g6: 'get a life = займись делом', t1: "can't get over = не могу налюбоваться"};

// ---------------- sets ----------------
function bg(col) { DR(K.rr(-800, -400, 2800, 2000, 1), {fill: col, line: false, seed: 3, amp: 0, offset: 0}); }
function floor(col, colS) { DR([[-800, 1560], [2000, 1556], [2000, 2400], [-800, 2400]], {fill: col, shade: colS, shadeDir: [0, -40], seed: 51, lw: 8}); }
function setAmb(t) { bg('#1c2450'); for (let i = 0; i < 30; i++) spot((i * 137) % 1400 - 200, (i * 89) % 700, 3, 3, '#fff3a0'); floor('#3a3f55', '#262a3a');
  DR(K.rr(500, 1000, 640, 520, 30), {fill: '#fffaf0', shade: '#d8d0c0', seed: 400, lw: 8}); DR(K.rr(540, 1060, 220, 160, 10), {fill: '#9fd3ff', seed: 401, lw: 5}); K.hand('AMBULANCE', 860, 1320, 56, '#c0283a');
  const bl = Math.sin(t * 12) > 0; DR(K.rr(640, 950, 90, 50, 10), {fill: bl ? '#3d82ee' : '#9fbff5', seed: 402, lw: 5}); if (bl) spot(685, 975, 160, 120, 'rgba(80,140,255,0.35)');
  for (const wx of [620, 1020]) DR(P(wx, 1520, 60, 60, 403 + wx), {fill: '#2b2b33', seed: 404 + wx, lw: 6});
  DR(K.rr(-20, 1440, 1040, 60, 14), {fill: '#c9ced6', seed: 405, lw: 6}); for (const lx of [40, 960]) K.stroke([[lx, 1500], [lx, 1640]], 8, 406 + lx); }
function setBed(t) { bg('#ffe6b0'); floor('#c98a44', '#a86a2a'); DR(K.rr(700, 500, 300, 340, 14), {fill: '#9fd3ff', shade: '#79b6ea', seed: 410, lw: 8}); DR(P(860, 600, 46, 46, 411), {fill: '#ffd83a', seed: 412, lw: 5});
  DR(K.rr(-60, 1350, 760, 240, 30), {fill: '#7fc9b0', shade: '#5aa98e', seed: 413, lw: 8}); DR(K.rr(-60, 1290, 200, 90, 30), {fill: '#fffaf0', seed: 414, lw: 6});
  DR(K.rr(820, 1300, 160, 260, 10), {fill: '#c98a44', seed: 415, lw: 6}); const ring = inW(t, T('n3') - .3, T('g1')); g.save(); g.translate(900 + (ring ? Math.sin(t * 50) * 4 : 0), 1240);
  DR(P(0, 0, 56, 56, 416), {fill: '#ff6a52', seed: 417, lw: 6}); DR(P(0, 0, 40, 40, 418), {fill: '#fffaf0', seed: 419, lw: 4}); K.stroke([[0, 0], [0, -28]], 4, 420); K.stroke([[0, 0], [20, 0]], 4, 421); K.hand('6:00', 0, 90, 40, INK); g.restore(); }
function setHQ(t) { bg('#e9e0ff'); for (let x = -700; x < 2000; x += 260) DR(K.rr(x, 200, 200, 600, 100), {fill: '#d8ccff', line: false, seed: 430 + x, amp: 0}); floor('#b8a8d8', '#9888b8');
  DR(K.rr(260, 180, 560, 140, 20), {fill: '#2b2b33', seed: 431, lw: 7}); K.hand('WORD HQ', 540, 250, 76, '#ffd23f');
  DR(K.rr(780, 1360, 420, 40, 10), {fill: '#c98a44', seed: 432, lw: 6}); for (const lx of [800, 1180]) K.stroke([[lx, 1400], [lx, 1700]], 8, 433 + lx); DR(P(1000, 1330, 50, 36, 434), {fill: '#fffaf0', seed: 435, lw: 5}); }
function setBus(t) { bg('#bfe4ff'); floor('#9aa0a8', '#7b8088'); DR(K.rr(380, 700, 900, 860, 40), {fill: '#e0303f', shade: '#b8202c', seed: 440, lw: 9}); for (let k = 0; k < 3; k++) DR(K.rr(440 + k * 270, 780, 220, 200, 14), {fill: '#9fd3ff', seed: 441 + k, lw: 6});
  DR(K.rr(470, 1080, 220, 460, 10), {fill: '#2b2b33', seed: 445, lw: 6}); K.hand('BUS', 900, 1180, 90, '#fffaf0'); for (const wx of [600, 1100]) DR(P(wx, 1560, 70, 70, 446 + wx), {fill: '#2b2b33', seed: 447 + wx, lw: 6});
  K.stroke([[-100, 700], [-100, 1600]], 10, 448); DR(P(-100, 680, 50, 50, 449), {fill: '#e0303f', seed: 450, lw: 5}); }
function setOffice(t, lit) { bg('#e3f2e8'); floor('#c9ced6', '#a6adb8'); DR(K.rr(560, 360, 460, 360, 14), {fill: '#fffaf0', seed: 460, lw: 7}); for (let k = 0; k < 4; k++) DR(K.rr(620 + k * 90, 640 - k * 60, 60, 60 + k * 60, 4), {fill: ['#3cb371', '#3d82ee', '#ff8a2a', '#e0303f'][k], seed: 461 + k, lw: 4});
  DR(K.rr(-80, 1300, 600, 40, 10), {fill: '#c98a44', seed: 466, lw: 6}); for (const lx of [-40, 480]) K.stroke([[lx, 1340], [lx, 1700]], 8, 467 + lx); DR(K.rr(120, 1180, 200, 120, 10), {fill: '#3a3a44', seed: 468, lw: 5}); }
function setWed(t) { bg('#fff0f5'); floor('#9fdcb8', '#7fbc98'); g.save(); K.stroke([[200, 1560], [200, 700], [540, 520], [880, 700], [880, 1560]], 14, 470); for (let k = 0; k < 14; k++) { const a = Math.PI + k / 13 * Math.PI; DR(P(540 + Math.cos(a) * 340, 700 + Math.sin(a) * 180, 28, 26, 471 + k), {fill: k % 2 ? '#ff8fb0' : '#fffaf0', seed: 490 + k, lw: 4}); } g.restore(); }
function setBeach(t) { bg('#8fd8ff'); DR(P(820, 380, 90, 90, 500), {fill: '#ffd83a', seed: 501, lw: 6}); DR([[-800, 1100], [2000, 1096], [2000, 1400], [-800, 1404]], {fill: '#3fb5c9', shade: '#2a95a9', seed: 502, lw: 7}); DR([[-800, 1400], [2000, 1396], [2000, 2400], [-800, 2400]], {fill: '#f2d892', shade: '#d8b860', seed: 503, lw: 8});
  K.stroke([[880, 1600], [900, 860]], 9, 504); DR([[640, 900], [900, 780], [1160, 900]], {fill: '#ff6a52', seed: 505, lw: 7}); }
function setFire(t) { bg('#3a1a14'); floor('#5a2a1a', '#3a1a10'); for (let i = 0; i < 9; i++) { const x = -200 + i * 170, h = 400 + Math.sin(t * 8 + i) * 80; DR([[x - 90, 1560], [x - 40, 1560 - h * .6], [x, 1560 - h], [x + 40, 1560 - h * .6], [x + 90, 1560]], {fill: i % 2 ? '#ff8a2a' : '#ffcc12', seed: 510 + i, lw: 5}); } }
function sticker(text, t, t0) { const k = ease((t - t0) / .25); if (k <= 0) return; g.save(); g.translate(540, 300); g.rotate(-.04); g.scale(.7 + .3 * k, .7 + .3 * k); g.globalAlpha = k;
  g.font = `64px ${FONT}`; let f = 64; while (g.measureText(text).width > 840) { f -= 2; g.font = `${f}px ${FONT}`; } const w = g.measureText(text).width + 80;
  DR(K.rr(-w / 2, -60, w, 120, 14), {fill: '#ffe066', shade: '#f0c840', seed: 520, lw: 7}); K.hand(text, 0, 4, f, INK); g.restore(); }
function bandages(x, by) { for (const [dx, dy, w, a] of [[-40, 860, 120, .3], [60, 1300, 140, -.4], [-60, 1100, 100, .5]]) { g.save(); g.translate(x + dx, dy + by); g.rotate(a); DR(K.rr(-w / 2, -16, w, 32, 8), {fill: '#fffaf0', seed: 530 + dx, lw: 4}); g.restore(); } }

// ---------------- people helpers ----------------
const P_ = (id, x, t, who, extra) => { const m = who ? talk(who, t) : 0; F.person(CC[id], {x, by: Math.sin(t * 1.6 + x) * 3 - m * 4, mouth: m, blink: blink(t, (x / 100) | 0), look: '', pose: 'down', mood: 'neutral', poseK: 1, ...(extra || {})}); };
const sh = (x) => K.spot(x, 1712, 140, 22, 'rgba(40,20,10,0.28)');
function lying(id, x, y, t, extra, band) { g.save(); g.translate(x, y); g.rotate(-Math.PI / 2); g.translate(-540, -1700); F.person(CC[id], {x: 540, by: 0, mouth: 0, blink: true, pose: 'down', mood: 'sleepy', poseK: 1, ...(extra || {})}); if (band) bandages(540, 0); g.restore(); }
function aristos(t, mode) { const tea = mode === 'tea'; [['obtain', 260], ['receive', 560], ['become', 860]].forEach(([id, x], i) => { sh(x); P_(id, x, t, id === 'obtain' ? 'o' : null, {pose: tea ? 'hold' : mode === 'shock' ? 'shrug' : 'cross', mood: mode === 'shock' ? 'surprised' : 'smug', look: 'left'}); if (tea) { DR([[x - 30, 1300], [x + 30, 1300], [x + 24, 1350], [x - 24, 1350]], {fill: '#fffaf0', seed: 540 + i, lw: 4}); } }); }

// ---------------- camera ----------------
const C = (z, cx, cy) => ({z, cx, cy});
const CAMS = [[0, C(.95, 540, 1250)], [T('n3') - .2, C(1, 400, 1100)], [T('n4') - .4, C(1, 560, 1040)], [T('o1'), C(1.6, 260, 1000)], [T('b1') - .5, C(1, 500, 1040)], [T('e1') - .5, C(1, 400, 1040)], [T('w1') - .5, C(1, 540, 1040)],
  [T('n5') - .4, C(1, 540, 1040)], [T('n6') - .4, C(1, 560, 1040)], [T('b2') - .4, C(1, 500, 1040)], [T('e3') - .4, C(1, 400, 1040)], [T('w2') - .4, C(1, 540, 1040)], [T('r1'), C(1.7, 720, 1000)], [T('n7'), C(1, 540, 1040)],
  [T('g5') - .7, C(1, 560, 1040)], [T('g6'), C(1.5, 360, 1000)], [T('n8') - .4, C(1, 540, 1100)], [T('g7'), C(1.7, 300, 950)], [T('n9'), C(1, 540, 1100)], [T('f1') - .6, C(1.2, 540, 1040)]];
function camAt(t) { let c = CAMS[0], at = 0; for (const [a, cc] of CAMS) if (t >= a) { c = cc; at = a; } return {z: c.z * (1 + Math.min(t - at, 4) * .012), cx: c.cx, cy: c.cy, at}; }

// ---------------- frame ----------------
function frame(t) {
  const cam = camAt(t), {name: sc, t0} = scAt(t), u = t - t0;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#ffe6b0'; g.fillRect(0, 0, W, H);
  g.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.cx * cam.z, H / 2 - cam.cy * cam.z);
  if (sc === 'amb') { setAmb(t); lying('get', 1000, 1440, t, {}, true); }
  else if (sc === 'title') { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#ffe6b0'; g.fillRect(0, 0, W, H); const k = ease(u / .3); g.save(); g.globalAlpha = k; g.translate(540, 860); g.rotate(-.03);
    DR(K.rr(-440, -200, 880, 400, 44), {fill: '#3d82ee', shade: '#2763cc', seed: 600, lw: 10}); K.hand('ЖИЗНЬ СЛОВА', 0, -60, 116, '#fffaf0'); K.hand('выпуск 1: GET', 0, 70, 76, '#ffe066'); g.restore(); K.hand('18 часов назад…', 540, 1260, 70, INK); }
  else if (sc === 'bed') { setBed(t); const up = ease((t - T('g1') + .1) / .4); if (up < 1) lying('get', 300, 1380, t, {blink: up < .5}); if (up > 0) { sh(380); g.save(); g.globalAlpha = up; P_('get', 380, t, 'g', {pose: t > T('x1') - .2 ? 'presentR' : 'cheer', mood: t > T('x1') ? 'surprised' : 'happy'}); g.restore(); if (t > T('x1') - .2) DR(K.rr(500, 1150, 50, 90, 8), {fill: '#2b2b33', seed: 610, lw: 4}); } }
  else if (sc === 'hq') { setHQ(t); aristos(t, 'tea'); const rx = -300 + (u % 2.2) / 2.2 * 1700; g.save(); g.translate(rx, 0); sh(0); g.restore(); P_('get', rx, t, 'g', {pose: 'cheer', mood: 'surprised', by: -Math.abs(Math.sin(t * 14)) * 20}); }
  else if (sc === 'bus' || sc === 'bus2') { setBus(t); const two = sc === 'bus2', push = !two && t > T('g2') + .3 ? clamp((t - T('g2') - .3) / .5) : 0; sh(240 + push * 340); P_('girl', 240 + push * 340, t, 'b', {pose: two ? 'down' : 'shrug', mood: two ? 'sleepy' : 'surprised', look: 'right'});
    if (!two) { sh(0); P_('get', -20 + push * 300, t, 'g', {pose: 'presentR', mood: 'surprised', look: 'right'}); } else { sh(-60); P_('obtain', -60, t, null, {pose: 'cross', mood: 'smug', look: 'right'}); } }
  else if (sc === 'office' || sc === 'office2') { const two = sc === 'office2'; setOffice(t); const lit = !two && t > T('e2') - .1; if (lit) { spot(300, 640, 120, 120, 'rgba(255,230,120,0.6)'); DR(P(300, 640, 40, 50, 620), {fill: '#ffe066', seed: 621, lw: 5}); }
    sh(300); P_('emp', 300, t, 'e', {pose: lit ? 'cheer' : 'shrug', mood: lit ? 'happy' : two ? 'sleepy' : 'surprised', look: 'right'}); DR(K.rr(-80, 1300, 600, 40, 10), {fill: '#c98a44', seed: 466, lw: 6});
    if (!two) { sh(760); P_('get', 760, t, 'g', {pose: 'pointL', mood: 'happy', look: 'left'}); } else { sh(780); P_('receive', 780, t, null, {pose: 'cross', mood: 'smug', look: 'left'}); } }
  else if (sc === 'wed' || sc === 'wed2') { const two = sc === 'wed2'; setWed(t); sh(540); if (!two) P_('get', 540, t, 'g', {pose: 'cheer', mood: 'happy'}); else P_('become', 540, t, null, {pose: 'presentL', mood: 'smug'});
    sh(260); P_('groom', 260, t, 'w', {pose: two ? 'shrug' : 'cheer', mood: two ? 'surprised' : 'happy', look: 'right'}); sh(820); P_('bride', 820, t, 'r', {pose: two && t > T('r1') - .1 ? 'shrug' : 'down', mood: two && t > T('r1') - .1 ? 'angry' : 'happy', look: 'left'}); }
  else if (sc === 'fall') { setHQ(t); aristos(t, 'tea'); const f = clamp((t - T('n5') - .3) / .5); g.save(); g.translate(1040, 1700); g.rotate(f * 1.5); g.translate(-1040, -1700); P_('get', 1040, t, null, {pose: 'up', mood: f > .5 ? 'sleepy' : 'surprised', blink: f > .5}); g.restore(); if (f >= 1) for (let i = 0; i < 6; i++) spot(1100 + i * 60, 1660 - (t - T('n5') - .8) * 40 * (i % 3), 40, 26, 'rgba(200,190,170,0.5)'); }
  else if (sc === 'hq2') { setHQ(t); aristos(t, 'cross'); lying('get', 1180, 1660, t, {}, true); }
  else if (sc === 'rise') { setHQ(t); aristos(t, t > T('g6') ? 'shock' : 'cross'); const r = ease((t - T('g5') + .7) / .6); sh(360); g.save(); g.globalAlpha = 1; P_('get', 1100 - r * 740, t, 'g', {pose: t > T('g6') ? 'hips' : 'pointR', mood: t > T('g6') ? 'smug' : 'angry', look: 'right'}); bandages(1100 - r * 740, 0); g.restore(); }
  else if (sc === 'beach') { setBeach(t); DR([[180, 1300], [700, 1500], [700, 1540], [160, 1340]], {fill: '#3d82ee', seed: 629, lw: 6}); g.save(); g.translate(600, 1560); g.rotate(-.55); g.translate(-540, -1700); F.person(CC.get, {x: 540, mouth: talk('g', t), blink: blink(t, 1), pose: 'cheer', mood: t > T('g7') - .2 ? 'angry' : 'happy', look: '', poseK: 1}); g.restore();
    if (t > T('g7') - .2) for (let i = 0; i < 3; i++) K.stroke([[360 + i * 14, 820 - i * 26], [400 + i * 14, 810 - i * 26]], 4, 631 + i);
    if (t > T('t1') - .6) { sh(980); P_('tour', 980 + (1 - clamp((t - T('t1') + .6) / .5)) * 300, t, 't', {pose: 'presentL', mood: 'happy', look: 'left'}); } }
  else if (sc === 'fine') { setFire(t); sh(540); P_('fine', 540, t, 'f', {pose: 'presentR', mood: 'happy'}); DR([[700, 1280], [740, 1180], [780, 1280]], {fill: '#ff8fb0', seed: 640, lw: 5}); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(K.PAPER, 0, 0); const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (cam.at > 0 && t - cam.at < .05) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, 0, W, H); }
  for (const id in STICK) if (inW(t, T(id) + .2, E(id) + 1.2)) sticker(STICK[id], t, T(id) + .2);
  SUBY = 1470; if (!NOSUB) for (const id in TXT) if (inW(t, T(id) - .05, E(id) + .5)) subtitle(id, t);
  if (t > END0 - .1) { const k = ease((t - END0) / .35); g.save(); g.globalAlpha = k * .5; g.fillStyle = '#3a2214'; g.fillRect(0, 0, W, H); g.restore(); g.save(); g.globalAlpha = k;
    DR(K.rr(90, 260, 900, 1200, 50), {fill: '#fff8e8', shade: '#f0dfb8', seed: 650, lw: 9}); K.hand('Профессии GET', 540, 360, 90, '#3d82ee');
    [['get up', 'вставать'], ['get on', 'сесть (в транспорт)'], ['get it', 'понять'], ['get married', 'пожениться'], ['get a life', 'займись делом'], ["can't get over", 'не могу налюбоваться']].forEach(([en, ru], q) => { const a = ease((t - END0 - .2 - q * .12) / .25); g.save(); g.globalAlpha = k * a; const y = 450 + q * 130; DR(K.rr(130, y, 820, 110, 24), {fill: q % 2 ? '#fff0b8' : '#e3f4ff', seed: 660 + q, lw: 5}); K.hand(en, 330, y + 56, 54, INK); K.hand(ru, 720, y + 56, 44, '#c0283a'); g.restore(); });
    const a2 = ease((t - END0 - 1.4) / .3); g.globalAlpha = k * a2; K.hand('Следующий выпуск: FINE', 540, 1270, 60, INK); DR(K.rr(330, 1330, 420, 80, 40), {fill: '#ffd83a', seed: 670, lw: 6}); K.hand('СОХРАНИ', 540, 1372, 52, INK); g.restore(); }
  if (t < END0) { g.font = `38px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = 'rgba(30,20,15,0.6)'; g.strokeText('@speak_in_english', W / 2, 1810); g.fillStyle = '#fffaf0'; g.fillText('@speak_in_english', W / 2, 1810); }
}

// ---------------- audio / srt ----------------
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = [];
  for (const id in LN) ev.push([LN[id].file, LN[id].at, 1.0]);
  for (const [, t0] of SC.slice(1)) ev.push([sfx('swipe'), t0, .35]);
  ev.push([sfx('ding'), T('n3') - .2, .5]); ev.push([sfx('ding'), T('n3') + .3, .5]); ev.push([sfx('whoosh'), T('n4') - .3, .5]); ev.push([sfx('whoosh'), T('g2') + .3, .6]); ev.push([sfx('chime'), T('e2') - .1, .6]); ev.push([sfx('chime'), T('w1'), .4]);
  ev.push([sfx('whoosh'), T('n5') + .3, .6]); ev.push([sfx('tap'), T('n5') + .8, 1.0]); ev.push([sfx('scratch'), T('r1'), .6]); ev.push([sfx('pop'), T('g6') + 1.0, .6]); ev.push([sfx('pop'), T('g7') - .2, .6]); ev.push([sfx('ding'), END0, .45]);
  for (const id in STICK) ev.push([sfx('pop'), T(id) + .2, .35]);
  const args = ['-y', '-v', 'error'], fl = []; ev.forEach(([f]) => args.push('-i', f));
  args.push('-stream_loop', '-1', '-i', sfx('theme'), '-f', 'lavfi', '-t', String(TOTAL), '-i', 'anoisesrc=color=brown:amplitude=0.5:sample_rate=44100');
  ev.forEach(([f, at, gn], i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${gn},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`));
  const m = ev.length;
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume='0.12*(1-0.7*between(t,0,${T('n3') - .2}))':eval=frame,afade=t=in:d=0.6,afade=t=out:st=${TOTAL - 1.2}:d=1.2[mus]`);
  fl.push(`[${m + 1}:a]aformat=channel_layouts=stereo,lowpass=f=900,volume='0.10*between(t,${T('f1') - .6},${END0})+0.05*between(t,${T('n8') - .4},${T('f1') - .6})':eval=frame[amb]`);
  fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus][amb]amix=inputs=${m + 2}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(TMP, 'mix.wav'));
  const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } console.log('mix ok', TOTAL.toFixed(2));
}
function srt() {
  const f = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const id in LN) { const [en, ru] = TXT[id]; out += `${++n}\n${f(LN[id].at)} --> ${f(LN[id].end + .2)}\n${en ? en.replace(/\*/g, '') + '\n' + ru : ru}\n\n`; }
  fs.writeFileSync(path.join(OUT, 'word_get_ep1.srt'), out); console.log('srt', n);
}

// ---------------- main ----------------
const cv = K.createCanvas(W, H); K.setG(cv.getContext('2d')); g = K.g;
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'still') { for (const s of a1.split(',')) { frame(parseFloat(s)); fs.writeFileSync(path.join(OUT, `still_${s}.png`), cv.toBuffer('image/png')); } console.log('total', TOTAL.toFixed(2), JSON.stringify(Object.fromEntries(Object.entries(LN).map(([k, v]) => [k, +v.at.toFixed(1)])))); }
else if (mode === 'chunk') {
  const i = +a1, n = +a2, N = Math.ceil(TOTAL * FPS), f0 = Math.floor(N * i / n), f1 = Math.floor(N * (i + 1) / n);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', path.join(TMP, `chunk_${i}.mp4`)]);
  (async () => { for (let f = f0; f < f1; f++) { frame(f / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
  ff.on('close', c => console.log('chunk', i, 'done', c));
}
else if (mode === 'audio') audio();
else if (mode === 'srt') srt();
else if (mode === 'cover') {
  NOSUB = true; frame(parseFloat(a1)); g.setTransform(1, 0, 0, 1, 0, 0);
  g.save(); g.translate(540, 1540); g.rotate(-.03); DR(K.rr(-470, -150, 940, 300, 44), {fill: '#3d82ee', shade: '#2763cc', seed: 999, lw: 10}); K.hand('СЛОВО, КОТОРОЕ', 0, -50, 80, '#fffaf0'); K.hand('работает за всех', 0, 60, 80, '#ffe066'); g.restore();
  fs.writeFileSync(path.join(OUT, 'word_get_ep1_cover.png'), cv.toBuffer('image/png')); console.log('cover');
}
