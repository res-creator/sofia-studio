// "Друг вернул машину без бензина" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best), hard_cut camera: node petrol.js start end out.mp4 | --png=f1,f2
// Her front drive on a sunny London street: the heroine (pink jumper) on the left by her front door, Charlie (mustard hoodie) in the middle, her small
// mint car on the right, still coughing black puffs. Running prop: the fuel gauge (insert: needle on E, blinking amber pump light, drawn with paths).
// o1 «В ЛОБ»: "At the petrol station, obviously." — he waves down the road; the road sign says PETROL 12 MILES; she facepalms (hand on the forehead).
// o2 «ВЕЖЛИВО»: "Next time? Great — Saturday!" — he snatches the keys back and books Saturday in his phone calendar; her horror.
// o3 «КАК НОСИТЕЛЬ»: sheepish, he runs off with a petrol can; the needle sweeps E -> F, the light goes off; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: beside the car she points out the empty tank, the parking ticket on the windscreen and the sunglasses on the dashboard; he sweats.
// Twist: he takes the sunglasses off the dashboard: "...Those are your sunglasses." She realises (blush), puts them on; he grins. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/petrol/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift };
const CHAR = { ...BASE.jay, top: { type: 'hoodie', col: '#E3A33A' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#FFFFFF', acc: '#E0474C' } };
const G = { her: geom(HER), carmate: geom(CHAR) };
const X = { her: -170, ch: 360 }, CX0 = 540, CX1 = 1860;            // car: front bumper (left) .. rear bumper (right)
const SGX = 1105, SGY = -722;                                         // the sunglasses on the dashboard (world)
const TKX = 935, TKY = -690;                                          // the parking ticket under the wiper
const PUMPX = 1300, PUMPY = -735;                                     // the amber fuel light on the dashboard
const CHX_END = 760;                                                  // twist: Charlie stands at the driver's window
const SIGNX = 2950;                                                   // road sign far down the pavement (o1 gag)
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
function keys(c, s = 1, t = 0, sw = 0) { c.save(); c.scale(s, s); c.rotate(Math.sin(t * 9) * 0.25 * sw);
  c.strokeStyle = '#C9D2DA'; c.lineWidth = 7; c.beginPath(); c.arc(0, 18, 18, 0, TAU); c.stroke();
  c.fillStyle = '#B8C2CC'; c.strokeStyle = '#6A7480'; c.lineWidth = 3;
  for (const [a, l] of [[0.35, 70], [-0.3, 58]]) { c.save(); c.translate(0, 34); c.rotate(a); rr(c, -9, 0, 18, l, 4); c.fill(); c.stroke(); c.beginPath(); c.arc(0, l, 6, 0, TAU); c.fill(); c.restore(); }
  c.fillStyle = '#EE5E9A'; c.strokeStyle = '#8A2A50'; c.lineWidth = 3; c.save(); c.translate(-14, 40); c.rotate(-0.25); rr(c, -22, 0, 44, 62, 18); c.fill(); c.stroke(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, 22, 7, 0, TAU); c.fill(); c.restore();
  c.restore(); }
const keysItem = (t, sw = 1) => ctx => { ctx.save(); ctx.translate(0, 10); keys(ctx, 1.6, t, sw); ctx.restore(); };
// sunglasses: pink cat-eye frames (hers); (0,0) = bridge
function shades(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot);
  for (const sx of [-1, 1]) { c.fillStyle = '#2B2232'; c.strokeStyle = '#EE5E9A'; c.lineWidth = 8; c.beginPath(); c.moveTo(sx * 12, -16); c.quadraticCurveTo(sx * 40, -30, sx * 82, -26); c.quadraticCurveTo(sx * 84, 18, sx * 52, 24); c.quadraticCurveTo(sx * 18, 26, sx * 12, -4); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 5; c.beginPath(); c.moveTo(sx * 30 - 8, -10); c.lineTo(sx * 30 + 8, -18); c.stroke(); }
  c.strokeStyle = '#EE5E9A'; c.lineWidth = 8; c.beginPath(); c.moveTo(-12, -12); c.quadraticCurveTo(0, -20, 12, -12); c.stroke(); c.restore(); }
const shadesItem = () => ctx => { ctx.save(); ctx.translate(0, -40); shades(ctx, 1.05, -0.05); ctx.restore(); };
// the parking ticket: yellow plastic pouch with black bands
function ticket(c, s = 1, rot = 0, t = 0, wob = 0) { c.save(); c.scale(s, s); c.rotate(rot + Math.sin(t * 22) * 0.12 * wob);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -52, -36, 110, 80, 6); c.fill(); c.fillStyle = '#F2D94E'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; rr(c, -56, -40, 110, 80, 6); c.fill(); c.stroke();
  c.fillStyle = '#2B2F3A'; c.fillRect(-56, -40, 110, 16); for (let i = 0; i < 3; i++) c.fillRect(-42, -6 + i * 14, 50 + (i % 2) * 20, 6); c.restore(); }
// petrol can (red jerry can)
function can(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-60, 0); q.l(60, 0); q.l(60, -150); q.l(20, -170); q.l(-60, -170); q.z(); }, '#D8383E', { sd: 5, hd: 2, lw: 4 });
  c.strokeStyle = '#A82A30'; c.lineWidth = 6; c.beginPath(); c.moveTo(-40, -30); c.lineTo(40, -140); c.moveTo(40, -30); c.lineTo(-40, -140); c.stroke();
  c.fillStyle = '#2B2F3A'; rr(c, 28, -196, 22, 34, 5); c.fill(); c.strokeStyle = '#D8383E'; c.lineWidth = 14; c.beginPath(); c.moveTo(-44, -170); c.lineTo(-44, -205); c.lineTo(0, -205); c.lineTo(0, -170); c.stroke(); c.restore(); }
