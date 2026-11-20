// «Буквально» — full episode (~78 s). Thin-line style, cast from linestyle/cast.js (animated copy: cast_anim.js).
// Tom learned 1000 idioms and now says them — and every idiom happens literally.
// node render.js still 10,20     -> out/still_10.png ...
// node render.js chunk i n       -> out/tmp/chunk_i.mp4 (frames i-th quarter)
// node render.js audio           -> out/tmp/mix.wav
// node render.js srt | cover
const {createCanvas} = require('@napi-rs/canvas');
const {spawn, spawnSync} = require('child_process');
const fs = require('fs'), path = require('path');
const K = require('./cast_anim.js');
const {W, H, FPS, C, ANIM, shape, line, oval, clamp, ease, PAPER} = K;
const D = __dirname, VD = path.join(D, 'voice'), OUT = path.join(D, 'out'), TMP = path.join(OUT, 'tmp');
fs.mkdirSync(TMP, {recursive: true});
let g;
const FB = 'NL, NC';

// ---------------- voices: timing, envelopes, words ----------------
const SCRIPT = JSON.parse(fs.readFileSync(path.join(VD, 'script.json'), 'utf8'));
const dur = f => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());
function envelope(f) {
  const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], {maxBuffer: 1 << 26}).stdout;
  const n = raw.length / 2, per = 8000 / FPS, out = [];
  for (let i = 0; i * per < n; i++) { let s = 0, c = 0; for (let j = Math.floor(i * per); j < Math.min(n, (i + 1) * per); j++) { const v = raw.readInt16LE(j * 2) / 32768; s += v * v; c++; } out.push(Math.sqrt(s / Math.max(1, c))); }
  const srt = [...out].sort((a, b) => a - b), p = srt[Math.floor(srt.length * .93)] || 1;
  return out.map(v => clamp((v / p - .08) * 1.15));
}
// order + pause before each line (s). Extra pauses leave room for the literal gags.
const ORDER = [['t0', .35], ['k1', .2], ['k2', .25], ['t3', .2], ['k4', .55], ['t5', .2], ['n1', .2], ['k6', .4], ['t7', .2], ['k8', .9], ['n2', .1],
  ['t9', .4], ['n3', .5], ['k10', .4], ['n4', 2.5], ['t11', .4], ['n5', .6], ['k12', .4], ['n6', 1.0], ['t13', .5], ['k14', .3], ['m15', 1.0], ['n7', .3], ['n8', .5]];
const LN = {};
{ let t = 0; for (const [id, gap] of ORDER) { const f = path.join(VD, id + '.mp3'), d = dur(f); t += gap; const w = JSON.parse(fs.readFileSync(path.join(VD, id + '.words.json'), 'utf8')).words;
  LN[id] = {id, at: t, dur: d, end: t + d, who: id[0], env: envelope(f), words: w, file: f, voice: SCRIPT.lines[id][0], text: SCRIPT.lines[id][1].replace(/\[[^\]]+\]\s*/g, '')}; t += d; } }
