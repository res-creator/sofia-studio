// "Присела на дорожку прямо в аэропорту" — rubric «Наше за границей» (nashe4: scene + 4 answers, worst -> best), hard_cut camera: node sitdown.js start end out.mp4 | --png=f1,f2
// A busy US airport terminal at GATE 7: the heroine (pink jumper) sits silently on her purple suitcase in the middle of the walkway, eyes closed,
// passengers hurry past; Roger (orange hoodie, cap, backpack), a worried American passenger, leans over her.
// Absurd detail: the airport's robot vacuum has "sat down" next to her too — it stands still, its LED eyes closed, a PAUSED display.
// Hook: close shot of the robot vacuum on «посидеть на дорожку».
// o1 «В ЛОБ»: "Shh. Sitting. Tradition." (open palm up) — "Tradition of… blocking gate seven?" — a queue of luggage carts piles up behind her, horns.
// o2 «ВЕЖЛИВО»: "It's a custom. We sit before a trip." — "Can you sit faster? Your flight's boarding." — insert: the board, CHICAGO GATE 7 FINAL CALL blinking;
//   she "sits faster": bounces on the suitcase at top speed.
// o3 «КАК НОСИТЕЛЬ»: "It's for luck…" — "Oh, that's actually lovely." — he carefully sits down next to her on his backpack; both close their eyes; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand line; on «pocket» she pulls her passport out of her jacket pocket (insert) — "…I need to sit down too." — he plops down.
// Twist (music silent): pull-back — the whole terminal sits on suitcases; PA chime; the captain on the tannoy; the jet-bridge door: he sits on his flight bag.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/sitdown/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const ROG = { ...BASE.mark, top: { type: 'hoodie', col: '#E8893A' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#FFFFFF', acc: '#2C5E9E' }, watch: '#C9A85A' };
const CAPT = { ...BASE.greg, top: { type: 'blazer', col: '#1F2A44', shirt: '#F7F9FC', tie: '#1F2A44' }, bottom: { type: 'trousers', col: '#1F2A44' }, shoes: { col: '#1E1612', acc: null } };
const SUIT_H = 340, BAG_H = 250;                                     // her suitcase body top (above the floor), his backpack when he sits on it
const DROP = { her: Math.round(HER.h * 0.47 - SUIT_H + 10) };        // hip on the suitcase
DROP.rog = Math.round(ROG.h * 0.47 - BAG_H + 10);
const G = { her: geom(HER, DROP.her), pass1: geom(ROG), rogH: geom(ROG, 420), rogS: geom(ROG, DROP.rog), capt: geom(CAPT, Math.round(CAPT.h * 0.47 - 300)) };
const X = { her: 0, rog: 560, robot: -400 };
const XS = 500;                                                      // Roger sitting next to her on his backpack
const DOOR0 = 1350, DOOR1 = 2050;                                    // jet-bridge door at GATE 7
const SPK = { x: 980, y: -2350 };                                    // the tannoy loudspeaker on the pillar
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// her purple hard-shell suitcase standing on its wheels; (0,0) = floor centre; squash = compression (sit-faster bounce)
function suitcase(c, x, col = '#8E5BD0', sq = 0, s = 1) { c.save(); c.translate(x, 0); c.scale(s * (1 + sq * 0.06), s * (1 - sq * 0.1));
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 0, 290, 30, 0, 0, TAU); c.fill();
  c.fillStyle = '#2B2F3A'; for (const wx of [-200, 200]) { rr(c, wx - 30, -18, 60, 18, 6); c.fill(); }
  paint(c, q => { q.m(-260, -SUIT_H + 20); q.q(-260, -SUIT_H, -240, -SUIT_H); q.l(240, -SUIT_H); q.q(260, -SUIT_H, 260, -SUIT_H + 20); q.l(260, -36); q.q(260, -14, 238, -14); q.l(-238, -14); q.q(-260, -14, -260, -36); q.z(); }, col, { sd: 14, hd: 7, lw: 5 });
  c.strokeStyle = 'rgba(40,10,70,.3)'; c.lineWidth = 9; for (const ly of [-SUIT_H * 0.7, -SUIT_H * 0.4]) { c.beginPath(); c.moveTo(-240, ly); c.lineTo(240, ly); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.25)'; rr(c, -240, -SUIT_H + 18, 300, 26, 12); c.fill();
  // travel stickers (no text)
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(150, -110, 40, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(150, -110, 16, 0, TAU); c.fill();
  c.fillStyle = '#4CAF6A'; c.save(); c.translate(-150, -120); c.rotate(-0.2); rr(c, -46, -30, 92, 60, 12); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-26, 14); c.lineTo(0, -18); c.lineTo(26, 14); c.fill(); c.restore();
  // luggage tag on the side handle
  c.fillStyle = '#2B2F3A'; rr(c, -260 - 34, -SUIT_H * 0.62, 34, 110, 10); c.fill(); c.save(); c.translate(260, -250); c.rotate(0.25); c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(20, 40); c.stroke(); c.fillStyle = '#EF7FAA'; c.strokeStyle = '#8A2A50'; c.lineWidth = 3; rr(c, 0, 40, 60, 90, 8); c.fill(); c.stroke(); c.restore();
  c.restore(); }
// his backpack (standing / squashed when he sits on it); (0,0) = floor centre
function backpack(c, x, sq = 0, s = 1) { c.save(); c.translate(x, 0); c.scale(s * (1 + sq * 0.25), s * (1 - sq * 0.3));
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 0, 170, 24, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-150, -10); q.q(-170, -330, 0, -340); q.q(170, -330, 150, -10); q.z(); }, '#3E73B8', { sd: 10, hd: 5, lw: 5 });
  paint(c, q => { q.m(-110, -20); q.l(-110, -150); q.q(0, -175, 110, -150); q.l(110, -20); q.z(); }, '#2C5E9E', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = '#F2C14E'; c.lineWidth = 6; c.beginPath(); c.moveTo(-90, -150); c.quadraticCurveTo(0, -172, 90, -150); c.stroke();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.beginPath(); c.moveTo(-40, -330); c.quadraticCurveTo(0, -390, 40, -330); c.stroke(); c.restore(); }
