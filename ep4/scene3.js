// Ep4 style test — Scene 3 "Asking for directions" in the new limited-animation style:
// static backgrounds, one character per shot (shot / reverse shot), held poses that switch on words,
// mouth driven by the real voice envelope, eyes/brows carry the emotion.
// node ep4/scene3.js plan | still t1,t2,.. out.png | video out.mp4 [from to]
require('../lib/fonts');
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const { drawGus } = require('../lib/gus');
const { drawRose, drawDog } = require('../lib/rose');
const { OL, paint, line, curve, roundRect, clamp, lerp, ease } = require('../lib/draw');
const U = require('../lib/ui');
const U2 = require('../ep2/ui2');
const F = require('../lib/fonts');
const B = require('./bg4');
U2.STYLE.rose = { bg: '#7D4E8A', on: '#FFD23F', past: '#FFFFFF', idle: '#FFFFFF' };

const W = 1920, H = 1080, FPS = 30;
const VO = JSON.parse(fs.readFileSync(__dirname + '/vo/vo.json'));

// ---------------- poses ----------------
const GP = { // Gus
  polite: { lids: 0.4, neck: 0.12, wing: 0.28, look: 0.4 },
  worried: { lids: 0.0, neck: -0.25, wing: 0.12, look: -0.3, sweat: 1 },
  worried2: { lids: 0.05, neck: -0.1, wing: 0.2, look: 0.5, sweat: 1 },
  shrug: { lids: 0.55, neck: 0.0, wing: 0.5, look: 0.2 },
  dreamy: { lids: 0.78, neck: 0.25, wing: 0.15, look: -0.2 },
  excited: { lids: 0.0, neck: 0.3, wing: 0.85, look: 0.6, flap: 1, bounce: 1 },
  eager: { lids: 0.1, neck: 0.25, wing: 0.3, look: 0.6 },
  think: { lids: 0.35, neck: -0.2, wing: 0.4, look: -0.6, count: 1 },
  shock: { lids: 0.0, neck: -0.4, wing: 0.55, look: 0.5, bounce: 0.5 },
  feet: { lids: 0.1, neck: -0.75, wing: 0.1, look: -0.4 },
  deadpan: { lids: 0.6, neck: 0.05, wing: 0.1, look: 0.4 },
  thanks: { lids: 0.25, neck: 0.15, wing: 0.7, look: 0.5, flap: 0.5 },
  walk: { lids: 0.4, neck: 0.1, wing: 0.1, look: 0.4 },
};
const RP = { // Mrs. Rose (crew rig units; she faces screen-left towards Gus)
  rest: { armL: [-110, -10], armR: [110, -10], handL: 'relax', handR: 'relax', armsFront: false, browL: 0.2, browR: 0.2, smile: 0.6, surprise: 0, lean: 0 },
  clasp: { armL: [-26, -150], armR: [26, -150], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.35, browR: 0.35, smile: 0.85 },
  open: { armL: [-215, -175], armR: [215, -175], handL: 'open', handR: 'open', armsFront: true, browL: 0.7, browR: 0.7, smile: 0.4 },
  chin: { armL: [-30, -150], armR: [70, -235], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.55, browR: 0.1, smile: 0.2 },
  ah: { armL: [-110, -10], armR: [150, -420], handL: 'relax', handR: 'open', armsFront: true, browL: 0.9, browR: 0.9, smile: 0.9, surprise: 0.6 },
  happy: { armL: [-26, -150], armR: [26, -150], handL: 'relax', handR: 'relax', armsFront: true, browL: 0.5, browR: 0.5, smile: 1 },
  pointL: { armL: [-320, -255], armR: [60, -120], handL: 'open', handR: 'relax', armsFront: true, browL: 0.4, browR: 0.4, smile: 0.7 },
  pointLup: { armL: [-270, -400], armR: [60, -120], handL: 'open', handR: 'relax', armsFront: true, browL: 0.5, browR: 0.5, smile: 0.7 },
  pointR: { armL: [-60, -120], armR: [320, -265], handL: 'relax', handR: 'open', armsFront: true, browL: 0.4, browR: 0.4, smile: 0.75 },
  playful: { armL: [-26, -150], armR: [300, -300], handL: 'relax', handR: 'open', armsFront: true, browL: 0.7, browR: 0.3, smile: 1, lean: 0.05 },
  wave: { armL: [-26, -150], armR: [270, -470], handL: 'relax', handR: 'open', armsFront: true, browL: 0.5, browR: 0.5, smile: 1, waveHand: 1 },
  sigh: { armL: [-26, -150], armR: [26, -150], handL: 'relax', handR: 'relax', armsFront: true, browL: -0.1, browR: -0.1, worry: 1, smile: -0.1, shake: 1 },
};

