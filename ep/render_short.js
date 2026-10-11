// Vertical Short renderer — re-renders scenes natively in 1080x1920 (9:16)
// Usage: node ep/render_short.js video <start> <end> <out.mp4>
//        node ep/render_short.js still <t1,t2,...> <out.png>
//        node ep/render_short.js one <t> <out.png>
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const { TL, lineAt, clamp, ease, lerp } = require('./engine');
const SCN = require('./scenes');
const U = require('../lib/ui');
const { paint, roundRect, OL } = require('../lib/draw');
const F = require('../lib/fonts');

// Vertical canvas
const VW = 1080, VH = 1920, FPS = TL.fps;
// Source (scene) canvas — same as original
const SW = 1920, SH = 1080;
// Crop strip: center of 1920 wide, 9:16 aspect
const CROP_W = Math.round(SH * 9 / 16); // 608px from 1080 height
const CROP_X = Math.round((SW - CROP_W) / 2); // 656

// Scene canvases (for transitions)
const cA = createCanvas(SW, SH), xA = cA.getContext('2d');
const cB = createCanvas(SW, SH), xB = cB.getContext('2d');
// Full scene canvas (before crop)
const cScene = createCanvas(SW, SH), xScene = cScene.getContext('2d');

// Vertical vignette
const vigV = createCanvas(VW, VH);
{
  const x = vigV.getContext('2d');
  const g = x.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VH * 0.7);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(40,20,10,0.28)');
  x.fillStyle = g;
  x.fillRect(0, 0, VW, VH);
}

// Transitions (same logic as render.js)
const TRANS = { wake: 'flash', getup: 'whip', teeth: 'zoom', shower: 'whip', quiz: 'iris', dress: 'flash', toast: 'whip', coffee: 'zoom', leave: 'whip', recap: 'fade', outro: 'whip' };
const TD = 0.2;

function drawScene(ctx, id, t) {
  ctx.save(); ctx.fillStyle = '#FFF6E6'; ctx.fillRect(0, 0, SW, SH);
  SCN[id].draw(ctx, t); ctx.restore();
}
function sceneAt(t) {
  let i = 0;
  for (let j = 0; j < TL.scenes.length; j++) if (t >= TL.scenes[j].t0) i = j;
  return i;
}

// Render one scene frame (no UI overlays) at 1920x1080 into cScene
function renderSceneFrame(t) {
  const ctx = xScene;
  const i = sceneAt(t), S = TL.scenes[i];
  let done = false;
  const next = TL.scenes[i + 1];
  const inStart = i > 0 && t < S.t0 + TD, inEnd = next && t > next.t0 - TD;

  if (inStart || inEnd) {
    const a = inStart ? TL.scenes[i - 1] : S, b = inStart ? S : next;
    const type = TRANS[b.id] || 'whip';
    const u = clamp((t - (b.t0 - TD)) / (2 * TD));
    drawScene(xA, a.id, Math.min(t, a.t1 - 0.001));
    drawScene(xB, b.id, Math.max(t, b.t0));
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SW, SH);

    if (type === 'whip') {
      const e = ease.inOut(u);
      for (let k = 0; k < 4; k++) {
        ctx.globalAlpha = k ? 0.25 : 1;
        ctx.drawImage(cA, -e * SW - k * 40 * Math.sin(u * Math.PI), 0);
        ctx.drawImage(cB, (1 - e) * SW - k * 40 * Math.sin(u * Math.PI), 0);
      }
      ctx.globalAlpha = 1;
      ctx.save(); ctx.globalAlpha = 0.5 * Math.sin(u * Math.PI); ctx.fillStyle = '#fff';
      for (let k = 0; k < 14; k++) ctx.fillRect(0, (k * 97) % SH, SW, 6 + (k % 3) * 4);
      ctx.restore();
    } else if (type === 'zoom') {
      if (u < 0.5) {
        const s = 1 + ease.in(u * 2) * 0.6;
        ctx.save(); ctx.translate(SW / 2, SH / 2); ctx.scale(s, s);
        ctx.drawImage(cA, -SW / 2, -SH / 2); ctx.restore();
      } else {
        const s = 1.4 - ease.out((u - 0.5) * 2) * 0.4;
        ctx.save(); ctx.translate(SW / 2, SH / 2); ctx.scale(s, s);
        ctx.drawImage(cB, -SW / 2, -SH / 2); ctx.restore();
      }
      ctx.fillStyle = `rgba(255,255,255,${0.7 * Math.sin(u * Math.PI)})`;
      ctx.fillRect(0, 0, SW, SH);
    } else if (type === 'iris') {
      ctx.drawImage(cA, 0, 0);
      ctx.save(); ctx.beginPath(); ctx.arc(SW / 2, SH / 2, ease.inOut(u) * 1150 + 1, 0, 7);
      ctx.clip(); ctx.drawImage(cB, 0, 0); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(SW / 2, SH / 2, ease.inOut(u) * 1150 + 1, 0, 7);
      ctx.lineWidth = 18; ctx.strokeStyle = '#3a221d'; ctx.stroke(); ctx.restore();
    } else if (type === 'flash') {
      ctx.drawImage(u < 0.5 ? cA : cB, 0, 0);
      ctx.fillStyle = `rgba(255,255,255,${Math.sin(u * Math.PI)})`;
      ctx.fillRect(0, 0, SW, SH);
    } else { // fade
      ctx.drawImage(cA, 0, 0);
      ctx.globalAlpha = ease.inOut(u); ctx.drawImage(cB, 0, 0); ctx.globalAlpha = 1;
    }
    done = true;
  }
  if (!done) drawScene(ctx, S.id, t);

  // Horizontal vignette on scene canvas
  const gH = ctx.createRadialGradient(SW / 2, SH / 2, SH * 0.45, SW / 2, SH / 2, SH * 1.05);
  gH.addColorStop(0, 'rgba(0,0,0,0)');
  gH.addColorStop(1, 'rgba(40,20,10,0.32)');
  ctx.fillStyle = gH;
  ctx.fillRect(0, 0, SW, SH);
}

