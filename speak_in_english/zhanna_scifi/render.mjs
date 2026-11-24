// «Тётя Жанна» × Sci-Fi Sitcom Toon — 20-second trial. Vertical 1080×1920, 24 fps (camera on ones), characters/boil on twos (12 fps).
// node render.mjs still 1,5,12 | clip 0 10 out/p0.mp4 | srt | cover | sheet | textaudit        (needs timeline.json from prep.py)
import fs from 'fs'; import { spawn } from 'child_process';
import { createCanvas, GlobalFonts, Path2D } from '@napi-rs/canvas';
globalThis.Path2D = Path2D;
const D = new URL('.', import.meta.url).pathname; process.chdir(D);
for (const [f, n] of [['baloo2', 'Baloo 2'], ['bungee', 'Bungee'], ['vt323', 'VT323'], ['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL']]) GlobalFonts.registerFromPath(`${D}fonts/${f}.woff2`, n);
const T = await import('./lib/toon.mjs'); const C = await import('./chars.mjs'); const { clamp, lerp, hash } = await import('./lib/lib.mjs');
const W = 1080, H = 1920, FPS = 24, FONT = 'NBL, NBC', INK = '#1b1422';
const TL = JSON.parse(fs.readFileSync('timeline.json', 'utf8')), L = TL.L, BY = Object.fromEntries(L.map(l => [l.id, l]));
const cv = createCanvas(W, H); T.init(cv); const g = T.g;
const ease = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const q12 = t => Math.floor(t * 12 + 1e-6) / 12;   // drawings on twos
const wordAt = (id, sub) => { const l = BY[id]; const w = (l.words || []).find(w => w[2].toLowerCase().replace(/[^a-zа-яё]/g, '').startsWith(sub)); if (!w) throw new Error(`word ${sub} not in ${id}`); return w[0]; };

// ---------- shots (hard cuts only) ----------
const tGov = wordAt('z1', 'говоришь'), tPet = wordAt('z2', 'петрович'), tTell = wordAt('k1', 'tell'), tExp = wordAt('z1', 'экспириенсд');
const SH = [
  { k: 'wide', a: 0, b: BY.k1.end + .1 },
  { k: 'zMCU', a: BY.k1.end + .1, b: tGov - .06, arm: 'hips' },
  { k: 'zMCU2', a: tGov - .06, b: BY.z1.end + .08, arm: 'point' },
  { k: 'kCU', a: BY.z1.end + .08, b: BY.z2.at - .05 },
  { k: 'zClutch', a: BY.z2.at - .05, b: tPet - .08 },
  { k: 'beat', a: tPet - .08, b: TL.END },
  { k: 'kReact', a: TL.END, b: TL.TOTAL + 1 },
];
for (const s of SH.slice(0, -1)) if (s.b - s.a < 1.2) throw new Error(`shot ${s.k} shorter than 1.2 s: ${(s.b - s.a).toFixed(2)}`);
const shotAt = t => SH.find(s => t >= s.a && t < s.b) || SH[SH.length - 1];
// camera {x, y, z}: world point at screen centre, zoom. Moves are slow; reframes are hard steps on a cut.
function cam(t, s) {
  const u = (t - s.a) / (s.b - s.a);
  let c;
  if (s.k === 'wide') c = { x: 540, y: 1245, z: lerp(1.3, 1.34, ease(u)) };
  else if (s.k === 'zMCU') c = { x: 750, y: 1110, z: lerp(1.7, 1.74, u) };
  else if (s.k === 'zMCU2') c = { x: 705, y: 1120, z: lerp(1.62, 1.68, u) };
  else if (s.k === 'kCU') c = { x: 310, y: 1170, z: 1.95 };
  else if (s.k === 'zClutch') c = { x: 705, y: 1110, z: lerp(1.66, 1.7, u) };
  else if (s.k === 'beat') { const v = ease((t - BY.z2.end) / (BY.p1.at - BY.z2.end + .2)); c = { x: lerp(540, 520, v), y: lerp(1245, 1190, v), z: lerp(1.3, 1.46, v) }; }   // very slow push in the cold silence
  else c = { x: 310, y: 1160, z: 2.05 };
  // short shake on "That's not a skill!" (camera on ones)
  const sk = t - TL.SHAKE; if (sk > 0 && sk < .38) { const a = 16 * (1 - sk / .38); c.x += (hash(Math.floor(t * 24) * 3.1) - .5) * 2 * a / c.z; c.y += (hash(Math.floor(t * 24) * 7.7) - .5) * 2 * a / c.z; }
  return c;
}

