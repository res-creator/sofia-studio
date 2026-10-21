// "Coca-Cola's Impossible Coin" — episode 9 (1080x1920, 30 fps), Bold Editorial Collage + 2.5D.
// The hero is the proposed 7½¢ coin (drawn with "PROPOSED" ring text and a NEVER MINTED tag — it never existed).
// Journey: the giant coin (frame 0) -> "Why?" it spins into a nickel that becomes the price of a contour bottle (years roll, the price
// doesn't) -> 1950: a 1950s coin-op cooler rises around the bottle, rows of machines fill the depth (~400,000) -> dive into the coin
// slot ("5¢ ONLY"), a nickel goes in -> the price sign rolls 5¢ -> 6¢ (a penny bounces off the slot) -> 10¢ (×2, the machine panics)
// -> whip-pan up to a blueprint: a circle becomes the 7½¢ coin -> it drops into an envelope (1953, AS REPORTED) that flies to the
// White House -> it comes back stamped NOT INTERESTED -> "most companies": the price tag changes, the money is locked; "Coca-Cola":
// the price is locked, the coins melt into the 7½¢ coin, which lands exactly where frame 0 starts (loop).
// Facts: Levy & Young (2004), JMCB 36(4); the Eisenhower request is told as "reportedly" (secondary accounts: Kahn 1969, Allen 1994).
// v2 (v1 = episode.js, kept) after the independent review: the nickel drops into the slot by itself (no pointing hand), REPORTEDLY on the
// envelope from its first frame + AS REPORTED strip from 25.5 s, a big "?" -> 7½¢ on the blueprint right away (bigger header, closer camera),
// the ending without the down arrow: the price is locked, the 5¢+1¢+1¢ coins slide together and fuse into the 7½¢ coin (flash), the counter
// shows ~400,000 at once, a livelier hook (slow turn + shine sweep), the bottle rises after the coin has shrunk, the palm stays clear of the right rail, the lawn appears only with the White House.
// Usage: node episode_v2.js video out.mp4 | still t1,t2,... out.png | cues
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');
const { text } = require('../rent_ep4/rentkit');
const P = require('./cokekit');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, tag } = K;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);
const bez = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

// ---------- voice-over (Chris) ----------
const ST = { c01: 0.2, c02: 2.45, c03: 4.25, c04: 4.95, c05: 7.7, c06: 12.2, c07: 13.5, c08: 14.3, c09: 17.9, c10: 20.15, c11: 22.35, c12: 25.65, c13: 30.7, c14: 32.4, c15: 34.8 };
// real end of speech per line (silencedetect; the alignment stretches the last word over the trailing silence)
const SPEECH_END = { c01: 2.05, c02: 1.57, c03: 0.42, c04: 2.51, c05: 4.28, c06: 1.14, c07: 0.47, c08: 3.34, c09: 1.91, c10: 1.97, c11: 2.88, c12: 4.8, c13: 1.15, c14: 2.15, c15: 2.45 };
const V = EN.voice(`${__dirname}/vo`, ST), at = V.at, T = 39.0;
const w = { seven: at('c02', 'seven'), half: at('c02', 'half'), why: ST.c03, decades: at('c04', 'decades'), five: at('c04', 'five'),
  y1950: at('c05', '1950'), cc: at('c05', 'coca'), n400: at('c05', '400'), vending: at('c05', 'vending'), one: at('c06', 'one'), coin6: at('c06', 'coin'), nickel: at('c07', 'nickel'),
  six: at('c08', 'six'), customers: at('c08', 'customers'), extra: at('c08', 'extra'), change8: at('c08', 'change'), ten: at('c09', 'ten'), double: at('c09', 'double'),
  wild: at('c10', 'wild'), seven11: at('c11', 'seven'), coin11: at('c11', 'coin'), y1953: at('c12', '1953'), chairman: at('c12', 'chairman'), reportedly: at('c12', 'reportedly'),
  took: at('c12', 'took'), president: at('c12', 'president'), eisen: at('c12', 'eisenhower'), treasury: at('c13', 'treasury'), interested: at('c13', 'interested'),
  change14: at('c14', 'change'), prices: at('c14', 'prices'), fit14: at('c14', 'fit'), money14: at('c14', 'money'), tried: at('c15', 'tried'), change15: at('c15', 'change'),
  money15: at('c15', 'money'), price: at('c15', 'price') };

// ---------- world layout (world units) ----------
const BOT = [0, 700];                                    // the bottle (base); the price tag hangs on its neck
const TAGC = [235, 120], TAGCOIN = [269, 150];          // tag centre / the nickel on it
const YEAR = [-235, 230];
const MF = [0, 760];                                     // the machine's floor point
const SLOTW = [MF[0] + P.SLOT[0], MF[1] + P.SLOT[1]];    // the coin slot in world units
const SIGNW = [MF[0] + P.SIGN[0], MF[1] + P.SIGN[1]];
const BOTIN = [MF[0] + P.WIN[0] + P.WIN[2] / 2, MF[1] + P.WIN[1] + 50 + P.WIN[3] - 2], BOTIN_S = 0.52;   // the bottle's place in the window
const BP = [0, -1500], BPC = [0, -1440];                 // the blueprint and its circle
const ENV = [0, -1050];                                  // the envelope
const WHP = [1500, -880], WHDOOR = [1500, -960];         // the White House (ground centre), its door
const CMP = [0, 3200];                                   // the comparison
const HOME_Z = 1.0;
const FINAL_C = [0, CMP[1] - 100];                       // where the last coin lands (= frame-0 composition)