// ---------------- script ----------------
// shot: 'gus' | 'rose' | 'wide'. keys: [wordIndex, pose]. extra: cards / highlights / bubble.
const SCRIPT = [
  { id: 'g01', shot: 'gus', keys: [[0, 'polite']] },
  { id: 'r01', shot: 'rose', keys: [[0, 'clasp']] },
  { id: 'g02', shot: 'gus', keys: [[0, 'worried'], [4, 'worried2']] },
  { id: 'r02', shot: 'rose', keys: [[0, 'open'], [3, 'clasp'], [10, 'chin']] },
  { id: 'g03', shot: 'gus', keys: [[0, 'shrug'], [3, 'dreamy']], bubble: 7 },
  { id: 'r03', shot: 'rose', keys: [[0, 'ah'], [3, 'happy']] },
  { id: 'g04', shot: 'gus', keys: [[0, 'excited'], [3, 'eager']] },
  { id: 'r04', shot: 'rose', keys: [[0, 'clasp'], [2, 'pointL'], [5, 'pointLup']], cards: [[3, 0], [6, 1]] },
  { id: 'r05', shot: 'rose', keys: [[0, 'pointL'], [5, 'pointR']], cards: [[2, 2], [10, 3]], gap: 0.25 },
  { id: 'g05', shot: 'gus', keys: [[0, 'think']], hi: [[1, 0], [3, 1], [7, 2], [12, 3]] },
  { id: 'r06', shot: 'rose', keys: [[0, 'happy'], [2, 'clasp']], nod: [0, 2] },
  { id: 'g06', shot: 'gus', keys: [[0, 'shock'], [2, 'feet']] },
  { id: 'r07', shot: 'rose', keys: [[0, 'clasp'], [2, 'playful']] },
  { id: 'g07', shot: 'gus', keys: [[0, 'deadpan'], [10, 'thanks']] },
  { id: 'r08', shot: 'rose', keys: [[0, 'clasp'], [3, 'wave']] },
  { id: 'g08', shot: 'wide', keys: [[0, 'walk']], gap: 2.9 },
  { id: 'g09', shot: 'wide', keys: [[0, 'walk']], gap: 0.6 },
];
const CARDS = [
  { label: 'GO STRAIGHT', icon: 'up' }, { label: 'TURN LEFT', icon: 'left' },
  { label: 'GO PAST THE PARK', icon: 'tree' }, { label: 'ON YOUR RIGHT', icon: 'right' },
];

// ---------------- timeline ----------------
const INTRO = 3.4;
let t = INTRO; const LINES = []; let prevWho = null;
for (const S of SCRIPT) {
  const v = VO[S.id];
  t += S.gap !== undefined ? S.gap : (prevWho && prevWho !== v.who ? 0.5 : 0.35);
  const L = Object.assign({}, S, { who: v.who, text: v.text, t0: t, dur: v.dur, env: v.env, t1: t + v.dur });
  L.words = wordTimes(v.text, v.env, t);
  LINES.push(L); t = L.t1; prevWho = v.who;
}
function wordTimes(text, env, t0) { // spread words over voiced frames by syllable weight
  const ws = text.split(' '), syl = ws.map(w => Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) || []).length) + 0.5);
  const voiced = env.map(e => e > 0.08 ? 1 : 0.15), cum = [0]; for (const v of voiced) cum.push(cum[cum.length - 1] + v);
  const tot = cum[cum.length - 1], S = syl.reduce((a, b) => a + b, 0);
  const at = q => { let i = 0; while (i < cum.length - 1 && cum[i + 1] < q) i++; const f = (q - cum[i]) / (cum[i + 1] - cum[i] || 1); return t0 + (i + f) / FPS; };
  let acc = 0; return ws.map((w, i) => { const a = at(acc / S * tot); acc += syl[i]; const b = at(acc / S * tot); return { w, t0: a, t1: a + (b - a) * 0.92 }; });
}
const L_ = id => LINES.find(l => l.id === id);
const wt = (id, i) => L_(id).words[Math.min(i, L_(id).words.length - 1)].t0;
// outro beats
const G08 = L_('g08'), G09 = L_('g09');
const OUT = { walk0: L_('r08').t1 + 0.5, walk1: G08.t0 - 0.2, exit0: G09.t1 + 0.25, exit1: G09.t1 + 1.6 };
OUT.bark = OUT.exit1 + 0.1; OUT.sigh0 = OUT.bark + 1.2; OUT.end0 = OUT.sigh0 + 2.2; OUT.T = OUT.end0 + 3.6;
const T = OUT.T;

