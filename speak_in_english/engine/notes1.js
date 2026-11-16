// «Записки от соседа» — story in the 2nd person (choose what happens next), dark night look, hard_cut camera: node notes1.js start end out.mp4 | --png=f1,f2
// A London studio flat at night (door with a gap at the bottom, bed against the shared wall, fridge with a shopping list, a digital clock).
// Notes slide under the door: "Please be quiet." / "They can hear you." / "Don't answer if they knock." The landlady: flat 4B has been empty for 3 years.
// 03:00 — three knocks on the wall, a whisper "Sonya… we know you're awake." Twist: the handwriting on the notes is hers. Fork: knock back or stay silent.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/notes1/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function hand(c, s, x, y, size, col, maxW, align = 'center') { c.save(); c.font = `italic ${size}px Nun9`; let w = c.measureText(s).width; if (w > maxW) { c.font = `italic ${size * maxW / w}px Nun9`; } c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); c.restore(); }

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'longsleeve', col: '#B9A8E0' }, bottom: { type: 'trousers', col: '#8E7AB8' } };
const G = { her: geom(HER) };
const OX = { flat: 0, hall: 20000 };
const LOC = { hook: 'flat', night2: 'flat', morning: 'hall', night3: 'flat', twist: 'flat', fork: 'flat' };
const XH = 250, DOORX = -1500, WALLX = 1500;

// ---------------- backgrounds
const BX0 = -2800, BY0 = -4400, BW = 5600, BH = 5600, BS = 0.5;
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.2px)'; d.drawImage(a, 0, 0); return b; };
function drawFlat(c) {
  c.fillStyle = '#2E3550'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.04)'; for (let x = BX0; x < BX0 + BW; x += 140) c.fillRect(x, BY0, 50, BH);
  // window with the night city (centre-left)
  c.fillStyle = '#1C2236'; c.fillRect(-700, -3200, 900, 1300); c.fillStyle = '#121828'; c.fillRect(-660, -3160, 820, 1220);
  c.fillStyle = '#1E2A44'; for (const [x, w, h] of [[-640, 180, 600], [-430, 220, 820], [-180, 160, 500], [0, 140, 700]]) c.fillRect(x, -1940 - h, w, h);
  c.fillStyle = 'rgba(255,214,140,.55)'; for (let i = 0; i < 14; i++) c.fillRect(-620 + (i * 97) % 760, -2500 + (i * 151) % 520, 26, 34);
  c.fillStyle = '#E9E4D0'; c.beginPath(); c.arc(60, -2950, 60, 0, TAU); c.fill();
  c.fillStyle = '#1C2236'; c.fillRect(-255, -3160, 20, 1220); c.fillRect(-660, -2560, 820, 20);
  // the door (left) with a light gap underneath
  c.fillStyle = '#4A3A30'; c.fillRect(DOORX - 380, -2500, 760, 2500); c.fillStyle = '#5E4A3C'; c.fillRect(DOORX - 330, -2450, 660, 2440);
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 10; c.strokeRect(DOORX - 270, -2350, 540, 900); c.strokeRect(DOORX - 270, -1300, 540, 1100);
  c.fillStyle = '#C9A85A'; c.beginPath(); c.arc(DOORX + 230, -1250, 30, 0, TAU); c.fill(); c.fillRect(DOORX - 60, -1900, 120, 40);   // knob + peephole plate
  c.fillStyle = 'rgba(255,220,150,.75)'; c.fillRect(DOORX - 330, -14, 660, 14);
  // the shared wall (right) with a framed picture; bed against it
  c.fillStyle = '#343C5A'; c.fillRect(800, BY0, 2000, BH); c.fillStyle = '#6A5A40'; c.fillRect(1300, -2600, 520, 400); c.fillStyle = '#3E4E6E'; c.fillRect(1340, -2560, 440, 320);
  c.fillStyle = '#5A6A8A'; c.beginPath(); c.moveTo(1340, -2240); c.lineTo(1500, -2420); c.lineTo(1620, -2300); c.lineTo(1780, -2460); c.lineTo(1780, -2240); c.fill();
  paint(c, q => { q.m(900, -620); q.l(2700, -620); q.l(2700, 0); q.l(900, 0); q.z(); }, '#4A4E70', { sd: 8, hd: 4, lw: 5 });
  c.fillStyle = '#C8C4D8'; rr(c, 920, -780, 1760, 200, 50); c.fill(); c.fillStyle = '#E4E0EE'; rr(c, 2200, -950, 440, 200, 60); c.fill();
  // nightstand + digital clock (live digits) at 700
  c.fillStyle = '#3A2E26'; c.fillRect(560, -620, 300, 620);
  // fridge (far right) with the shopping list
  c.fillStyle = '#9AA4B4'; rr(c, -2650, -2900, 700, 2900, 30); c.fill(); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-2650, -1900, 700, 14);
  c.fillStyle = '#F4F1E4'; c.save(); c.translate(-2300, -2350); c.rotate(-0.05); c.fillRect(-170, -230, 340, 460); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, -225, 20, 0, TAU); c.fill(); c.restore();
  hand(c, 'milk', -2300, -2480, 58, '#2B3A8A', 260); hand(c, 'bread', -2300, -2380, 58, '#2B3A8A', 260); hand(c, 'eggs', -2300, -2280, 58, '#2B3A8A', 260);
  // floor
  c.fillStyle = '#3A2E2A'; c.fillRect(BX0, -10, BW, 2000); c.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 40; y < 1600; y += 110) c.fillRect(BX0, y, BW, 6);
}
function drawHall(c) {
  c.fillStyle = '#D9D2C0'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = '#B9AF98'; c.fillRect(BX0, -1100, BW, 1100);
  for (const [dx, num] of [[-1300, '4A'], [1200, '4B']]) { c.fillStyle = '#5A3A2A'; c.fillRect(dx - 380, -2500, 760, 2500); c.fillStyle = '#6E4A36'; c.fillRect(dx - 330, -2450, 660, 2440);
    c.fillStyle = '#C9A85A'; rr(c, dx - 110, -2200, 220, 120, 16); c.fill(); fitTxt(c, num, dx, -2140, 80, '#3A2A1A', 180); c.beginPath(); c.arc(dx + 230, -1250, 30, 0, TAU); c.fill(); }
  // the upside-down WELCOME mat at 4B and a pile of old letters
  c.fillStyle = '#8A6A3A'; c.fillRect(950, -70, 500, 70); c.save(); c.translate(1200, -35); c.rotate(Math.PI); fitTxt(c, 'WELCOME', 0, 0, 44, '#3A2A1A', 400); c.restore();
  for (let i = 0; i < 6; i++) { c.save(); c.translate(1100 + i * 40, -110 - i * 6); c.rotate((i - 3) * 0.1); c.fillStyle = '#F4F1E4'; c.fillRect(-60, -30, 120, 60); c.restore(); }
  c.fillStyle = '#7A6A58'; c.fillRect(BX0, -10, BW, 2000); }