const TOTAL = LN.n8.end + 1.6;
const T = id => LN[id].at, E = id => LN[id].end;
const wordT = (id, w, which = 's') => { const x = LN[id].words.find(q => q.w.toLowerCase().replace(/[^\p{L}']/gu, '').startsWith(w)); return T(id) + (x ? x[which] : 0); };
const Wd = {weather: wordT('t3', 'weather'), ears: wordT('t7', 'ears'), cats: wordT('t9', 'cats'), vedro: wordT('n3', 'ведро'), brk: wordT('t11', 'break'), ice: wordT('t11', 'ice', 'e')};
const CAR0 = E('k10') + .15, CAR1 = CAR0 + 2.3, HORSE0 = E('k12') - .1, DOOR0 = T('m15') - .9;

// bubble texts: [EN (idiom between *stars*), RU translation]
const TXT = {
  t0: [null, 'Всё! Я выучил тысячу английских идиом. Теперь я говорю как носитель!'], k1: ['Oh no.', 'О нет.'], k2: ['Hey Tom! How are you?', 'Привет, Том! Как дела?'],
  t3: ["I'm *under the weather!*", 'Мне нездоровится!'], k4: ["Tom, that means you're sick!", 'Том, это значит, что ты болеешь!'], t5: [null, 'А я хотел сказать, что у меня всё супер...'],
  k6: ['Okay. Listen to me.', 'Ладно. Послушай меня.'], t7: ["I'm *all ears!*", 'Я весь внимание!'], k8: ["Okay, that's creepy.", 'Так, это жутковато.'],
  t9: ["Whoa! It's *raining cats and dogs!*", 'Ого! Льёт как из ведра!'], k10: ["Tom! You're *driving me up the wall!*", 'Том! Ты меня бесишь!'],
  t11: ['Sorry! Let me... *break the ice!*', 'Прости! Давай я... разряжу обстановку!'], k12: ['*Hold your horses!*', 'Попридержи коней!'],
  t13: [null, 'Ладно... я лучше помолчу.'], k14: ["Good. *Mum's the word.*", 'Отлично. Молчок.'], m15: ['Did someone call me?', 'Меня кто-то звал?'],
};
const CARD = {n1: 'UNDER THE WEATHER', n2: "I'M ALL EARS", n3: "IT'S RAINING CATS AND DOGS", n4: 'DRIVE SOMEONE UP THE WALL', n5: 'BREAK THE ICE', n6: 'HOLD YOUR HORSES', n7: "MUM'S THE WORD"};
const NAME = {t: ['TOM', '#2f9a6a'], k: ['KATE', '#d8344a'], m: ['MUM', '#8f3fb0']};

// ---------------- characters ----------------
const TOM = K.CAST[1], KATE = K.CAST[0], MUM = K.CAST[4];
const GY = 1540, BACK = 1385, TX = 320, KX = 770;
const talk = (who, t) => { for (const id in LN) { const l = LN[id]; if (l.who === who && t >= l.at - .05 && t < l.end + .1) { const i = Math.floor((t - l.at) * FPS); return {id, mo: clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2), u: (t - l.at) / l.dur}; } } return null; };
const blink = (t, seed) => { const p = 3.1 + seed * .7, ph = (t + seed * 1.3) % p; return ph < .12 ? 1 : 0; };
const inW = (t, a, b) => t >= a && t < b;
function drawChar(P, x, gy, t, who, st, seed) {
  const tk = talk(who, t);
  Object.assign(ANIM, {mo: tk ? tk.mo : 0, blink: st.blink ?? blink(t, seed), look: st.look || 0, lookY: st.lookY || 0, brow: (st.brow || 0) + (tk ? tk.mo * .35 : 0), inner: st.inner || 0, mood: st.mood || '', tilt: (st.tilt || 0) + (tk ? Math.sin(t * 7.3 + seed) * .035 : Math.sin(t * 1.3 + seed) * .012)});
  const bob = Math.sin(t * 2.4 + seed) * 3 + (tk ? -tk.mo * 5 : 0);
  g.save(); g.translate(0, bob); K.person({...P, arms: st.arms}, x, gy, false); g.restore();
}

// ---------------- set: the room ----------------
function room(t) {
  g.fillStyle = '#f6eefc'; g.fillRect(-400, -400, 1900, 610);                                // ceiling band
  g.fillStyle = '#e4d9f7'; g.fillRect(-400, 200, 1900, BACK - 200);                         // back wall
  g.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = -380; x < 1500; x += 120) g.fillRect(x, 200, 44, BACK - 200);
  line([[-400, 200], [1500, 200]], 4);
  g.fillStyle = '#f1cf9e'; g.fillRect(-400, BACK, 1900, 1200); line([[-400, BACK], [1500, BACK]], 4);                  // floor
  g.strokeStyle = 'rgba(150,95,40,0.28)'; g.lineWidth = 3; for (let i = 1; i < 9; i++) { const y = BACK + i * i * 9 + i * 18; g.beginPath(); g.moveTo(-400, y); g.lineTo(1500, y); g.stroke(); }
  g.fillStyle = '#d8c6ef'; g.fillRect(-400, BACK - 40, 1900, 40); line([[-400, BACK - 40], [1500, BACK - 40]], 3);       // skirting
  // window (left)
  const rainy = inW(t, Wd.cats - .3, E('n3') + .4);
  poly([[30, 520], [290, 520], [290, 960], [30, 960]], '#fffaf0');
  g.fillStyle = rainy ? '#7d8fae' : '#a9dcf7'; g.fillRect(52, 542, 216, 396);
  if (!rainy) { oval(120, 640, 50, 22, '#ffffff', 0); oval(160, 630, 40, 26, '#ffffff', 0); oval(220, 760, 36, 16, '#ffffff', 0); }
  else { g.save(); g.beginPath(); g.rect(52, 542, 216, 396); g.clip(); rainDrops(52, 268, 542, 940, t, 10, 5); g.restore(); }
  line([[160, 542], [160, 938]], 5); line([[52, 740], [268, 740]], 5); poly([[52, 542], [268, 542], [268, 938], [52, 938]], null, 5);
  poly([[10, 950], [310, 950], [310, 985], [10, 985]], '#fffaf0');
  // door (centre back wall), opens for Mum
  const dk = ease((t - DOOR0) / .35);
  poly([[436, 690], [644, 690], [644, BACK], [436, BACK]], '#fff6e8');
  g.fillStyle = '#5a4466'; g.fillRect(452, 706, 176, BACK - 706);
  if (t >= DOOR0 && t < TOTAL) mumPeek(t);
  const dw = 176 * (1 - dk * .85); poly([[452, 706], [452 + dw, 706 + dk * 14], [452 + dw, BACK - dk * 14], [452, BACK]], '#c9874f', 4); if (dw > 60) { poly([[478, 740], [452 + dw - 26, 740 + dk * 6], [452 + dw - 26, 1000], [478, 1000]], null, 3); poly([[478, 1110], [452 + dw - 26, 1110], [452 + dw - 26, BACK - 40 - dk * 8], [478, BACK - 40]], null, 3); }
  if (dw > 60) oval(452 + dw - 22, 1060, 10, 10, '#ffd23a', 3);
  // picture + plant
  poly([[860, 560], [1030, 560], [1030, 720], [860, 720]], '#ffd36e'); g.fillStyle = '#9fd3c7'; g.fillRect(878, 578, 134, 124); oval(945, 650, 34, 30, '#ff8a8a', 3);
  shape([[60, BACK + 10], [170, BACK + 10], [150, BACK + 130], [80, BACK + 130]], '#e07a52');
  for (const [a, h] of [[-.5, 150], [-.15, 190], [.2, 170], [.55, 130]]) shape([[115, BACK + 10], [115 + Math.sin(a) * h * .5 - 20, BACK + 10 - h * .6], [115 + Math.sin(a) * h, BACK + 10 - h], [115 + Math.sin(a) * h * .5 + 20, BACK + 10 - h * .5]], '#4fae6a', 3.5);
}
function mumPeek(t) {
  const k = ease((t - DOOR0 - .25) / .4), out = t > T('n8') ? ease((t - T('n8')) / .4) : 0;
  g.save(); g.beginPath(); g.rect(452, 600, 176, BACK - 600); g.clip();
  g.translate(540 - (1 - k + out) * 180, 0); g.translate(0, BACK); g.scale(.62, .62); g.translate(0, -BACK);
  drawChar(MUM, 0, BACK, t, 'm', {arms: ['hip', 'wave'], brow: .6, look: .2, tilt: -.12}, 4);
  g.restore();
}
function poly(pts, fill, lw = 4.5) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = C.ink; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function contact(x, y, rx) { K.contact(x, y, rx, 26, .25); }

// ---------------- props & literal gags ----------------
function rainDrops(x0, x1, y0, y1, t, n, seed = 1) { g.strokeStyle = '#4aa3e8'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const x = x0 + ((i * 97 + seed * 31) % (x1 - x0)), y = y0 + ((t * 900 + i * 137) % (y1 - y0)); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 34); g.stroke(); } }
function cloudShape(cx, cy, k, dark) { const P = [[-80, 0, 80, 62], [70, 0, 80, 60], [-5, -40, 95, 78], [0, 30, 140, 40]];
  g.save(); g.translate(cx, cy); g.scale(k, k); P.forEach(([x, y, rx, ry]) => oval(x, y, rx, ry, null, 10)); P.forEach(([x, y, rx, ry]) => oval(x, y, rx, ry, dark ? '#b9c3d6' : '#eef2f8', 0)); g.restore(); }
