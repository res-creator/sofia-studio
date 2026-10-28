// THE ACCIDENTAL MAFIA BOSS — animation test scene "NO FIGHTING!" (16:9, 30 fps, temporary text lines, no voices).
// node mafia_nofight.js 0 1230 out.mp4   |   0 0 --png=f1,f2   |   --cues  (prints the SFX cue list as JSON for mafia_test_mix.py)
const H = require('./hq'); const E = require('./engine_v2'); const A = require('./act'); const FF = require('./faces_plus'); const PF = require('./props_fx');
const S = require('./mafia_set'); const { CAST, G } = S;
const { clamp, lerp, eIO, eOut, eIn, P, rr, paint, noise1 } = H;
const W = 1920, HH = 1080, FPS = 30, DUR = 40.6, NF = Math.round(DUR * FPS);
const key = A.key, between = (t, a, b) => t >= a && t < b;

// ---------------------------------------------------------------- staging (world units, floor y = 0)
const X = { bruno: -720, marco: -180, tony: 380 };
const T1 = { x0: -2050, x1: -1500, top: -700 };                 // the table the bat goes under (cloth edge at x1 + 70)
const PAT = { x: 2300, fy: -160, s: 0.8, seat: 330 };           // Mrs. Patterson's table in the back row (smaller = further away)
const PT = { x0: -470, x1: 230, top: -560 };                    // her table, in her group's local space

// temporary lines: [who, from, to, English, Russian]
const LINES = [
  ['marco', 0.35, 1.75, 'Too much salt!', 'Слишком много соли!'],
  ['bruno', 1.95, 3.3, "No! It's perfect!", 'Нет! Он идеальный!'],
  ['alex', 7.15, 8.6, 'Stop! No fighting!', 'Стоп! Никаких драк!'],
  ['alex', 18.85, 19.85, 'I saw that.', 'Я всё видел.'],
  ['alex', 20.2, 21.6, 'This is a restaurant!', 'Это ресторан!'],
  ['alex', 24.9, 26.1, 'And... smile more!', 'И... больше улыбайтесь!'],
  ['alex', 26.4, 27.8, 'Customers love a smile!', 'Клиенты любят улыбку!'],
  ['tony', 28.35, 29.25, 'Smile. Okay.', 'Улыбаться. Ладно.'],
  ['alex', 36.6, 38.0, '...Maybe smile less.', '...Может, улыбайтесь поменьше.'],
];
const talking = (who, t) => LINES.some(l => l[0] === who && t >= l[1] && t < l[2]);
const talkOf = (who, t, seed) => A.flap(t, talking(who, t), seed);

// ---------------------------------------------------------------- shots (hard cuts; one crash zoom on Tony's grin)
const SH = {
  WIDE: { x: 450, y: -880, z: 0.36 },
  ALEX_M: { x: 1300, y: -1080, z: 0.74, only: ['alex', 'pat'] },
  DUO: { x: -450, y: -1060, z: 0.62 },
  MARCO_CU: { x: -180, y: -870, z: 1.05, only: ['marco'] },
  BRUNO_M: { x: -950, y: -960, z: 0.52 },
  FEET: { x: -1120, y: -300, z: 0.95 },
  BRUNO_FACE: { x: -700, y: -1480, z: 1.0, only: ['bruno'] },
  ALEX_M2: { x: 1300, y: -1100, z: 0.74, only: ['alex', 'pat'] },
  TRIO: { x: -170, y: -1230, z: 0.52, hide: ['alex', 'pat'] },
  TONY_CU: { x: 380, y: -1480, z: 1.3, only: ['tony'] },
  PAT_M: { x: 2430, y: -600, z: 1.1, only: ['pat'] },
  ALEX_CU: { x: 1000, y: -1390, z: 1.35, only: ['alex'] },
};
const CUTS = [[0, 'WIDE'], [7.0, 'ALEX_M'], [8.7, 'DUO'], [10.3, 'MARCO_CU'], [12.6, 'BRUNO_M'], [14.9, 'FEET'], [17.5, 'BRUNO_FACE'], [18.6, 'ALEX_M2'],
  [21.8, 'TRIO'], [23.4, 'WIDE'], [27.9, 'TRIO'], [29.4, 'TONY_CU'], [32.6, 'PAT_M'], [34.6, 'ALEX_CU'], [36.4, 'WIDE']];
