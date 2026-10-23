// "Are you mad?" — short test format (60-75 s, hard_cut). He forgot the anniversary: node mad.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, mix, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/mad/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);

// ---------------- cast & layout
const HER = { ...BASE.her_london, top: { type: 'longsleeve', col: '#B8344E' }, bottom: { type: 'skirt', col: '#2B2F3A' }, shoes: { col: '#2B2F3A', acc: '#EE5E9A' } };
const TOM = BASE.tom, SIT = 330;
const G = { her: geom(HER), tom: geom(TOM), tomSit: geom(TOM, SIT) };
const FY = 60, HERX = -300, TX = 380, TABLE = { x0: -800, x1: -480, top: -700 }, CAKEX = -640;
const herHY = FY + G.her.headY, tHY = FY + G.tom.headY;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- living room, evening (prerendered, softly blurred)
const BX0 = -1700, BY0 = -3500, BW = 3500, BH = 4200, BS = 0.5;
function heart(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -40, -60, 0, -30); c.bezierCurveTo(40, -60, 60, -10, 0, 30); c.fill(); c.restore(); }
function drawRoom(c) {
  c.fillStyle = '#E9D3C6'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.22)'; for (let x = BX0; x < BX0 + BW; x += 180) c.fillRect(x, BY0, 60, FY - BY0);
  c.fillStyle = '#C9A898'; c.fillRect(BX0, -380, BW, 440); c.fillStyle = '#B48E7C'; c.fillRect(BX0, -400, BW, 22);
  // night window
  c.fillStyle = '#FFFDF8'; c.fillRect(-60, -2400, 700, 900); const sg = c.createLinearGradient(0, -2380, 0, -1520); sg.addColorStop(0, '#1F2A55'); sg.addColorStop(1, '#4A4A7A'); c.fillStyle = sg; c.fillRect(-40, -2380, 660, 860);
  c.fillStyle = '#FFF3C4'; c.beginPath(); c.arc(480, -2220, 46, 0, TAU); c.fill(); c.fillStyle = '#2E3866'; for (let i = 0; i < 7; i++) { const h = 160 + hash(i * 3) * 300; c.fillRect(-30 + i * 92, -1520 - h, 80, h); }
  c.fillStyle = '#FFE38A'; for (let i = 0; i < 12; i++) c.fillRect(-10 + (i % 7) * 92 + 20, -1600 - hash(i * 7) * 220, 18, 22);
  c.fillStyle = '#FFFDF8'; c.fillRect(280, -2380, 16, 860); c.fillRect(-40, -1960, 660, 14);
  // garland with little flags + heart balloons
  c.strokeStyle = '#8A6A5A'; c.lineWidth = 5; c.beginPath(); c.moveTo(-1500, -2500); c.quadraticCurveTo(-700, -2250, 100, -2560); c.stroke();
  for (let i = 0; i < 9; i++) { const u = i / 8, x = lerp(-1450, 50, u), y = -2500 + Math.sin(u * Math.PI) * 190 - u * 40; c.fillStyle = ['#EE5E9A', '#F2C14E', '#FFFDF8'][i % 3]; c.beginPath(); c.moveTo(x - 40, y); c.lineTo(x + 40, y); c.lineTo(x, y + 80); c.fill(); }
  for (const [x, y, col] of [[-1200, -1900, '#EE5E9A'], [-1050, -2050, '#E0474C'], [-1300, -2120, '#F7B6CF']]) { c.strokeStyle = '#8A6A5A'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y + 60); c.lineTo(x + 40, -420); c.stroke(); heart(c, x, y, 2.6, col); }
  // framed photo + floor lamp + sofa on the right
  c.fillStyle = '#6A4A3A'; c.fillRect(800, -2250, 420, 330); c.fillStyle = '#F3EDDF'; c.fillRect(825, -2225, 370, 280); heart(c, 1010, -2085, 1.6, '#EE5E9A');
  c.fillStyle = '#3E3A40'; c.fillRect(1440, -1700, 18, 1760); c.fillStyle = '#F2D9A0'; c.beginPath(); c.moveTo(1340, -1700); c.lineTo(1560, -1700); c.lineTo(1500, -1950); c.lineTo(1400, -1950); c.fill();
  paint(c, q => { q.m(780, -700); q.l(1360, -700); q.l(1360, 40); q.l(780, 40); q.z(); }, '#6E86A8', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#5C7294'; c.fillRect(780, -420, 580, 60);
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#9A7A62'); fg.addColorStop(1, '#7A5E4A'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawRoom(c); }

// ---------------- props
function tableShape(c) { const D = TABLE; paint(c, q => { q.m(D.x0 - 20, D.top); q.l(D.x1 + 20, D.top); q.l(D.x1 + 20, D.top + 30); q.l(D.x0 - 20, D.top + 30); q.z(); }, '#F7F1E6', { sd: 4, hd: 2, lw: 3 });
  c.fillStyle = '#8A5E40'; c.fillRect(D.x0 + 10, D.top + 30, 24, FY - D.top - 30); c.fillRect(D.x1 - 34, D.top + 30, 24, FY - D.top - 30); c.fillStyle = '#EE5E9A'; c.fillRect(D.x0 - 20, D.top + 26, D.x1 - D.x0 + 40, 10); }
// cake at its base centre (0,0). o: { lit, smoke (0..1), t }
function cake(c, x, y, s, rot, o) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = '#E8E2D8'; c.beginPath(); c.ellipse(0, 0, 150, 22, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-115, -6); q.l(115, -6); q.l(115, -140); q.l(-115, -140); q.z(); }, '#F7B6CF', { sd: 5, hd: 3, lw: 4 });
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.moveTo(-117, -140); for (let i = 0; i <= 10; i++) { const xx = -117 + i * 23.4; c.quadraticCurveTo(xx - 11, -110 + (i % 2) * 14, xx, -140); } c.lineTo(117, -152); c.lineTo(-117, -152); c.fill();
  c.fillStyle = '#EE5E9A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-90 + i * 36, -70, 9, 0, TAU); c.fill(); }
  // number "1" candle
  c.fillStyle = '#F2C14E'; c.strokeStyle = '#B8860B'; c.lineWidth = 4; c.beginPath(); c.moveTo(-14, -150); c.lineTo(14, -150); c.lineTo(14, -262); c.lineTo(-2, -262); c.lineTo(-30, -238); c.lineTo(-22, -226); c.lineTo(-14, -232); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#3E3A40'; c.lineWidth = 3; c.beginPath(); c.moveTo(4, -262); c.lineTo(4, -276); c.stroke();
  if (o.lit) { const f = 1 + 0.12 * Math.sin(o.t * 23) + 0.08 * Math.sin(o.t * 37); c.save(); c.translate(4, -282); c.scale(f, f);
    c.fillStyle = 'rgba(255,214,110,.35)'; c.beginPath(); c.arc(0, -6, 30, 0, TAU); c.fill(); c.fillStyle = '#FFB13B'; c.beginPath(); c.moveTo(0, -36); c.quadraticCurveTo(16, -6, 0, 6); c.quadraticCurveTo(-16, -6, 0, -36); c.fill();
    c.fillStyle = '#FFF3C4'; c.beginPath(); c.moveTo(0, -20); c.quadraticCurveTo(7, -4, 0, 3); c.quadraticCurveTo(-7, -4, 0, -20); c.fill(); c.restore(); }
  if (o.smoke > 0 && o.smoke < 1) { c.save(); c.globalAlpha = 0.6 * (1 - o.smoke); c.strokeStyle = '#B9B4A6'; c.lineWidth = 6; c.beginPath(); for (let i = 0; i <= 12; i++) { const yy = -280 - i * 14 - o.smoke * 60; c.lineTo(4 + Math.sin(i * 0.9 + o.t * 6) * 12, yy); } c.stroke(); c.restore(); }
  // topper "1 ГОД"
  c.strokeStyle = '#8A6A5A'; c.lineWidth = 4; c.beginPath(); c.moveTo(70, -150); c.lineTo(70, -230); c.stroke(); c.save(); c.translate(70, -262); c.rotate(0.06); c.fillStyle = '#FFFDF8'; rr(c, -64, -34, 128, 66, 12); c.fill(); c.strokeStyle = '#EE5E9A'; c.lineWidth = 4; rr(c, -64, -34, 128, 66, 12); c.stroke(); txt(c, '1 ГОД', 0, 0, 30, '#C2405A'); c.restore();
  c.restore(); }
