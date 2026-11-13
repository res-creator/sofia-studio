// "Британец: «Зачем ковёр на стене?»" — rubric «Наше за границей» (scene + 4 answers, worst -> best), hard_cut camera: node carpet.js start end out.mp4 | --png=f1,f2
// A living room with a HUGE red patterned carpet on the wall. British guest Rupert (tweed jacket, teacup) stares at it; the heroine (pink jumper) explains.
// Absurd detail: a face hides in the carpet's central medallion — its eyes blink and glance around whenever Rupert looks away.
// Hook insert: close-up of the medallion — the eyes blink.
// o1 «В ЛОБ»: "Wall cold. Carpet warm. Done." — "So your wall wears a jumper?" — he strokes the carpet like a dog; the carpet face closes its eyes happily.
// o2 «ВЕЖЛИВО»: "It is decoration. It is normal." — "My floor feels betrayed." — he kneels and pats the bare parquet in consolation.
// o3 «КАК НОСИТЕЛЬ»: "It's a family heirloom..." — "So it's basically art." — a golden frame, museum ropes and a plaque pop up; he applauds; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the tender line — sepia flashback: a child in bed strokes the carpet pattern, falls asleep; Rupert tears up; "May I touch it?" — the carpet face blushes.
// Twist (music silent): «МЕСЯЦ СПУСТЯ» — cut-away of two flats: Rupert drums in front of HIS wall carpets, the waves die in the carpet on the shared wall; the neighbour knits in peace.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/carpet/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const RUP = { ...BASE.oliver, hair: { style: 'quiff', col: '#C8642E' }, brow: '#9A5A30', glasses: { col: '#2B2F3A' },
  top: { type: 'blazer', col: '#8A6B45', shirt: '#F4EFE6', tie: '#2E7A4A' }, bottom: { type: 'trousers', col: '#5A4A3A' }, shoes: { col: '#3A2618', acc: null } };
