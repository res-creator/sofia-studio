// Phase 2 Demo — 25-second video using the universal animation system
// Sofia: neutral → lookAt Gus → wave → think → scratchHead → surprise → point → shrug → neutral
// Gus reacts. All through new gesture/blend/layer system.
'use strict';
require('./lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const { drawSofia } = require('./lib/sofia');
const { drawGus } = require('./lib/gus');
const BG = require('./lib/bg');
const { clamp, lerp, ease } = require('./lib/draw');

// Animation system modules
const { deepMerge, lerpPose, pose } = require('./lib/anim/poses');
const { blend, idleLayer } = require('./lib/anim/blend');
const { wave, point, think, scratchHead, shrug, lookAt, nod } = require('./lib/anim/gestures');
const { applyGestureZOrder } = require('./lib/anim/layers');
const { validatePose } = require('./lib/anim/validate');

const W = 1920, H = 1080, FPS = 30, DUR = 25;

// Cache background
let kitchenBg;
function bg() { return (kitchenBg = kitchenBg || BG.kitchen()); }

// Camera
function applyCam(ctx, cx, cy, z) {
  ctx.translate(960, 540);
  ctx.scale(z * 0.72, z * 0.72);
  ctx.translate(-cx, -cy);
}

// World coordinates
const SOFIA_X = 620, FLOOR_Y = 1500, SOFIA_S = 0.66;
const GUS_X = 1100;

// ============ SOFIA ANIMATION via new system ============
// Timeline (seconds):
//  0-2    neutral
//  2-4    lookAt Gus
//  4-6.5  wave at Gus
//  6.5-9  think
//  9-11.5 scratchHead
// 11.5-14 surprise (expression only)
// 14-16.5 point
// 16.5-19 shrug
// 19-22   nod + settle
// 22-25   neutral

function sofiaAt(t) {
  const idle = idleLayer(t, 42);

  // Base expression layer (priority 0)
  const basePose = {
    look: [0, 0],
    mouth: { open: 0, smile: 0.5 },
    glasses: true,
    outfit: 'sweater',
  };

  // Collect gesture results
  const gestureResults = [];

  // --- lookAt Gus (t: 2-4) ---
  const la = lookAt(t, { start: 2, duration: 2, direction: [1.0, 0.1], intensity: 1.0 });
  if (la) gestureResults.push(la);

  // --- wave (t: 4-6.5) ---
  const wv = wave(t, { start: 4, duration: 2.5, side: -1, intensity: 1.0 });
  if (wv) gestureResults.push(wv);

  // --- think (t: 6.5-9) ---
  const th = think(t, { start: 6.5, duration: 2.5, side: 1, intensity: 1.0 });
  if (th) gestureResults.push(th);

  // --- scratchHead (t: 9-11.5) ---
  const sc = scratchHead(t, { start: 9, duration: 2.5, side: 1, intensity: 1.0 });
  if (sc) gestureResults.push(sc);

  // --- point (t: 14-16.5) ---
  const pt = point(t, { start: 14, duration: 2.5, side: 1, intensity: 1.0 });
  if (pt) gestureResults.push(pt);

  // --- shrug (t: 16.5-19) ---
  const sh = shrug(t, { start: 16.5, duration: 2.5, intensity: 1.0 });
  if (sh) gestureResults.push(sh);

  // --- nod (t: 19-20.5) to settle ---
  const nd = nod(t, { start: 19, duration: 1.5, intensity: 0.7, count: 2 });
  if (nd) gestureResults.push(nd);

  // --- Surprise expression (t: 11.5-14) — pure expression layer, no gesture ---
  let expressionLayer = null;
  if (t >= 11.5 && t <= 14) {
    const env = t < 12 ? ease.inOut(clamp((t - 11.5) / 0.5)) :
                t > 13.3 ? ease.inOut(clamp((14 - t) / 0.7)) : 1;
    expressionLayer = {
      pose: {
        wide: 0.7 * env,
        mouth: { open: 0.5 * env, smile: 0.1, o: 0.4 * env },
        brow: { l: 0.7 * env, r: 0.7 * env },
        look: [lerp(0, 0.3, env), lerp(0, -0.3, env)],
        bob: -12 * env, // slight jump back
      },
      priority: 2,
      mask: ['head', 'face', 'body'],
    };
  }

  // --- lookAt Gus during wave (4-6.5) ---
  const laWave = lookAt(t, { start: 4, duration: 2.5, direction: [1.0, 0], intensity: 0.8 });
  if (laWave && !la) gestureResults.push(laWave); // don't double-add if lookAt(2-4) still active

  // --- Build blend layers ---
  const layers = [
    { pose: basePose, priority: 0, weight: 1 },
    idle,
  ];

  for (const gr of gestureResults) {
    layers.push({ pose: gr.pose, priority: gr.priority || 1, mask: gr.mask, weight: 1 });
  }
  if (expressionLayer) layers.push(expressionLayer);

  // Blend all layers
  let finalPose = blend(layers);

  // Apply z-order via layer rules
  finalPose = applyGestureZOrder(finalPose, gestureResults);

  return finalPose;
}

// ============ GUS REACTIONS ============
function gusAt(t) {
  const base = { face: -1, lids: 0.55, squash: 1 };

  // React to Sofia looking (2-4s): slight awareness
  if (t >= 2.5 && t < 4) {
    const p = ease.inOut(clamp((t - 2.5) / 0.5));
    return { ...base, lids: lerp(0.55, 0.3, p), neck: lerp(0, 0.15, p) };
  }

  // React to wave (4-6.5s): excited, flap wing
  if (t >= 4 && t < 7) {
    const p = ease.inOut(clamp((t - 4) / 0.5));
    const waveOsc = Math.sin((t - 4) * 5) * 0.3;
    return {
      ...base,
      lids: lerp(0.55, 0.1, p),
      wing: clamp(waveOsc + 0.3) * p,
      neck: lerp(0, 0.3, p),
      honk: (t > 5.0 && t < 5.6) ? 0.6 : 0,
    };
  }

  // During think (6.5-9): watches curiously
  if (t >= 7 && t < 9.5) {
    const p = t < 7.5 ? ease.inOut(clamp((t - 7) / 0.5)) :
              t > 9 ? ease.inOut(clamp((9.5 - t) / 0.5)) : 1;
    return { ...base, lids: lerp(0.55, 0.25, p), neck: lerp(0, 0.2 + Math.sin(t * 2) * 0.05, p) };
  }

  // During scratchHead (9-11.5): tilts head
  if (t >= 9.5 && t < 12) {
    const p = t < 10 ? ease.inOut(clamp((t - 9.5) / 0.5)) :
              t > 11.5 ? ease.inOut(clamp((12 - t) / 0.5)) : 1;
    return { ...base, lids: lerp(0.55, 0.35, p), neck: lerp(0, -0.2, p) };
  }

  // Surprise reaction (11.5-14): startled
  if (t >= 12 && t < 14.5) {
    const p = t < 12.5 ? ease.inOut(clamp((t - 12) / 0.5)) :
              t > 14 ? ease.inOut(clamp((14.5 - t) / 0.5)) : 1;
    return {
      ...base,
      lids: lerp(0.55, 0, p),
      squash: lerp(1, 1.06, p),
      neck: lerp(0, 0.35, p),
      honk: (t > 12.2 && t < 12.8) ? 0.4 : 0,
    };
  }

  // During point (14-16.5): looks in direction
  if (t >= 14.5 && t < 17) {
    const p = t < 15 ? ease.inOut(clamp((t - 14.5) / 0.5)) :
              t > 16.5 ? ease.inOut(clamp((17 - t) / 0.5)) : 1;
    return { ...base, lids: lerp(0.55, 0.2, p), neck: lerp(0, 0.25, p) };
  }

  // During shrug (16.5-19): amused
  if (t >= 17 && t < 19.5) {
    const p = t < 17.5 ? ease.inOut(clamp((t - 17) / 0.5)) :
              t > 19 ? ease.inOut(clamp((19.5 - t) / 0.5)) : 1;
    const osc = Math.sin((t - 17) * 4) * 0.15;
    return { ...base, lids: lerp(0.55, 0.15, p), wing: osc * p, honk: (t > 18 && t < 18.4) ? 0.3 : 0 };
  }

  // Settle back
  if (t >= 19.5 && t < 21) {
    const p = ease.inOut(clamp((t - 19.5) / 1.5));
    return { ...base, lids: lerp(0.15, 0.55, p) };
  }

  return base;
}

// Vignette
const vigC = createCanvas(W, H);
{ const x = vigC.getContext('2d'); const g = x.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,10,0.32)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }

