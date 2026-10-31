// "Passport control: purpose of your visit" episode renderer (hard_cut camera): node passport.js start end out.mp4 | --png=f1,f2
// Coffee shop (togo layout): Anna in front of the counter on the left, the officer behind it on the right; the Wi-Fi sign with the password hangs on the wall BEHIND Anna from the first frame (revealed in C2).
// Shots tagged 'ui:<view>' (cup, black) replace the world with a full-screen insert.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/passport/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'coat', col: '#C2504A', col2: '#F5EBDD' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#2B2F3A', acc: null } };
const BAR = { ...BASE.greg, cap: { col: '#1F2A44', text: 'ID', textCol: '#F2C14E' }, top: { type: 'blazer', col: '#1F2A44', shirt: '#F7F9FC', tie: '#E0474C' }, bottom: { type: 'trousers', col: '#1F2A44' } };
const G = { her: geom(HER), officer: geom(BAR) };
const HX = -420, BX = 430, CT = -760;                       // her / officer feet x, counter top height
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function apron(cc, g) { }

// ---------------- props
const big = f => ctx => { ctx.scale(1.5, 1.5); f(ctx); };
const pillowItem0 = ctx => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#FFFDF8'; rr(ctx, -110, -150, 220, 130, 40); ctx.fill(); ctx.strokeStyle = '#9AA3B2'; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = '#7FB0D8'; ctx.font = '700 40px sans-serif'; fitTxt(ctx, 'ZZZ', 0, -88, 52, '#7FB0D8', 150); ctx.restore(); };
const passDraw = stamped => ctx => { ctx.save(); ctx.rotate(-0.06); ctx.fillStyle = '#1F3A7A'; rr(ctx, -70, -190, 140, 190, 10); ctx.fill(); ctx.strokeStyle = '#F2C14E'; ctx.lineWidth = 5; rr(ctx, -62, -182, 124, 174, 8); ctx.stroke(); ctx.fillStyle = '#F2C14E'; ctx.beginPath(); ctx.arc(0, -120, 28, 0, TAU); ctx.fill(); fitTxt(ctx, 'PASSPORT', 0, -62, 20, '#F2C14E', 112);
  if (stamped) { ctx.save(); ctx.translate(30, -50); ctx.rotate(-0.3); ctx.strokeStyle = '#2E9E4A'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.stroke(); ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(-4, 16); ctx.lineTo(20, -16); ctx.stroke(); ctx.restore(); } ctx.restore(); };
const menuItem0 = ctx => { ctx.save(); ctx.rotate(0.08); ctx.fillStyle = '#FFF2D6'; rr(ctx, -90, -170, 180, 160, 10); ctx.fill(); ctx.strokeStyle = '#C23C4A'; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = '#E8A24A'; ctx.beginPath(); ctx.arc(0, -105, 40, 0, TAU); ctx.fill(); ctx.fillStyle = '#C23C4A'; for (const [x, y] of [[-14, -118], [16, -100], [-4, -86]]) { ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill(); } fitTxt(ctx, 'PIZZA', 0, -40, 30, '#C23C4A', 150); ctx.restore(); };
const pillowItem = big(pillowItem0), menuItem = big(menuItem0), passItem = big(passDraw(false)), passStamped = big(passDraw(true));
function bagsDraw(c, t, L) { if (L !== 'B2' || t < ev('B2', 'bags')) return; const u = t - ev('B2', 'bags'), k = eBack(clamp(u / 0.3), 1.8);
  c.save(); c.translate(180, CT - 6); c.scale(k, k); c.fillStyle = '#5A606E'; rr(c, -110, -150, 220, 150, 14); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.stroke(); c.fillStyle = '#2B2F3A'; rr(c, -30, -176, 60, 30, 8); c.fill(); fitTxt(c, 'WORK', 0, -72, 44, '#F7F2E8', 190); c.restore();
  c.save(); c.translate(440, CT - 6); c.scale(k, k); c.fillStyle = '#F28C28'; rr(c, -120, -140, 240, 140, 40); c.fill(); c.strokeStyle = '#8A4A10'; c.lineWidth = 6; c.stroke(); c.fillStyle = '#7CC45A'; c.beginPath(); c.moveTo(-40, -140); c.lineTo(-90, -230); c.lineTo(-30, -150); c.closePath(); c.fill(); c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(20, -140); c.lineTo(80, -220); c.lineTo(50, -140); c.closePath(); c.fill(); fitTxt(c, 'FUN', 0, -66, 52, '#FFFDF8', 200); c.restore(); }

