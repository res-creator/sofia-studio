// "Мама парня назвала меня именем бывшей" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node wrongname.js start end out.mp4 | --png=f1,f2
// His parents' hallway: Anna (mint dress) on the left, his mum (pink cardigan, cat-eye glasses) on the right; the front door far left, a sideboard on the right
// with the framed photo WILL & KATIE (the running prop). hook: mum hugs Anna ("Katie!"), Anna freezes; comment plate; insert: the WILL & KATIE photo.
// 1 · ХОЛОДНО: arms crossed "It's Anna." -> mum shows a size with her hands and squeezes it ("...shorter") -> Anna's eye twitches.
// 2 · С ЮМОРОМ: "...then Katie can do the dishes." -> mum laughs and loads a tall stack of plates into Anna's arms (wobble).
// 3 · КАК НОСИТЕЛЬ: light correction -> mum blushes, hands on her cheeks -> insert: the KATIE photo is pressed face-down + Bella tip.
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: "...I'm Anna — the upgrade." (sparkles) -> mum looks her up and down, nods.
// Twist (music silent): the front door opens, Will walks in: "Mum, this is Anna." -> mum winks "I was testing her." -> insert: clipboard GIRLFRIEND TEST: PASSED. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/wrongname/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, necklace: true, top: { type: 'sweater', col: '#5FB89E' }, bottom: { type: 'skirt', col: '#2F5A6E' }, shoes: { col: '#2B1A22', acc: null } };
const MUM = { ...BASE.linda, age: 0.7, hair: { style: 'bouffant', col: '#CFC6BC' }, glasses: { col: '#8A2A50', shape: 'cat' }, necklace: true, earrings: '#F7F2E8',
  build: { shoulder: 0.9, hip: 1.1, arm: 0.92, belly: 0.15 }, top: { type: 'cardigan', col: '#D2557F', col2: '#F7E6EC' }, bottom: { type: 'skirt', col: '#4A3A5A' }, shoes: { col: '#6A2A3A', acc: null } };
const WILL = { ...BASE.tom, hair: { style: 'quiff', col: '#3A2418' }, brow: '#2A1A10', top: { type: 'hoodie', col: '#5E7F4A' }, bottom: { type: 'jeans', col: '#3B4A6A' }, shoes: { col: '#FFFFFF', acc: '#5E7F4A' } };
const KATIE = { ...BASE.chloe, hair: { style: 'long', col: '#F2D27A' } };
const G = { her: geom(HER), hismum: geom(MUM), bf3: geom(WILL) };
const X = { her: -250, mum: 280, will: -820 }, HUGX = X.her + 330, DOORX = -1300, SBX = 1100;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function heart(c, x, y, r, col = '#E0474C') { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.5, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); c.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.5, -r * 0.1, 0, r * 0.9); c.fill(); c.restore(); }
function star(c, x, y, r, col = '#FFE15A', rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr_ = i % 2 ? r * 0.28 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fill(); c.restore(); }
function tick(c, x, y, s, col = '#4CAF6A', k = 1) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
  const p = [[-26, 0], [-8, 20], [28, -24]], L1 = Math.hypot(18, 20), L2 = Math.hypot(36, 44), tot = L1 + L2, d = k * tot; c.moveTo(...p[0]);
  if (d <= L1) c.lineTo(lerp(p[0][0], p[1][0], d / L1), lerp(p[0][1], p[1][1], d / L1)); else { c.lineTo(...p[1]); const u = (d - L1) / L2; c.lineTo(lerp(p[1][0], p[2][0], u), lerp(p[1][1], p[2][1], u)); } c.stroke(); c.restore(); }

// ---------------- props (paths only; English only in the world)
// bouquet: (0,0) = the hand; flowers up
function bouquet(c, s = 1, droop = 0) { c.save(); c.scale(s, s); c.rotate(droop);
  c.strokeStyle = '#4E8A3E'; c.lineWidth = 8; for (const a of [-0.3, -0.1, 0.1, 0.3]) { c.beginPath(); c.moveTo(0, 30); c.lineTo(Math.sin(a) * 120, -130); c.stroke(); }
  paint(c, q => { q.m(-60, -70); q.l(60, -70); q.l(18, 50); q.l(-18, 50); q.z(); }, '#F7EBD8', { sd: 4, hd: 2, lw: 3 });
  for (const [x, y, col] of [[-70, -150, '#EE5E9A'], [0, -175, '#F2C14E'], [70, -150, '#E0474C'], [-35, -120, '#FFFFFF'], [38, -122, '#8E5BD8']]) { c.fillStyle = col; for (let i = 0; i < 5; i++) { const a = i * TAU / 5; c.beginPath(); c.arc(x + Math.cos(a) * 16, y + Math.sin(a) * 16, 15, 0, TAU); c.fill(); } c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); }
  c.restore(); }
const bouquetItem = droop => ctx => { ctx.save(); ctx.translate(0, -10); bouquet(ctx, 1.05, droop); ctx.restore(); };
// a stack of dinner plates; (0,0) = bottom centre
function plates(c, n = 9, wob = 0, t = 0) { for (let i = 0; i < n; i++) { const x = Math.sin(t * 11 + i * 0.7) * wob * i * 2.2, y = -i * 26;
    c.fillStyle = '#E6E9EE'; c.beginPath(); c.ellipse(x, y, 150, 24, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x, y - 6, 140, 18, 0, 0, TAU); c.fill();
    c.strokeStyle = '#4E7FB8'; c.lineWidth = 4; c.beginPath(); c.ellipse(x, y - 6, 120, 14, 0, 0, TAU); c.stroke();
    if (i === n - 1) { c.fillStyle = 'rgba(180,120,60,.55)'; c.beginPath(); c.ellipse(x + 30, y - 8, 30, 6, 0, 0, TAU); c.fill(); } } }
