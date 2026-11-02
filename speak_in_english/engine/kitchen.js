// "Mother-in-law reorganised your kitchen" episode renderer (hard_cut camera): node kitchen.js start end out.mp4 | --png=f1,f2
// Her kitchen: the kitchen door on the left (she comes home from work, blazer + handbag), a run of cupboards and drawers ALL covered
// with little white labels, the hob with the soup pot on the right. Rose (mother-in-law) in an apron with a label printer.
// Label counter (label icon + number) bottom-left: 47 -> 52 (A2) -> 53 (B1 NEXT VISIT) -> 54 (B2 SOUP (SALTED)) -> 999+ (C2 garage).
// Shots tagged 'ui:<view>' (drawer) replace the world with a full-screen close-up insert. C2 twist: hard cut to the labelled GARAGE (Tom). No black card.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/kitchen/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const ORDER = ['hook', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'outro'], idx = L => ORDER.indexOf(L);

// ---------------- cast: heroine back from the office (navy blazer, white shirt, skirt, handbag); Rose in an apron; Tom (garage only)
const HER = { ...BASE.her_lift, top: { type: 'blazer', col: '#34507E', shirt: '#F7F9FC', tie: '#F7F9FC' }, bottom: { type: 'skirt', col: '#2B3550' }, shoes: { col: '#2A1E18', acc: null } };
const ROSE = BASE.rose, TOM = BASE.tom;
const SEAT = 330;
const G = { her: geom(HER), mil: geom(ROSE), son: geom(TOM, SEAT) };
const HX = -470, RX = 380, DOORX = -470, POTX = 760, CT = -780, GX = 9000, TX = GX - 60, GRX = GX + 560;
const CAB0 = -150, CABW = 330, CABY0 = -2050, CABY1 = -1350;          // upper cupboards: 5 doors from x=-150
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
// a little white label (world): text centred, slight tilt
function label(c, x, y, txt, s = 1, rot = 0, k = 1) { if (k <= 0) return; const w = Math.max(90, txt.length * 19 + 34) * s, h = 46 * s; c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -w / 2 + 4, -h / 2 + 5, w, h, 6 * s); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -w / 2, -h / 2, w, h, 6 * s); c.fill(); c.strokeStyle = '#C9C3B6'; c.lineWidth = 2; c.stroke();
  fitTxt(c, txt, 0, 2 * s, 30 * s, '#2B2F3A', w - 14 * s, 'Unb9'); c.restore(); }

// ---------------- props
function printerDraw(c, s = 1, strip = 0.2, txt = '') { c.save(); c.scale(s, s);
  if (strip > 0) { const L = 30 + strip * 170; c.fillStyle = '#FFFFFF'; c.fillRect(56, -52, L, 30); c.strokeStyle = '#C9C3B6'; c.lineWidth = 2; c.strokeRect(56, -52, L, 30); if (txt && strip > 0.6) fitTxt(c, txt, 56 + L / 2, -36, 18, '#2B2F3A', L - 10); }
  paint(c, q => { q.m(-70, -90); q.l(60, -90); q.q(74, -90, 74, -76); q.l(74, -8); q.q(74, 6, 60, 6); q.l(-70, 6); q.q(-84, 6, -84, -8); q.l(-84, -76); q.q(-84, -90, -70, -90); q.z(); }, '#8C93A0', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#2B2F3A'; rr(c, -66, -78, 74, 34, 6); c.fill(); c.fillStyle = '#9CE6B0'; rr(c, -60, -72, 62, 22, 4); c.fill();
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(40, -60, 10, 0, TAU); c.fill(); c.fillStyle = '#5A606E'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(-50 + k * 30, -22, 8, 0, TAU); c.fill(); }
  c.restore(); }
const printerItem = (strip, txt) => ctx => { ctx.save(); ctx.translate(-10, 40); printerDraw(ctx, 1.0, strip, txt); ctx.restore(); };
function saltDraw(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-46, 0); q.l(46, 0); q.l(40, -190); q.q(0, -230, -40, -190); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#7FB0D8'; c.fillRect(-42, -120, 84, 46); fitTxt(c, 'SALT', 0, -96, 30, '#FFFFFF', 76); c.fillStyle = '#B8BDC6'; c.beginPath(); c.ellipse(0, -205, 30, 18, 0, 0, TAU); c.fill();
  c.fillStyle = '#5A606E'; for (const [x, y] of [[-12, -208], [0, -200], [12, -208], [0, -214]]) { c.beginPath(); c.arc(x, y, 3.4, 0, TAU); c.fill(); } c.restore(); }
// pouring: shaker upside down above the pot
const saltItem = ctx => { ctx.save(); ctx.translate(0, -20); ctx.rotate(Math.PI * 0.95); saltDraw(ctx, 1.05); ctx.restore(); };
function potDraw(c, x, t, salted, labK) { c.save(); c.translate(x, CT);
  // steam
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 10; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { const ph = (t * 0.6 + k / 3) % 1; c.globalAlpha = Math.sin(ph * Math.PI) * 0.8; c.beginPath(); c.moveTo(-60 + k * 60, -230 - ph * 160); c.quadraticCurveTo(-30 + k * 60, -270 - ph * 160, -60 + k * 60, -320 - ph * 160); c.stroke(); } c.globalAlpha = 1;
  paint(c, q => { q.m(-150, -220); q.l(150, -220); q.l(140, -10); q.q(140, 0, 120, 0); q.l(-120, 0); q.q(-140, 0, -140, -10); q.z(); }, '#C23C4A', { sd: 10, hd: 4, lw: 5 });
  c.fillStyle = '#9A2E3A'; rr(c, -170, -236, 340, 30, 12); c.fill(); for (const sd of [-1, 1]) { c.fillStyle = '#2B2F3A'; rr(c, sd * 150 + (sd < 0 ? -40 : 0), -190, 40, 22, 8); c.fill(); }
  c.fillStyle = salted ? '#F4F1EC' : '#E9A23B'; c.beginPath(); c.ellipse(0, -222, 140, 16, 0, 0, TAU); c.fill();
  if (labK > 0) label(c, 0, -110, 'SOUP (SALTED)', 1.15, -0.06, labK);
  c.restore(); }

