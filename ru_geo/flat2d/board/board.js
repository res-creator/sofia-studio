// Живая доска: линии рисуются по одной, текст пишется буква за буквой,
// печатная машинка на чёрном, счётчики цифр, ластик, камера едет за пером.
// Приёмы взяты из стилей Lemo-Opuscar «whiteboard» / «sketchnote», движок свой.
// Сцена задаётся массивом объектов; render(t) рисует кадр, events() отдаёт звуковые события.
(function () {
const W = 1920, H = 1080;
const C = { bg: '#0e0f13', ink: '#ecebe6', or: '#f0aa3c', bl: '#5aaae6', rd: '#e65a5a', gn: '#6ec882', sub: '#9a9ca4', yl: '#ffd640' };
const HAND = '"Caveat"', MONO = '"IBM Plex Mono"';
// ---------- утилиты ----------
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ease = u => u - Math.sin(2 * Math.PI * u) / (2 * Math.PI) * 0.8;       // медленно-быстро-медленно, как рука
const easeIO = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const prog = (t, a, b) => b <= a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a), 0, 1);
let seedN = 1;
// Ресемплинг полилинии с «дрожанием руки»
function wobble(pts, amp = 2.2, step = 6) {
  const r = rng(seedN++ * 7919), out = [];
  const ph1 = r() * 6.28, ph2 = r() * 6.28; let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / step));
    const nx = -(y1 - y0) / (L || 1), ny = (x1 - x0) / (L || 1);
    for (let k = 0; k < n; k++) {
      const u = k / n, s = acc + u * L;
      const w = amp * (Math.sin(s / 140 + ph1) * 0.8 + Math.sin(s / 37 + ph2) * 0.25);
      out.push([x0 + (x1 - x0) * u + nx * w, y0 + (y1 - y0) * u + ny * w]);
    }
    acc += L;
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function cum(p) { const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return c; }
// ---------- объекты ----------
const objs = [], evs = [], cams = [], cards = [];
let ctx, canvas, dust;
// Штрих (один росчерк). t0..t1 = когда рисуется.
function stroke(pts, t0, t1, o = {}) {
  const p = o.raw ? pts : wobble(pts, o.wob ?? 2.2);
  const ob = { type: 'stroke', p, c: cum(p), t0, t1, col: o.col || C.ink, w: o.w || 7, er: o.er, ghost: o.ghost ?? 0.07, clip: o.clip };
  objs.push(ob); if (!o.silent) evs.push({ k: 'chalk', t0, t1, x: p[0][0] }); return ob;
}
function line(a, b, t0, t1, o) { return stroke([a, b], t0, t1, o); }
function poly(pts, t0, t1, o) { return stroke(pts, t0, t1, o); }
function circle(cx, cy, r, t0, t1, o = {}) {
  const pts = [], a0 = -2.2, over = 0.35;                       // начинается под углом и заходит дальше замыкания
  for (let i = 0; i <= 64; i++) { const a = a0 + (2 * Math.PI + over) * i / 64; const rr = r * (1 + 0.04 * Math.sin(a * 2)); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * (o.sy || 1)]); }
  return stroke(pts, t0, t1, o);
}
function rect(x, y, w, h, t0, t1, o = {}) {                       // четыре штриха с небольшим перехлёстом углов
  const d = (t1 - t0) / 4, e = 6; const out = [];
  out.push(line([x - e, y], [x + w + e, y], t0, t0 + d, o));
  out.push(line([x + w, y - e], [x + w, y + h + e], t0 + d, t0 + 2 * d, o));
  out.push(line([x + w + e, y + h], [x - e, y + h], t0 + 2 * d, t0 + 3 * d, o));
  out.push(line([x, y + h + e], [x, y - e], t0 + 3 * d, t1, o));
  return out;
}
function arrow(a, b, t0, t1, o = {}) {
  const tm = t0 + (t1 - t0) * 0.75; const s = line(a, b, t0, tm, o);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = o.head || 26;
  const h1 = [b[0] - L * Math.cos(ang - 0.5), b[1] - L * Math.sin(ang - 0.5)], h2 = [b[0] - L * Math.cos(ang + 0.5), b[1] - L * Math.sin(ang + 0.5)];
  line(h1, b, tm, tm + (t1 - tm) / 2, { ...o, silent: true }); line(b, h2, tm + (t1 - tm) / 2, t1, { ...o, silent: true });
  return s;
}
// Рукописный текст: буквы появляются по одной, каждая «прописывается» слева направо
function hand(str, x, y, t0, t1, o = {}) {
  const ob = { type: 'hand', str, x, y, t0, t1, size: (o.size || 64) * 1.2, col: o.col || C.ink, w: o.weight || 700, align: o.align || 'left', er: o.er, font: o.font || HAND, rot: o.rot || 0 };
  objs.push(ob); evs.push({ k: 'chalk', t0, t1, x, soft: 1 }); return ob;
}
// Счётчик: число бежит от a до b; fmt(v) -> строка
function counter(fmt, a, b, x, y, t0, t1, o = {}) {
  const ob = { type: 'count', fmt, a, b, x, y, t0, t1, size: o.size || 140, col: o.col || C.or, align: o.align || 'left', er: o.er, tin: o.tin ?? t0 - 0.15, font: o.font || MONO };
  objs.push(ob); evs.push({ k: 'tick', t0, t1, x }); return ob;
}
// Ластик: стирает объекты внутри прямоугольника, проходя в направлении dir за время t0..t1 (остаётся тень)
function erase(list, box, t0, t1, dir = 'down') { for (const ob of list.flat()) ob.er = { box, t0, t1, dir }; evs.push({ k: 'erase', t0, t1 }); }
// Камера: ключи {t, x, y, z}; между ключами плавный переезд (в 1/z, как наезд тележки)
function cam(t, x, y, z, dur = 0.9) { cams.push({ t, x, y, z, dur }); }
// Печатная машинка на чёрном (экранный слой). str набирается от t0 до t1, держится до t2.
function typeCard(str, t0, t1, t2, o = {}) {
  cards.push({ str, t0, t1, t2, size: o.size || 76, col: o.col || C.ink, accent: o.accent });
  const n = str.replace(/\s/g, '').length; let k = 0;
  for (let i = 0; i < str.length; i++) if (!/\s/.test(str[i])) { evs.push({ k: 'key', t0: t0 + (t1 - t0) * (k++ / Math.max(1, n - 1)) }); }
}
// ---------- рендер ----------
function camAt(t) {
  if (!cams.length) return { x: W / 2, y: H / 2, z: 1 };
  let cur = cams[0];
  for (let i = 1; i < cams.length; i++) {
    const k = cams[i]; if (t < k.t) break;
    const u = easeIO(prog(t, k.t, k.t + k.dur));
    const iz = 1 / cur.z + (1 / k.z - 1 / cur.z) * u;
    cur = { x: cur.x + (k.x - cur.x) * u, y: cur.y + (k.y - cur.y) * u, z: 1 / iz };
  }
  return cur;
}
function eraseClip(ob, t) {                                     // -> [доля стёртого, бокс, направление]
  if (!ob.er) return null; const e = prog(t, ob.er.t0, ob.er.t1); if (e <= 0) return null; return [e, ob.er.box, ob.er.dir];
}
function withErase(ob, t, fn) {
  const er = eraseClip(ob, t);
  if (!er) { fn(1); return; }
  const [e, [bx, by, bw, bh], dir] = er;
  // тень старого урока
  ctx.save(); ctx.globalAlpha = 0.04; fn(0.04); ctx.restore();
  ctx.save(); ctx.beginPath();
  if (dir === 'down') ctx.rect(bx - 2000, by + bh * e, bw + 4000, 99999);
  else if (dir === 'up') ctx.rect(bx - 2000, by - 99999, bw + 4000, 99999 + bh * (1 - e));
  else if (dir === 'right') ctx.rect(bx + bw * e, by - 2000, 99999, bh + 4000);
  else ctx.rect(bx - 99999, by - 2000, 99999 + bw * (1 - e), bh + 4000);
  // оставляем всё вне бокса
  ctx.rect(-1e6, -1e6, 2e6, by + 1e6); ctx.rect(-1e6, by + bh, 2e6, 1e6);
  ctx.rect(-1e6, by, bx + 1e6, bh); ctx.rect(bx + bw, by, 1e6, bh);
  ctx.clip(); fn(1); ctx.restore();
}
let tip = null;
function drawStroke(ob, t) {
  const u = ease(prog(t, ob.t0, ob.t1)); if (u <= 0) return;
  const Lt = ob.c[ob.c.length - 1] * u;
  withErase(ob, t, () => {
    ctx.strokeStyle = ob.col; ctx.lineWidth = ob.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha *= 0.95; ctx.beginPath(); ctx.moveTo(ob.p[0][0], ob.p[0][1]);
    let last = ob.p[0];
    for (let i = 1; i < ob.p.length; i++) {
      if (ob.c[i] <= Lt) { ctx.lineTo(ob.p[i][0], ob.p[i][1]); last = ob.p[i]; }
      else { const f = (Lt - ob.c[i - 1]) / (ob.c[i] - ob.c[i - 1]); last = [ob.p[i - 1][0] + (ob.p[i][0] - ob.p[i - 1][0]) * f, ob.p[i - 1][1] + (ob.p[i][1] - ob.p[i - 1][1]) * f]; ctx.lineTo(last[0], last[1]); break; }
    }
    ctx.stroke();
    // меловая пыль: тонкая светлая жилка поверх
    ctx.globalAlpha *= 0.35; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, ob.w * 0.25); ctx.stroke();
  });
  if (u < 1 && t >= ob.t0) tip = { x: last(ob, Lt)[0], y: last(ob, Lt)[1], col: ob.col };
}
function last(ob, Lt) { for (let i = 1; i < ob.p.length; i++) if (ob.c[i] >= Lt) { const f = (Lt - ob.c[i - 1]) / ((ob.c[i] - ob.c[i - 1]) || 1); return [ob.p[i - 1][0] + (ob.p[i][0] - ob.p[i - 1][0]) * f, ob.p[i - 1][1] + (ob.p[i][1] - ob.p[i - 1][1]) * f]; } return ob.p[ob.p.length - 1]; }
function drawHand(ob, t) {
  const u = prog(t, ob.t0, ob.t1); if (u <= 0) return;
  ctx.font = `${ob.w} ${ob.size}px ${ob.font}`; ctx.textBaseline = 'alphabetic';
  const chars = [...ob.str], full = ctx.measureText(ob.str).width;
  let x0 = ob.align === 'center' ? ob.x - full / 2 : ob.align === 'right' ? ob.x - full : ob.x;
  const vis = chars.filter(c => c !== ' ').length; const pos = u * vis; let k = 0, px = x0;
  withErase(ob, t, () => {
    let k2 = 0, xx = x0;
    ctx.save(); ctx.translate(ob.x, ob.y); ctx.rotate(ob.rot); ctx.translate(-ob.x, -ob.y);
    for (const ch of chars) {
      const adv = ctx.measureText(ch).width;
      if (ch !== ' ') {
        const f = clamp(pos - k2, 0, 1); k2++;
        if (f > 0) {
          ctx.save(); ctx.beginPath(); ctx.rect(xx - 4, ob.y - ob.size * 1.2, adv * f + 6, ob.size * 1.6); ctx.clip();
          ctx.fillStyle = ob.col; ctx.globalAlpha *= 0.96; ctx.fillText(ch, xx, ob.y); ctx.restore();
          if (f < 1) tip = { x: xx + adv * f, y: ob.y - ob.size * 0.3, col: ob.col, w: true };
        }
      }
      xx += adv;
    }
    ctx.restore();
  });
}
function drawCount(ob, t) {
  if (t < ob.tin) return;
  const u = 1 - Math.pow(1 - prog(t, ob.t0, ob.t1), 3), v = ob.a + (ob.b - ob.a) * u;
  const pop = 1 + 0.12 * Math.exp(-(((t - ob.t1) * 8) ** 2)) * (t > ob.t0 ? 1 : 0);
  withErase(ob, t, () => {
    ctx.save(); ctx.translate(ob.x, ob.y); ctx.scale(pop, pop);
    ctx.font = `700 ${ob.size}px ${ob.font}`; ctx.textAlign = ob.align; ctx.fillStyle = ob.col;
    ctx.globalAlpha *= prog(t, ob.tin, ob.tin + 0.15); ctx.fillText(ob.fmt(v), 0, 0); ctx.restore();
  });
}
function drawBoard(cm) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // пыль/разводы доски, привязаны к доске (едут вместе с камерой, медленнее)
  const ox = ((-cm.x * cm.z * 0.6) % 512 + 512) % 512, oy = ((-cm.y * cm.z * 0.6) % 512 + 512) % 512;
  ctx.globalAlpha = 0.5;
  for (let x = -512; x < W + 512; x += 512) for (let y = -512; y < H + 512; y += 512) ctx.drawImage(dust, x + ox, y + oy);
  ctx.globalAlpha = 1;
}
function drawCard(cd, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const a = prog(t, cd.t0 - 0.12, cd.t0) * (1 - prog(t, cd.t2, cd.t2 + 0.12));
  ctx.globalAlpha = a; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.font = `400 ${cd.size}px ${MONO}`; ctx.fillStyle = cd.col; ctx.textBaseline = 'alphabetic';
  // перенос строк по ширине
  const words = cd.str.split(' '), lines = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > 1500 && cur) { lines.push(cur); cur = w; } else cur = tr; }
  lines.push(cur);
  const n = cd.str.replace(/\s/g, '').length, u = prog(t, cd.t0, cd.t1); let shown = Math.floor(u * n + (u >= 1 ? 1 : 0) + 1e-6);
  const lh = cd.size * 1.35, y0 = H / 2 - 60 - (lines.length - 1) * lh / 2; let cx = 0, cy = 0;
  lines.forEach((ln, li) => {
    const wfull = ctx.measureText(ln).width, x0 = W / 2 - wfull / 2; let s = '';
    for (const ch of ln) { if (ch !== ' ') { if (shown <= 0) break; shown--; } s += ch; }
    ctx.fillText(s, x0, y0 + li * lh); if (s.length) { cx = x0 + ctx.measureText(s).width; cy = y0 + li * lh; }
  });
  if (Math.floor(t * 2.2) % 2 === 0 || u < 1) { ctx.fillStyle = cd.accent || C.or; ctx.fillRect(cx + 8, cy - cd.size * 0.78, cd.size * 0.5, cd.size * 0.92); }
  ctx.globalAlpha = 1;
}
function drawTip() {
  if (!tip) return;
  const g = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 26);
  g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.25, tip.col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.85; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(tip.x, tip.y, 26, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
}
function render(t) {
  const cm = camAt(t); drawBoard(cm);
  ctx.setTransform(cm.z, 0, 0, cm.z, W / 2 - cm.x * cm.z, H / 2 - cm.y * cm.z);
  tip = null;
  for (const ob of objs) {
    if (t < ob.t0 - 0.2 && ob.type !== 'count') continue;
    ctx.globalAlpha = 1;
    if (ob.type === 'stroke') drawStroke(ob, t); else if (ob.type === 'hand') drawHand(ob, t); else if (ob.type === 'count') drawCount(ob, t);
  }
  drawTip();
  for (const cd of cards) if (t >= cd.t0 - 0.12 && t <= cd.t2 + 0.12) drawCard(cd, t);
  // виньетка
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function init() {
  canvas = document.getElementById('c'); canvas.width = W; canvas.height = H; ctx = canvas.getContext('2d');
  dust = document.createElement('canvas'); dust.width = dust.height = 512; const d = dust.getContext('2d'), r = rng(42);
  for (let i = 0; i < 40; i++) { d.strokeStyle = `rgba(255,255,255,${0.012 + r() * 0.02})`; d.lineWidth = 20 + r() * 60; d.beginPath(); const x = r() * 512, y = r() * 512; d.moveTo(x, y); d.quadraticCurveTo(x + r() * 200 - 100, y + r() * 80 - 40, x + r() * 300 - 150, y + r() * 60 - 30); d.stroke(); }
  for (let i = 0; i < 2500; i++) { d.fillStyle = `rgba(255,255,255,${r() * 0.05})`; d.fillRect(r() * 512, r() * 512, 1.5, 1.5); }
}
window.BOARD = { W, H, C, init, render, stroke, line, poly, circle, rect, arrow, hand, counter, erase, cam, typeCard, events: () => evs, prog };
})();