const BG = { flat: mkBG(drawFlat), hall: mkBG(drawHall) };

// ---------------- pose helpers + states
const down = (g, s) => reach(g, s, s * g.sw * 1.05, g.ySh + 520, { planar: true });
const chest = (g, s, dy = 200, k = 0.5) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const phoneItem = handItem => (ctx, a) => { ctx.save(); ctx.rotate(a - Math.PI / 2); ctx.translate(0, 40); paint(ctx, z => { z.m(-40, -72); z.l(40, -72); z.l(40, 72); z.l(-40, 72); z.z(); }, '#2B2F3A', { sd: 5, hd: 2, lw: 3 }); ctx.fillStyle = '#BFE6FF'; rr(ctx, -33, -64, 66, 128, 8); ctx.fill(); ctx.restore(); };
const noteItem = (ctx, a) => { ctx.save(); ctx.rotate(a - Math.PI / 2); ctx.translate(0, 50); ctx.fillStyle = '#F4F1E4'; ctx.fillRect(-70, -50, 140, 100); ctx.strokeStyle = '#2B3A8A'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-50, -25 + i * 22); ctx.lineTo(40 - i * 15, -25 + i * 22); ctx.stroke(); } ctx.restore(); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: 0, mood: 'worried', turn: -0.2, look: -0.6, armL: down(g, -1), armR: down(g, 1), items: {} };
  if (L === 'hook') { st.mood = t > e('her') ? 'shock' : 'surprised'; st.lookY = 0.35; if (t > e('note')) { st.armR = chest(g, 1, 150, 0.6); st.items = { R: noteItem }; st.lookY = 0.15; } }
  if (L === 'night2') { st.mood = 'worried'; st.armR = chest(g, 1, 150, 0.6); st.items = { R: phoneItem() }; st.lookY = 0.3; if (t > e('her')) { st.mood = 'shock'; st.blink = 0; st.look = -0.8; st.lookY = 0.3; } }
  if (L === 'morning') { st.mood = 'neutral'; st.turn = 0.2; st.look = 0.7; if (t < e('phone')) { const u = (t - e('knock')) * 3.1; st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 60 + (Math.sin(u * TAU) > 0 ? -25 : 25), { planar: true }, { fist: true }); }
    else { st.armR = chest(g, 1, 150, 0.6); st.items = { R: phoneItem() }; st.lookY = 0.35; st.look = 0; } if (t > e('reply') + 0.4) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'night3') { st.mood = 'worried'; st.blink = 0; st.lookY = 0.2; if (t > e('note')) { st.items = { R: noteItem }; st.armR = chest(g, 1, 150, 0.6); }
    if (t > e('knock')) { st.mood = 'shock'; st.turn = 0.25; st.look = 0.9; st.lookY = 0; st.headY = Math.sin(t * 40) * 2; st.armL = chest(g, -1, 260, 0.2); }
    if (t > e('her')) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 0.15, g.headY + g.hh * 0.75, { planar: true }); st.headFirst = false; } }   // hand over her mouth
  if (L === 'twist') { st.mood = 'worried'; st.turn = -0.3; st.look = -0.9; st.items = { R: noteItem }; st.armR = chest(g, 1, 120, 0.9); if (t > e('same')) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'fork') { st.mood = 'shock'; st.blink = 0; st.turn = 0.25; st.look = 0.9; }
  return st; }

