// «Буквально» — full episode (~78 s), hand-drawn "Shusha & Kesha" style with our cast (Tom, the heroine, + Tom's mum).
// Same script and voices as speak_in_english/literally_full (branch claude/literally-full-ep).
// node render.js still 10,20 | chunk i n | audio | srt | cover t
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
const ORDER = [['t0', .35], ['k1', .2], ['k2', .25], ['t3', .2], ['k4', .55], ['t5', .2], ['n1', .2], ['k6', .4], ['t7', .2], ['k8', .9], ['n2', .1],
  ['t9', .4], ['n3', .5], ['k10', .4], ['n4', 2.5], ['t11', .4], ['n5', .6], ['k12', .4], ['n6', 1.0], ['t13', .5], ['k14', .3], ['m15', 1.0], ['n7', .3], ['n8', .5]];
const LN = {};
{ let t = 0; for (const [id, gap] of ORDER) { const f = path.join(VD, id + '.mp3'), d = dur(f); t += gap; const w = JSON.parse(fs.readFileSync(path.join(VD, id + '.words.json'), 'utf8')).words;
  LN[id] = {id, at: t, dur: d, end: t + d, who: id[0], env: envelope(f), words: w, file: f, text: SCRIPT.lines[id][1].replace(/\[[^\]]+\]\s*/g, '')}; t += d; } }
