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
// v2: parts from ../hybrid/parts (shoulder sockets rebuilt from the suit fabric, no visible joints)
// v3 (default): new Figma body sheet art/candler_body2.png -> parts2/ (jacket with shoulders + sleeve stubs, arms without shoulder caps)
const V3 = process.env.PUPPET_V !== '2';
const PARTDIR = process.env.PUPPET_PARTS || (V3 ? `${__dirname}/parts2` : `${__dirname}/../hybrid/parts`);
const J3 = { k: 0.84, torso: { neck: [327, 30], sL: [100, 118], sR: [546, 118] },   // v6: pivots up under the shoulder caps (stubs removed)
  arm_L_down: [73, 14], arm_R_down: [67, 14], arm_L_palm: [401, 16], arm_R_palm: [65, 16], arm_R_point: [64, 157],
  off: { arm_L_down: 0.16, arm_R_down: -0.16, arm_L_palm: 0.0, arm_R_palm: 0.0, arm_R_point: -0.05 } };
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
  const R1 = palms ? ['arm_R_palm', 0.15 * shrug] : point ? ['arm_R_point', 0.12 + Math.sin((t - tMessy) * 9) * 0.12 * (t < tMessy + 1.2 ? 1 : 0.2)] : ['arm_R_down', -0.04 - Math.sin(t * 1.1) * 0.03];
  return { L1, R1, lift: shrug * 16, headTilt: (t > tImp - 0.1 && t < tSoda ? -0.07 : t > tSoda && t < tBut ? 0.06 : t > tFine ? 0.05 * shrug : 0) };
}
// ---------- v4 elbows: the straight arm is split at the elbow (upper + forearm, feathered seam); the forearm really bends up,
// and only when the bend reaches the drawn gesture does the hand cross-fade into the drawn palm / pointing hand ----------
const EL = { arm_L_down: [70, 172], arm_R_down: [64, 172] };                    // elbow points on the straight arms (parts2 px)
const BEND = { L: { palm: 1.70 }, R: { palm: -1.90, point: -2.46 } };          // forearm angle of each drawn gesture
const SPLIT = {};
function splitArm(k) { if (SPLIT[k]) return SPLIT[k]; const im = A[k], w = im.width, h = im.height, ey = EL[k][1];
  const mk = upper => { const c = createCanvas(w, h), x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'destination-in';
    const g = x.createLinearGradient(0, ey - 16, 0, ey + 16); g.addColorStop(0, upper ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)'); g.addColorStop(1, upper ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,1)');
    x.fillStyle = g; x.fillRect(0, 0, w, h); return c; };
  const lo = createCanvas(w, h), lx = lo.getContext('2d'); lx.drawImage(im, 0, 0); lx.globalCompositeOperation = 'destination-in'; // forearm keeps the full elbow cap
  const g = lx.createLinearGradient(0, ey - 30, 0, ey - 10); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)'); lx.fillStyle = g; lx.fillRect(0, 0, w, h);
  return (SPLIT[k] = { up: mk(true), lo }); }
// "bendy bone": the WHOLE straight arm image is bent smoothly around the elbow — drawn as thin horizontal strips, each rotated by the
// accumulated angle along the arm's spine, so the sleeve stays one continuous piece with a rounded elbow (no cut, no seam).
const BEND_ZONE = 70;   // px of sleeve over which the elbow curve is spread
function bendy(ctx, im, J, ey, th) { const w = im.width, h = im.height, cx = J[0], step = 2; let x = 0, y = 0, a = 0;
  ctx.save(); ctx.translate(-0, 0);
  for (let row = J[1]; row < h; row += step) { // from the sleeve top down; rows above J[1] (hidden in the jacket) drawn straight
    const u = Math.max(0, Math.min(1, (row - (ey - BEND_ZONE / 2)) / BEND_ZONE)), aa = th * u * u * (3 - 2 * u);
    ctx.save(); ctx.translate(x, y); ctx.rotate(aa); ctx.drawImage(im, 0, row, w, step + 2, -cx, 0, w, step + 2); ctx.restore();
    x += -Math.sin(aa) * step; y += Math.cos(aa) * step; a = aa; }
  ctx.drawImage(im, 0, 0, w, J[1] + 1, -cx, -J[1], w, J[1] + 1);
  ctx.restore(); }