// shots
const SHOTS = [{ t: 0, type: 'wide' }];
for (const L of LINES) { if (L.shot === 'wide') continue; const last = SHOTS[SHOTS.length - 1]; if (last.type !== L.shot) SHOTS.push({ t: L.t0 - 0.12, type: L.shot }); }
SHOTS.push({ t: OUT.walk0 - 0.1, type: 'wide' }, { t: OUT.sigh0, type: 'rose', sigh: true }, { t: OUT.end0, type: 'end' });
const shotAt = q => { let s = SHOTS[0], i = 0; SHOTS.forEach((x, k) => { if (q >= x.t) { s = x; i = k; } }); return Object.assign({ t1: (SHOTS[i + 1] || { t: T }).t }, s); };

// ---------------- helpers ----------------
function blend(a, b, u) {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, u);
  if (Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => lerp(x, b[i], u));
  return u < 0.5 ? (a !== undefined ? a : b) : (b !== undefined ? b : a);
}
function blendObj(A, Bo, u) { const o = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(Bo)])) o[k] = blend(A[k] ?? Bo[k], Bo[k] ?? A[k], u); return o; }
function poseFor(who, q, LIB, base) { // held pose of the latest key of this character's lines, eased over 0.16 s
  const keys = [];
  for (const L of LINES) if (L.who === who) for (const [wi, name] of L.keys) keys.push([wi === 0 ? L.t0 - 0.12 : L.words[Math.min(wi, L.words.length - 1)].t0 - 0.06, name]);
  let cur = [-99, base], prev = [-99, base];
  for (const k of keys) if (q >= k[0]) { prev = cur; cur = k; }
  const u = ease.out(clamp((q - cur[0]) / 0.16));
  return blendObj(LIB[prev[1]] || LIB[base], LIB[cur[1]] || LIB[base], u);
}
function talkLevel(who, q) {
  for (const L of LINES) if (L.who === who && q >= L.t0 && q < L.t1) { const i = Math.floor((q - L.t0) * FPS); return clamp((L.env[i] || 0) * 1.25); }
  return 0;
}
const activeLine = q => LINES.find(l => q >= l.t0 - 0.1 && q < l.t1 + 0.4);
const blink = (q, s) => { const p = 3.3 + s * 0.41, u = (q + s * 1.7) % p; return u < 0.06 ? u / 0.06 : u < 0.14 ? 1 - (u - 0.06) / 0.08 : 0; };