function splat(c, x, y, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(1.6 * k, 1.6 * k); c.fillStyle = '#F7B6CF'; c.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = (i % 2 ? 120 : 175) + hash(i) * 30; c.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.3); } c.fill();
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(-20, -6, 80, 18, 0, 0, TAU); c.fill(); c.save(); c.translate(30, -10); c.rotate(0.5); c.fillStyle = '#F2C14E'; c.fillRect(-12, -90, 24, 90); c.restore(); c.restore(); }
const phoneItem = ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -30, -118, 60, 112, 10); ctx.fill(); ctx.fillStyle = '#F2C14E'; rr(ctx, -24, -110, 48, 92, 6); ctx.fill(); txt(ctx, 'PIZZA', 0, -64, 12, '#C2405A'); };
const consoleItem = t => ctx => { ctx.save(); ctx.rotate(-0.08); ctx.fillStyle = '#E0474C'; rr(ctx, -150, -70, 50, 80, 22); ctx.fill(); ctx.fillStyle = '#3C8FE0'; rr(ctx, 100, -70, 50, 80, 22); ctx.fill();
  ctx.fillStyle = '#2B2F3A'; rr(ctx, -104, -70, 208, 80, 8); ctx.fill(); const g = 0.6 + 0.4 * Math.sin(t * 11); ctx.fillStyle = `rgba(124,242,154,${g})`; rr(ctx, -92, -62, 184, 64, 6); ctx.fill(); txt(ctx, 'GAME ON', 0, -30, 22, '#1E2A22'); ctx.restore(); };
