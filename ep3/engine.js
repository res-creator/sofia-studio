// Shared engine: timeline access, camera, lip-sync, life (blink/breath).
const { clamp, lerp, ease, seg, noise1 } = require('../lib/draw');
const TL = require('./timeline.json');
const SC = Object.fromEntries(TL.scenes.map(s => [s.id, s]));

function mk(sceneId) {
  const S = SC[sceneId];
  const m = name => { const v = S.marks[name]; if (v === undefined) throw new Error(`no mark ${name} in ${sceneId}`); return v; };
  const k = (t, name, dur, off = 0) => clamp((t - m(name) - off) / dur);
  return { S, m, k, t0: S.t0, t1: S.t1 };
}
// speaking envelope for character at time t
function talk(who, t) {
  for (const L of TL.lines) if (L.who === who && t >= L.t0 && t < L.t1) {
    const i = Math.floor((t - L.t0) * TL.fps); const e = L.env[Math.min(L.env.length - 1, i)] || 0;
    const e2 = L.env[Math.min(L.env.length - 1, i + 1)] || 0;
    return clamp((e * 0.6 + e2 * 0.4) * 1.15);
  }
  return 0;
}
function lineAt(t) { for (const L of TL.lines) if (t >= L.t0 - 0.05 && t < L.t1 + 0.35) return L; return null; }
// camera keyframes: [[t, cx, cy, zoom, rot, easeName]] ; hold before first / after last
function cam(keys, t) {
  if (t <= keys[0][0]) return keys[0].slice(1, 5);
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const a = keys[i - 1], b = keys[i]; const e = ease[b[5] || 'inOut'] || ease.inOut;
      if (b[5] === 'cut') return a.slice(1, 5);
      const u = e((t - a[0]) / (b[0] - a[0]));
      return [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u), lerp(a[4] || 0, b[4] || 0, u)];
    }
  }
  return keys[keys.length - 1].slice(1, 5);
}
function applyCam(ctx, c, shake = 0, t = 0) {
  const [cx, cy, z, r] = c;
  const sx = shake ? noise1(t * 25) * shake : 0, sy = shake ? noise1(t * 25 + 50) * shake : 0;
  ctx.translate(960 + sx, 540 + sy); ctx.scale(z * 0.72, z * 0.72); ctx.rotate(r || 0); ctx.translate(-cx, -cy);
}
function blinkAt(t, seed = 0) {
  const p = 3.3 + (seed % 3) * 0.4; const u = ((t + seed * 1.37) % p);
  return u < 0.07 ? u / 0.07 : u < 0.16 ? 1 - (u - 0.07) / 0.09 : 0;
}
function life(t, seed = 0) { return { blink: blinkAt(t, seed), bob: Math.sin(t * 2.2 + seed) * 3 }; }
// mouth pose from talk level
function mouthFor(level, base = {}, t = 0) {
  if (level <= 0.02) return base;
  const o = Math.max(0, noise1(t * 9) * 0.6) * level; // occasional "o" shapes
  return Object.assign({}, base, { open: clamp(level * 0.85), o: o > 0.35 ? o : 0, smile: base.smile ?? 0.5 });
}
module.exports = { TL, SC, mk, talk, lineAt, cam, applyCam, life, blinkAt, mouthFor, clamp, lerp, ease, seg, noise1 };
