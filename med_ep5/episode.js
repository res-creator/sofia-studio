// "Why Her Medical Bill Doubled" — episode 5, Bold Editorial Collage + 2.5D (1080x1920, 30 fps). Source: KFF Health News, Sept 8, 2026.
// One street, one story: the $18,000 estimate (camera travels across its digits) -> the hospital slides away, a small doctor's office
// slides in, the bill folds into ~$3,000 -> relief -> the phone rings -> the office itself slides over to a surgery center ->
// same doctor walks in, same procedure card moves -> FINAL BILL ~$6,000 -> camera rises: one hospital system owns both ->
// she steps toward the cheap office; a giant hand moves it to the pricier room; ~$3,000 flips to ~$6,000.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | cues
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');
const RK = require('../rent_ep4/rentkit');
const MK = require('./medkit');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, tag, contact } = K;
const { R4, text } = RK;
const { sign, place, officeWindows, heroine, doctor, billDoc, folded, procCard, phone, giantHand, ownLine } = MK;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);

// ---------- voice-over (Chris) ----------
const ST = { m01: 0.3, m02: 4.7, m03: 8.2, m04: 10.4, m05: 11.9, m06: 14.6, m07: 17.7, m08: 20.7, m09: 25.0, m10: 26.6, m11: 29.5, m12: 33.4, m13: 36.4, m14: 38.9 };
const V = EN.voice(`${__dirname}/vo`, ST), at = V.at, T = 43.8, RING = 9.6;
const w = { eighteen: at('m01', 'eighteen'), procedure: at('m01', 'procedure'), another: at('m02', 'another'), doctor: at('m02', 'doctor'), three: at('m02', 'three'),
  problem: at('m03', 'problem'), solved: at('m03', 'solved'), right: at('m03', 'right'), not: at('m04', 'not'), quite: at('m04', 'quite'),
  day: at('m05', 'day'), appointment: at('m05', 'appointment'), office: at('m05', 'office'), called: at('m05', 'called'),
  moving: at('m06', 'moving'), surgery: at('m06', 'surgery'), center: at('m06', 'center'), same1: at('m07', 'same'), sdoc: at('m07', 'doctor'), same2: at('m07', 'same', 1), sproc: at('m07', 'procedure'),
  final: at('m08', 'final'), bill: at('m08', 'bill'), around: at('m08', 'around'), six: at('m08', 'six'), twist: at('m09', 'twist'),
  hospital: at('m10', 'hospital'), bought: at('m10', 'bought'), practice: at('m10', 'practice'), owned: at('m11', 'owned'), surgery2: at('m11', 'surgery'), too: at('m11', 'too'),
  where: at('m12', 'where'), costs: at('m12', 'costs'), chose: at('m13', 'chose'), cheaper: at('m13', 'cheaper'), office2: at('m13', 'office'),
  hosp3: at('m14', 'hospital'), chose2: at('m14', 'chose'), pricier: at('m14', 'pricier'), room: at('m14', 'room') };
const END_TXT = w.room + 0.35;

// ---------- world layout (one street, ground at GY) ----------
const GY = 300, HX = -330, CX = 330, HQX = 145;
const OFF = { h: 300, w: 340, s: 1 }, CEN = { w: 440, h: 620, s: 0.95 }, HOS = { w: 700, h: 820, s: 1 }, HQB = { w: 760, h: 1300, s: 1 };
const B1 = [HX, -620];                                    // where the floating bills hang
const officeX = t => { let x = lerp(1500, HX, E.back(p(t, w.another - 0.15, w.doctor + 0.35), 1.3));
  x = lerp(x, -40, E.inOut(p(t, w.moving - 0.1, w.center + 0.25)));                       // it slides over to the surgery center
  x = lerp(x, -380, E.inOut(p(t, 32.9, 33.6)));                                             // finale: back to its own spot
  x = lerp(x, CX, E.inOut(p(t, w.chose2 + 0.05, w.room - 0.05)));                           // the giant hand moves it into the pricier room
  return x; };
const officeLift = t => Math.sin(clamp(p(t, w.chose2 + 0.05, w.room - 0.05)) * Math.PI) * 330;
const heroX = t => { let x = -560; x = lerp(x, -330, E.inOut(p(t, w.surgery - 0.2, w.center + 0.9))); if (t > 32.5) x = lerp(-20, -160, E.inOut(p(t, w.cheaper - 0.2, w.office2 + 0.3))); return x; };
const doctorPos = t => { const x0 = officeX(t) + 115, x1 = CX - 30, u = E.inOut(p(t, w.same1 - 0.05, w.sdoc + 0.75)); return [lerp(x0, x1, u), GY + 40, u > 0 && u < 1 ? u * 12 : 0]; };

