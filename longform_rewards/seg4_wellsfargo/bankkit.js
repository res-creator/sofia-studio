// Long-form "When Paying People Backfired", Chapter 4 "The Fake Accounts" — the bank kit, drawn on howitsrun_style (16:9).
// A generic bank branch (night and day), clerks at desks, the daily target board, the BONUS envelope, paper account cards, a small
// fee tag, the "PRODUCTS PER CUSTOMER" chart, a generic Senate hearing room, the regulator's podium, file stacks, office boxes.
// No logos, no brand colours (no red/yellow bank look: the bank is stone + navy), the bank's name only ever as plain text.
// All people are generic re-enactment figures (never a likeness of a real person).
// World space: floor y = 0, up is negative, x centred on 0 (draw inside ST.layer).
process.env.HIR_WIDE = '1';
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const LT = require('../../hirkit/light');
const CL = require('../../hirkit/collage');
const ST = require('../../howitsrun_style/style');
const SE = require('../../howitsrun_style/sets');
const P = require('../../howitsrun_style/people');
const { C, F, clamp, lerp, E, rr, hash } = K;
const { INK, fillStroke, ell, px, tube, shade } = R;
const { txt, fitTxt, PAL, FONT } = ST;

const NAVY = '#2E3A59', STONE = '#D8D2C4', STONED = '#B9B1A3', NIGHT = '#1B2238';
const KIND = { CHECKING: '#4D8DFF', SAVINGS: '#2FA37E', 'CREDIT CARD': '#7A5AA8', 'DEBIT CARD': '#3E8E9E', 'ONLINE BANKING': '#5E6E8E' };

// ---------- cast (generic people; identity = clothes + one accessory) ----------
const LK = {
  clerkA: { skin: '#E3B08C', hair: '#3A2418', hairStyle: 'bun', top: '#3E4A66', cuff: '#34405A', shirt: '#FFFDF8', pants: '#2A2E38', shoes: '#171717', iris: '#3A2414', brow: '#3A2418', lashes: 1, lips: '#B0605A' },
  clerkB: { skin: '#C98E66', hair: '#1E1612', hairStyle: 'short', top: '#BFD4F2', cuff: '#A9C2E4', shirt: '#FFFDF8', pants: '#3E4450', shoes: '#4A3424', sole: '#2E2018', iris: '#2A1A10', brow: '#1E1612' },
  clerkC: { skin: '#F0C3A2', hair: '#8A5A2A', hairStyle: 'long', top: '#5E7A6E', cuff: '#4E6A5E', shirt: '#FFFDF8', pants: '#2E3A44', shoes: '#171717', iris: '#4E6B3C', brow: '#6A4020', lashes: 1, lips: '#B0605A' },
  clerkD: { skin: '#8D5A3C', hair: '#171210', hairStyle: 'curly', top: '#E7DCC4', cuff: '#D3C6A8', shirt: '#FFFDF8', pants: '#4D5F86', shoes: '#5A3A22', sole: '#2E2018', iris: '#2A1A10', brow: '#171210' },
  ceo: { skin: '#F0C3A2', hair: '#C9C9CE', hairStyle: 'short', top: '#2B2F3A', cuff: '#23262F', shirt: '#FFFDF8', pants: '#2B2F3A', shoes: '#171717', iris: '#3A5A7A', brow: '#A8A8AE', glasses: 1 },
  senA: { skin: '#E8B48F', hair: '#D8D8DC', hairStyle: 'short', top: '#3A4256', cuff: '#30374A', shirt: '#FFFDF8', pants: '#3A4256', shoes: '#171717', iris: '#3A2414', brow: '#C8C8CC' },
  senB: { skin: '#D9A27E', hair: '#4A3020', hairStyle: 'long', top: '#6A3E4E', cuff: '#5A3442', shirt: '#FFFDF8', pants: '#2A2E38', shoes: '#171717', iris: '#3A2414', brow: '#3A2418', lashes: 1, lips: '#9A4A42', glasses: 1 },
  senC: { skin: '#C98E66', hair: '#2A1E16', hairStyle: 'short', top: '#4A4F57', cuff: '#3E434A', shirt: '#FFFDF8', pants: '#4A4F57', shoes: '#171717', iris: '#2A1A10', brow: '#2A1E16', beard: '#3A3A3A' },
  director: { skin: '#EBC09C', hair: '#6A4A2A', hairStyle: 'short', top: '#4A5468', cuff: '#3E475A', shirt: '#FFFDF8', pants: '#3A4050', shoes: '#171717', iris: '#4E6B3C', brow: '#5A3A22', glasses: 1 },
  customer: { skin: '#E0A47C', hair: '#7A4A2A', hairStyle: 'short', top: '#C47A5A', cuff: '#A8664A', pants: '#4D5F86', shoes: '#F4F1E8', sole: '#C9C1B1', iris: '#4A6A8A', brow: '#5A3418' },
  investorA: { skin: '#F0C3A2', hair: '#2A1E16', hairStyle: 'short', top: '#5B6E9E', cuff: '#4D5E88', shirt: '#FFFDF8', pants: '#3A4050', shoes: '#171717', iris: '#3A2414', brow: '#2A1E16' },
  investorB: { skin: '#D9A27E', hair: '#A0522D', hairStyle: 'bun', top: '#8A7A5A', cuff: '#76683F', shirt: '#FFFDF8', pants: '#3E3A34', shoes: '#4A3424', iris: '#3A2414', brow: '#6A3A1A', lashes: 1, lips: '#9A4A42' },
};
const TIE = { ceo: '#5B6E9E', senA: '#7A8AA8', senC: '#3E6A5A', director: '#6A5A8A', clerkB: NAVY, investorA: '#3E4A66' };
function who(ctx, x, y, s, facing, name, Pz = {}, o = {}) {
  const L = { ...LK[name], ...(o.L || {}) };
  return P.person(ctx, x, y, s, facing, L, Pz, { tie: o.tie === false ? null : (o.tie || TIE[name]), badge: o.badge });
}
function whoSeated(ctx, x, y, s, facing, name, Pz = {}, o = {}) {
  const L = { ...LK[name], ...(o.L || {}) };
  return P.seated(ctx, x, y, s, facing, L, { chairCol: o.chairCol || '#3E4450', ...Pz }, { tie: o.tie === false ? null : (o.tie || TIE[name]), badge: o.badge });
}
const face = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: ST.blink(t, 3.3, o) });