// ---------------- the world
function clockDigits(t, L) { if (L === 'night2') return t < ev('night2', 'clock') + 1.0 ? '02:59' : '03:00'; if (L === 'night3' || L === 'fork' || L === 'twist') return t < ev('night3', 'knock') ? '03:00' : '03:01'; return '23:47'; }
function flat(c, t, L) { const heads = {}, ox = OX.flat; c.drawImage(BG.flat, ox + BX0, BY0, BW, BH);
  // the clock on the nightstand
  c.fillStyle = '#111'; rr(c, ox + 580, -800, 260, 140, 18); c.fill(); fitTxt(c, clockDigits(t, L), ox + 710, -730, 84, '#FF4A4A', 230);
  // knocks: the picture on the shared wall shakes
  const kk = ['night3', 'fork'].includes(L) ? (() => { const k0 = L === 'fork' ? ev('fork', 'knock') : ev('night3', 'knock'); for (let i = 0; i < 3; i++) { const d = t - k0 - i * 0.45; if (d > 0 && d < 0.25) return 1 - d / 0.25; } return 0; })() : 0;
  if (kk > 0) { c.save(); c.translate(ox + 1560, -2400); c.rotate(Math.sin(t * 90) * 0.04 * kk); c.fillStyle = '#6A5A40'; c.fillRect(-260, -200, 520, 400); c.fillStyle = '#3E4E6E'; c.fillRect(-220, -160, 440, 320); c.restore(); }
  // the note sliding under the door
  const slides = { hook: ev('hook', 'slide'), night2: ev('night2', 'slide'), night3: ev('night3', 'slide') };
  if (slides[L] !== undefined && t > slides[L]) { const u = eOut(clamp((t - slides[L]) / 0.9)); c.save(); c.translate(ox + DOORX + lerp(-200, 260, u), -6); c.fillStyle = '#F4F1E4'; c.beginPath(); c.moveTo(-120, 0); c.lineTo(120, 0); c.lineTo(110, -10); c.lineTo(-110, -10); c.fill();
    c.fillStyle = 'rgba(255,240,200,.35)'; c.beginPath(); c.ellipse(0, -5, 200, 40, 0, 0, TAU); c.fill(); c.restore(); }
  heads.her = K.put(c, HER, herState(t, L), ox + (L === 'twist' ? -1700 : XH), 0);
  return heads; }
function hall(c, t, L) { const heads = {}, ox = OX.hall; c.drawImage(BG.hall, ox + BX0, BY0, BW, BH); heads.her = K.put(c, HER, herState(t, L), ox + 450, 0); return heads; }
function world(c, t, L) { return LOC[L] === 'hall' ? hall(c, t, L) : flat(c, t, L); }