// clipboard (small, in mum's hand); (0,0) = centre
function clipSmall(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-95, -130); q.l(95, -130); q.l(95, 130); q.l(-95, 130); q.z(); }, '#B07A44', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#FFFFFF'; c.fillRect(-80, -110, 160, 225); c.fillStyle = '#9AA0A8'; rr(c, -40, -145, 80, 36, 8); c.fill();
  c.fillStyle = '#C9CED6'; for (let i = 0; i < 4; i++) c.fillRect(-60, -70 + i * 45, 120, 8); c.restore(); }
// framed photo (world, small) on the sideboard; (0,0) = bottom centre
function photoFrame(c, s = 1, down = 0) { c.save(); c.scale(s, s);
  if (down > 0.5) { paint(c, q => { q.m(-110, -26); q.l(110, -26); q.l(110, 0); q.l(-110, 0); q.z(); }, '#7A4A2A', { sd: 3, hd: 2, lw: 3 }); c.restore(); return; }
  c.scale(1, 1 - down * 1.6);
  paint(c, q => { q.m(-110, -280); q.l(110, -280); q.l(110, 0); q.l(-110, 0); q.z(); }, '#C9973E', { sd: 4, hd: 2, lw: 3 });
  c.fillStyle = '#9FD3F0'; c.fillRect(-88, -258, 176, 236); c.fillStyle = '#7CC27A'; c.fillRect(-88, -90, 176, 68);
  for (const [x, col, hc] of [[-38, '#5E7F4A', '#3A2418'], [38, '#EE5E9A', '#F2D27A']]) { c.fillStyle = col; rr(c, x - 30, -120, 60, 98, 20); c.fill(); c.fillStyle = '#F6D2B6'; c.beginPath(); c.arc(x, -150, 28, 0, TAU); c.fill(); c.fillStyle = hc; c.beginPath(); c.arc(x, -162, 28, Math.PI, 0); c.fill(); }
  heart(c, 0, -205, 18, '#E0474C'); c.restore(); }
// car keys (Will)
function keys(c, s = 1, t = 0) { c.save(); c.scale(s, s); c.rotate(Math.sin(t * 9) * 0.25);
  c.strokeStyle = '#C9D2DA'; c.lineWidth = 7; c.beginPath(); c.arc(0, 18, 18, 0, TAU); c.stroke(); c.fillStyle = '#B8C2CC'; c.strokeStyle = '#6A7480'; c.lineWidth = 3;
  for (const [a, l] of [[0.35, 70], [-0.3, 58]]) { c.save(); c.translate(0, 34); c.rotate(a); rr(c, -9, 0, 18, l, 4); c.fill(); c.stroke(); c.restore(); }
  c.fillStyle = '#2B2F3A'; c.save(); c.translate(-14, 40); c.rotate(-0.25); rr(c, -22, 0, 44, 62, 18); c.fill(); c.restore(); c.restore(); }
const keysItem = t => ctx => { ctx.save(); ctx.translate(0, 10); keys(ctx, 1.5, t); ctx.restore(); };

