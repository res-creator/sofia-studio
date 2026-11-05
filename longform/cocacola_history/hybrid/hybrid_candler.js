// Hybrid test (10 s): Figma art (puppet_test parts + the pilot's office plate) animated by the reusable hybrid rig (rig.js).
// Same voice/sound as the two earlier tests. Acting on the words: "wasn't impressed" skeptical · "messy" irritation (frown, finger wag) ·
// "soda fountain" interest (soft smile, brows up, eyes drift) · "take the risk" doubt (brows up, eyes aside, head tilt) ·
// "fine" he mouths the word, shrugs, opens both arms palms-up and smiles. Usage: node hybrid_candler.js still t1,t2 out.png | video out.mp4
const { createCanvas, loadImage } = require('@napi-rs/canvas'); const { spawn } = require('child_process'); const fs = require('fs');
const RIG = require('./rig'), CFG = require('./candler.config');
const W = 1920, H = 1080, FPS = 30, T = 10.0;
const PT = require('../puppet_test/puppet.js'); const tImp = PT.at('impressed'), tMessy = PT.at('messy'), tSoda = PT.at('soda'), tBut = PT.at('but'), tFine = PT.at('fine');
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, u) => a + (b - a) * u;
const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, rise = (t, t0, d = 0.35) => ss((t - t0) / d), win = (t, a, b, d = 0.35) => rise(t, a, d) * (1 - rise(t, b, d));
const wob = (t, f, p = 0) => Math.sin(t * f + p);
// ---------- acting curves (everything continuous) ----------
function act(t) {
  const skept = win(t, tImp - 0.35, tSoda - 0.45, 0.4), irrit = win(t, tMessy - 0.3, tSoda - 0.35, 0.3), interest = win(t, tSoda - 0.3, tBut + 0.1, 0.4),
    doubt = win(t, tBut + 0.05, tFine - 0.15, 0.35), fineW = rise(t, tFine - 0.1, 0.4), say = win(t, tFine - 0.04, tFine + 0.36, 0.12);
  const blinks = [0.75, 3.55, 6.35, 9.4], blink = blinks.reduce((m, b) => Math.max(m, clamp(1 - Math.abs(t - b) / 0.085)), 0);
  const face = {
    up: { skeptical: Math.max(skept, irrit * 0.9), surprised: doubt * 0.75, smile: interest * 0.55 + fineW * 0.8 },
    mouth: { skeptical: Math.max(skept, irrit) * (1 - interest), smile: interest * 0.6 + fineW * (1 - say) * 0.95, talk: say },
    lid: blink, squint: skept * 0.18 + irrit * 0.3 + fineW * 0.12,
    gazeX: lerp(-0.4, 0.5, ss(t / 2)) * (1 - interest) + interest * 0.9 * wob(t, 0.8) - doubt * 0.8 + 0.15 * wob(t, 1.7, 1),
    gazeY: -interest * 0.7 + 0.2 * wob(t, 1.1),
    brow: -irrit * 5 + interest * 3 + doubt * 6 + fineW * 2 };
  // body
  const shrug = Math.sin(clamp((t - (tFine - 0.2)) / 1.1) * Math.PI) * 0.9 + fineW * 0.1;
  const point = win(t, tMessy - 0.35, tSoda - 0.5, 0.35), open = rise(t, tFine - 0.25, 0.45);
  const wag = point * Math.sin((t - tMessy) * 11) * 0.16 * (t < tMessy + 1.1 ? 1 : 0.3);
  const armL = { pose: 'arm_L_down', a1: 0.03 + 0.02 * wob(t, 1.3) - open * 0.35, a2: -0.05 - open * 0.55,
    mix: { pose: 'arm_L_palm', w: ss((open - 0.35) / 0.35), angles: { a1: lerp(0.35, 0.05, open) + 0.04 * wob(t, 2.2), a2: -0.06 * wob(t, 2.6) } } };
  const armR = { pose: 'arm_R_down', a1: -0.03 - 0.02 * wob(t, 1.1) + open * 0.35 - point * 0.25, a2: 0.05 + open * 0.55 + point * 0.9,
    mix: point > open ? { pose: 'arm_R_point', w: ss((point - 0.3) / 0.35), angles: { a1: lerp(-0.3, 0.02, point), a2: wag } }
                      : { pose: 'arm_R_palm', w: ss((open - 0.35) / 0.35), angles: { a1: lerp(-0.35, -0.05, open) - 0.04 * wob(t, 2.2), a2: 0.06 * wob(t, 2.6) } } };
  return { face, breath: 0.01 * wob(t, 2.1), lift: shrug * 18, sway: 0.008 * wob(t, 0.9),
    tilt: -0.05 * skept + 0.04 * interest - 0.07 * doubt + 0.05 * fineW + 0.012 * wob(t, 1.3), nod: 0.03 * win(t, tImp - 0.05, tImp + 0.45, 0.15) + 0.02 * say,
    shift: -3 * skept + 4 * interest - 4 * doubt, arms: { L: armL, R: armR } }; }
