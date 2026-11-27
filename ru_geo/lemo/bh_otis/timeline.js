// «Мысленный эксперимент» — skyscrapers & elevators: the Otis print on the light table.
// Clip time = film time − 149.04. Silent clip; every key action follows the Russian narration below.
export const DUR = 15.16;
export const FILM_T0 = 149.04;
const c = t => +(t - FILM_T0).toFixed(3);
export const HIT = {
  lightOn: 0.67,          // tubes steady after two flickers (first flicker 0.17)
  drop: 1.95,             // loupe lands on the print            «В тысяча восемьсот пятьдесят четвёртом» 150.87
  read1854: 3.0,          // reading 1854 lifts out of the lens
  ny: 4.75,               // label «Нью-Йорк, выставка, 1854»      «году на выставке в Нью-Йорке» 153.63
  push: c(156.10),        // 7.06 push into the lens onto Otis    «Отис велел перерубить канат под»
  pushEnd: 8.4,
  otis: 7.9,              // label «Элиша Отис»
  rope: 8.9,              // mark «канат»
  catchGo: c(159.59),     // 10.55 glide to the safety catch      «и она не упала: сработала защёлка.»
  ring: 10.6,             // ring around the catch
  latch: 10.95,           // label «защёлка»
  rise: c(162.06),        // 13.02 rise out                        «После этого лифтам начали доверять.»
  lift: 13.85,            // loupe lifts
  caption: 14.05,         // «Позднейший рисунок · общественное достояние»
};
// sound-effect events (clip seconds)
export const EVENTS = [
  { t: 0.17, k: 'light' }, { t: HIT.drop, k: 'loupe' }, { t: HIT.read1854, k: 'label' }, { t: HIT.ny, k: 'label' },
  { t: HIT.otis, k: 'label' }, { t: HIT.rope, k: 'label' }, { t: HIT.ring, k: 'ring' }, { t: HIT.latch, k: 'label' },
  { t: HIT.lift, k: 'loupe' }, { t: HIT.caption, k: 'label' },
];