function ear(x, y, ang, k) { if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(ang); g.scale(k, k); shape([[-30, -62], [10, -74], [44, -40], [42, 10], [24, 50], [-4, 70], [-26, 52], [-12, 20], [-34, -10]], TOM.skin); shape([[-8, -44], [18, -48], [26, -16], [16, 18], [0, 34], [-6, 12], [-16, -12]], '#e9a68e', 3); g.restore(); }
function cat(x, y, r, s = 1) { g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); shape([[-40, -18], [-32, -64], [-8, -34]], '#9aa3b5', 4); shape([[40, -18], [32, -64], [8, -34]], '#9aa3b5', 4); oval(0, 0, 48, 40, '#9aa3b5'); oval(-16, -6, 6, 8, C.ink, 0); oval(16, -6, 6, 8, C.ink, 0); oval(0, 8, 6, 4, '#f29aa8', 0);
  for (const q of [-1, 1]) { line([[q * 14, 12], [q * 60, 4]], 2.5); line([[q * 14, 16], [q * 58, 22]], 2.5); } g.restore(); }
function dog(x, y, r, s = 1) { g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); oval(-46, 6, 17, 32, '#8a5a33'); oval(46, 6, 17, 32, '#8a5a33'); oval(0, 0, 48, 42, '#e0a868'); oval(-16, -8, 6, 8, C.ink, 0); oval(16, -8, 6, 8, C.ink, 0); oval(0, 12, 12, 8, C.ink, 0); shape([[-6, 22], [6, 22], [4, 38], [-4, 38]], '#ef7a8a', 3); g.restore(); }
function bucket(x, y, r) { g.save(); g.translate(x, y); g.rotate(r); g.beginPath(); g.arc(0, -46, 62, Math.PI, 0); g.strokeStyle = C.ink; g.lineWidth = 5; g.stroke(); shape([[-70, -46], [70, -46], [54, 56], [-54, 56]], '#a9bed4'); oval(0, -46, 70, 15, '#7f98b3'); line([[-62, 0], [62, 0]], 3); g.restore(); }
function book(x, y, r) { g.save(); g.translate(x, y); g.rotate(r); K.fillP([[-135, -175], [135, -175], [135, 175], [-135, 175]], '#d8344a'); K.fillP([[-112, -150], [112, -150], [112, 150], [-112, 150]], '#fffaf0', 3);
  g.fillStyle = '#d8344a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `88px ${FB}`; g.fillText('1000', 0, -78); g.fillStyle = C.ink; g.font = `40px ${FB}`; g.fillText('ENGLISH', 0, 0); g.fillText('IDIOMS', 0, 46); cloudShape(-40, 110, .22); dog(50, 112, .2, .4); g.restore(); }
function hammer(px, py, ang) { g.save(); g.translate(px, py); g.rotate(ang); K.fillP([[-10, 30], [10, 30], [10, -400], [-10, -400]], '#c98a44', 3.5); K.fillP([[-70, -470], [70, -470], [70, -390], [-70, -390]], '#8a8f9e'); g.restore(); }
function fish(x, y, r, s = 1) { g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); shape([[60, 0], [100, -40], [100, 40]], '#7fb2e0'); oval(0, 0, 80, 40, '#9cc8ef'); line([[-40, -10], [-24, 6]], 4); line([[-40, 6], [-24, -10]], 4); line([[-62, 14], [-48, 12]], 3); for (const q of [-30, 0, 30]) line([[q, -38], [q + 6, -54], [q + 12, -38]], 3); g.restore(); }
function iceBlock(x, y, t, broke) {
  const h = 330, w = 230;
  if (!broke) { fish(x, y - h / 2, -.2, 1.05); g.save(); g.globalAlpha = .62; poly([[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y], [x - w / 2, y]], '#cfeaff', 0); g.restore(); poly([[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y], [x - w / 2, y]], null, 5); poly([[x - w / 2, y - h], [x - w / 2 + 30, y - h - 24], [x + w / 2 + 30, y - h - 24], [x + w / 2, y - h]], '#e6f5ff', 4); poly([[x + w / 2, y - h], [x + w / 2 + 30, y - h - 24], [x + w / 2 + 30, y - 24], [x + w / 2, y]], '#a9d4f2', 4);
    line([[x - w / 2 + 30, y - h + 30], [x - w / 2 + 60, y - h + 120]], 4); line([[x + w / 2 - 40, y - 60], [x + w / 2 - 20, y - 30]], 4); return; }
  const k = t - Wd.ice;
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .36, v = 700 + (i % 3) * 180, sx = x + Math.cos(a) * v * k, sy = y - h / 2 + Math.sin(a) * v * k + 1400 * k * k;
    if (sy > GY + 20) continue; g.save(); g.translate(sx, sy); g.rotate(k * (4 + i)); g.globalAlpha = .8; K.shape([[-34, -20], [30, -30], [24, 28], [-20, 22]], '#cfeaff', 4); g.restore(); }
  const fy = Math.min(GY - 40, y - h / 2 + 900 * k * k), flop = fy >= GY - 41 ? Math.sin(t * 16) * .5 : -.2 + k * 2;
  fish(x + 30, fy, flop, 1.05);
}
function horse(x, y, ph, col, mane) {
  const leg = (lx, o) => { const a = Math.sin(ph + o) * .55; K.tube([[lx, y - 250], [lx + Math.sin(a) * 70, y - 135], [lx + Math.sin(a) * 110, y - 18]], 34, 24, col); oval(lx + Math.sin(a) * 110, y - 10, 20, 12, '#3a2a22', 3); };
  leg(x - 120, 0); leg(x + 95, 1.2);
  shape([[x - 190, y - 330], [x - 280, y - 260 + Math.sin(ph * 2) * 20], [x - 300, y - 170], [x - 250, y - 230], [x - 185, y - 290]], mane);
  oval(x, y - 300, 200, 92, col);
  shape([[x + 110, y - 360], [x + 200, y - 500], [x + 260, y - 470], [x + 190, y - 300]], col);
  g.save(); g.translate(x + 270, y - 450); g.rotate(.55); oval(0, 0, 92, 46, col); oval(52, 10, 12, 8, C.ink, 0); g.restore();
  shape([[x + 210, y - 520], [x + 228, y - 580], [x + 248, y - 515]], col, 4); oval(x + 252, y - 478, 8, 10, C.ink, 0);
  shape([[x + 120, y - 380], [x + 190, y - 520], [x + 215, y - 515], [x + 150, y - 360]], mane, 3.5);
  leg(x - 80, 3.1); leg(x + 135, 4.3);
}
function car(x, y, ang, t) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.save(); g.beginPath(); g.rect(-200, -400, 400, 330); g.clip(); g.translate(-10, 0); g.scale(.3, .3); Object.assign(ANIM, {mo: 0, blink: 0, look: 0, brow: 0, inner: 1, mood: 'flat', tilt: 0}); K.person({...KATE, arms: ['hold', 'hold']}, 0, 140, false); g.restore();
  K.fillP([[-130, -80], [-60, -80], [-40, -120], [10, -120], [40, -80], [130, -70], [140, -10], [-140, -10]], '#ff6b5a');
  line([[-40, -80], [-30, -112]], 3); oval(118, -50, 12, 10, '#fff3b0', 3);
  for (const wx of [-80, 80]) { oval(wx, -6, 30, 30, '#2b2b33', 4); oval(wx, -6, 12, 12, '#c9ced6', 3); const a = t * 25; line([[wx, -6], [wx + Math.cos(a) * 26, -6 + Math.sin(a) * 26]], 3); }
  g.restore();
}
function carPos(t) { // floor -> up the wall -> along the ceiling
  const u = t - CAR0, lerp = (a, b, k) => a + (b - a) * k;
  if (u < .45) return [lerp(KX, 960, ease(u / .45)), GY - 10, 0];
  if (u < .6) return [960 + 30 * ease((u - .45) / .15), GY - 10 - 30 * ease((u - .45) / .15), -Math.PI / 2 * ease((u - .45) / .15)];
  if (u < 1.45) return [990, lerp(GY - 40, 300, ease((u - .6) / .85)), -Math.PI / 2];
  if (u < 1.6) return [990 - 40 * ease((u - 1.45) / .15), 300 - 80 * ease((u - 1.45) / .15), -Math.PI / 2 - Math.PI / 2 * ease((u - 1.45) / .15)];
  return [lerp(950, KX, ease((u - 1.6) / .6)), 212, -Math.PI];
}

