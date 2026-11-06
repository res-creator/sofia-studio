// LEGO v3.1 — the first ~68 s, documentary edit: real archive photos/documents (licences in archive/SOURCES.md) + code animation
// (bricks, maps, business mechanics). Light and dark scenes alternate. Timed to the WORDS of the temp voice.
// node v3/opening.js still t1,t2,... out.png | frame t out.png | video out.mp4 | cues
const E = require('./eng.js'); const { W, H, clamp, lerp, ss, ease, hash, key, Scene, U, BH, PL, brick, oddPiece, camera, render, C, PAL } = E;
const S = require('../../figmakit/lib/scene.js');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const D = path.join(__dirname, '..');
const w0 = S.words(path.join(D, 'chapters/c0_hook'), 0), O1 = 36.52, w1 = S.words(path.join(D, 'chapters/c1_system'), -O1);
const a = (id, w, n = 0) => (id[0] === 'h' ? w0 : w1)(id, w, n);
const T = 67.58;
// ---- word times ----
const t = {
  y2004: a('h1', '2004'), lego: a('h1', 'LEGO'), thousands: a('h1', 'thousands'), most: a('h1', 'most'), exactly: a('h1', 'exactly'), set: a('h1', 'set'),
  h2: a('h2', 'That'), famous: a('h2', 'famous'), lost: a('h2', 'lost'), billion: a('h2', 'billion'), kroner: a('h2', 'kroner'), about: a('h2', 'About'), dollars: a('h2', 'dollars'),
  h3: a('h3', 'Those'), connected: a('h3', 'connected'), man: a('h3', 'man'), untangle: a('h3', 'untangle'), thirty: a('h3', 'thirty'), joined: a('h3', 'joined'), three: a('h3', 'three'), consulting: a('h3', 'consulting'),
  h4: a('h4', 'To'), box: a('h4', 'box'), sank: a('h4', 'sank'), maker: a('h4', 'maker'), start: a('h4', 'start'), word: a('h4', 'word'), system: a('h4', 'System'),
  c1: a('c1', 'LEGO'), y1932: a('c1', '1932'), workshop: a('c1', 'workshop'), billund: a('c1', 'Billund'), wooden: a('c1', 'wooden'), depression: a('c1', 'Depression'), name: a('c1', 'name'), leg: a('c1', 'leg', 1), godt: a('c1', 'godt'), play: a('c1', 'Play'), well: a('c1', 'well'),
  c2: a('c2', 'In'), y1947: a('c2', '1947'), ole: a('c2', 'Ole'), bought: a('c2', 'bought'), machine: a('c2', 'machine'), cost: a('c2', 'cost'), twice: a('c2', 'twice'), before: a('c2', 'before'), by49: a('c2', 'By'), y1949: a('c2', '1949'), bricks: a('c2', 'bricks'),
};
// ---- shared look ----
const DARK = { fogCol: [10, 11, 15], fogNear: 120, fogFar: 1400 };
const ODDK = n => n % 8, OCOL = n => PAL[(n * 5 + 3) % PAL.length];
// a cloud of distinct pieces around the origin (deterministic)
const CLOUD = Array.from({ length: 420 }, (_, i) => { const r = 40 + Math.pow(hash(i * 1.7), 0.6) * 520, th = hash(i * 3.1) * 6.283, y = (hash(i * 5.3) - 0.5) * 300 * (0.3 + r / 520);
  return { x: Math.cos(th) * r, y, z: Math.sin(th) * r, yaw: hash(i) * 6.28, pitch: (hash(i * 9) - 0.5) * 1.2, k: i, d: r }; });

let PHOTO = null, MAP = null; const IMG = {};
const ARCH = { bricks: 'lego_color_bricks.jpg', ole: 'ole_kirk_1957_desk.jpg', knud: 'knudstorp_2010.jpg', set700: 'lego_700_set_1952.jpg', machine: 'injection_machine_1949.jpg', patent: 'patent_us3005282-1.png' };
const CREDIT = { bricks: 'Photo: Alan Chia, 2007 · CC BY-SA 2.0', ole: 'Photo: 1957 · LEGO archive · public domain', knud: 'Photo: Hidden Isomorph, 2010 · CC BY-SA 3.0',
  set700: 'Photo: Toxophilus, 2024 (LEGO House display) · CC BY-SA 4.0', machine: 'Photo: Hercules Inc. / Science History Institute · Jan 1949 · no known copyright', patent: 'US Patent 3,005,282 · filed 1958 · public domain' };
async function load() { PHOTO = await E.loadImage(path.join(__dirname, 'archive/ole_kirk_christiansen_1957.jpg'));
  for (const [k, f] of Object.entries(ARCH)) IMG[k] = await E.loadImage(path.join(__dirname, 'archive', f));
  const topo = require('topojson-client'), wa = require('./node_modules/world-atlas/countries-50m.json'); MAP = topo.feature(wa, wa.objects.countries).features; }

// ---- documentary helpers ----
// photo with Ken Burns (rect in screen space: the photo COVERS it), from scale/offset k0 -> k1
function photo(ctx, im, u, o = {}) { const r = o.rect || [0, 0, W, H], [rx, ry, rw, rh] = r, z = lerp(o.z0 ?? 1.0, o.z1 ?? 1.08, ease.inOut(u)), fx = lerp(o.x0 ?? 0.5, o.x1 ?? 0.5, ease.inOut(u)), fy = lerp(o.y0 ?? 0.5, o.y1 ?? 0.5, ease.inOut(u));
  const sc = Math.max(rw / im.width, rh / im.height) * z, w = im.width * sc, h = im.height * sc, x = rx + (rw - w) * fx, y = ry + (rh - h) * fy;
  ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip(); if (o.filter) ctx.filter = o.filter; ctx.drawImage(im, x, y, w, h); ctx.restore(); }
