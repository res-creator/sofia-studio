// Пробный 3D-отрывок «Чернобыль»: холодный старт (0:00 - 0:17), 24 к/с, под озвучку клоном Todd (vo_clone, фразы с 1.0 с и с 10.67 с).
export const FPS = 24, TOTAL = 420;
export const SHOTS = [
  { id: 'wide', a: 0, b: 84 }, { id: 'boy', a: 85, b: 148 }, { id: 'mom', a: 149, b: 250 }, { id: 'book', a: 251, b: 340 }, { id: 'leave', a: 341, b: 419 },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (f, a, b) => clamp((f - a) / (b - a));

export const LIGHTS = {
  day: { az: -70, el: 34, sky: '#c9d4e6', ground: '#86745e', hemi: 1.0, sun: '#ffe2bb', sunI: 2.1, fog: '#dcd8d0', fogNear: 150, fogFar: 2400,
    skyTop: '#8aa6cf', skyHor: '#e8e2d6', sat: 1.04, vig: 0.3, shadowExt: 6, gain: '#fff4e6' },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS.day };
  if (S.id === 'leave') { const k = smooth(ramp(f, 392, 419)); L.hemi = lerp(1.0, 0.45, k); L.sunI = lerp(2.1, 0.6, k); L.sat = lerp(1.04, 0.85, k); }
  return L;
};
const CAMS = {
  wide: [{ f: 0, pos: [0.7, 1.5, 2.65], look: [0.0, 1.45, -2.6], fov: 42 }, { f: 84, pos: [0.5, 1.5, 2.55], look: [0.0, 1.45, -2.6], fov: 40.5 }],
  boy: [{ f: 85, pos: [0.9, 1.0, 2.3], look: [0.25, 0.85, 0.2], fov: 34 }, { f: 148, pos: [0.8, 1.0, 2.2], look: [0.25, 0.85, 0.2], fov: 33 }],
  mom: [{ f: 149, pos: [1.35, 1.1, 2.1], look: [-1.5, 1.0, 0.3], fov: 38 }, { f: 250, pos: [1.25, 1.1, 2.0], look: [-1.5, 1.0, 0.3], fov: 37 }],
  book: [{ f: 251, pos: [0.4, 1.3, 2.2], look: [1.2, 0.8, 0.6], fov: 32 }, { f: 340, pos: [0.85, 1.05, 1.5], look: [1.25, 0.78, 0.6], fov: 27 }],
  leave: [{ f: 341, pos: [1.5, 1.45, 2.6], look: [-1.0, 1.0, 0.2], fov: 44 }, { f: 419, pos: [1.35, 1.45, 2.5], look: [-1.1, 1.0, 0.2], fov: 42 }],
};
export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id]; let c;
  if (f <= K[0].f) c = { ...K[0] }; else if (f >= K[K.length - 1].f) c = { ...K[K.length - 1] };
  else for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f <= K[i + 1].f) { const t = smooth((f - K[i].f) / (K[i + 1].f - K[i].f)), a = K[i], b = K[i + 1]; c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: 0 }; }
  c.flash = 0; c.shadowAt = [0, 0.8, 0]; return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'wide': return { focus: dist(C.pos, [0, 1.5, -2.6]), cinf: 4 };
    case 'boy': return { focus: dist(C.pos, [0.25, 0.8, 0.2]), cinf: 9 };
    case 'mom': return { focus: dist(C.pos, [-2.0, 1.0, 0.2]), cinf: 8 };
    case 'book': return { focus: dist(C.pos, [1.25, 0.78, 0.6]), cinf: 12 };
    default: return { focus: dist(C.pos, [-1.0, 1.0, 0.3]), cinf: 5 };
  }
};
export const worldAt = (f) => {
  const S = shotAt(f);
  const door = f < 149 ? 0.0 : f < 160 ? smooth(ramp(f, 149, 160)) : f < 410 ? 1 : 1 - smooth(ramp(f, 410, 419));
  return { door: f < 149 ? 0.0 : door, lamp: S.id === 'leave' ? 1 - smooth(ramp(f, 405, 419)) : 1 };
};
const blinkAt = (f, seed) => { const per = 60 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
let inited = false;
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
export const actorsAt = (f, T) => {
  if (!inited) { T.OUTFITS.boy = { tunic: '#3d6fa6', skin: '#f5c9a0', hair: '#6a4a2a' }; T.OUTFITS.mom = { tunic: '#a8483a', dress: '#a8483a', skin: '#f5c9a0', hair: '#3b2a20' }; inited = true; }
  const S = shotAt(f), out = [];
  const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
  if (S.id === 'boy' || S.id === 'mom') {
    out.push(R(T, 'boy', { expr: 'nervous', L: 'belly', R: 'belly', blink: blinkAt(f, 3), look: S.id === 'mom' ? -0.5 : 0.2, seed: 5, bob: q(0.004 * Math.sin(f * 0.12), 3) }, [0.25, 0, 0.2], { s: 0.62 }));
    out.push({ key: 'teddy', draw: (p) => { p.ell(300, 905, 62, 70, '#a8743c', 8); p.ell(300, 840, 46, 46, '#b8844c', 8); p.ell(262, 805, 16, 16, '#a8743c', 6); p.ell(338, 805, 16, 16, '#a8743c', 6); p.dot(286, 840, 5); p.dot(314, 840, 5); p.ell(300, 856, 14, 10, '#d9b58a', 4); }, x: 0.27, y: 0.5, z: 0.5, s: 0.36, blob: false, shadow: false, order: 4 });
  }
  if (S.id === 'mom') out.push(R(T, 'mom', { expr: 'neutral', L: 'hang', R: 'hip', blink: blinkAt(f, 11), look: 0.4, seed: 8, headTilt: q(2 * Math.sin(f * 0.05), 1) }, [-1.95, 0, 0.3], { s: 0.8, tint: '#fff0dc' }));
  if (S.id === 'book') out.push(R(T, 'boy', { expr: 'nervous', L: 'hang', R: 'hang', blink: blinkAt(f, 3), look: 0.5, seed: 5 }, [-0.5, 0, -1.0], { s: 0.62 }));
  if (S.id === 'leave') {
    const mx = lerp(-1.95, -3.1, smooth(ramp(f, 341, 380))), bx = lerp(0.1, -3.2, smooth(ramp(f, 350, 410)));
    const st = (a, b) => (f >= a && f <= b) ? q((f * 0.05) % 1, 2) : 0;
    out.push(R(T, 'mom', { expr: 'neutral', L: 'hang', R: 'hang', seed: 8, facing: -1, step: st(341, 380) }, [mx, 0, 0.3], { s: 0.8, tint: '#fff0dc' }));
    if (bx > -3.15) out.push(R(T, 'boy', { expr: 'nervous', L: 'belly', R: 'belly', seed: 5, facing: -1, step: st(350, 410), look: -0.6 }, [bx, 0, 0.3], { s: 0.62 }));
    out.push({ key: 'teddy', draw: (p) => { p.ell(300, 905, 62, 70, '#a8743c', 8); p.ell(300, 840, 46, 46, '#b8844c', 8); p.ell(262, 805, 16, 16, '#a8743c', 6); p.ell(338, 805, 16, 16, '#a8743c', 6); p.dot(286, 840, 5); p.dot(314, 840, 5); p.ell(300, 856, 14, 10, '#d9b58a', 4); }, x: bx + 0.05, y: 0.5, z: 0.5, s: 0.36, blob: false, shadow: false, order: 4 });
  }
  return out;
};
export const fxAt = () => [];