const CZ = { t: 31.0, d: 0.2, z1: 2.4, x: 380, y: -1470 };          // crash zoom into Tony's grin
function shotAt(t) { let n = CUTS[0][1]; for (const [ts, s] of CUTS) if (t >= ts) n = s; return n; }
function camAt(t, n) { const s = SH[n]; if (n === 'TONY_CU' && t >= CZ.t) { const k = eOut(clamp((t - CZ.t) / CZ.d)); return { ...s, x: lerp(s.x, CZ.x, k), y: lerp(s.y, CZ.y, k), z: lerp(s.z, CZ.z1, k) }; } return s; }
// impact shake (punctuation for the sounds, not a camera move)
const HITS = [[14.62, 6], [33.45, 14], [31.0, 5]];
function shake(t) { let a = 0; for (const [ht, g] of HITS) { const d = t - ht; if (d >= 0 && d < 0.4) a += g * Math.exp(-d * 10); } return { x: noise1(t * 37) * a, y: noise1(t * 41 + 5) * a }; }

// ---------------------------------------------------------------- props on hands
const IT = { finger: PF.finger(CAST.alex), book: S.notebookItem(0), bookOpen: S.notebookItem(1, 1), knuck: S.knuckles(CAST.marco), cup: S.teacupItem };
const poser = {}; for (const k of ['alex', 'tony', 'marco', 'bruno', 'patterson']) poser[k] = A.poser(CAST[k], G[k], { items: { ...IT, finger: PF.finger(CAST[k]) } });
// wrist position of a posed arm in the character's local space (same maths as hq.armV2)
function wrist(g, side, Arm, lean = 0) { const sh = side < 0 ? g.shL : g.shR, ua = g.h * 0.18, fa = g.h * 0.165 * (Arm.fl ?? 1), a1 = Arm.a, a2 = Arm.a - Arm.b;
  const ex = sh.x + lean * 20 + Math.sin(a1) * ua * side, ey = sh.y + Math.cos(a1) * ua; return { x: ex + Math.sin(a2) * fa * side, y: ey + Math.cos(a2) * fa }; }

// ---------------------------------------------------------------- ALEX
const ALEX_WALK = [{ t0: 3.3, t1: 7.0, x0: 3350, x1: 1300 }, { t0: 23.5, t1: 24.6, x0: 1300, x1: 1000 }];
function alexState(t) {
  const g = G.alex, wk = A.walk(CAST.alex, ALEX_WALK, t, { stride: g.h * 0.06 });
  const book = { x: g.sw * 0.3, y: g.ySh + g.h * 0.17, item: 'book' };          // notebook in the right hand; he points with the left (the gang is screen-left)
  const withBook = name => gg => ({ ...A.GEST[name](gg), R: book });
  const pointL = gg => ({ L: { x: -gg.sw * 2.9, y: gg.ySh + gg.h * 0.03, fist: true, item: 'finger' }, R: book });
  const keys = [[0, withBook('rest')],
    [7.02, pointL, 0.22, 'snap'],                                         // "Stop! No fighting!"
    [8.7, withBook('rest'), 0.5],
    [18.75, gg => ({ R: book, L: { x: -gg.sw * 1.35, y: -gg.h * 0.52, fist: true } }), 0.3],   // hand on hip, suspicious
    [20.15, gg => ({ ...A.GEST.spread(gg), R: { ...A.GEST.spread(gg).R, item: 'book' } }), 0.32, 'back'],   // "This is a restaurant!"
    [21.7, withBook('rest'), 0.45],
    [24.55, gg => ({ R: { x: gg.sw * 0.45, y: gg.ySh + gg.h * 0.06, item: 'bookOpen' }, L: { x: -gg.sw * 1.08, y: gg.ySh + gg.h * 0.33 } }), 0.35],   // opens the plan
    [24.95, gg => ({ R: { x: gg.sw * 0.45, y: gg.ySh + gg.h * 0.06, item: 'bookOpen' }, L: { x: -gg.sw * 1.35, y: gg.ySh - gg.h * 0.13, fist: true, item: 'finger' } }), 0.25, 'back'],
    [26.35, gg => ({ ...A.GEST.spread(gg), R: { ...A.GEST.spread(gg).R, item: 'book' } }), 0.35, 'back'],   // "Customers love a smile!" — and he freezes like this
    [35.7, withBook('rest'), 0.9],                                                    // arms sink slowly
    [36.55, gg => ({ R: book, L: { x: -gg.sw * 1.5, y: gg.ySh + gg.h * 0.02 } }), 0.3], // a small "stop" hand
  ];
  const Pz = poser.alex(t, keys, { swing: wk.moving ? (side) => side < 0 ? A.swingArm(wk, g)(side) : 0 : null });
  const talk = talkOf('alex', t, 1);
  let mood = 'happy', mouthFn = null, front = null, look = -0.7, turn = -0.25, lookY = 0, eyeOpen, brows;
  if (wk.moving) { turn = wk.dir * 0.4; look = wk.dir; }
  if (t > 6.3 && t < 7.02) { mood = 'shock'; turn = -0.3; look = -1; }
  if (between(t, 7.02, 8.7)) mood = 'angry';
  if (between(t, 8.7, 18.7)) { mood = 'neutral'; look = -0.9; }
  if (between(t, 18.7, 20.15)) { mood = 'skeptical'; look = -1; eyeOpen = [0.55, 0.55]; }
  if (between(t, 20.15, 21.7)) mood = 'annoyed';
  if (t >= 26.35 && t < 36.4 && !talk) mouthFn = FF.bigSmile(1);                    // the customer smile, frozen from here on
  if (between(t, 29.4, 36.4)) { front = FF.extras(g, { t, sweat: clamp((t - 33.6) / 0.8), twitch: t > 35.0 }); }
  if (between(t, 34.6, 36.4)) { turn = key(t, [[34.9, -0.1], [36.2, -0.55]]); look = key(t, [[34.9, 0], [36.0, -1]]); }
  if (t >= 36.4) { mood = 'worried'; turn = -0.45; look = -1; }
  return { x: wk.x, st: { t, ...wk.st, armL: Pz.armL, armR: Pz.armR, items: Pz.items, tilt: Pz.tilt, mood, talk, mouthFn, front, look, lookY, turn, eyeOpen, brows } };
}