const ssm = u => { u = clamp(u); return u * u * (3 - 2 * u); };
function gesture(side, t) { // -> { g: 'down'|'palm'|'point', b: 0..1 bend, f: 0..1 cross-fade to the drawn gesture, r: upper-arm swing }
  const palm = ssm((t - (tFine - 0.4)) / 0.5);
  if (side === 'R') { const pin = ssm((t - (tMessy - 0.65)) / 0.45), pout = ssm((t - (tSoda - 0.55)) / 0.4), pt = pin * (1 - pout);
    if (palm > 0) return { g: 'palm', b: palm, f: ssm((palm - 0.75) / 0.25), r: -0.12 * palm };
    return { g: 'point', b: pt, f: ssm((pt - 0.78) / 0.22), r: -0.08 * pt + (pt > 0.95 ? Math.sin((t - tMessy) * 9) * 0.06 * (t < tMessy + 1.2 ? 1 : 0.3) : 0) }; }
  return { g: 'palm', b: palm, f: ssm((palm - 0.75) / 0.25), r: 0.12 * palm }; }
function armV3(ctx, side, t, tor3) { const down = `arm_${side}_down`, G = gesture(side, t), sp = splitArm(down), J = J3[down], sk = side === 'L' ? tor3.sL : tor3.sR;
  const idle = side === 'L' ? 0.03 * Math.sin(t * 1.3) : -0.03 * Math.sin(t * 1.1);
  const r = J3.off[down] * (1 - G.b) + G.r + idle * (1 - G.b), th = (BEND[side][G.g] || 0) * ssm(G.b);
  ctx.save(); ctx.translate(sk[0] - tor3.neck[0], sk[1] - tor3.neck[1]); ctx.rotate(r);
  if (G.f < 1) { ctx.save(); ctx.globalAlpha *= 1 - G.f; bendy(ctx, A[down], J, EL[down][1], th); ctx.restore(); }
  if (G.f > 0) { const k = `arm_${side}_${G.g}`; ctx.save(); ctx.globalAlpha *= G.f; ctx.rotate(J3.off[k] || 0); ctx.drawImage(A[k], -J3[k][0], -J3[k][1]); ctx.restore(); }
  ctx.restore(); }
// ---------- drawing ----------
function part(ctx, k, x, y, s, r, jx, jy, flip) { const im = A[k]; ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(flip ? -s : s, s); ctx.drawImage(im, -jx, -jy); ctx.restore(); }
let tilt = 0;
function candler(ctx, t, x, y, s) { // (x, y) = neck point in world; s = scale
  const P = pose(t), breath = Math.sin(t * 2.2) * 0.012, sway = Math.sin(t * 0.9) * 0.012;
  tilt += (P.headTilt + Math.sin(t * 1.4) * 0.02 - tilt) * 0.18;
  const ny = y - P.lift; const tor = J.torso;
  ctx.save(); ctx.translate(x, ny); ctx.rotate(sway); ctx.scale(s, s * (1 + breath));
  const [kl, rl] = P.L1, [kr, rr] = P.R1;
  if (V3) { // v3: jacket with real shoulders and sleeve stubs; arms are drawn BEHIND it, their tops tucked into the sleeve openings
    const k = J3.k, tor3 = J3.torso; ctx.save(); ctx.scale(k, k);
    for (const side of ['L', 'R']) armV3(ctx, side, t, tor3);
    ctx.drawImage(A.torso, -tor3.neck[0], -tor3.neck[1]); ctx.restore();
  } else {
  // torso
  ctx.drawImage(A.torso, -tor.neck[0], -tor.neck[1]);
  // arms on the shoulders (drawn over the sockets)
  part(ctx, kl, tor.sL[0] - tor.neck[0], tor.sL[1] - tor.neck[1], 1, rl, ...J[kl]);
  // the pointing arm is mirrored so the hand rises on the outer side of the body (not across the chest)
  part(ctx, kr, tor.sR[0] - tor.neck[0], tor.sR[1] - tor.neck[1], 1, rr, ...J[kr], kr === 'arm_R_point');
  }
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
  for (const p of PARTS) A[p] = await loadImage(`${p.startsWith("head") ? __dirname + "/parts" : PARTDIR}/${p === "torso" && V3 ? "torso_nostub" : p}.png`); A.bg = await loadImage(`${__dirname}/../figma_pilot/hi/02_office_empty.png`);
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(960 * 2, 540 * Math.ceil(ts.length / 2)), sc = sh.getContext('2d');
    ts.forEach((t, i) => { tilt = 0; for (let k = 0; k < 20; k++) pose(t); frame(ctx, t); sc.drawImage(cv, (i % 2) * 960, Math.floor(i / 2) * 540, 960, 540); sc.fillStyle = '#E8322E'; sc.font = '26px sans-serif'; sc.fillText(t.toFixed(2), (i % 2) * 960 + 8, Math.floor(i / 2) * 540 + 30); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < Math.round(T * FPS); f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
})();
