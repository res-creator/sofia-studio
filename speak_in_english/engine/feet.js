// "Сосед в самолёте снял ботинки" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node feet.js start end out.mp4 | --png=f1,f2
// Plane cabin, row 14 seen from the front: the heroine (pink jumper) in the window seat on the left, Bill (loud orange polo, moustache) in the
// middle seat. His shoes are off and his grey socked feet rest on top of the seat in front, soles to the camera; green smell waves (paths) drift to her.
// hook: she pinches her nose; inserts: the socks close up (hole, big toe), the seat-back flight map TIME TO DESTINATION 6h 00m.
// o1 «В ЛОБ»: "Clean socks. Mostly." — insert: a fly circles the sock and drops dead; she facepalms (hand in front of the forehead).
// o2 «ВЕЖЛИВО»: "My feet need to breathe." — insert: the sock inflates and deflates like a lung; she fans herself with the safety card.
// o3 «КАК НОСИТЕЛЬ»: embarrassed, he drops his feet (shoes back on), the air clears (sparkle), she breathes in happily; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: his toes curl in shame, he sweats; insert: the socks buckled into their own seat with headphones; "Okay, okay. Shoes on."
// Twist (music off): she sits back, victorious; POV insert: the granny in the seat in front kicks off HER shoes, bare feet poke between the seats,
// "Ahh, that's better!"; the heroine looks into the camera; moral over the row (she pinches her nose again, Bill grins). End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/feet/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift };
const BILL = { ...BASE.greg, top: { type: 'polo', col: '#E9893A', col2: '#FFF3E0' }, bottom: { type: 'trousers', col: '#4A5468' } };
const GRAN = { ...BASE.doris };
const G = { her: geom(HER), socks: geom(BILL), gran2: geom(GRAN) };
const SEAT = 330;                                   // seated: upper body dropped by SEAT (legs hidden by the seat in front)
const HX = -330, BX = 330, TOPY = -430;             // her seat, his seat, top edge of the seat in front (his heels rest on it)
const FOOT = [BX - 130, BX + 130];                   // his two feet (x)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// foot seen from the sole (heel at 0,0, toes up, ~280 tall); side -1 = left foot (big toe on the right/inner side)
// o: { sock: true (grey sock with a hole at the big toe) | false (bare), wig: toe wiggle 0..1, curl: 0..1 (toes curled in shame), skin }
function foot(c, side, o = {}) { const sk = o.skin || '#EBB896', sock = o.sock !== false, col = sock ? '#9AA0A8' : sk, line = sock ? '#5E636E' : '#B07A5A', curl = o.curl || 0;
  c.save(); c.scale(-side, 1);   // draw a right foot (big toe on the left); mirror for the left foot
  const outline = () => { c.beginPath(); c.moveTo(-40, -20); c.quadraticCurveTo(0, 22, 48, -14); c.quadraticCurveTo(70, -90, 66, -150); c.quadraticCurveTo(84, -215, 66, -262 + curl * 30); c.quadraticCurveTo(10, -300 + curl * 40, -58, -268 + curl * 30); c.quadraticCurveTo(-82, -200, -60, -140); c.quadraticCurveTo(-64, -70, -40, -20); c.closePath(); };
  c.fillStyle = 'rgba(0,0,0,.18)'; c.save(); c.translate(8, 10); outline(); c.fill(); c.restore();
  outline(); c.fillStyle = col; c.fill(); c.strokeStyle = line; c.lineWidth = 6; c.stroke();
  if (sock) { c.save(); outline(); c.clip(); c.fillStyle = '#6E7480'; c.beginPath(); c.ellipse(0, -18, 62, 54, 0, 0, TAU); c.fill(); c.fillStyle = '#7E8490'; c.beginPath(); c.ellipse(4, -262 + curl * 30, 90, 46, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 5; for (let y = -60; y > -220; y -= 34) { c.beginPath(); c.moveTo(-70, y); c.quadraticCurveTo(0, y - 8, 80, y); c.stroke(); } c.restore();
    // the hole at the big toe: the toe pokes out and wiggles
    const w = Math.sin((o.wig || 0) * TAU) * 6;
    c.fillStyle = '#3A3E48'; c.beginPath(); c.ellipse(-30, -246 + curl * 26, 30, 24, 0, 0, TAU); c.fill();
    c.fillStyle = sk; c.strokeStyle = '#B07A5A'; c.lineWidth = 4; c.beginPath(); c.ellipse(-30 + w * 0.5, -250 + curl * 26 - Math.abs(w), 24 * (1 - curl * 0.3), 26 * (1 - curl * 0.4), 0, 0, TAU); c.fill(); c.stroke(); }
  else { // bare sole: five toe pads + soft arch shading
    c.fillStyle = 'rgba(176,90,90,.18)'; c.beginPath(); c.ellipse(0, -30, 40, 30, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(6, -200, 60, 34, 0, 0, TAU); c.fill();
    const w = Math.sin((o.wig || 0) * TAU);
    [[-38, -280, 26], [-2, -292, 19], [26, -286, 17], [48, -272, 15], [64, -252, 13]].forEach(([x, y, r], i) => { const dy = (i % 2 ? w : -w) * 8;
      c.fillStyle = sk; c.strokeStyle = line; c.lineWidth = 4; c.beginPath(); c.arc(x, y + dy + curl * 30, r, 0, TAU); c.fill(); c.stroke(); }); }
  c.restore(); }
// shoe (side view) for the falling shoes / the shoes in his hand on the end screen
function shoe(c, s = 1, col = '#5A3A26') { c.save(); c.scale(s, s); paint(c, q => { q.m(-80, 0); q.l(90, 0); q.q(100, -30, 70, -44); q.l(10, -60); q.q(-10, -90, -50, -90); q.q(-80, -88, -82, -40); q.z(); }, col, { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#2B2F3A'; c.fillRect(-84, -8, 178, 12); c.strokeStyle = '#F4EFE6'; c.lineWidth = 4; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-6 + i * 16, -66 + i * 6); c.lineTo(10 + i * 16, -56 + i * 6); c.stroke(); } c.restore(); }
const shoesItem = () => ctx => { ctx.save(); ctx.translate(0, 60); ctx.rotate(-0.3); shoe(ctx, 1.1); ctx.translate(30, 50); shoe(ctx, 1.1, '#4A2E1E'); ctx.restore(); };
// safety card (o2 fan)
function card(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -84, -124, 176, 250, 10); c.fill(); c.fillStyle = '#FFF6D8'; c.strokeStyle = '#C9A040'; c.lineWidth = 5; rr(c, -90, -130, 176, 250, 10); c.fill(); c.stroke();
  c.fillStyle = '#E3A33A'; c.fillRect(-90, -130, 176, 46); c.fillStyle = '#3C6FB4'; c.beginPath(); c.moveTo(-50, 20); c.lineTo(46, -10); c.lineTo(50, 4); c.lineTo(-48, 34); c.fill(); c.beginPath(); c.moveTo(0, -4); c.lineTo(-24, -40); c.lineTo(-10, -42); c.lineTo(18, -8); c.fill();
  c.fillStyle = '#9AA3B2'; for (let i = 0; i < 3; i++) c.fillRect(-70, 60 + i * 18, 130 - i * 20, 8); c.restore(); }
const cardItem = rot => ctx => { ctx.save(); ctx.translate(0, -70); ctx.rotate(rot); card(ctx, 0.95); ctx.restore(); };
// green smell waves rising from (x, y), drifting by dx over their length; k = strength
function stink(c, x, y, k, t, dx = -200, len = 520, n = 3, w = 11, spread = 90) { if (k <= 0) return; c.save(); c.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ph = (t * 0.9 + i / n) % 1, a = k * Math.sin(Math.PI * ph) * 0.9, x0 = x + (i - (n - 1) / 2) * spread;
    c.globalAlpha = a; c.strokeStyle = '#7DBA3E'; c.lineWidth = w; c.beginPath();
    for (let j = 0; j <= 24; j++) { const u = j / 24, yy = y - u * len - ph * 60, xx = x0 + dx * u * u + Math.sin(u * 9 + t * 6 + i * 2) * 26 * (0.4 + u); j ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
    c.strokeStyle = 'rgba(210,240,150,.6)'; c.lineWidth = w * 0.35; c.stroke(); }
  c.restore(); }
// a fly (paths only); dead = X eyes, legs up
function fly(c, x, y, s, t, dead = 0, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (!dead) { const f = Math.sin(t * 90) * 0.5 + 0.5; c.fillStyle = `rgba(220,235,255,${0.55 + f * 0.25})`; c.strokeStyle = 'rgba(80,90,110,.6)'; c.lineWidth = 3; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 30, -26 - f * 8, 30, 16, sx * (0.5 + f * 0.4), 0, TAU); c.fill(); c.stroke(); } }
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.lineCap = 'round'; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sx * 10, -4 + i * 10); c.lineTo(sx * 30, (dead ? -30 : 14) + i * 10); c.stroke(); }
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.ellipse(0, 4, 20, 28, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, -26, 16, 0, TAU); c.fill();
  if (dead) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 4; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 7 - 4, -30); c.lineTo(sx * 7 + 4, -22); c.moveTo(sx * 7 + 4, -30); c.lineTo(sx * 7 - 4, -22); c.stroke(); } }
  else { c.fillStyle = '#C8383E'; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 9, -28, 7, 0, TAU); c.fill(); } }
  c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function star(c, x, y, r, a) { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); for (let i = 0; i < 10; i++) { const rr_ = i % 2 ? r * 0.42 : r, aa = i / 10 * TAU - Math.PI / 2; c.lineTo(Math.cos(aa) * rr_, Math.sin(aa) * rr_); } c.closePath(); c.fill(); c.restore(); }

