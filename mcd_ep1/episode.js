// "How McDonald's Really Makes Money" — episode 1 of the collage-documentary format (1080x1920, 30 fps).
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | cues
// Scenes are modules in one paper world; each owns its time window, camera keys, props, overlay text and sound cues.
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const EN = require('./engine');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, contact, applyCam, tag, restaurant, slab, burgerMoney, coin, bill, pin, sparkle, puff, hq, continents, ll, skyline, LIGHT } = K;
const { W, H, A } = EN;

// ---------- voice-over (Chris, ElevenLabs) and word timing ----------
const ST = { v1: 0.3, v2: 3.35, v3: 5.95, v4: 10.05, v5: 17.75, v6: 26.4, v7: 31.35 };
const V = EN.voice(`${__dirname}/vo`, ST);
const at = V.at, T = 39.6;
const w = {
  money: at('v1', 'money'), burgers1: at('v1', 'burgers'), story: at('v2', 'story'),
  ninety: at('v3', 'ninety'), franchisees: at('v3', 'franchisees'),
  sell: at('v4', 'sell'), food: at('v4', 'food'), royalties: at('v4', 'royalties'), many: at('v4', 'many'), rent: at('v4', 'rent'),
  y2025: at('v5', '2025'), franchise: at('v5', 'franchise'), about: at('v5', 'about'), ten: at('v5', 'ten'), billion: at('v5', 'billion'), royalties2: at('v5', 'royalties'), billions: at('v5', 'billions'),
  twist: at('v6', 'twist'), earn: at('v6', 'earn'), restaurant: at('v6', 'restaurant'), operate: at('v6', 'operate'),
  golden: at('v7', 'golden'), burgers7: at('v7', 'burgers'), business: at('v7', 'business'),
};
const p = (t, a, b) => seg(t, a, b);

// ---------- world layout ----------
const CARD = [0, 140];                                   // map card front edge (S3)
const k = 0.36, R = [{ x: -250, sy: -230, land: 'soil' }, { x: -250, sy: 75, land: 'pave' }, { x: -250, sy: 380, land: 'soil' }];
const HQP = [250, 420, 0.95];                            // HQ in the money diagram (S4/S5)
const TW = { x: 0, sy: 2600 };                           // twist / ending stage (S6/S7), far below the diagram
const STREET = [{ x: -900, s: 0.9 }, { x: -470, s: 0.9 }]; // muted neighbours of the hero restaurant (S2)
const HQS = [560, 0, 0.95];                              // HQ on the street (S2)
const CITY = (n, lo, la, o = {}) => { const q = ll(lo, la); return { n, x: CARD[0] + q[0], y: CARD[1] + q[1], ...o }; };
const PINS = [CITY('Los Angeles', -118, 34, { hi: 0 }), CITY('Mexico City', -99, 19), CITY('New York', -74, 41), CITY('Sao Paulo', -46, -23), CITY('London', 0, 52, { hi: 1 }),
  CITY('Madrid', -4, 40, { own: true }), CITY('Cairo', 31, 30), CITY('Johannesburg', 28, -26), CITY('Dubai', 55, 25), CITY('Mumbai', 73, 19), CITY('Beijing', 116, 40),
  CITY('Tokyo', 140, 36, { hi: 2 }), CITY('Sydney', 151, -34), CITY('Toronto', -79, 44)];
const HQCITY = CITY('Chicago', -88, 42);
PINS.forEach(c => { c.t = 6.75 + ((c.x + 460) / 920) * 1.55; });
const bez = (P, u) => { const v = 1 - u; return [0, 1].map(i => v * v * v * P[0][i] + 3 * v * v * u * P[1][i] + 3 * v * u * u * P[2][i] + u * u * u * P[3][i]); };
const ROY = R.map((r, i) => { const s = [r.x + k * 215, r.sy - k * 150], e = [HQP[0] - 108 * HQP[2], HQP[1] - [470, 340, 210][i] * HQP[2]]; return [s, [s[0] + 150, s[1] - 70], [e[0] - 130, e[1] + 10], e]; });
const RENT = R.map((r, i) => { if (r.land !== 'soil') return null; const s = [r.x + k * 330, r.sy + k * 110], e = [HQP[0] - 108 * HQP[2], HQP[1] - [400, 140][i ? 1 : 0] * HQP[2]]; return [s, [s[0] + 120, s[1] + 90], [e[0] - 150, e[1] + 70], e]; });
const TRAVEL = 1.0;
const COINS = [], BILLS = [];
for (let wv = 0; wv < 3; wv++) R.forEach((r, i) => COINS.push({ i, t: w.royalties - 0.1 + wv * 0.5 + i * 0.12 }));
for (let wv = 0; wv < 2; wv++) R.forEach((r, i) => RENT[i] && BILLS.push({ i, t: w.rent - 0.55 + wv * 0.5 + i * 0.08 }));

