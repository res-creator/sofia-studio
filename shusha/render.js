// «Шуша и Кеша» — flash-style dialogue sketch (original characters, voices: fish.audio).
// node shusha/render.js [stills t1,t2]   -> shusha/out/yogurt.mp4
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn, spawnSync} = require('child_process');
const fs = require('fs'), path = require('path');
const W = 1080, H = 1920, FPS = 30, SR = 44100;
const D = __dirname, F = path.join(D, '..', 'node_modules', '@fontsource');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-cyrillic-900-normal.woff2', 'NC');
GlobalFonts.registerFromPath(F + '/nunito/files/nunito-latin-900-normal.woff2', 'NL');
const FONT = 'NL, NC';
let g;

// ---------------- audio prep: trim, pitch Шуша up a little, measure loudness per frame ----------------
const LINES = JSON.parse(fs.readFileSync(path.join(D, 'voice/lines.json'), 'utf8'));
const GAP = 0.22, START = 0.5, TAIL = 1.6;
const tmp = path.join(D, 'out', 'tmp'); fs.mkdirSync(tmp, {recursive: true});
let t = START; const CUE = [];
LINES.forEach(([who, text], i) => {
  const raw = path.join(D, 'voice', `raw_${String(i).padStart(2, '0')}_${who}.mp3`), wav = path.join(tmp, `l${i}.wav`);
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse';
  const fx = who === 'sh' ? `${trim},asetrate=${SR}*1.09,aresample=${SR},atempo=1.04` : `${trim},atempo=0.97`;
  spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-af', fx + ',loudnorm=I=-16:TP=-1.5', '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', wav]);
  const buf = fs.readFileSync(wav), pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.length - 44) >> 1);
  const spf = SR / FPS, env = [];
  for (let f = 0; f * spf < pcm.length; f++) { let s = 0, n = 0; for (let k = Math.floor(f * spf); k < Math.min(pcm.length, (f + 1) * spf); k++) { s += pcm[k] * pcm[k]; n++; } env.push(Math.sqrt(s / Math.max(1, n)) / 32768); }
  const mx = Math.max(...env) || 1, dur = pcm.length / SR;
  CUE.push({i, who, text, t0: t, t1: t + dur, wav, env: env.map(v => v / mx)});
  t += dur + GAP;
});
const TOTAL = t - GAP + TAIL;

// ---------------- palette ----------------
const C = {ink: '#161616', wall: '#f4e19a', wallL: '#efd47c', floor: '#a8714a', floorD: '#8d5c3a', fridge: '#f7f7f2', fridgeIn: '#dff2ff',
  skin: '#ffd2ad', blush: '#ff9a9a', hair: '#55cc66', hairD: '#36a548', hoodie: '#ff8a2a', hoodieD: '#e06d14', tights: '#e8403a',
  kskin: '#f0c49b', beanie: '#7a4bd1', beanieD: '#5a33a6', khood: '#7b8fb0', khoodD: '#5f7395', table: '#c98a4b', tableD: '#a86d33', mustard: '#f2c230', night: '#22386b'};