// ---------------- shots
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = G.her.headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-650, fy(HY, 0.68, 1080), 0.68, 'cover'), GAP: S(DOORX + 100, -150, 1.3, 'gap'), HER: S(XH + 20, fy(HY, 1.25, 900), 1.25, 'her'), WIDE: S(0, fy(HY, 0.42, 1120), 0.42, 'wide'),
  CLOCK: S(710, -730, 1.6, 'clock'), WALL: S(1500, -2000, 0.75, 'wall'), FRIDGE: S(-2100, fy(HY, 0.7, 900), 0.7, 'fridge'),
  HALL: S(OX.hall + 700, fy(HY, 0.5, 1050), 0.5, 'hall'), HALL_CU: S(OX.hall + 480, fy(HY, 1.2, 900), 1.2, 'hall'),
  NOTE: U('note', 1), CHAT: U('chat', 2), CMP: U('cmp', 3), SPLIT: U('split', 4) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < 0.4) return SH.COVER; if (t < 2.4) return f(SH.GAP); if (t < e('note') - 0.05) return f(SH.WIDE); if (t < e('her')) return f(SH.NOTE); return f(SH.HER); }
  if (L === 'night2') { if (t < e('clock') - 0.05) return f(SH.WIDE); if (t < e('slide') - 0.05) return f(SH.CLOCK); if (t < e('note') - 0.05) return f(SH.GAP); if (t < e('her')) return f(SH.NOTE); return f(SH.HER); }
  if (L === 'morning') { if (t < e('phone') - 0.05) return f(SH.HALL); if (t < SP.n5.t + SP.n5.d) return f(SH.CHAT); return f(SH.HALL_CU); }
  if (L === 'night3') { if (t < e('slide') - 0.05) return f(SH.CLOCK); if (t < e('note') - 0.05) return f(SH.GAP); if (t < e('knock') - 0.05) return f(SH.NOTE); if (t < SP.n8.t) return f(SH.WALL); if (t < e('her') - 0.05) return f(SH.HER); return f(SH.HER); }
  if (L === 'twist') { if (t < e('compare') - 0.05) return f(SH.FRIDGE); return f(SH.CMP); }
  if (L === 'fork') { if (t < SP.n11.t) return f(SH.WALL); if (t < e('split') - 0.05) return f(SH.HER); return f(SH.SPLIT); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'knock']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
// night: darken everything, a cold moonlight glow from the window and the warm gap under the door
function night(c, L, tag) { if (LOC[L] === 'hall') return; c.save(); c.fillStyle = 'rgba(8,12,30,.42)'; c.fillRect(0, 0, W, HH); const g = c.createRadialGradient(540, 760, 80, 540, 760, 1100); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = g; c.fillRect(0, 0, W, HH); c.restore(); }

// ---------------- inserts
function backdrop(c, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH); }
const NOTES = { hook: ['Please be quiet.', 'Пожалуйста, тише.'], night2: ['They can hear you.', 'Они тебя слышат.'], night3: ["Don't answer", 'if they knock.', 'Не отвечай, если постучат.'] };
function noteView(c, t) { const L = sceneAt(t).id, n = NOTES[L], t0 = ev(L, 'note'), k = eBack(clamp((t - t0 + 0.05) / 0.35), 1.5); backdrop(c, '#121828', '#05070E');
  c.save(); c.translate(540, 820); c.rotate(-0.04); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-400 + 16, -300 + 20, 800, 600); c.fillStyle = '#F4F1E4'; c.fillRect(-400, -300, 800, 600);
  c.strokeStyle = 'rgba(120,140,190,.35)'; c.lineWidth = 3; for (let y = -200; y < 300; y += 70) { c.beginPath(); c.moveTo(-360, y); c.lineTo(360, y); c.stroke(); }
  const en = n.slice(0, -1); en.forEach((s, i) => hand(c, s, 0, (i - (en.length - 1) / 2) * 120 - 20, 104, '#2B3A8A', 700)); c.restore();
  const rk = clamp((t - t0 - 0.5) / 0.3); if (rk > 0) { c.save(); c.globalAlpha = rk; fitTxt(c, n[n.length - 1], 540, 1260, 56, '#FFFFFF', 900, 'Unb9'); c.restore(); } }