// Phase labels for debug overlay
function phaseLabel(t) {
  if (t < 2) return 'Neutral';
  if (t < 4) return 'Look at Gus';
  if (t < 6.5) return 'Wave';
  if (t < 9) return 'Think';
  if (t < 11.5) return 'Scratch Head';
  if (t < 14) return 'Surprise!';
  if (t < 16.5) return 'Point';
  if (t < 19) return 'Shrug';
  if (t < 22) return 'Settle';
  return 'Neutral';
}

// Render frame
function frame(ctx, t) {
  ctx.fillStyle = '#FFF6E6';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  applyCam(ctx, 750, 1100, 1.2);
  ctx.drawImage(bg(), BG.X0, 0, BG.WW, 1920);

  // Sofia
  const sp = sofiaAt(t);
  drawSofia(ctx, SOFIA_X, FLOOR_Y - 262 * SOFIA_S, SOFIA_S, sp);

  // Gus
  const gp = gusAt(t);
  drawGus(ctx, GUS_X, FLOOR_Y, 0.95, gp);

  ctx.restore();

  // Vignette
  ctx.drawImage(vigC, 0, 0);

  // Debug overlay
  ctx.save();
  ctx.font = '600 28px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(`${t.toFixed(1)}s — ${phaseLabel(t)}`, 30, H - 30);
  ctx.restore();
}

