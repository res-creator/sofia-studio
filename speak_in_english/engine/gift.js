// "Awful gift" episode renderer: node gift.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, shade, rgba, paint, rr, human, pug, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/gift/timeline.json', 'utf8'));
for (const s of TL.speech) { s.text = s.text.replace(/\[[^\]]*\]\s*/g, ''); if (s.words) s.words = s.words.filter(w => !/^\[/.test(w[0])); }
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const talk = (who, t) => { let a = 0; for (const s of TL.speech) if (s.who === who && t >= s.t && t < s.t + s.d) { const i = Math.floor((t - s.t) * FPS); a = Math.max(a, s.env[Math.min(i, s.env.length - 1)] || 0); } return a; };
const speaking = (id, t, pre = 0, post = 0) => SP[id] && t >= SP[id].t - pre && t < SP[id].t + SP[id].d + post;
const endOf = id => SP[id].t + SP[id].d;
const EV = k => { for (const L of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) { const e = ((SC[L] || {}).ev || {})[k]; if (e !== undefined) return e; } return 1e9; };
const wordT = (id, w) => { const s = SP[id]; if (!s) return null; const x = s.words.find(q => q[0].toLowerCase().replace(/[«»!?.,:]/g, '').startsWith(w)); return x ? s.t + x[1] : null; };

// ---------------- cast
const SW = '#D9443F', SW2 = '#FFF4E4', SWD = '#A82E2B';
const HER = { ...BASE.her_london };
const HER_W = { ...BASE.her_london, top: { type: 'sweater', col: SW } };
const PAM = { ...BASE.nana, top: { type: 'cardigan', col: '#8FB4D9', col2: '#F2EBDD' }, bottom: { type: 'skirt', col: '#6A5A7A' }, glasses: { col: '#C2507A' } };
const G = { her: geom(HER), pam: geom(PAM) };
const HERX = 600, NBX = -180, FY = 60, WARDX = 1180;

