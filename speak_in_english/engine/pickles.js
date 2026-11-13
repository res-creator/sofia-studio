// "Таможня нашла банку огурцов" — rubric «Наше за границей» (scene + 4 answers, worst -> best), hard_cut camera: node pickles.js start end out.mp4 | --png=f1,f2
// Airport customs desk: the heroine (left) in front of the inspection belt; Officer Pike (navy uniform, cap) behind it (right).
// Key prop: grandma's 3-litre jar of pickles on the belt; the X-ray monitor on the desk shows it glowing.
// Absurd background detail: on the CONFISCATED shelf behind Pike — a garden gnome in sunglasses with a SUSPICIOUS tag.
// Hook insert: the X-ray screen — a glowing jar with floating pickles.
// o1 «В ЛОБ»: "Cucumber. Grandma. Mine!" (she slaps the belt) — "Your grandma is in the jar?" he recoils; the alarm beacon; a WANTED poster with a granny drops onto the wall.
// o2 «ВЕЖЛИВО»: "It is a vegetable, I promise." — "Vegetables don't swim, madam."; insert: his pen taps the glass, the front pickle opens its eyes and nods.
// o3 «КАК НОСИТЕЛЬ»: "They're homemade pickles, for personal use..." — "Ah, pickles!"; the monitor turns green with a tick, he waves her through; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: snow on "three winters", confetti on "weddings"; "...The jar may proceed." — he salutes the jar, the belt carries it on.
// Twist (music silent): Pike looks around, unscrews the lid, bites a pickle — CRUNCH (shake, the gnome's glasses slip): "Tell your grandma... we need a second sample." —
// she smugly pulls a second jar out of her bag.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/pickles/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'coat', col: '#E86A9A', col2: '#F7E6EC' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#2B2F3A', acc: null } };
const PIKE = { ...BASE.greg, cap: { col: '#1F2A44', text: 'UK', textCol: '#F2C14E' }, top: { type: 'blazer', col: '#1F2A44', shirt: '#F7F9FC', tie: '#2B2F3A' }, bottom: { type: 'trousers', col: '#1F2A44' }, shoes: { col: '#1B1E26', acc: null } };
const G = { her: geom(HER), cust1: geom(PIKE) };
const X = { her: -300, off: 470 };
const CT = -760, CX0 = -60, CX1 = 1180;                  // inspection belt: top height, left/right end
const JX0 = 120, JX1 = 650, JS = 1.5;                    // the jar on the belt: start / after "may proceed", scale
const MX = 1010;                                          // X-ray monitor (on the desk, right end)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// a pickle (gherkin): centre (0,0), length along x
function pickle(c, len = 150, wid = 52, col = '#5E8C32', bite = 0) { c.save();
  c.fillStyle = col; c.strokeStyle = '#2F5418'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, len / 2, wid / 2, 0, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(-len * 0.05, -wid * 0.18, len * 0.36, wid * 0.12, 0, 0, TAU); c.fill();
  c.fillStyle = '#3E6A20'; for (let i = 0; i < 7; i++) { const x = -len * 0.38 + i * len * 0.12, y = (i % 2 ? 1 : -1) * wid * 0.2; c.beginPath(); c.arc(x, y, 4.5, 0, TAU); c.fill(); }
  if (bite > 0) { c.globalCompositeOperation = 'destination-out'; for (const dy of [-wid * 0.3, 0, wid * 0.3]) { c.beginPath(); c.arc(len / 2 + 6 - bite * len * 0.25, dy, wid * 0.28, 0, TAU); c.fill(); } c.globalCompositeOperation = 'source-over'; }
  c.restore(); }
