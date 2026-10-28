// Extra comedy faces for hq.human() (new episodes). Used through the optional hooks in hq.js:
//   st.mouthFn = FX.grin(k) | FX.whistle() | FX.bigSmile(k) | FX.wobble()   (drawn at the mouth centre)
//   st.eyeOpen = [l, r] (wink), st.eyeBig, st.iris (pupil size), st.brows = [[in, out], [in, out]]
//   st.front   = FX.extras(g, {...}) for sweat drops / twitch marks / paleness around the head
const H = require('./hq');
const { clamp, lerp, paint, rgba, mix, dark, INK, noise1 } = H;

// creepy grin, k = 0 (normal closed mouth) .. 1 (full grin: very wide, every tooth, corners pulled up)
function grin(k, o = {}) {
  return (ctx, M) => {
    const { w, hh, skin, lipCol } = M, t = o.t || 0;
    if (k < 0.05) { ctx.strokeStyle = mix(lipCol, INK, 0.45); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(0, 4, w, 0); ctx.stroke(); return; }
    ctx.translate(0, hh * 0.1 * k);                              // the grin opens downward so a moustache can't hide it
    const W = w * (0.95 + 1.9 * k), lift = hh * 0.13 * k + (o.twitch ? noise1(t * 40) * hh * 0.012 * k : 0);
    const top = -hh * 0.015 * k, depth = hh * (0.05 + 0.15 * k), cL = -lift * (o.uneven ? 1.25 : 1), cR = -lift;
    const shape = new H.Path2D(); shape.moveTo(-W, cL); shape.bezierCurveTo(-W * 0.5, top, W * 0.5, top, W, cR);
    shape.bezierCurveTo(W * 0.62, depth * 1.05, -W * 0.62, depth * 1.05, -W, cL); shape.closePath();
    ctx.fillStyle = '#4A1620'; ctx.fill(shape);
    ctx.save(); ctx.clip(shape);
    const gap = depth * 0.42;                                    // dark line between the teeth rows
    ctx.fillStyle = '#FFFDF4'; ctx.fillRect(-W, -hh, W * 2, hh + gap);              // upper teeth
    ctx.fillRect(-W, gap + depth * 0.1, W * 2, depth);                               // lower teeth
    ctx.fillStyle = 'rgba(232,120,140,.9)'; ctx.fillRect(-W, -hh, W * 2, hh * 0.985 + top - 2);   // gums peek on top
    ctx.strokeStyle = 'rgba(120,90,80,.55)'; ctx.lineWidth = 2.5;
    const n = Math.round(8 + 6 * k); for (let i = 1; i < n; i++) { const x = -W + (2 * W) * i / n; ctx.beginPath(); ctx.moveTo(x, -hh); ctx.lineTo(x, depth * 1.2); ctx.stroke(); }
    ctx.strokeStyle = '#4A1620'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-W, gap + depth * 0.05); ctx.quadraticCurveTo(0, gap + depth * 0.2, W, gap + depth * 0.05); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = mix(lipCol, INK, 0.4); ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke(shape);
    // cheek creases at the corners
    ctx.strokeStyle = rgba(dark(skin, .45), 0.5 * k); ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (const s of [-1, 1]) { const cy = s < 0 ? cL : cR; ctx.beginPath(); ctx.moveTo(s * (W + 8), cy - hh * 0.09); ctx.quadraticCurveTo(s * (W + 22), cy, s * (W + 10), cy + hh * 0.08); ctx.stroke(); }
  };
}
// open, friendly customer smile (D shape), k = how wide
function bigSmile(k = 1, o = {}) {
  return (ctx, M) => {
    const { w, hh, lipCol } = M, W = w * (1 + 0.5 * k), D = hh * (0.1 + 0.1 * k) + (o.talk || 0) * hh * 0.08;
    const p = new H.Path2D(); p.moveTo(-W, -hh * 0.03); p.quadraticCurveTo(0, hh * 0.03, W, -hh * 0.03); p.bezierCurveTo(W * 0.8, D * 1.2, -W * 0.8, D * 1.2, -W, -hh * 0.03); p.closePath();
    ctx.fillStyle = '#5A1A26'; ctx.fill(p); ctx.save(); ctx.clip(p); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-W, -hh, W * 2, hh + D * 0.32);
    ctx.fillStyle = '#E2707E'; ctx.beginPath(); ctx.ellipse(0, D * 0.85, W * 0.5, D * 0.35, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = mix(lipCol, INK, 0.35); ctx.lineWidth = 4.5; ctx.stroke(p);
  };
}
// whistling "o"
function whistle(o = {}) {
  return (ctx, M) => { const { w, hh, lipCol } = M, r = w * 0.32 * (1 + 0.08 * Math.sin((o.t || 0) * 12));
    ctx.fillStyle = mix(lipCol, '#C8505E', 0.4); ctx.beginPath(); ctx.ellipse(w * 0.15, -hh * 0.02, r * 1.25, r * 1.35, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#4A1620'; ctx.beginPath(); ctx.ellipse(w * 0.15, -hh * 0.02, r * 0.55, r * 0.65, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = mix(lipCol, INK, 0.45); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(w * 0.15, -hh * 0.02, r * 1.25, r * 1.35, 0, 0, 7); ctx.stroke(); };
}
// nervous wavy line (k = amplitude)
function wobble(k = 1) {
  return (ctx, M) => { const { w, lipCol } = M; ctx.strokeStyle = mix(lipCol, INK, 0.45); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 16; i++) { const x = -w + 2 * w * i / 16, y = Math.sin(i / 16 * Math.PI * 3) * 6 * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); };
}

// extras around the head (human()'s `front` hook gets { head }). g = pose.geom of the character.
// o: { sweat: 0..1, twitch: bool, pale: 0..1, t }
function extras(g, o = {}) {
  return (ctx, P) => {
    const hx = P.head.x, hy = P.head.y, t = o.t || 0;
    if (o.pale > 0) { ctx.save(); ctx.globalAlpha = 0.35 * o.pale; ctx.fillStyle = '#A8D8E8'; ctx.beginPath(); ctx.ellipse(hx, hy - g.hh * 0.45, g.hw * 0.95, g.hh * 0.42, 0, Math.PI, 0); ctx.fill(); ctx.restore(); }
    if (o.sweat > 0) for (let i = 0; i < 2; i++) { const k = clamp(o.sweat * 1.4 - i * 0.4); if (k <= 0) continue;
      const x = hx + (i ? -1 : 1) * g.hw * (0.9 + 0.05 * i), y = hy - g.hh * (0.5 - 0.25 * i) + ((t * 60 + i * 37) % 40) * k;
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#8FD3F7'; ctx.strokeStyle = '#3C8FE0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.quadraticCurveTo(x + 20, y, x, y + 14); ctx.quadraticCurveTo(x - 20, y, x, y - 34); ctx.fill(); ctx.stroke(); ctx.restore(); }
    if (o.twitch) { const on = Math.sin(t * 31) > 0.2; if (on) { const ex = hx + g.hw * 0.62, ey = hy - g.hh * 0.15; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (const a of [-0.6, 0, 0.6]) { ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * g.hw * 0.42, ey - 10 + Math.sin(a) * g.hw * 0.42); ctx.lineTo(ex + Math.cos(a) * g.hw * 0.56, ey - 10 + Math.sin(a) * g.hw * 0.56); ctx.stroke(); } } }
  };
}

module.exports = { grin, bigSmile, whistle, wobble, extras };
