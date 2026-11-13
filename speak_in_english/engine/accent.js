// "Носитель передразнил твой акцент" — rubric answers4 «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node accent.js start end out.mp4 | --png=f1,f2
// Office kitchen by the water cooler. Hugo (tweed blazer) mocks her rolled R: giant «R» letters fly out of his mouth and plop into her coffee mug.
// Absurd detail: the department parrot in a tie sits on the cooler and repeats only the last word of Hugo's lines (his own voice, pitched up).
// o1 «В ЛОБ»: "Stop! Not funny! You bad!" (she stamps) — "Bad? It's a tribute!" -> a theatrical bow under a spotlight, roses fall; parrot "TRIBUTE!".
// o2 «ВЕЖЛИВО»: "Please, don't do my accent." — "What accent? ... rrreally." -> one more «R» splashes into her coffee; parrot "RRREALLY?"; mug insert.
// o3 «КАК НОСИТЕЛЬ»: "Was that meant to be me? Don't give up the day job." — "...Fair. That was terrible." -> he deflates, the «R»s sink; parrot "TERRIBLE!"; tip.
// o4 «КОРОЛЕВСКИЙ»: she sips: "Lovely. I speak two languages..." — "Wuss... Wor-sester..." -> the letters crack and crumble out of his mouth; parrot "MINUTE!".
// Twist (music silent): he tries Russian — «Z», «D», «R», «A» drop out of his mouth into a pile on his shoes: "Let's just go with hello." (wave); parrot "HELLO!".
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/accent/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'blazer', col: '#EF7FAA', shirt: '#FFF6EE', tie: null }, bottom: { type: 'trousers', col: '#3A4254' }, shoes: { col: '#2B2F3A', acc: null } };
const HUGO = { ...BASE.oliver, hair: { style: 'quiff', col: '#C0662E' }, brow: '#9A4A20', top: { type: 'blazer', col: '#8A6A4A', shirt: '#EAF2FA', tie: '#2E9A6A' }, bottom: { type: 'trousers', col: '#4A4038' } };
const G = { her: geom(HER), coll3: geom(HUGO) };
const X = { her: -330, hugo: 330 };
const CLX = 900;                                   // water cooler centre
const PX = CLX, PY = -1430, PS = 1.1;              // parrot feet on the bottle top
const MK = 0.8, MDY = 220;                        // her mug: hand target (local) = (sw*MK, ySh+MDY)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const mouthW = () => ({ x: X.hugo - G.coll3.hw * 0.3, y: G.coll3.headY + G.coll3.hh * 0.5 });
const rimW = () => ({ x: X.her + G.her.sw * MK, y: G.her.ySh + MDY - 62 });

// ---------------- letters
function letter(c, ch, x, y, size, rot = 0, col = '#E0474C', a = 1) { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(rot); UI.font(c, 'Unb9', size); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillText(ch, size * 0.05, size * 0.07); UI.strokeText(c, ch, 0, 0, col, '#4A2020', size * 0.09); c.restore(); }
// «R» flights from his mouth into her mug: [launch time]
const FLY = 0.85;
const flights = () => [...hev('r'), ev('o2', 'r')];
function flyR(c, t) { for (const t0 of flights()) { const u = (t - t0) / FLY; if (u < 0 || u > 1) continue; const a = mouthW(), b = rimW();
  const x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u) - 520 * Math.sin(Math.PI * u), s = lerp(0.55, 1, eOut(clamp(u / 0.3))) * (1 - 0.45 * clamp((u - 0.8) / 0.2));
  letter(c, 'R', x, y - 40, 420 * s, -0.35 + u * 3.2); } }
// how many «R»s float in her coffee, and how sunk they are
function mugState(t) { let n = 0; for (const t0 of flights()) if (t > t0 + FLY) n++; const sk = clamp((t - ev('o3', 'sink')) / 0.6); if (sk >= 1) n = 0; return { n, sink: sk, last: Math.max(...flights().filter(t0 => t > t0 + FLY).map(t0 => t0 + FLY), -9) }; }
function splash(c, t, x, y, s = 1) { const t0 = mugState(t).last, u = t - t0; if (u < 0 || u > 0.55) return; c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#7A4A26';
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.33, v = 260 + (i % 3) * 60, xx = Math.cos(a) * v * u, yy = Math.sin(a) * v * u + 700 * u * u; c.beginPath(); c.arc(xx, yy, 14 * (1 - u), 0, TAU); c.fill(); } c.restore(); }

