// pro.js — «детальный» мультстиль (как в разборе Crayon Capital): крупная голова, тело-фасолина,
// ножки и ручки линиями, детальные фоны с тенями, свет ламп, диалоги печатаются над говорящим.
import { E, ease, clamp, lerp, noise, shade, alpha, rng, prog } from '/engine/core.js';
import { OL, HAND, light, wt } from '/projects/ww3toon/scenes/toon.js';
export { wt };

export const LWD = 5;
export function fo(g, fill, lw = LWD, ol = OL) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw > 0) { g.lineWidth = lw; g.strokeStyle = ol; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
export function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
export const vg = (g, y, h, c, k = 0.14) => { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, shade(c, k * 0.5)); gr.addColorStop(1, shade(c, -k)); return gr; };
export const hg = (g, x, w, c, k = 0.14) => { const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, shade(c, k * 0.4)); gr.addColorStop(1, shade(c, -k)); return gr; };
export function bx(g, x, y, w, h, c, r = 6, lw = LWD, k = 0.14) { rr(g, x, y, w, h, r); fo(g, vg(g, y, h, c, k), lw); }
export function el(g, x, y, rx, ry, c, lw = LWD) { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2); fo(g, c, lw); }
export function ln(g, pts, w = LWD, c = OL) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.lineWidth = w; g.strokeStyle = c; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
export function pg(g, pts, c, lw = LWD) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); fo(g, c, lw); }
// мягкая тень-пятно
export function blob(g, x, y, rx, ry, a = 0.25, c = '20,14,10') { g.save(); const gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.beginPath(); g.arc(x, y, rx, 0, Math.PI * 2); g.fill(); g.restore(); }
// конус света от лампы
export function cone(g, x, y, w0, w1, h, col = '255,226,150', a = 0.22) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.moveTo(x - w0 / 2, y); g.lineTo(x + w0 / 2, y); g.lineTo(x + w1 / 2, y + h); g.lineTo(x - w1 / 2, y + h); g.closePath(); g.fill(); g.restore(); }
export function glow(g, x, y, r, col = '255,80,60', a = 0.5) { if (r < 1) return; g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
export function htxt(g, s, x, y, size, col = OL, align = 'center', rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.font = `700 ${size}px "${HAND}"`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, 0, 0); g.restore(); }
// «каракули» как текст на бумагах/досках
export function scrib(g, x, y, w, rows, gap, col = OL, lw = 3, seed = 1) { const r = rng(seed); g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; for (let i = 0; i < rows; i++) { const ww = w * (0.55 + r() * 0.45); g.beginPath(); let px = x; g.moveTo(px, y + i * gap); while (px < x + ww) { px += 8 + r() * 10; g.lineTo(px, y + i * gap + (r() - 0.5) * 6); } g.stroke(); } g.restore(); }

// ------------------------------------------------------------------ время по словам озвучки (сек от начала шота)
export const W = (info, word, fb, after = -0.3) => { if (typeof word === 'number') return word; const v = wt(word, info.shot.start + after); return v != null ? v - info.shot.start : fb ?? 0; };