function beanbag(c, x) { paint(c, q => { q.m(x - 250, FY); q.q(x - 300, -330, x - 60, -470); q.q(x + 160, -500, x + 260, -280); q.q(x + 320, -60, x + 250, FY); q.z(); }, '#F2C14E', { sd: 6, hd: 3, lw: 4 }); }
function sweat(c, hd, k) { if (k <= 0) return; const x = hd.x + hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const crossed = (st, g) => { st.armL = reach(g, -1, g.sw * 0.45, g.ySh + 190); st.armR = reach(g, 1, -g.sw * 0.45, g.ySh + 215); };
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'annoyed', turn: 0.35, look: 0.8 }; crossed(st, g);
  if (L === 'hook') st.mood = t < SP.hook_her.t ? 'bored' : 'annoyed';
  if (L === 'A1') { st.mood = 'bored'; if (t > endOf('a1_x')) st.mood = 'angry';
    const b = ev('blow'); if (t > b - 0.3 && t < ev('dark') + 0.2) { st.turn = -0.45; st.look = -1; st.lookY = 0.35; st.talk = 0.45; st.headX = -26; st.armL = reach(g, -1, -g.sw * 1.1, g.ySh + 300); } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_her', t)) gest(st, g, 'her', t, 1, 180); if (t > SP.a2_x.t) st.mood = 'skeptical'; }
  if (L === 'B1') { st.mood = speaking('b1_her', t, 0.1) ? 'smug' : 'annoyed'; if (t > ev('game')) { st.mood = 'angry'; st.look = 1; } }
  if (L === 'B2') { st.mood = 'sad'; if (speaking('b2_her', t)) { st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 240); } if (t > ev('notice')) { st.mood = 'skeptical'; crossed(st, g); } }
  if (L === 'C1') { st.mood = 'sad'; if (speaking('c1_her', t)) { st.armL = reach(g, -1, g.sw * 0.1, g.ySh + 140); st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 300); } if (t > SP.c1_x.t + 0.6) { st.mood = 'shock'; crossed(st, g); } if (t > ev('fall')) { st.mood = 'tired'; st.look = -0.8; st.turn = -0.2; } }
  if (L === 'C2') { const sp = speaking('c2_her', t); st.mood = sp ? 'smug' : 'bored'; if (sp) { const u = (t - SP.c2_her.t) * 3.2; st.armR = reach(g, 1, g.sw * (1.3 + Math.sin(u) * 0.15), g.ySh + 120 + Math.cos(u) * 25); } if (t > endOf('c2_her') - 0.6 && t < SP.c2_x.t) st.mood = 'neutral'; if (t > SP.c2_her2.t - 0.1) st.mood = 'bored'; if (t > SP.c2_nar.t) st.mood = 'annoyed'; }
  return st; }
