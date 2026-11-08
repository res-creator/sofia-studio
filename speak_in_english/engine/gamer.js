// "Я готова 2 часа, он — в приставке" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node gamer.js start end out.mp4 | --png=f1,f2
// Living room, evening: the heroine (red evening dress, heels, little bag) stands by the front door; her boyfriend sits on the sofa in big headphones with a
// controller; the TV on the right shows LEVEL 47. A wall clock shows it is late.
// hook: close-up — she taps her watch; insert: TV «LEVEL 47»; wide on «Четыре ответа».
// o1 «В ЛОБ»: "Game off! Now! Go!" (open palm to the door) -> "Can't pause online..." -> insert: twelve little players waving on the TV; she is stunned.
// o2 «ВЕЖЛИВО»: "Maybe we could go soon?" -> "After the boss." -> insert: the boss... then a second, bigger boss climbs out behind it; she deflates.
// o3 «КАК НОСИТЕЛЬ»: "I'm leaving in five minutes — with or without you." -> "Saving! Saving! Where are my shoes?" — he jumps up and hops on one leg in
//    socks with a trainer; insert: SAVED; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the sweet line with a lipstick mirror; on "waiter" his headphones slide to his neck, he sweats -> "Game over!" -> insert: he yanks the
//    plug out of the socket -> TV black (the music dies with it).
// Twist «ЧЕРЕЗ 5 МИНУТ»: he is dressed and ready by the door; she sits on the sofa in HIS headphones with the controller: "Shh... I'm winning." -> insert: his
//    save slot gets overwritten -> "...That's my save!" -> PLAYER 2 WINS, rain cloud over him. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/gamer/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- cast
const DRESS = '#D23A5E';
const HER = { ...BASE.her_lift, necklace: true, top: { type: 'tank', col: DRESS }, bottom: { type: 'skirt', col: DRESS }, shoes: { col: '#7A1630', acc: null } };
const BF = { ...BASE.tom, hair: { style: 'short', col: '#3A2618' }, top: { type: 'hoodie', col: '#5A6B7E' }, bottom: { type: 'joggers', col: '#2B2F3A' }, shoes: { col: '#F4F4F4', acc: null } };   // socks
const BF_READY = { ...BF, top: { type: 'blazer', col: '#2F3E5C', shirt: '#F7F9FC', tie: '#E0474C' }, bottom: { type: 'trousers', col: '#2F3E5C' }, shoes: { col: '#2A1E18', acc: null } };
const G = { her: geom(HER), bf6: geom(BF) };
const SEAT = 330;
const X = { her: -580, bf: 300, door: -600 }, XUP = 360;
const SX0 = -150, SX1 = 820, TVX = 1160, TVY = -830, TVW = 470, TVH = 280, DOORX = -1000;

// ---------------- props (all drawn with paths; English only on the props)
function padDraw(c, s = 1, col = '#2A2E3E') { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-70, -34); q.q(0, -48, 70, -34); q.q(112, -30, 110, 26); q.q(104, 64, 70, 40); q.q(0, 18, -70, 40); q.q(-104, 64, -110, 26); q.q(-112, -30, -70, -34); q.z(); }, col, { sd: 5, hd: 3, lw: 4 });
  c.fillStyle = '#C9CED6'; c.fillRect(-72, -6, 38, 12); c.fillRect(-59, -19, 12, 38);
  for (const [dx, dy, cc] of [[56, -16, '#5EC27A'], [72, 0, '#E0474C'], [40, 0, '#3FA9F5'], [56, 16, '#F2C14E']]) { c.fillStyle = cc; c.beginPath(); c.arc(dx, dy, 8, 0, TAU); c.fill(); }
  c.restore(); }
// big over-ear headphones: on the head or slid down round the neck
function headphones(c, gg, g, mode = 'head', col = '#2B2F3A', acc = '#3FD0A0') { const hx = gg.head.x, hy = gg.head.y, hw = g.hw, hh = g.hh; c.save();
  if (mode === 'head') { c.strokeStyle = col; c.lineWidth = hw * 0.16; c.lineCap = 'round'; c.beginPath(); c.ellipse(hx, hy - hh * 0.02, hw * 1.1, hh * 1.08, 0, Math.PI + 0.32, -0.32); c.stroke();
    for (const s of [-1, 1]) { const x = hx + s * hw * 1.03, y = hy + hh * 0.08; c.fillStyle = col; c.beginPath(); c.ellipse(x, y, hw * 0.2, hh * 0.32, 0, 0, TAU); c.fill(); c.fillStyle = acc; c.beginPath(); c.ellipse(x + s * hw * 0.04, y, hw * 0.08, hh * 0.18, 0, 0, TAU); c.fill(); } }
  else { const y = gg.ySh - hh * 0.02; c.strokeStyle = col; c.lineWidth = hw * 0.14; c.lineCap = 'round'; c.beginPath(); c.ellipse(hx, y - hh * 0.25, hw * 0.85, hh * 0.45, 0, 0.3, Math.PI - 0.3); c.stroke();
    for (const s of [-1, 1]) { const x = hx + s * hw * 0.78, yy = y + hh * 0.05; c.fillStyle = col; c.beginPath(); c.ellipse(x, yy, hw * 0.24, hh * 0.22, s * 0.4, 0, TAU); c.fill(); c.fillStyle = acc; c.beginPath(); c.ellipse(x, yy, hw * 0.1, hh * 0.1, 0, 0, TAU); c.fill(); } }
  c.restore(); }
const bagItem = ctx => { ctx.save(); ctx.strokeStyle = '#E8C46A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(0, 30, 30, 0); ctx.stroke(); ctx.translate(0, 70);
  paint(ctx, q => { q.m(-70, -40); q.l(70, -40); q.q(80, 40, 60, 50); q.l(-60, 50); q.q(-80, 40, -70, -40); q.z(); }, '#2B1A22', { sd: 4, hd: 2, lw: 4 }); ctx.fillStyle = '#E8C46A'; ctx.beginPath(); ctx.arc(0, -20, 9, 0, TAU); ctx.fill(); ctx.restore(); };
