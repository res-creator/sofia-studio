// Chapter 7 — The Real Secret (today): world scale -> how the system works (still Candler's deal) -> the recap board -> Pemberton's nine glasses pull back to 2.2 billion a day -> END CARD "COKE OR PEPSI?".
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon'), EN = require('../../../kit/engine');
const K = require('./cokekit'), C = K.CAST;
const { W, H, INK, CREAM, RED, YELLOW, BLUE, ERA, ink, rr, ell, poly, clamp, lerp, seg, E, hash, fitText } = L;
const TL = EN.timeline(__dirname, { start: 3.0, gap: 0.55, gaps: { t4: 0.9 }, tail: 5.8 }), at = TL.at, begin = TL.begin, end = TL.end;
const pop = (t, t0, d = 0.35) => clamp((t - t0) / d);
const S = (id, w, n = 0) => at(id, w, n) - 0.12;
const MO = ERA.modern;

// ---------- sets ----------
function sky(ctx, t, cols = MO.sky) { L.skyGrad(ctx, -2000, -1200, 4000, 1500, cols); L.cloud(ctx, -900 + t * 12, -640, 1.4); L.cloud(ctx, 300 + t * 8, -720, 1.0); L.cloud(ctx, 1100 + t * 10, -560, 1.2); }
function skyline(ctx, y = 120) { const cols = ['#9CC3E0', '#B9D4E8', '#86AFCF', '#A9C7DE']; for (let i = 0; i < 14; i++) K.tower(ctx, -2000 + i * 300, y, 220, 380 + hash(i * 3) * 420, cols[i % 4]); }
function crane(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const sx of [-80, 80]) { rr(ctx, sx - 12, -520, 24, 520, 4); ink(ctx, '#E07A3A', 4); }
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-80, -i * 65); ctx.lineTo(80, -i * 65 - 65); ink(ctx, null, 3); }
  rr(ctx, -360, -560, 760, 40, 4); ink(ctx, '#E07A3A', 5); const tx = Math.sin(t * 0.6) * 200; ctx.beginPath(); ctx.moveTo(tx, -520); ctx.lineTo(tx, -300 + Math.sin(t * 0.9) * 60); ink(ctx, null, 4);
  rr(ctx, tx - 60, -300 + Math.sin(t * 0.9) * 60, 120, 60, 4); ink(ctx, [RED, BLUE, YELLOW][Math.floor(t * 0.3) % 3], 4); ctx.restore(); }
function water(ctx, y, t, col = '#3F86C8') { ctx.fillStyle = col; ctx.fillRect(-2200, y, 4400, 1000); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 30; i++) { const xx = -2100 + ((i * 290 + t * 40) % 4200), yy = y + 30 + (i % 5) * 70; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 70, yy); ctx.stroke(); } }
function globe(ctx, x, y, r, t) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, '#3F8FD8', 7); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ctx.clip();
  const lands = [[-0.5, -0.35, 0.32, 0.22], [-0.35, 0.25, 0.18, 0.3], [0.15, -0.3, 0.38, 0.2], [0.2, 0.15, 0.2, 0.28], [0.6, 0.35, 0.18, 0.12], [-0.85, -0.05, 0.12, 0.2]];
  for (const [lx, ly, rx, ry] of lands) { const xx = ((lx + t * 0.04 + 1.5) % 2 - 1) * r; ell(ctx, xx, ly * r, rx * r, ry * r, 0.3); ink(ctx, '#7CC36A', 5); }
  ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(r * 0.35, r * 0.2, r * 1.05, 0, 6.27); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.27); ink(ctx, null, 7); ctx.restore(); }
function stars(ctx, n = 90) { for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(-1800 + hash(i) * 3600, -1000 + hash(i * 2.3) * 2000, 2 + hash(i * 5) * 3, 0, 6.27); ctx.fillStyle = '#F6EBD3'; ctx.fill(); } }
function pharmacy(ctx, t) { L.wallpaper(ctx, -1500, -900, 3000, 1120, '#7A3F2E', '#8E4E38'); P.shelves(ctx, -1200, -640, 900, 560, { rows: 4, seed: 2 }); P.shelves(ctx, 300, -640, 900, 560, { rows: 4, seed: 9 });
  for (const lx of [-600, 600]) { ctx.beginPath(); ctx.moveTo(lx, -900); ctx.lineTo(lx, -600); ink(ctx, null, 4); ell(ctx, lx, -580, 40, 26); ink(ctx, '#F7D27A', 5); L.glow(ctx, lx, -570, 260, '#FFD58A', 0.35); }
  rr(ctx, -330, -760, 660, 110, 10); ink(ctx, '#3A1E14', 6); fitText(ctx, "JACOBS' PHARMACY", 0, -705, 56, '#F2D27A', 600); L.planks(ctx, -1500, 220, 3000, 700, ERA.gaslight.floor); }
const MAP = { x: -1500, y: -720, w: 3000, h: 1440 };
const mp = (a, b) => K.mapPt(MAP.x, MAP.y, MAP.w, MAP.h, a, b);
const ROUTES = [[[300, 150], [470, 120]], [[250, 330], [500, 260]], [[560, 330], [820, 360]], [[620, 160], [880, 150]], [[160, 230], [520, 200]], [[700, 300], [900, 250]]];