const KID = { ...BASE.leo, hair: { style: 'curly', col: '#3A2820' }, freckles: false, top: { type: 'kidtee', col: '#9CCBE4', col2: '#F7F2E8' } };
const NANA = { ...BASE.nana, top: { type: 'cardigan', col: '#6A9A5A', col2: '#F7E6EC' } };
const G = { her: geom(HER), guest2: geom(RUP), kneel: geom(RUP, 620), drum: geom(RUP, 360), kid: geom(KID, 260), nana: geom(NANA, 330) };
const X = { her: -1000, rup: 900 };
const CW = 1600, CH = 1800, CXc = 0, CYc = -1650;            // the wall carpet (world rect centre + size)
const FACE = { x: CXc, y: CYc + 10, s: 1 };                    // the hidden face in the central medallion
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- the carpet (prerendered sprite, local coords centred)
function carpetArt(c, w, h) {
  const red = '#B8323A', redD = '#7A1C24', gold = '#E8B04A', navy = '#22346A', cream = '#F4E3C0';
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 18, -h / 2 + 26, w, h, 12); c.fill();
  c.fillStyle = redD; rr(c, -w / 2, -h / 2, w, h, 10); c.fill();
  c.fillStyle = navy; c.fillRect(-w / 2 + 40, -h / 2 + 40, w - 80, h - 80);
  // border band of gold diamonds + cream dots
  c.fillStyle = gold; const bw = 90;
  for (let x = -w / 2 + 70; x < w / 2 - 40; x += 90) for (const y of [-h / 2 + 85, h / 2 - 85]) { c.beginPath(); c.moveTo(x, y - 34); c.lineTo(x + 30, y); c.lineTo(x, y + 34); c.lineTo(x - 30, y); c.fill(); }
  for (let y = -h / 2 + 160; y < h / 2 - 120; y += 90) for (const x of [-w / 2 + 85, w / 2 - 85]) { c.beginPath(); c.moveTo(x, y - 34); c.lineTo(x + 30, y); c.lineTo(x, y + 34); c.lineTo(x - 30, y); c.fill(); }
  c.fillStyle = red; c.fillRect(-w / 2 + 130, -h / 2 + 130, w - 260, h - 260);
  c.strokeStyle = gold; c.lineWidth = 10; c.strokeRect(-w / 2 + 130, -h / 2 + 130, w - 260, h - 260);
  // corner ornaments
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { c.save(); c.translate(sx * (w / 2 - 260), sy * (h / 2 - 260)); c.fillStyle = navy; c.beginPath(); c.moveTo(0, -110); c.lineTo(110, 0); c.lineTo(0, 110); c.lineTo(-110, 0); c.fill(); c.strokeStyle = gold; c.lineWidth = 8; c.stroke();
    c.fillStyle = cream; c.beginPath(); c.arc(0, 0, 34, 0, TAU); c.fill(); c.fillStyle = red; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; c.beginPath(); c.ellipse(Math.cos(a) * 64, Math.sin(a) * 64, 22, 12, a, 0, TAU); c.fill(); } c.restore(); }
  // field: small repeating flowers
  for (let y = -h / 2 + 200; y < h / 2 - 180; y += 120) for (let x = -w / 2 + 210; x < w / 2 - 180; x += 120) { if (Math.abs(x) < 470 && Math.abs(y) < 560) continue; c.fillStyle = (Math.round(x / 120 + y / 120) % 2) ? gold : cream;
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; c.beginPath(); c.ellipse(x + Math.cos(a) * 18, y + Math.sin(a) * 18, 14, 8, a, 0, TAU); c.fill(); } c.fillStyle = navy; c.beginPath(); c.arc(x, y, 8, 0, TAU); c.fill(); }
  // central medallion (the face lives here)
  c.fillStyle = navy; c.beginPath(); c.moveTo(0, -600); c.quadraticCurveTo(380, -420, 470, 0); c.quadraticCurveTo(380, 420, 0, 600); c.quadraticCurveTo(-380, 420, -470, 0); c.quadraticCurveTo(-380, -420, 0, -600); c.fill(); c.strokeStyle = gold; c.lineWidth = 14; c.stroke();
  c.fillStyle = red; c.beginPath(); c.moveTo(0, -470); c.quadraticCurveTo(300, -330, 360, 0); c.quadraticCurveTo(300, 330, 0, 470); c.quadraticCurveTo(-300, 330, -360, 0); c.quadraticCurveTo(-300, -330, 0, -470); c.fill(); c.strokeStyle = cream; c.lineWidth = 6; c.stroke();
  // ornament "brows", "nose" and "cheeks" (they read as pattern until the eyes move)
  c.strokeStyle = gold; c.lineWidth = 16; c.lineCap = 'round'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 40, -190); c.quadraticCurveTo(s * 130, -250, s * 230, -180); c.stroke(); }
  c.fillStyle = gold; c.beginPath(); c.moveTo(0, -60); c.lineTo(34, 60); c.lineTo(0, 90); c.lineTo(-34, 60); c.fill();
  c.fillStyle = navy; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 250, 90, 28, 0, TAU); c.fill(); }
  c.fillStyle = cream; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.beginPath(); c.arc(Math.cos(a) * 410, Math.sin(a) * 530, 16, 0, TAU); c.fill(); }
  // fringe (tassels) top and bottom
  c.strokeStyle = cream; c.lineWidth = 7; for (let x = -w / 2 + 20; x <= w / 2 - 20; x += 26) for (const [y0, d] of [[-h / 2, -1], [h / 2, 1]]) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x + 3, y0 + d * 60); c.stroke(); }
}
const SPR = (() => { const s = 0.6, a = createCanvas(Math.round((CW + 120) * s), Math.round((CH + 220) * s)); const c = a.getContext('2d'); c.scale(s, s); c.translate((CW + 120) / 2, (CH + 220) / 2); carpetArt(c, CW, CH); return a; })();
function drawCarpet(c, x, y, s = 1) { c.drawImage(SPR, x - (CW + 120) / 2 * s, y - (CH + 220) / 2 * s, (CW + 120) * s, (CH + 220) * s); }
// the face: eyes (open almonds with pupils), mouth ornament; f = { blink, lx, ly, happy, blush, wink, smile }
function carpetFace(c, x, y, s, f) { c.save(); c.translate(x, y); c.scale(s, s);
  const ex = 135, ey = -95, rx = 82, ry = 52;
  if (f.blush > 0) { c.fillStyle = `rgba(255,120,150,${0.75 * f.blush})`; for (const sg of [-1, 1]) { c.beginPath(); c.ellipse(sg * 250, 90, 90, 52, 0, 0, TAU); c.fill(); } }
  for (const sg of [-1, 1]) { const shut = sg > 0 && f.wink > 0 ? Math.max(f.blink, f.wink) : f.blink;
    c.save(); c.translate(sg * ex, ey);
    if (f.happy > 0.5) { c.strokeStyle = '#F4E3C0'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.arc(0, 18, rx * 0.8, Math.PI * 1.12, Math.PI * 1.88); c.stroke(); c.restore(); continue; }
    const k = 1 - clamp(shut); if (k < 0.08) { c.strokeStyle = '#F4E3C0'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(-rx, 0); c.quadraticCurveTo(0, 16, rx, 0); c.stroke(); c.restore(); continue; }
    const eye = () => { c.beginPath(); c.moveTo(-rx, 0); c.quadraticCurveTo(0, -ry * 2 * k, rx, 0); c.quadraticCurveTo(0, ry * 2 * k, -rx, 0); c.closePath(); };
    eye(); c.fillStyle = '#FFF8EC'; c.fill(); c.save(); eye(); c.clip(); c.fillStyle = '#2B1A12'; c.beginPath(); c.arc(f.lx * 40, f.ly * 18, 34, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(f.lx * 40 + 12, f.ly * 18 - 12, 9, 0, TAU); c.fill(); c.restore();
    eye(); c.strokeStyle = '#E8B04A'; c.lineWidth = 10; c.stroke(); c.restore(); }
  // mouth ornament: a flat gold wave, curls into a smile
  c.strokeStyle = '#E8B04A'; c.lineWidth = 16; c.lineCap = 'round'; const sm = f.smile || 0; c.beginPath(); c.moveTo(-120, 200); c.quadraticCurveTo(-60, 200 + 40 * sm - 20 * (1 - sm), 0, 200 + 60 * sm); c.quadraticCurveTo(60, 200 + 40 * sm + 20 * (1 - sm), 120, 200); c.stroke();
  c.restore(); }

// ---------------- props
function teacup(c, s = 1) { c.save(); c.scale(s, s);
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#5A7AA8'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 4, 90, 18, 0, 0, TAU); c.fill(); c.stroke();
  paint(c, q => { q.m(-56, -60); q.l(56, -60); q.q(52, 0, 0, 0); q.q(-52, 0, -56, -60); q.z(); }, '#FFFFFF', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = '#5A7AA8'; c.lineWidth = 7; c.beginPath(); c.arc(62, -36, 18, -1.4, 1.4); c.stroke(); c.fillStyle = '#5A7AA8'; c.fillRect(-50, -48, 100, 8);
  c.fillStyle = '#B8743A'; c.beginPath(); c.ellipse(0, -58, 52, 8, 0, 0, TAU); c.fill(); c.restore(); }
const cupItem = rattle => ctx => { ctx.save(); ctx.translate(0, 40); ctx.rotate(rattle); teacup(ctx, 0.9); ctx.restore(); };
const stickItem = (t, ph) => ctx => { ctx.save(); ctx.rotate(-0.9 + Math.sin(t * 22 + ph) * 0.35); ctx.strokeStyle = '#D8A868'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -190); ctx.stroke(); ctx.fillStyle = '#F4E3C0'; ctx.beginPath(); ctx.arc(0, -196, 12, 0, TAU); ctx.fill(); ctx.restore(); };
const needleItem = (t, s) => ctx => { ctx.save(); ctx.rotate(s * (0.5 + Math.sin(t * 9) * 0.2)); ctx.strokeStyle = '#9AA4B2'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -150); ctx.stroke(); ctx.restore(); };
function tears(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const u = ((t * 1.3 + i * 0.5 + (s > 0 ? 0.25 : 0)) % 1), x = hd.x + s * hd.hh * 0.42, y = hd.y + hd.hh * 0.1 + u * hd.hh * 0.9;
  c.fillStyle = '#8FD0F4'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.14); c.quadraticCurveTo(x + hd.hh * 0.08, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.08, y, x, y - hd.hh * 0.14); c.fill(); c.stroke(); } c.restore(); }

// ---------------- the living room (prerendered, softly blurred)
const BX0 = -4400, BY0 = -5400, BW = 8800, BH = 8200, BS = 0.5;
function wallpaper(c, x0, x1, y0, y1, base, dots) { c.fillStyle = base; c.fillRect(x0, y0, x1 - x0, y1 - y0); c.fillStyle = dots;
  for (let x = x0; x < x1; x += 180) { c.fillRect(x, y0, 10, y1 - y0); for (let y = y0 + 60; y < y1; y += 180) { const xx = x + 90; c.beginPath(); c.moveTo(xx, y - 26); c.lineTo(xx + 18, y); c.lineTo(xx, y + 26); c.lineTo(xx - 18, y); c.fill(); } } }
