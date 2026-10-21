// How It's Run edit: a shot list with hard cuts by default and transitions that never double-expose.
// shots: [{ id, t0, t1, draw(ctx, t, lt), out: { type: 'cut' | 'whip' | 'tear', dur, dir, at(t) -> [cx, cy] } }]
// Shot boundaries can come from voice-over word timings: at(V, lineId, word) with V = engine.voice(...) (mcd_ep1/engine.js).
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const CL = require('./collage');
const { clamp, seg, E } = K;

const at = (V, id, word, n = 0, lead = 0.12) => V.at(id, word, n) - lead; // cut slightly before the stressed word

function makeEdit(shots, W, H) {
  const A = createCanvas(W, H), ax = A.getContext('2d'), B = createCanvas(W, H), bx = B.getContext('2d'), M = createCanvas(W, H), mx = M.getContext('2d');
  const reset = c => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; };
  const drawShot = (c, s, t) => { reset(c); c.save(); s.draw(c, t, t - s.t0); c.restore(); reset(c); };
  function frame(ctx, t) {
    reset(ctx);
    const i = Math.max(0, shots.findIndex(s => t >= s.t0 && t < s.t1)), s = shots[i < 0 ? shots.length - 1 : i], prev = shots[i - 1], next = shots[i + 1];
    // transitions are owned by the outgoing shot (s.out) and straddle the boundary: [t1 - dur/2, t1 + dur/2]
    const tr = (from, to) => from && from.out && from.out.type !== 'cut' && to ? { from, to, d: from.out.dur || 0.3, ...from.out } : null;
    let T = null;
    if (next) { const x = tr(s, next); if (x && t >= s.t1 - x.d / 2) T = x; }
    if (!T && prev) { const x = tr(prev, s); if (x && t < prev.t1 + x.d / 2) T = x; }
    if (!T) return drawShot(ctx, s, t);
    const u = seg(t, T.from.t1 - T.d / 2, T.from.t1 + T.d / 2);
    if (T.type === 'whip') { // both shots slide with directional smear; the swap happens behind the smear, no blend
      const dir = T.dir || -1, first = u < 0.5, sm = Math.sin(u * Math.PI), off = dir * (first ? u : u - 1) * 2 * 150;
      drawShot(ax, first ? T.from : T.to, t);
      ctx.save(); ctx.translate(W / 2, H / 2); const z = 1 + 0.14 * sm; ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      const n = 8; for (let j = 0; j < n; j++) { ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(A, off + (j / (n - 1) - 0.5) * sm * 300, 0); }
      ctx.restore();
      ctx.globalAlpha = 1; return;
    }
    if (T.type === 'tear') { // the new shot is revealed through a hole torn in the old one
      drawShot(ax, T.from, t); drawShot(bx, T.to, t);
      const [cx, cy] = T.at ? T.at(t) : [W / 2, H / 2], r = E.in(u) * Math.hypot(W, H) * 1.05 + u * 40;
      CL.tornReveal(ctx, A, B, cx, cy, r, 7); return;
    }
    return drawShot(ctx, u < 0.5 ? T.from : T.to, t);
  }
  return { frame };
}

module.exports = { makeEdit, at };