// ---------- the bank building (day or night), centred at 0 ----------
function bankFront(ctx, t, o = {}) {
  const night = !!o.night;
  if (night) {
    SE.skyFill(ctx, '#0F1426', '#2B3656', -2600, 0);
    for (let i = 0; i < 70; i++) { const x = (hash(i) - 0.5) * 6000, y = -2500 + hash(i + 9) * 1500, tw = 0.5 + 0.5 * Math.sin(t * 2 + i); ctx.fillStyle = `rgba(255,250,230,${0.35 + 0.4 * tw})`; ell(ctx, x, y, 3, 3); ctx.fill(); }
    ell(ctx, 1100, -1850, 90, 90); ctx.fillStyle = '#F4F1E0'; ctx.fill(); LT.glow(ctx, 1100, -1850, 380, 'rgba(220,230,255,1)', 0.25);
  } else SE.sky(ctx, t, { clouds: 3, hills: false });
  // neighbours
  const nb = night ? ['#262E48', '#2E3654', '#232A42'] : ['#E6D8C0', '#D9CDB8', '#E8DCC8'];
  for (const [x, w, h, i] of [[-2700, 900, 1300, 0], [-1800, 700, 900, 1], [1050, 800, 1150, 2], [1850, 900, 1400, 0]]) {
    rr(ctx, x, -h, w, h, 4); fillStroke(ctx, nb[i], 5);
    for (let r = 0; r < Math.floor(h / 260); r++) for (let c = 0; c < Math.floor(w / 220); c++) { const lit = night && hash(r * 7 + c * 3 + i) > 0.82; rr(ctx, x + 60 + c * 220, -h + 80 + r * 260, 120, 150, 6); fillStroke(ctx, lit ? '#FFE3A0' : (night ? '#1A2036' : '#BFE0FA'), 4); }
  }
  // the bank: stone hall with columns, pediment, a plain sign
  const st = night ? '#5A6280' : STONE, stD = night ? '#48506C' : STONED;
  ctx.save(); ctx.translate(o.x || 0, 0);
  SE.poly(ctx, [[-820, -1080], [0, -1330], [820, -1080]], stD, 5);
  rr(ctx, -800, -1080, 1600, 1080, 4); fillStroke(ctx, st, 5);
  rr(ctx, -840, -1100, 1680, 60, 6); fillStroke(ctx, stD, 5);
  CL.cutout(ctx, () => rr(ctx, -360, -1010, 720, 120, 10), night ? '#2A3250' : NAVY, { elev: 0.8, tex: 0.4 });
  fitTxt(ctx, o.sign || 'BANK', 0, -925, 78, night ? '#D9DEEA' : PAL.cream, 640);
  for (let i = 0; i < 6; i++) { const x = -660 + i * 264; rr(ctx, x - 44, -860, 88, 760, 8); fillStroke(ctx, night ? '#6A7290' : '#E9E3D6', 5); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x + 14, -856, 26, 752); }
  for (let i = 0; i < 5; i++) { const x = -528 + i * 264; if (i === 2) continue; const lit = night && (o.litWin ?? 1) === i; rr(ctx, x - 70, -720, 140, 340, 8); fillStroke(ctx, lit ? '#FFE7A8' : (night ? '#1E2640' : '#9FC7E6'), 4.5); if (lit) LT.glow(ctx, x, -560, 260, 'rgba(255,230,160,1)', 0.35); }
  rr(ctx, -110, -460, 220, 360, 8); fillStroke(ctx, night ? '#2A2F44' : '#6A4A30', 5); ell(ctx, 80, -280, 10, 10); fillStroke(ctx, '#C9CED6', 3);
  for (let i = 0; i < 3; i++) { rr(ctx, -820 - i * 40, -100 + i * 34, 1640 + i * 80, 34, 4); fillStroke(ctx, stD, 4); }
  ctx.restore();
  // pavement + street lamp
  ctx.fillStyle = night ? '#2A2F40' : '#B9B1A3'; ctx.fillRect(-6000, 0, 12000, 1600);
  ctx.fillStyle = night ? '#1E2232' : '#8E877A'; ctx.fillRect(-6000, 0, 12000, 16);
  if (o.lamp !== false) { const lx = o.lampX ?? -1050; tube(ctx, [[lx, 0], [lx, -980]], 26, '#3A3F4E', 4.5); tube(ctx, [[lx, -980], [lx + 110, -1020]], 18, '#3A3F4E', 4);
    rr(ctx, lx + 70, -1030, 90, 60, 10); fillStroke(ctx, night ? '#FFF1C8' : '#E9E3D6', 4); if (night) { LT.glow(ctx, lx + 115, -980, 520, 'rgba(255,225,150,1)', 0.45); ctx.fillStyle = 'rgba(255,225,150,0.12)'; ctx.beginPath(); ctx.moveTo(lx + 80, -980); ctx.lineTo(lx - 260, 0); ctx.lineTo(lx + 480, 0); ctx.lineTo(lx + 150, -980); ctx.closePath(); ctx.fill(); } }
}