function dill(c, x, y, a, s = 1) { c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s); c.strokeStyle = '#3F6E2A'; c.lineWidth = 5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -150); c.stroke(); c.lineWidth = 3; for (let i = 0; i < 6; i++) { const yy = -30 - i * 22; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, yy); c.lineTo(sd * 30, yy - 16); c.stroke(); } } c.restore(); }
// grandma's 3-litre jar: (0,0) = bottom centre, ~ 220 x 330 at s = 1.  o: n pickles, lid (0 on .. 1 off), eyes (front pickle opens eyes 0..1), nod (rad), xray
const PK = [[-48, -70, 0.25, 150], [44, -82, -0.3, 150], [-30, -150, -0.15, 140], [52, -170, 0.35, 135], [-4, -228, 0.05, 140]];
function jar(c, t, s = 1, o = {}) { c.save(); c.scale(s, s); const n = o.n ?? 5, xr = !!o.xray;
  if (!xr) { c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 4, 120, 16, 0, 0, TAU); c.fill(); }
  const body = q => { q.moveTo(-105, -30); q.quadraticCurveTo(-105, 0, -75, 0); q.lineTo(75, 0); q.quadraticCurveTo(105, 0, 105, -30); q.lineTo(105, -250); q.quadraticCurveTo(105, -282, 74, -292); q.lineTo(74, -308); q.lineTo(-74, -308); q.lineTo(-74, -292); q.quadraticCurveTo(-105, -282, -105, -250); q.closePath(); };
  // brine
  c.save(); c.beginPath(); body(c); c.clip();
  c.fillStyle = xr ? 'rgba(120,230,255,.18)' : '#D6E8A8'; c.fillRect(-120, -270, 240, 280);
  c.fillStyle = xr ? 'rgba(120,230,255,.08)' : '#EEF4E2'; c.fillRect(-120, -320, 240, 50);
  if (!xr) { dill(c, -70, -10, 0.15, 1.1); dill(c, 72, -14, -0.2, 1.0); dill(c, 10, -40, 0.05, 1.2); c.fillStyle = '#F7F2E0'; for (const [x, y] of [[-20, -30], [30, -112], [-64, -196]]) { c.beginPath(); c.ellipse(x, y, 16, 12, 0.4, 0, TAU); c.fill(); } }
  PK.forEach(([x, y, a, l], i) => { if (i >= n) return; const bob = Math.sin(t * 2.2 + i * 1.7) * 5; c.save(); c.translate(x, y + bob); c.rotate(a + Math.sin(t * 1.5 + i) * 0.04 + (i === 4 ? (o.nod || 0) : 0));
    if (xr) { c.strokeStyle = '#BFF6FF'; c.lineWidth = 7; c.shadowColor = '#7FE8FF'; c.shadowBlur = 24; c.beginPath(); c.ellipse(0, 0, l / 2, 26, 0, 0, TAU); c.stroke(); c.shadowBlur = 0; }
    else pickle(c, l, 52);
    if (i === 4 && (o.eyes || 0) > 0) { const e = o.eyes; for (const ex of [-22, 22]) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(ex, -4, 13, 13 * e, 0, 0, TAU); c.fill(); c.fillStyle = '#1B1E26'; c.beginPath(); c.arc(ex + 2, -2, 6 * e, 0, TAU); c.fill(); } }
    c.restore(); });
  c.fillStyle = xr ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.35)'; c.fillRect(-88, -250, 22, 220);
  c.restore();
  c.strokeStyle = xr ? '#BFF6FF' : 'rgba(90,120,100,.9)'; c.lineWidth = xr ? 8 : 5; if (xr) { c.shadowColor = '#7FE8FF'; c.shadowBlur = 30; } c.beginPath(); body(c); c.stroke(); c.shadowBlur = 0;
  // lid (screwed on; o.lid lifts it off to the right)
  const lk = o.lid || 0; c.save(); c.translate(lk * 140, -lk * 160); c.rotate(lk * 0.6);
  if (xr) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; rr(c, -84, -346, 168, 40, 10); c.stroke(); }
  else { paint(c, q => { q.m(-84, -306); q.l(84, -306); q.l(84, -346); q.l(-84, -346); q.z(); }, '#D9A93A', { sd: 3, hd: 1, lw: 4 }); c.strokeStyle = 'rgba(120,80,10,.5)'; c.lineWidth = 3; for (let x = -70; x <= 70; x += 14) { c.beginPath(); c.moveTo(x, -340); c.lineTo(x, -312); c.stroke(); } }
  c.restore(); c.restore(); }
// handheld props
const magItem = ctx => { ctx.save(); ctx.rotate(-0.5); ctx.fillStyle = '#5A3A22'; rr(ctx, -12, -10, 24, 110, 10); ctx.fill(); ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, -70, 56, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(190,230,255,.45)'; ctx.beginPath(); ctx.arc(0, -70, 50, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(-16, -86, 14, 0, TAU); ctx.fill(); ctx.restore(); };
const pickleItem = bite => ctx => { ctx.save(); ctx.translate(0, -60); ctx.rotate(-1.2); pickle(ctx, 160, 56, '#5E8C32', bite); ctx.restore(); };
const jarItem = t => ctx => { ctx.save(); ctx.translate(0, 120); jar(ctx, t, 0.75); ctx.restore(); };
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }

// ---------------- customs hall (prerendered, softly blurred)
const BX0 = -3600, BY0 = -4400, BW = 7600, BH = 6800, BS = 0.5;
function suitcaseIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; rr(c, -50, -36, 100, 76, 12); c.fill(); c.strokeStyle = col; c.lineWidth = 8; rr(c, -20, -56, 40, 24, 8); c.stroke(); c.restore(); }
function drawHall(c) {
  const g = c.createLinearGradient(0, BY0, 0, 0); g.addColorStop(0, '#DCE6E4'); g.addColorStop(1, '#EEF2EE'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  // wall panels
  c.fillStyle = 'rgba(0,0,0,.04)'; for (let x = BX0; x < BX0 + BW; x += 520) c.fillRect(x, BY0, 8, -BY0);
  c.fillStyle = '#B9C9C6'; c.fillRect(BX0, -700, BW, 700); c.fillStyle = '#A6B8B4'; c.fillRect(BX0, -720, BW, 24);
  // big CUSTOMS sign + the two channels
  c.fillStyle = '#1F2A44'; rr(c, -1300, -3000, 2200, 300, 30); c.fill(); fitTxt(c, 'CUSTOMS', -200, -2850, 190, '#F2C14E', 2000);
  c.fillStyle = '#2E9A6A'; rr(c, -3300, -2650, 1500, 360, 26); c.fill(); fitTxt(c, 'NOTHING TO', -2550, -2540, 110, '#FFFFFF', 1350); fitTxt(c, 'DECLARE', -2550, -2400, 110, '#FFFFFF', 1350);
  c.fillStyle = '#D9454A'; rr(c, 1900, -2650, 1500, 360, 26); c.fill(); fitTxt(c, 'GOODS TO', 2650, -2540, 110, '#FFFFFF', 1350); fitTxt(c, 'DECLARE', 2650, -2400, 110, '#FFFFFF', 1350);
  // arrivals window far left: planes
  c.fillStyle = '#8CB8D8'; c.fillRect(-3400, -2100, 1700, 1250); c.fillStyle = '#E8EEF2'; for (const x of [-2830, -2260]) c.fillRect(x, -2100, 26, 1250);
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(-2500, -1500, 420, 60, -0.08, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-2560, -1500); c.lineTo(-2700, -1720); c.lineTo(-2600, -1720); c.lineTo(-2420, -1500); c.fill(); c.beginPath(); c.moveTo(-2860, -1530); c.lineTo(-2920, -1680); c.lineTo(-2860, -1680); c.lineTo(-2780, -1530); c.fill();
  // baggage belt sign + suitcases on the far right
  c.fillStyle = '#2B2F3A'; rr(c, 1700, -2050, 900, 260, 24); c.fill(); suitcaseIcon(c, 1880, -1910, 1.4, '#F2C14E'); fitTxt(c, 'BAGGAGE', 2280, -1920, 92, '#FFFFFF', 520);
  for (const [x, col] of [[1900, '#C2504A'], [2250, '#3E73B8'], [2600, '#E8B04A'], [2950, '#6A5ACD']]) { c.fillStyle = col; rr(c, x - 120, -700, 240, 330, 26); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, x - 40, -760, 80, 60, 14); c.fill(); }
  // floor tiles
  c.fillStyle = '#D3D8DC'; c.fillRect(BX0, 0, BW, BY0 + BH); c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = 0; y < BY0 + BH; y += 220) for (let x = BX0 + ((y / 220) % 2) * 220; x < BX0 + BW; x += 440) c.fillRect(x, y, 220, 220);
  c.fillStyle = '#F2C14E'; c.fillRect(BX0, 300, BW, 30);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawHall);