// ---------------- UI ----------------
function rrect(x, y, w, h, r, fill, stroke = C.ink, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function wrapW(words, font, maxW) { g.font = font; const lines = []; let l = []; for (const w of words) { const t = [...l, w].map(q => q.t).join(' '); if (g.measureText(t).width > maxW && l.length) { lines.push(l); l = [w]; } else l.push(w); } lines.push(l); return lines; }
function tokens(s) { let hot = false; return s.split(' ').map(w => { const st = w.startsWith('*'); if (st) hot = true; const t = w.replace(/\*/g, ''), o = {t, hot}; if (w.endsWith('*') || w.endsWith('*!') || /\*[.!?]?$/.test(w)) hot = false; return o; }); }
function bubble(id, t, tip) {
  const [en, ru] = TXT[id], k = ease((t - T(id)) / .16) * (1 - ease((t - E(id) - .25) / .15)); if (k <= 0) return;
  const fe = `58px ${FB}`, fr = en ? `38px ${FB}` : `50px ${FB}`, le = en ? wrapW(tokens(en), fe, 840) : [], lr = wrapW(ru.split(' ').map(q => ({t: q})), fr, 840);
  const h = 44 + le.length * 68 + (en ? 22 : 0) + lr.length * (en ? 46 : 60) + 24, y0 = 150, [nm, col] = NAME[id[0]];
  g.save(); g.globalAlpha = k; g.translate(540, y0 + h / 2); g.scale(.92 + .08 * k, .92 + .08 * k); g.translate(-540, -(y0 + h / 2));
  const tx = clamp(tip[0], 160, 920), ty = Math.max(y0 + h + 40, Math.min(tip[1] - 30, y0 + h + 110));
  rrect(70, y0, 940, h, 36, '#fffdf6', '#24432c', 5);
  g.beginPath(); g.moveTo(tx - 34, y0 + h - 3); g.lineTo(tx + (tip[0] > 540 ? 30 : -30), ty); g.lineTo(tx + 34, y0 + h - 3); g.closePath(); g.fillStyle = '#fffdf6'; g.fill(); g.strokeStyle = '#24432c'; g.lineWidth = 5; g.stroke(); g.fillRect(tx - 31, y0 + h - 9, 62, 10);
  g.font = `28px ${FB}`; const nw = g.measureText(nm).width + 44; rrect(950 - nw, y0 - 20, nw, 42, 21, col, null); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(nm, 950 - nw / 2, y0 + 1);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; let y = y0 + 44;
  le.forEach(ln => { y += 56; let x = 110; g.font = fe; ln.forEach(w => { g.fillStyle = w.hot ? '#d8344a' : '#24432c'; g.fillText(w.t + ' ', x, y); x += g.measureText(w.t + ' ').width; }); y += 12; });
  if (en) { g.strokeStyle = 'rgba(216,52,74,0.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(110, y + 4); g.lineTo(970, y + 4); g.stroke(); y += 14; }
  g.fillStyle = en ? '#7a5a8a' : '#24432c'; g.font = fr; lr.forEach(ln => { y += en ? 44 : 56; g.fillText(ln.map(q => q.t).join(' '), 110, y); });
  g.restore();
}
function narCard(id, t) {
  const l = LN[id], k = ease((t - l.at + .1) / .2) * (1 - ease((t - l.end - .3) / .2)); if (k <= 0) return;
  const title = CARD[id], ft = `${title.length > 20 ? 58 : 70}px ${FB}`, fr = `46px ${FB}`;
  const words = l.text.split(' ').map((q, i) => ({t: q, i})), lr = wrapW(words, fr, 860), tl = wrapW(title.split(' ').map(q => ({t: q})), ft, 860);
  const h = 50 + tl.length * 76 + 30 + lr.length * 58 + 30, y0 = 140;
  g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * -40);
  rrect(60, y0, 960, h, 38, '#24432c', '#1a2f20', 5);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#ffd23a'; g.font = ft; let y = y0 + 34; tl.forEach(ln => { y += 70; g.fillText(ln.map(q => q.t).join(' '), 540, y); });
  y += 22; g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(200, y); g.lineTo(880, y); g.stroke();
  const cw = l.words.filter(q => T(id) + q.s <= t).length - 1;
  g.font = fr; lr.forEach(ln => { y += 58; const s = ln.map(q => q.t + ' '), ws = s.map(q => g.measureText(q).width), tw = ws.reduce((a, b) => a + b, 0); let x = 540 - tw / 2; g.textAlign = 'left';
    ln.forEach((w, j) => { g.fillStyle = w.i === cw ? '#ffd23a' : w.i < cw ? '#ffffff' : 'rgba(255,255,255,0.55)'; g.fillText(s[j], x, y); x += ws[j]; }); g.textAlign = 'center'; });
  g.restore();
}
function endCard(t) {
  const k = ease((t - T('n8') + .1) / .35); if (k <= 0) return;
  g.save(); g.globalAlpha = k * .55; g.fillStyle = '#2a1f33'; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 60);
  rrect(90, 220, 900, 1240, 44, '#fffdf6', '#24432c', 6);
  g.fillStyle = '#24432c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `64px ${FB}`; g.fillText('КАКУЮ ИДИОМУ', 540, 320); g.fillText('ПОКАЗАТЬ БУКВАЛЬНО?', 540, 400);
  g.font = `36px ${FB}`; g.fillStyle = '#d8344a'; g.fillText('пиши в комментариях', 540, 470);
  const L = Object.values(CARD), cols = ['#2f9a6a', '#d8344a', '#3b6fd1', '#ff8a3a', '#8f3fb0', '#2fae9a', '#c2382c'];
  L.forEach((w, q) => { const a = ease((t - T('n8') - .2 - q * .12) / .25); if (a <= 0) return; const y = 530 + q * 118; g.save(); g.globalAlpha = k * a; rrect(150, y, 780, 96, 24, cols[q], C.ink, 4);
    g.fillStyle = '#fff'; g.textAlign = 'left'; let f = 42; g.font = `${f}px ${FB}`; while (g.measureText(w).width > 690) { f -= 2; g.font = `${f}px ${FB}`; } g.fillText(w, 190, y + 50); g.restore(); });
  const a2 = ease((t - T('n8') - 1.4) / .3); g.globalAlpha = k * a2; rrect(330, 1360, 420, 78, 39, '#ffd23a', C.ink, 4); g.fillStyle = '#24432c'; g.font = `40px ${FB}`; g.textAlign = 'center'; g.fillText('СОХРАНИ', 540, 1400);
  g.restore();
}
function watermark() { g.font = `30px ${FB}`; const t = '@speak_in_english', w = g.measureText(t).width + 50; rrect((W - w) / 2, 1772, w, 50, 25, 'rgba(36,67,44,0.7)', null); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, W / 2, 1798); }

