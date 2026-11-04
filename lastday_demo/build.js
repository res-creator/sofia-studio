// Last Day Protocol — 1-minute demo. Usage: node lastday_demo/build.js
// Voice: Fish Audio free model (key comes from env FISH_API_KEY or the proxy; never in code).
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');

const DIR = __dirname, VO = path.join(DIR, 'vo');
const W = 1280, H = 720, FPS = 30, GAP = 0.45, TD = 0.3;
fs.mkdirSync(VO, { recursive: true });

const BEATS = [
  "It's the last day on Earth. The sun is up. The news is calm. And everyone knows it ends tonight.",
  "So what would you actually do? Most people imagine something huge. Climb a mountain. Quit the job. Spend every last dollar.",
  "But look at the final messages people send when the end is near. They're almost never about money. Or fame. They're short. And they all say the same thing.",
  "At nine in the morning, the phones light up. Everyone calls the same few people.",
  "By noon, the streets go quiet. Nobody is rushing anymore. For the first time in their lives, nobody is late.",
  "At sunset, the big plans are forgotten. People simply sit beside the ones they love.",
  "The last day was never about what you do. It's about who you're with.",
  "So, who would you spend yours with? Tell us in the comments. And follow Last Day Protocol, for the next day.",
];

// ---------- voice ----------
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function tts(i) {
  const f = path.join(VO, `b${i}.mp3`);
  if (fs.existsSync(f) && fs.statSync(f).size > 2000) return f;
  const body = JSON.stringify({ text: BEATS[i], format: 'mp3', latency: 'normal' });
  const code = execFileSync('curl', ['-sS', '-m', '90', '-o', f, '-w', '%{http_code}', 'https://api.fish.audio/v1/tts', '-H', 'Authorization: Bearer ' + (process.env.FISH_API_KEY || 'dummy'), '-H', 'Content-Type: application/json', '-H', 'model: s2.1-pro-free', '-d', body]).toString();
  if (code !== '200') { const m = fs.readFileSync(f, 'utf8').slice(0, 200); fs.unlinkSync(f); throw new Error('TTS ' + i + ' ' + code + ' ' + m); }
  return f;
}
const dur = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

// ---------- drawing helpers (ink on paper) ----------
const INK = '#1c1a17', RED = '#c0392b', PAPER = '#F3EBDC';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo = u => 1 - Math.pow(1 - clamp(u), 3);
const eio = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
let boil = 0;
const jit = (k) => Math.sin(k * 12.9898 + boil * 78.233) * 1.4;