// Vertical caption: words [{w,t0,t1}], rendered for 1080x1920
function verticalCaption(ctx, words, t, who) {
  if (!words || !words.length) return;
  const CX = VW / 2; // 540
  const Y = 1680; // well above bottom safe zone
  const FONT_SIZE = 52;
  const GAP = 18;
  const maxW = VW - 100; // 980px max line width

  ctx.save();
  ctx.font = `700 ${FONT_SIZE}px ${F.EN}`;

  // Wrap words into lines
  const lines = [[]]; let w = 0;
  for (const wd of words) {
    const ww = ctx.measureText(wd.w).width + GAP;
    if (w + ww > maxW && lines[lines.length - 1].length) { lines.push([]); w = 0; }
    lines[lines.length - 1].push({ ...wd, ww }); w += ww;
  }

  // Show only the current line (+ one context)
  let cur = 0;
  lines.forEach((ln, i) => { if (ln.length && t >= ln[0].t0 - 0.05) cur = i; });
  const show = lines.slice(Math.max(0, cur - (lines.length > 2 ? 0 : 1)), Math.max(0, cur - (lines.length > 2 ? 0 : 1)) + 2);

  const lh = 66, totalH = show.length * lh;
  const pad = 26;
  const bw = Math.min(VW - 40, Math.max(...show.map(l => l.reduce((a, b) => a + b.ww, 0))) + pad * 2);
  const by = Y - totalH / 2 - 18;

  // Background pill
  ctx.globalAlpha = 0.92;
  paint(ctx, c => roundRect(c, CX - bw / 2, by, bw, totalH + 28, 30),
    who === 'gus' ? '#2E6FD8' : '#FFFFFF', { lw: 6 });
  ctx.globalAlpha = 1;

  // Draw words with karaoke highlighting
  show.forEach((ln, i) => {
    const lw = ln.reduce((a, b) => a + b.ww, 0);
    let x0 = CX - lw / 2;
    const y = by + 14 + lh * i + 50;
    for (const wd of ln) {
      const active = t >= wd.t0 && t < wd.t1 + 0.08, past = t >= wd.t1;
      const k = active ? clamp((t - wd.t0) / 0.12) : 0;
      ctx.save();
      ctx.translate(x0 + (wd.ww - GAP) / 2, y - 20);
      const sc = 1 + 0.08 * Math.sin(k * Math.PI) + (active ? 0.03 : 0);
      ctx.scale(sc, sc);
      ctx.textAlign = 'center';
      ctx.fillStyle = who === 'gus'
        ? (active ? '#FFD23F' : '#FFFFFF')
        : active ? U.ORANGE : past ? OL : '#9C8A82';
      ctx.fillText(wd.w, 0, 20);
      ctx.restore();
      x0 += wd.ww;
    }
  });
  ctx.restore();
}

