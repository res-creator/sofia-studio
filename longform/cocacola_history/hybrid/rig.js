// Hybrid Figma + code puppet rig (reusable). Figma AI gives the ART (pixel-aligned expression heads + body parts on green screen, keyed);
// this rig gives the MOTION, all from the artist's own pixels — no vector features pasted on top:
//   face: per-region soft blends between aligned expression heads (upper face = brows+eyes, mouth zone), eyelids that WIPE down from the
//         closed-eyes head (a real lid travelling, partial lids for squints), gaze = iris content sliding inside the eye opening, brows
//         lifted/lowered by moving a feathered brow band; head tilt/nod/turn-shift with a soft neck tuck;
//   body: breathing torso, arms hung BEHIND the jacket (no visible joint), each arm split at the elbow into an upper + forearm piece with a
//         feathered overlap (smooth elbow bends), wrist rotation on the forearm, pose changes cross-faded only while the arm is moving.
// A character = one config (part files + measured points). See ./candler.config.js.
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// feathered ellipse / band masks (white = keep), cached per size
function ellMask(w, h, cx, cy, rx, ry, feather = 0.35) { const c = createCanvas(w, h), x = c.getContext('2d'); x.translate(cx, cy); x.scale(1, ry / rx);
  const g = x.createRadialGradient(0, 0, rx * (1 - feather), 0, 0, rx); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(-rx, -rx, 2 * rx, 2 * rx); return c; }
function multiEll(w, h, list, feather) { const c = createCanvas(w, h), x = c.getContext('2d'); for (const e of list) x.drawImage(ellMask(w, h, ...e, feather), 0, 0); return c; }
function masked(dst, src, mask, alpha = 1, dx = 0, dy = 0, tmp) { // draw src (shifted) through mask onto dst
  if (alpha <= 0.002) return; const t = tmp.getContext('2d'); t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, tmp.width, tmp.height);
  t.drawImage(src, dx, dy); t.globalCompositeOperation = 'destination-in'; t.drawImage(mask, 0, 0); t.globalCompositeOperation = 'source-over';
  dst.save(); dst.globalAlpha = alpha; dst.drawImage(tmp, 0, 0); dst.restore(); }

async function loadRig(cfg) {
  const R = { cfg, heads: {}, parts: {} };
  for (const [k, f] of Object.entries(cfg.heads)) R.heads[k] = await loadImage(f);
  const hw = R.heads.neutral.width, hh = R.heads.neutral.height; R.hw = hw; R.hh = hh;
  const F = cfg.face;
  R.mUpper = multiEll(hw, hh, F.eyes.map(([x, y]) => [x, y - 14, F.upperR[0], F.upperR[1]]), 0.45);       // brows + eyes zone
  R.mMouth = ellMask(hw, hh, F.mouth[0], F.mouth[1], F.mouthR[0], F.mouthR[1], 0.45);                   // moustache + mouth zone
  R.mEyeOpen = multiEll(hw, hh, F.eyes.map(([x, y]) => [x, y, F.eyeR[0], F.eyeR[1]]), 0.15);            // eye openings (for gaze)
  R.mBrow = multiEll(hw, hh, F.eyes.map(([x, y]) => [x, F.browY, F.browR[0], F.browR[1]]), 0.5);         // brow bands
  R.cA = createCanvas(hw, hh); R.cB = createCanvas(hw, hh); R.tmp = createCanvas(hw, hh);
  for (const [k, p] of Object.entries(cfg.parts)) R.parts[k] = await loadImage(p.file);
  // split every arm at its elbow into upper + forearm pieces with a feathered overlap
  R.arm = {};
  for (const [k, a] of Object.entries(cfg.arms)) { const im = R.parts[k], w = im.width, h = im.height, [ex, ey] = a.elbow, ov = a.overlap || 26;
    const up = createCanvas(w, h), ux = up.getContext('2d'); ux.drawImage(im, 0, 0); ux.globalCompositeOperation = 'destination-in'; ux.fillStyle = cutGrad(ux, a, ov, 1); ux.fillRect(0, 0, w, h);
    const lo = createCanvas(w, h), lx = lo.getContext('2d'); lx.drawImage(im, 0, 0); lx.globalCompositeOperation = 'destination-in'; lx.fillStyle = cutGrad(lx, a, ov, 0); lx.fillRect(0, 0, w, h);
    R.arm[k] = { up, lo, ...a }; }
  return R; }
function cutGrad(x, a, ov, upper) { // gradient across the elbow line, perpendicular to the upper-arm direction
  const [sx, sy] = a.shoulder, [ex, ey] = a.elbow, dx = ex - sx, dy = ey - sy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const g = x.createLinearGradient(ex - ux * ov, ey - uy * ov, ex + ux * ov, ey + uy * ov);
  if (upper) { g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.75, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); }
  else { g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.35, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,1)'); }
  return g; }

