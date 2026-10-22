// UI layer for v2 episodes (ported from v1 render.js, brand-consistent)
module.exports = function makeUI(TL, opts = {}) {
const W = 1080, H = 1920, FPS = TL.fps, CFG = TL.cfg;
const C = {
  cream: '#F3EDDF', cream2: '#EAE1CB', olive: '#5E6B2F', oliveD: '#3E471E', oliveL: '#8C9A55',
  pink: '#EE5E9A', pinkL: '#F7B6CF', pinkD: '#C23C76', white: '#FFFDF8', ink: '#2B2F1C',
  wood: '#C98B5A', woodD: '#9C6238', gold: '#F2C14E', red: '#E0474C', green: '#4CAF6A'
};
const LAYOUT = require('./hq').LAYOUT;   // 'v2' = composition system for new episodes
const LV = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LVCOL = { A1: '#8CB369', A2: '#5E9E6E', B1: '#E9A23B', B2: '#E27D3C', C1: '#EE5E9A', C2: '#8E5BD6' };
const LVNAME = { A1: 'BEGINNER', A2: 'ELEMENTARY', B1: 'INTERMEDIATE', B2: 'UPPER-INTERMEDIATE', C1: 'ADVANCED', C2: 'PROFICIENT' };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eOut = t => 1 - Math.pow(1 - t, 3);
const eIn = t => t * t * t;
const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eBack = (t, s = 1.9) => { t = clamp(t); const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const SC = {}; TL.scenes.forEach(s => SC[s.id] = s);
const SP = {}; TL.speech.forEach(s => SP[s.id] = s);
function sceneAt(t) { for (const s of TL.scenes) if (t >= s.s && t < s.e) return s; return TL.scenes[TL.scenes.length - 1]; }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function font(ctx, f, s) { ctx.font = `${s}px ${f}`; }
function textFit(ctx, f, s, txt, maxW) { font(ctx, f, s); let w = ctx.measureText(txt).width; if (w > maxW) { s = s * maxW / w; font(ctx, f, s); } return s; }
function wrap(ctx, txt, maxW) {
  const words = txt.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function strokeText(ctx, txt, x, y, fill, stroke, sw) {
  ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.strokeText(txt, x, y); }
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
function check(ctx, x, y, s, col = C.green) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, s, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.28; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-s * .45, 0); ctx.lineTo(-s * .1, s * .35); ctx.lineTo(s * .5, -s * .35); ctx.stroke(); ctx.restore();
}
function cross(ctx, x, y, s, col = C.red) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, s, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.28; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-s * .38, -s * .38); ctx.lineTo(s * .38, s * .38); ctx.moveTo(s * .38, -s * .38); ctx.lineTo(-s * .38, s * .38); ctx.stroke(); ctx.restore();
}
function star(ctx, x, y, r, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = rot + i * Math.PI / 4, rr_ = i % 2 ? r * 0.28 : r; ctx.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); }
  ctx.closePath(); ctx.fill();
}
function cupIcon(ctx, x, y, s, label) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = C.white; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-50, -60); ctx.lineTo(50, -60); ctx.lineTo(38, 70); ctx.lineTo(-38, 70); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.olive; rr(ctx, -58, -82, 116, 26, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.pink; ctx.fillRect(-45, -10, 90, 34);
  if (label) { ctx.fillStyle = C.oliveD; font(ctx, 'Cav7', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 42); }
  ctx.restore();
}

