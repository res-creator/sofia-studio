// "A stranger teaches her to lift" episode renderer (hard_cut camera): node gymcoach.js start end out.mp4 | --png=f1,f2
// Gym: mirrored back wall, dumbbell rack, rubber floor. Her (her_gym + towel over a hidden HEAD COACH badge) behind the barbell
// on a squat rack (weight sign on the right upright); Mike (BEAST MODE) on the right with a POINTER STICK (never a raised finger).
// Weight counter (barbell icon + KG) bottom-left: 60 KG on the cover -> A1 Mike adds one plate, the bar wobbles -> 80 KG.
// B1 whiteboard with diagrams, B2 battle ropes, C1 open palms + steps away, C2 Mike returns with Chloe (STAFF tee, whistle);
// towel off -> HEAD COACH badge, whistle, burpees; she corrects his elbow with the pointer. No black card.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/gymcoach/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const ORDER = ['hook', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'outro'], idx = L => ORDER.indexOf(L);

// ---------------- cast
const HER = BASE.her_gym, MIKE = BASE.mike;
const G0 = geom(BASE.chloe);
const CHLOE = { ...BASE.chloe, top: { type: 'tee', col: '#2E9E8A', text: 'STAFF', textSize: 40, textCol: '#FFFFFF', textY: G0.ySh + 95 }, whistle: '#E0474C' };
const G = { her: geom(HER), lifter: geom(MIKE), coach: geom(CHLOE) };
const HX = -380, MX = 420, CX = 860;
const BARY = G.her.ySh + 270, RACK = 330;      // bar height on the J-hooks, rack uprights at HX +- RACK
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// pointer stick (hand-local, absolute angle in the character's frame): wooden stick with a red tip
const pointer = (ang, len = 430) => ctx => { ctx.save(); ctx.rotate(ang); ctx.lineCap = 'round';
  ctx.strokeStyle = '#3E2A1A'; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(len, 0); ctx.stroke();
  ctx.strokeStyle = '#B9874F'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(len, 0); ctx.stroke();
  ctx.fillStyle = '#E0474C'; ctx.beginPath(); ctx.arc(len, 0, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3E2A1A'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); };
function plateDraw(c, x, y, s = 1, lbl = '20') { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => { q.m(-26, -190); q.l(26, -190); q.q(34, -190, 34, -180); q.l(34, 180); q.q(34, 190, 26, 190); q.l(-26, 190); q.q(-34, 190, -34, 180); q.l(-34, -180); q.q(-34, -190, -26, -190); q.z(); }, '#2B2F3A', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#E0474C'; c.fillRect(-34, -60, 68, 120); c.save(); c.rotate(-Math.PI / 2); fitTxt(c, lbl, 0, 0, 52, '#FFFFFF', 110); c.restore(); c.restore(); }
const towelItem = ctx => { ctx.save(); ctx.rotate(-0.5); paint(ctx, q => { q.m(-20, 0); q.q(60, -120, 30, -260); q.l(110, -250); q.q(150, -110, 70, 20); q.z(); }, '#FFFFFF', { sd: 6, hd: 3, lw: 4 }); ctx.fillStyle = '#EE5E9A'; ctx.fillRect(40, -230, 70, 14); ctx.restore(); };
function whistleDraw(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#C9CFD8'; rr(c, -30, -14, 50, 28, 8); c.fill(); c.beginPath(); c.arc(16, 4, 20, 0, TAU); c.fill(); c.strokeStyle = '#596070'; c.lineWidth = 3; c.stroke(); c.fillStyle = '#596070'; c.beginPath(); c.arc(16, 4, 7, 0, TAU); c.fill(); c.restore(); }
// weight: 60 KG (bar 20 + 2 x 20), A1 Mike adds one more plate on his side -> 80 KG
const plateT = () => ev('A1', 'plate');
const heavy = (t, L) => idx(L) > idx('A1') || (L === 'A1' && t > plateT() + 0.35);
const kg = (t, L) => heavy(t, L) ? 80 : 60;
function barAng(t, L) { if (idx(L) < idx('A1')) return 0; const u = t - plateT() - 0.35; if (L === 'A1' && u < 0) return 0; const d = L === 'A1' ? u : 3; return 0.035 + 0.07 * Math.sin(d * 13) * Math.exp(-d * 1.6); }
const barY = (t, L, dx) => BARY + dx * Math.sin(barAng(t, L));
function rackBack(c) { for (const s of [-1, 1]) { const x = HX + s * RACK; paint(c, q => { q.m(x - 22, -1700); q.l(x + 22, -1700); q.l(x + 22, 0); q.l(x - 22, 0); q.z(); }, '#4A5160', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#2B2F3A'; for (let k = 0; k < 12; k++) { c.beginPath(); c.arc(x, -1600 + k * 120, 6, 0, TAU); c.fill(); } }
  paint(c, q => { q.m(HX - RACK - 30, -1730); q.l(HX + RACK + 30, -1730); q.l(HX + RACK + 30, -1690); q.l(HX - RACK - 30, -1690); q.z(); }, '#4A5160', { sd: 6, hd: 3, lw: 4 });
  for (const s of [-1, 1]) { c.fillStyle = '#2B2F3A'; rr(c, HX + s * RACK - 70, -20, 140, 26, 8); c.fill(); } }
function barbell(c, t, L) { const a = barAng(t, L);
  for (const s of [-1, 1]) { c.fillStyle = '#E0474C'; rr(c, HX + s * RACK - 12, BARY - 6, 30, 46, 6); c.fill(); }   // J-hooks
  c.save(); c.translate(HX, BARY); c.rotate(a);
  c.strokeStyle = '#596070'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(-560, 0); c.lineTo(560, 0); c.stroke(); c.strokeStyle = '#C9CFD8'; c.lineWidth = 12; c.beginPath(); c.moveTo(-560, -2); c.lineTo(560, -2); c.stroke();
  for (const s of [-1, 1]) { c.fillStyle = '#8C93A0'; c.fillRect(s > 0 ? 380 : -400, -18, 20, 36); }
  plateDraw(c, -425, 0); plateDraw(c, 425, 0);
  const pk = plateIn(t, L); if (pk > 0) plateDraw(c, lerp(900, 495, pk), 0);
  c.restore(); }
function plateIn(t, L) { if (idx(L) > idx('A1')) return 1; if (L !== 'A1') return 0; return eOut(clamp((t - plateT()) / 0.35)); }
function weightSign(c, t, L) { const x = HX + RACK + 30, y = -1210, n = kg(t, L), ch = L === 'A1' ? t - plateT() - 0.35 : -1, k = ch > 0 && ch < 0.35 ? 1 + 0.25 * Math.sin(ch / 0.35 * Math.PI) : 1;
  c.save(); c.translate(x + 120, y + 60); c.scale(k, k); c.rotate(0.03 * Math.sin(t * 2));
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -120 + 6, -60 + 8, 240, 120, 14); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -120, -60, 240, 120, 14); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.stroke();
  fitTxt(c, `${n} KG`, 0, 4, 76, n > 60 ? '#E0474C' : '#2B2F3A', 210); c.restore();
  c.strokeStyle = '#8C93A0'; c.lineWidth = 5; c.beginPath(); c.moveTo(HX + RACK, y - 20); c.lineTo(x + 120, y); c.stroke(); }

// B1 whiteboard on wheels, B2 battle ropes
const boardX = t => lerp(1500, 930, eOut(clamp((t - ev('B1', 'board')) / 0.55)));
function whiteboard(c, t) { const x = boardX(t), w = 560, y0 = -1780, y1 = -720;
  c.fillStyle = '#8C93A0'; c.fillRect(x - w / 2 + 30, y1, 18, 640); c.fillRect(x + w / 2 - 48, y1, 18, 640); c.fillRect(x - w / 2 + 30, -120, w - 60, 16);
  for (const s of [-1, 1]) { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x + s * (w / 2 - 40), -30, 30, 0, TAU); c.fill(); }
  paint(c, q => { q.m(x - w / 2, y0); q.l(x + w / 2, y0); q.l(x + w / 2, y1); q.l(x - w / 2, y1); q.z(); }, '#C9CFD8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#FFFFFF'; c.fillRect(x - w / 2 + 20, y0 + 20, w - 40, y1 - y0 - 40);
  fitTxt(c, 'FORM', x, y0 + 90, 90, '#1F5FBF', 400);
  // stick figure squatting with a bar + arrows
  c.save(); c.translate(x - 110, y0 + 520); c.strokeStyle = '#1F2A44'; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.arc(0, -250, 34, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(0, -216); c.lineTo(-20, -90); c.lineTo(50, -40); c.lineTo(10, 60); c.moveTo(-20, -90); c.lineTo(-60, -40); c.lineTo(-40, 60); c.stroke();
  c.beginPath(); c.moveTo(-110, -200); c.lineTo(110, -200); c.stroke(); c.beginPath(); c.moveTo(-6, -190); c.lineTo(60, -150); c.lineTo(80, -200); c.stroke(); c.restore();
  c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.lineCap = 'round';
  const arrow = (x0, y0_, x1, y1_) => { c.beginPath(); c.moveTo(x0, y0_); c.lineTo(x1, y1_); const a = Math.atan2(y1_ - y0_, x1 - x0); c.lineTo(x1 - 30 * Math.cos(a - 0.5), y1_ - 30 * Math.sin(a - 0.5)); c.moveTo(x1, y1_); c.lineTo(x1 - 30 * Math.cos(a + 0.5), y1_ - 30 * Math.sin(a + 0.5)); c.stroke(); };
  arrow(x + 150, y0 + 330, x - 20, y0 + 360); fitTxt(c, 'ELBOWS', x + 160, y0 + 290, 46, '#E0474C', 220);
  arrow(x + 150, y0 + 560, x - 40, y0 + 540); fitTxt(c, 'KNEES', x + 170, y0 + 610, 46, '#E0474C', 220);
  fitTxt(c, 'BACK STRAIGHT!', x, y0 + 760, 44, '#1F5FBF', 480); fitTxt(c, '1  2  3  GO!', x, y0 + 900, 40, '#2E9E4A', 400); }
function ropes(c, t, hands) { const wv = t > ev('B2', 'wave') ? 1 : 0.15, ax = 1500;
  for (const [i, hd] of hands.entries()) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 46; c.lineCap = 'round'; c.beginPath();
    for (let k = 0; k <= 40; k++) { const u = k / 40, x = lerp(hd.x, ax, u), base = lerp(hd.y, -40 - i * 30, Math.min(1, u * 2.2)), amp = (1 - u) * (u < 0.1 ? u * 10 : 1) * 90 * wv; const y = base + Math.sin(u * 16 - t * 18 + i) * amp; if (k) c.lineTo(x, y); else c.moveTo(x, y); }
    c.stroke(); c.strokeStyle = '#596070'; c.lineWidth = 12; c.setLineDash([18, 22]); c.stroke(); c.setLineDash([]); } }

// ---------------- the gym (prerendered, softly blurred)
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawGym(c) {
  c.fillStyle = '#DCE1E8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#2B2F3A'; rr(c, -1100, -2900, 2200, 260, 24); c.fill(); fitTxt(c, 'IRON CLUB', 0, -2770, 170, '#F2C14E', 2000);
  // mirror wall
  c.fillStyle = '#596070'; c.fillRect(BX0, -2420, BW, 1960);
  for (let x = BX0 + 20; x < BX0 + BW; x += 620) { const g = c.createLinearGradient(x, -2400, x + 600, -500); g.addColorStop(0, '#C9D6E2'); g.addColorStop(0.5, '#AFC0D0'); g.addColorStop(1, '#C3D1DE'); c.fillStyle = g; c.fillRect(x, -2400, 600, 1920);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x + 120, -2400); c.lineTo(x + 260, -2400); c.lineTo(x + 60, -480); c.lineTo(x, -480); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(x + 330, -2400); c.lineTo(x + 380, -2400); c.lineTo(x + 230, -480); c.lineTo(x + 180, -480); c.closePath(); c.fill(); }
  // dumbbell rack along the wall
  c.fillStyle = '#2B2F3A'; c.fillRect(BX0, -520, BW, 40); c.fillRect(BX0, -330, BW, 40);
  const cols = ['#E0474C', '#2B2F3A', '#1F5FBF', '#2B2F3A', '#F2C14E'];
  for (let x = BX0 + 60, k = 0; x < BX0 + BW; x += 150, k++) for (const y of [-540, -350]) { c.fillStyle = cols[k % 5]; rr(c, x, y - 60, 34, 60, 8); c.fill(); rr(c, x + 86, y - 60, 34, 60, 8); c.fill(); c.fillStyle = '#8C93A0'; c.fillRect(x + 30, y - 38, 60, 16); }
  // rubber floor
  c.fillStyle = '#3A3F4B'; c.fillRect(BX0, -290, BW, 1800); c.fillStyle = 'rgba(255,255,255,.07)';
  for (let k = 0; k < 900; k++) { const x = BX0 + (k * 397) % BW, y = -280 + (k * 211) % 1700; c.fillRect(x, y, 6, 6); }
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 500) { c.beginPath(); c.moveTo(x, -290); c.lineTo(x - 200, 1500); c.stroke(); }
  // kettlebells on the floor far right / far left
  for (const [x, col] of [[1300, '#E0474C'], [1450, '#F2C14E'], [-1500, '#1F5FBF']]) { c.fillStyle = col; c.beginPath(); c.arc(x, -330, 70, 0, TAU); c.fill(); c.strokeStyle = col; c.lineWidth = 22; c.beginPath(); c.arc(x, -400, 45, Math.PI, TAU); c.stroke(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawGym);

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const towelOn = (t, L) => !(L === 'C2' && t > ev('C2', 'towel')) && L !== 'outro';
const badgeOn = (t, L) => (L === 'C2' && t > ev('C2', 'towel')) || L === 'outro';
// towel around her neck (two hanging ends) over the chest; under it the HEAD COACH badge + a whistle on a cord
function herTorso(t, L) { return (cc, a) => { const g = G.her, y0 = g.ySh, sw = g.sw;
  if (badgeOn(t, L)) { cc.strokeStyle = '#1F5FBF'; cc.lineWidth = 6; cc.beginPath(); cc.moveTo(-g.hw * 0.45, y0 - 10); cc.lineTo(-40, y0 + 110); cc.moveTo(g.hw * 0.45, y0 - 10); cc.lineTo(40, y0 + 110); cc.stroke();
    cc.save(); cc.translate(0, y0 + 180); cc.rotate(-0.03); cc.fillStyle = 'rgba(0,0,0,.2)'; rr(cc, -95 + 5, -70 + 7, 190, 140, 14); cc.fill(); cc.fillStyle = '#FFE15A'; rr(cc, -95, -70, 190, 140, 14); cc.fill(); cc.strokeStyle = '#1F2A44'; cc.lineWidth = 5; cc.stroke();
    cc.fillStyle = '#1F5FBF'; rr(cc, -95, -70, 190, 34, 14); cc.fill(); cc.fillRect(-95, -50, 190, 14); fitTxt(cc, 'IRON CLUB', 0, -53, 20, '#FFFFFF', 170);
    fitTxt(cc, 'HEAD', 0, -6, 40, '#1F2A44', 170); fitTxt(cc, 'COACH', 0, 40, 44, '#E0474C', 176); cc.restore();
    if (!(L === 'C2' && t > ev('C2', 'whistle') - 0.1 && t < ev('C2', 'whistle') + 0.7)) { cc.strokeStyle = '#E0474C'; cc.lineWidth = 4; cc.beginPath(); cc.moveTo(g.hw * 0.4, y0 - 6); cc.quadraticCurveTo(sw * 0.75, y0 + 120, sw * 0.62, y0 + 260); cc.stroke(); whistleDraw(cc, sw * 0.62, y0 + 270, 0.9); } }
  if (towelOn(t, L)) { cc.fillStyle = '#FFFFFF'; cc.strokeStyle = '#C9CFD8'; cc.lineWidth = 4;
    paint(cc, q => { q.m(-g.hw * 0.95, y0 - 30); q.q(0, y0 + 10, g.hw * 0.95, y0 - 30); q.l(g.hw * 1.1, y0 + 20); q.q(0, y0 + 70, -g.hw * 1.1, y0 + 20); q.z(); }, '#FFFFFF', { sd: 6, hd: 3, lw: 4 });
    for (const s of [-1, 1]) { paint(cc, q => { q.m(s * 10, y0 + 10); q.l(s * 115, y0 + 10); q.l(s * 108, y0 + 300); q.l(s * 4, y0 + 300); q.z(); }, '#FFFFFF', { sd: 8, hd: 4, lw: 4 }); cc.fillStyle = '#EE5E9A'; cc.fillRect(Math.min(s * 8, s * 110), y0 + 250, 102, 16); cc.fillRect(Math.min(s * 8, s * 110), y0 + 274, 102, 8); } } }; }
function onBar(st, g, t, L, x = HX) { for (const s of [-1, 1]) { const dx = s * g.sw * 1.3; st[s < 0 ? 'armL' : 'armR'] = reach(g, s, dx, barY(t, L, dx) - 4, { fist: true }); } }
function herX(t, L) { return HX; }
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, items: {}, afterTorso: herTorso(t, L) };
  onBar(st, g, t, L);
  if (L === 'hook') { st.mood = t > hev('brow') - 0.05 ? 'skeptical' : 'annoyed'; st.lookY = t > hev('brow') ? -0.1 : 0; if (t > hev('brow')) st.browUp = 0.3; }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'angry'; gest(st, g, 'her', t, -1, 150); } if (t > e('plate') + 0.3) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.35; st.look = 0.9; } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.3)) gest(st, g, 'her', t, -1, 150); if (t > e('roll') - 0.05) { st.mood = 'bored'; st.lookY = -0.85; st.look = 0.2; st.blink = 0; } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 150); } if (t > e('board')) { st.mood = 'skeptical'; st.browUp = 0.3; } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 150); } if (t > e('ropes')) { st.mood = 'surprised'; st.blink = 0; } if (t > e('wave') + 0.4) { st.mood = 'shock'; } }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_h', t, 0.05, 0.3)) gest(st, g, 'her', t, -1, 150); if (t > e('step')) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'C2') { st.mood = 'neutral';
    if (t > e('come')) { st.mood = 'skeptical'; }
    if (t > e('stare')) { st.mood = 'smug'; }
    const tw = e('towel'), wh = e('whistle');
    if (t > tw - 0.25) { st.armL = hang(g, -1); st.armR = hang(g, 1); }   // hands off the bar from the towel reveal on
    if (t > tw - 0.25 && t < tw + 0.45) { const u = clamp((t - tw + 0.25) / 0.7); st.armR = reach(g, 1, lerp(g.sw * 0.5, g.sw * 1.8, u), lerp(g.ySh + 60, g.ySh - 260, u), { planar: true, fist: true }); st.items.R = towelItem; }
    if (t > wh - 0.1 && t < wh + 0.7) { st.headFirst = true; st.armR = reach(g, 1, g.hw * 0.3, g.headY + g.hh * 0.75, { fist: true }); st.items.R = ctx => whistleDraw(ctx, -10, -26, 1.0); st.mood = 'angry'; st.talk = 0; }
    if (t > wh + 0.7) { st.mood = 'angry'; st.armR = open(g, 1, 1.7, 40); st.armR.fist = true; st.items.R = pointer(-0.2, 380); }
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'angry'; }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'smug'; st.turn = 0.45; st.look = 0.9; const el = mikeElbow(t), dx = el.x - HX, dy = el.y, sh = g.shR, d = Math.hypot(dx - sh.x, dy - sh.y), ux = (dx - sh.x) / d, uy = (dy - sh.y) / d, arm = (g.h * 0.345) * 0.82;
      const poke = t > e('poke') && t < e('poke') + 0.5 ? Math.sin((t - e('poke')) / 0.5 * Math.PI) * 30 : 0;
      st.armR = reach(g, 1, sh.x + ux * arm, sh.y + uy * arm, { planar: true, fist: true }); st.items.R = pointer(Math.atan2(uy, ux), Math.max(60, d - arm - 20 + poke)); } }
  return st; }
