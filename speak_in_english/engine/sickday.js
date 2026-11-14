// "На больничном, а босс лайкнул фото с пляжа" — rubric answers4 «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node sickday.js start end out.mp4 | --png=f1,f2
// USA beach. She is "on sick leave" in a striped beach chair; the boss liked her beach photo and video-calls her ("Lovely tan. How's the fever?").
// Absurd detail: a seagull flies around with her thermometer in its beak (it is also in the liked photo).
// o1 «В ЛОБ»: "Not me! Photoshop!" — "Photoshop gave you a tan line?" -> he raises a magnifier to his camera; her shoulder under the lens: the strap tan line; she throws a towel over it.
// o2 «ВЕЖЛИВО»: fake cough, hand on the forehead — "You look really great for 'really bad'." -> insert: the cocktail umbrella in her water bottle; she hides it under her hat.
// o3 «КАК НОСИТЕЛЬ»: "Doctor said fresh air and rest..." (holds up the doctor's note) — "Fair enough. Get well soon." -> she pulls the hat over her eyes, the seagull lands on her chair; tip.
// o4 «КОРОЛЕВСКИЙ»: "Sea air, sunshine, vitamin D..." (sunglasses slide on, a sip) — he freezes ("...") and writes: "...Send me the name of that clinic." -> notepad «CLINIC?».
// Twist (music silent): the widest shot — the boss on the neighbouring beach chair in the same panama hat: "Don't post the next one. I'm in the background." The seagull drops the thermometer on his hat.
// The heroine says the name of a photo app in o1 (spoken only): no brand or logo is ever drawn.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/sickday/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const SEAT = 330;
const HER = { ...BASE.her_lift, skin: '#DDA57C', top: { type: 'tank', col: '#EF7FAA' }, bottom: { type: 'shorts', col: '#3FB6A8' }, shoes: { col: '#F2C14E', acc: null } };
const BOSS = { ...BASE.mark };                                                                                          // on the video call: blazer + tie
const BOSS_B = { ...BASE.mark, bottom: { type: 'shorts', col: '#E59A3A' }, socks: '#FFFFFF', sockStripe: '#2F3E5C', shoes: { col: '#3A2A20', acc: null } };   // at the beach: blazer + tie + swim shorts + socks
const G = { her: geom(HER, SEAT), boss: geom(BOSS_B, SEAT), bossC: geom(BOSS), herS: geom(HER), bossS: geom(BOSS_B) };
const X = { her: 0, boss: 1650 };
const CRATE = -470;                         // the wooden crate with her water bottle (left of her chair)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// panama hat at the head centre (x, y); lower = pulled down over the eyes; tip = cocktail umbrella sticking out (after o2)
function panama(c, x, y, hw, hh, band, lower = 0, tip = 0) { c.save(); c.translate(x, y - hh * 0.62 + lower * hh * 0.42);
  if (tip > 0) { c.save(); c.translate(hw * 0.35, -hh * 0.55); c.rotate(0.5); c.strokeStyle = '#C98B5A'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -hh * 0.7 * tip); c.stroke();
    c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-hh * 0.42 * tip, -hh * 0.62 * tip); c.quadraticCurveTo(0, -hh * 1.0 * tip, hh * 0.42 * tip, -hh * 0.62 * tip); c.closePath(); c.fill(); c.strokeStyle = '#B0306A'; c.lineWidth = 3; c.stroke(); c.restore(); }
  paint(c, q => { q.m(-hw * 0.82, 4); q.b(-hw * 0.86, -hh * 0.85, hw * 0.86, -hh * 0.85, hw * 0.82, 4); q.z(); }, '#F1E2B8', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = band; c.beginPath(); c.moveTo(-hw * 0.83, -4); c.lineTo(hw * 0.83, -4); c.lineTo(hw * 0.8, -hh * 0.2); c.lineTo(-hw * 0.8, -hh * 0.2); c.closePath(); c.fill();
  paint(c, q => { q.m(-hw * 1.75, 10); q.q(0, hh * 0.32, hw * 1.75, 10); q.q(hw * 1.2, -hh * 0.12, 0, -hh * 0.1); q.q(-hw * 1.2, -hh * 0.12, -hw * 1.75, 10); q.z(); }, '#F6EACB', { sd: 6, hd: 3, lw: 4 });
  c.restore(); }
// sunglasses over the eyes; k = 0 (up on the hat) .. 1 (on the eyes)
function shades(c, x, y, hw, hh, turn, k) { if (k <= 0) return; const ey = lerp(-hh * 0.62, hh * 0.07, eOut(k)); c.save(); c.translate(x, y);
  for (const s of [-1, 1]) { const ex = s * hw * 0.42 + turn * hw * 0.2; c.fillStyle = '#2B2F3A'; c.beginPath(); c.ellipse(ex, ey, hw * 0.33, hh * 0.2, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(ex - hw * 0.1, ey - hh * 0.07, hw * 0.1, hh * 0.05, -0.4, 0, TAU); c.fill(); }
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; c.beginPath(); c.moveTo(-hw * 0.12 + turn * hw * 0.2, ey - 4); c.lineTo(hw * 0.12 + turn * hw * 0.2, ey - 4); c.stroke(); c.restore(); }
// the strap tan line: pale bands next to the tank-top straps (drawn on the torso, before the arms)
const tanLine = (cc, g) => { for (const s of [-1, 1]) { cc.fillStyle = '#FFF6EE'; cc.beginPath(); cc.moveTo(s * g.sw * 0.43, g.ySh - 3); cc.lineTo(s * g.sw * 0.66, g.ySh + 2); cc.quadraticCurveTo(s * g.sw * 0.76, g.ySh + 70, s * g.sw * 0.72, g.ySh + 130); cc.lineTo(s * g.sw * 0.56, g.ySh + 112); cc.quadraticCurveTo(s * g.sw * 0.55, g.ySh + 50, s * g.sw * 0.43, g.ySh - 3); cc.fill(); } };
// phone held in the hand (we see its back: pink case, camera)
const phoneBack = (s = 1) => ctx => { ctx.save(); ctx.scale(s, s); ctx.translate(0, -70); ctx.rotate(-0.08); paint(ctx, q => { q.m(-58, -110); q.l(58, -110); q.l(58, 110); q.l(-58, 110); q.z(); }, '#EE5E9A', { sd: 4, hd: 2, lw: 4 });
  ctx.fillStyle = '#2B2F3A'; rr(ctx, -44, -96, 44, 60, 14); ctx.fill(); ctx.fillStyle = '#5A6478'; for (const [x, y] of [[-32, -82], [-12, -82], [-32, -52]]) { ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-30, 0, -10, -24, 0, -6); ctx.bezierCurveTo(10, -24, 30, 0, 0, 30); ctx.fill(); ctx.restore(); };
// water bottle (0,0 = bottom centre); umb = cocktail umbrella in it (0..1)
function bottle(c, x, y, s, umb = 1, t = 0) { c.save(); c.translate(x, y); c.scale(s, s);
  if (umb > 0) { c.save(); c.translate(18, -300); c.rotate(0.28 + Math.sin(t * 3) * 0.05); c.strokeStyle = '#C98B5A'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 60); c.lineTo(0, -120); c.stroke();
    c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-80, -90); c.quadraticCurveTo(0, -170, 80, -90); c.closePath(); c.fill(); c.strokeStyle = '#B0306A'; c.lineWidth = 4; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; for (const a of [-50, 0, 50]) { c.beginPath(); c.moveTo(0, -128); c.lineTo(a, -92); c.stroke(); } c.restore(); }
  c.save(); c.translate(-22, -300); c.rotate(-0.2); c.fillStyle = '#FFFFFF'; c.fillRect(-7, -130, 14, 170); c.fillStyle = '#E0474C'; for (let i = 0; i < 6; i++) c.fillRect(-7, -128 + i * 30, 14, 12); c.restore();
  c.save(); c.globalAlpha = 0.85; paint(c, q => { q.m(-60, 0); q.l(-60, -200); q.q(-60, -250, -30, -270); q.l(-30, -300); q.l(30, -300); q.l(30, -270); q.q(60, -250, 60, -200); q.l(60, 0); q.z(); }, '#BFE6F5', { sd: 3, hd: 1, lw: 4 }); c.restore();
  c.fillStyle = 'rgba(90,160,220,.35)'; c.fillRect(-56, -150, 112, 146); c.fillStyle = '#3C8FE0'; c.fillRect(-60, -170, 120, 60); fitTxt(c, 'WATER', 0, -139, 34, '#FFFFFF', 100);
  c.fillStyle = '#F2D94E'; c.beginPath(); c.arc(40, -296, 30, Math.PI, TAU); c.fill(); c.strokeStyle = '#D9A82E'; c.lineWidth = 4; c.stroke();
  c.restore(); }
