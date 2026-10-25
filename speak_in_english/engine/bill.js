// "The morning after the party: a bill for £1 240" — short TikTok prequel to THE TRIAL (YouTube), hard_cut: node bill.js start end out.mp4 | --png=f1,f2
// Corridor from party.js ("Neighbours"), phone/paper inserts as in wrongchat.js, outro sends viewers to the full episode on YouTube.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, rgba, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/bill/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const INTRO = 0.6;   // short format: level intro plays at 1.15/0.6 speed

// ---------------- cast & layout: the morning after — she is still in the party pyjamas, Rocky in his tank top
const HER = BASE.her_party, ROCKY = BASE.rocky, NANA = BASE.nana;
const G = { her: geom(HER), rocky: geom(ROCKY), nana: geom(NANA) };
const FY = 60, HERX = -300, RX = 380, DOORX = -330, OPEN_W = 380, OPEN_H = 1900, SUMX = 0, SUMY = -1720;
const herHY = FY + G.her.headY, rHY = FY + G.rocky.headY, nHY = FY + G.nana.headY;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const win = (t, a, b, inD = 0.3) => eBack(P(t, a, a + inD), 1.6) * (1 - eIn(P(t, b - 0.22, b)));

// ---------------- corridor (from party.js) + her open front door, prerendered and blurred
const BX0 = -1700, BY0 = -2800, BW = 3600, BH = 3500, BS = 0.5;
function drawCorridor(c) {
  const g = c.createLinearGradient(0, -2800, 0, 0); g.addColorStop(0, '#24403F'); g.addColorStop(1, '#335752'); c.fillStyle = g; c.fillRect(BX0, -2800, BW, 2800);
  c.fillStyle = 'rgba(255,240,210,.05)'; for (let x = BX0; x < BX0 + BW; x += 120) c.fillRect(x, -2500, 40, 1800);
  c.fillStyle = 'rgba(255,240,210,.06)'; for (let x = BX0 + 60, i = 0; x < BX0 + BW; x += 120, i++) for (let y = -2400 + (i % 2) * 90; y < -800; y += 180) { c.beginPath(); c.moveTo(x, y - 26); c.quadraticCurveTo(x + 22, y, x, y + 26); c.quadraticCurveTo(x - 22, y, x, y - 26); c.fill(); }
  c.fillStyle = '#1A2A2A'; c.fillRect(BX0, -2800, BW, 300); c.fillStyle = '#E8DCC8'; c.fillRect(BX0, -2510, BW, 28); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(BX0, -2482, BW, 14);
  const wg = c.createLinearGradient(0, -760, 0, 0); wg.addColorStop(0, '#6A4630'); wg.addColorStop(1, '#4A3020'); c.fillStyle = wg; c.fillRect(BX0, -760, BW, 760);
  c.fillStyle = '#E8DCC8'; c.fillRect(BX0, -790, BW, 34); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(BX0, -756, BW, 10);
  c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 320) c.strokeRect(x + 30, -700, 260, 620);
  const fg = c.createLinearGradient(0, 0, 0, 700); fg.addColorStop(0, '#5A3E2C'); fg.addColorStop(1, '#3A281C'); c.fillStyle = fg; c.fillRect(BX0, 0, BW, 700);
  c.fillStyle = '#8A2E3A'; c.fillRect(BX0, 90, BW, 420); c.fillStyle = '#B8A060'; c.fillRect(BX0, 104, BW, 12); c.fillRect(BX0, 484, BW, 12);
  c.fillStyle = 'rgba(242,193,78,.25)'; for (let x = BX0; x < BX0 + BW; x += 160) { c.beginPath(); c.moveTo(x, 300); c.lineTo(x + 50, 250); c.lineTo(x + 100, 300); c.lineTo(x + 50, 350); c.closePath(); c.fill(); }
  c.fillStyle = '#2E1E14'; c.fillRect(BX0, -40, BW, 40);
  for (const sx of [500, 1500]) { const lg = c.createRadialGradient(sx, -1750, 10, sx, -1750, 420); lg.addColorStop(0, 'rgba(255,214,150,.45)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = lg; c.fillRect(sx - 420, -2170, 840, 840); c.fillStyle = '#C9A06A'; c.fillRect(sx - 10, -1700, 20, 70); c.fillStyle = '#FFE6B0'; c.beginPath(); c.moveTo(sx - 55, -1700); c.lineTo(sx + 55, -1700); c.lineTo(sx + 35, -1800); c.lineTo(sx - 35, -1800); c.closePath(); c.fill(); }
  c.fillStyle = '#D8D2C4'; for (let k = 0; k < 9; k++) { rr(c, 700 + k * 58, -430, 44, 330, 18); c.fill(); }
  // her front door: casing, flat interior (morning light, party leftovers), open leaf, number 12
  const x0 = DOORX; paint(c, q => { q.m(x0 - OPEN_W - 70, -OPEN_H - 80); q.l(x0 + OPEN_W + 70, -OPEN_H - 80); q.l(x0 + OPEN_W + 70, 0); q.l(x0 - OPEN_W - 70, 0); q.z(); }, '#E8DCC8', { sd: 10, hd: 6 });
  const ig = c.createLinearGradient(0, -OPEN_H, 0, 0); ig.addColorStop(0, '#F7D9E3'); ig.addColorStop(1, '#E8B8C8'); c.fillStyle = ig; c.fillRect(x0 - OPEN_W, -OPEN_H, OPEN_W * 2, OPEN_H);
  c.fillStyle = '#FFF4D8'; c.fillRect(x0 - 120, -1650, 300, 420); c.fillStyle = '#BFE3F7'; c.fillRect(x0 - 104, -1634, 268, 388); c.fillStyle = '#FFF4D8'; c.fillRect(x0 + 22, -1634, 16, 388); c.fillRect(x0 - 104, -1450, 268, 14);
  for (let i = 0; i < 5; i++) { c.strokeStyle = ['#EE5E9A', '#F2C14E', '#5BC0EB'][i % 3]; c.lineWidth = 8; c.beginPath(); c.moveTo(x0 - 360 + i * 150, -1880); c.quadraticCurveTo(x0 - 290 + i * 150, -1800, x0 - 220 + i * 150, -1880); c.stroke(); }
  c.fillStyle = '#B9A2D8'; c.fillRect(x0 - OPEN_W, -300, OPEN_W * 2, 300);
  paint(c, q => { q.m(x0 - OPEN_W, -OPEN_H); q.l(x0 - OPEN_W + 110, -OPEN_H + 60); q.l(x0 - OPEN_W + 110, -40); q.l(x0 - OPEN_W, 0); q.z(); }, '#A8324A', { sd: 8, hd: 4 });
  c.fillStyle = '#C9A06A'; rr(c, x0 + OPEN_W + 90, -1720, 110, 70, 12); c.fill(); txt(c, '12', x0 + OPEN_W + 145, -1683, 46, '#2B2F3A');
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGS.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); drawCorridor(c); }
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.5px)'; c.drawImage(BGS, 0, 0); }

