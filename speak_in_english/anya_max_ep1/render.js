// «Аня и Макс. Вьетнам», серия 1 «Сама» (~65 s), hand-drawn style.
// node render.js still t1,t2 | chunk i n | audio | srt | cover t
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./hand_kit'), CA = require('./cast'), PE = require('./people');
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
const ORDER = [['x1', .5], ['x2', .3], ['a3', .3], ['a4', .7], ['c5', 1.0], ['a6', .2], ['c7', .5], ['a8', .25], ['s9', 1.0], ['a10', .3], ['s11', .3], ['a12', .3],
  ['a13', 1.4], ['x14', 2.0], ['a15', .3], ['s16', 1.1], ['x17', .3], ['a18', .4], ['x19', .6], ['a20', .4]];
const INNER = new Set(['a3', 'a4', 'a6', 'a8', 'a12']);
const LN = {};
{ let t = 0; for (const [id, gap] of ORDER) { const f = path.join(VD, id + '.mp3'), d = dur(f); t += gap; const w = JSON.parse(fs.readFileSync(path.join(VD, id + '.words.json'), 'utf8')).words;
  LN[id] = {id, at: t, dur: d, end: t + d, who: INNER.has(id) ? 'q' : id[0], env: envelope(f), words: w, file: f}; t += d; } }
const T = id => LN[id].at, E = id => LN[id].end, inW = (t, a, b) => t >= a && t < b;
const wordT = (id, w) => { const x = LN[id].words.find(q => q.w.toLowerCase().replace(/[^\p{L}]/gu, '').startsWith(w)); return T(id) + (x ? x.s : 0); };
const END0 = E('a20') + .7, TOTAL = END0 + 5.2;
const PH0 = T('a4') - .5, DOOR0 = T('c5') - .9, MK0 = T('s9') - .8, EVE0 = T('a13') - 1.1, CUT0 = T('a13') - .25, DIN0 = T('x14') - 1.6, KNOCK0 = T('s16') - 1.0;
const scene = t => t < PH0 ? 'desk' : t < DOOR0 ? 'phone' : t < MK0 ? 'door' : t < EVE0 ? 'market' : t < DIN0 ? 'kitchen' : t < KNOCK0 ? 'dinner' : 'door2';
const TXT = {
  x1: ["Yeah, sure. I'll send it by five.", 'Да, конечно. Пришлю к пяти.'], x2: [null, 'Ань, я до вечера на созвонах. Закажи еду в приложении, там всё просто.'],
  a3: [null, 'Отлично. Приготовлю ему ужин. Сама.'], a4: [null, 'Так... «эд ту карт»... «квонтити»... двадцать? Ну, пусть двадцать.'],
  c5: ['Delivery! Twenty kilos of rice! *Cash or card?*', 'Доставка! Двадцать кило риса! Наличные или карта?'], a6: [null, 'Кэш? Кард? Что это вообще?!'],
  c7: ['*Cash!* Okay! Thank you!', 'Наличные! Хорошо! Спасибо!'], a8: [null, 'Кэш... значит, наличные. Запомнила.'],
  s9: ['Hello! Tomatoes? *How many? One kilo?*', 'Здравствуйте! Помидоры? Сколько? Один кило?'], a10: ['*One kilo, please. How much?*', 'Один кило, пожалуйста. Сколько стоит?'],
  s11: ['Thirty thousand. Thank you! Oh... you have *beautiful* eyes!', 'Тридцать тысяч. Спасибо! Ой... у вас красивые глаза!'], a12: [null, 'Не знаю, что она сказала. Кивай и улыбайся.'],
  a13: [null, 'Да вы издеваетесь...'], x14: [null, 'Ого... Ань, ты как это всё купила?'], a15: [null, 'Сама. «Кэш, плиз». «Ван кило».'],
  s16: ['Hello, *beautiful!* You forgot your change!', 'Привет, красавица! Вы забыли сдачу!'], x17: [null, 'Говорит... ты сдачу забыла.'],
  a18: [null, 'А «бьютифул» — это что?'], x19: [null, 'Э-э... Покупательница.'], a20: [null, 'Хм. Покупательница...'],
};
const DICT = [['CASH OR CARD?', 'наличные или карта?'], ['ADD TO CART', 'в корзину'], ['ONE KILO, PLEASE', 'один кило, пожалуйста'], ['HOW MUCH?', 'сколько стоит?'], ['BEAUTIFUL', 'красивая']];

