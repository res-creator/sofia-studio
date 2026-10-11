// Ep3 character preview: ~14s check-in moment (Anna, Sofia, Gus) — design test, placeholder lip-sync (no voices yet).
// node ep3/preview.js video out.mp4 | still t1,t2,.. out.png | lineup out.png
require('../lib/fonts');
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const { spawn } = require('child_process');
const { drawSofia } = require('../lib/sofia');
const { drawGus } = require('../lib/gus');
const { drawCrew } = require('../lib/crew');
const { drawDrMax } = require('../lib/drmax');
const { OL, paint, line, curve, roundRect, clamp, lerp, ease, noise1 } = require('../lib/draw');
const U = require('../lib/ui');
const U2 = require('../ep2/ui2');
const B3 = require('./bg3');
const F = require('../lib/fonts');
U2.STYLE.anna = { bg: '#2A3D73', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' };
U2.STYLE.bob = { bg: '#5E6676', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' };
U2.STYLE.gary = { bg: '#E5484D', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' };

const W = 1920, H = 1080, FPS = 30, T = 14.4;
const LINES = [
  { who: 'anna', t0: 0.5, t1: 3.1, text: 'Good morning! Can I see your passport, please?' },
  { who: 'gus', t0: 3.75, t1: 5.1, text: 'Here you are!' },
  { who: 'anna', t0: 7.9, t1: 9.7, text: '...This is a photo of an egg.' },
  { who: 'gus', t0: 10.25, t1: 11.9, text: 'It is my baby photo!' },
  { who: 'sofia', t0: 12.6, t1: 13.7, text: 'Oh, Gus...' },
];
for (const L of LINES) { // spread words by syllables (placeholder timing)
  const ws = L.text.split(' '), syl = ws.map(w => Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) || []).length) + 0.6), S = syl.reduce((a, b) => a + b, 0);
  let u = L.t0; L.words = ws.map((w, i) => { const d = (L.t1 - L.t0) * syl[i] / S; const o = { w, t0: u, t1: u + d * 0.9 }; u += d; return o; });
}
function talk(who, t) {
  for (const L of LINES) if (L.who === who) for (const w of L.words) if (t >= w.t0 && t < w.t1) return 0.45 + 0.55 * Math.abs(Math.sin((t - w.t0) * 14));
  return 0;
}
const blink = (t, s) => { const p = 3.1 + s * 0.37, u = (t + s * 1.3) % p; return u < 0.07 ? u / 0.07 : u < 0.16 ? 1 - (u - 0.07) / 0.09 : 0; };
const mouth = (who, t, base) => { const l = talk(who, t); return l ? Object.assign({}, base, { open: l * 0.8 }) : base; };