// ---------- branch interior (day / after hours) ----------
function branch(ctx, t, o = {}) {
  const night = !!o.night;
  SE.room(ctx, t, { wall: night ? '#4A5470' : '#DCE6EE', floor: 'tile' });
  if (night) { ctx.fillStyle = 'rgba(20,26,50,0.35)'; ctx.fillRect(-3000, 0, 6000, 1600); }
  // wall stripe + clock + poster
  ctx.fillStyle = night ? '#3A4360' : '#C9D6E2'; ctx.fillRect(-3000, -1080, 6000, 70);
  const cx = o.clockX ?? 600; ell(ctx, cx, -900, 70, 70); fillStroke(ctx, '#FFFDF8', 5); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.lineCap = 'round';
  const hr = o.hour ?? (night ? 11 : 9.2); ctx.beginPath(); ctx.moveTo(cx, -900); ctx.lineTo(cx + Math.sin(hr / 6 * Math.PI) * 38, -900 - Math.cos(hr / 6 * Math.PI) * 38); ctx.moveTo(cx, -900); ctx.lineTo(cx + Math.sin(t * 0.6) * 55, -900 - Math.cos(t * 0.6) * 55); ctx.stroke();
  if (o.poster !== false) { const px0 = o.posterX ?? -900; ctx.save(); ctx.translate(px0, -830); CL.cutout(ctx, () => rr(ctx, -200, -170, 400, 300, 10), night ? '#3A4360' : NAVY, { elev: 0.8 });
    fitTxt(ctx, 'OPEN AN ACCOUNT', 0, -70, 44, PAL.cream, 360); fitTxt(ctx, 'TODAY!', 0, -10, 60, '#BFD4F2', 340); acctCard(ctx, 'CHECKING', { s: 0.42, x: -70, y: 70, rot: -0.12 }); acctCard(ctx, 'SAVINGS', { s: 0.42, x: 80, y: 74, rot: 0.1 }); ctx.restore(); }
  if (night) { ctx.fillStyle = 'rgba(10,14,30,0.25)'; ctx.fillRect(-3000, -2400, 6000, 2400); }
}
// a clerk's desk: front panel at x (centre), top at -300; a monitor seen side-on at mx (relative)
function clerkDesk(ctx, x, o = {}) {
  ctx.save(); ctx.translate(x, 0); const w = o.w || 560;
  if (o.monitor !== false) { const mx = o.mx ?? 120; rr(ctx, mx - 10, -400, 20, 100, 4); fillStroke(ctx, '#3A3F4E', 4); rr(ctx, mx - 60, -312, 120, 16, 6); fillStroke(ctx, '#3A3F4E', 4); rr(ctx, mx - 26, -580, 40, 200, 8); fillStroke(ctx, '#2A2F3A', 4.5);
    if (o.glow) LT.glow(ctx, mx - 60, -480, 160, 'rgba(170,210,255,1)', 0.35 * o.glow); }
  if (o.papers) for (let i = 0; i < o.papers; i++) { rr(ctx, -200 + (hash(i) - 0.5) * 30, -306 - i * 7, 200, 8, 2); fillStroke(ctx, '#FBF6EA', 2.5); }
  rr(ctx, -w / 2, -300, w, 34, 8); fillStroke(ctx, o.col || '#8A6A4A', 5);
  rr(ctx, -w / 2 + 20, -266, w - 40, 266, 6); fillStroke(ctx, shade(o.col || '#8A6A4A', -0.15), 5);
  if (o.plate) { CL.cutout(ctx, () => rr(ctx, -130, -220, 260, 60, 8), '#E8E2D0', { elev: 0.5, tex: 0 }); fitTxt(ctx, o.plate, 0, -180, 30, INK, 230); }
  ctx.restore();
}

