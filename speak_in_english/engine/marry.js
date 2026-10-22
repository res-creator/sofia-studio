// "Why aren't you married yet?" episode renderer: node marry.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, shade, rgba, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/marry/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
// Auntie Pam and the knitted sweater are the same as in the "gift" episode
const SW = '#D9443F', SWD = '#A82E2B';
const HER = { ...BASE.her_london, top: { type: 'sweater', col: SW } };
const PAM = { ...BASE.nana, top: { type: 'cardigan', col: '#8FB4D9', col2: '#F2EBDD' }, bottom: { type: 'skirt', col: '#6A5A7A' }, glasses: { col: '#C2507A' } };
const GER = { ...BASE.jay, top: { type: 'blazer', col: '#6A7A5A', shirt: '#F7F9FC', tie: '#C2507A' }, bottom: { type: 'trousers', col: '#4A5240' } };
const SEAT = 330, G = { her: geom(HER, SEAT), pam: geom(PAM, SEAT), ger: geom(GER) };
const FY = 60, HERX = -330, PX = 330, GX = 650, TOP = -470;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function heart(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); c.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.4, -r * 0.1, 0, r * 0.9); c.fill(); c.restore(); }
function knitTex(c, x0, y0, w, h, col) { c.save(); c.strokeStyle = rgba(shade(col, 0.6), 0.35); c.lineWidth = 3; for (let y = y0 + 10; y < y0 + h; y += 22) for (let x = x0 + 8; x < x0 + w; x += 20) { c.beginPath(); c.moveTo(x - 6, y - 6); c.lineTo(x, y + 4); c.lineTo(x + 6, y - 6); c.stroke(); } c.restore(); }
function knitFace(c, x, y, r) { c.save(); c.translate(x, y); c.fillStyle = '#F2C9AE'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.fillStyle = '#D9D4DA'; c.beginPath(); c.arc(0, -r * 0.2, r, Math.PI * 1.05, Math.PI * 1.95); c.fill(); c.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.4, r * 0.06, r * 0.1, 0, TAU); c.fill(); } c.strokeStyle = '#B03A4A'; c.lineWidth = r * 0.1; c.beginPath(); c.arc(0, r * 0.35, r * 0.32, 0.25, Math.PI - 0.25); c.stroke(); c.restore(); }

// ---------------- dining room (prerendered)
const BX0 = -1600, BY0 = -3000, BW = 3400, BH = 3700, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F2E2C8'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(194,80,122,.08)'; for (let x = BX0; x < BX0 + BW; x += 180) for (let y = BY0; y < 0; y += 180) { c.beginPath(); c.arc(x + 90, y + 90, 30, 0, TAU); c.fill(); }
  c.fillStyle = '#C9A880'; c.fillRect(BX0, -520, BW, 580);
  // family photos (all wedding photos)
  for (const [x, y, w] of [[-1150, -2050, 300], [-760, -2150, 240], [-1000, -1680, 220], [-180, -2200, 260], [140, -2100, 220]]) { c.fillStyle = '#C9A06A'; c.fillRect(x - 14, y - 14, w + 28, w * 1.2 + 28); c.fillStyle = '#E6EEF4'; c.fillRect(x, y, w, w * 1.2); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x + w * 0.35, y + w * 0.45, w * 0.12, 0, TAU); c.fill(); c.fillRect(x + w * 0.22, y + w * 0.6, w * 0.26, w * 0.6); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x + w * 0.65, y + w * 0.45, w * 0.12, 0, TAU); c.fill(); paint(c, q => { q.m(x + w * 0.65, y + w * 0.55); q.l(x + w * 0.85, y + w * 1.2); q.l(x + w * 0.45, y + w * 1.2); q.z(); }, '#FFFFFF', { sd: 2, hd: 1, lw: 2 }); }
  // kitchen door (right)
  c.fillStyle = '#8A5A3A'; c.fillRect(620, -1900, 560, 1960); c.fillStyle = '#7A4E30'; c.fillRect(660, -1860, 480, 1900); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(1090, -900, 20, 0, TAU); c.fill(); txt(c, 'KITCHEN', 900, -1700, 46, '#F2E2C8');
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#9A6E4A'); fg.addColorStop(1, '#7A5238'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawRoom(c); }