// ---------------- hallway (prerendered, softly blurred)
const BX0 = -3800, BY0 = -4400, BW = 7800, BH = 6000, BS = 0.5;
function drawHall(c) {
  c.fillStyle = '#F3E3C8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(200,120,110,.16)'; for (let x = BX0; x < BX0 + BW; x += 170) for (let y = BY0 + 60; y < -900; y += 170) { const o = ((y / 170) & 1) * 85; c.beginPath(); c.arc(x + o, y, 14, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(160,190,140,.18)'; for (let x = BX0 + 40; x < BX0 + BW; x += 340) c.fillRect(x, BY0, 30, 3500 + BY0 * 0 + 600);
  // ceiling cornice + pendant lamp
  c.fillStyle = '#FBF5EA'; c.fillRect(BX0, -3150, BW, 70); c.fillStyle = '#E2D2B8'; c.fillRect(BX0, -3080, BW, 16);
  c.strokeStyle = '#5A4A40'; c.lineWidth = 6; c.beginPath(); c.moveTo(-50, -3080); c.lineTo(-50, -2650); c.stroke();
  paint(c, q => { q.m(-230, -2470); q.q(-50, -2760, 130, -2470); q.z(); }, '#F2C14E', { sd: 5, hd: 2, lw: 4 }); c.fillStyle = 'rgba(255,240,190,.35)'; c.beginPath(); c.ellipse(-50, -2460, 260, 40, 0, 0, TAU); c.fill();
  // lower wall panelling + dado rail + skirting
  c.fillStyle = '#E3CFA8'; c.fillRect(BX0, -900, BW, 900); c.fillStyle = '#F7EEDC'; c.fillRect(BX0, -930, BW, 34);
  c.strokeStyle = 'rgba(120,90,50,.25)'; c.lineWidth = 6; for (let x = BX0 + 60; x < BX0 + BW; x += 420) { rr(c, x, -820, 330, 640, 10); c.stroke(); }
  c.fillStyle = '#F7EEDC'; c.fillRect(BX0, -110, BW, 110);
  // front door (far left) in a white frame with a fanlight; the door leaf is drawn live (it opens in the twist)
  c.fillStyle = '#FBF7EE'; c.fillRect(DOORX - 330, -2330, 660, 2330); c.fillStyle = '#E9F2F8'; c.beginPath(); c.arc(DOORX, -2080, 260, Math.PI, 0); c.fill();
  c.strokeStyle = '#FBF7EE'; c.lineWidth = 14; for (const a of [-2.6, -2.1, -1.57, -1.05, -0.55]) { c.beginPath(); c.moveTo(DOORX, -2080); c.lineTo(DOORX + Math.cos(a) * 260, -2080 + Math.sin(a) * 260); c.stroke(); }
  // coat hooks with coats + umbrella
  c.fillStyle = '#7A5A40'; rr(c, -870, -1900, 420, 40, 10); c.fill();
  for (const [x, col, len] of [[-820, '#C9873A', 720], [-680, '#3B4A6A', 820], [-540, '#B5434E', 640]]) { paint(c, q => { q.m(x - 20, -1880); q.q(x - 90, -1700, x - 80, -1880 + len); q.l(x + 80, -1880 + len); q.q(x + 90, -1700, x + 20, -1880); q.z(); }, col, { sd: 6, hd: 3, lw: 3 }); }
  // family pictures on the wall (no text)
  for (const [x, y, w, h, col] of [[200, -2300, 380, 280, '#8CB8D8'], [700, -2400, 260, 340, '#E3B860'], [1100, -2250, 300, 230, '#B9A2D8'], [-300, -2350, 240, 300, '#9CCB8A']]) {
    c.fillStyle = '#7A4A2A'; c.fillRect(x - w / 2 - 22, y - h / 2 - 22, w + 44, h + 44); c.fillStyle = col; c.fillRect(x - w / 2, y - h / 2, w, h);
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(x - w * 0.2, y - h * 0.15, Math.min(w, h) * 0.12, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(x - w / 2, y + h / 2); c.lineTo(x - w * 0.1, y); c.lineTo(x + w * 0.15, y + h * 0.2); c.lineTo(x + w / 2, y - h * 0.1); c.lineTo(x + w / 2, y + h / 2); c.fill(); }
  // sideboard (right) with drawers, a lamp and a vase of flowers
  paint(c, q => { q.m(SBX - 380, -860); q.l(SBX + 380, -860); q.l(SBX + 380, -120); q.l(SBX - 380, -120); q.z(); }, '#8A5A36', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#6E4428'; c.fillRect(SBX - 400, -880, 800, 40); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 5; for (const dx of [-250, 0, 250]) { rr(c, SBX + dx - 110, -800, 220, 280, 10); c.stroke(); c.fillStyle = '#E3C060'; c.beginPath(); c.arc(SBX + dx, -660, 12, 0, TAU); c.fill(); }
  c.fillStyle = '#4A3020'; c.fillRect(SBX - 360, -120, 40, 120); c.fillRect(SBX + 320, -120, 40, 120);
  c.fillStyle = '#5BB6E8'; rr(c, SBX + 200, -1080, 120, 200, 40); c.fill(); c.save(); c.translate(SBX + 260, -1060); bouquet(c, 1.2); c.restore();
  c.fillStyle = "#3A3A44"; c.fillRect(SBX - 290, -1150, 14, 270);
  // floor + runner rug + WELCOME mat at the door
  c.fillStyle = '#9A6A44'; c.fillRect(BX0, 0, BW, BH + BY0); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, 0, 8, 1600);
  c.fillStyle = '#B5434E'; c.beginPath(); c.moveTo(-900, 40); c.lineTo(1900, 40); c.lineTo(2100, 260); c.lineTo(-1000, 260); c.closePath(); c.fill(); c.strokeStyle = '#F2C14E'; c.lineWidth = 8; c.stroke();
  c.fillStyle = '#8A6A3A'; c.beginPath(); c.moveTo(DOORX - 250, 30); c.lineTo(DOORX + 250, 30); c.lineTo(DOORX + 290, 170); c.lineTo(DOORX - 290, 170); c.closePath(); c.fill();
  fitTxt(c, 'WELCOME', DOORX, 100, 70, '#3A2A1A', 440);
}
// the lamp shade above the stick (drawn into the BG at the right place)
function drawHallFix(c) { c.save(); c.translate(SBX - 283, -1150); paint(c, q => { q.m(-110, 0); q.l(110, 0); q.l(70, -170); q.l(-70, -170); q.z(); }, '#F7E6B0', { sd: 4, hd: 2, lw: 4 }); c.restore(); }
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(c => { drawHall(c); drawHallFix(c); });

// ---------------- the front door leaf (live): opens in the twist (hinge on the left edge); bright garden behind
const doorOpen = (t, L) => L === 'end' ? eIO(P(t, ev('end', 'door'), ev('end', 'door') + 0.5)) : 0;
function door(c, t, L) { const k = doorOpen(t, L), x0 = DOORX - 270, w = 540, top = -1830;
  if (k > 0) { const g = c.createLinearGradient(0, top, 0, 0); g.addColorStop(0, '#BFE6FA'); g.addColorStop(0.6, '#E9F6FC'); g.addColorStop(0.61, '#7CC27A'); g.addColorStop(1, '#5EA85E'); c.fillStyle = g; c.fillRect(x0, top, w, -top);
    c.fillStyle = 'rgba(255,250,220,.35)'; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + w, 0); c.lineTo(x0 + w + 500 * k, 300); c.lineTo(x0 - 100, 300); c.fill(); }
  const ww = w * (1 - 0.82 * k);
  paint(c, q => { q.m(x0, top); q.l(x0 + ww, top - 30 * k); q.l(x0 + ww, 30 * k); q.l(x0, 0); q.z(); }, '#2E6A5A', { sd: 8, hd: 4, lw: 4 });
  if (k < 0.6) { c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 8; for (const [x, y, w2, h2] of [[0.12, 0.08, 0.32, 0.36], [0.56, 0.08, 0.32, 0.36], [0.12, 0.52, 0.32, 0.4], [0.56, 0.52, 0.32, 0.4]]) c.strokeRect(x0 + x * ww, top + y * -top, w2 * ww, h2 * -top);
    c.fillStyle = '#E3C060'; c.beginPath(); c.arc(x0 + ww * 0.88, -900, 20, 0, TAU); c.fill(); c.fillRect(x0 + ww * 0.4, -1150, ww * 0.2, 22); } }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const cheek = (g, s) => reach(g, s, s * g.hw * 1.05, g.headY + g.hh * 0.45, { planar: true });
const chin = (g, s) => reach(g, s, s * g.hw * 0.2, g.headY + g.hh * 1.0, { planar: true });
const chest = (g, s, k = 0.25, dy = 130) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const crossArms = (g, st) => { st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 250, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 230, { planar: true }); };
const holdFront = (g, st, fn, dy = 300, k = 0.8) => { st.armL = reach(g, -1, -g.sw * k, g.ySh + dy, { planar: true }); st.armR = reach(g, 1, g.sw * k, g.ySh + dy, { planar: true }); st.afterTorso = (c, gg) => { c.save(); c.translate(0, gg.ySh + dy + 10); fn(c); c.restore(); }; };
const twitchK = (t, L) => L === 'o1' ? clamp((t - ev('o1', 'twitch')) / 0.15) * (1 - clamp((t - SP.o1_nar.t - 1.2) / 0.3)) : 0;
const blushK = (t, L) => L === 'o3' ? clamp((t - SP.o3_m.t + 0.1) / 0.3) * (1 - clamp((t - SP.o3_nar.t - 1.6) / 0.4)) : 0;
const shineK = (t, L) => L === 'o4' ? clamp((t - ev('o4', 'shine')) / 0.2) * (1 - clamp((t - SP.o4_m.t - 0.4) / 0.3)) : 0;
const winkOn = (t, L) => L === 'end' && t > ev('end', 'wink') && t < SP.end_m.t + SP.end_m.d * 0.55;
const willIn = (t, L) => L === 'end' && t > ev('end', 'walk') - 0.05;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'happy', turn: 0.25, look: 0.7 };
  if (L === 'hook') { st.armL = reach(g, -1, -g.sw * 1.35, g.ySh + 120, { planar: true }); st.items = { L: bouquetItem(-0.15) }; st.armR = chest(g, 1, 0.3, 200); st.mood = 'surprised'; st.blink = 0;
    if (t > hev('freeze') - 0.05) { st.mood = 'annoyed'; st.blink = 0; st.breathe = 0; st.turn = 0.05; st.look = 0.1; st.items = { L: bouquetItem(-2.6 * eOut(P(t, hev('freeze'), hev('freeze') + 0.4)) - 0.15) }; st.armL = down(g, -1); st.armR = down(g, 1); }
    if (t > hev('wide')) { st.mood = 'skeptical'; st.turn = 0.25; st.look = 0.7; st.items = {}; } }
  if (L === 'o1') { st.mood = 'neutral'; crossArms(g, st);
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'annoyed'; st.lookY = 0; }
    if (t > SP.o1_m.t) { st.mood = 'skeptical'; }
    if (t > e('twitch')) { st.mood = 'annoyed'; st.turn = 0.05; st.look = 0.15; st.blink = Math.sin(t * 38) > 0.2 && t < e('twitch') + 0.8 ? 0.65 : 0; st.headX = Math.sin(t * 55) * 2 * (t < e('twitch') + 0.8 ? 1 : 0); } }
  if (L === 'o2') { st.mood = 'smug'; st.turn = 0.25; st.look = 0.7;
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 120); if (t > e('point')) st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 60 + Math.sin(t * 6) * 10, { planar: true }); }
    if (t > SP.o2_m.t) { st.mood = 'happy'; st.armR = down(g, 1); }
    if (t > e('load') + 0.15) { holdFront(g, st, c => plates(c, 9, clamp(1 - (t - e('wobble')) / 1.6) * (t > e('wobble') ? 1 : 0.3), t), 330, 0.55); st.mood = 'surprised'; st.blink = 0; st.lookY = 0.25; st.look = 0.3; }
    if (t > e('wobble') + 0.9) { st.mood = 'bored'; st.lookY = 0; st.turn = 0.05; st.look = 0.1; } }
  if (L === 'o3') { st.mood = 'happy'; st.turn = 0.25; st.look = 0.7; st.tilt = 0.05;
    if (speaking('o3_h', t, 0.1, 0.1)) { st.armL = open(g, -1, 1.6, 150 + Math.sin(t * 5) * 12); st.armR = open(g, 1, 1.6, 150 + Math.cos(t * 5) * 12); }
    if (t > SP.o3_m.t) { st.tilt = 0; st.mood = 'happy'; st.blink = 0; }
    if (t > SP.o3_nar.t + 1.0) { st.mood = 'happy'; st.armL = chest(g, -1, 0.15, 260); st.armR = chest(g, 1, 0.15, 280); } }
  if (L === 'o4') { st.mood = 'smug'; st.turn = 0.25; st.look = 0.7;
    if (speaking('o4_h', t, 0.1, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 120); if (t > e('shine') - 0.1) { st.armR = chest(g, 1, 0.1, 110); st.armL = open(g, -1, 1.9, 40); st.mood = 'smug'; st.headY = -6; } }
    if (t > endOf('o4_h')) { st.mood = 'smug'; st.blink = 1; st.armR = chest(g, 1, 0.1, 110); }
    if (t > SP.o4_m.t + 0.3) { st.blink = 0; st.mood = 'happy'; st.armR = down(g, 1); } }
  if (L === 'end') { st.mood = 'happy'; st.turn = 0.2; st.look = 0.6;
    if (t > ev('end', 'door')) { st.turn = -0.3; st.look = -0.9; st.mood = 'surprised'; }
    if (t > endOf('end_b')) { st.turn = 0.25; st.look = 0.7; st.mood = 'neutral'; }
    if (t > SP.end_m.t + 1.0) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armL = open(g, -1, 1.5, 60); st.armR = open(g, 1, 1.5, 60); st.look = 0.2; st.turn = 0.05; }
    if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armL = down(g, -1); st.armR = chest(g, 1, 0.15, 260); st.headY = Math.sin(t * 9) * 5; st.turn = 0.2; st.look = 0.5; } }
  return st; }
