// test_scene2.js — Comedy "Does it hurt here?" moment
// 4 distinct camera shots with hard cuts, ~9.5 seconds
// Shot 1: Medium two-shot — Dr. Max asks "Does it hurt here?", arm reaches toward Gus
// Shot 2: Close-up Gus — "AAAH! Yes!" overreaction, camera shake
// Shot 3: Close-up Dr. Max — pause, then "I didn't even touch you!" deadpan
// Shot 4: Wide reaction — Gus frozen, Sofia laughs, Dr. Max calm

const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
require('./lib/fonts');
const { drawSofia } = require('./lib/sofia');
const { drawGus } = require('./lib/gus');
const { drawDrMax, drawClipboard, drawPen } = require('./lib/drmax');
const { OL, paint, line, curve, roundRect, clamp, lerp, ease, seg, noise1 } = require('./lib/draw');

const W = 1920, H = 1080, FPS = 30;
const DUR = 9.5;

// ---- Character positions (world coords, bg is 2880×1920) ----
const FLOOR_Y = 1500;
const DR_X = 1300, DR_Y = FLOOR_Y - 280 * 0.68;   // Dr. Max right
const GUS_X = 750, GUS_Y = FLOOR_Y;                  // Gus center-left
const SOFIA_X = 380, SOFIA_Y = FLOOR_Y - 262 * 0.72; // Sofia far left

// ---- Shot timing (hard cuts) ----
const SHOT1_END = 2.6;   // Medium two-shot
const SHOT2_END = 4.6;   // Close-up Gus
const SHOT3_END = 7.2;   // Close-up Dr. Max
// Shot 4 runs to DUR

// ---- Speech timing (placeholder — no audio) ----
const DRMAX_LINE1_START = 0.6;   // "Does it hurt here?"
const DRMAX_LINE1_END = 1.8;
const GUS_LINE_START = 2.8;      // "AAAH! Yes!"
const GUS_LINE_END = 4.2;
const PAUSE_END = 5.8;           // comedy pause before punchline
const DRMAX_LINE2_START = 5.8;   // "I didn't even touch you!"
const DRMAX_LINE2_END = 7.0;