// recap board (world): safe in the middle-top, five cards in a row, red yarn
const CARDS = [{ x: -1320, title: 'FREE SAMPLES' }, { x: -660, title: 'THE $1 DEAL' }, { x: 0, title: 'THE BOTTLE' }, { x: 660, title: 'THE WAR' }, { x: 1320, title: 'THE CUSTOMERS' }], CY = 300;
function vignette(ctx, k, t) { // inside card k: inner box 540 x 330 centred at 0,0
  if (k === 0) { L.wallpaper(ctx, -280, -180, 560, 360, '#E2C394', '#D5B07C'); P.fountain(ctx, 60, 120, 0.4, { w: 800, era: 'sepia', stools: false });
    for (let i = 0; i < 5; i++) toon(ctx, -230 + i * 52, 170, 0.32, { skin: L.SKIN[i % 7], hair: { style: ['short', 'bun', 'side', 'curly', 'long'][i], col: '#5A3A22' }, top: [RED, BLUE, YELLOW, '#2F8A6A', '#8A5AA8'][i], pants: '#3A3A48' }, 'stand', 'happy', { t: t + i, look: [1, 0] });
    for (let i = 0; i < 7; i++) { const ph = (t * 0.4 + i / 7) % 1; P.ticket(ctx, -240 + hash(i) * 480, -200 + ph * 420, 0.28, 'FREE', 'ONE GLASS', Math.sin(t * 2 + i) * 0.5); } }
  else if (k === 1) { L.wallpaper(ctx, -280, -180, 560, 360, '#5E6B4E', '#6E7B5C'); for (let i = 0; i < 4; i++) { const u = clamp(((t * 0.8 + i * 0.25) % 1.6)); if (u < 1) { ctx.save(); ctx.globalAlpha = 1 - u * 0.5; rr(ctx, -250 + i * 130, -150 - u * 10, 90, 60, 4); ink(ctx, '#B86B4B', 3); fitText(ctx, 'PLANT', -205 + i * 130, -120, 18, CREAM, 80); ctx.restore(); } }
    L.planks(ctx, -280, 110, 560, 80, '#7A5A3A'); toon(ctx, -110, 160, 0.42, LOOKS.candler, 'present', 'smug', { t }); toon(ctx, 110, 160, 0.42, LOOKS.lawyerA, 'present', 'happy', { t, flip: true });
    ctx.save(); ctx.translate(0, -40 + Math.sin(t * 3) * 10); ctx.rotate(Math.sin(t * 2) * 0.2); P.bills(ctx, 0, 0, 0.55, 1); ctx.restore(); }
  else if (k === 2) { ctx.fillStyle = '#121018'; ctx.fillRect(-280, -180, 560, 360); const bx = Math.sin(t * 0.9) * 140; ctx.save(); ctx.beginPath(); ctx.arc(bx, 0, 150, 0, 6.27); ctx.clip(); ctx.fillStyle = '#3A3050'; ctx.fillRect(-280, -180, 560, 360);
    P.bottle(ctx, 0, 140, 1.05, { kind: 'contour', label: '' }); ctx.restore(); ctx.save(); ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(bx, 0, 150, 0, 6.27); ctx.lineWidth = 4; ctx.strokeStyle = '#FFF4D6'; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(-200 + Math.sin(t * 1.3) * 30, 120); ctx.rotate(-0.5); ell(ctx, 0, 0, 40, 34); ink(ctx, '#E8B58A', 5); for (let i = 0; i < 3; i++) { rr(ctx, -26 + i * 22, -60, 18, 40, 9); ink(ctx, '#E8B58A', 4); } ctx.restore(); }
  else if (k === 3) { L.skyGrad(ctx, -280, -180, 560, 360, ERA.war.sky); ctx.fillStyle = '#5E7C8E'; ctx.fillRect(-280, 60, 560, 140); for (let i = 0; i < 6; i++) { ctx.beginPath(); const xx = -260 + ((i * 100 + t * 30) % 540); ctx.moveTo(xx, 90 + (i % 2) * 40); ctx.lineTo(xx + 50, 90 + (i % 2) * 40); ctx.strokeStyle = '#8FB0C2'; ctx.lineWidth = 4; ctx.stroke(); }
    ctx.save(); ctx.translate(Math.sin(t) * 10, Math.sin(t * 1.6) * 5); poly(ctx, [[-260, 40], [240, 40], [190, 110], [-220, 110]]); ink(ctx, '#6E7650', 5); rr(ctx, -40, -40, 220, 80, 6); ink(ctx, '#C8954F', 4); fitText(ctx, 'BOTTLING PLANT', 70, 0, 22, '#7A2E1E', 200);
      toon(ctx, -150, 40, 0.42, LOOKS.soldier, 'drink', 'happy', { t, itemR: g => { g.rotate(2.6); P.bottle(g, 0, 40, 0.42, { open: true, fill: 0.6 }); } }); ctx.restore(); }
  else { L.skyGrad(ctx, -280, -180, 560, 360, ERA.tense.sky); P.crowd(ctx, -250, 250, 170, 0.36, 7, t, { react: 'angry', seed: 5 });
    for (let i = 0; i < 2; i++) K.sign(ctx, -120 + i * 250, -90 + Math.sin(t * 6 + i) * 8, 220, 100, i ? 'WE WANT|THE ORIGINAL' : 'BRING IT|BACK!', { stick: 120, rot: Math.sin(t * 4 + i) * 0.06, bg: i ? CREAM : YELLOW }); } }
