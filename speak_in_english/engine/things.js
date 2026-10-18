// "Stop taking my things" episode renderer: node things.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/things/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london, top: { type: 'blazer', col: '#E57C9C', shirt: '#FFFFFF', tie: '#FFFFFF' } };
const DEREK = { ...BASE.ben, top: { type: 'sweater', col: '#C9A06A' } };
const G = { her: geom(HER), derek: geom(DEREK) };
const FY = 60, HERX = -330, DX = 330, TOP = -470;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- office (prerendered)
const BX0 = -1500, BY0 = -2900, BW = 3000, BH = 3600, BS = 0.5;
function drawOffice(c) { c.fillStyle = '#E3E9EF'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = '#CBD5DF'; c.fillRect(BX0, -700, BW, 760);
  for (const x of [-1300, -500, 300, 1100]) { c.fillStyle = '#FFFFFF'; c.fillRect(x, -2500, 560, 900); c.fillStyle = '#A9D0EC'; c.fillRect(x + 20, -2480, 520, 860); c.fillStyle = '#DDEEF8'; c.fillRect(x + 20, -1900, 520, 280); }
  c.fillStyle = '#4CAF6A'; for (const x of [-1420, 1380]) { paint(c, q => { q.m(x - 60, -300); q.l(x + 60, -300); q.l(x + 50, FY); q.l(x - 50, FY); q.z(); }, '#C96A3A', { sd: 3, hd: 2, lw: 3 }); for (let i = 0; i < 7; i++) paint(c, q => q.e(x + Math.cos(i) * 70, -420 - Math.sin(i * 1.7) * 110, 70, 30), '#4CAF6A', { sd: 2, hd: 1, lw: 2 }); }
  c.fillStyle = '#FFFFFF'; rr(c, -260, -1500, 520, 260, 16); c.fill(); txt(c, 'TEAMWORK', 0, -1420, 54, '#3C6FB4'); txt(c, 'makes the dream work', 0, -1340, 32, '#6A707A', 'Nun9');
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#8A93A2'); fg.addColorStop(1, '#6A737F'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); }
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawOffice(c); }

// ---------------- items: whose desk is each on?
const ITEMS = [ // [name, her x, his x, taken-at event]
  ['lunch', -400, 470, 'hookLunch'], ['pen', -420, 160, 'hookPen'], ['mug', -300, 260, 'sip'], ['charger', -200, 380, 'cable'], ['stapler', -120, 460, 'staple'], ['pointer', -380, 200, 'pointer']];