const watchItem = (ctx, ha) => { ctx.save(); ctx.rotate(ha); ctx.translate(-34, 0); ctx.fillStyle = '#E8C46A'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 26, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill(); ctx.restore(); };
const mirrorItem = ctx => { ctx.save(); ctx.translate(0, -60); ctx.fillStyle = '#E8C46A'; ctx.beginPath(); ctx.arc(0, 0, 52, 0, TAU); ctx.fill(); ctx.fillStyle = '#CFE8F4'; ctx.beginPath(); ctx.arc(0, 0, 42, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-12, -14, 10, 18, 0.6, 0, TAU); ctx.fill(); ctx.restore(); };
function shoeDraw(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-90, 0); q.q(-96, -40, -60, -60); q.l(-10, -64); q.q(30, -30, 80, -24); q.q(110, -16, 104, 10); q.l(-90, 10); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(-40, -40); c.quadraticCurveTo(10, -50, 40, -20); c.lineTo(20, -14); c.quadraticCurveTo(0, -36, -36, -28); c.fill(); c.fillStyle = '#C9CED6'; c.fillRect(-90, 2, 196, 10); c.restore(); }
const shoeItem = ctx => { ctx.save(); ctx.translate(10, 30); ctx.rotate(0.5); shoeDraw(ctx, 1.3); ctx.restore(); };
function plugDraw(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-40, -50); q.l(40, -50); q.l(46, 40); q.l(-46, 40); q.z(); }, '#F4F6FA', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#9AA6B4'; c.fillRect(-26, 40, 12, 40); c.fillRect(14, 40, 12, 40); c.restore(); }
const plugItem = ctx => { ctx.save(); ctx.translate(0, -40); plugDraw(ctx, 0.8); ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, -40); ctx.quadraticCurveTo(80, -160, 260, -40); ctx.stroke(); ctx.restore(); };
function heart(c, x, y, r, col = '#E0474C') { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.5, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); c.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.5, -r * 0.1, 0, r * 0.9); c.fill(); c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function sparkle(c, x, y, r, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = '#FFE15A'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr_ = i % 2 ? r * 0.35 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fill(); c.restore(); }

// ---------------- TV screen content (English only)
function screenMode(t, L) {
  if (L === 'hook') return 'level';
  if (L === 'o1') return t >= ev('o1', 'tv') - 0.05 ? 'party' : 'game';
  if (L === 'o2') return t >= ev('o2', 'tv') - 0.05 ? 'boss' : 'game';
  if (L === 'o3') { if (t >= ev('o3', 'tv') - 0.05) return 'saved'; if (t >= SP.o3_b.t) return 'saving'; return 'game'; }
  if (L === 'o4') return t >= ev('o4', 'yank') + 0.42 ? 'off' : 'game';
  if (L === 'end') { if (t >= ev('end', 'win')) return 'win'; if (t >= ev('end', 'tv') - 0.05) return 'slot'; return 'game'; }
  return 'game'; }
function avatar(c, x, y, s, col, wave) { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = col; rr(c, -46, 10, 92, 80, 26); c.fill(); c.fillStyle = '#F2C9A8'; c.beginPath(); c.arc(0, -22, 34, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-12, -26, 5, 0, TAU); c.arc(12, -26, 5, 0, TAU); c.fill();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.arc(0, -16, 12, 0.2, Math.PI - 0.2); c.stroke();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; c.beginPath(); c.ellipse(0, -26, 38, 38, 0, Math.PI + 0.3, -0.3); c.stroke(); c.fillStyle = '#2B2F3A'; for (const s_ of [-1, 1]) { c.beginPath(); c.ellipse(s_ * 36, -18, 9, 14, 0, 0, TAU); c.fill(); }
  c.strokeStyle = col; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(38, 26); c.lineTo(62 + Math.cos(wave) * 8, -20 + Math.sin(wave) * 18); c.stroke(); c.fillStyle = '#F2C9A8'; c.beginPath(); c.arc(62 + Math.cos(wave) * 8, -24 + Math.sin(wave) * 18, 13, 0, TAU); c.fill();
  c.restore(); }
function bossDraw(c, x, y, s, col, col2, t) { c.save(); c.translate(x, y); c.scale(s, s); const b = Math.sin(t * 4) * 6;
  for (const sg of [-1, 1]) { c.fillStyle = '#F4F1E0'; c.beginPath(); c.moveTo(sg * 60, -120 + b); c.lineTo(sg * 110, -210 + b); c.lineTo(sg * 100, -105 + b); c.fill(); }
  paint(c, q => { q.m(-150, 60); q.q(-170, -130 + b, 0, -140 + b); q.q(170, -130 + b, 150, 60); q.q(0, 90, -150, 60); q.z(); }, col, { sd: 8, hd: 4, lw: 5 });
  c.fillStyle = '#FFFFFF'; for (const sg of [-1, 1]) { c.beginPath(); c.ellipse(sg * 55, -50 + b, 34, 26, sg * 0.3, 0, TAU); c.fill(); } c.fillStyle = col2; for (const sg of [-1, 1]) { c.beginPath(); c.arc(sg * 50, -46 + b, 13, 0, TAU); c.fill(); }
  c.strokeStyle = '#2B1A22'; c.lineWidth = 9; for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(sg * 95, -90 + b); c.lineTo(sg * 25, -70 + b); c.stroke(); }
  c.fillStyle = '#2B1A22'; rr(c, -70, 0 + b, 140, 40, 16); c.fill(); c.fillStyle = '#FFFFFF'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-60 + i * 28, b); c.lineTo(-46 + i * 28, 20 + b); c.lineTo(-32 + i * 28, b); c.fill(); }
  c.restore(); }