// ---------------- camera ----------------
const WIDE = {z: .95, cx: 540, cy: 900}, CT = {z: 1.55, cx: TX + 20, cy: 660}, CK = {z: 1.55, cx: KX - 20, cy: 720}, CKU = {z: 1.45, cx: KX, cy: 860}, CM = {z: 2.1, cx: 540, cy: 1000};
const CUTS = [[0, CT], [T('k1'), CK], [T('k2'), WIDE], [T('k4'), CK], [T('t5'), CT], [T('n1'), WIDE], [T('t7'), CT], [T('k8'), CK], [T('n2'), CT], [T('t9'), WIDE],
  [T('k10'), CK], [E('k10') + .1, WIDE], [T('k12'), CKU], [E('k12'), WIDE], [T('t13'), CT], [T('k14'), CK], [DOOR0, WIDE], [T('m15'), CM], [T('n7'), WIDE]];
function camAt(t) { let c = CUTS[0], at = 0; for (const [a, cc] of CUTS) if (t >= a) { c = cc; at = a; } const push = 1 + Math.min(t - at, 4) * .012; return {z: c.z * push, cx: c.cx, cy: c.cy, at}; }
const toScreen = (cam, x, y) => [W / 2 + (x - cam.cx) * cam.z, H / 2 + (y - cam.cy) * cam.z];

