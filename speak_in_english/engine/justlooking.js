// "How to say 'I'm just looking'" episode renderer (hard_cut camera): node justlooking.js start end out.mp4 | --png=f1,f2
// Clothes boutique: Anna browses a rack, the shop assistant follows right behind her shoulder.
// Shots tagged 'ui:black' replace the world with a black card before the C2 narrator.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/justlooking/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_market };
const MAN = { ...BASE.tom, top: { type: 'polo', col: '#3C8FE0', col2: '#FFFFFF', text: 'STYLE\nSHOP', textSize: 34, textCol: '#FFFFFF' } };
const G = { her: geom(HER), clerk: geom(MAN) };
const HX = -420, MX0 = 20;                                  // her / clerk feet x (he stands right behind her shoulder)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const pileItem = n => ctx => { const cols = ['#EE5E9A', '#3FB6A8', '#F2C14E', '#7FB0D8', '#B9A2E6', '#E0474C', '#7CC45A', '#E9A23B']; for (let k = 0; k < n; k++) { ctx.save(); ctx.translate(Math.sin(k * 2.1) * 14, -40 - k * 46); ctx.rotate(Math.sin(k * 1.7) * 0.08); ctx.fillStyle = cols[k % 8]; rr(ctx, -110, -26, 220, 52, 14); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); } };
const tagItem = ctx => { ctx.save(); ctx.rotate(-0.15); ctx.fillStyle = '#E0474C'; rr(ctx, -80, -120, 160, 110, 14); ctx.fill(); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 6; ctx.stroke(); fitTxt(ctx, '30%', 0, -78, 56, '#FFFFFF', 130); fitTxt(ctx, 'OFF', 0, -36, 30, '#FFE15A', 100); ctx.restore(); };
const cardItem = ctx => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#FFFDF8'; rr(ctx, -80, -110, 160, 100, 8); ctx.fill(); ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 5; ctx.stroke(); fitTxt(ctx, 'PITCH', 0, -78, 34, '#E0474C', 130); ctx.fillStyle = '#8A8A8A'; for (let k = 0; k < 3; k++) ctx.fillRect(-56, -54 + k * 14, 112 - k * 18, 6); ctx.restore(); };

