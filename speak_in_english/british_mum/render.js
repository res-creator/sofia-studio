// «Знакомство с британской мамой» — mini-story (~65 s), hand-drawn style. Tom, Kate, Kate's British mum.
// What Mum says (English) vs what she thinks (Russian thought cloud + whisper). node render.js still t | chunk i n | audio | srt | cover t
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./hand_kit'), CA = require('./cast');
const {heroine, tom, ease} = CA;
const W = 1080, H = 1920, FPS = 30, FONT = K.FONT, INK = '#251c1a';
const D = __dirname, VD = path.join(D, 'voice'), OUT = path.join(D, 'out'), TMP = path.join(OUT, 'tmp');
fs.mkdirSync(TMP, {recursive: true});
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const DR = (pts, o) => K.draw(pts, o), P = K.potato;
let g;

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
// ---------------- Mum (new, same style): curly auburn hair, round glasses, green dress, white apron ----------------
const MP = {skin: '#ffcfae', skinS: '#f0a07a', hair: '#c2502a', hairS: '#93361a', dress: '#4fb06a', dressS: '#2f8a4c', apron: '#fffaf0', apronS: '#e9dcc4', shoe: '#7a3b2a', shoeS: '#55241a', iris: '#5a3b8a', brow: '#93361a'};
function mum(st) {
  const p = MP, x = st.x, by = st.by || 0, sy = 1220 + by, hy = 965 + by;
  CA.legs(x, 1480, 1690, p.skin, p.skinS, p.shoe, p.shoeS, 700, 44);
  DR([[x - 104, sy - 25], [x + 104, sy - 25], [x + 168, 1530], [x - 166, 1534]], {fill: p.dress, shade: p.dressS, seed: 710, lw: 8});
  DR([[x - 82, sy + 120], [x + 82, sy + 120], [x + 116, 1505], [x - 114, 1508]], {fill: p.apron, shade: p.apronS, seed: 711, lw: 6});
  DR(P(x, sy + 330, 50, 34, 712, .1), {fill: p.apron, shade: p.apronS, seed: 713, lw: 5});
  for (const s of [-1, 1]) K.stroke([[x + s * 82, sy + 122], [x + s * 60, sy - 10]], 6, 714 + s);
  CA.arms(st, x, sy, p.dress, p.dressS, p.skin, p.skinS, 720, 44, 36);
  DR(K.tube([[x, hy + 120], [x, sy - 20]], 50, 56), {fill: p.skinS, seed: 730, lw: 6});
  // curly hair behind
  for (let k = 0; k < 11; k++) { const a = Math.PI * (0.9 + k / 10 * 1.2); DR(P(x + Math.cos(a) * 160, hy - 20 + Math.sin(a) * 160, 64, 60, 740 + k, .12), {fill: p.hair, shade: p.hairS, seed: 760 + k, lw: 7}); }
  for (const s of [-1, 1]) DR(P(x + s * 160, hy + 70, 56, 64, 780 + s, .12), {fill: p.hair, shade: p.hairS, seed: 782 + s, lw: 7});
  DR(P(x, hy + 24, 146, 150, 785, .06), {fill: p.skin, shade: p.skinS, shadeDir: [18, 14], seed: 786, lw: 8});
  for (let k = 0; k < 6; k++) DR(P(x - 110 + k * 44, hy - 112 + Math.abs(k - 2.5) * 10, 40, 36, 790 + k, .12), {fill: p.hair, shade: p.hairS, seed: 800 + k, lw: 6});
  K.spot(x - 98, hy + 82, 38, 22, 'rgba(255,90,120,0.42)'); K.spot(x + 98, hy + 82, 38, 22, 'rgba(255,90,120,0.42)');
  CA.eyes(x, hy + 18, st, {dx: 56, rx: 27, ry: 30, iris: p.iris, lashes: true, brow: p.brow, browW: 7, skin: p.skin});
  for (const s of [-1, 1]) DR(P(x + s * 56, hy + 18, 46, 44, 810 + s, .04), {lw: 6, seed: 812 + s, col: '#7a3b8a'});
  K.stroke([[x - 12, hy + 18], [x + 12, hy + 18]], 6, 814);
  K.stroke([[x + 2, hy + 46], [x - 10, hy + 74], [x + 8, hy + 76]], 5, 815);
  CA.mouth(x, hy + 110, st, '#d9566b', 816);
  for (const s of [-1, 1]) DR(P(x + s * 150, hy + 120, 10, 12, 817 + s), {fill: '#ffd83a', seed: 819 + s, lw: 4});
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
  let y = 1470 - (ens.length - 1) * 40;
  ens.forEach(l => { outlined(l, y, 76, w => w.hot ? '#ffd23f' : '#fffaf0'); y += 82; });
  rus.forEach(l => { outlined(l, y + (en ? -8 : 0), en ? 52 : 70, () => en ? '#bfe9ff' : '#fffaf0'); y += en ? 58 : 78; });
  g.restore();
}