// ---------------- props
const phoneItem = (lit = '#9FD3FF', s = 1) => ctx => { ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#2B2F3A'; rr(ctx, -30, -118, 60, 112, 10); ctx.fill(); ctx.fillStyle = lit; rr(ctx, -24, -110, 48, 92, 6); ctx.fill(); ctx.restore(); };
const rollItem = ctx => { paint(ctx, q => { q.m(-70, -40); q.l(70, -40); q.l(70, 0); q.l(-70, 0); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(-70, -24, 140, 4); };
// the long receipt hanging from his hands down to the floor and along it towards her
function receiptStrip(c, x, y, k) { if (k <= 0) return; const len = lerp(0, 1, eOut(k)); c.save(); c.fillStyle = '#FFFDF8'; c.strokeStyle = 'rgba(62,71,30,.5)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(x - 60, y); c.lineTo(x + 60, y); c.lineTo(x + 60, lerp(y, FY - 10, len)); c.quadraticCurveTo(x + 60, FY + 40, x + 10, FY + 40); c.lineTo(lerp(x, HERX + 120, len), FY + 40); c.lineTo(lerp(x, HERX + 120, len), FY + 120); c.lineTo(x - 60, FY + 120); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(43,47,58,.35)'; for (let yy = y + 30; yy < lerp(y, FY - 20, len); yy += 34) c.fillRect(x - 44, yy, 60 + ((yy * 7) % 30), 8); c.restore(); }
function summons(c, k) { if (k <= 0) return; c.save(); c.translate(SUMX, SUMY); c.rotate(0.05); c.scale(lerp(1.3, 1, eOut(k)), lerp(1.3, 1, eOut(k)));
  paint(c, q => { q.m(-120, -160); q.l(120, -160); q.l(120, 160); q.l(-120, 160); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#C23C4A'; c.fillRect(-120, -160, 240, 60);
  txt(c, 'SUMMONS', 0, -129, 34, '#FFFFFF'); txt(c, 'COURT', 0, -50, 40, '#2B2F3A'); txt(c, 'MONDAY', 0, 10, 30, '#2B2F3A'); txt(c, '10:00', 0, 58, 44, '#C23C4A'); txt(c, 'ROOM 2', 0, 112, 26, '#5A606C');
  c.fillStyle = '#9AA3B2'; c.beginPath(); c.arc(0, -150, 9, 0, TAU); c.fill(); c.restore(); }
function pizzaTower(c, n = 6) { for (let i = 0; i < n; i++) { const y = -i * 34; paint(c, q => { q.m(-110, y - 34); q.l(110, y - 34); q.l(110, y); q.l(-110, y); q.z(); }, '#D9A066', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#C23C4A'; c.fillRect(-40, y - 26, 80, 18); } }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'tired', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 330), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330) };
  gest(st, g, 'her', t, 1, 200);
  if (L === 'hook') { st.mood = t < 0.7 ? 'tired' : 'shock'; st.lookY = 0.45; st.look = 0.5; }
  if (L === 'A1') { st.mood = speaking('a1_her', t, 0.1) ? 'annoyed' : 'worried'; if (speaking('a1_her', t, 0.05)) st.armL = reach(g, -1, -g.sw * 0.3, g.headY + 260); if (t > ev('photo') + 0.3) st.mood = 'shock'; }
  if (L === 'A2') { st.mood = speaking('a2_her', t, 0.1) ? 'angry' : 'worried'; if (t > SP.a2_x.t + 0.6) st.mood = 'tired'; }
  if (L === 'B1') { st.mood = speaking('b1_her', t, 0.1) ? 'neutral' : 'worried'; if (t > ev('receipt') + 0.6) st.mood = 'shock'; }
  if (L === 'B2') { st.mood = speaking('b2_her', t, 0.1) ? 'annoyed' : 'skeptical'; if (t > ev('slap')) { st.mood = 'shock'; st.look = 0.9; st.lookY = -0.2; } }
  if (L === 'C1') { st.mood = speaking('c1_her', t, 0.1) ? 'happy' : 'neutral'; if (speaking('c1_her', t)) st.armR = reach(g, 1, g.sw * 0.2, g.ySh + 150); if (t > ev('cal')) st.mood = 'sad'; }
  if (L === 'C2') { const sp = speaking('c2_her', t, 0.1); st.mood = sp ? 'smug' : 'worried'; if (sp) { st.tilt = -0.03; st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 140); }
    if (t > ev('nana')) { st.mood = 'surprised'; st.look = 1; } if (t > ev('turn2')) { st.mood = 'skeptical'; st.turn = 0.45; st.look = 1; st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 260); } }
  return st; }
function rockyState(t, L) { const g = G.rocky, st = { t, talk: talk('rocky', t), mood: 'smug', turn: -0.35, look: -0.8, armL: reach(g, -1, -g.sw * 0.8, g.ySh + 380), armR: reach(g, 1, g.sw * 0.6, g.ySh + 380), items: { R: rollItem } };
  gest(st, g, 'rocky', t, -1, 220);
  const holdStrip = () => { st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 170); st.armR = reach(g, 1, g.sw * 0.1, g.ySh + 170); st.items = {}; };
  if (L === 'hook') { holdStrip(); st.mood = 'angry'; }
  if (L === 'A1') { const p = ev('photo'); if (t > p - 0.3 && t < SP.a1_nar.t + 0.3) { st.armL = reach(g, -1, -g.sw * 2.2, g.ySh + 60); st.items = { L: phoneItem('#FFFFFF', 1.2), R: rollItem }; } }
  if (L === 'A2') { if (speaking('a2_x', t, 0.1, 0.4)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 120); } }
  if (L === 'B1') { if (t > ev('receipt') - 0.3) { holdStrip(); st.lookY = 0.3; st.look = -0.3; st.mood = 'skeptical'; } if (t > endOf('b1_x')) { st.lookY = 0; st.look = -0.8; st.mood = 'smug'; } }
  if (L === 'B2') { const s = ev('slap'); if (t > s - 0.35 && t < s + 0.3) { st.armL = reach(g, -1, SUMX - RX, SUMY - FY + 120); st.mood = 'angry'; } if (t > s + 0.3) st.mood = 'smug'; }
  if (L === 'B2' || L === 'C1' || L === 'C2') { }
  if (L === 'C1') { if (speaking('c1_x', t, 0.1, 0.5)) { st.mood = 'happy'; st.armL = reach(g, -1, SUMX - RX + 40, SUMY - FY + 220); } }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'bored' : 'smug'; if (speaking('c2_x', t, 0.1, 0.3)) st.mood = 'smug'; if (t > ev('nana')) { st.mood = 'surprised'; st.turn = 0.35; st.look = 0.8; } }
  return st; }
// Nana walks in from the right with a tower of pizza boxes (C2)
function nanaX(t) { const a = ev('nana'); return lerp(1350, 830, eOut(P(t, a - 0.5, a + 0.35))); }
function nanaState(t) { const g = G.nana, a = ev('nana'), walking = t < a + 0.35;
  return { t, talk: talk('nana', t), mood: 'happy', turn: -0.35, look: -0.8, legPose: walking ? 'walk' : 'stand', walkT: t * 2.2, armL: reach(g, -1, -g.sw * 0.7, g.ySh + 250), armR: reach(g, 1, g.sw * 0.7, g.ySh + 250),
    afterTorso: cc => { cc.save(); cc.translate(0, g.ySh + 300); pizzaTower(cc, 7); cc.restore(); } }; }

// ---------------- world
const headOf = (who, x) => ({ x, y: FY + G[who].headY, hh: G[who].hh });
function world(c, t, L, solo) {
  c.drawImage(BGB, BX0, BY0, BW, BH); const heads = {};
  const sumK = L === 'B2' ? P(t, ev('slap'), ev('slap') + 0.12) : (L === 'C1' || L === 'C2') ? 1 : 0;
  if (solo !== 'her') summons(c, sumK);
  heads.rocky = solo === 'her' ? headOf('rocky', RX) : put(c, ROCKY, rockyState(t, L), RX, FY);
  if (solo !== 'her' && (L === 'hook' || (L === 'B1' && t > ev('receipt') - 0.3))) receiptStrip(c, RX - G.rocky.sw * 0.25, FY + G.rocky.ySh + 190, L === 'hook' ? P(t, 0.1, 0.7) : P(t, ev('receipt') - 0.3, ev('receipt') + 0.2));
  heads.her = solo === 'rocky' ? headOf('her', HERX) : put(c, HER, herState(t, L), HERX, FY);
  if (L === 'C2' && t > ev('nana') - 0.5 && !solo) { const x = nanaX(t); heads.nana = put(c, NANA, nanaState(t), x, FY); }
  else heads.nana = headOf('nana', 830);
  return heads;
}

// ---------------- camera (hard_cut)
const SH = { WIDE: { x: 40, y: -1000, z: 0.72, r: 0 }, CARD: { x: 40, y: -1640, z: 0.64, r: 0 }, HOOK: { x: 40, y: -1350, z: 0.7, r: 0 },
  HER: { x: HERX + 120, y: herHY + 60, z: 1.0, r: 0, tag: 'her' }, ROCKY: { x: RX - 120, y: rHY + 60, z: 0.95, r: 0, tag: 'rocky' },
  HER_R: { x: HERX + 60, y: herHY - 160, z: 1.05, r: 0, tag: 'her' }, ROCKY_R: { x: RX - 60, y: rHY - 150, z: 0.98, r: 0, tag: 'rocky' },
  SUM: { x: 40, y: -1420, z: 0.8, r: 0 }, TRIO: { x: 230, y: -1050, z: 0.6, r: 0 } };
function chunkT(id, i) { const ch = TL.cfg.chunks[id], sp = SP[id], n = ch.slice(0, i).reduce((a, [en]) => a + en.trim().split(/\s+/).length, 0); return sp.words && sp.words[n] ? sp.t + sp.words[n][1] : sp.t + sp.d * i / ch.length; }
function shotFor(t) { const sc = sceneAt(t), L = sc.id; if (L === 'outro') return SH.WIDE; if (L === 'hook') return SH.HOOK;
  const u = t - sc.s; if (u < INTRO) return { ...SH.WIDE, force: true };
  const l = L.toLowerCase(), nar = SP[l + '_nar'], f = s => ({ ...s, force: true });
  if (nar && t >= nar.t - 0.1) return f(L === 'C2' ? SH.TRIO : SH.CARD);
  if (L === 'B1' && t > ev('receipt') - 0.35 && t < SP.b1_x.t) return f(SH.WIDE);                    // the receipt unrolls
  if (L === 'B2' && t > ev('slap') - 0.4) return f(SH.SUM);                                          // the summons on her door
  if (L === 'C1' && t > ev('cal') - 0.1) return f(SH.SUM);
  if (L === 'C2') { if (speaking('c2_her', t, 0.1, 0.25)) { if (t > chunkT('c2_her', 1) - 0.1 && t < chunkT('c2_her', 2) - 0.1) return f(SH.ROCKY_R); return f(SH.HER); }
    if (t > ev('nana') - 0.55) return f(SH.TRIO);                                                    // Nana walks in with the pizza boxes
    if (t < SP.c2_x.t - 0.1) return f(SH.WIDE); }                                                    // the silence
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  if (cur) return f(cur.who === 'her' ? SH.HER : SH.ROCKY);
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, cam.tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts
const PH = { x: 540, y: 1080, s: 1.2 }, ZM = 1.3;
const zoom = fn => (c, w, h) => { c.save(); c.scale(ZM, ZM); fn(c, w / ZM, h / ZM); c.restore(); };
function backdrop(c, k) { c.save(); c.globalAlpha = clamp(k * 4); const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#3B3550'); g.addColorStop(1, '#1F1B2C'); c.fillStyle = g; c.fillRect(0, 0, W, HH); c.restore(); }
function banner(c, k, en, col, ru, y = 1515) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(-0.025); c.scale(k, k); const hh = ru ? 132 : 112;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -480 + 8, -hh / 2 + 10, 960, hh, 26); c.fill(); c.fillStyle = col; rr(c, -480, -hh / 2, 960, hh, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -480, -hh / 2, 960, hh, 26); c.stroke();
  UI.textFit(c, 'Unb9', 54, en, 880); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(en, 0, ru ? -18 : 2); if (ru) fitTxt(c, ru, 0, 38, 30, '#FFFFFF', 900, 'Nun9'); c.restore(); }
// photo on Rocky's phone: his bath with her giant flamingo in it
function bathPhoto(t) { return (c, w, h) => { c.fillStyle = '#DCEFF5'; c.fillRect(0, 0, w, h); c.fillStyle = '#FFFFFF'; for (let x = 0; x < w; x += 40) for (let y = 0; y < h * 0.55; y += 40) { c.strokeStyle = 'rgba(120,160,180,.35)'; c.lineWidth = 2; c.strokeRect(x, y, 40, 40); }
  c.fillStyle = '#FFFFFF'; rr(c, 10, h * 0.5, w - 20, h * 0.3, 40); c.fill(); c.fillStyle = '#8FD3F7'; rr(c, 26, h * 0.5 + 14, w - 52, 60, 24); c.fill();
  const bob = Math.sin(t * 3) * 6; c.save(); c.translate(w / 2, h * 0.5 + 20 + bob); c.fillStyle = '#F27EA9'; c.beginPath(); c.ellipse(0, 0, 120, 46, 0, 0, TAU); c.fill(); c.strokeStyle = '#F27EA9'; c.lineWidth = 30; c.lineCap = 'round'; c.beginPath(); c.moveTo(70, -10); c.quadraticCurveTo(130, -120, 80, -190); c.stroke();
  c.beginPath(); c.arc(70, -200, 30, 0, TAU); c.fillStyle = '#F27EA9'; c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(48, -200); c.lineTo(10, -186); c.lineTo(50, -180); c.fill(); c.beginPath(); c.arc(78, -208, 6, 0, TAU); c.fill(); c.restore();
  c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, h - 70, w, 70); txt(c, 'my bath. 7:02 AM', 18, h - 35, 22, '#FFFFFF', 'Nun9', 'left'); }; }
function receiptCard(c, k, t) { if (k <= 0) return; backdrop(c, k); c.save(); c.translate(540, 1000 + (1 - eOut(k)) * 300); c.rotate(-0.03); const w = 640, h = 900;
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -w / 2 + 12, -h / 2 + 16, w, h, 12); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -w / 2, -h / 2, w, h, 12); c.fill();
  txt(c, 'PARTY DELIVERY', 0, -h / 2 + 70, 40, '#2B2F3A'); txt(c, 'Flat 12 · 03:14 AM', 0, -h / 2 + 120, 26, '#7A8290', 'Nun8');
  const rows = [['40 × PIZZA', '£720'], ['1 × GIANT FLAMINGO', '£180'], ['1 × FIRE EXTINGUISHER', '£340']];
  rows.forEach(([a, b], i) => { const y = -h / 2 + 210 + i * 70; txt(c, a, -w / 2 + 40, y, 30, '#2B2F3A', 'Nun9', 'left'); txt(c, b, w / 2 - 40, y, 30, '#2B2F3A', 'Nun9', 'right'); });
  c.fillStyle = '#2B2F3A'; c.fillRect(-w / 2 + 40, -h / 2 + 410, w - 80, 4); txt(c, 'TOTAL', -w / 2 + 40, -h / 2 + 470, 44, '#2B2F3A', 'Unb9', 'left'); txt(c, '£1 240', w / 2 - 40, -h / 2 + 470, 52, '#C23C4A', 'Unb9', 'right');
  const hk = eOut(P(t, ev('receipt') + 0.7, ev('receipt') + 1.1)); c.fillStyle = rgba('#EE5E9A', 0.45); c.fillRect(-w / 2 + 30, -h / 2 + 560, (w - 60) * hk, 70); txt(c, 'CUSTOMER: MS NO MUSIC', 0, -h / 2 + 596, 34, '#2B2F3A');
  c.strokeStyle = 'rgba(43,47,58,.4)'; c.setLineDash([10, 10]); c.lineWidth = 3; c.beginPath(); c.moveTo(-w / 2 + 40, -h / 2 + 690); c.lineTo(w / 2 - 40, -h / 2 + 690); c.stroke(); c.setLineDash([]);
  for (let i = 0; i < 22; i++) { c.fillStyle = '#2B2F3A'; c.fillRect(-200 + i * 18, -h / 2 + 730, i % 3 ? 8 : 4, 90); } c.restore(); }
