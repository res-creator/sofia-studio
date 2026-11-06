// Motion layer for the v3.1 film: After-Effects-style editing done in code on top of the shots.
//  - every shot (and every internal "beat" where a shot switches its picture) becomes a unit;
//  - units are joined by transitions: zoom-through, whip pan with motion blur, push, light-leak, iris, RGB glitch (dark scenes);
//  - each unit gets a slow camera move (push-in / pull-out, alternating) and a punch-in + shake on impact sounds;
//  - credits are drawn after the camera move (never cropped).
// compose(ctx, shots, t, { impacts: [[time, strength]], seed }) draws frame t into ctx.
const E = require('./eng.js'); const { W, H, clamp, lerp, ss, ease, hash } = E;
let A, B, X; const OVER = []; let defer = false;
function canv() { if (!A) { A = E.createCanvas(W, H); B = E.createCanvas(W, H); X = E.createCanvas(W, H); } }
function overlay(fn) { if (defer) OVER.push(fn); else return true; }   // used by credit(): deferred while drawing into the offscreen layer
function draw(c, s, g) { const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; x.globalCompositeOperation = 'source-over';
  defer = true; const n0 = OVER.length; s.fn(x, g, g - s.t0); if (s.sepia) E.sepia(x, s.sepia); defer = false; return OVER.splice(n0); }
function units(shots, T) { const u = [];
  shots.forEach((s, i) => { const end = i + 1 < shots.length ? shots[i + 1].t0 : T, bs = [s.t0, ...(s.beats || []).filter(b => b > s.t0 + 0.3 && b < end - 0.3).sort((p, q) => p - q)];
    bs.forEach((b, k) => u.push({ s, i, t0: b, t1: k + 1 < bs.length ? bs[k + 1] : end, beat: k > 0 })); });
  return u; }