const packItem = ctx => { ctx.save(); ctx.translate(0, 300); ctx.scale(0.8, 0.8); backpack(ctx, 0); ctx.restore(); };
// the passport (burgundy, PASSPORT in gold); (0,0) = centre
function passport(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -62 + 6, -86 + 8, 124, 172, 12); c.fill();
  c.fillStyle = '#7A1E3A'; c.strokeStyle = '#4A0E22'; c.lineWidth = 4; rr(c, -62, -86, 124, 172, 12); c.fill(); c.stroke();
  c.strokeStyle = '#E8C15A'; c.lineWidth = 4; c.beginPath(); c.arc(0, -4, 30, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(-30, -4); c.lineTo(30, -4); c.moveTo(0, -34); c.quadraticCurveTo(20, -4, 0, 26); c.quadraticCurveTo(-20, -4, 0, -34); c.stroke();
  fitTxt(c, 'PASSPORT', 0, -60, 22, '#E8C15A', 100); c.restore(); }
const passItem = k => ctx => { ctx.save(); ctx.translate(0, 40); passport(ctx, 1.1, -0.15); ctx.restore(); if (k > 0) for (let i = 0; i < 3; i++) sparkle(ctx, [-80, 90, 10][i], [-60, -30, -150][i] + 40, 22, k); };
// the PA handset
const handsetItem = ctx => { ctx.save(); ctx.rotate(-0.5); ctx.fillStyle = '#2B2F3A'; rr(ctx, -24, -110, 48, 140, 18); ctx.fill(); ctx.fillStyle = '#596070'; rr(ctx, -16, -100, 32, 30, 8); ctx.fill(); ctx.restore(); };
function sparkle(c, x, y, r, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = '#FFF3A0'; c.strokeStyle = '#D9A520'; c.lineWidth = 3; c.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr_ = i % 2 ? r * 0.38 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fill(); c.stroke(); c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
// zen circles around a calm head
function zen(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = 0.55 * k; c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; for (let i = 0; i < 3; i++) { const u = ((t * 0.5 + i / 3) % 1); c.globalAlpha = 0.5 * k * (1 - u); c.beginPath(); c.ellipse(hd.x, hd.y - hd.hh * 1.25, hd.hh * (0.5 + u * 1.2), hd.hh * (0.12 + u * 0.3), 0, 0, TAU); c.stroke(); } c.restore(); }
// speed lines (sit-faster)
function speedLines(c, x, y, h, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; c.strokeStyle = 'rgba(43,47,58,.75)'; c.lineWidth = 12; c.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const yy = y - h * (0.2 + i * 0.16), o = ((t * 9 + i * 0.3) % 1) * 60; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * (300 + o), yy); c.lineTo(x + s * (420 + o), yy); c.stroke(); } } c.restore(); }

// ---------------- the robot vacuum (absurd detail): stopped next to her, LED eyes closed like hers, PAUSED; (0,0) = floor centre
function robot(c, x, t, L, s = 1) { c.save(); c.translate(x, 0); c.scale(s, s);
  const twist = L === 'end' ? 0 : 0, bob = Math.sin(t * 1.5) * 2;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 0, 210, 30, 0, 0, TAU); c.fill();
  c.translate(0, bob + twist);
  paint(c, q => { q.m(-200, -40); q.q(-200, -130, 0, -132); q.q(200, -130, 200, -40); q.q(200, -10, 0, -8); q.q(-200, -10, -200, -40); q.z(); }, '#E9EDF1', { sd: 8, hd: 4, lw: 5 });
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.ellipse(0, -36, 200, 26, 0, 0, Math.PI); c.fill();          // bumper
  c.fillStyle = '#C9D2DA'; c.beginPath(); c.ellipse(0, -112, 150, 24, 0, 0, TAU); c.fill();
  // face panel: two closed LED eyes + a little display
  c.fillStyle = '#2B2F3A'; rr(c, -110, -104, 220, 58, 26); c.fill();
  const open = L === 'o2' && t > ev('o2', 'board') && t < ev('o2', 'board') + 3 ? 1 : 0;
  c.strokeStyle = '#7CF2E0'; c.lineWidth = 7; c.lineCap = 'round';
  for (const ex of [-56, 56]) { c.beginPath(); if (open) c.arc(ex, -80, 12, 0, TAU); else c.arc(ex, -84, 16, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
  const blink = (Math.floor(t * 1.5) % 2) === 0; fitTxt(c, 'PAUSED', 0, -72, 22, blink ? '#7CF2E0' : 'rgba(124,242,224,.45)', 70);
  c.fillStyle = blink ? '#7CF2E0' : '#3E6A64'; c.beginPath(); c.arc(150, -110, 10, 0, TAU); c.fill();
  c.restore(); K.mark(c, 'robot', x, -70 * s, 200 * s); }

// ---------------- luggage carts (o1 queue): a cart with a stack of bags, pushed by a waiting passenger
const CARTX = [-900, -1380, -1860, -2340];
function cart(c, x, k, i) { c.save(); c.translate(x, 0);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 0, 260, 26, 0, 0, TAU); c.fill();
  c.strokeStyle = '#8A93A2'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-220, -60); c.lineTo(200, -60); c.moveTo(-220, -60); c.lineTo(-250, -560); c.moveTo(-300, -560); c.lineTo(-200, -560); c.stroke();
  c.fillStyle = '#2B2F3A'; for (const wx of [-190, 170]) { c.beginPath(); c.arc(wx, -22, 22, 0, TAU); c.fill(); }
  const cols = [['#3FB6A8', '#F2C14E', '#E0474C'], ['#2C5E9E', '#EF7FAA', '#8CCB7A'], ['#F29A5A', '#7FB8E0', '#B79AE0'], ['#E0474C', '#4CAF6A', '#F2C14E']][i % 4];
  let y = -70; [[380, 190], [320, 150], [240, 120]].forEach(([w, h], j) => { paint(c, q => { q.m(-w / 2, y); q.l(w / 2, y); q.l(w / 2 - 6, y - h); q.l(-w / 2 + 6, y - h); q.z(); }, cols[j], { sd: 6, hd: 3, lw: 4 }); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-w / 2 + 20, y - h * 0.55, w - 40, 10); y -= h; });
  c.restore(); }
