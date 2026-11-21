// «Тебя вызвали читать по-английски», выпуск 1. Flat style (people_flat.js), narrator story format:
// a new shot every 1.5–3 s, visual metaphors (roulette, western duel), captions in the lower third (never over faces).
// node render.js still t1,t2 | chunk i n | audio | srt | cover
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./flat'), A = require('./people_flat'), CAST = require('./cast_read'); const {rr, ell, ln, text} = K;
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

// ---------------- timeline ----------------
const SCRIPT = JSON.parse(fs.readFileSync(path.join(VD, 'script.json'), 'utf8')).lines;
const ORDER = [['n1', .3], ['t1', .1], ['n2', .35], ['n3', .2], ['n4', .25], ['n5', .35], ['n6', .2], ['n7', .25], ['t2', .3], ['v1', .3], ['n8', .4], ['t3', .2], ['n9', .3], ['n10', .25],
  ['t4', .5], ['n11', .3], ['h1', .15], ['t5', .15], ['h2', .15], ['t6', .15], ['n12', .3], ['n13', .4], ['t7', .3], ['n14', .5]];
const LN = {};
{ let t = 0; for (const [id, gap] of ORDER) { const f = trimmed(path.join(VD, id + '.mp3')), d = dur(f); t += gap;
  LN[id] = {id, at: t, dur: d, end: t + d, who: SCRIPT[id][0], env: envelope(f), file: f, text: SCRIPT[id][1].replace(/\[[^\]]*\]\s*/g, '')}; t += d; } }
const T = id => LN[id].at, E = id => LN[id].end, M = (id, k) => T(id) + LN[id].dur * k, inW = (t, a, b) => t >= a && t < b;
const TOTAL = E('n14') + 2.6;
const talk = (who, t) => { for (const id in LN) { const l = LN[id]; if (l.who === who && t >= l.at && t < l.end) { const i = Math.floor((t - l.at) * FPS); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); } } return 0; };
const blink = (t, s) => ((t + s * 1.3) % (3.1 + s * .5)) < .12;
const TR = {t1: 'Кто хочет почитать?', t2: 'Вова. Читай, пожалуйста.', t3: 'Не «зе». THE. Язык между зубами.', t4: 'А теперь… ты.', t5: 'Work — работать', t6: 'WORK!', t7: 'Домашка: прочитать текст. Вслух. На видео.'};
const SHOWN = {v1: 'Зе кэт… из он… зе тейбл.', h1: 'Ворк.', h2: 'Ворк!', t3: 'Not «zeh». THE. Tongue between your teeth.', t4: 'And now… you.'};

// ---------------- shots ----------------
const SH = [[0, 'TEACH'], [T('t1'), 'TEACH_CU'], [T('n2'), 'CLASS_DEAD'], [T('n3'), 'CLASS_BAGS'], [T('n4'), 'HERO_SANDWICH'], [T('n5'), 'JOURNAL'], [T('n6'), 'ROULETTE'],
  [T('n7'), 'JOURNAL_STOP'], [M('n7', .62), 'VOVA_SHOCK'], [T('t2'), 'TEACH_CU'], [T('v1'), 'VOVA_READ'], [T('n8'), 'TEACH_PAIN'], [T('t3'), 'TEACH_CU'], [M('t3', .45), 'TH_CARD'],
  [T('n9'), 'CLASS_TONGUES'], [T('n10'), 'DIRECTOR'], [T('t4'), 'TEACH_DARK'], [T('n11'), 'HERO_BOOK'], [T('t5'), 'TEACH_CU'], [T('h2'), 'HERO_BOOK'], [T('t6'), 'TEACH_ANGRY'],
  [T('n12'), 'WESTERN'], [T('n13'), 'BELL'], [M('n13', .6), 'HERO_SAVED'], [T('t7'), 'TEACH_SMUG'], [M('t7', .62), 'PHONE'], [T('n14') - .2, 'END']];
const shotAt = t => { let s = SH[0], i = 0; SH.forEach((q, k) => { if (t >= q[0]) { s = q; i = k; } }); return {kind: s[1], at: s[0], i}; };

// ---------------- people ----------------
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