function icon(ctx, name, x, y, s, label) {
  if (name === 'cup') return cupIcon(ctx, x, y, s, label);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (name === 'book') {
    ctx.rotate(-0.12); ctx.fillStyle = '#7A1C2E'; rr(ctx, -70, -95, 140, 190, 10); ctx.fill(); ctx.fillStyle = '#F2EBDD'; ctx.fillRect(66, -88, 12, 176);
    ctx.fillStyle = C.gold; ctx.fillRect(-70, -70, 140, 6); ctx.fillRect(-70, 64, 140, 6); font(ctx, 'Unb9', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('THE', 0, -30); ctx.fillText('IDIOT', 0, 14);
  } else if (name === 'bell') {
    ctx.fillStyle = C.ink; rr(ctx, -80, 30, 160, 22, 8); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, 30, 68, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#FFF3C4'; ctx.beginPath(); ctx.ellipse(-24, 0, 12, 24, 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, -46, 12, 0, 7); ctx.fill();
  } else if (name === 'dumbbell') {
    ctx.rotate(-0.3); ctx.fillStyle = '#9AA3B2'; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 6; rr(ctx, -80, -12, 160, 24, 8); ctx.fill(); ctx.stroke();
    for (const s of [-1, 1]) { ctx.fillStyle = C.pink; rr(ctx, s * 70 - 22, -55, 44, 110, 12); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.oliveD; rr(ctx, s * 100 - 12, -36, 24, 72, 8); ctx.fill(); }
  } else if (name === 'rope') {
    ctx.strokeStyle = '#C98B5A'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -90); ctx.lineTo(0, 90); ctx.stroke();
    ctx.strokeStyle = '#9C6238'; ctx.lineWidth = 4; for (let y = -84; y < 90; y += 14) { ctx.beginPath(); ctx.moveTo(-7, y); ctx.lineTo(7, y + 8); ctx.stroke(); }
    ctx.fillStyle = C.pink; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 10, 26, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(-8, 4, 5, 0, 7); ctx.arc(8, 4, 5, 0, 7); ctx.fill(); ctx.strokeStyle = C.white; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 14, 10, 0.3, Math.PI - 0.3); ctx.stroke();
  } else if (name === 'plate') {
    ctx.fillStyle = C.white; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(0, 40, 120, 40, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#E8B04A'; ctx.beginPath(); ctx.moveTo(-80, 40); ctx.quadraticCurveTo(-70, -60, -20, -90); ctx.quadraticCurveTo(10, -140, 40, -90); ctx.quadraticCurveTo(90, -60, 80, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8A4A2A'; for (const [x, y] of [[-40, 0], [10, -30], [45, 5], [-5, 20]]) { ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(10, -118, 16, 0, 7); ctx.fill();
    ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-130, -150); ctx.lineTo(130, 90); ctx.stroke();
  } else if (name === 'scissors') {
    ctx.rotate(-0.5); ctx.strokeStyle = C.oliveD; ctx.lineWidth = 6;
    for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * 0.35); ctx.fillStyle = '#D8DEE6'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(3, -150); ctx.lineTo(-3, -150); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.pink; ctx.beginPath(); ctx.ellipse(s * 4, 50, 24, 32, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.white; ctx.beginPath(); ctx.ellipse(s * 4, 50, 11, 17, 0, 0, 7); ctx.fill(); ctx.restore(); }
  } else if (name === 'sign') {
    ctx.fillStyle = '#6A4630'; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 6; rr(ctx, -10, -120, 20, 240, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.pink; ctx.beginPath(); ctx.moveTo(-90, -100); ctx.lineTo(70, -100); ctx.lineTo(110, -70); ctx.lineTo(70, -40); ctx.lineTo(-90, -40); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.olive; ctx.beginPath(); ctx.moveTo(90, -20); ctx.lineTo(-70, -20); ctx.lineTo(-110, 10); ctx.lineTo(-70, 40); ctx.lineTo(90, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.white; font(ctx, 'Unb9', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('KING\'S X', 0, -70); ctx.fillText('?', 0, 10);
  } else if (name === 'speaker') {
    ctx.fillStyle = '#3A3F4B'; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 7; rr(ctx, -80, -120, 160, 240, 18); ctx.fill(); ctx.stroke();
    for (const [yy, r] of [[-55, 34], [45, 52]]) { ctx.fillStyle = '#1E2128'; ctx.beginPath(); ctx.arc(0, yy, r, 0, 7); ctx.fill(); ctx.fillStyle = '#6A707A'; ctx.beginPath(); ctx.arc(0, yy, r * 0.35, 0, 7); ctx.fill(); }
    ctx.strokeStyle = C.pink; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (let k = 1; k <= 2; k++) { ctx.beginPath(); ctx.arc(95, 0, 26 * k, -0.7, 0.7); ctx.stroke(); }
    ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-130, -150); ctx.lineTo(170, 150); ctx.stroke();
  } else if (name === 'suitcase') {
    ctx.rotate(0.08); ctx.strokeStyle = C.oliveD; ctx.lineWidth = 7;
    ctx.fillStyle = '#3A3F4B'; rr(ctx, -34, -128, 68, 40, 14); ctx.stroke(); ctx.fillStyle = C.pink; rr(ctx, -100, -98, 200, 196, 24); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 6; for (const xx of [-50, 0, 50]) { ctx.beginPath(); ctx.moveTo(xx, -86); ctx.lineTo(xx, 86); ctx.stroke(); }
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 5; rr(ctx, 30, -60, 92, 52, 10); ctx.fill(); ctx.stroke(); font(ctx, 'Unb9', 26); ctx.fillStyle = C.oliveD; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+6', 76, -33);
    ctx.fillStyle = C.oliveD; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 66, 112, 14, 0, 7); ctx.fill(); }
  } else if (name === 'tag') {
    ctx.rotate(-0.25); ctx.strokeStyle = C.oliveD; ctx.lineWidth = 7;
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(-60, -110); ctx.lineTo(60, -110); ctx.lineTo(60, 80); ctx.lineTo(0, 130); ctx.lineTo(-60, 80); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(0, -78, 14, 0, 7); ctx.fill(); ctx.stroke();
    font(ctx, 'Unb9', 40); ctx.fillStyle = C.oliveD; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('£40', 0, -14); ctx.fillStyle = C.red; ctx.fillText('£30', 0, 52);
    ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-44, -10); ctx.lineTo(44, -22); ctx.stroke();
  } else if (name === 'gift') {
    ctx.rotate(-0.12); ctx.strokeStyle = C.oliveD; ctx.lineWidth = 7;
    ctx.fillStyle = C.pink; rr(ctx, -80, -30, 160, 130, 10); ctx.fill(); ctx.stroke(); rr(ctx, -92, -66, 184, 44, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.gold; ctx.fillRect(-14, -66, 28, 166); ctx.strokeRect(-14, -66, 28, 166);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 34, -88, 36, 20, s * 0.5, 0, 7); ctx.fill(); ctx.stroke(); }
  } else if (name === 'folders') {
    ctx.rotate(-0.1); ctx.strokeStyle = C.oliveD; ctx.lineWidth = 6;
    for (let i = 0; i < 4; i++) { ctx.fillStyle = [C.gold, C.pink, '#8FB4D9', '#4CAF6A'][i]; rr(ctx, -80 + i * 6, 40 - i * 36, 160, 40, 8); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = C.white; rr(ctx, -40, -150, 80, 50, 8); ctx.fill(); ctx.stroke(); font(ctx, 'Unb9', 26); ctx.fillStyle = C.oliveD; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+1', 0, -124);
  } else if (name === 'clock') {
    ctx.fillStyle = C.white; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fill(); ctx.stroke();
    ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.moveTo(0, 0); ctx.lineTo(34, 12); ctx.stroke();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill();
  }
  ctx.restore();
}

