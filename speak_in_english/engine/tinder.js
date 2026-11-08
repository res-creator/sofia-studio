// "У него открыт сайт знакомств: «Это реклама!»" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node tinder.js start end out.mp4 | --png=f1,f2
// Living room in the evening: the heroine (arms folded) on the left; her boyfriend Jake (coral hoodie) on the right; between them a side table with HIS phone
// propped against a mug, a generic dating app open (flame icon drawn with paths, no brand anywhere). A height chart is painted on the wall behind him (5'9" / 6'0").
// hook: he lunges and grabs the phone, hugs it: "It's an ad! It just popped up! Honest!"; comment plate.
// 1 · ХОЛОДНО: "Ad. Sure. Liar." -> "Look, it even says 'match'!" he shows the screen; insert: IT'S A MATCH! (him + a redhead).
// 2 · С ЮМОРОМ: "That ad really knows your type." -> insert: three "ads", all the same redhead (AMBER 27 / 26 / 28) -> "It's the algorithm!" serious nod.
// 3 · КАК НОСИТЕЛЬ: she takes the phone; insert: HIS profile (his photo, JAKE 29, EDIT PROFILE) -> calm line -> "...Okay. I downloaded it. In March." he deflates like a balloon; Bella tip.
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: she reads his bio -> insert: 6'0" / LOVES HIKING crossed out in red marker (5'9" / TIRED ON STAIRS) -> "...I'm deleting the ad." he goes up on tiptoe at the height chart.
// Twist (music silent): her phone pings; he peeks; insert: HER screen — IT'S A MATCH! with HIM -> "Wait... why have YOU got a match with me?" -> her guilty shrug -> moral (both laugh). End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/tinder/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'cardigan', col: '#9A7FD0', col2: '#FFF6F0' }, bottom: { type: 'jeans', col: '#4E648E' } };
const BF = { ...BASE.mark, watch: null, top: { type: 'hoodie', col: '#E2735A' }, bottom: { type: 'jeans', col: '#3E4E6E' }, shoes: { col: '#FFFFFF', acc: '#E2735A' } };
const AMBER = { ...BASE.linda, hair: { ...BASE.linda.hair, col: '#D9622E' }, glasses: { col: '#1E2030', shape: 'cat' }, age: 0, top: { type: 'tee', col: '#3FB6A8' } };
const G = { her: geom(HER), bf8: geom(BF), amber: geom(AMBER) };
const X = { her: -380, bf: 400 }, TABX = 0, TABY = -900, CHARTX = 400 + 330;
const H59 = -1690, H60 = -1840;   // height-chart marks (world y)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function heart(c, x, y, r, col = '#E0474C') { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.5, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); c.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.5, -r * 0.1, 0, r * 0.9); c.fill(); c.restore(); }
function star(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr_ = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fill(); c.restore(); }
// generic dating-app flame (paths only); (x, y) = centre, r = half height
function flame(c, x, y, r, a = '#FF5A5F', b = '#FF9A3D') { c.save(); c.translate(x, y); const g = c.createLinearGradient(0, -r, 0, r); g.addColorStop(0, b); g.addColorStop(1, a); c.fillStyle = g;
  c.beginPath(); c.moveTo(0, r); c.bezierCurveTo(-r * 0.95, r, -r * 0.95, r * 0.05, -r * 0.45, -r * 0.35); c.bezierCurveTo(-r * 0.4, -r * 0.05, -r * 0.2, r * 0.05, -r * 0.12, r * 0.05); c.bezierCurveTo(-r * 0.3, -r * 0.5, 0, -r * 0.85, r * 0.12, -r); c.bezierCurveTo(r * 0.2, -r * 0.55, r * 0.9, -r * 0.25, r * 0.78, r * 0.35); c.bezierCurveTo(r * 0.7, r * 0.8, r * 0.4, r, 0, r); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(0, r * 0.82); c.bezierCurveTo(-r * 0.4, r * 0.8, -r * 0.42, r * 0.35, -r * 0.1, r * 0.1); c.bezierCurveTo(-r * 0.05, r * 0.3, r * 0.15, r * 0.35, r * 0.18, r * 0.2); c.bezierCurveTo(r * 0.4, r * 0.45, r * 0.3, r * 0.8, 0, r * 0.82); c.fill(); c.restore(); }
function xIcon(c, x, y, r, col) { c.save(); c.translate(x, y); c.strokeStyle = col; c.lineWidth = r * 0.28; c.lineCap = 'round'; c.beginPath(); c.moveTo(-r * 0.45, -r * 0.45); c.lineTo(r * 0.45, r * 0.45); c.moveTo(r * 0.45, -r * 0.45); c.lineTo(-r * 0.45, r * 0.45); c.stroke(); c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0 || !hd || Math.abs(hd.x) > 1e4) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }

// ---------------- portraits (the real rigs, clipped) for the phone screens
const PST = { bf8: { mood: 'happy', turn: 0.1, look: 0.2 }, her: { mood: 'happy', turn: -0.1, look: -0.2 }, amber: { mood: 'smug', turn: 0.15, look: 0.3 } };
const PCFG = { bf8: BF, her: HER, amber: AMBER };
function portrait(c, who, x, y, w, h, t, round = 0, bg = '#FCE3EC') { const g = G[who], s = Math.min(h, w * 1.1) * (round ? 0.6 : 0.5) / (g.hh * 2.6);
  c.save(); c.beginPath(); if (round) c.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); else rr(c, x, y, w, h, 18); c.clip(); c.fillStyle = bg; c.fillRect(x, y, w, h);
  const st = { t, talk: 0, armL: reach(g, -1, -g.sw * 1.08, g.ySh + 540, { planar: true }), armR: reach(g, 1, g.sw * 1.08, g.ySh + 540, { planar: true }), items: {}, floorShadow: false, blink: 1, ...PST[who] };
  K.put(c, PCFG[who], st, x + w / 2, y + h * (round ? 0.45 : 0.36) - g.headY * s, s); c.restore(); }

