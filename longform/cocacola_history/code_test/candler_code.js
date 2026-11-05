// Free code-only test (0 AI generations): the same 10 s as the puppet test — Asa Candler at his desk, 1899 — drawn entirely in code with a
// new level of detail: lit office with perspective, window light and beams, painted shading + rim light, a detailed face with continuous
// (not swapped) acting: brows, eyelids, eyes, mouth, head turn/tilt, breathing, two-segment arms with drawn hands.
// Sound: the puppet test's mix (same voice, same beats). Usage: node candler_code.js still t1,t2 out.png | video out.mp4
const { createCanvas } = require('@napi-rs/canvas'); const { spawn } = require('child_process'); const fs = require('fs');
const L = require('../../kit/look'); const { clamp, lerp, E } = L;
const W = 1920, H = 1080, FPS = 30, T = 10.0; const INK = '#1E1610';
const P = require('../puppet_test/puppet.js'); const tImp = P.at('impressed'), tMessy = P.at('messy'), tSoda = P.at('soda'), tBut = P.at('but'), tFine = P.at('fine');
const sm = (t, t0, d) => E.inOut(clamp((t - t0) / d)), win = (t, a, b, f = 0.25) => sm(t, a - f / 2, f) * (1 - sm(t, b - f / 2, f));
const lg = (ctx, x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rg = (ctx, x, y, r, st) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
function path(ctx, pts, close = true) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (close) ctx.closePath(); }
function fillInk(ctx, fill, lw = 4) { ctx.fillStyle = fill; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); } }
// ---------- the room (static parts cached) ----------
let ROOM = null;
function room() { const c = createCanvas(W, H), x = c.getContext('2d');
  // wall: warm wood panels with bevelled mouldings, lit from the window on the right
  x.fillStyle = lg(x, 0, 0, W, 0, [[0, '#3A2416'], [0.6, '#5A3820'], [1, '#7A4C2A']]); x.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { const px = 40 + i * 300, py = 470, pw = 250, ph = 210;
    x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(px, py, pw, ph); x.fillStyle = 'rgba(255,200,140,0.10)'; x.fillRect(px, py, pw, 5); x.fillRect(px, py, 5, ph); x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(px, py + ph - 5, pw, 5); x.fillRect(px + pw - 5, py, 5, ph); }
  x.fillStyle = '#2E1C10'; x.fillRect(0, 440, W, 18); x.fillStyle = 'rgba(255,210,150,0.18)'; x.fillRect(0, 440, W, 4);
  // bookshelf (left) with books of many colours, heights and gold bands
  path(x, [[40, 40], [560, 40], [560, 640], [40, 640]]); fillInk(x, '#3B2414', 5);
  for (let s = 0; s < 4; s++) { const sy = 70 + s * 140; x.fillStyle = '#24160C'; x.fillRect(60, sy, 480, 118); let bx = 66;
    while (bx < 530) { const v = L.hash(s * 31 + bx * 0.37), bw = 18 + v * 22, bh = 80 + v * 34, col = ['#7A2A22', '#2E4A3A', '#6A4A22', '#2A3450', '#8A6A2A', '#4A2A40', '#5A2A1A'][Math.floor(v * 7)];
      x.fillStyle = col; x.fillRect(bx, sy + 118 - bh, bw, bh); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(bx + bw - 4, sy + 118 - bh, 4, bh); x.fillStyle = '#C9A24A'; x.fillRect(bx + 3, sy + 118 - bh + 12, bw - 6, 3); x.fillRect(bx + 3, sy + 118 - 16, bw - 6, 3);
      x.strokeStyle = INK; x.lineWidth = 2; x.strokeRect(bx, sy + 118 - bh, bw, bh); bx += bw + 2; }
    x.fillStyle = '#5A3820'; x.fillRect(48, sy + 118, 504, 16); x.fillStyle = 'rgba(255,210,150,0.2)'; x.fillRect(48, sy + 118, 504, 3); }
  // gilded painting behind him
  path(x, [[650, 70], [1170, 70], [1170, 400], [650, 400]]); fillInk(x, lg(x, 650, 70, 1170, 400, [[0, '#E8C46A'], [0.5, '#A87A2A'], [1, '#E2B85A']]), 5);
  x.fillStyle = lg(x, 0, 96, 0, 374, [[0, '#9CC4E0'], [0.6, '#F2D8A8'], [1, '#C8A070']]); x.fillRect(680, 98, 460, 274);
  x.fillStyle = '#7A8A5A'; path(x, [[680, 320], [800, 270], [900, 300], [1020, 250], [1140, 300], [1140, 372], [680, 372]]); x.fill();
  x.fillStyle = '#B87A5A'; for (let i = 0; i < 9; i++) x.fillRect(720 + i * 45, 300 - L.hash(i) * 40, 34, 72); x.fillStyle = '#E8E0D0'; x.beginPath(); x.arc(930, 250, 30, Math.PI, 0); x.fill(); x.fillRect(900, 250, 60, 50);
  // tall window (right) with a city and a dome, mullions and curtains
  x.fillStyle = lg(x, 0, 60, 0, 700, [[0, '#7FB8E8'], [0.7, '#FFE2A8'], [1, '#FFC880']]); x.fillRect(1300, 60, 420, 640);
  x.fillStyle = '#D8B89A'; for (let i = 0; i < 8; i++) x.fillRect(1300 + i * 55, 520 - L.hash(i * 3) * 120, 50, 200); x.fillStyle = '#F2E2C8'; x.beginPath(); x.arc(1520, 430, 55, Math.PI, 0); x.fill(); x.fillRect(1465, 430, 110, 130);
  x.strokeStyle = '#3A2414'; x.lineWidth = 14; for (const mx of [1440, 1580]) { x.beginPath(); x.moveTo(mx, 60); x.lineTo(mx, 700); x.stroke(); } x.beginPath(); x.moveTo(1300, 300); x.lineTo(1720, 300); x.stroke(); x.strokeRect(1300, 60, 420, 640);
  for (const [cx, dir] of [[1260, 1], [1760, -1]]) { path(x, [[cx - 40 * dir, 40], [cx + 60 * dir, 40], [cx + 30 * dir, 720], [cx - 50 * dir, 720]]); fillInk(x, lg(x, cx - 50, 0, cx + 60, 0, [[0, '#2F4A36'], [0.5, '#3E6046'], [1, '#2A4030']]), 4); }
  // potted palm by the window
  x.fillStyle = '#8A6A3A'; path(x, [[1150, 640], [1250, 640], [1235, 720], [1165, 720]]); fillInk(x, '#B08A4A', 4);
  for (let i = 0; i < 9; i++) { const a = -2.6 + i * 0.32; x.save(); x.translate(1200, 640); x.rotate(a + Math.PI / 2); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(60, -40, 190, -10); x.quadraticCurveTo(60, 10, 0, 0); fillInk(x, i % 2 ? '#4A7A3A' : '#5E8E44', 3); x.restore(); }
  // the leather chair (behind Candler) with tufting
  path(x, [[700, 640], [690, 360], [720, 300], [1100, 300], [1130, 360], [1120, 640]]); fillInk(x, lg(x, 690, 0, 1130, 0, [[0, '#4A2214'], [0.55, '#7A3A22'], [1, '#9A5030']]), 6);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const bx = 745 + c * 66 + (r % 2) * 33, by = 345 + r * 70; x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.arc(bx, by, 6, 0, 6.28); x.fill(); x.fillStyle = 'rgba(255,200,150,0.25)'; x.beginPath(); x.arc(bx - 2, by - 2, 3, 0, 6.28); x.fill(); }
  ROOM = c; }
