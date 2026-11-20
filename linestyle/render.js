// Line-art caricature style test (thin even outline, flat colors, two-tone hair locks, paper grain,
// translucent speech bubble). Own character: psychologist «Ирина Павловна».
// node linestyle/render.js [stills t1,t2]  -> linestyle/out/psiholog.mp4
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn, spawnSync} = require('child_process');
const fs = require('fs'), path = require('path');
const W = 1080, H = 1920, FPS = 30, D = __dirname;
const F = path.join(D, '..', 'node_modules', '@fontsource');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-cyrillic-400-normal.woff2', 'HC');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-latin-400-normal.woff2', 'HL');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-cyrillic-900-normal.woff2', 'NC');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-latin-900-normal.woff2', 'NL');
let g;

const C = {
  ink: '#1e1a1a', bg: '#e6d2f5', chair: '#2f8a7c', chairD: '#236c61',
  skin: '#f8d7bb', cheek: '#f6ad9c', nose: '#f2a39a', lipT: '#b8325f', lipB: '#d84a75',
  hairA: '#a79fd6', hairB: '#d9d3f2', shadow: '#9d6fe0', brow: '#7b6a9a',
  cardigan: '#f0b532', blouse: '#fffaf2', pearl: '#fff8ee', gold: '#d8a12a',
  table: '#d9a36d', tableD: '#b9814c', tissueBox: '#8fd0f0', note: '#fffdf6', glass: 'rgba(200,235,255,0.55)',
};
const LW = 4.5;

// ---------- paper grain ----------
const PAPER = (() => { const c = createCanvas(W, H), x = c.getContext('2d'), im = x.createImageData(W, H); let s = 3;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < im.data.length; i += 4) { const v = 150 + (r() - .5) * 120; im.data[i] = v; im.data[i + 1] = v; im.data[i + 2] = v; im.data[i + 3] = 14; }
  x.putImageData(im, 0, 0); x.strokeStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i < 2500; i++) { const px = r() * W, py = r() * H, a = r() * 6.28, l = 4 + r() * 14; x.lineWidth = .8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  return c; })();

// ---------- smooth shapes (Catmull-Rom through points) ----------
function crPath(pts, closed = true, tension = 0.5) {
  const n = pts.length, P = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  g.beginPath(); g.moveTo(...pts[0]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3, p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  if (closed) g.closePath();
}
function shape(pts, fill, lw = LW, closed = true) { crPath(pts, closed); if (fill && closed) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = C.ink; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
const line = (pts, lw = LW) => shape(pts, null, lw, false);
function oval(x, y, rx, ry, fill, lw = LW, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = C.ink; g.lineWidth = lw; g.stroke(); } }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };

// ---------- set ----------
function chair() {
  shape([[250, 1560], [235, 1120], [300, 960], [540, 920], [780, 960], [845, 1120], [830, 1560]], C.chair);
  line([[300, 1000], [540, 965], [780, 1000]], 3);
}
function table(st) {
  shape([[-20, 1560], [1100, 1560], [1100, 1960], [-20, 1960]], C.table);
  line([[-20, 1600], [1100, 1600]], 3);
  // glass of water
  shape([[150, 1440], [240, 1440], [232, 1580], [158, 1580]], C.glass);
  shape([[156, 1500], [234, 1500], [232, 1580], [158, 1580]], 'rgba(120,190,240,0.45)', 0);
  oval(195, 1440, 45, 11, 'rgba(230,245,255,0.8)', 3);
  // tissue box (pushed forward in the last shot)
  const tx = 760 - (st.push || 0) * 220, ty = 1470 + (st.push || 0) * 30;
  shape([[tx - 120, ty], [tx + 120, ty], [tx + 120, ty + 110], [tx - 120, ty + 110]], C.tissueBox);
  oval(tx, ty + 6, 60, 12, '#5aa9d6', 3);
  shape([[tx - 34, ty + 4], [tx - 40, ty - 60], [tx - 4, ty - 40], [tx + 20, ty - 80], [tx + 36, ty + 4]], '#ffffff', 3.5);
  for (const k of [-70, 0, 70]) oval(tx + k, ty + 60, 14, 14, '#ffffff', 0);
}