const hookT = { hookLunch: 0.9, hookPen: 1.5 };
const takenAt = k => hookT[k] !== undefined ? hookT[k] : ev(k);
function drawItem(c, n, x, y, t) { c.save(); c.translate(x, y);
  if (n === 'pen') { c.rotate(-0.4); c.fillStyle = '#3C6FB4'; rr(c, -8, -90, 16, 90, 6); c.fill(); c.fillStyle = '#2B2F3A'; c.fillRect(-8, -100, 16, 14); }
  if (n === 'mug') { paint(c, q => { q.m(-42, -100); q.l(42, -100); q.l(36, 0); q.l(-36, 0); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.arc(48, -55, 18, -1.3, 1.3); c.stroke(); txt(c, "WORLD'S", 0, -72, 13, '#E0474C'); txt(c, 'BEST', 0, -54, 15, '#E0474C'); txt(c, 'COLLEAGUE', 0, -36, 11, '#E0474C'); }
  if (n === 'charger') { c.fillStyle = '#FFFFFF'; rr(c, -24, -40, 48, 40, 6); c.fill(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 3; c.stroke(); }
  if (n === 'stapler') { paint(c, q => { q.m(-70, -40); q.l(60, -50); q.l(70, -20); q.l(-70, 0); q.z(); }, '#E0474C', { sd: 3, hd: 2, lw: 3 }); }
  if (n === 'pointer') { c.rotate(0.2); c.fillStyle = '#2B2F3A'; rr(c, -60, -16, 120, 16, 6); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(60, -8, 6, 0, TAU); c.fill(); }
  if (n === 'lunch') { paint(c, q => { q.m(-70, -70); q.l(70, -70); q.l(70, 0); q.l(-70, 0); q.z(); }, '#4CAF6A', { sd: 3, hd: 2, lw: 3 }); txt(c, 'LUNCH', 0, -34, 22, '#FFFFFF'); }
  c.restore(); }
function desks(c, t, L) { for (const [x0, x1] of [[-560, -40], [40, 600]]) { paint(c, q => { q.m(x0, TOP); q.l(x1, TOP); q.l(x1, TOP + 30); q.l(x0, TOP + 30); q.z(); }, '#E9E4DA', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#9AA3B2'; c.fillRect(x0 + 20, TOP + 30, 20, FY - TOP - 30); c.fillRect(x1 - 40, TOP + 30, 20, FY - TOP - 30); }
  for (const [x, col] of [[-500, '#2B2F3A'], [530, '#2B2F3A']]) { c.fillStyle = col; rr(c, x - 80, TOP - 230, 160, 110, 10); c.fill(); c.fillStyle = '#9FD8F2'; rr(c, x - 70, TOP - 220, 140, 90, 6); c.fill(); c.fillStyle = col; c.fillRect(x - 8, TOP - 120, 16, 120); }
  const hooked = L === 'hook';
  for (const [n, hx, dx, k] of ITEMS) { const tk = takenAt(k); const gone = hooked ? t > tk : (tk < 1e8 && (t > tk || (hookT[k] !== undefined))); let x = gone ? dx : hx; if (!hooked && !gone && k !== 'cable' && false) x = hx;
    if (hooked && t > tk && t < tk + 0.4) { const p = P(t, tk, tk + 0.4); c.save(); c.globalAlpha = 1 - p; drawItem(c, n, hx, TOP, t); c.restore(); UI.star(c, hx, TOP - 60, 26 * (1 - p), t); continue; }
    if (hooked && gone) continue;
    drawItem(c, n, x, TOP, t); }
  if ((L === 'B1' && t > ev('cable')) || ['B2', 'C1', 'C2'].includes(L)) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; c.beginPath(); c.moveTo(-200, TOP - 20); c.quadraticCurveTo(100, TOP + 300, DX + 120, -620); c.stroke(); }
  if (L === 'C2' && t > ev('museum')) { const k = eBack(P(t, ev('museum'), ev('museum') + 0.4), 2); c.save(); c.translate(330, TOP + 90); c.scale(k, k); c.fillStyle = '#F2C14E'; rr(c, -200, -50, 400, 100, 16); c.fill(); txt(c, "DEREK'S STUFF", 0, 4, 46, '#2B2F3A'); c.restore(); } }

// ---------------- characters
const seat = { legPose: 'sit', drop: 330 };
function chair(c, x) { c.fillStyle = '#2B2F3A'; c.fillRect(x - 110, -330, 220, 30); c.fillRect(x - 10, -300, 20, 260); c.fillRect(x - 100, -40, 200, 14); for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 90, -10, 18, 0, TAU); c.fill(); } }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.45, look: 0.8, ...seat, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 330), armR: reach(g, 1, g.sw * 1.5, g.ySh + 330) };
  const sp = TL.speech.find(s => s.who === 'her' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st.armR = reach(g, 1, g.sw * 1.7 + Math.sin(u) * 20, g.ySh + 220 + Math.cos(u) * 20); }
  st.mood = ({ hook: 'shock', A1: 'annoyed', A2: 'annoyed', B1: 'skeptical', B2: 'annoyed', C1: 'angry', C2: 'smug' })[L] || 'neutral';
  if (L === 'C2' && SP.c2_x2 && t > SP.c2_x2.t) { st.mood = 'shock'; st.lookY = 0.2; }
  return st; }