function chatView(c, t) { const e = k => ev('morning', k); backdrop(c, '#DCE6EE', '#AFC4D6'); const k = eBack(clamp((t - e('phone')) / 0.3), 1.6);
  K.phone(c, 540, 900, 1.5 * k, (q, w, h) => { q.fillStyle = '#F7F7F9'; q.fillRect(0, 0, w, h); q.fillStyle = '#E9ECF1'; q.fillRect(0, 0, w, 110); fitTxt(q, 'Mrs Price (landlady)', w / 2, 70, 30, '#2B2F3A', w - 40);
    const b = (txt, y, me) => { UI.font(q, 'Nun9', 26); const lines = UI.wrap ? UI.wrap(q, txt, 280) : [txt]; const bh = lines.length * 34 + 30, bw = 320, x = me ? w - bw - 20 : 20; q.fillStyle = me ? '#5BA0E0' : '#FFFFFF'; rr(q, x, y, bw, bh, 22); q.fill(); q.fillStyle = me ? '#FFFFFF' : '#2B2F3A'; q.textAlign = 'left'; q.textBaseline = 'top'; lines.forEach((l, i) => q.fillText(l, x + 20, y + 15 + i * 34)); return y + bh + 20; };
    let y = 150; if (t > e('phone') + 0.3) y = b('Hi! Who lives in 4B? Someone keeps leaving notes under my door.', y, true);
    if (t > e('reply')) { y = b('Flat 4B? Nobody has lived there for three years.', y, false); } }); }
function cmpView(c, t) { const e = k => ev('twist', k); backdrop(c, '#121828', '#05070E'); const k = eOut(clamp((t - e('compare')) / 0.35)), same = clamp((t - e('same')) / 0.3);
  const card = (x, rot, lines, title) => { c.save(); c.translate(x, 800); c.rotate(rot); c.scale(k, k); c.fillStyle = '#F4F1E4'; c.fillRect(-230, -330, 460, 660); fitTxt(c, title, 0, -280, 30, '#8A93A0', 400, 'Nun9'); lines.forEach((s, i) => hand(c, s, 0, -150 + i * 110, 70, '#2B3A8A', 400)); c.restore(); };
  card(290, -0.05, ['They can', 'hear you.'], 'NOTE'); card(790, 0.05, ['milk', 'bread', 'eggs'], 'MY SHOPPING LIST');
  if (same > 0) { c.save(); c.globalAlpha = same; c.strokeStyle = '#E0474C'; c.lineWidth = 10; for (const [x, y] of [[230, 650], [300, 760], [740, 660], [800, 760]]) { c.beginPath(); c.ellipse(x, y, 90, 60, 0.2, 0, TAU); c.stroke(); } fitTxt(c, 'ОДИН ПОЧЕРК', 540, 1280, 80, '#E0474C', 900); c.restore(); } }
function splitView(c, t) { const k = eOut(clamp((t - ev('fork', 'split')) / 0.35)); c.fillStyle = '#2B3A5A'; c.fillRect(0, 0, W / 2, HH); c.fillStyle = '#5A2B3A'; c.fillRect(W / 2, 0, W / 2, HH);
  c.save(); c.translate(W / 4, 700); c.scale(k, k); c.fillStyle = '#F6D2B6'; c.beginPath(); c.ellipse(0, 0, 110, 90, 0, 0, TAU); c.fill(); for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(-70 + i * 46, -70, 26, 36, 0, 0, TAU); c.fill(); } c.strokeStyle = '#FFFFFF'; c.lineWidth = 10; for (const r of [150, 200]) { c.beginPath(); c.arc(130, -40, r, -0.6, 0.6); c.stroke(); } c.restore();
  c.save(); c.translate(W * 3 / 4, 700); c.scale(k, k); c.fillStyle = '#F6D2B6'; c.beginPath(); c.arc(0, 0, 140, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.beginPath(); c.moveTo(-70, 40); c.lineTo(70, 40); c.stroke(); c.lineWidth = 5; for (let x = -60; x <= 60; x += 20) { c.beginPath(); c.moveTo(x, 28); c.lineTo(x, 52); c.stroke(); } c.fillStyle = '#2B2F3A'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 50, -30, 14, 0, TAU); c.fill(); } c.restore();
  c.save(); c.globalAlpha = k; fitTxt(c, 'СТУЧАТЬ', W / 4, 1050, 72, '#FFFFFF', 480); fitTxt(c, 'МОЛЧАТЬ', W * 3 / 4, 1050, 72, '#FFFFFF', 480); c.restore(); c.fillStyle = '#05070E'; c.fillRect(W / 2 - 6, 0, 12, HH); }
