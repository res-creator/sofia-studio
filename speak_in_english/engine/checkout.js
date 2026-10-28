// "Self-checkout vs. one banana" episode renderer (hard_cut camera, WRONG CHAT layout): node checkout.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/checkout/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);

// ---------------- cast & layout (her = the channel heroine, dan = existing cast member in his store polo)
const HER = { ...BASE.her_lift };
const DAN = { ...BASE.dan, cap: { ...BASE.dan.cap, text: 'FM' }, top: { ...BASE.dan.top, text: 'FRESH\nMART' } };
const G = { her: geom(HER), dan: geom(DAN) };
const FY = 60, HERX = -430, DX = 640, KX = 220;
const PLAT = { x0: -160, x1: 110, top: -700 }, SCALE = { x0: -160, x1: -45 }, SCAN = { x0: -30, x1: 100 };
const SCR = { x: KX - 170, y: -1580, w: 340, h: 300 };   // kiosk screen in world coords
const herHY = FY + G.her.headY, dHY = FY + G.dan.headY;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const win = (t, a, b, inD = 0.25) => eBack(P(t, a, a + inD), 1.6) * (1 - eIn(P(t, b - 0.18, b)));

// ---------------- supermarket (prerendered, softly blurred)
const BX0 = -1800, BY0 = -3600, BW = 3700, BH = 4300, BS = 0.5;
const PROD = ['#E0474C', '#F2C14E', '#4CAF6A', '#3C8FE0', '#EE5E9A', '#F28C28', '#8E5BD6', '#FFFDF8'];
function drawStore(c) {
  c.fillStyle = '#EEF0E8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#D9DED3'; c.fillRect(BX0, BY0, BW, 520);                                     // ceiling band
  for (let x = BX0 + 120; x < BX0 + BW; x += 520) { c.fillStyle = '#FFFFFF'; rr(c, x, BY0 + 400, 360, 46, 20); c.fill(); c.fillStyle = 'rgba(255,255,230,.35)'; c.beginPath(); c.moveTo(x, BY0 + 446); c.lineTo(x + 360, BY0 + 446); c.lineTo(x + 460, BY0 + 900); c.lineTo(x - 100, BY0 + 900); c.fill(); }
  // shelves with products behind the checkout
  for (const [sx, sw] of [[-1750, 1150], [700, 1150]]) {
    c.fillStyle = '#C9CFC4'; c.fillRect(sx, -2350, sw, 2410);
    for (let r = 0; r < 5; r++) { const y = -2250 + r * 440; c.fillStyle = '#9AA394'; c.fillRect(sx, y + 330, sw, 34);
      for (let i = 0; i < Math.floor(sw / 95); i++) { const h = 180 + hash(r * 31 + i + sx) * 130, col = PROD[Math.floor(hash(i * 7 + r * 3 + sx) * PROD.length)];
        c.fillStyle = col; rr(c, sx + 18 + i * 95, y + 330 - h, 78, h, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(sx + 26 + i * 95, y + 330 - h * 0.7, 62, 18); } } }
  // fruit stand (bananas!) on the left
  c.fillStyle = '#9C6238'; c.fillRect(-1650, -560, 700, 620); c.fillStyle = '#C98B5A'; c.fillRect(-1650, -600, 700, 60);
  for (let i = 0; i < 9; i++) { c.save(); c.translate(-1600 + i * 75, -640 - (i % 2) * 30); c.rotate(-0.3 + hash(i) * 0.6); bananaShape(c, 0.9); c.restore(); }
  c.fillStyle = '#FFFDF8'; rr(c, -1520, -880, 440, 110, 14); c.fill(); txt(c, 'BANANAS  $0.79', -1300, -825, 44, '#2B2F3A');
  // floor
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#D7D2C8'); fg.addColorStop(1, '#BDB6AA'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY);
  c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, FY, 6, 700);
}
// the hanging SELF CHECKOUT sign is drawn sharp (it is read in the wide shots)
function sign(c) { c.strokeStyle = '#6A707A'; c.lineWidth = 6; c.beginPath(); c.moveTo(KX - 160, -3600); c.lineTo(KX - 160, -2440); c.moveTo(KX + 160, -3600); c.lineTo(KX + 160, -2440); c.stroke();
  c.fillStyle = '#2F9E58'; rr(c, KX - 300, -2460, 600, 150, 26); c.fill(); c.strokeStyle = '#FFFDF8'; c.lineWidth = 8; rr(c, KX - 284, -2444, 568, 118, 18); c.stroke(); txt(c, 'SELF CHECKOUT', KX, -2384, 54, '#FFFDF8'); }
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.6px)'; drawStore(c); }

