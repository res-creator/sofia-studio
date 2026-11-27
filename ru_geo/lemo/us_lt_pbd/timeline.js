// «Мысленный эксперимент» — «Размер Вселенной»: the Pale Blue Dot print on the light table.
// Clip time = film time − 89.10 (clip 0 = film 89.10, end = film 105.60). Silent clip; every key action follows the
// Russian narration (film.json captions, film seconds):
//   89.08 «Четырнадцатого февраля тысяча» 91.21 «девятьсот девяностого года Вояджер,» 93.78 «уже в шести миллиардах
//   километров от» 96.43 «Солнца, развернул камеры и» 98.34 «сфотографировал Землю.» 99.95 «На снимке она заняла
//   меньше одного» 102.20 «пикселя: бледно-голубая точка в луче света.» (ends 105.04)
export const DUR = 16.5;
export const FILM_T0 = 89.10;
const c = t => +(t - FILM_T0).toFixed(3);
export const HIT = {
  lightOn: 0.67,          // tubes steady after two flickers (first flicker 0.17)
  date: 0.6,              // tag «14 февраля» on the print            «Четырнадцатого февраля» 89.08
  yearGo: 1.5, year: 3.7, // year rolls to 1990                       «тысяча девятьсот девяностого года» → 92.8
  drop: 1.9,              // loupe lands on the light band
  voy: c(93.2),           // 4.10 «Вояджер»
  dist: 5.0, distLand: 6.1, // 6 млрд км                              «уже в шести миллиардах километров» 93.78–95.3
  sun: c(96.5),           // 7.40 «от Солнца»                         96.43
  push: 8.0,              // push into the lens                        «развернул камеры и» 96.43–98.34
  pushEnd: 9.4,
  find: 9.6, found: 10.3, // inside the lens: glide down the band onto the dot
  ring: c(99.25),         // 10.15 ring on the dot                     «сфотографировал Землю.» 98.34–99.95
  earth: c(99.5),         // 10.40 «Земля»
  pixel: c(101.4),        // 12.30 «меньше одного пикселя»             «меньше одного пикселя» 100.9–102.6
  rise: c(103.7),         // 14.60 rise out                            «бледно-голубая точка в луче света» 102.6–105.04
  lift: c(104.4),         // 15.30 loupe lifts
  tableRing: 15.45, tableEarth: 15.55, band: 15.7,  // the whole print: ring on the dot, «луч света» on the band
};
// sound-effect events (clip seconds)
export const EVENTS = [
  { t: 0.17, k: 'light' }, { t: HIT.date, k: 'label' }, { t: HIT.drop, k: 'loupe' }, { t: HIT.year, k: 'label' },
  { t: HIT.voy, k: 'label' }, { t: HIT.dist, k: 'label' }, { t: HIT.sun, k: 'label' }, { t: HIT.ring, k: 'ring' },
  { t: HIT.earth, k: 'label' }, { t: HIT.pixel, k: 'label' }, { t: HIT.lift, k: 'loupe' }, { t: HIT.tableRing, k: 'ring' },
  { t: HIT.band, k: 'label' },
];
