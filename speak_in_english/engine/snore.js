// "Он храпит, а говорит, что храпишь ты" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node snore.js start end out.mp4 | --png=f1,f2
// A bedroom in the morning: the heroine (dotted pyjamas, dark circles, messy hair) on the left, her boyfriend (yellow tee) on the right, fresh,
// with a steaming coffee mug; the ginger cat on the bed between them; a framed picture over the bed.
// hook: "Morning! You snored all night again. Like a tractor." (a little tractor pops by her head); narrator: flashback NIGHT — HE snores (ZZZ,
//   the picture shakes, the cat covers its ears), she lies awake with wide eyes; «утром» he points at her; «Четыре ответа» the room.
// o1 «В ЛОБ»: "Me no! You snore!" -> "Me? I was asleep. I'd know." he nods confidently, then a smug loud sip of coffee.
// o2 «ВЕЖЛИВО»: "I'm not sure it was me, actually." -> "Who else? The cat?" open palm at the bed -> close-up: the cat lifts its head, outraged (meow).
// o3 «КАК НОСИТЕЛЬ»: "Funny — I've got it on tape..." phone insert (HIM · 2:47 AM, waveform) -> the room shakes: picture, cat bristles, his coffee
//   jumps; "…Okay. That's me. Wow." he blushes; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: on «neighbours» insert: the neighbours' note under the door; he sweats; "…I'll buy nose strips." -> mirror insert:
//   he sticks a nose strip on and looks at himself sadly.
// Twist (music silent): «НОЧЬЮ» he sleeps with the strip, quiet as a mouse (tiny z); SHE snores like a tractor (big ZZZ + tractor, the picture
//   shakes, the cat hides its ears); «УТРОМ» he holds up his phone: "Morning, tractor. Want to hear YOUR tape?" -> phone insert HER · 3:15 AM;
//   she covers her face; moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/snore/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- cast
const HER = { ...BASE.her_lift, earrings: null, top: { type: 'longsleeve', col: '#A9C6F0', dots: '#FFFFFF' }, bottom: { type: 'joggers', col: '#A9C6F0', dots: '#FFFFFF' }, shoes: { col: '#F7A8C8', acc: null } };
const BF = { ...BASE.tom, top: { type: 'tee', col: '#F2C14E' }, bottom: { type: 'joggers', col: '#6F7A8C' }, shoes: { col: '#3A3F4A', acc: null } };
const G = { her: geom(HER), bf12: geom(BF) };
const X = { her: -380, bf: 380 };
const CATX = -10, CATY = -610;            // the cat on the bed (bottom centre), morning
const PICX = 0, PICY = -1980;              // picture over the bed (centre), morning
const NPICY = -1790;                       // picture over the bed, night set
const NX = { her: -300, bf: 300 }, NHY = -1100;   // night: heads on the pillows

// ---------------- props
function mugDraw(c, t, s = 1, steam = 1, spill = 0) { c.save(); c.scale(s, s);
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.fillStyle = '#E0474C'; c.beginPath(); c.arc(52, -48, 26, -1.3, 1.3); c.lineWidth = 14; c.strokeStyle = '#B83A3E'; c.stroke();
  paint(c, q => { q.m(-48, -100); q.l(48, -100); q.l(42, 0); q.q(0, 8, -42, 0); q.z(); }, '#E0474C', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, -52, 16, 0, TAU); c.fill();
  c.fillStyle = '#6B4226'; c.beginPath(); c.ellipse(0, -100, 46, 9, 0, 0, TAU); c.fill();
  if (steam > 0) { c.strokeStyle = `rgba(255,255,255,${0.75 * steam})`; c.lineWidth = 8; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = (t * 0.8 + i / 3) % 1; c.globalAlpha = 1 - u; c.beginPath(); c.moveTo(-22 + i * 22, -112 - u * 60); c.quadraticCurveTo(-10 + i * 22 + Math.sin(t * 4 + i) * 10, -140 - u * 60, -22 + i * 22, -170 - u * 60); c.stroke(); } c.globalAlpha = 1; }
  if (spill > 0) { c.fillStyle = '#6B4226'; for (let i = 0; i < 6; i++) { const a = -1.9 + i * 0.25, r = 40 + spill * 110 + (i % 2) * 20; c.beginPath(); c.ellipse(Math.cos(a) * r * 0.8, -100 + Math.sin(a) * r, 9, 12, a, 0, TAU); c.fill(); } }
  c.restore(); }
const mugItem = (t, steam = 1, spill = 0) => ctx => { mugDraw(ctx, t, 0.85, steam, spill); };
function phoneSmall(c, s = 1, lit = 1) { c.save(); c.scale(s, s); c.fillStyle = '#2B2F3A'; rr(c, -40, -150, 80, 150, 14); c.fill(); c.fillStyle = lit ? '#7FD3F0' : '#4A5060'; rr(c, -33, -142, 66, 128, 9); c.fill();
  if (lit) { c.fillStyle = '#E0474C'; for (let i = 0; i < 7; i++) { const h = 10 + ((i * 37) % 30); c.fillRect(-27 + i * 8, -78 - h / 2, 5, h); } } c.restore(); }
const phoneItem = (lit = 1) => ctx => { ctx.save(); ctx.translate(0, 20); phoneSmall(ctx, 1, lit); ctx.restore(); };
// little cartoon tractor (paths only); (0,0) = centre
function tractor(c, s = 1, t = 0, k = 1) { if (k <= 0) return; c.save(); c.scale(s * k, s * k); const b = Math.abs(Math.sin(t * 18)) * 4;
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(4, 72, 120, 14, 0, 0, TAU); c.fill();
  c.translate(0, -b);
  paint(c, q => { q.m(-95, 30); q.l(60, 30); q.l(60, -20); q.l(-10, -20); q.l(-10, -80); q.l(-95, -80); q.z(); }, '#E0474C', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#BFE3F2'; rr(c, -82, -68, 58, 40, 6); c.fill();
  c.fillStyle = '#2B2F3A'; c.fillRect(30, -62, 12, 44); c.fillStyle = 'rgba(90,90,96,.55)'; for (let i = 0; i < 3; i++) { const u = (t * 1.6 + i / 3) % 1; c.beginPath(); c.arc(36 + u * 30, -70 - u * 70, 10 + u * 14, 0, TAU); c.fill(); }
  c.translate(0, b);
  for (const [x, y, r] of [[-62, 34, 46], [52, 50, 28]]) { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x, y, r * 0.45, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - r * 0.45 * Math.cos(t * 9), y - r * 0.45 * Math.sin(t * 9)); c.lineTo(x + r * 0.45 * Math.cos(t * 9), y + r * 0.45 * Math.sin(t * 9)); c.stroke(); }
  c.restore(); }