// ---------- acting ----------
function mouth(id, t) {   // sampled on twos, jaw smoothed (attack/release), closures kept
  const l = BY[id]; if (t < l.at || t > l.end + .05) return 0;
  const tq = q12(t), i = Math.floor((tq - l.at) * 24), e = l.env; const v = e[Math.min(e.length - 1, Math.max(0, i))] || 0, p = e[Math.max(0, i - 2)] || 0;
  return v === 0 ? 0 : v * .78 + p * .22;
}
const zLines = ['z1', 'z2'], kLines = ['k1', 'k2'];
const talkOf = (ids, t) => { for (const id of ids) { const m = mouth(id, t); if (m > 0) return m; } return 0; };
const blink = (t, seed) => { const tq = q12(t), per = 3.1 + seed; const ph = (tq + seed * 1.7) % per; return ph < .17; };
function zhannaE(t, s) {
  const tq = q12(t), o = talkOf(zLines, t), talking = t > BY.z1.at && t < BY.z1.end || t > BY.z2.at && t < BY.z2.end;
  let e = { lid: .5, look: [.45, .05], o: o * .85, w: 1 - o * .15, sm: talking ? .2 : .35, skew: .6, brow: .1, arm: 'hips', clutch: true };
  if (s.k === 'wide') e = { ...e, look: [.6, .1], lid: .55 };
  if (s.k === 'zMCU2') { e.arm = 'point'; e.brow = tq > tExp - .1 ? .6 : .3; e.lid = .45; }
  if (s.k === 'zClutch') { e.arm = 'clutch'; e.glow = 0; e.sm = .6; e.skew = .9; e.lid = .5; e.brow = -.1; }
  if (s.k === 'beat') { e.arm = 'hips'; e.look = [.75, -.25]; e.lid = .5; e.sm = tq > BY.p1.end ? .8 : .45; e.skew = 1; }
  if (s.k === 'kCU' || s.k === 'kReact') e.look = [.6, .1];
  if (blink(t, .4) && s.k !== 'beat') e.lid = .95;
  return e;
}
function kayleeE(t, s) {
  const tq = q12(t), o = talkOf(kLines, t), panic = t < BY.k1.end + .3 || (t > BY.k2.at - .1 && t < BY.k2.end + .4);
  let e = { lid: 0, look: [-.35, 0], o: o * .95 + (panic && o === 0 ? .12 : 0), w: .8 + o * .3, sm: -.35, brow: panic ? 1.1 : .5, jit: panic ? (hash(tq * 97) - .5) * 4 : 0, sweatOn: panic };
  if (s.k === 'kCU') { e.brow = 1.5; e.sm = -.7; e.look = [-.2, -.1]; }
  if (s.k === 'zMCU' || s.k === 'zMCU2' || s.k === 'zClutch') { e.o = 0; e.lid = .15; e.sm = -.2; e.brow = .4; e.jit = 0; }
  if (s.k === 'beat') { e = { ...e, o: 0, lid: .2, look: [-.65, -.15], sm: -.25, brow: .6, jit: 0, sweatOn: false }; }
  if (s.k === 'kReact') e = { lid: .55, look: [0, .05], o: 0, w: .7, sm: -.05, brow: -.1, jit: 0, sweatOn: false };
  if (blink(t, 1.3) && s.k !== 'kReact' && s.k !== 'beat') e.lid = .95;
  return e;
}
const kJit = (t, s) => { const e = (s.k === 'wide' && t < BY.k1.end) || s.k === 'kCU'; if (!e) return [0, 0]; const tq = q12(t); return [(hash(tq * 13.1) - .5) * 8, (hash(tq * 5.3) - .5) * 6]; };
const breathe = (t, ph) => 1 + .01 * Math.sin(q12(t) * 2.4 + ph);

