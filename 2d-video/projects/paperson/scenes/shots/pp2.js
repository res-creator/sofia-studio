// Кадры v2 (params.k === 'v2'): всё описано данными в story/board_v2.py — фон, актёры с действиями по времени,
// накладки (поп-бирки, счётчики, печати, частицы, печать в такт голосу), сплит-панели. Времена в params АБСОЛЮТНЫЕ.
import { E, registerShot } from '/engine/core.js';
import { fig, SK, vignette, typeCard, ln, el, bx, pg, fo, glow, blob, clamp, ease, lerp, htxt, OL, vg, rr, baby, notes, pen } from '../lib/pro.js';
import * as A from '../lib/afg.js';
import * as B from '../lib/afg2.js';
import * as B3 from '../lib/afg3.js';
import * as M from '../lib/motion.js';
import { worldMap, mapProj, pin, route, globe } from '/projects/remote/scenes/lib/sets.js';
import { subscribe } from '/projects/remote/scenes/lib/sets2.js';
import * as PP from '../lib/pp_sets.js';
// архивные фото (общественное достояние / CC BY-SA с указанием автора): загружаются до первого кадра
const PH = {}; const PHC = {
  angel_building: 'Остров Ангела. Фото: E bailey, CC BY-SA 4.0', poetry: 'Стихи на стене барака. Фото: Rhododendrites, CC BY-SA 4.0', carved: 'Надписи на стене. Фото: Frank Schulenburg, CC BY-SA 4.0',
  law: 'Закон об исключении китайцев, 1882. Общественное достояние', rail: 'Китайские рабочие, 1863-1869. Общественное достояние', genthe: 'Сан-Франциско, 18 апреля 1906. Фото: Арнольд Генте. Общественное достояние',
  worden: 'Сан-Франциско, 1906. Фото: Уиллард Уорден. Общественное достояние', leaving: 'Жители покидают город, 1906. NARA. Общественное достояние', paperson: 'Заявление на удостоверение личности, Сан-Франциско. Общественное достояние', lawrence: 'Сан-Франциско после пожара, 1906. Фото: Джордж Лоренс. Общественное достояние' };
