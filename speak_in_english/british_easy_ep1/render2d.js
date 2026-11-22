// «British is easy» — flat 2D cartoon version (same look as «Читаем по цепочке» 2D), lively characters.
// node render2d.js still 1,20,51   |   node render2d.js clip 0:20 out/p0.mp4
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon'), C0 = require('./cast_toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', HW = 'HWL, HWC';
const TL = require('./timeline.json'), BEATS = require('./beats.json');
const cv = createCanvas(W, H), g = cv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// ---------- drawing helpers ----------
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function txt(s, x, y, size, col, font = FONT, align = 'center') { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }

// ---------- the pub (flat) ----------
const FLOOR = 1330, FEET = 1660;
function pub(t) {
  g.fillStyle = '#b8473c'; g.fillRect(-1200, -1200, 3480, FLOOR + 1200); g.fillStyle = '#a83e34'; for (let x = -1200; x < 2280; x += 90) g.fillRect(x, -1200, 40, FLOOR + 1200);
  // bunting
  for (let i = -6; i < 20; i++) { const x = i * 80, y = 150 + Math.sin(((i + 6) % 13) / 12 * Math.PI) * 40; poly([[x, y], [x + 70, y + 4], [x + 35, y + 80 + Math.sin(t * 2 + i) * 4]], ['#c0283a', '#ffffff', '#1f3a8a'][(i + 6) % 3], 5); }
  ln([[-500, 150], [1600, 150]], 5);
  // sign
  rr(170, 230, 740, 150, 18, '#2a1a10', 8); txt('THE POLITE FOX', 540, 308, 92, '#f0c060', HW);
  // shelves with bottles
  for (const y of [560, 760]) { for (let i = 0; i < 12; i++) { const x = 40 + i * 92 + (y === 760 ? 40 : 0), c = ['#2f8a5a', '#c0283a', '#e0a830', '#3a5aa8'][(i + (y > 600 ? 1 : 0)) % 4], h = 110 + (i % 3) * 20;
      rr(x, y - h, 46, h, 12, c, 6); rr(x + 12, y - h - 34, 22, 40, 6, c, 5); rr(x + 6, y - h + 30, 34, 36, 4, '#fff6d8', 4); }
    rr(-200, y, 1480, 26, 6, '#7a4a24', 7); }
  // lamps
  for (const x of [120, 960]) { ln([[x, -100], [x, 470]], 5); poly([[x - 60, 520], [x + 60, 520], [x + 30, 470], [x - 30, 470]], '#2f5a46', 6); ell(x, 530, 26, 14, '#ffe48a', 5);
    const gl = g.createRadialGradient(x, 560, 10, x, 560, 260); gl.addColorStop(0, 'rgba(255,220,140,0.28)'); gl.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gl; g.fillRect(x - 260, 300, 520, 520); }
  // chalk menu + dartboard
  rr(-170, 880, 260, 300, 12, '#2f3a34', 8); txt('TODAY', -40, 940, 46, '#f3f3e8', HW); txt('tea · pie', -40, 1010, 40, '#ffe066', HW); txt('fish & chips', -40, 1070, 38, '#f3f3e8', HW); txt('£ 4.50', -40, 1130, 44, '#bfe9ff', HW);
  ell(1090, 1000, 120, 120, '#2a2a2a', 7); ell(1090, 1000, 90, 90, '#c0283a', 5); ell(1090, 1000, 58, 58, '#f3e6c0', 5); ell(1090, 1000, 26, 26, '#2f8a5a', 5); ell(1090, 1000, 8, 8, '#c0283a', 4);
  // bar counter (back)
  rr(-300, 900, 1680, 40, 8, '#c98a4a', 7); rr(-280, 940, 1640, FLOOR - 940, 0, '#8a5a2e', 7); for (let x = -260; x < 1360; x += 160) rr(x, 980, 130, FLOOR - 1020, 10, '#7a4a24', 5);
  for (const x of [400, 470, 540]) { rr(x - 12, 830, 24, 70, 8, '#d8c060', 5); ell(x, 826, 18, 10, '#2a1a10', 4); }
  // floor
  g.fillStyle = '#d9a066'; g.fillRect(-1200, FLOOR, 3480, 2000); ln([[-1200, FLOOR], [2280, FLOOR]], 7);
  for (let i = -12; i < 26; i++) ln([[540 + (i - 7) * 110, FLOOR], [540 + (i - 7) * 260, H + 600]], 4, 'rgba(42,34,48,0.35)');
}
function table(x, y) { // small round pub table between them (in front)
  ell(x, y + 360, 120, 26, '#3a3036', 6); ln([[x, y + 20], [x, y + 350]], 22, INK); ln([[x, y + 20], [x, y + 350]], 12, '#4a4f5a');
  ell(x, y + 10, 200, 46, '#a86a34', 7); ell(x, y - 4, 200, 46, '#c98a4a', 7); }