// ---------------- timeline ----------------
const ORDER = [['t0', .4], ['k1', .7], ['m2', .2], ['i2', .15], ['t3', .4], ['m4', .3], ['i4', .15], ['t5', .25], ['t6', .35], ['m6', .3], ['i6', .15], ['t7', .4], ['m8', .2], ['i8', .15],
  ['k9', .2], ['m10', .5], ['i10', .15], ['t11', .2], ['m12', .45], ['i12', .15], ['t13', .3], ['t14', 1.4], ['m15', 1.0], ['i15', .2], ['n16', .9]];
const LN = {};
{ let t = 0; for (const [id, gap] of ORDER) { const f = path.join(VD, id + '.mp3'), d = dur(f); t += gap; const w = JSON.parse(fs.readFileSync(path.join(VD, id + '.words.json'), 'utf8')).words;
  LN[id] = {id, at: t, dur: d, end: t + d, who: id[0], env: envelope(f), words: w, file: f, text: SCRIPT.lines[id][1].replace(/\[[^\]]+\]\s*/g, '')}; t += d; } }
const T = id => LN[id].at, E = id => LN[id].end, inW = (t, a, b) => t >= a && t < b;
const TOTAL = E('n16') + 2.2, INT0 = T('k1') - .45, EXIT0 = E('t13') + .1, EXT2 = T('t14') - .9, INT2 = T('m15') - .7, END0 = T('n16') - .3;
const TXT = {
  t0: [null, 'Сегодня знакомлюсь с мамой Кейт. Она британка. Главное — понравиться!'], k1: ['Mum! This is Tom!', 'Мама! Это Том!'],
  m2: ['Oh. Tom. *How very interesting.*', 'О. Том. Как интересно.'], t3: ['I baked a cake for you!', 'Я испёк вам торт!'],
  m4: ['Mm. *Quite good.*', 'М-м. Вполне неплохо.'], t5: [null, 'Квайт гуд! Ей понравилось!'], t6: ["Next time I'll bring my borscht!", 'В следующий раз принесу борщ!'],
  m6: ["*I'll bear it in mind.*", 'Я буду иметь в виду.'], t7: ['So... can I call you Mum?', 'Можно звать вас мамой?'], m8: ['*With the greatest respect,* Tom...', 'При всём уважении, Том...'],
  k9: ['More tea, anyone?', 'Кому ещё чаю?'], m10: ["That's a *brave choice* of jumper, Tom.", 'Смелый выбор свитера, Том.'], t11: [null, 'Брейв — значит смелый! Она меня хвалит!'],
  m12: ["Well... *it's getting rather late.*", 'Что ж... уже довольно поздно.'], t13: ['Oh! Goodbye! It was lovely!', 'До свидания! Было чудесно!'], t14: [null, 'Кажется... я ей не понравился.'],
  m15: ['Kate... this cake is *not bad. Not bad at all.*', 'Кейт... торт неплохой. Совсем неплохой.'],
};
const DICT = [['HOW VERY INTERESTING', 'ужас'], ['QUITE GOOD', 'так себе'], ["I'LL BEAR IT IN MIND", 'ни за что'], ['WITH THE GREATEST RESPECT', 'ты с ума сошёл'],
  ['A BRAVE CHOICE', 'кошмар'], ["IT'S GETTING LATE", 'уходи'], ['NOT BAD AT ALL', 'восторг!']];