// ---------------- boutique (prerendered, softly blurred); the TV on the shelf is drawn live
const BX0 = -2400, BY0 = -3400, BW = 4800, BH = 4800, BS = 0.5;
function drawShop(c) {
  c.fillStyle = '#EFE3D0'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#E7D4BA'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, -2900, 150, 2650);
  c.fillStyle = '#B98B5E'; c.fillRect(BX0, -260, BW, 1700); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 330) { c.beginPath(); c.moveTo(x, -260); c.lineTo(x - 160, 1400); c.stroke(); }
  // big sale sign + window
  c.fillStyle = '#E0474C'; rr(c, -700, -2750, 1200, 330, 30); c.fill(); fitTxt(c, 'SALE', -100, -2585, 240, '#FFFDF8', 1000);
  c.fillStyle = '#C9E3F2'; rr(c, 1100, -2800, 900, 700, 20); c.fill(); c.strokeStyle = '#6A4A30'; c.lineWidth = 16; c.stroke();
  // clothes racks (bar + hangers with garments)
  const rack = (x, y, w, cols) => { c.fillStyle = '#6A6A74'; c.fillRect(x - 12, y, 24, 1100); c.fillRect(x + w - 12, y, 24, 1100); c.fillStyle = '#8C8C98'; c.fillRect(x - 10, y - 14, w + 20, 28); for (let k = 0; k < Math.floor(w / 90); k++) { const gx = x + 50 + k * 90; c.fillStyle = cols[k % cols.length]; rr(c, gx - 36, y + 20, 72, 420 - (k % 3) * 40, 22); c.fill(); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 4; c.stroke(); } };
  rack(-1900, -1400, 760, ['#EE5E9A', '#3FB6A8', '#F2C14E', '#7FB0D8']); rack(-900, -1400, 640, ['#B9A2E6', '#E0474C', '#7CC45A']); rack(500, -1300, 700, ['#E9A23B', '#3C8FE0', '#EE5E9A', '#F2C14E']);
  // mannequin
  c.fillStyle = '#D9C7A8'; c.beginPath(); c.arc(1750, -1500, 70, 0, TAU); c.fill(); c.fillStyle = '#3FB6A8'; rr(c, 1660, -1430, 180, 420, 40); c.fill(); c.fillStyle = '#6A6A74'; c.fillRect(1742, -1010, 16, 800); c.fillRect(1640, -216, 220, 20);
  // shelf for the TV
  c.fillStyle = '#6A4A30'; rr(c, 150, -1760, 700, 40, 8); c.fill();
  // counter with register and bell
  c.fillStyle = '#6A4A30'; rr(c, 1000, -700, 1300, 700, 18); c.fill(); c.fillStyle = '#8A6240'; rr(c, 1000, -740, 1300, 60, 14); c.fill();
  c.fillStyle = '#2B2F3A'; rr(c, 1700, -940, 360, 210, 18); c.fill(); c.fillStyle = '#9CE8B4'; rr(c, 1730, -910, 300, 110, 10); c.fill();
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(1200, -760, 56, Math.PI, 0); c.fill(); c.fillStyle = '#2B2F3A'; c.fillRect(1140, -764, 120, 22);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawShop);
function tvSet(c, t) { const on = t > ev('A2', 'tv'); const k = on ? eBack(P(t, ev('A2', 'tv'), ev('A2', 'tv') + 0.3), 2) : 1; c.save(); c.translate(500, -1760); c.scale(k, k);
  c.fillStyle = '#2B2F3A'; rr(c, -250, -330, 500, 330, 24); c.fill(); c.fillStyle = on ? '#9CE8B4' : '#171A24'; rr(c, -225, -305, 450, 280, 14); c.fill();
  if (on) { c.save(); c.beginPath(); rr(c, -225, -305, 450, 280, 14); c.clip(); c.fillStyle = '#3FA04A'; c.fillRect(-225, -190, 450, 165); c.fillStyle = '#FFFDF8'; c.fillRect(-4, -190, 8, 165); c.beginPath(); c.arc(0, -108, 46, 0, TAU); c.lineWidth = 6; c.strokeStyle = '#FFFDF8'; c.stroke(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(Math.sin(t * 5) * 140, -108 + Math.cos(t * 6) * 40, 14, 0, TAU); c.fill(); c.restore(); }
  c.restore(); }
function saleTag(c, t) { const a = ev('B2', 'sale'); if (t < a) return; const k = eBack(P(t, a, a + 0.3), 2.2), sw = Math.sin((t - a) * 5) * 0.12; c.save(); c.translate(-560, -1330); c.rotate(sw); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -110 + 8, 8, 220, 160, 20); c.fill(); c.fillStyle = '#E0474C'; rr(c, -110, 0, 220, 160, 20); c.fill(); c.strokeStyle = '#FFFDF8'; c.lineWidth = 8; c.stroke(); fitTxt(c, '30%', 0, 62, 100, '#FFFFFF', 190); fitTxt(c, 'OFF', 0, 124, 52, '#FFE15A', 150); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -60); c.stroke(); c.restore(); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const clerkX = t => { const a = ev('B1', 'back'); if (t < a) return MX0; const u = t - a; return u < 0.35 ? lerp(MX0, 1300, eIn(u / 0.35)) : u < 0.6 ? 1300 : lerp(1300, MX0, eOut(clamp((u - 0.6) / 0.3))); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'bored', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'neutral'; st.turn = -0.2; if (t > hev('panic') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 20, { planar: true }); } if (t > e('pile') - 0.1) { st.mood = 'surprised'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 250); st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 250); st.items = { L: pileItem(Math.min(8, 2 + Math.floor((t - e('pile')) * 8))) }; } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'neutral'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 40, { planar: true }); } if (t > e('tv') - 0.1) { st.mood = 'skeptical'; st.blink = 0; st.armR = hang(g, 1); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 2.1, g.ySh - 40, { planar: true }); } if (t > e('back') + 0.9) { st.mood = 'annoyed'; st.blink = 0; } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 150); } if (t > e('sale') - 0.05) { st.mood = 'surprised'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'worried'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (t > e('stare') - 0.05) { st.mood = 'annoyed'; st.blink = 0; st.armL = hang(g, -1); } }
  if (L === 'C2') { st.mood = 'angry'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > e('insp') - 0.05) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('c2_h2', t, 0.05, 0.6)) { st.mood = 'bored'; st.blink = 0; } }
  return st; }