// ---------- the daily target board: header + "TODAY n / goal" + tally + progress bar; u = pop; up = little arrow ----------
function targetBoard(ctx, o = {}) {
  const w = o.w || 560, h = o.h || 400, n = o.n ?? 3, goal = o.goal ?? 20;
  ctx.save(); ctx.rotate(o.rot ?? -0.015);
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 12), '#FFFDF8', { elev: 1.2 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.clip(); ctx.fillStyle = NAVY; ctx.fillRect(-w / 2, -h / 2, w, 92); ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  fitTxt(ctx, o.title || 'DAILY SALES TARGET', 0, -h / 2 + 62, 44, PAL.cream, w - 50);
  fitTxt(ctx, 'TODAY', -w / 2 + 40, -h / 2 + 160, 40, INK, 200, 'left', FONT.type);
  fitTxt(ctx, `${Math.floor(n)} / ${goal}`, w / 2 - 40, -h / 2 + 168, 64, n >= goal ? PAL.green : INK, 260, 'right');
  // tally marks
  ctx.strokeStyle = '#3A4360'; ctx.lineWidth = px(ctx, 5); ctx.lineCap = 'round'; const k = Math.min(Math.floor(n), 25);
  for (let i = 0; i < k; i++) { const g = Math.floor(i / 5), j = i % 5, x0 = -w / 2 + 44 + g * 98; if (j < 4) { ctx.beginPath(); ctx.moveTo(x0 + j * 16, -h / 2 + 210); ctx.lineTo(x0 + j * 16, -h / 2 + 266); ctx.stroke(); } else { ctx.beginPath(); ctx.moveTo(x0 - 8, -h / 2 + 258); ctx.lineTo(x0 + 58, -h / 2 + 216); ctx.stroke(); } }
  // progress bar
  rr(ctx, -w / 2 + 40, h / 2 - 82, w - 80, 44, 12); fillStroke(ctx, '#E9E3D3', 4);
  const f = clamp(n / goal); if (f > 0.02) { rr(ctx, -w / 2 + 40, h / 2 - 82, (w - 80) * f, 44, 12); fillStroke(ctx, f >= 1 ? PAL.green : '#4D8DFF', 4); }
  if (o.up) { ctx.save(); ctx.translate(w / 2 + 50, -h / 2 + 150 - o.up * 30); ctx.globalAlpha *= clamp(o.up * 3); CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(48, 0); ctx.lineTo(18, 0); ctx.lineTo(18, 56); ctx.lineTo(-18, 56); ctx.lineTo(-18, 0); ctx.lineTo(-48, 0); ctx.closePath(); }, PAL.green, { elev: 1 }); ctx.restore(); }
  ctx.restore();
}

// ---------- the BONUS envelope (centred), s scale, open 0..1 shows a bill ----------
function bonusEnvelope(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot ?? -0.06);
  if (o.open) { ctx.save(); ctx.translate(0, -60 * o.open); rr(ctx, -110, -70, 220, 110, 6); fillStroke(ctx, '#CFE9D4', 4); ell(ctx, 0, -15, 30, 30); ctx.strokeStyle = '#3D8C6A'; ctx.lineWidth = px(ctx, 4); ctx.stroke(); fitTxt(ctx, '$', 0, 0, 44, '#3D8C6A', 40); ctx.restore(); }
  CL.cutout(ctx, () => rr(ctx, -150, -90, 300, 180, 10), '#F4EEDF', { elev: 1.2 });
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-150, -90); ctx.lineTo(0, 10); ctx.lineTo(150, -90); ctx.stroke();
  CL.cutout(ctx, () => rr(ctx, -110, 20, 220, 56, 8), PAL.green, { elev: 0.4, tex: 0 }); fitTxt(ctx, 'BONUS', 0, 62, 44, PAL.cream, 200);
  ctx.restore();
}

