// templates/diagrams.js — navy blueprint explanations: two sensors, the sun glint, the chain of people with locks,
// the briefcase, smoke into the stratosphere, cutaways (hotel over a bunker, the mountain on springs), Hiroshima's
// 2-km circle with surviving trees, four safety lamps, the treaty ribbon, bunkers & flying command posts.
import { E, V, S, mood, layer, ease, prog, clamp, lerp, seg, circle, ring, rr, glow, alpha, shade, mix, text, FONTS, linGrad, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { POSES } from '/engine/rig2d.js';
import { tpl } from './_registry.js';
import { cue, showAt, popAt, camMove, label, plate, source, icon, oleander } from '../lib.js';
import { jet } from '../sets/bomber.js';
import { COL } from '../cast.js';

const camOf = (info, t, def = {}) => camMove(t, info.dur, { ...def, ...(info.cam || {}) });
const BP = () => S().ui.blueprint, GOLD = () => S().ui.gold;
const T = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? V(32, 34), color: o.color ?? '#e8f0ff', font: FONTS.ui, weight: 900, spacing: o.spacing ?? 3, align: o.align ?? 'center', alpha: o.a ?? 1, glow: 10, glowColor: alpha(o.color ?? BP(), 0.4) });
function bp(g, t, cam) { layer(g, cam, 0.5, (g) => UI.blueprint(g)); FX.dust(g, t, { count: 30, color: '#bfe0ff', a: 0.12 }); }
const K = (info, t, n, f, d = 0.6) => ease.out(prog(t, cue(info, n, f), cue(info, n, f) + d));

tpl('twoSensors', 'Rule of two sensors: satellite ✓, radar ✓ → the alarm lamp lights only when both are green. params: mode (both|satOnly — 1983: satellite says launch, radars silent), cues sat, radar, lamp', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); bp(g, t, cam); const sat = K(info, t, 'sat', 0.15), rad = K(info, t, 'radar', 0.4), only = info.mode === 'satOnly', red = S().ui.accent;
    layer(g, cam, 1, (g) => { const y = E.H * 0.42, xs = E.W * V(0.25, 0.3), xr = E.W * V(0.5, 0.7), xl = E.W * V(0.78, 0.5), yl = V(y, E.H * 0.75);
      icon(g, 'satellite', xs, y - 60, 1.6, BP()); icon(g, 'radar', xr, y - 60, 1.6, BP()); T(g, 'СПУТНИК', xs, y + 60); T(g, only ? 'РАДАР' : 'РАДАР', xr, y + 60);
      const ok = (x, k, good) => { if (k <= 0) return; circle(g, x, y + 150, 46 * k, good ? '#3fb950' : '#2a3048'); icon(g, good ? 'check' : 'cross', x, y + 150, k, good ? '#eaffea' : alpha('#e8f0ff', 0.5)); };
      ok(xs, sat, true); ok(xr, rad, !only);
      const lamp = only ? 0 : K(info, t, 'lamp', 0.65); seg(g, [[xs, y + 210], [xs, y + 260], [xl, y + 260], [xl, yl - 70]], 3, alpha(BP(), 0.5)); seg(g, [[xr, y + 210], [xr, y + 260]], 3, alpha(BP(), 0.5));
      circle(g, xl, yl, 60, lamp > 0 ? mix('#3a1010', red, lamp) : '#1a2036'); ring(g, xl, yl, 60, 4, alpha(BP(), 0.7)); if (lamp > 0) glow(g, xl, yl, 220, red, 0.5 * lamp);
      T(g, only ? 'ТРЕВОГИ НЕТ' : 'ТРЕВОГА', xl, yl + 100, { color: only ? '#7fe8c8' : red, a: only ? K(info, t, 'lamp', 0.65) : lamp }); });
  } });