// ------------------------------------------------------------------ персонаж
export const SK = { a: '#f1c8a2', b: '#e2b087', c: '#c98d62' };
const EXPR = {
  neutral: { bl: 0, br: 0, ey: 1, m: 0.15 }, worried: { bl: 9, br: 9, ey: 1.05, m: -0.35 }, angry: { bl: -12, br: -12, ey: 0.9, m: -0.3 },
  shock: { bl: 14, br: 14, ey: 1.3, m: 0, o: 1 }, laugh: { bl: 4, br: 4, ey: 1, m: 0.9, arc: 1 }, calm: { bl: 0, br: 0, ey: 1, m: 0.35, arc: 1 }, smile: { bl: 2, br: 2, ey: 1, m: 0.7 }, sad: { bl: 10, br: 10, ey: 0.95, m: -0.6 }, tired: { bl: 0, br: 0, ey: 0.75, m: -0.1 }, focus: { bl: -5, br: -5, ey: 0.85, m: -0.1 },
};
// руки: IK по точке кисти; bend ±1 — куда сгиб локтя
function arm(g, sx, sy, hx, hy, bend, s, o, hold) {
  const L1 = 92, L2 = 88; let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy); const mx = L1 + L2 - 2; if (d > mx) { hx = sx + dx / d * mx; hy = sy + dy / d * mx; d = mx; }
  const a = Math.atan2(hy - sy, hx - sx), c = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * Math.max(d, 1)), -1, 1), an = a + bend * Math.acos(c);
  const ex = sx + Math.cos(an) * L1, ey = sy + Math.sin(an) * L1;
  // рукав: толстая линия цвета куртки до локтя
  ln(g, [[sx, sy], [ex, ey]], 30, OL); ln(g, [[sx, sy], [ex, ey]], 21, o.coat);
  ln(g, [[ex, ey], [hx, hy]], 28, OL); ln(g, [[ex, ey], [hx, hy]], 19, o.coat);
  el(g, hx + (hx - ex) * 0.12, hy + (hy - ey) * 0.12, 16, 15, o.skin, 4);
  if (hold) hold(g, hx, hy);
}
const POSE = {
  idle: [[-100, -170, 1], [100, -170, -1]], desk: [[-70, -215, 1], [75, -215, -1]], write: [[-70, -215, 1], [40, -210, -1]],
  phone: [[-100, -175, 1], [92, -432, 1]], phoneL: [[-92, -432, -1], [100, -175, -1]], point: [[-100, -175, 1], [235, -330, 1]], chin: [[-100, -175, 1], [22, -372, -1]],
  shrug: [[-165, -300, -1], [165, -300, 1]], hips: [[-95, -190, -1], [95, -190, 1]], tea: [[-100, -175, 1], [62, -255, -1]], hover: [[-100, -175, 1], [120, -215, -1]],
  reach: [[-100, -175, 1], [175, -250, -1]], wipe: [[-100, -175, 1], [-20, -470, -1]], back: [[-120, -230, 1], [120, -230, -1]],
  // новые позы (анимируются через motion.js poseAt): обе руки вверх, «тсс», взмах, объятие, держать перед собой, поднять вверх, стук, стрижка, закрыть лицо
  cheer: [[-150, -540, -1], [150, -540, 1]], hush: [[-100, -175, 1], [12, -380, -1]], wave: [[-100, -175, 1], [190, -500, 1]], hug: [[-30, -250, 1], [150, -250, -1]],
  hold: [[-100, -175, 1], [135, -265, -1]], hold2: [[-60, -255, 1], [135, -265, -1]], up: [[-100, -175, 1], [150, -470, -1]], knock: [[-100, -175, 1], [205, -360, 1]],
  cut: [[-40, -300, 1], [150, -420, -1]], face: [[-30, -390, 1], [30, -390, -1]], sweep: [[60, -200, 1], [130, -240, -1]], fist: [[-100, -175, 1], [8, -330, -1]],
};
function hair(g, o, f) {
  const c = o.hairC || '#3e2c22';
  if (o.hair === 'curly') {
    const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.02 + i * 0.08); pts.push([Math.cos(a) * 104, -440 + Math.sin(a) * 108]); }
    pts.push([-40, -540], [10, -548], [55, -538]);
    g.save(); pts.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.lineWidth = LWD * 2; g.strokeStyle = OL; g.stroke(); }); g.fillStyle = c; pts.forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.fill(); }); g.beginPath(); g.ellipse(0, -470, 98, 70, 0, Math.PI, 0); g.fill();
    g.strokeStyle = shade(c, 0.25); g.lineWidth = 3; pts.forEach(([x, y], i) => { if (i % 2) { g.beginPath(); g.arc(x + 4, y + 2, 12, 3.6, 5.6); g.stroke(); } }); g.restore();
  } else if (o.hair === 'side') {
    // зачёс набок: линия роста волос высоко, прядь уходит вправо, короткие виски
    g.beginPath(); g.moveTo(-106, -436); g.bezierCurveTo(-120, -520, -60, -570, 4, -566); g.bezierCurveTo(78, -564, 124, -520, 106, -440);
    g.bezierCurveTo(100, -470, 92, -488, 74, -500); g.bezierCurveTo(40, -486, 0 + f, -500, -24 + f, -522); g.bezierCurveTo(-50 + f, -506, -84, -490, -96, -466); g.closePath(); fo(g, vg(g, -570, 140, c, 0.22));
    g.beginPath(); g.moveTo(-24 + f, -522); g.bezierCurveTo(10 + f, -548, 70, -540, 98, -496); g.lineWidth = 3.5; g.strokeStyle = shade(c, 0.3); g.stroke();
    g.beginPath(); g.moveTo(-10 + f, -546); g.bezierCurveTo(30 + f, -560, 80, -546, 104, -510); g.stroke();
  } else if (o.hair === 'long' || o.hair === 'bob') {
    g.beginPath(); g.moveTo(-108, -430); g.bezierCurveTo(-118, -540, -40, -572, 10, -566); g.bezierCurveTo(80, -562, 122, -520, 108, -430); g.bezierCurveTo(96, -488, 40, -500, 8 + f, -478); g.bezierCurveTo(-30 + f, -506, -90, -490, -108, -430); g.closePath(); fo(g, vg(g, -570, 140, c, 0.2));
  } else if (o.hair === 'beanie') {
    g.beginPath(); g.moveTo(-110, -466); g.bezierCurveTo(-112, -600, 112, -600, 110, -466); g.closePath(); fo(g, vg(g, -600, 140, o.hatC || '#c8453a', 0.15)); bx(g, -116, -490, 232, 40, shade(o.hatC || '#c8453a', -0.15), 14, 5); el(g, 0, -592, 24, 22, '#f2ece0', 4);
  } else if (o.hair === 'bald') {
    g.save(); g.globalAlpha = 0.5; g.beginPath(); g.ellipse(-96, -440, 14, 30, 0, 0, Math.PI * 2); g.fillStyle = c; g.fill(); g.beginPath(); g.ellipse(96, -440, 14, 30, 0, 0, Math.PI * 2); g.fill(); g.restore();
  } else if (o.hair === 'buzz') {
    g.beginPath(); g.moveTo(-100, -440); g.bezierCurveTo(-104, -530, 104, -530, 100, -440); g.bezierCurveTo(90, -490, -90, -490, -100, -440); g.closePath(); fo(g, c, 4);
  } else if (o.hair === 'cap') { // фуражка
    g.beginPath(); g.ellipse(0, -515, 112, 34, 0, 0, Math.PI * 2); fo(g, o.capC || '#5d6a4c'); bx(g, -96, -560, 192, 50, o.capC || '#5d6a4c', 18); ln(g, [[-96, -520], [96, -520]], 9, '#b33a2c'); el(g, 0, -540, 13, 13, '#e0b33a', 3); g.beginPath(); g.ellipse(0, -505, 110, 18, 0, 0, Math.PI); fo(g, '#2a2a22', 4);
  }
}
export function fig(g, x, y, s, o, t) {
  o = { skin: SK.a, coat: '#5f6b4f', shirt: '#e3dcc2', tie: '#33352a', hair: 'side', expr: 'neutral', pose: 'idle', look: 0, turn: 0, ...o };
  const ex = EXPR[o.expr] || EXPR.neutral, f = o.turn * 26, seed = o.seed ?? 1;
  const br = Math.sin(t * 2.1 + seed) * 0.008, bob = Math.sin(t * 2.1 + seed) * 2;
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s);
  if (!o.noShadow) blob(g, 0, 0, 120 * (1 - clamp((o.lift || 0) / 400) * 0.5), 22, 0.3);
  if (o.lift) g.translate(0, -o.lift);
  if (!o.seated && o.step == null) { ln(g, [[-34, -140], [-38, -10]], 11); ln(g, [[34, -140], [38, -10]], 11); el(g, -46, -4, 24, 12, '#1d1c1a', 3); el(g, 46, -4, 24, 12, '#1d1c1a', 3); }
  else if (!o.seated) { const ph = o.step, up = Math.abs(Math.sin(ph)) * 7; g.translate(0, -up); [[-1, 0], [1, Math.PI]].forEach(([sd, d]) => { const sw = Math.sin(ph + d), fx = sd * 30 + sw * 46, fy = -10 + up - Math.max(0, Math.cos(ph + d)) * 20; ln(g, [[sd * 34, -140], [fx, fy]], 11); el(g, fx - 8 * sd + sw * 4, fy + 6, 24, 12, '#1d1c1a', 3); }); }
  g.translate(0, bob);
  if (o.bow) { g.translate(0, -140); g.rotate(o.bow); g.translate(0, 140); }
  if (o.pack) { rr(g, -88, -400, 176, 250, 34); fo(g, vg(g, -400, 250, o.pack, 0.2)); rr(g, -118, -446, 236, 52, 26); fo(g, vg(g, -446, 52, '#d9c9a0', 0.2)); ln(g, [[-60, -446], [-60, -394]], 4, '#8a7a50'); ln(g, [[60, -446], [60, -394]], 4, '#8a7a50'); }
  g.save(); g.translate(0, -140); g.scale(1, 1 + br); g.translate(0, 140);
  // торс
  g.beginPath(); g.moveTo(-60, -336); g.bezierCurveTo(-98, -330, -100, -250, -95, -175); g.quadraticCurveTo(-92, -136, -58, -134); g.lineTo(58, -134); g.quadraticCurveTo(92, -136, 95, -175); g.bezierCurveTo(100, -250, 98, -330, 60, -336); g.closePath();
  fo(g, hg(g, -100, 200, o.coat, 0.16));
  const BODY = o.body || 'uniform';
  if (BODY === 'uniform') {
    // рубашка, галстук, отвороты
    pg(g, [[-30, -336], [30, -336], [0 + f * 0.3, -262]], o.shirt, 4); pg(g, [[-9 + f * 0.3, -318], [9 + f * 0.3, -318], [11 + f * 0.3, -262], [0 + f * 0.3, -246], [-11 + f * 0.3, -262]], o.tie, 3);
    pg(g, [[-30, -336], [-50, -322], [-8 + f * 0.3, -250]], shade(o.coat, -0.06), 4); pg(g, [[30, -336], [50, -322], [8 + f * 0.3, -250]], shade(o.coat, -0.1), 4);
    ln(g, [[f * 0.3, -250], [f * 0.3, -140]], 3, shade(o.coat, -0.35));
    [-222, -186, -152].forEach((yy) => el(g, 14 + f * 0.3, yy, 6, 6, '#d8b44a', 2.5));
    ln(g, [[-72, -268], [-34, -266]], 3, shade(o.coat, -0.35)); ln(g, [[34, -266], [72, -268]], 3, shade(o.coat, -0.35));
    if (o.boards !== false) { g.save(); g.translate(-66, -333); g.rotate(0.18); bx(g, -26, -9, 52, 18, '#c7a23e', 4, 3); ln(g, [[-18, 0], [18, 0]], 2.5, '#8a2a22'); g.restore(); g.save(); g.translate(66, -333); g.rotate(-0.18); bx(g, -26, -9, 52, 18, '#c7a23e', 4, 3); ln(g, [[-18, 0], [18, 0]], 2.5, '#8a2a22'); g.restore(); }
    if (o.medal) el(g, -48, -268, 9, 9, '#e0b33a', 3);
  
  } else if (BODY === 'sweater' || BODY === 'tee') {
    g.beginPath(); g.ellipse(0, -334, 40, 13, 0, 0, Math.PI * 2); fo(g, shade(o.coat, -0.12), 4);
    ln(g, [[-92, -160], [92, -160]], 3, shade(o.coat, -0.3)); if (BODY === 'sweater') for (let k = -60; k <= 60; k += 30) ln(g, [[k, -150], [k, -138]], 3, shade(o.coat, -0.25));
    if (o.print) { el(g, 0 + f * 0.3, -250, 26, 26, o.print, 3); }
  } else if (BODY === 'parka') {
    for (let yy = -300; yy > -340; yy -= 100) {} [-290, -245, -200, -160].forEach((yy) => ln(g, [[-94, yy], [94, yy]], 3, shade(o.coat, -0.28)));
    ln(g, [[f * 0.3, -330], [f * 0.3, -138]], 4, shade(o.coat, -0.4)); g.beginPath(); g.ellipse(0, -336, 58, 18, 0, 0, Math.PI * 2); fo(g, o.fur || '#e9e2d2', 4);
    if (o.patch) { bx(g, -70, -290, 44, 28, '#ffffff', 4, 3); el(g, -48, -276, 8, 8, o.patch, 0); }
  } else if (BODY === 'perahan') {
    g.beginPath(); g.moveTo(-92, -200); g.lineTo(-104, -70); g.lineTo(104, -70); g.lineTo(92, -200); g.closePath(); fo(g, hg(g, -104, 208, o.coat, 0.14)); ln(g, [[0, -160], [0, -70]], 3, shade(o.coat, -0.3));
    g.beginPath(); g.ellipse(0, -334, 34, 10, 0, 0, Math.PI * 2); fo(g, shade(o.coat, -0.1), 3); ln(g, [[f * 0.3, -330], [f * 0.3, -270]], 3, shade(o.coat, -0.3));
    if (o.vest) { pg(g, [[-60, -336], [-96, -320], [-94, -190], [-18, -190], [-18, -300]], hg(g, -96, 80, o.vest, 0.12), 4); pg(g, [[60, -336], [96, -320], [94, -190], [18, -190], [18, -300]], hg(g, 18, 80, o.vest, 0.12), 4); }
  } else if (BODY === 'dress') {
    g.beginPath(); g.moveTo(-90, -200); g.lineTo(-128, -40); g.quadraticCurveTo(0, -20, 128, -40); g.lineTo(90, -200); g.closePath(); fo(g, hg(g, -128, 256, o.coat, 0.16));
    g.beginPath(); g.ellipse(0, -334, 36, 11, 0, 0, Math.PI * 2); fo(g, o.shirt, 3); ln(g, [[-92, -200], [92, -200]], 3, shade(o.coat, -0.3));
  }
  if (o.pack) { ln(g, [[-58, -334], [-62, -180]], 13, OL); ln(g, [[-58, -334], [-62, -180]], 7, shade(o.pack, -0.1)); ln(g, [[58, -334], [62, -180]], 13, OL); ln(g, [[58, -334], [62, -180]], 7, shade(o.pack, -0.1)); }
  g.restore();
  // голова
  const hy = -440; g.save(); g.translate(0, hy); g.rotate((o.tilt ?? 0) + noise(t * 0.4, seed) * 0.02); g.translate(0, -hy);
  ln(g, [[-16, -350], [-16, -334]], 4); ln(g, [[16, -350], [16, -334]], 4);
  if (o.hair === 'long' || o.hair === 'bob') { g.beginPath(); g.moveTo(-120, -450); g.bezierCurveTo(-140, -580, 140, -580, 120, -450); g.lineTo(o.hair === 'long' ? 128 : 116, o.hair === 'long' ? -300 : -380); g.quadraticCurveTo(0, o.hair === 'long' ? -280 : -360, o.hair === 'long' ? -128 : -116, o.hair === 'long' ? -300 : -380); g.closePath(); fo(g, vg(g, -580, 300, o.hairC || '#5a3a22', 0.2)); }
  if (o.scarf) { g.beginPath(); g.ellipse(0, -346, 92, 30, 0, 0, Math.PI * 2); fo(g, shade(o.scarf, -0.08), 4); g.beginPath(); g.moveTo(-124, -440); g.bezierCurveTo(-140, -590, 140, -590, 124, -440); g.lineTo(o.scarfLong ? 150 : 120, o.scarfLong ? -150 : -300); g.quadraticCurveTo(0, o.scarfLong ? -120 : -280, o.scarfLong ? -150 : -120, o.scarfLong ? -150 : -300); g.closePath(); fo(g, vg(g, -590, 440, o.scarf, 0.16)); }
  if (o.hood) { g.beginPath(); g.ellipse(0, -440, 140, 146, 0, 0, Math.PI * 2); fo(g, vg(g, -586, 292, o.coat, 0.2)); g.beginPath(); g.ellipse(0, -440, 128, 134, 0, 0, Math.PI * 2); g.lineWidth = 22; g.strokeStyle = o.fur || '#e9e2d2'; g.stroke(); }
  if (!o.hood && !o.scarf) { el(g, -106 + f * 0.5, -432, 18, 24, o.skin, 4); el(g, 106 + f * 0.5, -432, 18, 24, o.skin, 4); }
  g.beginPath(); g.ellipse(0, hy, 108, 114, 0, 0, Math.PI * 2); const hgd = g.createLinearGradient(-108, 0, 108, 0); hgd.addColorStop(0, shade(o.skin, 0.04)); hgd.addColorStop(0.62, o.skin); hgd.addColorStop(1, shade(o.skin, -0.14)); fo(g, hgd);
  g.save(); g.globalAlpha = 0.1; el(g, -55 + f, -400, 20, 12, '#e8806a', 0); el(g, 55 + f, -400, 20, 12, '#e8806a', 0); g.restore();
  if (o.stubble) { g.save(); g.globalAlpha = 0.12; g.beginPath(); g.ellipse(f * 0.5, -372, 78, 44, 0, 0, Math.PI); g.fillStyle = '#3a2a20'; g.fill(); g.restore(); }
  hair(g, o, f);
  if (o.scarf) { g.beginPath(); g.moveTo(-122, -400); g.bezierCurveTo(-138, -600, 138, -600, 122, -400); g.lineTo(98, -410); g.bezierCurveTo(100, -520, 40, -540, 0, -540); g.bezierCurveTo(-40, -540, -100, -520, -98, -410); g.closePath(); fo(g, vg(g, -600, 200, o.scarf, 0.12)); }
  if (o.pakol) { g.beginPath(); g.ellipse(0, -540, 116, 44, 0, 0, Math.PI * 2); fo(g, vg(g, -584, 88, o.pakol, 0.15)); g.beginPath(); g.ellipse(0, -556, 104, 30, 0, Math.PI, 0); fo(g, shade(o.pakol, 0.08), 4); ln(g, [[-110, -530], [110, -530]], 3, shade(o.pakol, -0.25)); }
  if (o.beard) { g.beginPath(); g.moveTo(-96 + f * 0.4, -420); g.quadraticCurveTo(-90 + f, -320, f, -318); g.quadraticCurveTo(90 + f, -320, 96 + f * 0.4, -420); g.quadraticCurveTo(50 + f, -380, f, -392); g.quadraticCurveTo(-50 + f, -380, -96 + f * 0.4, -420); g.closePath(); fo(g, vg(g, -420, 100, o.beardC || o.hairC || '#4a3426', 0.15), 4); }
  // глаза
  const blink = ((t + seed * 1.7) % 3.6) < 0.12 ? 0.12 : 1, ey = ex.ey * blink, lx = clamp(o.look, -1, 1) * 6 + f * 0.25, ly = (o.lookY ?? 0) * 5;
  if (ex.arc || o.eyesShut) [-34, 34].forEach((dx) => { g.beginPath(); if (ex.arc && !o.eyesShut) g.arc(dx + f, -440, 15, Math.PI * 1.1, Math.PI * 1.9); else g.arc(dx + f, -452, 15, Math.PI * 0.15, Math.PI * 0.85); g.lineWidth = 5; g.strokeStyle = OL; g.lineCap = 'round'; g.stroke(); });
  else [-34, 34].forEach((dx, i) => { g.save(); g.translate(dx + f, -448); g.scale(1, ey); g.beginPath(); g.ellipse(0, 0, 15, 17, 0, 0, Math.PI * 2); fo(g, '#fbf8f1', 3.5); el(g, lx, ly + 1, 7.5, 8.5, '#1a1614', 0); el(g, lx + 2.5, ly - 2.5, 2.4, 2.4, '#fff', 0); g.restore(); });
  // брови
  const bw = o.brow ?? 7; ln(g, [[-54 + f, -478 - ex.bl * 0 - 4], [-16 + f, -480 - ex.bl]], bw, o.browC || shade(o.hairC || '#3e2c22', -0.1)); ln(g, [[54 + f, -478 - 4], [16 + f, -480 - ex.br]], bw, o.browC || shade(o.hairC || '#3e2c22', -0.1));
  if (o.glasses) { g.save(); g.lineWidth = 4; g.strokeStyle = '#3a2b22'; g.beginPath(); g.arc(-34 + f, -448, 27, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(34 + f, -448, 27, 0, Math.PI * 2); g.stroke(); ln(g, [[-7 + f, -452], [7 + f, -452]], 4, '#3a2b22'); g.restore(); }
  // нос
  g.beginPath(); g.moveTo(f * 1.15 - 4, -432); g.quadraticCurveTo(f * 1.15 + 12, -416, f * 1.15 - 2, -408); g.lineWidth = 4; g.strokeStyle = shade(o.skin, -0.4); g.lineCap = 'round'; g.stroke();
  // рот
  const talk = o.talk ? Math.max(0, 0.25 + 0.75 * Math.abs(Math.sin(t * 11 + noise(t * 3, seed) * 2))) : 0;
  const mo = Math.max(talk, ex.o ? 0.9 : 0, o.mouth ?? 0), mx = f * 1.05, my = -382;
  if (mo > 0.12) { g.beginPath(); g.ellipse(mx, my, ex.o ? 16 : 22, 6 + 16 * mo, 0, 0, Math.PI * 2); fo(g, '#5a1f1c', 4); g.save(); g.clip(); el(g, mx, my + 12 * mo, 14, 8, '#d0585a', 0); g.fillStyle = '#fff'; g.fillRect(mx - 16, my - 6 - 16 * mo, 32, 9); g.restore(); }
  else { const c = ex.m * 12; g.beginPath(); g.moveTo(mx - 22, my - c * 0.3); g.quadraticCurveTo(mx, my + c, mx + 22, my - c * 0.3); g.lineWidth = 4.5; g.strokeStyle = OL; g.lineCap = 'round'; g.stroke(); }
  if (o.tear) { const k = (t * 0.5) % 1; g.save(); g.globalAlpha = o.tear * (1 - k * 0.5); g.beginPath(); const sx = -34 + f, sy = -424 + k * 60; g.moveTo(sx, sy - 12); g.quadraticCurveTo(sx + 9, sy + 4, sx, sy + 8); g.quadraticCurveTo(sx - 9, sy + 4, sx, sy - 12); fo(g, '#bfe6ff', 3); g.restore(); }
  if (o.veil > 0) { const top = lerp(-332, -424, clamp(o.veil)), vc = o.veilC || o.scarf || '#3a3a4a'; g.save(); g.beginPath(); g.ellipse(0, hy, 112, 118, 0, 0, Math.PI * 2); g.clip(); g.beginPath(); g.moveTo(-130, top + 10); g.quadraticCurveTo(f, top - 8, 130, top + 10); g.lineTo(130, -300); g.lineTo(-130, -300); g.closePath(); fo(g, vg(g, top, 120, vc, 0.12), 0); g.beginPath(); g.moveTo(-130, top + 10); g.quadraticCurveTo(f, top - 8, 130, top + 10); g.lineWidth = 5; g.strokeStyle = OL; g.stroke(); for (let k = -1; k <= 1; k++) ln(g, [[k * 40 + f * 0.5, top + 16], [k * 46 + f * 0.5, -334]], 3, shade(vc, -0.25)); g.restore(); if (top < -336) { g.beginPath(); g.moveTo(-96, -350); g.quadraticCurveTo(0, -300, 96, -350); g.lineTo(80, -316); g.quadraticCurveTo(0, -282, -80, -316); g.closePath(); fo(g, vg(g, -350, 60, vc, 0.12), 4); } }
  if (o.sweat) { const k = (t * 0.7) % 1; g.save(); g.globalAlpha = 1 - k * 0.6; g.beginPath(); const sx = 92, sy = -500 + k * 70; g.moveTo(sx, sy - 14); g.quadraticCurveTo(sx + 11, sy + 4, sx, sy + 9); g.quadraticCurveTo(sx - 11, sy + 4, sx, sy - 14); fo(g, '#bfe6ff', 3); g.restore(); }
  if (o.hair === 'helmet') { g.beginPath(); g.arc(0, -446, 150, 0, Math.PI * 2); g.fillStyle = 'rgba(190,225,255,.22)'; g.fill(); g.lineWidth = 8; g.strokeStyle = OL; g.stroke(); g.beginPath(); g.arc(-40, -500, 70, 3.6, 4.6); g.lineWidth = 10; g.strokeStyle = 'rgba(255,255,255,.7)'; g.stroke(); bx(g, -90, -310, 180, 26, '#c8c2b4', 10, 4); }
  g.restore();
  // руки
  const P = typeof o.pose === 'string' ? POSE[o.pose] || POSE.idle : o.pose; const sh = [[-84, -318], [84, -318]];
  const jit = o.shake ? Math.sin(t * 40) * 3 : 0;
  P.forEach(([hx, hy2, b], i) => arm(g, sh[i][0], sh[i][1], hx + (i ? jit : 0), hy2 + (i ? jit * 0.5 : 0) + bob * 0, b, s, o, i === 1 ? o.holdR : o.holdL));
  g.restore();
}
// предметы в руке
export const handset = (g, x, y) => { g.save(); g.translate(x - 8, y + 6); g.rotate(-0.5); bx(g, -16, -58, 32, 116, '#d9cfb8', 14, 4); el(g, 0, -60, 26, 18, '#d9cfb8', 4); el(g, 0, 60, 26, 18, '#d9cfb8', 4); g.restore(); };
export const teaGlass = (g, x, y) => { g.save(); g.translate(x + 10, y - 10); pg(g, [[-22, -50], [22, -50], [18, 20], [-18, 20]], 'rgba(200,120,60,.75)', 3); bx(g, -24, -10, 48, 34, '#b8a06a', 6, 3); for (let i = -14; i <= 14; i += 9) ln(g, [[i, -6], [i, 20]], 2, '#7c6634'); ln(g, [[24, -4], [38, 0], [36, 18], [22, 18]], 4); g.restore(); };
export const baby = (g, x, y) => { g.save(); g.translate(x - 60, y - 10); g.rotate(-0.2); g.beginPath(); g.ellipse(0, 0, 78, 46, 0, 0, Math.PI * 2); fo(g, vg(g, -46, 92, '#f2e2b8', 0.15), 4); el(g, 46, -6, 30, 30, SK.a, 4); g.beginPath(); g.ellipse(46, -16, 32, 22, 0, Math.PI, 0); fo(g, '#e8b8c8', 3); ln(g, [[38, -4], [44, -4]], 3); ln(g, [[52, -4], [58, -4]], 3); g.restore(); };
export const notes = (g, x, y) => { g.save(); g.translate(x + 6, y - 20); g.rotate(-0.15); bx(g, -34, -46, 68, 92, '#f4efe2', 4, 4); scrib(g, -24, -30, 48, 5, 14, '#5a5a6a', 2, 3); g.restore(); };
export const pen = (g, x, y) => { ln(g, [[x - 6, y + 10], [x + 26, y - 30]], 7, '#2a3a8a'); };