function tvScreen(c, w, h, t, L) { const m = screenMode(t, L);
  c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip();
  if (m === 'off') { c.fillStyle = '#0B0C10'; c.fillRect(-w / 2, -h / 2, w, h); const u = t - ev('o4', 'yank') - 0.42; if (u < 0.25) { const k = 1 - u / 0.25; c.fillStyle = `rgba(255,255,255,${k})`; c.fillRect(-w / 2, -h * 0.02 * (1 + k * 20), w * (1 - u * 3), h * 0.04 * (1 + k * 20)); }
    c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(-w * 0.1, -h / 2); c.lineTo(-w * 0.4, h / 2); c.lineTo(-w / 2, h / 2); c.fill(); c.restore(); return; }
  if (m === 'party') { c.fillStyle = '#25305A'; c.fillRect(-w / 2, -h / 2, w, h); const k0 = ev('o1', 'tv');
    fitTxt(c, '12 PLAYERS ONLINE', 0, -h * 0.4, h * 0.085, '#7CF29A', w * 0.8);
    const cols = ['#E0474C', '#F2B33D', '#4CAF6A', '#3FA9F5', '#8E5BD8', '#EE5E9A'];
    for (let i = 0; i < 12; i++) { const cx = -w * 0.375 + (i % 4) * w * 0.25, cy = -h * 0.16 + Math.floor(i / 4) * h * 0.25, k = eBack(P(t, k0 + 0.1 + i * 0.04, k0 + 0.35 + i * 0.04), 2);
      if (k <= 0) continue; c.fillStyle = 'rgba(255,255,255,.08)'; rr(c, cx - w * 0.11, cy - h * 0.11, w * 0.22, h * 0.22, 12); c.fill();
      avatar(c, cx, cy - Math.abs(Math.sin(t * 7 + i)) * h * 0.012, k * h / 640, cols[i % 6], Math.sin(t * 12 + i * 1.3) * 1.1 - 1.2); }
    c.restore(); return; }
  if (m === 'boss') { const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#3A1240'); g.addColorStop(1, '#8A2A3A'); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
    c.fillStyle = '#2B1A22'; c.fillRect(-w / 2, h * 0.32, w, h * 0.2);
    const b2 = ev('o2', 'boss2'), k2 = eOut(P(t, b2 - 0.05, b2 + 0.45)), sh = t > b2 && t < b2 + 0.5 ? Math.sin(t * 70) * w * 0.006 : 0;
    if (k2 > 0) bossDraw(c, w * 0.08 + sh, lerp(h * 0.9, -h * 0.02, k2), h / 300, '#C8283E', '#FFE15A', t * 0.7);   // the second, bigger boss rises behind
    const k1 = eBack(P(t, ev('o2', 'tv'), ev('o2', 'tv') + 0.3), 2);
    bossDraw(c, -w * 0.08 + sh, h * 0.2, k1 * h / 600, '#7A3AB0', '#E0474C', t);
    // tiny hero
    c.fillStyle = '#3FA9F5'; c.fillRect(-w * 0.4, h * 0.32 - h * 0.14, h * 0.08, h * 0.14); c.fillStyle = '#F2C9A8'; c.beginPath(); c.arc(-w * 0.4 + h * 0.04, h * 0.32 - h * 0.17, h * 0.035, 0, TAU); c.fill();
    const lbl = t >= b2 ? 'BOSS 2' : 'BOSS'; c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, -w * 0.3, -h * 0.47, w * 0.6, h * 0.14, 10); c.fill(); fitTxt(c, lbl, -w * 0.16, -h * 0.4, h * 0.08, '#FFFFFF', w * 0.2);
    c.fillStyle = '#E0474C'; c.fillRect(-w * 0.04, -h * 0.43, w * 0.3, h * 0.06); c.restore(); return; }
  if (m === 'saving' || m === 'saved') { c.fillStyle = '#141A3A'; c.fillRect(-w / 2, -h / 2, w, h); const done = m === 'saved';
    const p_ = done ? 1 : clamp((t - SP.o3_b.t) / (ev('o3', 'tv') - SP.o3_b.t)) * 0.92;
    fitTxt(c, done ? 'SAVED' : 'SAVING...', 0, -h * 0.22, h * 0.15, '#FFFFFF', w * 0.8);
    c.fillStyle = '#2B3360'; rr(c, -w * 0.36, h * 0.02, w * 0.72, h * 0.14, h * 0.07); c.fill(); c.fillStyle = done ? '#7CF29A' : '#3FA9F5'; rr(c, -w * 0.36, h * 0.02, w * 0.72 * p_, h * 0.14, h * 0.07); c.fill();
    if (done) { const k = eBack(P(t, ev('o3', 'tv') + 0.15, ev('o3', 'tv') + 0.45), 2.2); c.save(); c.translate(0, h * 0.34); c.scale(k, k); c.strokeStyle = '#7CF29A'; c.lineWidth = h * 0.04; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-h * 0.08, 0); c.lineTo(-h * 0.02, h * 0.06); c.lineTo(h * 0.1, -h * 0.07); c.stroke(); c.restore(); }
    c.restore(); return; }
  if (m === 'slot') { c.fillStyle = '#141A3A'; c.fillRect(-w / 2, -h / 2, w, h); const t0 = ev('end', 'tv');
    fitTxt(c, 'SAVE SLOT 1', 0, -h * 0.36, h * 0.1, '#F2C14E', w * 0.8);
    const sk = clamp((t - t0 - 0.35) / 0.25); c.fillStyle = 'rgba(255,255,255,.1)'; rr(c, -w * 0.42, -h * 0.2, w * 0.84, h * 0.2, 14); c.fill(); fitTxt(c, 'PLAYER 1 · LEVEL 47', 0, -h * 0.1, h * 0.085, sk > 0 ? '#9AA6B8' : '#FFFFFF', w * 0.76);
    if (sk > 0) { c.strokeStyle = '#E0474C'; c.lineWidth = h * 0.022; c.lineCap = 'round'; c.beginPath(); c.moveTo(-w * 0.38, -h * 0.1); c.lineTo(-w * 0.38 + w * 0.76 * sk, -h * 0.1); c.stroke(); }
    const nk = eBack(P(t, t0 + 0.6, t0 + 0.9), 2.2); if (nk > 0) { c.save(); c.translate(0, h * 0.14); c.scale(nk, nk); c.fillStyle = '#EE5E9A'; rr(c, -w * 0.42, -h * 0.1, w * 0.84, h * 0.2, 14); c.fill(); fitTxt(c, 'PLAYER 2 · LEVEL 48', 0, 0, h * 0.085, '#FFFFFF', w * 0.76); c.restore();
      const rk = eBack(P(t, t0 + 0.85, t0 + 1.1), 2.4); c.save(); c.translate(0, h * 0.37); c.scale(rk, rk); c.rotate(-0.05); fitTxt(c, 'NEW RECORD!', 0, 0, h * 0.11, '#FFE15A', w * 0.7); c.restore(); }
    c.restore(); return; }
  // game / level / win: a little platformer world
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#3B6FE0'); g.addColorStop(1, '#8FD0FF'); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
  const sc = (t * 120) % w;
  c.fillStyle = '#5EC27A'; for (let i = -1; i < 4; i++) { const x = -w / 2 + i * w * 0.45 - sc * 0.5 % (w * 0.45); c.beginPath(); c.ellipse(x, h * 0.32, w * 0.28, h * 0.32, 0, Math.PI, 0); c.fill(); }
  c.fillStyle = '#8A5A2A'; c.fillRect(-w / 2, h * 0.3, w, h * 0.2); c.fillStyle = '#C9873A'; for (let x = -w / 2 - (sc % 60); x < w / 2; x += 60) c.fillRect(x, h * 0.3, 30, 12);
  const jy = -Math.abs(Math.sin(t * 5)) * h * 0.25; c.fillStyle = '#E0474C'; c.fillRect(-w * 0.18, h * 0.3 - h * 0.18 + jy, h * 0.14, h * 0.18); c.fillStyle = '#FFFFFF'; c.fillRect(-w * 0.18 + h * 0.08, h * 0.3 - h * 0.15 + jy, h * 0.035, h * 0.035);
  c.fillStyle = '#F2C14E'; for (let i = 0; i < 4; i++) { const x = ((i * w * 0.3 - t * 160) % (w * 1.2) + w * 1.2) % (w * 1.2) - w * 0.5; c.beginPath(); c.ellipse(x, -h * 0.05, h * 0.035, h * 0.05, 0, 0, TAU); c.fill(); }
  if (m === 'level') { c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, -w * 0.36, -h * 0.44, w * 0.72, h * 0.24, 16); c.fill(); fitTxt(c, 'LEVEL 47', 0, -h * 0.32, h * 0.17, '#FFE15A', w * 0.66); }
  if (m === 'win') { const k = eBack(P(t, ev('end', 'win'), ev('end', 'win') + 0.3), 2.2); c.save(); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, -w * 0.42, -h * 0.36, w * 0.84, h * 0.32, 18); c.fill(); fitTxt(c, 'PLAYER 2 WINS!', 0, -h * 0.2, h * 0.14, '#FFE38A', w * 0.76); c.restore(); }
  c.restore(); }