function parquet(c, x0, x1, y0, y1) { c.fillStyle = '#C9955A'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0, r = 0; y < y1; y += 90, r++) for (let x = x0 - (r % 2) * 150; x < x1; x += 300) { c.fillStyle = (Math.round(x / 300 + r) % 3 === 0) ? '#B98448' : (Math.round(x / 300 + r) % 3 === 1 ? '#D4A266' : '#C38E52'); c.fillRect(x + 4, y + 4, 292, 82); }
  c.fillStyle = 'rgba(0,0,0,.05)'; c.fillRect(x0, y0, x1 - x0, 60); }
function drawRoom(c) {
  wallpaper(c, BX0, BX0 + BW, BY0, -200, '#E3DDB8', 'rgba(160,140,90,.18)');
  c.fillStyle = '#F4EFE6'; c.fillRect(BX0, BY0, BW, 200 - BY0 - 3300); // ceiling strip above
  c.fillStyle = '#D9D0B0'; c.fillRect(BX0, -3120, BW, 40);
  // window with curtains + radiator (left)
  c.fillStyle = '#F4EFE6'; c.fillRect(-2140, -2780, 980, 1520); c.fillStyle = '#A9D3EA'; c.fillRect(-2090, -2730, 880, 1420); c.fillStyle = '#F4EFE6'; c.fillRect(-1665, -2730, 30, 1420); c.fillRect(-2090, -2100, 880, 26);
  c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(-2050, -2730); c.lineTo(-1880, -2730); c.lineTo(-2050, -2400); c.fill();
  c.fillStyle = '#9FB8A0'; c.beginPath(); c.arc(-1900, -1500, 160, 0, TAU); c.arc(-1700, -1450, 120, 0, TAU); c.fill();   // tree outside
  for (const [x0, s] of [[-2300, 1], [-1000, -1]]) { c.fillStyle = '#C2504A'; c.beginPath(); c.moveTo(x0, -2860); c.lineTo(x0 + s * 280, -2860); c.quadraticCurveTo(x0 + s * 200, -2000, x0 + s * 300, -1150); c.lineTo(x0, -1150); c.fill(); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 8; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x0 + s * k * 65, -2860); c.quadraticCurveTo(x0 + s * k * 50, -2000, x0 + s * k * 70, -1150); c.stroke(); } }
  c.fillStyle = '#8A6A44'; c.fillRect(-2400, -2900, 1500, 40);
  c.fillStyle = '#F4EFE6'; rr(c, -2050, -1050, 800, 420, 20); c.fill(); c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = -2010; x < -1270; x += 70) c.fillRect(x, -1020, 24, 360);
  // the "stenka" cabinet (right): wood, glass doors with crystal and books
  c.fillStyle = '#7A4E2C'; c.fillRect(1250, -3000, 2400, 2800); c.fillStyle = '#5E3A20'; c.fillRect(1250, -3000, 2400, 60);
  for (const [x, w] of [[1310, 700], [2070, 700], [2830, 760]]) { c.fillStyle = '#9CC8DC'; c.fillRect(x, -2880, w, 1300); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(x + 40, -2880); c.lineTo(x + 180, -2880); c.lineTo(x + 40, -2500); c.fill();
    c.fillStyle = '#6A4426'; for (const y of [-2450, -2000]) c.fillRect(x, y, w, 24);
    for (let k = 0; k < 6; k++) { const gx = x + 70 + k * (w - 120) / 5; c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(gx - 34, -2560); c.lineTo(gx + 34, -2560); c.lineTo(gx + 12, -2470); c.lineTo(gx - 12, -2470); c.fill(); c.fillRect(gx - 5, -2470, 10, 20); }
    for (let k = 0; k < 7; k++) { c.fillStyle = ['#C2504A', '#2E7A4A', '#E8B04A', '#22346A', '#8E5BD0', '#C9955A', '#3E73B8'][k]; c.fillRect(x + 40 + k * (w - 80) / 7, -2330 + (k % 3) * 30, (w - 80) / 7 - 10, 330 - (k % 3) * 30); }
    c.fillStyle = '#8A5A34'; c.fillRect(x, -1520, w, 1260); c.fillStyle = '#6A4426'; c.fillRect(x + w / 2 - 4, -1520, 8, 1260); c.fillStyle = '#E8B04A'; c.fillRect(x + w / 2 - 50, -900, 30, 80); c.fillRect(x + w / 2 + 20, -900, 30, 80); }
  // floor lamp (far left) and a clock on the wall (right of the carpet)
  c.strokeStyle = '#3A2A1A'; c.lineWidth = 22; c.beginPath(); c.moveTo(-2700, -200); c.lineTo(-2700, -2400); c.stroke(); c.fillStyle = '#E8C07A'; c.beginPath(); c.moveTo(-2900, -2350); c.lineTo(-2500, -2350); c.lineTo(-2580, -2700); c.lineTo(-2820, -2700); c.fill();
  c.fillStyle = '#F4EFE6'; c.beginPath(); c.arc(1050, -2780, 120, 0, TAU); c.fill(); c.strokeStyle = '#5E3A20'; c.lineWidth = 16; c.stroke(); c.lineWidth = 10; c.beginPath(); c.moveTo(1050, -2780); c.lineTo(1050, -2860); c.moveTo(1050, -2780); c.lineTo(1110, -2760); c.stroke();
  // skirting + bare parquet floor (no rug! the rug is on the wall)
  c.fillStyle = '#8A6A44'; c.fillRect(BX0, -260, BW, 70); parquet(c, BX0, BX0 + BW, -190, BY0 + BH);
  c.fillStyle = 'rgba(60,30,10,.10)'; c.beginPath(); c.ellipse(0, 260, 1500, 160, 0, 0, TAU); c.fill();
}
// Rupert's flat a month later (left) | shared wall with a carpet hung on it (edge-on) | the neighbour's flat (right)
const WX0 = 560, WX1 = 720;
function drawFlats(c) {
  wallpaper(c, BX0, WX0, BY0, -200, '#CFE0EE', 'rgba(60,100,150,.16)'); wallpaper(c, WX1, BX0 + BW, BY0, -200, '#F1E0C8', 'rgba(170,120,70,.16)');
  c.fillStyle = '#8A93A2'; c.fillRect(WX0, BY0, WX1 - WX0, -BY0 + 200); c.fillStyle = '#6E7786'; c.fillRect(WX0, BY0, 18, -BY0 + 200); c.fillRect(WX1 - 18, BY0, 18, -BY0 + 200);
  c.fillStyle = '#8A6A44'; c.fillRect(BX0, -260, WX0 - BX0, 70); c.fillRect(WX1, -260, BX0 + BW - WX1, 70);
  parquet(c, BX0, WX0, -190, BY0 + BH); c.fillStyle = '#B87A6A'; c.fillRect(WX1, -190, BX0 + BW - WX1, BY0 + BH + 190); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -190; y < 2000; y += 140) c.fillRect(WX1, y, BX0 + BW - WX1, 8);
  c.fillStyle = '#8A93A2'; c.fillRect(WX0, -190, WX1 - WX0, BY0 + BH + 190);
  // neighbour: a framed picture, a standard lamp, a window
  c.fillStyle = '#7A4E2C'; c.fillRect(1500, -2700, 700, 520); c.fillStyle = '#A9D3EA'; c.fillRect(1540, -2660, 620, 440); c.fillStyle = '#7DBA4A'; c.beginPath(); c.moveTo(1540, -2220); c.lineTo(1760, -2480); c.lineTo(1900, -2340); c.lineTo(2020, -2440); c.lineTo(2160, -2220); c.fill();
  c.strokeStyle = '#3A2A1A'; c.lineWidth = 18; c.beginPath(); c.moveTo(2400, -200); c.lineTo(2400, -2000); c.stroke(); c.fillStyle = '#F2D08A'; c.beginPath(); c.moveTo(2240, -1960); c.lineTo(2560, -1960); c.lineTo(2490, -2240); c.lineTo(2310, -2240); c.fill();
  // Rupert: a poster-free blue wall, a shelf with a union of mugs
  c.fillStyle = '#7A4E2C'; c.fillRect(-2600, -2300, 700, 30); for (let k = 0; k < 4; k++) { c.fillStyle = ['#FFFFFF', '#C2504A', '#3E73B8', '#E8B04A'][k]; rr(c, -2560 + k * 170, -2420, 110, 120, 14); c.fill(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.2px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom), BGF = mkBG(drawFlats);

// ---------------- museum frame, ropes and plaque (o3)
const museumK = (t, L, k) => L === 'o3' ? eBack(clamp((t - ev('o3', k)) / 0.3), 2) : 0;
function goldFrame(c, k) { if (k <= 0) return; c.save(); c.translate(CXc, CYc); c.scale(lerp(1.25, 1, Math.min(1, k)), lerp(1.25, 1, Math.min(1, k))); c.globalAlpha = clamp(k);
  const w = CW + 200, h = CH + 260; c.strokeStyle = '#C9902E'; c.lineWidth = 90; c.strokeRect(-w / 2, -h / 2, w, h); c.strokeStyle = '#F2C14E'; c.lineWidth = 30; c.strokeRect(-w / 2, -h / 2, w, h);
  c.fillStyle = '#F2C14E'; for (const sx of [-1, 1]) for (const sy of [-1, 1]) { c.beginPath(); c.arc(sx * w / 2, sy * h / 2, 70, 0, TAU); c.fill(); } c.restore(); }
function plaque(c, k) { if (k <= 0) return; c.save(); c.translate(CXc, -520); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -280 + 8, -70 + 10, 560, 140, 14); c.fill(); c.fillStyle = '#F7F2E8'; c.strokeStyle = '#C9902E'; c.lineWidth = 10; rr(c, -280, -70, 560, 140, 14); c.fill(); c.stroke();
  fitTxt(c, 'FAMILY HEIRLOOM', 0, -18, 52, '#3A2A1A', 500); fitTxt(c, 'since 1974', 0, 36, 38, '#8A6A44', 400, 'Nun9'); c.restore(); }