const scene = t => t < INT0 ? 'ext' : t < EXT2 ? 'int' : t < INT2 ? 'ext2' : 'int2';

// ---------------- sets ----------------
function interior(t) {
  DR(K.rr(-400, -400, W + 800, 2000, 1), {fill: '#f7c9d2', line: false, seed: 3, amp: 0, offset: 0});
  for (let y = -300, r = 0; y < 1500; y += 120, r++) for (let x = -300 + (r % 2) * 60; x < W + 300; x += 120) { K.spot(x, y, 16, 16, 'rgba(255,255,255,0.55)'); K.spot(x + 10, y - 8, 7, 7, 'rgba(230,110,140,0.5)'); }
  K.spot(540, 700, 560, 460, 'rgba(255,235,190,0.35)');
  DR([[-400, 1180], [W + 400, 1176]], {closed: false, lw: 7, seed: 20}); DR(K.rr(-400, 1180, W + 800, 40, 4), {fill: '#e9a6b4', line: false, seed: 21, amp: 0, offset: 0});
  // clock (hands race at "it's getting late")
  const sp = inW(t, T('m12'), E('i12')) ? (t - T('m12')) * 14 : 0;
  DR(P(120, 520, 78, 78, 30, .03), {fill: '#fff8e8', shade: '#ecd9bf', seed: 31, lw: 8});
  K.stroke([[120, 520], [120 + Math.sin(sp) * 48, 520 - Math.cos(sp) * 48]], 6, 32); K.stroke([[120, 520], [120 + Math.sin(sp * 12 + 2) * 62, 520 - Math.cos(sp * 12 + 2) * 62]], 4, 33);
  for (let k = 0; k < 12; k++) K.spot(120 + Math.sin(k / 12 * 6.28) * 64, 520 - Math.cos(k / 12 * 6.28) * 64, 4, 4, '#251c1a');
  // corgi portrait in a gold frame
  DR(K.rr(330, 430, 190, 230, 14), {fill: '#e9b64a', shade: '#c99128', seed: 34, lw: 8}); DR(K.rr(350, 450, 150, 190, 8), {fill: '#bfe4d4', seed: 35, lw: 5});
  DR(P(425, 580, 52, 42, 36, .08), {fill: '#f0a050', shade: '#d07a2a', seed: 37, lw: 5}); DR([[390, 548], [398, 500], [416, 540]], {fill: '#f0a050', seed: 38, lw: 4}); DR([[460, 548], [452, 500], [434, 540]], {fill: '#f0a050', seed: 39, lw: 4});
  DR(P(425, 596, 24, 16, 40), {fill: '#fffaf0', seed: 41, lw: 4}); K.spot(410, 572, 5, 5, '#251c1a'); K.spot(440, 572, 5, 5, '#251c1a'); K.spot(425, 590, 6, 4, '#251c1a');
  // floor
  DR([[-400, 1600], [W + 400, 1596], [W + 400, 2400], [-400, 2400]], {fill: '#a8673a', shade: '#87502a', seed: 42, lw: 7});
}
function table(t, showCake, pot = true) {
  DR([[-300, 1470], [W + 300, 1466], [W + 300, 2400], [-300, 2400]], {fill: '#fffaf0', shade: '#eadfca', shadeDir: [0, -30], seed: 50, lw: 8});
  for (let x = -260, k = 0; x < W + 300; x += 80, k++) K.curve([x, 1520], [x + 40, 1550], [x + 80, 1520], 4, 60 + k);
  for (const [cx, s] of [[330, 70], [690, 72]]) { DR(P(cx, 1480, 62, 14, s), {fill: '#ffffff', seed: s + 1, lw: 5}); DR([[cx - 36, 1420], [cx + 36, 1420], [cx + 28, 1474], [cx - 28, 1474]], {fill: '#9fd3ff', shade: '#79b6ea', seed: s + 2, lw: 6}); K.curve([cx + 34, 1432], [cx + 60, 1446], [cx + 32, 1462], 5, s + 3); }
  // teapot
  if (pot) DR(P(905, 1415, 92, 74, 80, .05), {fill: '#9fd3ff', shade: '#79b6ea', seed: 81, lw: 7}); if (pot) { DR([[820, 1420], [760, 1370], [772, 1360], [826, 1396]], {fill: '#9fd3ff', seed: 82, lw: 6});
  DR(P(905, 1338, 40, 16, 83), {fill: '#79b6ea', seed: 84, lw: 5}); K.curve([990, 1380], [1040, 1420], [990, 1460], 7, 85); }
  if (showCake) cake(560, 1470, 1, 0);
}
function cake(x, y, s, bite) {
  g.save(); g.translate(x, y); g.scale(s, s);
  DR(P(0, 4, 130, 24, 90), {fill: '#ffffff', seed: 91, lw: 5});
  if (bite) { g.save(); g.beginPath(); g.rect(-200, -200, 212, 260); g.clip(); }
  DR([[-100, -100], [100, -100], [104, 0], [-104, 0]], {fill: '#7a4a2a', shade: '#5a3418', seed: 92, lw: 7});
  DR([[-104, -100], [104, -100], [104, -70], [80, -56], [60, -72], [30, -54], [0, -74], [-30, -54], [-60, -72], [-80, -56], [-104, -70]], {fill: '#fff4f6', seed: 93, lw: 6});
  for (const cx of [-50, 0, 50]) DR(P(cx, -112, 14, 14, 94 + cx), {fill: '#e0303f', seed: 95 + cx, lw: 4});
  if (bite) { g.restore(); DR([[8, -100], [30, -100], [30, 0], [8, 0]], {fill: '#5a3418', seed: 97, lw: 5}); K.stroke([[10, -58], [30, -58]], 4, 98); }
  g.restore();
}
function exterior(t) {
  DR(K.rr(-400, -400, W + 800, 2000, 1), {fill: '#c8664a', line: false, seed: 4, amp: 0, offset: 0});
  for (let y = -380, r = 0; y < 1560; y += 64, r++) { K.stroke([[-400, y], [W + 400, y + 2]], 3, 100 + r, 1); for (let x = -400 + (r % 2) * 70; x < W + 400; x += 140) K.stroke([[x, y], [x, y + 64]], 3, 300 + r * 20 + x, 1); }
  K.spot(540, 900, 520, 600, 'rgba(255,220,180,0.25)');
  DR(K.rr(330, 600, 420, 980, 20), {fill: '#fffaf0', shade: '#ecd9bf', seed: 110, lw: 9});
  DR(K.rr(370, 640, 340, 940, 12), {fill: '#2f5d8a', shade: '#244a70', seed: 111, lw: 8});
  DR(K.rr(410, 700, 260, 300, 10), {lw: 5, seed: 112}); DR(K.rr(410, 1060, 260, 420, 10), {lw: 5, seed: 113});
  DR(P(540, 850, 34, 34, 114), {fill: '#e9b64a', seed: 115, lw: 5}); K.hand('7', 540, 760, 70, '#e9b64a');
  DR([[-400, 1580], [W + 400, 1576], [W + 400, 2400], [-400, 2400]], {fill: '#9aa0a8', shade: '#7b8088', seed: 116, lw: 8});
  DR(K.rr(280, 1580, 520, 60, 8), {fill: '#c6cbd2', seed: 117, lw: 6});
}
// thought cloud above Mum (world coords)
function thought(id, t, mx, my) {
  const nxt = ORDER.map(o => o[0]).filter(q => q[0] === 'm' && T(q) > T(id))[0], end = Math.min(E(id) + 1.1, nxt ? T(nxt) - .1 : 1e9);
  const k = ease((t - T(id) + .15) / .22) * (1 - ease((t - end) / .2)); if (k <= 0) return;
  const txt = LN[id].text, cx = mx - 190, cy = my - 330;
  g.save(); g.globalAlpha = k; g.translate(cx, cy); g.scale(.6 + .4 * k, .6 + .4 * k); g.translate(-cx, -cy);
  DR(P(mx - 40, my - 120, 16, 14, 401), {fill: '#ffffff', seed: 402, lw: 5}); DR(P(mx - 80, my - 170, 24, 20, 403), {fill: '#ffffff', seed: 404, lw: 5});
  const blobs = [[-170, 0, 110, 80], [-60, -50, 120, 90], [70, -40, 120, 88], [170, 10, 100, 76], [60, 50, 130, 70], [-80, 50, 130, 70]];
  blobs.forEach(([x, y, rx, ry], i) => DR(P(cx + x, cy + y, rx, ry, 410 + i, .06), {lw: 10, seed: 420 + i}));
  blobs.forEach(([x, y, rx, ry], i) => DR(P(cx + x, cy + y, rx - 4, ry - 4, 410 + i, .06), {fill: '#ffffff', line: false, seed: 430 + i, amp: 0}));
  g.font = `76px ${FONT}`; let f = 76; while (g.measureText(txt).width > 470) { f -= 2; g.font = `${f}px ${FONT}`; }
  const words = txt.split(' '); let lines_ = [txt]; if (f < 56 && words.length > 2) { const h = Math.ceil(words.length / 2); lines_ = [words.slice(0, h).join(' '), words.slice(h).join(' ')]; f = 64; g.font = `${f}px ${FONT}`; while (Math.max(...lines_.map(l => g.measureText(l).width)) > 470) { f -= 2; g.font = `${f}px ${FONT}`; } }
  g.fillStyle = '#c0283a'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines_.forEach((l, i) => g.fillText(l, cx, cy + 6 + (i - (lines_.length - 1) / 2) * f * 1.05));
  g.restore();
}

