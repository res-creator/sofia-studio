// "How to ask someone to leave your seat" episode renderer (hard_cut camera): node seat.js start end out.mp4 | --png=f1,f2
// Plane cabin: Anna (blue coat) stands in the aisle on the left, Tom sits in seat 14C on the right (profile, legs hidden by the seat).
// Shots tagged 'ui:<view>' (ticket, map, black) replace the world with a full-screen insert.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/seat/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'coat', col: '#3C6FB4', col2: '#F5EBDD' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#FFFFFF', acc: '#EE5E9A' } };
const TOM = { ...BASE.tom, top: { type: 'hoodie', col: '#E9A23B' }, bottom: { type: 'joggers', col: '#3B4A5C' }, shoes: { col: '#FFFFFF', acc: '#3C6FB4' } };
const G = { her: geom(HER), sitter: geom(TOM) };
const HX = -420, TX = 420, HF = 330;                         // her feet x; Tom sits at TX with his feet HF below the floor line (hidden by the seat)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const passItem = ctx => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#FFFDF8'; ctx.strokeStyle = '#3C6FB4'; ctx.lineWidth = 5; rr(ctx, -70, -150, 140, 150, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#3C6FB4'; ctx.fillRect(-70, -150, 140, 36); fitTxt(ctx, '14C', 0, -60, 46, '#E0474C', 120); ctx.restore(); };