// a print on a surface: white border, soft shadow, slight rotation
function print(ctx, im, cx, cy, w, rot, o = {}) { const h = w * im.height / im.width; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 22; ctx.fillStyle = '#f6f1e6'; ctx.fillRect(-w / 2 - 20, -h / 2 - 20, w + 40, h + (o.foot ?? 70)); ctx.shadowColor = 'transparent';
  if (o.filter) ctx.filter = o.filter; ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.filter = 'none'; ctx.restore(); return h; }
const M = require('./motion.js'), DOC = require('./doc.js');
function credit(ctx, s, a = 1) { if (a <= 0) return; if (!M.overlay(c => credit0(c, s, a))) return; credit0(ctx, s, a); }
function credit0(ctx, s, a) { ctx.save(); ctx.globalAlpha = a * 0.85; ctx.font = `600 20px ${E.F}`; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  const w = ctx.measureText(s).width; ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(W - w - 44, H - 52, w + 24, 34); ctx.fillStyle = '#f4efe6'; ctx.fillText(s, W - 32, H - 24); ctx.restore(); }
// big caption with a plate (readable on phones)
const plateText = (ctx, s, x, y, a, o = {}) => DOC.plate(ctx, s, x, y, a, o);
function plateText0(ctx, s, x, y, a, o = {}) { if (a <= 0) return; const size = o.size || 52; ctx.save(); ctx.globalAlpha = a; ctx.font = `${o.weight || 800} ${size}px ${E.F}`; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width, al = o.align || 'left', x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x, pad = size * 0.35;
  ctx.fillStyle = o.bg || 'rgba(14,14,16,0.72)'; ctx.fillRect(x0 - pad, y - size * 0.72, w + 2 * pad, size * 1.44); if (o.bar) { ctx.fillStyle = o.bar; ctx.fillRect(x0 - pad, y - size * 0.72, 8, size * 1.44); }
  ctx.fillStyle = o.col || '#F4EFE6'; ctx.fillText(s, x0 + (o.bar ? 6 : 0), y + 2); ctx.restore(); }
const LIGHT = { fogCol: [232, 226, 216], fogNear: 300, fogFar: 2600, amb: 0.42, key: 0.7 };
const STUDIO = (ctx) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f1ece4'); g.addColorStop(0.55, '#e6dfd4'); g.addColorStop(1, '#d3cabd'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };

// ======================= SHOTS =======================
const shots = [];
const shot = (t0, fn, o = {}) => shots.push(Object.assign({ t0, fn }, o));

// A · real bricks (photo) -> at "thousands": a light studio where thousands of DIFFERENT pieces burst out of one brick
shot(0, (ctx, g) => {
  if (g < t.thousands - 0.05) { photo(ctx, IMG.bricks, g / 3.2, { z0: 1.25, z1: 1.05, x0: 0.6, x1: 0.45, y0: 0.6, y1: 0.5 });
    const k = ss(g / 0.5); ctx.fillStyle = `rgba(0,0,0,${0.25 * k})`; ctx.fillRect(0, 0, W, H);
    E.type(ctx, '2004', 140, 250, g - t.y2004, { size: 170, align: 'left', col: '#ffffff' }); credit(ctx, CREDIT.bricks, ss(g / 0.6)); return; }
  STUDIO(ctx);
  const pull = ease.expo(clamp((g - t.thousands + 0.05) / 1.6)), ang = 0.6 + g * 0.22, dist = lerp(90, 900, pull), hgt = lerp(30, 320, pull);
  const cam = camera([Math.sin(ang) * dist, hgt, Math.cos(ang) * dist], [0, lerp(6, 0, pull), 0], lerp(30, 46, pull));
  const sc = new Scene(); sc.shadow(0, 0, 0, 26, 0.35);
  brick(sc, { x: 0, y: 0, z: 0, yaw: 0.3 }, 4, 2, C.red);
  const n = Math.floor(clamp((g - t.thousands) / 1.4) * CLOUD.length);
  for (let i = 0; i < n; i++) { const p = CLOUD[i], u = ease.back(clamp((g - t.thousands - i / CLOUD.length * 1.4) / 0.35)), sp = g * 0.25;
    oddPiece(sc, { x: p.x, y: p.y + 10, z: p.z, yaw: p.yaw + sp, pitch: p.pitch, s: 0.2 + 0.8 * u }, ODDK(p.k), OCOL(p.k)); }
  render(ctx, sc, cam, Object.assign({}, LIGHT, { fogNear: 400, fogFar: 2400 }));
  plateText(ctx, 'THOUSANDS OF NEW PIECES', 140, 160, ss((g - t.thousands - 0.2) / 0.3), { size: 56, bar: '#C91A14' });
}, { light: 1 });
// B · each new piece -> its own set (rows receding into the dark)
shot(t.most - 0.2, (ctx, g) => {
  STUDIO(ctx);
  const lt = g - t.most + 0.2, cam = camera([lerp(-60, 40, ss(lt / 3.3)), 70, lerp(150, 110, ss(lt / 3.3))], [lerp(-20, 60, ss(lt / 3.3)), 10, -260], 42);
  const sc = new Scene();
  for (let r = 0; r < 3; r++) for (let i = 0; i < 26; i++) { const x = (r - 1) * 70, z = -i * 48, id = r * 31 + i;
    const bx = { x: x - 14, y: 0, z: z - 10 }; sc.box(bx, 28, 18, 20, [196, 160, 112], { edge: 1 }); sc.box({ x: x - 14, y: 18, z: z - 10 }, 28, 2, 20, [214, 178, 128], {});  // set box
    sc.shadow(x, 0, z, 24, 0.5);
    const drop = r === 1 && i === 1 ? ease.in(clamp((g - t.exactly) / 0.45)) : 0;
    const hov = 52 + Math.sin(g * 2 + id) * 2 - drop * 34;
    oddPiece(sc, { x, y: hov, z, yaw: g * 0.6 + id, s: 0.9 }, ODDK(id), OCOL(id));
    const lineOn = clamp((lt - 0.4 - (i * 0.05 + r * 0.15)) / 0.3); if (lineOn > 0 && drop < 1) sc.line([x, hov - 2, z], [x, 20 + (hov - 22) * (1 - lineOn), z], 'rgba(160,30,20,0.8)', 2, 0.85); }
  render(ctx, sc, cam, Object.assign({}, LIGHT, { fogNear: 120, fogFar: 1500 }));
  plateText(ctx, '1 NEW PIECE → 1 SET', 140, 930, ss((g - t.most - 0.4) / 0.4), { size: 50, bar: '#C91A14' });
  plateText(ctx, 'EXACTLY ONE SET', W / 2, 170, ss((g - t.exactly + 0.05) / 0.3), { size: 88, align: 'center', bg: 'rgba(201,26,20,0.92)' });
});
// C · the loss: a tower of bricks (the company) sheds bricks as the counter runs
const TOWER = []; { const cols = [C.red, C.yellow, C.blue, C.white, C.red, C.green, C.black, C.yellow]; let y = 0;
  for (let l = 0; l < 22; l++) { for (let k = 0; k < 2; k++) TOWER.push({ x: (l % 2 ? -8 : -16) + k * 16 * (l % 2 ? 0 : 1), z: (l % 2 ? -16 : -8) + k * 16 * (l % 2 ? 1 : 0), y, rot: l % 2, col: cols[(l * 3 + k) % cols.length], i: TOWER.length }, { light: 1 }); y += BH; } }