const TOTAL = LN.n8.end + 1.6;
const T = id => LN[id].at, E = id => LN[id].end;
const wordT = (id, w, which = 's') => { const x = LN[id].words.find(q => q.w.toLowerCase().replace(/[^\p{L}']/gu, '').startsWith(w)); return T(id) + (x ? x[which] : 0); };
const Wd = {weather: wordT('t3', 'weather'), ears: wordT('t7', 'ears'), cats: wordT('t9', 'cats'), vedro: wordT('n3', 'ведро'), brk: wordT('t11', 'break'), ice: wordT('t11', 'ice', 'e')};
const CAR0 = E('k10') + .15, CAR1 = CAR0 + 2.3, HORSE0 = E('k12') - .1, DOOR0 = T('m15') - .9;
const inW = (t, a, b) => t >= a && t < b;

const TXT = {
  t0: [null, 'Всё! Я выучил тысячу английских идиом. Теперь я говорю как носитель!'], k1: ['Oh no.', 'О нет.'], k2: ['Hey Tom! How are you?', 'Привет, Том! Как дела?'],
  t3: ["I'm *under the weather!*", 'Мне нездоровится!'], k4: ["Tom, that means you're sick!", 'Том, это значит, что ты болеешь!'], t5: [null, 'А я хотел сказать, что у меня всё супер...'],
  k6: ['Okay. Listen to me.', 'Ладно. Послушай меня.'], t7: ["I'm *all ears!*", 'Я весь внимание!'], k8: ["Okay, that's creepy.", 'Так, это жутковато.'],
  t9: ["Whoa! It's *raining cats and dogs!*", 'Ого! Льёт как из ведра!'], k10: ["Tom! You're *driving me up the wall!*", 'Том! Ты меня бесишь!'],
  t11: ['Sorry! Let me... *break the ice!*', 'Прости! Давай я... разряжу обстановку!'], k12: ['*Hold your horses!*', 'Попридержи коней!'],
  t13: [null, 'Ладно... я лучше помолчу.'], k14: ["Good. *Mum's the word.*", 'Отлично. Молчок.'], m15: ['Did someone call me?', 'Меня кто-то звал?'],
};
const CARD = {n1: 'UNDER THE WEATHER', n2: "I'M ALL EARS", n3: 'RAINING CATS AND DOGS', n4: 'DRIVE SOMEONE UP THE WALL', n5: 'BREAK THE ICE', n6: 'HOLD YOUR HORSES', n7: "MUM'S THE WORD"};

// ---------------- room ----------------
const TX = 330, KX = 750, FLOOR = 1560, CEIL = 380;
function room(t) {
  DR(K.rr(-400, -400, W + 800, 800, 1), {fill: '#ffe2a8', shade: '#f5c97a', shadeDir: [0, 30], line: false, seed: 2, amp: 0, offset: 0});                 // ceiling
  DR(K.rr(-400, CEIL, W + 800, FLOOR - CEIL + 20, 1), {fill: '#8fe6c3', line: false, seed: 3, amp: 0, offset: 0});      // wall
  for (let x = -260, k = 0; x < W + 260; x += 110, k++) DR([[x, CEIL + 10], [x + 6, FLOOR]], {closed: false, lw: 14, seed: 120 + k, amp: 3, col: 'rgba(255,255,245,0.35)'});
  DR([[-400, CEIL], [W + 400, CEIL + 4]], {closed: false, lw: 8, seed: 19});
  K.spot(560, 700, 520, 420, 'rgba(255,230,160,0.3)');
  K.stroke([[560, -60], [562, CEIL + 70]], 5, 21); DR([[480, CEIL + 150], [640, CEIL + 150], [596, CEIL + 60], [524, CEIL + 60]], {fill: '#ff6a52', shade: '#e04a32', seed: 22, lw: 7}); DR(P(560, CEIL + 160, 30, 14, 23), {fill: '#fff6cf', seed: 24, lw: 5});
  // window (left): blue sky, turns grey and rainy
  const rainy = inW(t, Wd.cats - .3, E('n3') + .4);
  DR(K.rr(-10, 540, 230, 380, 14), {fill: rainy ? '#6f80a3' : '#8fd2ff', shade: rainy ? '#56668a' : '#64b6ef', shadeDir: [-20, -14], seed: 131, lw: 9});
  if (!rainy) { DR(P(80, 640, 50, 24, 132), {fill: '#ffffff', seed: 133, lw: 5}); DR(P(150, 780, 36, 18, 134), {fill: '#ffffff', seed: 135, lw: 5}); }
  else for (let i = 0; i < 8; i++) { const x = 10 + (i * 53) % 200, y = 560 + ((t * 900 + i * 131) % 330); DR([[x, y], [x - 6, y + 30]], {closed: false, lw: 6, seed: 840 + i, col: '#cfe6ff', amp: .4}); }
  K.stroke([[104, 546], [106, 914]], 8, 136); K.stroke([[-4, 730], [216, 728]], 8, 137);
  DR([[-20, 925], [240, 922], [244, 960], [-24, 962]], {fill: '#fff8e8', shade: '#ecd9bf', seed: 138, lw: 7});
  // poster
  DR([[870, 560], [1060, 552], [1066, 820], [874, 828]], {fill: '#fff2c9', shade: '#ead79c', seed: 139, lw: 7});
  K.hand('HELLO!', 966, 620, 58, '#e0503f', 'center', -0.04); DR(P(966, 730, 38, 38, 140), {fill: '#ffb3c8', seed: 141, lw: 5});
  // door (centre), opens for Mum
  const dk = ease((t - DOOR0) / .35);
  DR(K.rr(430, 820, 220, FLOOR - 820 + 10, 10), {fill: '#fff8e8', shade: '#ecd9bf', seed: 142, lw: 8});
  DR(K.rr(450, 840, 180, FLOOR - 840, 6), {fill: '#5b3a5e', line: false, seed: 143, amp: 0, offset: 0});
  if (t >= DOOR0) mumPeek(t);
  const dw = 180 * (1 - dk * .85);
  DR([[450, 840], [450 + dw, 840 + dk * 16], [450 + dw, FLOOR - dk * 16], [450, FLOOR]], {fill: '#e08a3c', shade: '#c06a22', seed: 144, lw: 7, amp: 1.2});
  if (dw > 70) { DR(P(450 + dw - 30, 1220, 12, 12, 145), {fill: '#ffd83a', seed: 146, lw: 4}); DR(K.rr(474, 880, dw - 50, 260, 8), {closed: true, lw: 5, seed: 147}); DR(K.rr(474, 1300, dw - 50, 210, 8), {closed: true, lw: 5, seed: 148}); }
  // floor + rug + plant
  DR([[-400, FLOOR], [W + 400, FLOOR - 4], [W + 400, 2400], [-400, 2400]], {fill: '#cf7a3c', shade: '#a85a22', shadeDir: [0, -40], seed: 51, lw: 8});
  for (let x = -300, k = 0; x < W + 300; x += 130, k++) DR([[x, 1575], [x - 90, 2100]], {closed: false, lw: 5, seed: 200 + k, amp: 2, col: 'rgba(110,70,40,0.6)'});
  DR(P(540, 1740, 380, 92, 160, .05), {fill: '#ff6f9f', shade: '#e44d80', shadeDir: [0, -16], seed: 161, lw: 7});
  DR([[30, 1440], [150, 1440], [136, 1570], [44, 1570]], {fill: '#f2643a', shade: '#cc4718', seed: 162, lw: 7});
  for (let k = 0; k < 5; k++) { const a = -2.5 + k * .38; DR(P(90 + Math.cos(a) * 70, 1390 + Math.sin(a) * 90, 24, 58, 163 + k, .1), {fill: '#3cc24a', shade: '#1e9a30', seed: 170 + k, lw: 6}); }
}
function shadowAt(x, y, rx) { K.spot(x, y, rx, 22, 'rgba(90,40,10,0.28)'); }

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
function mumPeek(t) {
  const k = ease((t - DOOR0 - .25) / .4), out = t > T('n8') ? ease((t - T('n8')) / .4) : 0, tk = talk('m', t);
  g.save(); g.beginPath(); g.rect(450, 700, 180, FLOOR - 700); g.clip();
  g.translate(540 - (1 - k + out) * 220, FLOOR); g.scale(.62, .62); g.translate(-540, -1700);
  mum({x: 540, by: Math.sin(t * 2) * 3, mouth: tk, blink: blink(t, 4), mood: tk > .1 ? 'neutral' : 'happy', look: 'left', pose: 'presentL', poseK: 1});
  g.restore();
}

// ---------------- gag props (brush style) ----------------
function cloud(cx, cy, k) { if (k <= 0) return; g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy);
  DR(P(cx, cy + 10, 170, 62, 801, .08), {fill: '#c9d2e2', shade: '#a6b2c8', seed: 802, lw: 7}); DR(P(cx - 60, cy - 30, 80, 66, 803, .1), {fill: '#c9d2e2', shade: '#a6b2c8', seed: 804, lw: 7}); DR(P(cx + 50, cy - 46, 92, 76, 805, .1), {fill: '#c9d2e2', shade: '#a6b2c8', seed: 806, lw: 7}); g.restore(); }
function drops(x0, x1, y0, y1, t, n, seed = 1) { for (let i = 0; i < n; i++) { const x = x0 + ((i * 97 + seed * 31) % (x1 - x0)), y = y0 + ((t * 900 + i * 137) % (y1 - y0)); DR([[x, y], [x - 6, y + 36]], {closed: false, lw: 8, seed: 820 + i, col: '#3d93e0', amp: .5}); } }
function ear(x, y, a, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(a); g.scale(k, k);
  DR([[-28, -62], [12, -74], [44, -40], [42, 10], [24, 50], [-4, 70], [-26, 52], [-12, 20], [-34, -10]], {fill: '#ffc79c', shade: '#ea9a6c', seed: 830, lw: 6}); K.curve([-6, -36], [24, -20], [4, 22], 5, 831); g.restore(); }
function cat(x, y, r, s) { g.save(); g.translate(x, y); g.rotate(r); DR([[-40, -18], [-32, -66], [-6, -36]], {fill: '#9aa3b5', seed: s, lw: 6}); DR([[40, -18], [32, -66], [6, -36]], {fill: '#9aa3b5', seed: s + 1, lw: 6});
  DR(P(0, 0, 50, 42, s + 2, .08), {fill: '#9aa3b5', shade: '#7c8598', seed: s + 3, lw: 7}); DR(P(-16, -6, 7, 9, s + 4), {fill: INK, line: false, seed: 1}); DR(P(16, -6, 7, 9, s + 5), {fill: INK, line: false, seed: 1});
  for (const q of [-1, 1]) K.stroke([[q * 14, 12], [q * 60, 4]], 3, s + 6 + q); g.restore(); }
function dog(x, y, r, s) { g.save(); g.translate(x, y); g.rotate(r); DR(P(-48, 8, 18, 34, s, .12), {fill: '#8a5a33', seed: s + 1, lw: 6}); DR(P(48, 8, 18, 34, s + 2, .12), {fill: '#8a5a33', seed: s + 3, lw: 6});
  DR(P(0, 0, 50, 44, s + 4, .08), {fill: '#d59a5c', shade: '#b97c40', seed: s + 5, lw: 7}); DR(P(-16, -8, 7, 9, s + 6), {fill: INK, line: false, seed: 1}); DR(P(16, -8, 7, 9, s + 7), {fill: INK, line: false, seed: 1}); DR(P(0, 14, 13, 9, s + 8), {fill: INK, line: false, seed: 1}); g.restore(); }
function bucket(x, y, r, s = 860) { g.save(); g.translate(x, y); g.rotate(r); g.scale(1.35, 1.35); K.curve([-48, -36], [0, -110], [48, -36], 6, s); DR([[-54, -36], [54, -36], [42, 42], [-42, 42]], {fill: '#a9bed4', shade: '#8aa1ba', seed: s + 1, lw: 7}); DR(P(0, -36, 54, 13, s + 2), {fill: '#7f98b3', seed: s + 3, lw: 6}); g.restore(); }
function book(x, y, r) { g.save(); g.translate(x, y); g.rotate(r); DR(K.rr(-140, -180, 280, 360, 18), {fill: '#e0503f', shade: '#b8382a', seed: 870, lw: 8}); DR(K.rr(-112, -150, 224, 300, 10), {fill: '#fff6e0', shade: '#ead79c', seed: 871, lw: 5});
  K.hand('1000', 0, -80, 96, '#e0503f'); K.hand('ENGLISH', 0, 0, 46, INK); K.hand('IDIOMS', 0, 50, 46, INK); dog(40, 110, .2, 872); g.restore(); }
function hammer(px, py, ang) { g.save(); g.translate(px, py); g.rotate(ang); DR(K.rr(-12, -420, 24, 450, 10), {fill: '#e3a25a', shade: '#c07f38', seed: 880, lw: 6}); DR(K.rr(-80, -500, 160, 96, 16), {fill: '#9aa3b5', shade: '#7c8598', seed: 881, lw: 7}); g.restore(); }
function fish(x, y, r) { g.save(); g.translate(x, y); g.rotate(r); DR([[60, 0], [104, -44], [104, 44]], {fill: '#7fb2e0', seed: 890, lw: 6}); DR(P(0, 0, 84, 42, 891, .08), {fill: '#9cc8ef', shade: '#78a8d6', seed: 892, lw: 7});
  K.stroke([[-46, -14], [-26, 4]], 5, 893); K.stroke([[-46, 4], [-26, -14]], 5, 894); K.curve([-70, 16], [-60, 22], [-50, 14], 4, 895); for (const q of [-30, 0, 30]) K.stroke([[q, -40], [q + 8, -58], [q + 16, -40]], 4, 896 + q); g.restore(); }
function iceBlock(x, y, t, broke) {
  const h = 340, w = 240;
  if (!broke) { fish(x, y - h / 2, -.2); g.save(); g.globalAlpha = .6; DR(K.rr(x - w / 2, y - h, w, h, 14), {fill: '#cfeaff', line: false, seed: 900, amp: 0, offset: 0}); g.restore(); DR(K.rr(x - w / 2, y - h, w, h, 14), {lw: 8, seed: 901});
    K.stroke([[x - w / 2 + 30, y - h + 34], [x - w / 2 + 56, y - h + 130]], 6, 902); K.stroke([[x + w / 2 - 44, y - 70], [x + w / 2 - 22, y - 34]], 6, 903); return; }
  const k = t - Wd.ice;
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .36, v = 700 + (i % 3) * 180, sx = x + Math.cos(a) * v * k, sy = y - h / 2 + Math.sin(a) * v * k + 1400 * k * k;
    if (sy > FLOOR + 160) continue; g.save(); g.translate(sx, sy); g.rotate(k * (4 + i)); DR([[-36, -22], [32, -32], [26, 30], [-22, 24]], {fill: '#d9f0ff', seed: 910 + i, lw: 5}); g.restore(); }
  const fy = Math.min(y - 40, y - h / 2 + 900 * k * k), flop = fy >= y - 41 ? Math.sin(t * 16) * .5 : -.2 + k * 2;
  fish(x + 30, fy, flop);
}
function horse(x, y, ph, col, colS, mane, seed) {
  const leg = (lx, o, s) => { const a = Math.sin(ph + o) * .55; DR(K.tube([[lx, y - 250], [lx + Math.sin(a) * 70, y - 135], [lx + Math.sin(a) * 110, y - 20]], 40, 28), {fill: col, shade: colS, seed: seed + s, lw: 6}); DR(P(lx + Math.sin(a) * 110, y - 10, 24, 14, seed + s + 1), {fill: '#3a2a22', seed: seed + s + 2, lw: 4}); };
  leg(x - 120, 0, 1); leg(x + 95, 1.2, 4);
  DR([[x - 190, y - 340], [x - 290, y - 260 + Math.sin(ph * 2) * 20], [x - 310, y - 160], [x - 250, y - 230], [x - 185, y - 290]], {fill: mane, seed: seed + 10, lw: 6});
  DR(P(x, y - 305, 210, 100, seed + 11, .06), {fill: col, shade: colS, seed: seed + 12, lw: 8});
  DR([[x + 100, y - 370], [x + 200, y - 520], [x + 270, y - 490], [x + 196, y - 300]], {fill: col, shade: colS, seed: seed + 13, lw: 7});
  g.save(); g.translate(x + 280, y - 470); g.rotate(.55); DR(P(0, 0, 100, 50, seed + 14, .08), {fill: col, shade: colS, seed: seed + 15, lw: 7}); DR(P(58, 12, 12, 9, seed + 16), {fill: INK, line: false, seed: 1}); g.restore();
  DR([[x + 212, y - 540], [x + 232, y - 606], [x + 256, y - 535]], {fill: col, seed: seed + 17, lw: 5});
  DR(P(x + 262, y - 498, 11, 13, seed + 18), {fill: '#fffdf8', seed: seed + 19, lw: 4}); DR(P(x + 264, y - 496, 6, 7, seed + 20), {fill: INK, line: false, seed: 1});
  DR([[x + 110, y - 390], [x + 196, y - 540], [x + 224, y - 532], [x + 146, y - 366]], {fill: mane, seed: seed + 21, lw: 5});
  leg(x - 80, 3.1, 30); leg(x + 135, 4.3, 33);
}
function car(x, y, ang, t) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.save(); g.beginPath(); g.rect(-220, -420, 440, 350); g.clip(); g.translate(-10, -60); g.scale(.33, .33); g.translate(-KX, -1500);
  heroine({x: KX, by: 0, mouth: 0, blink: false, mood: 'angry', look: 'right', pose: 'hold', poseK: 1}); g.restore();
  DR([[-150, -86], [-70, -86], [-48, -130], [12, -130], [44, -86], [150, -76], [160, -10], [-160, -10]], {fill: '#ff6b5a', shade: '#e04a32', seed: 920, lw: 8});
  DR(P(136, -54, 13, 11, 921), {fill: '#fff3b0', seed: 922, lw: 4});
  for (const wx of [-90, 90]) { DR(P(wx, -6, 34, 34, 923 + wx), {fill: '#2b2b33', seed: 924 + wx, lw: 6}); DR(P(wx, -6, 13, 13, 925 + wx), {fill: '#c9ced6', seed: 926 + wx, lw: 4}); const a = t * 25; K.stroke([[wx, -6], [wx + Math.cos(a) * 28, -6 + Math.sin(a) * 28]], 4, 927); }
  g.restore();
}
function carPos(t) {
  const u = t - CAR0, lerp = (a, b, k) => a + (b - a) * k, R = W - 70;
  if (u < .45) return [lerp(KX, R - 40, ease(u / .45)), 1690, 0];
  if (u < .6) return [R - 40 + 40 * ease((u - .45) / .15), 1690 - 40 * ease((u - .45) / .15), -Math.PI / 2 * ease((u - .45) / .15)];
  if (u < 1.45) return [R, lerp(1650, CEIL + 120, ease((u - .6) / .85)), -Math.PI / 2];
  if (u < 1.6) return [R - 40 * ease((u - 1.45) / .15), CEIL + 120 - 100 * ease((u - 1.45) / .15), -Math.PI / 2 - Math.PI / 2 * ease((u - 1.45) / .15)];
  return [lerp(R - 40, KX, ease((u - 1.6) / .6)), CEIL + 12, -Math.PI];
}

// ---------------- characters ----------------
const talk = (who, t) => { for (const id in LN) { const l = LN[id]; if (l.who === who && t >= l.at && t < l.end) { const i = Math.floor((t - l.at) * FPS); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); } } return 0; };
const blink = (t, seed) => ((t + seed * 1.3) % (3.1 + seed * .5)) < .12;
// pose with smooth blend from the previous one
function posed(fn, t) { const f = Math.round(t * FPS), cur = fn(t); let k = f, prev = cur;
  while (k > 0 && f - k < 12) { const q = fn((k - 1) / FPS); if (q.pose !== cur.pose) { prev = q; break; } k--; }
  return {...cur, prevPose: prev.pose, poseK: prev.pose === cur.pose ? 1 : ease((f - k) / (.3 * FPS))}; }
