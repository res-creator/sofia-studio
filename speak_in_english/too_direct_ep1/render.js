// «Слишком прямо», выпуск 1 «Кофейня». Hand-drawn sketch, new characters (folk.js + cast_cafe.js).
// node render.js still t1,t2 | chunk i n | audio | srt | cover t
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./hand_kit'), CA = require('./cast'), F = require('./folk'), CC = require('./cast_cafe');
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
const ORDER = [['o1', .4], ['d1', .3], ['n1', 1.7], ['o2', .3], ['d2', .3], ['d3', .7], ['o4', .4], ['m1', .5], ['d4', .2], ['w1', 1.0], ['l1', .3],
  ['n2', 1.5], ['d5', 1.4], ['o5', .4], ['d6', .2], ['d7', 1.3], ['n3', .4], ['p1', 1.1], ['d8', .4], ['n4', .4]];
const LN = {};
{ let t = 0; for (const [id, gap] of ORDER) { const f = path.join(VD, id + '.mp3'), d = dur(f); t += gap; const w = JSON.parse(fs.readFileSync(path.join(VD, id + '.words.json'), 'utf8')).words;
  LN[id] = {id, at: t, dur: d, end: t + d, who: id[0], env: envelope(f), words: w, file: f}; t += d; } }
const T = id => LN[id].at, E = id => LN[id].end, inW = (t, a, b) => t >= a && t < b;
const wordT = (id, w) => { const x = LN[id].words.find(q => q.w.toLowerCase().replace(/[^\p{L}]/gu, '').startsWith(w)); return T(id) + (x ? x.s : 0); };
const END0 = E('n4') + .5, TOTAL = END0 + 4.2;
const FREEZE0 = E('d1') + .1, FREEZE1 = T('n1') + LN.n1.dur + .2, CRY0 = E('d2') - .2, FAINT0 = E('d4') + .15, NEWS0 = T('w1') - .5, KING0 = wordT('w1', 'king') - .1, SIGNS0 = T('l1') + .9;
const RW0 = T('n2') + .2, RW1 = RW0 + 1.3, TAKE2 = RW1, CUP0 = E('d6') + .2, STREET0 = T('p1') - .8;
let SUBY = 1470;
const TXT = {
  o1: ['Hiya, love! What can I get you?', 'Привет, дорогуша! Что вам?'], d1: ['*Give me* a coffee.', 'Дай мне кофе.'],
  n1: [null, 'Для англичанина «give me» звучит как приказ. Как будто вы сказали: «Эй, ты! Кофе мне!»'],
  o2: ['...Give you?', '...Дать вам?'], d2: ['Yes. A coffee. A large one. *And fast.*', 'Да. Кофе. Большой. И быстро.'],
  d3: ['*Why are you smiling?* We are not friends.', 'Чего ты улыбаешься? Мы не друзья.'], o4: ["Mum... he asked why I'm smiling...", 'Мам... он спросил, почему я улыбаюсь...'],
  m1: ['Is everything alright here?', 'Здесь всё в порядке?'], d4: ["No. I still don't have a coffee.", 'Нет. У меня до сих пор нет кофе.'],
  w1: ['Breaking news: a man has asked for a coffee... *without saying please.* The King has been informed.', 'Срочная новость: мужчина попросил кофе... не сказав «пожалуйста». Королю доложили.'],
  l1: ['*How rude!*', 'Какая грубость!'], n2: [null, 'Стоп. Перематываем.'],
  d5: ['Hi! *Could I have* a large latte, *please?*', 'Здравствуйте! Можно мне большой латте, пожалуйста?'], o5: ['Of course, love! Name?', 'Конечно, дорогуша! Как вас зовут?'],
  d6: [null, 'Дима.'], d7: ['Lovely. Thank you!', 'Чудесно. Спасибо!'], n3: [null, '«Give me» — это приказ. А «could I have... please» — волшебные слова.'],
  p1: ['Oh, sorry!', 'Ой, простите!'], d8: [null, 'За что?'], n4: [null, 'В следующем выпуске: почему англичане извиняются, когда наступили им.'],
};
const scene = t => t < STREET0 ? 'cafe' : 'street';