function tvDraw(c, t, L) { const w = TVW, h = TVH, y = TVY;
  c.fillStyle = '#6A4A34'; rr(c, TVX - 290, -460, 580, 460, 14); c.fill(); c.fillStyle = '#7E5A40'; for (const x of [TVX - 270, TVX + 10]) { rr(c, x, -430, 260, 410, 10); c.fill(); }
  // console box on the stand + game boxes
  c.fillStyle = '#1E2230'; rr(c, TVX + 60, -540, 200, 70, 10); c.fill(); c.fillStyle = '#3FA9F5'; c.fillRect(TVX + 80, -510, 40, 6);
  for (let i = 0; i < 4; i++) { c.fillStyle = ['#E0474C', '#3FA9F5', '#4CAF6A', '#8E5BD8'][i]; c.fillRect(TVX - 250 + i * 34, -560, 26, 100); }
  c.fillStyle = '#1A1C24'; c.fillRect(TVX - 40, -560, 80, 60); rr(c, TVX - 140, -500, 280, 24, 8); c.fill();
  c.fillStyle = '#14161E'; rr(c, TVX - w / 2 - 22, y - h / 2 - 22, w + 44, h + 44, 18); c.fill();
  c.save(); c.translate(TVX, y); tvScreen(c, w, h, t, L); c.restore();
  if (screenMode(t, L) !== 'off') { c.fillStyle = 'rgba(120,180,255,.10)'; c.beginPath(); c.moveTo(TVX - w / 2, y - h / 2); c.lineTo(TVX - w / 2 - 600, y + 500); c.lineTo(TVX - w / 2 - 600, y + 900); c.lineTo(TVX - w / 2, y + h / 2); c.fill(); }
  // the cord down to the wall socket (plugged in until the yank)
  const plugged = !(L === 'o4' && t > ev('o4', 'yank') + 0.3);
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 9; c.beginPath(); c.moveTo(TVX + 200, y + h / 2); c.quadraticCurveTo(TVX + 330, -420, TVX + 380, -250); c.stroke();
  c.fillStyle = '#F4F6FA'; rr(c, TVX + 340, -320, 90, 110, 12); c.fill(); c.strokeStyle = '#B9C2CC'; c.lineWidth = 4; c.stroke(); if (plugged) { c.fillStyle = '#E9EDF1'; rr(c, TVX + 355, -300, 60, 70, 8); c.fill(); }
  else { c.fillStyle = '#2B2F3A'; c.fillRect(TVX + 368, -285, 10, 22); c.fillRect(TVX + 392, -285, 10, 22); }
  K.mark(c, 'tv', TVX, y, 260); }

