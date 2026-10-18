// "My flatmate doesn't wash the dishes" episode renderer: node dishes.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/dishes/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london, top: { type: 'tee', col: '#F2C14E' }, bottom: { type: 'jeans', col: '#3B4A6A' } };
const ZOE = { ...BASE.priya, hair: { style: 'bun', col: '#2A1A10' }, top: { type: 'hoodie', col: '#4CAF6A' }, bottom: { type: 'joggers', col: '#2B2F3A' } };
const G = { her: geom(HER), zoe: geom(ZOE) };
const FY = 60, HERX = -380, ZX = 380, CTR = { x0: -200, x1: 200, top: -640 }, CUP = { x: -700, y: -2000 };
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- kitchen (prerendered)
const BX0 = -1600, BY0 = -3000, BW = 3200, BH = 3700, BS = 0.5;
function drawKitchen(c) { c.fillStyle = '#F2EDE2'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(60,140,200,.12)'; for (let y = -1300; y < -600; y += 80) for (let x = BX0; x < BX0 + BW; x += 80) c.fillRect(x + 4, y + 4, 72, 72);
  c.fillStyle = '#FFFFFF'; c.fillRect(500, -2400, 700, 900); c.fillStyle = '#A9D0EC'; c.fillRect(530, -2370, 640, 840); c.fillStyle = '#FFFFFF'; c.fillRect(840, -2370, 20, 840);
  c.fillStyle = '#C9A06A'; c.fillRect(BX0, -620, BW, 680); c.fillStyle = '#B08A5A'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, -560, 8, 600);
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#D9D4CA'); fg.addColorStop(1, '#B9B4AA'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = BX0; x < BX0 + BW; x += 140) for (let y = FY; y < 700; y += 140) if (((x / 140) + (y / 140)) % 2 < 1) c.fillRect(x, y, 140, 140); }
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawKitchen(c); }

// ---------------- props
function mineMug(c, x, y, s = 1, steam = false, t = 0) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-46, -110); q.l(46, -110); q.l(40, 0); q.l(-40, 0); q.z(); }, '#FFFFFF', { sd: 3, hd: 2, lw: 3 }); c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; c.beginPath(); c.arc(54, -58, 20, -1.3, 1.3); c.stroke(); c.fillStyle = '#F2C14E'; c.fillRect(-36, -76, 72, 32); txt(c, 'MINE', 0, -60, 22, '#2B2F3A');
  if (steam) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 6; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 20, -120); c.quadraticCurveTo(i * 20 + Math.sin(t * 4 + i) * 16, -150, i * 20, -180); c.stroke(); } } c.restore(); }
