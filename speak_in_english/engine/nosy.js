// "Mind your own business" (nosy colleague) episode renderer: node nosy.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/nosy/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london, top: { type: 'blazer', col: '#3C8FE0', shirt: '#FFFFFF', tie: '#FFFFFF' } };
const GLO = { ...BASE.rita, hair: { style: 'curly', col: '#B8302E' }, glasses: { col: '#2B2F3A', shape: 'cat' }, top: { type: 'cardigan', col: '#F2C14E', col2: '#FFFFFF' }, bottom: { type: 'skirt', col: '#5A4A6A' } };
const SEAT = 330, G = { her: geom(HER, SEAT), glo: geom(GLO, SEAT), gloS: geom(GLO) };
const FY = 60, HERX = -330, PART = 140, GX0 = 420, GNEAR = 60, GFAR = 1150, TOP = -470, WIN = { x: 560, y: -2150, w: 520, h: 640 };
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- open-plan office (prerendered)
const BX0 = -1600, BY0 = -3000, BW = 3600, BH = 3700, BS = 0.5;
function drawOffice(c) { c.fillStyle = '#EDE7DD'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = '#D9CFC0'; c.fillRect(BX0, -700, BW, 760);
  c.fillStyle = '#FFFFFF'; c.fillRect(WIN.x - 20, WIN.y - 20, WIN.w + 40, WIN.h + 40); c.fillStyle = '#A9D0EC'; c.fillRect(WIN.x, WIN.y, WIN.w, WIN.h); c.fillStyle = '#C9DCE8'; for (let i = 0; i < 4; i++) c.fillRect(WIN.x + 30 + i * 125, WIN.y + 260 - i * 40, 90, WIN.h - 260 + i * 40); c.fillStyle = '#FFFFFF'; c.fillRect(WIN.x + WIN.w / 2 - 8, WIN.y, 16, WIN.h); c.fillStyle = '#C9CED6'; c.fillRect(WIN.x - 40, WIN.y + WIN.h, WIN.w + 80, 30);
  c.fillStyle = '#FFFFFF'; rr(c, -1200, -2100, 600, 300, 16); c.fill(); txt(c, 'RESPECT', -900, -2000, 60, '#C2507A'); txt(c, 'each other', -900, -1910, 40, '#6A707A', 'Nun9');
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#9A8A7A'); fg.addColorStop(1, '#7A6A5A'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); }
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawOffice(c); }

// ---------------- props
function pigeon(c, t, bino) { c.save(); c.translate(WIN.x + WIN.w - 130, WIN.y + WIN.h - 2); c.scale(1.5, 1.5); paint(c, q => q.e(0, -60, 70, 52), '#8A93A2', { sd: 4, hd: 2, lw: 3 }); paint(c, q => q.e(-58, -110 + Math.sin(t * 2) * 4, 34, 32), '#9AA3B2', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#F2A03B'; c.beginPath(); c.moveTo(-90, -108); c.lineTo(-112, -100); c.lineTo(-90, -96); c.fill();
  if (bino) { c.save(); c.translate(-80, -112); c.scale(0.55, 0.55); binoItem(c); c.restore(); } else { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-66, -116, 6, 0, TAU); c.fill(); } c.restore(); }
function desk(c, x0, x1, top, monitor) { paint(c, q => { q.m(x0, top); q.l(x1, top); q.l(x1, FY); q.l(x0, FY); q.z(); }, '#E9E4DA', { sd: 6, hd: 3, lw: 3, inner: k => { k.fillStyle = 'rgba(0,0,0,.06)'; k.fillRect(x0, top + 30, x1 - x0, 10); } }); paint(c, q => { q.m(x0 - 20, top - 26); q.l(x1 + 20, top - 26); q.l(x1 + 20, top); q.l(x0 - 20, top); q.z(); }, '#C9A06A', { sd: 3, hd: 2, lw: 3 });
  if (monitor) { const x = monitor; c.fillStyle = '#2B2F3A'; rr(c, x - 110, top - 230, 220, 150, 10); c.fill(); c.fillStyle = '#9FD8F2'; rr(c, x - 98, top - 218, 196, 126, 6); c.fill(); c.fillStyle = '#2B2F3A'; c.fillRect(x - 8, top - 80, 16, 56); } }