// ---------------- living room (prerendered, softly blurred)
const BX0 = -3400, BY0 = -4600, BW = 7600, BH = 6800, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#E9DCEB'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(160,130,190,.14)'; for (let x = BX0; x < BX0 + BW; x += 150) c.fillRect(x, BY0, 55, BH);
  c.fillStyle = '#FBF6EE'; c.fillRect(BX0, BY0, BW, -2700 - BY0); c.fillStyle = '#D8C8DA'; c.fillRect(BX0, -2720, BW, 40);
  c.fillStyle = '#C9A6B8'; c.fillRect(BX0, -200, BW, 30);
  // front door (left) with a coat hook
  c.fillStyle = '#FFFDF8'; c.fillRect(DOORX - 330, -2350, 660, 2350); c.fillStyle = '#9A6A4A'; c.fillRect(DOORX - 280, -2300, 560, 2300);
  c.fillStyle = '#8A5A3A'; rr(c, DOORX - 230, -2220, 460, 900, 14); c.fill(); rr(c, DOORX - 230, -1240, 460, 1080, 14); c.fill(); c.fillStyle = '#E8C46A'; c.beginPath(); c.arc(DOORX + 210, -1150, 26, 0, TAU); c.fill();
  c.fillStyle = '#5A3A2A'; c.fillRect(DOORX - 760, -1900, 240, 30); for (const x of [DOORX - 720, DOORX - 560]) { c.beginPath(); c.arc(x, -1850, 16, 0, TAU); c.fill(); }
  paint(c, q => { q.m(DOORX - 740, -1850); q.l(DOORX - 640, -1850); q.l(DOORX - 600, -1250); q.l(DOORX - 780, -1250); q.z(); }, '#C9A06A', { sd: 6, hd: 3, lw: 3 });
  // window: evening city
  c.fillStyle = '#FBF5EC'; rr(c, -520, -2400, 900, 1000, 18); c.fill(); const g = c.createLinearGradient(0, -2370, 0, -1430); g.addColorStop(0, '#1E2450'); g.addColorStop(1, '#C9708A'); c.fillStyle = g; rr(c, -490, -2370, 840, 940, 10); c.fill();
  c.fillStyle = '#2A2A48'; for (const [x, w, h] of [[-470, 140, 320], [-320, 110, 460], [-200, 160, 260], [-30, 120, 520], [100, 150, 380], [250, 90, 300]]) c.fillRect(x, -1430 - h, w, h);
  c.fillStyle = '#FFE38A'; for (let i = 0; i < 26; i++) { const x = -460 + (i * 97) % 800, y = -1480 - (i * 53) % 400; c.fillRect(x, y, 16, 20); }
  c.fillStyle = '#FFF4C8'; c.beginPath(); c.arc(220, -2230, 50, 0, TAU); c.fill();
  c.fillStyle = '#FBF5EC'; c.fillRect(-80, -2370, 18, 940); c.fillStyle = '#8E5BD8'; rr(c, -640, -2480, 160, 1150, 30); c.fill(); rr(c, 340, -2480, 160, 1150, 30); c.fill();
  // wall clock (it's late)
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#5A4A6A'; c.lineWidth = 14; c.beginPath(); c.arc(1150, -1850, 150, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = '#5A4A6A'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.arc(1150 + Math.cos(a) * 118, -1850 + Math.sin(a) * 118, 8, 0, TAU); c.fill(); }
  c.lineCap = 'round'; c.lineWidth = 14; c.beginPath(); c.moveTo(1150, -1850); c.lineTo(1150 + Math.cos(-Math.PI / 2 + 10 / 12 * TAU) * 70, -1850 + Math.sin(-Math.PI / 2 + 10 / 12 * TAU) * 70); c.stroke();
  c.lineWidth = 9; c.beginPath(); c.moveTo(1150, -1850); c.lineTo(1150 + Math.cos(-Math.PI / 2 + 0.75 * TAU) * 105, -1850 + Math.sin(-Math.PI / 2 + 0.75 * TAU) * 105); c.stroke();
  // posters + shelf with game boxes
  c.fillStyle = '#3A3A58'; rr(c, 1700, -2300, 420, 560, 10); c.fill(); c.fillStyle = '#7CF29A'; c.beginPath(); c.moveTo(1910, -2200); c.lineTo(2010, -1960); c.lineTo(1810, -1960); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(1910, -1880, 60, 0, TAU); c.fill();
  c.fillStyle = '#8A5A3A'; c.fillRect(1700, -1500, 600, 26); for (let i = 0; i < 7; i++) { c.fillStyle = ['#E0474C', '#3FA9F5', '#4CAF6A', '#F2B33D', '#8E5BD8', '#EE5E9A', '#2B2F3A'][i]; c.fillRect(1720 + i * 60, -1660, 48, 160); }
  // floor lamp + plant
  c.fillStyle = '#3A3A44'; c.fillRect(-1595 - 300, -1300, 14, 1300); paint(c, q => { q.m(-2020, -1300); q.l(-1760, -1300); q.l(-1820, -1520); q.l(-1960, -1520); q.z(); }, '#F7E6B0', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = 'rgba(255,230,160,.18)'; c.beginPath(); c.arc(-1890, -1350, 420, 0, TAU); c.fill();
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(2380 + i * 30, -700 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; rr(c, 2300, -320, 240, 320, 20); c.fill();
  // floor + rug
  c.fillStyle = '#A0704A'; c.fillRect(BX0, -170, BW, BY0 + BH + 170); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -170, 8, BY0 + BH + 170);
  c.fillStyle = '#D8B8D0'; c.beginPath(); c.ellipse(330, 60, 1150, 120, 0, 0, TAU); c.fill();
  c.fillStyle = '#8A5A3A'; c.beginPath(); c.ellipse(DOORX, 40, 380, 50, 0, 0, TAU); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
function sofaBack(c) { paint(c, q => { q.m(SX0 + 40, -820); q.q((SX0 + SX1) / 2, -860, SX1 - 40, -820); q.l(SX1 - 40, -300); q.l(SX0 + 40, -300); q.z(); }, '#3C8F7A', { sd: 12, hd: 6, lw: 3 });
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 6; for (const x of [SX0 + 330, SX1 - 330]) { c.beginPath(); c.moveTo(x, -800); c.lineTo(x, -420); c.stroke(); } }
function sofaFront(c) { paint(c, q => { q.m(SX0, -440); q.l(SX1, -440); q.l(SX1, -80); q.l(SX0, -80); q.z(); }, '#4FA88A', { sd: 10, hd: 5, lw: 3 });
  for (const s of [-1, 1]) paint(c, q => { const x = s < 0 ? SX0 - 70 : SX1 - 50; q.m(x, -620); q.q(x + 60, -680, x + 120, -620); q.l(x + 120, -80); q.l(x, -80); q.z(); }, '#3C8F7A', { sd: 10, hd: 5, lw: 3 });
  c.fillStyle = '#4A3A2A'; c.fillRect(SX0 - 40, -80, 30, 80); c.fillRect(SX1 + 10, -80, 30, 80); }

// ---------------- character states
const lap = (g, s, dy = 360, k = 0.45) => reach(g, s, s * g.sw * k, g.ySh + dy);
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const hip = (g, s) => reach(g, s, s * g.sw * 0.95, g.ySh + 470, { planar: true });
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: lap(g, -1), armR: lap(g, 1), items: {} });
const standing = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const playPad = (g, st, t, dy = 250, sp = 14) => { const j = Math.sin(t * sp) * 6; st.armL = reach(g, -1, -g.sw * 0.42, g.ySh + dy + j, { planar: true }); st.armR = reach(g, 1, g.sw * 0.42, g.ySh + dy - j, { planar: true }); st.afterTorso = (c, gg) => { c.save(); c.translate(0, gg.ySh + dy - 14); padDraw(c, 0.9); c.restore(); }; };
const tapWatch = (g, st, t, t0) => { const u = t - t0, tap = Math.max(0, Math.sin(u * 13)) * 22; st.armL = reach(g, -1, -g.sw * 0.15, g.ySh + 260, { planar: true }); st.items.L = watchItem; st.armR = reach(g, 1, -g.sw * 0.05, g.ySh + 215 - tap, { planar: true }); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...standing(g, t, 'her'), mood: 'annoyed', turn: 0.3, look: 0.75 };
  st.armL = hip(g, -1); st.armR = down(g, 1); st.items = { R: bagItem };
  if (L === 'hook') { st.mood = 'annoyed'; if (t > hev('tap') - 0.1 && t < hev('tv')) { tapWatch(g, st, t, hev('tap')); st.items.R = null; st.turn = 0.1; st.look = 0.2; st.mood = 'angry'; }
    if (t > hev('wide')) { st.mood = 'angry'; st.armL = hip(g, -1); st.armR = hip(g, 1); st.items = {}; } }
  if (L === 'o1') { st.mood = 'angry'; st.armL = hip(g, -1); st.armR = hip(g, 1); st.items = {};
    if (speaking('o1_h', t, 0.05, 0.15)) { const u = t - SP.o1_h.t; st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 30 + Math.sin(u * 9) * 18, { planar: true }); st.turn = 0.35; st.look = 0.9; }   // open palm out towards the door
    if (t > SP.o1_b.t) { st.mood = 'surprised'; }
    if (t > e('her')) { st.mood = 'shock'; st.blink = 0; st.armL = down(g, -1); st.armR = down(g, 1); st.headY = 6; st.breathe = 0; } }
  if (L === 'o2') { st.mood = 'happy'; st.items = { R: bagItem }; st.armL = reach(g, -1, -g.sw * 0.2, g.ySh + 330, { planar: true }); st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 335, { planar: true }); st.tilt = 0.06;
    if (t > SP.o2_b.t) { st.mood = 'neutral'; st.tilt = 0; }
    if (t > e('her')) { st.mood = 'sad'; st.blink = 0.4; st.headY = 10; st.tilt = -0.05; st.armL = down(g, -1); st.armR = down(g, 1); st.items = { R: bagItem }; } }
  if (L === 'o3') { st.mood = 'skeptical'; st.items = { R: bagItem }; st.armL = hip(g, -1); st.armR = down(g, 1);
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'neutral'; if (t > e('watch') - 0.1 && t < e('watch') + 1.0) { tapWatch(g, st, t, e('watch')); st.items.R = null; } else gest(st, g, 'her', t, -1, 150); }
    if (t > SP.o3_b.t) { st.mood = 'surprised'; }
    if (t > e('her')) { st.mood = 'smug'; st.blink = 1; st.armL = hip(g, -1); st.armR = hip(g, 1); st.items = {}; } }
  if (L === 'o4') { st.mood = 'happy'; st.items = { R: mirrorItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 140, { planar: true }); st.lookY = 0.3; st.turn = 0.25; st.look = 0.5; st.armL = hip(g, -1);
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'happy'; if (t > e('p2')) { st.mood = 'smug'; st.blink = 1; st.lookY = 0; st.look = 0.8; } }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'smug'; st.blink = 1; st.lookY = 0; st.items = {}; st.armR = hip(g, 1); }
    if (t > e('dark')) { st.mood = 'surprised'; st.blink = 0; st.look = 0.9; } }
  return st; }
