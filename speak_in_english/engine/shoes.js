// "Two left shoes" (returning a faulty product) episode renderer: node shoes.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/shoes/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london, top: { type: 'coat', col: '#E0A43B' }, bottom: { type: 'jeans', col: '#3B4A6A' } };
const NIGEL = { ...BASE.mark, hair: { style: 'short', col: '#C9A060' }, brow: '#9A7A50', top: { type: 'polo', col: '#3C8FE0' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const G = { her: geom(HER), nigel: geom(NIGEL) };
const FY = 60, HERX = -340, NX = 330, CTR = { x0: -120, x1: 640, top: -700 }, BROWN = '#7A4A2A', BLUE = '#3C6FB4', GREEN = '#4CAF6A';
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- shoe shop (prerendered)
const BX0 = -1600, BY0 = -3000, BW = 3400, BH = 3700, BS = 0.5;
function sideShoe(c, x, y, s, col, dir = -1) { c.save(); c.translate(x, y); c.scale(s * -dir, s); paint(c, q => { q.m(-70, 0); q.l(80, 0); q.q(90, -30, 50, -40); q.l(10, -50); q.l(-20, -80); q.l(-70, -80); q.z(); }, col, { sd: 3, hd: 2, lw: 3 }); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-72, -8, 156, 8); c.restore(); }
function drawShop(c) {
  c.fillStyle = '#EAF0F2'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(60,140,200,.08)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, BY0, 110, BH);
  for (const [x0, x1] of [[-1500, -650], [700, 1700]]) for (let r = 0; r < 4; r++) { const y = -2300 + r * 360; c.fillStyle = '#C9A06A'; c.fillRect(x0, y, x1 - x0, 22); for (let x = x0 + 70, i = 0; x < x1 - 60; x += 170, i++) sideShoe(c, x, y, 0.85, ['#E0474C', '#2B2F3A', BROWN, BLUE, '#F2C14E', GREEN][(i + r) % 6], -1); }
  c.fillStyle = '#2B2F3A'; rr(c, -350, -2650, 700, 220, 24); c.fill(); txt(c, 'SHOE PALACE', 0, -2570, 76, '#F2C14E'); txt(c, 'every pair perfect!', 0, -2480, 40, '#FFFFFF', 'Nun9');
  c.save(); c.translate(-560, -1100); c.rotate(-0.05); c.fillStyle = '#E0474C'; rr(c, -150, -60, 300, 120, 12); c.fill(); txt(c, 'NO RETURNS*', 0, -6, 40, '#FFFFFF'); txt(c, '*probably', 0, 36, 22, '#FFFFFF', 'Nun9'); c.restore();
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#C9CED6'); fg.addColorStop(1, '#A9B0BA'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = BX0; x < BX0 + BW; x += 200) for (let y = FY; y < 700; y += 100) if (((x / 200) + (y / 100)) % 2 < 1) c.fillRect(x, y, 200, 100);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawShop(c); }

// ---------------- top-down shoes for insert cards
function topShoe(c, x, y, s, side, col, label = true) { c.save(); c.translate(x, y); c.scale(s * (side === 'L' ? 1 : -1), s);
  paint(c, q => { q.m(5, -120); q.q(-62, -118, -58, -30); q.q(-52, 70, -14, 118); q.q(30, 132, 42, 70); q.q(52, -10, 40, -70); q.q(30, -120, 5, -120); q.z(); }, col, { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(-4, 10, 26, 46, 0.05, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-26, -70 + i * 20); c.lineTo(22, -64 + i * 20); c.stroke(); }
  c.restore(); if (label) { c.save(); UI.font(c, 'Unb9', 54 * s); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, side, x, y + 30 * s, side === 'L' ? '#E0474C' : GREEN, '#FFFFFF', 10 * s); c.restore(); } }
// shoe sets shown in the insert card: [side, colour] per slot
function card(c, t, set, k, title, foot) { if (k <= 0) return; c.save(); c.translate(540, 1140); c.rotate(-0.03); c.scale(k * 0.92, k * 0.92); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 10, -230 + 14, 660, 460, 30); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -330, -230, 660, 460, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -330, -230, 660, 460, 30); c.stroke();
  const n = set.length, gap = n > 2 ? 140 : 190; set.forEach(([sd, col], i) => topShoe(c, (i - (n - 1) / 2) * gap + (n > 2 ? (i < 2 ? -30 : 30) : 0), 10, n > 2 ? 0.9 : 1.1, sd, col));
  if (title) { UI.font(c, 'Unb9', 44); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, title, 0, -190, C.gold, C.oliveD, 10); }
  if (foot) { UI.textFit(c, 'Unb9', 40, foot, 600); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText(foot, 0, 190); } c.restore(); }
