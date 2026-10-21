// "Why Her Medical Bill Doubled" — v2 (v1 = episode.js, kept). Same props, engine and style; new order:
// ESTIMATE ~$3,000 / FINAL BILL ~$6,000 slam -> her face -> same doctor, same procedure -> "?" -> (through the "?") the doctor's office
// as a full location -> the call (close-up, phone beside her face) -> the office slides to the surgery center -> two big buildings,
// a hospital system rises behind them, two connections -> SAME OWNER -> the giant hand finale -> close-up reaction.
// Usage: node episode_v2.js video out.mp4 | still t1,t2,... out.png | cues
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');
const RK = require('../rent_ep4/rentkit');
const MK = require('./medkit');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, tag, contact } = K;
const { R4, text } = RK;
const { place, officeWindows, heroine, doctor, billDoc, procCard, giantHand, ownLine } = MK;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);

// ---------- voice-over (Chris): n01-n05 new, the rest reused from v1 ----------
const ST = { n01: 0.35, n02: 2.1, m07: 4.9, n03: 7.4, n04: 8.9, n05: 13.4, m06: 16.4, m09: 19.3, m10: 20.5, m11: 23.4, m13: 26.8, m14: 29.1 };
const V = EN.voice(`${__dirname}/vo_v2`, ST), at = V.at, T = 35.0, RING = 12.8;
const w = { est: at('n01', 'estimate'), six: at('n02', 'six'), bill: at('n02', 'bill'), same1: at('m07', 'same'), sdoc: at('m07', 'doctor'), same2: at('m07', 'same', 1), sproc: at('m07', 'procedure'),
  changed: at('n03', 'changed'), found: at('n04', 'found'), doctor: at('n04', 'doctor'), office: at('n04', 'office'),
  day: at('n05', 'day'), appointment: at('n05', 'appointment'), oc: at('n05', 'office'), called: at('n05', 'called'),
  moving: at('m06', 'moving'), surgery: at('m06', 'surgery'), center: at('m06', 'center'), twist: at('m09', 'twist'),
  hospital: at('m10', 'hospital'), bought: at('m10', 'bought'), owned: at('m11', 'owned'), too: at('m11', 'too'),
  chose: at('m13', 'chose'), cheaper: at('m13', 'cheaper'), office2: at('m13', 'office'), hosp3: at('m14', 'hospital'), chose2: at('m14', 'chose'), room: at('m14', 'room') };
const DIVE = w.changed + 0.75, END_TXT = w.room + 0.6;

// ---------- world layout ----------
const GY = 300, X0 = 2700, OX0 = -330, CX = 380, DOCK = -80, HQX = -250;
const OFF = { w: 340, h: 300, s: 1.25 }, CEN = { w: 440, h: 620, s: 1.1 }, HQB = { w: 760, h: 1100, s: 1.15 };
const OFF_TOP = 300 * 1.25, CEN_TOP = 620 * 1.1;
const officeX = t => { let x = lerp(OX0, DOCK, E.inOut(p(t, w.moving - 0.1, w.center + 0.25)));
  x = lerp(x, -440, E.inOut(p(t, 26.2, 26.9))); x = lerp(x, CX, E.inOut(p(t, w.chose2 + 0.05, w.room - 0.05))); return x; };
const officeLift = t => Math.sin(clamp(p(t, w.chose2 + 0.05, w.room - 0.05)) * Math.PI) * 330;
const heroX = t => t < DIVE ? X0 : t < 19 ? lerp(-560, -430, E.inOut(p(t, w.moving, w.center + 0.6))) : lerp(-40, -190, E.inOut(p(t, w.cheaper - 0.2, w.office2 + 0.3)));
const heroWalk = t => { const u = t < 19 ? p(t, w.moving, w.center + 0.6) : p(t, w.cheaper - 0.2, w.office2 + 0.3); return u > 0 && u < 1 ? t * 9 : 0; };
const FACE = t => [heroX(t), GY + 120 - 350];