// the twist + outro: she sits on HIS spot in HIS headphones with the controller
function herSofa(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t, 'her'), mood: 'neutral', turn: 0.3, look: 0.9 }; playPad(g, st, t, 250, 18);
  st.front = (c, gg) => headphones(c, gg, g, 'head', '#2B2F3A', '#3FD0A0');
  if (speaking('end_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.blink = 0.4; }
  if (t > e('win')) { const u = t - e('win'); st.afterTorso = null; st.items = { L: padItem, R: null }; st.mood = 'happy'; st.laugh = true; st.blink = 1;
    st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 60 + Math.sin(u * 9) * 30, { planar: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 60 + Math.cos(u * 9) * 30, { planar: true }); }
  return st; }
const padItem = (ctx, ha, side) => { ctx.save(); ctx.translate(side * 10, -8); padDraw(ctx, 0.62); ctx.restore(); };
function bfState(t, L) { const g = G.bf6, e = k => ev(L, k), st = { ...seated(g, t, 'bf6'), mood: 'happy', turn: 0.3, look: 0.9 }; let hp = 'head';
  playPad(g, st, t);
  if (L === 'hook') { st.mood = 'happy'; if (t > hev('wide')) st.laugh = true; }
  if (L === 'o1') { if (speaking('o1_h', t, 0, 0.1)) { st.mood = 'surprised'; st.turn = 0.05; st.look = 0.1; }
    if (speaking('o1_b', t, 0, 0.2)) { st.mood = 'neutral'; st.turn = 0.3; st.look = 0.9; } }
  if (L === 'o2') { st.mood = 'happy'; if (speaking('o2_b', t, 0, 0.2)) { st.mood = 'neutral'; st.blink = 0.3; } }
  if (L === 'o3') { if (t > SP.o3_h.t + 1.3) { st.mood = 'surprised'; st.blink = 0; st.turn = 0.05; st.look = 0.1; }
    if (t > SP.o3_b.t - 0.05) { playPad(g, st, t, 230, 40); st.mood = 'shock'; st.turn = 0.3; st.look = 0.9; }
    if (t > e('up')) return null; }   // he is standing (bfUp)
  if (L === 'o4') { st.mood = 'happy';
    if (t > e('waiter')) { hp = 'neck'; st.afterTorso = null; st.items = {}; st.armL = lap(g, -1, 360, 0.7); st.armR = lap(g, 1, 360, 0.7); st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.turn = -0.3; st.look = -0.85; }
    if (speaking('o4_b', t, 0.05, 0.1)) { st.mood = 'angry'; st.armL = open(g, -1, 1.7, 40 + Math.sin(t * 10) * 20); st.armR = open(g, 1, 1.7, 40 + Math.cos(t * 10) * 20); st.turn = -0.15; st.look = -0.4; }
    if (t > e('yank') - 0.05) { st.mood = 'angry'; st.turn = 0.3; st.look = 0.8; st.armL = lap(g, -1); st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 180, { planar: true }); st.items = { R: plugItem }; }
    if (t > e('dark') + 0.3) { st.mood = 'happy'; st.turn = -0.25; st.look = -0.7; } }
  st.front = (c, gg) => headphones(c, gg, g, hp);
  return st; }
// o3: up from the sofa, hopping on one leg in socks with a trainer in his hand
function bfUp(t) { const g = G.bf6, u = t - ev('o3', 'up'), st = { ...standing(g, t, 'bf6'), mood: 'worried', turn: -0.1, look: -0.2 };
  st.legPose = 'walk'; st.t = Math.PI / 16; st.blink = 0;   // walk pose frozen with the left leg up = hopping on one leg
  st.items = { R: shoeItem }; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 560, { planar: true }); st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 40 + Math.sin(u * 17) * 40, { planar: true });
  st.tilt = Math.sin(u * 8.7) * 0.06; st.front = (c, gg) => headphones(c, gg, g, 'neck');
  return { st, y: -Math.abs(Math.sin(u * 8.7)) * 150 * clamp(u / 0.15) }; }
