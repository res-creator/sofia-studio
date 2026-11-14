// templates/graphics.js — data & navigation graphics: chapter titles, hours strip, counters, globe, world maps,
// Doomsday clock, timers, calendars, bars, thermometer, UV scale, slider, recovery curves, quotes, "N из 7", seven icons.
// All on-screen text is Russian and comes from params (so wording can follow the final narration).
import { E, V, S, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, glow, alpha, shade, mix, text, FONTS, linGrad, radGrad, rng, measure } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { tpl } from './_registry.js';
import { cue, showAt, popAt, camMove, label, plate, source, bigNum, fmtNum, hoursStrip, HOURS, worldMap, marker, arcLine, icon, SEVEN, SEVEN_LABEL, globe, PLACES } from '../lib.js';
import { COL } from '../cast.js';
import { space } from '../sets/space.js';

const camOf = (info, t, def = {}) => camMove(t, info.dur, { ...def, ...(info.cam || {}) });
// dark "data" backdrop: navy gradient, faint grid, slow dust
export function voidBg(g, t, cam, o = {}) {
  layer(g, cam, 0.3, (g) => { const M = mood('void'); g.fillStyle = radGrad(g, E.W / 2, E.H * 0.45, 50, E.W * 0.9, [shade(M.sky[1], 0.15), M.sky[0], '#03050b']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    if (o.grid !== false) { g.strokeStyle = alpha(S().ui.blueprint, 0.05); g.lineWidth = 1; for (let x = -E.W; x < E.W * 2; x += 80) { g.beginPath(); g.moveTo(x, -E.H); g.lineTo(x, E.H * 2); g.stroke(); } for (let y = -E.H; y < E.H * 2; y += 80) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); } } });
  FX.dust(g, t, { count: 40, color: '#bcd0ff', a: 0.15 });
}
const T = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? V(40, 44), color: o.color ?? S().ui.cream, font: o.serif ? FONTS.serif : FONTS.ui, weight: 900, spacing: o.spacing ?? 3, align: o.align ?? 'center', alpha: o.a ?? 1, glow: o.glow ?? 12, glowColor: o.glowColor ?? 'rgba(0,0,0,.6)', italic: o.italic });

// ---------------------------------------------------------------- titles & navigation
tpl('chapterTitle', 'Chapter title card over a blurred set. params: str (e.g. «ПЕРВЫЙ ЧАС»), sub (small line above), hours index (show the strip with this chapter lit: 0..4), bg (space|field|control|none)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 });
    if (info.bg && info.bg !== 'none') { blurLayer(g, 10, (g) => { if (info.bg === 'space') space(g, t, { z: 1 }, { R: V(520, 480), cy: E.H * 0.9, sats: 6 }); else voidBg(g, t, { z: 1 }); }); veil(g, '#04060c', 0.45); } else voidBg(g, t, cam);
    UI.titleCard(g, t, { lines: info.sub ? [info.sub, info.str || 'ГЛАВА'] : [info.str || 'ГЛАВА'], dur: info.dur });
    if (info.hours != null) hoursStrip(g, t, info.hours, { a: showAt(t, 0.3, info.dur), y: E.H * V(0.8, 0.75) });
  } });
tpl('hoursStrip', 'The navigator strip «1 ЧАС · СУТКИ · МЕСЯЦ · ГОД · 10 ЛЕТ». params: from, to (index; the marker travels between them over the shot or at cue "go"), labels (override), bg (space|void)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 });
    if (info.bg === 'space') { space(g, t, cam, { R: V(560, 500), cy: E.H * 1.05, lights: 0.9 }); veil(g, '#04060c', 0.35); } else voidBg(g, t, cam);
    const go = cue(info, 'go', 0.2), k = ease.inOut(prog(t, go, Math.min(info.dur - 0.3, go + 1.6)));
    hoursStrip(g, t, lerp(info.from ?? 0, info.to ?? info.from ?? 0, k), { y: E.H * 0.5, w: V(1500, 960), labels: info.labels || HOURS, a: showAt(t, 0, info.dur, 0.3) });
  } });
tpl('caseCard', 'Big «N ИЗ 7» card opening each close call + the case icon and a small place/date line. params: n (1..7), where (e.g. «СЕВЕРНАЯ КАРОЛИНА · 1961»)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 }); voidBg(g, t, cam); const n = info.n ?? 1, ui = S().ui, k = popAt(t, 0.05);
    layer(g, cam, 1, (g) => { g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(k, k); T(g, `${n} ИЗ 7`, 0, 0, { size: V(170, 150), color: ui.gold, glow: 40, glowColor: alpha(ui.gold, 0.6), spacing: 8 }); g.restore();
      icon(g, SEVEN[n - 1], E.W / 2, E.H * 0.64, 1.3 * showAt(t, 0.3, info.dur), alpha('#e8f0ff', 0.9));
      T(g, info.where || SEVEN_LABEL[n - 1], E.W / 2, E.H * 0.79, { size: V(40, 40), a: showAt(t, 0.5, info.dur) });
      for (let i = 0; i < 7; i++) circle(g, E.W / 2 - 150 + i * 50, E.H * 0.88, i === n - 1 ? 11 : 7, i < n ? ui.gold : '#2a2e44'); });
  } });
