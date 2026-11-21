// «На всякий случай», выпуск 1. Flat style (people_flat.js = Anna's approved kit), fast cut editing:
// one character per shot, punch-in zooms, big bold word-chunk captions, top label pill.
// node render.js still t1,t2 | chunk i n | audio | srt | cover t
const fs = require('fs'), path = require('path'), {spawn, spawnSync} = require('child_process');
const K = require('./flat'), A = require('./people_flat'); const {rr, ell, ln, text} = K;
const W = 1080, H = 1920, FPS = 30, D = __dirname, VD = path.join(D, 'voice'), OUT = path.join(D, 'out'), TMP = path.join(OUT, 'tmp'); fs.mkdirSync(TMP, {recursive: true});
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const OUTL = '#2a1f1d', FONT = 'NL, NC';
let g;
const dur = f => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());
function envelope(f) { const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], {maxBuffer: 1 << 26}).stdout, n = raw.length / 2, per = 8000 / FPS, out = [];
  for (let i = 0; i * per < n; i++) { let s = 0, c = 0; for (let j = Math.floor(i * per); j < Math.min(n, (i + 1) * per); j++) { const v = raw.readInt16LE(j * 2) / 32768; s += v * v; c++; } out.push(Math.sqrt(s / Math.max(1, c))); }
  const srt = [...out].sort((a, b) => a - b), p = srt[Math.floor(srt.length * .93)] || 1; return out.map(v => clamp((v / p - .08) * 1.15)); }

// ---------------- timeline ----------------
const ORDER = [['t1', .3], ['k1', .15], ['t2', .5], ['k2', .2], ['t3', .2], ['k3', .15], ['t4', .3], ['k4', .3], ['t5', .3], ['k5', .15], ['t6', .5], ['k6', .15],
  ['n1', .9], ['o1', .4], ['k7', .5], ['o2', .2], ['k8', .2], ['o3', 1.1], ['k9', .2], ['o4', .5], ['n2', .9]];
const LN = {};
{ let t = 0; for (const [id, gap] of ORDER) { const f = path.join(VD, id + '.mp3'), d = dur(f); t += gap; const w = JSON.parse(fs.readFileSync(path.join(VD, id + '.words.json'), 'utf8')).words;
  LN[id] = {id, at: t, dur: d, end: t + d, who: id[0], env: envelope(f), words: w, file: f}; t += d; } }
const T = id => LN[id].at, E = id => LN[id].end, inW = (t, a, b) => t >= a && t < b;
const talk = (who, t) => { for (const id in LN) { const l = LN[id]; if (l.who === who && t >= l.at && t < l.end) { const i = Math.floor((t - l.at) * FPS); return clamp(((l.env[i] || 0) + (l.env[i + 1] || 0)) / 2); } } return 0; };
const blink = (t, s) => ((t + s * 1.3) % (3.1 + s * .5)) < .12;
const RUN0 = E('k6') - .1, AIR0 = T('n1') - .4, CAT0 = E('o1') - .5, BURP0 = E('k8') + .1, END0 = T('n2') - .2, TOTAL = E('n2') + 2.4;
// translation shown under English captions
const TR = {t1: 'Привет, Катя! Завтра Нью-Йорк? Начнём с основ: «Привет, как дела?»', t2: '…Мой кот… съел мой паспорт?', t3: 'Это не моё. Мне подкинули. …Стоп. Зачем вам это?',
  t4: 'Я не флиртую. У меня просто глаз дёргается.', t5: 'Так. Урок окончен. С вас 50 долларов.', t6: '…У меня нет денег.',
  o1: 'Мэм! Это ваша сумка? Внутри что-то шевелится.', o2: 'Так… а где ваш паспорт?', o3: '…Вы со мной флиртуете?', o4: '…Добро пожаловать в Америку.',
  k2: 'мой кот съел мой паспорт', k6: 'у меня нет денег!', k7: 'Это не моё! Мне подкинули!', k8: 'Мой кот… съел мой паспорт.', k9: 'Я не флиртую! У меня просто глаз дёргается!'};