// ---------------- the phone (in the world and in the hand)
function phoneScreenSmall(c, w, h, kind = 'app') { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#FF7A6A'); g.addColorStop(1, '#FF4F7A'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  if (kind === 'match') { heart(c, w / 2, h * 0.45, w * 0.3, '#FFFFFF'); return; }
  c.fillStyle = '#FFFFFF'; rr(c, w * 0.1, h * 0.16, w * 0.8, h * 0.62, 10); c.fill(); c.fillStyle = '#F2A07A'; rr(c, w * 0.16, h * 0.2, w * 0.68, h * 0.42, 8); c.fill();
  c.fillStyle = '#D9622E'; c.beginPath(); c.arc(w / 2, h * 0.36, w * 0.17, 0, TAU); c.fill(); c.fillStyle = '#F4D0B8'; c.beginPath(); c.arc(w / 2, h * 0.38, w * 0.12, 0, TAU); c.fill();
  flame(c, w / 2, h * 0.08, h * 0.045, '#FFFFFF', '#FFFFFF');
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(w * 0.3, h * 0.88, w * 0.1, 0, TAU); c.arc(w * 0.7, h * 0.88, w * 0.1, 0, TAU); c.fill(); }
// phone: (0,0) = centre; w 110, h 200 (cartoon size so it reads in wide shots)
function phone(c, s = 1, rot = 0, kind = 'app', glow = 1, caseCol = '#2B2F3A') { c.save(); c.scale(s, s); c.rotate(rot);
  if (glow > 0) { const gg = c.createRadialGradient(0, 0, 20, 0, 0, 190); gg.addColorStop(0, `rgba(255,120,140,${0.45 * glow})`); gg.addColorStop(1, 'rgba(255,120,140,0)'); c.fillStyle = gg; c.fillRect(-200, -200, 400, 400); }
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -52, -94, 110, 200, 18); c.fill(); c.fillStyle = caseCol; rr(c, -55, -100, 110, 200, 18); c.fill();
  c.save(); c.translate(-46, -88); c.beginPath(); rr(c, 0, 0, 92, 176, 10); c.clip(); phoneScreenSmall(c, 92, 176, kind); c.restore(); c.restore(); }
const phoneItem = (kind = 'app', s = 0.8, rot = -0.08, caseCol) => ctx => { ctx.save(); ctx.translate(0, -70 * s); phone(ctx, s, rot, kind, 0.6, caseCol); ctx.restore(); };
// phone back (he hugs it, screen to his chest)
const phoneBackItem = ctx => { ctx.save(); ctx.translate(0, -50); ctx.rotate(0.1); ctx.fillStyle = '#2B2F3A'; rr(ctx, -44, -80, 88, 160, 16); ctx.fill(); ctx.fillStyle = '#4A5060'; ctx.beginPath(); ctx.arc(-18, -56, 10, 0, TAU); ctx.fill(); ctx.restore(); };
// side table with a mug; the phone leans on the mug
function sideTable(c) { c.save(); c.translate(TABX, 0);
  c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(0, 0, 170, 22, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-26, TABY + 20); q.l(26, TABY + 20); q.l(34, -40); q.l(-34, -40); q.z(); }, '#8A5A3C', { sd: 4, hd: 2, lw: 4 });
  paint(c, q => { q.m(-130, -40); q.l(130, -40); q.l(110, 0); q.l(-110, 0); q.z(); }, '#7A4E32', { sd: 4, hd: 2, lw: 4 });
  paint(c, q => { q.m(-150, TABY - 20); q.l(150, TABY - 20); q.l(140, TABY + 28); q.l(-140, TABY + 28); q.z(); }, '#9A6A44', { sd: 5, hd: 3, lw: 4 });
  // mug
  paint(c, q => { q.m(60, TABY - 150); q.l(150, TABY - 150); q.l(145, TABY - 22); q.l(65, TABY - 22); q.z(); }, '#F4EFE6', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = '#F4EFE6'; c.lineWidth = 14; c.beginPath(); c.arc(156, TABY - 90, 26, -1.3, 1.3); c.stroke(); heart(c, 105, TABY - 92, 18, '#EE5E9A');
  c.restore(); }
function tablePhone(c, t) { c.save(); c.translate(TABX - 30, TABY - 150); c.rotate(0.14); phone(c, 1.25, 0, 'app', 0.8 + 0.2 * Math.sin(t * 6)); c.restore(); }