// ---------------- props
function lamp(c, t, L) { const on = L === 'hook' || L === 'A1'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(HERX + 60, -3000); c.lineTo(HERX + 60, -2050); c.stroke(); paint(c, q => { q.m(HERX - 60, -1900); q.l(HERX + 180, -1900); q.l(HERX + 110, -2050); q.l(HERX + 10, -2050); q.z(); }, '#2F6A4A', { sd: 4, hd: 2, lw: 3 });
  if (on) { const f = 0.9 + 0.1 * Math.sin(t * 9); c.fillStyle = `rgba(255,245,180,${0.28 * f})`; c.beginPath(); c.moveTo(HERX - 60, -1900); c.lineTo(HERX + 180, -1900); c.lineTo(HERX + 420, FY); c.lineTo(HERX - 360, FY); c.closePath(); c.fill(); } }
function table(c, t, L) { paint(c, q => { q.m(-640, TOP); q.l(640, TOP); q.l(680, TOP + 420); q.l(-680, TOP + 420); q.z(); }, '#FFFDF8', { sd: 8, hd: 4, lw: 3, inner: k => { k.fillStyle = 'rgba(194,80,122,.18)'; for (let x = -660; x < 680; x += 80) k.fillRect(x, TOP, 40, 420); } }); c.fillStyle = '#5A3A2A'; c.fillRect(-600, TOP + 420, 40, FY - TOP - 420); c.fillRect(560, TOP + 420, 40, FY - TOP - 420);
  for (const x of [-330, 330]) { paint(c, q => q.e(x, TOP - 8, 130, 22), '#FFFFFF', { sd: 3, hd: 2, lw: 3 }); paint(c, q => q.e(x, TOP - 14, 70, 12), '#E0A43B', { sd: 2, hd: 1, lw: 2 }); }
  // knitting basket (seeded from the first shot)
  paint(c, q => { q.m(470, TOP - 6); q.l(610, TOP - 6); q.l(590, TOP - 90); q.l(490, TOP - 90); q.z(); }, '#C9A06A', { sd: 3, hd: 2, lw: 3 }); paint(c, q => q.e(540, TOP - 100, 40, 32), SW, { sd: 3, hd: 2, lw: 3 }); c.strokeStyle = '#B9BFC8'; c.lineWidth = 6; c.beginPath(); c.moveTo(510, TOP - 180); c.lineTo(560, TOP - 90); c.moveTo(580, TOP - 175); c.lineTo(530, TOP - 90); c.stroke();
  // CANDIDATES folder
  const open = (L === 'A1' && t > ev('folder')) || ['A2', 'B1', 'B2', 'C1', 'C2'].includes(L); c.save(); c.translate(80, TOP - 4); c.rotate(-0.05); paint(c, q => { q.m(-110, 0); q.l(110, 0); q.l(110, -24); q.l(-110, -24); q.z(); }, '#F2C14E', { sd: 3, hd: 2, lw: 3 }); txt(c, 'CANDIDATES', 0, -12, 18, '#2B2F3A'); if (open) for (let i = 0; i < 4; i++) { c.fillStyle = '#FFFFFF'; c.save(); c.translate(-60 + i * 40, -24); c.rotate(-0.4 + i * 0.25); c.fillRect(-20, -50, 40, 50); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, -30, 10, 0, TAU); c.fill(); c.restore(); } c.restore(); }