// ---------------- the kitchen (prerendered, softly blurred); labels, cupboard doors, pot and people are drawn live
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawKitchen(c) {
  c.fillStyle = '#F3E9D8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#CFE3E0'; c.fillRect(-150, CABY1, 2100, CT - CABY1);   // tiled splashback
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 5; for (let y = CABY1; y < CT; y += 70) { c.beginPath(); c.moveTo(-150, y); c.lineTo(1950, y); c.stroke(); } for (let x = -150; x < 1950; x += 70) { c.beginPath(); c.moveTo(x, CABY1); c.lineTo(x, CT); c.stroke(); }
  // the kitchen door (open, hallway behind)
  c.fillStyle = '#FFFDF8'; rr(c, DOORX - 320, -2280, 640, 2290, 10); c.fill(); c.fillStyle = '#B8A88E'; rr(c, DOORX - 270, -2230, 540, 2230, 6); c.fill();
  c.fillStyle = '#A3937A'; c.fillRect(DOORX - 270, -400, 540, 400); c.fillStyle = '#8C7A62'; c.fillRect(DOORX + 120, -1900, 90, 1500);   // hallway floor + coat stand
  c.fillStyle = '#E9E2D4'; paint(c, q => { q.m(DOORX - 270, -2230); q.l(DOORX - 400, -2150); q.l(DOORX - 400, -80); q.l(DOORX - 270, 0); q.z(); }, '#E9E2D4', { sd: 4, hd: 2, lw: 3 });
  c.fillStyle = '#C9A13A'; c.beginPath(); c.arc(DOORX - 365, -1100, 16, 0, TAU); c.fill();
  // window above the sink side + clock
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-1350, -2000, 120, 0, TAU); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 12; c.stroke(); c.beginPath(); c.moveTo(-1350, -2000); c.lineTo(-1350, -2080); c.moveTo(-1350, -2000); c.lineTo(-1295, -1980); c.stroke();
  // fridge on the far right
  paint(c, q => { q.m(1980, -2350); q.l(2200, -2350); q.l(2200, 0); q.l(1980, 0); q.z(); }, '#E6ECF2', { sd: 8, hd: 4, lw: 4 });
  // floor tiles
  c.fillStyle = '#D8C3A0'; c.fillRect(BX0, -10, BW, 1450); c.fillStyle = 'rgba(0,0,0,.07)'; for (let y = -10; y < 1400; y += 150) for (let x = BX0 + ((y / 150) % 2) * 150; x < BX0 + BW; x += 300) c.fillRect(x, y, 150, 150);
}
const mkBG = (fn, x0, y0, w, h) => { const a = createCanvas(Math.round(w * BS), Math.round(h * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-x0, -y0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawKitchen, BX0, BY0, BW, BH);

// labels on the cupboards (readable ones) + small filler labels: 47 in total at the start
const UPPER = ['CUPS (BETTER!)', 'TEA', 'SPICES A-Z', 'PLATES →', 'GLASSES'];
const DRAWERS = [['SPOONS →', 'FORKS', 'KNIVES', 'LIDS', 'TOWELS'], ['FOIL', 'BAGS', 'PANS (BIG)', 'PANS (SMALL)', 'BAKING']];
const FILL = ['MUGS', 'JAM', 'RICE', 'BOWLS', 'OIL', 'SUGAR', 'FLOUR', 'PASTA', 'SALT', 'OATS', 'HONEY', 'NUTS', 'TINS', 'BREAD', 'SPARE', 'MISC', 'SAUCE', 'CANDLES', 'KEYS?', 'NAPKINS', 'CORKS', 'STRAWS', 'TRAYS', 'JARS', 'CLIPS', 'BOARD', 'WHISK', 'TONGS', 'GRATER', 'LADLE', 'SIEVE', 'MILK', 'BUTTER'];
const NEWL = [[CAB0 + CABW * 1.5, CABY0 + 520, 'TEA (LEFT!)'], [CAB0 + CABW * 3.5, CABY0 + 140, 'MUGS →'], [CAB0 + CABW * 4.5, CT + 560, 'BIN (BETTER)'], [CAB0 + CABW * 0.5, CT + 560, 'SPONGE'], [2090, -1300, 'MILK (FRONT)']];
const NEXTV = [CAB0 + CABW * 2.5, CABY0 + 520];
function fillers() { const out = []; let k = 0;
  for (let i = 0; i < 5; i++) for (const dy of [140, 330]) { if (k >= FILL.length) break; out.push([CAB0 + CABW * i + CABW * 0.5 + (i % 2 ? 40 : -40), CABY0 + dy + (k % 3) * 8, FILL[k++], 0.75]); }
  for (let i = 0; i < 5; i++) for (const yy of [CT + 315, CT + 655]) { if (k >= FILL.length) break; out.push([CAB0 + CABW * i + CABW * 0.5 + (i % 2 ? 50 : -50), yy, FILL[k++], 0.7]); }
  for (let j = 0; j < 7 && k < FILL.length; j++) out.push([2090, -2200 + j * 150, FILL[k++], 0.75]);
  while (k < FILL.length) { out.push([1200 + (k % 3) * 220, CABY1 + 120 + Math.floor(k / 3) % 3 * 120, FILL[k++], 0.7]); }
  return out; }
const FILLERS = fillers();   // 5 + 10 + 33 - 1 tea-towel = 47 with the readable ones (counter shows the nominal number)
const newK = (t, i) => { const a = ev('A2', 'print') + 0.55 + 0.12 * i; return idx(sceneAt(t).id) > idx('A2') ? 1 : eBack(clamp((t - a) / 0.25), 2.4); };
const stickK = t => { const L = sceneAt(t).id; if (idx(L) > idx('B1')) return 1; if (L !== 'B1') return 0; return eBack(clamp((t - ev('B1', 'stick') - 0.7) / 0.22), 2.4); };
const soupK = t => { const L = sceneAt(t).id; if (idx(L) > idx('B2')) return 1; if (L !== 'B2') return 0; return eBack(clamp((t - ev('B2', 'soupl') - 0.4) / 0.22), 2.4); };
const salted = t => { const L = sceneAt(t).id; return idx(L) > idx('B2') || (L === 'B2' && t > ev('B2', 'salt') + 0.6); };

// A1: the first upper cupboard is open; Rose pushes everything to the very back (smaller, higher, darker)
const cabOpen = (t, L) => L === 'A1' && t > SP.a1_r.t;
const pushK = t => eIO(clamp((t - ev('A1', 'push')) / 0.6));
function cupboards(c, t, L) {
  // base unit + drawers
  paint(c, q => { q.m(-150, CT); q.l(1950, CT); q.l(1950, 0); q.l(-150, 0); q.z(); }, '#7FA8A0', { sd: 10, hd: 4, lw: 4 });
  for (let i = 0; i < 5; i++) for (let r = 0; r < 2; r++) { const x = CAB0 + CABW * i, y = CT + 60 + r * 340;
    paint(c, q => { q.m(x + 14, y); q.l(x + CABW - 14, y); q.l(x + CABW - 14, y + 320); q.l(x + 14, y + 320); q.z(); }, '#9CC3BA', { sd: 6, hd: 3, lw: 3 });
    c.fillStyle = '#C9A13A'; rr(c, x + CABW / 2 - 50, y + 40, 100, 18, 9); c.fill();
    label(c, x + CABW / 2, y + 120, DRAWERS[r][i], 1.0, (i + r) % 2 ? 0.03 : -0.03); }
  c.fillStyle = '#E6DCC8'; c.fillRect(-170, CT - 30, 2140, 40);   // worktop
  // hob
  c.fillStyle = '#2B2F3A'; rr(c, POTX - 210, CT - 34, 420, 12, 4); c.fill();
  // upper cupboards
  for (let i = 0; i < 5; i++) { const x = CAB0 + CABW * i, open = i === 0 && cabOpen(t, L);
    if (open) { c.fillStyle = '#4A3A30'; c.fillRect(x + 10, CABY0 + 10, CABW - 20, CABY1 - CABY0 - 20); c.fillStyle = '#6A5444'; c.fillRect(x + 10, CABY0 + 330, CABW - 20, 16);
      const k = pushK(t); const items = [['#F2C14E', 0], ['#EF7FAA', 1], ['#7FB0D8', 2]];
      for (const [col, j] of items) { const s = lerp(1, 0.5, k), bx = x + 70 + j * 90 * lerp(1, 0.6, k) + k * 40, by = lerp(CABY1 - 26, CABY0 + 320, k);
        c.save(); c.translate(bx, by); c.scale(s, s); c.globalAlpha = 1 - k * 0.35; c.fillStyle = col; rr(c, -30, -90, 60, 90, 10); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 4; c.stroke(); c.restore(); }
      c.globalAlpha = 1;
      // the door swung open to the left
      paint(c, q => { q.m(x - 90, CABY0 + 20); q.l(x + 10, CABY0); q.l(x + 10, CABY1); q.l(x - 90, CABY1 - 20); q.z(); }, '#8DB7AE', { sd: 6, hd: 3, lw: 3 }); continue; }
    paint(c, q => { q.m(x + 10, CABY0); q.l(x + CABW - 10, CABY0); q.l(x + CABW - 10, CABY1); q.l(x + 10, CABY1); q.z(); }, '#A9CEC5', { sd: 8, hd: 4, lw: 4 });
    c.fillStyle = '#C9A13A'; rr(c, x + CABW / 2 - 9, CABY1 - 130, 18, 80, 9); c.fill();
    label(c, x + CABW / 2, CABY0 + 520, UPPER[i], 1.1, i % 2 ? 0.04 : -0.04, i === 1 && newK(t, 0) > 0.5 ? 0 : 1); }
  for (const [x, y, s, sc] of FILLERS) { if (cabOpen(t, L) && x < CAB0 + CABW && y < CABY1) continue; label(c, x, y, s, sc, ((x + y) % 7 - 3) * 0.015); }
  for (let i = 0; i < NEWL.length; i++) { const [x, y, s] = NEWL[i]; label(c, x, y, s, 1.1, (i % 2 ? 0.05 : -0.05), newK(t, i)); }
  label(c, NEXTV[0], NEXTV[1] - 120, 'NEXT VISIT', 1.25, -0.07, stickK(t));
  potDraw(c, POTX, t, salted(t), soupK(t));
  K.mark(c, 'pot', POTX, CT - 120, 160);
}

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const open = (g, s, k = 1.7) => reach(g, s, s * g.sw * k, g.ySh + 90, { planar: true });
const bag = (cc, a) => { const sw = a.sw, y0 = a.ySh; cc.strokeStyle = '#6A3E28'; cc.lineWidth = 10; cc.beginPath(); cc.moveTo(sw * 0.45, y0 + 8); cc.lineTo(-sw * 0.95, -a.h * 0.47); cc.stroke();
  paint(cc, q => { q.m(-sw * 1.35, -a.h * 0.49); q.l(-sw * 0.6, -a.h * 0.49); q.l(-sw * 0.55, -a.h * 0.36); q.l(-sw * 1.4, -a.h * 0.36); q.z(); }, '#A0583A', { sd: 6, hd: 3, lw: 4 });
  cc.fillStyle = '#7A3E28'; cc.fillRect(-sw * 1.35, -a.h * 0.49, sw * 0.75, 40); cc.fillStyle = '#F2C14E'; cc.beginPath(); cc.arc(-sw * 0.97, -a.h * 0.49 + 40, 9, 0, TAU); cc.fill(); };
const apron = g => (cc, a) => { const sw = a.sw, y0 = a.ySh, yW = -a.h * 0.56;
  paint(cc, q => { q.m(-sw * 0.42, y0 + 70); q.l(sw * 0.42, y0 + 70); q.l(sw * 0.5, yW); q.l(sw * 0.95, yW + 30); q.l(sw * 0.9, -a.h * 0.22); q.l(-sw * 0.9, -a.h * 0.22); q.l(-sw * 0.95, yW + 30); q.l(-sw * 0.5, yW); q.z(); }, '#FFF6F0', { sd: 8, hd: 4, lw: 4 });
  cc.strokeStyle = '#EE5E9A'; cc.lineWidth = 8; cc.beginPath(); cc.moveTo(-sw * 0.9, -a.h * 0.22 - 6); cc.lineTo(sw * 0.9, -a.h * 0.22 - 6); cc.stroke(); cc.beginPath(); cc.moveTo(-sw * 0.42, y0 + 70); cc.lineTo(-sw * 0.2, y0 - 10); cc.moveTo(sw * 0.42, y0 + 70); cc.lineTo(sw * 0.2, y0 - 10); cc.stroke();
  cc.fillStyle = '#F7B6CF'; rr(cc, -sw * 0.35, -a.h * 0.45, sw * 0.7, 110, 14); cc.fill();
  // little label on the apron itself ("ROSE")
  label(cc, 0, y0 + 160, 'ROSE', 0.9, -0.05); };
function herX(t, L) { if (L === 'A1' && t > ev('A1', 'reach') - 0.05 && t < SP.a1_nar.t - 0.1) return -200; return HX; }
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {}, afterTorso: bag };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1, 0.3); st.armR = open(g, 1, 1.5); }
  if (L === 'A1') { st.mood = 'worried'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'shock'; st.armR = open(g, 1, 1.8); st.armL = open(g, -1, 1.5); }
    if (t > e('push')) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('reach') - 0.05 && t < SP.a1_nar.t - 0.1) { const w = Math.sin(t * 14) * 14; st.mood = 'worried'; st.blink = 1; st.turn = 0.1; st.look = 0.4; st.lookY = -0.7; st.armR = reach(g, 1, 200 + w, -1640 + 40); st.armL = reach(g, -1, -g.sw * 1.2, g.ySh + 140); st.y = -40 - Math.abs(Math.sin(t * 7)) * 14; } }
  if (L === 'A2') { st.mood = 'worried'; if (speaking('a2_h', t, 0.05, 0.3)) { st.armL = open(g, -1, 1.6); st.armR = open(g, 1, 1.6); } if (t > e('print')) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 160); } if (t > endOf('b1_r')) { st.mood = 'skeptical'; } }
  if (L === 'B2') { st.mood = 'happy'; if (speaking('b2_h', t, 0.05, 0.3)) gest(st, g, 'her', t, 1, 160); if (t > e('salt')) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_h', t, 0.05, 0.3)) { st.armL = chest(g, -1, 0.25); gest(st, g, 'her', t, 1, 160); } if (t > endOf('c1_r')) st.mood = 'happy'; }
  if (L === 'C2') { st.mood = 'neutral'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.3); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 60 + Math.sin(t * 2) * 30, { planar: true }); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'smug'; st.blink = 1; } if (t > ev('C2', 'march') + 0.6) { st.turn = -0.3; st.look = -0.8; } }
  return st; }