// ---------------- sets ----------------
function apartment(t, night) {
  DR(K.rr(-600, -400, 2800, 2000, 1), {fill: '#fde9c8', line: false, seed: 3, amp: 0, offset: 0});
  for (let x = -560, k = 0; x < 2200; x += 120, k++) DR([[x, -300], [x + 4, 1560]], {closed: false, lw: 12, seed: 120 + k, amp: 3, col: 'rgba(255,255,255,0.35)'});
  // kitchen window (left) with palm and sea
  const dark = night;
  DR(K.rr(10, 480, 480, 440, 14), {fill: dark ? '#2a3466' : '#8fd8ff', shade: dark ? '#1c2450' : '#6abdea', shadeDir: [-20, -14], seed: 131, lw: 9});
  if (!dark) { DR([[10, 820], [490, 790], [490, 920], [10, 920]], {fill: '#3fb5c9', line: false, seed: 132, amp: 1}); DR(P(380, 580, 40, 40, 133), {fill: '#fff3a0', seed: 134, lw: 5}); }
  stroke2([[150, 920], [170, 700], [200, 600]], 10, 135); for (let k = 0; k < 5; k++) { const a = -2.8 + k * .55; DR(P(200 + Math.cos(a) * 70, 600 + Math.sin(a) * 40, 70, 22, 136 + k, .1).map(([px, py]) => [px, py]), {fill: dark ? '#1f5a3a' : '#3cc24a', seed: 140 + k, lw: 5}); }
  if (dark) { g.save(); g.beginPath(); g.rect(10, 480, 480, 440); g.clip(); drops(20, 480, 480, 920, t, 12, 7); g.restore(); }
  K.stroke([[250, 486], [252, 914]], 8, 145); K.stroke([[16, 700], [484, 698]], 8, 146);
  // kitchen counter + stove
  DR([[-200, 1180], [560, 1176], [560, 1560], [-200, 1564]], {fill: '#7fc9b0', shade: '#5aa98e', seed: 150, lw: 8});
  DR([[-200, 1150], [580, 1146], [580, 1190], [-200, 1194]], {fill: '#fff8e8', seed: 151, lw: 6});
  for (const bx of [200, 380]) DR(P(bx, 1150, 60, 14, 152 + bx), {fill: '#3a3a44', seed: 153 + bx, lw: 5});
  // standing desk + laptop (right)
  DR([[880, 1250], [1320, 1246], [1320, 1290], [880, 1294]], {fill: '#d6a46a', shade: '#b8844a', seed: 160, lw: 7});
  for (const lx of [910, 1290]) K.stroke([[lx, 1290], [lx, 1690]], 10, 161 + lx);
  // plant + picture
  DR(K.rr(700, 540, 170, 210, 10), {fill: '#ffb3c8', shade: '#f08aa8', seed: 170, lw: 7}); DR(P(785, 645, 46, 46, 171), {fill: '#ffe08a', seed: 172, lw: 5});
  // door (right)
  DR(K.rr(1480, 760, 240, 820, 10), {fill: '#fff8e8', shade: '#ecd9bf', seed: 180, lw: 8}); DR(K.rr(1500, 780, 200, 800, 6), {fill: '#c98a44', shade: '#a86a2a', seed: 181, lw: 7});
  DR(P(1530, 1190, 12, 12, 182), {fill: '#ffd83a', seed: 183, lw: 4});
  // floor
  DR([[-600, 1560], [2200, 1556], [2200, 2400], [-600, 2400]], {fill: '#d9965a', shade: '#b8763a', shadeDir: [0, -40], seed: 51, lw: 8});
  for (let x = -500, k = 0; x < 2200; x += 140, k++) DR([[x, 1575], [x - 90, 2100]], {closed: false, lw: 5, seed: 200 + k, amp: 2, col: 'rgba(110,70,40,0.5)'});
}
function stroke2(pts, lw, seed) { K.stroke(pts, lw, seed); }
function laptop(x, y) { DR([[x - 110, y], [x + 110, y], [x + 130, y + 16], [x - 130, y + 16]], {fill: '#c9ced6', seed: 190, lw: 5}); DR([[x - 100, y], [x - 90, y - 140], [x + 90, y - 140], [x + 100, y]], {fill: '#3a3a44', seed: 191, lw: 6}); spot(x, y - 70, 50, 40, 'rgba(120,200,255,0.5)'); }
function market(t) {
  DR(K.rr(-400, -400, 1900, 2000, 1), {fill: '#ffd9a0', line: false, seed: 4, amp: 0, offset: 0});
  for (let k = 0; k < 4; k++) DR(K.rr(-60 + k * 300, 420, 250, 560, 12), {fill: ['#f6b26b', '#9fd3c7', '#f7c9d2', '#c9a7ff'][k], shade: 'rgba(0,0,0,0.12)', seed: 210 + k, lw: 7});
  for (let k = 0; k < 5; k++) { const lx = 60 + k * 230; K.stroke([[lx - 120, 330], [lx, 360], [lx + 120, 330]], 4, 220 + k); DR(P(lx, 400, 34, 44, 230 + k, .06), {fill: ['#e0303f', '#ffcc12', '#e0303f', '#ff8a2a', '#e0303f'][k], seed: 240 + k, lw: 5}); spot(lx, 400, 70, 70, 'rgba(255,220,120,0.35)'); }
  // awning
  for (let k = 0; k < 9; k++) DR([[-60 + k * 140, 1040], [80 + k * 140, 1040], [80 + k * 140, 1110], [-60 + k * 140, 1120]], {fill: k % 2 ? '#fffaf0' : '#3cb371', seed: 250 + k, lw: 6});
  DR([[-400, 1560], [1500, 1556], [1500, 2400], [-400, 2400]], {fill: '#b8b0a4', shade: '#968e82', seed: 260, lw: 8});
}
function stall(t) {
  DR([[420, 1380], [1180, 1376], [1180, 1700], [420, 1704]], {fill: '#c98a44', shade: '#a86a2a', seed: 270, lw: 8});
  DR([[400, 1360], [1200, 1356], [1200, 1400], [400, 1404]], {fill: '#e3a25a', seed: 271, lw: 6});
  for (let r = 0; r < 3; r++) for (let k = 0; k < 6 - r; k++) DR(P(520 + k * 46 + r * 23, 1330 - r * 36, 28, 26, 280 + r * 10 + k, .1), {fill: '#e0303f', shade: '#b8202c', seed: 300 + r * 10 + k, lw: 5});
  for (let k = 0; k < 4; k++) DR(P(900 + k * 60, 1330, 34, 22, 330 + k, .12), {fill: '#3cc24a', shade: '#1e9a30', seed: 340 + k, lw: 5});
  DR(K.rr(1050, 1250, 110, 90, 14), {fill: '#c9ced6', seed: 350, lw: 6}); K.hand('1 kg', 1105, 1295, 40, '#251c1a');
}
function phoneScreen(t) {
  const u = t - PH0;
  g.fillStyle = 'rgba(40,25,15,0.82)'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(540, 830); g.scale(.86, .86); g.rotate(-.03 + Math.sin(u * 2) * .01);
  DR(K.rr(-380, -760, 760, 1480, 70), {fill: '#2b2b33', seed: 400, lw: 9}); DR(K.rr(-340, -700, 680, 1360, 40), {fill: '#fffaf0', seed: 401, lw: 5});
  K.hand('FOODY', 0, -620, 80, '#ff6a2a'); K.hand('delivery', 0, -556, 42, '#5a6f8a');
  DR(K.rr(-290, -500, 580, 420, 30), {fill: '#fff1d6', seed: 402, lw: 5}); riceIcon(0, -330); K.hand('Rice — 1 kg', 0, -150, 56, '#251c1a');
  const qT = wordT('a4', 'quantity') || T('a4') + 1.4, dT = wordT('a4', 'двадцать'), q = t < qT ? 1 : t < dT ? Math.max(1, Math.round(1 + (t - qT) / (dT - qT) * 19)) : 20;
  K.hand('Quantity', -150, -20, 52, '#251c1a'); DR(K.rr(20, -70, 270, 100, 50), {fill: '#ffffff', seed: 403, lw: 5});
  K.hand('–', 70, -20, 64, '#251c1a'); K.hand(String(q), 155, -20, 64, q > 1 ? '#c0283a' : '#251c1a'); K.hand('+', 240, -20, 64, '#251c1a');
  const addT = wordT('a4', 'add') || T('a4') + .6, hi1 = t > addT, hi2 = t > E('a4') - .2;
  DR(K.rr(-290, 110, 580, 120, 60), {fill: hi1 ? '#ff6a2a' : '#ffb08a', seed: 404, lw: 6}); K.hand('Add to cart', 0, 170, 64, '#fffaf0');
  DR(K.rr(-290, 290, 580, 120, 60), {fill: hi2 ? '#3cb371' : '#9fdcb8', seed: 405, lw: 6}); K.hand('Checkout', 0, 350, 64, '#fffaf0');
  // russian hints
  if (hi1) K.hand('в корзину', 0, 250, 40, '#c0283a'); if (t > qT) K.hand('количество', -150, 30, 36, '#c0283a'); if (hi2) K.hand('оформить заказ', 0, 430, 40, '#c0283a');
  // finger
  const tgt = hi2 ? [60, 350] : t > qT ? [240, -20] : [60, 170], tap = Math.abs(Math.sin(u * 6)) * 14;
  DR(K.tube([[tgt[0] + 60, tgt[1] + 420], [tgt[0] + 20, tgt[1] + 160], [tgt[0], tgt[1] + 20 - tap]], 70, 52), {fill: '#ffd6b8', shade: '#f2a882', seed: 406, lw: 7});
  g.restore();
}
function riceIcon(x, y) { DR(P(x, y + 40, 150, 60, 410), {fill: '#5fb7e8', seed: 411, lw: 6}); DR(P(x, y, 120, 70, 412, .12), {fill: '#ffffff', shade: '#e8e2d6', seed: 413, lw: 6}); }
function candle(x, y, t) { DR(K.rr(x - 14, y - 70, 28, 70, 6), {fill: '#fff8e8', seed: 420 + x, lw: 4}); DR(P(x, y - 86 + Math.sin(t * 9 + x) * 2, 9, 16, 421 + x, .2), {fill: '#ffcc12', line: false, seed: 422 + x}); }
function dinnerTable(t) {
  DR([[520, 1420], [1040, 1416], [1040, 1460], [520, 1464]], {fill: '#e3a25a', shade: '#c08040', seed: 430, lw: 7}); for (const lx of [560, 1000]) K.stroke([[lx, 1460], [lx, 1690]], 10, 431 + lx);
  DR(P(700, 1400, 110, 30, 432), {fill: '#ffffff', seed: 433, lw: 5}); DR(P(700, 1360, 90, 50, 434, .12), {fill: '#fffaf0', shade: '#e8e2d6', seed: 435, lw: 5});
  DR(P(880, 1400, 80, 22, 436), {fill: '#ffffff', seed: 437, lw: 5}); for (let k = 0; k < 4; k++) DR(P(850 + k * 20, 1384, 14, 12, 438 + k), {fill: '#e0303f', seed: 442 + k, lw: 3});
  candle(600, 1418, t); candle(990, 1418, t);
}
function nightFx(t, pts) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(18,16,52,0.38)'; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; for (const [x, y] of pts) { const r = 260 + Math.sin(t * 7 + x) * 10, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,170,60,0.45)'); gr.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } g.restore();
}

