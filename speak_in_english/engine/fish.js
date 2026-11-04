// "Коллега греет рыбу в офисе" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node fish.js start end out.mp4 | --png=f1,f2
// Open-plan office kitchen corner: the heroine (teal blazer) on the left, Mark (mustard sweater) at the counter with the shared microwave on the right,
// two silent colleagues behind a cubicle partition far left, her desk between them, the doorway far right. The key prop: Mark's open salmon lunch box + the
// green/yellow smell cloud rolling out of the microwave over the whole office.
// o1 «В ЛОБ»: he offers her a forkful, she recoils. o2 «ВЕЖЛИВО»: he looks at her desk innocently (insert: her desk, the plant wilts). o3 «КАК НОСИТЕЛЬ»:
// sheepish, he closes the box, the cloud clears. o4 «КОРОЛЕВСКИЙ ОТВЕТ»: he hugs the box ("team player"). Twist: the CEO sniffs in the doorway "I'm starving!",
// sits down with Mark and eats; the heroine facepalms. End screen: 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/fish/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'blazer', col: '#2E8C8A', shirt: '#FFFDF8' }, bottom: { type: 'trousers', col: '#2B3A4A' }, shoes: { col: '#2B1A22', acc: null } };
const MARK = { ...BASE.mark, watch: '#C9A85A', top: { type: 'sweater', col: '#E3A33A' }, bottom: { type: 'trousers', col: '#4A5568' }, shoes: { col: '#3A2A20', acc: null } };
const CEO = BASE.reggie;
const PRIYA = { ...BASE.priya, top: { type: 'cardigan', col: '#7A6AB8', col2: '#F3EDDF' } };
const DAN = { ...BASE.dan, cap: null, top: { type: 'polo', col: '#5E9EC9', col2: '#FFFFFF' } };
const G = { her: geom(HER), coll2: geom(MARK), ceo: geom(CEO), priya: geom(PRIYA), dan: geom(DAN) };
const X = { her: -420, coll2: 400, ceo: 1820, priya: -1950, dan: -2480 }, DESKX = -1180, MWX = 880, MWY = -905;   // microwave: bottom centre on the counter
const SEAT = 330, TOP = -520, TX = { coll2: 360, ceo: 820 }, TABX = 590;   // twist: Mark + the CEO seated behind the bistro table
const PART = -800;   // cubicle partition top (hides the colleagues' legs)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// lunch box: (0,0) = bottom centre; lid: 0 open (lid off), 1 closed
function lunchBox(c, s = 1, lid = 0, t = 0, steam = 1) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 4, 120, 14, 0, 0, TAU); c.fill();
  c.fillStyle = 'rgba(230,240,248,.9)'; c.strokeStyle = '#9FB4C6'; c.lineWidth = 5; rr(c, -112, -96, 224, 96, 16); c.fill(); c.stroke();
  // rice, broccoli, salmon fillet
  c.fillStyle = '#FFFDF4'; c.beginPath(); c.ellipse(-54, -64, 48, 26, 0, 0, TAU); c.fill();
  c.fillStyle = '#4E9A4A'; for (const [x, y, r] of [[-82, -78, 14], [-66, -86, 12], [-90, -64, 11]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  paint(c, q => { q.m(-6, -50); q.q(40, -112, 100, -78); q.q(104, -48, 60, -40); q.q(20, -34, -6, -50); q.z(); }, '#F4865A', { sd: 3, hd: 1.5, lw: 3 });
  c.strokeStyle = '#FFE3D2'; c.lineWidth = 5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(14 + i * 20, -54 - i * 4); c.quadraticCurveTo(24 + i * 20, -74 - i * 3, 22 + i * 20, -90 + i * 2); c.stroke(); }
  if (lid > 0) { c.save(); c.translate(0, -96 - (1 - lid) * 80); c.fillStyle = '#4C8FD8'; rr(c, -118, -22, 236, 26, 10); c.fill(); c.fillStyle = '#2F6CB0'; for (const x of [-100, 86]) { rr(c, x, -6, 14, 30, 4); c.fill(); } c.restore(); }
  if (steam > 0 && lid < 0.9) { c.save(); c.globalAlpha = steam * (1 - lid); c.strokeStyle = '#8CC63E'; c.lineWidth = 9; c.lineCap = 'round';
    for (let i = -1; i <= 1; i++) { c.beginPath(); for (let k = 0; k <= 8; k++) { const y = -110 - k * 24, x = i * 44 + Math.sin(k * 0.9 + t * 7 + i * 2) * 16; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } c.restore(); }
  c.restore(); }
const boxItem = (lid, t, steam = 1) => ctx => { ctx.save(); ctx.translate(0, 22); lunchBox(ctx, 0.9, lid, t, steam); ctx.restore(); };
const forkItem = (bite = true, rot = 0.12) => ctx => { ctx.save(); ctx.rotate(rot); ctx.strokeStyle = '#9AA3B2'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -140); ctx.stroke();
  for (const dx of [-15, 0, 15]) { ctx.beginPath(); ctx.moveTo(dx, -140); ctx.lineTo(dx, -190); ctx.stroke(); }
  if (bite) { paint(ctx, q => { q.m(-34, -186); q.q(0, -236, 36, -196); q.q(30, -176, 0, -176); q.q(-28, -174, -34, -186); q.z(); }, '#F4865A', { sd: 2, hd: 1, lw: 3 }); ctx.strokeStyle = '#FFE3D2'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-8, -184); ctx.lineTo(4, -206); ctx.stroke(); }
  ctx.restore(); };