// ---------------- helpers ----------------
function poly(pts, fill, lw = 7) { g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = C.ink; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function rrect(x, y, w, h, r, fill, lw = 7) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (lw) { g.strokeStyle = C.ink; g.lineWidth = lw; g.stroke(); } }
function ellipse(x, y, rx, ry, fill, lw = 7, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = C.ink; g.lineWidth = lw; g.stroke(); } }
function line(pts, w = 7, col = C.ink) { g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function limb(a, b, c, col, w = 34) { line([a, b, c], w + 14); line([a, b, c], w, col); }
const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ---------------- set ----------------
function kitchen(time) {
  g.fillStyle = C.wall; g.fillRect(-500, -500, W + 1000, 2100);
  g.fillStyle = C.wallL; for (let x = -500; x < W + 500; x += 90) g.fillRect(x, -500, 34, 2060);
  // window with night city
  rrect(560, 420, 420, 380, 10, C.night, 9);
  g.fillStyle = '#ffe9a3'; g.beginPath(); g.arc(900, 500, 34, 0, 7); g.fill();
  g.fillStyle = '#16264d'; for (const [x, w, h] of [[570, 90, 190], [670, 70, 260], [745, 110, 150], [860, 115, 220]]) g.fillRect(x, 800 - h, w, h);
  g.fillStyle = '#ffd95a'; for (const [x, y] of [[590, 650], [620, 700], [690, 580], [700, 650], [770, 690], [880, 620], [910, 700], [880, 680]]) g.fillRect(x, y, 16, 20);
  line([[770, 420], [770, 800]], 9); line([[560, 610], [980, 610]], 9);
  rrect(540, 790, 460, 26, 6, '#ffffff', 7); // sill
  // floor
  g.fillStyle = C.floor; g.fillRect(-500, 1560, W + 1000, 900);
  for (let x = -500; x < W + 500; x += 120) line([[x, 1560], [x - 80, 2400]], 5, C.floorD);
  line([[-500, 1560], [W + 500, 1560]], 8);
  // open fridge
  rrect(10, 520, 340, 1050, 24, C.fridge, 9);
  rrect(30, 760, 300, 790, 10, C.fridgeIn, 6);
  const glow = g.createRadialGradient(180, 900, 10, 180, 900, 300); glow.addColorStop(0, 'rgba(255,255,255,0.9)'); glow.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = glow; g.fillRect(30, 760, 300, 790);
  for (const y of [980, 1180, 1380]) line([[34, y], [326, y]], 6, '#9fc4dc');
  // lonely mustard jar
  rrect(140, 1080, 70, 96, 12, C.mustard, 6); rrect(146, 1060, 58, 26, 6, '#d13b2e', 6);
  g.font = `bold 20px ${FONT}`; g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText('ГОРЧ', 175, 1134);
  line([[30, 740], [330, 740]], 8); line([[60, 600], [60, 700]], 12); // freezer door + handle
}
function table(st) {
  rrect(610, 1250, 520, 46, 8, C.table, 8);
  poly([[640, 1296], [1100, 1296], [1100, 1420], [640, 1420]], C.tableD, 8);
  line([[670, 1420], [670, 1590]], 22); line([[1060, 1420], [1060, 1590]], 22);
}
function cup() {
  const x = 630, y = 1150;
  poly([[x, y], [x + 110, y], [x + 98, y + 102], [x + 12, y + 102]], '#ffffff', 6);
  ellipse(x + 55, y, 55, 12, '#f3f3f3', 5);
  g.fillStyle = '#ff7aa8'; g.fillRect(x + 8, y + 30, 94, 44);
  g.font = `bold 15px ${FONT}`; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('ШУША.', x + 55, y + 50); g.fillText('НЕ ТРОГАТЬ', x + 55, y + 68);
}

// ---------------- Шуша (standing, center) ----------------
function shusha(st) {
  const x = 470, by = 0 + (st.talk ? Math.sin(st.time * 18) * 4 : 0) + Math.sin(st.time * 2) * 3, shake = st.shake ? Math.sin(st.time * 45) * 6 : 0;
  // legs + sneakers
  for (const s of [-1, 1]) {
    const lx = x + s * 40;
    g.save(); g.beginPath(); g.rect(lx - 18, 1480, 36, 210); g.clip();
    for (let yy = 1480; yy < 1700; yy += 28) { g.fillStyle = (yy / 28) % 2 < 1 ? C.tights : '#ffffff'; g.fillRect(lx - 18, yy, 36, 14); }
    g.restore(); g.strokeStyle = C.ink; g.lineWidth = 6; g.strokeRect(lx - 18, 1480, 36, 210);
    rrect(lx - 30 + s * 14, 1680, 78, 40, 18, '#ffffff', 7); line([[lx - 20 + s * 14, 1700], [lx + 36 + s * 14, 1700]], 5, '#3a7bd5');
  }
  // arms (behind / in front by pose)
  const sh = [[x - 92, 1225 + by], [x + 92, 1225 + by]];
  const poses = {
    down: [[[x - 125, 1340], [x - 120, 1450]], [[x + 125, 1340], [x + 120, 1450]]],
    hips: [[[x - 170, 1320], [x - 110, 1400]], [[x + 170, 1320], [x + 110, 1400]]],
    up: [[[x - 170, 1110], [x - 175, 980]], [[x + 170, 1110], [x + 175, 980]]],
    point: [[[x - 190, 1200], [x - 280, 1130]], [[x + 125, 1340], [x + 120, 1450]]],
    cross: [[[x - 70, 1330], [x + 60, 1300]], [[x + 70, 1330], [x - 60, 1300]]],
  };
  const P = poses[st.pose || 'down'];
  // body hoodie
  poly([[x - 95, 1190 + by], [x + 95, 1190 + by], [x + 135, 1510], [x - 135, 1510]], C.hoodie);
  rrect(x - 70, 1400, 140, 60, 14, C.hoodieD, 6);
  line([[x - 20, 1205 + by], [x - 26, 1290 + by]], 5); line([[x + 20, 1205 + by], [x + 26, 1290 + by]], 5);
  for (let k = 0; k < 2; k++) { const [e, h] = P[k]; limb(sh[k], [e[0] + shake, e[1] + by], [h[0] + shake, h[1] + by], C.hoodie); ellipse(h[0] + shake, h[1] + by, 26, 26, C.skin, 6); }
  // neck
  rrect(x - 26 + shake, 1110 + by, 52, 100, 10, C.skin, 6);
  // head
  const hx = x + shake, hy = 975 + by;
  // hair back + spiky buns
  for (const s of [-1, 1]) { const bx = hx + s * 125, byy = hy - 175; const pts = []; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283, r = k % 2 ? 48 : 82; pts.push([bx + Math.cos(a) * r, byy + Math.sin(a) * r]); } poly(pts, C.hair); }
  rrect(hx - 175, hy - 160, 350, 230, 120, C.hair);
  // face
  rrect(hx - 160, hy - 130, 320, 290, 130, C.skin);
  // bangs zigzag
  const bang = [[hx - 165, hy - 40]]; for (let k = 0; k <= 8; k++) bang.push([hx - 150 + k * 37.5, hy - (k % 2 ? 60 : 92)]); bang.push([hx + 165, hy - 40], [hx + 150, hy - 150], [hx - 150, hy - 150]);
  poly(bang, C.hair);
  ellipse(hx - 112, hy + 70, 26, 16, C.blush, 0); ellipse(hx + 112, hy + 70, 26, 16, C.blush, 0);
  // eyes
  for (const s of [-1, 1]) {
    const ex = hx + s * 62, ey = hy + 5;
    if (st.blink) { line([[ex - 30, ey], [ex + 30, ey]], 7); continue; }
    ellipse(ex, ey, 34, 44, '#ffffff', 6);
    const px = st.look === 'left' ? -12 : st.look === 'right' ? 12 : 0;
    ellipse(ex + px, ey + 6, 11, 13, C.ink, 0);
    if (st.angry) line([[ex - 36 * s * -1, ey - 64], [ex + 36 * s * -1, ey - 44]], 9); else line([[ex - 30, ey - 62], [ex + 30, ey - 66]], 8);
  }
  // nose
  poly([[hx, hy + 30], [hx - 14, hy + 62], [hx + 10, hy + 62]], '#ffb48c', 5);
  // mouth by loudness
  const m = st.mouth || 0, my = hy + 105;
  if (m < 0.15) line(st.angry ? [[hx - 34, my + 6], [hx, my - 4], [hx + 34, my + 6]] : [[hx - 32, my], [hx, my + 10], [hx + 32, my]], 7);
  else { const h = m < 0.45 ? 14 : 30; ellipse(hx, my + 4, 34 + h * .3, h, '#9c2b33', 6); if (h > 20) ellipse(hx, my + 4 + h * .45, 16, 8, '#ff7a86', 0); }
}

