// Procreate-style flat illustration test: "Одно видео" (RU, no voice)
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn} = require('child_process');
const W = 1080, H = 1920, FPS = 30;
GlobalFonts.registerFromPath(__dirname + '/node_modules/@fontsource/neucha/files/neucha-cyrillic-400-normal.woff2', 'Hand');
GlobalFonts.registerFromPath(__dirname + '/node_modules/@fontsource/neucha/files/neucha-latin-400-normal.woff2', 'Hand');

// ---------- seeded random ----------
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- textures (pre-rendered once) ----------
function strokeTex(seed, n, len, wid, light, dark, angle = null) {
  const c = createCanvas(W, H), g = c.getContext('2d'), r = rng(seed);
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H, a = angle === null ? r() * Math.PI : angle + (r() - .5) * .5;
    const l = len * (.4 + r());
    g.strokeStyle = r() < .5 ? light : dark;
    g.lineWidth = wid * (.4 + r());
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * l * .5 + (r() - .5) * 8, y + Math.sin(a) * l * .5 + (r() - .5) * 8, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  return c;
}
function grainTex(seed) {
  const c = createCanvas(W, H), g = c.getContext('2d'), r = rng(seed);
  const img = g.createImageData(W, H);
  for (let i = 0; i < img.data.length; i += 4) { const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 22; }
  g.putImageData(img, 0, 0); return c;
}
const TEX = {
  wall: strokeTex(1, 9000, 60, 3, 'rgba(120,170,255,0.22)', 'rgba(10,30,110,0.25)'),
  knit: strokeTex(2, 6000, 40, 3, 'rgba(255,255,200,0.28)', 'rgba(110,120,0,0.22)', 0.15),
  wood: strokeTex(3, 7000, 70, 2.5, 'rgba(255,170,110,0.25)', 'rgba(110,30,0,0.30)', Math.PI / 2),
  skin: strokeTex(4, 2500, 30, 3, 'rgba(255,220,200,0.18)', 'rgba(170,80,60,0.14)'),
  hair: strokeTex(5, 5000, 50, 2, 'rgba(90,90,110,0.45)', 'rgba(0,0,0,0.3)', Math.PI / 2.2),
  paper: strokeTex(6, 3000, 40, 2, 'rgba(255,255,255,0.4)', 'rgba(140,150,170,0.12)'),
  grain: grainTex(7),
};

// ---------- drawing helpers ----------
let g; // current context
function wob(pts, seed, amt = 2.5) { const r = rng(seed); return pts.map(([x, y]) => [x + (r() - .5) * amt, y + (r() - .5) * amt]); }
function smoothPath(pts, close = true) {
  g.beginPath();
  const n = pts.length;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let m = mid(pts[n - 1], pts[0]);
  if (!close) { g.moveTo(...pts[0]); for (let i = 1; i < n - 1; i++) { const q = mid(pts[i], pts[i + 1]); g.quadraticCurveTo(...pts[i], ...q); } g.lineTo(...pts[n - 1]); return; }
  g.moveTo(...m);
  for (let i = 0; i < n; i++) { const q = mid(pts[i], pts[(i + 1) % n]); g.quadraticCurveTo(...pts[i], ...q); }
  g.closePath();
}
function ellPts(cx, cy, rx, ry, n = 16, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return p; }
function rrPts(x, y, w, h, r) { // rounded rect as polygon pts for smoothPath
  return [[x + r, y], [x + w - r, y], [x + w, y], [x + w, y + r], [x + w, y + h - r], [x + w, y + h], [x + w - r, y + h], [x + r, y + h], [x, y + h], [x, y + h - r], [x, y + r], [x, y]];
}
// fill a path built by fn(), then overlay texture clipped to it
function paint(build, color, tex, texAlpha = 1, line = null, lw = 5) {
  build(); g.fillStyle = color; g.fill();
  if (tex) { g.save(); build(); g.clip(); g.globalAlpha = texAlpha; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(tex, 0, 0); g.restore(); }
  if (line) { build(); g.strokeStyle = line; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
}
function sharp(pts, r = 22) { const o = [], n = pts.length; for (let i = 0; i < n; i++) { const a = pts[(i + n - 1) % n], b = pts[i], c = pts[(i + 1) % n];
  const da = Math.hypot(a[0] - b[0], a[1] - b[1]), dc = Math.hypot(c[0] - b[0], c[1] - b[1]); const ra = Math.min(r, da / 2.2), rc = Math.min(r, dc / 2.2);
  o.push([b[0] + (a[0] - b[0]) / da * ra, b[1] + (a[1] - b[1]) / da * ra], b, [b[0] + (c[0] - b[0]) / dc * rc, b[1] + (c[1] - b[1]) / dc * rc]); } return o; }
function poly(pts, seed, amt, r = 22) { const w = wob(pts, seed, amt); return () => smoothPath(sharp(w, r)); }
function lines(segs, color, w) { g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); for (const [a, b] of segs) { g.moveTo(...a); g.lineTo(...b); } g.stroke(); }