function tomState(t, L) { const g = G.tom, st = { t, talk: talk('tom', t), mood: 'neutral', turn: -0.35, look: -0.8, armL: reach(g, -1, -g.sw * 0.7, g.ySh + 330), armR: reach(g, 1, g.sw * 0.7, g.ySh + 330) };
  gest(st, g, 'tom', t, 1, 200);
  const guilty = () => { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 0.95, g.ySh - 170); };
  if (L === 'hook') { guilty(); if (t > SP.hook_her.t + 0.3) st.mood = 'worried'; }
  if (L === 'A1') { st.mood = 'happy'; if (t > SP.a1_x.t - 0.3) { st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 40); st.items = { R: phoneItem }; } if (t > ev('blow')) { st.mood = 'shock'; st.look = -1; } }
  if (L === 'A2') { if (t > SP.a2_x.t - 0.1) { const u = t * 9; st.mood = 'surprised'; st.turn = 0; st.look = 0; st.lookY = 0.75; st.armL = reach(g, -1, -g.sw * 0.35 + Math.sin(u) * 25, g.ySh + 170); st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 300 + Math.cos(u) * 25); } if (t > SP.a2_nar.t) { st.mood = 'worried'; st.lookY = 0; st.turn = -0.35; st.look = -0.8; } }
  if (L === 'B1') { st.mood = 'happy'; if (t > ev('game') - 0.2) { const gs = G.tomSit; st.legPose = 'sit'; st.drop = SIT * eOut(P(t, ev('game') - 0.2, ev('game') + 0.15)); st.turn = 0.1; st.look = 0.1; st.lookY = 0.7; st.mood = 'happy';
      st.armL = reach(gs, -1, -gs.sw * 0.55, gs.ySh + 250); st.armR = reach(gs, 1, gs.sw * 0.55, gs.ySh + 250); st.items = { R: consoleItem(t) }; } }
  if (L === 'B2') { st.mood = 'happy'; if (t > ev('notice')) { st.mood = 'shock'; st.turn = -0.5; st.look = -1; st.armL = reach(g, -1, -g.sw * 1.35, g.ySh - 70); st.armR = reach(g, 1, g.sw * 1.35, g.ySh - 70); } if (t > SP.b2_nar.t + 0.4) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 330); st.armR = reach(g, 1, g.sw * 0.95, g.ySh - 170); } }
  if (L === 'C1') { st.mood = 'worried'; if (t > SP.c1_x.t - 0.2) { st.mood = 'surprised'; st.armR = reach(g, 1, g.sw * 0.35, g.ySh - 60); } if (t > ev('fall')) { st.mood = 'shock'; st.look = -1; st.turn = -0.5; } }
  if (L === 'C2') { st.mood = 'surprised'; if (t > SP.c2_her.t + 4) st.mood = 'worried'; if (speaking('c2_x', t, 0.1, 0.3)) st.mood = 'surprised'; if (t > SP.c2_her2.t + 0.3) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.35, g.ySh - 70); st.armR = reach(g, 1, g.sw * 1.35, g.ySh - 70); } }
  return st; }
const tomSweat = (t, L) => L === 'hook' ? 1 : L === 'C2' ? clamp(P(t, SP.c2_her.t + 4, SP.c2_her.t + 4.4)) : L === 'B2' && t > ev('notice') ? 1 : 0;