// ---------------- cabin (prerendered, softly blurred)
const BX0 = -3400, BY0 = -3800, BW = 6800, BH = 5200, BS = 0.5;
function seatShape(c, x, top, bot, w, col) { paint(c, q => { q.m(x - w, bot); q.l(x - w, top + 120); q.q(x - w, top, x - w + 120, top); q.l(x + w - 120, top); q.q(x + w, top, x + w, top + 120); q.l(x + w, bot); q.z(); }, col, { sd: 10, hd: 5, lw: 5 }); }
function drawCabin(c) {
  const g = c.createLinearGradient(0, BY0, 0, 0); g.addColorStop(0, '#E3DDD0'); g.addColorStop(1, '#F2EDE3'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  // ceiling + overhead bins + reading-light panel
  c.fillStyle = '#D6CFC0'; c.fillRect(BX0, BY0, BW, 900);
  c.fillStyle = '#F7F4EE'; rr(c, BX0 + 40, -2900, BW - 80, 640, 40); c.fill(); c.strokeStyle = '#C9C3B4'; c.lineWidth = 9; c.stroke();
  for (let x = BX0 + 500; x < BX0 + BW; x += 900) { c.beginPath(); c.moveTo(x, -2900); c.lineTo(x, -2260); c.stroke(); c.fillStyle = '#C9C3B4'; rr(c, x - 170, -2420, 340, 46, 14); c.fill(); }
  c.fillStyle = '#E9E4D8'; c.fillRect(BX0, -2260, BW, 170); c.fillStyle = '#C9C3B4'; c.fillRect(BX0, -2100, BW, 12);
  for (const x of [HX, BX, 1650]) { c.fillStyle = '#D9D2C2'; rr(c, x - 130, -2240, 260, 120, 20); c.fill(); c.fillStyle = '#FFF6C8'; c.beginPath(); c.arc(x - 50, -2180, 26, 0, TAU); c.fill(); c.fillStyle = '#9AA0A8'; c.beginPath(); c.arc(x + 50, -2180, 24, 0, TAU); c.fill(); }
  // seat-belt sign
  c.fillStyle = '#2B3A5C'; rr(c, -110, -2245, 220, 110, 18); c.fill(); c.strokeStyle = '#FFD040'; c.lineWidth = 9; c.beginPath(); c.arc(-30, -2200, 18, 0, TAU); c.moveTo(-30, -2182); c.lineTo(-30, -2150); c.stroke(); c.beginPath(); c.moveTo(10, -2190); c.lineTo(60, -2190); c.moveTo(10, -2165); c.lineTo(60, -2165); c.stroke();
  // left wall with two oval windows (sky, clouds)
  c.fillStyle = '#E8E2D5'; c.beginPath(); c.moveTo(BX0, -2090); c.lineTo(-640, -2090); c.lineTo(-700, 0); c.lineTo(BX0, 0); c.fill();
  for (const [wx, wy] of [[-1000, -1480], [-2050, -1480], [-3100, -1480]]) { c.fillStyle = '#D2CABA'; c.beginPath(); c.ellipse(wx, wy, 230, 330, 0, 0, TAU); c.fill(); c.fillStyle = '#E8E2D5'; c.beginPath(); c.ellipse(wx, wy, 200, 300, 0, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.ellipse(wx, wy, 160, 255, 0, 0, TAU); c.clip(); const sg = c.createLinearGradient(0, wy - 260, 0, wy + 260); sg.addColorStop(0, '#5FA8E0'); sg.addColorStop(1, '#BFE3F7'); c.fillStyle = sg; c.fillRect(wx - 200, wy - 300, 400, 600);
      c.fillStyle = '#FFFFFF'; for (const [dx, dy, r] of [[-60, 120, 70], [20, 100, 90], [100, 130, 60], [-120, -80, 40], [-80, -90, 50]]) { c.beginPath(); c.arc(wx + dx, wy + dy, r, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(wx - 140, wy - 200); c.lineTo(wx - 60, wy - 250); c.lineTo(wx - 150, wy + 60); c.fill(); c.restore();
    c.fillStyle = '#C9C3B4'; rr(c, wx - 150, wy - 300, 300, 70, 30); c.fill(); }
  // the far cabin (rows behind, aisle on the right going into the distance)
  c.fillStyle = '#DCD5C6'; c.fillRect(-640, -2090, 4100, 1350);
  for (const [x, s] of [[-420, 0.45], [60, 0.45], [540, 0.45], [1500, 0.45], [1980, 0.45], [2460, 0.45]]) seatShape(c, x, -1500, -760, 210, '#4A6FA8');
  c.fillStyle = '#C9C1AE'; c.beginPath(); c.moveTo(860, -740); c.lineTo(1200, -740); c.lineTo(1500, 0); c.lineTo(700, 0); c.fill();   // aisle carpet in perspective
  c.fillStyle = '#3C5A8C'; c.beginPath(); c.moveTo(900, -740); c.lineTo(1160, -740); c.lineTo(1420, 0); c.lineTo(780, 0); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(1018, -740); c.lineTo(1042, -740); c.lineTo(1120, 0); c.lineTo(1080, 0); c.fill();
  c.fillStyle = '#DCD5C6'; c.fillRect(-640, -760, 1500, 760); c.fillRect(1460, -760, 2000, 760);
  // seats across the aisle (C/D, empty)
  for (const x of [1900, 2700]) { seatShape(c, x, -1290, 0, 260, '#2F5FA8'); c.fillStyle = '#F4F1EC'; rr(c, x - 190, -1270, 380, 150, 26); c.fill(); }
  // ROW 14 label
  c.fillStyle = '#2B3A5C'; rr(c, -1500, -2060, 380, 110, 16); c.fill(); fitTxt(c, 'ROW 14', -1310, -2005, 62, '#FFFDF8', 340);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawCabin);
// our row's seat backs (live, sharp), armrest between them; the seat in front (foreground band, his heels rest on its top edge)
function seatBacks(c) { for (const x of [HX, BX]) { seatShape(c, x, -1300, -300, 255, '#2F5FA8'); c.fillStyle = '#F4F1EC'; rr(c, x - 185, -1280, 370, 170, 28); c.fill(); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x - 185, -1130, 370, 14); } }
function armrest(c) { c.fillStyle = '#244C8A'; rr(c, -60, -640, 120, 260, 22); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -70, -660, 140, 50, 20); c.fill(); }
function frontSeats(c) { for (const x of [-560, 0, 560, 1120]) { paint(c, q => { q.m(x - 290, 1400); q.l(x - 290, TOPY + 70); q.q(x - 290, TOPY, x - 220, TOPY); q.l(x + 220, TOPY); q.q(x + 290, TOPY, x + 290, TOPY + 70); q.l(x + 290, 1400); q.z(); }, '#244C8A', { sd: 10, hd: 5, lw: 5 });
    c.fillStyle = '#1C3A6C'; rr(c, x - 200, TOPY + 120, 400, 300, 24); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, x - 40, TOPY + 60, 80, 34, 10); c.fill(); }
  c.fillStyle = '#F2C14E'; rr(c, -720, TOPY + 140, 120, 200, 8); c.fill(); }   // a magazine in the seat pocket

// ---------------- characters (seated: upper body dropped by SEAT; arm targets in the un-dropped geometry)
const gest = (st, g, who, t, side, base, k = 1.5) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * k + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const lap = (g, s, k = 0.45) => reach(g, s, s * g.sw * k, g.ySh + 330);
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const nose = (g, s = 1) => reach(g, s, s * g.hw * 0.12, g.headY + g.hh * 0.22, { planar: true });
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legs: false, drop: SEAT, floorShadow: false, armL: lap(g, -1), armR: lap(g, 1), items: {} });
// his feet: 1 = up on the seat in front (socks), 0 = down (shoes on)
function feetUp(t, L) { if (L === 'hook' || L === 'o1' || L === 'o2') return 1;
  if (L === 'o3') return 1 - eIn(clamp((t - ev('o3', 'down')) / 0.3));
  if (L === 'o4') return 1 - eIn(clamp((t - ev('o4', 'shoes')) / 0.3));
  return 0; }