tpl('sunGlint', 'Blueprint 1983: the Sun → high clouds → a glint → the satellite on orbit mistakes it for an engine flare. params: cues sun, glint, sat', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 }); bp(g, t, cam);
    layer(g, cam, 1, (g) => { const earthY = E.H * 1.6, R = E.H * 0.95; g.strokeStyle = BP(); g.lineWidth = 4; g.beginPath(); g.arc(E.W / 2, earthY, R, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      const sx = E.W * 0.12, sy = E.H * 0.2, ks = K(info, t, 'sun', 0.05); glow(g, sx, sy, 140 * ks, GOLD(), 0.6); ring(g, sx, sy, 50 * ks, 4, GOLD()); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; seg(g, [[sx + Math.cos(a) * 64, sy + Math.sin(a) * 64], [sx + Math.cos(a) * 90 * ks, sy + Math.sin(a) * 90 * ks]], 4, GOLD()); }
      T(g, 'СОЛНЦЕ', sx, sy + 130, { a: ks });
      const cx = E.W * 0.52, cy = E.H * 0.66; for (let i = 0; i < 5; i++) { g.strokeStyle = BP(); g.lineWidth = 3; g.beginPath(); g.ellipse(cx - 160 + i * 80, cy, 70, 24, 0, Math.PI, Math.PI * 2); g.stroke(); } T(g, 'ВЫСОКИЕ ОБЛАКА', cx, cy + 60);
      const kg = K(info, t, 'glint', 0.35, 1); const gx = lerp(sx, cx, kg), gy = lerp(sy, cy - 20, kg); if (kg > 0) { g.setLineDash([12, 10]); seg(g, [[sx, sy], [gx, gy]], 3, GOLD()); g.setLineDash([]); }
      const k2 = K(info, t, 'glint2', 0.55, 1), satX = E.W * 0.82, satY = E.H * 0.2; if (k2 > 0) { g.setLineDash([12, 10]); seg(g, [[cx, cy - 20], [lerp(cx, satX, k2), lerp(cy - 20, satY + 40, k2)]], 3, GOLD()); g.setLineDash([]); FX.sparkle(g, cx, cy - 20, 40, '#fff', 0.9 * (0.6 + 0.4 * Math.sin(t * 9))); T(g, 'БЛИК', cx + 90, cy - 70, { color: GOLD() }); }
      icon(g, 'satellite', satX, satY, 1.4, BP()); T(g, 'СПУТНИК', satX, satY + 70); if (k2 > 0.95) { const a = showAt(t, cue(info, 'sat', 0.75), info.dur); T(g, '«ПУСК?»', satX, satY - 80, { color: S().ui.accent, a, size: V(40, 40) }); } });
  } });
tpl('chain', 'Chain of command: a row of line-art people, each with a padlock; the order passes along (a light dot travels) and every lock clicks shut/opens in turn. params: n (5), mode (pass|check — final: each person "re-checks", ticks appear), caption', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftL', z: 1, amt: 0.6 }); bp(g, t, cam); const n = info.n ?? 5, check = info.mode === 'check';
    layer(g, cam, 1, (g) => { const x0 = E.W * 0.12, w = E.W * 0.76, y = E.H * 0.5, step = w / (n - 1), p = clamp((t - 0.3) / (info.dur * 0.75)) * (n - 1);
      seg(g, [[x0, y + 70], [x0 + w, y + 70]], 3, alpha(BP(), 0.5)); const dx = x0 + p * step; glow(g, dx, y + 70, 50, GOLD(), 0.8); circle(g, dx, y + 70, 9, GOLD());
      for (let i = 0; i < n; i++) { const x = x0 + i * step, on = p >= i - 0.05; UI.lineFigure(g, { x, y: y + 50, s: 1.0, pose: POSES.stand, color: on ? '#e8f0ff' : alpha('#e8f0ff', 0.5) });
        icon(g, 'lock', x + 70, y - 80, 1.0, on ? GOLD() : alpha(BP(), 0.6)); if (check && on) icon(g, 'check', x, y - 260, 0.9 * popAt(t, 0.3 + (i / (n - 1)) * info.dur * 0.75), '#3fb950'); }
      if (info.caption) T(g, info.caption, E.W / 2, E.H * 0.82, { size: V(40, 40), color: GOLD(), a: showAt(t, cue(info, 'caption', 0.5), info.dur) }); });
  } });