// ---------------- scenes ----------------
const BOARD_TXT = [['Reading', 70], ['page 42', 54, '#ffe066']];
function sTeach(t) { wall(); board(150, 230, 780, 480, BOARD_TXT); teacher(t, 540, 2180, 1.12, {pose: 'hips'}); }
function sTeachCU(t, ex = {}) { wall(); board(60, 140, 960, 560, BOARD_TXT); teacher(t, 540, 2700, 1.6, {pose: 'down', ...ex}); }
function classRoom(t, mode) {
  wall(); board(240, 170, 600, 330, [['Reading', 58], ['page 42', 44, '#ffe066']]);
  // door on the right wall (director scene opens it)
  rr(900, 520, 200, 780, 8, '#b07a42', 7);
  const rows = [{y: 1100, s: .33, xs: [150, 340, 540, 740, 930], who: ['girl1', 'boy2', 'girl3', 'boy4', 'girl1']}, {y: 1380, s: .45, xs: [130, 400, 680, 950], who: ['boy4', 'girl3', 'boy2', 'girl1']}, {y: 1720, s: .6, xs: [300, 780], who: ['hero', 'vova']}];
  rows.forEach((r, ri) => r.xs.forEach((x, i) => { const who = r.who[i], seed = ri * 7 + i;
    const ex = {seated: true, pose: 'desk', blink: blink(t, seed), mouth: 0};
    if (mode === 'dead') Object.assign(ex, {mood: 'sleepy', brows: 'sad'});
    if (mode === 'tongues') Object.assign(ex, {tongue: true, wide: true});
    if (mode !== 'bags') person(who, x, r.y + 560 * r.s, r.s, ex);
    else { const bob = Math.sin(t * 9 + seed) * 6; ell(x, r.y + 60 * r.s + bob, 70 * r.s * 2, 40 * r.s * 2, CAST[who].pal.hair || '#7a3a1e', 6); }
    desk(x, r.y, 230 * r.s * 2.6, 300 * r.s, '#c98a4a');
    if (mode === 'bags') { const bob = Math.sin(t * 9 + seed) * 8; backpack(x + bob, r.y + 4, r.s * 1.5, ['#e0503a', '#3a7ad0', '#f0b030', '#4aa070'][seed % 4], ['#b8382a', '#2a5aa8', '#c88a18', '#357a54'][seed % 4]); }
  }));
  if (mode === 'dead') { g.fillStyle = 'rgba(60,60,80,0.45)'; g.fillRect(0, 0, W, H); }
}
function sHeroSandwich(t) { wall(); hero(t, 540, 2560, 1.45, {pose: 'wave', mood: 'o', wide: true, brows: 'up'}); deskBig(1660); sandwich(540 + 236 * 1.45, 2560 - 1120 * 1.45, 1.1, t); }
function journal(t, stopK) { g.fillStyle = '#c98a4a'; g.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 90) ln([[0, y], [W, y + 20]], 3, 'rgba(42,31,29,0.15)');
  g.save(); g.translate(540, 760); g.rotate(-.03); rr(-430, -560, 860, 1120, 16, '#fffdf5', 8); text('ЖУРНАЛ · 7 «Б»', 0, -480, 50, '#2f4a7a', 'center', FONT); ln([[-380, -430], [380, -430]], 5, '#2f4a7a');
  const names = ['Алексеев Дима', 'Белова Катя', 'Гусев Артём', 'Зайцева Лиза', 'Иванов Миша', 'Морозова Аня', 'Петров Вова', 'Смирнова Оля', 'Тихонов Саша'];
  names.forEach((n, i) => { const y = -370 + i * 92; if (i === 6 && stopK > 0) rr(-400, y - 38, 800, 76, 12, '#ffe066', 0); text(`${i + 1}. ${n}`, -360, y, 46, INK, 'left', FONT); ln([[-380, y + 40], [380, y + 40]], 2, '#c8d0e0'); });
  // the pen slides down the list (top to bottom) and stops on Vova
  const run = stopK > 0 ? 6 : clamp((t - T('n5')) / Math.max(1, LN.n5.dur + LN.n6.dur)) * 8.2, jitter = stopK > 0 ? 0 : Math.sin(t * 30) * 4, py = -370 + run * 92 + jitter;
  g.save(); g.translate(300, py); g.rotate(-.7); rr(-14, -260, 28, 240, 10, '#2f6ad0', 6); g.beginPath(); g.moveTo(-14, -22); g.lineTo(14, -22); g.lineTo(0, 16); g.closePath(); g.fillStyle = '#f2dcb0'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.restore();
  g.restore(); }
