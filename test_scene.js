// Visual test: Dr. Max meets Sofia & Gus — standalone scene (Episode 2 preview)
// Renders a ~6-second clip: greeting → Gus honks → Dr. Max surprised → settle
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
require('./lib/fonts');
const { drawSofia } = require('./lib/sofia');
const { drawGus } = require('./lib/gus');
const { drawDrMax, drawClipboard, drawPen } = require('./lib/drmax');
const { OL, paint, line, curve, roundRect, clamp, lerp, ease, noise1 } = require('./lib/draw');

const W = 1920, H = 1080, FPS = 30;
const DUR = 6.0; // seconds

// ---- simple doctor's office background (one-off, not cached) ----
function drawOffice(ctx) {
  // walls
  ctx.fillStyle = '#F0F5F0'; ctx.fillRect(0, 0, W * 2, H * 2);
  // subtle pattern
  ctx.fillStyle = '#E6EDE8';
  for (let yy = 0; yy < 1920; yy += 60)
    for (let xx = 0; xx < 2880; xx += 60) {
      const o = ((yy / 60) % 2) * 30;
      ctx.save(); ctx.translate(xx + o, yy); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-4, -4, 8, 8); ctx.restore();
    }
  // wainscot
  ctx.fillStyle = '#D8E2DA'; ctx.fillRect(0, 1000, 2880, 920);
  ctx.fillStyle = '#C5D0C8'; ctx.fillRect(0, 1000, 2880, 8);
  // floor
  const floorY = 1420;
  ctx.fillStyle = '#E5DDD0'; ctx.fillRect(0, floorY, 2880, 500);
  // checkerboard floor
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 30; c++)
      if ((r + c) % 2) {
        ctx.fillStyle = '#D8CFC0';
        ctx.fillRect(c * 100, floorY + r * 80, 100, 80);
      }
  ctx.fillStyle = OL; ctx.fillRect(0, floorY - 2, 2880, 4);
  // window
  const wx = 1300, wy = 340, ww = 360, wh = 440;
  paint(ctx, c => roundRect(c, wx - 16, wy - 16, ww + 32, wh + 32, 18), '#FFFFFF', { lw: 6 });
  ctx.save();
  ctx.beginPath(); roundRect(ctx, wx, wy, ww, wh, 8); ctx.clip();
  const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
  g.addColorStop(0, '#7EC8F5'); g.addColorStop(1, '#CDEBFF');
  ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
  // sun
  ctx.beginPath(); ctx.arc(wx + ww * 0.7, wy + wh * 0.3, 50, 0, 7); ctx.fillStyle = '#FFE680'; ctx.fill();
  // clouds
  ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.ellipse(wx + 100, wy + 200, 60, 22, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(wx + 140, wy + 190, 40, 26, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
  // window cross
  line(ctx, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 10, '#FFFFFF');
  line(ctx, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 10, '#FFFFFF');
  ctx.save(); ctx.beginPath(); roundRect(ctx, wx, wy, ww, wh, 8);
  ctx.lineWidth = 5; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
  // medical cabinet (left wall)
  paint(ctx, c => roundRect(c, 200, 380, 280, 500, 14), '#FFFFFF', { lw: 6 });
  line(ctx, [[340, 390], [340, 870]], 4, '#D0D8D4');
  // shelf lines
  for (const sy of [520, 660]) {
    paint(ctx, c => roundRect(c, 208, sy, 264, 8, 4), '#E8ECE8', { lw: 3 });
  }
  // bottles/jars on shelves
  for (const [bx, col, h] of [[240, '#5BB8F0', 80], [310, '#FF9EB1', 60], [380, '#8BD8A0', 70], [250, '#FFD54A', 65], [330, '#C8A0E0', 55], [410, '#FF9A2E', 50]]) {
    const sy = bx < 300 ? 440 : 600;
    paint(ctx, c => roundRect(c, bx - 20, sy - h, 40, h, 10), col, { lw: 4 });
    paint(ctx, c => roundRect(c, bx - 24, sy - h - 8, 48, 14, 6), '#fff', { lw: 3 });
  }
  // cabinet handles
  for (const dx of [260, 410])
    paint(ctx, c => roundRect(c, dx - 5, 750, 10, 40, 5), '#C8D3D9', { lw: 3 });
  // examination table (center-right)
  paint(ctx, c => roundRect(c, 900, 1200, 500, 100, 16), '#A4D4E8', { shade: '#82B8D0', sx: 0, sy: -14, lw: 6 });
  // table paper roll
  paint(ctx, c => roundRect(c, 920, 1190, 460, 16, 4), '#FFFFFF', { lw: 3 });
  // table legs
  for (const lx of [950, 1350]) {
    paint(ctx, c => roundRect(c, lx - 12, 1300, 24, 120, 6), '#7A8A90', { lw: 4 });
  }
  // diploma/certificate on wall
  paint(ctx, c => roundRect(c, 730, 420, 200, 160, 8), '#FFF8E0', { lw: 5 });
  paint(ctx, c => roundRect(c, 730, 420, 200, 30, 8), '#C9A27E', { lw: 4 });
  ctx.fillStyle = '#7A5C42'; ctx.font = '700 16px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('MEDICAL DIPLOMA', 830, 442);
  ctx.fillStyle = '#888'; ctx.font = '12px sans-serif';
  ctx.fillText('Dr. Max Henderson', 830, 530);
  ctx.fillText('General Practice', 830, 550);
  // medical cross poster
  paint(ctx, c => roundRect(c, 580, 440, 100, 100, 10), '#FFFFFF', { lw: 4 });
  ctx.fillStyle = '#E54848';
  ctx.fillRect(610, 460, 40, 60); ctx.fillRect(600, 475, 60, 30);
  // potted plant
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.4;
    ctx.save(); ctx.translate(1800, 1350); ctx.rotate(a + Math.PI / 2);
    paint(ctx, c => { c.moveTo(0, 0); c.quadraticCurveTo(22, -50, 0, -110 - (i % 2) * 20); c.quadraticCurveTo(-22, -50, 0, 0); c.closePath(); }, i % 2 ? '#5FAE57' : '#4C9547', { lw: 4 });
    ctx.restore();
  }
  paint(ctx, c => { c.moveTo(1750, 1354); c.lineTo(1850, 1354); c.lineTo(1840, 1420); c.lineTo(1760, 1420); c.closePath(); }, '#C98B5B', { shade: '#A86F44', sx: 8, sy: 0, lw: 5 });
}

