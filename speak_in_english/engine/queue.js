// "How to say 'I was here first'" episode renderer (hard_cut camera): node queue.js start end out.mp4 | --png=f1,f2
// Cinema box office: Anna (mustard cardigan) waits behind a man who stepped in front of the ticket window; a line of three people stands behind her.
// Shots tagged 'ui:<view>' (queue, black) replace the world with a full-screen insert.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/queue/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_market };
const MAN = { ...BASE.ben, top: { type: 'blazer', col: '#6A3C5A', shirt: '#F7F9FC', tie: '#F2C14E' } };
const EXTRA = [BASE.priya, BASE.jay, BASE.nana];
const G = { her: geom(HER), cutter: geom(MAN) }; EXTRA.forEach((q, i) => { G['e' + i] = geom(q); });
const HX = -380, MX = 430, EXX = [-900, -1330, -1760];       // her / man feet x; the line behind her
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const cornItem = ctx => { ctx.fillStyle = '#E0474C'; ctx.beginPath(); ctx.moveTo(-60, -130); ctx.lineTo(60, -130); ctx.lineTo(44, 0); ctx.lineTo(-44, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFFDF8'; for (let i = -1; i <= 1; i++) ctx.fillRect(i * 30 - 6, -130, 12, 130);
  ctx.fillStyle = '#FFF4C2'; for (const [x, y, r] of [[-40, -150, 26], [0, -168, 30], [40, -150, 26], [-20, -190, 22], [24, -196, 22]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } };
const ticketItem = ctx => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#FFE15A'; rr(ctx, -70, -110, 140, 110, 8); ctx.fill(); fitTxt(ctx, 'TICKET', 0, -55, 30, '#2B2F3A', 120); ctx.restore(); };

// ---------------- cinema lobby (prerendered, softly blurred); the box office window + its OPEN / SOLD OUT sign are drawn live
const BX0 = -2400, BY0 = -3400, BW = 4800, BH = 4800, BS = 0.5;
function drawLobby(c) {
  c.fillStyle = '#2B2340'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#3A2F57'; c.fillRect(BX0, -1250, BW, 990); c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 240) { c.beginPath(); c.moveTo(x, -1250); c.lineTo(x, -260); c.stroke(); }
  for (const [x, col, t1, t2] of [[-1700, '#E0474C', 'GALAXY', 'WARS 7'], [-900, '#3C8FE0', 'LOVE IN', 'LONDON'], [-100, '#7CC45A', 'THE', 'HEIST']]) { c.fillStyle = '#FFFDF8'; rr(c, x - 270, -2450, 540, 760, 14); c.fill(); c.fillStyle = col; rr(c, x - 240, -2420, 480, 560, 10); c.fill(); fitTxt(c, t1, x, -2150, 82, '#FFFDF8', 440); fitTxt(c, t2, x, -2040, 82, '#FFFDF8', 440); fitTxt(c, 'NOW SHOWING', x, -1760, 44, '#2B2F3A', 460, 'Nun9'); }
  c.fillStyle = '#F2C14E'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(BX0 + 100 + i * 190, -2620, 22, 0, TAU); c.fill(); }          // marquee bulbs
  c.fillStyle = '#6A1E2E'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(255,255,255,.07)'; for (let y = -260; y < 1400; y += 120) for (let x = BX0 + ((y / 120) % 2) * 60; x < BX0 + BW; x += 120) c.fillRect(x, y, 60, 60);
  // box office booth
  c.fillStyle = '#4A3A6A'; rr(c, 640, -2300, 900, 2040, 20); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, 700, -1900, 780, 600, 14); c.fill(); c.fillStyle = '#F2C14E'; rr(c, 720, -1880, 740, 560, 10); c.fill(); c.fillStyle = '#FFF4C2'; rr(c, 740, -1860, 700, 520, 8); c.fill();
  c.fillStyle = '#8A8480'; rr(c, 700, -1260, 780, 70, 10); c.fill(); fitTxt(c, 'TICKETS', 1090, -2150, 130, '#F2C14E', 820);
  // rope stanchions
  c.strokeStyle = '#E0474C'; c.lineWidth = 16; c.beginPath(); for (const [i, x] of [-1500, -700, 100].entries()) { c.moveTo(x, -430); c.lineTo(x, -430); } c.stroke(); for (const x of [-1500, -700, 100]) { c.fillStyle = '#F2C14E'; c.fillRect(x - 10, -640, 20, 640); c.beginPath(); c.arc(x, -650, 28, 0, TAU); c.fill(); } c.strokeStyle = '#E0474C'; c.lineWidth = 14; c.beginPath(); c.moveTo(-1500, -650); c.quadraticCurveTo(-1100, -520, -700, -650); c.quadraticCurveTo(-300, -520, 100, -650); c.stroke();
  c.fillStyle = '#FFFDF8'; rr(c, -2300, -1500, 560, 200, 16); c.fill(); fitTxt(c, 'QUEUE STARTS', -2020, -1440, 60, '#E0474C', 500); fitTxt(c, 'HERE  →', -2020, -1350, 60, '#2B2F3A', 500);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawLobby);