function roulette(t) { g.fillStyle = '#1f5a3a'; g.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(0, i * 48, W, 24); }
  const cx = 540, cy = 760, R = 430, n = 12, rot = (t - T('n6')) * 2.6;
  ell(cx, cy, R + 40, R + 40, '#6a3a1a', 8); const names = ['Дима', 'Катя', 'Артём', 'Лиза', 'Миша', 'Аня', 'Вова', 'Оля', 'Саша', 'ТЫ', 'Ира', 'Глеб'];
  for (let i = 0; i < n; i++) { const a0 = rot + i / n * Math.PI * 2, a1 = a0 + Math.PI * 2 / n; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a1); g.closePath(); g.fillStyle = names[i] === 'ТЫ' ? '#e0a020' : i % 2 ? '#c0283a' : '#222228'; g.fill(); g.strokeStyle = '#e8d8a0'; g.lineWidth = 4; g.stroke();
    const am = (a0 + a1) / 2; g.save(); g.translate(cx + Math.cos(am) * R * .7, cy + Math.sin(am) * R * .7); g.rotate(am + Math.PI / 2); text(names[i], 0, 0, 40, '#ffffff', 'center', FONT); g.restore(); }
  ell(cx, cy, 90, 90, '#e8c060', 7); ell(cx, cy, 30, 30, '#8a5a2a', 5);
  const ba = -rot * 1.7; ell(cx + Math.cos(ba) * (R - 40), cy + Math.sin(ba) * (R - 40), 22, 22, '#ffffff', 5);
  text('СТАВКА:', 540, 1290, 56, '#ffe066', 'center', FONT); text('твоя жизнь', 540, 1360, 64, '#ffffff', 'center', FONT); }
function sVova(t, mode) { wall(); board(60, 140, 960, 560, BOARD_TXT);
  const m = talk('vova', t); person('vova', 540, 2560, 1.45, {blink: blink(t, 4), mouth: m, pose: mode === 'read' ? 'hold' : 'down', mood: m > .12 ? undefined : 'o', wide: true, sweat: true, brows: 'up'});
  deskBig(1660); if (mode === 'read') book(540, 1600, 1.0, 'ENGLISH'); }
function sTeachPain(t) { wall(); board(60, 140, 960, 560, BOARD_TXT); const sh = Math.sin(t * 60) * 6; teacher(t, 540 + sh, 2700, 1.6, {pose: 'down', blink: true, mood: 'flat', brows: 'sad'});
  for (let i = 0; i < 3; i++) { const a = -2.4 + i * .3; ln([[540 + Math.cos(a) * 330, 1000 + Math.sin(a) * 330], [540 + Math.cos(a) * 400, 1000 + Math.sin(a) * 400]], 9); ln([[540 - Math.cos(a) * 330, 1000 + Math.sin(a) * 330], [540 - Math.cos(a) * 400, 1000 + Math.sin(a) * 400]], 9); } }
function thCard(t) { g.fillStyle = '#ffe9c4'; g.fillRect(0, 0, W, H); rr(90, 180, 900, 1180, 40, '#ffffff', 8);
  text('TH', 540, 330, 140, '#e0303f', 'center', FONT); text('язык между зубами', 540, 450, 56, INK, 'center', FONT);
  // mouth diagram: lips, teeth, tongue tip sticking out between the teeth
  g.save(); g.translate(540, 820); ell(0, 0, 300, 190, '#e88a8a', 8); ell(0, 0, 240, 130, '#7a2230', 7);
  rr(-200, -128, 400, 70, 16, '#ffffff', 6); rr(-200, 58, 400, 70, 16, '#ffffff', 6);
  const k = .6 + .4 * Math.abs(Math.sin(t * 3)); g.beginPath(); g.moveTo(-110, -40); g.quadraticCurveTo(0, -60, 110, -40); g.lineTo(110, 40); g.quadraticCurveTo(0, 60 + 80 * k, -110, 40); g.closePath(); g.fillStyle = '#f07a8a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.restore();
  text('the · think · thank you', 540, 1150, 54, '#2f4a7a', 'center', FONT); text('не «зе», не «сэнк»', 540, 1240, 48, '#888888', 'center', FONT); }