// ---- Idle life (blink + breathing bob) ----
function life(t, seed) {
  const p = 3.3 + (seed % 3) * 0.4;
  const u = ((t + seed * 1.37) % p);
  const blink = u < 0.07 ? u / 0.07 : u < 0.16 ? 1 - (u - 0.07) / 0.09 : 0;
  return { blink, bob: Math.sin(t * 2.2 + seed) * 3 };
}

// ---- Camera ----
function cam(keys, t) {
  if (t <= keys[0][0]) return keys[0].slice(1, 5);
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const a = keys[i - 1], b = keys[i];
      const ef = ease[b[5] || 'inOut'] || ease.inOut;
      if (b[5] === 'cut') return a.slice(1, 5);
      const u = ef((t - a[0]) / (b[0] - a[0]));
      return [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u), lerp(a[4] || 0, b[4] || 0, u)];
    }
  }
  return keys[keys.length - 1].slice(1, 5);
}
function applyCam(ctx, c, shake, t) {
  const [cx, cy, z, r] = c;
  const sx = shake ? noise1(t * 25) * shake : 0, sy = shake ? noise1(t * 25 + 50) * shake : 0;
  ctx.translate(960 + sx, 540 + sy); ctx.scale(z * 0.72, z * 0.72); ctx.rotate(r || 0); ctx.translate(-cx, -cy);
}

// ---- Vignette ----
const vigCanvas = createCanvas(W, H);
{ const x = vigCanvas.getContext('2d'); const g = x.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,10,0.32)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }

// ---- Pre-render background ----
const bgCanvas = createCanvas(2880, 1920);
drawOffice(bgCanvas.getContext('2d'));

// ---- Animation timeline ----
// Story beats:
// 0.0 - 1.5s : Dr. Max greets Sofia warmly
// 1.5 - 2.5s : Gus waddles in from left
// 2.5 - 3.0s : Gus HONKS
// 3.0 - 4.5s : Dr. Max surprised reaction (brows up, mouth open, wide eyes)
// 4.5 - 6.0s : Dr. Max settles to amused, Sofia giggles

const FLOOR_Y = 1500;