// ---------- camera ----------
const KEYS = [
  { t: 0, x: X0, y: -340, z: 1.06 }, { t: 1.9, x: X0, y: -350, z: 1.0 }, { t: 3.4, x: X0 + 10, y: -360, z: 0.98 },            // the two cards
  { t: 3.85, x: X0, y: -170, z: 0.86, e: 'inOut' }, { t: 4.55, x: X0, y: 95, z: 2.3, e: 'inOut5' },                             // cards spread; push to her face
  { t: 5.35, x: X0 + 50, y: -70, z: 1.0, e: 'inOut5' }, { t: 7.3, x: X0 + 40, y: -150, z: 0.96 },                                // same doctor, same procedure
  { t: 7.75, x: X0, y: -540, z: 1.25, e: 'inOut' }, { t: DIVE, x: X0, y: -575, z: 9, e: 'in' },                                 // through the "?"
  { t: DIVE + 0.0001, x: OX0 - 40, y: -320, z: 2.6 }, { t: DIVE + 0.85, x: OX0 - 60, y: -160, z: 0.86, e: 'out5' },             // the office: wide
  { t: w.office - 0.3, x: OX0 - 120, y: -50, z: 1.25 }, { t: 12.4, x: -455, y: -60, z: 1.35, e: 'inOut' },                         // medium: her + the doctor
  { t: RING + 0.5, x: -500, y: 60, z: 2.05, e: 'inOut5' }, { t: 15.9, x: -505, y: 55, z: 2.2 },                                  // the call (close-up)
  { t: 17.0, x: -40, y: -220, z: 0.82, e: 'inOut5' }, { t: 18.8, x: 120, y: -200, z: 0.92 },                                      // the office slides over
  { t: 19.9, x: 150, y: -170, z: 1.0, e: 'inOut' }, { t: w.hospital, x: 140, y: -190, z: 1.02 },                                  // two big buildings
  { t: w.bought + 0.3, x: 60, y: -560, z: 0.6, r: 0.02, e: 'inOut5' }, { t: w.too + 0.1, x: 70, y: -560, z: 0.62, r: 0.0 }, { t: 26.2, x: 60, y: -540, z: 0.66 }, // rise: one owner
  { t: 27.0, x: -80, y: -220, z: 0.76, e: 'inOut5' }, { t: w.hosp3 - 0.1, x: -95, y: -230, z: 0.79 }, { t: w.chose2 + 0.3, x: -20, y: -330, z: 0.74, e: 'inOut' },
  { t: w.room + 0.15, x: 0, y: -300, z: 0.76 }, { t: w.room + 0.8, x: -235, y: 120, z: 1.85, e: 'inOut5' }, { t: T, x: -235, y: 115, z: 1.92 },            // close-up reaction
];
const cam = EN.camera(KEYS, { breath: t => (t > END_TXT ? 0.4 : 1), shakes: [[0.08, 8], [2.05, 14], [RING, 6], [w.too + 0.2, 7], [w.room, 10]] });

function background(ctx) { ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); }
function layer(ctx, c, f, draw) { ctx.save(); ctx.translate(c.x * (1 - f), c.y * (1 - f)); draw(); ctx.restore(); }
function street(ctx, t, c) {
  layer(ctx, c, 0.45, () => {
    for (let i = 0; i < 30; i++) { const x = -1900 + i * 190, h = 260 + hash(i * 5) * 420; ctx.fillStyle = i % 3 ? '#E4DCCB' : '#DCD3C0'; ctx.fillRect(x, 120 - h, 160, h + 60);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (let r = 0; r < h / 60 - 1; r++) for (let q = 0; q < 3; q++) if (hash(i * 31 + r * 7 + q) > 0.5) ctx.fillRect(x + 22 + q * 44, 150 - h + r * 60, 22, 26); }
    for (let i = 0; i < 16; i++) { ctx.save(); ctx.translate(-1700 + hash(i * 3) * 5600, -1100 + hash(i * 9) * 900); ctx.rotate(-0.2 + hash(i) * 0.15); ctx.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.22)'][i % 3]; ctx.fillRect(-170, -26, 340, 52); ctx.restore(); }
  });
  layer(ctx, c, 0.8, () => { for (const x of [-900, 860]) { flat(ctx, () => rr(ctx, x - 10, GY - 150, 20, 150, 6), '#7A5A3A'); cut(ctx, () => { ctx.beginPath(); ctx.arc(x, GY - 200, 80, 0, 7); }, C.green, { sb: 16, sy: 8, lw: 3.5 }); } });
  flat(ctx, () => rr(ctx, -2400, GY - 4, 6000, 50, 0), '#D6CDBB'); flat(ctx, () => rr(ctx, -2400, GY + 46, 6000, 230, 0), '#4A4F5E'); flat(ctx, () => rr(ctx, -2400, GY + 276, 6000, 260, 0), '#D6CDBB');
  ctx.fillStyle = '#F2E8C9'; for (let i = 0; i < 24; i++) ctx.fillRect(-2300 + i * 260, GY + 154, 140, 14);
}
const BILL3 = x => billDoc(x, { head: 'ESTIMATE', amount: '~$3,000', where: "IN THE DOCTOR'S OFFICE", col: R4.blue });
const BILL6 = x => billDoc(x, { head: 'FINAL BILL', amount: '~$6,000', where: 'SURGERY CENTER', col: C.red, amtCol: C.red });

