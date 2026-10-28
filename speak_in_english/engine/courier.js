// "Courier: Delivered ✅" episode renderer: node courier.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, pug, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/courier/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = k => EV(k);

const HER = { ...BASE.her_london };
const DAVE = { ...BASE.jay, top: { type: 'tee', col: '#F2C14E', text: 'SPEEDY', textSize: 40, textCol: '#2B2F3A' } };
const GRANNY = { ...BASE.nana, top: { type: 'sweater', col: '#C27AE0' } };
const G = { her: geom(HER), dave: geom(DAVE), granny: geom(GRANNY) };
const FY = 60, HERX = 0, GRX = 1180, ROOFBOX = { x: 300, y: -1730 };
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function tick(c, x, y, col) { c.save(); c.strokeStyle = col; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 16, y); c.lineTo(x - 4, y + 13); c.lineTo(x + 18, y - 14); c.stroke(); c.restore(); }
function box(c, x, y, s = 1, label = false, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); paint(c, q => { q.m(-90, -70); q.l(90, -70); q.l(90, 70); q.l(-90, 70); q.z(); }, '#C99A64', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-14, -70, 28, 140); if (label) { c.fillStyle = '#F7B6CF'; c.fillRect(20, -10, 60, 44); c.fillStyle = '#2B2F3A'; c.fillRect(28, 0, 44, 5); c.fillRect(28, 12, 30, 5); } c.restore(); }

// ---------------- street (prerendered)
const BX0 = -1800, BY0 = -2900, BW = 4200, BH = 3700, BS = 0.5;
function house(c, x0, x1, wall, roof, door) { c.fillStyle = wall; c.fillRect(x0, -1350, x1 - x0, 1410); for (let y = -1330; y < 60; y += 44) { c.fillStyle = 'rgba(0,0,0,.05)'; c.fillRect(x0, y, x1 - x0, 3); }
  paint(c, q => { q.m(x0 - 60, -1300); q.l((x0 + x1) / 2, -2100); q.l(x1 + 60, -1300); q.z(); }, roof, { sd: 12, hd: 6, lw: 4 }); c.fillStyle = '#8A4A3A'; c.fillRect(x1 - 260, -2000, 90, 260);
  c.fillStyle = '#FFFDF8'; for (const wx of [x0 + 90, x1 - 330]) { c.fillRect(wx, -1150, 240, 300); c.fillStyle = '#9FC8E8'; c.fillRect(wx + 14, -1136, 212, 272); c.fillStyle = '#FFFDF8'; } if (door) { c.fillStyle = door; c.fillRect((x0 + x1) / 2 - 150, -820, 300, 880); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc((x0 + x1) / 2 + 100, -380, 14, 0, TAU); c.fill(); } }
function drawStreet(c) {
  const sg = c.createLinearGradient(0, BY0, 0, -1300); sg.addColorStop(0, '#8FC8EE'); sg.addColorStop(1, '#DDEFF8'); c.fillStyle = sg; c.fillRect(BX0, BY0, BW, BH);
  for (const [x, y] of [[-1200, -2500], [300, -2650], [1500, -2450]]) { c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x + i * 70, y + Math.sin(i) * 20, 70, 0, TAU); c.fill(); } }
  house(c, -1900, -760, '#C9B4E8', '#7A4A6A', '#2F5A48');
  house(c, -700, 700, '#F4B8C8', '#B04A3A', '#3C6FB4');
  house(c, 760, 2200, '#A8DCC4', '#5A6A7A', '#8A1C2E');
  c.fillStyle = '#9A9488'; c.fillRect(BX0, FY, BW, 40); const pg = c.createLinearGradient(0, FY, 0, 800); pg.addColorStop(0, '#B8B0A2'); pg.addColorStop(1, '#A39A8A'); c.fillStyle = pg; c.fillRect(BX0, FY + 40, BW, BY0 + BH - FY);
  c.fillStyle = '#6A5A4A'; c.fillRect(720, -420, 30, 480); c.fillRect(1700, -420, 30, 480); c.fillStyle = '#B98A62'; for (let x = 760; x < 1700; x += 60) { c.beginPath(); c.moveTo(x, -380); c.lineTo(x + 25, -420); c.lineTo(x + 50, -380); c.lineTo(x + 50, 60); c.lineTo(x, 60); c.fill(); }
  txt(c, '27', 0, -900, 60, '#FFFDF8');
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.5px)'; drawStreet(c); }
const FENCE = createCanvas(1100, 520); { const c = FENCE.getContext('2d'); c.translate(-700, 460); c.fillStyle = '#B98A62'; for (let x = 760; x < 1700; x += 60) { c.beginPath(); c.moveTo(x, -380); c.lineTo(x + 25, -420); c.lineTo(x + 50, -380); c.lineTo(x + 50, 60); c.lineTo(x, 60); c.fill(); } c.fillStyle = '#9A6A4A'; c.fillRect(740, -300, 980, 26); c.fillRect(740, -100, 980, 26); }