// the twist: dressed and ready by the door
function bfReady(t) { const g = G.bf6, e = k => ev('end', k), st = { ...standing(g, t, 'bf6'), mood: 'happy', turn: 0.3, look: 0.8 };
  if (t < e('her')) { const k = eBack(P(t, e('ready'), e('ready') + 0.35), 1.8); st.armL = reach(g, -1, -g.sw * lerp(1.1, 2.0, k), g.ySh + lerp(500, 60, k), { planar: true }); st.armR = reach(g, 1, g.sw * lerp(1.1, 2.0, k), g.ySh + lerp(500, 60, k), { planar: true }); st.laugh = true; }
  else { st.mood = 'surprised'; st.armL = down(g, -1); st.armR = down(g, 1); }
  if (speaking('end_b', t, 0.1, 0.05)) { st.mood = 'shock'; st.blink = 0; st.headFirst = true; st.armL = reach(g, -1, -g.hw * 1.05, g.headY + g.hh * 0.45, { planar: true }); st.armR = reach(g, 1, g.hw * 1.05, g.headY + g.hh * 0.45, { planar: true }); }
  if (t > endOf('end_b') + 0.05) { st.mood = 'sad'; st.blink = 0.5; st.headY = 14; st.breathe = 0.4; st.armL = down(g, -1); st.armR = down(g, 1); st.turn = 0.25; st.look = 0.6; }
  return st; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'bf6'], cover: ['her', 'bf6'], three: ['her', 'bf6'], her: ['her'], bf: ['bf6'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  tvDraw(c, t, L);
  sofaBack(c);
  const twist = L === 'end';
  if (twist) { if (who.includes('her')) heads.her = K.put(c, HER, herSofa(t, L), X.bf, 0); }
  else if (who.includes('bf6')) { const st = bfState(t, L); if (st) heads.bf6 = K.put(c, BF, st, X.bf, 0); }
  sofaFront(c);
  if (L === 'o3' && t > ev('o3', 'up') && who.includes('bf6')) { c.save(); c.translate(X.bf - 120, -470); c.rotate(0.3); padDraw(c, 0.9); c.restore(); }   // the controller dropped on the cushion
  if (twist) { if (who.includes('bf6')) heads.bf6 = K.put(c, BF_READY, bfReady(t), X.door, 0); }
  else { if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
    if (L === 'o3' && t > ev('o3', 'up') && who.includes('bf6')) { const r = bfUp(t); heads.bf6 = K.put(c, BF, r.st, XUP, r.y); } }
  // o4: sweat when he hears "waiter"
  if (L === 'o4' && heads.bf6) sweat(c, heads.bf6, t, clamp((t - ev('o4', 'waiter') - 0.2) / 0.3) * (1 - clamp((t - ev('o4', 'dark')) / 0.3)));
  // the twist: «ready!» sparkles round him, then a little rain cloud after "That's my save!"
  if (twist && heads.bf6) { const hd = heads.bf6, sk = P(t, ev('end', 'ready') + 0.2, ev('end', 'ready') + 0.45) * (1 - P(t, ev('end', 'her') - 0.3, ev('end', 'her') - 0.05));
    for (const [dx, dy, r] of [[-1.6, -0.6, 40], [1.7, -0.9, 34], [1.4, 0.6, 26]]) sparkle(c, hd.x + dx * hd.hh, hd.y + dy * hd.hh, r, sk);
    if (t > endOf('end_b') + 0.2) { const k = eBack(P(t, endOf('end_b') + 0.2, endOf('end_b') + 0.5), 1.8); c.save(); c.translate(hd.x, hd.y - hd.hh * 2.0); c.scale(k, k); c.fillStyle = '#9AA6B8';
      for (const [dx, dy, r] of [[-60, 0, 50], [0, -25, 62], [60, 0, 50], [0, 18, 48]]) { c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fill(); }
      c.strokeStyle = '#5BB6E8'; c.lineWidth = 7; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { const u = (t * 2 + i * 0.27) % 1; c.beginPath(); c.moveTo(-60 + i * 40, 60 + u * 80); c.lineTo(-66 + i * 40, 80 + u * 80); c.stroke(); } c.restore(); } }
  // twist: little hearts over her when she wins
  if (twist && heads.her && t > ev('end', 'win')) { const hd = heads.her; for (let i = 0; i < 4; i++) { const u = ((t - ev('end', 'win')) * 0.9 + i / 4) % 1, a = -Math.PI / 2 + (i - 1.5) * 0.6; c.save(); c.globalAlpha = 1 - u; heart(c, hd.x + Math.cos(a) * hd.hh * (1.4 + u), hd.y + Math.sin(a) * hd.hh * (1.3 + u * 1.2), 24 + 10 * u, i % 2 ? '#EE5E9A' : '#F2C14E'); c.restore(); } }
  if (!heads.her) heads.her = OFFL; if (!heads.bf6) heads.bf6 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HS = G.her.headY, HB = G.bf6.headY + SEAT, HBU = G.bf6.headY, HSS = G.her.headY + SEAT, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(345, fy(HS, 0.47, 1010), 0.47, 'cover'), WIDE: S(345, fy(HS, 0.47, 960), 0.47, 'wide'),
  HER: S(X.her + 20, fy(HS, 1.0), 1.0, 'her'), HER_CU: S(X.her + 10, fy(HS, 1.3, 860), 1.3, 'her'), HER_R: S(X.her + 20, fy(HS, 1.12, 900), 1.12, 'her'),
  BF: S(X.bf + 100, fy(HB, 1.0, 950), 1.0, 'bf'), BF_CU: S(X.bf + 40, fy(HB, 1.3, 950), 1.3, 'bf'), BF_UP: S(XUP + 20, fy(HBU, 0.62, 640), 0.62, 'bf'),
  THREE: S(-100, fy(HS, 0.66, 860), 0.66, 'three'),
  END_DOOR: S(X.door + 40, fy(HBU, 0.78, 760), 0.78, 'bf'), END_HER: S(X.bf + 60, fy(HSS, 1.05, 950), 1.05, 'her'), END_BF: S(X.door + 20, fy(HBU, 1.2, 880), 1.2, 'bf'),
  ENDW: S(150, fy(HBU, 0.52, 860), 0.52, 'wide'), TV: U('tv', 1), PLUG: U('plug', 2) };