const QUEUE = [ { ...BASE.dan, top: { type: 'hoodie', col: '#5A6274' } }, { ...BASE.priya }, { ...BASE.ben, top: { type: 'polo', col: '#4CAF6A', col2: '#F3EDDF' } }, { ...BASE.chloe, top: { type: 'sweater', col: '#F2C14E' } } ];
const GQ = QUEUE.map(q => geom(q)), GQS = QUEUE.map(q => geom(q, Math.round(q.h * 0.47 - SUIT_H * 0.85 + 10)));
const cartIn = (t, i) => eOut(clamp((t - ev('o1', 'carts') - i * 0.4) / 0.35));
function queuePeople(c, t, L) { if (L !== 'o1' || t < ev('o1', 'carts') - 0.05) return;
  for (let i = 3; i >= 0; i--) { const k = cartIn(t, i); if (k <= 0) continue; const x = CARTX[i] - (1 - k) * 1400, bump = Math.sin(clamp((t - ev('o1', 'carts') - i * 0.4 - 0.35) / 0.25) * Math.PI) * 18;
    const g = GQ[i], ang = t > ev('o1', 'carts') + 1.5 + i * 0.1;
    K.put(c, QUEUE[i], { t, talk: 0, mood: ang ? 'annoyed' : 'neutral', turn: 0.35, look: 0.8, armL: reach(g, -1, g.sw * 0.7 + 180, g.ySh + 330, { planar: true }), armR: reach(g, 1, g.sw * 0.9 + 180, g.ySh + 330, { planar: true }), items: {}, tilt: ang ? 0.05 * Math.sin(t * 3 + i) : 0 }, x - 420, 0);
    cart(c, x + bump, k, i); } }
// the twist: everybody sits on a suitcase
const SITTERS = [[-1250, -260, 0.8, 2, '#4CAF6A'], [-760, -260, 0.8, 3, '#E0474C'], [-1500, 0, 1, 0, '#2C5E9E'], [-1000, 0, 1, 1, '#F29A5A']];
function sitters(c, t) { for (const [x, y, sc, i, col] of SITTERS) { const g = GQS[i]; c.save(); c.translate(0, y); suitcase(c, x, col, 0, 0.85 * sc);
  K.put(c, QUEUE[i], { t, talk: 0, mood: t > ev('end', 'laugh') ? 'happy' : 'neutral', blink: t < ev('end', 'chime') ? 1 : 0, laugh: t > ev('end', 'laugh') + 0.1, turn: 0.1 * Math.sin(i + x), look: 0, lookY: t > ev('end', 'chime') && t < ev('end', 'laugh') ? -0.4 : 0, legPose: 'squat', drop: g.ySh - GQ[i].ySh,
    armL: knees(g, -1), armR: knees(g, 1), items: {} }, x, 0, sc); c.restore(); } }