function desk(x, t) { // the desk in perspective (front, glossy top) with lamp, inkwell, quill and papers — drawn over Candler
  path(x, [[-40, 700], [1960, 690], [1960, 1080], [-40, 1080]]); x.fillStyle = lg(x, 0, 690, 0, 780, [[0, '#8A4A26'], [1, '#5A2E16']]); x.fill();
  path(x, [[-40, 690], [1960, 680], [1960, 760], [-40, 772]]); x.fillStyle = lg(x, 0, 680, W, 680, [[0, '#6A3418'], [0.6, '#9A5A2E'], [0.85, '#E8A868'], [1, '#B8743E']]); x.fill(); x.lineWidth = 5; x.strokeStyle = INK; x.stroke();
  x.save(); x.globalAlpha = 0.18; x.strokeStyle = '#3A1A0A'; x.lineWidth = 2; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(-40, 700 + i * 12); x.bezierCurveTo(600, 696 + i * 12, 1200, 702 + i * 12, 1960, 690 + i * 12); x.stroke(); } x.restore();
  x.fillStyle = lg(x, 0, 772, 0, 1080, [[0, '#4A2210'], [1, '#2A1408']]); x.fillRect(-40, 772, 2000, 310); for (let i = 0; i < 4; i++) { x.strokeStyle = '#2A1206'; x.lineWidth = 4; x.strokeRect(80 + i * 470, 810, 400, 230); x.fillStyle = 'rgba(255,190,120,0.08)'; x.fillRect(80 + i * 470, 810, 400, 4); }
  // reflection of the window on the desk top + warm light pool
  x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = rg(x, 1500, 720, 520, [[0, 'rgba(255,200,130,0.35)'], [1, 'rgba(255,180,100,0)']]); x.fillRect(900, 640, 1060, 200); x.restore();
  // papers
  path(x, [[1220, 712], [1440, 708], [1460, 742], [1236, 748]]); fillInk(x, '#F2E6CC', 3); path(x, [[1230, 704], [1450, 700], [1470, 734], [1246, 740]]); fillInk(x, '#F8EEDC', 3);
  // green banker's lamp
  x.fillStyle = '#B88A3A'; path(x, [[180, 740], [300, 740], [290, 720], [190, 720]]); fillInk(x, '#C9A04A', 3); x.fillRect(232, 560, 16, 160); x.strokeRect(232, 560, 16, 160);
  path(x, [[120, 570], [360, 570], [330, 500], [150, 500]]); fillInk(x, lg(x, 0, 500, 0, 570, [[0, '#2E7A3A'], [1, '#1A5A28']]), 4); x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = rg(x, 240, 600, 260, [[0, 'rgba(255,230,160,0.45)'], [1, 'rgba(255,220,140,0)']]); x.fillRect(0, 520, 520, 260); x.restore();
  // inkwell + quill (the feather sways slightly)
  path(x, [[470, 740], [560, 740], [550, 700], [480, 700]]); fillInk(x, '#1A1A22', 3); x.fillStyle = '#C9A24A'; x.fillRect(462, 736, 106, 10);
  x.save(); x.translate(515, 700); x.rotate(-0.5 + Math.sin(t * 1.3) * 0.03); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-30, -120, -10, -230); x.quadraticCurveTo(25, -120, 0, 0); fillInk(x, '#F4F0E8', 3); x.restore(); }