function tomDir(t) {
  let s = {pose: 'down', mood: 'neutral', look: 'right'};
  if (t < E('k2') - .3) s = {pose: 'hold', mood: t < T('k1') ? 'smug' : 'happy', look: t < T('k1') ? '' : 'right'};
  if (inW(t, T('t3'), Wd.weather + .2)) s = {pose: 'cheer', mood: 'happy'};
  if (inW(t, Wd.weather + .2, T('k6'))) s = {pose: 'down', mood: t < T('t5') ? 'surprised' : 'sad', look: 'right'};
  if (inW(t, T('k6'), T('t7'))) s = {pose: 'down', mood: 'neutral', look: 'right'};
  if (inW(t, T('t7'), T('t9'))) s = {pose: t < Wd.ears + .3 ? 'presentR' : 'shrug', mood: t < Wd.ears + .3 ? 'happy' : 'surprised', look: 'right'};
  if (inW(t, T('t9'), T('k10'))) s = {pose: 'pointL', mood: 'surprised', look: 'left'};
  if (inW(t, Wd.vedro, T('k10'))) s = {pose: 'down', mood: 'sleepy', look: ''};
  if (inW(t, T('k10'), T('t11'))) s = {pose: 'down', mood: 'surprised', look: 'right'};
  if (inW(t, T('t11'), T('k12'))) s = {pose: 'hold', mood: t > Wd.ice ? 'surprised' : 'happy', look: 'right'};
  if (inW(t, T('k12'), HORSE0)) s = {pose: 'down', mood: 'surprised', look: 'right'};
  if (inW(t, HORSE0, T('t13'))) s = {pose: 'hold', mood: 'surprised', look: 'right'};
  if (t >= T('t13')) s = {pose: 'shrug', mood: 'sad', look: 'right'};
  if (t >= T('k14')) s = {pose: 'down', mood: 'sleepy', look: 'right'};
  if (t >= DOOR0) s = {pose: 'down', mood: 'surprised', look: 'right'};
  return s;
}
function herDir(t) {
  let s = {pose: 'down', mood: 'neutral', look: 'left'};
  if (inW(t, T('k1'), T('k2'))) s = {pose: 'cross', mood: 'sleepy', look: 'left'};
  if (inW(t, T('k2'), E('k2') + .2)) s = {pose: 'presentL', mood: 'happy', look: 'left'};
  if (inW(t, Wd.weather, T('k4'))) s = {pose: 'down', mood: 'surprised', look: 'left'};
  if (inW(t, T('k4'), E('k4') + .2)) s = {pose: 'pointL', mood: t - T('k4') < 1 ? 'happy' : 'neutral', look: 'left'};
  if (inW(t, T('k6'), T('k8'))) s = {pose: 'cross', mood: t > Wd.ears ? 'surprised' : 'neutral', look: 'left'};
  if (inW(t, T('k8'), T('t9'))) s = {pose: 'cross', mood: 'smug', look: 'left'};
  if (inW(t, T('t9'), T('k10'))) s = {pose: 'up', mood: 'surprised', look: 'left'};
  if (inW(t, Wd.vedro, T('k10'))) s = {pose: 'cross', mood: 'sleepy', look: 'left'};
  if (inW(t, T('k10'), CAR0)) s = {pose: 'hips', mood: 'angry', look: 'left'};
  if (t >= CAR1) s = {pose: 'cross', mood: 'angry', look: 'left'};
  if (inW(t, T('k12'), E('k12') + .2)) s = {pose: 'shrug', mood: 'angry', look: 'left'};
  if (inW(t, HORSE0, T('t13'))) s = {pose: 'cross', mood: 'happy', look: 'left'};
  if (t >= T('t13')) s = {pose: 'cross', mood: 'neutral', look: 'left'};
  if (t >= T('k14')) s = {pose: 'hips', mood: 'smug', look: 'left'};
  if (t >= DOOR0) s = {pose: 'down', mood: 'surprised', look: 'left'};
  return s;
}