function partition(c) { paint(c, q => { q.m(PART, -1120); q.l(PART + 640, -1120); q.l(PART + 640, FY); q.l(PART, FY); q.z(); }, '#6A8AA8', { sd: 8, hd: 4, lw: 3, inner: k => { k.fillStyle = 'rgba(255,255,255,.10)'; for (let x = PART + 20; x < PART + 640; x += 40) k.fillRect(x, -1100, 4, 1160); } }); paint(c, q => { q.m(PART - 10, -1140); q.l(PART + 650, -1140); q.l(PART + 650, -1110); q.l(PART - 10, -1110); q.z(); }, '#9AA3B2', { sd: 2, hd: 1, lw: 3 }); }
function chair(c, x) { c.fillStyle = '#2B2F3A'; c.fillRect(x - 14, -300, 28, 300); for (const d of [-1, 1]) { c.fillRect(x + d * 10 - 70 * (d < 0), FY - 30, 70, 14); c.beginPath(); c.arc(x + d * 80, FY - 10, 14, 0, TAU); c.fill(); } paint(c, q => { q.m(x - 170, -360); q.l(x + 170, -360); q.l(x + 170, -300); q.l(x - 170, -300); q.z(); }, '#3A3F4A', { sd: 3, hd: 2, lw: 3 }); }
const phoneItem = ctx => { ctx.rotate(0); ctx.fillStyle = '#2B2F3A'; rr(ctx, -30, -110, 60, 110, 10); ctx.fill(); ctx.fillStyle = '#9FD8F2'; rr(ctx, -24, -102, 48, 90, 6); ctx.fill(); };
const binoItem = ctx => { ctx.rotate(0); for (const d of [-1, 1]) { paint(ctx, q => { q.m(d * 34 - 22, -40); q.l(d * 34 + 22, -40); q.l(d * 34 + 26, 40); q.l(d * 34 - 26, 40); q.z(); }, '#2B2F3A', { sd: 2, hd: 1, lw: 3 }); ctx.fillStyle = '#9FD8F2'; ctx.beginPath(); ctx.arc(d * 34, 40, 18, 0, TAU); ctx.fill(); } ctx.fillStyle = '#2B2F3A'; ctx.fillRect(-14, -20, 28, 20); };
const mirrorItem = ctx => { ctx.rotate(0); ctx.fillStyle = '#C2507A'; ctx.beginPath(); ctx.arc(0, -50, 46, 0, TAU); ctx.fill(); ctx.fillStyle = '#DDEEF8'; ctx.beginPath(); ctx.arc(0, -50, 36, 0, TAU); ctx.fill(); ctx.fillStyle = '#3A2820'; ctx.beginPath(); ctx.arc(0, -56, 16, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#F6D2B6'; ctx.beginPath(); ctx.arc(0, -50, 12, 0, TAU); ctx.fill(); };
function phoneCard(c, t) { const k = eBack(P(t, ev('call'), ev('call') + 0.3), 1.8) * (1 - P(t, SP.b2_nar.t + 2.2, SP.b2_nar.t + 2.5)); if (k <= 0) return; K.phone(c, 790, 1200, 0.6 * k, (cc, w, h) => { cc.fillStyle = '#2B2F3A'; cc.fillRect(0, 0, w, h); cc.fillStyle = '#4CAF6A'; cc.beginPath(); cc.arc(w / 2, 260, 110, 0, TAU); cc.fill(); cc.fillStyle = '#FFFFFF'; cc.beginPath(); cc.arc(w / 2, 240, 40, 0, TAU); cc.fill(); cc.fillRect(w / 2 - 60, 290, 120, 50); cc.font = '52px Unb9'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText('HER MUM', w / 2, 460); cc.font = '34px Nun9'; cc.fillStyle = '#9FD8F2'; cc.fillText('calling' + '.'.repeat(1 + Math.floor(t * 3) % 3), w / 2, 530); cc.fillStyle = '#E0474C'; cc.beginPath(); cc.arc(w / 2, 650, 50, 0, TAU); cc.fill(); }, 0.06); }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
// Gloria: 'peek' = standing behind the partition, otherwise on her rolling chair at x
function gloPlace(t, L) { if (L === 'hook' || (L === 'A1' && t < ev('roll'))) return { mode: 'peek', x: GX0 }; if (L === 'A1') return { mode: 'chair', x: lerp(GX0 + 300, GNEAR, eOut(P(t, ev('roll'), ev('roll') + 0.6))) };
  if (L === 'C1' && t > ev('away')) return { mode: 'chair', x: lerp(GNEAR, GFAR, eIO(P(t, ev('away'), ev('away') + 1.0))) }; if (L === 'C2' || L === 'outro') return { mode: 'chair', x: GFAR }; return { mode: 'chair', x: GNEAR }; }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.2, look: 0.3, lookY: 0.6, legPose: 'sit', drop: SEAT, legs: false, armL: reach(g, -1, -g.sw * 0.3, g.ySh + 200), armR: reach(g, 1, g.sw * 0.4, g.ySh + 200), items: { R: phoneItem } };
  if (TL.speech.some(s => s.who === 'her' && t >= s.t - 0.2 && t < s.t + s.d + 0.4)) { st.lookY = 0; st.turn = 0.4; st.look = 0.9; } gest(st, g, 'her', t, -1, 120);
  if (L === 'hook') { st.mood = t > 1.4 ? 'shock' : 'happy'; if (t > 1.4) { st.lookY = -0.4; st.look = 0.8; } }
  if (L === 'A1') st.mood = t > ev('roll') ? 'annoyed' : 'shock';
  if (L === 'A2') st.mood = t > ev('spin') ? 'tired' : 'annoyed';
  if (L === 'B1') st.mood = t > ev('mirror') ? 'skeptical' : 'neutral';
  if (L === 'B2') st.mood = t > ev('call') ? 'shock' : 'neutral';
  if (L === 'C1') st.mood = t > ev('away') + 0.6 ? 'happy' : 'neutral';
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('bino')) { st.mood = 'skeptical'; st.turn = 0.5; st.look = 1; st.lookY = 0; } if (t > ev('bird')) { st.mood = 'shock'; st.look = 0.6; st.lookY = -0.5; } }
  return st; }