function ln(ctx, x1, y1, x2, y2, w = 5, col = INK) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x1 + jit(x1 + y1), y1 + jit(x2 + y2));
  ctx.lineTo((x1 + x2) / 2 + jit(x1 * 2), (y1 + y2) / 2 + jit(y1 * 3));
  ctx.lineTo(x2 + jit(x2), y2 + jit(y2)); ctx.stroke();
}
function circ(ctx, x, y, r, w = 5, col = INK, fill) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
  for (let a = 0; a <= 6.4; a += 0.2) { const rr = r + jit(a * 7 + x); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.stroke();
}
function rect(ctx, x, y, w, h, lw = 5, col = INK, fill) {
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
  ln(ctx, x, y, x + w, y, lw, col); ln(ctx, x + w, y, x + w, y + h, lw, col); ln(ctx, x + w, y + h, x, y + h, lw, col); ln(ctx, x, y + h, x, y, lw, col);
}
// stick figure: (x,y)=feet. s=scale. p: armL, armR, legL, legR angles (rad from straight down), lean, face dir
function fig(ctx, x, y, s, p = {}) {
  const { aL = .5, aR = -.5, lL = .18, lR = -.18, lean = 0, bob = 0, col = INK } = p;
  const hy = y - 150 * s + bob, sy = y - 118 * s + bob, hipy = y - 62 * s + bob;
  const hx = x + lean * 40 * s;
  ln(ctx, hx, sy, x, hipy, 6 * s + 1, col);
  circ(ctx, hx, hy, 24 * s, 5 * s + 1, col, PAPER);
  const arm = a => [hx + Math.sin(a) * 52 * s, sy + 6 * s + Math.cos(a) * 52 * s];
  const leg = a => [x + Math.sin(a) * 62 * s, hipy + Math.cos(a) * 62 * s];
  let e = arm(aL); ln(ctx, hx, sy + 6 * s, e[0], e[1], 6 * s + 1, col);
  e = arm(aR); ln(ctx, hx, sy + 6 * s, e[0], e[1], 6 * s + 1, col);
  e = leg(lL); ln(ctx, x, hipy, e[0], e[1], 6 * s + 1, col);
  e = leg(lR); ln(ctx, x, hipy, e[0], e[1], 6 * s + 1, col);
  return { hx, hy };
}
function txt(ctx, s, x, y, size, col = INK, align = 'center', font = 'FredokaL') {
  ctx.fillStyle = col; ctx.font = `600 ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}
function heart(ctx, x, y, sz, col = RED) {
  ctx.fillStyle = col; ctx.beginPath(); const k = sz / 100;
  ctx.moveTo(x, y + 35 * k); ctx.bezierCurveTo(x - 90 * k, y - 20 * k, x - 45 * k, y - 85 * k, x, y - 35 * k);
  ctx.bezierCurveTo(x + 45 * k, y - 85 * k, x + 90 * k, y - 20 * k, x, y + 35 * k); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
}
function ground(ctx, y, a = 1) { ctx.globalAlpha = a; ln(ctx, 80, y, W - 80, y, 5); ctx.globalAlpha = 1; }
function sun(ctx, x, y, r, t) {
  circ(ctx, x, y, r, 6, RED, '#f6c453');
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + t * .3; ln(ctx, x + Math.cos(a) * (r + 14), y + Math.sin(a) * (r + 14), x + Math.cos(a) * (r + 40), y + Math.sin(a) * (r + 40), 5, RED); }
}
function clock(ctx, x, y, r, hr, mn) {
  circ(ctx, x, y, r, 6, INK, '#fffaf0');
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ln(ctx, x + Math.sin(a) * (r - 14), y - Math.cos(a) * (r - 14), x + Math.sin(a) * (r - 4), y - Math.cos(a) * (r - 4), 4); }
  const ha = hr / 12 * Math.PI * 2, ma = mn / 60 * Math.PI * 2;
  ln(ctx, x, y, x + Math.sin(ha) * r * .5, y - Math.cos(ha) * r * .5, 8); ln(ctx, x, y, x + Math.sin(ma) * r * .78, y - Math.cos(ma) * r * .78, 5, RED);
}
function skyline(ctx, y, a = 1) {
  ctx.globalAlpha = a; const hs = [150, 230, 120, 280, 180, 140, 250, 170, 110, 220];
  hs.forEach((h, i) => { const x = 90 + i * 112; rect(ctx, x, y - h, 90, h, 4, INK, '#e9dfcb'); for (let r = 0; r < Math.floor(h / 50); r++) rect(ctx, x + 18, y - h + 18 + r * 46, 20, 20, 3, '#8a7f6b'); });
  ctx.globalAlpha = 1;
}
function bubble(ctx, x, y, w, h, s, a = 1) {
  ctx.globalAlpha = a; rect(ctx, x, y, w, h, 4, INK, '#fffaf0'); txt(ctx, s, x + w / 2, y + h / 2, 30); ctx.globalAlpha = 1;
}

// ---------- scenes: draw(ctx, p (0..1 progress), lt (local seconds)) ----------
const SC = [
  // 0 hook
  (c, p, t) => {
    ground(c, 560); sun(c, 640, 190 + p * 30, 70, t); skyline(c, 560, .9);
    fig(c, 640, 560, 1.3, { aL: 2.6, aR: -2.6, lL: .15, lR: -.15, bob: Math.sin(t * 2) * 2 });
    const a = eo(t / .8) * (1 - eio((t - 2.2) / .5));
    c.globalAlpha = a; txt(c, 'THE LAST DAY PROTOCOL', 640, 70, 56, RED); c.globalAlpha = 1;
  },
  // 1 big plans
  (c, p, t) => {
    ground(c, 580); fig(c, 330, 580, 1.4, { aL: .9, aR: -.9, bob: Math.sin(t * 2) * 2 });
    const items = [
      () => { ln(c, 700, 380, 780, 250, 6); ln(c, 780, 250, 860, 380, 6); ln(c, 700, 380, 860, 380, 6); ln(c, 780, 250, 780, 205, 4, RED); rect(c, 780, 205, 40, 24, 4, RED, RED); },
      () => { rect(c, 920, 320, 120, 80, 6, INK, '#c9a66b'); rect(c, 955, 295, 50, 25, 5); ln(c, 910, 300, 1050, 420, 9, RED); ln(c, 1050, 300, 910, 420, 9, RED); },
      () => { txt(c, '$ $ $', 1130, 360, 64, '#2e7d32'); ln(c, 1060, 330, 1200, 395, 8, RED); },
    ];
    items.forEach((fn, i) => { const u = eo((t - 0.6 - i * 1.3) / .5); if (u > 0) { c.save(); c.globalAlpha = u; c.translate(0, (1 - u) * 30); fn(); c.restore(); } });
    c.globalAlpha = eo(t / .5); circ(c, 500, 230, 12, 4); circ(c, 470, 275, 8, 4); c.globalAlpha = 1;
  },
  // 2 messages
  (c, p, t) => {
    rect(c, 480, 60, 320, 600, 9, INK, '#fffaf0'); ln(c, 600, 90, 680, 90, 6);
    const m = [['mom', 'I love you'], ['', 'Tell her I love her'], ['', 'I love you. Come home.'], ['', 'I love you.']];
    m.forEach((q, i) => { const u = eo((t - .5 - i * 1.5) / .4); if (u > 0) { c.save(); c.globalAlpha = u; const L = i % 2 === 0; rect(c, L ? 505 : 560, 140 + i * 120, 215, 80, 4, INK, L ? '#f1e4c8' : '#ffd9d4'); txt(c, q[1].length > 16 ? q[1].slice(0, 14) + '…' : q[1], L ? 612 : 667, 180 + i * 120, 24); c.restore(); } });
    const u = eo((t - 6.2) / .6); if (u > 0) { c.globalAlpha = u; heart(c, 1000, 360, 170 + Math.sin(t * 4) * 8); c.globalAlpha = 1; }
    txt(c, 'money?  fame?', 180, 260, 38, '#8a7f6b'); ln(c, 70, 262, 290, 262, 7, RED);
  },
  // 3 9AM phones
  (c, p, t) => {
    ground(c, 590); clock(c, 640, 230, 100, 9 + p * .0, 0);
    txt(c, '9:00 AM', 640, 365, 40, RED);
    [[300, 1], [640, 1.15], [980, 1]].forEach(([x, s], i) => {
      fig(c, x, 590, s, { aL: -2.7, aR: 0.2, bob: Math.sin(t * 3 + i) * 3 });
      const hx = x + 40 * s; c.globalAlpha = (Math.sin(t * 5 + i) > 0) ? 1 : .35; txt(c, ')))', hx + 40, 430, 34, RED); c.globalAlpha = 1;
    });
  },
  // 4 noon quiet
  (c, p, t) => {
    ground(c, 590); skyline(c, 590, .85); clock(c, 640, 120, 62, 12, 0);
    [[260, .2], [470, -.2], [800, .15], [1010, -.15]].forEach(([x, ph], i) => {
      const w = Math.sin(t * 1.4 + i * 2) * .22; fig(c, x + (t * 8 * (i % 2 ? -1 : 1)), 590, .85, { aL: .2 + w, aR: -.2 - w, lL: w * 1.3, lR: -w * 1.3 });
    });
    c.globalAlpha = eo((t - 1.5) / .8); txt(c, '…quiet…', 640, 660, 44, '#8a7f6b'); c.globalAlpha = 1;
  },
  // 5 sunset
  (c, p, t) => {
    const g = c.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, '#f6c9a0'); g.addColorStop(1, '#f3ebdc'); c.fillStyle = g; c.fillRect(0, 0, W, 560);
    circ(c, 640, 300 + p * 150, 110, 6, RED, '#f08a4b');
    c.fillStyle = PAPER; c.fillRect(0, 540, W, 200); ground(c, 540);
    fig(c, 560, 540, 1.1, { aL: .2, aR: -.2, lL: 1.35, lR: 1.2, lean: .2 });
    fig(c, 730, 540, 1.1, { aL: .2, aR: -.2, lL: -1.35, lR: -1.2, lean: -.2 });
    ln(c, 596, 440, 690, 440, 6, RED);
    c.globalAlpha = eo((t - 1) / 1); heart(c, 645, 360 - Math.sin(t * 2) * 6, 70); c.globalAlpha = 1;
  },
  // 6 thesis
  (c, p, t) => {
    const a1 = eo(t / .6), a2 = eo((t - 2.2) / .6);
    c.globalAlpha = a1; txt(c, 'It was never about', 640, 220, 54, '#8a7f6b'); txt(c, 'WHAT you do.', 640, 300, 96, INK); c.globalAlpha = 1;
    c.globalAlpha = a2; txt(c, "It's about", 640, 430, 54, '#8a7f6b'); txt(c, 'WHO you\'re with.', 640, 515, 96, RED); c.globalAlpha = 1;
    ln(c, 330, 345, 950, 345, 7, RED);
  },
  // 7 CTA
  (c, p, t) => {
    ground(c, 600); fig(c, 330, 600, 1.4, { aL: 2.5, aR: .4, bob: Math.sin(t * 3) * 3 });
    txt(c, 'Who would YOU spend', 800, 230, 56); txt(c, 'your last day with?', 800, 300, 56, RED);
    c.globalAlpha = eo((t - 1) / .6); rect(c, 560, 380, 480, 90, 6, RED, RED); txt(c, 'LAST DAY PROTOCOL', 800, 425, 44, '#fff');
    txt(c, 'comment · follow', 800, 520, 36, '#8a7f6b'); c.globalAlpha = 1;
  },
];

// ---------- caption chunks ----------
function chunks(text) {
  const words = text.split(/\s+/), out = []; let cur = [];
  for (const w of words) { cur.push(w); if (/[.,?!]$/.test(w) && cur.join(' ').length > 14 || cur.length >= 6) { out.push(cur.join(' ')); cur = []; } }
  if (cur.length) { if (out.length && cur.join(' ').length < 10) out[out.length - 1] += ' ' + cur.join(' '); else out.push(cur.join(' ')); }
  return out;
}

async function main() {
  const files = []; for (let i = 0; i < BEATS.length; i++) { files.push(await tts(i)); await sleep(1500); }
  const D = files.map(dur); let t0 = 0.4; const TL = D.map((d, i) => { const o = { t0, t1: t0 + d + GAP, a0: t0, d }; t0 = o.t1; return o; });
  const total = t0 + 0.4; console.error('total', total.toFixed(1) + 's', D.map(x => x.toFixed(1)).join(' '));

  // audio track
  const inputs = files.flatMap(f => ['-i', f]);
  const fc = TL.map((o, i) => `[${i}:a]adelay=${Math.round(o.a0 * 1000)}|${Math.round(o.a0 * 1000)},volume=1.0[a${i}]`).join(';') + ';' + TL.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${TL.length}:normalize=0,loudnorm=I=-16:TP=-1.5[out]`;
  const aud = path.join(DIR, 'vo_all.m4a');
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', fc, '-map', '[out]', '-t', String(total), aud]);

  const caps = TL.map((o, i) => { const cs = chunks(BEATS[i]), tot = cs.reduce((s, x) => s + x.length, 0); let a = o.a0; return cs.map(s => { const d = o.d * s.length / tot; const r = { s, a, b: a + d }; a += d; return r; }); }).flat();

  const c = createCanvas(W, H), ctx = c.getContext('2d');
  const silent = path.join(DIR, 'silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(total * FPS);
  const scene = (t) => { let i = 0; TL.forEach((o, j) => { if (t >= o.t0 - (j ? GAP / 2 : 0.4)) i = j; }); return i; };
  for (let f = 0; f < N; f++) {
    const t = f / FPS; boil = Math.floor(t * 8);
    const i = scene(t), o = TL[i], start = i ? o.t0 - GAP / 2 : 0, end = i < TL.length - 1 ? TL[i + 1].t0 - GAP / 2 : total;
    const lt = t - start, p = clamp(lt / (end - start));
    ctx.save(); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    const z = 1 + p * 0.04; ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    SC[i](ctx, p, lt); ctx.restore();
    const fade = Math.min(clamp(lt / TD), 1) * (i < TL.length - 1 ? clamp((end - t) / TD) : clamp((total - t) / .4));
    if (fade < 1) { ctx.fillStyle = PAPER; ctx.globalAlpha = 1 - fade; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    // vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, H); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,40,10,.18)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // caption
    const cap = caps.find(q => t >= q.a && t < q.b);
    if (cap) { ctx.font = '700 40px FredokaL'; const w = ctx.measureText(cap.s).width + 50; ctx.fillStyle = 'rgba(28,26,23,.88)'; ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, H - 82, w, 62, 16); ctx.fill(); txt(ctx, cap.s, W / 2, H - 50, 40, '#fff'); }
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  const out = path.join(DIR, 'last_day_protocol_demo.mp4');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', aud, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', out]);
  fs.unlinkSync(silent);
  // stills for QA
  [3, 12, 22, 32, 42, 52].forEach(t => { try { execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(Math.min(t, total - 1)), '-i', out, '-frames:v', '1', path.join(DIR, `still_${t}.png`)]); } catch (e) {} });
  console.error('done', out);
}
main().catch(e => { console.error(e); process.exit(1); });