await Promise.all(Object.keys(PHC).map((k) => new Promise((res) => { const im = new Image(); im.onload = () => { PH[k] = im; res(); }; im.onerror = () => res(); im.src = `/project/assets/archive/${k}.jpg`; })));
// «вырезка из бумаги»: фото на весь кадр в тоне эпохи, персонажи с белым контуром и тенью, плёночное зерно
function photoFull(g, o) {
  const im = PH[o.src]; g.fillStyle = '#0c0c10'; g.fillRect(-200, -200, 2320, 1480); if (!im) return;
  const cs = Math.max(1920 / im.width, 1080 / im.height) * (o.zoom ?? 1.02), w = im.width * cs, h = im.height * cs;
  g.save(); g.filter = o.tone === 'none' ? 'none' : `grayscale(1) sepia(${o.sep ?? 0.55}) contrast(1.08) brightness(${o.br ?? 0.9})`; g.drawImage(im, 960 - w / 2 + (o.dx ?? 0), 540 - h / 2 + (o.dy ?? 0), w, h); g.restore();
  g.fillStyle = `rgba(20,12,6,${o.dim ?? 0.28})`; g.fillRect(-200, -200, 2320, 1480);
}
let GRAIN = null;
function grain(g, gt, a = 0.13) {
  if (!GRAIN) { GRAIN = document.createElement('canvas'); GRAIN.width = GRAIN.height = 256; const x = GRAIN.getContext('2d'), d = x.createImageData(256, 256); let r = 1; for (let i = 0; i < d.data.length; i += 4) { r = (r * 16807) % 2147483647; const v = (r % 255); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); }
  g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0); g.globalAlpha = a; g.globalCompositeOperation = 'overlay'; const ox = (Math.floor(gt * 24) * 53) % 256, oy = (Math.floor(gt * 24) * 97) % 256;
  for (let x = -ox; x < 1920; x += 256) for (let y = -oy; y < 1080; y += 256) g.drawImage(GRAIN, x, y); g.restore();
}
function sticker(g, draw) {
  const cv = g.canvas, oc = document.createElement('canvas'); oc.width = cv.width; oc.height = cv.height; const o = oc.getContext('2d'); o.setTransform(g.getTransform()); draw(o);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const k = E.PX * 1.0, f = [[5, 0], [-5, 0], [0, 5], [0, -5], [4, 4], [-4, -4], [4, -4], [-4, 4]].map(([x, y]) => `drop-shadow(${x * k}px ${y * k}px 0 #fbf8f0)`).join(' ');
  g.filter = f + ` drop-shadow(${10 * k}px ${16 * k}px ${18 * k}px rgba(0,0,0,.55))`; g.drawImage(oc, 0, 0); g.restore();
}
function photoBg(g, o) {
  const im = PH[o.src]; g.fillStyle = '#101014'; g.fillRect(-200, -200, 2320, 1480); if (!im) return;
  const cs = Math.max(2320 / im.width, 1480 / im.height); g.save(); g.filter = 'blur(26px)'; g.drawImage(im, 960 - im.width * cs / 2, 540 - im.height * cs / 2, im.width * cs, im.height * cs); g.restore();
  g.fillStyle = 'rgba(8,8,14,.45)'; g.fillRect(-200, -200, 2320, 1480);
  const mw = o.maxw ?? 1560, mh = o.maxh ?? 820, k = Math.min(mw / im.width, mh / im.height), w = im.width * k, h = im.height * k, cx = 960, cy = o.cy ?? 520;
  g.save(); g.translate(cx, cy); g.rotate(o.rot ?? 0); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; g.shadowOffsetY = 14; g.fillStyle = '#f4f1ea'; g.fillRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32); g.shadowColor = 'transparent';
  if (o.bw) g.filter = 'grayscale(1) contrast(1.05)'; g.drawImage(im, -w / 2, -h / 2, w, h); g.filter = 'none'; g.restore();
  const c = o.credit ?? PHC[o.src]; if (c) { g.save(); g.font = '600 26px sans-serif'; const tw = g.measureText(c).width + 36; g.fillStyle = 'rgba(10,10,16,.72)'; g.fillRect(960 - tw / 2, 1006, tw, 46); g.fillStyle = '#e8e4da'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c, 960, 1030); g.restore(); }
}
const SKC = '#e6bf94';
export const C = {
  boy: { hair: 'side', hairC: '#1c1816', body: 'perahan', coat: '#5a6a7a', vest: '#3a4048', skin: SKC, seed: 3, brow: 6 },
  brother: { hair: 'side', hairC: '#1c1816', body: 'perahan', coat: '#7a6a52', vest: '#4a3a30', skin: SKC, seed: 6 },
  father: { hair: 'side', hairC: '#2a2420', body: 'uniform', coat: '#3a3f4a', shirt: '#e3dcc2', tie: '#6a2a22', skin: SK.b, seed: 8, brow: 5 },
  clerk: { hair: 'side', hairC: '#3a2a20', body: 'uniform', coat: '#2a3a5a', shirt: '#efece4', tie: '#2a2a33', skin: SK.a, seed: 12 },
  worker: { hair: 'side', hairC: '#1c1816', body: 'perahan', coat: '#4a5a6a', vest: '#6a5a40', skin: SKC, seed: 14 },
  worker2: { hair: 'side', hairC: '#1c1816', body: 'perahan', coat: '#7a6a4a', vest: '#4a4a3a', skin: SK.b, seed: 15 },
  man: { hair: 'side', hairC: '#2a2320', body: 'uniform', coat: '#6a5a4a', shirt: '#e3dcc2', tie: '#33352a', skin: SK.a, seed: 17 },
  woman: { hair: 'bob', hairC: '#1c1816', body: 'dress', coat: '#7a3a5a', shirt: '#7a3a5a', skin: SKC, seed: 18 },
};

