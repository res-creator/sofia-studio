// LEGO v3 — the first ~68 s (cold open h1–h4 + chapter 1 card + c1–c2), code-drawn 2.5D/3D. Timed to the WORDS of the temp voice.
// node v3/opening.js still t1,t2,... out.png | frame t out.png | video out.mp4 | cues
const E = require('./eng.js'); const { W, H, clamp, lerp, ss, ease, hash, key, Scene, U, BH, PL, brick, oddPiece, camera, render, C, PAL } = E;
const S = require('../../figmakit/lib/scene.js');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const D = path.join(__dirname, '..');
const w0 = S.words(path.join(D, 'chapters/c0_hook'), 0), O1 = 36.52, w1 = S.words(path.join(D, 'chapters/c1_system'), -O1);
const a = (id, w, n = 0) => (id[0] === 'h' ? w0 : w1)(id, w, n);
const T = 68.6;
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

let PHOTO = null, MAP = null;
async function load() { PHOTO = await E.loadImage(path.join(__dirname, 'archive/ole_kirk_christiansen_1957.jpg'));
  const topo = require('topojson-client'), wa = require('./node_modules/world-atlas/countries-50m.json'); MAP = topo.feature(wa, wa.objects.countries).features; }

// ======================= SHOTS =======================
const shots = [];
const shot = (t0, fn, o = {}) => shots.push(Object.assign({ t0, fn }, o));