// ---------------- background: the terminal at GATE 7 (prerendered, softly blurred)
const BX0 = -5200, BY0 = -6000, BW = 10400, BH = 8600, BS = 0.5;
function drawHall(c) {
  // ceiling with light panels
  c.fillStyle = '#E4E8EF'; c.fillRect(BX0, BY0, BW, 2700); for (let x = BX0; x < BX0 + BW; x += 800) { c.fillStyle = '#FFFFFF'; c.fillRect(x + 100, BY0 + 2300, 560, 60); }
  // the huge window wall: sky, runway, a plane at the jet bridge
  const sg = c.createLinearGradient(0, -3300, 0, -900); sg.addColorStop(0, '#8EC8EC'); sg.addColorStop(1, '#D6EEF8'); c.fillStyle = sg; c.fillRect(BX0, -3300, BW, 2400);
  c.fillStyle = 'rgba(255,255,255,.8)'; for (const [x, y, s] of [[-3800, -2900, 1], [-1200, -3050, 0.8], [2600, -2950, 1.1]]) for (const [dx, dy, r] of [[0, 0, 120], [130, -30, 150], [270, 10, 110]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); }
  c.fillStyle = '#9AA3B2'; c.fillRect(BX0, -1250, BW, 350); c.fillStyle = '#F7F4EE'; for (let x = BX0; x < BX0 + BW; x += 520) c.fillRect(x, -1090, 260, 16);
  // plane (generic livery) behind the window, nose at the jet bridge
  c.save(); c.translate(-1300, -1500); c.fillStyle = '#F4F6FA'; c.strokeStyle = '#C9D1DC'; c.lineWidth = 8;
  c.beginPath(); c.moveTo(-1700, -120); c.lineTo(900, -120); c.quadraticCurveTo(1250, -110, 1300, 40); c.quadraticCurveTo(1250, 160, 900, 170); c.lineTo(-1700, 170); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#2C5E9E'; c.fillRect(-1700, 60, 2600, 40); c.beginPath(); c.moveTo(-1500, -120); c.lineTo(-1750, -620); c.lineTo(-1580, -620); c.lineTo(-1250, -120); c.fill();
  c.fillStyle = '#5E7FA0'; for (let i = 0; i < 22; i++) { rr(c, -1500 + i * 105, -40, 50, 60, 18); c.fill(); } c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(1050, -60); c.lineTo(1200, -60); c.lineTo(1230, 0); c.lineTo(1080, 0); c.fill();
  c.fillStyle = '#C9D1DC'; c.beginPath(); c.moveTo(-500, 120); c.lineTo(300, 120); c.lineTo(-200, 420); c.lineTo(-450, 420); c.fill(); c.restore();
  // window frames
  c.fillStyle = '#5A6070'; for (let x = BX0; x <= BX0 + BW; x += 900) c.fillRect(x, -3300, 40, 2400); c.fillRect(BX0, -3340, BW, 60); c.fillRect(BX0, -940, BW, 50);
  // lower wall + skirting
  c.fillStyle = '#D9DEE6'; c.fillRect(BX0, -900, BW, 600); c.fillStyle = '#B8BFCB'; c.fillRect(BX0, -330, BW, 40);
  // rows of gate seats (empty — nobody uses them)
  for (const x0 of [-4600, -3300, 2700, 4000]) for (let k = 0; k < 4; k++) { const x = x0 + k * 260; c.fillStyle = '#3E4A5E'; rr(c, x, -640, 220, 260, 30); c.fill(); rr(c, x - 10, -420, 240, 70, 20); c.fill(); c.fillStyle = '#8A93A2'; c.fillRect(x + 100, -350, 20, 60); }
  // GATE 7 hanging sign (US style: black with yellow)
  c.fillStyle = '#8A93A2'; c.fillRect(1200, -4300, 16, 760); c.fillRect(2200, -4300, 16, 760);
  c.fillStyle = '#1E222B'; rr(c, 1000, -3600, 1500, 330, 26); c.fill(); fitTxt(c, 'GATE', 1500, -3435, 150, '#F2C14E', 560); c.fillStyle = '#F2C14E'; rr(c, 1960, -3560, 250, 250, 26); c.fill(); fitTxt(c, '7', 2085, -3430, 210, '#1E222B', 220);
  // restrooms sign with arrow (left)
  c.fillStyle = '#1E222B'; rr(c, -4300, -3600, 1500, 300, 26); c.fill(); fitTxt(c, 'RESTROOMS', -3650, -3450, 110, '#FFFFFF', 1000);
  c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(-4220, -3450); c.lineTo(-4110, -3540); c.lineTo(-4110, -3490); c.lineTo(-3990, -3490); c.lineTo(-3990, -3410); c.lineTo(-4110, -3410); c.lineTo(-4110, -3360); c.closePath(); c.fill();
  // coffee kiosk (far right) with a dollar price
  c.fillStyle = '#7A4A30'; c.fillRect(3300, -1700, 1500, 1400); c.fillStyle = '#E0474C'; c.fillRect(3300, -1900, 1500, 220); fitTxt(c, 'COFFEE', 4050, -1790, 130, '#FFFFFF', 900);
  c.fillStyle = '#F4EFE6'; rr(c, 3450, -1600, 1200, 300, 20); c.fill(); fitTxt(c, 'LATTE  $4.99', 4050, -1450, 90, '#2B2F3A', 1100);
  // jet-bridge door frame at gate 7 (the door itself is live)
  c.fillStyle = '#5A6070'; c.fillRect(DOOR0 - 60, -1900, DOOR1 - DOOR0 + 120, 60); c.fillRect(DOOR0 - 60, -1900, 60, 1900); c.fillRect(DOOR1, -1900, 60, 1900);
  c.fillStyle = '#2B2F3A'; rr(c, DOOR0 + 120, -2160, DOOR1 - DOOR0 - 240, 200, 20); c.fill(); fitTxt(c, 'GATE 7', (DOOR0 + DOOR1) / 2, -2060, 100, '#F2C14E', 400);
  // pillar with the tannoy loudspeaker
  c.fillStyle = '#C9D1DC'; c.fillRect(SPK.x - 90, -3300, 180, 3300);
  // carpet (US gate carpet with a pattern)
  c.fillStyle = '#4A5A7A'; c.fillRect(BX0, -300, BW, BY0 + BH + 300);
  c.fillStyle = 'rgba(255,255,255,.07)'; for (let y = -280; y < BY0 + BH; y += 140) for (let x = BX0 + ((y / 140) % 2) * 70; x < BX0 + BW; x += 140) { c.beginPath(); c.arc(x, y, 18, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(BX0, -300, BW, 30);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawHall);

// live parts of the hall: the departures board (FINAL CALL blinks in o2), the loudspeaker (pulses on the tannoy), the jet-bridge door, walkers
const BOARD = { x: -2500, y: -2650, w: 1900, h: 1000 };
const ROWS = [['DENVER', '12', 'ON TIME'], ['CHICAGO', '7', 'BOARDING'], ['BOSTON', '9', 'DELAYED'], ['MIAMI', '4', 'ON TIME']];
function board(c, t, L, s = 1) { const { x, y, w, h } = BOARD; c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#2B2F3A'; rr(c, -30, -30, w + 60, h + 60, 26); c.fill(); c.fillStyle = '#10141C'; rr(c, 0, 0, w, h, 18); c.fill();
  c.textBaseline = 'middle'; c.textAlign = 'left'; UI.font(c, 'Unb9', 64); c.fillStyle = '#F2C14E'; c.fillText('DEPARTURES', 50, 80);
  UI.font(c, 'Unb9', 36); c.fillStyle = '#8A93A2'; c.fillText('DESTINATION', 50, 170); c.fillText('GATE', 900, 170); c.fillText('STATUS', 1250, 170);
  const fc = L === 'o2' && t > ev('o2', 'board') - 0.3 || L === 'end' || L === 'o4' && false;
  ROWS.forEach(([d, g, st], r) => { c.textAlign = 'left'; const yy = 260 + r * 180; c.fillStyle = r % 2 ? '#1E232E' : '#181C26'; c.fillRect(20, yy - 75, w - 40, 150);
    const hot = r === 1 && fc, on = !hot || Math.floor(t * 3) % 2 === 0; UI.font(c, 'Unb9', 66); c.fillStyle = hot ? '#FFFFFF' : '#FFE6A0'; c.fillText(d, 50, yy); c.fillText(g, 930, yy);
    if (hot) { if (on) { c.fillStyle = '#E0474C'; rr(c, 1230, yy - 58, 600, 116, 16); c.fill(); } fitTxt(c, 'FINAL CALL', 1530, yy + 2, 64, on ? '#FFFFFF' : '#E0474C', 560); }
    else { c.fillStyle = st === 'DELAYED' ? '#F29A5A' : '#7CF29A'; c.textAlign = 'left'; UI.font(c, 'Unb9', 60); c.fillText(st, 1250, yy); } });
  c.restore(); }
function speaker(c, t) { const on = speaking('end_c', t, 0, 0) ? talk('capt1', t) : 0; c.save(); c.translate(SPK.x, SPK.y);
  c.fillStyle = '#5A6070'; c.fillRect(-20, 120, 40, 120); paint(c, q => { q.m(-120, -110); q.l(120, -110); q.l(140, 120); q.l(-140, 120); q.z(); }, '#E9EDF1', { sd: 6, hd: 3, lw: 5 });
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, 10, 80 + on * 8, 0, TAU); c.fill(); c.fillStyle = '#596070'; c.beginPath(); c.arc(0, 10, 30, 0, TAU); c.fill();
  if (on > 0.05 || (t > ev('end', 'chime') && t < ev('end', 'chime') + 0.9)) { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 12; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const r = 170 + i * 70 + ((t * 2) % 1) * 30; c.beginPath(); c.arc(0, 10, r, -0.5, 0.5); c.stroke(); c.beginPath(); c.arc(0, 10, r, Math.PI - 0.5, Math.PI + 0.5); c.stroke(); } }
  c.restore(); }
