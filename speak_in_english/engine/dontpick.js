// "Он записал тебя в телефоне как «Не брать»" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node dontpick.js start end out.mp4 | --png=f1,f2
// An American apartment kitchen (window onto brick buildings + a water tower, fridge, pendant lamps). The heroine (pink sweater) and her boyfriend
// Eric (teal sweater) stand behind the kitchen island; his phone sits on a stand between them. She is calling him — his screen says «DON'T ANSWER».
// Absurd background detail: a framed photo on the wall — Eric hugging the pizza delivery guy, plaque «FAMILY»; in his contacts «PIZZA GUY (FAMILY)»
// sits right under her. Running prop: the two phones.
// hook: he slaps his palm over the ringing phone — "That's just my dentist."; insert: his favorites list.
// o1 «В ЛОБ»: "It's a reminder! To always answer!" — she calls again to test; insert: he hits DECLINE out of habit; steam from her ears.
// o2 «ВЕЖЛИВО»: "It's just a name. Like 'Bob'." — insert: the contact «BORING BOB»; her slow facepalm.
// o3 «КАК НОСИТЕЛЬ»: "...Okay. Fair." — insert: he erases «DON'T ANSWER» letter by letter; he blushes bright red; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand line; insert: her phone «ALWAYS ANSWER»; he types frantically: «ALWAYS ANSWER, MY QUEEN» + crown.
// Twist (music silent): he calls her to check — her phone lights up «HE'LL WAIT». "'He'll wait'?! Since when?!" — his deadpan stare.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/dontpick/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const wT = (id, w, fb) => K.wordT(id, w) ?? fb;

// ---------------- cast
const HER = { ...BASE.her_lift };
const BF = { ...BASE.tom, top: { type: 'sweater', col: '#2F9C8E' }, bottom: { type: 'jeans', col: '#4A5A7A' }, hair: { style: 'short', col: '#3A2A1E' } };
const G = { her: geom(HER), bf15: geom(BF) };
const X = { her: -430, bf: 430 };
const TOP = -800;                                  // island counter top (world y); the floor is y = 0
const PH = { x: 0, w: 320, h: 560, y1: TOP - 40 };  // his phone on the stand: bottom y1, top y1 - h
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- little drawn icons (no emoji in the fonts)
function handset(c, x, y, s, col, down = false) { c.save(); c.translate(x, y); c.rotate(down ? 2.36 : 0); c.scale(s, s); c.fillStyle = col;
  c.beginPath(); c.moveTo(-30, -22); c.quadraticCurveTo(-34, 8, -6, 30); c.quadraticCurveTo(14, 44, 30, 26); c.lineTo(18, 12); c.quadraticCurveTo(8, 18, -2, 8); c.quadraticCurveTo(-12, -2, -8, -14); c.closePath(); c.fill(); c.restore(); }
function crown(c, x, y, s, col = '#F2C14E') { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = '#8A6A10'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(-50, 30); c.lineTo(-56, -26); c.lineTo(-26, 4); c.lineTo(0, -38); c.lineTo(26, 4); c.lineTo(56, -26); c.lineTo(50, 30); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#E0474C'; for (const px of [-56, 0, 56]) { c.beginPath(); c.arc(px, px === 0 ? -40 : -28, 8, 0, TAU); c.fill(); } c.restore(); }
function starIcon(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr_ = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fill(); c.restore(); }
function tickIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 10; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-22, 0); c.lineTo(-6, 16); c.lineTo(24, -18); c.stroke(); c.restore(); }
// contact avatars: her (pink, dark bob), him (teal, short hair), bob (grey, beige, flat mouth), pizza guy (red cap), mom (purple, grey bun)
function avatar(c, x, y, r, who) { c.save(); c.translate(x, y);
  const bg = { her: '#F6A9C6', him: '#8FD3C8', bob: '#B9BDC4', pizza: '#F7C59F', mom: '#C9A8E8' }[who]; c.fillStyle = bg; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.clip();
  const skin = who === 'bob' ? '#E8D2B8' : '#F6D2B6', top = { her: '#EF7FAA', him: '#2F9C8E', bob: '#C9B79A', pizza: '#E0474C', mom: '#8E5BD0' }[who];
  c.fillStyle = top; c.beginPath(); c.ellipse(0, r * 1.05, r * 0.85, r * 0.62, 0, 0, TAU); c.fill();
  if (who === 'her') { c.fillStyle = '#3A2820'; c.beginPath(); c.ellipse(0, -r * 0.12, r * 0.58, r * 0.6, 0, 0, TAU); c.fill(); c.fillRect(-r * 0.58, -r * 0.12, r * 1.16, r * 0.5); }
  if (who === 'mom') { c.fillStyle = '#B8B8C4'; c.beginPath(); c.arc(0, -r * 0.62, r * 0.24, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, -r * 0.2, r * 0.5, r * 0.46, 0, 0, TAU); c.fill(); }
  c.fillStyle = skin; c.beginPath(); c.ellipse(0, -r * 0.05, r * 0.42, r * 0.48, 0, 0, TAU); c.fill();
  if (who === 'him') { c.fillStyle = '#3A2A1E'; c.beginPath(); c.ellipse(0, -r * 0.42, r * 0.45, r * 0.2, 0, Math.PI, TAU); c.fill(); c.fillRect(-r * 0.45, -r * 0.44, r * 0.9, r * 0.12); }
  if (who === 'her') { c.fillStyle = '#3A2820'; c.beginPath(); c.ellipse(0, -r * 0.4, r * 0.46, r * 0.2, 0, Math.PI, TAU); c.fill(); }
  if (who === 'pizza') { c.fillStyle = '#E0474C'; c.beginPath(); c.ellipse(0, -r * 0.4, r * 0.48, r * 0.24, 0, Math.PI, TAU); c.fill(); c.fillRect(-r * 0.05, -r * 0.42, r * 0.7, r * 0.1); }
  c.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.16, -r * 0.08, r * 0.055, 0, TAU); c.fill(); }
  c.strokeStyle = '#2B2F3A'; c.lineWidth = Math.max(2, r * 0.05); c.lineCap = 'round'; c.beginPath();
  if (who === 'bob') { c.moveTo(-r * 0.14, r * 0.17); c.lineTo(r * 0.14, r * 0.17); } else c.arc(0, r * 0.08, r * 0.16, 0.25, Math.PI - 0.25); c.stroke();
  c.restore(); c.restore(); }