function gloState(t, L, pl) { const peek = pl.mode === 'peek', g = peek ? G.gloS : G.glo; const st = { t, talk: talk('gloria', t), mood: 'happy', turn: -0.4, look: -0.9, armL: reach(g, -1, -g.sw * 0.8, g.ySh + 200), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300) };
  if (!peek) { st.legPose = 'sit'; st.drop = SEAT; st.legs = false; }
  gest(st, g, 'gloria', t, -1, 120);
  if (peek) { st.mood = 'smug'; st.headY = L === 'hook' ? lerp(420, 0, eOut(P(t, 0.4, 1.4))) : 0; st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 30); st.armR = reach(g, 1, -g.sw * 0.3, g.ySh + 30); st.lookY = 0.3; }
  if (L === 'A2' && t > ev('spin') - 0.1 && t < ev('spin') + 1.4) { const u = P(t, ev('spin') - 0.1, ev('spin') + 1.4); st.turn = Math.sin(u * TAU * 2) * 0.8; st.look = st.turn * 1.5; st.mood = 'happy'; st.squint = true; }
  if (L === 'B1' && t > ev('mirror') - 0.4 && t < SP.b1_nar.t + 2) { st.turn = 0.5; st.look = 0.4; st.armR = reach(g, 1, g.sw * 1.2, g.ySh - 120); st.items = { R: mirrorItem }; st.mood = 'smug'; }
  if (L === 'B2' && t > ev('call') - 0.4) { st.armR = reach(g, 1, g.sw * 0.6, g.ySh - 90); st.items = { R: phoneItem }; st.mood = 'smug'; }
  if (L === 'C1' && t > SP.c1_x.t) st.mood = 'neutral';
  if (L === 'C2') { st.mood = 'neutral'; st.turn = -0.3; if (t > ev('bino') - 0.2) { st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 60); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 60); st.mood = 'smug'; } }
  return st; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  pigeon(c, t, L === 'C2' && t > ev('bird'));
  const heads = {}, pl = gloPlace(t, L);
  desk(c, 300, 820, TOP, 640);
  if (pl.mode === 'peek') heads.gloria = put(c, GLO, gloState(t, L, pl), pl.x, FY);
  partition(c);
  desk(c, GFAR - 260, GFAR + 340, TOP, GFAR + 200);
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  desk(c, -760, 60, TOP, -560);
  if (pl.mode === 'chair') { chair(c, pl.x); heads.gloria = put(c, GLO, gloState(t, L, pl), pl.x, FY); }
  if (L === 'C2' && t > ev('bino')) { const hd = heads.gloria, k = eOut(P(t, ev('bino'), ev('bino') + 0.4)); c.save(); c.translate(hd.x - 20, hd.y + hd.hh * 0.1 + (1 - k) * 300); c.rotate(Math.PI); c.scale(1.6, 1.6); binoItem(c); c.restore(); }
  if (L === 'A1' && t > ev('roll') && t < ev('roll') + 0.7) { c.strokeStyle = 'rgba(43,47,58,.5)'; c.lineWidth = 8; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(GNEAR + 250 + i * 50, -500 + i * 120); c.lineTo(GNEAR + 420 + i * 50, -500 + i * 120); c.stroke(); } }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: -100, y: -900, z: 0.8, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.76, cut: u < 0.85 };
  const wide = { x: 420, y: -1000, z: 0.6, r: 0 };
  if (L === 'C1' && t > ev('away') - 0.1) return wide;
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 180, y: -1050, z: 0.95, r: 0 };
  if (L === 'C2' && t > ev('bird') - 0.1 && t < SP.c2_nar.t + SP.c2_nar.d) return { x: WIN.x + WIN.w - 200, y: WIN.y + WIN.h - 250, z: 1.2, r: 0 };
  if (L === 'C2') return wide;
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 200, y: -950, z: 1.05, r: 0.3 } : { x: GNEAR - 200, y: -950, z: 1.05, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { drawWorld(c, t, 'hook', { x: -20, y: -950, z: 0.8, r: 0 }); Hq.vignette(c, W, HH, 0.3);
  if (t > 1.5) { const kk = eBack(P(t, 1.5, 1.8), 2); c.save(); c.translate(540, 1500); c.rotate(-0.05); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -400 + 8, -60 + 10, 800, 120, 20); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -400, -60, 800, 120, 20); c.fill(); UI.textFit(c, 'Unb9', 56, 'ОНА ВСЕГДА РЯДОМ', 720); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ОНА ВСЕГДА РЯДОМ', 0, 4); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А У ТЕБЯ ЕСТЬ', 'ТАКАЯ ГЛОРИЯ?'], rows: [['A2', "It's none of your business."], ['B1', "I'd like a bit of privacy."], ['B2', "I'd rather keep it private."], ['C1', 'Respect my boundaries.']], cta: ['ОТПРАВЬ', 'СВОЕЙ ГЛОРИИ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(geom(HER), -1, -G.her.sw * 0.6, geom(HER).ySh + 300), armR: reach(geom(HER), 1, G.her.sw * 0.6, geom(HER).ySh + 300) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  if (sc.id === 'B2') phoneCard(c, t);
  K.bubbles(c, t, sc, heads, proj, { names: { gloria: ['GLORIA', '#B8302E'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('nosy', NF, renderFrame);