// ---------- scene ----------
const DESK = [[0, 585], [330, 537], [720, 513], [1050, 513], [1385, 553], [1414, 590], [1400, 864], [0, 864]];
let R, BG;
function frame(ctx, t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#1A120C'; ctx.fillRect(0, 0, W, H);
  const k = ss(t / T), cz = lerp(1.55, 1.85, k), cx = lerp(500, 470, k), cy = lerp(420, 390, k);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1.25 * cz, 1.25 * cz); ctx.translate(-cx, -cy); ctx.drawImage(BG, 0, 0, 1536, 864);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(1060 + i * 70, -40); ctx.rotate(0.42); const g = ctx.createLinearGradient(0, 0, 0, 900);
    g.addColorStop(0, `rgba(255,220,150,${0.1 * (0.75 + 0.25 * Math.sin(t + i))})`); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(-28, 0, 60, 900); ctx.restore(); } ctx.restore();
  const A = act(t); RIG.draw(ctx, R, { x: 468, y: 330, s: 0.5, ...A });
  ctx.save(); ctx.beginPath(); DESK.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip(); ctx.drawImage(BG, 0, 0, 1536, 864); ctx.restore();
  ctx.save(); const g = ctx.createLinearGradient(0, 470, 0, 520); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); ctx.fillStyle = g; ctx.fillRect(300, 470, 340, 50); ctx.restore();
  for (let i = 0; i < 30; i++) { const px = 900 + (i * 53 + Math.sin(t * 0.3 + i) * 20) % 600, py = ((i * 97 - t * (8 + i % 5 * 2)) % 600 + 600) % 600; ctx.fillStyle = `rgba(255,236,200,${0.45 * Math.abs(Math.sin(t * 1.4 + i))})`; ctx.beginPath(); ctx.arc(px, py, 1.4, 0, 6.28); ctx.fill(); }
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,170,90,0.06)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(15,6,0,0.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
if (require.main === module) (async () => {
  const [mode, a1, a2] = process.argv.slice(2); R = await RIG.loadRig(CFG); BG = await loadImage(`${__dirname}/../figma_pilot/hi/02_office_empty.png`);
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'still') { const ts = a1.split(',').map(Number), sh = createCanvas(1920, 540 * Math.ceil(ts.length / 2)), sc = sh.getContext('2d');
    ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % 2) * 960, Math.floor(i / 2) * 540, 960, 540); sc.fillStyle = '#E8322E'; sc.font = '26px sans-serif'; sc.fillText(t.toFixed(2), (i % 2) * 960 + 8, Math.floor(i / 2) * 540 + 30); });
    return fs.writeFileSync(a2, sh.toBuffer('image/png')); }
  if (mode === 'frame') { frame(ctx, +a1); return fs.writeFileSync(a2, cv.toBuffer('image/png')); }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < Math.round(T * FPS); f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
})();