function roseX(t, L) { if (L === 'C2') { const u = t - ev('C2', 'march'); if (u > 0) return lerp(RX, DOORX, eIn(clamp(u / 1.4))); } return RX; }
const roseGone = (t, L) => L === 'C2' && t > ev('C2', 'march') + 1.4;
function roseState(t, L) { const g = G.mil, e = k => ev(L, k), st = { t, talk: talk('mil', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: chest(g, 1, 0.7), items: { R: printerItem(0.15) }, afterTorso: apron(g) };
  const print = (t0, txt) => { const u = t - t0; if (u > -0.1 && u < 1.2) { st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 120); st.items.R = printerItem(clamp(u / 0.45), txt); } };
  if (L === 'hook') { st.mood = 'happy'; st.laugh = speaking('hook_r', t) ? false : true; st.armL = open(g, -1, 2.0); st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 60, { planar: true }); st.items.R = printerItem(0.7, 'SURPRISE'); }
  if (L === 'A1') { if (speaking('a1_r', t, 0.05, 0.1)) { st.mood = 'happy'; st.armL = open(g, -1, 1.8); }
    const u = t - e('push'); if (u > -0.1 && u < 0.9) { st.turn = 0.3; st.look = -0.9; st.lookY = -0.5; st.armL = reach(g, -1, CAB0 + 120 + eIO(clamp(u / 0.6)) * 40 - RX, CABY1 - 60 - eIO(clamp(u / 0.6)) * 40); }
    if (u > 0.9) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'A2') { st.mood = 'happy'; if (speaking('a2_r', t, 0.05, 0.3)) { st.mood = 'smug'; st.armL = open(g, -1, 1.5); } print(e('print'), 'LABEL'); }
  if (L === 'B1') { if (speaking('b1_r', t, 0.05, 0.1)) { st.mood = 'happy'; st.armL = open(g, -1, 1.5); } print(e('stick'), 'NEXT VISIT'); if (t > e('stick') + 0.65) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'B2') { if (speaking('b2_r', t, 0.05, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    const u = t - e('salt'); if (u > -0.1 && u < 1.3) { st.mood = 'happy'; st.turn = 0.4; st.look = 0.9; st.lookY = 0.4; st.armR = reach(g, 1, POTX - RX - 30 + Math.sin(t * 22) * 12, CT - 420); st.items = { R: saltItem }; st.armL = chest(g, -1, 0.4); }
    if (u >= 1.3) { print(e('soupl'), 'SOUP (SALTED)'); st.mood = 'smug'; } }
  if (L === 'C1') { st.mood = 'happy'; if (t > e('touch') - 0.05) { st.mood = 'happy'; st.blink = 1; st.armL = reach(g, -1, -g.sw * 0.1, g.ySh + 200); } if (t > endOf('c1_r')) st.blink = 1; }
  if (L === 'C2') { st.mood = 'surprised'; st.blink = 0;
    if (t > endOf('c2_h') + 0.05) { st.mood = 'smug'; st.blink = 1; st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 60); st.items.R = printerItem(0.15); }
    if (t > e('march')) { st.mood = 'smug'; st.blink = 1; st.turn = 0.6; st.look = -0.9; st.legPose = 'walk'; st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 40); st.armL = reach(g, -1, -g.sw * 1.1, g.ySh + 260 + Math.sin(t * 8) * 30); } }
  return st; }

