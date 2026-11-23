// «Тётя Жанна с Брайтона» — «Жанна на свадьбе бывшего» (Petrovich's face is never shown) — flat 2D, engine from ep7. node render.js still 1,10 | clip 0:20 out/p0.mp4 | srt | cover | info | frame | facecheck   (NOCAP=1 hides captions)
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', HW = 'HWL, HWC';
const TL = require('./timeline.json'), L = TL.L, BY = Object.fromEntries(L.map(l => [l.id, l]));
const cv = createCanvas(W, H), G0 = cv.getContext('2d'); let g = G0;
const bgCv = createCanvas(W, H), GB = bgCv.getContext('2d'), clCv = createCanvas(W, H), GC = clCv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const P01 = (t, a, d) => clamp((t - a) / d), ex = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x), ei = x => x * x * x, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const spr = (x, d = 7, f = 9) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-d * x) * Math.cos(f * x);   // spring 0->1 with overshoot
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function txt(s, x, y, size, col, font = FONT, align = 'center') { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function star(x, y, r, fill, lw = 5, n = 8, rot = 0) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr2 = i % 2 ? r * .42 : r; p.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); } poly(p, fill, lw); }
function sparkle(x, y, r, a = 1) { g.save(); g.globalAlpha *= a; poly([[x, y - r], [x + r * .22, y - r * .22], [x + r, y], [x + r * .22, y + r * .22], [x, y + r], [x - r * .22, y + r * .22], [x - r, y], [x - r * .22, y - r * .22]], '#fff6c0', 3); g.restore(); }
// Zhanna: exactly as in ep2 (palette, hair, brooch, sparkles, pink nails)
const ZH = {hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', top: '#d63a8a', topS: '#b02a70', collar: '#d63a8a', bottom: '#2a2230', skirt: '#2a2230', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'}, x: 215, s: .76};
// Petrovich: ~60, grey flat cap, simple brown jacket, grey moustache, kind eyes
const PE = {hair: 'short', cap: true, moustache: true, pal: {skin: '#eec3a2', skinS: '#d9a583', hair: '#cfcfcf', brow: '#9a9a9a', stache: '#dcdcdc', cap: '#7a808c', capS: '#5e6470', top: '#8a6d52', topS: '#6e553f', collar: '#eef3f8', bottom: '#4a4a52', legs: '#4a4a52', shoe: '#2a2230', sole: '#2a2230'}, x: 760, s: .76};

// Gary (ex #2, ~55): orange tan, dyed dark hair, white suit, gold tie, red hibiscus boutonniere
const GA = {hair: 'short', pal: {skin: '#e8925a', skinS: '#cc7442', hair: '#2a1c16', brow: '#2a1c16', top: '#f6f4ee', topS: '#dcd8cc', collar: '#ffffff', tie: '#e0b040', bottom: '#f6f4ee', legs: '#f6f4ee', shoe: '#e8e0d0', sole: '#c8bca8'}, s: .74};
// Lucy (the bride, ~50): the same orange tan, burgundy hair, white dress, veil, giant ring
const LU = {hair: 'long', lashes: true, earrings: '#f2c820', skirt: true, pal: {skin: '#e8925a', skinS: '#cc7442', hair: '#6a2a3a', hairS: '#55202e', brow: '#55202e', lip: '#c8324a', top: '#ffffff', topS: '#e4e0ea', collar: '#ffffff', bottom: '#ffffff', skirt: '#ffffff', legs: '#e8925a', shoe: '#ffffff', sole: '#d8d0e0'}, s: .74};
// the officiant stays in the (blurred) background under the arch
const OF = {hair: 'short', glasses: true, pal: {skin: '#f0c9a8', skinS: '#ddae8c', hair: '#d8d8d8', brow: '#b0b0b0', top: '#2a2a33', topS: '#20202a', collar: '#ffffff', bottom: '#2a2a33', legs: '#2a2a33', shoe: '#1e1e24', sole: '#1e1e24'}, s: .5};
// young versions for Zhanna's 1999 memory
const GY = {...GA, pal: {...GA.pal, skin: '#f0c9a8', skinS: '#ddae8c', hair: '#6b4a2e', top: '#8a6d52', topS: '#6e553f', tie: '#c8323c', bottom: '#4a4a52', legs: '#4a4a52', shoe: '#2a2230'}};
const LY = {...LU, pal: {...LU.pal, skin: '#f4d0b4', skinS: '#e2b498', hair: '#3a2a20', top: '#d8323c', topS: '#b0262f', skirt: '#d8323c', legs: '#f4d0b4', shoe: '#d8323c'}};

const WHIP = TL.WHIP, PUNCH = TL.PUNCH, FREEZE = TL.FREEZE, BANQ = TL.BANQ, BANG = TL.BANG, SWAN = TL.SWAN, GATE = TL.GATE, SCENE = t => t < BANQ + .62 ? 'cer' : 'bq';
const FEET = 1760, SEAT = 1850, TABLE = 1352;
const X = {cer: {z: 170, p: -480, g: 780, l: 1400, o: 1090}, bq: {z: 70, g: 600, l: 1090, p: 1620}};

// ---------- sets (drawn into the background canvas, then blurred) ----------
function sky() { const gr = g.createLinearGradient(0, -400, 0, 1150); gr.addColorStop(0, '#1d1f4e'); gr.addColorStop(.55, '#6a3a7a'); gr.addColorStop(.85, '#e0707a'); gr.addColorStop(1, '#f6a86a'); g.fillStyle = gr; g.fillRect(-1400, -1400, 4600, 2600);
  ell(1500, 260, 60, 60, '#fff3d0', 0); for (let i = 0; i < 40; i++) ell(-1200 + hash(i) * 4200, -300 + hash(i + 50) * 700, 3, 3, 'rgba(255,255,255,.7)', 0);
  g.fillStyle = '#2c5a8a'; g.fillRect(-1400, 1000, 4600, 260); for (let k = 0; k < 9; k++) ln([[1430 - k * 6, 1020 + k * 24], [1570 + k * 6, 1020 + k * 24]], 6, 'rgba(255,240,200,.55)'); }
function palmTree(x, y, h, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-18, 0); g.quadraticCurveTo(30, -h * .5, 10, -h); g.lineTo(34, -h); g.quadraticCurveTo(56, -h * .5, 18, 0); g.closePath(); g.fillStyle = '#3a2a3a'; g.fill();
  for (let k = 0; k < 7; k++) { g.save(); g.translate(22, -h); g.rotate(-2.6 + k * .62); ell(0, -110, 34, 120, '#24323a', 0); g.restore(); } g.restore(); }
function lights(y0) { ln([[-1300, y0], [-500, y0 + 90], [300, y0], [1100, y0 + 90], [1900, y0], [2700, y0 + 90]], 4, '#3a2a3a');
  for (let i = 0; i < 52; i++) { const x = -1300 + i * 78, seg = Math.floor((x + 1300) / 800), u = ((x + 1300) % 800) / 800, y = y0 + (seg % 2 ? 90 - u * 90 : u * 90); ell(x, y + 14, 12, 15, '#ffd98a', 0); ell(x, y + 14, 22, 24, 'rgba(255,217,138,.25)', 0); } }
function guestRow(t, y, n, x0, dx, s, cheer) { for (let i = 0; i < n; i++) { const x = x0 + i * dx + (hash(i + 3) - .5) * 30, col = ['#d86a8a', '#6a9ad8', '#e8c060', '#7ac0a0', '#b07ad0', '#e08a5a'][i % 6], sk = ['#f0c9a8', '#c88a60', '#8a5a3a', '#f4d0b4'][i % 4];
  const bob = cheer ? Math.abs(Math.sin(t * 7 + i)) * 14 * s : Math.sin(t * 1.3 + i) * 2;
  if (cheer) { ln([[x - 50 * s, y - 70 * s - bob], [x - 70 * s, y - 190 * s - bob]], 16 * s, sk); ln([[x + 50 * s, y - 70 * s - bob], [x + 70 * s, y - 190 * s - bob]], 16 * s, sk); }
  g.beginPath(); g.ellipse(x, y - bob * .4, 80 * s, 90 * s, 0, Math.PI, 0); g.fillStyle = col; g.fill(); ell(x, y - 130 * s - bob, 48 * s, 54 * s, sk, 0); ell(x, y - 165 * s - bob, 50 * s, 28 * s, ['#3a2a20', '#d8b060', '#2a2230', '#8a4a2a'][i % 4], 0); } }
function arch(x) { g.save(); g.translate(x, 0); ln([[-330, 1500], [-330, 760]], 34, '#f6f0e6'); ln([[330, 1500], [330, 760]], 34, '#f6f0e6'); g.beginPath(); g.arc(0, 760, 330, Math.PI, 0); g.strokeStyle = '#f6f0e6'; g.lineWidth = 34; g.stroke();
  for (let i = 0; i < 26; i++) { const a = Math.PI + i / 25 * Math.PI, fx = Math.cos(a) * 330, fy = 760 + Math.sin(a) * 330; ell(fx, fy, 34, 30, i % 3 ? '#f6a0c0' : '#ffffff', 0); ell(fx, fy, 10, 10, '#f2c820', 0); }
  for (let i = 0; i < 8; i++) for (const s of [-1, 1]) { ell(s * 330, 820 + i * 80, 30, 26, i % 2 ? '#f6a0c0' : '#ffffff', 0); } g.restore(); }
function setCer(t) { sky(); palmTree(-700, 1060, 700); palmTree(1650, 1060, 760, 1.1); palmTree(2200, 1060, 600); lights(-60);
  g.fillStyle = '#4a7a4a'; g.fillRect(-1400, 1240, 4600, 2200); g.fillStyle = '#f6f0e6'; g.fillRect(-1400, 1240, 4600, 14); rr(380, 1250, 880, 900, 0, '#f8f2f4', 0); // aisle runner
  arch(X.cer.o); if (curCam && ['CW', 'GL'].includes(curCam.sh.k)) T.draw(g, {...OF, x: X.cer.o, y: 1440, mood: t > GATE + .1 ? 'shocked' : 'flat', ...(() => { const ts = talkSt(lineFor('o', t), t, 2); return {mouth: ts.mouth, talking: ts.talking, vis: ts.vis, nod: ts.nod, t}; })(), blink: blink(t, 3), pose: 'hold'});
  
  guestRow(t, 1500, 5, -1000, 230, .9, false); guestRow(t, 1500, 4, 1500, 230, .9, false); }