tpl('sevenRow', 'Seven silhouettes/icons in a row (the close calls). params: state: "dim" (all dark) | "light" (light up one by one at cues l1..l7 or evenly) | "first" (only #1 glows — the switch) | "out" (all lit, then go out one by one, a glow remains) | "numbers" (cards 1–7 for the final question), labels (bool)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); voidBg(g, t, cam); const st = info.state || 'light', ui = S().ui;
    layer(g, cam, 1, (g) => { const w = E.W * V(0.84, 0.9), x0 = (E.W - w) / 2, y = E.H * (st === 'numbers' ? 0.46 : 0.5), step = w / 6;
      for (let i = 0; i < 7; i++) { const x = x0 + i * step; let a = 0.25;
        if (st === 'light') a = 0.25 + 0.75 * ease.out(prog(t, cue(info, 'l' + (i + 1), 0.1 + i * 0.11), cue(info, 'l' + (i + 1), 0.1 + i * 0.11) + 0.4));
        if (st === 'first') a = i === 0 ? 0.3 + 0.7 * ease.out(prog(t, 0.2, 1)) : 0.2;
        if (st === 'out') a = 1 - 0.75 * ease.out(prog(t, 0.15 * info.dur + i * info.dur * 0.1, 0.15 * info.dur + i * info.dur * 0.1 + 0.4));
        if (st === 'numbers') a = 1;
        const col = mix('#2a2e44', i === 0 ? '#ffe6a8' : '#e8f0ff', clamp(a)); if (a > 0.5) glow(g, x, y, 120, i === 0 ? ui.gold : '#9fc8ff', 0.25 * a);
        if (st === 'numbers') { rr(g, x - step * 0.42, y - V(180, 160), step * 0.84, V(360, 320), 18); g.fillStyle = 'rgba(14,20,36,.9)'; g.fill(); g.strokeStyle = alpha(ui.gold, 0.5); g.lineWidth = 2; g.stroke();
          T(g, String(i + 1), x, y - V(100, 90), { size: V(80, 70), color: ui.gold, glow: 20, glowColor: alpha(ui.gold, 0.5) }); }
        icon(g, SEVEN[i], x, y + (st === 'numbers' ? V(30, 20) : 0), V(1.1, 0.8), col);
        if (info.labels || st === 'numbers') T(g, SEVEN_LABEL[i], x, y + V(st === 'numbers' ? 130 : 120, 110), { size: V(22, 20), spacing: 1, a: clamp(a + 0.2) }); }
      if (st === 'out') glow(g, E.W / 2, y, E.W * 0.5, '#ffe6a8', 0.12 * ease.out(prog(t, info.dur * 0.8, info.dur))); });
    if (info.question) T(g, info.question, E.W / 2, E.H * 0.82, { size: V(54, 46), serif: true, italic: true, color: ui.cream, a: showAt(t, cue(info, 'question', 0.3), info.dur), spacing: 1 });
  } });

// ---------------------------------------------------------------- numbers
tpl('bigCounter', 'Big animated number. params: from, to (number), at cue "count" (start) … cue "countEnd", unit (e.g. «БОЕГОЛОВОК»), prefix («≈»), year labels {from:"1986", to:"2026"}, source («SIPRI, январь 2026»), bg (void|globe), side bar {label, from, to} (small «военные запасы» bar that grows)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 }), ui = S().ui;
    if (info.bg === 'globe') { space(g, t, cam, { R: V(360, 340), cx: E.W * V(0.26, 0.5), cy: E.H * V(0.55, 0.32), lights: 0.9, night: 0.75 }); } else voidBg(g, t, cam);
    const c0 = cue(info, 'count', 0.15), c1 = cue(info, 'countEnd', 0.7), k = ease.inOut(prog(t, c0, c1)), v = lerp(info.from ?? 0, info.to ?? 0, k), x = E.W * (info.bg === 'globe' ? V(0.66, 0.5) : 0.5);
    layer(g, cam, 1, (g) => { const a = showAt(t, 0.05, info.dur, 0.3);
      bigNum(g, (info.prefix || '') + fmtNum(v), x, E.H * V(0.46, 0.62), { a, s: 0.9 + 0.1 * popAt(t, 0.05), sub: info.unit, size: V(170, 140) });
      if (info.years) { T(g, k < 0.5 ? info.years.from : info.years.to, x, E.H * V(0.28, 0.5), { size: V(48, 44), color: alpha(ui.cream, 0.8), a }); }
      if (info.side) { const sk = ease.out(prog(t, cue(info, 'side', 0.6), cue(info, 'side', 0.6) + 1)), bx = E.W * 0.84, by = E.H * 0.7, h = V(260, 220);
        T(g, info.side.label || 'ВОЕННЫЕ ЗАПАСЫ', bx, by + 40, { size: V(22, 22), a: sk }); rr(g, bx - 30, by - h * lerp(info.side.from ?? 0.6, info.side.to ?? 0.7, sk), 60, h * lerp(info.side.from ?? 0.6, info.side.to ?? 0.7, sk), 6); g.fillStyle = alpha(ui.accent, 0.85 * sk); g.fill(); } });
    source(g, info.source, showAt(t, 0.6, info.dur));
  } });