// ---------------- knitted things
function knitTex(c, x0, y0, w, h, col) { c.save(); c.strokeStyle = rgba(shade(col, 0.6), 0.35); c.lineWidth = 3; for (let y = y0 + 10; y < y0 + h; y += 22) for (let x = x0 + 8; x < x0 + w; x += 20) { c.beginPath(); c.moveTo(x - 6, y - 6); c.lineTo(x, y + 4); c.lineTo(x + 6, y - 6); c.stroke(); } c.restore(); }
// Auntie Pam's knitted face (the running gag): o = { cry, wink, shock }
function knitFace(c, x, y, r, o = {}, t = 0) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#D9D4DA'; c.beginPath(); c.arc(0, -r * 1.05, r * 0.42, 0, TAU); c.fill(); // bun
  c.fillStyle = '#F2C9AE'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  c.fillStyle = '#D9D4DA'; c.beginPath(); c.arc(0, -r * 0.2, r, Math.PI * 1.05, Math.PI * 1.95); c.fill();
  c.strokeStyle = '#C2507A'; c.lineWidth = r * 0.09;
  for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.4, r * 0.05, r * 0.26, 0, TAU); c.stroke(); }
  c.beginPath(); c.moveTo(-r * 0.14, r * 0.05); c.lineTo(r * 0.14, r * 0.05); c.stroke();
  c.fillStyle = '#2B2F3A'; c.strokeStyle = '#2B2F3A'; c.lineWidth = r * 0.08;
  for (const s of [-1, 1]) { if (o.wink && s > 0) { c.beginPath(); c.moveTo(s * r * 0.4 - r * 0.13, r * 0.06); c.lineTo(s * r * 0.4 + r * 0.13, r * 0.06); c.stroke(); } else { c.beginPath(); c.arc(s * r * 0.4, r * 0.06, r * (o.shock ? 0.13 : 0.09), 0, TAU); c.fill(); } }
  c.fillStyle = 'rgba(240,120,140,.6)'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.62, r * 0.42, r * 0.14, 0, TAU); c.fill(); }
  c.strokeStyle = '#B03A4A'; c.lineWidth = r * 0.09; c.beginPath();
  if (o.cry) c.arc(0, r * 0.72, r * 0.25, Math.PI * 1.15, Math.PI * 1.85); else if (o.shock) { c.fillStyle = '#7A2030'; c.ellipse(0, r * 0.58, r * 0.14, r * 0.2, 0, 0, TAU); c.fill(); } else c.arc(0, r * 0.35, r * 0.32, 0.25, Math.PI - 0.25);
  c.stroke();
  if (o.cry) { c.fillStyle = '#7FC6F2'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const k = ((t * 1.6 + i / 3) % 1); c.globalAlpha = 1 - k; c.beginPath(); c.ellipse(s * r * 0.45, r * 0.25 + k * r * 1.1, r * 0.07, r * 0.11, 0, 0, TAU); c.fill(); } c.globalAlpha = 1; }
  c.restore();
}
// a held sweater hanging from two hands at (±hw, top); len = body length
function heldSweater(c, cx, top, hw, len, o = {}, t = 0) {
  const w = hw * 2, sl = Math.min(len * 0.9, 520);
  paint(c, q => { q.m(cx - hw, top); q.l(cx - hw - 40, top + sl); q.l(cx - hw - 130, top + sl - 20); q.l(cx - hw - 70, top); q.z(); }, SW, { sd: 6, hd: 3, lw: 3 });
  paint(c, q => { q.m(cx + hw, top); q.l(cx + hw + 40, top + sl); q.l(cx + hw + 130, top + sl - 20); q.l(cx + hw + 70, top); q.z(); }, SW, { sd: 6, hd: 3, lw: 3 });
  paint(c, q => { q.m(cx - hw - 6, top - 10); q.q(cx, top + 40, cx + hw + 6, top - 10); q.l(cx + hw + 14, top + len); q.q(cx, top + len + 24, cx - hw - 14, top + len); q.z(); }, SW, { sd: 10, hd: 5, lw: 3.5, inner: k => {
    knitTex(k, cx - hw - 14, top, w + 28, len + 24, SW);
    k.fillStyle = SWD; k.fillRect(cx - hw - 14, top + len - 40, w + 28, 40);
    k.fillStyle = SW2; for (let i = 0; i < 9; i++) { const x = cx - hw + (i + 0.5) * w / 9, y = top + len - 120; k.save(); k.translate(x, y); for (let a = 0; a < 3; a++) { k.rotate(Math.PI / 3); k.fillRect(-14, -3, 28, 6); } k.restore(); }
  } });
  knitFace(c, cx, top + Math.min(230, len * 0.38), Math.min(hw * 0.62, 120), o, t);
}
function hat(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-150, 30); q.q(-150, -150, 0, -160); q.q(150, -150, 150, 30); q.z(); }, SW, { sd: 8, hd: 4, lw: 3.5, inner: k => { knitTex(k, -150, -160, 300, 190, SW); k.fillStyle = SW2; k.fillRect(-150, -40, 300, 26); } }); paint(c, q => { q.m(-160, 10); q.l(160, 10); q.l(160, 60); q.l(-160, 60); q.z(); }, SWD, { sd: 3, hd: 2, lw: 3 }); paint(c, q => q.e(0, -175, 46, 46), SW2, { sd: 4, hd: 3, lw: 3 }); knitFace(c, 0, -70, 44); c.restore(); }
function sweaterOnPug(c, t) { paint(c, q => { q.m(-130, -170); q.q(0, -215, 130, -170); q.l(150, -60); q.q(0, -20, -150, -60); q.z(); }, SW, { sd: 8, hd: 4, lw: 3, inner: k => knitTex(k, -150, -215, 300, 190, SW) }); knitFace(c, 20, -120, 46, {}, t); }
function cat(c, t, sweater) { c.save(); const g = '#8A8F9A'; paint(c, q => { q.m(110, -30); q.q(240, -40, 210, -200); }, g, { lw: 0 }); c.strokeStyle = g; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(100, -30); c.quadraticCurveTo(230 + Math.sin(t * 3) * 20, -50, 200, -210); c.stroke();
  paint(c, q => q.e(0, -130, 120, 130), g, { sd: 10, hd: 5, lw: 3 }); if (sweater) { paint(c, q => { q.m(-115, -190); q.q(0, -230, 115, -190); q.l(120, -60); q.q(0, -30, -120, -60); q.z(); }, SW, { sd: 8, hd: 4, lw: 3, inner: k => knitTex(k, -120, -230, 240, 200, SW) }); knitFace(c, 0, -130, 40, {}, t); }
  c.save(); c.translate(0, -300); paint(c, q => q.e(0, 0, 95, 85), g, { sd: 8, hd: 4, lw: 3 }); for (const s of [-1, 1]) paint(c, q => { q.m(s * 30, -70); q.l(s * 90, -120); q.l(s * 88, -30); q.z(); }, g, { sd: 4, hd: 2, lw: 3 });
  c.fillStyle = '#E9D36A'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 34, -6, 16, 20, 0, 0, TAU); c.fill(); } c.fillStyle = '#1A1A1A'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 34, -4, 5, 16, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#E87A92'; c.beginPath(); c.moveTo(-10, 24); c.lineTo(10, 24); c.lineTo(0, 36); c.fill(); c.restore(); c.restore(); }