function setBq(t) { sky(); palmTree(-800, 1060, 700); palmTree(2050, 1060, 760, 1.1); lights(-40); lights(260);
  g.save(); g.shadowColor = 'rgba(255,120,200,.9)'; g.shadowBlur = 30; rr(420, 40, 1060, 190, 30, '#3a1a3a', 8); txt('GARY & LUCY', 950, 140, 96, '#ff9ad8', HW); g.restore();
  g.fillStyle = '#7a5a4a'; g.fillRect(-1400, 1240, 4600, 2200); for (let x = -1400; x < 3200; x += 140) ln([[x, 1240], [x - 60, 2400]], 5, '#6a4a3c');
  const cheer = (BY.c1 && t >= BY.c1.at - .1 && t < BY.c1.end + .3) || (t >= BY.c2.at - .1 && t < BY.c2.end + .6);
  for (const [x0, n] of [[-1100, 5], [1650, 6]]) { guestRow(t, 1330, n, x0, 220, .95, cheer); }
  guestRow(t, 1180, 7, -900, 330, .7, cheer); }

// ---------- gestures ----------
const ZG = {
  table: s => [[s * 78, -860], [s * 150, -740], [s * 90, -680]],
  down: s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]],
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  explain: s => [[s * 78, -860], [s * 150, -740], [s * 140, -800]],
  shrug: s => [[s * 78, -860], [s * 160, -770], [s * 210, -850]],
  wag: s => s > 0 ? [[78, -860], [200, -900], [240, -1040]] : [[-78, -860], [-160, -740], [-86, -640]],
  brooch: s => s > 0 ? [[78, -860], [150, -740], [20, -790]] : [[-78, -860], [-160, -740], [-86, -640]],
  back: s => s < 0 ? [[-78, -860], [-180, -830], [-265, -880]] : [[78, -860], [160, -740], [86, -640]],
  cheer: s => [[s * 78, -860], [s * 170, -980], [s * 200, -1120]],
  // banquet: the right hand keeps the mic beside the face (never over it)
  mic: s => s > 0 ? [[78, -860], [190, -780], [215, -890]] : [[-78, -860], [-150, -740], [-140, -800]],
  micUp: s => s > 0 ? [[78, -860], [190, -780], [215, -890]] : [[-78, -860], [-190, -930], [-240, -1060]],
  micPalm: s => s > 0 ? [[78, -860], [190, -780], [215, -890]] : [[-78, -860], [-160, -760], [-240, -820]],
  micHip: s => s > 0 ? [[78, -860], [190, -780], [215, -890]] : [[-78, -860], [-160, -740], [-86, -640]],
};
const GG = {
  down: s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]],
  collar: s => s < 0 ? [[-78, -860], [-160, -760], [-95, -845]] : [[78, -860], [102, -720], [110, -580]],
  bout: s => s < 0 ? [[-78, -860], [-140, -740], [-40, -800]] : [[78, -860], [102, -720], [110, -580]],
  rest: s => [[s * 78, -860], [s * 140, -740], [s * 80, -690]],
  fistUp: s => s > 0 ? [[78, -860], [190, -930], [170, -1060]] : [[-78, -860], [-140, -740], [-80, -690]],
  slam: s => s > 0 ? [[78, -860], [190, -780], [190, -680]] : [[-78, -860], [-140, -740], [-80, -690]],
  hands: s => [[s * 78, -860], [s * 150, -760], [s * 120, -800]],
  point: s => s < 0 ? [[-78, -860], [-180, -830], [-275, -870]] : [[78, -860], [102, -720], [110, -580]],
  hips: s => [[s * 78, -860], [s * 160, -740], [s * 86, -640]],
  shock: s => [[s * 78, -860], [s * 200, -930], [s * 250, -1060]],
};
const FRONT = new Set(['table', 'explain', 'brooch', 'rest', 'bout', 'hands', 'mic', 'micUp', 'micPalm', 'micHip']);
const lineAt = t => { for (const l of L) if (t >= l.at - .03 && t < l.end + .08) return l; return null; };
const env = (l, t) => { const i = Math.floor((t - l.at) * 30); return clamp(l.env[i] || 0); };   // mouthEnv from prep.py: 0 = closed, no smoothing
const lineFor = (who, t) => { for (const l of L) if (l.who === who && t >= l.at - .05 && t < l.end + .3) return l; return null; };
const talkSt = (l, t, seed) => { const r = T.talk(l, t, seed); return {mouth: r.mouth, round: r.round, vis: r.round, nod: r.nod, talking: !!l && t < l.end + .05}; };   // toon v3: stateless smoothed mouth (no seams between chunks)
const moodSt = (fn, t) => T.moodAt(u => fn(u).mood, t, .25);   // blended emotion change + blink at the switch
const lineOf = (who, t) => { const l = lineAt(t); return l && l.who === who ? l : null; };
function armOver(a, x, y, S, st) { for (const sd of [-1, 1]) { const P3 = a.fn(sd); if (P3[2][1] > -900) continue; g.save(); g.translate(x, y); g.scale(S, S); T.drawArm(g, st, sd, P3); g.restore(); } }   // whole raised arm in front of hair + face
const blink = (t, s) => ((t + s * 1.3) % (3.3 + s * .4)) < .12;
function plan(P, who, t, idle) { const l = lineAt(t); if (l && l.who === who) { const u = (t - l.at) / (l.end - l.at); let gg = idle; for (const [k, v] of (P[l.id] || [])) if (u >= k) gg = v; return gg; } return idle; }
const ZPLAN = {z1: [[0, 'cheer'], [.25, 'wag'], [.55, 'explain'], [.8, 'brooch']], z2: [[0, 'explain'], [.4, 'shrug'], [.72, 'back']], z3: [[0, 'wag'], [.6, 'shrug']], z4: [[0, 'hips']],
  z5: [[0, 'micUp']], z6: [[0, 'micPalm'], [.4, 'mic'], [.75, 'micPalm']], z7: [[0, 'mic'], [.5, 'micPalm']], z8: [[0, 'micPalm'], [.5, 'mic']], z9: [[0, 'micUp'], [.3, 'micPalm']]};
function zAct(t) { const bq = SCENE(t) === 'bq', l = lineAt(t); if (t >= TL.END) return {g: bq ? 'micHip' : 'hips', mood: 'laugh'};
  let idle = bq ? 'micHip' : 'hips'; if (!bq && t < GATE + .3) idle = 'down'; if (t >= BY.p1.at - .2 && t < BY.p1.end + .2) idle = 'back';
  let mood = plan(ZMOOD, 'z', t, 'smug');
  if (!(l && l.who === 'z')) { const id = l && l.id; if (t < GATE + .3) mood = 'smug'; else if (id === 'l1') mood = 'disgusted'; else if (id === 'g1') mood = 'smugside'; else if (id === 'g2' || id === 'l2') mood = 'smug';
    else if (id === 'c1') mood = 'proud'; else if (id === 'l3') mood = 'worried'; else if (id === 'g3' || (t >= BANG - .1 && t < BY.p3.at)) mood = 'shocked'; else if (t >= BY.p3.at && t < BY.c2.at) mood = 'dreamy'; else if (t >= BY.c2.at) mood = 'laugh'; }
  return {g: plan(ZPLAN, 'z', t, idle), mood}; }
// smug while trolling, grin on punchlines, shocked, indignant, dreamy (kind), triumphant, one wink and one eye-roll
const ZMOOD = {z1: [[0, 'proud'], [.3, 'flirty'], [.5, 'smugside']], z2: [[0, 'smug'], [.45, 'eyeroll'], [.78, 'proud']], z3: [[0, 'shocked'], [.16, 'angry'], [.78, 'laugh']], z4: [[0, 'eyeroll']], z5: [[0, 'proud']],
  z6: [[0, 'grin'], [.42, 'smugside'], [.8, 'disgusted']], z7: [[0, 'smug'], [.3, 'dreamy'], [.72, 'smugside']], z8: [[0, 'smug'], [.55, 'laugh']], z9: [[0, 'grin'], [.5, 'cryinglaugh']]};
function gAct(t) { const bq = SCENE(t) === 'bq', l = lineAt(t), id = l && l.id; let gg = bq ? 'rest' : 'down', mood = bq ? 'flat' : t < GATE ? 'happy' : 'shocked';
  if (id === 'z2' || id === 'p1') mood = 'worried'; if (id === 'g1') { gg = 'collar'; mood = 'worried'; } if (id === 'z3') mood = 'sad'; if (id === 'g2') { gg = 'bout'; mood = 'proud'; } if (id === 'l2' || id === 'z4') mood = 'flat';
  if (bq) { if (id === 'z5' || id === 'c1') mood = 'worried'; if (id === 'z6') mood = 'worried'; if (id === 'z7') mood = 'sad'; if (id === 'z8') mood = 'shocked'; if (id === 'z9') mood = 'disgusted'; if (id === 'l3') mood = 'worried';
    if (id === 'g3') { gg = t < BANG - .12 ? 'fistUp' : 'slam'; mood = 'angry'; } else if (t >= BANG - .12 && t < BANG + .5) { gg = 'slam'; mood = 'angry'; }
    if (t >= BY.p3.at && t < BY.c2.at) mood = 'shocked'; if (t >= BY.c2.at) mood = 'sad'; }
  return {g: gg, mood, sweat: id === 'g1' || id === 'z3' || (bq && (id === 'z8' || id === 'g3'))}; }
function lAct(t) { const bq = SCENE(t) === 'bq', l = lineAt(t), id = l && l.id; let gg = bq ? 'rest' : 'down', mood = bq ? 'flat' : t < GATE ? 'happy' : 'shocked';
  if (id === 'l1') { gg = 'point'; mood = 'angry'; } if (id === 'z2' || id === 'z3') mood = 'disgusted'; if (id === 'l2') { gg = 'hips'; mood = 'proud'; } if (!bq && id === 'z4') mood = 'angry';
  if (bq) { if (id === 'z5' || id === 'c1') mood = 'worried'; if (id === 'z6') mood = 'angry'; if (id === 'z7') mood = 'disgusted'; if (id === 'z8') mood = 'shocked'; if (id === 'z9') mood = 'disgusted';
    if (id === 'l3') { gg = 'shock'; mood = 'angry'; } if (id === 'g3') mood = 'angry'; if (t >= BY.p3.at && t < BY.c2.at) mood = 'surprised'; if (t >= BY.c2.at) mood = 'sad'; }
  return {g: gg, mood}; }
