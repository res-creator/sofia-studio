// engine/player.js — loads a project, maps global time -> shot, renders frames deterministically.
// window.renderFrame(frameIndex) draws one frame onto #main. Used by render.mjs (headless).
import { E, V, setStyle, getShot, clamp, ease, prog, alpha, text, FONTS } from './core.js';
import { STYLES } from './styles.js';
import { captions } from './ui2d.js';

const q = new URLSearchParams(location.search);
const PROJ = '/project';
const RES = { '720p': 720, '1080p': 1080, '1440p': 1440, '2160p': 2160, '4k': 2160 };
let main, mg, bufA, bufB, glCanvas, grainTiles = [], three = null;
const errors = (window.ERRORS = []);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

async function loadFonts() {
  for (const f of (E.cfg && E.cfg.fonts) || []) {   // шрифты проекта: config.json "fonts": [{family, file, weight}]
    try { const ff = new FontFace(f.family, `url(${PROJ}/${f.file})`, { weight: f.weight || '400 900' }); await ff.load(); document.fonts.add(ff); } catch (e) { console.log('project font missing', f.file); }
  }
  const F = [['Fredoka', '600', 'fredoka', 'normal'], ['Fredoka', '700', 'fredoka', 'normal'],
    ...['600', '700', '800', '900'].map(w => ['Nunito', w, 'nunito', 'normal']),
    ['Playfair Display', '900', 'playfair-display', 'italic']];
  for (const [fam, weight, pkg, style] of F) {
    for (const subset of (fam === 'Fredoka' ? ['latin'] : ['latin', 'cyrillic'])) {
      const file = `${pkg}/files/${pkg}-${subset}-${weight}-${style}.woff2`;
      try {
        const ff = new FontFace(fam, `url(/node_modules/@fontsource/${file})`, {
          weight, style, unicodeRange: subset === 'cyrillic' ? 'U+0400-052F,U+2DE0-2DFF,U+A640-A69F' : 'U+0000-024F,U+1E00-1EFF,U+2000-206F,U+20A0-20CF,U+2100-214F'
        });
        await ff.load(); document.fonts.add(ff);
      } catch (e) {
        if (subset === 'cyrillic' && /^(ru|uk|be|bg|mk|sr|kk|ky)(-|$)/i.test(E.cfg.language || 'ru')) throw new Error(`Required Cyrillic font missing: ${file}`);
        console.log('font missing', file);
      }
    }
  }
}
async function boot() {
  const cfg = await (await fetch(`${PROJ}/config.json`)).json();
  const story = await (await fetch(`${PROJ}/story/shots.json`)).json();
  let words = []; try { const r = await fetch(`${PROJ}/timeline/words.json`); if (r.ok) words = await r.json(); } catch {}
  const vertical = (cfg.aspect || '16:9') === '9:16';
  const short = RES[cfg.resolution || '1080p'] || 1080, long = Math.round((short * 16) / 9 / 2) * 2;
  const scale = +(q.get('scale') || 1);
  const outW = Math.round(((vertical ? short : long) * scale) / 2) * 2, outH = Math.round(((vertical ? long : short) * scale) / 2) * 2;
  Object.assign(E, { vertical, W: vertical ? 1080 : 1920, H: vertical ? 1920 : 1080, fps: cfg.fps || 24, cfg, words: words.words || words, shots: story.shots, outW, outH });
  E.PX = outW / E.W;
  FONTS.title = /^(ru|uk|be|bg|mk|sr|kk|ky)(-|$)/i.test(cfg.language || "ru") ? "Nunito" : "Fredoka";
  setStyle(q.get('style') || cfg.style || 'dusk');
  await loadFonts();
  main = document.getElementById('main'); main.width = outW; main.height = outH; mg = main.getContext('2d', { willReadFrequently: true });
  buildLUT();
  bufA = mk(outW, outH); bufB = mk(outW, outH);
  const gw = Math.ceil(outW / 2), gh = Math.ceil(outH / 2);
  for (let k = 0; k < 4; k++) { const c = mk(gw, gh), x = c.getContext('2d'), id = x.createImageData(gw, gh); let s = 1234 + k * 999; for (let i = 0; i < id.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = s >>> 24; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } x.putImageData(id, 0, 0); grainTiles.push(c); }
  const list = await (await fetch(`/__manifest`)).json();
  for (const f of list) { try { await import(f); } catch (e) { errors.push(`import ${f}: ${e.message}`); console.log('IMPORT ERROR', f, e.message); } }
  if (E.shots.some(s => getShot(s.id)?.kind === '3d')) { three = await import('./three-kit.js'); glCanvas = mk(outW, outH); three.getRenderer(glCanvas); }
  const dur = story.duration || E.shots[E.shots.length - 1].end;
  window.DURATION = dur; window.TOTAL_FRAMES = Math.ceil(dur * E.fps); window.OUT = [outW, outH];
  window.SHOT_LIST = E.shots.map(s => ({ id: s.id, start: s.start, end: s.end, ok: !!getShot(s.id) }));
  window.READY = true;
}