// ---------- world (kitchen, Brighton Beach). Palette: mint wall, coral cabinets, cream floor, sea blue window ----------
const PAL = { wall: ['#9fdccd', '#93d3c3', '#87c9b8'], floor: '#f1dfb8', floorB: '#e3c999', cab: '#ef8a6a', cabS: '#d06c4e', top: '#fbe9d0', sea: ['#7cc6ee', '#5aaee0', '#3d8fd0'], sand: '#f6d58b', fridge: '#f4f1ea', fridgeS: '#d8d2c4' };
function room(t) {
  T.bands(PAL.wall, -200, 1250, -400, 1500);
  T.fillOnly(T.rect(-400, 1250, 1900, 1200), PAL.floor, { boil: 0 }); T.fillOnly(T.rect(-400, 1250, 1900, 60), PAL.floorB, { boil: 0 }); T.stroke([[-400, 1250], [1500, 1250]], 6);
  // window: Brighton sea in flat bands
  T.shape(T.rr(160, 300, 380, 320, 18), { fill: PAL.sea[0], shade: () => { T.bands(PAL.sea, 300, 520, 160, 540); T.fillOnly(T.rect(160, 520, 380, 100), PAL.sand, { boil: .4 }); } });
  T.stroke([[350, 300], [350, 620]], 6); T.stroke([[160, 460], [540, 460]], 6);
  // wall clock
  T.shape(T.ell(700, 330, 62, 62, 30), { fill: '#fffaf0' }); T.stroke([[700, 330], [700, 290]], 6); T.stroke([[700, 330], [728, 346]], 6);
  // counter (left)
  T.shape(T.rr(-120, 1010, 420, 260, 10), { fill: PAL.cab, shade: () => T.fillOnly(T.rect(200, 1000, 120, 280), PAL.cabS, { boil: .4 }) });
  T.shape(T.rr(-140, 980, 460, 40, 10), { fill: PAL.top }); T.stroke([[90, 1040], [90, 1250]], 5);
  T.shape(T.ell(40, 950, 50, 32, 20), { fill: '#e85c5c' }); T.stroke([[40, 918], [40, 896]], 6);   // kettle
  // fridge (right) — the hum
  T.shape(T.rr(880, 600, 280, 660, 26), { fill: PAL.fridge, shade: () => T.fillOnly(T.rect(1080, 590, 120, 680), PAL.fridgeS, { boil: .4 }) });
  T.stroke([[880, 840], [1160, 840]], 6); T.shape(T.rr(900, 700, 16, 90, 8), { fill: PAL.fridgeS }); T.shape(T.rr(900, 880, 16, 120, 8), { fill: PAL.fridgeS });
  T.shape(T.ell(1000, 720, 22, 22, 16), { fill: '#ffd23f' }); T.shape(T.ell(1040, 760, 18, 18, 16), { fill: '#ff3fa4' });   // magnets
}
function cast(t, s) {
  const tq = q12(t);
  // Petrovich: always from behind, in his armchair facing the back wall, behind his newspaper
  const ru = t > BY.p1.at - .45 && t < BY.p1.end + .3 ? Math.sin(tq * 40) : 0;
  C.petrovich(500, 1240, .5, { rustle: ru });
  // Kaylee (left, looks right) and Zhanna (right, looks left)
  const [jx, jy] = kJit(t, s);
  T.push(); T.translate(310 + jx, 1560 + jy); T.scale(1, breathe(t, 0)); C.kaylee(0, 0, 1.0, -1, kayleeE(t, s)); T.pop();
  T.push(); T.translate(765, 1560); T.scale(1, breathe(t, 1.7)); C.zhanna(0, 0, 1.0, -1, zhannaE(t, s)); T.pop();
}

// ---------- text helpers (every text fits its box) ----------
function fitFont(str, w, h, max, fam = FONT, min = 10) { let f = max; g.font = `${f}px ${fam}`; while ((g.measureText(str).width > w || f > h * .9) && f > min) { f -= 1; g.font = `${f}px ${fam}`; } return f; }
const AUDIT = [];
function fit(str, x, y, w, h, max, col, fam = FONT) { const f = fitFont(str, w, h, max, fam); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, x, y); AUDIT.push({ str, over: g.measureText(str).width > w + .5 }); return f; }
function rrS(x, y, w, h, r, fill, lw = 0, col = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = col; g.stroke(); } }