// the smell: green/yellow wavy puffs + stink lines; spread 0..1 along a path from the microwave to the far left (+ a stream to the door in the twist)
const PUFF = Array.from({ length: 38 }, (_, i) => ({ f: i / 37, dy: (hash(i * 7.1) - 0.5) * 700, r: 120 + hash(i * 3.3) * 120, ph: hash(i) * 6, col: i % 3 === 0 ? '232,212,80' : '150,200,70' }));
function cloudState(t, L) {
  if (L === 'hook') return { k: 0.34 + 0.66 * eOut(clamp(t / 5.9)), a: 1, door: 0 };
  if (L === 'o1' || L === 'o2') return { k: 1, a: 1, door: 0 };
  if (L === 'o3') return { k: 1, a: 1 - eIO(clamp((t - ev('o3', 'clear')) / 1.2)), door: 0 };
  if (L === 'o4') return { k: 0.45, a: lerp(0.0, 0.9, eOut(clamp((t - SC.o4.s) / 0.6))), door: 0 };
  if (L === 'end') return { k: 0.6, a: 0.9, door: eOut(clamp((t - SC.end.s) / 1.6)) };
  return { k: 0, a: 0, door: 0 }; }
function puff(c, x, y, r, col, a, t, ph) { c.fillStyle = `rgba(${col},${0.36 * a})`; c.beginPath();
  for (let j = 0; j < 7; j++) { const an = j / 7 * TAU + ph, rr_ = r * (0.62 + 0.12 * Math.sin(t * 2 + j + ph)); c.moveTo(x + Math.cos(an) * r * 0.5 + rr_, y + Math.sin(an) * r * 0.35); c.arc(x + Math.cos(an) * r * 0.5, y + Math.sin(an) * r * 0.35, rr_, 0, TAU); } c.fill(); }
function stinkLines(c, x, y, s, a, t, ph) { c.save(); c.globalAlpha = 0.75 * a; c.strokeStyle = '#7DB83A'; c.lineWidth = 11 * s; c.lineCap = 'round';
  for (let i = -1; i <= 1; i++) { c.beginPath(); for (let k = 0; k <= 7; k++) { const yy = y - k * 26 * s, xx = x + i * 46 * s + Math.sin(k * 0.95 + t * 6 + i * 2 + ph) * 15 * s; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); } c.restore(); }
function cloud(c, t, L) { const st = cloudState(t, L); if (st.a <= 0.01) return;
  const x0 = MWX - 60, y0 = MWY - 150;
  for (const p of PUFF) { const g = clamp((st.k - p.f) * 5); if (g <= 0) continue;
    const x = lerp(x0, -2900, p.f) + Math.sin(t * 0.8 + p.ph) * 40, y = y0 - 180 * p.f + p.dy * Math.min(1, p.f * 3) + Math.cos(t * 0.7 + p.ph) * 25;
    puff(c, x, y, p.r * (0.4 + 0.6 * eOut(g)) * (0.6 + 0.6 * Math.min(1, p.f * 4)), p.col, st.a * g, t, p.ph);
    if (PUFF.indexOf(p) % 4 === 1) stinkLines(c, x, y - p.r * 0.2, 1, st.a * g, t, p.ph); }
  if (st.door > 0) for (let i = 0; i < 12; i++) { const f = i / 11, g = clamp((st.door - f) * 4); if (g <= 0) continue; const x = lerp(MWX + 100, 2150, f), y = MWY - 380 - Math.sin(f * Math.PI) * 220 + Math.sin(t * 1.3 + i) * 30;
    puff(c, x, y, 150 * (0.5 + 0.5 * eOut(g)), PUFF[i].col, st.a * g, t, i); if (i % 3 === 1) stinkLines(c, x, y - 40, 1, st.a * g, t, i); } }