// ---------- speech bubble (screen space)
function bubble(ctx, sp, t, anchor, side, nameTag) {
  const u = t - sp.t;
  let hold = sp.hold || 0.9;
  if (LAYOUT === 'v2') { const nar = SP[sp.id.split('_')[0] + '_nar']; if (nar && nar.t > sp.t) hold = Math.max(0.05, Math.min(hold, nar.t - 0.35 - (sp.t + sp.d))); }   // gone before the lesson card arrives
  const out = P(t, sp.t + sp.d + hold, sp.t + sp.d + hold + 0.2);
  if (u < -0.05 || out >= 1) return;
  const k = eBack(P(u, -0.05, 0.25), 2.2) * (1 - eIn(out));
  const maxW = 820;
  let fs = sp.fs || (sp.text.length > 60 ? 46 : 58);   // sp.fs: per-line override (new episodes only)
  font(ctx, 'Nun9', fs);
  const lines = wrap(ctx, sp.text, maxW - 80);
  font(ctx, 'Nun7', 34);
  const rl = sp.ru ? wrap(ctx, sp.ru, maxW - 80) : [];
  font(ctx, 'Nun9', fs);
  const tw = Math.max(...lines.map(l => ctx.measureText(l).width), ...rl.map(l => { font(ctx, 'Nun7', 34); return ctx.measureText(l).width; })) + 80;
  const bh = lines.length * fs * 1.12 + (rl.length ? rl.length * 42 + 22 : 0) + 56;
  let bx = side === 'left' ? Math.max(50, Math.min(anchor.x - 120, W - 150 - tw)) : Math.min(W - 140 - tw, Math.max(50, anchor.x - tw + 140));
  bx = Math.max(40, bx);
  let by = anchor.y - bh - 60;
  by = LAYOUT === 'v2' ? clamp(by, 360, Math.max(360, 1560 - bh)) : clamp(by, 360, 1250);   // v2: keep the bubble above the TikTok/Shorts caption area
  ctx.save();
  const ox = side === 'left' ? bx + 120 : bx + tw - 140, oy = by + bh;
  ctx.translate(ox, oy); ctx.scale(k, k); ctx.translate(-ox, -oy);
  // shadow
  ctx.fillStyle = 'rgba(62,71,30,.25)'; rr(ctx, bx + 10, by + 14, tw, bh, 40); ctx.fill();
  ctx.fillStyle = C.white; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 7;
  rr(ctx, bx, by, tw, bh, 40); ctx.fill(); ctx.stroke();
  // tail
  let dx = anchor.x - ox, dy = Math.max(40, anchor.y - oy); const dl = Math.hypot(dx, dy), tl = Math.min(80, dl);
  const tx = ox + dx / dl * tl, ty = oy + dy / dl * tl;
  ctx.beginPath(); ctx.moveTo(ox - 30, oy - 4); ctx.lineTo(tx, ty); ctx.lineTo(ox + 30, oy - 4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(ox - 30, oy); ctx.lineTo(tx, ty); ctx.lineTo(ox + 30, oy); ctx.stroke();
  ctx.fillStyle = C.white; ctx.fillRect(ox - 27, oy - 12, 54, 12);
  if (nameTag) { font(ctx, 'Unb9', 26); const nw = ctx.measureText(nameTag[0]).width + 40; const nx = side === 'left' ? bx + 30 : bx + tw - 30 - nw; ctx.fillStyle = nameTag[1]; rr(ctx, nx, by - 24, nw, 46, 23); ctx.fill(); ctx.strokeStyle = C.oliveD; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(nameTag[0], nx + nw / 2, by + 1); }
  // text with typewriter reveal (by characters over speech duration)
  const total = sp.text.length; const shown = Math.floor(clamp(u / Math.max(sp.d * 0.85, 0.3)) * total + 0.999);
  let cnt = 0; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  lines.forEach((ln, i) => {
    font(ctx, 'Nun9', fs);
    const vis = ln.slice(0, clamp(shown - cnt, 0, ln.length)); cnt += ln.length + 1;
    ctx.fillStyle = C.oliveD; ctx.fillText(vis, bx + 40, by + 30 + i * fs * 1.12);
  });
  if (rl.length) {
    const ry = by + 30 + lines.length * fs * 1.12 + 14;
    ctx.globalAlpha = clamp(u / 0.4) * (1);
    ctx.strokeStyle = C.pinkL; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx + 40, ry - 6); ctx.lineTo(bx + tw - 40, ry - 6); ctx.stroke();
    font(ctx, 'Nun7', 34); ctx.fillStyle = C.pinkD;
    rl.forEach((l, i) => ctx.fillText(l, bx + 40, ry + 8 + i * 42));
  }
  ctx.restore();
  if (global.__QA) global.__QA.ui(ctx, 'bubble', { x: bx, y: by, w: tw, h: bh, k, id: sp.id, who: sp.who, lines: lines.length + rl.length, anchor });
}

