// «Читаем по цепочке», выпуск 1. Narrator story (format like the.seventh, own flat style).
// node render.js still t | shots | chunk i n | audio | srt | cover
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./flat'), A = require('./people_flat'), CAST = require('./cast'); const {rr, ell, ln, text} = K;
const W = 1080, H = 1920, FPS = 30, D = __dirname, VD = path.join(D, 'voice'), OUT = path.join(D, 'out'), TMP = path.join(OUT, 'tmp'); fs.mkdirSync(TMP, {recursive: true});
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const INK = '#2a1f1d', FONT = 'NL, NC';
let g;
const dur = f => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());
function envelope(f) { const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], {maxBuffer: 1 << 26}).stdout, n = raw.length / 2, per = 8000 / FPS, out = [];
  for (let i = 0; i * per < n; i++) { let s = 0, c = 0; for (let j = Math.floor(i * per); j < Math.min(n, (i + 1) * per); j++) { const v = raw.readInt16LE(j * 2) / 32768; s += v * v; c++; } out.push(Math.sqrt(s / Math.max(1, c))); }
  const srt = [...out].sort((a, b) => a - b), p = srt[Math.floor(srt.length * .93)] || 1; return out.map(v => clamp((v / p - .08) * 1.15)); }
// trim leading/trailing silence so the cut is tight
function trimmed(f) { const o = path.join(TMP, path.basename(f, '.mp3') + '.wav'); if (fs.existsSync(o) && fs.statSync(o).mtimeMs >= fs.statSync(f).mtimeMs && fs.statSync(o).size > 1000) return o; const r = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar', '44100', '-ac', '1', path.join(TMP, path.basename(f, '.mp3') + '.wav'), '-y']); return path.join(TMP, path.basename(f, '.mp3') + '.wav'); }

function person(who, x, y, s, extra = {}) { A.draw(g, {x, y, s, ...CAST[who], ...extra}); }
function teacher(t, x, y, s, extra = {}) { const m = talk('teacher', t); person('teacher', x, y, s, {blink: blink(t, 2), mouth: m, ...extra, mood: m > .12 ? undefined : extra.mood}); }
function hero(t, x, y, s, extra = {}) { const m = inW(t, T('h1'), E('h2')) ? talk('nar', t) : 0; person('hero', x, y, s, {blink: blink(t, 0), mouth: m, ...extra, mood: m > .12 ? undefined : extra.mood}); }
function desk(x, y, w, h, top = '#c98a4a') { rr(x - w / 2, y, w, 34, 10, top, 6); rr(x - w / 2 + 14, y + 30, w - 28, h, 6, '#a86a34', 6); }
function deskBig(y) { rr(-30, y, W + 60, 70, 14, '#c98a4a', 7); rr(-30, y + 66, W + 60, H, 0, '#a86a34', 7); }

// ---------------- backgrounds ----------------
function wall(dark) { g.fillStyle = '#f3ead8'; g.fillRect(0, 0, W, H); g.fillStyle = '#7fb8a8'; g.fillRect(0, 900, W, 400); ln([[0, 900], [W, 900]], 7);
  g.fillStyle = '#d9a066'; g.fillRect(0, 1300, W, 620); ln([[0, 1300], [W, 1300]], 7); for (let x = 0; x < W + 200; x += 170) ln([[x, 1300], [x - 90, H]], 4, 'rgba(42,31,29,0.2)'); }
function board(x, y, w, h, lines) { rr(x - 14, y - 14, w + 28, h + 28, 16, '#8a5a2a', 7); rr(x, y, w, h, 8, '#2f5a46', 6);
  lines.forEach(([s, size, col], i) => text(s, x + w / 2, y + 70 + i * (size + 26), size, col || '#f3f3e8', 'center', FONT)); rr(x + 40, y + h - 6, 120, 18, 6, '#ffffff', 4); }
function darken(a) { g.fillStyle = `rgba(15,10,25,${a})`; g.fillRect(0, 0, W, H); }
function spotlight(x, y, r) { const gr = g.createRadialGradient(x, y, r * .3, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,6,20,0.82)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }

// ---------------- props ----------------
function backpack(x, y, s, col, colS) { g.save(); g.translate(x, y); g.scale(s, s);
  // straps attached to the top of the bag, drawn first so the body overlaps their ends
  g.beginPath(); g.moveTo(-60, -150); g.quadraticCurveTo(0, -230, 60, -150); g.strokeStyle = INK; g.lineWidth = 26; g.stroke(); g.strokeStyle = colS; g.lineWidth = 14; g.stroke();
  rr(-120, -170, 240, 200, 50, col, 7); rr(-80, -60, 160, 80, 20, colS, 6); ln([[-60, -40], [60, -40]], 5); g.restore(); }
function sandwich(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-.15);
  rr(-110, -20, 220, 50, 22, '#e8c27a', 7); rr(-120, -36, 240, 26, 12, '#8fbf4a', 6); rr(-110, -70, 220, 50, 22, '#e8c27a', 7);
  for (const [a, b, r] of [[-60, -50, 16], [20, -40, 20], [70, 0, 14], [-30, 10, 12]]) ell(a, b, r, r * .8, '#7a9a3a', 0);
  for (let i = 0; i < 3; i++) { const u = (t * .8 + i / 3) % 1; g.globalAlpha = Math.sin(u * Math.PI); K.curve([-60 + i * 60, -90 - u * 120], [-40 + i * 60, -120 - u * 120], [-60 + i * 60, -150 - u * 120], 7, '#7a9a3a'); }
  g.restore(); }