// ---------------- live wall pieces: the CONFISCATED shelf with the gnome, the alarm beacon, the WANTED poster
const SHX0 = 760, SHX1 = 1480, SHY1 = -1300, SHY2 = -1760;
function gnome(c, x, y, t, slip) { c.save(); c.translate(x, y); const s = 1.05; c.scale(s, s);
  c.fillStyle = '#3E73B8'; paint(c, q => { q.m(-80, 0); q.l(80, 0); q.l(62, -130); q.l(-62, -130); q.z(); }, '#3E73B8', { sd: 3, hd: 1, lw: 4 });   // coat
  c.fillStyle = '#2B2F3A'; c.fillRect(-80, -60, 160, 16);   // belt
  c.fillStyle = '#F6D2B6'; c.beginPath(); c.arc(0, -165, 46, 0, TAU); c.fill();   // face
  paint(c, q => { q.m(-60, -170); q.q(-70, -60, 0, -40); q.q(70, -60, 60, -170); q.q(0, -120, -60, -170); q.z(); }, '#FFFFFF', { sd: 2, hd: 1, lw: 3 });   // beard
  c.fillStyle = '#F08A8A'; c.beginPath(); c.arc(0, -150, 15, 0, TAU); c.fill();   // nose
  paint(c, q => { q.m(-56, -190); q.q(-30, -330, 40, -340); q.q(10, -280, 56, -190); q.z(); }, '#E0474C', { sd: 3, hd: 1, lw: 4 });   // hat
  // sunglasses (slip down the nose on the crunch)
  c.save(); c.translate(0, slip * 22); c.fillStyle = '#1B1E26'; rr(c, -46, -192, 40, 24, 8); c.fill(); rr(c, 6, -192, 40, 24, 8); c.fill(); c.fillRect(-8, -186, 16, 5); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-40, -188, 10, 6); c.fillRect(12, -188, 10, 6); c.restore();
  if (slip > 0.5) { c.fillStyle = '#FFFFFF'; for (const ex of [-26, 26]) { c.beginPath(); c.arc(ex, -184, 9, 0, TAU); c.fill(); c.fillStyle = '#1B1E26'; c.beginPath(); c.arc(ex, -184, 4, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; } }
  // the tag on a string
  const sw = Math.sin(t * 1.6) * 0.05; c.save(); c.translate(60, -60); c.rotate(0.25 + sw); c.strokeStyle = '#8A7A5A'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(30, 46); c.stroke();
  c.translate(30, 46); c.rotate(-0.25); c.fillStyle = '#FFF8E0'; c.strokeStyle = '#B8860B'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(30, -22); c.lineTo(250, -22); c.lineTo(250, 50); c.lineTo(30, 50); c.lineTo(0, 28); c.closePath(); c.fill(); c.stroke();
  fitTxt(c, 'SUSPICIOUS', 140, 14, 44, '#D9454A', 200); c.restore();
  c.restore(); }
function shelf(c, t, L) {
  c.fillStyle = '#6E5A44'; for (const y of [SHY1, SHY2]) { c.fillRect(SHX0, y, SHX1 - SHX0, 30); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(SHX0, y + 30, SHX1 - SHX0, 14); c.fillStyle = '#6E5A44'; }
  c.fillStyle = '#5A4632'; for (const x of [SHX0 + 30, SHX1 - 30]) c.fillRect(x - 10, SHY2 - 40, 20, SHY1 - SHY2 + 80);
  c.fillStyle = '#2B2F3A'; rr(c, SHX0 + 40, SHY2 - 230, SHX1 - SHX0 - 80, 110, 18); c.fill(); fitTxt(c, 'CONFISCATED', (SHX0 + SHX1) / 2, SHY2 - 175, 64, '#F7F2E8', SHX1 - SHX0 - 140);
  // upper shelf: a salami, a giant bottle, a frying pan
  c.save(); c.translate(870, SHY2); c.rotate(-0.1); c.fillStyle = '#A8483A'; rr(c, -90, -70, 180, 70, 35); c.fill(); c.fillStyle = '#F2E2C8'; for (const [x, y] of [[-40, -40], [10, -30], [50, -46]]) { c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill(); } c.restore();
  c.fillStyle = '#4C8A5A'; rr(c, 1040, SHY2 - 230, 90, 230, 24); c.fill(); rr(c, 1066, SHY2 - 300, 38, 80, 10); c.fill(); c.fillStyle = '#F2E2C8'; rr(c, 1050, SHY2 - 150, 70, 60, 8); c.fill();
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.ellipse(1300, SHY2 - 40, 90, 34, 0, 0, TAU); c.fill(); c.fillRect(1380, SHY2 - 50, 110, 20);
  // lower shelf: the gnome + a rolled-up rug
  const slip = L === 'end' ? eOut(clamp((t - ev('end', 'bite')) / 0.3)) : L === 'outro' ? 1 : 0;
  gnome(c, 960, SHY1, t, slip);
  c.fillStyle = '#C2504A'; rr(c, 1250, SHY1 - 90, 200, 90, 45); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(1260, SHY1 - 45, 40, 0, TAU); c.fill(); c.strokeStyle = '#C2504A'; c.lineWidth = 6; c.beginPath(); c.arc(1260, SHY1 - 45, 22, 0, TAU); c.stroke();
  K.mark(c, 'gnome', 1000, SHY1 - 170, 200); }