// ---------------- the GARAGE (C2 twist): shelves, boxes, bike, tools, Tom on a crate, all covered in labels
const GX0 = GX - 2200, GW = 4400;
function drawGarage(c) {
  c.fillStyle = '#B9B4AA'; c.fillRect(GX0, BY0, GW, BH); c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = -2600; y < 0; y += 110) for (let x = GX0 + ((y / 110) % 2) * 110; x < GX0 + GW; x += 220) c.fillRect(x, y, 210, 100);
  c.fillStyle = '#8C93A0'; c.fillRect(GX0, -10, GW, 1450);
  // pegboard with tools
  c.fillStyle = '#C9A880'; rr(c, GX - 700, -2050, 1400, 700, 10); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; for (let y = -2010; y < -1360; y += 40) for (let x = GX - 680; x < GX + 680; x += 40) c.fillRect(x, y, 6, 6);
  for (let k = 0; k < 7; k++) { const x = GX - 600 + k * 190; c.fillStyle = '#5A606E'; c.fillRect(x, -1950, 18, 260); c.fillStyle = ['#E0474C', '#F2C14E', '#3C8FE0', '#2E9E4A'][k % 4]; rr(c, x - 22, -1720, 62, 120, 12); c.fill(); }
  // shelves with boxes left and right
  for (const sx of [GX - 2000, GX + 1000]) { c.fillStyle = '#7A5A3A'; c.fillRect(sx, -2400, 30, 2400); c.fillRect(sx + 870, -2400, 30, 2400);
    for (let r = 0; r < 4; r++) { const y = -2000 + r * 560; c.fillStyle = '#8A6A4A'; c.fillRect(sx, y, 900, 24); for (let k = 0; k < 3; k++) { c.fillStyle = ['#C9A27A', '#B88E62', '#D4B48A'][(k + r) % 3]; rr(c, sx + 50 + k * 280, y - 300, 250, 300, 8); c.fill(); } } }
}
const BGG = mkBG(drawGarage, GX0, BY0, GW, BH);
const GLAB = (() => { const out = [], words = ['BOX', 'NAILS', 'SCREWS (SMALL)', 'SCREWS (SMALLER)', 'HAMMER →', 'TOOLS A-Z', 'DUST (OLD)', 'CABLES', 'PAINT', 'BOX 1 OF 300', 'GLUE', 'RAKE', 'SPARE', 'TAPE', 'BOLTS', 'BULBS', 'MISC (2)', 'STUFF', 'OLD STUFF', 'NEW STUFF', 'ROPE', 'WD-40', 'SAW', 'GLOVES', 'BUCKET', 'SOCKET SET', 'DO NOT TOUCH', 'TOUCH'];
  let s = 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let k = 0; k < 260; k++) { const x = GX - 2100 + rnd() * 4200, y = -2500 + rnd() * 2450; if ((Math.abs(x - TX) < 260 || Math.abs(x - GRX) < 230) && y > -1450) continue; out.push([x, y, words[k % words.length], 0.55 + rnd() * 0.45, (rnd() - 0.5) * 0.4]); }
  return out; })();