tpl('statCard', 'One or two short facts as big numbers with labels (e.g. «> 99 %» «ДАННЫХ ПО ДНУ»; «≈ 600» «СИСТЕМ»). params: items [{v:"> 99 %", l:"…", cue}] (1–3), source, bg (void|space)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 }); if (info.bg === 'space') { space(g, t, cam, { R: V(700, 600), cy: E.H * 1.25, cables: 1, lights: 0.8 }); veil(g, '#04060c', 0.3); } else voidBg(g, t, cam);
    const it = info.items || [{ v: '12 000', l: 'ПОДПИСЬ' }], n = it.length;
    layer(g, cam, 1, (g) => it.forEach((o, i) => { const a = popAt(t, cue(info, o.cue || 'i' + (i + 1), 0.1 + i * 0.3)), x = E.W * (n === 1 ? 0.5 : V(0.2 + (0.6 * i) / (n - 1), 0.5)), y = E.H * (n === 1 ? 0.45 : V(0.45, 0.25 + i * 0.25));
      if (a <= 0) return; bigNum(g, o.v, x, y, { s: a, size: V(n > 2 ? 110 : 140, 110), sub: o.l, color: o.red ? S().ui.accent : S().ui.gold }); }));
    source(g, info.source, showAt(t, 0.6, info.dur));
  } });

// ---------------------------------------------------------------- globe / maps
tpl('globeShot', 'Earth from space (sets/space). params: lon0, lat0, spin, R, lights 0..1, night, hl {is,au,nz,…:1} (or cue "hl"), sats n, satsDead 0..1 (or cue "dead"), belt (cue "belt"), cables (draw over the shot or cue "cables"), smoke 0..1 | "cue", cold 0..1 | "cue", icons (["nav","cloud","clock"] badges on satellites at cue "icons"), tag, source, timer ("00:00"…)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }), k = (n, f) => ease.inOut(prog(t, cue(info, n, f), cue(info, n, f) + 1.5));
    const hl = info.hl ? Object.fromEntries(Object.entries(info.hl).map(([kk, v]) => [kk, v * k('hl', 0.3)])) : {};
    const r = space(g, t, cam, { lon0: info.lon0, lat0: info.lat0, spin: info.spin, R: info.R, cx: info.cx, lights: info.lights, night: info.night, hl, sats: info.sats, satsDead: info.satsDead === 'cue' ? k('dead', 0.5) : info.satsDead, belt: info.belt ? k('belt', 0.3) : 0, cables: info.cables ? (info.cables === 'cue' ? k('cables', 0.2) : clamp(t / (info.dur * 0.8))) : 0, smoke: info.smoke === 'cue' ? k('smoke', 0.3) : info.smoke, cold: info.cold === 'cue' ? k('cold', 0.3) : info.cold, sun: info.sun });
    if (info.icons) { const a = showAt(t, cue(info, 'icons', 0.4), info.dur); info.icons.forEach((nm, i) => { const x = r.cx + (i - (info.icons.length - 1) / 2) * V(260, 200), y = r.cy - r.R - V(40, 60); g.save(); g.globalAlpha *= a; rr(g, x - 62, y - 62, 124, 124, 24); g.fillStyle = 'rgba(14,22,40,.85)'; g.fill(); icon(g, nm, x, y, 1, '#e8f0ff'); g.restore(); }); }
    if (info.timer) T(g, info.timer, E.W - V(200, 540), V(120, 200), { size: V(64, 70), color: S().ui.gold, a: showAt(t, 0.2, info.dur), glowColor: alpha(S().ui.gold, 0.5) });
    if (info.tag) plate(g, info.tag, showAt(t, 0.3, info.dur)); source(g, info.source, showAt(t, 0.6, info.dur));
  } });