function needles(ctx) { ctx.rotate(-0.4); ctx.strokeStyle = '#C9A06A'; ctx.lineWidth = 9; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-60 + s * 10, -110); ctx.lineTo(50 + s * 10, 60); ctx.stroke(); } paint(ctx, q => q.e(-20, -10, 40, 36), SW, { sd: 4, hd: 3, lw: 3 }); }
function giftBox(c, x, y, s, open = 0) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-150, -60); q.l(150, -60); q.l(150, 150); q.l(-150, 150); q.z(); }, '#F7B6CF', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = C.gold; c.fillRect(-22, -60, 44, 210);
  c.save(); c.translate(0, -60 - open * 160); c.rotate(-open * 0.5); paint(c, q => { q.m(-165, -50); q.l(165, -50); q.l(165, 10); q.l(-165, 10); q.z(); }, '#F7B6CF', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = C.gold; c.fillRect(-22, -50, 44, 60); for (const s2 of [-1, 1]) { c.beginPath(); c.ellipse(s2 * 50, -76, 54, 30, s2 * 0.5, 0, TAU); c.fill(); } c.restore();
  // tag: Made with love, A̶u̶n̶t̶i̶e̶ ̶P̶a̶m̶
  c.save(); c.translate(120, 40); c.rotate(0.18); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 3; rr(c, -10, -6, 200, 96, 10); c.fill(); c.stroke(); c.fillStyle = '#2B2F3A'; c.font = '22px Nun9'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('Made with love,', 6, 22); c.fillText('Auntie Pam ♥', 6, 58); c.strokeStyle = C.red; c.lineWidth = 4; c.beginPath(); c.moveTo(4, 58); c.lineTo(146, 54); c.stroke(); c.restore();
  c.restore(); }

// ---------------- room (prerendered, slightly blurred)
const BX0 = -1500, BY0 = -2600, BW = 4200, BH = 3200, BS = 0.5;
function photoFrame(c, x, y, w, h) { c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + 8, y + 10, w, h); c.fillStyle = '#C9A06A'; c.fillRect(x, y, w, h); c.fillStyle = '#F7EAD8'; c.fillRect(x + 14, y + 14, w - 28, h - 28); knitFace(c, x + w / 2, y + h / 2 + 10, Math.min(w, h) * 0.28); }
function drawRoom(c) {
  c.fillStyle = '#F5D3DA'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 160; i++) { const x = BX0 + hash(i) * BW, y = BY0 + hash(i * 7) * (BH - 700); for (let p = 0; p < 5; p++) { c.beginPath(); c.arc(x + Math.cos(p * 1.26) * 14, y + Math.sin(p * 1.26) * 14, 10, 0, TAU); c.fill(); } }
  c.fillStyle = '#E9B9C4'; c.fillRect(BX0, -560, BW, 40); c.fillStyle = '#D9A4B2'; c.fillRect(BX0, -520, BW, 520);
  // window with curtains
  c.fillStyle = '#FFFDF8'; c.fillRect(-90, -1900, 520, 700); c.fillStyle = '#A9D8F2'; c.fillRect(-70, -1880, 480, 660); c.fillStyle = '#FFFDF8'; c.fillRect(160, -1880, 20, 660); c.fillRect(-70, -1560, 480, 20);
  for (const s of [-1, 1]) paint(c, q => { const x = s < 0 ? -150 : 430; q.m(x, -1960); q.l(x + 130, -1960); q.q(x + 90 + s * 20, -1500, x + 120, -1150); q.l(x, -1150); q.z(); }, '#C2507A', { sd: 8, hd: 4, lw: 3 });
  // photos of Pam everywhere
  photoFrame(c, -700, -1800, 230, 280); photoFrame(c, 620, -1820, 200, 200); photoFrame(c, 880, -1700, 170, 210); photoFrame(c, -980, -1500, 180, 180);
  // sofa
  paint(c, q => { q.m(-1100, -700); q.l(-420, -700); q.l(-420, -120); q.l(-1100, -120); q.z(); }, '#8FB4D9', { sd: 12, hd: 6, lw: 3 }); paint(c, q => { q.m(-1140, -420); q.l(-380, -420); q.l(-380, -40); q.l(-1140, -40); q.z(); }, '#7AA0C6', { sd: 10, hd: 5, lw: 3 });
  // standard lamp
  c.fillStyle = '#C9A06A'; c.fillRect(470, -1250, 14, 1200); paint(c, q => { q.m(390, -1250); q.l(564, -1250); q.l(520, -1400); q.l(434, -1400); q.z(); }, '#F7DFA0', { sd: 6, hd: 4, lw: 3 });
  // knitting basket with yarn
  paint(c, q => { q.m(-60, -150); q.l(200, -150); q.l(180, 30); q.l(-40, 30); q.z(); }, '#C99A64', { sd: 6, hd: 3, lw: 3 }); for (const [x, col] of [[10, SW], [80, '#8FB4D9'], [140, '#F2C14E']]) paint(c, q => q.e(x, -170, 46, 42), col, { sd: 4, hd: 3, lw: 3 });
  // floor
  const fg = c.createLinearGradient(0, 0, 0, 600); fg.addColorStop(0, '#B98A62'); fg.addColorStop(1, '#9A6E4A'); c.fillStyle = fg; c.fillRect(BX0, 0, BW, BH + BY0);
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 3; for (let y = 40; y < 600; y += 60) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
  paint(c, q => q.e(200, 80, 900, 90), '#E9A23B', { sd: 0, hd: 0, lw: 0 });
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(2px)'; drawRoom(c); }
function wardrobe(c, k, t) { // k = doors open 0..1, contents all knitted
  const x = WARDX - 260, y = FY - 1500, w = 520, h = 1500;
  paint(c, q => { q.m(x, y); q.l(x + w, y); q.l(x + w, y + h); q.l(x, y + h); q.z(); }, '#9A6A4A', { sd: 12, hd: 6, lw: 4 });
  c.fillStyle = '#5A3A2A'; c.fillRect(x + 30, y + 40, w - 60, h - 80);
  if (k > 0) { c.save(); c.beginPath(); c.rect(x + 30, y + 40, w - 60, h - 80); c.clip(); c.strokeStyle = '#C9C9C9'; c.lineWidth = 8; c.beginPath(); c.moveTo(x + 40, y + 140); c.lineTo(x + w - 40, y + 140); c.stroke();
    for (let i = 0; i < 4; i++) { const cx = x + 100 + i * 108, sw = Math.sin(t * 2 + i) * 0.03; c.save(); c.translate(cx, y + 150); c.rotate(sw); heldSweater(c, 0, 20, 46, 330 + (i % 2) * 120, {}, t); c.restore(); }
    c.restore(); }
  for (const s of [-1, 1]) { const dw = (w - 60) / 2, hx = s < 0 ? x + 30 : x + w - 30, ow = dw * Math.cos(k * Math.PI * 0.85); c.save(); c.translate(hx, y + 40); c.scale(s < 0 ? 1 : -1, 1);
    paint(c, q => { q.m(0, 0); q.l(Math.max(ow, -dw * 0.9), -14 * k); q.l(Math.max(ow, -dw * 0.9), h - 80 + 14 * k); q.l(0, h - 80); q.z(); }, k > 0.5 ? '#7A5038' : '#A87A54', { sd: 6, hd: 3, lw: 4 }); c.restore(); }
}

