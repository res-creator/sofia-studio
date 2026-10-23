// "Have you put on weight?" episode renderer: node weight.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/weight/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london, top: { type: 'coat', col: '#4CA6A0', col2: '#F5EBDD' }, bottom: { type: 'jeans', col: '#3B4A6A' } };
const LINDA = { ...BASE.margot, hair: { style: 'bouffant', col: '#E0A43B' }, top: { type: 'coat', col: '#C2507A', col2: '#F5EBDD' } };
const G = { her: geom(HER), linda: geom(LINDA) };
const FY = 60, HERX = -320, LX = 320, TAPE = '#F2C14E';
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- bakery (prerendered)
const BX0 = -1600, BY0 = -3000, BW = 3200, BH = 3700, BS = 0.5;
function cake(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-80, 0); q.l(80, 0); q.l(80, -90); q.l(-80, -90); q.z(); }, col, { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#FFFDF8'; c.fillRect(-80, -100, 160, 22); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, -114, 14, 0, TAU); c.fill(); c.restore(); }
function drawBakery(c) {
  c.fillStyle = '#FBE3D2'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(224,71,76,.07)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, BY0, 120, BH);
  for (const x of [-1300, -500, 300, 1100]) { c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(x - 200, -2550); c.lineTo(x + 200, -2550); c.lineTo(x + 160, -2420); c.lineTo(x - 160, -2420); c.fill(); }
  c.fillStyle = '#2B2F3A'; rr(c, -360, -2350, 720, 180, 24); c.fill(); txt(c, 'SWEET HOME BAKERY', 0, -2260, 56, '#F2C14E');
  for (let r = 0; r < 3; r++) { c.fillStyle = '#C9A06A'; c.fillRect(-1500, -1900 + r * 300, 3000, 18); for (let i = 0; i < 12; i++) cake(c, -1400 + i * 250, -1900 + r * 300, 0.7, ['#F4B8C8', '#8A5A3A', '#F2E2C8', '#C9B4E8'][(i + r) % 4]); }
  c.fillStyle = 'rgba(200,230,250,.5)'; c.fillRect(-1600, -900, 3200, 380); c.fillStyle = '#FFFDF8'; c.fillRect(-1600, -520, 3200, 580); c.fillStyle = '#E0474C'; c.fillRect(-1600, -480, 3200, 30);
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#E9D2B4'); fg.addColorStop(1, '#C9A880'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = BX0; x < BX0 + BW; x += 160) for (let y = FY; y < 700; y += 80) if (((x / 160) + (y / 80)) % 2 < 1) c.fillRect(x, y, 160, 80);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawBakery(c); }

// ---------------- props
const cakeBox = ctx => { ctx.rotate(0); paint(ctx, q => { q.m(-80, 0); q.l(80, 0); q.l(80, -110); q.l(-80, -110); q.z(); }, '#FFFDF8', { sd: 4, hd: 2, lw: 3 }); ctx.strokeStyle = '#E0474C'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -110); ctx.moveTo(-80, -55); ctx.lineTo(80, -55); ctx.stroke(); paint(ctx, q => q.e(0, -116, 26, 12), '#E0474C', { sd: 1, hd: 1, lw: 2 }); };
const bag = (tape) => ctx => { ctx.rotate(0); paint(ctx, q => { q.m(-110, 20); q.l(110, 20); q.l(130, 230); q.l(-130, 230); q.z(); }, '#7A3A5A', { sd: 6, hd: 3, lw: 3 }); ctx.strokeStyle = '#4A2A3A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 20, 60, Math.PI, 0); ctx.stroke(); if (tape) { ctx.fillStyle = TAPE; ctx.save(); ctx.translate(60, 20); ctx.rotate(-0.4); ctx.fillRect(-14, -120, 28, 120); ctx.fillStyle = '#2B2F3A'; for (let y = -110; y < 0; y += 16) ctx.fillRect(-14, y, 10, 3); ctx.restore(); } };
function scaleCard(c, t, L) { let k = 0; if (L === 'A2' && t > ev('scale')) k = eBack(P(t, ev('scale'), ev('scale') + 0.3), 1.8) * (1 - P(t, SP.a2_nar.t + 1.2, SP.a2_nar.t + 1.5)); if (L === 'C2' && t > ev('push')) k = eBack(P(t, ev('push') + 0.3, ev('push') + 0.6), 1.8) * (1 - P(t, SP.c2_nar.t + SP.c2_nar.d, SP.c2_nar.t + SP.c2_nar.d + 0.3)); if (k <= 0) return;
  c.save(); c.translate(540, 1150); c.rotate(-0.04); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -250 + 10, -150 + 14, 500, 300, 40); c.fill(); paint(c, q => { q.m(-250, -150); q.l(250, -150); q.l(250, 150); q.l(-250, 150); q.z(); }, '#E9EEF2', { sd: 6, hd: 3, lw: 6 }); c.fillStyle = '#2B2F3A'; rr(c, -150, -110, 300, 110, 16); c.fill(); txt(c, '?? kg', 0, -54, 64, '#7CF29A'); for (const sd of [-1, 1]) { c.fillStyle = '#C9CED6'; rr(c, sd * 120 - 70, 30, 140, 90, 20); c.fill(); }
  if (L === 'C2') { c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(-330, 0); c.lineTo(-270, -50); c.lineTo(-270, 50); c.fill(); c.fillRect(-270, -14, 0, 28); } c.restore(); }