// ---------- captions (owner's style): whole phrase pops in opaque; English/Runglish yellow, Russian white, black outline ----------
const RUNG = new Set(['изи', 'ай', 'эм', 'вери', 'экспириенсд', 'шопинге']);
const CAPS = [
  { id: 'k1', s: 'Aunt Zhanna! Tomorrow I have a job interview.', tr: 'Тётя Жанна! Завтра у меня собеседование.', from: null },
  { id: 'k1', s: 'What if they ask: tell me about yourself?', tr: 'А если спросят: расскажите о себе?', from: 'what' },
  { id: 'z1', s: 'Деточка, это изи.', from: null },
  { id: 'z1', s: 'Говоришь: ай эм вери экспириенсд… в шопинге.', from: 'говоришь' },
  { id: 'k2', s: "That's not a skill!", tr: 'Это не навык!', from: null },
  { id: 'z2', s: 'Скажи это моей кредитке.', from: null },
  { id: 'z2', s: 'Петрович, скажи?', from: 'петрович' },
  { id: 'p1', s: 'Угу.', from: null },
];
CAPS.forEach(c => { c.a = c.from ? wordAt(c.id, c.from) - .04 : BY[c.id].at; });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx && nx.id === c.id ? nx.a : BY[c.id].end + .25; c.hold = Math.max(c.b, c.a + 1.2); if (nx) c.hold = Math.min(c.hold, nx.a); });
for (const c of CAPS) if (c.hold - c.a < 1.2 - 1e-6) throw new Error(`caption shorter than 1.2 s: ${c.s} ${(c.hold - c.a).toFixed(2)}`);
const isY = w => { const x = w.replace(/[«»"?!.,…—:]/g, '').toLowerCase(); return /[a-z]/.test(x) || RUNG.has(x); };
function outlined(words, y, size0, colFn) {
  let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 30) { size -= 2; g.font = `${size}px ${FONT}`; tw = tw0(); }
  AUDIT.push({ str: words.join(' '), over: tw > 1000 });
  let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const w of words) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); x += g.measureText(w).width + sp(); }
}
function caption(t) {
  let cur = null; for (const c of CAPS) if (t >= c.a && t < c.hold) cur = c; if (!cur) return;
  const pop = 1 + .08 * clamp(1 - (t - cur.a) / .12);
  g.save(); g.translate(540, 1660); g.scale(pop, pop); g.translate(-540, -1660);
  const words = cur.s.split(' ');
  if (g.measureText && cur.s.length > 30) { // two lines for long phrases
    const mid = Math.ceil(words.length / 2); outlined(words.slice(0, mid), 1630, 66, w => isY(w) ? '#ffd23f' : '#ffffff'); outlined(words.slice(mid), 1710, 66, w => isY(w) ? '#ffd23f' : '#ffffff');
  } else outlined(words, 1660, 70, w => isY(w) ? '#ffd23f' : '#ffffff');
  g.restore();
  if (cur.tr) outlined(cur.tr.split(' '), cur.s.length > 30 ? 1792 : 1750, 44, () => '#ffffff');
}
// vocabulary chips, each ≥ 1.3 s, tied to the spoken word
const CHIPS = [
  { a: tTell - .08, w: 'tell me about yourself', tr: 'расскажите о себе' },
  { a: tExp - .1, w: 'экспириенсд', tr: 'experienced — опытная' },
  { a: BY.k2.at - .02, w: 'skill', tr: 'навык' },
];
CHIPS.forEach((c, i) => { c.b = Math.max(c.a + 1.3, Math.min(c.a + 1.9, CHIPS[i + 1] ? CHIPS[i + 1].a - .05 : 99)); });
function chip(t) {
  let c = null; for (const q of CHIPS) if (t >= q.a && t < q.b) c = q; if (!c) return;
  const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = ' — ' + c.tr;
  let f = 44; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width; while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; }
  const tw = tot(), w = tw + 56; AUDIT.push({ str: w1 + w2, over: tw > 900 });
  g.save(); g.globalAlpha = k; g.translate(540, 1520 + (1 - k) * 16); g.rotate(-.015);
  rrS(-w / 2, -40, w, 74, 22, '#fffaf0', 5); g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -2); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -2); g.restore();
}
// hook plate (top, over the wall — never over faces), popped in on 12 fps steps
function hook(t) {
  if (t >= BY.k1.end + .1) return; const k = ease(q12(t) / .25), out = ease((t - (BY.k1.end - .2)) / .3);
  g.save(); g.globalAlpha = 1 - out; g.translate(540, 210); g.rotate(-.025); g.scale(.6 + .4 * k, .6 + .4 * k);
  rrS(-440, -120, 880, 240, 30, '#fffaf0', 8);
  fit('СОБЕСЕДОВАНИЕ НА АНГЛИЙСКОМ', 0, -48, 820, 84, 58, INK);
  fit('СОВЕТ ТЁТИ ЖАННЫ', 0, 48, 820, 84, 66, '#d63a8a');
  g.restore();
}
// newspaper text audit: Petrovich's paper lines are drawn inside chars.mjs at fixed small sizes (checked in textaudit)