// ---------------------------------------------------------------- TONY
const GRIN = [[29.75, 0], [30.85, 0.55], [31.0, 0.62], [31.12, 1.0, 'back'], [38.2, 1.0], [38.3, 0]];
function tonyState(t) {
  const g = G.tony;
  const keys = [[0, 'cross'], [28.25, 'shrug', 0.3], [29.1, 'rest', 0.4], [38.25, 'cross', 0.25, 'snap']];
  const Pz = poser.tony(t, keys);
  const k = key(t, GRIN), talk = talkOf('tony', t, 3);
  let look = 0.8, turn = 0.3, lookY = 0, mood = 'skeptical';
  if (between(t, 0.6, 2.4)) { lookY = -0.9; look = 0.2; mood = 'bored'; }            // eye roll at the argument
  if (between(t, 2.4, 7.0)) { look = -1; turn = -0.2; }
  if (between(t, 21.9, 22.7)) { look = -1; turn = -0.35; }                            // glances: at Marco...
  if (between(t, 22.7, 23.4)) { look = 0.6; }
  if (between(t, 27.9, 29.4)) { look = -0.8; turn = -0.1; mood = 'neutral'; }
  const grinOn = k > 0.01;
  const st = { t, armL: Pz.armL, armR: Pz.armR, items: Pz.items, armsFirst: false, tilt: Pz.tilt, mood: grinOn ? 'neutral' : mood, talk, look: grinOn ? 0.15 : look, lookY: grinOn ? 0 : lookY, turn: grinOn ? 0.1 : turn };
  if (grinOn) Object.assign(st, { mouthFn: FF.grin(k, { t, twitch: k > 0.9, uneven: true }), eyeBig: 1 + 0.18 * k, iris: 1 - 0.42 * k, brows: [[4 * k, 2 * k], [-26 * k, -18 * k]],
    front: FF.extras(g, { t, twitch: k > 0.95 && t > 31.6 }) });
  return { x: X.tony, st };
}