// ---------------- office (prerendered, softly blurred)
const BX0 = -3600, BY0 = -4800, BW = 6400, BH = 7200, BS = 0.5;
function drawOffice(c) {
  c.fillStyle = '#E4E9EE'; c.fillRect(BX0, BY0, BW, BH);
  // big windows with a city skyline
  for (let wx = -3400; wx < 1300; wx += 760) { c.fillStyle = '#F7F9FB'; rr(c, wx, -2700, 700, 1300, 14); c.fill(); const g = c.createLinearGradient(0, -2680, 0, -1420); g.addColorStop(0, '#9CCBEF'); g.addColorStop(1, '#DDEFFA'); c.fillStyle = g; rr(c, wx + 22, -2678, 656, 1256, 8); c.fill();
    c.fillStyle = 'rgba(120,150,180,.55)'; for (let k = 0; k < 5; k++) { const bx = wx + 40 + k * 130, bh = 260 + hash(wx + k) * 420; c.fillRect(bx, -1422 - bh, 100, bh); }
    c.fillStyle = '#F7F9FB'; c.fillRect(wx + 340, -2678, 20, 1256); }
  c.fillStyle = '#C9D2DA'; c.fillRect(BX0, -1400, BW, 26); c.fillRect(BX0, -3200, BW, 60);
  // ceiling lights
  c.fillStyle = '#FFFFFF'; for (let x = -3400; x < 2800; x += 900) { rr(c, x, -3100, 520, 40, 20); c.fill(); }
  // distant desks with monitors (back row)
  for (let x = -3300; x < 500; x += 520) { c.fillStyle = '#B9C4CE'; c.fillRect(x, -1150, 420, 26); c.fillStyle = '#3B4452'; rr(c, x + 140, -1330, 150, 100, 8); c.fill(); c.fillRect(x + 205, -1230, 20, 80); }
  // whiteboard
  c.fillStyle = '#FFFFFF'; rr(c, -1500, -2250, 600, 380, 12); c.fill(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 8; c.stroke(); c.strokeStyle = '#4C8FD8'; c.lineWidth = 7; c.beginPath(); c.moveTo(-1440, -2000); c.lineTo(-1300, -2100); c.lineTo(-1180, -2040); c.lineTo(-1000, -2180); c.stroke(); fitTxt(c, 'Q4 GOALS', -1200, -2190, 44, '#E0474C', 300);
  // kitchen corner: upper cabinets, counter
  c.fillStyle = '#F3EDDF'; for (let i = 0; i < 3; i++) { rr(c, 480 + i * 300, -2250, 280, 520, 12); c.fill(); c.fillStyle = '#C9B896'; c.fillRect(600 + i * 300, -1780, 40, 12); c.fillStyle = '#F3EDDF'; }
  c.fillStyle = '#DCEBE2'; c.fillRect(470, -1700, 920, 800);   // tiles
  c.strokeStyle = 'rgba(0,0,0,.06)'; c.lineWidth = 4; for (let x = 470; x <= 1390; x += 115) { c.beginPath(); c.moveTo(x, -1700); c.lineTo(x, -900); c.stroke(); } for (let y = -1700; y <= -900; y += 115) { c.beginPath(); c.moveTo(470, y); c.lineTo(1390, y); c.stroke(); }
  c.fillStyle = '#9C6238'; c.fillRect(440, -880, 980, 880); c.fillStyle = '#F3EDDF'; c.fillRect(420, -920, 1020, 46);
  c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 5; for (const x of [760, 1090]) { c.beginPath(); c.moveTo(x, -860); c.lineTo(x, -20); c.stroke(); }
  c.fillStyle = '#2B2F3A'; rr(c, 1180, -1180, 170, 260, 14); c.fill(); c.fillStyle = '#E0474C'; c.fillRect(1205, -1150, 120, 30);   // coffee machine
  // doorway (to the corridor) with a sign
  c.fillStyle = '#B9C4CE'; c.fillRect(1560, -2200, 560, 2200); c.fillStyle = '#7A8A9A'; c.fillRect(1600, -2160, 480, 2160); c.fillStyle = '#5A6A7A'; c.fillRect(1600, -2160, 480, 40);
  c.fillStyle = '#4CAF6A'; rr(c, 1700, -2420, 280, 100, 12); c.fill(); fitTxt(c, 'EXIT', 1840, -2370, 56, '#FFFFFF', 240);
  c.fillStyle = '#E4E9EE'; c.fillRect(2120, -2700, 800, 2700);
  // plants
  for (const px of [-3000, 1450]) { c.fillStyle = '#5E9A4A'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(px - 60 + i * 20, -560 - i * 50, 50, 170, -0.7 + i * 0.23, 0, TAU); c.fill(); } c.fillStyle = '#D9D2C4'; rr(c, px - 100, -330, 200, 330, 18); c.fill(); }
  // floor (carpet tiles)
  c.fillStyle = '#9AA6B2'; c.fillRect(BX0, -20, BW, BY0 + BH + 20); c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = -20; y < BY0 + BH; y += 200) for (let x = BX0 + ((y / 200) % 2) * 200; x < BX0 + BW; x += 400) c.fillRect(x, y, 200, 200);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawOffice);

// the shared microwave (live: the door swings open in the hook, light inside); (MWX, MWY) = bottom centre
function microwave(c, t, L, s = 1) { c.save(); c.translate(MWX, MWY); c.scale(s, s);
  const open = L === 'hook' ? 0.3 + 0.7 * eOut(clamp(t / 0.35)) : 1;
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-200, -6, 400, 10);
  paint(c, q => { q.m(-190, 0); q.l(190, 0); q.l(190, -250); q.l(-190, -250); q.z(); }, '#E9EDF1', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#2B2F3A'; rr(c, -170, -230, 250, 210, 10); c.fill();
  const gl = c.createRadialGradient(-45, -120, 10, -45, -120, 160); gl.addColorStop(0, '#FFF2B0'); gl.addColorStop(1, '#E8C060'); c.fillStyle = gl; rr(c, -160, -220, 230, 190, 8); c.fill();
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(-45, -45, 95, 14, 0, 0, TAU); c.fill();
  c.fillStyle = '#C9D2DA'; rr(c, 100, -230, 74, 210, 8); c.fill(); fitTxt(c, '0:00', 137, -200, 26, '#3A9A4A', 60, 'Nun9');
  c.fillStyle = '#8A93A2'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(122 + (k % 2) * 30, -150 + Math.floor(k / 2) * 34, 9, 0, TAU); c.fill(); }
  // the door, hinged on the left edge, swinging towards the viewer
  const w = 270 * Math.cos(open * 1.35), sk = Math.sin(open * 1.35) * 40;
  c.fillStyle = 'rgba(40,46,58,.92)'; c.beginPath(); c.moveTo(-190, -246); c.lineTo(-190 - w, -246 + sk); c.lineTo(-190 - w, -4 + sk * 0.3); c.lineTo(-190, -4); c.closePath(); c.fill();
  c.strokeStyle = '#C9D2DA'; c.lineWidth = 6; c.stroke();
  c.restore(); K.mark(c, 'microwave', MWX, MWY - 130, 200); }