// ---------------- props
// her mug (0,0) = hand; white mug with a pink band, handle to the right; «R»s sticking out of the coffee
function mug(c, st, s = 1, t = 0) { c.save(); c.scale(s, s);
  const { n, sink } = st, lid = [[-24, -0.35], [20, 0.3], [-2, -0.05], [34, 0.5]];
  c.fillStyle = '#5A3418'; c.beginPath(); c.ellipse(0, -62, 52, 12, 0, 0, TAU); c.fill();
  for (let i = 0; i < Math.min(n, 4); i++) { const [dx, r] = lid[i], bob = Math.sin(t * 3 + i * 1.7) * 4; letter(c, 'R', dx, -88 + sink * 70 + bob, 74, r, '#E0474C', 1 - sink); }
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 15; c.beginPath(); c.arc(58, -8, 26, -1.3, 1.3); c.stroke(); c.strokeStyle = '#C9C2B8'; c.lineWidth = 3; c.beginPath(); c.arc(58, -8, 34, -1.2, 1.2); c.stroke();
  paint(c, q => { q.m(-56, -62); q.l(56, -62); q.l(50, 58); q.q(0, 70, -50, 58); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#EF7FAA'; c.fillRect(-54, -20, 108, 26);
  c.fillStyle = 'rgba(255,255,255,.0)'; c.restore(); }
const mugItem = t => ctx => mug(ctx, mugState(t), 1, t);
// a rose (fallen at his feet after the bow)
function rose(c, x, y, r) { c.save(); c.translate(x, y); c.rotate(r); c.strokeStyle = '#3E8A3A'; c.lineWidth = 9; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 150); c.stroke(); c.fillStyle = '#4CAF6A'; c.beginPath(); c.ellipse(16, 80, 22, 10, 0.5, 0, TAU); c.fill();
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, -10, 30, 0, TAU); c.fill(); c.strokeStyle = '#A82A30'; c.lineWidth = 5; c.beginPath(); c.arc(0, -10, 16, 0.5, 5.6); c.stroke(); c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }

// ---------------- office kitchen (prerendered, softly blurred)
const BX0 = -3200, BY0 = -4400, BW = 6800, BH = 5800, BS = 0.5;
function drawOffice(c) {
  c.fillStyle = '#CFE6E2'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.25)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, BY0, 90, BH);   // soft stripes
  c.fillStyle = '#F4EFE6'; c.fillRect(BX0, BY0, BW, 300); c.fillStyle = '#E3DCCD'; c.fillRect(BX0, BY0 + 300, BW, 30);   // ceiling
  for (const lx of [-1800, 300, 2400]) { c.fillStyle = '#FFF8DC'; rr(c, lx - 330, BY0 + 330, 660, 60, 20); c.fill(); c.fillStyle = 'rgba(255,248,220,.35)'; c.beginPath(); c.moveTo(lx - 330, BY0 + 390); c.lineTo(lx + 330, BY0 + 390); c.lineTo(lx + 700, BY0 + 1400); c.lineTo(lx - 700, BY0 + 1400); c.fill(); }
  // big window on the left: city skyline
  c.fillStyle = '#F4EFE6'; c.fillRect(-2900, -3100, 1900, 1700); c.fillStyle = '#9FD0EA'; c.fillRect(-2840, -3040, 1780, 1580);
  c.fillStyle = '#7FA9C9'; for (const [x, w, h] of [[-2840, 220, 600], [-2600, 160, 900], [-2420, 260, 500], [-2140, 200, 1100], [-1920, 240, 700], [-1660, 180, 950], [-1460, 300, 560], [-1240, 180, 800]]) c.fillRect(x, -1460 - h, w, h);
  c.fillStyle = 'rgba(255,255,255,.55)'; for (const [x, w, h] of [[-2600, 160, 900], [-2140, 200, 1100], [-1660, 180, 950]]) for (let yy = -1460 - h + 50; yy < -1500; yy += 90) for (let xx = x + 25; xx < x + w - 30; xx += 55) c.fillRect(xx, yy, 26, 40);
  c.fillStyle = 'rgba(255,255,255,.8)'; for (const [x, y, s] of [[-2500, -2850, 1], [-1500, -2950, 0.8]]) for (const [dx, dy, r] of [[0, 0, 60], [70, -20, 80], [150, 5, 60]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); }
  c.fillStyle = '#F4EFE6'; c.fillRect(-1975, -3040, 30, 1580); c.fillRect(-2840, -2260, 1780, 26); c.fillStyle = '#E3DCCD'; c.fillRect(-2960, -1420, 2020, 60);
  // wall clock + a sign
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-380, -2750, 130, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 16; c.stroke(); c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-380, -2750); c.lineTo(-380, -2840); c.moveTo(-380, -2750); c.lineTo(-310, -2720); c.stroke();
  c.fillStyle = '#2E9A6A'; rr(c, 380, -2900, 1000, 220, 30); c.fill(); fitTxt(c, 'KITCHEN', 880, -2790, 130, '#FFFFFF', 860);
  // tall plant on the far left
  c.fillStyle = '#C98B5A'; rr(c, -1260, -420, 300, 420, 30); c.fill(); c.fillStyle = '#3E8A3A';
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28; c.save(); c.translate(-1110, -420); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, -330, 70, 330, 0, 0, TAU); c.fill(); c.restore(); }
  // counter on the right: cupboards, a coffee machine, mugs, a sign
  c.fillStyle = '#E9E2D4'; c.fillRect(1250, -2500, 2400, 700); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 8; for (let x = 1250; x < 3600; x += 600) c.strokeRect(x + 10, -2490, 580, 680);
  c.fillStyle = '#FFFFFF'; rr(c, 1500, -2350, 760, 220, 20); c.fill(); fitTxt(c, 'PLEASE WASH', 1880, -2280, 70, '#E0474C', 700); fitTxt(c, 'YOUR MUG', 1880, -2190, 70, '#E0474C', 700);
  c.fillStyle = '#B8B0A2'; c.fillRect(1250, -980, 2400, 70); c.fillStyle = '#E9E2D4'; c.fillRect(1250, -910, 2400, 910); for (let x = 1250; x < 3600; x += 600) c.strokeRect(x + 10, -900, 580, 890);
  c.fillStyle = '#2B2F3A'; rr(c, 1700, -1620, 420, 640, 30); c.fill(); c.fillStyle = '#4A5060'; rr(c, 1760, -1560, 300, 160, 18); c.fill(); c.fillStyle = '#7CC7F2'; rr(c, 1790, -1530, 120, 60, 8); c.fill();
  c.fillStyle = '#9AA2B0'; c.fillRect(1870, -1300, 80, 120); c.fillStyle = '#FFFFFF'; rr(c, 1840, -1150, 140, 160, 16); c.fill();
  for (const [x, col] of [[2400, '#EF7FAA'], [2620, '#4CAF6A'], [2840, '#F2B33D']]) { c.fillStyle = col; rr(c, x, -1150, 150, 170, 18); c.fill(); c.strokeStyle = col; c.lineWidth = 14; c.beginPath(); c.arc(x + 160, -1065, 36, -1.3, 1.3); c.stroke(); }
  // skirting + floor
  c.fillStyle = '#F4EFE6'; c.fillRect(BX0, -160, BW, 40);
  c.fillStyle = '#C9A27A'; c.fillRect(BX0, -120, BW, BY0 + BH + 120); c.fillStyle = 'rgba(90,60,30,.12)'; for (let y = -120; y < BY0 + BH; y += 140) c.fillRect(BX0, y, BW, 6);
  for (let y = -120, r = 0; y < BY0 + BH; y += 140, r++) for (let x = BX0 + (r % 2) * 380; x < BX0 + BW; x += 760) c.fillRect(x, y, 6, 140);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawOffice);