// ---------- camera ----------
const KEYS = [
  { t: 0, x: 0, y: 0, z: HOME_Z }, { t: 4.2, x: 0, y: -10, z: 1.08 },                                                        // the coin (hook)
  { t: 5.35, x: 20, y: 320, z: 1.16, e: 'inOut' }, { t: 7.9, x: 15, y: 315, z: 1.22 },                                       // the bottle: 5¢ for decades
  { t: 9.3, x: 0, y: 120, z: 0.5, e: 'inOut' }, { t: 9.8, x: 0, y: 110, z: 0.52 },                                          // the machine rises
  { t: 10.7, x: 0, y: -10, z: 0.4, e: 'inOut' }, { t: 11.95, x: 0, y: 0, z: 0.43 },                                       // ~400,000 machines
  { t: 12.75, x: 150, y: 520, z: 2.4, e: 'inOut5' }, { t: 14.1, x: 160, y: 530, z: 2.5 },                                   // the coin slot
  { t: 14.95, x: 60, y: 230, z: 1.05, e: 'inOut' }, { t: 17.85, x: 60, y: 220, z: 1.08 },                                  // the price sign + the slot
  { t: 18.3, x: 30, y: 120, z: 1.12, e: 'inOut' }, { t: 20.15, x: 30, y: 110, z: 1.16 },                                   // 10¢: DOUBLE
  { t: 20.75, x: 0, y: -1450, z: 0.92, e: 'inOut5' }, { t: 24.7, x: 0, y: -1430, z: 0.97 },                                  // whip-pan up: the blueprint
  { t: 25.55, x: 0, y: -1100, z: 1.18, e: 'inOut' }, { t: 28.75, x: 10, y: -1090, z: 1.26 },                                // the envelope
  { t: 29.75, x: 1460, y: -1200, z: 0.9, e: 'inOut' }, { t: 30.6, x: 1460, y: -1190, z: 0.93 },                           // the White House
  { t: 31.0, x: 1440, y: -1180, z: 1.0, e: 'inOut' }, { t: 32.24, x: 1440, y: -1180, z: 1.05 },                            // NOT INTERESTED
  { t: 32.26, x: 0, y: CMP[1] - 150, z: 1.24 }, { t: 35.8, x: 0, y: CMP[1] - 140, z: 1.3 },                                 // the comparison (cut behind the wipe)
  { t: 36.7, x: FINAL_C[0], y: FINAL_C[1], z: HOME_Z, e: 'inOut' }, { t: T, x: FINAL_C[0], y: FINAL_C[1], z: 1.04 },          // back to frame 0
];
const cam = EN.camera(KEYS, { breath: t => (t > 37.5 ? 0.4 : 1), shakes: [[w.half, 7], [w.y1950 + 0.05, 6], [w.nickel + 0.15, 7], [w.double, 16], [w.coin11 + 0.1, 6], [w.interested - 0.05, 14], [w.price, 8]] });

// ---------- coins in motion ----------
const wob = t => 0.34 * Math.sin(t * 1.3);
const shineAt = t => ((t * 0.32) % 1 + 1) % 1;
function heroCoin(t) {                                    // the 7½¢ coin of the hook -> the nickel on the price tag
  if (t > 8.75) return null;
  const sp = E.inOut(p(t, 4.3, 4.95)) * Math.PI * 4, face = sp > Math.PI * 2.5 ? 'nickel' : 'half';
  const u = E.inOut(p(t, 4.75, 5.35)), pos = bez([0, 0], [180, -60], TAGCOIN, u), r = lerp(380, 80, u);
  const tagOff = tagAway(t);
  return { x: pos[0] + tagOff[0], y: pos[1] + tagOff[1], r, spin: wob(t) * (1 - u) + sp, face, shine: shineAt(t), rot: 0.05 * Math.sin(t * 0.9) * (1 - u), pulse7: Math.sin(clamp(p(t, w.seven, w.seven + 0.35)) * Math.PI), pulseH: Math.sin(clamp(p(t, w.half - 0.05, w.half + 0.45)) * Math.PI) };
}
const tagAway = t => { const u = E.in(p(t, 8.3, 8.75)); return [u * 900, -u * 300]; };
function finalCoin(t) {                                    // the coins melt into the 7½¢ coin, which lands on the frame-0 spot
  const t0 = FUSE + 0.02; if (t < t0) return null;
  const u = E.inOut(p(t, t0, t0 + 0.7)), pos = L2([CMP[0] + 20, CMP[1] + 70], FINAL_C, u);
  return { x: pos[0], y: pos[1], r: lerp(120, 380, u) * (1 + 0.12 * Math.sin(clamp(p(t, t0, t0 + 0.25)) * Math.PI)), spin: (1 - u) * Math.PI * 2 + wob(t) * u, face: 'half', shine: shineAt(t), rot: 0.05 * Math.sin(t * 0.9) * u, pulseH: Math.sin(clamp(p(t, w.price - 0.05, w.price + 0.45)) * Math.PI) };
}
const drawCoin = (ctx, c, o = {}) => { if (!c) return; ctx.save(); ctx.translate(c.x, c.y); if (c.rot) ctx.rotate(c.rot); P.coin(ctx, c.r, { face: c.face, spin: c.spin, pulse7: c.pulse7, pulseH: c.pulseH, tilt: c.tilt, shine: c.shine, ...o }); ctx.restore(); };

// ---------- the machine: price sign rolls, eyes ----------
const ROLLS = [[w.six - 0.1, 0.3, '5¢', '6¢'], [w.ten - 0.12, 0.13, '6¢', '7¢'], [w.ten + 0.02, 0.13, '7¢', '8¢'], [w.ten + 0.16, 0.13, '8¢', '9¢'], [w.ten + 0.3, 0.2, '9¢', '10¢']];
function signRoll(t) { let r = null; for (const [t0, d, a, b] of ROLLS) if (t >= t0) r = { from: a, to: b, u: p(t, t0, t0 + d) }; return r; }
function eyes(t) {
  const blink = [10.6, 15.6, 21.0].some(b => t > b && t < b + 0.14) ? 0.1 : 1;
  if (t > w.double - 0.05) return { mood: 'wide', look: [Math.sin(t * 9) * 0.3, -0.2], open: 1 };
  if (t > w.ten) return { mood: 'wide', look: [-0.2, -0.7], open: 1 };
  if (t > w.extra + 0.3) return { mood: 'annoyed', look: [0.6, 0.8], open: blink };
  if (t > w.customers) return { mood: 'calm', look: [0.7, 0.9], open: blink };
  if (t > w.six - 0.1) return { mood: 'calm', look: [-0.2, -0.8], open: blink };
  if (t > w.nickel + 0.25 && t < 14.5) return { mood: 'happy', look: [0, 0], open: 1 };
  if (t > ST.c06) return { mood: 'calm', look: [0.6, 1], open: blink };
  return { mood: 'calm', look: [Math.sin(t * 0.7) * 0.5, 0.1], open: blink };
}
const NICK_IN = [w.nickel - 0.3, w.nickel + 0.15];
const FUSE = w.money15 + 0.05;                           // the 5¢+1¢+1¢ coins fuse into the 7½¢ coin       // the nickel slides into the slot
function nickelIn(t) { if (t < NICK_IN[0] - 0.3 || t > NICK_IN[1] + 0.12) return null;                // flipped in from the top right, it lands edge-on in the slot
  const u = E.inOut(p(t, NICK_IN[0] - 0.3, NICK_IN[1])), pos = bez([420, 330], [300, 300], [SLOTW[0], SLOTW[1] - 4], u);
  return { x: pos[0], y: pos[1] + p(t, NICK_IN[1] - 0.02, NICK_IN[1] + 0.12) * 30, r: 34, spin: lerp(Math.PI * 3, Math.PI / 2 - 0.04, E.out(p(t, NICK_IN[0] - 0.3, NICK_IN[1]))), face: 'nickel', a: 1 - p(t, NICK_IN[1], NICK_IN[1] + 0.12) }; }