// ---------------- Кеша (sitting behind the table) ----------------
function kesha(st, part) {
  const x = 870, by = (st.talk ? Math.sin(st.time * 14) * 3 : 0) + Math.sin(st.time * 1.6 + 1) * 3;
  if (part === 'arms') return keshaArms(st, x, by);
  // body
  poly([[x - 120, 1090 + by], [x + 120, 1090 + by], [x + 170, 1300], [x - 170, 1300]], C.khood);
  line([[x - 30, 1100 + by], [x - 36, 1180 + by]], 5); line([[x + 30, 1100 + by], [x + 36, 1180 + by]], 5);
  rrect(x - 30, 1010 + by, 60, 100, 10, C.kskin, 6);
  // head (long oval)
  const hx = x, hy = 900 + by;
  ellipse(hx, hy, 118, 160, C.kskin, 7);
  // beanie
  g.beginPath(); g.moveTo(hx - 122, hy - 60); g.bezierCurveTo(hx - 120, hy - 250, hx + 120, hy - 250, hx + 122, hy - 60); g.closePath(); g.fillStyle = C.beanie; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 7; g.stroke();
  rrect(hx - 130, hy - 92, 260, 50, 16, C.beanieD, 7); ellipse(hx + 10, hy - 222, 30, 26, '#ffb3e6', 6);
  // eyes (sleepy)
  for (const s of [-1, 1]) {
    const ex = hx + s * 48, ey = hy - 4;
    if (st.blink || st.happy) { line(st.happy ? [[ex - 24, ey + 6], [ex, ey - 8], [ex + 24, ey + 6]] : [[ex - 24, ey], [ex + 24, ey]], 7); continue; }
    const open = st.surprised ? 1 : 0.5;
    g.save(); g.beginPath(); g.ellipse(ex, ey, 28, 30, 0, 0, 7); g.clip(); g.fillStyle = '#fff'; g.fillRect(ex - 30, ey - 30, 60, 60);
    ellipse(ex - 4, ey + 8, 10, 12, C.ink, 0); g.fillStyle = C.kskin; g.fillRect(ex - 30, ey - 30, 60, 60 * (1 - open)); g.restore();
    ellipse(ex, ey, 28, 30, null, 6); line([[ex - 30, ey - 30 + 60 * (1 - open)], [ex + 30, ey - 30 + 60 * (1 - open)]], 6);
  }
  // big nose + stubble
  ellipse(hx + 6, hy + 52, 26, 34, '#e9a47c', 6);
  g.fillStyle = 'rgba(60,40,30,0.55)'; for (let k = 0; k < 26; k++) { const a = 0.4 + k * 0.09; g.beginPath(); g.arc(hx + Math.cos(a) * 90 * (k % 2 ? 1 : -1), hy + 70 + Math.sin(a) * 50, 3, 0, 7); g.fill(); }
  const m = st.mouth || 0, my = hy + 112;
  if (m < 0.15) line([[hx - 30, my], [hx + 30, my - 4]], 7); else { const h = m < 0.45 ? 10 : 22; ellipse(hx, my, 30, h, '#7a2b2b', 6); }
}
function keshaArms(st, x, by) {
  const sp = st.spoon || 0, hand = [x - 150, 1230 - sp * 230];
  limb([x - 110, 1130 + by], [x - 190, 1240 - sp * 60], hand, C.khood, 36);
  line([[hand[0] - 10, hand[1]], [hand[0] + 50, hand[1] - 90 - sp * 10]], 9, '#c9ced6'); ellipse(hand[0] + 56, hand[1] - 104 - sp * 10, 16, 24, '#dfe3ea', 5, 0.5);
  ellipse(hand[0], hand[1], 28, 26, C.kskin, 6);
  limb([x + 110, 1130 + by], [x + 170, 1230], [x + 80, 1250], C.khood, 36); ellipse(x + 80, 1250, 28, 24, C.kskin, 6);
}

