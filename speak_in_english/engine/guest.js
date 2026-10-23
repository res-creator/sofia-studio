// "Guest won't leave" episode renderer: node guest.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/guest/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london, top: { type: 'sweater', col: '#B9A4E0' }, bottom: { type: 'joggers', col: '#6A5A8A' } };
const BERNIE = { ...BASE.mark, top: { type: 'sweater', col: '#E9A23B' }, bottom: { type: 'jeans', col: '#3B4A6A' } };
const FR = [{ ...BASE.jay }, { ...BASE.priya }, { ...BASE.tony }];
const G = { her: geom(HER), bernie: geom(BERNIE) };
const FY = 60, BX = -220, HERX = 520, DOORX = 1150;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const TIMES = { hook: '02:47', A1: '02:52', A2: '03:15', B1: '03:58', B2: '04:40', C1: '05:30', C2: '06:15', outro: '06:20' };
const DAWN = { hook: 0, A1: 0, A2: 0.05, B1: 0.15, B2: 0.3, C1: 0.6, C2: 1, outro: 1 };

// ---------------- room (prerendered without the window sky)
const BX0 = -1500, BY0 = -3000, BW = 3300, BH = 3700, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#5A6A8A'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.06)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 60, BH);
  c.fillStyle = '#4A5878'; c.fillRect(BX0, -520, BW, 580);
  c.fillStyle = '#FFFDF8'; c.fillRect(-900, -2200, 620, 760); // window frame (sky drawn live)
  c.fillStyle = '#FFFDF8'; c.fillRect(DOORX - 180, -1560, 360, 1620); c.fillStyle = '#7A4A2A'; c.fillRect(DOORX - 160, -1540, 320, 1600); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(DOORX - 110, -720, 16, 0, TAU); c.fill();
  c.fillStyle = '#C9A06A'; c.fillRect(-1300, -1500, 14, 1560); paint(c, q => { q.m(-1380, -1500); q.l(-1206, -1500); q.l(-1250, -1650); q.l(-1336, -1650); q.z(); }, '#F7DFA0', { sd: 6, hd: 4, lw: 3 });
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#8A6A5A'); fg.addColorStop(1, '#6A5040'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); paint(c, q => q.e(-100, 140, 800, 90), '#7A3A4A', { sd: 0, hd: 0, lw: 0 });
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawRoom(c); }
function sky(c, L, t) { const d = L === 'C2' ? clamp(0.6 + 0.4 * P(t, ev('sun') - 0.5, ev('sun') + 1.5)) : DAWN[L]; c.save(); c.beginPath(); c.rect(-880, -2180, 580, 720); c.clip(); const g = c.createLinearGradient(0, -2180, 0, -1460); g.addColorStop(0, `rgb(${Math.round(lerp(20, 120, d))},${Math.round(lerp(28, 180, d))},${Math.round(lerp(60, 230, d))})`); g.addColorStop(1, `rgb(${Math.round(lerp(40, 255, d))},${Math.round(lerp(40, 190, d))},${Math.round(lerp(90, 120, d))})`); c.fillStyle = g; c.fillRect(-880, -2180, 580, 720);
  if (d < 0.4) { c.fillStyle = `rgba(255,250,220,${1 - d * 2})`; c.beginPath(); c.arc(-450, -2000, 50, 0, TAU); c.fill(); for (let i = 0; i < 12; i++) { c.fillRect(-860 + hash(i) * 540, -2160 + hash(i * 3) * 400, 4, 4); } }
  if (d > 0.5) { const sy = lerp(-1420, -1750, (d - 0.5) * 2); c.fillStyle = '#FFD84A'; c.beginPath(); c.arc(-600, sy, 80, 0, TAU); c.fill(); }
  c.fillStyle = '#2B2F3A'; for (let i = 0; i < 6; i++) { const h = 120 + hash(i * 7) * 220; c.fillRect(-880 + i * 100, -1460 - h, 80, h); } c.restore(); c.fillStyle = '#FFFDF8'; c.fillRect(-600, -2180, 16, 720); c.fillRect(-880, -1830, 580, 16); }
