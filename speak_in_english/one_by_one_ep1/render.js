// «Читаем по цепочке», выпуск 1. Narrator story (format like the.seventh, own flat style).
// node render.js still t | shots | chunk i n | audio | srt | cover
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./flat'), A = require('./people_flat'), CAST = require('./cast'); const {rr, ell, ln, text} = K;
const W = 1080, H = 1920, FPS = 30, D = __dirname, VD = path.join(D, 'voice'), OUT = path.join(D, 'out'), TMP = path.join(OUT, 'tmp'); fs.mkdirSync(TMP, {recursive: true});
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const INK = '#2a1f1d', FONT = 'NL, NC', HW = 'HWL, HWC';
{ const {GlobalFonts} = require('@napi-rs/canvas'); GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'neucha-latin-400-normal.woff2'), 'HWL'); GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'neucha-cyrillic-400-normal.woff2'), 'HWC'); }
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
const C = (z, x, y) => [z, x, y], WIDE = C(1, 540, 960), CW = C(1.15, 540, 1160), HERO = C(2.0, 300, 1300), PAIR = C(1.2, 540, 1450), TCU = C(2.3, 640, 660), TW = C(1.15, 560, 900);
// [start, scene, camFrom, camTo, fast]  (camera in world coords of the scene; fast = quick punch-in)
// mostly static framings with straight cuts; a quick punch-in only on 3 accents (Next!, the boss word, Sasha's answer)
const SH = [[0, 'CLASS', CW, CW], [T('t1'), 'TEACH', WIDE, WIDE], [T('c1'), 'CHORUS', CW, CW], [T('n2'), 'HOSTAGE', CW, CW],
  [T('n3'), 'NAMES', PAIR, PAIR], [T('t2'), 'TEACH', TW, TW], [T('n4'), 'AUTO', HERO, HERO], [M('h1', .55), 'BOARD', C(1.4, 420, 800), C(1.4, 420, 800)],
  [T('t3'), 'TEACH', WIDE, WIDE], [T('n5'), 'MATH', WIDE, WIDE], [T('n6'), 'ANTHEM', WIDE, WIDE], [M('n6', .55), 'SLEEP', WIDE, WIDE],
  [T('n7'), 'CHAIN', WIDE, WIDE], [T('n8'), 'BALLOON', WIDE, WIDE], [M('n8', .78), 'BOSS', C(.7, 540, 900), WIDE, 1],
  [T('t4'), 'TEACH', TW, C(2.4, 650, 660), 1], [T('h2'), 'STRUGGLE', HERO, HERO], [T('t5'), 'TEACH', TCU, TCU], [T('n9'), 'SPIES', WIDE, WIDE],
  [T('n10'), 'EXIT', WIDE, WIDE], [T('t6'), 'TEACH', TW, TW], [T('n12'), 'PODIUM', WIDE, WIDE],
  [T('n13'), 'CORRIDOR', WIDE, WIDE], [T('s1'), 'CORRIDOR', WIDE, C(2.0, 760, 1100), 1], [M('s1', .5), 'MAP', WIDE, WIDE],
  [T('t7'), 'TEACH', TCU, TCU], [T('n14'), 'MEANING', WIDE, WIDE], [T('n15') - .2, 'END', WIDE, WIDE]];
const shotAt = t => { let s = SH[0], i = 0; SH.forEach((q, k) => { if (t >= q[0]) { s = q; i = k; } }); const end = SH[i + 1] ? SH[i + 1][0] : TOTAL; return {kind: s[1], at: s[0], end, i, from: s[2], to: s[3], fast: s[4], prev: i ? SH[i - 1][1] : null}; };

// ---------------- people (overrides) ----------------
function hero(t, x, y, s, extra = {}) { const m = talkId(['h1', 'h2', 'h3'], t); person('hero', x, y, s, {blink: blink(t, 0), mouth: m, ...extra, mood: m > .12 ? undefined : extra.mood}); }
function badge(x, y, s, txt) { g.save(); g.translate(x, y); g.scale(s, s); rr(-110, -36, 220, 72, 12, '#ffffff', 6); text(txt, 0, 2, 40, '#c0283a', 'center', FONT); g.restore(); }

// ---------------- scenes ----------------
const BOARD_TXT = [['Good morning!', 64], ['Reading · page 42', 46, '#ffe066']];
function clock(x, y, r, t) { ell(x, y, r, r, '#ffffff', 8); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ln([[x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8], [x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9]], 5); }
  const a = -Math.PI / 2 + Math.floor(t * 2) / 60 * Math.PI * 2; ln([[x, y], [x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8]], 6, '#c0283a'); ln([[x, y], [x, y - r * .5]], 9); ell(x, y, 10, 10, INK, 0); }