const sold = t => t > ev('C2', 'sold');
function windowSign(c, t) { const s = sold(t), k = s ? eBack(P(t, ev('C2', 'sold'), ev('C2', 'sold') + 0.3), 2) : 1; c.save(); c.translate(1090, -1590); c.scale(k, k); c.fillStyle = s ? '#E0474C' : '#4CAF6A'; rr(c, -300, -90, 600, 180, 24); c.fill(); c.strokeStyle = '#FFFDF8'; c.lineWidth = 8; c.stroke(); fitTxt(c, s ? 'SOLD OUT' : 'OPEN', 0, 6, s ? 110 : 130, '#FFFFFF', 540); c.restore(); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'bored', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'tired'; if (t > hev('panic') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 20, { planar: true }); } if (t > e('fine') - 0.3) { st.mood = 'surprised'; st.armL = hang(g, -1); } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 80, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 80, { planar: true, fist: true }); } if (t > e('together') - 0.1) { st.mood = 'shock'; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 2.1, g.ySh - 40, { planar: true }); } if (speaking('b1_h2', t, 0.05, 0.4)) st.mood = 'bored'; }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'angry'; gest(st, g, 'her', t, -1, 150); } if (t > e('short') - 0.05) { st.mood = 'annoyed'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'worried'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (t > e('stare') - 0.05) { st.mood = 'annoyed'; st.blink = 0; st.armL = hang(g, -1); } }
  if (L === 'C2') { st.mood = 'angry'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (t > SP.c2_c.t) st.mood = 'happy'; if (t > e('sold') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); }
    if (speaking('c2_h2', t, 0.05, 0.6)) { st.mood = 'sad'; st.blink = 1; } }
  return st; }