function blendArms(fnAt, GT, t) { const a1 = fnAt(t); let prev = a1.g, k = 1; for (let d = .02; d <= .2; d += .02) { const a = fnAt(t - d); if (a.g !== a1.g) { prev = a.g; k = d / .2; break; } }
  const e = ease(k), f0 = GT[prev], f1 = GT[a1.g]; return {fn: s => f1(s).map((p, i) => [lerp(f0(s)[i][0], p[0], e), lerp(f0(s)[i][1], p[1], e)]), front: FRONT.has(a1.g) || (e < .5 && FRONT.has(prev)), act: a1, e}; }
const wig = (fn, t, amp) => s => fn(s).map((p, i) => [p[0] + Math.sin(t * 4.3 + s + i) * amp * (i / 2), p[1] + Math.cos(t * 3.7 + i) * amp * (i / 2)]);
function hand(x, y, ang, S, skin, nail, glossy) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(S, S);
  for (const o of [-16, -5.5, 5.5, 16]) { const len = 44 - Math.abs(o) * .5; rr(8, o - 6, len, 12, 6, skin, 5); if (nail) { ell(len + 1, o, 7, 5.5, nail, 3); if (glossy) ell(len - 1, o - 2, 2.5, 1.5, '#ffffff', 0); } }
  g.save(); g.translate(-4, -22); g.rotate(-.9); rr(0, -6, 30, 12, 6, skin, 5); if (nail) ell(29, 0, 6, 5, nail, 3); g.restore();
  ell(0, 0, 27, 25, skin, 5); g.restore(); }
function hands(x, y, S, a, c, nail, glossy, sides = [-1, 1]) { for (const s of sides) { const P3 = a.fn(s), E = P3[1], Hh = P3[2]; hand(x + Hh[0] * S, y + Hh[1] * S, Math.atan2(Hh[1] - E[1], Hh[0] - E[0]), S, c.pal.skin, nail, glossy); } }

const PX = 110, PY = 120, PW = 860, PH = 520;
function cloudShape(pass, fill) { const puffs = []; for (let x = 70; x <= PW - 70; x += 105) { puffs.push([x, 40, 68]); puffs.push([x, PH - 40, 68]); } for (let y = 110; y <= PH - 110; y += 100) { puffs.push([30, y, 62]); puffs.push([PW - 30, y, 62]); }
  for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y, r, 0, 7); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }
  g.beginPath(); g.roundRect(20, 30, PW - 40, PH - 60, 40); if (pass) { g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); } else { g.fillStyle = fill; g.fill(); } }

// ---------- characters ----------
const handPos = (x, y, S, fn, s) => { const P3 = fn(s); return [x + P3[2][0] * S, y + P3[2][1] * S, Math.atan2(P3[2][1] - P3[1][1], P3[2][0] - P3[1][0])]; };
function micTo(hx, hy, tx, ty, skin, nail) { const ang = Math.atan2(ty - hy, tx - hx), len = Math.max(60, Math.hypot(tx - hx, ty - hy)); g.save(); g.translate(hx, hy); g.rotate(ang);
  ell(-4, 0, 26, 22, skin, 5);                                                     // palm / back of the hand, behind the handle
  rr(-40, -11, len + 26, 22, 8, '#2a2a33', 4); ell(len + 4, 0, 22, 22, '#9aa0aa', 5); for (const o of [-9, 0, 9]) ln([[len - 6 + Math.abs(o) * .3, o], [len + 14 - Math.abs(o) * .3, o]], 2, '#5a606a');
  for (const o of [-20, -8, 4, 16]) { rr(o - 5, -4, 11, 22, 5, skin, 4); ell(o, 17, 4.5, 3.5, nail, 2); }   // four fingers curl over the front edge
  g.save(); g.translate(22, -10); g.rotate(-.35); rr(-4, -12, 22, 11, 5, skin, 4); ell(16, -7, 4, 3.5, nail, 2); g.restore();   // thumb on the far side
  g.restore(); }
const MIC_TALK = [[78, -860], [190, -770], [112, -838]], MIC_REST = [[78, -860], [170, -750], [150, -700]];
function talkK(t) { let k = 0; for (const l of L) if (l.who === 'z' && t > l.at - .3 && t < l.end + .3) k = Math.max(k, Math.min(ease((t - l.at + .3) / .25), ease((l.end + .3 - t) / .25))); return k; }
function zhanna(t) { const sc = SCENE(t), l = lineAt(t), spk = l && l.who === 'z', a = blendArms(zAct, ZG, t), c = ZH, x = X[sc].z + Math.sin(t * 1.4) * 3 * (spk ? 1.4 : 1), y = FEET;
  if (sc === 'cer' && t < GATE - .05) return;   // behind the closed gate
  const tilt = spk ? .04 * Math.sin(t * 2.6) : .03 * Math.sin(t * 1.1) + .02, br = 1 - .006 * (1 + Math.sin(t * 2.2)), S = c.s;
  if (sc === 'bq') { const k = talkK(t), base = a.fn; a.fn = sd => sd > 0 ? MIC_TALK.map((p, i) => [lerp(MIC_REST[i][0], p[0], k), lerp(MIC_REST[i][1], p[1], k)]) : base(sd); }
  const breath = 2 + 2 * Math.sin(t * 2.2), ts = talkSt(lineFor('z', t), t, 3), md = moodSt(zAct, t), st = {...c, outfit: 'gold'};
  T.draw(g, {...st, x, y, sq: br, arms: (a.fn = T.ik(wig(a.fn, t, spk ? 6 : 2), breath)), ik: false, front: a.front, mood: md.mood, moodFrom: md.moodFrom, moodK: md.moodK, mouth: ts.mouth, round: ts.round, talking: ts.talking, vis: ts.vis, nod: ts.nod, t,
    blink: blink(t, 2) || md.blink, tilt, look: sc === 'bq' ? .5 : .7});
  armOver(a, x, y, S, st);
  const bx = x - 40 * S, by = y - 720 * S * br; star(bx, by, 30, '#f2c820', 5, 8, t * .3); ell(bx, by, 9, 9, '#ff5a8a', 4);
  for (let i = 0; i < 7; i++) { const sx = x + (hash(i) - .5) * 140 * S, sy = y - (600 + hash(i + 9) * 240) * S; sparkle(sx, sy, 7 + 5 * hash(i + 3), Math.max(0, Math.sin(t * 4 + i * 1.7))); }
  if (sc === 'bq') { const [hx, hy] = handPos(x, y, S, a.fn, 1), k = talkK(t), mx = x + 98 * S, my = y - 878 * S; micTo(hx, hy, lerp(hx + 8, mx, k), lerp(hy - 110, my, k), c.pal.skin, '#d63a8a');
    hands(x, y, S, {fn: sd => sd < 0 ? a.fn(sd) : null}, c, '#d63a8a', true, [-1]); }
  else hands(x, y, S, a, c, '#d63a8a', true); }
function gate(t) { const k = ease((t - GATE) / .28), x0 = X.cer.z - 230, x1 = X.cer.z + 230, top = 860, bot = 1780;
  for (const [hx, dir] of [[x0, 1], [x1, -1]]) { const w = 230 * Math.max(.12, Math.cos(k * 1.35)), sk = k * 60;
    g.save(); g.beginPath(); g.moveTo(hx, top); g.lineTo(hx + dir * w, top - sk); g.lineTo(hx + dir * w, bot + sk); g.lineTo(hx, bot); g.closePath(); g.fillStyle = '#fbf8f2'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); g.clip();
    for (let i = -6; i < 12; i++) { ln([[hx - 300, top + i * 90], [hx + 300, top + i * 90 + 300]], 5, '#d8cfc0'); ln([[hx - 300, top + i * 90 + 300], [hx + 300, top + i * 90]], 5, '#d8cfc0'); } g.restore();
    }
  for (const hx of [x0, x1]) { rr(hx - 22, top - 40, 44, bot - top + 60, 8, '#efe6d6', 7); ell(hx, top - 52, 30, 22, '#efe6d6', 6); } }
function standK(id) { const l = BY[id]; return t => t < l.at - .25 || t > l.end + .7 ? 0 : t < l.at + .05 ? ease((t - l.at + .25) / .3) : t < l.end + .35 ? 1 : 1 - ease((t - l.end - .35) / .35); }
const lucyUp = standK('l3');
function veil(x, y, S, lift, t) { const hy = y - 1062 * S; g.save(); g.translate(x, hy - 150 * S); g.scale(1 + .05 * lift * Math.sin(t * 20), 1 - 1.7 * lift); g.globalAlpha = .62;
  g.beginPath(); g.moveTo(-120 * S, 0); g.quadraticCurveTo(-300 * S, 360 * S, -240 * S, 620 * S); g.quadraticCurveTo(0, 660 * S, 240 * S, 620 * S); g.quadraticCurveTo(300 * S, 360 * S, 120 * S, 0); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.globalAlpha = 1; g.strokeStyle = '#c8c0d8'; g.lineWidth = 5; g.stroke(); g.restore(); }