function ropes(c, k) { if (k <= 0) return; c.save(); c.globalAlpha = clamp(k); const xs = [-640, 0, 640];
  c.strokeStyle = '#B8202E'; c.lineWidth = 34; c.lineCap = 'round'; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(xs[i], 180 - 560 * k); c.quadraticCurveTo((xs[i] + xs[i + 1]) / 2, 180 - 360 * k, xs[i + 1], 180 - 560 * k); c.stroke(); }
  for (const x of xs) { c.fillStyle = '#C9902E'; c.fillRect(x - 18, 180 - 580 * k, 36, 580 * k); c.beginPath(); c.arc(x, 180 - 590 * k, 34, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x, 186, 90, 26, 0, 0, TAU); c.fill(); } c.restore(); }

// ---------------- characters
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const chest = (g, s) => reach(g, s, s * g.sw * 0.1, g.ySh + 170, { planar: true });
const hips = (g, s) => reach(g, s, s * g.sw * 1.15, g.ySh + 420, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gestR = (st, g, id, t, k = 1.6, dy = 120) => { const u = (t - SP[id].t) * 4.5; st.armR = reach(g, 1, g.sw * (k + 0.15 * Math.sin(u)), g.ySh + dy + Math.cos(u) * 22, { planar: true }); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'neutral', turn: 0.3, look: 0.75 };
  if (L === 'hook') { st.mood = 'happy'; st.armL = hold(g, -1, 300, 0.5); st.armR = hold(g, 1, 300, 0.5);
    if (t > hev('peek')) { st.mood = 'surprised'; }
    if (t > hev('wide')) { st.mood = 'skeptical'; st.armL = hips(g, -1); st.armR = hips(g, 1); } }
  if (L === 'o1') { st.mood = 'annoyed'; st.armL = hips(g, -1); st.armR = hips(g, 1);
    if (speaking('o1_h', t, 0.05, 0.1)) { const u = t - SP.o1_h.t, d = SP.o1_h.d, ph = clamp(u / d * 3.3), chop = Math.abs(Math.sin(ph * Math.PI)); st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 60 + chop * 140, { planar: true }); st.headY = chop * 6; st.look = 0.9;
      if (u > d * 0.8) { st.armR = open(g, 1, 1.4, 260); st.armL = open(g, -1, 1.4, 260); st.mood = 'smug'; st.blink = 1; } }
    if (t > SP.o1_g.t) { st.mood = 'skeptical'; st.blink = 0; }
    if (t > e('stroke') + 0.3) { st.mood = 'shock'; st.breathe = 0; st.armL = open(g, -1, 1.6, 80); st.armR = open(g, 1, 1.6, 80); } }
  if (L === 'o2') { st.mood = 'happy'; st.armL = hold(g, -1, 280, 0.2); st.armR = hold(g, 1, 290, 0.2);
    if (speaking('o2_h', t, 0.05, 0.1)) { st.tilt = 0.06; gestR(st, g, 'o2_h', t, 1.4, 170); }
    if (t > SP.o2_g.t + 0.4) { st.mood = 'worried'; st.tilt = 0; }
    if (t > e('look')) { st.mood = 'worried'; st.blink = 0; st.turn = 0.2; st.look = 0.5; st.lookY = 0.4; st.armL = open(g, -1, 1.5, 200); st.armR = open(g, 1, 1.5, 200); } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.armR = reach(g, 1, g.sw * (2.2 + 0.1 * Math.sin(t * 4)), g.ySh + 70 + Math.cos(t * 4) * 20, { planar: true }); st.armL = chest(g, -1); st.look = 0.4; }
    if (t > SP.o3_g.t) { st.mood = 'surprised'; st.armR = down(g, 1); st.armL = down(g, -1); }
    if (t > e('frame')) { st.mood = 'smug'; st.armL = hips(g, -1); st.armR = hips(g, 1); st.blink = t < e('clap') + 0.6 ? 0 : 1; } }
  if (L === 'o4') { st.mood = 'happy';
    if (speaking('o4_h', t, 0.05, 0.2)) { st.mood = 'happy'; st.armL = chest(g, -1); gestR(st, g, 'o4_h', t, 1.9, 60); st.tilt = 0.04 * Math.sin(t * 1.5); st.look = 0.5;
      if (t > SP.o4_h.t + SP.o4_h.d * 0.45) { st.lookY = -0.2; } }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'happy'; st.blink = 1; st.armL = chest(g, -1); st.armR = chest(g, 1); }
    if (t > e('touch')) { st.blink = 0; st.mood = 'surprised'; st.armL = hold(g, -1, 280, 0.25); st.armR = hold(g, 1, 290, 0.25); }
    if (t > e('blush')) { st.mood = 'happy'; st.laugh = true; } }
  return st; }
