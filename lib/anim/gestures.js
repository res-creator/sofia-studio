// Reusable, natural-looking arm gestures for the Sofia rig (and the crew rig, rig:'c').
// Additive: does not touch lib/sofia.js / lib/gus.js. Targets are in hip-space, like pose.armL / pose.armR.
// Why: short two-bone IK reaches (hand close to the shoulder) bend the elbow UP and out ("chicken wing"). All gestures here
// keep the arm ≥93 % extended (point 97 %), so the elbow stays low and the pose reads as a human arm.
const RIG = { s: { sh: [90, -236], len: 230, relax: 118, rest: -20 }, c: { sh: [95, -250], len: 243, relax: 80, rest: -60 } };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = k => (k = clamp(k), k * k * (3 - 2 * k));

// hand target: side −1/+1, deg from hanging-down (0) via horizontal (90) to straight up (180), ext 0..1 of full arm length
function reach(side, deg, ext = 0.9, rig = 's') {
  const R = RIG[rig], a = deg * Math.PI / 180;
  return [side * R.sh[0] + side * Math.sin(a) * R.len * ext, R.sh[1] + Math.cos(a) * R.len * ext];
}
// relaxed arm with a tiny breathing sway (time-pure: same t → same pose)
function idle(t, side, seed = 0, rig = 's') {
  const R = RIG[rig], p = t * 1.7 + seed * 1.3 + (side > 0 ? 1.1 : 0);
  return [side * R.relax + Math.sin(p) * 4, R.rest + Math.sin(p * 0.9 + 0.7) * 5];
}
// ramp 0→1 on entering [a,b] and 1→0 on leaving it (fade seconds each side) — gives anticipation/settle instead of snapping
function win(t, a, b, fade = 0.22) { return smooth((t - a) / fade) * smooth((b - t) / fade); }
// blend the idle arm into a gesture target by k (0..1)
function mix(side, k, target, t, seed = 0, rig = 's') { const i = idle(t, side, seed, rig); return [lerp(i[0], target[0], k), lerp(i[1], target[1], k)]; }

// NOTE: with the rig's IK, targets at 50–70° below-horizontal flip the elbow up (chicken wing) — gestures use ≤45° or ≥75°.
// ---- named gestures: return {armL?, armR?, handL?, handR?, armsFront}; k = 0..1 blend weight (use win())
function wave(t, side, k = 1, seed = 0, rig = 's') { const b = reach(side, 150, 0.9, rig); const sw = Math.sin(t * 9) * 26 * k; return pick(side, mix(side, k, [b[0] + side * sw, b[1] + Math.abs(sw) * 0.2], t, seed, rig), 'open', k); }
function point(side, k = 1, t = 0, seed = 0, rig = 's', deg = 75) { return pick(side, mix(side, k, reach(side, deg, 0.97, rig), t, seed, rig), 'open', k); }
function hold(side, k = 1, t = 0, seed = 0, rig = 's') { return pick(side, mix(side, k, reach(side, 32, 0.95, rig), t, seed, rig), 'mitten', k); }   // object in front (passport, tray)
function reachOut(side, k = 1, t = 0, seed = 0, rig = 's') { return pick(side, mix(side, k, reach(side, 78, 0.95, rig), t, seed, rig), 'open', k); } // handing something over
function openArms(t, k = 1, seed = 0, rig = 's') { return Object.assign({}, pick(-1, mix(-1, k, reach(-1, 100, 0.94, rig), t, seed, rig), 'open', k), pick(1, mix(1, k, reach(1, 100, 0.94, rig), t, seed + 1, rig), 'open', k)); }
function shrug(t, k = 1, seed = 0, rig = 's') { return Object.assign({}, pick(-1, mix(-1, k, reach(-1, 45, 0.93, rig), t, seed, rig), 'open', k), pick(1, mix(1, k, reach(1, 45, 0.93, rig), t, seed + 1, rig), 'open', k)); }
function relaxed(t, seed = 0, rig = 's') { return { armL: idle(t, -1, seed, rig), armR: idle(t, 1, seed + 1, rig), handL: 'mitten', handR: 'mitten', armsFront: false }; }
function pick(side, target, hand, k) { return side < 0 ? { armL: target, handL: k > 0.15 ? hand : 'mitten', armsFront: k > 0.15 } : { armR: target, handR: k > 0.15 ? hand : 'mitten', armsFront: k > 0.15 }; }
function merge(...ps) { const o = {}; for (const p of ps) { if (!p) continue; for (const k in p) o[k] = k === 'armsFront' ? (o[k] || p[k]) : p[k]; } return o; }

function raise(side, k = 1, t = 0, seed = 0, rig = 's', deg = 140) { return pick(side, mix(side, k, reach(side, deg, 0.95, rig), t, seed, rig), 'open', k); } // hand up (hail, cheer, shout)
// compose(t, seed, rig, list, base): list = [{k, g}] where g(k) → gesture partial. Per side the gesture with the largest k wins;
// with no active gesture the arm rests on `base` ({L:[x,y], R:[x,y]}) or the idle sway. Time-pure (no state): same t → same pose.
function compose(t, seed, rig, list, base) {
  const out = { handL: 'mitten', handR: 'mitten', armsFront: false }, best = { L: 0, R: 0 };
  for (const [key, side] of [['L', -1], ['R', 1]]) {
    const i = idle(t, side, seed + (side > 0 ? 1 : 0), rig), b = base && base[key] ? base[key] : i;
    out['arm' + key] = b;
  }
  for (const it of list) {
    if (!it || it.k <= 0.001) continue;
    const g = it.g(1); // full gesture target; we blend from the resting arm ourselves
    for (const [key, ak] of [['L', 'armL'], ['R', 'armR']]) if (g[ak] && it.k > best[key]) {
      best[key] = it.k;
      const b = base && base[key] ? base[key] : idle(t, key === 'L' ? -1 : 1, seed + (key === 'R' ? 1 : 0), rig);
      out[ak] = [lerp(b[0], g[ak][0], it.k), lerp(b[1], g[ak][1], it.k)];
      out['hand' + key] = g['hand' + key] || 'mitten';
      if (it.k > 0.15) out.armsFront = true;
    }
  }
  return out;
}
module.exports = { raise, compose, RIG, reach, idle, win, mix, wave, point, hold, reachOut, openArms, shrug, relaxed, merge, smooth, lerp };