// ---------- camera ----------
const KEYS = [
  { t: 0, x: 0, y: -200, z: 0.95 }, { t: 0.4, x: 0, y: -200, z: 0.95 }, { t: 0.78, x: 0, y: -190, z: 1.35, e: 'out5' }, { t: 2.3, x: 0, y: -185, z: 1.42 },
  { t: 3.05, x: 0, y: -230, z: 1.05 }, { t: 4.1, x: 40, y: -287, z: 0.8, e: 'inOut5' }, { t: 5.85, x: 55, y: -290, z: 0.84 },        // S1 hook -> S2 reveal (pull-back)
  { t: 6.7, x: -40, y: -150, z: 0.98 }, { t: 9.9, x: 50, y: -150, z: 1.1, r: 0.015 },                                                     // S3 map, slow sharp pan
  { t: 10.8, x: 0, y: 40, z: 1.0 }, { t: 17.6, x: -10, y: 36, z: 1.04 },                                                                    // S4 money diagram
  { t: 18.4, x: HQP[0] - 20, y: 110, z: 1.8, e: 'inOut5' }, { t: 26.0, x: HQP[0] + 20, y: 120, z: 1.86 },                                  // S5 push-in to HQ, numbers
  { t: 26.6, x: 0, y: TW.sy - 150, z: 1.5, e: 'inOut5' }, { t: 27.6, x: 0, y: TW.sy - 160, z: 1.55 }, { t: 28.5, x: 0, y: TW.sy - 270, z: 0.8 }, { t: 31.2, x: 10, y: TW.sy - 275, z: 0.82 }, // S6 whip, close-up, pull-back
  { t: 32.3, x: 176, y: TW.sy - 470, z: 2.1 }, { t: 33.0, x: 0, y: TW.sy - 40, z: 1.45 }, { t: 34.4, x: 0, y: TW.sy - 45, z: 1.5 },         // S7 push to the arches, burger
  { t: 35.9, x: 60, y: TW.sy - 210, z: 0.78 }, { t: T, x: 64, y: TW.sy - 214, z: 0.76, e: 'out' },                                       // S7 pull-back to the final composition
];
const cam = EN.camera(KEYS, {
  breath: t => (1 - 0.75 * E.inOut(seg(t, 37.2, T))) * (1 - 0.6 * seg(t, 11, 11.5) * (1 - seg(t, 17.2, 17.6))),
  shakes: [[0.38, 16], [32.9, 12]],
});

// ---------- background planes ----------
const farC = createCanvas(W / 2, H / 2), farX = farC.getContext('2d'), skyC = createCanvas(W / 2, H / 2), skyX = skyC.getContext('2d');
function torn(ctx, x, y, w2, h, rot, sd, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-w2 / 2, -h / 2); for (let i = 0; i <= 12; i++) ctx.lineTo(-w2 / 2 + (w2 * i) / 12, -h / 2 + (hash(sd + i) - 0.5) * 14);
    for (let i = 12; i >= 0; i--) ctx.lineTo(-w2 / 2 + (w2 * i) / 12, h / 2 + (hash(sd + 40 + i) - 0.5) * 14); ctx.closePath(); }, col, { lw: 0, sb: 14, sy: 6, edgeW: 0 });
  ctx.restore();
}
function halftone(ctx, x, y, n, step, col) { ctx.fillStyle = col; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const d = Math.hypot(i - n / 2, j - n / 2) / (n / 2), r = step * 0.38 * (1 - d); if (r > 0.6) { ctx.beginPath(); ctx.arc(x + i * step, y + j * step, r, 0, 7); ctx.fill(); } } }
function network(ctx, t, u) { // franchise network on the back plane (ending): pins on the skyline, linked
  const P = [[-560, -330], [-330, -430], [-110, -360], [120, -450], [360, -380], [580, -300]];
  ctx.save(); ctx.globalAlpha = clamp(u * 2); ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(23,23,23,0.35)';
  ctx.beginPath(); P.forEach((q, i) => { const m = clamp(u * 1.5 - i * 0.08); if (m <= 0) return; i ? ctx.lineTo(q[0], q[1] - 34) : ctx.moveTo(q[0], q[1] - 34); }); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  P.forEach((q, i) => pin(ctx, q[0], q[1], 1.15 * E.back(clamp(u * 1.6 - i * 0.1), 2)));
}
function background(ctx, t, c) {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  farX.setTransform(1, 0, 0, 1, 0, 0); farX.clearRect(0, 0, W / 2, H / 2); farX.scale(0.5, 0.5); LIGHT.elev = 0.4;
  farX.save(); applyCam(farX, c, A, 0.25);
  torn(farX, -470, -820, 520, 90, -0.12, 1, '#EFE6D3'); torn(farX, 520, 760, 560, 100, 0.09, 7, '#EAE2CF'); torn(farX, 560, -420, 300, 70, 0.5, 13, '#F1E2C4');
  torn(farX, -560, 560, 360, 80, -0.4, 21, '#E3EEE9'); torn(farX, -80, 1150, 700, 110, 0.05, 31, '#EFE3CC'); torn(farX, 480, 1500, 420, 90, -0.2, 41, '#E8E0CC');
  halftone(farX, 260, -900, 12, 20, 'rgba(23,23,23,0.10)'); halftone(farX, -640, 220, 11, 22, 'rgba(230,57,70,0.16)'); halftone(farX, 380, 380, 10, 20, 'rgba(38,166,154,0.16)'); halftone(farX, -520, 900, 11, 22, 'rgba(23,23,23,0.08)');
  farX.restore();
  ctx.save(); ctx.filter = 'blur(2.5px)'; ctx.drawImage(farC, 0, 0, W, H); ctx.restore();
  // accent disc (back plane): hook, map stage, ending
  ctx.save(); applyCam(ctx, c, A, 0.4);
  const disc = (cx, cy, r, col, ht) => { if (r <= 1) return; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); if (ht) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip(); halftone(ctx, cx - r, cy + r * 0.1, 18, r / 9, ht); ctx.restore(); } };
  if (t < 4.2) disc(0, -330, 420 * E.back(p(t, 0.36, 0.75), 2) * (1 - E.in(p(t, 3.2, 3.9))), C.yellow, 'rgba(233,169,58,0.55)');
  if (t > 6.2 && t < 10.6) disc(0, -80, 640 * E.out(p(t, 6.2, 6.9)) * (1 - E.in(p(t, 9.9, 10.5))), 'rgba(38,166,154,0.10)');
  if (t > 32.8) disc(24, 950, 340 * E.back(p(t, 32.88, 33.3), 2), C.yellow, 'rgba(233,169,58,0.55)');
  ctx.restore();
  // skyline (middle-back plane, light blur): the street in S2, the network in the ending
  const s2 = t > 3.1 && t < 6.6 ? E.out(p(t, 3.2, 4.0)) * (1 - E.in(p(t, 5.85, 6.4))) : 0, s7 = t > 34.6 ? E.out(p(t, 34.7, 35.6)) : 0;
  if (s2 > 0 || s7 > 0) {
    skyX.setTransform(1, 0, 0, 1, 0, 0); skyX.clearRect(0, 0, W / 2, H / 2); skyX.scale(0.5, 0.5); LIGHT.elev = 0.6;
    skyX.save(); applyCam(skyX, c, A, 0.62);
    if (s2 > 0) { skyX.save(); skyX.translate(-90, -170); skyline(skyX, s2); skyX.restore(); }
    if (s7 > 0) { skyX.save(); skyX.translate(37, 1645); skyX.scale(0.72, 0.72); skyline(skyX, s7); network(skyX, t, p(t, 35.0, 36.0)); skyX.restore(); }
    skyX.restore();
    ctx.save(); ctx.filter = 'blur(1.2px)'; ctx.drawImage(skyC, 0, 0, W, H); ctx.restore();
  }
  LIGHT.elev = 1;
}