// classroom: 3 rows; opts {mode, mouthAll, badges}
function hand(str, x, y, size, col, align = 'center', rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.font = `${size}px ${HW}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(str, 0, 0); g.restore(); }
function stripes(y0, y1) { g.fillStyle = '#f1e6c8'; g.fillRect(-1000, y0, 3080, y1 - y0); g.fillStyle = '#e9dbb6'; for (let x = -1000; x < 2080; x += 80) g.fillRect(x, y0, 34, y1 - y0); g.fillStyle = '#e2d2aa'; g.fillRect(-1000, y0, 3080, 26); }
function floorP(y0, vx) { g.fillStyle = '#d9a066'; g.fillRect(-1000, y0, 3080, 3000); ln([[-1000, y0], [2080, y0]], 7);
  for (let x = -1400; x < 2600; x += 150) ln([[vx + (x - vx) * .35, y0], [x, 2600]], 4, 'rgba(90,55,25,0.35)'); }
function wainscot(y0, y1) { g.fillStyle = '#8fb8a4'; g.fillRect(-1000, y0, 3080, y1 - y0); ln([[-1000, y0], [2080, y0]], 7); rr(-1000, y0 - 8, 3080, 16, 4, '#a8cbb8', 5); }
function door(x, y, w, h, t, open = 0) { rr(x - 22, y - 22, w + 44, h + 22, 6, '#8a5a2e', 7); g.fillStyle = '#9aa6a8'; g.fillRect(x, y, w, h);
  const lw = w * (1 - open * .75); rr(x + w - lw, y, lw, h, 4, '#c08a50', 7); if (lw > 60) { const px = x + w - lw; rr(px + lw * .14, y + h * .06, lw * .72, h * .38, 6, null, 5); rr(px + lw * .14, y + h * .52, lw * .72, h * .4, 6, null, 5);
    ln([[px + 22, y + h * .5], [px + 70, y + h * .5]], 12, '#d8d8d8'); ell(px + 22, y + h * .5, 12, 12, '#d8d8d8', 5); }
  rr(x + w / 2 - 90, y - 120, 180, 66, 10, '#2f9a5a', 6); text('EXIT', x + w / 2, y - 85, 44, Math.floor(t * 2) % 2 ? '#ffffff' : '#c8ffd8', 'center', FONT); }
function deskSurface(x, y, w, depth) { g.beginPath(); g.moveTo(x - w / 2 + 18, y - depth); g.lineTo(x + w / 2 - 18, y - depth); g.lineTo(x + w / 2, y); g.lineTo(x - w / 2, y); g.closePath(); g.fillStyle = '#e3b37a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); }
function deskFront(x, y, w, depth, panel) { ln([[x - w / 2 + 30, y + panel], [x - w / 2 + 30, y + panel + depth * 2.2]], 12, '#4a4f5a'); ln([[x + w / 2 - 30, y + panel], [x + w / 2 - 30, y + panel + depth * 2.2]], 12, '#4a4f5a');
  rr(x - w / 2, y, w, 24, 4, '#c98a4a', 6); rr(x - w / 2 + 16, y + 24, w - 32, panel - 24, 4, '#b07a42', 6); }
function schoolDesk(x, y, w, depth = 60, panel = 150) { // top + front panel + metal legs
  ln([[x - w / 2 + 30, y + panel], [x - w / 2 + 30, y + panel + depth * 2.2]], 12, '#4a4f5a'); ln([[x + w / 2 - 30, y + panel], [x + w / 2 - 30, y + panel + depth * 2.2]], 12, '#4a4f5a');
  g.beginPath(); g.moveTo(x - w / 2 + 18, y - depth); g.lineTo(x + w / 2 - 18, y - depth); g.lineTo(x + w / 2, y); g.lineTo(x - w / 2, y); g.closePath(); g.fillStyle = '#e3b37a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  rr(x - w / 2, y, w, 24, 4, '#c98a4a', 6); rr(x - w / 2 + 16, y + 24, w - 32, panel - 24, 4, '#b07a42', 6); }
function backPerson(who, x, fy, s, o = {}) { const P = CAST[who].pal, L2 = CAST[who].look2 || {}, hair = P.hair || '#7a3a1e', top = P.card || '#7ccfb6', topS = P.cardS || top, skin = P.skin || '#fcd5b8';
  g.save(); g.translate(x, fy); g.scale(s, s);
  if (o.raise) { ln([[110, -840], [190, -1000], [210, -1240]], 54, INK); ln([[110, -840], [190, -1000], [210, -1240]], 40, top); ell(214, -1268, 30, 34, skin, 6); }
  g.beginPath(); g.moveTo(-120, -880); g.quadraticCurveTo(-170, -860, -175, -800); g.lineTo(-185, -520); g.lineTo(185, -520); g.lineTo(175, -800); g.quadraticCurveTo(170, -860, 120, -880); g.closePath(); g.fillStyle = top; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  g.save(); g.clip(); g.fillStyle = topS; g.fillRect(120, -900, 80, 400); g.restore();
  if (o.band) { rr(-196, -820, 60, 70, 8, '#e03030', 5); }
  rr(-26, -950, 52, 80, 10, P.skinS || '#efb491', 6);
  for (const q of [-1, 1]) ell(q * 142, -1090, 18, 30, skin, 6);
  if (L2.hair === 'bald') { ell(0, -1110, 140, 160, skin, 7); } else if (!L2.hair || L2.hair === 'long') { g.beginPath(); g.moveTo(-170, -1120); g.bezierCurveTo(-180, -1300, 180, -1300, 170, -1120); g.lineTo(178, -880); g.lineTo(-178, -880); g.closePath(); g.fillStyle = hair; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); }
  else { ell(0, -1110, 140, 162, skin, 7); g.beginPath(); g.ellipse(0, -1130, 146, 150, 0, Math.PI * .92, Math.PI * 2.08); g.closePath(); g.fillStyle = hair; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); }
  g.restore(); }
function backWall_old(t) { g.fillStyle = '#f3ead8'; g.fillRect(-1000, -1000, 3080, 3920); g.fillStyle = '#7fb8a8'; g.fillRect(-1000, 900, 3080, 400); ln([[-1000, 900], [2080, 900]], 7);
  g.fillStyle = '#d9a066'; g.fillRect(-1000, 1300, 3080, 2600); ln([[-1000, 1300], [2080, 1300]], 7);
  rr(40, 260, 250, 380, 10, '#ffffff', 7); rr(56, 276, 218, 348, 6, '#bfe3ff', 0); ln([[165, 276], [165, 624]], 6); ln([[56, 450], [274, 450]], 6);
  rr(360, 250, 380, 300, 12, '#fffdf5', 7); text('A a  B b  C c', 550, 330, 52, '#c0283a', 'center', FONT); text('D d  E e  F f', 550, 410, 52, '#2f4a7a', 'center', FONT); text('G g  H h …', 550, 490, 52, '#2f9a5a', 'center', FONT);
  clock(800, 330, 70, t); door(880, 520, 170, 760, t); }
// classroom seen from the teacher's desk; o.mode, o.hero / o.vova = overrides for the front row
function classRoom(t, o = {}) {
  stripes(-1000, 1060); wainscot(1060, 1190); floorP(1190, 540);
  // back wall: map, English alphabet, window with a tree, bookcase, clock
  rr(70, 250, 380, 290, 10, '#ffffff', 8); rr(88, 268, 344, 254, 6, '#a8d4f0', 0); for (const [a, b, rx, ry] of [[170, 360, 60, 46], [300, 330, 80, 40], [330, 450, 34, 40]]) ell(a, b, rx, ry, '#7ac070', 5);
  rr(500, 250, 230, 330, 8, '#fff6d8', 7); ['ABCDEF', 'GHIJKL', 'MNOPQR', 'STUVWX', 'YZ'].forEach((r2, i) => text(r2, 615, 300 + i * 58, 40, ['#e05030', '#3a6ad0', '#2f9a5a', '#8a4ad0', '#e05030'][i], 'center', FONT));
  rr(790, 220, 300, 600, 8, '#ffffff', 8); rr(806, 236, 268, 568, 4, '#bfe3ff', 0); ell(900, 560, 110, 120, '#6ab060', 6); ell(990, 520, 90, 110, '#7ac070', 6); ln([[940, 236], [940, 804]], 10, '#ffffff'); ln([[806, 520], [1074, 520]], 10, '#ffffff'); rr(780, 816, 320, 26, 6, '#ffffff', 6);
  rr(-40, 380, 120, 680, 6, '#b07a42', 7); for (let i = 0; i < 4; i++) { rr(-30, 420 + i * 160, 100, 130, 4, '#8a5a2e', 4); rr(10 + (i % 2) * 20, 450 + i * 160, 24, 100, 3, ['#e05030', '#3a6ad0', '#f0b030', '#7a5ad0'][i], 4); }
  clock(150, 120, 60, t);
  const rows = [{desk: [[560, 1290, 520]], s: .42, st: [[470, 'sasha'], [650, 'girl1']]}, {desk: [[90, 1480, 420], [990, 1480, 420]], s: .55, st: [[90, 'girl3'], [990, 'boy4']]}, {desk: [[540, 1720, 1260]], s: .72, st: [[300, 'hero'], [780, 'vova']]}];
  rows.forEach((r, ri) => { const dy = r.desk[0][1];
    r.desk.forEach(([x, y, w]) => deskSurface(x, y, w, 50 * r.s * 2));
    r.st.forEach(([x, who], i) => { const seed = ri * 7 + i, fy = dy + 560 * r.s;
      const ex = {seated: true, pose: 'desk', blink: blink(t, seed), mouth: 0, mood: 'flat'};
      if (o.mode === 'chorus') Object.assign(ex, {mouth: .45 + .25 * Math.abs(Math.sin(t * 2 + seed * .3)), mood: 'sleepy'});
      if (o.mode === 'hostage') Object.assign(ex, {mood: 'sad', brows: 'sad'});
      if (o.mode === 'hostage' && ri === 1 && i === 0) Object.assign(ex, {pose: 'wave'});
      if (who === 'hero' && o.hero) Object.assign(ex, o.hero); if (who === 'vova' && o.vova) Object.assign(ex, o.vova);
      if (who === 'hero') { const m = talkId(['h1', 'h2', 'h3'], t); if (m > .02) Object.assign(ex, {mouth: m, mood: undefined}); }
      person(who, x, fy, r.s, ex);
      if (o.mode === 'hostage' && ri === 1 && i === 0) { const hx = x + 236 * r.s, hy = fy - 1080 * r.s, wv = Math.sin(t * 8) * 8; g.save(); g.translate(hx, hy - 30); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(40, -20 + wv, 90, -6); g.lineTo(84, 50); g.quadraticCurveTo(40, 40 + wv, 0, 56); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.restore(); }
      if (who === 'hero' && o.book) book(x, dy - 70, .62, 'ENGLISH');
      if (o.badges && ri === 2) badge(x, fy - 760 * r.s, .7, who === 'hero' ? 'MICHAEL' : 'BOB'); });
    r.desk.forEach(([x, y, w]) => deskFront(x, y, w, 50 * r.s * 2, 150 * r.s * 2 + (ri === 2 ? 400 : 0))); });
  if (o.mode === 'hostage') { g.fillStyle = 'rgba(40,40,60,0.35)'; g.fillRect(-1000, -1000, 3080, 3920); const k = Math.floor(t * 2) % 2;
    g.save(); g.translate(540, 700); g.rotate(-.03); rr(-330, -70, 660, 140, 16, '#1a1a22', 7); text('ЗАЛОЖНИКИ: 27', 0, 4, 72, k ? '#ff4040' : '#a02020', 'center', FONT); g.restore(); }
}
function frontRoom(t, o = {}) {
  stripes(-1000, 980); wainscot(980, 1200); floorP(1200, 480);
  rr(40, 470, 660, 380, 12, '#8a5a2e', 9); rr(62, 492, 616, 336, 6, '#2f5a46', 0);
  g.save(); g.globalAlpha = .12; ell(250, 600, 170, 40, '#ffffff', 0); ell(480, 760, 200, 40, '#ffffff', 0); g.restore();
  (o.board || [['21 ноября', 52], ['Classwork', 52], ['Reading, p. 42', 52]]).forEach(([str, f], i) => hand(str, 300, 560 + i * 74, f, '#f3f3e8'));
  rr(90, 836, 90, 14, 5, '#ffffff', 3); clock(370, 350, 70, t);
  door(800, 620, 240, 570, t, o.doorOpen || 0);
  // teacher's desk with a plant, books and a globe
  rr(100, 1010, 520, 30, 6, '#d9a066', 7); rr(120, 1040, 480, 170, 6, '#b07a42', 7); rr(150, 1070, 420, 110, 6, null, 4);
  rr(180, 950, 120, 22, 4, '#3a6ad0', 4); rr(186, 930, 108, 22, 4, '#e05030', 4); rr(192, 910, 96, 22, 4, '#f0b030', 4);
  rr(360, 960, 60, 50, 6, '#c8664a', 5); for (let i = 0; i < 4; i++) ell(375 + i * 10, 920 - Math.abs(i - 1.5) * 8, 12, 40, '#3cb371', 4);
  ln([[520, 1010], [520, 960]], 6); ell(520, 930, 40, 40, '#4ab0e0', 5); ell(512, 922, 16, 12, '#7ac070', 0);
  if (o.teacher !== false) teacher(t, 650, 1210, .58, o.teacher || {pose: 'hips'});
  if (o.vovaBoard) { const s2 = .58, x = 380, y = 1210; person('vova', x, y, s2, {pose: 'wave', mood: 'o', wide: true, brows: 'up', blink: false});
    rr(x - 110 * s2 - 10, y - 820 * s2, 40, 50, 6, '#e03030', 4);
    const hx = x + 236 * s2 + Math.sin(t * 7) * 18, hy = y - 1080 * s2; g.save(); g.translate(hx, hy); g.rotate(Math.sin(t * 7) * .2); rr(-40, -28, 80, 56, 12, '#9ab0c8', 5); g.restore(); }
  // students from behind: one row, then the hero (right, cropped) in the foreground
  schoolDesk(330, 1430, 340, 50, 160); schoolDesk(780, 1430, 340, 50, 160);
  backPerson('girl3', 330, 1680, .42); backPerson('boy2', 780, 1680, .42);
  backPerson('hero', 880, 2350, .95, {raise: o.raise}); backPerson('vova', 120, 2350, .95, {band: true});
}
function teachScene(t, ex = {}) { frontRoom(t, {teacher: {pose: 'hips', ...ex}}); }
function boardScene(t) { frontRoom(t, {teacher: false, vovaBoard: true, board: [['Who is on duty?', 54]]}); }
function deskTop() { g.fillStyle = '#c8925a'; g.fillRect(-1000, -1000, 3080, 3920); for (let y = -1000; y < 2900; y += 260) ln([[-1000, y], [2080, y + 30]], 4, 'rgba(90,55,25,0.3)');
  g.save(); g.translate(120, 1560); g.rotate(-.04); rr(0, 0, 820, 110, 10, '#f2dc8a', 6); for (let i = 0; i <= 40; i++) ln([[20 + i * 19, 0], [20 + i * 19, i % 5 ? 30 : 55]], 3); [10, 20, 30, 40].forEach((n, i) => text(String(n), 20 + n * 19, 80, 34, INK, 'center', FONT)); g.restore(); }
function sheet(x, y, w, h, rot, grid = true) { g.save(); g.translate(x, y); g.rotate(rot); rr(-w / 2 + 10, -h / 2 + 14, w, h, 4, 'rgba(0,0,0,0.18)', 0); rr(-w / 2, -h / 2, w, h, 4, '#ffffff', 6);
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); g.strokeStyle = '#b8d0ec'; g.lineWidth = 2; for (let yy = -h / 2 + 40; yy < h / 2; yy += 40) { g.beginPath(); g.moveTo(-w / 2, yy); g.lineTo(w / 2, yy); g.stroke(); } if (grid) for (let xx = -w / 2 + 40; xx < w / 2; xx += 40) { g.beginPath(); g.moveTo(xx, -h / 2); g.lineTo(xx, h / 2); g.stroke(); }
  ln([[w / 2 - 70, -h / 2], [w / 2 - 70, h / 2]], 3, '#e05050'); g.restore(); g.restore(); }
function math(t) { deskTop(); sheet(540, 760, 820, 1180, -.025);
  g.save(); g.translate(540, 760); g.rotate(-.025);
  const rows = [['Задача', 70, '#1f3a8a', -300], ['Учеников в классе — 27', 52, '#1f3a8a', -330], ['Абзацев в тексте — 6', 52, '#1f3a8a', -330], ['Я сижу — пятым', 52, '#1f3a8a', -330], ['Решение', 70, '#1f3a8a', -300], ['27 - Вова (болеет?) …', 52, '#1f3a8a', -330], ['Мой абзац — № 5', 66, '#c0283a', -330]];
  rows.forEach(([str, f, c, x], i) => { const k = ease((t - T('n5') - i * .22) / .25); g.globalAlpha = k; hand(str, x, -460 + i * 125, f, c, 'left'); }); g.globalAlpha = 1;
  const k = ease((t - T('n5') - 1.7) / .3); if (k > 0) { g.globalAlpha = k; g.beginPath(); g.ellipse(-90, 290, 330, 64, -.02, 0, 7); g.strokeStyle = '#c0283a'; g.lineWidth = 6; g.stroke(); g.globalAlpha = 1; }
  g.restore(); }
function anthem(t, sleep) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sleep ? '#2a2a5a' : '#ffe9a0'); gr.addColorStop(1, sleep ? '#1a1a3a' : '#ffd060'); g.fillStyle = gr; g.fillRect(-1000, -1000, 3080, 3920);
  if (!sleep) for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t * .3; g.beginPath(); g.moveTo(540, 700); g.arc(540, 700, 1500, a, a + .13); g.closePath(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill(); }
  g.save(); g.translate(540, 470); g.rotate(-.02); rr(-420, -230, 840, 460, 20, '#fffdf5', 8); text('Paragraph 5', 0, -160, 50, '#c0283a', 'center', FONT);
  ['London is the capital', 'of Great Britain.', 'It is a very big', 'and beautiful city…'].forEach((s, i) => text(s, 0, -70 + i * 70, 50, INK, 'center', FONT)); g.restore();
  hero(t, 540, 2700, 1.45, sleep ? {pose: 'down', blink: true, mood: 'flat', mouth: .3 + .2 * Math.abs(Math.sin(t * 5))} : {pose: 'hold', mood: undefined, mouth: .3 + .3 * Math.abs(Math.sin(t * 6)), brows: 'up'});
  if (sleep) for (let i = 0; i < 3; i++) { const u = (t * .6 + i / 3) % 1; g.globalAlpha = Math.sin(u * Math.PI); text('Z', 800 + u * 80, 1050 - u * 260, 60 + i * 16, '#ffffff', 'center', FONT); g.globalAlpha = 1; } }
function chain(t) { g.fillStyle = '#f3ead8'; g.fillRect(-1000, -1000, 3080, 3920); wall(); const xs = [140, 340, 540, 740, 940], who = ['girl1', 'boy2', 'vova', 'sasha', 'hero'];
  const dt = LN.n7.dur, prog = (t - T('n7')) / dt, zoom = prog > .62, active = prog < .25 ? 0 : prog < .5 ? 1 : 2;
  const before = ['1', '2', '3', '4', '5'], after = ['1', '2', '3+4', '5', '6'];
  xs.forEach((x, i) => { const s = .3; person(who[i], x, 1500, s, {pose: 'desk', seated: true, blink: blink(t, i), mood: i === 4 && zoom ? 'o' : 'flat', wide: i === 4 && zoom, sweat: i === 4 && zoom});
    desk(x, 1500 - 600 * s, 170, 220, '#c98a4a');
    const lab = zoom ? after[i] : before[i], hot = i === active || (zoom && i === 2);
    rr(x - 66, 820, 132, 96, 18, hot ? '#ffe066' : '#ffffff', 6); text(lab, x, 870, lab.length > 1 ? 44 : 64, i === 4 ? '#c0283a' : INK, 'center', FONT);
    if (i === 4) text('ТЫ', x, 960, 40, '#c0283a', 'center', FONT); });
  if (zoom) { for (let i = 0; i < 6; i++) ln([[420 + i * 6, 1250 + i * 22], [488, 1250 + i * 22]], 7, '#3a6ab8'); g.save(); g.translate(540, 520); g.rotate(-.04); rr(-300, -70, 600, 140, 20, '#c0283a', 7); text('БОБ РАЗОГНАЛСЯ', 0, 4, 60, '#ffffff', 'center', FONT); g.restore(); } }
function balloon(t) { g.fillStyle = '#bfe3ff'; g.fillRect(-1000, -1000, 3080, 3920); const u = clamp((t - T('n8')) / 2.5), bx = 540 + u * 260, by = 900 - u * 700;
  ln([[bx, by + 160], [540 + u * 60, 1330]], 4); ell(bx, by, 150, 180, '#c0283a', 8); text('5', bx, by, 190, '#ffffff', 'center', FONT);
  hero(t, 540, 2700, 1.45, {pose: 'down', mood: 'sad', brows: 'sad'}); }
function boss(t) { g.fillStyle = '#3a0a14'; g.fillRect(-1000, -1000, 3080, 3920); const k = ease((t - M('n8', .78)) / .4), sh = Math.sin(t * 40) * 4;
  text('BOSS', 540, 300, 70, '#ff6060', 'center', FONT); rr(190, 380, 700, 50, 20, '#2a0a0a', 6); rr(196, 386, 688, 38, 16, '#e03030', 0);
  g.save(); g.translate(540 + sh, 800); g.scale(.6 + .4 * k, .6 + .4 * k); bold('thoroughly', 0, 0, 170, '#ffd23f'); g.restore();
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t; ln([[540 + Math.cos(a) * 560, 800 + Math.sin(a) * 420], [540 + Math.cos(a) * 640, 800 + Math.sin(a) * 480]], 8, '#ff9050'); } }

function spies(t) { g.fillStyle = '#20242e'; g.fillRect(-1000, -1000, 3080, 3920); spotlight(540, 760, 700);
  g.font = `150px ${FONT}`; const parts = ['thorou', 'gh', 'ly'], ws = parts.map(q => g.measureText(q).width); let x = 540 - ws.reduce((a, b) => a + b) / 2;
  parts.forEach((q, i) => { g.font = `150px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = i === 1 ? '#6a7080' : '#ffffff'; g.fillText(q, x, 700);
    if (i === 1) { ln([[x - 6, 712], [x + ws[i] + 6, 712]], 10, '#e03030'); rr(x + ws[i] / 2 - 90, 470, 180, 90, 40, '#ffe066', 6); text('тсс…', x + ws[i] / 2, 516, 50, INK, 'center', FONT); }
    x += ws[i]; });
  text('gh — не читается', 540, 980, 64, '#ffffff', 'center', FONT); text('th — язык между зубами', 540, 1080, 52, '#bfe9ff', 'center', FONT); }