// ---------- Candler (continuous acting) ----------
const SKIN = '#EFC6A0', SKIN_SH = '#C98E66', SUIT = '#2A2C33', SUIT_HI = '#4A4E5A', HAIR = '#5A3E2A';
function hand(x, kind, s = 1) { // a drawn hand (palm, point, relaxed) at the wrist origin, pointing along +y
  x.save(); x.scale(s, s); x.fillStyle = SKIN; x.lineWidth = 3.5; x.strokeStyle = INK;
  x.beginPath(); x.ellipse(0, 26, 26, 30, 0, 0, 6.28); x.fill(); x.stroke();
  const fingers = kind === 'point' ? [[0, 1, 70]] : kind === 'palm' ? [[-18, 0.35, 42], [-6, 0.12, 48], [7, -0.1, 46], [19, -0.32, 38]] : [[-16, 0.2, 34], [-5, 0.06, 38], [6, -0.06, 36], [16, -0.2, 30]];
  for (const [fx, a, l] of fingers) { x.save(); x.translate(fx, 44); x.rotate(a + (kind === 'point' ? Math.PI : 0)); x.beginPath(); x.roundRect ? x.roundRect(-7, 0, 14, l, 7) : x.rect(-7, 0, 14, l); x.fill(); x.stroke(); x.restore(); }
  x.save(); x.translate(kind === 'palm' ? 26 : -22, 22); x.rotate(kind === 'palm' ? -1.0 : 0.9); x.beginPath(); x.roundRect ? x.roundRect(-7, 0, 15, 34, 7) : x.rect(-7, 0, 15, 34); x.fill(); x.stroke(); x.restore(); x.restore(); }
