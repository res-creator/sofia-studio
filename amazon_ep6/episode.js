// "Why Amazon Sometimes Pays You to Keep Your Order" — episode 6 (1080x1920, 30 fps), Bold Editorial Collage + 2.5D.
// One journey, the box is the hero: it drops on the porch -> REFUND APPROVED / KEEP THE ITEM -> he lifts it, "?!" -> it hops onto
// a conveyor -> into a RETURNS truck -> the truck reaches the warehouse -> inside: INSPECTION, SORTING, RESALE? fork ->
// the warehouse blurs back, the box comes forward: $5 vs $8–$12 on a balance -> RETURN PACKAGE vs REFUND + KEEP, the return
// route collapses -> the box is back in his hands -> pull back: his small house vs a huge warehouse -> CHEAPEST RETURN CENTER.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | cues
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');
const RK = require('../rent_ep4/rentkit');
const AK = require('./amazonkit');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, tag, contact } = K;
const { R4, text } = RK;
const { box, buyer, phoneA, conveyor, truck, warehouse, interiorWall, scannerArch, pusher, valueCard, balance, HOUSE, house, sign } = AK;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);

// ---------- voice-over (Chris) ----------
const ST = { a01: 0.25, a02: 4.2, a03: 6.9, a04: 9.2, a05: 11.7, a06: 13.2, a07: 14.5, a08: 15.6, a09: 18.5, a10: 21.6, a11: 23.6, a12: 27.9, a13: 28.9, a14: 30.6 };
const V = EN.voice(`${__dirname}/vo`, ST), at = V.at, T = 35.0;
const w = { refunds: at('a01', 'refunds'), keep: at('a01', 'keep'), item: at('a01', 'item'), mistake: at('a02', 'mistake'), right: at('a02', 'right'),
  returning: at('a03', 'returning'), five: at('a03', 'five'), ship: at('a04', 'ship'), back: at('a04', 'back'), warehouse: at('a05', 'warehouse'),
  inspection: at('a06', 'inspection'), sorting: at('a07', 'sorting'), maybe: at('a08', 'maybe'), resold: at('a08', 'resold'),
  shipping: at('a09', 'shipping'), alone: at('a09', 'alone'), eight: at('a09', 'eight'), dollars: at('a09', 'dollars'), five2: at('a10', 'five'), item2: at('a10', 'item'),
  sellers: at('a11', 'sellers'), refund: at('a11', 'refund'), without: at('a11', 'without'), product: at('a11', 'product'), back2: at('a11', 'back'),
  glitch: at('a12', 'glitch'), math: at('a13', 'math'), house: at('a14', 'house'), cheapest: at('a14', 'cheapest'), center: at('a14', 'center') };

// ---------- world layout ----------
const GY = 300, BXF = -150, BUY = 170, BS = 1.05, CY = 180, BELT0 = 380, BELT1 = 1900, TX0 = 2250, TX1 = 3560, WX = 3950;
const INT = 8000, CY2 = 260, FORK = INT + 1450, FW = 900;
const PH = [-60, -430];                                                           // floating phone
const HOME_BACK = 26.9, BELT_T0 = 7.2, BELT_T1 = 10.2, BSPD = (BELT1 - 50 - 480) / (BELT_T1 - BELT_T0);
const HANDS = [BUY, GY + 140 - 150 * BS];
const truckX = t => lerp(TX0, TX1, E.inOut(p(t, 10.85, 12.15)));
const boxIn = () => w.five + 0;

