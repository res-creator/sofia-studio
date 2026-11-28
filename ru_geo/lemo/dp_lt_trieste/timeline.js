// «Мысленный эксперимент» — «Опасные места»: the first descents — Piccard and Walsh in the «Trieste» sphere (1960), the bathyscaphe
// on the surface, and a card for James Cameron's solo dive (2012; no licensed photo, so no picture of him).
// Clip time = film time − 335.43 (clip 0 = film 335.43, end = film 353.56). Silent clip; key actions follow the narration
// (film.json captions, film seconds → clip seconds):
//   335.43 «Первыми на дно спустились Жак Пикар и» 0.00 · 337.97 «Дон Уолш на батискафе «Триест» в» 2.54
//   340.17 «тысяча девятьсот шестидесятом.» 4.74 · 342.23 «Спустя полвека одиночный спуск» 6.80
//   344.44 «совершил кинорежиссёр Джеймс Кэмерон.» 9.01 · 347.17 «Оба раза людей берегла тяжёлая» 11.74
//   349.48 «стальная оболочка,» 14.05 · 350.86 «которая держит давление вместо них.» 15.43 (ends 353.56 = 18.13)
export const DUR = 18.13;
export const FILM_T0 = 335.43;
export const HIT = {
  lightOn: 0.67,
  first: 0.3,                                  // card «первыми на дно спустились»
  drop1: 0.75, push1: 1.0, push1End: 1.75,     // loupe onto the two men in the sphere; push in
  men: 1.35,                                    // «Пикар и Уолш» (the source caption does not say who is who)
  rise1: 2.95, lift1: 3.3,
  drop2: 3.95, push2: 4.15, push2End: 4.85,    // glide to the surface photo; loupe onto the «TRIESTE» sign; push in
  sign: 4.75, signLbl: 4.9,                    // the sign lights · «батискаф «Триест»»
  y60: 5.0, y60Land: 6.2,                      // 1960 counts up, lands with «шестидесятом»
  rise2: 6.75, lift2: 7.15,
  half: 7.0, jc: 9.05, solo: 9.55, jcOut: 11.75, // card «спустя полвека» · «Джеймс Кэмерон, 2012:» · «одиночный спуск»
  both: 11.85, heavy: 13.3,                    // «оба раза людей берегла» · «тяжёлая стальная оболочка»
  drop3: 12.45, push3: 12.7, push3End: 13.5,   // back to the sphere photo; loupe onto the sphere wall; push in
  arc: 13.6, sph: 14.2,                        // the wall is traced · «стальная сфера»
  press: 15.45,                                // «держит давление вместо них»
  rise3: 16.3, lift3: 16.75,
  back: 17.55,                                 // pulled back to the whole table; the last card stays
};
export const EVENTS = [
  { t: 0.17, k: 'light' }, { t: HIT.first, k: 'label' },
  { t: HIT.drop1, k: 'loupe' }, { t: HIT.men, k: 'ring' }, { t: HIT.men + 0.3, k: 'label' }, { t: HIT.lift1, k: 'loupe' },
  { t: HIT.drop2, k: 'loupe' }, { t: HIT.sign, k: 'ring' }, { t: HIT.signLbl, k: 'label' }, { t: HIT.y60Land, k: 'label' },
  { t: HIT.lift2, k: 'loupe' },
  { t: HIT.half, k: 'label' }, { t: HIT.jc, k: 'label' }, { t: HIT.solo, k: 'label' },
  { t: HIT.both, k: 'label' }, { t: HIT.drop3, k: 'loupe' }, { t: HIT.heavy, k: 'label' }, { t: HIT.arc, k: 'ring' },
  { t: HIT.sph, k: 'label' }, { t: HIT.press, k: 'label' }, { t: HIT.lift3, k: 'loupe' },
];