// ---------------- props
function bananaShape(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-88, -34); q.q(0, 74, 88, -34); q.q(70, -18, 60, -26); q.q(0, -4, -60, -26); q.q(-70, -18, -88, -34); q.z(); }, '#F7D348', { sd: 7, hd: 3, lw: 4 });
  c.fillStyle = '#6B4A22'; c.beginPath(); c.ellipse(-88, -34, 8, 6, 0.6, 0, TAU); c.fill(); c.fillStyle = '#7A8A3A'; c.fillRect(82, -46, 14, 16);
  c.strokeStyle = 'rgba(160,110,20,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-60, -14); c.quadraticCurveTo(0, 36, 60, -14); c.stroke(); c.restore(); }
const bananaItem = (rot = 0, s = 1.25) => (ctx, a, side) => { ctx.rotate(rot * side); ctx.translate(0, 6); bananaShape(ctx, s); };
// screen content in a w x h box. state: scan | price | error | assist | alarm | rude | rating | paid | tip | smug
function screen(c, w, h, st, t, lv = 0) {
  const BG = { scan: '#2F6FD8', price: '#2F6FD8', error: '#E0474C', assist: '#F2C14E', alarm: (Math.sin(t * 14) > 0 ? '#E0474C' : '#8E1F2A'), rude: '#E0474C', rating: '#2B2F3A', paid: '#2F9E58', tip: '#2F6FD8', smug: '#2F6FD8' }[st] || '#2F6FD8';
  c.fillStyle = BG; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, 0, w, h * 0.16);
  fitTxt(c, 'FRESH MART · SELF CHECKOUT', w / 2, h * 0.08, h * 0.06, 'rgba(255,255,255,.85)', w * 0.9, 'Nun9');
  const ink = st === 'assist' ? '#2B2F3A' : '#FFFDF8', big = h * 0.15;
  if (st === 'scan') { fitTxt(c, 'PLEASE SCAN', w / 2, h * 0.42, big, ink, w * 0.86); fitTxt(c, 'YOUR ITEM', w / 2, h * 0.6, big, ink, w * 0.86); }
  if (st === 'price') { c.save(); c.translate(w * 0.25, h * 0.52); bananaShape(c, h / 420); c.restore(); fitTxt(c, 'BANANA', w * 0.66, h * 0.43, big * 0.8, ink, w * 0.5); fitTxt(c, '$0.79', w * 0.66, h * 0.64, big * 1.1, '#FFE15A', w * 0.5); }
  if (st === 'error' || st === 'rude') { c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(w / 2, h * 0.22); c.lineTo(w / 2 + h * 0.13, h * 0.44); c.lineTo(w / 2 - h * 0.13, h * 0.44); c.fill(); txt(c, '!', w / 2, h * 0.36, h * 0.15, BG);
    fitTxt(c, st === 'rude' ? 'RUDE CUSTOMER' : 'UNEXPECTED', w / 2, h * 0.58, big, ink, w * 0.88); fitTxt(c, st === 'rude' ? 'DETECTED' : 'ITEM!', w / 2, h * 0.76, big, ink, w * 0.88); }
  if (st === 'assist') { fitTxt(c, 'EMPLOYEE', w / 2, h * 0.4, big, ink, w * 0.88); fitTxt(c, 'ASSISTANCE', w / 2, h * 0.57, big, ink, w * 0.88); fitTxt(c, 'REQUIRED', w / 2, h * 0.74, big, ink, w * 0.88); }
  if (st === 'alarm') { fitTxt(c, 'SUSPICIOUS', w / 2, h * 0.45, big, ink, w * 0.88); fitTxt(c, 'ACTIVITY', w / 2, h * 0.63, big, ink, w * 0.88); fitTxt(c, '⚠ DETECTED ⚠', w / 2, h * 0.8, big * 0.6, '#FFE15A', w * 0.88, 'Nun9'); }
  if (st === 'rating') { fitTxt(c, 'CUSTOMER RATING', w / 2, h * 0.36, big * 0.7, ink, w * 0.86); for (let i = 0; i < 5; i++) { const x = w / 2 + (i - 2) * w * 0.16, y = h * 0.62; c.fillStyle = i === 0 ? C.gold : 'rgba(255,255,255,.18)'; UI.star(c, x, y, h * 0.09); if (i) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; c.stroke(); } } }
  if (st === 'paid') { c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(w / 2, h * 0.38, h * 0.15, 0, TAU); c.fill(); UI.check(c, w / 2, h * 0.38, h * 0.1, BG); fitTxt(c, 'PAYMENT', w / 2, h * 0.64, big, ink, w * 0.86); fitTxt(c, 'ACCEPTED', w / 2, h * 0.8, big, ink, w * 0.86); }
  if (st === 'tip') { fitTxt(c, 'LEAVE A TIP?', w / 2, h * 0.34, big, ink, w * 0.86);
    ['15%', '20%', '25%'].forEach((p, i) => { const bw = w * 0.26, x = w / 2 + (i - 1) * w * 0.3 - bw / 2, y = h * 0.5; c.fillStyle = '#FFFDF8'; rr(c, x, y, bw, h * 0.2, h * 0.05); c.fill(); fitTxt(c, p, x + bw / 2, y + h * 0.1, h * 0.1, '#2F6FD8', bw * 0.8); });
    fitTxt(c, 'no tip', w / 2, h * 0.84, h * 0.045, 'rgba(255,255,255,.45)', w * 0.3, 'Nun8'); }
  if (st === 'smug') { c.strokeStyle = '#FFFDF8'; c.lineCap = 'round'; c.lineWidth = h * 0.035;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(w / 2 + s * w * 0.22 - w * 0.07, h * 0.42); c.lineTo(w / 2 + s * w * 0.22 + w * 0.07, h * 0.42); c.stroke(); c.beginPath(); c.arc(w / 2 + s * w * 0.22, h * 0.42, w * 0.07, 0, Math.PI); c.stroke(); }
    c.beginPath(); c.moveTo(w * 0.36, h * 0.68); c.quadraticCurveTo(w * 0.55, h * 0.78, w * 0.66, h * 0.6); c.stroke(); }
  if (lv > 0.03) { c.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 9; i++) { const a = h * 0.015 + lv * h * 0.045 * Math.abs(Math.sin(t * 22 + i * 1.7)); c.fillRect(w / 2 - w * 0.2 + i * w * 0.05, h * 0.955 - a / 2, w * 0.025, a); } }
}
function screenState(t, L) {
  if (L === 'hook') return 'error';
  if (L === 'A1') return t < ev('scan') ? 'scan' : t < SP.a1_x2.t - 0.05 ? 'price' : 'error';
  if (L === 'A2') return 'error';
  if (L === 'B1') return t < SP.b1_x.t - 0.05 ? 'error' : 'assist';
  if (L === 'B2') return 'alarm';
  if (L === 'C1') return t < SP.c1_x2.t - 0.05 ? 'alarm' : t < ev('rating') ? 'rude' : 'rating';
  if (L === 'C2') return t < ev('green') ? 'rating' : t < SP.c2_x2.t - 0.05 ? 'paid' : t < SP.c2_x3.t - 0.05 ? 'tip' : 'smug';
  return 'scan';
}
function lamp(st, t) { if (st === 'alarm') return Math.sin(t * 14) > 0 ? '#FF3B3B' : '#7A1F2A'; if (st === 'error' || st === 'rude') return '#FF3B3B'; if (st === 'assist') return '#F2C14E'; if (st === 'paid') return '#4CDB7A'; return '#9AE6B4'; }
function kiosk(c, t, L) { const st = screenState(t, L);
  // tower + light pole
  c.fillStyle = '#6A707A'; c.fillRect(KX + 120, SCR.y - 190, 14, 190); c.fillStyle = lamp(st, t); c.beginPath(); c.arc(KX + 127, SCR.y - 200, 30, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.stroke();
  if (st === 'alarm' && Math.sin(t * 14) > 0) { c.fillStyle = 'rgba(255,60,60,.25)'; c.beginPath(); c.arc(KX + 127, SCR.y - 200, 80, 0, TAU); c.fill(); }
  paint(c, q => { q.m(KX - 110, -1250); q.l(KX + 110, -1250); q.l(KX + 120, FY); q.l(KX - 120, FY); q.z(); }, '#DDE3EA', { sd: 10, hd: 4, lw: 4 });
  c.fillStyle = '#C3CBD5'; c.fillRect(KX - 80, -520, 160, 260); c.fillStyle = '#2B2F3A'; c.fillRect(KX - 60, -470, 120, 14); txt(c, 'RECEIPT', KX, -410, 22, '#6A707A');
  // screen
  paint(c, q => { q.m(SCR.x - 26, SCR.y - 26); q.l(SCR.x + SCR.w + 26, SCR.y - 26); q.l(SCR.x + SCR.w + 26, SCR.y + SCR.h + 26); q.l(SCR.x - 26, SCR.y + SCR.h + 26); q.z(); }, '#2B2F3A', { sd: 6, hd: 3, lw: 4 });
  c.save(); c.translate(SCR.x, SCR.y); c.beginPath(); c.rect(0, 0, SCR.w, SCR.h); c.clip(); screen(c, SCR.w, SCR.h, st, t, talk('machine', t)); c.restore();
  // scanner bed + bagging scale
  paint(c, q => { q.m(PLAT.x0, PLAT.top + 40); q.l(PLAT.x1, PLAT.top + 40); q.l(PLAT.x1, FY); q.l(PLAT.x0, FY); q.z(); }, '#C3CBD5', { sd: 8, hd: 4, lw: 4 });
  paint(c, q => { q.m(PLAT.x0 - 10, PLAT.top); q.l(PLAT.x1 + 10, PLAT.top); q.l(PLAT.x1 + 10, PLAT.top + 40); q.l(PLAT.x0 - 10, PLAT.top + 40); q.z(); }, '#8E96A3', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#1F2430'; c.fillRect(SCAN.x0, PLAT.top - 6, SCAN.x1 - SCAN.x0, 10); c.fillStyle = '#FF3B3B'; c.fillRect(SCAN.x0 + 6, PLAT.top - 4, SCAN.x1 - SCAN.x0 - 12, 3);
  c.fillStyle = '#FFFDF8'; c.fillRect(SCALE.x0 + 6, PLAT.top - 10, SCALE.x1 - SCALE.x0 - 12, 10);
  c.fillStyle = '#2B2F3A'; rr(c, PLAT.x0 + 10, PLAT.top + 70, 230, 44, 8); c.fill(); txt(c, 'BAGGING AREA', PLAT.x0 + 125, PLAT.top + 92, 22, '#F2C14E');
}
// ceiling security camera (B2 onwards it stays down)
function secCam(c, t, L) { let y = -1760; if (L === 'B2') { const a = ev('cam'); if (t < a) return; y = lerp(-3300, -1760, eOut(P(t, a, a + 0.9))); } else if (!['C1', 'C2'].includes(L)) return;
  const x = -200; c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, -3600); c.lineTo(x, y - 60); c.stroke();
  paint(c, q => { q.m(x - 70, y - 70); q.l(x + 70, y - 70); q.l(x + 70, y); q.l(x - 70, y); q.z(); }, '#F7F9FC', { sd: 5, hd: 2, lw: 4 });
  paint(c, q => q.e(x, y + 10, 52, 46), '#2B2F3A', { sd: 3, hd: 2, lw: 4 }); c.fillStyle = '#5A8FD8'; c.beginPath(); c.arc(x, y + 18, 22, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x - 7, y + 10, 7, 0, TAU); c.fill();
  c.fillStyle = Math.sin(t * 8) > 0 ? '#FF3B3B' : '#7A1F2A'; c.beginPath(); c.arc(x + 48, y - 40, 10, 0, TAU); c.fill(); K.mark(c, 'seccam', x, y, 90); }
function sweat(c, hd, k) { if (k <= 0) return; const x = hd.x + hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
// where the banana is: 'hand' | 'scale'
function bananaOn(t, L) {
  if (L === 'A1') return t > ev('place') + 0.3 ? 'scale' : 'hand';
  if (L === 'A2') return (t > SP.a2_her.t - 0.2 && t < ev('back') + 0.3) ? 'hand' : 'scale';
  if (L === 'B1') return 'scale';
  if (L === 'B2') return t > SP.b2_her2.t - 0.2 ? 'hand' : 'scale';
  if (L === 'C2') return t > ev('take') ? 'hand' : 'scale';
  return 'hand';
}
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 330), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330) };
  gest(st, g, 'her', t, -1, 200);
  const low = () => { st.armR = reach(g, 1, g.sw * 0.95, g.ySh + 290); st.items = { R: bananaItem(0.2) }; };
  const up = () => { st.armR = reach(g, 1, g.sw * 2.1, g.ySh - 230, { planar: true }); st.items = { R: bananaItem(-0.5) }; };
  const toScan = () => { st.armR = reach(g, 1, (SCAN.x0 + SCAN.x1) / 2 - HERX, PLAT.top - FY - 70); st.items = { R: bananaItem(0.1) }; };
  const toScale = () => { st.armR = reach(g, 1, (SCALE.x0 + SCALE.x1) / 2 - HERX, PLAT.top - FY - 60); };
  const onHand = bananaOn(t, L) === 'hand';
  if (onHand) low();
  if (L === 'hook') { st.mood = 'angry'; up(); st.turn = 0.15; st.look = 0.2; }
  if (L === 'A1') { st.mood = 'happy'; const s = ev('scan'), p = ev('place');
    if (t > s - 0.25 && t < s + 0.7) toScan(); if (t > p - 0.25 && t < p + 0.35) { toScale(); st.items = { R: bananaItem(0.1) }; }
    if (t > SP.a1_x2.t) st.mood = 'surprised'; if (t > SP.a1_her2.t - 0.1) st.mood = 'shock'; if (t > endOf('a1_her2') + 0.4) st.mood = 'worried'; }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_her', t, 0.2, 0.3)) up();
    if (t > ev('back') - 0.3 && t < ev('back') + 0.3) { toScale(); st.items = { R: bananaItem(0.1) }; }
    if (t > ev('look')) { st.turn = 0; st.look = 0; st.lookY = 0; st.mood = 'tired'; } }
  if (L === 'B1') { st.mood = 'worried';
    if (speaking('b1_her', t, 0.1)) { st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 250 + Math.sin(t * 9) * 30, { planar: true }); st.turn = 0.6; st.look = 1; }
    if (speaking('b1_her2', t, 0.1)) { st.mood = 'tired'; st.armR = reach(g, 1, (SCALE.x0 + SCALE.x1) / 2 - HERX - 60, PLAT.top - FY - 150); }
    if (t > ev('stare')) { st.mood = 'skeptical'; } }
  if (L === 'B2') { st.mood = 'shock'; if (speaking('b2_her', t, 0.1)) st.mood = 'angry'; if (t > SP.b2_her2.t - 0.2) { st.mood = 'angry'; up(); }
    if (t > ev('cam') + 0.3) { st.mood = 'worried'; st.lookY = -0.6; st.look = 0.2; } }
  if (L === 'C1') { st.mood = 'angry'; if (t > ev('freeze') && t < SP.c1_her2.t - 0.05) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 300); }
    if (speaking('c1_her2', t, 0.1)) { st.armL = reach(g, -1, g.sw * 2.2, g.ySh + 40); st.turn = 0.5; st.look = 1; }
    if (t > SP.c1_x2.t) st.mood = 'shock'; if (t > ev('rating') + 0.4) st.mood = 'tired'; }
  if (L === 'C2') { st.mood = 'neutral'; const f = ev('fix');
    if (t > f && t < f + 0.7) { st.armL = reach(g, -1, -g.sw * 0.7, g.headY - 60); st.mood = 'smug'; }
    if (speaking('c2_her', t, 0, 0.1)) { st.mood = 'smug'; st.turn = 0.25; st.look = 0.6; }
    if (t > endOf('c2_her') + 0.1 && t < ev('green')) st.mood = 'neutral';
    if (t > ev('green')) st.mood = 'surprised'; if (speaking('c2_her2', t, 0.1, 0.4)) { st.mood = 'happy'; }
    if (t > ev('take') - 0.3 && t < ev('take') + 0.1) toScale();
    if (t > ev('turn') - 0.1) { st.turn = lerp(0, 0.45, eIO(P(t, ev('turn'), ev('turn') + 0.5))); st.look = lerp(0, 1, eIO(P(t, ev('turn'), ev('turn') + 0.5))); st.mood = 'annoyed'; }
    if (speaking('c2_her3', t, 0.05)) { st.mood = 'angry'; up(); }
    if (t > ev('shock')) { st.mood = 'shock'; st.turn = 0; st.look = 0; st.lookY = 0; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 40); } }
  return st; }