tpl('briefcase', 'The "nuclear briefcase" is not a button: it opens (cue "open") — inside a phone, a folder of options, a card to prove identity; labels pop at cues phone, folder, card', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 }); bp(g, t, cam); const op = K(info, t, 'open', 0.15, 0.8);
    layer(g, cam, 1, (g) => { const cx = E.W / 2, cy = E.H * 0.58, w = V(760, 640), h = V(380, 330);
      g.strokeStyle = BP(); g.lineWidth = 5; rr(g, cx - w / 2, cy, w, h, 22); g.stroke(); rr(g, cx - 70, cy - 40, 140, 40, 14); g.stroke();
      const lh = h * Math.cos(op * Math.PI * 0.5) * 0.98 + h * 0.02; rr(g, cx - w / 2, cy - lh, w, lh, 22); g.fillStyle = alpha(S().ui.bpBg, 0.9); g.fill(); g.stroke(); if (op > 0.6) { seg(g, [[cx - w / 2, cy], [cx - w / 2 - 30, cy - h * 0.8 * op], [cx + w / 2 - 30, cy - h * 0.8 * op], [cx + w / 2, cy]], 4, alpha(BP(), 0.6)); }
      if (op > 0.5) { const items = [['phone', 'ТЕЛЕФОН', -w * 0.33], ['tv', 'ПАПКА', 0], ['lock', 'ПРОВЕРКА ЛИЧНОСТИ', w * 0.33]];
        items.forEach(([ic, lb, dx], i) => { const a = popAt(t, cue(info, ['phone', 'folder', 'card'][i], 0.35 + i * 0.18)); if (a <= 0) return; icon(g, ic === 'tv' ? 'screen' : ic, cx + dx, cy + h * 0.42, 1.2 * a, GOLD()); T(g, lb, cx + dx, cy + h + V(50, 50), { size: V(30, 24), a, color: GOLD() }); }); }
      const nb = showAt(t, cue(info, 'nobutton', 0.05), info.dur * 0.35); if (nb > 0) { T(g, '«КРАСНОЙ КНОПКИ» НЕТ', cx, E.H * 0.18, { size: V(46, 40), color: S().ui.accent, a: nb }); } });
  } });
tpl('smokeDiagram', 'Smoke rises above the clouds into the stratosphere (no rain there) and spreads as a thin dark film around the planet. params: cues rise, spread; labels', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'pull', z: 1, amt: 0.6 }); bp(g, t, cam); const kr = K(info, t, 'rise', 0.1, 2), ks = K(info, t, 'spread', 0.5, 2);
    layer(g, cam, 1, (g) => { const gy = E.H * 0.82, cy = E.H * 0.55, sy = E.H * 0.25;
      seg(g, [[-E.W, gy], [E.W * 2, gy]], 4, BP()); for (let i = 0; i < 9; i++) { g.strokeStyle = alpha(BP(), 0.6); g.lineWidth = 2; g.strokeRect(E.W * 0.3 + i * 60, gy - 40 - (i % 3) * 30, 44, 40 + (i % 3) * 30); }
      g.setLineDash([10, 12]); seg(g, [[-E.W, cy], [E.W * 2, cy]], 2, alpha(BP(), 0.5)); seg(g, [[-E.W, sy + 90], [E.W * 2, sy + 90]], 2, alpha(BP(), 0.5)); g.setLineDash([]);
      T(g, 'ОБЛАКА · ДОЖДЬ', E.W * 0.86, cy - 30, { size: V(24, 22) }); T(g, 'СТРАТОСФЕРА · ДОЖДЯ НЕТ', E.W * 0.82, sy + 60, { size: V(24, 22), color: GOLD() });
      for (let i = 0; i < 4; i++) { g.strokeStyle = alpha(BP(), 0.7); g.lineWidth = 3; g.beginPath(); g.ellipse(E.W * 0.1 + i * 160, cy + 20, 60, 20, 0, Math.PI, Math.PI * 2); g.stroke(); }
      const top = lerp(gy - 60, sy + 40, kr), x = E.W * 0.45; for (let i = 0; i < 18; i++) { const u = i / 17, yy = lerp(gy - 60, top, u), wob = Math.sin(t * 1.2 + i) * 14; circle(g, x + wob + (u > 0.85 ? (u - 0.85) * 600 * ks : 0), yy, 30 + u * 30, alpha('#6a6470', 0.9)); }
      if (ks > 0) { g.fillStyle = alpha('#6a6470', 0.85); g.fillRect(x - E.W * 0.6 * ks, sy + 10, E.W * 1.2 * ks, 50); T(g, 'ТОНКАЯ «ШТОРА» САЖИ', E.W / 2, sy - 30, { size: V(32, 30), color: '#e8f0ff', a: ks }); } });
  } });