// her doctor's note (held up): in-world English
const noteItem = ctx => { ctx.save(); ctx.translate(-40, -150); ctx.rotate(-0.1); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(-92, -112, 190, 236); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-100, -120, 190, 236); ctx.strokeStyle = '#9AA2B0'; ctx.lineWidth = 3; ctx.strokeRect(-100, -120, 190, 236);
  fitTxt(ctx, 'Rx', -60, -80, 54, '#3C8FE0', 80); ctx.fillStyle = '#E0474C'; ctx.fillRect(10, -100, 16, 50); ctx.fillRect(-7, -83, 50, 16);
  fitTxt(ctx, 'FRESH AIR', -5, -10, 30, '#2B2F3A', 170); fitTxt(ctx, '+ REST', -5, 30, 30, '#2B2F3A', 170); ctx.strokeStyle = '#3C8FE0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-60, 85); ctx.bezierCurveTo(-30, 60, -10, 105, 20, 75); ctx.bezierCurveTo(40, 60, 50, 90, 70, 80); ctx.stroke(); ctx.restore(); };
const umbItem = ctx => { ctx.save(); ctx.translate(0, -30); ctx.rotate(-0.3); ctx.strokeStyle = '#C98B5A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, -110); ctx.stroke(); ctx.fillStyle = '#EE5E9A'; ctx.beginPath(); ctx.moveTo(-75, -80); ctx.quadraticCurveTo(0, -160, 75, -80); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#B0306A'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); };
const bottleItem = t => ctx => bottle(ctx, 0, 84, 0.6, 0, t);
// striped towel thrown over her shoulder (local coords of her body), k = 0..1 (falls in)
function towel(c, g, k) { if (k <= 0) return; c.save(); c.translate(-g.sw * 0.55, g.ySh - 10 - (1 - eOut(k)) * 700); c.rotate(-0.15);
  paint(c, q => { q.m(-150, -20); q.q(0, -60, 150, -10); q.l(120, 330); q.q(-20, 350, -170, 320); q.z(); }, '#FFFFFF', { sd: 6, hd: 3, lw: 4 });
  c.save(); c.beginPath(); c.moveTo(-150, -20); c.quadraticCurveTo(0, -60, 150, -10); c.lineTo(120, 330); c.quadraticCurveTo(-20, 350, -170, 320); c.closePath(); c.clip(); c.fillStyle = '#3C8FE0'; for (let i = -3; i < 4; i++) c.fillRect(i * 80 - 20, -80, 36, 460); c.restore(); c.restore(); }

// lap blanket over her knees in the beach chair (she is "sick"): local coords of the seated body; feet in flip-flops peek out under it
function blanket(c, g, h, col, col2, feet = '#F2C14E') { const yW = -h * 0.47 + SEAT - 70, w0 = g.sw * 1.05, w1 = g.sw * 1.35;
  for (const s of [-1, 1]) { c.fillStyle = feet; c.beginPath(); c.ellipse(s * g.sw * 0.55, -22, 70, 26, 0, 0, TAU); c.fill(); c.fillStyle = '#EDBE98'; c.beginPath(); c.ellipse(s * g.sw * 0.55, -40, 46, 26, 0, 0, TAU); c.fill(); }
  const path = q => { q.m(-w0, yW); q.q(0, yW - 30, w0, yW); q.q(w1 * 1.05, (yW - 80) * 0.5, w1, -70); q.q(0, -40, -w1, -70); q.q(-w1 * 1.05, (yW - 80) * 0.5, -w0, yW); q.z(); };
  paint(c, path, col, { sd: 10, hd: 5, lw: 4 });
  c.save(); c.beginPath(); c.moveTo(-w0, yW); c.quadraticCurveTo(0, yW - 30, w0, yW); c.quadraticCurveTo(w1 * 1.05, (yW - 80) * 0.5, w1, -70); c.quadraticCurveTo(0, -40, -w1, -70); c.quadraticCurveTo(-w1 * 1.05, (yW - 80) * 0.5, -w0, yW); c.clip();
  c.fillStyle = col2; for (let i = -6; i < 7; i++) c.fillRect(i * 70 - 12, yW - 40, 24, -yW + 40); c.fillStyle = 'rgba(255,255,255,.35)'; for (let y = yW + 40; y < -60; y += 90) c.fillRect(-w1 * 1.2, y, w1 * 2.4, 18);
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-g.sw * 0.1, yW + 60); c.quadraticCurveTo(-g.sw * 0.05, yW * 0.5, -g.sw * 0.15, -80); c.moveTo(g.sw * 0.45, yW + 40); c.quadraticCurveTo(g.sw * 0.5, yW * 0.5, g.sw * 0.4, -80); c.stroke(); c.restore(); }
// ---------------- seagull (0,0 = body centre), dir = 1 faces right; therm = carries her thermometer in its beak
function gull(c, x, y, s, t, dir = 1, therm = true, flap = null) { c.save(); c.translate(x, y); c.scale(s * dir, s);
  const f = flap ?? Math.sin(t * 9);
  for (const sd of [-1, 1]) { c.save(); c.translate(-10, -10); c.rotate(sd > 0 ? -0.5 - f * 0.7 : 0.2 + f * 0.5); c.fillStyle = sd > 0 ? '#C9D2DA' : '#AEB8C2'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-60, -150, -20, -230); c.quadraticCurveTo(30, -120, 40, 0); c.closePath(); c.fill(); c.fillStyle = '#4A5060'; c.beginPath(); c.moveTo(-20, -230); c.quadraticCurveTo(-30, -200, -26, -180); c.lineTo(-6, -200); c.fill(); c.restore(); }
  paint(c, q => { q.m(-120, 0); q.q(-40, -55, 60, -30); q.q(120, -10, 70, 30); q.q(0, 55, -120, 0); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#AEB8C2'; c.beginPath(); c.moveTo(-120, 0); c.lineTo(-165, -18); c.lineTo(-160, 14); c.fill();
  paint(c, q => q.e(85, -38, 36, 32), '#FFFFFF', { sd: 3, hd: 2, lw: 4 });
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(97, -46, 6, 0, TAU); c.fill();
  c.fillStyle = '#F2B33D'; c.strokeStyle = '#B86A1A'; c.lineWidth = 3; c.beginPath(); c.moveTo(112, -38); c.lineTo(160, -30); c.lineTo(112, -22); c.closePath(); c.fill(); c.stroke();
  if (therm) thermo(c, 150, -27, 1, 0.12);
  c.restore(); }
// the thermometer: glass rod with a red bulb; (x,y) = the end held in the beak
function thermo(c, x, y, s = 1, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#F4FBFF'; c.strokeStyle = '#7A8A9A'; c.lineWidth = 3; rr(c, -8, -7, 120, 14, 7); c.fill(); c.stroke();
  c.fillStyle = '#E0474C'; c.fillRect(30, -3, 72, 6); c.beginPath(); c.arc(112, 0, 11, 0, TAU); c.fill(); c.strokeStyle = '#A82A30'; c.stroke(); c.restore(); }
// where the seagull is (world): { x, y, dir, therm, flap, s }
function gullAt(t, L) { const base = { x: 620 + 380 * Math.sin(t * 0.45), y: -2150 + 90 * Math.sin(t * 1.3), dir: Math.cos(t * 0.45) > 0 ? 1 : -1, therm: true, s: 1.0 };
  if (L === 'hook') return { ...base, x: 760 + 40 * Math.sin(t * 1.6), y: -1720 + 40 * Math.sin(t * 2.1), dir: -1 };
  if (L === 'o3' && t > ev('o3', 'gull')) { const u = clamp((t - ev('o3', 'gull')) / 0.7), tx = X.her + 175, ty = -1300; const sx = 900, sy = -2200;
    return { x: lerp(sx, tx, eIO(u)), y: lerp(sy, ty, eIO(u)) - Math.sin(u * Math.PI) * 120, dir: -1, therm: true, s: 1.0, flap: u >= 1 ? -0.7 : null, perched: u >= 1 }; }
  if (L === 'end' || L === 'outro') { const u = t - ev('end', 'beat'); return { x: X.boss - 150 + 260 * Math.sin(u * 0.9), y: -2050 + 60 * Math.sin(u * 2), dir: Math.cos(u * 0.9) > 0 ? 1 : -1, therm: t < ev('end', 'drop'), s: 1.0 }; }
  return base; }
function drawGull(c, t, L) { const g = gullAt(t, L); gull(c, g.x, g.y, g.s, t, g.dir, g.therm, g.flap); K.mark(c, 'gull', g.x, g.y, 200); }
// the dropped thermometer (twist): falls onto his hat, bounces off into the sand
function droppedThermo(c, t) { const t0 = ev('end', 'drop'), t1 = ev('end', 'bonk'); if (t < t0) return; const g0 = gullAt(t0, 'end'), hx = X.boss, hy = G.boss.headY - G.boss.hh * 1.1;
  if (t < t1) { const u = (t - t0) / (t1 - t0); thermo(c, lerp(g0.x + 150 * g0.dir, hx, u), lerp(g0.y, hy, u * u), 1.4, u * 6); return; }
  const u = clamp((t - t1) / 0.6); thermo(c, hx + 260 * u, lerp(hy, -60, u * u) - Math.sin(u * Math.PI) * 200, 1.4, 6 + u * 5); }
function stars(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 4; i++) { const a = t * 5 + i * TAU / 4; UI.star(c, hd.x + Math.cos(a) * hd.hh * 1.3, hd.y - hd.hh * 1.2 + Math.sin(a) * hd.hh * 0.35, 26, a); } c.restore(); }