const curlK = (t, L) => L === 'o4' ? clamp((t - (SP.o4_h.t + 1.2)) / 0.4) * (1 - clamp((t - ev('o4', 'shoes')) / 0.2)) : 0;
const smellK = (t, L) => { const u = feetUp(t, L); if (L === 'o4') return u * (1 - 0.6 * curlK(t, L)); if (L === 'o3' && t > ev('o3', 'down')) return u * u; return u; };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...seated(g, t, 'her'), mood: 'neutral', turn: 0.2, look: 0.6 };
  const pinch = () => { st.armR = nose(g, 1); st.headFirst = true; st.lean = -0.25; st.turn = 0.15; };
  if (L === 'hook') { st.mood = 'annoyed'; pinch(); st.look = 0.7; if (t > hev('nar')) { st.mood = 'angry'; st.blink = 0; } if (t > hev('wide')) { st.mood = 'annoyed'; } }
  if (L === 'o1') { st.mood = 'annoyed'; pinch();
    if (speaking('o1_h', t, 0.05, 0.15)) { st.mood = 'angry'; st.headFirst = false; st.lean = 0; st.armL = open(g, -1, 1.9, 40 + Math.sin(t * 9) * 25); st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 50 + Math.sin(t * 9) * 20, { planar: true }); st.look = 0.8; }
    if (t > SP.o1_s.t) { st.mood = 'skeptical'; st.lean = 0; st.headFirst = false; st.armR = lap(g, 1); }
    if (t > e('palm')) { st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armL = forehead(g, -1); st.headY = 6; st.look = 0; st.turn = 0.05; } }
  if (L === 'o2') { st.mood = 'annoyed'; pinch();
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'happy'; st.headFirst = false; st.lean = 0; gest(st, g, 'her', t, 1, 160, 1.4); st.armL = lap(g, -1); }
    if (t > SP.o2_s.t) { st.mood = 'neutral'; st.headFirst = false; st.lean = 0; st.armR = lap(g, 1); }
    if (t > e('fan')) { const u = t - e('fan'); st.mood = 'tired'; st.blink = 0.6; st.armR = reach(g, 1, g.sw * 1.15 + Math.sin(u * 14) * 40, g.headY + g.hh * 1.1, { planar: true }); st.items = { R: cardItem(Math.sin(u * 14) * 0.35) }; st.tilt = -0.05; } }
  if (L === 'o3') { st.mood = 'annoyed'; pinch();
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'worried'; st.headFirst = false; st.lean = 0; gest(st, g, 'her', t, 1, 170, 1.3); st.armL = lap(g, -1); }
    if (t > SP.o3_s.t) { st.mood = 'happy'; st.headFirst = false; st.lean = 0; st.armR = lap(g, 1); }
    if (t > e('relief')) { st.mood = 'happy'; st.blink = 1; st.look = 0; st.turn = 0; st.armL = open(g, -1, 1.5, 100); st.armR = open(g, 1, 1.5, 100); st.headY = -6; }
    if (t > SP.o3_nar.t + 0.4) { st.blink = 0; st.mood = 'happy'; st.armL = lap(g, -1); st.armR = lap(g, 1); st.look = 0.4; } }
  if (L === 'o4') { st.mood = 'smug'; pinch();
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t; st.mood = 'smug'; st.headFirst = false; st.lean = 0; st.look = 0.8;
      st.armR = reach(g, 1, g.sw * (1.5 + 0.25 * Math.sin(u * 3)), g.ySh + 120 + Math.cos(u * 3) * 40, { planar: true }); st.armL = lap(g, -1); if (u > 1.2 && u < 3.5) st.mood = 'happy'; }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; st.headFirst = false; st.lean = 0; st.armR = lap(g, 1); } }
  if (L === 'end') { const lk = e('look');
    st.mood = 'happy'; st.blink = 1; st.lean = -0.1; st.armL = lap(g, -1, 0.3); st.armR = lap(g, 1, 0.3); st.look = 0.3;
    if (t > e('kick')) { st.blink = 0; st.mood = 'surprised'; }
    if (t > lk) { st.mood = 'bored'; st.blink = 0.35; st.look = 0; st.turn = 0; st.lean = 0; st.lookY = 0; }
    if (t > SP.moral.t + 0.3) { st.mood = 'bored'; pinch(); st.turn = 0; st.look = 0; } }
  return st; }