function clerkState(t, L) { const g = G.clerk, e = k => ev(L, k), st = { t, talk: talk('clerk', t), mood: 'happy', turn: -0.45, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0 };
  if (L === 'hook') { st.mood = 'happy'; if (t > hev('panic') - 0.05) { st.mood = 'smug'; st.laugh = false; } gest(st, g, 'clerk', t, -1, 150); }
  if (L === 'A1') { st.mood = 'surprised'; if (speaking('a1_c', t, 0.05, 0.6) || t > e('pile')) { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.8, g.ySh + 20 + Math.sin(t * 14) * 50, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 60 + Math.cos(t * 14) * 50, { planar: true }); } }
  if (L === 'A2') { st.mood = 'neutral'; if (speaking('a2_c', t, 0.05, 0.3)) st.mood = 'worried'; if (t > e('tv') - 0.3) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 40, { planar: true }); } }
  if (L === 'B1') { st.mood = 'happy'; const dx = clerkX(t) - MX0; if (dx > 1) st.mood = 'neutral'; if (t > e('back') + 0.9) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 20, { planar: true }); } }
  if (L === 'B2') { st.mood = 'happy'; if (speaking('b2_c', t, 0.05, 0.3) || t > e('sale')) { st.mood = 'happy'; st.laugh = true; } if (t > e('sale') - 0.1) { st.items = { R: tagItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh - 40); } }
  if (L === 'C1') { st.mood = 'neutral'; if (t > e('card') - 0.2) { st.items = { L: cardItem }; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 20); st.mood = 'sad'; } if (speaking('c1_c', t, 0.05, 0.4)) st.mood = 'sad'; }
  if (L === 'C2') { st.mood = 'neutral'; if (t > ev('C2', 'think') - 0.05) { st.mood = 'neutral'; st.blink = 0; }
    if (speaking('c2_c', t, 0.05, 0.1)) { st.mood = 'worried'; st.lookY = 0.2; }
    if (t > e('insp') - 0.05) { st.mood = 'worried'; st.armR = reach(g, 1, g.sw * 1.3, g.ySh - 120, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 120, { planar: true }); }
    if (speaking('c2_c2', t, 0.05, 0.2)) st.mood = 'shock'; }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'clerk'], card: ['her', 'clerk'], two: ['her', 'clerk'], her: ['her'], clerk: ['clerk'], cover: ['her', 'clerk'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH); tvSet(c, t); saleTag(c, t);
  if (who.includes('clerk')) heads.clerk = K.put(c, MAN, clerkState(t, L), clerkX(t), 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (!heads.clerk) heads.clerk = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, mHY = G.clerk.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(-200, fy((hHY + mHY) / 2, 0.75, 1120), 0.75, 'cover'), WIDE: S(-80, -1000, 0.5, 'wide'), CARD: S(-200, fy(mHY, 0.66, 980), 0.66, 'card'), TWO: S(-200, fy(mHY, 0.75, 820), 0.75, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'), HER_H: S(HX + 40, fy(hHY, 1.35, 1280), 1.35, 'her'),
  MAN: S(MX0 - 30, fy(mHY, 1.0), 1.0, 'clerk'), MAN_H: S(MX0 - 30, fy(mHY, 1.0, 1230), 1.0, 'clerk'), MAN_CU: S(MX0 - 30, fy(mHY, 1.6, 960), 1.6, 'clerk'),
  BLACK: U('black', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_c.t - 0.12) return SH.COVER; if (t < hev('panic') - 0.05) return f(SH.MAN_H); if (t < SP.hook.t - 0.1) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('pile') - 0.05) return f(SH.WIDE);
  if (L === 'A2' && t > e('tv') - 0.05) return f(SH.WIDE);
  if (L === 'B1' && t > e('back') - 0.05 && t < SP.b1_c2.t - 0.1) return f(SH.WIDE);
  if (L === 'B2' && t > e('sale') - 0.05) return f(SH.WIDE);
  if (L === 'C1' && t > e('card') - 0.05 && !sp('c1_c')) return f(SH.WIDE);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU, SH.HER][i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.9) return f(SH.WIDE); if (t >= e('think') + 0.9 && t < SP.c2_c.t - 0.1) return f(SH.MAN_CU);
    if (sp('c2_h2')) return f(SH.HER_CU); if (sp('c2_c2')) return f(SH.MAN_CU); if (sp('c2_c')) return f(SH.MAN); if (t > SP.c2_c.t && t < SP.c2_c2.t - 0.1) return f(SH.WIDE); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.MAN;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen black card (before the C2 narrator)