// ---------------- direction ----------------
const TOMX = 240, KX = 520, MX = 830;
function tomDir(t) {
  let s = {pose: 'down', mood: 'happy', look: 'right'};
  if (t < INT0) s = {pose: 'hold', mood: t < T('t0') + 1 ? 'neutral' : 'smug', look: ''};
  if (inW(t, INT0, E('t3') + .3)) s = {pose: 'hold', mood: 'happy', look: 'right'};
  if (inW(t, T('m2'), T('t3'))) s = {pose: 'hold', mood: 'neutral', look: 'right'};
  if (inW(t, T('m4'), T('t5'))) s = {pose: 'down', mood: 'neutral', look: 'right'};
  if (inW(t, T('t5'), T('t6'))) s = {pose: 'cheer', mood: 'happy', look: ''};
  if (inW(t, T('t6'), T('m6'))) s = {pose: 'presentR', mood: 'happy', look: 'right'};
  if (inW(t, T('m6'), T('t7'))) s = {pose: 'down', mood: 'happy', look: 'right'};
  if (inW(t, T('t7'), T('m8'))) s = {pose: 'shrug', mood: 'happy', look: 'right'};
  if (inW(t, T('m8'), T('t11'))) s = {pose: 'down', mood: 'surprised', look: 'right'};
  if (inW(t, T('t11'), T('m12'))) s = {pose: 'hips', mood: 'smug', look: ''};
  if (inW(t, T('m12'), T('t13'))) s = {pose: 'down', mood: 'surprised', look: 'right'};
  if (inW(t, T('t13'), EXIT0)) s = {pose: 'presentR', mood: 'happy', look: 'right'};
  if (t >= EXIT0) s = {pose: 'down', mood: 'happy', look: 'left'};
  if (t >= EXT2) s = {pose: 'down', mood: 'sad', look: ''};
  return s;
}
function mumDir(t) {
  let s = {pose: 'cross', mood: 'smug', look: 'left'};
  if (inW(t, T('m2'), E('m2'))) s = {pose: 'presentL', mood: 'smug', look: 'left'};
  if (inW(t, T('i2'), T('t3'))) s = {pose: 'cross', mood: 'surprised', look: 'left'};
  if (inW(t, T('m4'), T('t5'))) s = {pose: 'cross', mood: t < E('m4') ? 'neutral' : 'sleepy', look: 'left'};
  if (inW(t, T('t6'), T('m6'))) s = {pose: 'cross', mood: 'surprised', look: 'left'};
  if (inW(t, T('m6'), T('t7'))) s = {pose: 'presentL', mood: 'smug', look: 'left'};
  if (inW(t, T('t7'), T('m8'))) s = {pose: 'cross', mood: 'surprised', look: 'left'};
  if (inW(t, T('m8'), T('k9'))) s = {pose: 'hips', mood: t < E('m8') ? 'smug' : 'angry', look: 'left'};
  if (inW(t, T('m10'), T('t11'))) s = {pose: 'pointL', mood: 'smug', look: 'left'};
  if (inW(t, T('m12'), T('t13'))) s = {pose: 'presentL', mood: 'sleepy', look: 'left'};
  if (inW(t, T('t13'), EXT2)) s = {pose: 'cross', mood: 'smug', look: 'left'};
  if (t >= INT2) s = {pose: 'hold', mood: 'happy', look: 'left'};
  if (inW(t, T('m15'), E('m15'))) s = {pose: 'hold', mood: 'neutral', look: 'left'};
  return s;
}
function kateDir(t) {
  let s = {pose: 'down', mood: 'happy', look: 'right'};
  if (inW(t, T('k1'), E('k1') + .3)) s = {pose: 'presentL', mood: 'happy', look: 'right'};
  if (inW(t, T('m8'), T('m10'))) s = {pose: 'cross', mood: 'surprised', look: 'right'};
  if (inW(t, T('k9'), E('k9'))) s = {pose: 'presentR', mood: 'neutral', look: 'right'};
  if (inW(t, T('m10'), T('t13'))) s = {pose: 'head', mood: 'sad', look: 'left'};
  if (t >= INT2) s = {pose: 'cross', mood: 'smug', look: 'right'};
  return s;
}