// ---- Doctor's office background ----
function drawOffice(ctx) {
  ctx.fillStyle = '#F0F5F0'; ctx.fillRect(0, 0, 2880, 1920);
  ctx.fillStyle = '#E6EDE8';
  for (let yy = 0; yy < 1920; yy += 60)
    for (let xx = 0; xx < 2880; xx += 60) {
      const o = ((yy / 60) % 2) * 30;
      ctx.save(); ctx.translate(xx + o, yy); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-4, -4, 8, 8); ctx.restore();
    }
  ctx.fillStyle = '#D8E2DA'; ctx.fillRect(0, 1000, 2880, 920);
  ctx.fillStyle = '#C5D0C8'; ctx.fillRect(0, 1000, 2880, 8);
  const floorY = 1420;
  ctx.fillStyle = '#E5DDD0'; ctx.fillRect(0, floorY, 2880, 500);
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 30; c++)
      if ((r + c) % 2) {
        ctx.fillStyle = '#D8CFC0';
        ctx.fillRect(c * 100, floorY + r * 80, 100, 80);
      }
  ctx.fillStyle = OL; ctx.fillRect(0, floorY - 2, 2880, 4);
  // Window
  const wx = 1600, wy = 340, ww = 360, wh = 440;
  paint(ctx, c => roundRect(c, wx - 16, wy - 16, ww + 32, wh + 32, 18), '#FFFFFF', { lw: 6 });
  ctx.save();
  ctx.beginPath(); roundRect(ctx, wx, wy, ww, wh, 8); ctx.clip();
  const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
  g.addColorStop(0, '#7EC8F5'); g.addColorStop(1, '#CDEBFF');
  ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
  ctx.beginPath(); ctx.arc(wx + ww * 0.7, wy + wh * 0.3, 50, 0, 7); ctx.fillStyle = '#FFE680'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.ellipse(wx + 100, wy + 200, 60, 22, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
  line(ctx, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 10, '#FFFFFF');
  line(ctx, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 10, '#FFFFFF');
  ctx.save(); ctx.beginPath(); roundRect(ctx, wx, wy, ww, wh, 8);
  ctx.lineWidth = 5; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
  // Medical cabinet
  paint(ctx, c => roundRect(c, 200, 380, 280, 500, 14), '#FFFFFF', { lw: 6 });
  line(ctx, [[340, 390], [340, 870]], 4, '#D0D8D4');
  for (const sy of [520, 660])
    paint(ctx, c => roundRect(c, 208, sy, 264, 8, 4), '#E8ECE8', { lw: 3 });
  for (const [bx, col, h] of [[240, '#5BB8F0', 80], [310, '#FF9EB1', 60], [380, '#8BD8A0', 70], [250, '#FFD54A', 65], [330, '#C8A0E0', 55], [410, '#FF9A2E', 50]]) {
    const sy = bx < 300 ? 440 : 600;
    paint(ctx, c => roundRect(c, bx - 20, sy - h, 40, h, 10), col, { lw: 4 });
    paint(ctx, c => roundRect(c, bx - 24, sy - h - 8, 48, 14, 6), '#fff', { lw: 3 });
  }
  for (const dx of [260, 410])
    paint(ctx, c => roundRect(c, dx - 5, 750, 10, 40, 5), '#C8D3D9', { lw: 3 });
  // Exam table
  paint(ctx, c => roundRect(c, 900, 1200, 500, 100, 16), '#A4D4E8', { shade: '#82B8D0', sx: 0, sy: -14, lw: 6 });
  paint(ctx, c => roundRect(c, 920, 1190, 460, 16, 4), '#FFFFFF', { lw: 3 });
  for (const lx of [950, 1350])
    paint(ctx, c => roundRect(c, lx - 12, 1300, 24, 120, 6), '#7A8A90', { lw: 4 });
  // Diploma
  paint(ctx, c => roundRect(c, 730, 420, 200, 160, 8), '#FFF8E0', { lw: 5 });
  paint(ctx, c => roundRect(c, 730, 420, 200, 30, 8), '#C9A27E', { lw: 4 });
  ctx.fillStyle = '#7A5C42'; ctx.font = '700 16px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('MEDICAL DIPLOMA', 830, 442);
  ctx.fillStyle = '#888'; ctx.font = '12px sans-serif';
  ctx.fillText('Dr. Max Henderson', 830, 530);
  // Medical cross poster
  paint(ctx, c => roundRect(c, 580, 440, 100, 100, 10), '#FFFFFF', { lw: 4 });
  ctx.fillStyle = '#E54848';
  ctx.fillRect(610, 460, 40, 60); ctx.fillRect(600, 475, 60, 30);
  // Plant
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.4;
    ctx.save(); ctx.translate(1800, 1350); ctx.rotate(a + Math.PI / 2);
    paint(ctx, c => { c.moveTo(0, 0); c.quadraticCurveTo(22, -50, 0, -110 - (i % 2) * 20); c.quadraticCurveTo(-22, -50, 0, 0); c.closePath(); }, i % 2 ? '#5FAE57' : '#4C9547', { lw: 4 });
    ctx.restore();
  }
  paint(ctx, c => { c.moveTo(1750, 1354); c.lineTo(1850, 1354); c.lineTo(1840, 1420); c.lineTo(1760, 1420); c.closePath(); }, '#C98B5B', { shade: '#A86F44', sx: 8, sy: 0, lw: 5 });
}

// ---- Idle life ----
function life(t, seed) {
  const p = 3.3 + (seed % 3) * 0.4;
  const u = ((t + seed * 1.37) % p);
  const blink = u < 0.07 ? u / 0.07 : u < 0.16 ? 1 - (u - 0.07) / 0.09 : 0;
  return { blink, bob: Math.sin(t * 2.2 + seed) * 3 };
}