function cardFor(c, t, L) { const win = (a, b) => eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, b, b + 0.25));
  if (L === 'A1') card(c, t, [['L', BROWN], ['L', BROWN]], win(SP.a1_her.t - 0.2, SP.a1_x.t + 0.4), '', 'TWO LEFT');
  if (L === 'B1') card(c, t, t < ev('swap') ? [['L', BROWN], ['L', BROWN]] : [['L', BROWN], ['L', BLUE]], win(ev('swap') - 0.8, SP.b1_nar.t + 2.0), t > ev('swap') ? 'EXCHANGED!' : '', '');
  if (L === 'B2') card(c, t, [['L', BROWN], ['L', BLUE]], win(ev('pair'), SP.b2_nar.t + 1.5), 'A PERFECT PAIR', '');
  if (L === 'C2' && t > ev('open') && t < ev('pairup')) card(c, t, [['R', GREEN], ['R', GREEN]], win(ev('open'), ev('pairup') - 0.1), 'REPLACEMENT', '');
  if (L === 'C2' && t >= ev('pairup')) { const k = win(ev('pairup'), SP.c2_nar.t + SP.c2_nar.d + 0.3), sw = eIO(P(t, ev('pairup') + 0.1, ev('pairup') + 0.7)); if (k > 0) { c.save(); c.translate(540, 1140); c.scale(k * 0.92, k * 0.92); c.fillStyle = '#FFFDF8'; rr(c, -360, -230, 720, 460, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -360, -230, 720, 460, 30); c.stroke();
    const A = [[-210, 'L', BROWN], [-70, 'L', BLUE], [70, 'R', GREEN], [210, 'R', GREEN]], B = [[-250, 'L', BROWN], [-130, 'R', GREEN], [130, 'L', BLUE], [250, 'R', GREEN]];
    const order = [0, 2, 1, 3]; for (let i = 0; i < 4; i++) { const a = A[order[i]], b = B[i]; topShoe(c, lerp(a[0], b[0], sw), 10, 0.85, a[1], a[2]); } UI.font(c, 'Unb9', 44); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '2 PAIRS!', 0, -190, C.gold, C.oliveD, 10); c.restore(); } } }
function voucher(c, t, L) { if (L !== 'C1') return; const k = eBack(P(t, ev('voucher'), ev('voucher') + 0.3), 1.8) * (1 - P(t, SP.c1_tip.t - 0.3, SP.c1_tip.t)); if (k <= 0) return; c.save(); c.translate(540, 1130); c.rotate(0.05); c.scale(k * 0.92, k * 0.92); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -320 + 10, -170 + 12, 640, 340, 24); c.fill(); c.fillStyle = '#F2C14E'; rr(c, -320, -170, 640, 340, 24); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.setLineDash([16, 12]); rr(c, -296, -146, 592, 292, 16); c.stroke(); c.setLineDash([]);
  txt(c, 'VOUCHER', 0, -86, 70, '#2B2F3A'); txt(c, 'SHOE PALACE', 0, -16, 34, '#2B2F3A', 'Nun9'); const z = P(t, ev('voucher') + 0.9, ev('voucher') + 1.4); c.save(); c.translate(0, 70 + z * 0); c.scale(1 + z * 0.6, 1 + z * 0.6); txt(c, 'valid for LEFT SHOES ONLY', 0, 0, 22, '#E0474C', 'Unb9'); c.restore(); c.restore(); }