// A · one brick -> thousands of new pieces
shot(0, (ctx, g) => {
  E.bg(ctx, '#11141c', '#060709'); E.bokeh(ctx, g, 18, '255,170,110', 0.06, 2);
  const pull = ease.expo(clamp((g - t.thousands + 0.15) / 1.6));
  const ang = 0.6 + g * 0.22, dist = lerp(78, 900, pull), hgt = lerp(26, 320, pull);
  const cam = camera([Math.sin(ang) * dist, hgt, Math.cos(ang) * dist], [0, lerp(6, 0, pull), 0], lerp(30, 46, pull));
  const sc = new Scene(); sc.shadow(0, 0, 0, 26, 0.55);
  brick(sc, { x: 0, y: 0, z: 0, yaw: 0.3 }, 4, 2, C.red);
  const n = Math.floor(clamp((g - t.thousands + 0.1) / 1.4) * CLOUD.length);
  for (let i = 0; i < n; i++) { const p = CLOUD[i], u = ease.back(clamp((g - t.thousands + 0.1 - i / CLOUD.length * 1.4) / 0.35)), sp = g * 0.25;
    oddPiece(sc, { x: p.x, y: p.y + 10, z: p.z, yaw: p.yaw + sp, pitch: p.pitch, s: 0.2 + 0.8 * u }, ODDK(p.k), OCOL(p.k)); }
  render(ctx, sc, cam, Object.assign({}, DARK, { fogFar: 1800 }));
  E.glow(ctx, W / 2, H / 2, 600 * (1 - pull) + 200, 'rgba(255,120,80,1)', 0.08);
  E.type(ctx, '2004', 140, 160, g - t.y2004 + 0.1, { size: 64, align: 'left', col: '#E3B341' });
  E.label(ctx, 'THOUSANDS OF NEW PIECES', 144, 210, ss((g - t.thousands - 0.3) / 0.4), { size: 26, letter: 4 });
});
// B · each new piece -> its own set (rows receding into the dark)
shot(t.most - 0.2, (ctx, g) => {
  E.bg(ctx, '#0f1218', '#050608');
  const lt = g - t.most + 0.2, cam = camera([lerp(-60, 40, ss(lt / 3.3)), 70, lerp(150, 110, ss(lt / 3.3))], [lerp(-20, 60, ss(lt / 3.3)), 10, -260], 42);
  const sc = new Scene();
  for (let r = 0; r < 3; r++) for (let i = 0; i < 26; i++) { const x = (r - 1) * 70, z = -i * 48, id = r * 31 + i;
    const bx = { x: x - 14, y: 0, z: z - 10 }; sc.box(bx, 28, 18, 20, [196, 160, 112], { edge: 1 }); sc.box({ x: x - 14, y: 18, z: z - 10 }, 28, 2, 20, [214, 178, 128], {});  // set box
    sc.shadow(x, 0, z, 24, 0.5);
    const drop = r === 1 && i === 1 ? ease.in(clamp((g - t.exactly) / 0.45)) : 0;
    const hov = 52 + Math.sin(g * 2 + id) * 2 - drop * 34;
    oddPiece(sc, { x, y: hov, z, yaw: g * 0.6 + id, s: 0.9 }, ODDK(id), OCOL(id));
    const lineOn = clamp((lt - 0.4 - (i * 0.05 + r * 0.15)) / 0.3); if (lineOn > 0 && drop < 1) sc.line([x, hov - 2, z], [x, 20 + (hov - 22) * (1 - lineOn), z], 'rgba(255,214,120,0.9)', 2, 0.85); }
  render(ctx, sc, cam, Object.assign({}, DARK, { fogNear: 60, fogFar: 1300 }));
  E.caption(ctx, '1 NEW PIECE  →  1 SET', 140, 940, ss((g - t.most - 0.4) / 0.4), { sub: 'about 9 in 10 new pieces, by 2004' });
  E.type(ctx, 'EXACTLY ONE SET', W / 2, 200, g - t.exactly + 0.05, { size: 92 });
});
// C · the loss: a tower of bricks (the company) sheds bricks as the counter runs
const TOWER = []; { const cols = [C.red, C.yellow, C.blue, C.white, C.red, C.green, C.black, C.yellow]; let y = 0;
  for (let l = 0; l < 22; l++) { for (let k = 0; k < 2; k++) TOWER.push({ x: (l % 2 ? -8 : -16) + k * 16 * (l % 2 ? 0 : 1), z: (l % 2 ? -16 : -8) + k * 16 * (l % 2 ? 1 : 0), y, rot: l % 2, col: cols[(l * 3 + k) % cols.length], i: TOWER.length }); y += BH; } }
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
  E.label(ctx, 'NET RESULT 2004 · DANISH KRONER', W / 2, 150, ss((g - t.h2) / 0.4), { size: 24, letter: 5, align: 'center', col: 'rgba(244,239,230,0.6)' });
  if (g > t.lost - 0.2) E.type(ctx, s, W / 2, 270, 1, { size: 116, col: num > 0 ? '#FF5A45' : '#F4EFE6', stag: 0, dur: 0.01 });
  E.type(ctx, '≈ $300 MILLION', W / 2, 980, g - t.about, { size: 72, col: '#F4EFE6' });
  E.label(ctx, "THE WORLD'S MOST FAMOUS TOY", W / 2, 1035, ss((g - t.famous) / 0.4) * (1 - ss((g - t.about + 0.2) / 0.3)), { size: 24, letter: 5, align: 'center' });
});
// D · the two facts are connected
shot(t.h3 - 0.1, (ctx, g) => {
  E.bg(ctx, '#121520', '#050608');
  const lt = g - t.h3 + 0.1, cam = camera([0, 40, lerp(190, 150, ss(lt / 2.2))], [0, 14, 0], 40);
  const sc = new Scene(); sc.shadow(-50, 0, 0, 22, 0.5); sc.shadow(50, 0, 0, 22, 0.5);
  oddPiece(sc, { x: -50, y: 6 + Math.sin(g * 2) * 2, z: 0, yaw: g * 0.8, s: 1.3 }, 3, C.purple);
  for (let k = 0; k < 6; k++) sc.cyl({ x: 50, y: 0, z: 0 }, 0, k * 3.2, 0, 13, 3.0, [214, 172, 60], 22);
  const u = ease.inOut(clamp((g - t.connected + 0.2) / 0.7)); if (u > 0) sc.line([-40, 22, 0], [lerp(-40, 40, u), lerp(22, 24, u), 0], '#FF4B3A', 4, 1);
  render(ctx, sc, cam, DARK);
  E.label(ctx, 'THE PIECES', 560, 820, ss((lt - 0.2) / 0.4), { size: 30, letter: 6, align: 'center' }); E.label(ctx, 'THE MONEY', 1360, 820, ss((lt - 0.4) / 0.4), { size: 30, letter: 6, align: 'center' });
  E.type(ctx, 'CONNECTED', W / 2, 260, g - t.connected, { size: 88, col: '#FF6A55' });
});
// E · the man who would have to untangle them: a figure walks into a corridor of bins (generic silhouette, not a portrait)
function walker(ctx, x, y, s, ph, col = '#0a0a0c') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  const L = Math.sin(ph) * 0.42, A = -Math.sin(ph) * 0.35, b = Math.abs(Math.cos(ph)) * 3;
  const limb = (x0, y0, ang, len, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.sin(ang) * len, y0 + Math.cos(ang) * len); ctx.stroke(); };
  limb(-9, -96 - b, L, 92, 22); limb(9, -96 - b, -L, 92, 22);           // legs (trousers)
  ctx.beginPath(); ctx.moveTo(-30, -176 - b); ctx.lineTo(30, -176 - b); ctx.lineTo(36, -70 - b); ctx.lineTo(-36, -70 - b); ctx.closePath(); ctx.fill();    // long coat
  limb(-28, -168 - b, A, 78, 17); limb(28, -168 - b, -A, 78, 17);         // arms
  ctx.beginPath(); ctx.roundRect(-9, -192 - b, 18, 18, 4); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -207 - b, 18, 21, 0, 0, 6.283); ctx.fill(); ctx.restore(); }
