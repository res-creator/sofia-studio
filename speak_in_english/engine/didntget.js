// «Я не понял» — как сказать от A1 до C2 (rubric answers4, but SIX level options A1..C2), hard_cut camera: node didntget.js start end out.mp4 | --png=f1,f2
// A London terraced house: the heroine (pink jumper) in her open front door; a fast-talking courier (Callum) on the doorstep with a parcel
// that has her name on it; his van at the kerb says «FAST DELIVERY. FASTER TALKING.» (the absurd detail).
// Running prop: the parcel. A1/A2/B1 — each time she fails he carries it one step closer to the van; B2 — "Over your head? Here, catch!" he lobs
// it over her head onto the porch canopy; C1 — in slow motion (snail) he fetches it back; C2 — the van gets a bow ("adopt your van"), he sighs
// "My mum says I talk like a microwave" (microwave DING over his head), she gets the parcel: PAID.
// A2 is the labelled typical mistake: both of their lines are crossed out in red («ОШИБКА»), the tip plate shows "Sorry, I don't understand."
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/didntget/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
SP.hook_c.fs = 48; SP.hook_c.ru = 'Такдорогаяшестьфунтов- пошлинакартойилиналичными- распишитесьага?';
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => { const s2 = sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05, hold: 0.05 } : sp; _bub(ctx, s2, t, an, side, name); wrongMark(ctx, s2, t, an, side); }; }

// ---------------- cast
const HER = { ...BASE.her_lift };
const COU = { ...BASE.dan, cap: { col: '#2E9A8A', text: 'FD', textCol: '#FFFFFF' },
  top: { type: 'polo', col: '#2E9A8A', col2: '#F2C14E', text: 'FAST', textSize: 40, textCol: '#FFFFFF' }, bottom: { type: 'trousers', col: '#3A4250' } };
const G = { her: geom(HER), cou: geom(COU) };
const HERX = -140;
const CX = { start: 380, s1: 660, s2: 940, s3: 1200, grab: 300 };   // courier positions: doorstep, three steps toward the van, back at the door (C1)
const CANX = 60, CANY = -1700;                                       // porch canopy top surface; the parcel lands at CANX
const BOXS = 1.5, BHW = 90 * BOXS, BHH = 70 * BOXS;
const VX0 = 1300, VX1 = 2620, VY = -40;                              // the van: rear doors at VX0 (facing the house), cab at VX1
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// the parcel: kraft box, tape, a big white label with her name; (0,0) = centre
function parcel(c, x, y, rot = 0, paid = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(BOXS, BOXS);
  c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -86, 62, 172, 18, 9); c.fill();
  paint(c, q => { q.m(-90, -70); q.l(90, -70); q.l(90, 70); q.l(-90, 70); q.z(); }, '#C99A64', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-12, -70, 24, 140);
  c.fillStyle = '#FFFDF8'; c.strokeStyle = '#8A6A44'; c.lineWidth = 3; rr(c, -72, -46, 144, 92, 10); c.fill(); c.stroke();
  fitTxt(c, 'JESS', 0, -14, 50, '#EE5E9A', 124); c.fillStyle = '#5A5F6E'; c.fillRect(-52, 16, 104, 6); c.fillRect(-52, 30, 70, 6);
  if (paid > 0) { const k = eBack(clamp(paid), 2.4); c.save(); c.translate(40, 50); c.rotate(-0.2); c.scale(k * 0.8, k * 0.8); c.strokeStyle = '#2E9A5A'; c.lineWidth = 7; rr(c, -60, -24, 120, 48, 10); c.stroke(); fitTxt(c, 'PAID', 0, 2, 40, '#2E9A5A', 104); c.restore(); }
  c.restore(); }
function qmark(c, x, y, s, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s * k, s * k); UI.font(c, 'Unb9', 110); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '?', 0, 0, '#F2C14E', C.oliveD, 14); c.restore(); }
// snail (slow motion), replay arrow, microwave — canvas paths only
function snail(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => { q.m(-120, 0); q.q(-130, -30, -90, -36); q.l(90, -36); q.q(130, -40, 140, -90); q.q(150, -110, 160, -90); q.q(160, -40, 120, 0); q.z(); }, '#9FD27A', { sd: 3, hd: 1, lw: 4 });
  c.strokeStyle = '#4E7A30'; c.lineWidth = 5; c.lineCap = 'round'; for (const dx of [138, 152]) { c.beginPath(); c.moveTo(dx, -92); c.lineTo(dx + (dx - 145) * 2, -140); c.stroke(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(dx + (dx - 145) * 2, -144, 7, 0, TAU); c.fill(); }
  c.fillStyle = '#E9A23B'; c.strokeStyle = '#9C6238'; c.lineWidth = 6; c.beginPath(); c.arc(0, -90, 80, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); for (let a = 0; a < 5 * Math.PI; a += 0.2) { const r = 70 * (1 - a / (5.4 * Math.PI)); c.lineTo(Math.cos(a) * r, -90 + Math.sin(a) * r); } c.stroke(); c.restore(); }
function replayIcon(c, x, y, s, rot) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(255,253,248,.95)'; c.strokeStyle = C.oliveD; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 90, 0, TAU); c.fill(); c.stroke();
  c.rotate(rot); c.strokeStyle = '#E27D3C'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 50, 0.5, TAU - 0.3); c.stroke();
  c.fillStyle = '#E27D3C'; c.beginPath(); c.moveTo(52, -38); c.lineTo(78, 8); c.lineTo(26, 6); c.closePath(); c.fill(); c.restore(); }