// ---------- Ирина Павловна ----------
function irina(st) {
  const x = 540, y = 1040 + Math.sin(st.t * 1.4) * 2; // head center
  // hair back (bob, two-tone)
  shape([[x - 235, y + 140], [x - 250, y - 40], [x - 180, y - 190], [x, y - 230], [x + 180, y - 190], [x + 250, y - 40], [x + 235, y + 140], [x + 150, y + 160], [x - 150, y + 160]], C.hairA);
  // neck + body
  shape([[x - 52, y + 120], [x + 52, y + 120], [x + 58, y + 230], [x - 58, y + 230]], C.skin);
  shape([[x - 250, 1560], [x - 240, y + 290], [x - 150, y + 215], [x + 150, y + 215], [x + 240, y + 290], [x + 250, 1560]], C.cardigan);
  shape([[x - 110, y + 218], [x + 110, y + 218], [x + 40, y + 360], [x, y + 420], [x - 40, y + 360]], C.blouse);
  shape([[x - 70, y + 210], [x + 70, y + 210], [x, y + 330]], C.skin);
  line([[x - 150, y + 215], [x - 60, y + 520], [x - 70, 1560]], 3.5); line([[x + 150, y + 215], [x + 60, y + 520], [x + 70, 1560]], 3.5);
  for (const k of [0, 1, 2]) oval(x - 78 + k * 4, y + 560 + k * 120, 9, 9, '#c9851c', 3);
  // pearls
  for (let i = 0; i <= 12; i++) { const u = i / 12, px = x - 95 + u * 190, py = y + 222 + Math.sin(u * Math.PI) * 72; oval(px, py, 13, 13, C.pearl, 3); }
  // ears + earrings
  for (const s of [-1, 1]) { shape([[x + s * 160, y - 10], [x + s * 200, y - 20], [x + s * 205, y + 40], [x + s * 168, y + 60]], C.skin, LW); oval(x + s * 192, y + 78, 15, 15, C.pearl, 3.5); }
  // face
  shape([[x - 170, y - 70], [x - 150, y - 160], [x, y - 190], [x + 150, y - 160], [x + 170, y - 70], [x + 160, y + 70], [x + 90, y + 150], [x, y + 172], [x - 90, y + 150], [x - 160, y + 70]], C.skin);
  // cheeks
  oval(x - 105, y + 70, 46, 38, C.cheek, 0); oval(x + 105, y + 70, 46, 38, C.cheek, 0);
  // eyes (heavy lids, lashes, bags)
  const look = st.look || 0;
  for (const s of [-1, 1]) {
    const ex = x + s * 72, ey = y + 2;
    if (st.blink) { line([[ex - 46, ey], [ex, ey + 8], [ex + 46, ey]]); line([[ex - 40, ey + 34], [ex, ey + 44], [ex + 36, ey + 34]], 2.5); continue; }
    shape([[ex - 46, ey], [ex - 20, ey - 30], [ex + 22, ey - 32], [ex + 46, ey - 2], [ex + 20, ey + 26], [ex - 22, ey + 26]], '#ffffff');
    g.save(); crPath([[ex - 46, ey], [ex - 20, ey - 30], [ex + 22, ey - 32], [ex + 46, ey - 2], [ex + 20, ey + 26], [ex - 22, ey + 26]]); g.clip();
    oval(ex + look * 10, ey + 4, 24, 26, C.ink, 0); oval(ex + look * 10 + 8, ey - 6, 6, 6, '#ffffff', 0);
    const lid = st.lid ?? 0.45; g.fillStyle = C.shadow; g.fillRect(ex - 60, ey - 60, 120, 30 + 54 * lid); g.restore();
    line([[ex - 48, ey - 30 + 54 * lid], [ex, ey - 34 + 54 * lid], [ex + 48, ey - 30 + 54 * lid]], 5);
    for (let k = 0; k < 5; k++) line([[ex - 36 + k * 18, ey - 30 + 54 * lid], [ex - 40 + k * 18 + s * 4, ey - 44 + 54 * lid]], 2.5);
    line([[ex - 36, ey + 36], [ex, ey + 46], [ex + 34, ey + 36]], 2.5); // bag
    // brows
    shape([[ex - 52, ey - 70 - (st.brow || 0)], [ex - 10, ey - 88 - (st.brow || 0)], [ex + 44, ey - 74 - (st.brow || 0)], [ex + 40, ey - 62 - (st.brow || 0)], [ex - 10, ey - 74 - (st.brow || 0)], [ex - 48, ey - 60 - (st.brow || 0)]], C.brow, 3);
  }
  // big round glasses (thin gold) + chain
  g.strokeStyle = C.gold; g.lineWidth = 5;
  for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * 72, y + 4, 66, 0, 7); g.stroke(); }
  g.beginPath(); g.moveTo(x - 8, y); g.quadraticCurveTo(x, y - 10, x + 8, y); g.stroke();
  g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 138, y + 10); g.quadraticCurveTo(x - 200, y + 260, x - 100, y + 330); g.stroke(); g.beginPath(); g.moveTo(x + 138, y + 10); g.quadraticCurveTo(x + 200, y + 260, x + 100, y + 330); g.stroke();
  // nose
  shape([[x - 6, y + 20], [x + 8, y + 20], [x + 16, y + 84], [x, y + 92], [x - 14, y + 84]], C.nose, 0);
  // wrinkles
  line([[x - 70, y + 100], [x - 58, y + 128], [x - 54, y + 150]], 2.5); line([[x + 70, y + 100], [x + 58, y + 128], [x + 54, y + 150]], 2.5);
  // mouth
  const my = y + 128, open = st.mouth || 0;
  if (open > 0.5) { shape([[x - 46, my], [x, my - 12], [x + 46, my], [x, my + 34]], C.lipT); shape([[x - 30, my + 6], [x + 30, my + 6], [x + 22, my + 20], [x - 22, my + 20]], '#ffffff', 2.5); }
  else if (st.smile) { shape([[x - 50, my - 4], [x - 20, my - 14], [x, my - 8], [x + 20, my - 14], [x + 50, my - 4], [x, my + 22]], C.lipB); line([[x - 50, my - 4], [x, my + 6], [x + 50, my - 4]], 3); }
  else { shape([[x - 44, my], [x - 18, my - 14], [x, my - 8], [x + 18, my - 14], [x + 44, my], [x, my + 20]], C.lipB); line([[x - 44, my], [x, my + 2], [x + 44, my]], 3); }
  // hair front: side-swept bangs, two tones
  shape([[x - 175, y - 40], [x - 160, y - 170], [x - 40, y - 222], [x + 120, y - 200], [x + 200, y - 120], [x + 170, y - 70], [x + 60, y - 120], [x - 60, y - 110], [x - 140, y - 60]], C.hairA);
  shape([[x - 40, y - 200], [x + 110, y - 190], [x + 196, y - 118], [x + 170, y - 74], [x + 90, y - 128], [x - 10, y - 150]], C.hairB);
  line([[x - 120, y - 150], [x - 20, y - 175], [x + 60, y - 165]], 3); line([[x + 40, y - 150], [x + 130, y - 140], [x + 180, y - 100]], 3);
  // arms + notebook + pen
  const pen = st.pen || 0, wr = Math.sin(st.t * 14) * 6 * (st.writing ? 1 : 0);
  shape([[x - 250, y + 300], [x - 300, y + 420], [x - 230, y + 470], [x - 60, y + 420], [x - 70, y + 360], [x - 200, y + 380]], C.cardigan); // left arm
  shape([[x - 190, y + 310], [x + 40, y + 310], [x + 30, y + 480], [x - 200, y + 480]], C.note); // notebook
  for (let k = 0; k < 7; k++) oval(x - 170 + k * 32, y + 310, 8, 12, null, 3);
  for (let k = 0; k < 4; k++) line([[x - 150, y + 360 + k * 28], [x + 10, y + 360 + k * 28]], 2);
  if (st.writing || st.scribble) line([[x - 120, y + 458], [x - 80, y + 448], [x - 50, y + 462], [x - 20, y + 450 + wr * .5]], 2.5);
  for (let k = 0; k < 4; k++) oval(x - 186 + k * 3, y + 350 + k * 26, 18, 13, C.skin, 3); // fingers over notebook edge
  const hx = x + 10 + pen * 150 + wr, hy = y + 440 - pen * 110;
  shape([[x + 240, y + 290], [x + 300, y + 430], [hx + 50, hy + 36], [hx - 6, hy - 22], [x + 200, y + 360]], C.cardigan); // right arm
  g.save(); g.translate(hx, hy); g.rotate(-0.7 + pen * 0.5);
  shape([[-6, -120], [6, -120], [6, 10], [0, 26], [-6, 10]], '#4a4ad8', 3); g.restore();
  shape([[hx - 28, hy - 14], [hx + 10, hy - 30], [hx + 40, hy - 4], [hx + 36, hy + 30], [hx - 10, hy + 34], [hx - 34, hy + 12]], C.skin);
  line([[hx - 20, hy - 6], [hx + 10, hy - 14]], 2.5); line([[hx - 16, hy + 10], [hx + 14, hy + 2]], 2.5);
}