// ---------------- camera ----------------
const CW = {z: 1.06, cx: 540, cy: 1050}, CT = {z: 1.45, cx: 290, cy: 1040}, CMm = {z: 1.35, cx: 740, cy: 880}, CK = {z: 1.5, cx: 520, cy: 1060}, CE = {z: 1.15, cx: 540, cy: 1080}, CE2 = {z: 1.25, cx: 540, cy: 1000}, CM2 = {z: 1.15, cx: 700, cy: 960};
const CUTS = [[0, CE], [INT0, CW], [T('m2'), CMm], [T('t3'), CT], [T('m4'), CMm], [T('t5'), CT], [T('m6'), CMm], [T('t7'), CW], [T('m8'), CMm], [T('k9'), CK], [T('m10'), CMm],
  [T('t11'), CT], [T('m12'), CW], [EXT2, CE2], [INT2, CM2]];
function camAt(t) { let c = CUTS[0], at = 0; for (const [a, cc] of CUTS) if (t >= a) { c = cc; at = a; } const push = 1 + Math.min(t - at, 4) * .012; return {z: c.z * push, cx: c.cx, cy: c.cy, at}; }

// ---------------- end card ----------------
function endCard(t) {
  const k = ease((t - END0) / .35); if (k <= 0) return;
  g.save(); g.globalAlpha = k * .45; g.fillStyle = '#3a2214'; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 60);
  DR(K.rr(70, 200, 940, 1300, 50), {fill: '#fff8e8', shade: '#f0dfb8', seed: 970, lw: 9});
  K.hand('Британский словарь', 540, 310, 92, INK); K.hand('говорят  /  думают', 540, 395, 56, '#e0503f');
  DICT.forEach(([en, ru], q) => { const a = ease((t - END0 - .2 - q * .14) / .25); if (a <= 0) return; const y = 450 + q * 128; g.save(); g.globalAlpha = k * a;
    DR(K.rr(110, y, 860, 108, 26), {fill: q % 2 ? '#ffe2ea' : '#e3f4ff', seed: 980 + q, lw: 5});
    g.textBaseline = 'middle'; g.textAlign = 'left'; let f = 44; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 520) { f -= 2; g.font = `${f}px ${FONT}`; } g.fillStyle = INK; g.fillText(en, 140, y + 56);
    g.textAlign = 'right'; g.font = `50px ${FONT}`; g.fillStyle = '#c0283a'; g.fillText(ru, 940, y + 56); g.restore(); });
  const a2 = ease((t - END0 - 1.5) / .3); g.globalAlpha = k * a2; DR(K.rr(320, 1360, 440, 84, 42), {fill: '#ffd83a', seed: 990, lw: 6}); K.hand('СОХРАНИ', 540, 1404, 58, INK);
  g.restore();
}