const alarmOn = (t, L) => L === 'o1' && t > ev('o1', 'alarm') && t < ev('o1', 'alarm') + 1.6;
function beacon(c, t, L) { const on = alarmOn(t, L), x = 330, y = -2060;
  c.fillStyle = '#5A606E'; rr(c, x - 70, y, 140, 40, 10); c.fill();
  c.fillStyle = on ? '#FF3B3B' : '#B84A4A'; c.beginPath(); c.arc(x, y, 60, Math.PI, TAU); c.fill();
  if (on) { const a = t * 9; c.save(); c.globalAlpha = 0.45; c.fillStyle = '#FF6A6A'; for (const s of [0, Math.PI]) { c.beginPath(); c.moveTo(x, y - 30); c.arc(x, y - 30, 700, a + s - 0.25, a + s + 0.25); c.fill(); } c.restore(); } }
function wanted(c, t, L) { if (L !== 'o1') return; const u = t - ev('o1', 'wanted'); if (u < 0) return; const x = 120, y0 = -2000, drop = (1 - eBack(clamp(u / 0.3), 1.6)) * -700, sw = Math.sin(u * 9) * 0.12 * Math.exp(-u * 3);
  c.save(); c.translate(x, y0 + drop); c.rotate(sw); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-140 + 10, 14, 280, 360); c.fillStyle = '#F4E2B8'; c.strokeStyle = '#8A6A3A'; c.lineWidth = 6; c.fillRect(-140, 0, 280, 360); c.strokeRect(-140, 0, 280, 360);
  fitTxt(c, 'WANTED', 0, 50, 64, '#8A2A20', 240);
  // granny portrait: headscarf, glasses, smile
  c.fillStyle = '#F2CDB8'; c.beginPath(); c.arc(0, 190, 70, 0, TAU); c.fill();
  c.fillStyle = '#C2504A'; c.beginPath(); c.moveTo(-88, 210); c.quadraticCurveTo(-90, 90, 0, 98); c.quadraticCurveTo(90, 90, 88, 210); c.quadraticCurveTo(60, 150, 0, 140); c.quadraticCurveTo(-60, 150, -88, 210); c.fill();
  c.fillStyle = '#F2C14E'; for (const [dx, dy] of [[-40, 120], [0, 108], [40, 120]]) { c.beginPath(); c.arc(dx, dy, 8, 0, TAU); c.fill(); }
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; for (const ex of [-26, 26]) { c.beginPath(); c.arc(ex, 188, 17, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(-9, 188); c.lineTo(9, 188); c.stroke();
  c.beginPath(); c.arc(0, 215, 22, 0.2, Math.PI - 0.2); c.stroke();
  c.fillStyle = '#5E8C32'; c.save(); c.translate(0, 300); c.rotate(-0.1); pickle(c, 150, 44); c.restore();
  c.restore(); }
// the inspection desk: belt (moves while the jar proceeds), the X-ray monitor on the right end
const beltMove = (t, L) => L === 'o4' ? clamp((t - ev('o4', 'belt')) / 1.0) : 0;
function jarX(t, L) { if (L === 'o4') return lerp(JX0, JX1, eIO(beltMove(t, L))); if (L === 'end') return JX1; return JX0; }
function monitor(c, t, L) { const x = MX, y = CT;
  c.fillStyle = '#5A606E'; rr(c, x - 30, y - 80, 60, 80, 6); c.fill(); rr(c, x - 90, y - 16, 180, 16, 6); c.fill();
  c.fillStyle = '#2B2F3A'; rr(c, x - 170, y - 380, 340, 300, 18); c.fill();
  const green = (L === 'o3' && t > ev('o3', 'green')) || L === 'o4';
  c.fillStyle = green ? '#1E6A3E' : '#0E2A4A'; rr(c, x - 150, y - 360, 300, 260, 10); c.fill();
  c.save(); c.beginPath(); rr(c, x - 150, y - 360, 300, 260, 10); c.clip();
  if (green) { const k = L === 'o3' ? eBack(clamp((t - ev('o3', 'green')) / 0.3), 2) : 1; c.save(); c.translate(x, y - 230); c.scale(k, k); c.strokeStyle = '#7CFFAE'; c.lineWidth = 26; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-70, 0); c.lineTo(-20, 50); c.lineTo(80, -60); c.stroke(); c.restore(); }
  else { c.save(); c.translate(x, y - 120); jar(c, t, 0.68, { xray: true }); c.restore(); const sy = y - 360 + ((t * 120) % 260); c.fillStyle = 'rgba(160,240,255,.35)'; c.fillRect(x - 150, sy, 300, 8);
    if (Math.sin(t * 8) > 0) { c.strokeStyle = '#FF5050'; c.lineWidth = 6; c.strokeRect(x - 100, y - 350, 200, 240); } }
  c.restore(); }