// ---------------- the water cooler + the department parrot (live)
function cooler(c, t) { const x = CLX;
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x, 0, 190, 26, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(x - 150, 0); q.l(x - 150, -960); q.l(x + 150, -960); q.l(x + 150, 0); q.z(); }, '#F4F6F8', { sd: 6, hd: 3, lw: 5 });
  c.fillStyle = '#DDE3EA'; rr(c, x - 110, -760, 220, 300, 18); c.fill(); c.fillStyle = '#4A5060'; rr(c, x - 80, -730, 160, 40, 10); c.fill();
  c.fillStyle = '#3E73B8'; rr(c, x - 60, -690, 40, 60, 8); c.fill(); c.fillStyle = '#E0474C'; rr(c, x + 20, -690, 40, 60, 8); c.fill();
  c.fillStyle = '#C9D2DA'; rr(c, x - 90, -520, 180, 30, 8); c.fill();
  // bottle
  c.save(); c.globalAlpha = 0.9; paint(c, q => { q.m(x - 60, -960); q.l(x - 60, -1000); q.q(x - 140, -1010, x - 140, -1080); q.l(x - 140, -1360); q.q(x - 140, -1430, x - 60, -1430); q.l(x + 60, -1430); q.q(x + 140, -1430, x + 140, -1360); q.l(x + 140, -1080); q.q(x + 140, -1010, x + 60, -1000); q.l(x + 60, -960); q.z(); }, '#9FD3F0', { sd: 3, hd: 1, lw: 4 }); c.restore();
  c.fillStyle = 'rgba(255,255,255,.45)'; rr(c, x - 110, -1380, 26, 330, 13); c.fill(); c.fillStyle = 'rgba(62,115,184,.25)'; c.fillRect(x - 136, -1250 + Math.sin(t * 1.3) * 6, 272, 10);
  K.mark(c, 'cooler', x, -700, 300); }