const doorOpen = (t, L) => L === 'end' ? eIO(clamp((t - ev('end', 'capt') + 0.05) / 0.3)) : 0;
function door(c, t, L, drawCapt) { const k = doorOpen(t, L), w = DOOR1 - DOOR0;
  // the jet bridge behind the door
  c.fillStyle = '#C9CED6'; c.fillRect(DOOR0, -1840, w, 1840); c.fillStyle = '#B0B6C0'; for (let i = 0; i < 6; i++) c.fillRect(DOOR0, -1840 + i * 300, w, 12); c.fillStyle = '#9AA3B2'; c.fillRect(DOOR0, -60, w, 60);
  if (k > 0 && drawCapt) drawCapt(c);
  // the door slides to the right
  c.save(); c.beginPath(); c.rect(DOOR0, -1840, w, 1840); c.clip(); c.translate(k * w * 0.95, 0);
  c.fillStyle = '#7A8496'; c.fillRect(DOOR0, -1840, w, 1840); c.fillStyle = '#9CCBE4'; rr(c, DOOR0 + 160, -1600, w - 320, 600, 20); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(DOOR0 + 200, -1600); c.lineTo(DOOR0 + 320, -1600); c.lineTo(DOOR0 + 200, -1250); c.fill();
  c.fillStyle = '#E9EDF1'; rr(c, DOOR0 + 60, -1000, 40, 220, 14); c.fill(); c.restore(); }
// people hurrying past in the back (flat, small), hook..o4
function walkers(c, t, L) { if (L === 'end') return;
  const P_ = [[-1, 520, '#3FB6A8', 0.0], [1, 640, '#8E5BD0', 0.35], [-1, 470, '#F29A5A', 0.7], [1, 580, '#5A6274', 0.15]];
  for (const [dir, sp, col, ph] of P_) { const span = 7000, x = ((t * sp + ph * span) % span) - 3500, xx = dir > 0 ? x : -x, bob = Math.abs(Math.sin(t * 9 + ph * 10)) * 14, y = -320 - bob;
    c.save(); c.translate(xx, y); c.scale(0.62, 0.62); c.globalAlpha = 0.8; c.fillStyle = col; rr(c, -60, -560, 120, 300, 50); c.fill(); c.fillStyle = '#2B2F3A'; c.fillRect(-46, -270, 36, 270); c.fillRect(10, -270, 36, 270);
    c.fillStyle = '#E8B896'; c.beginPath(); c.arc(0, -640, 66, 0, TAU); c.fill(); c.fillStyle = '#3A2820'; c.beginPath(); c.arc(0, -660, 66, Math.PI, TAU); c.fill();
    c.fillStyle = '#2B2F3A'; rr(c, dir * 70, -220, 120 * dir, 180, 16); c.fill(); c.fillRect(dir * 100, -330, 12 * dir, 120); c.restore(); } }

// ---------------- characters
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const knees = (g, s, k = 0.8, dy) => reach(g, s, s * g.sw * k, dy === undefined ? -g.h * 0.47 + (g.headY + g.h - g.hh) + 70 : g.ySh + dy, { planar: true });   // default: hand on the knee of a sitting figure (geom built with the same drop)
const gest = (st, g, id, t, side, base) => { if (!speaking(id, t)) return; const u = (t - SP[id].t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); };
const bounceY = (t, L) => L === 'o2' && t > ev('o2', 'bounce') && t < SC.o2.e - 0.2 ? Math.abs(Math.sin((t - ev('o2', 'bounce')) * 16)) * 70 * (1 - clamp((t - SC.o2.e + 0.8) / 0.6)) : 0;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'happy', blink: 1, turn: 0, look: 0, legPose: 'squat', drop: DROP.her, armL: knees(g, -1), armR: knees(g, 1), items: {} };
  st.headY = Math.sin(t * 1.6) * 3;
  if (L === 'hook') { st.mood = 'happy'; if (t > hev('wide')) { st.blink = 0; st.mood = 'neutral'; st.turn = 0.25; st.look = 0.7; } }
  if (L === 'o1') { if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'smug'; st.blink = 1; st.armR = open(g, 1, 2.0, 80); }
    if (t > SP.o1_p.t) { st.blink = 0; st.mood = 'neutral'; st.turn = 0.25; st.look = 0.7; }
    if (t > e('carts') + 0.3) { st.turn = -0.35; st.look = -0.9; st.mood = 'surprised'; }
    if (t > e('carts') + 1.6) { st.mood = 'worried'; st.armL = open(g, -1, 1.5, 150); st.armR = knees(g, 1); } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'happy'; st.blink = 0; st.turn = 0.25; st.look = 0.7; gest(st, g, 'o2_h', t, 1, 170); }
    if (t > SP.o2_p.t) { st.blink = 0; st.turn = 0.25; st.look = 0.7; st.mood = 'surprised'; }
    if (t > e('bounce')) { st.mood = 'shock'; st.blink = 0; st.look = 0; st.turn = 0; st.armL = open(g, -1, 1.4, 260); st.armR = open(g, 1, 1.4, 260); st.headY = 0; }
    if (t > SP.o2_nar.t + 1.0) { st.mood = 'tired'; } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.blink = 0; st.turn = 0.25; st.look = 0.7; gest(st, g, 'o3_h', t, 1, 150); }
    if (t > SP.o3_p.t) { st.blink = 0; st.turn = 0.25; st.look = 0.7; }
    if (t > e('calm')) { st.blink = 1; st.turn = 0; st.look = 0; st.mood = 'happy'; } }
  if (L === 'o4') { st.mood = 'smug';
    if (speaking('o4_h', t, 0.1, 0)) { const u = t - SP.o4_h.t; st.blink = u < 2.4 ? 1 : 0; st.turn = 0.2; st.look = 0.6;
      if (u < 2.4) { st.armL = open(g, -1, 1.7, 120 + Math.sin(u * 3) * 20); st.armR = open(g, 1, 1.7, 120 + Math.cos(u * 3) * 20); }
      if (t > e('breathe') - 0.1 && t < e('pass')) { const k = Math.sin(clamp((t - e('breathe') + 0.1) / 1.0) * Math.PI); st.blink = 1; st.headY = -14 * k; st.armL = open(g, -1, 1.2 + 0.6 * k, 300 - 150 * k); st.armR = open(g, 1, 1.2 + 0.6 * k, 300 - 150 * k); }
      if (t > e('pass')) { st.mood = 'smug'; gest(st, g, 'o4_h', t, -1, 160); } }
    if (t > e('pocket') - 0.2) { const k = eOut(clamp((t - e('pocket') + 0.2) / 0.4)); st.armR = reach(g, 1, g.sw * lerp(0.7, 1.7, k), g.ySh + lerp(420, 40, k), { planar: true }); st.items = { R: passItem(clamp((t - e('pocket') - 0.2) / 0.3)) }; st.mood = 'smug'; st.blink = 0; st.turn = 0.25; st.look = 0.7; }
    if (t > e('plop')) { st.mood = 'happy'; st.blink = 1; st.armR = open(g, 1, 1.4, 120); } }
  if (L === 'end') { st.mood = 'happy'; st.blink = 1;
    if (t > ev('end', 'chime')) { st.blink = 0; st.lookY = -0.4; st.mood = 'surprised'; }
    if (t > ev('end', 'laugh')) { st.mood = 'happy'; st.laugh = true; st.lookY = 0; st.turn = 0.2; st.look = 0.5; }
    if (t > ev('end', 'moral') + 0.4) { st.laugh = false; st.blink = 1; st.turn = 0; st.look = 0; } }
  return st; }