function book(x, y, s, title) { g.save(); g.translate(x, y); g.scale(s, s); rr(-170, -120, 340, 230, 14, '#3a6ab8', 8); ln([[0, -118], [0, 108]], 6); text(title || 'ENGLISH', -85, -10, 34, '#ffffff', 'center', FONT); g.restore(); }
function cowboyHat(x, y, s, col = '#8a5a2a') { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.ellipse(0, 0, 230, 46, 0, 0, 7); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  g.beginPath(); g.moveTo(-120, -10); g.quadraticCurveTo(-130, -170, 0, -150); g.quadraticCurveTo(130, -170, 120, -10); g.closePath(); g.fill(); g.stroke(); rr(-122, -50, 244, 30, 8, '#2a1f1d', 0); g.restore(); }

// ---------------- timeline ----------------
const SCRIPT = JSON.parse(fs.readFileSync(path.join(VD, 'script.json'), 'utf8')).lines;
const ORDER = [['n1', .3], ['t1', .15], ['c1', .2], ['n2', .2], ['n3', .3], ['t2', .3], ['n4', .2], ['h1', .1], ['t3', .3], ['n5', .2], ['n6', .25], ['n7', .25], ['n8', .2],
  ['t4', .3], ['h2', .15], ['t5', .25], ['n9', .2], ['n10', .3], ['h3', .15], ['n11', .15], ['t6', .2], ['n12', .3], ['n13', .3], ['s1', .15], ['t7', .35], ['n14', .3], ['n15', .4]];
const LN = {};
{ let t = 0; for (const [id, gap] of ORDER) { const f = trimmed(path.join(VD, id + '.mp3')), d = dur(f); t += gap;
  LN[id] = {id, at: t, dur: d, end: t + d, who: SCRIPT[id][0], env: envelope(f), file: f, text: SCRIPT[id][1].replace(/\[[^\]]*\]\s*/g, '')}; t += d; } }
const T = id => LN[id].at, E = id => LN[id].end, M = (id, k) => T(id) + LN[id].dur * k, inW = (t, a, b) => t >= a && t < b;
const TOTAL = E('n15') + 2.8;
const talk = (who, t) => { for (const id in LN) { const l = LN[id]; if (l.who === who && t >= l.at && t < l.end) { const i = Math.floor((t - l.at) * FPS); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); } } return 0; };
const talkId = (ids, t) => { for (const id of ids) { const l = LN[id]; if (t >= l.at && t < l.end) { const i = Math.floor((t - l.at) * FPS); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); } } return 0; };
const blink = (t, s) => ((t + s * 1.3) % (3.1 + s * .5)) < .12;
const TR = {t1: 'Доброе утро, класс!', c1: 'Доброе утро, учитель!', t2: 'Кто сегодня дежурный?', h1: 'Я сегодня дежурный!', t3: 'Читаем текст. По очереди.', t4: 'Следующий!', t5: 'Thoroughly — «тщательно»',
  h3: 'Можно выйти?', t6: 'Не сейчас. Читай, пожалуйста.', t7: 'Домашка: шестой абзац. Тщательно.'};
const SHOWN = {c1: 'Good mo-o-orning, tea-cher!', h1: 'I am on duty today!', h2: 'Торо… тороугх… сороуглы…', n8: 'Всё сдвинулось. Твой пятый уходит Саше. А тебе — шестой. А в шестом… вот это.'};