tpl('cutaway', 'Cross-section diagrams. params: kind: "hotel" (Greenbrier: a grand hotel on a hill, a bunker underneath; cue "bunker" reveals it; tag «ГРИНБРАЙЕР, 1958–1961») | "mountain" (Cheyenne: granite mountain, buildings on giant springs, 25-ton doors; cues springs, doors)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); bp(g, t, cam); const kind = info.kind || 'hotel';
    layer(g, cam, 1, (g) => { const gy = E.H * 0.45; g.strokeStyle = BP(); g.lineWidth = 4;
      if (kind === 'hotel') { g.beginPath(); g.moveTo(-E.W, gy + 60); g.quadraticCurveTo(E.W / 2, gy - 120, E.W * 2, gy + 60); g.stroke();
        const hx = E.W / 2, hy = gy - 40; g.strokeRect(hx - 320, hy - 180, 640, 180); for (let i = 0; i < 8; i++) g.strokeRect(hx - 290 + i * 74, hy - 150, 40, 56); for (let i = 0; i < 6; i++) seg(g, [[hx - 200 + i * 80, hy], [hx - 200 + i * 80, hy - 80]], 6, BP());
        g.beginPath(); g.moveTo(hx - 340, hy - 180); g.lineTo(hx, hy - 260); g.lineTo(hx + 340, hy - 180); g.stroke(); T(g, 'ОТЕЛЬ', hx, hy - 210, { color: GOLD() });
        const kb = K(info, t, 'bunker', 0.35, 1); if (kb > 0) { g.save(); g.globalAlpha *= kb; g.fillStyle = alpha(S().ui.accent, 0.12); g.fillRect(hx - 380, gy + 120, 760, 230); g.strokeStyle = S().ui.accent; g.strokeRect(hx - 380, gy + 120, 760, 230);
          for (let i = 0; i < 4; i++) g.strokeRect(hx - 350 + i * 180, gy + 150, 150, 80); seg(g, [[hx + 300, hy], [hx + 300, gy + 120]], 4, S().ui.accent); T(g, 'БУНКЕР', hx, gy + 300, { color: S().ui.accent }); g.restore(); }
        plate(g, info.tagStr || 'ГРИНБРАЙЕР, 1958–1961', showAt(t, 0.5, info.dur)); }
      else { g.beginPath(); g.moveTo(-E.W, E.H * 0.9); g.lineTo(E.W * 0.2, E.H * 0.35); g.lineTo(E.W * 0.45, E.H * 0.12); g.lineTo(E.W * 0.7, E.H * 0.3); g.lineTo(E.W * 2, E.H * 0.9); g.stroke(); T(g, 'ГРАНИТ', E.W * 0.45, E.H * 0.22, { color: GOLD() });
        const cx = E.W * 0.5, cy = E.H * 0.66; g.strokeRect(cx - 260, cy - 120, 520, 160); for (let i = 0; i < 3; i++) g.strokeRect(cx - 230 + i * 170, cy - 100, 130, 120);
        const ks = K(info, t, 'springs', 0.3); for (let i = 0; i < 7; i++) { const sx = cx - 240 + i * 80, b = Math.sin(t * 3 + i) * 3; g.beginPath(); for (let k = 0; k <= 12; k++) g.lineTo(sx + (k % 2 ? 14 : -14), cy + 40 + k * 6 + b); g.strokeStyle = alpha(GOLD(), ks); g.stroke(); }
        T(g, 'ПРУЖИНЫ', cx + 360, cy + 70, { color: GOLD(), a: ks, align: 'left' });
        const kd = K(info, t, 'doors', 0.6); g.strokeStyle = alpha(S().ui.accent, kd); g.lineWidth = 10; seg(g, [[E.W * 0.25, cy - 20], [E.W * 0.25, cy + 60]], 14, alpha(S().ui.accent, kd)); T(g, 'ДВЕРИ ПО 25 ТОНН', E.W * 0.25, cy - 70, { color: S().ui.accent, a: kd });
        seg(g, [[-E.W, cy + 40], [E.W * 0.25, cy + 40]], 3, alpha(BP(), 0.6)); plate(g, info.tagStr || 'ШАЙЕНН-МАУНТИН, КОЛОРАДО', showAt(t, 0.4, info.dur)); } });
  } });