function bikeDraw(c, x, y) { c.save(); c.translate(x, y); c.strokeStyle = '#2B2F3A'; c.lineWidth = 14; for (const dx of [-210, 210]) { c.beginPath(); c.arc(dx, -170, 160, 0, TAU); c.stroke(); }
  c.strokeStyle = '#E0474C'; c.lineWidth = 18; c.beginPath(); c.moveTo(-210, -170); c.lineTo(-40, -420); c.lineTo(160, -420); c.lineTo(210, -170); c.moveTo(-40, -420); c.lineTo(20, -170); c.lineTo(-210, -170); c.moveTo(20, -170); c.lineTo(160, -420); c.stroke();
  c.fillStyle = '#2B2F3A'; rr(c, -110, -470, 120, 34, 14); c.fill(); c.lineWidth = 12; c.beginPath(); c.moveTo(160, -420); c.lineTo(170, -520); c.lineTo(110, -540); c.stroke(); c.restore(); }
function garage(c, t, who) { const heads = {}, g = G.son, gr = G.mil, u = t - ev('C2', 'garage');
  c.drawImage(BGG, GX0, BY0, GW, BH);
  bikeDraw(c, GX - 640, 0); label(c, GX - 660, -640, 'BIKE', 1.1, -0.05); label(c, GX - 850, -170, 'WHEEL (FRONT)', 0.8, 0.1); label(c, GX - 430, -170, 'WHEEL (BACK)', 0.8, -0.1);
  for (const [x, y, s, sc, r] of GLAB) label(c, x, y, s, sc, r);
  // the crate he sits on
  paint(c, q => { q.m(TX - 190, -SEAT - 20); q.l(TX + 190, -SEAT - 20); q.l(TX + 190, 0); q.l(TX - 190, 0); q.z(); }, '#B88E62', { sd: 8, hd: 4, lw: 4 }); label(c, TX, -SEAT / 2, 'SON → SIT HERE', 0.9, 0.03);
  heads.son = K.put(c, TOM, { t, talk: talk('son', t), mood: 'worried', blink: 1, turn: 0.15, look: 0.2, lookY: 0, legPose: 'sit', drop: SEAT,
    armL: reach(g, -1, -g.sw * 0.7, g.ySh + 300), armR: reach(g, 1, g.sw * 0.7, g.ySh + 300), items: {},
    front: (cc, a) => { label(cc, 0, a.ySh + 190, 'SON → SIT HERE', 1.05, -0.06); label(cc, a.head.x + 40, a.head.y - g.hh * 0.85, 'HAIR', 0.7, 0.2); } }, TX, 0);
  if (who !== 'son') heads.mil = K.put(c, ROSE, { t, talk: talk('mil', t), mood: 'happy', blink: 1, turn: -0.4, look: -0.9, armL: reach(gr, -1, -gr.sw * 1.6, gr.ySh + 40 + Math.sin(t * 6) * 20, { planar: true }), armR: reach(gr, 1, gr.sw * 1.3, gr.ySh + 120), items: { R: printerItem(0.4 + 0.6 * Math.abs(Math.sin(t * 5)), 'LABEL') }, afterTorso: apron(gr) }, GRX, 0);
  // labels still raining from Rose's printer
  if (u > 0 && u < 1.5) for (let k = 0; k < 6; k++) { const a = clamp((u - k * 0.12) / 0.6); if (a <= 0 || a >= 1) continue; label(c, GRX - 120 - a * (200 + k * 90), -1100 - Math.sin(a * Math.PI) * 300 + a * 600, 'LABEL', 0.8, a * 6, 1); }
  K.mark(c, 'tom', TX, -900, 200);
  return heads; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'mil'], card: ['her', 'mil'], two: ['her', 'mil'], her: ['her'], mil: ['mil'], cover: ['her', 'mil'], obj: [] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const heads = {};
  if (tag === 'garage' || tag === 'son') { const h = garage(c, t, tag); if (!h.mil) h.mil = OFF; h.her = OFFL; return h; }
  const who = DRAW[tag] || DRAW.wide;
  c.drawImage(BGK, BX0, BY0, BW, BH);
  cupboards(c, t, L);
  if (who.includes('mil') && !roseGone(t, L)) { const rs = roseState(t, L), x = roseX(t, L); if (L === 'C2' && t > ev('C2', 'march') + 0.7) { /* Rose passes behind her on the way to the door */ heads.mil = K.put(c, ROSE, rs, x, 0); } else heads.mil = K.put(c, ROSE, rs, x, 0); }
  if (who.includes('her')) { const hs = herState(t, L); heads.her = K.put(c, HER, hs, herX(t, L), hs.y || 0); }
  if (L === 'B2' && t > ev('B2', 'salt') && t < ev('B2', 'salt') + 1.25) { c.fillStyle = '#FFFFFF'; for (let k = 0; k < 40; k++) { const ph = (t * 3 + k * 0.137) % 1; c.globalAlpha = 0.9; c.fillRect(POTX - 30 + Math.sin(k * 7.1) * 22, CT - 560 + ph * 330, 6, 6); } c.globalAlpha = 1; }
  if (!heads.mil) heads.mil = OFF; if (!heads.her) heads.her = OFFL; heads.son = OFF;
  return heads; }