function board(ctx, t, checks, safeOpen = 0) {
  rr(ctx, -1800, -980, 3600, 1800, 20); ink(ctx, '#8A5A33', 10); rr(ctx, -1760, -940, 3520, 1720, 10); ink(ctx, '#C9A06A', 5);
  ctx.save(); ctx.globalAlpha = 0.35; for (let i = 0; i < 900; i++) { ctx.beginPath(); ctx.arc(-1740 + hash(i) * 3480, -920 + hash(i * 1.3) * 1680, 3, 0, 6.27); ctx.fillStyle = '#8A6A3E'; ctx.fill(); } ctx.restore();
  rr(ctx, -620, -900, 1240, 120, 8); ink(ctx, CREAM, 5); fitText(ctx, 'THE WHOLE STORY', 0, -838, 80, INK, 1180);
  // yarn from the safe to each card
  for (const cd of CARDS) { ctx.beginPath(); ctx.moveTo(0, -430); ctx.quadraticCurveTo((cd.x) * 0.5, -100 + Math.sin(t + cd.x) * 6, cd.x, CY - 250); ctx.lineWidth = 6; ctx.strokeStyle = '#C9302C'; ctx.stroke(); }
  // the safe "SECRET RECIPE"
  ctx.save(); ctx.translate(0, -470); rr(ctx, -230, -200, 460, 380, 16); ink(ctx, '#5A6378', 7); rr(ctx, -200, -170, 400, 320, 10); ink(ctx, '#6E7890', 5); rr(ctx, -170, -140, 340, 60, 6); ink(ctx, CREAM, 4); fitText(ctx, 'SECRET RECIPE', 0, -110, 40, INK, 320);
  ctx.save(); ctx.translate(0, 40); ctx.rotate(t * 0.8 + safeOpen * 6); ctx.beginPath(); ctx.arc(0, 0, 70, 0, 6.27); ink(ctx, '#C9CDD2', 6); for (let i = 0; i < 12; i++) { ctx.rotate(0.5236); ctx.beginPath(); ctx.moveTo(0, -56); ctx.lineTo(0, -68); ink(ctx, null, 4); } ctx.restore(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, -680, 16, 0, 6.27); ink(ctx, RED, 4);
  for (let k = 0; k < 5; k++) { const cd = CARDS[k]; ctx.save(); ctx.translate(cd.x, CY); ctx.rotate([-0.03, 0.02, -0.015, 0.03, -0.02][k]);
    ctx.save(); ctx.translate(10, 14); ctx.globalAlpha = 0.3; rr(ctx, -300, -250, 600, 500, 8); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
    rr(ctx, -300, -250, 600, 500, 8); ink(ctx, '#FBF6EA', 6); ctx.save(); rr(ctx, -280, -230, 560, 360, 4); ctx.clip(); ctx.translate(0, -50); vignette(ctx, k, t + k * 1.3); ctx.restore(); rr(ctx, -280, -230, 560, 360, 4); ink(ctx, null, 4);
    fitText(ctx, cd.title, 0, 190, 54, INK, 540); ctx.beginPath(); ctx.arc(0, -250, 16, 0, 6.27); ink(ctx, [RED, BLUE, YELLOW, '#2F8A6A', '#8A5AA8'][k], 4);
    if (checks[k] > 0) { ctx.save(); ctx.translate(220, -160); ctx.beginPath(); ctx.arc(0, 0, 80 * E.back(clamp(checks[k] * 2), 2), 0, 6.27); ink(ctx, '#2F8A6A', 6); K.markerPath(ctx, K.checkPts(0, 4, 44), clamp(checks[k] * 1.5 - 0.3), CREAM, 14); ctx.restore(); }
    ctx.restore(); } }

// the pull-back world: tile (i,j) around the 1886 counter; (0,0) = Pemberton's counter
const TW = 1920, THh = 1080;
const SPOTS2 = ['café', 'stadium', 'office', 'beach', 'kitchen', 'park', 'train', 'cinema', 'street', 'picnic', 'diner', 'school'];
function tileScene(ctx, i, j, t, lod) { const k = Math.abs((i * 7 + j * 13) % 12), v = hash(i * 31.7 + j * 17.3), skyc = [['#7FC3E8', '#D8F0F7'], ['#FF9A5A', '#FFD58A'], ['#2D8CF0', '#A8DCFF'], ['#3B4A7A', '#C27A6A']][Math.floor(v * 4)];
  L.skyGrad(ctx, -TW / 2, -THh / 2, TW, THh, skyc); const gcol = ['#CFC8BC', '#3E8E4A', '#D9DDE3', '#F2D9A0', '#B9A88E', '#7CC36A', '#8A8F96', '#5A3A6A', '#B8B2A8', '#5FA85A', '#E9D3A6', '#C9B58C'][k];
  ctx.fillStyle = gcol; ctx.fillRect(-TW / 2, 120, TW, THh / 2 - 120);
  if (lod === 0) { // far: simple shapes
    for (let n = 0; n < 4; n++) { const px = -600 + n * 400; rr(ctx, px - 50, -60, 100, 180, 30); ctx.fillStyle = ['#D93A35', '#2F6DB5', '#F7C548', '#2F8A6A'][(n + k) % 4]; ctx.fill(); ctx.beginPath(); ctx.arc(px, -120, 70, 0, 6.27); ctx.fillStyle = L.SKIN[(n + k) % 7]; ctx.fill(); rr(ctx, px + 60, -120, 30, 90, 10); ctx.fillStyle = '#3B1F12'; ctx.fill(); }
    if (k % 3 === 0) { ctx.fillStyle = '#9CC3E0'; for (let n = 0; n < 4; n++) ctx.fillRect(-900 + n * 480, -540, 200, 300 + n * 40); }
    rr(ctx, -TW / 2, -THh / 2, TW, THh, 0); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); return; }
  if (k % 3 === 0) skyline(ctx, 120); else if (k % 3 === 1) { L.cloud(ctx, -400, -300, 2); L.cloud(ctx, 500, -360, 1.6); } else { L.wallpaper(ctx, -TW / 2, -THh / 2, TW, 640, ['#DDE6EE', '#E9D3A6', '#CBB8E0'][k % 3], '#C9D1DC', 60); }
  for (let n = 0; n < 3; n++) { const px = -520 + n * 520, look = { skin: L.SKIN[(n * 3 + k) % 7], hair: { style: ['short', 'bun', 'side', 'curly', 'long', 'bald'][(n + k) % 6], col: ['#2B1E16', '#D9B25A', '#A4462A', '#151313'][(n + k) % 4] }, top: [RED, BLUE, YELLOW, '#2F8A6A', '#8A5AA8', '#E07A3A'][(n * 2 + k) % 6], pants: '#3A3A48' };
    const dr = (t * 0.8 + n * 0.4 + v) % 2 < 1; toon(ctx, px, 380, 1.2, look, dr ? 'drink' : 'cheer', dr ? 'happy' : 'laugh', { t: t + n, itemR: g => { if (dr) g.rotate(2.6); P.bottle(g, 0, 40, 0.5, { kind: ['contour', 'modern', 'contour'][n], open: true, fill: 0.6 }); } }); }
  fitText(ctx, SPOTS2[k].toUpperCase(), 0, -420, 70, CREAM, 800, { outline: 10 }); rr(ctx, -TW / 2, -THh / 2, TW, THh, 0); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); }
function counterTile(ctx, t) { pharmacy(ctx, t); toon(ctx, 60, 200, 1.3, LOOKS.pemberton, 'present', 'happy', { t }); P.fountain(ctx, 0, 250, 0.7, { w: 1800, taps: 3 });
  for (let i = 0; i < 9; i++) P.glassCup(ctx, -600 + i * 66, 72, 0.55, { fill: 0.8, fizz: t }); rr(ctx, -TW / 2, -THh / 2, TW, THh, 0); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); }