function cup(x, y, s = 1, steam = 0, t = 0) { g.save(); g.translate(x, y); g.scale(s, s);
  if (steam) for (let k = 0; k < 2; k++) { const o = Math.sin(t * 3 + k * 2) * 8; ln([[-12 + k * 24, -60], [-12 + k * 24 + o, -90], [-12 + k * 24 - o, -120]], 5, 'rgba(255,255,255,0.7)'); }
  g.beginPath(); g.ellipse(30, -18, 16, 18, 0, -1.6, 1.6); g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.stroke();
  poly([[-32, -46], [32, -46], [26, 0], [-26, 0]], '#ffffff', 6); ln([[-30, -30], [30, -30]], 6, '#1f3a8a'); ell(0, -46, 32, 8, '#a8642a', 5); g.restore(); }

// ---------- characters ----------
const CAST = {A: {...C0.hero, x: 290, s: .7, look: .7, seed: 1}, B: {...C0.brit = {hair: 'short', pal: {skin: '#f6d6c4', skinS: '#e6b8a0', hair: '#c8a060', brow: '#8a6a3a', top: '#7a5a3a', topS: '#5a3e24', tie: '#2f4a7a', collar: '#ffffff', bottom: '#3a3a4a', legs: '#3a3a4a', shoe: '#2a1a14', sole: '#2a1a14'}}, x: 800, s: .76, look: -.7, seed: 5}};
const GEST = {
  down: s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]],
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  explain: s => [[s * 78, -860], [s * 150, -730], [s * 130, -810]],
  palmR: s => s > 0 ? [[78, -860], [160, -760], [240, -820]] : [[-78, -860], [-102, -720], [-110, -580]],
  palmL: s => s < 0 ? [[-78, -860], [-160, -760], [-240, -820]] : [[78, -860], [102, -720], [110, -580]],
  pointR: s => s > 0 ? [[78, -860], [200, -880], [330, -900]] : [[-78, -860], [-102, -720], [-110, -580]],
  pointL: s => s < 0 ? [[-78, -860], [-200, -880], [-330, -900]] : [[78, -860], [102, -720], [110, -580]],
  cheer: s => [[s * 78, -860], [s * 170, -980], [s * 200, -1120]],
  fists: s => [[s * 78, -860], [s * 130, -760], [s * 40, -800]],
  fistUp: s => s > 0 ? [[78, -860], [190, -930], [180, -1080]] : [[-78, -860], [-130, -760], [-40, -800]],
  headGrab: s => [[s * 78, -860], [s * 220, -980], [s * 150, -1150]],
  teaHold: s => s > 0 ? [[78, -860], [150, -740], [60, -730]] : [[-78, -860], [-102, -720], [-110, -580]],
  teaSip: s => s > 0 ? [[78, -860], [170, -820], [70, -960]] : [[-78, -860], [-102, -720], [-110, -580]],
  pray: s => [[s * 78, -860], [s * 120, -760], [s * 14, -820]],
};
const FRONT = new Set(['explain', 'fists', 'teaHold', 'teaSip', 'pray', 'fistUp']);
const lineAt = t => { let cur = null, idx = -1; TL.L.forEach((l, i) => { if (t >= l[0] - .05 && t < l[1] + .1) { cur = l; idx = i; } }); return [cur, idx]; };
const env = t => { const i = Math.floor(t * 30); return clamp(((TL.env[i] || 0) + (TL.env[i + 1] || 0)) / 2); };
const beatPh = t => { let i = 0; while (i + 1 < BEATS.length && BEATS[i + 1] <= t) i++; if (t < BEATS[0]) return 1; const a = BEATS[i], b = BEATS[i + 1] || a + .4; return clamp((t - a) / (b - a)); };
const blink = (t, s) => ((t + s * 1.3) % (3.1 + s * .5)) < .12;
// what each character does at time t: {g: gesture, mood, energy}
function act(who, t) {
  const [l, li] = lineAt(t), spk = l && l[2].includes(who), both = l && l[2] === 'AB', brk = t > 49.2 && t < 61.4;
  const slot = Math.floor(t / .62), pick = arr => arr[Math.floor(hash(slot * 7 + (who === 'A' ? 3 : 9) + li) * arr.length)];
  if (t >= 75.3) return {g: who === 'A' ? 'cheer' : 'shrug', mood: who === 'A' ? 'grin' : 'smug', e: 1.4};
  if (both) return {g: pick(['cheer', 'shrug', 'explain', who === 'A' ? 'pointR' : 'pointL']), mood: 'grin', e: 1.8};
  if (who === 'A') {
    if (t > 57.6 && t < 61.4) return {g: spk ? 'headGrab' : 'headGrab', mood: 'surprised', e: 1.1, sweat: true};
    if (brk) return {g: spk ? pick(['fists', 'pointR', 'fistUp', 'explain']) : 'fists', mood: 'angry', e: 1.3};
    if (t >= 74.2) return {g: 'pray', mood: 'surprised', e: .8};
    if (t >= 68) return {g: spk ? pick(['pray', 'palmR', 'explain']) : 'pray', mood: 'grin', e: 1};
    if (t < 3.3) return {g: spk ? pick(['shrug', 'explain', 'palmR']) : 'shrug', mood: 'sad', e: 1};
    if (spk) return {g: pick(['palmR', 'pointR', 'explain', 'shrug', 'hips']), mood: 'surprised', e: 1};
    return {g: hash(li) > .5 ? 'hips' : 'down', mood: li % 3 === 0 ? 'surprised' : 'flat', e: .7};
  }
  if (brk) return spk ? {g: pick(['shrug', 'palmL', 'teaHold']), mood: 'smug', e: .8} : {g: Math.floor(t * .7) % 2 ? 'teaSip' : 'teaHold', mood: 'happy', e: .6};
  if (t >= 68) return spk ? {g: 'palmL', mood: 'grin', e: .9} : {g: 'teaHold', mood: 'smug', e: .6};
  if (spk) return {g: pick(['palmL', 'explain', 'shrug', 'pointL', 'hips']), mood: 'smug', e: 1};
  return {g: (Math.floor(t / 2.3) % 3 === 2) ? 'teaSip' : 'teaHold', mood: 'smug', e: .6};
}
function arms(who, t) { // blended gesture with small wiggle
  const a1 = act(who, t), a0 = act(who, t - .16), k = 1;
  const f0 = GEST[a0.g], f1 = GEST[a1.g];
  let kk = 1; for (let d = .02; d <= .16; d += .02) if (act(who, t - d).g !== a1.g) { kk = d / .16; break; }
  const prevG = (() => { for (let d = .02; d <= .16; d += .02) { const a = act(who, t - d); if (a.g !== a1.g) return a.g; } return a1.g; })();
  const e = ease(kk), fp = GEST[prevG];
  const [l] = lineAt(t), spk = l && l[2].includes(who);
  return {fn: s => { const P0 = fp(s), P1 = f1(s); return P1.map((p, i) => { const w = i === 2 ? (spk ? 14 : 5) : i === 1 ? (spk ? 7 : 3) : 0;
      return [lerp(P0[i][0], p[0], e) + Math.sin(t * 5.3 + s + i) * w, lerp(P0[i][1], p[1], e) + Math.cos(t * 4.1 + s * 2 + i) * w]; }); },
    front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prevG)), act: a1, k: e };
}
function person(who, t) {
  const c = CAST[who], a = arms(who, t), ac = a.act, [l] = lineAt(t), spk = l && l[2].includes(who);
  const ph = beatPh(t), b = Math.exp(-ph * 5) * ac.e, hop = ac.e > 1.5 ? Math.abs(Math.sin(ph * Math.PI)) * 5 : 0;
  const m = spk ? env(t) : 0, tilt = (spk ? .07 * Math.sin(t * 3.1 + c.seed) : .035 * Math.sin(t * 1.3 + c.seed)) + .012 * b * (who === 'A' ? 1 : -1);
  const sway = Math.sin(t * 1.7 + c.seed) * 3 * (spk ? 1.3 : 1);
  T.draw(g, {...c, x: c.x + sway, y: FEET - b * 3 - hop, sq: 1 - .012 * b, arms: a.fn, front: a.front, mood: ac.mood, mouth: m, blink: blink(t, c.seed), tilt, look: c.look * (spk ? .6 : 1), sweat: ac.sweat});
  if (who === 'B' && (ac.g === 'teaHold' || ac.g === 'teaSip') && a.k > .9) { const H = a.fn(1)[2], s = c.s; cup(c.x + sway + H[0] * s, FEET - b * 3 - hop + H[1] * s * (1 - .012 * b) + 12, .9, ac.g === 'teaHold', t); }
}