// ---------------- shots ----------------
const SH = [[0, 'TWO'], [T('k1'), 'K'], [T('t2'), 'T'], [T('k2'), 'K'], [T('t3'), 'T'], [T('k3'), 'K'], [T('t4'), 'TC'], [T('k4'), 'K'], [T('t5'), 'TWO'], [T('k5'), 'K'], [T('t6'), 'TD'], [T('k6'), 'TWO'],
  [AIR0, 'CARD'], [E('n1') + .2, 'AIR'], [T('o1'), 'O'], [CAT0, 'BAG'], [T('k7'), 'KA'], [T('o2'), 'O'], [T('k8'), 'KA'], [BURP0, 'BAG'], [T('o3') - 1.0, 'OD'], [T('k9'), 'KA'], [T('o4'), 'AIR'], [END0, 'END']];
const shotAt = t => { let s = SH[0], i = 0; SH.forEach((q, k) => { if (t >= q[0]) { s = q; i = k; } }); return {kind: s[1], at: s[0], i}; };

// ---------------- characters ----------------
const LOOK = {
  katya: {pal: {card: '#f2b632', cardS: '#d6951a'}, look2: {}},
  tutor: {pal: {skin: '#f5c9a6', skinS: '#e0a07a', hair: '#c8642a', hairS: '#a04a18', hairL: '#e08a4a', card: '#4f9a6a', cardS: '#357a50', jeans: '#8a7a6a', jeansS: '#6a5a4a', brow: '#a04a18', lips: '#b0485a'}, look2: {hair: 'curly', beard: '#c8642a', glasses: true, freckles: false}},
  officer: {pal: {skin: '#c98d64', skinS: '#a86c44', hair: '#1e1614', hairS: '#0e0a09', card: '#2f4a7a', cardS: '#1f3458', tee: '#bfe0f5', jeans: '#1f2f55', jeansS: '#141f3a', brow: '#1e1614', lips: '#8a4a3a'}, look2: {hair: 'short', mustache: '#1e1614', cap: '#1f2f55', freckles: false}},
};
const st = (pose, mood, extra) => ({pose, mood, ...(extra || {})});
function katyaSt(t) {
  let s = st('down', undefined, {look: .6});
  if (inW(t, T('k1'), E('k1'))) s = st('shrug', undefined);
  if (inW(t, T('k2'), E('k2'))) s = st('hold', undefined, {notebook: true});
  if (inW(t, T('k3'), E('k3'))) s = st('shrug', undefined, {brows: 'up'});
  if (inW(t, T('k4'), E('k4'))) s = st('hips', undefined);
  if (inW(t, T('k5'), E('k5'))) s = st('hold', undefined, {notebook: true, brows: 'up'});
  if (t >= T('k6')) s = st('wave', undefined, {look: -1});
  if (t >= AIR0) s = st('down', undefined, {look: .8});
  if (inW(t, T('o1'), T('k7'))) s = st('down', 'o', {wide: true, look: .8});
  if (inW(t, T('k7'), E('k7'))) s = st('shrug', 'o', {wide: true, sweat: true, brows: 'up'});
  if (inW(t, T('k8'), BURP0 + .6)) s = st('hold', 'sad', {brows: 'sad'});
  if (inW(t, T('o3'), T('k9'))) s = st('down', 'o', {wide: true});
  if (inW(t, T('k9'), E('k9'))) s = st('shrug', 'flat', {sweat: true, twitch: true});
  if (t >= T('o4')) s = st('wave', undefined);
  return s;
}
function tutorSt(t) {
  let s = st('wave', undefined, {look: -.6});
  if (inW(t, E('t1'), T('t2'))) s = st('down', 'o', {wide: true, look: -.6});
  if (inW(t, T('t2'), E('t2'))) s = st('shrug', 'flat', {brows: 'up'});
  if (inW(t, T('t3'), E('t3'))) s = st('hold', 'flat', {sweat: true, brows: 'angry'});
  if (inW(t, T('t4'), E('k4'))) s = st('down', 'sleepy', {twitch: true});
  if (inW(t, T('t5'), E('t5'))) s = st('hips', 'flat');
  if (inW(t, T('k5'), E('t6') + .3)) s = st('down', 'sleepy', {twitch: true});
  if (t >= RUN0) s = st('shrug', 'o', {wide: true, look: -1});
  return s;
}
function officerSt(t) {
  let s = st('hips', 'flat', {brows: 'angry', look: -.6});
  if (inW(t, CAT0, T('k7'))) s = st('down', 'o', {wide: true});
  if (inW(t, T('o2'), E('o2'))) s = st('hold', 'flat', {brows: 'angry'});
  if (inW(t, BURP0, T('o3') - 1)) s = st('down', 'o', {wide: true});
  if (inW(t, T('o3') - 1, E('k9') + .3)) s = st('down', 'sleepy', {twitch: true});
  if (t >= T('o4')) s = st('down', undefined, {look: -.6});
  return s;
}
function person(who, x, y, s, t, extra = {}) {
  const fn = {katya: katyaSt, tutor: tutorSt, officer: officerSt}[who], sst = fn(t), m = talk(who[0], t);
  const twitchOn = sst.twitch && Math.sin(t * 38) > 0;
  A.draw(g, {x, y, s, blink: twitchOn || blink(t, who.length), mouth: m, ...LOOK[who], ...sst, twitch: twitchOn, mood: m > .12 ? undefined : sst.mood, ...extra});
  if (sst.notebook) { g.save(); g.translate(x, y); g.scale(s, s); rr(-90, -760, 180, 130, 12, '#ffffff', 7); for (let i = 0; i < 3; i++) ln([[-60, -725 + i * 30], [60, -725 + i * 30]], 5, '#9aa3b5'); g.restore(); }
}