// parrot: (0,0) = feet; st: { open (beak 0..1), flap (wings 0..1), nod, bob, blink, look }
function parrot(c, x, y, s, st) { c.save(); c.translate(x, y); c.scale(s, s);
  const bob = st.bob || 0, op = st.open || 0, fl = st.flap || 0;
  // tail
  c.fillStyle = '#3E73B8'; c.beginPath(); c.moveTo(-10, -60); c.lineTo(30, 90); c.lineTo(-5, 95); c.lineTo(-40, -50); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(0, -60); c.lineTo(50, 70); c.lineTo(20, 80); c.lineTo(-20, -50); c.fill();
  // feet
  c.strokeStyle = '#B88A5A'; c.lineWidth = 8; c.lineCap = 'round'; for (const fx of [-18, 18]) { c.beginPath(); c.moveTo(fx, -30); c.lineTo(fx, 0); c.moveTo(fx - 14, 2); c.lineTo(fx + 14, 2); c.stroke(); }
  c.save(); c.translate(0, bob);
  // body
  paint(c, q => { q.m(0, -230); q.q(70, -220, 70, -120); q.q(66, -40, 0, -30); q.q(-66, -40, -66, -120); q.q(-62, -220, 0, -230); q.z(); }, '#4CAF6A', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#F2D94E'; c.beginPath(); c.ellipse(-12, -110, 38, 64, 0, 0, TAU); c.fill();
  // wings (flap = raised)
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 52, -170); c.rotate(sd * (0.15 + fl * 1.1)); c.fillStyle = '#2E8A55'; c.beginPath(); c.ellipse(sd * 4, 60, 26, 78, sd * 0.1, 0, TAU); c.fill(); c.fillStyle = '#3E73B8'; c.beginPath(); c.ellipse(sd * 6, 110, 18, 34, 0, 0, TAU); c.fill(); c.restore(); }
  // tie (red, with a white collar)
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-40, -205); c.lineTo(0, -185); c.lineTo(40, -205); c.lineTo(36, -180); c.lineTo(0, -168); c.lineTo(-36, -180); c.fill();
  c.fillStyle = '#E0474C'; c.strokeStyle = '#8A2A30'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -188); c.lineTo(14, -188); c.lineTo(9, -168); c.lineTo(-9, -168); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-9, -168); c.lineTo(9, -168); c.lineTo(18, -100); c.lineTo(0, -82); c.lineTo(-18, -100); c.closePath(); c.fill(); c.stroke();
  // head
  c.save(); c.translate(0, -255); c.rotate(st.nod || 0);
  c.fillStyle = '#4CAF6A'; c.beginPath(); c.arc(0, 0, 58, 0, TAU); c.fill(); c.strokeStyle = '#2E7A45'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(-10, -52); c.quadraticCurveTo(10, -100, 30, -70); c.quadraticCurveTo(14, -66, 18, -48); c.fill();   // crest
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(-18, -8, 24, 26, 0, 0, TAU); c.fill();
  if (st.blink) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.beginPath(); c.moveTo(-34, -6); c.lineTo(-4, -6); c.stroke(); }
  else { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-24 + (st.look || 0) * 6, -6, 11, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-27, -10, 4, 0, TAU); c.fill(); }
  // beak (points left, toward the people): upper hook + lower jaw that opens
  c.fillStyle = '#4A4A50'; c.save(); c.translate(-44, 14); c.rotate(-0.15 - op * 0.5); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-30, 4, -34, 18); c.quadraticCurveTo(-10, 22, 6, 12); c.fill(); c.restore();
  c.fillStyle = '#F2A33A'; c.strokeStyle = '#B86A1A'; c.lineWidth = 3; c.beginPath(); c.moveTo(-36, -14); c.quadraticCurveTo(-90, -14, -78, 30); c.quadraticCurveTo(-70, 10, -44, 12); c.closePath(); c.fill(); c.stroke();
  c.restore(); c.restore(); c.restore(); }
const PAR = TL.cfg.parrot;
const parEcho = t => PAR.find(e => t >= e.t - 0.08 && t < e.t + Math.max(e.d, 0.75) + 0.1);
function parrotState(t, L) { const e = parEcho(t), st = { bob: Math.sin(t * 2.2) * 4, look: 0, blink: (t % 3.7) < 0.12 };
  if (e) { const u = t - e.t; st.open = u < e.d ? 0.5 + 0.5 * Math.abs(Math.sin(u * 22)) : 0; st.flap = u < e.d + 0.3 ? Math.abs(Math.sin(u * 9)) * 0.8 : 0; st.bob = -Math.abs(Math.sin(u * 8)) * 14; }
  if (L === 'o1' && t > ev('o1', 'bow')) st.flap = Math.max(st.flap || 0, Math.abs(Math.sin((t - ev('o1', 'bow')) * 10)) * 0.7);   // applauds the bow with its wings
  if (L === 'o3' && e) st.nod = Math.sin((t - e.t) * 12) * 0.25;
  // looks at whoever speaks
  for (const s of TL.speech) if (t >= s.t && t < s.t + s.d) { if (s.who === 'her') st.look = -1; if (s.who === 'coll3') st.look = -0.4; }
  return st; }