// ---------------- beach (prerendered, softly blurred): USA public beach — sea, palms, lifeguard tower, $ ice-cream sign
const BX0 = -3600, BY0 = -5400, BW = 8200, BH = 6800, BS = 0.5, HOR = -1250;
function drawBeach(c) {
  const sky = c.createLinearGradient(0, BY0, 0, HOR); sky.addColorStop(0, '#5DB8EC'); sky.addColorStop(1, '#CFEFFB'); c.fillStyle = sky; c.fillRect(BX0, BY0, BW, HOR - BY0);
  c.fillStyle = '#FFE58A'; c.beginPath(); c.arc(-1700, -3500, 260, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,229,138,.3)'; c.beginPath(); c.arc(-1700, -3500, 420, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,.9)'; for (const [x, y, s] of [[-600, -3900, 1.3], [1300, -3500, 1], [2900, -4100, 1.2], [-2700, -2900, 0.9], [300, -2900, 0.8]]) for (const [dx, dy, r] of [[0, 0, 90], [100, -30, 120], [220, 5, 90], [110, 30, 80]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); }
  // sea
  const sea = c.createLinearGradient(0, HOR, 0, -820); sea.addColorStop(0, '#2E8FC9'); sea.addColorStop(1, '#5CC6E0'); c.fillStyle = sea; c.fillRect(BX0, HOR, BW, 430);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 10; for (let y = HOR + 60; y < -840; y += 80) for (let x = BX0 + ((y / 80) % 2) * 150; x < BX0 + BW; x += 420) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 60, y - 18, x + 120, y); c.stroke(); }
  // a sailboat
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(2200, -1420); c.lineTo(2200, -1750); c.lineTo(2400, -1420); c.closePath(); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(2080, -1400); c.lineTo(2460, -1400); c.lineTo(2400, -1340); c.lineTo(2130, -1340); c.closePath(); c.fill();
  // surf + sand
  c.fillStyle = '#F4F9FB'; c.beginPath(); c.moveTo(BX0, -850); for (let x = BX0; x <= BX0 + BW; x += 200) c.quadraticCurveTo(x + 100, -800, x + 200, -850); c.lineTo(BX0 + BW, -780); c.lineTo(BX0, -780); c.fill();
  const sand = c.createLinearGradient(0, -800, 0, BY0 + BH); sand.addColorStop(0, '#F6E2B0'); sand.addColorStop(1, '#E9C98A'); c.fillStyle = sand; c.fillRect(BX0, -800, BW, BY0 + BH + 800);
  c.fillStyle = 'rgba(200,160,90,.25)'; for (let i = 0; i < 260; i++) { const x = BX0 + ((i * 397) % BW), y = -760 + ((i * 211) % (BY0 + BH + 760)); c.beginPath(); c.ellipse(x, y, 26, 8, 0, 0, TAU); c.fill(); }
  // palms (left + far right)
  for (const [px, ps] of [[-2300, 1.15], [3500, 1.0]]) { c.save(); c.translate(px, -650); c.scale(ps, ps); c.strokeStyle = '#A8783E'; c.lineWidth = 70; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(120, -1300, -40, -2500); c.stroke();
    c.strokeStyle = 'rgba(90,60,30,.35)'; c.lineWidth = 8; for (let y = -200; y > -2400; y -= 130) { const xx = 120 * Math.sin(-y / 2500 * Math.PI) - 40 * (-y / 2500); c.beginPath(); c.moveTo(xx - 32, y); c.lineTo(xx + 32, y - 20); c.stroke(); }
    c.fillStyle = '#3E9A4A'; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.5; c.save(); c.translate(-40, -2500); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, -380, 90, 400, 0.25 * Math.sign(i - 3), 0, TAU); c.fill(); c.restore(); }
    c.fillStyle = '#7A5226'; for (const [dx, dy] of [[-80, -2440], [10, -2420], [-30, -2380]]) { c.beginPath(); c.arc(dx, dy, 40, 0, TAU); c.fill(); } c.restore(); }
  // ice-cream stand sign (left, $) and the beach-hours sign
  c.fillStyle = '#C98B5A'; c.fillRect(-1520, -1500, 30, 820); c.fillRect(-1110, -1500, 30, 820); c.fillStyle = '#FFFFFF'; rr(c, -1620, -1720, 640, 300, 30); c.fill(); c.strokeStyle = '#3C8FE0'; c.lineWidth = 14; c.stroke();
  fitTxt(c, 'ICE CREAM', -1300, -1630, 90, '#E0474C', 560); fitTxt(c, '$3', -1300, -1505, 100, '#3C8FE0', 560);
  c.fillStyle = '#C98B5A'; c.fillRect(2580, -1500, 30, 800); c.fillStyle = '#2E9A6A'; rr(c, 2300, -1760, 600, 300, 26); c.fill(); fitTxt(c, 'PUBLIC BEACH', 2600, -1670, 76, '#FFFFFF', 540); fitTxt(c, 'OPEN 6 AM - 10 PM', 2600, -1550, 60, '#FFFFFF', 540);
  // lifeguard tower far right
  c.save(); c.translate(3150, -620); c.strokeStyle = '#E9E2D4'; c.lineWidth = 34; c.beginPath(); c.moveTo(-200, 0); c.lineTo(-120, -900); c.moveTo(200, 0); c.lineTo(120, -900); c.moveTo(-170, -400); c.lineTo(170, -400); c.stroke();
  c.fillStyle = '#F2B33D'; c.fillRect(-260, -1400, 520, 520); c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(-320, -1400); c.lineTo(0, -1640); c.lineTo(320, -1400); c.fill(); fitTxt(c, 'LIFEGUARD', 0, -1150, 80, '#E0474C', 460); c.restore();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawBeach);