function mumX(t, L) { return L === 'hook' && t < hev('freeze') + 0.5 ? HUGX : L === 'end' && t > SP.moral.t - 0.6 ? X.mum - 90 : X.mum; }
function mumState(t, L) { const g = G.hismum, e = k => ev(L, k), st = { ...base(g, t, 'hismum'), mood: 'happy', turn: -0.25, look: -0.7 };
  if (L === 'hook') { if (t < hev('freeze') + 0.5) { const dx = X.her - HUGX; st.armL = reach(g, -1, dx - G.her.sw * 0.6, g.ySh + 120, { planar: true }); st.armR = reach(g, 1, dx + G.her.sw * 0.4, g.ySh + 230, { planar: true }); st.mood = 'happy'; st.laugh = !speaking('hook_m', t); st.blink = 1; st.tilt = -0.12; st.headY = Math.sin(t * 8) * 4; st.turn = -0.35; st.look = -0.8; }
    else { st.armL = chest(g, -1, 0.2, 230); st.armR = chest(g, 1, 0.2, 240); st.mood = 'happy'; st.blink = 1; st.turn = -0.2; st.look = -0.5; st.headY = Math.sin(t * 5) * 3; } }
  if (L === 'o1') { st.mood = 'happy';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (speaking('o1_m', t, 0, 0.1)) { st.mood = 'happy'; gest(st, g, 'hismum', t, 1, 140); }
    if (t > e('size') - 0.15) { const k = eOut(P(t, e('size') - 0.15, e('size') + 0.15)), sq = eIO(P(t, e('short'), e('short') + 0.35)), w = lerp(g.sw * 1.9, g.sw * 0.38, sq);
      st.armL = reach(g, -1, -lerp(g.sw, w, k), g.ySh + 180, { planar: true }); st.armR = reach(g, 1, lerp(g.sw, w, k), g.ySh + 180, { planar: true }); st.mood = t > e('short') ? 'smug' : 'happy'; st.look = t > e('short') ? -0.3 : -0.7; }
    if (t > e('twitch')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.o2_m.t - 0.05) { holdFront(g, st, c => plates(c, 9, 0, t), 320, 0.55); st.mood = 'happy'; st.laugh = !speaking('o2_m', t) || t < SP.o2_m.t + 0.4; st.headY = Math.sin(t * 12) * 4 * (t < SP.o2_m.t + 0.5 ? 1 : 0); }
    if (t > e('load')) { const k = eOut(P(t, e('load'), e('load') + 0.25)); st.afterTorso = null; st.armL = reach(g, -1, -lerp(g.sw * 0.55, g.sw * 1.8, k), g.ySh + lerp(320, 230, k), { planar: true }); st.armR = reach(g, 1, -lerp(-g.sw * 0.55, g.sw * 0.6, k), g.ySh + lerp(320, 200, k), { planar: true }); st.mood = 'happy'; st.laugh = true; st.blink = 1; }
    if (t > e('load') + 0.6) { st.armL = chest(g, -1, 0.2, 250); st.armR = chest(g, 1, 0.2, 260); } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'neutral'; st.blink = 0; }
    if (t > SP.o3_m.t - 0.05) { st.mood = 'worried'; st.headFirst = true; st.armR = reach(g, 1, g.hw * 0.15, g.headY + g.hh * 0.62, { planar: true }); st.armL = chest(g, -1, 0.3, 250); st.tilt = 0.06; st.headY = 6; }
    if (t > SP.o3_nar.t + 1.0) { st.headFirst = false; st.mood = 'happy'; st.tilt = 0; st.headY = 0; st.armL = chest(g, -1, 0.2, 230); st.armR = chest(g, 1, 0.2, 240); st.blink = 1; } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0.1, 0.1)) { st.mood = t > ev('o4', 'shine') ? 'surprised' : 'happy'; st.blink = 0; }
    if (t > e('scan')) { st.mood = 'skeptical'; st.headFirst = true; st.armR = chin(g, 1); st.armL = chest(g, -1, 0.3, 260); st.lookY = 0.45 * Math.sin((t - e('scan')) * 4.2); st.look = -0.4; }
    if (t > SP.o4_m.t + SP.o4_m.d * 0.5) { st.mood = 'happy'; st.lookY = 0; st.headFirst = false; st.armR = chest(g, 1, 0.2, 240); st.armL = chest(g, -1, 0.2, 230); }
    if (t > e('nod')) { st.headY = Math.abs(Math.sin((t - e('nod')) * 8)) * 12 * (t < e('nod') + 0.8 ? 1 : 0); st.blink = 1; st.mood = 'happy'; } }
  if (L === 'end') { st.mood = 'happy';
    if (t > ev('end', 'door')) { st.turn = -0.3; st.look = -0.9; }
    if (t > endOf('end_b') - 0.3) { st.turn = -0.25; st.look = -0.7; }
    if (winkOn(t, L)) { st.mood = 'happy'; st.squint = true; st.tilt = -0.1; }
    if (t > SP.end_m.t - 0.05) { holdFront(g, st, c => clipSmall(c, 1.1), 230, 0.4); st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 230, { planar: true }); }
    if (t > ev('end', 'clip') + 1.8) { st.afterTorso = null; st.armL = chest(g, -1, 0.2, 230); st.armR = chest(g, 1, 0.2, 240); }
    if (t > SP.moral.t - 0.6) { const dx = X.her - (X.mum - 90); st.armL = reach(g, -1, dx + G.her.sw * 0.5, g.ySh + 110, { planar: true }); st.armR = chest(g, 1, 0.2, 240); st.blink = 1; st.laugh = true; st.tilt = -0.08; } }
  return st; }