// Vertical vocab card: centered, scaled for 1080 width
function verticalCard(ctx, cd, k, out, t) {
  if (k <= 0 || out >= 1) return;
  const a = ease.back(clamp(k)), o = 1 - ease.in(clamp(out));
  const sc = 0.52 * a * o;
  if (sc < 0.01) return;
  ctx.save();
  ctx.translate(VW / 2, 260); // centered, upper area
  ctx.scale(sc + 0.0001, sc + 0.0001);
  ctx.rotate(-0.025 + Math.sin(t * 2) * 0.008);
  // Shadow
  ctx.save(); ctx.globalAlpha = 0.25;
  paint(ctx, c => roundRect(c, -440 + 14, -230 + 18, 880, 460, 46), '#000', { lw: 0 });
  ctx.restore();
  // Card body
  paint(ctx, c => roundRect(c, -440, -230, 880, 460, 46), '#FFFFFF', { lw: 8 });
  ctx.save(); ctx.beginPath(); roundRect(ctx, -440, -230, 880, 460, 46); ctx.clip();
  ctx.fillStyle = U.GREEN; ctx.fillRect(-440, -230, 880, 92); ctx.restore();
  const { line: drawLine } = require('../lib/draw');
  drawLine(ctx, [[-440, -138], [440, -138]], 8, OL);
  U.textOutlined(ctx, 'NEW PHRASE', -390, -165, 44, '#FFFFFF', { align: 'left', olw: 8 });
  U.icon(ctx, cd.icon, 370, -184, 0.85);
  U.textOutlined(ctx, cd.en, 0, -20, cd.en.length > 12 ? 92 : 112, U.ORANGE, { olw: 14 });
  ctx.font = `40px DejaVu Sans`; ctx.fillStyle = '#8A6A5C'; ctx.textAlign = 'center'; ctx.fillText(cd.ipa, 0, 40);
  ctx.font = `700 50px ${F.EN}`; ctx.fillStyle = OL; ctx.fillText('= ' + cd.def, 0, 120);
  if (cd.wrong) {
    const wk = clamp((k - 0.5) * 2);
    if (wk > 0) {
      ctx.save(); ctx.translate(250, 220); ctx.rotate(0.06); ctx.scale(ease.back(wk), ease.back(wk));
      paint(ctx, c => roundRect(c, -210, -46, 420, 92, 24), '#FFE3E3', { lw: 6 });
      ctx.font = `700 44px ${F.EN}`; ctx.fillStyle = U.RED; ctx.textAlign = 'center'; ctx.fillText(cd.wrong, 0, 16);
      const { line: drawLine2 } = require('../lib/draw');
      drawLine2(ctx, [[-150, 0], [170, 0]], 7, U.RED);
      ctx.restore();
    }
  }
  ctx.restore();
}

// Vertical "your turn" prompt: centered, sized for 1080 width
function verticalYourTurn(ctx, phrase, k, t) {
  if (k <= 0 || k >= 1) return;
  const inn = ease.back(clamp(k / 0.15)), out = 1 - ease.in(clamp((k - 0.9) / 0.1));
  const s = inn * out * 0.65;
  ctx.save();
  ctx.translate(VW / 2, VH / 2 - 100); // centered vertically
  ctx.scale(s, s);
  paint(ctx, c => roundRect(c, -420, -150, 840, 300, 50), U.ORANGE, { lw: 8 });
  U.textOutlined(ctx, 'YOUR TURN!', 40, -60, 64, '#FFFFFF', { olw: 12 });
  U.textOutlined(ctx, phrase, 40, 60, phrase.length > 14 ? 70 : 84, '#FFFFFF', { olw: 13 });
  // ring timer + mic
  ctx.save(); ctx.translate(-330, 0);
  paint(ctx, c => c.arc(0, 0, 66, 0, 7), '#FFFFFF', { lw: 7 });
  ctx.beginPath(); ctx.arc(0, 0, 54, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp((k - 0.1) / 0.8));
  ctx.lineWidth = 14; ctx.strokeStyle = U.GREEN; ctx.lineCap = 'round'; ctx.stroke();
  U.icon(ctx, 'mic', 0, 2, 0.8 + 0.08 * Math.sin(t * 14));
  ctx.restore();
  ctx.restore();
}

