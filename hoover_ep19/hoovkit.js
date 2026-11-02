// Episode 19 "Hoover free flights" (UK, 1992) — props and sets on howitsrun_style (people, sets, plates from the style reference
// lawnchair_ep17 / emu_ep12). Generic re-enactment: no logos (brand names as plain text only), no portraits.
// World space: floor at y = 0, up is negative.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const SE = require('../howitsrun_style/sets');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL } = ST;
const CS = require('./cast');   // the approved cast: CUSTOMER, MANAGER, AGENT, vacBox, PHONE
const HRED = '#C9302C';

// crowd variations of the approved customer (clothes colours only)
const CROWD = [CS.CUSTOMER,
  { ...CS.CUSTOMER, skin: '#C98E66', hair: '#2A1A10', top: '#B5304A', cuff: '#962840', pants: '#3A3A44' },
  { ...CS.CUSTOMER, skin: '#F0C3A2', hair: '#D9B26A', hairStyle: 'long', top: '#4D8DFF', cuff: '#3E74D0', lashes: 1, lips: '#B2524A' },
  { ...CS.CUSTOMER, skin: '#8D5A3C', hair: '#1E1612', top: '#D9A43B', cuff: '#B88A2E', pants: '#4A5578' },
  { ...CS.CUSTOMER, skin: '#E8B48F', hair: '#8A8A88', top: '#8A9A4B', cuff: '#6E7C3A', pants: '#3A3A44', glasses: 1 }];