function podium(t) { g.fillStyle = '#2a2a50'; g.fillRect(-1000, -1000, 3080, 3920); g.fillStyle = '#3a3a68'; g.fillRect(-1000, 1560, 3080, 1500); ln([[-1000, 1560], [2080, 1560]], 6, '#1a1a30');
  for (let i = 0; i < 40; i++) { const x = (i * 97 + t * 120) % W, y = (i * 211 + t * 260) % 1400; rr(x, y, 14, 24, 3, ['#ffd23f', '#e03050', '#4ab0e0', '#7ad060'][i % 4], 0); }
  rr(330, 1240, 400, 320, 10, '#f0c040', 8); text('1', 530, 1400, 120, INK, 'center', FONT);
  const s = .62; person('sasha', 530, 1244, s, {pose: 'wave', blink: blink(t, 5)}); ell(530, 1244 - 820 * s, 44, 44, '#ffd23f', 6); text('5', 530, 1244 - 820 * s, 52, INK, 'center', FONT);
  // the hero stands next to the podium on the same floor, same scale
  person('hero', 880, 1560, s, {pose: 'down', mood: 'sad', brows: 'sad', blink: blink(t, 0)}); }
function corridor(t) { g.fillStyle = '#e8e0d0'; g.fillRect(-1000, -1000, 3080, 3920); for (let i = -3; i < 9; i++) { rr(-20 + i * 190, 300, 170, 1000, 10, '#6a8ab8', 7); ell(-20 + i * 190 + 140, 800, 10, 10, '#d0d8e8', 4); }
  g.fillStyle = '#c9ced6'; g.fillRect(-1000, 1300, 3080, 2600); ln([[-1000, 1300], [2080, 1300]], 7);
  person('hero', 330, 1850, .78, {pose: 'shrug', mood: 'o', wide: true, brows: 'up', blink: blink(t, 0)}); const m = talk('sasha', t);
  person('sasha', 760, 1850, .78, {pose: 'down', blink: blink(t, 5), mouth: m, mood: m > .12 ? undefined : 'flat', brows: inW(t, T('s1'), E('s1')) ? 'up' : undefined}); }