// ---------------- props / overlays ----------------
function burger(c, X, Y, s) {
  c.save(); c.translate(X, Y); c.scale(s, s);
  paint(c, q => { q.moveTo(-80, -6); q.bezierCurveTo(-80, -70, 80, -70, 80, -6); q.closePath(); }, '#E9A54A', { shade: '#C8862E', sx: 0, sy: -8, lw: 6 });
  c.fillStyle = '#FFF4D6'; for (const [x, y] of [[-40, -34], [-8, -46], [28, -36], [50, -22], [-58, -18]]) { c.beginPath(); c.ellipse(x, y, 7, 4, 0.3, 0, 7); c.fill(); }
  paint(c, q => { q.moveTo(-88, 0); for (let i = 0; i <= 8; i++) q.lineTo(-88 + i * 22, i % 2 ? 14 : 2); q.lineTo(88, 2); q.closePath(); }, '#6FCF5F', { lw: 5 });
  paint(c, q => roundRect(q, -84, 8, 168, 22, 10), '#FFD23F', { lw: 5 });
  paint(c, q => roundRect(q, -82, 24, 164, 30, 14), '#8A4A2E', { lw: 6 });
  paint(c, q => { q.moveTo(-80, 52); q.lineTo(80, 52); q.bezierCurveTo(80, 82, -80, 82, -80, 52); q.closePath(); }, '#E9A54A', { lw: 6 });
  c.restore();
}
function thought(c, X, Y, k, q) {
  if (k <= 0) return; const a = ease.back(clamp(k));
  c.save(); c.translate(X, Y); c.scale(a, a);
  for (const [dx, dy, r] of [[-150, 150, 14], [-120, 110, 22]]) paint(c, p => p.arc(dx, dy, r, 0, 7), '#FFFFFF', { lw: 5 });
  paint(c, p => { for (const [dx, dy, r] of [[-60, 0, 70], [0, -40, 80], [70, -10, 75], [40, 50, 70], [-30, 50, 66]]) { p.moveTo(dx + r, dy); p.arc(dx, dy, r, 0, 7); } }, '#FFFFFF', { lw: 6 });
  c.save(); c.beginPath(); for (const [dx, dy, r] of [[-60, 0, 64], [0, -40, 74], [70, -10, 69], [40, 50, 64], [-30, 50, 60]]) { c.moveTo(dx + r, dy); c.arc(dx, dy, r, 0, 7); } c.fillStyle = '#FFFFFF'; c.fill(); c.restore();
  burger(c, 8, 6 + Math.sin(q * 3) * 4, 0.95);
  c.restore();
}
function arrowIcon(c, kind, X, Y, s) {
  c.save(); c.translate(X, Y); c.scale(s, s);
  paint(c, q => q.arc(0, 0, 34, 0, 7), '#FFFFFF', { lw: 5 });
  const G = '#2F9466';
  if (kind === 'tree') { paint(c, q => q.rect(-5, 2, 10, 20), '#8A5A34', { lw: 3 }); paint(c, q => q.arc(0, -6, 17, 0, 7), '#5DBB63', { lw: 4 }); }
  else {
    c.rotate({ up: 0, left: -Math.PI / 2, right: Math.PI / 2 }[kind]);
    paint(c, q => { q.moveTo(0, -24); q.lineTo(18, -4); q.lineTo(7, -4); q.lineTo(7, 22); q.lineTo(-7, 22); q.lineTo(-7, -4); q.lineTo(-18, -4); q.closePath(); }, G, { lw: 4 });
  }
  c.restore();
}
function route(c, q, side) { // directions checklist panel
  const shown = [], hi = [];
  for (const L of LINES) { for (const [wi, ci] of L.cards || []) if (q >= L.words[wi].t0) shown[ci] = L.words[wi].t0; for (const [wi, ci] of L.hi || []) if (q >= L.words[wi].t0 - 0.05) hi[ci] = L.words[wi].t0; }
  if (!shown.length) return;
  const g05 = L_('g05'), fade = 1 - clamp((q - g05.t1 - 0.6) / 0.35); if (fade <= 0) return;
  const X = side === 'left' ? 50 : 1250, Y = 60, Wd = 620;
  c.save(); c.globalAlpha = fade;
  const n = shown.filter(x => x !== undefined).length, h = 92 + n * 92;
  paint(c, p => roundRect(p, X, Y, Wd, h, 30), 'rgba(255,255,255,0.95)', { lw: 7 });
  c.save(); c.beginPath(); roundRect(c, X, Y, Wd, h, 30); c.clip(); c.fillStyle = '#2F9466'; c.fillRect(X, Y, Wd, 72); c.restore();
  line(c, [[X, Y + 72], [X + Wd, Y + 72]], 6, OL);
  U.textOutlined(c, 'DIRECTIONS', X + 32, Y + 52, 40, '#FFFFFF', { align: 'left', olw: 7 });
  CARDS.forEach((cd, i) => {
    if (shown[i] === undefined) return;
    const k = ease.back(clamp((q - shown[i]) / 0.3)), y = Y + 72 + 50 + i * 92, on = hi[i] !== undefined;
    const pop = on ? 1 + 0.12 * Math.max(0, 1 - (q - hi[i]) / 0.3) : 1;
    c.save(); c.translate(X + 60, y); c.scale(k * pop, k * pop);
    arrowIcon(c, cd.icon, 0, 0, 1);
    U.textOutlined(c, cd.label, 56, 17, 48, on ? '#FF7A2F' : '#3a221d', { align: 'left', olw: on ? 8 : 0 });
    if (on) { paint(c, p => p.arc(Wd - 120, 0, 20, 0, 7), '#2F9466', { lw: 4 }); line(c, [[Wd - 130, 0], [Wd - 122, 9], [Wd - 108, -9]], 6, '#FFFFFF'); }
    c.restore();
  });
  c.restore();
}
function sweat(c, X, Y, q) { const k = (q * 0.9) % 1; c.save(); c.globalAlpha = 1 - k; paint(c, p => { p.moveTo(X, Y + k * 40); p.quadraticCurveTo(X + 16, Y + 26 + k * 40, X, Y + 34 + k * 40); p.quadraticCurveTo(X - 16, Y + 26 + k * 40, X, Y + k * 40); p.closePath(); }, '#8FD0F7', { lw: 4 }); c.restore(); }