function billState(t, L) { const g = G.socks, e = k => ev(L, k), st = { ...seated(g, t, 'socks'), mood: 'happy', turn: -0.2, look: -0.5 };
  st.armL = lap(g, -1, 0.35); st.armR = lap(g, 1, 0.35);
  if (L === 'hook') { st.mood = 'happy'; st.blink = t > endOf('hook_s') ? 1 : 0; if (speaking('hook_s', t, 0, 0)) { st.laugh = t < SP.hook_s.t + 0.9; st.armR = open(g, 1, 1.5, 60 + Math.sin(t * 5) * 20); st.look = -0.2; st.turn = -0.1; } }
  if (L === 'o1') { st.mood = 'happy'; st.blink = 1;
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_s', t, 0.05, 0.1)) { st.mood = 'smug'; st.blink = 0; st.armL = open(g, -1, 1.6, 80 + Math.sin(t * 4) * 20); }
    if (t > endOf('o1_s')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o2') { st.mood = 'happy'; st.blink = 1;
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'neutral'; st.blink = 0; }
    if (speaking('o2_s', t, 0.05, 0.2)) { st.mood = 'happy'; st.blink = 0; st.laugh = t > SP.o2_s.t + 1.0; st.armR = open(g, 1, 1.5, 70 + Math.sin(t * 5) * 20); st.look = -0.3; } }
  if (L === 'o3') { st.mood = 'happy'; st.blink = 1;
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.o3_s.t - 0.05) { st.mood = 'worried'; st.blink = 0; st.armL = open(g, -1, 1.3, 120); st.armR = open(g, 1, 1.3, 120); st.tilt = 0.06; st.lookY = 0.1; }
    if (t > e('clean')) { st.mood = 'happy'; st.tilt = 0; st.lookY = 0; st.armL = lap(g, -1, 0.35); st.armR = lap(g, 1, 0.35); st.look = -0.6; } }
  if (L === 'o4') { st.mood = 'happy'; st.blink = 1;
    if (speaking('o4_h', t, 0, 0)) { st.blink = 0; st.mood = t > SP.o4_h.t + 1.2 ? 'worried' : 'surprised'; }
    if (t > endOf('o4_h')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.o4_s.t) { st.mood = 'annoyed'; st.armL = open(g, -1, 1.2, 160); st.armR = open(g, 1, 1.2, 160); st.look = -0.3; st.tilt = Math.sin(t * 6) * 0.03; }
    if (t > e('shoes')) { st.mood = 'sad'; st.armL = lap(g, -1, 0.35); st.armR = lap(g, 1, 0.35); st.tilt = 0; } }
  if (L === 'end') { st.mood = 'neutral'; st.blink = 1; st.look = -0.4;
    if (t > e('kick')) { st.blink = 0; st.mood = 'surprised'; }
    if (t > e('grin') - 1.2) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armL = open(g, -1, 1.3, 140); } }
  return st; }