function microwave(c, x, y, s, glow) { c.save(); c.translate(x, y); c.scale(s, s);
  if (glow > 0) { c.save(); c.globalAlpha = glow; c.strokeStyle = '#F2C14E'; c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 150, Math.sin(a) * 120); c.lineTo(Math.cos(a) * 200, Math.sin(a) * 160); c.stroke(); } c.restore(); }
  paint(c, q => { q.m(-130, -80); q.l(130, -80); q.l(130, 80); q.l(-130, 80); q.z(); }, '#E9EDF1', { sd: 4, hd: 2, lw: 5 });
  c.fillStyle = glow > 0 ? '#FFE9A0' : '#3A4050'; rr(c, -110, -60, 160, 120, 12); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#2B2F3A'; rr(c, 70, -60, 44, 30, 6); c.fill(); for (const yy of [0, 36]) { c.beginPath(); c.arc(92, yy, 12, 0, TAU); c.fill(); } c.restore(); }
function bow(c, x, y, s) { if (s <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#EE5E9A'; c.strokeStyle = '#C23C76'; c.lineWidth = 6;
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sd * 170, -150, sd * 190, 0); c.quadraticCurveTo(sd * 170, 120, 0, 0); c.fill(); c.stroke(); }
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, 10); c.lineTo(sd * 90, 150); c.lineTo(sd * 40, 150); c.closePath(); c.fill(); c.stroke(); }
  c.beginPath(); c.arc(0, 0, 40, 0, TAU); c.fill(); c.stroke(); c.restore(); }
function heart(c, x, y, s, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -40, -60, 0, -30); c.bezierCurveTo(40, -60, 60, -10, 0, 30); c.fill(); c.restore(); }

// ---------------- the street (prerendered, softly blurred): her house (brick, white sash windows, blue door, porch canopy) + the next houses
const BX0 = -2800, BY0 = -5200, BW = 6800, BH = 6600, BS = 0.5;
function sash(c, x, y, w, h) { c.fillStyle = '#FFFDF8'; c.fillRect(x - 24, y - 24, w + 48, h + 48); c.fillStyle = '#9CC4DE'; c.fillRect(x, y, w, h); c.fillStyle = '#FFFDF8'; c.fillRect(x, y + h / 2 - 8, w, 16); c.fillRect(x + w / 2 - 6, y, 12, h);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x + 20, y); c.lineTo(x + 90, y); c.lineTo(x + 20, y + 120); c.fill(); c.fillStyle = '#E9E2D2'; c.fillRect(x - 40, y + h + 24, w + 80, 30); }
function brick(c, x0, x1, y0, y1, col) { c.fillStyle = col; c.fillRect(x0, y0, x1 - x0, y1 - y0); c.fillStyle = 'rgba(255,255,255,.10)';
  for (let y = y0, r = 0; y < y1; y += 70, r++) { c.fillRect(x0, y, x1 - x0, 6); for (let x = x0 + (r % 2) * 80; x < x1; x += 160) c.fillRect(x, y, 6, 70); } }