// ---------- a paper account card (centred), kind = CHECKING / SAVINGS / CREDIT CARD ...; o: s, x, y, rot, stamp 0..1, fee ----------
function acctCard(ctx, kind, o = {}) {
  ctx.save(); ctx.translate(o.x || 0, o.y || 0); ctx.rotate(o.rot || 0); const s = o.s || 1; ctx.scale(s, s);
  const w = 340, h = 220, col = KIND[kind] || '#4D8DFF';
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 12), '#FFFDF8', { elev: o.elev ?? 1 });
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, 66); ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.lineWidth = px(ctx, 4.5); ctx.strokeStyle = INK; ctx.stroke();
  fitTxt(ctx, kind, 0, -h / 2 + 46, 40, PAL.cream, w - 40);
  fitTxt(ctx, 'NEW ACCOUNT', -w / 2 + 24, -h / 2 + 108, 26, INK, 220, 'left', FONT.type);
  ctx.fillStyle = 'rgba(46,58,89,0.25)'; for (let i = 0; i < 2; i++) ctx.fillRect(-w / 2 + 24, -h / 2 + 128 + i * 26, w - 120 - i * 60, 8);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(-w / 2 + 24, h / 2 - 22); ctx.lineTo(w / 2 - 110, h / 2 - 22); ctx.stroke();
  fitTxt(ctx, 'SIGNED: —', -w / 2 + 24, h / 2 - 30, 20, '#6A6A68', 200, 'left', FONT.type);
  if (o.stamp) { ctx.save(); ctx.translate(90, 40); ST.stampWord(ctx, o.stampText || 'OPENED', 34, o.stamp, o.stampCol || C.red, -0.18); ctx.restore(); }
  ctx.restore();
}
// a small paper price tag on a string (centred at the hole), text
function feeTag(ctx, s = 1, text = 'FEE', o = {}) {
  ctx.save(); ctx.scale(s, s); ctx.rotate(o.rot ?? 0.12);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-40, -50, -20, -110); ctx.stroke();
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.lineTo(150, 0); ctx.lineTo(150, 110); ctx.lineTo(-150, 110); ctx.lineTo(-150, 0); ctx.closePath(); }, o.col || C.yellow, { elev: 1 });
  ell(ctx, 0, 22, 9, 9); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.lineWidth = px(ctx, 3); ctx.strokeStyle = INK; ctx.stroke();
  fitTxt(ctx, text, 0, 86, 54, INK, 270);
  ctx.restore();
}

// ---------- chart board "PRODUCTS PER CUSTOMER" on an easel (centred, bottom of the legs at y = 0 when easel) ----------
// o: grow 0..1 (bars), goal 0..1 (dashed GOAL 8 line), crumble 0..1 (bars break and fall), tags [[text, u]], plate8 0..1, infl 0..1 (bars puff up)
const BARS = [3.3, 3.9, 4.6, 5.2, 5.7, 6.1];
function chartBoard(ctx, t, o = {}) {
  const w = o.w || 960, h = o.h || 640;
  ctx.save();
  if (o.easel !== false) { ctx.save(); ctx.translate(0, h / 2 + 400); tube(ctx, [[-260, 0], [-120, -460]], 22, '#8A5A34', 4.5); tube(ctx, [[260, 0], [120, -460]], 22, '#8A5A34', 4.5); tube(ctx, [[0, 30], [0, -460]], 20, '#6E4528', 4.5); ctx.restore(); }
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 12), '#FFFDF8', { elev: 1.4 });
  fitTxt(ctx, o.title || 'PRODUCTS PER CUSTOMER', 0, -h / 2 + 70, 54, INK, w - 60);
  const x0 = -w / 2 + 110, y0 = h / 2 - 70, top = -h / 2 + 130, sc = (y0 - top) / 9;
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 5); ctx.beginPath(); ctx.moveTo(x0, top - 10); ctx.lineTo(x0, y0); ctx.lineTo(w / 2 - 50, y0); ctx.stroke();
  for (const v of [2, 4, 6, 8]) fitTxt(ctx, String(v), x0 - 26, y0 - v * sc + 12, 32, '#6A6A68', 40, 'right');
  const bw = (w / 2 - 50 - x0) / BARS.length;
  BARS.forEach((v, i) => {
    const g = E.out(clamp((o.grow ?? 1) * BARS.length - i)); if (g <= 0) return;
    const infl = (o.infl || 0) * (0.15 + 0.05 * Math.sin(t * 6 + i)), bh = v * sc * g * (1 + infl), bx = x0 + 20 + i * bw, cw = bw - 36;
    const cr = clamp((o.crumble || 0) * 1.6 - i * 0.12);
    if (cr <= 0) { rr(ctx, bx - infl * 20, y0 - bh, cw + infl * 40, bh, 8); fillStroke(ctx, i === BARS.length - 1 ? '#4D8DFF' : '#8FB4E8', 4.5); }
    else { // the bar breaks into chunks that fall and tumble
      for (let k = 0; k < 6; k++) { const ch = bh / 6, fall = E.in(clamp(cr * 1.4 - k * 0.05)) * (y0 - (y0 - bh + k * ch) - ch) , sp = (hash(i * 7 + k) - 0.5) * 60 * cr;
        ctx.save(); ctx.translate(bx + cw / 2 + sp, y0 - bh + k * ch + ch / 2 + fall * (1 - k / 7)); ctx.rotate((hash(k + i) - 0.5) * 1.4 * cr); rr(ctx, -cw / 2 + 4, -ch / 2 + 2, cw - 8, ch - 4, 4); fillStroke(ctx, '#8FB4E8', 4); ctx.restore(); }
    }
  });
  if (o.goal) { const gy = y0 - 8 * sc; ctx.save(); ctx.globalAlpha *= clamp(o.goal * 2); ctx.setLineDash([22, 16]); ctx.strokeStyle = PAL.green; ctx.lineWidth = px(ctx, 7); ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + (w / 2 - 50 - x0) * E.out(clamp(o.goal)), gy); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    label(ctx, 'GOAL', w / 2 - 140, gy - 50, o.goal, { size: 36, col: PAL.green, fg: PAL.cream }); }
  if (o.tags) o.tags.forEach(([s, u], i) => { if (u > 0) { const bx = x0 + 20 + (BARS.length - 1 - i * 2) * bw; ctx.save(); ctx.translate(bx + 20, y0 - BARS[BARS.length - 1 - i * 2] * sc - 70 - i * 10); feeTag(ctx, 0.9 * E.back(clamp(u * 2), 2), s, { col: '#FFFDF8', rot: -0.15 + i * 0.12 }); ctx.restore(); } });
  ctx.restore();
}
const label = ST.label;