// ---------------- characters ----------------
function gusParams(q, extra = {}) {
  const P = poseFor('gus', q, GP, 'polite'), tk = talkLevel('gus', q);
  const flap = (P.flap || 0) * Math.sin(q * 14) * 0.2, cnt = (P.count || 0) * Math.sin(q * 5) * 0.12;
  const bounce = (P.bounce || 0) * Math.abs(Math.sin(q * 7)) * 0.035;
  return Object.assign({
    face: 1, lids: Math.max(P.lids, blink(q, 2) > 0.5 ? 0.95 : 0), neck: P.neck + tk * 0.06 * Math.sin(q * 9), look: P.look,
    wing: clamp(P.wing + flap + cnt), honk: tk * 0.95, squash: 1 + bounce + Math.sin(q * 2.4) * 0.006, _sweat: P.sweat || 0,
  }, extra);
}
function roseParams(q, base = 'rest', force = null) {
  let P = poseFor('rose', q, RP, base); if (force) P = blendObj(P, RP[force[0]], ease.out(clamp((q - force[1]) / 0.25)));
  const tk = talkLevel('rose', q);
  const ln = LINES.find(l => l.who === 'rose' && l.nod && q >= l.words[l.nod[0]].t0 && q < l.words[l.nod[1]].t0);
  const nod = ln ? Math.sin((q - ln.words[ln.nod[0]].t0) * 12) * 0.05 : 0;
  const shake = P.shake ? Math.sin(q * 9) * 0.07 : 0;
  const wav = P.waveHand ? Math.sin(q * 10) * 34 : 0;
  return {
    turn: -0.32 + shake * 2, tilt: -0.04 + nod + tk * 0.025 * Math.sin(q * 7), lean: P.lean || 0, bob: Math.sin(q * 2.1) * 3 + (P.waveHand ? 0 : 0),
    look: [-0.55, P.shake ? 0.35 : 0.05], blink: blink(q, 5), browL: P.browL, browR: P.browR, surprise: P.surprise || 0, wide: (P.surprise || 0) * 0.8,
    mouth: { open: tk * 0.85, smile: P.smile, w: 1 - tk * 0.15 },
    armL: P.armL, armR: [P.armR[0] + wav, P.armR[1]], handL: P.handL, handR: P.handR, armsFront: P.armsFront,
  };
}