function drawStreet(c) {
  const g = c.createLinearGradient(0, BY0, 0, -2600); g.addColorStop(0, '#9CCBEA'); g.addColorStop(1, '#DDEEF7'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, y, s] of [[-1800, -4300, 1.1], [600, -4600, 0.9], [2600, -4100, 1.2]]) for (const [dx, dy, r] of [[0, 0, 150], [150, -40, 180], [320, 10, 140], [160, 50, 160]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); }
  // neighbours on the right (cream render), further along the terrace
  c.fillStyle = '#EFE6D2'; c.fillRect(420, -3300, BX0 + BW - 420, 3300); c.fillStyle = '#8A4A3A'; c.fillRect(420, -3420, BX0 + BW - 420, 140);
  for (const x of [700, 1500, 2300, 3100]) { sash(c, x, -3000, 420, 560); sash(c, x, -2050, 420, 560); }
  for (const x of [1200, 2800]) { c.fillStyle = '#2F5A48'; c.fillRect(x, -1650, 300, 1650); }
  // her house (red brick), chimney, upstairs windows, bay window left of the door
  brick(c, BX0, 380, -3500, 0, '#B85A44'); c.fillStyle = '#7A3A2E'; c.fillRect(BX0, -3620, 380 - BX0, 140); c.fillStyle = '#9A4A3A'; c.fillRect(-1300, -4100, 260, 520);
  for (const x of [-2400, -1500, -560]) sash(c, x, -3050, 440, 600);
  sash(c, -1500, -1450, 620, 800); sash(c, -2500, -1450, 620, 800);
  // door: frame, open blue door swung inside, dark hallway with a coat hook
  const dx0 = HERX - 300, dx1 = HERX + 300; c.fillStyle = '#FFFDF8'; c.fillRect(dx0 - 50, -1660, dx1 - dx0 + 100, 1660); c.fillStyle = '#4A3A34'; c.fillRect(dx0, -1620, dx1 - dx0, 1620);
  c.fillStyle = '#6A5448'; c.fillRect(dx0, -1620, dx1 - dx0, 70); c.fillStyle = '#5A4840'; for (let y = -400; y < 0; y += 100) c.fillRect(dx0, y, dx1 - dx0, 8);
  c.fillStyle = '#3C6FB4'; c.beginPath(); c.moveTo(dx0, -1620); c.lineTo(dx0 + 150, -1580); c.lineTo(dx0 + 150, -40); c.lineTo(dx0, 0); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(dx0 + 120, -800, 14, 0, TAU); c.fill();
  c.fillStyle = '#FFFDF8'; c.font = '700 70px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#F2C14E'; c.fillText('12', HERX + 420, -1250);
  // porch canopy on two brackets
  c.fillStyle = '#E9E2D2'; c.fillRect(HERX - 420, CANY, 840, 70); c.fillStyle = '#C9C0AE'; c.fillRect(HERX - 420, CANY + 70, 840, 14);
  for (const s of [-1, 1]) { c.fillStyle = '#E9E2D2'; c.beginPath(); c.moveTo(HERX + s * 390, CANY + 80); c.lineTo(HERX + s * 390, CANY + 260); c.lineTo(HERX + s * 330, CANY + 80); c.fill(); }
  // hanging basket by the door
  c.strokeStyle = '#3A3A3A'; c.lineWidth = 5; c.beginPath(); c.moveTo(HERX - 560, -1500); c.lineTo(HERX - 620, -1260); c.moveTo(HERX - 560, -1500); c.lineTo(HERX - 500, -1260); c.stroke();
  c.fillStyle = '#5A8A3A'; c.beginPath(); c.arc(HERX - 560, -1240, 90, 0, Math.PI); c.fill(); for (let i = 0; i < 7; i++) { c.fillStyle = ['#EE5E9A', '#F2C14E', '#FFFDF8'][i % 3]; c.beginPath(); c.arc(HERX - 640 + i * 27, -1250 + (i % 2) * 20, 18, 0, TAU); c.fill(); }
  // low garden wall + gate between the houses
  c.fillStyle = '#A84E3A'; c.fillRect(380, -330, BX0 + BW - 380, 330); c.fillStyle = '#C9C0AE'; c.fillRect(380, -360, BX0 + BW - 380, 40);
  // pavement (the floor), kerb, road
  c.fillStyle = '#C9C6C0'; c.fillRect(BX0, 0, BW, 260); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 280) c.fillRect(x, 0, 5, 260); c.fillRect(BX0, 130, BW, 4);
  c.fillStyle = '#9A9790'; c.fillRect(BX0, 260, BW, 40); c.fillStyle = '#5E626C'; c.fillRect(BX0, 300, BW, BY0 + BH - 300); c.fillStyle = '#F2C14E'; c.fillRect(BX0, 340, BW, 14); c.fillRect(BX0, 368, BW, 14);
  // a red post box on the pavement (UK)
  c.fillStyle = '#D23A30'; rr(c, 3000, -900, 220, 900, 40); c.fill(); c.fillStyle = '#2B2F3A'; c.fillRect(3040, -700, 140, 22); c.fillStyle = '#B02A22'; rr(c, 2980, -940, 260, 80, 30); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawStreet);

