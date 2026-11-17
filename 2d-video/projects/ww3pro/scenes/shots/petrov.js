// Пилот: холодный старт «Петров, 1983» в детальном стиле с диалогами.
import { E, registerShot } from '/engine/core.js';
import { fig, SK, say, typeCard, cam, vignette, W, handset, teaGlass, pen, glow, ln, el, bx, htxt, clamp, ease, lerp, fo } from '../lib/pro.js';
import { room, lamps, desk, chair, alarmWash, night, snow, crtBig, calendarBig, radar, phoneClose, space, satellite } from '../lib/bunker.js';

const PET = { hair: 'side', hairC: '#3a2a20', stubble: true, brow: 8, seed: 1, coat: '#5f6b4f' };
const KOL = { hair: 'curly', hairC: '#2a2320', skin: SK.b, seed: 3, coat: '#68755a', brow: 6 };
const ALL = -20;
// кисть сверху (вид на тыльную сторону): ладонь + 4 пальца + большой
function hand(g, x, y) { g.save(); g.translate(x, y); g.rotate(0.35); [-48, -16, 16, 46].forEach((d, i) => { g.beginPath(); g.ellipse(d, 70 + (i === 1 || i === 2 ? 14 : 0), 17, 44, 0.06 * (i - 1.5), 0, Math.PI * 2); fo(g, SK.a, 6); }); g.beginPath(); g.ellipse(-82, 10, 18, 40, -0.9, 0, Math.PI * 2); fo(g, SK.a, 6); g.beginPath(); g.ellipse(0, 0, 76, 70, 0, 0, Math.PI * 2); fo(g, SK.a, 6); g.save(); g.globalAlpha = 0.25; [-40, -12, 18].forEach((d) => ln(g, [[d, 30], [d + 6, 50]], 3, '#8a5a3a')); g.restore(); g.restore(); } // тревога «уже идёт»