// ---------------- living room in the evening (prerendered, softly blurred)
const BX0 = -2800, BY0 = -3800, BW = 6000, BH = 5600, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F1E6DA'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(200,140,120,.12)'; for (let x = BX0; x < BX0 + BW; x += 150) c.fillRect(x, BY0, 55, 3800);
  c.fillStyle = '#C9A88A'; c.fillRect(BX0, -200, BW, 30);
  // bookshelf on the left
  c.fillStyle = '#7A5A40'; rr(c, -1900, -2500, 800, 2330, 12); c.fill(); c.fillStyle = '#5E442E';
  for (let i = 0; i < 5; i++) c.fillRect(-1870, -2440 + i * 450, 740, 24);
  const BK = ['#E0474C', '#3F86D0', '#F2C14E', '#4CAF6A', '#8E5BD8', '#EE5E9A', '#F28C28'];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const h = 220 + ((i * 37 + r * 11) % 90); c.fillStyle = BK[(i + r * 3) % BK.length]; c.fillRect(-1850 + i * 78, -2440 + r * 450 + 450 - h - 2 + 24, 64, h - 24); }
  // window with an evening sky
  c.fillStyle = '#FBF5EC'; rr(c, -900, -2450, 900, 1200, 18); c.fill(); const g = c.createLinearGradient(0, -2420, 0, -1280); g.addColorStop(0, '#5A4A8A'); g.addColorStop(0.6, '#C97A9A'); g.addColorStop(1, '#F7B87A'); c.fillStyle = g; rr(c, -870, -2420, 840, 1140, 10); c.fill();
  c.fillStyle = '#FFF2C0'; c.beginPath(); c.arc(-260, -2200, 50, 0, TAU); c.fill(); c.fillStyle = '#3A3058'; for (const [x, w, h] of [[-860, 160, 300], [-700, 120, 420], [-580, 200, 240], [-380, 140, 360], [-240, 210, 280]]) c.fillRect(x, -1280 - h, w, h);
  c.fillStyle = '#FFE08A'; for (let i = 0; i < 18; i++) c.fillRect(-840 + (i * 113) % 780, -1500 + (i * 71) % 200, 18, 24);
  c.fillStyle = '#FBF5EC'; c.fillRect(-460, -2420, 18, 1140); c.fillRect(-870, -1870, 840, 16); c.fillStyle = '#8E5BD8'; rr(c, -1040, -2520, 160, 1360, 30); c.fill(); rr(c, -20, -2520, 160, 1360, 30); c.fill();
  // framed pictures on the right wall
  c.fillStyle = '#6A4A34'; rr(c, 1100, -2350, 360, 300, 12); c.fill(); c.fillStyle = '#BFE3F5'; rr(c, 1128, -2322, 304, 244, 8); c.fill(); c.fillStyle = '#6A9E5A'; c.beginPath(); c.moveTo(1128, -2078); c.lineTo(1250, -2250); c.lineTo(1330, -2160); c.lineTo(1380, -2210); c.lineTo(1432, -2078); c.fill();
  c.fillStyle = '#6A4A34'; rr(c, 1560, -2380, 300, 360, 12); c.fill(); c.fillStyle = '#FCE3EC'; rr(c, 1588, -2352, 244, 304, 8); c.fill(); heart(c, 1710, -2200, 66, '#EE5E9A');
  // sofa against the back wall
  paint(c, q => { q.m(-700, -1050); q.q(0, -1100, 900, -1050); q.l(900, -500); q.l(-700, -500); q.z(); }, '#4E8C86', { sd: 12, hd: 6, lw: 3 });
  paint(c, q => { q.m(-760, -620); q.l(960, -620); q.l(960, -260); q.l(-760, -260); q.z(); }, '#5EA29A', { sd: 10, hd: 5, lw: 3 });
  for (const x of [-830, 960]) paint(c, q => { q.m(x, -820); q.q(x + 60, -880, x + 130, -820); q.l(x + 130, -260); q.l(x, -260); q.z(); }, '#4E8C86', { sd: 10, hd: 5, lw: 3 });
  c.fillStyle = '#F2C14E'; rr(c, -560, -940, 260, 240, 50); c.fill(); c.fillStyle = '#EE5E9A'; rr(c, 560, -940, 260, 240, 50); c.fill();
  c.fillStyle = '#4A3A2A'; c.fillRect(-740, -260, 30, 90); c.fillRect(920, -260, 30, 90);
  // floor lamp (warm light) + plant
  c.fillStyle = '#3A3A44'; c.fillRect(2045, -1500, 14, 1500); paint(c, q => { q.m(1920, -1500); q.l(2180, -1500); q.l(2120, -1720); q.l(1980, -1720); q.z(); }, '#FFE6A0', { sd: 4, hd: 2, lw: 4 });
  const lg = c.createRadialGradient(2050, -1550, 50, 2050, -1550, 700); lg.addColorStop(0, 'rgba(255,230,160,.45)'); lg.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = lg; c.fillRect(1350, -2250, 1400, 1400);
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-2380 + i * 30, -700 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; rr(c, -2460, -320, 240, 320, 20); c.fill();
  // floor + rug
  c.fillStyle = '#B88A60'; c.fillRect(BX0, -170, BW, 2000); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -170, 8, 2000);
  c.fillStyle = '#E8D3B0'; c.beginPath(); c.ellipse(60, 60, 1300, 140, 0, 0, TAU); c.fill(); c.strokeStyle = '#8E5BD8'; c.lineWidth = 10; c.beginPath(); c.ellipse(60, 60, 1220, 115, 0, 0, TAU); c.stroke();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
// height chart painted on the wall (sharp: the labels must read); lit up in o4
function heightChart(c, t, hi = 0) { c.save(); c.translate(CHARTX, 0);
  paint(c, q => { q.m(-40, -2000); q.l(40, -2000); q.l(40, -1150); q.l(-40, -1150); q.z(); }, '#F7E6B0', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = '#8A6A3A'; c.lineWidth = 4; for (let y = -1980; y < -1160; y += 30) { c.beginPath(); c.moveTo(-40, y); c.lineTo((y % 150 === 0) ? 10 : -15, y); c.stroke(); }
  for (const [y, s, col] of [[H59, '5\'9"', '#3E4E6E'], [H60, '6\'0"', '#E0474C']]) { c.strokeStyle = col; c.lineWidth = 9; c.beginPath(); c.moveTo(-60, y); c.lineTo(60, y); c.stroke();
    c.fillStyle = '#FFFFFF'; rr(c, 72, y - 34, 150, 68, 16); c.fill(); c.strokeStyle = col; c.lineWidth = 5; c.stroke(); fitTxt(c, s, 147, y + 2, 46, col, 130); }
  if (hi > 0) { c.globalAlpha = hi * (0.5 + 0.5 * Math.sin(t * 10)); c.strokeStyle = '#FFE15A'; c.lineWidth = 10; rr(c, 64, H60 - 42, 166, 84, 20); c.stroke(); }
  c.restore(); }

// ---------------- character helpers (standing)
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const folded = (g, st) => { st.armL = reach(g, -1, g.sw * 0.32, g.ySh + 270, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.32, g.ySh + 290, { planar: true }); };
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
// hugging the phone at the chest with both hands
const hugPhone = (g, st) => { st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 250, { planar: true }); st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 270, { planar: true }); st.items = { L: phoneBackItem }; };