// ---------------- set ----------------
function cafe(t, s) {
  DR(K.rr(-900, -400, 3000, 2000, 1), {fill: '#cfe8d8', line: false, seed: 3, amp: 0, offset: 0});
  for (let y = 300; y < 1250; y += 70) for (let x = -900 + ((y / 70) % 2) * 60; x < 2100; x += 120) DR(K.rr(x, y, 112, 62, 8), {fill: '#e3f2e8', line: false, seed: 4 + (x + y) % 50, amp: 0, offset: 0});
  // menu board
  DR(K.rr(200, 120, 680, 300, 20), {fill: '#2b3a32', shade: '#1e2a24', seed: 10, lw: 8});
  K.hand('COFFEE', 540, 180, 64, '#fffaf0'); K.hand('small · medium · large', 540, 260, 46, '#ffd23f'); K.hand('LATTE  ·  TEA  ·  CAKE', 540, 340, 40, '#cfe8d8');
  // king portrait (turns away)
  const kt = clamp((t - KING0) / .6) * (t < RW0 ? 1 : 0);
  DR(K.rr(460, 470, 170, 210, 12), {fill: '#e9b64a', shade: '#c99128', seed: 20, lw: 7}); DR(K.rr(478, 488, 134, 174, 6), {fill: '#9fc8e8', seed: 21, lw: 4});
  const sx = Math.cos(kt * Math.PI); g.save(); g.translate(545, 590); g.scale(Math.abs(sx) < .05 ? .05 : Math.abs(sx), 1);
  if (sx > 0) { DR(P(0, 0, 44, 52, 22), {fill: '#f6d2b8', seed: 23, lw: 5}); K.stroke([[-18, 20], [0, 14], [18, 20]], 4, 24); spot(-16, -8, 4, 4, INK); spot(16, -8, 4, 4, INK); DR([[-30, 30], [0, 22], [30, 30], [20, 38], [-20, 38]], {fill: '#d9d6df', seed: 25, lw: 3}); }
  else DR(P(0, 0, 44, 52, 26), {fill: '#d9d6df', shade: '#b8b4c2', seed: 27, lw: 5});
  DR([[-40, -46], [-30, -82], [-14, -60], [0, -88], [14, -60], [30, -82], [40, -46]], {fill: '#ffcc12', seed: 28, lw: 4}); g.restore();
  // flag on a little pole (lowers at the peak, rises in take 2)
  const fl = s.flagDown ? clamp((t - SIGNS0) / 1.2) : 0, fy = 470 + fl * 380;
  K.stroke([[1180, 460], [1182, 1250]], 8, 30);
  g.save(); g.translate(1184, fy); DR(K.rr(0, 0, 200, 120, 6), {fill: '#1f3a8a', seed: 31, lw: 5}); K.stroke([[0, 0], [200, 120]], 10, 32); K.stroke([[200, 0], [0, 120]], 10, 33); DR([[90, 0], [110, 0], [110, 120], [90, 120]], {fill: '#fffaf0', line: false, seed: 34}); DR([[0, 50], [200, 50], [200, 70], [0, 70]], {fill: '#fffaf0', line: false, seed: 35}); DR([[96, 0], [104, 0], [104, 120], [96, 120]], {fill: '#e0303f', line: false, seed: 36}); DR([[0, 56], [200, 56], [200, 64], [0, 64]], {fill: '#e0303f', line: false, seed: 37}); g.restore();
  // TV on the left wall
  DR(K.rr(-560, 420, 420, 280, 18), {fill: '#2b2b33', seed: 40, lw: 8}); DR(K.rr(-536, 444, 372, 232, 8), {fill: t > NEWS0 && t < RW0 ? '#3a5a9a' : '#4a4a55', seed: 41, lw: 4});
  if (t > NEWS0 && t < RW0) { DR(P(-350, 560, 46, 52, 42), {fill: '#e9b48e', seed: 43, lw: 4}); spot(-366, 552, 5, 5, INK); spot(-334, 552, 5, 5, INK); { const wm = talk('w', t); DR(P(-350, 588, 12, 3 + wm * 9, 46), {fill: '#8f2b33', seed: 47, lw: 3}); } DR([[-396, 520], [-350, 500], [-304, 520], [-310, 540], [-390, 540]], {fill: '#3a2a22', seed: 48, lw: 3}); DR([[-410, 640], [-290, 640], [-280, 676], [-420, 676]], {fill: '#2b2b33', seed: 44, lw: 3}); DR(K.rr(-536, 630, 372, 40, 2), {fill: '#c0283a', line: false, seed: 45}); K.hand('BREAKING NEWS', -350, 650, 30, '#fffaf0'); }
  // floor
  DR([[-900, 1560], [2100, 1556], [2100, 2400], [-900, 2400]], {fill: '#b8834e', shade: '#96652f', shadeDir: [0, -40], seed: 50, lw: 8});
  for (let x = -900, k = 0; x < 2100; x += 120, k++) DR([[x, 1570], [x - 80, 2100]], {closed: false, lw: 4, seed: 200 + k, amp: 2, col: 'rgba(90,60,30,0.45)'});
}
function counter(t) {
  DR([[560, 1290], [1400, 1286], [1400, 1720], [560, 1724]], {fill: '#7a4a2a', shade: '#5a3418', seed: 60, lw: 8});
  DR([[540, 1270], [1420, 1266], [1420, 1310], [540, 1314]], {fill: '#e3a25a', seed: 61, lw: 6});
  DR(K.rr(1060, 1080, 220, 190, 16), {fill: '#c9ced6', shade: '#a6adb8', seed: 62, lw: 7}); DR(K.rr(1110, 1180, 50, 70, 6), {fill: '#2b2b33', seed: 63, lw: 4}); spot(1170, 1120, 14, 14, '#3cb371');
  for (const [cx, s] of [[640, 64], [700, 66]]) { DR([[cx - 22, 1220], [cx + 22, 1220], [cx + 18, 1270], [cx - 18, 1270]], {fill: '#fffaf0', seed: s, lw: 4}); }
}
function street(t) {
  DR(K.rr(-600, -400, 2400, 2000, 1), {fill: '#c8664a', line: false, seed: 5, amp: 0, offset: 0});
  for (let y = -380, r = 0; y < 1560; y += 64, r++) K.stroke([[-600, y], [1800, y + 2]], 3, 100 + r, 1);
  DR(K.rr(120, 600, 420, 960, 20), {fill: '#2f8a5a', shade: '#1f6a40', seed: 110, lw: 9}); K.hand('CAFÉ', 330, 680, 70, '#fffaf0');
  DR(K.rr(660, 500, 380, 420, 14), {fill: '#9fd3ff', shade: '#79b6ea', seed: 111, lw: 8});
  DR([[-600, 1580], [1800, 1576], [1800, 2400], [-600, 2400]], {fill: '#9aa0a8', shade: '#7b8088', seed: 116, lw: 8});
}
function cup(x, y, s, name, k) {
  g.save(); g.translate(x, y); g.scale(s, s);
  DR([[-90, -140], [90, -140], [70, 140], [-70, 140]], {fill: '#fffaf0', shade: '#e8dcc6', seed: 70, lw: 7}); DR(K.rr(-100, -170, 200, 40, 14), {fill: '#2b2b33', seed: 71, lw: 6}); DR([[-84, -40], [84, -40], [78, 60], [-78, 60]], {fill: '#2f8a5a', seed: 72, lw: 5});
  if (name) { const n = name.slice(0, Math.max(0, Math.round(name.length * k))); g.font = `64px ${FONT}`; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 0, -90); }
  g.restore();
}
function tears(x, y, t, k) { if (k <= 0) return; for (const q of [-1, 1]) for (let i = 0; i < 3; i++) { const u = ((t * 1.6 + i / 3) % 1); DR(P(x + q * 54 + q * u * 30, y + 40 + u * 220, 9, 14, 80 + i), {fill: '#7fc4f0', seed: 81 + i, lw: 3}); } }
function sign(x, y, r, txt) { g.save(); g.translate(x, y); g.rotate(r); g.scale(1.5, 1.5); K.stroke([[0, 0], [0, 200]], 8, 90); DR(K.rr(-130, -110, 260, 120, 10), {fill: '#fffaf0', seed: 91, lw: 6}); K.hand('Mildly', 0, -70, 40, INK); K.hand('disappointed', 0, -30, 34, INK); g.restore(); }
function notes(t, x0) { for (let i = 0; i < 6; i++) { const u = ((t * .6 + i / 6) % 1), x = x0 + i * 160 + Math.sin(t * 3 + i) * 20, y = 900 - u * 600; g.save(); g.globalAlpha = Math.sin(u * Math.PI); DR(P(x, y, 18, 14, 95 + i), {fill: INK, seed: 1, lw: 2}); K.stroke([[x + 16, y], [x + 16, y - 70]], 5, 96 + i); g.restore(); } }