// ---------------- cabin (prerendered, softly blurred)
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawCabin(c) {
  c.fillStyle = '#EAE6DE'; c.fillRect(BX0, BY0, BW, BH);
  // overhead bins
  c.fillStyle = '#F7F4EE'; rr(c, BX0 + 60, -2750, BW - 120, 520, 30); c.fill(); c.strokeStyle = '#C9C3B4'; c.lineWidth = 8; c.stroke(); for (let x = BX0 + 400; x < BX0 + BW; x += 700) { c.beginPath(); c.moveTo(x, -2750); c.lineTo(x, -2230); c.stroke(); c.fillStyle = '#C9C3B4'; rr(c, x - 150, -2400, 300, 40, 12); c.fill(); }
  // window row with sky
  for (let x = -2000; x < 2200; x += 900) { c.fillStyle = '#D9D2C2'; rr(c, x - 20, -1890, 380, 560, 190); c.fill(); c.fillStyle = '#9FD3F2'; rr(c, x, -1870, 340, 520, 170); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x + 110, -1560, 100, 50, 0, 0, TAU); c.ellipse(x + 220, -1600, 80, 44, 0, 0, TAU); c.fill(); }
  // wall panel + sign "14"
  c.fillStyle = '#DCD6C8'; c.fillRect(BX0, -1250, BW, 990); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 900) { c.beginPath(); c.moveTo(x, -1250); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#2B3A5C'; rr(c, 380, -2180, 360, 110, 16); c.fill(); fitTxt(c, 'ROW 14', 560, -2125, 62, '#FFFDF8', 330);
  // carpet aisle
  c.fillStyle = '#3C5A8C'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(255,255,255,.08)'; for (let y = -260; y < 1400; y += 120) for (let x = BX0 + ((y / 120) % 2) * 60; x < BX0 + BW; x += 120) c.fillRect(x, y, 60, 60);
  c.fillStyle = '#E0474C'; c.fillRect(BX0, 120, BW, 36);                                                        // carpet stripe
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawCabin);
// the seat: back behind Tom, cushion + armrest in front of his legs
function seatBack(c) { paint(c, q => { q.m(TX + 120, -1500); q.q(TX + 330, -1560, TX + 440, -1450); q.l(TX + 440, -300); q.l(TX + 120, -300); q.z(); }, '#2F5FA8', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#E9E6E0'; rr(c, TX + 150, -1560, 260, 110, 20); c.fill(); fitTxt(c, '14C', TX + 280, -1505, 56, '#E0474C', 200); }
function seatFront(c) { paint(c, q => { q.m(TX - 300, -430); q.l(TX + 140, -430); q.l(TX + 140, -90); q.l(TX - 300, -90); q.z(); }, '#3C6FB4', { sd: 8, hd: 4, lw: 4 }); paint(c, q => { q.m(TX - 240, -470); q.l(TX + 140, -470); q.l(TX + 140, -430); q.l(TX - 240, -430); q.z(); }, '#244C8A', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#2B2F3A'; rr(c, TX - 320, -520, 380, 70, 18); c.fill(); c.fillStyle = '#244C8A'; c.fillRect(TX - 80, -90, 24, 90); c.fillRect(TX + 60, -90, 24, 90); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const behindHead = (g, s) => reach(g, s, s * g.hw * 1.3, g.headY + g.hh * 0.2, { planar: true });
const eyeMask = (cc, gg, g) => { cc.save(); cc.translate(gg.head.x, gg.head.y + g.hh * 0.05); cc.fillStyle = '#2B2F3A'; rr(cc, -g.hw * 0.9, -g.hh * 0.28, g.hw * 1.8, g.hh * 0.42, 18); cc.fill(); cc.restore(); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'happy'; st.items = { R: passItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 20); if (t > hev('panic') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'angry'; gest(st, g, 'her', t, -1, 150); } if (t > e('name') - 0.3) { st.mood = 'surprised'; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 80, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 80, { planar: true, fist: true }); } if (t > e('comfy') - 0.1) { st.mood = 'skeptical'; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; st.items = { R: passItem }; st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 40, { planar: true }); } if (speaking('b1_h2', t, 0.05, 0.4)) st.mood = 'bored'; }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (t > e('feel') - 0.05) { st.mood = 'annoyed'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'worried'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'sad'; gest(st, g, 'her', t, -1, 160); } if (t > e('stare') - 0.05) { st.mood = 'annoyed'; st.blink = 0; st.armL = hang(g, -1); } }
  if (L === 'C2') { st.mood = 'angry'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > e('map') - 0.05) { st.mood = 'shock'; st.blink = 0; }
    if (speaking('c2_h2', t, 0.05, 0.6)) { st.mood = 'sad'; st.blink = 1; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  return st; }
function sitterState(t, L) { const g = G.sitter, e = k => ev(L, k), st = { t, talk: talk('sitter', t), mood: 'happy', turn: -0.35, look: -0.8, armL: behindHead(g, -1), armR: behindHead(g, 1), items: {}, headX: 0 };
  if (L === 'hook') { st.mood = 'smug'; if (t > hev('panic') - 0.05) st.mood = 'neutral'; }
  if (L === 'A1') { st.mood = 'happy'; if (t > e('name') - 0.3) { st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 60, { planar: true }); st.mood = 'happy'; st.laugh = true; } }
  if (L === 'A2') { st.mood = 'smug'; if (t > e('comfy') - 0.05) { st.mood = 'tired'; st.blink = 1; st.front = (cc, gg) => eyeMask(cc, gg, g); } }
  if (L === 'B1') { st.mood = 'neutral'; if (t > ev('B1', 'ticket') - 0.1) { st.items = { L: passItem }; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 20, { planar: true }); st.mood = 'worried'; } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_s', t, 0.05, 0.3)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.hw * 0.4, g.ySh + 40); } if (t > e('feel') - 0.05) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 140); st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 140); } }
  if (L === 'C1') { st.mood = 'neutral'; if (t > e('pat') - 0.05) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 320); st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 320); st.laugh = true; } }
  if (L === 'C2') { st.mood = 'neutral'; if (t > ev('C2', 'think') - 0.05) { st.mood = 'neutral'; st.blink = 0; } if (speaking('c2_s', t, 0.05, 0.1)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 150); } if (speaking('c2_s2', t, 0.05, 0.4)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh + 20); st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 20); st.tilt = Math.sin(P(t, SP.c2_s2.t, SP.c2_s2.t + 0.5) * TAU) * 0.06; } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'sitter'], card: ['her', 'sitter'], two: ['her', 'sitter'], her: ['her'], sitter: ['sitter'], cover: ['her', 'sitter'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH); seatBack(c);
  if (who.includes('sitter')) heads.sitter = K.put(c, TOM, sitterState(t, L), TX, HF);
  if (tag === 'sitter' || tag === 'wide' || tag === 'card' || tag === 'two' || tag === 'cover') seatFront(c);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (!heads.sitter) heads.sitter = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, sHY = HF + G.sitter.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(20, fy((hHY + sHY) / 2, 0.8, 1120), 0.8, 'cover'), WIDE: S(20, -1000, 0.5, 'wide'), CARD: S(20, fy(sHY, 0.66, 980), 0.66, 'card'), TWO: S(20, fy(sHY, 0.75, 820), 0.75, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'), HER_H: S(HX + 40, fy(hHY, 1.35, 1280), 1.35, 'her'),
  TOM: S(TX - 30, fy(sHY, 1.0), 1.0, 'sitter'), TOM_H: S(TX - 30, fy(sHY, 1.0, 1230), 1.0, 'sitter'), TOM_CU: S(TX - 30, fy(sHY, 1.6, 960), 1.6, 'sitter'),
  TICKET: U('ticket', 1), MAP: U('map', 2), BLACK: U('black', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_s.t - 0.12) return SH.COVER; if (t < hev('panic') - 0.05) return f(SH.TOM_H); if (t < SP.hook.t - 0.1) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('name') - 0.05) return f(SH.WIDE);
  if (L === 'A2' && t > e('comfy') - 0.05) return f(SH.WIDE);
  if (L === 'B1' && t > e('ticket') - 0.05 && t < nar.t - 0.1) return f(SH.TICKET);
  if (L === 'B2' && t > e('feel') - 0.05) return f(SH.WIDE);
  if (L === 'C1' && t > e('pat') - 0.05) return f(SH.WIDE);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU][i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.9) return f(SH.WIDE); if (t >= e('think') + 0.9 && t < SP.c2_s.t - 0.1) return f(SH.TOM_CU);
    if (t > e('map') - 0.05 && t < SP.c2_h2.t - 0.1) return f(SH.MAP); if (sp('c2_h2')) return f(SH.HER_CU); if (sp('c2_s2')) return f(SH.TOM_CU); if (sp('c2_s')) return f(SH.TOM); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.TOM;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen inserts: the boarding pass (flips at "upside down") and the flight screen
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function caption(c, s, k = 1, y = 1530, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }
function ticketView(c, t) { backdrop(c, 'ticket'); const a = ev('B1', 'ticket'), f = ev('B1', 'flip'), k = eBack(P(t, a, a + 0.3), 1.6), rot = Math.PI * eIO(P(t, f, f + 0.5)), flipped = t > f + 0.25;
  c.save(); c.translate(540, 900); c.scale(k, k); c.rotate(rot + Math.sin(t * 5) * 0.01); c.fillStyle = '#FFFDF8'; rr(c, -430, -300, 860, 600, 30); c.fill(); c.fillStyle = '#3C6FB4'; rr(c, -430, -300, 860, 130, 30); c.fill(); c.fillRect(-430, -230, 860, 60); fitTxt(c, 'BOARDING PASS', 0, -235, 70, '#FFFFFF', 760);
  fitTxt(c, 'PASSENGER: TOM', -390, -110, 44, '#2B2F3A', 760, 'Nun9', 'left'); fitTxt(c, 'FLIGHT 417', -390, -40, 44, '#2B2F3A', 760, 'Nun9', 'left'); fitTxt(c, 'SEAT', -390, 60, 40, '#8A8480', 300, 'Nun9', 'left');
  fitTxt(c, flipped ? '14C' : '41C', 0, 160, 170, flipped ? '#E0474C' : '#2B2F3A', 560); c.restore();
  caption(c, flipped ? '«ПЕРЕВЁРНУТ… ЗНАЧИТ, 14C»' : '«У МЕНЯ НАПИСАНО 41C»', clamp(P(t, a + 0.3, a + 0.5)), 1560); }