const C = {
  blue: '#1f4fc4', blueL: '#3168dc', lime: '#cfd23c', limeD: '#a9ad22', rust: '#c4521f', rustD: '#9c3c13',
  skin: '#e9a088', skinD: '#d3826a', red: '#e0412a', ink: '#141414', white: '#f3f4f6', floor: '#b9c7d6', blush: '#e86f6a',
  wood: '#8a5424', yellow: '#f6ef6e',
};

// ---------- caption ----------
function caption(text, alpha = 1) {
  g.save(); g.globalAlpha = alpha;
  g.font = '78px Hand'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.yellow;
  g.strokeStyle = C.yellow; g.lineWidth = 3.5; g.lineJoin = 'round';
  text.split('\n').forEach((l, i) => { g.strokeText(l.toUpperCase(), W / 2, 200 + i * 86); g.fillText(l.toUpperCase(), W / 2, 200 + i * 86); });
  g.restore();
}

// ---------- WIDE SCENE ----------
// st: {eyes:'down'|'wide'|'blink', clock:[h,m], tea:'hot'|'cold', q:0..1, phoneUp, t}
function wide(st) {
  // wall
  paint(() => { g.beginPath(); g.rect(0, 0, W, H); }, C.blue, TEX.wall);
  paint(poly([[700, 0], [1080, 0], [1080, 1500], [760, 1500]], 11, 0), C.blueL, TEX.wall, .8); // light band
  // floor tiles
  paint(() => { g.beginPath(); g.rect(0, 1500, W, 420); }, C.floor, TEX.paper);
  const fl = []; for (let i = -6; i < 12; i++) fl.push([[i * 140, 1500], [i * 140 - 260, 1920]]);
  for (let j = 0; j < 4; j++) { const y = 1500 + j * j * 30 + j * 70; fl.push([[0, y], [W, y]]); }
  lines(fl, 'rgba(60,80,110,0.55)', 3);
  // wall clock
  const cx = 860, cy = 470;
  paint(() => smoothPath(ellPts(cx, cy, 82, 82, 20)), C.white, TEX.paper, 1, C.ink, 7);
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; lines([[[cx + Math.cos(a) * 62, cy + Math.sin(a) * 62], [cx + Math.cos(a) * 70, cy + Math.sin(a) * 70]]], C.ink, 4); }
  const [hh, mm] = st.clock, ah = ((hh % 12) + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2, am = mm / 60 * Math.PI * 2 - Math.PI / 2;
  lines([[[cx, cy], [cx + Math.cos(ah) * 38, cy + Math.sin(ah) * 38]]], C.ink, 8);
  lines([[[cx, cy], [cx + Math.cos(am) * 58, cy + Math.sin(am) * 58]]], C.ink, 5);
  // chair back (behind girl, right)
  paint(poly([[700, 860], [940, 830], [950, 1010], [720, 1030]], 12, 3, 30), '#4a2c1c', TEX.wood, .9, C.ink, 4);
  paint(poly([[930, 990], [960, 990], [980, 1920], [945, 1920]], 13, 2), C.wood, TEX.wood);
  // girl torso (sweater)
  const bob = Math.sin(st.t * 2.2) * 3; // breathing
  paint(poly([[400, 760 + bob], [680, 760 + bob], [740, 820], [770, 1060], [310, 1060], [340, 820]], 21, 4), C.lime, TEX.knit, 1);
  // neck + collar
  paint(poly([[505, 690], [575, 690], [580, 770], [500, 770]], 22, 2), C.skinD, TEX.skin);
  paint(poly([[470, 745 + bob], [610, 745 + bob], [620, 790 + bob], [460, 790 + bob]], 23, 3), C.limeD, TEX.knit);
  // head
  head(540, 560 + bob * .6, st);
  // pants under table
  paint(poly([[330, 1150], [530, 1150], [520, 1920], [350, 1920]], 31, 3), C.rust, TEX.wood, 1);
  paint(poly([[560, 1150], [760, 1150], [760, 1920], [600, 1920]], 32, 3), C.rust, TEX.wood, 1);
  // table legs X
  lines([[[470, 1180], [660, 1880]], [[660, 1180], [470, 1880]]], '#6c7480', 22);
  // table top
  const tb = () => smoothPath(ellPts(540, 1110, 420, 115, 24));
  paint(tb, C.white, TEX.paper);
  g.save(); tb(); g.clip();
  const gl = []; for (let x = 120; x < 980; x += 58) gl.push([[x, 990], [x + (x - 540) * .12, 1230]]); for (let y = 1010; y < 1230; y += 46) gl.push([[100, y], [980, y]]);
  lines(wob(gl.flat(), 41, 4).reduce((a, p, i, arr) => (i % 2 ? a : a.concat([[p, arr[i + 1]]])), []), C.ink, 4);
  g.restore();
  tb(); g.strokeStyle = C.ink; g.lineWidth = 5; g.stroke();
  // mug
  const steamOk = st.tea === 'hot';
  paint(poly([[730, 1000], [820, 1000], [812, 1095], [738, 1095]], 51, 2), '#f08a3a', TEX.wood, .5, C.ink, 4);
  g.beginPath(); g.ellipse(828, 1045, 22, 28, 0, -1.4, 1.4); g.strokeStyle = C.ink; g.lineWidth = 7; g.stroke();
  if (steamOk) for (let k = 0; k < 2; k++) { const ph = st.t * 2 + k * 2; g.beginPath(); for (let y = 0; y < 90; y += 6) { const x = 765 + k * 26 + Math.sin(y / 14 + ph) * 8; y === 0 ? g.moveTo(x, 985 - y) : g.lineTo(x, 985 - y); } g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 5; g.stroke(); }
  // arms on table + phone
  paint(poly([[350, 830], [300, 1000], [380, 1080], [500, 1020], [470, 960], [380, 980], [400, 860]], 61, 4), C.lime, TEX.knit);
  paint(poly([[730, 830], [790, 1000], [700, 1080], [590, 1020], [620, 960], [700, 980], [690, 860]], 62, 4), C.lime, TEX.knit);
  paint(poly([[470, 900], [600, 900], [600, 1060], [470, 1060]].map(([x, y]) => [x + 0, y]), 63, 2), C.red, null, 1, null);
  paint(() => smoothPath(rrPts(472, 905, 126, 150, 18)), C.red, TEX.skin, .6, C.ink, 4);
  // glow on phone screen backside not visible; hands
  paint(poly([[455, 990], [520, 980], [525, 1045], [460, 1050]], 64, 4), C.skin, TEX.skin);
  paint(poly([[560, 985], [620, 990], [615, 1050], [555, 1045]], 65, 4), C.skin, TEX.skin);
  // question marks
  if (st.q > 0) {
    const qs = [[300, 420, -0.2, 0], [210, 610, 0.15, .25], [790, 690, 0.25, .5]];
    for (const [x, y, rot, d] of qs) {
      const a = Math.max(0, Math.min(1, (st.q - d) * 4)); if (!a) continue;
      g.save(); g.translate(x, y - (1 - a) * 30); g.rotate(rot + Math.sin(st.t * 3 + x) * .06); g.globalAlpha = a;
      g.font = '140px Hand'; g.fillStyle = C.white; g.textAlign = 'center'; g.fillText('?', 0, 0); g.restore();
    }
  }
}