// place presets for markers: lon/lat
export const SPOTS = { hormuz: [56.3, 26.6], malacca: [100.5, 3], suez: [32.5, 30.5], bab: [43.4, 12.6], taiwan: [121, 22.5], ncarolina: [-78, 35.4], cuba: [-79, 22], andoya: [16, 69.3], svalbard: [16, 78], hawaii: [-157.8, 21.3], johnston: [-169.5, 16.7], bikini: [165.4, 11.6], rongerik: [167.4, 11.35], kili: [169.1, 5.6], hiroshima: [132.5, 34.4], nagasaki: [129.9, 32.75], madrid: [-3.7, 40.4], moscow: [37.6, 55.75], colorado: [-104.8, 38.7], wvirginia: [-80.3, 37.8], iceland: [-19, 65], australia: [134, -25], nz: [173, -41], solomon: [160, -9.5], vanuatu: [167.5, -16], argentina: [-64, -34], chernobyl: [30.1, 51.4], kuwait: [47.5, 29.3], canada: [-110, 56] };
tpl('mapShot', 'Flat world/regional map. params: view {lon0,lon1,lat0,lat1}, hl {is,au,nz,…} (lit at cue "hl"), marks [{at:"hormuz"|[lon,lat], label, cue, color}], arcs [{from,to,cue,color}], cold 0..1 | "cue" (north turns blue — no strike marks ever), dots (n island dots for the 38-state map), tag, source, caption {str, cue} (big line under the map)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); voidBg(g, t, cam, { grid: false });
    const v = info.view || {}, x = V(80, 40), w = E.W - 2 * x, y = V(110, 400), h = V(800, 900), k = (n, f) => ease.inOut(prog(t, cue(info, n, f), cue(info, n, f) + 1.2));
    layer(g, cam, 1, (g) => {
      const hl = info.hl ? Object.fromEntries(Object.entries(info.hl).map(([kk, vv]) => [kk, vv * k('hl', 0.3)])) : {};
      const P = worldMap(g, x, y, w, h, { ...v, hl, cold: info.cold === 'cue' ? k('cold', 0.3) : info.cold ?? 0 });
      if (info.dots) { const r = rng(4); for (let i = 0; i < info.dots; i++) { const p = P(-180 + r() * 360, -40 + r() * 70); circle(g, p[0], p[1], 6, alpha(S().ui.cream, 0.8 * k('dots', 0.1))); } }
      (info.arcs || []).forEach((a, i) => { const A = P(...(SPOTS[a.from] || a.from)), B = P(...(SPOTS[a.to] || a.to)); arcLine(g, A, B, k(a.cue || 'a' + (i + 1), 0.2 + i * 0.1), { color: a.color || S().ui.gold, lift: a.lift ?? 0.2 }); });
      (info.marks || []).forEach((m, i) => { const p = P(...(SPOTS[m.at] || m.at)); marker(g, p[0], p[1], t, { a: showAt(t, cue(info, m.cue || 'm' + (i + 1), 0.15 + i * 0.12), info.dur), label: m.label, color: m.color || S().ui.accent, side: m.side ?? 1 }); });
    });
    if (info.caption) T(g, info.caption.str, E.W / 2, E.H - V(60, 300), { size: V(40, 44), color: S().ui.gold, a: showAt(t, cue(info, info.caption.cue || 'caption', 0.4), info.dur) });
    if (info.tag) plate(g, info.tag, showAt(t, 0.3, info.dur)); source(g, info.source, showAt(t, 0.6, info.dur));
  } });

// ---------------------------------------------------------------- clocks, timers, calendars
tpl('doomsday', 'Doomsday Clock face, hands creep to near midnight; «85 СЕКУНД» readout at cue "sec". params: seconds (85), source', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.7 }); voidBg(g, t, cam); const ui = S().ui;
    layer(g, cam, 1, (g) => { const cx = E.W * V(0.36, 0.5), cy = E.H * V(0.5, 0.38), r = V(330, 300), sec = info.seconds ?? 85;
      glow(g, cx, cy, r * 1.7, ui.accent, 0.12); circle(g, cx, cy, r, '#efe8da'); ring(g, cx, cy, r, r * 0.05, '#1a1622');
      for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2 - Math.PI / 2, l = i % 5 ? 0.06 : 0.13; seg(g, [[cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9], [cx + Math.cos(a) * r * (0.9 - l), cy + Math.sin(a) * r * (0.9 - l)]], i % 5 ? 3 : 7, '#1a1622'); }
      g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r * 0.88, -Math.PI / 2 - 0.5, -Math.PI / 2); g.closePath(); g.fillStyle = alpha(ui.accent, 0.25); g.fill(); g.restore();
      const k = ease.out(prog(t, 0.2, info.dur * 0.6)), minA = -Math.PI / 2 - lerp(0.6, (sec / 3600) * Math.PI * 2, k);
      seg(g, [[cx, cy], [cx + Math.cos(minA) * r * 0.82, cy + Math.sin(minA) * r * 0.82]], 12, '#1a1622'); seg(g, [[cx, cy], [cx + Math.cos(-Math.PI / 2 - 0.01) * r * 0.55, cy + Math.sin(-Math.PI / 2 - 0.01) * r * 0.55]], 18, '#1a1622'); circle(g, cx, cy, 18, ui.accent);
      const a = showAt(t, cue(info, 'sec', 0.5), info.dur); bigNum(g, String(sec), E.W * V(0.73, 0.5), E.H * V(0.45, 0.76), { a, s: popAt(t, cue(info, 'sec', 0.5)), sub: 'СЕКУНД ДО ПОЛУНОЧИ', size: V(170, 140), color: ui.accent }); });
    source(g, info.source || 'Bulletin of the Atomic Scientists · январь 2026', showAt(t, 0.6, info.dur));
  } });