shot(t.man - 0.25, (ctx, g) => {
  E.bg(ctx, '#0b0d12', '#040405');
  const lt = g - t.man + 0.25, cam = camera([0, 46, 140 - lt * 6], [0, 40, -400], 50);
  const sc = new Scene();
  for (let side of [-1, 1]) for (let i = 0; i < 18; i++) for (let lv = 0; lv < 5; lv++) { const z = -i * 46 + 40, x = side * 70;
    sc.box({ x: side > 0 ? x : x - 14, y: lv * 24, z: z - 20 }, 14, 2, 40, [60, 64, 74], { edge: 0.6 });       // shelf
    for (let b = 0; b < 3; b++) { const id = i * 15 + lv * 3 + b + (side > 0 ? 500 : 0); sc.box({ x: side > 0 ? x + 1 : x - 13, y: lv * 24 + 2, z: z - 18 + b * 13 }, 12, 9, 11, [80, 90, 106], { edge: 0.5 });
      if (hash(id) > 0.35) oddPiece(sc, { x: side > 0 ? x + 7 : x - 7, y: lv * 24 + 9, z: z - 12 + b * 13, yaw: id, s: 0.28 }, id % 8, OCOL(id)); } }
  // lamps
  render(ctx, sc, cam, Object.assign({}, DARK, { fogNear: 80, fogFar: 900, fogCol: [12, 14, 20] }));
  for (let i = 0; i < 6; i++) { const P = cam; } E.glow(ctx, W / 2, 360, 420, 'rgba(255,200,140,1)', 0.10);
  // the walker: from close to far along the aisle
  const wz = -30 - lt * 24, P = (pz) => { const v = E.V.sub([0, 0, pz], cam.pos), z = E.V.dot(v, cam.f); return [W / 2 + E.V.dot(v, cam.r) / z * cam.F, H / 2 - E.V.dot(v, cam.u) / z * cam.F, z]; };
  const fp = P(wz); if (fp[2] > 5) { const s = cam.F / fp[2] * 0.42; E.glow(ctx, fp[0], fp[1] - 110 * s, 260 * s, 'rgba(255,190,120,1)', 0.22); walker(ctx, fp[0], fp[1], s, lt * 5.2); }
  E.caption(ctx, 'AGE 35', 150, 780, ss((g - t.thirty) / 0.3), { size: 40 });
  E.caption(ctx, 'JOINED LEGO IN 2001', 150, 870, ss((g - t.joined) / 0.3), { size: 34 });
  E.caption(ctx, 'FROM A CONSULTING FIRM (McKINSEY)', 150, 960, ss((g - t.consulting) / 0.3), { size: 34 });
  E.label(ctx, 'THE MAN WHO HAD TO UNTANGLE IT', W - 140, 140, ss((g - t.untangle) / 0.4), { size: 24, letter: 5, align: 'right', col: 'rgba(244,239,230,0.7)' });
});
// F · a box of bricks pours out -> the bricks build the word SYSTEM
const FONT = { S: ['11111', '10000', '11111', '00001', '11111'], Y: ['10001', '01010', '00100', '00100', '00100'], T: ['11111', '00100', '00100', '00100', '00100'], E: ['11111', '10000', '11110', '10000', '11111'], M: ['10001', '11011', '10101', '10001', '10001'] };
const WORD = []; { let cx = 0; for (const ch of 'SYSTEM') { FONT[ch].forEach((row, r) => [...row].forEach((v, c) => { if (v === '1') WORD.push({ x: (cx + c) * 16, y: (4 - r) * BH, i: WORD.length }); })); cx += 6; } }
const WX = (6 * 6 - 1) * 16 / 2;
shot(t.h4 - 0.15, (ctx, g) => {
  E.bg(ctx, '#15120f', '#060504'); E.bokeh(ctx, g, 16, '255,180,110', 0.07, 9);
  const lt = g - t.h4 + 0.15, form = clamp((g - t.start) / (t.system - t.start)), rise = ss((g - t.word) / 2.4);
  const cam = camera([lerp(-90, -50, rise), lerp(240, 80, rise), lerp(180, 600, rise)], [0, lerp(0, 24, rise), 0], lerp(40, 36, rise));
  const sc = new Scene();
  // the cardboard box tips over (until the word starts forming)
  const tip = ease.out(clamp((g - t.box) / 0.9)); if (form < 0.6) { sc.box({ x: -40, y: 0, z: -30, roll: tip * 1.2 }, 60, 40, 50, [190, 150, 100], { a: 1 - form }); }
  WORD.forEach(p => { const h1 = hash(p.i * 2.3), h2 = hash(p.i * 7.1);
    // poured position on the floor
    const pour = ease.out(clamp((g - t.box - 0.2 - h1 * 0.9) / 0.5)), fx = lerp(-10, -10 + (h1 - 0.3) * 260, pour), fz = lerp(-10, (h2 - 0.5) * 200, pour), fy = lerp(30, 0, pour);
    const u = ease.inOut(clamp(form * 1.6 - h1 * 0.6)), x = lerp(fx, p.x - WX, u), y = lerp(fy, p.y, u) + Math.sin(u * Math.PI) * 40, z = lerp(fz, 0, u);
    if (g < t.box) return; brick(sc, { x, y, z, yaw: lerp(h2 * 6, 0, u) }, 2, 2, u > 0.98 ? C.red : PAL[p.i % 6], { seg: 8 }); sc.shadow(x, 0, z, 10, 0.35); });
  render(ctx, sc, cam, Object.assign({}, DARK, { fogNear: 600, fogFar: 2600, fogCol: [12, 10, 8] }));
  E.glow(ctx, W / 2, H / 2, 700, 'rgba(255,140,90,1)', 0.10 * ss((g - t.system) / 0.4));
  E.label(ctx, 'ONE WORD LEGO LIVED BY', W / 2, 150, ss((g - t.word) / 0.4) * (1 - ss((g - t.system) / 0.3)), { size: 26, letter: 6, align: 'center' });
});
// CARD · chapter 1
shot(O1 - 0.1, (ctx, g) => { const lt = g - O1 + 0.1; E.bg(ctx, '#1a140d', '#070503'); E.bokeh(ctx, g, 20, '255,190,120', 0.06, 11);
  E.label(ctx, 'CHAPTER 1', W / 2, 380, ss((lt - 0.2) / 0.4), { size: 26, letter: 10, align: 'center', col: '#E3B341' });
  E.type(ctx, 'THE SYSTEM', W / 2, 540, lt - 0.35, { size: 150 });
  E.type(ctx, '1932 — 1960', W / 2, 640, lt - 0.9, { size: 48, weight: 600, col: 'rgba(244,239,230,0.75)' });
  const k = ss((lt - 2.6) / 0.7); if (k > 0) { ctx.fillStyle = `rgba(7,5,3,${k})`; ctx.fillRect(0, 0, W, H); } }, { sepiaIn: 1 });