// her desk (world prop, far left): monitor, pink mug, a little plant that wilts in o2
function desk(c, t, L) { const x = DESKX, top = -760, wilt = L === 'o2' ? eOut(clamp((t - ev('o2', 'desk') - 0.35) / 0.7)) : 0;
  c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x - 380, -14, 760, 24);
  c.fillStyle = '#C9B08A'; c.fillRect(x - 360, top, 720, 34); c.fillStyle = '#8A7A66'; c.fillRect(x - 340, top + 34, 28, 726 - 34); c.fillRect(x + 312, top + 34, 28, 726 - 34);
  c.fillStyle = '#2B2F3A'; rr(c, x - 210, top - 330, 360, 230, 14); c.fill(); c.fillStyle = '#7FB6E8'; rr(c, x - 192, top - 312, 324, 194, 8); c.fill(); c.fillStyle = '#2B2F3A'; c.fillRect(x - 45, top - 100, 30, 100); rr(c, x - 110, top - 14, 160, 16, 6); c.fill();
  c.fillStyle = '#FFFFFF'; for (let i = 0; i < 4; i++) c.fillRect(x - 170, top - 290 + i * 34, 170 + (i % 2) * 90, 14);
  c.fillStyle = '#F2D94E'; c.save(); c.translate(x + 162, top - 290); c.rotate(0.12); c.fillRect(-36, -36, 72, 72); c.restore();
  c.fillStyle = '#3B4452'; rr(c, x - 150, top - 30, 220, 26, 8); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, x + 140, top - 96, 72, 96, 14); c.fill(); c.strokeStyle = '#EE5E9A'; c.lineWidth = 11; c.beginPath(); c.arc(x + 218, top - 50, 24, -1.2, 1.2); c.stroke();
  // photo frame
  c.fillStyle = '#9C6238'; rr(c, x - 330, top - 150, 110, 140, 8); c.fill(); c.fillStyle = '#F7D9E4'; c.fillRect(x - 316, top - 136, 82, 112); c.fillStyle = 'rgba(80,60,60,.4)'; c.beginPath(); c.arc(x - 275, top - 96, 18, 0, TAU); c.fill(); c.fillRect(x - 292, top - 76, 34, 44);
  // plant
  c.fillStyle = '#D9D2C4'; rr(c, x + 240, top - 90, 90, 90, 12); c.fill(); c.strokeStyle = '#5E9A4A'; c.lineWidth = 10; c.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const a0 = -Math.PI / 2 + (i - 2) * 0.35, a1 = a0 + wilt * (i < 2 ? -1.3 : 1.3) * (0.6 + i * 0.1), len = 120 - Math.abs(i - 2) * 14;
    const mx = x + 285 + Math.cos(a0) * len * 0.55, my = top - 90 + Math.sin(a0) * len * 0.55; c.beginPath(); c.moveTo(x + 285, top - 90); c.quadraticCurveTo(mx, my, mx + Math.cos(a1) * len * 0.5, my + Math.sin(a1) * len * 0.5); c.stroke();
    c.fillStyle = wilt > 0.5 ? '#A8A04A' : '#6AAE52'; c.beginPath(); c.ellipse(mx + Math.cos(a1) * len * 0.5, my + Math.sin(a1) * len * 0.5, 22, 12, a1, 0, TAU); c.fill(); }
  K.mark(c, 'desk', x, top - 150, 260); }