function arm(x, sx, sy, a1, a2, kind, side) { // shoulder -> elbow -> wrist with sleeve folds and cuff
  const l1 = 150, l2 = 140, ex = sx + Math.sin(a1) * l1, ey = sy + Math.cos(a1) * l1, wx = ex + Math.sin(a1 + a2) * l2, wy = ey + Math.cos(a1 + a2) * l2;
  for (const [ax, ay, bx, by, w] of [[sx, sy, ex, ey, 70], [ex, ey, wx, wy, 60]]) { x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.lineCap = 'round'; x.lineWidth = w + 9; x.strokeStyle = INK; x.stroke(); x.lineWidth = w; x.strokeStyle = SUIT; x.stroke();
    x.lineWidth = w * 0.35; x.strokeStyle = 'rgba(120,130,150,0.35)'; x.beginPath(); x.moveTo(ax + side * 12, ay); x.lineTo(bx + side * 12, by); x.stroke(); }
  x.save(); x.translate(wx, wy); x.rotate(-(a1 + a2)); x.fillStyle = '#F4F0E6'; x.fillRect(-26, -12, 52, 22); x.strokeStyle = INK; x.lineWidth = 3; x.strokeRect(-26, -12, 52, 22); hand(x, kind, 1.05); x.restore(); }