const granState = t => ({ t, talk: talk('gran2', t), mood: 'happy', blink: 1, laugh: t > endOf('end_g') - 0.1, turn: 0.1, look: 0.2, tilt: 0.12, legs: false, floorShadow: false, armL: lap(G.gran2, -1), armR: lap(G.gran2, 1), items: {} });

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'socks'], cover: ['her', 'socks'], two: ['her', 'socks'], her: ['her'], bill: ['socks'] };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); seatBacks(c);
  if (who.includes('socks')) heads.socks = K.put(c, BILL, billState(t, L), BX, 0);
  armrest(c);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  // his feet (drawn even in her single: they are off frame there) — rise from behind the seat in front
  const up = feetUp(t, L), wig = L === 'o2' && speaking('o2_s', t, 0, 0.6) ? t * 2.2 : t * 0.4;
  if (up > 0 && who.includes('socks')) for (let i = 0; i < 2; i++) { const s = i ? 1 : -1, fy0 = TOPY + 25 + (1 - up) * 420;
    paint(c, q => { q.m(BX + s * 10, -600); q.l(BX + s * 175, -600); q.l(FOOT[i] + s * 80, fy0 - 60); q.l(FOOT[i] - s * 70, fy0 - 40); q.z(); }, BILL.bottom.col, { sd: 8, hd: 4, lw: 4 });
    c.save(); c.translate(FOOT[i], fy0); c.rotate(s * 0.12); c.scale(1.3, 1.3); foot(c, s, { wig: wig + i * 0.5, curl: curlK(t, L), skin: BILL.skin }); c.restore(); }
  // hook: his shoes tumble down behind the seat in front
  if (L === 'hook' && t < 0.6) for (let i = 0; i < 2; i++) { const u = clamp((t + 0.25 - i * 0.2) / 0.55); c.save(); c.translate(FOOT[i] + (i ? 90 : -90) * u, TOPY - 260 + u * u * 520); c.rotate((i ? 1 : -1) * (0.6 + u * 3)); shoe(c, 1.05, i ? '#4A2E1E' : '#5A3A26'); c.restore(); }
  frontSeats(c);
  K.mark(c, 'feet', BX, TOPY - 140, 260);
  // smell waves drift to her face
  const sk = smellK(t, L); if (sk > 0) for (let i = 0; i < 2; i++) stink(c, FOOT[i], TOPY - 300, sk, t + i * 0.37, -420 - i * 120, 560, 2, 12, 70);
  // twist / moral: the granny's bare feet below, smell comes up between the seats in front
  if (L === 'end' && t > ev('end', 'poke')) stink(c, 0, TOPY + 10, 0.65 * clamp((t - ev('end', 'poke')) / 0.5), t, -300, 600, 3, 12, 80);
  // o3: the air clears
  if (L === 'o3' && t > ev('o3', 'clean') && t < ev('o3', 'clean') + 1.1) { const u = (t - ev('o3', 'clean')) / 1.1; c.save(); c.fillStyle = C.gold; for (let i = 0; i < 12; i++) { const a = hash(i + 3) * TAU, r = 80 + 500 * eOut(u) * (0.5 + hash(i * 7) * 0.6); c.globalAlpha = 1 - u; star(c, Math.cos(a) * r, -900 + Math.sin(a) * r * 0.8, 30 * (1 - u) + 10, u * 4); } c.restore(); }
  if (L === 'o4' && heads.socks) sweat(c, heads.socks, t, clamp((t - (SP.o4_h.t + 1.2)) / 0.3) * (1 - clamp((t - ev('o4', 'shoes')) / 0.3)));
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, bHY = G.socks.headY + SEAT, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(20, fy(bHY, 0.64, 1010), 0.64, 'cover'), WIDE: S(20, fy(bHY, 0.62, 900), 0.62, 'wide'), TWO: S(0, fy(bHY, 0.72, 800), 0.72, 'two'),
  HER: S(HX - 70, fy(hHY, 1.0, 900), 1.0, 'her'), HER_CU: S(HX - 40, fy(hHY, 1.3, 880), 1.3, 'her'),
  BILL: S(BX + 90, fy(bHY, 0.92, 760), 0.92, 'bill'), BILL_CU: S(BX + 40, fy(bHY, 1.2, 800), 1.2, 'bill'),
  SOCKS: U('socks', 1), MAP: U('map', 2), FLY: U('fly', 3), BREATHE: U('breathe', 4), SEAT: U('seat', 5), GRAN: U('gran', 6) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('socks') - 0.05) return f(SH.HER_CU); if (t < hev('map') - 0.05) return f(SH.SOCKS); if (t < hev('wide') - 0.05) return f(SH.MAP); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_s.t - 0.1) return f(SH.HER); if (t < e('fly') - 0.02) return f(SH.BILL); if (t < e('palm') - 0.02) return f(SH.FLY); return f(SH.HER_CU); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_s.t - 0.1) return f(SH.HER); if (t < e('breathe') - 0.02) return f(SH.BILL); if (t < e('fan') - 0.02) return f(SH.BREATHE); return f(SH.HER_CU); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_s.t - 0.1) return f(t < SP.o3_h.t + 2.75 ? SH.HER : SH.HER_CU); if (t < e('down') - 0.02) return f(SH.BILL); return f(SH.WIDE); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < chunk2('o4_h') - 0.02) return f(SH.HER); if (t < e('seat') - 0.02) return f(SH.TWO); if (t < SP.o4_s.t - 0.1) return f(SH.SEAT); if (t < e('shoes') - 0.02) return f(SH.BILL_CU); return f(SH.WIDE); }
  if (L === 'end') { if (t < e('kick') - 0.02) return f(SH.TWO); if (t < e('look') - 0.02) return f(SH.GRAN); if (t < SP.moral.t + 0.25) return f(SH.HER_CU); return f(SH.TWO); }
  return SH.WIDE; }