// ---------- camera ----------
const KEYS = [
  { t: 0, x: HX - 175, y: -615, z: 1.85 }, { t: 2.15, x: HX + 160, y: -610, z: 1.98 },                                   // S1: across the digits
  { t: 3.05, x: HX - 30, y: -150, z: 0.95, e: 'inOut5' }, { t: 4.6, x: HX - 50, y: -130, z: 1.0 },                        // pull back: hospital + her
  { t: 5.6, x: HX, y: -170, z: 0.95 }, { t: 7.4, x: HX, y: -210, z: 1.02 }, { t: 8.3, x: HX - 80, y: -70, z: 1.05 }, { t: 9.5, x: HX - 100, y: -50, z: 1.1 },
  { t: RING + 0.55, x: -450, y: 120, z: 1.8, e: 'inOut' }, { t: 12.1, x: -450, y: 110, z: 2.2 },                          // S3: the phone
  { t: 12.95, x: HX - 60, y: -80, z: 1.02, e: 'inOut5' }, { t: 14.6, x: HX - 50, y: -90, z: 1.0 },
  { t: 16.6, x: -20, y: -170, z: 0.86, e: 'inOut' }, { t: 17.6, x: 0, y: -160, z: 0.88 },                                // the office slides to the surgery center
  { t: 18.8, x: 150, y: 30, z: 1.22 }, { t: 20.5, x: 170, y: 10, z: 1.22 },                                               // S4: same doctor, same procedure
  { t: 21.25, x: 40, y: -470, z: 1.08, e: 'inOut5' }, { t: 22.6, x: 50, y: -520, z: 1.32, e: 'out5' }, { t: 23.6, x: -60, y: -300, z: 0.95, e: 'inOut' }, { t: 25.0, x: -60, y: -290, z: 0.97 },
  { t: 27.0, x: 100, y: -620, z: 0.6, e: 'inOut5' }, { t: 32.6, x: 100, y: -620, z: 0.63 },                              // S5: rise -> one owner behind both
  { t: 33.5, x: -50, y: -230, z: 0.8, e: 'inOut5' }, { t: 38.8, x: -60, y: -240, z: 0.83 }, { t: 39.5, x: -10, y: -330, z: 0.78, e: 'inOut' }, { t: T, x: -10, y: -330, z: 0.8 },
];
const cam = EN.camera(KEYS, { breath: t => (t > 41 ? 0.4 : 1), shakes: [[0.25, 10], [RING, 6], [w.six, 12], [w.too + 0.2, 7], [w.room, 10]] });

function background(ctx) { ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); }
function layer(ctx, c, f, draw) { ctx.save(); ctx.translate(c.x * (1 - f), c.y * (1 - f)); draw(); ctx.restore(); }
function street(ctx, t, c) {
  layer(ctx, c, 0.45, () => {
    for (let i = 0; i < 18; i++) { const x = -1700 + i * 190, h = 260 + hash(i * 5) * 420; ctx.fillStyle = i % 3 ? '#E4DCCB' : '#DCD3C0'; ctx.fillRect(x, 120 - h, 160, h + 60);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (let r = 0; r < h / 60 - 1; r++) for (let q = 0; q < 3; q++) if (hash(i * 31 + r * 7 + q) > 0.5) ctx.fillRect(x + 22 + q * 44, 150 - h + r * 60, 22, 26); }
    for (let i = 0; i < 10; i++) { ctx.save(); ctx.translate(-1500 + hash(i * 3) * 3000, -1100 + hash(i * 9) * 900); ctx.rotate(-0.2 + hash(i) * 0.15); ctx.fillStyle = ['rgba(230,57,70,0.10)', 'rgba(77,141,255,0.12)', 'rgba(255,200,87,0.22)'][i % 3]; ctx.fillRect(-170, -26, 340, 52); ctx.restore(); }
  });
  layer(ctx, c, 0.8, () => { for (const x of [-860, 820]) { flat(ctx, () => rr(ctx, x - 10, GY - 150, 20, 150, 6), '#7A5A3A'); cut(ctx, () => { ctx.beginPath(); ctx.arc(x, GY - 200, 80, 0, 7); }, C.green, { sb: 16, sy: 8, lw: 3.5 }); } });
  flat(ctx, () => rr(ctx, -2200, GY - 4, 4400, 50, 0), '#D6CDBB'); flat(ctx, () => rr(ctx, -2200, GY + 46, 4400, 230, 0), '#4A4F5E'); flat(ctx, () => rr(ctx, -2200, GY + 276, 4400, 60, 0), '#D6CDBB');
  ctx.fillStyle = '#F2E8C9'; for (let i = 0; i < 17; i++) ctx.fillRect(-2100 + i * 260, GY + 154, 140, 14);
}