// ---------- scenes ----------
const t1 = 0, t2 = S('t1', 'thirty'), t3 = S('t1', 'in', 0), t4 = S('t1', 'in', 1), t5 = begin('t2') - 0.25, t6 = S('t2', 'the', 0), t7 = S('t2', 'independent'),
  t8 = begin('t3') - 0.25, t9 = S('t3', 'free'), t10 = S('t3', 'one') - 0.15, t11 = S('t3', 'bottle') - 0.15, t12 = S('t3', 'war') - 0.15, t13 = S('t3', 'and', 1),
  t14 = begin('t4') - 0.3, t15 = at('t4', 'day') + 0.1, t16 = S('t4', 'what'), t17 = S('t4', 'repeated'), t18 = S('t4', 'two'), tEC = end('t4') + 0.8;
const L1 = (id, w, t0, n = 0) => at(id, w, n) - t0;
const checksAt = t => [S('t3', 'free'), S('t3', 'one'), S('t3', 'bottle'), S('t3', 'war'), S('t3', 'customers')].map(x => clamp((t - x - 0.6) / 0.8));

const scenes = [
  { name: 'today: a modern port, ships and trucks', t0: t1, era: 'modern', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -500, -60, 1.2], [5.8, 300, -20, 1.05]], lt);
      EN.layers(ctx, c, [[0.3, x => { sky(x, lt); skyline(x, 100); }],
        [0.6, x => { water(x, 100, lt); K.ship(x, -900 + lt * 60, 260, 1.1, lt); K.ship(x, 900 - lt * 40, 200, 0.8, lt, { flip: true, hull: '#7A2E2E' }); }],
        [1, x => { x.fillStyle = '#B8B2A8'; x.fillRect(-2200, 300, 4400, 800); x.fillStyle = '#8A8F96'; x.fillRect(-2200, 290, 4400, 16); crane(x, -700, 300, 1.0, lt); crane(x, 1300, 300, 1.0, lt + 2);
          for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { rr(x, 200 + i * 130, 160 - j * 64, 126, 62, 4); ink(x, [RED, BLUE, YELLOW, '#2F8A6A', '#E07A3A'][(i + j * 2) % 5], 4); }
          for (let i = 0; i < 3; i++) P.truck(x, -1600 + ((lt * 260 + i * 900) % 3600), 520, 0.75, { era: 2020, text: 'DRINKS', t: lt * 2 + i, load: false }); }]]);
      L.word(ctx, 'TODAY', 960, 170, pop(lt, 3.0), { size: 120, col: YELLOW });
    } },
  { name: 'world map: 33+ billion cases a year', t0: t2, era: 'modern', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 40, 0.6], [3.1, 100, 0, 0.68]], lt), tb = L1('t1', 'billion', t2);
      EN.layers(ctx, c, [[0.6, x => { L.skyGrad(x, -2600, -1600, 5200, 3200, ['#1E3A6A', '#2D5A9A']); }],
        [1, x => { K.worldMap(x, MAP.x, MAP.y, MAP.w, MAP.h); for (let r = 0; r < ROUTES.length; r++) { const [a, b] = ROUTES[r].map(p => mp(p[0], p[1])); x.save(); x.setLineDash([18, 14]); x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo((a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 120, b[0], b[1]); x.lineWidth = 6; x.strokeStyle = 'rgba(255,255,255,0.7)'; x.stroke(); x.restore();
            const u = (lt * 0.25 + r * 0.17) % 1, px = lerp(lerp(a[0], (a[0] + b[0]) / 2, u), lerp((a[0] + b[0]) / 2, b[0], u), u), py = lerp(lerp(a[1], Math.min(a[1], b[1]) - 120, u), lerp(Math.min(a[1], b[1]) - 120, b[1], u), u); K.ship(x, px, py + 30, 0.42, lt, { flip: b[0] < a[0] }); }
          for (let i = 0; i < 6; i++) { const [sx, sy] = mp(K.SPOTS[i * 5][0], K.SPOTS[i * 5][1]); P.truck(x, sx + Math.sin(lt * 1.5 + i) * 40, sy + 40, 0.3, { era: 2020, t: lt + i }); }
          // a comic stack of cases piling up
          const n = Math.floor(clamp((lt - tb + 0.6) / 1.6) * 14); for (let i = 0; i < n; i++) { x.save(); x.translate(1150 + (i % 2) * 14, 600 - i * 64); x.rotate((hash(i) - 0.5) * 0.08); P.crate(x, 0, 0, 0.72, { n: 4, kind: 'modern' }); x.restore(); } }]]);
      L.plate(ctx, '33+ BILLION CASES A YEAR', 960, 150, pop(lt, tb - 0.2), { size: 80, bg: RED, fg: CREAM });
    } },
  { name: 'the globe fills with pins: 200+ countries & territories', t0: t3, era: 'modern', out: { type: 'whip', dur: 0.3, dir: 1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 40, 1.15], [3.2, 0, 20, 0.98]], lt), np = Math.floor(clamp((lt - 0.2) / 2.0) * 46);
      EN.layers(ctx, c, [[0.3, x => { L.skyGrad(x, -1800, -1100, 3600, 2200, ['#0E1A3A', '#22305E']); stars(x); }],
        [1, x => { globe(x, 0, 60, 380, lt); for (let i = 0; i < np; i++) { const a = hash(i * 2.9) * 6.28, rr2 = Math.sqrt(hash(i * 5.3)) * 330; const px = Math.cos(a) * rr2, py = 60 + Math.sin(a) * rr2 * 0.85, k = E.back(clamp((lt - 0.2 - i * 2.0 / 46) / 0.3), 2);
            x.save(); x.translate(px, py); x.scale(k, k); x.beginPath(); x.moveTo(0, 0); x.lineTo(-14, -34); x.arc(0, -40, 16, Math.PI * 0.85, Math.PI * 0.15); x.closePath(); ink(x, [RED, YELLOW, CREAM][i % 3], 4); x.restore(); }
          P.sparkles(x, 0, 60, 480, lt, 10); }]]);
      L.plate(ctx, '200+ COUNTRIES & TERRITORIES', 960, 960, pop(lt, L1('t1', 'two', t3) - 0.1), { size: 72, bg: YELLOW });
    } },
  { name: '2024: the HQ tower vs a tower of money, $47 billion', t0: t4, era: 'modern', out: { type: 'cut' }, draw(ctx, t, lt) {
      const tf = L1('t1', 'forty', t4), g = E.out(clamp((lt - tf + 0.8) / 1.6)), c = EN.cam([[0, -150, 80, 1.2], [tf, 0, 0, 1.0], [tf + 2.5, 0, -20, 0.95]], lt);
      EN.layers(ctx, c, [[0.3, x => { sky(x, lt); skyline(x, 200); }],
        [1, x => { x.fillStyle = '#C9CDD2'; x.fillRect(-2000, 300, 4000, 800); x.fillStyle = '#9AA3AE'; x.fillRect(-2000, 292, 4000, 14);
          K.tower(x, -620, 300, 420, 700, '#7FB2E5', { floor: 40, col: 52 }); rr(x, -600, -380, 380, 60, 6); ink(x, RED, 5); fitText(x, 'HEADQUARTERS', -410, -350, 34, CREAM, 360);
          // stack of bills grows
          const hb = g * 640; for (let i = 0; i * 26 < hb; i++) { x.save(); x.translate(260 + Math.sin(i * 1.7) * 8, 290 - i * 26); rr(x, -170, -24, 340, 26, 4); ink(x, i % 2 ? '#9BC48A' : '#8DB87C', 3); x.restore(); }
          // the accountant on a ladder
          const ly = 300 - Math.min(hb, 640); x.beginPath(); x.moveTo(500, 300); x.lineTo(470, ly); x.moveTo(580, 300); x.lineTo(550, ly); for (let r = 300; r > ly; r -= 50) { x.moveTo(500 - (300 - r) * 0.03, r); x.lineTo(580 - (300 - r) * 0.03, r); } x.lineWidth = 9; x.strokeStyle = '#8A6A4A'; x.stroke();
          toon(x, 530, ly + 10, 0.8, C.operator2, g > 0.95 ? 'cheer' : 'carry', g > 0.95 ? 'laugh' : 'worried', { t: lt, itemR: g < 0.95 ? (q => P.bills(q, -40, -20, 0.6, 3)) : null });
          K.plant(x, -1000, 300, 1.2, lt); K.plant(x, 1000, 300, 1.0, lt + 1); }]]);
      L.dateCard(ctx, '2024', 330, 930, pop(lt, L1('t1', '2024', t4)));
      L.plate(ctx, '$47 BILLION', 1400, 930, pop(lt, tf), { size: 96, bg: RED, fg: CREAM });
    } },
  { name: 'still Candlers deal: 1899 | today split screen', t0: t5, era: 'modern', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 0, 1.08], [3.2, 0, -10, 1.0]], lt), sp = E.out(clamp(lt / 0.6));
      // left half 1899 (sepia), right half today
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2 - 6, H); ctx.clip();
      EN.layers(ctx, { ...c, x: c.x - 66 }, [[0.6, x => { L.wallpaper(x, -2000, -900, 3000, 1120, '#5E6B4E', '#6E7B5C'); rr(x, -1060, -560, 380, 260, 8); ink(x, '#C9A777', 6); fitText(x, 'BOTTLING RIGHTS', -870, -430, 34, INK, 340, { font: L.F.type }); L.planks(x, -2000, 220, 3000, 700, '#7A5A3A'); }],
        [1, x => { toon(x, -720, 330, 1.1, LOOKS.candler, 'present', 'smug', { t: lt }); toon(x, -300, 330, 1.1, LOOKS.lawyerA, 'present', 'happy', { t: lt, flip: true }); x.save(); x.translate(-510, -150 + Math.sin(lt * 3) * 12); x.rotate(Math.sin(lt * 2) * 0.15); P.bills(x, 0, 0, 0.7, 1); x.restore(); }]]);
      L.finish(ctx, 'sepia'); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(W / 2 + 6, 0, W / 2, H); ctx.clip();
      EN.layers(ctx, { ...c, x: c.x + 66 }, [[0.6, x => { L.wallpaper(x, -1000, -900, 3000, 1120, '#DDE6EE', '#CCD8E2', 60); K.blinds(x, 640, -600, 520, 330, '#9CC7E8', { scene: g => skyline(g, -280), down: 0.2 }); x.fillStyle = '#B9C1CB'; x.fillRect(-1000, 220, 3000, 700); }],
        [1, x => { toon(x, 300, 330, 1.1, C.modernExec, 'present', 'happy', { t: lt }); toon(x, 720, 330, 1.1, C.bottler, 'present', 'grin', { t: lt, flip: true }); x.save(); x.translate(510, -160 + Math.sin(lt * 3) * 12); x.rotate(Math.sin(lt * 2) * 0.15); rr(x, -110, -70, 220, 140, 8); ink(x, '#FFFFFF', 4); fitText(x, 'PARTNERS', 0, -30, 30, INK, 190); for (let i = 0; i < 3; i++) { rr(x, -80, 0 + i * 18, 160, 8, 3); ink(x, '#C9CDD2', 0); } x.restore(); }]]);
      ctx.restore(); ctx.fillStyle = INK; ctx.fillRect(W / 2 - 6, 0, 12, H);
      L.dateCard(ctx, '1899', 300, 150, pop(lt, 0.2)); L.dateCard(ctx, 'TODAY', 1620, 150, pop(lt, 0.4), { bg: '#7FB2E5' });
      L.word(ctx, '=', 960, 540, pop(lt, L1('t2', 'like', t5)), { size: 200, col: YELLOW });
      L.plate(ctx, "STILL CANDLER'S DEAL", 960, 960, pop(lt, L1('t2', 'candler', t5)), { size: 64 });
    } },
  { name: 'the company: concentrate + the brand', t0: t6, era: 'modern', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const tb = L1('t2', 'brand', t6), c = EN.cam([[0, -420, 20, 1.2], [tb - 0.4, -300, 20, 1.15], [tb + 0.4, 300, 0, 1.05], [5, 360, 0, 1.08]], lt), lit = pop(lt, tb, 0.4);
      EN.layers(ctx, c, [[0.6, x => { L.wallpaper(x, -2000, -900, 4000, 1120, '#E9EDF2', '#DDE3EA', 70); for (let i = 0; i < 6; i++) { rr(x, -1800 + i * 640, -860, 300, 26, 6); ink(x, '#F4F7FA', 4); } x.fillStyle = '#B9C1CB'; x.fillRect(-2000, 220, 4000, 700); L.tiles(x, -2000, 220, 4000, 700, '#C9D1DC', '#B9C1CB', 90); }],
        [1, x => { // concentrate tank with a tiny precious drip
          rr(x, -820, -420, 420, 560, 60); ink(x, '#C9CDD2', 7); L.shade(x, () => rr(x, -820, -420, 420, 560, 60), 1, 0.15); rr(x, -790, -200, 360, 90, 8); ink(x, RED, 5); fitText(x, 'CONCENTRATE', -610, -155, 44, CREAM, 340);
          for (let i = 0; i < 3; i++) { rr(x, -770 + i * 120, 140, 30, 90, 4); ink(x, '#8A8F96', 4); } rr(x, -620, 140, 20, 60, 4); ink(x, '#8A8F96', 4); const dp = (lt * 1.2) % 1; ell(x, -610, 210 + dp * 60, 9, 13); ink(x, '#3B1F12', 3);
          toon(x, -280, 330, 1.0, C.scientist, 'present', 'smug', { t: lt });
          // the brand: a giant billboard lights up + a painter
          rr(x, 80, -560, 900, 470, 10); ink(x, lit > 0 ? '#D93A35' : '#5A6070', 8); if (lit > 0) { L.glow(x, 530, -320, 700, '#FFE3A0', 0.35 * lit); fitText(x, 'COCA-COLA', 530, -390, 120, CREAM, 820); fitText(x, 'THE BRAND', 530, -230, 54, YELLOW, 600); P.sparkles(x, 530, -320, 480, lt, 8); }
          for (const lx of [200, 530, 860]) { x.beginPath(); x.moveTo(lx, -90); x.lineTo(lx, 300); ink(x, null, 9); } for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(140 + i * 160, -575, 14, 0, 6.27); ink(x, lit > 0 ? YELLOW : '#8A8F96', 4); }
          toon(x, 700, 330, 1.0, C.shopkeeper, lit > 0 ? 'cheer' : 'point', lit > 0 ? 'laugh' : 'think', { t: lt }); toon(x, 1100, 330, 1.0, C.modernExec, 'present', lit > 0 ? 'grin' : 'neutral', { t: lt, flip: true }); }]]);
      L.word(ctx, 'THE CONCENTRATE', 600, 160, pop(lt, L1('t2', 'concentrate', t6) - 0.2) * (1 - pop(lt, tb - 0.5, 0.3)), { size: 80, col: YELLOW });
      L.word(ctx, '+ THE BRAND', 1300, 160, pop(lt, tb), { size: 80, col: YELLOW });
    } },
  { name: 'the conveyor: company -> bottling partners -> stores', t0: t7, era: 'modern', out: { type: 'whip', dur: 0.35, dir: -1 }, draw(ctx, t, lt) {
      const c = EN.cam([[0, -900, 0, 1.0], [4.6, 900, 0, 1.0]], lt);
      EN.layers(ctx, c, [[0.3, x => { sky(x, lt); skyline(x, 160); }],
        [1, x => { x.fillStyle = '#B8B2A8'; x.fillRect(-2600, 250, 5200, 800);
          // conveyor belt across the whole system
          rr(x, -2400, 150, 4800, 50, 20); ink(x, '#4A4F5C', 6); for (let i = 0; i < 60; i++) { const xx = -2400 + ((i * 80 + lt * 220) % 4800); x.beginPath(); x.moveTo(xx, 155); x.lineTo(xx, 195); ink(x, null, 3); }
          for (let i = 0; i < 24; i++) { const xx = -2300 + ((i * 200 + lt * 220) % 4600); if (xx < -1300) { rr(x, xx - 30, 70, 60, 80, 8); ink(x, '#C9CDD2', 4); rr(x, xx - 30, 90, 60, 22, 3); ink(x, RED, 0); } else if (xx < 700) P.bottle(x, xx, 150, 0.45, { kind: i % 2 ? 'contour' : 'modern' }); else P.crate(x, xx, 150, 0.5, { n: 3, kind: 'modern' }); }
          // 1: the company
          rr(x, -2050, -330, 560, 470, 10); ink(x, '#E9EDF2', 6); rr(x, -2020, -300, 500, 90, 8); ink(x, RED, 5); fitText(x, 'THE COMPANY', -1770, -255, 52, CREAM, 480); rr(x, -1900, -170, 160, 240, 40); ink(x, '#C9CDD2', 5); fitText(x, 'CONC.', -1820, -50, 34, INK, 140);
          // 2: bottling partners (plant with chimney + filling heads)
          L.bricks(x, -1050, -420, 1400, 560, '#B86B4B', { bw: 60, bh: 24 }); rr(x, -1050, -420, 1400, 560, 6); ink(x, null, 6); rr(x, -1010, -390, 1320, 100, 8); ink(x, '#2F6DB5', 5); fitText(x, 'BOTTLING PARTNERS', -350, -340, 64, CREAM, 1260);
          rr(x, 120, -620, 90, 200, 4); ink(x, '#8A5A44', 5); for (let i = 0; i < 3; i++) { const ph = (lt * 0.5 + i / 3) % 1; x.save(); x.globalAlpha = 1 - ph; L.cloud(x, 165 + ph * 120, -660 - ph * 260, 0.5 + ph * 0.6, '#EDEDED'); x.restore(); }
          for (let i = 0; i < 6; i++) { const hx = -900 + i * 200, d = Math.abs(Math.sin(lt * 4 + i)) * 40; rr(x, hx - 20, -260, 40, 300 + d - 260 + 0, 6); ink(x, '#C9CDD2', 4); rr(x, hx - 36, -260, 72, 40, 6); ink(x, '#8A8F96', 4); }
          toon(x, -400, 420, 0.9, C.bottler, 'point', 'happy', { t: lt }); toon(x, 0, 420, 0.9, { ...C.bottler, skin: '#8E5A36', hatCol: '#2F6DB5' }, 'carry', 'grin', { t: lt + 1, itemR: g => P.crate(g, -40, -20, 0.5, { n: 3, kind: 'modern' }) });
          // trucks out and 3: stores
          P.truck(x, 900 + ((lt * 200) % 500), 520, 0.8, { era: 2020, text: 'DELIVERY', t: lt * 2, load: true });
          K.store(x, 1200, 150, 520, 520, 'MARKET', '#2F8A6A'); K.store(x, 1780, 150, 460, 480, 'CAFÉ', RED); toon(x, 1500, 420, 0.95, C.driver, 'carry', 'happy', { t: lt, itemR: g => P.crate(g, -40, -20, 0.5, { n: 3, kind: 'modern' }) });
          for (const [ax, bx2] of [[-1460, -1080], [380, 860]]) P.arrow(x, ax, -480, bx2, -480, 1, YELLOW); }]]);
      L.plate(ctx, 'INDEPENDENT BOTTLING PARTNERS', 960, 960, pop(lt, 0.3), { size: 58, bg: BLUE, fg: CREAM });
    } },
  { name: 'the whole story board: the recipe was never the whole secret', t0: t8, era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const tn = L1('t3', 'never', t8), c = EN.cam([[0, 0, -60, 0.56], [tn - 0.6, 0, -460, 1.3], [tn + 1.6, 0, -440, 1.36]], lt);
      EN.layers(ctx, c, [[0.4, x => { L.wallpaper(x, -2400, -1500, 4800, 3000, '#5E4A3A', '#6A5444'); }], [1, x => board(x, lt + t8, checksAt(t), 0)],
        [1.2, x => { toon(x, -1350, 1250, 1.6, C.detective, 'point', 'think', { t: lt }); }]]);
      K.stamp(ctx, 'NEVER THE WHOLE SECRET', 960, 820, pop(lt, tn, 0.3), { size: 78 });
    } },
  ...CARDS.map((cd, k) => ({ name: `recap card ${k + 1}: ${cd.title}`, t0: [t9, t10, t11, t12, t13][k], era: 'sepia', out: { type: 'whip', dur: 0.3, dir: -1 }, draw(ctx, t, lt) {
      const c = k < 4 ? EN.cam([[0, cd.x - 140, CY - 60, 1.9], [2.6, cd.x + 60, CY - 40, 2.05]], lt) : EN.cam([[0, cd.x, CY - 40, 2.0], [1.8, cd.x, CY - 40, 2.0], [3.6, 0, 0, 0.56]], lt);
      EN.layers(ctx, c, [[0.4, x => { L.wallpaper(x, -2400, -1500, 4800, 3000, '#5E4A3A', '#6A5444'); }], [1, x => board(x, lt + [t9, t10, t11, t12, t13][k], checksAt(t), 0)]]);
    } })),
  { name: '1886: Pemberton and his nine glasses', t0: t14, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, -40, 1.25], [3.6, 0, -20, 1.1]], lt), n9 = Math.min(9, Math.floor(clamp((lt - L1('t4', 'nine', t14) + 0.3) / 1.0) * 9));
      EN.layers(ctx, c, [[0.6, x => pharmacy(x, lt)], [1, x => { toon(x, 60, 200, 1.3, LOOKS.pemberton, n9 > 0 ? 'present' : 'stand', n9 >= 9 ? 'happy' : 'neutral', { t: lt }); P.fountain(x, 0, 250, 0.7, { w: 1800, taps: 3 });
          for (let i = 0; i < 9; i++) if (n9 > i) P.glassCup(x, -600 + i * 66, 72, 0.55, { fill: 0.8, fizz: lt }); }]]);
      L.dateCard(ctx, '1886', 300, 160, pop(lt, 0.2)); L.plate(ctx, `${n9} GLASSES A DAY`, 1460, 160, n9 > 0 ? 1 : 0, { size: 60 });
    } },
  { name: 'he thought he had made a medicine', t0: t15, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 100, -120, 1.5], [2, 60, -140, 1.65]], lt);
      EN.layers(ctx, c, [[0.6, x => pharmacy(x, lt)], [1, x => { toon(x, 60, 200, 1.3, LOOKS.pemberton, 'hold', 'smug', { t: lt, itemR: g => { P.bottle(g, 0, 60, 0.6, { kind: 'straight', label: 'TONIC' }); } }); P.fountain(x, 0, 250, 0.7, { w: 1800, taps: 3 });
          const u = pop(lt, 0.4, 0.4); if (u > 0) { x.save(); x.globalAlpha = u; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(220 + i * 40, -280 - i * 40, 10 + i * 5, 0, 6.27); ink(x, '#FFF', 4); } rr(x, 300, -560, 380, 240, 110); ink(x, '#FFF', 5);
            x.save(); x.translate(490, -440); rr(x, -40, -70, 80, 120, 10); ink(x, '#8FB6D8', 4); rr(x, -26, -90, 52, 24, 4); ink(x, '#5A3420', 3); fitText(x, 'Rx', 0, -10, 40, RED, 70); x.restore(); x.restore(); } }]]);
      L.word(ctx, 'MEDICINE?', 960, 160, pop(lt, L1('t4', 'medicine', t15) - 0.2), { size: 100, col: CREAM });
    } },
  { name: 'pull back: the counter becomes the whole world', t0: t16, era: 'modern', out: { type: 'cut' }, draw(ctx, t, lt) {
      // camera: hold close on the counter, then zoom out across a grid of modern scenes (one per tile)
      const z = Math.exp(lerp(Math.log(1.0), Math.log(0.085), E.inOut(clamp((lt - L1('t4', 'habit', t16) - 0.2) / (t18 - at('t4', 'habit') - 0.2))))), c = { x: Math.sin(lt * 0.7) * 4, y: 0, z, r: 0 };
      ctx.fillStyle = '#1C1A1F'; ctx.fillRect(0, 0, W, H);
      EN.layer(ctx, c, 1, x => { const span = Math.ceil((W / 2) / (TW * z) + 0.6), spanY = Math.ceil((H / 2) / (THh * z) + 0.6);
        for (let i = -span; i <= span; i++) for (let j = -spanY; j <= spanY; j++) { x.save(); x.translate(i * TW, j * THh); if (i === 0 && j === 0) counterTile(x, lt); else tileScene(x, i, j, lt + i * 0.3 + j * 0.7, TW * z < 330 && (Math.abs(i) > 1 || Math.abs(j) > 1) ? 0 : 1); x.restore(); } });
      L.word(ctx, 'A HABIT', 960, 540, pop(lt, L1('t4', 'habit', t16)) * (1 - pop(lt, L1('t4', 'repeated', t16) + 0.3, 0.3)), { size: 150, col: YELLOW });
    } },
  { name: 'the planet: 2.2 billion a day', t0: t18, era: 'pop', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 0, 1.6], [1.6, 0, 40, 1.0], [5, 0, 40, 0.96]], lt), tb = L1('t4', 'billion', t18);
      EN.layers(ctx, c, [[0.2, x => { L.skyGrad(x, -1800, -1100, 3600, 2200, ['#0E1A3A', '#22305E']); stars(x); }],
        [1, x => { globe(x, 0, 40, 330, lt); for (let i = 0; i < 60; i++) { const a = hash(i * 1.7) * 6.28, rr2 = 340 + hash(i * 3.9) * 90, ph = ((lt * 0.8 + hash(i * 7.3)) % 1), k = Math.sin(ph * Math.PI);
            if (k > 0.1) { x.save(); x.translate(Math.cos(a) * rr2, 40 + Math.sin(a) * rr2 * 0.9); x.rotate(a + Math.PI / 2); x.scale(k, k); P.bottle(x, 0, 0, 0.24, { label: '', kind: i % 3 ? 'contour' : 'modern' }); x.restore(); } }
          P.burst(x, 0, 40, 520, clamp((lt - tb) / 0.6), '#FFE3A0'); }]]);
      L.plate(ctx, '2.2 BILLION', 960, 840, pop(lt, L1('t4', 'two', t18)), { size: 120, bg: RED, fg: CREAM });
      L.plate(ctx, 'A DAY', 960, 975, pop(lt, L1('t4', 'day', t18)), { size: 60 });
    } },
  { name: 'END CARD: COKE OR PEPSI?', t0: tEC, era: 'gaslight', out: { type: 'cut' }, draw(ctx, t, lt) {
      const c = EN.cam([[0, 0, 40, 1.0], [5, 0, 20, 1.12]], lt);
      EN.layers(ctx, c, [[0.6, x => pharmacy(x, lt)], [1, x => { P.fountain(x, 0, 330, 0.75, { w: 2000, taps: 3 });
          for (const [bx, kind, col] of [[-170, 'straight', RED], [170, 'pepsi', BLUE]]) { const k = E.back(clamp((lt - (bx < 0 ? 0.2 : 0.45)) / 0.4), 2); x.save(); x.translate(bx, 135); x.scale(k, k); x.rotate(Math.sin(lt * 2 + bx) * 0.03); L.glow(x, 0, -120, 260, '#FFE3A0', 0.3); P.bottle(x, 0, 0, 1.35, { kind }); x.restore(); }
          P.glassCup(x, -560, 135, 0.6, { fill: 0.7, fizz: lt }); P.glassCup(x, 560, 135, 0.6, { fill: 0.5, fizz: lt + 1 }); }]]);
      L.word(ctx, 'COKE OR PEPSI?', 960, 170, pop(lt, 0.5), { size: 150, col: YELLOW });
      L.plate(ctx, 'Tell us in the comments', 820, 930, pop(lt, 1.2), { size: 62 });
      K.handArrow(ctx, 1460, 700, 1600, 1010, clamp((lt - 1.6) / 1.0), YELLOW, lt);
    } },
];
EN.run({ module, dir: __dirname, TL, scenes, card: { n: 'CHAPTER 7', title: 'The Real Secret', sub: 'Today', era: 'modern' },
  cues: () => [['bell', 0.4, 0.5], ['whoosh', 2.7, 0.5], ['horn', 3.4, 0.4], ['engine', 4.3, 0.3], ['whoosh', t2 - 0.15, 0.5], ['clank', at('t1', 'billion'), 0.4], ['clank', at('t1', 'billion') + 0.5, 0.4], ['stamp', at('t1', 'billion') - 0.1, 0.5],
    ['pop', t3 + 0.4, 0.4], ['pop', t3 + 0.9, 0.4], ['pop', t3 + 1.4, 0.4], ['pop', t3 + 1.9, 0.4], ['ding', at('t1', 'countries'), 0.5], ['ding', at('t1', '2024'), 0.5], ['coins', at('t1', 'forty') - 0.3, 0.5], ['kaching', at('t1', 'forty') + 0.4, 0.5],
    ['tape', t5, 0.6], ['clink', at('t2', 'like'), 0.5], ['whoosh', t6 - 0.15, 0.5], ['power', at('t2', 'brand'), 0.5], ['sparkle', at('t2', 'brand') + 0.3, 0.5], ['whoosh', t7 - 0.15, 0.5], ['factory', t7 + 0.4, 0.3], ['horn', t7 + 3.2, 0.3],
    ['whoosh', t8 - 0.15, 0.5], ['stamp', at('t3', 'never'), 0.6], ['whoosh', t9 - 0.15, 0.4], ['snap', S('t3', 'free') + 0.6, 0.6], ['whoosh', t10 - 0.15, 0.4], ['snap', S('t3', 'one') + 0.6, 0.6], ['whoosh', t11 - 0.15, 0.4], ['snap', S('t3', 'bottle') + 0.6, 0.6],
    ['whoosh', t12 - 0.15, 0.4], ['snap', S('t3', 'war') + 0.6, 0.6], ['whoosh', t13 - 0.15, 0.4], ['snap', S('t3', 'customers') + 0.6, 0.6], ['crowdboo', t13 + 0.2, 0.25],
    ['tape', t14, 0.6], ['tick', at('t4', 'nine'), 0.5], ['tick', at('t4', 'nine') + 0.15, 0.5], ['tick', at('t4', 'nine') + 0.3, 0.5], ['glassclink', at('t4', 'nine') + 0.6, 0.5], ['pop', at('t4', 'medicine'), 0.5],
    ['rise', t16 + 0.3, 0.5], ['whoosh', at('t4', 'repeated'), 0.6], ['boom', at('t4', 'billion'), 0.45], ['sparkle', at('t4', 'billion') + 0.4, 0.5], ['pop', tEC + 0.2, 0.6], ['fizz', tEC + 0.3, 0.5], ['pop', tEC + 0.45, 0.6], ['ding', tEC + 1.2, 0.5], ['slideup', tEC + 1.7, 0.35]],
  music: [[0, 'modern'], [t8, 'build'], [t14, 'gaslight'], [t16, 'build'], [tEC, 'up']] });