// ---------------- frame ----------------
function frame(t) {
  const cam = camAt(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#e4d9f7'; g.fillRect(0, 0, W, H);
  g.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.cx * cam.z, H / 2 - cam.cy * cam.z);
  room(t);
  // --- Tom ---
  const horseRun = t >= HORSE0 && t < T('t13');
  const hx = horseRun ? -500 + (t - HORSE0) * 1250 : -999;
  let tx = TX, tomTilt = 0, tomLift = 0;
  if (horseRun && hx - 420 > TX) { tx = hx - 420; tomTilt = .28; tomLift = -30 - Math.abs(Math.sin(t * 14)) * 30; }
  const tomSt = {arms: ['pocket', 'pocket'], look: .6};
  if (t < E('k2') - .3) Object.assign(tomSt, {arms: ['hold', 'hold'], look: t < T('k1') ? 0 : .6, brow: .5, mood: 'grin'});
  if (inW(t, T('t3'), E('t3') + .2)) Object.assign(tomSt, {arms: ['shrug', 'shrug'], mood: 'grin', brow: .6});
  if (inW(t, Wd.weather + .2, T('k6'))) Object.assign(tomSt, {arms: ['down', 'down'], mood: 'sad', inner: -1, brow: 0, lookY: -1, look: 0});
  if (inW(t, T('t5'), T('k6'))) Object.assign(tomSt, {look: .5, lookY: 0});
  if (inW(t, T('t7'), T('t9'))) Object.assign(tomSt, {arms: ['shrug', 'shrug'], mood: 'grin', brow: .8});
  if (inW(t, T('t9'), T('k10'))) Object.assign(tomSt, {arms: ['point', 'pocket'], look: -1, lookY: -.5, mood: 'o', brow: 1});
  if (inW(t, Wd.vedro, T('k10'))) Object.assign(tomSt, {arms: ['down', 'down'], mood: 'flat', look: 0, lookY: 0});
  if (inW(t, T('k10'), T('t11'))) Object.assign(tomSt, {arms: ['pocket', 'pocket'], mood: 'o', inner: -1, look: t > CAR0 ? 1 : .6, lookY: t > CAR0 + .6 ? -1 : 0});
  if (inW(t, T('t11'), HORSE0)) Object.assign(tomSt, {arms: ['hold', 'hold'], mood: t > Wd.ice ? 'o' : 'grin', look: .6, lookY: -.3, brow: .6});
  if (inW(t, T('k12'), HORSE0)) Object.assign(tomSt, {arms: ['pocket', 'pocket'], mood: 'o', lookY: -1, inner: -1});
  if (horseRun) Object.assign(tomSt, {arms: ['hold', 'hold'], mood: 'o', brow: 1.2, look: 1});
  if (t >= T('t13')) Object.assign(tomSt, {arms: ['shrug', 'shrug'], mood: 'sad', inner: -1, look: .6});
  if (t >= T('k14')) Object.assign(tomSt, {arms: ['pocket', 'pocket'], mood: 'flat'});
  if (t >= DOOR0) Object.assign(tomSt, {look: .1, lookY: -.3, mood: 'o', brow: .8, inner: 0});
  // horses behind/around Tom
  if (!(horseRun && tx > 1300)) {
    contact(tx, GY + 4, 150);
    g.save(); g.translate(tx, GY + tomLift); g.rotate(tomTilt); g.translate(-tx, -GY); drawChar(TOM, tx, GY, t, 't', tomSt, 1); g.restore();
    if (t < E('k2') - .3) book(tx + 6, 870 + Math.sin(t * 2.4 + 1) * 3 - (inW(t, wordT('t0', 'тысячу'), wordT('t0', 'теперь')) ? 30 : 0), -.06);
    if (inW(t, T('t11'), HORSE0)) { const sw = t < Wd.ice - .18 ? -.35 + Math.sin(t * 3) * .05 : t < Wd.ice ? -.35 + 2.7 * ease((t - Wd.ice + .18) / .18) : 2.35; hammer(tx + 10, 860, sw); }
  }
  // literal: cloud + rain
  if (inW(t, Wd.weather, T('k6'))) { const k = ease((t - Wd.weather) / .3) * (1 - ease((t - T('k6') + .3) / .3)); g.save(); g.beginPath(); g.rect(TX - 170, 380, 340, GY - 380); g.clip(); g.globalAlpha = k; rainDrops(TX - 160, TX + 160, 380, GY, t, 12); g.restore(); cloudShape(TX, 345 + Math.sin(t * 2) * 6, k * .8, true); }
  // literal: ears all over Tom
  if (inW(t, Wd.ears, T('t9'))) { const k = clamp((t - Wd.ears) / .9) * (1 - ease((t - T('t9') + .3) / .3));
    [[-150, -120, -.6], [150, -120, .6], [-120, -310, -.9], [130, -300, .8], [0, -420, 0], [-170, 60, -.3], [170, 60, .3], [-80, 240, -.4], [90, 260, .4], [0, 120, .1]].forEach(([dx, dy, a], i) => {
      const kk = clamp(k * 2 - i * .1); ear(TX + dx, 760 + dy, a + Math.sin(t * 6 + i) * .08, kk * (1 + .25 * Math.sin(Math.PI * kk)) * .85); }); }
  // literal: cats & dogs + bucket
  if (inW(t, Wd.cats, T('k10'))) { const k = ease((t - Wd.cats) / .3) * (1 - ease((t - E('n3')) / .4)); g.save(); g.globalAlpha = k; rainDrops(-40, 1120, 200, GY, t, 22, 3);
    [[cat, 140, 0], [dog, 800, 500], [cat, 640, 900], [dog, 300, 1200], [cat, 960, 1350], [dog, 520, 300], [cat, 60, 700], [dog, 1020, 100]].forEach(([fn, x, off], i) => { const y = 120 + ((t - Wd.cats) * 700 + off) % 1500; fn(x, y, Math.sin(t * 3 + i) * .6, .9); });
    g.restore(); }
  if (inW(t, Wd.vedro - .35, T('k10'))) { const k = ease((t - Wd.vedro + .35) / .35); bucket(TX + 4, -100 + (470 - -100) * k, Math.PI + Math.sin(Math.max(0, t - Wd.vedro) * 18) * .12 * Math.exp(-Math.max(0, t - Wd.vedro) * 3)); }
  // literal: ice
  if (inW(t, Wd.brk - .2, T('k12'))) { const k = ease((t - Wd.brk + .2) / .3); g.save(); g.translate(0, (1 - k) * -900); iceBlock(600, GY, t, t >= Wd.ice); g.restore(); }
  // --- Kate ---
  const kateSt = {arms: ['hip', 'pocket'], look: -.6};
  if (inW(t, T('k1'), T('k2'))) Object.assign(kateSt, {arms: ['folded', 'folded'], inner: -1.2, mood: 'o'});
  if (inW(t, T('k2'), E('k2'))) Object.assign(kateSt, {arms: ['hip', 'wave'], brow: .8});
  if (inW(t, Wd.weather, T('k4'))) Object.assign(kateSt, {mood: 'o', brow: 1});
  if (inW(t, T('k4'), E('k4') + .2)) Object.assign(kateSt, {arms: ['shrug', 'shrug'], mood: 'grin', blink: t - T('k4') < 1 ? 1 : undefined});
  if (inW(t, T('k6'), T('k8'))) Object.assign(kateSt, {arms: ['folded', 'folded'], mood: Wd.ears < t ? 'o' : '', brow: Wd.ears < t ? 1.2 : 0});
  if (inW(t, T('k8'), T('t9'))) Object.assign(kateSt, {arms: ['folded', 'folded'], mood: 'grin', inner: -.6});
  if (inW(t, T('t9'), T('k10'))) Object.assign(kateSt, {arms: ['up', 'up'], look: -1, lookY: -.5, mood: 'o', brow: 1.2});
  if (inW(t, Wd.vedro, T('k10'))) Object.assign(kateSt, {arms: ['folded', 'folded'], look: -.6, lookY: 0, mood: 'flat', brow: 0, inner: .6});
  if (inW(t, T('k10'), CAR0)) Object.assign(kateSt, {arms: ['hip', 'hip'], inner: 1.3, mood: 'flat'});
  const hang = t >= CAR1 && t < T('t13');
  if (!(t >= CAR0 && t < T('t13'))) { contact(KX, GY + 4, 140); drawChar(KATE, KX, GY, t, 'k', kateSt, 2); }
  else if (t < CAR1) { const [cx, cy, ca] = carPos(t); car(cx, cy, ca, t); }
  else if (hang) { const sway = Math.sin((t - CAR1) * 3) * .05 * Math.exp(-(t - CAR1) * .4) + Math.sin(t * 1.4) * .015;
    const st = {arms: ['folded', 'folded'], inner: 1.2, mood: 'flat', look: .6};
    if (inW(t, T('k12'), E('k12') + .2)) Object.assign(st, {arms: ['shrug', 'shrug'], brow: 1});
    if (t > HORSE0) Object.assign(st, {look: 1, mood: 'grin', inner: 0, brow: .5});
    g.save(); g.translate(KX, 200); g.rotate(Math.PI + sway); drawChar(KATE, 0, 0, t, 'k', st, 2); g.restore(); }
  if (horseRun) { horse(hx, GY + 10, t * 15, '#9b6a3f', '#4a2f1e'); horse(hx - 60 + 520, GY + 30, t * 15 + 1.7, '#f4efe4', '#b9b6c2'); if (tx > TX) { line([[hx + 270, GY - 440], [tx + 10, 860]], 4); line([[hx + 730, GY - 420], [tx + 20, 860]], 4); } }
  // ---- screen space UI ----
  g.setTransform(1, 0, 0, 1, 0, 0);
  const heads = {t: [tx, 560], k: hang ? [KX, 1180] : [KX, 580], m: [540, 820]};
  for (const id in TXT) if (inW(t, T(id) - .05, E(id) + .5)) bubble(id, t, toScreen(cam, ...heads[id[0]]));
  for (const id in CARD) if (inW(t, T(id) - .2, E(id) + .6)) narCard(id, t);
  if (t > T('n8') - .2) endCard(t);
  // cut flash
  const sinceCut = t - cam.at; if (sinceCut < .06 && cam.at > 0) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, 0, W, H); }
  if (t < T('n8')) watermark();
  g.drawImage(PAPER, 0, 0);
}