// ---------- the Senate hearing room (generic): wood panels, a raised dais with nameplates, a witness table ----------
function hearingRoom(ctx, t, o = {}) {
  ctx.fillStyle = '#6E4A30'; ctx.fillRect(-3000, -2400, 6000, 2400);
  for (let x = -2900; x < 3000; x += 420) { rr(ctx, x, -1900, 360, 700, 8); ctx.fillStyle = '#7E5638'; ctx.fill(); ctx.strokeStyle = 'rgba(30,15,5,0.4)'; ctx.lineWidth = 4; ctx.stroke(); rr(ctx, x, -1100, 360, 560, 8); ctx.fillStyle = '#7E5638'; ctx.fill(); ctx.stroke(); }
  // a generic round emblem (stars only)
  if (o.emblem !== false) { ctx.save(); ctx.translate(o.emX ?? -500, -1500); ell(ctx, 0, 0, 170, 170); fillStroke(ctx, '#2E3A59', 6); ell(ctx, 0, 0, 140, 140); ctx.strokeStyle = '#D8C38A'; ctx.lineWidth = px(ctx, 5); ctx.stroke();
  for (let i = 0; i < 13; i++) { const a = i / 13 * Math.PI * 2; star(ctx, Math.cos(a) * 104, Math.sin(a) * 104, 14, '#F4E8C0'); } fitTxt(ctx, 'U.S. SENATE', 0, 12, 34, '#F4E8C0', 200); ctx.restore(); }
  // floor
  ctx.fillStyle = '#4A3A4E'; ctx.fillRect(-3000, 0, 6000, 1600);
}
// the dais (draw AFTER the senators): long raised bench, front at x0..x1, top at -360
function dais(ctx, x0, x1, plates = []) {
  rr(ctx, x0, -380, x1 - x0, 40, 8); fillStroke(ctx, '#8A5A34', 5);
  rr(ctx, x0 + 20, -340, x1 - x0 - 40, 340, 6); fillStroke(ctx, '#6E4528', 5);
  for (let x = x0 + 60; x < x1 - 60; x += 220) { rr(ctx, x, -300, 180, 260, 6); ctx.strokeStyle = 'rgba(30,15,5,0.45)'; ctx.lineWidth = 4; ctx.stroke(); }
  plates.forEach(([x, s]) => { CL.cutout(ctx, () => rr(ctx, x - 90, -430, 180, 50, 6), '#E8E2D0', { elev: 0.5, tex: 0 }); fitTxt(ctx, s, x, -396, 26, INK, 160); tube(ctx, [[x + 60, -380], [x + 100, -470]], 6, '#2A2A30', 3); ell(ctx, x + 102, -476, 10, 12); fillStroke(ctx, '#2A2A30', 3); });
}
function star(ctx, x, y, r, col) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
// witness table with a microphone and a name card (plain text), centred at x, top -300
function witnessTable(ctx, x, name = 'WITNESS') {
  ctx.save(); ctx.translate(x, 0); rr(ctx, -260, -300, 520, 34, 8); fillStroke(ctx, '#8A5A34', 5); rr(ctx, -240, -266, 480, 266, 6); fillStroke(ctx, '#6E4528', 5);
  ctx.fillStyle = '#E8E2D0'; ctx.fillRect(-240, -266, 480, 30);
  tube(ctx, [[-150, -300], [-200, -390]], 6, '#2A2A30', 3); ell(ctx, -204, -396, 11, 13); fillStroke(ctx, '#2A2A30', 3);
  CL.cutout(ctx, () => rr(ctx, -40, -350, 170, 50, 6), '#E8E2D0', { elev: 0.5, tex: 0 }); fitTxt(ctx, name, 45, -316, 24, INK, 150);
  ctx.restore();
}