function mapScene(t) { deskTop(); sheet(540, 760, 860, 1180, .02); g.save(); g.translate(540, 760); g.rotate(.02);
  hand('План Саши', -330, -470, 76, '#1f3a8a', 'left'); ln([[-330, -420], [60, -420]], 4, '#1f3a8a');
  const cols = [-260, 0, 260], rows = [-260, -80, 100];
  rows.forEach((y, r) => cols.forEach((x, c) => { rr(x - 90, y - 36, 180, 72, 8, null, 5); g.strokeStyle = '#1f3a8a'; }));
  hand('Вова', 0, -80, 52, '#c0283a'); g.beginPath(); g.ellipse(0, -80, 150, 80, 0, 0, 7); g.strokeStyle = '#c0283a'; g.lineWidth = 6; g.stroke();
  hand('опасно!', 200, -170, 44, '#c0283a', 'left', -.1);
  hand('Вова читает', -330, 260, 50, '#1f3a8a', 'left'); hand('за двоих — значит, учу', -330, 340, 50, '#1f3a8a', 'left'); hand('на один дальше', -330, 420, 58, '#c0283a', 'left');
  g.restore(); }
function meaning(t) { deskTop(); sheet(540, 760, 820, 900, -.02, false); g.save(); g.translate(540, 760); g.rotate(-.02);
  hand('thoroughly', 0, -260, 120, '#1f3a8a'); hand('звучит: «ТхА-рэ-ли»', 0, -100, 60, '#555555'); hand('= тщательно', 0, 60, 90, '#c0283a');
  hand('(как Саша)', 0, 200, 56, '#1f3a8a'); g.restore(); }