function tiara(x, y, S) { const ty = y - 1300 * S; poly([[x - 70 * S, ty + 20 * S], [x - 50 * S, ty - 30 * S], [x - 20 * S, ty + 5 * S], [x, ty - 48 * S], [x + 20 * S, ty + 5 * S], [x + 50 * S, ty - 30 * S], [x + 70 * S, ty + 20 * S]], '#f2d060', 4); ell(x, ty - 10 * S, 9 * S, 9 * S, '#8fd2ff', 3); }
function ring(hx, hy, t) { poly([[hx - 26, hy - 30], [hx, hy - 62], [hx + 26, hy - 30], [hx, hy - 8]], '#c8f0ff', 4); ln([[hx - 26, hy - 30], [hx + 26, hy - 30]], 3, '#7ab8d6'); sparkle(hx + 22, hy - 66, 12 + 5 * Math.sin(t * 6), 1); }
function bout(x, y, S) { for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; ell(x + Math.cos(a) * 16 * S / .74, y + Math.sin(a) * 16 * S / .74, 14, 12, '#e8324a', 3); } ell(x, y, 8, 8, '#f2c820', 3); }
function gary(t) { const sc = SCENE(t), l = lineAt(t), spk = l && l.who === 'g', a = blendArms(gAct, GG, t), c = GA, S = c.s, x = X[sc].g + Math.sin(t * 1.2 + 2) * 2, y = sc === 'bq' ? SEAT : FEET;
  const shake = t >= BANG - .05 && t < BANG + .25 ? 6 * Math.sin(t * 90) : 0;
  const ts = talkSt(lineFor('g', t), t, 5), md = moodSt(gAct, t);
  T.draw(g, {...c, x: x + shake, y, arms: (a.fn = T.ik(wig(a.fn, t, spk ? 6 : 1.5), 2 + 2 * Math.sin(t * 2.3))), ik: false, front: a.front, mood: md.mood, moodFrom: md.moodFrom, moodK: md.moodK, sweat: a.act.sweat, mouth: ts.mouth, round: ts.round, talking: ts.talking, vis: ts.vis, nod: ts.nod, t,
    blink: blink(t, 5) || md.blink, tilt: spk ? .04 * Math.sin(t * 3) : .02 * Math.sin(t), look: sc === 'bq' ? -.8 : -.9}); armOver(a, x + shake, y, S, c);
  bout(x + shake - 48 * S, y - 800 * S, S); hands(x + shake, y, S, a, c, null, false);
 }
function priceTag(t) { const sc = SCENE(t), S = GA.s, x = X.bq.g + Math.sin(t * 1.2 + 2) * 2, y = SEAT;
  if (sc === 'bq' && t >= TAG0 && t < BOX0 + 1.6) { const k = ease((t - TAG0) / .25) * (1 - ease((t - BOX0 - 1.3) / .3)), sw = Math.sin(t * 3) * .06; g.save(); g.translate(x + 40 * S, y - 840 * S); g.rotate(sw); ln([[0, 0], [60, 70]], 3, INK); g.translate(60, 70); g.scale(k, k); g.rotate(-.12);
    poly([[0, 0], [40, -40], [250, -40], [250, 80], [40, 80]], '#fff4c8', 5); ell(28, 20, 8, 8, '#ffffff', 3); txt('SECOND HAND', 145, 0, 30, INK); txt('−50%', 145, 46, 44, '#d8323c'); g.restore(); } }
function lucy(t) { const sc = SCENE(t), l = lineAt(t), spk = l && l.who === 'l', a = blendArms(lAct, GG, t), c = LU, S = c.s, x = X[sc].l + Math.sin(t * 1.3 + 4) * 2, up = sc === 'bq' ? lucyUp(t) : 0, y = sc === 'bq' ? lerp(SEAT, FEET + 20, up) : FEET;
  veil(x, y, S, up * .5 * (l && l.id === 'l3' ? 1 : 0), t);
  const ts = talkSt(lineFor('l', t), t, 9), md = moodSt(lAct, t);
  T.draw(g, {...c, x, y, arms: (a.fn = T.ik(wig(a.fn, t, spk ? 7 : 1.5), 2 + 2 * Math.sin(t * 2.5))), ik: false, front: a.front, mood: md.mood, moodFrom: md.moodFrom, moodK: md.moodK, mouth: ts.mouth, round: ts.round, talking: ts.talking, vis: ts.vis, nod: ts.nod, t,
    blink: blink(t, 9) || md.blink, tilt: spk ? .05 * Math.sin(t * 3.2) : .02 * Math.sin(t + 1), look: sc === 'bq' ? -.8 : -.9}); armOver(a, x, y, S, c);
  tiara(x, y, S); hands(x, y, S, a, c, '#e8324a', true); const [hx, hy] = handPos(x, y, S, a.fn, -1); ring(hx, hy, t); }
// ---- Petrovich: palm leaf (ceremony) -> cake -> champagne tower -> ice swan. Every cover is opaque and reaches above the cap brim.
const pUp = t => clamp((t - SWAN - .62) / .45), PSTAND = t => ease(pUp(t));
function palmPot(x, t) { const l = lineAt(t), nod = l && l.id === 'p1' ? .05 * Math.sin(Math.PI * clamp((t - l.at) / (l.end - l.at)) * 2) : .012 * Math.sin(t * 1.5);
  rr(x - 110, 1560, 220, 210, 20, '#c46a4a', 7); ln([[x - 110, 1600], [x + 110, 1600]], 6, '#a85a3e');
  g.beginPath(); g.moveTo(x - 20, 1560); g.quadraticCurveTo(x + 20, 1300, x - 5, 1150); g.lineTo(x + 25, 1150); g.quadraticCurveTo(x + 50, 1300, x + 20, 1560); g.closePath(); g.fillStyle = '#8a6a4a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  g.save(); g.translate(x + 10, 1150); g.rotate(nod); for (const [ang, len, w] of [[-2.4, 330, 120], [-.75, 330, 120], [-1.95, 300, 130], [-1.2, 300, 130], [-1.57, 280, 150]]) { g.save(); g.rotate(ang + Math.PI / 2);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-w, -len * .55, 0, -len); g.quadraticCurveTo(w, -len * .55, 0, 0); g.closePath(); g.fillStyle = '#3c9a5a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); ln([[0, -10], [0, -len + 20]], 4, '#2a7040');
    for (let k = 1; k < 6; k++) { ln([[0, -len * k / 6], [-w * .55, -len * k / 6 - 30]], 3, '#2a7040'); ln([[0, -len * k / 6], [w * .55, -len * k / 6 - 30]], 3, '#2a7040'); } g.restore(); }
  // the big fan leaf right over the face
  g.beginPath(); g.ellipse(-10, -95, 215, 150, 0, 0, 7); g.fillStyle = '#46aa64'; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); for (let k = 0; k < 9; k++) { const a = Math.PI * (1.05 + k / 8 * .9); ln([[-10, 20], [-10 + Math.cos(a) * 205, -95 + Math.sin(a) * 140]], 4, '#2a7040'); }
  g.restore(); }
const CAKE = [[1352, 1272, 230], [1272, 1192, 215], [1192, 1112, 200], [1112, 1032, 188], [1032, 945, 178]];
function cakeX(t) { return t < BANG + .05 ? 0 : ease((t - BANG - .05) / .55) * 1100; }
function cake(x, t) { const dx = cakeX(t), wob = t >= BANG - .05 && t < BANG + .6 ? .03 * Math.sin(t * 40) : 0; if (dx > 1000) return; g.save(); g.translate(x + dx, 1352); g.rotate(wob + dx / 4000); g.translate(-x - dx, -1352);
  CAKE.forEach(([b, tp, hw], i) => { rr(x + dx - hw, tp, hw * 2, b - tp, 10, i % 2 ? '#fff6f8' : '#ffffff', 6); for (let k = 0; k < 8; k++) ell(x + dx - hw + 14 + k * (hw * 2 - 28) / 7, tp + 4, 12, 9, '#f6a0c0', 3); ln([[x + dx - hw + 6, b - 14], [x + dx + hw - 6, b - 14]], 4, '#f2d6a8'); });
  ell(x + dx - 26, 915, 18, 22, '#ffffff', 4); rr(x + dx - 42, 925, 32, 22, 6, '#ffffff', 4); ell(x + dx + 26, 915, 16, 20, '#e8925a', 4); rr(x + dx + 10, 925, 32, 22, 6, '#2a2230', 4);   // topper: bride + groom
  g.restore(); }
const TOWER = [[1352, 1252, 215], [1252, 1150, 190], [1150, 1050, 180], [1050, 948, 175]];
function tower(x, t) { for (const [b, tp, hw] of TOWER) { rr(x - hw, tp + 6, hw * 2, b - tp - 6, 6, '#f2c860', 5); const n = Math.round(hw * 2 / 88);
    for (let k = 0; k < n; k++) { const cx = x - hw + (k + .5) * hw * 2 / n; g.beginPath(); g.moveTo(cx - 44, tp + 8); g.lineTo(cx + 44, tp + 8); g.quadraticCurveTo(cx + 40, tp + 52, cx, tp + 56); g.quadraticCurveTo(cx - 40, tp + 52, cx - 44, tp + 8); g.closePath(); g.fillStyle = '#ffe08a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); ln([[cx, tp + 56], [cx, b - 10]], 6, '#fff6d8'); ell(cx, b - 6, 22, 6, '#fff6d8', 3); }
    for (let k = 0; k < 6; k++) { const bx = x - hw + hash(k + b) * hw * 2, by2 = tp + 30 + ((t * 60 + hash(k) * 80) % (b - tp - 30)); ell(bx, b - (by2 - tp), 4, 4, '#ffffff', 0); } } }
function swanX(t) { return (1 - ease((t - SWAN) / .55)) * 760; }
function swan(x, t) { if (t < SWAN) return; const dx = swanX(t), c = x + dx;
  rr(c - 230, 1250, 460, 380, 14, '#b8bcc4', 7); rr(c - 230, 1250, 460, 40, 14, '#d8dce4', 6); for (const s of [-1, 1]) { ell(c + s * 170, 1660, 34, 34, '#2a2230', 6); ell(c + s * 170, 1660, 10, 10, '#9aa0aa', 0); }
  const ice = '#d6f2fc', edge = '#7fb8d6'; g.save(); g.lineJoin = 'round';
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(c, 1240); g.quadraticCurveTo(c + s * 300, 1220, c + s * 250, 840); g.quadraticCurveTo(c + s * 110, 815, c - s * 10, 822); g.closePath(); g.fillStyle = ice; g.fill(); g.strokeStyle = edge; g.lineWidth = 7; g.stroke(); for (let k = 1; k < 4; k++) ln([[c + s * 40, 1200 - k * 20], [c + s * (250 - k * 40), 860 + k * 60]], 4, '#aee0f2'); }
  ell(c, 1150, 200, 110, ice, 0); g.beginPath(); g.ellipse(c, 1150, 200, 110, 0, 0, 7); g.strokeStyle = edge; g.lineWidth = 7; g.stroke();
  g.beginPath(); g.moveTo(c - 40, 1070); g.bezierCurveTo(c - 110, 900, c + 60, 860, c + 10, 760); g.lineTo(c + 50, 770); g.bezierCurveTo(c + 110, 880, c - 50, 920, c + 30, 1070); g.closePath(); g.fillStyle = ice; g.fill(); g.strokeStyle = edge; g.lineWidth = 7; g.stroke();
  poly([[c + 50, 770], [c + 96, 790], [c + 48, 800]], '#f2c860', 4); ell(c + 26, 780, 5, 5, edge, 0);
  for (let i = 0; i < 4; i++) sparkle(c - 160 + i * 110, 900 + hash(i) * 200, 14, Math.max(0, Math.sin(t * 5 + i * 1.6))); g.restore(); }