function partition(c) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-2900, -14, 1300, 22); paint(c, q => { q.m(-2880, PART); q.l(-1620, PART); q.l(-1620, -6); q.l(-2880, -6); q.z(); }, '#8FA3B8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#C9D2DA'; c.fillRect(-2900, PART - 26, 1300, 30); c.fillStyle = 'rgba(255,255,255,.15)'; for (let x = -2840; x < -1640; x += 80) c.fillRect(x, PART + 20, 10, 740); }
function tableFront(c) { c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(TABX - 380, -16, 760, 30);
  c.fillStyle = '#5A606E'; c.fillRect(TABX - 18, TOP, 36, -TOP); rr(c, TABX - 160, -30, 320, 30, 12); c.fill();
  paint(c, q => { q.m(TABX - 400, TOP - 30); q.l(TABX + 400, TOP - 30); q.l(TABX + 380, TOP + 14); q.l(TABX - 380, TOP + 14); q.z(); }, '#F3EDDF', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = 'rgba(243,237,223,.96)'; c.fillRect(TABX - 380, TOP + 14, 760, 300); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(TABX - 380, TOP + 14, 760, 16); }

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const nose = (g, s = 1, drop = 0) => reach(g, s, s * g.hw * 0.08, g.headY + drop + g.hh * 0.28, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const cheek = (g, s) => reach(g, s, s * g.hw * 1.05, g.headY + g.hh * 0.45, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gustK = (t, L) => L === 'hook' ? clamp((t - hev('gust')) / 0.15) * (1 - 0.6 * clamp((t - hev('gust') - 1.2) / 1)) : 0;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'happy', turn: 0.25, look: 0.7 };
  const fan = s => reach(g, s, s * g.sw * 1.7, g.ySh - 20 + Math.sin(t * 16) * 45, { planar: true });
  if (L === 'hook') { { st.mood = 'shock'; st.blink = 0; st.headFirst = true; st.armR = nose(g); st.armL = fan(-1); st.hairSway = 0.35 * gustK(t, L) * Math.sin(t * 24); st.turn = 0.15; if (t > hev('nar') + 1) { st.mood = 'angry'; } } }
  if (L === 'o1') { st.mood = 'annoyed'; st.headFirst = true; st.armR = nose(g); st.armL = fan(-1);
    if (speaking('o1_h', t, 0.05, 0.15)) { st.mood = 'angry'; st.armR = open(g, 1, 2.3, 40 + Math.sin(t * 9) * 25); st.armL = nose(g, -1); }
    if (t > SP.o1_c.t + 0.3) { st.mood = 'worried'; st.armR = nose(g); }
    if (t > e('recoil')) { const u = t - e('recoil'); st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.turn = 0.35; st.headFirst = true; st.armL = reach(g, -1, -g.sw * 1.8, g.ySh - 30 + Math.sin(u * 14) * 40, { planar: true }); st.armR = down(g, 1); st.hairSway = 0.25 * Math.sin(u * 20) * Math.exp(-u * 2); }
    if (t > SP.o1_nar.t + 0.2) { st.mood = 'angry'; } }
  if (L === 'o2') { st.mood = 'neutral'; st.armR = nose(g); st.headFirst = true;
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'worried'; st.headFirst = false; st.armL = open(g, -1, 1.4, 200); st.armR = open(g, 1, 1.4, 200); }
    if (t > SP.o2_c.t) { st.mood = 'surprised'; st.armR = open(g, 1, 1.4, 260); st.armL = down(g, -1); st.headFirst = false; }
    if (t > e('horror')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.headFirst = true; st.headFirst = false; st.armL = open(g, -1, 1.5, 60); st.armR = open(g, 1, 1.5, 60); st.turn = 0.05; st.look = 0.2; } }
  if (L === 'o3') { st.mood = 'neutral'; st.armR = nose(g); st.headFirst = true;
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'happy'; st.headFirst = false; gest(st, g, 'her', t, 1, 140); st.armL = down(g, -1); }
    if (t > endOf('o3_h') + 0.15) { st.mood = 'happy'; st.headFirst = false; st.armR = open(g, 1, 1.3, 260); }
    if (t > e('clear')) { st.mood = 'happy'; st.blink = 1; st.look = 0.4; }
    if (t > SP.o3_nar.t) { st.blink = 0; st.mood = 'happy'; } }
  if (L === 'o4') { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 330, { planar: true }); st.armR = open(g, 1, 1.3, 260);
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t; st.mood = 'happy'; st.look = 0.8;
      if (u < 4.1) st.armR = reach(g, 1, g.sw * (1.6 + 0.3 * Math.sin(u * 3)), g.ySh - 120 + Math.cos(u * 3) * 30, { planar: true });
      else st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 40 + Math.sin(u * 4) * 10, { planar: true }); }
    if (t > e('hug')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 330, { planar: true }); st.armR = open(g, 1, 1.3, 260);
    if (t > SP.end_ceo.t + 0.3) { st.mood = 'surprised'; st.look = 1; st.turn = 0.4; }
    if (t > e('sit')) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('palm')) { st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armR = forehead(g); st.headY = 6; st.turn = 0.1; st.look = 0; } }
  return st; }