// ---------------- the kitchen (prerendered, softly blurred)
const BX0 = -2800, BY0 = -4400, BW = 5600, BH = 5600, BS = 0.5;
function drawKitchen(c) {
  // back wall
  c.fillStyle = '#F6E7CF'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(200,150,110,.10)'; for (let x = BX0; x < BX0 + BW; x += 120) c.fillRect(x, BY0, 50, BH);
  // window onto the city: brick buildings, a rooftop water tower, sky
  const wx0 = -520, wx1 = 520, wy0 = -3000, wy1 = -1650;
  const g = c.createLinearGradient(0, wy0, 0, wy1); g.addColorStop(0, '#9FD2F0'); g.addColorStop(1, '#E6F2F6'); c.fillStyle = g; c.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  c.fillStyle = '#B5563E'; c.fillRect(wx0, -2350, 420, 700); c.fillStyle = '#9C4632'; c.fillRect(wx0 + 470, -2600, 600, 950);
  c.fillStyle = 'rgba(255,240,200,.85)'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { c.fillRect(wx0 + 40 + i * 120, -2280 + j * 200, 70, 110); c.fillRect(wx0 + 520 + i * 160, -2520 + j * 260, 90, 140); }
  // water tower on the roof
  c.fillStyle = '#7A5236'; c.fillRect(wx0 + 100, -2700, 220, 260); c.beginPath(); c.moveTo(wx0 + 80, -2700); c.lineTo(wx0 + 210, -2830); c.lineTo(wx0 + 340, -2700); c.fill();
  c.strokeStyle = '#4A3424'; c.lineWidth = 12; c.beginPath(); for (const lx of [wx0 + 120, wx0 + 300]) { c.moveTo(lx, -2440); c.lineTo(lx, -2350); } c.stroke();
  c.strokeStyle = '#4A3424'; c.lineWidth = 6; for (const y of [-2640, -2560, -2480]) { c.beginPath(); c.moveTo(wx0 + 100, y); c.lineTo(wx0 + 320, y); c.stroke(); }
  // window frame + sill + a small plant
  c.fillStyle = '#FFFFFF'; c.fillRect(wx0 - 50, wy0 - 50, wx1 - wx0 + 100, 50); c.fillRect(wx0 - 50, wy1, wx1 - wx0 + 100, 60); c.fillRect(wx0 - 50, wy0, 50, wy1 - wy0); c.fillRect(wx1, wy0, 50, wy1 - wy0); c.fillRect(-25, wy0, 50, wy1 - wy0); c.fillRect(wx0, -2340, wx1 - wx0, 36);
  c.fillStyle = '#C9774A'; rr(c, 260, -1800, 140, 150, 20); c.fill(); c.fillStyle = '#5FA35A'; for (const [dx, dy, a] of [[-40, -70, -0.6], [0, -100, 0], [40, -70, 0.6], [-20, -40, -0.3], [25, -45, 0.3]]) { c.save(); c.translate(330 + dx, -1800 + dy); c.rotate(a); c.beginPath(); c.ellipse(0, 0, 26, 70, 0, 0, TAU); c.fill(); c.restore(); }
  // upper cabinets left and right of the window
  for (const [x0, x1] of [[-2700, -700], [700, 1500]]) { c.fillStyle = '#7FB8B0'; c.fillRect(x0, -3600, x1 - x0, 900); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x0, -2720, x1 - x0, 20);
    for (let x = x0 + 20; x < x1 - 20; x += 400) { c.strokeStyle = 'rgba(40,80,76,.5)'; c.lineWidth = 8; c.strokeRect(x, -3560, Math.min(370, x1 - 20 - x), 820); c.fillStyle = '#E9EDF1'; rr(c, x + Math.min(370, x1 - 20 - x) / 2 - 40, -2830, 80, 18, 9); c.fill(); } }
  // backsplash tiles + the back counter line behind the island
  c.fillStyle = '#FFFFFF'; c.fillRect(BX0, -1600, BW, 520); c.strokeStyle = 'rgba(120,150,170,.35)'; c.lineWidth = 4; for (let y = -1600; y < -1080; y += 104) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); } for (let x = BX0; x < BX0 + BW; x += 208) for (let y = -1600, r = 0; y < -1080; y += 104, r++) { c.beginPath(); c.moveTo(x + (r % 2) * 104, y); c.lineTo(x + (r % 2) * 104, y + 104); c.stroke(); }
  c.fillStyle = '#D9D2C4'; c.fillRect(BX0, -1100, BW, 60); c.fillStyle = '#7FB8B0'; c.fillRect(BX0, -1040, BW, 1040);
  // fridge on the right with magnets and a shopping list
  c.fillStyle = '#E4E8EC'; rr(c, 1650, -3700, 900, 3700, 40); c.fill(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(1650, -2350, 900, 16); c.fillStyle = '#B9C1CA'; rr(c, 1720, -2900, 30, 400, 15); c.fill(); rr(c, 1720, -2200, 30, 500, 15); c.fill();
  c.fillStyle = '#FFFFFF'; c.save(); c.translate(2150, -1800); c.rotate(0.06); c.fillRect(-170, -230, 340, 460); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, -225, 22, 0, TAU); c.fill();
  c.strokeStyle = '#6A7A8A'; c.lineWidth = 6; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-120, -140 + i * 80); c.lineTo(120 - (i % 2) * 60, -140 + i * 80); c.stroke(); } c.restore();
  for (const [mx, my, col] of [[1900, -3000, '#F2C14E'], [2350, -3200, '#4CAF6A'], [2250, -2700, '#3E73B8']]) { c.fillStyle = col; c.beginPath(); c.arc(mx, my, 34, 0, TAU); c.fill(); }
  // left wall: the framed photo «FAMILY» — Eric hugging the pizza delivery guy (the absurd detail)
  { const fx = -830, fy = -2150, fw = 440, fh = 400; c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(fx - fw / 2 + 14, fy - fh / 2 + 18, fw, fh); c.fillStyle = '#C08A50'; c.fillRect(fx - fw / 2, fy - fh / 2, fw, fh); c.fillStyle = '#FFF6E6'; c.fillRect(fx - fw / 2 + 30, fy - fh / 2 + 30, fw - 60, fh - 60);
    c.fillStyle = '#BFE0F0'; c.fillRect(fx - fw / 2 + 50, fy - fh / 2 + 50, fw - 100, fh - 150);
    const fig = (x, top, skin, hair, cap) => { c.fillStyle = top; c.beginPath(); c.ellipse(x, fy + 60, 80, 70, 0, Math.PI, TAU); c.fill(); c.fillRect(x - 80, fy + 58, 160, 22); c.fillStyle = skin; c.beginPath(); c.arc(x, fy - 40, 48, 0, TAU); c.fill(); c.fillStyle = hair; c.beginPath(); c.ellipse(x, fy - 68, 50, 26, 0, Math.PI, TAU); c.fill(); if (cap) { c.fillStyle = '#E0474C'; c.beginPath(); c.ellipse(x, fy - 72, 52, 30, 0, Math.PI, TAU); c.fill(); c.fillRect(x - 6, fy - 76, 74, 12); }
      c.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 15, fy - 42, 5, 0, TAU); c.fill(); } c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.arc(x, fy - 28, 16, 0.2, Math.PI - 0.2); c.stroke(); };
    fig(fx - 75, '#2F9C8E', '#F6D2B6', '#3A2A1E', false); fig(fx + 75, '#E0474C', '#E9C09A', '#2B2F3A', true);
    c.fillStyle = '#2F9C8E'; c.save(); c.translate(fx, fy + 20); c.rotate(-0.4); rr(c, -10, -12, 110, 24, 12); c.fill(); c.restore();   // his arm around the pizza guy
    c.fillStyle = '#E8C48A'; c.fillRect(fx + 30, fy + 20, 130, 40); c.strokeStyle = '#B08A50'; c.lineWidth = 3; c.strokeRect(fx + 30, fy + 20, 130, 40);   // pizza box
    c.fillStyle = '#C08A50'; rr(c, fx - 150, fy + fh / 2 - 110, 300, 64, 10); c.fill(); fitTxt(c, 'FAMILY', fx, fy + fh / 2 - 78, 46, '#FFF6E6', 260); }
  // a wall clock on the right of the window
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(1100, -2350, 120, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.stroke(); c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(1100, -2350); c.lineTo(1100, -2430); c.moveTo(1100, -2350); c.lineTo(1160, -2330); c.stroke();
  // pendant lamps
  for (const lx of [-700, 700]) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(lx, BY0); c.lineTo(lx, -3300); c.stroke(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(lx - 150, -3080); c.quadraticCurveTo(lx, -3420, lx + 150, -3080); c.fill(); c.fillStyle = 'rgba(255,230,160,.9)'; c.beginPath(); c.ellipse(lx, -3080, 150, 26, 0, 0, TAU); c.fill(); }
  // wooden floor
  c.fillStyle = '#C89A6A'; c.fillRect(BX0, -10, BW, BY0 + BH + 10); c.fillStyle = 'rgba(90,50,20,.12)'; for (let y = 40; y < BY0 + BH; y += 110) c.fillRect(BX0, y, BW, 6);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawKitchen);