function manState(t, L) { const g = G.cutter, e = k => ev(L, k), st = { t, talk: talk('cutter', t), mood: 'happy', turn: 0.1, look: 0.4, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0 };
  if (L === 'hook') { st.mood = 'smug'; if (t > hev('panic') - 0.05) { st.turn = -0.4; st.look = -0.7; st.mood = 'surprised'; } }
  if (L === 'A1') { st.turn = -0.35; st.look = -0.8; st.mood = 'surprised'; if (t > e('fine') - 0.3) { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 40, { planar: true }); } }
  if (L === 'A2') { st.turn = -0.35; st.look = -0.8; st.mood = 'happy'; if (t > e('together') - 0.3) { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 100, { planar: true }); st.laugh = true; } }
  if (L === 'B1') { st.turn = -0.35; st.look = -0.8; st.mood = 'surprised'; if (speaking('b1_c', t, 0.05, 0.3)) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 40, { planar: true }); } }
  if (L === 'B2') { st.turn = -0.35; st.look = -0.8; st.mood = 'neutral'; if (t > e('short') - 0.3) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.5, g.ySh - 60, { planar: true }); } }
  if (L === 'C1') { st.turn = -0.35; st.look = -0.8; st.mood = 'neutral'; if (t > e('corn') - 0.2) { st.items = { L: cornItem }; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 60); st.mood = 'happy'; } }
  if (L === 'C2') { st.turn = -0.35; st.look = -0.8; st.mood = 'neutral'; if (t > ev('C2', 'think') - 0.05) { st.mood = 'neutral'; st.blink = 0; } if (speaking('c2_c', t, 0.05, 0.1)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.8, g.ySh + 20, { planar: true }); }
    if (t > e('sold') - 0.05) { st.items = { R: ticketItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 20); st.mood = 'worried'; } if (speaking('c2_c2', t, 0.05, 0.5)) { st.mood = 'sad'; st.lookY = 0.3; } }
  return st; }