// ---------------- live set pieces: beach chairs, parasol, crate + bottle
function chair(c, x, col) { c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(x, 0, 340, 34, 0, 0, TAU); c.fill();
  c.strokeStyle = '#B07A42'; c.lineWidth = 30; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - 300, 0); c.lineTo(x - 250, -1260); c.moveTo(x + 300, 0); c.lineTo(x + 250, -1260); c.stroke();
  c.save(); c.beginPath(); c.moveTo(x - 250, -1240); c.lineTo(x + 250, -1240); c.lineTo(x + 280, -390); c.lineTo(x - 280, -390); c.closePath(); c.clip();
  c.fillStyle = '#FFFFFF'; c.fillRect(x - 300, -1260, 600, 900); c.fillStyle = col; for (let i = 0; i < 6; i++) c.fillRect(x - 280 + i * 100, -1260, 50, 900); c.restore();
  c.strokeStyle = '#8A5A2A'; c.lineWidth = 26; c.beginPath(); c.moveTo(x - 260, -1250); c.lineTo(x + 260, -1250); c.stroke();
  c.strokeStyle = '#B07A42'; c.lineWidth = 30; c.beginPath(); c.moveTo(x - 330, -560); c.lineTo(x - 300, 0); c.moveTo(x + 330, -560); c.lineTo(x + 300, 0); c.stroke();
  c.lineWidth = 24; c.beginPath(); c.moveTo(x - 360, -560); c.lineTo(x - 230, -560); c.moveTo(x + 360, -560); c.lineTo(x + 230, -560); c.stroke(); }
function parasol(c, x) { c.strokeStyle = '#E9E2D4'; c.lineWidth = 26; c.beginPath(); c.moveTo(x, 40); c.lineTo(x + 120, -2250); c.stroke();
  c.save(); c.translate(x + 120, -2250); c.rotate(0.06); c.beginPath(); c.moveTo(-760, 140); c.quadraticCurveTo(0, -330, 760, 140); c.closePath(); c.save(); c.clip(); c.fillStyle = '#FFFFFF'; c.fillRect(-800, -400, 1600, 600); c.fillStyle = '#EE5E9A';
  for (let i = -4; i < 4; i++) { c.beginPath(); c.moveTo(0, -300); c.lineTo(i * 200 + 0, 160); c.lineTo(i * 200 + 100, 160); c.closePath(); c.fill(); } c.restore(); c.beginPath(); c.moveTo(-760, 140); c.quadraticCurveTo(0, -330, 760, 140); c.closePath(); c.strokeStyle = 'rgba(62,71,30,.4)'; c.lineWidth = 6; c.stroke();
  c.fillStyle = '#FFFFFF'; for (let i = -4; i <= 4; i++) { c.beginPath(); c.arc(i * 190, 150 - Math.abs(i) * 6, 22, 0, Math.PI); c.fill(); } c.restore(); }
function crate(c, t, L) { const x = CRATE; c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(x, 0, 190, 24, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(x - 160, 0); q.l(x - 160, -360); q.l(x + 160, -360); q.l(x + 160, 0); q.z(); }, '#C98B5A', { sd: 6, hd: 3, lw: 4 }); c.strokeStyle = 'rgba(90,60,30,.4)'; c.lineWidth = 6; for (const y of [-120, -240]) { c.beginPath(); c.moveTo(x - 160, y); c.lineTo(x + 160, y); c.stroke(); }
  if (!bottleInHand(t, L)) bottle(c, x + 10, -360, 1, umbrellaInBottle(t), t);
  K.mark(c, 'bottle', x, -600, 260); }
const umbrellaInBottle = t => t < ev('o2', 'hide') + 0.15 ? 1 : 0;
const bottleInHand = (t, L) => L === 'o4' && t > ev('o4', 'sip') - 0.3 && t < ev('o4', 'sip') + 1.1;

