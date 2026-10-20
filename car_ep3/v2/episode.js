// "Your Car Was Reporting On You" — v2, Cinematic Bold Editorial Collage (1080x1920, 30 fps).
// One continuous journey: denied document -> 603 records -> night road -> her car -> dashboard -> data flight
// (broker -> report -> insurer -> price) -> FTC collage -> 5-year ban -> the road becomes a dossier -> record 603.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | cues     (v1 stays in ../episode.js)
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../../tests/mcd_collage/kit');
const EN = require('../../mcd_ep1/engine');
const { stamp } = require('../../air_ep2/airkit');
const CK = require('../carkit');
const D3 = require('./car3d');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, tag, contact } = K;
const { P3, text, insuranceDoc, folder, page, dataCard, reportCard, insurer, riskMeter, legalDoc, padlock } = CK;
const { NIGHT, wrap, roadScene, interior, brokerCorridor, printer, priceTag, trafficTicket, clipping, agencyBuilding } = D3;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);

// ---------- voice-over (Chris) ----------
const ST = { d01: 0.3, d02: 2.0, d03: 5.45, d04: 6.95, d05: 9.55, d06: 14.0, d07: 19.65, d08: 23.85, d09: 31.35, d10: 39.3, d11: 41.05 };
const V = EN.voice(`${__dirname}/vo`, ST), at = V.at, T = 45.6;
const w = { denied: at('d01', 'denied'), records: at('d02', 'records'), shocking: at('d03', 'shocking'), records2: at('d04', 'records'), chev: at('d04', 'chevrolet'),
  onstar: at('d05', 'onstar'), hard: at('d05', 'hard'), accel: at('d05', 'acceleration'), speed: at('d05', 'speed'),
  shared: at('d06', 'shared'), brokers: at('d06', 'brokers'), supply: at('d06', 'supply'), reports: at('d06', 'reports'), insurance: at('d06', 'insurance'),
  data: at('d07', 'data'), pay: at('d07', 'pay'), ticket: at('d07', 'ticket'),
  ftc: at('d08', 'ftc'), accused: at('d08', 'accused'), gm: at('d08', 'gm'), onstar2: at('d08', 'onstar'), collecting: at('d08', 'collecting'), sharing: at('d08', 'sharing'), consent: at('d08', 'consent'),
  y2026: at('d09', '2026'), finalized: at('d09', 'finalized'), five: at('d09', 'five-year'), ban: at('d09', 'ban'), certain: at('d09', 'certain'), consumer: at('d09', 'consumer'),
  road: at('d10', 'road'), recording: at('d11', 'recording'), driving: at('d11', 'driving') };

// ---------- world layout ----------
const ROAD = [0, 2450];                         // night road, straight below the records (the camera tilts down)
const TURN0 = w.chev - 0.08, TURN1 = w.chev + 0.6, TH = 1.15;
const WIN2 = (() => { const c = Math.cos(TH), s = Math.sin(TH), x0 = (1030 * c - 440 * s) / 2; // windshield of the turned car (see carTurn)
  return [ROAD[0] + 0.62 * (x0 + 440 * s / 2), ROAD[1] - 150 + 330 + 0.62 * (-222 * (1 + 0.1 * s))]; })();
const CAB = [15000, 120], CABS = 0.85, CLUSTER = [CAB[0], CAB[1] + 250 * CABS];
const SY = -2600, SKY = 15000, BROKER = 16900, PRINT = 18500, INS = 20200, PRICE = 20720, FTC = 24500, BAN = 27000, END = 30500;
const ENVS = [[13800, 16100, '#0E1326'], [16100, 19300, '#1E2433'], [19300, 23400, C.yellow], [23400, 25900, '#121212'], [25900, 28700, C.red], [28700, 33500, '#0B0E18']];

// ---------- road speed (integrated, so dashes never jump) ----------
const SPEED = t => { let v = 1.0; if (t > w.hard - 0.05) v = lerp(1, 0.12, E.out(p(t, w.hard - 0.05, w.hard + 0.25))); if (t > w.accel - 0.1) v = lerp(0.12, 1.9, E.inOut(p(t, w.accel - 0.1, w.accel + 0.5))); if (t > w.speed) v = lerp(1.9, 2.6, p(t, w.speed, w.speed + 0.4)); if (t > 13.6) v = lerp(2.6, 1.2, p(t, 13.6, 14.2)); return v; };
const DIST = []; { let d = 0; for (let i = 0; i <= Math.ceil(T * 120); i++) { DIST.push(d); d += SPEED(i / 120) / 120; } }
const dist = t => DIST[Math.max(0, Math.min(DIST.length - 1, Math.round(t * 120)))];