// Mike
function mikeX(t, L) { if (L === 'C1') { const u = clamp((t - ev('C1', 'step')) / 1.0); return lerp(MX, 1500, eIn(u)); }
  if (L === 'C2') { const u = clamp((t - ev('C2', 'come')) / 1.0); return lerp(1600, MX, eOut(u)); } return MX; }
function burpee(t) { const b0 = ev('C2', 'burpee'); if (t < b0) return null; const ph = ((t - b0) / 0.8) % 1, d = ph < 0.5 ? eIO(ph / 0.5) : 1 - eIO((ph - 0.5) / 0.5); return { drop: d * 420, jump: ph > 0.78 ? -Math.sin((ph - 0.78) / 0.22 * Math.PI) * 60 : 0, d }; }
function mikeElbow(t) { const b = burpee(t) || { drop: 0, jump: 0 }, g = geom(MIKE, b.drop), A = mikeBurpeeArm(g, -1, b), ua = g.h * 0.18 * (A.ul ?? 1); return { x: mikeX(t, 'C2') + g.shL.x + Math.sin(A.a) * ua * -1, y: b.jump + g.shL.y + Math.cos(A.a) * ua }; }
const mikeBurpeeArm = (g, s, b) => b.d > 0.5 ? reach(g, s, s * g.sw * 0.7, g.ySh + 260, { fist: true }) : reach(g, s, s * g.sw * 1.25, g.ySh - 300 + b.d * 300, { planar: true });
function mikeState(t, L) { const g = G.lifter, e = k => ev(L, k), st = { t, talk: talk('lifter', t), mood: 'smug', turn: -0.35, look: -0.8, armR: hang(g, 1), items: {} };
  const holdP = (ang = Math.PI + 0.35) => { st.armL = reach(g, -1, -g.sw * 1.45, g.ySh + 170, { fist: true }); st.items.L = pointer(ang + (st.talk > 0.05 ? Math.sin(t * 9) * 0.12 : 0)); };
  holdP();
  if (L === 'hook') { st.mood = 'smug'; st.lean = -0.35; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 120, { planar: true, fist: true }); st.items.L = pointer(Math.PI + 1.0 + (st.talk > 0.05 ? Math.sin(t * 9) * 0.1 : 0)); }
  if (L === 'A1') { if (speaking('a1_m', t, 0.05, 0.2)) st.mood = 'smug';
    const p = e('plate'); if (t > p - 0.35 && t < p + 0.5) { st.items = { R: pointer(Math.PI / 2 - 0.2, 300) }; st.armR = hang(g, 1); st.armL = reach(g, -1, HX + 470 - MX, BARY - 30, { fist: true }); st.mood = 'happy'; }
    if (t > p + 0.5) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'A2') { if (speaking('a2_m', t, 0.05, 0.2)) { st.mood = 'shock'; st.blink = 0; } if (t > e('roll')) st.mood = 'smug'; }
  if (L === 'B1') { if (speaking('b1_m', t, 0.05, 0.2)) st.mood = 'happy';
    if (t > e('board') - 0.05) { st.turn = 0.3; st.look = 0.6; st.mood = 'happy'; st.armL = hang(g, -1); const tap = t > e('tap') ? Math.abs(Math.sin((t - e('tap')) * 9)) * 40 : 0; st.armR = reach(g, 1, g.sw * 1.5, g.ySh + 40 - tap, { planar: true, fist: true }); st.items = { R: pointer(-0.35, 360) }; } }
  if (L === 'B2') { if (t > e('ropes') - 0.05) { st.mood = 'happy'; st.items = {}; const w = t > e('wave') ? Math.sin((t - e('wave')) * 18) * 70 : 0; st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 330 + w, { fist: true }); st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 330 - w, { fist: true }); if (t > e('wave')) st.laugh = true; } }
  if (L === 'C1') { if (t > e('hands') - 0.05) { st.mood = 'happy'; st.items = {}; st.armL = open(g, -1, 1.7, -20); st.armR = open(g, 1, 1.7, -20); }
    if (t > e('step')) { st.turn = 0.5; st.look = 0.8; st.legPose = t < e('step') + 1.0 ? 'walk' : 'stand'; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'C2') { st.mood = 'angry';
    if (t < e('come') + 1.0) { st.legPose = 'walk'; st.turn = -0.5; }
    if (speaking('c2_m', t, 0.05, 0.2)) { st.mood = 'angry'; }
    if (t > e('stare') - 0.05) { st.mood = 'shock'; st.blink = 0; st.items = {}; st.armL = hang(g, -1); st.turn = -0.2; }
    if (t > e('whistle')) { st.mood = 'worried'; }
    const b = burpee(t); if (b) { const gg = geom(MIKE, b.drop); st.drop = b.drop; st.legPose = b.d > 0.15 ? 'squat' : 'stand'; st.mood = 'tired'; st.turn = -0.1; st.look = -0.3; st.armL = mikeBurpeeArm(gg, -1, b); st.armR = mikeBurpeeArm(gg, 1, b); st.items = {}; } }
  return st; }