function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'skeptical', turn: 0.25, look: 0.7 };
  folded(g, st);
  if (L === 'hook') { st.mood = t < hev('grab') + 0.3 ? 'surprised' : 'skeptical'; if (t > hev('honest')) st.mood = 'annoyed'; if (t > hev('her') - 0.1) { st.mood = 'skeptical'; st.turn = 0.1; st.look = 0.25; st.browUp = 1; st.tilt = 0.06; } if (t > hev('wide')) { st.turn = 0.25; st.look = 0.7; st.tilt = 0; } }
  if (L === 'o1') { st.mood = 'bored';
    if (speaking('o1_h', t, 0.05, 0.1)) st.mood = 'annoyed';
    if (t > e('liar')) { st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 70, { planar: true }); st.turn = 0.15; st.look = 0.3; }
    if (t > SP.o1_b.t - 0.05) { folded(g, st); st.mood = 'bored'; st.blink = 0; }
    if (t > e('ins_out')) { st.mood = 'annoyed'; st.lookY = 0; } }
  if (L === 'o2') { st.mood = 'smug';
    if (speaking('o2_h', t, 0.05, 0.1)) { st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 330, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 330, { planar: true }); gest(st, g, 'her', t, 1, 150); st.tilt = 0.05; }
    if (t > SP.o2_nar.t - 0.1) { folded(g, st); st.mood = 'bored'; st.lookY = -0.35; st.look = 0.2; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (t > e('take')) { const k = eBack(P(t, e('take'), e('take') + 0.3), 1.5); st.armR = reach(g, 1, g.sw * lerp(2.4, 1.3, k), g.ySh + lerp(200, 30, k), { planar: true }); st.items = { R: phoneItem('profile', 0.8, -0.05) }; st.mood = 'neutral'; }
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.armL = open(g, -1, 1.6, 150 + Math.sin(t * 5) * 12); }
    if (t > SP.o3_b.t) { st.mood = 'neutral'; st.armL = down(g, -1); st.armR = hold(g, 1, 300, 0.9); st.blink = 1; st.items = { R: phoneItem('profile', 0.7, 0.1) }; }
    if (t > SP.o3_nar.t) { st.mood = 'happy'; st.turn = 0.15; st.look = 0.4; } }
  if (L === 'o4') { st.mood = 'happy'; st.armR = hold(g, 1, 300, 0.9); st.items = { R: phoneItem('profile', 0.75, 0.05) }; st.lookY = 0.3; st.look = 0.2;
    const c2 = SP.o4_h.t + 5.3;
    if (speaking('o4_h', t, 0.05, 0.1)) { st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 120, { planar: true }); st.items = { R: phoneItem('profile', 0.8, -0.05) }; st.lookY = 0.0; st.look = 0.35; st.turn = 0.15; st.tilt = -0.04; }
    if (t > SP.o4_h.t && t < c2) { st.armL = down(g, -1); st.blink = 1; }
    if (t > c2 && t < endOf('o4_h') + 0.1) { st.lookY = 0; st.look = 0.7; st.turn = 0.25; st.blink = 0; st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 260 + Math.sin(t * 6) * 10, { planar: true }); st.tilt = 0.06; }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'smug'; st.blink = 1; st.look = 0.7; st.lookY = 0; }
    if (t > e('tip') + 0.4) { st.mood = 'happy'; st.laugh = true; st.blink = 0; } }
  if (L === 'end') { st.mood = 'neutral';
    if (t > e('ping')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('look')) { const k = eBack(P(t, e('look'), e('look') + 0.3), 1.5); st.armR = reach(g, 1, g.sw * 0.9, lerp(g.ySh + 500, g.ySh + 200, k), { planar: true }); st.items = { R: phoneItem('match', 0.75, 0.05, '#EE5E9A') }; st.lookY = 0.4; st.look = 0.25; st.turn = 0.1; st.mood = 'happy'; }
    if (t > SP.end_b.t + 0.3) { st.mood = 'worried'; st.lookY = 0; st.look = 0.6; st.turn = 0.25; }
    if (t > e('busted')) { st.mood = 'happy'; st.blink = 1; st.tilt = 0.08; st.armL = open(g, -1, 1.9, 60 + Math.sin(t * 7) * 10); st.armR = open(g, 1, 1.9, 60 + Math.cos(t * 7) * 10); st.items = { R: phoneItem('match', 0.6, 0.3, '#EE5E9A') }; st.headY = -6; }
    if (t > e('laugh')) { st.laugh = true; st.blink = 0; st.tilt = 0.04; st.look = 0.7; } }
  return st; }