function scale(c, x) { paint(c, q => { q.m(x - 170, FY); q.l(x + 170, FY); q.l(x + 160, FY - 60); q.l(x - 160, FY - 60); q.z(); }, '#E9EEF2', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#2B2F3A'; rr(c, x - 70, FY - 52, 140, 38, 6); c.fill(); txt(c, '?? kg', x, FY - 33, 26, '#7CF29A'); }
function tapeLine(c, x0, y0, x1, y1) { c.save(); c.strokeStyle = TAPE; c.lineWidth = 26; c.lineCap = 'butt'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 3; const n = Math.floor(Math.hypot(x1 - x0, y1 - y0) / 18); for (let i = 0; i < n; i++) { const u = i / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u); c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x, y - (i % 5 ? 4 : -2)); c.stroke(); } c.restore(); }
function towel(c, x, t) { paint(c, q => { q.m(x - 90, -1700); q.l(x + 90, -1700); q.l(x + 90 + Math.sin(t * 3) * 10, -500); q.l(x - 90 + Math.sin(t * 3 + 1) * 10, -500); q.z(); }, '#F4B8C8', { sd: 8, hd: 4, lw: 3, inner: k => { k.fillStyle = 'rgba(255,255,255,.6)'; k.fillRect(x - 90, -620, 180, 24); k.fillRect(x - 90, -1640, 180, 24); } }); }
function lens(c, x, y, k) { c.save(); c.translate(x, y); c.scale(k, k); c.strokeStyle = '#5A3A2A'; c.lineWidth = 26; c.beginPath(); c.moveTo(80, 80); c.lineTo(200, 200); c.stroke(); c.fillStyle = 'rgba(200,235,255,.35)'; c.beginPath(); c.arc(0, 0, 120, 0, TAU); c.fill(); c.strokeStyle = '#C9A06A'; c.lineWidth = 16; c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(-40, -40, 22, 0, TAU); c.fill(); c.restore(); }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.6 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function lindaX(t, L) { if (L === 'hook') return lerp(1300, LX, eOut(P(t, 0.2, 1.3))); if (L === 'C1' && t > ev('hug') - 0.6) return lerp(LX, HERX + 330, eIO(P(t, ev('hug') - 0.6, ev('hug')))) ; if (L === 'C1') return LX; return LX; }
function hugging(t, L) { return L === 'C1' && t > ev('hug') - 0.05 && t < SP.c1_nar.t + 0.8; }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 330), armR: reach(g, 1, g.sw * 0.9, g.ySh + 260), items: { R: cakeBox } };
  gest(st, g, 'her', t, -1, 200);
  if (L === 'hook') st.mood = t > 1.3 ? 'worried' : 'happy';
  if (L === 'A1') st.mood = t > SP.a1_x.t + 0.6 ? 'shock' : 'happy'; if (L === 'A1' && t > ev('tape')) st.mood = 'annoyed';
  if (L === 'A2') st.mood = t > ev('scale') ? 'shock' : 'annoyed';
  if (L === 'B1') st.mood = t > ev('towel') ? 'tired' : 'skeptical';
  if (L === 'B2') st.mood = t > ev('lens') ? 'shock' : 'annoyed';
  if (L === 'C1') { st.mood = 'sad'; if (hugging(t, L)) st.mood = 'surprised'; if (t > ev('measure')) st.mood = 'shock'; }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > SP.c2_x.t + 0.3) st.mood = 'happy'; if (t > SP.c2_x2.t + 0.8) { st.mood = 'angry'; st.squint = Math.floor(t * 5) % 4 === 0; } }
  return st; }