function willX(t, L) { if (L !== 'end') return -5000; return lerp(DOORX + 40, X.will, eOut(P(t, ev('end', 'walk'), ev('end', 'walk') + 0.65))); }
function willState(t, L) { const g = G.bf3, st = { ...base(g, t, 'bf3'), mood: 'happy', turn: 0.3, look: 0.8 };
  st.armL = down(g, -1); st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 420, { planar: true }); st.items = { R: keysItem(t) };
  if (speaking('end_b', t, 0.05, 0.1)) { st.armL = open(g, -1, 1.5, 150 + Math.sin(t * 6) * 12); st.mood = 'happy'; }
  if (t > SP.end_m.t + 0.4) { st.mood = 'surprised'; st.blink = 0; }
  if (t > SP.moral.t - 0.6) { st.mood = 'happy'; st.armL = open(g, -1, 1.6, 120); st.armR = open(g, 1, 1.6, 120); st.items = { R: keysItem(t) }; st.headY = Math.sin(t * 4) * 3; }
  return st; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'hismum'], cover: ['her', 'hismum'], two: ['her', 'hismum'], three: ['her', 'hismum', 'bf3'], her: ['her'], mum: ['hismum'], will: ['bf3'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function faceFx(c, hd, g, t, L, who) { if (!hd || Math.abs(hd.x) > 1e4) return; const hw = hd.hh * g.hw / g.hh;
  if (who === 'her') { const k = twitchK(t, L); if (k > 0) { c.save(); c.globalAlpha = k; c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.lineCap = 'round'; const x = hd.x + hw * 0.85, y = hd.y - hd.hh * 0.75, s = 1 + 0.12 * Math.sin(t * 30);
      for (const a of [0, 1, 2, 3]) { c.save(); c.translate(x, y); c.rotate(a * Math.PI / 2 + 0.4); c.scale(s, s); c.beginPath(); c.arc(hw * 0.2, hw * 0.2, hw * 0.13, Math.PI, Math.PI * 1.5); c.stroke(); c.restore(); } c.restore(); }
    const sk = shineK(t, L); if (sk > 0) for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + t * 1.5, u = (t * 1.2 + i / 6) % 1; c.save(); c.globalAlpha = sk * (1 - Math.abs(u - 0.5) * 1.6); star(c, hd.x + Math.cos(a) * hd.hh * 1.7, hd.y + Math.sin(a) * hd.hh * 1.5, 26 + 16 * Math.sin(u * Math.PI), i % 2 ? '#FFE15A' : '#FFFFFF', t * 2); c.restore(); } }
  if (who === 'hismum') { const b = blushK(t, L); if (b > 0) { c.save(); c.globalAlpha = 0.6 * b; c.fillStyle = '#F0607A'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hd.x + s * hw * 0.58, hd.y + hd.hh * 0.32, hw * 0.26, hd.hh * 0.11, 0, 0, TAU); c.fill(); } c.restore();
      c.save(); c.globalAlpha = b; c.strokeStyle = '#E0474C'; c.lineWidth = 6; for (let i = 0; i < 3; i++) { const x = hd.x - hw * (1.3 + i * 0.12), y = hd.y - hd.hh * (0.9 - i * 0.25); c.beginPath(); c.moveTo(x, y); c.lineTo(x - hw * 0.22, y - hd.hh * 0.06); c.stroke(); } c.restore(); }
    if (winkOn(t, L)) { const k = eBack(P(t, ev('end', 'wink'), ev('end', 'wink') + 0.25), 2.2); c.save(); c.globalAlpha = Math.min(1, k); star(c, hd.x - hw * 1.05, hd.y - hd.hh * 0.35, 34 * k, '#FFE15A', t * 3); c.restore(); }
    if (L === 'hook' && t < hev('freeze') + 0.5) for (let i = 0; i < 4; i++) { const u = ((t * 0.9 + i / 4) % 1), a = -Math.PI / 2 + (i - 1.5) * 0.6; c.save(); c.globalAlpha = 1 - u; heart(c, hd.x + Math.cos(a) * hd.hh * (1.3 + u), hd.y + Math.sin(a) * hd.hh * (1.2 + u * 1.2) + hd.hh * 0.5, 24 + 10 * u, i % 2 ? '#EE5E9A' : '#E0474C'); c.restore(); } } }
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  door(c, t, L);
  // the WILL & KATIE photo on the sideboard (laid face-down in o3 after the insert; stays up elsewhere)
  c.save(); c.translate(SBX - 60, -880); photoFrame(c, 1, L === 'o3' && t > ev('o3', 'flip') + 0.4 ? 1 : 0); c.restore(); K.mark(c, 'photo', SBX - 60, -1000, 160);
  const step = L === 'end' ? Math.abs(Math.sin((t - ev('end', 'walk')) * 9)) * 16 * (1 - P(t, ev('end', 'walk') + 0.55, ev('end', 'walk') + 0.7)) : 0;
  if (who.includes('bf3') && willIn(t, L)) heads.bf3 = K.put(c, WILL, willState(t, L), willX(t, L), -step);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  if (who.includes('hismum')) heads.hismum = K.put(c, MUM, mumState(t, L), mumX(t, L), 0);
  faceFx(c, heads.her, G.her, t, L, 'her'); faceFx(c, heads.hismum, G.hismum, t, L, 'hismum');
  // o2: the plate stack flies from mum's hands into Anna's arms
  if (L === 'o2' && t > ev('o2', 'load') && t < ev('o2', 'load') + 0.2) { const k = eIO(P(t, ev('o2', 'load'), ev('o2', 'load') + 0.2)), x = lerp(mumX(t, L) - 40, X.her + 10, k), y = lerp(-860, -830, k) - Math.sin(k * Math.PI) * 120; c.save(); c.translate(x, y); c.rotate(-0.2 * Math.sin(k * Math.PI)); plates(c, 9, 0.5, t); c.restore(); }
  if (!heads.her) heads.her = OFFL; if (!heads.hismum) heads.hismum = OFF; if (!heads.bf3) heads.bf3 = OFFL;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S((X.her + HUGX) / 2 + 10, fy(HY('her'), 0.8, 1110), 0.8, 'cover'), WIDE: S(15, fy(HY('her'), 0.56, 860), 0.56, 'wide'), TWO: S(15, fy(HY('her'), 0.76, 900), 0.76, 'two'),
  HER: S(X.her + 40, fy(HY('her'), 1.0), 1.0, 'her'), HER_CU: S(X.her + 20, fy(HY('her'), 1.35, 960), 1.35, 'her'), HER_R: S(X.her + 30, fy(HY('her'), 1.12, 740), 1.12, 'her'),
  MUM: S(X.mum - 30, fy(HY('hismum'), 1.0), 1.0, 'mum'), MUM_CU: S(X.mum - 20, fy(HY('hismum'), 1.3, 960), 1.3, 'mum'), HUG_MUM: S(HUGX - 20, fy(HY('hismum'), 1.0), 1.0, 'mum'),
  WILL: S(X.will + 40, fy(HY('bf3'), 1.0), 1.0, 'will'), DOOR: S(-640, fy(HY('her'), 0.5, 860), 0.5, 'three'), THREE: S(-300, fy(HY('her'), 0.58, 880), 0.58, 'three'),
  PHOTO: U('photo', 1), DOWN: U('down', 2), CLIP: U('clip', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('freeze') - 0.02) return SH.COVER; if (t < hev('nar') + 1.1) return f(SH.HER_CU); if (t < hev('photo') - 0.02) return f(SH.HUG_MUM); if (t < hev('wide') - 0.02) return f(SH.PHOTO); return f(SH.TWO); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.13) return f(SH.WIDE); if (t < SP.o1_m.t - 0.13) return f(SH.HER); if (t < e('twitch') - 0.02) return f(SH.MUM); return f(SH.HER_CU); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.13) return f(SH.WIDE); if (t < SP.o2_m.t - 0.13) return f(SH.HER); if (t < e('load') - 0.02) return f(SH.MUM); if (t < SP.o2_nar.t + 0.2) return f(SH.TWO); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.13) return f(SH.WIDE); if (t < SP.o3_m.t - 0.13) return f(SH.HER); if (t < e('flip') - 0.02) return f(SH.MUM); if (t < SP.o3_nar.t + 1.0) return f(SH.DOWN); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.13) return f(SH.WIDE); if (t < SP.o4_m.t - 0.13) return f(SH.HER); if (t < e('nod') - 0.02) return f(SH.MUM_CU); return f(SH.TWO); }
  if (L === 'end') { if (t < SP.end_b.t - 0.13) return f(SH.DOOR); if (t < e('wink') - 0.02) return f(SH.WILL); if (t < e('clip') - 0.02) return f(SH.MUM_CU); if (t < e('gasp') - 0.02) return f(SH.CLIP); if (t < SP.moral.t + 0.5) return f(SH.HER_CU); return f(SH.THREE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'stamp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id });
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// the big framed photo WILL & KATIE (real rigs inside the frame); (cx, cy) = frame centre
function bigPhoto(c, t, cx, cy, s, rot) { c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -340 + 16, -430 + 22, 680, 860, 20); c.fill();
  paint(c, q => { q.m(-340, -430); q.l(340, -430); q.l(340, 430); q.l(-340, 430); q.z(); }, '#C9973E', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#F7EEDC'; c.fillRect(-290, -380, 580, 760);
  c.save(); c.beginPath(); c.rect(-260, -350, 520, 560); c.clip(); const g = c.createLinearGradient(0, -350, 0, 210); g.addColorStop(0, '#7EC3F0'); g.addColorStop(1, '#D9EFFA'); c.fillStyle = g; c.fillRect(-260, -350, 520, 560);
  c.fillStyle = '#7CC27A'; c.beginPath(); c.ellipse(0, 260, 420, 160, 0, 0, TAU); c.fill();
  const gk = geom(KATIE), gw = geom(WILL); c.save(); c.translate(0, 600); c.scale(0.42, 0.42);
  K.put(c, WILL, { t, mood: 'happy', laugh: true, turn: 0.2, look: 0.5, blink: 1, armL: down(gw, -1), armR: reach(gw, 1, gw.sw * 1.6, gw.ySh + 160, { planar: true }), items: {} }, -230, 0);
  K.put(c, KATIE, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.5, blink: 1, armL: reach(gk, -1, -gk.sw * 1.4, gk.ySh + 180, { planar: true }), armR: down(gk, 1), items: {} }, 230, 0); c.restore();
  heart(c, 0, -250, 46 + 4 * Math.sin(t * 6), '#E0474C'); c.restore();
  fitTxt(c, 'WILL & KATIE', 0, 300, 70, '#B5434E', 520); c.restore(); }
function photoView(c, t) { backdrop(c, t, '#F7D9C4', '#E3A88A', 'photo'); const t0 = hev('photo'), k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
  bigPhoto(c, t, 540, 930, 1.05 * k, -0.05); }
// o3: the photo on the sideboard is pressed face-down by mum's hand
function downView(c, t) { backdrop(c, t, '#E9D3B6', '#C49A6A', 'down'); const t0 = ev('o3', 'flip'), u = t - t0;
  c.fillStyle = '#8A5A36'; c.fillRect(0, 1360, W, 600); c.fillStyle = '#6E4428'; c.fillRect(0, 1340, W, 50);
  const fall = eIn(clamp((u - 0.25) / 0.2));
  if (fall < 1) { c.save(); c.translate(540, 1345); c.scale(1, 1 - fall * 0.92); c.translate(0, -470); bigPhoto(c, t, 0, 0, 1.0, 0); c.restore(); }
  else { c.fillStyle = '#7A4A2A'; rr(c, 540 - 360, 1290, 720, 56, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 6; i++) { const a = (i / 5) * Math.PI, r = 120 + clamp((u - 0.45) / 0.4) * 160; c.globalAlpha = 1 - clamp((u - 0.45) / 0.6); c.beginPath(); c.arc(540 + Math.cos(a) * (360 + r * 0.3) * (i % 2 ? 1 : -1), 1300 - Math.sin(a) * 40, 26, 0, TAU); c.fill(); } c.globalAlpha = 1; }
  // mum's hand (pink cardigan sleeve) comes down from the top right
  const hk = eOut(clamp(u / 0.25)), hy = lerp(-200, fall < 1 ? 520 + fall * 700 : 1180, hk) - (u > 0.9 ? eIn(clamp((u - 0.9) / 0.3)) * 900 : 0);
  c.save(); c.translate(760, hy); c.rotate(-0.35); paint(c, q => { q.m(-70, -900); q.l(70, -900); q.l(80, 0); q.l(-80, 0); q.z(); }, '#D2557F', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#F7E6EC'; rr(c, -90, -40, 180, 60, 20); c.fill();
  c.fillStyle = '#F4D0B8'; c.beginPath(); c.ellipse(0, 70, 95, 80, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(-80, 40, 34, 50, -0.5, 0, TAU); c.fill(); c.restore(); }
// twist: mum's clipboard GIRLFRIEND TEST (English): last tick + PASSED stamp
function clipView(c, t) { backdrop(c, t, '#CFE6D8', '#7FB49A', 'clip'); const t0 = ev('end', 'clip'), k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 940); c.scale(k, k); c.rotate(-0.04);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -380 + 18, -520 + 24, 760, 1040, 30); c.fill();
  paint(c, q => { q.m(-380, -520); q.l(380, -520); q.l(380, 520); q.l(-380, 520); q.z(); }, '#B07A44', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#FFFFFF'; c.fillRect(-330, -450, 660, 920);
  c.fillStyle = '#9AA0A8'; rr(c, -150, -560, 300, 110, 20); c.fill(); c.fillStyle = '#C9CED6'; rr(c, -110, -530, 220, 50, 14); c.fill();
  fitTxt(c, 'GIRLFRIEND TEST', 0, -360, 64, '#2B2F3A', 600); c.fillStyle = '#2B2F3A'; c.fillRect(-280, -315, 560, 6);
  const rows = ['Brings flowers', 'Wrong-name test', 'Sense of humour'], ticked = [true, false, true];
  rows.forEach((r, i) => { const y = -210 + i * 140; c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.strokeRect(-280, y - 36, 72, 72); fitTxt(c, r, -180, y, 50, '#2B2F3A', 460, 'Nun9', 'left');
    if (ticked[i]) tick(c, -244, y, 1.3, '#4CAF6A', 1); else tick(c, -244, y, 1.3, '#4CAF6A', clamp((t - ev('end', 'tick')) / 0.25)); });
  // the pen that makes the last tick
  const pk = clamp((t - ev('end', 'tick') + 0.3) / 0.3) * (1 - clamp((t - ev('end', 'tick') - 0.4) / 0.25)); if (pk > 0) { c.save(); c.translate(-230 + clamp((t - ev('end', 'tick')) / 0.25) * 40, -70 - 60 * (1 - pk)); c.rotate(0.6); c.fillStyle = '#3A6AB8'; rr(c, -14, -230, 28, 230, 10); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(0, 30); c.fill(); c.restore(); }
  const sk = eBack(clamp((t - ev('end', 'stamp')) / 0.2), 2.6); if (sk > 0) { const s2 = lerp(2.2, 1, Math.min(1, sk)); c.save(); c.translate(40, 300); c.rotate(-0.22); c.scale(s2, s2); c.globalAlpha = Math.min(1, sk);
    c.strokeStyle = '#D8383E'; c.lineWidth = 14; rr(c, -250, -85, 500, 170, 24); c.stroke(); fitTxt(c, 'PASSED', 0, 6, 120, '#D8383E', 440); c.restore(); }
  c.restore(); }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, hev('photo') - 0.25, hev('photo') - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 420); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -440 + 8, -130 + 12, 880, 260, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -440, -130, 880, 260, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-330, 125); c.lineTo(-290, 173); c.lineTo(-270, 125); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -440, -130, 880, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -400, -113, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-392, -83); c.lineTo(-396, -67); c.lineTo(-376, -81); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -335, -95, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'мама парня назвала меня', 0, -4, 50, '#1E2030', 820, 'Unb9'); fitTxt(c, 'именем бывшей. Что сказать?', 0, 66, 50, '#1E2030', 820, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 290, w: 880, h: 260, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD8'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: «КАКОЙ ОТВЕТ ТВОЙ?», 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // Anna + his mum (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.hismum;
    K.put(c, MUM, { t, mood: 'happy', laugh: true, squint: true, turn: -0.2, look: -0.5, armL: reach(gm, -1, -gm.sw * 0.6, gm.ySh + 250, { planar: true }), armR: reach(gm, 1, gm.sw * 0.6, gm.ySh + 250, { planar: true }), afterTorso: (cc, gg) => { cc.save(); cc.translate(0, gg.ySh + 240); clipSmall(cc, 1.1); cc.restore(); } }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 300) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', "It's Anna.", '#E0474C', 'один'], ['2', 'С ЮМОРОМ', 'Then Katie can do the dishes.', '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', "It's Anna, actually — easy mix-up!", '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', "I'm Anna — the upgrade.", '#8E5BD8', 'четыре']];
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
  if (tag.startsWith('ui:')) { if (tag === 'ui:photo') photoView(c, t); else if (tag === 'ui:down') downView(c, t); else clipView(c, t); heads = { her: OFFL, hismum: OFF, bf3: OFFL }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { hismum: ['HIS MUM', '#C2456F'], bf3: ['WILL', '#5E7F4A'] };
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { hook_m: -0.2, o1_h: -0.22, o1_m: -0.2, o2_h: -0.22, o2_m: -0.2, o3_h: -0.22, o3_m: -0.2, o4_h: -0.22, o4_m: -0.15, end_b: -0.22, end_m: -0.15 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('wrongname', NF, renderFrame);