// ---------- the upright vacuum (product), base at 0, ~420 tall ----------
function vacuum(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  rr(ctx, -90, -40, 180, 40, 14); fillStroke(ctx, '#5A606B', 5); ell(ctx, -60, 0, 18, 18); fillStroke(ctx, '#2A2A2E', 4); ell(ctx, 60, 0, 18, 18); fillStroke(ctx, '#2A2A2E', 4);
  rr(ctx, -55, -300, 110, 260, 30); fillStroke(ctx, HRED, 5); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-40, -280, 18, 220);
  fitTxt(ctx, 'HOOVER', 0, -150, 30, PAL.cream, 96);
  tube(ctx, [[20, -300], [10, -420]], 18, '#8A8F98', 4); tube(ctx, [[-30, -420], [50, -420]], 22, INK, 4);
  ctx.restore();
}
// ---------- a pair of plane tickets (centred), u = fan-out 0..1 ----------
function tickets(ctx, s = 1, u = 1, dest = 'NEW YORK') {
  ctx.save(); ctx.scale(s, s);
  for (const k of [-1, 1]) { ctx.save(); ctx.rotate(k * 0.12 * u); ctx.translate(k * 40 * u, 0);
    CL.cutout(ctx, () => rr(ctx, -200, -90, 400, 180, 14), PAL.cream, { elev: 1.2 });
    ctx.save(); rr(ctx, -200, -90, 400, 50, 14); ctx.clip(); ctx.fillStyle = PAL.blue; ctx.fillRect(-200, -90, 400, 50); ctx.restore();
    txt(ctx, 'AIR TICKET', -60, -54, 28, PAL.cream); fitTxt(ctx, 'LONDON → ' + dest, -10, 10, 30, INK, 320); txt(ctx, 'RETURN · FREE', -10, 56, 26, C.red);
    ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(130, -40); ctx.lineTo(130, 90); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore(); }
  ctx.restore();
}
// ---------- airliner (side, nose to +x, wheels on y = 0, ~1600 long at s = 1) + air stairs at the front door ----------
function airliner(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  const body = '#F4F1E8', stripe = o.stripe || PAL.navy;
  // far wing + tail
  SE.poly(ctx, [[-200, -330], [-20, -470], [60, -470], [-60, -330]], shade(body, -0.12), 5);
  SE.poly(ctx, [[-760, -380], [-820, -640], [-690, -640], [-560, -400]], stripe, 5);
  rr(ctx, -800, -460, 1560, 230, 115); fillStroke(ctx, body, 5);
  ctx.save(); rr(ctx, -800, -460, 1560, 230, 115); ctx.clip(); ctx.fillStyle = stripe; ctx.fillRect(-900, -330, 1800, 26); ctx.fillStyle = C.red; ctx.fillRect(-900, -300, 1800, 10); ctx.restore();
  for (let i = 0; i < 18; i++) { ell(ctx, -560 + i * 60, -380, 13, 16); fillStroke(ctx, '#BFE0FA', 3); }
  // cockpit windows
  SE.poly(ctx, [[640, -410], [700, -400], [690, -370], [630, -375]], '#BFE0FA', 4);
  // door
  rr(ctx, 520, -440, 70, 140, 12); fillStroke(ctx, '#E1DDD2', 4);
  // near wing + engine
  SE.poly(ctx, [[-120, -270], [-320, -120], [-200, -120], [80, -270]], shade(body, -0.05), 5);
  rr(ctx, -280, -210, 200, 80, 40); fillStroke(ctx, '#C9CED6', 5);
  // gear
  for (const x of [-300, 560]) { tube(ctx, [[x, -230], [x, -30]], 16, '#5A606B', 4); ell(ctx, x, -24, 26, 26); fillStroke(ctx, '#2A2A2E', 4); }
  if (o.stairs !== false) { // air stairs to the front door
    ctx.save(); ctx.translate(555, 0);
    SE.poly(ctx, [[-30, -300], [40, -300], [-260, 0], [-330, 0]], '#E9E1CE', 5);
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); for (let i = 1; i < 10; i++) { const u = i / 10; ctx.beginPath(); ctx.moveTo(lerp(-30, -330, u), lerp(-300, 0, u)); ctx.lineTo(lerp(40, -260, u), lerp(-300, 0, u)); ctx.stroke(); }
    tube(ctx, [[-10, -380], [-300, -80]], 10, '#8A8F98', 3.5); tube(ctx, [[-300, -80], [-300, 0]], 10, '#8A8F98', 3.5);
    rr(ctx, -320, -40, 300, 40, 6); fillStroke(ctx, '#5A606B', 4); ell(ctx, -290, 6, 16, 16); fillStroke(ctx, '#2A2A2E', 3); ell(ctx, -60, 6, 16, 16); fillStroke(ctx, '#2A2A2E', 3);
    ctx.restore(); }
  ctx.restore();
}
// a point on the air stairs (u 0 = bottom .. 1 = top door), world, for airliner at (ax, 0) with scale s
const stairPt = (ax, s, u) => [ax + (555 + lerp(-295, 5, u)) * s, lerp(0, -300, u) * s];
// ---------- the airport apron (sky + tarmac), floor y = 0 ----------
function apron(ctx, t, o = {}) {
  SE.sky(ctx, t, { clouds: 3, hills: false, sunX: 900, sunY: -1500 });
  ctx.fillStyle = '#B9C2C9'; ctx.fillRect(-4000, -120, 8000, 120); // terminal strip far away
  for (let i = 0; i < 14; i++) { rr(ctx, -2600 + i * 380, -260, 300, 140, 6); fillStroke(ctx, '#DCE6EE', 3); }
  ctx.fillStyle = '#8E959E'; ctx.fillRect(-4000, 0, 8000, 2000); ctx.fillStyle = '#E9D36A'; for (let x = -4000; x < 4000; x += 300) ctx.fillRect(x, 220, 160, 12);
}
// ---------- the ad poster (centred, 700 x 900). o.flip 0..1 swaps the sizes of the vacuum and the plane (the twist) ----------
function poster(ctx, o = {}) {
  const w = 700, h = 900, f = o.flip || 0;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 14), '#FFF7E6', { elev: 2 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, 170, 14); ctx.clip(); ctx.fillStyle = HRED; ctx.fillRect(-w / 2, -h / 2, w, 170); ctx.restore();
  fitTxt(ctx, o.title || 'BUY HOOVER · SPEND £100', 0, -h / 2 + 80, 50, PAL.cream, w - 60); fitTxt(ctx, o.sub || 'GET 2 FREE FLIGHTS!', 0, -h / 2 + 140, 44, C.yellow, w - 60);
  const vs = lerp(1.15, 0.35, E.inOut(f)), ps = lerp(0.18, 0.4, E.inOut(f));
  ctx.save(); ctx.translate(lerp(-120, -230, E.inOut(f)), 330); vacuum(ctx, vs); ctx.restore();
  ctx.save(); ctx.translate(lerp(170, 60, E.inOut(f)), lerp(-60, 60, E.inOut(f))); ctx.rotate(-0.12); airliner(ctx, ps, { stairs: false }); ctx.restore();
  if (o.dest) o.dest.forEach((d, i) => label(ctx, d[0], 0, 250 + i * 0, d[1], { size: 40 }));
}
const label = ST.label;
// ---------- balance scale (pivot at 0); tilt + = right pan down ----------
function balance(ctx, tilt, left, right) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 14); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 520); ctx.stroke(); ctx.strokeStyle = '#C9A06A'; ctx.lineWidth = px(ctx, 8); ctx.stroke();
  rr(ctx, -150, 510, 300, 40, 12); fillStroke(ctx, '#C9A06A', 5);
  const a = tilt * 0.28; ctx.save(); ctx.rotate(a); rr(ctx, -380, -14, 760, 28, 14); fillStroke(ctx, '#C9A06A', 5);
  for (const [sx, draw] of [[-1, left], [1, right]]) { ctx.save(); ctx.translate(sx * 360, 0); ctx.rotate(-a);
    ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-120, 220); ctx.moveTo(0, 0); ctx.lineTo(120, 220); ctx.stroke();
    ell(ctx, 0, 226, 150, 30); fillStroke(ctx, '#D8D2C2', 5); ctx.save(); ctx.translate(0, 216); draw(ctx); ctx.restore(); ctx.restore(); }
  ctx.restore(); ell(ctx, 0, 0, 24, 24); fillStroke(ctx, C.red, 5); ctx.restore();
}
// ---------- envelope (claim form), centred ----------
function envelope(ctx, s = 1, seed = 0) {
  ctx.save(); ctx.scale(s, s); ctx.rotate((hash(seed) - 0.5) * 0.3);
  rr(ctx, -110, -70, 220, 140, 8); fillStroke(ctx, '#F4EEDF', 4); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-110, -70); ctx.lineTo(0, 10); ctx.lineTo(110, -70); ctx.stroke();
  ctx.fillStyle = C.red; ctx.fillRect(60, -56, 36, 26); ctx.restore();
}
// ---------- desk phone (centred on the desk top), ringing r 0..1 ----------
function deskPhone(ctx, r = 0, t = 0) {
  const j = r ? Math.sin(t * 60) * 4 * r : 0; ctx.save(); ctx.translate(j, 0);
  rr(ctx, -70, -50, 140, 50, 12); fillStroke(ctx, '#3A3A40', 4); rr(ctx, -80, -78, 160, 30, 14); fillStroke(ctx, '#2A2A30', 4);
  if (r) { ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(sx * 30, -60, 70 + k * 28, sx < 0 ? Math.PI * 1.1 : -0.45, sx < 0 ? Math.PI * 1.45 : -0.1); ctx.stroke(); } }
  ctx.restore();
}
// ---------- the travel-agency office (floor y = 0): wall posters of destinations ----------
function agency(ctx, t) {
  SE.room(ctx, t, { wall: '#DCE6EE', floor: 'carpet', carpet: '#5E6E8E', window: 700 });
  for (const [x, s1, col] of [[-650, 'NEW YORK', PAL.navy], [-250, 'ORLANDO', '#26A69A'], [150, 'PARIS', C.red]]) { ctx.save(); ctx.translate(x, -900); CL.cutout(ctx, () => rr(ctx, -150, -200, 300, 400, 10), col, { elev: 1 }); fitTxt(ctx, s1, 0, 150, 48, PAL.cream, 260); SE.cloud(ctx, 0, -60, 0.5); ctx.restore(); }
}
// ---------- the shareholders' meeting (floor y = 0): stage, lectern, banner, rows of seats seen from behind ----------
function meeting(ctx, t) {
  SE.room(ctx, t, { wall: '#E8DCC4', floor: 'carpet', carpet: '#7A3A3A' });
  CL.cutout(ctx, () => rr(ctx, -700, -1260, 1400, 170, 14), PAL.navy, { elev: 1.2 }); fitTxt(ctx, 'MAYTAG · ANNUAL MEETING', 0, -1150, 64, PAL.cream, 1300);
  fitTxt(ctx, 'NEWTON, IOWA', 0, -1050, 40, INK, 600);
  rr(ctx, -900, -260, 1800, 260, 10); fillStroke(ctx, '#8A5A34', 5); // stage
}
function lectern(ctx) { SE.poly(ctx, [[-90, 0], [90, 0], [110, -330], [-110, -330]], '#6A4024', 5); rr(ctx, -130, -360, 260, 40, 8); fillStroke(ctx, '#8A5A34', 5); tube(ctx, [[60, -360], [100, -440]], 6, '#2A2A30', 3); }
// ---------- office door with a name plate (struck out with st 0..1) ----------
function door(ctx, title, st = 0) {
  rr(ctx, -170, -640, 340, 640, 8); fillStroke(ctx, '#B98A5A', 5); rr(ctx, -130, -600, 260, 250, 6); fillStroke(ctx, '#A57A4E', 4); ell(ctx, 120, -300, 14, 14); fillStroke(ctx, C.yellow, 3);
  CL.cutout(ctx, () => rr(ctx, -140, -470, 280, 70, 8), '#E8E2D0', { elev: 0.6, tex: 0 }); fitTxt(ctx, title, 0, -424, 28, INK, 250);
  if (st > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-130, -445); ctx.lineTo(-130 + 260 * clamp(st), -440); ctx.stroke(); }
}
// ---------- the office building of Hoover Europe (floor y = 0, centred) ----------
function building(ctx, sold = 0) {
  rr(ctx, -520, -900, 1040, 900, 8); fillStroke(ctx, '#E8DCC4', 5);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { rr(ctx, -440 + c * 180, -820 + r * 170, 120, 110, 6); fillStroke(ctx, '#BFE0FA', 4); }
  CL.cutout(ctx, () => rr(ctx, -330, -1010, 660, 120, 10), HRED, { elev: 1 }); fitTxt(ctx, 'HOOVER EUROPE', 0, -930, 64, PAL.cream, 600);
  rr(ctx, -110, -200, 220, 200, 6); fillStroke(ctx, '#8A5A34', 5);
  if (sold > 0) { ctx.save(); ctx.translate(300, -60); ctx.rotate(0.06); ctx.scale(E.back(clamp(sold), 2), E.back(clamp(sold), 2)); tube(ctx, [[0, 60], [0, -260]], 16, '#6A4024', 4); CL.cutout(ctx, () => rr(ctx, -170, -360, 340, 150, 10), C.red, { elev: 1.2 }); txt(ctx, 'SOLD', 0, -260, 84, PAL.cream); ctx.restore(); }
}
// a cardboard box of office things (base at 0)
function officeBox(ctx, s = 1) { ctx.save(); ctx.scale(s, s); CL.cutout(ctx, () => rr(ctx, -110, -130, 220, 130, 6), '#C9A06A', { elev: 1, tex: 0.5 }); rr(ctx, -60, -190, 50, 70, 4); fillStroke(ctx, '#E9E1CE', 3); tube(ctx, [[40, -130], [70, -210]], 10, '#3E9E5A', 3); ctx.restore(); }

module.exports = { CS, CROWD, HRED, vacuum, tickets, airliner, stairPt, apron, poster, balance, envelope, deskPhone, agency, meeting, lectern, door, building, officeBox };