const HO = 0.12;   // cut to the next speaker this long before the line starts
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('tv') - 0.05) return f(SH.HER_CU); if (t < hev('wide') - 0.05) return f(SH.TV); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - HO) return f(SH.WIDE); if (t < SP.o1_b.t - HO) return f(SH.HER); if (t < e('tv') - 0.02) return f(SH.BF); if (t < e('her') - 0.02) return f(SH.TV); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - HO) return f(SH.WIDE); if (t < SP.o2_b.t - HO) return f(SH.HER); if (t < e('tv') - 0.02) return f(SH.BF); if (t < e('her') - 0.02) return f(SH.TV); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - HO) return f(SH.WIDE); if (t < SP.o3_b.t - HO) return f(SH.HER); if (t < e('tv') - 0.02) return f(SH.BF_UP); if (t < e('her') - 0.02) return f(SH.TV); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - HO) return f(SH.WIDE); if (t < SP.o4_b.t - HO) return f(SH.THREE); if (t < e('yank') - 0.02) return f(SH.BF_CU); if (t < e('dark') - 0.02) return f(SH.PLUG); return f(SH.WIDE); }
  if (L === 'end') { if (t < e('her') - 0.02) return f(SH.END_DOOR); if (t < e('tv') - 0.02) return f(SH.END_HER); if (t < SP.end_b.t - HO) return f(SH.TV); if (t < e('win') - 0.02) return f(SH.END_BF); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'boom']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function tvView(c, t, L) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2A2F48'); g.addColorStop(1, '#141724'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'tv' });
  c.fillStyle = 'rgba(255,255,255,.03)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  const w = 960, h = 580, y = 880; c.fillStyle = '#0C0D12'; rr(c, 540 - w / 2 - 30, y - h / 2 - 30, w + 60, h + 60, 26); c.fill();
  c.save(); c.translate(540, y); tvScreen(c, w, h, t, L); c.restore();
  // hands on the controller under the screen (his, hers in the twist)
  const sl = L === 'end' ? '#2B1A22' : '#5A6B7E', sk = '#F2C9A8', j = Math.sin(t * 16) * 8;
  c.save(); c.translate(540, 1690 + j); c.strokeStyle = L === 'end' ? '#F6D2B6' : sl; c.lineCap = 'round'; c.lineWidth = 110; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 420, 520); c.lineTo(s * 160, 40); c.stroke(); }
  padDraw(c, 2.4); c.fillStyle = sk; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 175, 40, 62, 0, TAU); c.fill(); } c.restore(); }
// o4: the plug yanked out of the wall socket
function plugView(c, t) { c.fillStyle = '#E9DCEB'; c.fillRect(0, 0, W, HH); c.fillStyle = 'rgba(160,130,190,.18)'; for (let x = 0; x < W; x += 150) c.fillRect(x, 0, 55, HH);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'plug' });
  const t0 = ev('o4', 'yank'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6), pull = eOut(clamp((u - 0.25) / 0.18)), shk = u > 0.25 && u < 0.5 ? Math.sin(u * 90) * 8 : 0;
  c.save(); c.translate(540 + shk, 880); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, -200 + 12, -240 + 16, 400, 480, 40); c.fill(); c.fillStyle = '#F4F6FA'; c.strokeStyle = '#B9C2CC'; c.lineWidth = 8; rr(c, -200, -240, 400, 480, 40); c.fill(); c.stroke();
  c.fillStyle = '#2B2F3A'; rr(c, -70, -40, 30, 90, 10); c.fill(); rr(c, 40, -40, 30, 90, 10); c.fill();
  // the plug + cord + his hand
  const px = 0, py = -10 - pull * 520, rot = -pull * 0.5;
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, py - 120); c.bezierCurveTo(px + 200 + pull * 200, py - 400, px + 300, py - 700, px + 600, py - 900); c.stroke();
  c.save(); c.translate(px, py); c.rotate(rot); paint(c, q => { q.m(-120, -150); q.l(120, -150); q.l(135, 60); q.l(-135, 60); q.z(); }, '#E9EDF1', { sd: 8, hd: 4, lw: 6 }); c.fillStyle = '#9AA6B4'; if (pull > 0.05) { c.fillRect(-68, 60, 26, 90); c.fillRect(42, 60, 26, 90); } c.restore();
  c.strokeStyle = '#5A6B7E'; c.lineWidth = 150; c.beginPath(); c.moveTo(px + 700, py + 600); c.lineTo(px + 180, py - 40); c.stroke(); c.fillStyle = '#F2C9A8'; c.beginPath(); c.ellipse(px + 140, py - 40, 110, 95, 0.4, 0, TAU); c.fill();
  c.fillStyle = '#E9B894'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(px + 40 + i * 10, py - 110 + i * 60, 50, 32, 0.2, 0, TAU); c.fill(); }
  // spark
  const sk = clamp((u - 0.25) / 0.05) * (1 - clamp((u - 0.45) / 0.2)); if (sk > 0) { c.strokeStyle = '#FFD84A'; c.lineWidth = 14; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.3; c.globalAlpha = sk; c.beginPath(); c.moveTo(Math.cos(a) * 80, 10 + Math.sin(a) * 80); c.lineTo(Math.cos(a) * 200, 10 + Math.sin(a) * 200); c.stroke(); } c.globalAlpha = 1; }
  c.restore(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }
// twist: small «ЧЕРЕЗ 5 МИНУТ» label
function later(c, t) { const s = SC.end.s, k = eBack(P(t, s + 0.05, s + 0.3), 2.2) * (1 - eIn(P(t, s + 1.5, s + 1.7))); if (k <= 0) return;
  c.save(); c.translate(540, 215); c.scale(k, k); c.rotate(-0.025); UI.font(c, 'Unb9', 48); const w = c.measureText('ЧЕРЕЗ 5 МИНУТ').width + 90;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -46 + 9, w, 92, 46); c.fill(); c.fillStyle = C.oliveD; rr(c, -w / 2, -46, w, 92, 46); c.fill(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ЧЕРЕЗ 5 МИНУТ', 0, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2, y: 169, w, h: 92, k, id: 'later' }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine (his headphones, controller up) + him dressed for the date, sad (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bf6;
    K.put(c, BF_READY, { t, mood: 'sad', turn: -0.2, look: -0.5, headY: 12, armL: reach(gb, -1, -gb.sw * 1.05, gb.ySh + 530, { planar: true }), armR: reach(gb, 1, gb.sw * 1.05, gb.ySh + 530, { planar: true }), items: {} }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: { L: padItem }, front: (cc, gg) => headphones(cc, gg, g, 'head') }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(500, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.41), wAt('outro', 'два', sp.t + 1.57), wAt('outro', 'три', sp.t + 1.83), wAt('outro', 'четыре', sp.t + 2.36)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 2.8) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - wAt('outro', 'сохрани', sp.t + 3.65)) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(500, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.6, sp.t + sp.d - 0.6), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { ({ 'ui:tv': tvView, 'ui:plug': plugView })[tag](c, t, L); heads = { her: OFFL, bf6: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, hold: { hook_b: -0.1, o1_h: -0.12, o1_b: -0.15, o2_h: -0.12, o2_b: -0.15, o3_h: -0.15, o3_b: 0.25, o4_h: -0.08, o4_b: -0.12, end_h: -0.15, end_b: -0.1 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc); if (L === 'end') later(c, t);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('gamer', NF, renderFrame);