// colour grade: per-channel lift/gamma/gain + contrast as LUTs, saturation per pixel
let LUT = null, SAT = 1;
function buildLUT() {
  const gr = E.style.grade || {}; const lift = gr.lift || [0, 0, 0], gam = gr.gamma || [1, 1, 1], gain = gr.gain || [1, 1, 1], con = gr.contrast ?? 1; SAT = gr.sat ?? 1;
  const ident = con === 1 && lift.every(v => v === 0) && gam.every(v => v === 1) && gain.every(v => v === 1);
  if (ident && SAT === 1) { LUT = null; return; }
  LUT = [0, 1, 2].map(c => { const a = new Uint8ClampedArray(256); for (let i = 0; i < 256; i++) { let x = i / 255; x = clamp((x - 0.5) * con + 0.5); x = clamp(gain[c] * (x + lift[c] * (1 - x))); x = Math.pow(x, 1 / gam[c]); a[i] = Math.round(x * 255); } return a; });
}
function applyGrade(W, H) {
  if (!LUT) return; const img = mg.getImageData(0, 0, W, H), d = img.data, [R, G, B] = LUT, s = SAT;
  for (let i = 0; i < d.length; i += 4) {
    let r = R[d[i]], g = G[d[i + 1]], b = B[d[i + 2]];
    if (s !== 1) { const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; r = l + (r - l) * s; g = l + (g - l) * s; b = l + (b - l) * s; }
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
  mg.putImageData(img, 0, 0);
}
function shotIndexAt(t) { const S = E.shots; for (let i = 0; i < S.length; i++) if (t < S[i].end) return i; return S.length - 1; }
const cache3D = new Map();
function state3D(shot, def, info) {
  if (cache3D.has(shot.id)) return cache3D.get(shot.id);
  for (const [k, v] of cache3D) if (cache3D.size >= 2) { v.dispose?.(); v.stage?.dispose?.(); cache3D.delete(k); }
  const st = def.init(three, info); cache3D.set(shot.id, st); return st;
}
// Авто-камера шота (opt-in: shot.mv = {r, px, py, cx, cy, z0, kick, kx, ky, shake:[[t, amp]]}).
// Почти линейный наезд r (доля зума в секунду, по умолчанию 4,5 %/с; r < 0 = отъезд), панорама px/py (px/с),
// kick = «срез в движение»: первые 5 кадров камера догоняет +4,5 % зума и kx/ky px с затуханием outCubic.
function camMove(g, mv, lt, dur) {
  const W = E.W, H = E.H, fr = 1 / E.fps, u = Math.min(Math.max(lt, 0), dur + 0.6), D = Math.max(dur, 0.2);
  const lin = u - 0.12 * u * u / (2 * D);                       // почти линейно, к концу чуть медленнее
  const r = mv.r ?? 0.045, px = mv.px || 0, py = mv.py || 0;
  let z0 = mv.z0 ?? 1; const need = 1 / Math.max(0.5, 1 - Math.max(Math.abs(px) * D / W, Math.abs(py) * D / H) - 0.004); z0 = Math.max(z0, need);
  const kk = mv.kick ? 1 - ease.out(clamp(lt / (5 * fr))) : 0; if (mv.kick) z0 += 0.05;
  let z = z0 * (r >= 0 ? 1 + r * lin : 1 + -r * (D - Math.min(lin, D))) - 0.045 * kk;
  let ox = px * (lin - D / 2) - (mv.kx ?? 0) * kk, oy = py * (lin - D / 2) - (mv.ky ?? 0) * kk;
  for (const [ts, amp] of mv.shake || []) { const v = (lt - ts) / (8 * fr); if (v > 0 && v < 1) { const a = amp * (1 - v); ox += Math.sin(lt * 90 + ts) * a; oy += Math.cos(lt * 77 + ts * 3) * a; } }
  const cx = mv.cx ?? W / 2, cy = mv.cy ?? H / 2, m = 1 - 1 / Math.max(z, 1);
  if (z < 1) z = 1; ox = clamp(ox, -cx * m, (W - cx) * m); oy = clamp(oy, -cy * m, (H - cy) * m);
  g.translate(cx, cy); g.scale(z, z); g.translate(-cx - ox, -cy - oy);
}
function drawShot(buf, shot, lt) {
  const g = buf.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, buf.width, buf.height); g.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  const def = getShot(shot.id); const dur = shot.end - shot.start;
  if (shot.mv) camMove(g, shot.mv, lt, dur);
  const info = { ...(shot.params || {}), shot, dur, globalT: shot.start + lt, p: clamp(lt / dur), line: shot.line };
  if (!def) { g.fillStyle = '#20141c'; g.fillRect(0, 0, E.W, E.H); text(g, `MISSING SHOT ${shot.id}`, E.W / 2, E.H / 2 - 30, { size: 60, color: '#ff6f61' }); text(g, (shot.line || '').slice(0, 80), E.W / 2, E.H / 2 + 50, { size: 30, color: '#fff', font: FONTS.ui, weight: 800 }); return; }
  try {
    if (def.kind === '3d') {
      const st = state3D(shot, def, info); def.draw(st, lt, info, three); (st.stage || st).render();
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(glCanvas, 0, 0, buf.width, buf.height); g.restore();
      if (def.overlay) { g.save(); def.overlay(g, lt, info, st); g.restore(); }
    } else { g.save(); def.draw(g, lt, info); g.restore(); }
  } catch (e) { const msg = `${shot.id}@${lt.toFixed(2)}: ${e.message}`; if (!errors.includes(msg) && errors.length < 200) errors.push(msg); console.log('SHOT ERROR', msg, e.stack?.split('\n')[1]);
    g.setTransform(E.PX, 0, 0, E.PX, 0, 0); text(g, 'ERROR ' + msg.slice(0, 90), E.W / 2, E.H / 2, { size: 34, color: '#ff4040', font: FONTS.ui, weight: 900 }); }
}
const BARS = () => ({ none: 0, wide: V(60, 0), scope: V(138, 170), thin: V(30, 60) });
const barVal = (s) => (typeof (s?.bars ?? E.cfg.bars) === 'number' ? (s.bars ?? E.cfg.bars) : BARS()[s?.bars ?? E.cfg.bars ?? V('wide', 'none')] ?? 0);