// ---------- camera ----------
const KEYS = [
  { t: 0, x: 0, y: -20, z: 1.04 }, { t: w.denied - 0.02, x: 0, y: -20, z: 1.1 }, { t: w.denied + 0.25, x: 0, y: 90, z: 1.34, e: 'out5' }, { t: 1.45, x: 0, y: 95, z: 1.38 },   // S1 slam + punch
  { t: 2.05, x: 0, y: -110, z: 1.0, e: 'inOut' }, { t: 5.25, x: 0, y: -120, z: 1.1 },                                                                                  // dramatic pull-back; the 603 build
  { t: 5.85, x: ROAD[0], y: ROAD[1] - 90, z: 1.0, e: 'inOut5' }, { t: 7.9, x: ROAD[0] + 40, y: ROAD[1] - 80, z: 1.06 },                                               // tilt down onto the night road
  { t: TURN1, x: WIN2[0] * 0.6, y: lerp(ROAD[1] - 80, WIN2[1], 0.5), z: 1.5 }, { t: 9.45, x: WIN2[0], y: WIN2[1], z: 26, e: 'in' },                                 // the car turns; dive through the windshield
  { t: 9.4501, x: CAB[0], y: CAB[1] - 357, z: 2.4 }, { t: 10.05, x: CAB[0], y: 0, z: 1.0, e: 'out5' }, { t: w.hard - 0.02, x: CAB[0], y: 0, z: 1.0 },
  { t: w.hard + 0.18, x: CAB[0], y: 30, z: 1.08, e: 'out5' }, { t: w.accel - 0.05, x: CAB[0], y: 10, z: 1.03 }, { t: w.accel + 0.4, x: CAB[0], y: -20, z: 0.95, e: 'out5' },       // lurch, pressed back
  { t: w.speed - 0.05, x: CAB[0], y: -10, z: 0.96 }, { t: w.speed + 0.5, x: CLUSTER[0], y: CLUSTER[1] - 60, z: 1.45, e: 'inOut' }, { t: 13.5, x: CLUSTER[0], y: CLUSTER[1] - 70, z: 1.5 }, // push into the speedometer
  { t: 13.95, x: CAB[0], y: -300, z: 0.95, e: 'inOut' }, { t: 14.55, x: SKY, y: SY, z: 0.9, e: 'inOut5' },                                                           // data leaves through the windshield; tilt up
  { t: 15.05, x: SKY + 60, y: SY, z: 0.92 }, { t: 16.1, x: BROKER, y: SY, z: 0.85, e: 'inOut' }, { t: 16.5, x: BROKER + 150, y: SY, z: 0.88 },                    // follow the folder into the broker
  { t: 17.1, x: PRINT, y: SY + 40, z: 1.0, e: 'inOut' }, { t: 17.45, x: PRINT + 60, y: SY + 20, z: 1.0 }, { t: 18.15, x: INS, y: SY - 50, z: 0.9, e: 'inOut' },      // report out, to the insurer
  { t: 19.6, x: INS + 40, y: SY - 50, z: 0.93 }, { t: 20.3, x: PRICE, y: SY + 40, z: 0.95, e: 'inOut' }, { t: 23.5, x: PRICE + 30, y: SY + 40, z: 1.0 },
  { t: 23.95, x: FTC - 40, y: SY + 60, z: 0.98, e: 'inOut5' }, { t: 31.1, x: FTC + 70, y: SY + 200, z: 0.9, r: -0.02 },                                               // FTC collage: slow serious pan
  { t: 31.6, x: BAN, y: SY, z: 1.0, e: 'inOut5' }, { t: 38.7, x: BAN, y: SY, z: 1.06 },                                                                               // the ban
  { t: 39.1, x: END, y: SY - 90, z: 1.0, e: 'inOut5' }, { t: w.recording - 0.1, x: END + 30, y: SY - 80, z: 1.04 },                                               // the road again (a photo on the file)
  { t: w.recording + 0.75, x: END, y: SY + 40, z: 0.34, e: 'inOut5' }, { t: 42.6, x: END, y: SY + 20, z: 0.36 }, { t: T, x: END - 200, y: SY - 9, z: 0.62, e: 'inOut' }, // pull back -> dossier -> push to record 603
];
const cam = EN.camera(KEYS, {
  breath: t => (t < 2.0 ? 0.3 : 1) * (1 - 0.85 * E.inOut(seg(t, 44.2, T))),
  shakes: [[w.denied, 16], [w.records, 8], [w.chev, 6], [w.hard, 14], [w.ftc, 6], [w.ban, 16]],
});

// ---------- background (only the regions outside the world strip need a fill) ----------
function background(ctx, t) {
  ctx.fillStyle = t < 5.5 ? '#11141C' : t < 9.45 ? NIGHT.sky1 : t < 14.2 ? '#090B12' : '#0B0E18'; ctx.fillRect(0, 0, W, H);
}