// Roger: stands leaning toward her (hook..), sits on his backpack (o3 sit, o4 plop, end)
const HOOKDROP = 420;
const rogSits = (t, L) => (L === 'o3' && t > ev('o3', 'sit') + 0.25) || (L === 'o4' && t > ev('o4', 'plop')) || L === 'end';
function rogState(t, L) { const sit = rogSits(t, L), g = sit ? G.rogS : L === 'hook' ? G.rogH : G.pass1, e = k => ev(L, k);
  const st = { t, talk: talk('pass1', t), mood: 'worried', turn: -0.35, look: -0.8, lean: -0.25, lookY: 0.3, armL: open(g, -1, 1.3, 330), armR: down(g, 1), items: { R: packItem } };
  st.armR = reach(g, 1, g.sw * 1.15, g.ySh + 470, { planar: true });
  if (L === 'hook') { st.legPose = 'squat'; st.drop = HOOKDROP; st.items = {}; st.lean = -0.1; st.armR = reach(G.rogH, 1, G.rogH.sw * 1.25, G.rogH.ySh + 330, { planar: true }); st.armL = reach(G.rogH, -1, -G.rogH.sw * 1.25, G.rogH.ySh + 330, { planar: true });
    if (speaking('hook_p', t, 0.1, 0.1)) { const u = t - SP.hook_p.t; st.mood = 'worried'; st.blink = 0; st.armL = reach(g, -1, -g.sw * (1.5 + 0.2 * Math.sin(u * 5)), g.ySh + 180, { planar: true }); }
    if (t > hev('nar') + 0.3) { st.mood = 'surprised'; st.lean = -0.15; } }
  if (L === 'o1') { st.mood = 'surprised'; if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'shock'; st.blink = 0; st.lean = 0.05; st.lookY = 0.2; }
    if (speaking('o1_p', t, 0.05, 0.1)) { st.mood = 'skeptical'; st.lean = -0.05; st.lookY = 0; const u = t - SP.o1_p.t; st.armL = u > 1.2 ? reach(g, -1, g.sw * 0.3, g.ySh - 40, { planar: true }) : open(g, -1, 1.8, 60 + Math.sin(u * 6) * 15); if (u > 1.2) { st.turn = 0.35; st.look = 0.8; } }
    if (t > e('carts')) { st.mood = 'skeptical'; st.armL = open(g, -1, 1.9, 80); st.turn = -0.35; st.look = -0.9; } }
  if (L === 'o2') { st.mood = 'worried';
    if (speaking('o2_p', t, 0.05, 0.1)) { const u = t - SP.o2_p.t; st.mood = 'worried'; st.blink = 0; st.lean = -0.1; st.armL = u < 1.0 ? reach(g, -1, -g.sw * 0.1, g.ySh + 230, { planar: true }) : open(g, -1, 1.9, -20); st.lookY = 0; }
    if (t > e('bounce')) { st.mood = 'shock'; st.blink = 0; st.lean = 0.15; st.armL = open(g, -1, 1.6, 120); } }
  if (L === 'o3') { st.mood = 'surprised';
    if (speaking('o3_p', t, 0.05, 0.1)) { st.mood = 'happy'; st.blink = 0; st.lean = -0.15; st.tilt = 0.06; st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 260, { planar: true }); }
    if (t > e('sit')) { const k = eIO(clamp((t - e('sit')) / 0.6)); st.mood = 'happy'; st.lean = 0; st.lookY = 0; st.tilt = 0; st.turn = -0.15; st.look = -0.4; st.items = {}; st.armL = down(g, -1); st.armR = down(g, 1);
      if (!sit) { st.headY = 120 * k; st.legPose = 'squat'; st.drop = 0; } }
    if (sit) { st.legPose = 'squat'; st.drop = DROP.rog; st.armL = knees(g, -1); st.armR = knees(g, 1); }
    if (t > e('calm')) { st.blink = 1; st.turn = 0; st.look = 0; st.mood = 'happy'; } }
  if (L === 'o4') { st.mood = 'worried';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t < e('breathe') ? 'surprised' : 'worried'; st.blink = 0;
      if (t > e('pass') + 0.2) { const u = (t - e('pass')) * 9; st.mood = 'shock'; st.lean = 0; st.lookY = 0.5; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 420 + Math.sin(u) * 30, { planar: true }); st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 420 + Math.cos(u) * 30, { planar: true }); st.items = {}; } }
    if (t > e('pocket')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.2; st.armL = open(g, -1, 1.7, 60); st.armR = open(g, 1, 1.7, 60); st.items = {}; }
    if (speaking('o4_p', t, 0.05, 0.1)) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armL = open(g, -1, 1.25, 430); st.armR = open(g, 1, 1.25, 430); }
    if (sit) { const k = eBack(clamp((t - e('plop')) / 0.3), 2); st.legPose = 'squat'; st.drop = DROP.rog; st.mood = 'shock'; st.blink = 0; st.lean = 0; st.lookY = 0; st.turn = -0.2; st.look = -0.5; st.items = {};
      st.armL = open(g, -1, 1.6 - 0.2 * k, 300); st.armR = open(g, 1, 1.6 - 0.2 * k, 300); st.headY = -10 * (1 - k); } }
  if (L === 'end') { st.legPose = 'squat'; st.drop = DROP.rog; st.items = {}; st.lean = 0; st.lookY = 0; st.mood = 'happy'; st.blink = 1; st.turn = 0; st.look = 0; st.armL = knees(g, -1); st.armR = knees(g, 1);
    if (t > ev('end', 'chime')) { st.blink = 0; st.lookY = -0.4; st.mood = 'surprised'; }
    if (t > ev('end', 'laugh')) { st.mood = 'happy'; st.laugh = true; st.lookY = 0; st.turn = -0.2; st.look = -0.5; }
    if (t > ev('end', 'moral') + 0.4) { st.laugh = false; st.blink = 1; } }
  return st; }