// ---------------- frame ----------------
// ---------------- one scene, one camera ----------------
// Everything lives in the wide street's coordinates. A close-up is only the camera moving closer:
// the background geometry and every character position stay the same between shots.
const GY = 965;                    // where feet touch the sidewalk (world)
const POS = { gus: 760, rose: 1330, dog: 1480 };
const S_ = { gus: 0.56, rose: 0.44, dog: 0.42 };
const CAM = {                      // [centre x, centre y, zoom]
  wide: [960, 540, 1],
  gus: [871, 850, 2.6],            // Gus medium shot, look-room to the right (towards Mrs. Rose)
  rose: [1226, 678, 3.0],          // Mrs. Rose waist-up, the bank behind her
};
let BG = {};
function bgFor(cam) { // pre-render the SAME street through this camera (outline width kept like the characters')
  const [cx, cy, z] = cam, R = 1.1, c = createCanvas(Math.round(W * R), Math.round(H * R)), x = c.getContext('2d');
  x.scale(R, R); x.translate(W / 2, H / 2); x.scale(z, z); x.translate(-cx, -cy);
  const lk = z > 1 ? 1.4 / z : 1;
  const px = new Proxy(x, { get: (t, k) => { const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; }, set: (t, k, v) => { t[k] = k === 'lineWidth' ? v * lk : v; return true; } });
  B.drawWide(px); return c;
}
function gusX(q) { // Gus position over the whole scene (world x), plus walking/facing
  let gx, walking = false, face = 1;
  if (q < OUT.walk0) { const k = clamp(q / 2.6); gx = lerp(-160, POS.gus, ease.out(k)); walking = k < 0.97; }
  else if (q < OUT.walk1) { const k = clamp((q - OUT.walk0) / (OUT.walk1 - OUT.walk0)); gx = lerp(POS.gus, 1720, ease.inOut(k)); walking = k > 0.02 && k < 0.98; }
  else if (q < OUT.exit0) { gx = 1720; if (q >= wt('g08', 4) - 0.1 && q < wt('g08', 6) - 0.1) face = -1; }
  else { const k = clamp((q - OUT.exit0) / (OUT.exit1 - OUT.exit0)); gx = lerp(1720, 2300, ease.in(k)); walking = true; }
  return { gx, walking, face };
}
function world(ctx, q, s) {
  // Mrs. Rose + Biscuit
  let force = null;
  if (s.sigh) force = ['sigh', OUT.sigh0 - 0.3]; else if (q > OUT.walk1) force = ['clasp', OUT.walk1];
  const rp = roseParams(q, 'rest', force);
  if (q > OUT.walk0 && !s.sigh) { rp.turn = lerp(-0.3, 0.35, clamp((q - OUT.walk0 - 1.0) / 0.6)); rp.look = [rp.turn > 0 ? 0.7 : -0.6, 0]; }
  drawRose(ctx, POS.rose, GY - 280 * S_.rose, S_.rose, rp);
  const bk = [0, 0.32].map(o => clamp(1 - Math.abs(q - OUT.bark - o) / 0.12)).reduce((a, b) => Math.max(a, b));
  drawDog(ctx, POS.dog, GY + 6, S_.dog, { face: q > OUT.walk0 + 1.2 ? 1 : -1, tail: q * 9, bark: bk });
  // Gus
  const g = gusX(q);
  const gp = q < OUT.walk0 && !g.walking ? gusParams(q) : gusParams(q, { face: g.face, walking: g.walking, walk: q * 2.2, lids: q >= G09.t0 ? 0.0 : 0.4 });
  if (q >= G09.t0) { gp.neck = 0.35; gp.wing = 0.5; }
  drawGus(ctx, g.gx, GY + 10, S_.gus, gp);
  // gags attached to Gus (sized in his close-up layout, mapped into world space)
  const L = L_('g03'), bkb = q >= wt('g03', L.bubble) - 0.1 && q < L.t1 + 0.9 ? clamp((q - wt('g03', L.bubble) + 0.1) / 0.25) * (1 - clamp((q - L.t1 - 0.6) / 0.3)) : 0;
  ctx.save(); ctx.translate(g.gx, GY + 10); ctx.scale(S_.gus / 1.52, S_.gus / 1.52); ctx.translate(-720, -1015);
  if (gp._sweat > 0.5) sweat(ctx, 760, 260, q);
  thought(ctx, 1150, 250, bkb, q);
  ctx.restore();
  if (bk > 0.3) U.textOutlined(ctx, 'WOOF!', POS.dog + 60, 840, 64, '#FFD23F', { olw: 10 });
}
function endCard(ctx, q) {
  ctx.drawImage(BG.wide, 0, 0, W, H);
  ctx.fillStyle = 'rgba(30,24,40,0.55)'; ctx.fillRect(0, 0, W, H);
  const k = ease.back(clamp((q - OUT.end0) / 0.4)), k2 = ease.back(clamp((q - OUT.end0 - 0.9) / 0.4));
  ctx.save(); ctx.translate(960, 420); ctx.scale(k, k); U.textOutlined(ctx, 'At the bank, Gus turned RIGHT.', 0, 0, 84, '#FFFFFF', { olw: 14 }); ctx.restore();
  ctx.save(); ctx.translate(960, 600); ctx.scale(k2, k2); U.textOutlined(ctx, 'Was that correct?', 0, 0, 120, '#FFD23F', { olw: 16 }); ctx.restore();
  const k3 = clamp((q - OUT.end0 - 1.8) / 0.3); ctx.save(); ctx.globalAlpha = k3; U.textOutlined(ctx, 'Write your answer in the comments!', 960, 760, 56, '#FFFFFF', { olw: 10 }); ctx.restore();
}