function derekState(t, L) { const g = G.derek, st = { t, talk: talk('derek', t), mood: 'happy', turn: -0.45, look: -0.8, ...seat, armL: reach(g, -1, -g.sw * 1.5, g.ySh + 330), armR: reach(g, 1, g.sw * 0.5, g.ySh + 330) };
  const sp = TL.speech.find(s => s.who === 'derek' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st.armL = reach(g, -1, -g.sw * 1.8 + Math.sin(u) * 25, g.ySh + 200 + Math.cos(u) * 25); }
  if (L === 'A1') { st.armR = reach(g, 1, g.sw * 0.8, g.ySh + 120); st.items = { R: ctx => drawItem(ctx, 'pen', 0, 0, t) }; }
  if (L === 'A2' && t > ev('sip') - 0.3 && t < ev('sip') + 1.2) { st.armR = reach(g, 1, g.sw * 0.3, g.ySh - 40); st.items = { R: ctx => drawItem(ctx, 'mug', 0, 30, t) }; }
  if (L === 'B1' && t > ev('cable')) { st.mood = 'smug'; st.squint = true; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 80); st.items = { R: ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -26, -100, 52, 100, 10); ctx.fill(); ctx.fillStyle = '#7CF29A'; ctx.fillRect(-20, -92, 40, 82); ctx.fillStyle = '#1A2A1A'; ctx.font = '16px Unb9'; ctx.textAlign = 'center'; ctx.fillText('100%', 0, -50); } }; }
  if (L === 'B2' && t > ev('staple') - 0.2) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 100); st.items = { L: ctx => drawItem(ctx, 'stapler', 0, 0, t) }; st.mood = 'happy'; }
  if (L === 'C1' && t > ev('pointer') - 0.4) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 140); st.items = { L: ctx => drawItem(ctx, 'pointer', 0, 0, t) }; }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'neutral'; if (SP.c2_x2 && t > SP.c2_x2.t - 0.2) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 260); } }
  return st; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  chair(c, HERX - 30); chair(c, DX + 30);
  const heads = {};
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  heads.derek = put(c, DEREK, derekState(t, L), DX, FY);
  desks(c, t, L);
  if (L === 'C1' && t > ev('pointer') - 0.4 && t < SP.c1_nar.t + 0.4) { c.strokeStyle = 'rgba(224,71,76,.8)'; c.lineWidth = 4; c.beginPath(); c.moveTo(DX - 260, -760); c.lineTo(HERX + 60, -1200 + Math.sin(t * 9) * 30); c.stroke(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(HERX + 60, -1200 + Math.sin(t * 9) * 30, 9, 0, TAU); c.fill(); }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -900, z: 0.8, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.76, cut: u < 0.85 };
  if (L === 'C2' && t > ev('museum') - 0.3 && t < SP.c2_nar.t + 0.5) return { x: 100, y: -850, z: 0.7, r: 0 };
  if (L === 'B1' && t > ev('cable') - 0.2 && t < SP.b1_nar.t + 0.5) return { x: 50, y: -800, z: 0.72, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 160, y: -1250, z: 0.85, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 230, y: -950, z: 0.98, r: 0.3 } : { x: DX - 230, y: -980, z: 0.98, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { drawWorld(c, t, 'hook', { x: lerp(-300, 0, eIO(P(t, 2.0, 2.8))), y: lerp(-650, -900, eIO(P(t, 2.0, 2.8))), z: lerp(1.3, 0.8, eIO(P(t, 2.0, 2.8))), r: 0 }); Hq.vignette(c, W, HH, 0.3);
  const q = eBack(P(t, 1.8, 2.1), 2); if (q > 0) { c.save(); c.translate(540, 1500); c.scale(q, q); c.rotate(-0.05); UI.font(c, 'Unb9', 66); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КУДА ВСЁ ДЕВАЕТСЯ?', 0, 0, C.gold, C.oliveD, 14); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А У ТЕБЯ ЕСТЬ', 'ТАКОЙ КОЛЛЕГА?'], rows: [['A2', "Please don't take my mug. It's mine."], ['B1', 'It was right here.'], ['B2', "I'd appreciate it if you asked first."], ['C1', 'I need you to stop taking my things.']], cta: ['ОТПРАВЬ КОЛЛЕГЕ,', 'КОТОРЫЙ ВСЁ БЕРЁТ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 1.0, G.her.ySh + 160), items: { R: ctx => drawItem(ctx, 'mug', 0, 30, tt) } }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  K.bubbles(c, t, sc, heads, proj, { names: { derek: ['DEREK', '#C9A06A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('things', NF, renderFrame);
