// "Your Landlord's Secret Algorithm" — episode 4, Bold Editorial Collage + 2.5D (1080x1920, 30 fps).
// One space: the street with two rival buildings -> windows become data -> two separate streams fall into one pricing server
// -> it becomes the REALPAGE card that suggests prices to the buildings -> the whole district wired to it -> lawsuit, restrictions, the wires snap
// -> back on the street: one playbook behind both buildings -> both become flat cutouts on that one card: SAME PLAYBOOK.
// v2: legal scene ~2 s shorter; new ending (two landlords -> one system recommending prices -> the tenant pays -> IS THAT REALLY COMPETITION?).
// v1 (episode.js) is kept unchanged. Usage: node episode_v2.js video out.mp4 | still t1,t2,... out.png | cues
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');
const { stamp } = require('../air_ep2/airkit');
const RK = require('./rentkit');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, tag, contact, lerpCol, sprite } = K;
const { R4, text, building, winPos, roofSign, tenant, owner, DATA_LABELS, dataChip, server, recCard, realpageCard, lawsuitDoc } = RK;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);

// ---------- voice-over (Chris) ----------
const ST = { r01: 0.25, r02: 4.3, r03: 5.9, r04: 7.4, r05: 10.6, r06: 19.2, r07: 22.7, r08: 26.0, r09: 28.4, f01: 34.6, f02: 35.9, f03: 37.5, f04: 40.5, f05: 42.6 };
const F0 = 34.3;                                                           // the legal scene ends, back on the street
const V = EN.voice(`${__dirname}/vo_v2`, ST), at = V.at, T = 46.8;
const w = { competitor: at('r01', 'competitor'), rent1: at('r01', 'rent'), two: at('r02', 'two'), buildings: at('r02', 'buildings'), different: at('r03', 'different'), owners: at('r03', 'owners'),
  compete: at('r04', 'compete'), tenants: at('r04', 'tenants'), justice: at('r05', 'justice'), landlords: at('r05', 'landlords'), fed: at('r05', 'fed'), rent: at('r05', 'rent'), vacancy: at('r05', 'vacancy'),
  data: at('r05', 'data'), same: at('r05', 'same'), software: at('r05', 'software'), realpage: at('r06', 'realpage'), used: at('r07', 'used'), recommend: at('r07', 'recommend'), prices: at('r07', 'prices'),
  alleged: at('r08', 'alleged'), weakened: at('r08', 'weakened'), sued: at('r09', 'sued'), agreed: at('r09', 'agreed'), restrictions: at('r09', 'restrictions'), uses: at('r09', 'uses'), cdata: at('r09', 'data'),
  diff: 1e9, same2: 1e9, playbook: 1e9, compete2: 1e9, not: 1e9, numbers: 1e9,                    // (v1 ending words, unused)
  fLandlords: at('f01', 'landlords'), fDiff: at('f02', 'different'), fBld: at('f02', 'buildings'), fSame: at('f03', 'same'), fSoft: at('f03', 'software'), fRec: at('f03', 'recommending'), fPrices: at('f03', 'prices'),
  fYou: at('f04', 'and'), fPaying: at('f04', 'paying'), fWould: at('f05', 'would'), fYOU: at('f05', 'you'), fComp: at('f05', 'competition') };

// ---------- world layout ----------
const GY = 300, BA = { x: -250, y: GY, style: 'A', side: 1, seed: 1 }, BB = { x: 250, y: GY, style: 'B', side: -1, seed: 5 };
const HUB = 1800, FIN = 8000, CUT = 1e9;                 // the pricing server / RealPage card sits at (0, HUB)
const TILT = t => E.inOut(p(t, 9.5, 10.6)) * (1 - E.inOut(p(t, F0 - 0.6, F0 - 0.1)));
const LEAN = t => { const a = Math.sin(clamp(p(t, w.tenants - 0.1, 10.0)) * Math.PI) * 0.09, b = t > w.compete2 - 0.1 && t < CUT ? Math.sin(p(t, w.compete2 - 0.1, w.compete2 + 1.4) * Math.PI * 2) * 0.07 : 0; return a + b; };
// row of four buildings born behind the RealPage card, plus the district rows
const ROW = [['A', -420, 1], ['C', -140, 9], ['D', 140, 3], ['B', 420, 5]].map(([s, x, seed], i) => ({ x, y: HUB + 170, s: 0.7, style: s, side: x < 0 ? 1 : -1, seed, t: 20.85 + i * 0.1 }));
const BACK = [-1050, -750, -450, -150, 150, 450, 750, 1050].map((x, i) => ({ x, y: HUB - 430, s: 0.48, style: 'ABCDEABC'[i], side: x < 0 ? 1 : -1, seed: i * 3, t: 26.25 + Math.abs(x) / 3000 }));
const MIDX = [-860, 860].map((x, i) => ({ x, y: HUB + 170, s: 0.7, style: i ? 'E' : 'C', side: x < 0 ? 1 : -1, seed: 11 + i, t: 26.35 }));
const FRONT = [-920, -460, 0, 460, 920].map((x, i) => ({ x, y: HUB + 930, s: 0.8, style: 'DBAEC'[i], side: x < 0 ? 1 : x > 0 ? -1 : 1, seed: 20 + i, t: 26.45 + Math.abs(x) / 3000 }));
const DISTRICT = [...BACK, ...ROW, ...MIDX, ...FRONT];

// ---------- data streams: windows fly out as data chips, two lanes fall, then bend into one server ----------
const SPD = 430, GATE = { '-1': 14.6, '1': 15.1 };
const lanePts = g => [[g * 250, 380], [g * 250, 1250], [g * 205, 1450], [g * 100, HUB - 290], [g * 60, HUB - 150]];
const LANE = {}; for (const g of [-1, 1]) { const P = lanePts(g), L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); LANE[g] = { P, L }; }
function lanePos(g, s) { const { P, L } = LANE[g]; if (s >= L[L.length - 1]) return P[P.length - 1]; let i = 1; while (L[i] < s) i++; const u = (s - L[i - 1]) / (L[i] - L[i - 1]); return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]; }
const LTOT = LANE[1].L[4], STRAIGHT = LANE[1].L[1];
const CARDS = []; for (const g of [-1, 1]) for (let k = 0; ; k++) { const ts = 9.9 + (g > 0 ? 0.41 : 0) + k * 0.42; if (ts > 17.4) break;
  CARDS.push({ g, k, ts, label: DATA_LABELS[(k + (g > 0 ? 1 : 0)) % 3], bend: ts + STRAIGHT / SPD >= GATE[g], arrive: ts + LTOT / SPD, win: k < 4 ? [6, 9, 13, 18][k] + (g > 0 ? 1 : 0) : -1 }); }