// ---------- shared props ----------
const SPR = {};
function monoRestaurant(ctx, x, y, s) { // desaturated neighbour (cached sprite + filter) so the hero stays the only colour accent
  if (!SPR.mono) { const c = createCanvas(560, 640), x2 = c.getContext('2d'); restaurant(x2, 266, 560, 1); const m = createCanvas(560, 640), y2 = m.getContext('2d');
    y2.filter = 'grayscale(1) sepia(0.22) brightness(1.13) contrast(0.8)'; y2.drawImage(c, 0, 0); SPR.mono = m; }
  ctx.drawImage(SPR.mono, x - 266 * s, y - 560 * s, 560 * s, 640 * s);
}
function slotRise(ctx, x, y, u, draw) { // object rises out of a slot in the paper (mask reveal)
  if (u <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x - 600, y - 1400, 1200, 1402); ctx.clip(); ctx.translate(0, lerp(800, 0, E.back(u, 1.2))); draw(); ctx.restore();
}
function dashPath(ctx, P, u, col, t) { if (u <= 0) return; ctx.beginPath(); for (let i = 0; i <= 40 * u; i++) { const q = bez(P, i / 40); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
  ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); ctx.setLineDash([]); }
function trail(ctx, n, u, draw, gap = 0.025) { for (let g = n; g >= 0; g--) { ctx.save(); ctx.globalAlpha *= g ? 0.22 * Math.sin(u * Math.PI) ** 2 : 1; draw(clamp(u - g * gap), g); ctx.restore(); } }

// ================= SCENES =================
// S1 HOOK — burger slams, camera punches in, burger morphs into bills, the restaurant rises and swallows the money
const S1 = { t0: 0, t1: 3.4, draw(ctx, t) {
  const land = 0.38, fall = p(t, 0, land), d = t > land ? 1 - spring(t - land, 2.4, 5.5) : 0, mor = p(t, w.money - 0.1, w.money + 0.7);
  // restaurant rises behind the money
  if (t < 3.0) slotRise(ctx, 0, 0, p(t, 2.1, 2.65), () => { contact(ctx, 0, 2, 250, 18, 0.25); restaurant(ctx, 0, 0, 1, { glow: t > 3.0 ? Math.exp(-(t - 3.0) * 3) : 0 }); });
  if (t > 2.95 && t < 3.6) for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + 0.3, u = p(t, 3.0, 3.55); sparkle(ctx, 176 + Math.cos(a) * (60 + u * 150), -440 + Math.sin(a) * (60 + u * 150), 22 * Math.sin(u * Math.PI)); }
  if (t < 3.05) flat(ctx, () => rr(ctx, -340, 0, 680, 20, 10), C.grey, 3);
  if (t > 3.05) return;
  const y0 = -700 * (1 - fall * fall), fly = E.inOut(p(t, 2.55, 3.0));
  let x = 0, y = y0, s = 1.3, sx = 1 + d * 0.24, sy = 1 - d * 0.3;
  if (t < land) { sx = 0.9; sy = 1.14; }
  const flyPos = f => [lerp(0, 176, f), lerp(0, -400, f) - Math.sin(f * Math.PI) * 260, lerp(1.3, 0.05, E.in(f))];
  if (t > 2.55) [x, y, s] = flyPos(fly);
  if (t < 2.55) contact(ctx, 0, 6, 300 * (0.35 + 0.65 * fall * fall) * sx, 26, 0.3 * (0.3 + 0.7 * fall * fall));
  if (t < land) for (let g = 4; g >= 1; g--) { ctx.save(); ctx.globalAlpha = 0.13; const f2 = clamp(fall - g * 0.07); burgerMoney(ctx, 0, -700 * (1 - f2 * f2), s, 0, { sx, sy }); ctx.restore(); }
  if (t > 2.55) for (let g = 3; g >= 1; g--) { const q = flyPos(E.inOut(clamp(p(t, 2.55, 3.0) - g * 0.05))); ctx.save(); ctx.globalAlpha = 0.14; burgerMoney(ctx, q[0], q[1], q[2], 1); ctx.restore(); }
  burgerMoney(ctx, x, y, s, mor, { sx, sy });
  puff(ctx, -260, 4, p(t, land, land + 0.65), -1); puff(ctx, 260, 4, p(t, land, land + 0.65), 1);
} };

