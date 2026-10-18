// Ep1 core: timeline (from script.json + voice alignments), camera, captions, title cards, stamps, grading.
const { createCanvas } = require('../../node_modules/@napi-rs/canvas'); require('../../lib');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const W = 1920, H = 1080, FPS = 30;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u;
const ease = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const eout = u => 1 - Math.pow(1 - clamp(u), 3), ein = u => Math.pow(clamp(u), 2);
const back = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const A = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
// keyframes [[t, v], ...] (numbers or points), eased between keys
function kf(list, t, fn = ease) {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) if (t < list[i][0]) { const [t0, a] = list[i - 1], [t1, b] = list[i], u = fn((t - t0) / (t1 - t0)); return Array.isArray(a) ? A(a, b, u) : lerp(a, b, u); }
  return list[list.length - 1][1];
}
const pulse = (t, t0, d) => clamp((t - t0) / d) * clamp((t0 + d * 2 - t) / d);
const win = (t, a, b) => t >= a && t < b;

// ---------------------------------------------------------------- timeline
// SEQ entries: ['l', id, gapAfter=0.35] voice line | ['b', name, dur] silent beat | ['m', name] zero-length mark
const SCRIPT = JSON.parse(fs.readFileSync(path.join(ROOT, 'script.json')));
const LINES = {}; SCRIPT.blocks.forEach(b => b.lines.forEach(L => { LINES[L[0]] = { id: L[0], who: L[1], text: L[2], src: L[3] && L[3].startsWith('@') ? L[3].slice(1) : L[0] }; }));
function loadAlign(id) {
  const f = path.join(ROOT, 'vo', id + '.align.json'); if (!fs.existsSync(f)) return null;
  const a = JSON.parse(fs.readFileSync(f)); const words = []; let cur = '', ws = 0, we = 0, depth = 0;
  a.characters.forEach((c, i) => { if (c === '[') { depth++; return; } if (c === ']') { depth--; return; } if (depth) return;
    if (/\s/.test(c)) { if (cur) words.push({ w: cur, t0: ws, t1: we }); cur = ''; return; } if (!cur) ws = a.character_start_times_seconds[i]; cur += c; we = a.character_end_times_seconds[i]; });
  if (cur) words.push({ w: cur, t0: ws, t1: we });
  const end = a.character_end_times_seconds[a.character_end_times_seconds.length - 1];
  return { a, words, dur: end };
}
function build(SEQS, order) {
  const TL = { lines: {}, marks: {}, blocks: {}, list: [] }; let t = 0;
  for (const b of order) {
    const b0 = t;
    for (const e of SEQS[b]) {
      if (e[0] === 'l') { const L = LINES[e[1]], al = loadAlign(L.src) || { words: [], dur: Math.max(1, L.text.length * 0.065), a: null };
        const o = { id: e[1], who: L.who, src: L.src, t0: t, t1: t + al.dur, words: al.words.map(w => ({ w: w.w, t0: t + w.t0, t1: t + w.t1 })), align: al.a };
        TL.lines[e[1]] = o; TL.list.push(o); t = o.t1 + (e[2] ?? 0.35); }
      else if (e[0] === 'b') { TL.marks[e[1]] = { t0: t, t1: t + e[2] }; t += e[2]; }
      else if (e[0] === 'm') TL.marks[e[1]] = { t0: t, t1: t };
      else if (e[0] === 'o') { // overlapping line: starts e[2] s after the start of mark/line e[3] (does not advance time)
        const L = LINES[e[1]], al = loadAlign(L.src) || { words: [], dur: 1, a: null }, ref = TL.lines[e[3]] || TL.marks[e[3]], st = ref.t0 + e[2];
        const o = { id: e[1], who: L.who, src: L.src, t0: st, t1: st + al.dur, words: al.words.map(w => ({ w: w.w, t0: st + w.t0, t1: st + w.t1 })), align: al.a };
        TL.lines[e[1]] = o; TL.list.push(o); }
    }
    TL.blocks[b] = { t0: b0, t1: t };
  }
  TL.T = t;
  // accessors
  TL.s = id => (TL.lines[id] || TL.marks[id]).t0;
  TL.e = id => (TL.lines[id] || TL.marks[id]).t1;
  TL.w = (id, re, end) => { const l = TL.lines[id], w = l.words.find(w => (typeof re === 'string' ? w.w.toLowerCase().replace(/[^a-z']/g, '') === re.toLowerCase() : re.test(w.w))); return w ? (end ? w.t1 : w.t0) : l.t0; };
  return TL;
}
// mouth shape for whoever is speaking a line at time t
function viseme(TL, ids, t) {
  for (const id of [].concat(ids)) { const l = TL.lines[id]; if (!l || !l.align || t < l.t0 || t > l.t1) continue;
    const a = l.align, lt = t - l.t0, st = a.character_start_times_seconds, en = a.character_end_times_seconds, ch = a.characters; let depth = 0;
    for (let i = 0; i < ch.length; i++) { if (ch[i] === '[') depth++; if (ch[i] === ']') { depth--; continue; } if (depth) continue;
      if (lt >= st[i] && lt < en[i]) { const c = ch[i].toLowerCase(), jit = 0.85 + 0.15 * Math.sin(t * 40);
        if ('aeiy'.includes(c)) return { mouth: 'wide', open: 0.75 * jit }; if ('ou'.includes(c)) return { mouth: 'o', open: 0.55 };
        if ('mbp'.includes(c)) return { mouth: 'closed', open: 0 }; if (/[a-z]/.test(c)) return { mouth: 'small', open: 0.3 * jit }; return { mouth: 'closed', open: 0 }; } }
    return { mouth: 'closed', open: 0 }; }
  return null;
}
const talk = (TL, ids, t, e) => Object.assign({}, e, viseme(TL, ids, t) || {});
function blink(e, t, seed) { if (!e || !['open', 'half', 'wide', undefined].includes(e.eyes)) return e; const p = (t + seed) % 3.7; return p < 0.11 ? Object.assign({}, e, { eyes: 'closed' }) : e; }

// ---------------------------------------------------------------- camera
// keys: [t, x, y, z, mode, dur, dutch]; mode: 'cut' | 's' snap (0.18 s) | 'm' smooth move (dur) | 'w' whip (0.22 s + smear)
// slow drift (push-in) per key: z *= 1 + (t - t0) * drift  (default 0.01)
let WHIP = 0;
function cam(ctx, t, keys, o = {}) {
  let i = 0; keys.forEach((k, j) => { if (t >= k[0]) i = j; });
  const k = keys[i]; let [t0, x, y, z, mode, dur, dutch] = k; dutch = dutch || 0; WHIP = 0;
  if (i > 0 && mode && mode !== 'cut') {
    const p = keys[i - 1], d = mode === 's' ? 0.18 : mode === 'w' ? 0.24 : (dur || 1), u0 = clamp((t - t0) / d), u = mode === 'm' ? ease(u0) : eout(u0);
    const pz = p[3] * (1 + Math.min(t0 - p[0], 30) * (o.drift ?? 0.01));
    x = lerp(p[1], x, u); y = lerp(p[2], y, u); z = lerp(pz, z, u); dutch = lerp(p[6] || 0, dutch, u);
    if (mode === 'w' && u0 < 1) WHIP = Math.sin(u0 * Math.PI) * Math.sign(k[1] - p[1] || 1);
    if (u0 < 1) { ctx.translate(W / 2, H / 2); ctx.rotate(dutch); ctx.scale(z, z); ctx.translate(-x, -y); return { x, y, z }; }
    t0 += d;
  }
  z *= 1 + (t - t0) * (k[7] ?? o.drift ?? 0.01);
  ctx.translate(W / 2, H / 2); ctx.rotate(dutch); ctx.scale(z, z); ctx.translate(-x, -y);
  return { x, y, z };
}
function shake(ctx, t, a) { if (a > 0) ctx.translate((hash(Math.floor(t * 30)) - 0.5) * a, (hash(Math.floor(t * 30) + 9) - 0.5) * a); }
// directional smear for whip pans (post pass on the finished frame)
let tmp = null;
function whipSmear(ctx, amt) {
  if (Math.abs(amt) < 0.05) return; tmp = tmp || createCanvas(W, H); const x = tmp.getContext('2d'); x.clearRect(0, 0, W, H); x.drawImage(ctx.canvas, 0, 0);
  ctx.save(); for (let i = 1; i <= 6; i++) { ctx.globalAlpha = 0.22; ctx.drawImage(tmp, amt * i * 26, 0); } ctx.restore();
}

// ---------------------------------------------------------------- text
function outlined(ctx, txt, x, y, size, fill, o = {}) {
  ctx.save(); ctx.font = `${size}px ${o.font || 'Anton'}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; }
  ctx.lineWidth = o.lw || size * 0.2; ctx.strokeStyle = o.stroke || '#0b0c0f'; ctx.strokeText(txt, x, y); ctx.shadowColor = 'transparent'; ctx.fillStyle = fill; ctx.fillText(txt, x, y); ctx.restore();
}
// rubber-stamp label: pops in with overshoot
function stamp(ctx, t, t0, txt, x, y, o = {}) {
  const u = (t - t0) / 0.22; if (u < 0 || (o.t1 && t > o.t1)) return;
  const col = o.col || '#d6413a', size = o.size || 74, k = 1 + (1 - back(u)) * 1.2, a = clamp(u * 2) * (o.t1 ? clamp((o.t1 - t) / 0.2) : 1);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(k, k); ctx.globalAlpha = a;
  ctx.font = `${size}px Anton`; const cw = o.check ? size * 0.9 : 0, tw = ctx.measureText(txt).width + size * 0.7 + cw, th = size * 1.45;
  ctx.fillStyle = o.bg || 'rgba(246,242,228,0.96)'; ctx.fillRect(-tw / 2, -th / 2, tw, th); ctx.lineWidth = size * 0.12; ctx.strokeStyle = col; ctx.strokeRect(-tw / 2 + 6, -th / 2 + 6, tw - 12, th - 12);
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -cw / 2, 3);
  if (o.check) { const x0 = tw / 2 - size * 0.35 - cw; ctx.lineWidth = size * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + cw * 0.35, size * 0.32); ctx.lineTo(x0 + cw * 0.9, -size * 0.38); ctx.stroke(); }
  ctx.restore();
}
// "DAY N" end card: black, big title slams in, sub line typed under it
function dayCard(ctx, t, t0, t1, title, sub, o = {}) {
  if (t < t0 || t >= t1) return false; const lt = t - t0;
  ctx.fillStyle = '#0b0b0d'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.06; for (let i = 0; i < 40; i++) { ctx.fillStyle = '#fff'; ctx.fillRect(hash(i + Math.floor(t * 12)) * W, 0, 2, H); } ctx.restore();
  const k = 1 + (1 - back(lt / 0.3)) * 0.6; ctx.save(); ctx.translate(W / 2, H / 2 - 70); ctx.scale(k, k); outlined(ctx, title, 0, 0, 170, o.col || '#f4efe4', { lw: 18 }); ctx.restore();
  if (sub) { const n = Math.floor(clamp((lt - 0.55) / 0.6) * sub.length); outlined(ctx, sub.slice(0, n), W / 2, H / 2 + 110, 76, o.subCol || '#ffd23f', { lw: 12 }); }
  const fo = clamp((t1 - t) / 0.25); if (fo < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - fo})`; ctx.fillRect(0, 0, W, H); }
  return true;
}

// ---------------------------------------------------------------- captions
const SPK = { N: '#ffffff', H: '#ffd23f', G: '#d9c4ff', S: '#8fe3d8', R: '#b9f27c' };
function makeCaptions(TL) {
  const C2 = [];
  for (const l of TL.list) { if (!l.words.length) continue; let sent = [], groups = [];
    l.words.forEach((w, i) => { sent.push(w); if (/([.!?]|\.\.\.)$/.test(w.w) || i === l.words.length - 1 || (sent.length >= 5 && /,$/.test(w.w))) { groups.push(sent); sent = []; } });
    const out = []; const txt = a => a.map(w => w.w).join(' ');
    for (const g of groups) { const last = out[out.length - 1]; if (last && (txt(last) + ' ' + txt(g)).length <= 30) last.push(...g); else if (txt(g).length > 34) { // long sentence: split by words
        let cur = []; for (const w of g) { if (cur.length && (txt(cur) + ' ' + w.w).length > 30) { out.push(cur); cur = []; } cur.push(w); } if (cur.length) out.push(cur); } else out.push([...g]); }
    for (const g of out) C2.push(Object.assign(g, { col: SPK[l.who], id: l.id })); }
  C2.sort((a, b) => a[0].t0 - b[0].t0);
  C2.forEach((c, i) => { c.t0 = c[0].t0 - 0.05; const nx = C2[i + 1]; c.t1 = Math.min(nx ? nx[0].t0 - 0.05 : 1e9, c[c.length - 1].t1 + 0.6);
    const L = c.map(w => w.w).join(' ').length; let best = c.length, diff = 1e9;
    if (L > 18) for (let k = 1; k < c.length; k++) { const a = c.slice(0, k).map(w => w.w).join(' ').length, d = Math.abs(a - (L - a - 1)) - (/[.!?,]$/.test(c[k - 1].w) ? 8 : 0); if (d < diff) { diff = d; best = k; } }
    c.lines = best < c.length ? [c.slice(0, best), c.slice(best)] : [c]; });
  return C2;
}
function caption(ctx, C2, t, top) {
  const c = C2.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const n = c.lines.length, lh = 112, size = 96, y0 = top ? 100 : 975 - (n - 1) * lh;
  const pop = Math.min(1, 1.15 - 0.15 * clamp((t - c.t0) / 0.12));
  ctx.save(); ctx.font = `${size}px Anton`; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  c.lines.forEach((ln, li) => {
    const words = ln.map(w => w.w.toUpperCase().replace(/^[-–]|[-–]$/g, '')), sp = 24, ws = words.map(w => ctx.measureText(w).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    const sc = Math.min(1, (W - 120) / tot); let x = W / 2 - tot * sc / 2;
    words.forEach((w, i) => { const on = t >= ln[i].t0 - 0.03; ctx.save(); ctx.translate(x + ws[i] * sc / 2, y0 + li * lh); ctx.scale(pop * sc, pop * sc); ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5; ctx.lineWidth = 20; ctx.strokeStyle = '#0b0c0f'; ctx.strokeText(w, 0, 0);
      ctx.shadowColor = 'transparent'; ctx.fillStyle = on ? c.col : 'rgba(235,235,235,0.9)'; ctx.fillText(w, 0, 0); ctx.restore(); x += (ws[i] + sp) * sc; });
  });
  ctx.restore();
}

// ---------------------------------------------------------------- grading / finishing
function grade(ctx, kind) {
  const G = { night: ['multiply', '#a3a3d8'], dawn: ['multiply', '#e8c9b0'], day: null, store: ['multiply', '#f2ecd8'], dark: ['multiply', '#7d7fa8'], stairs: ['multiply', '#c9c2b0'], red: ['multiply', '#e0a0a0'] }[kind];
  if (!G) return; ctx.save(); ctx.globalCompositeOperation = G[0]; ctx.fillStyle = G[1]; ctx.fillRect(-3000, -3000, 9000, 9000); ctx.restore();
}
function glow(ctx, x, y, r, col) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
const grain = createCanvas(W + 300, H + 200); { const x = grain.getContext('2d'); for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,255,255,${hash(i) * 0.04})`; x.fillRect(hash(i + 1) * (W + 300), hash(i + 2) * (H + 200), 2, 2); } }
function finish(ctx, t, vig = 0.45) {
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${vig})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(grain, -(Math.floor(t * 24) % 4) * 41, -(Math.floor(t * 24) % 3) * 29);
}
function fade(ctx, a) { if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${clamp(a)})`; ctx.fillRect(0, 0, W, H); } }
function flash(ctx, a, col = '255,255,255') { if (a > 0) { ctx.fillStyle = `rgba(${col},${clamp(a)})`; ctx.fillRect(0, 0, W, H); } }
// speed lines for comic moments (screen space)
function speedLines(ctx, t, a, cx = W / 2, cy = H / 2) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; for (let i = 0; i < 40; i++) { const an = hash(i) * 7, r0 = 380 + hash(i + Math.floor(t * 20)) * 300; ctx.lineWidth = 3 + hash(i + 2) * 6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); ctx.lineTo(cx + Math.cos(an) * 1400, cy + Math.sin(an) * 1400); ctx.stroke(); } ctx.restore(); }
function sfxWord(ctx, t, t0, txt, x, y, o = {}) { const u = (t - t0) / (o.d || 0.6); if (u < 0 || u > 1) return; const k = 0.6 + 0.5 * back(clamp(u / 0.3)); ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.1); ctx.scale(k, k); ctx.globalAlpha = clamp((1 - u) / 0.25); outlined(ctx, txt, 0, 0, o.size || 110, o.col || '#ffd23f', { lw: 20 }); ctx.restore(); }

module.exports = { W, H, FPS, clamp, lerp, ease, eout, ein, back, hash, A, kf, pulse, win, LINES, build, viseme, talk, blink, cam, shake, whipSmear, getWhip: () => WHIP, outlined, stamp, dayCard, makeCaptions, caption, grade, glow, finish, fade, flash, speedLines, sfxWord, createCanvas };