// ---------------- camera ----------------
const WIDE = {z: 1, cx: 540, cy: 1000}, CT = {z: 1.4, cx: TX + 40, cy: 1010}, CK = {z: 1.45, cx: KX - 30, cy: 1020}, CKU = {z: 1.3, cx: KX - 20, cy: 900}, CM = {z: 1.9, cx: 540, cy: 1250};
const CUTS = [[0, CT], [T('k1'), CK], [T('k2'), WIDE], [T('k4'), CK], [T('t5'), CT], [T('n1'), WIDE], [T('t7'), CT], [T('k8'), CK], [T('n2'), CT], [T('t9'), WIDE],
  [T('k10'), CK], [E('k10') + .1, WIDE], [T('k12'), CKU], [E('k12'), WIDE], [T('t13'), CT], [T('k14'), CK], [DOOR0, WIDE], [T('m15'), CM], [T('n7'), WIDE]];
function camAt(t) { let c = CUTS[0], at = 0; for (const [a, cc] of CUTS) if (t >= a) { c = cc; at = a; } const push = 1 + Math.min(t - at, 4) * .012; return {z: c.z * push, cx: c.cx, cy: c.cy, at}; }

// ---------------- text (hand font) ----------------
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
function narCard(id, t) {
  const l = LN[id], k = ease((t - l.at + .1) / .2) * (1 - ease((t - l.end - .3) / .2)); if (k <= 0) return;
  const title = CARD[id], words = l.text.split(' ').map((q, i) => ({t: q, i})), rl = lines(words, `54px ${FONT}`, 820);
  g.font = `84px ${FONT}`; const ts = Math.min(84, Math.floor(84 * 840 / g.measureText(title).width));
  const h = 60 + ts + 30 + rl.length * 62 + 40, y0 = 70;
  g.save(); g.globalAlpha = k; g.translate(540, y0 + h / 2); g.rotate(-.015); g.scale(.9 + .1 * k, .9 + .1 * k); g.translate(-540, -(y0 + h / 2));
  DR(K.rr(70, y0, 940, h, 40), {fill: '#fff8e8', shade: '#f0dfb8', seed: 950 + id.charCodeAt(1), lw: 9});
  DR([[480, y0 - 26], [600, y0 - 30], [604, y0 + 22], [476, y0 + 26]], {fill: 'rgba(255,214,90,0.85)', line: false, seed: 960, amp: 1});
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${ts}px ${FONT}`; g.fillStyle = '#e0503f'; g.fillText(title, 540, y0 + 40 + ts / 2);
  const cw = l.words.filter(q => T(id) + q.s <= t).length - 1; let y = y0 + 60 + ts + 40;
  rl.forEach(ln => { g.font = `54px ${FONT}`; const parts = ln.map(w => w.t + ' '), ws = parts.map(q => g.measureText(q).width), tw = ws.reduce((a, b) => a + b, 0); let x = 540 - tw / 2; g.textAlign = 'left';
    ln.forEach((w, j) => { g.fillStyle = w.i <= cw ? INK : 'rgba(37,28,26,0.38)'; g.fillText(parts[j], x, y); x += ws[j]; }); y += 62; });
  g.restore();
}
function endCard(t) {
  const k = ease((t - T('n8') + .1) / .35); if (k <= 0) return;
  g.save(); g.globalAlpha = k * .45; g.fillStyle = '#3a2214'; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 60);
  DR(K.rr(80, 230, 920, 1250, 50), {fill: '#fff8e8', shade: '#f0dfb8', seed: 970, lw: 9});
  K.hand('Какую идиому', 540, 340, 92, INK); K.hand('показать буквально?', 540, 440, 92, INK); K.hand('пиши в комментах', 540, 530, 60, '#e0503f');
  const L = Object.values(CARD), cols = ['#3cc24a', '#ff6f9f', '#3d82ee', '#ff9a2e', '#9b5de5', '#2fbfae', '#e0503f'];
  L.forEach((w, q) => { const a = ease((t - T('n8') - .2 - q * .12) / .25); if (a <= 0) return; const y = 600 + q * 112; g.save(); g.globalAlpha = k * a;
    DR(K.rr(150, y, 780, 92, 26), {fill: cols[q], seed: 980 + q, lw: 6}); g.font = `50px ${FONT}`; let f = 50; while (g.measureText(w).width > 700) { f -= 2; g.font = `${f}px ${FONT}`; }
    g.fillStyle = '#fffaf0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(w, 540, y + 48); g.restore(); });
  const a2 = ease((t - T('n8') - 1.4) / .3); g.globalAlpha = k * a2; DR(K.rr(320, 1390, 440, 80, 40), {fill: '#ffd83a', seed: 990, lw: 6}); K.hand('СОХРАНИ', 540, 1432, 56, INK);
  g.restore();
}

// ---------------- frame ----------------
function frame(t) {
  const cam = camAt(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#8fe6c3'; g.fillRect(0, 0, W, H);
  g.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.cx * cam.z, H / 2 - cam.cy * cam.z);
  room(t);
  const br = s => Math.sin(t * 1.6 + s) * 3;
  // Tom
  const horseRun = t >= HORSE0 && t < T('t13'), hx = horseRun ? -500 + (t - HORSE0) * 1250 : -999;
  let tx = TX, tilt = 0, lift = 0;
  if (horseRun && hx - 420 > TX) { tx = hx - 420; tilt = .28; lift = -30 - Math.abs(Math.sin(t * 14)) * 30; }
  if (!(horseRun && tx > 1350)) {
    shadowAt(tx, 1710, 150);
    g.save(); g.translate(tx, 1700 + lift); g.rotate(tilt); g.translate(-tx, -1700);
    tom({x: tx, by: br(1) - talk('t', t) * 5, mouth: talk('t', t), blink: blink(t, 1), ...posed(tomDir, t)}); g.restore();
    if (t < E('k2') - .3) book(tx + 4, 1360 + br(1) - (inW(t, wordT('t0', 'тысячу'), wordT('t0', 'теперь')) ? 40 : 0), -.06);
    if (inW(t, T('t11'), HORSE0)) { const sw = t < Wd.ice - .18 ? -.35 + Math.sin(t * 3) * .05 : t < Wd.ice ? -.35 + 2.7 * ease((t - Wd.ice + .18) / .18) : 2.35; hammer(tx, 1360, sw); }
  }
  // gags
  if (inW(t, Wd.weather, T('k6'))) { const k = ease((t - Wd.weather) / .3) * (1 - ease((t - T('k6') + .3) / .3)); g.save(); g.beginPath(); g.rect(TX - 170, 640, 340, 1080); g.clip(); g.globalAlpha = k; drops(TX - 150, TX + 150, 640, 1700, t, 13); g.restore(); cloud(TX, 640 + Math.sin(t * 2) * 6, k * .9); }
  if (inW(t, Wd.ears, T('t9'))) { const k = clamp((t - Wd.ears) / .9) * (1 - ease((t - T('t9') + .3) / .3));
    [[-170, -50, -.6], [170, -50, .6], [-150, -200, -.9], [150, -200, .9], [0, -260, 0], [-200, 130, -.3], [200, 130, .3], [-90, 330, -.4], [100, 360, .4], [0, 470, .1]].forEach(([dx, dy, a], i) => {
      const kk = clamp(k * 2 - i * .1); ear(TX + dx, 930 + dy, a + Math.sin(t * 6 + i) * .08, kk * (1 + .25 * Math.sin(Math.PI * kk))); }); }
  if (inW(t, Wd.cats, T('k10'))) { const k = ease((t - Wd.cats) / .3) * (1 - ease((t - E('n3')) / .4)); g.save(); g.globalAlpha = k; drops(-40, 1120, CEIL, 1750, t, 22, 3);
    [[cat, 140, 0], [dog, 800, 500], [cat, 640, 900], [dog, 300, 1200], [cat, 960, 1350], [dog, 520, 300], [cat, 60, 700], [dog, 1020, 100]].forEach(([fn, x, off], i) => fn(x, CEIL - 60 + ((t - Wd.cats) * 700 + off) % 1500, Math.sin(t * 3 + i) * .6, 850 + i * 10));
    g.restore(); }
  if (inW(t, Wd.vedro - .35, T('k10'))) { const k = ease((t - Wd.vedro + .35) / .35), u = Math.max(0, t - Wd.vedro); bucket(TX + 4, -100 + (800 - -100) * k, Math.PI + Math.sin(u * 18) * .12 * Math.exp(-u * 3)); }
  if (inW(t, Wd.brk - .2, T('k12'))) { const k = ease((t - Wd.brk + .2) / .3); g.save(); g.translate(0, (1 - k) * -1100); iceBlock(610, 1700, t, t >= Wd.ice); g.restore(); }
  // heroine
  const hang = t >= CAR1 && t < T('t13');
  if (!(t >= CAR0 && t < T('t13'))) { shadowAt(KX, 1710, 140); heroine({x: KX, by: br(0) - talk('k', t) * 5, mouth: talk('k', t), blink: blink(t, 2), ...posed(herDir, t)}); }
  else if (t < CAR1) { const [cx, cy, ca] = carPos(t); car(cx, cy, ca, t); }
  else if (hang) { const sway = Math.sin((t - CAR1) * 3) * .05 * Math.exp(-(t - CAR1) * .4) + Math.sin(t * 1.4) * .015;
    g.save(); g.translate(KX, CEIL); g.rotate(Math.PI + sway); g.translate(-KX, -1705);
    const d = posed(herDir, t); if (d.look === 'left') d.look = 'right'; else if (d.look === 'right') d.look = 'left';
    heroine({x: KX, by: 0, mouth: talk('k', t), blink: blink(t, 2), ...d}); g.restore(); }
  if (horseRun) { horse(hx, 1720, t * 15, '#a8743f', '#87552a', '#4a2f1e', 1000); horse(hx + 460, 1740, t * 15 + 1.7, '#f4efe4', '#d6cfc0', '#b9b6c2', 1100);
    if (tx > TX) { K.stroke([[hx + 300, 1240], [tx + 10, 1360]], 6, 1200); K.stroke([[hx + 760, 1260], [tx + 20, 1360]], 6, 1201); } }
  // screen space
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(K.PAPER, 0, 0); const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  for (const id in TXT) if (inW(t, T(id) - .05, E(id) + .5)) subtitle(id, t);
  for (const id in CARD) if (inW(t, T(id) - .2, E(id) + .6)) narCard(id, t);
  if (t > T('n8') - .2) endCard(t);
  if (t < T('n8')) { g.font = `38px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = 'rgba(30,20,15,0.6)'; g.strokeText('@speak_in_english', W / 2, 1810); g.fillStyle = '#fffaf0'; g.fillText('@speak_in_english', W / 2, 1810); }
}