function danX(t, L) { if (L === 'B1') { const w = ev('walk'); return lerp(1450, DX, eOut(P(t, w, w + 0.9))); } if (L === 'B2') return lerp(DX, 920, eIO(P(t, ev('cam') + 0.2, ev('zoom') + 0.6))); return DX; }
function danOn(L) { return ['B1', 'B2', 'C1', 'C2'].includes(L); }
function danState(t, L) { const g = G.dan, st = { t, talk: talk('dan', t), mood: 'neutral', turn: -0.35, look: -0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 330), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330) };
  gest(st, g, 'dan', t, 1, 200);
  if (L === 'B1') { st.mood = 'happy'; const p = ev('press');
    if (t > p - 0.2 && t < p + 0.45) { st.armL = reach(g, -1, KX + 60 - DX, SCR.y + 150 - FY); st.mood = 'smug'; }
    if (speaking('b1_d2', t, 0.1)) st.mood = 'smug';
    if (t > SP.b1_x.t + 0.3) { st.mood = 'bored'; st.look = -1; st.lookY = -0.25; st.turn = -0.5; }
    if (t > ev('stare')) { st.mood = 'tired'; st.look = -1; st.lookY = -0.3; } if (speaking('b1_d3', t, 0.05, 0.6)) { st.mood = 'tired'; st.turn = -0.1; st.look = 0; st.lookY = 0; } }
  if (L === 'B2') { st.mood = 'shock'; if (speaking('b2_d', t, 0.1, 0.3)) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 1.2, g.ySh - 120); st.armR = reach(g, 1, g.sw * 0.2, g.ySh - 140); }
    if (t > ev('cam')) { st.mood = 'worried'; st.lookY = -0.5; } }
  if (L === 'C1') { st.mood = 'surprised'; if (t > ev('rating')) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 0.1, g.headY + 90); st.headFirst = false; } }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'surprised' : 'neutral'; if (t > endOf('c2_her') - 0.2 && t < ev('green')) { st.mood = 'happy'; }
    if (t > ev('shock')) { st.mood = 'happy'; st.laugh = true; st.turn = 0.55; st.look = 1; st.armR = reach(g, 1, g.sw * 0.1, g.headY + 90); } }
  return st; }