function parrotBubble(c, t, proj) { const e = parEcho(t); if (!e) return; const u = t - e.t, dd = Math.max(e.d, 0.75), k = eBack(P(u, -0.08, 0.15), 2.4) * (1 - eIn(P(u, dd - 0.05, dd + 0.1))); if (k <= 0) return;
  const an = proj({ x: PX - 90 * PS, y: PY - 300 * PS }); UI.font(c, 'Unb9', 52); const tw = c.measureText(e.w).width + 70, bh = 96;
  let bx = clamp(an.x - tw + 60, 60, 940 - tw), by = clamp(an.y - bh - 70, 380, 1500);
  c.save(); const ox = Math.min(bx + tw - 50, an.x), oy = by + bh; c.translate(ox, oy); c.scale(k, k); c.translate(-ox, -oy);
  c.fillStyle = 'rgba(62,71,30,.25)'; rr(c, bx + 8, by + 12, tw, bh, 40); c.fill(); c.fillStyle = '#F2FBEF'; c.strokeStyle = '#2E7A45'; c.lineWidth = 7; rr(c, bx, by, tw, bh, 40); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(ox - 26, oy - 4); c.lineTo(an.x + 10, an.y - 10); c.lineTo(ox + 14, oy - 4); c.fill();
  c.fillStyle = '#2E7A45'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e.w, bx + tw / 2, by + bh / 2 + 3); c.restore();
  if (global.__QA) global.__QA.ui(c, 'bubble', { x: bx, y: by, w: tw, h: bh, k, id: 'parrot' }); }

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const landFlinch = t => { let k = 0; for (const t0 of flights()) { const u = t - t0 - FLY; if (u > 0 && u < 0.35) k = Math.max(k, Math.sin(u / 0.35 * Math.PI)); } return k; };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'annoyed', turn: 0.25, look: 0.7 };
  const mugHand = () => { st.armR = hold(g, 1, MDY, MK); st.items = { R: mugItem(t) }; }; mugHand();
  const fl = landFlinch(t); if (fl > 0) { st.headY = -10 * fl; st.mood = 'shock'; st.blink = 0; }
  if (L === 'hook') { st.mood = fl > 0 ? 'shock' : 'annoyed'; if (t > hev('par')) st.mood = 'angry'; if (t > hev('wide')) { st.mood = 'angry'; st.look = 0.8; } }
  if (L === 'o1') { st.mood = 'angry';
    if (speaking('o1_h', t, 0.05, 0.1)) { const u = t - SP.o1_h.t, hit = Math.abs(Math.sin(u * 5.5)); st.headY = hit * 12; st.armL = reach(g, -1, -g.sw * (1.6 + 0.2 * hit), g.ySh + 200 - hit * 80, { planar: true }); }
    if (t > SP.o1_c.t) { st.mood = 'shock'; st.blink = 0; st.headY = 0; }
    if (t > e('bow') + 0.3) { st.mood = 'tired'; st.blink = 1; st.look = 0.3; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'worried'; st.tilt = 0.06; st.lookY = 0.15; st.armL = open(g, -1, 1.5, 230); }
    if (t > SP.o2_c.t) { st.mood = 'happy'; st.tilt = 0; st.lookY = 0; }
    if (t > e('land') - 0.05) { st.mood = 'shock'; st.blink = 0; st.look = 0.1; st.turn = 0.1; }
    if (t > e('par') + 0.4) { st.mood = 'tired'; st.blink = 1; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'skeptical'; const u = (t - SP.o3_h.t) * 4.5; st.armL = reach(g, -1, -g.sw * (1.5 + 0.15 * Math.sin(u)), g.ySh + 170 + Math.cos(u) * 20, { planar: true }); }
    if (t > SP.o3_c.t) { st.mood = 'smug'; }
    if (t > e('sink')) { st.mood = 'happy'; st.blink = 1; } }
  if (L === 'o4') { st.mood = 'smug';
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.look = 0.8;
      if (t < e('ch2') - 0.05) { const k = eOut(clamp((t - e('sip')) / 0.3)) * (1 - eIO(clamp((t - e('ch2') + 0.4) / 0.3))); st.armR = reach(g, 1, lerp(g.sw * MK, g.hw * 0.75, k), lerp(g.ySh + MDY, g.headY + g.hh * 0.95 + 110, k), { planar: true }); st.blink = k > 0.6 ? 1 : 0; st.mood = 'smug'; st.headFirst = false; }
      else { const u = (t - SP.o4_h.t) * 3; st.armL = reach(g, -1, -g.sw * (1.55 + 0.2 * Math.sin(u)), g.ySh + 170 + Math.cos(u) * 25, { planar: true }); } }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; }
    if (t > SP.o4_c.t + 1.0) { st.blink = 0; st.mood = 'happy'; st.laugh = true; } }
  if (L === 'end') { st.mood = 'happy'; st.look = 0.8;
    if (t > ev('end', 'z')[0]) { st.mood = 'surprised'; st.blink = 0; }
    if (t > ev('end', 'wave')) { st.mood = 'happy'; st.laugh = true; }
    if (t > ev('end', 'moral') - 0.1) { st.laugh = false; st.mood = 'smug'; const k = eOut(clamp((t - ev('end', 'moral') - 1.6) / 0.3)) * (1 - eIO(clamp((t - ev('end', 'moral') - 2.6) / 0.3)));
      st.armR = reach(g, 1, lerp(g.sw * MK, g.hw * 0.75, k), lerp(g.ySh + MDY, g.headY + g.hh * 0.95 + 110, k), { planar: true }); st.blink = k > 0.6 ? 1 : 0; st.headFirst = false; } }
  return st; }