// Compose one vertical frame
function frame(ctx, t) {
  // 1. Render scene at 1920x1080 (no UI overlays)
  renderSceneFrame(t);

  // 2. Clear vertical canvas
  ctx.fillStyle = '#FFF6E6';
  ctx.fillRect(0, 0, VW, VH);

  // 3. Crop center strip from scene and scale to fill vertical canvas
  // Source: CROP_X, 0, CROP_W, SH (608 x 1080 from scene)
  // Dest: 0, 0, VW, VH (1080 x 1920)
  ctx.drawImage(cScene, CROP_X, 0, CROP_W, SH, 0, 0, VW, VH);

  // 4. Vertical vignette
  ctx.drawImage(vigV, 0, 0);

  // 5. Scene-specific vertical overlays
  // "MAYO?!" text for teeth scene (original is at x=1450, outside crop)
  const si = sceneAt(t), S = TL.scenes[si];
  if (S.id === 'teeth') {
    const MW_line = TL.lines.find(l => l.id === 'l09');
    const MW = MW_line && MW_line.words.find(w => /^mayo/i.test(w.w));
    if (MW) {
      const tasteEnd = S.marks.l09_end;
      const disgust = clamp((t - MW.t0 + 0.1) / 0.25) * (t < tasteEnd + 0.8 ? 1 : 0);
      const ecu = t > S.marks.taste && t < tasteEnd + 0.2;
      if (ecu && disgust > 0.5) {
        const shake = Math.sin(t * 40) * 3;
        ctx.save();
        ctx.translate(VW / 2 + 280 + shake, 280);
        ctx.rotate(0.12);
        U.textOutlined(ctx, 'MAYO?!', 0, 0, 100, '#FFF6D8', { olw: 18 });
        ctx.restore();
      }
    }
  }

  // 6. Vertical vocab card overlay (original is at x=1420, outside crop)
  const si2 = sceneAt(t), S2 = TL.scenes[si2];
  const cd = TL.cards[S2.id];
  if (cd && S2.marks.card !== undefined) {
    const kCard = (t - S2.marks.card) / 0.4;
    const tEnd = (S2.marks.turn ?? S2.marks.card + 5) + 2.4;
    const oCard = (t - tEnd + 0.3) / 0.3;
    verticalCard(ctx, cd, kCard, oCard, t);
  }

  // 7. Vertical "your turn" overlay (original at x=960, partially in crop but sized for 1920w)
  for (const tr of TL.turns) {
    if (t >= tr.t0 && t < tr.t1) {
      verticalYourTurn(ctx, tr.phrase, (t - tr.t0) / (tr.t1 - tr.t0), t);
    }
  }

  // 8. Vertical caption overlay
  const L = lineAt(t);
  if (L && !/^r\d/.test(L.id)) {
    verticalCaption(ctx, L.words, t, L.who);
  }

  // 9. Channel watermark (small, bottom-right)
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.font = `700 26px ${F.EN}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.lineJoin = 'round';
  ctx.strokeText('Sofia Easy English', VW - 30, VH - 50);
  ctx.fillText('Sofia Easy English', VW - 30, VH - 50);
  ctx.restore();
}

// Video output
async function video(a, b, out) {
  const c = createCanvas(VW, VH), ctx = c.getContext('2d');
  const ff = spawn('ffmpeg', [
    '-y', '-v', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba',
    '-s', `${VW}x${VH}`, '-r', String(FPS),
    '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p', out
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const f0 = Math.round(a * FPS), f1 = Math.round(b * FPS);
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, VW, VH).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 90 === 0) process.stderr.write(`[short] ${f - f0}/${f1 - f0} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}

function stills(ts, out) {
  const n = ts.length, cols = Math.min(4, n), rows = Math.ceil(n / cols), s = 0.2;
  const sheet = createCanvas(VW * s * cols, VH * s * rows), sx = sheet.getContext('2d');
  const c = createCanvas(VW, VH), ctx = c.getContext('2d');
  ts.forEach((t, i) => {
    frame(ctx, t);
    sx.drawImage(c, (i % cols) * VW * s, Math.floor(i / cols) * VH * s, VW * s, VH * s);
    sx.fillStyle = '#000'; sx.font = '20px sans-serif';
    sx.fillText(t.toFixed(1), (i % cols) * VW * s + 6, Math.floor(i / cols) * VH * s + 22);
  });
  require('fs').writeFileSync(out, sheet.toBuffer('image/png'));
}

const [mode, A, B, O] = process.argv.slice(2);
if (mode === 'video') video(+A, +B, O);
else if (mode === 'still') stills(A.split(',').map(Number), B);
else if (mode === 'one') {
  const c = createCanvas(VW, VH), x = c.getContext('2d');
  frame(x, +A); require('fs').writeFileSync(B, c.toBuffer('image/png'));
}