const herRot = (t, L) => { if (L === 'hook') return -0.03 - 0.05 * gustK(t, L); if (L === 'o1' && t > ev('o1', 'recoil')) { const u = t - ev('o1', 'recoil'); return -0.17 * eOut(clamp(u / 0.3)) - (t > ev('o1', 'chase') ? 0.03 * Math.sin((t - ev('o1', 'chase')) * 9) : 0); } return 0; };
function markState(t, L) { const g = G.coll2, e = k => ev(L, k), st = { ...base(g, t, 'coll2'), mood: 'happy', turn: -0.25, look: -0.7 };
  const hold = () => reach(g, 1, g.sw * 0.55, g.ySh + 330, { planar: true });
  st.armR = hold(); st.items = { R: boxItem(0, t) };
  if (L === 'hook') { const k = eIO(clamp((t - 0.3) / 0.7)); st.armR = reach(g, 1, g.sw * lerp(2.0, 0.9, k), g.ySh + lerp(330, 300, k), { planar: true }); st.turn = lerp(0.3, -0.2, k); st.look = lerp(0.9, -0.5, k);
    st.mood = 'happy'; if (speaking('hook_c', t, 0.05, 0.1)) { st.laugh = t > SP.hook_c.t + 0.9; gest(st, g, 'coll2', t, -1, 120); } if (t > endOf('hook_c')) { st.blink = 1; st.mood = 'happy'; st.tilt = -0.06; } }
  if (L === 'o1') { st.mood = 'happy'; if (speaking('o1_h', t, 0.1, 0.1)) st.mood = 'surprised';
    if (speaking('o1_c', t, 0.05, 0.1)) { st.mood = 'smug'; gest(st, g, 'coll2', t, -1, 120); }
    if (t > e('offer') - 0.05) { const u = t - e('offer'), k = eOut(clamp(u / 0.35)), ch = t > e('chase') ? Math.sin((t - e('chase')) * 9) : 0;
      st.mood = 'happy'; st.items = { R: boxItem(0, t), L: ctx => { ctx.scale(1.7, 1.7); forkItem(true, -1.35)(ctx); } }; st.armL = reach(g, -1, -g.sw * lerp(1.2, 1.95, k), g.ySh + lerp(220, 110, k) + ch * 40, { planar: true }); st.turn = -0.35; } }
  if (L === 'o2') { st.mood = 'neutral'; st.items = { R: boxItem(0, t), L: forkItem(false, 0.1) }; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 140 + Math.sin(t * 4) * 20, { planar: true });
    if (speaking('o2_c', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'coll2', t, -1, 160); }
    if (t > e('look') - 0.05) { st.mood = 'happy'; st.look = -1; st.turn = -0.45; st.lookY = 0.15; st.tilt = -0.05; } }
  if (L === 'o3') { st.mood = 'neutral'; st.items = { R: boxItem(0, t), L: forkItem(false, 0.1) }; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 140, { planar: true });
    if (t > SP.o3_c.t - 0.05) { st.mood = 'worried'; st.look = -0.4; st.lookY = 0.3; st.items = { R: boxItem(clamp((t - e('close') + 0.25) / 0.25), t) }; st.armL = reach(g, -1, g.sw * 0.3, g.ySh + 230 - 60 * (1 - clamp((t - e('close')) / 0.25)), { planar: true }); }
    if (t > e('relief')) { st.mood = 'happy'; st.look = -0.6; } }
  if (L === 'o4') { st.mood = 'happy'; st.items = { R: boxItem(0, t, 0.8), L: forkItem(false, 0.1) }; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 140, { planar: true });
    if (speaking('o4_h', t, 0, 0) && t > SP.o4_h.t + 4.2) { st.mood = 'surprised'; }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.items = { R: boxItem(1, t, 0) }; }
    if (t > e('hug')) { const u = t - e('hug'); st.mood = 'angry'; st.turn = 0.25; st.look = -0.5; st.items = { R: boxItem(1, t, 0) }; st.armR = reach(g, 1, -g.sw * 0.1, g.ySh + 230, { planar: true }); st.armL = reach(g, -1, g.sw * 0.25, g.ySh + 170 + (t > e('pat') ? Math.abs(Math.sin((t - e('pat')) * 10)) * -30 : 0), { planar: true });
      if (speaking('o4_c', t, 0, 0)) st.mood = u < 0.6 ? 'angry' : 'smug'; if (t > e('pat')) { st.mood = 'smug'; st.blink = 1; } } }
  return st; }
const markRot = (t, L) => L === 'o4' && t > ev('o4', 'hug') ? 0.05 * eOut(clamp((t - ev('o4', 'hug')) / 0.3)) : L === 'o1' && t > ev('o1', 'offer') ? -0.05 * eOut(clamp((t - ev('o1', 'offer')) / 0.3)) : 0;
// seated (twist, after "sit"): behind the bistro table
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'happy', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: reach(g, -1, -g.sw * 0.7, g.ySh + SEAT + 335, { planar: true }), armR: reach(g, 1, g.sw * 0.7, g.ySh + SEAT + 335, { planar: true }), items: {} });
const eat = (g, s, t, ph = 0) => { const u = (Math.sin(t * 5 + ph) + 1) / 2; return reach(g, s, s * g.sw * lerp(0.9, 0.35, u), g.ySh + SEAT + lerp(300, 60, u), { planar: true }); };
function markSeated(t) { const g = G.coll2, st = { ...seated(g, t, 'coll2'), turn: 0.3, look: 0.7, laugh: true }; st.armL = eat(g, -1, t, 0); st.items = { L: forkItem(true, 0.2) }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + SEAT + 330, { planar: true }); return st; }
function ceoSeated(t) { const g = G.ceo, st = { ...seated(g, t, 'ceo'), turn: -0.3, look: -0.6, mood: 'happy', laugh: Math.sin(t * 3) > 0 }; st.armR = eat(g, 1, t, 2); st.items = { R: forkItem(true, -0.2) }; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + SEAT + 330, { planar: true }); return st; }
function ceoDoor(t) { const g = G.ceo, d = ev('end', 'door'), st = { ...base(g, t, 'ceo'), mood: 'happy', blink: 1, turn: -0.3, look: -0.6 };
  const u = t - d; st.tilt = -0.12 + Math.sin(u * 9) * 0.03; st.headY = Math.sin(u * 9) * -6;
  st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 330, { planar: true }); st.armL = reach(g, -1, -g.sw * 0.95, g.ySh + 400, { planar: true });
  if (speaking('end_ceo', t, 0.05, 0.1)) { st.blink = 0; st.tilt = 0; st.headY = 0; st.mood = 'happy'; gest(st, g, 'ceo', t, -1, 130); st.armR = reach(g, 1, g.sw * 0.2, g.ySh + 320 + Math.sin(t * 8) * 18, { planar: true }); }
  if (t > endOf('end_ceo')) { st.mood = 'happy'; st.laugh = true; }
  return st; }