function desk(c, t, L) {
  // belt top
  paint(c, q => { q.m(CX0, CT - 10); q.l(CX1, CT - 10); q.l(CX1, CT + 50); q.l(CX0, CT + 50); q.z(); }, '#3A3F4A', { sd: 6, hd: 3, lw: 4 });
  const off = beltMove(t, L) * 530; c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 6; for (let x = CX0 + 30 + (off % 90); x < CX1 - 10; x += 90) { c.beginPath(); c.moveTo(x, CT - 6); c.lineTo(x, CT + 46); c.stroke(); }
  // desk body
  paint(c, q => { q.m(CX0 + 20, CT + 50); q.l(CX1 - 20, CT + 50); q.l(CX1 - 20, -20); q.l(CX0 + 20, -20); q.z(); }, '#C9D2DA', { sd: 10, hd: 4, lw: 4 });
  c.fillStyle = '#1F2A44'; c.fillRect(CX0 + 20, CT + 120, CX1 - CX0 - 40, 60);
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 5; for (let x = CX0 + 330; x < CX1 - 20; x += 310) { c.beginPath(); c.moveTo(x, CT + 180); c.lineTo(x, -20); c.stroke(); }
  monitor(c, t, L); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
// hand to a point given in WORLD coords (character at feet x0)
const toW = (g, s, x0, wx, wy) => reach(g, s, wx - x0, wy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const HB = { x: X.her - 270, y: -230 };   // her travel bag on the floor (screen-left side)
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'worried', turn: 0.3, look: 0.75 };
  if (L === 'hook') { st.mood = 'worried'; st.armR = hold(g, 1, 300, 0.6); st.armL = hold(g, -1, 300, 0.6);
    if (t > hev('nar')) { st.mood = 'annoyed'; st.armL = down(g, -1); st.armR = toW(g, 1, X.her, JX0 - 120, CT - 120); } }
  if (L === 'o1') { st.mood = 'angry';
    if (speaking('o1_h', t, 0.05, 0.1)) { const u = t - SP.o1_h.t, beats = [0, 1.25, 2.1]; let hit = 0; for (const b of beats) hit = Math.max(hit, Math.exp(-Math.max(0, u - b) * 8) * (u > b ? 1 : 0)); st.armR = toW(g, 1, X.her, JX0 - 150, CT - 40 - 200 * (1 - hit)); st.headY = hit * 8; st.armL = open(g, -1, 1.4, 220); }
    if (t > SP.o1_c.t) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('alarm')) { st.mood = 'shock'; st.breathe = 0; st.armL = open(g, -1, 1.8, 40); st.armR = open(g, 1, 1.8, 40); }
    if (t > e('wanted') + 0.3) { st.mood = 'worried'; st.look = 0.4; st.lookY = -0.3; } }
  if (L === 'o2') { st.mood = 'worried';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'worried'; st.tilt = 0.06; st.armL = hold(g, -1, 260, 0.35); st.armR = hold(g, 1, 260, 0.35); }
    if (t > e('react')) { st.mood = 'worried'; st.blink = 0; st.armL = open(g, -1, 1.6, 150); st.armR = open(g, 1, 1.6, 150); } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'happy'; st.armR = toW(g, 1, X.her, JX0 - 140, CT - 150); gest(st, g, 'her', t, -1, 170); }
    if (t > SP.o3_c.t) { st.mood = 'happy'; st.armR = hold(g, 1, 330, 0.6); }
    if (t > e('wave')) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'o4') { st.mood = 'smug'; st.turn = 0.35; st.look = 0.8;
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = (t - SP.o4_h.t) * 3; st.mood = 'smug'; st.armR = toW(g, 1, X.her, JX0 - 140, CT - 160 + Math.sin(u) * 12); st.armL = reach(g, -1, -g.sw * (1.5 + 0.2 * Math.sin(u)), g.ySh + 160 + Math.cos(u) * 25, { planar: true }); if (t > ev('o4', 'c3')) { st.mood = 'happy'; st.armL = open(g, -1, 1.9, 60 + Math.sin(u) * 20); } }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; st.armR = hold(g, 1, 330, 0.6); st.armL = hold(g, -1, 330, 0.6); }
    if (t > e('salute')) { st.mood = 'happy'; st.blink = 0; st.laugh = t > e('belt'); } }
  if (L === 'end') { st.mood = 'neutral'; st.turn = 0.3; st.look = 0.8;
    if (t > e('bite')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.end_c.t + 0.6) { st.mood = 'surprised'; }
    if (t > e('jar2')) { const k = eOut(clamp((t - e('jar2')) / 0.45)); st.mood = 'smug'; st.blink = k > 0.5 ? 1 : 0; st.armL = reach(g, -1, lerp(HB.x - X.her + 20, -g.sw * 0.5, k), lerp(HB.y + 60, g.ySh + 300, k), { planar: true }); st.armR = reach(g, 1, g.sw * lerp(1.0, 1.2, k), g.ySh + lerp(500, 160, k), { planar: true }); st.items = { R: jarItem(t) }; st.turn = 0.35; st.look = 0.9; }
    if (t > e('moral')) { st.mood = 'happy'; st.blink = 0; st.laugh = true; } }
  return st; }