// Chloe (C2 only)
function chloeX(t) { const u = clamp((t - ev('C2', 'come')) / 1.0); return lerp(1950, CX, eOut(u)); }
function chloeState(t) { const g = G.coach, e = k => ev('C2', k), st = { t, talk: talk('coach', t), mood: 'bored', turn: -0.4, look: -0.8, armL: chest(g, -1, 0.35), armR: chest(g, 1, 0.35), items: {},
  afterTorso: cc => whistleDraw(cc, G.coach.sw * 0.55, G.coach.ySh + 150, 0.8) };
  if (t < e('come') + 1.0) { st.legPose = 'walk'; st.mood = 'neutral'; st.armL = hang(g, -1); st.armR = hang(g, 1); }
  if (speaking('c2_c', t, 0.05, 0.2)) { st.mood = 'bored'; st.armL = open(g, -1, 1.8, 60); }
  if (t > e('towel')) { st.mood = 'smug'; }
  if (t > e('burpee')) { st.mood = 'happy'; st.laugh = true; }
  return st; }
const hang2 = hang;

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'lifter', 'coach'], card: ['her', 'lifter', 'coach'], cover: ['her', 'lifter'], her: ['her'], lifter: ['lifter'], coach: ['coach'], bar: [], board: ['lifter'], burp: ['her', 'lifter'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  rackBack(c);
  if (L === 'B1' && t > ev('B1', 'board') - 0.1) whiteboard(c, t);
  const late = L === 'C2' && t > ev('C2', 'burpee') - 0.05; if (late) { barbell(c, t, L); weightSign(c, t, L); }   // burpees: both step in front of the rack
  if (L === 'C2' && who.includes('coach')) heads.coach = K.put(c, CHLOE, chloeState(t), chloeX(t), 0);
  if (who.includes('lifter') && L !== 'outro') { const mx = mikeX(t, L), b = L === 'C2' ? burpee(t) : null; heads.lifter = K.put(c, MIKE, mikeState(t, L), mx, b ? b.jump : 0);
    if (L === 'B2' && t > ev('B2', 'ropes') - 0.05) { const g = G.lifter, st = mikeState(t, L); const hp = s => { const A = s < 0 ? st.armL : st.armR, sh = s < 0 ? g.shL : g.shR, ua = g.h * 0.18, fa = g.h * 0.165 * (A.fl ?? 1), a1 = A.a, a2 = A.a - A.b; return { x: mx + sh.x + (Math.sin(a1) * ua + Math.sin(a2) * fa) * s, y: sh.y + Math.cos(a1) * ua + Math.cos(a2) * fa }; }; ropes(c, t, [hp(-1), hp(1)]); } }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), herX(t, L), 0);
  if (!late) { barbell(c, t, L); weightSign(c, t, L); }
  K.mark(c, 'barbell', HX + 425, BARY, 200);
  if (!heads.lifter) heads.lifter = OFF; if (!heads.coach) heads.coach = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, mHY = G.lifter.headY, cHY = G.coach.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-50, -1353, 0.68, 'cover'), WIDE: S(-20, -1527, 0.55, 'wide'), WIDE2: S(180, -1560, 0.5, 'wide'),
  CARD: S(20, -1649, 0.7, 'card'), CARD2: S(220, -1620, 0.6, 'card'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_H: S(HX + 40, fy(hHY, 1.3, 1150), 1.3, 'her'), BADGE: S(HX + 20, fy(hHY, 1.45, 620), 1.45, 'her'),
  MIKE: S(MX - 20, fy(mHY, 1.0), 1.0, 'lifter'), MIKE_CU: S(MX - 20, fy(mHY, 1.45, 960), 1.45, 'lifter'), CHLOE: S(CX - 20, fy(cHY, 1.0), 1.0, 'coach'),
  BAR: S(HX + 420, -1000, 1.6, 'bar'), BOARD: S(MX + 300, -1230, 0.72, 'board'), BURP: S(20, -1250, 0.78, 'burp') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('cu')) return SH.COVER; if (t < hev('brow')) return f(SH.MIKE_CU); if (t < hev('cover')) return f(SH.HER_H);
    const h = t - hev('cover'); if (h < 2.2) return f(SH.COVER); if (h < 3.5) return f(SH.BAR); if (h < 5.6) return f(SH.COVER); if (h < 6.9) return f(SH.MIKE_CU); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(L === 'C2' ? SH.CARD2 : SH.CARD);
  if (L === 'A1' && t > e('plate') - 0.05) return f(SH.BAR);
  if (L === 'A2' && t > e('roll') - 0.05) return f(SH.HER_H);
  if (L === 'B1' && t > e('board') - 0.05) return f(SH.BOARD);
  if (L === 'B2' && t > e('ropes') - 0.05) return f(SH.WIDE);
  if (L === 'C1' && t > e('step') - 0.05) return f(SH.WIDE);
  if (L === 'C2') { if (t < SP.c2_m.t - 0.1) return f(SH.WIDE2);
    if (t >= e('stare') - 0.05 && t < e('towel') - 0.05) return f(SH.MIKE_CU);
    if (t >= e('towel') - 0.05 && t < SP.c2_h.t - 0.1) return f(SH.BADGE);
    if (t >= e('burpee') - 0.05) return f(SH.BURP); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : who === 'coach' ? SH.CHLOE : SH.MIKE;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.CARD; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud', 'clank']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays: title ribbon (big pink line), cover badge, weight counter
function title(c, t) { const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.translate(540, 470); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore(); }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1745); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -320 + 6, -60 + 10, 640, 120, 60); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -320, -60, 640, 120, 60); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -320, -60, 640, 120, 60); c.stroke();
  fitTxt(c, 'LET ME SHOW YOU.', 0, 4, 56, '#E0474C', 580); c.restore(); }