// ---------------- world
const headOf = (who, x) => ({ x, y: FY + G[who].headY, hh: G[who].hh });
function cakeState(t, L) { // {x, y, rot, s, lit, smoke, splat}
  const o = { x: CAKEX, y: TABLE.top, rot: 0, lit: true, smoke: 0, sp: 0 };
  if (L === 'A1' && t > ev('blow') + 0.15) { o.lit = false; o.smoke = P(t, ev('blow') + 0.15, ev('blow') + 2.0); }
  if (L === 'C1' && t > ev('fall')) { const f = ev('fall'), k = eIn(P(t, f, f + 0.4)); o.rot = lerp(0, 1.5, k); o.x = lerp(CAKEX, CAKEX + 110, k); o.y = lerp(TABLE.top, FY - 40, k); if (t > f + 0.4) { o.gone = true; o.sp = eBack(P(t, f + 0.4, f + 0.6), 2); } }
  return o; }
function world(c, t, L, solo) {
  c.drawImage(BGB, BX0, BY0, BW, BH); const heads = {};
  tableShape(c); const ck = cakeState(t, L);
  if (!ck.gone) cake(c, ck.x, ck.y, 1, ck.rot, { lit: ck.lit, smoke: ck.smoke, t }); else splat(c, CAKEX + 110, FY + 10, ck.sp);
  K.mark(c, 'cake', CAKEX, TABLE.top - 150, 160);
  const drawTom = solo !== 'her' && solo !== 'none', drawHer = solo !== 'tom' && solo !== 'none';
  if (L === 'B1' && t > ev('game') - 0.2 && drawTom) beanbag(c, TX);
  heads.tom = drawTom ? put(c, TOM, tomState(t, L), TX, FY) : headOf('tom', TX);
  heads.her = drawHer ? put(c, HER, herState(t, L), HERX, FY) : headOf('her', HERX);
  return heads; }

// ---------------- camera (hard_cut: still shots, cuts by meaning — see CAMERA.md)
const SH = { WIDE: { x: 40, y: -1000, z: 0.72, r: 0 }, CARD: { x: 40, y: -1555, z: 0.66, r: 0 },
  HER: { x: HERX + 60, y: herHY + 60, z: 1.0, r: 0, tag: 'her' }, TOM: { x: TX - 120, y: tHY + 60, z: 0.98, r: 0, tag: 'tom' },
  HER_R: { x: HERX + 60, y: herHY - 160, z: 1.05, r: 0, tag: 'her' }, TOM_R: { x: TX - 60, y: tHY - 150, z: 1.0, r: 0, tag: 'tom' },
  HOOK: { x: 20, y: -1480, z: 0.7, r: 0 }, HOOK_HER: { x: HERX + 60, y: herHY - 250, z: 1.05, r: 0, tag: 'her' },
  FALL: { x: -200, y: -950, z: 0.72, r: 0 },
  CAKE: { x: CAKEX + 20, y: TABLE.top - 190, z: 2.1, r: 0, tag: 'none' } };