function sDirector(t) { g.fillStyle = '#f3ead8'; g.fillRect(0, 0, W, H); const k = ease((t - T('n10')) / .5);
  rr(140, 200, 800, 1500, 10, '#5a3a22', 8); g.fillStyle = '#2a2030'; g.fillRect(150, 210, 780, 1480);
  person('director', 540, 2400, 1.25, {pose: 'down', mood: 'o', wide: true, blink: false, brows: 'up', sweat: true});
  g.save(); g.translate(150, 200); g.scale(1 - k * .85, 1); rr(0, 0, 790, 1500, 8, '#b07a42', 8); ell(700, 760, 24, 24, '#e8c060', 5); g.restore();
  g.fillStyle = '#d9a066'; g.fillRect(0, 1700, W, 220); ln([[0, 1700], [W, 1700]], 7); }
function sHeroBook(t, ex = {}) { wall(); board(60, 140, 960, 560, BOARD_TXT); hero(t, 540, 2560, 1.45, {pose: 'hold', ...ex}); deskBig(1660); book(540, 1600, 1.0, 'ENGLISH'); }
function western(t) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#f6a24a'); gr.addColorStop(.6, '#f8d08a'); gr.addColorStop(1, '#f8d08a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  ell(540, 520, 160, 160, '#ffe9a0', 0); g.fillStyle = '#d8a060'; g.fillRect(0, 1240, W, 680); ln([[0, 1240], [W, 1240]], 7);
  for (const [x, h] of [[90, 260], [990, 200]]) { rr(x - 28, 1240 - h, 56, h, 26, '#4aa070', 6); rr(x - 80, 1240 - h * .7, 40, 90, 20, '#4aa070', 6); }
  const tw = ((t - T('n12')) * 380) % 1400 - 200; g.save(); g.translate(tw, 1500); g.rotate(t * 6); for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(0, 0, 40 + i * 6, i, i + 4); g.strokeStyle = '#8a6a3a'; g.lineWidth = 5; g.stroke(); } g.restore();
  teacher(t, 260, 1700, .62, {pose: 'hips', mood: 'flat', brows: 'angry'}); cowboyHat(260, 1700 - 1240 * .62, .62, '#5a2a3a');
  hero(t, 820, 1700, .62, {pose: 'hips', mood: 'flat', brows: 'angry', sweat: true}); cowboyHat(820, 1700 - 1250 * .62, .62); }
function bell(t) { g.fillStyle = '#ffe066'; g.fillRect(0, 0, W, H); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + t; g.beginPath(); g.moveTo(540, 760); g.arc(540, 760, 1400, a, a + .12); g.closePath(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill(); }
  const sh = Math.sin(t * 40) * .18; g.save(); g.translate(540, 520); g.rotate(sh); rr(-30, -40, 60, 60, 10, '#8a5a2a', 6);
  g.beginPath(); g.moveTo(-200, 420); g.quadraticCurveTo(-190, 40, 0, 20); g.quadraticCurveTo(190, 40, 200, 420); g.closePath(); g.fillStyle = '#c0283a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); ell(0, 440, 50, 50, '#8a5a2a', 7); rr(-230, 400, 460, 50, 24, '#a01828', 7); g.restore();
  for (const q of [-1, 1]) for (let i = 0; i < 3; i++) K.curve([540 + q * (280 + i * 50), 520], [540 + q * (310 + i * 50), 700], [540 + q * (280 + i * 50), 880], 9); }
function sHeroSaved(t) { g.fillStyle = '#bfe3ff'; g.fillRect(0, 0, W, H); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t * .4; g.beginPath(); g.moveTo(540, 900); g.arc(540, 900, 1500, a, a + .14); g.closePath(); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fill(); }
  hero(t, 540, 2560, 1.45, {pose: 'cheer', mood: undefined, blink: true}); deskBig(1660); }