const HERO = CARDS.find(c => c.g === -1 && c.bend); HERO.label = 'RENT';                // the card the camera follows
const ON1 = HERO.arrive, ON2 = CARDS.filter(c => c.g === 1 && c.bend)[0].arrive;
function cardState(c, t) { // -> {x, y, s, a} or null
  if (c.win >= 0 && t < c.ts) { const u = p(t, c.ts - 0.7, c.ts); if (u <= 0) return null; const b = c.g < 0 ? BA : BB, wp = winPos({ ...b, tilt: TILT(t) }, c.win), e = E.inOut(u);
    return { x: lerp(wp[0], c.g * 250, e), y: lerp(wp[1], 380, e) - Math.sin(u * Math.PI) * 120, s: lerp(0.16, 0.62, e), a: 1 }; }
  const s = (t - c.ts) * SPD; if (s < 0) return null;
  if (!c.bend) { if (s > STRAIGHT + 260) return null; const y = 380 + s; return { x: c.g * 250, y, s: 0.62, a: 1 - p(s, STRAIGHT, STRAIGHT + 260) }; }
  if (s >= LTOT) return null; const [x, y] = lanePos(c.g, s); return { x, y, s: lerp(0.62, 0.4, p(s, LTOT - 300, LTOT)), a: 1 };
}

// ---------- camera ----------
const KEYS = [
  { t: 0, x: -250, y: -110, z: 1.85 }, { t: 1.05, x: -235, y: -105, z: 1.95 }, { t: 1.95, x: 0, y: -60, z: 1.0, e: 'inOut5' }, { t: 3.3, x: 0, y: -80, z: 1.07 },         // S1: one building -> two
  { t: 4.15, x: 0, y: -165, z: 7.5, e: 'in' }, { t: 4.1501, x: 0, y: -150, z: 3.0 }, { t: 5.0, x: 0, y: -60, z: 1.0, e: 'out5' }, { t: 7.3, x: 0, y: -50, z: 1.03 },        // punch into RENT, out on the street
  { t: 8.3, x: 0, y: -20, z: 1.08 }, { t: 9.5, x: 0, y: -10, z: 1.06 }, { t: 10.8, x: 0, y: 380, z: 0.9, e: 'inOut' }, { t: 13.3, x: 0, y: 900, z: 0.96 },              // rise: buildings from above, streams below
  { t: 16.3, x: 0, y: HUB - 120, z: 1.5 }, { t: 17.2, x: 0, y: HUB - 70, z: 1.42 }, { t: 18.3, x: 0, y: HUB - 60, z: 0.95, e: 'inOut' }, { t: 20.55, x: 0, y: HUB - 60, z: 1.1 }, // inside the server
  { t: 21.5, x: 20, y: HUB - 170, z: 0.92, e: 'out5' }, { t: 25.8, x: 20, y: HUB - 150, z: 0.97 }, { t: 26.75, x: 0, y: HUB + 170, z: 0.42, e: 'inOut5' }, { t: F0 - 0.5, x: 0, y: HUB + 150, z: 0.45 }, // RealPage; the district
  { t: F0 + 0.3, x: 0, y: -60, z: 1.0, e: 'inOut5' }, { t: w.fSame - 0.1, x: 0, y: -75, z: 1.04 },                                       // back to the street: two landlords
  { t: w.fPrices + 0.2, x: 0, y: -330, z: 0.78, e: 'inOut' }, { t: w.fYou - 0.15, x: 0, y: -320, z: 0.8 },                                // the one system above them
  { t: w.fPaying + 0.25, x: -10, y: 290, z: 1.9, e: 'inOut5' }, { t: w.fWould - 0.05, x: -5, y: 270, z: 2.0 },                              // close on the tenant: the wallet
  { t: w.fComp + 0.15, x: 0, y: -400, z: 0.8, e: 'out5' }, { t: T, x: 0, y: -400, z: 0.83 },                                                // fast pull back: the question
];
const base = EN.camera(KEYS, { breath: t => (t > w.fComp ? 0.5 : 1), shakes: [[1.55, 5], [w.realpage, 9], [w.sued, 8], [w.fComp + 0.05, 7]] });
const cam = t => { const c = base(t), k = E.inOut(p(t, 13.3, 13.9)) * (1 - E.inOut(p(t, HERO.arrive - 0.05, HERO.arrive + 0.45))); // follow the hero data chip
  if (k > 0) { const st = cardState(HERO, Math.min(t, HERO.arrive - 0.01)) || { x: 60, y: HUB - 150 }; c.x = lerp(c.x, st.x + 40, k); c.y = lerp(c.y, st.y + 120, k); c.z = Math.exp(lerp(Math.log(c.z), Math.log(1.45), k)); }
  return c; };

function background(ctx) { ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); }