// box world state: { x, y, s, rot, vis } (vis: 'world' | 'hands' | 'none')
function boxState(t) {
  if (t < 4.25) { const d = E.out(p(t, 0.0, 0.3)), b = t > 0.3 ? (1 - spring(t - 0.3, 3, 7)) : 0;
    return { x: BXF, y: lerp(-1300, GY + 80, d) - Math.abs(b) * 18 * 0, s: 1 + (t > 0.3 ? -b * 0.06 : 0), sy: 1 + (t > 0.3 ? b * 0.12 : 0), rot: lerp(-0.5, 0, d), vis: 'world', w: 300, h: 210 }; }
  if (t < 4.7) { const u = E.inOut(p(t, 4.25, 4.7)); return { x: lerp(BXF, HANDS[0], u), y: lerp(GY + 80, HANDS[1], u) - Math.sin(u * Math.PI) * 90, s: lerp(1, 0.77, u), rot: 0, vis: 'world', w: 300, h: 210 }; }
  if (t < 6.65) return { vis: 'hands' };
  if (t < BELT_T0) { const u = E.inOut(p(t, 6.65, BELT_T0)); return { x: lerp(HANDS[0], 480, u), y: lerp(HANDS[1], CY - 35, u) - Math.sin(u * Math.PI) * 160, s: lerp(0.77, 0.8, u), rot: Math.sin(u * Math.PI) * 0.25, vis: 'world', w: 300, h: 210 }; }
  if (t < BELT_T1) return { x: 480 + (t - BELT_T0) * BSPD, y: CY - 35, s: 0.8, rot: 0, vis: 'world', w: 300, h: 210 };
  if (t < 10.5) { const u = E.in(p(t, BELT_T1, 10.5)); return { x: lerp(BELT1 - 50, TX0 - 300, u), y: lerp(CY - 35, GY + 60, u), s: lerp(0.8, 0.6, u), rot: u * 0.3, vis: 'world', w: 300, h: 210, a: 1 - p(u, 0.75, 1) }; }
  if (t < 12.55) return { vis: 'none' };
  if (t < 13.0) { const u = E.inOut(p(t, 12.55, 12.95)); return { x: lerp(truckX(t) - 380, WX, u), y: lerp(GY + 40, GY - 120, u) - Math.sin(u * Math.PI) * 120, s: lerp(0.6, 0.5, u), rot: 0, vis: 'world', w: 300, h: 210, a: 1 - p(u, 0.85, 1) }; }
  if (t < HOME_BACK) { // inside the warehouse
    let x = INT - 450, y = CY2 - 35;
    x = lerp(x, INT, E.out(p(t, 13.0, 13.35))); x = lerp(x, INT + 700, E.inOut(p(t, 13.95, 14.55))); x = lerp(x, FORK, E.inOut(p(t, 14.95, 15.6)));
    const dn = E.inOut(p(t, w.resold - 0.05, w.resold + 0.55)); x = lerp(x, FORK + 520, dn); y = lerp(y, CY2 - 35 + 320, dn);
    return { x, y, s: 0.8, rot: dn > 0 && dn < 1 ? 0.06 : 0, vis: 'world', w: 300, h: 210, tag: '$5 ITEM', stamp: t > w.resold + 0.4 ? 'NOT ELIGIBLE' : null, stampU: p(t, w.resold + 0.4, w.resold + 0.6) };
  }
  return { vis: t > 30.0 ? 'none' : 'hands' };
}

// ---------- camera ----------
const KEYS = [
  { t: 0, x: 10, y: -60, z: 1.3 }, { t: 2.8, x: 0, y: -70, z: 1.25 }, { t: 3.25, x: PH[0] + 20, y: PH[1], z: 2.0, e: 'inOut5' }, { t: 3.65, x: PH[0] + 20, y: PH[1], z: 2.08 },  // S1: the message
  { t: 4.35, x: 80, y: -85, z: 1.28, e: 'inOut' }, { t: 6.5, x: 90, y: -90, z: 1.32 },                                                                                   // S2: he lifts it
  { t: 7.0, x: 600, y: -60, z: 1.1 }, { t: 10.4, x: 1980, y: -40, z: 1.08 },                                                                                            // S3: belt (follow overrides)
  { t: 10.85, x: 2080, y: -60, z: 1.0 }, { t: 12.1, x: 3500, y: -160, z: 0.82, r: -0.025, e: 'inOut' }, { t: 12.55, x: WX - 60, y: -140, z: 0.95, r: 0 },                  // the truck -> the warehouse
  { t: 12.98, x: WX, y: GY - 150, z: 3.4, e: 'in' }, { t: 12.9801, x: INT - 330, y: -60, z: 1.7 },                                                                       // through the door
  { t: 17.6, x: FORK + 420, y: CY2 + 60, z: 1.05 }, { t: 18.5, x: FORK + 380, y: CY2 + 40, z: 0.95 }, { t: 26.4, x: FORK + 300, y: CY2 + 20, z: 1.0 },
  { t: HOME_BACK + 0.2, x: 70, y: -90, z: 1.22, e: 'inOut5' }, { t: 27.9, x: 80, y: -85, z: 1.28 },                                                                    // back home
  { t: 29.35, x: 450, y: -430, z: 0.5, e: 'inOut' }, { t: 30.6, x: 455, y: -440, z: 0.52 },                                                                              // house vs warehouse
  { t: 31.2, x: 0, y: -270, z: 1.12, e: 'inOut5' }, { t: 32.45, x: 0, y: -240, z: 1.15 }, { t: 33.1, x: 0, y: -200, z: 1.32, e: 'inOut' }, { t: T, x: 0, y: -195, z: 1.36 },                                                                                    // the cheapest return center
];
const base = EN.camera(KEYS, { breath: t => (t > 33 ? 0.4 : 1), shakes: [[0.3, 14], [w.keep + 0.05, 6], [12.0, 5], [w.dollars + 0.05, 9], [w.cheapest + 0.05, 10]] });
const cam = t => { const c = base(t);
  const fb = E.inOut(p(t, 6.75, 7.3)) * (1 - E.inOut(p(t, 10.15, 10.6)));                                                    // follow the box along the belt
  if (fb > 0) { const b = boxState(Math.max(t, BELT_T0)); c.x = lerp(c.x, b.x + 140, fb); c.y = lerp(c.y, -60, fb); c.z = Math.exp(lerp(Math.log(c.z), Math.log(1.12), fb)); }
  const ft = E.inOut(p(t, 10.8, 11.1)) * (1 - E.inOut(p(t, 11.7, 12.1)));                                                    // follow the truck
  if (ft > 0) { c.x = lerp(c.x, truckX(t) - 60, ft); c.y = lerp(c.y, -90, ft); }
  const fi = E.inOut(p(t, 13.0, 13.35)) * (1 - E.inOut(p(t, 17.3, 17.7)));                                                   // follow it inside
  if (fi > 0) { const b = boxState(t); c.x = lerp(c.x, b.x + 120, fi); c.y = lerp(c.y, b.y - 200, fi); c.z = Math.exp(lerp(Math.log(c.z), Math.log(1.12), fi)); }
  return c; };