function endCard(t) { deskTop(); const k = ease((t - T('n15') + .2) / .35); g.save(); g.globalAlpha = k; sheet(540, 800, 900, 1320, -.015, false);
  g.translate(540, 800); g.rotate(-.015);
  hand('Как говорят на самом деле', 0, -560, 66, '#c0283a');
  const rows = [['May I go out?', 'Can I go to the bathroom?', 'Можно выйти?'], ['on duty', 'на дежурстве', 'врач, полиция, охрана'], ['thoroughly', '«ТхА-рэ-ли»', 'тщательно, gh не читается']];
  rows.forEach(([wrong, right, ru], i) => { const y = -400 + i * 300, q = ease((t - T('n15') - i * .15) / .3); g.globalAlpha = k * q;
    hand(wrong, 0, y, i === 0 ? 50 : 66, i === 0 ? '#999999' : '#1f3a8a'); if (i === 0) { g.font = `50px ${HW}`; const w2 = g.measureText(wrong).width; ln([[-w2 / 2, y], [w2 / 2, y]], 4, '#e03030'); }
    hand(right, 0, y + 80, 60, i === 0 ? '#2f8a4a' : '#1f3a8a'); hand(ru, 0, y + 150, 44, '#555555'); });
  g.globalAlpha = k; rr(-210, 470, 420, 96, 48, '#ffd23f', 6); text('ПОДПИШИСЬ', 0, 520, 52, INK, 'center', FONT); g.restore(); }