// ZZZ rising from (x, y); big = loud snore; k = strength
function zzz(c, t, x, y, k, big = 1, dir = 1) { if (k <= 0) return; c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
  const n = big > 0.5 ? 3 : 1; for (let i = 0; i < n; i++) { const u = ((t * (big > 0.5 ? 0.9 : 0.5) + i / n) % 1), sz = (big > 0.5 ? 90 + u * 110 : 50 + u * 30);
    c.globalAlpha = k * Math.min(1, (1 - u) * 2.5) * Math.min(1, u * 6); UI.font(c, 'Unb9', sz); UI.strokeText(c, 'Z', x + dir * (u * 260 * Math.max(0.4, big)), y - u * 380 * Math.max(0.4, big), big > 0.5 ? '#7FB0D8' : '#C9D2DA', '#2B2F3A', big > 0.5 ? 12 : 8); }
  c.restore(); }
// framed picture over the bed; sh = shake 0..1
function picture(c, t, x, y, sh = 0, night = 0) { c.save(); const j = sh * 14; c.translate(x + Math.sin(t * 47) * j, y + Math.cos(t * 39) * j * 0.6); c.rotate(Math.sin(t * 31) * 0.07 * sh);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-280 + 12, -200 + 16, 560, 400); c.fillStyle = '#8A5A3A'; c.fillRect(-280, -200, 560, 400); c.fillStyle = '#BFE3F2'; c.fillRect(-240, -160, 480, 320);
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(120, -70, 46, 0, TAU); c.fill();
  c.fillStyle = '#7FB86A'; c.beginPath(); c.moveTo(-240, 160); c.lineTo(-240, 40); c.quadraticCurveTo(-120, -40, 0, 60); c.quadraticCurveTo(120, -10, 240, 70); c.lineTo(240, 160); c.fill();
  c.fillStyle = '#5A9A4A'; c.beginPath(); c.moveTo(-240, 160); c.lineTo(-240, 110); c.quadraticCurveTo(0, 50, 240, 130); c.lineTo(240, 160); c.fill();
  c.strokeStyle = '#6A4228'; c.lineWidth = 6; c.strokeRect(-240, -160, 480, 320);
  c.strokeStyle = '#6A4228'; c.lineWidth = 4; c.beginPath(); c.moveTo(-120, -200); c.lineTo(0, -290); c.lineTo(120, -200); c.stroke(); c.fillStyle = '#6A4228'; c.beginPath(); c.arc(0, -290, 9, 0, TAU); c.fill();
  if (night) { c.fillStyle = `rgba(20,30,70,${0.45 * night})`; c.fillRect(-280, -200, 560, 400); }
  c.restore();
  if (sh > 0.3) { c.save(); c.globalAlpha = sh; c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; c.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const r = 330 + i * 30; c.beginPath(); c.arc(x, y, r, s > 0 ? -0.35 + i * 0.05 : Math.PI - 0.35 + i * 0.05, s > 0 ? 0.35 - i * 0.05 : Math.PI + 0.35 - i * 0.05); c.stroke(); } c.restore(); } }