// ---------- bubble + watermark ----------
function bubble(text, k) {
  if (!text) return;
  const a = ease(k / 0.18), s = 0.85 + 0.15 * a;
  g.save(); g.globalAlpha = a; g.translate(W / 2, 420); g.scale(s, s); g.translate(-W / 2, -420);
  g.font = '50px HL, HC'; g.letterSpacing = '7px';
  const lines = text, tw = Math.max(...lines.map(l => g.measureText(l).width)), rx = Math.max(300, tw / 2 + 110), ry = 70 + lines.length * 32;
  g.beginPath(); g.ellipse(W / 2, 420, rx, ry, 0, 0, 7); g.moveTo(W / 2 + rx * 0.45, 420 + ry * 0.75); g.lineTo(W / 2 + rx * 0.5, 420 + ry + 60); g.lineTo(W / 2 + rx * 0.68, 420 + ry * 0.62); g.closePath();
  g.fillStyle = 'rgba(255,250,252,0.72)'; g.fill();
  g.fillStyle = '#2b2424'; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, W / 2, 420 + (i - (lines.length - 1) / 2) * 68));
  g.letterSpacing = '0px'; g.restore();
}
function watermark() { g.font = '44px NL, NC'; g.letterSpacing = '3px'; g.fillStyle = 'rgba(255,255,255,0.95)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('@SHUSHA.ART', W / 2, 245); g.letterSpacing = '0px'; }

// ---------- shots ----------
const talk = (t, until) => (t > 0.15 && t < until ? (Math.floor(t * 7) % 2 ? 1 : 0) : 0);
const blinkAt = (t, at) => at.some(a => t > a && t < a + 0.12);
const MED = {z: 1.1, cx: 540, cy: 1000}, CLOSE = {z: 1.8, cx: 540, cy: 975};
const SHOTS = [
  {dur: 2.8, cam: MED, st: t => ({t, writing: true, look: 0.2, lid: .55, mouth: talk(t, 1.6), blink: blinkAt(t, [2.0])}), say: ['Я ОЧЕНЬ ВНИМАТЕЛЬНО', 'ВАС ВЫСЛУШАЛА'], sfx: [[0.05, 'pop', 0.5]]},
  {dur: 2.8, cam: MED, st: t => ({t, pen: ease(t / 0.5), scribble: true, look: 0, lid: .4, brow: 8, mouth: talk(t, 1.7), blink: blinkAt(t, [2.2])}), say: ['И КАК СПЕЦИАЛИСТ', 'МОГУ СКАЗАТЬ…'], sfx: [[0.05, 'pop', 0.5]]},
  {dur: 3.0, cam: CLOSE, st: t => ({t, pen: 1, scribble: true, look: 0, lid: .5, smile: t > 1.6, mouth: talk(t, 1.5), blink: blinkAt(t, [2.4])}), say: ['…НАШЕ ВРЕМЯ ВЫШЛО.', 'С ВАС ПЯТЬ ТЫСЯЧ'], sfx: [[0.05, 'pop', 0.5], [1.7, 'coin', 0.7]]},
  {dur: 2.6, cam: MED, st: t => ({t, pen: 1, scribble: true, push: ease((t - 0.2) / 0.5), look: 0.3, lid: .55, smile: true, mouth: talk(t, 1.1), blink: blinkAt(t, [1.8])}), say: ['САЛФЕТКИ — ОТДЕЛЬНО'], sfx: [[0.05, 'pop', 0.5], [1.4, 'sad', 0.6]]},
];
const TOTAL = SHOTS.reduce((a, s) => a + s.dur, 0);

function frame(time) {
  let s0 = 0, shot = SHOTS[SHOTS.length - 1]; for (const s of SHOTS) { if (time < s0 + s.dur) { shot = s; break; } s0 += s.dur; }
  const t = time - s0, cam = shot.cam;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  const st = shot.st(t);
  chair(); irina(st); table(st);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(PAPER, 0, 0);
  watermark(); bubble(shot.say, t);
}

const cv = createCanvas(W, H); g = cv.getContext('2d');
const outDir = path.join(D, 'out'); fs.mkdirSync(outDir, {recursive: true});
if (process.argv[2]) { for (const s of process.argv[2].split(',').map(Number)) { frame(s); fs.writeFileSync(path.join(outDir, `still_${s}.png`), cv.toBuffer('image/png')); } process.exit(0); }
const out = path.join(outDir, 'psiholog.mp4'), silent = out + '.silent.mp4';
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', silent], {stdio: ['pipe', 'inherit', 'inherit']});
(async () => {
  for (let i = 0; i < Math.round(TOTAL * FPS); i++) { frame(i / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  const AUD = path.join(D, '..', 'asya', 'audio'), ev = []; let s0 = 0;
  for (const s of SHOTS) { for (const [t, n, v] of s.sfx || []) ev.push([s0 + t, n, v]); s0 += s.dur; }
  const args = ['-y', '-v', 'error', '-i', silent, '-stream_loop', '-1', '-i', path.join(AUD, 'theme.mp3')]; ev.forEach(([, n]) => args.push('-i', path.join(AUD, n + '.mp3')));
  let fc = `[1:a]atrim=0:${TOTAL},asetpts=N/SR/TB,volume=0.28,afade=t=out:st=${(TOTAL - 0.7).toFixed(2)}:d=0.7[m]`; const lab = ['[m]'];
  ev.forEach(([t, , v], i) => { const ms = Math.round(t * 1000); fc += `;[${i + 2}:a]volume=${v},adelay=${ms}|${ms}[s${i}]`; lab.push(`[s${i}]`); });
  fc += `;${lab.join('')}amix=inputs=${lab.length}:normalize=0:duration=first,alimiter=limit=0.9[a]`;
  args.push('-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(TOTAL), '-movflags', '+faststart', out);
  if (spawnSync('ffmpeg', args, {stdio: 'inherit'}).status) throw new Error('mix failed');
  fs.unlinkSync(silent); console.log(out, TOTAL.toFixed(1));
})();