// ---------------------------------------------------------------- MARCO
function marcoState(t) {
  const g = G.marco, argue = t < 7.02;
  const jab = argue ? Math.abs(Math.sin(t * 8.5)) : 0;
  const pocket = { x: -g.sw * 1.02, y: -g.h * 0.47, fist: true };
  const keys = [[0, gg => ({ L: { x: -gg.sw * (1.5 + 0.7 * jab), y: gg.ySh + gg.h * 0.06, fist: true, item: 'knuck' }, R: { x: gg.sw * 1.35, y: -gg.h * 0.52, fist: true } })],
    [7.05, gg => ({ L: { x: -gg.sw * 1.6, y: gg.ySh + gg.h * 0.05, fist: true, item: 'knuck' }, R: { x: gg.sw * 1.35, y: -gg.h * 0.52, fist: true } }), 0.15],
    [10.55, gg => ({ L: { ...pocket, item: key(t, [[11.65, 1], [11.7, 0]]) ? 'knuck' : null }, R: { x: gg.sw * 1.35, y: -gg.h * 0.52, fist: true } }), 1.15, 'io'],   // slooowly into the pocket
  ];
  const Pz = poser.marco(t, keys, { calm: !argue });
  const inPocket = t > 11.55;
  let y = 0; if (between(t, 0.35, 1.75)) y = -Math.abs(Math.sin((t - 0.35) * Math.PI / 0.35)) * 70;   // angry little hops
  let mood = argue ? 'angry' : 'shock', look = argue ? -1 : 1, turn = argue ? -0.5 : 0.35, lookY = 0, mouthFn = null, front = null;
  if (between(t, 9.5, 10.3)) { look = -1; turn = -0.3; mood = 'worried'; }
  if (between(t, 10.4, 12.6)) { mood = 'neutral'; look = -0.85; lookY = -0.7; turn = 0.15; mouthFn = FF.whistle({ t }); }
  if (between(t, 12.6, 21.8)) { mood = 'neutral'; look = 0.9; }
  if (between(t, 22.3, 23.4)) { look = -1; turn = -0.35; }
  if (between(t, 27.9, 29.4)) { look = 1; turn = 0.45; mood = 'worried'; }
  if (t > 31.0) { look = 1; turn = 0.4; mood = 'shock'; }
  if (t > 38.35) { mood = 'worried'; }
  const nod = t > 38.4 && t < 39.3 ? Math.max(0, Math.sin((t - 38.4) * 14)) * 14 : 0;
  front = (ctx, o) => {                                                                // pocket flap over the hand
    if (!inPocket) return; ctx.save(); const px = -g.sw * 1.02, py = -g.h * 0.47;
    paint(ctx, q => { q.m(px - 48, py - 6); q.l(px + 46, py - 18); q.l(px + 52, py + 40); q.q(px, py + 56, px - 50, py + 44); q.z(); }, CAST.marco.bottom.col, { sd: 6, hd: 3, lw: 3.5 }); ctx.restore(); void o; };
  return { x: X.marco, y, st: { t, armL: Pz.armL, armR: Pz.armR, items: Pz.items, mood, talk: talkOf('marco', t, 5), look, lookY, turn, mouthFn, front, headY: nod } };
}

// ---------------------------------------------------------------- BRUNO + the bat
const BAT_ON_SHOULDER = 2.75, BAT_RELEASE = 13.9, BAT_LAND = 14.15, BAT_TIP = 14.62;
const FOOT = [[15.0, 0, 0], [15.18, 40, 45], [15.35, 80, 0], [15.75, 390, 0], [15.95, 360, 0], [16.2, 0, 30], [16.3, 0, 0],
  [16.6, 0, 0], [16.8, 150, 45], [16.95, 250, 0], [17.3, 510, 0], [17.5, 470, 0], [17.85, 0, 30], [17.95, 0, 0]];
