// «Бумажный» стиль: вырезанные герои с белым контуром на архивных фото в сепии, жёлтые бирки-подписи.
import { g, INK, ease, R, CARD_BG } from './engine.js';

const hero = (o = {}) => ({ who: 'shon', x: 1470, y: 945, s: 1.55, emo: 'flat', pose: { L: 'hang', R: 'hang' }, ...o });
// жёлтая бирка: появляется на секунде at (от начала абзаца)
const tags = (...list) => (st) => {
  list.forEach(([text, x, y, at, size = 64, rot = -0.03]) => {
    const k = ease((st.pt - at) / 0.3); if (k <= 0) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k); g.globalAlpha = Math.min(1, k * 1.4);
    g.font = `900 ${size}px Nunito`; const w = g.measureText(text).width + 54, h = size + 44;
    g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 18; g.shadowOffsetY = 8; R(-w / 2, -h / 2, w, h, '#ffd24a', 12, 5); g.shadowColor = 'transparent';
    g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 4); g.restore();
  });
};
const ph = (src, extra = {}) => ({ scene: 'photo', sp: { src, tone: 'sepia', dim: 0.16, ...(extra.sp || {}) }, sticker: true, cams: extra.cams || [[960, 540, 1.0, 1.1]], actors: extra.actors || [], hud: extra.hud, to: extra.to });

export const SB = [
  { m: 'Два часа сорок минут.', seq: [{ ...ph('leave', { hud: tags(['2 ч 40 мин', 960, 300, 0.2, 110, -0.02], ['после удара о лёд', 960, 470, 3.2, 56, 0.02]) }), to: 99 }] },
  { m: 'Один пассажир третьего класса', seq: [
    { ...ph('senate', { hud: tags(['Сенат США, 1912', 960, 250, 0.3, 64]) }), to: 5.6 },
    { ...ph('cabin', { actors: [hero({ emo: 'surprised', x: 1500 })], hud: tags(['скрежет', 560, 260, 0.1, 80, -0.04], ['вода под дверью', 560, 400, 3.2, 60, 0.03]) }), to: 99 }] },
  { m: 'Тебя зовут Шон', seq: [
    { ...ph('leave2', { actors: [hero({ emo: 'grin', x: 1450 })], hud: tags(['Шон, 21 год', 560, 260, 0.2, 80, -0.03], ['Ирландия', 560, 400, 3.6, 58, 0.02]) }), to: 5.2 },
    { ...ph('promen', { hud: tags(['1 из 7', 960, 330, 0.3, 150, -0.02], ['шансы мужчины в 3 классе', 960, 520, 1.2, 54, 0.02]) }), to: 9.6 },
    { ...ph('boatdeck', { actors: [hero({ emo: 'worry', x: 1480 })], hud: tags(['почему так мало?', 560, 300, 0.4, 70, -0.03]) }), to: 99 }] },
  { m: 'Ты придуман.', seq: [
    { ...ph('tender', { cams: [[960, 540, 1.0, 1.03]], sp: { dim: 0.0 }, actors: [hero({ emo: 'smug', x: 1500 })], hud: tags(['ты придуман', 560, 280, 0.2, 90, -0.03]) }), to: 3.4 },
    { ...ph('boatD', { hud: tags(['корабль настоящий', 960, 300, 0.3, 70, -0.02], ['цифры настоящие', 960, 450, 1.6, 70, 0.02]) }), to: 99 }] },
  { m: 'Около полудня маленький катер', seq: [
    { ...ph('tender', { cams: [[960, 540, 1.0, 1.03]], sp: { dim: 0.0 }, actors: [hero({ emo: 'flat', x: 1480, item: 'case' })], hud: tags(['11 апреля 1912', 560, 260, 0.3, 74, -0.03], ['Квинстаун', 560, 400, 2.6, 66, 0.02], ['адрес брата в Бостоне', 560, 540, 6.6, 54, -0.02]) }), to: 9.5 },
    { ...ph('leave2', { actors: [hero({ emo: 'sad', x: 1480, looks: [[0, 0.9]] })], hud: tags(['последний кусок Ирландии', 560, 300, 1.4, 60, -0.03]) }), to: 99 }] },
];
export const CARDS = { 'ХОЛОДНЫЙ СТАРТ': 'leave', 'ОДИННАДЦАТОГО АПРЕЛЯ': 'leave2' };
Object.assign(CARD_BG, CARDS);