// the cat, lying on the bed; (0,0) = bottom centre. o: head (0 down .. 1 raised), eyes ('closed' | 'open' | 'angry' | 'wide'), mouth 0..1, bristle 0..1, paws 0..1 (over the ears), look -1..1
function catDraw(c, t, s, o = {}) { const fur = '#EBA15E', furD = '#C9793A', furL = '#FFF1DE', hd = o.head || 0, br = o.bristle || 0;
  c.save(); c.scale(s, s); const jit = br > 0 ? Math.sin(t * 60) * 3 * br : 0; c.translate(jit, 0);
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0, -4, 190, 22, 0, 0, TAU); c.fill();
  // tail
  c.strokeStyle = fur; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(130, -40); c.quadraticCurveTo(200 + br * 30, -10 - br * 60, 120, -12 - br * 40); c.quadraticCurveTo(40, -6, -40, -14); c.stroke();
  c.strokeStyle = furD; c.lineWidth = 10; for (const u of [0.3, 0.6]) { c.beginPath(); c.arc(lerp(160, 40, u), -20 - br * 30 * (1 - u), 14, 0, Math.PI); c.stroke(); }
  // body (spiky outline when bristling)
  c.save(); c.translate(30, -80); paint(c, q => { const N = 28; for (let i = 0; i <= N; i++) { const a = Math.PI + i / N * Math.PI, sp = 1 + (i % 2 ? 0.16 * br : 0); const x = Math.cos(a) * 160 * sp, y = Math.sin(a) * 92 * sp; if (!i) q.m(x, y); else q.l(x, y); } q.l(160, 0); q.q(0, 90, -160, 0); q.z(); }, fur, { sd: 8, hd: 4, lw: 4, inner: k => { k.strokeStyle = furD; k.lineWidth = 14; k.lineCap = 'round'; for (const x of [-40, 20, 80]) { k.beginPath(); k.moveTo(x, -88); k.lineTo(x - 10, -40); k.stroke(); } } }); c.restore();
  // front paws
  for (const px of [-120, -60]) { c.fillStyle = furL; c.strokeStyle = '#7A4A26'; c.lineWidth = 4; c.beginPath(); c.ellipse(px, -16, 34, 20, 0, 0, TAU); c.fill(); c.stroke(); }
  // head
  const hx = -110 + (o.look || 0) * 6, hy = lerp(-96, -190, hd); c.save(); c.translate(hx, hy); c.rotate(lerp(0.25, -0.05, hd));
  const ear = 1 - (o.ears || 0) * 0.55; for (const sx of [-1, 1]) { c.save(); c.translate(sx * 52, -48); c.rotate(sx * (0.35 + (o.ears || 0) * 0.7)); c.scale(1, ear); paint(c, q => { q.m(-30, 18); q.l(0, -62); q.l(30, 18); q.z(); }, fur, { sd: 4, hd: 2, lw: 4, inner: k => { k.fillStyle = '#F4B8C0'; k.beginPath(); k.moveTo(-15, 12); k.lineTo(0, -34); k.lineTo(15, 12); k.fill(); } }); c.restore(); }
  paint(c, q => { q.e(0, 0, 86, 72); }, fur, { sd: 8, hd: 4, lw: 4, inner: k => { k.strokeStyle = furD; k.lineWidth = 10; for (const dx of [-22, 0, 22]) { k.beginPath(); k.moveTo(dx, -70); k.lineTo(dx * 0.8, -42); k.stroke(); } k.fillStyle = furL; k.beginPath(); k.ellipse(0, 32, 50, 34, 0, 0, TAU); k.fill(); } });
  const ey = -8, eo = o.eyes || 'closed'; c.lineCap = 'round';
  for (const sx of [-1, 1]) { const ex = sx * 34 + (o.look || 0) * 6;
    if (eo === 'closed') { c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.arc(ex, ey - 4, 14, 0.3, Math.PI - 0.3); c.stroke(); }
    else { const r = eo === 'wide' ? 22 : 18; c.fillStyle = '#F7F2A0'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.arc(ex, ey, r, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#2B2F3A'; c.beginPath(); c.ellipse(ex + (o.look || 0) * 7, ey, eo === 'wide' ? 5 : 6, r * 0.8, 0, 0, TAU); c.fill();
      if (eo === 'angry') { c.fillStyle = fur; c.beginPath(); c.moveTo(ex - 26, ey - 26); c.lineTo(ex + 26, ey - 26); c.lineTo(ex + 26, ey - 8 + sx * -10); c.lineTo(ex - 26, ey - 8 + sx * 10); c.closePath(); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(ex - 24, ey - 6 + sx * 10); c.lineTo(ex + 24, ey - 6 - sx * 10); c.stroke(); } } }
  c.fillStyle = '#E8788A'; c.beginPath(); c.moveTo(-9, 18); c.lineTo(9, 18); c.lineTo(0, 28); c.closePath(); c.fill();
  const m = o.mouth || 0; c.strokeStyle = '#2B2F3A'; c.lineWidth = 4;
  if (m > 0.05) { c.fillStyle = '#8A2A3A'; c.beginPath(); c.ellipse(0, 44, 14, 6 + m * 16, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#FFFFFF'; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 9, 38 - m * 10); c.lineTo(sx * 5, 46 - m * 8); c.lineTo(sx * 2, 38 - m * 10); c.fill(); } }
  else { c.beginPath(); c.moveTo(0, 28); c.quadraticCurveTo(-8, 40, -18, 34); c.moveTo(0, 28); c.quadraticCurveTo(8, 40, 18, 34); c.stroke(); }
  c.strokeStyle = 'rgba(43,47,58,.7)'; c.lineWidth = 3; for (const sx of [-1, 1]) for (const dy of [-6, 6]) { c.beginPath(); c.moveTo(sx * 40, 30 + dy); c.lineTo(sx * 96, 24 + dy * 2.2); c.stroke(); }
  c.restore();
  if ((o.paws || 0) > 0) { const pk = o.paws; for (const sx of [-1, 1]) { const px = hx + sx * lerp(110, 62, pk), py = hy + lerp(40, -40, pk); c.fillStyle = furL; c.strokeStyle = '#7A4A26'; c.lineWidth = 4; c.beginPath(); c.ellipse(px, py, 30, 38, sx * 0.4, 0, TAU); c.fill(); c.stroke(); } }
  c.restore(); }
// anger mark (four curved strokes), drawn with paths
function anger(c, x, y, s, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s * k, s * k); c.strokeStyle = '#E0474C'; c.lineWidth = 9; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); c.beginPath(); c.moveTo(10, -30); c.quadraticCurveTo(12, -12, 30, -10); c.stroke(); c.restore(); } c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
// nose strip across the nose bridge (face overlay); hd = head {x, y, hh}
function noseStrip(c, hd, turn = 0, k = 1) { if (k <= 0) return; const h = hd.hh; c.save(); c.translate(hd.x + turn * 0.12 * h, hd.y + 0.3 * h); c.scale(k, k); c.rotate(-0.03);
  c.fillStyle = '#F4E6D2'; c.strokeStyle = '#B89A70'; c.lineWidth = Math.max(2, h * 0.02); c.beginPath(); c.moveTo(-0.34 * h, -0.07 * h); c.quadraticCurveTo(0, -0.11 * h, 0.34 * h, -0.07 * h); c.lineTo(0.36 * h, 0.07 * h); c.quadraticCurveTo(0, 0.03 * h, -0.36 * h, 0.07 * h); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(184,154,112,.6)'; c.beginPath(); c.moveTo(-0.22 * h, -0.02 * h); c.lineTo(0.22 * h, -0.02 * h); c.stroke(); c.restore(); }
function darkCircles(c, hd, turn, k = 1) { if (k <= 0) return; const h = hd.hh; c.save(); c.globalAlpha = 0.55 * k; c.strokeStyle = '#8A6A9A'; c.lineCap = 'round'; c.lineWidth = Math.max(3, h * 0.05);
  for (const s of [-1, 1]) { const ex = hd.x + (s * 0.36 + 0.14 * turn) * h; c.beginPath(); c.arc(ex, hd.y + 0.02 * h, 0.2 * h, 0.35, Math.PI - 0.35); c.stroke(); c.lineWidth = Math.max(2, h * 0.025); c.beginPath(); c.arc(ex, hd.y + 0.04 * h, 0.25 * h, 0.6, Math.PI - 0.6); c.stroke(); c.lineWidth = Math.max(3, h * 0.05); }
  c.restore(); }
function messyHair(c, hd, k = 1) { if (k <= 0) return; const h = hd.hh; c.save(); c.strokeStyle = '#3A2820'; c.lineCap = 'round'; c.lineWidth = Math.max(3, h * 0.05);
  for (const [a, l, cv] of [[-0.5, 0.45, 0.2], [-0.15, 0.55, -0.25], [0.25, 0.5, 0.25], [0.6, 0.38, -0.2], [0.95, 0.42, 0.2]]) { const x0 = hd.x + Math.sin(a) * h * 0.95, y0 = hd.y - Math.cos(a) * h * 1.02; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + Math.sin(a + cv * 3) * h * l * 0.7, y0 - Math.cos(a + cv * 3) * h * l * 0.7, x0 + Math.sin(a) * h * l, y0 - Math.cos(a) * h * l); c.stroke(); }
  c.restore(); }
function blush(c, hd, k) { if (k <= 0) return; const h = hd.hh; c.save(); c.globalAlpha = 0.5 * k; c.fillStyle = '#F07C8C'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hd.x + s * 0.5 * h, hd.y + 0.35 * h, 0.2 * h, 0.1 * h, 0, 0, TAU); c.fill(); } c.restore(); }

// ---------------- the bedroom (prerendered, softly blurred)
const BX0 = -3000, BY0 = -4300, BW = 6600, BH = 6200, BS = 0.5;
function bedFront(c, night = 0) {   // bed against the back wall (morning): headboard, pillows, blanket
  paint(c, q => { q.m(-780, -560); q.l(-780, -1180); q.q(-780, -1300, -640, -1300); q.l(640, -1300); q.q(780, -1300, 780, -1180); q.l(780, -560); q.z(); }, '#B9895E', { sd: 8, hd: 4, lw: 5 });
  c.fillStyle = 'rgba(255,255,255,.18)'; rr(c, -700, -1220, 1400, 60, 30); c.fill();
  for (const x of [-420, 420]) paint(c, q => { q.m(x - 250, -640); q.q(x - 270, -840, x - 120, -850); q.l(x + 120, -850); q.q(x + 270, -840, x + 250, -640); q.z(); }, '#FFFFFF', { sd: 5, hd: 3, lw: 4 });
  paint(c, q => { q.m(-860, -660); q.q(-300, -700, 0, -670); q.q(300, -700, 860, -660); q.l(880, -240); q.l(-880, -240); q.z(); }, '#F2C6D6', { sd: 8, hd: 4, lw: 5, inner: k => { k.fillStyle = 'rgba(255,255,255,.45)'; for (let i = 0; i < 30; i++) { k.beginPath(); k.arc(-820 + (i % 10) * 180 + (Math.floor(i / 10) % 2) * 90, -600 + Math.floor(i / 10) * 120, 22, 0, TAU); k.fill(); } } });
  c.fillStyle = '#9A6E48'; c.fillRect(-860, -240, 1720, 90); c.fillRect(-840, -150, 50, 100); c.fillRect(790, -150, 50, 100); }
