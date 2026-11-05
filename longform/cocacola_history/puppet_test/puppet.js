// Puppet test (10 s): Asa Candler as a cut-out puppet built from Figma AI part sheets (art/candler_heads.png, art/candler_body.png, keyed to parts/),
// rigged in code: torso breathes, head turns/tilts/bobs and swaps expressions (blink, skeptical, smile, talk, surprised), arms rotate at the shoulders and
// swap poses (hanging, finger raised, palms-up shrug). Background: the empty office plate from the Figma pilot; the desk occludes his lower body.
// Voice: existing chapter-3 narration b2 ("Candler wasn't impressed ... fine."). Usage: node puppet.js still t1,t2 out.png | video out.mp4 | T
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { spawn } = require('child_process'); const fs = require('fs');
const L = require('../../kit/look'); const { clamp, lerp, seg, E } = L;
const W = 1920, H = 1080, FPS = 30, OFF = 14.2, T = 10.0;            // test t = chapter-3 t - OFF
const CH = `${__dirname}/../chapters/c3_bottles`, CU = JSON.parse(fs.readFileSync(`${CH}/cues.json`)), WD = {};
for (const [id, t0] of CU.vo) { const a = JSON.parse(fs.readFileSync(`${CH}/vo/${id}.align.json`)), s = a.characters.join(''), re = /\S+/g; let m; WD[id] = [];
  while ((m = re.exec(s))) WD[id].push({ w: m[0].toLowerCase().replace(/[^a-z']/g, ''), t: t0 + a.character_start_times_seconds[m.index] - OFF }); }
const at = (w) => WD.b2.find(x => x.w.startsWith(w)).t;
const A = {}, PARTS = ['torso', 'arm_L_down', 'arm_R_down', 'arm_L_palm', 'arm_R_palm', 'arm_R_point', 'head_neutral', 'head_blink', 'head_smile', 'head_talk', 'head_surprised', 'head_skeptical'];
// joints in each part's own pixels (measured on the keyed sheets)
const J = { torso: { neck: [218, 34], sL: [38, 130], sR: [404, 130] }, head: [146, 404],
  arm_L_down: [125, 46], arm_R_down: [35, 46], arm_L_palm: [404, 45], arm_R_palm: [38, 45], arm_R_point: [213, 118] };
const u = (t, t0, d) => clamp((t - t0) / d), ease = E.inOut;
// ---------- acting timeline (all on the narration's words) ----------
const tImp = at('impressed'), tMessy = at('messy'), tSoda = at('soda'), tBut = at('but'), tFine = at('fine');
function expr(t) { // which head
  const blinks = [0.7, 3.4, 6.6, 9.3]; if (blinks.some(b => t > b && t < b + 0.13)) return 'head_blink';
  if (t > tFine - 0.05 && t < tFine + 0.5) return 'head_talk';                    // a little "hmph" on "fine"
  if (t >= tFine + 0.5) return 'head_smile';
  if (t > tSoda - 0.1 && t < tBut) return 'head_smile';                           // fond of his soda fountain
  if (t > tBut && t < tFine - 0.05) return 'head_surprised';                       // "...the risk?"
  if (t > tImp - 0.15) return 'head_skeptical';
  return 'head_neutral'; }
function pose(t) { // arm sprites + angles (radians, + = clockwise) + body lift
  const shrug = Math.sin(clamp((t - (tFine - 0.15)) / 0.9) * Math.PI);
  const point = t > tMessy - 0.5 && t < tSoda - 0.2, palms = t > tFine - 0.2;
  const L1 = palms ? ['arm_L_palm', -0.15 * shrug] : ['arm_L_down', 0.04 + Math.sin(t * 1.3) * 0.03];
  const R1 = palms ? ['arm_R_palm', 0.15 * shrug] : point ? ['arm_R_point', -0.1 + Math.sin((t - tMessy) * 9) * 0.12 * (t < tMessy + 1.2 ? 1 : 0.2)] : ['arm_R_down', -0.04 - Math.sin(t * 1.1) * 0.03];
  return { L1, R1, lift: shrug * 16, headTilt: (t > tImp - 0.1 && t < tSoda ? -0.07 : t > tSoda && t < tBut ? 0.06 : t > tFine ? 0.05 * shrug : 0) };
}
// ---------- drawing ----------
function part(ctx, k, x, y, s, r, jx, jy) { const im = A[k]; ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s); ctx.drawImage(im, -jx, -jy); ctx.restore(); }
let tilt = 0;
function candler(ctx, t, x, y, s) { // (x, y) = neck point in world; s = scale
  const P = pose(t), breath = Math.sin(t * 2.2) * 0.012, sway = Math.sin(t * 0.9) * 0.012;
  tilt += (P.headTilt + Math.sin(t * 1.4) * 0.02 - tilt) * 0.18;
  const ny = y - P.lift; const tor = J.torso;
  ctx.save(); ctx.translate(x, ny); ctx.rotate(sway); ctx.scale(s, s * (1 + breath));
  // torso
  ctx.drawImage(A.torso, -tor.neck[0], -tor.neck[1]);
  // arms on the shoulders (drawn over the sockets)
  const [kl, rl] = P.L1, [kr, rr] = P.R1;
  part(ctx, kl, tor.sL[0] - tor.neck[0], tor.sL[1] - tor.neck[1], 1, rl, ...J[kl]);
  part(ctx, kr, tor.sR[0] - tor.neck[0], tor.sR[1] - tor.neck[1], 1, rr, ...J[kr]);
  // head on the neck: tilt, a slight nod, expression swap
  const nod = Math.sin(t * 1.7) * 0.015 + (t > tImp && t < tImp + 0.5 ? -0.05 * Math.sin((t - tImp) / 0.5 * Math.PI) : 0);
  part(ctx, expr(t), 0, 6, 0.74, tilt + nod, ...J.head);
  ctx.restore(); }
const DESK = [[0, 585], [330, 537], [720, 513], [1050, 513], [1385, 553], [1414, 590], [1400, 864], [0, 864]];
function frame(ctx, t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#1A120C'; ctx.fillRect(0, 0, W, H);
  const k = ease(clamp(t / T)), cz = lerp(1.55, 1.85, k), cx = lerp(500, 470, k), cy = lerp(420, 390, k) + (t > tFine ? -6 * Math.sin(clamp((t - tFine) / 0.4) * Math.PI) : 0);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1.25 * cz, 1.25 * cz); ctx.translate(-cx, -cy);
  ctx.drawImage(A.bg, 0, 0, 1536, 864);
  // light beams + dust
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(1060 + i * 70, -40); ctx.rotate(0.42); const g = ctx.createLinearGradient(0, 0, 0, 900);
    g.addColorStop(0, `rgba(255,220,150,${0.1 * (0.75 + 0.25 * Math.sin(t + i))})`); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(-28, 0, 60, 900); ctx.restore(); } ctx.restore();
  candler(ctx, t, 468, 330, 0.5);
  // soft contact shadow of the desk edge on his suit
  ctx.save(); ctx.beginPath(); DESK.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip(); ctx.drawImage(A.bg, 0, 0, 1536, 864); ctx.restore();
  ctx.save(); const g = ctx.createLinearGradient(0, 470, 0, 520); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); ctx.fillStyle = g; ctx.fillRect(300, 470, 340, 50); ctx.restore();
  ctx.restore();
  // grade: warm + vignette
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,170,90,0.06)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(15,6,0,0.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
module.exports = { T, at };
if (require.main === module) (async () => {
  const [mode, a1, a2] = process.argv.slice(2); if (mode === 'T') return console.log(T);
  for (const p of PARTS) A[p] = await loadImage(`${__dirname}/parts/${p}.png`); A.bg = await loadImage(`${__dirname}/../figma_pilot/hi/02_office_empty.png`);
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(960 * 2, 540 * Math.ceil(ts.length / 2)), sc = sh.getContext('2d');
    ts.forEach((t, i) => { tilt = 0; for (let k = 0; k < 20; k++) pose(t); frame(ctx, t); sc.drawImage(cv, (i % 2) * 960, Math.floor(i / 2) * 540, 960, 540); sc.fillStyle = '#E8322E'; sc.font = '26px sans-serif'; sc.fillText(t.toFixed(2), (i % 2) * 960 + 8, Math.floor(i / 2) * 540 + 30); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < Math.round(T * FPS); f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
})();