// ---------- captions for narrator (screen space, TikTok style)
function captions(ctx, t) {
  for (const sp of TL.speech) {
    if (sp.who !== 'nar' && sp.who !== 'tip') continue;
    if (t < sp.t - 0.05 || t > sp.t + sp.d + 0.25) continue;
    const u = t - sp.t;
    // group words into chunks of <= 3 words / 20 chars
    const chunks = []; let cur = [];
    for (const w of sp.words) { cur.push(w); const len = cur.map(x => x[0]).join(' ').length; if (sp.who !== 'tip' && (cur.length >= 3 || len > 17 || /[.!?:,]$/.test(w[0]))) { chunks.push(cur); cur = []; } }
    if (cur.length) chunks.push(cur);
    let ch = chunks[0];
    for (const c of chunks) if (u >= c[0][1] - 0.02) ch = c;
    const cs = ch[0][1];
    const k = eBack(P(u, cs - 0.02, cs + 0.14), 2.5);
    const isTip = sp.who === 'tip';
    const fsz = isTip ? 74 : 66;
    const txt = ch.map(w => w[0]).join(' ');
    const size = textFit(ctx, isTip ? 'Nun9' : 'Unb9', fsz, isTip ? txt : txt.toUpperCase(), 900);
    const y = 1470;
    ctx.save(); ctx.translate(540, y); ctx.scale(k, k); ctx.rotate(isTip ? 0 : -0.02);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const parts = ch.map(w => isTip ? w[0] : w[0].toUpperCase());
    const sw = ctx.measureText(' ').width;
    const widths = parts.map(p => ctx.measureText(p).width);
    let x = -(widths.reduce((a, b) => a + b, 0) + sw * (parts.length - 1)) / 2;
    if (isTip) { // pill background for English phrase
      const tw = -x * 2 + 70; ctx.fillStyle = C.pink; rr(ctx, -tw / 2, -size * 0.85, tw, size * 1.7, size * 0.85); ctx.fill();
    }
    if (global.__QA) global.__QA.ui(ctx, 'captions', { x: 540 + x * k - 20, y: y - size * 0.9 * k, w: -x * 2 * k + 40, h: size * 1.8 * k, k, id: sp.id });
    parts.forEach((p, i) => {
      const active = u >= ch[i][1] - 0.03;
      const col = isTip ? C.white : (active ? '#FFE15A' : C.white);
      strokeText(ctx, p, x, 0, col, isTip ? null : C.oliveD, 16);
      x += widths[i] + sw;
    });
    ctx.restore();
  }
}