function frame(t, { caps = true } = {}) {
  T.frame(t); const s = shotAt(t), c = cam(t, s);
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAL.wall[0]; g.fillRect(0, 0, W, H);
  T.translate(540, 960); T.scale(c.z); T.translate(-c.x, -c.y);
  room(t); cast(t, s);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  if (caps) { hook(t); chip(t); caption(t); }
}

// ---------- commands ----------
const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'still') {
  fs.mkdirSync('out', { recursive: true });
  for (const x of args[0].split(',')) { frame(+x); fs.writeFileSync(`out/still_${x}.png`, cv.toBuffer('image/png')); console.log('out/still_' + x + '.png', shotAt(+x).k); }
} else if (cmd === 'clip') {
  const a = +args[0], b = Math.min(+args[1], TL.TOTAL), out = args[2], n0 = Math.round(a * FPS), n1 = Math.round(b * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let n = n0; n < n1; n++) { frame(n / FPS); const buf = cv.data(); if (!ff.stdin.write(Buffer.from(buf))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('clip', out, n1 - n0, 'frames');
} else if (cmd === 'srt') {
  const ts = x => { const ms = Math.round(x * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  const out = CAPS.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.hold)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n`).join('\n');
  fs.mkdirSync('final', { recursive: true }); fs.writeFileSync('final/zhanna_scifi.srt', out); console.log('final/zhanna_scifi.srt');
} else if (cmd === 'cover') {
  const t = (BY.z2.at + tPet) / 2; frame(t, { caps: false });
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.save(); g.translate(540, 250); g.rotate(-.03); rrS(-460, -150, 920, 300, 34, '#fffaf0', 9);
  fit('TELL ME ABOUT YOURSELF?', 0, -60, 860, 100, 76, '#1f3a8a'); fit('ОТВЕТ ТЁТИ ЖАННЫ', 0, 58, 860, 100, 84, '#d63a8a'); g.restore();
  g.save(); g.translate(540, 1700); g.rotate(.02); rrS(-400, -70, 800, 140, 28, '#ffd23f', 8); fit('АЙ ЭМ ВЕРИ ЭКСПИРИЕНСД', 0, 0, 760, 110, 64, INK); g.restore();
  fs.mkdirSync('final', { recursive: true }); fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); console.log('final/cover.png');
} else if (cmd === 'textaudit') {
  for (let t = 0; t < TL.TOTAL; t += .125) frame(t);
  const bad = AUDIT.filter(a => a.over); console.log('texts checked', AUDIT.length, 'overflowing', bad.length, bad.slice(0, 5));
} else if (cmd === 'info') { console.log(SH.map(s => `${s.k} ${s.a.toFixed(2)}-${s.b.toFixed(2)}`).join('\n')); console.log(CAPS.map(c => `${c.a.toFixed(2)}-${c.hold.toFixed(2)} ${c.s}`).join('\n')); console.log(CHIPS.map(c => `${c.a.toFixed(2)}-${c.b.toFixed(2)} ${c.w}`).join('\n')); }
