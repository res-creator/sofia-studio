// Вариант 2: «архив»: фото на весь кадр в чёрно-белом, нижняя плашка с временем, тонкие линии.
import { W, H, g, clamp, ease, SCENES } from './engine.js';
import { MONO, win, photoCover, credit, vignette } from './doc_common.js';
const PH = [[0.5, 9.4, 'wireless'], [10.3, 19.6, 'cal'], [19.6, 25.3, 'wireless'], [25.5, 29.3, 'iceberg'], [29.3, 32.6, 'iceberg2']];
const STAMPS = [[0.7, 3.9, '14 АПРЕЛЯ 1912', 'ЛЕДОВЫЕ ПРЕДУПРЕЖДЕНИЯ'], [3.9, 9.3, '14 АПРЕЛЯ 1912', 'ХОД НЕ СНИЖАЮТ'], [10.5, 14.8, 'СЕВЕРНАЯ АТЛАНТИКА', '«КАЛИФОРНИАН» РЯДОМ'], [13.4, 25.0, '≈ 23:30', 'РАДИСТ ВЫКЛЮЧАЕТ АППАРАТ'], [25.7, 29.0, '23:40', 'АЙСБЕРГ ПЕРЕД НОСОМ'], [28.0, 32.4, '< 1 МИНУТЫ', 'СКОЛЬЗЯЩИЙ УДАР']];
SCENES.docv2 = {
  bg(st) {
    const t = st.t; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#05080c'; g.fillRect(0, 0, W, H);
    for (const [a, b, key] of PH) { const al = win(t, a, b, 0.6); if (al <= 0) continue; g.globalAlpha = al; photoCover(key, 0, 0, W, H, clamp((t - a) / (b - a)), { z0: 1.0, z1: 1.22, px: -120, py: 30, filter: 'grayscale(1) contrast(1.15) brightness(.78)' }); g.globalAlpha = 1; }
    const gr = g.createLinearGradient(0, 520, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(2,4,8,.88)'); g.fillStyle = gr; g.fillRect(0, 520, W, H - 520); vignette(0.5);
    // верхняя строка: место и источник
    g.fillStyle = 'rgba(244,246,248,.85)'; g.font = `700 22px ${MONO}`; g.fillText('14.04.1912', 70, 70); g.fillStyle = '#E4572E'; g.fillRect(70, 84, 120, 3);
    for (const [a, b, key] of PH) { const al = win(t, a, b, 0.5); if (al > 0) { g.globalAlpha = al * 0.8; g.fillStyle = '#C9D0D8'; g.font = `500 18px ${MONO}`; g.textAlign = 'right'; g.fillText(credit(key), W - 70, 70); g.textAlign = 'left'; g.globalAlpha = 1; } }
    // нижние надписи
    let slot = 0; for (const [a, b, big, small] of STAMPS) { const al = win(t, a, b, 0.4); if (al <= 0) continue; const k = ease((t - a) / 0.5); g.save(); g.globalAlpha = al; const yb = 760 - slot * 0; g.translate(0, (1 - k) * 18);
      if (big) { g.font = `900 ${big.length > 8 ? 54 : 118}px Nunito`; g.fillStyle = '#F4F6F8'; g.fillText(big, 90, 740 - (big.length > 8 ? 0 : 0)); }
      g.font = `800 40px Nunito`; g.fillStyle = '#E4572E'; g.fillText(small, 94, big ? (big.length > 8 ? 800 : 800) : 740); g.restore(); }
    g.restore();
  },
};