// ---------------- audio / srt ----------------
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = [];
  for (const id in LN) ev.push([LN[id].file, LN[id].at, 1.0]);
  for (const id in CARD) ev.push([sfx('swipe'), T(id) - .2, .35]);
  ev.push([sfx('pop'), Wd.weather, .6]); for (let i = 0; i < 4; i++) ev.push([sfx('pop'), Wd.ears + i * .18, .55]);
  ev.push([sfx('meow'), Wd.cats + .5, .5]); ev.push([sfx('meow'), Wd.cats + 1.6, .4]); ev.push([sfx('ding'), Wd.vedro + .02, .6]);
  ev.push([sfx('whoosh'), CAR0, .6]); ev.push([sfx('whoosh'), CAR0 + .6, .5]); ev.push([sfx('whoosh'), CAR0 + 1.5, .5]); ev.push([sfx('pop'), CAR1, .5]);
  ev.push([sfx('whoosh'), Wd.ice - .2, .5]); ev.push([sfx('scratch'), Wd.ice, .6]); ev.push([sfx('pop'), Wd.ice, .8]);
  ev.push([sfx('steps'), HORSE0, .9, 'atempo=2.0,atempo=1.3']); ev.push([sfx('whoosh'), HORSE0 + .9, .5]);
  ev.push([sfx('tap'), DOOR0 - .2, .7]); ev.push([sfx('tap'), DOOR0 + .05, .7]); ev.push([sfx('ding'), T('n8'), .5]);
  const args = ['-y', '-v', 'error'], fl = []; ev.forEach(([f]) => args.push('-i', f));
  args.push('-stream_loop', '-1', '-i', sfx('theme'), '-f', 'lavfi', '-t', String(TOTAL), '-i', 'anoisesrc=color=pink:amplitude=0.6:sample_rate=44100');
  ev.forEach(([f, at, gn, x], i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo${x ? ',' + x : ''},volume=${gn},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`));
  const m = ev.length;
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume=0.13,afade=t=in:d=0.6,afade=t=out:st=${TOTAL - 1.2}:d=1.2[mus]`);
  const r1 = [Wd.weather, T('k6')], r2 = [Wd.cats, E('n3') + .3];
  fl.push(`[${m + 1}:a]aformat=channel_layouts=stereo,lowpass=f=2600,highpass=f=300,volume='0.05*(between(t,${r1[0]},${r1[1]})+between(t,${r2[0]},${r2[1]})*1.4)':eval=frame[rain]`);
  fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus][rain]amix=inputs=${m + 2}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(TMP, 'mix.wav'));
  const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } console.log('mix ok', TOTAL.toFixed(2));
}
function srt() {
  const f = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const id in LN) { const l = LN[id], txt = TXT[id] ? (TXT[id][0] ? TXT[id][0].replace(/\*/g, '') + '\n' + TXT[id][1] : TXT[id][1]) : (CARD[id] ? CARD[id] + '\n' : '') + l.text; out += `${++n}\n${f(l.at)} --> ${f(l.end + .2)}\n${txt}\n\n`; }
  fs.writeFileSync(path.join(OUT, 'literally_full_hd.srt'), out); console.log('srt', n);
}