// ---------------- the van (live: bow + headlights wink in C2), rear doors toward the house
function van(c, t, L) { const ad = L === 'o6' ? clamp((t - ev('o6', 'adopt')) / 0.35) : 0, y0 = VY;
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse((VX0 + VX1) / 2, y0, (VX1 - VX0) / 2 + 60, 30, 0, 0, TAU); c.fill();
  c.fillStyle = '#2B2F3A'; for (const wx of [VX0 + 230, VX1 - 230]) { c.beginPath(); c.arc(wx, y0 - 150, 165, Math.PI, TAU); c.fill(); }
  paint(c, q => { q.m(VX0, y0 - 110); q.l(VX0, y0 - 1460); q.q(VX0, y0 - 1520, VX0 + 60, y0 - 1520); q.l(VX1 - 330, y0 - 1520); q.q(VX1 - 250, y0 - 1520, VX1 - 200, y0 - 1400); q.l(VX1 - 60, y0 - 900);
    q.q(VX1, y0 - 860, VX1, y0 - 780); q.l(VX1, y0 - 110); q.l(VX1 - 90, y0 - 110); q.q(VX1 - 100, y0 - 320, VX1 - 230, y0 - 320); q.q(VX1 - 360, y0 - 320, VX1 - 370, y0 - 110); q.l(VX0 + 360, y0 - 110); q.q(VX0 + 350, y0 - 320, VX0 + 230, y0 - 320); q.q(VX0 + 100, y0 - 320, VX0 + 90, y0 - 110); q.z(); }, '#FFFDF8', { sd: 10, hd: 5, lw: 5 });
  c.fillStyle = '#2E9A8A'; c.fillRect(VX0 + 4, y0 - 520, VX1 - VX0 - 8, 90);   // teal stripe
  // slogan (the absurd detail)
  fitTxt(c, 'FAST DELIVERY.', VX0 + 440, y0 - 1240, 150, '#2E9A8A', 760); fitTxt(c, 'FASTER TALKING.', VX0 + 440, y0 - 1020, 150, '#EE5E9A', 760);
  // cab window + door line, rear door seam
  paint(c, q => { q.m(VX1 - 320, y0 - 1440); q.l(VX1 - 230, y0 - 1440); q.l(VX1 - 110, y0 - 920); q.l(VX1 - 320, y0 - 920); q.z(); }, '#8EC2DE', { sd: 3, hd: 1, lw: 4 });
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 5; c.beginPath(); c.moveTo(VX1 - 360, y0 - 1460); c.lineTo(VX1 - 360, y0 - 330); c.moveTo(VX0 + 40, y0 - 1460); c.lineTo(VX0 + 40, y0 - 330); c.stroke();
  // headlight (winks at her in C2) + a wing mirror
  const wink = ad > 0 && (t - ev('o6', 'adopt')) % 1.2 > 0.95 ? 0.15 : 1;
  c.fillStyle = ad > 0 ? '#FFF2A0' : '#F7F2D8'; c.strokeStyle = '#B8A060'; c.lineWidth = 5; c.beginPath(); c.ellipse(VX1 - 40, y0 - 640, 34, 60 * wink, 0, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = '#E0474C'; rr(c, VX0 - 10, y0 - 700, 40, 140, 10); c.fill();
  for (const wx of [VX0 + 230, VX1 - 230]) { c.fillStyle = '#22252E'; c.beginPath(); c.arc(wx, y0 - 150, 140, 0, TAU); c.fill(); c.fillStyle = '#C9D2DA'; c.beginPath(); c.arc(wx, y0 - 150, 70, 0, TAU); c.fill(); }
  if (ad > 0) { bow(c, VX0 + 440, y0 - 1530, eBack(ad, 2)); for (let i = 0; i < 4; i++) { const u = ((t - ev('o6', 'adopt')) * 0.7 + i * 0.25) % 1; heart(c, VX0 + 300 + i * 200, y0 - 1650 - u * 500, 1.6, ad * (1 - u)); } }
  K.mark(c, 'van', VX0 + 440, y0 - 1130, 450); }

// ---------------- the parcel's path (world coords; centre) and who holds it
const holdC = cx => ({ x: cx - 70, y: -950 });
function courierX(t, L) {
  const walk = (a, b, t0, d) => lerp(a, b, eIO(clamp((t - t0) / d)));
  if (L === 'hook') return CX.start;
  if (L === 'o1') return walk(CX.start, CX.s1, ev('o1', 'step'), 0.55);
  if (L === 'o2') return walk(CX.s1, CX.s2, ev('o2', 'step'), 0.55);
  if (L === 'o3') return walk(CX.s2, CX.s3, ev('o3', 'step'), 0.55);
  if (L === 'o4') return CX.s3;
  if (L === 'o5') return lerp(CX.s3, CX.grab, clamp((t - ev('o5', 'walk')) / (ev('o5', 'grab') - ev('o5', 'walk') - 0.2)));   // slow-motion walk (linear, snail pace)
  return CX.grab; }
const walking = (t, L) => { for (const k of ['o1', 'o2', 'o3']) if (L === k) { const s = ev(k, 'step'); return t > s && t < s + 0.55; } return L === 'o5' && t > ev('o5', 'walk') && t < ev('o5', 'grab') - 0.2; };
// returns { x, y, rot, by: 'cou' | 'her' | 'air' | 'canopy', paid }
function parcelAt(t, L) { const cx = courierX(t, L);
  if (L === 'o4') { const lf = ev('o4', 'lift'), th = ev('o4', 'throw'), ld = ev('o4', 'land'); const top = { x: cx + 250, y: -1600 }, h0 = holdC(cx);
    if (t < lf) return { ...h0, rot: 0, by: 'cou' };
    if (t < th) { const k = eOut(clamp((t - lf) / 0.35)); return { x: lerp(h0.x, top.x, k), y: lerp(h0.y, top.y, k), rot: 0, by: 'cou', up: k }; }
    if (t < ld) { const u = (t - th) / (ld - th), x = lerp(top.x, CANX, u), y = lerp(top.y, CANY - BHH, u) - Math.sin(Math.PI * u) * 700; return { x, y, rot: -u * TAU * 1.0, by: 'air' }; }
    return { x: CANX, y: CANY - BHH, rot: 0, by: 'canopy' }; }
  if (L === 'o5') { const gr = ev('o5', 'grab'), gv = ev('o5', 'give'), top = { x: CANX, y: CANY - BHH };
    if (t < gr + 0.25) return { ...top, rot: 0, by: 'canopy' };
    const h0 = holdC(cx), off = { x: HERX + 230, y: -900 };
    if (t < gv) { const k = eIO(clamp((t - gr - 0.25) / 0.6)); return { x: lerp(top.x, h0.x, k), y: lerp(top.y, h0.y, k), rot: 0, by: 'cou', up: 1 - k }; }
    const k = eIO(clamp((t - gv) / 0.6)); return { x: lerp(h0.x, off.x, k), y: lerp(h0.y, off.y, k), rot: 0, by: 'cou', give: k }; }
  if (L === 'o6') { const off = { x: HERX + 230, y: -900 }, pay = ev('o6', 'pay'), her = { x: HERX + 60, y: -880 };
    if (t < pay) return { ...off, rot: 0, by: 'cou', give: 1 };
    const k = eIO(clamp((t - pay) / 0.45)); return { x: lerp(off.x, her.x, k), y: lerp(off.y, her.y, k), rot: 0, by: k > 0.5 ? 'her' : 'cou', give: 1, paid: clamp((t - pay - 0.3) / 0.25) }; }
  return { ...holdC(cx), rot: 0, by: 'cou' }; }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const cardItem = ctx => { ctx.save(); ctx.translate(0, 20); ctx.rotate(-0.3); ctx.fillStyle = '#3C6FB4'; ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 3; rr(ctx, -50, -32, 100, 64, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#F2C14E'; ctx.fillRect(-34, -12, 24, 18); ctx.restore(); };
function holdBox(st, g, px, cx, py) { const lx = px.x - cx, ly = px.y - 0; st.armL = reach(g, -1, lx - BHW * 0.95, ly + 30, { planar: true }); st.armR = reach(g, 1, lx + BHW * 0.95, ly + 30, { planar: true }); }
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'worried', turn: 0.2, look: 0.6 };
  if (L === 'hook') { st.mood = 'surprised'; st.blink = 0; if (t > hev('nar') - 0.1) { st.mood = 'worried'; st.tilt = 0.08; st.armL = open(g, -1, 1.6, 120); st.armR = open(g, 1, 1.6, 120); } }
  if (L === 'o1') { st.mood = 'annoyed';
    if (speaking('o1_h', t, 0.05, 0.1)) { const u = t - SP.o1_h.t; st.armL = open(g, -1, 1.8 + 0.1 * Math.sin(u * 6), 80); st.armR = open(g, 1, 1.8 + 0.1 * Math.sin(u * 6 + 1), 80); st.headY = Math.abs(Math.sin(u * 5)) * 6; }
    if (t > e('loud')) { st.mood = 'shock'; st.blink = 1; st.tilt = -0.12; st.breathe = 0; st.headY = 0; st.armL = open(g, -1, 1.4, 260); st.armR = open(g, 1, 1.4, 260); }
    if (t > endOf('o1_c') + 0.15) { st.mood = 'tired'; st.blink = 1; st.tilt = 0; } }
  if (L === 'o2') { st.mood = 'worried';
    if (speaking('o2_h', t, 0.05, 0.1)) { st.tilt = 0.06; st.armL = open(g, -1, 1.5, 200); st.armR = open(g, 1, 1.5, 200); }
    if (t > e('stare')) { st.mood = 'skeptical'; st.look = 0.9; st.lookY = 0.25; st.tilt = 0.05; } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.05, 0.1)) { gest(st, g, 'her', t, 1, 150); }
    if (t > SP.o3_c.t + 0.3) { st.mood = 'bored'; }
    if (t > e('blink')) { st.mood = 'tired'; st.blink = 1; } }
  if (L === 'o4') { st.mood = 'worried';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.tilt = -0.06; st.armL = open(g, -1, 1.5, 160); }
    if (t > e('throw') + 0.2) { st.mood = 'shock'; st.blink = 0; st.headY = 70 * eOut(clamp((t - e('throw') - 0.2) / 0.2)) * (1 - clamp((t - e('land') - 0.1) / 0.3)); st.armL = open(g, -1, 1.9, 40); st.armR = open(g, 1, 1.9, 40); }
    if (t > e('look')) { st.mood = 'annoyed'; st.lookY = -0.7; st.look = 0.3; st.turn = 0.1; st.armL = down(g, -1); st.armR = down(g, 1); } }
  if (L === 'o5') { st.mood = 'neutral'; st.turn = 0.25; st.look = 0.7;
    if (speaking('o5_h', t, 0.05, 0.1)) { gest(st, g, 'her', t, 1, 160); st.mood = 'happy'; }
    if (t > ev('o5', 'grab')) { st.mood = 'surprised'; }
    if (t > ev('o5', 'smile')) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'o6') { st.mood = 'smug'; st.turn = 0.25; st.look = 0.7;
    if (speaking('o6_h', t, 0.05, 0.1)) { st.mood = 'happy'; const u = (t - SP.o6_h.t) * 3; st.armR = reach(g, 1, g.sw * (1.5 + 0.15 * Math.sin(u)), g.ySh + 170 + Math.cos(u) * 25, { planar: true }); st.items = { R: cardItem }; }
    if (t > ev('o6', 'beat')) { st.mood = 'smug'; st.blink = 1; st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 200, { planar: true }); st.items = { R: cardItem }; }
    if (t > SP.o6_c.t + 0.6) { st.blink = 0; st.mood = 'surprised'; }
    if (t > ev('o6', 'ding')) { st.mood = 'happy'; st.laugh = true; } }
  const p = parcelAt(t, L); if (p.by === 'her') { holdBox(st, g, p, HERX, 0); st.items = {}; st.mood = 'happy'; st.laugh = t < ev('o6', 'moral') + 0.6; st.blink = 0; }
  return st; }
