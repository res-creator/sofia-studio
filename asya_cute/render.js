// Ася и Бублик — "cute clean line" style test (thin uniform outlines, flat pastel fills,
// big black eyes with highlights, speech bubbles on a plain pastel background).
// node asya_cute/render.js [stills t1,t2]  -> asya_cute/out/domik.mp4
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn, spawnSync} = require('child_process');
const fs = require('fs'), path = require('path');
const W = 1080, H = 1920, FPS = 30, D = __dirname;
const F = path.join(D, '..', 'node_modules', '@fontsource');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-cyrillic-400-normal.woff2', 'HC');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-latin-400-normal.woff2', 'HL');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-cyrillic-700-normal.woff2', 'NC');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-latin-700-normal.woff2', 'NL');
const FONT = 'HL, HC, NL, NC';
let g;

const C = {
  ink: '#2e2626', bg: '#f7c4d4', shadow: '#e3a2b8', white: '#ffffff', bubbleText: '#3a3030',
  skin: '#ffe2cc', blush: '#ff9fb0', hair: '#e0682e', hairD: '#b8481a', shirt: '#7ec8e3', shirtD: '#5aa9c8', pants: '#f2b84b', shoes: '#5a4a4a',
  cat: '#b3b8c2', catL: '#e9ebef', catD: '#8e939e', pinkIn: '#ffb3c3', house: '#ff9ebb', houseD: '#e57a9c', roof: '#9b7ad8', box: '#d6a670', boxD: '#b9874f',
};
const LW = 6;

// grain (very subtle paper)
const grain = (() => { const c = createCanvas(W, H), x = c.getContext('2d'), im = x.createImageData(W, H); let s = 7;
  for (let i = 0; i < im.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = s >>> 24; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 10; } x.putImageData(im, 0, 0); return c; })();