// ---------- the world ----------
const BILL18 = x => billDoc(x, { head: 'ESTIMATE', amount: '$18,000', where: 'HOSPITAL OPERATING ROOM', col: C.red });
const BILL3 = x => billDoc(x, { head: 'ESTIMATE', amount: '~$3,000', where: "IN THE DOCTOR'S OFFICE", col: R4.blue });
const BILL6 = x => billDoc(x, { head: 'FINAL BILL', amount: '~$6,000', where: 'SURGERY CENTER', col: C.red, amtCol: C.red });
function world(ctx, t, c) {
  street(ctx, t, c);
  // the hospital system: rises behind both buildings (the twist)
  const hq = E.back(p(t, w.hospital - 0.15, w.hospital + 0.5), 1.4);
  let hqTop = 0; if (hq > 0) { ctx.save(); ctx.globalAlpha = t > END_TXT ? 0.55 : 1; hqTop = place(ctx, { ...HQB, x: HQX, y: GY - 60, style: 'HQ', side: 1, seed: 4, grow: hq }, 'HOSPITAL SYSTEM', C.red, '#FFFFFF'); ctx.restore(); }
  // the first hospital: slides away to the left
  const hosX = lerp(HX, -1900, E.in(p(t, w.another - 0.3, w.another + 0.45)));
  if (hosX > -1800) { contact(ctx, hosX + 20, GY + 6, 380, 22, 0.22); place(ctx, { ...HOS, x: hosX, y: GY, style: 'HS', side: 1, seed: 2 }, 'HOSPITAL', '#FFFFFF', C.ink, (x) => {}); }
  // the surgery center
  const cg = E.back(p(t, w.moving - 0.2, w.moving + 0.35), 1.5);
  if (cg > 0) { contact(ctx, CX + 20, GY + 6, 240, 18, 0.22); place(ctx, { ...CEN, x: CX, y: GY, style: 'SC', side: -1, seed: 7, grow: cg }, t > w.surgery - 0.1 ? 'SURGERY CENTER' : null, '#FFFFFF', C.ink, null); }
  // ownership lines (drawn over the buildings, under the people)
  if (hq > 0.9) { const y0 = GY - 60 - hqTop * 0.45;
    ownLine(ctx, HQX - 200, y0, officeX(t) + 20, GY - 300 - 20, E.inOut(p(t, w.bought - 0.1, w.bought + 0.5)), t);
    ownLine(ctx, HQX + 200, y0, CX - 30, GY - 620 * 0.95 * 0.55, E.inOut(p(t, w.owned - 0.1, w.owned + 0.5)), t); }
  // the doctor's office (the giant hand can lift it)
  const ox = officeX(t), lift = officeLift(t);
  if (ox < 1450) { contact(ctx, ox + 10, GY + 6, 200 * (1 - lift / 600), 16, 0.22); place(ctx, { ...OFF, x: ox, y: GY - lift, style: 'OF', side: 1, seed: 3, lean: Math.sin(clamp(p(t, w.another - 0.15, w.doctor + 0.4)) * Math.PI) * -0.08 + Math.sin(clamp(p(t, w.moving - 0.1, w.center + 0.25)) * Math.PI) * -0.06 },
    "DOCTOR'S OFFICE", C.ink, '#FFFFFF', officeWindows); }
  if (t > 38.5) { const d = E.out5(p(t, w.hosp3 - 0.2, w.chose2)), g = E.inOut(p(t, w.chose2 - 0.15, w.chose2 + 0.05)) * (1 - p(t, w.room, w.room + 0.2)), up = E.in(p(t, w.room + 0.05, w.room + 0.6));
    ctx.save(); ctx.translate(ox + 10, GY - 300 - 70 - lift - lerp(900, 0, d) - up * 2600); giantHand(ctx, g); ctx.restore(); }
  // the doctor: at the office door, then walks into the surgery center (same doctor)
  if (t > w.doctor - 0.1 && t < 32.9) { const [dx, dy, ph] = doctorPos(t), u = E.back(p(t, w.doctor - 0.1, w.doctor + 0.25), 2); ctx.save(); ctx.globalAlpha = 1 - p(t, 32.4, 32.9); doctor(ctx, dx, dy, 0.62 * u, { walk: ph, clip: t < w.same2 - 0.1 });
    ctx.restore(); tag(ctx, 'SAME DOCTOR', dx, dy - 290, { u: p(t, w.sdoc - 0.1, w.sdoc + 0.2) * (1 - p(t, w.same2 - 0.25, w.same2)), size: 36, bg: C.ink }); }
  // same procedure: the clipboard moves from the office to the surgery center
  const pc = E.inOut(p(t, w.same2 - 0.1, w.sproc + 0.4));
  if (t > w.same2 - 0.3 && t < 21.0) { const [dx] = doctorPos(t); ctx.save(); ctx.globalAlpha = 1 - p(t, 20.6, 20.9); ctx.translate(lerp(officeX(t) + 60, CX + 130, pc), GY - 250 - Math.sin(pc * Math.PI) * 160); ctx.rotate(0.08 - pc * 0.12); ctx.scale(0.55, 0.55); procCard(ctx); ctx.restore();
    tag(ctx, 'SAME PROCEDURE', CX + 10, GY - 450, { u: p(t, w.sproc - 0.05, w.sproc + 0.25) * (1 - p(t, 20.6, 20.9)), size: 36, bg: C.red }); }
  // her
  if (t > 3.2 - 1 && (t < 25.5 || t > 32.9)) { const hx = heroX(t), a = t < 25.5 ? 1 - p(t, 25.0, 25.5) : p(t, 32.9, 33.3);
    const walk = t < 25 ? (p(t, w.surgery - 0.2, w.center + 0.9) > 0 && p(t, w.surgery - 0.2, w.center + 0.9) < 1 ? t * 9 : 0) : (p(t, w.cheaper - 0.2, w.office2 + 0.3) > 0 && p(t, w.cheaper - 0.2, w.office2 + 0.3) < 1 ? t * 9 : 0);
    let look = 0, up = 0, eyes = 1, mood = 'smile', ph = 0, ring = 0, ex = 0, blush = false;
    if (t < w.another - 0.3) { up = 1; eyes = 1 + 0.8 * E.back(p(t, w.procedure - 0.1, w.procedure + 0.25), 2); mood = t > w.procedure ? 'o' : 'flat'; }
    else if (t < RING) { up = t < w.problem ? 1 : 0.4; mood = t > w.three ? 'smile' : 'flat'; ex = p(t, w.problem - 0.25, w.right + 0.5); blush = t > w.solved; }
    else if (t < w.surgery - 0.2) { ph = t < w.day + 0.6 ? 1 : 2; ring = t < w.not ? 1 - p(t, w.not - 0.3, w.not) * 0 : 0; ring = t > RING && t < w.not + 0.05 ? 1 : 0; mood = t > w.quite ? 'frown' : 'smile'; eyes = t > w.appointment ? 1.25 : 1; look = 0.3; }
    else if (t < w.final) { ph = t < w.center + 0.5 ? 2 : 0; look = 1; mood = 'flat'; }
    else if (t < 25.5) { up = 1; look = 0.6; eyes = 1 + 0.9 * E.back(p(t, w.six - 0.05, w.six + 0.3), 2); mood = t > w.six ? 'o' : 'flat'; }
    else { look = t < w.chose ? 0 : t < END_TXT - 1.6 ? -0.8 : 0; up = t > w.hosp3 ? 1 : 0; mood = t > w.room ? 'o' : t > w.hosp3 ? 'flat' : 'smile'; eyes = t > w.room ? 1.7 : t > w.hosp3 ? 1.2 : 1; }
    const hold = t > 32.9 ? x => { const f = p(t, w.room - 0.12, w.room + 0.12), k = Math.abs(Math.cos(f * Math.PI)); x.save(); x.scale(0.42 * Math.max(0.04, k), 0.42); (f < 0.5 ? BILL3 : BILL6)(x); x.restore(); } : null;
    ctx.save(); ctx.globalAlpha = a; heroine(ctx, hx, GY + 120, 1.0, { look, up, eyes, mood, phone: ph, ring, t, walk, exhale: ex, blush, hold }); ctx.restore();
    if (t > w.solved && t < RING) tag(ctx, 'PHEW', hx + 130, GY - 290, { u: p(t, w.solved, w.solved + 0.25) * (1 - p(t, RING - 0.3, RING)), size: 40, bg: C.yellow, fg: C.ink, rot: 0.08 }); }
  // the bills hanging in the air (in front of everything)
  bills(ctx, t);
}
function bills(ctx, t) {
  const a = 1 - p(t, 25.0, 25.5); if (a <= 0) return;
  // the $18,000 estimate slams in, folds shut; the ~$3,000 estimate unfolds out of it
  const inn = E.out5(p(t, 0.0, 0.3)), fold = p(t, w.three - 0.6, w.three - 0.15), unf = E.back(p(t, w.three - 0.15, w.three + 0.25), 1.4);
  const bx = t < w.moving ? B1[0] : lerp(B1[0], -40, E.inOut(p(t, w.moving - 0.1, w.center + 0.25)));
  ctx.save(); ctx.globalAlpha = a;
  if (fold < 1) { ctx.save(); ctx.translate(B1[0] + (1 - inn) * 700, B1[1] - (1 - inn) * 900); ctx.rotate(-0.03 + (1 - inn) * 0.4); folded(ctx, fold, BILL18); ctx.restore(); }
  if (unf > 0) { const back = E.inOut(p(t, w.final - 0.1, w.bill + 0.2)); ctx.save(); ctx.translate(lerp(bx, -220, back), lerp(B1[1], -720, back)); ctx.rotate(lerp(0.02, -0.12, back)); const s = lerp(0.85, 0.62, back); ctx.scale(s, s * Math.max(0.03, unf)); BILL3(ctx);
    if (back > 0.5) { ctx.fillStyle = 'rgba(247,245,240,0.25)'; ctx.fillRect(-310, -210, 620, 420); } ctx.restore(); }
  // FINAL BILL ~$6,000 flies in front
  const fb = E.out5(p(t, w.final - 0.05, w.bill + 0.15)), big = t > w.six ? 1 + (1 - spring(t - w.six, 2.8, 7)) * 0.12 : 1;
  if (fb > 0) { ctx.save(); ctx.translate(lerp(900, 60, fb), lerp(-1200, -540, fb)); ctx.rotate(lerp(0.5, 0.03, fb)); ctx.scale(1.05 * big, 1.05 * big);
    billDoc(ctx, { head: 'FINAL BILL', amount: t > w.six - 0.05 ? '~$6,000' : '$ ?', where: 'SURGERY CENTER', col: C.red, amtCol: C.red }); ctx.restore(); }
  ctx.restore();
}