function rupState(t, L) { const kn = L === 'o2' && t > ev('o2', 'kneel'), g = kn ? G.kneel : G.guest2, e = k => ev(L, k), st = { ...base(g, t, 'guest2'), mood: 'neutral', turn: -0.3, look: -0.75 };
  const atCarpet = () => { st.turn = -0.45; st.look = -1; };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; atCarpet(); st.armR = hold(g, 1, 250, 0.7); st.items = { R: cupItem(Math.sin(t * 30) * 0.06) };
    st.armL = reach(g, -1, -g.sw * 2.1, g.ySh + 20 + Math.sin(t * 3) * 10, { planar: true });
    if (t > hev('peek') && t < hev('peek') + 0.75) { st.lookY = 0.9; st.look = -0.3; st.mood = 'surprised'; }
    if (t > hev('nar') - 0.1) { st.turn = 0.25; st.look = 0.6; st.lookY = 0; st.mood = 'worried'; st.armL = hold(g, -1, 280, 0.4); st.items = { R: cupItem(Math.sin(t * 40) * 0.12) }; }
    if (t > hev('wide')) { st.mood = 'surprised'; atCarpet(); } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_g', t, 0.05, 0.1)) { st.mood = 'happy'; const u = (t - SP.o1_g.t) * 4; st.armR = reach(g, 1, g.sw * (1.6 + 0.15 * Math.sin(u)), g.ySh + 140 + Math.cos(u) * 20, { planar: true }); st.laugh = t > SP.o1_g.t + 1.1; }
    if (t > e('stroke')) { atCarpet(); st.mood = 'happy'; st.blink = 1; st.laugh = false; const u = (t - e('stroke')) * 7.8;
      st.armL = reach(g, -1, -g.sw * 2.15, g.ySh + 120 + Math.sin(u) * 90, { planar: true }); st.armR = down(g, 1); st.tilt = -0.05; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'skeptical'; }
    if (speaking('o2_g', t, 0.05, 0.1)) { st.mood = 'sad'; st.turn = 0.1; st.look = 0.3; st.lookY = 0.7; st.armL = chest(g, -1); st.armR = chest(g, 1); }
    if (kn) { st.legPose = 'squat'; st.drop = 620; st.mood = 'sad'; st.turn = -0.1; st.look = -0.2; st.lookY = 0.8; const u = (t - e('kneel') - 0.35) * 8.2;
      st.armR = reach(g, 1, g.sw * 1.6, -110 - Math.max(0, Math.sin(u)) * 150, { planar: true }); st.armL = chest(g, -1);
      if (t > e('look')) { st.lookY = -0.2; st.turn = -0.35; st.look = -0.8; st.mood = 'annoyed'; st.armR = reach(g, 1, g.sw * 1.6, -110, { planar: true }); } } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o3_g', t, 0.05, 0.1)) { st.mood = 'happy'; gestR(st, g, 'o3_g', t, 1.8, 90); st.armL = open(g, -1, 1.6, 100); }
    if (t > e('frame')) { atCarpet(); st.mood = 'happy'; st.armL = open(g, -1, 1.5, 120); st.armR = open(g, 1, 1.5, 120); }
    if (t > e('clap')) { const k = Math.abs(Math.sin((t - e('clap')) * 11)); st.armL = reach(g, -1, -g.sw * (0.15 + 0.5 * k), g.ySh + 200, { planar: true }); st.armR = reach(g, 1, g.sw * (0.15 + 0.5 * k), g.ySh + 200, { planar: true }); st.laugh = true; st.blink = 1; st.turn = -0.2; st.look = -0.4; } }
  if (L === 'o4') { st.mood = 'neutral';
    if (speaking('o4_h', t, 0.05, 0.3)) { st.mood = 'surprised'; st.blink = 0; if (t > SP.o4_h.t + SP.o4_h.d * 0.5) st.mood = 'sad'; }
    if (t > e('tear')) { st.mood = 'sad'; st.armL = chest(g, -1); st.armR = chest(g, 1); st.tilt = 0.05; }
    if (speaking('o4_g', t, 0, 0.1)) { st.mood = 'sad'; st.armR = chest(g, 1); st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 200, { planar: true }); }
    if (t > e('touch')) { atCarpet(); st.mood = 'sad'; const k = eIO(clamp((t - e('touch')) / 0.6)); st.armL = reach(g, -1, -g.sw * lerp(1.2, 2.15, k), g.ySh + lerp(220, 110, k), { planar: true }); st.armR = chest(g, 1); }
    if (t > e('blush')) { st.mood = 'happy'; st.blink = 1; } }
  return st; }