// ---------- helpers ----------
function shape(build, fill, lw = LW) { build(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { build(); g.strokeStyle = C.ink; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
const E = (x, y, rx, ry, rot = 0) => () => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); };
const RR = (x, y, w, h, r) => () => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const PL = (pts) => () => { g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.closePath(); };
function stroke(pts, w = LW, col = C.ink, curveMid = false) { g.beginPath(); g.moveTo(...pts[0]); if (curveMid) g.quadraticCurveTo(...pts[1], ...pts[2]); else for (const p of pts.slice(1)) g.lineTo(...p); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
// union of circles with one clean outer outline
function blob(circles, fill) { g.beginPath(); for (const [x, y, r] of circles) { g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } g.strokeStyle = C.ink; g.lineWidth = LW * 2; g.stroke(); g.fillStyle = fill; g.fill(); }
function eye(x, y, mode, s = 1) {
  if (mode === 'happy') return stroke([[x - 26 * s, y + 6], [x, y - 22 * s], [x + 26 * s, y + 6]], LW, C.ink, true);
  if (mode === 'blink') return stroke([[x - 24 * s, y], [x + 24 * s, y]], LW);
  if (mode === 'flat') { shape(E(x, y + 4, 9 * s, 9 * s), C.ink, 0); return stroke([[x - 26 * s, y - 12], [x + 26 * s, y - 12]], LW); }
  const big = mode === 'big' ? 1.25 : 1;
  shape(E(x, y, 27 * s * big, 34 * s * big), C.ink, 0);
  shape(E(x + 9 * s, y - 13 * s, 8 * s * big, 8 * s * big), '#fff', 0); shape(E(x - 9 * s, y + 12 * s, 3.5 * s, 3.5 * s), '#fff', 0);
}

// ---------- Ася ----------
function asya(st) {
  const x = 540, base = 1500, t = st.t, sq = 1 + Math.sin(t * 3) * 0.012;
  g.save(); g.translate(x, base); g.scale(1 / sq, sq); g.translate(-x, -base);
  shape(E(x, base + 6, 190, 26), C.shadow, 0);
  // legs + shoes
  for (const s of [-1, 1]) { shape(RR(x + s * 58 - 42, 1290, 84, 180, 30), C.pants); shape(RR(x + s * 62 - 52, 1452, 104, 52, 26), C.shoes); }
  // arms
  const arm = st.arm || 'down';
  for (const s of [-1, 1]) {
    const sh = [x + s * 120, 1130];
    let hand = [x + s * 165, 1320];
    if (arm === 'box') hand = [x + s * 120, 1250];
    if (arm === 'proud' && s === 1) hand = [x + 40, 1150];
    stroke([sh, hand], 62, C.ink); stroke([sh, hand], 62 - LW * 2, C.skin);
    st._hands = st._hands || []; st._hands.push(hand);
  }
  // shirt
  shape(() => { g.beginPath(); g.moveTo(x - 130, 1085); g.lineTo(x + 130, 1085); g.quadraticCurveTo(x + 170, 1090, x + 175, 1180); g.lineTo(x + 140, 1190); g.lineTo(x + 140, 1310); g.lineTo(x - 140, 1310); g.lineTo(x - 140, 1190); g.lineTo(x - 175, 1180); g.quadraticCurveTo(x - 170, 1090, x - 130, 1085); g.closePath(); }, C.shirt);
  stroke([[x - 50, 1086], [x, 1118], [x + 50, 1086]], LW, C.ink, true);
  for (const h of st._hands) shape(E(h[0], h[1], 30, 30), C.skin);
  st._hands = null;
  head(x, 860, st);
  if (arm === 'box') { // holds a small gift box
    shape(RR(x - 120, 1180, 240, 170, 14), C.house); stroke([[x, 1180], [x, 1350]], 22, '#fff'); stroke([[x - 120, 1260], [x + 120, 1260]], 22, '#fff');
    shape(RR(x - 120, 1180, 240, 170, 14), null); for (const s of [-1, 1]) shape(E(x + s * 34, 1166, 40, 22, s * 0.5), '#fff');
    for (const s of [-1, 1]) shape(E(x + s * 126, 1250, 30, 30), C.skin);
  }
  g.restore();
}
function head(x, y, st) {
  // curly hair cloud behind
  const back = []; for (let i = 0; i < 15; i++) { const a = Math.PI * (0.92 + i / 14 * 1.16); back.push([x + Math.cos(a) * 205, y - 20 + Math.sin(a) * 195, 70]); }
  back.push([x - 205, y + 90, 62], [x + 205, y + 90, 62], [x - 190, y + 165, 50], [x + 190, y + 165, 50]);
  blob(back, C.hair);
  // face
  shape(E(x, y + 40, 190, 175), C.skin);
  // bangs bumps
  const bangs = []; for (let i = 0; i < 7; i++) bangs.push([x - 150 + i * 50, y - 105 + (i % 2) * 14, 48]);
  blob(bangs, C.hair);
  // curl marks
  for (const [cx, cy] of [[x - 170, y - 90], [x + 160, y - 110], [x - 60, y - 190], [x + 70, y - 185], [x - 210, y + 60], [x + 215, y + 50]]) { g.beginPath(); g.arc(cx, cy, 16, 0.5, 4.2); g.strokeStyle = C.hairD; g.lineWidth = 5; g.stroke(); }
  // blush + freckles
  shape(E(x - 112, y + 92, 38, 22), C.blush, 0); shape(E(x + 112, y + 92, 38, 22), C.blush, 0);
  g.fillStyle = '#d98a6a'; for (const [fx, fy] of [[-120, 70], [-100, 84], [-132, 90], [120, 70], [100, 84], [132, 90]]) { g.beginPath(); g.arc(x + fx, y + fy, 3.5, 0, 7); g.fill(); }
  // eyes + round glasses
  const em = st.blink ? 'blink' : st.eyes || 'open';
  for (const s of [-1, 1]) { eye(x + s * 70, y + 30, em); g.beginPath(); g.arc(x + s * 70, y + 30, 58, 0, 7); g.strokeStyle = C.ink; g.lineWidth = 5; g.stroke(); }
  stroke([[x - 14, y + 26], [x, y + 18], [x + 14, y + 26]], 5, C.ink, true);
  // nose
  shape(E(x, y + 88, 10, 7), '#ff9f9f', 0);
  // mouth
  const m = st.mouth;
  if (m === 'open') { shape(() => { g.beginPath(); g.moveTo(x - 26, y + 118); g.quadraticCurveTo(x, y + 112, x + 26, y + 118); g.quadraticCurveTo(x + 22, y + 156, x, y + 158); g.quadraticCurveTo(x - 22, y + 156, x - 26, y + 118); g.closePath(); }, '#d9485f'); shape(E(x, y + 146, 12, 7), '#ff9aa8', 0); }
  else if (m === 'flat') stroke([[x - 22, y + 128], [x + 22, y + 128]], LW);
  else if (m === 'grin') { shape(() => { g.beginPath(); g.moveTo(x - 40, y + 116); g.quadraticCurveTo(x, y + 124, x + 40, y + 116); g.quadraticCurveTo(x, y + 176, x - 40, y + 116); g.closePath(); }, '#d9485f'); }
  else stroke([[x - 20, y + 122], [x, y + 134], [x + 20, y + 122]], LW, C.ink, true);
}

// ---------- Бублик ----------
function bublik(x, base, st, scale = 1) {
  const t = st.t, sq = 1 + Math.sin(t * 3.4 + 1) * 0.015;
  g.save(); g.translate(x, base); g.scale(scale / sq, scale * sq); g.translate(-x, -base);
  if (!st.noShadow) shape(E(x, base + 6, 200, 26), C.shadow, 0);
  // tail
  g.beginPath(); g.moveTo(x + 150, base - 40); g.bezierCurveTo(x + 290, base - 40, x + 280 + Math.sin(t * 3) * 20, base - 230, x + 210, base - 260);
  g.strokeStyle = C.ink; g.lineWidth = 58; g.lineCap = 'round'; g.stroke(); g.strokeStyle = C.cat; g.lineWidth = 58 - LW * 2; g.stroke();
  // body
  shape(() => { g.beginPath(); g.moveTo(x - 120, base - 330); g.quadraticCurveTo(x - 210, base - 120, x - 180, base - 20); g.quadraticCurveTo(x, base + 10, x + 180, base - 20); g.quadraticCurveTo(x + 210, base - 120, x + 120, base - 330); g.closePath(); }, C.cat);
  shape(E(x, base - 130, 95, 110), C.catL, 0);
  for (const s of [-1, 1]) shape(E(x + s * 70, base - 18, 52, 30), C.catL);
  // head
  const hy = base - 420;
  shape(() => { g.beginPath(); g.moveTo(x - 205, hy + 10); g.lineTo(x - 190, hy - 200); g.lineTo(x - 90, hy - 150); g.quadraticCurveTo(x, hy - 175, x + 90, hy - 150); g.lineTo(x + 190, hy - 200); g.lineTo(x + 205, hy + 10); g.quadraticCurveTo(x + 210, hy + 160, x, hy + 165); g.quadraticCurveTo(x - 210, hy + 160, x - 205, hy + 10); g.closePath(); }, C.cat);
  for (const s of [-1, 1]) shape(PL([[x + s * 175, hy - 165], [x + s * 112, hy - 135], [x + s * 168, hy - 85]]), C.pinkIn, 0);
  for (const s of [-1, 1]) for (const k of [-1, 1]) stroke([[x + s * 120, hy + 70 + k * 14], [x + s * 225, hy + 55 + k * 30]], 4);
  shape(E(x - 112, hy + 70, 34, 20), C.blush, 0); shape(E(x + 112, hy + 70, 34, 20), C.blush, 0);
  const em = st.blink ? 'blink' : st.eyes || 'open';
  for (const s of [-1, 1]) eye(x + s * 78, hy + 10, em);
  shape(PL([[x - 13, hy + 58], [x + 13, hy + 58], [x, hy + 72]]), '#ff8fa0', 4);
  if (st.mouth === 'open') shape(E(x, hy + 100, 22, 20), '#d9485f');
  else { stroke([[x - 30, hy + 86], [x - 15, hy + 100], [x, hy + 84]], 5, C.ink, true); stroke([[x, hy + 84], [x + 15, hy + 100], [x + 30, hy + 86]], 5, C.ink, true); }
  g.restore();
}

// ---------- props ----------
function catHouse(x, base) {
  shape(E(x, base + 6, 190, 24), C.shadow, 0);
  shape(RR(x - 170, base - 300, 340, 300, 20), C.house);
  shape(PL([[x - 200, base - 290], [x, base - 470], [x + 200, base - 290]]), C.roof);
  shape(() => { g.beginPath(); g.arc(x, base - 120, 80, Math.PI, 0); g.lineTo(x + 80, base); g.lineTo(x - 80, base); g.closePath(); }, '#7a4e6a');
  shape(E(x, base - 230, 26, 26), '#fff');
  g.font = `40px ${FONT}`; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('4 990 РУБ.', x, base - 520);
  stroke([[x, base - 470], [x, base - 495]], 4);
}
function boxBack(x, base) { shape(E(x, base + 6, 190, 24), C.shadow, 0); shape(PL([[x - 170, base - 260], [x - 230, base - 330], [x - 60, base - 330], [x - 10, base - 260]]), C.boxD); shape(PL([[x + 170, base - 260], [x + 230, base - 330], [x + 60, base - 330], [x + 10, base - 260]]), C.boxD); shape(RR(x - 170, base - 270, 340, 40, 4), '#8a6238'); }
function boxFront(x, base) { shape(RR(x - 170, base - 260, 340, 260, 8), C.box); stroke([[x - 60, base - 160], [x + 60, base - 160]], 5); g.font = `34px ${FONT}`; g.fillStyle = '#7a5530'; g.textAlign = 'center'; g.fillText('ХРУПКОЕ', x, base - 100); }

// ---------- bubble + watermark ----------
function bubble(lines, k, tail = 'center') {
  if (!lines) return;
  const s = 0.6 + 0.4 * Math.min(1, k / 0.15) + Math.sin(Math.min(1, k / 0.15) * Math.PI) * 0.08;
  g.save(); g.translate(W / 2, 330); g.scale(s, s); g.translate(-W / 2, -330);
  g.font = `52px ${FONT}`; g.letterSpacing = '3px';
  const tw = Math.max(...lines.map(l => g.measureText(l).width)), rx = tw / 2 + 80, ry = 52 + lines.length * 30;
  const tx = tail === 'left' ? W / 2 - rx * 0.35 : tail === 'right' ? W / 2 + rx * 0.35 : W / 2 + rx * 0.25;
  g.beginPath(); g.ellipse(W / 2, 330, rx, ry, 0, 0, 7); g.moveTo(tx - 24, 330 + ry - 10); g.lineTo(tx + 14, 330 + ry + 50); g.lineTo(tx + 34, 330 + ry - 14); g.closePath();
  g.fillStyle = 'rgba(255,255,255,0.96)'; g.fill();
  g.fillStyle = C.bubbleText; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, W / 2, 330 + (i - (lines.length - 1) / 2) * 60));
  g.letterSpacing = '0px'; g.restore();
}
function watermark() { g.font = `36px ${FONT}`; g.letterSpacing = '4px'; g.fillStyle = 'rgba(255,255,255,0.9)'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('@ASYA_I_BUBLIK', W / 2, 150); g.letterSpacing = '0px'; }