// ---------------- direction (per line: pose, emotion, camera) ----------------
const DIR = [
  {pose: 'point', angry: true, look: 'left', cam: 'wide'},
  {cam: 'wide'},
  {pose: 'hips', angry: true, look: 'right', cam: 'sh'},
  {cam: 'ke'},
  {pose: 'up', angry: true, shake: true, look: 'right', cam: 'sh'},
  {spoon: 1, cam: 'ke'},
  {pose: 'cross', angry: true, look: 'right', cam: 'wide'},
  {surprised: true, cam: 'ke'},
  {pose: 'point', look: 'left', cam: 'wide'},
  {spoon: 1, happy: true, cam: 'ke'},
];
const CAMS = {wide: {z: 1, cx: W / 2, cy: H / 2}, sh: {z: 1.6, cx: 470, cy: 1060}, ke: {z: 1.6, cx: 860, cy: 1060}};

function frame(time) {
  // current / last cue
  let cur = null, last = CUE[0]; for (const c of CUE) { if (time >= c.t0) last = c; if (time >= c.t0 && time < c.t1) cur = c; }
  const d = DIR[last.i], cam = time < CUE[0].t0 ? CAMS.wide : CAMS[d.cam];
  g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  const mouth = (who) => { if (!cur || cur.who !== who) return 0; const f = Math.floor((time - cur.t0) * FPS); return cur.env[f] || 0; };
  const blinkAt = (seed) => ((time + seed) % 3.7) < 0.12;
  // persistent state: Шуша keeps last own pose; Кеша keeps spoon
  const lastOf = (who) => { let r = null; for (const c of CUE) if (c.who === who && time >= c.t0) r = DIR[c.i]; return r || {}; };
  const sd = lastOf('sh'), kd = lastOf('ke');
  kitchen(time);
  const kst = {time, talk: cur && cur.who === 'ke', mouth: mouth('ke'), blink: blinkAt(1.3), spoon: kd.spoon ? clamp((time - (CUE.find(c => DIR[c.i] === kd) || {t0: 0}).t0) * 3) : 0, happy: kd.happy, surprised: kd.surprised};
  kesha(kst, 'body'); table(); cup(); kesha(kst, 'arms');
  shusha({time, talk: cur && cur.who === 'sh', mouth: mouth('sh'), blink: blinkAt(0), pose: sd.pose, angry: sd.angry, shake: sd.shake && cur && cur.who === 'sh', look: sd.look});
  g.setTransform(1, 0, 0, 1, 0, 0);
  // subtitle
  if (cur) subtitle(cur.text, cur.who);
  // title card
  if (time < CUE[0].t0 + 1.2) { g.globalAlpha = clamp(CUE[0].t0 + 1.2 - time); title(); g.globalAlpha = 1; }
}
function wrap(text, maxW) { const words = text.split(' '), out = []; let l = ''; for (const w of words) { const t = l ? l + ' ' + w : w; if (g.measureText(t).width > maxW && l) { out.push(l); l = w; } else l = t; } out.push(l); return out; }
function subtitle(text, who) {
  g.font = `60px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const ls = wrap(text, 900);
  ls.forEach((l, i) => { const y = 1470 + i * 74 - (ls.length - 1) * 37; g.lineWidth = 12; g.strokeStyle = C.ink; g.lineJoin = 'round'; g.strokeText(l, W / 2, y); g.fillStyle = who === 'sh' ? '#ffffff' : '#b9f0ff'; g.fillText(l, W / 2, y); });
}
function title() {
  rrect(190, 150, 700, 120, 30, '#ff7aa8', 8);
  g.font = `64px ${FONT}`; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ШУША И КЕША: ЙОГУРТ', W / 2, 212);
}

// ---------------- output ----------------
const cv = createCanvas(W, H); g = cv.getContext('2d');
const outDir = path.join(D, 'out'), out = path.join(outDir, 'yogurt.mp4');
if (process.argv[2]) { for (const s of process.argv[2].split(',').map(Number)) { frame(s); fs.writeFileSync(path.join(outDir, `still_${s}.png`), cv.toBuffer('image/png')); } console.log('total', TOTAL.toFixed(2), CUE.map(c => c.t0.toFixed(2)).join(' ')); process.exit(0); }
const silent = path.join(tmp, 'silent.mp4');
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', silent], {stdio: ['pipe', 'inherit', 'inherit']});
(async () => {
  for (let i = 0; i < Math.round(TOTAL * FPS); i++) { frame(i / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  // audio: voices + fridge hum + whoosh on camera cuts + spoon clink at the end
  const args = ['-y', '-v', 'error', '-i', silent, '-stream_loop', '-1', '-i', path.join(D, 'sfx/hum.mp3')];
  const ev = CUE.map(c => [c.wav, c.t0, 1.0]);
  let prevCam = 'wide'; CUE.forEach(c => { const cm = DIR[c.i].cam; if (cm !== prevCam) ev.push([path.join(D, 'sfx/whoosh.mp3'), Math.max(0, c.t0 - 0.12), 0.25]); prevCam = cm; });
  const lastK = CUE[CUE.length - 1]; ev.push([path.join(D, 'sfx/clink.mp3'), lastK.t1 + 0.2, 0.8]);
  ev.forEach(([f]) => args.push('-i', f));
  let fc = `[1:a]atrim=0:${TOTAL},asetpts=N/SR/TB,volume=0.12,afade=t=in:d=0.4,afade=t=out:st=${(TOTAL - 0.6).toFixed(2)}:d=0.6[h]`; const lab = ['[h]'];
  ev.forEach(([, s, v], i) => { const ms = Math.round(s * 1000); fc += `;[${i + 2}:a]aresample=48000,volume=${v},adelay=${ms}|${ms}[e${i}]`; lab.push(`[e${i}]`); });
  fc += `;${lab.join('')}amix=inputs=${lab.length}:normalize=0:duration=first,alimiter=limit=0.9[a]`;
  args.push('-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', TOTAL.toFixed(2), '-movflags', '+faststart', out);
  const r = spawnSync('ffmpeg', args, {stdio: 'inherit'}); if (r.status) throw new Error('mix failed');
  fs.rmSync(tmp, {recursive: true, force: true}); console.log(out, TOTAL.toFixed(2));
})();