// ---------- environment (with depth: far layers drift slower than the hero plane) ----------
function layer(ctx, c, f, draw) { ctx.save(); ctx.translate(c.x * (1 - f), c.y * (1 - f)); draw(); ctx.restore(); }
function street(ctx, t, c, o = {}) {
  layer(ctx, c, 0.45, () => { // far skyline
    for (let i = 0; i < 16; i++) { const x = -1500 + i * 190, h = 260 + hash(i * 5) * 380; ctx.fillStyle = i % 3 ? '#E4DCCB' : '#DCD3C0'; ctx.fillRect(x, 120 - h, 160, h + 60);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (let r = 0; r < h / 60 - 1; r++) for (let q = 0; q < 3; q++) if (hash(i * 31 + r * 7 + q) > 0.5) ctx.fillRect(x + 22 + q * 44, 150 - h + r * 60, 22, 26); }
    for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(-1300 + hash(i * 3) * 2600, -800 + hash(i * 9) * 600); ctx.rotate(-0.2 + hash(i) * 0.15); ctx.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.22)'][i % 3]; ctx.fillRect(-160, -24, 320, 48); ctx.restore(); }
  });
  layer(ctx, c, 0.8, () => { for (const x of [-620, 620]) { flat(ctx, () => rr(ctx, x - 8, GY - 330, 16, 330, 6), '#6B6B6B'); flat(ctx, () => { ctx.beginPath(); ctx.arc(x, GY - 340, 26, 0, 7); }, C.yellow, 3); }   // street lamps
    for (const x of [-560, 560]) { flat(ctx, () => rr(ctx, x - 10, GY - 150, 20, 150, 6), '#7A5A3A'); cut(ctx, () => { ctx.beginPath(); ctx.arc(x, GY - 200, 80, 0, 7); }, C.green, { sb: 16, sy: 8, lw: 3.5 }); } });
  flat(ctx, () => rr(ctx, -1600, GY - 4, 3200, 50, 0), '#D6CDBB'); flat(ctx, () => rr(ctx, -1600, GY + 46, 3200, 230, 0), '#4A4F5E'); flat(ctx, () => rr(ctx, -1600, GY + 276, 3200, 40, 0), '#D6CDBB');
  ctx.fillStyle = '#F2E8C9'; for (let i = 0; i < 12; i++) ctx.fillRect(-1500 + i * 260, GY + 154, 140, 14);
}
function dataField(ctx, t, c) { // faint circuit layer under the street (parallax), the space the data travels through
  layer(ctx, c, 0.6, () => { ctx.strokeStyle = 'rgba(77,141,255,0.16)'; ctx.lineWidth = 6;
    for (let i = 0; i < 14; i++) { const x = -900 + i * 140; ctx.beginPath(); ctx.moveTo(x, 600); ctx.lineTo(x, 900 + hash(i) * 300); ctx.lineTo(x + (hash(i * 3) - 0.5) * 200, 1200 + hash(i * 5) * 400); ctx.lineTo(x + (hash(i * 3) - 0.5) * 200, 2300); ctx.stroke();
      ctx.fillStyle = 'rgba(77,141,255,0.25)'; ctx.beginPath(); ctx.arc(x, 900 + hash(i) * 300, 12, 0, 7); ctx.fill(); } });
}
function ground(ctx, y0, a = 1) { ctx.save(); ctx.globalAlpha = a; flat(ctx, () => rr(ctx, -2000, y0, 4000, 40, 0), '#D6CDBB'); flat(ctx, () => rr(ctx, -2000, y0 + 40, 4000, 200, 0), '#4A4F5E'); ctx.fillStyle = '#F2E8C9'; for (let i = 0; i < 16; i++) ctx.fillRect(-1900 + i * 260, y0 + 134, 140, 12); ctx.restore(); }