// ---------- top level progress bar (screen space)
function levelBar(ctx, t, sc, appear = 1) {
  const cur = LV.indexOf(sc.id);
  const pw = 128, ph = 62, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2, y = 222;
  if (sc.id !== 'hook') { ctx.fillStyle = 'rgba(243,237,223,.82)'; rr(ctx, x0 - 22, y - 16, 6 * pw + 5 * gap + 44, ph + 32, (ph + 32) / 2); ctx.fill(); }
  LV.forEach((L, i) => {
    const a = sc.id === 'hook' ? eBack(P(t, 2.55 + i * 0.12, 2.8 + i * 0.12)) : appear;
    if (a <= 0) return;
    const x = x0 + i * (pw + gap);
    const isCur = i === cur, done = cur >= 0 ? i < cur : sc.id === 'outro';
    const pulse = isCur ? 1.12 + 0.04 * Math.sin(t * 6) : 1;
    ctx.save(); ctx.translate(x + pw / 2, y + ph / 2); ctx.scale(a * pulse, a * pulse);
    ctx.fillStyle = 'rgba(0,0,0,.15)'; rr(ctx, -pw / 2 + 4, -ph / 2 + 6, pw, ph, ph / 2); ctx.fill();
    ctx.fillStyle = isCur ? LVCOL[L] : done ? C.olive : C.white; rr(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = C.oliveD; ctx.stroke();
    font(ctx, 'Unb9', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = isCur || done ? C.white : C.oliveD; ctx.fillText(L, 0, 2);
    if (done) check(ctx, pw / 2 - 10, -ph / 2 + 6, 15, C.gold);
    ctx.restore();
  });
}

// ---------- level intro transition (screen space)
function levelIntro(ctx, t, sc) {
  const u = t - sc.s; if (u > 1.2) return;
  const L = sc.id, col = LVCOL[L], i = LV.indexOf(L);
  const pw = 128, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2;
  const px = x0 + i * (pw + gap) + pw / 2, py = 253;
  const inK = eOut(P(u, 0, 0.3)), outK = eIO(P(u, 0.82, 1.15));
  const cx = lerp(540, px, outK), cy = lerp(960, py, outK);
  const R = lerp(0, 1300, inK) * (1 - outK) + 40 * outK;
  if (R < 2) return;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
  ctx.fillStyle = col; ctx.fillRect(0, 0, W, H);
  // radial speed lines
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(u * 0.6);
  ctx.fillStyle = 'rgba(255,255,255,.13)';
  for (let k = 0; k < 18; k++) { ctx.rotate(Math.PI * 2 / 18); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -60); ctx.lineTo(1400, 60); ctx.fill(); }
  ctx.restore();
  // text
  const s = eBack(P(u, 0.12, 0.45), 2.2) * lerp(1, 0.18, outK);
  ctx.translate(cx, cy); ctx.scale(s, s); ctx.rotate(lerp(-0.2, -0.05, eOut(P(u, .12, .5))));
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  font(ctx, 'Unb9', 400); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillText(L, 14, 24);
  strokeText(ctx, L, 0, 0, C.white, C.oliveD, 22);
  font(ctx, 'Unb7', 54); ctx.globalAlpha = clamp(P(u, .3, .5));
  ctx.fillStyle = C.white; ctx.fillText(LVNAME[L], 0, 250);
  font(ctx, 'Nun9', 44); ctx.fillText('уровень', 0, -250);
  ctx.restore();
}

// ---------- lesson cards (screen space, during narrator)
// v2 layout: the lesson card is only as tall as its content (v1 keeps the fixed 470 px)
function cardHeight(cd) {
  if (!cd) return 470; const ex = cd.ex ? cd.ex.length : 0;
  if (cd.type === 'meter') return 380;
  if (cd.type === 'swap') return cd.good && cd.good[1] ? 460 : 400;
  if (cd.type === 'eq') { let b = 270; if (cd.note) b = Math.max(b, 336); if (ex) b = Math.max(b, 376 + (ex - 1) * 58); if (cd.stamp) b = Math.max(b, 446); return b + 20; }
  if (cd.type === 'big') return 450;
  if (cd.type === 'c2') return cd.moral_at < 1 ? 470 : 130 + ((cd.vocab || []).length - 1) * 170 + 110;
  return 470;
}
function card(ctx, t, sc) {
  const l = sc.id.toLowerCase(); const nar = SP[l + '_nar']; if (!nar) return;
  const u = t - nar.t + 0.15; if (u < 0) return;
  const out = P(t, sc.e - 0.35, sc.e - 0.05);
  const k = eBack(P(u, 0, 0.35), 1.6);
  const x = 90, w = 900, y = 330 + (1 - k) * -80 - eIn(out) * 900, h = LAYOUT === 'v2' ? cardHeight(CFG.cards[sc.id]) : 470;
  ctx.save(); ctx.globalAlpha = clamp(u / 0.15);
  ctx.translate(540, y + h / 2); ctx.rotate((1 - k) * -0.08); ctx.translate(-540, -(y + h / 2));
  ctx.fillStyle = 'rgba(62,71,30,.28)'; rr(ctx, x + 12, y + 18, w, h, 44); ctx.fill();
  ctx.fillStyle = C.white; ctx.strokeStyle = C.oliveD; ctx.lineWidth = 8; rr(ctx, x, y, w, h, 44); ctx.fill(); ctx.stroke();
  // header chip
  ctx.fillStyle = LVCOL[sc.id]; rr(ctx, x + 40, y - 34, 230, 68, 34); ctx.fill(); ctx.stroke();
  font(ctx, 'Unb9', 30); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(sc.id + ' • УРОК', x + 155, y + 2);
  ctx.textAlign = 'left';
  const tip = SP[l + '_tip'];
  const n = t - nar.t;
  const cx = x + 60, cy = y + 60;
  const pop = (a) => eBack(P(n, a, a + 0.3), 2);
  const cd = CFG.cards[sc.id];
  const tipK = tip ? eBack(P(t, tip.t - 0.1, tip.t + 0.25), 2) : 0;
  ctx.textBaseline = 'middle';
  if (cd.type === 'meter') {
    font(ctx, 'Unb9', 40); ctx.fillStyle = C.oliveD; ctx.fillText('ГРАММАТИКА', cx, cy + 40);
    const g = 1 - eIO(P(n, 0.9, 1.9));
    ctx.fillStyle = C.cream2; rr(ctx, cx, cy + 100, 780, 60, 30); ctx.fill();
    ctx.fillStyle = g > 0.3 ? C.green : C.red; rr(ctx, cx, cy + 100, Math.max(60, 780 * g), 60, 30); ctx.fill();
    font(ctx, 'Unb9', 34); ctx.fillStyle = C.oliveD; ctx.textAlign = 'right'; ctx.fillText(Math.round(g * 100) + '%', cx + 780, cy + 40); ctx.textAlign = 'left';
    const q = pop(2.2);
    if (q > 0) {
      ctx.save(); ctx.translate(cx, cy + 280); ctx.scale(q, q);
      const lw = textFit(ctx, 'Unb9', 40, cd.label, 330); ctx.fillStyle = C.oliveD; ctx.fillText(cd.label, 0, 0);
      const wdt = ctx.measureText(cd.label).width;
      if (cd.ok) check(ctx, wdt + 50, 0, 34); else cross(ctx, wdt + 50, 0, 34);
      font(ctx, 'Nun9', 40); ctx.fillStyle = cd.ok ? C.green : C.red; ctx.fillText(cd.note, wdt + 104, 4);
      ctx.restore();
    }
  }
  if (cd.type === 'swap') {
    textFit(ctx, 'Nun9', 62, cd.bad, 680); ctx.fillStyle = C.ink; ctx.fillText(cd.bad, cx + 90, cy + 70);
    const bw = ctx.measureText(cd.bad).width;
    cross(ctx, cx + 36, cy + 70, 34 * pop(0.2));
    const st = eOut(P(n, 0.45, 0.8)); ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.lineCap = 'round';
    if (st > 0) { ctx.beginPath(); ctx.moveTo(cx + 85, cy + 72); ctx.lineTo(cx + 85 + (bw + 10) * st, cy + 72); ctx.stroke(); }
    font(ctx, 'Nun8', 34); ctx.fillStyle = C.red; ctx.save(); ctx.globalAlpha *= clamp(P(n, .6, .9)); ctx.fillText(cd.bad_note, cx + 90, cy + 140); ctx.restore();
    if (tipK > 0) {
      ctx.save(); ctx.translate(cx, cy + 270); ctx.scale(tipK, tipK);
      const s1 = textFit(ctx, 'Nun9', 62, cd.good[0], 680);
      ctx.fillStyle = 'rgba(238,94,154,.18)'; rr(ctx, 80, -46, ctx.measureText(cd.good[0]).width + 20, 92, 20); ctx.fill();
      ctx.fillStyle = C.ink; ctx.fillText(cd.good[0], 90, 0);
      if (cd.good[1]) { textFit(ctx, 'Nun9', s1, cd.good[1], 680); ctx.fillText(cd.good[1], 90, 72); }
      ctx.restore(); check(ctx, cx + 36, cy + 270, 34 * tipK);
    }
  }
  if (cd.type === 'eq') {
    const q = pop(0.1);
    ctx.save(); ctx.translate(cx, cy + 80); ctx.scale(q, q);
    const s1 = textFit(ctx, 'Nun9', 70, cd.en, 770);
    ctx.fillStyle = 'rgba(238,94,154,.2)'; rr(ctx, -12, -s1 * 0.72, ctx.measureText(cd.en).width + 24, s1 * 1.44, 22); ctx.fill();
    ctx.fillStyle = C.ink; ctx.fillText(cd.en, 0, 0);
    textFit(ctx, 'Nun8', 50, cd.ru, 770); ctx.fillStyle = C.pinkD; ctx.fillText(cd.ru, 0, 96);
    ctx.restore();
    if (cd.note) { font(ctx, 'Nun8', 36); ctx.fillStyle = C.olive; ctx.save(); ctx.globalAlpha *= clamp(P(n, .8, 1.1)); ctx.fillText(cd.note, cx, cy + 250); ctx.restore(); }
    if (cd.stamp) {
      const s2 = eBack(P(n, 2.2, 2.5), 2.5);
      if (s2 > 0) {
        ctx.save(); ctx.translate(cx + 590, cy + 335); ctx.rotate(-0.08); ctx.scale(s2 * 0.85, s2 * 0.85);
        ctx.strokeStyle = C.green; ctx.lineWidth = 8; rr(ctx, -250, -60, 500, 120, 20); ctx.stroke();
        font(ctx, 'Unb9', 34); ctx.fillStyle = C.green; ctx.textAlign = 'center'; ctx.fillText(cd.stamp[0], 0, -18); ctx.fillText(cd.stamp[1], 0, 26);
        ctx.restore();
      }
    }
    if (cd.ex && tipK > 0) {
      ctx.save(); ctx.translate(cx, cy + 290); ctx.scale(tipK, tipK);
      cd.ex.forEach((e, i) => { textFit(ctx, 'Nun8', 38, e, 770); ctx.fillStyle = C.olive; ctx.fillText(e, 0, i * 58); });
      ctx.restore();
    }
  }
  if (cd.type === 'big') {
    const q = pop(0.1);
    ctx.save(); ctx.translate(cx, cy + 110); ctx.scale(q, q);
    const s1 = textFit(ctx, 'Unb9', 78, cd.en, 400); const ew = ctx.measureText(cd.en).width;
    ctx.fillStyle = C.pink; rr(ctx, -14, -70, ew + 44, 140, 30); ctx.fill();
    ctx.fillStyle = C.white; ctx.fillText(cd.en, 8, 4);
    font(ctx, 'Unb9', 64); ctx.fillStyle = C.oliveD; ctx.fillText('=', ew + 60, 4);
    textFit(ctx, 'Nun9', 72, cd.ru, 760 - ew - 120); ctx.fillStyle = C.ink; ctx.fillText(cd.ru, ew + 120, 4);
    ctx.restore();
    icon(ctx, cd.icon, cx + 700, cy + 300, 0.9 * pop(1.2), cd.icon === 'cup' ? 'to go' : null);
    if (tipK > 0) {
      ctx.save(); ctx.translate(cx, cy + 300); ctx.scale(tipK, tipK);
      textFit(ctx, 'Nun9', 50, cd.ex[0], 580); ctx.fillStyle = C.ink; ctx.fillText(cd.ex[0], 0, -20);
      textFit(ctx, 'Nun8', 38, cd.ex[1], 580); ctx.fillStyle = C.pinkD; ctx.fillText(cd.ex[1], 0, 40); ctx.restore();
    }
  }
  if (cd.type === 'c2') {
    const mt = cd.moral_at * nar.d;
    if (n < mt) {
      const q = pop(0.1);
      ctx.save(); ctx.translate(cx, cy + 70); ctx.scale(q, q);
      cd.vocab.forEach(([en, ru], i) => {
        textFit(ctx, 'Nun9', 56, en, 770); ctx.fillStyle = C.ink; ctx.fillText(en, 0, i * 170);
        textFit(ctx, 'Nun8', 40, ru, 770); ctx.fillStyle = C.pinkD; ctx.fillText(ru, 0, 60 + i * 170);
      });
      ctx.restore();
    } else {
      const q = eBack(P(n, mt, mt + 0.35), 2.4);
      ctx.save(); ctx.translate(540, y + h / 2 + 10); ctx.scale(q, q); ctx.rotate(-0.03);
      ctx.textAlign = 'center';
      textFit(ctx, 'Unb9', 58, cd.moral[0], 780); ctx.fillStyle = C.oliveD; ctx.fillText(cd.moral[0], 0, -110);
      textFit(ctx, 'Unb9', 58, cd.moral[1], 780); ctx.fillText(cd.moral[1], 0, -30);
      const s3 = textFit(ctx, 'Unb9', 62, cd.moral[2], 700); const mw = ctx.measureText(cd.moral[2]).width + 80;
      ctx.fillStyle = C.pink; rr(ctx, -mw / 2, 30, mw, 110, 30); ctx.fill();
      ctx.fillStyle = C.white; ctx.fillText(cd.moral[2], 0, 88);
      ctx.restore();
    }
  }
  ctx.restore();
  if (global.__QA) global.__QA.ui(ctx, 'card', { x, y, w, h, k, id: sc.id });
}

function watermark(ctx) {
  ctx.save(); ctx.globalAlpha = 0.85; font(ctx, 'Nun9', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(62,71,30,.7)'; rr(ctx, 540 - 170, 1612, 340, 50, 25); ctx.fill();
  ctx.fillStyle = C.white; ctx.fillText('@speak_in_english', 540, 1638); ctx.restore();
}
function sparkles(ctx, t) {
  for (const c of TL.sfx) if (c.n === 'sparkle' && t >= c.t && t < c.t + 1.0) {
    const u = t - c.t;
    ctx.fillStyle = C.gold;
    for (let i = 0; i < 12; i++) {
      const a = hash(i + c.t) * 6.28, r = 60 + 380 * eOut(u) * (0.5 + hash(i * 3 + c.t) * 0.6);
      const cx = c.t < 7 ? 540 : 790, cy = c.t < 7 ? 900 : 600;
      ctx.globalAlpha = 1 - u; star(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, 18 * (1 - u) + 6, u * 4);
    }
    ctx.globalAlpha = 1;
  }
}
// wipe-out at end of a scene into next level colour (makes cut feel continuous)
function levelIntroNext(ctx, t) {
  const sc = sceneAt(t); const idx = TL.scenes.indexOf(sc); const nx = TL.scenes[idx + 1];
  if (!nx) return; const d = sc.e - t; if (d > 0.18) return;
  const col = LVCOL[nx.id] || C.pinkL; const k = eIn(1 - d / 0.18);
  ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(540, 960, 1300 * k * 0.25, 0, 7); ctx.fill(); ctx.restore();
}
function outroIntro(ctx, t) {
  const u = t - SC.outro.s; if (u > 0.5) return;
  const k = eOut(P(u, 0, 0.45));
  ctx.save(); ctx.fillStyle = C.oliveD; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.moveTo(540 + 1300 * k, 960); ctx.arc(540, 960, 1300 * k, 0, Math.PI * 2, true); ctx.fill(); ctx.restore();
}


// tap cursor (arrow) with click ripple; tip at (x, y)
function tapCursor(ctx, x, y, s = 1, ripple = 0) {
  if (ripple > 0 && ripple < 1) { ctx.save(); ctx.strokeStyle = C.white; ctx.globalAlpha = 1 - ripple; ctx.lineWidth = 8; for (const k of [1, 0.6]) { ctx.beginPath(); ctx.arc(x, y, 20 + 90 * ripple * k, 0, 7); ctx.stroke(); } ctx.restore(); }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12);
  const path = () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 118); ctx.lineTo(30, 90); ctx.lineTo(50, 134); ctx.lineTo(70, 125); ctx.lineTo(50, 82); ctx.lineTo(90, 82); ctx.closePath(); };
  ctx.translate(6, 8); path(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill(); ctx.translate(-6, -8);
  path(); ctx.fillStyle = C.white; ctx.fill(); ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.stroke();
  ctx.restore();
}
return { C, LV, LVCOL, LVNAME, SC, SP, sceneAt, rr, font, textFit, wrap, strokeText, check, cross, star, icon, bubble, captions, levelBar, levelIntro, card, watermark, sparkles, levelIntroNext, outroIntro, tapCursor };
};