// ---------------- shots ----------------
const SH = [[0, 'CLASS_CLOCK'], [T('t1'), 'TEACH'], [T('c1'), 'CLASS_CHORUS'], [T('n2'), 'HOSTAGE'], [T('n3'), 'NAMES'], [T('t2'), 'TEACH_CU'], [T('n4'), 'HERO_AUTO'], [M('h1', .55), 'VOVA_RAG'],
  [T('t3'), 'TEACH'], [T('n5'), 'MATH'], [T('n6'), 'ANTHEM'], [M('n6', .55), 'SLEEP'], [T('n7'), 'CHAIN'], [T('n8'), 'BALLOON'], [M('n8', .78), 'BOSS'],
  [T('t4'), 'TEACH_CU'], [T('h2'), 'HERO_STRUGGLE'], [T('t5'), 'TEACH_CU'], [T('n9'), 'SPIES'], [T('n10'), 'EXIT'], [T('t6'), 'TEACH_SMUG'],
  [T('n12'), 'PODIUM'], [T('n13'), 'CORRIDOR'], [T('s1'), 'SASHA_CU'], [M('s1', .5), 'MAP'], [T('t7'), 'TEACH_SMUG'], [T('n14'), 'MEANING'], [T('n15') - .2, 'END']];
const shotAt = t => { let s = SH[0], i = 0; SH.forEach((q, k) => { if (t >= q[0]) { s = q; i = k; } }); return {kind: s[1], at: s[0], i}; };

// ---------------- people (overrides) ----------------
function hero(t, x, y, s, extra = {}) { const m = talkId(['h1', 'h2', 'h3'], t); person('hero', x, y, s, {blink: blink(t, 0), mouth: m, ...extra, mood: m > .12 ? undefined : extra.mood}); }
function badge(x, y, s, txt) { g.save(); g.translate(x, y); g.scale(s, s); rr(-110, -36, 220, 72, 12, '#ffffff', 6); text(txt, 0, 2, 40, '#c0283a', 'center', FONT); g.restore(); }

// ---------------- scenes ----------------
const BOARD_TXT = [['Good morning!', 64], ['Reading · page 42', 46, '#ffe066']];
function clock(x, y, r, t) { ell(x, y, r, r, '#ffffff', 8); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ln([[x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8], [x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9]], 5); }
  const a = -Math.PI / 2 + Math.floor(t * 2) / 60 * Math.PI * 2; ln([[x, y], [x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8]], 6, '#c0283a'); ln([[x, y], [x, y - r * .5]], 9); ell(x, y, 10, 10, INK, 0); }
// classroom: 3 rows; opts {mode, mouthAll, badges}
function classRoom(t, o = {}) {
  wall(); board(240, 170, 600, 330, [['Good morning!', 54], ['page 42', 40, '#ffe066']]); clock(950, 300, 80, t);
  const rows = [{y: 1100, s: .33, xs: [150, 340, 540, 740, 930], who: ['girl1', 'boy2', 'girl3', 'boy4', 'sasha']}, {y: 1380, s: .45, xs: [130, 400, 680, 950], who: ['boy4', 'girl3', 'boy2', 'girl1']}, {y: 1720, s: .6, xs: [300, 780], who: ['hero', 'vova']}];
  rows.forEach((r, ri) => r.xs.forEach((x, i) => { const who = r.who[i], seed = ri * 7 + i;
    const ex = {seated: true, pose: 'desk', blink: blink(t, seed), mouth: 0, mood: 'flat'};
    if (o.mode === 'chorus') Object.assign(ex, {mouth: .45 + .25 * Math.abs(Math.sin(t * 2 + seed * .3)), mood: 'sleepy'});
    if (o.mode === 'hostage') Object.assign(ex, {mood: 'sad', brows: 'sad'});
    if (o.mode === 'hostage' && ri === 1 && i === 1) Object.assign(ex, {pose: 'wave'});
    person(who, x, r.y + 560 * r.s, r.s, ex);
    if (o.mode === 'hostage' && ri === 1 && i === 1) { const hx = x + 236 * r.s, hy = r.y + 560 * r.s - 1080 * r.s, wv = Math.sin(t * 8) * 8; g.save(); g.translate(hx, hy - 30); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(40, -20 + wv, 90, -6); g.lineTo(84, 50); g.quadraticCurveTo(40, 40 + wv, 0, 56); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.restore(); }
    desk(x, r.y, 230 * r.s * 2.6, 300 * r.s, '#c98a4a'); }));
  if (o.mode === 'hostage') { g.fillStyle = 'rgba(40,40,60,0.35)'; g.fillRect(0, 0, W, H); const k = Math.floor(t * 2) % 2;
    g.save(); g.translate(540, 640); g.rotate(-.03); rr(-330, -70, 660, 140, 16, '#1a1a22', 7); text('ЗАЛОЖНИКИ: 27', 0, 4, 72, k ? '#ff4040' : '#a02020', 'center', FONT); g.restore(); }
}
function sTeach(t, ex = {}) { wall(); board(150, 230, 780, 480, BOARD_TXT); teacher(t, 540, 2180, 1.12, {pose: 'hips', ...ex}); }
function sTeachCU(t, ex = {}) { wall(); board(60, 140, 960, 560, BOARD_TXT); teacher(t, 540, 2700, 1.6, {pose: 'down', ...ex}); }
function sNames(t) { wall(); board(60, 140, 960, 440, [['Michael · Bob · Kate', 56], ['English names', 42, '#ffe066']]);
  hero(t, 300, 2180, 1.0, {pose: 'desk', seated: true, mood: 'flat'}); person('vova', 780, 2180, 1.0, {pose: 'desk', seated: true, blink: blink(t, 4), mood: undefined});
  deskBig(1640); badge(300, 1430, 1.0, 'MICHAEL'); badge(780, 1430, 1.0, 'BOB'); }