// ---------------- photo "proofs" inside the phone
const PHOTOS = ['photo1', 'photo2', 'photo3', 'photo4', 'photo5'];
function currentPhoto(t) { let p = -1; PHOTOS.forEach((k, i) => { if (t > ev(k)) p = i; }); return p; }
function photo(c, w, h, i, t) {
  c.fillStyle = '#F4F1EC'; c.fillRect(0, 0, w, h); txt(c, 'PROOF OF DELIVERY', w / 2, 46, 26, '#2B2F3A');
  c.save(); c.beginPath(); rr(c, 20, 80, w - 40, 470, 20); c.clip(); c.translate(20, 80); const pw = w - 40, ph = 470;
  if (i === 0) { c.fillStyle = '#8FC8EE'; c.fillRect(0, 0, pw, ph); paint(c, q => { q.m(-20, ph); q.l(pw / 2, 120); q.l(pw + 20, ph); q.z(); }, '#B04A3A', { sd: 8, hd: 4, lw: 3 }); box(c, pw * 0.62, 260, 0.9, true, 0.5); }
  if (i === 1) { c.fillStyle = '#8FD08A'; c.fillRect(0, 0, pw, ph); paint(c, q => { q.m(40, 420); q.l(40, 230); q.l(180, 130); q.l(320, 230); q.l(320, 420); q.z(); }, '#B04A3A', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = '#2B1A10'; c.beginPath(); c.arc(180, 340, 70, Math.PI, 0); c.fillRect(110, 340, 140, 80); c.fill(); c.save(); c.translate(185, 430); c.scale(0.55, 0.55); pug(c, { t, tongue: true }); c.restore(); box(c, 150, 255, 0.75, false, -0.12); }
  if (i === 2) { c.fillStyle = '#F7E6C8'; c.fillRect(0, 0, pw, ph); c.fillStyle = '#2F5A48'; c.fillRect(30, 40, pw - 60, 110); txt(c, 'HERE', pw / 2, 96, 72, '#F2C14E'); txt(c, 'CAFE', pw / 2, 136, 24, '#FFFDF8'); c.fillStyle = '#9FC8E8'; c.fillRect(50, 180, pw - 100, 200); box(c, pw / 2, 400, 0.8, false); }
  if (i === 3) { c.fillStyle = '#E9EEF2'; c.fillRect(0, 0, pw, ph); c.strokeStyle = '#FFFFFF'; c.lineWidth = 14; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, k * 90); c.lineTo(pw, k * 90 + 40); c.stroke(); c.beginPath(); c.moveTo(k * 80, 0); c.lineTo(k * 80 - 30, ph); c.stroke(); } c.strokeStyle = '#3C8FE0'; c.lineWidth = 8; c.setLineDash([16, 10]); c.beginPath(); c.moveTo(60, 420); c.bezierCurveTo(100, 200, 260, 300, 300, 80); c.stroke(); c.setLineDash([]); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(300, 70, 22, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, 30, 300, pw - 60, 70, 14); c.fill(); txt(c, 'PICK-UP: 14 MILES', pw / 2, 336, 30, '#F2C14E'); }
  if (i === 4) { c.fillStyle = '#A8DCC4'; c.fillRect(0, 0, pw, ph); c.save(); c.translate(pw / 2, ph + 540); c.scale(0.55, 0.55); Hq.human(c, GRANNY, { t, mood: 'happy', turn: 0, look: 0, armL: reach(G.granny, -1, -G.granny.sw * 0.6, G.granny.ySh + 300), armR: reach(G.granny, 1, G.granny.sw * 1.7, G.granny.ySh - 60, { fist: true }), afterTorso: cc => sparkleDress(cc, t) }); c.restore(); box(c, 80, 420, 0.6, false); }
  c.restore(); c.fillStyle = '#2F8A4A'; rr(c, 20, 580, w - 40, 80, 20); c.fill(); txt(c, 'DELIVERED', w / 2 - 20, 620, 36, '#FFFFFF'); tick(c, w / 2 + 120, 620, '#FFFFFF');
}
function sparkleDress(cc, t) { cc.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 26; i++) { const x = (hash(i) - 0.5) * 300, y = -900 + hash(i * 7) * 700; cc.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 6 + i)); cc.beginPath(); cc.arc(x, y, 7, 0, TAU); cc.fill(); } cc.globalAlpha = 1; }