// ---------------- characters
const down = (g, s) => reach(g, s, s * g.sw * 1.2, g.ySh + 430, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const phoneUp = g => reach(g, 1, g.sw * 1.55, g.headY + g.hh * 0.9, { planar: true });
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: down(g, -1), armR: down(g, 1), items: {} });
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t, 'her'), mood: 'happy', turn: 0.15, look: 0.5 };
  st.armR = phoneUp(g); st.items = { R: phoneBack(1) }; let hat = { lower: 0, tip: t > ev('o2', 'hide') + 0.45 ? 1 : 0 }, glasses = 0, tw = 0;
  if (L === 'hook') { st.mood = 'happy'; st.look = 0.8;
    if (t > SP.hook_b.t + 0.3) { st.mood = 'shock'; st.blink = 0; }
    const sp = t - hev('spit'); if (sp > -0.2 && sp < 0.6) { st.headY = -14 * Math.sin(clamp((sp + 0.2) / 0.5) * Math.PI); }
    if (t > hev('spit')) st.mood = 'worried'; }
  if (L === 'o1') { st.mood = 'worried';
    if (speaking('o1_h', t, 0.05, 0.1)) { const u = t - SP.o1_h.t; st.mood = 'shock'; st.blink = 0; st.headX = Math.sin(u * 20) * 9; st.armL = reach(g, -1, -g.sw * (1.7 + 0.15 * Math.sin(u * 14)), g.ySh + 110, { planar: true }); }
    if (t > SP.o1_b.t) { st.mood = 'worried'; st.headX = 0; }
    if (t > e('towel')) { st.mood = 'smug'; st.blink = 1; tw = clamp((t - e('towel')) / 0.3); st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 140, { planar: true }); } }
  if (L === 'o2') { st.mood = 'neutral';
    const cu = t - e('cough'); if (cu > -0.1 && cu < 0.8) { st.headFirst = true; st.armL = reach(g, -1, -g.hw * 0.2, g.headY + g.hh * 0.85, { planar: true, fist: true }); st.mood = 'sad'; st.blink = 1; st.headY = Math.abs(Math.sin(cu * 12)) * 8; }
    if (speaking('o2_h', t, 0.05, 0.25)) { st.headFirst = true; st.mood = 'sad'; st.tilt = -0.08; st.armL = reach(g, -1, -g.hw * 0.35, g.headY - g.hh * 0.05, { planar: true }); st.blink = 0.4; }
    if (t > SP.o2_b.t) { st.mood = 'worried'; st.tilt = 0; st.blink = 0; }
    const hu = t - e('hide'); if (hu > -0.3 && hu < 0.6) { st.mood = 'worried'; const k = clamp((hu + 0.3) / 0.3), k2 = clamp((hu - 0.15) / 0.3); st.headFirst = k2 > 0;
      const bx = CRATE + 30 - X.her, by = -720; st.armL = reach(g, -1, lerp(lerp(-g.sw * 1.2, bx, eOut(k)), g.hw * 0.2, eIO(k2)), lerp(lerp(g.ySh + 430, by, eOut(k)), g.headY - g.hh * 1.2, eIO(k2)), { planar: true }); if (hu > 0) st.items = { ...st.items, L: umbItem }; }
    if (hu >= 0.6) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.2)) { st.mood = 'smug'; const u = (t - SP.o3_h.t) * 4.2; st.look = 0.7;
      if (t > e('note')) { st.armL = reach(g, -1, -g.sw * 1.55, g.headY + g.hh * 1.3, { planar: true }); st.items = { ...st.items, L: noteItem }; }
      else st.armL = reach(g, -1, -g.sw * (1.5 + 0.15 * Math.sin(u)), g.ySh + 200 + Math.cos(u) * 20, { planar: true }); }
    if (t > SP.o3_b.t) { st.mood = 'smug'; }
    if (t > e('relax')) { const k = eIO(clamp((t - e('relax')) / 0.4)); st.mood = 'happy'; st.blink = 1; hat.lower = k; st.armL = down(g, -1); } }
  if (L === 'o4') { st.mood = 'smug'; st.look = 0.6; glasses = clamp((t - e('glasses')) / 0.35);
    if (speaking('o4_h', t, 0.05, 0.05)) { const u = (t - SP.o4_h.t) * 3.2; st.mood = 'happy';
      if (t < e('glasses')) st.armL = reach(g, -1, -g.sw * (2.0 + 0.15 * Math.sin(u)), g.ySh + 20 + Math.cos(u) * 25, { planar: true });
      else if (t < e('ch2')) { const k = Math.sin(clamp((t - e('glasses') + 0.1) / 0.6) * Math.PI); st.headFirst = true; st.armL = reach(g, -1, lerp(-g.sw * 1.2, -g.hw * 0.7, k), lerp(g.ySh + 430, g.headY - g.hh * 0.25, k), { planar: true }); }
      else st.armL = reach(g, -1, -g.sw * (1.55 + 0.2 * Math.sin(u)), g.ySh + 170 + Math.cos(u) * 25, { planar: true }); }
    if (bottleInHand(t, L)) { const k = eOut(clamp((t - ev('o4', 'sip') + 0.3) / 0.3)) * (1 - eIO(clamp((t - ev('o4', 'sip') - 0.8) / 0.3))); st.headFirst = true;
      st.armL = reach(g, -1, lerp(CRATE - X.her + 20, -g.hw * 0.2, k), lerp(-520, g.headY + g.hh * 2.0, k), { planar: true }); st.items = { ...st.items, L: bottleItem(t) }; st.mood = 'smug'; st.blink = k > 0.6 ? 1 : 0; } }
  if (L === 'end') { st.mood = 'happy'; glasses = 1; st.look = 0.5;
    if (t > ev('end', 'turn')) { st.turn = 0.45; st.look = 1; st.mood = 'surprised'; st.blink = 0; }
    if (t > ev('end', 'shock')) { const u = t - ev('end', 'shock'); st.mood = 'shock'; st.headY = -26 * Math.sin(clamp(u / 0.35) * Math.PI); glasses = 1 - clamp(u / 0.25); st.armL = open(g, -1, 1.8, 40); }
    if (t > ev('end', 'bonk') + 0.1) { st.mood = 'happy'; st.laugh = true; }
    if (t > ev('end', 'moral')) { st.laugh = false; st.mood = 'smug'; st.turn = 0.3; st.look = 0.6; } }
  st.afterTorso = (cc) => { tanLine(cc, G.her); blanket(cc, G.her, HER.h || 1480, '#F2B33D', '#E0474C'); };
  st.front = (cc, gg) => { if (tw > 0) towel(cc, G.her, tw); shades(cc, gg.head.x, gg.head.y, G.her.hw, G.her.hh, st.turn, glasses); panama(cc, gg.head.x, gg.head.y, G.her.hw, G.her.hh, '#EE5E9A', hat.lower, hat.tip); };
  return st; }