// ================= S1 DENIED -> the document breaks into paper layers =================
const DOCC = createCanvas(820, 1040), DX = DOCC.getContext('2d');
function docCanvas(t) { DX.setTransform(1, 0, 0, 1, 0, 0); DX.clearRect(0, 0, 820, 1040); DX.translate(410, 520); insuranceDoc(DX, t, { denied: t > w.denied }); stamp(DX, 'DENIED', 0, 130, 1.25, p(t, w.denied - 0.05, w.denied + 0.08), -0.18, C.red); return DOCC; }
function sDenied(ctx, t) {
  // desk: other papers under the application (support, not decoration)
  for (const [x, y, r] of [[-320, 180, -0.22], [300, -260, 0.18]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.globalAlpha = 1 - p(t, 1.4, 1.9); cut(ctx, () => rr(ctx, -330, -440, 660, 880, 20), '#D9D2C3', { sb: 24, sy: 12, lw: 3 }); ctx.restore(); }
  const img = docCanvas(Math.min(t, 1.45)), br = p(t, 1.45, 2.15);
  if (br <= 0) { ctx.save(); ctx.translate(0, -20); ctx.rotate(-0.02); ctx.drawImage(img, -410, -520); ctx.restore(); return; }
  // three paper layers fly towards the camera (scale up = closer), with trails
  const SL = [[0, 330, -1, -0.5, -0.35], [330, 330, 1, 0.1, 0.28], [660, 380, -0.6, 0.7, -0.2]];
  SL.forEach(([y0, h, dx, dy, rot], i) => { for (let g = 2; g >= 0; g--) { const k = E.in(clamp(br - g * 0.05)), sc = 1 + k * 2.4;
    ctx.save(); ctx.globalAlpha = (g ? 0.2 : 1) * (1 - p(t, 1.95 + i * 0.03, 2.15)); ctx.translate(dx * k * 900, -20 + (y0 + h / 2 - 520) + dy * k * 900); ctx.rotate(-0.02 + rot * k); ctx.scale(sc, sc);
    ctx.drawImage(img, 0, y0, 820, h, -410, -h / 2, 820, h); ctx.restore(); } });
}

// ================= S2 603 RECORDS: cards fly at the camera, then build the number =================
const GLY = []; { const c = createCanvas(980, 420), x = c.getContext('2d'); x.font = `400px ${F.black}`; x.textAlign = 'center'; x.fillStyle = '#000'; x.fillText('603', 490, 350);
  const d = x.getImageData(0, 0, 980, 420).data; for (let yy = 12; yy < 420; yy += 28) for (let xx = 12; xx < 980; xx += 28) if (d[(yy * 980 + xx) * 4 + 3] > 140) GLY.push([xx - 490, yy - 210]); }
const MOS = GLY.map((g, i) => ({ g, t: 2.85 + (i / GLY.length) * 0.6, sx: (hash(i * 3) - 0.5) * 1400, sy: (hash(i * 7) - 0.5) * 1600, r: (hash(i) - 0.5) * 0.5, k: i % 3 }));
const TUN = []; for (let i = 0; i < 46; i++) TUN.push({ t: 1.85 + i * 0.045, x: (hash(i * 11) - 0.5) * 1500, y: (hash(i * 5) - 0.5) * 1900, r: (hash(i * 2) - 0.5) * 1.2, k: i % 3 });
const MC = [0, -130];   // mosaic centre (world)
function card(ctx, x, y, s, rot, k, a = 1) { if (s <= 0.01 || a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); page(ctx, k); ctx.restore(); }
function sRecords(ctx, t) {
  const sc = p(t, 5.25, 5.8); // scatter on "The shocking part?"
  // tunnel: z from 7 -> 0.35 (perspective scale 1/z); drawn far -> near
  const live = TUN.map(c => ({ c, z: 7 - (t - c.t) * 7.5 })).filter(o => t > o.c.t && o.z > 0.35).sort((a, b) => b.z - a.z);
  for (const { c, z } of live) { const s = 0.9 / z; for (let g = 2; g >= 0; g--) { const zz = z + g * 0.25, ss = 0.9 / zz; card(ctx, c.x / zz, -110 + c.y / zz, ss, c.r + t * 0.6, c.k, (g ? 0.15 : 1) * clamp((7 - z) / 2) * (1 - sc)); } }
  // mosaic: cards fly in from depth and land on the glyph of "603"
  const solid = p(t, w.records + 0.25, w.records + 0.7) * (1 - sc);
  if (solid > 0) { ctx.save(); ctx.globalAlpha = solid; ctx.font = `400px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = C.yellow; ctx.fillText('603', MC[0], MC[1] + 140); ctx.restore(); }
  for (let i = 0; i < MOS.length; i++) { const m = MOS[i], u = E.out(p(t, m.t, m.t + 0.55)); if (u <= 0) continue;
    const zx = lerp(4.5, 1, u), x = lerp(m.sx / zx, m.g[0], u), y = lerp(m.sy / zx, m.g[1], u) + MC[1], s = lerp(0.9 / zx, 0.115, u);
    const blow = E.in(sc), bx = x + (m.g[0]) * blow * 3 + (hash(i) - 0.5) * blow * 900, by = y + (m.g[1] - 400) * blow * 2.2;
    card(ctx, bx, by, s * (1 + blow * 2), m.r * (1 - u) + blow * m.r * 6, m.k, 1 - p(t, 5.6, 5.85)); }
}

// ================= S3 THE CAR: night road, data leaving the car, the turn =================
function sRoad(ctx, t) {
  const turn = lerp(0, TH, E.inOut(p(t, TURN0, TURN1)));
  ctx.save(); ctx.translate(ROAD[0], ROAD[1] - 150); roadScene(ctx, dist(t) / 1 + t * 0, { speed: 1, turn: turn > 0.001 ? turn : 0, antenna: p(t, w.records2 - 0.1, w.records2 + 0.3) * (1 - p(t, TURN0, TURN0 + 0.3)) }); ctx.restore();
  // records rising out of the car (the source of the 603)
  const a = p(t, w.records2 - 0.1, w.records2 + 0.2) * (1 - p(t, TURN0, TURN0 + 0.4));
  if (a > 0) for (let i = 0; i < 9; i++) { const ph = ((t - w.records2) * 0.9 + i / 9) % 1; if (t < w.records2 - 0.1) continue;
    card(ctx, ROAD[0] + 10 + Math.sin(i * 2.3 + ph * 3) * 90 * ph, ROAD[1] - 150 + 160 - ph * 900, 0.22 + ph * 0.28, (hash(i) - 0.5) * 0.8, i % 3, a * (1 - ph)); }
}

// ================= S4 THE CAR IS RECORDING: dashboard, events caused by the road =================
const EV = [{ k: 0, label: 'HARD BRAKING', t: () => w.hard, to: [-150, -560] }, { k: 1, label: 'ACCELERATION', t: () => w.accel, to: [170, -430] }, { k: 2, label: 'SPEED', t: () => w.speed, to: [-80, -300] }];
function needle(t) { let v = 0.38 + Math.sin(t * 2.7) * 0.01; v = lerp(v, 0.12, E.out(p(t, w.hard - 0.05, w.hard + 0.3))); v = lerp(v, 0.62, E.inOut(p(t, w.accel - 0.1, w.accel + 0.5))); v = lerp(v, 0.9, E.inOut(p(t, w.speed - 0.05, w.speed + 0.5))); return v; }
function sCabin(ctx, t) {
  ctx.save(); ctx.translate(CAB[0], CAB[1]); ctx.scale(CABS, CABS);
  interior(ctx, t, { dist: dist(t) * 0.8, needle: needle(t), red: t > w.speed + 0.2, rec: p(t, w.onstar - 0.05, w.onstar + 0.3),
    brakeLights: p(t, w.hard - 0.1, w.hard + 0.05) * (1 - p(t, w.accel - 0.2, w.accel)), iconBrake: p(t, w.hard, w.hard + 0.2) * (1 - p(t, 13.6, 14.0)), iconAccel: p(t, w.accel, w.accel + 0.2) * (1 - p(t, 13.6, 14.0)),
    steer: Math.sin(t * 1.3) * 0.03 });
  ctx.restore();
  // logged events pop out of the cluster towards the windshield; then all of it leaves through the glass
  const up = E.in(p(t, 13.75, 14.35));
  EV.forEach((e, i) => { const u = E.out5(p(t, e.t() - 0.02, e.t() + 0.45)); if (u <= 0) return;
    const x = CAB[0] + lerp(0, e.to[0], u), y = lerp(CLUSTER[1], CAB[1] + e.to[1], u) - up * 2200, s = lerp(0.2, 0.82, u);
    for (let g = 2; g >= 0; g--) { const gu = E.out5(clamp(p(t, e.t() - 0.02, e.t() + 0.45) - g * 0.06)); ctx.save(); ctx.globalAlpha = g ? 0.18 * (1 - u) : 1;
      ctx.translate(CAB[0] + lerp(0, e.to[0], gu), lerp(CLUSTER[1], CAB[1] + e.to[1], gu) - up * 2200); ctx.scale(lerp(0.2, 0.82, gu), lerp(0.2, 0.82, gu)); ctx.rotate((1 - gu) * 0.5); dataCard(ctx, e.k, e.label); ctx.restore(); }
  });
  if (up > 0) for (let i = 0; i < 14; i++) card(ctx, CAB[0] + (hash(i * 5) - 0.5) * 900, CAB[1] - 300 + hash(i) * 300 - up * (1800 + hash(i * 3) * 900), 0.3, (hash(i) - 0.5), i % 3, up < 1 ? 1 : 0);
}

// ================= S5 DATA JOURNEY: folder -> broker -> report -> insurer -> price =================
function envs(ctx) { // collage environments side by side along the strip (the camera travels through them)
  ENVS.forEach(([x0, x1, col], i) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, SY - 2000); for (let k = 0; k <= 40; k++) ctx.lineTo(x0 + (hash(i * 50 + k) - 0.5) * 28, SY - 2000 + k * 100); ctx.lineTo(x1 + 30, SY + 2000); ctx.lineTo(x1 + 30, SY - 2000); ctx.closePath(); ctx.fill(); });
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.arc(13900 + hash(i * 3) * 2200, SY - 1100 + hash(i * 7) * 2000, 2 + hash(i) * 3, 0, 7); ctx.fill(); }
  ctx.save(); ctx.translate(BROKER, SY); brokerCorridor(ctx, 1900, 1900); ctx.restore();
}
function sJourney(ctx, t) {
  // cards converge into a digital folder
  const conv = E.inOut(p(t, 14.3, 14.85)), fly = E.inOut(p(t, w.brokers - 0.25, 16.05)), into = E.in(p(t, 16.0, 16.45));
  if (t < 14.95) for (let i = 0; i < 14; i++) card(ctx, lerp(SKY + (hash(i * 5) - 0.5) * 1200, SKY, conv), lerp(SY + 700 - hash(i) * 400, SY, conv), lerp(0.3, 0.08, conv), (hash(i) - 0.5) * (1 - conv), i % 3, 1 - p(t, 14.8, 14.95));
  if (t > 14.6 && into < 1) { const x = lerp(SKY, BROKER, fly), y = SY - Math.sin(fly * Math.PI) * 180 + into * -60, s = lerp(0.5, 0.42, fly) * (1 - into * 0.92) * E.back(p(t, 14.6, 14.95), 1.8);
    for (let g = 3; g >= 0; g--) { const fg = E.inOut(clamp(p(t, w.brokers - 0.25, 16.05) - g * 0.04)); ctx.save(); ctx.globalAlpha = g ? 0.16 : 1; ctx.translate(lerp(SKY, BROKER, fg), SY - Math.sin(fg * Math.PI) * 180); ctx.scale(s, s);
      ctx.shadowColor = P3.blue; ctx.shadowBlur = 40; folder(ctx, { label: 'DRIVING DATA' }); ctx.restore(); } }
  tag(ctx, 'DATA BROKER', BROKER, SY - 640, { u: p(t, 15.3, 15.6) * (1 - p(t, 17.0, 17.3)), size: 56, bg: C.yellow, fg: C.ink, rot: -0.03 });
  // printer prints a driving report; the report flies to the insurer
  ctx.save(); ctx.translate(PRINT, SY + 260); printer(ctx); ctx.restore();
  const out = E.out(p(t, w.supply + 0.1, w.reports + 0.25)), go = E.inOut(p(t, 17.5, 18.1));
  if (out > 0 && go < 1) { ctx.save(); ctx.beginPath(); ctx.rect(PRINT - 400, SY - 1400, 800, 1650 - (1 - go) * 0 ); ctx.clip();
    ctx.translate(lerp(PRINT, INS, go), lerp(SY + 220 - out * 420, SY - 320, go) - Math.sin(go * Math.PI) * 200); const s = lerp(0.62, 0.22, go); ctx.scale(s, s); ctx.rotate(go * 0.3); reportCard(ctx, { risk: 0.8 }); ctx.restore(); }
  // insurer: shield, risk meter climbs
  const ins = E.back(p(t, 17.75, 18.15), 1.8) * (1 + (t > 18.1 ? (1 - spring(t - 18.1, 3, 7)) * 0.1 : 0));
  if (ins > 0.01) { ctx.save(); ctx.translate(INS, SY - 300); ctx.scale(ins * 0.9, ins * 0.9); insurer(ctx); ctx.restore(); }
  const rm = E.back(p(t, 18.2, 18.55), 1.6); if (rm > 0) { ctx.save(); ctx.translate(INS, SY + 200); ctx.scale(0.8 * rm, 0.8 * rm); riskMeter(ctx, lerp(0.22, 0.85, E.inOut(p(t, 18.5, 19.4)))); text(ctx, 'RISK SCORE', 0, 120, 44, C.ink, F.black, 'center'); ctx.restore(); }
  const pt = E.back(p(t, 20.2, 20.55), 1.8); if (pt > 0) { const lvl = t < w.data + 0.35 ? 1 : t < w.pay - 0.05 ? 2 : 3, k = 1 + (1 - spring(t - (lvl === 3 ? w.pay - 0.05 : w.data + 0.35), 3, 7)) * 0.1;
    ctx.save(); ctx.translate(PRICE, SY - 160); ctx.scale(pt * k, pt * k); ctx.rotate(-0.04); priceTag(ctx, lvl); ctx.restore(); }
  const tk = E.back(p(t, w.ticket - 0.35, w.ticket), 1.6); if (tk > 0) { ctx.save(); ctx.translate(PRICE + 120, SY + 330); ctx.rotate(0.08); ctx.scale(0.8 * tk, 0.8 * tk); trafficTicket(ctx); stamp(ctx, 'NO TICKET', 0, 40, 0.5, p(t, w.ticket + 0.05, w.ticket + 0.18), -0.2, C.ink); ctx.restore(); }
}

// ================= S6 FTC collage =================
const CLIPS = [ // [time, x, y, w, h, text, size, rot, colour]
  [() => w.ftc, FTC - 120, SY - 330, 620, 300, 'FTC', 230, -0.05, C.ink],
  [() => w.gm, FTC + 230, SY + 40, 380, 220, 'GM', 170, 0.06, C.ink],
  [() => w.onstar2, FTC - 160, SY + 160, 580, 220, 'ONSTAR', 140, -0.04, C.red],
];
function sFtc(ctx, t, c) {
  const par = (c.x - FTC) * 0.4; // back layer of newspaper pages moves slower than the clippings
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(FTC - 900 + i * 380 + par, SY - 500 + (i % 2) * 520); ctx.rotate((hash(i) - 0.5) * 0.2); clipping(ctx, null, 520, 760, { paper: '#262626', lines: 22, seed: i * 9 }); ctx.restore(); }
  CLIPS.forEach(([tf, x, y, cw, chh, head, size, rot, col], i) => { const u = p(t, tf() - 0.06, tf() + 0.16); if (u <= 0) return; const k = lerp(1.7, 1, E.out5(u));
    ctx.save(); ctx.globalAlpha = clamp(u * 3); ctx.translate(x, y); ctx.rotate(rot * k); ctx.scale(k, k); clipping(ctx, head, cw, chh, { size, col, seed: i * 13 }); ctx.restore(); });
  if (t > w.accused - 0.05) { ctx.save(); ctx.translate(FTC + 120, SY - 190); stamp(ctx, 'ACCUSED', 0, 0, 0.85, p(t, w.accused - 0.05, w.accused + 0.08), -0.14, C.red); ctx.restore(); }
  [[() => w.collecting, 'COLLECTING', FTC + 70, SY + 400, 0.03], [() => w.sharing, 'SHARING', FTC + 190, SY + 500, -0.04]].forEach(([tf, s, x, y, r]) => { const u = E.out5(p(t, tf() - 0.04, tf() + 0.25)); if (u <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.beginPath(); ctx.rect(-300, -60, 600 * u, 120); ctx.clip(); flat(ctx, () => rr(ctx, -280, -50, 560, 100, 6), C.yellow); text(ctx, s, 0, 30, 76, C.ink, F.black, 'center'); ctx.restore(); });
  const cu = E.out5(p(t, w.consent - 0.4, w.consent)); if (cu > 0) { ctx.save(); ctx.translate(FTC, SY + 640); ctx.rotate(-0.02); ctx.beginPath(); ctx.rect(-480, -60, 960 * cu, 120); ctx.clip(); flat(ctx, () => rr(ctx, -460, -46, 920, 92, 6), C.red); text(ctx, 'WITHOUT PROPER CONSENT', 0, 22, 56, '#FFFFFF', F.black, 'center'); ctx.restore(); }
}

// ================= S7 THE BAN =================
let ORDC = null;
function sBan(ctx, t) {
  const drop = E.back(p(t, 31.45, 31.85), 1.4), back = E.inOut(p(t, w.five - 0.1, w.five + 0.35));
  const drawDoc = (x, u1, u2) => { legalDoc(x, 'FINAL ORDER', { kicker: 'REGULATORY ORDER' }); stamp(x, '2026', 0, 140, 1.0, u1, -0.14, C.ink); stamp(x, 'FINAL', 0, 330, 0.8, u2, 0.1, C.red); };
  ctx.save(); ctx.translate(BAN, SY + 40 - (1 - drop) * 900); const s = lerp(0.66, 0.5, back); ctx.scale(s, s); ctx.globalAlpha = 1 - back * 0.6;
  if (back <= 0.05) drawDoc(ctx, p(t, w.y2026 - 0.05, w.y2026 + 0.08), p(t, w.finalized, w.finalized + 0.12));
  else { if (!ORDC) { ORDC = createCanvas(900, 1200); const x = ORDC.getContext('2d'); x.translate(450, 600); drawDoc(x, 1, 1); } ctx.filter = `blur(${(back * 7 * s).toFixed(1)}px)`; ctx.drawImage(ORDC, -450, -600); }
  ctx.restore();
}

// ================= S8 ENDING: the road is a picture on a giant driving file; it opens on record 603 =================
const FS = 3.0;
function sEnd(ctx, t) {
  const op = E.inOut(p(t, 42.0, 42.7)), photo = 1 - p(t, 42.0, 42.35);
  ctx.save(); ctx.translate(END, SY); ctx.scale(FS, FS);
  folder(ctx, { open: op, label: op > 0.05 ? 'YOUR DRIVING FILE' : null, inside: x => {
    cut(x, () => rr(x, -340, -300, 680, 360, 12), P3.paper, { sb: 10, sy: 4, lw: 2 });
    const ev = ['HARD BRAKING', 'ACCELERATION', 'HIGH SPEED'];
    for (let i = 0; i < 8; i++) { const y = -270 + i * 36, last = i === 7, u = p(t, 42.3 + i * 0.07, 42.5 + i * 0.07); if (u <= 0) continue;
      x.save(); x.globalAlpha = u; if (last) flat(x, () => rr(x, -330, y - 4, 660, 34, 6), 'rgba(255,200,87,0.9)');
      text(x, `RECORD ${596 + i}`, -310, y + 22, 20, last ? C.red : C.ink, F.black); text(x, ev[i % 3], -140, y + 22, 18, '#555555', F.xb); text(x, 'LOGGED', 310, y + 22, 18, last ? C.red : '#7A7A7A', F.xb, 'right');
      if (last) { x.fillStyle = Math.floor(t * 2.5) % 2 ? '#5A1018' : C.red; x.beginPath(); x.arc(150, y + 15, 7, 0, 7); x.fill(); }
      x.restore(); }
  } });
  ctx.restore();
  if (photo > 0) { // the road "photo" printed on the file's cover
    ctx.save(); ctx.globalAlpha = photo; const fx0 = END - 380 * FS + 40, fy0 = SY - 210 * FS + 30; ctx.beginPath(); ctx.rect(fx0, fy0, 760 * FS - 80, 420 * FS); ctx.clip();
    ctx.translate(END, SY - 30); ctx.scale(1.25, 1.25); roadScene(ctx, t, { speed: 1 }); ctx.restore();
    ctx.save(); ctx.globalAlpha = photo * p(t, w.recording, w.recording + 0.6); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 30; ctx.strokeRect(END - 380 * FS + 40, SY - 210 * FS + 30, 760 * FS - 80, 420 * FS); ctx.restore();
  }
}

// ---------- screen-space typography ----------
function maskText(ctx, txt, x, y, size, u, col, font = F.black) { if (u <= 0) return; ctx.save(); ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.beginPath(); ctx.rect(0, y - size * 0.9, W, size * 1.12); ctx.clip(); ctx.fillStyle = col; ctx.fillText(txt, x, y + (1 - E.out5(u)) * size * 1.12); ctx.restore(); }
const STEPS = [[2.15, 12], [2.5, 48], [2.8, 129], [3.15, 301]];
function overlay(ctx, t) {
  if (t > 2.05 && t < w.records + 0.2) { let n = 0; for (const [s, v] of STEPS) if (t >= s) n = v; const last = (STEPS.filter(s => t >= s[0]).pop() || [2.05])[0], k = 1 + (1 - spring(t - last, 3, 8)) * 0.12;
    if (n) { ctx.save(); ctx.globalAlpha = 1 - p(t, w.records - 0.1, w.records + 0.15); ctx.translate(A[0], 760); ctx.scale(k, k); ctx.font = `220px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(String(n), 0, 0); ctx.restore(); } }
  if (t > w.records + 0.3 && t < 5.7) { ctx.save(); ctx.globalAlpha = 1 - p(t, 5.3, 5.6); maskText(ctx, 'RECORDS', A[0], 1110, 84, p(t, w.records + 0.35, w.records + 0.7), '#FFFFFF'); ctx.restore(); }
  if (t > w.five - 0.1 && t < 39.2) { const o = 1 - p(t, 38.75, 39.05); ctx.save(); ctx.globalAlpha = o;
    maskText(ctx, '5-YEAR', A[0], 470, 190, p(t, w.five - 0.05, w.five + 0.3), P3.paper); const k = t > w.ban ? 1 + (1 - spring(t - w.ban, 2.6, 7)) * 0.12 : 1;
    ctx.save(); ctx.translate(A[0], 690); ctx.scale(k, k); ctx.translate(-A[0], -690); maskText(ctx, 'BAN', A[0], 760, 300, p(t, w.ban - 0.06, w.ban + 0.22), C.ink); ctx.restore();
    const d = p(t, w.certain - 0.1, w.certain + 0.35); if (d > 0) { // what the ban covers: certain data -> consumer reporting agencies, blocked
      ctx.save(); ctx.globalAlpha = o * clamp(d * 2); ctx.translate(250, 1050); ctx.scale(0.36, 0.36); folder(ctx, { label: 'DRIVING DATA' }); ctx.restore();
      ctx.save(); ctx.globalAlpha = o * clamp(d * 2); ctx.setLineDash([16, 12]); ctx.lineWidth = 8; ctx.strokeStyle = P3.paper; ctx.beginPath(); ctx.moveTo(420, 1050); ctx.lineTo(420 + 230 * E.out(d), 1050); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.globalAlpha = o * clamp(d * 2); ctx.translate(830, 1080); ctx.scale(0.62, 0.62); agencyBuilding(ctx, p(t, w.consumer - 0.1, w.consumer + 0.3)); ctx.restore();
      maskText(ctx, 'CERTAIN DATA', 250, 1210, 34, p(t, w.certain, w.certain + 0.35), P3.paper, F.xb);
      maskText(ctx, 'CONSUMER REPORTING', 820, 1210, 30, p(t, w.consumer, w.consumer + 0.35), P3.paper, F.xb); maskText(ctx, 'AGENCIES', 820, 1248, 30, p(t, w.consumer + 0.1, w.consumer + 0.45), P3.paper, F.xb); }
    ctx.restore(); }
}

