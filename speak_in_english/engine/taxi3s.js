// "Успей за 3 секунды: такси" — rubric quick3s (hook + 6 rounds: Russian phrase + 3 s timer -> the English answer (tip voice) -> a silent gag), hard_cut camera.
// node taxi3s.js start end out.mp4 | --png=f1,f2
// A New York yellow cab, side cutaway: driver Ray (flat cap) in front, the heroine on the back seat. Absurd detail: on the dashboard, instead of a nodding dog,
// a nodding granny figurine with a pie — on every timer it nods faster. The street scrolls behind the windows.
// r1 "I'm running late." mascara on the go, the cab hits a bump -> the lash line goes up to her eyebrow.
// r2 "Can I open the window?" the window rolls down, a pigeon flies in and calmly sits next to her (stays for the rest of the ride).
// r3 "Buckle up." Ray's stern eyes in the mirror; she buckles up, the pigeon too (a tiny belt).
// r4 "Could you go a bit faster?" Ray pulls on racing gloves, the cab roars off — and a granny on a bike with a basket of courgettes overtakes it.
// r5 "You can let me out here." the cab stops right in the middle of a huge puddle; her white sneakers.
// r6 "Keep the change." Ray solemnly, with both hands, puts one tiny coin into his wallet.
// Twist (music silent): she runs through the puddle to the office — locked, dark; Ray lowers the window: "Miss... it's Saturday." The pigeon shakes its head. "...Can you drive me back?"
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/taxi3s/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const RN = L => /^r[1-6]$/.test(L) ? +L[1] : 0;

// ---------------- cast
const HER = { ...BASE.her_lift };
const RAY = { ...BASE.del, top: { type: 'sweater', col: '#4E6A58' } };
const NANA = { ...BASE.nana, top: { type: 'sweater', col: '#7CB0D8' } };
const G = { her: geom(HER), ray: geom(RAY), nana: geom(NANA) };
// world: road y = 0, the cab (side cutaway, driving LEFT) centred at x = 0
const SILL = -900, ROOF = -1660, RAYX = -380, HERX = 470, PIGX = 840;
const RAYY = -1350 - G.ray.headY, HERY = -1330 - G.her.headY;        // seated: feet pushed down so the heads sit under the roof
const DASHX = -820, MIRX = -720, MIRY = -1520;

// ---------------- speed of the cab -> street scroll X(t) (objects outside move +x as the cab drives left)
const vAt = t => { const L = sceneAt(t).id;
  if (L === 'r4' && t > ev('r4', 'ext')) return 2600;
  if (L === 'r5') { const b = ev('r5', 'brake'); return t < b ? 700 : 700 * (1 - eOut(clamp((t - b) / 0.7))); }
  if (L === 'r6' || L === 'end') return 0;
  return 700; };
const XS = [0]; for (let f = 1; f <= NF + 2; f++) XS[f] = XS[f - 1] + vAt((f - 0.5) / FPS) / FPS;
const Xat = t => { const f = clamp(t * FPS, 0, NF + 1), i = Math.floor(f); return lerp(XS[i], XS[i + 1], f - i); };
const XSTOP = Xat(ev('r5', 'brake') + 0.75);