function face(x, A) { // head at origin (neck base at 0,0), facing camera; A = acting params
  x.save(); x.translate(A.turn * 10, 0); x.rotate(A.tilt);
  // neck + collar
  x.fillStyle = SKIN_SH; x.fillRect(-40, -90, 80, 90); x.fillStyle = '#F6F2EA'; path(x, [[-62, -40], [62, -40], [56, 6], [-56, 6]]); fillInk(x, '#F6F2EA', 4);
  const hx = A.turn * 14, hy = -250;
  // ears
  for (const sx of [-1, 1]) { x.beginPath(); x.ellipse(hx + sx * 138, hy + 10, 26, 40, 0, 0, 6.28); fillInk(x, sx > 0 ? SKIN : SKIN_SH, 4); }
  // head shape + painted shading (key light from the right)
  const head = () => { x.beginPath(); x.moveTo(hx - 132, hy - 20); x.bezierCurveTo(hx - 140, hy - 210, hx + 140, hy - 210, hx + 132, hy - 20); x.bezierCurveTo(hx + 128, hy + 120, hx + 60, hy + 175, hx, hy + 178); x.bezierCurveTo(hx - 60, hy + 175, hx - 128, hy + 120, hx - 132, hy - 20); x.closePath(); };
  head(); fillInk(x, lg(x, hx - 140, 0, hx + 140, 0, [[0, '#D8A27A'], [0.55, SKIN], [1, '#F8DCC0']]), 5);
  x.save(); head(); x.clip(); x.fillStyle = rg(x, hx + 40, hy - 150, 120, [[0, 'rgba(255,250,235,0.7)'], [1, 'rgba(255,250,235,0)']]); x.fillRect(hx - 140, hy - 220, 280, 200); x.restore();
  // side hair
  for (const sx of [-1, 1]) { x.beginPath(); x.moveTo(hx + sx * 134, hy + 20); x.bezierCurveTo(hx + sx * 150, hy - 80, hx + sx * 120, hy - 130, hx + sx * 82, hy - 120); x.bezierCurveTo(hx + sx * 100, hy - 70, hx + sx * 112, hy - 20, hx + sx * 116, hy + 30); x.closePath(); fillInk(x, HAIR, 3.5); }
  // forehead wrinkles when brows go up
  if (A.browUp > 0.2) { x.save(); x.globalAlpha = A.browUp; x.strokeStyle = SKIN_SH; x.lineWidth = 3.5; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(hx - 60, hy - 120 + i * 18); x.quadraticCurveTo(hx, hy - 130 + i * 18, hx + 60, hy - 120 + i * 18); x.stroke(); } x.restore(); }
  // eyes (look, eyelids), glasses with a moving glint
  for (const sx of [-1, 1]) { const ex = hx + sx * 52 + A.turn * 8, ey = hy - 24;
    x.save(); x.beginPath(); x.ellipse(ex, ey, 26, 22, 0, 0, 6.28); x.fillStyle = '#FFFFFF'; x.fill(); x.clip();
    x.fillStyle = '#6A4A2A'; x.beginPath(); x.arc(ex + A.lookX * 9, ey + A.lookY * 6, 13, 0, 6.28); x.fill(); x.fillStyle = '#140C08'; x.beginPath(); x.arc(ex + A.lookX * 9, ey + A.lookY * 6, 7, 0, 6.28); x.fill();
    x.fillStyle = '#FFF'; x.beginPath(); x.arc(ex + A.lookX * 9 - 4, ey + A.lookY * 6 - 5, 3.5, 0, 6.28); x.fill();
    const lid = clamp(A.lid + (sx > 0 ? A.squintR : 0)); x.fillStyle = SKIN; x.fillRect(ex - 30, ey - 26, 60, 48 * lid); x.restore();
    x.beginPath(); x.ellipse(ex, ey, 26, 22, 0, 0, 6.28); x.lineWidth = 3.5; x.strokeStyle = INK; x.stroke();
    if (lid > 0.05) { x.beginPath(); x.moveTo(ex - 26, ey - 22 + 44 * lid); x.lineTo(ex + 26, ey - 22 + 44 * lid); x.stroke(); }
    // eyebrow (raise / frown, each side)
    const br = A.browUp * 18 + (sx > 0 ? A.browR : 0) * 16, fr = A.frown * 12;
    x.beginPath(); x.moveTo(ex - 30, ey - 44 - br + (sx < 0 ? fr * 0.3 : fr)); x.quadraticCurveTo(ex, ey - 62 - br, ex + 30, ey - 46 - br + (sx > 0 ? fr * 0.3 : fr)); x.lineWidth = 11; x.lineCap = 'round'; x.strokeStyle = HAIR; x.stroke();
    x.beginPath(); x.arc(ex, ey, 38, 0, 6.28); x.lineWidth = 4.5; x.strokeStyle = '#B08A3A'; x.stroke(); x.save(); x.globalAlpha = 0.35 + 0.25 * Math.sin(A.t * 1.3 + sx); x.strokeStyle = '#FFF6E0'; x.lineWidth = 4; x.beginPath(); x.arc(ex, ey, 30, -2.4, -1.7); x.stroke(); x.restore(); }
  x.beginPath(); x.moveTo(hx - 14, hy - 24); x.quadraticCurveTo(hx, hy - 34, hx + 14, hy - 24); x.lineWidth = 4; x.strokeStyle = '#B08A3A'; x.stroke();
  // nose
  x.beginPath(); x.moveTo(hx + 4, hy - 10); x.bezierCurveTo(hx - 22, hy + 40, hx - 20, hy + 58, hx + 2, hy + 62); x.bezierCurveTo(hx + 20, hy + 64, hx + 28, hy + 52, hx + 20, hy + 44); fillInk(x, '#E8B48C', 4);
  // mouth (shapes blend by parameters): smile curve, open amount, round "o"
  const my = hy + 112; x.save(); x.translate(hx, my);
  if (A.open > 0.08 || A.oh > 0.08) { const ow = lerp(40, 22, A.oh) + A.smile * 14, oh = 10 + A.open * 26 + A.oh * 22; x.beginPath(); x.ellipse(0, 6, ow, oh, 0, 0, 6.28); fillInk(x, '#6A2020', 4); x.save(); x.clip(); x.fillStyle = '#C0505A'; x.beginPath(); x.ellipse(0, oh + 4, ow * 0.7, oh * 0.6, 0, 0, 6.28); x.fill(); x.restore(); }
  if (A.smile > 0.3 && A.open < 0.3) { x.beginPath(); x.moveTo(-46, -4); x.quadraticCurveTo(0, 40 * A.smile, 46, -4); x.quadraticCurveTo(0, 14, -46, -4); fillInk(x, '#FFFFFF', 4); }
  else if (A.open <= 0.08 && A.oh <= 0.08) { x.beginPath(); x.moveTo(-36, 6 - A.smile * 10); x.quadraticCurveTo(0, 6 + A.smile * 18 - A.frown * 10, 36, 6 - A.smile * 10); x.lineWidth = 5; x.strokeStyle = INK; x.stroke(); }
  x.restore();
  // full curled moustache (lifts with the smile)
  x.save(); x.translate(hx, hy + 84 - A.smile * 6); const mw = 1 + A.smile * 0.08;
  x.beginPath(); x.moveTo(0, -6); x.bezierCurveTo(-40, -22, -96, -14, -110, 18); x.bezierCurveTo(-118, 34, -100, 40, -96, 26); x.bezierCurveTo(-70, 16, -36, 22, 0, 14); x.bezierCurveTo(36, 22, 70, 16, 96, 26); x.bezierCurveTo(100, 40, 118, 34, 110, 18); x.bezierCurveTo(96, -14, 40, -22, 0, -6); x.closePath();
  x.scale(mw, 1); fillInk(x, lg(x, -110, 0, 110, 0, [[0, '#3A2414'], [0.5, '#5A3A22'], [1, '#7A5232']]), 4); x.restore();
  x.restore(); }