// общий план зала: p — Петров, k — коллега, o — тревога/телефон
function hall(g, t, o = {}) {
  room(g, t, { alarm: o.alarm });
  chair(g, 820, 990);
  fig(g, 820, 1020, 0.95, { ...PET, seated: true, noShadow: true, ...(o.p || {}) }, t);
  if (o.k !== false) fig(g, 1180, 935, 0.92, { ...KOL, ...(o.k || {}) }, t);
  desk(g, t, { alarm: o.alarm, noTea: o.noTea, lifted: o.lifted });
  lamps(g, t);
}
const PH = (o) => ({ k: { pose: 'hover' }, ...o });
const S = {
  p01(g, t, info) { cam(g, t, [[0, 960, 560, 1.0], [info.dur, 960, 720, 1.55]], (g) => night(g, t)); snow(g, t); vignette(g, 0.5); },
  p02(g, t, info) { cam(g, t, [[0, 960, 600, 1.12], [info.dur, 930, 610, 1.2]], (g) => hall(g, t, { p: { pose: 'write', holdR: pen, lookY: 1, look: 0.3, expr: 'focus' }, k: { pose: 'tea', holdR: teaGlass, expr: 'smile', look: -0.6 }, noTea: true })); vignette(g); },
  p03(g, t, info) { cam(g, t, [[0, 960, 330, 2.5], [info.dur, 960, 320, 2.75]], (g) => hall(g, t, { alarm: 0.05 }), 4); alarmWash(g, t, 0.05); vignette(g, 0.5); },
  p04(g, t, info) { cam(g, t, [[0, 1000, 640, 1.55], [info.dur, 990, 630, 1.65]], (g) => hall(g, t, { alarm: ALL, p: { expr: 'shock', lookY: -1, look: 0.4, pose: 'desk' }, k: { expr: 'shock', pose: 'shrug', holdR: null, look: -0.8, talk: t > 0.2 && t < 1.4 } })); alarmWash(g, t, ALL); say(g, 'Товарищ подполковник!', 1330, 200, t, 0.2, { tx: 1290 }); vignette(g, 0.45); },
  p05(g, t, info) { cam(g, t, [[0, 960, 560, 1.0], [info.dur, 960, 540, 1.12]], (g) => calendarBig(g, t)); alarmWash(g, t, ALL); vignette(g, 0.5); },
  p06(g, t, info) { const n = [0, W(info, 'раз', 0.62), W(info, 'ещё', 1.66, 1.0)]; cam(g, t, [[0, 960, 500, 1.0], [info.dur, 960, 500, 1.1]], (g) => crtBig(g, t, n), 2); vignette(g, 0.55); },
  p07(g, t, info) { const a = W(info, 'пять', 1.1); cam(g, t, [[0, 960, 540, 1.0], [info.dur, 1000, 520, 1.12]], (g) => radar(g, t, [0, 1, 2, 3, 4].map((i) => a + i * 0.3), info)); vignette(g, 0.5); },
  p08(g, t, info) { cam(g, t, [[0, 1000, 620, 1.5], [info.dur, 1010, 610, 1.58]], (g) => hall(g, t, { alarm: ALL, p: { expr: 'worried', sweat: true, pose: 'desk', look: 0.6 }, k: { expr: 'worried', pose: 'point', look: -1, talk: t > 0.15 && t < 1.3, turn: -0.4 } })); alarmWash(g, t, ALL); say(g, 'Что делать?!', 1300, 210, t, 0.15, { tx: 1250 }); vignette(g, 0.45); },
  p09(g, t, info) { const lk = Math.sin(t * 2.4) > 0 ? 0.8 : -0.6; cam(g, t, [[0, 820, 610, 2.35], [info.dur, 820, 600, 2.6]], (g) => hall(g, t, { alarm: ALL, p: { expr: 'worried', sweat: true, pose: 'desk', look: lk }, k: false })); alarmWash(g, t, ALL); say(g, 'подполковник Станислав Петров', 960, 990, t, 0.3, { tick: false, size: 54, col: '#ffd04a', cps: 30 }); vignette(g, 0.55); },
  p10(g, t, info) { cam(g, t, [[0, 1180, 560, 2.2], [info.dur, 1170, 555, 2.35]], (g) => hall(g, t, { alarm: ALL, p: { expr: 'worried', pose: 'desk' }, k: { expr: 'angry', pose: 'point', look: -1, turn: -0.5, talk: t > 0.2 && t < 1.6 } })); alarmWash(g, t, ALL); say(g, 'Надо докладывать наверх!', 900, 190, t, 0.2, { tx: 1040 }); vignette(g, 0.55); },
  p11(g, t, info) { cam(g, t, [[0, 960, 560, 1.0], [info.dur, 960, 600, 1.15]], (g) => { phoneClose(g, t); const hx = 900 + Math.sin(t * 38) * 4 + ease.inOut(clamp(t / 1.2)) * 60, hy = 330 + Math.sin(t * 31) * 3 + ease.inOut(clamp(t / 1.2)) * 60; ln(g, [[-200, -260], [hx - 40, hy - 90]], 170, '#1c1c1a'); ln(g, [[-200, -260], [hx - 40, hy - 90]], 146, PET.coat); bx(g, hx - 120, hy - 150, 120, 110, '#e3dcc2', 30, 7); hand(g, hx, hy); }, 2); alarmWash(g, t, ALL); vignette(g, 0.55); },
  p12(g, t, info) { typeCard(g, [{ t: 'Он решает:', at: 0.15, y: 470 }, { t: 'это ошибка.', at: W(info, 'это', 0.9), y: 590, col: '#ffd04a' }], t); },
  p13(g, t, info) { const a = W(info, 'ложное', 1.05); cam(g, t, [[0, 860, 610, 1.85], [info.dur, 850, 600, 1.95]], (g) => hall(g, t, { alarm: ALL, lifted: true, p: { pose: 'phone', holdR: handset, expr: 'focus', look: 0.9, talk: t > a && t < a + 1.6 }, k: { expr: 'shock', pose: 'idle', look: -1 } })); alarmWash(g, t, ALL); say(g, 'Ложное срабатывание.', 780, 230, t, a, { tx: 760, cps: 16 }); vignette(g, 0.5); },
  p14(g, t, info) { cam(g, t, [[0, 1180, 560, 2.3], [info.dur, 1180, 560, 2.4]], (g) => hall(g, t, { alarm: ALL, lifted: true, p: { pose: 'phone', holdR: handset }, k: { expr: 'worried', pose: 'idle', look: -1, turn: -0.4, talk: t > 0.05 && t < 0.7 } })); alarmWash(g, t, ALL); say(g, 'А если нет?..', 1180, 200, t, 0.05, { tx: 1150, cps: 24 }); vignette(g, 0.55); },
  p15(g, t, info) { cam(g, t, [[0, 960, 600, 1.12], [info.dur, 960, 610, 1.18]], (g) => hall(g, t, { p: { pose: 'back', expr: t > 0.5 ? 'smile' : 'tired', look: 0.2, lookY: -0.5 }, k: { expr: 'smile', pose: 'hips', look: -0.8 } })); vignette(g, 0.4); },
  p16(g, t, info) { cam(g, t, [[0, 960, 540, 1.0], [info.dur, 900, 560, 1.1]], (g) => { space(g, t); const k = clamp((t - 0.8) / 1.0); if (k > 0) { g.save(); g.setLineDash([20, 14]); ln(g, [[1780, 120], [lerp(1780, 1150, k), lerp(120, 820, k)]], 6, 'rgba(255,230,140,.9)'); if (k >= 1) { const k2 = clamp((t - 1.8) / 0.8); ln(g, [[1150, 820], [lerp(1150, 600, k2), lerp(820, 330, k2)]], 6, 'rgba(255,230,140,.9)'); } g.restore(); glow(g, 1150, 820, 140 * k, '255,240,180', 0.8); } satellite(g, 560, 300, 0.7, t); if (t > 2.6) glow(g, 600, 330, 160, '255,240,180', 0.7 * clamp((t - 2.6) * 2)); }); say(g, 'блик солнца на облаках', 1250, 560, t, 1.3, { tick: false, size: 60, col: '#ffd04a', cps: 26 }); vignette(g, 0.35); },
};
for (const s of E.shots || []) if (S[s.id]) registerShot(s.id, { draw: S[s.id] });