const bowK = (t) => { const u = t - ev('o1', 'bow'); if (u < 0) return 0; const a = eOut(clamp(u / 0.3)) * (1 - eIO(clamp((u - 1.1) / 0.3))), b = eOut(clamp((u - 1.6) / 0.3)) * (1 - eIO(clamp((u - 2.7) / 0.3))); return Math.max(a, b); };
function hugoState(t, L) { const g = G.coll3, e = k => ev(L, k), st = { ...base(g, t, 'coll3'), mood: 'happy', turn: -0.25, look: -0.7 };
  if (L === 'hook') { st.mood = 'smug';
    if (speaking('hook_c', t, 0.3, 0.1)) { const u = t - SP.hook_c.t; st.mood = 'happy'; st.laugh = false; st.armL = reach(g, -1, -g.sw * (1.7 + 0.2 * Math.sin(u * 4)), g.ySh + 150 + Math.cos(u * 4) * 30, { planar: true }); st.armR = open(g, 1, 1.8, 120 + Math.sin(u * 4 + 1) * 30); st.headY = Math.sin(u * 8) * 6; st.tilt = 0.06 * Math.sin(u * 3); }
    if (t > endOf('hook_c') + 0.1) { st.mood = 'happy'; st.laugh = true; st.armL = hold(g, -1, 330, 0.4); st.armR = hold(g, 1, 330, 0.4); } }
  if (L === 'o1') { st.mood = 'smug';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_c', t, 0.05, 0.05)) { st.mood = 'happy'; gest(st, g, 'coll3', t, -1, 120); st.armR = open(g, 1, 1.6, 150); }
    const k = bowK(t); if (t > e('bow')) { st.mood = 'happy'; st.blink = k > 0.5 ? 1 : 0; st.headY = 105 * k; st.drop = 40 * k; st.tilt = -0.16 * k; st.turn = -0.1; st.look = -0.3;
      st.armR = reach(g, 1, g.sw * lerp(1.6, 2.3, k), g.ySh + lerp(150, 230, k), { planar: true }); st.armL = reach(g, -1, lerp(-g.sw * 1.1, g.sw * 0.15, k), g.ySh + lerp(500, 330, k), { planar: true }); } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.1)) { st.mood = 'neutral'; st.lookY = 0.1; }
    if (speaking('o2_c', t, 0.05, 0.05)) { st.mood = 'happy'; st.lookY = -0.25; st.armL = open(g, -1, 1.8, 90); st.armR = open(g, 1, 1.8, 90); }
    if (t > e('land')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armL = hold(g, -1, 330, 0.4); st.armR = hold(g, 1, 330, 0.4); } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o3_c.t - 0.05) { st.mood = 'worried'; st.blink = 0; st.armL = hold(g, -1, 300, 0.25); st.armR = hold(g, 1, 310, 0.25); st.tilt = 0.08; st.lookY = 0.25; }
    if (t > e('sink')) { st.mood = 'sad'; st.headY = 16 * eOut(clamp((t - e('sink')) / 0.4)); } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > ev('o4', 'ch3') ? 'worried' : 'happy'; if (t > ev('o4', 'worc')) { st.mood = 'shock'; st.blink = 0; } }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (speaking('o4_c', t, 0.05, 0.05)) { const u = t - SP.o4_c.t; st.mood = 'worried'; st.tilt = 0.05 * Math.sin(u * 6); st.armL = open(g, -1, 1.5, 200); st.armR = open(g, 1, 1.5, 200); }
    if (t > e('palm')) { st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 20, { planar: true }); st.mood = 'tired'; }
    if (t > endOf('o4_c') + 0.05) { st.mood = 'tired'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'skeptical'; st.lookY = -0.3; st.tilt = -0.06; st.armL = hold(g, -1, 300, 0.25); st.armR = hold(g, 1, 300, 0.25);
    if (speaking('end_c', t, 0.05, 0)) { st.mood = 'worried'; st.lookY = 0; st.tilt = 0.04 * Math.sin(t * 7); }
    if (t > ev('end', 'z')[3] + 0.4) { st.lookY = 0.45; st.mood = 'worried'; }
    if (t > ev('end', 'wave')) { const u = t - ev('end', 'wave'); st.mood = 'happy'; st.lookY = 0; st.tilt = 0; st.armL = reach(g, -1, -g.sw * (2.0 + 0.25 * Math.sin(u * 9)), g.headY + 40, { planar: true }); }
    if (t > ev('end', 'moral')) { st.mood = 'happy'; st.blink = 1; st.armL = hold(g, -1, 330, 0.4); } }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'coll3'], cover: ['her', 'coll3'], two: ['her', 'coll3'], her: ['her'], hugo: ['coll3'], parrot: [] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function spotlight(c, t, L) { if (L !== 'o1') return; const k = clamp((t - ev('o1', 'bow') + 0.05) / 0.15); if (k <= 0) return; const x = X.hugo;
  c.save(); c.globalAlpha = 0.5 * k; const g = c.createLinearGradient(0, -2600, 0, 0); g.addColorStop(0, 'rgba(255,246,200,0)'); g.addColorStop(1, 'rgba(255,240,170,.9)'); c.fillStyle = g;
  c.beginPath(); c.moveTo(x - 90, -2800); c.lineTo(x + 90, -2800); c.lineTo(x + 480, 0); c.lineTo(x - 480, 0); c.fill(); c.fillStyle = 'rgba(255,240,170,.8)'; c.beginPath(); c.ellipse(x, 0, 480, 60, 0, 0, TAU); c.fill(); c.restore(); }