// ---------------- frame ----------------
function frame(t) {
  const cam = camAt(t), sc = scene(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#f7c9d2'; g.fillRect(0, 0, W, H);
  g.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.cx * cam.z, H / 2 - cam.cy * cam.z);
  const br = s => Math.sin(t * 1.6 + s) * 3;
  if (sc === 'ext' || sc === 'ext2') {
    exterior(t);
    const rain = sc === 'ext2', tx = 540;
    K.spot(tx, 1712, 150, 22, 'rgba(40,20,10,0.3)');
    tom({x: tx, by: br(1) - talk('t', t) * 5, mouth: talk('t', t), blink: blink(t, 1), ...posed(tomDir, t)});
    if (!rain) { DR(K.rr(tx - 120, 1250, 240, 150, 12), {fill: '#ffd6e2', shade: '#f0b0c4', seed: 140, lw: 7}); K.stroke([[tx - 120, 1300], [tx + 120, 1300]], 5, 141); DR(P(tx, 1250, 30, 16, 142), {fill: '#e0503f', seed: 143, lw: 5}); }
    else { const k = ease((t - EXT2) / .4); g.save(); g.globalAlpha = k; g.beginPath(); g.rect(tx - 170, 620, 340, 1100); g.clip(); drops(tx - 150, tx + 150, 620, 1720, t, 14); g.restore(); cloud(tx, 620 + Math.sin(t * 2) * 6, k * .9); }
  } else {
    interior(t);
    const fin = sc === 'int2';
    // Kate (back, a bit smaller)
    g.save(); g.translate(KX, 1700); g.scale(.9, .9); g.translate(-KX, -1700 - 40); heroine({x: KX, by: br(0) - talk('k', t) * 5, mouth: talk('k', t), blink: blink(t, 2), ...posed(kateDir, t)}); g.restore();
    // Tom (walks out after goodbye)
    if (!fin) { let tx = TOMX, wb = 0; if (t > EXIT0) { tx = TOMX - (t - EXIT0) * 650; wb = -Math.abs(Math.sin((t - EXIT0) * 12)) * 16; }
      if (tx > -350) { tom({x: tx, by: br(1) - talk('t', t) * 5 + wb, mouth: talk('t', t), blink: blink(t, 1), ...posed(tomDir, t)}); if (t < E('t3') + .3) cake(tx, 1385 + br(1), .85, 0); } }
    // Mum
    const mt = talk('m', t) || (fin && inW(t, INT2, T('m15')) ? Math.abs(Math.sin(t * 9)) * .5 : 0);
    mum({x: MX, by: br(3) - mt * 5, mouth: mt, blink: blink(t, 4), ...posed(mumDir, t)});
    if (fin) { cake(MX - 10, 1300 + br(3), .8, 1); K.spot(MX - 40, 1092, 7, 7, '#7a4a2a'); K.spot(MX + 30, 1100, 6, 6, '#7a4a2a'); }
    table(t, !fin && t > E('t3') + .3, !fin);
    for (const id of ['i2', 'i4', 'i6', 'i8', 'i10', 'i12', 'i15']) thought(id, t, MX, 770);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(K.PAPER, 0, 0); const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (cam.at > 0 && t - cam.at < .05) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, 0, W, H); }
  for (const id in TXT) if (inW(t, T(id) - .05, E(id) + .5)) subtitle(id, t);
  if (t > END0 - .1) endCard(t);
  if (t < END0) { g.font = `38px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = 'rgba(30,20,15,0.6)'; g.strokeText('@speak_in_english', W / 2, 1810); g.fillStyle = '#fffaf0'; g.fillText('@speak_in_english', W / 2, 1810); }
}

// ---------------- audio / srt ----------------
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = [];
  for (const id in LN) ev.push([LN[id].file, LN[id].at, id[0] === 'i' ? .95 : 1.0]);
  for (const id of ['i2', 'i4', 'i6', 'i8', 'i10', 'i12', 'i15']) ev.push([sfx('pop'), T(id) - .15, .35]);
  ev.push([sfx('tap'), .05, .7]); ev.push([sfx('tap'), .3, .7]); ev.push([sfx('swipe'), INT0, .4]);
  for (let i = 0; i < 6; i++) ev.push([sfx('tap'), T('m12') + i * .3, .35]);
  ev.push([sfx('steps'), EXIT0, .7]); ev.push([sfx('swipe'), EXT2, .4]); ev.push([sfx('swipe'), INT2, .4]); ev.push([sfx('ding'), T('i15') - .1, .5]); ev.push([sfx('ding'), END0 + .1, .45]);
  const args = ['-y', '-v', 'error'], fl = []; ev.forEach(([f]) => args.push('-i', f));
  args.push('-stream_loop', '-1', '-i', sfx('theme'), '-f', 'lavfi', '-t', String(TOTAL), '-i', 'anoisesrc=color=pink:amplitude=0.6:sample_rate=44100');
  ev.forEach(([f, at, gn], i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${gn},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`));
  const m = ev.length;
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume=0.12,afade=t=in:d=0.6,afade=t=out:st=${TOTAL - 1.2}:d=1.2[mus]`);
  fl.push(`[${m + 1}:a]aformat=channel_layouts=stereo,lowpass=f=2600,highpass=f=300,volume='0.07*between(t,${EXT2},${INT2})':eval=frame[rain]`);
  fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus][rain]amix=inputs=${m + 2}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(TMP, 'mix.wav'));
  const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } console.log('mix ok', TOTAL.toFixed(2));
}
function srt() {
  const f = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const id in LN) { const l = LN[id], txt = TXT[id] ? (TXT[id][0] ? TXT[id][0].replace(/\*/g, '') + '\n' + TXT[id][1] : TXT[id][1]) : id[0] === 'i' ? '(думает) ' + l.text : l.text; out += `${++n}\n${f(l.at)} --> ${f(l.end + .2)}\n${txt}\n\n`; }
  fs.writeFileSync(path.join(OUT, 'british_mum.srt'), out); console.log('srt', n);
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
  g.save(); g.translate(540, 1560); g.rotate(-.03); DR(K.rr(-460, -150, 920, 300, 44), {fill: '#fff8e8', shade: '#f0dfb8', seed: 999, lw: 10}); K.hand('БРИТАНКА ГОВОРИТ', 0, -55, 92, INK); K.hand('и что она думает', 0, 60, 86, '#c0283a'); g.restore();
  fs.writeFileSync(path.join(OUT, 'british_mum_cover.png'), cv.toBuffer('image/png')); console.log('cover');
}