function sHeroAuto(t) { wall(); board(60, 140, 960, 560, BOARD_TXT); hero(t, 540, 2560, 1.45, {pose: 'down', mood: 'o', wide: true, brows: 'up'}); deskBig(1660);
  if (inW(t, T('h1'), E('h1'))) { g.save(); g.translate(840, 760); rr(-130, -60, 260, 120, 20, '#ffffff', 6); text('AUTO', 0, 4, 56, '#2f9a5a', 'center', FONT); g.restore(); } }
function sVovaRag(t) { wall(); board(60, 140, 960, 560, [['Who is on duty?', 60]]); person('vova', 540, 2300, 1.25, {pose: 'hold', mood: 'o', wide: true, brows: 'up', blink: false});
  g.save(); g.translate(540, 2300 - 690 * 1.25); g.rotate(Math.sin(t * 6) * .2); rr(-90, -60, 180, 120, 20, '#9ab0c8', 6); for (let i = 0; i < 3; i++) ln([[-70, -30 + i * 30], [70, -30 + i * 30]], 4, '#7a90a8'); g.restore(); }
function math(t) { g.fillStyle = '#2f5a46'; g.fillRect(0, 0, W, H); rr(30, 30, W - 60, 1420, 20, null, 10);
  const L = [['27 учеников − Вова (болеет?)', 54], ['абзацев: 6', 54], ['ты = 5-й ряд × 2-я парта', 50], ['= абзац № 5', 76, '#ffe066'], ['5 = 5 = 5', 60]];
  L.forEach(([s, f, c], i) => { const k = ease((t - T('n5') - i * .35) / .3); g.globalAlpha = k; text(s, 540, 200 + i * 230, f, c || '#f3f3e8', 'center', FONT); }); g.globalAlpha = 1;
  K.curve([200, 1000], [540, 1200], [860, 1000], 7, '#f3f3e8'); }
function anthem(t, sleep) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sleep ? '#2a2a5a' : '#ffe9a0'); gr.addColorStop(1, sleep ? '#1a1a3a' : '#ffd060'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (!sleep) for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t * .3; g.beginPath(); g.moveTo(540, 700); g.arc(540, 700, 1500, a, a + .13); g.closePath(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill(); }
  g.save(); g.translate(540, 470); g.rotate(-.02); rr(-420, -230, 840, 460, 20, '#fffdf5', 8); text('Paragraph 5', 0, -160, 50, '#c0283a', 'center', FONT);
  ['London is the capital', 'of Great Britain.', 'It is a very big', 'and beautiful city…'].forEach((s, i) => text(s, 0, -70 + i * 70, 50, INK, 'center', FONT)); g.restore();
  hero(t, 540, 2700, 1.45, sleep ? {pose: 'down', blink: true, mood: 'flat', mouth: .3 + .2 * Math.abs(Math.sin(t * 5))} : {pose: 'hold', mood: undefined, mouth: .3 + .3 * Math.abs(Math.sin(t * 6)), brows: 'up'});
  if (sleep) for (let i = 0; i < 3; i++) { const u = (t * .6 + i / 3) % 1; g.globalAlpha = Math.sin(u * Math.PI); text('Z', 800 + u * 80, 1050 - u * 260, 60 + i * 16, '#ffffff', 'center', FONT); g.globalAlpha = 1; } }