// boyfriend: returns the state + body transform (sx, sy, lift) for the deflate / tiptoe gags
function bfState(t, L) { const g = G.bf8, e = k => ev(L, k), st = { ...base(g, t, 'bf8'), mood: 'happy', turn: -0.25, look: -0.7 }; let sx = 1, sy = 1, lift = 0;
  if (L === 'hook') { const gr = hev('grab');
    if (t < gr) { st.mood = 'shock'; st.blink = 0; st.lean = -0.5; st.drop = 120; st.legPose = 'wide'; st.armL = reach(g, -1, TABX - X.bf + 10, TABY - 150, { planar: true }); st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 20, { planar: true }); st.turn = -0.4; st.look = -0.6; st.lookY = 0.4; }
    else if (t < gr + 0.3) { const k = eOut(P(t, gr, gr + 0.3)); st.mood = 'shock'; st.blink = 0; st.drop = 120 * (1 - k); st.lean = -0.5 * (1 - k); st.legPose = 'wide'; st.armL = reach(g, -1, lerp(TABX - X.bf + 10, -g.sw * 0.25, k), lerp(TABY - 150, g.ySh + 250, k), { planar: true }); st.items = { L: phoneItem('app', 0.75) }; }
    else { hugPhone(g, st); st.mood = 'worried'; st.blink = 0; gest(st, g, 'bf8', t, 1, 200); st.headX = Math.sin(t * 25) * 3; }
    if (t > hev('honest')) { st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 40, { planar: true }); st.mood = 'happy'; st.tilt = -0.06; }
    if (t > hev('nar')) { hugPhone(g, st); st.mood = 'worried'; st.tilt = -0.05; st.headX = Math.sin(t * 25) * 3; st.blink = 1; }
    if (t > hev('wide')) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'o1') { hugPhone(g, st); st.mood = 'happy'; st.blink = 1;
    if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'worried'; st.blink = 0; }
    if (t > SP.o1_b.t - 0.05) { st.mood = 'worried'; st.blink = 0; gest(st, g, 'bf8', t, 1, 160); }
    if (t > e('show')) { const k = eBack(P(t, e('show'), e('show') + 0.3), 1.5); st.armL = reach(g, -1, -g.sw * lerp(0.3, 1.9, k), g.ySh + lerp(250, 60, k), { planar: true }); st.items = { L: phoneItem('match', lerp(0.75, 1.0, k), 0.05) }; st.mood = 'happy'; st.blink = 0; }
    if (t > e('ins_out')) { st.mood = 'happy'; st.laugh = false; st.blink = 1; st.tilt = -0.06; } }
  if (L === 'o2') { hugPhone(g, st); st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.1)) st.mood = 'worried';
    if (t > SP.o2_b.t - 0.05) { st.mood = 'neutral'; st.browUp = 0.6; st.armR = open(g, 1, 1.6, 120 + Math.sin(t * 5) * 14); }
    if (t > SP.o2_b.t - 0.05 && t < SP.o2_nar.t + 1.2) st.headY = Math.max(0, Math.sin((t - SP.o2_b.t) * 9)) * 14;   // slow serious nods
    if (t > SP.o2_nar.t) { st.mood = 'smug'; st.armR = down(g, 1); st.blink = 1; } }
  if (L === 'o3') { st.mood = 'worried'; if (t < e('take')) hugPhone(g, st);
    if (t > e('take') && t < e('take') + 0.4) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 120, { planar: true }); st.mood = 'shock'; st.blink = 0; }
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'worried'; st.blink = 0; }
    if (t > SP.o3_b.t - 0.05) { st.mood = 'sad'; st.blink = 1; }
    if (t > e('deflate')) { const k = eOut(P(t, e('deflate'), e('deflate') + 1.1)); sx = 1 + 0.12 * k; sy = 1 - 0.16 * k; st.mood = 'sad'; st.lookY = 0.3 * k; st.armL = down(g, -1); st.armR = down(g, 1); st.tilt = 0.04 * k; } }
  if (L === 'o4') { st.mood = 'worried'; st.blink = 0;
    if (speaking('o4_h', t, 0, 0)) st.mood = t > SP.o4_h.t + 5.3 ? 'shock' : 'worried';
    if (t > SP.o4_b.t - 0.05) { st.mood = 'worried'; }
    if (t > e('tip') && t < e('down')) { const k = eOut(P(t, e('tip'), e('tip') + 0.35)); lift = 48 * k + Math.sin(t * 22) * 4 * k; sy = 1 + 0.035 * k; sx = 1 - 0.02 * k; st.armL = reach(g, -1, -g.sw * 1.1, g.ySh - 60 * k, { planar: true }); st.armR = reach(g, 1, g.sw * 1.1, g.ySh - 60 * k, { planar: true }); st.lookY = -0.35 * k; st.mood = 'worried'; st.headX = Math.sin(t * 22) * 4; }
    if (t > e('down')) { st.mood = 'sad'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'neutral';
    if (t > e('ping')) { st.mood = 'surprised'; st.look = -0.6; }
    if (t > e('peek')) { const k = eOut(P(t, e('peek'), e('peek') + 0.3)); st.lean = -0.45 * k; st.turn = -0.35; st.look = -0.8; st.lookY = 0.35; st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.end_b.t - 0.3) { st.lean = 0; st.mood = 'skeptical'; st.lookY = 0; st.look = -0.7; st.blink = 0; st.browUp = 1; st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 320, { planar: true }); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 330, { planar: true }); }
    if (speaking('end_b', t, 0, 0) && t > SP.end_b.t + 0.6) { st.armL = open(g, -1, 1.8, 90 + Math.sin(t * 5) * 12); }
    if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; st.browUp = 0; st.blink = 0; st.armL = open(g, -1, 1.5, 200); } }
  return { st, sx, sy, lift }; }