// ---------------- the island (live, in front of the characters) + things on it
function island(c) {
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-1500, TOP + 20, 3000, 40);
  paint(c, q => { q.m(-1500, TOP + 30); q.l(1500, TOP + 30); q.l(1500, 0); q.l(-1500, 0); q.z(); }, '#EAD7B8', { sd: 8, hd: 4, lw: 5 });
  c.strokeStyle = 'rgba(120,90,50,.35)'; c.lineWidth = 6; for (let x = -1300; x <= 1300; x += 520) { c.strokeRect(x, TOP + 120, 420, 700); c.fillStyle = '#B9A07A'; rr(c, x + 170, TOP + 170, 80, 16, 8); c.fill(); }
  paint(c, q => { q.m(-1560, TOP - 30); q.l(1560, TOP - 30); q.l(1560, TOP + 34); q.l(-1560, TOP + 34); q.z(); }, '#F4F1EC', { sd: 4, hd: 2, lw: 5 });
  c.fillStyle = 'rgba(180,170,160,.35)'; for (let x = -1500; x < 1500; x += 330) { c.beginPath(); c.ellipse(x + 120, TOP - 4, 90, 6, 0.05, 0, TAU); c.fill(); }
  // pizza box (left) + a mug (right)
  paint(c, q => { q.m(-1180, TOP - 30); q.l(-720, TOP - 30); q.l(-740, TOP - 110); q.l(-1160, TOP - 110); q.z(); }, '#E8C48A', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(-950, TOP - 70, 26, 0, TAU); c.fill(); c.strokeStyle = '#B08A50'; c.lineWidth = 3; c.beginPath(); c.moveTo(-1160, TOP - 92); c.lineTo(-740, TOP - 92); c.stroke();
  paint(c, q => { q.m(800, TOP - 30); q.l(900, TOP - 30); q.l(905, TOP - 170); q.l(795, TOP - 170); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 4 }); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.beginPath(); c.arc(915, TOP - 100, 34, -1.3, 1.3); c.stroke();
  c.fillStyle = '#EF7FAA'; c.beginPath(); c.arc(850, TOP - 100, 22, 0, TAU); c.fill(); }

// his phone: on the stand (hook, o1) — screen states; from o2 on it lives in his hand
const onStand = (t, L) => L === 'hook' || L === 'o1' || (L === 'o2' && t < ev('o2', 'pick'));
function standScreen(t, L) { // -> {mode, name}
  if (L === 'hook') return { mode: 'ring' };
  if (L === 'o1') { if (t >= ev('o1', 'ring') && t < ev('o1', 'decline')) return { mode: 'ring' }; if (t >= ev('o1', 'decline') && t < ev('o1', 'decline') + 1.2) return { mode: 'ended' }; }
  return { mode: 'off' }; }
function callFace(c, w, h, name, who, t, mode) { // a phone call screen in local (0..w, 0..h)
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, mode === 'ended' ? '#5A2A34' : '#2C4A5E'); g.addColorStop(1, mode === 'ended' ? '#2B1A20' : '#1E2A36'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const cx = w / 2, ay = h * 0.3, ar = w * 0.2;
  if (mode === 'ring') for (let i = 0; i < 3; i++) { const u = ((t * 1.3 + i / 3) % 1); c.strokeStyle = `rgba(255,255,255,${0.45 * (1 - u)})`; c.lineWidth = w * 0.012; c.beginPath(); c.arc(cx, ay, ar * (1 + u * 0.8), 0, TAU); c.stroke(); }
  avatar(c, cx, ay, ar, who);
  fitTxt(c, mode === 'ended' ? 'Call Declined' : 'incoming call', cx, h * 0.08, w * 0.07, mode === 'ended' ? '#FF8A8A' : 'rgba(255,255,255,.75)', w * 0.8, 'Nun9');
  fitTxt(c, name, cx, h * 0.53, w * 0.13, '#FFFFFF', w * 0.9);
  fitTxt(c, 'mobile', cx, h * 0.6, w * 0.06, 'rgba(255,255,255,.7)', w * 0.6, 'Nun9');
  if (mode !== 'ended') for (const [bx, col, dn, lab] of [[w * 0.27, '#E0474C', true, 'Decline'], [w * 0.73, '#4CAF6A', false, 'Accept']]) { c.fillStyle = col; c.beginPath(); c.arc(bx, h * 0.82, w * 0.11, 0, TAU); c.fill(); handset(c, bx, h * 0.82, w * 0.0028, '#FFFFFF', dn); fitTxt(c, lab, bx, h * 0.93, w * 0.055, 'rgba(255,255,255,.85)', w * 0.3, 'Nun9'); }
  else { c.fillStyle = '#E0474C'; c.beginPath(); c.arc(cx, h * 0.82, w * 0.11, 0, TAU); c.fill(); handset(c, cx, h * 0.82, w * 0.0028, '#FFFFFF', true); } }