function head(x, y, st) {
  // back hair (bun + volume)
  paint(() => smoothPath(wob(ellPts(x, y - 175, 68, 58, 14), 71, 6)), C.ink, TEX.hair, 1);
  paint(() => smoothPath(wob(ellPts(x, y - 20, 150, 165, 18), 72, 8)), C.ink, TEX.hair, 1);
  // face
  paint(() => smoothPath(wob(ellPts(x, y + 15, 118, 140, 18), 73, 4)), C.skin, TEX.skin, 1);
  // fringe
  paint(poly([[x - 140, y - 30], [x - 120, y - 140], [x, y - 175], [x + 120, y - 140], [x + 140, y - 30], [x + 70, y - 85], [x + 20, y - 60], [x - 40, y - 95], [x - 90, y - 50]], 74, 5), C.ink, TEX.hair);
  // ears hint, blush
  g.fillStyle = 'rgba(232,111,106,0.55)';
  g.beginPath(); g.ellipse(x - 72, y + 55, 30, 18, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(x + 72, y + 55, 30, 18, 0, 0, 7); g.fill();
  // eyes
  const ex = [x - 50, x + 50], ey = y + 5;
  for (let i = 0; i < 2; i++) {
    const e = ex[i];
    if (st.eyes === 'blink') { g.beginPath(); g.arc(e, ey - 4, 26, .2, Math.PI - .2); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke(); continue; }
    const r = st.eyes === 'wide' ? 36 : 28;
    g.beginPath(); g.ellipse(e, ey, r, st.eyes === 'wide' ? r : r * .8, 0, 0, 7); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke();
    // pupil
    const px = st.eyes === 'wide' ? 0 : 4, py = st.eyes === 'wide' ? 0 : 12, pr = st.eyes === 'wide' ? 9 : 13;
    g.beginPath(); g.arc(e + px, ey + py, pr, 0, 7); g.fillStyle = C.ink; g.fill();
    if (st.eyes === 'down') { // heavy upper lid
      g.save(); g.beginPath(); g.ellipse(e, ey, r + 3, r * .8 + 3, 0, 0, 7); g.clip();
      g.fillStyle = C.skinD; g.fillRect(e - 40, ey - 40, 80, 32); g.restore();
      g.beginPath(); g.moveTo(e - r, ey - 8); g.lineTo(e + r, ey - 8); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke();
    }
  }
  // brows
  const up = st.eyes === 'wide' ? -22 : 0;
  lines([[[x - 82, y - 48 + up], [x - 22, y - 52 + up]], [[x + 22, y - 52 + up], [x + 82, y - 48 + up]]], C.ink, 7);
  // nose
  g.beginPath(); g.moveTo(x + 4, y + 20); g.quadraticCurveTo(x - 10, y + 60, x + 10, y + 64); g.strokeStyle = C.ink; g.lineWidth = 4; g.stroke();
  // mouth
  if (st.eyes === 'wide') { g.beginPath(); g.ellipse(x, y + 100, 9, 12, 0, 0, 7); g.strokeStyle = C.ink; g.lineWidth = 5; g.stroke(); }
  else { g.beginPath(); g.moveTo(x - 22, y + 96); g.quadraticCurveTo(x, y + 110, x + 22, y + 94); g.strokeStyle = C.ink; g.lineWidth = 5; g.stroke(); }
}

// ---------- CLOSE-UP: phone feed ----------
function closeup(st) {
  paint(() => { g.beginPath(); g.rect(0, 0, W, H); }, C.blue, TEX.wall);
  // table with curved grid (fisheye)
  const tb = () => { g.beginPath(); g.moveTo(-20, 520); g.quadraticCurveTo(540, 380, 1100, 520); g.lineTo(1100, 1940); g.lineTo(-20, 1940); g.closePath(); };
  paint(tb, C.white, TEX.paper);
  g.save(); tb(); g.clip(); g.strokeStyle = C.ink; g.lineWidth = 6; g.lineCap = 'round';
  for (let i = -3; i <= 3; i++) { const x = 540 + i * 210; g.beginPath(); g.moveTo(x + i * 30, 380); g.quadraticCurveTo(x - i * 25, 1150, x + i * 60, 1940); g.stroke(); }
  for (let j = 0; j < 8; j++) { const y = 560 + j * 210; g.beginPath(); g.moveTo(-20, y + 30); g.quadraticCurveTo(540, y - 40, 1100, y + 30); g.stroke(); }
  g.restore();
  // phone
  const px = 250, py = 520, pw = 580, ph = 1080;
  g.save(); g.translate(540, 1060); g.rotate(-0.06); g.translate(-540, -1060);
  paint(() => smoothPath(wob(rrPts(px, py, pw, ph, 70), 81, 4)), C.red, TEX.skin, .5, C.ink, 6);
  const sx = px + 30, sy = py + 34, sw = pw - 60, sh = ph - 68;
  const scr = () => smoothPath(rrPts(sx, sy, sw, sh, 48));
  paint(scr, '#fbf3d6', TEX.paper);
  g.save(); scr(); g.clip();
  // feed cards scrolling
  const pal = ['#f7c6b9', '#b9d7f7', '#cfe8b0', '#f3d98a', '#d8c3f2'];
  for (let k = 0; k < 9; k++) {
    const cy = sy + 120 + k * 360 - st.scroll;
    if (cy < sy - 360 || cy > sy + sh) continue;
    paint(() => smoothPath(rrPts(sx + 24, cy, sw - 48, 330, 28)), pal[k % 5], null, 1, C.ink, 4);
    cat(sx + sw / 2, cy + 190, k);
  }
  // status bar
  g.fillStyle = '#fbf3d6'; g.fillRect(sx, sy, sw, 100);
  g.font = '58px Hand'; g.fillStyle = C.ink; g.textAlign = 'left'; g.fillText(st.time, sx + 40, sy + 72);
  g.restore();
  // notch
  paint(() => smoothPath(rrPts(px + pw / 2 - 90, py + 26, 180, 44, 22)), C.ink, null);
  g.restore();
  // hands
  paint(poly([[-40, 1200], [230, 1080], [300, 1180], [270, 1500], [120, 1700], [-40, 1760]], 91, 6), C.skin, TEX.skin);
  paint(poly([[-60, 1640], [160, 1600], [260, 1940], [-60, 1940]], 92, 6), C.lime, TEX.knit);
  const ty = 1330 - st.thumb * 160;
  paint(poly([[1120, 1500], [860, 1480], [700, ty + 40], [660, ty], [700, ty - 40], [760, ty - 20], [930, 1300], [1120, 1260]], 93, 6), C.skin, TEX.skin);
  g.beginPath(); g.ellipse(690, ty - 6, 26, 18, -0.5, 0, 7); g.fillStyle = 'rgba(255,230,220,0.6)'; g.fill();
  paint(poly([[1120, 1540], [900, 1560], [980, 1940], [1120, 1940]], 94, 6), C.lime, TEX.knit);
}
function cat(x, y, k) {
  const r = rng(100 + k), col = ['#3a3a3a', '#e08a3a', '#f4f4f4', '#9a9a9a'][k % 4];
  paint(() => smoothPath(wob(ellPts(x, y + 40, 110, 80, 14), 200 + k, 6)), col, null, 1, C.ink, 4);
  const hb = () => smoothPath(wob([[x - 80, y - 10], [x - 90, y - 120], [x - 40, y - 70], [x + 40, y - 70], [x + 90, y - 120], [x + 80, y - 10], [x + 60, y + 40], [x - 60, y + 40]], 300 + k, 5));
  paint(hb, col, null, 1, C.ink, 4);
  g.fillStyle = col === '#3a3a3a' ? '#f6ef6e' : C.ink;
  g.beginPath(); g.arc(x - 30, y - 15, 9, 0, 7); g.arc(x + 30, y - 15, 9, 0, 7); g.fill();
  g.beginPath(); g.moveTo(x - 8, y + 8); g.lineTo(x + 8, y + 8); g.lineTo(x, y + 16); g.closePath(); g.fillStyle = C.blush; g.fill();
}

// ---------- timeline ----------
const DUR = 10.0;
function frame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  let scene, s0;
  if (t < 3.2) { scene = 'w1'; s0 = 0; } else if (t < 6.4) { scene = 'cu'; s0 = 3.2; } else { scene = 'w2'; s0 = 6.4; }
  const lt = t - s0, z = 1 + lt * 0.008; // slow push-in
  g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  if (scene === 'w1') {
    const blink = (lt > 1.4 && lt < 1.55) || (lt > 2.7 && lt < 2.82);
    wide({eyes: blink ? 'blink' : 'down', clock: [23, 0 + lt * 0.5], tea: 'hot', q: 0, t: lt});
  } else if (scene === 'cu') {
    const sw = (lt % 0.8) / 0.8, e = sw < .35 ? sw / .35 : 1 - (sw - .35) / .65; // thumb swipe cycle
    const scroll = Math.floor(lt / 0.8) * 360 + (sw < .35 ? (1 - Math.cos(sw / .35 * Math.PI)) / 2 * 360 : 360);
    const mins = Math.floor(lt * 18);
    closeup({scroll, thumb: sw < .35 ? e : 1 - Math.min(1, (sw - .35) / .2), time: lt < 1 ? '23:01' : `0${Math.min(3, Math.floor(lt - 1) + 0)}:${String((mins * 7) % 60).padStart(2, '0')}`});
  } else {
    const blink = lt > 2.4 && lt < 2.52;
    wide({eyes: blink ? 'blink' : 'wide', clock: [3, 40], tea: 'cold', q: Math.max(0, (lt - 0.9) / 1.2), t: lt});
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(TEX.grain, 0, 0);
  if (scene === 'w1') caption('Допью чай\nи лягу спать');
  else if (scene === 'cu') caption('Посмотрю\nодно видео…');
  else caption(t < 7.6 ? '…' : 'Ну вот, посмотрела\nодно видео');
}

const out = process.argv[2] || 'out.mp4';
const still = process.argv[3];
const cv = createCanvas(W, H); g = cv.getContext('2d');
if (still) { for (const t of still.split(',').map(Number)) { frame(t); require('fs').writeFileSync(`still_${t}.png`, cv.toBuffer('image/png')); } process.exit(0); }
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-',
  '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-shortest',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-movflags', '+faststart', out], {stdio: ['pipe', 'inherit', 'inherit']});
(async () => {
  for (let i = 0; i < DUR * FPS; i++) {
    frame(i / FPS);
    const buf = Buffer.from(g.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
})();