// ---------- the regulator's press podium (centred, base at 0) with a blue backdrop ----------
function pressRoom(ctx, t) {
  ctx.fillStyle = '#3E5578'; ctx.fillRect(-3000, -2400, 6000, 2400);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let x = -3000; x < 3000; x += 160) ctx.fillRect(x, -2400, 60, 2400);
  ctx.fillStyle = '#5A4A42'; ctx.fillRect(-3000, 0, 6000, 1600);
}
function podium(ctx, plate = 'PRESS BRIEFING') {
  SE.poly(ctx, [[-130, 0], [130, 0], [150, -380], [-150, -380]], '#6A4A30', 5); rr(ctx, -180, -410, 360, 40, 8); fillStroke(ctx, '#8A5A34', 5);
  CL.cutout(ctx, () => rr(ctx, -110, -300, 220, 90, 8), '#2E3A59', { elev: 0.5, tex: 0.3 }); fitTxt(ctx, plate, 0, -244, 26, PAL.cream, 190);
  for (const dx of [-30, 30]) { tube(ctx, [[dx, -410], [dx * 2.6, -500]], 6, '#2A2A30', 3); ell(ctx, dx * 2.7, -506, 10, 13); fillStroke(ctx, '#2A2A30', 3); }
}
// ---------- the quote card (typewriter), lines [[text, u, hl]] ----------
function quoteCard(ctx, title, lines, o = {}) {
  const w = o.w || 900, h = o.h || 560;
  ctx.save(); ctx.rotate(o.rot ?? 0.015); CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 10), '#FBF6EA', { elev: 1.8 });
  fitTxt(ctx, '“', -w / 2 + 70, -h / 2 + 130, 160, '#C9C1B1', 120);
  fitTxt(ctx, title, 0, -h / 2 + 70, 34, '#6A6A68', w - 120, 'center', FONT.type);
  lines.forEach(([s, u, hl], i) => { if (u <= 0) return; const y = -h / 2 + 170 + i * 92; ctx.save(); ctx.globalAlpha *= clamp(u * 4);
    const n = Math.max(1, Math.round(s.length * clamp(u * 2.5))); const shown = s.slice(0, n);
    ctx.font = `56px ${F.black}`; const tw = Math.min(ctx.measureText(s).width, w - 120);
    if (hl && u > 0.4) { ctx.fillStyle = 'rgba(255,200,87,0.75)'; ctx.fillRect(-tw / 2 - 10, y - 50, (tw + 20) * E.out(clamp((u - 0.4) * 3)), 66); }
    fitTxt(ctx, shown, -tw / 2, y, 56, INK, w - 120, 'left'); ctx.restore(); });
  if (o.foot) fitTxt(ctx, o.foot, 0, h / 2 - 40, 30, '#6A6A68', w - 100, 'center', FONT.type);
  ctx.restore();
}