function extraState(i, t, L) { const g = G['e' + i]; return { t: t + i * 0.8, mood: i === 1 ? 'tired' : 'bored', turn: 0.3, look: 0.6, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: Math.sin(t * 2 + i) * 4 }; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'cutter', 'line'], card: ['her', 'cutter', 'line'], two: ['her', 'cutter'], her: ['her'], cutter: ['cutter'], cover: ['her', 'cutter', 'line'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH); windowSign(c, t);
  if (who.includes('line')) EXTRA.forEach((cfg, i) => K.put(c, cfg, extraState(i, t, L), EXX[i], 0));
  if (who.includes('cutter')) heads.cutter = K.put(c, MAN, manState(t, L), MX, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (!heads.cutter) heads.cutter = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, mHY = G.cutter.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(120, fy((hHY + mHY) / 2, 0.75, 1120), 0.75, 'cover'), WIDE: S(-80, -1000, 0.5, 'wide'), CARD: S(-30, fy(mHY, 0.66, 980), 0.66, 'card'), TWO: S(20, fy(mHY, 0.75, 820), 0.75, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'), HER_H: S(HX + 40, fy(hHY, 1.35, 1280), 1.35, 'her'),
  MAN: S(MX - 30, fy(mHY, 1.0), 1.0, 'cutter'), MAN_H: S(MX - 30, fy(mHY, 1.0, 1230), 1.0, 'cutter'), MAN_CU: S(MX - 30, fy(mHY, 1.6, 960), 1.6, 'cutter'),
  QUEUE: U('queue', 1), BLACK: U('black', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_c.t - 0.12) return SH.COVER; if (t < hev('panic') - 0.05) return f(SH.MAN_H); if (t < SP.hook.t - 0.1) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('fine') - 0.05) return f(SH.WIDE);
  if (L === 'A2' && t > e('together') - 0.05) return f(SH.WIDE);
  if (L === 'B1' && t > e('queue') - 0.05 && t < SP.b1_h2.t - 0.1) return f(SH.QUEUE);
  if (L === 'B2' && t > e('short') - 0.05) return f(SH.WIDE);
  if (L === 'C1' && t > e('corn') - 0.05 && !sp('c1_c')) return f(SH.WIDE);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU][i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.9) return f(SH.WIDE); if (t >= e('think') + 0.9 && t < SP.c2_c.t - 0.1) return f(SH.MAN_CU);
    if (t > e('sold') - 0.05 && t < SP.c2_c2.t - 0.1) return f(SH.WIDE); if (sp('c2_h2')) return f(SH.HER_CU); if (sp('c2_c2')) return f(SH.MAN_CU); if (sp('c2_c')) return f(SH.MAN); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.MAN;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen insert: the long line behind her (a row of heads, a clock, "40 MIN")
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function caption(c, s, k = 1, y = 1530, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }
function queueView(c, t) { backdrop(c, 'queue'); const a = ev('B1', 'queue'), k = eBack(P(t, a, a + 0.3), 1.6);
  c.save(); c.translate(540, 1000); c.scale(k, k);
  const cols = ['#EE5E9A', '#3FB6A8', '#F2C14E', '#7FB0D8', '#B9A2E6', '#E0474C', '#7CC45A', '#E9A23B'];
  for (let i = 0; i < 16; i++) { const x = -420 + (i % 8) * 120, y = -140 + Math.floor(i / 8) * 270 + Math.sin(t * 3 + i) * 5, col = cols[i % 8]; c.fillStyle = col; rr(c, x - 44, y + 40, 88, 120, 30); c.fill(); c.fillStyle = '#F2C9A8'; c.beginPath(); c.arc(x, y, 40, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x - 14, y - 4, 5, 0, TAU); c.arc(x + 14, y - 4, 5, 0, TAU); c.fill(); }
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(-250, 390, 110, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.stroke(); c.beginPath(); c.moveTo(-250, 390); c.lineTo(-250, 310); c.moveTo(-250, 390); c.lineTo(-195, 420); c.stroke();
  fitTxt(c, '40 MIN', 150, 390, 120, '#E0474C', 560); c.restore();
  caption(c, '«Я ДУМАЛ, ЭТО ФАН-КЛУБ»', clamp(P(t, a + 0.3, a + 0.5)), 1560); }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'I WAS HERE FIRST!', 0, 4, 52, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ СКАЗАЛ', 'ТОМУ, КТО ВЛЕЗ?'], rows: [['A2', 'Excuse me, I was here first.'], ['B1', 'The line starts back there.'], ['B2', 'Excuse me, you just cut in line.'], ['C1', 'Go to the back of the line.']], cta: ['ОТПРАВЬ ТОМУ,', 'КТО ЛЕЗЕТ ВПЕРЁД'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gm = G.cutter; K.put(cc, MAN, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gm, -1, -gm.sw * 2.0, gm.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gm, 1), items: { R: cornItem } }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: { R: ticketItem } }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); queueView(c, t); c.restore(); heads = { her: OFFL, cutter: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { cutter: ['MAN', '#6A3C5A'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_c: 0.05, hook_h: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('fine') && t < narT - 0.1) K.pop(c, t, 'У НЕГО ВСЁ ОТЛИЧНО!', e('fine') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 70);
  if (L === 'A2' && t > e('together') && t < narT - 0.1) K.pop(c, t, 'СТОЯТЬ ВМЕСТЕ?!', e('together') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 76);
  if (L === 'B2' && t > e('short') && t < narT - 0.1) K.pop(c, t, 'ЭТО ШОРТКАТ!', e('short') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'C1' && t > e('corn') && t < SP.c1_nar.t - 0.1 && !speaking('c1_c', t, 0, 0)) K.pop(c, t, 'ПОПКОРН ВЫБРАН!', e('corn') + 0.05, SP.c1_nar.t - 0.2, 540, 1330, C.gold, -0.06, 76);
  if (L === 'C1' && t > e('stare') && t < narT - 0.05) K.dots(c, t, e('stare') + 0.05, narT - 0.05, 1450);
  if (L === 'C2' && t > e('think') && t < SP.c2_c.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_c.t - 0.05, 1450);
  if (L === 'C2' && t > e('sold') && t < SP.c2_c2.t - 0.05) K.pop(c, t, 'БИЛЕТОВ НЕТ!', e('sold') + 0.1, SP.c2_c2.t - 0.1, 540, 1330, C.gold, -0.06, 84);
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_c: 0.4, b1_h: 0.05, b1_c: 0.05, b1_h2: 0.4, b2_c: 0.4, c1_c: 0.4, c2_c: 0.3, c2_c2: 0.5, c2_h2: 0.6 } });
  K.hud(c, t, sc);
}
E.run('queue', NF, renderFrame);