function frame(ctx, q) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const s = shotAt(q);
  if (s.type === 'end') endCard(ctx, q);
  else {
    const cam = CAM[s.type] || CAM.wide;
    const push = s.type !== 'wide' ? 1 + 0.035 * ease.inOut(clamp((q - s.t) / Math.max(0.5, s.t1 - s.t))) : 1; // slow camera push-in
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(push, push); ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(BG[s.type] || BG.wide, 0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam[2], cam[2]); ctx.translate(-cam[0], -cam[1]);
    world(ctx, q, s);
    ctx.restore(); ctx.restore();
    if (s.type === 'gus') route(ctx, q, 'right'); else if (s.type === 'rose') route(ctx, q, 'left');
  }
  const L = activeLine(q); if (L && s.type !== 'end') U2.caption(ctx, L.words, q, L.who);
  // corner tag: test + placeholder voices
  ctx.save(); ctx.globalAlpha = 0.8; paint(ctx, p => roundRect(p, 30, H - 74, 560, 48, 16), '#1E2433', { lw: 0 });
  ctx.fillStyle = '#FFD23F'; ctx.font = `800 26px ${F.EN}`; ctx.textAlign = 'left'; ctx.fillText('STYLE TEST · temporary voices', 52, H - 40); ctx.restore();
}

// ---------------- audio plan (for ep4/audio.py) ----------------
function plan() {
  const sfx = [{ t: 0.1, name: 'waddle' }, { t: OUT.walk0 + 0.1, name: 'waddle' }, { t: OUT.walk0 + 1.7, name: 'waddle' }, { t: OUT.exit0, name: 'waddle' },
    { t: OUT.bark, name: 'bark' }, { t: OUT.bark + 0.32, name: 'bark' }, { t: wt('g03', L_('g03').bubble), name: 'pop' }, { t: OUT.end0 + 0.9, name: 'ding' }];
  for (const L of LINES) { for (const [wi] of L.cards || []) sfx.push({ t: L.words[wi].t0, name: 'card' }); for (const [wi] of L.hi || []) sfx.push({ t: L.words[wi].t0, name: 'tick' }); }
  fs.writeFileSync(__dirname + '/plan.json', JSON.stringify({ T, lines: LINES.map(l => ({ id: l.id, who: l.who, t0: l.t0 })), sfx }));
  // English subtitles
  const ts = x => { const h = Math.floor(x / 3600), m = Math.floor(x / 60) % 60, s = Math.floor(x) % 60, ms = Math.round((x % 1) * 1000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`; };
  fs.writeFileSync(__dirname + '/scene3_en.srt', LINES.map((l, i) => `${i + 1}\n${ts(l.t0)} --> ${ts(l.t1 + 0.3)}\n${l.text}\n`).join('\n'));
  console.log('T =', T.toFixed(2), 's,', LINES.length, 'lines,', SHOTS.length, 'shots');
}

async function main() {
  const [mode, a, b, c2] = process.argv.slice(2);
  if (mode === 'plan') return plan();
  BG = { wide: bgFor(CAM.wide), gus: bgFor(CAM.gus), rose: bgFor(CAM.rose) };
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'still') {
    const ts = a.split(',').map(Number), sc = 0.5, S = createCanvas(W, H * sc * Math.ceil(ts.length / 2)), sx = S.getContext('2d');
    ts.forEach((q, i) => { frame(ctx, q); sx.drawImage(cv, (i % 2) * W * sc, Math.floor(i / 2) * H * sc, W * sc, H * sc); });
    fs.writeFileSync(b, S.toBuffer('image/png')); return;
  }
  const f0 = Math.round((b ? +b : 0) * FPS), f1 = Math.round((c2 ? +c2 : T) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-tune', 'animation', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log('frame', f, '/', f1);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
main();