// the boss at the beach (twist), seated on the neighbouring chair
function bossBeach(t, L) { const g = G.boss, st = { ...seated(g, t, 'boss3'), mood: 'worried', turn: -0.35, look: -0.8 };
  st.armR = reach(g, 1, g.sw * 1.5, g.headY + g.hh * 1.0, { planar: true }); st.items = { R: phoneBack(1) };
  if (L === 'end') { const e = k => ev('end', k);
    if (t < e('turn')) { st.turn = 0; st.look = 0.3; st.mood = 'smug'; }
    if (speaking('end_b', t, 0.1, 0.1)) { st.mood = 'worried'; st.headFirst = true; st.armL = reach(g, -1, -g.hw * 1.05, g.headY + g.hh * 0.75, { planar: true }); st.tilt = -0.05; }
    if (t > e('bonk')) { const u = t - e('bonk'); st.mood = 'tired'; st.blink = 0.6; st.headY = 18 * Math.exp(-u * 4) * Math.sin(u * 30); st.armL = down(g, -1); }
    if (t > e('moral')) { st.mood = 'happy'; st.blink = 0; st.look = -0.6; } }
  st.afterTorso = (cc) => blanket(cc, g, BOSS_B.h || 1660, '#7FA6D8', '#2F3E5C', '#3A2A20');
  st.front = (cc, gg) => panama(cc, gg.head.x, gg.head.y, g.hw, g.hh, '#EE5E9A');
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her'], cover: ['her'], her: ['her'], reveal: ['her', 'boss3'], two: ['her', 'boss3'], boss: ['boss3'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || ['her'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  parasol(c, -560); drawGull(c, t, L);
  chair(c, X.her, '#3FB6A8'); chair(c, X.boss, '#F2B33D'); crate(c, t, L);
  if (who.includes('boss3')) { heads.boss3 = K.put(c, BOSS_B, bossBeach(t, L), X.boss, 0); if (L === 'end') stars(c, heads.boss3, t, clamp((t - ev('end', 'stars')) / 0.2) * (1 - clamp((t - ev('end', 'moral') - 1.2) / 0.3))); }
  if (who.includes('her')) { heads.her = K.put(c, HER, herState(t, L), X.her, 0); K.mark(c, 'her_phone', X.her + G.her.sw * 1.55, G.her.headY + G.her.hh * 0.6, 160); }
  if (L === 'end') droppedThermo(c, t);
  // hook spit-take: a spray of water from her mouth
  if (L === 'hook' && heads.her) { const u = t - hev('spit'); if (u > 0 && u < 0.7) { c.save(); c.fillStyle = 'rgba(140,200,240,.85)'; for (let i = 0; i < 14; i++) { const a = -0.5 + i * 0.07, v = 900 * u * (0.6 + (i % 4) * 0.15), x = heads.her.x + 40 + Math.cos(a) * v, y = heads.her.y + heads.her.hh * 0.5 + Math.sin(a) * v + 900 * u * u; c.beginPath(); c.arc(x, y, 16 * (1 - u / 0.7) + 4, 0, TAU); c.fill(); } c.restore(); } }
  if (!heads.her) heads.her = OFFL; if (!heads.boss3) heads.boss3 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;   // camera y so that world y hy lands at screen y sy
const SH = { COVER: S(170, fy(0, 0.64, 1830), 0.64, 'cover'), WIDE: S(40, fy(0, 0.46, 1720), 0.46, 'wide'),
  HER: S(X.her + 70, fy(G.her.headY, 1.0, 760), 1.0, 'her'), LENS: S(X.her - 40, fy(G.her.headY, 1.15, 700), 1.15, 'her'),
  REVEAL: S(820, fy(0, 0.34, 1700), 0.34, 'reveal'), TWO: S(850, fy(0, 0.4, 1560), 0.4, 'two'),
  BOSS: S(X.boss - 70, fy(G.boss.headY, 1.0, 760), 1.0, 'boss'),
  CALL: U('call', 1), PHOTO: U('photo', 2), BOTTLE: U('bottle', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('photo')) return SH.COVER; if (t < hev('wide') - 0.05) return f(SH.PHOTO); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < e('mag')) return f(SH.HER); if (t < e('lens')) return f(SH.CALL); if (t < e('towel') - 0.02) return f(SH.LENS); return f(SH.WIDE); }
  if (L === 'o2') { if (t < e('cough') - 0.1) return f(SH.WIDE); if (t < e('squint')) return f(SH.HER); if (t < e('bottle')) return f(SH.CALL); if (t < e('hide') - 0.35) return f(SH.BOTTLE); return f(SH.WIDE); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_b.t - 0.15) return f(SH.HER); if (t < e('relax')) return f(SH.CALL); return f(SH.WIDE); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('glasses') - 0.05) return f(SH.HER); if (t < e('ch2') - 0.1) return f(SH.WIDE); if (t < e('jaw')) return f(SH.HER); if (t < e('ch3') - 0.1) return f(SH.CALL); if (t < e('freeze')) return f(SH.HER); return f(SH.CALL); }
  if (L === 'end') { if (t < SP.end_b.t - 0.1) return f(SH.REVEAL); if (t < e('shock') - 0.02) return f(SH.BOSS); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// the boss on the video call (screen space): office "virtual background" (a palm leaf peeks through at the edge)
const CW = { x: 80, y: 390, w: 920, h: 1200 }, BS_ = 1.05, BHX = 540, BHY = 1060;   // boss head centre on screen
function bossCallState(t, L) { const g = G.bossC, e = k => ev(L, k), st = { t, talk: talk('boss3', t), mood: 'skeptical', turn: 0, look: 0.1, armL: reach(g, -1, -g.sw * 1.1, g.ySh + 520, { planar: true }), armR: reach(g, 1, g.sw * 1.1, g.ySh + 520, { planar: true }), items: {} };
  if (L === 'hook') { st.mood = 'skeptical'; st.lookY = 0.1; }
  if (L === 'o1') { st.mood = 'skeptical'; const k = eOut(clamp((t - e('mag')) / 0.35)); st.headFirst = true; st.armR = reach(g, 1, lerp(g.sw * 1.1, g.hw * 0.75, k), lerp(g.ySh + 520, g.headY + g.hh * 1.9, k), { planar: true }); st.mag = k; st.headY = -16 * k; }
  if (L === 'o2') { st.mood = 'skeptical'; if (t > e('squint')) { st.squint = true; st.mood = 'happy'; st.headY = -22 * eOut(clamp((t - e('squint')) / 0.3)); st.tilt = 0.06; } }
  if (L === 'o3') { st.mood = 'tired'; if (t > e('sigh')) { const u = clamp((t - e('sigh')) / 0.4); st.headY = 14 * eOut(u); }
    if (speaking('o3_b', t, 0, 0.3)) { st.armL = open(g, -1, 1.9, 260); st.armR = open(g, 1, 1.9, 260); } }
  if (L === 'o4') { st.mood = 'shock'; st.blink = 0;
    if (t > e('freeze')) { st.breathe = 0; st.mood = 'shock'; }
    if (t > e('pen')) { st.mood = 'neutral'; st.lookY = 0.35; st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 330, { planar: true }); st.armR = reach(g, 1, g.sw * 0.35, g.ySh + 300 + Math.sin(t * 30) * 6, { planar: true }); st.notepad = true; }
    if (t > e('note')) { st.lookY = 0; st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 200, { planar: true }); st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 520, { planar: true }); st.show = true; } }
  return st; }
function callView(c, t, L) { backdrop(c, t, '#BFE6F5', '#F6E2B8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'call' });
  const { x, y, w, h } = CW, st = bossCallState(t, L), g = G.bossC; let head = null;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, x + 12, y + 16, w, h, 40); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, x, y, w, h, 40); c.fill();
  c.save(); rr(c, x + 16, y + 16, w - 32, h - 32, 28); c.clip();
  // the office virtual background
  c.fillStyle = '#E8E2D6'; c.fillRect(x, y, w, h); c.fillStyle = '#D8CFBF'; c.fillRect(x, y + h - 260, w, 260);
  c.fillStyle = '#FFFFFF'; c.fillRect(x + 560, y + 80, 300, 360); c.fillStyle = '#C9D2DA'; for (let i = 0; i < 9; i++) c.fillRect(x + 560, y + 92 + i * 40, 300, 18);
  c.fillStyle = '#8A6A4A'; c.fillRect(x + 60, y + 120, 300, 24); c.fillRect(x + 60, y + 300, 300, 24); for (const [bx, bw, col] of [[70, 40, '#3C8FE0'], [115, 50, '#E0474C'], [170, 34, '#4CAF6A'], [210, 46, '#F2B33D'], [262, 40, '#8E5BD0']]) { c.fillStyle = col; c.fillRect(x + bx, y + 30, bw, 90); c.fillRect(x + bx + 10, y + 210, bw - 6, 90); }
  c.fillStyle = '#C98B5A'; rr(c, x + 690, y + h - 420, 150, 160, 20); c.fill(); c.fillStyle = '#3E8A3A'; for (let i = 0; i < 5; i++) { c.save(); c.translate(x + 765, y + h - 420); c.rotate((i - 2) * 0.35); c.beginPath(); c.ellipse(0, -110, 34, 110, 0, 0, TAU); c.fill(); c.restore(); }
  // the glitch at his shoulder: a bit of real beach (sky + a palm leaf) shows through the fake office
  const gk = 0.75 + 0.25 * Math.sin(t * 7); c.save(); c.globalAlpha = gk; c.fillStyle = '#7CC8F2'; c.beginPath(); c.ellipse(BHX - 330, BHY + 230, 120, 80, 0.3, 0, TAU); c.fill(); c.fillStyle = '#3E9A4A'; c.beginPath(); c.ellipse(BHX - 360, BHY + 210, 26, 90, -0.9, 0, TAU); c.fill(); c.restore();
  // the boss (feet far below the window)
  const fx = BHX, fyy = BHY - g.headY * BS_; head = K.put(c, BOSS, st, fx, fyy, BS_);
  if (st.mag > 0) magnifier(c, head, st.mag, t);
  if (st.notepad) notepad(c, head, st.show ? 1 : 0, t, L);
  c.restore();
  c.fillStyle = '#2F3E5C'; rr(c, x + 34, y + h - 96, 170, 58, 29); c.fill(); UI.font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('BOSS', x + 64, y + h - 66);
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(x + w - 56, y + 56, 14 + Math.sin(t * 6) * 2, 0, TAU); c.fill();
  if (L === 'o4' && t > ev('o4', 'freeze') && t < SP.o4_b.t - 0.05) { const a0 = ev('o4', 'freeze') + 0.15, n = Math.min(3, Math.floor((t - a0) / 0.4) + 1); if (t > a0) { c.save(); c.globalAlpha = clamp((SP.o4_b.t - 0.05 - t) / 0.15); for (let i = 0; i < n; i++) { c.fillStyle = C.white; c.beginPath(); c.arc(430 + i * 110, 640, 34, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke(); } c.restore(); } }
  return { boss3: { x: head.x, y: head.y, hh: head.hh } }; }