// ---------- screen space ----------
function strip(ctx, txt, x, y, size, bg, fg, u, rot = -0.02) { if (u <= 0) return; const k = lerp(1.6, 1, E.out5(clamp(u))); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha *= clamp(u * 3);
  ctx.font = `${size}px ${F.black}`; const tw = Math.min(980, ctx.measureText(txt).width + size * 0.7); cut(ctx, () => rr(ctx, -tw / 2, -size * 0.78, tw, size * 1.12, 10), bg, { lw: 0, sb: 24, sy: 12, edgeW: 12 }); text(ctx, txt, 0, size * 0.18, size, fg, F.black, 'center', tw - size * 0.5); ctx.restore(); }
function overlay(ctx, t) {
  const so = p(t, w.too + 0.05, w.too + 0.35) * (1 - p(t, 32.7, 33.0));
  if (so > 0) strip(ctx, 'SAME OWNER.', A[0], 330, 130, C.red, '#FFFFFF', so);
  const f1 = p(t, END_TXT, END_TXT + 0.25), f2 = p(t, END_TXT + 0.3, END_TXT + 0.55);
  if (f1 > 0) { ctx.save(); const k = lerp(1.5, 1, E.out5(f1)); ctx.translate(A[0], 250); ctx.scale(k, k); ctx.globalAlpha = clamp(f1 * 3); ctx.lineWidth = 20; ctx.lineJoin = 'round'; ctx.strokeStyle = R4.paper;
    ctx.font = `104px ${F.black}`; ctx.textAlign = 'center'; ctx.strokeText('SAME PROCEDURE.', 0, 0); text(ctx, 'SAME PROCEDURE.', 0, 0, 104, C.ink, F.black, 'center', 960); ctx.restore(); strip(ctx, 'DIFFERENT PRICE.', A[0], 395, 112, C.red, '#FFFFFF', f2); }
}