function cupboard(c, t, L, open) { c.save(); c.translate(CUP.x, CUP.y); c.fillStyle = '#E9E4DA'; c.fillRect(-260, -300, 520, 600); c.fillStyle = '#C9C2B6'; c.fillRect(-240, -280, 480, 560); c.fillStyle = '#B9B2A6'; c.fillRect(-240, -10, 480, 16);
  const mugHere = !(L === 'C2' && t > ev('wash') - 0.6) && L !== 'outro'; if (mugHere) mineMug(c, 60, -10, 1);
  for (const sd of [-1, 1]) { const w = 240 * (1 - open * 0.85); paint(c, q => { q.m(sd * 240, -280); q.l(sd * (240 - w), -280); q.l(sd * (240 - w), 280); q.l(sd * 240, 280); q.z(); }, '#7AA8C8', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(sd * (240 - w) - sd * 30 * (1 - open), 0, 10, 0, TAU); c.fill(); }
  c.restore(); }
function plate(c, x, y, w, col) { paint(c, q => q.e(x, y, w, 18), col, { sd: 2, hd: 1, lw: 3 }); }
function tower(c, t, L) { // sink + dish tower
  paint(c, q => { q.m(CTR.x0 - 60, CTR.top); q.l(CTR.x1 + 60, CTR.top); q.l(CTR.x1 + 60, FY); q.l(CTR.x0 - 60, FY); q.z(); }, '#FFFDF8', { sd: 8, hd: 4, lw: 3, inner: k => { k.fillStyle = 'rgba(0,0,0,.06)'; k.fillRect(CTR.x0 - 40, CTR.top + 80, CTR.x1 - CTR.x0 + 80, 6); } });
  c.strokeStyle = '#9AA3B2'; c.lineWidth = 16; c.beginPath(); c.moveTo(150, CTR.top); c.lineTo(150, CTR.top - 160); c.quadraticCurveTo(150, CTR.top - 220, 90, CTR.top - 220); c.stroke();
  for (let i = 0; i < 34; i++) { const y = CTR.top - 10 - i * 42, wob = Math.sin(i * 1.7 + t * 1.5) * (4 + i * 0.5); const kind = i % 5; if (kind === 3) { paint(c, q => { q.m(-60 + wob, y); q.l(60 + wob, y); q.l(50 + wob, y - 70); q.l(-50 + wob, y - 70); q.z(); }, ['#E0474C', '#3C8FE0', '#F2C14E'][i % 3], { sd: 2, hd: 1, lw: 3 }); i += 0; } else plate(c, wob + (hash(i) - 0.5) * 40, y, 140 + hash(i * 3) * 40, ['#FFFFFF', '#E9EEF2', '#F4E6C8'][i % 3]);
    if (i % 7 === 2) { c.fillStyle = 'rgba(140,110,60,.6)'; c.beginPath(); c.arc(wob + 40, y - 6, 10, 0, TAU); c.fill(); } }
  const topY = CTR.top - 10 - 34 * 42;
  const pizza = !(L === 'hook' || (L === 'A1' && t < ev('pizza'))); if (pizza) { const k = L === 'A1' ? eOut(P(t, ev('pizza') - 0.3, ev('pizza'))) : 1; c.save(); c.translate(0, topY - 40 - (1 - k) * 500); paint(c, q => { q.m(-150, 0); q.l(150, 0); q.l(150, -40); q.l(-150, -40); q.z(); }, '#E9C88A', { sd: 3, hd: 2, lw: 3 }); txt(c, 'PIZZA', 0, -20, 26, '#E0474C'); c.restore(); }
  const notes = L === 'hook' || L === 'A1' || (L === 'A2' && t < ev('note')) ? 5 : 6; for (let i = 0; i < notes; i++) { const y = CTR.top - 250 - i * 150, x = (i % 2 ? 1 : -1) * 70; c.save(); c.translate(x, y); c.rotate((hash(i) - 0.5) * 0.4); const fresh = i === 5; const k = fresh && L === 'A2' ? eBack(P(t, ev('note'), ev('note') + 0.25), 2) : 1; c.scale(k, k); c.fillStyle = fresh ? '#FF9AC0' : '#F7E36A'; c.fillRect(-70, -45, 140, 90); txt(c, 'TOMORROW', 0, 0, 22, '#2B2F3A'); c.restore(); }
  if (['C1', 'C2', 'outro'].includes(L) && !(L === 'C1' && t < ev('paper'))) { const k = L === 'C1' ? eOut(P(t, ev('paper') - 0.2, ev('paper'))) : 1; c.save(); c.translate(CTR.x1 + 10, CTR.top - (1 - k) * 400); for (let i = 0; i < 10; i++) plate(c, 0, -i * 10, 110, '#FFFFFF'); txt(c, 'PAPER', 0, -130, 24, '#6A707A', 'Nun9'); c.restore(); }
}
function cardBox(c, k, w, h, fn, rot = -0.03, y = 1150) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(rot); c.scale(k * 0.92, k * 0.92); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 10, -h / 2 + 14, w, h, 30); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -w / 2, -h / 2, w, h, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 30); c.stroke(); fn(); c.restore(); }
function cards(c, t, L) { const win = (a, b) => eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, b, b + 0.25));
  if (L === 'B1') { const k = win(ev('tv'), SP.b1_nar.t + 2.5); if (k > 0) K.phone(c, 790, 1200, 0.6 * k, (cc, w, h) => { cc.fillStyle = '#1E1E24'; cc.fillRect(0, 0, w, h); cc.fillStyle = '#7A3A5A'; cc.fillRect(20, 120, w - 40, 300); cc.fillStyle = '#FFFFFF'; cc.beginPath(); cc.moveTo(w / 2 - 40, 220); cc.lineTo(w / 2 + 50, 270); cc.lineTo(w / 2 - 40, 320); cc.fill(); cc.font = '44px Unb9'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText('EPISODE 1', w / 2, 500); cc.fillStyle = '#F2C14E'; cc.fillText('of 240', w / 2, 570); }, 0.06); }
  if (L === 'B2') cardBox(c, win(ev('rota'), SP.b2_nar.t + 3.0), 700, 420, () => { txt(c, 'DISHES ROTA', 0, -160, 44, '#2B2F3A'); const D = ['MON', 'TUE', 'WED', 'THU', 'FRI']; D.forEach((d, i) => { const y = -100 + i * 44; txt(c, d, -220, y, 28, '#2B2F3A', 'Unb9', 'left'); txt(c, 'YOU', -60, y, 30, '#E0474C', 'Unb9', 'left'); }); c.fillStyle = '#2B2F3A'; c.fillRect(70, -120, 4, 240); txt(c, '30 FEB', 200, -20, 36, '#3C8FE0'); txt(c, 'ZOE', 200, -70, 30, '#3C8FE0'); }, 0.03);
}

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'annoyed', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 330), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330) };
  gest(st, g, 'her', t, 1, 200);
  if (L === 'hook') { st.mood = t < 1.6 ? 'neutral' : 'shock'; st.turn = -0.4; st.look = -0.9; st.lookY = -0.5; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 200); }
  if (L === 'A1') st.mood = t > ev('pizza') ? 'tired' : 'annoyed';
  if (L === 'A2') st.mood = t > ev('note') ? 'skeptical' : 'annoyed';
  if (L === 'B1') st.mood = t > ev('tv') ? 'angry' : 'neutral';
  if (L === 'B2') st.mood = t > ev('rota') ? 'shock' : 'neutral';
  if (L === 'C1') st.mood = t > ev('paper') ? 'tired' : 'annoyed';
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('wash')) st.mood = 'happy'; if (t > ev('sip') - 0.3) { st.mood = 'shock'; } }
  return st; }