// ---------- the file room: stacks of account cards growing (n 0..1) ----------
function fileStacks(ctx, n, o = {}) {
  const cols = o.cols || 9;
  for (let c = 0; c < cols; c++) { const hmax = 260 + hash(c + 2) * 380, hh = hmax * clamp(n * 1.3 - c * 0.04); const x = (c - (cols - 1) / 2) * (o.dx || 200);
    for (let y = 0; y < hh; y += 22) { const col = Object.values(KIND)[(c + Math.floor(y / 22)) % 3]; ctx.save(); ctx.translate(x + (hash(c * 31 + y) - 0.5) * 10, -y - 11); rr(ctx, -80, -11, 160, 22, 3); fillStroke(ctx, '#FFFDF8', 3); ctx.fillStyle = col; ctx.fillRect(-78, -9, 26, 18); ctx.restore(); } }
}
// ---------- a cardboard box of desk things (base at 0) ----------
function deskBox(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  rr(ctx, -50, -200, 50, 80, 6); fillStroke(ctx, '#E9E1CE', 3.5); tube(ctx, [[40, -140], [70, -230]], 10, '#3E9E5A', 3); ell(ctx, 76, -238, 22, 12, -0.6); fillStroke(ctx, '#5EBE7A', 3);
  rr(ctx, -10, -170, 34, 46, 6); fillStroke(ctx, '#8FB4E8', 3);
  CL.cutout(ctx, () => rr(ctx, -110, -140, 220, 140, 6), '#C9A06A', { elev: 1, tex: 0.5 });
  ctx.strokeStyle = 'rgba(80,50,20,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-110, -110); ctx.lineTo(110, -110); ctx.stroke();
  ctx.restore();
}
// ---------- the settlement paper with a signature drawn by u ----------
function settlement(ctx, u = 1, o = {}) {
  const w = o.w || 520, h = o.h || 660;
  ctx.save(); ctx.rotate(o.rot ?? -0.03); CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 8), '#FBF6EA', { elev: 1.6 });
  fitTxt(ctx, 'SETTLEMENT', 0, -h / 2 + 80, 56, INK, w - 60, 'center', FONT.type);
  ctx.fillStyle = 'rgba(46,58,89,0.22)'; for (let i = 0; i < 9; i++) ctx.fillRect(-w / 2 + 40, -h / 2 + 140 + i * 36, w - 80 - (i % 3) * 60, 10);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(-w / 2 + 40, h / 2 - 80); ctx.lineTo(w / 2 - 40, h / 2 - 80); ctx.stroke();
  if (u > 0) { ctx.strokeStyle = '#2E3A9A'; ctx.lineWidth = px(ctx, 5); ctx.lineCap = 'round'; ctx.beginPath(); const N = Math.floor(60 * clamp(u));
    for (let i = 0; i <= N; i++) { const k = i / 60, x = -w / 2 + 70 + k * (w - 160), y = h / 2 - 100 + Math.sin(k * 26) * 18 * (1 - k * 0.5) - k * 10; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  ctx.restore();
}
// ---------- the chapter card (0.0–3.0 s): small CHAPTER n strip, big title, place · year ----------
function chapterCard(ctx, t, small, title, place, o = {}) {
  const W = ST.W, H = ST.H;
  ctx.fillStyle = o.bg || '#252C42'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.035)'; for (let i = 0; i < 40; i++) ctx.fillRect(0, i * 30, W, 12);
  const u = E.back(clamp(t / 0.45), 1.6), z = 0.96 + t * 0.02;
  ctx.save(); ctx.translate(W / 2, H / 2 - 40 + (1 - clamp(t / 0.35)) * -80); ctx.scale(z * (0.85 + 0.15 * u), z * (0.85 + 0.15 * u)); ctx.rotate(-0.015);
  ctx.globalAlpha = clamp(t / 0.15);
  CL.cutout(ctx, () => rr(ctx, -620, -260, 1240, 520, 22), PAL.cream, { elev: 2.2 });
  if (o.icon) { ctx.save(); ctx.translate(-470, 40); o.icon(ctx, t); ctx.restore(); }
  ctx.save(); ctx.translate(0, -160); ctx.rotate(0.02); ctx.font = `44px ${F.black}`; const sw = ctx.measureText(small).width + 60;
  CL.cutout(ctx, () => rr(ctx, -sw / 2, -40, sw, 74, 12), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, small, 0, 14, 44, C.yellow); ctx.restore();
  fitTxt(ctx, title, o.icon ? 80 : 0, 40, 124, INK, o.icon ? 880 : 1100);
  ctx.restore();
  // the place · year strip lands like a stamp
  const s2 = clamp((t - 0.3) / 0.3); if (s2 > 0 && place) { ctx.save(); ctx.translate(W / 2 + 60, H / 2 + 150); ST.stampWord(ctx, place, 58, s2, C.red, -0.04); ctx.restore(); }
}
// a little bank icon for the chapter card (centred)
function bankIcon(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  SE.poly(ctx, [[-150, -150], [0, -240], [150, -150]], STONED, 5); rr(ctx, -160, -160, 320, 30, 6); fillStroke(ctx, STONED, 5);
  for (let i = 0; i < 4; i++) { rr(ctx, -125 + i * 75, -125, 40, 190, 6); fillStroke(ctx, '#E9E3D6', 4.5); }
  rr(ctx, -170, 65, 340, 34, 6); fillStroke(ctx, STONED, 5); rr(ctx, -190, 99, 380, 30, 6); fillStroke(ctx, STONED, 5);
  ctx.restore();
}

module.exports = { NAVY, STONE, STONED, NIGHT, KIND, LK, who, whoSeated, face, bankFront, branch, clerkDesk, targetBoard, bonusEnvelope, acctCard, feeTag, chartBoard, hearingRoom, dais, star, witnessTable, pressRoom, podium, quoteCard, fileStacks, deskBox, settlement, chapterCard, bankIcon };