// full-screen close-up insert on a solid backdrop: the empty drawer with the label inside (hook)
function insert(c, t, view) { c.fillStyle = '#E9F1EE'; c.fillRect(0, 0, W, HH);
  if (view === 'drawer') { const k = eOut(clamp((t - hev('drawer')) / 0.3)), dy = lerp(-120, 0, k);
    c.save(); c.translate(540, 980 + dy);
    // cabinet face above, drawer box pulled out towards the camera
    c.fillStyle = '#9CC3BA'; c.fillRect(-540, -720, 1080, 260); c.fillStyle = '#7FA8A0'; c.fillRect(-540, -470, 1080, 40);
    paint(c, q => { q.m(-470, -430); q.l(470, -430); q.l(500, 280); q.l(-500, 280); q.z(); }, '#C9A27A', { sd: 10, hd: 4, lw: 6 });
    paint(c, q => { q.m(-420, -390); q.l(420, -390); q.l(440, 220); q.l(-440, 220); q.z(); }, '#E8D3B0', { sd: 6, hd: 3, lw: 4 });
    c.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < 6; k++) c.fillRect(-420 + k * 150, -390, 6, 610);
    // the label inside the empty drawer
    c.save(); c.rotate(-0.04); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -380 + 8, -250 + 10, 760, 330, 18); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -380, -250, 760, 330, 18); c.fill(); c.strokeStyle = '#C9C3B6'; c.lineWidth = 4; c.stroke();
    fitTxt(c, 'SPOONS →', 0, -170, 84, '#2B2F3A', 700); fitTxt(c, 'LEFT CUPBOARD', 0, -70, 74, '#2B2F3A', 700); fitTxt(c, '(BETTER!)', 0, 30, 70, '#E0474C', 700); c.restore();
    // drawer front + handle
    paint(c, q => { q.m(-520, 280); q.l(520, 280); q.l(520, 560); q.l(-520, 560); q.z(); }, '#9CC3BA', { sd: 10, hd: 4, lw: 6 }); c.fillStyle = '#C9A13A'; rr(c, -120, 380, 240, 40, 20); c.fill();
    label(c, 0, 490, 'SPOONS', 1.6, 0.02);
    c.restore(); }
}

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY, mHY = G.mil.headY, tHY = G.son.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(50, fy((hHY + mHY) / 2, 0.62, 805), 0.62, 'cover'), WIDE: S(300, -1000, 0.5, 'wide'), CARD: S(-45, fy(mHY, 0.66, 1010), 0.66, 'card'), TWO: S(-45, fy(mHY, 0.72, 880), 0.72, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_H: S(HX + 40, fy(hHY, 1.25, 1150), 1.25, 'her'), ROSE: S(RX - 20, fy(mHY, 1.0), 1.0, 'mil'), ROSE_CU: S(RX + 10, fy(mHY, 1.45, 900), 1.45, 'mil'),
  LABELS: S(520, -1560, 1.0, 'obj'), REACH: S(-120, -1350, 0.8, 'her'), CAB_CU: S(NEXTV[0], NEXTV[1] - 60, 1.35, 'obj'), POT: S(580, fy(mHY, 0.92, 960), 0.92, 'mil'),
  GARAGE: S(GX + 120, fy(tHY, 0.62, 1000), 0.62, 'garage'), GARAGE_CARD: S(GX + 120, fy(tHY, 0.6, 1130), 0.6, 'garage'), TOM: S(TX, fy(tHY, 1.0, 1000), 1.0, 'son'),
  DRAWER: U('drawer', 1) };