// ---------------- street background strip (prerendered, tiled, blurred a little)
const SW = 6400, SY0 = -3800, SH_ = 6600, BS = 0.5;
function drawStreet(c) {
  const g = c.createLinearGradient(0, SY0, 0, -400); g.addColorStop(0, '#9FD0EE'); g.addColorStop(1, '#DCEFF8'); c.fillStyle = g; c.fillRect(0, SY0, SW, SH_);
  // far skyscrapers
  c.fillStyle = '#B9C8D6'; for (let i = 0; i < 9; i++) { const x = i * 720 + 80, w = 380 + (i % 3) * 90, h = 2300 + (i * 397 % 900); c.fillRect(x, -400 - h, w, h); }
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 9; i++) { const x = i * 720 + 80, w = 380 + (i % 3) * 90, h = 2300 + (i * 397 % 900); for (let yy = -400 - h + 60; yy < -500; yy += 110) c.fillRect(x + 30, yy, w - 60, 30); }
  // brownstones / brick blocks with fire escapes
  const cols = ['#B5654A', '#C98B5A', '#9C5A44', '#D9A066', '#A8634E', '#C47A52', '#8E5040', '#D39A6A'];
  for (let i = 0; i < 8; i++) { const x = i * 800, w = 800, h = 1500 + (i % 3) * 260, top = -300 - h; c.fillStyle = cols[i]; c.fillRect(x, top, w, h);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x, top, w, 50); c.fillRect(x + w - 16, top, 16, h);
    for (let r = 0; r < Math.floor((h - 520) / 260); r++) for (let k = 0; k < 4; k++) { const wx = x + 70 + k * 180, wy = top + 120 + r * 260; c.fillStyle = '#F4EAD8'; c.fillRect(wx - 10, wy - 10, 120, 170); c.fillStyle = (r + k + i) % 3 ? '#5A7590' : '#F2D58A'; c.fillRect(wx, wy, 100, 150); c.fillStyle = '#F4EAD8'; c.fillRect(wx + 46, wy, 8, 150); }
    if (i % 2 === 0) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 8; for (let r = 0; r < Math.floor((h - 520) / 260); r++) { const yy = top + 300 + r * 260; c.beginPath(); c.moveTo(x + 230, yy); c.lineTo(x + 590, yy); c.stroke(); c.beginPath(); c.moveTo(x + 250, yy); c.lineTo(x + 570, yy - 240); c.stroke(); for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(x + 230 + k * 45, yy); c.lineTo(x + 230 + k * 45, yy - 60); c.stroke(); } } }
    // shop awning + sign on the ground floor
    const aw = ['#2E8A4E', '#E0474C', '#2E5E9A', '#E9A23B'][i % 4], txt = ['DELI', 'PIZZA', 'BAGELS', 'FLOWERS', 'COFFEE', 'SHOES', 'BOOKS', 'DINER'][i];
    c.fillStyle = '#2B2F3A'; c.fillRect(x + 60, -700, 680, 400); c.fillStyle = '#F2D58A'; c.fillRect(x + 90, -670, 300, 340); c.fillStyle = '#7A8A9A'; c.fillRect(x + 430, -670, 280, 370);
    c.fillStyle = aw; c.beginPath(); c.moveTo(x + 40, -820); c.lineTo(x + 760, -820); c.lineTo(x + 800, -700); c.lineTo(x, -700); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)'; for (let k = 0; k < 9; k++) c.fillRect(x + 40 + k * 85, -820, 36, 120);
    c.fillStyle = '#2B2F3A'; rr(c, x + 200, -950, 400, 110, 14); c.fill(); fitTxt(c, txt, x + 400, -895, 76, '#F7F2E8', 360); }
  // street furniture: lamp posts, a green street sign, a bank thermometer (°F), a hydrant
  for (let k = 0; k < 4; k++) { const x = 400 + k * 1600; c.fillStyle = '#3A4A3A'; c.fillRect(x - 14, -1500, 28, 1220); c.fillRect(x - 14, -1500, 160, 22); c.fillStyle = '#F2E8B0'; c.beginPath(); c.ellipse(x + 150, -1470, 46, 26, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#2E7A4E'; rr(c, 330, -1340, 360, 90, 10); c.fill(); fitTxt(c, 'BROADWAY', 510, -1295, 56, '#FFFFFF', 330); c.fillStyle = '#2E7A4E'; rr(c, 1930, -1340, 360, 90, 10); c.fill(); fitTxt(c, 'W 42 ST', 2110, -1295, 56, '#FFFFFF', 330);
  c.fillStyle = '#1E2128'; rr(c, 3540, -1420, 300, 150, 14); c.fill(); fitTxt(c, '72°F', 3690, -1345, 90, '#FF7A3A', 260);
  c.fillStyle = '#D9373C'; rr(c, 5200, -420, 70, 130, 16); c.fill(); rr(c, 5180, -440, 110, 40, 12); c.fill();
  // sidewalk + curb + road
  c.fillStyle = '#C9C4BA'; c.fillRect(0, -300, SW, 190); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < SW; x += 200) c.fillRect(x, -300, 6, 190);
  c.fillStyle = '#9A958C'; c.fillRect(0, -110, SW, 40);
  c.fillStyle = '#4A4E58'; c.fillRect(0, -70, SW, 1500);
  c.fillStyle = '#9A958C'; c.fillRect(0, 1400, SW, 50); c.fillStyle = '#C9C4BA'; c.fillRect(0, 1450, SW, 1400); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < SW; x += 300) c.fillRect(x, 1450, 8, 1400);
  c.fillStyle = '#D9373C'; for (const x of [900, 4100]) { rr(c, x, 1250, 90, 190, 20); c.fill(); rr(c, x - 25, 1225, 140, 50, 14); c.fill(); }
  c.fillStyle = '#3A4A3A'; for (const x of [2500, 5600]) { c.fillRect(x, 1480, 80, 900); c.fillStyle = '#2E7A4E'; c.beginPath(); c.arc(x + 40, 1480, 260, 0, TAU); c.fill(); c.fillStyle = '#3A4A3A'; }
  c.fillStyle = '#F2C14E'; for (const yy of [-40, -18]) c.fillRect(0, yy, SW, 10);
  c.fillStyle = '#F7F2E8'; for (let x = 0; x < SW; x += 640) c.fillRect(x, 470, 320, 26);
}
const STREET = (() => { const a = createCanvas(Math.round(SW * BS), Math.round(SH_ * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(0, -SY0); drawStreet(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.6px)'; d.drawImage(a, 0, 0); return b; })();
function street(c, t, x0 = -9000, x1 = 9000) { const off = ((Xat(t) % SW) + SW) % SW; for (let x = Math.floor((x0 - off) / SW) * SW + off; x < x1; x += SW) c.drawImage(STREET, x, SY0, SW, SH_); }

// ---------------- props
function figurine(c, x, y, t, speed, s = 1) {   // nodding granny with a pie, on a spring (dashboard)
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#2B2F3A'; rr(c, -60, -20, 120, 24, 8); c.fill();
  c.strokeStyle = '#C9D2DA'; c.lineWidth = 6; c.beginPath(); for (let i = 0; i <= 12; i++) c.lineTo(Math.sin(i * 1.6) * 16, -20 - i * 3); c.stroke();
  paint(c, q => { q.m(-48, -50); q.q(-50, -150, 0, -150); q.q(50, -150, 48, -50); q.z(); }, '#C2504A', { sd: 3, hd: 1, lw: 3 });
  c.fillStyle = '#F7F2E8'; rr(c, -30, -110, 60, 50, 8); c.fill();
  c.fillStyle = '#C98B5A'; c.beginPath(); c.ellipse(34, -100, 26, 15, -0.3, 0, TAU); c.fill(); c.strokeStyle = '#9C6238'; c.lineWidth = 3; c.stroke();   // the pie
  c.fillStyle = '#F2CDB8'; c.beginPath(); c.arc(28, -96, 11, 0, TAU); c.fill();
  const a = Math.sin(t * speed) * 0.32; c.save(); c.translate(0, -150); c.rotate(a * 0.4); c.translate(0, -8 + Math.max(0, Math.sin(t * speed)) * 10);
  c.strokeStyle = '#C9D2DA'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 12); c.lineTo(0, -6); c.stroke();
  c.save(); c.rotate(a); c.fillStyle = '#F2CDB8'; c.beginPath(); c.arc(0, -40, 42, 0, TAU); c.fill(); c.strokeStyle = '#2B2F1C'; c.lineWidth = 3; c.stroke();
  c.fillStyle = '#D9D4DA'; c.beginPath(); c.arc(0, -84, 22, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, -70, 44, 18, 0, Math.PI, TAU); c.fill();
  c.strokeStyle = '#9A6A4A'; c.lineWidth = 3; for (const dx of [-15, 15]) { c.beginPath(); c.arc(dx, -40, 11, 0, TAU); c.stroke(); } c.fillStyle = '#2B2F1C'; for (const dx of [-15, 15]) { c.beginPath(); c.arc(dx, -40, 4, 0, TAU); c.fill(); }
  c.strokeStyle = '#C0506E'; c.lineWidth = 4; c.beginPath(); c.arc(0, -22, 12, 0.2, Math.PI - 0.2); c.stroke(); c.fillStyle = 'rgba(240,154,170,.6)'; for (const dx of [-26, 26]) { c.beginPath(); c.arc(dx, -26, 8, 0, TAU); c.fill(); }
  c.restore(); c.restore(); c.restore(); }
const nodSpeed = t => { const L = sceneAt(t).id, n = RN(L); if (n && t < ev(L, 'up')) return 7 + n * 3.2; return 6; };
function meter(c, x, y, t) { c.fillStyle = '#1E2128'; rr(c, x - 110, y - 70, 220, 70, 10); c.fill(); fitTxt(c, '$' + (8.5 + Math.floor(Xat(t) / 400) * 0.5).toFixed(2), x, y - 34, 44, '#FF4A3A', 190, 'Unb9'); }
function pigeon(c, x, y, t, o = {}) {   // (x,y) = feet; o: s, shake, belt, fly (0..1 wings flapping), turn
  const s = o.s || 1, bob = o.fly ? 0 : Math.max(0, Math.sin(t * 2.2)) * 6; c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s);
  c.strokeStyle = '#E8875A'; c.lineWidth = 7; c.lineCap = 'round'; if (!o.fly) for (const dx of [-14, 14]) { c.beginPath(); c.moveTo(dx, -40); c.lineTo(dx, 0); c.moveTo(dx - 14, 0); c.lineTo(dx + 14, 0); c.stroke(); }
  paint(c, q => { q.m(-70, -60); q.q(-40, -150, 30, -140); q.q(90, -120, 80, -60); q.q(60, -20, -10, -30); q.q(-60, -30, -110, -40); q.z(); }, '#9AA3B2', { sd: 3, hd: 1, lw: 4 });
  const fl = o.fly ? Math.sin(t * 30) : 0; c.save(); c.translate(0, -100); c.rotate(-0.2 + fl * 0.9); paint(c, q => { q.m(-60, 0); q.q(-10, -30, 60, 0); q.q(10, 40, -60, 0); q.z(); }, '#7A8494', { sd: 2, hd: 1, lw: 3 }); c.fillStyle = '#4A5260'; c.fillRect(-40, -4, 12, 8); c.fillRect(-20, -4, 12, 8); c.restore();
  c.fillStyle = '#5A6A6A'; c.beginPath(); c.ellipse(-110, -40, 30, 16, 0.3, 0, TAU); c.fill();
  if (o.belt) { const k = clamp(o.belt); c.save(); c.globalAlpha = k; c.strokeStyle = '#3A3F4C'; c.lineWidth = 12; c.beginPath(); c.moveTo(-40, -140); c.lineTo(50, -40); c.stroke(); c.fillStyle = '#C9D2DA'; rr(c, 0, -100, 26, 20, 4); c.fill(); c.restore(); }
  const sh = o.shake ? Math.sin(t * 16) * 0.35 * o.shake : 0; c.save(); c.translate(70, -140 - bob); c.rotate(sh);
  c.fillStyle = '#7A6AA0'; c.beginPath(); c.ellipse(-6, 22, 34, 26, 0, 0, TAU); c.fill(); c.fillStyle = '#5AA088'; c.beginPath(); c.ellipse(-2, 30, 30, 14, 0, 0, TAU); c.fill();
  paint(c, q => q.e(0, -10, 38, 34), '#8A93A2', { sd: 2, hd: 1, lw: 3 });
  c.fillStyle = '#E8875A'; c.beginPath(); c.arc(16, -18, 11, 0, TAU); c.fill(); c.fillStyle = '#1E2128'; c.beginPath(); c.arc(17, -18, 6, 0, TAU); c.fill();
  c.fillStyle = '#F7F2E8'; c.beginPath(); c.ellipse(38, -10, 9, 6, 0, 0, TAU); c.fill(); c.fillStyle = '#3A3F4C'; c.beginPath(); c.moveTo(38, -6); c.lineTo(66, 0); c.lineTo(38, 4); c.closePath(); c.fill();
  c.restore(); c.restore(); }

// ---------------- characters
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const lap = (g, s) => reach(g, s, s * g.sw * 0.55, g.ySh + 470, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: lap(g, -1), armR: lap(g, 1), items: {}, legs: false, floorShadow: false });
const coffeeItem = ctx => { ctx.save(); ctx.translate(0, 20); ctx.fillStyle = '#FFFDF8'; ctx.beginPath(); ctx.moveTo(-34, -120); ctx.lineTo(34, -120); ctx.lineTo(26, 20); ctx.lineTo(-26, 20); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#B9B2A8'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#C98B5A'; ctx.fillRect(-31, -80, 62, 40); ctx.fillStyle = '#3A3F4C'; rr(ctx, -40, -138, 80, 22, 6); ctx.fill(); ctx.restore(); };
const brushItem = ctx => { ctx.save(); ctx.rotate(-0.5); ctx.fillStyle = '#EE5E9A'; rr(ctx, -12, -20, 24, 110, 10); ctx.fill(); ctx.fillStyle = '#F7B6CF'; rr(ctx, -34, -130, 68, 120, 26); ctx.fill(); ctx.fillStyle = '#C23C76'; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(-18 + j * 18, -112 + i * 26, 5, 0, TAU); ctx.fill(); } ctx.restore(); };
const mascaraItem = ctx => { ctx.save(); ctx.rotate(-0.9); ctx.fillStyle = '#2B2F3A'; rr(ctx, -9, -10, 18, 80, 6); ctx.fill(); ctx.fillStyle = '#C23C76'; rr(ctx, -10, 40, 20, 50, 6); ctx.fill(); ctx.fillStyle = '#1E2128'; ctx.fillRect(-3, -60, 6, 52); rr(ctx, -8, -86, 16, 34, 6); ctx.fill(); ctx.restore(); };
const gloveItem = col => ctx => { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 6, 56, 50, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#2B2F1C'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-50, -12, 100, 12); ctx.fillStyle = '#1E2128'; rr(ctx, -56, -60, 112, 30, 8); ctx.fill(); ctx.restore(); };
const coinItem = (t, k = 1) => ctx => { ctx.save(); ctx.translate(-30, -40); const g = 0.6 + 0.4 * Math.sin(t * 9); ctx.fillStyle = `rgba(255,230,120,${0.35 * g})`; ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.fill(); ctx.fillStyle = '#E9B43B'; ctx.beginPath(); ctx.arc(0, 0, 22 * k, 0, TAU); ctx.fill(); ctx.strokeStyle = '#9C6A18'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); };
const walletItem = ctx => { ctx.save(); ctx.translate(20, -30); ctx.fillStyle = '#6A4A32'; rr(ctx, -80, -50, 160, 100, 14); ctx.fill(); ctx.strokeStyle = '#3A2818'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#8A6448'; rr(ctx, -80, -50, 160, 40, 12); ctx.fill(); ctx.restore(); };
function cap(c, hd, turn = 0) { const s = hd.hh / 160; c.save(); c.translate(hd.x + turn * 30 * s, hd.y - hd.hh * 0.62); c.scale(s, s);   // Ray's flat cap
  paint(c, q => { q.m(-150, 10); q.q(-160, -95, 0, -100); q.q(150, -95, 152, 10); q.z(); }, '#6A5A48', { sd: 3, hd: 1, lw: 4 });
  c.fillStyle = '#4E4234'; c.beginPath(); c.ellipse(turn * 90, 14, 165, 28, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 4; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 50, -80); c.lineTo(i * 55, 0); c.stroke(); } c.restore(); }
function herState(t, L) { const g = G.her, e = k => ev(L, k), n = RN(L), st = { ...base(g, t, 'her'), mood: 'neutral', turn: -0.15, look: -0.3 };
  if (L === 'hook') { st.mood = 'worried'; st.turn = -0.2; st.look = -0.6; const w = Math.sin(t * 6);
    st.armL = reach(g, -1, -g.sw * 1.55, g.ySh + 120 + w * 30, { planar: true }); st.items.L = coffeeItem; st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 60 - w * 30, { planar: true }); st.items.R = brushItem;
    if (t > hev('nar')) { st.mood = 'happy'; st.look = 0.1; } }
  if (n && t < e('ans')) { st.mood = 'worried'; st.look = 0.15; st.lookY = 0.3; st.armL = hold(g, -1, 380, 0.4); st.armR = hold(g, 1, 380, 0.4); }
  if (L === 'r1' && t >= e('ans')) { st.mood = 'neutral'; st.turn = 0; st.look = 0.15; st.tilt = 0.06; st.headFirst = true;
    const bump = t > e('bump'); st.armR = reach(g, 1, g.hw * 0.75 + (bump ? 10 : 0), g.headY - 10 + (bump ? -95 : Math.sin(t * 7) * 10), { planar: true }); st.items.R = mascaraItem; st.armL = hold(g, -1, 380, 0.4);
    if (bump) { st.mood = 'shock'; st.blink = 0; st.headY = -16 * Math.exp(-(t - e('bump')) * 8); }
    if (t > e('look')) { st.mood = 'tired'; st.tilt = 0; st.look = 0; st.armR = hold(g, 1, 300, 0.45); st.items.R = mascaraItem; st.headFirst = false; } }
  if (n >= 2 || L === 'score') { /* the pigeon is next to her from r2 on */ }
  if (L === 'r2' && t >= e('ans')) { st.mood = 'happy'; st.turn = 0.25; st.look = 0.8;
    if (t > e('win') && t < e('fly')) { st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 120, { planar: true }); }
    if (t > e('fly')) { st.mood = 'surprised'; st.blink = 0; st.look = 0.9; st.armL = open(g, -1, 1.6, 180); }
    if (t > e('land') + 0.25) { st.mood = 'skeptical'; st.look = 0.9; st.armL = lap(g, -1); } }
  if (L === 'r3' && t >= e('ans')) { st.mood = 'worried'; st.look = -0.6; st.turn = -0.2;
    if (t > e('back')) { st.armR = reach(g, 1, g.sw * 0.2, g.ySh + 420, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 20, { planar: true }); }
    if (t > e('click')) { st.mood = 'smug'; st.armL = lap(g, -1); st.armR = lap(g, 1); }
    if (t > e('pclick')) { st.mood = 'surprised'; st.look = 0.9; st.turn = 0.25; } }
  if (L === 'r4') { if (t >= e('ans')) { st.mood = 'surprised'; st.look = -0.7; } if (t > e('ext')) { st.mood = 'shock'; st.blink = 0; st.armL = open(g, -1, 1.7, 60); st.armR = open(g, 1, 1.7, 60); }
    if (t > e('passed') - 0.4) { st.mood = 'tired'; st.look = 0.5; st.armL = lap(g, -1); st.armR = lap(g, 1); } }
  if (L === 'r5' && t >= e('ans')) { st.mood = 'happy'; st.look = -0.4; if (t > e('splash')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.6; st.look = 0.4; } }
  if (L === 'r6' && t >= e('ans')) { st.mood = 'happy'; st.look = -0.7; st.turn = -0.25; st.armR = reach(g, 1, -g.sw * 0.6, g.ySh + 120, { planar: true });
    if (t > e('coin') + 0.6) { st.mood = 'skeptical'; st.armR = lap(g, 1); } }
  if (L === 'score') { st.mood = 'happy'; st.blink = Math.sin(t * 0.9) > 0.96 ? 1 : 0; st.look = 0.4; st.turn = 0.1; st.armL = open(g, -1, 1.5, 200 + Math.sin(t * 5) * 20); }
  if (n >= 3 && t > ev('r3', 'click') || L === 'score' || n > 3) st.belt = true;
  return st; }