const BATX = [[15.35, 0], [15.75, -310], [16.0, -310], [16.35, -170, 'out'], [16.95, -170], [17.3, -430]];
function brunoState(t) {
  const g = G.bruno;
  const hold = { x: -g.sw * 1.0, y: g.ySh + g.h * 0.03, fist: true };
  const keys = [[0, gg => ({ L: hold, R: { x: gg.sw * 1.35, y: -gg.h * 0.52, fist: true } })],
    [12.8, gg => ({ L: { x: -gg.sw * 1.08, y: gg.ySh + gg.h * 0.33, fist: true }, R: { x: gg.sw * 1.35, y: -gg.h * 0.52, fist: true } }), 0.8],   // lowers the bat
    [13.9, gg => A.GEST.rest(gg), 0.15],                                              // ...and lets go
    [17.4, gg => ({ L: { x: -gg.sw * 0.35, y: -gg.h * 0.5 }, R: { x: gg.sw * 0.35, y: -gg.h * 0.5 } }), 0.4],   // hands folded: innocent
    [21.8, 'rest', 0.5]];
  const Pz = poser.bruno(t, keys, { calm: true });
  const batAng = t < 12.8 ? BAT_ON_SHOULDER + Math.sin(t * 3) * 0.04 : key(t, [[12.8, BAT_ON_SHOULDER], [13.6, 0]]);
  const items = { ...Pz.items }; if (t < BAT_RELEASE) items.L = { under: S.batItem(batAng) };
  let mood = t < 7.02 ? 'angry' : 'shock', look = t < 7.02 ? 1 : 1, turn = t < 7.02 ? 0.45 : 0.35, lookY = 0, lean = between(t, 1.95, 3.4) ? 0.25 : 0, mouthFn = null, blink, drop = 0;
  if (between(t, 9.5, 10.3)) { look = 0.6; mood = 'worried'; }
  if (between(t, 12.6, 13.9)) { mood = 'worried'; look = Math.sin(t * 9) > 0 ? 1 : -1; turn = 0.1; }     // shifty eyes
  if (between(t, 13.9, 15.0)) { mood = 'worried'; look = -0.6; lookY = 0.8; }
  if (between(t, BAT_TIP, BAT_TIP + 0.35)) { blink = 1; drop = 14; }                // cringe at the thud
  if (between(t, 15.0, 17.5)) { mood = 'neutral'; look = 0.9; lookY = -0.6; lean = 0.18; mouthFn = FF.whistle({ t }); }
  if (between(t, 16.0, 16.55)) { mood = 'annoyed'; look = -0.7; lookY = 0.9; mouthFn = null; }            // it rolled back out
  if (between(t, 17.5, 18.6)) { mood = 'happy'; look = 0.5; lookY = -0.8; mouthFn = FF.whistle({ t }); }
  if (between(t, 18.6, 21.8)) { mood = 'worried'; look = 1; }
  if (between(t, 22.9, 23.4)) { look = 1; turn = 0.4; }
  if (between(t, 27.9, 29.4)) { look = 1; turn = 0.45; mood = 'worried'; }
  if (t > 31.0) { mood = 'shock'; look = 1; turn = 0.4; }
  if (t > 38.35) mood = 'worried';
  const nod = t > 38.5 && t < 39.4 ? Math.max(0, Math.sin((t - 38.5) * 14)) * 18 : 0;
  const legFn = between(t, 14.95, 18.0) ? A.foot(CAST.bruno, -1, FOOT, t) : undefined;
  return { x: X.bruno, st: { t, armL: Pz.armL, armR: Pz.armR, items, mood, talk: talkOf('bruno', t, 7), look, lookY, turn, lean, mouthFn, blink, drop, legFn, headY: nod, afterTorso: S.apron(g) } };
}
// the bat once it has left Bruno's hand: drops, tips over to the left, gets pushed under the table
function batWorld(c, t) {
  if (t < BAT_RELEASE) return;
  const g = G.bruno, hand = wrist(g, -1, poser.bruno(BAT_RELEASE, [[0, 'rest']]).armL);
  const px = X.bruno + hand.x, len = 640, gripY0 = hand.y;
  c.save();
  if (t < BAT_LAND) { const d = t - BAT_RELEASE, y = gripY0 + 0.5 * 9000 * d * d; const yy = Math.min(y, -len - 30); c.translate(px, yy); S.batShape(c, len); c.restore(); return; }
  if (t < BAT_TIP + 0.12) { const k = clamp((t - BAT_LAND) / (BAT_TIP - BAT_LAND)), th = (Math.PI / 2) * eIn(k) + (t > BAT_TIP ? Math.sin((t - BAT_TIP) * 40) * 0.04 * (1 - (t - BAT_TIP) / 0.12) : 0);
    const bx = px, by = -30, gx = bx - Math.sin(th) * len, gy = by - Math.cos(th) * len; c.translate(gx, gy); c.rotate(-th); S.batShape(c, len); c.restore(); return; }
  const dx = key(t, BATX);                                                              // lying: grip on the left, barrel end at px + dx
  c.translate(px + dx - len, -32); c.rotate(-Math.PI / 2); S.batShape(c, len); c.restore();
}