function mapView(c, t) { backdrop(c, 'map'); const a = ev('C2', 'map'), k = eBack(P(t, a, a + 0.3), 1.6);
  c.save(); c.translate(540, 1080); c.scale(k * 0.92, k * 0.92); c.fillStyle = '#0E1018'; rr(c, -440, -420, 880, 860, 30); c.fill(); c.fillStyle = '#16314F'; rr(c, -410, -390, 820, 800, 18); c.fill();
  c.fillStyle = '#2F5A48'; c.beginPath(); c.ellipse(-120, 40, 220, 160, 0.3, 0, TAU); c.ellipse(190, -100, 150, 110, -0.2, 0, TAU); c.fill();
  c.strokeStyle = '#F2C14E'; c.lineWidth = 8; c.setLineDash([22, 18]); c.beginPath(); c.moveTo(-240, -40); c.quadraticCurveTo(0, -300, 250, -60); c.stroke(); c.setLineDash([]);
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(-240, -40, 20, 0, TAU); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(250, -60, 22, 0, TAU); c.fill();
  fitTxt(c, 'FLIGHT 417', 0, -330, 56, '#F2C14E', 700); fitTxt(c, 'DESTINATION', 0, 190, 44, '#9FB8CC', 700, 'Nun9'); fitTxt(c, 'MADRID', 0, 290, 120, '#FFFFFF', 760); c.restore();
  caption(c, '«РЕЙС В МАДРИД. А ЛЕТЕЛА В ПАРИЖ»', clamp(P(t, a + 0.3, a + 0.5)), 1560); }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'SEAT 14C?!', 0, 4, 60, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ ПОПРОСИЛ', 'ОСВОБОДИТЬ МЕСТО?'], rows: [['A2', "Excuse me, you're in my seat."], ['B1', 'I think this is my seat.'], ['B2', 'Would you mind checking your boarding pass?'], ['C1', 'Sorry to bother you, but…']], cta: ['ОТПРАВЬ ДРУГУ,', 'КОТОРЫЙ ЛЕТАЕТ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gs = G.sitter; K.put(cc, TOM, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gs, -1, -gs.sw * 2.0, gs.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gs, 1) }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: { R: passItem } }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); if (tag === 'ui:map') mapView(c, t); else ticketView(c, t); c.restore(); heads = { her: OFFL, sitter: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { sitter: ['TOM', '#E9A23B'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_s: 0.05, hook_h: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('name') && t < narT - 0.1) K.pop(c, t, 'ПРИВЕТ, MINE!', e('name') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'A2' && t > e('comfy') && t < narT - 0.1) K.pop(c, t, 'СПЛЮ!', e('comfy') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 90);
  if (L === 'B2' && t > e('feel') && t < narT - 0.1) K.pop(c, t, 'ХОРОШЕЕ ПРЕДЧУВСТВИЕ!', e('feel') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 60);
  if (L === 'C1' && t > e('pat') && t < narT - 0.1) K.pop(c, t, 'МЫ СРОДНИЛИСЬ!', e('pat') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 70);
  if (L === 'C1' && t > e('stare') && t < narT - 0.05) K.dots(c, t, e('stare') + 0.05, narT - 0.05, 1450);
  if (L === 'C2' && t > e('think') && t < SP.c2_s.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_s.t - 0.05, 1450);
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_s: 0.4, b1_h: 0.05, b1_s: 0.05, b1_h2: 0.4, b2_s: 0.05, c1_s: 0.4, c2_s: 0.3, c2_h2: 0.5, c2_s2: 0.6 } });
  K.hud(c, t, sc);
}
E.run('seat', NF, renderFrame);