// a character drawn with a body squash/stretch anchored at the floor (deflate / tiptoe); returns the head like K.put
function putS(c, cfg, st, x, sx, sy, lift) { if (sx === 1 && sy === 1 && !lift) return K.put(c, cfg, st, x, 0);
  if (lift) { c.save(); c.fillStyle = 'rgba(40,25,40,.22)'; c.beginPath(); c.ellipse(x, 0, 150, 18, 0, 0, TAU); c.fill(); c.restore(); }
  c.save(); c.translate(x, -lift); c.scale(sx, sy); const r = K.put(c, cfg, { ...st, floorShadow: !lift }, 0, 0); c.restore();
  return { x: x + (r.x) * sx, y: -lift + r.y * sy, hh: r.hh * sy, r: r.r }; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'bf8'], cover: ['her', 'bf8'], two: ['her', 'bf8'], her: ['her'], bf: ['bf8'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  heightChart(c, t, L === 'o4' && t > ev('o4', 'tip') && t < ev('o4', 'down') ? 1 : 0);
  sideTable(c); if (L === 'hook' && t < hev('grab')) tablePhone(c, t);
  K.mark(c, 'table', TABX, TABY - 100, 180);
  const b = bfState(t, L), hs = herState(t, L);
  if (who.includes('bf8')) heads.bf8 = putS(c, BF, b.st, X.bf, b.sx, b.sy, b.lift);
  if (who.includes('her')) heads.her = K.put(c, HER, hs, X.her, 0);
  // hook: speed lines behind his lunge for the phone
  if (heads.bf8 && L === 'hook' && t < hev('grab') + 0.25) { const a = 1 - P(t, hev('grab'), hev('grab') + 0.25); c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineCap = 'round'; c.lineWidth = 16; for (let i = 0; i < 5; i++) { const y = -1450 + i * 170, x0 = X.bf + 300 + (i % 2) * 60 + Math.sin(t * 30 + i) * 15; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + 200 - (i % 2) * 60, y); c.stroke(); } c.restore(); }
  // sweat: hook (hugging the phone), o4 (tiptoe)
  if (heads.bf8 && L === 'hook' && t > hev('grab') + 0.3) sweat(c, heads.bf8, t, clamp((t - hev('grab') - 0.3) / 0.3));
  if (heads.bf8 && L === 'o4' && t > ev('o4', 'ins_out')) sweat(c, heads.bf8, t, 1);
  if (heads.her && L === 'end' && t > ev('end', 'busted') && t < ev('end', 'laugh')) sweat(c, heads.her, t, 1);
  // o3: air puffs while he deflates
  if (heads.bf8 && L === 'o3' && t > ev('o3', 'deflate') && t < ev('o3', 'deflate') + 1.4) { const u = t - ev('o3', 'deflate'); c.save(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 10; c.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const q = (u * 1.6 + i / 4) % 1, a = -1.2 + i * 0.8, r0 = heads.bf8.hh * (1.4 + q * 1.4); c.globalAlpha = (1 - q) * clamp((1.4 - u) / 0.3); c.beginPath(); c.arc(heads.bf8.x + Math.cos(a) * r0, heads.bf8.y + Math.sin(a) * r0 * 0.8, 18 * (1 - q) + 6, 0, TAU); c.stroke(); } c.restore(); }
  // moral: hearts between them
  if (L === 'end' && t > ev('end', 'laugh') && who.includes('her') && who.includes('bf8')) { const y0 = -1250; for (let i = 0; i < 6; i++) { const u = ((t - ev('end', 'laugh')) * 0.7 + i / 6) % 1; c.save(); c.globalAlpha = (1 - u) * clamp((t - ev('end', 'laugh')) / 0.3); heart(c, TABX + Math.sin(i * 2.1 + t) * 120, y0 - u * 520, 34 + 14 * u, i % 2 ? '#EE5E9A' : '#E0474C'); c.restore(); } }
  if (!heads.her) heads.her = OFFL; if (!heads.bf8) heads.bf8 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(20, fy(HY('bf8'), 0.5, 1030), 0.5, 'cover'), WIDE: S(20, fy(HY('bf8'), 0.52, 900), 0.52, 'wide'), TWO: S(20, fy(HY('bf8'), 0.7, 860), 0.7, 'two'),
  HER: S(X.her + 40, fy(HY('her'), 1.0, 900), 1.0, 'her'), HER_CU: S(X.her + 10, fy(HY('her'), 1.4, 960), 1.4, 'her'),
  BF: S(X.bf + 60, fy(HY('bf8'), 0.92, 900), 0.92, 'bf'), BF_CU: S(X.bf - 10, fy(HY('bf8'), 1.3, 940), 1.3, 'bf'), BF_CHART: S(X.bf + 150, fy(HY('bf8'), 0.85, 980), 0.85, 'bf'),
  MATCH: U('match', 1), TYPE: U('type', 2), PROF: U('prof', 3), BIO: U('bio', 4), HERM: U('herm', 5) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('hus') - 0.02) return f(SH.WIDE); if (t < hev('her') - 0.02) return f(SH.BF); if (t < hev('wide') - 0.02) return f(SH.HER_CU); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_b.t - 0.12) return f(SH.HER); if (t < e('ins') - 0.02) return f(SH.BF); if (t < e('ins_out') - 0.02) return f(SH.MATCH); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < e('ins') - 0.02) return f(SH.HER); if (t < e('ins_out') - 0.02) return f(SH.TYPE); if (t < SP.o2_nar.t - 0.02) return f(SH.BF); return f(SH.TWO); }
  if (L === 'o3') { if (t < e('ins') - 0.02) return f(SH.WIDE); if (t < e('ins_out') - 0.02) return f(SH.PROF); if (t < SP.o3_b.t - 0.12) return f(SH.HER); if (t < SP.o3_nar.t - 0.02) return f(SH.BF); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('ins') - 0.02) return f(SH.HER); if (t < e('ins_out') - 0.02) return f(SH.BIO); return f(SH.BF_CHART); }
  if (L === 'end') { if (t < e('ins') - 0.02) return f(SH.TWO); if (t < e('ins_out') - 0.02) return f(SH.HERM); if (t < e('busted') - 0.02) return f(SH.BF_CU); if (t < SP.moral.t - 0.02) return f(SH.HER); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop (the phone screen, English only)
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const PX = 540, PY = 990, PS = 1.8;
function appBar(q, w, title) { q.fillStyle = '#FFFFFF'; q.fillRect(0, 0, w, 90); q.fillStyle = 'rgba(0,0,0,.08)'; q.fillRect(0, 88, w, 2); flame(q, w / 2, 46, 28); if (title) fitTxt(q, title, w - 20, 46, 18, '#9A9AA8', 120, 'Nun9', 'right'); }
// a swipe card: portrait + name
function swipeCard(q, who, name, x, y, w, h, t) { q.fillStyle = 'rgba(0,0,0,.15)'; rr(q, x + 4, y + 8, w, h, 22); q.fill(); q.fillStyle = '#FFFFFF'; rr(q, x, y, w, h, 22); q.fill();
  portrait(q, who, x + 10, y + 10, w - 20, h - 110, t, 0, who === 'amber' ? '#BFE3F5' : '#FCE3EC'); fitTxt(q, name, x + 24, y + h - 58, 34, '#1E2030', w - 48, 'Unb9', 'left'); }
function buttons(q, w, y) { q.fillStyle = '#FFFFFF'; for (const [x, col] of [[w * 0.3, '#E0474C'], [w * 0.7, '#4CAF6A']]) { q.save(); q.shadowColor = 'rgba(0,0,0,.15)'; q.shadowBlur = 10; q.beginPath(); q.arc(x, y, 40, 0, TAU); q.fill(); q.restore(); }
  xIcon(q, w * 0.3, y, 44, '#E0474C'); heart(q, w * 0.7, y + 4, 22, '#4CAF6A'); }
// IT'S A MATCH! (o1: him + Amber; twist: her + him)
function matchScreen(q, w, h, t, t0, a, b) { const g = q.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#FF8A5A'); g.addColorStop(1, '#FF4F8A'); q.fillStyle = g; q.fillRect(0, 0, w, h);
  const k = eBack(clamp((t - t0) / 0.28), 2.0), k2 = eBack(clamp((t - t0 - 0.15) / 0.3), 1.8);
  for (let i = 0; i < 10; i++) { const u = ((t - t0) * 0.5 + i / 10) % 1; q.save(); q.globalAlpha = 0.5 * (1 - u); heart(q, (i * 97) % w, h - u * h, 14 + (i % 3) * 8, '#FFFFFF'); q.restore(); }
  q.save(); q.translate(w / 2, 170); q.scale(k, k); q.rotate(-0.06); UI.font(q, 'Unb9', 62); q.textAlign = 'center'; q.textBaseline = 'middle'; UI.strokeText(q, "IT'S A", 0, -40, '#FFFFFF', '#C8306A', 10); UI.strokeText(q, 'MATCH!', 0, 34, '#FFFFFF', '#C8306A', 10); q.restore();
  if (k2 > 0) { q.save(); q.translate(w / 2, 400); q.scale(k2, k2); for (const [who, dx, rot] of [[a, -78, -0.12], [b, 78, 0.12]]) { q.save(); q.translate(dx, 0); q.rotate(rot); q.fillStyle = '#FFFFFF'; q.beginPath(); q.arc(0, 0, 104, 0, TAU); q.fill(); portrait(q, who, -96, -96, 192, 192, t, 1, who === 'amber' ? '#BFE3F5' : '#FCE3EC'); q.restore(); }
    q.fillStyle = '#FFFFFF'; q.beginPath(); q.arc(0, 92, 40, 0, TAU); q.fill(); flame(q, 0, 92, 26); q.restore(); }
  const k3 = eBack(clamp((t - t0 - 0.35) / 0.3), 1.6); if (k3 > 0) { q.save(); q.translate(w / 2, 610); q.scale(k3, k3); q.fillStyle = '#FFFFFF'; rr(q, -170, -40, 340, 80, 40); q.fill(); fitTxt(q, 'SEND A MESSAGE', 0, 2, 28, '#FF4F7A', 300); q.restore(); }
  const fl = 1 - clamp((t - t0) / 0.25); if (fl > 0) { q.fillStyle = `rgba(255,255,255,${fl})`; q.fillRect(0, 0, w, h); } }
// his own profile (o3, o4): his photo, JAKE, 29, the bio; o4 crosses the bio out with a red marker
function profileScreen(q, w, h, t, bioK = 0, bioK2 = 0) { q.fillStyle = '#F4F1EC'; q.fillRect(0, 0, w, h); appBar(q, w);
  q.fillStyle = '#FFFFFF'; rr(q, 16, 104, w - 32, 520, 24); q.fill();
  portrait(q, 'bf8', 28, 116, w - 56, 300, t, 0, '#FFE6D6');
  fitTxt(q, 'JAKE, 29', 40, 450, 40, '#1E2030', 300, 'Unb9', 'left');
  // bio lines (icons drawn): ruler + mountain
  const line = (y, ico, txt, k, fix) => { q.save(); q.translate(40, y); ico(q); fitTxt(q, txt, 56, 0, 30, '#3A3A48', 300, 'Nun9', 'left');
    if (k > 0) { UI.font(q, 'Nun9', 30); const tw = q.measureText(txt).width; q.strokeStyle = '#E0474C'; q.lineWidth = 7; q.lineCap = 'round'; q.beginPath(); q.moveTo(50, 2); q.lineTo(50 + (tw + 14) * clamp(k * 1.6), -2); q.stroke();
      const k2 = clamp(k * 2 - 0.9); if (k2 > 0) { q.save(); q.globalAlpha = k2; if (fix.length > 5) q.translate(56, 40); else q.translate(76 + tw, 0); q.rotate(-0.06); fitTxt(q, fix, 0, 0, 34, '#E0474C', 260, 'Unb9', 'left'); q.restore(); } }
    q.restore(); };
  const ruler = c => { c.fillStyle = '#F2C14E'; rr(c, 0, -18, 36, 36, 6); c.fill(); c.strokeStyle = '#8A6A3A'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(6 + i * 8, -18); c.lineTo(6 + i * 8, -6); c.stroke(); } };
  const mount = c => { c.fillStyle = '#6A9E5A'; c.beginPath(); c.moveTo(0, 16); c.lineTo(14, -14); c.lineTo(24, 2); c.lineTo(30, -6); c.lineTo(40, 16); c.closePath(); c.fill(); };
  line(510, ruler, '6\'0"', bioK, '5\'9"'); line(570, mount, 'loves hiking', bioK2, 'TIRED ON STAIRS');
  q.fillStyle = '#FF5A7A'; rr(q, 60, 645, w - 120, 64, 32); q.fill(); fitTxt(q, 'EDIT PROFILE', w / 2, 678, 28, '#FFFFFF', w - 160); }