function caption(c, s, k = 1, y = 1530, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, "I'M JUST LOOKING!", 0, 4, 52, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ СКАЗАЛ', 'КОНСУЛЬТАНТУ?'], rows: [['A2', "I'm just looking, thanks."], ['B1', "I'll let you know if I need help."], ['B2', "I'm just browsing, thanks."], ['C1', "I'd prefer to look around on my own."]], cta: ['ОТПРАВЬ ТОМУ,', 'КТО ХОДИТ ПО ПЯТАМ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gm = G.clerk; K.put(cc, MAN, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gm, -1, -gm.sw * 2.0, gm.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gm, 1), items: { R: tagItem } }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { clerk: ['STAFF', '#3C8FE0'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_c: 0.05, hook_h: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('pile') && t < narT - 0.1) K.pop(c, t, 'ГОРА ОДЕЖДЫ!', e('pile') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 84);
  if (L === 'A2' && t > e('tv') && t < narT - 0.1) K.pop(c, t, 'СМОТРЕТЬ ТВ?!', e('tv') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 70);
  if (L === 'B1' && t > e('back') + 0.5 && t < narT - 0.1) K.pop(c, t, 'ОПЯТЬ ОН!', e('back') + 0.55, narT - 0.2, 540, 1330, C.gold, -0.06, 84);
  if (L === 'B2' && t > e('sale') && t < narT - 0.1) K.pop(c, t, 'СКИДКА 30%!', e('sale') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 84);
  if (L === 'C1' && t > e('card') && t < SP.c1_nar.t - 0.1 && !speaking('c1_c', t, 0, 0)) K.pop(c, t, 'ОН РЕПЕТИРОВАЛ!', e('card') + 0.05, SP.c1_nar.t - 0.2, 540, 1330, C.gold, -0.06, 78);
  if (L === 'C1' && t > e('stare') && t < narT - 0.05) K.dots(c, t, e('stare') + 0.05, narT - 0.05, 1450);
  if (L === 'C2' && t > e('think') && t < SP.c2_c.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_c.t - 0.05, 1450);
  if (L === 'C2' && t > e('insp') && t < SP.c2_c2.t - 0.05) K.pop(c, t, 'ЭТО ИНСПЕКТОР?!', e('insp') + 0.1, SP.c2_c2.t - 0.1, 540, 1330, C.gold, -0.06, 70);
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_c: 0.4, b1_h: 0.05, b1_c: 0.05, b1_c2: 0.4, b2_c: 0.4, c1_c: 0.4, c2_c: 0.3, c2_c2: 0.5, c2_h2: 0.6 } });
  K.hud(c, t, sc);
}
E.run('justlooking', NF, renderFrame);