// ---- Simple speech envelope (placeholder — no real audio) ----
function talkEnv(t, start, end) {
  if (t < start || t > end) return 0;
  const u = (t - start) / (end - start);
  // syllable-like pulsing
  return clamp(Math.sin(u * Math.PI) * 1.2) * (0.5 + 0.5 * Math.abs(Math.sin(t * 12)));
}

// ---- Camera: hard cuts between 4 shots ----
function getCamera(t) {
  if (t < SHOT1_END) {
    // Shot 1: Medium two-shot — Dr. Max and Gus facing each other
    // Frame centers between them, slightly closer to Dr. Max
    const reachProg = seg(t, 1.0, 2.2);
    return {
      cx: lerp(1020, 1000, reachProg),
      cy: lerp(1150, 1180, reachProg),
      z: lerp(1.5, 1.55, reachProg),
      r: 0,
      shake: 0,
    };
  }
  if (t < SHOT2_END) {
    // Shot 2: Close-up Gus — his reaction
    const shake = seg(t, 2.8, 3.2) * (1 - seg(t, 3.5, 4.2));
    return {
      cx: GUS_X + 30,
      cy: FLOOR_Y - 300,
      z: 2.6,
      r: 0,
      shake: shake * 8,
    };
  }
  if (t < SHOT3_END) {
    // Shot 3: Close-up Dr. Max — deadpan delivery
    const pushIn = seg(t, PAUSE_END, DRMAX_LINE2_END);
    return {
      cx: DR_X - 40,
      cy: lerp(FLOOR_Y - 340, FLOOR_Y - 360, pushIn),
      z: lerp(2.4, 2.55, pushIn),
      r: 0,
      shake: 0,
    };
  }
  // Shot 4: Wide reaction — all three characters
  return {
    cx: 850,
    cy: 1150,
    z: 1.15,
    r: 0,
    shake: 0,
  };
}

function applyCam(ctx, cam, t) {
  const { cx, cy, z, r, shake } = cam;
  const sx = shake ? noise1(t * 25) * shake : 0;
  const sy = shake ? noise1(t * 25 + 50) * shake : 0;
  ctx.translate(960 + sx, 540 + sy);
  ctx.scale(z * 0.72, z * 0.72);
  ctx.rotate(r || 0);
  ctx.translate(-cx, -cy);
}

// ---- Character poses ----
function drMaxPose(t) {
  const lf = life(t, 7);

  // Looking at Gus throughout (facing left)
  const turnToGus = clamp(t / 0.5) * -0.3;
  const lookAtGus = clamp(t / 0.5) * -0.5;

  // Reaching arm toward Gus (Shot 1: 1.0 - 2.5)
  const reachStart = seg(t, 0.8, 1.6);
  const reachHold = 1 - seg(t, 7.0, 7.5); // holds through shot 2 and 3, releases in shot 4

  // "Does it hurt here?" mouth (Shot 1)
  const talk1 = talkEnv(t, DRMAX_LINE1_START, DRMAX_LINE1_END);

  // Punchline delivery — slight amusement on face (Shot 3)
  const talk2 = talkEnv(t, DRMAX_LINE2_START, DRMAX_LINE2_END);
  const punchSmirk = seg(t, DRMAX_LINE2_END, DRMAX_LINE2_END + 0.3);

  // Shot 4: slight bemused look
  const shot4 = seg(t, SHOT3_END, SHOT3_END + 0.5);

  return {
    blink: lf.blink,
    bob: lf.bob,
    turn: turnToGus + shot4 * 0.15, // faces Gus, then slightly forward in shot 4
    tilt: 0,
    lean: 0,
    look: [lookAtGus + shot4 * 0.25, 0.1], // looking at Gus, slight down
    wide: talk1 * 0.1,
    browL: 0.15 + talk2 * 0.2 + punchSmirk * 0.35,
    browR: 0.15 + talk2 * 0.2 + punchSmirk * 0.35,
    surprise: 0,
    mouth: {
      open: talk1 * 0.45 + talk2 * 0.5,
      smile: 0.25 + punchSmirk * 0.3 + shot4 * 0.2,
      w: 1 + talk2 * 0.15,
    },
    // Left arm reaches toward Gus (extended left and slightly down)
    armL: reachStart > 0 ? [
      lerp(-130, -240, ease.out(reachStart) * reachHold),
      lerp(-50, -80, ease.out(reachStart) * reachHold)
    ] : null,
    armR: null,
    handL: reachStart > 0.3 ? 'open' : 'relax',
    handR: 'relax',
    armsFront: true, // arms in front so reaching gesture is visible
    clipboard: reachStart < 0.1, // puts down clipboard when reaching
  };
}

