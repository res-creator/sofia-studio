// How It's Run LONG-FORM puppet (approved standard, Nov 2026). Figma AI draws the character once (part sheets); this code animates it.
//  - head: whole pixel-aligned expression heads swapped by an expression track (+ auto blinks), tilt / nod / breathing
//  - arms: ONE straight arm per side drawn BEHIND the jacket (top hidden under the shoulder cap), bent smoothly at the elbow as a single
//          piece ("bendy bone": strips rotated along the arm spine — no cut, no seam); when a bend reaches a drawn gesture (palm / point ...)
//          the drawn arm fades in over the last ~20 % of the move, and fades out first on the way back
//  - body: breath, sway, shoulder lift (shrug)
// Usage:
//   const P = await Puppet.load(require('../assets/characters/candler/character.js'), dir)
//   const act = Puppet.acting({ expr: [[0,'neutral'],[1.0,'skeptical'],...], gestures: { R: [[2.2, 4.5, 'point', {wag: 1}]], L: [[7.7, 99, 'palm']] },
//                               blinks: [0.7, 3.4], tilt: [[1.0, -0.07], [4.7, 0.06]], shrugs: [[7.9, 1]], nods: [1.0] })
//   P.draw(ctx, x, y, scale, act(t), t)          // (x, y) = neck point in the scene
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };

class Puppet {
  static async load(cfg, dir) { const p = new Puppet(); p.cfg = cfg; p.img = {};
    const L = f => loadImage(path.join(dir, f));
    for (const [k, f] of Object.entries(cfg.heads)) p.img['head_' + k] = await L(f);
    p.img.body = await L(cfg.body.file);
    for (const side of ['L', 'R']) { const a = cfg.arms[side]; p.img[side + '_straight'] = await L(a.straight.file);
      for (const [g, d] of Object.entries(a.gestures || {})) p.img[side + '_' + g] = await L(d.file); }
    return p; }
  // one-piece elbow bend: the whole straight-arm image drawn as 2-px strips, each rotated by a smooth angle that grows across the elbow zone
  bendy(ctx, im, top, elbowY, th) { const w = im.width, h = im.height, cx = top[0], step = 2, Z = this.cfg.bendZone || 70; let x = 0, y = 0;
    for (let row = top[1]; row < h; row += step) { const aa = th * ss((row - (elbowY - Z / 2)) / Z);
      ctx.save(); ctx.translate(x, y); ctx.rotate(aa); ctx.drawImage(im, 0, row, w, step + 2, -cx, 0, w, step + 2); ctx.restore();
      x += -Math.sin(aa) * step; y += Math.cos(aa) * step; }
    ctx.drawImage(im, 0, 0, w, top[1] + 1, -cx, -top[1], w, top[1] + 1); }
  arm(ctx, side, G, t) { const A = this.cfg.arms[side], S = A.straight, sh = this.cfg.body.shoulders[side], nk = this.cfg.body.neck, D = (A.gestures || {})[G.g] || {};
    const b = G.b || 0, f = G.g ? ss((b - 0.78) / 0.22) : 0, idle = (side === 'L' ? 1 : -1) * 0.03 * Math.sin(t * (side === 'L' ? 1.3 : 1.1));
    const r = S.rest * (1 - b) + (D.swing || 0) * b + idle * (1 - b) + (G.wag ? Math.sin(t * 9) * 0.06 * G.wag * (b > 0.95 ? 1 : 0) : 0), th = (D.bend || 0) * ss(b);
    ctx.save(); ctx.translate(sh[0] - nk[0], sh[1] - nk[1]); ctx.rotate(r);
    if (f < 1) { ctx.save(); ctx.globalAlpha *= 1 - f; this.bendy(ctx, this.img[side + '_straight'], S.top, S.elbowY, th); ctx.restore(); }
    if (f > 0) { ctx.save(); ctx.globalAlpha *= f; ctx.rotate(D.rest || 0); ctx.drawImage(this.img[side + '_' + G.g], -D.top[0], -D.top[1]); ctx.restore(); }
    ctx.restore(); }
  // st: { head, tilt, nod, lift, breath, sway, arms: { L: {g, b, wag}, R: {...} } }
  draw(ctx, x, y, s, st, t) { const C = this.cfg, B = C.body, H = C.head;
    ctx.save(); ctx.translate(x, y - (st.lift || 0)); ctx.rotate(st.sway ?? Math.sin(t * 0.9) * 0.012); ctx.scale(s, s * (1 + (st.breath ?? Math.sin(t * 2.2) * 0.012)));
    ctx.save(); ctx.scale(B.scale, B.scale);
    for (const side of ['L', 'R']) this.arm(ctx, side, (st.arms || {})[side] || {}, t);
    ctx.drawImage(this.img.body, -B.neck[0], -B.neck[1]); ctx.restore();
    ctx.save(); ctx.translate(H.offset[0], H.offset[1]); ctx.rotate((st.tilt || 0) + (st.nod || 0)); ctx.scale(H.scale, H.scale);
    ctx.drawImage(this.img['head_' + (st.head || 'neutral')], -H.pivot[0], -H.pivot[1]); ctx.restore();
    ctx.restore(); }
  // acting track -> st(t). All times in scene seconds (take them from the voice word timings).
  static acting(o) { const expr = (o.expr || [[0, 'neutral']]).slice().sort((a, b) => a[0] - b[0]), blinks = o.blinks || [];
    const trackAt = (tr, t) => { let v = 0; for (const [t0, val] of tr || []) if (t >= t0) v = val; return v; };
    return t => {
      let head = 'neutral'; for (const [t0, e] of expr) if (t >= t0) head = e;
      if (blinks.some(b => t > b && t < b + 0.13)) head = 'blink';
      // head tilt: smooth step between tilt keys
      let tilt = 0, prev = 0, prevT = -1; for (const [t0, v] of o.tilt || []) { if (t >= t0) { tilt = prev + (v - prev) * ss((t - t0) / 0.35); prev = v; prevT = t0; } }
      tilt += Math.sin(t * 1.4) * 0.02;
      const nod = Math.sin(t * 1.7) * 0.015 + (o.nods || []).reduce((m, n) => m + (t > n && t < n + 0.5 ? -0.05 * Math.sin((t - n) / 0.5 * Math.PI) : 0), 0);
      const lift = (o.shrugs || []).reduce((m, [t0, k]) => m + (k || 1) * 16 * Math.sin(clamp((t - t0) / 0.9) * Math.PI), 0);
      const arms = {};
      for (const side of ['L', 'R']) { arms[side] = {};
        for (const [t0, t1, g, opt] of (o.gestures || {})[side] || []) { const inn = ss((t - (t0 - 0.45)) / 0.45), out = ss((t - (t1 - 0.4)) / 0.4), b = inn * (1 - out);
          if (b > (arms[side].b || 0)) arms[side] = { g, b, wag: (opt || {}).wag && t < (opt.wagUntil ?? 1e9) ? opt.wag : (opt || {}).wag ? 0.3 : 0 }; } }
      return { head, tilt, nod, lift, arms }; }; }
}
module.exports = { Puppet, ss, clamp };