// ---------- episode «Домик» ----------
const talk = (t, until) => (t < until && Math.floor(t * 8) % 2 ? 'open' : null);
const blinkAt = (t, at) => at.some(a => t > a && t < a + 0.12);
const SHOTS = [
  {dur: 2.9, cam: {z: 1, cx: 540, cy: 960}, draw: t => asya({t, arm: 'box', eyes: 'happy', mouth: talk(t, 1.8) || 'grin'}), say: ['БУБЛИК, СМОТРИ!', 'Я КУПИЛА ТЕБЕ ДОМИК!'], tail: 'center', sfx: [[0.05, 'pop', 0.6], [0.35, 'ding', 0.5]]},
  {dur: 1.9, cam: {z: 1, cx: 540, cy: 960}, draw: t => bublik(540, 1500, {t, eyes: 'big', mouth: talk(t, 0.8), blink: blinkAt(t, [1.4])}), say: ['ЗА СКОЛЬКО?'], tail: 'center', sfx: [[0.05, 'pop', 0.6], [0.1, 'meow', 0.5]]},
  {dur: 1.9, cam: {z: 2.0, cx: 540, cy: 930}, draw: t => asya({t, arm: 'proud', eyes: 'happy', mouth: talk(t, 0.9) || 'grin'}), say: ['ЗА 4 990 РУБЛЕЙ!'], tail: 'center', sfx: [[0.05, 'pop', 0.6], [0.15, 'coin', 0.6]]},
  {dur: 3.2, cam: {z: 1, cx: 540, cy: 960}, draw: t => { catHouse(290, 1520); boxBack(770, 1520); bublik(770, 1430, {t, eyes: t < 0.8 ? 'open' : 'happy', mouth: talk(t - 0.6, 1.3), noShadow: true}, 0.72); boxFront(770, 1520); }, say: ['СПАСИБО.', 'Я ЛУЧШЕ ТУТ'], tail: 'right', sfx: [[0.05, 'pop', 0.6]]},
  {dur: 2.0, cam: {z: 2.0, cx: 540, cy: 930}, draw: t => asya({t, eyes: 'flat', mouth: 'flat'}), say: null, sfx: [[0.1, 'sad', 0.8]]},
];
const TOTAL = SHOTS.reduce((a, s) => a + s.dur, 0);