// twist: Rupert at his drums (seated), the neighbour in her armchair
function drumState(t) { const g = G.drum, e = k => ev('end', k), st = { ...base(g, t, 'guest2'), mood: 'happy', legPose: 'sit', drop: 360, legs: false, turn: 0.1, look: 0.2 };
  const hit = t > e('drum') && (t < SP.end_g.t - 0.1 || (t > endOf('end_g') + 0.1 && t < e('moral') + 0.6));
  if (hit) { const u = t * 13; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 330 + Math.sin(u) * 60, { planar: true }); st.armR = reach(g, 1, g.sw * 1.5, g.ySh + 330 + Math.sin(u + Math.PI) * 60, { planar: true }); st.headY = Math.abs(Math.sin(u / 2)) * 10; st.mood = 'happy'; st.laugh = true; }
  else { st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 360, { planar: true }); st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 360, { planar: true }); }
  st.items = { L: stickItem(t, 0), R: stickItem(t, 1.3) };
  if (speaking('end_g', t, 0.05, 0.1)) { st.mood = 'happy'; st.laugh = false; st.turn = 0; st.look = 0.1; const u = (t - SP.end_g.t) * 4; st.armR = reach(g, 1, g.sw * (1.7 + 0.15 * Math.sin(u)), g.ySh + 120 + Math.cos(u) * 20, { planar: true }); }
  return st; }
function nanaState(t) { const g = G.nana, u = t * 6, st = { t, talk: 0, mood: 'happy', blink: 1, turn: -0.1, look: -0.2, legPose: 'sit', drop: 330, legs: false,
  armL: reach(g, -1, -g.sw * 0.55, g.ySh + 300 + Math.sin(u) * 14, { planar: true }), armR: reach(g, 1, g.sw * 0.55, g.ySh + 300 - Math.sin(u) * 14, { planar: true }), items: { L: needleItem(t, 1), R: needleItem(t, -1) } };
  if (t > ev('end', 'wink') - 0.2 && t < ev('end', 'wink') + 0.8) st.blink = 0;
  return st; }

// the carpet face: looks at whoever, blinks when Rupert looks away
function faceState(t, L) { const f = { blink: 0, lx: 0, ly: 0, happy: 0, blush: 0, wink: 0, smile: 0 };
  const bl = (t0, d = 0.16) => { const u = (t - t0) / d; return u > 0 && u < 2 ? 1 - Math.abs(u - 1) : 0; };
  if (L === 'hook') { const r = hev('nar') - 0.1; f.lx = 0.8; f.ly = 0.2;
    if (t > r) { f.lx = Math.sin((t - r) * 2.2) > 0 ? 0.9 : -0.9; f.blink = Math.max(bl(hev('face') + 0.5), bl(hev('face') + 1.3), bl(hev('wide') + 0.7)); }
    if (t > hev('peek') && t < hev('peek') + 0.75) { f.blink = bl(hev('peek') + 0.15); f.lx = 0.9; } }
  if (L === 'o1') { f.lx = speaking('o1_h', t, 0.1, 0.2) ? -0.9 : 0.9; f.blink = Math.max(bl(SP.o1_h.t + 0.6), bl(SP.o1_h.t + 2.2));
    if (t > ev('o1', 'stroke') + 0.15) { f.happy = 1; f.smile = 1; } }
  if (L === 'o2') { f.lx = speaking('o2_h', t, 0.1, 0.1) ? -0.9 : 0.9; f.blink = bl(SP.o2_h.t + 0.8); if (t > ev('o2', 'kneel')) { f.lx = 0.7; f.ly = 1; f.blink = Math.max(bl(ev('o2', 'kneel') + 0.8), bl(ev('o2', 'look') + 0.4)); } }
  if (L === 'o3') { f.lx = speaking('o3_h', t, 0.1, 0.1) ? -0.9 : 0.9; f.blink = Math.max(bl(SP.o3_h.t + 1.0), bl(SP.o3_h.t + 3.1)); if (t > ev('o3', 'frame')) { f.smile = 1; f.lx = 0; f.ly = 0.2; f.blink = bl(ev('o3', 'clap') + 1.5); } }
  if (L === 'o4') { f.lx = speaking('o4_h', t, 0.1, 0.1) ? -0.9 : 0.9; f.blink = Math.max(bl(SP.o4_h.t + 1.2), bl(SP.o4_h.t + 4.6)); f.ly = 0.1;
    if (t > ev('o4', 'touch')) { f.lx = 0.9; f.ly = 0.3; } if (t > ev('o4', 'blush')) { f.blush = clamp((t - ev('o4', 'blush')) / 0.3); f.happy = 1; f.smile = 1; } }
  if (L === 'end') { f.lx = -0.6; f.ly = 0.3; f.smile = 0.6; f.blink = bl(ev('end', 'drum') + 1.0); const w = (t - ev('end', 'wink')) / 0.5; f.wink = w > 0 && w < 1 ? Math.sin(w * Math.PI) * 1.4 : 0; }
  return f; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'guest2'], two: ['her', 'guest2'], her: ['her'], rup: ['guest2'], face: ['guest2'], carpet: ['her', 'guest2'], kneel: ['guest2'], flat: ['guest2'], drum: ['guest2'], neigh: [] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function waves(c, t) { const t0 = ev('end', 'drum'); if (t < t0) return; c.save(); c.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const u = ((t - t0) * 1.6 + i / 6) % 1, r = 120 + u * 900, a = 1 - u; c.strokeStyle = `rgba(62,71,30,${0.5 * a})`; c.lineWidth = 16;
    c.save(); c.beginPath(); c.rect(-2400, -2600, WX0 - 60 + 2400, 3000); c.clip(); c.beginPath(); c.arc(-420, -560, r, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(-420, -560, r, Math.PI - 0.9, Math.PI + 0.9); c.stroke(); c.restore(); }
  c.restore(); }
function sharedCarpet(c) { c.save(); c.fillStyle = '#B8323A'; c.fillRect(WX0 - 70, -2500, 70, 1900); c.fillStyle = '#E8B04A'; for (let y = -2440; y < -650; y += 110) c.fillRect(WX0 - 58, y, 46, 40);
  c.strokeStyle = '#F4E3C0'; c.lineWidth = 6; for (const y0 of [-2500, -600]) for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(WX0 - 60 + k * 22, y0); c.lineTo(WX0 - 58 + k * 22, y0 + (y0 < -1000 ? -50 : 50)); c.stroke(); } c.restore(); }