// ================= S1 + S2 + S6: the street =================
function sStreet(ctx, t, c) {
  street(ctx, t, c);
  if (t > F0 - 0.6) finaleBack(ctx, t);
  const tilt = TILT(t), lean = LEAN(t), out = {}; for (const cd of CARDS) if (cd.win >= 0 && t > cd.ts - 0.7) out[cd.win] = 1;
  const growB = t < 1.2 ? 0 : E.back(p(t, 1.2, 1.65), 1.6);
  const final = t > w.playbook - 0.8;
  // S6: one big recommendation card rises behind both roofs (drawn first = behind)
  const pb = E.out5(p(t, w.same2 - 0.1, w.same2 + 0.7));
  if (pb > 0 && t < CUT) { ctx.save(); ctx.translate(0, lerp(-250, -600, pb)); cut(ctx, () => rr(ctx, -470, -190, 940, 380, 26), C.yellow, { sb: 40, sy: 20, lw: 5 });
    flat(ctx, () => rr(ctx, -470, -190, 940, 92, [26, 26, 0, 0]), C.ink); text(ctx, 'RECOMMENDED PRICES', 0, -128, 50, '#FFFFFF', F.black, 'center'); text(ctx, '$$$', 0, 110, 190, C.ink, F.black, 'center'); ctx.restore();
    ctx.save(); ctx.setLineDash([18, 14]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 9; ctx.strokeStyle = C.ink; ctx.globalAlpha = p(t, w.same2 + 0.4, w.same2 + 0.8);
    for (const b of [BA, BB]) { ctx.beginPath(); ctx.moveTo(b.x * 0.55, -420); ctx.lineTo(b.x, -360); ctx.stroke(); } ctx.restore(); }
  const priceU = [p(t, 0.35, 0.6), p(t, 1.75, 2.0)].map(u => u * (1 - p(t, 3.9, 4.1)));
  const labelOn = t > w.two && t < 9.4;
  building(ctx, { ...BA, tilt, lean: lean, out, label: (labelOn && t > w.two) || (t > w.fDiff - 0.05 && t < w.fSame) ? 'BUILDING A' : null, price: t > F0 ? { text: '$$$', u: p(t, w.fPrices - 0.1, w.fPrices + 0.2), bg: C.red } : { text: '$1,500', u: priceU[0], bg: C.red } });
  building(ctx, { ...BB, tilt, lean: -lean, out, grow: growB, label: (labelOn && t > w.buildings - 0.1) || (t > w.fBld - 0.05 && t < w.fSame) ? 'BUILDING B' : null, price: t > F0 ? { text: '$$$', u: p(t, w.fPrices, w.fPrices + 0.3), bg: C.ink } : { text: '$1,500', u: priceU[1], bg: C.ink } });
  if (t > 1.2 && t < 1.8) for (let i = 0; i < 6; i++) { const u = p(t, 1.25, 1.8); ctx.save(); ctx.globalAlpha = 0.4 * (1 - u); ctx.fillStyle = '#BFB6A3'; ctx.beginPath(); ctx.arc(BB.x - 200 + i * 80, GY - 10 - u * 40, 30 + u * 40, 0, 7); ctx.fill(); ctx.restore(); }
  // the question between them, then RENT
  const q = E.back(p(t, w.competitor - 0.05, w.competitor + 0.3), 2) * (1 - p(t, w.rent1 - 0.1, w.rent1 + 0.1));
  if (q > 0) { ctx.save(); ctx.translate(0, -170); ctx.scale(q, q); ctx.rotate(Math.sin(t * 3) * 0.05); ctx.font = `330px ${F.black}`; ctx.textAlign = 'center'; ctx.lineWidth = 22; ctx.strokeStyle = R4.paper; ctx.lineJoin = 'round'; ctx.strokeText('?', 0, 110); ctx.fillStyle = C.red; ctx.fillText('?', 0, 110); ctx.restore(); }
  const rn = E.back(p(t, w.rent1 - 0.05, w.rent1 + 0.25), 1.8);
  if (rn > 0 && t < 4.15) { ctx.save(); ctx.translate(0, -160); ctx.scale(rn, rn); ctx.font = `250px ${F.black}`; ctx.textAlign = 'center'; ctx.lineWidth = 26; ctx.strokeStyle = R4.paper; ctx.lineJoin = 'round'; ctx.strokeText('RENT', 0, 88); ctx.fillStyle = C.ink; ctx.fillText('RENT', 0, 88); ctx.restore(); }
  // S2: different owners, the tenant, AVAILABLE / MOVE IN
  const ow = p(t, w.different - 0.05, w.different + 0.3) * (1 - p(t, 7.4, 7.7));
  if (ow > 0) { ctx.save(); ctx.translate(BA.x, -470); owner(ctx, 0, ow); ctx.restore(); ctx.save(); ctx.translate(BB.x, -470); owner(ctx, 1, p(t, w.owners - 0.1, w.owners + 0.2) * (1 - p(t, 7.4, 7.7))); ctx.restore();
    tag(ctx, 'OWNER 1', BA.x, -345, { u: ow, size: 30, bg: C.ink }); tag(ctx, 'OWNER 2', BB.x, -345, { u: ow, size: 30, bg: C.ink }); }
  const s2 = t > 7.4 && t < 10.0, s6 = false;
  if (s2 || s6) { const t0 = s2 ? 7.45 : 36.0, walk = p(t, t0, t0 + 0.9), x = lerp(-130, 0, E.out(walk)), a = s2 ? 1 - p(t, 9.5, 9.9) : 1;
    let look = 0; if (s2) look = t < w.compete ? 0 : t < w.tenants ? -1 : 1; else look = t < w.diff + 0.1 ? 0 : t < w.same2 ? -1 : t < w.playbook + 0.3 ? 1 : t < w.compete2 ? 0 : Math.sin((t - w.compete2) * 5) > 0 ? -1 : 1;
    const up = s6 && t > w.playbook + 0.3 && t < w.compete2 ? 1 : 0, pull = s6 && t > w.compete2 ? Math.sin((t - w.compete2) * 5) * 0.5 : 0;
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; tenant(ctx, x + pull * 40, GY + 120, 0.62, { look: lerp(0, look, 1), up, walk: walk < 1 ? walk * 9 : 0, pull }); ctx.restore(); } }
  const sgA = s2 ? p(t, w.compete - 0.05, w.compete + 0.2) * (1 - p(t, 9.4, 9.7)) : s6 ? p(t, w.compete2 - 0.2, w.compete2) : 0, sgB = s2 ? p(t, w.tenants - 0.05, w.tenants + 0.2) * (1 - p(t, 9.4, 9.7)) : s6 ? p(t, w.compete2 - 0.1, w.compete2 + 0.1) : 0;
  const bounce = t > w.compete - 0.05 ? (t - w.compete) * 1.6 : 0;
  roofSign(ctx, BA.x + lean * 640, GY - 640 - 40, 'AVAILABLE', C.red, '#FFFFFF', sgA, bounce % 1);
  roofSign(ctx, BB.x - lean * 640, GY - 640 - 40, 'MOVE IN', C.yellow, C.ink, sgB, (bounce + 0.5) % 1);
  if (t > F0 - 0.6) finaleFront(ctx, t);
  // S6 (v1): their own numbers go up into the one card
  if (t > w.not - 0.1 && t < CUT) for (let i = 0; i < 8; i++) { const g = i % 2 ? 1 : -1, u = p(t, w.not + i * 0.08, w.not + 0.55 + i * 0.08); if (u <= 0 || u >= 1) continue; const e = E.inOut(u);
    ctx.save(); ctx.translate(lerp(g * 250, g * 120, e), lerp(-200, -560, e)); ctx.scale(0.5, 0.5); cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); }, g < 0 ? C.red : R4.blue, { sb: 10, lw: 3 }); text(ctx, '$', 0, 22, 64, '#FFFFFF', F.black, 'center'); ctx.restore(); }
}

