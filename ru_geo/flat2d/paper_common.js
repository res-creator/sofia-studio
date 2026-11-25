// Общее для «бумажных» роликов: жёлтые бирки и герой-наклейка. Подключается из sb_<slug>.js (его создаёт tools/auto_paper.py).
import { g, INK, ease, R, EMBLEMS } from './engine.js';
EMBLEMS.default = () => {};
export const hero = (o = {}) => ({ who: 'boy', x: 1480, y: 945, s: 1.45, emo: 'flat', pose: { L: 'hang', R: 'hang' }, ...o });
export const tags = (...list) => (st) => {
  list.forEach(([text, x, y, at, size = 62, rot = -0.03]) => {
    const k = ease((st.pt - at) / 0.3); if (k <= 0) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k); g.globalAlpha = Math.min(1, k * 1.4);
    g.font = `900 ${size}px Nunito`; const w = g.measureText(text).width + 54, h = size + 44;
    g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 18; g.shadowOffsetY = 8; R(-w / 2, -h / 2, w, h, '#ffd24a', 12, 5); g.shadowColor = 'transparent';
    g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 4); g.restore();
  });
};