// ---------------- direction ----------------
const st = (pose, mood, look, extra) => ({pose, mood, look, ...(extra || {})});
function anyaDir(t) {
  let s = st('down', 'happy', 'right');
  if (inW(t, T('x2'), E('x2'))) s = st('down', 'neutral', 'right');
  if (inW(t, T('a3'), PH0)) s = st('hips', 'smug', '');
  if (inW(t, DOOR0, T('a6'))) s = st('down', 'surprised', 'right');
  if (inW(t, T('a6'), E('a6') + .2)) s = st('shrug', 'surprised', 'right');
  if (inW(t, E('a6') + .2, T('a8'))) s = st('presentR', 'neutral', 'right');
  if (inW(t, T('a8'), MK0)) s = st('hips', 'smug', '');
  if (inW(t, MK0, T('a10'))) s = st('down', 'neutral', 'right');
  if (inW(t, T('a10'), T('s11'))) s = st('pointR', 'happy', 'right');
  if (inW(t, T('s11'), EVE0)) s = st('down', 'happy', 'right');
  if (inW(t, EVE0, CUT0)) s = st('hold', 'neutral', 'left');
  if (inW(t, CUT0, DIN0)) s = st('shrug', 'angry', 'up');
  if (inW(t, T('a13') + 1.4, DIN0)) s = st('hold', 'sad', 'left');
  if (inW(t, DIN0, T('a15'))) s = st('down', 'happy', 'right');
  if (inW(t, T('a15'), KNOCK0)) s = st('hips', 'smug', 'right');
  if (inW(t, KNOCK0, T('a18'))) s = st('down', 'happy', 'right');
  if (inW(t, T('a18'), T('x19'))) s = st('presentL', 'neutral', 'left');
  if (inW(t, T('x19'), T('a20'))) s = st('down', 'surprised', 'left');
  if (t >= T('a20')) s = st('cross', 'sleepy', 'left');
  return s;
}
function maxDir(t) {
  let s = st('hold', 'neutral', '', {phonesOn: true});
  if (t >= T('x2') - .3) s = st('presentL', 'neutral', 'left');
  if (t >= DIN0) s = st('down', 'surprised', 'left');
  if (t >= T('a15')) s = st('shrug', 'happy', 'left');
  if (t >= KNOCK0) s = st('down', 'neutral', 'right');
  if (inW(t, T('s16'), T('x17'))) s = st('down', 'surprised', 'right');
  if (inW(t, T('x17'), T('a18'))) s = st('down', 'neutral', 'left');
  if (inW(t, T('a18'), T('x19'))) s = st('shrug', 'surprised', '');
  if (t >= T('x19')) s = st('cross', 'smug', 'right');
  return s;
}