// ---- props ----
function passport(c, s = 1, rot = 0) {
  c.save(); c.scale(s, s); c.rotate(rot);
  paint(c, q => roundRect(q, -36, -50, 72, 100, 8), '#1E2E5A', { shade: '#141F40', sx: 5, sy: 5, lw: 5 });
  c.beginPath(); c.arc(0, -8, 16, 0, 7); c.lineWidth = 4; c.strokeStyle = '#F2C744'; c.stroke();
  c.fillStyle = '#F2C744'; c.font = `800 13px ${F.EN}`; c.textAlign = 'center'; c.fillText('PASSPORT', 0, 32);
  c.restore();
}
function egg(c, X, Y, s) {
  paint(c, q => q.ellipse(X, Y, 70 * s, 92 * s, 0, 0, 7), '#FFF6E6', { shade: '#EADBC0', sx: 10 * s, sy: 8 * s, lw: 6 });
  c.save(); c.globalAlpha = 0.6; c.beginPath(); c.ellipse(X - 26 * s, Y - 40 * s, 14 * s, 22 * s, -0.4, 0, 7); c.fillStyle = '#fff'; c.fill(); c.restore();
}
function passportInsert(ctx, t, k) { // screen-space close-up of the open passport on the counter
  ctx.fillStyle = '#F4F6F9'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#E3E8EF'; for (let i = 0; i < 12; i++) ctx.fillRect(0, i * 100 + 40, W, 6);
  const z = 1 + 0.04 * k; ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.rotate(-0.03);
  paint(ctx, q => roundRect(q, -640, -380, 1280, 760, 30), '#1E2E5A', { lw: 8 });
  paint(ctx, q => roundRect(q, -620, -360, 610, 720, 18), '#F3EEDD', { shade: '#E3DCC3', sx: -8, sy: 0, lw: 6 });
  paint(ctx, q => roundRect(q, 10, -360, 610, 720, 18), '#F3EEDD', { shade: '#E3DCC3', sx: 8, sy: 0, lw: 6 });
  // photo frame + egg
  paint(ctx, q => roundRect(q, -540, -260, 360, 460, 12), '#CFE6F7', { lw: 6 });
  egg(ctx, -360, -20, 1.75);
  ctx.fillStyle = '#7A6A50'; ctx.font = `700 34px ${F.EN}`; ctx.textAlign = 'left';
  ctx.fillText('PASSPORT', -540, -290);
  const rows = [['NAME', 'GUS'], ['COUNTRY', 'GOOSELAND'], ['BORN', 'IN AN EGG'], ['HEIGHT', 'TALL-ISH']];
  rows.forEach((r, i) => { ctx.fillStyle = '#9C8A6E'; ctx.font = `700 30px ${F.EN}`; ctx.fillText(r[0], 80, -240 + i * 130); ctx.fillStyle = '#2A2420'; ctx.font = `800 52px ${F.EN}`; ctx.fillText(r[1], 80, -186 + i * 130); });
  // little stamp
  ctx.save(); ctx.translate(-160, 250); ctx.rotate(-0.25); ctx.globalAlpha = 0.6; ctx.lineWidth = 6; ctx.strokeStyle = '#E5484D'; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.stroke(); ctx.fillStyle = '#E5484D'; ctx.font = `800 30px ${F.EN}`; ctx.textAlign = 'center'; ctx.fillText('HONK', 0, 10); ctx.restore();
  ctx.restore();
}

// ---- camera (same convention as ep2: translate(960,540) scale(z*0.72) translate(-cx,-cy)) ----
const SHOTS = [
  { t: 0, c: [1150, 1150, 1.42], to: [1165, 1150, 1.48] },  // wide: hall, desk, Anna; Sofia + Gus walk up
  { t: 3.4, c: [1080, 1110, 2.35], to: [1085, 1100, 2.5] },   // CU Gus with passport in beak
  { t: 5.6, insert: true },                                  // insert: the passport
  { t: 7.6, c: [1640, 1050, 2.3], to: [1640, 1045, 2.45] },  // MCU Anna, deadpan
  { t: 10.0, c: [1080, 1100, 2.4], to: [1085, 1090, 2.6] },    // CU Gus, proud
  { t: 12.2, c: [1150, 1150, 1.45] },                        // wide: Sofia "Oh, Gus..."
];
function shot(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t) s = x; return s; }
let BG = null;