function couState(t, L) { const g = G.cou, e = k => ev(L, k), st = { ...base(g, t, 'courier2'), mood: 'happy', turn: -0.3, look: -0.75 };
  const p = parcelAt(t, L);
  if (L === 'hook') { const u = t * 9; st.headY = Math.sin(u) * 4; st.mood = 'happy'; }
  if (L === 'o1' && speaking('o1_c', t, 0.05, 0.05)) { st.mood = 'angry'; st.headY = -10; st.tilt = -0.05 + 0.03 * Math.sin(t * 30); }
  if (L === 'o2') { if (t > e('stare')) { st.mood = 'worried'; st.lookY = 0.4; st.look = -0.5; } }
  if (L === 'o3' && speaking('o3_c', t, 0.05, 0.05)) { st.mood = 'smug'; }
  if (L === 'o4') { st.mood = 'happy'; if (t > e('throw')) { st.mood = 'smug'; st.armL = open(g, -1, 1.8, -260); st.armR = open(g, 1, 1.4, -200); } if (t > e('land')) { st.mood = 'happy'; st.laugh = true; st.armL = open(g, -1, 1.7, 60); st.armR = open(g, 1, 1.7, 60); } }
  if (L === 'o5') { st.mood = 'happy'; st.blink = 0; }
  if (L === 'o6') { st.mood = 'neutral'; if (speaking('o6_h', t, 0, 0)) { st.mood = t > ev('o6', 'adopt') ? 'shock' : 'surprised'; st.blink = 0; }
    if (t > ev('o6', 'beat')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.o6_c.t - 0.1) { st.mood = 'sad'; st.blink = 1; st.tilt = 0.08; st.headY = 12; }
    if (t > ev('o6', 'ding')) { st.mood = 'happy'; st.blink = 0; st.tilt = 0; st.headY = 0; } }
  if (p.by === 'cou' && L === 'o4' && p.up > 0) { const lx = p.x - courierX(t, L); st.armR = reach(g, 1, lerp(g.sw * 0.9, lx, p.up), lerp(-900, p.y + BHH + 10, p.up), { planar: true }); st.armL = open(g, -1, 1.5, 120); st.mood = 'smug'; }
  else if (p.by === 'cou') holdBox(st, g, p, courierX(t, L), 0);
  else if (!(L === 'o4' && t > e('throw'))) { st.armL = down(g, -1); st.armR = down(g, 1); }
  if (L === 'o6' && p.by === 'her') { st.armL = open(g, -1, 1.6, 100); st.armR = open(g, 1, 1.6, 100); st.mood = 'happy'; }
  if (walking(t, L)) { st.legPose = 'walk'; st.turn = 0.35; st.look = 0.8; if (L === 'o5') { st.t = t * 0.35; st.turn = -0.3; st.look = -0.8; } }
  return st; }