// ---------------------------------------------------------------- MRS. PATTERSON (back row) + her cup
const DROP = { t0: 33.0 };
function patState(t) {
  const g = G.patterson;
  const side = { x: g.sw * 2.45, y: g.ySh + g.h * 0.1 };                              // cup held out at her side (over the floor)
  const sip = { x: g.sw * 0.45, y: g.headY + g.hh * 0.95 };
  const sipK = (tt) => { const ph = (tt % 6.5); return ph > 4.6 && ph < 6.0 ? 1 : 0; };
  const keys = [[0, gg => ({ L: { x: -gg.sw * 0.9, y: gg.ySh + gg.h * 0.24 }, R: { ...side, item: 'cup' } })]];
  for (let tt = 4.6; tt < 30; tt += 6.5) { keys.push([tt, gg => ({ L: { x: -gg.sw * 0.9, y: gg.ySh + gg.h * 0.24 }, R: { ...sip, item: 'cup' } }), 0.5]); keys.push([tt + 1.4, gg => ({ L: { x: -gg.sw * 0.9, y: gg.ySh + gg.h * 0.24 }, R: { ...side, item: 'cup' } }), 0.5]); }
  keys.push([33.0, gg => ({ L: { x: -gg.sw * 0.9, y: gg.ySh + gg.h * 0.24 }, R: { ...side, y: side.y + 30 } }), 0.12]);
  keys.push([33.6, gg => ({ L: { x: -gg.sw * 0.55, y: gg.headY + gg.hh * 0.6 }, R: { x: gg.sw * 0.55, y: gg.headY + gg.hh * 0.6 } }), 0.25, 'back']);   // hands to her cheeks
  const Pz = poser.patterson(t, keys, { calm: true });
  let mood = 'happy', look = -0.6, turn = -0.25, iris, eyeBig, mouthFn = null;
  if (sipK(t) && t < 30) { mood = 'neutral'; look = -0.2; }
  if (t > 32.75) { mood = 'shock'; iris = 0.45; eyeBig = 1.25; look = -1; turn = -0.35; }
  if (t > 33.6) mouthFn = null;
  return { st: { t, armL: Pz.armL, armR: Pz.armR, items: Pz.items, mood, look, turn, iris, eyeBig, mouthFn, front: FF.extras(g, { t, sweat: clamp((t - 33.4) / 0.6), pale: clamp((t - 32.8) / 0.4) }) }, release: wrist(g, 1, poser.patterson(DROP.t0, keys).armR) };
}
function patGroup(c, t, heads) {
  c.save(); c.translate(PAT.x, PAT.fy); c.scale(PAT.s, PAT.s);
  S.chair(c, 0, 0, 1.05);
  const p = patState(t); c.save(); c.beginPath(); c.rect(-3000, -4000, 6000, 4000 - 10); c.clip(); c.translate(0, PAT.seat); const r = H.human(c, CAST.patterson, p.st); c.restore();   // seated: lowered so the table hides her legs
  heads.pat = { x: PAT.x + r.head.x * PAT.s, y: PAT.fy + (PAT.seat + r.head.y) * PAT.s, hh: r.hh * PAT.s };
  S.table(c, PT.x0, PT.x1, PT.top, 0, { gap: 6 });
  // the falling cup (group-local space; floor y = 0)
  if (t >= DROP.t0) {
    const rel = { x: p.release.x, y: p.release.y + PAT.seat };
    const f = PF.fall({ t0: DROP.t0, x: rel.x, y: rel.y - 20, vx: 60, vy: -260, spin: 7.5, floor: -18, g: 5200, bounce: 0, stopAfter: 0 }, t);
    const hit = f.hits[0];
    if (!f.landed) S.teacup(c, f.x, f.y, f.rot, 1.05);
    else { PF.splash(c, t, hit, f.x, -4, { col: '#B9773E', w: 190 }); PF.shards(c, t, hit, f.x, -20, { n: 8, floor: -6, col: '#FFFDF8', band: '#7FB0D8', size: 30, seed: 3 }); }
  }
  c.restore();
}