// ---------------- world
const headOf = (who, x) => ({ x, y: FY + G[who].headY, hh: G[who].hh });
const OFF = { x: 1e5, y: -3000, hh: 100 };   // machine bubble while a screen insert is up: off-screen anchor -> bubble at the top edge
function world(c, t, L, solo, insertOn) {
  c.drawImage(BGB, BX0, BY0, BW, BH); sign(c); const heads = {};
  secCam(c, t, L);
  const dx = danX(t, L);
  if (danOn(L)) heads.dan = (solo === 'her' || solo === 'kiosk') ? headOf('dan', dx) : K.put(c, DAN, danState(t, L), dx, FY);
  kiosk(c, t, L);
  heads.machine = insertOn ? OFF : { x: KX + 40, y: SCR.y + 60, hh: 140 };
  if (bananaOn(t, L) === 'scale') { c.save(); c.translate((SCALE.x0 + SCALE.x1) / 2, PLAT.top - 28); bananaShape(c, 0.95); c.restore(); }
  heads.her = (solo === 'dan' || solo === 'kiosk') ? headOf('her', HERX) : K.put(c, HER, herState(t, L), HERX, FY);
  return heads;
}

// ---------------- camera (hard_cut: still shots, instant cuts)
const SH = { WIDE: { x: 100, y: -1000, z: 0.72, r: 0 }, CARD: { x: 100, y: -1555, z: 0.66, r: 0 },
  HER: { x: HERX + 120, y: herHY + 60, z: 1.0, r: 0, tag: 'her' }, HER_R: { x: HERX + 60, y: herHY - 160, z: 1.05, r: 0, tag: 'her' },
  DAN: { x: DX - 120, y: dHY + 60, z: 0.98, r: 0, tag: 'dan' }, DAN_R: { x: DX - 60, y: dHY - 150, z: 1.0, r: 0, tag: 'dan' },
  KIOSK: { x: KX - 10, y: SCR.y + 100, z: 1.55, r: 0, tag: 'kiosk' }, CEIL: { x: -60, y: -1450, z: 0.62, r: 0 } };