// ---------- her: expression by moment ----------
function herPose(t) {
  let look = 0, up = 0, eyes = 1, mood = 'smile', phone = 0, ring = 0, ex = 0, blush = false;
  if (t < DIVE) { up = t < 5.0 ? 1 : 0.3; eyes = t < w.bill ? 1 : 1 + 0.9 * E.back(p(t, w.bill, w.bill + 0.3), 2); mood = t > w.bill ? 'o' : 'flat'; if (t > 5.2) { eyes = 1.3; mood = 'frown'; look = t > w.sdoc ? 0.8 : 0; } }
  else if (t < RING) { look = t < w.office ? 0.6 : 0.2; mood = 'smile'; ex = p(t, w.office + 0.3, w.office + 1.2); blush = t > w.office + 0.4; }
  else if (t < w.moving - 0.2) { phone = 1; ring = t < w.day - 0.1 ? 1 : 0; look = 0.5;
    if (t > w.appointment) { eyes = 1 + 0.6 * E.back(p(t, w.appointment, w.appointment + 0.3), 2); mood = 'o'; }
    if (t > w.called) { eyes = 1.25; mood = 'frown'; look = lerp(0.5, -0.4, p(t, w.called, w.called + 0.3)); } }
  else if (t < 19.5) { look = 1; mood = 'frown'; eyes = 1.2; }
  else { look = t < w.chose ? 0 : t < w.hosp3 ? -0.8 : 0; up = t > w.hosp3 && t < w.room + 0.5 ? 1 : 0.2; mood = t > w.room ? 'frown' : t > w.hosp3 ? 'flat' : 'smile'; eyes = t > w.room ? 1.75 : t > w.hosp3 ? 1.25 : 1; }
  return { look, up, eyes, mood, phone, ring, exhale: ex, blush, t };
}