const ceoX = t => X.ceo + 420 * (1 - eOut(clamp((t - ev('end', 'door')) / 0.45)));
function collState(t, L, who) { const g = G[who], st = { ...base(g, t, who), mood: 'neutral', turn: 0.25, look: 0.6 }, s = who === 'priya' ? 1 : -1;
  const smelly = (L === 'hook' && t > hev('gust') + 0.5) || L === 'o1' || L === 'o2' || (L === 'o3' && t < ev('o3', 'relief')) || L === 'o4' || L === 'end';
  if (smelly) { st.mood = L === 'hook' && t < hev('noses') ? 'surprised' : 'annoyed'; st.headFirst = true; st.armR = nose(g); st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 20 + Math.sin(t * 15 + s) * 45, { planar: true }); st.hairSway = L === 'hook' ? 0.3 * Math.sin(t * 22 + s) : 0; }
  if (L === 'o3' && t > ev('o3', 'relief')) { st.mood = 'happy'; st.blink = 1; st.armL = open(g, -1, 1.8, 40); st.armR = open(g, 1, 1.8, 40); }
  if (L === 'end' && t > ev('end', 'sit')) { st.mood = 'shock'; st.blink = 0; }
  return st; }
function putRot(c, cfg, st, x, rot) { c.save(); c.translate(x, 0); c.rotate(rot); const r = K.put(c, cfg, st, 0, 0); c.restore(); const cs = Math.cos(rot), sn = Math.sin(rot); return { x: x + (r.x * cs - r.y * sn), y: r.x * sn + r.y * cs, hh: r.hh, r: r.r }; }
// wind streaks around a head (hook gust)
function wind(c, hd, t, k) { if (k <= 0.02) return; c.save(); c.globalAlpha = 0.7 * k; c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; c.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const y = hd.y - hd.hh * 0.9 + i * hd.hh * 0.55, x = hd.x + hd.hh * 1.2 + ((t * 900 + i * 170) % 360) - 180; c.beginPath(); c.moveTo(x + 90, y); c.quadraticCurveTo(x + 20, y - 18, x - 60, y + 4); c.stroke(); } c.restore(); }

// ---------------- world + which characters each shot draws
const ALL = ['priya', 'dan', 'her', 'coll2', 'ceo'];
const DRAW = { wide: ['priya', 'dan', 'her', 'coll2'], office: ['priya', 'dan', 'her', 'coll2'], cover: ['her', 'coll2'], two: ['her', 'coll2'], her: ['her'], mark: ['coll2'], rel: ['priya', 'dan'], desk: [], door: ['ceo'], table: ['coll2', 'ceo'], endwide: ['her', 'coll2', 'ceo'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || ALL, heads = {}, sat = L === 'end' && t > ev('end', 'sit');
  c.drawImage(BGR, BX0, BY0, BW, BH); microwave(c, t, L); desk(c, t, L);
  cloud(c, t, L);
  if (who.includes('dan')) heads.dan = K.put(c, DAN, collState(t, L, 'dan'), X.dan, 0);
  if (who.includes('priya')) heads.priya = K.put(c, PRIYA, collState(t, L, 'priya'), X.priya, 0);
  partition(c);
  if (who.includes('ceo') && L === 'end' && t > ev('end', 'door') - 0.1) heads.ceo = sat ? K.put(c, CEO, ceoSeated(t), TX.ceo, 0) : K.put(c, CEO, ceoDoor(t), ceoX(t), 0);
  const herLate = L === 'o1' && t > ev('o1', 'offer') - 0.05;
  if (who.includes('her') && herLate) heads.her = putRot(c, HER, herState(t, L), X.her, herRot(t, L));
  if (who.includes('coll2')) { if (sat) heads.coll2 = K.put(c, MARK, markSeated(t), TX.coll2, 0); else if (L !== 'end' || !who.includes('ceo') || tag === 'wide') heads.coll2 = putRot(c, MARK, markState(t, L === 'end' ? 'o4' : L), X.coll2, markRot(t, L)); }
  if (sat) { tableFront(c); c.save(); c.translate(TABX - 10, TOP - 22); lunchBox(c, 0.95, 0, t, 0.9); c.restore(); K.mark(c, 'box', TABX, TOP - 80, 120); }
  if (who.includes('her') && !herLate) heads.her = putRot(c, HER, herState(t, L), X.her, herRot(t, L));
  if (L === 'hook' && heads.her) wind(c, heads.her, t, gustK(t, L));
  if (L === 'hook') for (const k of ['priya', 'dan']) if (heads[k]) wind(c, heads[k], t + 0.3, gustK(t, L));
  if (!heads.her) heads.her = OFFL; for (const k of ['coll2', 'ceo', 'priya', 'dan']) if (!heads[k]) heads[k] = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(250, fy(HY('coll2'), 0.6, 890), 0.6, 'cover'), WIDE: S(250, fy(HY('coll2'), 0.5, 760), 0.5, 'wide'), OFFICE: S(-650, fy(HY('coll2'), 0.3, 860), 0.3, 'office'),
  TWO: S(0, fy(HY('coll2'), 0.78, 820), 0.78, 'two'), HER: S(X.her + 30, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.2, 880), 1.2, 'her'),
  MARK: S(X.coll2 + 60, fy(HY('coll2'), 1.0), 1.0, 'mark'), MARK_CU: S(X.coll2 + 10, fy(HY('coll2'), 1.25, 900), 1.25, 'mark'),
  REL: S((X.priya + X.dan) / 2, fy(HY('dan'), 0.85, 900), 0.85, 'rel'), DESK: S(DESKX + 40, -1050, 1.25, 'desk'),
  DOOR: S(X.ceo - 40, fy(HY('ceo'), 1.0, 880), 1.0, 'door'), TABLE: S(TABX, fy(HY('ceo') + SEAT, 0.85, 860), 0.85, 'table'), ENDW: S(160, fy(HY('coll2'), 0.55, 820), 0.55, 'endwide'), MICRO: U('micro', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = (id, pre = 0.1, post = 0.15) => speaking(id, t, pre, post);
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('noses') - 0.05) return f(SH.MICRO); if (t < hev('wide') - 0.05) return f(SH.REL); return f(SH.OFFICE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_c.t - 0.03) return f(SH.HER); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_c.t - 0.03) return f(SH.HER); if (t < e('desk')) return f(SH.MARK_CU); if (t < e('horror') - 0.02) return f(SH.DESK); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_c.t - 0.03) return f(SH.HER); if (t < e('relief') - 0.02) return f(SH.MARK); if (t < SP.o3_nar.t - 0.03) return f(SH.REL); if (t < SP.o3_tip.t - 0.1) return f(SH.TWO); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < SP.o4_h.t + 4.18) return f(SH.HER); if (t < e('gasp') - 0.02) return f(SH.TWO); return f(SH.MARK_CU); }
  if (L === 'end') { if (t < e('sit') - 0.02) return f(SH.DOOR); if (t < e('palm') - 0.02) return f(SH.TABLE); if (t < SP.moral.t + 0.5) return f(SH.HER_R); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'clank']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- microwave insert (hook): the open microwave with the steaming salmon box, smell pouring out, on a solid backdrop