// ---------------- world
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
const DRAW = { wide: ['her', 'cou'], her: ['her'], cou: ['cou'], two: ['her', 'cou'], canopy: ['her'], van: ['her', 'cou'] };
function wind(c, t, L) { if (L !== 'o1') return; const a = ev('o1', 'loud'), b = endOf('o1_c'); if (t < a || t > b + 0.1) return; const k = clamp((t - a) / 0.1) * clamp((b + 0.1 - t) / 0.2);
  c.save(); c.globalAlpha = k * 0.85; c.strokeStyle = '#FFFDF8'; c.lineWidth = 14; c.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const u = ((t - a) * 2.2 + i / 6) % 1, x = lerp(CX.start - 260, HERX + 60, u), y = -1350 + (i - 2.5) * 90; c.beginPath(); c.moveTo(x + 160, y); c.quadraticCurveTo(x + 80, y - 20, x, y + 6); c.stroke(); } c.restore(); }
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'cou'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); van(c, t, L);
  const p = parcelAt(t, L);
  if (p.by === 'canopy') parcel(c, p.x, p.y, p.rot);
  if (who.includes('cou')) heads.courier2 = K.put(c, COU, couState(t, L), courierX(t, L), 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HERX, 0);
  if (p.by === 'air' || (p.by === 'cou' && heads.courier2) || (p.by === 'her' && heads.her)) parcel(c, p.x, p.y, p.rot, p.paid || 0);
  K.mark(c, 'parcel', p.x, p.y, 140);
  wind(c, t, L);
  if (!heads.her) heads.her = OFFL; if (!heads.courier2) heads.courier2 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const TWO = cx => { const z = Math.min(0.72, 1080 / (cx - HERX + 760)); return S((HERX + cx) / 2, fy(HY('her'), z, 760), z, 'two'); };