function barIcon(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#596070'; c.fillRect(-26, -3, 52, 6); c.fillStyle = '#2B2F3A'; for (const sx of [-1, 1]) { rr(c, sx * 14 - 5, -15, 10, 30, 3); c.fill(); rr(c, sx * 21 - 4, -11, 8, 22, 3); c.fill(); } c.restore(); }
function counter(c, t, sc) { const L = sc.id; if (L === 'outro') return; const nar = SP[L.toLowerCase() + '_nar'], u = t - sc.s;
  if (L !== 'hook' && (u < 1.2 || (nar && t > nar.t - 0.2))) return; if (L === 'hook' && CUR_TAG !== 'cover') return;
  const n = kg(t, L), ch = plateT() + 0.35, since = L === 'A1' ? t - ch : -1, bump = since > 0 && since < 0.4 ? 1 + 0.3 * Math.sin(since / 0.4 * Math.PI) : 1;
  const bubble = TL.speech.some(s => s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.3);
  const label = since > 0.1 && since < 2.1 && !bubble;
  const k = (L === 'hook' ? 1 : eBack(P(u, 1.2, 1.5), 1.6)) * bump; const w = 290, h = label ? 128 : 84;
  c.save(); c.translate(70, 1530); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, 6, 8, w, h, 22); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, 0, 0, w, h, 22); c.fill(); c.stroke();
  const iy = label ? 88 : 42; barIcon(c, 50, iy, 1.25); UI.font(c, 'Unb9', 46); c.fillStyle = n > 60 ? '#C23C4A' : C.oliveD; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(`${n} KG`, 94, iy + 2);
  if (label) { UI.textFit(c, 'Unb9', 32, 'ВЕС', w - 40); c.fillStyle = '#C23C4A'; c.fillText('ВЕС', 22, 34); }
  c.restore(); }