// ---------------- direction ----------------
const st = (pose, mood, look, extra) => ({pose, mood, look, ...(extra || {})});
function dimaDir(t) {
  let s = st('down', 'sleepy', 'right');
  if (inW(t, T('d3'), E('d3'))) s = st('shrug', 'sleepy', 'right');
  if (inW(t, T('d4'), E('d4'))) s = st('hips', 'sleepy', 'right');
  if (t >= TAKE2) s = st('down', 'neutral', 'right');
  if (inW(t, T('d5'), E('d5'))) s = st('presentR', 'happy', 'right');
  if (inW(t, CUP0, E('d7') + .3)) s = st('hold', t < T('d7') ? 'surprised' : 'happy', 'right');
  if (t >= STREET0) s = st('hold', 'happy', 'right');
  if (t >= T('p1') + .2) s = st('hold', 'surprised', 'left');
  return s;
}
function oliDir(t) {
  let s = st('presentL', 'happy', 'left');
  if (t >= FREEZE0) s = st('down', 'surprised', 'left');
  if (t >= CRY0) s = st('down', 'sad', 'left');
  if (inW(t, T('o4') - .3, T('m1'))) s = st('presentR', 'sad', '');
  if (t >= TAKE2) s = st('presentL', 'happy', 'left');
  if (inW(t, CUP0, E('d7'))) s = st('hold', 'smug', 'left');
  return s;
}