// ---------------- characters
function herState(t, L) {
  const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.6, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 1.0, g.ySh + 140), items: { R: ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -26, -100, 52, 100, 10); ctx.fill(); ctx.fillStyle = '#9FD8F2'; ctx.fillRect(-20, -92, 40, 82); } } };
  const ph = currentPhoto(t); if (ph >= 0 && L !== 'C2') st.mood = ['skeptical', 'shock', 'annoyed', 'angry', 'shock'][ph];
  if (speaking('a1_her', t) || speaking('b1_her', t)) st.mood = 'worried';
  if (L === 'C1' && t > ev('granny')) { st.mood = 'shock'; st.turn = 0.6; st.look = 1; }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'angry' : 'annoyed'; if (t > ev('drop') - 0.1) { st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 60); st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 60); st.items = {}; st.mood = 'shock'; st.lookY = -0.6; } if (t > ev('drop') + 0.6) { st.mood = 'annoyed'; st.lookY = 0; st.look = 0.2; }
    if (SP.c2_her2 && t > SP.c2_her2.t - 0.2) { st.mood = 'annoyed'; st.squint = Math.floor(t * 7) % 3 === 0; st.tilt = -0.05; st.items = { R: ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -26, -100, 52, 100, 10); ctx.fill(); ctx.fillStyle = '#9FD8F2'; ctx.fillRect(-20, -92, 40, 82); } }; st.armR = reach(g, 1, g.sw * 1.5, g.ySh + 20 + (Math.floor(t * 8) % 2) * 20); } }
  if (L === 'hook') { st.mood = 'skeptical'; st.lookY = 0.6; }
  return st;
}
function heldBox(t, L) { return L === 'C2' && t > ev('drop'); }
function roofBox(c, t, L) { // the real parcel: on the roof all along; slides & drops in C2
  if (L !== 'C2' || t < ev('slide')) { box(c, ROOFBOX.x, ROOFBOX.y, 1, true, 0.5); return; }
  const k1 = P(t, ev('slide'), ev('drop') - 0.25), k2 = P(t, ev('drop') - 0.25, ev('drop'));
  if (t < ev('drop')) { const x = lerp(ROOFBOX.x, 760, eIn(k1)), y = lerp(ROOFBOX.y, -1240, eIn(k1)); const x2 = lerp(x, HERX + 40, k2), y2 = lerp(y, FY - 900, eIn(k2)); box(c, x2, y2, 1, true, 0.5 + k1 * 2 + k2 * 2); }
}
function daveState(t, L) { const g = G.dave, st = { t, talk: talk('dave', t), mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 1.6, g.ySh - 40, { fist: true }) };
  if (L === 'C2' && speaking('c2_her', t, 0, 0.6)) { st.mood = 'worried'; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 300); }
  if (L === 'C2' && t > ev('trophy')) { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 160, { fist: true }); }
  st.front = (cc, gg) => { paint(cc, q => { q.m(gg.head.x - G.dave.hw * 1.05, gg.head.y - G.dave.hh * 0.45); q.q(gg.head.x, gg.head.y - G.dave.hh * 1.25, gg.head.x + G.dave.hw * 1.05, gg.head.y - G.dave.hh * 0.45); q.z(); }, '#E0474C', { sd: 4, hd: 2, lw: 3 }); paint(cc, q => { q.m(gg.head.x - G.dave.hw * 1.05, gg.head.y - G.dave.hh * 0.5); q.l(gg.head.x - G.dave.hw * 1.8, gg.head.y - G.dave.hh * 0.38); q.l(gg.head.x - G.dave.hw * 1.0, gg.head.y - G.dave.hh * 0.32); q.z(); }, '#B03A3A', { sd: 2, hd: 1, lw: 3 }); };
  return st; }