function standPhone(c, t, L, slapK) { if (!onStand(t, L)) { stand(c); return; }
  const st = standScreen(t, L), buzz = st.mode === 'ring' && slapK < 0.5 ? Math.sin(t * 70) * 6 : 0;
  stand(c);
  c.save(); c.translate(PH.x + buzz, PH.y1); c.rotate(-0.04 + buzz * 0.002);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -PH.w / 2 + 10, -PH.h + 14, PH.w, PH.h, 34); c.fill();
  c.fillStyle = '#2B2F3A'; rr(c, -PH.w / 2, -PH.h, PH.w, PH.h, 34); c.fill();
  const sw = PH.w - 24, sh = PH.h - 30; c.save(); c.beginPath(); rr(c, -sw / 2, -PH.h + 15, sw, sh, 24); c.clip(); c.translate(-sw / 2, -PH.h + 15);
  if (st.mode === 'off') { c.fillStyle = '#1A1E26'; c.fillRect(0, 0, sw, sh); c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(sw * 0.2, 0); c.lineTo(sw * 0.45, 0); c.lineTo(sw * 0.1, sh); c.lineTo(0, sh); c.fill(); }
  else { // big readable name for the wide shots
    const g = c.createLinearGradient(0, 0, 0, sh); g.addColorStop(0, st.mode === 'ended' ? '#5A2A34' : '#2C4A5E'); g.addColorStop(1, '#1E2A36'); c.fillStyle = g; c.fillRect(0, 0, sw, sh);
    avatar(c, sw / 2, sh * 0.24, sw * 0.2, 'her');
    if (st.mode === 'ended') fitTxt(c, 'DECLINED', sw / 2, sh * 0.55, 46, '#FF8A8A', sw - 20);
    else { fitTxt(c, "DON'T", sw / 2, sh * 0.5, 64, '#FFFFFF', sw - 20); fitTxt(c, 'ANSWER', sw / 2, sh * 0.64, 64, '#FFFFFF', sw - 20); }
    for (const [bx, col, dn] of [[sw * 0.28, '#E0474C', true], [sw * 0.72, '#4CAF6A', false]]) { if (st.mode === 'ended' && !dn) continue; c.fillStyle = col; c.beginPath(); c.arc(st.mode === 'ended' ? sw / 2 : bx, sh * 0.85, sw * 0.12, 0, TAU); c.fill(); handset(c, st.mode === 'ended' ? sw / 2 : bx, sh * 0.85, 0.9, '#FFFFFF', dn); } }
  c.restore();
  c.fillStyle = '#2B2F3A'; rr(c, -40, -PH.h + 6, 80, 14, 7); c.fill();
  // ring waves around the phone (only while ringing and not covered)
  if (st.mode === 'ring' && slapK < 0.5) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 10; c.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const r = 60 + i * 50 + ((t * 3) % 1) * 20; c.beginPath(); c.arc(s * (PH.w / 2 + 20), -PH.h * 0.8, r, s > 0 ? -0.6 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.6); c.stroke(); } }
  // glow leaking around his palm while it is covered
  if (st.mode === 'ring' && slapK >= 0.5) { const a = 0.5 + 0.4 * Math.sin(t * 12); c.strokeStyle = `rgba(160,220,255,${a})`; c.lineWidth = 16; rr(c, -PH.w / 2 - 10, -PH.h - 10, PH.w + 20, PH.h + 20, 40); c.stroke(); }
  c.restore(); K.mark(c, 'phone', PH.x, PH.y1 - PH.h / 2, 260); }
function stand(c) { c.fillStyle = '#6A707A'; c.beginPath(); c.moveTo(-110, TOP - 30); c.lineTo(110, TOP - 30); c.lineTo(80, TOP - 60); c.lineTo(-80, TOP - 60); c.fill(); c.fillRect(-18, PH.y1 - 40, 36, TOP - 40 - PH.y1 + 30); c.fillStyle = '#4A5060'; rr(c, -PH.w / 2 - 6, PH.y1 - 20, PH.w + 12, 34, 12); c.fill(); }