function rayState(t, L) { const g = G.ray, e = k => ev(L, k), n = RN(L), drive = { turn: -0.45, look: -0.8, armL: reach(g, -1, -g.sw * 1.7, g.ySh + 300, { planar: true }), armR: reach(g, 1, -g.sw * 0.4, g.ySh + 330, { planar: true }) };
  let st = { ...base(g, t, 'rayd1'), mood: 'neutral', ...drive };
  if (L === 'hook') { st.turn = 0.55; st.look = 0.85; st.mood = 'skeptical'; st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 100, { planar: true });
    if (speaking('hook_r', t, 0.05, 0.1)) st.mood = 'neutral';
    if (t > endOf('hook_r') + 0.3) Object.assign(st, drive, { mood: 'neutral' }); }
  if (n && t < e('ans')) st.mood = 'tired';
  if (L === 'r3' && t >= e('ans')) { st.mood = 'angry'; st.turn = -0.1; st.look = 0.3; }
  if (L === 'r4' && t >= e('ans')) { const k = clamp((t - e('gloves')) / 0.9); st.mood = 'smug'; st.turn = 0; st.look = 0;
    st.armL = reach(g, -1, -g.sw * 0.9 + k * 140, g.ySh + 260 - Math.sin(k * Math.PI) * 60, { planar: true }); st.armR = reach(g, 1, g.sw * 0.9 - k * 140, g.ySh + 260 - Math.sin(k * Math.PI) * 60, { planar: true });
    if (t > e('gloves') + 0.3) { st.items.L = gloveItem('#E0474C'); } if (t > e('gloves') + 0.8) { st.items.R = gloveItem('#E0474C'); }
    if (t > e('ext') - 0.1) { Object.assign(st, drive, { mood: 'angry' }); st.items = { L: gloveItem('#E0474C'), R: gloveItem('#E0474C') }; } }
  if (L === 'r5' && t >= e('ans')) { st.mood = 'smug'; if (t > e('splash')) { st.turn = 0.45; st.look = 0.8; st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 140, { planar: true }); } }
  if (L === 'r6' && t >= e('ans')) { st.mood = 'neutral'; st.turn = 0; st.look = 0.2; st.blink = 1;
    st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 250, { planar: true }); st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 250, { planar: true }); st.items = { R: coinItem(t) };
    if (t > e('wallet') - 0.3) { st.blink = 0; st.mood = 'smug'; st.items = { L: walletItem, R: coinItem(t, 1 - clamp((t - e('wallet')) / 0.35)) }; }
    if (t > e('wallet') + 0.5) { st.mood = 'happy'; st.blink = 1; st.items = { L: walletItem }; } }
  if (L === 'score') { st.mood = 'happy'; }
  if (L === 'end') { Object.assign(st, { turn: 0.55, look: 0.9, mood: 'neutral', blink: 0, armL: lap(g, -1), armR: reach(g, 1, g.sw * 1.6, g.ySh + 200, { planar: true }) });
    if (speaking('end_r', t, 0.05, 0.1)) { st.mood = 'worried'; st.blink = t < SP.end_r.t + 0.5 ? 1 : 0; } }
  if (L === 'r4' && t > ev('r4', 'ans') || n > 4 || L === 'score' || L === 'end') { if (!st.items.L && L !== 'r6') st.items = { ...st.items, L: gloveItem('#E0474C') }; if (!st.items.R && L !== 'r6') st.items = { ...st.items, R: gloveItem('#E0474C') }; }
  return st; }