function petrovich(t) { const sc = SCENE(t), l = lineAt(t), spk = l && l.who === 'p', c = PE, S = c.s;
  if (sc === 'cer') { const x = X.cer.p, y = FEET, fn = wig(s => [[s * 78, -860], [s * 102, -720], [s * 110, -580]], t, 1.2), a = {fn};
    const ts = talkSt(lineFor('p', t), t, 7); T.draw(g, {...c, x, y, arms: (a.fn = T.ik(fn, 2)), ik: false, front: false, probe: !!process.env.FACECHECK, mood: 'kind', mouth: ts.mouth, talking: ts.talking, vis: ts.vis, nod: ts.nod, t, blink: blink(t, 7), tilt: 0, look: .4});
    hands(x, y, S, a, c, null, false); palmPot(x, t); return; }
  const x = X.bq.p, up = PSTAND(t), y = lerp(SEAT, FEET, up), bob = l && (l.id === 'p2' || l.id === 'p4') ? 6 * Math.sin(Math.PI * clamp((t - l.at) / (l.end - l.at))) : 0;
  const ts = talkSt(lineFor('p', t), t, 7); T.draw(g, {...c, x, y: y + bob, arms: s => [[s * 78, -860], [s * 140, -740], [s * 80, -690]], front: false, probe: !!process.env.FACECHECK, mood: 'kind', mouth: ts.mouth, talking: ts.talking, vis: ts.vis, nod: ts.nod, t, blink: blink(t, 7), tilt: 0, look: -.5}); }
function propsBq(t) { const x = X.bq.p; tower(x, t); cake(x, t); }
// slippers gift: slides along the table at z9, the lid pops
const BOX0 = BY.z9.at + .9, TAG0 = BY.z8.at + 2.0;
function giftBox(t) { if (t < BOX0) return; const k = ease((t - BOX0) / .7), bx = lerp(380, 845, k), lid = ease((t - BOX0 - .9) / .3);
  if (lid > 0) { slipper(bx - 40, TABLE - 74 - 10 * lid, .75, -.5); slipper(bx + 40, TABLE - 74 - 10 * lid, .75, -.2); }
  rr(bx - 95, TABLE - 66, 190, 66, 6, '#fbe6ee', 6); ln([[bx, TABLE - 66], [bx, TABLE]], 10, '#d63a8a');
  g.save(); g.translate(bx + (lid > 0 ? 160 * lid : 0), TABLE - 66 - 120 * lid); g.rotate(.6 * lid); rr(-104, -26, 208, 30, 6, '#fbe6ee', 6); ln([[0, -26], [0, 4]], 10, '#d63a8a'); ell(-20, -36, 24, 14, '#d63a8a', 5); ell(20, -36, 24, 14, '#d63a8a', 5); g.restore(); }
function slipper(x, y, sc, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  rr(-70, -26, 140, 52, 26, '#f2e6d0', 5); g.save(); g.beginPath(); g.moveTo(-6, -30); g.lineTo(52, -30); g.quadraticCurveTo(82, 0, 52, 30); g.lineTo(-6, 30); g.quadraticCurveTo(-18, 0, -6, -30); g.closePath(); g.fillStyle = '#c8323c'; g.fill(); g.clip();
  for (let k = -2; k <= 4; k++) ln([[k * 16, -32], [k * 16, 32]], 4, '#2a6a3a'); for (let k = -2; k <= 2; k++) ln([[-10, k * 14], [80, k * 14]], 3, '#2a6a3a'); g.restore();
  g.beginPath(); g.moveTo(-6, -30); g.lineTo(52, -30); g.quadraticCurveTo(82, 0, 52, 30); g.lineTo(-6, 30); g.quadraticCurveTo(-18, 0, -6, -30); g.closePath(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); ell(-40, 0, 18, 12, '#e0d2b8', 3); g.restore(); }