const TYPES_L = ['whip', 'zoom', 'push', 'leak', 'whip', 'zoom'], TYPES_D = ['zoom', 'whip', 'glitch', 'iris', 'zoom', 'push'];
function pick(cur, prev, k) { if (cur.s.tr) return cur.s.tr; if (cur.s.card) return 'iris'; if (prev.s.card) return 'zoom'; const L = cur.s.light && prev.s.light, Dk = !cur.s.light && !prev.s.light; let ty = (L ? TYPES_L : TYPES_D)[(k * 7 + 3) % 6]; if (ty === 'glitch' && !Dk) ty = 'zoom'; return ty; }
// transition list for the sound mix: [[time, type]]
function trans(shots, T) { const U = units(shots, T); return U.slice(1).map((u, i) => [u.t0, u.s.cut === 'hard' ? 'hard' : pick(u, U[i], i + 1)]); }
// draw a layer with camera scale (about centre), offset and blur
function put(ctx, c, sc = 1, dx = 0, dy = 0, a = 1, blur = 0) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.translate(W / 2 + dx, H / 2 + dy); ctx.scale(sc, sc); ctx.drawImage(c, -W / 2, -H / 2); ctx.restore(); }
function compose(ctx, shots, t, o = {}) { canv(); const T = o.T ?? 1e9, U = o._u || (o._u = units(shots, T)); let k = U.findLastIndex(u => t >= u.t0); if (k < 0) k = 0; const u = U[k], lt = t - u.t0, dur = Math.max(0.5, u.t1 - u.t0);
  // camera: slow push-in / pull-out (alternating), no move on chapter cards; punch-in + shake on impacts
  const cam = (uu, tt) => { if (uu.s.card || uu.s.still) return { sc: 1, dx: 0, dy: 0 }; const p = ss((tt - uu.t0) / Math.max(1, uu.t1 - uu.t0)), dir = (U.indexOf(uu) % 2) ? -1 : 1;
    let sc = dir > 0 ? lerp(1.0, 1.045, p) : lerp(1.045, 1.0, p), dx = lerp(-1, 1, p) * 10 * (hash(U.indexOf(uu)) - 0.5) * 2, dy = 0;
    for (const [ti, str] of (o.impacts || [])) { const d = tt - ti; if (d >= 0 && d < 0.5) { const e = Math.exp(-d * 9); sc += 0.03 * str * e; dx += Math.sin(d * 90) * 9 * str * e; dy += Math.cos(d * 77) * 6 * str * e; } }
    return { sc, dx, dy }; };
  const ov = draw(A, u.s, t), ca = cam(u, t);
  const TR = u.s.cut === 'hard' ? 0 : (u.s.trd ?? 0.5);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  if (k > 0 && lt < TR) { const pv = U[k - 1], p = lt / TR, e = ease.inOut(p), ty = pick(u, pv, k);
    // outgoing picture: a frozen last frame for an internal beat, otherwise the previous shot keeps playing
    const ovB = draw(B, pv.s, u.beat || pv.s === u.s ? u.t0 - 0.02 : t), cb = cam(pv, u.beat ? u.t0 - 0.02 : t);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (ty === 'zoom') { // zoom-through: the old frame rushes towards camera, the new one settles from a zoomed, blurred state
      put(ctx, B, cb.sc * lerp(1, 2.3, ease.in(p)), cb.dx, cb.dy, 1, 18 * ease.in(p)); put(ctx, A, ca.sc * lerp(1.6, 1, ease.out(p)), ca.dx, ca.dy, ss(p * 1.8 - 0.25), 18 * (1 - ease.out(p))); }
    else if (ty === 'whip' || ty === 'push') { const d = (k % 2 ? 1 : -1), hor = ty === 'whip', off = (hor ? W : H) * e, n = hor ? 6 : 1, sp = hor ? 70 * Math.sin(p * Math.PI) : 0;
      for (let j = 0; j < n; j++) { const jj = n > 1 ? (j / (n - 1) - 0.5) * sp : 0, al = n > 1 ? 0.28 : 1;
        put(ctx, B, cb.sc, hor ? -d * off + jj + cb.dx : cb.dx, hor ? cb.dy : -d * off + cb.dy, al); put(ctx, A, ca.sc, hor ? d * ((hor ? W : H) - off) + jj + ca.dx : ca.dx, hor ? ca.dy : d * (H - off) + ca.dy, al); } }
    else if (ty === 'leak') { put(ctx, B, cb.sc, cb.dx, cb.dy, 1); put(ctx, A, ca.sc, ca.dx, ca.dy, e);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const k2 = Math.sin(p * Math.PI), gx = lerp(-200, W + 200, p), gr = ctx.createRadialGradient(gx, H * 0.4, 0, gx, H * 0.4, W * 0.7);
      gr.addColorStop(0, `rgba(255,190,110,${0.75 * k2})`); gr.addColorStop(0.5, `rgba(255,120,60,${0.3 * k2})`); gr.addColorStop(1, 'rgba(255,120,60,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    else if (ty === 'iris') { put(ctx, B, cb.sc * lerp(1, 1.08, p), cb.dx, cb.dy, 1); const r = Math.hypot(W, H) / 2 * ease.inOut(p); ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.max(1, r), 0, 6.2832); ctx.clip(); put(ctx, A, ca.sc, ca.dx, ca.dy, 1); ctx.restore();
      ctx.save(); ctx.strokeStyle = 'rgba(227,179,65,0.9)'; ctx.lineWidth = 6 * (1 - p); ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.max(1, r), 0, 6.2832); ctx.stroke(); ctx.restore(); }
    else if (ty === 'glitch') { const src = p < 0.5 ? B : A, cc = p < 0.5 ? cb : ca, s2 = Math.sin(p * Math.PI); const xc = X.getContext('2d'); xc.setTransform(1, 0, 0, 1, 0, 0); xc.globalAlpha = 1; xc.filter = 'none'; xc.fillStyle = '#000'; xc.fillRect(0, 0, W, H); put(xc, src, cc.sc, cc.dx, cc.dy, 1);
      for (let j = 0; j < 14; j++) { const y = Math.floor(hash(j * 3.1 + Math.floor(t * 30)) * H), h = 8 + hash(j * 5.7 + Math.floor(t * 30)) * 70, sh = (hash(j * 9.3 + Math.floor(t * 30)) - 0.5) * 260 * s2; ctx.drawImage(X, 0, y, W, h, sh, y, W, h); }
      ctx.drawImage(X, 0, 0); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * s2; ctx.drawImage(X, 14 * s2, 0); ctx.globalAlpha = 0.25 * s2; ctx.drawImage(X, -14 * s2, 0); ctx.restore();
      for (let j = 0; j < 10; j++) { const y = hash(j * 3.1 + Math.floor(t * 30)) * H, h = 6 + hash(j * 5.7 + Math.floor(t * 30)) * 50, sh = (hash(j * 9.3 + Math.floor(t * 30)) - 0.5) * 300 * s2; ctx.drawImage(X, 0, y, W, h, sh, y, W, h); } }
    else { put(ctx, B, cb.sc, cb.dx, cb.dy, 1); put(ctx, A, ca.sc, ca.dx, ca.dy, e); }
    (p < 0.5 ? ovB : ov).forEach(f => f(ctx)); }
  else { put(ctx, A, ca.sc, ca.dx, ca.dy, 1); ov.forEach(f => f(ctx)); if (u.s.cut === 'hard' && k > 0 && lt < 0.12) { ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - lt / 0.12)})`; ctx.fillRect(0, 0, W, H); } }
  E.vignette(ctx, u.s.light ? 0.14 : 0.32); E.grain(ctx, t, u.s.light ? 0.035 : 0.05); }
const IMPACT = { thump: 0.6, stamp: 1, boom: 1.2, slam: 1.2, clank: 0.5, kaching: 0.6, heartbeat: 0.4, rumble: 0.8, error: 0.5, pop: 0.25 };
module.exports = { compose, overlay, IMPACT, trans };