function chain(t) { wall(); const xs = [140, 340, 540, 740, 940], who = ['girl1', 'boy2', 'vova', 'sasha', 'hero'];
  const dt = LN.n7.dur, prog = (t - T('n7')) / dt, zoom = prog > .62, active = prog < .25 ? 0 : prog < .5 ? 1 : 2;
  const before = ['1', '2', '3', '4', '5'], after = ['1', '2', '3+4', '5', '6'];
  xs.forEach((x, i) => { const s = .3; person(who[i], x, 1500, s, {pose: 'desk', seated: true, blink: blink(t, i), mood: i === 4 && zoom ? 'o' : 'flat', wide: i === 4 && zoom, sweat: i === 4 && zoom});
    desk(x, 1500 - 600 * s, 170, 220, '#c98a4a');
    const lab = zoom ? after[i] : before[i], hot = i === active || (zoom && i === 2);
    rr(x - 66, 820, 132, 96, 18, hot ? '#ffe066' : '#ffffff', 6); text(lab, x, 870, lab.length > 1 ? 44 : 64, i === 4 ? '#c0283a' : INK, 'center', FONT);
    if (i === 4) text('ТЫ', x, 960, 40, '#c0283a', 'center', FONT); });
  if (zoom) { for (let i = 0; i < 6; i++) ln([[420 + i * 6, 1250 + i * 22], [488, 1250 + i * 22]], 7, '#3a6ab8'); g.save(); g.translate(540, 520); g.rotate(-.04); rr(-300, -70, 600, 140, 20, '#c0283a', 7); text('БОБ РАЗОГНАЛСЯ', 0, 4, 60, '#ffffff', 'center', FONT); g.restore(); } }
function balloon(t) { g.fillStyle = '#bfe3ff'; g.fillRect(0, 0, W, H); const u = clamp((t - T('n8')) / 2.5), bx = 540 + u * 260, by = 900 - u * 700;
  ln([[bx, by + 160], [540 + u * 60, 1330]], 4); ell(bx, by, 150, 180, '#c0283a', 8); text('5', bx, by, 190, '#ffffff', 'center', FONT);
  hero(t, 540, 2700, 1.45, {pose: 'down', mood: 'sad', brows: 'sad'}); }
function boss(t) { g.fillStyle = '#3a0a14'; g.fillRect(0, 0, W, H); const k = ease((t - M('n8', .78)) / .4), sh = Math.sin(t * 40) * 4;
  text('BOSS', 540, 300, 70, '#ff6060', 'center', FONT); rr(190, 380, 700, 50, 20, '#2a0a0a', 6); rr(196, 386, 688, 38, 16, '#e03030', 0);
  g.save(); g.translate(540 + sh, 800); g.scale(.6 + .4 * k, .6 + .4 * k); bold('thoroughly', 0, 0, 170, '#ffd23f'); g.restore();
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t; ln([[540 + Math.cos(a) * 560, 800 + Math.sin(a) * 420], [540 + Math.cos(a) * 640, 800 + Math.sin(a) * 480]], 8, '#ff9050'); } }
function sHeroStruggle(t) { wall(); board(60, 140, 960, 560, [['thoroughly', 90, '#ffe066']]); hero(t, 540, 2560, 1.45, {pose: 'hold', sweat: true, brows: 'up'}); deskBig(1660); book(540, 1600, 1.0, 'ENGLISH');
  ['th', 'o', 'r', 'ough', 'ly'].forEach((s, i) => { const a = t * 1.5 + i * 1.25; text(s, 540 + Math.cos(a) * 380, 900 + Math.sin(a) * 140, 54, '#c0283a', 'center', FONT); }); }