function starsOf(t) { let n = 4.2; for (const k of ['star', 'photo2', 'photo3', 'photo4', 'photo5']) if (t > ev(k)) n += 0.1; return Math.min(4.9, n); }
function daveWindow(c, t, L) {
  if (['hook', 'outro'].includes(L) || t < SP.a1_her.t - 0.2) return null; const k = L === 'A1' ? eBack(P(t, SP.a1_her.t - 0.2, SP.a1_her.t + 0.2), 1.6) : 1, x = 30, y = 1230, w = 380, h = 450;
  K.callWindow(c, x, y, w, h, 'DAVE · SPEEDY', '#E0474C', k, (cc, ww, hh) => { cc.fillStyle = '#C9E6F7'; cc.fillRect(0, 0, ww, hh); cc.fillStyle = '#3A3F4B'; cc.fillRect(0, hh - 120, ww, 120); cc.fillStyle = '#2B2F3A'; cc.beginPath(); cc.arc(ww - 60, hh - 110, 70, Math.PI, 0); cc.fill();
    cc.save(); cc.translate(ww / 2, hh + 600); cc.scale(0.6, 0.6); Hq.human(cc, DAVE, daveState(t, L)); cc.restore();
    const trophy = L === 'C2' && t > ev('trophy'); cc.fillStyle = trophy ? '#F2C14E' : '#2B2F3A'; rr(cc, 16, 16, ww - 32, 56, 14); cc.fill(); txt(cc, trophy ? 'COURIER OF THE MONTH!' : 'RATING ' + starsOf(t).toFixed(1) + ' / 5', ww / 2, 44, trophy ? 24 : 28, trophy ? '#2B2F3A' : '#F2C14E');
    if (trophy) { const tk = eBack(P(t, ev('trophy'), ev('trophy') + 0.4), 2); cc.save(); cc.translate(ww - 80, 150); cc.scale(tk, tk); paint(cc, q => { q.m(-40, -60); q.l(40, -60); q.q(40, 10, 0, 20); q.q(-40, 10, -40, -60); q.z(); }, '#F2C14E', { sd: 4, hd: 2, lw: 3 }); cc.fillStyle = '#C9A040'; cc.fillRect(-10, 20, 20, 30); cc.fillRect(-34, 50, 68, 16); cc.restore(); } });
  return { x: x + w / 2, y };
}
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {};
  roofBox(c, t, L);
  if (L === 'C1' && t > ev('granny') - 0.1 || L === 'C2') { const k = L === 'C1' ? eBack(P(t, ev('granny') - 0.1, ev('granny') + 0.3), 1.6) : 1; heads.granny = put(c, GRANNY, { t, talk: talk('granny', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(G.granny, -1, -G.granny.sw * 1.7, G.granny.ySh - 60, { fist: true }), armR: reach(G.granny, 1, G.granny.sw * 0.6, G.granny.ySh + 300), afterTorso: cc => sparkleDress(cc, t) }, GRX, FY + 300 * (1 - k)); c.drawImage(FENCE, 700, -460); }
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  if (heldBox(t, L)) box(c, HERX + 30, FY - 930, 1.05, true, 0.05);
  return heads;
}
function shotFor(t) {
  const sc = sceneAt(t), L = sc.id, wide = { x: 200, y: -1050, z: 0.62, r: 0 }, her = { x: -40, y: -1050, z: 0.85, r: 0 };
  if (L === 'hook' || L === 'outro') return wide;
  const u = t - sc.s; if (u < 1.15) return { ...wide, cut: u < 0.85 };
  if (L === 'C1' && t > ev('granny') - 0.3 && t < SP.c1_nar.t + 0.3) return { x: 650, y: -1050, z: 0.66, r: 0 };
  if (L === 'C2') { if (speaking('c2_her', t, 0.2, 0.3)) return { x: 120, y: -1450, z: 0.78, r: 0 }; if (t > ev('slide') - 0.2 && t < ev('drop') + 0.8) return { x: 300, y: -1100, z: 0.6, r: 0 }; if (SP.c2_her2 && t > SP.c2_her2.t - 0.3 && t < SP.c2_nar.t) return { x: -80, y: -1150, z: 0.9, r: 0 }; }
  const l = L.toLowerCase(); const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who === 'her' && t >= s.t - 0.3 && t < s.t + s.d + 0.2); if (cur) return her;
  return wide;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function photoPhone(c, t, L) { const i = currentPhoto(t); if (i < 0 || ['hook', 'outro'].includes(L)) return; const t0 = ev(PHOTOS[i]), nar = SP[L.toLowerCase() + '_nar']; const end = nar ? nar.t + nar.d : 1e9; const k = eBack(P(t, t0, t0 + 0.3), 1.8) * (1 - P(t, end - 0.2, end + 0.1)); if (k <= 0 || L === 'C2') return; K.phone(c, 800, 1260, 0.72 * k, (cc, w, h) => photo(cc, w, h, i, t), 0.06); }