// subtitles: hand-made phrase groups (word counts per line); numbers as digits
const SPLIT = { d01: [5], d02: [3, 8], d03: [3], d04: [3, 4], d05: [4, 2, 3], d06: [6, 5, 3], d07: [6, 3, 4], d08: [6, 4, 6], d09: [4, 3, 4, 4], d10: [5], d11: [6] };
function manualSubs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k, k + n) }); k += n; }); if (k !== ws.length) throw new Error(`subtitle split ${id}: ${k} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], end = g.words[g.words.length - 1].t1 + 0.5; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(end, nx.words[0].t0 - 0.05)) : end + 0.4; g.text = g.words.map(x => x.w).join(' ').replace(/six hundred and three/i, '603'); });
  return G;
}

const ep = {
  T, cam, background, overlay,
  world(ctx, t, c) {
    if (t < 5.9) { if (t < 2.2) sDenied(ctx, t); if (t > 1.8) sRecords(ctx, t); }
    if (t > 5.3 && t < 9.5) sRoad(ctx, t);
    if (t > 9.4 && t < 14.6) sCabin(ctx, t);
    if (t > 14.1) { envs(ctx); sJourney(ctx, t); if (t > 23.4) sFtc(ctx, t, c); if (t > 31.2) sBan(ctx, t); if (t > 38.8) sEnd(ctx, t); }
  },
  fg: [ // foreground parallax only where the camera travels
    { t0: 0, t1: 2.2, tr: 0.5, x: 980, y: 320, k: 'receipt', s: 1.2, rot: 0.4, par: 1.7, blur: 9 },
    { t0: 23.9, t1: 31.3, tr: 27, x: 90, y: 1180, k: 'receipt', s: 1.1, rot: -0.3, par: 1.8, blur: 9 },
  ],
  subs: manualSubs(),
  subStyle: { y: 1525, size: 64, maxW: 800, highlight: ['denied', '603', 'chevrolet', 'onstar', 'brokers', 'ftc', 'five-year', 'ban', 'recording'] },
  vo: Object.entries(ST),
  music: { b0: 0.66, tension: 5.3, groove: 8.66, lead: 14.66, serious: 23.66, build: 31.66, hit: w.ban, road: 38.66, quiet: 41.0, last: w.driving, end: T },
  cues() {
    const c = [['snap', 0.0], ['stamp', w.denied, 1], ['slam', w.denied, 0.6], ['tear', 1.42], ['whoosh', 1.5, 0.8]];
    STEPS.forEach(s => c.push(['tick', s[0]])); for (let i = 0; i < 46; i += 6) c.push(['flutter', TUN[i].t + 0.6]);
    c.push(['coins', w.records - 0.2], ['slam', w.records + 0.3, 0.6], ['whoosh', 5.3, 0.9], ['rev', 6.0], ['pulse', w.records2], ['whoosh', TURN0, 0.6], ['thump', w.chev + 0.1, 0.5], ['zoom', 8.95, 0.9]);
    c.push(['blip', w.onstar], ['brake', w.hard - 0.05], ['blip', w.hard + 0.1], ['rev', w.accel - 0.1], ['blip', w.accel + 0.1], ['blip', w.speed + 0.1], ['rise', w.speed]);
    c.push(['whoosh', 13.8, 0.9], ['pulse', 14.4], ['whoosh', w.brokers - 0.2, 0.6], ['pulse', 16.0], ['flap', w.supply + 0.1], ['whoosh', 17.5, 0.5], ['pop', 18.1], ['rise', 18.5], ['pop', 20.3], ['tag', w.data + 0.35], ['tag', w.pay], ['stamp', w.ticket + 0.05, 0.5]);
    c.push(['whoosh', 23.6, 0.9], ['boom', w.ftc], ['paper', w.ftc - 0.05], ['stamp', w.accused, 0.8], ['paper', w.gm - 0.05], ['paper', w.onstar2 - 0.05], ['scratch', w.collecting], ['scratch', w.sharing], ['tag', w.consent - 0.3]);
    c.push(['whoosh', 31.2, 0.8], ['thump', 31.8, 0.5], ['stamp', w.y2026, 0.6], ['stamp', w.finalized, 0.5], ['slam', w.ban, 1], ['boom', w.ban], ['pulse', w.certain], ['stamp', w.consumer + 0.1, 0.4]);
    c.push(['whoosh', 38.8, 0.8], ['rev', 39.3], ['zoom', w.recording, 0.9], ['whoosh', w.recording + 0.05, 0.6], ['paper', 42.0], ['tick', 42.3], ['tick', 42.5], ['tick', 42.8], ['blip', 42.85]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