function wallClock(c, L, k) { c.save(); c.translate(-30, -1900); c.scale(1 + 0.25 * k, 1 + 0.25 * k); c.fillStyle = '#1A1A1A'; rr(c, -200, -80, 400, 160, 20); c.fill(); txt(c, TIMES[L] || '02:47', 0, 4, 100, '#E0474C'); c.restore(); }

// ---------------- props
function sofa(c) { paint(c, q => { q.m(-640, -760); q.l(200, -760); q.l(200, -300); q.l(-640, -300); q.z(); }, '#3C8F7A', { sd: 12, hd: 6, lw: 3 }); paint(c, q => { q.m(-700, -420); q.l(260, -420); q.l(260, -80); q.l(-700, -80); q.z(); }, '#4FA88A', { sd: 10, hd: 5, lw: 3 }); c.fillStyle = '#2B2F3A'; c.fillRect(-690, -80, 30, 140); c.fillRect(220, -80, 30, 140); }
function tableTop(c, t, L) { paint(c, q => { q.m(-120, -300); q.l(380, -300); q.l(380, -270); q.l(-120, -270); q.z(); }, '#B98A62', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#8A6A4A'; c.fillRect(-100, -270, 22, 330); c.fillRect(338, -270, 22, 330);
  paint(c, q => { q.m(-80, -340); q.l(60, -340); q.l(80, -300); q.l(-100, -300); q.z(); }, '#E0474C', { sd: 3, hd: 2, lw: 3 }); txt(c, 'CRISPS', -10, -320, 18, '#F2C14E');
  const has = k => t > ev(k) || (['A2', 'B1', 'B2', 'C1', 'C2'].includes(L) && k === 'coffee') || (['B1', 'B2', 'C1', 'C2'].includes(L) && k === 'game') || (['B2', 'C1', 'C2'].includes(L) && k === 'alarm');
  if (has('coffee') && L !== 'hook') for (const x of [120, 200]) { paint(c, q => { q.m(x - 34, -400); q.l(x + 34, -400); q.l(x + 28, -300); q.l(x - 28, -300); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#5A3A2A'; c.fillRect(x - 28, -396, 56, 12); }
  if (has('game') && L !== 'hook' && L !== 'A1') { c.fillStyle = '#F2EBDD'; rr(c, 240, -330, 140, 30, 4); c.fill(); c.fillStyle = '#E0474C'; c.fillRect(240, -330, 140, 10); txt(c, 'MONOPOLY', 310, -312, 13, '#2B2F3A'); }
  if (has('alarm') && !['hook', 'A1', 'A2'].includes(L)) { paint(c, q => q.e(320, -370, 40, 40), '#F2C14E', { sd: 3, hd: 2, lw: 3 }); txt(c, '6:00', 320, -370, 18, '#2B2F3A'); } }
function slippers(c, x) { for (const s of [-1, 1]) { paint(c, q => q.e(x + s * 50, FY - 20, 60, 26), '#FFFFFF', { sd: 3, hd: 2, lw: 3 }); paint(c, q => q.e(x + s * 50 - 20, FY - 60, 12, 30), '#F7B6CF', { sd: 2, hd: 1, lw: 2 }); paint(c, q => q.e(x + s * 50 + 5, FY - 60, 12, 30), '#F7B6CF', { sd: 2, hd: 1, lw: 2 }); } }
function suitcase(ctx, col) { paint(ctx, q => { q.m(-70, -10); q.l(70, -10); q.l(70, 170); q.l(-70, 170); q.z(); }, col, { sd: 4, hd: 2, lw: 3 }); ctx.fillStyle = '#2B2F3A'; ctx.fillRect(-20, -40, 40, 30); }
function toothbrush(cc, x, y, rot = 0) { cc.save(); cc.translate(x, y); cc.rotate(rot); cc.fillStyle = '#3C8FE0'; rr(cc, -60, -7, 100, 14, 6); cc.fill(); cc.fillStyle = '#FFFFFF'; cc.fillRect(26, -16, 24, 10); cc.restore(); }

// ---------------- characters
function berniePose(t, L) { const lying = ['B2', 'C1'].includes(L) && (L !== 'B2' || t > ev('lie')) || (L === 'C2' && t < SP.c2_x.t + 0.3); const standing = L === 'C2' && t > SP.c2_x.t + 0.3; return { lying, standing }; }
function bernieState(t, L) { const g = G.bernie, ps = berniePose(t, L), st = { t, talk: talk('bernie', t), mood: 'happy', turn: 0.35, look: 0.7, legPose: ps.standing ? 'stand' : 'sit', drop: ps.standing ? 0 : 330, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300) };
  const sp = TL.speech.find(s => s.who === 'bernie' && t >= s.t && t < s.t + s.d); if (sp && !ps.lying) { const u = (t - sp.t) * 4; st.armR = reach(g, 1, g.sw * 1.7 + Math.sin(u) * 25, g.ySh + 200 + Math.cos(u) * 25); }
  if (L === 'hook') st.items = { R: ctx => { paint(ctx, q => { q.m(-30, -60); q.l(30, -60); q.l(36, 20); q.l(-36, 20); q.z(); }, '#E0474C', { sd: 2, hd: 1, lw: 3 }); } };
  if (L === 'A1' && t > ev('coffee') - 0.3) st.items = { R: ctx => { paint(ctx, q => { q.m(-34, -90); q.l(34, -90); q.l(28, 0); q.l(-28, 0); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); } };
  if (ps.lying) { st.mood = L === 'C1' ? 'happy' : 'happy'; st.squint = L === 'B2'; }
  if (L === 'C1' && t > ev('brush') - 0.2) st.front = (cc, gg) => toothbrush(cc, gg.head.x + 70, gg.head.y + g.hh * 0.35, 0.2 + Math.sin(t * 16) * 0.15);
  if (L === 'C2' && t > SP.c2_x2.t - 0.2) { st.mood = 'smug'; st.squint = true; }
  return st; }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'tired', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300) };
  const sp = TL.speech.find(s => s.who === 'her' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4; st.armL = reach(g, -1, -g.sw * 1.6 + Math.sin(u) * 25, g.ySh + 220 + Math.cos(u) * 25); }
  if (L === 'A1' && speaking('a1_her', t)) { st.mood = 'tired'; st.armL = reach(g, -1, -g.hw * 0.3, -g.h + g.hh * 1.6); }
  if (L === 'B2' && t > ev('coat') - 0.1 && t < ev('lie')) { st.armL = reach(g, -1, -g.sw * 2.2, g.ySh + 120); st.items = { L: ctx => { paint(ctx, q => { q.m(-60, -20); q.l(60, -20); q.l(80, 260); q.l(-80, 260); q.z(); }, '#8A5A3A', { sd: 4, hd: 2, lw: 3 }); } }; }
  if (L === 'C1' && t > ev('brush')) st.mood = 'shock';
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'tired'; if (t > SP.c2_x.t) { st.mood = 'happy'; st.laugh = true; } if (t > ev('door') + 0.3) { st.mood = 'shock'; st.laugh = false; st.turn = 0.4; st.look = 0.9; } if (SP.c2_x2 && t > SP.c2_x2.t + 0.4) { st.mood = 'tired'; st.tilt = 0.15; st.drop = 120; } }
  if (!['hook', 'A1'].includes(L)) { const prev = st.front; st.front = (cc, gg) => { if (prev) prev(cc, gg); cc.strokeStyle = 'rgba(110,80,140,.55)'; cc.lineWidth = 5; for (const s of [-1, 1]) { cc.beginPath(); cc.arc(gg.head.x + s * g.hw * 0.42, gg.head.y + g.hh * 0.18, 20, 0.2, Math.PI - 0.2); cc.stroke(); } }; }
  return st; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH); sky(c, L, t);
    const heads = {};
  if (L === 'C2' && t > ev('door')) { const k = eOut(P(t, ev('door'), ev('door') + 0.4)); c.fillStyle = '#FFF4D0'; c.fillRect(DOORX - 160, -1540, 320 * k, 1600); }
  sofa(c);
  const ps = berniePose(t, L);
  if (ps.lying) { const piv = { x: BX, y: -330 }, ang = -0.5; c.save(); c.translate(piv.x, piv.y); c.rotate(ang); c.translate(-piv.x, -piv.y); const hd = put(c, BERNIE, bernieState(t, L), BX, FY); if (L !== 'C2' || t < SP.c2_x.t) paint(c, q => { q.m(BX - 170, -880); q.l(BX + 190, -880); q.l(BX + 260, -250); q.l(BX - 240, -250); q.z(); }, '#8A5A3A', { sd: 6, hd: 3, lw: 3 }); c.restore();
    const dx = hd.x - piv.x, dy = hd.y - piv.y; heads.bernie = { x: piv.x + dx * Math.cos(ang) - dy * Math.sin(ang), y: piv.y + dx * Math.sin(ang) + dy * Math.cos(ang), hh: hd.hh }; }
  else heads.bernie = put(c, BERNIE, bernieState(t, L), ps.standing ? lerp(BX, DOORX - 300, eIO(P(t, SP.c2_x.t + 0.3, ev('door')))) : BX, FY);
  if (!['hook', 'A1'].includes(L) && (L !== 'B1' || t > ev('slippers'))) slippers(c, -420);
  tableTop(c, t, L);
  if (L === 'C2' && t > ev('door') + 0.2) { const k = eOut(P(t, ev('door') + 0.2, ev('door') + 0.8)); FR.forEach((cfg, i) => { const g = geom(cfg); const x = DOORX + 50 + i * 160 + (1 - k) * 400; c.save(); c.globalAlpha = k; const hd = put(c, cfg, { t, talk: talk('friends', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300), items: { R: ctx => suitcase(ctx, ['#E0474C', '#3C8FE0', '#F2C14E'][i]) }, front: (cc, gg) => toothbrush(cc, gg.head.x - 60, gg.head.y + g.hh * 0.38, 0.1) }, x, FY, 0.9); c.restore(); if (i === 1) heads.friends = hd; }); }
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 150, y: -1150, z: 0.66, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, y: -1350, z: 0.62, cut: u < 0.85 };
  if (L === 'C2' && t > ev('door') - 0.3) return { x: 820, y: -1150, z: 0.7, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX - 100, y: -1650, z: 0.8, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX - 150, y: -1250, z: 0.85, r: -0.3 } : { x: -100, y: -1050, z: 0.8, r: 0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { drawWorld(c, t, 'hook', { x: 150, y: -1150, z: 0.66, r: 0 }); const ck = 1 - eIO(P(t, 1.4, 2.0)); { c.save(); c.translate(lerp(190, 540, ck), lerp(345, 1150, ck)); const s2 = lerp(1, 3.2, ck) * (1 + 0.04 * Math.sin(t * 12)); c.scale(s2, s2); c.fillStyle = '#1A1A1A'; rr(c, -125, -42, 250, 84, 30); c.fill(); txt(c, '02:47', 0, 4, 58, '#E0474C'); c.restore(); } Hq.vignette(c, W, HH, 0.34); K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А КАК ТЫ', 'ВЫПРОВАЖИВАЕШЬ ГОСТЕЙ?'], rows: [['A2', "It's very late."], ['B1', "I've got an early start tomorrow."], ['B2', 'Let me get your coat.'], ['C1', 'I really need to get some sleep.']], cta: ['ОТПРАВЬ ТОМУ, КТО', 'НЕ УХОДИТ ИЗ ГОСТЕЙ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'tired', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 0.6, G.her.ySh + 300) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.3);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  { const t0 = sc.s + 1.2, k = t > t0 ? Math.exp(-(t - t0) * 6) : 0; c.save(); c.translate(190, 345); c.scale(1 + 0.3 * k, 1 + 0.3 * k); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -125 + 5, -42 + 6, 250, 84, 30); c.fill(); c.fillStyle = '#1A1A1A'; rr(c, -125, -42, 250, 84, 30); c.fill(); txt(c, TIMES[sc.id], 0, 4, 58, '#E0474C'); c.restore(); }
  K.bubbles(c, t, sc, heads, proj, { names: { bernie: ['BERNIE', '#E9A23B'], friends: ['FRIENDS', '#3C8FE0'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('guest', NF, renderFrame);