function belt(c, hd, g, x, y, k = 1) { c.save(); c.globalAlpha = k; c.strokeStyle = '#3A3F4C'; c.lineWidth = 34; c.lineCap = 'butt'; c.beginPath(); c.moveTo(x + g.sw * 0.9, y + g.ySh + 20); c.lineTo(x - g.sw * 0.7, y + g.ySh + 420); c.stroke(); c.fillStyle = '#C9D2DA'; rr(c, x - g.sw * 0.25 - 24, y + g.ySh + 250, 48, 34, 6); c.fill(); c.restore(); }

// ---------------- the cab (side cutaway, nose to the LEFT); cx = world x of its centre
const YEL = '#F6C23A', YELD = '#D9A21E';
function cabBack(c, t, cx, o = {}) {   // interior: far door panel, seat backs, dashboard + figurine + meter
  c.save(); c.translate(cx, 0);
  c.fillStyle = '#5A606E'; c.fillRect(-1150, SILL, 2350, 700);
  c.fillStyle = '#3A3F4C'; rr(c, 120, -1240, 280, 900, 40); c.fill(); rr(c, 960, -1300, 240, 1000, 40); c.fill();   // front seat back (behind Ray), back bench (behind her)
  c.fillStyle = '#2B2F3A'; rr(c, -1200, SILL - 150, 560, 170, 30); c.fill();   // dashboard
  figurine(c, DASHX, SILL - 150, t, nodSpeed(t), 1.4); meter(c, -660, SILL - 150, t);
  c.restore(); }
function cabFront(c, t, cx, o = {}) {   // near body: door panels, pillars, roof, TAXI sign, wheels, mirror, steering wheel
  c.save(); c.translate(cx, 0);
  const sp = o.speed ?? 0, rot = (o.X ?? 0) / 170;
  // steering wheel (behind the near door top)
  c.strokeStyle = '#1E2128'; c.lineWidth = 26; c.beginPath(); c.ellipse(RAYX - 170, -1010, 34, 140, -0.35, 0, TAU); c.stroke();
  // rear-view mirror
  c.fillStyle = '#2B2F3A'; c.fillRect(MIRX - 8, ROOF + 40, 16, 70); rr(c, MIRX - 110, MIRY - 40, 220, 80, 18); c.fill(); c.fillStyle = '#9FC3D8'; rr(c, MIRX - 96, MIRY - 28, 192, 56, 12); c.fill();
  // glass tint: windshield, front window, rear window (rear can roll down: o.win 0..1)
  c.fillStyle = 'rgba(190,225,245,.16)'; c.beginPath(); c.moveTo(-760, ROOF); c.lineTo(-1240, SILL); c.lineTo(-1120, SILL); c.lineTo(-700, ROOF + 40); c.closePath(); c.fill();
  c.fillStyle = 'rgba(190,225,245,.12)'; const fwTop = lerp(ROOF + 70, SILL, o.fwin || 0); c.fillRect(-640, fwTop, 690, SILL - fwTop);
  const rwTop = lerp(ROOF + 70, SILL, o.win || 0); c.fillRect(130, rwTop, 820, SILL - rwTop); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(130, rwTop, 820, 10); c.fillRect(-640, fwTop, 690, 10);
  // roof + pillars
  paint(c, q => { q.m(-790, ROOF - 40); q.q(0, ROOF - 110, 1000, ROOF - 40); q.l(1060, ROOF + 60); q.l(-720, ROOF + 60); q.z(); }, YEL, { sd: 6, hd: 2, lw: 5 });
  paint(c, q => { q.m(-760, ROOF); q.l(-700, ROOF + 20); q.l(-1170, SILL); q.l(-1260, SILL); q.z(); }, YEL, { sd: 4, hd: 2, lw: 5 });   // A-pillar
  paint(c, q => { q.m(50, ROOF + 40); q.l(130, ROOF + 40); q.l(130, SILL); q.l(50, SILL); q.z(); }, YEL, { sd: 4, hd: 2, lw: 5 });      // B-pillar
  paint(c, q => { q.m(950, ROOF + 40); q.l(1060, ROOF + 40); q.l(1330, SILL); q.l(1180, SILL); q.z(); }, YEL, { sd: 4, hd: 2, lw: 5 });   // C-pillar
  // TAXI roof sign
  c.fillStyle = '#FFF4C0'; rr(c, -230, ROOF - 250, 460, 150, 24); c.fill(); c.strokeStyle = '#2B2F1C'; c.lineWidth = 6; c.stroke(); fitTxt(c, 'TAXI', 0, ROOF - 172, 104, '#2B2F1C', 400);
  // body
  paint(c, q => { q.m(-1560, SILL + 120); q.q(-1500, SILL - 20, -1250, SILL - 10); q.l(1320, SILL - 10); q.q(1560, SILL, 1580, SILL + 140); q.l(1590, -260); q.q(1590, -170, 1500, -170); q.l(-1520, -170); q.q(-1600, -170, -1600, -260); q.z(); }, YEL, { sd: 10, hd: 4, lw: 6 });
  c.fillStyle = YELD; c.fillRect(-1540, -380, 3110, 26);
  // checker stripe + door text
  for (let i = 0; i < 40; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#1E2128' : '#FFFDF8'; c.fillRect(-1200 + i * 60, -560 + j * 40, 60, 40); }
  fitTxt(c, 'NYC TAXI', -260, -700, 110, '#1E2128', 600); fitTxt(c, '4K29', 620, -700, 90, '#1E2128', 300);
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 6; for (const x of [90, 1000]) { c.beginPath(); c.moveTo(x, SILL - 10); c.lineTo(x, -300); c.stroke(); }
  c.fillStyle = '#2B2F3A'; for (const x of [-60, 860]) rr(c, x, -820, 120, 26, 10), c.fill();
  // lights + bumpers
  c.fillStyle = '#FFF4C0'; rr(c, -1600, -480, 80, 90, 18); c.fill(); c.fillStyle = '#E0474C'; rr(c, 1520, -500, 70, 110, 16); c.fill();
  c.fillStyle = '#9AA3B2'; rr(c, -1650, -300, 260, 70, 30); c.fill(); rr(c, 1440, -300, 220, 70, 30); c.fill();
  // wheels
  for (const x of [-1030, 1050]) { c.fillStyle = '#3A3020'; c.beginPath(); c.arc(x, -170, 205, Math.PI, TAU); c.fill(); c.fillStyle = '#1E2128'; c.beginPath(); c.arc(x, -170, 170, 0, TAU); c.fill(); c.fillStyle = '#9AA3B2'; c.beginPath(); c.arc(x, -170, 90, 0, TAU); c.fill();
    c.strokeStyle = '#5A606E'; c.lineWidth = 12; for (let k = 0; k < 5; k++) { const a = -rot + k * TAU / 5; c.beginPath(); c.moveTo(x, -170); c.lineTo(x + Math.cos(a) * 85, -170 + Math.sin(a) * 85); c.stroke(); } }
  if (sp > 1500) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 14; c.lineCap = 'round'; for (let i = 0; i < 7; i++) { const y = -1500 + i * 210, x0 = 1650 + ((t * 2400 + i * 330) % 900); c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + 500, y); c.stroke(); } }
  c.restore(); }