const C2Z = [1.0, 1.15, 1.3, 1.45].map(z => S(HX + 40, fy(hHY, z, 940), z, 'her'));
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('cu')) return SH.COVER; if (t < hev('drawer')) return f(SH.ROSE_CU); if (t < hev('cover')) return f(SH.DRAWER);
    const h = t - hev('cover'); if (h < 2.2) return f(SH.COVER); if (h < 3.6) return f(SH.HER_H); if (h < 5.6) return f(SH.COVER); return f(SH.LABELS); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('garage') - 0.03) return f(t >= nar.t - 0.1 ? SH.GARAGE_CARD : SH.GARAGE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('reach') - 0.05) return f(SH.REACH);
  if (L === 'A1' && t > e('push') - 0.05) return f(SH.WIDE);
  if (L === 'A2' && t > e('print') - 0.05) return f(SH.LABELS);
  if (L === 'B1' && t > e('stick') - 0.05) return f(SH.CAB_CU);
  if (L === 'B2' && t > e('salt') - 0.05) return f(SH.POT);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f(C2Z[i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('march') - 0.05) return f(SH.ROSE_CU);
    if (t >= e('march') - 0.05) return f(SH.WIDE); }
  const cur = TL.speech.filter(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25).pop();   // the latest line wins (no reaction shot while the next speaker already talks)
  const single = who => who === 'her' ? SH.HER : SH.ROSE;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays: title ribbon (big pink line), cover badge, label counter