// ---------------- characters
function put(c, cfg, st, x, y = FY, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x * s, y: y + r.head.y * s, hh: r.hh * s, r }; }
function herLook(t, L) { // what she has on at time t
  const grow = clamp((t - EV('grow')) / 0.6), hatOn = t > EV('hat'), wear = t > EV('wear') && L !== 'C2' && L !== 'hook';
  return { grow: L === 'C2' ? 1 : eBack(grow, 1.2), hatOn: L !== 'C2' && L !== 'hook' && hatOn, wear, outro: L === 'outro' };
}
function herState(t, L) {
  const g = G.her, lk = herLook(t, L);
  const st = { t, talk: talk('her', t), mood: 'worried', turn: -0.45, look: -0.7, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 280) };
  const hold = !lk.wear && L !== 'C2' && L !== 'outro';
  if (hold) { const top = g.ySh + 110, hw = g.sw * 1.0; st.armL = reach(g, -1, -hw, top); st.armR = reach(g, 1, hw, top); st.afterTorso = cc => heldSweater(cc, 0, top, hw, lerp(560, -top - 30, lk.grow), { cry: L === 'C1' && t > EV('tear') }, t); }
  if (lk.wear || L === 'outro') st.afterTorso = cc => { const yW = g.ySh + 470; paint(cc, q => { q.m(-g.sw * 0.95, yW - 40); q.l(g.sw * 0.95, yW - 40); q.l(g.sw * 1.15, -30); q.l(-g.sw * 1.15, -30); q.z(); }, SW, { sd: 10, hd: 5, lw: 3.5, inner: k => { knitTex(k, -g.sw * 1.2, yW - 40, g.sw * 2.4, -yW, SW); k.fillStyle = SWD; k.fillRect(-g.sw * 1.2, -70, g.sw * 2.4, 40); } }); knitFace(cc, 0, g.ySh + 230, 92, { wink: L === 'outro' }, t); };
  if (lk.hatOn || L === 'outro') st.front = (cc, gg) => hat(cc, gg.head.x, gg.head.y - g.hh * 0.78, 1.05);
  if (L === 'A1' && speaking('a1_her', t, 0.05)) { st.mood = 'neutral'; st.look = -0.6; }
  if (L === 'A1' && t > EV('grow')) st.mood = 'shock';
  if (L === 'A2') { st.mood = speaking('a2_her', t, 0.05) ? 'happy' : (t > EV('hat') ? 'worried' : 'neutral'); }
  if (L === 'B1') { st.mood = 'neutral'; if (t > EV('wardrobe')) { st.mood = 'shock'; st.turn = 0.5; st.look = 0.9; } }
  if (L === 'B2') { st.mood = speaking('b2_her', t, 0.05) ? 'happy' : 'neutral'; if (t > EV('dog') - 0.1) { st.mood = 'shock'; st.turn = 0.4; st.look = 0.8; st.lookY = 0.6; } }
  if (L === 'C1') { st.mood = 'neutral'; if (t > EV('tear')) st.mood = 'worried'; if (t > EV('wear')) { st.mood = 'happy'; st.laugh = speaking('c1_her2', t); } if (t > EV('flash') - 0.05) st.mood = 'happy'; }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; const box = t < EV('open'); if (box) { const top = g.ySh + 260; st.armL = reach(g, -1, -g.sw * 0.9, top + 40); st.armR = reach(g, 1, g.sw * 0.9, top + 40); st.afterTorso = cc => giftBox(cc, 0, top + 60, 1.05); } if (t > SP.c2_x.t) st.mood = 'smug'; if (t > EV('wink')) { st.mood = 'happy'; st.squint = true; } }
  if (L === 'hook') { st.mood = 'worried'; st.turn = -0.2; st.look = 0.2; }
  if (L === 'outro') { st.mood = 'happy'; st.turn = 0; st.look = 0; }
  return st;
}
function pamState(t, L) {
  const g = G.pam, st = { t, talk: talk('pam', t), mood: 'happy', turn: 0.4, look: 0.8, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 300), armR: reach(g, 1, g.sw * 0.5, g.ySh + 300) };
  const clasp = () => { st.armL = reach(g, -1, -g.sw * 0.15, g.ySh + 200); st.armR = reach(g, 1, g.sw * 0.15, g.ySh + 200); };
  const mine = TL.speech.find(s => s.who === 'pam' && t >= s.t - 0.05 && t < s.t + s.d); if (mine) { const u = (t - mine.t) * 4.5; st.armR = reach(g, 1, g.sw * 1.7 + Math.sin(u) * 30, g.ySh + 230 + Math.cos(u) * 30); } else clasp();
  if (L === 'hook') { clasp(); st.mood = 'happy'; }
  if (L === 'A1' && t > EV('grow') - 1.0 && t < EV('grow') + 0.8) { st.items = { R: needles }; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 120 + Math.sin(t * 30) * 20); }
  if (L === 'B1' && t > EV('wardrobe') - 0.2) { st.armR = reach(g, 1, g.sw * 2.6, g.ySh + 100); st.mood = 'smug'; }
  if (L === 'C1') { if (t > EV('tear')) { st.mood = 'sad'; st.tilt = 0.06; st.front = (cc, gg) => { cc.fillStyle = '#7FC6F2'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const k = ((t * 1.4 + i / 3) % 1); cc.globalAlpha = 1 - k; cc.beginPath(); cc.ellipse(gg.head.x + s * g.hw * 0.42 + g.hw * 0.12, gg.head.y + g.hh * 0.15 + k * g.hh * 0.9, 9, 14, 0, 0, TAU); cc.fill(); } cc.globalAlpha = 1; }; }
    if (t > EV('wear') + 0.2) { st.mood = 'happy'; st.front = null; } if (t > SP.c1_x2.t - 0.3) { st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 20); st.items = { R: phoneItem }; } }
  if (L === 'C2') { st.mood = 'happy'; if (t > EV('open')) { const top = g.ySh + 110, hw = g.sw * 1.0; st.armL = reach(g, -1, -hw, top); st.armR = reach(g, 1, hw, top); st.afterTorso = cc => heldSweater(cc, 0, top, hw, -top - 40, { shock: true }, t); st.mood = 'shock'; if (t > SP.c2_x.t - 0.2) st.mood = 'surprised'; if (t > EV('wink')) st.mood = 'annoyed'; }
    st.front = (cc, gg) => { // party hat
      cc.save(); cc.translate(gg.head.x - 10, gg.head.y - g.hh * 0.95); cc.rotate(-0.15); paint(cc, q => { q.m(-60, 0); q.l(60, 0); q.l(0, -170); q.z(); }, '#F2C14E', { sd: 6, hd: 3, lw: 3, inner: k => { k.fillStyle = '#E0474C'; for (let i = 0; i < 4; i++) { k.beginPath(); k.arc(-20 + (i % 2) * 40, -30 - i * 34, 9, 0, TAU); k.fill(); } } }); cc.restore(); }; }
  if (L === 'outro') { st.mood = 'happy'; st.turn = 0.2; }
  return st;
}
function phoneItem(ctx) { ctx.rotate(-0.1); paint(ctx, q => { q.m(-44, -150); q.l(44, -150); q.l(44, 20); q.l(-44, 20); q.z(); }, '#2B2F3A', { sd: 4, hd: 2, lw: 3 }); ctx.fillStyle = '#9FD8F2'; ctx.fillRect(-34, -138, 68, 146); }
function pets(c, t, L) {
  const dog = EV('dog'), ct = EV('cat'); if (L !== 'B2' && L !== 'C1' && L !== 'C2') return;
  const k = L === 'B2' ? eOut(P(t, dog - 0.4, dog + 0.6)) : 1, x = lerp(WARDX + 900, HERX + 420, k);
  c.save(); c.translate(x, FY + 10); c.scale(0.95, 0.95); pug(c, { t, tilt: Math.sin(t * 2) * 0.08, tongue: true }); sweaterOnPug(c, t); c.restore();
  if (L !== 'B2' || t > ct) { const k2 = L === 'B2' ? eOut(P(t, ct - 0.3, ct + 0.5)) : 1; c.save(); c.translate(lerp(WARDX + 900, HERX + 760, k2), FY + 10); c.scale(0.85, 0.85); cat(c, t, true); c.restore(); }
}
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  const heads = {};
  if (L === 'C2' || L === 'hook2') { // birthday decor
    c.strokeStyle = '#6A4630'; c.lineWidth = 4; c.beginPath(); c.moveTo(-600, -1950); c.quadraticCurveTo(250, -1750, 1100, -1950); c.stroke();
    const txt = 'HAPPY BIRTHDAY PAM'; for (let i = 0; i < txt.length; i++) { const u = (i + 0.5) / txt.length, x = lerp(-600, 1100, u), y = -1950 + 4 * 200 * u * (1 - u); c.fillStyle = ['#E0474C', '#F2C14E', '#3C8FE0', '#4CAF6A'][i % 4]; c.beginPath(); c.moveTo(x - 40, y); c.lineTo(x + 40, y); c.lineTo(x, y + 100); c.fill(); c.fillStyle = '#FFFDF8'; c.font = '34px Unb9'; c.textAlign = 'center'; c.fillText(txt[i], x, y + 40); }
    for (const [x, y, col] of [[-500, -1500, '#E0474C'], [-380, -1620, '#F2C14E'], [900, -1550, '#3C8FE0'], [1020, -1420, '#EE5E9A']]) { c.strokeStyle = '#6A6A6A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 110); c.lineTo(x + 10, y + 500); c.stroke(); paint(c, q => q.e(x, y + Math.sin(t * 2 + x) * 10, 80, 100), col, { sd: 10, hd: 6, lw: 3 }); }
  }
  wardrobe(c, L === 'B1' || L === 'B2' ? eOut(P(t, EV('wardrobe') - 0.15, EV('wardrobe') + 0.35)) : 0, t);
  heads.pam = put(c, PAM, pamState(t, L), NBX);
  heads.her = put(c, herLook(t, L).wear ? HER_W : HER, herState(t, L), HERX);
  pets(c, t, L);
  return heads;
}