function offState(t, L) { const g = G.cust1, e = k => ev(L, k), st = { ...base(g, t, 'cust1'), mood: 'skeptical', turn: -0.3, look: -0.8, armL: hold(g, -1, 330, 0.5), armR: hold(g, 1, 330, 0.5) };
  const lens = () => { st.armL = toW(g, -1, X.off, JX0 + 190, CT - 420 + Math.sin(t * 2) * 15); st.items = { L: magItem }; };
  if (L === 'hook') { st.mood = 'skeptical'; lens(); st.lookY = 0.3; if (speaking('hook_c', t, 0.05, 0.1)) st.lookY = 0.1; if (t > hev('wide')) { st.lookY = 0.4; } }
  if (L === 'o1') { st.mood = 'skeptical'; lens();
    if (t > SP.o1_c.t - 0.05) { st.mood = 'surprised'; st.blink = 0; st.lookY = 0.3; }
    if (t > e('recoil')) { const k = eOut(clamp((t - e('recoil')) / 0.2)); st.mood = 'shock'; st.breathe = 0; st.items = {}; st.armL = open(g, -1, lerp(1.0, 1.9, k), lerp(300, 30, k)); st.armR = open(g, 1, lerp(1.0, 1.9, k), lerp(300, 30, k)); st.headX = 30 * k; st.tilt = 0.08 * k; }
    if (t > e('alarm') + 0.8) { st.mood = 'worried'; st.look = -0.4; st.lookY = -0.3; } }
  if (L === 'o2') { st.mood = 'skeptical'; lens(); st.lookY = 0.3;
    if (speaking('o2_c', t, 0.05, 0.1)) { st.mood = 'skeptical'; st.lookY = 0; st.items = {}; st.armL = hold(g, -1, 330, 0.5); gest(st, g, 'cust1', t, 1, 180); }
    if (t > e('react')) { st.mood = 'skeptical'; st.items = {}; st.armL = hold(g, -1, 330, 0.5); st.armR = hold(g, 1, 330, 0.5); st.lookY = 0.35; st.look = -0.9; } }
  if (L === 'o3') { st.mood = 'neutral'; lens();
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'neutral'; st.lookY = -0.1; st.look = -0.9; }
    if (t > SP.o3_c.t - 0.05) { st.mood = 'happy'; st.items = {}; st.armL = open(g, -1, 1.6, 110); st.armR = hold(g, 1, 330, 0.5); st.lookY = 0; }
    if (t > e('wave')) { const u = (t - e('wave')) * 6; st.mood = 'happy'; st.blink = 1; st.armL = open(g, -1, 2.0 + 0.15 * Math.sin(u), 140); } }
  if (L === 'o4') { st.mood = 'neutral'; st.items = {};
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > ev('o4', 'c2') ? 'surprised' : 'skeptical'; if (t > ev('o4', 'c3')) { st.mood = 'shock'; st.blink = 0; } }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.o4_c.t - 0.05) { st.mood = 'sad'; st.blink = 1; st.lookY = 0.2; }
    if (t > e('salute')) { const k = eOut(clamp((t - e('salute')) / 0.3)); st.mood = 'happy'; st.blink = 1; st.lookY = 0.4; st.headY = 34 * k; st.tilt = 0.06 * k;   // a deep respectful bow, palm open toward the jar: "after you"
      st.armR = reach(g, 1, g.sw * lerp(0.6, 2.2, k), g.ySh + lerp(330, 220, k), { planar: true }); st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 320, { planar: true }); st.look = 0.4; } }
  if (L === 'end') { st.mood = 'neutral'; st.items = {}; const u = t - e('look');
    if (t < e('open')) { st.mood = 'skeptical'; st.look = Math.sin(u * 7) > 0 ? 0.9 : -0.9; st.turn = 0; st.armR = toW(g, 1, X.off, JX1 + 10, CT - 200); }
    if (t > e('open') - 0.02 && t < e('bite')) { st.mood = 'happy'; st.look = 0.3; st.lookY = 0.4; st.armR = toW(g, 1, X.off, JX1 + 30, CT - 420 - 60 * clamp((t - e('open')) / 0.4)); st.armL = toW(g, -1, X.off, JX1 - 60, CT - 160); }
    if (t > e('bite') - 0.25) { const k = eOut(clamp((t - e('bite') + 0.25) / 0.25)); st.mood = 'happy'; st.blink = 1; st.armL = reach(g, -1, lerp(-g.sw * 0.3, -g.hw * 0.3, k), lerp(g.ySh + 200, g.headY + g.hh * 0.75, k), { planar: true }); st.items = { L: pickleItem(t > e('bite') ? 1 : 0) }; st.headFirst = false; st.look = 0; st.lookY = 0; }
    if (t > e('bite') + 0.5) { st.blink = 0; st.mood = 'surprised'; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 120, { planar: true }); }
    if (speaking('end_c', t, 0, 0)) { st.mood = 'happy'; st.look = -0.7; }
    if (t > e('jar2')) { st.mood = 'surprised'; st.blink = 0; st.look = -0.8; }
    if (t > e('moral')) { st.mood = 'happy'; st.laugh = true; } }
  return st; }
const lidK = (t, L) => L === 'end' ? eIO(clamp((t - ev('end', 'open')) / 0.45)) : 0;
const pickN = (t, L) => L === 'end' && t > ev('end', 'bite') - 0.3 ? 4 : 5;