function bike(c, t, x, y) {   // granny on a bicycle with a basket of courgettes; (x,y) = ground under the saddle; she rides LEFT
  const rot = t * 14; c.save(); c.translate(x, y); c.scale(1.6, 1.6);
  for (const wx of [-380, 380]) { c.strokeStyle = '#1E2128'; c.lineWidth = 16; c.beginPath(); c.arc(wx, -190, 180, 0, TAU); c.stroke(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 4; for (let k = 0; k < 8; k++) { const a = rot + k * TAU / 8; c.beginPath(); c.moveTo(wx, -190); c.lineTo(wx + Math.cos(a) * 170, -190 + Math.sin(a) * 170); c.stroke(); } }
  c.strokeStyle = '#3E8A6E'; c.lineWidth = 20; c.lineCap = 'round'; c.beginPath(); c.moveTo(380, -190); c.lineTo(60, -230); c.lineTo(-300, -520); c.moveTo(60, -230); c.lineTo(80, -560); c.lineTo(-300, -520); c.lineTo(-380, -190); c.moveTo(-300, -520); c.lineTo(-330, -700); c.stroke();
  c.fillStyle = '#2B2F3A'; rr(c, 0, -600, 170, 44, 18); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 14; c.beginPath(); c.moveTo(-400, -720); c.lineTo(-250, -700); c.stroke();
  // basket with courgettes (front)
  c.fillStyle = '#C98B5A'; c.beginPath(); c.moveTo(-560, -760); c.lineTo(-330, -760); c.lineTo(-360, -560); c.lineTo(-530, -560); c.closePath(); c.fill(); c.strokeStyle = '#9C6238'; c.lineWidth = 4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-555 + i * 8, -720 + i * 45); c.lineTo(-335 - i * 8, -720 + i * 45); c.stroke(); }
  for (const [dx, a] of [[-500, -0.6], [-460, -0.3], [-410, -0.8], [-380, -0.4]]) { c.save(); c.translate(dx, -790); c.rotate(a); c.fillStyle = '#4C8A3A'; rr(c, -24, -110, 48, 200, 22); c.fill(); c.fillStyle = '#7CB45A'; c.fillRect(-6, -100, 6, 180); c.restore(); }
  c.restore(); }
function nanaState(t) { const g = G.nana, ph = t * 14; return { t, talk: 0, mood: 'happy', turn: -0.4, look: -0.6, legPose: 'walk', armL: reach(g, -1, -g.sw * 1.6, g.ySh + 200, { planar: true }), armR: reach(g, 1, -g.sw * 0.4, g.ySh + 220, { planar: true }), items: {}, blink: 0, floorShadow: false, hairSway: 1 }; }

// ---------------- the world
const OX = 30000;   // the office set (twist), far away from the cab set
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function puddle(c, x, w = 1900) { c.fillStyle = '#6E90B8'; c.beginPath(); c.ellipse(x, 60, w, 140, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - w * 0.3, 30, w * 0.35, 26, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x + w * 0.4, 80, w * 0.2, 18, 0, 0, TAU); c.fill(); }
function splash(c, x, y, u, n = 14, r = 900) { if (u < 0 || u > 0.9) return; c.save(); c.fillStyle = '#9CC4E8'; c.globalAlpha = 1 - u / 0.9; for (let i = 0; i < n; i++) { const a = -Math.PI * (0.1 + 0.8 * i / (n - 1)), v = r * (0.6 + 0.4 * ((i * 37) % 7) / 7); c.beginPath(); c.arc(x + Math.cos(a) * v * u, y + Math.sin(a) * v * u + 900 * u * u, 26 * (1 - u * 0.5), 0, TAU); c.fill(); } c.restore(); }
function cabWorld(c, t, L) { const heads = {}, n = RN(L), sp = vAt(t), X = Xat(t);
  street(c, t);
  if (L === 'r5' || L === 'r6') puddle(c, X - XSTOP);
  const bob = sp > 0 ? Math.sin(t * 13) * 4 * (sp > 1500 ? 2 : 1) : 0, bump = L === 'r1' ? (t > ev('r1', 'bump') ? -60 * Math.exp(-(t - ev('r1', 'bump')) * 7) * Math.abs(Math.cos((t - ev('r1', 'bump')) * 14)) : 0) : 0;
  c.save(); c.translate(0, bob + bump);
  cabBack(c, t, 0);
  const hs = herState(t, L); heads.her = K.put(c, HER, hs, HERX, HERY); if (hs.belt) belt(c, heads.her, G.her, HERX, HERY, L === 'r3' ? clamp((t - ev('r3', 'click') + 0.2) / 0.2) : 1);
  if (L === 'r1' && t > ev('r1', 'bump')) { const hd = heads.her, k = clamp((t - ev('r1', 'bump')) / 0.12), s = hd.hh / 139; c.save(); c.strokeStyle = '#1E2128'; c.lineWidth = 13 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(hd.x + 36 * s, hd.y + 8 * s); c.quadraticCurveTo(hd.x + 80 * s, hd.y - 50 * s * k, hd.x + 62 * s, hd.y - 110 * s * k); c.stroke(); c.restore(); }
  // the pigeon: flies in (r2), sits next to her from then on; tiny belt from r3
  const pg = { s: 1.5, belt: (L === 'r3' && t > ev('r3', 'pclick')) || n > 3 || L === 'score' ? (L === 'r3' ? clamp((t - ev('r3', 'pclick')) / 0.2) : 1) : 0 };
  if (L === 'r2' && t > ev('r2', 'fly')) { const u = clamp((t - ev('r2', 'fly')) / (ev('r2', 'land') - ev('r2', 'fly'))); const px = lerp(1900, PIGX, eOut(u)), py = lerp(-1500, SILL - 10, eIO(u)) - Math.sin(u * Math.PI) * 120; pigeon(c, px, py, t, { ...pg, fly: u < 1 ? 1 : 0, flip: false }); }
  else if (n > 2 || L === 'score' || (L === 'r2' && false)) pigeon(c, PIGX, SILL - 10, t, pg);
  if (L === 'hook' || L === 'r1') { c.fillStyle = '#C23C76'; rr(c, PIGX - 120, SILL - 230, 260, 250, 40); c.fill(); c.strokeStyle = '#8A2A56'; c.lineWidth = 12; c.beginPath(); c.arc(PIGX + 10, SILL - 230, 90, Math.PI, TAU); c.stroke(); }   // her bag on the seat
  c.fillStyle = '#3A3F4C'; rr(c, -220, -1250, 300, 950, 40); c.fill();   // driver seat back
  heads.rayd1 = K.put(c, RAY, rayState(t, L), RAYX, RAYY); cap(c, heads.rayd1, rayState(t, L).turn);
  cabFront(c, t, 0, { speed: sp, X, win: L === 'r2' ? clamp((t - ev('r2', 'win')) / 0.6) : (n > 2 || L === 'score' ? 1 : 0), fwin: L === 'r6' ? 1 : 0 });
  c.restore();
  if (L === 'r5') splash(c, -1030 + 0, -100, t - ev('r5', 'splash'), 16, 1300), splash(c, 1050, -100, t - ev('r5', 'splash') - 0.05, 14, 1100);
  if (L === 'r4' && t > ev('r4', 'bike') - 0.1) { const u = (t - ev('r4', 'bike')) / (ev('r4', 'passed') + 0.7 - ev('r4', 'bike')), x = lerp(2800, -3200, u); if (u < 1.05) { bike(c, t, x, 380); K.put(c, NANA, nanaState(t), x + 140, 30); } }
  K.mark(c, 'figurine', DASHX, SILL - 360, 200);
  return heads; }