function drMaxPose(t) {
  const lf = life(t, 7);
  // Greeting phase: 0 - 1.5
  const greet = clamp(t / 0.4);
  const greetOut = clamp((t - 1.2) / 0.3);
  // Honk shock: 3.0 - 4.5
  const shock = clamp((t - 3.0) / 0.15);
  const shockPeak = clamp(1 - (t - 3.2) / 1.0);
  const settle = clamp((t - 4.0) / 1.0);
  // Surprise: raised brows + open mouth + wide eyes (distinct from greeting)
  const surpriseAmt = shock * shockPeak;
  return {
    blink: Math.max(lf.blink, 0),
    bob: lf.bob,
    // Head: slight recoil on surprise
    lean: surpriseAmt * 0.08,
    tilt: surpriseAmt * -0.04,
    // Greeting smile, then surprise open mouth, then settle amused
    mouth: {
      smile: lerp(0.3, 0.8, greet * (1 - greetOut)) * (1 - shock) + settle * 0.4,
      open: surpriseAmt * 0.65 + greet * (1 - greetOut) * 0.35,
      w: 1 + surpriseAmt * 0.2,
    },
    // Eyes: greeting has mild wide, surprise has strong wide + negative blink
    wide: greet * (1 - greetOut) * 0.2 + surpriseAmt * 0.5,
    // Brows: greeting friendly, surprise very high
    browL: lerp(0.3, 0.15, greetOut) * (1 - shock) + surpriseAmt * 1.0,
    browR: lerp(0.3, 0.15, greetOut) * (1 - shock) + surpriseAmt * 1.0,
    surprise: surpriseAmt,
    look: [lerp(-0.3, 0, settle), 0],
    // Arms: greeting wave, then clipboard; surprise → arms out
    armL: surpriseAmt > 0.1
      ? [lerp(-110, -160, surpriseAmt), lerp(-50, -240, surpriseAmt)]
      : greet * (1 - greetOut) > 0.1
        ? [-180, lerp(-50, -380, greet * (1 - greetOut))]
        : null,
    armR: surpriseAmt > 0.1
      ? [lerp(110, 150, surpriseAmt), lerp(-50, -180, surpriseAmt)]
      : null,
    handL: surpriseAmt > 0.1 ? 'open' : greet * (1 - greetOut) > 0.1 ? 'open' : 'relax',
    handR: surpriseAmt > 0.1 ? 'open' : 'relax',
    clipboard: surpriseAmt < 0.1,
  };
}

function sofiaPose(t) {
  const lf = life(t, 3);
  const greet = clamp((t - 0.3) / 0.4);
  const giggle = clamp((t - 3.5) / 0.3) * clamp(1 - (t - 5.2) / 0.8);
  return {
    blink: Math.max(lf.blink, 0),
    bob: lf.bob + giggle * Math.sin(t * 14) * 4,
    mouth: { smile: 0.5 + greet * 0.3 + giggle * 0.4, open: giggle * 0.3 },
    look: [0.2, 0],
    wide: greet * 0.15,
    brow: { l: 0.2 + giggle * 0.3, r: 0.2 + giggle * 0.3 },
    armL: greet > 0.1 ? [-100, lerp(-40, -300, clamp(greet * 2) * clamp(1 - (t - 1.0) / 0.5))] : null,
    handL: greet > 0.1 ? 'open' : 'mitten',
    outfit: 'sweater', glasses: true,
  };
}

function gusPose(t) {
  const enter = clamp((t - 1.5) / 1.0); // walks in 1.5-2.5
  const honk = clamp((t - 2.6) / 0.12);
  const honkHold = clamp(1 - (t - 2.8) / 0.6);
  const honkAmt = honk * honkHold;
  return {
    walking: enter < 1,
    walk: t * 2.2,
    lids: honkAmt > 0 ? 0.1 : 0.55,
    honk: honkAmt,
    wing: honkAmt * 0.7,
    look: lerp(0.5, -0.3, clamp((t - 3.0) / 0.5)),
    tie: true,
    enter, // for position calculation
  };
}