function overlays(c, t, L) {
  if (L === 'A1') { const p = ev('photo'), k = win(t, p - 0.05, SP.a1_nar.t - 0.1); if (k > 0) { backdrop(c, k); c.save(); c.globalAlpha = clamp(k * 2); K.phone(c, PH.x, PH.y + (1 - k) * 260, PH.s * lerp(0.6, 1, k), zoom(bathPhoto(t))); c.restore(); }
    banner(c, k * eBack(P(t, p + 0.4, p + 0.7), 2), 'ФЛАМИНГО В ЕГО ВАННЕ', '#EE5E9A', 'фото из квартиры Рокки, 7:02 утра'); }
  if (L === 'B1') { const r = ev('receipt'), k = win(t, SP.b1_x.t - 0.05, SP.b1_nar.t - 0.1); receiptCard(c, k, t); }
}

// ---------------- hook, outro & frame
function hookReceipt(c, t) { const k = 1; c.save(); c.translate(540, 1480); c.rotate(-0.04 + Math.sin(t * 2) * 0.01); const w = 760, h = 300;
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -w / 2 + 12, -h / 2 + 16, w, h, 14); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -w / 2, -h / 2, w, h, 14); c.fill();
  c.fillStyle = '#FFFDF8'; for (let i = 0; i < 19; i++) { c.beginPath(); c.moveTo(-w / 2 + i * 40, h / 2 - 2); c.lineTo(-w / 2 + i * 40 + 20, h / 2 + 20); c.lineTo(-w / 2 + i * 40 + 40, h / 2 - 2); c.fill(); }
  txt(c, '40 PIZZA · FLAMINGO · EXTINGUISHER', 0, -h / 2 + 50, 26, '#7A8290', 'Nun9'); c.fillStyle = '#2B2F3A'; c.fillRect(-w / 2 + 40, -h / 2 + 84, w - 80, 4);
  const pk = 1 + 0.04 * Math.sin(t * 7); c.save(); c.translate(0, 30); c.scale(pk, pk); txt(c, 'TOTAL £1 240', 0, 0, 92, '#C23C4A'); c.restore(); txt(c, 'Flat 13 · 03:14 AM', 0, h / 2 - 40, 26, '#7A8290', 'Nun8'); c.restore(); }