// phones in hand: item at the wrist; scr = 'off' | 'lit' | 'ring'
const handPhone = (scr, t = 0, k = 1) => (ctx, a, side) => { ctx.save(); ctx.rotate(a - Math.PI / 2); ctx.translate(0, 40); ctx.scale(k, k);
  const bz = scr === 'ring' ? Math.sin(t * 70) * 4 : 0; ctx.translate(bz, 0);
  paint(ctx, q => { q.m(-44, -80); q.l(44, -80); q.l(44, 80); q.l(-44, 80); q.z(); }, '#2B2F3A', { sd: 6, hd: 3, lw: 3 });
  ctx.fillStyle = scr === 'off' ? '#1A1E26' : scr === 'ring' ? '#7FD0FF' : '#BFE6FF'; rr(ctx, -36, -70, 72, 140, 8); ctx.fill();
  if (scr === 'ring') { ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (const s of [-1, 1]) { const r = 60 + ((t * 3) % 1) * 16; ctx.beginPath(); ctx.arc(0, 0, r + 20, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); ctx.stroke(); } }
  ctx.restore(); };

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const rest = (g, s, dx = 1.05) => reach(g, s, s * g.sw * dx, TOP - 40, { planar: true });          // hand on the counter
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const ear = (g, s) => reach(g, s, s * g.hw * 0.98, g.headY + g.hh * 0.28, { planar: true });       // phone at the ear (drawn over the head: headFirst)
const chest = (g, s, dy = 260, k = 0.55) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = -1) => reach(g, s, s * g.hw * 0.1, g.headY - g.hh * 0.38, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: rest(g, -1), armR: rest(g, 1), items: {} });
const steamK = (t, L) => L === 'o1' ? clamp((t - ev('o1', 'steam')) / 0.2) * (1 - clamp((t - ev('o1', 'steam') - 2.6) / 0.4)) : 0;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'annoyed', turn: 0.25, look: 0.7 };
  const ph = (scr = 'off') => { st.items = { R: handPhone(scr, t) }; };
  st.armR = chest(g, 1, 300, 0.7); ph();
  if (L === 'hook') { st.mood = 'angry'; st.look = 0.6; st.lookY = 0.25;
    if (t < hev('slap') + 0.25) { st.armR = chest(g, 1, 170, 1.0); ph('ring'); }
    if (t > hev('slap') + 0.2) { st.mood = 'skeptical'; st.lookY = 0; }
    if (t > hev('wide')) { st.mood = 'annoyed'; st.armL = reach(g, -1, -g.sw * 1.2, TOP - 60 - Math.abs(Math.sin(t * 9)) * 30, { planar: true }); } }   // drums her fingers on the counter
  if (L === 'o1') { st.mood = 'angry';
    if (speaking('o1_h', t, 0.05, 0.1)) { const u = t - SP.o1_h.t; st.armR = reach(g, 1, g.sw * (2.3 + 0.12 * Math.sin(u * 7)), g.ySh + 110, { planar: true }); ph('lit'); st.headY = Math.abs(Math.sin(u * 6)) * 8; }
    if (t > SP.o1_b.t) { st.mood = 'skeptical'; }
    if (t > e('call') - 0.1 && t < e('steam')) { st.mood = 'skeptical'; st.armR = chest(g, 1, 150, 0.9); ph('lit'); st.lookY = 0.35; st.look = 0.3; }
    if (t > e('ring')) { st.lookY = 0; st.look = 0.9; }
    if (t > e('steam') - 0.05) { st.mood = 'angry'; st.blink = 0; st.headY = Math.sin(t * 40) * 3; st.armL = reach(g, -1, -g.sw * 1.15, TOP - 70, { planar: true }, { fist: true }); } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'sad'; st.tilt = 0.07; st.lookY = 0.2; st.armL = chest(g, -1, 170, 0.3); }
    if (t > SP.o2_b.t) { st.mood = 'surprised'; st.tilt = 0; st.lookY = 0; }
    if (t > e('bob')) { st.mood = 'tired'; st.blink = 0; }
    if (t > e('palm')) { const k = eOut(clamp((t - e('palm')) / 0.45)); st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armL = k > 0.05 ? reach(g, -1, lerp(-g.sw * 1.05, -g.hw * 0.1, k), lerp(TOP - 40, g.headY - g.hh * 0.38, k), { planar: true }) : st.armL; st.headY = 10 * k; st.tilt = -0.05 * k; } }
  if (L === 'o3') { st.mood = 'neutral'; st.armL = reach(g, -1, -g.sw * 1.35, g.ySh + 380, { planar: true });   // hand on hip
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'skeptical'; st.tilt = -0.04; }
    if (t > SP.o3_b.t) { st.mood = 'neutral'; }
    if (t > e('blush') - 0.1) { st.mood = 'happy'; st.blink = 0; st.look = 0.8; }
    if (t > SP.o3_nar.t + 0.6) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o4') { st.mood = 'smug';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.look = 0.8; const u = (t - SP.o4_h.t) * 3; st.armL = reach(g, -1, -g.sw * (1.5 + 0.15 * Math.sin(u)), g.ySh + 170 + Math.cos(u) * 20, { planar: true }); if (t > SP.o4_h.t + 6.6) { st.mood = 'smug'; st.blink = 1; } }
    if (t > e('show') - 0.1) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 120, { planar: true }); ph('lit'); }
    if (t > e('type')) { st.mood = 'smug'; st.blink = 1; st.armR = chest(g, 1, 300, 0.7); ph(); } }
  if (L === 'end') { st.mood = 'smug'; st.blink = 1;
    if (t > e('smug')) { st.mood = 'happy'; st.blink = 1; st.laugh = false; }
    if (t > e('ring') - 0.05) { st.mood = 'surprised'; st.blink = 0; st.armR = chest(g, 1, 170, 0.95); ph('ring'); st.lookY = 0.4; st.look = 0.3; }
    if (t > SP.end_h.t - 0.05) { st.mood = 'shock'; st.lookY = 0.1; st.look = 0.4; st.breathe = 0; ph('lit'); st.armL = open(g, -1, 1.8, 90); }
    if (t > endOf('end_h') + 0.05) { st.mood = 'worried'; st.look = 0.9; st.lookY = 0; }
    if (t > e('moral')) { st.mood = 'happy'; st.blink = 0; st.laugh = true; st.armL = open(g, -1, 1.6, 110); } }
  return st; }
function bfState(t, L) { const g = G.bf15, e = k => ev(L, k), st = { ...base(g, t, 'bf15'), mood: 'happy', turn: -0.25, look: -0.7 };
  const ph = (scr = 'lit') => { st.items = { R: handPhone(scr, t) }; };
  const toPhone = (k, dy = 0) => reach(g, -1, lerp(-g.sw * 1.05, PH.x - X.bf + 10, k), lerp(TOP - 40, PH.y1 - PH.h * 0.55 + dy, k), { planar: true });
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; const k = eIO(clamp((t + 0.35) / 1.3)); st.armL = toPhone(k);
    if (t > hev('slap')) { st.mood = 'happy'; st.armL = toPhone(1, 10); }
    if (speaking('hook_b', t, 0.05, 0.1)) { st.mood = t < 1.0 ? 'surprised' : 'happy'; st.look = -0.3; st.turn = 0.05; gest(st, g, 'bf15', t, 1, 120); }
    if (t > hev('wide')) { st.mood = 'happy'; st.blink = 0; st.look = 0.4; st.turn = 0.15; st.lookY = -0.4; st.tilt = 0.06 * Math.sin(t * 4); } }    // whistles at the ceiling
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.o1_b.t - 0.05) { st.mood = 'happy'; st.armL = open(g, -1, 1.9, 60 + Math.sin(t * 6) * 15); st.armR = open(g, 1, 1.9, 60 + Math.sin(t * 6 + 1) * 15); }
    if (t > endOf('o1_b') + 0.1) { st.armL = rest(g, -1); st.armR = rest(g, 1); }
    if (t > e('ring') + 0.2) { const k = eOut(clamp((t - e('ring') - 0.2) / 0.4)); st.armL = toPhone(k, 60); st.mood = 'neutral'; st.look = -0.2; st.lookY = 0.3; }
    if (t > e('decline') + 0.3) { st.mood = 'happy'; st.armL = rest(g, -1); st.look = -0.7; st.lookY = 0; }
    if (t > e('steam')) { st.mood = 'worried'; st.blink = 0; st.armL = open(g, -1, 1.6, 120); st.armR = open(g, 1, 1.6, 120); }
    if (t > SP.o1_nar.t + 0.4) { st.mood = 'happy'; st.blink = 1; st.lookY = -0.4; st.look = 0.3; st.armL = rest(g, -1); st.armR = rest(g, 1); } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0.05, 0.1)) { st.mood = 'surprised'; }
    if (t > e('pick')) { const k = eOut(clamp((t - e('pick')) / 0.3)); st.mood = 'happy'; st.armR = reach(g, 1, lerp(g.sw * 1.05, g.sw * 0.7, k), lerp(TOP - 40, g.ySh + 230, k), { planar: true }); ph('lit'); gest(st, g, 'bf15', t, -1, 120); }
    if (t > endOf('o2_b')) { st.armR = reach(g, 1, -g.sw * 0.2, g.ySh + 120, { planar: true }); st.armL = rest(g, -1); st.mood = 'happy'; st.look = -0.5; }   // proudly holds the screen out
    if (t > e('palm')) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'o3') { st.mood = 'happy'; ph('off'); st.armR = chest(g, 1, 300, 0.8);
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o3_b.t - 0.05) { st.mood = 'worried'; st.blink = 0; st.tilt = 0.08; st.lookY = 0.25; st.armR = chest(g, 1, 230, 0.5); ph('lit'); st.armL = reach(g, -1, -g.sw * 0.1, g.ySh + 240, { planar: true }); }
    if (t > e('blush') - 0.1) { st.mood = 'worried'; st.lookY = 0.45; st.look = -0.4; st.armL = reach(g, -1, -g.sw * 0.15, g.ySh + 235 + Math.sin(t * 30) * 8, { planar: true }); }
    if (t > SP.o3_nar.t + 0.6) { st.mood = 'happy'; st.blink = 1; st.lookY = 0.2; } }
  if (L === 'o4') { st.mood = 'happy'; ph('off'); st.armR = chest(g, 1, 300, 0.8);
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > SP.o4_h.t + 3.8 ? 'worried' : 'happy'; if (t > ev('o4', 'gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; } }
    if (t > e('show')) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('type') - 0.1) { st.mood = 'worried'; st.blink = 0; st.lookY = 0.45; st.look = -0.2; st.armR = chest(g, 1, 220, 0.45); ph('lit'); st.armL = reach(g, -1, -g.sw * (0.05 + 0.08 * Math.sin(t * 38)), g.ySh + 215 + Math.sin(t * 45) * 12, { planar: true }); st.headY = Math.sin(t * 30) * 3; }
    if (t > SP.o4_b.t - 0.05) { st.mood = 'happy'; st.lookY = 0; st.look = -0.7; st.armL = open(g, -1, 1.7, 80); st.armR = reach(g, 1, -g.sw * 0.25, g.ySh + 110, { planar: true }); } }
  if (L === 'end') { st.mood = 'happy'; ph('lit'); st.armR = reach(g, 1, -g.sw * 0.25, g.ySh + 110, { planar: true });
    if (t > e('dial') - 0.05) { const k = eOut(clamp((t - e('dial')) / 0.35)); st.mood = 'smug'; st.armR = reach(g, 1, lerp(-g.sw * 0.25, -g.sw * 0.6, k), g.ySh + lerp(110, 60, k), { planar: true }); }
    if (t > e('stare') - 0.05) { st.mood = 'skeptical'; st.blink = 0; st.look = -0.8; st.armL = rest(g, -1); }
    if (t > e('moral') + 0.6) { st.mood = 'annoyed'; } }
  return st; }