function flower(x, y, r, col) { for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28 - 1.57; ell(x + Math.cos(a) * r * .62, y + Math.sin(a) * r * .62, r * .5, r * .5, col, 3); } ell(x, y, r * .32, r * .32, '#f2c820', 3); }
function headTable(t) { rr(360, TABLE, 1720, 34, 12, '#fffaf2', 7); rr(376, TABLE + 30, 1688, 700, 6, '#fffaf2', 7); for (let x = 400; x < 2060; x += 70) ln([[x, TABLE + 60], [x, TABLE + 640]], 3, '#efe4d4');
  for (let k = 0; k < 15; k++) { const fx = 400 + k * 112; flower(fx, TABLE + 56, 22, k % 2 ? '#f6a0c0' : '#ffffff'); if (k < 14) { ell(fx + 40, TABLE + 66, 16, 8, '#5aa06a', 3); ell(fx + 72, TABLE + 62, 16, 8, '#5aa06a', 3); } }
  for (const gx of [845, 1355]) { const fx = gx; ln([[fx, TABLE], [fx, TABLE - 50]], 6); g.beginPath(); g.moveTo(fx - 16, TABLE - 150); g.lineTo(fx + 16, TABLE - 150); g.lineTo(fx + 10, TABLE - 52); g.lineTo(fx - 10, TABLE - 52); g.closePath(); g.fillStyle = '#f6d36a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); } }

// ---------- clouds (Zhanna's thoughts) and cards ----------
const mini = (c, x, y, s, extra = {}) => T.draw(g, {...c, x, y, s, mood: 'happy', ...extra});
const CARD = {
  photo: u => { g.save(); g.translate(420, 250); g.rotate(-.04); rr(-300, -200, 600, 400, 8, '#fffdf4', 7); rr(-270, -175, 540, 300, 4, '#8a6aa0', 4); g.save(); g.beginPath(); g.rect(-270, -175, 540, 300); g.clip();
    const sw = Math.sin(u * 14) * 12; mini(GY, -30 + sw, 220, .25, {pose: 'cheer', mood: 'grin'}); mini(LY, 80 + sw, 220, .25, {pose: 'cheer', mood: 'grin'}); mini(ZH, -200, 220, .25, {pose: 'hips', mood: 'angry'});
    g.globalAlpha = .65; g.beginPath(); g.ellipse(-200, -60, 70, 120, 0, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.globalAlpha = 1; g.restore(); txt('1999', 0, 165, 46, INK, HW); g.restore();
    if (u > .4) txt('?!', 700, 260, 120, '#d63a8a', HW); },
  partners: u => { txt('27 YEARS — ONE DANCE', 420, 70, 42, INK); const sw = Math.sin(u * 20) * 10; mini(GY, 300 + sw, 470, .26, {pose: 'cheer', mood: 'grin'});
    const who = [ZH, LY, null][Math.min(2, Math.floor(u * 3.2))]; if (who) mini(who, 530 - sw, 470, .26, {pose: 'cheer', mood: 'grin'}); else { g.save(); g.globalAlpha = .9; ell(530, 300, 90, 100, '#c8c8d0', 7); txt('?', 530, 305, 130, '#ffffff', HW); g.restore(); }
  },
  toast: u => { txt("I'D LIKE TO", 430, 95, 74, '#1f3a8a'); txt('MAKE A TOAST', 430, 180, 74, '#1f3a8a'); ln([[120, 228], [740, 228]], 5, '#e8c27a');
    txt("I'D LIKE = хотела бы", 430, 300, 50, '#2f9a5a'); if (u > .35) { txt('I LIKE = люблю', 430, 375, 50, '#c0283a'); } },
  bride: u => { mini(LU, 95, 470, .32, {mood: 'smug'}); txt('THE BRIDE', 285, 210, 42, '#d63a8a'); txt('невеста', 285, 270, 40, INK);
    if (u > .3) { mini(GA, 480, 470, .32, {mood: 'flat'}); txt('THE GROOM', 665, 210, 42, '#1f3a8a'); txt('жених', 665, 270, 40, INK); } },
  nohard: u => { txt('NO HARD', 430, 100, 80, '#1f3a8a'); txt('FEELINGS', 430, 190, 80, '#1f3a8a'); txt('= без обид', 430, 280, 54, '#c0283a');
    if (u > .3) { slipper(350, 372, 1.0, -.15); slipper(510, 380, 1.0, .1); } },
};
let curCam = null;
function panel(id, u, t, a0, b0, thought) { const ui = P01(t, a0, .45), uo = P01(t, b0 - .3, .3), sp = spr(ui, 6, 10);
  const k = clamp(ui * 5) * (1 - ei(clamp((uo - .35) / .65))); if (k <= 0) return;
  const scl = (.62 + .38 * sp) * (uo < .35 ? 1 + .05 * Math.sin(Math.PI * uo / .35) : 1 - .4 * ei((uo - .35) / .65)), rot = (1 - sp) * -.08;
  const prev = g; g = GC; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (thought) { const c = curCam, hx = 540 + (X[SCENE(t)].z + 60 - c.x) * c.z, top = Math.max(PY + PH + 70, 960 + (700 - c.y) * c.z); ell(hx + 10, top - 22, 14, 14, '#fffaf0', 6); ell(hx + 34, (top + PY + PH) / 2 - 8, 22, 22, '#fffaf0', 6); }
  g.translate(PX, PY); if (thought) { cloudShape(1); cloudShape(0, '#fffaf0'); } else { rr(10, 10, PW - 20, PH - 20, 46, '#fffaf0', 10); }
  g.save(); g.beginPath(); g.roundRect(30, 40, PW - 60, PH - 80, 36); g.clip(); CARD[id](u); g.restore();
  g = prev; g.save(); g.globalAlpha = k; g.translate(540, PY + PH / 2); g.rotate(rot); g.scale(scl, scl); g.translate(-540, -(PY + PH / 2)); g.drawImage(clCv, 0, 0); g.restore(); }
const PANELS = TL.PANELS;   // from prep.py (the card SFX use the same times)
function panels(t) { for (const [id, a, b, th] of PANELS) if (t >= a && t < b) panel(id, (t - a) / (b - a), t, a, b, th); }
const PLATE = [WHIP[0] + .2, WHIP[1] + .2];   // fully covers the frame from PLATE[0]+.25 to PLATE[1]-.2 (the scene switches under it)
function banqCard(t) { const a = PLATE[0], b = PLATE[1]; if (t < a || t >= b) return; const k = 1, dx = (1 - ex(P01(t, a, .25))) * 1180 - ei(P01(t, b - .2, .2)) * 1180, moving = dx !== 0;
  g.save(); g.globalAlpha = k; g.translate(dx, 0); g.fillStyle = '#f2a0c0'; g.fillRect(-60, 0, W + 120, H); g.fillStyle = '#f6b4cc'; for (let x = -200; x < 1300; x += 120) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 60, 0); g.lineTo(x + 460, H); g.lineTo(x + 400, H); g.fill(); }
  txt('BANQUET', 540, 760, 150, '#ffffff'); txt('банкет', 540, 880, 70, INK); const cl = ease((t - a) / .5) * .35;
  for (const s of [-1, 1]) { g.save(); g.translate(540 + s * 90, 1420); g.rotate(-s * cl); g.scale(2.2, 2.2); g.beginPath(); g.moveTo(-18, -160); g.lineTo(18, -160); g.lineTo(12, -62); g.lineTo(-12, -62); g.closePath(); g.fillStyle = '#f6d36a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); ln([[0, -62], [0, 0]], 5); ell(0, 0, 20, 5, '#ffffff', 3); g.restore(); }
  if (moving) for (let i = 0; i < 14; i++) { const yy = 120 + i * 130 + hash(i) * 40; ln([[dx > 0 ? -40 : W + 40, yy], [dx > 0 ? -40 - 300 - hash(i + 3) * 300 : W + 340 + hash(i + 3) * 300, yy]], 10, 'rgba(255,255,255,.75)'); }
  if (t > a + .4) for (let i = 0; i < 5; i++) sparkle(540 + Math.cos(i * 1.3) * 90, 1060 + Math.sin(i * 1.3) * 60, 18, 1); g.restore(); }

// ---------- shots ----------
const CAM = {CW: [.95, 600, 1000], Z_MED: [1.6, 170, 960], Z_UP: [1.8, 170, 905], ZP: [1.1, -150, 990], G_MED: [1.5, 780, 960], L_MED: [1.5, 1400, 960], GL: [1.0, 1090, 990],
  BW: [.72, 560, 1000], BW2: [.72, 1120, 1000], BZ: [1.45, 70, 960], BG: [1.5, 600, 1000], BL: [1.45, 1090, 960], BGL: [1.1, 845, 1010], BP: [1.35, 1620, 1000], BPC: [1.6, 1620, 1010]};
const SH = [[0, 'CW'], [BY.z1.at + 2.0, 'Z_MED'], [BY.l1.at - .1, 'L_MED'], [BY.z2.at - .1, 'Z_MED'], [BY.z2.end - 1.7, 'ZP'], [BY.g1.at - .1, 'G_MED'], [BY.z3.at - .1, 'Z_MED'], [BY.g2.at - .1, 'GL'], [BY.z4.at - .1, 'Z_UP'],
  [BANQ + .62, 'BZ'], [BY.c1.at - .1, 'BW'], [BY.z6.at - .1, 'BZ'], [BY.z6.at + 3.6, 'BGL'], [BY.z7.at - .1, 'BZ'], [BY.p2.at - .15, 'BP'], [BY.z8.at - .1, 'BZ'], [TAG0 - .15, 'BGL'],
  [BY.z9.at - .1, 'BZ'], [BOX0 - .1, 'BGL'], [BY.l3.at - .1, 'BL'], [BY.g3.at - .1, 'BG'], [BANG - .02, 'BP'], [BY.p3.at - .1, 'BPC'], [BY.c2.at - .1, 'BW2'], [SWAN - .25, 'BP'], [TL.END, 'END']]
  .map(([at, k], i, a) => ({at, k, i, end: a[i + 1] ? a[i + 1][0] : TL.TOTAL}));
const SUBJ = {CW: 'ZGL', Z_MED: 'Z', Z_UP: 'Z', ZP: 'ZP', G_MED: 'G', L_MED: 'L', GL: 'GL', BW: 'ZGL', BW2: 'GLP', BZ: 'Z', BG: 'G', BL: 'L', BGL: 'GL', BP: 'P', BPC: 'P', END: 'ZGL'};
let SOLVED = null; try { SOLVED = JSON.parse(fs.readFileSync(__dirname + '/cams.json', 'utf8')); } catch (e) {}
function camAt(t) { let sh = SH[0]; for (const s of SH) if (t >= s.at) sh = s; const k = sh.k === 'END' ? 'BW' : sh.k; let [z, x, y] = CAM[k]; if (SOLVED && SOLVED[sh.i]) [z, x] = SOLVED[sh.i]; const u = clamp((t - sh.at) / (sh.end - sh.at));
  let push = sh.i % 3 === 2 ? 0 : .02 * ease(u), punch = sh.at > 0 && sh.k !== 'END' ? .015 * (1 - ease((t - sh.at) / .3)) : 0;
  if (sh.k === 'BPC') push = .12 * eio(u);                                           // T5 slow dramatic push on the reveal
  let sx = 0, sy = 0; for (const [t0, k] of PUNCH) { const v = t - t0; if (v >= 0 && v < .7) { const d = Math.exp(-7 * v); punch += .07 * k * d; sx += 9 * k * Math.exp(-8 * v) * Math.sin(v * 64 + t0); sy += 7 * k * Math.exp(-8 * v) * Math.cos(v * 57 + t0); } }   // T4
  let jump = 0; if (JUMPABLE.has(sh.k) && sh.end - sh.at > 4) { for (const c of FLAT) if (c.a > sh.at + 1.8 && c.a < sh.end - 1.2 && c.a <= t && c.who !== 'c') jump++; }   // T8 jump-cut punch-in on chunk changes
  const jz = jump % 2 ? 1.08 : 1, z1 = z * (1 + push + punch) * jz;
  let wx = 0; if (t >= WHIP[0] && t < WHIP[0] + .45) wx = ei(P01(t, WHIP[0], .45)) * 1500; if (t >= WHIP[1] && t < WHIP[1] + .45) wx = -(1 - ex(P01(t, WHIP[1], .45))) * 1500;   // T3 whip-pan
  return {z: z1, x: x + wx + sx / z1, y: y - (jz > 1 ? 34 : 0) + sy / z1, k, sh, whip: wx !== 0}; }
const JUMPABLE = new Set(['Z_MED', 'BZ', 'GL', 'BGL']);

// ---------- captions ----------
const GLOSS = {z1: [['спикаю', 'speak — говорю']], z2: [['инвайт', 'invite — приглашение'], ['сендила', 'send — отправила'], ['RSVP', 'ответ на приглашение'], ['плас-ваном', 'plus-one — гость «плюс один»']],
  z3: [['Оквард', 'awkward — неловко'], ['сиквел', 'sequel — продолжение']], z5: [['Ай лайк', "I'd like — хотела бы (I like — люблю)"]],
  z6: [['Конгрэтьюлейшнс', 'congratulations — поздравляю'], ['зе брайд', 'the bride — невеста'], ['зе грум', 'the groom — жених']],
  z7: [['мэн', 'man — мужчина'], ['дэнс', 'dance — танец'], ['ченджаются', 'change — меняются']], z8: [['ю ноу', 'you know — понимаешь']], z9: [['Ноу хард филингс', 'no hard feelings — без обид']]};
const SPL = {
  o1: [['…speak now, or—', '…говорите сейчас или…']],
  l1: [["Zhanna?! You weren't invited!", 'Жанна?! Тебя не приглашали!']],
  g1: [['Oh no… This is so awkward.', 'О нет… Как же неловко.']],
  g2: [["It's Gary now.", 'Теперь я Гари.']],
  l2: [["And I'm Lucy!", 'А я Люси!']],
  c1: [['Speech! Speech!', 'Речь! Речь!']], c2: [['Speech! Speech!', 'Речь! Речь!']],
  l3: [['No hard feelings?!', 'Без обид?!'], ['You brought his slippers to my wedding!', 'Ты привезла его тапки на мою свадьбу!']],
  g3: [['Who even brought you?!', 'Да кто тебя вообще привёл?!']],
  z3: [['Оквард, Гена, это когда ты'], ['на нашей свадьбе танцевал'], ['с моей подружкой. А это сиквел.']],
  z6: [['Конгрэтьюлейшнс зе брайд энд зе грум!'], ['Люсенька, ты всегда умела брать…'], ['от жизни всё.'], ['Особенно моё.']],
  z7: [['А Гена у нас мэн стабильный.'], ['Двадцать семь лет один и тот же дэнс,'], ['только партнёрши ченджаются.']],
  z8: [['Бери, Люда, не стесняйся.'], ['Б/у, но в отличном состоянии —'], ['пробег всего семь лет, ю ноу?']],
  z9: [['Ноу хард филингс!'], ['Генины тапочки.'], ['Он их забыл, когда убегал.']],
  p3: [['Her plus-one.', 'Её «плюс один».'], ['Congratulations, old chap.', 'Поздравляю, старина.'], ['Honestly… I got the better deal.', 'Честно… мне повезло больше.']],
};
function chunks(l) { if (SPL[l.id]) { const P = SPL[l.id], n = P.reduce((a, c) => a + c[0].length, 0); let acc = 0; return P.map(([s, tr]) => { const a = l.at + (l.end - l.at) * acc / n; acc += s.length; return {s, tr, a, b: l.at + (l.end - l.at) * acc / n, who: l.who, id: l.id}; }); }
  const parts = [].concat(...l.text.match(/[^.!?…]+[.!?…]*/g).map(x => x.trim()).filter(Boolean).map(p => p.length > 34 && p.includes(',') ? p.split(/(?<=,)\s+/) : [p])); const out = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).trim().length > 34 && cur) { out.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); } if (cur) out.push(cur);
  for (let i = 0; i < out.length; i++) { const n0 = out.reduce((a, c) => a + c.length, 0); if (out.length > 1 && out[i].length / n0 * (l.end - l.at) < 1.2) { const j = i < out.length - 1 ? i : i - 1; out.splice(j, 2, out[j] + ' ' + out[j + 1]); i = -1; } }
  const n = out.reduce((a, c) => a + c.length, 0); let acc = 0; return out.map(c => { const a = l.at + (l.end - l.at) * acc / n; acc += c.length; return {s: c, a, b: l.at + (l.end - l.at) * acc / n, who: l.who, id: l.id}; }); }