function hookBox(c, t) { const k = 1 - eIO(P(t, 2.4, 2.9)); if (k <= 0) return; c.save(); c.globalAlpha = Math.min(1, k * 1.5); c.translate(540, 1200); c.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k);
  paint(c, q => { q.m(-360, -160); q.l(360, -160); q.l(330, 220); q.l(-330, 220); q.z(); }, '#E9D2B4', { sd: 8, hd: 4, lw: 5 }); c.fillStyle = '#C9A880'; c.fillRect(-340, -150, 680, 40);
  topShoe(c, -120, 40, 1.05, 'L', BROWN, t > 1.1); topShoe(c, 120, 40, 1.05, 'L', BROWN, t > 1.1);
  const lid = eIn(P(t, 0.35, 0.75)); c.save(); c.translate(lerp(0, 500, lid), lerp(-160, -700, lid)); c.rotate(lid * 1.4); paint(c, q => { q.m(-380, -50); q.l(380, -50); q.l(380, 40); q.l(-380, 40); q.z(); }, '#D9B98E', { sd: 4, hd: 2, lw: 5 }); txt(c, 'SHOE PALACE', 0, -5, 44, '#7A4A2A'); c.restore();
  if (t > 1.1) { const kk = eBack(P(t, 1.1, 1.4), 2); c.save(); c.translate(0, 330); c.rotate(-0.04); c.scale(kk, kk); c.fillStyle = '#FFFDF8'; rr(c, -330, -55, 660, 110, 20); c.fill(); UI.textFit(c, 'Unb9', 54, 'ЧТО-ТО НЕ ТАК?', 600); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ЧТО-ТО НЕ ТАК?', 0, 4); c.restore(); }
  c.restore(); }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.6 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function herPos(t, L) { if (L === 'A2' && t > ev('circle') - 0.1 && t < ev('circle') + 1.5) { const a = P(t, ev('circle') - 0.1, ev('circle') + 1.5) * TAU; return { x: HERX - 160 + Math.cos(a) * 160, walk: true, flip: Math.sin(a) > 0 }; } return { x: HERX }; }
function herState(t, L, pos) { const g = G.her, st = { t, talk: talk('her', t), mood: 'annoyed', turn: 0.4, look: 0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 330), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330) };
  gest(st, g, 'her', t, 1, 220);
  if (L === 'hook') st.mood = 'shock';
  if (L === 'A1') st.mood = t > SP.a1_x.t + 0.6 ? 'skeptical' : 'shock';
  if (L === 'A2' && pos.walk) { st.legPose = 'walk'; st.mood = 'worried'; if (pos.flip) { st.turn = -0.4; st.look = -0.8; } }
  if (L === 'B1') st.mood = t > ev('swap') ? 'shock' : 'neutral';
  if (L === 'B2') st.mood = t > ev('pair') ? 'tired' : 'neutral';
  if (L === 'C1') st.mood = t > ev('voucher') + 0.9 ? 'angry' : 'neutral';
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('open')) st.mood = 'skeptical'; if (t > SP.c2_her2.t - 0.3) { st.mood = 'smug'; st.squint = true; } if (t > ev('pairup')) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 120); } }
  return st; }
function nigelState(t, L) { const g = G.nigel, st = { t, talk: talk('nigel', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 1.3, g.ySh + 340), armR: reach(g, 1, g.sw * 0.6, g.ySh + 340) };
  gest(st, g, 'nigel', t, -1, 200);
  if (L === 'A2' && t > SP.a2_x.t + 0.8 && t < ev('circle') + 1.5) { const u = t * 7; st.armL = reach(g, -1, -g.sw * 1.6 + Math.cos(u) * 60, g.ySh + 40 + Math.sin(u) * 60); }
  if (L === 'C1' && t > ev('voucher') - 0.3) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 140); }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'neutral'; if (t > SP.c2_x.t) st.mood = 'happy'; if (t > ev('pairup')) st.mood = 'shock'; }
  return st; }