// ---------------- world + which characters each shot draws (clean singles)
const DRAW = { wide: ['her', 'cust1'], cover: ['her', 'cust1'], two: ['her', 'cust1'], three: ['her', 'cust1'], her: ['her'], off: ['cust1'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function fx(c, t, L) {   // snow ("three winters") and confetti ("weddings") over the jar in o4
  if (L !== 'o4') return; const sn = t - ev('o4', 'snow'), cf = t - ev('o4', 'confetti');
  if (cf > 0 && cf < 2.2) { const a = clamp((2.2 - cf) / 0.4); c.save(); c.globalAlpha = a; const cols = ['#E86A9A', '#F2C14E', '#4CAF6A', '#3E73B8', '#8E5BD0'];
    for (let i = 0; i < 60; i++) { const ang = (i * 2.399) % TAU, v = 900 + (i % 7) * 120, x = JX0 + Math.cos(ang) * v * cf * 0.8, y = CT - 360 - Math.abs(Math.sin(ang)) * v * cf + 900 * cf * cf; c.save(); c.translate(x, y); c.rotate(cf * 8 + i); c.fillStyle = cols[i % 5]; c.fillRect(-14, -8, 28, 16); c.restore(); } c.restore(); } }
function snowFx(c, t, L) { if (L !== 'o4') return; const sn = t - ev('o4', 'snow'); if (sn <= 0 || sn > 2.4) return; const a = clamp(sn / 0.2) * clamp((2.4 - sn) / 0.4);
  c.save(); c.globalAlpha = a; c.fillStyle = '#FFFFFF'; c.strokeStyle = '#7FA6CC'; c.lineWidth = 4;
  for (let i = 0; i < 60; i++) { const x = ((i * 197) % 1140) - 30 + Math.sin(t * 2 + i) * 30, y = -100 + ((i * 331 + sn * 520 * (0.7 + (i % 4) * 0.15)) % 2000), r = 14 + (i % 4) * 6; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke(); } c.restore(); }
function crunchFx(c, t, L) { if (L !== 'end') return; const u = t - ev('end', 'bite'); if (u < 0 || u > 0.9) return;
  c.save(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 14; c.globalAlpha = 1 - u / 0.9; for (const k of [1, 0.65, 0.35]) { c.beginPath(); c.arc(X.off - 60, G.cust1.headY + 120, 120 + 1300 * u * k, 0, TAU); c.stroke(); } c.restore(); }
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  shelf(c, t, L); beacon(c, t, L); wanted(c, t, L);
  if (who.includes('cust1')) heads.cust1 = K.put(c, PIKE, offState(t, L), X.off, 0);
  desk(c, t, L);
  c.save(); c.translate(jarX(t, L), CT - 10); jar(c, t, JS, { lid: lidK(t, L), n: pickN(t, L) }); c.restore(); K.mark(c, 'jar', jarX(t, L), CT - 220, 230);
  if (who.includes('her')) { // shoulder bag at her hip, then her
    c.save(); c.translate(HB.x, 0); c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 0, 150, 18, 0, 0, TAU); c.fill(); c.fillStyle = '#8E5BD0'; c.strokeStyle = '#4A2A7A'; c.lineWidth = 6; rr(c, -130, -250, 260, 250, 40); c.fill(); c.stroke();
      c.lineWidth = 12; c.beginPath(); c.moveTo(-80, -245); c.quadraticCurveTo(0, -420, 80, -245); c.stroke(); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, -150, 16, 0, TAU); c.fill(); c.restore();
    heads.her = K.put(c, HER, herState(t, L), X.her, 0); }
  if (who.includes('cust1') && L === 'o1') sweat(c, heads.cust1, t, clamp((t - ev('o1', 'recoil')) / 0.3) * (t < ev('o1', 'alarm') + 1.6 ? 1 : 0));
  if (who.includes('her') && L === 'o2') sweat(c, heads.her, t, clamp((t - ev('o2', 'react')) / 0.3));
  fx(c, t, L); crunchFx(c, t, L);
  if (!heads.her) heads.her = OFFL; if (!heads.cust1) heads.cust1 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(390, fy(HY('cust1'), 0.55, 960), 0.55, 'cover'), WIDE: S(470, fy(HY('cust1'), 0.5, 760), 0.5, 'wide'),
  TWO: S(60, fy(HY('cust1'), 0.66, 660), 0.66, 'two'), THREE: S(200, fy(HY('cust1'), 0.62, 700), 0.62, 'three'),
  HER: S(X.her + 40, fy(HY('her'), 1.0), 1.0, 'her'), HER_CU: S(X.her + 30, fy(HY('her'), 1.25, 900), 1.25, 'her'),
  OFF: S(X.off - 20, fy(HY('cust1'), 1.0), 1.0, 'off'), OFF_E: S(X.off + 60, fy(HY('cust1'), 0.95, 860), 0.95, 'off'),
  XRAY: U('xray', 1), JAR: U('jar', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('xray') - 0.02) return SH.COVER; if (t < hev('wide')) return f(SH.XRAY); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_c.t - 0.1) return f(SH.HER); if (t < e('alarm') - 0.02) return f(SH.OFF); if (t < SP.o1_nar.t - 0.05) return f(SH.WIDE); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_c.t - 0.1) return f(SH.HER); if (t < e('tap')) return f(SH.OFF); if (t < e('react') - 0.02) return f(SH.JAR); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_c.t - 0.1) return f(SH.HER); if (t < e('green') - 0.02) return f(SH.OFF); if (t < SP.o3_nar.t - 0.05) return f(SH.WIDE); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('c2') - 0.03) return f(SH.HER); if (t < e('c3') - 0.03) return f(SH.THREE); if (t < e('gasp') - 0.02) return f(SH.HER_CU); if (t < e('salute') - 0.02) return f(SH.OFF); return f(SH.WIDE); }
  if (L === 'end') { if (t < e('bite') - 0.02) return f(SH.OFF_E); if (t < SP.end_c.t - 0.1) return f(SH.WIDE); if (t < e('jar2') - 0.02) return f(SH.OFF_E); if (t < e('moral') - 0.05) return f(SH.HER); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'crunch']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// the X-ray screen: the jar glows, pickles float, a red box blinks around it
function xrayView(c, t) { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'xray' });
  const u = t - hev('xray'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.fillStyle = '#2B2F3A'; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 900); c.scale(k, k);
  c.fillStyle = '#5A606E'; rr(c, -500, -700, 1000, 1240, 60); c.fill(); c.fillStyle = '#0A2140'; rr(c, -460, -660, 920, 1160, 34); c.fill();
  c.save(); c.beginPath(); rr(c, -460, -660, 920, 1160, 34); c.clip();
  c.strokeStyle = 'rgba(120,200,255,.12)'; c.lineWidth = 3; for (let x = -460; x < 460; x += 80) { c.beginPath(); c.moveTo(x, -660); c.lineTo(x, 500); c.stroke(); } for (let y = -660; y < 500; y += 80) { c.beginPath(); c.moveTo(-460, y); c.lineTo(460, y); c.stroke(); }
  c.save(); c.translate(0, 330); jar(c, t, 2.55, { xray: true }); c.restore();
  const sy = -660 + ((u * 700) % 1160); c.fillStyle = 'rgba(160,240,255,.3)'; c.fillRect(-460, sy, 920, 14);
  if (Math.sin(u * 9) > -0.2) { c.strokeStyle = '#FF4A4A'; c.lineWidth = 12; c.setLineDash([46, 24]); c.strokeRect(-330, -560, 660, 950); c.setLineDash([]); }
  c.restore();
  c.fillStyle = '#FF4A4A'; c.beginPath(); c.arc(400, -620, 16 + 4 * Math.sin(u * 10), 0, TAU); c.fill();
  c.restore(); }