function microView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#DDEFC4'); g.addColorStop(1, '#A8CF7A'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'micro' });
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.22)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore();
  const k = eBack(clamp((t - hev('nar') + 0.05) / 0.3), 1.6), u = t - hev('nar');
  c.save(); c.translate(560, 1250); c.scale(2.4 * k, 2.4 * k);
  paint(c, q => { q.m(-190, 0); q.l(190, 0); q.l(190, -250); q.l(-190, -250); q.z(); }, '#E9EDF1', { sd: 6, hd: 3, lw: 4 });
  const gl = c.createRadialGradient(-45, -120, 10, -45, -120, 160); gl.addColorStop(0, '#FFF2B0'); gl.addColorStop(1, '#E8C060'); c.fillStyle = '#2B2F3A'; rr(c, -170, -230, 250, 210, 10); c.fill(); c.fillStyle = gl; rr(c, -160, -220, 230, 190, 8); c.fill();
  c.save(); c.translate(-45, -36); lunchBox(c, 0.85, 0, t, 1); c.restore();
  c.fillStyle = '#C9D2DA'; rr(c, 100, -230, 74, 210, 8); c.fill(); fitTxt(c, 'DONE', 137, -200, 22, '#3A9A4A', 64, 'Nun9');
  c.fillStyle = 'rgba(40,46,58,.92)'; c.beginPath(); c.moveTo(-190, -246); c.lineTo(-300, -216); c.lineTo(-300, 8); c.lineTo(-190, -4); c.closePath(); c.fill();
  c.restore();
  for (let i = 0; i < 9; i++) { const a = i / 9, x = 540 + Math.sin(a * 9 + t * 1.5) * 300, y = 760 - a * 420 - ((u * 120) % 60); puff(c, x, y, 150 + a * 60, PUFF[i].col, 1.6, t, i); }
  for (const [x, y] of [[360, 800], [620, 700], [760, 860]]) stinkLines(c, x, y, 1.6, 1, t, x); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
// option plate: pops big at the start of the option (<= 0.6 s), then stays as a small label at the top
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Mark hugging his box (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.coll2; K.put(c, MARK, { t, mood: 'happy', blink: 1, turn: -0.2, look: -0.4, items: { R: boxItem(1, t, 0) }, armR: reach(gm, 1, -gm.sw * 0.1, gm.ySh + 230, { planar: true }), armL: reach(gm, -1, gm.sw * 0.25, gm.ySh + 170, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.4), wAt('outro', 'два', sp.t + 1.65), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.1)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = id === 'o4' ? ['КОРОЛЕВ-', 'СКИЙ'] : LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 2.6) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - wAt('outro', 'сохрани', sp.t + 3.4)) / 0.5) * Math.PI);
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
  if (tag.startsWith('ui:')) { microView(c, t); heads = { her: OFFL, coll2: OFF, ceo: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { coll2: ['MARK', '#C9862A'], ceo: ['THE CEO', '#4A4F5C'] };
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { hook_c: -0.2, o1_h: -0.22, o1_c: 0.3, o2_h: -0.22, o2_c: -0.2, o3_h: -0.22, o3_c: -0.1, o4_h: -0.15, o4_c: 0.2, end_ceo: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('fish', NF, renderFrame);