// S2 REVEAL — pull-back: the hero restaurant is one of many; HQ appears; the operator runs the hero
const S2 = { t0: 2.9, t1: 6.7, draw(ctx, t) {
  const m = E.inOut(p(t, 5.85, 6.6)); // -> S3 morph
  // sidewalk grows into the map card
  const rx = lerp(-1100, -460, m), ry = lerp(0, -440, m), rw = lerp(1900, 920, m), rh = lerp(20, 580, m);
  if (t > 3.05) cut(ctx, () => rr(ctx, rx, ry, rw, rh, lerp(10, 6, m)), K.lerpCol(C.grey, C.cream, m), { sb: 18 * m + 4, sy: 8 * m + 2 });
  if (m >= 1) return;
  const toPin = (x0, y0, c, s0) => ({ x: lerp(x0, c.x, m), y: lerp(y0, c.y, m) - Math.sin(m * Math.PI) * 120, s: s0 * (1 - E.in(m)) });
  STREET.forEach((r, i) => { const st = p(t, 3.3 + i * 0.14, 3.65 + i * 0.14); if (st <= 0) return; const q = toPin(r.x, 0, PINS[i ? 1 : 3], r.s);
    ctx.save(); ctx.globalAlpha = clamp(st * 2); const sc = q.s * lerp(1.25, 1, E.back(st, 2)); contact(ctx, q.x, q.y + 2, 230 * sc, 16, 0.2); monoRestaurant(ctx, q.x, q.y, sc); ctx.restore(); });
  // HQ (company) rises on the right
  const hqU = p(t, 3.85, 4.4);
  if (hqU > 0) { const q = toPin(HQS[0], 0, HQCITY, HQS[2]); slotRise(ctx, q.x, q.y, hqU, () => hq(ctx, q.x, q.y, q.s, { lit: 0.25 })); }
  // hero restaurant (continuous from S1)
  if (t > 3.0) { const q = toPin(0, 0, PINS[0], 1); contact(ctx, q.x, q.y + 2, 250 * q.s, 18, 0.25); restaurant(ctx, q.x, q.y, q.s, { glow: Math.exp(-(t - 3.0) * 3) }); }
  // relationship: dashed brand link HQ -> hero, tags
  const lk = E.inOut(p(t, 4.55, 5.1)) * (1 - m * 3);
  if (lk > 0) { ctx.save(); ctx.globalAlpha = clamp(1 - m * 3); dashPath(ctx, [[HQS[0] - 80, -560], [HQS[0] - 160, -760], [200, -760], [120, -560]], lk, 'rgba(23,23,23,0.45)', t); ctx.restore(); }
  const fade = 1 - p(t, 5.7, 5.95);
  tag(ctx, 'HQ', HQS[0], -700, { u: p(t, 4.4, 4.75) * fade, size: 54, bg: C.yellow, fg: C.ink, rot: -0.04 });
  tag(ctx, 'OPERATOR', -10, 110, { u: p(t, 4.95, 5.3) * fade, size: 54, bg: C.green, rot: 0.03 });
} };

// S3 FRANCHISE SYSTEM — the street becomes a map; pins pop; three operators linked to HQ
const S3 = { t0: 5.85, t1: 10.9, draw(ctx, t) {
  const out = E.inOut(p(t, 10.2, 10.75)); // -> S4
  if (t > 6.55) {
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(CARD[0], CARD[1]);
    cut(ctx, () => rr(ctx, -460, -580, 920, 580, 6), C.cream, { sb: 22, sy: 10 });
    rr(ctx, -460, -580, 920, 580, 6); ctx.clip();
    ctx.strokeStyle = 'rgba(23,23,23,0.13)'; ctx.lineWidth = 2; ctx.setLineDash([3, 10]);
    for (let la = -40; la <= 60; la += 20) { const y = ll(0, la)[1]; ctx.beginPath(); ctx.moveTo(-460, y); ctx.lineTo(460, y); ctx.stroke(); }
    for (let lo = -150; lo <= 180; lo += 30) { const x = ll(lo, 0)[0]; ctx.beginPath(); ctx.moveTo(x, -580); ctx.lineTo(x, 0); ctx.stroke(); }
    ctx.setLineDash([]);
    const rv = E.out(p(t, 6.4, 7.2)) * 1150; ctx.beginPath(); ctx.arc(HQCITY.x - CARD[0], HQCITY.y - CARD[1], Math.max(1, rv), 0, 7); ctx.clip();
    continents(ctx, { shrink: i => 1 - E.in(p(t, 10.0 + i * 0.03, 10.4 + i * 0.03)) });
    ctx.restore();
  }
  // links from the three highlighted operators to HQ
  PINS.forEach(c => { if (c.hi === undefined) return; const u = E.inOut(p(t, w.franchisees + 0.1 + c.hi * 0.12, w.franchisees + 0.6 + c.hi * 0.12)) * (1 - p(t, 10.0, 10.3));
    if (u > 0) dashPath(ctx, [[c.x, c.y - 40], [lerp(c.x, HQCITY.x, 0.3), Math.min(c.y, HQCITY.y) - 160], [lerp(c.x, HQCITY.x, 0.7), HQCITY.y - 160], [HQCITY.x, HQCITY.y - 40]], u, 'rgba(230,57,70,0.7)', t); });
  // pins: highlighted ones travel into the diagram as restaurants (S4)
  PINS.forEach(c => {
    const u = p(t, c.t, c.t + 0.6), s0 = c.n === 'Los Angeles' || c.n === 'Mexico City' || c.n === 'Sao Paulo' ? (t < 6.6 ? 0 : 1) : E.elastic(u);
    let x = c.x, y = c.y - (1 - E.out(p(t, c.t, c.t + 0.25))) * 50 * (s0 < 1 ? 1 : 0), s = 0.85 * s0;
    if (c.hi !== undefined) { const r = R[c.hi], mv = E.inOut(p(t, 10.15, 10.75)); x = lerp(c.x, r.x, mv); y = lerp(c.y, r.sy - 10, mv) - Math.sin(mv * Math.PI) * 120; s *= 1 - E.in(p(t, 10.5, 10.8));
      const ring = p(t, w.franchisees, w.franchisees + 0.5) * (1 - p(t, 10.0, 10.2)); if (ring > 0) { ctx.save(); ctx.globalAlpha = ring; ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(c.x, c.y - 42, 34 + Math.sin(t * 6) * 3, 0, 7); ctx.stroke(); ctx.restore(); } }
    else s *= 1 - E.in(p(t, 10.0, 10.3));
    if (s > 0.01) { pin(ctx, x, y, s); ctx.fillStyle = c.own ? C.ink : C.green; ctx.beginPath(); ctx.arc(x + 20 * s, y - 70 * s, 8 * s, 0, 7); ctx.fill(); }
  });
  // HQ marker at Chicago
  const hs = (t < 6.6 ? 0 : 1) * (1 - E.in(p(t, 10.2, 10.6)));
  if (hs > 0.01) { ctx.save(); ctx.translate(HQCITY.x, HQCITY.y - 30); ctx.scale(hs, hs); cut(ctx, () => rr(ctx, -30, -30, 60, 60, 12), C.ink, { sb: 10, sy: 5, edgeW: 7, lw: 0 }); K.arches(ctx, 0, 2, 0.5, C.yellow, 12); ctx.restore();
    tag(ctx, 'HQ', HQCITY.x, HQCITY.y - 92, { u: p(t, 6.7, 7.0) * hs, size: 30, bg: C.yellow, fg: C.ink, tape: false }); }
} };