function ringBox(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-34, -40); q.l(34, -40); q.l(34, 0); q.l(-34, 0); q.z(); }, '#B8203E', { sd: 3, hd: 2, lw: 3 }); paint(c, q => { q.m(-34, -40); q.l(34, -40); q.l(34, -84); q.l(-34, -84); q.z(); }, '#8A1830', { sd: 2, hd: 1, lw: 3 }); c.strokeStyle = '#F2C14E'; c.lineWidth = 6; c.beginPath(); c.arc(0, -50, 14, 0, TAU); c.stroke(); c.restore(); }
const needles = t => ctx => { ctx.rotate(Math.sin(t * 12) * 0.15); ctx.strokeStyle = '#B9BFC8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-60, -60); ctx.lineTo(50, 40); ctx.stroke(); ctx.fillStyle = SW; ctx.fillRect(-20, -10, 40, 30); };
function bootie(c, x, y, s, flip) { c.save(); c.translate(x, y); c.scale(s * (flip ? -1 : 1), s); paint(c, q => { q.m(-60, -140); q.l(40, -140); q.l(40, -40); q.q(130, -40, 130, 10); q.q(130, 40, 60, 40); q.l(-60, 40); q.z(); }, SW, { sd: 6, hd: 3, lw: 4, inner: k => knitTex(k, -60, -140, 190, 180, SW) }); c.fillStyle = SWD; c.fillRect(-64, -150, 108, 26); c.save(); c.scale(flip ? -1 : 1, 1); knitFace(c, flip ? 15 : -10, -70, 36); c.restore(); c.restore(); }
// insert cards
function cardBox(c, k, w, h, fn, rot = -0.03) { if (k <= 0) return; c.save(); c.translate(540, 1140); c.rotate(rot); c.scale(k * 0.92, k * 0.92); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 10, -h / 2 + 14, w, h, 30); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -w / 2, -h / 2, w, h, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 30); c.stroke(); fn(); c.restore(); }
function cards(c, t, L) { const win = (a, b) => eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, b, b + 0.25));
  if (L === 'A1') cardBox(c, win(ev('folder') + 0.1, SP.a1_nar.t + 1.5), 680, 440, () => { txt(c, 'CANDIDATES', 0, -170, 44, '#C2507A'); const N = ['DENTIST', 'ACCOUNTANT', 'GERALD', 'NEIGHBOUR']; for (let i = 0; i < 4; i++) { c.save(); c.translate(-240 + i * 160, 30); c.rotate(-0.12 + i * 0.08); c.fillStyle = '#E6EEF4'; c.fillRect(-70, -110, 140, 190); c.fillStyle = ['#7A4E2E', '#2B2F3A', '#2A1E16', '#C9A060'][i]; c.beginPath(); c.arc(0, -40, 42, Math.PI, 0); c.fill(); c.fillStyle = '#F2C9A8'; c.beginPath(); c.arc(0, -30, 36, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 13, -32, 4, 0, TAU); c.fill(); } c.fillStyle = '#6A7A5A'; c.fillRect(-46, 8, 92, 60); c.restore(); txt(c, N[i], -240 + i * 160, 150, 20, '#2B2F3A'); } heart(c, 80 + 0, -150, 26, '#E0474C'); });
  if (L === 'A2') cardBox(c, win(ev('cal'), SP.a2_tip.t - 0.2), 700, 380, () => { txt(c, 'NEXT WEEK', 0, -140, 40, '#2B2F3A'); const D = ['MON', 'TUE', 'WED', 'THU', 'FRI']; D.forEach((d, i) => { const x = -260 + i * 130; c.fillStyle = '#E6EEF4'; c.fillRect(x - 55, -90, 110, 200); txt(c, d, x, -60, 28, '#2B2F3A'); txt(c, String(14 + i), x, 20, 52, '#2B2F3A'); }); const k = P(t, ev('cal') + 0.2, ev('cal') + 0.8); c.save(); c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.beginPath(); for (let a = 0; a <= k * TAU; a += 0.1) { const r = 1 + 0.08 * Math.sin(a * 3); const x = -130 + Math.cos(a) * 80 * r, y = 10 + Math.sin(a) * 110 * r; a === 0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); c.restore(); if (k >= 1) txt(c, 'WEDDING!', -130, 150, 30, '#E0474C'); });
  if (L === 'B2') cardBox(c, win(ev('church'), SP.b2_nar.t + 2.5), 700, 400, () => { txt(c, 'BOOKING CONFIRMED', 0, -140, 40, '#4CAF6A'); paint(c, q => { q.m(-60, 80); q.l(-60, -40); q.l(0, -100); q.l(60, -40); q.l(60, 80); q.z(); }, '#E6EEF4', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#2B2F3A'; c.fillRect(-5, -150, 10, 50); c.fillRect(-20, -135, 40, 10); c.fillStyle = '#8A5A3A'; c.fillRect(-22, 20, 44, 60); txt(c, "St Mary's Church", 0, 120, 30, '#2B2F3A', 'Nun9'); txt(c, 'Saturday, 12:00', 0, 160, 30, '#2B2F3A', 'Nun9'); }, 0.04);
  if (L === 'C2' && t > ev('booties')) cardBox(c, win(ev('booties'), SP.c2_nar.t + SP.c2_nar.d + 0.3), 640, 400, () => { bootie(c, -130, 60, 1.05, false); bootie(c, 130, 60, 1.05, true); txt(c, 'FOR THE BABY', 0, -150, 40, '#C2507A'); });
}

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'worried', turn: 0.35, look: 0.8, legPose: 'sit', drop: SEAT, legs: false, armL: reach(g, -1, -g.sw * 0.4, TOP - 20), armR: reach(g, 1, g.sw * 1.2, TOP - 20) };
  gest(st, g, 'her', t, 1, 160);
  if (L === 'hook') { st.mood = 'shock'; st.squint = Math.floor(t * 3) % 3 === 0; }
  if (L === 'A1') { st.mood = t > ev('folder') ? 'shock' : 'worried'; st.squint = t < SP.a1_her.t; }
  if (L === 'A2') st.mood = t > ev('cal') ? 'shock' : 'neutral';
  if (L === 'B1') { st.mood = t > ev('gerald') ? 'surprised' : 'neutral'; if (t > ev('gerald')) { st.turn = 0.6; st.look = 1; } }
  if (L === 'B2') st.mood = t > ev('church') ? 'tired' : 'annoyed';
  if (L === 'C1') st.mood = t > ev('away') ? 'worried' : 'neutral';
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > SP.c2_x.t + 0.3) st.mood = 'happy'; if (t > ev('booties')) st.mood = 'shock'; }
  return st; }