function wordTimes(l, ch) { const nc = ch.reduce((a, c) => a + c.s.split(' ').length, 0), W2 = l.words || [], nw = W2.length;
  const at = i => nw === 0 ? l.at + (l.end - l.at) * i / nc : nw === nc ? W2[i] : W2[Math.min(nw - 1, Math.round(i * (nw - 1) / Math.max(1, nc - 1)))];
  let i = 0; ch.forEach((c, j) => { const n = c.s.split(' ').length; c.wt = []; for (let k = 0; k < n; k++) c.wt.push(Math.max(l.at, at(i + k))); c.a = j === 0 ? l.at : c.wt[0] - .04; i += n; });
  ch.forEach((c, j) => { c.b = j < ch.length - 1 ? ch[j + 1].a : l.end; }); return ch; }
const CH = L.map(l => ({l, ch: wordTimes(l, chunks(l))})), FLAT = [].concat(...CH.map(x => x.ch));
FLAT.forEach((c, i) => { const nx = FLAT[i + 1], lim = nx ? nx.a - .05 : c.b + 1.2; c.hold = Math.max(c.b, Math.min(c.a + 1.2, lim)); if (!nx || nx.id !== c.id) c.hold = Math.max(c.hold, Math.min(c.b + .25, lim)); });
// chips: per caption chunk; a chunk with two glossary words splits its time (each >= 1.2 s, else only the first)
const CHIPS = []; { let prevEnd = -1; for (const l of L) { if (l.who !== 'z') continue; const low = l.text.toLowerCase(), D = l.end - l.at;
    const cw = [].concat(...(CH.find(x => x.l === l).ch.map(c => c.s.split(' ').map((w, k) => [w.toLowerCase(), c.wt[k]])))), wtOf = w => { const f = cw.find(([x]) => x.replace(/[«»"?!.,…—:]/g, '') === w.toLowerCase().split(' ')[0]); return f ? f[1] : null; };
    const hits = (GLOSS[l.id] || []).map(([w, tr]) => ({w, tr, est: wtOf(w) ?? l.at + D * Math.max(0, low.indexOf(w.toLowerCase())) / low.length})).sort((p, q) => p.est - q.est);
    hits.forEach((h, i) => { const a = Math.max(h.est - .1, prevEnd + .03), nx = hits[i + 1] ? hits[i + 1].est - .1 : l.end + .4, b = Math.max(a + 1.3, Math.min(a + 2.6, nx)); CHIPS.push({a, b, w: h.w, tr: h.tr}); prevEnd = b; }); } }

const EN = /^(спикаю|инвайт|сендила|плас-ваном|оквард|сиквел|ай|лайк|ту|мейк|конгрэтьюлейшнс|зе|брайд|энд|грум|мэн|дэнс|ченджаются|ю|ноу|хард|филингс)$/i;
const isEn = w => { const x = w.replace(/[«»"?!.,…—:]/g, ''); return /[a-z]/i.test(x) || EN.test(x); };
function curChunk(t) { let cur = null; for (const c of FLAT) if (t >= c.a - .02 && t < c.hold) cur = c; return cur; }
function outlinedWords(words, y, size0, colFn, fx) { let size = size0; g.font = `${size}px ${FONT}`; const sp = () => g.measureText(' ').width; const tw0 = () => words.reduce((a, w) => a + g.measureText(w).width, 0) + sp() * (words.length - 1);
  let tw = tw0(); while (tw > 980 && size > 34) { size -= 4; g.font = `${size}px ${FONT}`; tw = tw0(); } let x = 540 - tw / 2; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  words.forEach((w, i) => { const ww = g.measureText(w).width, f = fx ? fx(i) : {al: 1, s: 1}; g.save(); g.globalAlpha *= f.al; g.translate(x + ww / 2, y); g.scale(f.s, f.s); g.translate(-(x + ww / 2), -y);
    g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(w, x, y); g.fillStyle = colFn(w); g.fillText(w, x, y); g.restore(); x += ww + sp(); }); }
function caption(t) { const cur = curChunk(t); if (!cur) return;
  outlinedWords(cur.s.split(' '), 1640, 70, w => isEn(w) ? '#ffd23f' : '#ffffff', (i) => { const wt = cur.wt ? cur.wt[i] : cur.a; return t < wt - .03 ? {al: .38, s: 1} : {al: 1, s: 1 + .22 * (1 - spr(P01(t, wt - .03, .32), 6, 11))}; });
  if (cur.tr) outlinedWords(cur.tr.split(' '), 1730, 46, () => '#ffffff'); }
function flag(x, y, w, h) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = '#1f3a8a'; g.fillRect(x, y, w, h);
  ln([[x, y], [x + w, y + h]], 10, '#ffffff'); ln([[x + w, y], [x, y + h]], 10, '#ffffff'); ln([[x, y], [x + w, y + h]], 4, '#d8323c'); ln([[x + w, y], [x, y + h]], 4, '#d8323c');
  ln([[x + w / 2, y], [x + w / 2, y + h]], 14, '#ffffff'); ln([[x, y + h / 2], [x + w, y + h / 2]], 14, '#ffffff'); ln([[x + w / 2, y], [x + w / 2, y + h]], 8, '#d8323c'); ln([[x, y + h / 2], [x + w, y + h / 2]], 8, '#d8323c'); g.restore(); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x, y, w, h); }
function britChip(t) { const a = BY.p3.at, b = BY.p3.at + 3.0; if (t < a || t >= b) return; const k = ease((t - a) / .15) * (1 - ease((t - b + .15) / .15));
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); g.font = `42px ${FONT}`; const tw = g.measureText('British accent').width, w = tw + 130;
  rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5); flag(-w / 2 + 22, -24, 60, 40); txt('British accent', -w / 2 + 100, -3, 42, '#1f3a8a', FONT, 'left'); g.restore(); }
function chip(t) { let c = null; for (const q of CHIPS) if (t >= q.a && t < q.b) c = q; if (!c) return;
  const k = ease((t - c.a) / .15) * (1 - ease((t - c.b + .12) / .12)), w1 = c.w, w2 = ' — ' + c.tr; let f = 42; g.font = `${f}px ${FONT}`; const tot = () => g.measureText(w1).width + g.measureText(w2).width;
  while (tot() > 900) { f -= 2; g.font = `${f}px ${FONT}`; } const tw = tot(), w = tw + 56;
  g.save(); g.globalAlpha = k; g.translate(540, 1536 + (1 - k) * 16); g.rotate(-.015); rr(-w / 2 + 6, -34, w, 72, 20, 'rgba(42,34,48,0.35)', 0); rr(-w / 2, -40, w, 72, 20, '#fffaf0', 5);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#d63a8a'; g.fillText(w1, -tw / 2, -3); g.fillStyle = INK; g.fillText(w2, -tw / 2 + g.measureText(w1).width, -3); g.restore(); }
const HOOK_END = 4.3;
function hook(t) { if (t > HOOK_END + .3) return; const a = clamp(t / .06) * (1 - ease((t - HOOK_END) / .3)), st = 1 + .6 * (1 - ex(P01(t, 0, .3))); g.save(); g.globalAlpha = a; g.translate(540, 330); g.rotate(-.02 - .06 * (1 - ex(P01(t, 0, .3)))); g.scale(st, st);
  rr(-450, -165, 900, 330, 34, '#fffaf0', 9); txt('БЫВШИЙ ЖЕНИТСЯ', 0, -92, 80, INK); txt('НА ЕЁ ПОДРУГЕ.', 0, 2, 80, INK); txt('ЖАННА ПРИШЛА', 0, 98, 88, '#d63a8a'); g.restore(); }
function endCard(t) { const k = ease((t - TL.END) / .35); g.fillStyle = `rgba(30,20,30,${.55 * k})`; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80);
  rr(60, 170, 960, 1540, 44, '#fffaf0', 8); txt('ПЕРЕВОДИМ ЖАННУ', 540, 270, 66, '#d63a8a');
  const R = [["I'D LIKE TO MAKE A TOAST", 'я хочу сказать тост'], ['CONGRATULATIONS TO THE BRIDE AND GROOM', 'поздравляю жениха и невесту'], ['I GOT THE BETTER DEAL', 'мне повезло больше'],
    ['RSVP', 'ответ на приглашение'], ['PLUS-ONE', 'гость «плюс один»'], ['THIS IS SO AWKWARD', 'как же неловко'], ['NO HARD FEELINGS', 'без обид']];
  R.forEach(([en, ru], i) => { const y = 380 + i * 122; let f = 52; g.font = `${f}px ${FONT}`; while (g.measureText(en).width > 880) { f -= 2; g.font = `${f}px ${FONT}`; } txt(en, 540, y, f, '#1f3a8a'); txt(ru, 540, y + 48, 38, '#c0283a'); });
  txt('Кто победил на этой свадьбе?', 540, 1290, 50, '#d63a8a'); txt('1 — Жанна    2 — Петрович', 540, 1375, 46, INK); txt('3 — Генины тапочки', 540, 1440, 46, INK);
  txt('А вы бы пошли', 540, 1540, 50, '#d63a8a'); txt('на свадьбу бывшего?', 540, 1605, 50, '#d63a8a'); g.restore(); }

let COVER = null;
function world(t) { const sc = SCENE(t);
  if (sc === 'cer') { gary(t); lucy(t); petrovich(t); zhanna(t); gate(t); }
  else { zhanna(t); gary(t); lucy(t); priceTag(t); petrovich(t); headTable(t); giftBox(t); propsBq(t); swan(X.bq.p, t); } }
function scene(t, c) { curCam = c; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a2230'; g.fillRect(0, 0, W, H);
  g = GB; g.setTransform(1, 0, 0, 1, 0, 0); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); (SCENE(t) === 'cer' ? setCer : setBq)(t); g = G0;
  g.save(); g.filter = `blur(${(3 * c.z).toFixed(1)}px) saturate(0.75) brightness(0.95)`; g.drawImage(bgCv, 0, 0); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 960); g.scale(c.z, c.z); g.translate(-c.x, -c.y); world(t); g.restore();
  const v = g.createRadialGradient(W / 2, H * .45, 650, W / 2, H * .45, 1250); v.addColorStop(0, 'rgba(30,15,30,0)'); v.addColorStop(1, 'rgba(30,15,30,0.2)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (c.sh.k !== 'END' && !COVER) panels(t); }
const accCv = createCanvas(W, H), GACC = accCv.getContext('2d'), frzCv = createCanvas(W, H), GFRZ = frzCv.getContext('2d');
function frame(t) {
  const c = COVER || camAt(t);
  if (!COVER && c.whip) { GACC.clearRect(0, 0, W, H); const N = 6; for (let k = 0; k < N; k++) { const ts = t + (k / (N - 1) - .5) / 30 * .9; scene(ts, camAt(ts)); GACC.globalAlpha = 1 / (k + 1); GACC.drawImage(cv, 0, 0); } GACC.globalAlpha = 1; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(accCv, 0, 0); curCam = c; }   // T3 motion blur
  else if (!COVER && t >= FREEZE[0] && t < FREEZE[0] + FREEZE[1]) freezeFrame(t);
  else scene(t, c);
  banqCard(t);
  if (process.env.NOCAP) return;
  hook(t); if (c.sh.k === 'END') endCard(t); else if (!(t >= PLATE[0] && t < PLATE[1])) { chip(t); britChip(t); caption(t); }
}
function freezeFrame(t) { const f0 = FREEZE[0], u = (t - f0) / FREEZE[1], c0 = camAt(f0); scene(f0, c0); GFRZ.clearRect(0, 0, W, H); GFRZ.drawImage(cv, 0, 0);
  g.setTransform(1, 0, 0, 1, 0, 0); const z = 1 + .05 * eio(u); g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); g.filter = 'grayscale(1) contrast(1.3) brightness(1.05)'; g.drawImage(frzCv, 0, 0); g.filter = 'none';
  // red pencil circle drawn on around the SECOND HAND tag (world -> screen at the frozen camera)
  const S = GA.s, tx = X.bq.g + 40 * S + 60 + 150, ty = SEAT - 840 * S + 70 + 18, sx = 540 + (tx - c0.x) * c0.z, sy = 960 + (ty - c0.y) * c0.z, pr = ex(P01(t, f0 + .15, .5));
  if (pr > 0) { g.beginPath(); for (let i = 0; i <= 64 * pr; i++) { const a = -2.2 + i / 64 * 6.6, r = 1 + .05 * Math.sin(i * .7); const px = sx + Math.cos(a) * 200 * c0.z * r, py = sy + Math.sin(a) * 92 * c0.z * r; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.strokeStyle = '#e0262f'; g.lineWidth = 9; g.lineCap = 'round'; g.stroke(); }
  g.restore();
  const lk = spr(P01(t, f0 + .25, .4), 6, 10); if (lk > 0) { g.save(); g.translate(540, 600); g.rotate(-.04 + (1 - lk) * -.1); g.scale(lk, lk); rr(-270, -52, 540, 104, 10, '#e0262f', 6); txt('ПРОБЕГ: 7 ЛЕТ', 0, 2, 62, '#ffffff', HW); g.restore(); } }
const [mode, arg, outName] = process.argv.slice(2);
if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of arg.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'cover') { // NOCAP still shifted down 180 px, top strip filled, cream plate top edge at y=330 (text inside the 3:4 crop)
  const t = +(arg || TAG0 + 1.0); process.env.NOCAP = 1; COVER = {z: .72, x: 560, y: 1060, k: 'COVER', sh: {k: 'COVER'}}; frame(t); const src = createCanvas(W, H); src.getContext('2d').drawImage(cv, 0, 0);
  g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(src, 0, 180); g.save(); g.filter = 'blur(8px)'; g.drawImage(src, 0, 0, W, 8, 0, 0, W, 184); g.filter = 'none'; g.restore();
  g.save(); g.translate(540, 495); g.rotate(-.02); rr(-450, -165, 900, 330, 34, '#fffaf0', 9); txt('ЖАННА', 0, -92, 90, INK); txt('НА СВАДЬБЕ', 0, 2, 96, '#d63a8a'); txt('БЫВШЕГО', 0, 98, 90, INK); g.restore();
  fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/cover.png', cv.toBuffer('image/png')); }
else if (mode === 'clip') { const [a, b] = arg.split(':').map(Number), F0 = Math.round(a * FPS), F1 = Math.round(Math.min(b, TL.TOTAL) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', outName]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', c)); })(); }
else if (mode === 'srt') { const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  let n = 0, out = ''; for (const c of FLAT) out += `${++n}\n${ts(c.a)} --> ${ts(c.hold)}\n${c.s}${c.tr ? '\n' + c.tr : ''}\n\n`; fs.mkdirSync('final', {recursive: true}); fs.writeFileSync('final/zhanna_wedding.srt', out); }
else if (mode === 'info') { for (const c of FLAT) console.log(c.id, c.a.toFixed(2), c.hold.toFixed(2), c.s, '|', c.tr || ''); for (const q of CHIPS) console.log('CHIP', q.a.toFixed(2), (q.b - q.a).toFixed(2), q.w); for (const s of SH) console.log('SH', s.i, s.at.toFixed(2), s.k);
  for (const [id, a, b] of PANELS) console.log('PANEL', id, a.toFixed(2), (b - a).toFixed(2)); console.log('TAG', TAG0.toFixed(2), 'BOX', BOX0.toFixed(2)); }