function drawBedroom(c) {
  c.fillStyle = '#F6E3D3'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#FFF6EC'; c.fillRect(BX0, BY0, BW, -2700 - BY0); c.fillStyle = '#E6CDB4'; c.fillRect(BX0, -2720, BW, 40);
  c.fillStyle = 'rgba(255,255,255,.3)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -2680, 90, 2680);   // wallpaper stripes
  c.fillStyle = '#EAD2BE'; c.fillRect(BX0, -260, BW, 260); c.fillStyle = '#D9BBA0'; c.fillRect(BX0, -270, BW, 18);   // skirting / wainscot
  // window with the morning sun (left)
  c.fillStyle = '#FFFFFF'; c.fillRect(-1820, -2350, 760, 1050); const g = c.createLinearGradient(0, -2310, 0, -1340); g.addColorStop(0, '#9FD3F0'); g.addColorStop(1, '#FFE3B0'); c.fillStyle = g; c.fillRect(-1780, -2310, 680, 970);
  c.fillStyle = '#FFD66B'; c.beginPath(); c.arc(-1300, -1560, 120, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(-1600, -2100, 60, 0, TAU); c.arc(-1530, -2120, 75, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; c.fillRect(-1452, -2310, 24, 970); c.fillRect(-1780, -1840, 680, 20);
  c.fillStyle = '#F7A8C8'; c.fillRect(-1900, -2420, 160, 1180); c.fillRect(-1140, -2420, 160, 1180); c.fillStyle = '#C9B08A'; c.fillRect(-1960, -2440, 1040, 26);
  c.fillStyle = 'rgba(255,230,160,.25)'; c.beginPath(); c.moveTo(-1780, -1340); c.lineTo(-1100, -1340); c.lineTo(-300, 0); c.lineTo(-1500, 0); c.fill();   // sunbeam
  // nightstand + lamp + alarm clock (right)
  paint(c, q => { q.m(980, -640); q.l(1380, -640); q.l(1380, -60); q.l(980, -60); q.z(); }, '#B9895E', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#9A6E48'; c.fillRect(980, -380, 400, 10); c.fillStyle = '#E9EDF1'; rr(c, 1150, -520, 60, 20, 10); c.fill();
  c.fillStyle = '#C9B08A'; c.fillRect(1060, -900, 20, 260); paint(c, q => { q.m(960, -900); q.l(1180, -900); q.l(1130, -1080); q.l(1010, -1080); q.z(); }, '#F2C14E', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#8A6A4A'; rr(c, 990, -660, 160, 24, 8); c.fill();
  paint(c, q => { q.e(1290, -730, 80, 80); }, '#7FB0D8', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(1290, -730, 60, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(1290, -730); c.lineTo(1290, -775); c.moveTo(1290, -730); c.lineTo(1320, -730); c.stroke();
  // wardrobe (far right)
  paint(c, q => { q.m(1650, -2300); q.l(2500, -2300); q.l(2500, -40); q.l(1650, -40); q.z(); }, '#D9B48A', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#B9895E'; c.fillRect(2070, -2260, 10, 2200); c.fillStyle = '#8A6A4A'; rr(c, 2020, -1260, 24, 120, 12); c.fill(); rr(c, 2106, -1260, 24, 120, 12); c.fill();
  // bed
  bedFront(c);
  // floor + rug
  c.fillStyle = '#C9A27A'; c.fillRect(BX0, -10, BW, BY0 + BH + 10); c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = BX0; x < BX0 + BW; x += 260) c.fillRect(x, -10, 8, 3000);
  c.fillStyle = '#A9C6F0'; c.beginPath(); c.ellipse(0, 160, 1300, 220, 0, 0, TAU); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 14; c.beginPath(); c.ellipse(0, 160, 1180, 180, 0, 0, TAU); c.stroke();
  c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(BX0, -20, BW, 14);
}
// night set: the bed seen from its foot (the camera is in the bed's axis); heads on the pillows, the blanket up to the chins
function drawNight(c) {
  c.fillStyle = '#2E3A66'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.05)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, BY0, 90, BH);
  c.fillStyle = '#26305A'; c.fillRect(BX0, BY0, BW, -2800 - BY0);
  // window with the moon (left), stars
  c.fillStyle = '#4A5A8A'; c.fillRect(-2000, -2500, 700, 900); c.fillStyle = '#16204A'; c.fillRect(-1960, -2460, 620, 820); c.fillStyle = '#F7F2C8'; c.beginPath(); c.arc(-1560, -2250, 90, 0, TAU); c.fill(); c.fillStyle = '#16204A'; c.beginPath(); c.arc(-1520, -2280, 80, 0, TAU); c.fill();
  c.fillStyle = '#F7F2C8'; for (const [x, y] of [[-1850, -2350], [-1700, -1900], [-1420, -1750], [-1880, -1800]]) { c.beginPath(); c.arc(x, y, 8, 0, TAU); c.fill(); }
  c.fillStyle = '#4A5A8A'; c.fillRect(-1665, -2460, 20, 820);
  // nightstand + lamp (off) right
  paint(c, q => { q.m(1000, -900); q.l(1500, -900); q.l(1500, 600); q.l(1000, 600); q.z(); }, '#4A3E5A', { sd: 6, hd: 3, lw: 4 });
  // headboard
  paint(c, q => { q.m(-860, -820); q.l(-860, -1330); q.q(-860, -1450, -700, -1450); q.l(700, -1450); q.q(860, -1450, 860, -1330); q.l(860, -820); q.z(); }, '#6A5070', { sd: 8, hd: 4, lw: 5 });
  // floor
  c.fillStyle = '#3A3550'; c.fillRect(BX0, 400, BW, BY0 + BH - 400);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawBedroom), BGN = mkBG(drawNight);

// ---------------- characters (morning)
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hip = (g, s) => reach(g, s, s * g.sw * 0.95, g.ySh + 470, { planar: true });
const mouth = (g, s) => reach(g, s, s * g.hw * 0.45, g.headY + g.hh * 1.25, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const twistMorning = (t, L) => L === 'end' && t > ev('end', 'morning');
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'tired', blink: 0.45, turn: 0.25, look: 0.7 };
  if (L === 'hook') { st.armL = hold(g, -1, 380, 0.55); st.armR = hold(g, 1, 380, 0.55);
    if (t > hev('tractor') - 0.05) { st.mood = 'annoyed'; st.blink = 0.35; }
    if (t > hev('morning')) { st.mood = 'annoyed'; st.blink = 0.2; st.armL = hip(g, -1); st.armR = hip(g, 1); } }
  if (L === 'o1') { st.mood = 'annoyed'; st.blink = 0.3; st.armL = hip(g, -1); st.armR = hip(g, 1);
    if (speaking('o1_h', t, 0.05, 0.15)) { st.mood = 'angry'; st.blink = 0; st.armL = open(g, -1, 2.0, 40 + Math.sin(t * 9) * 25); st.armR = reach(g, 1, g.sw * 2.1, g.ySh + 60 + Math.sin(t * 9) * 20, { planar: true }); }
    if (t > SP.o1_b.t + 0.3) { st.mood = 'annoyed'; st.blink = 0.4; } }
  if (L === 'o2') { st.mood = 'tired';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'neutral'; st.blink = 0.3; gest(st, g, 'her', t, 1, 160); }
    if (t > SP.o2_b.t + 0.6) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('glare')) { st.mood = 'smug'; st.blink = 0.4; st.look = 0.8; st.armL = hip(g, -1); st.armR = hip(g, 1); } }
  if (L === 'o3') { st.mood = 'tired';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'smug'; st.blink = 0.3; }
    if (t > e('phone') - 0.1) { st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 170, { planar: true }); st.items = { R: phoneItem(0) }; st.mood = 'smug'; }
    if (t > e('play') - 0.1) { st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 120, { planar: true }); st.items = { R: phoneItem(1) }; st.blink = 0.5; }
    if (t > e('stop')) { st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 250, { planar: true }); st.items = { R: phoneItem(0) }; st.mood = 'smug'; st.blink = 0.6; }
    if (t > SP.o3_nar.t) { st.mood = 'happy'; st.blink = 0.2; } }
  if (L === 'o4') { st.mood = 'smug'; st.blink = 0.3; st.armL = hip(g, -1); st.armR = hip(g, 1);
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t; st.mood = 'happy'; st.blink = 0.2;
      if (t < e('back')) { st.armR = reach(g, 1, g.sw * (1.6 + 0.2 * Math.sin(u * 3)), g.ySh + 160 + Math.cos(u * 3) * 30, { planar: true }); }
      else { st.mood = 'smug'; st.blink = 0.5; st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 300, { planar: true }); st.tilt = -0.05; } }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 0.7; } }
  if (L === 'end') { st.mood = 'happy'; st.blink = 0; st.look = 0.7;   // she slept like a log: no dark circles
    if (t > SP.end_b.t + 0.9) { st.mood = 'surprised'; }
    if (t > e('react')) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('react') + 0.45) { st.mood = 'tired'; st.headFirst = true; st.armL = forehead(g, -1); st.blink = 1; st.look = 0; st.turn = 0.1; st.headY = 6; } }
  return st; }