const rogX = (t, L) => { if (L === 'hook') return 680; if (L === 'o3' && t > ev('o3', 'sit')) return lerp(X.rog, XS, eIO(clamp((t - ev('o3', 'sit')) / 0.5))); if (rogSits(t, L)) return XS; return X.rog; };
const packX = (t, L) => rogX(t, L);
function captState(t) { const g = G.capt, sp = speaking('end_c', t, 0, 0);
  const st = { t, talk: talk('capt1', t), mood: 'happy', blink: 1, turn: -0.3, look: -0.6, legPose: 'squat', drop: Math.round(CAPT.h * 0.47 - 300), armL: knees(g, -1), armR: reach(g, 1, g.hw * 0.9, g.headY + g.hh * 0.7, { planar: true }), items: { R: handsetItem }, headFirst: false };
  if (sp) { st.blink = 1; st.mood = 'smug'; }
  if (t > endOf('end_c')) { st.blink = 0; st.mood = 'happy'; st.turn = -0.4; st.look = -0.9; }
  return st; }
function pilotHat(c, hd) { c.save(); c.translate(hd.x, hd.y - hd.hh * 0.72); const s = hd.hh / 150; c.scale(s, s);
  paint(c, q => { q.m(-150, 10); q.q(-160, -90, 0, -100); q.q(160, -90, 150, 10); q.z(); }, '#1F2A44', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#10141C'; c.beginPath(); c.ellipse(0, 18, 175, 30, 0, 0, Math.PI); c.fill(); c.fillStyle = '#E8C15A'; c.fillRect(-140, -6, 280, 16); c.beginPath(); c.arc(0, -50, 24, 0, TAU); c.fill(); c.restore(); }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'pass1'], cover: ['her', 'pass1'], two: ['her', 'pass1'], her: ['her'], rog: ['pass1'], robot: ['her'], carts: ['her', 'pass1'], endw: ['her', 'pass1'], capt: [] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'pass1'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); board(c, t, L); speaker(c, t);
  let captHead = null; door(c, t, L, L === 'end' ? q => { backpack(q, (DOOR0 + DOOR1) / 2 + 40, 0.15, 1.1); captHead = K.put(q, CAPT, captState(t), (DOOR0 + DOOR1) / 2 + 40, 0); pilotHat(q, captHead); } : null);
  walkers(c, t, L);
  if (L === 'end') sitters(c, t);
  queuePeople(c, t, L);
  robot(c, X.robot, t, L);
  const by = bounceY(t, L);
  suitcase(c, X.her, '#8E5BD0', by > 0 ? clamp(1 - by / 40) * 0.6 : 0);
  if (who.includes('pass1')) { const sit = rogSits(t, L); if (sit || (L === 'o3' && t > ev('o3', 'sit'))) backpack(c, packX(t, L), sit ? 0.25 : 0); if (L === 'hook') backpack(c, 680 + 330, 0, 0.8); heads.pass1 = K.put(c, ROG, rogState(t, L), rogX(t, L), 0); }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, -by);
  if (heads.her && L === 'o2' && by > 0) speedLines(c, X.her, -SUIT_H, 900, t, 1);
  if (heads.her && L === 'o3' && t > ev('o3', 'calm')) zen(c, heads.her, t, clamp((t - ev('o3', 'calm')) / 0.4));
  if (heads.pass1 && L === 'o3' && t > ev('o3', 'calm')) zen(c, heads.pass1, t, clamp((t - ev('o3', 'calm') - 0.2) / 0.4));
  if (heads.pass1 && L === 'o4' && t > ev('o4', 'pass') + 0.3 && t < ev('o4', 'plop') + 1.5) sweat(c, heads.pass1, t, clamp((t - ev('o4', 'pass') - 0.3) / 0.3));
  if (heads.her && L === 'o3' && speaking('o3_h', t) && t > SP.o3_h.t + 1.0) { const g = G.her; for (let i = 0; i < 3; i++) sparkle(c, X.her + g.sw * 1.7 + [-60, 60, 0][i], g.ySh + 60 + [-30, -10, -120][i], 26, eBack(clamp((t - SP.o3_h.t - 1.0 - i * 0.1) / 0.25), 2)); }
  if (captHead && doorOpen(t, L) > 0.6) heads.capt1 = captHead;
  else if (L === 'end' && speaking('end_c', t, 0.1, 0.3)) heads.capt1 = { x: SPK.x, y: SPK.y + 60, hh: 100 };   // the tannoy: his bubble comes out of the loudspeaker
  if (!heads.her) heads.her = OFFL; if (!heads.pass1) heads.pass1 = OFF; if (!heads.capt1) heads.capt1 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(170, -(1650 - 960) / 0.6, 0.6, 'cover'), WIDE: S(120, fy(HY('pass1'), 0.48, 820), 0.48, 'wide'),
  TWO: S(250, fy(HY('pass1'), 0.66, 640), 0.66, 'two'), TWO_S: S(230, fy(HY('her'), 0.75, 580), 0.75, 'two'),
  HER: S(X.her + 40, fy(HY('her'), 1.0, 860), 1.0, 'her'), HER_W: S(X.her + 20, fy(HY('her'), 0.72, 640), 0.72, 'her'), HER_CU: S(X.her + 40, fy(HY('her'), 1.25, 920), 1.25, 'her'),
  ROG: S(X.rog - 40, fy(HY('pass1'), 0.95, 800), 0.95, 'rog'), ROG_CU: S(X.rog - 30, fy(HY('pass1'), 1.2, 880), 1.2, 'rog'),
  ROBOT: S(-230, -620, 0.9, 'robot'), CARTS: S(-720, -(1330 - 960) / 0.42, 0.42, 'carts'),
  ENDW: S(-200, -(1300 - 960) / 0.36, 0.36, 'endw'), SPKW: S(400, -1700, 0.42, 'endw'), CAPT: S((DOOR0 + DOOR1) / 2 + 40, fy(G.capt.headY, 0.72, 820), 0.72, 'capt'),
  ENDT: S(170, fy(HY('her'), 0.7, 860), 0.7, 'endw'),
  BOARD: U('board', 1), PASS: U('passport', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return f(SH.COVER); if (t < hev('robot') - 0.05) return f(SH.HER_CU); if (t < hev('wide') - 0.05) return f(SH.ROBOT); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_p.t - 0.1) return f(SH.HER); if (t < e('carts') - 0.02) return f(SH.ROG); return f(SH.CARTS); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_p.t - 0.1) return f(SH.HER); if (t < e('board')) return f(SH.ROG); if (t < e('bounce') - 0.02) return f(SH.BOARD); return f(SH.HER_W); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_p.t - 0.1) return f(SH.HER); if (t < e('sit')) return f(SH.ROG); return f(SH.TWO_S); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('breathe') - 0.3) return f(SH.HER); if (t < e('pass')) return f(SH.HER_CU); if (t < e('pocket') - 0.3) return f(SH.ROG); if (t < e('insert')) return f(SH.HER_W); if (t < SP.o4_p.t - 0.1) return f(SH.PASS); if (t < e('plop')) return f(SH.ROG_CU); return f(SH.TWO_S); }
  if (L === 'end') { if (t < e('chime') - 0.02) return f(SH.ENDW); if (t < e('capt')) return f(SH.SPKW); if (t < e('laugh') - 0.02) return f(SH.CAPT); if (t < e('moral') - 0.05) return f(SH.ENDT); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// the departures board close up: CHICAGO · GATE 7 · FINAL CALL blinking
function boardView(c, t) { backdrop(c, t, '#3A4256', '#1E2432'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'board' });
  const u = t - ev('o2', 'board'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 940); c.scale(0.72 * k, 0.72 * k); c.translate(-BOARD.x - 1150, -BOARD.y - 440); board(c, t, 'o2'); c.restore();
  const on = Math.floor(t * 3) % 2 === 0; if (on) { c.save(); c.globalAlpha = 0.18; c.fillStyle = '#E0474C'; c.fillRect(0, 0, W, HH); c.restore(); } }