else if (mode === 'frame') { // measure each character's horizontal extent per shot, then solve the camera (every character fully inside or fully outside)
  const SC = .25, OX = 800, mc = createCanvas(Math.round(3200 * SC), Math.round(2000 * SC)), mg = mc.getContext('2d');
  const ext = (fn, t) => { g = mg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, mc.width, mc.height); g.setTransform(SC, 0, 0, SC, OX * SC, 0); fn(t); g = G0;
    const d = mg.getImageData(0, 0, mc.width, mc.height).data, w = mc.width; let a = 1e9, b = -1e9; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) { const x = ((i - 3) / 4) % w; if (x < a) a = x; if (x > b) b = x; } return a > b ? null : [a / SC - OX, (b + 1) / SC - OX]; };
  const CHR = {Z: zhanna, P: t => { petrovich(t); if (SCENE(t) === 'bq') { cake(X.bq.p, Math.min(t, BANG)); } }, G: gary, L: lucy}, out = {}, M = 16;
  for (const sh of SH) { const k = sh.k === 'END' ? 'BW' : sh.k, [z0, x0] = CAM[k], E = {};
    for (const c of 'ZPGL') { let a = 1e9, b = -1e9; for (let t = sh.at + .02; t < sh.end; t += .1) { const e = ext(CHR[c], t); if (e) { a = Math.min(a, e[0]); b = Math.max(b, e[1]); } } E[c] = a > b ? null : [a - M, b + M]; }
    const subj = SUBJ[sh.k].split('').filter(c => E[c]); let best = null;
    const ZS = []; for (let d = 0; d <= 1.3; d += .01) { if (z0 - d >= .5) ZS.push(z0 - d); if (d && z0 + d <= 2.2) ZS.push(z0 + d); } ZS.sort((p, q) => Math.abs(p - z0) * (p > z0 ? 1.5 : 1) - Math.abs(q - z0) * (q > z0 ? 1.5 : 1));
    for (const z of ZS) { if (best) break; const wMin = 1080 / (z * 1.045), wMax = 1080 / z;
      const S = subj.map(c => E[c]), sa = Math.min(...S.map(e => e[0])), sb = Math.max(...S.map(e => e[1])); if (sb - sa > wMin) continue;
      const cands = []; for (let x = sb - wMin / 2; x <= sa + wMin / 2; x += 2) cands.push(x); cands.sort((p, q) => Math.abs(p - x0) - Math.abs(q - x0));
      for (const x of cands) { let ok = true; for (const c of 'ZPGL') { if (subj.includes(c) || !E[c]) continue; const [oa, ob] = E[c];
          const outside = (x + wMax / 2 <= oa) || (x - wMax / 2 >= ob), inside = oa >= x - wMin / 2 && ob <= x + wMin / 2; if (!outside && !inside) { ok = false; break; } }
        if (ok) { best = [+z.toFixed(3), Math.round(x)]; break; } } }
    out[sh.i] = best; console.log(sh.i, sh.k, sh.at.toFixed(2), JSON.stringify(E), '->', best, 'was', [z0, x0]); }
  fs.writeFileSync('cams.json', JSON.stringify(out)); }
else if (mode === 'facecheck') { // Petrovich's face carries magenta probes; any magenta pixel in any frame = face visible
  process.env.NOCAP = 1; let bad = 0; const [step, off, from, to] = (arg || '1:0').split(':').map(Number); for (let i = Math.round((from || 0) * FPS) + (off || 0); i < Math.min(to || 1e9, TL.TOTAL) * FPS; i += step) { frame(i / FPS); const d = cv.data(); let n = 0; for (let j = 0; j < d.length; j += 16) if (d[j] > 230 && d[j + 1] < 40 && d[j + 2] > 230) n++; if (n) { bad++; console.log('VISIBLE', (i / FPS).toFixed(2), n); } } console.log('facecheck done, frames with face:', bad); }
else if (mode === 'smoothcheck') { // per-frame change of the drawn mouth opening; >15% allowed only at true onsets (opening from a nearly closed mouth)
  let n = 0, big = 0, worst = 0, dips = 0, low = 0, dur = 0;
  for (const l of L) { if (l.who === 'p') continue; const M = []; for (let t = l.at - .1; t < l.end + .3; t += 1 / FPS) M.push(T.talk(l, t).mouth); dur += l.end - l.at;
    for (let i = 1; i < M.length; i++) { const d = Math.abs(M[i] - M[i - 1]), onset = M[i - 1] < .12 && M[i] > M[i - 1]; n++; if (d > .151 && !onset) { big++; worst = Math.max(worst, d); } if (M[i] < .15) low++; }
    let hi = 0, lo = 1, down = false; for (const m of M) { if (!down) { if (m > hi) hi = m; if (hi - m >= .2) { down = true; lo = m; } } else { if (m < lo) lo = m; if (m - lo >= .2) { dips++; down = false; hi = m; } } } }
  console.log(`frames ${n}, non-onset jumps >15%: ${big} (${(100 * big / n).toFixed(1)}%), worst ${worst.toFixed(3)}, visible syllable dips/s ${(dips / dur).toFixed(2)}, near-closed ${(100 * low / n).toFixed(0)}%`); }