// ---------------------------------------------------------------- значения, зависящие от времени: {kv: [[abs, v], ...], d}
const val = (v, gt) => (v && typeof v === 'object' && !Array.isArray(v) && v.kv ? M.kv(gt, v.kv, v.d ?? 0.3, ease.inOut) : v);
const resolve = (o, gt) => { if (!o) return {}; const r = {}; for (const k in o) r[k] = val(o[k], gt); return r; };
// фон по имени
function drawBg(g, name, t, gt, o) {
  if (!name) return; if (name === 'black') { g.fillStyle = '#060606'; g.fillRect(-200, -200, 2320, 1480); return; }
  if (name === 'photo') return photoBg(g, o);
  if (name === 'photoFull') return photoFull(g, o);
  if (name === 'paper') { g.fillStyle = vg(g, 0, 1080, o.col || '#f2ead8', 0.1); g.fillRect(-200, -200, 2320, 1480); return; }
  if (name === 'color') { g.fillStyle = vg(g, 0, 1080, o.col || '#2a2638', 0.2); g.fillRect(-200, -200, 2320, 1480); return; }
  if (name === 'map') { worldMap(g, t, { view: o.view, hl: o.hl, labels: o.labels }); return; }
  if (name === 'globe') { g.fillStyle = '#0d1530'; g.fillRect(-200, -200, 2320, 1480); for (let k = 0; k < 120; k++) el(g, (k * 397) % 1920, (k * 211) % 1080, 2, 2, 'rgba(255,255,255,.5)', 0); globe(g, 960, 560, 440, (o.lon ?? 66) + t * (o.spin ?? 0), o.lat ?? 30, { hl: o.hl }); return; }
  const f = PP[name] || B3[name] || B[name] || A[name]; if (!f) throw new Error('no set ' + name);
  if (name === 'bricked') return f(g, t, { k0: o.k0 != null ? o.k0 : 0 });
  if (name === 'icons') return f(g, o.at != null ? gt - o.at : t, o.n, o.rows, o.frac, { col: o.col, bg: o.bg });
  if (name === 'timeline') return f(g, t, o.items);
  if (name === 'years') return f(g, o.at != null ? gt - o.at : t, o.a, o.b);
  if (name === 'classroom') return f(g, t, { board: o.board });
  if (name === 'foodInsert') return f(g, t, o.dish);
  if (name === 'clockNight') return f(g, t);
  return f(g, t, o);
}
const spool = (g, x, y) => { g.save(); g.translate(x + 6, y - 20); bx(g, -26, -34, 52, 68, '#b8864a', 8, 4); bx(g, -18, -24, 36, 48, '#e8e0d0', 4, 3); g.restore(); };
const steth = (g, x, y) => { g.save(); g.translate(x, y); for (const [w, c] of [[10, OL], [5, '#5a6a7a']]) { g.beginPath(); g.moveTo(-34, -70); g.bezierCurveTo(-44, 0, 34, 0, 34, -70); g.lineWidth = w; g.strokeStyle = c; g.stroke(); g.beginPath(); g.moveTo(0, -16); g.quadraticCurveTo(10, 50, 0, 96); g.stroke(); } el(g, -34, -74, 7, 7, OL, 0); el(g, 34, -74, 7, 7, OL, 0); el(g, 0, 108, 22, 22, '#b8c0c8', 5); el(g, 0, 108, 9, 9, '#7a8088', 0); g.restore(); };
const key = (g, x, y) => { g.save(); g.translate(x + 10, y - 10); g.rotate(-0.6); el(g, 0, -30, 18, 18, '#e0b33a', 5); ln(g, [[0, -12], [0, 40]], 8, '#c8901c'); ln(g, [[0, 30], [14, 30]], 6, '#c8901c'); g.restore(); };
const mic = (g, x, y) => { g.save(); g.translate(x, y); ln(g, [[0, 0], [0, -60]], 8); bx(g, -20, -110, 40, 60, '#3a3a3a', 20, 4); g.restore(); };
const PROPS = { spool, steth, key, mic, baby, notes, pen, dryer: M.dryer, broom: M.broom, money: M.money, toolbag: M.toolbag, handbag: M.handbag, cloth: M.cloth, folder: M.folder, comb: M.comb, book: M.book };
function prop(name, gt, st) {
  if (!name) return undefined; if (typeof name === 'function') return name;
  if (name === 'scissors' || name === 'snip') { const on = name === 'snip' || (st.snip || []).some(([a, b]) => gt >= a && gt <= b); return M.scissors(on ? 0.5 + 0.5 * Math.sin(gt * 18) : 0.15); }
  if (name === 'dryerOn') return M.dryer(true, gt); if (name === 'dryer') return M.dryer(false, gt);
  return PROPS[name];
}
const keyAt = (keys, gt) => { let v = keys[0][1]; for (const [k, x] of keys) if (gt >= k) v = x; return v; };
// актёр: [x, y, s, who, opts]; opts: poses/exprs/holdKeys [[abs, v]], walk{x0,x1,at,dur}, nods/shakes/jumpAt [abs], bowAt, veilKeys, appear (abs), leave (abs), popIn
function actorDraw(g, t, gt, st, [x, y, s, who, op = {}]) {
  if (op.appear != null && gt < op.appear) return; if (op.leave != null && gt > op.leave) return;
  const o = { ...(C[who] || {}), ...op }; const r = (a) => a - st;
  if (o.poses) o.poses = o.poses.map(([a, p]) => [r(a), p]);
  if (o.exprs) o.exprs = o.exprs.map(([a, p]) => [r(a), p]);
  if (o.walk) o.walk = { ...o.walk, at: r(o.walk.at) };
  for (const k of ['nods', 'shakes']) if (o[k]) o[k] = o[k].map(r);
  if (o.jumpAt != null) o.jumpAt = [].concat(o.jumpAt).map(r); if (o.bowAt != null) o.bowAt = r(o.bowAt);
  if (o.veilKeys) o.veilKeys = o.veilKeys.map(([a, v]) => [r(a), v]);
  if (o.holdKeys) o.holdR = keyAt(o.holdKeys, gt); if (o.holdLKeys) o.holdL = keyAt(o.holdLKeys, gt);
  if (o.stethAt != null) o.steth = gt >= o.stethAt;
  if (o.tearAt != null) o.tear = gt > o.tearAt ? 1 : 0; if (o.sweatAt != null) o.sweat = gt > o.sweatAt && gt < o.sweatAt + 2.5;
  if (o.mouthKeys) o.mouth = keyAt(o.mouthKeys, gt) ? 0.35 + 0.45 * Math.abs(Math.sin(gt * 9)) : 0; if (o.talkKeys) o.talk = !!keyAt(o.talkKeys, gt);
  if (o.lookKeys) o.look = M.kv(gt, o.lookKeys, 0.25); if (o.turnKeys) o.turn = M.kv(gt, o.turnKeys, 0.25);
  o.holdR = prop(o.holdR, gt, o); o.holdL = prop(o.holdL, gt, o);
  let sc = s; if (op.appear != null && op.popIn) { const p = M.pop2(gt, op.appear); sc = s * (p ? p.k : 0); }
  M.actor(g, x, y, sc, o, t);
}
// накладки: [тип, ...] с абсолютными временами
function fxDraw(g, t, gt, st, F) {
  const [k] = F, tt = gt;
  switch (k) {
    case 'ptag': M.ptag(g, F[1], F[2], F[3], tt, F[4], F[5] || {}); break;
    case 'ptxt': M.ptxt(g, F[1], F[2], F[3], F[4], tt, F[5], F[6] || {}); break;
    case 'count': M.countUp(g, tt, F[1], F[2], F[3], F[4], F[5], F[6] || {}); break;
    case 'stamp': M.stampX(g, tt, F[1], F[2], F[3], F[4] ?? 120, F[5] || {}); break;
    case 'ok': M.stampOK(g, tt, F[1], F[2], F[3], F[4] ?? 90); break;
    case 'burst': { const ats = [].concat(F[1]); ats.forEach((a, j) => M.burst(g, tt, a, F[2], F[3], F[4], { seed: 5 + j * 3, ...(F[5] || {}) })); break; }
    case 'sweat': M.sweatDrop(g, tt, F[1], F[2], F[3], F[4] ?? 1); break;
    case 'type': M.typeLine(g, F[1], F[2], F[3], F[4], tt, F[5], F[6] || {}); break;
    case 'card': { if (tt < F[2]) break; const n = Math.min(F[1].length, Math.floor((tt - F[2]) * (F[6] ?? 18)) + 1); g.save(); g.font = `700 ${F[5] ?? 110}px "Caveat"`; g.textAlign = 'left'; g.textBaseline = 'middle'; const w = g.measureText(F[1]).width; g.fillStyle = F[7] || '#f4f1ea'; g.fillText(F[1].slice(0, n), F[3] - w / 2, F[4]); g.restore(); break; }
    case 'client': B3.client(g, F[1], F[2], F[3], t, { ...(F[4] || {}), wind: F[4]?.windAt ? (gt > F[4].windAt[0] && gt < F[4].windAt[1] ? 1 : 0) : F[4]?.wind }); break;
    case 'shovel': B3.shovel(g, F[1], F[2]); break;
    case 'badge': B3.badge(g, F[1], F[2], F[3] ?? 1, F[4]); break;
    case 'dust': M.dust(g, t, F[1], F[2], F[3], F[4], F[5] ?? 30); break;
    case 'dim': { const a = F[1] != null ? M.kv(gt, F[1], 0.4) : 0.4; g.save(); g.fillStyle = `rgba(10,8,16,${a})`; g.fillRect(-200, -200, 2320, 1480); g.restore(); break; }
    case 'glow': glow(g, F[1], F[2], Array.isArray(F[3]) ? M.kv(gt, F[3], 0.8) : F[3], F[4] || '255,220,150', F[5] ?? 0.4); break;
    case 'iconrow': { // ряд человечков; hi: индексы подсвечиваются с at (по одному с шагом step); boxes: коробки падают
      const [, n, x0, y0, w, s0, o] = F; for (let i = 0; i < n; i++) { const x = x0 + i * w, on = o.hi && o.hi.includes(i) && gt >= o.at + o.hi.indexOf(i) * (o.step ?? 0.1), c = on ? (o.col || '#e2483a') : (o.off || '#c8c0b0'); const p = on ? M.pop2(gt, o.at + o.hi.indexOf(i) * (o.step ?? 0.1)) : null, sc = s0 * (p ? p.k : 1);
        g.save(); g.translate(x, y0); g.scale(sc, sc); el(g, 0, -60, 30, 30, c, 4); pg(g, [[-34, -26], [34, -26], [50, 50], [-50, 50]], c, 4); g.restore();
        if (o.box && on) { const a = o.at + o.hi.indexOf(i) * (o.step ?? 0.1), u = ease.out(clamp((gt - a) / 0.3)); bx(g, x - 30 * s0, y0 - 190 * s0 - (1 - u) * 400, 60 * s0, 50 * s0, '#c8a46a', 4, 3); } } break; }
    case 'circle': { const [, at, x, y, r0, col] = F; if (gt < at) break; const u = ease.out(clamp((gt - at) / 0.35)); g.beginPath(); g.arc(x, y, r0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u); g.lineWidth = 12; g.strokeStyle = col || '#e2483a'; g.stroke(); break; }
    case 'arrow': { const [, at, x0, y0, x1, y1, col] = F; if (gt < at) break; const u = ease.out(clamp((gt - at) / 0.4)), x = lerp(x0, x1, u), y = lerp(y0, y1, u), a = Math.atan2(y1 - y0, x1 - x0); ln(g, [[x0, y0], [x, y]], 16, OL); ln(g, [[x0, y0], [x, y]], 9, col || '#ffd43b'); g.save(); g.translate(x, y); g.rotate(a); pg(g, [[18, 0], [-22, -22], [-22, 22]], col || '#ffd43b', 4); g.restore(); break; }
    case 'pin': { const P = mapProj(F[1]), [x, y] = P(F[2], F[3]); pin(g, x, y, gt - st, F[4] - st, F[5], { size: 64, ring: true, ...(F[6] || {}) }); break; }
    case 'route': { const P = mapProj(F[1]), a = P(...F[2]), b = P(...F[3]); route(g, a[0], a[1], b[0], b[1], gt - st, F[4] - st, F[5] ?? 0.9, F[6], { arc: 0.25 }); break; }
    case 'ring72': { const [kx, ky, rx, ry] = B3.afgMap(g, t, { k: 0, labels: [] }); break; }
    case 'knock': { const ats = F[1]; for (const a of ats) { const u = (gt - a) / 0.35; if (u > 0 && u < 1) { g.save(); g.globalAlpha = 1 - u; for (let k = -1; k <= 1; k++) ln(g, [[F[2] + 20, F[3] + k * 40], [F[2] + 60 + u * 40, F[3] + k * 55]], 7, '#ffffff'); g.restore(); } } break; }
    case 'sub': subscribe(g, t, F[1]); break;
    case 'board': { if (gt < F[1]) break; const n = Math.min(F[2].length, Math.floor((gt - F[1]) * (F[6] ?? 10)) + 1); htxt(g, F[2].slice(0, n), F[3], F[4], F[5] ?? 80, F[7] || 'rgba(245,245,235,.95)'); break; }
    case 'veilfall': { const [, at, x, y, w] = F; const u = ease.out(clamp((gt - at) / 0.35)); if (u <= 0) break; pg(g, [[x - w / 2, y - 240 + u * 40], [x + w / 2, y - 240 + u * 40], [x + w / 2 - 10, y - 240 + u * 200], [x - w / 2 + 10, y - 240 + u * 200]], '#c84a6a', 5); break; }
    case 'clockspin': { const [, x, y, r, at, turns] = F; el(g, x, y, r, r, '#f4efe2', 8); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ln(g, [[x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8], [x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9]], 5); } const a = -Math.PI / 2 + (gt > at ? (gt - at) * Math.PI * 2 * (turns ?? 1) : 0); ln(g, [[x, y], [x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8]], 9, '#e2483a'); ln(g, [[x, y], [x + Math.cos(a / 12) * r * 0.5, y + Math.sin(a / 12) * r * 0.5]], 11); el(g, x, y, 12, 12, OL, 0); break; }
    case 'bell': { const [, at, x, y, s0] = F; const sh = gt > at && gt < at + 1.2 ? Math.sin((gt - at) * 30) * 0.35 * (1 - (gt - at) / 1.2) : 0; g.save(); g.translate(x, y); g.scale(s0 ?? 1, s0 ?? 1); g.rotate(sh); g.beginPath(); g.moveTo(-60, 40); g.quadraticCurveTo(-60, -70, 0, -70); g.quadraticCurveTo(60, -70, 60, 40); g.lineTo(76, 60); g.lineTo(-76, 60); g.closePath(); fo(g, '#e0b33a', 6); el(g, 0, 72, 16, 16, '#c8901c', 4); g.restore(); if (sh) M.burst(g, gt, at, x, y, 'lines', { n: 10, speed: 400, grav: 0, life: 0.5, size: 14 }); break; }
    case 'dast': A.dastarkhan(g, t); break;
    case 'rehal': B.rehal(g, F[1], F[2], F[3] ?? 1); break;
    case 'deskrow': A.deskRow(g, F[1], F[2]); break;
    case 'plate': { const [, at, x, y, s0, col, fs0] = F; const fs = fs0 || 64; const p = M.pop2(gt, at); if (!p) break; g.save(); g.translate(x, y); g.scale(p.k, p.k); g.font = `700 ${fs}px "Caveat"`; const ww = g.measureText(s0).width + fs; bx(g, -ww / 2, -fs * 0.78, ww, fs * 1.56, col || '#f6f1e4', 8, 5); htxt(g, s0, 0, 2, fs, OL); g.restore(); break; }
    case 'strike': { const [, at, x, y, w0] = F; const u = ease.out(clamp((gt - at) / 0.25)); if (u <= 0) break; ln(g, [[x - w0 / 2, y + 8], [x - w0 / 2 + w0 * u, y - 4]], 12, '#141212'); ln(g, [[x - w0 / 2, y + 8], [x - w0 / 2 + w0 * u, y - 4]], 7, '#e2483a'); break; }
    case 'sleep': { const [, x, y, s0, who, op = {}] = F; bx(g, x - 520 * s0, y - 20, 640 * s0, 60, '#e8e4f0', 20, 5); g.save(); g.translate(x, y); g.rotate(-Math.PI / 2); fig(g, 0, 0, s0, { ...C[who], eyesShut: !op.awake, noShadow: true, ...op }, t); g.restore(); bx(g, x - 330 * s0, y - 150 * s0, 360 * s0, 170 * s0, op.blanket || '#7a5a9a', 30, 5); break; }
    case 'table': { const [, x, y, w0] = F; bx(g, x - w0 / 2, y, w0, 34, '#7a5236', 6, 5); bx(g, x - w0 / 2 + 20, y + 34, w0 - 40, 150, '#8a6242', 6, 5); break; }
    case 'notebook': { const [, x, y, w0, h0] = F; blob(g, x, y + h0 / 2 + 10, w0 * 0.55, 30, 0.3); pg(g, [[x - w0 / 2, y - h0 / 2], [x, y - h0 / 2 + 14], [x, y + h0 / 2], [x - w0 / 2, y + h0 / 2 - 14]], '#f8f6ee', 5); pg(g, [[x + w0 / 2, y - h0 / 2], [x, y - h0 / 2 + 14], [x, y + h0 / 2], [x + w0 / 2, y + h0 / 2 - 14]], '#f8f6ee', 5); for (let k = 1; k < 8; k++) { const yy = y - h0 / 2 + k * h0 / 8 + 7; ln(g, [[x - w0 / 2 + 20, yy], [x - 20, yy + 4]], 2, '#a8c0e0'); ln(g, [[x + 20, yy + 4], [x + w0 / 2 - 20, yy]], 2, '#a8c0e0'); } break; }
    case 'dots': { const [, at, n, x0, y0, w0, h0] = F; const R = (k) => { const v = Math.sin(k * 91.7 + 1.3) * 43758.5; return v - Math.floor(v); }; for (let i = 0; i < n; i++) { const a = at + i * 0.07; if (gt < a) continue; const x = x0 + R(i) * w0, y = y0 + R(i + 50) * h0; glow(g, x, y, 40, '255,220,120', 0.7); el(g, x, y, 9, 9, '#ffe9a0', 3); } break; }
    case 'stack': { const [, ats, x, y] = F; ats.forEach((a, k) => { const p = M.pop2(gt, a); if (!p) return; g.save(); g.translate(x + (k % 2) * 8, y - k * 34); g.scale(p.k, p.k); bx(g, -150, -16, 300, 32, ['#3a6aa8', '#c84a6a', '#2b6a4a', '#e0b33a'][k % 4], 4, 4); g.restore(); }); break; }
    case 'sketch': { const [, at, d, x0, y0, w0] = F; const u = clamp((gt - at) / d); if (u <= 0) break; g.save(); g.beginPath(); const N = 9; for (let k = 0; k <= N * u; k++) { const x = x0 + (k / N) * w0, y = y0 - (k % 2 ? 160 : 20); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.lineWidth = 9; g.strokeStyle = '#3a5a8a'; g.lineJoin = 'round'; g.stroke(); g.restore(); break; }
    case 'ballot': { const [, at, x, y] = F; bx(g, x - 110, y - 120, 220, 170, '#d8c8a8', 6, 5); ln(g, [[x - 50, y - 120], [x + 50, y - 120]], 8); const u = ease.in(clamp((gt - at) / 0.4)); if (gt > at - 0.4 && u < 1) bx(g, x - 40, y - 320 + u * 200, 80, 100, '#ffffff', 4, 4); break; }
    case 'podium': { const [, x, y] = F; pg(g, [[x - 160, y], [x + 160, y], [x + 130, y - 260], [x - 130, y - 260]], vg(g, y - 260, 260, '#7a5236', 0.15), 6); bx(g, x - 180, y - 290, 360, 40, '#5a3a22', 6, 5); ln(g, [[x + 60, y - 290], [x + 30, y - 380]], 6); el(g, x + 30, y - 390, 16, 16, '#3a3a3a', 4); break; }
    case 'bed': { const [, x, y, w0] = F; bx(g, x - w0 / 2, y - 140, w0, 140, '#8a6a42', 10, 6); bx(g, x - w0 / 2 + 20, y - 190, w0 - 40, 80, '#e8e4f0', 20, 5); break; }
    case 'chain': { const [, at, x, y, w0] = F; const u = ease.out(clamp((gt - at) / 0.3)); if (u <= 0) break; for (let k = 0; k < 9 * u; k++) el(g, x - w0 / 2 + k * w0 / 8, y + Math.sin(k) * 4, 24, 14, '#8a8a90', 5); bx(g, x - 30, y + 10, 60, 70, '#c8a23a', 10, 4); break; }
    case 'tv': { const [, x, y, s0] = F; g.save(); g.translate(x, y); g.scale(s0, s0); bx(g, -300, -200, 600, 400, '#3a3a3a', 26, 7); rr(g, -270, -170, 540, 320, 16); fo(g, '#f4f6fb', 5); bx(g, -240, -140, 340, 230, '#2f5a46', 6, 4); g.restore(); break; }
    case 'hat': { const [, x, y, s0] = F; g.save(); g.translate(x, y); g.scale(s0, s0); pg(g, [[-190, -490], [0, -690], [190, -490]], '#d8c07a', 5); ln(g, [[-190, -490], [190, -490]], 6); ln(g, [[-110, -540], [110, -540]], 3, '#8a7a3a'); g.restore(); break; }
    case 'compass': PP.compass(g, F[1], F[2], F[3], tt - st, F[4] || {}); break;
    case 'doc': { const [, at, x, y, w0, h0, title] = F; const p = M.pop2(gt, at); if (!p) break; g.save(); g.translate(x, y); g.rotate(F[7] ?? -0.03); g.scale(p.k, p.k); blob(g, 8, h0 / 2 + 14, w0 * 0.55, 26, 0.3); bx(g, -w0 / 2, -h0 / 2, w0, h0, '#f4efe2', 6, 5); htxt(g, title, 0, -h0 / 2 + 54, F[8] ?? 46, '#2a2a33'); for (let k = 0; k < 5; k++) ln(g, [[-w0 / 2 + 30, -h0 / 2 + 110 + k * 36], [w0 / 2 - 30 - (k % 2) * 60, -h0 / 2 + 110 + k * 36]], 3, 'rgba(60,60,80,.45)'); g.restore(); break; }
    case 'qm': { const [, at, x, y, s0] = F; const p = M.pop2(gt, at); if (!p) break; g.save(); g.translate(x, y + Math.sin(gt * 3) * 6); g.scale(p.k * (s0 ?? 1), p.k * (s0 ?? 1)); htxt(g, '?', 0, 0, 200, '#ffd43b'); g.restore(); break; }
    case 'veilk': break;
  }
}
function scene(g, t, gt, st, P) {
  const bo = resolve(P.bo, gt);
  const body = (g) => { drawBg(g, P.bg, P.bgT === 'abs' ? gt : t, gt, bo); (P.under || []).forEach((F) => fxDraw(g, t, gt, st, F)); (P.sticker ? sticker(g, (gg) => (P.figs || []).forEach((f) => actorDraw(gg, t, gt, st, f))) : (P.figs || []).forEach((f) => actorDraw(g, t, gt, st, f))); (P.over || []).forEach((F) => fxDraw(g, t, gt, st, F)); };
  if (P.view) { const [cx, cy, z] = P.view; g.save(); g.translate(960, 540); g.scale(z, z); g.translate(-cx, -cy); body(g); g.restore(); } else body(g);
  if (P.old) B.oldPhoto(g, t);
}
function drawV2(g, t, i) {
  const st = i.shot.start, gt = st + t;
  scene(g, t, gt, st, i);
  (i.panels || []).forEach((P) => M.panel(g, gt, { ...P, draw: (gg, lt, gtt) => scene(gg, gtt - st, gtt, st, P) }));
  (i.fx || []).forEach((F) => fxDraw(g, t, gt, st, F));
  if (i.grain) grain(g, gt, i.grain);
  if (i.vig !== 0) vignette(g, i.vig ?? 0.32);
}
for (const s of E.shots || []) if ((s.params || {}).k === 'v2') registerShot(s.id, { draw: (g, t, info) => drawV2(g, t, info) });