function hookRibbon(c, t) { const rk = lerp(0.95, 1, eBack(P(t, 0, 0.3), 1.8)) * (1 + 0.012 * Math.sin(t * 5)); c.save(); c.translate(540, 430); c.rotate(-0.05); c.scale(rk, rk);
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -500 + 10, -120 + 14, 1000, 240, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -500, -120, 1000, 240, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; const L0 = TL.cfg.hook_title; UI.textFit(c, 'Unb9', 66, L0[0][0], 900); c.fillStyle = C.oliveD; c.fillText(L0[0][0], 0, -50); UI.textFit(c, 'Unb9', 110, L0[1][0], 920); UI.strokeText(c, L0[1][0], 0, 46, C.pink, C.white, 12); c.restore(); }
function drawHook(c, t) { const cam = CAM[Math.min(CAM.length - 1, Math.round(t * FPS))]; drawWorld(c, t, 'hook', cam); Hq.vignette(c, W, HH, 0.3); hookReceipt(c, t); hookRibbon(c, t); UI.watermark(c); }
function ytBadge(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#FF0033'; rr(c, -60, -42, 120, 84, 24); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-16, -22); c.lineTo(26, 0); c.lineTo(-16, 22); c.closePath(); c.fill(); c.restore(); }
function fastIntro(c, t, sc) { if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(sc.id)) return; UI.levelIntro(c, sc.s + (t - sc.s) * 1.15 / INTRO, sc); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['ЧЕМ ЗАКОНЧИЛСЯ СУД?', 'ПОЛНАЯ СЕРИЯ НА YOUTUBE'], qSize: 50, rows: [['B1', "There's been a mistake."], ['B2', 'Tell it to the judge.'], ['C1', 'Could we sort this out?']], cta: ['ССЫЛКА НА YOUTUBE', 'В ПРОФИЛЕ'],
      hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 1.5 + Math.sin(tt * 8) * 40, G.her.headY - 200), armR: reach(G.her, 1, G.her.sw * 1.0, G.her.ySh + 300) }, 0, 0) });
    const u = t - SC.outro.s, q = eBack(P(u, 0.15, 0.5), 2.2); if (q > 0) { c.save(); c.translate(540, 165); c.scale(q, q); ytBadge(c, -330, 0, 0.8); UI.font(c, 'Unb9', 40); c.textAlign = 'left'; c.textBaseline = 'middle'; UI.strokeText(c, 'ССЫЛКА В ПРОФИЛЕ', -270, 2, C.oliveD, C.white, 12); c.restore(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  overlays(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { rocky: ['ROCKY', '#E0474C'], nana: ['NANA', '#C2504A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'B2') K.pop(c, t, 'ПОВЕСТКА В СУД!', ev('slap') + 0.1, SP.b2_nar.t - 0.15, 540, 1420, C.gold, -0.06, 70);
  if (sc.id === 'C1') K.pop(c, t, 'ПОНЕДЕЛЬНИК · 10:00', ev('cal') + 0.05, SP.c1_nar.t - 0.15, 540, 1420, C.white, -0.05, 64);
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); fastIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('bill', NF, renderFrame);