// ================= v2 ending: two landlords, one system recommending prices, the tenant pays =================
const SYS = [0, -720];                                                    // the shared system above and behind the two roofs
function finaleBack(ctx, t) {
  const u = E.out5(p(t, w.fSame - 0.15, w.fSame + 0.6)); if (u <= 0) return;
  ctx.save(); ctx.globalAlpha = p(t, w.fSoft - 0.1, w.fSoft + 0.3); ctx.setLineDash([18, 14]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 9; ctx.strokeStyle = C.ink;
  for (const b of [BA, BB]) { ctx.beginPath(); ctx.moveTo(SYS[0] + b.x * 0.5, SYS[1] + 90); ctx.lineTo(b.x, -480); ctx.stroke(); } ctx.restore();
  ctx.save(); ctx.translate(SYS[0], lerp(-260, SYS[1], u)); ctx.scale(0.8, 0.8); realpageCard(ctx, { lit: (t - w.fSoft) * 8 }); ctx.restore();
}
const BILLS = []; for (let i = 0; i < 16; i++) BILLS.push({ t: 0.05 + i * 0.13, g: i % 2 ? 1 : -1, r: (hash(i * 7) - 0.5) * 0.6, h: 260 + hash(i * 3) * 220 });
function finaleFront(ctx, t) {
  // the system RECOMMENDS a price to each owner (it does not set it): one suggestion card above each roof
  [BA, BB].forEach((b, i) => { const t0 = w.fRec + i * 0.12, u = E.inOut(p(t, t0, t0 + 0.6)); if (u <= 0) return;
    ctx.save(); ctx.translate(lerp(SYS[0], b.x, u), lerp(SYS[1] + 60, -470, u) - Math.sin(u * Math.PI) * 90 + Math.sin(t * 2 + i) * 5 * u); ctx.rotate((1 - u) * 0.5 + (i ? 0.04 : -0.04)); ctx.scale(lerp(0.25, 0.55, u), lerp(0.25, 0.55, u)); recCard(ctx); ctx.restore(); });
  // two different owners
  const ow = p(t, w.fLandlords - 0.1, w.fLandlords + 0.2) * (1 - p(t, w.fSame - 0.2, w.fSame + 0.1));
  if (ow > 0) { ctx.save(); ctx.translate(BA.x, -470); owner(ctx, 0, ow); ctx.restore(); ctx.save(); ctx.translate(BB.x, -470); owner(ctx, 1, p(t, w.fLandlords + 0.05, w.fLandlords + 0.35) * (1 - p(t, w.fSame - 0.2, w.fSame + 0.1))); ctx.restore();
    tag(ctx, 'OWNER 1', BA.x, -345, { u: ow, size: 30, bg: C.ink }); tag(ctx, 'OWNER 2', BB.x, -345, { u: ow, size: 30, bg: C.ink }); }
  // our tenant, between the two buildings
  const walk = p(t, F0 + 0.1, F0 + 1.0), x = lerp(-140, 0, E.out(walk));
  let look = 0, up = 0;
  if (t < w.fDiff) look = t > w.fLandlords ? -1 : 0; else if (t < w.fSame) look = t < w.fBld ? -1 : 1;
  else if (t < w.fPaying - 0.2) up = 1; else if (t < w.fComp) { up = 0; look = 0; } else up = E.inOut(p(t, w.fComp, w.fComp + 0.4));
  if (t > w.fSame && t < w.fYou) look = Math.sin((t - w.fSame) * 3) * 0.6;            // looking from one price to the other
  tenant(ctx, x, GY + 120, 0.62, { look, up, walk: walk < 1 ? walk * 9 : 0, sad: t > w.fPaying - 0.2 });
  // the wallet comes out; money flies to both buildings
  const wl = E.back(p(t, w.fPaying - 0.35, w.fPaying - 0.05), 1.8), op = E.out(p(t, w.fPaying - 0.1, w.fPaying + 0.15));
  if (wl > 0) { ctx.save(); ctx.translate(-28, GY + 120 - 112); ctx.rotate(-0.15); ctx.scale(0.62 * wl, 0.62 * wl);
    cut(ctx, () => rr(ctx, -60, -40, 120, 80, 12), '#5B3A29', { sb: 10, sy: 5, lw: 3.5 });
    ctx.save(); ctx.translate(0, -40); ctx.scale(1, Math.cos(op * 2.4)); flat(ctx, () => rr(ctx, -60, -60, 120, 60, 12), '#7A4E35', 3); ctx.restore();
    flat(ctx, () => rr(ctx, -50, -52, 100, 20, 4), C.bill || '#CFE9D4'); ctx.restore(); }
  const t0 = w.fPaying - 0.05;
  for (const bl of BILLS) { const u = p(t, t0 + bl.t, t0 + bl.t + 1.3); if (u <= 0 || u >= 1) continue; const e = E.inOut(u), tx = bl.g * 250, ty = GY - 70;
    const bx = lerp(-28, tx, e), by = lerp(GY + 20, ty, e) - Math.sin(u * Math.PI) * bl.h;
    ctx.save(); ctx.globalAlpha = 1 - p(u, 0.85, 1); K.bill(ctx, bx, by, lerp(0.55, 0.32, e), bl.r + u * 5 * bl.g); ctx.restore(); }
}

// ================= S3: the streams, the server =================
function sData(ctx, t, c) {
  dataField(ctx, t, c);
  for (const cd of CARDS) { const st = cardState(cd, t); if (!st || st.a <= 0) continue; const hero = cd === HERO;
    for (let g = hero ? 0 : 2; g >= 0; g--) { const s2 = g ? cardState(cd, t - g * 0.035) : st; if (!s2) continue;
      ctx.save(); ctx.globalAlpha = st.a * (g ? 0.16 : 1); ctx.translate(s2.x, s2.y); ctx.rotate(Math.sin(cd.k * 1.7 + t * 1.3) * 0.05); const sc = s2.s * (hero ? 1.12 : 1); ctx.scale(sc, sc);
      dataChip(ctx, cd.label, cd.g < 0 ? C.red : R4.blue); ctx.restore(); } }
}
function sServer(ctx, t) {
  const app = E.back(p(t, 14.3, 14.75), 1.6); if (app <= 0) return;
  const flip = p(t, w.realpage - 0.3, w.realpage), fx = Math.cos(flip * Math.PI / 2);
  if (flip >= 1) return;
  const lights = (t > ON1 ? 3 : 0) + (t > ON2 ? 5 : 0), on = Math.max(p(t, ON1, ON1 + 0.3) * 0.6, p(t, ON2, ON2 + 0.3));
  const proc = p(t, 16.9, 17.8);
  ctx.save(); ctx.translate(0, HUB); ctx.scale(app * fx * 1.05, app * 1.05);
  server(ctx, t, { on, lights, inside: proc > 0 ? x => { // inside: chips slide in, come out as one price suggestion
    for (let i = 0; i < 6; i++) { const u = clamp(proc * 1.4 - i * 0.08), y = lerp(-80, 40, u); x.save(); x.globalAlpha = 1 - p(u, 0.7, 1); x.translate(-110 + (i % 3) * 110, y); x.scale(0.28, 0.28); dataChip(x, DATA_LABELS[i % 3], i % 2 ? R4.blue : C.red); x.restore(); }
    const k = E.back(p(t, 17.4, 17.8), 2); if (k > 0) { x.save(); x.translate(0, 34); x.scale(0.4 * k, 0.4 * k); recCard(x); x.restore(); } } : null });
  ctx.restore();
}
function sOutput(ctx, t) { // pile of both colours -> big yellow arrow -> the price suggestion
  const a = 1 - p(t, w.realpage - 0.45, w.realpage - 0.2); if (a <= 0) return;
  const pile = E.back(p(t, 17.3, 17.7), 1.8), out = E.out5(p(t, 17.75, 18.2)), arr = E.inOut(p(t, 17.9, 18.6));
  ctx.save(); ctx.globalAlpha = a;
  if (pile > 0) for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(-370, HUB + 60 - i * 34); ctx.rotate((hash(i) - 0.5) * 0.2); ctx.scale(0.5 * pile, 0.5 * pile); dataChip(ctx, DATA_LABELS[i % 3], i % 2 ? R4.blue : C.red); ctx.restore(); }
  if (arr > 0) { ctx.save(); ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.strokeStyle = R4.paper; const path = () => { ctx.beginPath(); const n = 40; for (let i = 0; i <= n * arr; i++) { const u = i / n, x = lerp(-370, 330, u), y = HUB - 120 - Math.sin(u * Math.PI) * 300; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } };
    ctx.lineWidth = 48; path(); ctx.stroke(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 32; path(); ctx.stroke();
    if (arr > 0.97) { ctx.fillStyle = C.yellow; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(330 - 50, HUB - 170); ctx.lineTo(330 + 46, HUB - 150); ctx.lineTo(330 - 10, HUB - 70); ctx.closePath(); ctx.fill(); ctx.stroke(); } ctx.restore(); }
  if (out > 0) { ctx.save(); ctx.translate(lerp(150, 330, out), HUB + 40); ctx.rotate(0.05 * out); ctx.scale(lerp(0.4, 0.92, out), lerp(0.4, 0.92, out)); recCard(ctx); ctx.restore(); }
  ctx.restore();
}

// ================= S4 + S5: RealPage, the district, lawsuit, restrictions =================
const LINKS = DISTRICT.map((b, i) => ({ b, i, brk: w.restrictions + 0.75 + (i * 0.37) % 1.7 }));
function sHub(ctx, t, c) {
  ground(ctx, HUB + 170, p(t, 20.6, 21.0)); ground(ctx, HUB + 930, p(t, 26.3, 26.7));
  const rp = E.back(p(t, w.realpage, w.realpage + 0.35), 1.7) * (1 + (t > w.realpage + 0.3 ? (1 - spring(t - w.realpage - 0.3, 3, 7)) * 0.06 : 0));
  const draw = b => { const g = E.back(p(t, b.t, b.t + 0.45), 1.6); if (g > 0) { contact(ctx, b.x + 20 * b.s, b.y + 6, 200 * b.s, 16, 0.2 * g); building(ctx, { ...b, grow: g }); } };
  BACK.forEach(draw);
  // wires from every building to the system: yellow -> red ("alleged") -> snap ("restrictions")
  const wire = p(t, 26.4, 27.2), red = E.inOut(p(t, w.alleged, w.weakened + 0.6));
  if (wire > 0) for (const L of LINKS) { const b = L.b, x0 = b.x, y0 = b.y - (b.s * 640) * 0.55, x1 = 0, y1 = HUB, br = E.out(p(t, L.brk, L.brk + 0.35));
    const col = lerpCol(C.yellow, C.red, red), half = (a0, a1) => { ctx.beginPath(); ctx.moveTo(lerp(x0, x1, a0), lerp(y0, y1, a0)); ctx.lineTo(lerp(x0, x1, a1), lerp(y0, y1, a1)); ctx.stroke(); };
    ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 26; ctx.strokeStyle = 'rgba(23,23,23,0.85)';
    if (br <= 0) { half(0, wire); ctx.lineWidth = 15; ctx.strokeStyle = col; half(0, wire);
      if (wire >= 1) { const ph = ((t * 0.9 + L.i * 0.17) % 1); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(lerp(x0, x1, ph), lerp(y0, y1, ph), 13, 0, 7); ctx.fill(); } }
    else { const g = 0.5 - br * 0.32, g2 = 0.5 + br * 0.32; ctx.globalAlpha = 1 - br * 0.5; half(0, g); half(g2, 1); ctx.lineWidth = 15; ctx.strokeStyle = col; half(0, g); half(g2, 1);
      if (br < 1) { ctx.fillStyle = C.yellow; for (let k = 0; k < 6; k++) { const an = k * 1.05 + L.i, d = br * 70; ctx.beginPath(); ctx.arc(lerp(x0, x1, 0.5) + Math.cos(an) * d, lerp(y0, y1, 0.5) + Math.sin(an) * d, 9 * (1 - br), 0, 7); ctx.fill(); } } }
    ctx.restore(); }
  [...ROW, ...MIDX].forEach(draw);
  // S4: their information flows in (small chips), the card suggests prices back (cards rise above the roofs)
  if (t > w.used - 0.1 && t < 26.3) for (let i = 0; i < 12; i++) { const b = ROW[i % 4], u = ((t - w.used) * 0.8 + i / 12) % 1; if (t < w.used + (i / 12) / 0.8 - 1) continue; const e = E.inOut(u);
    ctx.save(); ctx.globalAlpha = Math.sin(u * Math.PI) * (1 - p(t, 25.9, 26.3)); ctx.translate(lerp(b.x, 0, e), lerp(b.y - 260, HUB, e)); ctx.scale(0.26, 0.26); dataChip(ctx, DATA_LABELS[i % 3], i % 2 ? R4.blue : C.red); ctx.restore(); }
  if (rp > 0) { ctx.save(); ctx.translate(0, HUB); ctx.scale(rp * (c.z < 0.6 ? 1.25 : 1), rp * (c.z < 0.6 ? 1.25 : 1)); realpageCard(ctx, { lit: t > w.used ? 4 : (t - w.realpage) * 6 }); ctx.restore(); }
  ROW.forEach((b, i) => { const t0 = w.recommend - 0.25 + i * 0.12, u = E.inOut(p(t, t0, t0 + 0.7)), a = 1 - p(t, 26.0, 26.4); if (u <= 0 || a <= 0) return;
    const x = lerp(0, b.x, u), y = lerp(HUB, b.y - 448 - 120, u) - Math.sin(u * Math.PI) * 160 + Math.sin(t * 2 + i) * 6 * u;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate((1 - u) * 0.4 - 0.04 + i * 0.03); ctx.scale(lerp(0.3, 0.62, u), lerp(0.3, 0.62, u)); recCard(ctx); ctx.restore();
    if (u >= 1) { ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([12, 10]); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(b.x, y + 55); ctx.lineTo(b.x, b.y - 448 - 20); ctx.stroke(); ctx.restore(); } });
  FRONT.forEach(draw);
}

// ================= S6 ending: both buildings become flat cutouts on the one card =================
function sFinal(ctx, t, c) {
  const k = 1 + (1 - spring(t - CUT, 2.6, 7)) * 0.08;
  layer(ctx, c, 0.55, () => { ctx.save(); ctx.translate(FIN, 0); // the shared data scheme behind the card
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(77,141,255,0.25)'; for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(Math.cos(an) * 900, -120 + Math.sin(an) * 1100); ctx.stroke();
      ctx.fillStyle = i % 2 ? 'rgba(230,57,70,0.3)' : 'rgba(77,141,255,0.3)'; ctx.beginPath(); ctx.arc(Math.cos(an) * 700, -120 + Math.sin(an) * 860, 22, 0, 7); ctx.fill(); } ctx.restore(); });
  ctx.save(); ctx.translate(FIN, -120); ctx.scale(k, k); ctx.rotate(-0.012);
  cut(ctx, () => rr(ctx, -440, -560, 880, 1000, 30), C.yellow, { sb: 44, sy: 22, lw: 5 });
  flat(ctx, () => rr(ctx, -440, -560, 880, 96, [30, 30, 0, 0]), C.ink); text(ctx, 'RECOMMENDED PRICES', 0, -496, 46, '#FFFFFF', F.black, 'center');
  ctx.restore();
  building(ctx, { x: FIN - 200, y: 300, s: 0.6, style: 'A', flat: true, seed: 1 }); building(ctx, { x: FIN + 200, y: 300, s: 0.6, style: 'B', flat: true, seed: 5 });
  const t1 = p(t, CUT + 0.25, CUT + 0.6), t2 = E.back(p(t, CUT + 0.55, CUT + 0.95), 1.8);
  if (t1 > 0) { ctx.save(); ctx.globalAlpha = clamp(t1 * 2); ctx.font = `150px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.fillText('SAME', FIN, -280 + (1 - E.out5(t1)) * 60); ctx.restore(); }
  if (t2 > 0) { ctx.save(); ctx.translate(FIN, -165); ctx.rotate(-0.03); ctx.scale(t2, t2); cut(ctx, () => rr(ctx, -385, -78, 770, 150, 12), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(ctx, 'PLAYBOOK.', 0, 48, 136, '#FFFFFF', F.black, 'center'); ctx.restore(); }
  tenant(ctx, FIN + 10, 470, 0.6, { look: 0, up: E.inOut(p(t, CUT + 0.8, CUT + 1.4)) });
}

// ---------- screen-space overlays ----------
function strip(ctx, txt, x, y, size, bg, fg, u, rot = -0.02) { if (u <= 0) return; const k = lerp(1.6, 1, E.out5(clamp(u))); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const tw = ctx.measureText(txt).width + size * 0.7; cut(ctx, () => rr(ctx, -tw / 2, -size * 0.78, tw, size * 1.12, 10), bg, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(ctx, txt, 0, size * 0.18, size, fg, F.black, 'center'); ctx.restore(); }
const FGC = sprite('fgchip', 400, 160, x => { x.translate(200, 80); dataChip(x, 'VACANCY', R4.blue); }, 10, 3.2);
const FGC2 = sprite('fgchip2', 400, 160, x => { x.translate(200, 80); dataChip(x, 'LEASES', C.red); }, 10, 3.2);
function overlay(ctx, t, c) {
  if (t > 1.9 && t < 4.1) tag(ctx, 'EXAMPLE PRICES', A[0], 1300, { u: p(t, 1.95, 2.25) * (1 - p(t, 3.8, 4.05)), size: 30, bg: '#5A5A5A' });
  if (t > 4.15 && t < 4.6) { const u = p(t, 4.15, 4.6); ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(A[0], A[1]); ctx.scale(3 + u * 6, 3 + u * 6); ctx.font = `250px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.fillText('RENT', 0, 80); ctx.restore(); }
  // attribution for the whole mechanism
  const j = p(t, w.justice - 0.2, w.justice + 0.1) * (1 - p(t, 13.6, 13.9));
  if (j > 0) { tag(ctx, 'ACCORDING TO THE', A[0], 300, { u: j, size: 34, bg: '#5A5A5A' }); tag(ctx, 'U.S. JUSTICE DEPARTMENT', A[0], 385, { u: p(t, w.justice - 0.1, w.justice + 0.2) * (1 - p(t, 13.6, 13.9)), size: 56, bg: C.ink, tape: false }); }
  // data chips rushing past the lens while we follow the hero chip (foreground layer)
  const fa = p(t, 13.5, 13.9) * (1 - p(t, HERO.arrive - 0.3, HERO.arrive));
  if (fa > 0) for (let i = 0; i < 4; i++) { const ph = ((t - 13.5) * 0.55 + i * 0.27) % 1, x = [90, 960, 140, 900][i], y = lerp(2300, -400, ph); ctx.save(); ctx.globalAlpha = fa * 0.85; ctx.translate(x, y); ctx.rotate((i - 1.5) * 0.25); ctx.scale(1.15, 1.15); ctx.drawImage(i % 2 ? FGC : FGC2, -FGC.width / 2, -FGC.height / 2); ctx.restore(); }
  // S5: lawsuit, then restrictions
  const ds = p(t, w.sued - 0.1, w.sued + 0.15) * (1 - p(t, w.restrictions - 0.35, w.restrictions - 0.1));
  if (ds > 0) { strip(ctx, 'DOJ LAWSUIT', A[0], 300, 120, C.red, '#FFFFFF', ds); }
  const doc = E.out5(p(t, w.sued + 0.2, w.sued + 0.65)) * (1 - E.in(p(t, w.restrictions - 0.45, w.restrictions - 0.1)));
  if (doc > 0) { ctx.save(); ctx.translate(A[0] + (1 - doc) * 100, 920 + (1 - doc) * 1300); ctx.rotate(0.04 - doc * 0.06); ctx.scale(0.86, 0.86); lawsuitDoc(ctx); ctx.restore(); }
  const rs = p(t, w.restrictions - 0.05, w.restrictions + 0.2) * (1 - p(t, F0 - 0.6, F0 - 0.3));
  if (rs > 0) { strip(ctx, 'RESTRICTIONS', A[0], 300, 112, C.yellow, C.ink, rs, 0.02); tag(ctx, 'SETTLEMENT · NOV 2025', A[0], 410, { u: p(t, w.restrictions + 0.3, w.restrictions + 0.6) * (1 - p(t, F0 - 0.6, F0 - 0.3)), size: 34, bg: C.ink });
    tag(ctx, "ON USING COMPETITORS' DATA", A[0], 1290, { u: p(t, w.uses - 0.1, w.uses + 0.2) * (1 - p(t, F0 - 0.6, F0 - 0.3)), size: 34, bg: C.red }); }
  const qa = p(t, w.fComp - 0.05, w.fComp + 0.25), qb = p(t, w.fComp + 0.1, w.fComp + 0.4);
  if (qa > 0) { ctx.save(); const k = lerp(1.5, 1, E.out5(qa)); ctx.translate(A[0], 225); ctx.scale(k, k); ctx.globalAlpha = clamp(qa * 3); ctx.font = `112px ${F.black}`; ctx.textAlign = 'center';
    ctx.lineWidth = 20; ctx.lineJoin = 'round'; ctx.strokeStyle = R4.paper; ctx.strokeText('IS THAT REALLY', 0, 0); ctx.fillStyle = C.ink; ctx.fillText('IS THAT REALLY', 0, 0); ctx.restore(); strip(ctx, 'COMPETITION?', A[0], 368, 120, C.red, '#FFFFFF', qb); }
  if (t > CUT && t < CUT + 0.18) { ctx.save(); ctx.globalAlpha = 1 - p(t, CUT, CUT + 0.18); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

// ---------- subtitles: phrase groups (word counts per line) ----------
const SPLIT = { r01: [6, 5], r02: [3], r03: [2], r04: [3, 3], r05: [7, 5, 3, 5], r06: [5, 1], r07: [4, 4], r08: [3, 3], r09: [3, 5, 4, 3], f01: [2], f02: [2], f03: [3, 3], f04: [5], f05: [5] };
function manualSubs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k, k + n) }); k += n; }); if (k !== ws.length) throw new Error(`subtitle split ${id}: ${k} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], end = g.words[g.words.length - 1].t1 + 0.5; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(end, nx.words[0].t0 - 0.05)) : end + 0.4; g.text = g.words.map(x => x.w).join(' '); });
  return G;
}

const ep = {
  T, cam, background, overlay,
  worldBlur: t => 7 * E.inOut(p(t, w.sued + 0.15, w.sued + 0.55)) * (1 - E.inOut(p(t, w.restrictions - 0.45, w.restrictions - 0.05))),
  world(ctx, t, c) {
    if (t < 13.6 || t > F0 - 0.6) sStreet(ctx, t, c);
    if (t > 9.2 && t < 21.0) { sData(ctx, t, c); sServer(ctx, t); sOutput(ctx, t); }
    if (t > 20.5 && t < F0 + 0.3) sHub(ctx, t, c);
    if (t >= CUT) sFinal(ctx, t, c);
  },
  fg: [
    { t0: 0, t1: 4.1, tr: 2.0, x: 990, y: 260, k: 'bill', s: 1.1, rot: 0.4, par: 1.7, blur: 9 },
    { t0: 26.1, t1: F0 - 0.5, tr: 29.5, x: 80, y: 1250, k: 'receipt', s: 1.0, rot: -0.3, par: 1.8, blur: 9 },
  ],
  subs: manualSubs(),
  subStyle: { y: 1565, size: 62, maxW: 820, highlight: ['competitor', 'realpage', 'justice', 'same', 'restrictions', 'recommend', 'paying'] },
  vo: Object.entries(ST),
  music: { b0: 0.25, street: 4.15, data: 10.6, hub: 19.0, serious: 25.8, back: F0, hit: w.fComp, end: T },
  cues() {
    const c = [['pop', 0.4], ['thump', 1.25, 0.6], ['puff', 1.3], ['pop', 1.8], ['tag', 2.0], ['pop', w.competitor], ['slam', w.rent1, 0.5], ['zoom', 3.4, 0.8], ['whoosh', 4.1, 0.9]];
    c.push(['tag', w.two], ['tag', w.buildings], ['pop', w.different], ['pop', w.owners], ['puff', 7.5], ['tag', w.compete], ['tag', w.tenants], ['tape', w.tenants + 0.4], ['tape', w.tenants + 0.75]);
    c.push(['whoosh', 9.6, 0.7], ['rise', 9.9]); CARDS.filter(x => x.win >= 0).forEach(x => c.push(['tick', x.ts - 0.5]));
    c.push(['paper', w.justice - 0.15], ['flutter', w.rent], ['flutter', w.vacancy], ['thump', 14.4, 0.5], ['whoosh', 13.4, 0.5], ['pulse', ON1], ['blip', ON1 + 0.05], ['blip', ON2], ['pulse', ON2], ['flap', 17.0], ['pop', 17.8], ['rise', 17.9]);
    c.push(['whoosh', 20.6, 0.6], ['slam', w.realpage, 0.6], ['boom', w.realpage, 0.5], ['thump', 21.3, 0.4], ['thump', 21.55, 0.4], ['pulse', w.used], ['tag', w.recommend], ['tag', w.recommend + 0.15], ['tag', w.recommend + 0.3], ['tag', w.recommend + 0.45]);
    c.push(['whoosh', 26.0, 0.8], ['puff', 26.4], ['rise', w.alleged], ['stamp', w.sued, 0.7], ['paper', w.sued + 0.25], ['whoosh', w.restrictions - 0.4, 0.5], ['stamp', w.restrictions, 0.6]);
    LINKS.forEach(L => { if (L.i % 3 === 0) c.push(['snap', L.brk]); });
    c.push(['whoosh', F0 - 0.5, 0.9], ['pop', w.fLandlords], ['pop', w.fLandlords + 0.2], ['tag', w.fDiff], ['tag', w.fBld], ['rise', w.fSame - 0.1], ['pulse', w.fSoft], ['tag', w.fRec + 0.2], ['tag', w.fRec + 0.35], ['pop', w.fPrices], ['pop', w.fPrices + 0.15]);
    c.push(['zoom', w.fYou, 0.6], ['paper', w.fPaying - 0.3], ['coins', w.fPaying + 0.05, 0.5]); for (let i = 0; i < 6; i++) c.push(['flutter', w.fPaying + 0.1 + i * 0.3]);
    c.push(['whoosh', w.fComp - 0.1, 0.8], ['slam', w.fComp + 0.05, 0.5], ['boom', w.fComp + 0.05, 0.45]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