function chunk2(id) { const ch = TL.cfg.chunks[id], sp = SP[id], n = ch[0][0].trim().split(/\s+/).length; return sp.t + (sp.words[n] ? sp.words[n][1] : sp.d / 2) + 0.06; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
const QAins = (c, id) => { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); };
const popIn = (t, t0) => eBack(clamp((t - t0 + 0.05) / 0.3), 1.6);
// the pair of socks, close up (hook / o1 fly / o2 breathing)
function socksView(c, t, t0, o = {}) { backdrop(c, t, '#BFE3C8', '#6FB98A'); const k = popIn(t, t0);
  c.save(); c.translate(540, 1300); c.scale(k * 1.9, k * 1.9);
  for (let i = 0; i < 2; i++) { const s = i ? 1 : -1, br = o.breathe ? 1 + 0.13 * Math.sin((t - t0) * 6.2 - 1.2) : 1; c.save(); c.translate(s * 120, 0); c.rotate(s * 0.1); c.scale(br, br); foot(c, s, { wig: t * (o.wig || 0.6) + i * 0.5, skin: BILL.skin }); c.restore(); }
  c.restore();
  for (let i = 0; i < 2; i++) stink(c, 540 + (i ? 230 : -230), 760, 1, t + i * 0.4, i ? 80 : -80, 620, 3, 16, 90);
  if (o.breathe) { const ph = Math.sin((t - t0) * 6.2 - 1.2); if (ph < -0.2) { c.save(); c.globalAlpha = clamp(-ph); c.strokeStyle = '#FFFFFF'; c.lineWidth = 12; c.lineCap = 'round'; for (const sx of [-1, 1]) for (let j = 0; j < 3; j++) { const x = 540 + sx * 300, y = 760 - j * 40; c.beginPath(); c.moveTo(x + sx * 40, y); c.lineTo(x + sx * (110 + (-ph) * 60), y - 20 + j * 20); c.stroke(); } c.restore(); } } }