// magnifier raised to his camera: the lens over his right eye shows one giant eye
function magnifier(c, hd, k, t) { const r = hd.hh * 0.62, cx = hd.x + hd.hh * 0.36, cy = hd.y + hd.hh * 0.02 + (1 - k) * 500; c.save(); c.globalAlpha = clamp(k * 2);
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + r * 0.6, cy + r * 0.8); c.lineTo(cx + r * 0.95, cy + r * 1.75); c.stroke();
  c.save(); c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.clip(); c.fillStyle = '#F3C9A8'; c.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(cx, cy + 6, r * 0.78, r * 0.55, 0, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 8; c.stroke();
  const lx = Math.sin(t * 1.7) * r * 0.15; c.fillStyle = '#3A5A7A'; c.beginPath(); c.arc(cx + lx, cy + 8, r * 0.34, 0, TAU); c.fill(); c.fillStyle = '#1A1A1A'; c.beginPath(); c.arc(cx + lx, cy + 8, r * 0.16, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(cx + lx - r * 0.12, cy - r * 0.06, r * 0.08, 0, TAU); c.fill();
  c.strokeStyle = '#5A3A22'; c.lineWidth = 16; c.beginPath(); c.moveTo(cx - r * 0.75, cy - r * 0.62); c.quadraticCurveTo(cx, cy - r * 0.95, cx + r * 0.75, cy - r * 0.55); c.stroke();
  c.fillStyle = 'rgba(200,235,255,.25)'; c.fillRect(cx - r, cy - r, 2 * r, 2 * r); c.restore();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 18; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, r - 18, 3.6, 4.4); c.stroke(); c.restore(); }
// his notepad; show = 1: held up to the camera with «CLINIC?» written on it
function notepad(c, hd, show, t, L) { const x = hd.x - hd.hh * 0.6 + show * hd.hh * 0.1, y = hd.y + hd.hh * (show ? 2.3 : 2.9); c.save(); c.translate(x, y); c.rotate(show ? -0.06 : 0.25);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-150, -100, 310, 220); c.fillStyle = '#FFF59A'; c.fillRect(-160, -110, 310, 220); c.fillStyle = '#E0474C'; c.fillRect(-160, -110, 310, 26);
  c.strokeStyle = 'rgba(60,140,220,.35)'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-150, -50 + i * 36); c.lineTo(140, -50 + i * 36); c.stroke(); }
  const wr = clamp((t - ev('o4', 'pen') - 0.2) / 1.2); if (wr > 0) { c.save(); c.beginPath(); c.rect(-160, -110, 310 * wr, 220); c.clip(); fitTxt(c, 'CLINIC?', -5, 20, 70, '#2B2F3A', 280, 'Unb9'); c.restore(); }
  c.restore(); }
// the liked photo (hook): a social post on her phone — her beach selfie, the seagull with her thermometer behind her, a red heart
function photoView(c, t) { backdrop(c, t, '#F7D9E6', '#E7A6C2'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'photo' });
  const u = t - hev('photo'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 860); c.scale(k, k); c.translate(-540, -860);
  K.phone(c, 540, 820, 1.5, (s, w, h) => {
    s.fillStyle = '#FFFFFF'; s.fillRect(0, 0, w, h);
    s.fillStyle = '#EE5E9A'; s.beginPath(); s.arc(40, 44, 22, 0, TAU); s.fill(); UI.font(s, 'Nun9', 22); s.fillStyle = '#2B2F3A'; s.textAlign = 'left'; s.textBaseline = 'middle'; s.fillText('sunny_sofia', 74, 44);
    // the photo
    s.save(); s.beginPath(); s.rect(0, 84, w, 400); s.clip();
    const sk = s.createLinearGradient(0, 84, 0, 300); sk.addColorStop(0, '#5DB8EC'); sk.addColorStop(1, '#CFEFFB'); s.fillStyle = sk; s.fillRect(0, 84, w, 220); s.fillStyle = '#2E8FC9'; s.fillRect(0, 300, w, 70); s.fillStyle = '#F6E2B0'; s.fillRect(0, 370, w, 120);
    s.fillStyle = '#FFE58A'; s.beginPath(); s.arc(60, 130, 30, 0, TAU); s.fill();
    gull(s, 300, 150, 0.32, t, -1, true);
    s.save(); s.translate(170, 560); s.scale(0.27, 0.27); const g = G.herS; K.put(s, HER, { t, mood: 'happy', turn: 0.1, look: 0, talk: 0, armL: reach(g, -1, -g.sw * 1.6, g.headY + g.hh * 0.2, { planar: true }), armR: reach(g, 1, g.sw * 1.1, g.ySh + 500, { planar: true }),
      afterTorso: cc => tanLine(cc, g), front: (cc, gg) => { shades(cc, gg.head.x, gg.head.y, g.hw, g.hh, 0.1, 1); panama(cc, gg.head.x, gg.head.y, g.hw, g.hh, '#EE5E9A'); } }, 0, 0); s.restore();
    s.restore();
    // action row: heart (liked, pops), comment, share
    const hk = eBack(clamp((u - 0.35) / 0.3), 2.6); s.save(); s.translate(46, 528); s.scale(0.9 + 0.5 * hk, 0.9 + 0.5 * hk); s.beginPath(); s.moveTo(0, 18); s.bezierCurveTo(-34, -6, -18, -34, 0, -16); s.bezierCurveTo(18, -34, 34, -6, 0, 18);
    s.fillStyle = hk > 0 ? '#E0474C' : '#FFFFFF'; s.fill(); s.strokeStyle = hk > 0 ? '#E0474C' : '#2B2F3A'; s.lineWidth = 3; s.stroke(); s.restore();
    s.strokeStyle = '#2B2F3A'; s.lineWidth = 3.5; s.beginPath(); s.arc(110, 526, 18, 0.6, TAU - 0.2); s.lineTo(98, 548); s.closePath(); s.stroke();
    s.beginPath(); s.moveTo(150, 512); s.lineTo(190, 526); s.lineTo(150, 540); s.lineTo(158, 526); s.closePath(); s.stroke();
    UI.font(s, 'Nun9', 26); s.fillStyle = '#2B2F3A'; s.textAlign = 'left'; s.fillText('Liked by', 24, 588); const lw = s.measureText('Liked by ').width; UI.font(s, 'Unb9', 26); s.fillStyle = '#E0474C'; s.fillText('your boss', 24 + lw, 588);
    UI.font(s, 'Nun7', 24); s.fillStyle = '#2B2F3A'; s.fillText('Sick day. Feeling awful :(', 24, 630); s.fillStyle = '#9AA2B0'; UI.font(s, 'Nun7', 20); s.fillText('2 min ago', 24, 668);
  });
  c.restore(); }
function bottleView(c, t) { backdrop(c, t, '#CDEBFA', '#7CC8F2'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'bottle' });
  const u = t - ev('o2', 'bottle'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 1520); c.scale(k * 2.4, k * 2.4); c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0, 4, 90, 14, 0, 0, TAU); c.fill(); bottle(c, 0, 0, 1, 1, t * 1.3); c.restore();
  const rk = clamp((u - 0.3) / 0.35); if (rk > 0) { c.save(); c.strokeStyle = '#E0474C'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.ellipse(540 + 80, 1520 - 300 * 2.4 - 200, 290, 200, -0.2, -1.4, -1.4 + rk * TAU * 1.02); c.stroke(); c.restore(); } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