// screen inserts (object shots on a solid backdrop): [from, to, state]
function inserts(L) {
  if (L === 'hook') return [[-1, 0.6, 'error']];
  if (L === 'A1') return [[ev('scan') + 0.05, SP.a1_her.t - 0.05, 'price'], [SP.a1_x2.t - 0.05, endOf('a1_x2') + 0.15, 'error']];
  if (L === 'B1') return [[SP.b1_x.t - 0.05, endOf('b1_x') + 0.15, 'assist']];
  if (L === 'B2') return [[ev('zoom'), SP.b2_nar.t - 0.1, 'camview']];
  if (L === 'C1') return [[ev('rating'), SP.c1_nar.t - 0.1, 'rating']];
  if (L === 'C2') return [[ev('green'), SP.c2_her2.t - 0.05, 'paid'], [SP.c2_x2.t - 0.05, ev('turn'), 'tip']];
  return [];
}
const insertAt = (t, L) => inserts(L).find(([a, b]) => t >= a && t < b);
function shotHard(t) { const sc = sceneAt(t), L = sc.id; if (L === 'outro') return SH.WIDE; const f = s => ({ ...s, force: true });
  if (L === 'hook') { if (t < 0.6) return SH.WIDE; if (t < endOf('hook_her') + 0.15) return f(SH.HER_R); return f(SH.WIDE); }
  const u = t - sc.s; if (u < 1.15) return f(SH.WIDE);
  const l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (insertAt(t, L)) return f(SH.WIDE);                                                        // (under the insert)
  if (L === 'A1' && (t > ev('place') - 0.3 && t < SP.a1_x2.t - 0.05)) return f(SH.WIDE);        // she puts it on the scale
  if (L === 'A1' && t < SP.a1_x.t - 0.1) return f(SH.WIDE);
  if (L === 'A2' && ['a2_x', 'a2_x2', 'a2_x3'].some(id => speaking(id, t, 0.6, 0.2))) return f(SH.WIDE);   // remove / put back: the whole action
  if (L === 'A2' && t > ev('look') - 0.05) return f(SH.HER);                                   // deadpan look into the camera
  if (L === 'B1' && t > ev('walk') - 0.05 && t < SP.b1_d.t - 0.1) return f(SH.WIDE);            // Dan walks in
  if (L === 'B1' && t > ev('press') - 0.2 && t < SP.b1_d2.t - 0.1) return f(SH.WIDE);           // he presses the button
  if (L === 'B1' && t > ev('stare') - 0.05 && t < SP.b1_d3.t - 0.1) return f(SH.DAN_R);         // slow look at the screen
  if (L === 'B2' && t < SP.b2_her.t - 0.1) return f(SH.WIDE);                                   // alarm: red kiosk, both react
  if (L === 'B2' && t > ev('cam') - 0.1) return f(SH.CEIL);                                     // camera comes down from the ceiling
  if (L === 'C1' && t > ev('freeze') - 0.05 && t < SP.c1_her2.t - 0.1) return f(SH.HER_R);
  if (L === 'C2') { if (t < SP.c2_her.t - 0.1) return f(SH.HER); if (speaking('c2_her', t, 0.1, 0.25)) return f(SH.HER);
    if (t < ev('green')) return f(SH.WIDE);                                                     // the silence: everyone still
    if (t > ev('take') - 0.3 && t < SP.c2_x2.t - 0.05) return f(SH.WIDE);
    if (t > ev('turn') - 0.05 && t < SP.c2_her3.t - 0.1) return f(SH.HER_R);
    if (speaking('c2_x3', t, 0.1, 0.05)) return f(SH.KIOSK);
    if (t > ev('shock')) return f(t < ev('shock') + 0.8 ? SH.HER_R : SH.CARD); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : who === 'dan' ? SH.DAN : SH.KIOSK;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  const prevEnd = Math.max(0, ...TL.speech.filter(s => s.id.startsWith(l + '_') && s.t + s.d <= t).map(s => s.t + s.d));
  if (next && t - prevEnd < 0.6) return f(single(next.who));
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }, insertOn = false) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, cam.tag, insertOn); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts
function backdrop(c, k) { c.save(); c.globalAlpha = clamp(k * 4); const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#3B3550'); g.addColorStop(1, '#1F1B2C'); c.fillStyle = g; c.fillRect(0, 0, W, HH); c.restore(); }
function banner(c, k, en, col, ru, y = 1515) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(-0.025); c.scale(k, k); const hh = ru ? 132 : 112;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -480 + 8, -hh / 2 + 10, 960, hh, 26); c.fill(); c.fillStyle = col; rr(c, -480, -hh / 2, 960, hh, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -480, -hh / 2, 960, hh, 26); c.stroke();
  fitTxt(c, en, 0, ru ? -18 : 2, 54, C.white, 880); if (ru) fitTxt(c, ru, 0, 38, 30, '#FFFFFF', 900, 'Nun9'); c.restore(); }