// her passport out of the pocket, with sparkles
function passView(c, t) { backdrop(c, t, '#F7E3B0', '#E3B860'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'passport' });
  const u = t - ev('o4', 'insert'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 940); c.rotate(-0.08 + Math.sin(t * 2) * 0.02); c.scale(3.6 * k, 3.6 * k); passport(c, 1); c.restore();
  for (let i = 0; i < 6; i++) { const a = t * 1.5 + i * TAU / 6; sparkle(c, 540 + Math.cos(a) * 360, 940 + Math.sin(a) * 420, 40, k * (0.6 + 0.4 * Math.abs(Math.sin(t * 5 + i)))); } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  // the rubric label, small, on the plate's top edge
  c.save(); c.translate(0, -165); c.rotate(0.03); UI.font(c, 'Unb9', 30); const rw = c.measureText('НАШЕ ЗА ГРАНИЦЕЙ').width + 60; c.fillStyle = '#4CAF6A'; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -rw / 2, -26, rw, 52, 26); c.fill(); c.stroke(); c.fillStyle = C.white; c.fillText('НАШЕ ЗА ГРАНИЦЕЙ', 0, 2); c.restore();
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 110, w: 980, h: 355, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor; then the comment question (ask) big above the buttons
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI, askT = SC.outro.ev.ask;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine on her suitcase + Roger (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.pass1; K.put(c, ROG, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 1.15, gm.ySh + 470, { planar: true }), items: { R: packItem } }, 640, 0);
    suitcase(c, 0); K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, legPose: 'squat', drop: DROP.her, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 120 + Math.sin(t * 8) * 30, { planar: true }), armR: knees(g, 1), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // the question; on the ask line it flips to the comment question
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - eIn(P(t, askT - 0.15, askT))); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const qa = eBack(P(t, askT, askT + 0.3), 2.2); if (qa > 0) { const pu = 1 + 0.03 * Math.sin(t * 6); c.save(); c.translate(540, 290); c.scale(qa * pu, qa * pu); c.rotate(-0.02);
    textFit(c, 'Unb9', 74, 'А ВЫ САДИТЕСЬ', 900); strokeText(c, 'А ВЫ САДИТЕСЬ', 0, -62, C.oliveD, C.white, 14); textFit(c, 'Unb9', 74, 'НА ДОРОЖКУ?', 900); strokeText(c, 'НА ДОРОЖКУ?', 0, 42, C.pink, C.white, 14); c.restore();
    if (global.__QA) global.__QA.ui(c, 'card', { x: 70, y: 180, w: 940, h: 220, k: qa, id: 'ask' }); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < askT - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); }   // the ask line is shown big at the top instead of a caption
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { if (tag === 'ui:board') boardView(c, t); else passView(c, t); heads = { her: OFFL, pass1: OFF, capt1: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { pass1: ['ROGER', '#C0661E'], capt1: ['CAPTAIN', '#1F2A44'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_p: -0.2, o1_h: -0.22, o1_p: -0.2, o2_h: -0.22, o2_p: -0.2, o3_h: -0.22, o3_p: -0.2, o4_h: -0.15, o4_p: -0.2, end_c: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('sitdown', NF, renderFrame);