tpl('timer', 'Digital timer running from "from" to "to" (mm:ss) during the shot; optional slice "decide" (a red segment of the bar: «НА РЕШЕНИЕ ≈ 10 МИН») at cue "decide". params: from ("00:00"), to ("30:00"), label, decide {min, label}', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); voidBg(g, t, cam); const ui = S().ui;
    const s2 = (s) => { const [m, ss] = s.split(':').map(Number); return m * 60 + ss; }, A = s2(info.from || '00:00'), B = s2(info.to || '30:00');
    const k = ease.inOut(prog(t, cue(info, 'run', 0.05), cue(info, 'runEnd', 0.6))), v = lerp(A, B, k), mm = String(Math.floor(v / 60)).padStart(2, '0'), ss = String(Math.floor(v % 60)).padStart(2, '0');
    layer(g, cam, 1, (g) => { T(g, `${mm}:${ss}`, E.W / 2, E.H * 0.4, { size: V(220, 180), color: ui.gold, glow: 40, glowColor: alpha(ui.gold, 0.5), spacing: 10 });
      if (info.label) T(g, info.label, E.W / 2, E.H * 0.22, { size: V(36, 36), a: showAt(t, 0.2, info.dur) });
      const bx = E.W * 0.15, bw = E.W * 0.7, by = E.H * 0.66; rr(g, bx, by, bw, 34, 17); g.fillStyle = '#1a2036'; g.fill(); rr(g, bx, by, bw * (v / Math.max(B, 1)), 34, 17); g.fillStyle = ui.gold; g.fill();
      if (info.decide) { const dk = ease.out(prog(t, cue(info, 'decide', 0.65), cue(info, 'decide', 0.65) + 0.8)), dw = bw * (info.decide.min * 60 / Math.max(B, 1)) * dk;
        rr(g, bx + bw - dw, by - 10, dw, 54, 12); g.fillStyle = ui.accent; g.fill(); glow(g, bx + bw - dw / 2, by + 17, dw, ui.accent, 0.4 * dk);
        T(g, info.decide.label || 'НА РЕШЕНИЕ', bx + bw - dw / 2, by + 110, { size: V(36, 34), color: ui.accent, a: dk }); } });
  } });
tpl('calendar', 'Calendar sheet(s): days get crossed out one by one, one day circled red. params: month («СЕНТЯБРЬ 2001»), days 30, start weekday 0..6, cross [11,12,13,14], mark 17, or range {from:"31 ИЮЛЯ", to:"12 ДЕКАБРЯ"} (two-date flip card), single «5.02.2026»', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.6 }); voidBg(g, t, cam); const ui = S().ui;
    layer(g, cam, 1, (g) => {
      if (info.range || info.single) { const items = info.single ? [info.single] : [info.range.from, info.range.to];
        items.forEach((s, i) => { const a = popAt(t, cue(info, 'd' + (i + 1), 0.1 + i * 0.35)), x = E.W * (items.length === 1 ? 0.5 : V(0.3 + i * 0.4, 0.5)), y = E.H * (items.length === 1 ? 0.5 : V(0.5, 0.35 + i * 0.3)); if (a <= 0) return;
          g.save(); g.translate(x, y); g.scale(a, a); rr(g, -260, -150, 520, 300, 20); g.fillStyle = '#efe8da'; g.fill(); g.fillStyle = ui.accent; g.fillRect(-260, -150, 520, 60); T(g, s, 0, 30, { size: V(64, 56), color: '#1a1622', glow: 0, spacing: 2 }); g.restore(); });
        if (items.length === 2) { const k = ease.out(prog(t, cue(info, 'd2', 0.45), cue(info, 'd2', 0.45) + 0.6)); seg(g, [[E.W * 0.46, E.H * 0.5], [E.W * 0.46 + E.W * 0.08 * k, E.H * 0.5]], 6, ui.gold); }
        if (info.note) T(g, info.note, E.W / 2, E.H * 0.82, { size: V(40, 40), color: ui.gold, a: showAt(t, cue(info, 'note', 0.6), info.dur) });
        return; }
      const cw = V(150, 130), ch = V(100, 110), x0 = E.W / 2 - cw * 3.5, y0 = E.H * V(0.3, 0.32);
      T(g, info.month || 'МЕСЯЦ', E.W / 2, y0 - V(80, 90), { size: V(50, 50), color: ui.gold });
      const days = info.days ?? 30, st = info.start ?? 5, cross = info.cross || [], mark = info.mark;
      for (let d = 1; d <= days; d++) { const i = d - 1 + st, cx = x0 + (i % 7) * cw + cw / 2, cy = y0 + Math.floor(i / 7) * ch + ch / 2;
        rr(g, cx - cw * 0.45, cy - ch * 0.42, cw * 0.9, ch * 0.84, 10); g.fillStyle = 'rgba(232,226,210,.1)'; g.fill(); T(g, String(d), cx, cy, { size: V(40, 40), glow: 0 });
        const ci = cross.indexOf(d); if (ci >= 0) { const k = ease.out(prog(t, cue(info, 'cross', 0.2) + ci * 0.25, cue(info, 'cross', 0.2) + ci * 0.25 + 0.3)); seg(g, [[cx - 40, cy - 30], [cx - 40 + 80 * k, cy - 30 + 60 * k]], 7, ui.accent); seg(g, [[cx + 40, cy - 30], [cx + 40 - 80 * k, cy - 30 + 60 * k]], 7, ui.accent); }
        if (d === mark) { const k = ease.out(prog(t, cue(info, 'mark', 0.7), cue(info, 'mark', 0.7) + 0.5)); g.strokeStyle = ui.gold; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke(); } }
      if (info.note) T(g, info.note, E.W / 2, E.H * 0.9, { size: V(36, 36), color: ui.gold, a: showAt(t, cue(info, 'note', 0.6), info.dur) });
    });
  } });