// ---------------- main ----------------
const cv = K.createCanvas(W, H); K.setG(cv.getContext('2d')); g = K.g;
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'still') { for (const s of a1.split(',')) { frame(parseFloat(s)); fs.writeFileSync(path.join(OUT, `still_${s}.png`), cv.toBuffer('image/png')); } console.log('total', TOTAL.toFixed(2)); }
else if (mode === 'chunk') {
  const i = +a1, n = +a2, N = Math.ceil(TOTAL * FPS), f0 = Math.floor(N * i / n), f1 = Math.floor(N * (i + 1) / n);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', path.join(TMP, `chunk_${i}.mp4`)]);
  (async () => { for (let f = f0; f < f1; f++) { frame(f / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
  ff.on('close', c => console.log('chunk', i, 'done', c));
}
else if (mode === 'audio') audio();
else if (mode === 'srt') srt();
else if (mode === 'cover') {
  frame(parseFloat(a1 || '25')); g.setTransform(1, 0, 0, 1, 0, 0);
  g.save(); g.translate(540, 1540); g.rotate(-.03); DR(K.rr(-450, -150, 900, 300, 44), {fill: '#fff8e8', shade: '#f0dfb8', seed: 999, lw: 10}); K.hand('ИДИОМЫ', 0, -55, 130, '#e0503f'); K.hand('БУКВАЛЬНО', 0, 70, 104, INK); g.restore();
  fs.writeFileSync(path.join(OUT, 'literally_full_hd_cover.png'), cv.toBuffer('image/png')); console.log('cover');
}