// ---------- the world ----------
function world(ctx, t, c) {
  street(ctx, t, c);
  if (t < DIVE + 0.1) return opening(ctx, t);
  // the hospital system rises behind the office (the twist)
  const hq = E.back(p(t, w.hospital - 0.1, w.hospital + 0.55), 1.3); let hqTop = 0;
  if (hq > 0) { ctx.save(); ctx.globalAlpha = t > 26.4 ? lerp(1, 0.5, p(t, 26.4, 27.0)) : 1; hqTop = place(ctx, { ...HQB, x: HQX, y: GY - 80, style: 'HQ', side: 1, seed: 4, grow: hq }, 'HOSPITAL SYSTEM', C.red, '#FFFFFF'); ctx.restore(); }
  // the surgery center
  const cg = E.back(p(t, w.moving - 0.2, w.moving + 0.35), 1.5);
  if (cg > 0) { contact(ctx, CX + 20, GY + 6, 260, 18, 0.22); place(ctx, { ...CEN, x: CX, y: GY, style: 'SC', side: -1, seed: 7, grow: cg }, t > w.surgery - 0.1 ? 'SURGERY CENTER' : null, '#FFFFFF', C.ink); }
  if (hq > 0.9 && t < w.room + 0.5) { const y0 = GY - 80 - hqTop * 0.42; ctx.save(); ctx.globalAlpha = 1 - p(t, w.room, w.room + 0.5);
    ownLine(ctx, HQX - 120, y0, officeX(t) + 30, GY - OFF_TOP - officeLift(t) - 10, E.inOut(p(t, w.bought - 0.1, w.bought + 0.5)), t);
    ownLine(ctx, HQX + 300, y0 - 120, CX - 40, GY - CEN_TOP * 0.6, E.inOut(p(t, w.owned - 0.1, w.owned + 0.5)), t); ctx.restore(); }
  // the doctor's office (full location: bench + plants), lifted by the giant hand at the end
  const ox = officeX(t), lift = officeLift(t);
  contact(ctx, ox + 10, GY + 6, 250 * (1 - lift / 600), 18, 0.22);
  if (t < 19) { for (const [dx, h] of [[-250, 110], [250, 90]]) { flat(ctx, () => rr(ctx, ox + dx - 30, GY - 60, 60, 60, 8), '#B5653A', 3); cut(ctx, () => { ctx.beginPath(); ctx.arc(ox + dx, GY - 60 - h * 0.5, h * 0.5, 0, 7); }, C.green, { sb: 10, lw: 3 }); }
    flat(ctx, () => rr(ctx, ox - 330, GY - 40, 70, 12, 4), '#7A5A3A', 3); }
  place(ctx, { ...OFF, x: ox, y: GY - lift, style: 'OF', side: 1, seed: 3, lean: Math.sin(clamp(p(t, w.moving - 0.1, w.center + 0.25)) * Math.PI) * -0.06 }, "DOCTOR'S OFFICE", C.ink, '#FFFFFF', officeWindows);
  if (t > 28.5) { const d = E.out5(p(t, w.hosp3 - 0.2, w.chose2)), g = E.inOut(p(t, w.chose2 - 0.15, w.chose2 + 0.05)) * (1 - p(t, w.room, w.room + 0.2)), upq = E.in(p(t, w.room + 0.05, w.room + 0.6));
    ctx.save(); ctx.translate(ox + 10, GY - OFF_TOP - 70 - lift - lerp(900, 0, d) - upq * 2600); giantHand(ctx, g); ctx.restore(); }
  // the doctor at his office door; the ~$3,000 estimate above the office
  if (t < 19.2) { const u = E.back(p(t, w.doctor - 0.1, w.doctor + 0.25), 2); if (u > 0) doctor(ctx, ox + 165, GY + 50, 0.8 * u, { clip: true }); }
  const e3 = E.back(p(t, w.office - 0.15, w.office + 0.2), 1.6) * (1 - p(t, 16.2, 16.6));
  if (e3 > 0) { ctx.save(); ctx.translate(OX0 - 40, -500); ctx.rotate(-0.03); ctx.scale(0.7 * e3, 0.7 * e3); BILL3(ctx); ctx.restore(); }
  // her
  const vis = t < 19.0 ? 1 - p(t, 18.6, 19.0) : p(t, 26.4, 26.8);
  if (vis > 0) { const o = herPose(t); o.walk = heroWalk(t);
    if (t > 26.4) o.hold = x => { const f = p(t, w.room - 0.12, w.room + 0.12), k = Math.abs(Math.cos(f * Math.PI)); x.save(); x.scale(0.42 * Math.max(0.04, k), 0.42); (f < 0.5 ? BILL3 : BILL6)(x); x.restore(); };
    ctx.save(); ctx.globalAlpha = vis; heroine(ctx, heroX(t), GY + 120, 1.0, o); ctx.restore();
    if (t > w.office + 0.4 && t < RING) tag(ctx, 'PHEW', heroX(t) + 140, GY - 300, { u: p(t, w.office + 0.4, w.office + 0.65) * (1 - p(t, RING - 0.3, RING)), size: 44, bg: C.yellow, fg: C.ink, rot: 0.08 }); }
}
function opening(ctx, t) {
  // ESTIMATE ~$3,000 slams in; FINAL BILL ~$6,000 slams on top; they spread apart around her
  const a = E.out5(p(t, 0.0, 0.25)), b = E.out5(p(t, 1.95, 2.18)), sp = E.inOut(p(t, 3.45, 4.05)), q = p(t, w.changed - 0.25, w.changed + 0.1);
  const kb = t > 2.18 ? 1 + (1 - spring(t - 2.18, 2.8, 7)) * 0.08 : 1;
  ctx.save(); ctx.translate(lerp(X0 - 900, lerp(X0 - 20, X0 - 300, sp), a), lerp(-1100, lerp(-380, -630, sp), a)); ctx.rotate(lerp(-0.4, lerp(-0.02, -0.08, sp), a)); const s1 = lerp(1.32, 0.78, sp); ctx.scale(s1, s1); BILL3(ctx); ctx.restore();
  if (b > 0) { ctx.save(); ctx.translate(lerp(X0 + 1000, lerp(X0 + 25, X0 + 300, sp), b), lerp(-1200, lerp(-350, -610, sp), b)); ctx.rotate(lerp(0.5, lerp(0.035, 0.07, sp), b)); const s2 = lerp(1.38, 0.82, sp) * kb; ctx.scale(s2, s2); BILL6(ctx); ctx.restore(); }
  // her (between the cards), the doctor and his procedure card (they stay the same)
  { const o = herPose(t); heroine(ctx, X0, GY + 120, 1.0, o); }
  const du = E.back(p(t, w.sdoc - 0.15, w.sdoc + 0.2), 2); if (du > 0) doctor(ctx, X0 + 300, GY + 50, 0.8 * du, { clip: false });
  tag(ctx, 'SAME DOCTOR', X0 + 300, GY - 270, { u: p(t, w.sdoc - 0.05, w.sdoc + 0.2) * (1 - p(t, 7.3, 7.6)), size: 40, bg: C.ink });
  const pu = E.back(p(t, w.sproc - 0.15, w.sproc + 0.2), 2); if (pu > 0) { ctx.save(); ctx.translate(X0 - 230, GY - 120); ctx.rotate(-0.06); ctx.scale(0.7 * pu, 0.7 * pu); procCard(ctx); ctx.restore();
    tag(ctx, 'SAME PROCEDURE', X0 - 200, GY - 270, { u: p(t, w.sproc - 0.05, w.sproc + 0.2) * (1 - p(t, 7.3, 7.6)), size: 40, bg: C.red }); }
  // "What changed?": a big question mark between the cards — the camera goes through it
  if (q > 0) { const k = E.back(q, 2); ctx.save(); ctx.translate(X0, -575); ctx.scale(k, k); ctx.rotate(Math.sin(t * 3) * 0.04); ctx.font = `360px ${F.black}`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    ctx.lineWidth = 24; ctx.strokeStyle = R4.paper; ctx.strokeText('?', 0, 125); ctx.fillStyle = C.red; ctx.fillText('?', 0, 125); ctx.restore(); }
}