// ---------------------------------------------------------------- charts
tpl('barsShot', 'Horizontal or vertical bars that grow at cues. params: rows [{label, v (0..1), str (value text), red, cue}], vertical (bool), title, source', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); voidBg(g, t, cam); const ui = S().ui, rows = info.rows || [];
    layer(g, cam, 1, (g) => { if (info.title) T(g, info.title, E.W / 2, E.H * 0.16, { size: V(44, 44), color: ui.gold, a: showAt(t, 0.1, info.dur) });
      rows.forEach((r, i) => { const k = ease.out(prog(t, cue(info, r.cue || 'b' + (i + 1), 0.15 + i * 0.25), cue(info, r.cue || 'b' + (i + 1), 0.15 + i * 0.25) + 0.9)), col = r.red ? ui.accent : ui.gold;
        if (info.vertical) { const n = rows.length, bw = V(180, 140), x = E.W / 2 + (i - (n - 1) / 2) * bw * 2, base = E.H * 0.78, h = E.H * 0.5 * r.v * k;
          rr(g, x - bw / 2, base - h, bw, Math.max(4, h), 10); g.fillStyle = col; g.fill(); T(g, r.label, x, base + V(40, 40), { size: V(28, 28) }); T(g, r.str || '', x, base - h - V(36, 36), { size: V(46, 46), color: col, a: k }); }
        else { const y = E.H * (0.36 + i * 0.18), x = E.W * 0.3, w = E.W * 0.5 * r.v * k; T(g, r.label, x - 30, y, { size: V(32, 30), align: 'right' }); rr(g, x, y - 26, Math.max(6, w), 52, 12); g.fillStyle = col; g.fill(); T(g, r.str || '', x + w + 24, y, { size: V(40, 38), color: col, align: 'left', a: k }); } }); });
    source(g, info.source, showAt(t, 0.6, info.dur));
  } });
tpl('thermo', 'Thermometer drops to a value (cue "drop"); optional pale comparison («ЛЕДНИКОВЫЙ ПЕРИОД ≈ −6 °C · ТЫСЯЧИ ЛЕТ») at cue "compare". params: to (−8), label («−8 °C»), compare {v:−6, label}, globe (blue globe at the left)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }), ui = S().ui, dc = cue(info, 'drop', 0.2), k = ease.inOut(prog(t, dc, dc + 1.6));
    if (info.globe) space(g, t, cam, { R: V(300, 280), cx: E.W * V(0.24, 0.5), cy: E.H * V(0.5, 0.3), cold: k, lights: 0.3, smoke: 0.3 * k }); else voidBg(g, t, cam);
    layer(g, cam, 1, (g) => { const x = E.W * V(0.56, 0.4), top = E.H * 0.16, h = E.H * 0.6, zeroY = top + h * 0.35, per = h * 0.055, v = lerp(0, info.to ?? -8, k), y = zeroY - v * per;
      rr(g, x - 40, top - 30, 80, h + 90, 40); g.fillStyle = '#e8e2d2'; g.fill(); rr(g, x - 14, top, 28, h, 14); g.fillStyle = '#3a3e52'; g.fill();
      rr(g, x - 14, y, 28, top + h - y, 14); g.fillStyle = mix(ui.accent, COL.cold, k); g.fill(); circle(g, x, top + h + 30, 44, mix(ui.accent, COL.cold, k));
      seg(g, [[x - 60, zeroY], [x + 60, zeroY]], 3, alpha('#1a1622', 0.8)); T(g, '0°', x - 90, zeroY, { size: V(30, 30), align: 'right' });
      bigNum(g, info.label || `${Math.round(v)} °C`, x + V(260, 200), y, { size: V(110, 90), color: COL.cold, a: showAt(t, dc + 0.3, info.dur) });
      if (info.compare) { const ca = showAt(t, cue(info, 'compare', 0.6), info.dur), cy = zeroY - info.compare.v * per; g.save(); g.globalAlpha *= ca * 0.7; g.setLineDash([10, 10]); seg(g, [[x - 70, cy], [x + 520, cy]], 3, alpha(ui.cream, 0.7)); g.setLineDash([]); g.restore();
        T(g, info.compare.label || 'ЛЕДНИКОВЫЙ ПЕРИОД', x + V(560, 420), cy - 30, { size: V(26, 26), a: ca * 0.8, align: 'left' }); } });
    source(g, info.source, showAt(t, 0.6, info.dur));
  } });