tpl('hiroshimaMap', 'Schematic city map (rivers, grid) with a 2-km circle (cue "circle") and ~170 green tree dots appearing (cue "trees"); optional «≈ 1 200 000» today (cue "people"). params: trees (170), people (str)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 }); bp(g, t, cam);
    layer(g, cam, 1, (g) => { const cx = E.W * V(0.42, 0.5), cy = E.H * 0.5, R = V(330, 320);
      g.strokeStyle = alpha(BP(), 0.35); g.lineWidth = 2; for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(cx + i * 60, cy - 520); g.lineTo(cx + i * 60, cy + 520); g.stroke(); g.beginPath(); g.moveTo(cx - 800, cy + i * 60); g.lineTo(cx + 800, cy + i * 60); g.stroke(); }
      for (let r2 = 0; r2 < 4; r2++) { g.strokeStyle = alpha('#5a9aff', 0.7); g.lineWidth = 14; g.beginPath(); g.moveTo(cx - 200 + r2 * 140, cy - 600); g.bezierCurveTo(cx - 120 + r2 * 120, cy - 100, cx - 260 + r2 * 160, cy + 100, cx - 160 + r2 * 150, cy + 600); g.stroke(); }
      const kc = K(info, t, 'circle', 0.1, 1); g.strokeStyle = GOLD(); g.lineWidth = 5; g.setLineDash([16, 10]); g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * kc); g.stroke(); g.setLineDash([]);
      if (kc > 0.9) { seg(g, [[cx, cy], [cx + R, cy]], 3, GOLD()); T(g, '2 КМ', cx + R / 2, cy - 30, { color: GOLD() }); }
      const kt = K(info, t, 'trees', 0.35, 2), r = rng(17), n = info.trees ?? 170; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.97; if (i / n > kt) break; circle(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 6, '#5ad07a'); }
      if (kt > 0.5) T(g, `≈ ${n} ДЕРЕВЬЕВ`, cx + R + V(60, 0), cy + V(-120, R + 80), { color: '#7fe89a', align: V('left', 'center'), size: V(40, 36), a: kt });
      if (info.people) { const a = showAt(t, cue(info, 'people', 0.7), info.dur); T(g, info.people, E.W * 0.8, E.H * 0.7, { size: V(60, 50), color: GOLD(), a }); T(g, 'ЖИТЕЛЕЙ СЕГОДНЯ', E.W * 0.8, E.H * 0.7 + 60, { size: V(26, 24), a }); } });
    plate(g, info.tagStr || 'ХИРОСИМА', showAt(t, 0.2, info.dur));
  } });
tpl('lamps', 'Four safety stages of the 1961 bomb as lamps: three go dark one by one (cues off1..off3), the last stays lit (the simple switch). params: labels', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 }); bp(g, t, cam);
    layer(g, cam, 1, (g) => { for (let i = 0; i < 4; i++) { const x = E.W * (0.2 + i * 0.2), y = E.H * 0.48, off = i < 3 ? K(info, t, 'off' + (i + 1), 0.2 + i * 0.18, 0.3) : 0, c = mix('#3fb950', '#20263a', off);
      circle(g, x, y, 70, c); ring(g, x, y, 70, 4, alpha(BP(), 0.8)); if (off < 1) glow(g, x, y, 220, '#3fb950', 0.4 * (1 - off)); T(g, `СТУПЕНЬ ${i + 1}`, x, y + 130, { size: V(28, 24) });
      if (i === 3) { icon(g, 'switch', x, y + 230, 1, GOLD()); T(g, 'ПЕРЕКЛЮЧАТЕЛЬ', x, y + 300, { size: V(24, 20), color: GOLD(), a: showAt(t, cue(info, 'switch', 0.8), info.dur) }); } } });
  } });