const bfCfg = (t, L) => { const k = L === 'o3' ? clamp((t - ev('o3', 'blush') + 0.1) / 0.3) * 0.6 + clamp((t - SP.o3_b.t) / 0.4) * 0.4 : L === 'o4' && t > ev('o4', 'type') ? 0.6 : 0; return k > 0 ? { ...BF, blush: '#E8333F', blushA: 0.4 + 0.6 * k } : BF; };

// steam puffs from her ears (o1)
function steam(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = 0.9 * k; for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const u = (t * 1.6 + i / 4) % 1, x = hd.x + s * (hd.hh * 0.95 + u * hd.hh * 0.6), y = hd.y - u * hd.hh * 1.3, r = hd.hh * (0.28 + u * 0.4);
  c.fillStyle = `rgba(255,255,255,${1 - u * 0.7})`; c.strokeStyle = `rgba(150,160,175,${1 - u * 0.7})`; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke(); } c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function whistle(c, hd, t, on) { if (!on) return; c.save(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; c.lineCap = 'round'; for (let i = 0; i < 2; i++) { const u = (t * 1.2 + i * 0.5) % 1, x = hd.x - hd.hh * (0.9 + u * 1.2), y = hd.y - hd.hh * (0.2 + u * 1.1); c.globalAlpha = 1 - u;
  c.beginPath(); c.ellipse(x, y, 16, 12, -0.3, 0, TAU); c.fillStyle = '#2B2F3A'; c.fill(); c.beginPath(); c.moveTo(x + 14, y); c.lineTo(x + 14, y - 60); c.quadraticCurveTo(x + 30, y - 50, x + 40, y - 30); c.stroke(); } c.restore(); }   // musical notes (drawn)

function world(c, t, L) { const heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  heads.bf15 = K.put(c, bfCfg(t, L), bfState(t, L), X.bf, 0);
  heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  island(c);
  standPhone(c, t, L, L === 'hook' ? clamp((t - hev('slap')) / 0.05) : 0);
  // his hand over the phone in the hook: redraw only the hand on top (the arm is behind the phone)
  if (L === 'hook' && t > hev('slap') - 0.05) { const hx = PH.x + 10, hy = PH.y1 - PH.h * 0.55 + 10; c.save(); c.fillStyle = BF.skin; c.strokeStyle = '#8A5A3A'; c.lineWidth = 5; c.beginPath(); c.ellipse(hx, hy, 105, 120, 0.15, 0, TAU); c.fill(); c.stroke();
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(hx - 60 + i * 38, hy - 40); c.lineTo(hx - 56 + i * 36, hy - 150); c.lineWidth = 34; c.strokeStyle = BF.skin; c.lineCap = 'round'; c.stroke(); } c.restore(); }
  steam(c, heads.her, t, steamK(t, L));
  if (L === 'o4' || L === 'o3') sweat(c, heads.bf15, t, L === 'o4' ? clamp((t - ev('o4', 'show')) / 0.3) * (t < SP.o4_b.t ? 1 : 0) : clamp((t - ev('o3', 'blush')) / 0.3));
  whistle(c, heads.bf15, t, (L === 'hook' && t > hev('wide') + 0.1) || (L === 'o1' && t > SP.o1_nar.t + 0.4));
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(0, fy(HY('bf15'), 0.72, 980), 0.72, 'cover'), WIDE: S(0, fy(HY('bf15'), 0.48, 820), 0.48, 'wide'),
  TWO: S(0, fy(HY('bf15'), 0.8, 640), 0.8, 'two'),
  HER: S(X.her + 70, fy(HY('her'), 1.0, 860), 1.0, 'her'), HER_CU: S(X.her + 40, fy(HY('her'), 1.25, 900), 1.25, 'her'),
  HUB: S(X.bf - 70, fy(HY('bf15'), 1.0, 860), 1.0, 'hub'), HUB_CU: S(X.bf - 30, fy(HY('bf15'), 1.25, 900), 1.25, 'hub'),
  LIST: U('list', 1), CALL: U('call', 2), BOB: U('bob', 3), ERASE: U('erase', 4), MINE: U('mine', 5), TYPE: U('queen', 6), HELL: U('hell', 7) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('list')) return SH.COVER; if (t < hev('wide')) return f(SH.LIST); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_b.t - 0.1) return f(SH.HER); if (t < e('call')) return f(SH.HUB); if (t < e('ring') + 0.25) return f(SH.TWO); if (t < e('steam') - 0.05) return f(SH.CALL); if (t < SP.o1_nar.t - 0.05) return f(SH.HER_CU); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_b.t - 0.1) return f(SH.HER); if (t < e('bob')) return f(SH.HUB); if (t < e('palm') - 0.05) return f(SH.BOB); if (t < SP.o2_nar.t - 0.05) return f(SH.HER); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_b.t - 0.1) return f(SH.HER); if (t < e('erase')) return f(SH.HUB); if (t < e('blush') - 0.05) return f(SH.ERASE); if (t < SP.o3_nar.t - 0.05) return f(SH.HUB_CU); return f(SH.TWO); }
  if (L === 'o4') { const c3 = SP.o4_h.t + SP.o4_h.words[17][1]; if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < c3) return f(SH.HER); if (t < e('show')) return f(SH.TWO); if (t < e('type') - 0.05) return f(SH.MINE); return f(SH.HUB); }
  if (L === 'end') { if (t < e('smug') - 0.05) return f(SH.TYPE); if (t < e('dial') - 0.05) return f(SH.HER); if (t < e('ring') - 0.05) return f(SH.HUB); if (t < e('hell')) return f(SH.HER); if (t < SP.end_h.t - 0.1) return f(SH.HELL); if (t < e('stare') - 0.02) return f(SH.HER_CU); if (t < e('moral') - 0.05) return f(SH.HUB_CU); return f(SH.WIDE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- phone inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const PS = 1.45, PY = 860;
function insertPhone(c, t, t0, screen, bz = 0) { const k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6); K.phone(c, 540 + bz, PY, PS * k, screen, 0); }
function statusBar(c, w, dark) { fitTxt(c, '9:41', 50, 34, 24, dark ? '#FFFFFF' : '#2B2F3A', 80, 'Nun9'); c.fillStyle = dark ? '#FFFFFF' : '#2B2F3A'; rr(c, w - 74, 24, 44, 20, 5); c.fill(); for (let i = 0; i < 4; i++) c.fillRect(w - 130 + i * 10, 42 - i * 6, 7, 6 + i * 6); }
function listView(c, t) { backdrop(c, t, '#BFE0F0', '#7FB4D8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'list' });
  const t0 = hev('list'), u = t - t0;
  insertPhone(c, t, t0, (q, w, h) => { q.fillStyle = '#F7F7F9'; q.fillRect(0, 0, w, h); statusBar(q, w);
    fitTxt(q, 'Favorites', 30, 104, 46, '#2B2F3A', 300, 'Unb9', 'left');
    const rows = [['BORING BOB', 'bob'], ["DON'T ANSWER", 'her'], ['PIZZA GUY (FAMILY)', 'pizza'], ['MOM', 'mom']];
    rows.forEach(([nm, who], i) => { const kk = eOut(clamp((u - 0.1 - i * 0.1) / 0.25)); if (kk <= 0) return; const y = 170 + i * 128; q.save(); q.translate((1 - kk) * 200, 0); q.globalAlpha = kk;
      if (who === 'her') { q.fillStyle = 'rgba(224,71,76,.16)'; q.fillRect(0, y - 8, w, 124); }
      if (who === 'pizza') { const pk = clamp((t - hev('pizza')) / 0.2), pulse = pk * (0.6 + 0.4 * Math.sin((t - hev('pizza')) * 8)); q.fillStyle = `rgba(242,193,78,${0.55 * pulse})`; q.fillRect(0, y - 8, w, 124); if (pk > 0) starIcon(q, w - 36, y + 54, 22 * eBack(pk, 2), '#F2B33D'); }
      avatar(q, 72, y + 54, 46, who); fitTxt(q, nm, 138, y + 56, 34, who === 'her' ? '#C0303A' : '#2B2F3A', who === 'pizza' ? 220 : 250, 'Unb9', 'left');
      q.fillStyle = 'rgba(0,0,0,.08)'; q.fillRect(138, y + 118, w - 150, 3); q.restore(); }); }); }
function callView(c, t) { backdrop(c, t, '#F7D0DC', '#E8A0B8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'call' });
  const t0 = ev('o1', 'ring') + 0.25, dec = ev('o1', 'decline'), ended = t >= dec + 0.12, bz = !ended ? Math.sin(t * 70) * 5 : 0;
  insertPhone(c, t, t0, (q, w, h) => { callFace(q, w, h, "DON'T ANSWER", 'her', t, ended ? 'ended' : 'ring');
    const rp = clamp((t - dec) / 0.4); if (rp > 0 && rp < 1) { q.strokeStyle = `rgba(255,255,255,${1 - rp})`; q.lineWidth = 10; q.beginPath(); q.arc(ended ? w / 2 : w * 0.27, h * 0.82, w * 0.11 + rp * 80, 0, TAU); q.stroke(); } }, bz); }
function cardFace(q, w, h, name, who, t, t0, extra) { q.fillStyle = '#F7F7F9'; q.fillRect(0, 0, w, h); statusBar(q, w);
  const g = q.createLinearGradient(0, 60, 0, 380); g.addColorStop(0, who === 'him' ? '#BDE8E1' : '#DADDE2'); g.addColorStop(1, '#F7F7F9'); q.fillStyle = g; q.fillRect(0, 60, w, 320);
  const k = eBack(clamp((t - t0 - 0.1) / 0.3), 2); avatar(q, w / 2, 210, 110 * k, who);
  fitTxt(q, name, w / 2, 380, 52, '#2B2F3A', w - 40);
  fitTxt(q, 'mobile  (555) 014-2273', w / 2, 432, 24, '#6A707A', w - 60, 'Nun9');
  [['message', -1], ['call', 0], ['video', 1]].forEach(([lab, i]) => { const x = w / 2 + i * 120; q.fillStyle = '#E4E8EC'; q.beginPath(); q.arc(x, 520, 40, 0, TAU); q.fill(); if (lab === 'call') handset(q, x, 520, 0.7, '#3E73B8'); else if (lab === 'message') { q.fillStyle = '#3E73B8'; q.beginPath(); q.ellipse(x, 516, 22, 16, 0, 0, TAU); q.fill(); q.beginPath(); q.moveTo(x - 10, 528); q.lineTo(x - 18, 540); q.lineTo(x, 530); q.fill(); } else { q.fillStyle = '#3E73B8'; rr(q, x - 22, 506, 28, 26, 5); q.fill(); q.beginPath(); q.moveTo(x + 8, 519); q.lineTo(x + 22, 508); q.lineTo(x + 22, 530); q.fill(); }
    fitTxt(q, lab, x, 580, 20, '#3E73B8', 100, 'Nun9'); });
  if (extra) extra(q, w, h); }
function bobView(c, t) { backdrop(c, t, '#DADDE2', '#AEB4BC'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'bob' });
  const t0 = ev('o2', 'bob'); insertPhone(c, t, t0, (q, w, h) => cardFace(q, w, h, 'BORING BOB', 'bob', t, t0, (q2, w2) => { fitTxt(q2, 'notes: beige. likes beige.', w2 / 2, 660, 24, '#9AA0A8', w2 - 60, 'Nun9'); })); }
function mineView(c, t) { backdrop(c, t, '#F7D0DC', '#E8A0B8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'mine' });
  const t0 = ev('o4', 'show'); insertPhone(c, t, t0, (q, w, h) => cardFace(q, w, h, 'ALWAYS ANSWER', 'him', t, t0, (q2, w2) => { const k = eBack(clamp((t - t0 - 0.35) / 0.3), 2.2); if (k > 0) { starIcon(q2, w2 / 2, 660, 44 * k, '#F2B33D'); fitTxt(q2, 'Favorite', w2 / 2, 712, 24, '#B8860B', 200, 'Nun9'); } })); }
function editFace(q, w, h, txt, caret, saved, t) { q.fillStyle = '#F7F7F9'; q.fillRect(0, 0, w, h); statusBar(q, w);
  fitTxt(q, 'Cancel', 24, 100, 22, '#3E73B8', 78, 'Nun9', 'left'); fitTxt(q, 'Edit Contact', w / 2, 100, 26, '#2B2F3A', 190, 'Unb9'); fitTxt(q, 'Done', w - 24, 100, 22, '#3E73B8', 66, 'Unb9', 'right');
  avatar(q, w / 2, 210, 70, 'her');
  q.fillStyle = '#FFFFFF'; rr(q, 20, 300, w - 40, 120, 18); q.fill(); q.strokeStyle = '#3E73B8'; q.lineWidth = 4; q.stroke();
  fitTxt(q, 'name', 40, 324, 20, '#6A707A', 100, 'Nun9', 'left');
  const fz = UI.textFit(q, 'Unb9', 40, txt || 'M', w - 110); q.fillStyle = '#2B2F3A'; q.textAlign = 'left'; q.textBaseline = 'middle'; q.font = `${fz}px Unb9`; if (txt) q.fillText(txt, 40, 372);
  const tw = txt ? q.measureText(txt).width : 0; if (caret && Math.floor(t * 3) % 2 === 0) { q.fillStyle = '#3E73B8'; q.fillRect(44 + tw, 348, 5, 48); }
  if (saved) { q.fillStyle = '#4CAF6A'; q.beginPath(); q.arc(70, 230, 30, 0, TAU); q.fill(); tickIcon(q, 70, 232, 0.9, '#FFFFFF'); }
  // keyboard
  q.fillStyle = '#D5D9DF'; q.fillRect(0, 470, w, h - 470); const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  rows.forEach((r, i) => { const kw = 36, gap = 4, x0 = (w - r.length * (kw + gap)) / 2; [...r].forEach((ch, j) => { const hit = caret && ((Math.floor(t * 12) + j * 3 + i * 5) % 17 === 0); q.fillStyle = hit ? '#9AA6B8' : '#FFFFFF'; rr(q, x0 + j * (kw + gap), 490 + i * 62, kw, 54, 7); q.fill(); fitTxt(q, ch, x0 + j * (kw + gap) + kw / 2, 517 + i * 62, 24, '#2B2F3A', 30, 'Nun9'); }); });
  q.fillStyle = '#FFFFFF'; rr(q, 90, 680, w - 180, 46, 8); q.fill(); }
function eraseView(c, t) { backdrop(c, t, '#BFE0F0', '#7FB4D8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'erase' });
  const t0 = ev('o3', 'erase'), full = "DON'T ANSWER", n = Math.max(0, full.length - Math.floor(clamp((t - t0 - 0.25) / 1.2) * (full.length + 0.99)));
  insertPhone(c, t, t0, (q, w, h) => editFace(q, w, h, full.slice(0, n), true, false, t)); }
function queenView(c, t) { backdrop(c, t, '#E6D4F7', '#B79AE0'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'queen' });
  const t0 = SC.end.s, full = 'ALWAYS ANSWER, MY QUEEN', u = t - t0, n = Math.min(full.length, 13 + Math.floor(clamp((u - 0.05) / 0.45) * 11)), done = u > 0.6;
  insertPhone(c, t, t0, (q, w, h) => { editFace(q, w, h, full.slice(0, n), !done, done, t); const k = eBack(clamp((u - 0.6) / 0.3), 2.4); if (k > 0) { q.save(); q.translate(w / 2 + 100, 175); q.rotate(0.35); crown(q, 0, 0, 0.75 * k); q.restore(); } }); }
function hellView(c, t) { backdrop(c, t, '#2B2F3A', '#1A1E26'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'hell' });
  const t0 = ev('end', 'hell'); insertPhone(c, t, t0, (q, w, h) => callFace(q, w, h, "HE'LL WAIT", 'him', t, 'ring'), Math.sin(t * 70) * 5); }
const VIEWS = { 'ui:list': listView, 'ui:call': callView, 'ui:bob': bobView, 'ui:erase': eraseView, 'ui:mine': mineView, 'ui:queen': queenView, 'ui:hell': hellView };

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 190;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor; then the comment question (ask) big above the buttons
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, ask = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine with her phone + Eric (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.bf15; K.put(c, BF, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { R: handPhone('lit', t) }, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 0.6, gm.ySh + 250, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.7, g.ySh + 300, { planar: true }), items: { R: handPhone('lit', t) } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // header: the answer question during the outro line, then the comment question (ask) — big, above the buttons
  const askK = eBack(P(t, ask.t - 0.1, ask.t + 0.2), 2.0), qOut = P(t, ask.t - 0.25, ask.t - 0.1);
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - qOut);
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  if (askK > 0) { c.save(); c.translate(540, 300); c.scale(askK, askK); textFit(c, 'Unb9', 62, 'КАК ТЫ ЗАПИСАНА', 900); strokeText(c, 'КАК ТЫ ЗАПИСАНА', 0, -90, C.oliveD, C.white, 14); textFit(c, 'Unb9', 62, 'У НЕГО', 900); strokeText(c, 'У НЕГО', 0, -8, C.oliveD, C.white, 14);
    textFit(c, 'Unb9', 74, 'В ТЕЛЕФОНЕ?', 900); strokeText(c, 'В ТЕЛЕФОНЕ?', 0, 82, C.pink, C.white, 14); c.restore(); }
  const tw = [wT('outro', 'один', sp.t + 1.2), wT('outro', 'два', sp.t + 1.6), wT('outro', 'три', sp.t + 1.9), wT('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wT('outro', 'пиши', sp.t + 2.3) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.3) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = svT + 0.6, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < ask.t - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); }   // the ask line is shown big at the top instead of a caption
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { VIEWS[tag](c, t); heads = {}; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { bf15: ['ERIC', '#2F9C8E'] }, onScr = {}; for (const k in heads) { const p = proj(heads[k]); if (p.x > 40 && p.x < W - 40) onScr[k] = heads[k]; }   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_b: -0.2, o1_h: -0.22, o1_b: -0.25, o2_h: -0.22, o2_b: -0.3, o3_h: -0.22, o3_b: -0.3, o4_h: -0.3, o4_b: -0.3, end_h: -0.3 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('dontpick', NF, renderFrame);