const canItem = () => ctx => { ctx.save(); ctx.translate(0, 200); can(ctx, 1); ctx.restore(); };
// amber fuel pump icon (paths only)
function pumpIcon(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = col;
  rr(c, -34, -46, 46, 92, 8); c.fill(); c.fillStyle = 'rgba(0,0,0,.45)'; rr(c, -26, -36, 30, 24, 4); c.fill(); c.fillStyle = col; c.fillRect(-42, 40, 62, 10);
  c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(12, -20); c.lineTo(30, -20); c.lineTo(36, 26); c.quadraticCurveTo(38, 36, 46, 30); c.lineTo(44, -26); c.lineTo(34, -40); c.stroke(); c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function ring(c, x, y, r, k, t) { if (k <= 0) return; c.save(); c.globalAlpha = k; c.strokeStyle = '#FFE15A'; c.lineWidth = 12; c.setLineDash([26, 16]); c.lineDashOffset = -t * 120; c.beginPath(); c.arc(x, y, r * (1 + 0.06 * Math.sin(t * 10)), 0, TAU); c.stroke(); c.setLineDash([]); c.restore(); }

// ---------------- street (prerendered, softly blurred)
const BX0 = -3800, BY0 = -5400, BW = 7800, BH = 8200, BS = 0.5;
function drawStreet(c) {
  const g = c.createLinearGradient(0, BY0, 0, -900); g.addColorStop(0, '#7EC3F0'); g.addColorStop(1, '#D9EFFA'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, y, s] of [[-2600, -3900, 1.2], [-200, -4300, 1], [2200, -3700, 1.3], [3300, -4600, 0.9]]) { for (const [dx, dy, r] of [[0, 0, 160], [150, -40, 190], [320, 10, 150], [160, 50, 170]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); } }
  // terraced houses across the road
  const cols = ['#B5654A', '#C98A5A', '#A85A48', '#D9B48A', '#B87058'];
  for (let i = 0, x = BX0; x < BX0 + BW; i++, x += 860) { const top = -3000 - (i % 2) * 120; c.fillStyle = cols[i % cols.length]; c.fillRect(x, top, 860, 3000 - 700 + 0);
    c.fillStyle = '#5A4A50'; c.beginPath(); c.moveTo(x - 20, top); c.lineTo(x + 430, top - 380); c.lineTo(x + 880, top); c.fill();
    c.fillStyle = '#7A5A50'; c.fillRect(x + 600, top - 320, 90, 220);
    c.fillStyle = 'rgba(0,0,0,.08)'; for (let y = top + 40; y < -700; y += 60) c.fillRect(x, y, 860, 4);
    for (const [wx, wy] of [[90, top + 220], [520, top + 220], [90, top + 1050], [520, top + 1050]]) { c.fillStyle = '#F7F4EE'; c.fillRect(x + wx - 16, wy - 16, 282, 452); c.fillStyle = '#8CB8D8'; c.fillRect(x + wx, wy, 250, 420); c.fillStyle = '#F7F4EE'; c.fillRect(x + wx + 117, wy, 16, 420); c.fillRect(x + wx, wy + 200, 250, 14); }
    c.fillStyle = ['#2F5E9E', '#2E7A4A', '#C8383E', '#2B2F3A', '#E3A33A'][i % 5]; rr(c, x + 360, -1440, 150, 740, 12); c.fill(); c.fillStyle = '#F7F4EE'; c.fillRect(x + 340, -1480, 190, 40); }
  // street trees
  for (const tx of [-2900, -1100, 900, 2700]) { c.fillStyle = '#6A4A32'; c.fillRect(tx - 30, -1500, 60, 900); c.fillStyle = '#4E9A4A'; for (const [dx, dy, r] of [[0, -1700, 330], [-240, -1500, 260], [240, -1520, 270], [0, -1350, 240]]) { c.beginPath(); c.arc(tx + dx, dy, r, 0, TAU); c.fill(); } c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(tx - 90, -1800, 140, 0, TAU); c.fill(); }
  // far pavement, road, near pavement + kerb
  c.fillStyle = '#C9C4BA'; c.fillRect(BX0, -700, BW, 140);
  c.fillStyle = '#5E636E'; c.fillRect(BX0, -560, BW, 300); c.fillStyle = '#F7F4EE'; for (let x = BX0; x < BX0 + BW; x += 520) c.fillRect(x, -420, 260, 22);
  c.fillStyle = '#9AA0A8'; c.fillRect(BX0, -262, BW, 28); c.fillStyle = '#D6D0C4'; c.fillRect(BX0, -234, BW, 120);
  // driveway paving (the ground the characters stand on)
  c.fillStyle = '#C7B9A4'; c.fillRect(BX0, -114, BW, BY0 + BH + 114); c.fillStyle = 'rgba(0,0,0,.07)';
  for (let y = -114, r = 0; y < BY0 + BH; y += 110, r++) { c.fillRect(BX0, y, BW, 5); for (let x = BX0 + (r % 2) * 110; x < BX0 + BW; x += 220) c.fillRect(x, y, 5, 110); }
  // her house: brick front wall on the left with the blue front door (No. 12), a window and a hanging basket
  c.fillStyle = '#B86A50'; c.fillRect(BX0, -3300, -720 - BX0, 3186); c.fillStyle = 'rgba(0,0,0,.08)'; for (let y = -3260; y < -114; y += 56) c.fillRect(BX0, y, -720 - BX0, 4);
  c.fillStyle = '#9A5440'; c.fillRect(-760, -3300, 40, 3186);
  c.fillStyle = '#F7F4EE'; c.fillRect(-1520, -1990, 560, 1876); c.fillStyle = '#2F5E9E'; rr(c, -1470, -1940, 460, 1826, 10); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 8; for (const [x, y, w, h] of [[-1420, -1860, 160, 560], [-1220, -1860, 160, 560], [-1420, -1200, 160, 700], [-1220, -1200, 160, 700]]) c.strokeRect(x, y, w, h);
  c.fillStyle = '#E3C060'; c.beginPath(); c.arc(-1080, -1030, 22, 0, TAU); c.fill(); c.fillRect(-1290, -1460, 120, 26); fitTxt(c, '12', -1240, -1560, 90, '#E3C060', 160);
  c.fillStyle = '#F7F4EE'; c.fillRect(-2900, -2100, 1100, 900); c.fillStyle = '#8CB8D8'; c.fillRect(-2860, -2060, 1020, 820); c.fillStyle = '#F7F4EE'; c.fillRect(-2360, -2060, 22, 820);
  c.fillStyle = '#4E9A4A'; c.beginPath(); c.ellipse(-2350, -1150, 600, 90, 0, 0, TAU); c.fill(); for (let i = 0; i < 9; i++) { c.fillStyle = ['#EE5E9A', '#F2C14E', '#FFFFFF'][i % 3]; c.beginPath(); c.arc(-2850 + i * 125, -1170 + (i % 2) * 30, 34, 0, TAU); c.fill(); }
  // low hedge between the drive and the pavement (far right of the car)
  c.fillStyle = '#3E7E3E'; rr(c, 2100, -560, 1700, 460, 120); c.fill(); c.fillStyle = 'rgba(255,255,255,.1)'; for (let x = 2150; x < 3700; x += 160) { c.beginPath(); c.arc(x, -500, 60, 0, TAU); c.fill(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawStreet);

// ---------------- the car (live): small mint hatchback facing left; bounce = sputter in the hook
const level = (t, L) => L === 'o3' ? eIO(clamp((t - ev('o3', 'fill')) / (ev('o3', 'full') - ev('o3', 'fill')))) : 0.02;   // fuel level 0..1
const pumpOn = (t, L) => level(t, L) < 0.15 && Math.sin(t * 9) > -0.6;
function puffs(c, t, L) { if (L !== 'hook') return; for (let i = 0; i < 7; i++) { const u = ((t * 0.9 + i / 7) % 1), k = clamp(t / 0.1) * (1 - clamp((t - 5) / 1));
  const x = CX1 - 40 + u * 120 - u * u * 420 + Math.sin(i * 2 + t * 3) * 30, y = -120 - u * 1150, r = 50 + u * 160; c.fillStyle = `rgba(50,52,60,${0.6 * (1 - u * u) * k})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }
function car(c, t, L) {
  const bounce = L === 'hook' ? Math.abs(Math.sin(t * 13)) * 14 * Math.exp(-((t % 1.1) * 3)) : 0;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse((CX0 + CX1) / 2, 0, (CX1 - CX0) / 2 + 40, 34, 0, 0, TAU); c.fill();
  c.save(); c.translate(0, -bounce);
  const body = '#5CC2B4';
  // dark arches behind the wheels
  c.fillStyle = '#2B2F3A'; for (const wx of [CX0 + 270, CX1 - 250]) { c.beginPath(); c.arc(wx, -150, 175, Math.PI, TAU); c.fill(); }
  paint(c, q => { q.m(CX0 + 20, -100); q.q(CX0 - 10, -110, CX0, -300); q.q(CX0 + 10, -500, CX0 + 120, -540); q.l(CX0 + 400, -600); q.q(CX0 + 520, -900, CX0 + 650, -1000); q.q(CX0 + 700, -1030, CX0 + 780, -1030);
    q.l(CX1 - 260, -1030); q.q(CX1 - 150, -1030, CX1 - 90, -900); q.l(CX1 - 10, -640); q.q(CX1 + 10, -500, CX1, -300); q.q(CX1, -110, CX1 - 30, -100);
    q.l(CX1 - 70, -100); q.q(CX1 - 80, -330, CX1 - 250, -330); q.q(CX1 - 420, -330, CX1 - 430, -100); q.l(CX0 + 450, -100); q.q(CX0 + 440, -330, CX0 + 270, -330); q.q(CX0 + 100, -330, CX0 + 90, -100); q.z(); }, body, { sd: 10, hd: 5, lw: 5 });
  c.fillStyle = 'rgba(255,255,255,.22)'; rr(c, CX0 + 140, -560, CX1 - CX0 - 260, 26, 13); c.fill();
  c.fillStyle = '#E9EDF1'; rr(c, CX0 - 10, -250, 120, 60, 20); c.fill(); rr(c, CX1 - 110, -250, 120, 60, 20); c.fill();   // bumpers
  // windows (glass) with the dashboard visible through the front one
  const glass = q => { q.m(CX0 + 470, -640); q.q(CX0 + 580, -900, CX0 + 680, -975); q.l(CX0 + 1000, -975); q.l(CX0 + 1000, -640); q.z(); };
  c.save(); c.beginPath(); { const q = { m: (x, y) => c.moveTo(x, y), l: (x, y) => c.lineTo(x, y), q: (a, b, x, y) => c.quadraticCurveTo(a, b, x, y), z: () => c.closePath() }; glass(q); } c.clip();
  const gg = c.createLinearGradient(0, -975, 0, -640); gg.addColorStop(0, '#BFE3F5'); gg.addColorStop(1, '#8EC2DE'); c.fillStyle = gg; c.fillRect(CX0 + 400, -1000, 700, 400);
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(CX0 + 400, -1000, 700, 400);
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(CX0 + 420, -700); c.quadraticCurveTo(CX0 + 600, -712, CX0 + 900, -700); c.lineTo(CX0 + 1000, -690); c.lineTo(CX0 + 1000, -600); c.lineTo(CX0 + 400, -600); c.fill();   // dashboard
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 22; c.beginPath(); c.ellipse(CX0 + 860, -770, 26, 95, 0.15, 0, TAU); c.stroke();   // steering wheel (edge-on)
  c.fillStyle = '#4A5060'; rr(c, CX0 + 900, -900, 90, 200, 20); c.fill();   // seat back
  if (pumpOn(t, L)) { c.save(); c.globalAlpha = 0.9; c.fillStyle = 'rgba(255,176,32,.6)'; c.beginPath(); c.arc(PUMPX, PUMPY, 58, 0, TAU); c.fill(); pumpIcon(c, PUMPX, PUMPY - 6, 0.5, '#FFD040'); c.restore(); }
  if (!(L === 'end' && t > ev('end', 'lift') - 0.05)) { c.save(); c.translate(SGX, SGY); shades(c, 0.85, 0.05); c.restore(); }
  c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(CX0 + 600, -975); c.lineTo(CX0 + 700, -975); c.lineTo(CX0 + 560, -640); c.lineTo(CX0 + 480, -640); c.fill();
  c.restore();
  c.strokeStyle = '#3E8C82'; c.lineWidth = 8; c.beginPath(); glass({ m: (x, y) => c.moveTo(x, y), l: (x, y) => c.lineTo(x, y), q: (a, b, x, y) => c.quadraticCurveTo(a, b, x, y), z: () => c.closePath() }); c.stroke();
  // rear side window + rear screen
  paint(c, q => { q.m(CX0 + 1050, -640); q.l(CX0 + 1050, -975); q.l(CX1 - 270, -975); q.q(CX1 - 180, -960, CX1 - 120, -840); q.l(CX1 - 70, -640); q.z(); }, '#9CCBE4', { sd: 3, hd: 1, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(CX0 + 1150, -975); c.lineTo(CX0 + 1230, -975); c.lineTo(CX0 + 1150, -640); c.lineTo(CX0 + 1080, -640); c.fill();
  // door line, handle, wing mirror, lights, fuel flap
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 5; c.beginPath(); c.moveTo(CX0 + 1025, -1000); c.lineTo(CX0 + 1025, -330); c.moveTo(CX0 + 470, -620); c.lineTo(CX0 + 470, -330); c.stroke();
  c.fillStyle = '#E9EDF1'; rr(c, CX0 + 880, -540, 90, 22, 10); c.fill();
  paint(c, q => { q.m(CX0 + 440, -700); q.l(CX0 + 360, -720); q.q(CX0 + 330, -650, CX0 + 380, -630); q.l(CX0 + 460, -640); q.z(); }, body, { sd: 3, hd: 1, lw: 4 });
  c.fillStyle = '#FFF6C0'; c.strokeStyle = '#B8A060'; c.lineWidth = 4; c.beginPath(); c.ellipse(CX0 + 70, -430, 50, 40, -0.3, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = '#E0474C'; rr(c, CX1 - 50, -500, 40, 110, 10); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 4; c.beginPath(); c.arc(CX1 - 230, -560, 34, 0, TAU); c.stroke();
  c.fillStyle = '#5A606E'; rr(c, CX1 - 120, -130, 90, 26, 10); c.fill();   // exhaust
  // wheels
  for (const wx of [CX0 + 270, CX1 - 250]) { c.fillStyle = '#22252E'; c.beginPath(); c.arc(wx, -150, 150, 0, TAU); c.fill(); c.fillStyle = '#C9D2DA'; c.beginPath(); c.arc(wx, -150, 78, 0, TAU); c.fill(); c.fillStyle = '#8A93A2'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; c.beginPath(); c.arc(wx + Math.cos(a) * 44, -150 + Math.sin(a) * 44, 12, 0, TAU); c.fill(); } }
  // the parking ticket under the wiper (until she points at it in o4 it just sits there; it flaps on "parking ticket")
  const wob = L === 'o4' ? clamp((t - ev('o4', 'ticket')) / 0.2) * (1 - clamp((t - ev('o4', 'ticket') - 1.6) / 0.3)) : 0;
  c.save(); c.translate(TKX, TKY); ticket(c, 0.95, -1.05, t, wob); c.restore();
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; c.beginPath(); c.moveTo(CX0 + 400, -615); c.lineTo(CX0 + 470, -770); c.stroke();
  c.restore();
  K.mark(c, 'car', (CX0 + CX1) / 2, -560, 500); }
function roadSign(c) { const x = SIGNX; c.fillStyle = '#8A93A2'; c.fillRect(x - 18, -1700, 36, 1600); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x - 120, -100, 240, 24);
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; rr(c, x - 330, -2080, 660, 420, 26); c.fill(); c.stroke();
  pumpIcon(c, x - 210, -1930, 1.25, '#2B2F3A'); fitTxt(c, 'PETROL', x + 70, -1960, 92, '#2B2F3A', 380);
  fitTxt(c, '12 miles', x + 40, -1790, 76, '#E0474C', 330);
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.moveTo(x + 230, -1830); c.lineTo(x + 300, -1790); c.lineTo(x + 230, -1750); c.fill(); c.fillRect(x + 196, -1800, 40, 20); }

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const cheek = (g, s) => reach(g, s, s * g.hw * 1.05, g.headY + g.hh * 0.45, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const giveT = () => SP.hook_f.t + 1.25;   // she takes the keys from him in the hook
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'neutral', turn: 0.25, look: 0.7 };
  const keysR = () => { st.armR = hold(g, 1, 300, 0.9); st.items = { R: keysItem(t, 0.4) }; };
  if (L === 'hook') { st.mood = 'skeptical'; st.armR = hold(g, 1, 380, 0.8); st.armL = hold(g, -1, 330, 0.6);
    if (t > giveT()) { keysR(); st.mood = 'surprised'; }
    if (t > hev('nar') + 0.4) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 330, { planar: true }); }
    if (t > hev('wide')) { st.mood = 'angry'; st.look = 0.6; } }
  if (L === 'o1') { keysR(); st.mood = 'annoyed';
    if (speaking('o1_h', t, 0.05, 0.15)) { st.mood = 'angry'; st.armL = open(g, -1, 2.0, 40 + Math.sin(t * 9) * 25); st.armR = reach(g, 1, g.sw * 2.1, g.ySh + 60 + Math.sin(t * 9) * 20, { planar: true }); }
    if (t > SP.o1_f.t) { st.mood = 'surprised'; }
    if (t > e('sign')) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('palm')) { st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.armL = forehead(g, -1); st.headY = 6; st.look = 0; st.turn = 0.1; } }
  if (L === 'o2') { keysR(); st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.15)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 200, { planar: true }); }
    if (t > SP.o2_f.t) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 200, { planar: true }); }
    if (t > e('snatch')) { st.items = {}; st.mood = 'surprised'; st.blink = 0; st.armR = open(g, 1, 1.9, 120); }
    if (t > e('horror')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armL = open(g, -1, 1.5, 60); st.armR = open(g, 1, 1.5, 60); st.turn = 0.05; st.look = 0.2; } }
  if (L === 'o3') { keysR(); st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 140); }
    if (t > SP.o3_f.t) { st.mood = 'happy'; st.look = 0.7; }
    if (t > e('run')) { st.look = 1; st.turn = 0.4; st.mood = 'surprised'; }
    if (t > e('relief')) { st.mood = 'happy'; st.blink = 1; st.look = 0.6; st.turn = 0.25; st.armL = open(g, -1, 1.6, 60); st.armR = down(g, 1); st.items = { R: keysItem(t, 0.4) }; }
    if (t > SP.o3_nar.t) { st.blink = 0; } }
  if (L === 'o4') { st.mood = 'smug'; keysR(); st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 330, { planar: true });
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t; st.mood = 'happy'; st.look = 0.8;
      if (t > e('ticket') - 0.2 && t < e('invoice') - 0.2) { st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 330, { planar: true }); st.armR = reach(g, 1, g.sw * 2.4, g.ySh + 20 + Math.sin(u * 4) * 10, { planar: true }); st.items = {}; st.turn = 0.35; }
      else if (t >= e('invoice') - 0.2) { st.armR = reach(g, 1, g.sw * (1.6 + 0.2 * Math.sin(u * 3)), g.ySh + 80 + Math.cos(u * 3) * 30, { planar: true }); st.mood = 'smug'; }
      else st.armR = reach(g, 1, g.sw * (1.5 + 0.2 * Math.sin(u * 3)), g.ySh + 200, { planar: true }); }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'smug'; keysR(); st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 330, { planar: true });
    if (t > e('lift')) { st.mood = 'surprised'; st.blink = 0; st.look = 0.9; }
    if (t > e('look')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.look = 0.8; }
    if (t > e('blush')) { st.mood = 'worried'; st.blink = 0; st.lookY = 0.35; st.look = 0.2; st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 260, { planar: true }); st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 270, { planar: true }); st.items = {}; st.tilt = 0.06; }
    if (t > e('wear')) { st.mood = 'happy'; st.tilt = 0.05; st.lookY = 0; st.look = 0.4; st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 260, { planar: true }); st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 270, { planar: true }); st.items = {}; } }
  return st; }
const blushK = (t, L) => L === 'end' ? clamp((t - ev('end', 'blush')) / 0.3) : 0;
const herWears = (t, L) => L === 'end' && t > ev('end', 'wear') + 0.35;
function chState(t, L) { const g = G.carmate, e = k => ev(L, k), st = { ...base(g, t, 'carmate'), mood: 'happy', turn: -0.25, look: -0.7 };
  if (L === 'hook') { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 40 + Math.sin(t * 5) * 10, { planar: true }); st.items = { L: keysItem(t, 1) };
    if (speaking('hook_f', t, 0.05, 0.1)) { st.laugh = t > SP.hook_f.t + 0.9; gest(st, g, 'carmate', t, 1, 140); }
    if (t > giveT()) { st.items = {}; st.armL = open(g, -1, 1.4, 260); st.blink = 1; st.tilt = -0.06; }
    if (t > hev('nar') + 1) { st.mood = 'happy'; st.blink = 0; st.armL = down(g, -1); st.tilt = 0; } }
  if (L === 'o1') { st.mood = 'happy'; if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_f', t, 0.05, 0.1)) { st.mood = 'skeptical'; st.turn = -0.3; }
    if (t > e('wave')) { const k = eOut(clamp((t - e('wave')) / 0.3)); st.armR = reach(g, 1, g.sw * lerp(1.2, 2.5, k), g.ySh + lerp(300, -40, k) + Math.sin(t * 7) * 15, { planar: true }); st.turn = lerp(-0.3, 0.3, k); st.look = 0.9; }
    if (t > endOf('o1_f')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_f', t, 0.05, 0.1)) { st.mood = 'happy'; st.laugh = t > SP.o2_f.t + 0.5; gest(st, g, 'carmate', t, 1, 140); }
    if (t > e('snatch') - 0.2) { const k = eOut(clamp((t - e('snatch') + 0.2) / 0.25)); st.armL = reach(g, -1, -g.sw * lerp(1.0, 2.6, k < 1 ? k : 1) + (t > e('snatch') ? g.sw * 1.4 * eOut(clamp((t - e('snatch')) / 0.3)) : 0), g.ySh + 200 + (t > e('snatch') ? -260 * eOut(clamp((t - e('snatch')) / 0.3)) : 0), { planar: true });
      if (t > e('snatch')) st.items = { L: keysItem(t, 1.5) }; st.mood = 'happy'; st.laugh = true; } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o3_f.t - 0.05) { st.mood = 'worried'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 0.25, g.ySh + 270, { planar: true }); st.armR = reach(g, 1, g.sw * 0.25, g.ySh + 280, { planar: true }); st.tilt = 0.08; st.lookY = 0.2; }
    if (t > e('run')) { st.mood = 'happy'; st.tilt = 0; st.lookY = 0; st.headFirst = false; st.armL = down(g, -1); st.armR = hold(g, 1, 380, 0.9); st.items = { R: canItem() }; st.legPose = 'walk'; st.turn = 0.5; st.look = 1; }
    if (t > e('relief')) { st.legPose = 'stand'; st.turn = -0.25; st.look = -0.6; st.mood = 'happy'; st.laugh = true; st.armR = hold(g, 1, 380, 0.9); st.items = { R: canItem() }; st.armL = open(g, -1, 1.6, 40); } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > ev('o4', 'ticket') ? 'worried' : 'happy'; if (t > ev('o4', 'invoice')) st.mood = 'shock'; }
    if (t > e('gasp')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.o4_f.t) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 300, { planar: true }); st.tilt = Math.sin(t * 10) * 0.03; }
    if (t > e('nod')) { st.headY = Math.abs(Math.sin((t - e('nod')) * 9)) * 14; } }
  if (L === 'end') { const r = t - ev('end', 'reach'), lift = ev('end', 'lift');
    st.mood = 'smug'; st.turn = 0.45; st.look = 0.9;
    if (t < lift) { st.armR = reach(g, 1, SGX - CHX_END, SGY + 20, { planar: true }); }
    else { const k = eOut(clamp((t - lift) / 0.3)); st.turn = lerp(0.45, -0.2, k); st.look = lerp(0.9, -0.6, k);
      st.armR = reach(g, 1, lerp(SGX - CHX_END, g.hw * 1.6, k), lerp(SGY + 20, g.headY - g.hh * 0.2, k), { planar: true }); st.items = { R: shadesItem() }; }
    if (speaking('end_f', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 150 + Math.sin(t * 5) * 15, { planar: true }); }
    if (t > ev('end', 'wear')) { st.items = {}; st.armR = hold(g, 1, 330, 0.6); st.armL = hold(g, -1, 330, 0.6); st.mood = 'happy'; st.laugh = true; st.look = -0.6; st.turn = -0.25; } }
  return st; }
const chX = (t, L) => { if (L === 'o3') { const r = ev('o3', 'run'), back = ev('o3', 'relief'); if (t > back) return X.ch; if (t > r) return X.ch + 2600 * eIn(clamp((t - r) / 0.45)); }
  if (L === 'end') return lerp(X.ch, CHX_END, eIO(clamp((t - SC.end.s) / 0.35))); return X.ch; };

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'carmate'], cover: ['her', 'carmate'], two: ['her', 'carmate'], her: ['her'], ch: ['carmate'], car: [], sign: [], three: ['her', 'carmate'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function overlayFace(c, hd, g, t, L, who) { if (!hd || hd.x > 1e4 || hd.x < -1e4) return; const hw = hd.hh * g.hw / g.hh;
  if (who === 'her') { const b = blushK(t, L); if (b > 0) { c.save(); c.globalAlpha = 0.55 * b; c.fillStyle = '#F0607A'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hd.x + s * hw * 0.58, hd.y + hd.hh * 0.36, hw * 0.26, hd.hh * 0.11, 0, 0, TAU); c.fill(); } c.restore();
      c.save(); c.globalAlpha = b; c.strokeStyle = '#E0474C'; c.lineWidth = 6; for (let i = 0; i < 3; i++) { const x = hd.x + hw * (1.25 + i * 0.12), y = hd.y - hd.hh * (0.9 - i * 0.25); c.beginPath(); c.moveTo(x, y); c.lineTo(x + hw * 0.22, y - hd.hh * 0.06); c.stroke(); } c.restore(); }
    if (herWears(t, L)) { c.save(); c.translate(hd.x + hw * 0.08, hd.y + hd.hh * 0.06); shades(c, hw / 92, 0.05); c.restore(); } } }
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'carmate'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); roadSign(c); car(c, t, L); puffs(c, t, L);
  if (who.includes('carmate')) heads.carmate = K.put(c, CHAR, chState(t, L), chX(t, L), 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  overlayFace(c, heads.her, G.her, t, L, 'her');
  if (L === 'o4') { ring(c, TKX, TKY, 110, clamp((t - ev('o4', 'ticket')) / 0.2) * (1 - clamp((t - ev('o4', 'glasses') + 0.1) / 0.2)), t);
    ring(c, SGX, SGY, 105, clamp((t - ev('o4', 'glasses')) / 0.2) * (1 - clamp((t - ev('o4', 'invoice') + 0.2) / 0.2)), t);
    const tk = speaking('o4_h', t) ? clamp((t - (SP.o4_h.t + SP.o4_h.words[6][1])) / 0.2) * (1 - clamp((t - ev('o4', 'ticket') + 0.25) / 0.2)) : 0; ring(c, PUMPX, PUMPY, 80, tk, t); }
  if (L === 'o4' && heads.carmate) sweat(c, heads.carmate, t, clamp((t - ev('o4', 'ticket')) / 0.3));
  if (L === 'end' && heads.carmate && t > ev('end', 'wear') - 0.05 && t < ev('end', 'wear') + 0.4) { const k = eIO(clamp((t - ev('end', 'wear')) / 0.4)), h = heads.her && heads.her.x > -1e4 ? heads.her : null;
    if (h) { const x = lerp(heads.carmate.x + 150, h.x, k), y = lerp(heads.carmate.y - 40, h.y, k) - Math.sin(k * Math.PI) * 260; c.save(); c.translate(x, y); shades(c, 0.9, k * TAU); c.restore(); } }
  if (!heads.her) heads.her = OFFL; if (!heads.carmate) heads.carmate = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(700, fy(HY('carmate'), 0.48, 940), 0.48, 'cover'), WIDE: S(820, fy(HY('carmate'), 0.44, 820), 0.44, 'wide'),
  CAR: S((CX0 + CX1) / 2 + 260, -820, 0.6, 'car'), TWO: S((X.her + X.ch) / 2, fy(HY('carmate'), 0.78, 820), 0.78, 'two'),
  HER: S(X.her + 30, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.2, 880), 1.2, 'her'),
  CH: S(X.ch + 40, fy(HY('carmate'), 1.0), 1.0, 'ch'), CH_CU: S(X.ch + 10, fy(HY('carmate'), 1.25, 900), 1.25, 'ch'),
  THREE: S(600, fy(HY('carmate'), 0.56, 820), 0.56, 'three'), CH_END: S(CHX_END + 120, fy(HY('carmate'), 1.05, 900), 1.05, 'ch'),
  ENDW: S(330, fy(HY('carmate'), 0.6, 820), 0.6, 'three'), SIGN: S(SIGNX - 40, -1500, 0.95, 'sign'), DASH: U('dash', 1), CAL: U('cal', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('dash') - 0.05) return f(SH.CAR); if (t < hev('wide') - 0.05) return f(SH.DASH); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_f.t - 0.03) return f(SH.HER); if (t < e('sign')) return f(SH.CH); if (t < e('palm') - 0.02) return f(SH.SIGN); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_f.t - 0.03) return f(SH.HER); if (t < e('cal')) return f(SH.TWO); if (t < e('horror') - 0.02) return f(SH.CAL); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_f.t - 0.03) return f(SH.HER); if (t < e('run')) return f(SH.CH); if (t < e('fill')) return f(SH.WIDE); if (t < e('relief') - 0.02) return f(SH.DASH); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('gasp') - 0.02) return f(SH.THREE); return f(SH.CH_CU); }
  if (L === 'end') { if (t < e('lift') + 0.35) return f(SH.THREE); if (t < e('look') - 0.02) return f(SH.CH_END); if (t < e('wear') - 0.05) return f(SH.HER_R); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// dashboard: the big fuel gauge (E .. F), needle, blinking amber pump light
function dashView(c, t, L) { backdrop(c, t, '#2F3A4A', '#1C232E'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'dash' });
  const t0 = L === 'hook' ? hev('dash') : ev('o3', 'fill') - 0.1, k = eBack(clamp((t - t0 + 0.05) / 0.3), 1.6), lv = level(t, L);
  c.save(); c.translate(540, 860); c.scale(k, k);
  c.fillStyle = '#11151C'; rr(c, -470, -420, 940, 720, 120); c.fill(); c.strokeStyle = '#4A5568'; c.lineWidth = 10; c.stroke();
  c.fillStyle = '#0A0D12'; c.beginPath(); c.arc(0, 60, 380, 0, TAU); c.fill(); c.strokeStyle = '#8A93A2'; c.lineWidth = 12; c.stroke();
  const aE = Math.PI + 0.35, aF = TAU - 0.35;
  c.strokeStyle = '#E0474C'; c.lineWidth = 26; c.beginPath(); c.arc(0, 60, 310, aE, aE + 0.35); c.stroke();
  for (let i = 0; i <= 8; i++) { const a = lerp(aE, aF, i / 8), r0 = i % 4 === 0 ? 250 : 275; c.strokeStyle = '#F4F1EC'; c.lineWidth = i % 4 === 0 ? 14 : 8; c.beginPath(); c.moveTo(Math.cos(a) * r0, 60 + Math.sin(a) * r0); c.lineTo(Math.cos(a) * 330, 60 + Math.sin(a) * 330); c.stroke(); }
  fitTxt(c, 'E', Math.cos(aE) * 200, 60 + Math.sin(aE) * 200 - 10, 96, '#E0474C', 90); fitTxt(c, 'F', Math.cos(aF) * 200, 60 + Math.sin(aF) * 200 - 10, 96, '#F4F1EC', 90);
  const jit = lv < 0.1 ? Math.sin(t * 31) * 0.02 : 0, a = lerp(aE + 0.04, aF, lv) + jit;
  c.save(); c.translate(0, 60); c.rotate(a); c.fillStyle = '#FF6A3D'; c.beginPath(); c.moveTo(-30, -14); c.lineTo(300, -4); c.lineTo(300, 4); c.lineTo(-30, 14); c.fill(); c.restore();
  c.fillStyle = '#4A5568'; c.beginPath(); c.arc(0, 60, 42, 0, TAU); c.fill();
  const on = lv < 0.15 && Math.sin(t * 9) > -0.6;
  if (on) { c.fillStyle = 'rgba(255,176,32,.25)'; c.beginPath(); c.arc(0, 210, 110, 0, TAU); c.fill(); }
  pumpIcon(c, 0, 210, 1.25, on ? '#FFB020' : (lv > 0.9 ? '#4CAF6A' : '#3A4252'));
  c.restore(); }
// his phone calendar (o2): SATURDAY gets "Charlie: borrow car" (car icon drawn with paths)
function calView(c, t) { backdrop(c, t, '#F7E3B0', '#E3B860'); const t0 = ev('o2', 'cal'), u = t - t0, k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  K.phone(c, 540, 1000, 1.45 * k, (q, w, h) => { q.fillStyle = '#FFFFFF'; q.fillRect(0, 0, w, h); q.fillStyle = '#7A5BC6'; q.fillRect(0, 0, w, 120);
    fitTxt(q, 'SATURDAY', w / 2, 62, 46, '#FFFFFF', w - 60);
    for (let i = 0; i < 6; i++) { const y = 160 + i * 96; fitTxt(q, `${9 + i}:00`, 54, y, 26, '#9AA3B2', 80, 'Nun9'); q.fillStyle = '#E9EDF1'; q.fillRect(96, y, w - 110, 3); }
    const a = eBack(clamp((u - 0.4) / 0.3), 2.0); if (a > 0) { q.save(); q.translate(w / 2 + 40, 256 + 96); q.scale(a, a); q.fillStyle = '#E3A33A'; rr(q, -150, -70, 300, 250, 18); q.fill();
      q.fillStyle = '#FFFFFF'; q.beginPath(); q.moveTo(-130, 10); q.lineTo(-128, -20); q.lineTo(-100, -26); q.lineTo(-80, -52); q.lineTo(-30, -52); q.lineTo(-14, -24); q.lineTo(-10, 10); q.closePath(); q.fill(); q.fillStyle = '#E3A33A'; q.fillRect(-92, -44, 26, 18); q.fillRect(-60, -44, 26, 18);
      for (const x of [-106, -36]) { q.fillStyle = '#2B2F3A'; q.beginPath(); q.arc(x, 12, 16, 0, TAU); q.fill(); q.fillStyle = '#FFFFFF'; q.beginPath(); q.arc(x, 12, 7, 0, TAU); q.fill(); }
      fitTxt(q, 'CAR', 60, -14, 46, '#FFFFFF', 110); fitTxt(q, 'ALL DAY', 0, 120, 34, '#FFFFFF', 260); q.restore(); }
    const ck = eBack(clamp((u - 0.85) / 0.25), 2.2); if (ck > 0) { q.save(); q.translate(w / 2 + 185, 286); q.scale(ck, ck); q.fillStyle = '#4CAF6A'; q.beginPath(); q.arc(0, 0, 40, 0, TAU); q.fill(); q.strokeStyle = '#FFFFFF'; q.lineWidth = 10; q.lineCap = 'round'; q.beginPath(); q.moveTo(-18, 2); q.lineTo(-4, 16); q.lineTo(20, -14); q.stroke(); q.restore(); } });
  const tp = [0.4, 0.6].map(x => clamp((u - x) / 0.25)); for (const p of tp) if (p > 0 && p < 1) { c.save(); c.globalAlpha = 1 - p; c.strokeStyle = '#7A5BC6'; c.lineWidth = 8; c.beginPath(); c.arc(600, 1080, 40 + p * 80, 0, TAU); c.stroke(); c.restore(); } }

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
  // heroine (in her sunglasses) + Charlie jingling the keys (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.carmate; K.put(c, CHAR, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: { L: keysItem(t, 1.5) }, armL: reach(gm, -1, -gm.sw * 1.6, gm.ySh + 120 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 0.9, gm.ySh + 330, { planar: true }) }, 640, 0);
    const hd = K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0);
    c.save(); c.translate(hd.x + hd.hh * g.hw / g.hh * 0.08, hd.y + hd.hh * 0.06); shades(c, hd.hh * g.hw / g.hh / 92, 0.05); c.restore(); }
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
  c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { if (tag === 'ui:cal') calView(c, t); else dashView(c, t, L); heads = { her: OFFL, carmate: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { carmate: ['CHARLIE', '#C9862A'] };
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { hook_f: -0.2, o1_h: -0.22, o1_f: -0.2, o2_h: -0.22, o2_f: -0.25, o3_h: -0.22, o3_f: -0.2, o4_h: -0.15, o4_f: 0.2, end_f: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('petrol', NF, renderFrame);