function spies(t) { g.fillStyle = '#20242e'; g.fillRect(0, 0, W, H); spotlight(540, 760, 700);
  const parts = [['thorou', '#ffffff'], ['gh', '#ffd23f'], ['ly', '#ffffff']]; g.font = `150px ${FONT}`; let x = 540 - g.measureText('thoroughly').width / 2;
  parts.forEach(([s, c]) => { g.font = `150px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = c; g.fillText(s, x, 760); const w = g.measureText(s).width;
    if (s === 'gh') { rr(x - 6, 640, w + 12, 40, 14, '#111111', 0); ln([[x + w / 2 - 6, 660], [x + w / 2 + 6, 660]], 5, '#111111'); text('молчим', x + w / 2, 920, 48, '#ffd23f', 'center', FONT); }
    x += w; });
  text('gh — не читается', 540, 1150, 60, '#ffffff', 'center', FONT); text('th — язык между зубами', 540, 1240, 52, '#bfe9ff', 'center', FONT); }
function exitScene(t) { wall(); rr(700, 260, 300, 1100, 8, '#8a5a2a', 7); rr(730, 180, 240, 70, 10, '#2f9a5a', 6); const k = Math.floor(t * 3) % 2; text('EXIT', 850, 217, 52, k ? '#ffffff' : '#c8ffd8', 'center', FONT);
  hero(t, 380, 2400, 1.25, {pose: inW(t, T('h3'), E('h3')) ? 'wave' : 'down', mood: inW(t, T('n11'), E('n11')) ? undefined : 'flat', brows: 'up'});
  if (inW(t, T('n10'), E('n10'))) { g.save(); g.translate(540, 380); g.rotate(-.03); rr(-300, -70, 600, 140, 20, '#ffe066', 7); text('ПЛАН Б', 0, 4, 76, INK, 'center', FONT); g.restore(); } }
function podium(t) { g.fillStyle = '#2a2a50'; g.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { const x = (i * 97 + t * 120) % W, y = (i * 211 + t * 260) % 1400; rr(x, y, 14, 24, 3, ['#ffd23f', '#e03050', '#4ab0e0', '#7ad060'][i % 4], 0); }
  rr(340, 1260, 400, 300, 10, '#f0c040', 8); text('1', 540, 1400, 120, INK, 'center', FONT);
  person('sasha', 540, 1270, .7, {pose: 'wave', mood: undefined, blink: blink(t, 5)}); ell(540, 1270 - 820 * .7, 46, 46, '#ffd23f', 6); text('5', 540, 1270 - 820 * .7, 54, INK, 'center', FONT);
  hero(t, 900, 1700, .55, {pose: 'down', mood: 'sad', brows: 'sad'}); }
function corridor(t) { g.fillStyle = '#e8e0d0'; g.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { rr(-20 + i * 190, 300, 170, 1000, 10, '#6a8ab8', 7); ell(-20 + i * 190 + 140, 800, 10, 10, '#d0d8e8', 4); }
  g.fillStyle = '#c9ced6'; g.fillRect(0, 1300, W, 620); ln([[0, 1300], [W, 1300]], 7);
  hero(t, 330, 1850, .78, {pose: 'shrug', mood: 'o', wide: true, brows: 'up'}); person('sasha', 760, 1850, .78, {pose: 'down', blink: blink(t, 5), mouth: talk('sasha', t), mood: 'flat'}); }
function sSashaCU(t) { g.fillStyle = '#e8e0d0'; g.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) rr(-20 + i * 190, 300, 170, 1000, 10, '#6a8ab8', 7); g.fillStyle = '#c9ced6'; g.fillRect(0, 1300, W, 620);
  const m = talk('sasha', t); person('sasha', 540, 2560, 1.45, {pose: 'down', blink: blink(t, 5), mouth: m, mood: m > .12 ? undefined : 'flat', brows: 'up'}); }
function mapScene(t) { g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, W, H); rr(80, 160, 920, 1240, 24, '#f8f0dc', 8); text('ПЛАН САШИ', 540, 250, 64, '#2f4a7a', 'center', FONT);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = 220 + c * 320, y = 420 + r * 280; rr(x - 110, y - 50, 220, 100, 12, '#c98a4a', 5); }
  const vx = 540, vy = 700; g.beginPath(); g.arc(vx, vy, 170, 0, 7); g.fillStyle = 'rgba(224,48,48,0.25)'; g.fill(); g.setLineDash([18, 12]); g.strokeStyle = '#e03030'; g.lineWidth = 6; g.stroke(); g.setLineDash([]);
  text('ВОВА', vx, vy, 52, '#e03030', 'center', FONT); text('зона турбулентности', vx, vy + 220, 44, '#e03030', 'center', FONT);
  ln([[220, 1000], [540, 1180], [860, 1000]], 7, '#2f4a7a'); text('учить на один дальше', 540, 1280, 50, '#2f4a7a', 'center', FONT); }
function meaning(t) { g.fillStyle = '#ffe9c4'; g.fillRect(0, 0, W, H); rr(90, 260, 900, 960, 40, '#ffffff', 8);
  bold('thoroughly', 540, 450, 120, '#ffd23f'); text('звучит: «ТхА-рэ-ли»', 540, 600, 60, '#2f4a7a', 'center', FONT); text('= тщательно', 540, 740, 80, INK, 'center', FONT);
  person('sasha', 540, 1210, .32, {pose: 'wave', blink: blink(t, 5)}); }
function endCard(t) { g.fillStyle = '#2f5a46'; g.fillRect(0, 0, W, H); const k = ease((t - T('n15') + .2) / .35); g.save(); g.globalAlpha = k;
  rr(60, 180, 960, 1260, 46, '#ffffff', 8); text('Как говорят на самом деле', 540, 280, 54, '#e03030', 'center', FONT);
  const rows = [['May I go out?', 'Can I go to the bathroom?', 'Можно выйти?'], ['on duty', 'на дежурстве (врач, полиция)', 'в классе: Whose turn is it?'], ['thoroughly', '«ТхА-рэ-ли» — тщательно', 'gh не читается']];
  rows.forEach(([a, b, c], i) => { const y = 420 + i * 300, q = ease((t - T('n15') - i * .15) / .3); g.globalAlpha = k * q; text(a, 540, y, 60, '#888888', 'center', FONT); if (i === 0) ln([[300, y], [780, y]], 5, '#e03030'); text(b, 540, y + 80, i === 0 ? 58 : 50, '#2f4a7a', 'center', FONT); text(c, 540, y + 150, 42, '#555555', 'center', FONT); });
  g.globalAlpha = k; rr(330, 1300, 420, 90, 45, '#ffe066', 6); text('ПОДПИШИСЬ', 540, 1346, 52, INK, 'center', FONT); g.restore(); }

const CAPY = 1560;
function chunks(id) { const l = LN[id]; if (l.ch) return l.ch; const s = SHOWN[id] || l.text, ws = s.split(' '), out = []; let cur = '';
  for (const w of ws) { const q = cur ? cur + ' ' + w : w; if (cur && (q.length > 24 || /[.?!…:]$/.test(cur))) { out.push(cur); cur = w; } else cur = q; } out.push(cur);
  const total = out.reduce((a, c) => a + c.length, 0); let acc = 0; l.ch = out.map(c => { const o = {s: acc / total * l.dur, txt: c}; acc += c.length; return o; }); return l.ch; }
function bold(s, x, y, size, fill) { g.font = `${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  let f = size; while (g.measureText(s).width > 980 && f > 40) { f -= 4; g.font = `${f}px ${FONT}`; } g.lineWidth = f * .24; g.strokeStyle = '#000000'; g.strokeText(s, x, y); g.fillStyle = fill; g.fillText(s, x, y); }
function captions(t, sh) {
  for (const id in LN) { const l = LN[id]; if (!inW(t, l.at, l.end + .2)) continue; if (id === 'n14') continue;
    const ch = chunks(id); let c = ch[0]; for (const q of ch) if (t - l.at >= q.s - .03) c = q;
    const en = /[A-Za-z]/.test(c.txt), pop = 1 + .1 * (1 - ease((t - l.at - c.s) / .1)), y = sh.kind === 'TH_CARD' || sh.kind === 'END' ? 1640 : CAPY;
    g.save(); g.translate(540, y); g.scale(pop, pop); bold(c.txt, 0, 0, 76, en ? '#ffd23f' : '#ffffff'); g.restore();
    if (TR[id] && en) bold(TR[id], 540, y + 84, 46, '#bfe9ff'); }
}

// ---------------- frame ----------------
function frame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); const sh = shotAt(t), k = sh.kind, push = 1 + Math.min(t - sh.at, 4) * .015;
  g.save(); g.translate(540, 900); g.scale(push, push); g.translate(-540, -900);
  const S = {
    CLASS_CLOCK: () => classRoom(t, {}), TEACH: () => sTeach(t), CLASS_CHORUS: () => classRoom(t, {mode: 'chorus'}), HOSTAGE: () => classRoom(t, {mode: 'hostage'}),
    NAMES: () => sNames(t), TEACH_CU: () => sTeachCU(t, {mood: inW(t, T('t5'), E('t5')) ? 'flat' : undefined, brows: inW(t, T('t4'), E('t4')) ? 'angry' : undefined}),
    HERO_AUTO: () => sHeroAuto(t), VOVA_RAG: () => sVovaRag(t), MATH: () => math(t), ANTHEM: () => anthem(t, false), SLEEP: () => anthem(t, true), CHAIN: () => chain(t),
    BALLOON: () => balloon(t), BOSS: () => boss(t), HERO_STRUGGLE: () => sHeroStruggle(t), SPIES: () => spies(t), EXIT: () => exitScene(t),
    TEACH_SMUG: () => sTeachCU(t, {mood: 'flat', brows: 'up'}), PODIUM: () => podium(t), CORRIDOR: () => corridor(t), SASHA_CU: () => sSashaCU(t), MAP: () => mapScene(t),
    MEANING: () => meaning(t), END: () => endCard(t)};
  S[k](); g.restore();
  if (t - sh.at < .05 && sh.i > 0) { g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(0, 0, W, H); }
  if (k !== 'END') captions(t, sh);
}
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = [];
  for (const id in LN) ev.push([LN[id].file, LN[id].at, 1.0]);
  SH.forEach(([at], i) => { if (i) ev.push([sfx('swipe'), at - .04, .16]); });
  for (let i = 0; i < 6; i++) ev.push([sfx('tap'), T('n1') + i * .5, .3]);
  ev.push([sfx('ding'), T('n2') + .2, .4]); ev.push([sfx('pop'), M('h1', .1), .5]); ev.push([sfx('chime'), T('n6'), .5]);
  ev.push([sfx('whoosh'), M('n7', .62), .8]); ev.push([sfx('whoosh'), T('n8') + .3, .5]); ev.push([sfx('scratch'), M('n8', .78), .6]);
  ev.push([sfx('pop'), T('n10'), .5]); ev.push([sfx('chime'), T('n12'), .6]); ev.push([sfx('coin'), T('n12') + .5, .5]); ev.push([sfx('ding'), T('n14'), .5]); ev.push([sfx('ding'), T('n15'), .45]);
  const args = ['-y', '-v', 'error'], fl = []; ev.forEach(([f]) => args.push('-i', f)); args.push('-stream_loop', '-1', '-i', sfx('music'));
  ev.forEach(([f, at, gn], i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${gn},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`));
  const m = ev.length, quiet = [[M('n8', .78), E('n8') + .4], [T('n14'), E('n14')]].map(([a, b]) => `(1-0.7*between(t,${a},${b}))`).join('*');
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume='0.14*${quiet}':eval=frame,afade=t=in:d=0.3,afade=t=out:st=${TOTAL - 1.5}:d=1.5[mus]`);
  fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus]amix=inputs=${m + 1}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(TMP, 'mix.wav'));
  const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } console.log('mix ok', TOTAL.toFixed(2));
}
function srt() { const f = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const id in LN) { out += `${++n}\n${f(LN[id].at)} --> ${f(LN[id].end + .2)}\n${SHOWN[id] || LN[id].text}${TR[id] ? '\n' + TR[id] : ''}\n\n`; }
  fs.writeFileSync(path.join(OUT, 'one_by_one_ep1.srt'), out); console.log('srt', n); }