function bigScreen(c, k, st, t, y = 1080) { const w = 860, h = 640, s = lerp(0.7, 1, k); c.save(); c.globalAlpha = clamp(k * 2); c.translate(540, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -w / 2 - 30 + 14, -h / 2 - 30 + 18, w + 60, h + 60, 40); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -w / 2 - 30, -h / 2 - 30, w + 60, h + 60, 40); c.fill();
  c.save(); c.translate(-w / 2, -h / 2); c.beginPath(); rr(c, 0, 0, w, h, 16); c.clip(); screen(c, w, h, st, t, talk('machine', t)); c.restore(); c.restore(); }
function camView(c, k, t) { if (k <= 0) return; const w = 900, h = 760; c.save(); c.globalAlpha = clamp(k * 2); c.translate(540, 1020);
  c.fillStyle = '#0E1A12'; rr(c, -w / 2, -h / 2, w, h, 20); c.fill(); c.save(); c.beginPath(); rr(c, -w / 2, -h / 2, w, h, 20); c.clip();
  const z = lerp(1.6, 2.4, eOut(P(t, ev('zoom'), ev('zoom') + 0.6))); c.save(); c.scale(z, z); c.rotate(-0.3); bananaShape(c, 1.4); c.restore();
  c.fillStyle = 'rgba(80,255,140,.18)'; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = 'rgba(0,0,0,.18)'; for (let y = -h / 2; y < h / 2; y += 8) c.fillRect(-w / 2, y, w, 3); c.restore();
  c.strokeStyle = '#FF3B3B'; c.lineWidth = 8; const r = 230; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.beginPath(); c.moveTo(sx * r, sy * (r - 70)); c.lineTo(sx * r, sy * r); c.lineTo(sx * (r - 70), sy * r); c.stroke(); }
  c.fillStyle = '#FF3B3B'; if (Math.sin(t * 8) > 0) { c.beginPath(); c.arc(-w / 2 + 50, -h / 2 + 50, 14, 0, TAU); c.fill(); } txt(c, 'REC', -w / 2 + 110, -h / 2 + 52, 34, '#FF3B3B', 'Unb9');
  txt(c, 'CAM 04 · CHECKOUT', w / 2 - 30, -h / 2 + 52, 26, 'rgba(200,255,210,.85)', 'Nun9', 'right'); c.restore();
  banner(c, eBack(P(t, ev('zoom') + 0.35, ev('zoom') + 0.6), 2), 'POTENTIAL THREAT: BANANA', '#E0474C', 'потенциальная угроза: банан', 1495); }