// ---------------- audio ----------------
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3');
  const ev = []; // [file, time, gain, extra filter]
  for (const id in LN) ev.push([LN[id].file, LN[id].at, LN[id].who === 'n' ? 1.0 : 1.05]);
  for (const id in CARD) ev.push([sfx('swipe'), T(id) - .2, .35]);
  ev.push([sfx('pop'), Wd.weather, .6]); for (let i = 0; i < 4; i++) ev.push([sfx('pop'), Wd.ears + i * .18, .55]);
  ev.push([sfx('meow'), Wd.cats + .5, .5]); ev.push([sfx('meow'), Wd.cats + 1.6, .4]); ev.push([sfx('ding'), Wd.vedro + .02, .6]);
  ev.push([sfx('whoosh'), CAR0, .6]); ev.push([sfx('whoosh'), CAR0 + .6, .5]); ev.push([sfx('whoosh'), CAR0 + 1.5, .5]); ev.push([sfx('pop'), CAR1, .5]);
  ev.push([sfx('whoosh'), Wd.ice - .2, .5]); ev.push([sfx('scratch'), Wd.ice, .6]); ev.push([sfx('pop'), Wd.ice, .8]);
  ev.push([sfx('steps'), HORSE0, .9, 'atempo=2.0,atempo=1.3']); ev.push([sfx('whoosh'), HORSE0 + .9, .5]);
  ev.push([sfx('tap'), DOOR0 - .2, .7]); ev.push([sfx('tap'), DOOR0 + .05, .7]); ev.push([sfx('ding'), T('n8'), .5]);
  const args = ['-y', '-v', 'error'], fl = [];
  ev.forEach(([f]) => args.push('-i', f));
  args.push('-stream_loop', '-1', '-i', sfx('theme'));
  args.push('-f', 'lavfi', '-t', String(TOTAL), '-i', 'anoisesrc=color=pink:amplitude=0.6:sample_rate=44100');
  ev.forEach(([f, at, gn, x], i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo${x ? ',' + x : ''},volume=${gn},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`));
  const m = ev.length, nz = m + 1;
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume=0.13,afade=t=in:d=0.6,afade=t=out:st=${TOTAL - 1.2}:d=1.2[mus]`);
  // rain bed (pink noise) under the two rain gags
  const r1 = [Wd.weather, T('k6')], r2 = [Wd.cats, E('n3') + .3];
  fl.push(`[${nz}:a]aformat=channel_layouts=stereo,lowpass=f=2600,highpass=f=300,volume='0.05*(between(t,${r1[0]},${r1[1]})+between(t,${r2[0]},${r2[1]})*1.4)':eval=frame[rain]`);
  fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus][rain]amix=inputs=${m + 2}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(TMP, 'mix.wav'));
  const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); }
  console.log('mix ok', TOTAL.toFixed(2));
}
function srt() {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const id in LN) { const l = LN[id], txt = TXT[id] ? (TXT[id][0] ? TXT[id][0].replace(/\*/g, '') + '\n' + TXT[id][1] : TXT[id][1]) : (CARD[id] ? CARD[id] + '\n' : '') + l.text; out += `${++n}\n${f(l.at)} --> ${f(l.end + .2)}\n${txt}\n\n`; }
  fs.writeFileSync(path.join(OUT, 'literally_full.srt'), out); console.log('srt', n);
}