function background(ctx) { ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); }
function layer(ctx, c, f, draw) { ctx.save(); ctx.translate(c.x * (1 - f), c.y * (1 - f)); draw(); ctx.restore(); }

// ---------- outside: street with depth ----------
function outside(ctx, t, c) {
  layer(ctx, c, 0.4, () => { for (let i = 0; i < 40; i++) { const x = -1500 + i * 180, h = 240 + hash(i * 5) * 380; ctx.fillStyle = i % 3 ? '#E4DCCB' : '#DCD3C0'; ctx.fillRect(x, 140 - h, 150, h + 60);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (let r = 0; r < h / 60 - 1; r++) for (let q = 0; q < 3; q++) if (hash(i * 31 + r * 7 + q) > 0.5) ctx.fillRect(x + 20 + q * 42, 170 - h + r * 60, 20, 24); }
    for (let i = 0; i < 18; i++) { ctx.save(); ctx.translate(-1300 + hash(i * 3) * 6000, -1000 + hash(i * 9) * 800); ctx.rotate(-0.2 + hash(i) * 0.15); ctx.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.22)'][i % 3]; ctx.fillRect(-170, -26, 340, 52); ctx.restore(); } });
  layer(ctx, c, 0.75, () => { for (const x of [-700, 700, 1500, 2600, 3200]) { flat(ctx, () => rr(ctx, x - 10, GY - 150, 20, 150, 6), '#7A5A3A'); cut(ctx, () => { ctx.beginPath(); ctx.arc(x, GY - 200, 80, 0, 7); }, C.green, { sb: 16, sy: 8, lw: 3.5 }); } });
  flat(ctx, () => rr(ctx, -2400, GY - 4, 8000, 50, 0), '#D6CDBB'); flat(ctx, () => rr(ctx, -2400, GY + 46, 8000, 230, 0), '#4A4F5E'); flat(ctx, () => rr(ctx, -2400, GY + 276, 8000, 400, 0), '#D6CDBB');
  ctx.fillStyle = '#F2E8C9'; for (let i = 0; i < 32; i++) ctx.fillRect(-2300 + i * 260, GY + 154, 140, 14);
}
function fgLayer(ctx, c, t) { // foreground (closer than the hero plane, moves faster): fence posts + bushes along the street
  if (t > 12.95 && t < HOME_BACK) return;
  layer(ctx, c, 1.55, () => { for (let i = 0; i < 26; i++) { const x = -1600 + i * 330; ctx.fillStyle = 'rgba(40,44,58,0.9)'; ctx.fillRect(x, GY + 470, 22, 300);
    cut(ctx, () => { ctx.beginPath(); ctx.arc(x + 160, GY + 640, 70 + hash(i) * 30, 0, 7); }, '#1E7F75', { sb: 10, lw: 0 }); } });
}

// ---------- the world ----------
function drawBox(ctx, b, t) { if (b.vis !== 'world') return; ctx.save(); ctx.globalAlpha *= b.a ?? 1; ctx.translate(b.x, b.y); ctx.scale(b.s, b.s * (b.sy || 1)); box(ctx, { w: b.w, h: b.h, rot: b.rot, tag: t > 7.6 && t < HOME_BACK ? '$5 ITEM' : null, tagU: p(t, w.five - 0.05, w.five + 0.25), stamp: b.stamp, stampU: b.stampU }); ctx.restore(); }
const HAND_BOX = x => { x.save(); x.translate(0, 100); x.scale(0.74, 0.74); box(x, { w: 300, h: 210 }); x.restore(); };
function world(ctx, t, c) {
  const inside = t > 12.98 && t < HOME_BACK;
  if (inside) return interior(ctx, t, c);
  outside(ctx, t, c);
  const route = 1 - E.inOut(p(t, w.without - 0.1, w.without + 0.5));                    // the return route collapses (it is not drawn after the decision)
  // finale: a huge warehouse rises next to the small house
  const fwg = E.back(p(t, 28.0, 28.7), 1.3); if (fwg > 0 && t > HOME_BACK) { ctx.save(); ctx.translate(FW, GY); ctx.scale(1.05, 1.05 * fwg); warehouse(ctx, { w: 1100, h: 900 }); ctx.restore();
    if (fwg > 0.7 && t < 30.9) sign(ctx, FW, GY - 945 * 1.05 - 90, 1.75 * (1 - p(t, 30.6, 30.9)), 'EXPENSIVE RETURN', C.red, '#FFFFFF', { size: 60 }); }
  // the house + porch
  const peek = t > 32.35;
  ctx.save(); ctx.translate(0, GY); house(ctx, { door: peek ? E.out(p(t, 32.35, 32.7)) : 0, inside: peek ? x => { x.translate(-30, 85); buyer(x, 30, 0, 0.82, { arms: 'box', box: HAND_BOX, boxW: 118, up: 1, look: 0.3, mood: 'side', eyes: 1.35, tilt: 0.1 }); } : null }); ctx.restore();
  // the conveyor and the truck exist only for the return journey
  if (t < HOME_BACK) { conveyor(ctx, BELT0, BELT1, CY, t, t < BELT_T1 ? BSPD : 0, { leg: 160 }); flat(ctx, () => rr(ctx, BELT1 - 10, CY - 20, 30, 220, 6), '#5A6070', 3);
    const tx = truckX(t), door = p(t, 9.6, 9.9) * (1 - p(t, 10.5, 10.8)); ctx.save(); ctx.translate(tx, GY + 200); truck(ctx, { door, spin: t * (t > 10.85 && t < 12.15 ? 14 : 0) }); ctx.restore();
    if (t > 10.9 && t < 12.2) for (let i = 0; i < 5; i++) { const u = ((t * 2 + i / 5) % 1); ctx.save(); ctx.globalAlpha = 0.35 * (1 - u); ctx.fillStyle = '#BFB6A3'; ctx.beginPath(); ctx.arc(tx - 420 - u * 160, GY + 170 - u * 40, 20 + u * 30, 0, 7); ctx.fill(); ctx.restore(); }
    // the warehouse it drives to
    ctx.save(); ctx.translate(WX, GY); warehouse(ctx, { door: p(t, 12.3, 12.7) }); ctx.restore();
    sign(ctx, WX, GY - 640 - 70, E.back(p(t, w.warehouse - 0.15, w.warehouse + 0.2), 2) * 1.5, 'WAREHOUSE', C.ink, '#FFFFFF'); }
  // the box (its own journey) and the buyer
  const b = boxState(t); if (b.vis === 'world') drawBox(ctx, b, t);
  if (t < 9.0 || (t > HOME_BACK - 0.3 && t < 30.05)) { const o = buyerPose(t); const bx = t > 29.35 ? lerp(BUY, 10, E.inOut(p(t, 29.35, 29.95))) : BUY; ctx.save(); ctx.globalAlpha = t > 29.6 ? 1 - p(t, 29.6, 30.0) : 1; buyer(ctx, bx, GY + 140, BS, o); ctx.restore();
    if (t > w.right - 0.1 && t < 6.5) tag(ctx, '?!', BUY + 120, GY + 140 - 500, { u: p(t, w.right - 0.1, w.right + 0.15) * (1 - p(t, 6.3, 6.5)), size: 90, bg: C.red, rot: 0.08, tape: false }); }
  // the floating phone
  phone(ctx, t);
  // finale: labels and the big sign
  if (t > 28.6 && t < 30.9) sign(ctx, 0, GY - HOUSE.h - 240 - 110, 1.45 * E.back(p(t, 28.8, 29.1), 2) * (1 - p(t, 30.6, 30.9)), '$0 RETURN SHIPPING', C.ink, '#FFFFFF');
  const sg = E.back(p(t, w.cheapest - 0.12, w.cheapest + 0.25), 1.8);
  if (sg > 0) { ctx.save(); ctx.translate(0, GY - HOUSE.h - 240 - 30); ctx.scale(sg, sg); flat(ctx, () => rr(ctx, -200, -60, 20, 120, 4), '#5A6070', 3); flat(ctx, () => rr(ctx, 180, -60, 20, 120, 4), '#5A6070', 3);
    cut(ctx, () => rr(ctx, -360, -330, 720, 280, 22), C.yellow, { sb: 30, sy: 14, lw: 5 }); text(ctx, 'CHEAPEST', 0, -205, 120, C.ink, F.black, 'center', 660); ctx.save(); ctx.translate(0, -112); ctx.rotate(-0.02); flat(ctx, () => rr(ctx, -310, -44, 620, 84, 10), C.red); text(ctx, 'RETURN CENTER', 0, 20, 64, '#FFFFFF', F.black, 'center', 590); ctx.restore(); ctx.restore(); }
  fgLayer(ctx, c, t);
}
function buyerPose(t) {
  if (t < 4.25) { const k = t > w.keep - 0.05; return { arms: 'down', look: k ? -1 : -0.7, up: k ? 0 : 0.35, mood: k ? 'o' : 'neutral', eyes: k ? 1 + 0.7 * E.back(p(t, w.keep - 0.05, w.keep + 0.25), 2) : 1 }; }
  if (t < 6.65) { const q = t > w.mistake - 0.1; return { arms: 'box', box: HAND_BOX, boxW: 118, look: q ? -0.8 : 0, up: 0.1, mood: q ? 'side' : 'o', eyes: q ? 1.25 : 1.4, tilt: q ? 0.12 : 0 }; }
  if (t < 9.0) return { arms: 'down', look: 1, mood: 'neutral', scratch: t > 7.2 };
  // back home
  const m = t < w.glitch - 0.1 ? 'side' : t < w.math - 0.1 ? 'smile' : 'grin';
  return { arms: 'box', box: HAND_BOX, boxW: 118, look: t < 27.6 ? -0.8 : t < w.glitch ? 0 : -0.3, up: 0.1, mood: m, eyes: t < w.glitch ? 1.25 : 1.1, tilt: t < w.glitch ? 0.08 : 0, walk: t > 29.35 && t < 29.95 ? t * 9 : 0 };
}
function phone(ctx, t) {
  const first = t > 0.9 && t < 6.75, second = t > HOME_BACK && t < 29.35; if (!first && !second) return;
  const u = first ? E.back(p(t, 0.9, 1.2), 2) * (1 - p(t, 6.45, 6.75)) : E.back(p(t, HOME_BACK, HOME_BACK + 0.3), 2) * (1 - p(t, 29.05, 29.35));
  const flip = first ? p(t, w.right - 0.25, w.right + 0.35) : 0, fx = Math.cos(flip * Math.PI * 2);
  ctx.save(); ctx.translate(PH[0], PH[1]); ctx.rotate(-0.05); ctx.scale(0.8 * u * Math.max(0.04, Math.abs(fx)), 0.8 * u);
  if (fx < 0) { cut(ctx, () => rr(ctx, -150, -280, 300, 560, 42), '#2A2D38', { sb: 20, lw: 4 }); flat(ctx, () => { ctx.beginPath(); ctx.arc(-80, -200, 30, 0, 7); }, '#1B1D24', 3); }
  else if (first) phoneA(ctx, [{ t: 'REFUND', u: p(t, 1.1, 1.35), size: 44 }, { t: 'APPROVED', u: p(t, 1.2, 1.45), size: 44, col: '#1C8A80' },
    { t: 'KEEP THE ITEM', u: p(t, w.keep - 0.05, w.keep + 0.15), size: 40, col: '#FFFFFF', bg: C.red, k: 1 + 0.25 * E.out5(p(t, w.keep, w.item + 0.3)) }], { check: t > 1.4 });
  else phoneA(ctx, [{ t: 'REFUND', u: p(t, HOME_BACK + 0.15, HOME_BACK + 0.35), size: 44 }, { t: 'ISSUED', u: p(t, HOME_BACK + 0.2, HOME_BACK + 0.4), size: 44, col: '#1C8A80' },
    { t: 'KEEP THE ITEM', u: p(t, HOME_BACK + 0.4, HOME_BACK + 0.6), size: 40, col: '#FFFFFF', bg: C.red, k: 1.15 }], { check: true });
  ctx.restore();
}

// ---------- inside the warehouse ----------
function interior(ctx, t, c) {
  layer(ctx, c, 0.55, () => { ctx.save(); ctx.translate(INT + 700, GY - 80); interiorWall(ctx, 4200); ctx.restore(); });          // shelves far back
  flat(ctx, () => rr(ctx, INT - 2000, GY - 40, 5200, 900, 0), '#A7AFBD'); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4;
  for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.moveTo(INT - 2000 + i * 200, GY - 40); ctx.lineTo(INT - 2600 + i * 240, GY + 860); ctx.stroke(); }        // floor in perspective
  conveyor(ctx, INT - 900, FORK, CY2, t, t < 17.4 ? 300 : 0, { leg: 220, col: C.ink });
  // the fork: RESELL (up) / NOT ELIGIBLE (down)
  for (const [g, lab, col] of [[-1, 'RESELL', R4.blue], [1, 'NOT ELIGIBLE', C.red]]) { ctx.save(); ctx.translate(FORK, CY2); ctx.rotate(g * 0.55); conveyor(ctx, 0, 640, 0, t, 0, { leg: 0, col }); ctx.restore();
    sign(ctx, FORK + 700, CY2 + g * 400 - 60, 1.1 * E.back(p(t, w.maybe - 0.2 + (g > 0 ? 0.2 : 0), w.maybe + 0.15 + (g > 0 ? 0.2 : 0)), 2), lab, col, '#FFFFFF'); }
  // machines
  const b = boxState(t);
  ctx.save(); ctx.translate(INT, CY2); scannerArch(ctx, p(t, w.inspection - 0.05, w.inspection + 0.6), t); ctx.restore();
  tag(ctx, 'INSPECTION', INT, CY2 - 540, { u: p(t, w.inspection - 0.1, w.inspection + 0.15), size: 50, bg: C.ink });
  ctx.save(); ctx.translate(INT + 700, CY2); pusher(ctx, Math.sin(clamp(p(t, w.sorting - 0.1, w.sorting + 0.45)) * Math.PI) * 0.6); ctx.restore();
  tag(ctx, 'SORTING', INT + 700, CY2 - 640, { u: p(t, w.sorting - 0.1, w.sorting + 0.15), size: 50, bg: C.ink });
  tag(ctx, 'RESALE?', FORK, CY2 - 380, { u: p(t, w.maybe - 0.1, w.maybe + 0.15), size: 56, bg: C.yellow, fg: C.ink });
  drawBox(ctx, b, t);
  // stacked boxes in the foreground (closer, faster)
  layer(ctx, c, 1.5, () => { for (let i = 0; i < 14; i++) { const x = INT - 1400 + i * 420; ctx.save(); ctx.translate(x, GY + 640); ctx.scale(1.2, 1.2); box(ctx, { w: 260, h: 190 }); ctx.translate(30, -190); box(ctx, { w: 200, h: 150 }); ctx.restore(); } });
}

// ---------- screen-space: the math, the decision ----------
const MB = [510, 470];
function strip(ctx, txt, x, y, size, bg, fg, u, rot = -0.02) { if (u <= 0) return; const k = lerp(1.6, 1, E.out5(clamp(u))); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const tw = Math.min(980, ctx.measureText(txt).width + size * 0.7); cut(ctx, () => rr(ctx, -tw / 2, -size * 0.78, tw, size * 1.12, 10), bg, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(ctx, txt, 0, size * 0.18, size, fg, F.black, 'center', tw - size * 0.5); ctx.restore(); }
function overlay(ctx, t) {
  // THE MATH: the warehouse is pushed back (blur), the box comes forward onto a balance: $5 vs $8–$12
  const m = p(t, 18.25, 18.7) * (1 - p(t, 23.3, 23.65));
  if (m > 0) { ctx.save(); ctx.globalAlpha = clamp(m * 2);
    const z = E.inOut(p(t, w.five2 - 0.2, w.five2 + 0.35)), zk = lerp(1, 1.45, z), fx = 790, fy = 560;                    // zoom to $8–$12
    ctx.translate(lerp(fx, 510, z), lerp(fy, 600, z)); ctx.scale(zk, zk); ctx.translate(-fx, -fy);
    const tilt = lerp(0, 0.33, E.out(p(t, w.dollars - 0.05, w.dollars + 0.3))) * (t > w.dollars + 0.3 ? 1 + (1 - spring(t - w.dollars - 0.3, 2.6, 6)) * 0.12 : 1);
    ctx.save(); ctx.globalAlpha *= 1 - z; ctx.translate(510, 1040); ctx.scale(0.85, 0.85);
    balance(ctx, tilt, x => { const u = E.back(p(t, 18.4, 18.8), 1.8); if (u > 0) { x.save(); x.translate(0, 0); x.scale(0.62 * u, 0.62 * u); box(x, { w: 300, h: 210, tag: '$5 ITEM' }); x.restore(); } },
      x => { const u = E.back(p(t, w.eight - 0.25, w.eight + 0.1), 1.8); if (u > 0) { x.save(); x.scale(0.3 * u, 0.3 * u); truck(x, {}); x.restore(); } }); ctx.restore();
    const lu = E.back(p(t, 18.6, 18.95), 1.6), ru = E.back(p(t, w.eight - 0.15, w.eight + 0.15), 1.6);
    if (lu > 0) { ctx.save(); ctx.translate(255, 560); ctx.rotate(-0.04); ctx.scale(0.95 * lu, 0.95 * lu); valueCard(ctx, 'ITEM VALUE', '$5', C.ink); ctx.restore(); }
    if (ru > 0) { ctx.save(); ctx.translate(fx, fy); ctx.rotate(0.03); ctx.scale(0.95 * ru, 0.95 * ru); valueCard(ctx, 'RETURN SHIPPING', '$8–$12', C.red); ctx.restore(); }
    ctx.restore();
    strip(ctx, 'SHIPPING ALONE', A[0], 900, 86, C.ink, '#FFFFFF', p(t, w.five2 + 0.05, w.five2 + 0.3) * (1 - p(t, 23.3, 23.65)));
    tag(ctx, "AMAZON'S EXAMPLE FOR SELLERS", A[0], 1010, { u: p(t, w.five2 + 0.3, w.five2 + 0.55) * (1 - p(t, 23.3, 23.65)), size: 32, bg: '#5A5A5A' }); }
  // THE DECISION: RETURN PACKAGE vs REFUND + KEEP; the return route collapses
  const d = p(t, 23.45, 23.8) * (1 - p(t, w.back2 - 0.15, w.back2 + 0.15));
  if (d > 0) { ctx.save(); ctx.globalAlpha = clamp(d * 2);
    const hi = E.out(p(t, w.refund - 0.1, w.refund + 0.25)), col = E.inOut(p(t, w.without - 0.1, w.without + 0.5));
    ctx.save(); ctx.translate(510, 400); ctx.scale(0.62, 0.62); box(ctx, { w: 300, h: 210, tag: '$5 ITEM' }); ctx.restore();
    ctx.lineCap = 'round'; ctx.lineWidth = 16;
    ctx.strokeStyle = lerpRGB(C.ink, '#B9B1A3', col); ctx.globalAlpha *= 1; ctx.beginPath(); ctx.moveTo(470, 450); ctx.lineTo(lerp(270, 470, col), lerp(760, 450, col)); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 16 + hi * 10; ctx.beginPath(); ctx.moveTo(550, 450); ctx.lineTo(750, 760); ctx.stroke(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 6 + hi * 6; ctx.stroke();
    // left: the return route (truck -> warehouse) folds away
    const ls = 1 - col; if (ls > 0.02) { ctx.save(); ctx.translate(270, 900); ctx.scale(ls, ls * (1 - col * 0.3)); ctx.globalAlpha *= ls;
      cut(ctx, () => rr(ctx, -210, -150, 420, 330, 24), R4.paper, { sb: 22, sy: 10, lw: 4 }); text(ctx, 'RETURN PACKAGE', 0, -100, 36, C.ink, F.black, 'center', 380);
      ctx.save(); ctx.translate(-90, 60); ctx.scale(0.24, 0.24); truck(ctx, {}); ctx.restore(); text(ctx, '→', 10, 50, 60, C.ink, F.black, 'center'); ctx.save(); ctx.translate(110, 110); ctx.scale(0.17, 0.17); warehouse(ctx, {}); ctx.restore(); ctx.restore(); }
    // right: refund + keep (highlighted)
    ctx.save(); ctx.translate(750, 900); const k = 1 + hi * 0.12; ctx.scale(k, k);
    if (hi > 0) { ctx.save(); ctx.globalAlpha *= 0.5 * hi; ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(0, 10, 250, 0, 7); ctx.fill(); ctx.restore(); }
    cut(ctx, () => rr(ctx, -200, -150, 400, 330, 24), hi > 0.5 ? C.yellow : R4.paper, { sb: 22, sy: 10, lw: 4 }); text(ctx, 'REFUND + KEEP', 0, -100, 40, C.ink, F.black, 'center', 360);
    ctx.save(); ctx.translate(0, 150); ctx.scale(0.3, 0.3); house(ctx, {}); ctx.restore(); ctx.restore();
    ctx.restore(); }
  if (t > 12.98 && t < 13.12) { ctx.save(); ctx.globalAlpha = 1 - p(t, 12.98, 13.12); ctx.fillStyle = '#1B1D24'; ctx.fillRect(0, 0, W, H); ctx.restore(); }   // through the dark doorway
}
function lerpRGB(a, b, u) { return K.lerpCol(a, b, clamp(u)); }

// ---------- subtitles ----------
const SPLIT = { a01: [5, 7], a02: [5], a03: [5], a04: [7], a05: [4], a06: [2], a07: [2], a08: [7], a09: [4, 6], a10: [4], a11: [6, 6], a12: [4], a13: [2], a14: [3, 5] };
function manualSubs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k, k + n) }); k += n; }); if (k !== ws.length) throw new Error(`subtitle split ${id}: ${k} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], end = g.words[g.words.length - 1].t1 + 0.5; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(end, nx.words[0].t0 - 0.05)) : Math.min(end + 0.4, T - 0.6);
    g.text = g.words.map(x => x.w).join(' ').replace(/five-dollar/i, '$5').replace(/eight to twelve dollars/i, '$8–$12').replace(/\.\.\./, '…'); });
  return G;
}

const ep = {
  T, cam, background, overlay, world,
  worldBlur: t => 8 * E.inOut(p(t, 18.2, 18.7)) * (1 - E.inOut(p(t, w.back2 - 0.2, w.back2 + 0.1))),
  fg: [],
  subs: manualSubs(),
  subStyle: { y: 1565, size: 62, maxW: 820, highlight: ['keep', '$5', '$8', 'cheapest', 'math', 'refund'] },
  vo: Object.entries(ST),
  music: { b0: 0.3, journey: 6.6, warehouse: 12.9, math: 18.3, decision: 23.4, home: HOME_BACK, hit: w.cheapest, end: T },
  cues() {
    const c = [['whoosh', 0.0, 0.6], ['thump', 0.3, 0.9], ['paper', 0.32], ['puff', 0.33], ['kaching', 1.15, 0.5], ['pop', 1.25], ['tag', w.keep], ['pop', w.item - 0.1], ['zoom', 2.9, 0.6]];
    c.push(['whoosh', 3.7, 0.5], ['paper', 4.3], ['thump', 4.7, 0.3], ['whoosh', w.right - 0.2, 0.4], ['pop', w.right + 0.05], ['tick', 5.9], ['tick', 6.1]);
    c.push(['whoosh', 6.7, 0.5], ['thump', BELT_T0, 0.4], ['rumble', 7.3, 0.4], ['rumble', 8.2, 0.35], ['rumble', 9.1, 0.35], ['tag', w.five]);
    c.push(['flap', 9.6], ['thump', 10.45, 0.5], ['slam', 10.75, 0.4], ['rev', 10.85], ['rev', 11.6], ['whoosh', 11.0, 0.6], ['brake', 12.05], ['tag', w.warehouse], ['flap', 12.3], ['whoosh', 12.7, 0.7]);
    c.push(['rumble', 13.05, 0.4], ['blip', w.inspection], ['scratch', w.inspection + 0.05], ['blip', w.inspection + 0.45], ['thump', w.sorting + 0.05, 0.4], ['tag', w.sorting], ['tag', w.maybe], ['whoosh', w.resold, 0.4], ['stamp', w.resold + 0.45, 0.4]);
    c.push(['whoosh', 18.2, 0.6], ['pop', 18.55], ['pop', 18.8], ['tag', w.eight - 0.1], ['slam', w.dollars + 0.05, 0.6], ['boom', w.dollars + 0.05, 0.35], ['zoom', w.five2 - 0.2, 0.5], ['tag', w.five2 + 0.1]);
    c.push(['whoosh', 23.4, 0.5], ['pop', w.refund], ['rise', w.refund - 0.1], ['cut', w.without], ['puff', w.without + 0.2], ['whoosh', w.back2 - 0.2, 0.9], ['kaching', HOME_BACK + 0.2, 0.5], ['pop', HOME_BACK + 0.45]);
    c.push(['pop', w.glitch], ['tick', w.math], ['tag', w.math + 0.05], ['whoosh', 28.2, 0.6], ['thump', 28.3, 0.6], ['tag', 28.85], ['whoosh', 30.65, 0.8], ['slam', w.cheapest, 0.6], ['pop', w.cheapest + 0.05], ['flap', 32.35], ['pop', 32.75], ['tick', 33.1]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