function bfState(t, L) { const g = G.bf12, e = k => ev(L, k), st = { ...base(g, t, 'bf12'), mood: 'happy', turn: -0.25, look: -0.7 };
  let steam = 1, spill = 0; const mugR = (dy = 260) => { st.armR = hold(g, 1, dy, 0.62); st.items.R = mugItem(t, steam, spill); };
  const sip = () => { st.armR = mouth(g, 1); st.items.R = mugItem(t, 0); st.blink = 1; st.look = -0.3; };
  mugR();
  if (L === 'hook') { if (t < 0.55) sip();
    if (speaking('hook_b', t, 0.05, 0.1) && t > 0.55) { st.mood = 'happy'; st.laugh = t < 1.2; gest(st, g, 'bf12', t, -1, 160); }
    if (t > hev('tractor')) { st.laugh = true; st.armL = open(g, -1, 2.0, 80); }
    if (t > hev('morning')) { st.mood = 'smug'; st.laugh = false; st.blink = 0.4; st.armL = reach(g, -1, -g.sw * 2.2, g.ySh + 80, { planar: true }); }
    if (t > hev('wide')) { st.armL = down(g, -1); st.mood = 'happy'; st.blink = 0; } }
  if (L === 'o1') { if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_b', t, 0.05, 0.1)) { const u = t - e('nod'); st.mood = 'smug'; st.blink = 0.45; st.headY = Math.abs(Math.sin(u * 7)) * 14; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 250, { planar: true }); }
    if (t > e('sip')) { sip(); st.mood = 'smug'; if (t > e('sip') + 0.75) { mugR(); st.blink = 0.5; } } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_b', t, 0.05, 0.1)) { st.mood = 'smug'; st.blink = 0.4; }
    if (t > e('point') - 0.1) { st.armL = reach(g, -1, CATX - X.bf + 120, CATY - 200, { planar: true }); st.look = -0.9; st.lookY = 0.4; st.mood = 'smug'; }
    if (t > e('cat') + 0.3) { st.mood = 'worried'; st.blink = 0; st.armL = down(g, -1); st.lookY = 0.5; }
    if (t > e('glare')) { st.mood = 'worried'; st.armL = open(g, -1, 1.5, 160); st.armR = hold(g, 1, 200, 0.95); st.tilt = 0.06; st.look = -0.9; st.lookY = 0.45; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'skeptical'; }
    if (t > e('play')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('shake') && t < e('stop') + 0.2) { spill = clamp((t - e('shake')) / 0.3); st.mood = 'shock'; st.tilt = Math.sin(t * 40) * 0.04; mugR(); }
    if (t > e('stop') + 0.2) { st.mood = 'shock'; st.blink = 0; }
    if (speaking('o3_b', t, 0, 0.3)) { st.mood = t < SP.o3_b.t + 1.0 ? 'shock' : 'worried'; st.lookY = 0.2; st.blink = 0.2; }
    if (t > SP.o3_nar.t) { st.mood = 'sad'; st.lookY = 0.35; st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 300, { planar: true }); } }
  if (L === 'o4') { st.mood = 'neutral';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > e('note') ? 'worried' : 'neutral'; }
    if (t > e('back')) { st.mood = 'shock'; st.blink = 0; }
    if (t > SP.o4_b.t) { st.mood = 'sad'; st.lookY = 0.35; st.blink = 0.3; } }
  if (L === 'end') { st.mood = 'happy'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 40, { planar: true }); st.items.L = phoneItem(t > e('play') - 0.2 ? 1 : 0);
    if (speaking('end_b', t, 0.05, 0.1)) { st.mood = t > e('tape') ? 'smug' : 'happy'; st.blink = t > e('tape') ? 0.4 : 0; }
    if (t > e('react')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; }
    if (t > e('wave')) { st.armL = reach(g, -1, -g.sw * (1.7 + 0.2 * Math.sin(t * 10)), g.ySh - 20 + Math.cos(t * 10) * 30, { planar: true }); st.laugh = true; } }
  return st; }
// night (both lying; the blanket up to the chins): hook flashback = HE snores, she lies awake; twist = SHE snores, he sleeps with the strip
const nightKind = (t, L) => L === 'hook' ? 'his' : 'hers';
const snoreTalk = (t, a) => clamp(0.35 + 0.6 * Math.abs(Math.sin(t * a)));
function nightStates(t, L) { const kind = nightKind(t, L), g = G.her, gb = G.bf12;
  const her = { t, talk: 0, mood: 'neutral', turn: 0.15, look: 0, items: {}, armL: down(g, -1), armR: down(g, 1), breathe: 0.5 };
  const bf = { t, talk: 0, mood: 'neutral', turn: -0.15, look: 0, items: {}, armL: down(gb, -1), armR: down(gb, 1), breathe: 0.5 };
  if (kind === 'his') { bf.blink = 1; bf.talk = snoreTalk(t, 3.2); bf.tilt = 0.12; bf.mood = 'neutral';
    her.mood = 'annoyed'; her.blink = 0; her.lookY = -0.6; her.look = 0.4; her.tilt = -0.05; }
  else { her.blink = 1; her.talk = snoreTalk(t, 3.6); her.tilt = -0.12; her.mood = 'neutral';
    bf.blink = 1; bf.mood = 'happy'; bf.tilt = 0.1; }
  return { her, bf }; }