function lindaState(t, L) { const g = G.linda, st = { t, talk: talk('linda', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 330), armR: reach(g, 1, g.sw * 0.7, g.ySh + 300), items: { R: bag(true) } };
  gest(st, g, 'linda', t, -1, 160);
  if (L === 'hook') { st.mood = 'smug'; st.legPose = t < 1.3 ? 'walk' : 'stand'; }
  if (L === 'A1' && t > ev('tape') - 0.2) { st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 300); st.items = { R: bag(false) }; }
  if (L === 'A2' && t > ev('scale') - 0.5 && t < ev('scale') + 0.3) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 520); st.drop = 60; }
  if (L === 'B1' && t > ev('towel') - 0.2 && t < SP.b1_nar.t + 2.5) { st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 120); st.mood = 'smug'; }
  if (L === 'B2' && t > ev('lens') - 0.2 && t < SP.b2_nar.t + 1.5) { st.armL = reach(g, -1, -g.sw * 2.3, g.ySh - 40); st.squint = true; }
  if (hugging(t, L)) { st.turn = -0.6; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 200); st.armR = reach(g, 1, -g.sw * 0.2, g.ySh + 220); st.mood = 'happy'; st.squint = true; if (t > ev('measure')) { st.mood = 'smug'; st.squint = false; } }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'sad'; if (t > SP.c2_x2.t - 0.2) st.mood = 'smug'; }
  return st; }
function scaleX(t, L) { if (['A1', 'hook'].includes(L) || (L === 'A2' && t < ev('scale'))) return null; if (L === 'C2' && t > ev('push')) return lerp(40, HERX + 120, eOut(P(t, ev('push'), ev('push') + 0.5))); if (L === 'outro') return null; return 40; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {}, lx = lindaX(t, L);
  const sx = scaleX(t, L); if (sx !== null) scale(c, sx);
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  heads.linda = put(c, LINDA, lindaState(t, L), lx, FY);
  if (L === 'A1' && t > ev('tape')) { const k = eOut(P(t, ev('tape'), ev('tape') + 0.4)); tapeLine(c, lx - 260, -760, lerp(lx - 260, HERX + 110, k), lerp(-760, -720, k)); }
  if (L === 'B1' && t > ev('towel') && t < SP.b1_nar.t + 2.5) towel(c, lerp(lx - 120, 20, eOut(P(t, ev('towel'), ev('towel') + 0.4))), t);
  if (L === 'B2' && t > ev('lens') && t < SP.b2_nar.t + 1.5) lens(c, HERX + 60, -1330, eBack(P(t, ev('lens'), ev('lens') + 0.3), 2) * 1.15);
  if (L === 'C1' && t > ev('measure') && t < SP.c1_nar.t + 0.8) { const k = eOut(P(t, ev('measure'), ev('measure') + 0.4)); tapeLine(c, HERX - 150, -720, lerp(HERX - 150, HERX + 150, k), -720); }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -1000, z: 0.8, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.76, cut: u < 0.85 };
  if ((L === 'A2' && t > ev('scale') - 0.4 && t < SP.a2_nar.t + 1.5) || (L === 'C2' && t > ev('push') - 0.2)) return { x: -60, y: -850, z: 0.74, r: 0 };
  if (L === 'C1' && hugging(t, L)) return { x: HERX + 120, y: -1150, z: 0.95, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 200, y: -1250, z: 0.85, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 230, y: -1180, z: 0.95, r: 0.3 } : { x: LX - 230, y: -1230, z: 0.95, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud', 'clank']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { drawWorld(c, t, 'hook', { x: 0, y: -1000, z: 0.8, r: 0 }); Hq.vignette(c, W, HH, 0.3);
  if (t > 1.5) { const kk = eBack(P(t, 1.5, 1.8), 2); c.save(); c.translate(540, 1500); c.rotate(-0.05); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -430 + 8, -60 + 10, 860, 120, 20); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -430, -60, 860, 120, 20); c.fill(); UI.textFit(c, 'Unb9', 54, 'ОНА ПРИШЛА НЕ ЗА ХЛЕБОМ', 780); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ОНА ПРИШЛА НЕ ЗА ХЛЕБОМ', 0, 4); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЕБЕ ЗАДАЮТ', 'ТАКИЕ ВОПРОСЫ?'], rows: [['A2', 'Why would you say that?'], ['B1', "That's a bit personal."], ['B2', "I'd rather not discuss my body."], ['C1', 'Comments like that can hurt.']], cta: ['ОТПРАВЬ ТОМУ, КТО ЛЮБИТ', 'ТАКИЕ ВОПРОСЫ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 0.9, G.her.ySh + 260), items: { R: cakeBox } }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  scaleCard(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { linda: ['LINDA', '#C2507A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('weight', NF, renderFrame);