// G · map: Europe -> Denmark -> Billund, 1932
const LON0 = 9.11, LAT0 = 55.73;
function drawMap(ctx, cx, cy, sc, g) { const k = Math.cos(LAT0 * Math.PI / 180), X = lo => cx + (lo - LON0) * k * sc, Y = la => cy - (la - LAT0) * sc;
  for (const f of MAP) { const dk = f.properties.name === 'Denmark'; const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    ctx.beginPath(); for (const poly of polys) for (const ring of poly) { ring.forEach(([lo, la], i) => i ? ctx.lineTo(X(lo), Y(la)) : ctx.moveTo(X(lo), Y(la))); ctx.closePath(); }
    ctx.fillStyle = dk ? '#C9A46A' : '#3a3128'; ctx.fill(); ctx.strokeStyle = dk ? '#F2D8A8' : 'rgba(220,190,150,0.25)'; ctx.lineWidth = dk ? 2 : 1; ctx.stroke(); } }
shot(t.c1 - 0.3, (ctx, g) => { const lt = g - t.c1 + 0.3;
  ctx.fillStyle = '#1d2229'; ctx.fillRect(0, 0, W, H);   // sea
  const z = Math.exp(lerp(Math.log(22), Math.log(170), ease.inOut(clamp((g - t.c1) / (t.billund - t.c1 + 0.6)))));
  drawMap(ctx, W / 2, H / 2, z, g);
  // paper texture: fine lines
  ctx.save(); ctx.globalAlpha = 0.06; ctx.strokeStyle = '#fff'; for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.moveTo(0, i * 18); ctx.lineTo(W, i * 18 + 6); ctx.stroke(); } ctx.restore();
  const pin = ease.back(clamp((g - t.billund) / 0.5)); if (pin > 0) { ctx.save(); ctx.translate(W / 2, H / 2 - (1 - pin) * 200); ctx.fillStyle = '#C91A14'; ctx.beginPath(); ctx.arc(0, -46, 22, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -34); ctx.lineTo(0, 0); ctx.lineTo(14, -34); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -46, 8, 0, 6.283); ctx.fill(); ctx.restore();
    E.glow(ctx, W / 2, H / 2, 160, 'rgba(255,90,60,1)', 0.25 * pin); }
  E.caption(ctx, 'BILLUND, DENMARK', W / 2 + 60, H / 2 - 40, ss((g - t.billund - 0.2) / 0.4), { size: 40, sub: "a carpenter's workshop" });
  E.type(ctx, '1932', 150, 220, g - t.y1932, { size: 120, align: 'left', col: '#E3B341' });
}, { sepia: 0.25 });
// H · wooden toys in the workshop light (during the Depression)
shot(t.wooden - 0.15, (ctx, g) => { const lt = g - t.wooden + 0.15;
  E.bg(ctx, '#2a1d12', '#0b0705');
  const cam = camera([lerp(-80, -30, ss(lt / 2.6)), 46, 120], [lerp(-10, 20, ss(lt / 2.6)), 12, 0], 40);
  const sc = new Scene();
  sc.box({ x: -300, y: -20, z: -60 }, 600, 20, 140, C.wood, { edge: 0.5 });                       // workbench top
  for (let i = 0; i < 12; i++) sc.line([-300, 0.1, -55 + i * 11 + Math.sin(i) * 3], [300, 0.1, -55 + i * 11 + Math.cos(i) * 3], 'rgba(90,55,25,0.5)', 1.2, 0.8);   // wood grain
  // wooden duck on wheels, rolling
  const dx = lerp(-120, 60, ease.out(clamp(lt / 2.4))), T0 = { x: dx, y: 0, z: 0 };
  for (const wz of [-9, 9]) for (const wx of [-10, 10]) sc.cyl({ ...T0, pitch: Math.PI / 2 }, wx, wz - 2, -5, 5, 4, [170, 40, 30], 14);
  sc.prism(T0, [[-18, -8], [16, -8], [20, 0], [16, 8], [-18, 8]], 6, 14, C.yellow, {});                          // body
  sc.box({ ...T0, x: dx + 6, y: 20 }, 14, 16, 12, C.yellow, {}); sc.prism({ ...T0, x: dx + 20, y: 28 }, [[0, -3], [12, 0], [0, 3]], 0, 4, C.orange, {});   // head + beak
  sc.shadow(dx, 0, 0, 30, 0.5);
  // a second toy: a little wooden truck parked
  sc.box({ x: 70, y: 6, z: -40 }, 40, 14, 22, [60, 110, 170], {}); sc.box({ x: 94, y: 20, z: -40 }, 16, 14, 22, [200, 60, 40], {}); sc.shadow(90, 0, -29, 30, 0.45);
  render(ctx, sc, cam, { fogCol: [20, 14, 9], fogNear: 120, fogFar: 700, warm: 0.12 });
  // light beam + sawdust
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gb = ctx.createLinearGradient(W, 0, W * 0.3, H); gb.addColorStop(0, 'rgba(255,200,120,0.18)'); gb.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = gb; ctx.beginPath(); ctx.moveTo(W * 0.75, 0); ctx.lineTo(W, 0); ctx.lineTo(W * 0.6, H); ctx.lineTo(W * 0.2, H); ctx.fill();
  for (let i = 0; i < 70; i++) { const h = hash(i * 3.3), x = (h * W * 0.8 + g * 12 * (0.5 + h)) % W, y = (hash(i * 5.1) * H + g * 20 * (0.4 + h)) % H; ctx.fillStyle = `rgba(255,220,170,${0.35 * h})`; ctx.fillRect(x, y, 2 + h * 2, 2 + h * 2); } ctx.restore();
  E.caption(ctx, 'WOODEN TOYS', 150, 900, ss((lt - 0.3) / 0.4), { size: 36, sub: 'during the Great Depression' });
}, { sepia: 0.35 });
// I · "leg godt" -> play well -> LEGO (wooden letter blocks)
shot(t.name - 0.2, (ctx, g) => { const lt = g - t.name + 0.2;
  E.bg(ctx, '#20170f', '#080604'); E.bokeh(ctx, g, 14, '255,190,120', 0.06, 13);
  const cam = camera([0, 60, 260], [0, 12, 0], 36); const sc = new Scene();
  const L = ['L', 'E', 'G', 'G', 'O', 'D', 'T'], merge = ease.inOut(clamp((g - t.well) / 0.9));
  const pos = L.map((ch, i) => { const sx = i < 3 ? -100 + i * 30 : -10 + (i - 3) * 30 + 30; const fx = [-45, -15, 15, 999, 45, 999, 999][i]; return fx === 999 ? [sx, merge] : [lerp(sx, fx, merge), 0]; });
  const P = render.bind(null); const items = [];
  L.forEach((ch, i) => { const drop = ease.out(clamp((g - (i < 3 ? t.name + 0.15 : t.godt - 0.4) - i * 0.08) / 0.4)); if (drop <= 0) return; const [x, gone] = pos[i];
    const y = lerp(120, 0, drop) - (L[i] && (i === 3 || i === 5 || i === 6) ? gone * 120 : 0), a = (i === 3 || i === 5 || i === 6) ? 1 - gone : 1; if (a <= 0) return;
    sc.box({ x: x - 12, y, z: -12, yaw: 0 }, 24, 24, 24, [196, 150, 98], { a }); sc.shadow(x, 0, 0, 16, 0.4 * a); items.push([ch, x, y + 12, 12, a]); });
  const proj = render(ctx, sc, cam, { fogCol: [16, 12, 8], fogNear: 200, fogFar: 900, warm: 0.1 });
  items.forEach(([ch, x, y, z, a]) => { const p = proj([x, y, z]); const s = cam.F / p[2] * 18; ctx.save(); ctx.globalAlpha = a; ctx.font = `900 ${s}px ${E.F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5a2f12'; ctx.fillText(ch, p[0], p[1] + s * 0.05); ctx.restore(); });
  E.type(ctx, '"LEG GODT"', W / 2, 220, g - t.leg, { size: 80, col: '#F4EFE6' }); E.type(ctx, '= PLAY WELL', W / 2, 310, g - t.play, { size: 56, col: '#E3B341', weight: 800 });
}, { sepia: 0.2 });
// J · Ole Kirk Christiansen (archive photo, public domain)
shot(t.c2 - 0.2, (ctx, g) => { const lt = g - t.c2 + 0.2;
  E.bg(ctx, '#1b1612', '#070605');
  const z = lerp(1.0, 1.12, ss(lt / 5.8)), pw = 520 * z, ph = pw * PHOTO.height / PHOTO.width, x = W * 0.62 - pw / 2 + lt * 6, y = H / 2 - ph / 2;
  ctx.save(); ctx.translate(x + pw / 2, y + ph / 2); ctx.rotate(-0.025); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#efe6d4'; ctx.fillRect(-pw / 2 - 18, -ph / 2 - 18, pw + 36, ph + 60); ctx.shadowColor = 'transparent';
  ctx.filter = 'sepia(0.35) contrast(1.05)'; ctx.drawImage(PHOTO, -pw / 2, -ph / 2, pw, ph); ctx.filter = 'none'; ctx.restore();
  E.type(ctx, '1947', 150, 300, g - t.y1947, { size: 150, align: 'left', col: '#E3B341' });
  E.caption(ctx, 'OLE KIRK CHRISTIANSEN', 160, 520, ss((g - t.ole) / 0.4), { size: 40, sub: 'the carpenter (photo: 1957)' });
  E.label(ctx, 'BUYS A PLASTIC INJECTION-MOLDING MACHINE', 160, 640, ss((g - t.bought) / 0.4), { size: 26, letter: 3 });
}, { sepia: 0.2 });
// K · the machine (blueprint -> solid) + the bet: more than twice last year's profit
function machine(sc, T0, solid, open = 0) { const st = [128, 134, 140], dk = [64, 70, 76], gr = [46, 92, 72], o = { a: solid }, X = T0.x;
  sc.box({ x: X - 80, y: 0, z: -26 }, 160, 34, 52, gr, o);                                    // cast-iron base
  sc.box({ x: X - 70, y: 34, z: -10 }, 80, 18, 20, st, o);                                    // injection barrel
  for (let k = 0; k < 4; k++) sc.box({ x: X - 66 + k * 20, y: 33, z: -12 }, 4, 22, 24, dk, o);  // heater bands
  sc.box({ x: X - 56, y: 52, z: -6 }, 12, 10, 12, dk, o); sc.prism({ x: X - 50, y: 62, z: 0 }, [[-16, -16], [16, -16], [16, 16], [-16, 16]], 0, 26, st, o);  // hopper
  sc.box({ x: X + 12, y: 34, z: -22 }, 12, 46, 44, dk, o); sc.box({ x: X + 26 + open * 20, y: 34, z: -22 }, 12, 46, 44, dk, o);   // mold halves
  sc.box({ x: X + 70, y: 34, z: -20 }, 10, 52, 40, st, o);                                    // back platen
  for (const zz of [-18, 14]) for (const yy of [38, 76]) sc.box({ x: X + 10, y: yy, z: zz }, 62, 3, 3, [190, 196, 200], o);  // tie bars
  sc.cyl({ x: X - 82, y: 46, z: 0, roll: Math.PI / 2 }, 0, 0, 0, 22, 4, [150, 60, 40], 20, o); }   // hand wheel
shot(t.machine - 0.25, (ctx, g) => { const lt = g - t.machine + 0.25;
  const solid = ss((lt - 0.5) / 0.9), bet = ss((g - t.cost) / 0.5);
  E.bg(ctx, solid < 1 ? '#123250' : '#14171c', '#05070a');
  if (solid < 1) { ctx.save(); ctx.globalAlpha = 1 - solid; ctx.strokeStyle = 'rgba(120,190,255,0.12)'; for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); } for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); } ctx.restore(); }
  const ang = -0.5 + lt * 0.08, cam = camera([Math.sin(ang) * 260, lerp(90, 70, bet), Math.cos(ang) * 260], [lerp(0, 40, bet), 30, 0], 42);
  const sc = new Scene(); sc.shadow(0, 0, 0, 90, 0.5); machine(sc, { x: 0, y: 0, z: 0 }, Math.max(0.4, solid));
  // two coin stacks: profit 1946 vs the machine (> 2x)
  if (bet > 0) { const n1 = 6, n2 = Math.round(13 * ease.out(clamp((g - t.twice + 0.1) / 0.6)));
    for (let k = 0; k < n1; k++) sc.cyl({ x: 120, y: 0, z: 60 }, 0, k * 3.2, 0, 12, 3, [214, 172, 60], 20); for (let k = 0; k < n2; k++) sc.cyl({ x: 160, y: 0, z: 60 }, 0, k * 3.2, 0, 12, 3, [230, 190, 70], 20); }
  const proj = render(ctx, sc, cam, Object.assign({}, DARK, { edge: solid < 0.5 ? 2 : 1 }));
  if (solid < 1) { /* blueprint edges glow */ E.glow(ctx, W / 2, H / 2, 600, 'rgba(90,170,255,1)', 0.12 * (1 - solid)); }
  if (bet > 0) { const p1 = proj([120, 30, 60]), p2 = proj([160, 50, 60]); E.label(ctx, 'PROFIT, 1946', p1[0], p1[1] - 10, bet, { size: 24, align: 'center', letter: 3 }); E.label(ctx, 'THE MACHINE', p2[0], p2[1] - 20, ss((g - t.twice) / 0.4), { size: 24, align: 'center', letter: 3, col: '#E3B341' }); }
  E.type(ctx, 'MORE THAN 2×', W / 2, 190, g - t.twice, { size: 96, col: '#E3B341' }); E.label(ctx, "WHAT THE COMPANY HAD EARNED THE YEAR BEFORE (REPORTEDLY)", W / 2, 260, ss((g - t.twice - 0.4) / 0.4), { size: 22, letter: 3, align: 'center' });
});
// L · 1949: the mold opens, bricks pop out — then rows and rows
shot(t.by49 - 0.2, (ctx, g) => { const lt = g - t.by49 + 0.2;
  E.bg(ctx, '#14171c', '#040506'); E.bokeh(ctx, g, 16, '255,200,140', 0.06, 17);
  const pull = ss((g - t.bricks) / 1.8), cam = camera([lerp(230, 330, pull), lerp(120, 280, pull), lerp(260, 470, pull)], [lerp(60, 150, pull), 25, lerp(10, 80, pull)], 40);
  const sc = new Scene(); sc.shadow(0, 0, 0, 90, 0.5); const cyc = (lt % 0.9) / 0.9, open = Math.sin(Math.min(1, cyc * 2) * Math.PI);
  machine(sc, { x: 0, y: 0, z: 0 }, 1, open);
  const nb = Math.floor(lt / 0.9); const cols = [C.red, C.yellow, C.blue, C.white, C.red, C.green];
  for (let k = 0; k <= nb; k++) { const tt = lt - k * 0.9 - 0.25; if (tt < 0) continue; const x = 40 + Math.min(tt, 0.6) / 0.6 * 60, y = Math.max(0, 40 - tt * tt * 160);
    const row = Math.floor(k / 6), slot = k % 6; const settle = clamp((tt - 0.6) / 0.4); brick(sc, { x: lerp(x, 110 + slot * 34, settle), y: lerp(y, 0, settle), z: lerp(0, 30 + row * 20, settle), yaw: (1 - settle) * tt * 3 }, 4, 2, cols[k % 6], { seg: 10 }); }
  // the army of bricks appears as the camera pulls back
  if (pull > 0) for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) { const id = r * 10 + c, u = ease.back(clamp((pull - id / 80 * 0.7) / 0.3)); if (u <= 0) continue;
    brick(sc, { x: 110 + c * 34, y: 0, z: 70 + r * 22, s: u }, 4, 2, cols[(r + c) % 6], { seg: 8 }); }
  render(ctx, sc, cam, Object.assign({}, DARK, { fogNear: 200, fogFar: 1100 }));
  E.type(ctx, '1949', 150, 240, g - t.y1949, { size: 150, align: 'left', col: '#E3B341' }); E.label(ctx, 'LITTLE PLASTIC BRICKS', 156, 300, ss((g - t.bricks + 0.4) / 0.4), { size: 28, letter: 5 });
  const k = ss((g - (T - 1.0)) / 0.9); if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, W, H); }
});

// ======================= EDIT / RENDER =======================
shots.sort((p, q) => p.t0 - q.t0);
function frame(ctx, g) { const i = shots.findLastIndex(s => g >= s.t0), s = shots[Math.max(0, i)], lt = g - s.t0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; s.fn(ctx, g);
  if (s.sepia) E.sepia(ctx, s.sepia);
  E.vignette(ctx, 0.5); E.grain(ctx, g, 0.07);
  // cut accents: a 3-frame white flash on hard cuts into a new period, a quick fade on others
  const f = 1 - clamp(lt / 0.22); if (i > 0 && f > 0) { ctx.fillStyle = s.sepiaIn ? `rgba(255,236,200,${f * 0.6})` : `rgba(0,0,0,${f * 0.5})`; ctx.fillRect(0, 0, W, H); } }
async function main() { const [mode, a1, a2] = process.argv.slice(2); await load(); const cv = E.createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'T') return console.log(T);
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'still') { const ts = a1.split(',').map(Number), cols = 3, sh = E.createCanvas(640 * cols, 360 * Math.ceil(ts.length / cols)), c2 = sh.getContext('2d');
    ts.forEach((tt, i) => { frame(ctx, tt); c2.drawImage(cv, (i % cols) * 640, Math.floor(i / cols) * 360, 640, 360); c2.fillStyle = '#ff4040'; c2.font = '22px sans-serif'; c2.fillText(tt.toFixed(1), (i % cols) * 640 + 8, Math.floor(i / cols) * 360 + 26); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(T * 30); for (let f = 0; f < N; f++) { frame(ctx, f / 30); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N}\n`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); return; }
  if (mode === 'times') return console.log(JSON.stringify(t)); }
main();
module.exports = { t, T };