// ---------- face: build the head for this frame from the aligned heads ----------
// S: { up: {skeptical, surprised, smile}, mouth: {skeptical, smile, talk, surprised}, lid (0 open..1 closed), squint, gazeX, gazeY (-1..1), brow (+up/-down px) }
function head(R, S) { const A = R.cA.getContext('2d'), B = R.cB.getContext('2d'), F = R.cfg.face, H = R.heads, tmp = R.tmp;
  A.clearRect(0, 0, R.hw, R.hh); A.drawImage(H.neutral, 0, 0);
  for (const [k, w] of Object.entries(S.up || {})) masked(A, H[k], R.mUpper, clamp(w), 0, 0, tmp);
  for (const [k, w] of Object.entries(S.mouth || {})) masked(A, H[k], R.mMouth, clamp(w), 0, 0, tmp);
  // gaze: slide the eye content inside the openings
  if (S.gazeX || S.gazeY) { B.clearRect(0, 0, R.hw, R.hh); B.drawImage(R.cA, 0, 0); masked(A, R.cB, R.mEyeOpen, 1, (S.gazeX || 0) * F.gaze[0], (S.gazeY || 0) * F.gaze[1], tmp); }
  // brows: move the feathered brow band
  if (S.brow) { B.clearRect(0, 0, R.hw, R.hh); B.drawImage(R.cA, 0, 0); masked(A, R.cB, R.mBrow, 1, 0, -S.brow, tmp); }
  // eyelids: the closed-eyes head is revealed from the top of each eye down to the lid line (a lid that travels, not a fade)
  const lid = clamp(Math.max(S.lid || 0, S.squint || 0));
  if (lid > 0.01) { const t = tmp.getContext('2d'); t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, R.hw, R.hh); t.drawImage(H.blink, 0, 0); t.globalCompositeOperation = 'destination-in';
    const m = createCanvas(R.hw, R.hh), mx = m.getContext('2d');
    for (const [ex, ey] of F.eyes) { const top = ey - F.eyeR[1] - 6, bot = ey + F.eyeR[1] + 4, yl = top + (bot - top) * lid, g = mx.createLinearGradient(0, yl - 5, 0, yl + 3);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); mx.fillStyle = g; mx.save(); mx.beginPath(); mx.ellipse(ex, ey, F.eyeR[0] + 10, F.eyeR[1] + 12, 0, 0, 6.283); mx.clip(); mx.fillRect(ex - 60, top - 10, 120, yl - top + 14); mx.restore(); }
    t.drawImage(m, 0, 0); t.globalCompositeOperation = 'source-over'; A.drawImage(tmp, 0, 0); }
  return R.cA; }

// ---------- whole character ----------
// P: { x, y (neck in world), s (scale), breath, lift (shoulders px), tilt, nod, shift, face: S, arms: { L: {pose, a1, a2, wrist, mix:{pose, w}}, R: {...} } }
function draw(ctx, R, P) { const C = R.cfg;
  ctx.save(); ctx.translate(P.x, P.y - (P.lift || 0)); ctx.rotate(P.sway || 0); ctx.scale(P.s, P.s * (1 + (P.breath || 0)));
  const nk = C.torso.neck;
  // arms BEHIND the jacket: shoulder pivots hidden under the jacket's shoulders
  const arms = () => { for (const side of ['L', 'R']) { const a = P.arms[side]; drawArm(ctx, R, a.pose, side, a, 1 - (a.mix ? a.mix.w : 0), nk); if (a.mix && a.mix.w > 0) drawArm(ctx, R, a.mix.pose, side, { ...a, ...(a.mix.angles || {}) }, a.mix.w, nk); } };
  if (!C.armsInFront) arms(); ctx.drawImage(R.parts.torso, -nk[0], -nk[1]); if (C.armsInFront) arms();
  // head: tucked into the collar; tilt + nod + small sideways shift
  const hp = C.head, hc = head(R, P.face || {});
  ctx.save(); ctx.translate(P.shift || 0, (C.headDrop || 0) + (P.lift || 0) * 0.45); ctx.rotate(P.tilt || 0); ctx.scale(hp.s, hp.s * (1 - (P.nod || 0)));
  ctx.drawImage(hc, -hp.pivot[0], -hp.pivot[1]); ctx.restore();
  ctx.restore(); }
function drawArm(ctx, R, k, side, a, alpha, nk) { if (alpha <= 0.002) return; const A = R.arm[k], C = R.cfg, sk = C.torso[side === 'L' ? 'sL' : 'sR'];
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(sk[0] - nk[0], sk[1] - nk[1]); ctx.rotate(a.a1 || 0); ctx.translate(-A.shoulder[0], -A.shoulder[1]);
  ctx.drawImage(A.up, 0, 0);
  ctx.translate(A.elbow[0], A.elbow[1]); ctx.rotate(a.a2 || 0); ctx.translate(-A.elbow[0], -A.elbow[1]);
  if (a.wrist && A.wrist) { ctx.save(); } ctx.drawImage(A.lo, 0, 0); if (a.wrist && A.wrist) ctx.restore();
  ctx.restore(); }
module.exports = { loadRig, draw, head };