function frame(time) {
  let s0 = 0, shot = SHOTS[SHOTS.length - 1]; for (const s of SHOTS) { if (time < s0 + s.dur) { shot = s; break; } s0 += s.dur; }
  const t = time - s0, cam = shot.cam;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  shot.draw(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(grain, 0, 0);
  watermark(); bubble(shot.say, t, shot.tail);
}

const cv = createCanvas(W, H); g = cv.getContext('2d');
const outDir = path.join(D, 'out'); fs.mkdirSync(outDir, {recursive: true});
if (process.argv[2]) { for (const s of process.argv[2].split(',').map(Number)) { frame(s); fs.writeFileSync(path.join(outDir, `still_${s}.png`), cv.toBuffer('image/png')); } process.exit(0); }
const out = path.join(outDir, 'domik.mp4'), silent = out + '.silent.mp4';
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', silent], {stdio: ['pipe', 'inherit', 'inherit']});
(async () => {
  for (let i = 0; i < Math.round(TOTAL * FPS); i++) { frame(i / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  const AUD = path.join(D, '..', 'asya', 'audio'), ev = []; let s0 = 0;
  for (const s of SHOTS) { for (const [t, n, v] of s.sfx || []) ev.push([s0 + t, n, v]); s0 += s.dur; }
  const duck = TOTAL - SHOTS[SHOTS.length - 1].dur;
  const args = ['-y', '-v', 'error', '-i', silent, '-stream_loop', '-1', '-i', path.join(AUD, 'theme.mp3')]; ev.forEach(([, n]) => args.push('-i', path.join(AUD, n + '.mp3')));
  let fc = `[1:a]atrim=0:${TOTAL},asetpts=N/SR/TB,volume='if(gt(t,${duck}),0.08,0.3)':eval=frame,afade=t=out:st=${(TOTAL - 0.7).toFixed(2)}:d=0.7[m]`; const lab = ['[m]'];
  ev.forEach(([t, , v], i) => { const ms = Math.round(t * 1000); fc += `;[${i + 2}:a]volume=${v},adelay=${ms}|${ms}[s${i}]`; lab.push(`[s${i}]`); });
  fc += `;${lab.join('')}amix=inputs=${lab.length}:normalize=0:duration=first,alimiter=limit=0.9[a]`;
  args.push('-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(TOTAL), '-movflags', '+faststart', out);
  if (spawnSync('ffmpeg', args, {stdio: 'inherit'}).status) throw new Error('mix failed');
  fs.unlinkSync(silent); console.log(out, TOTAL.toFixed(1));
})();