// ---------------- camera ----------------
const C = (z, cx, cy) => ({z, cx, cy});
const CAMS = t => {
  const L = [[0, C(1.55, 780, 1000)], [T('d1'), C(1.6, 380, 1000)], [FREEZE0, C(1.55, 780, 1000)], [T('o2'), C(1.6, 780, 1000)], [T('d2'), C(1.6, 380, 1000)], [CRY0, C(1.05, 600, 1040)],
    [T('d3'), C(1.6, 380, 1000)], [T('o4'), C(1.6, 780, 1000)], [T('m1') - .4, C(1, 700, 1040)], [NEWS0, C(1.9, -350, 600)], [KING0, C(2.4, 545, 590)], [T('l1') - .2, C(1.6, 140, 1000)],
    [SIGNS0, C(.66, 260, 1060)], [TAKE2, C(1, 600, 1040)], [T('o5'), C(1.6, 780, 1000)], [CUP0, C(1, 600, 1040)], [T('d7'), C(1.6, 380, 1000)], [T('n3') - .2, C(1, 600, 1040)],
    [STREET0, C(1, 540, 1040)], [T('d8'), C(1.6, 520, 1000)], [T('n4'), C(1, 540, 1040)]];
  let c = L[0], at = 0; for (const [a, cc] of L) if (t >= a) { c = cc; at = a; } return {z: c[0] !== undefined ? c.z : c.z, cx: c.cx, cy: c.cy, at, push: 1 + Math.min(t - at, 4) * .012};
};