// ---------- subtitles: phrase groups; amounts shown as numbers ----------
const SPLIT = { m01: [6, 4], m02: [5, 4, 4], m03: [3], m04: [2], m05: [5, 3], m06: [5, 4], m07: [2, 2], m08: [3, 4], m09: [3], m10: [5, 3], m11: [3, 4], m12: [5, 5], m13: [6], m14: [7] };
function manualSubs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k, k + n) }); k += n; }); if (k !== ws.length) throw new Error(`subtitle split ${id}: ${k} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], end = g.words[g.words.length - 1].t1 + 0.5; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(end, nx.words[0].t0 - 0.05)) : Math.min(end + 0.2, END_TXT);
    g.text = g.words.map(x => x.w).join(' ').replace(/eighteen thousand dollars/i, '$18,000').replace(/three thousand/i, '$3,000').replace(/six thousand dollars/i, '$6,000'); });
  return G;
}

const ep = {
  T, cam, background, overlay, world,
  fg: [
    { t0: 4.4, t1: 9.4, tr: 6.5, x: 990, y: 300, k: 'receipt', s: 1.1, rot: 0.4, par: 1.7, blur: 9 },
    { t0: 25.2, t1: 32.6, tr: 28, x: 70, y: 1240, k: 'bill', s: 1.1, rot: -0.3, par: 1.8, blur: 9 },
  ],
  subs: manualSubs(),
  subStyle: { y: 1565, size: 62, maxW: 820, highlight: ['$18000', '$3000', '$6000', 'twist', 'cheaper', 'pricier', 'owned'] },
  vo: Object.entries(ST),
  music: { b0: 0.3, relief: w.three, ring: RING, tense: w.not, twist: w.twist - 0.4, finale: 33.0, hit: w.room, end: T },
  cues() {
    const c = [['slam', 0.12, 0.6], ['paper', 0.15], ['whoosh', 0.0, 0.6], ['tick', 0.9], ['tick', 1.4], ['tick', 1.9], ['whoosh', 2.3, 0.5], ['pop', w.procedure + 0.05]];
    c.push(['whoosh', w.another - 0.3, 0.8], ['rumble', w.another - 0.2, 0.5], ['thump', w.doctor + 0.25, 0.5], ['pop', w.doctor], ['paper', w.three - 0.6], ['unfold', w.three - 0.15], ['tag', w.three + 0.1]);
    c.push(['puff', w.problem - 0.2], ['rise', w.solved - 0.2], ['pop', w.solved]);
    c.push(['ring', RING], ['ring', RING + 1.0], ['zoom', RING + 0.1, 0.5], ['blip', w.day], ['whoosh', 12.4, 0.5]);
    c.push(['pop', w.moving - 0.1], ['thump', w.moving + 0.2, 0.5], ['rumble', w.moving + 0.1, 0.6], ['whoosh', w.moving + 0.3, 0.6], ['tag', w.surgery], ['thump', w.center + 0.25, 0.5]);
    c.push(['tag', w.sdoc], ['paper', w.same2], ['tag', w.sproc]);
    c.push(['whoosh', w.final - 0.1, 0.8], ['slam', w.bill + 0.1, 0.5], ['stamp', w.six, 0.8], ['boom', w.six, 0.45]);
    c.push(['whoosh', w.twist - 0.3, 0.8], ['rise', w.hospital - 0.2], ['thump', w.hospital + 0.3, 0.6], ['pulse', w.bought], ['pulse', w.owned], ['boom', w.too + 0.1, 0.5], ['slam', w.too + 0.1, 0.5]);
    c.push(['whoosh', 32.9, 0.6], ['tag', w.chose], ['whoosh', w.hosp3 - 0.2, 0.8], ['thump', w.chose2, 0.4], ['whoosh', w.chose2 + 0.2, 0.6], ['slam', w.room, 0.7], ['flap', w.room - 0.1], ['stamp', END_TXT + 0.3, 0.6]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