function drumKit(c, t) { const hit = Math.abs(Math.sin(t * 13)); c.save();
  // floor tom + snare, bass drum front (covers his legs), cymbal
  c.fillStyle = '#C9D2DA'; c.fillRect(-830, -900, 18, 700); c.save(); c.translate(-820, -900 - hit * 8); c.rotate(-0.12); c.fillStyle = '#E8B04A'; c.beginPath(); c.ellipse(0, 0, 210, 34, 0, 0, TAU); c.fill(); c.restore();
  paint(c, q => { q.m(-20, -560); q.l(240, -560); q.l(240, -380); q.l(-20, -380); q.z(); }, '#2E7A4A', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#F4EFE6'; c.beginPath(); c.ellipse(110, -560, 130, 26, 0, 0, TAU); c.fill();
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(-420, -10, 420, 40, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-720, -40); q.l(-120, -40); q.l(-120, -560); q.l(-720, -560); q.z(); }, '#2E7A4A', { sd: 6, hd: 3, lw: 5 });
  c.fillStyle = '#F4EFE6'; c.beginPath(); c.arc(-420, -300, 230, 0, TAU); c.fill(); c.strokeStyle = '#C9D2DA'; c.lineWidth = 16; c.stroke(); c.fillStyle = '#C2504A'; c.beginPath(); c.arc(-420, -300, 80, 0, TAU); c.fill();
  c.restore(); }
function armchair(c, x) { paint(c, q => { q.m(x - 330, -40); q.l(x + 330, -40); q.l(x + 330, -1100); q.q(x, -1220, x - 330, -1100); q.z(); }, '#C2504A', { sd: 8, hd: 4, lw: 5 }); }
function armchairFront(c, x) { paint(c, q => { q.m(x - 380, -40); q.l(x + 380, -40); q.l(x + 380, -460); q.l(x - 380, -460); q.z(); }, '#A8403A', { sd: 6, hd: 3, lw: 5 });
  for (const s of [-1, 1]) paint(c, q => { q.m(x + s * 380, -40); q.l(x + s * 250, -40); q.l(x + s * 250, -700); q.q(x + s * 315, -760, x + s * 380, -700); q.z(); }, '#C2504A', { sd: 6, hd: 3, lw: 5 });
  // the ball of wool in her lap
  c.fillStyle = '#8E5BD0'; c.beginPath(); c.arc(x + 20, -560, 70, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 5; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + 20, -560, 30 + k * 14, 0.4 + k, 2.4 + k); c.stroke(); } }