// C2 chunk starts, timed like ep_kit (by word count over the estimated word timings)
const chunkT = (() => { const ch = TL.cfg.chunks.c2_her, sp = SP.c2_her; let n = 0; return ch.map(([en]) => { const w = sp.words[n]; n += en.trim().split(/\s+/).length; return sp.t + (w ? w[1] : 0); }); })();
function shotFor(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t >= SP.hook_her.t - 0.1 && t < endOf('hook_her') + 0.15) return f(SH.HOOK_HER); return f(SH.HOOK); }   // frame 0 = cover (two-shot + cake)
  const u = t - sc.s; if (u < 1.15) return f(SH.WIDE);
  const l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > ev('blow') - 0.35) return f(SH.WIDE);                         // candle -> the whole flat goes dark
  if (L === 'B1' && t > ev('game') - 0.3) return f(SH.WIDE);                          // he drops into the beanbag with the console
  if (L === 'B2' && t > ev('notice') - 0.05) return f(t < ev('notice') + 0.65 ? SH.CAKE : SH.TOM_R);   // the "1" on the cake -> his face
  if (L === 'C1' && t > ev('fall') - 0.3) return f(SH.FALL);                          // the cake falls
  if (L === 'C2') { if (speaking('c2_her', t, 0.1, 0.2)) return f(t < chunkT[1] ? SH.HER : t < chunkT[3] ? SH.TOM_R : SH.HER_R);
    if (t > endOf('c2_her') && t < SP.c2_x.t - 0.1) return f(SH.CARD); }               // the silence: both, still
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  if (cur) return f(cur.who === 'her' ? SH.HER : SH.TOM);
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(next.who === 'her' ? SH.HER : SH.TOM);
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, cam.tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// lights out (A1): dark room, only the eyes are left
function darkness(c, t, heads, proj, cam) { const d = ev('dark'); if (t < d) return; const k = clamp(P(t, d, d + 0.12)); c.fillStyle = `rgba(12,10,22,${0.94 * k})`; c.fillRect(0, 0, W, HH);
  const eyes = (hd, angry) => { const p = proj(hd), r = hd.hh * cam.z; for (const s of [-1, 1]) { const x = p.x + s * r * 0.36 + (angry ? 0.18 : -0.18) * r, y = p.y - r * 0.02; c.save(); c.translate(x, y); c.fillStyle = '#FFFDF8';
    if (angry) { c.rotate(s * 0.35); c.beginPath(); c.ellipse(0, 0, r * 0.17, r * 0.06, 0, 0, TAU); c.fill(); } else { const bl = Math.abs(Math.sin(t * 2.2)) < 0.08 ? 0.15 : 1; c.beginPath(); c.ellipse(0, 0, r * 0.13, r * 0.15 * bl, 0, 0, TAU); c.fill(); c.fillStyle = '#1E1A2A'; c.beginPath(); c.arc(-r * 0.06, 0, r * 0.05 * bl, 0, TAU); c.fill(); } c.restore(); } };
  if (k > 0.5) { if (cam.tag !== 'tom') eyes(heads.her, true); if (cam.tag !== 'her') eyes(heads.tom, false); } }

// two-line cover title (frame 0): «ОН ЗАБЫЛ. СПРАШИВАЕТ:» / «ТЫ ОБИДЕЛАСЬ?»
function coverTitle(c, t) { const L = TL.cfg.hook_title, s = 1 + 0.012 * Math.sin(t * 5); c.save(); c.translate(540, 440); c.rotate(-0.04); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -500 + 10, -120 + 14, 1000, 240, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -500, -120, 1000, 240, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 62, L[0][0], 900); c.fillStyle = C.oliveD; c.fillText(L[0][0], 0, -52); UI.textFit(c, 'Unb9', 104, L[1][0], 930); UI.strokeText(c, L[1][0], 0, 40, C.pink, C.white, 12); c.restore(); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЫ ОТВЕЧАЕШЬ «I\'M FINE»,', 'КОГДА ЗЛИШЬСЯ?'], qSize: 44, rows: [['B1', "It's not a big deal"], ['B2', "I'm a bit upset"], ['C1', 'That hurt my feelings']], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ВСЕГДА «I\'M FINE»'],
    hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * (1.6 + 0.2 * Math.sin(tt * 8)), G.her.ySh - 200) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  if (cam.tag !== 'her' && cam.tag !== 'none') sweat(c, { ...proj(heads.tom), hh: heads.tom.hh * cam.z }, tomSweat(t, sc.id));
  if (sc.id === 'A1') darkness(c, t, heads, proj, cam);
  if (sc.id === 'hook') { coverTitle(c, t); K.bubbles(c, t, sc, heads, proj, { names: { tom: ['TOM', '#4E7FB8'] } }); UI.captions(c, t); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  K.bubbles(c, t, sc, heads, proj, { names: { tom: ['TOM', '#4E7FB8'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'B2' && cam.tag === 'none') K.pop(c, t, '1 ГОД?!', ev('notice') + 0.1, ev('notice') + 0.5, 540, 1450, C.gold, -0.06, 110);
  if (sc.id === 'C1') K.pop(c, t, 'ПЛЮХ!', SC.C1.ev.plop, SP.c1_nar.t - 0.3, 540, 1350, C.white, 0.06, 96);
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.25, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('mad', NF, renderFrame);