function gusPose(t) {
  // Shot 2: dramatic overreaction
  const preScream = seg(t, SHOT1_END, SHOT1_END + 0.15);
  const scream = seg(t, GUS_LINE_START, GUS_LINE_START + 0.1);
  const screamHold = 1 - seg(t, GUS_LINE_END, GUS_LINE_END + 0.5);
  const screamAmt = scream * screamHold;

  // Shot 4: frozen stiff
  const freeze = seg(t, SHOT3_END, SHOT3_END + 0.3);

  const talk = talkEnv(t, GUS_LINE_START, GUS_LINE_END);

  return {
    walking: false,
    walk: 0,
    lids: screamAmt > 0.1 ? lerp(0.55, 0, screamAmt) : freeze > 0 ? 0.7 : 0.55, // wide open on scream, extra deadpan when frozen
    honk: screamAmt * 0.9 + talk * 0.3,
    wing: screamAmt * 0.7,
    neck: lerp(0, -0.4, screamAmt), // pulls back
    look: lerp(0.4, -0.2, freeze), // looking at Dr. Max, then slowly forward when frozen
    squash: 1 - screamAmt * 0.08, // slight squash on reaction
    tie: true,
    face: 1,
  };
}

function sofiaPose(t) {
  const lf = life(t, 3);

  // Shot 4: laughing
  const laughStart = seg(t, SHOT3_END + 0.3, SHOT3_END + 0.6);
  const laughing = laughStart * (1 - seg(t, DUR - 0.5, DUR));
  const laughBob = laughing > 0 ? Math.sin(t * 14) * 5 * laughing : 0;

  return {
    blink: lf.blink,
    bob: lf.bob + laughBob,
    look: [0.4, 0], // watching the scene
    mouth: {
      smile: 0.3 + laughing * 0.5,
      open: laughing * 0.35,
    },
    brow: { l: 0.2 + laughing * 0.3, r: 0.2 + laughing * 0.3 },
    wide: laughing * 0.15,
    outfit: 'sweater',
    glasses: true,
  };
}

// ---- Vignette ----
const vigCanvas = createCanvas(W, H);
{ const x = vigCanvas.getContext('2d'); const g = x.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,10,0.32)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }

// ---- Pre-render background ----
const bgCanvas = createCanvas(2880, 1920);
drawOffice(bgCanvas.getContext('2d'));

// ---- Subtitle overlay ----
function drawSubtitle(ctx, text, t, start, end) {
  const fadeIn = seg(t, start, start + 0.15);
  const fadeOut = 1 - seg(t, end - 0.1, end);
  const alpha = fadeIn * fadeOut;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  // background bar
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, H - 120, W, 80);
  // text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 38px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H - 80);
  ctx.restore();
}