// ------------------------------------------------------------------ диалог: текст печатается над говорящим (белый с контуром + «хвостик»)
export function say(g, str, x, y, t, t0, o = {}) {
  if (t < t0) return false; const cps = o.cps ?? 20, n = Math.min(str.length, Math.floor((t - t0) * cps) + 1), s = str.slice(0, n), size = o.size ?? 72;
  const until = o.until ?? 1e9; if (t > until) return false;
  g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0); g.font = `700 ${size}px "${HAND}"`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const full = g.measureText(str).width; let cx = clamp(x, full / 2 + 40, E.W - full / 2 - 40); const lx = cx - full / 2;
  g.globalAlpha = clamp((t - t0) * 6) * (o.fade != null ? clamp((o.fade - t) * 4) : 1);
  if (o.bubble) { const w = full + size * 0.9, h = size * 1.35; rr(g, cx - w / 2, y - h / 2, w, h, h / 2); fo(g, '#ffffff', 4); g.beginPath(); g.moveTo(x - 14, y + h / 2 - 2); g.lineTo(o.tx ?? x, o.ty ?? y + h / 2 + 34); g.lineTo(x + 18, y + h / 2 - 2); fo(g, '#ffffff', 0); ln(g, [[x - 14, y + h / 2], [o.tx ?? x, o.ty ?? y + h / 2 + 34], [x + 18, y + h / 2]], 4); g.textAlign = 'left'; g.fillStyle = OL; g.fillText(s, lx, y + 3); }
  else { g.textAlign = 'left'; g.lineJoin = 'round'; g.lineWidth = size * 0.16; g.strokeStyle = '#141212'; g.strokeText(s, lx, y); g.fillStyle = o.col || '#ffffff'; g.fillText(s, lx, y); if (o.tick !== false) ln(g, [[o.tx ?? x, y + size * 0.48], [(o.tx ?? x) + 9, y + size * 0.78]], 6, '#141212'), ln(g, [[o.tx ?? x, y + size * 0.48], [(o.tx ?? x) + 9, y + size * 0.78]], 3, '#ffffff'); }
  g.restore(); return n < str.length || t - t0 < str.length / cps + 0.25;
}
// чёрная карточка: строки печатаются по очереди
export function typeCard(g, lines, t, o = {}) {
  g.fillStyle = '#060606'; g.fillRect(-10, -10, E.W + 20, E.H + 20);
  lines.forEach((L, i) => { const t0 = L.at ?? i * 1.2; if (t < t0) return; const n = Math.min(L.t.length, Math.floor((t - t0) * (L.cps ?? 22)) + 1); g.save(); g.font = `700 ${L.size ?? 100}px "${HAND}"`; g.textAlign = 'left'; g.textBaseline = 'middle'; const w = g.measureText(L.t).width; g.fillStyle = L.col || '#f4f1ea'; g.fillText(L.t.slice(0, n), (L.x ?? 960) - w / 2, L.y ?? 540); g.restore(); });
}
export const camKey = (t, keys) => { if (t <= keys[0][0]) return keys[0]; for (let i = 1; i < keys.length; i++) { const a = keys[i - 1], b = keys[i]; if (t <= b[0]) { const k = ease.inOut((t - a[0]) / Math.max(1e-6, b[0] - a[0])); return [t, lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]; } } return keys[keys.length - 1]; };
export function cam(g, t, keys, fn, shake = 0) { const [, cx, cy, z] = camKey(t, keys); const dx = noise(t * 0.35, 4) * 5 + (shake ? noise(t * 9, 2) * shake : 0), dy = noise(t * 0.3, 9) * 3 + (shake ? noise(t * 9, 5) * shake : 0); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-cx + dx, -cy + dy); fn(g); g.restore(); }
export function vignette(g, a = 0.4) { g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0); const v = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.4, E.W / 2, E.H / 2, E.W * 0.65); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(10,6,8,${a})`); g.fillStyle = v; g.fillRect(0, 0, E.W, E.H); g.restore(); }
export { E, OL, HAND, light, ease, clamp, lerp, noise, shade, alpha, rng, prog };
