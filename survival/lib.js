// Survival series: shared drawing kit (fonts, easing, people, zombies, labels, captions).
const { GlobalFonts } = require('@napi-rs/canvas');
const F = __dirname + '/node_modules/@fontsource/';
GlobalFonts.registerFromPath(F + 'anton/files/anton-latin-400-normal.woff2', 'Anton');
for (const w of [700, 800, 900]) GlobalFonts.registerFromPath(F + `nunito/files/nunito-latin-${w}-normal.woff2`, 'Nunito');

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
const ease = { in: u => u * u, out: u => 1 - (1 - u) * (1 - u), inOut: u => u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u),
  back: u => { const c = 1.9; u = clamp(u); return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); } };
// deterministic noise
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const OL = '#16181d';

function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function fillR(ctx, x, y, w, h, r, c) { rrect(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
function stroke(ctx, pts, w, c) { ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
function circle(ctx, x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = c; ctx.fill(); }

// ---- people ----------------------------------------------------------------
// The hero ("you"): round glasses, messy dark hair, mustard hoodie. Waiter bow tie in the cruise episode.
const HERO = { skin: '#f2c9a0', shirt: '#e0a530', shirt2: '#c48a1c', pants: '#2c3445', hair: '#2a1f1a', glasses: true, bow: true };
const ZCOL = [
  { skin: '#9fb08f', shirt: '#6f7f9a', shirt2: '#56647d', pants: '#3b3f4a', hair: '#3d3a33' },
  { skin: '#a9b596', shirt: '#b7746a', shirt2: '#97594f', pants: '#2f3542', hair: '#5a4630' },
  { skin: '#98a98d', shirt: '#e9e4d6', shirt2: '#c7c0ad', pants: '#2b2f38', hair: '#222' },
  { skin: '#a3b294', shirt: '#4f7d6c', shirt2: '#3c6354', pants: '#454036', hair: '#7a6a55' },
];
// person(ctx, x, footY, s, o): o = colours + { dir (-1/1 facing), look (-1..1), walk (phase or null), arms, blink, scared, zombie, tilt }
function person(ctx, x, fy, s, o) {
  const dir = o.dir || 1, ph = o.walk, zb = o.zombie;
  ctx.save(); ctx.translate(x, fy); ctx.scale(s, s);
  const bob = ph != null ? -Math.abs(Math.sin(ph)) * 8 : 0;
  // shadow
  ctx.save(); ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.ellipse(0, 4, 70, 12, 0, 0, 7); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  // legs
  const sw = ph != null ? Math.sin(ph) * (zb ? 0.22 : 0.38) : 0;
  for (const k of [-1, 1]) {
    const a = sw * k, hx = k * 16, hy = -150 + bob;
    const fx = hx + Math.sin(a) * 150, fyy = hy + Math.cos(a) * 150;
    stroke(ctx, [[hx, hy], [fx, Math.min(fyy, 0)]], 26, OL); stroke(ctx, [[hx, hy], [fx, Math.min(fyy, 0)]], 19, o.pants);
    ctx.beginPath(); ctx.ellipse(fx + dir * 9, Math.min(fyy, 0) - 2, 20, 10, 0, 0, 7); ctx.fillStyle = '#1b1c20'; ctx.fill();
  }
  ctx.translate(0, bob);
  if (o.tilt) ctx.rotate(o.tilt);
  // back arm drawn first
  const SH = [[-44, -284], [44, -284]];
  let arms = armPose(o.arms || 'down', dir, ph, o.t || 0);
  if (dir < 0 && /phone|shush/.test(o.arms)) arms = Object.assign([arms[1], arms[0]], { bend: -arms.bend });
  const drawArm = (i) => {
    const [sx, sy] = SH[i], [hx, hy] = arms[i], ex = (sx + hx) / 2 + (arms.bend || 0) * (i ? 1 : -1), ey = (sy + hy) / 2 + 10;
    stroke(ctx, [[sx, sy], [ex, ey], [hx, hy]], 25, OL); stroke(ctx, [[sx, sy], [ex, ey], [hx, hy]], 18, o.shirt);
    circle(ctx, hx, hy, 13, OL); circle(ctx, hx, hy, 10.5, o.skin);
  };
  const backI = dir > 0 ? 0 : 1; drawArm(backI);
  // torso
  ctx.beginPath(); ctx.moveTo(-48, -296); ctx.lineTo(48, -296); ctx.quadraticCurveTo(56, -296, 54, -280); ctx.lineTo(44, -150); ctx.quadraticCurveTo(43, -138, 30, -138); ctx.lineTo(-30, -138); ctx.quadraticCurveTo(-43, -138, -44, -150); ctx.lineTo(-54, -280); ctx.quadraticCurveTo(-56, -296, -48, -296); ctx.closePath();
  ctx.fillStyle = o.shirt; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.stroke();
  ctx.save(); ctx.clip(); ctx.fillStyle = o.shirt2; ctx.fillRect(-dir * 60 - 30, -300, 40, 170); ctx.fillRect(-60, -160, 120, 30);
  if (zb) { ctx.fillStyle = 'rgba(70,30,30,0.45)'; ctx.beginPath(); ctx.moveTo(-20, -230); ctx.lineTo(10, -250); ctx.lineTo(25, -210); ctx.lineTo(0, -195); ctx.fill(); ctx.fillStyle = o.shirt2; ctx.beginPath(); ctx.moveTo(-44, -150); ctx.lineTo(-30, -175); ctx.lineTo(-18, -150); ctx.lineTo(-5, -170); ctx.lineTo(8, -138); ctx.lineTo(-44, -138); ctx.fill(); }
  ctx.restore();
  if (o.bow) { ctx.fillStyle = '#16181d'; ctx.beginPath(); ctx.moveTo(0, -288); ctx.lineTo(-16, -298); ctx.lineTo(-16, -278); ctx.closePath(); ctx.moveTo(0, -288); ctx.lineTo(16, -298); ctx.lineTo(16, -278); ctx.closePath(); ctx.fill(); circle(ctx, 0, -288, 4, '#16181d');
    fillR(ctx, dir * 14 - 11, -250, 22, 12, 2, '#f4f1e8'); }
  // neck + head
  ctx.fillStyle = o.skin; ctx.fillRect(-9, -312, 18, 18);
  const hx = dir * 4, hy = -362 + (zb ? 6 : 0);
  ctx.save(); ctx.translate(hx, hy); if (zb) ctx.rotate(dir * 0.18 + Math.sin((o.t || 0) * 1.7 + x) * 0.06);
  circle(ctx, 0, 0, 62, OL); circle(ctx, 0, 0, 58, o.skin);
  // hair
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); ctx.clip(); ctx.fillStyle = o.hair;
  if (zb) { ctx.beginPath(); ctx.ellipse(-dir * 10, -52, 56, 26, 0, 0, 7); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(-62, -8); ctx.quadraticCurveTo(-58, -66, 0, -64); ctx.quadraticCurveTo(58, -66, 62, -10); ctx.lineTo(40, -26); ctx.lineTo(30, -12); ctx.lineTo(14, -30); ctx.lineTo(-6, -16); ctx.lineTo(-20, -32); ctx.lineTo(-40, -18); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  if (!zb) { ctx.fillStyle = o.hair; for (const [a, b] of [[-30, -60], [-8, -68], [16, -64]]) { ctx.beginPath(); ctx.moveTo(a, b + 10); ctx.quadraticCurveTo(a + 8, b - 16, a + 22, b - 6); ctx.lineTo(a + 16, b + 12); ctx.fill(); } }
  // face
  const lk = (o.look || 0) * 12 + dir * 6, ey = -2;
  if (zb) {
    for (const k of [-1, 1]) { circle(ctx, lk + k * 20, ey, 10, '#f3f1e4'); circle(ctx, lk + k * 20, ey, 3, '#9aa08e'); }
    stroke(ctx, [[lk - 16, 30], [lk - 8, 24], [lk, 31], [lk + 8, 24], [lk + 16, 30]], 4, '#3a2b2b');
    ctx.fillStyle = 'rgba(90,40,40,0.35)'; ctx.beginPath(); ctx.ellipse(lk + 28, 18, 9, 6, 0.4, 0, 7); ctx.fill();
  } else {
    const wide = o.scared ? 1.35 : 1;
    for (const k of [-1, 1]) {
      if (o.blink) stroke(ctx, [[lk + k * 20 - 6, ey], [lk + k * 20 + 6, ey]], 4, OL);
      else { circle(ctx, lk + k * 20, ey, 5.5 * wide, OL); if (o.scared) circle(ctx, lk + k * 20 + 1.5, ey - 1.5, 1.6, '#fff'); }
    }
    if (o.glasses) { ctx.lineWidth = 4.5; ctx.strokeStyle = OL; for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(lk + k * 20, ey, 15, 0, 7); ctx.stroke(); } stroke(ctx, [[lk - 5, ey - 2], [lk + 5, ey - 2]], 4, OL); }
    if (o.scared) { ctx.beginPath(); ctx.ellipse(lk, 32, 7, 9, 0, 0, 7); ctx.fillStyle = OL; ctx.fill(); }
    else if (o.shush) {} else stroke(ctx, [[lk - 10, 30], [lk + 10, 30]], 4, OL);
    if (o.sweat) { ctx.fillStyle = '#9fd3ff'; ctx.beginPath(); ctx.moveTo(-dir * 46, -30); ctx.quadraticCurveTo(-dir * 54, -12, -dir * 46, -8); ctx.quadraticCurveTo(-dir * 38, -12, -dir * 46, -30); ctx.fill(); }
  }
  ctx.restore();
  drawArm(1 - backI);
  ctx.restore();
}
function armPose(p, dir, ph, t) {
  const sw = ph != null ? Math.sin(ph) * 30 : 0;
  if (p === 'forward') { const w = Math.sin(t * 2.3) * 8; return Object.assign([[dir * 120 - 10, -262 + w], [dir * 130 + 10, -250 - w]], { bend: 0 }); }
  if (p === 'push') return Object.assign([[dir * 118, -232], [dir * 120, -262]], { bend: 0 });
  if (p === 'phone') return Object.assign([[-50, -160], [dir * 26, -268]], { bend: 30 });
  if (p === 'shush') return Object.assign([[-50, -160], [dir * 12, -332]], { bend: 34 });
  if (p === 'carry') return Object.assign([[dir * 60, -210], [dir * 70, -214]], { bend: 0 });
  if (p === 'scared') return Object.assign([[-40, -330], [40, -330]], { bend: 30 });
  return Object.assign([[-58 - sw * 0.3, -160 + Math.abs(sw) * 0.2], [58 + sw * 0.3, -160 + Math.abs(sw) * 0.2]], { bend: 0 });
}
const hero = (ctx, x, fy, s, o = {}) => person(ctx, x, fy, s, Object.assign({}, HERO, o));
const zombie = (ctx, x, fy, s, i, o = {}) => person(ctx, x, fy, s, Object.assign({}, ZCOL[i % ZCOL.length], { zombie: true, arms: 'forward' }, o));

// ---- UI --------------------------------------------------------------------
// "tape" label, like a strip of paper tape: tape(ctx, x, y, text, sub, u)
function tape(ctx, x, y, text, sub, u = 1, rot = -0.04) {
  if (u <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const k = ease.back(u); ctx.scale(k, k); ctx.globalAlpha = clamp(u * 3);
  ctx.font = '84px Anton'; const w = Math.max(ctx.measureText(text).width, sub ? 180 : 0) + 70, h = sub ? 150 : 118;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-w / 2 + 8, -h / 2 + 10, w, h);
  ctx.fillStyle = '#efe6cf'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let i = 0; i < 8; i++) ctx.fillRect(-w / 2 + i * w / 8, -h / 2, 2, h);
  ctx.fillStyle = '#1e2026'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, sub ? -18 : 4);
  if (sub) { ctx.font = '800 28px Nunito'; ctx.fillStyle = '#5a5546'; ctx.fillText(sub, 0, 46); }
  ctx.restore();
}
// rounded pill with icon dot: pill(ctx, x, y, text, col, u)
function pill(ctx, x, y, text, col = '#e8e3d6', u = 1, fg = '#1e2026', size = 34) {
  if (u <= 0) return;
  ctx.save(); ctx.translate(x, y); const k = ease.back(u); ctx.scale(k, k); ctx.globalAlpha = clamp(u * 3);
  ctx.font = `900 ${size}px Nunito`; const w = ctx.measureText(text).width + size * 1.4, h = size * 1.75;
  fillR(ctx, -w / 2 + 5, -h / 2 + 6, w, h, h / 2, 'rgba(0,0,0,0.3)'); fillR(ctx, -w / 2, -h / 2, w, h, h / 2, col);
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2);
  ctx.restore();
}
// big stat card: number + label
function stat(ctx, x, y, num, label, u, col = '#efe6cf') {
  if (u <= 0) return;
  ctx.save(); ctx.translate(x, y); const k = ease.back(u); ctx.scale(k, k); ctx.globalAlpha = clamp(u * 3);
  fillR(ctx, -150 + 8, -90 + 10, 300, 180, 18, 'rgba(0,0,0,0.35)'); fillR(ctx, -150, -90, 300, 180, 18, col);
  fillR(ctx, -150, -90, 10, 180, [18, 0, 0, 18], '#e0a530');
  ctx.fillStyle = '#1e2026'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '96px Anton'; ctx.fillText(num, 6, -18);
  ctx.font = '900 28px Nunito'; ctx.fillStyle = '#5a5546'; ctx.fillText(label, 6, 52); ctx.restore();
}
function cross(ctx, x, y, r, u) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(ease.back(u), ease.back(u)); circle(ctx, 0, 0, r, '#d6413a'); stroke(ctx, [[-r * .4, -r * .4], [r * .4, r * .4]], r * .22, '#fff'); stroke(ctx, [[r * .4, -r * .4], [-r * .4, r * .4]], r * .22, '#fff'); ctx.restore(); }
function check(ctx, x, y, r, u) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(ease.back(u), ease.back(u)); circle(ctx, 0, 0, r, '#3fae63'); stroke(ctx, [[-r * .45, 0], [-r * .1, r * .35], [r * .45, -r * .35]], r * .22, '#fff'); ctx.restore(); }