function acting(t) { // continuous parameters on the narration's beats
  const blink = [0.7, 3.4, 6.6, 9.3].reduce((m, b) => Math.max(m, clamp(1 - Math.abs(t - b - 0.07) / 0.09)), 0);
  const skept = win(t, tImp - 0.1, tSoda - 0.1, 0.3), happy = win(t, tSoda - 0.15, tBut, 0.3) + sm(t, tFine + 0.4, 0.4), surpr = win(t, tBut, tFine - 0.05, 0.25), finePuff = win(t, tFine - 0.05, tFine + 0.45, 0.15);
  return { t, lid: Math.max(blink, 0.15 + skept * 0.2), squintR: skept * 0.25 - surpr * 0.1, browUp: surpr * 1.0 + happy * 0.3, browR: skept * 0.9, frown: skept * 0.6,
    smile: Math.min(1, happy), open: finePuff * 0.8, oh: surpr * 0.9, lookX: -0.3 + 0.6 * Math.sin(t * 0.4) + skept * 0.4, lookY: -0.1 * surpr,
    turn: skept * -0.6 + happy * 0.3 + Math.sin(t * 0.7) * 0.15, tilt: -0.06 * skept + 0.05 * happy + Math.sin(t * 1.2) * 0.015 };
}
function candler(x, t) { const A = acting(t), shrug = Math.sin(clamp((t - (tFine - 0.15)) / 0.9) * Math.PI), breath = Math.sin(t * 2.2);
  const point = win(t, tMessy - 0.5, tSoda - 0.2, 0.35), palms = sm(t, tFine - 0.25, 0.3), lift = shrug * 16;
  x.save(); x.translate(910, 430 - lift + breath * 2); x.rotate(Math.sin(t * 0.9) * 0.01);
  // soft cast shadow on the chair (light from the right window)
  x.save(); x.globalAlpha = 0.25; x.fillStyle = '#000'; x.beginPath(); x.ellipse(-60, 120, 210, 240, 0, 0, 6.28); x.fill(); x.restore();
  // arms behind? left arm (viewer-left) hangs or opens; right arm hangs, points, or opens
  // angles: 0 = straight down; left arm opens to -x (negative), right arm to +x (positive)
  const aL1 = -lerp(0.2 + Math.sin(t * 1.3) * 0.03, 1.15, palms), aL2 = -lerp(-0.3, 0.95, palms);
  const aR1 = lerp(lerp(0.2 + Math.sin(t * 1.1) * 0.03, 0.75, point), 1.15, palms), aR2 = lerp(lerp(-0.3, 2.2 + Math.sin((t - tMessy) * 9) * 0.18 * (t < tMessy + 1.2 ? 1 : 0.25), point), 0.95, palms);
  // torso: jacket, waistcoat, shirt, tie, watch chain, painted light
  const torso = () => { x.beginPath(); x.moveTo(-190, 330); x.bezierCurveTo(-210, 120, -190, 40, -110, 20); x.lineTo(110, 20); x.bezierCurveTo(190, 40, 210, 120, 190, 330); x.closePath(); };
  torso(); fillInk(x, lg(x, -200, 0, 200, 0, [[0, '#1A1C22'], [0.6, SUIT], [1, SUIT_HI]]), 6);
  path(x, [[-52, 20], [52, 20], [70, 330], [-70, 330]]); fillInk(x, '#33363E', 4); // waistcoat
  for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(0, 150 + i * 40, 5, 0, 6.28); x.fillStyle = '#1A1A1E'; x.fill(); }
  x.beginPath(); x.moveTo(-50, 230); x.quadraticCurveTo(0, 270, 50, 230); x.lineWidth = 4; x.strokeStyle = '#D8B04A'; x.stroke();
  path(x, [[-40, 20], [40, 20], [0, 130]]); fillInk(x, '#F6F2EA', 3); path(x, [[-12, 24], [12, 24], [16, 110], [0, 128], [-16, 110]]); fillInk(x, '#2A1A1A', 3);
  path(x, [[-110, 20], [-40, 20], [-20, 170], [-90, 120]]); fillInk(x, '#22242A', 4); path(x, [[110, 20], [40, 20], [20, 170], [90, 120]]); fillInk(x, '#3A3E48', 4); // lapels
  x.save(); torso(); x.clip(); x.fillStyle = lg(x, 120, 0, 200, 0, [[0, 'rgba(255,200,140,0)'], [1, 'rgba(255,200,140,0.35)']]); x.fillRect(100, 0, 120, 340); x.restore(); // rim light
  arm(x, -160, 60, aL1, aL2, palms > 0.5 ? 'palm' : 'relaxed', -1);
  arm(x, 160, 60, aR1, aR2, palms > 0.5 ? 'palm' : point > 0.5 ? 'point' : 'relaxed', 1);
  // head on the neck
  x.save(); x.translate(0, 26); face(x, A); x.restore();
  x.restore(); }