// ---------------- sets (screen space) ----------------
function room(t, dark) {
  g.fillStyle = '#f3ead8'; g.fillRect(0, 0, W, H); g.fillStyle = '#5fa89a'; g.fillRect(0, 980, W, 560); ln([[0, 980], [W, 980]], 8);
  g.fillStyle = '#d9a066'; g.fillRect(0, 1540, W, 380); ln([[0, 1540], [W, 1540]], 8); for (let x = 0; x < W; x += 180) ln([[x, 1540], [x - 60, H]], 4, 'rgba(42,31,29,0.25)');
  // whiteboard at the top, phrases appear as they are learned
  rr(110, 150, 860, 400, 24, '#ffffff', 8); text('ENGLISH', 540, 205, 46, '#3a5a8a', 'center', FONT);
  [['t2', 'My cat ate my passport'], ['t3', "It's not mine"], ['t4', "I'm not flirting"], ['t6', "I don't have any money"]].forEach(([id, s], i) => { if (t > E(id) - .2) text(s, 150, 280 + i * 70, 44, i === 3 ? '#e0303f' : OUTL, 'left', FONT); });
  if (t > E('t5') - .3) text('$50', 880, 500, 64, '#2f9a5a', 'center', FONT);
  if (dark) { g.fillStyle = 'rgba(20,15,30,0.55)'; g.fillRect(0, 0, W, H); }
}
function air(t, dark) {
  g.fillStyle = '#dbe8f5'; g.fillRect(0, 0, W, H); for (let i = 0; i < 3; i++) rr(60 + i * 340, 120, 280, 360, 20, '#a8d4ff', 7);
  const px = ((t - AIR0) * 90) % 1300 - 200; g.save(); g.translate(px, 260); g.beginPath(); g.ellipse(0, 0, 90, 18, 0, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = OUTL; g.lineWidth = 5; g.stroke(); g.beginPath(); g.moveTo(-10, 0); g.lineTo(20, -50); g.lineTo(36, -50); g.lineTo(26, 4); g.closePath(); g.fill(); g.stroke(); g.restore();
  rr(240, 540, 600, 130, 24, '#1f2f55', 8); text('U.S. CUSTOMS', 540, 607, 64, '#ffffff', 'center', FONT);
  g.fillStyle = '#c9ced6'; g.fillRect(0, 1540, W, 380); ln([[0, 1540], [W, 1540]], 8);
  if (dark) { g.fillStyle = 'rgba(20,15,30,0.55)'; g.fillRect(0, 0, W, H); }
}
function desk(y) { rr(-40, y, W + 80, 60, 10, '#c9ced6', 8); rr(-40, y + 56, W + 80, 600, 0, '#5a6a80', 8); }
function bag(x, y, s, t) { const sh = inW(t, T('o1') + .6, CAT0 + .2) ? Math.sin(t * 50) * 8 : 0; g.save(); g.translate(x + sh, y); g.scale(s, s);
  rr(-170, -130, 340, 150, 34, '#e0303f', 8); ln([[-150, -112], [150, -112]], 6); g.beginPath(); g.moveTo(-70, -130); g.quadraticCurveTo(0, -230, 70, -130); g.strokeStyle = OUTL; g.lineWidth = 14; g.stroke(); g.restore(); }
function cat(x, y, s, k, t) { if (k <= 0) return; g.save(); g.translate(x, y - ease(k) * 110 * s); g.scale(s, s);
  for (const q of [-1, 1]) { g.beginPath(); g.moveTo(q * 80, -40); g.lineTo(q * 66, -140); g.lineTo(q * 20, -76); g.closePath(); g.fillStyle = '#f0a050'; g.fill(); g.strokeStyle = OUTL; g.lineWidth = 7; g.stroke(); }
  ell(0, 0, 104, 86, '#f0a050', 7);
  const happy = t > BURP0 + .5; for (const q of [-1, 1]) { if (happy) K.curve([q * 36 - 18, -6], [q * 36, -26], [q * 36 + 18, -6], 7); else { ell(q * 36, -10, 20, 24, '#ffffff', 6); ell(q * 36 + 3, -6, 9, 11, OUTL, 0); } }
  ell(0, 22, 11, 8, '#e0566e', 0);
  const burp = clamp((t - BURP0) / .5); if (burp > 0 && burp < 1) ell(0, 52, 24, 20, '#7a2230', 6); else K.curve([-18, 38], [0, 52], [18, 38], 6);
  for (const q of [-1, 1]) for (let i = 0; i < 2; i++) ln([[q * 46, 26 + i * 14], [q * 128, 16 + i * 24]], 4);
  g.restore();
  if (t > BURP0) for (let i = 0; i < 4; i++) { const u = clamp((t - BURP0 - i * .06) / 1.3); if (u >= 1) continue; g.save(); g.translate(x + (i - 1.5) * 90 * u, y - 110 * s + 40 - Math.sin(u * Math.PI) * 320 + u * 160); g.rotate(u * 4 + i);
    rr(-40, -28, 80, 56, 6, '#2b4a8a', 5); if (i === 0) text('USA', 0, 2, 26, '#ffd23f', 'center', FONT); g.restore(); }
}

// ---------------- captions ----------------
function chunks(id) { if (LN[id].ch) return LN[id].ch; const ws = LN[id].words, out = []; let cur = [];
  for (const w of ws) { const txt = [...cur.map(q => q.w), w.w].join(' '); if (cur.length && (txt.length > 22 || /[.?!]$/.test(cur[cur.length - 1].w))) { out.push(cur); cur = []; } cur.push(w); }
  if (cur.length) out.push(cur); LN[id].ch = out.map((c, i) => ({s: c[0].s, txt: c.map(q => q.w).join(' ').replace(/^\[.*?\]\s*/, '')})); return LN[id].ch; }
function bold(s, x, y, size, fill) { g.font = `${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  let f = size; while (g.measureText(s).width > 980 && f > 40) { f -= 4; g.font = `${f}px ${FONT}`; }
  g.lineWidth = f * .22; g.strokeStyle = '#000000'; g.strokeText(s, x, y); g.fillStyle = fill; g.fillText(s, x, y); }
function captions(t) {
  for (const id in LN) { if (id === 'n1' || id === 'n2') continue; const l = LN[id]; if (!inW(t, l.at, l.end + .25)) continue;
    const ch = chunks(id); let c = ch[0]; for (const q of ch) if (t - l.at >= q.s - .05) c = q;
    const latin = /[A-Za-z]/.test(c.txt), pop = 1 + .12 * (1 - ease((t - l.at - c.s) / .12));
    g.save(); g.translate(540, 1080); g.scale(pop, pop); bold(c.txt, 0, 0, 82, latin ? '#ffd23f' : '#ffffff'); g.restore();
    if (latin && TR[id]) { g.font = `48px ${FONT}`; const ws = TR[id].split(' '), L = []; let l = ''; for (const w of ws) { const q = l ? l + ' ' + w : w; if (g.measureText(q).width > 940 && l) { L.push(l); l = w; } else l = q; } L.push(l);
      L.forEach((q, i) => bold(q, 540, 1180 + i * 62, 48, '#bfe9ff')); } }
}

// ---------------- frame ----------------
function frame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  const sh = shotAt(t), push = 1 + Math.min(t - sh.at, 5) * .012;
  const zoom = (cx, cy, z) => { g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy); };
  g.save(); zoom(540, 1100, push);
  if (sh.kind === 'TWO') { room(t, false); const run = clamp((t - RUN0) / 1.1); person('katya', 300 - run * 800, 1880 - (run > 0 ? Math.abs(Math.sin(t * 14)) * 40 : 0), .62, t); person('tutor', 780, 1880, .64, t); }
  if (sh.kind === 'K') { room(t, false); person('katya', 540, 2120, 1.12, t); }
  if (sh.kind === 'T' || sh.kind === 'TD') { room(t, sh.kind === 'TD'); person('tutor', 540, 2120, 1.12, t); }
  if (sh.kind === 'TC') { room(t, false); person('tutor', 540, 2960, 1.9, t); }
  if (sh.kind === 'CARD') { air(t, true); }
  if (sh.kind === 'AIR') { air(t, false); person('officer', 760, 1880, .64, t); desk(1290); cat(560, 1290, .55, clamp((t - CAT0) / .35), t); bag(560, 1300, .6, t); const w = clamp((t - E('n1')) / .8); person('katya', 260 - (1 - w) * 500, 1900, .62, t); }
  if (sh.kind === 'O' || sh.kind === 'OD') { air(t, sh.kind === 'OD'); person('officer', 540, sh.kind === 'OD' ? 2700 : 2160, sh.kind === 'OD' ? 1.7 : 1.12, t); desk(sh.kind === 'OD' ? 1750 : 1380); }
  if (sh.kind === 'KA') { air(t, false); person('katya', 540, 2120, 1.12, t); }
  if (sh.kind === 'BAG') { air(t, false); desk(1560); cat(540, 1560, 1.3, clamp((t - CAT0) / .35), t); bag(540, 1590, 1.4, t); }
  if (sh.kind === 'END') { room(t, true); }
  g.restore();
  if (t - sh.at < .06 && sh.i > 0) { g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(0, 0, W, H); }
  // top label pill (like a running series)
  if (sh.kind !== 'END') { g.font = `40px ${FONT}`; const lab = 'НА ВСЯКИЙ СЛУЧАЙ #1', w = g.measureText(lab).width + 60; rr(540 - w / 2, 40, w, 72, 18, '#ffffff', 6); text(lab, 540, 78, 40, '#111111', 'center', FONT); }
  // hook: first seconds
  if (t < T('k1') + 1.2) { const k = ease(t / .25) * (1 - ease((t - T('k1') - .9) / .3)); g.save(); g.globalAlpha = k; g.translate(540, 700); g.rotate(-.04); g.scale(.8 + .2 * k, .8 + .2 * k);
    rr(-430, -110, 860, 220, 34, '#e0303f', 8); text('АНГЛИЙСКИЙ', 0, -36, 88, '#ffffff', 'center', FONT); text('на всякий случай', 0, 50, 58, '#ffe066', 'center', FONT); g.restore(); }
  if (sh.kind === 'CARD') { const k = ease((t - AIR0) / .3); g.save(); g.globalAlpha = k; g.translate(540, 900); g.rotate(-.03); g.scale(.85 + .15 * k, .85 + .15 * k);
    rr(-400, -150, 800, 300, 40, '#ffffff', 8); text('Через неделю', 0, -50, 80, '#111111', 'center', FONT); text('NEW YORK', 0, 60, 100, '#e0303f', 'center', FONT); g.restore(); }
  if (sh.kind !== 'END') captions(t);
  if (sh.kind === 'END') { const k = ease((t - END0) / .35); g.save(); g.globalAlpha = k;
    rr(70, 300, 940, 1280, 50, '#ffffff', 8); text('НА ВСЯКИЙ СЛУЧАЙ', 540, 410, 66, '#e0303f', 'center', FONT);
    [['My cat ate my passport.', 'Мой кот съел мой паспорт.'], ["It's not mine.", 'Это не моё.'], ["I'm not flirting.", 'Я не флиртую.'], ["I don't have any money.", 'У меня нет денег.']].forEach(([en, ru], i) => {
      const a = ease((t - END0 - .2 - i * .15) / .25); g.globalAlpha = k * a; text(en, 540, 560 + i * 200, 58, '#2f4a7a', 'center', FONT); text(ru, 540, 630 + i * 200, 42, '#555555', 'center', FONT); });
    g.globalAlpha = k; text('Какую выучишь первой?', 540, 1400, 52, '#111111', 'center', FONT); rr(330, 1460, 420, 84, 42, '#ffe066', 6); text('ПОДПИШИСЬ', 540, 1503, 50, '#111111', 'center', FONT); g.restore(); }
}

// ---------------- audio / srt ----------------
function audio() {
  const sfx = n => path.join(D, 'sfx', n + '.mp3'), ev = [];
  for (const id in LN) ev.push([LN[id].file, LN[id].at, 1.0]);
  SH.forEach(([at], i) => { if (i) ev.push([sfx('swipe'), at - .05, .18]); });
  ev.push([sfx('coin'), E('t5') - .4, .6]); ev.push([sfx('whoosh'), RUN0, .6]); ev.push([sfx('steps'), RUN0 + .1, .6]);
  ev.push([sfx('ding'), AIR0, .5]); ev.push([sfx('meow'), CAT0 + .1, .9]); ev.push([sfx('pop'), BURP0, .8]); ev.push([sfx('scratch'), T('o3') - 1.0, .5]); ev.push([sfx('pop'), T('k1') + .1, .3]);
  ev.push([sfx('chime'), T('o4') + .2, .5]); ev.push([sfx('ding'), END0, .45]);
  const args = ['-y', '-v', 'error'], fl = []; ev.forEach(([f]) => args.push('-i', f));
  args.push('-stream_loop', '-1', '-i', sfx('theme'));
  ev.forEach(([f, at, gn], i) => fl.push(`[${i}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${gn},adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`));
  const m = ev.length;
  fl.push(`[${m}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${TOTAL},volume='0.12*(1-0.85*between(t,${T('t6')},${E('t6')}))*(1-0.85*between(t,${T('o3') - 1},${E('o3')}))':eval=frame,afade=t=in:d=0.4,afade=t=out:st=${TOTAL - 1.2}:d=1.2[mus]`);
  fl.push(`${ev.map((_, i) => `[a${i}]`).join('')}[mus]amix=inputs=${m + 1}:normalize=0:duration=longest,atrim=0:${TOTAL},acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-15:TP=-1.5:LRA=7,alimiter=limit=0.8:level=disabled[out]`);
  args.push('-filter_complex', fl.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', path.join(TMP, 'mix.wav'));
  const r = spawnSync('ffmpeg', args); if (r.status) { console.error(r.stderr.toString()); process.exit(1); } console.log('mix ok', TOTAL.toFixed(2));
}
function srt() {
  const f = s => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const id in LN) { const said = JSON.parse(fs.readFileSync(path.join(VD, id + '.words.json'), 'utf8')).text.replace(/\[[^\]]*\]\s*/g, ''); out += `${++n}\n${f(LN[id].at)} --> ${f(LN[id].end + .2)}\n${said}${TR[id] ? '\n' + TR[id] : ''}\n\n`; }
  fs.writeFileSync(path.join(OUT, 'just_in_case_ep1.srt'), out); console.log('srt', n);
}

// ---------------- main ----------------
const cv = K.createCanvas(W, H); g = cv.getContext('2d'); K.setG(g);
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
  g.setTransform(1, 0, 0, 1, 0, 0); air(+a1, false); person('katya', 360, 2120, 1.0, +a1, {pose: 'shrug', mood: 'o', wide: true, blink: false, brows: 'up', sweat: true, mouth: 0, twitch: false}); desk(1500); bag(800, 1530, 1.2, +a1); cat(800, 1420, 1.1, 1, 0);
  g.save(); g.translate(540, 330); g.rotate(-.03); rr(-480, -150, 960, 300, 44, '#e0303f', 8); text('«МОЙ КОТ СЪЕЛ', 0, -48, 84, '#ffffff', 'center', FONT); text('МОЙ ПАСПОРТ»', 0, 56, 84, '#ffe066', 'center', FONT); g.restore();
  bold('английский на всякий случай', 540, 1760, 64, '#ffffff');
  fs.writeFileSync(path.join(OUT, 'just_in_case_ep1_cover.png'), cv.toBuffer('image/png')); console.log('cover');
}