function picShake(t, L, night) { if (night) { const k = nightKind(t, L); return k === 'his' ? 0.55 + 0.25 * Math.abs(Math.sin(t * 3.2)) : 0.6 + 0.4 * Math.abs(Math.sin(t * 3.6)); }
  if (L === 'o3') return clamp((t - ev('o3', 'shake')) / 0.15) * (1 - clamp((t - ev('o3', 'stop')) / 0.2)); return 0; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'bf12'], cover: ['her', 'bf12'], two: ['her', 'bf12'], her: ['her'], bf: ['bf12'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function catMorning(t, L) { const o = { head: 0, eyes: 'closed', mouth: 0, bristle: 0, paws: 0, look: 0, ears: 0 };
  if (L === 'hook' && t < 0.01) return o;
  if (L === 'o2') { const c0 = ev('o2', 'cat'); if (t > c0) { const u = t - c0; o.head = eOut(clamp((u - 0.05) / 0.3)); o.eyes = u > 0.15 ? 'angry' : 'closed'; o.mouth = u > 0.38 && u < 0.85 ? Math.sin(clamp((u - 0.38) / 0.47) * Math.PI) : 0; o.ears = clamp((u - 0.2) / 0.2); o.look = 1; } }
  if (L === 'o3') { const s0 = ev('o3', 'shake'), s1 = ev('o3', 'stop'); if (t > s0 && t < s1 + 0.6) { const u = t - s0; o.head = eOut(clamp(u / 0.2)); o.eyes = 'wide'; o.bristle = clamp(u / 0.2) * (1 - clamp((t - s1) / 0.6)); o.ears = 1; o.mouth = 0.3; } }
  if (L === 'o4' || L === 'end') { o.head = 0.2; o.eyes = 'closed'; }
  return o; }
function overlayFace(c, hd, t, L, who, st, night = 0) { if (!hd || hd.x > 1e4 || hd.x < -1e4) return;
  if (who === 'her' && !(L === 'end' && !night)) { darkCircles(c, hd, st.turn || 0, night && nightKind(t, L) === 'hers' ? 0 : 1); if (!night) messyHair(c, hd); }
  if (who === 'bf12') { const strip = (L === 'end') || (L === 'o4' && t > ev('o4', 'stick')); if (strip) noseStrip(c, hd, st.turn || 0, 1);
    if (L === 'o3' && t > SP.o3_b.t + 0.8) blush(c, hd, clamp((t - SP.o3_b.t - 0.8) / 0.3)); }
  if (who === 'her' && L === 'end' && !night && t > ev('end', 'react') + 0.45) blush(c, hd, clamp((t - ev('end', 'react') - 0.45) / 0.3)); }
function world(c, t, L, tag) { const heads = {};
  if (tag === 'night') { // ---- night set
    c.drawImage(BGN, BX0, BY0, BW, BH); const sh = picShake(t, L, 1); c.save(); c.translate(390, NPICY); c.scale(0.65, 0.65); picture(c, t, 0, 0, sh, 1); c.restore();
    for (const x of [-300, 300]) paint(c, q => { q.e(x, -1060, 280, 120); }, '#DDE4F2', { sd: 5, hd: 3, lw: 4 });
    const S_ = nightStates(t, L);
    const hh = K.put(c, HER, S_.her, NX.her, NHY - G.her.headY), hb = K.put(c, BF, S_.bf, NX.bf, NHY - G.bf12.headY);
    // blanket up to the chins
    paint(c, q => { q.m(-900, -930); q.q(-600, -990, -300, -955); q.q(0, -900, 300, -945); q.q(600, -990, 900, -930); q.l(940, 900); q.l(-940, 900); q.z(); }, '#7A6AB0', { sd: 10, hd: 5, lw: 5, inner: k => { k.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 40; i++) { k.beginPath(); k.arc(-860 + (i % 8) * 240 + (Math.floor(i / 8) % 2) * 120, -800 + Math.floor(i / 8) * 220, 34, 0, TAU); k.fill(); } } });
    c.fillStyle = '#9A8AD0'; rr(c, -920, -960, 1840, 70, 35); c.fill();
    overlayFace(c, hh, t, L, 'her', S_.her, 1); overlayFace(c, hb, t, L, 'bf12', S_.bf, 1);
    // the cat at the foot of the bed, paws over its ears
    c.save(); c.translate(400, -560); catDraw(c, t, 0.8, { head: 0.6, eyes: 'angry', paws: 1, ears: 1, look: L === 'hook' ? 1 : -1 }); c.restore();
    // snores
    if (nightKind(t, L) === 'his') { zzz(c, t, hb.x + 60, hb.y - 60, 1, 1, 1); c.save(); c.translate(hb.x + 330, hb.y - 330); tractor(c, 0.8, t, 1 * clamp((t - hev('night') - 0.3) / 0.25)); c.restore(); }
    else { const tw = t - ev('end', 'night'); zzz(c, t, hh.x - 60, hh.y - 60, clamp(tw / 0.3), 1, -1); c.save(); c.translate(hh.x - 300, hh.y - 330); tractor(c, 0.8, t, clamp((tw - 0.9) / 0.25)); c.restore(); zzz(c, t, hb.x + 40, hb.y - 80, 1, 0, 1); }
    return { her: OFFL, bf12: OFF, night: { hh, hb } }; }
  // ---- morning bedroom
  const who = DRAW[tag] || ['her', 'bf12'];
  c.drawImage(BGR, BX0, BY0, BW, BH); picture(c, t, PICX, PICY, picShake(t, L, 0));
  c.save(); c.translate(CATX, CATY); catDraw(c, t, 1.0, catMorning(t, L)); c.restore();
  if (L === 'o2' && t > ev('o2', 'cat') + 0.3) anger(c, CATX - 160, CATY - 330, 1.2, eBack(clamp((t - ev('o2', 'cat') - 0.3) / 0.25), 2));
  let bst, hst;
  if (who.includes('bf12')) { bst = bfState(t, L); heads.bf12 = K.put(c, BF, bst, X.bf, 0); }
  if (who.includes('her')) { hst = herState(t, L); heads.her = K.put(c, HER, hst, X.her, 0); }
  if (heads.her) overlayFace(c, heads.her, t, L, 'her', hst);
  if (heads.bf12) { overlayFace(c, heads.bf12, t, L, 'bf12', bst); if (L === 'o4') sweat(c, heads.bf12, t, clamp((t - ev('o4', 'sweat')) / 0.3) * (1 - clamp((t - SP.o4_b.t - 0.2) / 0.3))); if (L === 'o2' && t > ev('o2', 'glare')) sweat(c, heads.bf12, t, clamp((t - ev('o2', 'glare')) / 0.3)); }
  if (L === 'hook' && heads.her) { const k = eBack(clamp((t - hev('tractor')) / 0.3), 2.2) * (1 - clamp((t - hev('nar') + 0.2) / 0.2)); if (k > 0) { c.save(); c.translate(heads.her.x - 300, heads.her.y - 230); tractor(c, 1.25, t, k); c.restore(); } }
  if (!heads.her) heads.her = OFFL; if (!heads.bf12) heads.bf12 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(0, fy(HY('bf12'), 0.5, 960), 0.5, 'cover'), WIDE: S(0, fy(HY('bf12'), 0.46, 880), 0.46, 'wide'),
  TWO: S(0, -1150, 0.72, 'two'),
  HER: S(X.her + 30, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.15, 880), 1.15, 'her'),
  BF: S(X.bf + 10, fy(HY('bf12'), 1.0), 1.0, 'bf'), BF_CU: S(X.bf + 10, fy(HY('bf12'), 1.2, 900), 1.2, 'bf'),
  NIGHT: S(0, -900, 0.85, 'night'),
  CAT: U('cat', 1), PHONE: U('phone', 2), NOTE: U('note', 3), MIRROR: U('mirror', 4), PHONE2: U('phone2', 5) };