function roses(c, t, L) { if (L !== 'o1') return; const t0 = ev('o1', 'rose');
  [[-120, 0.9], [140, -0.6], [40, 1.6]].forEach(([dx, r], i) => { const u = t - t0 - i * 0.18; if (u < 0) return; const f = clamp(u / 0.55), y = lerp(-2300, -30, f * f), rot = lerp(r * 3, r + 1.57, eOut(f)); c.save(); c.translate(X.hugo + dx * 2 + (i - 1) * 60, y); c.scale(1.6, 1.6); rose(c, 0, 0, rot); c.restore(); }); }
function crumbs(c, t, L) { if (L !== 'o4') return; const words = ['WUSS', 'WOR', 'CESTER'], m = mouthW();
  ev('o4', 'l').forEach((t0, i) => { const u = t - t0; if (u < 0 || u > 1.6) return; const wd = words[i], sz = 120, bx = m.x - 170 - i * 10, by = m.y + 270;
    const pop = eBack(clamp(u / 0.2), 2.2), br = clamp((u - 0.45) / 1.0);
    UI.font(c, 'Unb9', sz); const ws = [...wd].map(ch => c.measureText(ch).width), tw = ws.reduce((a, b) => a + b, 0); let x = bx - tw / 2;
    [...wd].forEach((ch, j) => { const cx = x + ws[j] / 2; x += ws[j]; const dir = (j % 2 ? 1 : -1) * (0.5 + 0.3 * j), fall = br * br * 1400;
      letter(c, ch, cx + dir * 90 * br, by + fall, sz * pop, dir * br * 4, '#F2B33D', 1 - clamp((br - 0.75) / 0.25)); });
    if (br > 0 && br < 0.15) { c.save(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(bx - tw / 2, by - 40); c.lineTo(bx - 20, by + 10); c.lineTo(bx + 20, by - 30); c.lineTo(bx + tw / 2, by + 30); c.stroke(); c.restore(); } }); }
const ZPOS = [[-90, -85, 0.25], [90, -75, -0.2], [-5, -210, 0.12], [10, -350, -0.35]];
function zdra(c, t, L) { if (L !== 'end' && L !== 'outro') return; const m = mouthW();
  'ZDRA'.split('').forEach((ch, i) => { const t0 = ev('end', 'z')[i], u = t - t0; if (u < 0) return; const [dx, dy, r] = ZPOS[i], tx = X.hugo - 40 + dx, ty = dy;
    const pop = eBack(clamp(u / 0.18), 2.2), f = clamp((u - 0.12) / 0.38), x = lerp(m.x - 60, tx, f), y = lerp(m.y + 60, ty, f * f), bounce = u > 0.5 ? Math.abs(Math.sin((u - 0.5) * 14)) * 30 * Math.exp(-(u - 0.5) * 7) : 0;
    letter(c, ch, x, y - bounce, 190 * pop, lerp(0, r, f), '#3E73B8'); }); }
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'coll3'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  cooler(c, t); spotlight(c, t, L);
  if (who.includes('coll3')) heads.coll3 = K.put(c, HUGO, hugoState(t, L), X.hugo, 0);
  roses(c, t, L); if (who.includes('coll3')) zdra(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  parrot(c, PX, PY, PS, parrotState(t, L));
  if (tag !== 'parrot') { flyR(c, t); const r = rimW(); if (who.includes('her')) splash(c, t, r.x, r.y - 30, 1.2); }
  if (who.includes('coll3')) crumbs(c, t, L);
  if (L === 'o4' && heads.coll3) sweat(c, heads.coll3, t, clamp((t - ev('o4', 'worc')) / 0.3) * (1 - clamp((t - ev('o4', 'palm')) / 0.3)));
  if (L === 'end' && heads.coll3) sweat(c, heads.coll3, t, clamp((t - SP.end_c.t) / 0.3) * (1 - clamp((t - ev('end', 'wave')) / 0.3)));
  if (!heads.her) heads.her = OFFL; if (!heads.coll3) heads.coll3 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(250, fy(HY('coll3'), 0.53, 1070), 0.53, 'cover'), WIDE: S(260, fy(HY('coll3'), 0.47, 880), 0.47, 'wide'),
  TWO: S(0, fy(HY('coll3'), 0.75, 640), 0.75, 'two'),
  HER: S(X.her + 40, fy(HY('her'), 1.0), 1.0, 'her'),
  HUGO: S(X.hugo + 30, fy(HY('coll3'), 1.0), 1.0, 'hugo'), HUGO_CU: S(X.hugo + 10, fy(HY('coll3'), 1.25, 900), 1.25, 'hugo'),
  MORAL: S(150, fy(HY('coll3'), 0.55, 470), 0.55, 'two'), BOW: S(620, fy(HY('coll3'), 0.66, 720), 0.66, 'hugo'), HUGO_F: S(X.hugo + 60, fy(HY('coll3'), 0.58, 660), 0.58, 'hugo'),
  PARROT: S(PX - 120, fy(PY - 255 * PS, 1.45, 1060), 1.45, 'parrot'), MUG: U('mug', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('r')[2] - 0.1) return SH.COVER; if (t < hev('par') - 0.1) return f(SH.TWO); if (t < hev('mug')) return f(SH.PARROT); if (t < hev('wide') - 0.05) return f(SH.MUG); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_c.t - 0.1) return f(SH.HER); if (t < e('bow') - 0.02) return f(SH.HUGO); return f(SH.BOW); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_c.t - 0.1) return f(SH.HER); if (t < endOf('o2_c') + 0.02) return f(SH.HUGO); if (t < e('par') - 0.1) return f(SH.TWO); if (t < e('mug')) return f(SH.PARROT); return f(SH.MUG); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_c.t - 0.1) return f(SH.HER); if (t < e('sink') - 0.02) return f(SH.HUGO); if (t < e('par') - 0.1) return f(SH.TWO); if (t < SP.o3_nar.t - 0.1) return f(SH.PARROT); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('ch2') - 0.02) return f(SH.TWO); if (t < e('gasp') - 0.02) return f(SH.HER); if (t < SP.o4_c.t - 0.1) return f(SH.HUGO_CU); if (t < e('par') - 0.1) return f(SH.HUGO); return f(SH.PARROT); }
  if (L === 'end') { if (t < e('par') - 0.1) return f(SH.HUGO_F); if (t < e('moral') - 0.05) return f(SH.WIDE); return f(SH.MORAL); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stomp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- insert: her mug on a solid backdrop, the «R»s bobbing in the coffee
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
function mugView(c, t, L) { backdrop(c, t, '#F7D9E6', '#E7A6C2'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'mug' });
  const t0 = L === 'hook' ? hev('mug') : ev('o2', 'mug'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6), st = mugState(t);
  c.save(); c.translate(540, 1000); c.scale(k * 5.2, k * 5.2);
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0, 66, 80, 14, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; c.lineCap = 'round'; for (const dx of [-28, 6, 34]) { const w = Math.sin(t * 3 + dx) * 6; c.beginPath(); c.moveTo(dx, -110); c.quadraticCurveTo(dx + 12 + w, -128, dx + w, -146); c.stroke(); }
  mug(c, { ...st, n: st.n }, 1, t * 1.4); c.restore();
  // the newest «R» splashes in (o2)
  if (L === 'o2') { const v = t - t0; if (v < 0.6) { c.save(); c.fillStyle = '#7A4A26'; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i - 4.5) * 0.3, s = 600 * v, xx = 540 + Math.cos(a) * s, yy = 680 + Math.sin(a) * s + 1500 * v * v; c.beginPath(); c.arc(xx, yy, 26 * (1 - v / 0.6), 0, TAU); c.fill(); } c.restore(); } } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question (ask)
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI, aT = SC.outro.ev.ask;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine with her mug + Hugo (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.coll3; K.put(c, HUGO, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: {}, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6 + 1) * 15, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: hold(g, 1, MDY, MK), items: { R: ctx => mug(ctx, { n: 0, sink: 0 }, 1, t) } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // header: «А ТЫ БЫ ОТВЕТИЛА КАК?» -> on the ask line it flips to the comment question
  const sw_ = P(t, aT - 0.15, aT + 0.1), q = eBack(P(u, 0.2, 0.55), 2.2) * (sw_ < 0.5 ? 1 - sw_ * 2 : 0), qa = eBack(P(t, aT - 0.05, aT + 0.3), 2.2);
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); textFit(c, 'Unb9', 64, 'А ТЫ БЫ', 860); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); textFit(c, 'Unb9', 64, 'ОТВЕТИЛА КАК?', 860); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  if (qa > 0) { c.save(); c.translate(540, 300); c.scale(qa, qa); c.rotate(-0.02); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -440 + 8, -170 + 12, 880, 340, 40); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -440, -170, 880, 340, 40); c.fill(); c.stroke();
    textFit(c, 'Unb9', 74, 'ТЕБЯ ДРАЗНИЛИ', 800); c.fillStyle = C.oliveD; c.fillText('ТЕБЯ ДРАЗНИЛИ', 0, -92); textFit(c, 'Unb9', 84, 'ЗА АКЦЕНТ?', 800); strokeText(c, 'ЗА АКЦЕНТ?', 0, 0, C.pink, C.oliveD, 10);
    textFit(c, 'Unb9', 56, 'ДА ИЛИ НЕТ?', 800); c.fillStyle = C.oliveD; c.fillText('ДА ИЛИ НЕТ?', 0, 100); c.restore();
    if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 130, w: 880, h: 340, k: qa, id: 'ask' }); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 2.8) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.3) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = svT + 0.6, bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < aT - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); }   // the ask line is shown big in the header instead
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { mugView(c, t, L); heads = { her: OFFL, coll3: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { coll3: ['HUGO', '#8A6A4A'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) { K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_c: -0.2, o1_h: -0.22, o1_c: -0.2, o2_h: -0.22, o2_c: -0.22, o3_h: -0.22, o3_c: -0.2, o4_h: -0.15, o4_c: -0.2, end_c: -0.2 } }); parrotBubble(c, t, proj); }
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('accent', NF, renderFrame);