// ---------- camera ----------
const CAM = {WIDE: [1, 545, 1050], HOOK: [1.07, 545, 1070], END: [1, 545, 1050], A_MED: [1.65, 330, 1060], B_MED: [1.6, 760, 1020], OTS_A: [1.12, 530, 990], OTS_B: [1.12, 560, 970], A_CU: [2.6, 300, 960], B_CU: [2.5, 790, 900]};
const SH = TL.SH.map(([at, k], i) => ({at, k, end: i + 1 < TL.SH.length ? TL.SH[i + 1][0] : TL.TOTAL, i}));
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const [z, x, y] = CAM[sh.k], u = (t - sh.at) / (sh.end - sh.at);
  const push = sh.i % 3 === 2 ? 0 : .05 * ease(u), punch = .05 * (1 - ease((t - sh.at) / .3)) * (sh.i ? 1 : 0);
  let kick = 0; const [l] = lineAt(t); if (l && l[2] === 'AB' && sh.k === 'HOOK') kick = .008 * Math.exp(-beatPh(t) * 6);
  return {z: z * (1 + push + punch + kick), x, y, sh}; }

// ---------- HUD ----------
function outlined(s, x, y, size, fill) { let f = size; g.font = `${f}px ${FONT}`; while (g.measureText(s).width > 980 && f > 34) { f -= 4; g.font = `${f}px ${FONT}`; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = f * .24; g.strokeStyle = '#000'; g.strokeText(s, x, y); g.fillStyle = fill; g.fillText(s, x, y); }
function captions(t) { const [l] = lineAt(t); if (!l) return; const en = !/[а-яё]/i.test(l[3]), pop = 1 + .1 * Math.max(0, 1 - (t - l[0]) / .12);
  g.save(); g.translate(540, 1580); g.scale(pop, pop); outlined(l[3], 0, 0, l[3].length > 26 ? 62 : 78, en ? '#ffd23f' : '#ffffff'); g.restore(); if (l[4]) outlined(l[4], 540, 1670, 46, '#bfe9ff'); }
function card(t) { const l = TL.L.find(q => q[5] && t >= q[0] - .05 && t < q[1] + .9); if (!l) return; const k = clamp((t - l[0] + .05) / .18), bo = 1 + Math.sin(k * Math.PI) * .08;
  g.save(); g.globalAlpha = k; g.translate(540, 250); g.scale(bo, bo); g.rotate((1 - k) * -.08);
  rr(-470, -120, 940, 240, 30, '#fffaf0', 8); g.textAlign = 'center'; g.textBaseline = 'middle';
  txt('ГОВОРЯТ', 0, -82, 30, '#888'); let f = 62; g.font = `${f}px ${FONT}`; while (g.measureText(l[5][0]).width > 880) { f -= 4; g.font = `${f}px ${FONT}`; } txt(l[5][0], 0, -30, f, '#1f3a8a');
  txt('ЗНАЧИТ', 0, 26, 30, '#888'); txt(l[5][1], 0, 76, 54, '#c0283a'); g.restore(); }
function endCard(t, a) { const k = clamp((t - a) / .35); g.fillStyle = `rgba(30,20,20,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - ease(k)) * 80);
  rr(50, 170, 980, 1560, 44, '#fffaf0', 8); txt('ГОВОРЯТ — ЗНАЧИТ', 540, 260, 58, '#c0283a');
  const rows = TL.L.filter(l => l[5]).filter((l, i, a) => a.findIndex(q => q[5][0] === l[5][0]) === i);
  rows.forEach(([, , , , , [en, ru]], i) => { const y = 350 + i * 100; let f = 40; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 900) { f -= 2; g.font = `${f}px ${FONT}`; } txt(en, 540, y, f, '#1f3a8a'); txt(ru, 540, y + 42, 32, '#c0283a'); });
  txt('Это «да» или «нет»? Переведи в комментах', 540, 1650, 42, INK); g.restore(); }

function frame(t) {
  const c = camAt(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a1a14'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y);
  pub(t); g.fillStyle = 'rgba(50,25,20,0.2)'; g.fillRect(-1200, -1200, 3480, FLOOR + 1200); person('A', t); person('B', t); table(545, 1390); cup(480, 1386, .9); cup(610, 1386, .9);
  g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,10,0)'); v.addColorStop(1, 'rgba(30,15,10,0.22)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (!process.env.NOCAP) { if (c.sh.k === 'END') endCard(t, c.sh.at); else { card(t); captions(t); } }
}
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st2', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st2/${t}.png`, cv.toBuffer('image/png')); } }
else { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(b * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); if (i % 300 === 0) console.log('frame', i); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
