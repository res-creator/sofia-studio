// "Stuck in a lift with someone who smells" episode renderer: node smell.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, noise1, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/smell/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london };
const GARY = { ...BASE.tom, build: { shoulder: 1.25, arm: 1.3, muscle: 0.5 }, top: { type: 'tank', col: '#8A8F9A', text: 'GYM', textSize: 50, textCol: '#2B2F3A' }, bottom: { type: 'shorts', col: '#2B2F3A' }, shoes: { col: '#FFFFFF', acc: '#E0474C' } };
const RUNNER = { ...BASE.dan, cap: null, top: { type: 'tank', col: '#3C8FE0', text: '42', textSize: 70, textCol: '#FFFFFF' }, bottom: { type: 'shorts', col: '#2B2F3A' } };
const G = { her: geom(HER), gary: geom(GARY), runner: geom(RUNNER) };
const FY = 60, HERX = -300, GX = 270, RX = 560;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- lift interior (prerendered)
const BX0 = -900, BY0 = -2500, BW = 1800, BH = 3100, BS = 0.5;
function drawLift(c) {
  const g = c.createLinearGradient(BX0, 0, BX0 + BW, 0); g.addColorStop(0, '#9AA3B2'); g.addColorStop(0.5, '#D6DCE4'); g.addColorStop(1, '#9AA3B2'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  c.strokeStyle = 'rgba(80,90,110,.35)'; c.lineWidth = 6; for (let x = -600; x <= 600; x += 300) { c.beginPath(); c.moveTo(x, -2100); c.lineTo(x, FY); c.stroke(); }
  c.fillStyle = '#C9CED6'; c.fillRect(-640, -2150, 1280, 60); c.fillStyle = '#FFF4C0'; for (const x of [-400, 0, 400]) { c.beginPath(); c.ellipse(x, -2120, 110, 22, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#8A93A2'; rr(c, -160, -2400, 320, 220, 14); c.fill(); c.fillStyle = '#6A737F'; rr(c, -140, -2380, 280, 180, 10); c.fill(); // hatch
  c.fillStyle = '#B9BFC8'; c.fillRect(-700, -1000, 1400, 26); // handrail
  c.fillStyle = 'rgba(220,240,255,.35)'; rr(c, -260, -1850, 520, 700, 20); c.fill(); c.strokeStyle = '#8A93A2'; c.lineWidth = 8; c.stroke(); // mirror
  c.fillStyle = '#6A6E78'; c.fillRect(BX0, FY, BW, BY0 + BH - FY); c.fillStyle = 'rgba(0,0,0,.15)'; for (let x = BX0; x < BX0 + BW; x += 90) c.fillRect(x, FY, 4, 600);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.2px)'; drawLift(c); }

// ---------------- stink, plant, fan
function stinkLevel(t, L) { const base = { hook: 1, A1: 1, A2: 1, B1: 2, B2: 2.5, C1: 3, C2: 3 }[L] || 1; let s = base; if (L === 'A2' && t > ev('spray')) s = 2; if (L === 'C2' && t > ev('open')) s = 3 * (1 - P(t, ev('open'), ev('open') + 0.8)); if (L === 'C2' && t > ev('enter')) s = 4.5; return s; }
function stink(c, x, y, t, lvl, seed = 0) { if (lvl <= 0.05) return; c.save(); c.strokeStyle = 'rgba(110,170,60,.75)'; c.lineCap = 'round'; const n = Math.round(3 + lvl * 3); for (let i = 0; i < n; i++) { const ph = (t * 0.6 + i / n + seed) % 1, xx = x + (hash(i + seed * 7) - 0.5) * 320, yy = y - ph * 700 * Math.min(1.6, lvl / 2 + 0.5); c.globalAlpha = Math.sin(ph * Math.PI) * 0.85; c.lineWidth = 10 + lvl * 3; c.beginPath(); for (let k = 0; k <= 8; k++) { const u = k / 8; const px = xx + Math.sin(u * 6 + t * 3 + i) * 26, py = yy - u * 160; k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); } c.restore(); }
function plant(c, x, t, L) { const dead = L === 'C2' || (L === 'C1' && t > ev('wilt')); const droop = dead ? 1 : ({ hook: 0, A1: 0.1, A2: 0.3, B1: 0.5, B2: 0.7, C1: 0.8 }[L] || 0) + (L === 'A2' && t > ev('spray') ? 0.1 : 0);
  const fall = L === 'C1' ? eIn(P(t, ev('wilt'), ev('wilt') + 0.5)) : (L === 'C2' ? 1 : 0);
  paint(c, q => { q.m(x - 70, -230); q.l(x + 70, -230); q.l(x + 55, FY); q.l(x - 55, FY); q.z(); }, '#C96A3A', { sd: 4, hd: 2, lw: 3 });
  c.save(); c.translate(x, -230); c.rotate(fall * 1.3); c.strokeStyle = dead ? '#8A7A4A' : '#3A8A4A'; c.lineWidth = 12; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(droop * 120, -260, droop * 220, -400 + droop * 260); c.stroke();
  const hx = droop * 220, hy = -400 + droop * 260; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; paint(c, q => q.e(hx + Math.cos(a) * 40, hy + Math.sin(a) * 40, 32, 22), dead ? '#B08A6A' : '#E0474C', { sd: 2, hd: 1, lw: 2 }); } paint(c, q => q.e(hx, hy, 24, 24), dead ? '#7A6A4A' : '#F2C14E', { sd: 2, hd: 1, lw: 2 }); c.restore();
  if (L === 'A2' && t > ev('spray')) { const k = P(t, ev('spray'), ev('spray') + 1.2); paint(c, q => q.e(x + 60 + k * 40, -500 + k * 480, 30, 20), '#E0474C', { sd: 2, hd: 1, lw: 2 }); } }
function fan(c, t, L) { const off = (L === 'B2' && t > ev('fan')) || ['C1', 'C2'].includes(L); const ang = off ? 0.4 : t * 14; c.save(); c.translate(420, -2000); c.fillStyle = '#6A737F'; c.beginPath(); c.arc(0, 0, 20, 0, TAU); c.fill(); for (let i = 0; i < 3; i++) { c.save(); c.rotate(ang + i * TAU / 3); paint(c, q => q.e(0, -60, 22, 60), '#B9BFC8', { sd: 2, hd: 1, lw: 2 }); c.restore(); } c.restore(); }
function indicator(c, t, L) { c.save(); c.translate(0, -2240); c.fillStyle = '#1A1A1A'; rr(c, -150, -60, 300, 110, 14); c.fill(); const blink = Math.floor(t * 2) % 2; const open = L === 'C2' && t > ev('open'); txt(c, open ? '7 ▲' : (blink ? '3 ■' : '3'), 0, -4, 70, open ? '#7CF29A' : '#E0474C'); c.restore(); }

// ---------------- characters
function herState(t, L) { const g = G.her, lvl = stinkLevel(t, L), st = { t, talk: talk('her', t), mood: 'worried', turn: 0.4, look: 0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.25, g.hh * 0 + g.headY - g.ySh + g.ySh + 30) };
  const pinch = !TL.speech.some(s => s.who === 'her' && t >= s.t && t < s.t + s.d); st.armR = pinch ? reach(g, 1, g.hw * 0.25, -g.h + g.hh * 1.25) : reach(g, 1, g.sw * 1.4, g.ySh + 200);
  if (pinch && !(L === 'C2' && t > ev('open') && t < ev('enter'))) st.front = (cc, gg) => { cc.fillStyle = HER.skin; cc.strokeStyle = '#2B2F3A'; cc.lineWidth = 4; cc.beginPath(); cc.ellipse(gg.head.x + g.hw * 0.12, gg.head.y + g.hh * 0.22, 30, 22, 0.3, 0, TAU); cc.fill(); cc.stroke(); };
  st.mood = lvl > 2.5 ? 'shock' : 'worried'; if (L === 'A1') st.mood = 'annoyed';
  if (L === 'B1' && t > ev('arms') && t < SP.b1_nar.t + 1) { st.mood = 'shock'; st.tilt = -0.12; st.headX = -30; }
  if (L === 'C2' && t > ev('open') && t < ev('enter')) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 120); st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 120); }
  if (L === 'C2' && t > ev('enter')) { st.mood = 'shock'; }
  if (L === 'C2' && SP.c2_x2 && t > SP.c2_x2.t) { st.mood = 'tired'; st.drop = 260 * P(t, SP.c2_x2.t, SP.c2_x2.t + 1.2); st.legPose = 'squat'; }
  return st; }