const PALM = [285, 650], PALM_S = 0.62;
function palmPos(t) { const i = E.out(p(t, w.customers - 0.45, w.customers + 0.05)), o = E.in(p(t, 17.6, 17.95)); return [PALM[0] + o * 200, PALM[1] + (1 - i) * 700 + o * 700]; }
function pennyFly(t) {                                    // the extra coin tries the slot and bounces off
  const t0 = w.extra - 0.1, t1 = t0 + 0.42; if (t < t0 || t > t1 + 0.9) return null;
  const pp = palmPos(t), start = [pp[0] + 60 * PALM_S, pp[1] - 10 * PALM_S];
  if (t < t1) { const u = E.inOut(p(t, t0, t1)), q = bez(start, [SLOTW[0] + 160, SLOTW[1] - 160], [SLOTW[0] + 30, SLOTW[1] + 10], u); return { x: q[0], y: q[1], r: 28, spin: u * 1.2, face: 'penny' }; }
  const s = t - t1; return { x: SLOTW[0] + 30 + s * 260, y: SLOTW[1] + 10 - 300 * s + 900 * s * s, r: 28, spin: 1.2 + s * 14, face: 'penny', rot: s * 4 };
}

// ---------- background ----------
function background(ctx) { ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); }
function layer(ctx, c, f, draw) { ctx.save(); ctx.translate(c.x * (1 - f), c.y * (1 - f)); draw(); ctx.restore(); }
function backdrop(ctx, t, c) {
  layer(ctx, c, 0.35, () => {
    for (let i = 0; i < 34; i++) { ctx.save(); ctx.translate(-1800 + hash(i * 3) * 4400, -2600 + hash(i * 9) * 6600); ctx.rotate(-0.22 + hash(i) * 0.2);
      ctx.fillStyle = ['rgba(230,57,70,0.08)', 'rgba(77,141,255,0.10)', 'rgba(255,200,87,0.20)'][i % 3]; ctx.fillRect(-190, -28, 380, 56); ctx.restore(); }
    ctx.strokeStyle = 'rgba(23,23,23,0.05)'; ctx.lineWidth = 3; for (let i = -14; i < 18; i++) { ctx.beginPath(); ctx.moveTo(i * 160, -3000); ctx.lineTo(i * 160, 4200); ctx.stroke(); } });
  layer(ctx, c, 0.75, () => {
    const halo = (x, y, r, col) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
    halo(0, 0, 620, 'rgba(255,200,87,0.55)'); halo(0, 380, 700, 'rgba(230,57,70,0.12)'); halo(0, -1450, 900, 'rgba(77,141,255,0.16)'); halo(WHP[0], WHP[1] - 300, 800, 'rgba(255,200,87,0.30)');
    halo(FINAL_C[0], FINAL_C[1], 620, 'rgba(255,200,87,0.55)'); });
  // the floor of the machine scene
  flat(ctx, () => rr(ctx, -3200, MF[1] - 6, 6400, 12, 0), '#CFC5B2'); flat(ctx, () => rr(ctx, -3200, MF[1] + 6, 6400, 1300, 0), '#E8DFCC');
  ctx.strokeStyle = 'rgba(23,23,23,0.07)'; ctx.lineWidth = 4; for (let i = -16; i < 16; i++) { ctx.beginPath(); ctx.moveTo(i * 200, MF[1] + 6); ctx.lineTo(i * 290, MF[1] + 900); ctx.stroke(); }
  // the lawn of the White House
  if (t > 28.6 && t < 32.3) { const u = E.out(p(t, 28.7, 29.3)); flat(ctx, () => rr(ctx, WHP[0] - 1100 * u, WHP[1] - 4, 2200 * u, 420, 0), '#BFD9A8'); flat(ctx, () => rr(ctx, WHP[0] - 1100 * u, WHP[1] - 10, 2200 * u, 12, 0), '#9CBF83'); }
}

// ---------- rows of machines behind the hero (~400,000) ----------
function crowd(ctx, t, c) {
  const t0 = w.n400 - 0.55; if (t < t0 || t > 13.2) return;
  for (let r = 4; r >= 1; r--) {
    const s = Math.pow(0.7, r), sp = 640 * s, fy = MF[1] - r * 210, n = Math.ceil(5200 / sp) | 1;
    layer(ctx, c, 1 - r * 0.08, () => {
      for (let j = 0; j < n; j++) { const k = j - (n - 1) / 2; if (Math.abs(k) < 0.6) continue;
        const d = t0 + (4 - r) * 0.1 + Math.abs(k) * 0.03, u = E.back(p(t, d, d + 0.35), 1.6); if (u <= 0) continue;
        ctx.save(); ctx.translate(k * sp, fy); ctx.scale(s * u, s * u); P.machine(ctx, { t, eyes: { mood: 'calm', look: [Math.sin(t + j) * 0.5, 0], open: (t + j * 0.37) % 3 < 0.12 ? 0.1 : 1 }, inside: x => P.windowBottles(x) }); ctx.restore(); }
      ctx.save(); ctx.globalAlpha = 0.16 * r; ctx.fillStyle = C.paper; ctx.fillRect(-3000, fy - 1400 * s - 60, 6000, 1400 * s + 90); ctx.restore();   // depth haze
    });
  }
}