const NANAX = 1350;
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'guest2'], heads = {};
  if (L === 'end') {
    c.drawImage(BGF, BX0, BY0, BW, BH); drawCarpet(c, -700, -1950, 0.55); carpetFace(c, -700, -1945, 0.55, faceState(t, L)); sharedCarpet(c); waves(c, t);
    armchair(c, NANAX); heads.nana = K.put(c, NANA, nanaState(t), NANAX, 0); armchairFront(c, NANAX);
    if (who.includes('guest2')) { c.fillStyle = '#3A2A1A'; c.fillRect(-470, -380, 120, 340); heads.guest2 = K.put(c, RUP, drumState(t), -420, 0); } drumKit(c, t);
    if (!heads.guest2) heads.guest2 = OFF; heads.her = OFFL; return heads; }
  c.drawImage(BGR, BX0, BY0, BW, BH);
  goldFrame(c, museumK(t, L, 'frame'));
  drawCarpet(c, CXc, CYc, 1); carpetFace(c, FACE.x, FACE.y, FACE.s, faceState(t, L));
  plaque(c, museumK(t, L, 'ropes'));
  if (who.includes('guest2')) heads.guest2 = K.put(c, RUP, rupState(t, L), X.rup, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  ropes(c, museumK(t, L, 'ropes'));
  if (L === 'o4' && heads.guest2) tears(c, heads.guest2, t, clamp((t - ev('o4', 'tear')) / 0.3) * (1 - clamp((t - ev('o4', 'blush')) / 0.3)));
  K.mark(c, 'carpet', CXc, CYc, 800);
  if (!heads.her) heads.her = OFFL; if (!heads.guest2) heads.guest2 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { WIDE: S(-50, -1400, 0.42, 'wide'), COVER: S(-50, -1400, 0.42, 'wide'),
  TWO: S(-50, fy(HY('guest2'), 0.5, 860), 0.5, 'two'),
  HER: S(X.her + 60, fy(HY('her'), 1.0, 880), 1.0, 'her'), HER_R: S(X.her + 40, fy(HY('her'), 1.1, 860), 1.1, 'her'),
  RUP: S(X.rup - 40, fy(HY('guest2'), 1.0, 880), 1.0, 'rup'), RUP_CU: S(X.rup - 20, fy(HY('guest2'), 1.3, 900), 1.3, 'rup'),
  FACE: S(FACE.x, FACE.y + 60, 1.55, 'face'),
  STROKE: S(470, fy(HY('guest2'), 0.62, 760), 0.62, 'rup'),
  KNEEL: S(X.rup - 40, -620, 0.95, 'kneel'),
  MUSEUM: S(-60, -1380, 0.44, 'carpet'),
  TOUCH: S(470, fy(HY('guest2'), 0.62, 760), 0.62, 'rup'),
  FLATS: S(150, -1330, 0.4, 'flat'), DRUM: S(-420, fy(HY('drum'), 1.0, 880), 1.0, 'drum'), NEIGH: S(NANAX - 380, -1000, 0.68, 'neigh'),
  CARPET2: S(-700, -1950, 1.4, 'drum'), FLASH: U('flash', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('face') - 0.05) return SH.COVER; if (t < hev('wide')) return f(SH.FACE); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_g.t - 0.1) return f(SH.HER); if (t < e('stroke')) return f(SH.RUP); return f(SH.STROKE); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_g.t - 0.1) return f(SH.HER); if (t < e('kneel')) return f(SH.RUP); if (t < e('look') - 0.02) return f(SH.KNEEL); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_g.t - 0.1) return f(SH.HER); if (t < e('frame') - 0.02) return f(SH.RUP); return f(SH.MUSEUM); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('flash')) return f(SH.HER); if (t < e('tear')) return f(SH.FLASH); if (t < e('touch')) return f(SH.RUP_CU); return f(SH.TOUCH); }
  if (L === 'end') { if (t < e('neigh')) return f(SH.FLATS); if (t < SP.end_g.t - 0.1) return f(SH.NEIGH); if (t < e('wink') - 0.02) return f(SH.DRUM); if (t < e('moral') - 0.05) return f(SH.CARPET2); return f(SH.FLATS); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- sepia flashback insert: a child in bed strokes the carpet pattern and falls asleep
function flashView(c, t) { const t0 = ev('o4', 'flash'), u = t - t0;
  c.fillStyle = '#E3DDB8'; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'flash' });
  c.save(); c.translate(540, 980); const z = 0.62 + u * 0.03; c.scale(z, z);
  drawCarpet(c, 120, 60, 0.85); carpetFace(c, 120, 65, 0.85, { blink: 1, lx: 0, ly: 0, happy: 1, blush: 0, wink: 0, smile: 1 });
  // bed: headboard, pillow, the kid, blanket
  c.fillStyle = '#7A4E2C'; rr(c, -900, 120, 260, 900, 30); c.fill();
  c.fillStyle = '#F7F2E8'; rr(c, -660, 380, 380, 200, 90); c.fill();
  const g = G.kid, k = clamp((u - 0.2) / 1.2), sleepy = clamp((u - 0.9) / 0.5);
  const st = { t, talk: 0, mood: 'happy', blink: sleepy > 0.5 ? 1 : 0, turn: 0.35, look: 0.8, lookY: -0.3, legPose: 'sit', drop: 260, legs: false, tilt: 0.12 * sleepy, items: {},
    armL: reach(g, -1, -g.sw * 0.4, g.ySh + 300, { planar: true }), armR: reach(g, 1, g.sw * (1.9 + 0.25 * Math.sin(u * 3)) * (1 - 0.3 * sleepy), g.ySh - 120 + Math.cos(u * 3) * 90 + sleepy * 220, { planar: true }) };
  K.put(c, KID, st, -380, 980, 1.0);
  paint(c, q => { q.m(-700, 760); q.q(-200, 680, 900, 720); q.l(900, 1150); q.l(-700, 1150); q.z(); }, '#9CCBE4', { sd: 8, hd: 4, lw: 5 });
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-500 + i * 240, 900 + (i % 2) * 60, 40, 0, TAU); c.fill(); }
  c.restore();
  // Z z z (drawn letters, no font emoji)
  if (sleepy > 0) for (let i = 0; i < 3; i++) { const v = ((u - 1.0) * 0.8 + i * 0.33) % 1; if (v < 0) continue; c.save(); c.globalAlpha = sleepy * (1 - v); c.translate(330 + i * 60 + v * 80, 640 - v * 260 - i * 70); UI.font(c, 'Unb9', 70 - i * 12); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'Z', 0, 0, C.white, C.oliveD, 10); c.restore(); }
  // old-photo grade: sepia wash + soft vignette + rounded white border
  c.save(); c.globalCompositeOperation = 'color'; c.fillStyle = '#B88A50'; c.fillRect(0, 0, W, HH); c.restore();
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#F2DDB8'; c.fillRect(0, 0, W, HH); c.restore();
  c.save(); c.strokeStyle = '#F7F2E8'; c.lineWidth = 46; rr(c, 23, 23, W - 46, HH - 46, 40); c.stroke(); c.restore(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  // rubric tab «НАШЕ ЗА ГРАНИЦЕЙ» on the card's top edge
  UI.font(c, 'Unb9', 30); const rw = c.measureText('НАШЕ ЗА ГРАНИЦЕЙ').width + 56; c.fillStyle = C.olive; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -rw / 2, -165 - 30, rw, 52, 26); c.fill(); c.stroke(); c.fillStyle = C.white; c.fillText('НАШЕ ЗА ГРАНИЦЕЙ', 0, -165 - 3);
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 105, w: 980, h: 360, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }
function monthCard(c, t) { const s = ev('end', 'beat'), k = eBack(P(t, s, s + 0.25), 2.2) * (1 - P(t, s + 1.85, s + 2.05)); if (k <= 0) return;
  c.save(); c.translate(540, 260); c.rotate(-0.03); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 8, -64 + 10, 660, 128, 30); c.fill(); c.fillStyle = C.oliveD; rr(c, -330, -64, 660, 128, 30); c.fill();
  UI.textFit(c, 'Unb9', 64, 'МЕСЯЦ СПУСТЯ', 580); c.fillStyle = '#FFE15A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('МЕСЯЦ СПУСТЯ', 0, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 210, y: 196, w: 660, h: 128, k, id: 'month' }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI, aT = SC.outro.ev.ask;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Rupert with his teacup (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.guest2; K.put(c, RUP, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: hold(gm, 1, 250, 0.7), items: { R: cupItem(0) } }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.2, items: {}, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.9, g.ySh + 60 + Math.sin(t * 8 + 1) * 20, { planar: true }) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // the question: «А ТЫ БЫ ОТВЕТИЛА КАК?» during the outro, then the comment question (ask) takes its place, bigger
  const swap = P(t, aT - 0.12, aT + 0.05), q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap);
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const qa = eBack(P(t, aT - 0.05, aT + 0.3), 2.2);
  if (qa > 0) { c.save(); c.translate(540, 300); c.rotate(-0.02); c.scale(qa, qa); textFit(c, 'Unb9', 76, 'У ВАС БЫЛ', 860); strokeText(c, 'У ВАС БЫЛ', 0, -62, C.oliveD, C.white, 16); textFit(c, 'Unb9', 84, 'КОВЁР НА СТЕНЕ?', 900); strokeText(c, 'КОВЁР НА СТЕНЕ?', 0, 44, C.pink, C.white, 16); c.restore(); }
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
  const subT = Math.min(svT + 0.5, sp.t + sp.d - 0.9), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < aT - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); } Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { flashView(c, t); heads = { her: OFFL, guest2: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { guest2: ['RUPERT', '#2E7A4A'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4 && k !== 'nana') onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:') && tag !== 'face') K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_g: -0.12, o1_h: -0.12, o1_g: 0.05, o2_h: -0.12, o2_g: 0.05, o3_h: -0.12, o3_g: 0.05, o4_h: 0.05, o4_g: 0.05, end_g: 0.05 } });
  if (L === 'hook') title(c, t);
  if (L === 'end') monthCard(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('carpet', NF, renderFrame);