tpl('uvScale', 'UV index scale 0 → 11 «ЭКСТРЕМАЛЬНО» → needle runs past to 35 (cue "past"). params: max (35), source', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); voidBg(g, t, cam); const ui = S().ui, mx = info.max ?? 35;
    layer(g, cam, 1, (g) => { const x0 = E.W * 0.1, w = E.W * 0.8, y = E.H * 0.55, pc = cue(info, 'past', 0.5), v = lerp(0, 11, ease.out(prog(t, 0.1, pc))) + (mx - 11) * ease.inOut(prog(t, pc, pc + 1.5)), X = (u) => x0 + (u / 40) * w;
      const cols = ['#3fb950', '#f2c21a', '#ff9a3a', '#ff5a4a', '#c06aff']; [[0, 3], [3, 6], [6, 8], [8, 11], [11, 40]].forEach(([a, b], i) => { g.fillStyle = alpha(cols[i], i === 4 ? 0.35 : 0.85); g.fillRect(X(a), y - 30, X(b) - X(a), 60); });
      T(g, '11', X(11), y + 70, { size: V(36, 34) }); T(g, 'ЭКСТРЕМАЛЬНО', X(11), y - 80, { size: V(28, 26), color: '#ff8a7a' }); T(g, String(mx), X(mx), y + 70, { size: V(36, 34), color: ui.gold, a: showAt(t, pc + 0.8, info.dur) });
      const nx = X(v); poly3(g, [[nx, y - 50], [nx - 20, y - 90], [nx + 20, y - 90]], ui.cream); seg(g, [[nx, y - 50], [nx, y + 40]], 5, ui.cream); glow(g, nx, y, 80, ui.cream, 0.3);
      if (info.note) T(g, info.note, E.W / 2, E.H * 0.82, { size: V(40, 40), color: ui.gold, a: showAt(t, pc + 1, info.dur) }); });
    source(g, info.source, showAt(t, 0.6, info.dur));
  } });
function poly3(g, pts, c) { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
tpl('slider', 'A scale from «ЯДЕРНАЯ ОСЕНЬ» to «ЯДЕРНАЯ ЗИМА»; the knob slides back and forth (spectrum of answers). params: left, right, from (0..1), to (0..1)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); voidBg(g, t, cam); const ui = S().ui;
    layer(g, cam, 1, (g) => { const x0 = E.W * 0.16, w = E.W * 0.68, y = E.H * 0.52; g.fillStyle = linGrad(g, x0, 0, x0 + w, 0, ['#d8924a', '#9fc8ff']); rr(g, x0, y - 16, w, 32, 16); g.fill();
      const u = 0.5 + 0.42 * Math.sin(t * 1.1 - 1.2), kx = x0 + w * u; circle(g, kx, y, 34, ui.cream); glow(g, kx, y, 100, ui.cream, 0.3);
      T(g, info.left || 'ЯДЕРНАЯ ОСЕНЬ', x0, y - 80, { size: V(36, 30), color: '#ffc08a', align: 'left' }); T(g, info.right || 'ЯДЕРНАЯ ЗИМА', x0 + w, y - 80, { size: V(36, 30), color: '#bfe0ff', align: 'right' });
      T(g, info.leftSub || 'НЕСКОЛЬКО ГРАДУСОВ', x0, y + 70, { size: V(24, 22), align: 'left', a: 0.8 }); T(g, info.rightSub || '−8 °C ПО ПЛАНЕТЕ', x0 + w, y + 70, { size: V(24, 22), align: 'right', a: 0.8 }); });
  } });