function pamState(t, L) { const g = G.pam, st = { t, talk: talk('pam', t), mood: 'happy', turn: -0.35, look: -0.8, legPose: 'sit', drop: SEAT, legs: false, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 160), armR: reach(g, 1, g.sw * 0.3, g.ySh + 170), items: { L: needles(t) } };
  gest(st, g, 'pam', t, -1, 120);
  if (L === 'hook') st.mood = 'smug';
  if (L === 'A1' && t > ev('folder') - 0.3) { st.armL = reach(g, -1, -g.sw * 2.2, TOP - 40); st.items = {}; }
  if (L === 'A2' && t > ev('cal') - 0.3 && t < SP.a2_nar.t + 1) { st.armL = reach(g, -1, -g.sw * 1.8, g.ySh - 60); st.items = { L: ctx => { ctx.fillStyle = '#E0474C'; ctx.fillRect(-6, -60, 12, 60); } }; }
  if (L === 'B1' && t > SP.b1_x.t + 1.0) { st.armR = reach(g, 1, g.sw * 2.2, g.ySh - 120); st.turn = 0.3; st.look = 0.8; }
  if (L === 'B2' && t > ev('church') - 0.3 && t < SP.b2_nar.t + 1) { const u = t * 9; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 80 + Math.sin(u) * 30); st.items = { L: ctx => { ctx.rotate(0.2); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-50, -140, 100, 130); ctx.fillStyle = '#4CAF6A'; ctx.fillRect(-36, -120, 72, 12); } }; }
  if (L === 'C1') { if (t > SP.c1_her.t + 1.5 && t < ev('away') + 0.6) { st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 60); st.items = { L: ctx => ringBox(ctx, 0.9) }; } if (t > SP.c1_x.t - 0.2) { st.mood = 'sad'; st.cry = true; } }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'happy'; if (t > SP.c2_x2.t) st.mood = 'smug'; if (t > ev('booties') - 0.3) { st.armL = reach(g, -1, -g.sw * 1.8, g.ySh - 40); st.armR = reach(g, 1, -g.sw * 0.2, g.ySh - 40); st.items = { L: ctx => bootie(ctx, 0, -10, 0.35, false) }; } }
  return st; }