function counter(c, t, L) { paint(c, q => { q.m(CTR.x0, CTR.top); q.l(CTR.x1, CTR.top); q.l(CTR.x1, FY); q.l(CTR.x0, FY); q.z(); }, '#FFFDF8', { sd: 8, hd: 4, lw: 3, inner: k => { k.fillStyle = '#3C8FE0'; k.fillRect(CTR.x0, CTR.top + 60, CTR.x1 - CTR.x0, 40); } }); paint(c, q => { q.m(CTR.x0 - 20, CTR.top - 24); q.l(CTR.x1 + 20, CTR.top - 24); q.l(CTR.x1 + 20, CTR.top); q.l(CTR.x0 - 20, CTR.top); q.z(); }, '#C9A06A', { sd: 3, hd: 2, lw: 3 });
  txt(c, 'RETURNS', (CTR.x0 + CTR.x1) / 2, CTR.top + 250, 56, '#2B2F3A');
  c.fillStyle = '#2B2F3A'; rr(c, 480, CTR.top - 150, 130, 126, 10); c.fill(); c.fillStyle = '#7CF29A'; c.fillRect(496, CTR.top - 136, 98, 40);
  // the box(es) on the counter
  const box = (x, col) => { paint(c, q => { q.m(x - 110, CTR.top - 24); q.l(x + 110, CTR.top - 24); q.l(x + 110, CTR.top - 110); q.l(x - 110, CTR.top - 110); q.z(); }, col, { sd: 3, hd: 2, lw: 3 }); };
  box(40, '#E9D2B4'); sideShoe(c, 0, CTR.top - 110, 0.6, BROWN, -1); sideShoe(c, 80, CTR.top - 110, 0.6, L === 'B1' && t > ev('swap') || ['B2', 'C1', 'C2'].includes(L) ? BLUE : BROWN, -1);
  if (L === 'C2' && t > ev('box')) { const k = eOut(P(t, ev('box'), ev('box') + 0.3)); c.save(); c.translate(0, (1 - k) * -300); box(300, '#CDE6D2'); if (t > ev('open')) { sideShoe(c, 260, CTR.top - 110, 0.6, GREEN, 1); sideShoe(c, 340, CTR.top - 110, 0.6, GREEN, 1); } c.restore(); }
}
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {}, pos = herPos(t, L);
  heads.nigel = put(c, NIGEL, nigelState(t, L), NX, FY);
  counter(c, t, L);
  heads.her = put(c, HER, herState(t, L, pos), pos.x, FY);
  if (L === 'A2' && pos.walk) { c.strokeStyle = 'rgba(224,71,76,.7)'; c.lineWidth = 10; c.setLineDash([24, 18]); c.beginPath(); c.ellipse(HERX - 160, FY + 30, 260, 50, 0, 0, TAU); c.stroke(); c.setLineDash([]); }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -1000, z: 0.78, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.74, cut: u < 0.85 };
  if (L === 'A2' && t > ev('circle') - 0.3 && t < ev('circle') + 1.6) return { x: -150, y: -950, z: 0.7, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 200, y: -1250, z: 0.85, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 230, y: -1180, z: 0.95, r: 0.3 } : { x: NX - 230, y: -1250, z: 0.95, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { drawWorld(c, t, 'hook', { x: 0, y: -1000, z: 0.78, r: 0 }); Hq.vignette(c, W, HH, 0.3); hookBox(c, t); K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЕБЕ ПОПАДАЛСЯ', 'БРАКОВАННЫЙ ТОВАР?'], rows: [['A2', 'These shoes are both left.'], ['B1', "I'd like to exchange them."], ['B2', 'Could I get a pair that matches?'], ['C1', "I'd like a full refund, please."]], cta: ['ОТПРАВЬ ТОМУ, КОМУ', 'ПРИСЛАЛИ НЕ ТО'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 0.6, G.her.ySh + 300) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  cardFor(c, t, sc.id); voucher(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { nigel: ['NIGEL', '#2F6AB4'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
E.run('shoes', NF, renderFrame);