shot(t.h2 - 0.1, (ctx, g) => {
  E.bg(ctx, '#0d0f14', '#030304'); E.bokeh(ctx, g, 14, '120,160,255', 0.05, 5);
  const lt = g - t.h2 + 0.1, ang = 0.8 + lt * 0.06, cam = camera([Math.sin(ang) * 240, lerp(70, 130, ss(lt / 9)), Math.cos(ang) * 240], [0, lerp(100, 70, ss(lt / 9)), 0], 48);
  const sc = new Scene(); sc.shadow(0, 0, 0, 44, 0.6);
  const loss = clamp((g - t.lost) / (t.kroner + 0.6 - t.lost));
  TOWER.forEach(b => { const hgt = b.y / (22 * BH); if (hgt < 0.38) { brick(sc, { x: b.x, y: b.y, z: b.z, yaw: b.rot ? Math.PI / 2 : 0 }, 4, 2, b.col, { seg: 10 }); return; } const order = (1 - hgt) * 0.8 + hash(b.i * 3.7) * 0.2, fall = clamp((loss - order) * 2.5); let T0 = { x: b.x, y: b.y, z: b.z, yaw: b.rot ? Math.PI / 2 : 0 };
    if (fall > 0) { const tt = fall * 1.6; T0 = { x: b.x * (1 + tt * 2) + hash(b.i) * 40 * tt, y: b.y - 260 * tt * tt, z: b.z * (1 + tt * 2) + (hash(b.i * 2) - 0.5) * 60 * tt, yaw: T0.yaw + tt * 3 * (hash(b.i) - 0.5), pitch: tt * 2.4 * (hash(b.i * 5) - 0.5) }; }
    if (T0.y > -400) brick(sc, T0, 4, 2, b.col, { seg: 10 }); });
  render(ctx, sc, cam, Object.assign({}, DARK, { fogNear: 150, fogFar: 900 }));
  const num = Math.round(1.93e9 * ease.out(clamp((g - t.lost) / (t.kroner - t.lost + 0.4))));
  const s = (num > 0 ? '−' : '') + num.toLocaleString('en-US');
  plateText(ctx, 'LEGO · NET RESULT 2004 · DANISH KRONER', W / 2, 140, ss((g - t.h2) / 0.4), { size: 34, align: 'center', bg: 'rgba(0,0,0,0)' });
  if (g > t.lost - 0.2) E.type(ctx, s, W / 2, 270, 1, { size: 116, col: num > 0 ? '#FF5A45' : '#F4EFE6', stag: 0, dur: 0.01 });
  E.type(ctx, '≈ $300 MILLION', W / 2, 980, g - t.about, { size: 72, col: '#F4EFE6' });
  plateText(ctx, "THE WORLD'S MOST FAMOUS TOY", W / 2, 980, ss((g - t.famous) / 0.4) * (1 - ss((g - t.about + 0.2) / 0.3)), { size: 44, align: 'center' });
});
// D · the two facts are connected: the pieces (photo) and the money (a ledger page), tied by a red thread
shot(t.h3 - 0.1, (ctx, g) => { const lt = g - t.h3 + 0.1;
  ctx.fillStyle = '#e9e3d8'; ctx.fillRect(0, 0, W, H);
  const k = ease.out(clamp(lt / 0.6));
  print(ctx, IMG.bricks, lerp(-200, 560, k), 520, 700, -0.04, { foot: 40 });
  // ledger page
  ctx.save(); ctx.translate(lerp(W + 300, 1380, k), 540); ctx.rotate(0.03); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.fillStyle = '#fbf8f0'; ctx.fillRect(-300, -380, 600, 760); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(70,110,170,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 22; i++) { ctx.beginPath(); ctx.moveTo(-270, -320 + i * 32); ctx.lineTo(270, -320 + i * 32); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(200,60,50,0.5)'; ctx.beginPath(); ctx.moveTo(150, -360); ctx.lineTo(150, 360); ctx.stroke();
  ctx.fillStyle = '#2a2a2a'; ctx.font = `700 34px ${E.F}`; ctx.fillText('2004', -260, -330);
  for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(40,40,40,0.55)'; ctx.fillRect(-260, -282 + i * 64, 180 + hash(i) * 160, 10); ctx.fillRect(170, -282 + i * 64, 70 + hash(i * 3) * 30, 10); }
  ctx.fillStyle = '#C91A14'; ctx.font = `900 64px ${E.F}`; ctx.textAlign = 'right'; ctx.fillText('−1.93 bn', 270, 300); ctx.restore();
  // red thread
  const u = ease.inOut(clamp((g - t.connected + 0.25) / 0.6)); if (u > 0) { ctx.save(); ctx.strokeStyle = '#C91A14'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); const x0 = 820, y0 = 470, x1 = 1170, y1 = 760;
    for (let i = 0; i <= 40 * u; i++) { const v = i / 40, x = lerp(x0, x1, v), y = lerp(y0, y1, v) + Math.sin(v * Math.PI) * -120; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.fillStyle = '#C91A14'; [[x0, y0], ...(u >= 1 ? [[x1, y1]] : [])].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.283); ctx.fill(); }); ctx.restore(); }
  plateText(ctx, 'THE PIECES', 560, 920, ss((lt - 0.3) / 0.3), { size: 46, align: 'center' }); plateText(ctx, 'THE MONEY', 1380, 990, ss((lt - 0.5) / 0.3), { size: 46, align: 'center' });
  plateText(ctx, 'CONNECTED', W / 2, 140, ss((g - t.connected) / 0.25), { size: 84, align: 'center', bg: 'rgba(201,26,20,0.92)' });
  credit(ctx, CREDIT.bricks, ss((lt - 0.3) / 0.4));
}, { light: 1 });
// E · the man who would have to untangle them: Jørgen Vig Knudstorp (real photo, 2010) + a timeline 1968 -> 2001 -> 2004
shot(t.man - 0.25, (ctx, g) => { const lt = g - t.man + 0.25;
  ctx.fillStyle = '#1c2230'; ctx.fillRect(0, 0, W, H);
  // background: the same photo, huge and blurred (depth); foreground: the print
  photo(ctx, IMG.knud, lt / 8, { z0: 1.6, z1: 1.7, filter: 'blur(28px) brightness(0.55) saturate(0.7)' });
  const k = ease.out(clamp(lt / 0.7)); print(ctx, IMG.knud, lerp(1500, 1360, k), 470 + Math.sin(lt * 0.6) * 4, 520 * (1 + lt * 0.006), -0.03 + lt * 0.002, { foot: 40 });
  plateText(ctx, 'JØRGEN VIG KNUDSTORP', 140, 230, ss((g - t.untangle) / 0.35), { size: 58, bar: '#E3B341' });
  // timeline
  const y = 760, x0 = 160, x1 = 960, P = [[1968, 'BORN', x0, t.thirty - 0.3], [2001, 'JOINS LEGO · FROM McKINSEY', lerp(x0, x1, 0.62), t.joined], [2004, 'AGE 35', x1, t.consulting + 0.4]];
  const lu = ease.inOut(clamp((g - t.thirty + 0.4) / (t.consulting - t.thirty + 0.8))); ctx.save(); ctx.strokeStyle = 'rgba(244,239,230,0.85)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, lu), y); ctx.stroke(); ctx.restore();
  P.forEach(([yr, lab, x, tt]) => { const v = ease.back(clamp((g - tt) / 0.35)); if (v <= 0) return; ctx.save(); ctx.fillStyle = '#E3B341'; ctx.beginPath(); ctx.arc(x, y, 16 * v, 0, 6.283); ctx.fill(); ctx.restore();
    E.type(ctx, String(yr), x, y - 50, g - tt, { size: 64, col: '#ffffff' }); plateText(ctx, lab, x, y + (yr === 2004 ? 130 : 70), ss((g - tt) / 0.3), { size: 34, align: 'center' }); });
  credit(ctx, CREDIT.knud + ' · photo date ≠ event date', ss((lt - 0.4) / 0.4));
});
// F · a box of bricks pours out -> the bricks build the word SYSTEM
const FONT = { S: ['11111', '10000', '11111', '00001', '11111'], Y: ['10001', '01010', '00100', '00100', '00100'], T: ['11111', '00100', '00100', '00100', '00100'], E: ['11111', '10000', '11110', '10000', '11111'], M: ['10001', '11011', '10101', '10001', '10001'] };
const WORD = []; { let cx = 0; for (const ch of 'SYSTEM') { FONT[ch].forEach((row, r) => [...row].forEach((v, c) => { if (v === '1') WORD.push({ x: (cx + c) * 16, y: (4 - r) * BH, i: WORD.length }); })); cx += 6; } }
const WX = (6 * 6 - 1) * 16 / 2;
shot(t.h4 - 0.15, (ctx, g) => {
  { const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#f6efe3'); gr.addColorStop(1, '#d9ccb7'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  const lt = g - t.h4 + 0.15, form = clamp((g - t.start) / (t.system - t.start)), rise = ss((g - t.word) / 2.4);
  const cam = camera([lerp(-90, -50, rise), lerp(240, 80, rise), lerp(180, 600, rise)], [0, lerp(0, 24, rise), 0], lerp(40, 36, rise));
  const sc = new Scene();
  // the cardboard box tips over (until the word starts forming)
  const TB = t.h4 - 0.15; const tip = ease.out(clamp((g - TB) / 0.5)); if (form < 0.6) { sc.box({ x: -40, y: 0, z: -30, roll: tip * 1.2 }, 60, 40, 50, [190, 150, 100], { a: 1 - form }); }
  WORD.forEach(p => { const h1 = hash(p.i * 2.3), h2 = hash(p.i * 7.1);
    // poured position on the floor
    const pour = ease.out(clamp((g - TB - 0.15 - h1 * 0.9) / 0.5)), fx = lerp(-10, -10 + (h1 - 0.3) * 260, pour), fz = lerp(-10, (h2 - 0.5) * 200, pour), fy = lerp(30, 0, pour);
    const u = ease.inOut(clamp(form * 1.6 - h1 * 0.6)), x = lerp(fx, p.x - WX, u), y = lerp(fy, p.y, u) + Math.sin(u * Math.PI) * 40, z = lerp(fz, 0, u);
    brick(sc, { x, y, z, yaw: lerp(h2 * 6, 0, u) }, 2, 2, u > 0.98 ? C.red : PAL[p.i % 6], { seg: 8 }); sc.shadow(x, 0, z, 10, 0.35); });
  render(ctx, sc, cam, Object.assign({}, LIGHT, { fogNear: 700, fogFar: 3000, fogCol: [228, 218, 200] }));
  
  plateText(ctx, 'ONE WORD LEGO LIVED BY', W / 2, 150, ss((g - t.word) / 0.4) * (1 - ss((g - t.system) / 0.3)), { size: 46, align: 'center' });
}, { light: 1 });
// CARD · chapter 1
shot(O1 - 0.1, (ctx, g) => { const lt = g - O1 + 0.1; photo(ctx, IMG.ole, lt / 3.4, { z0: 1.15, z1: 1.22, x0: 0.3, x1: 0.35, filter: 'blur(10px) sepia(0.6) brightness(0.45)' });
  E.label(ctx, 'CHAPTER 1', W / 2, 380, ss((lt - 0.2) / 0.4), { size: 26, letter: 10, align: 'center', col: '#E3B341' });
  E.type(ctx, 'THE SYSTEM', W / 2, 540, lt - 0.35, { size: 150 });
  E.type(ctx, '1932 — 1960', W / 2, 640, lt - 0.9, { size: 48, weight: 600, col: 'rgba(244,239,230,0.75)' });
  const k = ss((lt - 2.9) / 0.5); if (k > 0) { ctx.fillStyle = `rgba(232,224,206,${k})`; ctx.fillRect(0, 0, W, H); } }, { sepiaIn: 1, card: 1 });
// G · map: Europe -> Denmark -> Billund, 1932
const LON0 = 9.11, LAT0 = 55.73;
function drawMap(ctx, cx, cy, sc, g) { const k = Math.cos(LAT0 * Math.PI / 180), X = lo => cx + (lo - LON0) * k * sc, Y = la => cy - (la - LAT0) * sc;
  for (const f of MAP) { const dk = f.properties.name === 'Denmark'; const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    ctx.beginPath(); for (const poly of polys) for (const ring of poly) { ring.forEach(([lo, la], i) => i ? ctx.lineTo(X(lo), Y(la)) : ctx.moveTo(X(lo), Y(la))); ctx.closePath(); }
    ctx.fillStyle = dk ? '#D2462F' : '#d9ceb8'; ctx.fill(); ctx.strokeStyle = dk ? '#7d2214' : 'rgba(110,90,60,0.45)'; ctx.lineWidth = dk ? 2 : 1; ctx.stroke(); } }
shot(t.c1 - 0.3, (ctx, g) => { const lt = g - t.c1 + 0.3;
  ctx.fillStyle = '#b9cdd2'; ctx.fillRect(0, 0, W, H);   // sea (paper map)
  const z = Math.exp(lerp(Math.log(22), Math.log(170), ease.inOut(clamp((g - t.c1) / (t.billund - t.c1 + 0.6)))));
  drawMap(ctx, W / 2, H / 2, z, g);
  // paper texture: fine lines
  ctx.save(); ctx.globalAlpha = 0.05; ctx.strokeStyle = '#5a4a30'; for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.moveTo(0, i * 18); ctx.lineTo(W, i * 18 + 6); ctx.stroke(); } ctx.restore();
  const pin = ease.back(clamp((g - t.billund) / 0.5)); if (pin > 0) { ctx.save(); ctx.translate(W / 2, H / 2 - (1 - pin) * 200); ctx.fillStyle = '#C91A14'; ctx.beginPath(); ctx.arc(0, -46, 22, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -34); ctx.lineTo(0, 0); ctx.lineTo(14, -34); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -46, 8, 0, 6.283); ctx.fill(); ctx.restore();
    E.glow(ctx, W / 2, H / 2, 160, 'rgba(255,90,60,1)', 0.25 * pin); }
  plateText(ctx, 'BILLUND, DENMARK', W / 2 + 70, H / 2 - 60, ss((g - t.billund - 0.2) / 0.4), { size: 54, bar: '#C91A14' });
  plateText(ctx, "A CARPENTER'S WORKSHOP", W / 2 + 70, H / 2 + 20, ss((g - t.workshop) / 0.4), { size: 38 });
  E.type(ctx, '1932', 150, 230, g - t.y1932, { size: 150, align: 'left', col: '#2a2016' });
}, { sepia: 0 }, { light: 1 });
// H · wooden toys in the workshop light (during the Depression): a carpenter's bench with hand-made pull-along toys,
// a plane and curled shavings; a painted duck on wheels rolls in on its string (original illustration, not a specific museum piece)
const WOOD = [214, 168, 108], WOODL = [232, 196, 140], WOODD = [150, 98, 52], PAINT = { red: [178, 52, 38], yel: [222, 176, 60], blue: [62, 104, 150], grn: [70, 120, 74] };
function axleX(sc, x, y, z, r, len, col, o = {}) { sc.cyl({ x, y, z, roll: Math.PI / 2 }, 0, -len / 2, 0, r, len, col, 18, o); }        // cylinder along x
function wheel(sc, x, y, z, r, col) { sc.cyl({ x, y, z, pitch: Math.PI / 2 }, 0, -2, 0, r, 4, col, 16); sc.cyl({ x, y, z, pitch: Math.PI / 2 }, 0, -2.6, 0, r * 0.35, 5.2, WOODD, 10); }   // along z
function duck(sc, x, z, col) { for (const wz of [-11, 9]) for (const wx of [-11, 11]) wheel(sc, x + wx, 7, z + wz, 7, PAINT.red);
  sc.box({ x: x - 16, y: 4, z: z - 6 }, 32, 4, 12, WOODD, {});                                                     // chassis board
  // classic flat-cut profile: the duck's silhouette sawn from a plank, painted
  const prof = [[-28, 26], [-20, 14], [-10, 10], [12, 10], [21, 15], [23, 23], [19, 30], [13, 33], [16, 42], [13, 50], [4, 51], [-1, 45], [1, 35], [-9, 31], [-20, 30]];
  sc.prism({ x, y: 0, z: z + 6, pitch: Math.PI / 2 }, prof.map(([px, py]) => [px, -py]), 0, 12, col, { c: [x, 28, z] });
  sc.prism({ x: x + 14, y: 0, z: z + 2, pitch: Math.PI / 2 }, [[0, -44], [10, -42], [0, -40]], 0, 4, [222, 120, 40], { c: [x + 18, 42, z] });   // beak
  sc.prism({ x: x - 6, y: 0, z: z + 6.3, pitch: Math.PI / 2 }, [[-12, -20], [6, -18], [10, -24], [-6, -27]], 0, 0.3, [190, 120, 30], { c: [x - 6, 22, z + 7] });   // painted wing
  for (const ez of [6.4, -6.4]) sc.cyl({ x: x + 9, y: 44, z: z + ez, pitch: Math.PI / 2 }, 0, 0, 0, 1.8, 0.3, [30, 24, 20], 8); }