// --- Render video ---
async function render(out) {
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  const ff = spawn('ffmpeg', [
    '-y', '-v', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba',
    '-s', `${W}x${H}`, '-r', String(FPS),
    '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p', out
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const totalFrames = DUR * FPS;
  const t0 = Date.now();
  for (let f = 0; f < totalFrames; f++) {
    frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 90 === 0) process.stderr.write(`[phase2_demo] ${f}/${totalFrames} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('done:', out);
}

// --- Stills mode ---
function stills(outPath) {
  const times = [0.5, 3.0, 5.0, 7.5, 10.0, 12.5, 15.0, 17.5, 20.0, 23.0];
  const cols = 5, rows = Math.ceil(times.length / cols), s = 0.25;
  const sheet = createCanvas(W * s * cols, H * s * rows), sx = sheet.getContext('2d');
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  times.forEach((t, i) => {
    frame(ctx, t);
    sx.drawImage(c, (i % cols) * W * s, Math.floor(i / cols) * H * s, W * s, H * s);
    sx.fillStyle = '#fff';
    sx.font = '700 20px sans-serif';
    sx.fillText(`${t.toFixed(1)}s — ${phaseLabel(t)}`, (i % cols) * W * s + 6, Math.floor(i / cols) * H * s + 22);
  });
  fs.writeFileSync(outPath, sheet.toBuffer('image/png'));
  console.log('stills:', outPath);
}

// --- Validation mode ---
function validate() {
  const { validateSequence, report } = require('./lib/anim/validate');
  const frames = [];
  for (let f = 0; f < DUR * FPS; f++) {
    const t = f / FPS;
    frames.push({ t, pose: sofiaAt(t) });
  }
  const results = validateSequence(frames, {
    maxVelocity: 2500,
    checkContacts: [
      { name: 'temple', side: 1 },
      { name: 'chin', side: 1 },
    ],
  });
  console.log(report(results));
}

const mode = process.argv[2] || 'video';
const outArg = process.argv[3];
if (mode === 'stills') stills(outArg || 'out/phase2_demo_stills.png');
else if (mode === 'validate') validate();
else render(outArg || 'out/phase2_demo.mp4');