// ---------- screen space ----------
function strip(ctx, txt, x, y, size, bg, fg, u, rot = -0.02) { if (u <= 0) return; const k = lerp(1.6, 1, E.out5(clamp(u))); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const tw = Math.min(980, ctx.measureText(txt).width + size * 0.7); cut(ctx, () => rr(ctx, -tw / 2, -size * 0.78, tw, size * 1.12, 10), bg, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(ctx, txt, 0, size * 0.18, size, fg, F.black, 'center', tw - size * 0.5); ctx.restore(); }
function overlay(ctx, t) {
  if (t > DIVE && t < DIVE + 0.35) { const u = p(t, DIVE, DIVE + 0.35); ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(A[0], A[1]); ctx.scale(4 + u * 8, 4 + u * 8); ctx.font = `360px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = C.red; ctx.fillText('?', 0, 125); ctx.restore(); }
  const so = p(t, w.too + 0.05, w.too + 0.35) * (1 - p(t, 26.3, 26.6));
  if (so > 0) strip(ctx, 'SAME OWNER.', A[0], 330, 140, C.red, '#FFFFFF', so);
  const f1 = p(t, END_TXT, END_TXT + 0.25), f2 = p(t, END_TXT + 0.3, END_TXT + 0.55);
  if (f1 > 0) { ctx.save(); const k = lerp(1.5, 1, E.out5(f1)); ctx.translate(A[0], 250); ctx.scale(k, k); ctx.globalAlpha = clamp(f1 * 3); ctx.lineWidth = 20; ctx.lineJoin = 'round'; ctx.strokeStyle = R4.paper;
    ctx.font = `104px ${F.black}`; ctx.textAlign = 'center'; ctx.strokeText('SAME PROCEDURE.', 0, 0); text(ctx, 'SAME PROCEDURE.', 0, 0, 104, C.ink, F.black, 'center', 960); ctx.restore(); strip(ctx, 'DIFFERENT PRICE.', A[0], 395, 112, C.red, '#FFFFFF', f2); }
}

// ---------- subtitles ----------
const SPLIT = { n01: [3], n02: [3], m07: [2, 2], n03: [2], n04: [4, 5, 3], n05: [6, 3], m06: [5, 4], m09: [3], m10: [5, 3], m11: [3, 4], m13: [6], m14: [7] };
function manualSubs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k, k + n) }); k += n; }); if (k !== ws.length) throw new Error(`subtitle split ${id}: ${k} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], end = g.words[g.words.length - 1].t1 + 0.5; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(end, nx.words[0].t0 - 0.05)) : Math.min(end + 0.2, END_TXT);
    g.text = g.words.map(x => x.w).join(' ').replace(/three-thousand-dollar/i, '$3,000').replace(/six-thousand-dollar/i, '$6,000'); });
  return G;
}