// S4 MONEY FLOW — operators sell food (burger -> bill), royalties (coins) from all, rent (bills) from company-controlled sites
const S4 = { t0: 10.1, t1: 26.6, draw(ctx, t) {
  const hu = p(t, 10.3, 10.85);
  flat(ctx, () => rr(ctx, HQP[0] - 150 * E.out(p(t, 10.2, 10.5)), HQP[1] - 2, 300 * E.out(p(t, 10.2, 10.5)), 18, 9), C.grey, 3);
  const arrived = COINS.filter(c => t > c.t + TRAVEL).length + BILLS.filter(b => t > b.t + TRAVEL).length * 2;
  slotRise(ctx, HQP[0], HQP[1], hu, () => hq(ctx, HQP[0], HQP[1], HQP[2], { lit: 0.1 + 0.9 * arrived / (COINS.length + BILLS.length * 2) }));
  tag(ctx, 'HQ', HQP[0], HQP[1] - 700 * HQP[2], { u: p(t, 10.85, 11.15), size: 44, bg: C.yellow, fg: C.ink, rot: -0.04 });
  ROY.forEach((P, i) => dashPath(ctx, P, E.inOut(p(t, w.royalties - 0.45 + i * 0.08, w.royalties + 0.05 + i * 0.08)), 'rgba(23,23,23,0.35)', t));
  RENT.forEach(P => P && dashPath(ctx, P, E.inOut(p(t, w.many - 0.2, w.many + 0.35)), 'rgba(61,140,106,0.6)', t));
  R.forEach((r, i) => {
    const s = E.back(p(t, 10.45 + i * 0.06, 10.9 + i * 0.06), 1.6); if (s <= 0.01) return;
    ctx.save(); ctx.translate(r.x, r.sy); ctx.scale(s, s); ctx.translate(-r.x, -r.sy);
    if (r.land === 'soil') slab(ctx, r.x, r.sy, k, { w: 640, depth: 240, top: 64 });
    else slab(ctx, r.x, r.sy, k, { w: 600, depth: 70, top: 64, topCol: C.grey, soilCol: C.greyD, soilD: '#A9A193', soilDD: '#A9A193', grassLip: false });
    contact(ctx, r.x, r.sy - 29 * k + 2, 245 * k, 18 * k, 0.25); restaurant(ctx, r.x, r.sy - 29 * k, k);
    ctx.restore();
    // "operators sell the food": a burger leaves to the customer side and comes back as money
    const fu = p(t, w.sell + i * 0.12, w.sell + 1.3 + i * 0.12);
    if (fu > 0 && fu < 1) { const go = E.out(clamp(fu * 2.2)), back = E.inOut(clamp((fu - 0.55) / 0.45)), bx = r.x - 140 - go * 120 + back * 200, by = r.sy - 60 - Math.sin(go * Math.PI) * 30 - back * 20;
      burgerMoney(ctx, bx, by, 0.16 * (1 - back * 0.6), clamp((fu - 0.3) * 4)); }
  });
  for (const c of COINS) { const u = (t - c.t) / TRAVEL; if (u <= 0 || u >= 1) continue; trail(ctx, 3, u, (uu, g) => { const q = bez(ROY[c.i], E.inOut(uu)); coin(ctx, q[0], q[1], 17 * (1 + Math.sin(u * Math.PI) * 0.3), (t - c.t) * 4, { flat: g > 0 }); }); }
  for (const b of BILLS) { const u = (t - b.t) / TRAVEL; if (u <= 0 || u >= 1) continue; trail(ctx, 2, u, uu => { const q = bez(RENT[b.i], E.inOut(uu)); bill(ctx, q[0], q[1], 0.6 * (1 + Math.sin(u * Math.PI) * 0.25), Math.sin((t - b.t) * 6) * 0.35); }, 0.03); }
  tag(ctx, 'ROYALTIES', 20, -345, { u: p(t, w.royalties, w.royalties + 0.4), size: 42, bg: C.ink, rot: -0.03 });
  tag(ctx, 'RENT', 20, 420, { u: p(t, w.rent - 0.05, w.rent + 0.35), size: 42, bg: C.billD, rot: 0.03 });
} };

