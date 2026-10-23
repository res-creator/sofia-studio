// "The hairdresser ruined my haircut" episode renderer: node haircut.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, items, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/haircut/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const RAF = { ...BASE.tony, headband: null, top: { type: 'tee', col: '#1E1E24' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const G = { her: geom(BASE.her_london), raf: geom(RAF) };
const FY = 60, HERX = -120, RX = 360, PINK = '#FF5FA2', BROWN = '#3A2820';
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function hairStage(t, L) { // 0 long (before), 1 bob, 2 short, 3 pink, 4 mohawk, 5 veil
  if (L === 'hook') return t < 1.4 ? 0 : 1; if (L === 'A1') return t > ev('snip') ? 2 : 1; if (L === 'A2') return t > ev('pink') ? 3 : 2; if (L === 'B1') return t > ev('mohawk') ? 4 : 3; if (L === 'B2') return t > ev('veil') ? 5 : 4; if (L === 'outro') return 4; return 5; }
function herCfg(stage) { const h = { 0: { style: 'long', col: BROWN, len: 2.2 }, 1: { style: 'bob', col: BROWN }, 2: { style: 'short', col: BROWN }, 3: { style: 'short', col: PINK }, 4: { style: 'short', col: PINK }, 5: { style: 'short', col: PINK } }[stage]; return { ...BASE.her_london, hair: h }; }

// ---------------- salon (prerendered)
const BX0 = -1400, BY0 = -2900, BW = 2800, BH = 3600, BS = 0.5;
function drawSalon(c) { c.fillStyle = '#F7DDE6'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.4)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, BY0, 90, BH);
  c.fillStyle = '#FFFFFF'; for (const x of [-1100, 700]) { rr(c, x, -2300, 400, 260, 16); c.fill(); }
  paint(c, q => q.e(-900, -2170, 140, 90), '#2B2F3A', { sd: 2, hd: 1, lw: 2 }); txt(c, 'SALON', 900, -2210, 52, '#C2507A'); txt(c, 'RAFAEL', 900, -2130, 42, '#2B2F3A');
  c.fillStyle = '#E9E4DA'; c.fillRect(BX0, -600, BW, 660); for (let i = 0; i < 5; i++) { paint(c, q => { q.m(700 + i * 90, -720); q.l(760 + i * 90, -720); q.l(756 + i * 90, -600); q.l(704 + i * 90, -600); q.z(); }, ['#E0474C', '#3C8FE0', '#F2C14E', '#4CAF6A', '#C27AE0'][i], { sd: 2, hd: 1, lw: 2 }); }
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#2B2F3A'); fg.addColorStop(1, '#1E2028'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); c.fillStyle = 'rgba(255,255,255,.08)'; for (let x = BX0; x < BX0 + BW; x += 140) for (let y = FY; y < 700; y += 140) if (((x / 140) + (y / 140)) % 2 < 1) c.fillRect(x, y, 140, 140); }
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawSalon(c); }