function zoeState(t, L) { const g = G.zoe, st = { t, talk: talk('zoe', t), mood: 'happy', turn: -0.35, look: -0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 330), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330) };
  gest(st, g, 'zoe', t, -1, 200);
  if (L === 'hook') { st.mood = 'neutral'; st.items = { R: ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -30, -100, 60, 100, 8); ctx.fill(); } }; st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 120); st.lookY = 0.5; st.look = 0; }
  if (L === 'A1' && t > ev('pizza') - 0.5 && t < ev('pizza')) st.armL = reach(g, -1, -g.sw * 2.4, g.ySh - 260);
  if (L === 'A2' && t > ev('note') - 0.4 && t < ev('note') + 0.2) { st.armL = reach(g, -1, -g.sw * 2.6, g.ySh + 40); st.mood = 'smug'; }
  if (L === 'B1' && t > ev('tv') - 0.4) { st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 120); st.items = { R: ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -30, -100, 60, 100, 8); ctx.fill(); } }; st.lookY = 0.5; st.look = 0.1; st.turn = 0; }
  if (L === 'B2' && t > ev('rota') - 0.3) st.mood = 'smug';
  if (L === 'C1' && t > ev('paper') - 0.3) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 220); }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'tired'; if (t > ev('wash') - 0.6) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 160 + (t < ev('sip') ? Math.sin(t * 16) * 20 : 0)); st.items = { L: ctx => mineMug(ctx, 0, -10, 1.25, t > ev('sip') - 1.2, t) }; } if (t > ev('sip') - 0.2 && t < ev('sip') + 0.8) { st.armL = reach(g, -1, -g.sw * 0.4, g.ySh - 20); st.squint = true; } }
  return st; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const open = L === 'hook' ? eOut(P(t, 0.3, 0.8)) : 1; cupboard(c, t, L, open);
  const heads = {};
  heads.zoe = put(c, ZOE, zoeState(t, L), ZX, FY);
  tower(c, t, L);
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  if (L === 'C2' && t > ev('wash') - 0.6 && t < ev('sip') - 0.3) { c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 8; i++) { const k = (t * 0.8 + i / 8) % 1; c.beginPath(); c.arc(ZX - 300 + hash(i) * 120, -1000 - k * 300, 14 + hash(i * 3) * 12, 0, TAU); c.fill(); } }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -1050, z: 0.76, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.72, cut: u < 0.85 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 200, y: -1250, z: 0.85, r: 0 };
  if (L === 'C2' && t > ev('wash') - 0.8) return { x: 0, y: -1150, z: 0.78, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 240, y: -1200, z: 0.92, r: 0.3 } : { x: ZX - 240, y: -1200, z: 0.92, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { const k = eIO(P(t, 1.3, 2.3)); drawWorld(c, t, 'hook', { x: lerp(CUP.x, 0, k), y: lerp(CUP.y, -1050, k), z: lerp(1.3, 0.62, k), r: 0 }); Hq.vignette(c, W, HH, 0.3);
  if (t > 2.3) { const kk = eBack(P(t, 2.3, 2.6), 2); c.save(); c.translate(540, 1560); c.rotate(-0.05); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -400 + 8, -60 + 10, 800, 120, 20); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -400, -60, 800, 120, 20); c.fill(); UI.textFit(c, 'Unb9', 56, 'ЧИСТЫХ ТАРЕЛОК: 0', 720); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ЧИСТЫХ ТАРЕЛОК: 0', 0, 4); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А У ТЕБЯ БЫЛИ', 'ТАКИЕ СОСЕДИ?'], rows: [['A2', 'Could you wash the dishes, please?'], ['B1', 'Could you wash up after yourself?'], ['B2', 'Could we take turns?'], ['C1', 'We need to split the chores equally.']], cta: ['ОТПРАВЬ СОСЕДКЕ', 'ПО КВАРТИРЕ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 0.6, G.her.ySh + 300) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  cards(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { zoe: ['ZOE', '#2F8A4A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('dishes', NF, renderFrame);