// ---- Main frame ----
function frame(ctx, t) {
  const cam = getCamera(t);
  ctx.save();
  ctx.fillStyle = '#F0F5F0'; ctx.fillRect(0, 0, W, H);
  applyCam(ctx, cam, t);

  // Background
  ctx.drawImage(bgCanvas, 0, 0, 2880, 1920);

  // Draw characters back-to-front (leftmost first)
  // Sofia (far left, background)
  const sp = sofiaPose(t);
  drawSofia(ctx, SOFIA_X, SOFIA_Y, 0.72, sp);

  // Gus (center-left)
  const gp = gusPose(t);
  drawGus(ctx, GUS_X, GUS_Y, 0.95, gp);

  // Dr. Max (right, closest to camera in most shots)
  const dp = drMaxPose(t);
  drawDrMax(ctx, DR_X, DR_Y, 0.68, dp);

  ctx.restore();

  // Vignette
  ctx.drawImage(vigCanvas, 0, 0);

  // Subtitles (temporary VO replacement)
  drawSubtitle(ctx, '"Does it hurt here?"', t, DRMAX_LINE1_START, DRMAX_LINE1_END + 0.3);
  drawSubtitle(ctx, '"AAAH! Yes!"', t, GUS_LINE_START, GUS_LINE_END);
  drawSubtitle(ctx, '"I didn\'t even touch you!"', t, DRMAX_LINE2_START, DRMAX_LINE2_END + 0.3);

  // Shot number indicator (top-left, subtle)
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#fff'; ctx.font = '600 20px sans-serif'; ctx.textAlign = 'left';
  const shotNum = t < SHOT1_END ? 1 : t < SHOT2_END ? 2 : t < SHOT3_END ? 3 : 4;
  const shotNames = ['', 'Medium Two-Shot', 'Close-Up: Gus', 'Close-Up: Dr. Max', 'Wide Reaction'];
  ctx.fillText(`Shot ${shotNum}: ${shotNames[shotNum]}`, 30, 36);
  ctx.restore();

  // Flash on hard cuts (1-frame white flash)
  const cutTimes = [SHOT1_END, SHOT2_END, SHOT3_END];
  for (const ct of cutTimes) {
    const flash = 1 - seg(t, ct, ct + 0.08);
    if (flash > 0) {
      ctx.save();
      ctx.globalAlpha = flash * 0.25;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }
}

// ---- Render ----
const mode = process.argv[2] || 'video';

if (mode === 'stills') {
  // Contact sheet: key moments from each shot
  const times = [1.2, 2.0, 3.2, 3.8, 5.5, 6.5, 7.8, 8.5];
  const labels = [
    'Shot 1: "Does it hurt?"',
    'Shot 1: Arm reaching',
    'Shot 2: Gus screams',
    'Shot 2: Reaction hold',
    'Shot 3: Pause...',
    'Shot 3: "Didn\'t touch you!"',
    'Shot 4: Wide reaction',
    'Shot 4: Sofia laughs',
  ];
  const cols = 4, rows = 2, s = 0.5;
  const sheet = createCanvas(W * s * cols, H * s * rows);
  const sx = sheet.getContext('2d');
  const c = createCanvas(W, H), cx = c.getContext('2d');
  times.forEach((t, i) => {
    cx.clearRect(0, 0, W, H);
    frame(cx, t);
    sx.drawImage(c, (i % cols) * W * s, Math.floor(i / cols) * H * s, W * s, H * s);
    sx.fillStyle = '#fff'; sx.font = 'bold 18px sans-serif';
    sx.strokeStyle = '#000'; sx.lineWidth = 4;
    const tx = (i % cols) * W * s + 10, ty = Math.floor(i / cols) * H * s + 24;
    sx.strokeText(`t=${t.toFixed(1)}s`, tx, ty);
    sx.fillText(`t=${t.toFixed(1)}s`, tx, ty);
    sx.strokeText(labels[i], tx, ty + 22);
    sx.fillText(labels[i], tx, ty + 22);
  });
  fs.writeFileSync('test_scene2_stills.png', sheet.toBuffer('image/png'));
  console.log('Saved test_scene2_stills.png');
} else {
  // Video
  (async () => {
    const out = 'test_scene2.mp4';
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
      if (f % 60 === 0) process.stderr.write(`[scene2] ${f}/${totalFrames} ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    const stat = fs.statSync(out);
    console.log(`Saved ${out} (${DUR}s, ${totalFrames} frames, ${(stat.size / 1024 / 1024).toFixed(1)}MB)`);
  })();
}
