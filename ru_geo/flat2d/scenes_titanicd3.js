// Вариант 3: «рисованный взрослый»: тёмные нарисованные сцены, силуэты вместо героев, фото в рамке, штамп времени.
import { W, H, g, ease, SCENES, drawChar, polaroid, CREDITS } from './engine.js';
import './scenes_titanic.js';
import { MONO, plate } from './doc_common.js';
export const sil = (o) => ({ ...o, custom: (a) => { g.save(); g.filter = 'brightness(0.05) contrast(1.2)'; drawChar(a); g.filter = 'none'; g.restore(); } });
export const stamp = (time, label, at = 0.2) => (st) => { const k = ease((st.pt - at) / 0.4); if (k <= 0) return; g.save(); g.globalAlpha = k; plate(70, 70, 560, 150); g.fillStyle = '#9AA3AD'; g.font = `700 22px ${MONO}`; g.fillText('14 АПРЕЛЯ 1912', 104, 112); g.fillStyle = '#F4F6F8'; g.font = `700 64px ${MONO}`; g.fillText(time, 104, 176); g.fillStyle = '#9AA3AD'; g.font = `500 20px ${MONO}`; g.fillText(label, 104, 206); g.restore(); };
export const frame = (key, x, y, w, rot, at, note) => (st) => { const k = ease((st.pt - at) / 0.5); if (k <= 0) return; g.save(); g.globalAlpha = k; polaroid(key, x, y, w, rot, note); g.restore(); };