function frame(ctx, t) {
  const s = shot(t), i = SHOTS.indexOf(s), nt = (SHOTS[i + 1] || { t: T }).t;
  if (s.insert) { passportInsert(ctx, t, (t - s.t) / (nt - s.t)); }
  else {
    const u = ease.inOut(clamp((t - s.t) / (nt - s.t))), cx = lerp(s.c[0], (s.to || s.c)[0], u), cy = lerp(s.c[1], (s.to || s.c)[1], u), z = lerp(s.c[2], (s.to || s.c)[2], u);
    ctx.save(); ctx.translate(960, 540); ctx.scale(z * 0.72, z * 0.72); ctx.translate(-cx, -cy);
    ctx.drawImage(BG, 0, 0, B3.WW, B3.HH);
    const gusCU = t >= 3.4 && t < 5.6 || t >= 10 && t < 12.2;
    // Anna behind the desk
    const annaHas = t >= 5.6, deadpan = t >= 7.6 && t < 12.2;
    drawCrew(ctx, 1700, 1236, 0.72, {
      turn: -0.3, look: deadpan && t < 9.9 ? [0.1, 0.6] : [-0.75, 0.05], blink: Math.max(blink(t, 4), deadpan ? 0.3 : 0),
      browL: deadpan ? -0.35 : 0.3, browR: deadpan ? 0.25 : 0.3,
      mouth: mouth('anna', t, { smile: deadpan ? -0.1 : 0.8, w: 1 }),
      armR: annaHas ? [70, -270] : [120, -60], handR: annaHas ? 'relax' : 'relax', armL: [-120, -70], armsFront: annaHas,
      holdR: annaHas ? (c => passport(c, 1.1, 0.2)) : null,
      bob: Math.sin(t * 2.1) * 3,
    }, 'anna');
    B3.desk(ctx, null);
    // Sofia walks in (wide 1), stands (cheated left in Gus close-ups)
    const wk = ease.out(clamp((t - 0.0) / 2.2)), sx = lerp(260, 560, wk) - (gusCU ? 280 : 0), walking = wk > 0 && wk < 0.98;
    const palm = t >= 12.5;
    drawSofia(ctx, sx, 1500 - 262 * 0.72, 0.72, {
      legs: walking ? 'walk' : 'stand', walk: t * 1.9, turn: 0.35, look: palm ? [0.3, 0.4] : [0.8, -0.2],
      blink: Math.max(blink(t, 1), palm ? 0.5 : 0), bob: Math.sin(t * 2.2) * 3,
      brow: { l: 0.2, r: 0.2, worry: palm ? 0.7 : 0 }, mouth: mouth('sofia', t, { smile: palm ? -0.2 : 0.55 }),
      armR: palm ? [40, -470] : null, handR: palm ? 'open' : 'mitten', armsFront: palm,
    });
    // Gus: waddles in, passport in his beak until he hands it over
    const gk = ease.out(clamp((t - 0.2) / 2.4)), gx = lerp(560, 1010, gk), gw = gk > 0 && gk < 0.98;
    const proud = t >= 10 && t < 12.2, inBeak = t < 5.6;
    drawGus(ctx, gx, 1500, 0.92, {
      face: 1, walking: gw, walk: t * 2.1, lids: proud ? 0.05 : t >= 12.2 ? 0.55 : 0.3,
      neck: proud ? -0.35 : 0.05, look: 0.6, honk: Math.max(inBeak ? 0.12 : 0, talk('gus', t) * (inBeak ? 0.3 : 0.8)),
      wing: proud ? 0.55 : t >= 3.4 && t < 5.6 ? 0.25 + 0.1 * Math.sin(t * 6) : 0.1,
      squash: proud ? 1.03 : 1,
      hold: inBeak ? ((c, f, h) => { c.translate(h.hx + 120, h.hy + 30); passport(c, 1.05, 1.35); }) : null,
    });
    ctx.restore();
  }
  // captions
  const L = LINES.find(l => t >= l.t0 - 0.1 && t < l.t1 + 0.45);
  if (L) U2.caption(ctx, L.words, t, L.who);
  // corner tag
  ctx.save(); ctx.globalAlpha = 0.85; paint(ctx, q => roundRect(q, 30, 26, 420, 58, 18), '#1E2433', { lw: 0 });
  ctx.fillStyle = '#FFD23F'; ctx.font = `800 30px ${F.EN}`; ctx.textAlign = 'left'; ctx.fillText('EP3 PREVIEW · no voices yet', 52, 66); ctx.restore();
}