// ---------------- characters
function salonChair(c) { c.fillStyle = '#2B2F3A'; c.fillRect(HERX - 20, -300, 40, 300); c.fillRect(HERX - 160, FY - 20, 320, 20); paint(c, q => { q.m(HERX - 190, -360); q.l(HERX + 190, -360); q.l(HERX + 190, -300); q.l(HERX - 190, -300); q.z(); }, '#C2507A', { sd: 4, hd: 2, lw: 3 }); paint(c, q => { q.m(HERX - 170, -1100); q.l(HERX + 170, -1100); q.l(HERX + 170, -360); q.l(HERX - 170, -360); q.z(); }, '#C2507A', { sd: 8, hd: 4, lw: 3 }); }
function herState(t, L) { const g = G.her, stg = hairStage(t, L), st = { t, talk: talk('her', t), mood: 'shock', turn: 0, look: 0, legPose: 'sit', drop: 330, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300), legs: false };
  st.afterTorso = cc => { paint(cc, q => { q.m(-g.sw * 0.5, g.ySh + 10); q.l(g.sw * 0.5, g.ySh + 10); q.l(g.sw * 1.8, FY - 330 + 40); q.l(-g.sw * 1.8, FY - 330 + 40); q.z(); }, '#3C3F4A', { sd: 10, hd: 5, lw: 3, inner: k => { k.strokeStyle = 'rgba(255,255,255,.12)'; k.lineWidth = 16; for (let x = -g.sw * 1.8; x < g.sw * 1.8; x += 60) { k.beginPath(); k.moveTo(x * 0.3, g.ySh + 10); k.lineTo(x, FY - 290); k.stroke(); } } }); };
  st.noArms = true;
  if (L === 'hook') st.mood = t < 1.4 ? 'happy' : 'shock'; if (L === 'A1') st.mood = 'shock'; if (L === 'A2') st.mood = t > ev('pink') ? 'shock' : 'angry'; if (L === 'B1') st.mood = 'worried'; if (L === 'B2') st.mood = t > ev('veil') ? 'annoyed' : 'worried'; if (L === 'C1') st.mood = 'angry';
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('clip')) { st.mood = 'shock'; st.headX = -20 + Math.sin(t * 40) * 4; } }
  if (stg === 0) st.front = (cc, gg) => { for (const sd of [-1, 1]) paint(cc, q => { q.m(gg.head.x + sd * g.hw * 0.75, gg.head.y - g.hh * 0.2); q.q(gg.head.x + sd * g.hw * 1.5, gg.head.y + g.hh * 1.5, gg.head.x + sd * g.hw * 1.2, gg.head.y + g.hh * 3.6); q.l(gg.head.x + sd * g.hw * 0.7, gg.head.y + g.hh * 3.4); q.q(gg.head.x + sd * g.hw * 0.95, gg.head.y + g.hh * 1.2, gg.head.x + sd * g.hw * 0.55, gg.head.y + g.hh * 0.1); q.z(); }, BROWN, { sd: 6, hd: 3, lw: 3 }); };
  if (stg >= 4) { const prev = st.front; st.front = (cc, gg) => { const hw = g.hw, hh = g.hh; for (let i = 0; i < 5; i++) { const x = gg.head.x + (i - 2) * hw * 0.22; paint(cc, q => { q.m(x - hw * 0.12, gg.head.y - hh * 0.8); q.l(x, gg.head.y - hh * (1.9 + (i % 2) * 0.25)); q.l(x + hw * 0.12, gg.head.y - hh * 0.8); q.z(); }, PINK, { sd: 3, hd: 2, lw: 3 }); }
    if (stg >= 5) paint(cc, q => { q.m(gg.head.x - hw * 0.5, gg.head.y - hh * 1.9); q.q(gg.head.x - hw * 1.6, gg.head.y - hh * 0.2, gg.head.x - hw * 1.5, gg.head.y + hh * 1.8); q.l(gg.head.x - hw * 1.1, gg.head.y + hh * 1.8); q.q(gg.head.x - hw * 1.1, gg.head.y - hh * 0.3, gg.head.x + hw * 0.3, gg.head.y - hh * 1.9); q.z(); }, '#FFFFFF', { sd: 6, hd: 3, lw: 3 }); if (prev) prev(cc, gg); }; }
  return st; }