// ---------------- passport hall (prerendered, softly blurred); the booth desk is drawn in front of the officer
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawShop(c) {
  c.fillStyle = '#E3EAF1'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#9FB4C8'; c.fillRect(BX0, -1250, BW, 990); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 260) { c.beginPath(); c.moveTo(x, -1250); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#1F2A44'; rr(c, -640, -2560, 1700, 170, 22); c.fill(); fitTxt(c, 'PASSPORT CONTROL', 210, -2475, 110, '#F2C14E', 1560);
  c.fillStyle = '#E0E8F0'; rr(c, -680, -2260, 780, 640, 22); c.fill(); c.fillStyle = '#2A55A8'; rr(c, -650, -2230, 720, 580, 12); c.fill(); fitTxt(c, 'WELCOME', -290, -2040, 100, '#FFFDF8', 640); fitTxt(c, 'PLEASE HAVE YOUR', -290, -1900, 46, '#BFE3F7', 640, 'Cav7'); fitTxt(c, 'PASSPORT READY', -290, -1830, 56, '#FFE15A', 640, 'Cav7');
  c.fillStyle = '#6A7A90'; rr(c, 200, -2400, 1000, 1100, 18); c.fill(); c.fillStyle = '#2A55A8'; rr(c, 230, -2370, 940, 1040, 10); c.fill();
  fitTxt(c, 'ARRIVALS', 700, -2250, 110, '#FFFDF8', 800); ['UK PASSPORTS', 'EU PASSPORTS', 'ALL OTHER PASSPORTS', 'ELECTRONIC GATES'].forEach((t, i) => fitTxt(c, t, 700, -2040 + i * 170, 58, i === 2 ? '#FFE15A' : '#F7F2E8', 860, 'Cav7'));
  c.fillStyle = '#C9CFD8'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -260; y < 1400; y += 160) for (let x = BX0 + ((y / 160) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
  c.fillStyle = '#F2C14E'; c.fillRect(BX0, 120, BW, 36);
  for (const px of [-1900, -1400, -900]) { c.fillStyle = '#8C93A0'; c.fillRect(px - 14, -700, 28, 780); c.fillStyle = '#5A606E'; c.beginPath(); c.arc(px, -700, 36, 0, TAU); c.fill(); c.fillStyle = '#5A606E'; rr(c, px - 70, 70, 140, 24, 10); c.fill(); }
  c.strokeStyle = '#C23C4A'; c.lineWidth = 14; for (const [a, b] of [[-1900, -1400], [-1400, -900]]) { c.beginPath(); c.moveTo(a, -690); c.quadraticCurveTo((a + b) / 2, -540, b, -690); c.stroke(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawShop);
// cups on the counter: how many at time t, and the tray with the 4th one sliding in
function counter(c, t, L) {
  paint(c, q => { q.m(60, CT); q.l(1250, CT); q.l(1250, CT + 70); q.l(60, CT + 70); q.z(); }, '#D4DAE3', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(80, CT + 70); q.l(1230, CT + 70); q.l(1230, 700); q.l(80, 700); q.z(); }, '#3A4A6A', { sd: 10, hd: 4, lw: 4 }); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 5; for (let x = 360; x < 1230; x += 290) { c.beginPath(); c.moveTo(x, CT + 70); c.lineTo(x, 700); c.stroke(); }
  c.fillStyle = '#2B2F3A'; rr(c, 800, CT - 300, 300, 230, 14); c.fill(); c.fillStyle = '#9CC8F0'; rr(c, 822, CT - 280, 256, 170, 8); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, 920, CT - 70, 60, 70, 6); c.fill(); c.fillStyle = '#1B1E26'; c.beginPath(); c.arc(950, CT - 322, 16, 0, TAU); c.fill();   // monitor + webcam
  c.fillStyle = '#7A4E2E'; rr(c, 520, CT - 50, 150, 50, 10); c.fill(); c.fillStyle = '#C23C4A'; rr(c, 535, CT - 66, 120, 24, 8); c.fill();   // stamp pad
  bagsDraw(c, t, L); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'happy'; if (t > hev('panic') - 0.05) { st.mood = 'worried'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A1') { st.mood = 'happy'; if (speaking('a1_h', t, 0.05, 0.3)) { st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 100 + Math.sin(t * 14) * 40, { planar: true }); st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 100 + Math.cos(t * 14) * 40, { planar: true }); } if (t > e('flash') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'A2') { st.mood = 'happy'; if (speaking('a2_h', t, 0.05, 0.3)) { st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); } if (t > e('pillow') - 0.05) { st.mood = 'surprised'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (t > e('stamp') - 0.05) st.mood = 'happy'; if (speaking('b1_h2', t, 0.05, 0.3)) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 150); } if (t > e('bags') - 0.05) { st.mood = 'worried'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_h', t, 0.05, 0.3)) gest(st, g, 'her', t, -1, 160); if (t > e('menu') - 0.05) { st.mood = 'happy'; st.items = { R: menuItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh - 40); } }
  if (L === 'C2') { st.mood = 'happy'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; }
    if (t > e('hand') - 0.05) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('pat') - 0.05) { st.mood = 'worried'; const sw = Math.sin((t - e('pat')) * 14); st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 200 + sw * 50); st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 260 - sw * 50); }
    if (t > e('stare') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (speaking('c2_h2', t, 0.05, 0.6)) { st.mood = 'sad'; st.blink = 1; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  return st; }
function barState(t, L) { const g = G.officer, e = k => ev(L, k), st = { t, talk: talk('officer', t), mood: 'neutral', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0, afterTorso: cc => apron(cc, g) };
  if (L === 'hook') { st.turn = -0.2; st.look = -0.5; st.mood = 'skeptical'; if (t > hev('panic') - 0.05) st.mood = 'neutral'; }
  if (L === 'A1') { st.mood = 'skeptical'; if (t > e('flash') - 0.05) { st.mood = 'neutral'; st.blink = 0; } }
  if (L === 'A2') { st.mood = 'neutral'; if (speaking('a2_o', t, 0.05, 0.3)) st.mood = 'happy'; if (t > e('pillow') - 0.05) { st.mood = 'happy'; st.items = { R: pillowItem }; st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 140); st.lookY = 0.4; } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_o', t, 0.05, 0.3)) st.mood = 'happy'; if (t > e('stamp') - 0.05) { st.mood = 'happy'; st.items = { R: passStamped }; st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 140 + (t < e('stamp') + 0.2 ? 130 : 0)); st.lookY = 0.4; } }
  if (L === 'B2') { st.mood = 'skeptical'; if (speaking('b2_o', t, 0.05, 0.3)) st.mood = 'neutral'; if (t > e('bags') - 0.05) { st.mood = 'skeptical'; st.lookY = 0.5; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_o', t, 0.05, 0.3)) st.mood = 'skeptical'; if (t > e('menu') - 0.05) { st.mood = 'bored'; st.blink = 0; st.lookY = 0.3; } }
  if (L === 'C2') { st.mood = 'skeptical';
    if (t > e('think') - 0.05) { st.mood = 'neutral'; st.blink = 0; st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.8); st.lookY = -0.3; }
    if (speaking('c2_o', t, 0.05, 0.1)) { st.mood = 'happy'; st.lookY = 0; st.armR = hang(g, 1); }
    if (t > e('hand') - 0.1) { st.mood = 'happy'; st.armR = hang(g, 1); st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 20, { planar: true }); }
    if (t > e('stare')) { st.mood = 'smug'; } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'officer'], card: ['her', 'officer'], two: ['her', 'officer'], her: ['her'], officer: ['officer'], cover: ['her', 'officer'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  if (who.includes('officer')) heads.officer = K.put(c, BAR, barState(t, L), BX, 0);
  counter(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (!heads.officer) heads.officer = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, dHY = G.officer.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(20, fy((hHY + dHY) / 2, 0.8, 1120), 0.8, 'cover'), WIDE: S(20, -1000, 0.5, 'wide'), CARD: S(20, fy(dHY, 0.66, 980), 0.66, 'card'), TWO: S(20, fy(dHY, 0.75, 820), 0.75, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_R: S(HX + 40, fy(hHY, 1.0, 1120), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'),
  BAR: S(BX - 20, fy(dHY, 1.0), 1.0, 'officer'), BAR_H: S(BX - 20, fy(dHY, 1.0, 1230), 1.0, 'officer'), HER_H: S(HX + 40, fy(hHY, 1.35, 1280), 1.35, 'her'), BAR_CU: S(BX - 20, fy(dHY, 1.6, 960), 1.6, 'officer'),
  BLACK: U('black', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_o.t - 0.12) return SH.COVER; if (t < hev('panic') - 0.05) return f(SH.BAR_H); if (t < SP.hook.t - 0.1) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('flash') - 0.05) return f(SH.WIDE);
  if (L === 'A2' && t > e('pillow') - 0.05) return f(SH.WIDE);
  if (L === 'B1' && t > e('stamp') - 0.05 && !sp('b1_h2')) return f(SH.WIDE);
  if (L === 'B2' && t > e('bags') - 0.05) return f(SH.WIDE);
  if (L === 'C1' && t > e('menu') - 0.05) return f(SH.WIDE);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU][i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.9) return f(SH.WIDE); if (t >= e('think') + 0.9 && t < SP.c2_o.t - 0.1) return f(SH.BAR_CU);
    if (t > e('hand') - 0.05 && t < SP.c2_h2.t - 0.1) return f(SH.WIDE); if (sp('c2_o')) return f(SH.BAR); if (sp('c2_h2')) return f(SH.HER_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.BAR;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'PURPOSE OF VISIT?', 0, 4, 54, '#E0474C', 600); c.restore(); }
function flashFx(c, t) { if (typeof ev('A1', 'flash') !== 'number') return; const u = t - ev('A1', 'flash'); if (SC.A1 && u > 0 && u < 0.45) { c.save(); c.globalAlpha = 1 - eOut(u / 0.45); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, HH); c.restore(); } }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ ОТВЕТИЛ', 'НА «ЦЕЛЬ ВИЗИТА»?'], rows: [['A2', "I'm here on holiday."], ['B1', "I'm here on holiday for a week."], ['B2', "A bit of both."], ['C1', "I'm here to visit friends."]], cta: ['ОТПРАВЬ ДРУГУ,', 'КОТОРЫЙ ЛЕТИТ В ОТПУСК'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gd = G.officer; K.put(cc, BAR, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gd, 1), items: { R: passStamped } }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { officer: ['OFFICER', '#1F2A44'] }; flashFx(c, t);
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_o: 0.05, hook_h: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('flash') && t < narT - 0.1) K.pop(c, t, 'ФОТО НА ПАСПОРТ!', e('flash') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 66);
  if (L === 'A2' && t > e('pillow') && t < narT - 0.1) K.pop(c, t, 'ПОДУШКА?!', e('pillow') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 84);
  if (L === 'B1' && t > e('stamp') && t < SP.b1_h2.t - 0.05) K.pop(c, t, 'ШТАМП!', e('stamp') + 0.05, SP.b1_h2.t - 0.1, 540, 1330, C.gold, -0.06, 90);
  if (L === 'B2' && t > e('bags') && t < narT - 0.1) K.pop(c, t, 'КАКАЯ СУМКА?', e('bags') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'C1' && t > e('menu') && t < narT - 0.1) K.pop(c, t, 'ЭТО МЕНЮ ПИЦЦЕРИИ!', e('menu') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 60);
  if (L === 'C2') { if (t > e('think') && t < SP.c2_o.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_o.t - 0.05, 1450);
    if (t > e('hand') && t < SP.c2_h2.t - 0.05) K.pop(c, t, 'ПАСПОРТ?!', e('hand') + 0.1, SP.c2_h2.t - 0.1, 540, 1330, C.gold, -0.06, 90); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_o: 0.4, b1_o: 0.05, b1_h2: 0.4, b2_o: 0.05, b2_h: 0.05, b2_o2: 0.4, c1_o: 0.05, c1_h2: 0.4, c2_o: 0.3, c2_h2: 0.6 } });
  K.hud(c, t, sc);
}
E.run('passport', NF, renderFrame);