// ---------------------------------------------------------------- drawing
function drawHuman(c, cfg, st, x, y = 0) { c.save(); c.translate(x, y); const r = H.human(c, cfg, st); c.restore(); return { x: x + r.head.x, y: y + r.head.y, hh: r.hh }; }
function visible(n, who) { const s = SH[n]; if (s.only && !s.only.includes(who)) return false; if (s.hide && s.hide.includes(who)) return false; return true; }
function drawWorld(c, t, n) {
  const heads = {};
  S.drawBackground(c);
  if (visible(n, 'pat')) patGroup(c, t, heads);
  batWorld(c, t);
  S.table(c, T1.x0, T1.x1, T1.top, 0, { gap: 8, candle: true });
  // dust where the bat slides
  PF.dust(c, X.bruno - 700, -10, t, 15.5); PF.dust(c, X.bruno - 760, -10, t, 17.1);
  const br = brunoState(t), mr = marcoState(t), tn = tonyState(t), al = alexState(t);
  if (visible(n, 'bruno')) heads.bruno = drawHuman(c, CAST.bruno, br.st, br.x);
  if (visible(n, 'marco')) heads.marco = drawHuman(c, CAST.marco, mr.st, mr.x, mr.y);
  if (visible(n, 'tony')) heads.tony = drawHuman(c, CAST.tony, tn.st, tn.x);
  if (visible(n, 'alex')) heads.alex = drawHuman(c, CAST.alex, al.st, al.x);
  // whistling notes (world space)
  if (heads.marco) PF.notes(c, heads.marco.x + 60, heads.marco.y + 40, t, 10.5, 12.4);
  if (heads.bruno) PF.notes(c, heads.bruno.x + 60, heads.bruno.y + 30, t, 15.1, 18.5);
  return heads;
}
// speech bubble with the English line and its Russian translation, pointing at the speaker
function bubble(c, t, line, head, proj, z) {
  const [who, a, b, en, ru] = line, next = LINES.find(l => l[1] > a), end = Math.min(b + 0.25, next ? next[1] - 0.2 : 1e9);   // never two bubbles at once
  const k = clamp((t - a) / 0.12) * (1 - clamp((t - end) / 0.12)); if (k <= 0) return; void who;
  c.font = '46px Nun9'; const w1 = c.measureText(en).width; c.font = '32px Nun7'; const w2 = c.measureText(ru).width;
  const bw = Math.max(w1, w2) + 70, bh = 132;
  let hx = 960, hy = -200, hr = 0;
  if (head) { const p = proj(head); hx = p.x; hy = p.y; hr = head.hh * z; }
  let bx, by, tail;
  const above = hy - hr * 1.25 - bh - 30;
  if (head && hx > -100 && hx < W + 100 && above > 16) { bx = clamp(hx - bw / 2 + (hx < W / 2 ? -90 : 90), 24, W - bw - 24); by = above; tail = { x: clamp(hx, bx + 50, bx + bw - 50), y: by + bh, tx: hx, ty: hy - hr * 1.05 }; }
  else if (head && hx > -100 && hx < W + 100) { const right = hx < W / 2; bx = right ? Math.min(hx + hr * 1.3, W - bw - 24) : Math.max(hx - hr * 1.3 - bw, 24); by = clamp(hy - hr - bh / 2, 24, HH - bh - 24); tail = { x: right ? bx : bx + bw, y: by + bh * 0.6, tx: hx + (right ? hr * 0.9 : -hr * 0.9), ty: hy }; }
  else { bx = (W - bw) / 2; by = 30; tail = null; }
  c.save(); c.globalAlpha = k; c.translate(bx + bw / 2, by + bh / 2); c.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); c.translate(-(bx + bw / 2), -(by + bh / 2));
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, bx + 8, by + 10, bw, bh, 34); c.fill();
  if (tail) { c.fillStyle = '#FFFDF6'; c.beginPath(); c.moveTo(tail.x - 26, tail.y - 4); c.lineTo(tail.tx, tail.ty); c.lineTo(tail.x + 26, tail.y - 4); c.closePath(); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.stroke(); }
  c.fillStyle = '#FFFDF6'; rr(c, bx, by, bw, bh, 34); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.stroke();
  if (tail) { c.fillStyle = '#FFFDF6'; c.fillRect(tail.x - 22, tail.y - 9, 44, 12); }
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2B2F3A'; c.font = '46px Nun9'; c.fillText(en, bx + bw / 2, by + 48); c.fillStyle = '#7A6A80'; c.font = '32px Nun7'; c.fillText(ru, bx + bw / 2, by + 98);
  c.restore();
}
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  if (t >= 39.6) { c.fillStyle = '#14100E'; c.fillRect(0, 0, W, HH); const k = clamp((t - 39.75) / 0.3); c.globalAlpha = k; S.txt(c, 'NO FIGHTING!', W / 2, HH / 2 - 30, 96, '#F2C14E'); S.txt(c, 'animation test · THE ACCIDENTAL MAFIA BOSS', W / 2, HH / 2 + 60, 34, '#E9CFA8', 'Nun8'); return; }
  const n = shotAt(t), cam = camAt(t, n), sh = shake(t);
  c.fillStyle = '#000'; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(W / 2 + sh.x, HH / 2 + sh.y); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  const heads = drawWorld(c, t, n);
  c.restore();
  const proj = p => ({ x: (p.x - cam.x) * cam.z + W / 2 + sh.x, y: (p.y - cam.y) * cam.z + HH / 2 + sh.y });
  if (n === 'TONY_CU' && t >= CZ.t && t < CZ.t + 0.6) PF.speedLines(c, W / 2, HH / 2 - 40, t, { a: 0.55 * (1 - (t - CZ.t) / 0.6), inner: 420, outer: 1300 });
  if (n === 'PAT_M') { const hd = heads.pat && proj(heads.pat); if (hd) PF.rings(c, hd.x, hd.y - heads.pat.hh * cam.z * 1.2, t, 32.75, { r0: 30, r1: 150, w: 6 }); }
  H.vignette(c, W, HH, 0.22); H.grain(c, W, HH, t, 0.03);
  for (const l of LINES) if (t >= l[1] - 0.05 && t < l[2] + 0.45) bubble(c, t, l, heads[l[0]], proj, cam.z);
  if (t < 3.0) { const k = 1 - clamp((t - 2.6) / 0.4); c.globalAlpha = k; c.fillStyle = 'rgba(20,16,14,.6)'; rr(c, 28, 28, 420, 52, 26); c.fill(); c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#FFFDF6'; c.font = '28px Nun9'; c.fillText('ТЕСТ АНИМАЦИИ · NO FIGHTING!', 50, 55); c.globalAlpha = 1; }
}