const VIEWS = { 'ui:note': noteView, 'ui:chat': chatView, 'ui:cmp': cmpView, 'ui:split': splitView };

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 0.25, 0.4); if (a <= 0) return; const lines = TL.cfg.hook_title;
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.4)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = '#15192A'; c.strokeStyle = '#E0474C'; c.lineWidth = 8; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 66, lines[0][0], 880); c.fillStyle = '#FFFFFF'; c.fillText(lines[0][0], 0, -100);
  UI.textFit(c, 'Unb9', 104, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, '#FF5A6A', '#15192A', 12); UI.textFit(c, 'Unb9', 60, lines[2][0], 880); c.fillStyle = '#FFFFFF'; c.fillText(lines[2][0], 0, 110); c.restore(); }
const CHAP = { night2: 'НОЧЬ ВТОРАЯ', morning: 'УТРО', night3: 'НОЧЬ ТРЕТЬЯ' };
function chapter(c, txt) { c.save(); UI.font(c, 'Unb9', 40); const w = c.measureText(txt).width + 60; c.fillStyle = 'rgba(0,0,0,.6)'; rr(c, 540 - w / 2, 150, w, 70, 35); c.fill(); c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 540, 187); c.restore(); }
function wallWhisper(c, t) { const sp = SP.e5; if (!speaking('e5', t, 0, 0.3)) return; const a = clamp((t - sp.t) / 0.3) * (1 - clamp((t - sp.t - sp.d) / 0.3)); c.save(); c.globalAlpha = a; hand(c, 'Sonya… we know you\'re awake.', 540, 1180, 66, '#FFFFFF', 960); fitTxt(c, 'Соня… мы знаем, что ты не спишь.', 540, 1270, 40, '#FFB3BC', 960, 'Nun9'); c.restore(); }

// ---------------- end screen
function endScreen(c, t) { const s = SC.outro.s, u = t - s, { textFit, strokeText, font } = UI; backdrop(c, '#15192A', '#05070E');
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.1, 0.45), 2.2); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, '#FFFFFF', '#15192A', 12); strokeText(c, 'ЧТО СДЕЛАЛА?', 0, 40, '#FF5A6A', '#15192A', 12); c.restore(); }
  [['СТУЧАТЬ', '#3E5A8A'], ['МОЛЧАТЬ', '#8A3E5A']].forEach(([txt, col], i) => { const kk = eBack(P(t, s + 0.6 + i * 0.25, s + 0.9 + i * 0.25), 2.2); if (kk <= 0) return; c.save(); c.translate(540, 620 + i * 210); c.scale(kk, kk); c.fillStyle = col; c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; rr(c, -380, -80, 760, 160, 40); c.fill(); c.stroke(); textFit(c, 'Unb9', 70, txt, 640); c.fillStyle = '#FFFFFF'; c.fillText(txt, 0, 6); c.restore(); });
  const svT = s + 1.3, sk = eBack(P(t, svT, svT + 0.3), 2.2);
  if (sk > 0) { c.save(); c.translate(540, 1080); c.scale(sk, sk); c.fillStyle = C.gold; rr(c, -260, -60, 520, 120, 60); c.fill(); c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill(); textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = svT + 0.6, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1260;
  if (bk > 0) { const pressed = t > subT + 0.9; c.save(); c.translate(560, sy); c.scale(bk, bk); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  const pk = eBack(P(t, s + 0.3, s + 0.6), 2); if (pk > 0) { c.save(); c.translate(540, 1460); c.scale(pk, pk); c.fillStyle = '#F4F1E4'; rr(c, -430, -80, 860, 160, 20); c.fill(); textFit(c, 'Nun9', 30, 'ФРАЗА СЕРИИ', 700); c.fillStyle = '#E0474C'; c.fillText('ФРАЗА СЕРИИ', 0, -42); hand(c, "Don't answer if they knock.", 0, 20, 52, '#2B3A8A', 780); c.restore(); }
  Hq.grain(c, W, HH, t, 0.05); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  if (tag.startsWith('ui:')) { VIEWS[tag](c, t); Hq.vignette(c, W, HH, 0.3); }
  else { drawWorld(c, t, L, cam, sh); night(c, L, tag); Hq.vignette(c, W, HH, 0.35); }
  if (L === 'hook') title(c, t);
  if (CHAP[L] && t < sc.s + 1.4 && !tag.startsWith('ui:')) chapter(c, CHAP[L]);
  wallWhisper(c, t);
  UI.captions(c, t); if (!tag.startsWith('ui:split')) UI.watermark(c); Hq.grain(c, W, HH, t, 0.05);
  const d = sc.e - t; if (L === 'fork' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = '#15192A'; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('notes1', NF, renderFrame);