// the like notification (cover object): stays on the hook's first shot
function notif(c, t) { if (t >= hev('photo')) return; const y = 500, h = 150, x = 70, w = 940, bob = Math.sin(t * 3) * 4;
  c.save(); c.translate(0, bob); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, x + 8, y + 12, w, h, 36); c.fill(); c.fillStyle = 'rgba(255,255,255,.97)'; rr(c, x, y, w, h, 36); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(x + 82, y + h / 2, 52, 0, TAU); c.fill(); c.save(); c.translate(x + 82, y + h / 2 + 2); c.scale(1.35, 1.35); c.beginPath(); c.moveTo(0, 18); c.bezierCurveTo(-34, -6, -18, -34, 0, -16); c.bezierCurveTo(18, -34, 34, -6, 0, 18); c.fillStyle = '#FFFFFF'; c.fill(); c.restore();
  c.textAlign = 'left'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 46, 'Your boss liked', 560); c.fillStyle = '#E0474C'; c.fillText('Your boss liked', x + 160, y + 52); UI.textFit(c, 'Unb9', 46, 'your photo', 560); c.fillStyle = C.oliveD; c.fillText('your photo', x + 160, y + 104);
  // thumbnail of the photo: sea + the seagull with the thermometer
  c.save(); rr(c, x + w - 150, y + 20, 120, 110, 16); c.clip(); c.fillStyle = '#7CC8F2'; c.fillRect(x + w - 150, y + 20, 120, 70); c.fillStyle = '#2E8FC9'; c.fillRect(x + w - 150, y + 80, 120, 20); c.fillStyle = '#F6E2B0'; c.fillRect(x + w - 150, y + 100, 120, 30); gull(c, x + w - 90, y + 52, 0.18, t, -1, true); c.restore();
  c.restore(); if (global.__QA) global.__QA.ui(c, 'label', { x, y, w, h, k: 1, id: 'notif' }); }
// her shoulder under the boss's magnifier (o1): the lens sits below-left of her face and shows the strap tan line, magnified
function lens(c, t, cam) { const t0 = ev('o1', 'lens'), t1 = ev('o1', 'towel'); if (t < t0 || t > t1) return; const k = eBack(clamp((t - t0) / 0.3), 1.8) * (1 - clamp((t - t1 + 0.12) / 0.12));
  const g = G.her, wx = X.her - g.sw * 0.5, wy = g.ySh + 35, R2 = 270, lx = 360, ly = 1180, Z = cam.z * 2.6;
  c.save(); c.translate(lx, ly); c.scale(k, k);
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(-R2 * 0.6, R2 * 0.7); c.lineTo(-R2 * 1.05, R2 * 1.5); c.stroke();
  c.save(); c.beginPath(); c.arc(0, 0, R2, 0, TAU); c.clip(); c.fillStyle = '#DDA57C'; c.fillRect(-R2, -R2, 2 * R2, 2 * R2);
  c.save(); c.scale(Z, Z); c.translate(-wx, -wy); world(c, t, 'o1', 'her'); c.restore();
  const pk = 0.5 + 0.5 * Math.sin(t * 9); c.strokeStyle = `rgba(224,71,76,${0.6 + 0.4 * pk})`; c.lineWidth = 10; c.beginPath(); c.ellipse(0, 0, 120, 175, 0.15, 0, TAU); c.stroke(); c.restore();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 22; c.beginPath(); c.arc(0, 0, R2, 0, TAU); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, R2 - 20, 3.6, 4.4); c.stroke(); c.restore();
  if (global.__QA) global.__QA.ui(c, 'insert', { x: lx - R2, y: ly - R2, w: 2 * R2, h: 2 * R2, k, id: 'lens' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question (ask)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI, aT = SC.outro.ev.ask;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + the boss, both in panama hats (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.herS, gm = G.bossS;
    K.put(c, BOSS_B, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { R: phoneBack(1) }, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 1.5, gm.headY + gm.hh, { planar: true }),
      front: (cc, gg) => panama(cc, gg.head.x, gg.head.y, gm.hw, gm.hh, '#EE5E9A') }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.55, g.headY + g.hh * 0.9, { planar: true }), items: { R: phoneBack(1) },
      afterTorso: cc => tanLine(cc, g), front: (cc, gg) => { shades(cc, gg.head.x, gg.head.y, g.hw, g.hh, 0, 1); panama(cc, gg.head.x, gg.head.y, g.hw, g.hh, '#EE5E9A', 0, 1); } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // header: «А ТЫ БЫ ОТВЕТИЛА КАК?» -> on the ask line it flips to the comment question
  const sw_ = P(t, aT - 0.15, aT + 0.1), q = eBack(P(u, 0.2, 0.55), 2.2) * (sw_ < 0.5 ? 1 - sw_ * 2 : 0), qa = eBack(P(t, aT - 0.05, aT + 0.3), 2.2);
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); textFit(c, 'Unb9', 64, 'А ТЫ БЫ', 860); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); textFit(c, 'Unb9', 64, 'ОТВЕТИЛА КАК?', 860); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  if (qa > 0) { c.save(); c.translate(540, 300); c.scale(qa, qa); c.rotate(-0.02); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -440 + 8, -170 + 12, 880, 340, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -440, -170, 880, 340, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 74, 'ЛАЙКАТЬ', 800); c.fillStyle = C.oliveD; c.fillText('ЛАЙКАТЬ', 0, -92); textFit(c, 'Unb9', 84, 'БЫЛО МОЖНО?', 800); strokeText(c, 'БЫЛО МОЖНО?', 0, 0, C.pink, C.oliveD, 10);
    textFit(c, 'Unb9', 56, 'ДА ИЛИ НЕТ?', 800); c.fillStyle = C.oliveD; c.fillText('ДА ИЛИ НЕТ?', 0, 100); c.restore();
    if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 130, w: 880, h: 340, k: qa, id: 'ask' }); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 2.8) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.3) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = svT + 0.6, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < aT - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); }   // the ask line is shown big in the header instead
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

const HOLD = { hook_b: 0.3, o1_h: -0.2, o1_b: -0.2, o2_h: -0.2, o2_b: -0.2, o3_h: -0.2, o3_b: -0.2, o4_h: -0.2, o4_b: 0.3, end_b: -0.2 };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads = {}, proj = p => p;
  if (tag === 'ui:call') { heads = callView(c, t, L); Hq.vignette(c, W, HH, 0.2); }
  else if (tag === 'ui:photo') { photoView(c, t); Hq.vignette(c, W, HH, 0.2); }
  else if (tag === 'ui:bottle') { bottleView(c, t); Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
    for (const k in r.heads) if (Math.abs(r.heads[k].x) < 1e4) heads[k] = r.heads[k];   // a speaker who is not in the shot never gets a bubble
    if (tag === 'cover' && L === 'hook') { const ph = { x: X.her + G.her.sw * 1.55, y: G.her.headY - G.her.hh * 1.0, hh: 60 }; heads.boss3 = ph; }   // hook: the boss speaks from her phone
    if (L === 'o1') lens(c, t, cam);
    Hq.vignette(c, W, HH, 0.24); }
  if (tag !== 'ui:photo' && tag !== 'ui:bottle') K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names: { boss3: ['BOSS', '#2F3E5C'] }, hold: HOLD });
  if (L === 'hook') { notif(c, t); title(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('sickday', NF, renderFrame);