const CAPY = 1560;
function chunks(id) { const l = LN[id]; if (l.ch) return l.ch; const s = SHOWN[id] || l.text, ws = s.split(' '), out = []; let cur = '';
  for (const w of ws) { const q = cur ? cur + ' ' + w : w; if (cur && (q.length > 24 || /[.?!…:]$/.test(cur))) { out.push(cur); cur = w; } else cur = q; } out.push(cur);
  const total = out.reduce((a, c) => a + c.length, 0); let acc = 0; l.ch = out.map(c => { const o = {s: acc / total * l.dur, txt: c}; acc += c.length; return o; }); return l.ch; }
function bold(s, x, y, size, fill) { g.font = `${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  let f = size; while (g.measureText(s).width > 980 && f > 40) { f -= 4; g.font = `${f}px ${FONT}`; } g.lineWidth = f * .24; g.strokeStyle = '#000000'; g.strokeText(s, x, y); g.fillStyle = fill; g.fillText(s, x, y); }
function captions(t, sh) {
  let cur = null; for (const id in LN) { const l = LN[id]; if (inW(t, l.at, l.end + .2) && (!cur || l.at > LN[cur].at)) cur = id; }
  for (const id of cur ? [cur] : []) { const l = LN[id]; if (id === 'n14') continue;
    const ch = chunks(id); let c = ch[0]; for (const q of ch) if (t - l.at >= q.s - .03) c = q;
    const en = /[A-Za-z]/.test(c.txt), pop = 1 + .1 * (1 - ease((t - l.at - c.s) / .1)), y = sh.kind === 'TH_CARD' || sh.kind === 'END' ? 1640 : CAPY;
    g.save(); g.translate(540, y); g.scale(pop, pop); bold(c.txt, 0, 0, 76, en ? '#ffd23f' : '#ffffff'); g.restore();
    if (TR[id] && en) bold(TR[id], 540, y + 84, 46, '#bfe9ff'); }
}

// ---------------- frame ----------------
function frame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#f3ead8'; g.fillRect(0, 0, W, H);
  const sh = shotAt(t), k = sh.kind, u = sh.fast ? ease((t - sh.at) / .35) : ease((t - sh.at) / Math.max(.5, sh.end - sh.at));
  const cam = sh.from.map((a, i) => a + (sh.to[i] - a) * u), trans = 1, z = cam[0] * trans;
  g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-cam[1], -cam[2]);
  const S = {
    CLASS: () => classRoom(t, {}), CHORUS: () => classRoom(t, {mode: 'chorus'}), HOSTAGE: () => classRoom(t, {mode: 'hostage'}), NAMES: () => classRoom(t, {badges: true}),
    AUTO: () => classRoom(t, {hero: {mood: 'o', wide: true, brows: 'up', pose: 'desk'}}), STRUGGLE: () => classRoom(t, {hero: {pose: 'hold', sweat: true, brows: 'up', mood: 'flat'}, book: true}),
    EXIT: () => frontRoom(t, {teacher: {pose: 'hips', mood: 'flat'}, raise: inW(t, T('h3') - .2, E('n11') + .5)}),
    TEACH: () => teachScene(t, {mood: inW(t, T('t5'), E('t5')) || inW(t, T('t7'), E('t7')) ? 'flat' : undefined, brows: inW(t, T('t4'), E('t4')) ? 'angry' : inW(t, T('t7'), E('t7')) ? 'up' : undefined, pose: inW(t, T('t2'), E('t3')) ? 'down' : 'hips'}),
    BOARD: () => boardScene(t), MATH: () => math(t), ANTHEM: () => anthem(t, false), SLEEP: () => anthem(t, true), CHAIN: () => chain(t), BALLOON: () => balloon(t), BOSS: () => boss(t),
    SPIES: () => spies(t), PODIUM: () => podium(t), CORRIDOR: () => corridor(t), MAP: () => mapScene(t), MEANING: () => meaning(t), END: () => endCard(t)};
  S[k](); g.restore();
  if (k !== 'END') captions(t, sh);
}
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = [];
  for (const id in LN) ev.push([LN[id].file, LN[id].at, 1.0]);
  ev.push([sfx('whoosh'), M('n7', .62), .5]); ev.push([sfx('chime'), T('n12'), .4]); ev.push([sfx('ding'), T('n15'), .35]);
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