function drawHook(c, t) {
  const herHY = FY + G.her.headY; drawWorld(c, t, 'hook', { x: 200, y: -1050, z: 0.62, r: 0 }); Hq.vignette(c, W, HH, 0.3);
  const k = 1 - eIO(P(t, 2.2, 2.8)); if (k > 0) { c.save(); c.globalAlpha = Math.min(1, k * 1.5); K.phone(c, 540, 1180, 0.95 * (0.7 + 0.3 * k), (cc, w, h) => { cc.fillStyle = '#2B3A67'; cc.fillRect(0, 0, w, h); txt(cc, '09:41', w / 2, 120, 80, '#FFFFFF'); cc.fillStyle = 'rgba(255,255,255,.92)'; rr(cc, 20, 210, w - 40, 420, 26); cc.fill(); txt(cc, 'SPEEDY PARCELS', 40, 250, 22, '#6A707A', 'Unb9', 'left'); txt(cc, 'Your parcel has been', 40, 300, 28, '#2B2F3A', 'Nun9', 'left'); txt(cc, 'DELIVERED', 40, 345, 40, '#2F8A4A', 'Unb9', 'left'); tick(cc, 290, 345, '#2F8A4A'); cc.save(); cc.beginPath(); rr(cc, 40, 380, w - 80, 230, 16); cc.clip(); cc.fillStyle = '#8FC8EE'; cc.fillRect(40, 380, w - 80, 230); paint(cc, q => { q.m(20, 620); q.l(w / 2, 420); q.l(w - 20, 620); q.z(); }, '#B04A3A', { sd: 6, hd: 3, lw: 3 }); box(cc, w * 0.62, 520, 0.6, true, 0.5); cc.restore(); }); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t);
}
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ЧТО ТЫ СКАЖЕШЬ', 'СВОЕМУ КУРЬЕРУ?'], rows: [['A2', "I didn't receive my parcel."], ['B1', "It says delivered, but it's not here."], ['B2', 'Could you redeliver it, please?'], ['C1', "I'd appreciate it if you could leave it with a neighbour."]], cta: ['ОТПРАВЬ ТОМУ, КТО ВЕЧНО', 'ЖДЁТ ПОСЫЛКУ'], hero: (cc, tt) => { put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.9, G.her.ySh + 120), armR: reach(G.her, 1, G.her.sw * 0.9, G.her.ySh + 120) }, 0, 0); box(cc, 30, -860, 1.05, true, 0.05); } }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh);
  Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  photoPhone(c, t, sc.id);
  const win = daveWindow(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { granny: ['NEIGHBOUR', '#C27AE0'] }, hold: { c2_her: 0.25 } });
  if (win) { const l = sc.id.toLowerCase(); for (const sp of TL.speech.filter(x => x.who === 'dave' && x.id.startsWith(l + '_'))) UI.bubble(c, { ...sp, hold: 0.6 }, t, win, 'right', ['DAVE', '#E0474C']); }
  if (sc.id === 'C2') { K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1); K.pop(c, t, 'БА-ДУМ-ТСС!', ev('trophy') + 0.4, SP.c2_nar.t + 0.6, 620, 1730, C.gold, -0.08, 70); }
  K.hud(c, t, sc);
}
E.run('courier', NF, renderFrame);