function rafState(t, L) { const g = G.raf, st = { t, talk: talk('rafael', t), mood: 'smug', turn: -0.35, look: -0.7, armL: reach(g, -1, -g.sw * 1.4, g.ySh + 120), armR: reach(g, 1, g.sw * 0.5, g.ySh + 300), items: { L: items.scissors(t, null) } };
  const sp = TL.speech.find(s => s.who === 'rafael' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4; st.armR = reach(g, 1, g.sw * 1.5 + Math.sin(u) * 30, g.ySh + 100 + Math.cos(u) * 30); }
  st.front = (cc, gg) => { paint(cc, q => q.e(gg.head.x + 10, gg.head.y - g.hh * 0.85, g.hw * 1.1, g.hh * 0.35), '#E0474C', { sd: 3, hd: 2, lw: 3 }); cc.fillStyle = '#E0474C'; cc.fillRect(gg.head.x + 4, gg.head.y - g.hh * 1.25, 12, 24); cc.fillStyle = '#2A1A10'; cc.beginPath(); cc.moveTo(gg.head.x - 50, gg.head.y + g.hh * 0.32); cc.quadraticCurveTo(gg.head.x, gg.head.y + g.hh * 0.2, gg.head.x + 50, gg.head.y + g.hh * 0.32); cc.quadraticCurveTo(gg.head.x + 70, gg.head.y + g.hh * 0.1, gg.head.x + 64, gg.head.y + g.hh * 0.04); cc.lineTo(gg.head.x, gg.head.y + g.hh * 0.24); cc.lineTo(gg.head.x - 64, gg.head.y + g.hh * 0.04); cc.quadraticCurveTo(gg.head.x - 70, gg.head.y + g.hh * 0.1, gg.head.x - 50, gg.head.y + g.hh * 0.32); cc.fill(); };
  const busy = (k, d = 0.8) => t > ev(k) - d && t < ev(k) + 0.2;
  if ((L === 'A1' && busy('snip')) || (L === 'B1' && busy('mohawk', 1.0))) { st.armL = reach(g, -1, -g.sw * 2.4, g.ySh - 60 + Math.sin(t * 30) * 30); st.items = { L: items.scissors(t, null) }; }
  if (L === 'A2' && busy('pink', 0.6)) { st.armL = reach(g, -1, -g.sw * 2.4, g.ySh - 100); st.items = { L: ctx => { paint(ctx, q => { q.m(-22, -110); q.l(22, -110); q.l(22, 0); q.l(-22, 0); q.z(); }, PINK, { sd: 2, hd: 1, lw: 3 }); } }; }
  if (L === 'C1' && t > SP.c1_x.t) { st.mood = 'sad'; st.armR = reach(g, 1, g.sw * 0.2, g.ySh + 100); if (t > ev('cert')) { st.armL = reach(g, -1, -g.sw * 2.2, g.ySh + 120); st.items = { L: ctx => { ctx.fillStyle = '#C9A06A'; ctx.fillRect(-80, -150, 160, 130); ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-66, -136, 132, 102); ctx.fillStyle = PINK; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-30 + i * 15, -70); ctx.lineTo(-24 + i * 15, -120); ctx.lineTo(-18 + i * 15, -70); ctx.fill(); } ctx.fillStyle = '#2B2F3A'; ctx.font = '13px Unb9'; ctx.textAlign = 'center'; ctx.fillText('CERTIFICATE', 0, -46); ctx.fillText('OF ART', 0, -30); } }; } }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'sad' : 'smug'; if (t > ev('clip') - 0.2) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 160); st.items = { L: items.clippers(t) }; st.mood = 'happy'; } }
  return st; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {};
  heads.rafael = put(c, RAF, rafState(t, L), RX, FY);
  salonChair(c);
  heads.her = put(c, herCfg(hairStage(t, L)), herState(t, L), HERX, FY);
  if (L === 'A1' && t > ev('snip') - 0.2 && t < ev('snip') + 1.0) { c.fillStyle = BROWN; for (let i = 0; i < 12; i++) { const k = P(t, ev('snip'), ev('snip') + 1.0); c.globalAlpha = 1 - k; c.fillRect(HERX - 200 + hash(i) * 400, -1300 + k * 900 + hash(i * 3) * 100, 6, 26); } c.globalAlpha = 1; }
  if (L === 'A2' && t > ev('pink') - 0.1 && t < ev('pink') + 0.8) { const k = P(t, ev('pink'), ev('pink') + 0.8); c.fillStyle = `rgba(255,95,162,${0.6 * (1 - k)})`; c.beginPath(); c.arc(HERX, -1350, 200 + 200 * k, 0, TAU); c.fill(); }
  return heads;
}
function mirrorFrame(c) { c.save(); c.strokeStyle = '#C9A040'; c.lineWidth = 34; rr(c, 22, 22, W - 44, HH - 44, 60); c.stroke(); c.strokeStyle = '#8A6A20'; c.lineWidth = 6; rr(c, 44, 44, W - 88, HH - 88, 44); c.stroke(); c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(80, 1200); c.lineTo(400, 300); c.lineTo(460, 300); c.lineTo(140, 1200); c.fill(); c.restore(); }
function stickyNote(c, t, big = 0) { c.save(); c.translate(lerp(890, 540, big), lerp(470, 980, big)); c.rotate(0.08 * (1 - big)); const s = 1 + big * 1.6; c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-100 + 6, -70 + 8, 200, 140); c.fillStyle = '#F7E36A'; c.fillRect(-100, -70, 200, 140); txt(c, 'JUST', 0, -32, 30, '#2B2F3A'); txt(c, 'THE ENDS', 0, 4, 30, '#2B2F3A'); txt(c, 'please :)', 0, 40, 22, '#6A707A', 'Nun9'); c.restore(); }
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 100, y: -1100, z: 0.82, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.78, cut: u < 0.85 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 120, y: -1500, z: 0.9, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 120, y: -1250, z: 1.0, r: 0 } : { x: RX - 150, y: -1350, z: 0.95, r: -0.2 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { const sp = 1 - eIO(P(t, 1.2, 1.6)); drawWorld(c, t, 'hook', { x: 100, y: -1100, z: 0.82, r: 0 }); if (t < 2.4) { const lab = t < 1.4 ? 'BEFORE' : 'AFTER'; c.save(); c.translate(540, 1500); c.rotate(-0.06); UI.font(c, 'Unb9', 90); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, lab, 0, 0, t < 1.4 ? C.white : C.gold, C.oliveD, 16); c.restore(); }
  if (t > 1.4 && t < 1.55) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(0, 0, W, HH); } Hq.vignette(c, W, HH, 0.3); mirrorFrame(c); stickyNote(c, t); K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЕБЕ', 'ПОРТИЛИ СТРИЖКУ?'], rows: [['A2', "I didn't ask for this!"], ['B1', "This isn't quite what I had in mind."], ['B2', 'Could you fix it, please?'], ['C1', "I'd like a refund, please."]], cta: ['ОТПРАВЬ ТОМУ, КОМУ', 'ИСПОРТИЛИ СТРИЖКУ'], hero: (cc, tt) => put(cc, herCfg(4), { t: tt, mood: 'annoyed', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 0.6, G.her.ySh + 300), front: (k, gg) => { for (let i = 0; i < 5; i++) { const x = gg.head.x + (i - 2) * G.her.hw * 0.22; paint(k, q => { q.m(x - G.her.hw * 0.12, gg.head.y - G.her.hh * 0.8); q.l(x, gg.head.y - G.her.hh * (1.9 + (i % 2) * 0.25)); q.l(x + G.her.hw * 0.12, gg.head.y - G.her.hh * 0.8); q.z(); }, PINK, { sd: 3, hd: 2, lw: 3 }); } } }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26); mirrorFrame(c);
  const big = sc.id === 'C2' && SP.c2_x2 ? eIO(P(t, SP.c2_x2.t + 0.2, SP.c2_x2.t + 0.7)) * (1 - P(t, SP.c2_nar.t + 0.8, SP.c2_nar.t + 1.2)) : 0; stickyNote(c, t, big);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  K.bubbles(c, t, sc, heads, proj, { names: { rafael: ['RAFAEL', '#C2507A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('haircut', NF, renderFrame);