// ---------------------------------------------------------------- SFX cues (for mafia_test_mix.py; names from the make-2d-video sfx library + a few custom ones)
function cues() {
  const q = [];
  for (const seg of ALEX_WALK) { let prevDown = true; for (let f = Math.floor(seg.t0 * FPS); f <= Math.ceil(seg.t1 * FPS); f++) { const t = f / FPS, wk = A.walk(CAST.alex, ALEX_WALK, t, { stride: G.alex.h * 0.06 }); if (!wk.moving) continue;
    const L = { hx: 0, hy: 0, h: CAST.alex.h, hipW: 168 }, l = wk.st.legFn(-1, L), r = wk.st.legFn(1, L), down = l.ay > -41 && r.ay > -41; if (down && !prevDown) q.push({ t, name: 'footstep', gain: -14, seed: f }); prevDown = down; } }
  q.push({ t: 0.35, name: 'pop', gain: -26 }, { t: 7.02, name: 'scratch', gain: -6 }, { t: 7.05, name: 'hit', gain: -12 });
  q.push({ t: 9.55, name: 'blink', gain: -10 }, { t: 9.95, name: 'blink', gain: -10 });
  q.push({ t: 10.5, name: 'whistle', gain: -12, dur: 1.9 }, { t: 11.62, name: 'clink', gain: -10 });
  q.push({ t: 12.85, name: 'swish', gain: -12 }, { t: BAT_LAND, name: 'knock', gain: -8 }, { t: BAT_TIP, name: 'thud', gain: -11 });
  q.push({ t: 15.4, name: 'slide', gain: -10, dur: 0.4 }, { t: 16.0, name: 'roll', gain: -12, dur: 0.35 }, { t: 17.0, name: 'slide', gain: -10, dur: 0.35 }, { t: 15.1, name: 'whistle', gain: -14, dur: 3.3, seed: 4 });
  q.push({ t: 21.9, name: 'blink', gain: -10 }, { t: 22.35, name: 'blink', gain: -10 }, { t: 22.85, name: 'blink', gain: -10 });
  q.push({ t: 24.6, name: 'page', gain: -10 }, { t: 26.4, name: 'ding', gain: -14 });
  q.push({ t: 29.8, name: 'creak', gain: -10, dur: 1.2 }, { t: 31.0, name: 'impact', gain: -9 }, { t: 31.0, name: 'stinger', gain: -12 });
  q.push({ t: 32.8, name: 'gasp', gain: -8 }, { t: 33.45, name: 'shatter', gain: -4 });
  q.push({ t: 34.7, name: 'crickets', gain: -14, dur: 1.7 });
  q.push({ t: 38.2, name: 'pop', gain: -8 }, { t: 39.62, name: 'rimshot', gain: -6 });
  return q;
}
if (process.argv[2] === '--cues') { process.stdout.write(JSON.stringify({ dur: DUR, cues: cues() })); }
else E.run('mafia_nofight', NF, renderFrame, W, HH);
module.exports = { cues };