// ---------------- camera ----------------
const C = (z, cx, cy) => ({z, cx, cy});
const CUTS = [[0, C(1.45, 1080, 1000)], [T('x2'), C(1.05, 930, 1040)], [T('a3'), C(1.6, 720, 1000)], [PH0, C(1.1, 300, 1000)],
  [DOOR0, C(1, 1400, 1000)], [T('a6'), C(1.6, 1210, 1000)], [T('c7'), C(1, 1400, 1000)], [T('a8'), C(1.6, 1210, 1000)],
  [MK0, C(1, 560, 1000)], [T('s11'), C(1.45, 760, 950)], [T('a12'), C(1.6, 300, 1000)],
  [EVE0, C(1.15, 400, 1040)], [DIN0, C(1, 720, 1000)], [T('a15'), C(1.5, 480, 1000)],
  [KNOCK0, C(.8, 1260, 1060)], [T('x17'), C(1.5, 900, 980)], [T('a18'), C(1.6, 1220, 1000)], [T('x19'), C(1.6, 900, 980)], [T('a20'), C(1.7, 1220, 1000)]];
function camAt(t) { let c = CUTS[0], at = 0; for (const [a, cc] of CUTS) if (t >= a) { c = cc; at = a; } const push = 1 + Math.min(t - at, 4) * .012; return {z: c.z * push, cx: c.cx, cy: c.cy, at}; }