// ---------- the world ----------
function world(ctx, t, c) {
  backdrop(ctx, t, c);
  // ---- the machine scene (behind the bottle until it is inside) ----
  const rise = E.out(p(t, 8.4, 9.25));
  if (t > 8.35 && t < 21.2) {
    crowd(ctx, t, c);
    const R = signRoll(t), dbl = p(t, w.double - 0.05, w.double + 0.3);
    ctx.save(); ctx.translate(MF[0], MF[1] + (1 - rise) * 1500);
    P.machine(ctx, { t, eyes: eyes(t), roll: R, price: '5¢', priceCol: t > w.double - 0.05 ? C.red : C.ink, signScale: 1 + 0.18 * Math.sin(dbl * Math.PI) + (t > w.double ? 0.06 : 0),
      shake: t > w.double - 0.02 && t < w.double + 0.6 ? 7 * (1 - p(t, w.double, w.double + 0.6)) : 0, slotGlow: Math.sin(clamp(p(t, ST.c06, w.nickel + 0.2)) * Math.PI),
      inside: x => { P.windowBottles(x); if (t > 9.3) { x.save(); x.translate(P.WIN[0] + P.WIN[2] / 2, P.WIN[1] + 50 + P.WIN[3] - 2); x.scale(BOTIN_S, BOTIN_S); P.bottle(x, { shadow: false }); x.restore(); } } });
    ctx.restore();
    // sweat drops on DOUBLE
    const sw = p(t, w.double + 0.15, w.double + 0.9); if (sw > 0 && sw < 1) for (const [dx, d] of [[-250, 0], [250, 0.2]]) { const u = clamp(sw * 1.3 - d); if (u <= 0) continue;
      ctx.save(); ctx.globalAlpha *= 1 - u; ctx.translate(MF[0] + dx, MF[1] - 1180 + u * 160); flat(ctx, () => { ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(22, 4, 0, 16); ctx.quadraticCurveTo(-22, 4, 0, -30); }, '#9FD3F5', 3); ctx.restore(); }
  }
  // ---- the bottle scene ----
  if (t > 4.9 && t < 9.31) {
    const up = E.out(p(t, 4.95, 5.45)), m = E.inOut(p(t, 8.5, 9.3));
    const base = L2([BOT[0], BOT[1] + (1 - up) * 1100], BOTIN, m), s = lerp(1, BOTIN_S, m);
    ctx.save(); ctx.translate(base[0], base[1]); ctx.scale(s, s); P.bottle(ctx, {}); ctx.restore();
    // the price tag on the neck (swings in, flies away at 8.3)
    const tu = E.back(p(t, 4.7, 5.15), 1.6), off = tagAway(t);
    if (tu > 0 && t < 8.8) { const sw = 0.18 * Math.sin((t - 4.7) * 5) * Math.exp(-(t - 4.7) * 1.6) + Math.sin(t * 1.4) * 0.02;
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(BOT[0] + 26, BOT[1] - 690 + (1 - up) * 1100); ctx.quadraticCurveTo(100 + off[0] * 0.5, 40, TAGC[0] - 98 + off[0], TAGC[1] + off[1]); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(TAGC[0] - 98 + off[0], TAGC[1] + off[1]); ctx.rotate(sw); ctx.scale(tu, tu); ctx.translate(98, 0); P.priceTag(ctx, { label: 'PRICE', value: '', w: 300, h: 220 }); ctx.restore(); }
    // the year card: the years roll, the price doesn't
    const yu = E.back(p(t, 5.05, 5.4), 1.7), yo = E.in(p(t, 9.0, 9.35));
    if (yu > 0 && yo < 1) { const yr = t < w.y1950 - 0.05 ? 1886 + Math.floor(63 * E.inOut(p(t, 5.3, 7.45))) : 1950, hit = t > w.y1950 - 0.05;
      const k = yu * (1 + 0.12 * Math.sin(clamp(p(t, w.y1950 - 0.05, w.y1950 + 0.3)) * Math.PI));
      ctx.save(); ctx.translate(YEAR[0] - yo * 900, YEAR[1] - yo * 200); ctx.rotate(-0.05); ctx.scale(k, k); P.yearCard(ctx, yr, { head: hit ? C.red : C.ink, col: hit ? C.red : C.ink }); ctx.restore(); }
  }
  // ---- the hero coin (hook) / the nickel on the tag ----
  drawCoin(ctx, heroCoin(t));
  // ---- the coin slot: the nickel drops in ----
  const ni = nickelIn(t); if (ni) { ctx.save(); ctx.globalAlpha *= ni.a; drawCoin(ctx, ni, { shadow: false }); ctx.restore(); }
  if (t > NICK_IN[1] + 0.12 && t < 14.6) { const u = p(t, NICK_IN[1] + 0.1, NICK_IN[1] + 0.5); if (u < 1) { ctx.save(); ctx.globalAlpha *= 1 - u; ctx.strokeStyle = C.yellow; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(SLOTW[0], SLOTW[1], 40 + u * 90, 0, 7); ctx.stroke(); ctx.restore(); } }
  // ---- the palm with extra change; the penny bounces off ----
  if (t > w.customers - 0.5 && t < 18.0) { const pp = palmPos(t); ctx.save(); ctx.translate(pp[0], pp[1]); ctx.rotate(-0.12); ctx.scale(PALM_S, PALM_S); P.palm(ctx);
    drawCoin(ctx, { x: -55, y: 10, r: 62, spin: 0.15, face: 'nickel', tilt: 0.25 }); if (t < w.extra - 0.1) drawCoin(ctx, { x: 65, y: 20, r: 46, spin: -0.1, face: 'penny', tilt: 0.25 }); ctx.restore(); }
  drawCoin(ctx, pennyFly(t));
  if (t > w.extra + 0.32 && t < 17.9) { const u = E.back(p(t, w.extra + 0.32, w.extra + 0.55), 2); ctx.save(); ctx.translate(SLOTW[0] + 95, SLOTW[1] - 70); ctx.scale(u, u); ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-30, -30); ctx.lineTo(30, 30); ctx.moveTo(30, -30); ctx.lineTo(-30, 30); ctx.stroke(); ctx.restore(); }
  // ---- the blueprint: a circle becomes the coin ----
  if (t > 20.0 && t < 32.3) blueprintScene(ctx, t);
  // ---- the comparison + the final coin ----
  if (t > 32.1) compareScene(ctx, t);
  drawCoin(ctx, finalCoin(t));
  worldTags(ctx, t);
}
function blueprintScene(ctx, t) {
  ctx.save(); ctx.translate(BP[0], BP[1]); P.blueprint(ctx, 1000, 1000, p(t, 20.3, 20.95), t, { titleSize: 54 }); ctx.restore();
  const cu = E.inOut(p(t, 21.05, 21.95)), [cx, cy] = BPC;
  if (cu > 0) { ctx.save(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, 300, -Math.PI / 2, -Math.PI / 2 + cu * Math.PI * 2); ctx.stroke();
    ctx.setLineDash([16, 14]); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 250, 0, Math.PI * 2 * cu); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 340, cy); ctx.lineTo(cx + 340, cy); ctx.moveTo(cx, cy - 340); ctx.lineTo(cx, cy + 340); ctx.stroke(); ctx.restore();
    if (cu < 1) { const a = -Math.PI / 2 + cu * Math.PI * 2, px = cx + Math.cos(a) * 300, py = cy + Math.sin(a) * 300;               // the pencil
      ctx.save(); ctx.translate(px, py); ctx.rotate(0.6); cut(ctx, () => rr(ctx, -14, -200, 28, 170, 4), C.yellow, { sb: 10, sy: 6, lw: 3 }); flat(ctx, () => { ctx.beginPath(); ctx.moveTo(-14, -30); ctx.lineTo(0, 0); ctx.lineTo(14, -30); ctx.closePath(); }, '#F3D3A8', 3); ctx.restore(); } }
  // the drawn mark 7½¢ (blueprint lines), then the real coin pops out of the sheet
  const qu = p(t, w.wild - 0.1, w.wild + 0.2) * (1 - p(t, ST.c11 - 0.1, ST.c11 + 0.1));                  // a big "?" in the circle on "wild idea"
  if (qu > 0) { ctx.save(); ctx.globalAlpha *= clamp(qu); const k = lerp(1.5, 1, E.out5(clamp(qu))); ctx.translate(cx, cy); ctx.scale(k, k); ctx.font = `330px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = C.yellow; ctx.fillText('?', 0, 118); ctx.restore(); }
  const mu = p(t, ST.c11, ST.c11 + 1.4);                                                                 // then 7½¢ is drawn in, right as the question starts
  if (mu > 0) { ctx.save(); ctx.globalAlpha *= clamp(mu * 3); ctx.font = `210px ${F.black}`; ctx.textAlign = 'center'; ctx.lineWidth = 7; ctx.strokeStyle = '#FFFFFF'; ctx.setLineDash([2400 * mu, 3000]); ctx.strokeText('7½¢', cx, cy + 75);
    if (mu >= 1) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillText('7½¢', cx, cy + 75); } ctx.restore(); }
  P.dim(ctx, cx - 300, cy + 380, cx + 300, cy + 380, 'ONE COIN', p(t, w.seven11 + 0.2, w.seven11 + 0.6), 52);
  const pop = p(t, w.coin11 - 0.12, w.coin11 + 0.35), drop = E.inOut(p(t, 25.35, 25.8));
  if (pop > 0 && t < 25.85) { const k = E.back(pop, 1.8), pos = bez([cx, cy - 20 * k], [cx, ENV[1] - 600], [ENV[0], ENV[1] - 20], drop);
    envelope(ctx, t, 'back'); drawCoin(ctx, { x: pos[0], y: pos[1], r: lerp(300 * k, 120, drop), spin: wob(t) + (1 - E.out(pop)) * Math.PI * 1.5, face: 'half', pulseH: 0 }); envelope(ctx, t, 'front'); }
  else if (t < w.took - 0.05) envelope(ctx, t, 'both');
}
// the envelope: slides in under the coin (25.0), closes (25.8), postmark 1953, FROM line, REPORTEDLY; flies to the White House; comes back stamped
function envPose(t) {
  const inn = E.out(p(t, 24.95, 25.4)); if (inn <= 0) return null;
  let pos = [ENV[0], ENV[1] + (1 - inn) * 1100], s = 1, rot = -0.02;
  const fly = E.inOut(p(t, w.took - 0.05, w.took + 1.0)); if (fly > 0) { pos = bez(pos, [800, -1700], WHDOOR, fly); s = lerp(1, 0.18, fly); rot = lerp(-0.02, 0.3, Math.sin(fly * Math.PI)); }
  const back = E.out(p(t, ST.c13 - 0.15, ST.c13 + 0.3)); if (back > 0) { pos = L2(WHDOOR, [1440, -1180], back); s = lerp(0.18, 0.95, back); rot = lerp(0.2, -0.05, back); }
  const out = E.in(p(t, 32.05, 32.3)); if (out > 0) { pos = [pos[0] + out * 1600, pos[1] - out * 300]; rot += out; }
  return { pos, s, rot };
}
function envelope(ctx, t, part) {
  const e = envPose(t); if (!e) return; const flap = 1 - E.inOut(p(t, 25.75, 26.05));
  ctx.save(); ctx.translate(e.pos[0], e.pos[1]); ctx.rotate(e.rot); ctx.scale(e.s, e.s);
  if (part !== 'front') P.envelopeBack(ctx, { flap });
  if (part !== 'back') P.envelopeFront(ctx, { flap, front: x => {
    x.save(); x.globalAlpha *= 1 - 0.75 * p(t, w.interested - 0.3, w.interested - 0.1);
    text(x, 'TO: THE WHITE HOUSE', -290, 80, 44, C.ink, F.black, 'left', 560);
    const fu = p(t, w.chairman - 0.15, w.chairman + 0.5); if (fu > 0) { const s = 'FROM: ROBERT WOODRUFF, COCA-COLA'; text(x, s.slice(0, Math.ceil(s.length * fu)), -290, 150, 32, '#5A5A5A', F.black, 'left', 580); }
    x.restore();
    const pm = p(t, 26.0, 26.25); if (pm > 0) { x.save(); x.translate(205, -105); x.rotate(-0.2); x.scale(lerp(1.8, 1, E.out5(pm)), lerp(1.8, 1, E.out5(pm))); x.globalAlpha *= clamp(pm * 3) * 0.9;
      x.strokeStyle = C.red; x.lineWidth = 7; x.beginPath(); x.arc(0, 0, 70, 0, 7); x.stroke(); x.beginPath(); x.arc(0, 0, 54, 0, 7); x.stroke(); text(x, '1953', 0, 16, 44, C.red, F.black, 'center');
      for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(84, -24 + i * 16); for (let k = 0; k <= 6; k++) x.lineTo(84 + k * 22, -24 + i * 16 + Math.sin(k * 1.6) * 5); x.stroke(); } x.restore(); }
    x.save(); x.translate(-130, -110); const rp = 1 + 0.15 * Math.sin(clamp(p(t, w.reportedly - 0.05, w.reportedly + 0.3)) * Math.PI); x.scale(rp, rp); P.stamp(x, ['REPORTEDLY'], '#6A6A6A', p(t, 25.3, 25.5), { size: 48, rot: -0.08 }); x.restore();
    x.save(); x.translate(20, 40); P.stamp(x, ['U.S. TREASURY', 'NOT INTERESTED'], C.red, p(t, w.interested - 0.12, w.interested + 0.12), { size: 60, rot: -0.1, a: 1 }); x.restore();
  } });
  ctx.restore();
}
function compareScene(ctx, t) {
  const [X, Y] = CMP, coke = t > ST.c15 - 0.05, gone = E.in(p(t, FUSE, FUSE + 0.45));
  // the header: MOST COMPANIES -> COCA-COLA
  const hu = E.back(p(t, 32.3, 32.6), 1.8), flip = p(t, ST.c15 - 0.1, ST.c15 + 0.15);
  if (hu > 0 && gone < 1) { ctx.save(); ctx.translate(X, Y - 520 - gone * 700); ctx.scale(hu, hu * Math.abs(Math.cos(flip * Math.PI)));
    tag(ctx, flip < 0.5 ? 'MOST COMPANIES' : 'COCA-COLA', 0, 0, { size: 76, bg: flip < 0.5 ? C.ink : C.red, rot: -0.02 }); ctx.restore(); }
  // the price tag: rolls 5¢ -> 6¢ -> 7¢ (to fit the coins), then -> 7½¢ (Coke's price)
  let roll = null; for (const [t0, a, b] of [[w.change14 - 0.05, '5¢', '6¢'], [w.prices - 0.05, '6¢', '7¢'], [w.tried - 0.05, '7¢', '7½¢']]) if (t >= t0) roll = { from: a, to: b, u: p(t, t0, t0 + 0.3) };
  const tu = E.back(p(t, 32.4, 32.75), 1.6); if (tu > 0 && gone < 1) { ctx.save(); ctx.translate(X - gone * 1100, Y - 290 - gone * 200); ctx.rotate(-0.03 - gone); ctx.scale(tu * 1.15, tu * 1.15);
    P.priceTag(ctx, { label: 'PRICE', value: '5¢', roll, w: 360, h: 250 });
    const hl = coke ? 0 : Math.sin(clamp(p(t, w.change14 - 0.1, w.prices + 0.5)) * Math.PI); if (hl > 0) { ctx.save(); ctx.globalAlpha *= hl; ctx.strokeStyle = C.yellowD; ctx.lineWidth = 10; ctx.setLineDash([18, 12]); rr(ctx, -200, -145, 400, 290, 20); ctx.stroke(); ctx.restore(); }
    ctx.restore(); }
  // the money: a nickel, then pennies join as the price climbs; it is locked first, then melts into the 7½¢ coin
  const coins = [[-110, 60, 92, 'nickel', 32.45], [55, 75, 66, 'penny', w.change14], [180, 80, 66, 'penny', w.prices]];
  const melt = E.inOut(p(t, w.change15 - 0.1, FUSE));
  for (const [cx, cy, r, f, t0] of coins) { const u = E.back(p(t, t0, t0 + 0.3), 1.8); if (u <= 0 || melt >= 1) continue;
    const q = L2([X + cx, Y + cy], [X + 20, Y + 70], melt), sh = melt > 0.7 ? Math.sin(t * 60) * 6 : 0; drawCoin(ctx, { x: q[0] + sh, y: q[1], r: r * u * (1 - melt * 0.25), spin: 0.2 + melt * 0.6, face: f, tilt: 0.15 }); }
  const fl = p(t, FUSE - 0.05, FUSE + 0.3); if (fl > 0 && fl < 1) { ctx.save(); ctx.globalAlpha *= 1 - fl; ctx.fillStyle = '#FFFDF8'; ctx.beginPath(); ctx.arc(X + 20, Y + 70, 120 + fl * 220, 0, 7); ctx.fill(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 14; ctx.stroke(); ctx.restore(); }
  if (t > 32.45 && melt < 1) { const mu = E.back(p(t, 32.6, 32.9), 1.6); ctx.save(); ctx.globalAlpha *= 1 - melt; text(ctx, 'MONEY', X + 30, Y + 215, 52, '#7A7A7A', F.black, 'center'); ctx.restore(); }
  // the arrow: the price follows the money (most companies) ... then the money should follow the price (Coke)
  const au = p(t, w.fit14 - 0.1, w.fit14 + 0.25) * (1 - p(t, ST.c15 - 0.2, ST.c15)), bu = 0;
  if (au > 0) P.arrow(ctx, X + 30, Y - 45, X + 30, Y - 125, au, C.ink, 20);
  if (bu > 0) P.arrow(ctx, X + 30, Y - 128, X + 30, Y - 45, bu, C.red, 20);
  // the padlock: on the money (most companies) -> flies to the price (Coke)
  const lu = E.back(p(t, 32.9, 33.2), 1.8), lm = E.inOut(p(t, w.tried - 0.1, w.tried + 0.35));
  if (lu > 0 && gone < 1) { const q = L2([X - 290, Y + 50], [X + 225, Y - 370], lm), sh = Math.sin(clamp(p(t, w.tried + 0.35, w.tried + 0.6)) * Math.PI);
    ctx.save(); ctx.translate(q[0] - gone * 1100 * lm, q[1] - gone * 200); ctx.rotate(-0.1 + sh * 0.25); ctx.scale(lu * 0.8, lu * 0.8); padlock(ctx); ctx.restore(); }
}
function padlock(ctx) {
  ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 34; ctx.beginPath(); ctx.arc(0, -40, 52, Math.PI, 0); ctx.lineTo(52, 0); ctx.moveTo(-52, 0); ctx.lineTo(-52, -40); ctx.stroke();
  ctx.strokeStyle = '#B9BEC6'; ctx.lineWidth = 20; ctx.stroke(); ctx.restore();
  cut(ctx, () => rr(ctx, -80, -10, 160, 130, 16), C.yellow, { sb: 14, sy: 7, lw: 4 }); flat(ctx, () => { ctx.beginPath(); ctx.arc(0, 40, 16, 0, 7); ctx.rect(-6, 40, 12, 40); }, C.ink);
}
function worldTags(ctx, t) {
  tag(ctx, 'WHY?', 250, -330, { u: p(t, w.why - 0.05, w.why + 0.2) * (1 - p(t, 4.85, 5.05)), size: 96, bg: C.red, rot: 0.06 });
  tag(ctx, 'ONE COIN ONLY', SLOTW[0] - 20, SLOTW[1] - 175, { u: p(t, w.one - 0.1, w.one + 0.15) * (1 - p(t, 14.25, 14.45)), size: 44, bg: C.ink, rot: -0.04 });
  const pp = palmPos(t); tag(ctx, '5¢ + 1¢ = 2 COINS', -50, 420 + (pp[1] - PALM[1]), { u: p(t, w.customers + 0.05, w.customers + 0.3) * (1 - p(t, 17.6, 17.8)), size: 50, bg: C.yellow, fg: C.ink, rot: -0.05 });
  ctx.save(); ctx.translate(SIGNW[0] - 40, SIGNW[1] + 360); P.stamp(ctx, ['×2'], C.red, p(t, w.double - 0.08, w.double + 0.15) * (1 - p(t, 20.3, 20.5)), { size: 120, rot: 0.12 }); ctx.restore();
  tag(ctx, '= DOUBLE', SIGNW[0] - 40, SIGNW[1] + 530, { u: p(t, w.double + 0.1, w.double + 0.35) * (1 - p(t, 20.3, 20.5)), size: 46, bg: C.ink, rot: 0.05 });
  tag(ctx, 'NEVER MINTED', BPC[0] + 230, BPC[1] + 250, { u: p(t, w.coin11 + 0.2, w.coin11 + 0.4) * (1 - p(t, 25.3, 25.45)), size: 40, bg: C.ink, rot: 0.06, tape: false });
  tag(ctx, 'A WILD IDEA', BP[0], BP[1] - 590, { u: p(t, w.wild - 0.1, w.wild + 0.15) * (1 - p(t, 24.7, 24.95)), size: 64, bg: C.yellow, fg: C.ink, rot: -0.03 });
  ctx.save(); ctx.translate(BP[0] + 270, BP[1] - 390); P.stamp(ctx, ['PROPOSAL'], '#FFFFFF', p(t, w.coin11 + 0.25, w.coin11 + 0.45), { size: 50, rot: -0.15 }); ctx.restore();
  // the White House
  if (t > 27.6 && t < 32.3) { ctx.save(); ctx.translate(WHP[0], WHP[1]); const u = E.back(p(t, 27.9, 28.4), 1.4); ctx.scale(u, u); P.whiteHouse(ctx, t); ctx.restore();
    tag(ctx, 'THE WHITE HOUSE', WHP[0], WHP[1] + 90, { u: p(t, 28.5, 28.75) * (1 - p(t, 30.5, 30.7)), size: 46, bg: C.ink, rot: 0.02, tape: false });
    tag(ctx, 'PRESIDENT EISENHOWER', WHP[0], WHP[1] - 720, { u: p(t, w.president - 0.05, w.president + 0.2) * (1 - p(t, 30.5, 30.7)), size: 56, bg: C.red, rot: -0.03 }); }
  // the envelope flies in front of the White House
  const wash = E.inOut(p(t, ST.c13 - 0.15, ST.c13 + 0.3)) * (1 - p(t, 32.1, 32.3)); if (wash > 0) { ctx.save(); ctx.fillStyle = `rgba(247,245,240,${0.7 * wash})`; ctx.fillRect(WHP[0] - 2000, WHP[1] - 2000, 4000, 4000); ctx.restore(); }
  if (t > w.took - 0.05 && t < 32.3) envelope(ctx, t, 'both');
}

// ---------- screen-space overlays ----------
function strip(ctx, txt, x, y, size, bg, fg, u, rot = -0.02) { if (u <= 0) return; const k = lerp(1.6, 1, E.out5(clamp(u))); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const tw = Math.min(940, ctx.measureText(txt).width + size * 0.7); cut(ctx, () => rr(ctx, -tw / 2, -size * 0.78, tw, size * 1.12, 10), bg, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(ctx, txt, 0, size * 0.18, size, fg, F.black, 'center', tw - size * 0.5); ctx.restore(); }
function hookTitle(ctx, u) { if (u <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(u);
  strip(ctx, 'COCA-COLA WANTED', A[0], 215, 96, C.red, '#FFFFFF', 1, -0.025);
  strip(ctx, 'A NEW U.S. COIN', A[0], 345, 80, C.ink, '#FFFFFF', 1, 0.015);
  tag(ctx, '1953 PROPOSAL · NEVER MINTED', A[0], 1290, { size: 38, bg: '#5A5A5A', rot: -0.01, tape: false }); ctx.restore(); }
function overlay(ctx, t, c) {
  hookTitle(ctx, 1 - p(t, 4.05, 4.3));
  hookTitle(ctx, p(t, w.price + 0.25, w.price + 0.5));                                                 // the loop: the last frame = the first
  strip(ctx, 'A COKE = 5¢ FOR DECADES', A[0], 222, 64, C.ink, '#FFFFFF', p(t, w.decades - 0.1, w.decades + 0.15) * (1 - p(t, 7.55, 7.75)));
  const nu = p(t, w.n400 - 0.15, w.n400 + 0.1) * (1 - p(t, 12.05, 12.25));
  if (nu > 0) { strip(ctx, '1950: ~400,000 MACHINES', A[0], 222, 64, C.red, '#FFFFFF', nu); }
  strip(ctx, 'AS REPORTED · 1953', A[0], 215, 66, C.ink, '#FFFFFF', p(t, 25.35, 25.6) * (1 - p(t, 31.95, 32.15)), 0.01);
  foreground(ctx, t, c);
  // the wipe into the comparison (a yellow paper band)
  const wp = p(t, 32.02, 32.5); if (wp > 0 && wp < 1) { ctx.save(); ctx.fillStyle = C.yellow; const x = lerp(-W * 1.3, W * 1.3, E.inOut(wp)); ctx.translate(x, 0); ctx.rotate(0.08); cut(ctx, () => rr(ctx, -W * 0.5, -300, W, H + 600, 0), C.yellow, { lw: 0, sb: 40, sy: 0 }); ctx.restore(); }
}
// out-of-focus coins close to the lens (parallax 1.6x)
const FG = [[-560, -300, 'penny', 70, 0, 4.4], [520, 420, 'nickel', 80, 0, 4.4], [-760, 180, 'penny', 120, 4.5, 12.2], [700, -260, 'nickel', 110, 4.5, 12.2],
  [-560, -1800, 'nickel', 110, 20.2, 27.6], [560, -900, 'penny', 90, 20.2, 27.6], [-520, CMP[1] - 600, 'penny', 80, 32.3, 36.4], [560, CMP[1] + 500, 'nickel', 90, 32.3, 36.4],
  [-560, FINAL_C[1] - 300, 'penny', 70, 36.4, 40], [520, FINAL_C[1] + 420, 'nickel', 80, 36.4, 40]];
function foreground(ctx, t, c) {
  for (const [x, y, f, r, t0, t1] of FG) { const a = p(t, t0, t0 + 0.4) * (1 - p(t, t1 - 0.4, t1)); if (a <= 0) continue;
    const spr = K.sprite('fg' + f + r, r * 2.4, r * 2.4, g => P.coin(g, r, { face: f, spin: 0.5, shadow: false }), 9, 3);
    const z = c.z * 1.6, sx = A[0] + (x - c.x) * z, sy = A[1] + (y - c.y) * z, s = 1.6 * (c.z / 1);
    if (sx < -400 || sx > W + 400 || sy < -400 || sy > H + 400) continue;
    ctx.save(); ctx.globalAlpha *= a * 0.8; ctx.translate(sx, sy); ctx.rotate(t * 0.2 + x); ctx.scale(s * 0.5, s * 0.5); ctx.drawImage(spr, -spr.width / 2, -spr.height / 2); ctx.restore(); }
}

// ---------- subtitles (hand-made phrase groups, numbers as digits) ----------
const SPLIT = { c01: [3, 4], c02: [5], c03: [1], c04: [2, 8], c05: [3, 3, 3], c06: [6], c07: [2], c08: [6, 4], c09: [4, 2], c10: [8], c11: [7], c12: [2, 4, 6], c13: [4], c14: [3, 6], c15: [4, 6] };
const REPL = [[/five cents/i, '5¢'], [/six cents\?/i, '6¢?'], [/to ten\?/i, 'to 10¢?'], [/seven-and-a-half-cent/i, '7½¢'], [/HALF/, 'HALF'], [/DOUBLE/, 'DOUBLE']];
function manualSubs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k, k + n) }); k += n; }); if (k !== ws.length) throw new Error(`subtitle split ${id}: ${k} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], end = Math.min(g.words[g.words.length - 1].t1, ST[g.id] + SPEECH_END[g.id]) + 0.45; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(end, nx.words[0].t0 - 0.05)) : Math.min(end + 0.4, T);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}