const ep = {
  T, cam, background, overlay, world,
  fg: [
    { t0: DIVE + 0.2, t1: 12.6, tr: 10.5, x: 990, y: 300, k: 'receipt', s: 1.1, rot: 0.4, par: 1.7, blur: 9 },
    { t0: 20.6, t1: 26.3, tr: 23, x: 70, y: 1240, k: 'bill', s: 1.1, rot: -0.3, par: 1.8, blur: 9 },
  ],
  subs: manualSubs(),
  subStyle: { y: 1565, size: 62, maxW: 820, highlight: ['$3000', '$6000', 'twist', 'cheaper', 'pricier', 'owned', 'changed'] },
  vo: Object.entries(ST),
  music: { b0: 0.3, relief: w.office, ring: RING, tense: w.called, twist: w.twist - 0.4, finale: 26.6, hit: w.room, end: T },
  cues() {
    const c = [['slam', 0.08, 0.6], ['paper', 0.1], ['whoosh', 0.0, 0.5], ['whoosh', 1.9, 0.6], ['slam', 2.05, 0.8], ['stamp', 2.08, 0.7], ['boom', 2.08, 0.4], ['whoosh', 3.45, 0.5], ['zoom', 4.0, 0.6], ['pop', w.bill + 0.05]];
    c.push(['pop', w.sdoc], ['tag', w.sdoc + 0.1], ['pop', w.sproc], ['tag', w.sproc + 0.1], ['pop', w.changed - 0.2], ['zoom', DIVE - 0.45, 0.8], ['whoosh', DIVE, 0.7]);
    c.push(['pop', w.doctor], ['tag', w.office], ['puff', w.office + 0.3], ['rise', w.office + 0.3], ['pop', w.office + 0.45]);
    c.push(['ring', RING], ['ring', RING + 1.0], ['zoom', RING + 0.1, 0.5], ['blip', w.appointment], ['tick', w.called]);
    c.push(['pop', w.moving - 0.1], ['thump', w.moving + 0.2, 0.5], ['rumble', w.moving + 0.1, 0.6], ['whoosh', w.moving + 0.3, 0.6], ['tag', w.surgery], ['thump', w.center + 0.25, 0.5]);
    c.push(['whoosh', w.twist - 0.3, 0.6], ['rise', w.hospital - 0.2], ['thump', w.hospital + 0.3, 0.6], ['whoosh', w.hospital + 0.4, 0.6], ['pulse', w.bought], ['pulse', w.owned], ['boom', w.too + 0.1, 0.5], ['slam', w.too + 0.1, 0.5]);
    c.push(['whoosh', 26.3, 0.6], ['tag', w.chose], ['whoosh', w.hosp3 - 0.2, 0.8], ['thump', w.chose2, 0.4], ['whoosh', w.chose2 + 0.2, 0.6], ['slam', w.room, 0.7], ['flap', w.room - 0.1], ['zoom', w.room + 0.2, 0.5], ['stamp', END_TXT + 0.3, 0.6]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