function flyView(c, t) { const t0 = ev('o1', 'fly'), dr = ev('o1', 'drop'); socksView(c, t, t0, { wig: 0.4 }); QAins(c, 'fly');
  if (t < dr) { const a = (t - t0) * 7; fly(c, 540 + Math.cos(a) * 260, 700 + Math.sin(a * 1.3) * 120, 2.4, t, 0, Math.sin(a) * 0.4); }
  else { const u = clamp((t - dr) / 0.3), a = (dr - t0) * 7, x0 = 540 + Math.cos(a) * 260, y0 = 700 + Math.sin(a * 1.3) * 120;
    fly(c, lerp(x0, 600, u), lerp(y0, 1700, eIn(u)), 2.4, t, 1, u * Math.PI * 3 + (u >= 1 ? 0 : 0) + (u >= 1 ? Math.PI : 0)); } }
function breatheView(c, t) { socksView(c, t, ev('o2', 'breathe'), { breathe: true, wig: 2.2 }); QAins(c, 'breathe'); }
// seat-back screen: flight map, TIME TO DESTINATION 6h 00m
function mapView(c, t) { backdrop(c, t, '#2F3A4A', '#1C232E'); QAins(c, 'map'); const k = popIn(t, hev('map'));
  c.save(); c.translate(540, 900); c.scale(k, k);
  c.fillStyle = '#11151C'; rr(c, -470, -560, 940, 1120, 50); c.fill(); c.strokeStyle = '#4A5568'; c.lineWidth = 10; c.stroke();
  c.save(); rr(c, -430, -520, 860, 1040, 24); c.clip(); c.fillStyle = '#2A6FB0'; c.fillRect(-430, -520, 860, 1040);
  c.fillStyle = '#7FB86A'; for (const [x, y, rx, ry] of [[-330, -260, 190, 260], [-260, 160, 120, 200], [300, -200, 240, 190], [360, 220, 140, 230]]) { c.beginPath(); c.ellipse(x, y, rx, ry, 0.3, 0, TAU); c.fill(); }
  const A = { x: -300, y: -160 }, B = { x: 330, y: -80 }, M = { x: 0, y: -460 }, u = 0.08;
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 9; c.setLineDash([22, 18]); c.beginPath(); c.moveTo(A.x, A.y); c.quadraticCurveTo(M.x, M.y, B.x, B.y); c.stroke(); c.setLineDash([]);
  for (const p of [A, B]) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(p.x, p.y, 20, 0, TAU); c.fill(); }
  const px = (1 - u) ** 2 * A.x + 2 * u * (1 - u) * M.x + u * u * B.x, py = (1 - u) ** 2 * A.y + 2 * u * (1 - u) * M.y + u * u * B.y;
  c.save(); c.translate(px, py); c.rotate(-0.7); c.fillStyle = '#FFD040'; c.beginPath(); c.moveTo(0, -46); c.lineTo(10, -10); c.lineTo(46, 6); c.lineTo(10, 6); c.lineTo(6, 34); c.lineTo(18, 44); c.lineTo(-18, 44); c.lineTo(-6, 34); c.lineTo(-10, 6); c.lineTo(-46, 6); c.lineTo(-10, -10); c.closePath(); c.fill(); c.restore();
  c.fillStyle = 'rgba(10,14,20,.82)'; rr(c, -400, 150, 800, 330, 26); c.fill();
  fitTxt(c, 'TIME TO DESTINATION', 0, 215, 46, '#C9D2DA', 720, 'Nun9');
  const bl = Math.sin(t * 8) > -0.3 ? 1 : 0.55; c.globalAlpha = bl; fitTxt(c, '6h 00m', 0, 360, 170, '#FFD040', 720); c.globalAlpha = 1;
  c.restore(); c.restore(); }