function shotFor(t) {
  const sc = sceneAt(t), L = sc.id;
  const herHY = FY + G.her.headY, pamHY = FY + G.pam.headY, hx = HERX, nx = NBX;
  const two = { x: 210, y: Math.min(herHY, pamHY) + 230, z: 0.86, r: 0 };
  if (L === 'hook' || L === 'outro') return two;
  const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.82, cut: u < 0.85 };
  const l = L.toLowerCase(), herC = { x: hx - 150, y: herHY + 170, z: 1.12, r: -0.5 }, pamC = { x: nx + 200, y: pamHY + 170, z: 1.15, r: 0.5 };
  const nar = SP[l + '_nar'];
  if (L === 'A1' && t > EV('grow') - 0.1 && t < nar.t - 0.1) return { x: hx - 40, y: herHY + 350, z: 0.74, r: 0 };
  if (L === 'B1' && t > EV('wardrobe') - 0.1 && t < nar.t + 0.4) return { x: 860, y: herHY + 330, z: 0.8, r: 0, cut: t < EV('wardrobe') + 0.05 };
  if (L === 'B2' && t > EV('dog') - 0.5 && t < nar.t + 0.6) return { x: 820, y: herHY + 420, z: 0.72, r: 0 };
  if (L === 'C1' && t > EV('tear') - 0.1 && t < EV('wear') - 0.05) return { ...pamC, z: 1.3, cut: t < EV('tear') + 0.05 };
  if (L === 'C1' && t > EV('wear') - 0.05 && t < nar.t - 0.1) return { x: hx - 60, y: herHY + 350, z: 0.74, r: 0, cut: t < EV('wear') + 0.05 };
  if (L === 'C2') { if (t < EV('month') + 1.25) return { ...two, z: 0.8 }; if (t < EV('open') - 0.2) return { ...herC, y: herHY - 30, z: lerp(0.92, 1.02, P(t, SP.c2_her.t, endOf('c2_her'))) }; if (t < SP.c2_x.t - 0.1) return { ...pamC, z: 0.9, y: pamHY + 150, cut: t < EV('open') - 0.1 }; if (t < SP.c2_her2.t - 0.1) return { ...pamC, z: 1.05, y: pamHY + 230 }; if (t < nar.t - 0.1) return { ...herC, z: 1.35, cut: t < SP.c2_her2.t }; return { ...two, z: 0.84 }; }
  if (nar && t >= nar.t - 0.15) return { ...two, z: 0.86 };
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? herC : pamC;
  return two;
}
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft']);