const ep = {
  T, cam, background, overlay, world,
  subs: manualSubs(),
  subStyle: { y: 1565, size: 62, maxW: 900, highlight: ['half', 'nickel', '5¢', '10¢', 'double', '7½¢', 'reportedly', 'money'] },
  vo: Object.entries(ST),
  music: { b0: 0.0, story: ST.c04, tense: ST.c08, idea: ST.c10, hist: ST.c12, fin: ST.c14, hit: w.price, end: T },
  cues() {
    const c = [['tag', 0.05, 0.6], ['clink', 0.3, 1.2], ['pop', w.seven, 0.7], ['stamp', w.half, 0.6], ['clink', w.half + 0.02, 1.4], ['tag', w.why, 0.8], ['flap', 4.3, 0.5], ['whoosh', 4.35, 0.6], ['clink', 5.3, 1.6], ['rise', 4.55, 0.4]];
    c.push(['tag', 5.05, 0.6], ['tag', w.decades, 0.6]); for (let i = 0; i < 7; i++) c.push(['tick', 5.4 + i * 0.3, 0.5]);
    c.push(['stamp', w.y1950, 0.6], ['whoosh', 8.3, 0.6], ['rumble', 8.45, 0.8], ['slam', 9.2, 0.6]);
    for (let i = 0; i < 8; i++) c.push(['pop', w.n400 - 0.5 + i * 0.09, 0.45]); c.push(['tag', w.n400, 0.7], ['whoosh', 12.05, 0.8], ['tag', w.one, 0.6]);
    c.push(['whoosh', NICK_IN[0] - 0.3, 0.4], ['flutter', NICK_IN[0] - 0.25, 0.8], ['thump', NICK_IN[1], 0.7], ['clink', NICK_IN[1] + 0.02, 1.4], ['kaching', NICK_IN[1] + 0.25, 0.35], ['whoosh', 14.35, 0.5]);
    c.push(['tick', w.six - 0.1, 0.8], ['flap', w.six - 0.1, 0.4], ['rise', w.customers - 0.4, 0.4], ['tag', w.customers + 0.05, 0.6], ['clink', w.extra + 0.3, 1.6], ['snap', w.extra + 0.32, 0.6], ['fall', w.extra + 0.5, 0.35], ['clink', w.extra + 1.1, 0.8]);
    for (let i = 0; i < 4; i++) c.push(['tick', w.ten - 0.12 + i * 0.14, 0.8]);
    c.push(['slam', w.double, 0.8], ['stamp', w.double + 0.02, 0.6], ['boom', w.double, 0.35], ['tag', w.double + 0.1, 0.5]);
    c.push(['whoosh', 20.15, 0.9], ['unfold', 20.35, 1], ['paper', 20.5], ['scratch', 21.05, 0.6], ['tag', w.wild, 0.6], ['scratch', ST.c11, 0.6], ['scratch', ST.c11 + 0.6, 0.4], ['pop', w.coin11 - 0.1, 0.9], ['clink', w.coin11 + 0.05, 1.4], ['stamp', w.coin11 + 0.3, 0.4]);
    c.push(['paper', 24.95, 1], ['whoosh', 25.35, 0.4], ['clink', 25.75, 1], ['paper', 25.8], ['stamp', 25.3, 0.45], ['stamp', 26.0, 0.6], ['tape', w.chairman, 0.5], ['pop', w.reportedly, 0.5]);
    c.push(['whoosh', w.took, 0.7], ['flutter', w.took + 0.3, 0.6], ['tag', 28.5, 0.5], ['tag', w.president, 0.6], ['whoosh', ST.c13 - 0.15, 0.6], ['slam', w.interested - 0.05, 0.8], ['stamp', w.interested - 0.03, 0.8], ['wah', w.interested + 0.35, 0.35]);
    c.push(['cut', 32.0, 0.8], ['tag', 32.35, 0.6], ['clink', 32.5, 1.2], ['tag', 32.95, 0.4], ['tick', w.change14, 0.8], ['clink', w.change14 + 0.05, 1.2], ['tick', w.prices, 0.8], ['clink', w.prices + 0.05, 1.2], ['pop', w.fit14, 0.6]);
    c.push(['flap', ST.c15 - 0.1, 0.6], ['tick', w.tried, 0.8], ['snap', w.tried + 0.35, 0.8], ['rise', w.change15 - 0.1, 0.5], ['coins', FUSE - 0.3, 0.5], ['slam', FUSE, 0.6], ['clink', FUSE + 0.02, 1.6], ['whoosh', FUSE + 0.1, 0.5]);
    c.push(['slam', w.price, 0.6], ['clink', w.price + 0.02, 1.8], ['kaching', w.price + 0.05, 0.45], ['tag', w.price + 0.25, 0.6]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