// close-up of the jar: Pike's pen taps the glass three times, the front pickle opens its eyes and nods
function jarView(c, t) { backdrop(c, t, '#D8EEC8', '#9CC88A'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'jar' });
  const t0 = ev('o2', 'tap'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6), n0 = ev('o2', 'nod') - t0;
  const eyes = eOut(clamp((u - n0 + 0.15) / 0.2)), nod = u > n0 ? Math.sin(clamp((u - n0) / 0.8) * Math.PI * 2) * 0.35 * Math.exp(-Math.max(0, u - n0 - 0.4) * 2) : 0;
  c.save(); c.translate(540, 1330); c.scale(k * 2.5, k * 2.5); jar(c, t, 1, { eyes, nod }); c.restore();
  // the pen (from the right), tapping 3 times
  let tap = 0; for (let i = 0; i < 3; i++) { const v = u - (0.2 + i * 0.28); if (v > 0 && v < 0.2) tap = Math.max(tap, Math.sin(v / 0.2 * Math.PI)); }
  const pin = eOut(clamp(u / 0.2)) * (1 - eIn(clamp((u - 1.15) / 0.25)));
  if (pin > 0) { c.save(); c.translate(lerp(1250, 830 - tap * 60, pin), 900); c.rotate(-0.35);
    c.fillStyle = '#1F2A44'; rr(c, 0, -22, 420, 44, 20); c.fill(); c.fillStyle = '#C9D2DA'; c.beginPath(); c.moveTo(0, -20); c.lineTo(-60, 0); c.lineTo(0, 20); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(-44, -6); c.lineTo(-60, 0); c.lineTo(-44, 6); c.fill(); c.fillStyle = '#F2C14E'; c.fillRect(80, -26, 18, 52);
    c.fillStyle = '#EBB896'; c.beginPath(); c.ellipse(330, 0, 110, 80, 0, 0, TAU); c.fill(); c.strokeStyle = '#C08A68'; c.lineWidth = 4; c.stroke(); c.restore();
    if (tap > 0.6) { c.save(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; for (const a of [-0.6, 0, 0.6]) { c.beginPath(); c.moveTo(760 + Math.cos(Math.PI + a) * 40, 880 + Math.sin(Math.PI + a) * 40); c.lineTo(760 + Math.cos(Math.PI + a) * 90, 880 + Math.sin(Math.PI + a) * 90); c.stroke(); } c.restore(); } } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  // rubric label (small, on the top edge of the title card)
  c.save(); c.translate(-300, -165); c.rotate(-0.03); c.fillStyle = '#2E9A6A'; rr(c, -170, -30, 340, 60, 30); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); UI.textFit(c, 'Unb9', 28, 'НАШЕ ЗА ГРАНИЦЕЙ', 300); c.fillStyle = C.white; c.fillText('НАШЕ ЗА ГРАНИЦЕЙ', 0, 2); c.restore();
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 105, w: 980, h: 360, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ak = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine with her jar + Pike with a pickle (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.cust1; K.put(c, PIKE, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { R: pickleItem(1) }, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 1.3, gm.ySh + 120, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: hold(g, 1, 260, 0.8), items: { R: jarItem(t) } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // top: «А ТЫ БЫ ОТВЕТИЛА КАК?» -> on the ask line: «ЧТО ВЕЗЛА ТВОЯ МАМА В РУЧНОЙ КЛАДИ?»
  const sw_ = eIO(P(t, ak.t - 0.2, ak.t + 0.1)), q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - sw_);
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const q2 = eBack(P(t, ak.t - 0.05, ak.t + 0.3), 2.2);
  if (q2 > 0) { const pu = 1 + 0.03 * Math.sin(t * 6); c.save(); c.translate(540, 290); c.scale(q2 * pu, q2 * pu); c.rotate(-0.02); textFit(c, 'Unb9', 72, 'ЧТО ВЕЗЛА', 900); strokeText(c, 'ЧТО ВЕЗЛА', 0, -95, C.oliveD, C.white, 14); textFit(c, 'Unb9', 96, 'ТВОЯ МАМА', 900); strokeText(c, 'ТВОЯ МАМА', 0, 0, C.pink, C.white, 16); textFit(c, 'Unb9', 60, 'В РУЧНОЙ КЛАДИ?', 900); strokeText(c, 'В РУЧНОЙ КЛАДИ?', 0, 92, C.oliveD, C.white, 14); c.restore(); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)), gone = 1 - P(t, subT + 1.6, subT + 1.9); if (gone > 0) { c.save(); c.globalAlpha = gone; UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); c.restore(); } }
  c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { if (tag === 'ui:jar') jarView(c, t); else xrayView(c, t); heads = { her: OFFL, cust1: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24);
    snowFx(c, t, L);
    if (alarmOn(t, L)) { c.save(); c.globalAlpha = 0.16 * (0.5 + 0.5 * Math.sin(t * 18)); c.fillStyle = '#FF2020'; c.fillRect(0, 0, W, HH); c.restore(); } }
  const names = { cust1: ['OFFICER PIKE', '#1F2A44'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_c: -0.2, o1_h: -0.22, o1_c: 0.1, o2_h: -0.22, o2_c: -0.2, o3_h: -0.22, o3_c: 0.05, o4_h: -0.15, o4_c: 0.05, end_c: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('pickles', NF, renderFrame);