// ---- character lineup sheet ----
function gary(c, f, h) { // Uncle Gary: sunglasses + red bandana, drawn on the stock Gus rig via hold
  const { hx, hy } = h;
  paint(c, q => { q.moveTo(hx - 64, hy - 24); q.bezierCurveTo(hx - 50, hy - 70, hx + 40, hy - 74, hx + 64, hy - 30); q.lineTo(hx + 60, hy - 14); q.bezierCurveTo(hx + 30, hy - 50, hx - 40, hy - 46, hx - 62, hy - 6); q.closePath(); }, '#E5484D', { shade: '#B8323A', sx: 0, sy: 4, lw: 5 });
  c.fillStyle = '#fff'; for (const [dx, dy] of [[-30, -48], [0, -54], [30, -48]]) { c.beginPath(); c.arc(hx + dx, hy + dy, 4, 0, 7); c.fill(); }
  paint(c, q => { q.moveTo(hx - 62, hy - 20); q.lineTo(hx - 110, hy - 40); q.lineTo(hx - 96, hy - 6); q.closePath(); }, '#E5484D', { lw: 5 });
  paint(c, q => q.ellipse(hx + 22, hy - 12, 30, 22, 0, 0, 7), '#1E2230', { lw: 5 });
  c.save(); c.globalAlpha = 0.5; curve(c, [hx + 6, hy - 22], [hx + 14, hy - 28], [hx + 26, hy - 26], 4, '#fff'); c.restore();
  line(c, [[hx - 8, hy - 14], [hx - 60, hy - 18]], 6, '#1E2230');
}
function lineup(ctx) {
  ctx.fillStyle = '#EAF2FA'; ctx.fillRect(0, 0, W, H);
  const F0 = 930;
  const cards = [[200, 'SOFIA'], [520, 'GUS'], [830, 'ANNA'], [1110, 'OFFICER BOB'], [1420, 'DR. MAX'], [1730, 'UNCLE GARY']];
  ctx.save(); ctx.translate(0, 0);
  drawSofia(ctx, 200, F0 - 262 * 0.62, 0.62, { turn: 0.15, mouth: { smile: 0.8 }, armR: [150, -150], handR: 'open' });
  drawGus(ctx, 500, F0, 0.78, { face: 1, lids: 0.55, look: 0.3 });
  drawCrew(ctx, 830, F0 - 280 * 0.6, 0.6, { turn: -0.1, mouth: { smile: 0.8, open: 0.2 }, armR: [130, -140], handR: 'open' }, 'annaFA');
  drawCrew(ctx, 1110, F0 - 280 * 0.64, 0.64, { browL: -0.6, browR: -0.6, mouth: { smile: -0.4 }, armL: [-60, -40], armR: [60, -40], armsFront: true }, 'bob');
  drawCrew(ctx, 1420, F0 - 280 * 0.6, 0.6, { mouth: { smile: 1, open: 0.3 }, armL: [-150, -320], handL: 'open', turn: -0.1 }, 'maxVac');
  drawGus(ctx, 1700, F0, 0.84, { face: -1, tie: false, lids: 0.7, look: 0.2, neck: 0.15, squash: 0.97, hold: gary });
  ctx.restore();
  for (const [x, n] of cards) U.textOutlined(ctx, n, x, 1010, 46, '#FFFFFF', { olw: 10 });
  U.textOutlined(ctx, 'Episode 3 · cast', 960, 80, 58, '#FFD23F', { olw: 12 });
}

async function main() {
  const [mode, a, b] = process.argv.slice(2);
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  if (mode === 'lineup') { lineup(ctx); require('fs').writeFileSync(a, c.toBuffer('image/png')); return; }
  BG = B3.checkin();
  if (mode === 'still') {
    const ts = a.split(',').map(Number), sc = 0.5, S = createCanvas(W, H * sc * Math.ceil(ts.length / 2)), sx = S.getContext('2d');
    ts.forEach((t, i) => { ctx.setTransform(1, 0, 0, 1, 0, 0); frame(ctx, t); sx.drawImage(c, (i % 2) * W * sc / 1, Math.floor(i / 2) * H * sc, W * sc, H * sc); });
    require('fs').writeFileSync(b, S.toBuffer('image/png')); return;
  }
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < T * FPS; f++) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
main();