const cv = K.createCanvas(W, H); g = cv.getContext('2d'); K.setG(g);
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'still') { for (const s of a1.split(',')) { frame(parseFloat(s)); fs.writeFileSync(path.join(OUT, `still_${s}.png`), cv.toBuffer('image/png')); } console.log('total', TOTAL.toFixed(2)); }
else if (mode === 'shots') { console.log(SH.map(([a], i) => ((SH[i + 1] ? SH[i + 1][0] : TOTAL) + a) / 2).map(v => v.toFixed(2)).join(',')); }
else if (mode === 'chunk') {
  const i = +a1, n = +a2, N = Math.ceil(TOTAL * FPS), f0 = Math.floor(N * i / n), f1 = Math.floor(N * (i + 1) / n);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', path.join(TMP, `chunk_${i}.mp4`)]);
  (async () => { for (let f = f0; f < f1; f++) { frame(f / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })().catch(e => { console.error('FRAME ERROR', e); process.exit(1); });
  ff.on('close', c => console.log('chunk', i, 'done', c));
}
else if (mode === 'audio') audio();
else if (mode === 'srt') srt();
else if (mode === 'cover') {
  g.setTransform(1, 0, 0, 1, 0, 0); wall(); board(60, 560, 960, 300, []); hero(0, 540, 2900, 1.75, {pose: 'down', mood: 'o', wide: true, blink: false, brows: 'up', sweat: true}); deskBig(1760);
  rr(170, 600, 220, 220, 30, '#ffffff', 8); text('5', 280, 712, 170, INK, 'center', FONT); ln([[190, 800], [370, 620]], 16, '#e03030'); ln([[430, 710], [640, 710]], 12, '#ffffff'); ln([[600, 670], [645, 710], [600, 750]], 12, '#ffffff');
  rr(690, 600, 220, 220, 30, '#ffe066', 8); text('6', 800, 712, 170, '#c0283a', 'center', FONT);
  const big = (s, y, size, fill) => { g.font = `${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; let f = size; while (g.measureText(s).width > 1010) { f -= 4; g.font = `${f}px ${FONT}`; }
    g.fillStyle = '#000'; g.fillText(s, 546, y + 10); g.lineWidth = f * .26; g.strokeStyle = '#000'; g.strokeText(s, 540, y); g.fillStyle = fill; g.fillText(s, 540, y); };
  big('КАКОЙ АБЗАЦ', 230, 120, '#ffffff'); big('МОЙ?!', 400, 190, '#ffd23f');
  fs.writeFileSync(path.join(OUT, 'one_by_one_ep1_cover.png'), cv.toBuffer('image/png')); console.log('cover');
}