tpl('treaties', 'Treaty ribbon 1963 · 1968 · 1987 · 1993 … (cues y1..yN), optionally snapping at 2026 (snap:true, cue "snap"). params: years [{y:"1963", l:"ГОРЯЧАЯ ЛИНИЯ"}…], snap, bulb (house bulb «МЕГАТОННЫ В МЕГАВАТТЫ» at cue "bulb")', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'driftL', z: 1, amt: 0.6 }); bp(g, t, cam); const ys = info.years || [{ y: '1963', l: 'ГОРЯЧАЯ ЛИНИЯ' }, { y: '1968', l: 'НЕРАСПРОСТРАНЕНИЕ' }, { y: '1987', l: 'СОКРАЩЕНИЕ' }, { y: '1993', l: 'МЕГАТОННЫ В МЕГАВАТТЫ' }];
    layer(g, cam, 1, (g) => { const x0 = E.W * 0.1, w = E.W * 0.8, y = E.H * 0.5, n = ys.length + (info.snap ? 1 : 0), step = w / Math.max(1, n - 1), ks = info.snap ? K(info, t, 'snap', 0.75, 0.4) : 0;
      seg(g, [[x0, y], [x0 + w - (info.snap ? step * 0.5 : 0), y]], 8, GOLD()); if (info.snap) { const sx = x0 + w - step * 0.5; seg(g, [[sx, y], [sx + step * 0.25 + ks * 30, y + ks * 60]], 8, alpha(GOLD(), 1 - ks * 0.3)); seg(g, [[x0 + w, y + ks * 90], [x0 + w - step * 0.2, y + ks * 40]], 8, alpha(S().ui.accent, ks)); T(g, '2026', x0 + w, y - 60, { color: S().ui.accent, a: ks, size: V(42, 38) }); }
      ys.forEach((it, i) => { const a = popAt(t, cue(info, 'y' + (i + 1), 0.08 + i * 0.16)), x = x0 + i * step; if (a <= 0) return; circle(g, x, y, 16 * a, GOLD()); T(g, it.y, x, y - 60, { size: V(46, 40), color: GOLD(), a }); T(g, it.l, x, y + 60 + (i % 2) * 40, { size: V(22, 20), a }); });
      if (info.bulb) { const a = popAt(t, cue(info, 'bulb', 0.7)); if (a > 0) { icon(g, 'bulb', E.W * 0.82, E.H * 0.2, 1.6 * a, GOLD()); glow(g, E.W * 0.82, E.H * 0.19, 160, GOLD(), 0.5 * a); } } });
  } });
tpl('bunkersWorld', 'Silhouettes of unnamed bunkers (cutaway domes) and flying command posts on several continents — no names, no flags. params: n (5)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); bp(g, t, cam);
    layer(g, cam, 1, (g) => { const n = info.n ?? 5; for (let i = 0; i < n; i++) { const x = E.W * (0.12 + i * (0.76 / (n - 1))), y = E.H * (0.62 + (i % 2) * 0.08), a = popAt(t, 0.15 + i * 0.25);
      if (a <= 0) continue; g.save(); g.translate(x, y); g.scale(a, a); seg(g, [[-140, 0], [140, 0]], 3, alpha(BP(), 0.7)); g.strokeStyle = BP(); g.lineWidth = 4; g.beginPath(); g.arc(0, 30, 90, Math.PI, Math.PI * 2); g.stroke(); g.strokeRect(-60, 30, 120, 70); seg(g, [[0, -60], [0, -120]], 3, BP()); g.restore();
      if (i % 2 === 0) jet(g, x + 40, y - E.H * 0.3 + Math.sin(t + i) * 10, 0.16 * a, { color: alpha(BP(), 0.7), rim: alpha(BP(), 0.1) }); } });
  } });
tpl('cableVsHose', 'Close-up comparison: cross-section of a deep-sea cable next to a garden hose, both ~2–3 cm; labels. params: none', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.7 }); bp(g, t, cam);
    layer(g, cam, 1, (g) => { const y = E.H * 0.5, a = popAt(t, 0.15), b = popAt(t, cue(info, 'hose', 0.45));
      if (a > 0) { const x = E.W * 0.32; for (const [r, c] of [[90, '#0b0c10'], [70, '#3a3e52'], [52, '#c9a85a'], [30, '#1a2036'], [12, '#9fe8ff']]) circle(g, x, y, r * a, c); glow(g, x, y, 40, '#9fe8ff', 0.6 * a); T(g, 'КАБЕЛЬ НА ГЛУБИНЕ', x, y + 160, { a, color: GOLD() }); }
      if (b > 0) { const x = E.W * 0.68; circle(g, x, y, 90 * b, '#3f8a4a'); circle(g, x, y, 62 * b, '#0a1410'); T(g, 'САДОВЫЙ ШЛАНГ', x, y + 160, { a: b, color: '#7fe89a' }); }
      if (a > 0 && b > 0) T(g, '≈', E.W / 2, y, { size: V(90, 80), a: b }); });
  } });