function garyState(t, L) { const g = G.gary, st = { t, talk: talk('gary', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300) };
  const sp = TL.speech.find(s => s.who === 'gary' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4; st.armL = reach(g, -1, -g.sw * 1.7 + Math.sin(u) * 25, g.ySh + 200 + Math.cos(u) * 25); }
  if (L === 'A1' && t > ev('pat') - 0.2 && t < ev('pat') + 0.8) st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 120);
  if (L === 'A2' && t > ev('spray') - 0.3 && t < ev('spray') + 0.6) { st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 60); st.items = { R: ctx => { paint(ctx, q => { q.m(-24, -110); q.l(24, -110); q.l(24, 0); q.l(-24, 0); q.z(); }, '#7CF29A', { sd: 2, hd: 1, lw: 3 }); ctx.fillStyle = '#2B2F3A'; ctx.fillRect(-10, -132, 20, 22); } }; }
  if (L === 'B1' && t > ev('arms') - 0.3 && t < SP.b1_nar.t + 0.6) { st.armL = reach(g, -1, -g.sw * 1.2, g.ySh - 520); st.armR = reach(g, 1, g.sw * 1.2, g.ySh - 520); st.mood = 'happy'; }
  if (['B2', 'C1', 'C2'].includes(L) && (L !== 'B2' || t > ev('badge') - 0.2)) { const prev = st.afterTorso; st.afterTorso = cc => { cc.fillStyle = '#4CAF6A'; cc.beginPath(); cc.arc(-g.sw * 0.4, g.ySh + 180, 46, 0, TAU); cc.fill(); cc.strokeStyle = '#FFFFFF'; cc.lineWidth = 4; cc.stroke(); txt(cc, 'SAVE', -g.sw * 0.4, g.ySh + 168, 16, '#FFFFFF'); txt(cc, 'WATER', -g.sw * 0.4, g.ySh + 190, 16, '#FFFFFF'); }; }
  if (L === 'C1' && t > SP.c1_x.t - 0.6) { st.headX = 30; st.tilt = 0.15; st.mood = 'skeptical'; }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'sad'; if (t > SP.c2_x.t) st.mood = 'happy'; if (t > ev('enter')) { st.turn = 0.4; st.look = 0.8; st.mood = 'shock'; } if (SP.c2_x2 && t > SP.c2_x2.t - 0.2) { st.mood = 'skeptical'; st.armR = reach(g, 1, g.sw * 1.5, g.ySh + 100); } }
  return st; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  fan(c, t, L); indicator(c, t, L); plant(c, -560, t, L);
  const heads = {}, lvl = stinkLevel(t, L);
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  heads.gary = put(c, GARY, garyState(t, L), GX, FY);
  if (L === 'C2' && t > ev('enter') - 0.7) { const k = eOut(P(t, ev('enter') - 0.7, ev('enter'))); heads.runner = put(c, RUNNER, { t, talk: talk('runner', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(G.runner, -1, -G.runner.sw * 1.6, G.runner.ySh - 100, { fist: true }), armR: reach(G.runner, 1, G.runner.sw * 0.6, G.runner.ySh + 300) }, lerp(1100, RX, k), FY); stink(c, lerp(1100, RX, k), -1400, t, 4, 3); }
  stink(c, GX, -1300, t, lvl);
  if (L === 'B1' && t > ev('arms') && t < SP.b1_nar.t + 0.8) { const k = P(t, ev('arms'), ev('arms') + 0.7); c.save(); c.globalAlpha = 1 - k; c.strokeStyle = 'rgba(110,170,60,.9)'; c.lineWidth = 22; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(GX - 200, -1500, 200 + k * 600 + i * 70, Math.PI * 0.7, Math.PI * 1.25); c.stroke(); } c.restore(); }
  if (lvl > 0.05) { c.fillStyle = `rgba(150,200,90,${Math.min(0.35, lvl * 0.06)})`; c.fillRect(BX0, BY0, BW, BH); }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -1150, z: 0.8, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.76, cut: u < 0.85 };
  if (L === 'C1' && t > ev('wilt') - 0.2 && t < SP.c1_nar.t + 0.4) return { x: -260, y: -850, z: 0.74, r: 0 };
  if (L === 'C2' && t > ev('enter') - 0.8) return { x: 120, y: -1150, z: 0.72, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 150, y: -1500, z: 0.9, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 200, y: -1300, z: 0.95, r: 0.3 } : { x: GX - 160, y: -1360, z: 0.92, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function doors(c, k) { if (k <= 0) return; const w = 540 * k; c.fillStyle = '#7A828E'; c.fillRect(0, 0, w, HH); c.fillRect(W - w, 0, w, HH); c.fillStyle = '#9AA3B2'; c.fillRect(w - 14, 0, 14, HH); c.fillRect(W - w, 0, 14, HH); }
function drawHook(c, t) { const sh = t < 1.2 ? { x: noise1(t * 40) * 14, y: noise1(t * 37) * 14, r: 0 } : undefined; drawWorld(c, t, 'hook', { x: 0, y: -1150, z: 0.8, r: 0 }, sh); if (Math.floor(t * 6) % 5 === 0 && t < 1.5) { c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(0, 0, W, HH); } Hq.vignette(c, W, HH, 0.32); K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ СКАЗАЛ,', 'ЧТО ОТ НЕГО ПАХНЕТ?'], rows: [['A2', 'Something smells really bad.'], ['B1', "It's a bit stuffy in here."], ['B2', 'No offence, but…'], ['C1', "I'm not sure how to say this, but…"]], cta: ['ОТПРАВЬ ТОМУ, КТО ПОСЛЕ', 'СПОРТЗАЛА НЕ В ДУШ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'worried', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.hw * 0.25, -G.her.h + G.her.hh * 1.25) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.28);
  if (sc.id === 'C2') { const e = sc.ev; doors(c, t < e.close ? 0 : 0.32 * Math.sin(Math.PI * P(t, e.close, e.close + 0.7))); if (t > e.open && t < e.enter - 0.7) { c.fillStyle = `rgba(255,255,230,${0.25 * (1 - P(t, e.open + 0.6, e.enter - 0.7))})`; c.fillRect(0, 0, W, HH); } }
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  K.bubbles(c, t, sc, heads, proj, { names: { gary: ['GARY', '#4CAF6A'], runner: ['MARATHON MAN', '#3C8FE0'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('smell', NF, renderFrame);