function gerX(t, L) { if (L === 'B1') return t < ev('gerald') ? null : lerp(1400, GX, eOut(P(t, ev('gerald'), ev('gerald') + 0.9))); if (L === 'B2') return GX; if (L === 'C1') return t < ev('away') ? GX : lerp(GX, 1500, eIn(P(t, ev('away') + 0.4, ev('away') + 1.6))); return null; }
function gerState(t, L) { const g = G.ger, walking = (L === 'B1' && t < ev('gerald') + 0.9) || (L === 'C1' && t > ev('away') + 0.4); const st = { t, talk: 0, mood: L === 'C1' && t > ev('away') ? 'sad' : 'happy', turn: walking && L === 'C1' ? 0.5 : -0.4, look: -0.8, legPose: walking ? 'walk' : 'stand', blush: true, armL: reach(g, -1, -g.sw * 1.2, g.ySh + 160), armR: reach(g, 1, g.sw * 0.4, g.ySh + 330),
  items: { L: ctx => { ctx.strokeStyle = '#3C8A4A'; ctx.lineWidth = 6; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(i * 18, -110); ctx.stroke(); } for (let i = -2; i <= 2; i++) paint(ctx, q => q.e(i * 20, -120 - Math.abs(i) * -6, 22, 22), ['#E0474C', '#F2C14E', '#F4B8C8', '#E0474C', '#C27AE0'][i + 2], { sd: 2, hd: 1, lw: 2 }); } } };
  if (L === 'B2' && t > ev('church')) st.mood = 'surprised'; return st; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {};
  const gx = gerX(t, L); if (gx !== null) heads.ger = put(c, GER, gerState(t, L), gx, FY);
  heads.pam = put(c, PAM, pamState(t, L), PX, FY);
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  table(c, t, L); lamp(c, t, L);
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -800, z: 0.92, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.88, cut: u < 0.85 };
  if ((L === 'B1' && t > ev('gerald') - 0.2) || (L === 'B2' && t < SP.b2_her.t + 0.2) || (L === 'C1' && t > ev('away') && t < SP.c1_nar.t + 1.5)) return { x: 260, y: -900, z: 0.8, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 200, y: -1000, z: 1.0, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 200, y: -880, z: 1.12, r: 0.3 } : { x: PX - 200, y: -860, z: 1.12, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { drawWorld(c, t, 'hook', { x: 0, y: -900, z: 0.86, r: 0 }); Hq.vignette(c, W, HH, 0.45);
  if (t > 1.2) { const kk = eBack(P(t, 1.2, 1.5), 2); c.save(); c.translate(540, 1500); c.rotate(-0.05); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -400 + 8, -60 + 10, 800, 120, 20); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -400, -60, 800, 120, 20); c.fill(); UI.textFit(c, 'Unb9', 56, 'ДОПРОС НАЧИНАЕТСЯ', 720); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ДОПРОС НАЧИНАЕТСЯ', 0, 4); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЕБЯ СПРАШИВАЮТ,', 'КОГДА ЗАМУЖ?'], rows: [['A2', "I don't want to get married."], ['B1', "I'm happy on my own."], ['B2', "I'd rather not talk about it."], ['C1', "It's my decision."]], cta: ['ОТПРАВЬ ТОМУ, КОГО', 'СПРАШИВАЮТ «КОГДА?»'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 0.6, G.her.ySh + 300) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  cards(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { pam: ['AUNTIE PAM', '#C2507A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('marry', NF, renderFrame);
