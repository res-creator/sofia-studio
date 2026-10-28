// Acting toolkit for hq.human() (new episodes, first used by THE ACCIDENTAL MAFIA BOSS).
// - key():   numeric keyframes with easing (pattern from the make-2d-video kit: core.key / posesAt)
// - walk():  walking with a moving root and planted feet (walkPose idea from make-2d-video, rebuilt for the front-facing hq rig)
// - poser(): gesture library on pose.reach() with smooth blends between gestures, overshoot and idle drift
// - foot():  one leg doing a task (push something along the floor), same leg hook as walk()
// Nothing here changes how existing episodes draw: hq.js only reads st.legFn / st.shoeDir when they are set.
const H = require('./hq');
const { reach } = require('./pose');
const { clamp, lerp, eIO, eOut, eBack, noise1 } = H;
const EASE = { io: eIO, out: eOut, back: k => eBack(k, 1.7), snap: k => eBack(k, 2.6), lin: k => k };

// key(t, [[t0, v0], [t1, v1], ...], ease) -> value; holds the ends. Each key may carry its own ease: [t, v, 'back'].
function key(t, ks, ease = 'io') {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const [a, va] = ks[i - 1], [b, vb, e] = ks[i]; return lerp(va, vb, (EASE[e || ease] || eIO)((t - a) / (b - a))); }
  return ks[ks.length - 1][1];
}

// ---------------------------------------------------------------- legs
// Leg lengths of hq.human(): hip joint at y = -0.47h + 20, knee -0.24h, ankle -40 (feet on y = 0).
const legLen = h => ({ lu: h * 0.23 - 20, ll: h * 0.24 - 40 });
// Knee from hip and ankle (two-bone IK). The knee bends toward `fwd` (the walking direction), toned down for the front view.
function knee(hx, hy, ax, ay, h, fwd) {
  const { lu, ll } = legLen(h), dx = ax - hx, dy = ay - hy, d = Math.hypot(dx, dy);
  if (d >= lu + ll - 1) return { kx: hx + dx * lu / (lu + ll), ky: hy + dy * lu / (lu + ll) };
  const a = (lu * lu - ll * ll + d * d) / (2 * d), hgt = Math.sqrt(Math.max(0, lu * lu - a * a));
  const mx = hx + dx * a / d, my = hy + dy * a / d, nx = -dy / d, ny = dx / d, side = fwd >= 0 ? -1 : 1;   // n points to -x for a hanging leg
  return { kx: mx + nx * hgt * side * 0.62, ky: my + ny * hgt * side * 0.62 };
}