function truck(sc, x, z) { for (const wz of [-10, 10]) for (const wx of [-14, 16]) wheel(sc, x + wx, 7, z + wz, 7, PAINT.blue);
  sc.box({ x: x - 24, y: 7, z: z - 9 }, 50, 8, 18, WOOD, {}); sc.box({ x: x + 6, y: 15, z: z - 9 }, 20, 16, 18, PAINT.red, {}); sc.box({ x: x + 14, y: 21, z: z - 9.2 }, 8, 7, 18.4, [70, 60, 50], {});
  sc.box({ x: x - 22, y: 15, z: z - 8 }, 26, 10, 16, WOODL, {}); }
function blocks(sc, x, z) { [[0, 0, 0, PAINT.red], [17, 0, 3, PAINT.blue], [8, 16, 1, PAINT.yel], [-14, 0, -8, PAINT.grn]].forEach(([dx, dy, dz, c], i) => sc.box({ x: x + dx - 8, y: dy, z: z + dz - 8, yaw: i * 0.3 - 0.4 }, 16, 16, 16, c, {})); }
function yoyo(sc, x, z) { for (const o of [-4, 1]) sc.cyl({ x, y: 9, z: z + o, pitch: Math.PI / 2 }, 0, 0, 0, 9, 3, PAINT.grn, 18); sc.cyl({ x, y: 9, z: z - 1, pitch: Math.PI / 2 }, 0, 0, 0, 2.5, 2, WOODD, 8); }
function plane(sc, x, z) { sc.box({ x: x - 22, y: 0, z: z - 7, yaw: 0.5 }, 44, 9, 14, WOODD, {}); sc.box({ x: x - 4, y: 9, z: z - 2, yaw: 0.5 }, 12, 10, 4, [110, 112, 116], {}); }
shot(t.wooden - 0.15, (ctx, g) => { const lt = g - t.wooden + 0.15;
  E.bg(ctx, '#c79a62', '#5e3d1f');
  // back wall: planks + pegboard tools (flat, out of focus)
  ctx.save(); ctx.filter = 'blur(3px)'; for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? 'rgba(90,58,28,0.28)' : 'rgba(120,80,40,0.22)'; ctx.fillRect(i * 140, 0, 136, 430); }
  ctx.fillStyle = 'rgba(40,26,14,0.5)'; [[260, 120, 18, 200], [330, 140, 14, 170], [1300, 110, 20, 220], [1380, 150, 60, 14], [1500, 120, 16, 190]].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h)); ctx.restore();
  const k = ss(lt / 3.4), cam = camera([lerp(-150, -40, k), lerp(70, 52, k), lerp(210, 150, k)], [lerp(-40, 10, k), 16, 0], 38), sc = new Scene();
  sc.box({ x: -400, y: -24, z: -90 }, 800, 24, 200, WOOD, { edge: 0.4, ground: 1 });                                  // workbench top
  for (let i = 0; i < 14; i++) sc.line([-400, 0.1, -85 + i * 14 + Math.sin(i) * 3], [400, 0.1, -85 + i * 14 + Math.cos(i * 1.3) * 4], 'rgba(110,64,28,0.35)', 1.2, 0.8, { ground: 1, layer: 1 });
  truck(sc, 95, -50); blocks(sc, -150, -60); yoyo(sc, 40, -70); plane(sc, 150, 30);
  const dx = lerp(-200, -20, ease.out(clamp(lt / 2.6))); duck(sc, dx, 10, PAINT.yel); sc.shadow(dx, 0, 10, 34, 0.5);
  [[95, -50, 42], [-150, -60, 34], [40, -70, 16], [150, 30, 34]].forEach(([x, z, r]) => sc.shadow(x, 0, z, r, 0.4));
  // the pull string from the duck to the edge of frame
  sc.line([dx + 16, 6, 10], [dx + 140, 0.5, 60], 'rgba(60,40,20,0.9)', 1.6, 1);
  const P = render(ctx, sc, cam, { fogCol: [196, 150, 98], fogNear: 220, fogFar: 1100, warm: 0.1, amb: 0.48 });
  // curled shavings next to the plane
  for (let i = 0; i < 9; i++) { const p = P([170 + hash(i) * 50, 0.5, 45 + hash(i * 3) * 30]); ctx.strokeStyle = 'rgba(236,200,140,0.95)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0], p[1], 6 + hash(i * 7) * 8, 0, 4.5); ctx.stroke(); }
  // window light + dust
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gb = ctx.createLinearGradient(W, 0, W * 0.3, H); gb.addColorStop(0, 'rgba(255,200,120,0.2)'); gb.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = gb; ctx.beginPath(); ctx.moveTo(W * 0.72, 0); ctx.lineTo(W, 0); ctx.lineTo(W * 0.62, H); ctx.lineTo(W * 0.22, H); ctx.fill();
  for (let i = 0; i < 70; i++) { const h = hash(i * 3.3), x = (h * W * 0.8 + g * 12 * (0.5 + h)) % W, y = (hash(i * 5.1) * H + g * 20 * (0.4 + h)) % H; ctx.fillStyle = `rgba(255,220,170,${0.35 * h})`; ctx.fillRect(x, y, 2 + h * 2, 2 + h * 2); } ctx.restore();
  plateText(ctx, 'WOODEN TOYS', 140, 860, ss((lt - 0.2) / 0.4), { size: 56, bar: '#E3B341' }); plateText(ctx, 'DURING THE GREAT DEPRESSION', 140, 950, ss((g - t.depression + 0.2) / 0.4), { size: 38 });
  plateText(ctx, 'ILLUSTRATION', W - 60, 1040, 1, { size: 20, align: 'right', bg: 'rgba(0,0,0,0)', col: 'rgba(255,240,220,0.7)' });
}, { sepia: 0.25 });
// I · "leg godt" -> play well -> LEGO (wooden letter blocks)
shot(t.name - 0.2, (ctx, g) => { const lt = g - t.name + 0.2;
  { const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#efe6d6'); gr.addColorStop(1, '#cdbb9c'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  const cam = camera([0, 60, 260], [0, 12, 0], 36); const sc = new Scene();
  const L = ['L', 'E', 'G', 'G', 'O', 'D', 'T'], merge = ease.inOut(clamp((g - t.well) / 0.9));
  const pos = L.map((ch, i) => { const sx = i < 3 ? -100 + i * 30 : -10 + (i - 3) * 30 + 30; const fx = [-45, -15, 15, 999, 45, 999, 999][i]; return fx === 999 ? [sx, merge] : [lerp(sx, fx, merge), 0]; });
  const P = render.bind(null); const items = [];
  L.forEach((ch, i) => { const drop = ease.out(clamp((g - (i < 3 ? t.name - 0.2 : t.godt - 0.4) - i * 0.08) / 0.4)); if (drop <= 0) return; const [x, gone] = pos[i];
    const y = lerp(120, 0, drop) - (L[i] && (i === 3 || i === 5 || i === 6) ? gone * 120 : 0), a = (i === 3 || i === 5 || i === 6) ? 1 - gone : 1; if (a <= 0) return;
    sc.box({ x: x - 12, y, z: -12, yaw: 0 }, 24, 24, 24, [196, 150, 98], { a }); sc.shadow(x, 0, 0, 16, 0.4 * a); items.push([ch, x, y + 12, 12, a]); });
  const proj = render(ctx, sc, cam, { fogCol: [220, 205, 180], fogNear: 300, fogFar: 1400, warm: 0.06, amb: 0.45 });
  items.forEach(([ch, x, y, z, a]) => { const p = proj([x, y, z]); const s = cam.F / p[2] * 18; ctx.save(); ctx.globalAlpha = a; ctx.font = `900 ${s}px ${E.F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5a2f12'; ctx.fillText(ch, p[0], p[1] + s * 0.05); ctx.restore(); });
  E.type(ctx, '"LEG GODT"', W / 2, 230, g - t.leg, { size: 100, col: '#2a2016' }); plateText(ctx, 'DANISH: "PLAY WELL"', W / 2, 330, ss((g - t.play) / 0.3), { size: 50, align: 'center', bg: 'rgba(201,26,20,0.92)' });
}, { sepia: 0.2 }, { light: 1 });
// J · Ole Kirk Christiansen at his desk (real photo 1957; event 1947)
shot(t.c2 - 0.2, (ctx, g) => { const lt = g - t.c2 + 0.2;
  photo(ctx, IMG.ole, lt / 5.8, { z0: 1.0, z1: 1.35, x0: 0.5, x1: 0.42, y0: 0.5, y1: 0.28, filter: 'sepia(0.25) contrast(1.05)' });
  const gr = ctx.createLinearGradient(0, 0, W * 0.6, 0); gr.addColorStop(0, 'rgba(10,8,6,0.75)'); gr.addColorStop(1, 'rgba(10,8,6,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  E.type(ctx, '1947', 140, 300, g - t.y1947, { size: 170, align: 'left', col: '#E3B341' });
  plateText(ctx, 'OLE KIRK CHRISTIANSEN', 140, 470, ss((g - t.ole) / 0.35), { size: 54, bar: '#E3B341' });
  plateText(ctx, 'BUYS A PLASTIC INJECTION-MOLDING MACHINE', 140, 560, ss((g - t.bought) / 0.35), { size: 38 });
  credit(ctx, CREDIT.ole + ' · photo 1957, event 1947', ss((lt - 0.3) / 0.4));
});
// K · what such a machine looked like (real photo, USA, Jan 1949 — not LEGO's machine) + the bet: > 2x last year's profit
shot(t.machine - 0.25, (ctx, g) => { const lt = g - t.machine + 0.25, bet = ss((g - t.cost) / 0.4);
  ctx.fillStyle = '#d9d4cb'; ctx.fillRect(0, 0, W, H);
  photo(ctx, IMG.machine, lt / 5.5, { rect: [0, 0, W * 0.56, H], z0: 1.0, z1: 1.18, x0: 0.5, x1: 0.62, y0: 0.4, y1: 0.45 });
  plateText(ctx, 'A PLASTIC INJECTION-MOLDING MACHINE', 60, 90, ss((lt - 0.2) / 0.4), { size: 34 });
  plateText(ctx, 'USA, 1949 · SAME TECHNOLOGY, NOT LEGO’S MACHINE', 60, 150, ss((lt - 0.4) / 0.4), { size: 26, bg: 'rgba(14,14,16,0.6)' });
  // the bet: two bars
  const bx = W * 0.62, by = 860, bw = 210, h1 = 220, h2 = 220 * 2.15 * ease.out(clamp((g - t.twice + 0.1) / 0.7));
  if (bet > 0) { ctx.save(); ctx.globalAlpha = bet; ctx.fillStyle = '#7d7468'; ctx.fillRect(bx, by - h1, bw, h1); ctx.fillStyle = '#C91A14'; ctx.fillRect(bx + bw + 90, by - h2, bw, h2);
    ctx.fillStyle = '#2a2016'; ctx.fillRect(bx - 30, by, 2 * bw + 150, 6); ctx.restore();
    plateText(ctx, "COMPANY'S PROFIT, 1946", bx + bw / 2, by + 60, bet, { size: 30, align: 'center', bg: 'rgba(0,0,0,0)', col: '#2a2016' });
    plateText(ctx, 'THE MACHINE', bx + bw * 1.5 + 90, by + 60, ss((g - t.twice) / 0.4), { size: 30, align: 'center', bg: 'rgba(0,0,0,0)', col: '#C91A14' }); }
  E.type(ctx, 'MORE THAN 2×', 1530, 200, g - t.twice, { size: 96, col: '#C91A14' });
  plateText(ctx, 'REPORTEDLY', 1530, 270, ss((g - t.twice - 0.4) / 0.4), { size: 30, align: 'center', bg: 'rgba(0,0,0,0)', col: '#5a4a30' });
  credit(ctx, CREDIT.machine, ss((lt - 0.3) / 0.4));
}, { light: 1 });
// L · 1949: bricks pop out of a mold (code, quick) -> a real early LEGO set (photo of the 1952 box)
shot(t.by49 - 0.2, (ctx, g) => { const lt = g - t.by49 + 0.2;
  if (g < t.bricks - 0.1) { STUDIO(ctx); const cam = camera([150, 150, 280], [0, 18, 0], 38), sc = new Scene();
    const cols = [C.red, C.yellow, C.blue, C.white, C.red, C.green];
    for (let k = 0; k < 24; k++) { const tt = lt - k * 0.09; if (tt < 0) continue; const lay = Math.floor(k / 8), x = -70 + (k % 4) * 34 + (lay % 2) * 12, z = (Math.floor(k / 4) % 2) * 18 - 9, y = Math.max(lay * 9.6, 160 - tt * tt * 700);
      brick(sc, { x, y, z, yaw: (1 - clamp(tt * 3)) * 2 }, 4, 2, cols[k % 6], { seg: 10 }); sc.shadow(x, 0, z, 16, 0.3); }
    render(ctx, sc, cam, LIGHT); E.type(ctx, '1949', 140, 250, g - t.y1949, { size: 170, align: 'left', col: '#C91A14' }); return; }
  photo(ctx, IMG.set700, (g - t.bricks + 0.1) / 3.4, { z0: 1.05, z1: 1.3, x0: 0.5, x1: 0.48, y0: 0.42, y1: 0.36 });
  plateText(ctx, 'LITTLE PLASTIC BRICKS', 140, 180, ss((g - t.bricks) / 0.35), { size: 58, bar: '#C91A14' });
  plateText(ctx, 'AN EARLY LEGO SET · 1952', 140, 270, ss((g - t.bricks - 0.3) / 0.35), { size: 38 });
  credit(ctx, CREDIT.set700, ss((g - t.bricks) / 0.4));
});

// ======================= EDIT / RENDER =======================
shots.sort((p, q) => p.t0 - q.t0);
const IMPACTS = [[t.exactly + 0.42, 0.6], [t.lost, 1.2], [t.kroner + 0.4, 1], [t.about - 0.1, 0.8], [t.connected + 0.6, 0.4], [t.h4 + 0.2, 0.6], [t.system, 1], [O1 + 0.4, 0.6], [t.billund, 0.3], [t.twice + 0.6, 0.8]];
shots.find(s => s.t0 === t.by49 - 0.2).beats = [t.bricks - 0.1];
const MO = { T, impacts: IMPACTS };
function frame(ctx, g) { M.compose(ctx, shots, g, MO); }
async function main() { const [mode, a1, a2] = process.argv.slice(2); await load(); const cv = E.createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'T') return console.log(T);
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'still') { const ts = a1.split(',').map(Number), cols = 3, sh = E.createCanvas(640 * cols, 360 * Math.ceil(ts.length / cols)), c2 = sh.getContext('2d');
    ts.forEach((tt, i) => { frame(ctx, tt); c2.drawImage(cv, (i % cols) * 640, Math.floor(i / cols) * 360, 640, 360); c2.fillStyle = '#ff4040'; c2.font = '22px sans-serif'; c2.fillText(tt.toFixed(1), (i % cols) * 640 + 8, Math.floor(i / cols) * 360 + 26); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] }, { light: 1 });
    const N = Math.round(T * 30); for (let f = 0; f < N; f++) { frame(ctx, f / 30); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N}\n`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); return; }
  if (mode === 'times') return console.log(JSON.stringify(t));
  if (mode === 'trans') return console.log(JSON.stringify(M.trans(shots, T))); }
main();
module.exports = { t, T };