// office set: grey stone facade, dark glass doors (CLOSED), the cab parked at the curb with Ray at the lowered window
function officeWorld(c, t) { const heads = {}, e = k => ev('end', k), X0 = OX;
  c.fillStyle = '#9FD0EE'; c.fillRect(X0 - 5000, -5000, 10000, 5000);
  c.fillStyle = '#B8B4AC'; c.fillRect(X0 - 4200, -4200, 8400, 3900); c.fillStyle = 'rgba(0,0,0,.08)'; for (let y = -4200; y < -300; y += 160) c.fillRect(X0 - 4200, y, 8400, 6);
  for (let r = 0; r < 4; r++) for (let k = -6; k <= 6; k++) { if (Math.abs(k) <= 1 && r === 3) continue; c.fillStyle = '#3A4A5A'; c.fillRect(X0 + k * 560 - 170, -3900 + r * 820, 340, 560); }
  // entrance: dark doors, sign
  c.fillStyle = '#7A746A'; c.fillRect(X0 - 160, -1700, 1520, 1420); c.fillStyle = '#1E2632'; c.fillRect(X0 - 80, -1600, 1360, 1320); c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(X0 - 80, -1600); c.lineTo(X0 + 300, -1600); c.lineTo(X0 - 80, -900); c.fill();
  c.fillStyle = '#9AA3B2'; c.fillRect(X0 + 590, -1600, 20, 1320); c.fillRect(X0 + 520, -1000, 12, 160); c.fillRect(X0 + 668, -1000, 12, 160);
  c.fillStyle = '#2B2F3A'; rr(c, X0 - 60, -2050, 1320, 230, 20); c.fill(); fitTxt(c, 'OFFICES', X0 + 600, -1935, 150, '#F2E8C8', 1200);
  c.fillStyle = '#FFFDF8'; rr(c, X0 + 760, -1300, 420, 300, 16); c.fill(); fitTxt(c, 'CLOSED', X0 + 970, -1230, 92, '#E0474C', 380); fitTxt(c, 'MON–FRI', X0 + 970, -1130, 64, '#2B2F3A', 380, 'Cav7'); fitTxt(c, '9 AM – 6 PM', X0 + 970, -1060, 56, '#2B2F3A', 380, 'Cav7');
  c.fillStyle = '#C9C4BA'; c.fillRect(X0 - 5000, -300, 10000, 300); c.fillStyle = '#9A958C'; c.fillRect(X0 - 5000, -10, 10000, 40); c.fillStyle = '#4A4E58'; c.fillRect(X0 - 5000, 30, 10000, 2000);
  puddle(c, X0 - 600, 900);
  // the cab at the curb (behind her), Ray at the lowered front window, the pigeon in the back
  const CX = X0 - 2300; cabBack(c, t, CX);
  pigeon(c, CX + PIGX, SILL - 10, t, { s: 1.5, belt: 1, shake: t > e('pigeon') && t < e('her') ? 1 : 0 });
  c.fillStyle = '#3A3F4C'; rr(c, CX - 220, -1250, 300, 950, 40); c.fill();
  if (t > e('cab') - 0.2) { heads.rayd1 = K.put(c, RAY, rayState(t, 'end'), CX + RAYX, RAYY); cap(c, heads.rayd1, 0.55); }
  cabFront(c, t, CX, { speed: 0, X: 0, win: 1, fwin: clamp((t - e('cab')) / 0.5) });
  // her: runs from the cab through the puddle to the door, tugs the locked door, turns back
  const g = G.her, u = clamp((t - e('run')) / (e('door') - e('run'))), hx = lerp(X0 - 1150, X0 + 380, eIO(u));
  const st = { t, talk: talk('her', t), mood: 'worried', turn: 0.3, look: 0.8, armL: down(g, -1), armR: down(g, 1), items: {}, legPose: u < 1 ? 'walk' : 'stand' };
  if (u < 1) { st.run = true; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 300 + Math.sin(t * 16) * 60, { planar: true }); st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 300 - Math.sin(t * 16) * 60, { planar: true }); }
  if (t > e('door') && t < e('cab')) { st.mood = 'shock'; st.turn = 0.35; st.look = 0.9; st.armR = reach(g, 1, X0 + 526 - hx, -920, { planar: true }); st.headX = Math.sin(t * 40) * 4; }
  if (t > e('cab')) { st.mood = 'surprised'; st.turn = -0.35; st.look = -0.9; st.armR = down(g, 1); }
  if (t > SP.end_r.t + 0.8) { st.mood = 'shock'; st.blink = 0; }
  if (t > e('her')) { st.mood = 'sad'; st.blink = 0; st.tilt = 0.06; st.armL = hold(g, -1, 330, 0.4); st.armR = hold(g, 1, 330, 0.4); }
  if (t > endOf('end_h') + 0.05) { st.mood = 'tired'; st.blink = 1; }
  heads.her = K.put(c, HER, st, hx, 0);
  if (u > 0.15 && u < 0.75) splash(c, hx, 20, ((t - e('run')) % 0.35) / 0.35 * 0.6, 8, 260);
  if (!heads.rayd1) heads.rayd1 = OFFL;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const HY = { her: -1330, ray: -1350 };