let CUR_TAG = 'wide';
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No! I know!'], ['A2', "I've been doing this for five years."], ['B2', 'I know the ropes.'], ['C1', "I'd prefer to focus on my own workout."]];
    K.outro(c, t, { q: ['А ТЕБЯ УЧИЛИ В ЗАЛЕ', 'БЕЗ СПРОСА?'], rows, cta: ['ОТПРАВЬ ПОДРУГЕ', 'ИЗ ЗАЛА'], heroX: 190, heroS: 0.42,
      hero: (cc, tt) => { const g = G.her, gd = G.coach; K.put(cc, CHLOE, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gd, 1), items: {}, afterTorso: c3 => whistleDraw(c3, 0, gd.ySh + 160, 0.9) }, 1500, 60);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {}, afterTorso: herTorso(tt, 'outro') }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide'; CUR_TAG = tag;
  const r = drawWorld(c, t, L, cam, tag, sh), heads = r.heads, M = r.M, proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26);
  const names = { lifter: ['MIKE', '#C23C4A'], coach: ['CHLOE', '#2E9E8A'] };
  if (L === 'hook') { const cover = tag === 'cover'; if (cover) { title(c, t); if (t < SP.hook_m.t) coverBadge(c, t); }
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_m: 0.02 } }); if (cover && t < SP.hook_m.t) counter(c, t, sc); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_h: 0.02, a1_m: 0.02, a2_h: 0.02, a2_m: 0.02, b1_h: 0.02, b1_m: 0.3, b2_h: 0.02, b2_m: 0.3, c1_h: 0.02, c1_m: 0.02, c2_m: 0.02, c2_c: 0.02, c2_h: 0.05 } });
  counter(c, t, sc);
  K.hud(c, t, sc);
}
E.run('gymcoach', NF, renderFrame);