// S5 THE NUMBERS — push into HQ, world goes soft (background blur), revenue stacks + figures stay sharp
function maskLine(ctx, text, x, y, size, u, o = {}) { // word slides up inside its own mask
  if (u <= 0) return; ctx.save(); ctx.font = `${size}px ${o.font || F.black}`; ctx.textAlign = 'center'; const h = size * 1.15;
  ctx.beginPath(); ctx.rect(0, y - size * 0.95, W, h); ctx.clip(); ctx.fillStyle = o.col || C.ink; ctx.fillText(text, x, y + (1 - E.out5(u)) * h); ctx.restore();
}
function numbers(ctx, t) {
  const out = E.inOut(p(t, 25.95, 26.35)), dy = -out * 900; if (out >= 1) return;
  ctx.save(); ctx.translate(0, dy); ctx.globalAlpha = 1 - out * 0.6;
  // stacks (bottom-anchored), proportional to 2025 rents ($10,442M) vs royalties ($6,018M)
  const base = 1205, unit = 44, nR = 12, nY = Math.round(12 * 6018 / 10442);
  for (let i = 0; i < nR; i++) { const u = E.back(p(t, w.franchise + i * 0.13, w.franchise + 0.3 + i * 0.13), 2); if (u <= 0) continue;
    ctx.save(); ctx.translate(330 + (hash(i) - 0.5) * 16, base - 30 - i * unit - (1 - u) * 60); ctx.rotate((hash(i + 9) - 0.5) * 0.08); ctx.globalAlpha *= clamp(u * 3); bill(ctx, 0, 0, 2.2, 0); ctx.restore(); }
  for (let i = 0; i < nY; i++) { const u = E.back(p(t, w.royalties2 + i * 0.1, w.royalties2 + 0.28 + i * 0.1), 2); if (u <= 0) continue;
    ctx.save(); ctx.globalAlpha *= clamp(u * 3); for (let j = -1; j <= 1; j++) coin(ctx, 690 + j * 62 + (hash(i * 3 + j) - 0.5) * 8, base - 24 - i * unit - (1 - u) * 60, 30, 0.02, { flat: j !== 0 }); ctx.restore(); }
  // figures
  tag(ctx, '2025', 210, 250, { u: p(t, w.y2025, w.y2025 + 0.35), size: 44, bg: C.red, rot: -0.05 });
  maskLine(ctx, 'FRANCHISE RENTAL REVENUE', 510, 545, 38, p(t, w.franchise, w.franchise + 0.5), { font: F.xb, col: '#3D3D3D' });
  maskLine(ctx, 'ABOUT', 510, 352, 54, p(t, w.about - 0.05, w.about + 0.35));
  const n = Math.round(10 * E.out(p(t, w.ten - 0.05, w.billion))), nu = p(t, w.ten - 0.08, w.ten + 0.3);
  if (nu > 0) { ctx.save(); ctx.font = `132px ${F.black}`; ctx.textAlign = 'center'; const tx = `$${n} BILLION`;
    ctx.beginPath(); ctx.rect(0, 360, W, 150); ctx.clip(); ctx.fillStyle = C.ink; ctx.fillText(tx, 510, 488 + (1 - E.out5(nu)) * 150);
    ctx.fillStyle = C.yellow; ctx.fillRect(510 - 330 * E.inOut(p(t, w.billion, w.billion + 0.4)), 500, 660 * E.inOut(p(t, w.billion, w.billion + 0.4)), 10); ctx.restore(); }
  maskLine(ctx, 'ROYALTIES', 690, 800, 36, p(t, w.royalties2, w.royalties2 + 0.45), { font: F.xb, col: '#3D3D3D' });
  maskLine(ctx, 'BILLIONS MORE', 690, 866, 64, p(t, w.billions - 0.05, w.billions + 0.4), { col: C.redD });
  const fn = p(t, w.billions + 0.6, w.billions + 1.0);
  if (fn > 0) { ctx.save(); ctx.globalAlpha *= fn; ctx.font = `26px ${F.xb}`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(23,23,23,0.7)'; ctx.fillText("Revenue, not profit · Source: McDonald's 2025 Form 10-K", 510, 1262); ctx.restore(); }
  ctx.restore();
}

// S6 THE TWIST — one restaurant, exploded into layers: brand (McDonald's), building (operator), land (property)
const S6 = { t0: 26.0, t1: T, draw(ctx, t) {
  const g = TW.sy - 29, ex = E.back(p(t, 27.7, 28.4), 1.3) * (1 - E.inOut(p(t, 31.15, 31.5))), lift = 140 * ex;
  const em = E.inOut(p(t, 27.75, 28.4)) * (1 - E.inOut(p(t, 31.3, 31.85)));
  const d = t > 31.5 ? 1 - spring(t - 31.5, 2.6, 6) : 0;
  slab(ctx, TW.x, TW.sy, 1, { w: 640, depth: 300, top: 64, plot: p(t, 28.1, 28.8) * (1 - p(t, 31.1, 31.4)) });
  if (ex > 0.02) { ctx.save(); ctx.globalAlpha = clamp(ex); ctx.setLineDash([6, 10]); ctx.strokeStyle = 'rgba(23,23,23,0.4)'; ctx.lineWidth = 3;
    for (const gx of [-212, 212]) { ctx.beginPath(); ctx.moveTo(gx, g); ctx.lineTo(gx, g - lift); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-170, g - lift - 300); ctx.lineTo(-170, TW.sy - 760); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
  contact(ctx, TW.x, g + 2, 250 * (1 - ex * 0.25), 18, 0.25 * (1 - ex * 0.5));
  restaurant(ctx, TW.x, g, 1, { lift, sy: 1 - d * 0.14, sx: 1 + d * 0.08, glow: t > 31.85 && t < 33 ? Math.exp(-(t - 31.85) * 2) + Math.max(0, Math.sin((t - w.golden) * 6)) * p(t, w.golden - 0.1, w.golden) : 0 });
  if (em > 0.01) { const x = lerp(176, -170, em), y = lerp(g - 440, TW.sy - 840, em) - lift * (1 - em), s = lerp(0.6, 1.5, em);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); cut(ctx, () => rr(ctx, -62, -58, 124, 116, 22), C.red, { sb: 22, sy: 12 }); K.arches(ctx, 0, 4, 1, C.yellow, 13); ctx.restore(); }
  if (t < 31.6) {
    const f = 1 - p(t, 31.1, 31.35);
    tag(ctx, "McDONALD'S", 130, TW.sy - 850, { u: p(t, 28.3, 28.65) * f, size: 46, bg: C.yellow, fg: C.ink, rot: -0.03 });
    tag(ctx, 'PROPERTY', 250, TW.sy + 120, { u: p(t, w.earn, w.earn + 0.35) * f, size: 46, bg: C.ink, rot: 0.03 });
    tag(ctx, 'OWNED OR LEASED', 250, TW.sy + 196, { u: p(t, w.earn + 0.25, w.earn + 0.6) * f, size: 28, bg: C.cream, fg: C.ink, tape: false, font: F.xb });
    tag(ctx, 'OPERATOR', -280, g - lift - 120, { u: p(t, w.restaurant, w.restaurant + 0.35) * f, size: 46, bg: C.green, rot: -0.04 });
    // the operator's payments: royalty up to the brand, rent down to the property
    for (let i = 0; i < 2; i++) { const u = p(t, w.operate + 0.1 + i * 0.35, w.operate + 0.95 + i * 0.35); if (u <= 0 || u >= 1) continue;
      const P = i ? [[60, g - lift - 120], [200, g - lift + 40], [240, TW.sy - 40], [180, TW.sy - 20]] : [[-60, g - lift - 260], [-120, g - lift - 420], [-160, TW.sy - 760], [-170, TW.sy - 800]];
      trail(ctx, 3, u, (uu, gg) => { const q = bez(P, E.inOut(uu)); coin(ctx, q[0], q[1], 22, (t - w.operate) * 5, { flat: gg > 0 }); }); }
  }
  // S7: the burger returns in front of everything; the business assembles behind it
  if (t > 32.35) {
    const fall = p(t, 32.42, 32.9), land = 32.9, dd = t > land ? 1 - spring(t - land, 2.4, 5.5) : 0, by = TW.sy + 150;
    const y = lerp(by - 1300, by, fall * fall);
    contact(ctx, 0, by + 6, 260 * (0.35 + 0.65 * fall * fall), 22, 0.32 * (0.3 + 0.7 * fall * fall));
    if (t < land) for (let gg = 4; gg >= 1; gg--) { ctx.save(); ctx.globalAlpha = 0.13; const f2 = clamp(fall - gg * 0.07); burgerMoney(ctx, 0, lerp(by - 1300, by, f2 * f2), 1.0, 0, { sx: 0.9, sy: 1.14 }); ctx.restore(); }
    burgerMoney(ctx, 0, y, 1.0, 0, t < land ? { sx: 0.9, sy: 1.14 } : { sx: 1 + dd * 0.22, sy: 1 - dd * 0.28 });
    puff(ctx, -230, by + 4, p(t, land, land + 0.65), -1); puff(ctx, 230, by + 4, p(t, land, land + 0.65), 1);
    // HQ + small money flows behind (assemble during the pull-back)
    const hu = p(t, 34.95, 35.5), hx = 560, hy = TW.sy;
    if (hu > 0) { slotRise(ctx, hx, hy, hu, () => hq(ctx, hx, hy, 0.6, { lit: 0.6 + 0.4 * p(t, 35.5, 38) })); flat(ctx, () => rr(ctx, hx - 100, hy - 2, 200, 14, 7), C.grey, 3); }
    const P = [[200, TW.sy - 260], [320, TW.sy - 420], [440, TW.sy - 380], [hx - 70, TW.sy - 300]];
    dashPath(ctx, P, E.inOut(p(t, 35.3, 35.8)), 'rgba(23,23,23,0.3)', t);
    if (t > 35.8) for (let i = 0; i < 3; i++) { const ph = ((t - 35.8 - i * 0.7) % 2.1) / 1.1; if (t - 35.8 - i * 0.7 < 0 || ph >= 1) continue; const q = bez(P, E.inOut(ph)); coin(ctx, q[0], q[1], 15, t * 4); }
    if (t > 36.2) for (let i = 0; i < 5; i++) { const ph = (t - 36.2 - i * 0.43) % 2.2, u = ph / 1.1; if (ph > 0 && u < 1) sparkle(ctx, [-330, 300, -250, 330, 120][i], TW.sy - [420, 560, 180, 60, 640][i], 12 * Math.sin(u * Math.PI)); }
  }
} };

function title(ctx, t) { // ending headline: mask slide + red paper strip wipe
  const t0 = w.business - 0.1; if (t < t0) return;
  maskLine(ctx, 'MORE THAN', A[0], 318, 100, p(t, t0, t0 + 0.45));
  const u2 = E.inOut(p(t, t0 + 0.25, t0 + 0.6)), u3 = p(t, t0 + 0.4, t0 + 0.85), sw = 640, sh = 150, x0 = A[0] - sw / 2, y0 = 352;
  if (u2 <= 0) return;
  ctx.save(); ctx.translate(A[0], y0 + sh / 2); ctx.rotate(-0.025); ctx.translate(-A[0], -(y0 + sh / 2));
  cut(ctx, () => rr(ctx, x0, y0, sw * u2, sh, 8), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 });
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, sw * u2, sh); ctx.clip(); ctx.font = `126px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF';
  ctx.fillText('BURGERS', A[0], y0 + 122 + (1 - E.out5(u3)) * 150); ctx.restore();
  ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.save(); ctx.translate(x0 + 10, y0 + 6); ctx.rotate(-0.7); ctx.fillRect(-34, -12, 68, 24); ctx.restore();
  ctx.restore();
}
function counter95(ctx, t) { // S3 headline figure
  const u = p(t, w.ninety - 0.1, w.ninety + 0.3), out = E.inOut(p(t, 9.95, 10.3)); if (u <= 0 || out >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, -out * 60);
  const n = Math.round(95 * E.out(p(t, w.ninety - 0.05, w.ninety + 0.7)));
  ctx.font = `150px ${F.black}`; ctx.textAlign = 'center'; ctx.beginPath(); ctx.rect(0, 250, W, 180); ctx.clip();
  ctx.fillStyle = C.ink; ctx.fillText(`~${n}%`, A[0], 395 + (1 - E.out5(u)) * 170); ctx.restore();
  ctx.save(); ctx.globalAlpha = 1 - out; maskLine(ctx, 'RUN BY FRANCHISEES', A[0], 470, 42, p(t, w.franchisees - 0.05, w.franchisees + 0.4), { font: F.xb, col: C.greenD }); ctx.restore();
}

const SCENES = [S1, S2, S3, S4, S6];
const ep = {
  T, cam, background,
  world(ctx, t, c) { for (const s of SCENES) if (t >= s.t0 && t < s.t1) s.draw(ctx, t, c); },
  worldBlur: t => 9 * E.inOut(p(t, 18.0, 18.6)) * (1 - E.inOut(p(t, 25.95, 26.3))),
  overlay(ctx, t) { counter95(ctx, t); if (t > 17.9 && t < 26.4) numbers(ctx, t); title(ctx, t); },
  fg: [ // foreground parallax only where it explains a camera move
    { t0: 0, t1: 1.0, tr: 0, x: 150, y: 1500, k: 'fries', s: 1.5, rot: -0.22, par: 1.7, blur: 7, in: [-1, 0.6] },
    { t0: 0, t1: 1.0, tr: 0, x: 935, y: 300, k: 'coin', s: 2.6, rot: 0.3, par: 1.9, blur: 10, in: [1, -0.5] },
    { t0: 3.1, t1: 6.0, tr: 4.8, x: 95, y: 390, k: 'receipt', s: 1.2, rot: -0.45, par: 1.8, blur: 8 },
    { t0: 6.6, t1: 10.2, tr: 6.8, x: 110, y: 560, k: 'cloud', s: 0.95, rot: 0, par: 1.35, blur: 1.5, a: 0.95 },
    { t0: 6.6, t1: 10.2, tr: 6.8, x: 880, y: 1150, k: 'cloud', s: 0.7, rot: 0, par: 1.5, blur: 3, a: 0.9 },
    { t0: 35.0, t1: 99, tr: 37.5, x: 90, y: 1250, k: 'fries', s: 1.4, rot: 0.18, par: 1.45, blur: 8 },
  ],
  subs: EN.subtitleGroups(V, Object.keys(ST), { max: 5, replace: [[/ninety-five percent/i, '95%'], [/ten billion dollars/i, '$10 billion'], [/2025,/, '2025,']] }),
  subStyle: { y: 1385, size: 62, maxW: 800, highlight: ['money', 'burgers', '95%', 'franchisees', 'royalties', 'rent', '$10', 'billion', 'billions', 'twist', 'business'] },
  vo: Object.entries(ST),
  music: { b0: 0.38, breakAt: 26.4, back: 32.4, hit: 34.4, end: T },
  cues() {
    const c = [['fall', 0.0, 0.6], ['thump', 0.38, 1], ['zoom', 0.42, 0.8], ['puff', 0.42]];
    for (let i = 0; i < 3; i++) c.push(['paper', w.money - 0.1 + i * 0.12]);
    c.push(['rise', 2.1], ['coins', 3.0], ['whoosh', 3.05, 0.7], ['tag', 3.3], ['tag', 3.45], ['rise', 3.85], ['tag', 4.4], ['scratch', 4.55], ['tag', 4.95]);
    c.push(['unfold', 5.9], ['scratch', 6.45], ['slam', w.ninety, 0.5]);
    PINS.forEach((x, i) => i % 2 || c.push(['tick', x.t])); c.push(['tag', w.franchisees], ['scratch', w.franchisees + 0.1]);
    c.push(['paper', 10.05], ['paper', 10.2], ['rise', 10.3], ['tag', 10.5], ['pop', w.sell], ['paper', w.sell + 0.45]);
    c.push(['scratch', w.royalties - 0.45], ['tag', w.royalties]); COINS.forEach(x => c.push(['clink', x.t + TRAVEL]));
    c.push(['scratch', w.many - 0.2]); BILLS.forEach(x => c.push(['flutter', x.t + 0.1])); c.push(['tag', w.rent]);
    c.push(['zoom', 17.62, 0.9], ['whoosh', 17.62, 0.6], ['tag', w.y2025], ['rise', w.franchise], ['paper', w.franchise + 0.6], ['paper', w.franchise + 1.2], ['kaching', w.billion + 0.1], ['coins', w.royalties2 + 0.2], ['slam', w.billions, 0.6]);
    c.push(['whoosh', 25.98, 1.0], ['rise', 27.7], ['pop', 27.85], ['scratch', 28.1], ['tag', 28.3], ['tag', w.earn], ['tag', w.restaurant], ['clink', w.operate + 0.95], ['clink', w.operate + 1.3]);
    c.push(['thump', 31.5, 0.5], ['coins', w.golden], ['fall', 32.42, 0.6], ['thump', 32.9, 1], ['puff', 32.92], ['whoosh', 34.45, 0.7], ['rise', 34.95], ['scratch', 35.3], ['tag', w.business], ['slam', w.business + 0.4, 0.6]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