function drawHook(c, t) {
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f];
  c.save(); c.translate(540, 960); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); world(c, t, 'hook'); c.restore();
  Hq.vignette(c, W, HH, 0.3);
  const rk2 = lerp(0.92, 1, eBack(P(t, 0.1, 0.45), 1.8)) * (1 + 0.012 * Math.sin(t * 5));
  c.save(); c.translate(540, 470); c.rotate(-0.05); c.scale(rk2, rk2);
  const lines = TL.cfg.hook_title; c.fillStyle = 'rgba(0,0,0,.22)'; UI.rr(c, -500 + 10, -150 + 14, 1000, 300, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; UI.rr(c, -500, -150, 1000, 300, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -78); UI.textFit(c, 'Unb9', 110, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 8, C.pink, C.white, 12); UI.textFit(c, 'Unb9', 64, lines[2][0], 900); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 98);
  c.restore();
  // Pam's speech bubble on the cover
  const bk = eBack(P(t, 0.4, 0.7), 2); if (bk > 0) { c.save(); c.translate(300, 760); c.scale(bk * 0.9, bk * 0.9); c.rotate(-0.04); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 6; UI.rr(c, -200, -60, 400, 120, 40); c.fill(); c.stroke(); UI.font(c, 'Unb9', 46); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Do you love it?', 0, 4); c.restore(); }
  UI.levelBar(c, t, { id: 'hook' });
  const stT = SC.hook.stamp_t, sk = P(t, stT - 0.02, stT + 0.15);
  if (sk > 0) { const s2 = lerp(2.6, 1, eOut(sk)); c.save(); c.translate(540, 1745); c.rotate(-0.13); c.scale(s2, s2); c.globalAlpha = clamp(sk * 3); c.fillStyle = 'rgba(255,253,248,.92)'; UI.rr(c, -380, -90, 760, 180, 24); c.fill(); c.strokeStyle = C.pink; c.lineWidth = 14; UI.rr(c, -380, -90, 760, 180, 24); c.stroke(); UI.textFit(c, 'Unb9', 110, TL.cfg.stamp, 700); c.fillStyle = C.pink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(TL.cfg.stamp, 0, 6); c.restore(); }
}
function drawOutro(c, t) {
  const s = SC.outro.s, u = t - s, o = SP.outro; const { textFit, strokeText, font, rr: R } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  c.save(); c.translate(190, lerp(2300, 1900, eBack(P(u, 0.4, 0.9), 1.4))); c.scale(0.42, 0.42); put(c, HER_W, herState(t, 'outro'), 0, 0); c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.25, 0.6), 2.2);
  c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 54); strokeText(c, 'А ЧТО ТЫ ДЕЛАЕШЬ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'С ТАКИМИ ПОДАРКАМИ?', 0, 36, C.pink, C.white, 14); c.restore();
  const k = eBack(P(u, 0.7, 1.1), 1.8);
  if (k > 0) { c.save(); c.translate(540, 740); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.14)'; R(c, -470 + 8, -300 + 12, 940, 600, 34); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; R(c, -470, -300, 940, 600, 34); c.fill(); c.stroke();
    font(c, 'Unb9', 38); c.fillStyle = C.pink; c.textAlign = 'left'; c.fillText('ШПАРГАЛКА', -420, -255);
    const rows = [['A2', 'I like it very much.'], ['B1', "Thank you, but it's not really my style."], ['B2', "Oh, you shouldn't have!"], ['C1', "It's so thoughtful of you."]];
    rows.forEach(([lv, ph], i) => { const y = -150 + i * 115, kk = eBack(P(u, 1.0 + i * 0.18, 1.35 + i * 0.18), 2.2); if (kk <= 0) return; c.save(); c.translate(0, y); c.scale(kk, kk); c.fillStyle = LVCOL[lv]; R(c, -430, -34, 82, 68, 18); c.fill(); font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(lv, -389, 3); textFit(c, 'Nun9', 46, ph, 740); c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(ph, -320, 3); c.restore(); });
    c.restore(); }
  const bk = eBack(P(u, 2.4, 2.8), 2.2);
  if (bk > 0) { c.save(); c.translate(540, 1180); c.scale(bk, bk); c.fillStyle = C.gold; R(c, -450, -50, 420, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); font(c, 'Unb9', 34); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', -240, 3);
    c.fillStyle = '#4CAF6A'; R(c, 10, -50, 440, 100, 50); c.fill(); c.strokeStyle = C.oliveD; c.stroke(); c.fillStyle = C.white; font(c, 'Unb9', 24); c.fillText('ОТПРАВЬ ТОМУ, КТО', 230, -12); c.fillText('ДАРИТ СТРАННЫЕ ПОДАРКИ', 230, 20); c.restore(); }
  const ak = eOut(P(t, o.t + 1.3, o.t + 1.6));
  if (ak > 0) { c.save(); c.globalAlpha = ak; c.translate(600, 1320 + Math.sin(t * 7) * 8); font(c, 'Unb9', 40); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('ПИШИ В КОММЕНТЫ', 0, 0); c.fillStyle = C.pink; c.beginPath(); c.moveTo(-34, 40); c.lineTo(34, 40); c.lineTo(0, 84); c.fill(); c.restore(); }
  const subT = (wordT('outro', 'подпиш') || o.t + 4.0) - 0.35;
  const sk = eBack(P(t, subT, subT + 0.3), 2);
  if (sk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(660, 1560); const ss = sk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; R(c, -250, -58, 500, 116, 58); c.fill(); font(c, 'Unb9', 42); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(920, 730, mv), lerp(1740, 1590, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
}
function drawChat(c, t) { // C1: the photo lands in the family chat
  const t0 = EV('chat'), k = eBack(P(t, t0, t0 + 0.35), 1.6) * (1 - P(t, SP.c1_nar.t + 1.6, SP.c1_nar.t + 2.0)); if (k <= 0) return;
  c.save(); c.translate(780, 1180); c.rotate(0.06); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -230 + 10, -330 + 14, 460, 660, 50); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -230, -330, 460, 660, 50); c.fill(); c.fillStyle = '#F4F1EC'; rr(c, -208, -300, 416, 600, 30); c.fill();
  UI.font(c, 'Unb9', 26); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FAMILY CHAT', 0, -268);
  c.fillStyle = '#DCF4C8'; rr(c, -180, -230, 360, 400, 22); c.fill(); UI.font(c, 'Unb9', 22); c.fillStyle = '#2F8A4A'; c.textAlign = 'left'; c.fillText('Auntie Pam', -160, -205);
  c.fillStyle = SW; rr(c, -160, -180, 320, 230, 12); c.fill(); knitFace(c, 0, -60, 70); UI.font(c, 'Nun9', 30); c.fillStyle = C.oliveD; c.fillText('She LOVES it!!!', -160, 100); c.fillText('I made 3 more :)', -160, 140);
  const likes = Math.min(37, Math.floor(P(t, t0 + 0.3, t0 + 1.2) * 37)); c.fillStyle = '#FFFFFF'; rr(c, 40, 180, 140, 54, 27); c.fill(); UI.font(c, 'Unb9', 28); c.fillStyle = C.red; c.textAlign = 'center'; c.fillText(String(likes), 128, 208); c.beginPath(); const hx2 = 78, hy2 = 206; c.moveTo(hx2, hy2 + 14); c.bezierCurveTo(hx2 - 26, hy2 - 4, hx2 - 12, hy2 - 22, hx2, hy2 - 8); c.bezierCurveTo(hx2 + 12, hy2 - 22, hx2 + 26, hy2 - 4, hx2, hy2 + 14); c.fill();
  c.restore();
}
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { drawOutro(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  const heads = world(c, t, sc.id);
  const M = c.getTransform(); c.restore();
  Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  const l = sc.id.toLowerCase();
  const lineIds = TL.speech.filter(x => x.id.startsWith(l + '_') && x.who !== 'nar' && x.who !== 'tip');
  const holdFor = sp => { if (sp.id === 'c2_her') return 0.25; const i = lineIds.indexOf(sp); const nx = lineIds[i + 1]; return nx ? Math.max(0.05, Math.min(0.9, nx.t - (sp.t + sp.d) - 0.25)) : 0.9; };
  for (const sp of lineIds) { const hd = heads[sp.who]; if (!hd) continue;
    if (sp.who === 'her') UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x - 30, y: hd.y - hd.hh * 1.25 }), 'left');
    else UI.bubble(c, { ...sp, hold: holdFor(sp) }, t, proj({ x: hd.x + 30, y: hd.y - hd.hh * 1.25 }), 'right', ['AUNTIE PAM', '#C2507A']); }
  const ev = sc.ev || {};
  if (sc.id === 'C1' && ev.flash) { const k = 1 - P(t, ev.flash, ev.flash + 0.35); if (k > 0 && t >= ev.flash) { c.fillStyle = `rgba(255,255,255,${k})`; c.fillRect(0, 0, W, HH); } drawChat(c, t); }
  if (sc.id === 'C2' && ev.month) { const k = eBack(P(t, ev.month - 0.05, ev.month + 0.3), 1.8) * (1 - P(t, ev.month + 1.15, ev.month + 1.4)); if (k > 0) { c.save(); c.fillStyle = `rgba(30,20,40,${0.55 * k})`; c.fillRect(0, 0, W, HH); c.translate(540, 900); c.scale(k, k); c.rotate(-0.04); UI.font(c, 'Unb9', 96); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'ЧЕРЕЗ МЕСЯЦ', 0, -60, C.white, C.oliveD, 16); UI.font(c, 'Unb9', 54); UI.strokeText(c, 'ДЕНЬ РОЖДЕНИЯ ТЁТИ ПЭМ', 0, 50, C.gold, C.oliveD, 12); c.restore(); } }
  if (sc.id === 'C2' && ev.wink) { const k = eBack(P(t, ev.wink, ev.wink + 0.25), 2.4) * (1 - P(t, SP.c2_nar.t + 0.4, SP.c2_nar.t + 0.7)); if (k > 0) { c.save(); c.translate(540, 1300); c.rotate(-0.08); c.scale(k, k); UI.font(c, 'Unb9', 84); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'БА-ДУМ-ТСС!', 0, 0, C.gold, C.oliveD, 16); c.restore(); } }
  if (sc.id === 'C2') { const a = endOf('c2_her') + 0.3, b = SP.c2_x.t - 0.1; if (t > a && t < b) { const dots = Math.min(3, Math.floor((t - a) / 0.5) + 1); c.save(); c.globalAlpha = clamp((t - a) / 0.2) * clamp((b - t) / 0.15); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '.'.repeat(dots).padEnd(3, ' '), 540, 1500, C.white, C.oliveD, 16); c.restore(); } }
  UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t);
  Hq.grain(c, W, HH, t, 0.04);
  UI.levelBar(c, t, sc, 1); UI.watermark(c); UI.levelIntro(c, t, sc); UI.levelIntroNext(c, t);
}
E.run('gift', NF, renderFrame);