function frame(ctx, t) { if (!ROOM) room();
  const k = E.inOut(clamp(t / T)), z = lerp(1.0, 1.18, k) * (t > tFine ? 1 + 0.02 * Math.sin(clamp((t - tFine) / 0.4) * Math.PI) : 1), cx = lerp(960, 930, k), cy = lerp(520, 470, k);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  ctx.drawImage(ROOM, 0, 0); candler(ctx, t); desk(ctx, t);
  // sunbeams + dust from the window
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(1320 + i * 90, 40); ctx.rotate(0.5); const g = lg(ctx, 0, 0, 0, 1100, [[0, `rgba(255,220,150,${0.09 * (0.8 + 0.2 * Math.sin(t + i))})`], [1, 'rgba(255,200,120,0)']]); ctx.fillStyle = g; ctx.fillRect(-35, 0, 70 + i * 10, 1100); ctx.restore(); }
  for (let i = 0; i < 50; i++) { const px = 900 + ((L.hash(i) * 900 + Math.sin(t * 0.3 + i) * 30) % 900), py = ((L.hash(i * 7) * 900 - t * (10 + L.hash(i * 3) * 12)) % 900 + 900) % 900; ctx.fillStyle = `rgba(255,236,200,${0.5 * Math.abs(Math.sin(t * 1.4 + i))})`; ctx.beginPath(); ctx.arc(px, py, 1.5 + L.hash(i * 2) * 2, 0, 6.28); ctx.fill(); }
  ctx.restore(); ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(15,6,0,0.42)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
if (require.main === module) (async () => {
  const [mode, a1, a2] = process.argv.slice(2); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(1920, 540 * Math.ceil(ts.length / 2)), sc = sh.getContext('2d');
    ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % 2) * 960, Math.floor(i / 2) * 540, 960, 540); sc.fillStyle = '#E8322E'; sc.font = '26px sans-serif'; sc.fillText(t.toFixed(2), (i % 2) * 960 + 8, Math.floor(i / 2) * 540 + 30); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < Math.round(T * FPS); f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
})();