// Camera keyframes: [time, cx, cy, zoom, rotation, easing]
const CAM_KEYS = [
  [0.0,  1050, 1100, 1.7, 0],        // Medium shot: Dr. Max and Sofia
  [1.3,  1050, 1100, 1.6, 0],        // Slight pull out as Gus enters
  [1.5,  850,  1150, 1.3, 0],        // Wider to include Gus entering
  [2.5,  850,  1150, 1.3, 0],        // Hold for honk
  [2.7,  950,  1050, 1.85, 0, 'out'], // Push in on Dr. Max face for reaction
  [3.8,  900,  1100, 1.5, 0],        // Pull back to see all three
  [5.5,  900,  1100, 1.55, 0],       // Gentle drift
];

function frame(ctx, t) {
  const C = cam(CAM_KEYS, t);
  ctx.save();
  ctx.fillStyle = '#F0F5F0'; ctx.fillRect(0, 0, W, H);
  applyCam(ctx, C, t > 2.6 && t < 3.2 ? 5 : 0, t);

  // Background
  ctx.drawImage(bgCanvas, 0, 0, 2880, 1920);

  // Characters — back to front by position (Gus leftmost, Sofia center, Dr. Max right)
  const gp = gusPose(t);
  const gusX = lerp(-200, 550, ease.out(gp.enter));
  if (gp.enter > 0.02) {
    drawGus(ctx, gusX, FLOOR_Y, 0.95, gp, t);
  }

  // Sofia at center
  const sofiaP = sofiaPose(t);
  drawSofia(ctx, 850, FLOOR_Y - 262 * 0.72, 0.72, sofiaP);

  // Dr. Max on the right
  const drP = drMaxPose(t);
  drawDrMax(ctx, 1250, FLOOR_Y - 280 * 0.68, 0.68, drP);

  ctx.restore();
  // Vignette
  ctx.drawImage(vigCanvas, 0, 0);

  // Scene label
  ctx.save();
  ctx.globalAlpha = clamp(1 - t / 0.5) + clamp((t - 0.5) / 0.3) * 0.0; // fade in start
  if (t < 1.5) {
    ctx.globalAlpha = clamp(t / 0.3) * clamp((1.5 - t) / 0.3);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, H - 80, W, 80);
    ctx.fillStyle = '#fff'; ctx.font = '700 28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Episode 2 — Scene Test: Dr. Max meets Sofia & Gus', W / 2, H - 35);
  }
  ctx.restore();
}

// ---- Render ----
const mode = process.argv[2] || 'video';

if (mode === 'stills') {
  // Contact sheet: key moments
  const times = [0.5, 1.8, 2.7, 3.1, 3.8, 5.0];
  const cols = 3, rows = 2, s = 0.5;
  const sheet = createCanvas(W * s * cols, H * s * rows);
  const sx = sheet.getContext('2d');
  const c = createCanvas(W, H), cx = c.getContext('2d');
  times.forEach((t, i) => {
    cx.clearRect(0, 0, W, H);
    frame(cx, t);
    sx.drawImage(c, (i % cols) * W * s, Math.floor(i / cols) * H * s, W * s, H * s);
    sx.fillStyle = '#fff'; sx.font = 'bold 22px sans-serif';
    sx.strokeStyle = '#000'; sx.lineWidth = 4;
    const tx = (i % cols) * W * s + 10, ty = Math.floor(i / cols) * H * s + 28;
    sx.strokeText(`t=${t.toFixed(1)}s`, tx, ty);
    sx.fillText(`t=${t.toFixed(1)}s`, tx, ty);
    // Beat label
    const labels = ['Greeting', 'Gus enters', 'HONK!', 'Dr. Max surprised', 'All three', 'Settled'];
    sx.strokeText(labels[i], tx, ty + 26);
    sx.fillText(labels[i], tx, ty + 26);
  });
  fs.writeFileSync('test_scene_stills.png', sheet.toBuffer('image/png'));
  console.log('Saved test_scene_stills.png');
} else {
  // Video
  (async () => {
    const out = 'test_scene.mp4';
    const c = createCanvas(W, H), ctx = c.getContext('2d');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba',
      '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    const totalFrames = Math.round(DUR * FPS);
    const t0 = Date.now();
    for (let f = 0; f < totalFrames; f++) {
      const t = f / FPS;
      ctx.clearRect(0, 0, W, H);
      frame(ctx, t);
      const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 30 === 0) process.stderr.write(`[scene-test] ${f}/${totalFrames} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log(`Saved ${out} (${DUR}s, ${totalFrames} frames)`);
  })();
}