// captions: up to 3 words per chunk, current word highlighted
function chunks(lines) {
  const out = [];
  for (const L of lines) {
    let cur = [];
    L.words.forEach((w, i) => { cur.push(w); const end = /[.,!?…]$/.test(w.w) || cur.length === 3 || i === L.words.length - 1; if (end) { out.push(cur); cur = []; } });
  }
  out.forEach((c, i) => { c.t0 = c[0].t0 - 0.05; c.t1 = i + 1 < out.length ? Math.min(out[i + 1][0].t0 - 0.05, c[c.length - 1].t1 + 0.5) : c[c.length - 1].t1 + 0.5; });
  return out;
}
function caption(ctx, ch, t, W, y) {
  const c = ch.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const words = c.map(w => w.w.replace(/\.\.\.$/, '').toUpperCase());
  ctx.save(); ctx.font = '92px Anton'; ctx.textBaseline = 'middle';
  const sp = 26, ws = words.map(w => ctx.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const pop = ease.back(clamp((t - c.t0) / 0.12)); let x = W / 2 - tot / 2 * pop;
  ctx.translate(0, y); ctx.lineJoin = 'round';
  words.forEach((w, i) => {
    const on = t >= c[i].t0 - 0.03; ctx.save(); ctx.translate(x + ws[i] / 2 * pop, 0); ctx.scale(pop, pop);
    ctx.textAlign = 'center'; ctx.lineWidth = 16; ctx.strokeStyle = '#0d0e11'; ctx.strokeText(w, 0, 0);
    ctx.fillStyle = on ? (/^(ZOMBIE|DON'T|QUIET|SILENT|ALIVE|ENGINES|STEEL)/.test(w) ? '#ff5a4f' : '#ffffff') : '#9a9a9a'; ctx.fillText(w, 0, 0);
    ctx.restore(); x += (ws[i] + sp) * pop;
  });
  ctx.restore();
}
module.exports = { clamp, lerp, ease, hash, OL, rrect, fillR, stroke, circle, person, hero, zombie, tape, pill, stat, cross, check, chunks, caption, HERO };