function phone(t) { g.fillStyle = '#2a2040'; g.fillRect(0, 0, W, H); rr(260, 200, 560, 1100, 70, '#1a1a22', 9); rr(290, 280, 500, 940, 30, '#3a4a6a', 0);
  const on = Math.floor(t * 2) % 2; ell(380, 340, 18, 18, on ? '#ff3040' : '#7a2030', 0); text('REC', 450, 342, 40, '#ffffff', 'center', FONT);
  person('hero', 540, 1480, .62, {pose: 'hold', mood: 'o', wide: true, sweat: true, blink: false}); book(540, 1480 - 690 * .62, .45);
  rr(290, 1060, 500, 160, 0, '#3a4a6a', 0); ell(540, 1250, 46, 46, '#c0283a', 7); }
function endCard(t) { g.fillStyle = '#2f5a46'; g.fillRect(0, 0, W, H); const k = ease((t - T('n14') + .2) / .35); g.save(); g.globalAlpha = k;
  rr(70, 200, 940, 1240, 46, '#ffffff', 8); text('Сегодня выучили', 540, 300, 60, '#e0303f', 'center', FONT);
  const rows = [['the', 'язык между зубами, не «зе»'], ['work', '«уёрк» — работать'], ['walk', '«уок» — гулять'], ['Who wants to read?', 'Кто хочет почитать?']];
  rows.forEach(([en, ru], i) => { const a = ease((t - T('n14') - i * .15) / .3); g.globalAlpha = k * a; text(en, 540, 450 + i * 210, 76, '#2f4a7a', 'center', FONT); text(ru, 540, 530 + i * 210, 46, '#555555', 'center', FONT); });
  g.globalAlpha = k; rr(330, 1290, 420, 90, 45, '#ffe066', 6); text('ПОДПИШИСЬ', 540, 1336, 52, INK, 'center', FONT); g.restore(); }

// ---------------- captions (lower third, below faces) ----------------
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
  if (k === 'TEACH') sTeach(t);
  if (k === 'TEACH_CU') sTeachCU(t, {pose: 'down', mood: inW(t, T('t3'), E('t3')) ? 'flat' : undefined});
  if (k === 'TEACH_PAIN') sTeachPain(t);
  if (k === 'TEACH_DARK') { sTeachCU(t, {pose: 'down', mood: 'flat', brows: 'angry'}); spotlight(540, 1000, 620); }
  if (k === 'TEACH_ANGRY') { const s = Math.sin(t * 50) * 8; g.translate(s, 0); sTeachCU(t, {pose: 'hips', brows: 'angry'}); }
  if (k === 'TEACH_SMUG') sTeachCU(t, {pose: 'down', mood: 'flat', brows: 'up'});
  if (k === 'CLASS_DEAD') classRoom(t, 'dead');
  if (k === 'CLASS_BAGS') classRoom(t, 'bags');
  if (k === 'CLASS_TONGUES') classRoom(t, 'tongues');
  if (k === 'HERO_SANDWICH') sHeroSandwich(t);
  if (k === 'JOURNAL') journal(t, 0);
  if (k === 'JOURNAL_STOP') journal(t, 1);
  if (k === 'ROULETTE') roulette(t);
  if (k === 'VOVA_SHOCK') sVova(t, 'shock');
  if (k === 'VOVA_READ') sVova(t, 'read');
  if (k === 'TH_CARD') thCard(t);
  if (k === 'DIRECTOR') sDirector(t);
  if (k === 'HERO_BOOK') sHeroBook(t, inW(t, T('h2'), E('h2')) ? {sweat: true, brows: 'up', mood: 'o', wide: true} : {mood: 'flat'});
  if (k === 'WESTERN') western(t);
  if (k === 'BELL') bell(t);
  if (k === 'HERO_SAVED') sHeroSaved(t);
  if (k === 'PHONE') phone(t);
  if (k === 'END') endCard(t);
  g.restore();
  if (t - sh.at < .05 && sh.i > 0) { g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(0, 0, W, H); }
  captions(t, sh);
}