// ---------------- end card ----------------
function endCard(t) {
  const k = ease((t - END0) / .35); if (k <= 0) return;
  g.save(); g.globalAlpha = k * .45; g.fillStyle = '#3a2214'; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 60);
  DR(K.rr(70, 220, 940, 1260, 50), {fill: '#fff8e8', shade: '#f0dfb8', seed: 970, lw: 9});
  K.hand('Словарь Ани', 540, 320, 96, INK); K.hand('страница 1', 540, 400, 54, '#c0283a');
  DICT.forEach(([en, ru], q) => { const a = ease((t - END0 - .2 - q * .15) / .25); if (a <= 0) return; const y = 460 + q * 150; g.save(); g.globalAlpha = k * a;
    DR(K.rr(110, y, 860, 128, 26), {fill: q % 2 ? '#ffe2ea' : '#e3f4ff', seed: 980 + q, lw: 5}); K.hand(en, 540, y + 44, 54, INK); K.hand(ru, 540, y + 96, 44, '#c0283a'); g.restore(); });
  const a2 = ease((t - END0 - 1.4) / .3); g.globalAlpha = k * a2; K.hand('Что Аня сделает сама', 540, 1260, 58, INK); K.hand('в следующей серии?', 540, 1325, 58, INK);
  DR(K.rr(330, 1370, 420, 80, 40), {fill: '#ffd83a', seed: 990, lw: 6}); K.hand('СОХРАНИ', 540, 1412, 54, INK);
  g.restore();
}