// ---------------- main ----------------
const cv = createCanvas(W, H); g = cv.getContext('2d'); K.setG(g);
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'still') { for (const s of a1.split(',')) { frame(parseFloat(s)); fs.writeFileSync(path.join(OUT, `still_${s}.png`), cv.toBuffer('image/png')); } console.log('total', TOTAL.toFixed(2), JSON.stringify(Object.fromEntries(Object.entries(LN).map(([k, v]) => [k, +v.at.toFixed(2)])))); }
else if (mode === 'chunk') {
  const i = +a1, n = +a2, N = Math.ceil(TOTAL * FPS), f0 = Math.floor(N * i / n), f1 = Math.floor(N * (i + 1) / n);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', path.join(TMP, `chunk_${i}.mp4`)]);
  (async () => { for (let f = f0; f < f1; f++) { frame(f / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
  ff.on('close', c => console.log('chunk', i, 'done', c));
}
else if (mode === 'audio') audio();
else if (mode === 'srt') srt();
else if (mode === 'cover') {
  frame(parseFloat(a1 || '27'));
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(30,20,40,0.0)';
  rrect(70, 1380, 940, 300, 40, '#24432c', '#1a2f20', 6); g.fillStyle = '#ffd23a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `96px ${FB}`; g.fillText('ИДИОМЫ', 540, 1475); g.fillStyle = '#fff'; g.font = `76px ${FB}`; g.fillText('БУКВАЛЬНО', 540, 1585);
  fs.writeFileSync(path.join(OUT, 'literally_full_cover.png'), cv.toBuffer('image/png')); console.log('cover');
}