tpl('curves', 'Recovery curves returning to normal (light / temperature / ozone) with year ticks. params: lines [{label, back (years), color}], years (15)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); voidBg(g, t, cam); const ui = S().ui, Y = info.years ?? 15;
    const lines = info.lines || [{ label: 'СВЕТ', back: 10, color: ui.gold }, { label: 'ТЕМПЕРАТУРА', back: 15, color: COL.cold }, { label: 'ОЗОН', back: 15, color: '#c08aff' }];
    layer(g, cam, 1, (g) => { const x0 = E.W * 0.12, w = E.W * 0.72, y0 = E.H * 0.2, h = E.H * 0.56, X = (yr) => x0 + (yr / Y) * w;
      seg(g, [[x0, y0], [x0, y0 + h], [x0 + w, y0 + h]], 3, alpha(ui.cream, 0.5)); g.setLineDash([8, 10]); seg(g, [[x0, y0 + h * 0.15], [x0 + w, y0 + h * 0.15]], 2, alpha(ui.cream, 0.4)); g.setLineDash([]);
      T(g, 'НОРМА', x0 + w + 20, y0 + h * 0.15, { size: V(24, 22), align: 'left' }); for (let yr = 0; yr <= Y; yr += 5) T(g, `${yr}`, X(yr), y0 + h + 40, { size: V(26, 24) }); T(g, 'ЛЕТ', x0 + w + 20, y0 + h + 40, { size: V(24, 22), align: 'left' });
      lines.forEach((l, i) => { const k = ease.inOut(prog(t, cue(info, 'c' + (i + 1), 0.1 + i * 0.25), cue(info, 'c' + (i + 1), 0.1 + i * 0.25) + 1.4)), pts = [];
        for (let s = 0; s <= 60 * k; s++) { const yr = (s / 60) * Y, d = clamp(1 - yr / l.back), v = 0.15 + 0.75 * d * d * (3 - 2 * d) * (yr < 0.5 ? yr * 2 : 1); pts.push([X(yr), y0 + v * h]); }
        if (pts.length > 1) { seg(g, pts, 6, l.color || ui.gold); const e = pts[pts.length - 1]; circle(g, e[0], e[1], 9, l.color || ui.gold); T(g, l.label, e[0] + 18, e[1] - 26 - i * 4, { size: V(26, 24), color: l.color || ui.gold, align: 'left' }); } }); });
  } });
tpl('quote', 'Serif quote on a dark background, words fade in phrase by phrase; author/years line. params: str, by («1985 / 2022»), split ("|" separates phrases; cues q1,q2…)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1, amt: 0.5 }); voidBg(g, t, cam, { grid: false }); const ui = S().ui, parts = (info.str || '«…»').split('|');
    layer(g, cam, 1, (g) => { parts.forEach((p, i) => T(g, p.trim(), E.W / 2, E.H * (0.5 - (parts.length - 1) * 0.07 + i * 0.14), { size: V(66, 56), serif: true, italic: true, color: ui.cream, spacing: 1, a: showAt(t, cue(info, 'q' + (i + 1), 0.08 + i * 0.3), info.dur, 0.8), glowColor: alpha(ui.gold, 0.25), glow: 20 }));
      if (info.by) T(g, info.by, E.W / 2, E.H * 0.82, { size: V(32, 32), color: ui.gold, a: showAt(t, cue(info, 'by', 0.6), info.dur) }); });
  } });
tpl('priceTag', 'Insert of a tiny microchip on a circuit board with a price tag «46 ¢» swinging in (cue "price"). params: price («46 ¢»), sub («ДЕТАЛЬ»)', {
  draw(g, t, info) {
    const cam = camOf(info, t, { move: 'push', z: 1 }), ui = S().ui;
    layer(g, cam, 0.5, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0c2a1e', '#04120c']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); for (let i = 0; i < 30; i++) { const y = (i * 53) % E.H; seg(g, [[-E.W, y], [E.W * 0.3 + (i * 97) % 600, y], [E.W * 0.4 + (i * 97) % 600, y + 60], [E.W * 2, y + 60]], 3, alpha('#c9a85a', 0.35)); } });
    layer(g, cam, 1, (g) => { const cx = E.W * 0.42, cy = E.H * 0.52; rr(g, cx - 130, cy - 130, 260, 260, 16); g.fillStyle = '#121418'; g.fill(); g.strokeStyle = alpha('#e8f0ff', 0.4); g.lineWidth = 3; g.stroke();
      for (let i = 0; i < 8; i++) for (const s of [-1, 1]) { seg(g, [[cx - 105 + i * 30, cy + s * 130], [cx - 105 + i * 30, cy + s * 170]], 10, '#b8b8c0'); seg(g, [[cx + s * 130, cy - 105 + i * 30], [cx + s * 170, cy - 105 + i * 30]], 10, '#b8b8c0'); }
      glow(g, cx, cy, 300, '#9fd8ff', 0.12 + 0.08 * Math.sin(t * 3));
      const pc = cue(info, 'price', 0.35), k = popAt(t, pc, 0.6), sw = Math.sin((t - pc) * 4) * 0.12 * Math.exp(-(t - pc) * 1.5); if (k > 0) { g.save(); g.translate(cx + 330, cy - 160); g.rotate(-0.15 + sw); g.scale(k, k);
        seg(g, [[-140, -30], [-60, 0]], 3, ui.cream); rr(g, -60, -70, 330, 150, 18); g.fillStyle = '#efe8da'; g.fill(); circle(g, -30, 0, 12, '#1a1622'); T(g, info.price || '46 ¢', 115, 4, { size: 96, color: '#1a1622', glow: 0, spacing: 2 }); g.restore(); }
      if (info.sub) T(g, info.sub, cx, cy + 260, { size: V(32, 32), a: showAt(t, pc + 0.4, info.dur) }); });
  } });