const SH = { WIDE: S(1060, -1950, 0.38, 'wide'), COVER: S(150, -1769, 0.52, 'wide'),
  HER: S(HERX + 30, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(HERX + 20, fy(HY('her'), 1.0, 1050), 1.0, 'her'),
  COU: x => S(x - 30, fy(HY('cou'), 1.0), 1.0, 'cou'), COU_CU: x => S(x - 20, fy(HY('cou'), 1.3, 980), 1.3, 'cou'),
  VAN: S(VX0 + 520, fy(VY - 1130, 0.62, 760), 0.62, 'van'), CANOPY: S(HERX + 120, fy(CANY, 0.78, 560), 0.78, 'canopy') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k), cx = courierX(t, L); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.05) return SH.COVER; if (t < hev('van') - 0.02) return f(SH.HER_R); return f(SH.VAN); }
  const pre = (id) => SP[id].t - 0.1;
  if (L === 'o1') { if (t < pre('o1_h')) return f(SH.WIDE); if (t < pre('o1_c')) return f(SH.HER); if (t < e('step') - 0.02) return f(SH.COU_CU(CX.start)); return f(SH.WIDE); }
  if (L === 'o2') { if (t < pre('o2_h')) return f(SH.WIDE); if (t < pre('o2_c')) return f(SH.HER); if (t < e('stare') - 0.02) return f(SH.COU(CX.s1)); if (t < e('step')) return f(TWO(CX.s1)); return f(SH.WIDE); }
  if (L === 'o3') { if (t < pre('o3_h')) return f(SH.WIDE); if (t < pre('o3_c')) return f(SH.HER); if (t < e('step') - 0.02) return f(SH.COU(CX.s2)); return f(SH.WIDE); }
  if (L === 'o4') { if (t < pre('o4_h')) return f(SH.WIDE); if (t < pre('o4_c')) return f(SH.HER); if (t < e('throw') - 0.05) return f(SH.COU(CX.s3)); if (t < e('look')) return f(SH.WIDE); return f(SH.CANOPY); }
  if (L === 'o5') { if (t < pre('o5_h')) return f(SH.WIDE); if (t < pre('o5_c')) return f(SH.HER); if (t < e('give') - 0.02) return f(SH.WIDE); return f(TWO(CX.grab)); }
  if (L === 'o6') { const ch2 = SP.o6_h.t + 2.38, ch3 = SP.o6_h.t + 4.98;
    if (t < pre('o6_h')) return f(SH.WIDE); if (t < ch2 - 0.05) return f(SH.HER); if (t < ch3 - 0.05) return f(SH.WIDE); if (t < e('beat') + 0.25) return f(SH.HER); if (t < e('pay') - 0.02) return f(SH.COU(CX.grab)); return f(TWO(CX.grab)); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- the A2 mistake marker: red strike-through over the English text + a red «ОШИБКА» badge on the bubble (same geometry as UI.bubble)
const WRONG = { o2_h: () => ev('o2', 'wrong'), o2_c: () => ev('o2', 'wrong2') };
function wrongMark(ctx, sp, t, anchor, side) { const wt = WRONG[sp.id]; if (!wt) return; const t0 = wt(); if (t < t0) return;
  const u = t - sp.t, hold = sp.hold || 0.9, out = P(t, sp.t + sp.d + hold, sp.t + sp.d + hold + 0.2); if (u < -0.05 || out >= 1) return;
  const k = eBack(P(u, -0.05, 0.25), 2.2) * (1 - eIn(out)), maxW = 820, fs = sp.text.length > 60 ? 46 : 58;
  UI.font(ctx, 'Nun9', fs); const lines = UI.wrap(ctx, sp.text, maxW - 80); UI.font(ctx, 'Nun7', 34); const rl = sp.ru ? UI.wrap(ctx, sp.ru, maxW - 80) : [];
  UI.font(ctx, 'Nun9', fs); const lw = lines.map(l => ctx.measureText(l).width); const tw = Math.max(...lw, ...rl.map(l => { UI.font(ctx, 'Nun7', 34); return ctx.measureText(l).width; })) + 80;
  const bh = lines.length * fs * 1.12 + (rl.length ? rl.length * 42 + 22 : 0) + 56;
  let bx = side === 'left' ? Math.max(50, Math.min(anchor.x - 120, W - 150 - tw)) : Math.min(W - 140 - tw, Math.max(50, anchor.x - tw + 140)); bx = Math.max(40, bx);
  const by = clamp(anchor.y - bh - 60, 360, Math.max(360, 1560 - bh));
  const ox = side === 'left' ? bx + 120 : bx + tw - 140, oy = by + bh, s = eOut(P(t, t0, t0 + 0.25));
  ctx.save(); ctx.translate(ox, oy); ctx.scale(k, k); ctx.translate(-ox, -oy);
  ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.lineCap = 'round';
  lines.forEach((l, i) => { const y = by + 30 + i * fs * 1.12 + fs * 0.55; ctx.beginPath(); ctx.moveTo(bx + 34, y); ctx.lineTo(bx + 34 + (lw[i] + 12) * s, y); ctx.stroke(); });
  const bk = eBack(s, 2.4); if (bk > 0) { ctx.save(); ctx.translate(bx + tw - 30, by - 4); ctx.scale(bk, bk); ctx.rotate(0.06); UI.font(ctx, 'Unb9', 34); const nw = ctx.measureText('ОШИБКА').width + 110;
    ctx.fillStyle = C.red; rr(ctx, -nw, -30, nw, 60, 30); ctx.fill(); ctx.strokeStyle = C.oliveD; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = C.white; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-nw + 30, -14); ctx.lineTo(-nw + 58, 14); ctx.moveTo(-nw + 58, -14); ctx.lineTo(-nw + 30, 14); ctx.stroke();
    ctx.fillStyle = C.white; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('ОШИБКА', -nw + 76, 2); ctx.restore(); }
  ctx.restore(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['A1', 'НАЧАЛЬНЫЙ'], o2: ['A2', 'ЭЛЕМЕНТАРНЫЙ'], o3: ['B1', 'СРЕДНИЙ'], o4: ['B2', 'ВЫШЕ СРЕДНЕГО'], o5: ['C1', 'ПРОДВИНУТЫЙ'], o6: ['C2', 'КОРОЛЕВСКИЙ'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e), col = LVCOL[p[0]];
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 230, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 900 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = col; rr(c, -w / 2, -h / 2, 150, h, 50); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 75, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 180, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }
// screen-space icons over the world: snail (C1 slow walk), replay (B1), microwave (C2), question marks
function icons(c, t, L, heads, proj) {
  if (L === 'hook' && t > hev('nar') - 0.05 && t < hev('van') && heads.her.x > -1e4) { const h = proj(heads.her); for (const [dx, d] of [[-150, 0], [0, 0.15], [150, 0.3]]) qmark(c, h.x + dx, h.y - 330 + Math.abs(dx) * 0.3, 1, eBack(P(t, hev('nar') + d, hev('nar') + d + 0.25), 2.4)); }
  if (L === 'o2' && t > ev('o2', 'stare') && t < SP.o2_nar.t) { for (const k of ['her', 'courier2']) { const h = heads[k]; if (Math.abs(h.x) > 1e4) continue; const q = proj({ x: h.x, y: h.y - h.hh * 1.6 }); qmark(c, q.x, q.y, 0.9, eBack(P(t, ev('o2', 'stare') + (k === 'her' ? 0 : 0.12), ev('o2', 'stare') + 0.3), 2.4)); } }
  if (L === 'o3' && t > ev('o3', 'replay') && t < endOf('o3_c') && heads.courier2.x < 1e4) { const k = eBack(P(t, ev('o3', 'replay'), ev('o3', 'replay') + 0.25), 2.2); c.save(); c.globalAlpha = 1; replayIcon(c, 900, 1250, k, -(t - ev('o3', 'replay')) * 3); c.restore(); }
  if (L === 'o5' && t > ev('o5', 'walk') && t < ev('o5', 'give') + 0.4) { const k = eBack(P(t, ev('o5', 'walk'), ev('o5', 'walk') + 0.3), 2) * (1 - P(t, ev('o5', 'give'), ev('o5', 'give') + 0.4)); const q = proj({ x: Math.max(520, courierX(t, L) + 260), y: -360 }); if (k > 0) snail(c, q.x, q.y, 0.8 * k); }
  if (L === 'o6' && t > ev('o6', 'ding') && t < ev('o6', 'pay') + 0.2 && heads.courier2.x < 1e4) { const h = proj({ x: heads.courier2.x, y: heads.courier2.y - heads.courier2.hh * 1.9 }); const k = eBack(P(t, ev('o6', 'ding'), ev('o6', 'ding') + 0.25), 2.2) * (1 - P(t, ev('o6', 'pay'), ev('o6', 'pay') + 0.2)); if (k > 0) microwave(c, h.x, h.y, 0.9 * k, clamp((t - ev('o6', 'ding')) / 0.1)); }
}
// green check next to the tip plate for the corrected A2 form
function tipCheck(c, t) { const sp = SP.o2_tip; if (t < sp.t || t > sp.t + sp.d + 0.25) return; const k = eBack(P(t, sp.t + 0.05, sp.t + 0.3), 2.4); c.save(); UI.font(c, 'Nun9', 74); const tw = c.measureText(sp.text).width; c.translate(Math.max(70, 540 - Math.min(tw, 900) / 2 - 20), 1385); c.scale(k, k);
  c.fillStyle = C.green; c.beginPath(); c.arc(0, 0, 46, 0, TAU); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; c.stroke(); c.strokeStyle = C.white; c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(-20, 2); c.lineTo(-5, 18); c.lineTo(22, -16); c.stroke(); c.restore(); }

// ---------------- end screen: question + A1..C2, СОХРАНИ, ПОДПИСАТЬСЯ (cursor); then the comment question big
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine with her parcel + the courier (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.cou; K.put(c, COU, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: {}, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6 + 1) * 15, { planar: true }) }, 640, 0);
    const st = { t, mood: 'happy', laugh: true, turn: 0, look: 0, items: {} }; holdBox(st, g, { x: 0, y: -900 }, 0, 0); K.put(c, HER, st, 0, 0); parcel(c, 0, -900, 0, 1); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const askOn = t > ask.t - 0.1, q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - P(t, ask.t - 0.15, ask.t - 0.02));
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  if (askOn) { const a = eBack(P(t, ask.t - 0.05, ask.t + 0.25), 2.2); c.save(); c.translate(540, 290); c.scale(a, a); c.rotate(-0.03); textFit(c, 'Unb9', 74, 'КАКОЙ УРОВЕНЬ', 900); strokeText(c, 'КАКОЙ УРОВЕНЬ', 0, -70, C.oliveD, C.white, 16); textFit(c, 'Unb9', 92, 'ТВОЙ?', 900); strokeText(c, 'ТВОЙ?', 0, 30, C.pink, C.white, 16); c.restore(); }
  const LBL = { o1: 'НАЧАЛЬНЫЙ', o2: 'ЭЛЕМЕНТ.', o3: 'СРЕДНИЙ', o4: 'ВЫШЕ СРЕД.', o5: 'ПРОДВИН.', o6: 'КОРОЛЕВ.' };
  ['o1', 'o2', 'o3', 'o4', 'o5', 'o6'].forEach((id, i) => { const lv = PLATES[id][0], t0 = wAt('outro', lv.toLowerCase(), sp.t + 1.25 + i * 0.75), kk = eBack(P(t, t0 - 0.1, t0 + 0.2), 2.2); if (kk <= 0) return;
    const x = 210 + (i % 3) * 330, y = 600 + Math.floor(i / 3) * 190, bump = 1 + 0.06 * Math.sin(clamp((t - t0) / 0.4) * Math.PI) + (askOn && (lv === 'A1' || lv === 'C2') ? 0.06 * Math.sin((t - ask.t) * 8) : 0);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -140 + 8, -78 + 12, 280, 156, 34); c.fill(); c.fillStyle = LVCOL[lv]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -140, -78, 280, 156, 34); c.fill(); c.stroke();
    font(c, 'Unb9', 84); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(lv, 0, -14); textFit(c, 'Unb9', 28, LBL[id], 240); c.fillText(LBL[id], 0, 48); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.3) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk, sk); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = svT + 0.6, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1180;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  const r = drawWorld(c, t, L, cam, tag, sh), heads = r.heads, M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24);
  const names = { courier2: ['COURIER', '#2E9A8A'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  icons(c, t, L, heads, proj);
  K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_c: -0.1, o1_h: -0.12, o1_c: -0.02, o2_h: -0.12, o2_c: 0.1, o3_h: -0.12, o3_c: -0.02, o4_h: -0.12, o4_c: -0.3, o5_h: -0.12, o5_c: -0.3, o6_h: -0.1, o6_c: -0.1 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); tipCheck(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the last scene
  const d = sc.e - t; if (L === 'o6' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('didntget', NF, renderFrame);