// o2: the "ads" are all the same redhead
function typeScreen(q, w, h, t, t0) { q.fillStyle = '#F4F1EC'; q.fillRect(0, 0, w, h); appBar(q, w);
  const names = ['AMBER, 28', 'AMBER, 26', 'AMBER, 27', 'AMBER, 25'];
  for (let i = 3; i >= 0; i--) { const ts = t0 + 0.35 + i * 0.4, u = clamp((t - ts) / 0.3); if (u >= 1) continue; const prev = i > 0 ? clamp((t - (t0 + 0.35 + (i - 1) * 0.4)) / 0.3) : 1, sc_ = i === 0 ? 1 : lerp(0.94, 1, eOut(prev));
    q.save(); q.translate(w / 2 - eIn(u) * 560, 420); q.rotate(-0.4 * eIn(u) + (i === 0 ? 0 : (i % 2 ? 0.02 : -0.02))); q.scale(sc_, sc_); swipeCard(q, 'amber', names[i], -180, -300, 360, 560, t); q.restore(); }
  buttons(q, w, 820 - 50); }
function insert(c, t, kind) { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: kind });
  const L = sceneAt(t).id, t0 = ev(L, 'ins'), k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
  const BGC = { match: ['#FFD3C2', '#F48A9A'], type: ['#CFE3F2', '#8FB4D2'], prof: ['#FCE3EC', '#E79AB8'], bio: ['#FFF0C8', '#F2C14E'], herm: ['#E6DAF7', '#B49AE0'] }[kind];
  backdrop(c, t, BGC[0], BGC[1]);
  const scr = { match: (q, w, h) => matchScreen(q, w, h, t, t0, 'bf8', 'amber'), herm: (q, w, h) => matchScreen(q, w, h, t, t0, 'her', 'bf8'), type: (q, w, h) => typeScreen(q, w, h, t, t0),
    prof: (q, w, h) => profileScreen(q, w, h, t), bio: (q, w, h) => profileScreen(q, w, h, t, clamp((t - t0 - 0.3) / 0.5), clamp((t - t0 - 0.75) / 0.5)) }[kind];
  K.phone(c, PX, PY, PS * k, scr, kind === 'herm' ? 0.03 : -0.03);
  if (kind === 'herm') { c.save(); c.translate(PX, PY); c.scale(PS * k, PS * k); c.rotate(0.03); c.strokeStyle = '#EE5E9A'; c.lineWidth = 14; UI.rr(c, -236, -406, 472, 812, 60); c.stroke(); c.restore(); } }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 290); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 125, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 330); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -440 + 8, -130 + 12, 880, 260, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -440, -130, 880, 260, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-330, 125); c.lineTo(-290, 173); c.lineTo(-270, 125); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -440, -130, 880, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -400, -113, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-392, -83); c.lineTo(-396, -67); c.lineTo(-376, -81); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -335, -95, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'у него открыто приложение знакомств.', 0, -4, 50, '#1E2030', 820, 'Unb9'); fitTxt(c, 'Он: «Это реклама!» Что ответить?', 0, 66, 50, '#1E2030', 820, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 200, w: 880, h: 260, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD8'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  c.save(); UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * Math.min(lerp(1, 1.4, big), 900 / w), y = 160;
  c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w * s / 2, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: «КАКОЙ ОТВЕТ ТВОЙ?», 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + boyfriend (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bf8;
    K.put(c, BF, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.5, armL: reach(gb, -1, -gb.sw * 1.5, gb.ySh + 200, { planar: true }), armR: reach(gb, 1, gb.sw * 1.08, gb.ySh + 540, { planar: true }), items: {} }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.15, look: 0.3, armL: reach(g, -1, -g.sw * 1.5, g.ySh + 200, { planar: true }), armR: reach(g, 1, g.sw * 1.35, g.ySh - 40 + Math.sin(t * 6) * 15, { planar: true }), items: { R: phoneItem('match', 1.0, 0.05, '#EE5E9A') } }, 0, 0);
    for (let i = 0; i < 3; i++) { const q = ((t * 0.6) + i / 3) % 1; c.save(); c.globalAlpha = 1 - q; heart(c, 320 + Math.sin(i * 2 + t) * 60, -1500 - q * 400, 50, i % 2 ? '#EE5E9A' : '#E0474C'); c.restore(); } }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'Ad. Sure. Liar.', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', 'That ad really knows your type.', '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', 'Want to try that again?', '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', "The ad also wrote 'six foot'?", '#8E5BD8', 'четыре']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.3 + i * 0.35) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 520 + i * 160;
    c.save(); c.translate(CX, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -420 + 8, -66 + 12, 840, 132, 36); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -420, -66, 840, 132, 36); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-340, 0, 50, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -340, 4, 70, C.white, 70);
    fitTxt(c, ru, -265, -24, 40, C.oliveD, 650, 'Unb9', 'left'); fitTxt(c, en, -265, 28, 34, C.pinkD, 650, 'Nun9', 'left'); c.restore(); });
  const bt = wt('пиши', 3.55) - 0.2, bk = eBack(P(t, bt, bt + 0.35), 2.2), by = 1185;
  if (bk > 0) { c.save(); c.translate(CX, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -420, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-370, -30); c.lineTo(-330, -30); c.lineTo(-330, 32); c.lineTo(-350, 16); c.lineTo(-370, 32); c.closePath(); c.fill(); fitTxt(c, 'СОХРАНИ', -200, 4, 40, C.oliveD, 250);
    const subT = bt + 0.6, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(220, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -200, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 340); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(930, CX + 260, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { insert(c, t, tag.slice(3)); heads = { her: OFFL, bf8: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { bf8: ['JAKE', '#E2735A'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_b: -0.1, o1_h: -0.22, o1_b: -0.2, o2_h: -0.2, o2_b: -0.2, o3_h: -0.22, o3_b: -0.2, o4_h: -0.2, o4_b: 0.3, end_b: -0.2 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('tinder', NF, renderFrame);