// ---------------- audio / srt ----------------
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = [];
  for (const id in LN) ev.push([LN[id].file, LN[id].at, 1.0]);
  SH.forEach(([at], i) => { if (i) ev.push([sfx('swipe'), at - .04, .16]); });
  for (let i = 0; i < 10; i++) ev.push([sfx('tap'), T('n6') + i * .22, .35]);
  ev.push([sfx('scratch'), T('n8') + .2, .55]); ev.push([sfx('tap'), T('n10'), .8]); ev.push([sfx('whoosh'), T('n10') + .1, .5]);
  ev.push([sfx('pop'), E('t6') + .05, .9]); ev.push([sfx('whoosh'), T('n12'), .6]); ev.push([sfx('chime'), T('n13'), .8]); ev.push([sfx('ding'), T('n13') + .1, .8]); ev.push([sfx('ding'), T('n13') + .5, .7]);
  ev.push([sfx('pop'), M('t7', .62), .5]); ev.push([sfx('ding'), T('n14'), .45]); ev.push([sfx('pop'), M('n7', .62), .6]);
  const args = ['-y', '-v', 'error'], fl = []; ev.forEach(([f]) => args.push('-i', f)); args.push('-stream_loop', '-1', '-i', sfx('theme'));
  ev.forEach(([f, at, gn], i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${gn},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`));
  const m = ev.length, quiet = [[T('t4') - .3, E('t4')], [T('n2'), E('n2')]].map(([a, b]) => `(1-0.8*between(t,${a},${b}))`).join('*');
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume='0.11*${quiet}':eval=frame,afade=t=in:d=0.3,afade=t=out:st=${TOTAL - 1.2}:d=1.2[mus]`);
  fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus]amix=inputs=${m + 1}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(TMP, 'mix.wav'));
  const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } console.log('mix ok', TOTAL.toFixed(2));
}
function srt() { const f = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const id in LN) { out += `${++n}\n${f(LN[id].at)} --> ${f(LN[id].end + .2)}\n${SHOWN[id] || LN[id].text}${TR[id] ? '\n' + TR[id] : ''}\n\n`; }
  fs.writeFileSync(path.join(OUT, 'read_aloud_ep1.srt'), out); console.log('srt', n); }

// ---------------- main ----------------
const cv = K.createCanvas(W, H); g = cv.getContext('2d'); K.setG(g);
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'still') { for (const s of a1.split(',')) { frame(parseFloat(s)); fs.writeFileSync(path.join(OUT, `still_${s}.png`), cv.toBuffer('image/png')); } console.log('total', TOTAL.toFixed(2), JSON.stringify(Object.fromEntries(SH.map(([a, k]) => [k + '@' + a.toFixed(1), 1])))); }
else if (mode === 'shots') { console.log(SH.map(([a, k], i) => `${((SH[i + 1] ? SH[i + 1][0] : TOTAL) + a) / 2}`).join(',')); }
else if (mode === 'chunk') {
  const i = +a1, n = +a2, N = Math.ceil(TOTAL * FPS), f0 = Math.floor(N * i / n), f1 = Math.floor(N * (i + 1) / n);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', path.join(TMP, `chunk_${i}.mp4`)]);
  (async () => { for (let f = f0; f < f1; f++) { frame(f / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
  ff.on('close', c => console.log('chunk', i, 'done', c));
}
else if (mode === 'audio') audio();
else if (mode === 'srt') srt();
else if (mode === 'cover') {
  g.setTransform(1, 0, 0, 1, 0, 0); wall(); board(60, 140, 960, 560, []); hero(0, 540, 2700, 1.75, {pose: 'hold', mood: 'o', wide: true, blink: false, brows: 'up', sweat: true}); deskBig(1700); book(540, 1640, 1.1);
  darken(.25); const big = (s, y, size, fill) => { g.font = `${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; let f = size; while (g.measureText(s).width > 1010) { f -= 4; g.font = `${f}px ${FONT}`; }
    g.fillStyle = '#000'; g.fillText(s, 546, y + 10); g.lineWidth = f * .26; g.strokeStyle = '#000'; g.strokeText(s, 540, y); g.fillStyle = fill; g.fillText(s, 540, y); };
  big('ТЕБЯ ВЫЗВАЛИ', 230, 118, '#ffffff'); big('ЧИТАТЬ?!', 390, 180, '#ffd23f');
  fs.writeFileSync(path.join(OUT, 'read_aloud_ep1_cover.png'), cv.toBuffer('image/png')); console.log('cover');
}