// ---------------- frame ----------------
function inner(id, t) { // inner-voice subtitle: soft lilac, small cloud mark
  const ru = TXT[id][1], k = ease((t - T(id)) / .12) * (1 - ease((t - E(id) - .3) / .15)); if (k <= 0) return;
  g.save(); g.globalAlpha = k; const L = lines(ru.split(' ').map(q => ({t: q})), `64px ${FONT}`, 940); let y = SUBY + 10 - (L.length - 1) * 36;
  L.forEach(l => { outlined(l, y, 64, () => '#f1dcff'); y += 72; }); g.restore();
}
let SUBY = 1470;
function frame(t) {
  SUBY = scene(t) === 'phone' ? 1680 : 1470;
  const cam = camAt(t), sc = scene(t), br = s => Math.sin(t * 1.6 + s) * 3;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#fde9c8'; g.fillRect(0, 0, W, H);
  g.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.cx * cam.z, H / 2 - cam.cy * cam.z);
  const A = (x, extra) => { K.spot(x, 1712, 140, 22, 'rgba(40,20,10,0.28)'); PE.anya({x, t, by: br(0) - talk('a', t) * 5, mouth: talk('a', t), blink: blink(t, 2), ...posed(anyaDir, t), ...(extra || {})}); };
  const M = (x, extra) => { K.spot(x, 1712, 150, 22, 'rgba(40,20,10,0.28)'); PE.max({x, by: br(1) - talk('x', t) * 5, mouth: talk('x', t), blink: blink(t, 1), ...posed(maxDir, t), ...(extra || {})}); };
  if (sc === 'desk' || sc === 'phone') { apartment(t, false); M(1100); DR([[880, 1250], [1320, 1246], [1320, 1290], [880, 1294]], {fill: '#d6a46a', shade: '#b8844a', seed: 160, lw: 7}); laptop(1100, 1250); A(sc === 'phone' ? 300 : 720); if (sc === 'phone') { g.setTransform(1, 0, 0, 1, 0, 0); phoneScreen(t); } }
  else if (sc === 'door') { apartment(t, false); A(1220);
    PE.courier({x: 1600, by: br(4) - talk('c', t) * 5, mouth: talk('c', t), blink: blink(t, 3), pose: t > E('a6') + .2 ? 'presentL' : 'presentR', mood: 'happy', look: 'left', poseK: 1});
    PE.riceSack(1790, 1700, .9); if (inW(t, E('a6') + .2, T('a8') + 1)) { DR(K.rr(1370, 1140, 110, 60, 6), {fill: '#9fdcb8', seed: 500, lw: 4}); K.hand('100k', 1425, 1170, 30, '#1e6a3a'); } }
  else if (sc === 'market') { market(t); PE.seller({x: 780, by: br(5) - talk('s', t) * 5, mouth: talk('s', t), blink: blink(t, 5), pose: t > T('s11') ? 'presentL' : 'hold', mood: t > wordT('s11', 'beautiful') ? 'happy' : 'neutral', look: 'left', poseK: 1}); stall(t); A(300);
    if (inW(t, wordT('s11', 'beautiful') - .1, EVE0)) { const k = ease((t - wordT('s11', 'beautiful') + .1) / .3); for (let i = 0; i < 3; i++) { const hx = 520 + i * 60, hy = 820 - i * 40 - (t - wordT('s11', 'beautiful')) * 40; g.save(); g.globalAlpha = k * .9; DR([[hx, hy + 20], [hx - 26, hy - 6], [hx - 14, hy - 22], [hx, hy - 10], [hx + 14, hy - 22], [hx + 26, hy - 6]], {fill: '#ff6f9f', seed: 510 + i, lw: 4}); g.restore(); } } }
  else if (sc === 'kitchen') { apartment(t, t > CUT0); A(330);
    if (t > EVE0 + .4) { DR(P(400, 1290, 70, 18, 520), {fill: '#3a3a44', seed: 521, lw: 5}); K.stroke([[460, 1290], [560, 1270]], 8, 522); }
    if (t > CUT0) { candle(120, 1150, t); candle(520, 1150, t); nightFx(t, [[120, 1060], [520, 1060]]); }
    if (inW(t, CUT0 - .3, CUT0 - .1)) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(0, 0, W, H); g.restore(); } }
  else if (sc === 'dinner') { apartment(t, true); A(420); const mx = Math.max(880, 1400 - (t - DIN0) * 600); M(mx); dinnerTable(t); nightFx(t, [[600, 1330], [990, 1330]]); }
  else { apartment(t, true); M(900); A(1220); const k = ease((t - T('s16') + .5) / .4);
    if (t > T('s16') - .6) PE.seller({x: 1600 + (1 - k) * 260, by: br(5) - talk('s', t) * 5, mouth: talk('s', t), blink: blink(t, 5), pose: 'presentL', mood: 'happy', look: 'left', poseK: 1});
    nightFx(t, [[900, 1300], [1500, 1200]]); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(K.PAPER, 0, 0); const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (cam.at > 0 && t - cam.at < .05) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, 0, W, H); }
  for (const id in TXT) if (inW(t, T(id) - .05, E(id) + .5)) (INNER.has(id) ? inner : subtitle)(id, t);
  if (inW(t, T('a20') + .4, END0 + .3)) { const k = ease((t - T('a20') - .4) / .3); g.save(); g.globalAlpha = k; g.translate(540, 360); g.rotate(-.03); DR(K.rr(-330, -110, 660, 220, 40), {fill: '#fff8e8', shade: '#f0dfb8', seed: 995, lw: 8}); K.hand('beautiful', 0, -30, 92, '#c0283a'); K.hand('= красивая', 0, 55, 70, INK); g.restore(); }
  if (t > END0 - .1) endCard(t);
  if (t < END0) { g.font = `38px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = 'rgba(30,20,15,0.6)'; g.strokeText('@speak_in_english', W / 2, 1810); g.fillStyle = '#fffaf0'; g.fillText('@speak_in_english', W / 2, 1810); }
}

// ---------------- audio / srt ----------------
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = [];
  for (const id in LN) ev.push([LN[id].file, LN[id].at, 1.0]);
  for (let i = 0; i < 5; i++) ev.push([sfx('tap'), T('a4') + .3 + i * .55, .5]);
  ev.push([sfx('ding'), DOOR0 + .1, .6]); ev.push([sfx('coin'), E('a6') + .3, .6]); ev.push([sfx('swipe'), MK0, .4]); ev.push([sfx('coin'), E('a10') + .2, .5]); ev.push([sfx('pop'), wordT('s11', 'beautiful'), .45]);
  ev.push([sfx('swipe'), EVE0, .4]); ev.push([sfx('scratch'), CUT0 - .3, .5]); ev.push([sfx('steps'), DIN0, .5]); ev.push([sfx('tap'), KNOCK0 + .1, .8]); ev.push([sfx('tap'), KNOCK0 + .35, .8]); ev.push([sfx('ding'), END0, .45]);
  const args = ['-y', '-v', 'error'], fl = []; ev.forEach(([f]) => args.push('-i', f));
  args.push('-stream_loop', '-1', '-i', sfx('theme'), '-f', 'lavfi', '-t', String(TOTAL), '-i', 'anoisesrc=color=pink:amplitude=0.6:sample_rate=44100');
  ev.forEach(([f, at, gn], i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${gn},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`));
  const m = ev.length;
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume='0.12*(1-0.6*between(t,${CUT0},${DIN0}))':eval=frame,afade=t=in:d=0.6,afade=t=out:st=${TOTAL - 1.2}:d=1.2[mus]`);
  fl.push(`[${m + 1}:a]aformat=channel_layouts=stereo,lowpass=f=2600,highpass=f=300,volume='0.08*between(t,${EVE0},${END0})':eval=frame[rain]`);
  fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus][rain]amix=inputs=${m + 2}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(TMP, 'mix.wav'));
  const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } console.log('mix ok', TOTAL.toFixed(2));
}
function srt() {
  const f = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const id in LN) { const [en, ru] = TXT[id]; out += `${++n}\n${f(LN[id].at)} --> ${f(LN[id].end + .2)}\n${en ? en.replace(/\*/g, '') + '\n' + ru : (INNER.has(id) ? '(думает) ' : '') + ru}\n\n`; }
  fs.writeFileSync(path.join(OUT, 'anya_max_ep1.srt'), out); console.log('srt', n);
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
  g.save(); g.translate(540, 1540); g.rotate(-.03); DR(K.rr(-470, -150, 940, 300, 44), {fill: '#fff8e8', shade: '#f0dfb8', seed: 999, lw: 10}); K.hand('ПЕРЕЕХАЛА ВО ВЬЕТНАМ', 0, -55, 80, INK); K.hand('с английским A1', 0, 55, 84, '#c0283a'); g.restore();
  fs.writeFileSync(path.join(OUT, 'anya_max_ep1_cover.png'), cv.toBuffer('image/png')); console.log('cover');
}
