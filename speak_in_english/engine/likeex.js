// "Liked his ex's photo" — short TikTok test (60-75 s), hard_cut camera, phone inserts like wrongchat.js: node likeex.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, mix, paint, rr, human, catChar, createCanvas } = Hq;
require('@napi-rs/canvas').GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Emo');
const TL = JSON.parse(fs.readFileSync('eps/likeex/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);

// ---------------- cast & layout: she sits up in bed at 02:13, the cat sleeps at the foot of the bed
const HER = { ...BASE.her_party, sleepMask: null };
const EMMA = { ...BASE.linda, hair: { style: 'long', col: '#F2C14E' }, top: { type: 'tank', col: '#FF7A9A' } };   // Becky's look (repay)
const TOM = { ...BASE.tom, top: { type: 'tee', col: '#4E7FB8' }, bottom: { type: 'shorts', col: '#3B4A5C' } };
const SEAT = 330, G = { her: geom(HER, SEAT), emma: geom(EMMA), tom: geom(TOM) };
const FY = 60, HERX = -160, CATX = 300, BEDTOP = -300;
const herHY = FY + G.her.headY;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}, Emo`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.font = c.font + ', Emo'; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const win = (t, a, b, inD = 0.3) => eBack(P(t, a, a + inD), 1.6) * (1 - eIn(P(t, b - 0.22, b)));
function heart(c, x, y, r, fill, stroke) { c.save(); c.translate(x, y); c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.3, 0, -r * 1.1, -r * 1.05, 0, -r * 0.45); c.bezierCurveTo(r * 1.1, -r * 1.05, r * 1.3, 0, 0, r * 0.9); c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = r * 0.16; c.lineJoin = 'round'; c.stroke(); } c.restore(); }

// ---------------- night bedroom (prerendered, softly blurred)
const BX0 = -1700, BY0 = -3300, BW = 3400, BH = 4000, BS = 0.5;
function drawRoom(c) {
  const wg = c.createLinearGradient(0, BY0, 0, FY); wg.addColorStop(0, '#1E2340'); wg.addColorStop(1, '#2C3358'); c.fillStyle = wg; c.fillRect(BX0, BY0, BW, FY - BY0);
  c.fillStyle = 'rgba(255,255,255,.035)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, BY0, 110, FY - BY0);
  // window with the moon (left)
  c.fillStyle = '#3A4170'; c.fillRect(-1290, -2260, 640, 900); const sg = c.createLinearGradient(0, -2230, 0, -1390); sg.addColorStop(0, '#0E1230'); sg.addColorStop(1, '#27306A'); c.fillStyle = sg; c.fillRect(-1265, -2235, 590, 850);
  c.fillStyle = '#FFF4C8'; c.beginPath(); c.arc(-860, -2010, 80, 0, TAU); c.fill(); c.fillStyle = '#121638'; c.beginPath(); c.arc(-825, -2035, 74, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; for (let i = 0; i < 22; i++) { c.globalAlpha = 0.4 + hash(i) * 0.6; c.beginPath(); c.arc(-1250 + hash(i * 3) * 560, -2220 + hash(i * 7) * 800, 3 + hash(i * 11) * 4, 0, TAU); c.fill(); } c.globalAlpha = 1;
  c.fillStyle = '#3A4170'; c.fillRect(-985, -2235, 16, 850); c.fillRect(-1265, -1820, 590, 14);
  for (const [x0, s] of [[-1340, 1], [-600, -1]]) { c.fillStyle = '#6B4A8A'; c.beginPath(); c.moveTo(x0, -2300); c.lineTo(x0 + s * 160, -2300); c.quadraticCurveTo(x0 + s * 90, -1800, x0 + s * 130, -1300); c.lineTo(x0, -1300); c.fill(); }
  // framed picture over the bed
  c.fillStyle = '#C9A85A'; c.fillRect(-420, -2000, 520, 380); c.fillStyle = '#F7B6CF'; c.fillRect(-395, -1975, 470, 330); c.fillStyle = '#FFFDF8'; heart(c, -160, -1810, 90, '#EE5E9A');
  // headboard + pillows (behind her)
  paint(c, q => { q.m(-900, FY); q.l(-900, -1080); q.b(-900, -1250, -760, -1300, -560, -1300); q.l(240, -1300); q.b(440, -1300, 580, -1250, 580, -1080); q.l(580, FY); q.z(); }, '#8E5BD6', { sd: 10, hd: 5, lw: 4 });
  paint(c, q => { q.m(-860, FY); q.l(-860, -1040); q.b(-860, -1200, -740, -1250, -560, -1250); q.l(240, -1250); q.b(420, -1250, 540, -1200, 540, -1040); q.l(540, FY); q.z(); }, '#A27AE0', { sd: 6, hd: 3, lw: 3 });
  paint(c, q => q.e(-360, -880, 330, 150), '#FFFDF8', { sd: 10, hd: 5, lw: 3 }); paint(c, q => q.e(220, -860, 270, 130), '#F7B6CF', { sd: 10, hd: 5, lw: 3 });
  // nightstand + digital clock 02:13 (right)
  paint(c, q => { q.m(980, -560); q.l(1440, -560); q.l(1440, FY); q.l(980, FY); q.z(); }, '#5A4A7A', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = '#4A3C66'; c.fillRect(1010, -360, 400, 12);
  c.fillStyle = '#16182A'; rr(c, 1030, -800, 360, 200, 26); c.fill(); c.shadowColor = '#FF5A6A'; c.shadowBlur = 30; txt(c, '02:13', 1210, -698, 120, '#FF5A6A'); c.shadowBlur = 0;
  c.fillStyle = '#20243C'; c.fillRect(BX0, FY, BW, BY0 + BH - FY);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawRoom(c); }
// blanket over her lap and the mattress (drawn after her)
function blanket(c) { paint(c, q => { q.m(-1000, BEDTOP + 40); q.b(-800, BEDTOP - 60, -500, BEDTOP - 110, HERX - 40, BEDTOP - 80); q.b(200, BEDTOP - 60, 560, BEDTOP - 20, 760, BEDTOP + 10); q.l(760, FY); q.l(-1000, FY); q.z(); }, '#F7B6CF', { sd: 14, hd: 7, lw: 4, inner: cc => { cc.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 40; i++) { cc.beginPath(); cc.arc(-950 + (i % 10) * 175 + (Math.floor(i / 10) % 2) * 80, BEDTOP + 20 + Math.floor(i / 10) * 90, 14, 0, TAU); cc.fill(); } } }); }

// ---------------- props
const phoneItem = (lit = '#BFE3FF') => ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -30, -118, 60, 112, 10); ctx.fill(); ctx.fillStyle = lit; rr(ctx, -24, -110, 48, 92, 6); ctx.fill(); };
// the cat, asleep (eyes closed: a frozen blink frame), with floating "z"
function cat(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); catChar(c, { t: 3.075, mood: 'neutral', turn: -0.2, armL: { a: 0.2, b: 0.3 }, armR: { a: 0.2, b: 0.3 } }); c.restore();
  for (let i = 0; i < 3; i++) { const u = ((t * 0.5 + i / 3) % 1); c.save(); c.globalAlpha = Math.sin(u * Math.PI); txt(c, 'z', x + 90 + u * 90 + i * 10, y - 1150 * s - u * 160, 40 + i * 12, '#DDE4FF'); c.restore(); } }
function sweat(c, hd, k) { if (k <= 0) return; const x = hd.x + hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- characters
function gest(st, g, t, base) { const sp = TL.speech.find(s => s.who === 'her' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st.armL = reach(g, -1, -(g.sw * 1.3 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'worried', turn: 0.2, look: 0.3, lookY: 0.55, legPose: 'sit', drop: SEAT, legs: false,
  armL: reach(g, -1, -g.sw * 0.3, g.ySh + 230), armR: reach(g, 1, g.sw * 0.7, g.ySh + 170), items: { R: phoneItem() } };
  gest(st, g, t, 160);
  if (L === 'hook') { st.mood = t < 2.0 ? 'neutral' : 'shock'; st.lookY = t < 2.0 ? 0.6 : 0.2; if (t > 2.4) { st.look = 0.1; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh - 40); } }
  if (L === 'A1') { st.mood = 'shock'; const p = ev('point'); if (t > p - 0.2 && t < endOf('a1_her') + 0.3) { st.armL = reach(g, -1, g.sw * 0.4, g.ySh + 60); st.armR = reach(g, 1, g.sw * 2.6, g.ySh + 140); st.items = {}; st.turn = 0.45; st.look = 1; st.lookY = 0.1; st.mood = 'happy'; }
    if (t > SP.a1_x.t) { st.mood = 'worried'; } }
  if (L === 'A2') { st.mood = speaking('a2_her', t) ? 'worried' : 'sad'; if (t > ev('count')) st.mood = 'shock'; }
  if (L === 'B1') { st.mood = speaking('b1_her', t, 0.1) ? 'smug' : 'worried'; if (speaking('b1_her', t)) st.armL = reach(g, -1, -g.sw * 0.2, g.ySh - 200); if (t > SP.b1_x.t) st.mood = 'shock'; }
  if (L === 'B2') { st.mood = 'worried'; if (speaking('b2_her', t)) { st.armL = reach(g, -1, -g.sw * 0.1, g.ySh - 120); } if (t > ev('shot')) st.mood = 'shock'; }
  if (L === 'C1') { st.mood = speaking('c1_her', t) ? 'sad' : 'worried'; if (t > endOf('c1_her')) { st.lookY = 0.6; st.look = 0.4; } }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (speaking('c2_her', t)) { st.armL = reach(g, -1, -g.sw * 0.5, g.ySh + 40); st.lookY = 0; st.look = 0.5; }
    if (t > ev('freeze')) { st.mood = 'shock'; st.lookY = 0.1; st.look = 0.2; } if (t > SP.c2_her2.t - 0.05) { st.mood = 'worried'; st.lookY = 0; } }
  return st; }

// ---------------- world
function world(c, t, L, solo) {
  c.drawImage(BGB, BX0, BY0, BW, BH); const heads = {};
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  blanket(c);
  if (solo !== 'her') cat(c, CATX, BEDTOP + 70, 0.34, t);
  // the phone lights her face: everything dims, a cool glow sits on the face
  const hd = heads.her; c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(120,130,190,.55)'; c.fillRect(BX0, BY0, BW, BH); c.restore();
  c.save(); c.globalCompositeOperation = 'screen'; const gl = c.createRadialGradient(hd.x + 30, hd.y + 40, 20, hd.x + 30, hd.y + 40, 520); gl.addColorStop(0, 'rgba(150,200,255,.55)'); gl.addColorStop(0.5, 'rgba(110,160,255,.18)'); gl.addColorStop(1, 'rgba(110,160,255,0)'); c.fillStyle = gl; c.fillRect(hd.x - 600, hd.y - 600, 1200, 1300); c.restore();
  return heads;
}

// ---------------- camera (hard_cut): WIDE = bedroom; CARD = her + cat under the lesson card; HER / HER_R = singles; HERCAT = she points at the cat
const SH = { WIDE: { x: 0, y: -820, z: 0.74, r: 0 }, CARD: { x: 80, y: -1380, z: 0.8, r: 0 },
  HER: { x: HERX + 60, y: herHY + 60, z: 1.15, r: 0, tag: 'her' }, HER_R: { x: HERX + 40, y: herHY - 140, z: 1.2, r: 0, tag: 'her' },
  HERCAT: { x: 60, y: -930, z: 0.78, r: 0 }, HOOKF: { x: HERX + 40, y: herHY + 120, z: 1.55, r: 0, tag: 'her' } };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') return t < 2.9 ? f(SH.HOOKF) : f(SH.WIDE);   // (under the phone insert until 2.0) -> her lit face -> the room
  const u = t - sc.s; if (u < 0.85) return f(SH.WIDE);
  const l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && speaking('a1_her', t, 0.1, 0.3)) return f(SH.HERCAT);
  if (L === 'C2' && t > ev('freeze') - 0.3) return f(SH.HER_R);
  if (speaking(l + '_her', t, 0.1, 0.3)) return f(SH.HER);
  return f(SH.HER_R); }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, cam.tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- phone screens
function wrapLines(c, s, maxW) { const out = []; let line = ''; for (const w of s.split(' ')) { const tryL = line ? line + ' ' + w : w; if (c.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; } if (line) out.push(line); return out; }
function emmaFace(c, x, y, r) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); c.fillStyle = '#FFD9A8'; c.fillRect(x - r, y - r, 2 * r, 2 * r); const s = r / 150; c.translate(x, y + r * 0.2 - G.emma.headY * s); c.scale(s, s); human(c, EMMA, { t: 0, mood: 'happy', turn: 0, look: 0, armL: reach(G.emma, -1, -G.emma.sw * 0.5, G.emma.ySh + 330), armR: reach(G.emma, 1, G.emma.sw * 0.5, G.emma.ySh + 330) }); c.restore(); }
function catFace(c, x, y, r, t) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); c.fillStyle = '#9FB8E8'; c.fillRect(x - r, y - r, 2 * r, 2 * r); const s = r / 330; c.translate(x, y + 780 * s); c.scale(s, s); catChar(c, { t: 3.075, mood: 'neutral', armL: { a: 0.2, b: 0.3 }, armR: { a: 0.2, b: 0.3 } }); c.restore();
  for (let i = 0; i < 3; i++) { const u = ((t * 0.6 + i / 3) % 1); c.save(); c.globalAlpha = Math.sin(u * Math.PI); txt(c, 'z', x + r * 0.55 + u * r * 0.4, y - r * 0.5 - u * r * 0.5, r * (0.22 + i * 0.06), '#2B3A67'); c.restore(); } }
// the 2017 beach photo: Tom and Emma, sun, sea. labels: show BROTHER / EMMA tags (C2 reveal)
function beach(c, x, y, w, h, year, t, labels = 0) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const sk = c.createLinearGradient(0, y, 0, y + h * 0.55); sk.addColorStop(0, '#5FB8F0'); sk.addColorStop(1, '#BFE6FF'); c.fillStyle = sk; c.fillRect(x, y, w, h);
  c.fillStyle = '#FFE15A'; c.beginPath(); c.arc(x + w * 0.82, y + h * 0.16, h * 0.09, 0, TAU); c.fill();
  c.fillStyle = '#2E8FD0'; c.fillRect(x, y + h * 0.5, w, h * 0.16); c.fillStyle = '#FFFFFF'; for (let i = 0; i < 6; i++) c.fillRect(x + i * w / 6 + 10, y + h * 0.56, w / 10, 4);
  c.fillStyle = '#F3D28E'; c.fillRect(x, y + h * 0.66, w, h * 0.34);
  const s = h / 1500; const pose = (g, side, mood) => ({ t: 0.6, mood, turn: side * 0.25, look: 0, laugh: true, armL: side > 0 ? reach(g, -1, -g.sw * 1.6, g.ySh - 80) : reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: side > 0 ? reach(g, 1, g.sw * 0.6, g.ySh + 300) : reach(g, 1, g.sw * 1.6, g.ySh - 60) });
  c.save(); c.translate(x + w * 0.33, y + h * 1.08); c.scale(s, s); human(c, TOM, pose(G.tom, 1, 'happy')); c.restore();
  c.save(); c.translate(x + w * 0.68, y + h * 1.12); c.scale(s, s); human(c, EMMA, pose(G.emma, -1, 'happy')); c.restore();
  c.restore();
  c.save(); c.translate(x + 14, y + 14); c.fillStyle = 'rgba(224,71,76,.92)'; rr(c, 0, 0, 120, 50, 12); c.fill(); txt(c, year, 60, 27, 30, '#FFFFFF', 'Unb9'); c.restore();
  if (labels > 0) { c.save(); c.globalAlpha = clamp(labels * 2); c.translate(x + w * 0.3, y + h * 0.16); c.scale(labels, labels); c.fillStyle = '#E0474C'; rr(c, -98, -26, 196, 52, 14); c.fill(); txt(c, 'BROTHER', 0, 2, 28, '#FFFFFF', 'Unb9');
    c.strokeStyle = '#E0474C'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 26); c.lineTo(0, 60); c.stroke(); c.restore(); } }
// feed post (hook): liked = 0..1 (heart fills), likes count, burst = big heart over the photo
function post(c, w, h, o, t) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
  txt(c, '02:13', 22, 22, 17, '#2B2F3A', 'Nun9', 'left'); txt(c, '87%', w - 22, 22, 15, '#2B2F3A', 'Nun9', 'right');
  emmaFace(c, 34, 66, 22); txt(c, 'emma.r', 66, 60, 21, '#2B2F3A', 'Nun9', 'left'); txt(c, 'Tenerife', 66, 82, 14, '#7A8290', 'Nun7', 'left');
  beach(c, 0, 100, w, 310, '2017', t); const lk = o.liked || 0;
  if (o.burst > 0) { const b = o.burst; c.save(); c.globalAlpha = Math.min(1, Math.sin(clamp(b) * Math.PI) * 1.6); heart(c, w / 2, 250, 80 * eBack(clamp(b * 2.5), 2.2), '#ED3B55', '#FFFFFF'); c.restore(); }
  const hs = 1 + 0.4 * Math.sin(clamp(lk * 1.2) * Math.PI); heart(c, 32, 440, 19 * hs, lk > 0.2 ? '#ED3B55' : null, lk > 0.2 ? '#ED3B55' : '#2B2F3A');
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 3; c.beginPath(); c.arc(80, 439, 15, 0.5, TAU - 0.2); c.stroke(); c.beginPath(); c.moveTo(114, 432); c.lineTo(144, 422); c.lineTo(130, 452); c.closePath(); c.stroke();
  txt(c, (o.likes || 31) + ' likes', 16, 478, 18, '#2B2F3A', 'Nun9', 'left'); txt(c, 'emma.r  best summer ever ☀️', 16, 506, 16, '#2B2F3A', 'Nun7', 'left'); txt(c, '2017 · 6 YEARS AGO', 16, 532, 13, '#9AA3B2', 'Nun8', 'left'); }
// lock-screen style notification over a screen (k = slide in)
function notif(c, w, k, name, text) { if (k <= 0) return; c.save(); c.translate(0, (1 - eOut(k)) * -230); c.fillStyle = 'rgba(255,255,255,.97)'; rr(c, 12, 14, w - 24, 150, 26); c.fill(); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 2; rr(c, 12, 14, w - 24, 150, 26); c.stroke();
  emmaFace(c, 54, 58, 24); txt(c, name, 90, 52, 24, '#2B2F3A', 'Nun9', 'left'); txt(c, 'now', w - 34, 52, 17, '#7A8290', 'Nun8', 'right');
  c.font = '24px Nun8, Emo'; wrapLines(c, text, w - 60).forEach((l, i) => txt(c, l, 30, 104 + i * 30, 24, '#2B2F3A', 'Nun8', 'left')); c.restore(); }
// messenger with Emma: msgs [{me, text | voice | avatar | photo, k}], typing (dots), toast, flash
function chat(c, w, h, o, t) {
  c.fillStyle = '#EEF1F5'; c.fillRect(0, 0, w, h); let y = 112;
  c.save(); c.beginPath(); c.rect(0, 96, w, h - 96); c.clip();
  for (const m of o.msgs) {
    c.font = '27px Nun9, Emo'; const lines = m.text ? wrapLines(c, m.text, w - 110) : [''];
    const bw = m.voice ? 220 : m.avatar ? 200 : m.photo ? w - 50 : Math.max(...lines.map(l => c.measureText(l).width)) + 36, bh = m.voice ? 64 : m.avatar ? 190 : m.photo ? 230 : lines.length * 34 + 26;
    const bx = m.me ? w - bw - 16 : 16; const kk = m.k === undefined ? 1 : clamp(m.k); if (kk <= 0) continue;
    c.save(); c.globalAlpha = kk; c.translate(0, (1 - eOut(kk)) * 30);
    c.fillStyle = m.me ? '#3C8FE0' : '#FFFFFF'; rr(c, bx, y, bw, bh, 22); c.fill();
    if (m.voice) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(bx + 24, y + 20); c.lineTo(bx + 48, y + 35); c.lineTo(bx + 24, y + 50); c.fill(); for (let i = 0; i < 16; i++) { const a = 6 + Math.abs(Math.sin(i * 1.7 + bx) * Math.sin(i * 0.6)) * 22; c.fillRect(bx + 62 + i * 7, y + 35 - a / 2, 4, a); } txt(c, m.voice, bx + bw - 12, y + 58, 16, '#FFFFFF', 'Nun8', 'right'); }
    else if (m.avatar) { catFace(c, bx + bw / 2, y + 84, 70, t); txt(c, 'your profile picture', bx + bw / 2, y + 172, 17, '#7A8290', 'Nun8'); }
    else if (m.photo) { beach(c, bx + 8, y + 8, bw - 16, bh - 16, '2017', t, m.labels || 0); }
    else lines.forEach((l, i) => txt(c, l, bx + 18, y + 30 + i * 34, 27, m.me ? '#FFFFFF' : '#2B2F3A', 'Nun9', 'left'));
    c.restore(); y += (bh + 14) * eOut(kk);
  }
  if (o.typing) { c.fillStyle = '#FFFFFF'; rr(c, 16, y, 110, 56, 26); c.fill(); for (let i = 0; i < 3; i++) { c.fillStyle = '#9AA3B2'; c.beginPath(); c.arc(46 + i * 25, y + 28 - Math.max(0, Math.sin(t * 9 - i * 0.8)) * 7, 8, 0, TAU); c.fill(); } }
  c.restore();
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, 96); c.fillStyle = '#D5DAE0'; c.fillRect(0, 95, w, 2);
  emmaFace(c, 54, 52, 30); txt(c, 'Emma', 98, 40, 28, '#2B2F3A', 'Nun9', 'left'); txt(c, o.typing ? 'typing…' : 'online', 98, 70, 18, o.typing ? '#3C8FE0' : '#7A8290', 'Nun8', 'left');
  if (o.toast) { c.fillStyle = 'rgba(43,47,58,.92)'; rr(c, 40, h - 120, w - 80, 70, 35); c.fill(); txt(c, o.toast, w / 2, h - 84, 24, '#FFFFFF', 'Nun9'); }
  if (o.flash > 0) { c.fillStyle = `rgba(255,255,255,${o.flash})`; c.fillRect(0, 0, w, h); }
}
// Emma's profile grid (B1): rows of years, every photo liked; scroll in px
function grid(c, w, h, scroll, t, t0) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); const cell = (w - 8) / 3;
  c.save(); c.beginPath(); c.rect(0, 96, w, h - 96); c.clip(); let y = 100 - scroll, n = 0;
  for (const yr of ['2019', '2018', '2017']) { c.fillStyle = '#F4F1EC'; c.fillRect(0, y, w, 64); txt(c, yr, 20, y + 33, 34, '#2B2F3A', 'Unb9', 'left'); y += 66;
    for (let r = 0; r < 2; r++) { for (let k = 0; k < 3; k++) { const x = k * (cell + 4), i = n++; c.save(); c.beginPath(); c.rect(x, y, cell, cell); c.clip();
      const hue = ['#7FC8F8', '#F7B6CF', '#FFD58A', '#A7E0B5', '#C9B6F2', '#F7A88A'][(i * 5) % 6]; c.fillStyle = hue; c.fillRect(x, y, cell, cell); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(x + cell * (0.3 + hash(i) * 0.4), y + cell * 0.45, cell * 0.22, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x, y + cell * 0.7, cell, cell * 0.3); c.restore();
      const hk = eBack(P(t, t0 + 0.25 + i * 0.12, t0 + 0.4 + i * 0.12), 2.4); if (hk > 0) { c.save(); c.translate(x + cell - 30, y + cell - 30); c.scale(hk, hk); heart(c, 0, 0, 20, '#ED3B55', '#FFFFFF'); c.restore(); } }
      y += cell + 4; } }
  c.restore(); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, 96); c.fillStyle = '#D5DAE0'; c.fillRect(0, 95, w, 2); emmaFace(c, 54, 50, 30); txt(c, 'emma.r', 98, 40, 28, '#2B2F3A', 'Nun9', 'left'); txt(c, '312 posts', 98, 70, 18, '#7A8290', 'Nun8', 'left'); }

// the phone in screen space on its own backdrop (hard_cut object shot)
const PH = { x: 540, y: 1010, s: 1.2 }, ZM = 1.3;
const zoom = fn => (c, w, h) => { c.save(); c.scale(ZM, ZM); fn(c, w / ZM, h / ZM); c.restore(); };
function backdrop(c, k) { c.save(); c.globalAlpha = clamp(k * 4); const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2A2F55'); g.addColorStop(1, '#141629'); c.fillStyle = g; c.fillRect(0, 0, W, HH); c.restore(); }
function insert(c, k, screen) { if (k <= 0) return; backdrop(c, k); const s = PH.s * lerp(0.6, 1, k); c.save(); c.globalAlpha = clamp(k * 2); K.phone(c, PH.x, PH.y + (1 - k) * 260, s, zoom(screen)); c.restore(); }
// Emma's spoken line: name tag + translation under the phone
function emmaLine(c, t, id, k) { if (k <= 0 || !SP[id]) return; const a = eBack(P(t, SP[id].t - 0.05, SP[id].t + 0.2), 2) * k; if (a <= 0) return; const ru = SP[id].ru; c.save(); c.translate(540, 1555); c.scale(a, a);
  c.font = '40px Nun9, Emo'; const tw = Math.min(900, c.measureText(ru).width + 80); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -tw / 2 + 6, -40, tw, 92, 26); c.fill(); c.fillStyle = C.white; rr(c, -tw / 2, -46, tw, 92, 26); c.fill();
  c.fillStyle = '#FF7A9A'; rr(c, -tw / 2 + 20, -74, 130, 40, 14); c.fill(); txt(c, 'EMMA', -tw / 2 + 85, -53, 24, '#FFFFFF', 'Unb9'); fitTxt(c, ru, 0, 2, 40, C.pinkD || '#C2507A', tw - 50, 'Nun9'); c.restore(); }
// big status banner under the phone
function banner(c, k, en, col, ru, y = 1560) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(-0.025); c.scale(k, k); const hh = ru ? 132 : 112;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -470 + 8, -hh / 2 + 10, 940, hh, 26); c.fill(); c.fillStyle = col; rr(c, -470, -hh / 2, 940, hh, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -470, -hh / 2, 940, hh, 26); c.stroke();
  fitTxt(c, en, 0, ru ? -18 : 2, 54, '#FFFFFF', 860); if (ru) fitTxt(c, ru, 0, 38, 30, '#FFFFFF', 880, 'Nun9'); c.restore(); }
function bigHeart(c, k, n) { if (k <= 0) return; c.save(); c.translate(800, 560); c.rotate(0.08); c.scale(k, k); heart(c, 0, 0, 120, '#ED3B55', '#FFFFFF'); txt(c, String(n), 0, -10, 84, '#FFFFFF'); c.restore(); }

const HOOK_N = { name: 'Emma', text: 'Did you just like my photo from 2017? 😳' };
const voice = id => ({ me: true, voice: '0:' + String(Math.max(1, Math.round(SP[id].d))).padStart(2, '0') });
function overlays(c, t, L) { const ev = k => SC[L].ev[k];   // level-local events ('chat' repeats across levels)
  if (L === 'A1') { const a = ev('chat'), k = win(t, a - 0.05, SP.a1_nar.t - 0.1);
    insert(c, k, (cc, w, h) => chat(cc, w, h, { msgs: [voice('a1_her'), { me: false, text: SP.a1_x.text, k: P(t, a + 0.1, a + 0.35) }, { me: false, avatar: true, k: P(t, a + 0.9, a + 1.2) }] }, t)); emmaLine(c, t, 'a1_x', k); }
  if (L === 'A2') { const a = ev('chat'), k = win(t, a - 0.05, SP.a2_nar.t - 0.1);
    insert(c, k, (cc, w, h) => chat(cc, w, h, { msgs: [{ me: false, text: SP.a1_x.text }, voice('a2_her'), { me: false, text: SP.a2_x.text, k: P(t, a + 0.1, a + 0.35) }] }, t));
    bigHeart(c, k * eBack(P(t, ev('count'), ev('count') + 0.3), 2.2), 47); emmaLine(c, t, 'a2_x', k); }
  if (L === 'B1') { const s = ev('scroll'), k = win(t, s - 0.05, SP.b1_nar.t - 0.1), sc = eIO(P(t, s + 0.2, endOf('b1_x') - 0.2)) * 380;
    insert(c, k, (cc, w, h) => { grid(cc, w, h, sc, t, s); notif(cc, w, P(t, SP.b1_x.t, SP.b1_x.t + 0.3), 'Emma', SP.b1_x.text); }); emmaLine(c, t, 'b1_x', k); }
  if (L === 'B2') { const a = ev('chat'), s = ev('shot'), k = win(t, a - 0.05, SP.b2_nar.t - 0.1);
    insert(c, k, (cc, w, h) => chat(cc, w, h, { msgs: [{ me: false, text: SP.b1_x.text }, voice('b2_her'), { me: false, text: SP.b2_x.text, k: P(t, a + 0.1, a + 0.3) }], flash: 1 - P(t, s, s + 0.4), toast: t > s + 0.1 ? 'Screenshot saved' : null }, t));
    if (t < s + 0.1) emmaLine(c, t, 'b2_x', k); banner(c, k * eBack(P(t, s + 0.15, s + 0.4), 2), 'SCREENSHOT SAVED', '#E0474C', 'Эмма сохранила скриншот'); }
  if (L === 'C1') { const a = ev('type'), k = win(t, a - 0.05, SP.c1_nar.t - 0.1), u = t - a, typing = u < 0.55 || (u > 0.75 && u < 1.3) || u > 1.5;
    insert(c, k, (cc, w, h) => chat(cc, w, h, { msgs: [{ me: false, text: SP.b2_x.text }, voice('c1_her')], typing }, t));
    banner(c, k * eBack(P(t, a + 0.2, a + 0.45), 2), 'EMMA IS TYPING…', '#3C8FE0', 'печатает… печатает… печатает…'); }
  if (L === 'C2') { const a = endOf('c2_her') + 0.05, m = ev('chat'), k = win(t, a, SP.c2_her2.t - 0.3, 0.25);
    insert(c, k, (cc, w, h) => chat(cc, w, h, { msgs: [voice('c2_her'), { me: false, text: SP.c2_x.text, k: P(t, m + 0.1, m + 0.3) }, { me: false, photo: true, labels: eBack(P(t, m + 0.45, m + 0.75), 2), k: P(t, m + 0.25, m + 0.5) }], typing: t < m + 0.1 }, t));
    emmaLine(c, t, 'c2_x', k); }
}

// ---------------- hook & frame
function drawHook(c, t) {
  if (t < 2.0) { backdrop(c, 1); K.phone(c, PH.x, PH.y + 80, PH.s, zoom((cc, w, h) => { post(cc, w, h, { liked: P(t, 0.48, 0.75), burst: P(t, 0.5, 1.2), likes: t > 0.5 ? 32 : 31 }, t); notif(cc, w, P(t, 0.95, 1.2), HOOK_N.name, HOOK_N.text); }));
  } else { const cam = CAM[Math.min(CAM.length - 1, Math.round(t * FPS))]; drawWorld(c, t, 'hook', cam); if (t > 2.05 && t < 2.85) K.pop(c, t, 'О НЕТ…', 2.1, 2.7, 540, 1170, C.white, -0.06, 90); }
  Hq.vignette(c, W, HH, 0.3); K.titleRibbon(c, t, 540, 410); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); UI.captions(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['КТО ТОЖЕ СЛУЧАЙНО', 'ЛАЙКАЛ СТАРОЕ ФОТО?'], qSize: 48, rows: [['A2', "I didn't mean to."], ['B1', 'My thumb slipped.'], ['B2', 'Can we pretend this never happened?']], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ЛИСТАЕТ БЫВШИХ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 1.0, G.her.ySh + 140), items: { R: phoneItem() } }, 0, 0) }); { const k = eBack(P(t - SC.outro.s, 0.55, 0.85), 2); if (k > 0) { c.save(); c.translate(540, 420 + Math.sin(t * 6) * 6); c.scale(k, k); txt(c, '👇', 0, 0, 72, '#000', 'Emo'); c.restore(); } }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.3);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  if (sc.id === 'A2' || sc.id === 'B2') sweat(c, { ...proj(heads.her), hh: heads.her.hh * cam.z }, clamp(P(t, endOf(sc.id.toLowerCase() + '_her') - 0.4, endOf(sc.id.toLowerCase() + '_her'))));
  overlays(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { hold: { c2_her: 0.05, c1_her: 0.05, a1_her: 0.1, a2_her: 0.1, b1_her: 0.05, b2_her: 0.05 } });
  K.hud(c, t, sc);
}
E.run('likeex', NF, renderFrame);