const SH = { COVER: S(40, fy(-1330, 0.42, 900), 0.42, 'cab'), WIDE: S(60, fy(-1330, 0.4, 760), 0.4, 'cab'), EXT: S(200, fy(-1330, 0.34, 760), 0.34, 'cab'),
  HER_CU: S(HERX + 20, fy(HY.her, 1.15, 860), 1.15, 'cab'), HER_T: S(HERX + 10, fy(HY.her, 1.0, 1250), 1.0, 'cab'), BACK: S(HERX + 220, fy(HY.her, 0.62, 820), 0.62, 'cab'),
  RAY_CU: S(RAYX + 10, fy(HY.ray, 1.0, 880), 1.0, 'cab'), DASH: S(DASHX + 60, SILL - 400, 1.5, 'cab'), DASH_T: S(DASHX + 60, SILL - 400 - (1330 - 960) / 1.5, 1.5, 'cab'),
  O_WIDE: S(OX - 350, fy(-1340, 0.36, 880), 0.36, 'office'), O_RAY: S(OX - 2300 + RAYX + 60, fy(HY.ray, 0.95, 900), 0.95, 'office'), O_PIG: S(OX - 2300 + PIGX + 40, SILL - 120, 1.6, 'office'),
  O_HER: S(OX + 560, fy(G.her.headY, 1.05, 900), 1.05, 'office'),
  MIRROR: U('mirror', 1), SHOES: U('shoes', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k), n = RN(L); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < 2.45) return SH.COVER; if (t < hev('dash') - 0.03) return f(SH.HER_CU); if (t < hev('wide') - 0.03) return f(SH.DASH); return f(SH.WIDE); }
  if (n && t < e('ans') - 0.02) return f(n % 2 ? SH.DASH_T : SH.HER_T);
  if (L === 'r1') return f(SH.HER_CU);
  if (L === 'r2') return f(SH.BACK);
  if (L === 'r3') { if (t < e('back') - 0.02) return f(SH.MIRROR); return f(SH.BACK); }
  if (L === 'r4') { if (t < e('ext') - 0.02) return f(SH.RAY_CU); return f(SH.EXT); }
  if (L === 'r5') { if (t < e('shoes') - 0.02) return f(SH.EXT); return f(SH.SHOES); }
  if (L === 'r6') return f(SH.RAY_CU);
  if (L === 'end') { if (t < e('cab') - 0.02) return f(SH.O_WIDE); if (t < e('pigeon') - 0.02) return f(SH.O_RAY); if (t < e('her') - 0.02) return f(SH.O_PIG); return f(SH.O_HER); }
  if (L === 'score') return f(SH.WIDE);
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'splash']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = tag === 'office' ? officeWorld(c, t) : cabWorld(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const popK = (t, t0) => eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
function mirrorView(c, t) { backdrop(c, t, '#2E3A4E', '#1A2230'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'mirror' });
  const k = popK(t, ev('r3', 'mirror')); c.save(); c.translate(540, 820); c.scale(k, k);
  c.fillStyle = '#1E2128'; c.fillRect(-14, -520, 28, 260); rr(c, -490, -270, 980, 440, 70); c.fill();
  c.save(); rr(c, -456, -236, 912, 372, 50); c.clip(); c.fillStyle = '#E2B48E'; c.fillRect(-460, -240, 920, 380);
  c.fillStyle = '#4E4234'; c.fillRect(-460, -240, 920, 70);   // cap brim
  const sq = 0.5 + 0.5 * Math.sin(clamp((t - ev('r3', 'mirror') - 0.3) / 0.4) * Math.PI / 2);
  for (const s of [-1, 1]) { const x = s * 190; c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(x, -20, 110, 70 - 30 * sq, 0, 0, TAU); c.fill(); c.strokeStyle = '#2B2F1C'; c.lineWidth = 8; c.stroke();
    c.fillStyle = '#3A2A1A'; c.beginPath(); c.arc(x - s * 30, -20, 34 - 8 * sq, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x - s * 38, -30, 9, 0, TAU); c.fill();
    c.fillStyle = '#4A3424'; c.save(); c.translate(x, -110 + 24 * sq); c.rotate(s * (0.15 + 0.3 * sq)); rr(c, -130, -26, 260, 52, 24); c.fill(); c.restore(); }
  c.restore(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; rr(c, -456, -236, 912, 372, 50); c.stroke(); c.restore(); }
function shoesView(c, t) { backdrop(c, t, '#BFE0F0', '#6E90B8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'shoes' });
  const k = popK(t, ev('r5', 'shoes')), u = t - ev('r5', 'shoes');
  c.save(); c.translate(540, 1500); c.fillStyle = '#5A80AE'; c.beginPath(); c.ellipse(0, 0, 640, 150, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(-200, -30, 200, 26, 0, 0, TAU); c.fill();
  for (let i = 0; i < 3; i++) { const r = ((u * 0.9 + i / 3) % 1); c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - r)})`; c.lineWidth = 6; c.beginPath(); c.ellipse(0, 0, 80 + r * 420, 20 + r * 100, 0, 0, TAU); c.stroke(); } c.restore();
  c.save(); c.translate(540, 900); c.scale(k * 1.25, k * 1.25);
  // the yellow cab's door sill at the top, her legs (jeans) down to the white sneakers hovering over the water
  c.fillStyle = YEL; c.fillRect(-700, -820, 1400, 300); for (let i = 0; i < 24; i++) { c.fillStyle = i % 2 ? '#1E2128' : '#FFFDF8'; c.fillRect(-700 + i * 60, -640, 60, 40); }
  for (const s of [-1, 1]) { const x = s * 150, sw = Math.sin(t * 2 + s) * 6; c.save(); c.translate(x + sw, 0);
    c.fillStyle = '#7E9CC4'; rr(c, -70, -540, 140, 560, 50); c.fill(); c.fillStyle = '#6A88B0'; c.fillRect(-70, -40, 140, 30);
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-80, 0); c.lineTo(70, 0); c.quadraticCurveTo(200 * s > 0 ? 210 : 210, 20, 210, 110); c.lineTo(-90, 110); c.closePath(); c.fill(); c.strokeStyle = '#B9B2A8'; c.lineWidth = 6; c.stroke();
    c.fillStyle = '#E8E2D8'; c.fillRect(-90, 90, 300, 26); c.strokeStyle = '#C98B5A'; c.lineWidth = 6; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-20 + i * 40, 20); c.lineTo(10 + i * 40, 50); c.stroke(); } c.restore(); }
  c.restore();
  // drops falling off the soles
  for (let i = 0; i < 4; i++) { const v = ((u * 1.2 + i / 4) % 1), x = 540 + (i % 2 ? 210 : -150) + (i > 1 ? 120 : 0), y = 800 + 130 * k + v * 560; c.fillStyle = `rgba(150,200,240,${1 - v})`; c.beginPath(); c.ellipse(x, y, 14, 22, 0, 0, TAU); c.fill(); } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.2, 2.45); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 290); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  // rubric tab «УСПЕЙ ЗА 3 СЕКУНДЫ» on the card's top edge, with a stopwatch icon
  c.fillStyle = C.olive; rr(c, -450, -207, 470, 66, 33); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -450, -207, 470, 66, 33); c.stroke(); stopwatch(c, -405, -174, 0.42, C.white, t); fitTxt(c, 'УСПЕЙ ЗА 3 СЕКУНДЫ', -195, -173, 30, C.white, 360);
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -98);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 10, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 62, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 116); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 85, w: 980, h: 370, k: a, id: 'title' }); }
function stopwatch(c, x, y, s, col, t) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 12; c.beginPath(); c.arc(0, 8, 56, 0, TAU); c.stroke(); rr(c, -18, -72, 36, 20, 6); c.fill(); c.fillRect(-6, -56, 12, 14);
  c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 8); const a = t * 4; c.lineTo(Math.sin(a) * 38, 8 - Math.cos(a) * 38); c.stroke(); c.restore(); }
const PHR = { r1: ['Я ОПАЗДЫВАЮ'], r2: ['МОЖНО', 'ОТКРЫТЬ ОКНО?'], r3: ['ПРИСТЕГНИТЕСЬ'], r4: ['МОЖНО', 'ПОБЫСТРЕЕ?'], r5: ['ОСТАНОВИТЕ', 'ЗДЕСЬ'], r6: ['СДАЧИ', 'НЕ НАДО'] };
// the round card: the Russian phrase big + the 3 s timer ring (3-2-1); no voice while it runs
function roundCard(c, t, sc) { const L = sc.id, n = RN(L); if (!n) return; const s = ev(L, 'card'), up = ev(L, 'up');
  const k = eBack(P(t, s, s + 0.25), 2.0) * (1 - eIn(P(t, up + 0.05, up + 0.18))); if (k <= 0) return;
  const lines = PHR[L], cy = n % 2 ? 640 : 560, h = lines.length > 1 ? 560 : 470;
  c.save(); c.translate(540, cy); c.scale(k, k); c.rotate(-0.02);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -470 + 10, -h / 2 + 14, 940, h, 44); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -470, -h / 2, 940, h, 44); c.fill(); c.stroke();
  fitTxt(c, 'КАК СКАЗАТЬ ПО-АНГЛИЙСКИ?', 0, -h / 2 + 52, 34, C.olive, 820, 'Unb9');
  lines.forEach((l, i) => { UI.textFit(c, 'Unb9', 92, l, 860); UI.strokeText(c, l, 0, -h / 2 + 140 + i * 100, C.oliveD, C.white, 10); });
  // timer ring
  const u = clamp((t - s - 0.3) / 3), left = 3 - Math.floor((t - s - 0.3)), num = clamp(left, 1, 3), ty = h / 2 - 130, col = num === 3 ? '#4CAF6A' : num === 2 ? '#F2B33D' : '#E0474C';
  c.fillStyle = '#F3EDDF'; c.beginPath(); c.arc(0, ty, 100, 0, TAU); c.fill(); c.strokeStyle = '#DDD5C2'; c.lineWidth = 22; c.beginPath(); c.arc(0, ty, 86, 0, TAU); c.stroke();
  c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); c.arc(0, ty, 86, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - u)); c.stroke();
  const tk = (t - s - 0.3) % 1, bump = 1 + 0.25 * Math.max(0, 1 - tk / 0.2); c.save(); c.translate(0, ty + 4); c.scale(bump, bump); fitTxt(c, t < s + 0.3 ? '3' : String(num), 0, 0, 104, col, 140); c.restore();
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 540 - 470 * k, y: cy - h / 2 * k, w: 940 * k, h: h * k, k, id: 'round_' + L }); }
// small chapter label at the top: «01/06» while the timer runs, «01 · Я ОПАЗДЫВАЮ» with the answer
function chapter(c, t, sc) { const L = sc.id, n = RN(L); if (!n) return; const u = t - sc.s, out = P(t, sc.e - 0.12, sc.e), k = eBack(P(u, 0, 0.2), 2) * (1 - eIn(out)); if (k <= 0) return;
  const ans = t > ev(L, 'up') + 0.05, txt = ans ? `0${n} · ${PHR[L].join(' ')}` : `0${n}/06`, k2 = ans ? eBack(P(t, ev(L, 'up') + 0.05, ev(L, 'up') + 0.3), 2) : 1;
  UI.font(c, 'Unb9', 44); const tw = Math.min(c.measureText(txt).width, 820), w = tw + 70, y = 150;
  c.save(); c.translate(540, y); c.scale(k * k2, k * k2); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 5, -38, w, 84, 42); c.fill(); c.fillStyle = ans ? C.oliveD : C.white; c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -w / 2, -42, w, 84, 42); c.fill(); c.stroke();
  fitTxt(c, txt, 0, 3, 44, ans ? C.white : C.oliveD, 820); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * k, y: y - 42 * k, w: w * k, h: 84 * k, k, id: 'chap_' + L }); }
// score card: 6 / 3 / 0
function scoreCard(c, t) { const sc = SC.score; if (!sc || t < sc.s) return; const k = eBack(P(t, sc.s, sc.s + 0.25), 2) * (1 - eIn(P(t, sc.e - 0.15, sc.e))); if (k <= 0) return;
  const rows = [['6', 'ПАССАЖИР ГОДА', '#4CAF6A', 's6'], ['3', 'ДОЕДЕШЬ', '#F2B33D', 's3'], ['0', 'ИДИ ПЕШКОМ', '#E0474C', 's0']];
  c.save(); c.translate(540, 360); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -440 + 10, -250 + 14, 880, 500, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -440, -250, 880, 500, 40); c.fill(); c.stroke();
  fitTxt(c, 'ТВОЙ СЧЁТ', 0, -190, 48, C.olive, 700);
  rows.forEach(([nn, txt, col, key], i) => { const q = eBack(P(t, ev('score', key) - 0.05, ev('score', key) + 0.25), 2.2); if (q <= 0) return; const y = -90 + i * 125;
    c.save(); c.translate(0, y); c.scale(q, q); c.fillStyle = col; c.beginPath(); c.arc(-320, 0, 52, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, nn, -320, 4, 64, C.white, 80);
    fitTxt(c, '/6', -230, 8, 40, C.oliveD, 80); fitTxt(c, txt, -170, 4, 58, C.oliveD, 560, 'Unb9', 'left'); c.restore(); });
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 110, w: 880, h: 500, k, id: 'score' }); }

// ---------------- end screen: СКОЛЬКО ИЗ 6? · 0–2 / 3–4 / 5–6 · СОХРАНИ · ПОДПИСАТЬСЯ (cursor) -> the comment question (ask)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // the heroine + Ray + the pigeon, small at the bottom-left (owner-approved outro layout)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gr = G.ray; const rs = { t, talk: 0, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { L: gloveItem('#E0474C'), R: gloveItem('#E0474C') }, armL: reach(gr, -1, -gr.sw * 1.7, gr.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gr, 1, gr.sw * 1.7, gr.ySh + 60 + Math.sin(t * 6 + 1) * 15, { planar: true }) };
    const rh = K.put(c, RAY, rs, 640, 0); cap(c, rh, -0.2);
    K.put(c, HER, { t, talk: 0, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.25, g.ySh + 260, { planar: true }), items: { R: coffeeItem } }, 0, 0);
    pigeon(c, 330, 0, t, { s: 1.3, belt: 0 }); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const swap = eIO(P(t, ask.t - 0.15, ask.t + 0.15));
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 92); strokeText(c, 'СКОЛЬКО', 0, -60, C.oliveD, C.white, 14); strokeText(c, 'ИЗ 6?', 0, 50, C.pink, C.white, 14); c.restore(); }
  const q2 = eBack(P(t, ask.t, ask.t + 0.3), 2.2); if (q2 > 0) { c.save(); c.translate(540, 300); c.scale(q2, q2); c.rotate(-0.02);
    c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -460 + 8, -170 + 12, 920, 340, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -460, -170, 920, 340, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 76, 'ПИШИ СЧЁТ', 840); c.fillStyle = C.oliveD; c.fillText('ПИШИ СЧЁТ', 0, -70); textFit(c, 'Unb9', 84, 'В КОММЕНТЫ', 840); strokeText(c, 'В КОММЕНТЫ', 0, 40, C.pink, C.white, 12);
    c.save(); c.translate(0, 125); c.fillStyle = C.oliveD; rr(c, -40, -26, 80, 52, 14); c.fill(); c.beginPath(); c.moveTo(-14, 24); c.lineTo(-26, 44); c.lineTo(10, 24); c.fill(); c.fillStyle = C.white; for (const dx of [-20, 0, 20]) { c.beginPath(); c.arc(dx, 0, 6, 0, TAU); c.fill(); } c.restore(); c.restore(); }
  const BT = [['0–2', '#E0474C'], ['3–4', '#F2B33D'], ['5–6', '#4CAF6A']];
  BT.forEach(([txt, col], i) => { const t0 = s + 0.35 + i * 0.15, kk = eBack(P(t, t0 - 0.05, t0 + 0.25), 2.2); if (kk <= 0) return; const x = 220 + i * 320, y = 640;
    c.save(); c.translate(x, y); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -140 + 8, -90 + 12, 280, 180, 36); c.fill(); c.fillStyle = col; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -140, -90, 280, 180, 36); c.fill(); c.stroke();
    textFit(c, 'Unb9', 96, txt, 230); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(txt, 0, 6); c.restore(); });
  const svT = wAt('outro', 'сохрани', sp.t) - 0.05, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 900); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = wAt('outro', 'через', sp.t + 1.4) - 0.5, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1090;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(540, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(960, 620, mv), lerp(sy + 180, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < ask.t - 0.1) { c.save(); c.translate(0, -60); UI.captions(c, t); c.restore(); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'cab';
  let heads, proj;
  if (tag.startsWith('ui:')) { ({ 'ui:mirror': mirrorView, 'ui:shoes': shoesView })[tag](c, t); heads = { her: OFFL, rayd1: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { rayd1: ['RAY', '#C99A1E'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 4.5e4) onScr[k] = heads[k];
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_r: 0.3, end_r: -0.05, end_h: 0.1 } });
  if (L === 'hook') title(c, t);
  roundCard(c, t, sc); chapter(c, t, sc); if (L === 'score') scoreCard(c, t);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'score' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('taxi3s', NF, renderFrame);