const HO = 0.12;   // cut to the next speaker this long before the line starts
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('night') - 0.02) return SH.COVER; if (t < hev('morning') - 0.05) return f(SH.NIGHT); if (t < hev('wide') - 0.05) return f(SH.BF_CU); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - HO) return f(SH.WIDE); if (t < SP.o1_b.t - HO) return f(SH.HER); if (t < SP.o1_nar.t - 0.02) return f(SH.BF); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - HO) return f(SH.WIDE); if (t < SP.o2_b.t - HO) return f(SH.HER); if (t < e('cat') - 0.02) return f(SH.BF); if (t < e('glare') - 0.02) return f(SH.CAT); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - HO) return f(SH.WIDE); if (t < e('play') - 0.02) return f(SH.HER); if (t < e('shake') - 0.02) return f(SH.PHONE); if (t < SP.o3_b.t - HO) return f(SH.TWO); if (t < SP.o3_nar.t - 0.02) return f(SH.BF_CU); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - HO) return f(SH.WIDE); if (t < e('note') - 0.02) return f(SH.HER); if (t < e('back') - 0.02) return f(SH.NOTE); if (t < SP.o4_b.t - HO) return f(SH.TWO); if (t < e('mirror') - 0.02) return f(SH.BF_CU); return f(SH.MIRROR); }
  if (L === 'end') { if (t < e('morning') - 0.02) return f(SH.NIGHT); if (t < e('play') - 0.02) return f(SH.BF); if (t < e('react') - 0.02) return f(SH.PHONE2); if (t < SP.moral.t - 0.02) return f(SH.HER_R); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'bigsnore']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.1)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const sleeve = (c, col, x0, y0, x1, y1, w = 70) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.fillStyle = '#F2C9A8'; c.beginPath(); c.arc(x1, y1, w * 0.62, 0, TAU); c.fill(); };
// o2: the cat, close: lifts its head, outraged, meows
function catView(c, t) { backdrop(c, t, '#F7D7E3', '#E9A8C0'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'cat' });
  const u = t - ev('o2', 'cat'), k = eBack(clamp((u + 0.05) / 0.25), 1.4);
  c.save(); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(80 + (i % 4) * 300 + (Math.floor(i / 4) % 2) * 150, 1250 + Math.floor(i / 4) * 230, 60, 0, TAU); c.fill(); } c.restore();
  c.save(); c.translate(640, 1330); c.scale(k * 3.2, k * 3.2); catDraw(c, t, 1, catMorning(t, 'o2')); c.restore();
  anger(c, 260, 520, 2.2, eBack(clamp((u - 0.3) / 0.25), 2)); }
// phone: voice memo playing (o3: HIM · 2:47 AM from her phone; twist: HER · 3:15 AM from his phone)
function memoView(c, t, t0, label, time, col, hand) { backdrop(c, t, col[0], col[1]);
  const u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6), bump = 1 + 0.03 * Math.abs(Math.sin(u * 9)) * clamp(u / 0.2);
  c.save(); c.translate(540, 980); c.scale(k * bump, k * bump); c.translate(-540, -980);
  K.phone(c, 540, 980, 1.75, (q, w, h) => { q.fillStyle = '#FFFFFF'; q.fillRect(0, 0, w, h); q.fillStyle = '#2B2F3A'; q.fillRect(0, 0, w, 70);
    fitTxt(q, 'VOICE MEMOS', w / 2, 36, 30, '#FFFFFF', w - 40);
    q.fillStyle = '#FDECEF'; rr(q, 16, 96, w - 32, 120, 18); q.fill(); fitTxt(q, label, 30, 136, 40, '#E0474C', w - 60, 'Unb9', 'left'); fitTxt(q, time, 30, 186, 28, '#5A606E', w - 60, 'Unb9', 'left');
    // waveform
    const n = 22; for (let i = 0; i < n; i++) { const a = Math.abs(Math.sin(i * 1.7 + u * 9)) * (0.4 + 0.6 * Math.abs(Math.sin(u * 3.6))), h_ = 30 + a * 210, x = 30 + i * (w - 60) / n; q.fillStyle = (i / n) < clamp(u / 1.2) ? '#E0474C' : '#C9D2DA'; rr(q, x, 400 - h_ / 2, (w - 60) / n - 6, h_, 6); q.fill(); }
    q.fillStyle = '#E9EDF1'; rr(q, 30, 560, w - 60, 12, 6); q.fill(); q.fillStyle = '#E0474C'; rr(q, 30, 560, (w - 60) * clamp(u / 1.2), 12, 6); q.fill();
    q.fillStyle = '#2B2F3A'; q.beginPath(); q.arc(w / 2, 660, 50, 0, TAU); q.fill(); q.fillStyle = '#FFFFFF'; q.fillRect(w / 2 - 18, 640, 12, 40); q.fillRect(w / 2 + 6, 640, 12, 40); });
  c.restore();
  // sound waves from the speaker + shaking
  const sk = clamp((u - 0.15) / 0.2); if (sk > 0) { c.save(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const r = 470 + i * 70 + ((u * 300) % 70); c.globalAlpha = sk * (1 - i * 0.25); c.beginPath(); c.arc(540, 980, r, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); c.stroke(); } c.restore(); }
  sleeve(c, hand, lerp(1250, 1200, 0), 1700, 760, 1500, 130); }