function overlays(c, t, L) { const ins = insertAt(t, L); if (!ins) return; const [a, b, st] = ins, k = a < 0 ? (1 - eIn(P(t, b - 0.18, b))) : win(t, a, b); if (k <= 0) return;
  backdrop(c, a < 0 ? 1 : k);
  if (st === 'camview') return camView(c, k, t);
  bigScreen(c, k, st, t);
  if (st === 'rating') banner(c, k * eBack(P(t, a + 0.3, a + 0.55), 2), 'CUSTOMER RATING: 1/5', '#2B2F3A', 'оценка покупателя: 1 из 5', 1520);
  if (L === 'hook') { c.save(); c.translate(250, 1500); c.rotate(-0.35); bananaShape(c, 2.0); c.restore(); }
}

// ---------------- hook & frame
function drawHook(c, t) { const cam = CAM[Math.min(CAM.length - 1, Math.round(t * FPS))], ins = insertAt(t, 'hook');
  const { heads, M } = drawWorld(c, t, 'hook', cam, { x: 0, y: 0, r: 0 }, !!ins); Hq.vignette(c, W, HH, 0.3);
  overlays(c, t, 'hook');
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  K.bubbles(c, t, { id: 'hook' }, heads, proj, { hold: { hook_her: 0.2 } });
  K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЫ БЫ ПОСПОРИЛ(А)', 'С ЭТОЙ КАССОЙ?'], rows: [['A2', 'Are you kidding me?'], ['C1', "I've followed every instruction."]], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ВОЮЕТ С КАССОЙ'],
    hero: (cc, tt) => K.put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 2.1, G.her.ySh - 230 + Math.sin(tt * 8) * 25, { planar: true }), items: { R: bananaItem(-0.5) } }, 0, 0) });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t), ins = insertAt(t, sc.id);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh, !!ins); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  if (sc.id === 'A2' && cam.tag === 'her' && t > ev('look')) sweat(c, { ...proj(heads.her), hh: heads.her.hh * cam.z }, clamp(P(t, ev('look'), ev('look') + 0.4)));
  if (sc.id === 'B2' && !ins && t > SP.b2_x.t - 0.35 && t < ev('cam')) { c.fillStyle = `rgba(255,40,40,${0.12 * (0.5 + 0.5 * Math.sin(t * 14))})`; c.fillRect(0, 0, W, HH); }   // red alarm light
  overlays(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { machine: ['SELF-CHECKOUT', '#2F6FD8'], dan: ['DAN', '#F28C28'] }, hold: { c2_her: 0.25, c1_her: 0.2, b2_her2: 0.1 } });
  if (sc.id === 'B1') K.pop(c, t, 'БА-ДУМ-ТСС!', endOf('b1_d3') + 0.1, SP.b1_nar.t - 0.15, 540, 1250);
  if (sc.id === 'C2') { K.dots(c, t, endOf('c2_her') + 0.25, ev('green') - 0.05); K.pop(c, t, 'БА-ДУМ-ТСС!', endOf('c2_x3') + 0.75, SP.c2_nar.t - 0.15, 540, 1250); }
  K.hud(c, t, sc);
}
E.run('checkout', NF, renderFrame);