// walk(cfg, segs, t, o) — segs: [{ t0, t1, x0, x1 }] in world x; between segments the character stands at the last x.
// Returns { x, dir, moving, st } — merge st into the human() state. Also { armFwd(side) } in -1..1 for arm swing.
// Feet: each foot is planted (fixed in the world) for half a cycle and swings forward for the other half,
// so the body travels over the feet instead of the legs sliding. Steps are fitted so a walk ends with the feet together.
function walk(cfg, segs, t, o = {}) {
  const h = cfg.h || 1500, stride = o.stride ?? h * 0.058, bob = o.bob ?? h * 0.016, ramp = o.ramp ?? 0.28;
  let x = segs[0].x0, dir = Math.sign(segs[0].x1 - segs[0].x0) || 1, seg = null;
  for (const s of segs) { if (t >= s.t0) { x = s.x1; dir = Math.sign(s.x1 - s.x0) || dir; } if (t >= s.t0 && t < s.t1) seg = s; }
  const none = { x, dir, moving: false, st: {}, armFwd: () => 0, w: 0 };
  if (!seg) return none;
  const D = Math.abs(seg.x1 - seg.x0), T = seg.t1 - seg.t0;
  const n = Math.max(1, Math.round(D / (2 * stride))), a = D / (2 * n);           // n steps of length 2a (each foot travels 4a per swing... in world 2*2a)
  // root position: eased start and stop over `ramp` s, constant speed in between
  const u = (t - seg.t0) / T, r = Math.min(ramp / T, 0.45);
  const vmax = 1 / (1 - r);                                                        // area under the trapezoid speed profile = 1
  const dist01 = u < r ? vmax * u * u / (2 * r) : u > 1 - r ? 1 - vmax * (1 - u) * (1 - u) / (2 * r) : vmax * (u - r / 2);
  const dist = D * clamp(dist01);
  x = seg.x0 + dir * dist;
  const phi = Math.PI / 2 + Math.PI * dist / (2 * a);                              // half a cycle per step of length 2a; starts/ends with the feet side by side
  const w = clamp(Math.min(t - seg.t0, seg.t1 - t) / ramp);                         // lift, bob and arm swing fade in/out at start and stop (foot positions never slide)
  const footX = (s) => {                                                           // foot offset along the walk, -a..a (local, forward = +)
    const psi = ((phi + (s > 0 ? Math.PI : 0)) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (psi < Math.PI) return { lx: a * (1 - 2 * psi / Math.PI), lift: 0 };          // stance: planted, the body passes over it
    const k = (psi - Math.PI) / Math.PI; return { lx: -a + 2 * a * eIO(k), lift: Math.sin(Math.PI * k) };   // swing
  };
  const lift = o.lift ?? h * 0.05;
  const st = {
    // front view: each foot keeps to its own lane (no scissor crossing); the knee of a bending leg points outward, as seen from the front
    legFn: (s, L) => { const f = footX(s), ax = s * L.hipW * 0.55 + dir * f.lx, ay = -40 - f.lift * lift * w; return { ax, ay, ...knee(L.hx, L.hy, ax, ay, h, s) }; },
    shoeDir: dir,
    drop: bob * w * (0.5 + 0.5 * Math.cos(2 * phi)),                               // lowest when both feet are down, highest when passing
    lean: (dir * 0.08 - 0.12 * Math.sin(phi)) * w,                                 // slight lean forward + weight shift onto the planted foot
    headY: -Math.abs(Math.sin(phi)) * bob * 0.3 * w,
  };
  return { x, dir, moving: true, st, w, armFwd: (side) => -footX(side).lx / a * w };
}
// arm swing for a walking front-facing figure: mostly forward/back (seen as up/down + a little sideways), opposite to the legs
function swingArm(wk, g) { return wk.moving ? (side) => ({ dx: wk.dir * wk.armFwd(side) * g.h * 0.025, dy: 0 }) : null;
}

// foot(cfg, side, keys, t): one leg doing a job — keys [[t, dx, lift]] move the ankle along the floor (dx toward the leg's own side when > 0)
function foot(cfg, side, keys, t) {
  const h = cfg.h || 1500, dx = key(t, keys.map(k => [k[0], k[1]])), lift = key(t, keys.map(k => [k[0], k[2] || 0]));
  return (s, L) => { const ax0 = s * L.hipW * 0.48; if (s !== side) return { ax: ax0, ay: -40, ...knee(L.hx, L.hy, ax0, -40, h, side) };
    const ax = ax0 + side * dx, ay = -40 - lift; return { ax, ay, ...knee(L.hx, L.hy, ax, ay, h, side) }; };
}

// ---------------------------------------------------------------- arms and gestures
// A gesture = hand targets in the character's local space (feet at 0,0): { L: {x, y, fist, item}, R: {...}, ...extra }.
// Targets are built from the character geometry (pose.geom): sw = shoulder half width, ySh = shoulder line, h = height.
const GEST = {
  rest:     g => ({ L: { x: -g.sw * 1.08, y: g.ySh + g.h * 0.33 }, R: { x: g.sw * 1.08, y: g.ySh + g.h * 0.33 } }),
  hips:     g => ({ L: { x: -g.sw * 1.35, y: -g.h * 0.52, fist: true }, R: { x: g.sw * 1.35, y: -g.h * 0.52, fist: true } }),
  cross:    g => ({ L: { x: g.sw * 0.5, y: g.ySh + g.h * 0.2, fist: true }, R: { x: -g.sw * 0.5, y: g.ySh + g.h * 0.215, fist: true }, armsFirst: false }),
  point:    g => ({ L: { x: -g.sw * 1.08, y: g.ySh + g.h * 0.33 }, R: { x: g.sw * 2.9, y: g.ySh + g.h * 0.03, fist: true, item: 'finger' } }),
  pointUp:  g => ({ L: { x: -g.sw * 1.08, y: g.ySh + g.h * 0.33 }, R: { x: g.sw * 1.35, y: g.ySh - g.h * 0.13, fist: true, item: 'finger' } }),
  spread:   g => ({ L: { x: -g.sw * 2.5, y: g.ySh + g.h * 0.15 }, R: { x: g.sw * 2.5, y: g.ySh + g.h * 0.15 } }),
  shrug:    g => ({ L: { x: -g.sw * 1.9, y: g.ySh + g.h * 0.1 }, R: { x: g.sw * 1.9, y: g.ySh + g.h * 0.1 }, tilt: 0.08 }),
  handsUp:  g => ({ L: { x: -g.sw * 1.7, y: g.ySh - g.h * 0.2 }, R: { x: g.sw * 1.7, y: g.ySh - g.h * 0.2 } }),
  fists:    g => ({ L: { x: -g.sw * 0.7, y: g.ySh + g.h * 0.08, fist: true }, R: { x: g.sw * 1.0, y: g.ySh + g.h * 0.02, fist: true } }),
  pocketR:  g => ({ L: { x: -g.sw * 1.08, y: g.ySh + g.h * 0.33 }, R: { x: g.sw * 1.02, y: -g.h * 0.47, fist: true } }),
  behind:   g => ({ L: { x: -g.sw * 0.75, y: -g.h * 0.5 }, R: { x: g.sw * 0.75, y: -g.h * 0.5 }, hide: true }),
  chin:     g => ({ L: { x: -g.sw * 0.2, y: g.ySh + g.h * 0.12, fist: true }, R: { x: g.sw * 0.15, y: g.headY + g.hh * 0.9, fist: true } }),
};
// side helpers for one-hand gestures combined with a held prop
const one = (base, side, spec) => g => { const b = GEST[base](g); return { ...b, [side]: { ...b[side], ...spec(g) } }; };

// poser(cfg, geom): pose(t, keys) -> { armL, armR, items, extra }
// keys: [[t, gesture, dur = 0.3, ease = 'io']]; gesture = name | (g => targets) | targets. The hand path between gestures is a
// straight blend of the targets (so arms swing through natural in-between positions instead of popping), with a light idle drift.
function poser(cfg, g, o = {}) {
  const seed = (cfg.seed || 0) * 7.3, ITEMS = o.items || {};
  const spec = (s) => typeof s === 'string' ? GEST[s](g) : typeof s === 'function' ? s(g) : s;
  function targets(t, keys) {
    let cur = spec(keys[0][1]);
    for (let i = 1; i < keys.length; i++) {
      const [ti, si, dur = 0.3, ez = 'io'] = keys[i]; if (t < ti) break;
      const k = clamp((t - ti) / dur), nx = spec(si);
      if (k >= 1) { cur = nx; continue; }
      const e = (EASE[ez] || eIO)(k), mixH = (a, b) => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), fist: k < 0.5 ? a.fist : b.fist, item: k < 0.5 ? a.item : b.item, elbow: b.elbow });
      return { ...cur, ...nx, L: mixH(cur.L, nx.L), R: mixH(cur.R, nx.R), tilt: lerp(cur.tilt || 0, nx.tilt || 0, e) };
    }
    return cur;
  }
  return function pose(t, keys, extra = {}) {
    const T = targets(t, keys), drift = (k) => noise1(t * 0.7 + seed + k) * (extra.calm ? 4 : 9);
    const hand = (side, P) => { const sw = extra.swing ? extra.swing(side) : 0, sdx = typeof sw === 'number' ? sw : sw.dx, sdy = typeof sw === 'number' ? 0 : sw.dy;
      const tx = P.x + drift(side * 3) + sdx, ty = P.y + drift(side * 5 + 1) + sdy;
      return reach(g, side, tx, ty, { fist: P.fist, elbow: P.elbow }); };
    const items = {}; for (const [side, P] of [['L', T.L], ['R', T.R]]) if (P.item && ITEMS[P.item]) items[side] = ITEMS[P.item];
    return { armL: hand(-1, T.L), armR: hand(1, T.R), items, tilt: T.tilt || 0, T };
  };
}

// talk flap for temporary lines (no audio yet): syllable-like open/close while a line is on
function flap(t, on, seed = 0) { if (!on) return 0; const v = Math.abs(Math.sin(t * 13 + seed)) * 0.75 + Math.abs(noise1(t * 9 + seed)) * 0.45; return clamp(v, 0, 1.1); }

module.exports = { key, walk, swingArm, foot, knee, poser, GEST, one, flap, EASE };