const phoneView = (c, t) => { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'phone' }); memoView(c, t, ev('o3', 'play'), 'HIM', '2:47 AM', ['#FFE6B8', '#F2B860'], '#A9C6F0'); };
const phone2View = (c, t) => { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'phone2' }); memoView(c, t, ev('end', 'play'), 'HER', '3:15 AM', ['#D7E6F7', '#9FB8E0'], '#F2C14E'); };
// o4: the neighbours' note slides in under the door
function noteView(c, t) { backdrop(c, t, '#E9F1EE', '#C9DCD6'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'note' });
  const u = t - ev('o4', 'note');
  c.fillStyle = '#B9895E'; c.fillRect(0, 0, W, 1180); c.fillStyle = 'rgba(0,0,0,.08)'; for (const x of [140, 560]) { rr(c, x, 120, 380, 420, 20); c.fill(); rr(c, x, 640, 380, 420, 20); c.fill(); }
  c.fillStyle = '#5A3A22'; c.fillRect(0, 1180, W, 30); c.fillStyle = '#C9A27A'; c.fillRect(0, 1210, W, 710);
  const sl = eOut(clamp((u - 0.05) / 0.45)); c.save(); c.translate(540, lerp(1180, 1400, sl)); c.rotate(lerp(0, -0.06, sl));
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-400 + 12, -300 + 16, 800, 600); c.fillStyle = '#FFFDF4'; c.fillRect(-400, -300, 800, 600);
  c.strokeStyle = 'rgba(127,176,216,.5)'; c.lineWidth = 3; for (let y = -200; y < 300; y += 80) { c.beginPath(); c.moveTo(-370, y + 30); c.lineTo(370, y + 30); c.stroke(); }
  const L_ = ['DEAR FLAT 5,', 'ARE YOU BUILDING', 'AN EXTENSION?', 'AT 3 AM?!'];
  L_.forEach((s, i) => fitTxt(c, s, 0, -200 + i * 105, i === 3 ? 76 : 64, i === 3 ? '#E0474C' : '#2B2F3A', 700, 'Unb9'));
  fitTxt(c, '— FLAT 6', 250, 230, 40, '#5A606E', 300, 'Unb9'); c.restore();
  c.save(); c.beginPath(); c.rect(0, 1180, W, 740); c.clip(); c.restore(); }
// o4: the mirror: he sticks a nose strip on, sad
function mirrorView(c, t) { backdrop(c, t, '#E8E0F2', '#BFB2DA'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'mirror' });
  const t0 = ev('o4', 'mirror'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.5);
  c.save(); c.translate(540, 900); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(16, 22, 430, 600, 0, 0, TAU); c.fill(); c.fillStyle = '#C9A13A'; c.beginPath(); c.ellipse(0, 0, 430, 600, 0, 0, TAU); c.fill(); c.strokeStyle = '#8A6A2A'; c.lineWidth = 8; c.stroke();
  c.save(); c.beginPath(); c.ellipse(0, 0, 380, 550, 0, 0, TAU); c.clip(); const gg = c.createLinearGradient(-380, -550, 380, 550); gg.addColorStop(0, '#E9F4FA'); gg.addColorStop(1, '#B9D3E2'); c.fillStyle = gg; c.fillRect(-400, -560, 800, 1120);
  const g = G.bf12, st = { t, talk: talk('bf12', t), mood: 'sad', turn: 0, look: 0, lookY: 0.15, blink: 0.35, items: {}, armL: down(g, -1), armR: down(g, 1) };
  const stuck = t > ev('o4', 'stick');
  if (!stuck) { st.mood = 'worried'; st.lookY = 0.6; st.look = 0.2; }
  if (t > ev('o4', 'sigh')) { st.mood = 'sad'; st.blink = 0.55; st.lookY = 0.1; st.tilt = 0.05; }
  const sc = 2.1, hd = K.put(c, BF, st, 0, -g.headY * sc - 40, sc);
  noseStrip(c, hd, 0, stuck ? eBack(clamp((t - ev('o4', 'stick')) / 0.18), 2.5) : 0);
  if (!stuck) { const m = eOut(clamp((u - 0.1) / 0.5)), hx = lerp(560, hd.x + 40, m), hy = lerp(700, hd.y + hd.hh * 0.24, m); c.save(); c.translate(hx, hy); c.rotate(-0.1); c.fillStyle = '#F4E6D2'; c.strokeStyle = '#B89A70'; c.lineWidth = 4; rr(c, -110, -26, 220, 52, 22); c.fill(); c.stroke(); c.restore(); sleeve(c, '#F2C14E', 520, 760, hx + 120, hy + 40, 120); }
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-300, -380); c.lineTo(-200, -480); c.lineTo(-120, -480); c.lineTo(-260, -300); c.fill();
  c.restore(); c.restore(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }
// small time labels: «НОЧЬЮ» (hook flashback, twist night), «УТРОМ» (twist morning)
function timeLabel(c, t, txt, a, b, dark) { const k = eBack(P(t, a + 0.02, a + 0.25), 2.2) * (1 - eIn(P(t, b - 0.2, b))); if (k <= 0) return;
  c.save(); c.translate(540, 215); c.scale(k, k); c.rotate(-0.025); UI.font(c, 'Unb9', 48); const w = c.measureText(txt).width + 90;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -46 + 9, w, 92, 46); c.fill(); c.fillStyle = dark ? '#2B2F5A' : C.gold; rr(c, -w / 2, -46, w, 92, 46); c.fill(); c.fillStyle = dark ? C.white : C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2, y: 169, w, h: 92, k, id: 'time' }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + boyfriend (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bf12;
    const hb = K.put(c, BF, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { R: mugItem(t, 1, 0), L: phoneItem(1) }, armL: reach(gb, -1, -gb.sw * 1.5, gb.ySh + 40, { planar: true }), armR: hold(gb, 1, 260, 0.62) }, 640, 0);
    noseStrip(c, hb, -0.2, 1);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.08), wAt('outro', 'два', sp.t + 1.33), wAt('outro', 'три', sp.t + 1.6), wAt('outro', 'четыре', sp.t + 2.0)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 2.55) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - wAt('outro', 'сохрани', sp.t + 3.17)) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { ({ 'ui:cat': catView, 'ui:phone': phoneView, 'ui:note': noteView, 'ui:mirror': mirrorView, 'ui:phone2': phone2View })[tag](c, t); heads = { her: OFFL, bf12: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, tag === 'night' ? 0.4 : 0.24); }
  const onScr = {}; for (const k in heads) if (k !== 'night' && Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:') && tag !== 'night') K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, hold: { hook_b: 0.1, o1_h: -0.22, o1_b: 0.2, o2_h: -0.22, o2_b: -0.25, o3_h: -0.22, o3_b: -0.2, o4_h: -0.15, o4_b: -0.25, end_b: -0.25 } });
  if (L === 'hook') { title(c, t); timeLabel(c, t, 'НОЧЬЮ', hev('night'), hev('morning') - 0.05, true); }
  plate(c, t, sc);
  if (L === 'end') { timeLabel(c, t, 'НОЧЬЮ', ev('end', 'night'), ev('end', 'morning') - 0.05, true); timeLabel(c, t, 'УТРОМ', ev('end', 'morning'), ev('end', 'morning') + 1.1, false); }
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('snore', NF, renderFrame);