function title(c, t) { const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.translate(540, 470); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore(); }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1745); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -280 + 6, -60 + 10, 560, 120, 60); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -280, -60, 560, 120, 60); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -280, -60, 560, 120, 60); c.stroke();
  fitTxt(c, 'SURPRISE!', 0, 4, 60, '#E0474C', 500); c.restore(); }
function labIcon(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.12); c.fillStyle = '#FFFFFF'; c.strokeStyle = C.oliveD; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-18, -12); c.lineTo(12, -12); c.lineTo(22, 0); c.lineTo(12, 12); c.lineTo(-18, 12); c.closePath(); c.fill(); c.stroke(); c.fillStyle = C.oliveD; c.beginPath(); c.arc(8, 0, 3.5, 0, TAU); c.fill(); c.fillRect(-12, -3, 12, 3); c.restore(); }
// counter value + time of the last change
const STEPS = () => { const s = []; for (let i = 0; i < 5; i++) s.push([ev('A2', 'print') + 0.55 + 0.12 * i, 48 + i]); s.push([ev('B1', 'stick') + 0.75, 53]); s.push([ev('B2', 'soupl') + 0.45, 54]); return s; };
const STP = STEPS();
function countAt(t) { let n = 47, ch = -1; for (const [a, v] of STP) if (t >= a) { n = v; ch = a; }
  const g = ev('C2', 'garage'); if (t >= g + 0.3) { const k = clamp((t - g - 0.3) / 0.7); ch = g + 0.3; return { s: k >= 1 ? '999+' : String(Math.round(lerp(54, 999, eIn(k)))), ch, big: true }; }
  return { s: String(n), ch, big: false }; }
const bubbleOn = t => TL.speech.some(s => s.who !== 'nar' && s.who !== 'tip' && t > s.t - 0.15 && t < s.t + s.d + 0.4);
const narOn = t => TL.speech.some(s => (s.who === 'nar' || s.who === 'tip') && t > s.t - 0.2 && t < s.t + s.d + 0.3);
function counter(c, t, sc) { return; /* owner: no corner counter/icons in the video */ const L = sc.id; if (L === 'outro') return; const nar = SP[L.toLowerCase() + '_nar'], u = t - sc.s;
  if (L !== 'hook' && (u < 1.2 || (nar && t > nar.t - 0.2))) return; if (L === 'hook' && (CUR_TAG !== 'cover' || narOn(t))) return; if (narOn(t)) return;
  const { s, ch, big } = countAt(t);
  const since = t - ch, bump = since > 0 && since < 0.4 ? 1 + 0.3 * Math.sin(since / 0.4 * Math.PI) : 1, showLab = since > 0.1 && since < 2.1 && L !== 'hook' && !bubbleOn(t);
  const k = (L === 'hook' ? 1 : eBack(P(u, 1.2, 1.5), 1.6)) * bump; const w = showLab ? 300 : (big ? 270 : 190), h = showLab ? 128 : 84;
  c.save(); c.translate(70, 1530); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, 6, 8, w, h, 22); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, 0, 0, w, h, 22); c.fill(); c.stroke();
  const iy = showLab ? 88 : 42; labIcon(c, 46, iy, 1.25); UI.font(c, 'Unb9', 48); c.fillStyle = big ? '#C23C4A' : C.oliveD; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(s, 84, iy + 2);
  if (showLab) { UI.textFit(c, 'Unb9', 32, 'ЯРЛЫКИ', w - 40); c.fillStyle = C.pink; c.fillText('ЯРЛЫКИ', 22, 34); }
  c.restore(); }
let CUR_TAG = 'wide';
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No! My kitchen! Back!'], ['A2', 'Where did you put my spoons?'], ['B2', 'Too many cooks spoil the broth.'], ['C1', 'Can we decide together next time?']];
    K.outro(c, t, { q: ['А СВЕКРОВЬ ПЕРЕСТАВЛЯЛА', 'ЧТО-ТО У ТЕБЯ?'], rows, cta: ['ОТПРАВЬ ПОДРУГЕ', 'СО СВЕКРОВЬЮ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gd = G.mil; K.put(cc, ROSE, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: chest(gd, 1, 0.7), items: { R: printerItem(0.5, 'LABEL') }, afterTorso: apron(gd) }, 640, 60);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {}, afterTorso: bag }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide'; CUR_TAG = tag;
  let heads, proj;
  if (tag.startsWith('ui:')) { insert(c, t, tag.slice(3)); heads = {}; proj = p => ({ x: -1e5, y: 0 }); Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { mil: ['ROSE', '#B03A6A'], son: ['TOM', '#3B4A5C'] };
  if (L === 'hook') { const cover = tag === 'cover'; if (cover) { title(c, t); if (t < SP.hook_r.t) coverBadge(c, t); }
    if (!tag.startsWith('ui:')) { const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
      K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_r: 0.05 } }); }
    if (cover && t < SP.hook_r.t) counter(c, t, sc); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, heroine: 'her', hold: { a1_r: 0.02, a2_r: 0.02, b1_r: 0.02, b2_r: 0.02, c1_r: 0.3, c2_h: 0.05, c2_t: 0.3 } });
  counter(c, t, sc);
  K.hud(c, t, sc);
}
E.run('kitchen', NF, renderFrame);