// карта времени: config.timeMap = [[новое, старое], ...] (кусочно-линейная): озвучка перемонтирована, кадры остаются на старой шкале
function mapTime(tn) { const M = E.cfg.timeMap; if (!M || !M.length) return tn; if (tn <= M[0][0]) return M[0][1] + (tn - M[0][0]); for (let i = 1; i < M.length; i++) { if (tn <= M[i][0]) { const [a0, b0] = M[i - 1], [a1, b1] = M[i]; return a1 === a0 ? b1 : b0 + (b1 - b0) * (tn - a0) / (a1 - a0); } } const L = M[M.length - 1]; return L[1] + (tn - L[0]); }
window.renderFrame = function (f) {
  const tn = f / E.fps, t = mapTime(tn), i = shotIndexAt(t), shot = E.shots[i], lt = t - shot.start;
  drawShot(bufA, shot, lt);
  const tr = shot.in || { type: 'cut' }, tdur = tr.dur ?? ({ whip: 0.35, whip2: 0.21, impact: 0.33, drop: 0.29, lightning: 0.25 }[tr.type] ?? 0.5);
  const W = main.width, H = main.height; mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalAlpha = 1; mg.globalCompositeOperation = 'source-over';
  const grade = E.style.grade; mg.filter = grade.filter && grade.filter !== 'none' ? grade.filter : 'none';
  if (tr.type !== 'cut' && i > 0 && lt < tdur) {
    const prev = E.shots[i - 1], k = ease.inOut(lt / tdur); if (tr.type !== 'impact' && tr.type !== 'lightning') drawShot(bufB, prev, t - prev.start);
    if (tr.type === 'fade') { mg.drawImage(bufB, 0, 0); mg.globalAlpha = k; mg.drawImage(bufA, 0, 0); }
    else if (tr.type === 'dip' || tr.type === 'dipWhite') { const c = tr.type === 'dip' ? '#000' : '#fff'; mg.drawImage(k < 0.5 ? bufB : bufA, 0, 0); mg.filter = 'none'; mg.globalAlpha = k < 0.5 ? k * 2 : (1 - k) * 2; mg.fillStyle = c; mg.fillRect(0, 0, W, H); }
    else if (tr.type === 'flash') { mg.drawImage(bufA, 0, 0); mg.filter = 'none'; mg.globalAlpha = (1 - lt / tdur) ** 2; mg.fillStyle = '#fff'; mg.fillRect(0, 0, W, H); }
    else if (tr.type === 'whip') { const dir = tr.dir || 1; for (let s = 0; s < 4; s++) { mg.globalAlpha = 0.3; mg.drawImage(bufB, -dir * k * W * 1.1 - dir * s * W * 0.02, 0); mg.drawImage(bufA, dir * (1 - k) * W * 1.1 + dir * s * W * 0.02, 0); } }
    else if (tr.type === 'push') { const dir = tr.dir || 1; mg.drawImage(bufB, -dir * k * W, 0); mg.drawImage(bufA, dir * (1 - k) * W, 0); }
    else if (tr.type === 'whip2') { // вжух со штрихами скорости: старый кадр уезжает, новый въезжает, поверх белые линии
      const dir = tr.dir || 1, e = ease.out(lt / tdur); for (let s = 0; s < 3; s++) { mg.globalAlpha = s ? 0.35 : 1; mg.drawImage(bufB, -dir * e * W - dir * s * W * 0.03, 0); mg.drawImage(bufA, dir * (1 - e) * W * 0.9 + dir * s * W * 0.03, 0); }
      mg.globalAlpha = 1; mg.filter = 'none'; const R = (n) => { const x = Math.sin(n * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); }; mg.fillStyle = '#ffffff';
      for (let k = 0; k < 11; k++) { const y = R(k) * H, len = W * (0.25 + R(k + 20) * 0.5), x = ((R(k + 40) * W) + dir * e * W * 1.6) % (W * 1.5) - W * 0.25; mg.globalAlpha = 0.55 + 0.4 * R(k + 60); mg.fillRect(x, y, len, 2 + R(k + 80) * 6 * (W / 1920)); } }
    else if (tr.type === 'impact') { // удар: 2 кадра ч/б лучи, затем тряска 6–8 кадров
      const fi = Math.floor(lt * E.fps); if (fi < 2) { mg.filter = 'grayscale(1) contrast(3)'; mg.drawImage(bufA, 0, 0); mg.filter = 'none'; mg.save(); mg.translate(W / 2, H / 2); mg.fillStyle = fi ? '#000' : '#fff'; mg.globalAlpha = 0.85; for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2 + fi * 0.1, w = 0.035; mg.beginPath(); mg.moveTo(Math.cos(a) * W * 0.12, Math.sin(a) * W * 0.12); mg.lineTo(Math.cos(a - w) * W, Math.sin(a - w) * W); mg.lineTo(Math.cos(a + w) * W, Math.sin(a + w) * W); mg.closePath(); mg.fill(); } mg.restore(); }
      else { const v = 1 - (lt - 2 / E.fps) / (tdur - 2 / E.fps), A = 0.018 * W * v; mg.drawImage(bufA, Math.sin(lt * 97) * A, Math.cos(lt * 83) * A * 0.7); } }
    else if (tr.type === 'drop') { // новая картинка падает сверху за 7 кадров, без отскока
      mg.drawImage(bufB, 0, 0); const e = ease.out(lt / tdur); mg.filter = 'none'; mg.fillStyle = 'rgba(0,0,0,.35)'; mg.fillRect(0, -H + e * H + 18, W, H); mg.filter = grade.filter && grade.filter !== 'none' ? grade.filter : 'none'; mg.drawImage(bufA, 0, -H * (1 - e)); }
    else if (tr.type === 'lightning') { mg.drawImage(bufA, 0, 0); const fi = Math.floor(lt * E.fps); if (fi === 0 || fi === 1 || fi === 4) { mg.filter = 'none'; mg.globalAlpha = fi === 4 ? 0.5 : 0.85; mg.fillStyle = '#fff'; mg.fillRect(0, 0, W, H); } }
    else if (tr.type === 'zoom') { mg.drawImage(bufB, 0, 0); const s = 1.15 - 0.15 * k; mg.globalAlpha = k; mg.translate(W / 2, H / 2); mg.scale(s, s); mg.drawImage(bufA, -W / 2, -H / 2); mg.setTransform(1, 0, 0, 1, 0, 0); }
    else mg.drawImage(bufA, 0, 0);
  } else mg.drawImage(bufA, 0, 0);
  mg.globalAlpha = 1; mg.filter = 'none'; mg.setTransform(1, 0, 0, 1, 0, 0);
  applyGrade(W, H);
  if (shot.tint) { // грейд на шот: sepia (прошлое), red (тревога), pink (нежность), cold; вход за 8 кадров
    const pv = i > 0 ? E.shots[i - 1].tint : null, k = pv === shot.tint ? 1 : clamp(lt * E.fps / 8), T = shot.tint; mg.save();
    if (T === 'sepia') { mg.globalCompositeOperation = 'color'; mg.fillStyle = `rgba(150,110,60,${0.8 * k})`; mg.fillRect(0, 0, W, H); mg.globalCompositeOperation = 'multiply'; mg.fillStyle = `rgba(250,228,190,${k})`; mg.fillRect(0, 0, W, H); }
    else if (T === 'red') { mg.globalCompositeOperation = 'multiply'; mg.fillStyle = `rgba(255,170,160,${0.55 * k})`; mg.fillRect(0, 0, W, H); }
    else if (T === 'pink') { mg.globalCompositeOperation = 'screen'; mg.fillStyle = `rgba(255,140,190,${0.16 * k})`; mg.fillRect(0, 0, W, H); }
    else if (T === 'cold') { mg.globalCompositeOperation = 'multiply'; mg.fillStyle = `rgba(170,190,235,${0.5 * k})`; mg.fillRect(0, 0, W, H); }
    mg.restore(); }
  if (grade.tint) { mg.globalCompositeOperation = grade.tint[1]; mg.fillStyle = alpha(grade.tint[0], grade.tint[2]); mg.fillRect(0, 0, W, H); mg.globalCompositeOperation = 'source-over'; }
  if (shot.vignette !== false && grade.vignette > 0) { const v = mg.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${grade.vignette})`); mg.fillStyle = v; mg.fillRect(0, 0, W, H); }
  if (grade.grain > 0) { mg.save(); mg.globalAlpha = grade.grain; mg.globalCompositeOperation = 'overlay'; mg.drawImage(grainTiles[f % 4], 0, 0, W, H); mg.restore(); }
  mg.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  if (E.cfg.captions && shot.captions !== false) captions(mg, t, E.cfg.captionStyle || {});
  const cur = barVal(shot), prevB = i > 0 ? barVal(E.shots[i - 1]) : cur, bar = prevB + (cur - prevB) * ease.inOut(prog(lt, 0, 0.6));
  if (bar > 0) { mg.fillStyle = '#000'; mg.fillRect(0, 0, E.W, bar); mg.fillRect(0, E.H - bar, E.W, bar); }
  const fi = E.cfg.fadeIn ?? 0.5, fo = E.cfg.fadeOut ?? 0.8, dur = window.DURATION, fade = Math.max(fi > 0 ? 1 - tn / fi : 0, fo > 0 ? 1 - (dur - tn) / fo : 0);
  if (fade > 0) { mg.fillStyle = `rgba(0,0,0,${clamp(fade)})`; mg.fillRect(0, 0, E.W, E.H); }
  if (q.has('debug')) { mg.fillStyle = 'rgba(0,0,0,.6)'; mg.fillRect(0, E.H - 54, E.W, 54); text(mg, `${shot.id}  ${t.toFixed(2)}s  (${lt.toFixed(2)}/${(shot.end - shot.start).toFixed(2)})  ${(shot.line || '').slice(0, 70)}`, 20, E.H - 27, { size: 26, color: '#fff', font: FONTS.ui, weight: 800, align: 'left' }); }
  mg.setTransform(1, 0, 0, 1, 0, 0);
};
boot().catch(e => { window.BOOT_ERROR = e.message + '\n' + e.stack; console.log('BOOT ERROR', e.message); });