// o4: the socks in their own seat — seat belt, headphones, seat 14D
function seatView(c, t) { backdrop(c, t, '#F7E3B0', '#E3B860'); QAins(c, 'seat'); const t0 = ev('o4', 'seat'), u = t - t0, k = popIn(t, t0);
  c.save(); c.translate(540, 1150); c.scale(k, k);
  seatShape(c, 0, -820, 380, 330, '#2F5FA8'); c.fillStyle = '#F4F1EC'; rr(c, -240, -800, 480, 200, 30); c.fill(); fitTxt(c, '14D', 0, -700, 90, '#E0474C', 300);
  paint(c, q => { q.m(-360, 160); q.l(360, 160); q.l(360, 420); q.l(-360, 420); q.z(); }, '#244C8A', { sd: 8, hd: 4, lw: 5 });
  // the two socks sitting upright like passengers
  for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; c.save(); c.translate(s * 120, 220 + Math.sin(t * 3 + i) * 6); c.scale(1.45, 1.45); c.rotate(s * 0.06); foot(c, s, { wig: t * 0.8 + i * 0.5, skin: BILL.skin }); c.restore(); }
  // headphones pop on
  const hk = eBack(clamp((u - 0.95) / 0.25), 2.2); if (hk > 0) { c.save(); c.translate(0, -290); c.scale(hk, hk); c.strokeStyle = '#2B2F3A'; c.lineWidth = 26; c.beginPath(); c.arc(0, 40, 250, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); for (const sx of [-1, 1]) { c.fillStyle = '#E0474C'; rr(c, sx * 235 - 45, 0, 90, 150, 30); c.fill(); } c.restore(); }
  // seat belt slides across and clicks
  const bk = eOut(clamp((u - 0.3) / 0.4)); if (bk > 0) { c.save(); c.strokeStyle = '#6A7480'; c.lineWidth = 44; c.lineCap = 'butt'; c.beginPath(); c.moveTo(-340, 60); c.lineTo(lerp(-340, 340, bk), 60); c.stroke();
    if (bk >= 1) { c.fillStyle = '#C9D2DA'; c.strokeStyle = '#5E636E'; c.lineWidth = 6; rr(c, -60, 26, 120, 68, 12); c.fill(); c.stroke(); } c.restore(); }
  c.restore();
  stink(c, 540, 820, 0.6, t, 0, 420, 3, 12, 120); }
// twist POV: the seats in front; the granny peeks back over her seat, her bare feet poke through the gap between the seats
const GRX = 300, GRY = 2410, GRS = 1.35;
function granView(c, t) { const t0 = ev('end', 'kick'), u = t - t0, k = popIn(t, t0); QAins(c, 'gran');
  const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#E3DDD0'); g.addColorStop(1, '#CFC7B6'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.fillStyle = '#F7F4EE'; rr(c, -40, 60, W + 80, 260, 30); c.fill(); c.strokeStyle = '#C9C3B4'; c.lineWidth = 8; c.stroke();
  const hd = K.put(c, GRAN, granState(t), GRX, GRY + (1 - k) * 200, GRS);
  // seat backs (we look at them from behind): screens, tray-table latches
  for (const x of [170, 910]) { seatShape(c, x, 930, 2100, 250, '#2F5FA8'); c.fillStyle = '#11151C'; rr(c, x - 150, 1080, 300, 210, 18); c.fill(); c.fillStyle = '#2A6FB0'; rr(c, x - 132, 1098, 264, 174, 10); c.fill(); c.fillStyle = '#7FB86A'; c.beginPath(); c.ellipse(x - 40, 1190, 60, 50, 0.3, 0, TAU); c.fill();
    c.fillStyle = '#1C3A6C'; rr(c, x - 230, 1360, 460, 400, 26); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, x - 40, 1330, 80, 30, 10); c.fill(); }
  // her shoes drop to the floor, then the bare feet poke through the gap
  for (let i = 0; i < 2; i++) { const v = clamp((u - i * 0.18) / 0.4); if (v <= 0) continue; c.save(); c.translate(540 + (i ? 60 : -60), lerp(1500, 1840, eIn(v))); c.rotate((i ? 1 : -1) * v * 2.4); shoe(c, 0.9, '#8A5A6A'); c.restore(); }
  const pk = eBack(clamp((t - ev('end', 'poke')) / 0.3), 1.8);
  if (pk > 0) for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; c.save(); c.translate(540 + s * 70, 1700 - pk * 170); c.scale(0.95, 0.95 * pk); c.rotate(s * 0.08); foot(c, s, { sock: false, wig: t * 1.6 + i * 0.5, skin: '#EBC3A6' }); c.restore(); }
  if (pk > 0) stink(c, 540, 1350, clamp((t - ev('end', 'poke')) / 0.4), t, 0, 560, 3, 14, 110);
  return { gran2: hd }; }

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

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Bill holding his shoes (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.socks; K.put(c, BILL, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { R: shoesItem() }, armL: reach(gm, -1, -gm.sw * 0.9, gm.ySh + 330), armR: reach(gm, 1, gm.sw * 1.0, gm.ySh + 250, { planar: true }) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  const tw = [wAt('outro', 'один', sp.t + 1.25), wAt('outro', 'два', sp.t + 1.58), wAt('outro', 'три', sp.t + 1.92), wAt('outro', 'четыре', sp.t + 2.32)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.04) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - wAt('outro', 'сохрани', sp.t + 3.66)) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

const HOLD = { hook_s: -0.2, o1_h: -0.2, o1_s: -0.2, o2_h: -0.2, o2_s: -0.2, o3_h: -0.2, o3_s: -0.2, o4_h: -0.2, o4_s: -0.2, end_g: -0.2 };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads = {}, proj = p => p;
  if (tag.startsWith('ui:')) { const v = tag.slice(3);
    if (v === 'socks') { socksView(c, t, hev('socks')); QAins(c, 'socks'); } else if (v === 'map') mapView(c, t); else if (v === 'fly') flyView(c, t); else if (v === 'breathe') breatheView(c, t); else if (v === 'seat') seatView(c, t); else if (v === 'gran') heads = granView(c, t);
    Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names: { socks: ['BILL', '#C9862A'] }, hold: HOLD });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('feet', NF, renderFrame);