// ---------------- scene drawing at a "story time" ----------------
function drawCafe(t, real) {
  const take2 = t >= TAKE2, br = s => Math.sin(t * 1.6 + s) * 3;
  cafe(t, {flagDown: !take2 && t >= SIGNS0});
  const queue = [['biz', -380], ['hip', -120], ['lady', 140]];
  queue.forEach(([id, x], i) => { const cheer = take2 && t > T('o5') - .3, signs = !take2 && t >= SIGNS0;
    const lt = id === 'lady' ? talk('l', t) : 0;
    F.person(CC[id], {x, by: br(i + 5) - lt * 4, mouth: lt, blink: blink(t, i + 3), pose: cheer ? 'cheer' : signs ? 'up' : 'down', mood: cheer ? 'happy' : id === 'lady' && t > T('l1') - .1 ? 'surprised' : signs ? 'sleepy' : 'neutral', look: 'right', poseK: 1});
    if (signs) sign(x + 10, 640, (i - 1) * .06, ''); });
  // barista + manager behind the counter
  const ot = talk('o', t), cryK = !take2 && t >= CRY0 ? 1 : 0, shake = !take2 && inW(t, T('o2'), E('o2')) ? Math.sin(t * 60) * 4 : 0;
  F.person(CC.oli, {x: 820 + shake, by: br(1) - ot * 5, mouth: ot, blink: blink(t, 1), ...posed(oliDir, t)});
  tears(820, 974, t, cryK);
  if (!take2 && inW(t, T('o4') - .3, T('m1'))) DR(K.rr(990, 1060, 60, 110, 10), {fill: '#2b2b33', seed: 100, lw: 4});
  if (!take2 && t >= FREEZE0 && t < T('o2') + .2) { K.stroke([[760, 1060], [790, 1080], [810, 1066], [840, 1090], [870, 1070]], 4, 101); }
  if (!take2 && t >= T('m1') - .4) { const mk = clamp((t - T('m1') + .4) / .4), fall = clamp((t - FAINT0) / .45); const mx = 1090 + (1 - mk) * 300, mt = talk('m', t);
    g.save(); g.translate(mx, 1700); g.rotate(fall * 1.45); g.translate(-mx, -1700); F.person(CC.man, {x: mx, by: br(2) - mt * 5, mouth: mt, blink: fall > .3 || blink(t, 2), pose: fall > 0 ? 'up' : 'hips', mood: fall > 0 ? 'happy' : 'surprised', look: 'left', poseK: 1}); g.restore(); }
  counter(t);
  if (take2 && inW(t, CUP0 - .2, STREET0)) cup(700, 1160, .6, 'DEEMER', clamp((t - CUP0) / .8));
  // Dima in front
  const dt = talk('d', t); K.spot(380, 1712, 140, 22, 'rgba(40,20,10,0.28)');
  F.person(CC.dima, {x: 380, by: br(0) - dt * 4, mouth: dt, blink: blink(t, 0), ...posed(dimaDir, t)});
  if (take2 && t > T('o5') - .3) notes(t, 150);
}
function frame(t) {
  const cam = CAMS(t), sc = scene(t);
  let story = t;
  const freeze = t >= FREEZE0 && t < FREEZE1; if (freeze) story = FREEZE0;
  const rewind = t >= RW0 && t < RW1; if (rewind) story = E('l1') + .8 - (E('l1') + .8 - T('o1')) * ease((t - RW0) / (RW1 - RW0));
  const vcam = rewind ? CAMS(story) : cam, z = vcam.z * (rewind ? 1 : cam.push);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#cfe8d8'; g.fillRect(0, 0, W, H);
  g.setTransform(z, 0, 0, z, W / 2 - vcam.cx * z, H / 2 - vcam.cy * z);
  if (sc === 'cafe') drawCafe(story, t);
  else { street(t); const dt = talk('d', t), pk = clamp((t - STREET0 - .3) / .5); K.spot(560, 1712, 140, 22, 'rgba(40,20,10,0.28)');
    F.person(CC.dima, {x: 560 - (t < T('p1') ? (1 - pk) * 300 : 0), by: Math.sin(t * 1.6) * 3 - dt * 4, mouth: dt, blink: blink(t, 0), ...posed(dimaDir, t)}); cup(560 + 50, 1360, .35, 'DEEMER', 1);
    const pt = talk('p', t), px = 900 + (t < T('p1') ? (1 - clamp((t - STREET0) / .8)) * 400 : 0); F.person(CC.pass, {x: px, by: Math.sin(t * 1.6 + 2) * 3 - pt * 4, mouth: pt, blink: blink(t, 4), pose: 'presentL', mood: t > T('p1') ? 'sad' : 'surprised', look: 'left', poseK: 1}); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (freeze) { g.fillStyle = 'rgba(80,80,90,0.35)'; g.fillRect(0, 0, W, H); }
  if (rewind) { g.fillStyle = 'rgba(30,30,60,0.25)'; g.fillRect(0, 0, W, H); for (let i = 0; i < 9; i++) { const y = ((t * 900 + i * 230) % H); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, y, W, 6 + (i % 3) * 4); } K.hand('REWIND', 220, 160, 80, '#fffaf0'); DR([[60, 120], [120, 160], [60, 200]], {fill: '#fffaf0', seed: 300, lw: 0, line: false}); }
  g.drawImage(K.PAPER, 0, 0); const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (cam.at > 0 && t - cam.at < .05 && !rewind) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, 0, W, H); }
  // title card during the freeze
  if (freeze) { const k = ease((t - FREEZE0) / .25); g.save(); g.globalAlpha = k; g.translate(540, 330); g.rotate(-.03); g.scale(.85 + .15 * k, .85 + .15 * k);
    DR(K.rr(-440, -150, 880, 300, 40), {fill: '#c0283a', shade: '#a01828', seed: 310, lw: 10}); K.hand('СЛИШКОМ ПРЯМО', 0, -40, 110, '#fffaf0'); K.hand('так в Лондоне заказывать НЕЛЬЗЯ', 0, 70, 52, '#ffe08a'); g.restore(); }
  // rule card
  if (inW(t, T('n3') - .1, E('n3') + .8)) { const k = ease((t - T('n3') + .1) / .3); g.save(); g.globalAlpha = k; g.translate(540, 420); g.rotate(-.02);
    DR(K.rr(-460, -260, 920, 520, 40), {fill: '#fff8e8', shade: '#f0dfb8', seed: 320, lw: 9});
    K.hand('Give me…', -200, -170, 70, '#c0283a'); K.hand('= приказ', 220, -170, 60, INK); K.stroke([[-330, -170], [-70, -170]], 6, 321);
    K.hand('Could I have…, please?', 0, -70, 66, '#2f8a5a'); K.hand('= вежливо', 0, 0, 56, INK);
    K.hand('small · medium · large', 0, 90, 54, '#2f8a5a'); K.hand('(а не big)', 0, 150, 44, INK); K.hand('love = «дорогуша», это не признание', 0, 210, 40, '#5a6f8a'); g.restore(); }
  SUBY = 1470;
  for (const id in TXT) if (inW(t, T(id) - .05, E(id) + .5) && !(rewind)) subtitle(id, t);
  // end card
  if (t > END0 - .1) { const k = ease((t - END0) / .35); g.save(); g.globalAlpha = k * .5; g.fillStyle = '#3a2214'; g.fillRect(0, 0, W, H); g.restore(); g.save(); g.globalAlpha = k;
    DR(K.rr(110, 560, 860, 700, 50), {fill: '#fff8e8', shade: '#f0dfb8', seed: 330, lw: 9}); K.hand('СЛИШКОМ ПРЯМО', 540, 680, 84, '#c0283a'); K.hand('выпуск 2:', 540, 790, 60, INK); K.hand('SORRY', 540, 890, 110, INK); K.hand('Какую ситуацию разобрать?', 540, 1020, 52, INK); K.hand('Пиши в комментариях', 540, 1090, 52, '#c0283a');
    DR(K.rr(330, 1150, 420, 80, 40), {fill: '#ffd83a', seed: 331, lw: 6}); K.hand('ПОДПИШИСЬ', 540, 1192, 52, INK); g.restore(); }
  if (t < END0) { g.font = `38px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = 'rgba(30,20,15,0.6)'; g.strokeText('@speak_in_english', W / 2, 1810); g.fillStyle = '#fffaf0'; g.fillText('@speak_in_english', W / 2, 1810); }
}

// ---------------- audio / srt ----------------
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = [];
  for (const id in LN) ev.push([LN[id].file, LN[id].at, 1.0]);
  ev.push([sfx('scratch'), FREEZE0 - .05, .8]); ev.push([sfx('pop'), FREEZE0 + .1, .5]); ev.push([sfx('whoosh'), FAINT0, .6]); ev.push([sfx('tap'), FAINT0 + .45, .9]);
  ev.push([sfx('ding'), NEWS0, .5]); ev.push([sfx('swipe'), KING0, .4]); ev.push([sfx('pop'), SIGNS0, .4]); ev.push([sfx('pop'), SIGNS0 + .15, .4]); ev.push([sfx('pop'), SIGNS0 + .3, .4]);
  ev.push([sfx('scratch'), RW0, .6, 'areverse']); ev.push([sfx('whoosh'), RW0 + .2, .5]); ev.push([sfx('chime'), T('o5') - .2, .6]); ev.push([sfx('tap'), T('o5') + .1, .5]); ev.push([sfx('tap'), T('o5') + .3, .5]); ev.push([sfx('tap'), T('o5') + .5, .5]);
  ev.push([sfx('swipe'), T('n3') - .1, .4]); ev.push([sfx('swipe'), STREET0, .4]); ev.push([sfx('pop'), T('p1') - .15, .6]); ev.push([sfx('ding'), END0, .45]);
  const args = ['-y', '-v', 'error'], fl = []; ev.forEach(([f]) => args.push('-i', f));
  args.push('-stream_loop', '-1', '-i', sfx('theme'));
  ev.forEach(([f, at, gn, x], i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo${x ? ',' + x : ''},volume=${gn},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`));
  const m = ev.length;
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume='0.12*(1-0.85*between(t,${FREEZE0},${FREEZE1}))*(1-0.85*between(t,${RW0},${RW1}))':eval=frame,afade=t=in:d=0.6,afade=t=out:st=${TOTAL - 1.2}:d=1.2[mus]`);
  fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus]amix=inputs=${m + 1}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(TMP, 'mix.wav'));
  const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } console.log('mix ok', TOTAL.toFixed(2));
}
function srt() {
  const f = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const id in LN) { const [en, ru] = TXT[id]; out += `${++n}\n${f(LN[id].at)} --> ${f(LN[id].end + .2)}\n${en ? en.replace(/\*/g, '') + '\n' + ru : ru}\n\n`; }
  fs.writeFileSync(path.join(OUT, 'too_direct_ep1.srt'), out); console.log('srt', n);
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
  frame(parseFloat(a1)); g.setTransform(1, 0, 0, 1, 0, 0);
  g.save(); g.translate(540, 1540); g.rotate(-.03); DR(K.rr(-470, -150, 940, 300, 44), {fill: '#c0283a', shade: '#a01828', seed: 999, lw: 10}); K.hand('«GIVE ME A COFFEE»', 0, -50, 84, '#fffaf0'); K.hand('и Лондон в слезах', 0, 60, 76, '#ffe08a'); g.restore();
  fs.writeFileSync(path.join(OUT, 'too_direct_ep1_cover.png'), cv.toBuffer('image/png')); console.log('cover');
}
